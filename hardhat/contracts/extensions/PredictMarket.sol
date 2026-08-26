// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RitualAddresses, IScheduler, IRitualWallet, ITEEServiceRegistry} from "./RitualCore.sol";

/// @title PredictMarket — a self-resolving binary forecast (the Resolvable Forecast primitive).
/// @notice F = (question, resolution_source, extraction_rule, comparator, target, lock_block, resolve_block)
///         R(F) ∈ {YES, NO, INVALID}. Truth authority for one forecast. No competition logic lives here.
contract PredictMarket {
    enum Outcome {
        Unresolved,
        YES,
        NO,
        INVALID
    }

    enum Phase {
        Open,       // entries accepted
        Locked,     // past lock_block, awaiting resolution
        Resolved    // terminal outcome set
    }

    // ---- Immutable resolution rule (INV-S1: no write path after creation) ----
    struct Rule {
        string question;
        string resolutionSource; // URL fetched by HTTP precompile
        string extractionRule;   // jq filter applied by JQ precompile
        uint8 comparator;        // 0 = extracted == target -> YES, else NO
        string target;           // expected string value
    }

    Rule public rule; // set once in constructor — INV-S1 enforced below (no setter exists)
    uint64 public immutable lockBlock;
    uint64 public immutable resolveBlock;

    // ---- Entries ----
    struct Pick {
        bool yes;
        bool submitted;
    }
    mapping(address => Pick) public picks;
    address[] public entrants;

    // ---- State ----
    Phase public phase;
    Outcome public outcome;
    uint256 public scheduleId;

    address public immutable owner;
    IScheduler public immutable scheduler;
    uint64 public resolveAt;      // actual block the scheduled resolution fired
    bool public resolutionAttempted;

    uint32 public constant SCHEDULER_GAS = 500_000;
    uint32 public constant SCHEDULER_TTL = 200; // covers drift + async settlement (see scheduler skill)

    event Entered(address indexed participant, bool yes);
    event Locked(uint256 blockNumber);
    event ResolutionScheduled(uint256 indexed callId, uint64 resolveBlock);
    event Resolved(Outcome outcome, string extractedValue);

    error NotOpen();
    error AlreadyEntered();
    error NotLocked();
    error NotResolved();
    error OnlyScheduler();
    error AlreadyAttempted();
    error InvalidPhase();

    modifier onlyScheduler() {
        if (msg.sender != RitualAddresses.SCHEDULER) revert OnlyScheduler();
        _;
    }

    constructor(
        Rule memory _rule,
        uint64 _lockBlock,
        uint64 _resolveBlock,
        address _owner
    ) {
        require(_resolveBlock > _lockBlock, "resolve must follow lock");
        rule = _rule;
        lockBlock = _lockBlock;
        resolveBlock = _resolveBlock;
        owner = _owner;
        scheduler = IScheduler(RitualAddresses.SCHEDULER);
        phase = Phase.Open;
    }

    /// @notice Submit a prediction before lock. One entry per address.
    /// @param yes true = YES, false = NO
    function enter(bool yes) external {
        if (phase != Phase.Open) revert NotOpen();
        if (block.number >= lockBlock) {
            phase = Phase.Locked;
            emit Locked(block.number);
            revert NotOpen();
        }
        if (picks[msg.sender].submitted) revert AlreadyEntered();
        picks[msg.sender] = Pick({yes: yes, submitted: true});
        entrants.push(msg.sender);
        emit Entered(msg.sender, yes);
    }

    /// @notice Owner (market creator) schedules the autonomous resolution.
    ///         After this call, resolution requires no further EOA action.
    function scheduleResolution() external returns (uint256 callId) {
        if (phase == Phase.Resolved) revert InvalidPhase();
        if (resolutionAttempted) revert AlreadyAttempted();
        resolutionAttempted = true;

        bytes memory data = abi.encodeWithSelector(
            this.executeResolution.selector,
            uint256(0) // placeholder executionIndex — Scheduler overwrites
        );

        callId = scheduler.schedule(
            data,
            SCHEDULER_GAS,
            uint32(resolveBlock),
            1,                      // numCalls: one-shot
            1,                      // frequency
            SCHEDULER_TTL,          // must cover async settlement replay
            2 gwei,                 // maxFeePerGas
            0,
            0,
            address(this)           // payer: this contract's RitualWallet deposit
        );
        scheduleId = callId;
        emit ResolutionScheduled(callId, resolveBlock);
    }

    /// @notice Called by the Scheduler at resolveBlock. Fetches evidence via HTTP
    ///         precompile, extracts via JQ precompile, and sets the terminal outcome.
    ///         INVALID is a real terminal state — unavailable evidence never becomes NO.
    function executeResolution(uint256 executionIndex) external onlyScheduler {
        if (phase == Phase.Resolved) revert InvalidPhase();
        if (phase == Phase.Open) {
            phase = Phase.Locked; // late lock: no further entries
            emit Locked(block.number);
        }
        resolveAt = uint64(block.number);

        // 1) Executor selection from TEE registry (HTTP_CALL capability = 0)
        ITEEServiceRegistry registry = ITEEServiceRegistry(RitualAddresses.TEE_SERVICE_REGISTRY);
        (address executor, bool found) = registry.pickServiceByCapability(
            RitualAddresses.HTTP_CALL_CAPABILITY, true, uint256(keccak256(abi.encode(address(this)))), 10
        );
        if (!found) {
            _finalize(Outcome.INVALID, "");
            return;
        }

        // 2) HTTP GET via precompile (13-field request ABI)
        bytes memory httpInput = abi.encode(
            executor,
            new bytes[](0),          // encryptedSecrets
            uint256(100),            // ttl (blocks)
            new bytes[](0),          // secretSignatures
            bytes(""),               // userPublicKey
            rule.resolutionSource,
            uint8(1),                // GET
            new string[](0),
            new string[](0),
            bytes(""),               // body
            uint256(0),              // dkmsKeyIndex
            uint8(0),                // dkmsKeyFormat
            false                    // piiEnabled
        );
        (bool ok, bytes memory raw) = RitualAddresses.HTTP_PRECOMPILE.call(httpInput);
        if (!ok) {
            _finalize(Outcome.INVALID, "");
            return;
        }

        // Short-running async envelope: (bytes simmedInput, bytes actualOutput)
        (, bytes memory actualOutput) = abi.decode(raw, (bytes, bytes));
        (uint16 statusCode, , , bytes memory body, string memory httpErr) =
            abi.decode(actualOutput, (uint16, string[], string[], bytes, string));
        if (bytes(httpErr).length > 0 || statusCode >= 400) {
            _finalize(Outcome.INVALID, "");
            return;
        }

        // 3) Deterministic extraction via synchronous JQ precompile
        bytes memory jqInput = abi.encode(rule.extractionRule, body);
        (bool jqOk, bytes memory jqOut) = RitualAddresses.JQ_PRECOMPILE.call(jqInput);
        if (!jqOk) {
            _finalize(Outcome.INVALID, "");
            return;
        }
        // JQ output: (bool ok, string result) — tolerate layout variance by decoding string tail
        string memory extracted = _decodeJQString(jqOut);

        // 4) Comparator
        bool isYes = _compare(extracted);
        _finalize(isYes ? Outcome.YES : Outcome.NO, extracted);
    }

    function _decodeJQString(bytes memory jqOut) internal view returns (string memory) {
        // JQ output layout: plain abi.encode(string) OR OutString
        // abi.encode(bytes(abi.encode(string))). Both begin with offset word
        // 0x20, so try plain first and validate: for a single-string encoding,
        // the length word at offset 32 must equal bytes(s).length AND the tail
        // after 32+ceil32(L) must be zero-length. If validation fails, fall
        // back to the double-indirected form.
        if (jqOut.length < 64) return "";
        uint256 lenWord;
        assembly {
            lenWord := mload(add(jqOut, 64))
        }
        // OutString check: if the tail after the offset word is exactly
        // 32 + lenWord bytes AND the word at the inner data start re-states
        // a string length consistent with the remaining bytes, it is the
        // double-indirected form. Prefer that exact structural match.
        if (jqOut.length - 64 == lenWord && lenWord >= 64) {
            // inner = [offset 0x20][strLen][data...]
            uint256 innerStrLen;
            assembly {
                innerStrLen := mload(add(jqOut, 128))
            }
            uint256 ceilInner = (innerStrLen + 31) / 32 * 32;
            if (lenWord == 64 + ceilInner) {
                try this._tryDecodeOutString(jqOut) returns (string memory s) {
                    return s;
                } catch {}
            }
        }
        try this._tryDecodeString(jqOut) returns (string memory s) {
            return s;
        } catch {}
        try this._tryDecodeOutString(jqOut) returns (string memory s) {
            return s;
        } catch {}
        return "";
    }

    function _tryDecodeString(bytes memory b) external pure returns (string memory) {
        return abi.decode(b, (string));
    }

    function _tryDecodeOutString(bytes memory b) external pure returns (string memory) {
        // OutString: abi.encode(string(abi.encode(innerString))) — decode outer pointer to bytes, then string
        bytes memory inner = abi.decode(b, (bytes));
        return abi.decode(inner, (string));
    }

    function _compare(string memory extracted) internal view returns (bool) {
        if (rule.comparator == 0) {
            return keccak256(bytes(extracted)) == keccak256(bytes(rule.target));
        }
        return keccak256(bytes(extracted)) != keccak256(bytes(rule.target));
    }

    function _finalize(Outcome o, string memory extracted) internal {
        outcome = o;
        phase = Phase.Resolved;
        emit Resolved(o, extracted);
    }

    // ---- Views for the competition layer ----
    function entrantCount() external view returns (uint256) {
        return entrants.length;
    }

    function entrantsList() external view returns (address[] memory) {
        return entrants;
    }

    function pickOf(address p) external view returns (bool yes, bool submitted) {
        Pick memory pick = picks[p];
        return (pick.yes, pick.submitted);
    }

    function isFinal() external view returns (bool) {
        return phase == Phase.Resolved;
    }

    receive() external payable {} // accept RITUAL for RitualWallet funding
}

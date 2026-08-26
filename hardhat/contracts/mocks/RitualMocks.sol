// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Mocks for hardhat EDR — adapted from ~/foundry/ritual-rivals/contracts/test/PredictMarket.t.sol
// Stateless vs storage: hardhat_setCode copies CODE but not STORAGE at the canonical addr.
// So configurable mocks expose setters that write to STORAGE at the canonical address AFTER etching.

contract SchedulerMock {
    address public lastTarget;
    bytes public lastData;
    uint64 public lastStartBlockStored;
    uint256 public callCount;
    mapping(uint256 => uint8) public callState;

    function schedule(bytes memory data, uint32, uint32 startBlock, uint32 numCalls, uint32, uint32, uint256, uint256, uint256, address) external returns (uint256) {
        lastData = data;
        lastStartBlockStored = startBlock;
        callCount++;
        callState[callCount] = 0;
        return callCount;
    }
    function cancel(uint256) external {}
    function getCallState(uint256) external pure returns (uint8) { return 0; }
    function approveScheduler(address) external {}
    function lastStartBlock() external view returns (uint64) { return lastStartBlockStored; }
}

contract HTTPPrecompileMock {
    // 0 = 200 OK with body, 1 = 500 error, 2 = executor timeout (errorMessage), 3 = revert
    uint8 public mode;
    function setMode(uint8 m) external { mode = m; }
    fallback(bytes calldata) external returns (bytes memory) {
        bytes memory inner;
        if (mode == 0) {
            inner = abi.encode(uint16(200), new string[](0), new string[](0), bytes('{"price_usd":"101000","vol":3}'), "");
        } else if (mode == 1) {
            inner = abi.encode(uint16(500), new string[](0), new string[](0), bytes(""), "server error");
        } else if (mode == 2) {
            inner = abi.encode(uint16(0), new string[](0), new string[](0), bytes(""), "executor timeout");
        } else {
            revert("TTL expired");
        }
        return abi.encode(bytes(""), inner);
    }
}

contract JQPrecompileMock {
    uint256 public mockValue;
    bool public shouldFail;
    bool public emptyBody;
    function setValue(uint256 v) external { mockValue = v; shouldFail = false; emptyBody = false; }
    function setFail(bool f) external { shouldFail = f; }
    function setEmpty(bool e) external { emptyBody = e; }
    fallback(bytes calldata) external returns (bytes memory) {
        if (shouldFail) {
            // short bytes: result.length < 32 so _jqUint fails
            return hex"";
        }
        if (emptyBody) {
            return bytes("");
        }
        return abi.encode(mockValue);
    }
}

contract TEERegistryMock {
    bool public found;
    address public executor;
    function setFound(bool f) external { found = f; }
    function setExecutor(address e) external { executor = e; }
    // default: found=true returns 0xE0, else not found
    function pickServiceByCapability(uint8, bool, uint256, uint256) external view returns (address, bool) {
        if (found) return (executor == address(0) ? address(0xE0) : executor, true);
        return (address(0), false);
    }
}

contract RitualWalletMock {
    mapping(address => uint256) public bal;
    mapping(address => uint256) public locks;
    function deposit(uint256 lockDuration) external payable {
        bal[msg.sender] += msg.value;
        // also track for address(this) when called via delegate? deposit is called with msg.value from RitualPredict
        // RitualPredict does IRitualWallet(...).deposit{value: ...}(lock)
        // So msg.sender here is RitualPredict, not the EOA. That's correct for executionBalance.
        // But we also need to support direct EOA deposit? same logic.
        locks[msg.sender] = block.number + lockDuration;
    }
    function balanceOf(address a) external view returns (uint256) { return bal[a]; }
    function lockUntil(address a) external view returns (uint256) { return locks[a]; }
    // allow funding via receive
    receive() external payable { bal[msg.sender] += msg.value; }
}

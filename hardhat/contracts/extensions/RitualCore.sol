// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Ritual Chain address constants (from ritual-dapp-skills docs).
library RitualAddresses {
    // Precompiles
    address internal constant HTTP_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address internal constant JQ_PRECOMPILE = 0x0000000000000000000000000000000000000803;

    // System contracts
    address internal constant RITUAL_WALLET = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;
    address internal constant SCHEDULER = 0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B;
    address internal constant TEE_SERVICE_REGISTRY = 0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F;

    uint8 internal constant HTTP_CALL_CAPABILITY = 0;
}

interface IRitualWallet {
    function deposit(uint256 lockDuration) external payable;
    function depositFor(address user, uint256 lockDuration) external payable;
    function balanceOf(address account) external view returns (uint256);
    function lockUntil(address account) external view returns (uint256);
}

interface IScheduler {
    function schedule(
        bytes memory data,
        uint32 gas,
        uint32 startBlock,
        uint32 numCalls,
        uint32 frequency,
        uint32 ttl,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas,
        uint256 value,
        address payer
    ) external returns (uint256 callId);

    function cancel(uint256 callId) external;
    function getCallState(uint256 callId) external view returns (uint8);
    function approveScheduler(address schedulerContract) external;
}

interface ITEEServiceRegistry {
    struct TEEServiceNode {
        address paymentAddress;
        address teeAddress;
        uint8 teeType;
        bytes publicKey;
        string endpoint;
        bytes32 certPubKeyHash;
        uint8 capability;
    }

    struct TEEServiceContext {
        TEEServiceNode node;
        bool isValid;
        bytes32 workloadId;
    }

    function getServicesByCapability(uint8 capability, bool checkValidity)
        external
        view
        returns (TEEServiceContext[] memory);

    function pickServiceByCapability(uint8 capability, bool checkValidity, uint256 seed, uint256 maxProbes)
        external
        view
        returns (address teeAddress, bool found);
}

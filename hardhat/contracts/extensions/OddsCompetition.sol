// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PredictMarket} from "./PredictMarket.sol";

/// @title ForecastCompetition — Last Predictor Standing.
/// @notice The consequence layer. INVARIANT (INV-P1): this contract NEVER fetches
///         external truth. It only consumes finalized outcomes from PredictMarket.
///         INVALID rounds eliminate nobody (INV-P3). No subjective tiebreakers:
///         universal elimination splits rewards across the final cohort.
contract ForecastCompetition {
    enum State {
        Open,       // accepting entrants for round 0
        Live,
        Complete
    }

    struct Round {
        PredictMarket market;
        bool resolved;
        bool invalid; // market resolved INVALID — nobody eliminated, replacement round
    }

    uint8 public constant MAX_ROUNDS = 64;

    address[] public players;
    mapping(address => bool) public joined;
    mapping(uint256 => Round) public rounds; // roundIndex => Round
    uint256 public currentRound;
    uint256 public aliveCount;
    State public state;

    address public immutable owner;
    address[] public finalCohort;

    event Joined(address indexed player);
    event Started(uint256 indexed round, address indexed market);
    event RoundResolved(uint256 indexed round, PredictMarket.Outcome outcome, uint256 eliminatedCount);
    event AdvancedRound(uint256 indexed newRound);
    event Complete(address[] winners);

    error NotOpen();
    error AlreadyJoined();
    error OnlyOwner();
    error MarketNotFinal();
    error WrongMarket();
    error DuplicateMarket();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        state = State.Open;
    }

    function join() external {
        if (state != State.Open) revert NotOpen();
        if (joined[msg.sender]) revert AlreadyJoined();
        joined[msg.sender] = true;
        players.push(msg.sender);
        aliveCount++;
        emit Joined(msg.sender);
    }

    function playerCount() external view returns (uint256) {
        return players.length;
    }

    /// @notice Attach the round's market and open play. Owner-only orchestration
    ///         of *which* market is used; truth still comes from the market itself.
    function startRound(PredictMarket market) external onlyOwner {
        require(state == State.Open || state == State.Live, "complete");
        if (market.isFinal()) revert DuplicateMarket();
        rounds[currentRound] = Round({market: market, resolved: false, invalid: false});
        if (state == State.Open) state = State.Live;
        emit Started(currentRound, address(market));
    }

    function currentMarket() external view returns (PredictMarket) {
        return rounds[currentRound].market;
    }

    /// @notice Consume a finalized outcome. Callable by anyone once the market is
    ///         final — it only applies deterministic transition logic.
    function settleRound() external {
        Round storage r = rounds[currentRound];
        if (address(r.market) == address(0)) revert WrongMarket();
        if (!r.market.isFinal()) revert MarketNotFinal();
        if (r.resolved) revert WrongMarket(); // already settled

        r.resolved = true;
        PredictMarket.Outcome outcome = r.market.outcome();

        // INV-P3: infrastructure failure eliminates nobody.
        if (outcome == PredictMarket.Outcome.INVALID) {
            r.invalid = true;
            emit RoundResolved(currentRound, outcome, 0);
            emit AdvancedRound(currentRound + 1); // replacement round expected
            currentRound++;
            return;
        }

        // Deterministic survivor transition:
        // alive[p,r+1] = alive[p,r] AND prediction[p,r] == outcome[r]
        uint256 survivors = 0;
        delete finalCohort;

        // Capture the entering cohort FIRST: if everyone is eliminated
        // simultaneously, rewards split across THIS cohort (no subjective tiebreak).
        address[] memory enteringCohort = new address[](players.length);
        uint256 enteringCount = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (_isAlive(players[i], currentRound)) {
                enteringCohort[enteringCount++] = players[i];
            }
        }

        for (uint256 i = 0; i < players.length; i++) {
            address p = players[i];
            if (!_isAlive(p, currentRound)) continue;
            (bool yes, bool submitted) = r.market.pickOf(p);
            bool correct = submitted && ((outcome == PredictMarket.Outcome.YES) == yes);
            if (!correct) {
                _eliminate(p, currentRound);
            } else {
                survivors++;
                finalCohort.push(p);
            }
        }
        aliveCount = survivors;

        emit RoundResolved(currentRound, outcome, enteringCount - survivors);

        if (survivors == 0) {
            // Universal elimination: split among the final eligible cohort.
            for (uint256 i = 0; i < enteringCount; i++) {
                finalCohort.push(enteringCohort[i]);
            }
            state = State.Complete;
            emit Complete(finalCohort);
        } else if (survivors == 1) {
            state = State.Complete;
            emit Complete(finalCohort);
        } else {
            currentRound++;
            emit AdvancedRound(currentRound);
        }
    }

    function completeWithCohortSplit() external view returns (address[] memory winners) {
        require(state == State.Complete, "not complete");
        return finalCohort; // 1 winner or split cohort on simultaneous elimination
    }

    // ---- liveness tracking ----
    // eliminated[round][player]: eliminated as OF round `round`'s settlement.
    mapping(uint256 => mapping(address => bool)) private eliminatedAt;

    function _isAlive(address p, uint256 roundIdx) internal view returns (bool) {
        // alive[p] at round r = not eliminated in ANY settled round < r.
        for (uint256 i = 0; i < roundIdx; i++) {
            if (eliminatedAt[i][p]) return false;
        }
        return true;
    }

    function _eliminate(address p, uint256 roundIdx) internal {
        eliminatedAt[roundIdx][p] = true;
    }

    function isAlive(address p) external view returns (bool) {
        // Check eliminations in ALL settled rounds, plus any rounds before
        // currentRound (covers both mid-game and post-completion reads).
        uint256 settled = state == State.Complete ? currentRound + 1 : currentRound;
        return _isAlive(p, settled);
    }

    function playersInRound() internal view returns (uint256) {
        uint256 n = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (_isAlive(players[i], currentRound)) n++;
        }
        return n;
    }
}

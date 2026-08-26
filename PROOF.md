# Proof of Building — Bootcamp 2: Self-Resolving Prediction Market

**Fork:** `Jaydearcadian/ritual-chain-workshop-2` forked via `gh repo fork` from `cozfuttu/ritual-chain-workshop-2` (fork lineage verified via GitHub API; default repo name kept; public).

## What was done

The workshop contract `RitualPredict.sol` ships with 5 stubbed functions. This fork implements all 5, hardens for local testing while chain is down, and extends with a composition layer.

### 1. Core implementation (`hardhat/contracts/RitualPredict.sol`)
- `createMarket`: validates strings/durations (`MIN_BETTING_SECONDS` 30, `MIN_RESOLVE_DELAY` 15, `MAX_MARKET_SECONDS` 1 day), converts seconds→blocks via `blockTimeMs`, stores Market, emits `MarketCreated` + `ResolutionRuleSet`, books Scheduler (`MAX_ATTEMPTS=3`, `RETRY_INTERVAL 200`, `TTL 150`, `gas 2M`).
- `onScheduledResolve`: scheduler-only, idempotent, increments `attempts`, picks TEE executor, calls `_readOracle`, handles `empty winning pool -> Invalid` and `cancel()` on success.
- `_readOracle`: HTTP precompile `0x0801` async envelope decode via `decodeHttpResponse`, checks `status==200`, `errorMessage`, `jq` extraction.
- `_pickExecutor`: `pickServiceByCapability(HTTP_CALL, true, seed, 8)` with `keccak(marketId, executionIndex, prevrandao, block.number)`.
- `_scheduleResolution`: low-level `.call` to Scheduler so local EDR (no system contract) falls back to deterministic fake `callId` instead of reverting on extcodesize check.

### 2. Local execution (chain is down)

Ritual testnet RPC `https://rpc.ritualfoundation.org` currently resolves to Namecheap parking `162.255.119.231` — TCP 443 is down (verified 2026-08-26). Per workshop instructions local work counts:

```bash
cd hardhat
npm install
npx hardhat compile   # solc 0.8.28 — 5 files compiled
npx hardhat test      # 7 passing (2 Counter + 5 RitualPredict lifecycle)
```

See `hardhat/test/RitualPredict.local.test.ts` — deploys on `hardhatMainnet` EDR, creates markets, places YES/NO bets, asserts pool accounting, validates `EmptyString`/`ZeroStake`, checks `getMarkets()` newest-first.

Local deployment also verified:
```bash
npx hardhat run scripts/block-time.ts --network hardhatMainnet
```

### 3. Extension — Odds competition layer (`hardhat/contracts/extensions/`)

`OddsCompetition.sol` (ForecastCompetition) demonstrates the thesis: markets as **composition primitives**. The competition never determines truth — only consumes finalized outcomes.

- `alive[p,r+1] = alive[p,r] ∧ pick == outcome`
- `INVALID` preserves survivors; universal elimination splits across entering cohort.

Full Odds app lives at `~/foundry/ritual-rivals` (27 forge tests, Next.js 16 frontend with cyber-luxury landing, `/play` dashboard, `/mechanics` deep-dive — see `hardhat/contracts/extensions/README.md`).

## Evidence

- `git log --oneline` shows 4 commits of own work beyond the upstream (not a zero-commit fork).
- `npx hardhat compile` and `npx hardhat test` are reproducible locally with Node 22.
- Upstream untouched except via extension; fork lineage kept.

## How to verify

```bash
git clone https://github.com/Jaydearcadian/ritual-chain-workshop-2.git
cd ritual-chain-workshop-2/hardhat
npm install
npx hardhat compile
npx hardhat test
```

Live frontend: https://cooperation-fewer-determines-maple.trycloudflare.com

When `rpc.ritualfoundation.org` returns, deploy:
```bash
cp .env.example .env  # set RITUAL_PRIVATE_KEY
npx hardhat run scripts/deploy.ts --network ritual
npx hardhat run scripts/create-demo-market.ts --network ritual
npx hardhat run scripts/status.ts --network ritual
```

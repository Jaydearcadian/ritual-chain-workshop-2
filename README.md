# Odds — Last Predictor Standing

Odds is a competitive forecasting game built on a self-resolving prediction-market primitive.
Players call YES or NO, survive the rounds their calls get right, and the last predictor standing takes the pool.

The underlying contract is `RitualPredict.sol`. It owns truth resolution: a market fixes its question, oracle URL,
JSON path, target, comparator, and block deadlines at creation. Ritual's Scheduler wakes the contract; the HTTP and
JQ precompiles fetch and extract evidence; the comparator settles YES or NO. If evidence fails, the market becomes
`Invalid` and stakes are refundable. `Invalid` is never interpreted as `NO`.

> Odds owns competition state. RitualPredict owns forecast truth. The authorities stay separate.

## Repository map

```text
hardhat/
  contracts/RitualPredict.sol              self-resolving market primitive
  contracts/extensions/OddsCompetition.sol Last Predictor Standing composition layer
  contracts/mocks/RitualMocks.sol          local canonical-address mocks
  test/RitualPredict.local.test.ts         basic local lifecycle tests
  test/RitualPredict.comprehensive.test.ts mocked precompile, retry, payout coverage
  scripts/                                 deploy, status, funding, demo-market helpers
web/
  app/page.tsx                             Odds editorial landing
  app/play/page.tsx                        competition surface and field motif
  app/markets/page.tsx                     market-primitive dApp
  app/mechanics/page.tsx                   resolution and failure semantics
  app/proof/page.tsx                       evidence and reproduction guide
  app/about/page.tsx                       product thesis / manifesto
  components/ForecastField.tsx              original monochrome survivor motif
  DESIGN.md                                canonical frontend design system
```

## Product surfaces

- `/` — Odds landing: the game first, the primitive underneath.
- `/play` — Last Predictor Standing competition surface. The current fork is honest about the competition contract
  not being bound to a deployed address; it does not invent live rounds.
- `/markets` — create and inspect `RitualPredict` markets, stake YES/NO, fund execution, and claim winnings/refunds.
- `/mechanics` — Scheduler → HTTP → JQ → comparator, retries, block deadlines, invalidation, and payouts.
- `/proof` — verified evidence, local reproduction, and explicit evidence limits.
- `/about` — the mechanism-first thesis behind Odds.

## Local verification

Requirements: Node.js 22+ and npm.

```bash
cd hardhat
npm install
npx hardhat compile
npx hardhat test
```

The verified local result is **26 passing tests**: 2 Counter tests, 5 lifecycle tests, and 19 comprehensive
RitualPredict tests. The comprehensive suite uses Hardhat EDR and mocked Scheduler, HTTP, JQ, TEE registry, and
wallet contracts at the canonical addresses. This is local execution evidence, not a live Ritual receipt.

## Run the web app

```bash
cd web
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_PREDICT_ADDRESS only when a deployed RitualPredict address exists.
npm run dev
```

The web app remains truthful when no address is configured: `/markets` shows `No contract bound` instead of fake data.
The demo oracle is available at `/api/oracle/eth` and returns `{ price, symbol, ts }`; a remote executor needs a public
URL, so expose the web server with:

```bash
cloudflared tunnel --url http://localhost:3000
```

Then use `https://<tunnel>/api/oracle/eth` as the market's `oracleUrl` and `NEXT_PUBLIC_DEMO_ORACLE_URL`.

Production gates:

```bash
npm run build
npx tsc --noEmit
```

## Design system

`web/DESIGN.md` is the canonical visual contract. The current direction is editorial and paper-native:
warm canvas, near-black ink, Oswald display type, Inter body copy, hairline separation, one semantic rust accent,
minimal navigation, and a monochrome forecast field that narrows from many calls to one survivor.

The UI avoids fake metrics, neon dashboard decoration, and claims of live operation. Testnet status and unbound
contracts are explicit.

## Scope and non-goals

This repository intentionally does not include an AMM, order book, governance, separate token, centralized resolver,
upgrade proxy, or social/LLM oracle. Native-asset staking is pari-mutuel and claims are pull-based.

## Proof of Building

This repository is the public fork of `cozfuttu/ritual-chain-workshop-2`, created through the GitHub fork path and
kept under the required name. See [`PROOF.md`](./PROOF.md) for the evidence ledger and reviewer checklist.

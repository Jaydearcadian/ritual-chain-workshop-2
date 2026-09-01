# Proof of Building

## Submission artifact

- Repository: https://github.com/Jaydearcadian/ritual-chain-workshop-2
- Required upstream: `cozfuttu/ritual-chain-workshop-2`
- Fork lineage: verified through GitHub API (`fork: true`, public, default name preserved)
- Canonical product: **Odds — Last Predictor Standing**

This is a real GitHub fork, not a ZIP re-upload. The fork contains the market primitive, the Odds composition layer,
local tests, frontend, design system, and this evidence document.

## What was built

1. Completed the five `RitualPredict.sol` lifecycle stubs.
2. Added local EDR-compatible behavior where system contracts are unavailable.
3. Added canonical-address mocks for Scheduler, HTTP, JQ, TEE registry, and RitualWallet.
4. Added `OddsCompetition.sol`, a Last Predictor Standing layer that consumes finalized market outcomes without
   determining truth itself.
5. Added the Odds web app: landing, play, markets, mechanics, proof, about, and demo oracle routes.
6. Added a deterministic `/play` simulator with both a winner path and an `INVALID`/refund path; it is presentation evidence for the competition layer, not live chain state.

## Verified local evidence

From `hardhat/`:

```bash
npm install
npx hardhat compile
npx hardhat test
```

Result: **26 passing, 0 failing**.

Coverage includes market creation and block conversion, immutable rules, YES/NO stake accounting, close behavior,
Scheduler authorization, comparator outcomes, HTTP/JQ/TEE failure paths, retry exhaustion, Invalid/refund semantics,
idempotency, pari-mutuel winnings, claim guards, and execution funding.

From `web/`:

```bash
npm install
npx tsc --noEmit
npm run build
```

Result: typecheck passed; production build passed and generated the six static product routes plus the dynamic oracle
route. Local production smoke checks returned HTTP 200 for `/`, `/play`, `/markets`, `/mechanics`, `/proof`, `/about`,
and `/api/oracle/eth`.

## Evidence boundaries

- Local contract and frontend execution is verified.
- The fork is public and its lineage is verified.
- Live Ritual deployment and live transaction receipts are **not claimed** and are not required by the workshop brief
  while the RPC is unavailable.
- `Invalid` is a terminal refundable state, never a synonym for `NO`.
- The web UI shows an honest unbound-contract state when no deployment address is configured.

## Reviewer path

```bash
git clone https://github.com/Jaydearcadian/ritual-chain-workshop-2.git
cd ritual-chain-workshop-2/hardhat
npm install
npx hardhat test
cd ../web
npm install
npx tsc --noEmit
npm run build
```

The frontend design contract is [`web/DESIGN.md`](./web/DESIGN.md). Product context is in [`README.md`](./README.md).

# RitualPredict — Workshop Web Demo

Premium Next.js demo for the `RitualPredict` workshop contract on Ritual Chain (1979).

- `/` — cyber-luxury landing: 4-beat pipeline narrative (create → bet → schedule → HTTP→JQ → settle), market lifecycle strip (Open/Closed/Resolving/Resolved/Invalid), and contract call flow.
- `/markets` — the dApp: create market form, live `getMarkets()` list with state badges, YES/NO betting (value), `claimWinnings` / `claimRefund`, `fundExecution`.
- `/mechanics` — deep-dive: scheduler/HTTP/JQ pipeline, failure semantics (failed oracle ≠ NO), block-time notes, payout discipline.

Stack: Next 16 · Tailwind 4 · wagmi/viem · Ritual Chain 1979.

## Run locally

```bash
cd web
npm install
cp .env.example .env.local
# edit .env.local:
#   NEXT_PUBLIC_PREDICT_ADDRESS=0x...   # from hardhat/scripts/deploy.ts
#   NEXT_PUBLIC_DEMO_ORACLE_URL=http://localhost:3000/api/oracle/eth  # or your tunnel URL
npm run dev   # http://localhost:3000
npm run build # production build
npx tsc --noEmit
```

Set `NEXT_PUBLIC_PREDICT_ADDRESS` to the deployed `RitualPredict` address. Until itʼs set the markets UI shows an awaiting-deployment state (honest preview — never fakes live data).

## Demo oracle & tunnel

The TEE executor that runs the HTTP precompile lives in the cloud — it cannot reach `localhost`.
For a live resolution demo:

```bash
cd web && npm run dev          # serves /api/oracle/eth locally
cloudflared tunnel --url http://localhost:3000
# copy the https://...trycloudflare.com URL
```

Put it in two places:

1. `web/.env.local` → `NEXT_PUBLIC_DEMO_ORACLE_URL=https://<tunnel>/api/oracle/eth` (so “Fill demo preset” uses the tunnel)
2. When creating a market (UI or CLI), use that same tunnel URL as `oracleUrl`:

```bash
# CLI alternative to the UI:
PREDICT_ADDRESS=0x... ORACLE_URL=https://<tunnel>/api/oracle/eth \
  npx hardhat run scripts/create-demo-market.ts --network ritual
```

The oracle payload is `{ price: number, symbol: "ETH/USD", ts: number }` and the jq path is `.price`. Any URL that returns JSON with that shape works.

## Contracts

Deploy & fund (from `hardhat/`):

```bash
npx hardhat run scripts/deploy.ts --network ritual
PREDICT_ADDRESS=0x... npx hardhat run scripts/status.ts --network ritual
PREDICT_ADDRESS=0x... npx hardhat run scripts/fund.ts --network ritual
```

ABI is copied from `hardhat/artifacts` into `web/lib/predict-abi.ts` (regenerate with `npx hardhat run scripts/export-abi.ts`).

## Design notes

- One visual center (market lifecycle card) — no competing Core/plinth hero.
- Single state owner drives the 4-beat hero (headline + support + lifecycle strip + pipeline highlight).
- Brand: deep violet `#0b0614`, gradient `#7c3aed → #ec4899 → #f97316`, glassmorphism, ambient breathing blobs — matching the Odds system.
- Reduced-motion freezes on the final beat; no decorative infinite loops on content.

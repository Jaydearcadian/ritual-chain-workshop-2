# Odds web

The `web/` app is the public Odds surface for the canonical fork. It is not a separate product shell.
Odds is the game; `RitualPredict` is the self-resolving market primitive beneath it.

## Routes

- `/` — editorial landing for **Odds — Last Predictor Standing**.
- `/play` — competition surface with the original monochrome `ForecastField` motif. Until a competition address is
  deployed and bound, it states that honestly rather than fabricating a round.
- `/markets` — actual `RitualPredict` dApp: create markets, read `getMarkets()`, stake YES/NO, fund execution,
  claim winnings, and claim refunds.
- `/mechanics` — resolution pipeline and all failure semantics.
- `/proof` — local evidence and reproducible commands.
- `/about` — the product thesis and authority boundary.
- `/api/oracle/eth` — local demo JSON oracle with `{ price, symbol, ts }`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

`NEXT_PUBLIC_PREDICT_ADDRESS` is optional for the editorial pages. Set it to a deployed `RitualPredict` address to
activate the market dApp. The UI displays `No contract bound` when it is absent; it never fakes chain data.

Optional variables:

```text
NEXT_PUBLIC_RPC_URL=https://rpc.ritualfoundation.org
NEXT_PUBLIC_PREDICT_ADDRESS=0x...
NEXT_PUBLIC_DEMO_ORACLE_URL=https://<tunnel>/api/oracle/eth
```

Do not commit `.env.local`.

## Build gates

```bash
npx tsc --noEmit
npm run build
```

The verified build generates `/`, `/play`, `/markets`, `/mechanics`, `/proof`, `/about`, and the dynamic oracle route.

## Public oracle tunnel

The TEE executor cannot reach a developer machine's localhost. Run the app and expose it:

```bash
npm run dev
cloudflared tunnel --url http://localhost:3000
```

Use the resulting public URL plus `/api/oracle/eth` as the market `oracleUrl`. The JSON path is `.price`.

## Design system

Read [`DESIGN.md`](./DESIGN.md) before changing the UI. It defines the paper-and-ink palette, Oswald/Inter/Geist
Mono typography, spacing, state colors, accessibility requirements, surface grammar, and reduced-motion rules.

The visual reference is translated into an original Odds composition: minimal editorial navigation, a centered thesis,
a black primary CTA, and a monochrome field of forecast marks narrowing to one survivor. It does not copy the
reference brand or artwork.

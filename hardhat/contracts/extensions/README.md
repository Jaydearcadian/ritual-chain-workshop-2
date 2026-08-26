# Odds — Composition over RitualPredict

This extension proves the workshop thesis: self-resolving prediction
markets are **composition primitives**, not end products.

`RitualPredict.sol` is left untouched — it is the truth authority.
`OddsCompetition.sol` (ForecastCompetition) is the consequence layer:

- **Authority separation:** competition never fetches truth; it only
  consumes `RitualPredict` / `PredictMarket` finalized outcomes.
- **INVALID preservation:** an INVALID market eliminates nobody —
  infrastructure failure never masquerades as forecasting failure.
- **No subjective tiebreak:** simultaneous universal elimination splits
  across the entering cohort.

See `OddsCompetition.sol` for `alive[p,r+1] = alive[p,r] ∧ pick == outcome`
and `whitepaper/draft.md` in the original Odds repo
(`~/foundry/ritual-rivals` — 27 local tests pass there).

Live demo: `~/foundry/ritual-rivals/frontend` — cyber-luxury
landing (hero → THE GAME → authority → CTA) + `/play` dashboard +
`/mechanics` deep-dive. Tunnel: https://cooperation-fewer-determines-maple.trycloudflare.com

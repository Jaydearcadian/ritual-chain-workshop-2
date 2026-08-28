# Odds — Composition over RitualPredict

This extension is the contract-level expression of the Odds thesis: self-resolving prediction markets are
**composition primitives**, not end products.

`RitualPredict.sol` is the truth authority. `OddsCompetition.sol` is the consequence layer:

- **Authority separation:** competition never fetches truth; it consumes finalized market outcomes.
- **Invalid preservation:** an `Invalid` market eliminates nobody; infrastructure failure never masquerades as forecasting failure.
- **No subjective tiebreak:** simultaneous universal elimination splits across the entering cohort.

The survivor transition is:

```text
alive[p, r + 1] = alive[p, r] ∧ pick[p, r] == outcome[r]
```

The canonical web implementation lives at `../../web/` in this fork. Its `/play` route presents the competition
surface, `/markets` presents the underlying market primitive, and `/mechanics` documents the resolution boundary.
See the repository root `README.md` and `PROOF.md` for setup and verified local evidence.

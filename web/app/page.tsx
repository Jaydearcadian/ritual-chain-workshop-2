import Link from "next/link";
import { ForecastField } from "@/components/ForecastField";

export default function Landing() {
  return (
    <>
      {/* Hero — one focal center: the game */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-2 pt-14 text-center sm:pt-20">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          Odds · Last Predictor Standing
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-[44px] font-semibold uppercase leading-[1.05] tracking-[0.01em] text-[color:var(--ink)] sm:text-7xl">
          Last predictor standing
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-[color:var(--ink-secondary)] sm:text-lg">
          Everyone calls the outcome, and the market settles itself on-chain. Miss the final call and you are out — the
          last one standing takes the pool.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link href="/play" className="btn-primary text-sm">
            Play Odds
            <span aria-hidden>→</span>
          </Link>
          <Link href="/mechanics" className="btn-secondary text-sm">
            How it settles
          </Link>
        </div>
      </section>

      {/* The motif — many calls narrowing to one survivor */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16 pt-10 sm:pb-24 sm:pt-12">
        <ForecastField />
      </section>

      {/* Decide / Learn — typographic split, no card grids */}
      <section aria-labelledby="decide-learn-heading" className="border-t border-[color:var(--hairline)]">
        <h2 id="decide-learn-heading" className="sr-only">
          Decide or learn
        </h2>
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:gap-0 sm:py-20">
          <div className="sm:pr-12">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Decide</p>
            <h3 className="mt-5 font-display text-3xl font-semibold uppercase tracking-[0.01em] text-[color:var(--ink)]">
              Play the round
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[color:var(--ink-secondary)]">
              While a market is Open, stake native RITUAL on YES or NO. When the round closes the pool is frozen. If the
              comparator rules your way, the pari-mutuel pool pays you{" "}
              <span className="font-mono text-sm text-[color:var(--ink)]">stake × totalPool ÷ winningPool</span>. If it
              rules against you, you are struck from the field.
            </p>
            <Link
              href="/play"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[color:var(--ink)] underline-offset-4 transition-colors hover:underline"
            >
              Enter the game <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="sm:border-l sm:border-[color:var(--hairline)] sm:pl-12">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Learn</p>
            <h3 className="mt-5 font-display text-3xl font-semibold uppercase tracking-[0.01em] text-[color:var(--ink)]">
              One immutable rule
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[color:var(--ink-secondary)]">
              Every round runs on RitualPredict, a self-resolving market. The rule — question, oracleUrl, jsonPath,
              target, comparator — is fixed at creation, with no setter. At{" "}
              <span className="font-mono text-sm text-[color:var(--ink)]">resolveBlock</span> the Scheduler wakes the
              contract: an HTTP fetch, a jq extraction, a comparator verdict. Nobody resolves by hand.
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[color:var(--ink-secondary)]">
              If the evidence fails, the market goes{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>
                Invalid
              </span>{" "}
              — every stake is refundable. A failed oracle is never recorded as NO.
            </p>
            <Link
              href="/mechanics"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[color:var(--ink)] underline-offset-4 transition-colors hover:underline"
            >
              Read the mechanics <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quiet trust / technical strip */}
      <section aria-label="Settlement pipeline in brief" className="border-t border-[color:var(--hairline)]">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">
          <p className="font-mono text-xs leading-relaxed text-[color:var(--ink-muted)]">
            rule fixed at creation — no setter
            <span aria-hidden> · </span>
            scheduler wakes at resolveBlock
            <span aria-hidden> · </span>
            HTTP 0x0801 → jq 0x0803 → comparator
            <span aria-hidden> · </span>
            evidence fails → Invalid, everyone refunds
            <span aria-hidden> · </span>
            testnet — nothing here is live
          </p>
        </div>
      </section>
    </>
  );
}
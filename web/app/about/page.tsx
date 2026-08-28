import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-12 sm:pt-16">
      <p className="eyebrow">Odds · Manifesto</p>
      <h1 className="mt-5 font-display text-5xl font-semibold uppercase leading-[0.98] text-[color:var(--ink)] sm:text-7xl">Forecasts that resolve themselves.</h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-[color:var(--ink-secondary)]">
        <p>Most competitive games need a referee. Odds starts with a different primitive: a forecast whose rule is fixed before anyone calls it, and whose evidence is fetched and interpreted by the chain.</p>
        <p>That makes a market more than a place to wager. It becomes a composable state transition: open, close, resolve, or return every stake when the evidence is not good enough.</p>
        <p>Last Predictor Standing consumes those finalized transitions. The competition adds pressure and consequence, but never gets to decide what is true.</p>
      </div>

      <blockquote className="mt-12 border-y border-[color:var(--hairline)] py-8 font-display text-3xl font-semibold uppercase leading-tight text-[color:var(--ink)] sm:text-4xl">
        Self-resolving prediction markets are reusable composition primitives for competitive games.
      </blockquote>

      <section className="mt-12 border-t border-[color:var(--hairline)] pt-10" aria-labelledby="boundary-heading">
        <p className="eyebrow">The boundary</p>
        <h2 id="boundary-heading" className="mt-4 font-display text-3xl font-semibold uppercase text-[color:var(--ink)]">Odds does not arbitrate truth</h2>
        <p className="mt-4 text-base leading-relaxed text-[color:var(--ink-secondary)]">RitualPredict owns the resolution rule and evidence path. Odds owns the competition state. Keeping those authorities separate is the point.</p>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/play" className="btn-primary text-sm">Play Odds <span aria-hidden>→</span></Link>
        <Link href="/proof" className="btn-secondary text-sm">See the proof</Link>
      </div>
    </div>
  );
}

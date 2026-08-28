import type { Metadata } from "next";
import Link from "next/link";
import { CompetitionDemo } from "@/components/CompetitionDemo";

export const metadata: Metadata = { title: "Play" };

export default function PlayPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
      <section className="grid gap-8 border-b border-[color:var(--hairline)] pb-12 sm:grid-cols-[1fr_0.7fr] sm:items-end sm:gap-14">
        <div>
          <p className="eyebrow">Odds · Demo dashboard</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] sm:text-7xl">Start to finish.</h1>
        </div>
        <div>
          <p className="max-w-md text-base leading-relaxed text-[color:var(--ink-secondary)]">Watch a complete Last Predictor Standing competition unfold. Players call, the market resolves, wrong calls leave the field, and the final survivor takes the pool.</p>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--ink-muted)]">This is a deterministic local simulation. No wallet, chain, or live oracle is involved.</p>
        </div>
      </section>

      <section className="py-12 sm:py-16" aria-label="Competition simulation">
        <CompetitionDemo />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-5 border-t border-[color:var(--hairline)] pt-8">
        <p className="max-w-xl text-sm leading-relaxed text-[color:var(--ink-muted)]">The demo illustrates the competition layer. Real market truth comes from RitualPredict; the underlying market builder is available separately.</p>
        <div className="flex flex-wrap gap-4"><Link href="/markets" className="btn-secondary text-sm">Open markets <span aria-hidden>→</span></Link><Link href="/mechanics" className="btn-secondary text-sm">Read mechanics <span aria-hidden>→</span></Link></div>
      </section>
    </main>
  );
}

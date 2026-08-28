import type { Metadata } from "next";
import Link from "next/link";
import { ForecastField } from "@/components/ForecastField";

export const metadata: Metadata = { title: "Play" };

export default function PlayPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-12 sm:pt-16">
      <section className="grid gap-10 border-b border-[color:var(--hairline)] pb-14 sm:grid-cols-[1fr_0.8fr] sm:items-end">
        <div>
          <p className="eyebrow">Odds · Competition</p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-semibold uppercase leading-[0.98] tracking-[0.01em] text-[color:var(--ink)] sm:text-7xl">
            Last predictor standing
          </h1>
        </div>
        <div>
          <p className="max-w-md text-base leading-relaxed text-[color:var(--ink-secondary)]">
            One round at a time. Call the outcome, survive the market&apos;s verdict, and return for the next call. This
            competition surface is ready for the game contract; the current fork exposes the underlying market builder.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--ink-muted)]" role="status">
            Competition contract not bound in this preview. Nothing is simulated.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="field-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The field</p>
            <h2 id="field-heading" className="mt-4 font-display text-3xl font-semibold uppercase text-[color:var(--ink)] sm:text-4xl">
              Every call is a filter
            </h2>
          </div>
          <span className="font-mono text-xs text-[color:var(--ink-muted)]">R0 / waiting for players</span>
        </div>
        <div className="mt-8">
          <ForecastField />
        </div>
      </section>

      <section className="grid gap-10 border-t border-[color:var(--hairline)] py-14 sm:grid-cols-2 sm:gap-0 sm:py-20">
        <div className="sm:pr-12">
          <p className="eyebrow">How to play</p>
          <ol className="mt-6 space-y-5 text-base text-[color:var(--ink-secondary)]">
            <li><span className="font-mono text-xs text-[color:var(--ink-muted)]">01</span> Join the open competition.</li>
            <li><span className="font-mono text-xs text-[color:var(--ink-muted)]">02</span> Call YES or NO on the round market.</li>
            <li><span className="font-mono text-xs text-[color:var(--ink-muted)]">03</span> Let the immutable rule resolve the truth.</li>
            <li><span className="font-mono text-xs text-[color:var(--ink-muted)]">04</span> Wrong calls leave the field; the last survivor takes the pool.</li>
          </ol>
        </div>
        <div className="border-t border-[color:var(--hairline)] pt-10 sm:border-l sm:border-t-0 sm:pl-12 sm:pt-0">
          <p className="eyebrow">The underlying primitive</p>
          <h2 className="mt-5 font-display text-3xl font-semibold uppercase text-[color:var(--ink)]">Truth stays separate</h2>
          <p className="mt-5 text-base leading-relaxed text-[color:var(--ink-secondary)]">
            Odds never decides whether a forecast is true. RitualPredict does: Scheduler wakes it, HTTP fetches evidence,
            JQ extracts a value, and the comparator settles YES or NO. If evidence fails, the market is Invalid and survivors
            remain alive.
          </p>
          <Link href="/mechanics" className="mt-7 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[color:var(--ink)] underline-offset-4 hover:underline">
            Read how it settles <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

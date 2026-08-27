"use client";
import { useEffect, useState } from "react";
import { LifecycleRail } from "@/components/LifecycleRail";

/* Landing hero — 4-beat RitualPredict pipeline narrated through the ONE visual
 * center: the market lifecycle rail (Open → Closed → Resolving → Resolved/Invalid).
 * A single state owner drives headline, support and lifecycle highlight.
 * Reduced motion freezes on the final beat and disables autoplay. */

type Beat = {
  n: string;
  eyebrow: string;
  headline: string;
  accent: string;
  support: string;
  caption: string;
  detail: string;
  lifecycle: 0 | 1 | 2 | 3 | 4;
};

const BEATS: Beat[] = [
  {
    n: "01",
    eyebrow: "Create",
    headline: "A question enters the chain.",
    accent: "Its rule is sealed.",
    support:
      "Question, oracle URL, jq path, target and comparator — fixed at creation. No setter exists. The Scheduler is booked in the same transaction.",
    caption: "THE RULE",
    detail: "createMarket(NewMarket) → schedule(resolver, 3 × 200 blocks)",
    lifecycle: 0,
  },
  {
    n: "02",
    eyebrow: "Bet",
    headline: "Stake native RITUAL — YES or NO.",
    accent: "While the market is Open.",
    support:
      "Betting closes at closeBlock — a block number, never a timestamp — so the lock and the Scheduler can never disagree.",
    caption: "THE POOL",
    detail: "bet(id, isYes) payable · pari-mutuel · pull-based claims",
    lifecycle: 1,
  },
  {
    n: "03",
    eyebrow: "Schedule",
    headline: "No one presses resolve.",
    accent: "The Scheduler does.",
    support:
      "At resolveBlock the system contract wakes onScheduledResolve, re-rolls a TEE executor via pickServiceByCapability, and calls the HTTP precompile inside that one scheduled transaction.",
    caption: "THE WAKE-UP",
    detail: "onScheduledResolve(executionIndex, marketId) — scheduler-only, idempotent",
    lifecycle: 2,
  },
  {
    n: "04",
    eyebrow: "Settle",
    headline: "Evidence becomes outcome.",
    accent: "Resolves — or refunds.",
    support:
      "HTTP 0x0801 fetches the oracle, jq 0x0803 extracts one uint256, the comparator decides YES/NO. Fail three times → Invalid, everyone refunds. Empty winning side → also Invalid.",
    caption: "THE SETTLEMENT",
    detail: "observed ⋈ target → Resolved / Invalid · cancel() remainder",
    lifecycle: 3,
  },
];

const HOLD_MS = 4400;

export default function WorkshopHero() {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((v) => (v + 1) % BEATS.length), HOLD_MS);
    return () => clearInterval(t);
  }, [reduced]);

  const s = reduced ? BEATS[BEATS.length - 1] : BEATS[i];

  return (
    <section className="relative overflow-hidden">
      <div className="tech-grid absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-3xl px-6 pt-16 sm:pt-24">
        {/* beat marker */}
        <div className="flex items-center gap-4">
          <span key={`n-${i}`} className="rise-in font-mono text-xs text-[color:var(--text-muted)]">
            {s.n} / 04
          </span>
          <span key={`e-${i}`} className="rise-in text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
            {s.eyebrow}
          </span>
          {!reduced && (
            <div className="ml-auto flex flex-1 justify-end gap-1.5" aria-hidden>
              {BEATS.map((_, d) => (
                <span
                  key={d}
                  className={`h-px transition-all duration-500 ${
                    d === i ? "w-8 bg-[color:var(--text-secondary)]" : d < i ? "w-4 bg-[color:var(--text-faint)]" : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">
          RitualPredict · Workshop demo · Ritual Chain 1979
        </p>

        <h1 className="mt-6 max-w-xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-[52px]">
          <span key={`h-${i}`} className="rise-in block text-[color:var(--text-primary)]">
            {s.headline}
          </span>
          <span key={`a-${i}`} className="brand-text accent-wipe mt-2 block">
            {s.accent}
          </span>
        </h1>

        <p key={`sup-${i}`} className="rise-in-late mt-7 max-w-lg text-balance text-base leading-relaxed text-[color:var(--text-secondary)]">
          {s.support}
        </p>

        {/* ONE visual center: the market lifecycle */}
        <div className="surface mt-12 p-7 sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <span key={`cap-${s.n}`} className="rise-in text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
              {s.caption} · MARKET LIFECYCLE
            </span>
            <span key={`det-${s.n}`} className="rise-in truncate font-mono text-[10px] text-[color:var(--text-muted)]">
              {s.detail}
            </span>
          </div>
          <div className="mt-6">
            <LifecycleRail state={s.lifecycle} showInvalidBranch={s.n === "04"} pulse={!reduced} />
          </div>
        </div>
      </div>
    </section>
  );
}

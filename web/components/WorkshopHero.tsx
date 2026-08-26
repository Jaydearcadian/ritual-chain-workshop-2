"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* Workshop landing hero — 4-beat RitualPredict pipeline.
 * One state owner i drives headline, support, lifecycle strip, and flow signal.
 * Visual center = market lifecycle card (not a competing dot field).
 */

type Beat = {
  n: string;
  eyebrow: string;
  headline: string;
  accent: string;
  support: string;
  caption: string;
  detail: string;
  lifecycle: 0 | 1 | 2 | 3 | 4; // index into MarketState
  flowStep: 0 | 1 | 2 | 3; // pipeline stage
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
    flowStep: 0,
  },
  {
    n: "02",
    eyebrow: "Bet",
    headline: "Stake native RITUAL — YES or NO.",
    accent: "While the market is Open.",
    support:
      "Two running totals, one mapping per side. Betting closes at closeBlock — a block number, never a timestamp — so lock and Scheduler can never disagree.",
    caption: "THE POOL",
    detail: "bet(id, isYes) payable · pari-mutuel · pull-based claims",
    lifecycle: 0,
    flowStep: 1,
  },
  {
    n: "03",
    eyebrow: "Schedule",
    headline: "No one presses resolve.",
    accent: "The Scheduler does.",
    support:
      "At resolveBlock the system contract wakes onScheduledResolve, re-rolls a TEE executor via pickServiceByCapability, and calls the HTTP precompile inside that one scheduled transaction.",
    caption: "THE WAKE-UP",
    detail: "Scheduler 0x56e7…D58B → onScheduledResolve(executionIndex, marketId)",
    lifecycle: 2,
    flowStep: 2,
  },
  {
    n: "04",
    eyebrow: "Settle",
    headline: "Evidence becomes outcome.",
    accent: "Resolves — or refunds.",
    support:
      "HTTP 0x0801 fetches the oracle, jq 0x0803 extracts one uint256, comparator decides YES/NO. Fail three times → Invalid, everyone refunds. Empty winning side → also Invalid.",
    caption: "THE SETTLEMENT",
    detail: "HTTP→JQ → observed ⋈ target → Resolved / Invalid · cancel() remainder",
    lifecycle: 3,
    flowStep: 3,
  },
];

const HOLD_MS = 4400;

const STATE_LABELS = ["Open", "Closed", "Resolving", "Resolved", "Invalid"] as const;

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
      <div className="blob left-[-10%] top-[8%] h-[420px] w-[420px] opacity-30 lg:opacity-45" style={{ background: "#7c3aed" }} aria-hidden />
      <div className="blob right-[-8%] top-[28%] h-[360px] w-[360px] opacity-25 lg:opacity-40" style={{ background: "#ec4899", animationDelay: "-6s" }} aria-hidden />

      <div className="relative mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
        {/* beat marker */}
        <div className="flex items-center gap-4">
          <span key={`n-${i}`} className="resolve-fast font-mono text-xs text-zinc-400">
            {s.n} / 04
          </span>
          <span key={`e-${i}`} className="resolve-fast text-[11px] uppercase tracking-[0.35em] text-zinc-500">
            {s.eyebrow}
          </span>
          {!reduced && (
            <div className="ml-auto flex flex-1 justify-end gap-1.5" aria-hidden>
              {BEATS.map((_, d) => (
                <span
                  key={d}
                  className={`h-px transition-all duration-500 ${d === i ? "w-8 bg-zinc-300" : d < i ? "w-4 bg-zinc-600" : "w-4 bg-zinc-800"}`}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.35em] text-fuchsia-400/70">
          RitualPredict · Workshop demo · Ritual Chain 1979
        </p>

        <h1 className="mt-6 max-w-xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-[52px]">
          <span key={`h-${i}`} className="resolve-slow block text-white">
            {s.headline}
          </span>
          <span key={`a-${i}`} className="brand-text resolve-accent mt-2 block">
            {s.accent}
          </span>
        </h1>

        <p key={`sup-${i}`} className="resolve-support mt-7 max-w-lg text-balance text-base leading-relaxed text-slate-300">
          {s.support}
        </p>

        {/* Visual center: market lifecycle + pipeline */}
        <LifecycleCard beat={s} pulse={!reduced} />

        {/* Contract call flow diagram */}
        <PipelineStrip activeStep={s.flowStep} />

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <Link
            href="/markets"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-brand via-magenta-brand to-orange-brand px-8 text-sm font-semibold text-white shadow-[0_0_30px_rgba(236,72,153,0.35)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(236,72,153,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          >
            Open the markets
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <Link href="/mechanics" className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline">
            How resolution works →
          </Link>
        </div>
      </div>
    </section>
  );
}

function LifecycleCard({ beat, pulse }: { beat: Beat; pulse: boolean }) {
  const active = beat.lifecycle;
  // Resolved vs Invalid split — beat 4 shows Resolved path, annotate Invalid alternative
  const showInvalidBranch = beat.n === "04";

  return (
    <div className="glass mt-12 rounded-3xl p-7 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span key={`cap-${beat.n}`} className="resolve-fast text-[10px] uppercase tracking-[0.3em] text-zinc-400">
          {beat.caption} · MARKET LIFECYCLE
        </span>
        <span key={`det-${beat.n}`} className="resolve-fast truncate font-mono text-[10px] text-zinc-500">
          {beat.detail}
        </span>
      </div>

      {/* Lifecycle strip */}
      <div className="mt-6 flex items-center gap-1.5 sm:gap-2" role="img" aria-label={`market state: ${STATE_LABELS[active]}`}>
        {STATE_LABELS.map((label, idx) => {
          const isActive = idx === active;
          const isPast = idx < active;
          // Invalid is terminal alternative — dim unless active
          const isInvalid = label === "Invalid";
          const dimInvalid = isInvalid && active !== 4;

          return (
            <div key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
              <div className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`h-2 w-full rounded-full transition-all duration-700 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-brand to-magenta-brand shadow-[0_0_14px_rgba(236,72,153,0.6)]"
                      : isPast
                        ? "bg-zinc-600"
                        : dimInvalid
                          ? "bg-zinc-800/40"
                          : "bg-zinc-800"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide transition-colors duration-500 ${
                    isActive ? "text-white" : isPast ? "text-zinc-400" : dimInvalid ? "text-zinc-600" : "text-zinc-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < STATE_LABELS.length - 1 && (
                <span className={`hidden text-zinc-700 sm:inline ${isPast ? "text-zinc-600" : "text-zinc-800"}`} aria-hidden>
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pool hint / outcome hint */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" aria-hidden />
          <span className="font-mono text-xs text-zinc-400">YES pool</span>
          <span className="h-2 w-2 rounded-full bg-zinc-500" aria-hidden />
          <span className="font-mono text-xs text-zinc-400">NO pool</span>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {showInvalidBranch ? "Invalid → refund" : beat.n === "03" ? "3 attempts · 200 blocks apart" : "pari-mutuel · pull claims"}
        </span>
      </div>

      {pulse && (beat.n === "03" || beat.n === "04") && (
        <div className="mt-5 h-px w-full overflow-hidden rounded-full bg-zinc-800/60">
          <div className="signal-sweep h-px w-full bg-gradient-to-r from-transparent via-magenta-brand to-transparent" />
        </div>
      )}
    </div>
  );
}

function PipelineStrip({ activeStep }: { activeStep: number }) {
  const STEPS = [
    { k: "createMarket", sub: "book Scheduler" },
    { k: "bet", sub: "YES / NO · value" },
    { k: "Scheduler", sub: "0x56e7…D58B wake-up" },
    { k: "HTTP → JQ → settle", sub: "0x0801 → 0x0803 → compare" },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STEPS.map((s, idx) => {
        const active = idx === activeStep;
        const past = idx < activeStep;
        return (
          <div
            key={s.k}
            className={`rounded-2xl border px-4 py-4 transition-all duration-500 ${
              active
                ? "border-fuchsia-500/30 bg-fuchsia-500/10"
                : past
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <p className={`font-mono text-xs font-semibold ${active ? "text-white" : past ? "text-zinc-300" : "text-zinc-500"}`}>{s.k}</p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

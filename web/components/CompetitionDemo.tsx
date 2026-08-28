"use client";

import { useEffect, useMemo, useState } from "react";

type Phase = "idle" | "open" | "resolving" | "resolved" | "complete";
type Choice = "YES" | "NO";

type Player = { name: string; choice: Choice; alive: boolean };

const BASE_PLAYERS = ["Mara", "Ivo", "Nia", "Sol", "Ren", "Tao", "Uma", "Kai"];
const OUTCOMES: Choice[] = ["YES", "NO", "YES", "YES", "NO"];
const CALLS: Choice[][] = [
  ["YES", "NO", "YES", "NO", "YES", "YES", "NO", "YES"],
  ["NO", "NO", "YES", "YES", "NO", "YES", "YES", "NO"],
  ["YES", "NO", "YES", "NO", "YES", "YES", "NO", "YES"],
  ["NO", "YES", "YES", "NO", "NO", "YES", "YES", "NO"],
  ["YES", "NO", "NO", "NO", "YES", "YES", "NO", "YES"],
];

export function CompetitionDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [players, setPlayers] = useState<Player[]>(() => BASE_PLAYERS.map((name, i) => ({ name, choice: CALLS[0][i], alive: true })));

  const outcome = OUTCOMES[Math.min(round, OUTCOMES.length - 1)];
  const alive = useMemo(() => players.filter((player) => player.alive), [players]);
  const pool = (8 + round * 2.4).toFixed(1);
  const statusLabel = phase === "idle" ? "Ready" : phase === "open" ? "Open" : phase === "resolving" ? "Resolving" : phase === "resolved" ? "Resolved" : "Complete";

  useEffect(() => {
    if (phase === "idle" || phase === "complete") return;
    const timer = window.setTimeout(() => {
      if (phase === "open") {
        setPhase("resolving");
      } else if (phase === "resolving") {
        setPhase("resolved");
        setPlayers((current) => current.map((player) => ({ ...player, alive: player.alive && player.choice === outcome })));
      } else if (phase === "resolved") {
        const nextRound = round + 1;
        if (nextRound >= OUTCOMES.length || alive.length <= 1) {
          setPhase("complete");
        } else {
          setRound(nextRound);
          setPlayers((current) => current.map((player, i) => ({ ...player, choice: CALLS[nextRound][i] })));
          setPhase("open");
        }
      }
    }, phase === "resolving" ? 1200 : 1050);
    return () => window.clearTimeout(timer);
  }, [alive.length, outcome, phase, round]);

  function start() {
    setRound(0);
    setPlayers(BASE_PLAYERS.map((name, i) => ({ name, choice: CALLS[0][i], alive: true })));
    setPhase("open");
  }

  function reset() {
    setRound(0);
    setPlayers(BASE_PLAYERS.map((name, i) => ({ name, choice: CALLS[0][i], alive: true })));
    setPhase("idle");
  }

  const progress = phase === "idle" ? 0 : phase === "complete" ? 100 : Math.round(((round * 3 + (phase === "open" ? 1 : phase === "resolving" ? 2 : 3)) / (OUTCOMES.length * 3)) * 100);

  return (
    <section className="surface overflow-hidden" aria-labelledby="demo-heading">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--hairline)] px-5 py-4 sm:px-7">
        <div>
          <p className="eyebrow">Local competition simulator</p>
          <h2 id="demo-heading" className="mt-2 font-display text-2xl font-semibold uppercase tracking-tight text-[color:var(--ink)]">Last Predictor Standing</h2>
        </div>
        <span className="rounded-full border border-[color:var(--hairline)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">simulated · no wallet</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="font-mono text-xs text-[color:var(--ink-muted)]">ROUND {String(round + 1).padStart(2, "0")} / {OUTCOMES.length}</p><p className="mt-2 text-sm text-[color:var(--ink-secondary)]">Outcome is consumed only after the market resolves.</p></div>
            <div className="text-right"><p className="font-display text-3xl font-semibold text-[color:var(--ink)]">{alive.length}</p><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--ink-muted)]">alive</p></div>
          </div>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-[color:var(--canvas-deep)]"><div className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
          <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)]"><span>Open</span><span>Resolving</span><span>Settled</span></div>

          <div className="mt-8 grid gap-2 sm:grid-cols-2">
            {players.map((player) => (
              <div key={player.name} className={`flex items-center justify-between rounded-[10px] border px-4 py-3 transition-opacity ${player.alive ? "border-[color:var(--hairline)] bg-white" : "border-transparent bg-[color:var(--canvas-deep)] opacity-45"}`}>
                <div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${player.alive ? "bg-[color:var(--state-resolved)]" : "bg-[color:var(--ink-faint)]"}`} /><span className="text-sm font-semibold text-[color:var(--ink)]">{player.name}</span></div>
                <span className="font-mono text-xs text-[color:var(--ink-secondary)]">{player.alive ? player.choice : "OUT"}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-[color:var(--hairline)] bg-[color:var(--canvas-deep)] p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--ink-muted)]">Market state</span><span className="font-mono text-xs text-[color:var(--accent)]">{statusLabel}</span></div>
          <div className="mt-8 space-y-6">
            <div><p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">Current call</p><p className="mt-2 font-display text-4xl font-semibold text-[color:var(--ink)]">{phase === "idle" ? "—" : outcome}</p></div>
            <div className="border-t border-[color:var(--hairline)] pt-5"><p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">Pool</p><p className="mt-2 font-display text-3xl font-semibold text-[color:var(--ink)]">{pool} <span className="font-mono text-xs font-normal text-[color:var(--ink-muted)]">RITUAL</span></p></div>
            <div className="border-t border-[color:var(--hairline)] pt-5"><p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">Settlement</p><p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-secondary)]">{phase === "complete" ? "The final survivor takes the pool." : phase === "resolved" ? `The market returned ${outcome}. Wrong calls are removed.` : "Scheduler → HTTP → JQ → comparator"}</p></div>
          </div>
          <div className="mt-9 flex flex-wrap gap-3"><button type="button" onClick={start} disabled={phase !== "idle" && phase !== "complete"} className="btn-primary text-sm">{phase === "complete" ? "Run again" : "Start demo"} <span aria-hidden>→</span></button>{phase !== "idle" && <button type="button" onClick={reset} className="btn-secondary text-sm">Reset</button>}</div>
        </aside>
      </div>
    </section>
  );
}

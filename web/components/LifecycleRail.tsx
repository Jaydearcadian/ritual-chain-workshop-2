"use client";

import { MARKET_STATE_LABELS } from "@/lib/presets";

/* The single visual center of the site: the market lifecycle rail.
 * Open → Closed → Resolving → Resolved, with Invalid as the terminal
 * refund branch (a failed oracle is NEVER a NO — it is refundable).
 * Reused by the hero and by every market card so the site has one
 * consistent lifecycle readout. */

export const LIFECYCLE_TOKENS: Record<number, { color: string; note: string }> = {
  0: { color: "var(--state-open)", note: "betting live" },
  1: { color: "var(--state-closed)", note: "pool frozen" },
  2: { color: "var(--state-resolving)", note: "HTTP → JQ in flight" },
  3: { color: "var(--state-resolved)", note: "claims open" },
  4: { color: "var(--state-invalid)", note: "refundable — never NO" },
};

type Props = {
  /** Current contract state index: 0 Open · 1 Closed · 2 Resolving · 3 Resolved · 4 Invalid */
  state: number;
  /** For the Resolved state, the concrete outcome ("YES" / "NO") */
  outcome?: string;
  /** Show the Invalid refund branch annotation (hero, mechanics) */
  showInvalidBranch?: boolean;
  /** Whether the animated signal sweep may run (false when reduced motion) */
  pulse?: boolean;
};

export function stateLabelOf(state: number, outcome?: string) {
  const base = MARKET_STATE_LABELS[state] ?? `state ${state}`;
  return state === 3 && outcome && outcome !== "Unresolved" ? `${base} · ${outcome}` : base;
}

export function LifecycleRail({ state, outcome, showInvalidBranch = false, pulse = true }: Props) {
  const resolved = state >= 3;
  return (
    <div>
      <ol
        className="flex items-start gap-1.5 sm:gap-2"
        aria-label={`Market lifecycle: currently ${stateLabelOf(state, outcome)}`}
      >
        {[0, 1, 2, 3].map((idx) => {
          const active = state === idx;
          const past = state > idx;
          const isInvalidBranch = idx === 3 && state === 4;
          const token = LIFECYCLE_TOKENS[idx];
          const dim = isInvalidBranch;
          return (
            <li key={idx} className="flex flex-1 flex-col items-center gap-2" aria-current={active ? "step" : undefined}>
              <div
                aria-hidden
                className="h-1.5 w-full rounded-full transition-all duration-700"
                style={{
                  background: active || past ? token.color : dim ? "var(--paper)" : "var(--track)",
                  boxShadow: active && pulse && !isInvalidBranch ? `0 0 14px ${token.color}` : undefined,
                }}
              />
              <span
                className="text-[10px] font-medium uppercase tracking-wide transition-colors duration-500"
                style={{ color: active ? token.color : past ? "var(--text-secondary)" : dim ? "var(--text-faint)" : "var(--text-muted)" }}
              >
                {MARKET_STATE_LABELS[idx]}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Invalid — the refund branch, never a NO */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs" aria-live="polite">
          {resolved ? (
            state === 4 ? (
              <>
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: "var(--state-invalid)" }} />
                <span style={{ color: "var(--state-invalid)" }} className="font-medium">
                  Invalid · all stakes refundable via claimRefund
                </span>
              </>
            ) : (
              <>
                <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: "var(--state-resolved)" }} />
                <span style={{ color: "var(--state-resolved)" }} className="font-medium">
                  Resolved {outcome && outcome !== "Unresolved" ? `· ${outcome}` : ""} · claimWinnings open
                </span>
              </>
            )
          ) : showInvalidBranch ? (
            <>
              <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: "var(--state-invalid)" }} />
              <span className="text-[color:var(--text-muted)]">if evidence fails → Invalid · everyone refunds</span>
            </>
          ) : (
            <span className="text-[color:var(--text-muted)]">{LIFECYCLE_TOKENS[state]?.note ?? ""}</span>
          )}
        </p>
        {state === 2 && pulse && (
          <span aria-hidden className="h-px w-16 overflow-hidden rounded-full bg-[color:var(--track)]">
            <span className="signal-sweep block h-px w-full" style={{ background: "linear-gradient(90deg, transparent, var(--state-resolving), transparent)" }} />
          </span>
        )}
      </div>
    </div>
  );
}

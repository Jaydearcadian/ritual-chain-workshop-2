import Link from "next/link";
import WorkshopHero from "@/components/WorkshopHero";
import { SCHEDULER, RITUAL_WALLET } from "@/lib/chain";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const STEPS = [
  {
    k: "01 · create",
    title: "Fix the rule at birth",
    body: "Question, oracleUrl, jsonPath, target, comparator, bettingSeconds, resolveDelaySeconds — then closeBlock and resolveBlock are derived from blockTimeMs. No setter exists afterwards.",
  },
  {
    k: "02 · schedule",
    title: "Book the wake-up up front",
    body: "One schedule() call: 3 executions, 200 blocks apart, so a transient oracle failure still gets two more chances before the market goes Invalid.",
  },
  {
    k: "03 · resolve",
    title: "HTTP → JQ → compare",
    body: "The Scheduler wakes onScheduledResolve. A TEE executor calls the HTTP precompile, jq extracts one uint256, and the comparator settles YES or NO.",
  },
  {
    k: "04 · settle",
    title: "Pari-mutuel, pull-based",
    body: "Winners claim stake × totalPool ÷ winningPool. No loop over participants. Empty winning side → Invalid so everyone refunds. Dust stays in contract by design.",
  },
] as const;

export default function Landing() {
  return (
    <>
      <WorkshopHero />

      {/* Workshop thesis */}
      <section className="mx-auto w-full max-w-3xl px-6 py-20">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">The thesis</p>
        <h2 className="mt-8 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-[color:var(--text-primary)] sm:text-4xl">
          Self-resolving markets.
          <span className="brand-text"> No keeper. No committee.</span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
          Create a binary market: a question, an oracle URL, a jq extraction rule, a target and comparator, and two
          deadlines. The chain does the rest. At a fixed block the Scheduler wakes the contract, a TEE executor fetches
          the URL, jq extracts one number, the comparator settles YES/NO — or every stake refunds if evidence fails.
        </p>

        <div className="surface mt-9 border-l-2 border-l-[color:var(--accent-soft)] p-6">
          <p className="text-base leading-relaxed text-[color:var(--text-secondary)]">
            This is a <span className="font-semibold text-[color:var(--text-primary)]">workshop demo</span>, not a
            production exchange. Markets are composition primitives — the same contract powers Oddsʼ survivor
            competitions by consuming finalized outcomes. The demo exists to show the pipeline end-to-end.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.k} className="surface p-7">
              <span className="font-mono text-xs text-[color:var(--state-open)]">{s.k}</span>
              <h3 className="mt-3 text-[17px] font-semibold text-[color:var(--text-primary)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{s.body}</p>
            </div>
          ))}
        </div>

        <Link
          href="/mechanics"
          className="mt-12 inline-flex min-h-11 items-center text-base text-[color:var(--text-secondary)] underline-offset-4 transition-colors hover:text-[color:var(--text-primary)] hover:underline"
        >
          Failure semantics, block-time notes, and what this demo does not claim →
        </Link>
      </section>

      {/* Execution infrastructure — addresses from lib/chain, never hardcoded here */}
      <section className="border-t border-[color:var(--hairline)]">
        <div className="mx-auto w-full max-w-3xl px-6 py-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Execution</p>
          <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
            <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-secondary)]">
              Scheduler {short(SCHEDULER)}
            </span>
            <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-secondary)]">
              RitualWallet {short(RITUAL_WALLET)}
            </span>
            <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-secondary)]">
              HTTP 0x0801 · JQ 0x0803
            </span>
            <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-secondary)]">
              Chain 1979
            </span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[color:var(--text-muted)]">
            Prepaid execution lives in RitualWallet under the market contractʼs address. Every scheduled callback draws
            from that balance. Top it up with <span className="font-mono">fundExecution(lockBlocks)</span> — anyone may
            fund.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[color:var(--hairline)]">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-balance text-2xl font-bold text-[color:var(--text-primary)]">
            Create → bet → watch it settle itself.
          </h2>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Needs a funded wallet on Ritual Chain. Chain is testnet; blocks are ~195 ms.
          </p>
          <Link href="/markets" className="btn-primary group mt-8 text-sm">
            Open the markets
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

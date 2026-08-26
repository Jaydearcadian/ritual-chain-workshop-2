import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/ConnectButton";
import Link from "next/link";
import WorkshopHero from "@/components/WorkshopHero";

export default function Landing() {
  return (
    <Providers>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
        <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-8 sm:pt-10">
          <p className="text-sm font-bold tracking-tight text-white">
            RitualPredict<span className="font-normal text-zinc-500"> · Workshop</span>
          </p>
          <div className="flex items-center gap-5">
            <Link href="/markets" className="hidden items-center text-xs text-slate-300 transition-colors hover:text-white sm:flex">
              Markets →
            </Link>
            <Link href="/mechanics" className="hidden text-xs text-zinc-500 hover:text-zinc-200 sm:inline">
              Mechanics
            </Link>
            <ConnectButton />
          </div>
        </header>

        <WorkshopHero />

        {/* Workshop thesis */}
        <section className="relative z-10 mx-auto w-full max-w-3xl px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia-400/80">The thesis</p>
          <h2 className="mt-8 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Self-resolving markets.
            <span className="brand-text"> No keeper. No committee.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Create a binary market: a question, an oracle URL, a jq extraction rule, a target and comparator, and two
            deadlines. The chain does the rest. At a fixed block the Scheduler wakes the contract, a TEE executor fetches
            the URL, jq extracts one number, the comparator settles YES/NO — or every stake refunds if evidence fails.
          </p>

          <div className="mt-9 rounded-2xl border border-fuchsia-500/20 bg-gradient-to-r from-violet-brand/10 to-transparent p-6">
            <p className="text-[15px] leading-relaxed text-slate-200">
              This is a <span className="font-semibold text-white">workshop demo</span>, not a production exchange.{" "}
              Markets are composition primitives — the same contract powers Oddsʼ survivor competitions by consuming
              finalized outcomes. The demo exists to show the pipeline end-to-end.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <div className="glass rounded-3xl p-7">
              <span className="font-mono text-xs text-fuchsia-400/80">01 · create</span>
              <h3 className="mt-3 font-semibold text-white">Fix the rule at birth</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Question, oracleUrl, jsonPath, target, comparator, bettingSeconds, resolveDelaySeconds — then
                closeBlock and resolveBlock are derived from blockTimeMs. No setter exists afterwards.
              </p>
            </div>
            <div className="glass rounded-3xl p-7">
              <span className="font-mono text-xs text-fuchsia-400/80">02 · schedule</span>
              <h3 className="mt-3 font-semibold text-white">Book the wake-up up front</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                One schedule() call: 3 executions, 200 blocks apart, TTL 150, 2M gas each. Cancel on success; exhaust
                into Invalid if all three fail. Seed re-rolls the TEE executor each attempt.
              </p>
            </div>
            <div className="glass rounded-3xl p-7">
              <span className="font-mono text-xs text-fuchsia-400/80">03 · observe</span>
              <h3 className="mt-3 font-semibold text-white">HTTP → JQ → compare</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Inside the scheduled transaction: HTTP precompile 0x0801 GETs the URL, jq 0x0803 extracts a uint256,
                comparator maps observed ⋈ target to YES/NO. A failed read is never a NO.
              </p>
            </div>
            <div className="glass rounded-3xl p-7">
              <span className="font-mono text-xs text-fuchsia-400/80">04 · settle</span>
              <h3 className="mt-3 font-semibold text-white">Pari-mutuel, pull-based</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Winners claim stake × totalPool ÷ winningPool. No loop over participants. Empty winning side → Invalid so
                everyone refunds. Dust stays in contract by design.
              </p>
            </div>
          </div>

          <Link href="/mechanics" className="mt-12 inline-block text-sm text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline">
            Failure semantics, block-time notes, and what this demo does not claim →
          </Link>
        </section>

        {/* Architecture note */}
        <section className="relative z-10 border-t border-white/5">
          <div className="mx-auto w-full max-w-3xl px-6 py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-500">Execution</p>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs">
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">Scheduler 0x56e7…D58B</span>
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">RitualWallet 0x532F…3948</span>
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">TEERegistry 0x9644…47F</span>
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">HTTP 0x0801 · JQ 0x0803</span>
              <span className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400">Chain 1979</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              Prepaid execution lives in RitualWallet under the market contractʼs address. Every scheduled callback draws
              from that balance. Top it up with fundExecution(lockBlocks) — anyone may fund.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="relative z-10 border-t border-white/5">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
            <h2 className="text-balance text-2xl font-bold text-white">Create → bet → watch it settle itself.</h2>
            <p className="mt-3 text-sm text-zinc-500">Needs a funded wallet on Ritual Chain. Chain is testnet; blocks are ~195 ms.</p>
            <Link
              href="/markets"
              className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-brand via-magenta-brand to-orange-brand px-9 text-sm font-semibold text-white shadow-[0_0_30px_rgba(236,72,153,0.35)] transition-shadow duration-300 hover:shadow-[0_0_50px_rgba(236,72,153,0.55)]"
            >
              Open the markets
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </section>

        <footer className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 pb-10">
          <p className="text-[11px] text-zinc-600">Ritual Chain · Testnet · Chain ID 1979</p>
          <Link href="/mechanics" className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
            Mechanics →
          </Link>
        </footer>
      </div>
    </Providers>
  );
}

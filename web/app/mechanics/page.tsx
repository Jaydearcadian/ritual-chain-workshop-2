import Link from "next/link";

export const metadata = { title: "Mechanics — RitualPredict Workshop" };

const FAILURES = [
  { f: "HTTP precompile fails / non-200 / empty body", b: "Caught as failure — never a NO. Attempt counter incremented; retry on next scheduled execution." },
  { f: "errorMessage in HTTP envelope", b: "Failure. Surfaced as ResolutionFailed reason; still retriable." },
  { f: "jq extraction fails (bad path / non-uint)", b: "Failure. Same retry path." },
  { f: "Malformed HTTP envelope bytes", b: "External try/catch — caught as 'decode failed', not a revert (so attempts increment)." },
  { f: "No executor available (seed finds no capability)", b: "Failure: 'no executor available'." },
  { f: "All 3 attempts fail", b: "Market → Invalid. Every stake is refundable via claimRefund. Scheduler remainder harmless (idempotent)." },
  { f: "Winning pool empty (nobody backed correct side)", b: "Outcome recorded, but market → Invalid so everyone refunds. Pari-mutuel has no denominator otherwise." },
  { f: "Duplicate onScheduledResolve (leftover execution)", b: "Early return if Resolved/Invalid — idempotent, no double settlement." },
  { f: "Bet after closeBlock", b: "Reverts BettingClosed. View also flips Open→Closed at closeBlock, so UI and lock agree." },
] as const;

export default function Mechanics() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 pt-8 sm:pt-10">
        <Link href="/" className="text-xs text-zinc-500 transition-colors hover:text-zinc-200">
          ← Workshop
        </Link>
        <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-600">Mechanics</p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-14">
        <h1 className="text-balance text-3xl font-medium tracking-tight text-zinc-50">How RitualPredict actually works</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
          The detail the landing leaves out — including where this workshop demo is still unproven.
        </p>

        <section className="mt-14 border-t border-zinc-900 pt-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-600">Resolution pipeline</p>
          <h2 className="mt-4 text-xl font-medium text-zinc-100">One scheduled transaction, no keeper</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            At creation each market fixes six things immutably: <span className="text-zinc-200">question, oracleUrl, jsonPath, target, comparator, closeBlock, resolveBlock</span>. There is no setter. The Scheduler
            is booked in the same transaction: <span className="font-mono text-zinc-200">schedule(callId, resolveBlock, 3× 200 blocks, 2M gas)</span>.
          </p>
          <div className="mt-6 rounded-2xl border border-zinc-900 bg-white/[0.02] p-5 font-mono text-xs leading-relaxed text-zinc-400">
            <p>createMarket(NewMarket) → _secondsToBlocks → closeBlock, resolveBlock</p>
            <p className="mt-2">schedule(resolver = abi.encodeCall(onScheduledResolve, marketId), at: resolveBlock, numCalls: 3, frequency: 200)</p>
            <p className="mt-2">onScheduledResolve(executionIndex, marketId) — scheduler-only, idempotent:</p>
            <p className="ml-4">pickServiceByCapability(HTTP_CALL, true, seed, 8) → executor</p>
            <p className="ml-4">HTTP 0x0801 GET oracleUrl (TEE) → jq 0x0803 jsonPath → uint256 observed</p>
            <p className="ml-4">observed ⋈ target → Resolved(YES/NO) + cancel(scheduleId) ·or· fail → Invalid after 3</p>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            <span className="font-mono text-sm text-zinc-300">R(F) ∈ &#123;YES, NO, INVALID&#125;</span> — INVALID is a real terminal state, not a missing outcome.
          </p>
        </section>

        <section className="mt-14 border-t border-zinc-900 pt-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-600">Failure semantics</p>
          <h2 className="mt-4 text-xl font-medium text-zinc-100">A failed oracle read is never a NO</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
            Every failure mode has specified behavior. INVALID exists so an outage canʼt masquerade as a forecast.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-zinc-900">
            {FAILURES.map((row) => (
              <div key={row.f} className="grid grid-cols-1 gap-1 border-b border-zinc-900 px-5 py-3.5 last:border-b-0 sm:grid-cols-[1fr_1.2fr] sm:gap-4">
                <span className="text-sm font-medium text-zinc-200">{row.f}</span>
                <span className="text-sm leading-relaxed text-zinc-400">{row.b}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-900 pt-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-600">Deadlines &amp; time</p>
          <h2 className="mt-4 text-xl font-medium text-zinc-100">Blocks, not timestamps</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-zinc-400">
            <p>
              Deadlines are <span className="text-zinc-200">block numbers</span>. The Scheduler fires at a block, so betting also closes at a block
              — “betting is closed” and “the Scheduler woke us” can never disagree. Human seconds are converted via{" "}
              <span className="font-mono text-zinc-200">blockTimeMs</span>, measured from the live chain at deploy and immutable afterwards.
            </p>
            <p>
              On Ritual Chain <span className="font-mono text-zinc-200">block.timestamp is Unix milliseconds</span> (~1.786e12), not seconds — verified
              against the live chain. The contract avoids it entirely.
            </p>
            <p>Measured block time was ~195 ms when this was written; re-measure with <span className="font-mono text-zinc-300">npx hardhat run scripts/block-time.ts</span>.</p>
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-900 pt-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-600">Payouts</p>
          <h2 className="mt-4 text-xl font-medium text-zinc-100">Pari-mutuel, pull-based, loop-free</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-zinc-400">
            <p>
              <span className="font-mono text-zinc-200">claimWinnings</span> pays{" "}
              <span className="font-mono text-zinc-200">stake × totalPool ÷ winningPool</span> for the caller only. No loop over participants. Integer division
              leaves sub-wei dust in the contract — deliberate.
            </p>
            <p>
              <span className="font-mono text-zinc-200">claimRefund</span> returns the original stake from an Invalid market.
            </p>
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-900 pt-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-600">What we are not claiming</p>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-zinc-400">
            <p>
              This is a workshop contract on <span className="text-zinc-200">testnet</span>. Live Scheduler/HTTP settlement requires a funded RitualWallet
              balance, a public oracle URL (tunnelled — TEE executors canʼt reach localhost), and registered HTTP executors.
            </p>
            <p>
              Ritualʼs TEE attestation is trusted infrastructure; this design scopes it but does not eliminate trust.
            </p>
            <p>
              Evidence maturity: 33 Solidity + local EDR tests pass; live testnet validation is pending while the faucet/RPC endpoint is intermittently
              available. Nothing here claims live operation until receipts exist.
            </p>
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-3 border-t border-zinc-900 pt-8">
          <Link href="/markets" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-brand via-magenta-brand to-orange-brand px-7 text-sm font-semibold text-white">
            Open the markets <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-full border border-zinc-800 px-7 text-sm text-zinc-300 hover:text-white">
            Back to workshop
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10">
        <p className="border-t border-zinc-900 pt-4 text-xs text-zinc-500">RitualPredict Workshop · Ritual Chain 1979 · Testnet</p>
      </footer>
    </div>
  );
}

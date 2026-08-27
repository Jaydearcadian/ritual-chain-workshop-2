import type { Metadata } from "next";
import Link from "next/link";
import { LifecycleRail } from "@/components/LifecycleRail";

export const metadata: Metadata = { title: "Mechanics" };

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
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-10">
      <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Odds · Mechanics</p>
      <h1 className="mt-4 font-display text-balance text-4xl font-semibold uppercase tracking-[0.01em] text-[color:var(--text-primary)]">
        How Odds settles
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
        The detail the landing leaves out — the RitualPredict primitive under every Odds round, including where this
        testnet demo is still unproven.
      </p>

      {/* The lifecycle, annotated — the one visual center of this page too */}
      <section aria-labelledby="lifecycle-heading" className="surface mt-10 p-7">
        <h2 id="lifecycle-heading" className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
          The lifecycle, annotated
        </h2>
        <div className="mt-6">
          <LifecycleRail state={2} showInvalidBranch pulse={false} />
        </div>
        <p className="mt-5 text-base leading-relaxed text-[color:var(--text-secondary)]">
          Resolving fans out to two terminals. <span style={{ color: "var(--state-resolved)" }}>Resolved</span> means the
          comparator decided from real evidence; <span style={{ color: "var(--state-invalid)" }}>Invalid</span> means the
          evidence never arrived — oracle failure, exhausted attempts, or an empty winning side. Invalid is a refund, and
          it is never recorded as NO. A failed oracle can never make YES stakers lose.
        </p>
      </section>

      <section aria-labelledby="pipeline-heading" className="mt-14 border-t border-[color:var(--hairline)] pt-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Resolution pipeline</p>
        <h2 id="pipeline-heading" className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">
          One scheduled transaction, no keeper
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
          At creation each market fixes six things immutably:{" "}
          <span className="text-[color:var(--text-primary)]">
            question, oracleUrl, jsonPath, target, comparator, closeBlock, resolveBlock
          </span>
          . There is no setter. The Scheduler is booked in the same transaction:{" "}
          <span className="font-mono text-[color:var(--text-primary)]">
            schedule(callId, resolveBlock, 3× 200 blocks, 2M gas)
          </span>
          .
        </p>
        <div className="surface-inset mt-6 p-5 font-mono text-xs leading-relaxed text-[color:var(--text-secondary)]">
          <p>createMarket(NewMarket) → _secondsToBlocks → closeBlock, resolveBlock</p>
          <p className="mt-2">
            schedule(resolver = abi.encodeCall(onScheduledResolve, marketId), at: resolveBlock, numCalls: 3, frequency: 200)
          </p>
          <p className="mt-2">onScheduledResolve(executionIndex, marketId) — scheduler-only, idempotent:</p>
          <p className="ml-4">pickServiceByCapability(HTTP_CALL, true, seed, 8) → executor</p>
          <p className="ml-4">HTTP 0x0801 GET oracleUrl (TEE) → jq 0x0803 jsonPath → uint256 observed</p>
          <p className="ml-4">observed ⋈ target → Resolved(YES/NO) + cancel(scheduleId) ·or· fail → Invalid after 3</p>
        </div>
      </section>


      <section aria-labelledby="failure-heading" className="mt-14 border-t border-[color:var(--hairline)] pt-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Failure semantics</p>
        <h2 id="failure-heading" className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">
          Every failure path lands on Invalid — never on NO
        </h2>
        <dl className="mt-6 grid gap-3">
          {FAILURES.map((x) => (
            <div key={x.f} className="surface-inset p-5">
              <dt className="text-sm font-semibold text-[color:var(--text-primary)]">{x.f}</dt>
              <dd className="mt-2 text-base leading-relaxed text-[color:var(--text-secondary)]">{x.b}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="blocktime-heading" className="mt-14 border-t border-[color:var(--hairline)] pt-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Block time</p>
        <h2 id="blocktime-heading" className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">
          Blocks, not timestamps
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
          <p>
            The Scheduler fires at a block, so betting also closes at a block — “betting is closed” and “the Scheduler
            woke us” can never disagree. Human seconds are converted via{" "}
            <span className="font-mono text-[color:var(--text-primary)]">blockTimeMs</span>, measured from the live chain
            at deploy and immutable afterwards.
          </p>
          <p>
            On Ritual Chain{" "}
            <span className="font-mono text-[color:var(--text-primary)]">block.timestamp is Unix milliseconds</span>{" "}
            (~1.786e12), not seconds — verified against the live chain. The contract avoids it entirely.
          </p>
          <p>
            Measured block time was ~195 ms when this was written; re-measure with{" "}
            <span className="font-mono text-[color:var(--text-primary)]">npx hardhat run scripts/block-time.ts</span>.
          </p>
        </div>
      </section>

      <section aria-labelledby="payouts-heading" className="mt-14 border-t border-[color:var(--hairline)] pt-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Payouts</p>
        <h2 id="payouts-heading" className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">
          Pari-mutuel, pull-based, loop-free
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
          <p>
            <span className="font-mono text-[color:var(--text-primary)]">claimWinnings</span> pays{" "}
            <span className="font-mono text-[color:var(--text-primary)]">stake × totalPool ÷ winningPool</span> for the
            caller only. No loop over participants. Integer division leaves sub-wei dust in the contract — deliberate.
          </p>
          <p>
            <span className="font-mono text-[color:var(--text-primary)]">claimRefund</span> returns the original stake
            from an Invalid market.
          </p>
        </div>
      </section>

      <section aria-labelledby="claims-heading" className="mt-14 border-t border-[color:var(--hairline)] pt-10">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">What we are not claiming</p>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
          <p>
            This is a workshop contract on <span className="text-[color:var(--text-primary)]">testnet</span>. Live
            Scheduler/HTTP settlement requires a funded RitualWallet balance, a public oracle URL (tunnelled — TEE
            executors canʼt reach localhost), and registered HTTP executors.
          </p>
          <p>Ritualʼs TEE attestation is trusted infrastructure; this design scopes it but does not eliminate trust.</p>
          <p>
            Evidence maturity: 33 Solidity + local EDR tests pass; live testnet validation is pending while the faucet/RPC
            endpoint is intermittently available. Nothing here claims live operation until receipts exist.
          </p>
        </div>
      </section>

      <div className="mt-16 flex flex-wrap gap-3 border-t border-[color:var(--hairline)] pt-8">
        <Link href="/markets" className="btn-primary group text-sm">
          Go to the markets{" "}
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </Link>
        <Link href="/" className="btn-secondary text-sm">
          Back to Odds
        </Link>
      </div>
    </div>
  );
}

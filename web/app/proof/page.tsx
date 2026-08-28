import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Proof" };

const checks = [
  ["Fork lineage", "Verified", "GitHub API: fork=true, parent=cozfuttu/ritual-chain-workshop-2, public."],
  ["Contract execution", "Local", "Hardhat EDR / hardhatMainnet network."],
  ["Test suite", "26 passing", "Counter, lifecycle, mocked precompile, payout, retry, and invalidation coverage."],
  ["Frontend", "Build verified", "TypeScript, Next production build, and route smoke checks pass."],
  ["Live Ritual receipts", "Pending", "Not required for this workshop submission; no live receipt is claimed."],
] as const;

export default function ProofPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20 pt-12 sm:pt-16">
      <p className="eyebrow">Odds · Evidence</p>
      <h1 className="mt-5 font-display text-5xl font-semibold uppercase leading-none text-[color:var(--ink)] sm:text-7xl">Proof of building</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--ink-secondary)]">
        The canonical Odds implementation lives in this fork. The evidence below separates what is locally proven from what is intentionally not claimed.
      </p>

      <section className="mt-12" aria-labelledby="checks-heading">
        <h2 id="checks-heading" className="sr-only">Evidence checks</h2>
        <dl className="divide-y border-y border-[color:var(--hairline)]">
          {checks.map(([name, status, detail]) => (
            <div key={name} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:gap-8">
              <div><dt className="text-base font-semibold text-[color:var(--ink)]">{name}</dt><dd className="mt-1 text-sm leading-relaxed text-[color:var(--ink-secondary)]">{detail}</dd></div>
              <dd className="font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--ink-muted)] sm:text-right">{status}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14 border-t border-[color:var(--hairline)] pt-10" aria-labelledby="reproduce-heading">
        <p className="eyebrow">Reproduce locally</p>
        <h2 id="reproduce-heading" className="mt-4 font-display text-3xl font-semibold uppercase text-[color:var(--ink)]">Two commands, no chain required</h2>
        <pre className="mt-6 overflow-x-auto bg-[color:var(--ink)] p-5 font-mono text-sm leading-relaxed text-[color:var(--canvas)]"><code>{`cd hardhat\nnpm install\nnpx hardhat test`}</code></pre>
        <p className="mt-5 text-base leading-relaxed text-[color:var(--ink-secondary)]">The test suite uses local EDR plus mocked system contracts at the canonical addresses. That proves contract behavior without pretending to have a live Ritual transaction receipt.</p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/about" className="btn-primary text-sm">Read the thesis <span aria-hidden>→</span></Link>
        <Link href="/mechanics" className="btn-secondary text-sm">Mechanics</Link>
      </div>
    </div>
  );
}

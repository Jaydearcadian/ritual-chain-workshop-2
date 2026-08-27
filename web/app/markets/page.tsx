import type { Metadata } from "next";
import { ChainGuard } from "@/components/ChainGuard";
import MarketsClient from "@/components/MarketsClient";

export const metadata: Metadata = { title: "Markets" };

export default function MarketsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 pt-10">
      <div className="pb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--text-muted)]">Markets · Ritual 1979</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--text-primary)]">Markets</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[color:var(--text-secondary)]">
          Create a market, stake YES or NO while it is Open, then watch the Scheduler settle it. All reads come from{" "}
          <span className="font-mono text-[color:var(--text-primary)]">getMarkets()</span> — newest first, refreshed
          every 6s. Nothing here is simulated: if no contract is bound, the UI says so.
        </p>
      </div>
      <ChainGuard>
        <MarketsClient />
      </ChainGuard>
    </div>
  );
}

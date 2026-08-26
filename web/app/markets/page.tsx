import { Providers } from "@/lib/providers";
import { ChainGuard } from "@/components/ChainGuard";
import { ConnectButton } from "@/components/ConnectButton";
import MarketsClient from "@/components/MarketsClient";
import Link from "next/link";

export default function MarketsPage() {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 pb-4 pt-8 sm:pt-10">
          <Link href="/" className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-200">
            ← Workshop
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600 sm:inline">Markets · Ritual 1979</span>
            <ConnectButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16">
          <div className="pb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Markets</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Create a market, stake YES or NO while it is Open, then watch the Scheduler settle it. All reads from{" "}
              <span className="font-mono text-zinc-300">getMarkets()</span> — newest first.
            </p>
          </div>
          <ChainGuard>
            <MarketsClient />
          </ChainGuard>
        </main>

        <footer className="mx-auto w-full max-w-3xl px-6 pb-8">
          <p className="border-t border-zinc-900 pt-4 text-center text-xs text-zinc-500">
            RitualPredict · pull-based claims · Invalid never counts as NO
          </p>
        </footer>
      </div>
    </Providers>
  );
}

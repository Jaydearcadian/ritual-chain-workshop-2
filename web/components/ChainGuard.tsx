"use client";
import { useAccount, useSwitchChain } from "wagmi";
import { ritualChain } from "@/lib/chain";

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  if (isConnected && chain?.id !== ritualChain.id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-zinc-400">Connected to the wrong network.</p>
        <button
          type="button"
          onClick={() => switchChain({ chainId: ritualChain.id })}
          disabled={isPending}
          className="mt-5 rounded-full border border-zinc-100 bg-zinc-50 px-6 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-40"
        >
          {isPending ? "Switching…" : "Switch to Ritual Chain"}
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

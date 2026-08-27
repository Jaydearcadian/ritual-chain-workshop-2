"use client";
import { useAccount, useSwitchChain } from "wagmi";
import { ritualChain } from "@/lib/chain";

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chain?.id !== ritualChain.id) {
    return (
      <div className="surface flex flex-col items-center justify-center px-6 py-24 text-center" role="alert">
        <p className="text-base text-[color:var(--text-secondary)]">
          Connected to the wrong network (chain {chain?.id ?? "unknown"}).
        </p>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">This workshop dApp only reads and writes on Ritual Chain.</p>
        <button
          type="button"
          onClick={() => switchChain({ chainId: ritualChain.id })}
          disabled={isPending}
          className="btn-primary mt-6 text-sm"
        >
          {isPending ? "Switching…" : "Switch to Ritual Chain"}
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

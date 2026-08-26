"use client";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  if (isConnected) {
    return (
      <span className="rounded-full border border-zinc-800 px-4 py-1.5 font-mono text-xs text-zinc-400">
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => connect({ connector: injected() })}
      className="rounded-full bg-gradient-to-r from-violet-brand via-magenta-brand to-orange-brand px-5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-shadow duration-300 hover:shadow-[0_0_35px_rgba(236,72,153,0.5)]"
    >
      Connect wallet
    </button>
  );
}

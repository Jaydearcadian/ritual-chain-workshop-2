"use client";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();

  if (isConnected) {
    return (
      <span
        className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--hairline)] px-4 font-mono text-xs text-[color:var(--text-secondary)]"
        aria-label={`Connected wallet ${address}`}
      >
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="btn-primary !min-h-11 !px-5 text-xs"
    >
      {isPending ? "Connecting…" : "Connect wallet"}
    </button>
  );
}

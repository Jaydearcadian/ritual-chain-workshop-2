"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useBlockNumber, useReadContract, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { predictAbi } from "@/lib/predict-abi";
import { PREDICT_ADDRESS, ritualChain } from "@/lib/chain";
import { COMPARATOR_LABELS, COMPARATOR_SYMBOLS, MARKET_STATE_LABELS, OUTCOME_LABELS, DEMO_PRESET } from "@/lib/presets";

type Market = {
  id: bigint;
  creator: `0x${string}`;
  question: string;
  oracleUrl: string;
  jsonPath: string;
  target: bigint;
  comparator: number;
  closeBlock: bigint;
  resolveBlock: bigint;
  scheduleId: bigint;
  totalYes: bigint;
  totalNo: bigint;
  state: number;
  outcome: number;
  attempts: number;
  observedValue: bigint;
  invalidReason: string;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;
const isConfigured = PREDICT_ADDRESS !== ZERO;

function useMarkets() {
  const { data, refetch, isLoading, error } = useReadContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "getMarkets",
    query: { enabled: isConfigured, refetchInterval: 6000 },
  });
  return { markets: (data as Market[] | undefined) ?? null, refetch, isLoading, error };
}

export default function MarketsClient() {
  const { markets, refetch, isLoading } = useMarkets();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: executionBalance } = useReadContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "executionBalance",
    query: { enabled: isConfigured, refetchInterval: 8000 },
  });

  return (
    <div className="space-y-8">
      {/* execution funding strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Execution balance</span>
          <span className="font-mono text-sm text-white">{executionBalance !== undefined ? `${formatEther(executionBalance as bigint)} RITUAL` : "—"}</span>
          {executionBalance === 0n && isConfigured && <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300">Top up before resolution can fire</span>}
        </div>
        <span className="font-mono text-xs text-zinc-500">chain 1979 · block {blockNumber ? Number(blockNumber).toString() : "—"}</span>
      </div>

      {!isConfigured ? (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
          <p className="text-sm font-medium text-amber-200">No contract bound</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-400">Set NEXT_PUBLIC_PREDICT_ADDRESS in web/.env.local and restart dev. See web/README.</p>
          <p className="mt-3 font-mono text-xs text-zinc-500">NEXT_PUBLIC_PREDICT_ADDRESS=0x… · NEXT_PUBLIC_DEMO_ORACLE_URL=https://&lt;tunnel&gt;/api/oracle/eth</p>
        </div>
      ) : (
        <>
          <CreateForm onCreated={() => refetch()} />
          <FundForm onFunded={() => refetch()} />

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-white">Markets</h2>
              <button type="button" onClick={() => refetch()} className="text-xs text-zinc-400 hover:text-white transition-colors">
                Refresh ↻
              </button>
            </div>
            {isLoading && <p className="mt-4 text-sm text-zinc-500">Loading…</p>}
            {markets && markets.length === 0 && <p className="mt-4 text-sm text-zinc-500">No markets yet. Create the first one above.</p>}
            {markets && markets.length > 0 && (
              <div className="mt-4 grid gap-4">
                {markets.map((m) => (
                  <MarketCard key={String(m.id)} market={m} currentBlock={blockNumber ? Number(blockNumber) : null} onAction={() => refetch()} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: DEMO_PRESET.question,
    oracleUrl: DEMO_PRESET.oracleUrl,
    jsonPath: DEMO_PRESET.jsonPath,
    target: DEMO_PRESET.target,
    comparator: String(DEMO_PRESET.comparator),
    bettingSeconds: DEMO_PRESET.bettingSeconds,
    resolveDelaySeconds: DEMO_PRESET.resolveDelaySeconds,
  });

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const hash = await writeContractAsync({
        address: PREDICT_ADDRESS,
        abi: predictAbi,
        functionName: "createMarket",
        args: [
          {
            question: form.question,
            oracleUrl: form.oracleUrl,
            jsonPath: form.jsonPath,
            target: BigInt(form.target),
            comparator: Number(form.comparator),
            bettingSeconds: BigInt(form.bettingSeconds),
            resolveDelaySeconds: BigInt(form.resolveDelaySeconds),
          },
        ],
        chainId: ritualChain.id,
      });
      console.log("createMarket tx", hash);
      setTimeout(onCreated, 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message.slice(0, 400) : String(e));
    } finally {
      setBusy(false);
    }
  }

  function upd(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-200">Create market</h3>
        <button
          type="button"
          onClick={() => setForm({ question: DEMO_PRESET.question, oracleUrl: DEMO_PRESET.oracleUrl, jsonPath: DEMO_PRESET.jsonPath, target: DEMO_PRESET.target, comparator: String(DEMO_PRESET.comparator), bettingSeconds: DEMO_PRESET.bettingSeconds, resolveDelaySeconds: DEMO_PRESET.resolveDelaySeconds })}
          className="text-xs text-zinc-500 hover:text-zinc-200"
        >
          Fill demo preset
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Question" value={form.question} onChange={(v) => upd("question", v)} placeholder="Will BTC/USD be >= ..." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Oracle URL (https, public)" value={form.oracleUrl} onChange={(v) => upd("oracleUrl", v)} placeholder="https://<tunnel>/api/oracle/eth" />
          <Field label="jq path" value={form.jsonPath} onChange={(v) => upd("jsonPath", v)} placeholder=".price" mono />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Target (uint256)" value={form.target} onChange={(v) => upd("target", v)} mono />
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-zinc-500">Comparator</span>
            <select value={form.comparator} onChange={(e) => upd("comparator", e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-fuchsia-500/40 focus:outline-none">
              {COMPARATOR_LABELS.map((l, idx) => (
                <option key={l} value={String(idx)}>
                  {l} ({COMPARATOR_SYMBOLS[idx]})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Betting (s)" value={form.bettingSeconds} onChange={(v) => upd("bettingSeconds", v)} mono />
            <Field label="Resolve delay (s)" value={form.resolveDelaySeconds} onChange={(v) => upd("resolveDelaySeconds", v)} mono />
          </div>
        </div>
      </div>

      {err && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-200 break-all">{err}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-brand via-magenta-brand to-orange-brand px-7 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-opacity hover:shadow-[0_0_30px_rgba(236,72,153,0.45)] disabled:opacity-40"
      >
        {busy ? "Creating…" : "Create market"}
      </button>
      <p className="mt-3 text-xs text-zinc-500">Min betting 30s, min resolve delay 15s, total ≤ 1 day. Resolve needs prepaid execution balance.</p>
    </div>
  );
}

function FundForm({ onFunded }: { onFunded: () => void }) {
  const { writeContractAsync } = useWriteContract();
  const [amount, setAmount] = useState("0.05");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function fund() {
    setBusy(true);
    setErr(null);
    try {
      const hash = await writeContractAsync({
        address: PREDICT_ADDRESS,
        abi: predictAbi,
        functionName: "fundExecution",
        args: [500000n],
        value: parseEther(amount || "0"),
        chainId: ritualChain.id,
      });
      console.log("fundExecution", hash);
      setTimeout(onFunded, 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message.slice(0, 400) : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <span className="text-xs font-medium text-zinc-300">Fund execution</span>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-sm text-white" placeholder="0.05" />
      <span className="text-xs text-zinc-500">RITUAL</span>
      <button type="button" onClick={fund} disabled={busy} className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-40">
        {busy ? "Funding…" : "Deposit"}
      </button>
      {err && <span className="text-xs text-red-300 break-all">{err}</span>}
    </div>
  );
}

function MarketCard({ market, currentBlock, onAction }: { market: Market; currentBlock: number | null; onAction: () => void }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("0.01");

  const { data: stakes } = useReadContract({
    address: PREDICT_ADDRESS,
    abi: predictAbi,
    functionName: "stakesOf",
    args: address ? [market.id, address] : undefined,
    query: { enabled: !!address },
  });

  const stateLabel = MARKET_STATE_LABELS[market.state] ?? String(market.state);
  const outcomeLabel = OUTCOME_LABELS[market.outcome] ?? String(market.outcome);
  const pool = market.totalYes + market.totalNo;
  const yesPct = pool === 0n ? 50 : Number((market.totalYes * 10000n) / pool) / 100;

  const closesIn = useMemo(() => {
    if (currentBlock == null) return null;
    const diff = Number(market.closeBlock) - currentBlock;
    return diff <= 0 ? "closed" : `${diff} blocks`;
  }, [currentBlock, market.closeBlock]);

  const resolvesIn = useMemo(() => {
    if (currentBlock == null) return null;
    const diff = Number(market.resolveBlock) - currentBlock;
    return diff <= 0 ? "due" : `${diff} blocks`;
  }, [currentBlock, market.resolveBlock]);

  async function act(name: string, fn: () => Promise<unknown>) {
    setBusy(name);
    setErr(null);
    try {
      const r = await fn();
      console.log(name, r);
      setTimeout(onAction, 1200);
    } catch (e) {
      setErr(e instanceof Error ? e.message.slice(0, 500) : String(e));
    } finally {
      setBusy(null);
    }
  }

  const st = stakes as unknown as [bigint, bigint, boolean, bigint] | undefined;
  const myYes = st?.[0];
  const myNo = st?.[1];
  const settled = st?.[2];
  const claimable = st?.[3];

  const canBet = market.state === 0; // Open
  const canClaimWinnings = market.state === 3 && claimable !== undefined && claimable > 0n && !settled;
  const canRefund = market.state === 4 && claimable !== undefined && claimable > 0n && !settled;

  const stateTone =
    market.state === 3
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : market.state === 4
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : market.state === 0
          ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
          : "border-zinc-700 bg-zinc-800 text-zinc-300";

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-zinc-500">#{String(market.id)} · schedule {String(market.scheduleId) || "—"}</p>
          <h3 className="mt-2 max-w-xl text-base font-semibold leading-snug text-white">{market.question}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${stateTone}`}>{stateLabel}</span>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 font-mono text-xs text-zinc-400">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>rule: observed {COMPARATOR_SYMBOLS[market.comparator] ?? "?"} {String(market.target)}</span>
          <span className="text-zinc-600">·</span>
          <span className="break-all">oracle {market.oracleUrl}</span>
          <span className="text-zinc-600">·</span>
          <span>jq {market.jsonPath}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500">
          <span>close block {String(market.closeBlock)} ({closesIn ?? "—"})</span>
          <span>resolve block {String(market.resolveBlock)} ({resolvesIn ?? "—"})</span>
          <span>attempts {String(market.attempts)}/3</span>
        </div>
        {market.state >= 3 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className={market.state === 3 ? "text-emerald-300" : "text-amber-300"}>outcome {outcomeLabel}</span>
            {market.observedValue !== 0n && <span>observed {String(market.observedValue)}</span>}
            {market.invalidReason && <span className="text-amber-300">reason: {market.invalidReason}</span>}
          </div>
        )}
      </div>

      {/* pool bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>YES {formatEther(market.totalYes)} RITUAL</span>
          <span>NO {formatEther(market.totalNo)} RITUAL</span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="bg-gradient-to-r from-violet-brand to-magenta-brand transition-all duration-700" style={{ width: `${yesPct}%` }} />
          <div className="flex-1 bg-zinc-700/50" />
        </div>
        <p className="mt-2 text-xs text-zinc-500">{pool === 0n ? "No bets yet" : `Total ${formatEther(pool)} RITUAL · YES ${yesPct.toFixed(1)}%`}</p>
      </div>

      {address && st && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-zinc-400">
            your YES {formatEther(myYes ?? 0n)} · NO {formatEther(myNo ?? 0n)}
          </span>
          {settled && <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-zinc-400">settled</span>}
          {claimable !== undefined && claimable > 0n && !settled && <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">claimable {formatEther(claimable)} RITUAL</span>}
        </div>
      )}

      {/* actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canBet ? (
          <>
            <input value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-24 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 font-mono text-sm text-white" placeholder="0.01" />
            <button type="button" disabled={!!busy} onClick={() => act("yes", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "bet", args: [market.id, true], value: parseEther(betAmount || "0"), chainId: ritualChain.id }))} className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40">
              {busy === "yes" ? "…" : "Bet YES"}
            </button>
            <button type="button" disabled={!!busy} onClick={() => act("no", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "bet", args: [market.id, false], value: parseEther(betAmount || "0"), chainId: ritualChain.id }))} className="rounded-full bg-zinc-700 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-600 disabled:opacity-40">
              {busy === "no" ? "…" : "Bet NO"}
            </button>
          </>
        ) : (
          <span className="text-xs text-zinc-500">{market.state === 0 ? "Betting open" : market.state === 3 || market.state === 4 ? "Market settled" : "Betting closed — awaiting Scheduler"}</span>
        )}

        {canClaimWinnings && (
          <button type="button" disabled={!!busy} onClick={() => act("claim", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimWinnings", args: [market.id], chainId: ritualChain.id }))} className="rounded-full bg-gradient-to-r from-violet-brand to-magenta-brand px-5 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {busy === "claim" ? "…" : "Claim winnings"}
          </button>
        )}
        {canRefund && (
          <button type="button" disabled={!!busy} onClick={() => act("refund", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimRefund", args: [market.id], chainId: ritualChain.id }))} className="rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-40">
            {busy === "refund" ? "…" : "Claim refund"}
          </button>
        )}
      </div>

      {err && <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs leading-relaxed text-red-200 break-all">{err}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-fuchsia-500/40 focus:outline-none ${mono ? "font-mono" : ""}`} />
    </label>
  );
}

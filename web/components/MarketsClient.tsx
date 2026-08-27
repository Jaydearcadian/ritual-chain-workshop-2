"use client";

import { useId, useMemo, useState } from "react";
import { useAccount, useBlockNumber, useReadContract, useWriteContract } from "wagmi";
import { formatEther, parseEther } from "viem";
import { predictAbi } from "@/lib/predict-abi";
import { PREDICT_ADDRESS, ritualChain } from "@/lib/chain";
import { COMPARATOR_LABELS, COMPARATOR_SYMBOLS, OUTCOME_LABELS, DEMO_PRESET } from "@/lib/presets";
import { LifecycleRail, stateLabelOf } from "@/components/LifecycleRail";

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
      <div className="surface-inset flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Execution balance</span>
          <span className="font-mono text-sm text-[color:var(--text-primary)]">
            {executionBalance !== undefined ? `${formatEther(executionBalance as bigint)} RITUAL` : "—"}
          </span>
          {executionBalance === 0n && isConfigured && (
            <span
              className="rounded-full px-2.5 py-1 text-xs"
              style={{ background: "rgba(251,191,36,0.12)", color: "var(--warn)" }}
              role="status"
            >
              Top up before resolution can fire
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-[color:var(--text-muted)]">
          chain 1979 · block {blockNumber ? Number(blockNumber).toString() : "—"}
        </span>
      </div>

      {!isConfigured ? (
        <div
          className="rounded-3xl p-8 text-center"
          style={{ border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.05)" }}
          role="status"
        >
          <p className="text-base font-medium" style={{ color: "var(--warn)" }}>
            No contract bound
          </p>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[color:var(--text-secondary)]">
            Set <span className="font-mono">NEXT_PUBLIC_PREDICT_ADDRESS</span> in web/.env.local and restart dev. See
            web/README. Until then there is nothing to read — this UI never fakes chain data.
          </p>
          <p className="mt-3 font-mono text-xs text-[color:var(--text-muted)]">
            NEXT_PUBLIC_PREDICT_ADDRESS=0x… · NEXT_PUBLIC_DEMO_ORACLE_URL=https://&lt;tunnel&gt;/api/oracle/eth
          </p>
        </div>
      ) : (
        <>
          <CreateForm onCreated={() => refetch()} />
          <FundForm onFunded={() => refetch()} />

          <section aria-labelledby="markets-heading">
            <div className="flex items-baseline justify-between">
              <h2 id="markets-heading" className="text-xl font-semibold text-[color:var(--text-primary)]">
                Markets
              </h2>
              <button type="button" onClick={() => refetch()} className="btn-quiet text-xs">
                Refresh ↻
              </button>
            </div>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]" aria-live="polite">
              {isLoading
                ? "Loading markets from getMarkets()…"
                : markets && markets.length === 0
                  ? "No markets yet. Create the first one above."
                  : markets
                    ? `${markets.length} market${markets.length === 1 ? "" : "s"} on chain`
                    : ""}
            </p>
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
    <section aria-labelledby="create-heading" className="surface p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="create-heading" className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--text-primary)]">
          Create market
        </h2>
        <button
          type="button"
          onClick={() => setForm({ question: DEMO_PRESET.question, oracleUrl: DEMO_PRESET.oracleUrl, jsonPath: DEMO_PRESET.jsonPath, target: DEMO_PRESET.target, comparator: String(DEMO_PRESET.comparator), bettingSeconds: DEMO_PRESET.bettingSeconds, resolveDelaySeconds: DEMO_PRESET.resolveDelaySeconds })}
          className="btn-quiet text-xs"
        >
          Fill demo preset
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <Field label="Question" value={form.question} onChange={(v) => upd("question", v)} placeholder="Will BTC/USD be >= ..." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Oracle URL (https, public)" value={form.oracleUrl} onChange={(v) => upd("oracleUrl", v)} placeholder="https://<tunnel>/api/oracle/eth" mono />
          <Field label="jq path" value={form.jsonPath} onChange={(v) => upd("jsonPath", v)} placeholder=".price" mono />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Target (uint256)" value={form.target} onChange={(v) => upd("target", v)} mono />
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">Comparator</span>
            <select value={form.comparator} onChange={(e) => upd("comparator", e.target.value)} className="field-input">
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

      <div aria-live="polite">
        {err && (
          <p
            className="mt-4 break-all rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{ background: "rgba(248,113,113,0.12)", color: "var(--danger)" }}
            role="alert"
          >
            {err}
          </p>
        )}
      </div>

      <button type="button" onClick={submit} disabled={busy} className="btn-primary mt-6 text-sm">
        {busy ? "Creating…" : "Create market"}
      </button>
      <p className="mt-3 text-xs text-[color:var(--text-muted)]">
        Min betting 30s, min resolve delay 15s, total ≤ 1 day. Resolve needs prepaid execution balance.
      </p>
    </section>
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
    <section aria-labelledby="fund-heading" className="surface-inset flex flex-wrap items-center gap-3 px-4 py-3">
      <h2 id="fund-heading" className="text-sm font-medium text-[color:var(--text-primary)]">
        Fund execution
      </h2>
      <label className="flex items-center gap-2">
        <span className="sr-only">Amount in RITUAL</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="field-input !w-24 font-mono text-sm"
          placeholder="0.05"
          inputMode="decimal"
        />
      </label>
      <span className="text-xs text-[color:var(--text-muted)]">RITUAL · prepaid gas for the Schedulerʼs callbacks</span>
      <button type="button" onClick={fund} disabled={busy} className="btn-secondary text-xs">
        {busy ? "Funding…" : "Deposit"}
      </button>
      <div aria-live="polite" className="w-full">
        {err && (
          <p className="break-all text-xs" style={{ color: "var(--danger)" }} role="alert">
            {err}
          </p>
        )}
      </div>
    </section>
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

  const label = stateLabelOf(market.state, outcomeLabel);
  const tokenColor =
    market.state === 0
      ? "var(--state-open)"
      : market.state === 1
        ? "var(--state-closed)"
        : market.state === 2
          ? "var(--state-resolving)"
          : market.state === 3
            ? "var(--state-resolved)"
            : "var(--state-invalid)";

  return (
    <article className="surface p-6 sm:p-7" aria-label={`Market #${String(market.id)}: ${market.question}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-[color:var(--text-muted)]">
            #{String(market.id)} · schedule {String(market.scheduleId) || "-"}
          </p>
          <h3 className="mt-2 max-w-xl text-[17px] font-semibold leading-snug text-[color:var(--text-primary)]">{market.question}</h3>
        </div>
        <span
          className="rounded-full px-3 py-1.5 text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.06)", color: tokenColor, border: `1px solid ${tokenColor}44` }}
        >
          {label}
        </span>
      </div>

      {/* lifecycle — the center of every market card */}
      <div className="mt-5">
        <LifecycleRail
          state={market.state}
          outcome={market.state === 3 ? outcomeLabel : undefined}
          pulse={busy === null}
        />
      </div>

      <div className="surface-inset mt-5 grid gap-2 px-4 py-3 font-mono text-xs text-[color:var(--text-secondary)]">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            rule: observed {COMPARATOR_SYMBOLS[market.comparator] ?? "?"} {String(market.target)}
          </span>
          <span aria-hidden className="text-[color:var(--text-faint)]">·</span>
          <span className="break-all">oracle {market.oracleUrl}</span>
          <span aria-hidden className="text-[color:var(--text-faint)]">·</span>
          <span>jq {market.jsonPath}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[color:var(--text-muted)]">
          <span>
            close block {String(market.closeBlock)} ({closesIn ?? "-"})
          </span>
          <span>
            resolve block {String(market.resolveBlock)} ({resolvesIn ?? "-"})
          </span>
          <span>attempts {String(market.attempts)}/3</span>
        </div>
        {market.state >= 3 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {market.state === 3 ? (
              <span style={{ color: "var(--state-resolved)" }}>
                outcome {outcomeLabel}
                {market.observedValue !== 0n ? ` - observed ${String(market.observedValue)}` : ""}
              </span>
            ) : (
              <span style={{ color: "var(--state-invalid)" }}>
                invalid - refundable, never NO{market.invalidReason ? ` - reason: ${market.invalidReason}` : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* pool bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-[color:var(--text-secondary)]">
          <span>YES {formatEther(market.totalYes)} RITUAL</span>
          <span>NO {formatEther(market.totalNo)} RITUAL</span>
        </div>
        <div
          className="mt-2 flex h-2 overflow-hidden rounded-full"
          role="img"
          aria-label={`Pool: YES ${formatEther(market.totalYes)} RITUAL, NO ${formatEther(market.totalNo)} RITUAL`}
        >
          <div
            className="transition-all duration-700"
            style={{ width: `${yesPct}%`, background: "linear-gradient(90deg, var(--violet-brand), var(--magenta-brand))" }}
          />
          <div className="flex-1" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">
          {pool === 0n ? "No bets yet" : `Total ${formatEther(pool)} RITUAL - YES ${yesPct.toFixed(1)}%`}
        </p>
      </div>

      {address && st && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-secondary)]">
            your YES {formatEther(myYes ?? 0n)} - NO {formatEther(myNo ?? 0n)}
          </span>
          {settled && (
            <span className="rounded-full border border-[color:var(--hairline)] bg-[color:var(--paper)] px-3 py-1.5 text-[color:var(--text-muted)]">settled</span>
          )}
          {claimable !== undefined && claimable > 0n && !settled && (
            <span className="rounded-full px-3 py-1.5" style={{ background: "rgba(52,211,153,0.12)", color: "var(--ok)" }}>
              claimable {formatEther(claimable)} RITUAL
            </span>
          )}
        </div>
      )}

      {/* actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canBet ? (
          <>
            <label className="flex items-center">
              <span className="sr-only">Bet amount in RITUAL</span>
              <input
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="field-input !w-24 font-mono text-sm"
                placeholder="0.01"
                inputMode="decimal"
              />
            </label>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => act("yes", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "bet", args: [market.id, true], value: parseEther(betAmount || "0"), chainId: ritualChain.id }))}
              className="min-h-11 rounded-full px-5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#059669" }}
            >
              {busy === "yes" ? "…" : "Bet YES"}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => act("no", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "bet", args: [market.id, false], value: parseEther(betAmount || "0"), chainId: ritualChain.id }))}
              className="btn-secondary min-h-11 px-5 text-xs"
            >
              {busy === "no" ? "…" : "Bet NO"}
            </button>
          </>
        ) : (
          <span className="text-xs text-[color:var(--text-muted)]">
            {market.state === 0
              ? "Betting open"
              : market.state === 3 || market.state === 4
                ? "Market settled"
                : "Betting closed - awaiting Scheduler"}
          </span>
        )}

        {canClaimWinnings && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act("claim", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimWinnings", args: [market.id], chainId: ritualChain.id }))}
            className="btn-primary min-h-11 px-5 text-xs"
          >
            {busy === "claim" ? "…" : "Claim winnings"}
          </button>
        )}
        {canRefund && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => act("refund", () => writeContractAsync({ address: PREDICT_ADDRESS, abi: predictAbi, functionName: "claimRefund", args: [market.id], chainId: ritualChain.id }))}
            className="min-h-11 rounded-full px-5 text-xs font-semibold disabled:opacity-40"
            style={{ background: "rgba(251,191,36,0.15)", color: "var(--warn)", border: "1px solid rgba(251,191,36,0.35)" }}
          >
            {busy === "refund" ? "…" : "Claim refund"}
          </button>
        )}
      </div>

      <div aria-live="polite">
        {err && (
          <p
            className="mt-3 break-all rounded-xl px-4 py-2 text-xs leading-relaxed"
            style={{ background: "rgba(248,113,113,0.12)", color: "var(--danger)" }}
            role="alert"
          >
            {err}
          </p>
        )}
      </div>
    </article>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  const id = useId();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`field-input text-sm ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

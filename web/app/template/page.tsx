import type { Metadata } from "next";

export const metadata: Metadata = { title: "Template" };

const inputs = [
  { label: "Forecast call", value: "YES / NO", note: "player signal" },
  { label: "Round rule", value: "Immutable", note: "fixed at creation" },
];

const outputs = [
  { label: "Market outcome", value: "RESOLVED", note: "truth finalized" },
  { label: "Field", value: "1 survivor", note: "last predictor standing" },
];

function ConnectorDiagram() {
  return (
    <div className="relative mx-auto mt-10 min-h-[360px] max-w-5xl overflow-hidden rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--template-stage,#f1f5fb)] px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-x-[18%] top-1/2 h-64 -translate-y-1/2 rounded-full border border-[color:var(--hairline)] bg-white/45" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 360" fill="none" aria-hidden="true" preserveAspectRatio="none">
        <path d="M185 112 C300 112 315 170 420 180 S570 205 700 112" stroke="var(--template-line,#d6e0ec)" strokeWidth="2" />
        <path d="M185 250 C300 250 325 190 420 180 S570 155 700 250" stroke="var(--template-line,#d6e0ec)" strokeWidth="2" />
        <path d="M420 180 H580" stroke="var(--template-line,#d6e0ec)" strokeWidth="2" />
        {[185, 420, 580, 700].map((x, i) => <circle key={i} cx={x} cy={i === 0 || i === 3 ? 112 : 180} r="6" fill="white" stroke="var(--template-accent,#415f86)" strokeWidth="2" />)}
      </svg>

      <div className="relative z-10 grid min-h-[300px] items-center gap-8 sm:grid-cols-[1fr_1.1fr_1fr] sm:gap-10">
        <div className="space-y-5">
          {inputs.map((item) => (
            <div key={item.label} className="surface px-5 py-4 shadow-[var(--template-shadow,0_8px_24px_rgba(70,95,125,0.06))]">
              <p className="text-xs font-semibold text-[color:var(--ink)]">{item.label}</p>
              <p className="mt-2 font-mono text-sm text-[color:var(--ink-secondary)]">{item.value}</p>
              <p className="mt-1 text-xs text-[color:var(--ink-muted)]">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="surface relative mx-auto w-full max-w-xs px-6 py-7 text-center shadow-[var(--template-shadow,0_8px_24px_rgba(70,95,125,0.06))]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[color:var(--hairline)] bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">the core</span>
          <p className="font-display text-3xl font-semibold uppercase tracking-tight text-[color:var(--ink)]">RitualPredict</p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--ink-secondary)]">Scheduler → HTTP → JQ → comparator</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">
            <span className="rounded-full bg-[color:var(--canvas-deep)] px-2 py-1">open</span><span>→</span><span className="rounded-full bg-[color:var(--canvas-deep)] px-2 py-1">resolve</span><span>→</span><span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-[color:var(--accent)]">outcome</span>
          </div>
        </div>

        <div className="space-y-5">
          {outputs.map((item) => (
            <div key={item.label} className="surface px-5 py-4 shadow-[var(--template-shadow,0_8px_24px_rgba(70,95,125,0.06))]">
              <p className="text-xs font-semibold text-[color:var(--ink)]">{item.label}</p>
              <p className="mt-2 font-mono text-sm text-[color:var(--ink-secondary)]">{item.value}</p>
              <p className="mt-1 text-xs text-[color:var(--ink-muted)]">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplatePage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-3 py-4 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-[24px] border-2 border-white bg-[color:var(--template-stage,#f1f5fb)] shadow-[0_20px_60px_rgba(70,95,125,0.08)]">
        <div className="px-5 pb-10 pt-12 text-center sm:px-10 sm:pb-14 sm:pt-16">
          <p className="eyebrow">A competitive forecasting game</p>
          <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] sm:text-7xl">Many calls.<br /><span className="text-[color:var(--ink-secondary)]">One survivor.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[color:var(--ink-secondary)] sm:text-lg">Last Predictor Standing turns finalized market outcomes into a competitive field. Call, survive, and call again.</p>
          <ConnectorDiagram />
        </div>
      </section>
    </main>
  );
}

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

      <section aria-labelledby="round-heading" className="mx-auto max-w-5xl px-2 pb-8 pt-16 text-left sm:px-6 sm:pb-14 sm:pt-24">
        <p className="eyebrow">The round</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_1.2fr] sm:items-end sm:gap-12">
          <h2 id="round-heading" className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] sm:text-6xl">Call.<br />Survive.<br /><span className="text-[color:var(--ink-secondary)]">Call again.</span></h2>
          <p className="max-w-lg text-base leading-relaxed text-[color:var(--ink-secondary)] sm:text-lg">Every round begins with a forecast. When the market resolves, correct calls stay in the field and wrong calls leave it. The last predictor standing takes the pool.</p>
        </div>

        <ol className="mt-12 grid border-t border-[color:var(--hairline)] sm:grid-cols-4">
          {[
            ["01", "Call", "Choose YES or NO. Stake native RITUAL against the fixed market rule."],
            ["02", "Survive", "The market closes. Finalized evidence decides which calls remain."],
            ["03", "Call again", "Survivors enter the next round as the field narrows."],
            ["04", "Take the pool", "The last survivor claims the winning pool. INVALID stays refundable."],
          ].map(([number, title, copy]) => (
            <li key={number} className="border-b border-[color:var(--hairline)] py-6 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
              <p className="font-mono text-xs text-[color:var(--ink-muted)]">{number}</p>
              <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-tight text-[color:var(--ink)]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--ink-secondary)]">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="mechanism-heading" className="border-y border-[color:var(--hairline)] bg-[color:var(--canvas-deep)] px-2 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="eyebrow">The mechanism</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_1.2fr] sm:items-end sm:gap-12">
            <h2 id="mechanism-heading" className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] sm:text-6xl">The rule<br /><span className="text-[color:var(--ink-secondary)]">settles itself.</span></h2>
            <p className="max-w-lg text-base leading-relaxed text-[color:var(--ink-secondary)] sm:text-lg">Every market begins with an immutable rule. RitualPredict waits for the resolution block, retrieves external evidence, extracts the result, and records YES, NO, or INVALID.</p>
          </div>

          <ol className="mt-12 grid overflow-hidden rounded-[18px] border border-[color:var(--hairline)] bg-[color:var(--surface-raised)] sm:grid-cols-6">
            {[
              ["01", "Immutable rule"],
              ["02", "Scheduler"],
              ["03", "HTTP"],
              ["04", "JQ extraction"],
              ["05", "Comparator"],
              ["06", "YES / NO / INVALID"],
            ].map(([number, label], index) => (
              <li key={number} className="relative border-b border-[color:var(--hairline)] px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0">
                <p className="font-mono text-[10px] text-[color:var(--ink-muted)]">{number}</p>
                <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">{label}</p>
                {index < 5 && <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-[color:var(--ink-faint)] sm:block" aria-hidden>→</span>}
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border-l-2 border-[color:var(--state-resolved)] pl-4"><p className="font-mono text-xs text-[color:var(--state-resolved)]">YES</p><p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-secondary)]">The observation meets the rule.</p></div>
            <div className="border-l-2 border-[color:var(--ink-secondary)] pl-4"><p className="font-mono text-xs text-[color:var(--ink-secondary)]">NO</p><p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-secondary)]">The observation fails the rule.</p></div>
            <div className="border-l-2 border-[color:var(--accent)] pl-4"><p className="font-mono text-xs text-[color:var(--accent)]">INVALID</p><p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-secondary)]">Evidence failed. No one is incorrectly eliminated; stakes remain refundable.</p></div>
          </div>
        </div>
      </section>

      <section aria-labelledby="proof-heading" className="mx-auto max-w-5xl px-2 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <p className="eyebrow">The proof</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_1.2fr] sm:items-end sm:gap-12">
          <h2 id="proof-heading" className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.02em] text-[color:var(--ink)] sm:text-6xl">Built to be<br /><span className="text-[color:var(--ink-secondary)]">inspected.</span></h2>
          <p className="max-w-lg text-base leading-relaxed text-[color:var(--ink-secondary)] sm:text-lg">Odds is implemented in the fork—not presented as a concept mockup. The local evidence is open, reproducible, and honest about what is not live.</p>
        </div>

        <div className="mt-12 grid border-y border-[color:var(--hairline)] sm:grid-cols-4">
          {[
            ["26", "local tests", "Hardhat lifecycle and failure coverage"],
            ["01", "core primitive", "RitualPredict resolves the market rule"],
            ["01", "competition layer", "Odds composes Last Predictor Standing"],
            ["0x", "hidden claims", "No live deployment or fake receipt"],
          ].map(([value, label, copy]) => (
            <div key={label} className="border-b border-[color:var(--hairline)] py-6 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
              <p className="font-display text-3xl font-semibold tracking-tight text-[color:var(--ink)]">{value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--ink)]">{label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-secondary)]">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-5">
          <a href="/proof" className="btn-secondary text-sm">Read the evidence <span aria-hidden>→</span></a>
          <a href="/play" className="btn-primary text-sm">Play Odds <span aria-hidden>→</span></a>
        </div>
      </section>
    </main>
  );
}

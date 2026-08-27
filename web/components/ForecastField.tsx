/* The Odds motif — a monochrome field of forecast marks, struck down round by
 * round, narrowing toward the single surviving mark. Entirely deterministic
 * (no Math.random) so server and client render identically. Ink strokes on
 * paper; the one accent color is reserved for the survivor's ring. */

const ROWS = [26, 19, 14, 10, 6, 4, 2, 1] as const;

function jitter(i: number, r: number) {
  const v = Math.sin(i * 127.1 + r * 311.7) * 43758.5453;
  return v - Math.floor(v); // 0..1, deterministic
}

export function ForecastField() {
  const width = 1000;
  const height = 460;
  const top = 46;
  const step = 52;
  const lastIndex = ROWS.length - 1;

  const rows = ROWS.map((count, r) => {
    const y = top + r * step;
    if (r === lastIndex) {
      return { y, marks: [], survivor: true };
    }
    const spread = 1 - (r / lastIndex) * 0.78;
    const span = 880 * spread;
    const startX = width / 2 - span / 2;
    const gap = count > 1 ? span / (count - 1) : 0;
    const marks = Array.from({ length: count }, (_, i) => {
      const baseX = startX + i * gap;
      const x = baseX + (jitter(i + 3, r + 1) - 0.5) * Math.min(14, gap * 0.4);
      const rotation = (jitter(i + 7, r + 3) - 0.5) * 16;
      const sw = 2.2 + jitter(i + 11, r + 5) * 0.8;
      // ~1 in 3 calls is struck — the field thins as rounds pass
      const struck = jitter(i + 13, r + 5) > 0.62;
      return { x, y, rotation, sw, struck };
    });
    return { y, marks, survivor: false };
  });

  const survivorY = top + lastIndex * step;

  return (
    <figure className="mx-auto w-full">
      <div className="surface overflow-hidden px-3 py-6 sm:px-6 sm:py-8" style={{ color: "var(--ink)" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="A field of forecast marks, struck out round after round, narrowing to one surviving mark inside a hand-drawn ring"
          className="block h-auto w-full"
        >
          {rows.map((row, r) =>
            row.survivor ? null : (
              <g key={r} stroke="currentColor" strokeLinecap="round" fill="none" aria-hidden>
                {row.marks.map((m, i) => (
                  <g key={i} opacity={m.struck ? 0.45 : 0.9}>
                    <line
                      x1={m.x - 5}
                      y1={m.y + 11}
                      x2={m.x + 5}
                      y2={m.y - 11}
                      strokeWidth={m.sw}
                      transform={`rotate(${m.rotation} ${m.x} ${m.y})`}
                    />
                    {m.struck && (
                      <line x1={m.x - 10} y1={m.y} x2={m.x + 10} y2={m.y} strokeWidth={1.5} opacity={0.6} />
                    )}
                  </g>
                ))}
              </g>
            ),
          )}

          {/* the survivor — the only accent on the page's visual center */}
          <g aria-hidden style={{ color: "var(--accent)" }} stroke="currentColor" strokeLinecap="round" fill="none">
            <ellipse cx={500} cy={survivorY} rx={26} ry={31} strokeWidth={2.5} />
            <ellipse cx={501} cy={survivorY + 1} rx={27} ry={32} strokeWidth={1.4} opacity={0.45} transform="rotate(-4 501 421)" />
            <line x1={495} y1={survivorY + 12} x2={505} y2={survivorY - 12} strokeWidth={3} />
          </g>
        </svg>
      </div>
      <figcaption className="mt-4 text-center font-mono text-xs text-[color:var(--ink-muted)]">
        Round after round, calls are struck from the field. One survives — the last predictor standing.
      </figcaption>
    </figure>
  );
}
# Odds — Design System (canonical)

This document is the single source of truth for the Odds frontend. Every visual
decision in `app/` and `components/` derives from these tokens. If a value is not
here, it does not belong in the UI. Implementation lives in `app/globals.css`
(`:root` custom properties, exposed to Tailwind via `@theme`).

## Identity

Odds is a **competitive forecasting game — Last Predictor Standing**. The site's
one idea is the survivor motif:

```
many calls ──▶ rounds of strikes ──▶ one surviving mark
```

RitualPredict is the underlying self-resolving market primitive; it is explained,
never branded on the landing. Every page has exactly one visual center — on the
landing it is the forecast-field motif; on `/markets` it is the lifecycle rail.
Everything else stays quiet so the center reads first.

## Design principles

1. **Paper and ink.** Warm white canvas, near-black ink text. No neon, no
   gradients, no glassmorphism, no decorative icon toppers. One accent, used
   only where it means something.
2. **Lead with the game.** `/` is a Decide/Learn marketing surface. It explains
   Last Predictor Standing first, the market rule second. No card grids, no
   generic SaaS copy, no fake metrics.
3. **Truth over decoration.** All numbers come from chain reads (`getMarkets`,
   `stakesOf`, `executionBalance`) or `/api/oracle/eth`. An unconfigured
   deployment shows an honest "no contract bound" state. Nothing implies live
   deployment — testnet is stated plainly.
4. **Failed oracle ≠ NO.** Oracle/execuator failure means `Invalid` —
   refundable, never a losing outcome. The UI must never color Invalid as a
   loss. The accent (rust) is the semantic color for exactly this.
5. **Accessibility is structural, not bolted on.** Semantic `nav`/`main`/
   `footer`, skip link, labelled controls, visible keyboard focus, 44px minimum
   targets, real `<a>`/`<button>` elements only.

## Color tokens

### Surfaces (light only — the product is paper-native)

| Token | Value | Use |
| --- | --- | --- |
| `--canvas` | `#faf7f2` | Page background (warm white) |
| `--canvas-deep` | `#f1ebe1` | Inset panel, input track |
| `--surface-raised` | `#ffffff` | Raised card surface |
| `--paper` | `rgba(25,22,19,0.04)` | Hairline surface wash |
| `--badge-bg` | `rgba(25,22,19,0.05)` | Badge/pill background |
| `--hairline` | `rgba(25,22,19,0.14)` | Borders, dividers |
| `--hairline-strong` | `rgba(25,22,19,0.30)` | Hovered border |
| `--track` | `rgba(25,22,19,0.10)` | Progress/lifecycle track |
| `--pool-track` | `#e6dfd2` | Empty side of the pool bar |

### Ink text (all ≥ 4.5:1 on `--canvas`)

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#191613` | Headings, key numbers, primary button fill |
| `--ink-secondary` | `#565046` | Body copy (16px) |
| `--ink-muted` | `#857e72` | Meta, captions, labels |
| `--ink-faint` | `#b0a99c` | Decorative indices only — never body text |

Legacy aliases (`--text-primary`, `--text-secondary`, `--text-muted`,
`--text-faint`, `--ink-900/800/700`, `--background`, `--foreground`) are kept in
`globals.css` and point at these tokens so the dApp components stay stable.

### The one accent — semantic only

| Token | Value | Use |
| --- | --- | --- |
| `--accent` | `#b4451f` | Invalid/refund semantics, focus ring, the surviving mark |
| `--accent-soft` | `rgba(180,69,31,0.10)` | Accent wash behind semantic notices |

The accent is **not** decoration. It marks the survivor in the motif, the
Invalid (refund) state, warnings, and keyboard focus. The primary CTA is a
plain black (`--ink`) pill — the CTA is not accented.

### dApp lifecycle state colors (functional, adapted for paper)

| State | Token | Value | Meaning |
| --- | --- | --- | --- |
| Open | `--state-open` | `#2f5d8a` | Betting live (`bet` payable) |
| Closed | `--state-closed` | `#6e675c` | Past `closeBlock`, pool frozen |
| Resolving | `--state-resolving` | `#8a6d3b` | Scheduler fired, HTTP→JQ in flight |
| Resolved | `--state-resolved` | `#2f6f4f` | Comparator settled YES/NO; claims open |
| Invalid | `--state-invalid` | `var(--accent)` | Oracle failed / empty side — **refund, never NO** |

### Feedback

| Token | Value | Use |
| --- | --- | --- |
| `--ok` / `--ok-wash` | `#2f6f4f` / `rgba(47,111,79,0.10)` | Success, claimable |
| `--warn` / `--warn-wash` / `--warn-border` | `var(--accent)` / `rgba(180,69,31,0.08)` / `rgba(180,69,31,0.35)` | Needs attention (execution balance empty, Invalid) |
| `--danger` / `--danger-wash` | `#a13224` / `rgba(161,50,36,0.08)` | Revert / tx errors |

## Typography

| Token | Value | Use |
| --- | --- | --- |
| `--font-display` | Oswald (`--font-oswald`) | Editorial headlines, wordmark — uppercase, weight 600 |
| `--font-sans` | Inter (`--font-inter`) | Everything textual |
| `--font-mono` | Geist Mono (`--font-geist-mono`) | Addresses, blocks, jq paths, ABIs |
| Body size | `1rem` / **16px**, line-height `1.65` | All paragraphs |
| Display H1 | clamp ~44 → 72px, weight 600, uppercase, tracking `0.01em`, `text-balance` | Landing headline |
| Section H2 | 28px / 600 | Page sections |
| Card H3 | 17px / 600 | Card titles |
| Eyebrow | 11px, uppercase, `letter-spacing: 0.35em`, `--ink-muted` | Section labels |

## Spacing, radius, elevation

| Token | Value |
| --- | --- |
| Space scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 (px) |
| Radius | `--radius-sm 8px` (inputs, chips) · `--radius-md 14px` (inner panels) · `--radius-lg 20px` (cards) · `999px` (pills) |
| Elevation | none. Paper does not glow — separation is hairlines, not shadows |
| Content column | `max-w-5xl` (motif) / `max-w-3xl` (dApp text), `px-6` gutters |

## Controls

- Minimum interactive size: **44 × 44 px** on every control.
- Primary button (`.btn-primary`): solid `--ink` pill, canvas-colored label.
  One per view. Hover: subtle darken + 1px lift. No glow, no gradient.
- Secondary button (`.btn-secondary`): 1px hairline pill, transparent fill,
  hover strengthens the border and the label.
- Inputs (`.field-input`): white fill, 1px `--hairline`, accent border on
  `:focus-visible`.
- Focus ring (global): `2px solid var(--accent)`, offset `2px` — never removed,
  never bare `outline-none`.
- All controls carry an accessible name; forms use real `<label>`s.
- Buttons are `<button>`, navigation is `<Link>` (`<a>`) — never a clickable
  `div`.

## Accessibility checklist (enforced in review)

- [x] Skip link: first focusable element, targets `#main`.
- [x] `<nav aria-label="Primary">` for site navigation.
- [x] `main#main` landmark on every route.
- [x] Visible `:focus-visible` ring on all interactive elements.
- [x] 44px min control size, 16px body text, AA contrast on all text tokens.
- [x] `aria-live="polite"` on tx status / error regions and lifecycle readouts.
- [x] Motif SVG carries `role="img"` + `aria-label` and a visible caption.
- [x] Lifecycle rail has a text equivalent (`aria-label` + visible labels).

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--dur-fast` | `160ms` (hover, focus) |
| `--dur-slow` | `480ms` (entrance reveals) |

Allowed motion: subtle entrance reveals (`.rise-in`), hover lift, one signal
sweep (`.signal-sweep`) under the Resolving state. The motif is static — it does
not animate. Prohibited: infinite background loops on content, parallax,
anything that runs when `prefers-reduced-motion: reduce` is set.

## Layout grammar

- Every page: skip link → header (Odds wordmark + minimal nav + ConnectButton)
  → `main#main` → footer.
- Header: compact black wordmark ("Odds" in Oswald with a small ink square
  mark), two links (Play, Mechanics). No mega-nav.
- Landing: centered hero (eyebrow → condensed display headline → one sentence →
  black CTA) → forecast-field motif → Decide/Learn split separated by hairlines
  → quiet mono trust/technical strip. No card grids anywhere on `/`.
- Sections are separated by 1px hairlines, not boxes. Cards use `.surface`
  (white + hairline); inner data panels use `.surface-inset`.
- The contract address is never hardcoded in components — it resolves from
  `NEXT_PUBLIC_PREDICT_ADDRESS` in `lib/chain.ts`; until then the UI says so
  honestly.
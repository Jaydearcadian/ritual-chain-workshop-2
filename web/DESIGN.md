# RitualPredict — Design System (canonical)

This document is the single source of truth for the RitualPredict workshop frontend.
Every visual decision in `app/` and `components/` derives from these tokens. If a
value is not here, it does not belong in the UI. Implementation lives in
`app/globals.css` (`:root` custom properties exposed to Tailwind via `@theme`).

## Identity

One idea carries the whole site: **the market lifecycle**.

```
Open ──▶ Closed ──▶ Resolving ──▶ Resolved
                               └─▶ Invalid (refund)
```

Every page has exactly one visual center — the LifecycleRail — and everything else
(typography, spacing, borders) stays quiet so the rail reads first. There are no
competing hero graphics, no dot fields, no decorative pseudo-data.

## Design principles

1. **Truth over decoration.** All numbers come from chain reads (`getMarkets`,
   `stakesOf`, `executionBalance`) or the `/api/oracle/eth` route. No fake data.
   An unconfigured deployment shows an honest "no contract bound" state.
2. **Failed oracle ≠ NO.** Oracle/execuator failure means `Invalid` — refundable,
   never a losing outcome. The UI must never color Invalid as a loss.
3. **Accessibility is structural, not bolted on.** Semantic `nav`/`main`/`footer`,
   skip link, labelled controls, visible keyboard focus, 44px minimum targets.
4. **One accent, used sparingly.** The brand gradient appears only on the primary
   action of a view and the active lifecycle state. Everything else is ink and paper.

## Color tokens

### Surfaces (dark only — the product is dark-native)

| Token | Value | Use |
| --- | --- | --- |
| `--ink-900` | `#0a0612` | Page background (deepest) |
| `--ink-800` | `#100a1c` | Raised surface / card |
| `--ink-700` | `#181026` | Inset panel, input background |
| `--paper` | `rgba(255,255,255,0.04)` | Hairline surface wash |
| `--hairline` | `rgba(255,255,255,0.09)` | Borders, dividers |
| `--hairline-strong` | `rgba(255,255,255,0.16)` | Hovered border |

### Text (all ≥ 4.5:1 on `--ink-900`)

| Token | Value | Use |
| --- | --- | --- |
| `--text-primary` | `#f5f2fb` | Headings, key numbers |
| `--text-secondary` | `#b9b2cd` | Body copy (16px) |
| `--text-muted` | `#8f88a6` | Meta, captions, labels |
| `--text-faint` | `#6d6684` | Decorative indices only — never body text |

### Brand accent

| Token | Value | Use |
| --- | --- | --- |
| `--violet-brand` | `#7c3aed` | Gradient start, active Open state |
| `--magenta-brand` | `#ec4899` | Gradient middle, Resolving state |
| `--orange-brand` | `#f97316` | Gradient end, warm highlights |
| `--accent-soft` | `rgba(236,72,153,0.12)` | Tinted wash behind primary actions |

Brand gradient (primary button + gradient text only):
`135deg, #a78bfa 0% → #ec4899 50% → #fb923c 100%`.

### Lifecycle state colors (the semantic core)

| State | Token | Value | Meaning |
| --- | --- | --- | --- |
| Open | `--state-open` | `#a78bfa` | Betting live (`bet` payable) |
| Closed | `--state-closed` | `#7dd3fc` | Past `closeBlock`, pool frozen |
| Resolving | `--state-resolving` | `#f472b6` | Scheduler fired, HTTP→JQ in flight |
| Resolved | `--state-resolved` | `#34d399` | Comparator settled YES/NO; claims open |
| Invalid | `--state-invalid` | `#fbbf24` | Oracle failed / empty side — **refund, never NO** |

Each state also has a wash (`rgba(state, 0.10–0.14)`) for badge backgrounds.

### Feedback

| Token | Value | Use |
| --- | --- | --- |
| `--ok` | `#34d399` | Success, claimable |
| `--warn` | `#fbbf24` | Needs attention (execution balance empty, Invalid) |
| `--danger` | `#f87171` | Revert / tx errors (paired `rgba(248,113,113,0.12)` wash) |

## Typography

| Token | Value | Use |
| --- | --- | --- |
| `--font-sans` | Geist (`--font-geist-sans`) | Everything textual |
| `--font-mono` | Geist Mono (`--font-geist-mono`) | Addresses, blocks, jq paths, ABIs |
| Body size | `1rem` / **16px**, line-height `1.65` | All paragraphs |
| `text-xs` | 12px | Meta only, never body |
| Display H1 | clamp 36 → 56px, weight 700, tracking `-0.02em`, `text-balance` | Page titles |
| Section H2 | 28px / 700 | Page sections |
| Card H3 | 17px / 600 | Card titles |
| Eyebrow | 11px, uppercase, `letter-spacing: 0.3em`, `--text-muted` | Section labels |

## Spacing, radius, elevation

| Token | Value |
| --- | --- |
| Space scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 (px) |
| Radius | `--radius-sm 10px` (inputs, chips) · `--radius-md 16px` (inner panels) · `--radius-lg 24px` (cards) · `999px` (pills) |
| Elevation | `--glow-rest: 0 0 24px rgba(236,72,153,0.18)` · `--glow-lift: 0 0 44px rgba(236,72,153,0.32)` (primary CTA hover only) |
| Content column | `max-w-3xl` (768px), `px-6` gutters |

## Controls

- Minimum interactive size: **44 × 44 px** (`min-h-11` / `.btn-*` on every control).
- Primary button (`.btn-primary`): brand gradient pill, one per view, glow on hover only.
- Secondary button (`.btn-secondary`): 1px hairline pill, transparent fill, hover lifts border.
- Inputs (`.field-input`): `--ink-700` fill, 1px `--hairline`, focus border on `:focus-visible`.
- Focus ring (global): `2px solid #c4b5fd`, offset `2px` — never removed, never bare `outline-none`.
- All controls carry an accessible name; forms use real `<label>`s.
- Buttons are `<button>`, navigation is `<Link>` (`<a>`) — never a clickable `div`.

## Accessibility checklist (enforced in review)

- [x] Skip link: first focusable element, targets `#main`.
- [x] `<nav aria-label="Primary">` for site navigation.
- [x] `main#main` landmark on every route.
- [x] Visible `:focus-visible` ring on all interactive elements.
- [x] 44px min control size.
- [x] 16px body text, AA contrast on all text tokens.
- [x] `aria-live="polite"` on tx status / error regions and lifecycle readouts.
- [x] `prefers-reduced-motion: reduce` disables every animation and the hero autoplay.
- [x] Lifecycle rail has a text equivalent (`aria-label` + visible labels).

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--dur-fast` | `160ms` (hover, focus) |
| `--dur-slow` | `560ms` (entrance reveals) |

Allowed motion: entrance reveals (`.rise-in`, `.accent-wipe`), hover lift/glow, one
signal sweep (`.signal-sweep`) under the Resolving state. Prohibited: infinite
background loops on content, parallax, anything that runs when
`prefers-reduced-motion` is set (the hero freezes on its final beat).

## Layout grammar

- Every page: skip link → header (wordmark + primary nav + ConnectButton) → `main#main` → footer.
- Single column, `max-w-3xl`. No sidebars. Sections separated by 1px hairlines, not boxes.
- Cards use `.surface` (raised ink + hairline); inner data panels use `.surface-inset`.
- The contract address is never hardcoded in components — it resolves from
  `NEXT_PUBLIC_PREDICT_ADDRESS` in `lib/chain.ts`; until then the UI says so honestly.

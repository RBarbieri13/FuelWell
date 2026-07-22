# FuelWell De-Facto Design Ruleset

Extracted 2026-07-22 from the live codebase (read-only audit). This documents the
conventions the app *actually* follows, so fix nodes stay inside them instead of
inventing new visual language. All line numbers verified against the working tree
on branch `surf/ios-responsive-ux-recovery`.

Sampled: `src/app/globals.css`, all of `src/components/ui/*`, plus
`dashboard/calorie-ring.tsx`, `dashboard/macro-bar.tsx`, `dashboard/quick-actions.tsx`,
`recipes/recipe-card.tsx`, `layout/mobile-nav.tsx`, `settings/coach-activity.tsx`,
`app/dashboard/dashboard-client.tsx` (header anatomy), `ui/page-skeleton.tsx`.

---

## 1. Token architecture (globals.css)

Two token layers coexist:

1. **FW brand palette** — `@theme inline` scales in `src/app/globals.css:14-56`:
   `--color-primary-*` (lagoon green, 50-950), `--color-accent-*` (coral, 50-700),
   `--color-sky-*`, `--color-teal-*`, `--color-lemon-*`, `--color-sage-*`, and the
   four macro colors `--color-macro-protein|carbs|fat|calories` (`globals.css:53-56`).
2. **shadcn semantic roles** — `:root` vars at `globals.css:142-175`
   (`--background #e8f5f1`, `--foreground #16302a`, `--card #ffffff`,
   `--muted-foreground #516b63`, `--border #e6efeb`, `--ring #1eae84`, chart-1..5).
   A `.dark` block exists (`globals.css:177-209`) but is unbranded gray oklch —
   dark mode is effectively unsupported; nothing toggles `.dark`.

Radius system: `--radius: 0.75rem` (`globals.css:166`) with derived
`--radius-sm..4xl` multipliers (`globals.css:87-93`). **In practice components do
not use these** — see Violations.

`fw-*` utility classes (`globals.css:230-349`, `@layer components`):

| Class | Role | Evidence |
|---|---|---|
| `fw-app-surface` | page background gradient wrapper | `globals.css:231`, 25 uses |
| `fw-page-header` | sticky-ish blurred page header band | `globals.css:238`, 18 uses |
| `fw-page-inner` | max-w-92rem centered container, 2rem pad (1rem <=768px) | `globals.css:244,351-355`, 38 uses |
| `fw-heading` | `#16302a`, weight 900, tight tracking | `globals.css:251`, 24 uses |
| `fw-muted` | `#516b63`, weight 600 subtitle text | `globals.css:257`, 15 uses |
| `fw-icon-chip` | 2.5rem square mint chip for icons | `globals.css:262`, 15 uses |
| `fw-dark-panel` | dark-green hero gradient panel | `globals.css:273`, 18 uses |
| `fw-mint-panel` | light mint gradient panel | `globals.css:282`, 6 uses |
| `fw-soft-row` | soft bordered list-row surface, 1.25rem radius | `globals.css:289`, 14 uses |
| `fw-artifact-scope` etc. | coach-artifact normalization | `globals.css:308-348` |

Typography: headings use `--font-heading` (`--font-fw-display`) with
`letter-spacing: -0.02em` via `@layer base` (`globals.css:221-227`); body is
`--font-fw-body`. `.tabular-nums` utility (`globals.css:131`) is used on every
numeric readout (e.g. `calorie-ring.tsx:92`, `macro-bar.tsx:45`).

Global focus style: 3px `--color-primary-600` outline, offset 2, 12px radius
(`globals.css:118-122`) — applies keyboard-only via `:focus:not(:focus-visible)`.

---

## 2. Dominant conventions (fix nodes MUST follow these)

### C1 — Page anatomy: `fw-app-surface > fw-page-header > fw-page-inner`, cards stacked inside
Every /app route wraps content in `fw-app-surface`, puts an `fw-page-header` band
containing `fw-page-inner` with an `h1.fw-heading text-2xl md:text-[1.7rem]` +
`p.fw-muted mt-1 text-sm` subtitle, then a second `fw-page-inner` for the card
stack with `space-y-4 md:space-y-6` and `pb-28 md:pb-8` (mobile-nav clearance).
Evidence: `src/app/app/dashboard/dashboard-client.tsx:121-129`,
`src/components/ui/page-skeleton.tsx:9-24` (the skeleton literally encodes this
anatomy). 38 `fw-page-inner` / 25 `fw-app-surface` / 18 `fw-page-header` uses.
**Check:** any new page section uses these classes, not bespoke max-width/padding
divs. `grep -c 'fw-page-inner' src -r` must not decrease.

### C2 — Card anatomy: white, 24px radius, `border-border`, soft green-tinted shadow, p-5/p-6
The `Card` primitive (`src/components/ui/card.tsx:15-22`) defines it:
`bg-white rounded-[24px] border border-border shadow-[0_12px_30px_rgba(20,90,75,0.07)]`,
padding `p-4` / `p-5 md:p-6` / `p-6 md:p-8`. Ad-hoc cards copy the same shape
(e.g. `quick-actions.tsx:63` uses `rounded-[1.4rem] border border-primary-100/80
bg-white shadow-[0_18px_48px_rgba(22,48,42,0.07)]`). Shadows are always low-alpha
(0.05-0.12) green-tinted rgba — never gray, never Tailwind `shadow-md/lg` alone.
Hero panels use `fw-dark-panel` or `fw-mint-panel`, not new gradients.
**Check:** new cards use `<Card>` (31 files import it) or an existing `fw-*`
panel class; no new `shadow-[...]` literals beyond the existing set (baseline:
~28 distinct arbitrary shadow strings, dominant one `0_12px_30px_rgba(20,90,75,0.07)` x29).

### C3 — Typography: heavy weights, small sizes; `font-black` is the display voice
Weight distribution: `font-black` 762, `font-semibold` 244, `font-bold` 160,
`font-medium` 73. Headlines and stat numbers are `font-black` + `tabular-nums`
(`calorie-ring.tsx:92`, `macro-bar.tsx:45`); labels are tiny uppercase
`text-[10px]|text-xs font-black uppercase tracking-[0.1em..0.14em]`
(`recipe-card.tsx:83`, `calorie-ring.tsx:95`). Page h1 = `text-2xl md:text-[1.7rem]`;
card titles `text-lg`-`text-xl font-black`; body/meta `text-sm`/`text-xs` with
`text-neutral-500` (124 uses) or `fw-muted`. `font-light`/`font-normal` display
text is off-voice.
**Check:** no new headings below `font-bold`; numeric stats carry `tabular-nums`.

### C4 — Color roles: primary=green identity/actions, accent=coral energy/over-target, sky/lemon/teal=category tints, macro colors fixed
- `primary-*`: brand, active nav, positive progress, icon chips, CTAs.
- `accent-*` (coral): logging/photo actions (`quick-actions.tsx:20-21`), the
  highlighted Log tab (`mobile-nav.tsx:17`), and over-target states
  (`calorie-ring.tsx:55` — ring turns `--color-accent-400` when over).
- `sky` = coach/protein-ish info, `lemon` = carbs/review/warning, `teal` = workouts;
  macro tiles always map kcal→primary, protein→sky, carbs→lemon, fat→accent
  (`recipe-card.tsx:21-45`, matching `--color-macro-*` in `globals.css:53-56`).
- Destructive = Tailwind `red-*` (`button.tsx:17-19 danger variant`, `input.tsx:32`,
  `badge.tsx error`), 47 red-role uses.
- Badges/chips: `bg-{hue}-50 text-{hue}-700|800 rounded-full px-2.5 py-1 text-xs font-bold`
  (`badge.tsx:10-16`, `recipe-card.tsx:97-104`).
**Check:** colors come from the `@theme` palette classes (`primary-*`, `accent-*`,
`sky-*`, `lemon-*`, `teal-*`, `sage-*`), semantic roles (`border`, `muted-foreground`,
`card`), or Tailwind `neutral-*`/`red-*` — never new hues, never new hex.

### C5 — Interaction & state conventions
- Buttons: use the `Button` primitive (`button.tsx`, 36 importers). Primary is
  the green→teal gradient `from-primary-500 to-teal-500` with hover/active
  darkening and `shadow-[0_16px_34px_rgba(21,145,108,0.24)]` (`button.tsx:11-13`);
  all variants set `focus-visible:ring-[3px] ring-offset-2`, `min-h-11` mobile
  touch target (`button.tsx:45`), `disabled:opacity-50`, built-in `loading`
  spinner (`button.tsx:60-84`).
- Cards/links hover: `hover:-translate-y-0.5` + border→`primary-200` + deeper
  shadow, `transition-all duration-150` (`quick-actions.tsx:63`,
  `recipe-card.tsx:47`; 11 uses of the lift). Micro-interactions run
  `duration-150` (11 uses; 300+ reserved for progress/ring animations).
- Loading: route-level `loading.tsx` (15 files) rendering `PageSkeleton`
  (14 importers) — `Skeleton` is `animate-pulse rounded-xl bg-neutral-200/70`
  (`skeleton.tsx:11`). Inline loading = `Button loading` spinner or a quiet
  `text-sm text-neutral-500` line (`coach-activity.tsx:30`). No third-party
  spinners.
- Empty states: `EmptyState` primitive (`empty-state.tsx`) — centered `py-16`,
  14x14 `bg-neutral-100 rounded-2xl` icon tile, `text-lg font-semibold` title,
  `text-sm text-neutral-500 max-w-sm` body, optional primary Button.
- Icons: **lucide-react only** (78 importing files, zero other icon libs),
  typically `w-5 h-5` in a tinted chip (`fw-icon-chip` or `p-3 rounded-[1rem]
  bg-{hue}-50 text-{hue}-600`, `quick-actions.tsx:65`); `h-3.5 w-3.5` inside
  text-level chips; `h-4 w-4` inline with `text-sm`.
- A11y habits to preserve: `aria-label`/`role` on data viz (`calorie-ring.tsx:59`,
  `macro-bar.tsx:50-57`), `aria-current="page"` on nav (`mobile-nav.tsx:40`),
  `pb-[max(env(safe-area-inset-bottom),0.5rem)]` on fixed bottom bars
  (`mobile-nav.tsx:29`).

---

## 3. Measurable checks + current baselines (2026-07-22)

Run from repo root. Fix nodes must not make any baseline number *worse*.

| # | Check (command) | Baseline | Rule |
|---|---|---|---|
| B1 | `grep -rInE '#[0-9a-fA-F]{6}\b' src --include='*.tsx' --include='*.ts' \| grep -v globals.css \| wc -l` | **427** | Must not increase. Ideally decreases as fix nodes tokenize hexes in their own territory. |
| B2 | Distinct hex values in tsx: `grep -rhoE '#[0-9a-fA-F]{6}\b' src --include='*.tsx' \| sort -u \| wc -l` | **25** (dominant: `#16302a` x217, `#f4f8f6` x58, `#54635d` x31, `#60776f` x21) | No NEW distinct hex values. |
| B3 | Distinct arbitrary radii: `grep -rhoE 'rounded-\[[^]]+\]' src --include='*.tsx' \| sort -u \| wc -l` | **32** distinct (dominant: `[1rem]` x71, `[1.25rem]` x54, `[1.5rem]` x43, `[1.35rem]` x40, `[1.15rem]` x38, `[24px]` x24) | No new radius literals; reuse one of the dominant six or a standard class (`rounded-full` x341, `rounded-2xl` x101, `rounded-xl` x37). |
| B4 | Distinct arbitrary shadows: `grep -rhoE 'shadow-\[[^]]+\]' src --include='*.tsx' \| sort -u \| wc -l` | **28** distinct | No new shadow literals; reuse Card/Button/existing ones. |
| B5 | Icon libraries: `grep -rlE 'from "(react-icons\|@heroicons\|@radix-ui/react-icons\|@tabler)' src \| wc -l` | **0** (lucide-react in 78 files) | Must stay 0. |
| B6 | Route loading files: `find src/app -name loading.tsx \| wc -l` | **15** | New routes get one, rendering `PageSkeleton`. |
| B7 | `min-h-11` touch targets: `grep -rho 'min-h-11' src --include='*.tsx' \| wc -l` | **47** | Interactive mobile targets keep >=44px convention. |
| B8 | `fw-page-inner` uses: `grep -rho 'fw-page-inner' src --include='*.tsx' \| wc -l` | **38** | Must not decrease; new page sections use it. |
| B9 | UI-library count: `grep -E '"(@mui\|@chakra\|@mantine\|antd\|daisyui)' package.json \| wc -l` | **0** | Must stay 0 (stack = Tailwind v4 + @base-ui/react + shadcn tokens). |

Spacing scale actually used (for reference, not a hard gate): gaps cluster at
`gap-2/3/4` (282/279/120) and vertical rhythm at `space-y-4` (60) with
`md:space-y-6`; anything outside 1-8 (e.g. `gap-7`, `space-y-9`) is off-scale.

---

## 4. Known existing violations (do NOT copy; fair game inside your own node's territory)

1. **Hardcoded hex instead of tokens — 427 occurrences.** `#16302a` (x217) is
   literally `--foreground`; `#f4f8f6`/`#f2f7f5` ≈ `--muted`; `#516b63` clones
   exist as `#54635d`, `#60776f`, `#6f8981`, `#6e8981`, `#91a7a0` — five near-identical
   muted greens that should all be `text-muted-foreground`/`fw-muted`.
   Examples: `recipe-card.tsx:64` (`text-[#16302a]`), `recipe-card.tsx:100`
   (`text-[#60776f]`), `page-skeleton.tsx:18` (`bg-[#123d32]/85`).
   (The 3 Google-brand hexes in `ui/google-icon.tsx` are legitimate.)
2. **Radius sprawl — 32 distinct arbitrary values.** The `--radius-*` scale in
   `globals.css:87-93` is essentially unused; components hand-roll
   `rounded-[1.05rem]`, `[1.1rem]`, `[1.15rem]`, `[1.2rem]`, `[1.25rem]`,
   `[1.3rem]`, `[1.35rem]`... Don't add value #33; converge on the dominant six.
3. **Shadow sprawl — 28 distinct arbitrary shadow strings** that are all minor
   variations of the same green soft shadow.
4. **`EmptyState` primitive exists but has only 1 importer**; at least 6 files
   hand-roll "No X yet" empty copy inline (e.g. `coach-activity.tsx:32-34`).
   New empty states should use the primitive.
5. **Dead/unbranded dark theme** — `.dark` block (`globals.css:177-209`) is
   default shadcn gray, never activated. Do not build features on `dark:` variants.
6. **Semantic-role vs palette mismatch** — `Badge` "success" and "default" both
   use `primary-50` (`badge.tsx:10-11`); `--chart-5: #8e73bd` (purple) appears in
   tokens but nowhere in the palette family.
7. **Off-primitive buttons/inputs** exist in older feature code (raw `<button>`
   with copied classes, e.g. `recipe-card.tsx:109-116` builds its own CTA row).
   Acceptable to leave, but new CTAs use `Button`.

---

## 5. What NOT to do

- **No new hex values** anywhere outside `globals.css` (B2 gate). Prefer
  Tailwind theme classes (`text-primary-700`, `bg-accent-50`) or `var(--color-*)`.
- **No new radius literals** (B3) and **no new shadow literals** (B4) — reuse.
- **No second UI library** (no MUI/Chakra/Mantine/daisyUI/Radix-themes; B9) and
  **no second icon library** (lucide-react only; B5).
- **No new fonts or font weights below bold for display text** — voice is
  `font-black`/`font-bold`, fonts come from `--font-fw-display|body|mono`.
- **No new bespoke page scaffolding** — never re-implement max-width containers,
  header bands, or page gradients; use `fw-page-inner`/`fw-page-header`/`fw-app-surface`.
- **No new gradient recipes** — the only sanctioned gradients are the Button
  primary (`from-primary-500 to-teal-500`), `fw-dark-panel`, `fw-mint-panel`,
  and the body/app-surface backgrounds in `globals.css`.
- **No gray or heavy shadows** (`shadow-md`, `shadow-black/*`) — shadows are
  soft, large-blur, green-tinted rgba at alpha <= 0.24.
- **No `dark:` variants** — dark mode is not shipped.
- **No third-party spinners/loaders** — `Skeleton`/`PageSkeleton`/`Button loading` only.
- **No removing** `tabular-nums`, `aria-*`, safe-area padding, `min-h-11`, or
  `prefers-reduced-motion` accommodations (`globals.css:373-382`) while restyling.
- **No `next build` for verification** (project rule) — `tsc --noEmit` + dev server.

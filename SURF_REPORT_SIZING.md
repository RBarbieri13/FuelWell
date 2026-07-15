# Surf Report — Sizing, Spacing, and Type Scale (`surf/parallel-sizing`)

Autonomous density/legibility campaign over every iPhone-reachable screen.
Benchmark frame: how much factual, legible content a MyFitnessPal / Apple
Fitness / Lose It / Cronometer-class screen shows per viewport versus FuelWell.
Scope was strictly dimensional (type sizes, paddings, margins, gaps, component
heights, mobile grids). No section reordering, no color/border work — those
belong to the sibling campaigns.

## Method

- 22 routes × 3 widths (320/390/430, height 844, DPR 2), screenshotted after
  hydration (networkidle + zero `.animate-pulse`). Harness:
  `scripts/surf-sizing-audit.mjs`.
- Density metrics per route at 390px: text characters in first viewport,
  fraction of viewport bands containing text, display type ≥28px, sub-11px
  type, and card-like blocks taller than 25% of the viewport.
- 7 simulated personas walked core journeys with lens-specific measurements:
  `scripts/surf-sizing-personas.mjs` → `surf-evidence/sizing/persona-report.json`.
- Every change is phone-only (`md:` breakpoints preserve desktop) and was
  gated on `tests/mobile-component-clipping.spec.ts` (18 checks, includes
  320px pass) plus the full chromium suite.

## Headline numbers (first viewport @390, before → after)

Total legible characters across all 22 routes: **8,379 → 9,441 (+13%)**.
Instances of ≥28px display type in first viewports: **31 → 7** (survivors are
deliberate: calorie-ring figure, score hero 48px, workout titles 27–36px).

| Route | chars | tallest card (× viewport) | display type ≥28px |
|---|---|---|---|
| /app/dashboard | 351 → 369 (+5%) | 0.57 → 0.48 | 34 → 34 (calorie ring figure — kept) |
| /app/daily-review | 467 → 536 (+15%) | **1.43 → 0.99** | 30 → none |
| /app/log | 310 → 346 (+12%) | 1.15 → 1.12 | — |
| /app/coach | 442 → 470 (+6%) | 0.50 → 0.45 | 30 → none |
| /app/coach/attachments | 481 → 501 (+4%) | 0.77 → 0.69 | 30,30 → none |
| /app/coach/menu-review | 471 → 494 (+5%) | 0.67 → 0.60 | 30,30 → none |
| /app/nutrition | 352 → 451 (**+28%**) | 5.06 → 4.54 (page wrapper) | 30,28,28 → none |
| /app/workouts | 419 → 486 (+16%) | 0.39 → 0.39 | 30 → none |
| /app/workouts/low-impact-strength | 316 → 323 (+2%) | 0.88 → 0.88 | 36 → 36 (workout hero title) |
| /app/workouts/…/live | 488 → 503 (+3%) | 0.65 → 0.65 | 30,30 → none |
| /app/fitness | 389 → 520 (**+34%**) | 0.33 → 0.31 | 30,28,28 → none |
| /app/grocery-list | 316 → 316 (0%) | 0.41 → 0.41 | 30,42 → 32 |
| /app/recipes | 342 → 362 (+6%) | 0.61 → 0.61 | 30 → none |
| /app/meal-plan | 399 → 419 (+5%) | 0.50 → 0.48 | 30,30 → none |
| /app/progress | 373 → 440 (+18%) | 0.56 → 0.50 | 30,28 → none |
| /app/recovery | 392 → 479 (+22%) | 0.69 → 0.68 | 30,30,48 → 36 |
| /app/onboarding | 352 → 352 (0%) | 0.77 → 0.77 | 30,28 → 28 |
| /app/profile | 259 → 356 (**+37%**) | 0.69 → 0.50 | 30,36 → none |
| /app/settings | 308 → 413 (**+34%**) | 0.56 → 0.46 | 30,36 → none |
| /app/activity | 431 → 475 (+10%) | 0.78 → 0.77 | 30,30 → none |
| /app/dashboard/score | 479 → 588 (+23%) | 0.43 → 0.37 | 72,30,36 → 48,30 |
| /signup?preview=new-user | 242 → 242 (0%) | 0.66 → 0.65 | 30 → none |

Full metric dumps: `surf-evidence/sizing/before/audit.json`,
`surf-evidence/sizing/after/audit.json`.

## What was wrong (benchmark comparison)

1. **Page headers spent ~25% of the viewport before any data.** Every screen
   opened with a 30px title + 17px subtitle + 28px vertical padding under a
   68px top bar. MFP/Lose It keep phone page titles at 20–24px in a bar half
   that height.
2. **Hero/explainer cards with 30–34px multi-line headlines** pushed all data
   below the fold on dashboard, coach, recovery, score, activity, meal-plan,
   attachments, menu-review.
3. **Single-fact components at full width**: each nutrition macro got a
   ~300px full-width card (4 macros ≈ 3 viewports); Cronometer shows the same
   four numbers in ~120px. Profile/settings dark cards spent 0.7 viewport on
   a name and three one-word chips.
4. **Display numerals out of proportion to importance**: 72px score hero,
   48px readiness score, 42px grocery counter, 36px account names.
5. **Sub-legible micro-labels**: 10–11px uppercase captions on bottom nav and
   every stat tile — below the product's own 12px caption floor.

## Changes (15 commits, all phone-only)

Shared components/patterns first, per the campaign brief:

1. `8a43e4d` — app-wide page headers: titles `text-3xl → text-2xl`, subtitles
   `text-base → text-sm`, header padding `py-7 → py-5` (17 files).
2. `4296cf0` — `Card` default padding `p-6 → p-5` on phones; page stacks
   `space-y-6 → space-y-4` (16 files).
3. `e3bd6e6` — dashboard: decision-hero headline 33.6 → 25.6px (3 lines → 2),
   hero padding 24 → 20px, stat-pill numerals 26 → 23px, greeting `py-6 → py-4`.
4. `7b87cc0` — daily-detail surfaces (daily-review, nutrition, fitness):
   **macro/summary tile grids 1-up → 2-up below 640px**, tile values 28 → 24px,
   labels 16 → 14px, section/hero h2s 24 → 20px, paddings one step down.
5. `11c4a60` — log: 48px search input, tighter hero prose and card stacks.
6. `c978a1a` — coach hero 30 → 24px + padding.
7. `c52ad3c` — grocery: 42 → 32px counter, compact week card.
8. `61e0612` — recovery: 30 → 24px headline, 112 → 96px score tile, 30 → 24px
   signal values.
9. `e54a64c` — score: 72 → 48px hero figure, 36 → 30px contributor scores.
10. `f10a9f3` — activity/meal-plan/menu-review/attachments/live-workout/
    progress/onboarding: all remaining 30px in-card heroes and stat numerals
    down one step; `px-7 py-7` panels → `px-5 py-5` on phones.
11. `4d7ca0d` — profile + settings account heroes: names 36 → 24px, avatar
    96 → 64px, stat chips 2-up (3-up ≥sm) with full labels legible at 320px.
12. `819f5a4` — mobile top bar `py-3 → py-2` (8px on every screen).
13. `3072009` — persona-consensus: 12px caption floor everywhere (bottom nav,
    EnergyStat/MiniMetric, meal-plan/recipes tiles, calorie ring); workout
    back-links `min-h-11`.
14. `ebb2aaa` — workout detail title 36 → 27px.

## Persona findings

Personas: Maria (68, low vision), Dev (data-dense power user), Jess
(one-handed iPhone SE), Tom (new user), Priya (athlete mid-workout), Sam
(weekly planner, 430px), Ravi (score-chaser).

- **Unanimous**: 11px bottom-nav labels and 10–11px stat captions flagged on
  every route by every legibility-lens persona → fixed (12px floor).
- **Priya**: 36px-tall back links on workout screens → fixed (`min-h-11`);
  she also confirmed live-session key figures stayed ≥22px after compaction
  (no over-shrinking of mid-workout figures).
- **Dev**: after the tile-grid change, nutrition/fitness first viewports carry
  16 numeric facts (was 4–7); no screen on his journey below 6 facts.
- **Final residual friction** (2 items, accepted): grocery-list (4 facts) and
  recovery (5 facts) first viewports — see non-changes.

## Deliberate non-changes

- **Daily-review's duplicated section header + hero header** (the 1.43×
  wrapper): dimensional trims took it to 0.99×, but the real fix is removing
  the duplicated explainer block — that is screen *structure*, owned by the
  layout sibling campaign.
- **Grocery/recovery fact counts**: adding more figures to the first viewport
  would mean moving sections up (structure) or cramming; density ≠ cramming.
- **Signup/onboarding**: forms already fit their viewport; no shrink applied
  beyond the shared header pass (0% char change is fine there).
- **Calorie-ring 34px figure and 48px score hero**: primary data figures keep
  visual rank; the brief was scale coherence, not uniform smallness.
- **Chips/touch targets at 44px**: kept ≥44px everywhere (filter chips, meal
  buttons, nav icons) even where 32px chips would look denser.
- **Token file (`globals.css`)**: untouched apart from nothing — all fixes are
  utility-step changes at component/page level, per the "no wholesale token
  redesign" constraint.

## Evidence

- Committed: `surf-evidence/sizing/{before,after}/audit.json`,
  `surf-evidence/sizing/persona-report.json`, and before/after 390px PNGs for
  the seven most-changed screens (dashboard, daily-review, nutrition, profile,
  settings, score, recovery).
- On disk (untracked, ~47MB): the full 22-route × 3-width × before/after PNG
  matrix under `surf-evidence/sizing/before/` and `.../after/`.

## Exit gates (all green)

- `npm run lint` — clean
- `npx tsc --noEmit` — clean
- `npm run test:unit` — 36 files, 271 tests passed
- `npx playwright test --project=chromium` (base URL :3012) — **71 passed,
  0 failed**, 12 skipped (pre-existing: live-Coach E2E gated on
  `ANTHROPIC_API_KEY`, unrelated to this campaign)
- `tests/mobile-component-clipping.spec.ts` — 18/18 after every commit

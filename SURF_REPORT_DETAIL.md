# SURF report — component detail, design, and structure

Campaign: fully autonomous component-level refinement across every app page.
Branch: `surf/parallel-detail` (base `8feac69`). Sibling campaigns own screen
layout/structure and sizing/spacing/type-scale; this campaign owns component
internals: color shading and contrast, borders, radii, shadows, icon usage,
microcopy inside components, interactive states, affordance clarity, and fit
at 320px.

Evidence: `surf-evidence/detail/before/` (66 shots, 22 routes x 320/390/430,
captured at base) and `surf-evidence/detail/after/` (same grid, captured at
campaign head). Run artifacts in `surf-runs/20260714-detail-component-refinement/`.

## Goal function

See `surf-runs/20260714-detail-component-refinement/goal.md`: token discipline,
border/radius/shadow consistency, AA-reasonable contrast, state completeness,
affordance clarity (no dead affordances), internal fit at 320, specific
microcopy with units.

## What changed (by theme)

### 1. Token discipline (no visual drift intended)
- Added `teal-400/500/600` tokens; the primary gradient endpoint was spelled
  five different ways (`#159aa2 #138893 #1592a0 #159aa0 #19a4ad`) across
  button/workouts/live-session/grocery/onboarding — all now use the tokens.
- `--border` promoted to the canonical card border (`#e6efeb`); Card primitive
  and 7 files' near-duplicate border greys (`#dce8e3 #e0ebe6 #dcebe5 #d6e2dd
  #e8f0ec #e8eee9 #d8e7e1`) collapsed to `border-border`. Zero raw border
  hexes remain in src.
- Badge warning uses `text-lemon-700` (was raw `#7a650d`); ring components use
  CSS var strokes instead of hex literals.

### 2. One macro color language (semantic fix)
Protein was green on progress/coach but sky on dashboard/log (two different
blues even: `#3e92c9` vs `#3e98cf`); fat was purple in MacroHistoryChart and
DailyRecapCard rendered calories and protein the same green. `--color-macro-*`
tokens are now the single source (calories=green, protein=sky, carbs=lemon,
fat=coral) and every bar/chart/tile consumes them. Protein icon unified on
Beef (Dumbbell is the Move/workout icon).

### 3. Contrast (WCAG)
- Muted text unified on `#516b63` (5.0+:1 on white, 5.2:1 on mint) via
  `--muted-foreground`, `.fw-muted`, the coach artifact-scope remap, and ~150
  inline grey literals (`#78928a #7c968f #91a7a0 #9db0aa` etc., 2.5-3.4:1)
  now `text-muted-foreground`.
- mobile-nav inactive labels and sidebar inactive icons neutral-400 -> 500;
  meaningful neutral-400 labels on recovery/activity/dashboard raised to 500.
- Recipe dark-panel stat labels white/55 -> white/70.
- Grocery unchecked-circle affordance was `#cfe0da` (1.4:1, invisible) -> 
  primary-400; delete icons `#c9d6d1` -> neutral-400 with red hover.
- Placeholders intentionally remain lighter (`#91a7a0`) — exempt.

### 4. Dead affordances removed / made real
- Dashboard header: Search button had no handler -> links to /app/log; Bell
  button with a permanent fake unread dot removed; static avatar initial ->
  links to /app/profile.
- Grocery and Progress headers: static "M" circles styled as primary buttons
  removed.

### 5. States and intuitiveness
- Bottom nav: active tab is now uniquely bold + colored; the Log CTA keeps its
  accent icon but no longer impersonates the active tab; Move gets teal so it
  stops sharing Coach's sky.
- Progress weight input: wrapper gains focus-within ring (inner input is
  outline-none).
- CalorieRing compact chip: removed conflicting duplicate text color.

### 6. Microcopy and units
- Daily-review surface: developer narration ("so people can see", "stay
  together so the day reads") replaced with user-facing copy; duplicate
  "Today's whole picture" hero de-duplicated; protein target gains its "g".
- Health score shows "/100" scale on the score page.
- Coach composer + recipes search placeholders no longer clip at 320.
- Recipes "30G+" stat -> "30g+ protein".
- Mobile header title chip: meal-plan/recipes/activity/onboarding added (was
  a redundant "FuelWell" pill).

### 7. Fit and radius families
- Grocery header pills no longer wrap at 320 (icons decorative >= sm).
- Outlier card radii (26px, 22px, 1.6rem, 1.55rem) collapsed to the Card
  primitive's 24px family on dashboard/grocery/workouts/daily-review chart.

## Persona review (swarm)

8 personas (ER nurse on SE-width, low-vision senior, data analyst, keyboard
user, one-handed parent, skimming lifter, in-store meal-prepper, product
designer) across 4 reviewer agents exercised the live app headlessly at
320/390 and returned 38 structured findings. Verdicts in
`surf-runs/20260714-detail-component-refinement/findings/persona-summary.md`.

Consensus items fixed:
- Plain-language rewrite of the daily-review overview line ("active burn",
  "net room" jargon flagged).
- Coach hero pills parallelized ("kcal left" / "protein left").
- Dashboard "Details" text link gained a chevron (drill-down affordance
  consistency).
- Diet-filter chips joined the tinted-chip family used by the adjacent
  preference chips on Log (one unselected treatment).
- Progress protein bar switched to the `bg-macro-protein` token.
- Recipes search placeholder shortened again (still clipped at 320).
- Profile edit-name pencil raised to a 44px hit target.
- Bottom-nav active state was explicitly praised post-fix ("clear and
  consistent across all pages").

Rejected after skeptic reproduction (evidence in findings summary): "grocery
list doesn't render" (fullPage-screenshot artifact of the inner-scroll
layout — items verifiably render), "live workout has no set controls" (they
appear after Begin), "protein bars missing on progress" (query artifact),
unlabeled composer icons (aria-labels present), plus out-of-lane items
(thumb reach, type scale, segmented-control spacing) left to the sibling
campaigns.

## Contrast flags (not fixed, documented)

- `teal-600` (#138893) at ~4.0:1 is used for small chip text in the new teal
  tone — acceptable for large/bold accents, borderline for xs text.
- Placeholder text (`#91a7a0`, 2.55:1) kept light by convention on all inputs.
- Dark-panel `white/60-70` secondary text is 4.5-6:1 on the deep green —
  passes; `white/55` instances outside recipes were not audited exhaustively.

## Deliberate non-changes

- 218 `#16302a` literals NOT swapped to `text-foreground`: identical rendered
  color, huge diff surface — merge-conflict risk with sibling campaigns
  outweighed the token-hygiene gain.
- Signup page untouched: pixel-level tests guard the preview disclosure and
  first-viewport CTA.
- Onboarding's nested mint-in-white welcome card (brand rule "no nested
  decoration cards") left alone: restructuring is the layout campaign's lane.
- `rounded-[13px]` icon chips kept: they match the `fw-icon-chip` 0.8125rem
  idiom. `0.95rem`/`1.05rem` chip radii kept: consistent in-page idioms.
- Settings page's huge blank scroll regions in full-page captures: appears to
  be lazy/scroll rendering, not a component defect; flagged for the layout
  campaign.

## Test updates (copy-following, not weakening)

Three selectors updated to the improved copy, one line each: recipes search
`getByLabel("Search recipes")` (was the old aria-label) in
`tests/recipe-planning.spec.ts` + `tests/mobile-persistence-journeys.spec.ts`,
and the coach composer placeholder in `tests/smoke.spec.ts`. Assertions and
strictness unchanged.

## Gates (final, run at campaign head)

- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run test:unit` — 36 files, 271/271 passed.
- `FUELWELL_PLAYWRIGHT_BASE_URL=http://localhost:3013 npx playwright test
  --project=chromium` — **71 passed, 0 failed**, 12 skipped (auth-gated
  journeys that require FUELWELL_UI_TEST_EMAIL/PASSWORD; skipped on base
  too). One persistence-journey round flaked once under parallel load and
  passes in isolation and on the final full run.

## Evidence

- Before: `surf-evidence/detail/before/` (66 png, captured at base 8feac69).
- After: `surf-evidence/detail/after/` (66 png, same grid at campaign head).
- Note when reading full-page captures: the app scrolls inside `main`
  (h-dvh + overflow-hidden shell), so fullPage screenshots do not expand
  inner scroll content — long pages appear to have blank tails. This is a
  capture artifact, not a rendering bug (verified via DOM scrollHeight).

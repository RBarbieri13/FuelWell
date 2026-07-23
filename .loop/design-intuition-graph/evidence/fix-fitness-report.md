# fix-fitness — implementation report

Node: `fix-fitness` (design-intuition graph). Implements audit-fitness.md findings on
/app/workouts, /app/fitness, /app/recovery, /app/activity plus their components and
`src/lib/workout-library.ts`. Shared shell/ui surfaces untouched (frozen). Verified
against the shared dev server at http://localhost:3000 (preview mode), Playwright
chromium, desktop 1280x800 / mobile 390x844 (iPhone 12 profile).

**Before screenshots:** the audit's `audit-fitness-*.png` set is the before state for
every finding below. Regenerating befores post-change would have required stashing the
working tree, which other graph nodes were concurrently editing — not done. After
screenshots are `fix-fitness-after-*.png` in this directory.

## Per-finding before → after

### W1 (HIGH) — exercise plans contradicted the workout's own copy — FIXED, measured
- Root causes fixed in `src/lib/workout-library.ts`:
  1. `mobility-reset` was `category: "full"` → now `"mobility"` (+ label "Mobility").
     Live/detail plan is now 90/90 switch, thoracic reach, couch stretch, ankle rocks,
     scapular wall slide — matching its own "Mobility flow" block copy — timed, 1 set,
     no weight fields.
  2. Same bug class found in audit sweep: `zone-2-ride` was `category: "lower"` (a bike
     ride whose fallback plan was goblet squats + Romanian deadlifts) → now `"cardio"`;
     its live plan is the timed cardio flow.
  3. The mixed `upper` exercise bank put pull moves in push days and vice versa. Added
     `upper-push` / `upper-pull` banks and `resolveExercisePlanKey()` which keys off the
     workout's title/focus/goal; wired through `getWorkoutExercisePlan` and the
     generated-workout builder (`targetMuscles` + `exercisePlan` both use the resolved
     key, so the "Upper push …" / "Upper pull …" generated families are fixed too).
  4. `live-workout-session.tsx`: "Weight used" inputs are no longer rendered for
     Mobility/Cardio/Recovery sessions (`tracksWeight`); strength sessions keep them.
- Measured: mobility-reset live has 90/90 switch, no Dumbbell press/Split squat, no
  weight fields; upper-push-base live has no One-arm row/Lat pulldown/Face pull and
  keeps weight fields; upper-pull-posture live has no press moves; zone-2-ride live is
  the timed cardio plan with no weight fields.
- Evidence: `fix-fitness-after-w1-mobility-live-desktop.png`, `…-mobile.png`,
  `fix-fitness-after-w1-upperpush-live-desktop.png` (before:
  `audit-fitness-workout-detail-seg1.png`, `workout-live-begun.png`, `workout-live-mobile.png`).
- NOTE: workout-library.ts is shared with coach tools (`resolveWorkout`,
  `buildPlanFromLibrary`) — full unit suite green (333/333) after the change.

### W2 (HIGH) — completing a live workout was a dead end — FIXED, measured
- `live-workout-session.tsx`: on save, the sticky bar becomes a completion panel —
  "Workout logged · N/N sets saved to today's activity" with three onward links:
  **Review in Activity** → `/app/fitness` (primary, respects the new naming),
  **Log post-workout protein** → `/app/log`, **Done** → `/app/workouts`. All ≥44px.
- The parallel detail-page path (`workout-log-actions.tsx`) renamed "Review in fitness"
  → "Review in Activity" for consistency.
- Measured (both viewports): Begin → check sets → Log completed workout → panel renders,
  "Review in Activity" navigates to /app/fitness where the logged session appears live.
- Evidence: `fix-fitness-after-w2-completion-desktop.png`, `…-mobile.png`
  (before: `audit-fitness-workout-completed.png`).

### A1 (HIGH) — /app/activity daily log ignored real workouts — FIXED, measured
- `src/app/app/activity/page.tsx` now reads the same `useWorkoutLog` store /app/fitness
  reads and merges logged sessions into the timeline chronologically (badge **Logged**).
  The four canned rows remain, relabeled **Sample** (neutral badge) per the audit's fix
  definition; the "Data honesty" note now states that explicitly. The "4 signals" count
  is dynamic (`N signals`).
- Live re-run (work-order requirement): completed Mobility reset via the live session →
  it appeared on /app/activity ("5 signals", "Mobility reset · Logged") in the same
  session, both viewports.
- Evidence: `fix-fitness-after-a1-activity-desktop.png`, `…-mobile.png`
  (before: `audit-fitness-activity-seg2.png` vs `fitness-after-complete.png`).

### F1 + A4 (HIGH/LOW) — naming/identity — FIXED on page surfaces
- /app/fitness H1: "Fitness detail" → **"Activity detail"** (matches fix-shell's mobile
  chip; sidebar/tab active-state aliases were already landed by fix-shell). Subtitle
  unchanged. Inherited fix-shell deferral closed.
- Consistency sweep: nutrition-detail cross-card ("Fitness detail/Open fitness" →
  "Activity detail/Open activity detail", detail-surfaces.tsx), dashboard next-action
  copy (`fuelwell-data.ts:288`), launch-preflight checklist label
  (`launch-preflight.ts:42`), and the live-session "Saved to Fitness" button (gone, W2).
- Scoping + cross-links per the audit's second option: /app/activity keeps its
  "Activity · fuel timing" identity and gains "Open activity detail" → /app/fitness in
  the Daily activity log header; /app/fitness gains "Fuel timing verdict" →
  /app/activity next to "View full day".
- Full merge of the two pages: deferred (below).
- Evidence: `fix-fitness-after-f1-fitness-desktop.png`, `…-mobile.png`.

### F2 (MEDIUM) — "Edit routine" self-link no-op — FIXED, measured
- The chip now targets `/app/fitness#edit-activity`; the "Edit today's activity" panel
  (`FitnessWorkoutManager`) is wrapped in `id="edit-activity"` with `scroll-mt-24`.
  Measured: click → hash `#edit-activity`, panel scrolled into view. From /app/daily-review
  the same chip now lands on the fitness edit panel instead of a plain page swap.
- Evidence: `fix-fitness-after-f2-edit-anchor-desktop.png` (before: `audit-fitness-fitness-seg1.png`).

### F3 (LOW) — duplicated chip pair — REDUCED
- The generic per-card "Open workouts" chip (3x per page + header CTA = 4 routes to the
  hub) is replaced by a contextual **"Open workout"** chip that renders only when the
  entry maps to a library workout. Chips keep `min-h-11` mobile / `md:min-h-0` desktop —
  the app-wide convention; desktop 32px height left as-is to match every sibling chip.

### F4 (LOW) — planned cards didn't link to the workout they name — FIXED, measured
- Static planned entries (`zone-2-ride`, `mobility-reset`) carry explicit `workoutHref`s;
  logged sessions recover theirs from the `live-<id>-<ts>` / `workout-<id>-<ts>` id
  pattern. Measured hrefs: `/app/workouts/zone-2-ride`, `/app/workouts/mobility-reset`
  (both the planned card and the logged session linked).

### R1 (MEDIUM) — decorative Today/3/7-day toggle — REMOVED (audit's sanctioned option)
- There is no multi-day data to window; the toggle changed one sentence only. Removed
  the control and the `windowEstimateCopy` map; the What-is-estimated box states the
  Today scope plainly. (Also removes R1's half of A5's undersized toggles.)
- Evidence: `fix-fitness-after-r1r2-recovery-desktop.png`, `…-mobile.png`
  (before: `audit-fitness-recovery-seg0.png` vs `recovery-7days.png`).

### R2 (MEDIUM) — "iscalculated" typo — FIXED
- Sentence rewritten as static copy: "Today's readiness is calculated from your logged
  sleep, hydration, and soreness…". Measured: no "iscalculated" in rendered text.

### R3 (LOW) — checklist rows point nowhere — FIXED
- Rows are links: Sleep/Hydration/Soreness → `/app/daily-review` (the audit's named
  editing surface), "Wearable sync (Missing)" → `/app/settings`; hover arrow affordance
  matches the page's existing ActionLink pattern.

### R4 (LOW) — inert "Tonight target" pills — NOW QUICK ACTIONS
- "+1 bottle" → `/app/daily-review`, "25g protein" → `/app/log`; both are ≥44px links
  with icons (audit's "make them quick-log actions" option).

### A2 (MEDIUM) — Now/After-workout/Tonight toggle changed one label — REMOVED
- Same pattern as R1 (audit's sanctioned option). Confidence label is now the neutral
  "Current confidence". A5's activity-page half is moot with the control gone.

### A3 (MEDIUM) — timeline entries not clickable — FIXED
- Every row links per the audit's from→to table: Breakfast/Lunch gap → `/app/log`,
  Walk detected → `/app/fitness`, Planned workout → `/app/workouts/zone-2-ride`,
  logged sessions → `/app/fitness`.

### W3 (MEDIUM) — library table hid its action column — FIXED, measured
- Redundant Preview column removed (row title remains the link); table `min-w` 72rem →
  64rem. Residual sideways scroll (Equipment/Goal at narrow desktop) now gets a
  measured scroll affordance: the header hint bar appears on desktop only when the
  table actually scrolls (ResizeObserver), reading "Scroll the table sideways for the
  equipment and goal columns." Measured at 1280: scrollable=true, hint visible; the
  clipped columns are informational only — the action lives in column 1.
- Evidence: `fix-fitness-after-w3w4-library-desktop.png` (before: `audit-fitness-workouts-library-seg1.png`).

### W4 (MEDIUM) — generated permutation flood — PARTIAL (ranking half)
- Search results in the library now rank curated workouts ahead of `generated-*`
  variants (stable partition, view-only — `searchWorkouts` itself untouched so coach
  search behavior is unchanged). Measured: "core" → Core anti-rotation, Core finisher
  first. Detail-page "Close matches" scoring gives curated items a +12 boost.
- Collapsing variants into one row per base workout: deferred (below).

### W5 (LOW) — 32px alternate-pick rows — FIXED, measured
- Coach-card alternate links get `min-h-11`; measured 44px at 390px.

### W6 (LOW) — dead disabled CTA before session start — FIXED, measured
- Sticky bar shows **Begin** until started, then swaps to "Log completed workout"
  (never rendered disabled-by-default pre-start). Measured: 0 log buttons pre-start.
- Evidence: `fix-fitness-after-w6-live-started-desktop.png`.

### W7 (LOW) — triple-collapsed hub — FIXED
- "Coach recommends" now auto-expands (`showRecommendation` defaults true); the pick,
  reason, and alternates are visible on first load. "Pick my own"/"Activity" stay
  collapsed (progressive disclosure preserved; its Playwright spec still passes its
  library-secondary assertions).
- Evidence: `fix-fitness-after-w7-workouts-desktop.png`, `fix-fitness-after-w5w7-workouts-mobile.png`
  (before: `audit-fitness-workouts-desktop.png`).

## Files changed

- `src/lib/workout-library.ts` — W1 (categories, push/pull banks, plan-key resolver),
  W4 (curated boost in getSimilarWorkouts).
- `src/components/workouts/live-workout-session.tsx` — W1 (weight-field gating),
  W2 (completion panel), W6 (sticky Begin), naming.
- `src/components/workouts/workout-log-actions.tsx` — naming ("Review in Activity").
- `src/components/workouts/workouts-view.tsx` — W3, W4 (view ranking), W5, W7.
- `src/components/daily-detail/detail-surfaces.tsx` — F1 (H1 + link card naming),
  F2 (anchor), F3/F4 (chips + workoutHref), cross-link to /app/activity.
  ⚠ Co-edited concurrently by another graph node (planned-vs-completed totals split in
  `calculateFitnessTotals`); both edit sets verified coexisting.
- `src/app/app/activity/page.tsx` — A1, A2, A3, cross-link, Sample/Logged badges.
- `src/app/app/recovery/page.tsx` — R1, R2, R3, R4.
- `src/lib/fuelwell-data.ts`, `src/lib/launch-preflight.ts` — one naming string each
  ("Fitness detail" → "Activity detail"; outside listed territory but required for A4/F1
  label agreement).
- `tests/smoke.spec.ts` — heading assertion updated to "Activity detail".
- `tests/workouts-progressive-disclosure.spec.ts` — Preview-button assertion → row-title
  link (column removed by W3).

No `src/components/layout/*` or `src/components/ui/*` edits. No commits made.

## Ruleset compliance (design-ruleset.md)

- B2: zero new distinct hex values (new elements reuse `#f4f8f6`/`#54635d`/`#16302a`
  to match sibling chips). B1 occurrence delta in my diff: +4/−1 (all existing values).
- B3/B4: zero new radius or shadow literals — reused `rounded-[1.15rem]`, `rounded-full`,
  existing shadow strings only.
- B7: `min-h-11` +10/−3 in my diff (net +7); every new interactive element ≥44px mobile.
- B5/B9: lucide-react only; no new libraries. C1–C5 anatomy/typography/color/interaction
  conventions followed (Card/Button primitives, existing chip patterns, `duration`/hover
  conventions untouched).
- Removed controls (R1/A2 toggles) were decorative per audit; removal is the audit's
  sanctioned fix, not a baseline regression.

## Test / verification output

- `pnpm exec eslint` on all files I changed — clean.
  ⚠ Full `pnpm lint` currently fails on `src/components/auth/auth-shell.tsx:36`
  (`react-hooks/set-state-in-effect`) — an uncommitted edit by a **concurrent node**
  (file not touched by fix-fitness); flagged for that node/orchestrator.
- `pnpm exec tsc --noEmit` — clean (whole repo, including concurrent nodes' edits).
- `pnpm vitest run tests/unit` — **39 files, 333 tests, all passed** (workout-library
  canary green: seed-data-verifier, tools, coach-direct-workout-log).
- `pnpm playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts` —
  **4 passed, 12 skipped** (identical skip set to baseline; skips are paid-API gates).
- Live verification script (scratchpad `fix-fitness-verify.mjs`): **46/46 checks pass**
  (one run hit a 3-check hydration/recompile race on /app/fitness caused by concurrent
  nodes triggering rebuilds; re-verified those checks individually — source and rendered
  state correct). **Console errors: 0** across all four pages, both viewports, including
  the full live-completion flow. No body-level horizontal overflow at 390px on any of
  the four pages.

## Deferred items

| Item | Finding | Reason |
|---|---|---|
| Merge /app/activity verdict content into /app/fitness (or give the page its own nav entry) | F1/A4 full consolidation | Product-level restructure; audit's alternative (scope /app/activity as fuel timing + cross-link both ways) implemented instead. Shell nav aliases already landed in fix-shell. |
| Collapse generated variants into one row per base workout with equipment/level pickers | W4 (structural half) | Requires a new detail-page picker UI and reshaping 360 generated routes; ranking half (curated first in library + close matches) shipped. |
| Desktop chip heights beyond `md:min-h-0` convention | F3 | 32px desktop chips are the app-wide pattern (mouse targets); changing only these cards would diverge from every other page. Mobile ≥44px enforced. |
| Windowed recovery/activity aggregates (3/7-day trends) | R1/A2 (build option) | No multi-day data source exists; toggles removed per the audit's explicit fallback. Reinstate as real controls when history lands. |
| auth-shell.tsx lint error | — | Not my file; introduced concurrently by another node mid-flight. Needs that node to fix before any commit gate. |

# rich-inline — Inline graphics in chat

Date: 2026-07-22 · Branch: surf/ios-responsive-ux-recovery · Node outcome: **PASS**

## Summary

The rich-inline pipeline was already substantially built: tools emit typed
artifact payloads, `/api/coach/turn` streams them as SSE `{type:"artifact"}`
events, `useCoachChat` (src/lib/coach/client-store.ts:414) appends them to the
assistant item, and the transcript maps each to a real component via
`ArtifactRenderer` (src/components/coach/artifacts/index.tsx) with
`data-testid="artifact-<type>"` wrappers (src/app/app/coach/page.tsx:497-503).
All four required families had both an emitter and a renderer. Gap-fix was one
theme-token cleanup plus the previously missing test coverage (unit envelope
rendering + deterministic dual-viewport e2e with screenshots).

## Inventory: artifact type → emitter → renderer → status

Four required families first:

| Family | Type | Emitter (src/lib/coach/tools/) | Renderer (src/components/coach/artifacts/) | Status |
| --- | --- | --- | --- | --- |
| Trend chart | `weight_trend` | progress-tools.ts | WeightTrendSpark.tsx (SVG polyline) | works (stroke was hard-coded `#1eae84`; now `var(--color-primary-500)`) |
| Trend chart | `macro_history` | progress-tools.ts | MacroHistoryChart.tsx (stacked SVG bars, `--color-macro-*` tokens) | works |
| Trend chart | `goal_progress` | goal-tools.ts | GoalProgressCard.tsx | works |
| Recipe card | `recipe_detail` | recipe-tools.ts | RecipeDetailCard.tsx | works |
| Recipe card | `recipe_list` | recipe-tools.ts | RecipeListCard.tsx | works |
| Workout card | `workout_plan` | workout-tools.ts | WorkoutPlanCard.tsx | works |
| Workout card | `workout_session` / `workout_logged` / `workout_suggestions` | workout-tools.ts | WorkoutSessionCard / WorkoutLoggedCard / WorkoutSuggestionsCard | works |
| Day-summary tile | `daily_recap` | lifestyle-tools.ts | DailyRecapCard.tsx (macro progress bars) | works |
| Day-summary tile | `todays_plate` | tools/index.ts | TodaysPlateCard.tsx | works |

Remaining types (emitter → renderer all wired, exercised by existing
tests/coach.spec.ts live suite): `meal_logged`/`meal_deleted`/`meal_suggestions`/
`food_search_results` (meal-tools.ts), `meal_plan` (recipe-tools.ts),
`grocery_list` (recipe-tools.ts + lifestyle-tools.ts), `restaurant_picks`/
`preferences_updated` (lifestyle-tools.ts), `target_change_proposal`/
`weekly_goal_review` (goal-tools.ts), `body_log_confirm`/`health_score`/
`inflows_outflows` (progress-tools.ts), `metric_explainer`/`open_page`/
`quick_replies`/`undo_confirm` (meta-tools.ts). Unknown types fall back to a
labeled "Unsupported card" chip (index.tsx default arm) — no crash path.

Emission path: turn route (src/app/api/coach/turn/route.ts:546-548, 603-605,
789-791) pushes `result.artifact` from each tool execution and emits the SSE
frame; the newest artifact is additionally mirrored into the coach action
drawer (page.tsx `latestActionDrawer`) and deduped from the inline list while
the drawer is open.

## Changes

1. `src/components/coach/artifacts/WeightTrendSpark.tsx` — SVG stroke
   `#1eae84` → `var(--color-primary-500)` (same resolved color; token instead
   of one-off literal per node bar).
2. `tests/unit/artifact-renderer.test.ts` (new) — 8 tests: server-renders
   `ArtifactRenderer` with tool-shaped payloads for weight_trend (incl.
   insufficient state), macro_history, goal_progress, recipe_detail,
   workout_plan, daily_recap, plus unknown-type fallback. Asserts SVG output,
   theme-token colors, and no hard-coded stroke hex.
3. `tests/coach-rich-inline.spec.ts` (new) — deterministic e2e following the
   coach-mobile-overflow `route.fulfill` SSE stub pattern. Stubs
   `/api/coach/history` + `/api/coach/turn`, sends "show my weight trend",
   asserts all six family artifacts mount in-transcript (chart SVGs
   component-rendered, not markdown), no horizontal overflow, and **zero
   console/page errors**, at 1280x800 and 390x844.

No other source files touched. Owned-file boundaries respected: zero edits in
src/lib/coach/tools/, apply-mutation.ts, system-prompt.ts, history route,
provider-health, log-confirm-chip.

## Test output

- `pnpm vitest run tests/unit` → 38 files, 285 tests, all passed (includes the
  8 new artifact-renderer tests).
- `pnpm playwright test tests/coach-rich-inline.spec.ts` → 2 passed
  (desktop 2.2s, mobile 1.7s), zero console errors asserted in-test.
- `pnpm lint` → clean. `pnpm exec tsc --noEmit` → exit 0.

## Screenshots

- `.loop/coach-engine-graph/evidence/rich-inline-desktop.png` — 1280x800,
  transcript showing user turn "show my weight trend" → weight trend SVG chart
  (token-colored stroke, -2.4 lb badge), macro history stacked bars with
  legend, goal-progress card.
- `.loop/coach-engine-graph/evidence/rich-inline-mobile.png` — 390x844, same
  turn; charts and cards contained with no horizontal overflow.
- (Recipe card, workout card, and daily-recap tile render further down the
  same transcript and are asserted visible by the spec at both viewports.)

## Tools-side emitter gaps for the orchestrator

None. All four families already have emitter paths inside
src/lib/coach/tools/; no tools/ change was required or requested.

## Unverified / caveats

- Live-model path (real Anthropic call choosing `get_weight_trend`) not
  exercised — the node forbids paid API calls. The existing live suite in
  tests/coach.spec.ts ("macro history chart", "plan workout", "mobile 375px
  artifacts" daily_recap) covers that path when ANTHROPIC_API_KEY is set.
- The e2e runs signed-out preview mode (same as the repo's deterministic
  suites); authenticated rendering goes through the identical
  client-store → ArtifactRenderer path.
- `onAction` click-through behavior of the new-tested cards (e.g. "Start
  workout" invoking the tool) is covered by the live suite, not by the stub
  spec (a stubbed turn cannot execute a real tool round-trip).

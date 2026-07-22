# act-fitness — Fitness-domain coach actions (Siri/Alexa bar)

Date: 2026-07-22. Node implementer report. Follows act-nutrition (9f09658) patterns: `rankedSearch`/`isConfidentMatch` fuzzy resolution, resolveFood/resolveRecipe-style resolvers, deterministic direct-log branch in the turn route. Audit choke points assumed verified (not re-litigated).

## 1. Fitness tool inventory (after this node)

Registered in `src/lib/coach/tools/workout-tools.ts` (+ goal-tools for goal plans); executed via the three turn-route branches (direct-workout-log, confirmedTool, model tool-loop). Catalog: `src/lib/workout-library.ts` — 376 workouts (curated + generated), seed gate >=100 satisfied.

| Tool | Args (zod) | Mutation | Destructive |
|---|---|---|---|
| log_workout | name (free text **or fuzzy library title**), duration_min 1-600, category enum, exercises?, notes? | add_workout | no |
| **delete_workout** (NEW) | workout_id (id / **"last"/"that"** / **fuzzy name**) | remove_workout | **yes** |
| plan_workout | focus enum, duration_min, equipment? | — (in-memory plan) | no |
| start_workout_session | plan_id? **or workout (library id/fuzzy title)** — one required | — (in-memory session) | no |
| log_set | exercise, weight_kg 0-500, reps | — (in-memory) | no |
| end_workout_session | {} | add_workout (aggregated; **named by library title when session came from catalog**) | no |
| suggest_workout | {} | — | no |
| get_goal_plan / update_goal_plan / explain_goal_progress / adapt_today_target / get_weekly_goal_review / propose_target_change | (goal-tools, unchanged) | set_goal_plan (update only) | no — propose_target_change renders approval card; update_goal_plan is the explicit accepted path |

All writes go through `ctx.applyMutation` → `applySnapshotMutation` and `recordAction` (undo inverse). Bold = added by this node.

## 2. Siri/Alexa-bar assessment (before → after)

| Capability | Before | After |
|---|---|---|
| "I did 30 min upper body" | paid model path only | **deterministic** `parseDirectWorkoutLog` → log_workout, `costUsdCents: 0` |
| Fuzzy workout names vs catalog | none — log_workout free text only, start_workout_session required a plan_id from plan_workout | `resolveWorkout(ref)` in workout-library.ts (exact id → top `searchWorkouts` hit gated by `isConfidentMatch` on title/categoryLabel/focus/workoutType). Probes: "zone 2 rdie"→Zone 2 ride, "recovery walk"→Recovery walk, "upper body"→Upper push base; rejected: "bench" (equipment-only hit), "push day", garbage |
| Lossy renames guard | n/a | catalog title adopted only when it also covers the user's phrasing (reverse `isConfidentMatch`): "zone 2 rdie" → logged as "Zone 2 ride"; "upper body" stays "Upper body" but still carries `library: {id, title, estimatedBurn}` in artifact/modelResult |
| Duration/effort from natural phrasing | model-only | parser handles "30 min", "45 minutes", "an hour", "half an hour", "1.5 hours"/"hour and a half"; category inferred from keywords (cardio/mobility/sport/strength) or the resolved library workout; questions ("...?") and verb-less texts fall through to the model |
| Start a named workout | impossible without plan_workout first | start_workout_session accepts `workout: "zone 2 ride"` — builds the session plan from the catalog's exercisePlan; end_workout_session logs it under the library title |
| Delete a logged workout | **no tool existed** (remove_workout mutation only reachable via undo) | delete_workout, `destructive: true` (route's destructive gate pauses for explicit confirm — same mechanism as delete_meal), resolves id / "last" / fuzzy name, undo-able via recordAction inverse |
| "today's/tomorrow's workout" schedule adjustments | not supported | **still not supported — data-model gap, documented below** |

## 3. Changes made

- `src/lib/workout-library.ts` — new export `resolveWorkout(ref)` (resolveFood pattern; gate fields title/categoryLabel/focus/workoutType).
- `src/lib/coach/tools/workout-tools.ts` — log_workout links/canonicalizes via resolveWorkout (reverse-gated rename, library metadata in result+artifact); NEW delete_workout (destructive, `resolveLoggedWorkout` id/"last"/fuzzy mirroring resolveLoggedMeal); start_workout_session takes plan_id OR workout (library ref → `buildPlanFromLibrary`), schema refine requires one; WorkoutPlan gains optional `title` used by end_workout_session naming.
- `src/lib/coach/direct-workout-log.ts` — NEW `parseDirectWorkoutLog` (verb + explicit duration required; category keywords; library canonicalization; deterministic reply).
- `src/app/api/coach/turn/route.ts` — direct branch now tries parseDirectMealLog then parseDirectWorkoutLog (meal parser wins; workout parser requires a duration so meal texts don't collide); audit summary `direct-workout-log`, model `deterministic-workout-log`; `summarizeConfirmedTool` gains log_workout and delete_workout cases.
- Tests: NEW `tests/unit/coach-direct-workout-log.test.ts` (11 tests); `tests/unit/tools.test.ts` +8 cases (start-from-library + end naming, unresolvable workout, log_workout canonicalize + generic-name keep, delete_workout fuzzy/"last"/unknown/destructive) + delete_workout schema case.

Not touched: client-store.ts, provider-health.ts, page.tsx, history route, system-prompt.ts, knowledge.ts, criteria.json, progress.md. No commits, no deploys, no migrations, no paid API calls, no stash operations (stash@{0} untouched).

## 4. Test output

`pnpm vitest run tests/unit/tools.test.ts tests/unit/coach-direct-workout-log.test.ts tests/unit/coach-apply-mutation.test.ts`

```
 Test Files  3 passed (3)
      Tests  132 passed (132)
```

Full unit suite `pnpm vitest run tests/unit`:

```
 Test Files  39 passed (39)
      Tests  329 passed (329)
```

(The persistence.test.ts failure act-nutrition reported as pre-existing is now green — the history-pagination node evidently landed.)

`npx tsc --noEmit` — clean. `npx eslint` on all six touched files — clean.

## 5. E2E evidence (deterministic branches, no paid API)

Second dev server could not bind: Next 16 dev-lock refuses a second `next dev` in the same worktree ("Another next dev server is already running… PID 80001"). Per node instructions, ran against the concurrent session's :3000 server (not killed; Turbopack serves current source). Snapshot: empty day + one logged workout `{id:"w-run", name:"Morning run"}`.

**"I did 30 min upper body"** (direct branch):
```
text_delta: "Logged Upper body — 30 min strength."
artifact:   type workout_logged, workout {name:"Upper body", category:"strength", durationMin:30},
            library {id:"upper-push-base", title:"Upper push base", estimatedBurn:"190-260 kcal"}, undoable:true
mutation:   add_workout {name:"Upper body", category:"strength", durationMin:30}
turn_done:  {inputTokens:0, outputTokens:0, costUsdCents:0, model:"deterministic-workout-log"}
```

**confirmedTool log_workout with typo'd library title** (`name:"zone 2 rdie"`):
```
text_delta: "Done. I logged Zone 2 ride and updated today's activity."
artifact:   workout {name:"Zone 2 ride", category:"cardio", durationMin:40}, library {id:"zone-2-ride", estimatedBurn:"260-360 kcal"}
mutation:   add_workout; turn_done model:"deterministic-tool-action", costUsdCents:0
```

**confirmedTool delete_workout by name** (`workout_id:"morning run"` vs snapshot id `w-run`):
```
text_delta: "Done. I removed Morning run from today's log."
artifact:   type workout_deleted, workoutId:"w-run", name:"Morning run"
mutation:   remove_workout w-run; turn_done model:"deterministic-tool-action", costUsdCents:0
```

**Audit ring buffer** (`GET /api/coach/audit`, preview user):
```
{"tool":"delete_workout","summary":"confirmed-tool","ts":"2026-07-22T16:09:46.160Z"}
{"tool":"log_workout","summary":"confirmed-tool","ts":"2026-07-22T16:09:46.137Z"}
{"tool":"log_workout","summary":"direct-workout-log","ts":"2026-07-22T16:09:46.043Z"}
```

Full SSE transcripts: scratchpad `e2e-turn{1,2,3}.txt`, `e2e-audit.json` (session-temporary).

## 6. Unverified / notes for orchestrator

- **Model-proposed delete_workout confirm chip**: the destructive pause (`if (def.destructive)` in route) is the same verified mechanism delete_meal uses; the model-proposing half needs a paid call, out of budget. Registry flag is unit-tested; confirmed-execution half e2e-verified above.
- **Workout plan scheduling ("adjust tomorrow's workout", "move today's session")**: not implementable without a data-model extension — `CoachDaySnapshot` has no planned/scheduled-workout collection and no mutation kind for schedules; plan_workout plans are in-turn/in-memory (`plansById`, per-server). Needs an orchestrator decision (new mutation kind + persistence) before any node can hit this bar item.
- **plansById/sessionsByUser are module-level in-memory** (pre-existing): plans/sessions don't survive server restarts and are per-instance; sessions are per-user, plans are global-by-id. Unchanged by this node; fine for the current single-instance dev/preview posture.
- **Word-number durations** ("thirty minutes") are not parsed deterministically — falls through to the model path by design.
- **suggest_workout / plan_workout still use the local 24-exercise EXERCISE_LIBRARY** for exercise picking, not the 376-workout catalog (catalog is now reachable via start_workout_session `workout` and log_workout linking). Rewiring plan generation onto catalog exercisePlans would be a larger change — flagged, not done.

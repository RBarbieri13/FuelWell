# audit-log node — evidence report

Date: 2026-07-22. Node: every coach-initiated state change audit logged (actor, tool,
payload summary, timestamp); /api/coach/audit surfaces entries.

## Outcome

Coverage is already complete. No code changes were made. All coach tool executions —
mutating and read-only — flow through a single shared `audit()` helper in the turn
route; there is no coach mutation path that bypasses it.

## Architecture (why one table covers everything)

Coach tools execute ONLY inside `src/app/api/coach/turn/route.ts`. That route has
exactly three execution branches, and each one calls the shared `audit()` closure
defined at `route.ts:518-524`:

```ts
const audit = async (tool: string, args: unknown, resultSummary: string) => {
  if (user) {
    await insertSupabaseAudit(storageClient, { userId, tool, args, resultSummary });
  } else {
    await writeAudit({ userId, tool, args, resultSummary, isPreview });
  }
};
```

| Branch | Trigger | Audit call site | Summary written |
|---|---|---|---|
| Direct meal log (deterministic parse) | `parseDirectMealLog` hit | `src/app/api/coach/turn/route.ts:552` | `"direct-meal-log"` |
| Confirmed tool (card tap after destructive pause) | `body.confirmedTool` | `src/app/api/coach/turn/route.ts:609` | `"confirmed-tool"` |
| Model tool-use loop (all normal tool calls) | Anthropic `tool_use` blocks | `src/app/api/coach/turn/route.ts:797` | `JSON.stringify(result.modelResult).slice(0, 200)` |

Sinks:
- Signed-in: `insertSupabaseAudit` (`src/lib/coach/persistence.ts:339-350`) →
  `coach_audit` table (`user_id`, `tool`, `args_jsonb`, `result_summary`,
  `ts TIMESTAMPTZ DEFAULT NOW()` — migration
  `supabase/migrations/20260611180100_coach_tables.sql:36-43`, RLS
  `auth.uid() = user_id` at line 68).
- Preview: `writeAudit` (`src/lib/coach/audit.ts:31-38`) → in-memory ring buffer,
  ISO timestamp stamped at `audit.ts:23`.

Fields per entry: actor = `userId` (authenticated Supabase user id or
`SAMPLE_USER.id` for preview, derived at `route.ts:372`), tool name, payload
(`args` / `args_jsonb`), result summary, timestamp. All four required fields present.

Non-tool extra: provider failures are also audited as pseudo-tool
`provider_incident` (`route.ts:476-481`).

## Mutation → audit coverage table

Every mutating tool returns `mutations` from `def.run()`; the mutations are applied
and the same branch then calls `audit()`. Mutation sites:

| Tool | Mutation kind | Mutation site | Audit call site |
|---|---|---|---|
| log_meal | add_meal | `src/lib/coach/tools/meal-tools.ts:220` | turn/route.ts:552/609/797 (shared) |
| log_custom_meal | add_meal | `meal-tools.ts:259` | shared |
| edit_meal | update_meal | `meal-tools.ts:327` | shared |
| delete_meal (destructive → confirm) | remove_meal | `meal-tools.ts:353` | route.ts:609 after confirm |
| log_workout | add_workout | `workout-tools.ts:169` | shared |
| end_workout_session | add_workout | `workout-tools.ts:348` | shared |
| log_recipe_as_meal | add_meal | `recipe-tools.ts:190` | shared |
| add_recipe_to_grocery_list | set_grocery | `recipe-tools.ts:245` | shared |
| add_grocery_item | set_grocery | `lifestyle-tools.ts:154` | shared |
| check_grocery_item | set_grocery | `lifestyle-tools.ts:197` | shared |
| clear_grocery_list | set_grocery | `lifestyle-tools.ts:215` | shared |
| update_preferences | set_preferences | `lifestyle-tools.ts:265` | shared |
| log_weight | add_body_log | `progress-tools.ts:269` | shared |
| log_mood | add_body_log | `progress-tools.ts:294` | shared |
| log_water | add_body_log | `progress-tools.ts:320` | shared |
| update_goal_plan | set_goal_plan | `goal-tools.ts:106` | shared |
| undo_last_action | inverse of last write | `meta-tools.ts:143` | shared |

Read-only tools (get_todays_plate, search_foods, suggest_meal, search_recipes,
get_recipe_detail, generate_meal_plan, plan_workout, start_workout_session, log_set,
suggest_workout, get_* progress tools, adapt_today_target [proposal-only,
`persisted: false`], propose_target_change, explain_metric, open_page,
ask_user_followup, find_restaurant_picks, get_grocery_list, get_daily_recap) are ALSO
audited by the same shared call sites — audit is unconditional per successful tool
execution, not gated on mutations.

Non-tool state changes checked and confirmed out of scope or downstream of audited
tools:
- `persistCoachMutations` / `mergeProfilePreferences` (route.ts:555, 620/622,
  819/821) persist mutations already audited at tool time.
- `recordAction` (last-action.ts) is in-memory undo bookkeeping only.
- `DELETE /api/coach/history` archives conversations — user-initiated from Settings
  ("New conversation"), not coach-initiated; not in node scope.

Error paths: if `def.schema.parse` or `def.run` throws, no audit row is written, but
no mutation is applied either (mutations only exist on successful `run`), so no
unaudited state change is possible.

## Audit surface

- Route `src/app/api/coach/audit/route.ts`: 401 unless authenticated or preview
  host; signed-in reads `coach_audit` with `.eq("user_id", user.id)` (line 20) plus
  table RLS; preview reads `getRecentAudit(SAMPLE_USER.id)` ring (line 29). Returns
  `{ rows: [{ tool, summary, ts }] }`, newest first, limit 50.
- UI `src/components/settings/coach-activity.tsx`: fetches `/api/coach/audit`
  (line 21), renders tool name + formatted timestamp per row, empty state "No Coach
  actions yet…".

## Changes made

None. Existing implementation already satisfies the node.

## Test output

`pnpm vitest run tests/unit/coach-apply-mutation.test.ts tests/unit/coach-mutation-persistence.test.ts --reporter=verbose`

```
 RUN  v4.1.8 /Users/robert.barbieri/Developer/FuelWell-Recovery-20260712

 ✓ tests/unit/coach-apply-mutation.test.ts > Coach snapshot mutations > does not duplicate a retried workout mutation 2ms
 ✓ tests/unit/coach-apply-mutation.test.ts > Coach snapshot mutations > keeps one body entry per day when an event is retried 0ms
 ✓ tests/unit/coach-mutation-persistence.test.ts > Coach mutation persistence > writes meals, workouts, and normalized groceries to user-owned repositories 5ms
 ✓ tests/unit/coach-mutation-persistence.test.ts > Coach mutation persistence > propagates repository failures instead of claiming a write succeeded 1ms

 Test Files  2 passed (2)
      Tests  4 passed (4)
   Start at  10:35:31
   Duration  144ms
```

## Unverified / caveats

- Supabase insert failures in `insertSupabaseAudit` are logged to console and
  swallowed (persistence.ts:349) — by design ("audit must never break a turn"), but
  a failed insert silently drops that audit row. Pre-existing tradeoff, documented
  in audit.ts header; not changed (surgical scope).
- Live end-to-end write to the production `coach_audit` table was not exercised (no
  authenticated Supabase session in this environment; node boundaries prohibit
  touching live user data). Verification is static (code path + RLS migration) plus
  the unit tests above.
- Preview ring buffer is per-server-instance memory; audit rows do not survive a
  server restart for preview users. Signed-in users are unaffected.

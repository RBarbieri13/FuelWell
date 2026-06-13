# FuelWell Goal-Based Meal Logging Loop

Date: 2026-06-12
Status: planning packet for the next autonomous implementation loop
Assumption: the requested phrase "lock their mule" means "log their meal."

## Product Thesis

FuelWell should stop treating meal logging as data entry and turn it into a goal loop:

1. The user has a current goal.
2. FuelWell knows the day's context.
3. The user logs food in the fastest available way.
4. Coach immediately translates the log into goal progress, next meal guidance, and recovery/training implications.
5. The system learns which logging path worked and makes tomorrow easier.

The current app is ready for this because Coach is now agentic, has meal tools, writes to the same client stores as Log and Dashboard, and already has cost/audit/undo guardrails. The missing layer is a persistent goal engine plus a real platform signal that changes recommendations.

## Platform Bet

Top-of-list launch platform: Garmin Connect.

Why Garmin:

- Garmin's 2026 Nutrition feature validates the exact direction: calories/macros, barcode/photo-style food capture, goal-based targets, and links between nutrition, sleep, training, and recovery.
- FuelWell's likely performance and fitness customers already think in Garmin terms: active calories, workouts, sleep, Body Battery, stress, recovery, and training load.
- Garmin's Health and Activity APIs can provide the goal context FuelWell needs even if Garmin's newer consumer Nutrition surface is not the primary write path.

Implementation stance:

- Put "Connect Garmin" at the top of integrations for performance users.
- Use Garmin/Health data to set and adapt goals, not as the only meal entry source.
- Keep FuelWell's meal logging source of truth in Supabase plus the existing Coach mutation path.
- Keep Apple HealthKit and Android Health Connect as the mobile platform layer for broader users.

## Goal Loop Model

### 1. Goal State

Create a first-class `goal_plan` concept instead of relying only on profile fields.

Required fields:

- `primary_goal`: lose, maintain, gain, perform, recomp, custom
- `goal_reason`: short user-facing reason
- `target_weight_kg`, optional
- `weekly_rate_kg`, optional
- `protein_strategy`: standard, high-protein, performance, recovery
- `training_priority`: strength, endurance, hybrid, general
- `calorie_floor`, `calorie_ceiling`
- `macro_targets`: calories, protein, carbs, fat, fiber
- `adaptation_policy`: conservative by default
- `status`: active, paused, completed

This goal feeds every logging decision. Logging is no longer "add calories"; it is "update my route to the goal."

### 2. Daily Context

Build a `daily_goal_context` snapshot for Coach and every app route:

- goal plan
- today's logged meals and remaining macros
- active calories and steps when connected
- workout plan or completed workout
- sleep/recovery flags
- user preferences and allergies
- confidence levels for each input source

This snapshot should be generated server-side for signed-in users and mirrored client-side for preview mode.

### 3. Meal Intake Paths

Ranked by speed and truthfulness:

1. Coach natural language: "I had a turkey sandwich and chips for lunch."
2. Recent/favorite meals: one tap from the Log route and Coach suggestions.
3. Barcode scan: use the existing `foods.barcode` schema and a verified food API/provider.
4. Photo estimate: gated behind "review before save," not auto-committed.
5. Search/manual macros: fallback that remains honest.
6. Imported platform data: Garmin/Health source context, and later nutrition imports if product/API terms support it.

### 4. Immediate Feedback

Every meal save should return a goal card:

- "Saved to Lunch."
- "You are 620 kcal and 84g protein from target."
- "Because Garmin shows a hard ride planned tonight, keep dinner carb-forward."
- "If this was smaller/larger, tap Adjust."

This should appear in Coach, Log confirmation, Dashboard, and Nutrition.

### 5. Autonomous Review Loop

The loop runs without user micromanagement:

- Morning: generate today's target from goal + recovery/activity context.
- After each log: update remaining macros, detect risk, suggest next action.
- Evening: reconcile logs, ask one low-friction correction if confidence is low.
- Weekly: adapt targets only if trend evidence is strong.
- Monthly: prompt the user to recommit, pause, or change the goal.

## Technical Plan

### Phase A — Goal Engine Foundation

Files likely touched:

- `supabase/migrations/*`
- `src/lib/macros.ts`
- `src/lib/fuelwell-data.ts`
- `src/lib/coach/client-store.ts`
- `src/lib/coach/system-prompt.ts`
- `src/lib/coach/tools/progress-tools.ts`
- `src/app/app/onboarding/page.tsx`
- `src/app/app/profile/profile-client.tsx`

Work:

- Add `goal_plans`, `goal_events`, and `daily_goal_contexts`.
- Make macro targets derive from `goal_plan` plus activity/recovery inputs.
- Add Coach tools: `get_goal_plan`, `update_goal_plan`, `explain_goal_progress`, `adapt_today_target`.
- Keep existing profile targets as cached outputs for backward compatibility.

Acceptance:

- Coach can explain the active goal and today's target.
- Dashboard, Nutrition, Log, and Coach all read the same target.
- No target changes without an auditable goal event.

### Phase B — Goal-Aware Meal Logging

Files likely touched:

- `src/app/app/log/page.tsx`
- `src/lib/coach/tools/meal-tools.ts`
- `src/components/coach/artifacts/MealLoggedCard.tsx`
- `src/components/log/totals-summary.tsx`
- `src/components/log/food-search.tsx`
- `src/components/log/portion-picker.tsx`

Work:

- Add a `meal_goal_impact` response object to `log_meal`, `log_custom_meal`, and `edit_meal`.
- Create a shared `GoalImpactCard`.
- Add recent/favorite meal quick actions.
- Add confidence labels: exact, database, estimate, manual.
- Preserve Undo and destructive confirmation behavior.

Acceptance:

- Logging through Coach and Log produces the same goal-impact summary.
- Editing/removing a meal updates the goal-impact summary.
- A 375px mobile user can log a common meal in under 15 seconds.

### Phase C — Garmin First Integration

Files likely touched:

- `src/app/app/settings/settings-client.tsx`
- `src/app/app/profile/profile-client.tsx`
- `src/app/api/integrations/garmin/*`
- `src/lib/integrations/garmin/*`
- `supabase/migrations/*`

Work:

- Add `connected_accounts` and `integration_daily_summaries`.
- Add a Settings integration card: "Garmin Connect."
- Store normalized Garmin context: active calories, steps, sleep, stress, body battery/recovery proxy, activities.
- Feed integration summaries into `daily_goal_context`.
- Do not import or write nutrition until the API/provider path is contractually clear.

Acceptance:

- Connected Garmin data can alter today's meal guidance.
- If Garmin is disconnected, FuelWell falls back to profile/activity-level assumptions.
- Coach explains what data came from Garmin and what is estimated.

### Phase D — Barcode And Photo Logging

Files likely touched:

- `src/app/app/log/page.tsx`
- `src/components/log/*`
- `src/lib/food-database.ts`
- `src/lib/coach/tools/meal-tools.ts`
- `src/app/api/food/search/*`
- `src/app/api/food/barcode/*`
- `src/app/api/food/photo-estimate/*`

Work:

- Replace the scan placeholder with a real barcode path.
- Add a server-side food lookup adapter with provider-agnostic result normalization.
- Add photo estimate as a draft-only flow: image -> candidate foods -> user review -> save.
- Add kill switch and confidence thresholds before any model-assisted save.

Acceptance:

- Barcode returns verified food data or a clean "not found" state.
- Photo estimates cannot silently mutate today's plate.
- All paths still write through the same meal mutation pipeline.

### Phase E — Autonomous Goal Review

Files likely touched:

- `src/lib/coach/tools/progress-tools.ts`
- `src/lib/coach/tools/meta-tools.ts`
- `src/components/coach/artifacts/*`
- `src/app/app/progress/page.tsx`
- `src/app/api/coach/turn/route.ts`
- `supabase/migrations/*`

Work:

- Add weekly goal review cards.
- Add "target change proposal" artifacts with accept/decline.
- Add audit events for every adaptation.
- Add a conservative target-change policy: never chase one bad day.

Acceptance:

- Coach can propose a target adjustment with evidence.
- User approval is required before persistent target changes.
- The app can explain why a target changed later.

## Autonomous Implementation Loop

Run the same proven pattern as the UI sprint:

1. Planner agents inspect current code, screenshots, schema, and docs.
2. Skeptic agents kill weak findings.
3. Synthesis produces no more than 10 tickets.
4. One executor per ticket in isolated worktrees.
5. Independent verifier per ticket.
6. Integration gate after every ticket: typecheck, unit tests, focused Playwright, screenshot where relevant.
7. Polish loop exits only after fewer than 3 meaningful findings.

Suggested ticket order:

1. Goal schema and event audit.
2. Shared goal-context builder.
3. Coach goal tools.
4. Goal-aware meal log result payload.
5. Goal impact card across Coach and Log.
6. Recent/favorite meals.
7. Garmin connected-account schema and mock adapter.
8. Settings Garmin card and disconnected states.
9. Daily context uses Garmin active calories/sleep/activity.
10. Barcode adapter and real scan state.

## Guardrails

- No fake scanner, fake Garmin connection, or fake platform import.
- No automatic target changes without explicit user approval.
- No photo estimate auto-save.
- No hidden source mixing: every recommendation must know whether data is user-entered, Garmin, HealthKit/Health Connect, database, or estimate.
- Keep preview/sample mode deterministic and honest.
- Preserve Coach cost rails, undo, audit log, and destructive confirmation.

## Verification Gates

- Unit tests for goal target math, adaptation policy, and meal impact deltas.
- Tool schema serialization tests for new Coach tools.
- Playwright: Coach logs meal -> Dashboard/Nutrition update -> GoalImpactCard matches.
- Playwright mobile 375px: recent/favorite meal flow under 15 seconds.
- Settings integration card: disconnected, connecting, connected, error states.
- Supabase RLS tests for goal/integration tables.
- Production smoke on `https://fuelwell-preview.vercel.app` after deploy.

## Open Product Decisions

- Whether Garmin is direct via Garmin Connect Developer Program or mediated through an aggregator such as Terra/Validic.
- Whether FuelWell writes nutrition back to Apple Health/Health Connect in v1 or reads only.
- Which food database provider powers barcode lookup.
- Whether photo logging uses general vision first or a food-specific provider.
- Whether "performance goal" gets its own onboarding branch before public launch.

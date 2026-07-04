# FuelWell Coach Engine Completion Audit

Date: 2026-06-20
Branch: `feature/fw-design-system-v2`

## Objective

Build FuelWell's Coach into a personalized health, nutrition, fitness, and body-composition engine that uses each logged-in user's own profile, goals, meals, workouts, preferences, app activity, and durable memory to reason, recommend, and safely make app changes through explicit tool/action pathways.

## Evidence Summary

Status: Local implementation verifier passes.

Outward-facing status: Not deployed and migration not applied to live/preview database yet. The goal file requires explicit user confirmation before production deploys, PRs, scheduled jobs, paid API usage beyond normal dev testing, sending messages, or changing live user data.

## Requirement Audit

| Requirement | Current evidence | Status |
| --- | --- | --- |
| Pilot router used and Codex-equivalent plan followed | Pilot router was run against the objective; local safe subset executed because scheduled PR/deploy workflow requires approval. Durable rules were added to `AGENTS.md`. | Passed locally |
| Per-user isolated persistent coach knowledge base | `supabase/migrations/20260620170000_coach_knowledge_bases.sql` creates `coach_knowledge_bases` keyed by `user_id`, enables RLS, and restricts access with `auth.uid() = user_id`. `loadCoachKnowledge`, `persistCoachKnowledge`, and `ensureCoachKnowledgeForUser` use user-scoped queries. | Passed locally; live DB application pending approval |
| Created at onboarding/login | `src/app/app/onboarding/page.tsx` seeds initial knowledge after intake. `src/app/app/layout.tsx` calls `ensureCoachKnowledgeForUser` for signed-in users entering the app. | Passed locally; live DB application pending approval |
| Continuously updated from app activity | `/api/coach/turn` merges snapshot-derived knowledge before answering and after tool mutations, then persists for signed-in users. | Passed locally |
| Coach retrieves and uses relevant context before answering | `/api/coach/turn` loads stored knowledge, merges current app state, retrieves relevant slices, and passes them into `buildSystemPrompt`. | Passed locally |
| Different users receive materially different context | `tests/unit/coach-knowledge.test.ts` verifies different profile/allergy/workout histories produce different retrieved context and do not cross-merge. | Passed |
| Safe app action pathways | Tool registry supports meals, grocery items, workouts, plans, preferences, goals, recipes, and undo/confirm flows. `tests/unit/seed-data-verifier.test.ts` covers create/update meal, grocery, workout, and plan actions. Browser smoke covers live Coach actions. | Passed |
| Confirmation before destructive/high-impact edits | Tool definitions mark destructive actions; `/api/coach/turn` emits `confirm_required` before destructive tools. Browser smoke covers destructive confirmation. | Passed |
| Reviewable coach action logs | `insertSupabaseAudit` / `writeAudit` are called for tool actions; `coach_audit` route exists. | Passed locally |
| Health-coach boundaries | `src/lib/coach/system-prompt.ts` now includes no diagnosis, no emergency guidance, professional-care recommendation, and no invented medical facts. `tests/unit/system-prompt.test.ts` covers these boundaries. | Passed |
| Ingredient/food data >= 500 | `FOOD_COUNT` is 500. | Passed |
| Recipe data >= 150 | `RECIPE_COUNT` is 162. | Passed |
| Workout data >= 100 | `WORKOUT_COUNT` is 106 with 106 unique IDs and titles. | Passed |
| Autocomplete / closest match | `src/lib/search-utils.ts` implements ranked partial and typo-tolerant search. Verifier checks foods, recipes, and workouts. | Passed |
| Wired into real app routes | `/app/coach`, `/app/onboarding`, `/app/workouts`, and `/api/coach/turn` are wired. Browser smoke covers dashboard/log/coach/workouts/progress/settings paths. | Passed locally |
| Not mock-only | Preview mode exists for review, but the signed-in path uses Supabase persistence, RLS migration, conversations, usage, audit, and profile-backed knowledge. | Passed locally; live DB application pending approval |
| Dedicated verifier returns PASS/FAIL with reasons | `scripts/verify-coach-engine.mjs` returns JSON PASS/FAIL and supports `--smoke` for the full UI gate. | Passed |

## Verification Commands

Strong local verifier:

```bash
npm run verify:coach
```

Last observed result:

```json
{
  "status": "PASS",
  "reasons": [
    "Static privacy/migration/health invariants, full unit suite, seed counts, autocomplete, user isolation, personalized context, safe coach actions, lint, typecheck/build, browser smoke not requested; run with --smoke for the full UI gate passed."
  ]
}
```

Full UI gate:

```bash
node scripts/verify-coach-engine.mjs --smoke
```

Last observed result:

```json
{
  "status": "PASS",
  "reasons": [
    "Static privacy/migration/health invariants, full unit suite, seed counts, autocomplete, user isolation, personalized context, safe coach actions, lint, typecheck/build, browser smoke/live coach wiring passed."
  ]
}
```

Other observed counts:

```json
{
  "FOOD_COUNT": 500,
  "RECIPE_COUNT": 162,
  "WORKOUT_COUNT": 106,
  "uniqueWorkoutIds": 106,
  "uniqueWorkoutTitles": 106
}
```

## Known Limitations

- The Supabase migration exists in the repo but has not been applied to the live/preview database from this session.
- The Vercel preview/live deployment has not been updated from this session.
- The generated recipes/workouts are structured and useful but still generated seed data; future work should replace or enrich them with a larger curated dataset and source metadata.
- The deterministic direct-meal fast path currently covers high-confidence meal-log phrasing with a named meal slot and calories. Other ambiguous food logs still flow through the model/tool loop.

## Approval-Gated Completion Steps

These require explicit user approval under the objective:

1. Apply `supabase/migrations/20260620170000_coach_knowledge_bases.sql` to the target Supabase environment.
2. Deploy/publish the branch to the preview/live Vercel deployment.
3. Optionally open a PR or merge branch changes.
4. Re-run `node scripts/verify-coach-engine.mjs --smoke` against the deployed preview after deployment.

## Recommendation

After approval, apply the database migration first, then deploy, then run the smoke-enabled verifier against the deployed preview. If that passes, the original objective can be marked complete.

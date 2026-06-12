# HANDOFF — Coach Agentic Overhaul (v1.4.0) — 2026-06-12

Branch: `feature/coach-agentic-overhaul` · Deployed: https://fuelwell-preview.vercel.app
Final production deployment: see `vercel ls fuelwell-preview` (last Ready deploy of 2026-06-12; the pre-hub-update deploy was `dpl_2qF61eLiJ9zYxJEq6NqEaxkVP7n6`).

## What shipped

The deterministic Coach intent router is **gone** (archived one commit at
`src/app/app/coach/_legacy/page-deterministic.tsx.bak`). Coach is now a live
Anthropic-powered agent: every app action executes inline in chat through
tools, renders an artifact card, and writes to the same stores the rest of
the app reads.

## Tool inventory — 36 registered (requirement: ≥18)

| Module | Tools |
|---|---|
| `tools/index.ts` | get_todays_plate |
| `meal-tools.ts` (6) | search_foods, log_meal, log_custom_meal, edit_meal, delete_meal*, suggest_meal |
| `workout-tools.ts` (6) | log_workout, plan_workout, start_workout_session, log_set, end_workout_session, suggest_workout |
| `recipe-tools.ts` (5) | search_recipes, get_recipe_detail, log_recipe_as_meal, add_recipe_to_grocery_list, generate_meal_plan |
| `progress-tools.ts` (7) | get_health_score, get_macro_history, get_inflows_outflows, get_weight_trend, log_weight, log_mood, log_water |
| `lifestyle-tools.ts` (7) | find_restaurant_picks, get_grocery_list, add_grocery_item, check_grocery_item, clear_grocery_list*, update_preferences, get_daily_recap |
| `meta-tools.ts` (4) | explain_metric, undo_last_action, open_page, ask_user_followup |

\* destructive — requires explicit user confirm turn before firing.

25 artifact card types in `src/components/coach/artifacts/` rendered by
`ArtifactRenderer`; every action card has Undo, every metric card drills.

## Architecture

- `POST /api/coach/turn` — SSE stream (text deltas, tool_start, artifact,
  mutation, confirm_required, turn_done). Key is server-side only
  (verified: browser network shows only same-origin calls).
- Tools run **server-side** against the client-sent day snapshot; writes
  return mutations the client applies to the shared stores
  (`use-day-log`, `use-workout-log`, `use-grocery-list`, `use-body-log`)
  — that is the D-gate mechanism. Verified live: chat-logged meal appears
  on the dashboard with identical totals.
- Models: `claude-haiku-4-5` default; `claude-sonnet-4-6` for long/planning
  turns; `COACH_MODEL` env overrides.
- Preview users (sample user, no auth) work end-to-end; signed-in users
  additionally persist conversations/messages/usage/audit to Supabase
  (user-scoped client, RLS).

## Cost rails & guardrails

- $5/day soft, $10/day hard cap **checked before any model call**.
  Signed-in: `coach_usage` table; preview: in-memory ledger.
  Env: `ANTHROPIC_DAILY_BUDGET_USD=5`, `ANTHROPIC_HARD_KILL_USD=10` (set in
  Vercel production).
- Ledger sample (local haiku turn): 2,290 in / 95 out tokens → 1¢.
- Prompt-injection: "User said:" wrapping + system rules; E2E-verified
  refusal with no tool call and no prompt leak.
- 5 tool-rounds/turn circuit breaker; zod bounds on every numeric input
  (kcal 0–5000, portion 1–2000 g, duration 1–600 min, weight 20–700 kg …);
  forged `confirmedTool` payloads rejected gracefully.
- PII scrub (email/phone) on streamed output.
- Voice filter: banned phrases ("you missed/skipped/went over") get an
  inline correction notice. **Deviation from spec E4:** full reject+retry
  is incompatible with already-streamed text; backstop chosen instead.
- Audit log: every tool call → `coach_audit` (signed-in) / memory ring
  (preview), surfaced in Settings → "Coach activity".

## Supabase

Migrations applied via MCP (project `xzsftuxvnkgxtbiibvac`), files in
`supabase/migrations/`:
- `20260611180000_base_schema.sql` — **the original base schema had never
  been applied to this project**; applied now (profiles, meals, daily_logs…).
- `20260611180100_coach_tables.sql` — coach_conversations, coach_messages,
  coach_usage, coach_audit. All RLS-on; verified via list_tables (16 tables).

## Test evidence

- Vitest: **123/123** passing (`npm run test:unit`) — cost math, voice
  filter, all mutations, all 36 tools (schema serialize + execute).
- Playwright Coach E2E: **12/12** passing in 41.1s (`tests/coach.spec.ts`,
  serial, live model): log→dashboard→undo, plan→session, suggestions tap,
  macro chart, context dinner, restaurant picks, grocery add, health-score
  no-redirect, destructive confirm, injection refusal, cost-cap block,
  375px no-overflow.
- Smoke suite: 9/9 (old coach test updated to agentic surface).
- Adversarial pass (confused/rude/malicious): 12 probes, 3 issues found
  and fixed (schema bounds ×2, forged-confirm crash).
- Live smoke on production: G2 #1 (desktop, + dashboard total match),
  #2 and #4 (375 px) verified in a real browser; no key in network tab.

## Polish loop (3 passes, exit at <3 findings)

1. Pass 1: hydration mismatch (fixed), run-on round text (fixed), truncated dup names (minor, open).
2. Pass 2 (via E2E debugging): mid-stream taps swallowed (fixed: queue), slot-conflict interrogation (fixed: prompt example), aria-label/name mismatches (fixed).
3. Pass 3: 2 findings (single Chipotle item in food DB; historical stored messages keep pre-fix run-on text) → loop exit.

## Verified / Not verified (fail-loud)

- ✅ Criteria 1–5, 7–10 verified as described above.
- ⚠️ Criterion 6 (signed-in Supabase persistence): code path implemented and
  unit-covered; tables exist with RLS; **not verified live** — no real
  user credentials were available to sign in on production. First real
  login should confirm rows in `coach_conversations`/`coach_messages`.
- ⚠️ Serverless statefulness: workout plans/sessions, undo window, and the
  preview cost ledger live in module-level memory — fine on a warm Fluid
  Compute instance, but a cold start or instance switch drops them
  (plan id "unknown" → Coach re-plans; undo window lost). Deferred:
  move to Supabase or client-held state if it bites.

## Deferred

- E4 full reject+retry voice enforcement (see deviation note).
- Restaurant dataset depth (one Chipotle-style item today).
- Meal-photo capture in chat; signed-in conversation replay UI uses
  localStorage (server replay endpoint exists in persistence helpers,
  not yet wired to a GET route).
- `_legacy/` archive deletion (next commit after this one is safe).

## How to run

```bash
npm run dev               # .env.local has ANTHROPIC_API_KEY
npm run test:unit         # vitest, no network
npx playwright test       # live-model E2E + smoke (needs dev server/env key)
```

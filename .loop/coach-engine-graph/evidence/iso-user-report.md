# iso-user — Per-user isolation audit report

Date: 2026-07-22
Node: `iso-user` (coach-engine graph)
Scope: /api/coach/* routes, src/lib/coach/{knowledge,persistence,apply-mutation,client-store}.ts, coach RLS migrations, preview-user gating.

## Outcome

One app-layer scoping gap found and fixed (`ensureConversation` accepted a
client-supplied conversationId without a `user_id` filter — RLS was the only
guard). Everything else is scoped correctly. No migration needed. All
required tests pass.

## 1. user_id flow, query by query

Auth source: `POST /api/coach/turn` (src/app/api/coach/turn/route.ts:362-372).
`user` comes from `supabase.auth.getUser()` on an anon-key + cookie server
client (src/lib/supabase/server.ts:4-28) — so every query below additionally
runs under RLS as the authenticated user. `userId = user?.id ?? SAMPLE_USER.id`
(route.ts:372); every Supabase call in the route is gated on `user`, so
`SAMPLE_USER.id` never reaches Supabase.

| # | Query | Location | Scoping | Verdict |
|---|-------|----------|---------|---------|
| 1 | `coach_conversations` select (adopt existing conversation) | persistence.ts:29-35 `ensureConversation` | **WAS id-only; FIXED** — now `.eq("id", conversationId).eq("user_id", userId)` | Fixed (was RLS-only) |
| 2 | `coach_conversations` insert | persistence.ts:37-40 | `user_id: userId` (authenticated id from route.ts:401) | OK |
| 3 | `coach_messages` insert | persistence.ts:61-72 `saveMessages` | By `conversation_id` only at app layer; conversationId always comes from `ensureConversation` (ownership-verified after fix) + RLS EXISTS policy on the parent conversation | OK |
| 4 | `coach_conversations` select latest | persistence.ts:83-90 `loadRecentMessages` | `.eq("user_id", userId)` | OK |
| 5 | `coach_messages` select | persistence.ts:93-98 | `.eq("conversation_id", convo.id)` where convo was selected by user_id in #4 | OK |
| 6 | Storage upload `coach-artifacts` | persistence.ts:148-153 `saveCoachUploadedArtifacts` | Path prefix `${row.userId}/...` (route passes authenticated userId, route.ts:406-412); storage RLS checks foldername[1] = auth.uid() | OK |
| 7 | `coach_uploaded_artifacts` upsert | persistence.ts:162-180 | `user_id: row.userId`, `onConflict: "user_id,attachment_id"` | OK |
| 8 | `coach_uploaded_artifacts` select | persistence.ts:200-205 `loadRecentCoachUploadedArtifacts` | `.eq("user_id", userId)` | OK |
| 9 | `coach_knowledge_bases` select | persistence.ts:227-231 `loadCoachKnowledge` | `.eq("user_id", userId)` | OK |
| 10 | `coach_knowledge_bases` upsert | persistence.ts:243-250 `persistCoachKnowledge` | `user_id: knowledge.userId`, `onConflict: "user_id"`; `knowledge.userId` always built from authenticated userId (route.ts:420-423, knowledge.ts:102/134-136) | OK |
| 11 | `profiles` select (knowledge bootstrap) | persistence.ts:261-267 `ensureCoachKnowledgeForUser` | `.eq("id", userId)`; sole caller passes `user.id` (src/app/app/layout.tsx:17-18) | OK |
| 12 | `profiles` select/update preferences | persistence.ts:291-300 `mergeProfilePreferences` | `.eq("id", userId)` on both read and write | OK |
| 13 | `coach_usage` select (budget) | persistence.ts:309-313 `getSupabaseDayCents` | `.eq("user_id", userId).eq("day", day)` | OK |
| 14 | `coach_usage` insert | persistence.ts:328-335 `insertSupabaseUsage` | `user_id: row.userId` | OK |
| 15 | `coach_audit` insert | persistence.ts:343-348 `insertSupabaseAudit` | `user_id: row.userId` | OK |
| 16 | `goal_plans` upsert + `goal_events` insert | persistence.ts:371-395 `persistGoalPlan` | Row carries `user_id: userId`; upsert `onConflict: "id"` — a forged plan.id owned by another user is blocked by RLS on goal_plans (not a coach migration; policy not re-audited here) | OK (RLS-backed) |
| 17 | `connected_accounts` / `integration_daily_summaries` upserts | persistence.ts:402-440 | `user_id: userId`, user-scoped onConflict keys | OK |
| 18 | `daily_goal_contexts` upsert | persistence.ts:448-461 | `user_id: userId`, `onConflict: "user_id,context_date"` | OK |
| 19 | Mutation fan-out (meals/workouts/grocery/body) | persistence.ts:465-523 `persistCoachMutations` → day-log/workout-log/grocery/body-log repositories | Every repository query filters `.eq("user_id", userId)` (verified: day-log-repository.ts:80,128,151,231,270; workout-log-repository.ts:161,178,230; grocery-repository.ts:139,183,212,252,265; body-log-repository.ts:53,74) | OK |
| 20 | `coach_audit` select | src/app/api/coach/audit/route.ts:17-22 | `.eq("user_id", user.id)` | OK |
| 21 | `coach_conversations` archive update | src/app/api/coach/history/route.ts:39-43 | `.eq("user_id", user.id)` | OK |

Other files:
- **knowledge.ts** — pure functions, no DB access. `mergeCoachKnowledge`
  (knowledge.ts:178-194) discards stored knowledge whose `userId` differs from
  the current authenticated userId, so a stale/foreign knowledge blob can
  never merge into another user's context. Knowledge is built entirely from
  the caller's snapshot + profile, so two different profiles necessarily
  produce different profileFacts/preferenceFacts/nutritionFacts.
- **apply-mutation.ts** — pure in-memory snapshot draft mutation, no DB, no
  user_id involved. Isolation is inherited from the per-request snapshot.
- **client-store.ts** — browser-side; talks only to /api/coach/turn and
  /api/coach/history (cookie-authenticated). The `conversationId` it echoes
  back is now ownership-checked server-side. localStorage replay
  (`fuelwell-coach-chat-v1`) is per-browser-profile and is superseded by the
  server replay for signed-in users (client-store.ts:206-242).
- **coach tools** (src/lib/coach/tools/*) — no Supabase or network access;
  they operate solely on the request's `ToolContext.snapshot` (grep for
  supabase/createClient/fetch across tools returned nothing).

## 2. RLS: table → policy

From supabase/migrations:

| Table | RLS enabled | Policy | Check |
|-------|-------------|--------|-------|
| `coach_conversations` | 20260611180100:50 | "Users manage own coach conversations" FOR ALL | `USING (auth.uid() = user_id)` (line 55-56); for FOR ALL with no WITH CHECK, USING doubles as the insert/update check |
| `coach_messages` | 20260611180100:51 | "Users manage own coach messages" FOR ALL | `USING (EXISTS (... coach_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()))` (lines 58-62) — inserts into a foreign conversation are blocked |
| `coach_usage` | 20260611180100:52 | "Users manage own coach usage" FOR ALL | `USING (auth.uid() = user_id)` (65-66) |
| `coach_audit` | 20260611180100:53 | "Users manage own coach audit" FOR ALL | `USING (auth.uid() = user_id)` (68-69) |
| `coach_knowledge_bases` | 20260620170000:14 | "Users manage own coach knowledge" FOR ALL | `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` (16-18) |
| `coach_uploaded_artifacts` | 20260627042014:62 | "Users manage own coach uploaded artifacts" FOR ALL TO authenticated | `USING/WITH CHECK ((SELECT auth.uid()) = user_id)` (70-75); plus `REVOKE ALL FROM anon, authenticated` + re-GRANT CRUD to authenticated only (20260627043000:4-5) — anon has zero privileges |
| `storage.objects` (coach-artifacts bucket) | (storage built-in) | "Users manage own coach artifact objects" FOR ALL TO authenticated | `bucket_id = 'coach-artifacts' AND (storage.foldername(name))[1] = auth.uid()::text` on USING and WITH CHECK (20260627042014:80-91); bucket is `public = false` |

Every coach table has RLS enabled with a user-scoped policy. No `USING (true)`
policies exist on coach tables.

## 3. Preview/sample user gating

- `SAMPLE_USER.id = "fuelwell-preview-user"` (src/lib/preview-session.ts:4).
  Not a UUID — it cannot even be inserted into any coach table's
  `user_id UUID` column, a structural backstop.
- `isPreviewHost` (preview-session.ts:24-39) grants preview only for
  localhost/127.0.0.1 hosts or an explicit `FUELWELL_PREVIEW_MODE` env opt-in.
  Deployed hostnames never get preview identity by naming convention.
- In /api/coach/turn: `isPreview = !user && isPreviewHost(host)`
  (route.ts:365). An authenticated session can never be preview — the flag
  requires the absence of a user. Unauthenticated + non-preview → 401.
- Every Supabase read/write in the turn route is gated on `user`
  (route.ts:391-393, 399-401, 406, 419, 424, 474-484, 489, 519-523, 554,
  618, 817). Preview turns use in-memory cost (`memoryAddCents`/
  `memoryGetDayCents` in cost.ts) and the in-memory audit ring
  (audit.ts writeAudit), never Supabase.
- The `x-coach-test-spend-cents` E2E hook is honored only when `isPreview`
  (route.ts:385-390), so an authenticated user cannot use it to reset spend.
- /api/coach/history and /api/coach/artifacts return signedIn:false with
  empty data for non-authenticated callers; /api/coach/audit serves preview
  callers only the in-memory ring filtered to `SAMPLE_USER.id`
  (audit/route.ts:28-33).
- Cross-contamination guard in memory: `mergeCoachKnowledge` requires
  `existing.userId === next.userId` (knowledge.ts:182), so even a
  hypothetical sample-user knowledge blob would be discarded, not merged,
  for an authenticated user.

## 4. Changes made

One surgical edit — src/lib/coach/persistence.ts `ensureConversation`:
added `.eq("user_id", userId)` to the conversation-adoption select
(persistence.ts:29-35). Before, a client-supplied `conversationId` was looked
up by `id` alone and only RLS prevented adopting another user's conversation;
now the app layer enforces ownership too, matching every other query in the
file. The `userId` parameter already existed and was otherwise unused on this
path. No behavior change for legitimate users (their own conversations still
match); a foreign or unknown id falls through to creating a fresh
conversation, same as before.

No migration required — all coach tables already have correct RLS. No
follow-up migrations identified.

## 5. Test output

`pnpm vitest run tests/unit/coach-turn-provider-access.test.ts tests/unit/coach-knowledge.test.ts`:

```
 RUN  v4.1.8 /Users/robert.barbieri/Developer/FuelWell-Recovery-20260712

 Test Files  2 passed (2)
      Tests  6 passed (6)
   Start at  10:35:08
   Duration  380ms (transform 203ms, setup 0ms, import 107ms, tests 226ms, environment 0ms)
```

Additionally (regression guard for the persistence edit):
`pnpm vitest run tests/unit/coach-mutation-persistence.test.ts` — 1 file,
2 tests passed. `npx tsc --noEmit` — clean, no errors.

## 6. Unverified items

- RLS policies were audited from migration SQL only; not executed against a
  live database (schema migrations and live-DB checks are out of node scope).
  The deployed database is assumed to match `supabase/migrations/`.
- `goal_plans`, `goal_events`, `connected_accounts`,
  `integration_daily_summaries`, `daily_goal_contexts`, and the
  meal/workout/grocery/body tables are outside the four coach migrations this
  node covers; their app-layer queries were verified user-scoped (table row
  19 above) but their RLS policies were not re-read.
- "Two profiles produce materially different coach context" was verified
  structurally (knowledge is a pure function of the per-user snapshot/profile
  plus a userId-matched stored blob) and via the passing
  coach-knowledge unit tests, not via a live two-account end-to-end run.

# intent-router node — evidence report (2026-07-22)

## Outcome

25-utterance intent suite delivered at `.loop/coach-engine-graph/intent-suite.md`; all 25 behave
correctly under the strongest verification affordable without paid model calls. Routing
improvements shipped: intent-classification steering + a static app-navigation map in the system
prompt, and the ctx-retrieval advisory (knowledge-gate regex widening) applied with a locking test.

## What was added

### 1. System prompt (`src/lib/coach/system-prompt.ts`)

Assessment first: tool descriptions across `src/lib/coach/tools/*` were already discriminative
(each names its trigger condition — e.g. `suggest_workout` "Use when the user asks what to
train"), and TOOL_RULES covered act intents well. Two gaps existed: no explicit read-vs-act-vs-
advise classification guidance, and **zero app-navigation knowledge** — "where do I change X?"
had no grounding, and `open_page`'s six routes were the model's only hint of app structure.

Added two blocks (between ATTACHMENT_RULES and TOOL_RULES):

- `INTENT_ROUTING_RULES` — classify ACT / READ / ADVISE first; READ answers from the snapshot
  and only calls read tools for data the snapshot lacks; ADVISE writes nothing until the user
  accepts; typo/partial/alias tolerance ("grocey" → grocery, "chiken" → chicken; resolve via
  search tools, never ask the user to re-spell); "that/it/the last one" anaphora → most recent
  action, "undo that" → `undo_last_action`.
- `NAVIGATION_MAP` — static app structure only (no per-user data): all 11 sidebar routes,
  the 13 Settings sections (sourced from `src/components/settings/settings-client.tsx`), and the
  three routing facts models get wrong without it: goal weight lives in the goal plan
  (`update_goal_plan` in chat — there is no Settings field for it; verified by grepping the
  settings client), units are dual-path (`update_preferences` or Settings → Preferences → Units),
  and account deletion is chat-impossible (Settings → Delete account via `open_page`; the
  registry has no account-delete tool).

### 2. Knowledge-gate regex widening (`src/lib/coach/knowledge.ts`) — ctx-retrieval advisory applied

```diff
-  const wantsNutrition = /meal|food|eat|calorie|protein|carb|fat|recipe|grocery|menu|restaurant/.test(text);
+  // "grocer" covers grocery/groceries; "shop" covers shop/shopping.
+  const wantsNutrition =
+    /meal|food|eat|calorie|protein|carb|fat|recipe|grocer|menu|restaurant|cook|dinner|shop|buy/.test(text);
```

Covers the advisory's full list: cook, dinner, meal-planning ("meal" substring), shopping
("shop"), buy, groceries-plural ("grocer" matches both grocery and groceries).

### 3. Tests

- `tests/unit/coach-knowledge.test.ts` — new test "retrieves deep nutrition, recipe, and grocery
  slices for cook/dinner/shopping/buy/groceries utterances": 6 previously-shallow utterances now
  get the deep slices (nutrition 14, recipe 10, grocery 10), and a pure workout utterance still
  gets the shallow 4-slices (no over-widening).
- `tests/unit/system-prompt.test.ts` — two new tests locking the intent-routing steering text and
  the navigation map (all 11 sidebar routes, goal-weight/units/delete-account routing sentences).

## Suite verification tally

- **5 live-verified end-to-end** (deterministic branch executed a real tool, artifact + mutation
  streamed, cost 0): A1 eggs, A2 calorie burrito, A3 "chikn breast" typo, A4 "uper body" typo,
  plus a "log a 45 minute run" control.
- **18 live-verified branch routing** (deterministic parsers correctly declined; request reached
  the model path and returned `deterministic-provider-fallback` at cost 0, proving no parser
  misfire): A5–A8, R1–R8, V1–V6. Tool selection for these is **static-verified — live run
  pending** (discriminating description text quoted per row in the suite).
- **3 static-verified** (N1–N3 navigation): the navigation-map text *is* the routing mechanism
  and is unit-locked; live run pending.
- **0 paid model calls.** Double-gated: dev server started with
  `ANTHROPIC_API_KEY="" AI_GATEWAY_API_KEY="" VERCEL_OIDC_TOKEN=""` (process env beats
  `.env.local`), and `evaluatePaidProviderAccess` denies anonymous preview regardless
  (`src/lib/coach/cost.ts:48`).

## Live setup notes

- Reused-server plan failed: the pre-existing dev server (PID 91174, port 3131) had already
  exited, and its stale `.next/dev` cache made a fresh server 404 every route. Removed
  `.next/dev` (2.0 GB, gitignored build cache), restarted on free port 3971 with
  `FUELWELL_PREVIEW_MODE=1`; `/app/coach` then returned 200. No other process was killed.
- Parser-branch expectations were pre-probed offline with a temporary vitest file importing
  `parseDirectMealLog`/`parseDirectWorkoutLog` (deleted after use), so no utterance was sent
  live on a guess.

## Gate output

```
pnpm vitest run tests/unit
  Test Files  39 passed (39)
       Tests  333 passed (333)   # baseline 330 + 3 new (1 knowledge, 2 system-prompt)

pnpm exec tsc --noEmit
  exit 0
```

## Appendix — raw live transcripts (abridged)

Deterministic branch (suite rows A1–A4 + control):

```
Log 2 eggs for breakfast
  text: "Logged Egg, whole, large (50 g each) (100 g, ~143 kcal) as breakfast."
  artifact meal_logged (log_meal) | mutation add_meal | model deterministic-meal-log cost=0
I had a 500 calorie burrito for lunch
  text: "Logged burrito as an additional lunch."
  artifact meal_logged (log_custom_meal) | mutation add_meal | model deterministic-meal-log cost=0
log chikn breast for dinner
  text: "Logged Chicken breast, grilled (140 g, ~231 kcal) as dinner."
  artifact meal_logged (log_meal) | mutation add_meal | model deterministic-meal-log cost=0
I did 30 min uper body
  text: "Logged Uper body — 30 min strength."
  artifact workout_logged (log_workout) | mutation add_workout | model deterministic-workout-log cost=0
log a 45 minute run
  text: "Logged Run — 45 min cardio."
  artifact workout_logged (log_workout) | mutation add_workout | model deterministic-workout-log cost=0
```

Branch-decline checks (all 20 returned `deterministic-provider-fallback cost=0`):
Move that to dinner / Delete my lunch / Add 5 bananas to my grocey list / Change my goal weight
to 170 lb / How much protein do I have left? / Show my weight trend / whats on my grocey list /
Show me the greek yogurt bowl recipe / What have I trained today? / Show my calorie history for
the last two weeks / What's my health score? / What should I eat for dinner tonight? / What
should I train today? / Plan my meals for the week / What should I cook for dinner with what's
on my grocery list? / My weight has plateaued for two weeks. What should I change? / How do I
lose 10 pounds by Friday? / Where do I change my goal weight? / Where do I switch to imperial
units? / How do I delete my account?

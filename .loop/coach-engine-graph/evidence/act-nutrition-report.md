# act-nutrition — Nutrition-domain coach actions (Siri/Alexa bar)

Date: 2026-07-22. Node implementer report. Upstream iso-user / audit-log assumed PASSED (not re-litigated).

## 1. Nutrition tool inventory

Registered in `src/lib/coach/tools/{meal,recipe,lifestyle}-tools.ts` + `index.ts`; executed via the three branches of `src/app/api/coach/turn/route.ts` (direct-meal-log, confirmedTool, model tool-loop). All mutations flow through `applySnapshotMutation` and are audited (`direct-meal-log` / `confirmed-tool` / model-result summary).

| Tool | Args (zod) | Mutation | Destructive |
|---|---|---|---|
| get_todays_plate | {} | — (read) | no |
| search_foods | query, limit? | — | no |
| log_meal | food_id (id **or fuzzy name**), portion 1-2000, meal_slot, note? | add_meal | no |
| log_custom_meal | name, kcal 0-5000, protein/carbs/fat 0-500, meal_slot | add_meal | no |
| edit_meal | meal_id (id / **name** / **"last"**), patch{name?, meal_slot?, kcal?, protein?, carbs?, fat?} | update_meal | no |
| delete_meal | meal_id (id / **name** / **"last"**) | remove_meal | **yes** |
| suggest_meal | target_kcal?, target_protein?, preference? | — | no |
| search_recipes | query?, diet?, max_minutes? | — | no |
| get_recipe_detail | recipe_id (id **or fuzzy title**) | — | no |
| log_recipe_as_meal | recipe_id (id **or fuzzy title**), servings 0.25-20?, meal_slot | add_meal | no |
| add_recipe_to_grocery_list | recipe_id (id **or fuzzy title**) | set_grocery | no |
| generate_meal_plan | days 1-7, goal? | — | no |
| get_grocery_list | {} | — | no |
| add_grocery_item | name, quantity? | set_grocery | no |
| check_grocery_item | item (id or name, normalized) | set_grocery | no |
| clear_grocery_list | {} | set_grocery(empty) | **yes** |

Bold = capability added by this node.

## 2. Siri/Alexa-bar assessment (before → after)

| Capability | Before | After |
|---|---|---|
| Fuzzy food search (typos/case/partials) | OK — `rankedSearch` (levenshtein-1 prefix + subsequence) behind search_foods/search_recipes | unchanged |
| "log 2 eggs for breakfast" (no calories) | fell through to paid model path; deterministic parser required explicit calories | **deterministic**: parser resolves food from DB, scales portion by count ("2 eggs" → 2×50 g via "(N g each)" name annotation, else standard serving preset), logs via log_meal with real macros |
| "a bowl of oatmeal" quantity phrases | not parsed | container/filler words stripped (bowl/cup/glass/plate/serving/of...), word-numbers one–ten/dozen parsed |
| log_meal with a name instead of food_id | error "No food with id" | resolves via `resolveFood` (exact id → top ranked hit gated by `isConfidentMatch`); "chiken breast" → Chicken breast, grilled; "no-such-food" still errors (confidence gate rejects the weak "Ramen noodles" hit) |
| edit_meal "make that lunch instead" retargeting | required exact meal id from get_todays_plate | `resolveLoggedMeal`: id → "last"/"that"/"latest" (most recent by loggedAt) → name (case-insensitive, ties go to most recent) → confident fuzzy |
| delete_meal destructive confirm | destructive:true, route emits `confirm_required` chip (verified in route lines: destructive tools pause and return a confirm card) | unchanged; now also accepts name/"last" refs, and confirmed delete replies "Done. I deleted \<name\> from today's log." instead of the generic summary |
| Recipe tools with a title instead of id | error "No recipe with id" | `resolveRecipe` (exact id → confident fuzzy title); typo "greek yougrt power bowl" resolves to Greek yogurt power bowl |
| Grocery: recipe ingredients → list, dedupe, quantity normalization | OK (`normalizeGroceryInput`/`groceryItemKey`) | unchanged |

Guard design: naive "take top fuzzy hit" was unsafe — probe showed `searchFoods("no-such-food")` returns Ramen noodles as a last-resort hit. Added `isConfidentMatch(query, fields)` in `src/lib/search-utils.ts`: ≥ half of the meaningful query terms (len ≥ 3) must match a field word by substring (either direction) or single-edit typo, otherwise the tool returns its error-shaped result and the model falls back to search_* pickers.

## 3. Changes made

- `src/lib/search-utils.ts` — new export `isConfidentMatch` (confidence gate for acting on a single fuzzy hit).
- `src/lib/food-database.ts` — new export `resolveFood(ref)` (id or confident fuzzy name).
- `src/lib/recipes-data.ts` — new export `resolveRecipe(ref)` (id or confident fuzzy title).
- `src/lib/coach/tools/meal-tools.ts` — log_meal uses `resolveFood`; new `resolveLoggedMeal` (id / "last" / name) used by edit_meal + delete_meal; schema descriptions updated.
- `src/lib/coach/tools/recipe-tools.ts` — get_recipe_detail, log_recipe_as_meal, add_recipe_to_grocery_list use `resolveRecipe`; descriptions updated.
- `src/lib/coach/direct-meal-log.ts` — NEW: `parseDirectMealLog` moved out of the route (route.ts cannot export helpers for tests) and extended with the no-calorie DB-resolution form. Explicit-calorie form and its reply text unchanged.
- `src/app/api/coach/turn/route.ts` — imports the parser; direct branch executes `parsed.tool` (log_meal or log_custom_meal) and emits `parsed.reply`; `summarizeConfirmedTool` gains delete_meal and log_recipe_as_meal cases. Audit summaries (`direct-meal-log`, `confirmed-tool`) unchanged.
- Tests: NEW `tests/unit/coach-direct-meal-log.test.ts` (6 tests); `tests/unit/tools.test.ts` +8 edge cases (fuzzy log_meal, edit-by-name, edit "last", delete-by-name, destructive flags, recipe-by-title ×2, unresolvable recipe error).

Not touched: knowledge.ts, system-prompt.ts, criteria.json, progress.md. No commits, no deploys, no migrations, no paid API calls (all e2e ran on the deterministic branches: `costUsdCents: 0`, model `deterministic-*`).

## 4. Test output

`pnpm vitest run tests/unit/coach-apply-mutation.test.ts tests/unit/coach-mutation-persistence.test.ts tests/unit/tools.test.ts tests/unit/coach-direct-meal-log.test.ts`

```
 Test Files  4 passed (4)
      Tests  119 passed (119)
```

`npx tsc --noEmit` — clean. `npx eslint` on all touched files — clean.

Full unit suite: 297/298 pass. The 1 failure (`tests/unit/persistence.test.ts > loadRecentMessages > returns empty when the user has no unarchived conversation`) is **pre-existing and not mine**: it expects `{ conversationId, messages }` but another in-flight node's `loadRecentMessages` now also returns `hasMore`/`nextBefore` (history pagination work, files `src/lib/coach/persistence.ts` + `src/app/api/coach/history/route.ts`). Verified: at HEAD (clean tree) that test passes; it fails only with that node's working-tree changes present.

## 5. E2E evidence (deterministic branches, dev server :3101, FUELWELL_PREVIEW_MODE=1, server stopped after)

Verified by reading the route: the direct-meal-log branch and the confirmedTool branch both return before any provider-access/model code — no model call, `inputTokens: 0`.

**"log 2 eggs for breakfast"** (direct branch):
```
text_delta: "Logged Egg, whole, large (50 g each) (100 g, ~143 kcal) as breakfast."
artifact:   type meal_logged, macros {calories:143, protein:13, carbs:1, fat:10}, remaining {calories:1807, protein:152}, undoable:true
mutation:   add_meal {mealType:"breakfast", items:[{name:"Egg, whole, large (50 g each) (100 g)", calories:143, protein:13}]}
turn_done:  {inputTokens:0, outputTokens:0, costUsdCents:0, model:"deterministic-meal-log"}
```

**"I had a protein shake 220 calories for snack"** (direct branch, custom path): log_custom_meal, 220 kcal manual-confidence, model `deterministic-meal-log`.

**Confirmed delete_meal by NAME** (`confirmedTool: {name:"delete_meal", input:{meal_id:"oatmeal"}}` against a snapshot meal id `m-oats`): resolved by name, `text_delta: "Done. I deleted Oatmeal from today's log."`, mutation `remove_meal m-oats`, model `deterministic-tool-action`.

**Confirmed log_recipe_as_meal by typo'd title** (`recipe_id: "greek yougrt power bowl"`): resolved to "Greek yogurt power bowl", add_meal 360 kcal / 30 g protein.

**Audit ring buffer** (`GET /api/coach/audit`, preview user):
```
{"rows":[
 {"tool":"log_recipe_as_meal","summary":"confirmed-tool","ts":"2026-07-22T15:51:38.281Z"},
 {"tool":"delete_meal","summary":"confirmed-tool","ts":"2026-07-22T15:51:38.198Z"},
 {"tool":"log_custom_meal","summary":"direct-meal-log","ts":"2026-07-22T15:51:38.172Z"},
 {"tool":"log_meal","summary":"direct-meal-log","ts":"2026-07-22T15:51:38.142Z"}]}
```

Full transcripts: scratchpad `e2e-transcript.txt` / `e2e-transcript-2.txt` (session-temporary).

## 6. Unverified / notes for orchestrator

- **Confirm chip via the model path** (model proposes delete_meal → `confirm_required` SSE → chip): the emit path is code-read-verified and the confirmed-execution half is e2e-verified above, but the model-proposing half needs a paid model call, which is out of budget for this node. Mechanism unchanged by this work.
- **"a bowl of oatmeal" semantics**: deterministic path logs the standard serving preset for the food's category; true portion inference for vague phrases ("a big plate of...") remains the model path's job.
- **searchRecipes typo ceiling**: transposition typos ("protien pancakes") return no hits — `levenshteinWithin` is plain Levenshtein (transposition = 2 edits). Owned by shared search-utils; fixing would touch ranking used by app-wide autocomplete, so left alone. Document-only.
- **Repo hygiene incident (resolved)**: while verifying the pre-existing persistence test failure I ran `git stash`/`pop`; the pop conflicted because a concurrent session was editing `src/lib/coach/client-store.ts`. All 11 other stashed files were restored byte-for-byte via `git checkout stash@{0} -- <files>`; `client-store.ts` was left at the concurrent writer's newer version. The stash entry **stash@{0} was intentionally kept** as a safety net (it contains an older `client-store.ts` variant, also copied to scratchpad `client-store.stash.ts`). Safe to drop once the client-store owner confirms their file is intact.

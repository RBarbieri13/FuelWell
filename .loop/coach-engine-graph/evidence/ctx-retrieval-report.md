# ctx-retrieval report — coach context retrieval coverage

Date: 2026-07-22
Branch: surf/ios-responsive-ux-recovery (working tree only; no commits made)

## Outcome

Complete. 8 of 10 domains were already retrieved and injected; 2 were missing
from the knowledge base (recipes entirely; groceries only present as raw
day-state in the system prompt, never as retrievable/persisted knowledge).
Both are now implemented in `src/lib/coach/knowledge.ts` following the
existing per-domain facts-array pattern. All tests pass.

## Domain-by-domain coverage table

Paths are relative to repo root. Line numbers are post-change.

| # | Domain | Status before | Evidence (retrieval + injection) |
|---|--------|---------------|----------------------------------|
| 1 | Profile | Covered | `src/lib/coach/knowledge.ts:152-160` (profileFacts from snapshot); `src/lib/coach/system-prompt.ts:111-114` (profile block); bootstrap `src/lib/coach/knowledge.ts:62-70` |
| 2 | Goals | Covered | `src/lib/coach/knowledge.ts:181` (goalPlan fact); `src/lib/coach/system-prompt.ts:119-121` (active goal, guidance, protein strategy from `goalContext`) |
| 3 | Meals / food log | Covered | `src/lib/coach/knowledge.ts:131-135,161-165` (per-meal totals into nutritionFacts); `src/lib/coach/system-prompt.ts:75-83,123-124` (meal lines) |
| 4 | Recipes | **Missing → added** | `src/lib/coach/knowledge.ts:140-141,190-199` (recipeFacts: liked/disliked recipe ids resolved to titles via `RECIPES`, diet/allergen constraints); formatted at `knowledge.ts:293`; bootstrap variant `knowledge.ts:100-103` |
| 5 | Groceries | **Partial → added** | Before: only raw day-state in `src/lib/coach/system-prompt.ts:92-105,127-128` (not in knowledge base, not persisted, not keyword-retrieved). Now: `src/lib/coach/knowledge.ts:127,139,200-208` (groceryFacts: counts + needed items); formatted at `knowledge.ts:294`; bootstrap `knowledge.ts:104-106` |
| 6 | Workouts | Covered | `src/lib/coach/knowledge.ts:136-138,166` (workoutFacts); `src/lib/coach/system-prompt.ts:85-90,125-126` |
| 7 | Progress / body-comp | Covered | `src/lib/coach/knowledge.ts:173-177` (bodyFacts from bodyLog), `178-183` (progressFacts: protein progress, goal plan, integration); `src/lib/coach/system-prompt.ts:116-118` (totals/remaining) |
| 8 | Settings | Covered | Preferences/units/diet filters/allergies: `src/lib/coach/knowledge.ts:167-172` (preferenceFacts), `159` (units); onboarding settings (meals/day, budget, cooking, coach style, check-in) via profile bootstrap `knowledge.ts:71-92`; system prompt `system-prompt.ts:113-114` |
| 9 | App activity | Covered (strengthened) | `src/lib/coach/knowledge.ts:179` — activity fact now includes meals, workouts, grocery items, and body-log entry counts (was meals+workouts only); integration/platform status `knowledge.ts:182` and `system-prompt.ts:122` |
| 10 | Coach memory | Covered | Load: `src/lib/coach/persistence.ts:223-237` (`coach_knowledge_bases` scoped by `user_id`); route wiring: `src/app/api/coach/turn/route.ts:419-429` (load → merge → persist → `retrieveCoachKnowledge` → `formatKnowledgeForPrompt`) → injected at `src/lib/coach/system-prompt.ts:130`; re-persisted after mutations at `route.ts:556-560,623-627,822-826` |

Auth scoping: all retrieval keys off `userId` resolved in
`src/app/api/coach/turn/route.ts:361-372` (Supabase auth user, or the
sample preview user only on preview hosts); Supabase queries run through the
user-scoped client so RLS applies (`src/lib/coach/persistence.ts:16-21`).
Cross-user merge is refused in `mergeCoachKnowledge`
(`src/lib/coach/knowledge.ts:216`).

## What changed and why

All changes in `src/lib/coach/knowledge.ts` (plus test file). Surgical; no
refactors; no schema migrations (new fields live inside the existing
`knowledge_jsonb` column).

1. `CoachKnowledgeBase` gains optional `recipeFacts` / `groceryFacts`
   (`knowledge.ts:16-17`). Optional because rows persisted before this change
   lack the fields; merge/retrieve guard with `?? []`
   (`knowledge.ts:227-228,249-250`).
2. `buildCoachKnowledgeBase` now derives grocery facts (item count, still-needed
   count, up to 12 needed item names with quantities) and recipe facts
   (liked/disliked recipe ids from `preferences.likes/dislikes` resolved to
   titles against `RECIPES`, capped at 12, plus diet/allergen constraints)
   (`knowledge.ts:127,139-141,190-208`).
3. `buildCoachKnowledgeFromProfile` (signed-in bootstrap path) emits the same
   two fields from profile likes/dislikes and onboarding grocery budget
   (`knowledge.ts:100-106`).
4. `mergeCoachKnowledge` merges + caps both new arrays at 40
   (`knowledge.ts:227-228`).
5. `retrieveCoachKnowledge` returns both, gated by the existing
   `wantsNutrition` regex (which already matched `recipe|grocery`)
   (`knowledge.ts:244,259-260`).
6. `formatKnowledgeForPrompt` adds "Recipe engagement" and "Grocery list
   state" sections (`knowledge.ts:293-294`), so both flow into the system
   prompt via the existing `retrievedKnowledge` injection
   (`system-prompt.ts:130`) — no route changes needed.
7. App-activity fact extended to include grocery and body-log counts
   (`knowledge.ts:179`).
8. `src/app/app/onboarding/page.tsx` untouched: its
   `buildInitialOnboardingCoachKnowledge` still type-checks because the new
   fields are optional; grocery budget already appears in its nutritionFacts.

## Test evidence

- Extended `tests/unit/coach-knowledge.test.ts` with two tests:
  recipe+grocery facts built/retrieved/formatted, and legacy-row
  (fields absent) merge/retrieve safety.
- `pnpm vitest run tests/unit/coach-knowledge.test.ts tests/unit/persistence.test.ts`
  → `Test Files 2 passed (2), Tests 14 passed (14)`, 0 failed, 0 skipped.
- Full unit suite `pnpm vitest run tests/unit`
  → `Test Files 36 passed (36), Tests 276 passed (276)`, 0 failed, 0 skipped.
- `pnpm exec tsc --noEmit` → exit 0.
- `pnpm exec eslint src/lib/coach/knowledge.ts tests/unit/coach-knowledge.test.ts` → exit 0.

## Not verified (with reasons)

- Live end-to-end turn against Supabase + Anthropic: not run (would require a
  signed-in session and paid API calls; boundaries forbid paid calls beyond
  normal dev testing and this node is unit-scoped). Injection path is verified
  at the unit level (`formatKnowledgeForPrompt` output asserted to contain the
  new sections, and `buildSystemPrompt` injection covered by the existing
  "injects retrieved knowledge" test).
- Client snapshot omits `preferences.units` (`src/lib/coach/client-store.ts:292-297`
  never sets `units`), so the units profile fact is empty for live snapshots
  even though the field is supported end-to-end. Pre-existing gap, out of this
  node's scope; noted, not changed.
- Recipe likes/dislikes only cover recipes the user has liked/disliked in the
  Recipes UI (`src/app/app/recipes/page.tsx:49`); the app has no other
  per-user recipe history (meals carry no recipe id — `MealRecord` in
  `src/lib/fuelwell-data.ts`), so this is the complete available signal for
  the recipes domain.

# fix-nutrition — implementation report

Node: `fix-nutrition` (design-intuition graph). Work order: `audit-nutrition.md` (32 findings
incl. verifier correction). Territory: `src/app/app/{log,nutrition,meal-plan,recipes,grocery-list}`,
`src/components/{food,recipes,log}`, grocery/meal-plan client stores under `src/lib`.
Verified against the shared dev server (http://localhost:3000, preview mode) via isolated
Playwright chromium contexts, desktop 1280x800 / mobile 390x844.

**Screenshot convention:** "before" = the audit's own `audit-nutrition-*.png` set (captured
2026-07-22 on the same working tree). The territory files carried pre-session uncommitted
modifications, so a stash-to-HEAD "before" would misrepresent the audited baseline —
after-shots are `fix-nutrition-after-*.png` (21 files, this directory), same convention as
fix-fitness.

## Core architectural change

`src/lib/use-meal-plan.ts` (new): a client meal-plan store in the same pattern as
`use-grocery-list` (module snapshot + `useSyncExternalStore` + localStorage, keyed by the
current week's Monday so stale weeks self-expire). The seed is declared as **recipe ids into
the real recipe library** and dated from real date logic (Mon of current week + offsets), so:
titles/macros/prep can never disagree with the recipe dialog, every plan row can open a real
recipe, aggregates always derive from live state, and RecipeDetail can genuinely write to the
plan. Exposes `useMealPlan()`, `setPlanMeal()`, `plannedMealFromRecipe()`,
`suggestRecipeForSlot()` (lean-protein ranked, same-day-title exclusion). Preview-scope only
(localStorage) — same persistence tier the page's hardcoded seed had, now honest about state.

## Per-finding before → after

### /app/log (L1–L8)
- **L1 (major) FIXED** — Before: disabled gradient "Add to Lunch" CTA read as the portion
  save button. After (`portion-picker.tsx`): section header "One-tap portions — tapping logs
  instantly", each row carries a "TAP TO LOG" affordance, and the custom CTA is relabeled
  "Log custom amount" (still gated on a valid amount) so it no longer masquerades as the
  main save. Evidence: `fix-nutrition-after-log-portion-desktop.png`.
- **L2 (minor) FIXED** — results list collapses `max-h-[34rem]` → `max-h-56` while a food is
  selected (`food-search.tsx`), so the portion card sits directly below instead of a ~35-row
  jump; auto-scroll retained.
- **L3 (minor) FIXED** — the Ingredient drawer no longer auto-opens on every save
  (`setDrawerOpen(true)` removed from `logItem`); the save confirmation now offers
  "Current meal (N)" to open it on demand. Totals rail stays visible after logging.
  Verified live: drawer closed after one-tap log, button present.
- **L4 (minor) FIXED** — Recent meals dedupes by meal name, most-recent-first (log page
  `RecentMeals`). Re-logging a meal no longer renders it twice.
- **L5 (minor) FIXED** — save confirmation now has **Undo**: `addMeal` result's meal id is
  kept and Undo calls `removeMeal`, restores session state, clears the goal-impact card.
  Verified live: log → Undo → "Removed …" confirmation. Evidence:
  `fix-nutrition-after-log-saved-undo-desktop.png`.
- **L6 (opportunity) FIXED** — "Logged today" header gets a "Nutrition detail →" link to
  `/app/nutrition` (`logged-meals.tsx`). (S7)
- **L7 (opportunity) FIXED** — the portion card repeats the active slot as an inline
  "ADDING TO Breakfast/Lunch/Dinner/Snack" chip row bound to the same state as the rail
  selector — a save can no longer land in an unseen slot. Also resolves L1's labeling half.
- **L8 (minor, no Fix line) VERIFIED, NO-OP** — denied/unavailable-geolocation fallbacks
  already exist with explicit user-facing messages (`restaurant-finder.tsx:240-268`:
  "Location permission was not granted. Enter a ZIP/city…"). Nothing to change.

### /app/nutrition (N1–N6)
- **N1 (major) PARTIAL (in-territory) + DEFERRED (nav)** — persistent-nav entry is shell
  territory (frozen; fix-shell already lights "Log meal"/"Log" on /app/nutrition). Honest
  inbound paths inside my territory: pre-existing log-header "View today's plate" plus the
  new L6 link. Sidebar/bottom-nav entry documented for coherence (S2).
- **N2 (major) DEFERRED** — the three overlapping add-food mechanisms live in
  `src/components/daily-detail/nutrition-edit-panel.tsx` / `detail-surfaces.tsx`, which are
  shared with `/app/fitness` (workouts node) and `/app/daily-review` (insight node);
  `detail-surfaces.tsx` was concurrently modified by a sibling during this run. Fix for the
  owner: drop the manual quick-add row or collapse it behind "Quick manual entry"
  (audit's prescription), keep header "Add food" + per-meal actions.
- **N3 (minor) DEFERRED** — same files (duplicate meal-card vs ledger editing surfaces).
- **N4 (minor) DEFERRED** — all three sub-44px controls (Duplicate, Delete, "Log meal
  page") live in the daily-detail files; fix is `min-h-11` on those three.
- **N5 (minor) DEFERRED** — macro-card badge alignment, `detail-surfaces.tsx`.
- **N6 (opportunity) DEFERRED, UNBLOCKED** — nutrition items → recipe detail now only needs
  a link to `/app/recipes?recipe=<id>` (deep link implemented this node, see R2).

### /app/meal-plan (M1–M7)
- **M1 (major) FIXED** — Before: "This week" pinned to Jun 8–11. After: dates generated
  from the current week (verified render: Mon Jul 20 / Tue Jul 21 / Wed Jul 22 / Thu Jul 23),
  a "Today" badge marks the current day and it is the default selection. Evidence:
  `fix-nutrition-after-meal-plan-desktop.png`, `-mobile.png`.
- **M2 (major) PARTIAL (in-territory) + DEFERRED (nav)** — new inbound/outbound links:
  recipes hero → "Open meal plan", meal-plan → "Browse the recipe library"; dashboard
  quick-action pre-existing; fix-shell's alias highlights Recipes on this route. The sidebar
  entry itself ("between Recipes and Groceries") is shell territory → coherence (S1).
- **M3 (major) FIXED** — all Plan-Quality/Grocery-readiness numbers ("N of 16", open slots,
  week-planned %, avg kcal/protein, next-best-move copy, unique-ingredient count) derive
  from the live store. Verified live: Fill slot on Tue dinner → hero 13→14 of 16, open
  slots 3→2, 81→88%, confirmation note rendered. Evidence:
  `fix-nutrition-after-meal-plan-fillslot-desktop.png`. The static "18 unique ingredients"
  is now computed from planned recipes' actual ingredient lists (stale-number sweep).
- **M4 (minor) FIXED** — Fill slot now fills with the suggestion the row actually displays
  (what-you-see-is-what-you-get); if that would duplicate a same-day dish it swaps to
  `suggestRecipeForSlot`, whose pool always excludes same-day titles.
- **M5 (major) FIXED** — every non-open row has an action bar: **Open recipe** (real
  recipe dialog — guaranteed by recipe-id seeding), **Log to today** (writes the day log
  with full macros, flips the slot to Logged, confirmation note), **Swap** (ranked
  replacement excluding same-day titles). Logged rows keep Open recipe only. Verified live:
  "Egg white oat cakes logged to today's breakfast." + appears on /app/log. Evidence:
  `fix-nutrition-after-meal-plan-day-actions-desktop.png`.
- **M6 (minor, no Fix line) SURGICAL** — the "week" label is now honest (real current-week
  dates; per-day planned badges derive live: n/len not n/4 hardcoded). Kept the 4-day scope
  and summary-strip week view: expanding to 7 days or meal-name week cells is a content
  redesign beyond a minor, and the audit offered no fix definition. Documented as a product
  call for coherence.
- **M7 (opportunity) FIXED** — "Next best move" hero now carries a CTA ("Go to Tue
  dinner") that selects the day and switches to day view; disappears when no open slots. (S6)

### /app/recipes (R1–R5)
- **R1 (major) FIXED** — Before: "Plan this meal" silently logged to today's food log with a
  silently chosen slot; meal plan untouched. After (`recipe-detail.tsx`), the audit's
  prescribed resolution with both capabilities honest and reachable:
  - **"Log to today"** opens a slot picker (defaults to the recipe's meal type), confirm
    button reads "Add to <slot>", confirmation names the slot.
  - **"Add to plan"** opens a day+slot picker (defaults to the first open slot of the
    recipe's meal type), warns "Replaces <dish> in that slot" when overwriting, and
    genuinely writes to the meal-plan store.
  - "Add ingredients" (groceries) unchanged.
  Verified live end-to-end: logged copy "…added to today's breakfast" AND log page contains
  the dish; planned copy "…planned for Tue dinner" AND meal-plan Tue dinner shows it.
  Evidence: `fix-nutrition-after-recipes-dialog-{actions,slotpicker,planpicker}-desktop.png`.
- **R2 (minor) PARTIAL** — `/app/recipes?recipe=<id>` deep link implemented: opening a
  recipe rewrites the URL (verified: `?recipe=greek-yogurt-power-bowl` while open), the
  param opens the dialog on load, close restores `/app/recipes`. This makes recipes
  linkable from grocery/plan surfaces (S9 unblocked, used by G6). Full route-backed dialog
  (`/app/recipes/<slug>`, back-button close) deferred — new route segment + dialog-route
  plumbing disproportionate to a minor; the linkability need the audit names is met.
- **R3 (minor) DEFERRED (nav)** — mobile bottom-nav slot for Recipes is shell territory.
  In-territory mitigation: recipes is now cross-linked from meal-plan and grocery surfaces.
- **R4 (minor, no Fix line) SURGICAL** — thumbs get explanatory tooltips
  (`preference-toggle.tsx` title attrs: "ranks this higher/lower in your lists") and the
  recipes filter card shows a persistent consequence line once any preference exists
  ("liked recipes rank first, 'Not for me' sinks to the end"). Full "Dislikes hidden" chip
  state would change ranking behavior (currently sink-not-hide) — out of scope for a minor.
- **R5 (opportunity) FIXED** — cards show a status badge when the dish is already logged
  today ("Logged today" → links `/app/nutrition`) or planned this week ("In plan · Tue" →
  links `/app/meal-plan`); computed against the day-log and meal-plan stores. Verified: 9
  badges on the seeded grid. (S8)

### /app/grocery-list (G1–G6)
- **G1 (major) FIXED** — "Clear list" now opens the app's inline confirm pattern (profile
  sign-out pattern: red-tinted panel, danger confirm + ghost cancel): "Clear all 10 items?
  The list is saved to Past lists below, so you can restore it any time." Verified live.
  Evidence: `fix-nutrition-after-grocery-clear-confirm-desktop.png`.
- **G2 (minor) FIXED** — cleared state now says "List cleared. / Restore a past list below,
  or add items manually." instead of the false "All shopped"; the counter shows "— / no
  items yet" instead of the broken-looking "0/0 checked off". "All shopped" copy is kept
  only when items exist and all are checked. Verified live. Evidence:
  `fix-nutrition-after-grocery-cleared-desktop.png`.
- **G3 (minor) FIXED** — past-list rows are info rows with an explicit **Restore** button
  (icon + label + aria-label). Restore is immediate when the current list is empty and asks
  ("Restore this past list (10 items)? It replaces the N items currently on your list.")
  when it would replace a non-empty list. Both paths verified live.
- **G4 (minor, verifier-corrected) DECIDED: LEAVE** — Store mode already renders on
  desktop (below the fold in the 2-col section). Raising it above the item table would
  demote the actual list — the page's job — for a secondary toggle pair. Left in place;
  recorded here as the deliberate placement call the verifier asked for.
- **G5 (minor, no Fix line) FIXED** — judgment per sibling pattern (G1): "Mark all shopped"
  uses the same confirm panel ("Mark all N remaining items as shopped? You can uncheck
  individual items afterwards.") and is now disabled when there is nothing to mark.
  Evidence: `fix-nutrition-after-grocery-markall-confirm-desktop.png`.
- **G6 (opportunity) FIXED** — grocery rows whose source exactly matches a library recipe
  title render the recipe as a link to `/app/recipes?recipe=<id>` (desktop chip + mobile
  "Recipe:" line). Exact-title matching only — fuzzy resolution mislinked in testing
  ("Turkey Quinoa Power Bowl" → Greek yogurt power bowl), and a wrong link is worse than
  none; recipe-sourced items from "Add ingredients" always match exactly. Verified live:
  add ingredients → 5 links → link opens the recipe dialog via deep link. Evidence:
  `fix-nutrition-after-grocery-recipe-deeplink-desktop.png`.

## Missing-surface table (S1–S10)

| # | From → To | Status |
|---|---|---|
| S1 | nav → /app/meal-plan | DEFERRED (shell) — highlight alias landed in fix-shell; sidebar entry → coherence |
| S2 | nav → /app/nutrition | DEFERRED (shell) — same |
| S3 | mobile nav → /app/recipes | DEFERRED (shell) |
| S4 | plan row → recipe detail | **DONE** (M5) |
| S5 | plan row → log-to-today | **DONE** (M5) |
| S6 | "Next best move" → named slot | **DONE** (M7) |
| S7 | logged item → detail | **DONE** (L6: Logged today → /app/nutrition) |
| S8 | recipe card → planned/logged badge → slot | **DONE** (R5) |
| S9 | grocery row → recipe detail | **DONE** (G6, via R2 deep link) |
| S10 | recipe detail → grocery list | already present |

## Files changed

- `src/lib/use-meal-plan.ts` — **new** meal-plan client store (see above).
- `src/app/app/meal-plan/page.tsx` — store-driven data, current-week dates + Today badge,
  live aggregates, honest fill/swap, row actions, hero CTA, recipe dialog mount,
  recipes cross-link.
- `src/components/recipes/recipe-detail.tsx` — R1 action redesign (Log to today + slot
  picker; Add to plan + day/slot picker with replace warning).
- `src/app/app/recipes/page.tsx` — deep-link open/close (`?recipe=`), meal-plan hero link,
  plan/logged badge computation, thumbs-consequence line.
- `src/components/recipes/recipe-card.tsx` — optional `planStatus` badge (link chip).
- `src/app/app/log/page.tsx` — drawer no longer auto-opens, Undo wiring, "Adding to" slot
  chips in portion card, Current-meal drawer trigger, recent-meals dedupe.
- `src/components/log/portion-picker.tsx` — tap-to-log affordances, "Log custom amount"
  CTA, dropped now-unused `mealTypeLabel` prop (orphan of my change).
- `src/components/log/food-search.tsx` — list collapses while a selection is active.
- `src/components/log/logged-meals.tsx` — "Nutrition detail" header link.
- `src/components/food/preference-toggle.tsx` — explanatory `title` tooltips.
- `src/app/app/grocery-list/page.tsx` — confirm panel for clear/mark-all/restore, honest
  cleared/empty copy, labeled Restore, exact-title recipe links, planned-days count wired
  to the meal-plan store.

No `src/components/layout|ui|daily-detail` files touched. No commits made (orchestrator
commits per protocol).

## Ruleset compliance (design-ruleset C1–C5)

- Diff-checked: zero new hex values, zero new radius literals, zero new shadow literals —
  every arbitrary value added already exists in the dominant sets (`rounded-[1rem/1.15/
  1.25/1.35rem]`, existing green-tinted shadows, `#16302a`-family hexes only where the
  file already used them).
- Primitives: `Button`/`Card`/`Badge`/`Dialog` reused; confirm UI mirrors the existing
  profile sign-out pattern; chips reuse the app's pill grammar; lucide-react only.
- Touch targets: all new interactive controls carry `min-h-11` on mobile; `aria-pressed`/
  `aria-label`/`role="status"`/`tabular-nums` used throughout.

## Test / verification output

- `pnpm lint` — clean (re-run after final edit).
- `pnpm exec tsc --noEmit` — clean.
- `pnpm vitest run tests/unit` — **39 files, 333 tests, all passed** (grocery/recipe coach
  canaries green).
- `pnpm playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts` — **4 passed,
  12 skipped** (identical self-skip set to baseline: agentic tests without paid API keys).
- Console errors: **zero** across all 5 pages × both viewports and all 7 interaction flows
  (tracked `console.error` + `pageerror` in every isolated context).
- Live re-runs (scripted, isolated contexts): recipe-dialog Log-to-today updates the food
  log AND Add-to-plan updates the meal plan (both destinations checked); Fill-slot updates
  every aggregate on screen; Clear list / Mark all / Restore-over-nonempty all ask first.
- Note: at node start the shared dev server 500'd on all routes due to a sibling's
  mid-refactor (`progress/page.tsx` importing a not-yet-created `progress-client`); it
  healed when the sibling landed the file. Not caused by, and not affecting, this node.

## Deferrals summary (for the coherence node)

| Item | Findings | Why deferred | What's needed |
|---|---|---|---|
| Sidebar entries for Meal plan + Nutrition; mobile-nav Recipes | N1, M2, R3 / S1–S3 | Shell surfaces frozen (fix-shell landed aliases only) | Add nav entries or merge decision |
| Add-food mechanism consolidation, ledger dedup, 3 sub-44px targets, Fat-badge alignment, item→recipe links on nutrition | N2, N3, N4, N5, N6 | `src/components/daily-detail/*` is shared with fitness (workouts node) and daily-review (insight node); sibling was editing it concurrently | Owner applies audit's prescriptions; N6 can now use `/app/recipes?recipe=<id>` |
| Route-backed recipe dialog (`/app/recipes/<slug>`) | R2 (full form) | New route segment; deep-link need already met via query param | Coherence/product call |
| 7-day week view with meal names | M6 (full form) | Content redesign beyond a minor; no Fix line in audit | Product call |

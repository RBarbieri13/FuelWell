# audit-nutrition — Nutrition-surface UX audit (read-only)

Mission node: `audit-nutrition` of the FuelWell design-intuition mission.
Date: 2026-07-22 · Dev server: http://localhost:3000 (anonymous preview, seeded Alex Preview user)
Viewports: 1280x800 desktop and 390x844 mobile (Playwright, isolated Chromium contexts).
Pages walked as a user: `/app/log`, `/app/nutrition`, `/app/meal-plan`, `/app/recipes`, `/app/grocery-list`.
Flows exercised: food search → portion → save; recent-meal one-tap repeat; macro breakdown expander;
Restaurants/Photo/Scan modes; custom-meal form; recipe open → Add ingredients → Plan this meal;
meal-plan day/week toggle and Fill slot; grocery check/uncheck, quantity, custom item add, Clear list → past-list restore; mobile store mode.

Severity scale: **blocker** / **major** / **minor** / **opportunity**.

## Global results

- Console errors: **0 on all 5 pages, both viewports, across every interaction pass.**
- Pilot-UI blocker sweep: no framework overlays, no blank screens, no clipped text observed,
  no horizontal document overflow at either viewport, no touch target below 32px.
  Sub-44px targets exist only on `/app/nutrition` (see N4).
- Note on tooling: an early check via the shared Playwright-MCP browser showed the URL being
  changed mid-audit (`/app/log` → `/app/workouts` → `/app/dashboard`); this was another session
  driving the same shared browser, **not** an app redirect — verified clean in isolated contexts.
- Cross-cutting: meal-plan/grocery seed dates are fixed to "Mon, Jun 8"–"Thu, Jun 11" while the
  real date is Jul 22 — both pages label this "This week" (see M1).

---

## 1. /app/log — Log a meal

Screenshots: `audit-nutrition-log-desktop.png`, `-log-desktop-full.png`, `-log-mobile.png`,
`-log-desktop-portion.png`, `-log-desktop-saved.png`, `-log-desktop-noresults.png`,
`-log-desktop-cal-breakdown.png`, `-log-desktop-custom-meal.png`, `-log-desktop-recent-tap.png`,
`-log-desktop-mode-{restaurants,photo,scan}.png`, `-log-mobile-portion.png`.

Console errors: 0 (desktop and mobile).

What works well: search with cooking-method variants ("salmon" → 8 relevant results); one-tap
portions log instantly with a confirmation banner and a "Goal impact" card ("1112 kcal and 71g
protein remain… Build the next meal around lean protein"); empty search state is helpful
("No matches yet. Try a different search term, or add your own meal below."); mode subcopy
("Best for known foods / eating out / uncertain plates / packaged foods") sets expectations;
portion card auto-scrolls into view on mobile; "View today's plate" correctly opens `/app/nutrition`.

Findings:

1. **[major] L1 — Disabled "Add to <meal>" button reads as the portion save button.**
   After Choose, the portion card shows three one-tap portions, a custom-amount field, and a
   prominent gradient "Add to Lunch" button that is **disabled** (opacity 50%) until either a
   portion is tapped (which saves instantly, no button needed) or a custom amount is typed.
   A first-time user cannot predict that tapping "Fillet (140 g)" saves immediately while the
   big CTA below it is inert. Verified: CTA `disabled=true` before portion selection; tapping
   a portion saves with no CTA press. Evidence: `-log-desktop-portion.png`.
   Fix: either make the portion rows visibly one-tap ("Tap to log") and move the CTA inside the
   custom-amount block, or require portion selection + single CTA for both paths.

2. **[minor] L2 — Portion card appears below the full results list.**
   Clicking "+ Choose" on a result renders the "Add to Today's Plate" card *after* the ~35-row
   food list; the app auto-scrolls, which works, but the search context disappears off-screen and
   the spatial jump is disorienting on desktop. Evidence: `-log-desktop-portion.png`.
   Fix: render the portion picker as a popover/inline expansion under the chosen row, or pin it
   in the right rail next to "Today's totals".

3. **[minor] L3 — Ingredient drawer opens on every save and covers the totals rail.**
   Each add (search or recent-tap) opens a right-side "Ingredient drawer / CURRENT MEAL" panel
   that overlays the "Logging for" and "Today's totals" cards until manually closed — exactly the
   feedback surfaces a user wants to see after logging. Evidence: `-log-desktop-recent-tap.png`,
   `-log-desktop-noresults.png`. Fix: keep the drawer closed by default (toast already confirms),
   or dock it below totals instead of overlaying.

4. **[minor] L4 — Recent meals shows duplicates after re-logging a meal.**
   After one-tap repeating "Greek yogurt power bowl", the Recent meals row rendered it twice
   (…power bowl · Chicken quinoa bowl · …power bowl). Evidence: `-log-desktop-recent-tap.png`.
   Fix: dedupe recents by meal identity, most-recent-first.

5. **[minor] L5 — No Undo on instant logging.**
   One-tap portions and recent-meal taps save immediately; the toast ("Salmon, Atlantic, baked
   (Fillet (140 g)) added to lunch.") has no Undo. Recovery requires finding the meal group in
   "Logged today" and pressing Remove (which removes the whole meal group, not the single item).
   Fix: add Undo to the save toast.

6. **[opportunity] L6 — Logged meal → nutrition detail.**
   Items under "Logged today" have Edit (pencil) only. There is no path from a logged item to its
   food/nutrition detail (micros, per-100g, portion history). Exact link: `/app/log` "Logged
   today" item → food detail view (or `/app/nutrition` anchored to that meal).

7. **[opportunity] L7 — "Logging for" meal selector is stranded in the right rail on desktop.**
   The food list (left) and the meal-slot selector (top-right card) are ~700px apart; a user
   scanning the list can save to the wrong meal without ever seeing the selector. The save toast
   is the only cue. Fix: repeat the active slot in the portion card header ("Add to **Lunch** —
   change"), which also fixes L1's labeling.

8. **[minor] L8 — Restaurants mode "Use my location" has no headless/denied fallback messaging
   visible until used; menu preview relies on seeded chains (Chipotle etc.).** Recorded as
   observation only — geolocation was not granted in the audit context. Evidence:
   `-log-desktop-mode-restaurants.png`.

---

## 2. /app/nutrition — Nutrition detail

Screenshots: `audit-nutrition-nutrition-desktop.png`, `-nutrition-desktop-scrolled.png`,
`-nutrition-desktop-editlogged.png`, `-nutrition-mobile.png`, `-nutrition-mobile-scrolled.png`.

Console errors: 0.

What works well: "What makes up today's score" framing with honest copy; four macro cards with
% and remaining; per-meal cards with item-level macro chips; dashed "Dinner — not logged yet ·
1,400 kcal of room left · Add dinner" slot is a strong empty state; "Add food" → `/app/log`
works; bottom cross-links (Open daily detail / Open fitness / Log food) are labeled with intent.

Findings:

1. **[major] N1 — Page not reachable from any persistent navigation.**
   `/app/nutrition` is absent from the desktop sidebar and the mobile bottom nav. It is reachable
   only via in-page links (Log "View today's plate", dashboard "Open meal breakdown", coach).
   A user who lands anywhere else cannot find "Nutrition detail" at all. Exact fix: add it to the
   sidebar (e.g. under Log meal) or merge it into an existing tab.

2. **[major] N2 — Three overlapping "add food" mechanisms on one page.**
   (a) header "Add food" → `/app/log`; (b) per-meal "Log another"/"Add dinner"; (c) an inline
   "Add or edit meals" manual-macros row (MEAL/FOOD/CALORIES/…/Add) that duplicates the Log
   page's "Add your own meal" form but without search, plus a "Log meal page" link right beside
   it. Same job, three UIs, unclear which one a user should pick. Evidence:
   `-nutrition-desktop-scrolled.png`. Fix: keep header "Add food" + per-meal quick actions; drop
   the manual quick-add row (or collapse it behind "Quick manual entry").

3. **[minor] N3 — Duplicate meal actions between top meal cards and the "Edit logged items" ledger.**
   Meal cards already offer Edit meal / Log another / Duplicate / Delete; expanding "Edit logged
   items" renders a second list of the same meals with Duplicate / Delete meal / Edit item.
   Two places to do the same edits with slightly different capability (item-level edit only in
   the ledger). Evidence: `-nutrition-desktop-editlogged.png`. Fix: one editing surface — put
   "Edit item" on the meal cards and remove the ledger, or vice versa.

4. **[minor] N4 — Sub-44px touch targets on mobile (pilot flag).**
   Measured: "Duplicate" 102x32, "Delete" 85x32 (both per-meal, twice), "Log meal page" 284x36.
   Everything else on the five pages passes 44px. Fix: min-h-11 on these three controls.

5. **[minor] N5 — Macro card badge placement is inconsistent on mobile.**
   Calories/Protein/Carbs show the % badge below the label; Fat shows it inline right of the
   label, breaking the scan pattern in the 2x2 grid. Evidence: `-nutrition-mobile.png`.

6. **[opportunity] N6 — Logged item → recipe/food detail.**
   Items ("Chicken quinoa bowl · 1 serving") are plain rows; the same dish exists in the recipe
   library with full ingredients. Exact link: nutrition meal item → recipe detail dialog
   (`/app/recipes` + open) when the item matches a recipe.

---

## 3. /app/meal-plan — Meal plan

Screenshots: `audit-nutrition-meal-plan-desktop.png`, `-meal-plan-desktop-scrolled.png`,
`-meal-plan-desktop-tue.png`, `-meal-plan-desktop-week.png`, `-meal-plan-desktop-fillslot.png`,
`-meal-plan-mobile.png`, `-meal-plan-mobile-scrolled.png`.

Console errors: 0.

What works well: Plan-quality hero with a concrete "Next best move"; day cards with per-day
protein and 4-dot slot indicator; day detail lists slots with kcal/protein/prep-time and
Logged/Planned status chips; empty slot shows a suggested recipe with a one-click "Fill slot";
"Build grocery list" → `/app/grocery-list` is the right cross-link.

Findings:

1. **[major] M1 — "This week" shows Jun 8–11 while the real date is Jul 22.**
   The seeded plan is pinned to fixed dates six weeks in the past and labeled "This week"; the
   grocery page repeats "for 4 planned days". First impression is a broken/stale app — the exact
   trust failure a daily-decision product cannot afford. Evidence: `-meal-plan-desktop.png`.
   Fix: generate seed dates relative to the current week (Mon of current week + offsets).

2. **[major] M2 — Page absent from all navigation.**
   `/app/meal-plan` is not in the sidebar or mobile bottom nav; the only inbound links in the
   product are a dashboard quick-action and this audit's direct URL (verified by grep:
   `quick-actions.tsx` is the sole nav-ish reference). Desktop users on any other page have no
   path to it. Fix: sidebar entry between Recipes and Groceries.

3. **[major] M3 — "Fill slot" does not update the plan aggregates.**
   Clicking Fill slot on Tue dinner flips the slot chip to "Added", but "13 of 16 meals are
   planned", "3 OPEN SLOTS", "WEEK PLANNED 81%", avg kcal/protein, and the "Next best move: fill
   Tue dinner…" copy all keep their stale values on the same screen. Evidence:
   `-meal-plan-desktop-fillslot.png`. Fix: recompute plan-quality/grocery-readiness state from
   the slot list on change.

4. **[minor] M4 — Fill-slot suggestion can duplicate the same day's lunch.**
   Tue lunch was "Chicken Cobb Salad (Planned)"; Fill slot inserted "Chicken Cobb Salad (Added)"
   as dinner — same dish twice in one day, despite the hero advising "a lean protein recipe".
   Fix: exclude same-day dishes from the suggestion pool.

5. **[major] M5 — Planned meals are dead ends.**
   Meal rows (name, kcal, protein, prep time) are not clickable — no recipe detail, no swap, no
   "log this now", no remove. The only interactive elements on the page are Day/Week, day cards,
   Fill slot, and Build grocery list (verified via control dump). Exact links a user expects:
   meal-plan meal → recipe detail dialog; meal-plan meal → "Log to today" (`/app/log` prefilled);
   meal-plan meal → swap/remove.

6. **[minor] M6 — "Week" view adds only a small summary strip.**
   Week shows per-day 4/4-3/4 chips + kcal/protein ("Week at a glance") but no meal names and no
   interaction; a 4-day "week" (16 slots) also reads oddly against the label. Evidence:
   `-meal-plan-desktop-week.png`.

7. **[opportunity] M7 — "Next best move" is copy, not a control.**
   The hero names the exact action ("fill Tue dinner with a lean protein recipe") but offers no
   button; the user must find Tue → scroll to dinner → Fill slot. Exact link: hero CTA → selects
   Tue, scrolls to dinner slot, or directly opens a filtered recipe picker.

---

## 4. /app/recipes — Recipe library

Screenshots: `audit-nutrition-recipes-desktop.png`, `-recipes-desktop-full.png`,
`-recipes-desktop-detail.png`, `-recipes-desktop-add-ingredients.png`,
`-recipes-desktop-plan-meal.png`, `-recipes-mobile.png`, `-recipes-mobile-detail.png`.

Console errors: 0.

What works well: "LEFT TODAY" macro chips tie the library to today's remaining budget; Best-fit
card; meal-type + diet filters; 612-recipe grid with macro chips and paged "Show 12 more";
recipe dialog is complete (per-serving macros incl. fiber, ingredients with amounts, steps) and
clean on mobile; "Add ingredients" works end-to-end — "5 ingredients added to Groceries." and
the grocery list grows 10→15 with a per-recipe filter chip. This is the best add-all-to-grocery
flow in the app.

Findings:

1. **[major] R1 — "Plan this meal" actually logs the meal to today.**
   Clicking it shows "Greek yogurt power bowl added to today's breakfast." and the dish appears
   in `/app/log` "Logged today" (totals 850→1,210 kcal, verified); `/app/meal-plan` is untouched
   (Mon breakfast still "Egg White Feta Wrap"). The label promises planning; the action is
   logging, and the slot is chosen silently from the recipe's category (Breakfast) regardless of
   the current time or the Log page's selected slot. Evidence: `-recipes-desktop-plan-meal.png`,
   `-log-desktop-saved.png` context. Fix: rename to "Log for today" with a slot picker, or make
   it genuinely write to the meal plan with a day+slot picker.

2. **[minor] R2 — Recipe detail is unlinkable (button-only dialog, URL never changes).**
   Recipes open as a dialog with no route (`/app/recipes` stays). No deep link, no share, no
   back-button close, and other surfaces (meal plan, nutrition) can't link to a recipe.
   Fix: route-backed dialog (`/app/recipes/<slug>`).

3. **[minor] R3 — Mobile reachability.**
   Recipes is not in the mobile bottom nav and the hidden sidebar leaves no persistent path;
   users depend on the dashboard "Find meals that fit" card. Same class of issue as N1/M2.

4. **[minor] R4 — Card thumbs (Like/Not for me) are unexplained.**
   Thumbs appear on every card and in the dialog with no visible consequence (no "hidden because
   you disliked" state on the grid, no preference confirmation). A first-time user cannot predict
   the outcome. Fix: toast + a "Dislikes hidden" filter chip state, mirroring the Log page's
   Favorites/Dislikes tabs.

5. **[opportunity] R5 — No "already in your plan / logged today" signal on cards.**
   Cards for dishes already planned or logged today look identical to the rest; the "BEST FIT"
   pick (Greek yogurt power bowl) was in fact already logged as breakfast in the seed. Exact
   from→to: recipe card/dialog → badge linking to the meal-plan slot or today's log entry.

---

## 5. /app/grocery-list — Grocery list

Screenshots: `audit-nutrition-grocery-list-desktop.png`, `-grocery-list-desktop-checked.png`,
`-grocery-list-desktop-added.png`, `-grocery-list-desktop-cleared.png`,
`-grocery-list-desktop-pastlist.png`, `-grocery-list-mobile.png`,
`-grocery-list-mobile-checked.png`, `-grocery-list-mobile-scrolled.png`.

Console errors: 0.

What works well: check-off works with progress (2/10→3/10, strikethrough, "7 items left");
custom item add works ("Sparkling Water", auto title-case, "Added manually" source chip,
counter → 2/11); recipe-source filter chips; desktop table has quantity steppers, per-item
category dropdown, serving guidance and benefit copy; mobile switches to cards with large
44px+ controls plus a store mode (Hide checked / Keep screen awake) — a genuinely good
in-store experience; "Add ingredients" from recipes lands here correctly grouped.

Findings:

1. **[major] G1 — "Clear list" fires instantly with no confirmation.**
   One click empties the entire list (10 items) with no dialog and no Undo toast. A past-lists
   entry does allow recovery, but nothing tells the user that at click time. Evidence:
   `-grocery-list-desktop-cleared.png`. Fix: confirm dialog or Undo toast referencing Past lists.

2. **[minor] G2 — Post-clear empty state says "All shopped for this week. You're set."**
   After *clearing* (not shopping), the header celebrates completion — wrong message for the
   action taken, and "0/0 checked off" reads as broken. Fix: separate cleared-state copy
   ("List cleared — restore from Past lists or add items.").

3. **[minor] G3 — Past-list restore is an unlabeled row.**
   The "Past lists" entry ("10 items · 2 shopped · Jul 22, 12:04 PM") is a button that silently
   restores the whole list when clicked — nothing says "Restore", and clicking it *replaces* the
   current list without confirmation. Verified restore works. Evidence:
   `-grocery-list-desktop-pastlist.png`. Fix: explicit "Restore" button + confirm when the
   current list is non-empty.

4. **[minor] G4 — Desktop hides store mode.**
   "Hide checked" / "Keep screen awake" exist only in the mobile layout (buttons present but
   invisible at 1280px). Desktop users with a long list have no way to collapse checked items.
   Fix: show "Hide checked" on desktop too.

5. **[minor] G5 — "Mark all shopped" also lacks confirmation** (checks all 10 at once; reversible
   only item-by-item or via Clear). Lower risk than G1 since unchecking is easy, but same pattern.

6. **[opportunity] G6 — Grocery item → source recipe.**
   Rows name their recipe ("Recipe: Turkey Quinoa Bowl") as text/expander only. Exact link:
   grocery row recipe chip → recipe detail dialog (blocked on R2 routing).

---

## Missing-surface summary (exact from→to)

| # | From | To | Status |
|---|------|----|--------|
| S1 | Sidebar / bottom nav | /app/meal-plan | missing everywhere (M2) |
| S2 | Sidebar / bottom nav | /app/nutrition | missing everywhere (N1) |
| S3 | Mobile bottom nav (or menu) | /app/recipes | missing on mobile (R3) |
| S4 | Meal-plan meal row | recipe detail | missing (M5) |
| S5 | Meal-plan meal row | log-to-today | missing (M5) |
| S6 | Meal-plan "Next best move" | the named slot/action | copy only (M7) |
| S7 | Logged item (log/nutrition) | food/recipe detail | missing (L6, N6) |
| S8 | Recipe card | "planned/logged" badge → slot | missing (R5) |
| S9 | Grocery row recipe chip | recipe detail | missing (G6) |
| S10 | Recipe detail | grocery list ("Add ingredients") | **present and working** |

## Top 3 highest-impact opportunities

1. **Put Meal plan and Nutrition into primary navigation and make planned meals actionable
   (M2 + N1 + M5).** Two of the five core nutrition surfaces are orphaned behind single
   dashboard links, and the meal plan is read-only once reached — wiring nav + meal-row actions
   (open recipe / log to today / swap) turns the planning loop into a usable daily cycle.
2. **Fix the "Plan this meal" purpose mismatch (R1).** The single primary CTA on every one of
   612 recipe dialogs silently logs food to today instead of planning it — rename + slot picker,
   or actually write to the plan. Highest per-click trust damage in the audited area.
3. **Make plan/grocery state react and read truthfully (M3 + M1 + G1/G2).** Fill slot must update
   plan-quality numbers; seeds must use the current week; Clear list needs confirm/undo and a
   truthful empty state. All are "the numbers on screen are wrong" class bugs that undermine a
   product whose pitch is trustworthy daily math.

## Finding counts per page

| Page | blocker | major | minor | opportunity | total |
|------|---------|-------|-------|-------------|-------|
| /app/log | 0 | 1 | 5 | 2 | 8 |
| /app/nutrition | 0 | 2 | 3 | 1 | 6 |
| /app/meal-plan | 0 | 4 | 2 | 1 | 7 |
| /app/recipes | 0 | 1 | 3 | 1 | 5 |
| /app/grocery-list | 0 | 1 | 4 | 1 | 6 |
| **Total** | **0** | **9** | **17** | **6** | **32** |

---
## VERIFIER CORRECTION (2026-07-22, round-1 verification)
G4 is OVERSTATED: the grocery "Store mode" card (Hide checked / Keep screen awake) renders unconditionally on desktop — it is below the fold in the lg:grid-cols-2 section, not mobile-only/invisible (only one md:hidden in the file, on an unrelated wrapper). Fix-nutrition: treat G4 as a placement/hierarchy question (raise it or leave it), not a missing-on-desktop bug. Also: 5 findings (L8, N5, M6, R3, G5) lack explicit Fix: lines — use judgment per the pattern of sibling findings.

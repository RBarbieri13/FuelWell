# Audit: Fitness surfaces (/app/workouts, /app/fitness, /app/recovery, /app/activity)

Node: `audit-fitness` · 2026-07-22 · READ-ONLY audit, anonymous preview (Alex Preview seed data), dev server localhost:3000.
Viewports: 1280x800 and 390x844 (isolated Playwright; scripts in session scratchpad `audit-fitness*.mjs`).
Flows exercised: browsed library (search, typo search, filters), opened workout detail, started + completed two live workouts (mobility-reset, upper-push-base), logged custom activity (Walking 30min, Running 25min), edited hub activity entry, toggled recovery/activity period controls, verified cross-page persistence.

**Console: zero errors on all 4 pages, both viewports, across all flows. No framework overlays, blank screens, or body-level horizontal overflow.**

Screenshots: `evidence/audit-fitness-*.png` (referenced per finding).

---

## /app/workouts (hub + library + detail + live) — 8 findings

**W1. HIGH — Live/detail exercise lists contradict the workout's own plan copy.**
"Mobility reset" (plan: "Downshift · box breathing", "Mobility flow · 90/90 switches, couch stretch, thoracic reach") renders an Exercise Detail / live session of **Dumbbell press, Split squat, Cable row, Hinge drill, Farmer carry** — with weight-used fields — for a Light mat mobility session. "Upper push base" (chest/shoulders/triceps) live session includes **One-arm row, Lat pulldown, Face pull** (pull movements).
Root cause (verified in source): `src/lib/workout-library.ts` — `getWorkoutExercisePlan()` falls back to `buildExercisePlan()` using `exerciseBank[category]`; `mobility-reset` is defined with `category: "full"` despite `workoutType: "Mobility"` (line ~133), and the `upper` bank mixes push and pull moves for all upper workouts.
Fix: give each curated workout an explicit `exercisePlan`, or key the bank on `workoutType`/focus and split upper into push/pull; mobility/cardio plans should never render "Weight used" inputs.
Screens: `workout-detail-seg1.png`, `workout-live-begun.png`, `workout-live-mobile.png`.

**W2. HIGH — Completing a live workout is a dead end.**
After checking sets and pressing "Log completed workout", the button becomes a disabled "Saved to Fitness" and nothing else changes; the only exit is the "Workout preview" back link. No link to the Fitness page it names, no progress/recovery/protein follow-up — while the parallel detail-page path ("Log this workout") *does* render "Logged for today / Review in fitness" links (`src/components/workouts/workout-log-actions.tsx:44-59`).
Fix: in `src/components/workouts/live-workout-session.tsx` (~line 356), on save show a completion panel: **from** live page **to** `/app/fitness` ("Review in Fitness"), `/app/log` ("Log post-workout protein" — mirrors Activity page's advice), `/app/workouts` ("Done"). Also note "Fitness" is not a nav destination a user can find (see F1).
Screens: `workout-completed.png`.

**W3. MEDIUM — Library table hides its action column behind unhinted horizontal scroll at 1280px.**
The 9-column table (Workout…Goal, Preview) is 1152px inside a narrower `overflow-x-auto` container; "Goal" and "Preview" are clipped with no scroll affordance (verified `scrollerCanScroll: true`). The row title already links to the detail page, so the off-screen Preview column is redundant.
Fix: drop the Preview column (keep row-title link) or reduce/prioritize columns at ≤1280px; add a scroll shadow if kept.
Screens: `workouts-library-seg1.png`.

**W4. MEDIUM — Generated permutation flood crowds the library.**
Searching "core" returns 20 rows of which 18 are programmatic near-duplicates ("Core stability {gym,home,machine,outdoor} {builder,beginner,advanced,low-impact,travel}"). Same pattern appears in detail-page "Close matches" ("Mobility flow gym builder" etc.). Reads as filler and buries the 2 curated core workouts.
Fix: collapse generated variants into one row per base workout with equipment/level selectable on the detail page, or rank curated workouts first and cap variants shown.
(Positive: search itself is good — "core" filters correctly and the typo "moblity" still surfaces Mobility reset first.)

**W5. LOW — Alternate-pick rows are 32px touch targets on mobile.**
In the expanded "Coach recommends" card, the two alternate workout links ("Mobility reset 18 min", "Upper push base 38 min") measure 282x32px (<44px).
Fix: pad rows to ≥44px height.
Screens: `workouts-mobile-pick.png`.

**W6. LOW — Sticky "Log completed workout" (disabled) is the dominant CTA before the session has begun.**
On the live page pre-Begin, the sticky footer shows the disabled log button prominently while "Begin" sits inside the review card (below the fold on mobile). First-time users see a dead primary button.
Fix: sticky bar should show "Begin" until started, then swap to the log button.
Screens: `workout-live-mobile.png`.

**W7. LOW — Hub is a triple-accordion with everything collapsed on first visit.**
All three sections (Coach recommends / Pick my own / Activity) hide their content behind buttons; the page is honest about cold-start ("No recent logged workout pattern yet…" — good empty state) but a first-timer sees only buttons. Consider auto-expanding the coach pick.
Screens: `workouts-desktop.png`, `workouts-todays-pick.png`.

**W8. Positive (verified behavior).**
Custom activity logging works end-to-end (22 activity types, minutes + optional distance, kcal estimate with stated assumptions); logged entries appear in hub "Recent activity — Editable today" with working Edit (minutes/calories inputs) and Delete, and flow through to /app/fitness. Hierarchy on hub is good: coach card visually dominant, secondary cards subordinate.
Screens: `workouts-log-activity.png`, `hub-edit-activity.png`, `activity-added.png`.

---

## /app/fitness — 5 findings

**F1. HIGH — "Fitness" is an unnamed, unreachable-by-nav identity; the workouts/fitness/activity split is confusing (requested check).**
The pages are *functionally* distinct (Workouts = choose/log a session; Fitness = today's movement dashboard; Activity = fuel-timing verdict) but the seams show everywhere a user looks:
- H1 is "Fitness detail" — detail of what? Nothing in the sidebar is called Fitness.
- Sidebar highlights **Progress** while on /app/fitness (`src/components/layout/sidebar.tsx:108`); mobile header pill reads "Progress · Activity" (`mobile-header.tsx:15`). Three different names for one page.
- The live workout save button says "Saved to **Fitness**" — a destination the user cannot find in any nav.
- /app/fitness and /app/activity both present today's steps (6,420), active calories, sleep, and planned movement; /app/fitness updates with logged workouts, /app/activity does not (see A1) — same-day numbers disagree in spirit across two pages.
Fix definition: pick one user-facing name ("Activity"), give it a nav entry (or an explicit card on Progress), retitle the H1 to match, correct the sidebar active-state mapping, and either merge /app/activity's verdict content into it or scope /app/activity clearly as "Fuel timing" and cross-link the two.
Screens: `fitness-desktop.png`, `fitness-mobile.png`, `activity-seg0.png`.

**F2. MEDIUM — "Edit routine" is a self-link no-op, repeated three times.**
Every routine card (Morning walk, Zone 2 ride, Mobility reset) has an "Edit routine" chip whose href is `/app/fitness` — the page it's already on. Clicking does nothing perceptible. (`src/components/daily-detail/detail-surfaces.tsx`.)
Fix: route to the actual editing surface (the "Edit today's activity" panel lower on this page — an in-page anchor/scroll would do) or remove the chip.
Screens: `fitness-seg1.png`.

**F3. LOW — Duplicated per-card chip pair, undersized on desktop.**
"Edit routine" + "Open workouts" repeat on all three cards (32px tall). One "Open workouts" already exists as the header "Add workout" CTA and again as "Workout page" in the edit panel — four routes to /app/workouts on one page.
Fix: keep the header CTA + one per-card action; enforce ≥44px.

**F4. LOW — "Planned" cards don't link to the workout they name.**
"Mobility reset — Planned · Tonight" doesn't link to `/app/workouts/mobility-reset` (from→to: routine card → its workout detail/live page). "Open workouts" goes only to the generic hub.

**F5. Positive (verified behavior).**
This page is live and honest: after completing "Upper push base" in the same session it appeared immediately with training minutes updated (38 min), and a logged "Running 25 min" showed up too. KPI tiles (Active calories/Training minutes/Steps/Readiness), estimated-vs-planned badges, and the "Data honesty" footer are the strongest data-provenance pattern in the app.
Screens: `fitness-after-complete.png`, `fitness-after-running.png`.

---

## /app/recovery — 5 findings

**R1. MEDIUM — Today / 3 days / 7 days toggle is decorative.**
Switching windows changes exactly one fine-print sentence ("Your 3-day readiness estimate is calculated from…"); score (72), readiness makeup, soreness map, and checklist are byte-identical across all three windows (verified by full main-text diff).
Fix: compute windowed aggregates (or a trend sparkline) per window, or remove the toggle until multi-day data exists — a control that changes nothing erodes trust in the whole page.
Screens: `recovery-seg0.png` vs `recovery-7days.png`, `recovery-3days.png`.

**R2. MEDIUM — Copy bug: "readiness iscalculated" (missing space), all three windows.**
`src/app/app/recovery/page.tsx:295` — `{windowEstimateCopy[selectedWindow]} calculated…`; the map values end in "is" and JSX collapses the whitespace. Renders "Today's readiness iscalculated…" in the What-is-estimated box.
Fix: `{windowEstimateCopy[selectedWindow]}{" "}calculated…`.
Screens: `recovery-mobile-bottom.png` (clearly visible), `recovery-seg2.png`.

**R3. LOW — Checklist rows point nowhere.**
"Sleep entered / Hydration check / Soreness check / Wearable sync (Missing)" are static rows. From→to gaps: each entered item → the surface where that input is edited (daily review / log); "Wearable sync — Missing" → settings/connect flow. A user who wants to fix "2 of 3 bottles" has no path.
Screens: `recovery-seg2.png`.

**R4. LOW — "Tonight target" chips (+1 bottle, 25g protein) are inert white pills styled like buttons.**
Verified: plain `<span>`s, no clickable ancestor. Either make them quick-log actions or restyle as plain badges.
Screens: `recovery-seg0.png`.

**R5. Positive (verified behavior).**
Best-structured page of the four: verdict headline + score, fully-clickable "Next actions" cards with correct destinations (workouts, /app/log, /app/activity), user-entered vs estimated badges on every tile, clear hierarchy. Header CTA "Pick a lower-intensity workout" → /app/workouts is exactly the right from→to.

---

## /app/activity — 5 findings

**A1. HIGH — Daily activity log is static sample data that ignores what the user actually does.**
After completing "Upper push base" in the same session, /app/fitness showed it but /app/activity still displayed "4 signals" and the same four canned entries (Breakfast logged, Walk detected, Lunch gap, Planned workout) — no logged workout. A page whose sidebar card is titled "Data honesty" shows a stale log next to a fresh one on /app/fitness.
Fix: read the same workout/activity store `useWorkoutLog` feeds (as detail-surfaces does) and merge real logged sessions into the timeline; label remaining canned rows as examples.
Screens: `activity-seg2.png` (log), compare `fitness-after-complete.png`.

**A2. MEDIUM — Now / After workout / Tonight toggle changes one label only.**
Full main-text diff between the three states: the only change is "NOW CONFIDENCE" → "AFTER WORKOUT CONFIDENCE" → "TONIGHT CONFIDENCE". Verdict, next-decision cards, meters, and log are identical. Same fix pattern as R1: make the verdict/fuel-timing content window-aware or drop the control.
Screens: `activity-seg0.png` vs `activity-afterworkout.png`, `activity-tonight.png`.

**A3. MEDIUM — Timeline entries are not clickable.**
No links inside "Daily activity log" (verified: zero anchors/buttons in the section). From→to opportunities: "Breakfast logged" → /app/daily-review or /app/log; "Planned workout — Zone 2 ride" → /app/workouts/zone-2-ride; "Walk detected" → /app/fitness; "Lunch gap" → /app/log (log carbs).
Screens: `activity-seg2.png`, `activity-mobile-bottom.png`.

**A4. LOW — Orphan page: no nav entry, no active state.**
Nothing in the sidebar or bottom tab bar highlights on /app/activity (verified: no `aria-current` anywhere). Only inbound link found in the app chrome/pages audited: Recovery's "Review activity verdict". Combined with F1, users who land here can't place it in the app's map.
Fix: fold into the Fitness/Activity consolidation (F1) and set an active-state mapping like fitness→progress at minimum.

**A5. LOW — Header window toggles are 36px tall (Now/After workout/Tonight; same on Recovery's Today/3/7 days).**
Borderline touch targets on mobile (<44px). Pad to 44px.

---

## Cross-page verdict on the /app/fitness vs /app/workouts question

They are **not a duplicate pair** — Workouts is choose/start/log, Fitness is today's movement ledger — but the user-facing packaging makes them feel like a confusing split three ways (Workouts hub "Activity" accordion, /app/fitness "Edit today's activity", /app/activity verdict page all overlap on activity logging/summary; three different names for /app/fitness; /app/activity stale while /app/fitness is live). Consolidation finding is F1 + A1; treat them together.

## Top 3 opportunities

1. **Fix the exercise-plan/category mismatch (W1)** — a user who opens "Mobility reset" and is told to do weighted dumbbell presses loses trust in every coach recommendation; one data-file fix plus bank keying.
2. **Close the workout-completion loop and unify the activity stores (W2 + A1)** — route "Saved to Fitness" somewhere real, and make /app/activity read the same live log /app/fitness reads.
3. **Consolidate the Fitness/Activity identity (F1 + A4)** — one name, one nav home, correct active states, and self-consistent cross-links (kills the "Fitness detail"/"Progress · Activity"/"Saved to Fitness" naming drift and the Edit-routine no-op along the way).

# Surf Report — Layout Campaign (`surf/parallel-layout`)

Autonomous layout/structure improvement pass over every FuelWell iOS screen
(the shipping app is the web app in a WKWebView shell, so all work is in
`src/`). Scope was strictly STRUCTURE: what appears on each screen, in what
order, grouped how, and what leads the first viewport. Sizing/type-scale and
color/border polish were left to the sibling campaigns.

Evidence: `surf-evidence/layout/baseline/` (before) and
`surf-evidence/layout/after/` (after), all routes at 320/390/430 x 844.
Screenshot harness: `scripts/surf-layout-shots.mjs`. Persona probe:
`scripts/surf-persona-probe.mjs`.

Note on evidence artifacts: full-page captures unclamp the app shell's
internal `<main>` scroller, so intentional horizontal scrollers (e.g. the
daily-review energy ledger) can widen those images. The real pages pass the
component-clipping gate at all widths.

## Per-screen findings and changes

### /app/dashboard — `dashboard-*.png`
**Findings.** "Calories left / Protein left" appeared three times in three
consecutive cards (hero EnergyStats, plate MiniMetrics, Macros bars). Quick
actions sat ~3.5 viewports deep, below analytics. Four tall deep-link cards
at the bottom duplicated existing destinations (hero CTA, Review tab, Move
tab) and cost ~2 viewports. Header search/bell buttons had no handlers (dead
affordances).
**Changes.** Merged "Today's plate" + "Macros" into one card (ring +
protein/carbs/fat bars + meal-breakdown link; calories bar dropped — the ring
IS the calories story). Removed the duplicate MiniMetrics row. Moved Quick
actions directly under the hero section. Paired "Today's focus" with "Logged
today" in one two-column section. Collapsed the four deep-link cards into a
compact "Go deeper" card of chevron rows. Removed the two dead header
buttons. Full-page height at 390px: 7,032 → 5,878px (−16%).

### /app/log — `log-*.png`
**Findings.** A tall narration hero pushed the search input ~1.5 viewports
down. The mode-help card + meal chip duplicated the meal selector below. The
portion picker ("Add to Today's Plate") lived in the desktop right column —
on a phone it rendered ~3 viewports below the tapped search result, so
selecting a food appeared to do nothing. A permanent "No food selected"
placeholder card shipped dead weight.
**Changes.** Hero compressed to a single row (title + plate link; narration
dropped). Mode help demoted to an inline caption. The portion picker card now
renders once, directly under the active mode panel, only when there is
something to show (selection, confirmation, or goal impact), and scrolls into
view on selection. Dead placeholder removed. Page height 7,672 → 6,510px;
search input now inside the first viewport.

### /app/daily-review — `daily-review-*.png`
**Findings.** Double narration: the "Overview" section header AND an inner
DetailHero both introduced the page before any data. The decision content
("What needs attention", "Next best review") sat below the large energy
ledger chart.
**Changes.** Removed the inner DetailHero (section header already narrates);
the Ask-coach CTA moved into the summary section as a compact link. Moved
"What needs attention" above the energy ledger: verdict → decision → evidence.
The ledger itself (heavily test-pinned) was not touched.

### /app/nutrition — `nutrition-*.png`
**Findings.** The page's actual content (the meal ledger) sat below three
tall nav cards and a bulky add/edit form; "Add missing meal" card duplicated
the hero "Add food" CTA.
**Changes.** Reordered to hero → macro tiles → meal ledger (incl. dinner
prompt) → edit panel → cross-links.

### /app/fitness — `fitness-*.png`
**Findings.** Same inversion: narration card + edit form before the activity
log.
**Changes.** Reordered to hero → summary tiles → activity log → workout
manager → source-check narration → data honesty.

### /app/grocery-list — `grocery-list-*.png`
**Findings.** The "Next best move" decision card sat at the very bottom of a
~10k px page; its guidance duplicated a narration sentence in the top summary
card. The add-custom-item form preceded the checklist (the in-store job).
**Changes.** "Next best move" now renders directly under the "This week"
summary (only while items remain); the duplicated summary sentence was
removed (kept only for the all-shopped state). The add-item form drops below
the checklist on phones via `max-lg:order-3` (desktop rail unchanged).

### /app/recipes — `recipes-*.png`
**Findings.** The grid rendered all 600+ recipe cards at once: the phone page
was ~253,000 px tall (the baseline full-page PNG hit Pillow's decompression-
bomb guard at 395M pixels).
**Changes.** Batched rendering (12 cards + "Show N more of M remaining"),
resetting on any filter change via a render-time key (no effect). Page height
at 390px: ~507,000 → 12,140 px. Search + filter behavior unchanged;
`tests/recipe-planning.spec.ts` still green.

### /app/meal-plan — `meal-plan-*.png`
**Findings.** Bottom "Ready for groceries" card fully duplicated the top
"Grocery readiness" card (same stat, same CTA). "Next best move" was generic
in the hero and specific at the bottom.
**Changes.** The specific next action moved into the hero narration; both
bottom cards deleted.

### /app/progress — `progress-*.png`
**Findings.** The "One next step" action card sat at the very bottom, below
charts and a mock weight-projection form.
**Changes.** Moved it directly under the trend-verdict card: verdict → next
step → evidence.

### Screens reviewed and deliberately NOT changed
- **/app/workouts** (+detail/live): already decision-first ("Coach
  recommends → Show today's pick"), and pinned by
  `workouts-progressive-disclosure.spec.ts`. The workout-detail page repeats
  duration/intensity in hero chips and a stat row — left alone to avoid
  cross-campaign conflicts (it is a sizing/visual call as much as an order
  call).
- **/app/coach** (+attachments, menu-review): the new landing structure from
  the recovery base is already decision-shaped (context chips + CTA + visible
  composer; ranked menu choices with per-option verdicts).
- **/app/recovery, /app/activity**: both already read verdict → decisions →
  evidence.
- **/app/dashboard/score**: exemplary contributor layout with per-card "Next:"
  actions.
- **/app/profile, /app/settings, /app/onboarding, /signup**: single-purpose,
  acceptable order; onboarding CTA visible in first viewport at 320.
- **Energy ledger internals** (daily-review chart): pinned by two dedicated
  specs; only its position changed.

## Persona simulation (via `scripts/surf-persona-probe.mjs`)

| Persona | Journey probe | Result after changes |
|---|---|---|
| Impatient power user | dashboard → depth to Quick actions / Log Meal | 1.42 / 1.45 viewports (was ~3.5) |
| Evening-only logger | /app/log → one-tap repeat of recent meal | Works; confirmation "added to dinner"; Recent meals at 1.89vh |
| Macro-focused athlete | protein visibility; search → select → portion | "Protein left" at 0.47vh; picker visible with no manual scroll after select |
| New user | signup CTA and onboarding start at 320px | CTA 0.77vh; "Start setup" 0.91vh — both first-viewport |
| Casual dieter | dashboard CTA → recipes → first recipe | Hero CTA present; first "Open recipe" at 1.62vh; show-more present |
| Older user (clarity) | daily-review reading order at 320px | Metrics 0.55vh → "What needs attention" 1.33vh → chart 2.38vh |

Consensus fixes from the persona round were already covered by the first
pass (picker adjacency, quick-action depth, decision-before-chart). One noted
trade-off kept as-is: Recent meals on /app/log sits at ~1.9 viewports; moving
it above search would push the search input below the fold at 320px, which is
the worse failure for the majority path.

## Gate results (all on `surf/parallel-layout`)
- `npm run lint` — clean
- `npx tsc --noEmit` — clean
- `npm run test:unit` — 36 files, 271 tests passed
- `npx playwright test --project=chromium` (against :3011) — 71 passed,
  0 failed, 12 skipped (pre-existing env-conditional skips: live-Coach tests
  need `ANTHROPIC_API_KEY`; authenticated-candidate paths need
  `FUELWELL_UI_TEST_EMAIL/PASSWORD`)
- `tests/mobile-component-clipping.spec.ts` — green at 320/375/390/430 after
  every screen commit

## Known risks for merge
- `src/components/daily-detail/detail-surfaces.tsx` and the dashboard/log
  pages are the most likely conflict points with the sizing and visual-polish
  sibling campaigns (same files, different lines).
- The removed dashboard header search/bell buttons were non-functional; if a
  sibling campaign wires them up instead, prefer their version.
- Recipes batching changes DOM count on that route; any new test asserting
  "all recipes rendered" would need the show-more interaction.

# audit-insight — Dashboard / Progress / Daily Review

Read-only UX audit of the three insight surfaces at 1280x800 and 390x844, anonymous
preview, dev server localhost:3000, 2026-07-22. No source edits made.
Console: 0 errors, 0 warnings on all three pages. Tap-target probe found no
interactive element under 44px height at 390px width on any page.

Screenshots (this directory, prefix `audit-insight-`):

| File | Page / state |
|---|---|
| audit-insight-dashboard-desktop.png | Dashboard top, 1280x800 |
| audit-insight-dashboard-desktop-scrolled.png | Dashboard below fold, 1280x800 |
| audit-insight-dashboard-desktop-full.png | Dashboard viewport dup (inner-scroll page) |
| audit-insight-dashboard-mobile.png / -mid / -bottom | Dashboard, 390x844 |
| audit-insight-progress-desktop.png / -chart / -bottom | Progress "3+ days", 1280x800 |
| audit-insight-progress-desktop-day0.png | Progress "Day 0" empty state |
| audit-insight-progress-desktop-30d.png | Progress 30-day window, desktop |
| audit-insight-progress-mobile.png / -chart / -30d / -bottom | Progress, 390x844 |
| audit-insight-dailyreview-desktop.png / -ledger / -logs | Daily review, 1280x800 |
| audit-insight-dailyreview-desktop-pinned.png | Energy-ledger bar pinned modal |
| audit-insight-dailyreview-mobile.png / -ledger / -logs | Daily review, 390x844 |

Severity: blocker > major > minor > opportunity.

---

## /app/dashboard

1. **[major] Per-meal "Meal makeup" breakdown is a hover-only popover on the donut — invisible on touch, undiscoverable on desktop.**
   The popover (Breakfast/Lunch/Dinner with kcal + macros, "Dinner — not logged yet") is `opacity-0 pointer-events-none absolute` revealed by `group-hover` on the "Today's plate" donut. No affordance hints it exists; on 390px it can never be triggered. It also contains the only "dinner not logged" signal on the card.
   *Fix:* make it a tap/click toggle on the donut (aria-expanded button), or render the meal list inline under the macro bars; at minimum reuse the "Open meal breakdown" link as its persistent home.

2. **[minor] The same "what's left today" answer is rendered twice side by side.**
   Hero "Today's decision" shows 1,400 CALORIES LEFT / 102g PROTEIN LEFT and repeats it a third time in the sentence below the tiles; the adjacent "Today's plate" donut shows 1,400 kcal remaining / 850 of 2,250 again (audit-insight-dashboard-desktop.png). Three renderings of one number on one screen.
   *Fix:* let the hero own the verdict + remaining numbers, and re-center the donut on composition (e.g. % of calories eaten / macro split), or drop the hero stat tiles and keep the sentence.

3. **[opportunity] Hero stat tiles are dead-ends.**
   "1,400 CALORIES LEFT" and "102g PROTEIN LEFT" are static generics. From → to: calories tile → /app/nutrition (or /app/log), protein tile → /app/nutrition. Every aggregate on this page should land somewhere; these are the two most prominent aggregates on the app's front page.

4. **[opportunity] "Logged today" card has no dinner row / next-meal CTA.**
   The page's whole thesis is "plan the next meal," yet the card lists only breakfast and lunch and leaves dead whitespace below (audit-insight-dashboard-desktop-scrolled.png). From → to: add a "Dinner — not logged yet → Log dinner" row → /app/log (mirrors the hidden popover's dinner row, finding 1).

5. **[minor] "Health score 39" has no scale or direction.**
   39 out of what? No /100, no trend arrow, no color semantics (it renders in the same muted pill style at any value). It drills down correctly to /app/dashboard/score (HTTP 200). Also note v1.3 deliberately de-emphasized Health Score, yet it sits inside the primary hero.
   *Fix:* "39/100" or a mini-ring; or relocate below the fold to match the de-emphasis decision.

6. **[minor] Naming drift across surfaces for the same destinations.**
   Sidebar "Daily review" = mobile tab "Review" = page H1 "Daily detail"; sidebar "Workouts" = mobile tab "Move". First-time users can't confirm they landed where they tapped.
   *Fix:* pick one noun per destination and use it in nav, tab, and H1.

7. **[minor] Progress is unreachable from the mobile tab bar.**
   Tabs are Home/Log/Coach/Move/Groceries/Review. The only mobile paths to /app/progress are the "Check trajectory" tile at the very bottom of the dashboard. For an insight-driven app, the trend surface is buried on the platform where it's most used.
   *Fix:* either accept and strengthen the dashboard tile (move "Go deeper" higher), or swap a lower-value tab (Groceries) for Progress.

8. **[good — no action] Quick actions all route sensibly (log/photo/scan/coach/review/plan); Activity tile has an honest empty state ("No wearable connected" → /app/fitness); page renders cleanly at both widths with no overflow.**

## /app/progress

9. **[major] The whole page is a hardcoded demo with a visible state switcher.**
   Header pills "Day 0 / Day 1 / 3+ days" swap between three hardcoded snapshots (`snapshots: Record<ProgressState, ...>` in `src/app/app/progress/page.tsx`, lines ~75–185); no real user data is read anywhere on the page. A real user sees an unexplained toggle that rewrites their own "progress" (audit-insight-progress-desktop.png vs -day0.png).
   *Fix:* gate the switcher behind preview/dev mode and wire the page to logged data; per AGENTS.md coach DoD, a mock-only route must not be presented as finished product.

10. **[blocker mobile / minor desktop] 30-day chart: per-bar calorie totals collide into an illegible smear.**
    Every bar keeps its total label in the 30-day window; at 390px they overprint completely ("2,144 2,087 2,12…", audit-insight-progress-mobile-30d.png); at 1280px adjacent labels still touch (audit-insight-progress-desktop-30d.png). This is clipped/overlapping text per pilot-UI blocker rules.
    *Fix:* in the 30-day window hide totals (show on tap/pin like the daily-review ledger) or label only min/max/latest.

11. **[major] Targets on Progress disagree with Dashboard and Daily review.**
    Progress: 2,140 kcal / 150g protein / 230g carbs / 70g fat. Dashboard + Daily review: 2,250 kcal / 175g protein / 240g carbs / 75g fat. Same preview user, same day. Any user cross-checking pages concludes the numbers can't be trusted.
    *Fix:* single source of truth for daily targets consumed by all three pages.

12. **[opportunity] Day bars are dead-ends.**
    Bars carry rich per-day data but aren't clickable. From → to: chart day bar → /app/daily-review (whose energy ledger already supports pinning a day's breakdown open) — or open the same pinned-detail modal inline.

13. **[opportunity] Meal-consistency tiles are dead-ends.**
    "Dinner — Not logged yet" is exactly the "what should I fix" moment. From → to: Dinner tile → /app/log; logged tiles → /app/nutrition.

14. **[major] "Weight and goal projection" contains no weight trend.**
    "Is my weight trending right?" — the page's core question — is answered only by Start/Goal/Preview-change numbers and a mock unsaved input ("This updates the preview only; it is not saved", audit-insight-progress-desktop-bottom.png). No history line, no per-week series.
    *Fix:* add a weight-over-time sparkline from logged weights and persist the entry (ties to finding 9's data wiring).

15. **[minor] "92% Consistency" is undefined.**
    Consistency of what — days logged, meals logged, calories within band? No tooltip, no drill-down. *Fix:* one-line definition under the stat or link to the meal-consistency card.

16. **[minor] Copy contradiction: header promises "no targets to fail," then "Where calories and macros lean" scores you against "your daily targets."**
    *Fix:* rename the comparison card ("Averages vs. plan") or drop the header claim.

17. **[minor] Double legend on the macro chart.**
    Interactive chips (Calories/Protein/Carbs/Fat) above the chart and a second static legend with the same four labels + "Sample day" below it (audit-insight-progress-desktop-chart.png). *Fix:* keep the chips, fold "Sample day" hatching into a small footnote (which already exists as text on the right).

18. **[minor] "Fitness & Activity" banner sits between the verdict and the page's main chart.**
    A full-width nav card interrupts the insight flow and pushes the calories chart below the fold at 1280x800 (audit-insight-progress-desktop.png). *Fix:* move it below the charts or into a "Go deeper" row like the dashboard's.

19. **[good — no action] Day-0 empty state is excellent: honest "Sample model only" badge, "One meal starts the picture," single CTA "Log first meal" (audit-insight-progress-desktop-day0.png). "One next step" card with a single action is the strongest pattern on any of the three pages.**

## /app/daily-review

20. **[major] Headline burn numbers count workouts that haven't happened.**
    "Active burn 483 kcal" and "Net calories 367" sum Morning walk 118 (Estimated) + Zone 2 ride 310 (Planned, 5:30 PM) + Mobility 55 (Planned, tonight). 365 of the 483 kcal are planned-only, yet the overview presents them as today's actuals — which then flips "room after activity" to 1,883 kcal and could justify overeating.
    *Fix:* count completed activities only in Active burn/Net; show planned burn as a separate "expected later" figure.

21. **[minor] Three different "calories left" numbers exist for the same day across the app.**
    Dashboard: 1,400 left. Daily review overview: "1,883 kcal room after activity" and "Net calories 367" in the same tile row. The tiles never say which one to act on.
    *Fix:* one canonical "room left" figure, with activity credit as an explicit modifier line.

22. **[minor] Same-page intake mismatch: overview says "Food in 850 kcal," today's intake bar and its pinned modal say 869.**
    (Macro-derived kcal vs item kcal; audit-insight-dailyreview-desktop-pinned.png.) *Fix:* derive both from the same source or round consistently.

23. **[opportunity] All four overview tiles are dead-ends.**
    From → to: Food in → /app/nutrition; Active burn → /app/fitness; Protein → /app/nutrition; Net calories → scroll-anchor to the energy ledger. These are the page's headline aggregates.

24. **[opportunity] "Daily summary" tiles are dead-ends — especially "Next best review: Dinner."**
    "Dinner" is a recommendation with no action attached; only a generic "Ask coach" link sits below. From → to: Next best review → /app/log (or /app/recipes); Logged meals → nutrition-log section; Activity entries → fitness-log section.

25. **[minor] Energy ledger duplicates the Progress chart's job with a different visual language.**
    Same question ("how did intake trend this week") appears as hatched stacked columns with totals-on-top on Progress and as pill intake/output bars with net labels here — different styling, different averages (Progress avg 2,058 vs ledger avg intake 1,730), different targets (finding 11). A page subtitled "the full health ledger for today" also offering 3/7/14/30-day windows overlaps Progress's role.
    *Fix:* scope daily review to Today (+ yesterday comparison at most) and let Progress own multi-day trends — or reuse one shared chart component so styling and numbers match.

26. **[minor] Three overlapping time controls on one chart.**
    Window chips (Today/3/7/14/30 days) + "Latest 7" paging arrows + horizontal swipe on mobile. First-time users must learn three mechanisms to answer one question.
    *Fix:* window chips + swipe only; drop the pager (or keep pager only when window > visible days).

27. **[minor] Mobile ledger opens scrolled to the oldest day; Today is off-canvas right.**
    audit-insight-dailyreview-mobile-ledger.png shows Wed/Thu/Fri; the user must swipe three times to reach Today on a page about today. *Fix:* initial scroll position at the right end (Today visible), swipe left for history.

28. **[minor] Pinned-bar modal tells the user to scroll instead of linking.**
    "Meal detail available below — scroll to the nutrition log…" with no link (audit-insight-dailyreview-desktop-pinned.png). *Fix:* make it a jump-link that closes the modal and anchors to the nutrition log; for non-today days it should go to that day's log.

29. **[minor] Edit actions lose context.**
    "Edit meal" (breakfast) and "Edit meal" (lunch), "Log another," and "Edit day" all navigate to bare /app/log with no meal or date parameter — the user re-selects everything.
    *Fix:* pass params, e.g. /app/log?meal=breakfast&date=2026-07-22.

30. **[minor] H1 "Daily detail" vs nav "Daily review" vs tab "Review" (same as finding 6, logged here because this is the page it confuses most).**

31. **[good — no action] The energy ledger bars are real buttons with descriptive aria labels and a working pin/modal drill-down — the best interaction pattern of the three pages; collapse controls per section work; mobile "SWIPE SIDEWAYS TO COMPARE DAYS" affordance label is present.**

---

## Counts

- Dashboard: 8 findings (1 major, 4 minor, 2 opportunity, 1 good)
- Progress: 11 findings (1 blocker-on-mobile, 3 major, 4 minor, 2 opportunity, 1 good)
- Daily review: 12 findings (1 major, 7 minor, 2 opportunity, 2 good)
- Cross-page systemic: targets disagree (11), same chart twice (25), naming drift (6/30), three "calories left" numbers (21).

## Top 3 opportunities

1. **Unify the numbers.** One source of truth for daily targets and "calories left" across Dashboard, Daily review, and Progress (findings 11, 21, 22). Everything else about trust follows from this.
2. **Make every aggregate a door.** Hero stat tiles, overview tiles, summary tiles, chart bars, and meal-consistency tiles are all dead-ends today (findings 3, 12, 13, 23, 24) — each has an obvious from→to listed above.
3. **Give each page one job.** Progress = multi-day trends (with real data + a real weight line, findings 9, 14); Daily review = today only (finding 25); Dashboard = verdict + next action. Removing the overlap also removes the duplicated chart and the 3-control time picker.

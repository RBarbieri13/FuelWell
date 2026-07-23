# fix-insight — implementation report

Node: `fix-insight` (design-intuition graph). Implements audit-insight.md (31 findings)
across /app/dashboard, /app/progress, /app/daily-review plus their component dirs
(`src/components/dashboard`, `src/components/progress`, `src/components/daily-detail`).
Verified on the shared dev server (localhost:3000, preview mode), Playwright chromium,
1280x800 and 390x844 (iPhone 12 emulation). No layout/ui edits, no commits.

Note: the fix-fitness node was editing the same working tree concurrently (its diff in
`detail-surfaces.tsx` = `workoutHref` deep links on activity cards; also workouts/*,
activity, recovery, onboarding files). My edits and theirs coexist cleanly; all gates
below ran against the combined tree.

## The single source of truth for targets (finding 11 — the 2,140 vs 2,250 kill)

Before: `/app/progress` was a pure client page with three hardcoded snapshots
(`snapshots: Record<ProgressState,...>`, targets 2,140/150/230/70) and a user-visible
Day 0 / Day 1 / 3+ days switcher. Dashboard and Daily review resolved targets
server-side (preview → `getSampleDay()` → `SAMPLE_TARGETS` 2,250/175/240/75;
authenticated → profile targets through `loadServerDailyGoalContext`).

After: Progress is a server page (`src/app/app/progress/page.tsx`) that resolves
targets through the **identical** path as `daily-review/page.tsx` and
`dashboard/page.tsx`:

- preview host → `getSampleDay()` (`src/lib/preview-session.ts` → `SAMPLE_TARGETS`
  in `src/lib/fuelwell-data.ts:58` — the one definition);
- authenticated → `profiles` targets → `loadServerDailyGoalContext` (same adapter
  the other two pages call, so any activity-bump adjustment is applied identically).

The client (`progress-client.tsx`) additionally applies `usePreviewOnboardingOverride`
exactly as `dashboard-client.tsx` does, so a preview onboarding run changes both pages
identically. "Logged today" data comes from the same live client store the dashboard
and daily review read: `useDayLog()` + `hydrateDayLog(serverMeals)` (the
daily-review pattern). There is no target or meal literal left in the progress page.

Measured (preview): dashboard "of 2,250 kcal target" / protein 175g; progress
"850 kcal / 2,250 kcal", "73g / 175g"; zero occurrences of "2,140" on the page.

## Per-finding before → after

### Dashboard

1. **[major] Hover-only "Meal makeup" popover — FIXED.** The donut is now a real
   `<button aria-expanded>` ("Show meal makeup breakdown"); tap toggles the popover
   (hover/focus reveal kept for desktop), with a visible "Tap the ring for meal
   makeup" caption. Measured on mobile: tap → `aria-expanded="true"`, popover with
   per-meal kcal + dinner row visible (`fix-insight-after-dashboard-mobile-popover.png`).
2. **[minor] Same answer rendered three times — FIXED (hero owns it).** CalorieRing
   compact re-centered on composition per the audit's fix: center = "850 KCAL EATEN /
   of 2,250 kcal target" (was "1,400 kcal remaining / 850 of 2,250"). Remaining now
   lives only in the hero (tile + verdict sentence). `calorie-ring.tsx` non-compact
   variants unchanged.
3. **[opportunity] Hero stat tiles dead-ends — FIXED.** Both `EnergyStat` tiles are
   links → /app/nutrition (audit's from→to) with chevron affordance and aria-labels.
4. **[opportunity] No dinner row on "Logged today" — FIXED.** When no dinner is
   logged, a dashed "Dinner — Not logged yet → Log dinner" row links to /app/log.
   Measured on a fresh session: row present.
5. **[minor] "Health score 39" scale-less — FIXED.** Chip now renders "39/100"
   (null → "--"). Relocation below the fold not taken (audit offered either/or;
   the scale is the cheaper, non-layout fix).
6. **[minor] Naming drift — FIXED (page half).** See finding 30. Shell surfaces were
   fix-shell's; the H1 was the remaining piece.
7. **[minor] Progress unreachable from mobile tab bar — DEFERRED (product call).**
   Tab roster is shell territory; fix-shell already ruled a tab swap needs usage data.
   The dashboard "Check trajectory" tile remains the mobile path.
8. good — untouched.
- **Inherited fix-shell F3/F12 — FIXED.** Dashboard-only header Search circle and "A"
  avatar removed (`dashboard-client.tsx`); Profile lives in the sidebar/user menu
  (fix-shell landed that prerequisite), search lives in Log.

### Progress

9. **[major] Hardcoded demo + visible switcher — FIXED (the big one).** The
   `snapshots` record, `ProgressState`, and the Day 0/Day 1/3+ days header switcher
   are deleted. The page renders from live data: verdict, stat tiles ("Meals today
   X of 4", "Calories today", "Protein today"), macro-lean bars, and meal-consistency
   tiles are all computed from `useDayLog()` meals vs the shared targets. The
   excellent Day-0 empty state is now the real empty state (same copy: "One meal
   starts the picture." / "Sample model only. No logged nutrition data yet." /
   single "Log first meal" CTA) shown when nothing is logged today. Live check:
   logging a dinner (610 kcal) through /app/log moved Progress 850 → 1,460, meals
   2 of 4 → 3 of 4, dinner tile → Logged; dashboard shows the same 1,460
   (`fix-insight-after-progress-desktop-dinner-logged.png`).
   The chart stays honestly sample-labeled except today's bar, which becomes the
   live logged day — the page no longer invents multi-day logged history.
10. **[blocker mobile] 30-day per-bar labels illegible — FIXED.** In the dense
    (>14-day) window per-bar totals no longer render; totals are available per bar
    via tap (finding 12's panel) and the title tooltip. 7-day window keeps its labels.
    Measured at 390px/30d: zero label spans in the chart group
    (`fix-insight-after-progress-mobile-30d.png`, `-tapped.png`).
11. **[major] Targets disagree — FIXED.** See single-source section above.
12. **[opportunity] Day bars dead-ends — FIXED.** Every bar is now a button
    (aria-pressed, aria-label with kcal + sample/logged); tap pins a detail strip
    under the axis (day, kcal, macro grams, Sample/Logged badge) and logged days get
    an "Open daily review" link (audit's from→to). Works at both widths.
13. **[opportunity] Meal-consistency tiles dead-ends — FIXED.** Logged tiles →
    /app/nutrition, unlogged → /app/log, with per-state aria-labels and copy
    ("Logged · view detail" / "Not logged yet · log it").
14. **[major] No weight trend, mock unsaved input — FIXED.** The weight card now
    uses `useBodyLog()`: "Save weight" persists a real `BodyLogEntry`
    (preview → device store, authenticated → /api/body-log), and the panel renders a
    weight-over-time sparkline (inline SVG, currentColor) from logged entries with
    Start/Latest/Change rows once ≥2 weigh-ins exist; honest empty/one-entry states
    otherwise. Measured: save → "Saved to today's log." → reload → 186.4 lb persists.
    The hardcoded Start 186.4 / Goal 178 / "projected weeks" demo block was removed —
    there is no goal-weight data source, and per the mission's honesty rules I did
    not fake one (noted as a follow-up if a goal-weight field ships).
15. **[minor] "92% Consistency" undefined — FIXED by replacement.** The undefined
    stat is gone; hero tiles are now self-defining ("Meals today 2 of 4",
    "Calories today", "Protein today").
16. **[minor] "No targets to fail" contradiction — FIXED.** Header subtitle is now
    "Trends and direction over time." (audit's drop-the-claim option).
17. **[minor] Double legend — FIXED.** Static four-label legend row removed; the
    interactive chips are the only legend. The logged-vs-sample note remains as the
    single footnote; sample bars stay hatched and the bar-detail strip labels
    "Sample" explicitly.
18. **[minor] Fitness & Activity banner mid-flow — FIXED.** Banner moved from
    between verdict and chart to the bottom of the page (below weight card). Link
    markup unchanged ("Open Fitness and Activity" — smoke test still green).
19. good — Day-0 pattern preserved as the real empty state (see 9).

### Daily review

20. **[major] Planned counted as actual — FIXED.** `calculateFitnessTotals`
    (`detail-surfaces.tsx`) now splits `source === "Planned"` into
    `plannedCalories/plannedMinutes`; Active burn and Net count completed
    (Logged/Estimated) only. Measured: Active burn 118 kcal (was 483) with footnote
    "Completed only · 365 kcal still planned"; Net 732 (was 367+planned math).
    Fitness-detail summary cards share the function and now also show completed-only
    actuals (same honesty rule; flagged to the fitness node).
21. **[minor] Three "calories left" numbers — FIXED (one canonical figure).** The
    Net-calories tile now states the canonical room — "1,400 kcal left of the food
    target" (identical to the dashboard's 1,400) — with activity credit as the
    explicit modifier: "· completed burn adds 118 kcal back". The ambiguous
    "1,883 kcal room after activity" phrasing is gone.
22. **[minor] 850 vs 869 intake mismatch — FIXED.** `buildToday` in
    `calorie-balance-chart.tsx` scales macro-derived intake segments so the bar total
    equals the item-level `sumMeals` total (last segment absorbs rounding, grams in
    segment details stay as logged). Measured: today's intake bar/pinned modal = 850,
    same as the Food-in tile.
23. **[opportunity] Overview tiles dead-ends — FIXED.** Food in → /app/nutrition,
    Active burn → /app/fitness, Protein → /app/nutrition, Net calories →
    `#energy-ledger` scroll anchor (section id + scroll-mt added). `TargetTile` /
    `SimpleSummaryCard` gained optional `href` (and `footnote`) props; measured
    anchor navigation works.
24. **[opportunity] Daily-summary tiles dead-ends — FIXED.** Logged meals →
    `#nutrition-log`, Activity entries → `#fitness-log` (ids on the collapsible
    panels), Next best review → /app/log when room remains, /app/coach when spent —
    its detail copy now says why. "Next best review" logic switched to the canonical
    room figure (was net-based).
25. **[minor] Ledger duplicates Progress's job — DEFERRED.** Scoping daily review to
    Today-only or extracting one shared chart component is a product/architecture
    call beyond a surgical fix; partially mitigated: the two charts now agree on
    today's intake total (22) and Progress owns a door back from its bars (12).
26. **[minor] Three time controls — FIXED.** The "Latest 7" pager arrows and offset
    state are removed; window chips + horizontal swipe are the two remaining
    mechanisms (audit's fix definition). `tests/daily-review-ledger.spec.ts` +
    `daily-review-mobile.spec.ts` still green (9 passed).
27. **[minor] Mobile ledger opens at oldest day — FIXED.** The scroll strip now
    initializes scrolled fully right (Today visible, swipe left for history) via a
    ref effect on range/series-visibility changes.
28. **[minor] Pinned modal says "scroll" — FIXED.** Replaced with a
    "Jump to the nutrition log" link that closes the modal and anchors to
    `#nutrition-log` (measured; `fix-insight-after-dailyreview-pinned.png`).
29. **[minor] Edit actions lose context — DEFERRED.** /app/log only reads a `mode`
    query param (`log/page.tsx:93`); adding `?meal=`/`?date=` would be inert without
    log-page support, and /app/log is nutrition-node territory. Needs: log page to
    accept meal/date params, then these links get them.
30. **[minor] H1 "Daily detail" — FIXED.** H1 is now "Daily review", matching
    sidebar "Daily review" and tab "Review"; the nutrition-detail cross-link action
    renamed "Open daily detail" → "Open daily review".
31. good — bar pin/modal pattern preserved (and improved by 28).

## Files changed (mine)

- `src/app/app/progress/page.tsx` — rewritten: server data resolution identical to
  daily-review (preview sample day / authenticated profile + goal context).
- `src/app/app/progress/progress-client.tsx` — new client surface: live verdict,
  tiles, chart overlay, meal-consistency doors, body-log weight card (9, 11-19).
- `src/components/progress/macro-stacked-bars.tsx` — dense-mode label removal,
  tappable bars + pinned day-detail strip with daily-review door (10, 12).
- `src/app/app/dashboard/dashboard-client.tsx` — header search/avatar removal
  (F3/F12 inherited), hero-tile links, tap popover, dinner CTA row, 39/100 (1-5).
- `src/components/dashboard/calorie-ring.tsx` — compact variant re-centered on
  "kcal eaten / of target" (2).
- `src/components/daily-detail/detail-surfaces.tsx` — completed/planned burn split,
  canonical room copy, tile doors + anchors, panel ids, H1 rename (20, 21, 23, 24, 30).
- `src/components/daily-detail/calorie-balance-chart.tsx` — intake-total
  reconciliation, pager removal, right-aligned initial scroll, modal jump link
  (22, 26, 27, 28).

No `src/components/layout` or `src/components/ui` edits; no shared-surface needs to
document (TargetTile/SimpleSummaryCard live in daily-detail, not ui/).

## Ruleset compliance (design-ruleset.md)

- No new hex values — reused only pre-existing ones (`#16302a`, `#54635d`,
  `#f2f7f5`, `#f7faf8`, `#b8cac4`, `#f4f8f6`). Sparkline uses
  `currentColor`/`text-primary-500`.
- No new radius or shadow literals — reused dominant existing values
  (`rounded-[24px]`, `[1rem]`, `[1.2rem]`, `[1.25rem]`, `[1.35rem]`, `[18px]`,
  `[0.7rem]`; shadows `0_12px_30px_rgba(20,90,75,0.07)`, `0_8px_22px…`,
  `0_3px_8px…`, `0_6px_14px…`, `0_24px_70px…` — all present before).
- lucide-react only; `tabular-nums`, aria-labels/pressed/expanded, `min-h-11`
  touch targets on all new interactive elements; C1 page anatomy
  (`fw-app-surface/fw-page-header/fw-page-inner`) preserved; new empty/one-entry
  weight states use quiet muted text per C5; no `dark:` variants; no new gradients.

## Test / verification output

- `pnpm lint` — clean (exit 0). `pnpm exec tsc --noEmit` — clean (exit 0;
  informational given concurrent sibling edits in the tree).
- `pnpm vitest run tests/unit` — **39 files, 333 tests, all passed**.
- `pnpm playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts` —
  **4 passed, 12 skipped** (identical skip set to baseline: agentic tests self-skip
  without paid-API keys).
- `pnpm playwright test tests/daily-review-ledger.spec.ts tests/daily-review-mobile.spec.ts`
  — **9 passed** (extra: directly covers my ledger edits).
- Live checks (scripted, chromium): **29/30 + 1 rerun pass = all behaviors verified**
  — targets equal across dashboard/progress (2,250 / 175g), no "2,140", no switcher;
  logged dinner moves Progress 850→1,460 and dashboard agrees (verified with
  hydration poll); Active burn 118 not 483, planned 365 separate, Net 732, canonical
  1,400 room; intake bar total 850; anchors (#energy-ledger, #nutrition-log) work;
  weight saves and survives reload; 30d chart zero bar labels at 390px; bar tap +
  "Open daily review" door; popover tap with aria-expanded; dinner CTA row.
- Console errors: **zero** on /app/dashboard, /app/progress, /app/daily-review at
  1280x800 and 390x844 across all runs (console.error + pageerror tracked).

## Screenshots (this directory, prefix `fix-insight-`)

Before/after pairs, both viewports: `-{before|after}-dashboard-desktop[-scrolled]`,
`-{before|after}-dashboard-mobile[-logged]`, `-{before|after}-progress-desktop`
`[-chart|-30d|-bottom]`, `-{before|after}-progress-mobile[-chart|-30d|-bottom]`,
`-{before|after}-dailyreview-desktop[-ledger]`, `-{before|after}-dailyreview-mobile[-ledger]`.
Extra after-evidence: `-after-progress-desktop-dinner-logged.png` (live data moved),
`-after-progress-mobile-30d-tapped.png` (10/12), `-after-dashboard-mobile-popover.png`
(1), `-after-dailyreview-pinned.png` (22/28).

## Deferred (with reasons)

| Item | Finding | Owner | What's needed |
|---|---|---|---|
| Progress in the mobile tab bar (or tab swap) | 7 | shell/orchestrator | Product call needing usage data (fix-shell F5 precedent); dashboard tile remains the path. |
| Health-score relocation below the fold | 5 (half) | product | v1.3 de-emphasis vs hero placement is a product call; the missing scale is fixed. |
| Daily review scoped to Today / shared chart component with Progress | 25 | coherence/orchestrator | Cross-page architecture; both charts now at least agree on today's numbers. |
| `?meal=&date=` params on Edit meal / Log another / Edit day | 29 | nutrition/log node | /app/log must parse them first (`log/page.tsx` reads only `mode`). |
| Goal-weight + projection in the weight card | 14 (tail) | product/data | No goal-weight source exists; removed the hardcoded demo rather than fake it. |
| /app/fitness H1 "Fitness detail" → "Activity detail" | fix-shell F2 | fitness node | Still open; fitness node was live in `detail-surfaces.tsx` during this run and smoke.spec references the heading. |

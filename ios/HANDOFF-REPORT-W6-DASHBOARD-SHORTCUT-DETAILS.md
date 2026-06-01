# FuelWell - W6 Navigation Detail Foundation Handoff

Date: 2026-06-01
Branch: `feature/w6-progress-activity-detail-foundation`

## Scope

This slice closes visible W6 navigation gaps across the Home dashboard and Exercise/Activity hub. The Today rows for Meals, Activity, and Progress now open real detail pages instead of behaving like disguised tab jumps, the proactive nudge has an explainable destination, and weekly activity signals now drill into their meaning and next action.

## What Changed

- Added `TodayShortcutDetailView` with dedicated detail pages for:
  - Meals Today
  - Activity Today
  - Progress Today
- Dashboard Today rows now use `NavigationLink` destinations.
- Dashboard proactive nudge now opens `ProactiveNudgeDetailView` with:
  - why the nudge appears
  - notification rules
  - coach-context expectations
- Each detail page has an explicit full-tab action:
  - Open Meals
  - Open Exercise
  - Open Progress
- The full-tab action dismisses the detail page before switching tabs, so returning Home lands on Dashboard rather than a stale pushed detail.
- Exercise/Activity weekly rows now use `NavigationLink` destinations instead of static rows.
- Added `ActivitySignalDetailView` so HealthKit/manual activity signals explain:
  - what the signal means
  - how it affects meal/progress/coach decisions
  - the next action the user should take
- Updated the critical-path UI tests to cover the new flows end to end.

## Verification

- `cd ios && xcodegen generate --spec project.yml` - passed
- `cd ios && swiftlint --strict --config .swiftlint.yml` - passed
- `cd ios && scripts/check-feature-imports.sh` - passed
- `cd ios && scripts/check-theme-drift.sh` - passed
- `cd ios && xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17'` - passed

## Notes

- This intentionally avoids the W1/W2 files touched by open PRs #87 and #88.
- This is still a W6 feature-completeness step, not a claim that all Dashboard, Activity, and Progress data is live.

# FuelWell - Phase 3 Restaurant Guidance Handoff

Date: 2026-05-25
Branch: `feature/phase-3-restaurant-guidance`

## Summary

- Promoted the Restaurant Guidance destination from a shell into a real macro-aware guidance panel.
- Added `RestaurantGuidancePlan` and `RestaurantGuidanceItem` models for ordering priorities and menu patterns.
- Generated restaurant guidance from the current macro verdict: rebalance, needs fuel, or on track.
- Added a dedicated Restaurant Guidance view with remaining macro summary, priorities, menu patterns, and a Log This Meal CTA.
- Wired Log This Meal back into the existing photo-first Add Meal flow.
- Added reducer tests for rebalance guidance and the guidance-to-log action.

## Verification

- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `tools/simulator-live/rebuild-and-launch.sh`

## Next Slice

Promote Meal History from a shell into a real recent-meal surface with grouped
history, repeat-to-draft behavior, and a bridge back to the daily log.

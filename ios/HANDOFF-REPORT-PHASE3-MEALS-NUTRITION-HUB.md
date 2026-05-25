# FuelWell - Phase 3 Meals & Nutrition Hub Handoff

Date: 2026-05-25
Branch: `feature/phase-3-meals-nutrition-hub`

## Summary

- Expanded the Meals tab from a daily log into a fuller Meals & Nutrition hub.
- Added a stronger photo-first hero with the primary Log Meal CTA.
- Added a macro progress grid for calories, protein, carbs, and fat against the current target.
- Added destination shell state and rows for Restaurant Guidance, Recipe Browser, Meal Plan Generator, Grocery List, and Meal History.
- Added an inline destination shell card so the next feature surfaces have stable entry points before their full implementations land.
- Added a recent meals preview backed by the durable repository's recent entry loading.
- Added reducer tests for opening and dismissing nutrition destination shells.

## Verification

- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `tools/simulator-live/rebuild-and-launch.sh`

## Next Slice

Promote one destination shell into a real flow. The best next step is Restaurant
Guidance because it is close to the daily macro decision loop: carry the
current macro snapshot into a focused order guidance screen and keep Log Meal
available as the recovery action.

# FuelWell - Phase 3 Nutrition Feature Handoff

Date: 2026-05-24
Branch: `feature/phase-3-nutrition-feature`

## Scope

This slice follows the master production guide's Nutrition feature path while preserving the repo's stricter import guard.

## Added

- Renamed the shared macro engine package from `Nutrition` to `NutritionDomain` so `Features/Nutrition` can own the user-facing Nutrition feature name.
- Added `Core.MealEntry`, `NutritionRepository`, and `InMemoryNutritionRepository`.
- Registered `nutritionRepository` in `swift-dependencies`.
- Added `Features/Nutrition` with `DailyLogFeature` and `DailyLogView`.
- Added Swift Testing coverage for loading entries, refreshing macro snapshots, and optimistic delete behavior.
- Increased shared tab-shell text size/weight so row descriptions and hero subtitles are clearer and less faded.

## Architecture Notes

- `Features/Nutrition` imports `Core`, `DesignSystem`, `NutritionDomain`, and TCA.
- `Features/App` still does not import `Features/Nutrition`; app-level routing can be added once the import guard is updated to explicitly allow the root app coordinator to host feature modules.
- Shared macro decision behavior lives in `NutritionDomain`; user-facing state and view logic lives in `Features/Nutrition`.

## Verification

Run from the repo root:

```bash
cd ios && xcodegen generate
cd ios && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' build
cd ios && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test
ios/scripts/check-feature-imports.sh
ios/scripts/check-theme-drift.sh
swiftlint --strict --config ios/.swiftlint.yml ios
```

Simulator screenshot after typography tuning:

- `/tmp/fuelwell-current-typography.png`

## Next Best Slice

Allow the root `App` coordinator to host feature modules intentionally, then route the Meals tab into `DailyLogView` instead of the temporary tab-shell placeholder.

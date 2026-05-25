# FuelWell - Phase 3 Recipe Browser Handoff

Date: 2026-05-25
Branch: `feature/phase-3-recipe-browser`

## Summary

- Promoted Recipe Browser from a shell into a macro-aware recipe discovery surface.
- Added `RecipeBrowserPlan` and `RecipeSuggestion` models for recipe categories and macro estimates.
- Generated recipe suggestions from the current macro snapshot: protein anchor, light meal, or steady meal.
- Added a Recipe Browser view with focus summary, recipe rows, macro summaries, and use actions.
- Wired recipe selection into the existing photo-first Add Meal flow with the recipe macros prefilled.
- Added reducer tests for protein-priority recipe planning and recipe-to-draft behavior.

## Verification

- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `tools/simulator-live/rebuild-and-launch.sh`

## Next Slice

Promote Grocery List from a shell into a practical planning surface. It should
derive grocery groups from recipe/meal-plan intent and preserve Log Meal as the
daily-loop recovery path.

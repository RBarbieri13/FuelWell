# FuelWell - Phase 3 Durable Meals Core Handoff

Date: 2026-05-25
Branch: `feature/phase-3-durable-meals-core`

## Summary

- Promoted meal logging from seeded in-memory state to a durable local repository.
- Added generic JSON and attachment file stores in the Persistence package.
- Added `LocalNutritionRepository` for local meal entry save/load/delete.
- Preserved meal photo attachments by storing a photo attachment ID on entries and writing image data to disk.
- Added recent meal loading and one-tap recent meal chips inside Add Meal.
- Added a camera badge on logged meal rows when a saved meal has a photo attachment.
- Added Core and Persistence test targets to the main FuelWell test scheme so these package-level guarantees run with the app.

## Verification

- `xcodegen generate`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `tools/simulator-live/rebuild-and-launch.sh`

## Next Slice

Build the full Meals & Nutrition hub around the durable repository: today's plate
summary, quick access rows, a fuller meal history surface, and the next set of
destination shells for Restaurant Guidance, Recipe Browser, Meal Plan Generator,
and Grocery List.

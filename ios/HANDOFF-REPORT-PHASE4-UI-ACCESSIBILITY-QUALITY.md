# FuelWell - Phase 4 UI Quality and Accessibility Handoff

Date: 2026-05-25
Branch: feature/phase-4-ui-accessibility-quality

## Intent

This PR starts Phase 4 with a deeper quality pass instead of a narrow sub-phase checkpoint. It adds an end-to-end UI testing target, locks down the most important current user paths, and improves the accessibility/automation contract for Dashboard and Add Meal.

## What Changed

- Added the `FuelWellUITests` UI-test target to `project.yml` and regenerated the Xcode project.
- Added `FuelWellCriticalPathUITests` covering:
  - cold launch to Dashboard
  - Dashboard quality surfaces
  - Menu sheet open/close
  - Help sheet open
  - Meals tab navigation
  - Add Meal end-to-end entry and save
  - Coach, Exercise, and Progress tab reachability
- Added Dashboard accessibility labels/values for the Health Score, Inflows/Outflows, and Next Action surfaces.
- Added stable accessibility labels/identifiers for Add Meal open/save actions.
- Brought `FuelWellUITests` under strict SwiftLint coverage.
- Added `docs/ios-guide/quality/accessibility-audit-phase4.md` to document the Phase 4 accessibility floor, findings addressed, and remaining gaps.

## Verification

- `git diff --check`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh && ios/scripts/check-theme-drift.sh`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:FuelWellUITests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`

## Remaining Phase 4 Work

- Reducer/unit coverage expansion for newer Phase 3 features.
- Snapshot/component-gallery coverage once the gallery is introduced.
- Dynamic Type and VoiceOver assertions for macro tiles and secondary hubs.
- Performance, privacy manifest, usage descriptions, and kill-switch drill from the master plan.

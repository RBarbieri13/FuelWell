# FuelWell - Phase 4 Feature State Coverage Handoff

Date: 2026-05-25
Branch: feature/phase-4-feature-state-coverage

## Intent

This slice expands Phase 4 beyond visual quality by locking down feature reducer behavior around launch readiness, AI kill-switch handling, and Nutrition optimistic writes. It is intentionally broader than the previous snapshot slice while staying focused on foundations.

## What Changed

- Added App reducer tests for:
  - unavailable architecture clients reporting readiness false
  - disabled Anthropic/AI feature flags counting as a safe ready state
  - launch diagnostics being captured when analytics tracking fails
- Added Nutrition reducer tests for:
  - save failure preserving the optimistic Add Meal entry while surfacing an error
  - delete failure restoring the removed meal and refreshed macro snapshot
  - Add Meal dismissal clearing photo/camera draft state
- Split Nutrition failure-state tests into a dedicated file to keep test files below the strict SwiftLint line limit.
- Regenerated the Xcode project so the new test file is included in `NutritionFeatureTests`.
- Documented the Phase 4 feature-state coverage matrix in `docs/ios-guide/quality/feature-state-coverage-phase4.md`.
- Added `CrashReporting` to the App package test target dependencies to match the existing test imports and generated Xcode target.

## Verification

- `xcodegen generate --spec project.yml`
- `swiftlint --strict --config ios/.swiftlint.yml ios/Features/App ios/Features/Nutrition`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:AppTests -only-testing:NutritionFeatureTests test`

## Notes

- The App readiness tests preserve the current behavior where launch is resilient to unavailable remote clients.
- The Anthropic feature-disabled path is explicitly treated as ready because a kill switch should turn off AI behavior without presenting the app as broken.
- The Add Meal save-failure test documents the current optimistic UX. A future offline-sync slice should connect that path to `PendingWriteQueue` instead of rolling the visible meal back.

## Remaining Phase 4 Work

- Add measured launch and scroll performance budgets.
- Complete the live/staging kill-switch drill runbook.
- Bundle or remap named brand fonts to remove UIKit font fallback warnings from render and snapshot tests.

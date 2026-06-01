# FuelWell - W7 CI Coverage Readiness Handoff

Date: 2026-06-01
Branch: `feature/w7-ci-coverage-readiness`

## Scope

This W7 slice closes the CI path-filter blind spot called out in the master execution plan and adds an explicit coverage gate for critical test bundles. It intentionally avoids app feature source files touched by open W1/W2/W6 PRs.

## What Changed

- Added `workflow_dispatch` and a daily scheduled iOS CI run.
- Removed the `push: main` path filter so `main` cannot appear green by omission after docs/tooling-only changes.
- Changed the Build and Test job to emit `ios/build/reports/FuelWellApp.xcresult`.
- Added `tools/release/check-coverage-floor.sh` to enforce a configurable coverage floor.
- Added `tools/release/check-w7-ci-readiness.sh` so CI validates its own W7 readiness contract.
- Added release-readiness tests that lock the workflow and coverage contract.

## Verification

- `tools/release/check-w7-ci-readiness.sh`
- `bash -n tools/release/check-coverage-floor.sh tools/release/check-w7-ci-readiness.sh`
- `cd ios && xcodegen generate --spec project.yml`
- `cd ios && swiftlint --strict --config .swiftlint.yml`
- `cd ios && scripts/check-feature-imports.sh`
- `cd ios && scripts/check-theme-drift.sh`
- `cd ios && xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:AppTests`
- `cd ios && xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17' -skipMacroValidation -skipPackagePluginValidation -resultBundlePath build/reports/FuelWellApp.xcresult`
- `tools/release/check-coverage-floor.sh ios/build/reports/FuelWellApp.xcresult`

## Notes

- The first coverage floor is intentionally scoped to the critical test bundles that the current Xcode coverage report exposes consistently: Core, Coach, and NutritionDomain tests.
- This is a W7 infrastructure gate. It does not claim the complete W7 accessibility/performance program is finished.

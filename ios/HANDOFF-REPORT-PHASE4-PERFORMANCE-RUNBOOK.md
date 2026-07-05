# FuelWell - Phase 4 Performance and Runbook Readiness

Date: 2026-05-26
Branch: `feature/phase-4-performance-runbook`

## Summary

This Phase 4 slice turns performance and operations from guide-level intent into repository-level checks and procedures. It adds repeatable UI performance measurements for launch/navigation, documents the Phase 4 performance budget evidence model, and replaces the placeholder runbook with concrete release, kill-switch, Sentry, database, and App Review response steps.

## What Changed

- Added UI performance coverage in `FuelWellCriticalPathUITests`.
  - Launch-to-responsive measurement uses `XCTApplicationLaunchMetric`.
  - Primary tab navigation measurement uses `XCTClockMetric`.
- Added `docs/ios-guide/quality/performance-budgets-phase4.md`.
  - Captures Chapter 16 budgets.
  - Separates simulator regression checks from required real-device Instruments evidence.
  - Defines the release-candidate performance checklist.
- Rebuilt `docs/ios-guide/runbook.md`.
  - Release procedure is now explicit.
  - Kill-switch activation and restoration use the real `ai_meal_plan` flag.
  - Drill log is ready for staging Supabase credentials.
  - Sentry, production database, App Review, and operating cadence sections are now actionable.

## Verification

- `git diff --check`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:FuelWellUITests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `tools/simulator-live/rebuild-and-launch.sh`

## Remaining Phase 4 Work

- Run and record the staging/live kill-switch drill once real Supabase credentials are attached.
- Bundle or remap named brand fonts if the final visual system requires them.
- Attach physical-device Instruments values before TestFlight is considered release-ready.

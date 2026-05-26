# FuelWell - Phase 4 Release Privacy Readiness

Date: 2026-05-26
Branch: `feature/phase-4-release-privacy-readiness`

## Summary

This Phase 4 slice hardens the App Review privacy baseline. The privacy manifest now includes the release-time analytics and crash-reporting categories implied by the live clients, and AppTests now parse the actual manifest plus generated Info.plist settings so permission copy and data declarations do not drift.

## What Changed

- Added `NSPrivacyCollectedDataTypeCrashData` to `PrivacyInfo.xcprivacy` for the Sentry-backed crash reporter when configured.
- Added `NSPrivacyCollectedDataTypeProductInteraction` to `PrivacyInfo.xcprivacy` for the PostHog-backed analytics client when configured.
- Added AppTests covering privacy collected data types, purposes, linked/tracking flags, required-reason API declarations, and generated usage strings.
- Documented why `NSPhotoLibraryUsageDescription` remains absent while the app uses `PhotosPicker` instead of broad-library access.
- Regenerated the Xcode project so the new AppTests file is part of the test target.

## Verification

- `xcodegen generate --spec project.yml`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:AppTests test`
- `rm -rf /tmp/fuelwell-phase4-release-derived && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -derivedDataPath /tmp/fuelwell-phase4-release-derived test`
- `tools/simulator-live/rebuild-and-launch.sh`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `git diff --check`
- Log sweep across app tests, full tests, and simulator launch found no build failures, test failures, fatal errors, or bundled-font runtime errors.
- `xcrun devicectl list devices` reported no physical devices visible, so real-device Instruments evidence remains blocked locally.

## Remaining Phase 4 Work

- Run and record the live staging kill-switch drill once Supabase staging credentials are available.
- Attach physical-device Instruments values before TestFlight is considered release-ready.

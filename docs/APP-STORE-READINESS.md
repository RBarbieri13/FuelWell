# FuelWell App Store Readiness

Generated: 2026-08-10T00:43:17.398Z
Status: Externally Blocked

This snapshot checks repository-owned TestFlight and App Store evidence. It does not perform Apple Developer, TestFlight, paid-account, or App Review actions.

## Summary

- Passed: 25
- Human/external blockers: 8
- Failures: 0

## Checks

| Area | Status | Check | Detail | File |
|---|---:|---|---|---|
| metadata | pass | App name ready | 8/30 characters. | ios/fastlane/metadata/en-US/name.txt |
| metadata | pass | Subtitle ready | 29/30 characters. | ios/fastlane/metadata/en-US/subtitle.txt |
| metadata | pass | Promotional text ready | 85/170 characters. | ios/fastlane/metadata/en-US/promotional_text.txt |
| metadata | pass | Description ready | 615/4000 characters. | ios/fastlane/metadata/en-US/description.txt |
| metadata | pass | Keywords ready | 68/100 characters. | ios/fastlane/metadata/en-US/keywords.txt |
| metadata | pass | Release notes ready | 117/4000 characters. | ios/fastlane/metadata/en-US/release_notes.txt |
| metadata | pass | Marketing URL ready | 20 characters. | ios/fastlane/metadata/en-US/marketing_url.txt |
| metadata | pass | Privacy URL ready | 28 characters. | ios/fastlane/metadata/en-US/privacy_url.txt |
| metadata | pass | Support URL ready | 28 characters. | ios/fastlane/metadata/en-US/support_url.txt |
| privacy | pass | Tracking disabled | Manifest declares no tracking domains. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Privacy data type: NSPrivacyCollectedDataTypeHealth | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Privacy data type: NSPrivacyCollectedDataTypePhotosorVideos | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Privacy data type: NSPrivacyCollectedDataTypeFitness | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Privacy data type: NSPrivacyCollectedDataTypeCrashData | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Privacy data type: NSPrivacyCollectedDataTypeProductInteraction | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Required API type: NSPrivacyAccessedAPICategoryFileTimestamp | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | Required API type: NSPrivacyAccessedAPICategoryUserDefaults | Declared in privacy manifest. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| signing | pass | HealthKit entitlement enabled | The app entitlements declare HealthKit access. | ios/FuelWellApp/FuelWellApp.entitlements |
| signing | pass | XcodeGen source wires HealthKit entitlements | ios/project.yml points FuelWellApp at the committed entitlements file. | ios/project.yml |
| signing | pass | Generated Xcode project wires HealthKit entitlements | FuelWellApp.xcodeproj carries the entitlements build setting. | ios/FuelWellApp.xcodeproj/project.pbxproj |
| screenshots | pass | Fastlane screenshot config present | Snapfile is committed. | ios/fastlane/Snapfile |
| screenshots | pass | Required screenshot devices configured | Snapfile covers the required App Store iPhone families. | ios/fastlane/Snapfile |
| screenshots | pass | Screenshot simulators installed | Every Snapfile device is available in the installed Xcode runtime. | ios/fastlane/Snapfile |
| screenshots | pass | Snapshot helper committed | FuelWellUITests includes Fastlane's SnapshotHelper.swift. | ios/FuelWellUITests/SnapshotHelper.swift |
| screenshots | pass | UI tests emit fastlane snapshots | Candidate UI tests call setupSnapshot(app) and snapshot(...). | ios/FuelWellUITests/FuelWellCriticalPathUITests.swift |
| screenshots | blocker | App Store screenshots missing | No screenshots are present under ios/fastlane/screenshots/en-US. | ios/fastlane/screenshots/en-US |
| human-gates | blocker | FUELWELL_APP_IDENTIFIER configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | FUELWELL_APPLE_ID configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | FUELWELL_APPLE_TEAM_ID configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | FUELWELL_APP_STORE_CONNECT_TEAM_ID configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | FUELWELL_MATCH_GIT_URL configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | FUELWELL_SCREENSHOT_ATTESTATION_KEY configured | Required for Fastlane beta/release, but should not be committed. |  |
| human-gates | blocker | App Store submission requires Robert | The release lane intentionally sets submit_for_review=false; App Review submission is a Vital Question. | ios/fastlane/Fastfile |

## Next Actions

- Run `bundle exec fastlane ios screenshots` from `ios/` after the immutable candidate, App Store Connect env vars, and a Bundler 2.6.9-compatible Ruby environment are ready.
- Configure Apple/Fastlane environment variables locally or in CI secrets before running `fastlane beta`.
- Keep App Review submission manual; Robert must approve before any public submission.

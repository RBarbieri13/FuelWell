# FuelWell App Store Readiness

Generated: 2026-08-10T17:33:50.979Z
Status: Externally Blocked

This snapshot checks repository-owned TestFlight and App Store evidence. It does not perform Apple Developer, TestFlight, paid-account, or App Review actions.

## Summary

- Passed: 62
- Human/external blockers: 3
- Failures: 0

## Checks

| Area | Status | Check | Detail | File |
|---|---:|---|---|---|
| metadata | pass | App name ready | 8/30 characters. | ios/fastlane/metadata/en-US/name.txt |
| metadata | pass | Subtitle ready | 29/30 characters. | ios/fastlane/metadata/en-US/subtitle.txt |
| metadata | pass | Promotional text ready | 85/170 characters. | ios/fastlane/metadata/en-US/promotional_text.txt |
| metadata | pass | Description ready | 627/4000 characters. | ios/fastlane/metadata/en-US/description.txt |
| metadata | pass | Keywords ready | 68/100 characters. | ios/fastlane/metadata/en-US/keywords.txt |
| metadata | pass | Release notes ready | 134/4000 characters. | ios/fastlane/metadata/en-US/release_notes.txt |
| metadata | pass | Marketing URL ready | 35 characters. | ios/fastlane/metadata/en-US/marketing_url.txt |
| metadata | pass | Privacy URL ready | 43 characters. | ios/fastlane/metadata/en-US/privacy_url.txt |
| metadata | pass | Support URL ready | 43 characters. | ios/fastlane/metadata/en-US/support_url.txt |
| submission-metadata | pass | Categories and copyright recorded | Health & Fitness / Food & Drink; 2026 FuelWell. | tools/release/data/app-store-submission.json |
| submission-metadata | pass | Age rating questionnaire reconciled | Every current answer is recorded and derives the declared 9+ global rating. | tools/release/data/app-store-submission.json |
| submission-metadata | pass | Free pricing and availability recorded | Free public distribution in all supported storefronts with manual release control. | tools/release/data/app-store-submission.json |
| submission-metadata | pass | Content rights confirmed | FuelWell will surface only content it owns, licenses, or is otherwise authorized to use in each available storefront. | tools/release/data/app-store-submission.json |
| submission-metadata | pass | App Review fields use secret-free references | Contact fields and the required non-expiring demo account use environment-variable references; review notes are populated. | tools/release/data/app-store-submission.json |
| human-gates | blocker | App Review contact values configured | Set the referenced contact values outside the repository: FUELWELL_APP_REVIEW_CONTACT_FIRST_NAME, FUELWELL_APP_REVIEW_CONTACT_LAST_NAME, FUELWELL_APP_REVIEW_CONTACT_EMAIL, FUELWELL_APP_REVIEW_CONTACT_PHONE. |  |
| human-gates | pass | App Review demo account configured | The referenced non-expiring App Review demo credentials are present in the environment. |  |
| public-listing | pass | Privacy page source | /privacy is implemented as a public App Router page. | src/app/privacy/page.tsx |
| public-listing | pass | Privacy metadata destination | Fastlane metadata points to https://fuelwell-preview.vercel.app/privacy. | ios/fastlane/metadata/en-US/privacy_url.txt |
| public-listing | pass | Support page source | /support is implemented as a public App Router page. | src/app/support/page.tsx |
| public-listing | pass | Support metadata destination | Fastlane metadata points to https://fuelwell-preview.vercel.app/support. | ios/fastlane/metadata/en-US/support_url.txt |
| public-listing | pass | Marketing metadata destination | Fastlane metadata points to https://fuelwell-preview.vercel.app. | ios/fastlane/metadata/en-US/marketing_url.txt |
| public-listing | pass | Immutable candidate public-page gate | The immutable candidate gate requires HTTP 200 from Privacy and Support. | tools/release/test-ios-candidate-ui.sh |
| privacy | pass | App Privacy inventory complete | 10 required data types are inventoried with product contexts and processors. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | Privacy manifest reconciled | Every inventory type exactly matches PrivacyInfo.xcprivacy purposes, linked-to-user, and tracking flags. | ios/FuelWellApp/Resources/PrivacyInfo.xcprivacy |
| privacy | pass | App Privacy: Name | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality, NSPrivacyCollectedDataTypePurposeProductPersonalization. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Email Address | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: User ID | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Other User Content | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality, NSPrivacyCollectedDataTypePurposeProductPersonalization. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Health | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality, NSPrivacyCollectedDataTypePurposeProductPersonalization. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Fitness | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality, NSPrivacyCollectedDataTypePurposeProductPersonalization. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Photos or Videos | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality, NSPrivacyCollectedDataTypePurposeProductPersonalization. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Precise Location | Linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Product Interaction | Not linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAnalytics. | tools/release/data/app-privacy-inventory.json |
| privacy | pass | App Privacy: Crash Data | Not linked; not used for tracking; NSPrivacyCollectedDataTypePurposeAppFunctionality. | tools/release/data/app-privacy-inventory.json |
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
| repository-gates | pass | Authenticated storage authority regression | Required verifier is committed. | tests/unit/authenticated-storage-authority.test.ts |
| repository-gates | pass | Account-switch isolation regression | Required verifier is committed. | tests/unit/account-switch-isolation.test.ts |
| repository-gates | pass | Release brand regression | Required verifier is committed. | tests/unit/release/fuelwell-brand-release.test.ts |
| repository-gates | pass | Authenticated persistence journey | Required verifier is committed. | tests/testflight-authenticated-persistence.spec.ts |
| repository-gates | pass | Live account-isolation journey | Required verifier is committed. | tools/release/verify-supabase-account-isolation.mjs |
| repository-gates | pass | Live Coach journey | Required verifier is committed. | tests/testflight-live-coach.spec.ts |
| repository-gates | pass | Phone containment journey | Required verifier is committed. | tests/mobile-component-clipping.spec.ts |
| repository-gates | pass | Immutable candidate device and live-service gate | The candidate script binds an exact Git SHA and runs live Coach and persistence journeys on compact and large iPhones. | tools/release/test-ios-candidate-ui.sh |
| repository-gates | pass | Social OAuth provider handoff gate | The candidate gate requires enabled Google, Facebook, and Apple providers and validates each provider handoff. Completed provider sessions remain a live acceptance requirement. | tools/release/test-ios-candidate-ui.sh |
| repository-gates | pass | Native OAuth and trusted navigation shell | The iOS shell separates OAuth/external navigation from trusted in-app routes. | ios/FuelWellApp/Sources/FuelWellWebView.swift |
| repository-gates | pass | Reviewed TestFlight build promotion | The App Store lane selects an explicit valid TestFlight build whose live provenance metadata matches the immutable candidate, without rebuilding or re-uploading it. | ios/fastlane/Fastfile |
| repository-gates | pass | iOS permission and OAuth callback declarations | Location, callback, exact OAuth origin, and build-version substitutions are declared. | ios/FuelWellApp/Info.plist |
| repository-gates | pass | App Store export-compliance declaration | The app declares that it only uses exempt platform encryption, avoiding a redundant processing hold. | ios/FuelWellApp/Info.plist |
| human-gates | pass | FUELWELL_APP_IDENTIFIER configured | Environment variable is present. |  |
| human-gates | pass | FUELWELL_APPLE_ID configured | Environment variable is present. |  |
| human-gates | pass | FUELWELL_APPLE_TEAM_ID configured | Environment variable is present. |  |
| human-gates | pass | FUELWELL_MATCH_GIT_URL configured | Environment variable is present. |  |
| human-gates | pass | App Store Connect provider selection | The team ID is optional; Fastlane will use the App Store Connect API key's default provider. |  |
| human-gates | pass | FUELWELL_SCREENSHOT_ATTESTATION_KEY configured | The private screenshot provenance key is present. |  |
| human-gates | blocker | App Store submission requires Robert | The release lane intentionally sets submit_for_review=false; App Review submission is a Vital Question. | ios/fastlane/Fastfile |

## Next Actions

- Run `bundle exec fastlane ios screenshots` from `ios/` after the immutable candidate, App Store Connect env vars, and a Bundler 2.6.9-compatible Ruby environment are ready.
- Configure Apple/Fastlane environment variables locally or in CI secrets before running `fastlane beta`.
- Keep App Review submission manual; Robert must approve before any public submission.

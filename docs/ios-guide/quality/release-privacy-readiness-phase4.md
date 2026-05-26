# Phase 4 Release Privacy Readiness

Scope: App Review privacy manifest and generated permission copy

## Current App Surface

FuelWell currently handles:

- Health and fitness data through HealthKit read access.
- Meal photos through camera capture and PhotosPicker selection.
- Product interaction analytics through the PostHog-backed `AnalyticsClient` when configured.
- Crash diagnostics through the Sentry-backed `CrashReporter` when configured.

The app does not use broad photo library permissions in this phase. Photo selection uses `PhotosPicker`, so `NSPhotoLibraryUsageDescription` is intentionally absent unless a future flow requests full-library access.

## Manifest Guardrail

`AppTests.privacyManifestMatchesCurrentReleaseSurface` parses `FuelWellApp/Resources/PrivacyInfo.xcprivacy` and locks the declared data categories to the current release surface:

- Health
- Fitness
- Photos or videos
- Crash data
- Product interaction

The same test verifies linked/tracking flags and purposes:

- Health, fitness, and photos are linked to the user and used for app functionality.
- Crash data is unlinked and used for app functionality.
- Product interaction is unlinked and used for analytics.
- Tracking is disabled and no tracking domains are declared.

`AppTests.privacyManifestDeclaresRequiredReasonAPIs` keeps the required-reason API declarations stable:

- File timestamp: `C617.1`
- User defaults: `CA92.1`

`AppTests.generatedInfoPlistUsageStringsStayAppReviewReady` locks the generated usage strings for camera and HealthKit permissions.

## Still Required Before TestFlight

- Run the staging kill-switch drill once Supabase credentials are attached.
- Attach real-device Instruments values once a physical iPhone is connected.
- Revisit this manifest if full photo library access, account email collection, paid subscriptions, or external tracking domains are added.

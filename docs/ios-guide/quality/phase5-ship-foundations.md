# Phase 5 Ship Foundations

Scope: CI, Fastlane, App Store metadata, analytics taxonomy, and pilot feedback

## Release Train Policy

Phase 5 work should land in large release-train PRs. Small PRs are reserved only for urgent fixes, merge conflicts, or work blocked by external credentials/devices.

## CI

The active GitHub Actions workflow lives at:

```text
.github/workflows/ios-ci.yml
```

It runs:

- SwiftLint strict
- feature import guard
- theme drift guard
- release and Supabase script syntax checks
- full `FuelWellApp` test suite
- snapshot tests with recording disabled
- Fastlane lane parsing

The older `ios/.github/workflows/ios-ci.yml` has been removed because GitHub only reads workflows from the repository root.

## Fastlane

Fastlane is scaffolded under `ios/fastlane`:

- `test`: local quality gates plus `scan`
- `beta`: code signing, build, and TestFlight upload
- `release`: TestFlight/App Store metadata upload with manual release and phased rollout

Required CI or local secrets:

- `FUELWELL_APP_IDENTIFIER`
- `FUELWELL_APPLE_ID`
- `FUELWELL_APPLE_TEAM_ID`
- `FUELWELL_APP_STORE_CONNECT_TEAM_ID`
- `FUELWELL_MATCH_GIT_URL`
- `MATCH_PASSWORD`
- `APP_STORE_CONNECT_API_KEY` or equivalent Fastlane auth
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` when Sentry release tagging is enabled

## App Store Metadata

English metadata is scaffolded in:

```text
ios/fastlane/metadata/en-US/
```

Screenshots remain intentionally absent until they can be generated from the current shipped simulator/TestFlight UI.

## Feedback Channel

The Help sheet now links to `Send Feedback`. The screen submits a `FeedbackReport` through `SupabaseDatabaseClient.submitFeedback`, tracks start/success/failure analytics events, and keeps anonymous pilot feedback possible until the auth flow is fully live.

The Phase 2 Supabase migration now includes a `feedback` table with RLS for anonymous insert and owner-readable history.

## Remaining External Blockers

- Staging still needs the Phase 2 Supabase migration applied before feature flags and feedback can be proven live.
- The local env file still needs a service-role key before the kill-switch disable/restore drill can run.
- A physical iPhone is still required for Instruments evidence.

# FuelWell - Phase 5 Ship Foundations Handoff

Date: 2026-05-26
Branch: `feature/phase-5-ship-foundations`

## Summary

This is the first larger release-train PR after the Phase 4 micro-slices. It bundles CI, Fastlane, App Store metadata, analytics taxonomy, Supabase feedback storage, and the in-app feedback path into one Phase 5 shipping-foundation slice.

## What Changed

- Moved iOS CI to the active repository workflow path: `.github/workflows/ios-ci.yml`.
  - Removed the inactive `ios/.github/workflows/ios-ci.yml`.
  - CI now runs quality gates, full tests, snapshot tests, script syntax checks, and Fastlane lane parsing.
- Added Fastlane scaffolding under `ios/fastlane`.
  - `test`, `beta`, and `release` lanes are defined.
  - `match` configuration and English metadata are scaffolded.
  - TestFlight/App Store lanes intentionally fail until release credentials and Phase 4 external evidence are ready.
- Added in-app pilot feedback from Help.
  - `Help` now opens `Send Feedback`.
  - Feedback submits through `SupabaseDatabaseClient.submitFeedback`.
  - UI tests cover the Help-to-feedback submission path.
- Added Supabase `feedback` schema and RLS policy coverage.
- Added analytics taxonomy guardrails for launch, tab selection, and feedback events.
- Added `docs/ios-guide/quality/phase5-ship-foundations.md`.

## Verification

- `xcodegen generate --spec project.yml`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `git diff --check`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `ruby -c ios/fastlane/Fastfile`
- `ruby -c ios/fastlane/Appfile`
- `ruby -c ios/fastlane/Matchfile`
- `BUNDLE_PATH=vendor/bundle bundle install`
- `FASTLANE_SKIP_UPDATE_CHECK=1 BUNDLE_PATH=vendor/bundle bundle exec fastlane lanes`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:AppTests -only-testing:AnalyticsTests -only-testing:SupabaseClientTests test`
- `rm -rf /tmp/fuelwell-phase5-ship-derived && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -derivedDataPath /tmp/fuelwell-phase5-ship-derived test`
- `tools/simulator-live/rebuild-and-launch.sh`
- `tools/release/check-phase4-readiness.sh` returns the expected external-blocker status.
- Log sweep found no build failures, test failures, fatal errors, or bundled-font runtime errors.

## Remaining External Blockers

- Apply `ios/supabase/migrations/202605240001_phase2_architecture.sql` to staging.
- Add `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` to `~/.fuelwell/supabase-staging.env` locally.
- Connect a physical iPhone and attach Instruments values.
- Add App Store Connect/Fastlane signing credentials before `fastlane beta` can upload a real TestFlight build.

# FuelWell Phase 7 Live Auth Session Handoff

Date: 2026-05-26
Branch: feature/phase-7-live-auth-session

## Scope

This PR connects the live iOS Supabase database client to the authenticated user session path that Phase 7 account linkage depends on.

## What Changed

- Added optional `accessToken` support to `SupabaseConfiguration`, sourced from `FUELWELL_SUPABASE_ACCESS_TOKEN`.
- Implemented live `currentUser()` by calling Supabase `auth/v1/user` when a signed-in bearer token is present.
- Updated owner-scoped REST calls to use the user bearer token instead of always using the anon key.
- Added `display_name` coding support for profile rows so live Supabase profile reads/writes match the schema.
- Added SupabaseClient tests for authenticated user resolution, no-token behavior, and bearer-token REST requests.
- Expanded the Phase 7 commerce release checker and docs so the auth-session dependency is guarded with the commerce/linkage contract.

## Guardrails

- Without an access token, `currentUser()` returns `nil` and does not make a network call.
- The anon key is still used for unauthenticated reads such as feature flags.
- Account linkage still requires the server-side authenticated RPC and does not expose service-role authority to iOS.

## Verification

- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -skipMacroValidation -skipPackagePluginValidation -only-testing:SupabaseClientTests -only-testing:SubscriptionClientTests`
- `tools/release/check-phase7-commerce-linkage.sh`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `git diff --check`

## Known Follow-Ups

- Replace environment-token injection with the real persisted Supabase session once the full sign-in UI lands.
- Add Apple Sign-In and email/password session persistence before public App Store submission.
- Run a staging account-link smoke test once the Phase 7 migrations are applied and the access token comes from a real signed-in user.

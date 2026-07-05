# FuelWell Phase 7 Live Commerce RPC Client Handoff

Date: 2026-05-26
Branch: feature/phase-7-live-commerce-rpc

## Scope

This PR turns the Phase 7 subscription client from local-only commerce models into a live Supabase-backed client for entitlement reads, Founders 100 reservations, marketing-account linkage, and validation-event history.

## What Changed

- Added `SubscriptionConfiguration` so the app can read Supabase URL, anon key, and signed-in access token from environment-backed configuration.
- Added a live `SupabaseSubscriptionTransport` for `subscription_entitlements`, `reserve_founding100(...)`, `link_marketing_signup_to_user(...)`, and `subscription_validation_events`.
- Kept RevenueCat and Stripe receipt validation server-owned by leaving provider validation unconfigured in the live iOS client until a backend validation endpoint exists.
- Split the in-memory subscription store into its own source file so previews/tests keep the same local behavior without bloating the public client file.
- Added URL-protocol-backed tests that verify the live client sends authenticated Supabase requests and decodes entitlement, reservation, account-link, and validation-event payloads.
- Expanded the Phase 7 commerce release checker so live client transport contracts are guarded in CI.

## Guardrails

- Mutating RPC calls require an authenticated access token.
- Missing Supabase configuration still falls back to the unconfigured client.
- Server-only receipt validation remains out of the app so active paid entitlements stay controlled by backend validation.

## Verification

- `tools/release/check-phase7-commerce-linkage.sh`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -skipMacroValidation -skipPackagePluginValidation -only-testing:SubscriptionClientTests`

## Known Follow-Ups

- Wire the signed-in Supabase session token into `SubscriptionConfiguration.accessToken` from the app auth layer.
- Add the server-owned RevenueCat/Stripe validation endpoint before enabling public paid-tier enforcement.
- Run a staging smoke test after the Phase 7 migrations are applied and visible through PostgREST.

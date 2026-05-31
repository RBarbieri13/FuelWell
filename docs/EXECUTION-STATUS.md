# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W4 - Auth, Onboarding, and Profile Foundation**

Current branch: `feature/w4-auth-onboarding-profile-foundation`

## Baseline Re-Verification

Baseline was re-run before implementation on 2026-05-31.

- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Release/operate shell syntax and JSON checks - passed from repo root
- Full iOS suite on this Mac's available CI simulator (`iPhone 17`) - passed
- DesignSystem snapshot suite on `iPhone 17` - passed

Note: the handoff's `iPhone 15 Pro` simulator is not installed on this Mac. The repo CI workflow uses `iPhone 17`, which is installed and was used for local verification.

## PR Queue Resolved

- PR #74, build-status dashboard - merged into `main`.
- PR #75, design workflow skills - already merged into `main`.
- PR #76, execution plan and handoff - merged into `main`.

## In Progress

W4 auth/onboarding/profile slice:

- PR #77, W1 coach proxy foundation, merged into `main`.
- PR #78, W2 schema/apply foundation, merged into `main`.
- PR #79, W3 live dependency toggle, merged into `main`.
- Added `SupabaseAuthClient` with preview, in-memory, and live Supabase auth transports.
- Added profile onboarding fields for body baseline, dietary constraints, lifestyle, and completion state.
- Added Supabase migration `202605310002_w4_auth_profile_onboarding.sql`.
- Added a dedicated `Onboarding` feature package with account creation/sign-in, goal, body baseline, dietary, lifestyle, HealthKit, notifications, and plan reveal steps.
- App launch now restores an auth session, routes unauthenticated users to onboarding, and enters the main tabs after onboarding completion.
- Live dependency wiring now includes Supabase auth while default simulator/CI behavior remains preview-safe.
- Expanded the account surface into a profile-backed "Your plan" view with identity, onboarding profile fields, subscription state, Founders 100 linking, sign out, and delete-account controls.
- Account sign out and delete now route through `AppFeature`, clear the app user, reset onboarding state, and return to onboarding.

## Verification For Current Slice

- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Supabase migration script syntax checks - passed
- Focused iOS tests: `SupabaseClientTests`, `OnboardingTests`, and `AppTests` on `iPhone 17` - passed
- Full iOS suite: `FuelWellApp` on `iPhone 17` - passed
- Focused account routing tests in `AppTests` - passed
- `npm run test:website` - passed
- `npm run lint` - passed with 4 existing warnings only
- `npm run build` - passed
- `bun install --frozen-lockfile` - passed
- `bun run build` - passed

## Vital Blockers

These are required before the live backend acceptance gates can pass end-to-end:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- W2/W4 migration application to the selected app Supabase project.
- Confirmation before any production migration touching live `founders_100` rows.
- Direct Postgres URL for the chosen staging/app Supabase project before `tools/supabase/apply-migrations.sh apply` can run.

## Next

PR #80 is open for W4. Continue into live auth acceptance and migration application once the staging database target is confirmed.

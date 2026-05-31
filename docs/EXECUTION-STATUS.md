# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W3 - Live Dependency Wiring**

Current branch: `feature/w3-live-dependency-toggle`

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

W3 live dependency toggle slice:

- PR #77, W1 coach proxy foundation, merged into `main`.
- PR #78, W2 schema/apply foundation, merged into `main`.
- Added the opt-in `FUELWELL_USE_LIVE_BACKEND` launch plan.
- Default app launch continues to use preview/noop clients for CI, snapshots, and simulator safety.
- Live launch selects `anthropicClient`, `featureFlags`, `supabaseDatabase`, and `subscriptionClient` live dependencies.
- HealthKit selects live only on real devices and falls back to preview in simulator.

## Verification For Current Slice

- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Focused iOS tests: `AppTests` on `iPhone 17` - passed
- Full iOS suite: `FuelWellApp` on `iPhone 17` - passed
- `npm run test:website` - passed
- `npm run lint` - passed with existing warnings only
- `npm run build` - passed
- `bun install --frozen-lockfile` - passed
- `bun run build` - passed

## Vital Blockers

These are required before the live backend acceptance gates can pass end-to-end:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- W2 migration/application of `feature_flags` and `coach_usage` to the selected app Supabase project.
- Confirmation before any production migration touching live `founders_100` rows.
- Direct Postgres URL for the chosen staging/app Supabase project before `tools/supabase/apply-migrations.sh apply` can run.

## Next

Finish W3 verification, open the PR, then continue into auth/onboarding/profile while live secrets and migration approval remain outstanding.

# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W2 - Data Layer, Migrations & Persistence-of-Record**

Current branch: `feature/w2-schema-apply-foundation`

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

W2 schema/apply foundation slice:

- PR #77, W1 coach proxy foundation, merged into `main`.
- Added migration tracking with `schema_migrations`.
- Added the W1-required `coach_usage` schema.
- Added guarded migration apply tooling.
- Added Supabase config scaffold.
- Recorded W2 data-layer execution defaults in `docs/ios-guide/decisions.md`.
- Added the migration apply runbook.

## Verification For Current Slice

- `bash -n tools/supabase/apply-migrations.sh tools/supabase/kill-switch-drill.sh` - passed
- `tools/supabase/apply-migrations.sh plan` - passed without secrets and lists the planned migration order
- Production apply guard check - passed; script refuses `FUELWELL_SUPABASE_TARGET=production` without `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1`
- `npm run test:website` - passed
- `npm run lint` - passed with existing warnings only
- `npm run build` - passed
- `bun install --frozen-lockfile` - passed
- `bun run build` - passed
- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Release/operate shell syntax and feedback triage JS syntax - passed
- Focused iOS tests: `SupabaseClientTests`, `SubscriptionClientTests` - passed

## Vital Blockers

These are required before W1 can pass its live acceptance gate:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- W2 migration/application of `feature_flags` and `coach_usage`.
- Confirmation before any production migration touching live `founders_100` rows.
- Direct Postgres URL for the chosen staging/app Supabase project before `tools/supabase/apply-migrations.sh apply` can run.

## Next

Finish W2 schema/apply verification, open the PR, then continue into live dependency wiring and auth/onboarding preparation while live secrets and migration approval remain outstanding.

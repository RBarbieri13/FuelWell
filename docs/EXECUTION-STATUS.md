# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W6 - Feature Completeness: Dashboard, Progress, Activity, Plans, Menu**

Current branch: `feature/w6-menu-help-hierarchy`

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

W6 feature completeness foundation:

- PR #77, W1 coach proxy foundation, merged into `main`.
- PR #78, W2 schema/apply foundation, merged into `main`.
- PR #79, W3 live dependency toggle, merged into `main`.
- PR #80, W4 auth/onboarding/profile foundation, merged into `main`.
- PR #81, W5 coach brain foundation, merged into `main`.
- PR #83, W6 feature navigation foundation, merged into `main`.
- Dashboard Today rows now route to the real Meals, Exercise, and Progress tabs.
- Dashboard Health Score and Inflows/Outflows summary cards now open real detail pages.
- Nutrition search, restaurant, and recipe rows now open detail/portion cards before quick-use actions.
- Activity is now a dedicated reducer-backed feature package using HealthKit snapshot dependency state for steps, active energy, and workouts.
- Progress is now a dedicated reducer-backed feature package using the Health Score v1 model and owned topic lists for health score detail and tracking destinations.
- Menu tools/settings and Help featured articles now open real detail subpages instead of static list rows.

## Verification For Current Slice

- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Focused Swift package tests: `ActivityTests` and `ProgressTests` - passed
- Focused UI test: `testMenuAndHelpRowsOpenDetailPages` on `iPhone 17` - passed
- Focused iOS tests: `AppTests` on `iPhone 17` - passed
- Full iOS suite: `FuelWellApp` on `iPhone 17` - passed

## Vital Blockers

These are required before the live backend acceptance gates can pass end-to-end:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- W2/W4 migration application to the selected app Supabase project.
- Confirmation before any production migration touching live `founders_100` rows.
- Direct Postgres URL for the chosen staging/app Supabase project before `tools/supabase/apply-migrations.sh apply` can run.

## Next

PR #81 (`feature/w5-coach-brain-foundation`) is merged into `main`.

Continue W6 by closing the remaining Learn-home deferral decision, physical-device HealthKit acceptance, and any final profile/settings depth required before W6 close.

PR #83 now expands W6 beyond tab shortcuts: Dashboard Health Score and Inflows/Outflows summary cards open real detail pages, Nutrition now has recipe, restaurant, and food/portion detail cards before quick-use actions, W6 has a concrete Health Score v1 / HealthKit energy-out model recorded in `decisions.md`, and Activity/Progress are reducer-backed feature packages rather than static App-only views.

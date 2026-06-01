# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W7 - Release Readiness, Quality Gates, and Live Evidence**

Current branch: `feature/w7-release-readiness-hardening`

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
- PR #84, W6 menu/help hierarchy, merged into `main`.
- PR #85, W6 closeout readiness, merged into `main`.
- Dashboard Today rows now route to the real Meals, Exercise, and Progress tabs.
- Dashboard Health Score and Inflows/Outflows summary cards now open real detail pages.
- Nutrition search, restaurant, and recipe rows now open detail/portion cards before quick-use actions.
- Activity is now a dedicated reducer-backed feature package using HealthKit snapshot dependency state for steps, active energy, and workouts.
- Progress is now a dedicated reducer-backed feature package using the Health Score v1 model and owned topic lists for health score detail and tracking destinations.
- Menu tools/settings and Help featured articles now open real detail subpages instead of static list rows.
- Permissions now exposes a HealthKit Acceptance subpage so the physical-device gate is visible in-app before TestFlight.
- The W6 parity matrix now aligns with D10: standalone Learn Home is removed from Pilot, while Help carries article content and article detail pages.

W7 release-readiness hardening:

- Phase 4 quick readiness now detects the direct staging Postgres URL as a first-class blocker before migration apply.
- Phase 4 full readiness now uses the repo/CI simulator destination (`iPhone 17` by default) instead of the unavailable handoff `iPhone 15`.
- Phase 4 full readiness runs through explicit `xcodegen`, SwiftLint, `AppTests`, full `FuelWellApp`, and simulator-live launch commands.
- `tools/release/check-w7-readiness.sh` now aggregates Phase 4, Phase 7, operate, and coach-proxy website checks with separate PASS/BLOCKED/FAIL outcomes.

## Verification For Current Slice

- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Focused Swift package tests: `ActivityTests` and `ProgressTests` - passed
- Focused UI test: `testMenuAndHelpRowsOpenDetailPages` on `iPhone 17` - passed
- Focused iOS tests: `AppTests` on `iPhone 17` - passed
- Full iOS suite: `FuelWellApp` on `iPhone 17` - passed
- Phase 4 quick readiness: 6 passed, 4 blockers, 0 failures. Blockers are service-role key, direct Postgres URL, missing staging `feature_flags`, and physical-device evidence.
- Phase 4 full readiness: 11 passed, 4 blockers, 0 failures. Full mode now regenerates Xcode, runs SwiftLint, `AppTests`, full `FuelWellApp`, and simulator-live launch on `iPhone 17`.
- W7 aggregate readiness: 4 passed, 1 blocked, 0 failed. The only blocked aggregate node is Phase 4 live evidence.

## Vital Blockers

These are required before the live backend acceptance gates can pass end-to-end:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- Direct Postgres URL for the chosen staging/app Supabase project before `tools/supabase/apply-migrations.sh apply` can run.
- W2/W4 migration application to the selected app Supabase project.
- Confirmation before any production migration touching live `founders_100` rows.
- Physical iOS device for Instruments and live HealthKit acceptance evidence.

## Next

Continue W7 by keeping release gates runnable and non-destructive while Robert supplies the live staging inputs:

1. Add `FUELWELL_SUPABASE_DB_URL` and `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` to `~/.fuelwell/supabase-staging.env`.
2. Run `tools/supabase/apply-migrations.sh plan` and inspect pending migrations.
3. Apply migrations only to the confirmed staging target.
4. Rerun `tools/supabase/kill-switch-drill.sh read`, then `drill`.
5. Attach physical-device Instruments and HealthKit acceptance evidence before TestFlight.

# FuelWell Execution Status

Updated: 2026-05-31

## Current Workstream

**W1 - Backend Activation: Anthropic Proxy + Cost Controls**

Current branch: `feature/w1-coach-proxy-foundation`

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

W1 foundation slice:

- Added `/api/coach` route scaffold on the existing Next/Fly website.
- Added coach proxy request validation, secret validation, usage-cap helpers, and usage-record shape.
- Added Anthropic SDK dependency and `bun.lock` update for Fly's frozen Bun install.
- Added website contract tests for coach proxy helpers.
- Added `coach_chat` to preview feature flags.
- Updated the iOS Anthropic readiness probe to use `coach_chat`.
- Updated disabled-coach readiness behavior so a disabled AI feature is not reported as ready.
- Added optional runtime proxy-secret header support to the live iOS Anthropic client.
- Restored root website lint/build scope after the dashboard merge by excluding repo-local agent skills and nested tools from the main website TypeScript/ESLint pass.

## Verification For Current Slice

- `npm run test:website` - passed
- `npm run lint` - passed with existing warnings only
- `npm run build` - passed
- `bun install --frozen-lockfile` - passed
- `bun run build` - passed
- `xcodegen generate --spec project.yml` - passed
- `swiftlint --strict --config .swiftlint.yml` - passed
- `scripts/check-feature-imports.sh` - passed
- `scripts/check-theme-drift.sh` - passed
- Focused iOS tests: `AnthropicClientTests`, `AppTests`, `SupabaseClientTests` - passed
- Full iOS suite on `iPhone 17` - passed on clean rerun
- DesignSystem snapshot suite on `iPhone 17` with snapshot recording disabled - passed

Note: an earlier full iOS run hit simulator runner interruptions (`signal kill`/`signal term`) on two UI tests. Both interrupted tests passed when rerun directly, and the full suite passed on the subsequent clean rerun.

## Vital Blockers

These are required before W1 can pass its live acceptance gate:

- Anthropic API key for server-side use.
- `FUELWELL_COACH_PROXY_SECRET` value for the proxy.
- Supabase service-role key for the chosen project.
- W2 migration/application of `feature_flags` and `coach_usage`.
- Confirmation before any production migration touching live `founders_100` rows.

## Next

Open the W1 foundation PR, wait for GitHub checks/CodeRabbit, then proceed to the next safe W2/W3 preparation slice while live secrets and migration approval remain outstanding.

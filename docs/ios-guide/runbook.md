# FuelWell — Runbook

Operational reference for incidents, releases, and routine maintenance. This is the short, action-oriented companion to Chapter 20. Keep it current as TestFlight and production details become real.

## Contents

- Release procedure
- Performance evidence
- Kill-switch activation
- Production database access
- Sentry alert response
- App Review rejection response
- Operating cadence

Phase 6 detailed operating files live in `docs/ios-guide/operate/`.

See Chapter 20 (`docs/ios-guide/chapters/chapter-20-post-launch-operations.md`) for the full operations playbook.

## Release Procedure

Use this checklist for every TestFlight or App Store candidate:

1. Confirm `main` is up to date and all release PRs are merged.
2. Run the iOS test suite, SwiftLint, feature import guard, and theme drift guard.
3. Run the focused UI smoke and performance suite.
4. Launch the simulator build and manually check Dashboard, Meals, Coach, Exercise, Progress, Menu, and Help.
5. Run the real-device performance checklist from `docs/ios-guide/quality/performance-budgets-phase4.md`.
6. Confirm privacy strings, App Store metadata, screenshots, and support links still match the current app surface.
7. Tag the release only after the build, runbook notes, and release notes agree.

One-command gate:

```bash
tools/release/check-phase4-readiness.sh --full
```

The gate exits `3` when the local code path is healthy but external release evidence is still blocked, such as missing staging kill-switch access or no physical iPhone for Instruments.

## Performance Evidence

Automated Phase 4 checks:

- `FuelWellCriticalPathUITests.testLaunchPerformanceBudget` asserts launch-to-responsive timing stays within the CI smoke budget.
- `FuelWellCriticalPathUITests.testPrimaryTabNavigationPerformanceBudget` asserts primary tab switching stays within the CI smoke budget.
- Existing UI smoke tests cover Dashboard, Menu, Help, Add Meal, and tab reachability.

Real-device values are required before a TestFlight release is called production-ready:

| Release | Device | Cold launch P95 | Warm launch P95 | Scroll result | Idle memory | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Pending | Pending | Add physical-device Instruments results before TestFlight. |

HealthKit live-data acceptance is tracked separately in `docs/ios-guide/quality/healthkit-physical-device-acceptance.md`.
The in-app path is `Menu` -> `Permissions` -> `HealthKit acceptance`.

## Staging Migration Inputs

The Phase 4 gate is non-destructive by default. It reads `~/.fuelwell/supabase-staging.env` and blocks live readiness until the staging database can be inspected safely.

Required local-only values:

- `FUELWELL_SUPABASE_URL`
- `FUELWELL_SUPABASE_ANON_KEY`
- `FUELWELL_SUPABASE_SERVICE_ROLE_KEY`
- `FUELWELL_SUPABASE_DB_URL`
- `FUELWELL_SUPABASE_TARGET=staging`

Use `tools/supabase/apply-migrations.sh plan` before any apply. The apply command refuses production unless `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1` is set, and production `founders_100` changes still require Robert confirmation.

## Kill-switch Activation

Canonical feature flag: `ai_meal_plan`.

Use the kill switch when an AI-powered path is unsafe, too expensive, returning bad content, or causing user-visible failures that cannot wait for an app update.

### Disable the AI meal-plan feature

1. Open the Supabase SQL Editor for the active environment.
2. Run:

```sql
UPDATE feature_flags
SET enabled = false
WHERE name = 'ai_meal_plan';
```

3. Wait up to 30 seconds for the app/client cache to expire.
4. Reopen the AI meal-plan path and confirm users see the friendly unavailable state instead of generated content.
5. Confirm telemetry shows feature-disabled handling rather than app launch failure.
6. Note the start time, disable time, observed disabled time, and any anomalies in this runbook.

### Re-enable the AI meal-plan feature

1. Confirm the underlying issue is fixed or mitigated.
2. Run:

```sql
UPDATE feature_flags
SET enabled = true
WHERE name = 'ai_meal_plan';
```

3. Wait up to 30 seconds.
4. Confirm the feature works again.
5. Add the restoration time and verification notes below.

### Drill Log

| Date | Environment | T=0 to kill | Kill to disabled | Disabled to restored | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-26 | Staging | Blocked | Blocked | Blocked | Blocked | Staging endpoint reachable via `~/.fuelwell/supabase-staging.env`, but REST returned `PGRST205` because `public.feature_flags` is not present in the schema cache. Apply `ios/supabase/migrations/202605240001_phase2_architecture.sql`, add a local service-role key, then rerun `tools/supabase/kill-switch-drill.sh drill`. |

Current readiness note: package and app-unit coverage verify the local kill-switch contract: `ai_meal_plan` reads from Supabase REST with the expected auth headers, client-side caching honors the configured TTL, disabled AI features stop before calling the proxy, and launch readiness treats disabled AI as an intentional safe-off state. The staging read path was attempted on 2026-05-26 and is blocked until the existing Phase 2 schema migration is applied to staging.

## Coach Proxy Controls

The Coach proxy is the only server path allowed to call Anthropic for in-app coaching. Keep the server-side controls tighter than the app UI.

Required server-only environment values:

- `ANTHROPIC_API_KEY`
- `FUELWELL_COACH_PROXY_SECRET`
- `FUELWELL_COACH_ALLOWED_MODELS`
- `FUELWELL_COACH_USER_DAILY_TOKENS`
- `FUELWELL_COACH_GLOBAL_DAILY_USD`
- `FUELWELL_COACH_USER_MONTHLY_SOFT_USD`
- `FUELWELL_COACH_USER_MONTHLY_KILL_USD`
- `FUELWELL_COACH_REQUESTS_PER_MINUTE`

Default model allow-list when `FUELWELL_COACH_ALLOWED_MODELS` is unset:

```text
claude-3-5-sonnet-latest,claude-3-5-haiku-latest
```

Requests must include a stable Supabase/auth UUID in `x-fuelwell-user-id`. Preview strings, email addresses, and temporary local identifiers are rejected before the proxy reads usage state or calls Anthropic. This keeps cost accounting and incident triage tied to one durable user key.

Rotate `FUELWELL_COACH_PROXY_SECRET` if a client build, log, or external tool leaks the value. After rotating, verify:

1. Old secret returns `401`.
2. New secret reaches the feature-flag read path.
3. An unapproved model returns `400` without an Anthropic request.
4. A valid UUID user id reaches usage-cap evaluation.

## Production Database Access

Access is restricted to the Supabase project owner and approved maintainers. Before running any production SQL:

1. Confirm the environment label is production.
2. Copy the exact SQL into the incident notes.
3. Prefer read-only queries unless the action is part of an approved incident response.
4. For kill-switch writes, use only the `feature_flags` row update shown above.
5. Record the timestamp, operator, query purpose, and verification result in this runbook.

## Sentry Alert Response

When a critical alert fires:

1. Open the Sentry issue and identify affected release, user count, stack trace, and breadcrumbs.
2. Decide within five minutes: kill-switch, pause rollout, or hotfix.
3. If the issue touches AI meal planning, disable `ai_meal_plan` first and then continue diagnosis.
4. If the issue is a launch crash or broad navigation failure, pause the App Store phased rollout.
5. If the fix is low-risk, prepare a hotfix PR and release candidate.
6. Add an incident note with impact, action taken, owner, and follow-up.

## App Review Rejection Response

1. Capture the rejection reason, screenshot, and guideline number.
2. Reproduce the issue on the same build if Apple provided steps.
3. Decide whether this is a metadata fix, reviewer clarification, or code change.
4. Keep the response factual and specific. Avoid debating the reviewer.
5. If code changed, rerun the release checklist before resubmission.

## Operating Cadence

Daily during TestFlight:

- Check Sentry critical and important issues.
- Check app feedback and support inbox.
- Confirm the latest TestFlight build still launches and reaches Dashboard.
- Run or review the pilot feedback triage summary when new reports arrive.

Weekly:

- Review top crashes, slow paths, and support themes.
- Review analytics funnels once PostHog events are live.
- Update release notes and known issues.
- Pick the top three feedback themes for the next large release-train PR.

Quarterly:

- Run the kill-switch drill.
- Review dependencies against the consensus stack.
- Refresh App Store screenshots if the UI changed materially.

Monthly:

- Run the staging kill-switch drill and update the drill log.
- Confirm Sentry alert routing still reaches Robert and Max.
- Confirm the PostHog decision-engine dashboard still matches the current analytics taxonomy.

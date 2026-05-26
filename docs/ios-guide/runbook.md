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

## Performance Evidence

Automated Phase 4 checks:

- `FuelWellCriticalPathUITests.testLaunchPerformanceBudget` records launch-to-responsive timing.
- `FuelWellCriticalPathUITests.testPrimaryTabNavigationPerformanceBudget` records primary tab switching.
- Existing UI smoke tests cover Dashboard, Menu, Help, Add Meal, and tab reachability.

Real-device values are required before a TestFlight release is called production-ready:

| Release | Device | Cold launch P95 | Warm launch P95 | Scroll result | Idle memory | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Pending | Pending | Pending | Pending | Pending | Pending | Add physical-device Instruments results before TestFlight. |

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
| Pending | Staging | Pending | Pending | Pending | Pending | Run once staging Supabase credentials are attached to the release candidate. |

Current readiness note: unit coverage verifies that a disabled Anthropic feature is treated as an intentional safe off state. A live staging drill is still required before TestFlight.

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

Weekly:

- Review top crashes, slow paths, and support themes.
- Review analytics funnels once PostHog events are live.
- Update release notes and known issues.

Quarterly:

- Run the kill-switch drill.
- Review dependencies against the consensus stack.
- Refresh App Store screenshots if the UI changed materially.

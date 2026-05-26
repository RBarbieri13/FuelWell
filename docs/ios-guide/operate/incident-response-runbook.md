# Phase 6 Incident Response Runbook

Use this when FuelWell has a pilot-facing incident: crashes, unsafe coaching, sign-in failure, data loss risk, runaway AI cost, or a broken release.

## Severity

| Severity | Definition | First action |
| --- | --- | --- |
| P0 | App unusable for most pilots, data loss, unsafe health guidance, or security/privacy exposure | Pause rollout, open incident, use kill switch if AI-related |
| P1 | Critical flow broken for many pilots: launch, sign in, log meal, coach response, feedback submission | Assign owner, prepare hotfix, notify pilots if needed |
| P2 | Important feature degraded with workaround available | Add known issue, schedule fix in current release train |
| P3 | Small UI, copy, or edge-case defect | Track in pilot feedback triage |

## Five-Minute Response

1. Name an incident owner.
2. Capture start time, affected build, affected surface, and first reporter.
3. Check Sentry for crash count, affected releases, user count, stack trace, and breadcrumbs.
4. Check PostHog for affected flow drop-off when analytics are live.
5. If the issue touches AI meal planning, coach chat, or proactive nudges, disable the relevant Supabase flag before deeper debugging.
6. Decide: kill switch, pause rollout, hotfix, or monitor.

## AI Safety Path

Use this path for unsafe coaching, bad meal plans, repeated hallucinations, or allergy/medical-risk reports.

1. Disable the most relevant flag in Supabase.
2. Confirm the app shows the friendly unavailable state within 30 seconds.
3. Save one redacted example of the bad response.
4. Check whether the issue is input parsing, prompt wording, model output, or missing guardrail copy.
5. Keep the feature disabled until a code or prompt fix has passed local tests and one manual simulator verification.

## Hotfix Path

1. Branch from current `main`.
2. Keep the fix as small as possible.
3. Add or update a test that would have caught the incident.
4. Run the release gate and the affected UI path.
5. Open a PR with incident ID, affected build, fix summary, and verification.
6. After merge, build TestFlight with the normal Fastlane lane once credentials are available.

## Incident Note Template

```text
Incident:
Severity:
Owner:
Start time:
Detected by:
Affected build:
Affected users:
User-visible impact:
Immediate mitigation:
Root cause:
Fix:
Verification:
Follow-up:
```

## Closeout

Close an incident only after the user-visible issue is resolved, the mitigation is documented, and one follow-up prevention item is either shipped or explicitly accepted as backlog.

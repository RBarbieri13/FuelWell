# Phase 6 Operate Readiness

Scope: incident response, feedback triage, analytics dashboards, monthly kill-switch drills, and production access controls.

## Gate

Phase 6 is ready when Robert and Max can answer these without digging through code:

- What happened?
- Who owns the response?
- Should we kill-switch, pause rollout, hotfix, or monitor?
- Which pilots were affected?
- Did users follow the recommendation or ignore it?
- What feedback themes should shape the next release train?

## Local Check

```bash
tools/operate/check-operate-readiness.sh
```

Use `--strict` only when external credentials should be present on the current machine.

## Added Operating Surface

- Incident response runbook with severity and hotfix paths.
- Sentry alert routing and crash-free session target.
- Pilot feedback triage cadence and command.
- PostHog decision-engine dashboard definition.
- App Review rejection response runbook.
- Production database access procedure.
- Monthly kill-switch drill procedure.

## Remaining External Setup

- Apply the Phase 2 Supabase migration to staging.
- Add a service-role key to the local staging env when running drills.
- Configure Sentry alert rules in the Sentry dashboard.
- Recreate the PostHog dashboard from the JSON definition when the PostHog project is available.

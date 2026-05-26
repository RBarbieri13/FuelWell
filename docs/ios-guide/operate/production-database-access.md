# Production Database Access Procedure

Production database access is exceptional. Routine product work should use application paths, migrations, or staging checks.

## Access Rules

- Use read-only queries by default.
- Never run ad hoc writes outside incident response, kill-switch operations, or approved migrations.
- Copy exact SQL into the incident or release note before execution.
- Confirm the Supabase project label before every query.
- Do not paste service-role keys into chat, PR comments, or docs.

## Approved Write Paths

| Path | Approval | Notes |
| --- | --- | --- |
| `feature_flags.enabled` update | Incident owner | Use the kill-switch drill SQL |
| Migration file under `ios/supabase/migrations` | PR approval | Must be reviewed and applied in order |
| Feedback cleanup | Robert | Only remove spam/test rows; preserve pilot reports |

## Query Log Template

```text
Date:
Operator:
Environment:
Purpose:
SQL:
Expected result:
Actual result:
Follow-up:
```

## Service Role Handling

Store local service-role credentials in `~/.fuelwell/supabase-staging.env` or the production equivalent. Keep those files out of git. Prefer short-lived dashboard access where Supabase supports it.

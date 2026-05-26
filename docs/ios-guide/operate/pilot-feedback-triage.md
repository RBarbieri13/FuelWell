# Pilot Feedback Triage

Pilot feedback enters through Help -> Send Feedback and lands in the Supabase `feedback` table.

## Weekly Cadence

1. Export the last seven days of feedback.
2. Bucket by Safety, Reliability, Usability, Nutrition, Coaching, Performance, and General.
3. Assign severity.
4. Pick the top three fixes for the next release train.
5. Reply to pilots only when the response changes behavior or asks for more detail.

## Command

```bash
tools/operate/triage-feedback.js --days 7 --limit 100
```

The script reads `~/.fuelwell/supabase-staging.env` by default. It never prints Supabase keys.

## Severity Rules

| Severity | Examples | Action |
| --- | --- | --- |
| P0/P1 | Unsafe coaching, data loss, launch crash, broad sign-in failure | Open incident |
| P2 | Cannot complete meal logging, coach loop broken, repeated wrong recommendations | Fix in current release train |
| P3 | Confusing copy, layout issue, slow path, missing empty state | Bundle into design/quality pass |
| P4 | Preference, feature request, isolated rough edge | Track for later |

## Design Feedback Rule

When three or more pilots describe the same usability problem, treat it as a design issue rather than individual user confusion. Feed it into the next Front-End Design pass with screenshots or reproduction notes.

## Weekly Summary Template

```text
Week:
Reports reviewed:
P0/P1:
P2:
Top theme:
Second theme:
Third theme:
Decisions:
Release train items:
Deferred:
```

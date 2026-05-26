# Monthly Kill-Switch Drill

The kill switch is useful only if Robert and Max trust it under pressure. Run this monthly in staging and before major launches.

## Scope

Current canonical flag:

- `ai_meal_plan`

Future flags should cover coach chat, proactive nudges, and other AI-heavy surfaces before public launch.

## Drill Steps

1. Confirm staging has the current Supabase migration applied.
2. Confirm local env contains URL, anon key, and service-role key.
3. Run:

```bash
tools/supabase/kill-switch-drill.sh drill
```

4. Open the app and verify the AI feature shows a friendly unavailable state within 30 seconds.
5. Restore the flag.
6. Record timings in `docs/ios-guide/runbook.md`.

## Pass Criteria

- Disable command succeeds.
- App respects disabled state within 30 seconds.
- Restore command succeeds.
- App returns to normal without reinstall.
- No crash or infinite loading state appears.

## Failure Criteria

- Supabase schema cache cannot see `feature_flags`.
- Missing service-role key prevents restore/disable.
- App keeps calling the AI path after the flag is disabled.
- Disabled state is confusing or looks broken.

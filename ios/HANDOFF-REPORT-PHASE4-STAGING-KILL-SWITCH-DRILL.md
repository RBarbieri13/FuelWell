# FuelWell - Phase 4 Staging Kill-Switch Drill Handoff

Date: 2026-05-26
Branch: `feature/phase-4-staging-kill-switch-drill`

## Summary

This Phase 4 slice uses the newly available staging Supabase env file to attempt the live kill-switch read path and adds a repeatable drill command for future runs. The staging endpoint is reachable, but the current project is not ready for the live drill because `public.feature_flags` is missing from the REST schema cache.

## What Changed

- Added `tools/supabase/kill-switch-drill.sh`.
  - `read` verifies the app-side anon-key read path for `ai_meal_plan`.
  - `drill` disables, observes, and restores `ai_meal_plan` when a local service-role key is present.
- Added `docs/ios-guide/quality/staging-kill-switch-drill-phase4.md` with credential requirements, commands, and the 2026-05-26 live result.
- Updated `docs/ios-guide/runbook.md` with the attempted staging drill result.
- Updated `docs/ios-guide/quality/kill-switch-readiness-phase4.md` so the readiness doc no longer says the staging attempt is only hypothetical.

## Live Result

`tools/supabase/kill-switch-drill.sh read` reached staging through `~/.fuelwell/supabase-staging.env`, but Supabase returned:

```text
PGRST205: Could not find the table 'public.feature_flags' in the schema cache
```

## Verification

- `tools/supabase/kill-switch-drill.sh read` returns the expected blocked staging result.
- `git diff --check`

## Remaining Phase 4 Work

- Apply `ios/supabase/migrations/202605240001_phase2_architecture.sql` to the staging Supabase project.
- Add `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` to `~/.fuelwell/supabase-staging.env` locally.
- Rerun `tools/supabase/kill-switch-drill.sh read`.
- Rerun `tools/supabase/kill-switch-drill.sh drill` and record the pass row in the runbook.
- Attach physical-device Instruments values before TestFlight is considered release-ready.

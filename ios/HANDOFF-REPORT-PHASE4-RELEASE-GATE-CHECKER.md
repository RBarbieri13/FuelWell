# FuelWell - Phase 4 Release Gate Checker Handoff

Date: 2026-05-26
Branch: `feature/phase-4-release-gate-checker`

## Summary

This Phase 4 slice adds a single release-gate command that classifies the current app as ready, failed, or externally blocked. It keeps the remaining TestFlight blockers visible: the staging kill-switch drill needs the Supabase schema/service-role access, and physical-device Instruments evidence needs a connected iPhone.

## What Changed

- Added `tools/release/check-phase4-readiness.sh`.
  - Quick mode checks hygiene, privacy manifest validity, import boundaries, theme drift, Supabase staging visibility, kill-switch read status, and physical-device availability.
  - `--full` adds SwiftLint, focused AppTests, the full iOS suite, and simulator rebuild/launch.
  - Exit code `3` means the code path is healthy but release evidence is externally blocked.
- Added `docs/ios-guide/quality/phase4-release-gate.md`.
- Updated `docs/ios-guide/runbook.md` to make the gate the canonical release-candidate command.

## Verification

- `bash -n tools/release/check-phase4-readiness.sh`
- `tools/release/check-phase4-readiness.sh` returns the expected blocked status with current staging/device inputs.
- `git diff --check`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`

## Remaining Phase 4 Work

- Apply `ios/supabase/migrations/202605240001_phase2_architecture.sql` to staging.
- Add `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` to `~/.fuelwell/supabase-staging.env` locally.
- Rerun `tools/supabase/kill-switch-drill.sh drill`.
- Connect a physical iPhone and attach Instruments values.
- Rerun `tools/release/check-phase4-readiness.sh --full` before TestFlight tagging.

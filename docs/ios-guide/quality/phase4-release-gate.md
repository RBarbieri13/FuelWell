# Phase 4 Release Gate

Scope: one-command status for the Phase 4 production-readiness gate

Run the quick gate:

```bash
tools/release/check-phase4-readiness.sh
```

Run the full release-candidate gate before tagging or TestFlight:

```bash
tools/release/check-phase4-readiness.sh --full
```

## What The Gate Checks

The quick gate verifies:

- repository diff hygiene
- privacy manifest plist validity
- feature import boundaries
- theme drift
- kill-switch drill script syntax
- staging Supabase env availability
- staging service-role key availability for the full disable/restore drill
- app-side staging feature-flag read path
- physical iOS device visibility for Instruments evidence

The full gate adds:

- SwiftLint strict
- focused `AppTests`
- full iOS test suite
- simulator rebuild and launch smoke

## Exit Codes

- `0`: ready
- `1`: failed local gate
- `3`: blocked by missing external release evidence

As of 2026-05-26, the gate is expected to return `3` until staging has the Phase 2 Supabase schema applied, the local env file includes a service-role key for the drill, and a physical iPhone is visible to Xcode for Instruments evidence.

# FuelWell W2 Staging Schema Evidence Handoff

## Scope

This slice adds a non-mutating staging schema probe for the W2/W3 live-data path. It turns the database status from plan language into a repeatable command and generated evidence snapshot.

## Added

- `tools/supabase/check-staging-schema.sh`
- `tools/supabase/generate-staging-schema-evidence.mjs`
- `docs/ios-guide/quality/staging-schema-evidence.md`
- `docs/STAGING-SCHEMA-EVIDENCE.md`
- `tools/supabase/data/staging-schema-evidence.json`

## Verification

- `node --check tools/supabase/generate-staging-schema-evidence.mjs`
- `bash -n tools/supabase/check-staging-schema.sh`
- `tools/supabase/check-staging-schema.sh --write` runs against `~/.fuelwell/supabase-staging.env`
- Current evidence: staging is reachable, `founders_100` is present, and the remaining expected app tables/RPCs are missing from the PostgREST schema cache.

## Notes

The checker intentionally exits `3` when staging is reachable but schema objects are missing. That is a real release blocker, not a script failure. Applying migrations remains a human-gated database operation.

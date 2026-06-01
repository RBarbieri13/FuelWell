# FuelWell W2 Migration Manifest Handoff

## Scope

This slice hardens the Supabase migration apply path before Robert applies the missing schema to staging. It adds a credential-free manifest, migration checksums, and checksum drift protection in the existing apply script.

## Added

- `tools/supabase/generate-migration-manifest.mjs`
- `tools/supabase/data/migration-manifest.json`
- `docs/SUPABASE-MIGRATION-MANIFEST.md`

## Updated

- `tools/supabase/apply-migrations.sh`
  - prints SHA-256 checksums in `plan`
  - ensures `schema_migrations.checksum` exists when a DB URL is available
  - records checksums after applying pending migrations
  - refuses `apply` when an already-applied migration checksum differs from the repository file
- `docs/ios-guide/quality/supabase-migration-apply.md`
  - documents manifest generation
  - adds the W4 auth/profile migration to the expected order
  - documents checksum policy

## Verification

- `node --check tools/supabase/generate-migration-manifest.mjs`
- `bash -n tools/supabase/apply-migrations.sh`
- `tools/supabase/generate-migration-manifest.mjs --write`
- `tools/supabase/apply-migrations.sh plan`
- `git diff --check`

## Notes

This PR does not apply migrations, use a service-role key, or mutate Supabase. It prepares the audited path for the later human-approved staging apply.

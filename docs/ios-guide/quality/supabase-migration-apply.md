# Supabase Migration Apply Runbook

Updated: 2026-05-31

## Purpose

This runbook is the W2 apply path for FuelWell's app database schema. Codex may author migrations and verify syntax locally, but Robert performs the single live apply after confirming the target project.

## Safety Rules

- Default target is staging.
- Do not apply to production unless `FUELWELL_SUPABASE_TARGET=production` and `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1` are both set.
- Snapshot/export `founders_100` before any production apply.
- Never drop or rewrite live `founders_100` rows. Reconciliation migrations must add/backfill only.

## Environment

Use `~/.fuelwell/supabase-staging.env` unless another file is explicitly selected:

```bash
FUELWELL_SUPABASE_DB_URL="postgresql://..."
FUELWELL_SUPABASE_TARGET="staging"
```

The existing REST drill still uses:

```bash
FUELWELL_SUPABASE_URL="https://..."
FUELWELL_SUPABASE_ANON_KEY="..."
FUELWELL_SUPABASE_SERVICE_ROLE_KEY="..."
```

## Commands

List the migration order without secrets:

```bash
tools/supabase/apply-migrations.sh plan
```

Compare migration order against a live database:

```bash
FUELWELL_SUPABASE_DB_URL="postgresql://..." tools/supabase/apply-migrations.sh plan
```

Apply pending staging migrations:

```bash
tools/supabase/apply-migrations.sh apply
```

Verify the app-facing flag table after apply:

```bash
tools/supabase/kill-switch-drill.sh read
```

Run the full kill-switch drill after `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` is present:

```bash
tools/supabase/kill-switch-drill.sh drill
```

## Expected Migration Order

1. `202605230001_schema_migrations.sql`
2. `202605240001_phase2_architecture.sql`
3. `202605260001_phase7_founding100.sql`
4. `202605260002_phase7_account_linkage.sql`
5. `202605310001_w2_coach_usage.sql`

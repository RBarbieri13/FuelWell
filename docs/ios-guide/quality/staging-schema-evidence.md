# Staging Schema Evidence

FuelWell's app cannot be flipped from mock data to live Supabase data until the expected tables and RPCs are present in the chosen staging project. This evidence layer probes the project with the anon key so the team can see the current schema state without applying migrations or touching production data.

## Command

```bash
tools/supabase/check-staging-schema.sh --write
```

The command reads `~/.fuelwell/supabase-staging.env` by default. That file should contain:

```bash
FUELWELL_SUPABASE_URL=...
FUELWELL_SUPABASE_ANON_KEY=...
```

It writes:

- `docs/STAGING-SCHEMA-EVIDENCE.md`
- `tools/supabase/data/staging-schema-evidence.json`

## Exit Codes

- `0`: all expected schema objects are reachable.
- `3`: the probe ran, but one or more expected schema objects are missing.
- `1`: the env file is malformed or a probe returned an unexpected response.

## Safety

The checker uses only the anon key. RPC probes use unauthenticated, safe payloads and treat expected authorization rejection as proof the function exists. The checker never uses a service-role key, never applies migrations, and never performs account, payment, Apple, or release actions.

## Interpreting Results

- `pass`: a table is reachable through PostgREST, or an RPC exists and rejected the safe probe as expected.
- `blocker`: a schema object is missing from PostgREST. Apply the relevant migration only after Robert approves credentials/backups.
- `fail`: investigate before using staging as a live dependency target.

# Phase 4 Staging Kill-Switch Drill

Scope: live staging evidence for the `ai_meal_plan` safety switch

## Credential File

The staging env file is expected at:

```bash
~/.fuelwell/supabase-staging.env
```

Required for read verification:

- `FUELWELL_SUPABASE_URL`
- `FUELWELL_SUPABASE_ANON_KEY`

Required for the full disable/observe/restore drill:

- `FUELWELL_SUPABASE_SERVICE_ROLE_KEY`

The service-role key must stay outside the repository.

## Drill Command

Read the current flag through the same anon-key path used by the app:

```bash
tools/supabase/kill-switch-drill.sh read
```

Run the full safety drill:

```bash
tools/supabase/kill-switch-drill.sh drill
```

The full drill disables `ai_meal_plan`, polls through the anon-key read path until the disabled state is observed, restores the original value, and prints a runbook-ready result row.

## Live Result On 2026-05-26

The staging endpoint is reachable with `~/.fuelwell/supabase-staging.env`, but the REST API returned:

```text
PGRST205: Could not find the table 'public.feature_flags' in the schema cache
```

That means the existing Phase 2 migration has not been applied to this staging project yet, or the schema cache has not picked it up. The next required action is to apply:

```text
ios/supabase/migrations/202605240001_phase2_architecture.sql
```

After the migration is applied, rerun `tools/supabase/kill-switch-drill.sh read`. Once that succeeds, add `FUELWELL_SUPABASE_SERVICE_ROLE_KEY` to the local env file and run the full drill.

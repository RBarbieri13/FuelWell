# FuelWell Staging Schema Evidence

Generated: 2026-06-01T16:37:48.416Z
Status: Schema Blocked
Project host: xzsftuxvnkgxtbiibvac.supabase.co

This report probes the configured Supabase staging project with the anon key. It does not apply migrations, use a service-role key, mutate production data, or call Apple/payment systems.

## Summary

- Passed: 2
- Schema blockers: 19
- Failures: 0

## Probe Results

| Area | Status | Name | Detail | HTTP | Code |
|---|---:|---|---|---:|---|
| env | pass | supabase-staging.env | Required non-secret staging values are present. |  |  |
| table | blocker | schema_migrations | Could not find the table 'public.schema_migrations' in the schema cache | 404 | PGRST205 |
| table | blocker | profiles | Could not find the table 'public.profiles' in the schema cache | 404 | PGRST205 |
| table | blocker | foods | Could not find the table 'public.foods' in the schema cache | 404 | PGRST205 |
| table | blocker | meals | Could not find the table 'public.meals' in the schema cache | 404 | PGRST205 |
| table | blocker | recipes | Could not find the table 'public.recipes' in the schema cache | 404 | PGRST205 |
| table | blocker | grocery_items | Could not find the table 'public.grocery_items' in the schema cache | 404 | PGRST205 |
| table | blocker | progress_entries | Could not find the table 'public.progress_entries' in the schema cache | 404 | PGRST205 |
| table | blocker | coach_messages | Could not find the table 'public.coach_messages' in the schema cache | 404 | PGRST205 |
| table | blocker | restaurants | Could not find the table 'public.restaurants' in the schema cache | 404 | PGRST205 |
| table | blocker | feedback | Could not find the table 'public.feedback' in the schema cache | 404 | PGRST205 |
| table | blocker | feature_flags | Could not find the table 'public.feature_flags' in the schema cache | 404 | PGRST205 |
| table | blocker | subscription_entitlements | Could not find the table 'public.subscription_entitlements' in the schema cache | 404 | PGRST205 |
| table | blocker | founding100_reservations | Could not find the table 'public.founding100_reservations' in the schema cache | 404 | PGRST205 |
| table | blocker | marketing_signups | Could not find the table 'public.marketing_signups' in the schema cache | 404 | PGRST205 |
| table | pass | founders_100 | Table is reachable through PostgREST. | 206 |  |
| table | blocker | subscription_validation_events | Could not find the table 'public.subscription_validation_events' in the schema cache | 404 | PGRST205 |
| table | blocker | coach_usage | Could not find the table 'public.coach_usage' in the schema cache | 404 | PGRST205 |
| rpc | blocker | reserve_founding100 | Could not find the function public.reserve_founding100(target_email, target_user_id) in the schema cache | 404 | PGRST202 |
| rpc | blocker | link_marketing_signup_to_user | Could not find the function public.link_marketing_signup_to_user(target_email, target_user_id) in the schema cache | 404 | PGRST202 |
| rpc | blocker | delete_current_user | Could not find the function public.delete_current_user without parameters in the schema cache | 404 | PGRST202 |

## Interpretation

- `pass` means the table is reachable or the RPC exists and rejects the safe unauthenticated probe as expected.
- `blocker` means the schema object is missing from PostgREST and the matching migration still needs to be applied to staging.
- `fail` means the probe hit an unexpected response and should be investigated before relying on the staging project.

## Next Actions

- Apply missing migrations only with Robert-approved credentials and backups.
- Rerun `tools/supabase/check-staging-schema.sh --write` after any staging migration apply.
- Keep this report attached to W2/W3/W5 readiness decisions so live app wiring uses observed database state.

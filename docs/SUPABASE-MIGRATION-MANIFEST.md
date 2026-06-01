# Supabase Migration Manifest

Generated: 2026-06-01T17:22:50.492Z
Source: `ios/supabase/migrations`
Migration count: 6

This manifest is the review artifact for the W2 schema apply path. It records migration order and SHA-256 checksums without containing credentials or live database data.

## Migration Order

| Order | Version | Name | SHA-256 | Safety notes |
|---:|---|---|---|---|
| 1 | `202605230001` | `schema_migrations` | `aa69581d3c3fd2ee31a793c67b8dc020c9d40019afb26fcdad79eaa71baeb6a9` | tracks schema_migrations; idempotency signals; alters table |
| 2 | `202605240001` | `phase2_architecture` | `0fb547448c7ca92b9990e08dde35f147715cee0101ef34a6ac17c7388ea0fb84` | tracks schema_migrations; idempotency signals; alters table |
| 3 | `202605260001` | `phase7_founding100` | `cc326228f073f9bf688e4c4933adbc03c056389eca344b00dcf3af30054b45cc` | tracks schema_migrations; idempotency signals; alters table; security definer function |
| 4 | `202605260002` | `phase7_account_linkage` | `c5a56985fda57d6a5d3c2396adbb10b3b0ee3d7b235aee05c29ead9d201f331a` | tracks schema_migrations; idempotency signals; touches founders_100; alters table; security definer function |
| 5 | `202605310001` | `w2_coach_usage` | `521e44c288c1cc6d2aae78cd1ed7bbfeb3cff8f67d2e14c91c97c39cd60d571e` | tracks schema_migrations; idempotency signals; alters table |
| 6 | `202605310002` | `w4_auth_profile_onboarding` | `37053b64aac34ccfd8b21f79483c2ca7259964dd68b17d9825823c3c47060cfc` | tracks schema_migrations; idempotency signals; delete statement present; alters table; security definer function |

## Apply Guardrails

- Run `tools/supabase/generate-migration-manifest.mjs --write` before applying migrations.
- Run `tools/supabase/apply-migrations.sh plan` before any apply.
- For production, export `founders_100` first and require Robert approval before `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1`.
- After apply, rerun the staging schema evidence probe and kill-switch drill.

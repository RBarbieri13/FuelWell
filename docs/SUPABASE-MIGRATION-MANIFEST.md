# Supabase Migration Manifest

Generated: 2026-08-10T17:10:29.282Z
Source: `supabase/migrations`
Migration count: 16

This manifest is the review artifact for the W2 schema apply path. It records migration order and SHA-256 checksums without containing credentials or live database data.

## Migration Order

| Order | Version | Name | SHA-256 | Safety notes |
|---:|---|---|---|---|
| 1 | `20260611180000` | `base_schema` | `ba27607b31e22601608cc734edcb64e56e347a2a3f4814e256531464b7239b46` | missing tracking insert; idempotency signals; alters table; security definer function |
| 2 | `20260611180100` | `coach_tables` | `713a5fe34810159f04051d42320d836851533c89984f2a6a3e61f690fa541d17` | missing tracking insert; idempotency signals; destructive statement present; alters table |
| 3 | `20260612120000` | `profiles_preferences_jsonb` | `9cd42166829408bec6ec83b320fa6d32e83b43e878d51a39bd6792480ebbecb3` | missing tracking insert; idempotency signals; alters table |
| 4 | `20260612170000` | `goal_loop_integrations` | `e852074f07b31a6ff1b028f51567a47148ff5fc6ca4ee1bd6770200bd7e83016` | missing tracking insert; idempotency signals; alters table |
| 5 | `20260620170000` | `coach_knowledge_bases` | `91feb284c548d3b48ab665648b742d7815f00bc2f5fcc8583e01794ab4611c07` | missing tracking insert; idempotency signals; alters table |
| 6 | `20260627042014` | `coach_uploaded_artifacts` | `0a83add2a2a42894d00db4b8303091b28fcfaf01d508abb2d479e5a70949ade4` | missing tracking insert; idempotency signals; destructive statement present; alters table |
| 7 | `20260627043000` | `tighten_coach_artifact_privileges` | `d6da40a0c21f87b3c8f41cdbae4cc2e925345310225eebe4f7176b18c6ab270a` | missing tracking insert; review idempotency; standard schema migration |
| 8 | `20260712200713` | `fitness_grocery_foundation` | `b23ff108c61585570ac29c58b7f2df54c9b15a2d1cc207e6883bfcb4b29262db` | missing tracking insert; review idempotency; destructive statement present; alters table |
| 9 | `20260712213000` | `body_log_entries` | `34ae386cb76d832b157a9b751ddb80cab5593e5b2cb109045791782730cc10cb` | missing tracking insert; review idempotency; destructive statement present; alters table |
| 10 | `20260715210000` | `grant_anon_select_for_live_probe` | `241f77924fa38d10a198c384df68e6c787a8d4045ae77fb50510e3abb299339c` | missing tracking insert; review idempotency; standard schema migration |
| 11 | `20260809173000` | `account_controls_and_authenticated_grants` | `d1ff2f03f31e09211f4e4788e189845c798ea45130c1a37bee079ba5ba903f26` | missing tracking insert; review idempotency; delete statement present; security definer function |
| 12 | `20260809174000` | `coach_confirmation_uses` | `8e336cc87bafcaa017b1636d7e020305814bf5d7c54d4be937dbbdf8f6cb550f` | missing tracking insert; idempotency signals; destructive statement present; alters table |
| 13 | `20260809174500` | `account_delete_confirmation_uses` | `3ef77c6c6f996fa41f2cf256b32e9a83f9b52b753eb7fefb2c5a78325d5a7c40` | missing tracking insert; idempotency signals; destructive statement present; alters table |
| 14 | `20260810014631` | `user_weekly_meal_plans` | `78fff108b5a71a5c5ab75d8c3c50217f2262c72f2195e6c0042398598b7b6ca2` | missing tracking insert; review idempotency; destructive statement present; alters table |
| 15 | `20260810040034` | `server_authoritative_user_app_state` | `d043d58620005b85b4e605f1718ed2a2a581f39b3fbb3c540dcb87ff47bc68c8` | missing tracking insert; review idempotency; destructive statement present; alters table |
| 16 | `20260810172000` | `release_security_hardening` | `a7aab17a6c0f6a7e315717f898aa58db107b58b21a7f92de983b8ebfafd86d4f` | missing tracking insert; idempotency signals; standard schema migration |

## Apply Guardrails

- Run `tools/supabase/generate-migration-manifest.mjs --write` before applying migrations.
- Run `tools/supabase/apply-migrations.sh plan` before any apply.
- For production, export `founders_100` first and require Robert approval before `FUELWELL_SUPABASE_ALLOW_PRODUCTION_APPLY=1`.
- After apply, rerun the staging schema evidence probe and kill-switch drill.

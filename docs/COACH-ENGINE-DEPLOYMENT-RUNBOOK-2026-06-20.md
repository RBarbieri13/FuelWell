# Coach Engine Deployment Runbook

Date: 2026-06-20
Project: FuelWell preview app

This runbook is intentionally approval-gated. The objective requires explicit confirmation before production deploys, PRs, scheduled jobs, paid API usage beyond normal dev testing, sending messages, or changing live user data.

## Current Local Readiness

Local project is linked to the Vercel project named `fuelwell-preview`.

Required migration is present:

```text
supabase/migrations/20260620170000_coach_knowledge_bases.sql
```

Full local verifier shortcut:

```bash
npm run verify:coach:smoke
```

Expected successful output includes:

```json
{
  "status": "PASS",
  "reasons": [
    "Static privacy/migration/health invariants, full unit suite, seed counts, autocomplete, user isolation, personalized context, safe coach actions, lint, typecheck/build, browser smoke/live coach wiring passed."
  ]
}
```

## Safe Before Approval

These commands do not deploy or mutate live data:

```bash
npm run verify:coach
npm run verify:coach:smoke
git diff --stat
git status --short
```

## Requires Explicit Approval

Do not run these until Robert explicitly approves the live migration/deploy step.

1. Apply the coach knowledge migration to the target Supabase environment.
2. Deploy the current branch to the linked Vercel preview/live project.
3. Open or merge a PR, if desired.
4. Run post-deploy smoke verification against the deployed URL.

## Migration Step

Use the team's normal Supabase migration process for the target environment. The migration creates one table:

```sql
public.coach_knowledge_bases
```

Required invariants:

- Primary key: `user_id`
- FK: `profiles(id) ON DELETE CASCADE`
- RLS enabled
- Access constrained by `auth.uid() = user_id`
- Stores structured memory in `knowledge_jsonb`

After migration, verify table existence and RLS with the Supabase dashboard or project CLI before deploying.

## Deployment Step

After approval and migration:

```bash
npm run verify:coach
```

Then deploy through the existing Vercel project workflow used for FuelWell preview. The local project is linked, but this runbook does not hardcode an outward-facing deploy command because deployment is approval-gated and may vary by branch/review policy.

## Post-Deploy Verification

After deploy:

1. Open the deployed preview.
2. Confirm `/preview` loads both established-user and new-user review paths.
3. Confirm `/app/coach` can:
   - answer with personalized context,
   - log a clear meal request directly,
   - add grocery items,
   - suggest meals/workouts,
   - enforce destructive confirmation,
   - render rich text and attachments UI.
4. Confirm `/app/workouts` filter/search works and workout preview pages load.
5. Confirm signed-in users can enter the app without errors after the `coach_knowledge_bases` migration.

Recommended post-deploy local command:

```bash
npm run verify:coach:smoke
```

Note: the current Playwright config targets local preview mode. If verifying the deployed URL directly, update the Playwright `baseURL` or use the browser manually against the deployed preview.

## Completion Criteria After Approval

The goal can be marked complete when all are true:

- Migration is applied to the target Supabase environment.
- App is deployed to the intended Vercel preview/live target.
- `npm run verify:coach:smoke` passes locally.
- A deployed preview sanity check confirms the Coach and Workouts routes behave correctly.
- No new blocker or failing check remains.

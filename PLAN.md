# FuelWell App Orchestration Ledger

## Goal
Rebuild the product app preview into a truthful daily decision system: every metric has a source, every screen has a next action, and empty users never see fake progress.

## Source / Branch
- Base: `origin/claude/live-fuel-app-preview-paAj2`
- Branch: `feature/fuelwell-app-orchestration`
- Worktree: `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration`

## Protected Work
- Original checkout `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell/website` has local edits on `feature/continue-app-development`.
- This run does not edit that checkout.

## Active Workstreams
- Coordinator: app data model, app shell, dashboard, meal logging, nutrition detail, coach, integration, verification. Completed.
- Worker A: recipes, meal plan, grocery list. Completed.
- Worker B: activity, recovery, workouts. Completed.
- Worker C: progress analytics. Completed.

## Integration Notes
- Product app routes were moved from invisible `(app)` route-group URLs to the real `/app/*` segment expected by nav and middleware.
- Full lint and production build passed after integration.
- Browser verified logged-out `/app/dashboard` redirects to `/login`; protected app visual QA requires a real Supabase session or local auth fixture.

## Acceptance Gates
- `npm run lint`
- `npm run build`
- Browser smoke: auth redirect, dashboard score detail, nutrition detail, meal search/add, coach intents, recipes/meal-plan/grocery, activity/recovery/workouts, progress, responsive layout.

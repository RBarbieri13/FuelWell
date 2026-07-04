# FuelWell App Orchestration Handoff

Last updated: 2026-06-10  
Primary branch: `feature/fuelwell-app-orchestration`  
Worktree: `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration`  
Base branch: `origin/claude/live-fuel-app-preview-paAj2`

## Executive Summary

FuelWell has moved from a thin app prototype into a broader product-app preview centered on a daily health decision system. The recent autonomous update loop refreshed most of the app UI, moved the product app into real `/app/*` routes, added several missing pages, made the dashboard score explainable, made nutrition/logging more interactive, expanded Coach behavior, and added early-value surfaces for activity, recovery, workouts, recipes, meal planning, grocery, and progress.

After that product-app rebuild, a stable public preview platform was added on Vercel so Robert and Max can review the current app without relying on a temporary local tunnel. The preview platform is available at:

`https://fuelwell-preview.vercel.app/preview`

Important distinction: the preview hub wraps the real current web app route in iframes. It does not replace the app UI with a mock. The desktop panel and phone panel both load `/app/dashboard`; the phone panel constrains the viewport to `375 x 812` so the app's real responsive mobile layout appears. This is a browser/PWA-style mobile view, not a native Swift/Xcode iOS Simulator stream.

## Current Git State

Recent commits on `feature/fuelwell-app-orchestration`:

- `09eea48` - `Add stable live preview hub`
- `041097c` - `Add iOS preview shell`
- `c000417` - `Add sample-user preview mode`
- `6d85ef6` - `Build FuelWell app decision system`

The branch is ahead of `origin/claude/live-fuel-app-preview-paAj2` by these commits. At the time this handoff was written, the local worktree was clean before adding this handoff document.

The original checkout at `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell/website` was intentionally not edited during the orchestration run because it had separate local work. The active implementation lives in the sibling worktree above.

## Stable Review Links

Use these for product review:

- Review hub: `https://fuelwell-preview.vercel.app/preview`
- Desktop app route: `https://fuelwell-preview.vercel.app/app/dashboard`
- Phone-focused view: `https://fuelwell-preview.vercel.app/ios-preview`

Preview deployment:

- Vercel project: `fuelwell-preview`
- Stable alias: `https://fuelwell-preview.vercel.app`
- Last verified deployment id: `dpl_BzzjGdm6uHnZZ5LXo5LKVKoBQE92`

Preview behavior:

- `/preview` shows web and phone panels side by side on wide screens and stacked on narrow screens.
- `/login`, `/signup`, `/forgot-password`, and `/callback` redirect to `/preview` when preview mode is active.
- `/app/*` routes open without a real Supabase user in preview mode by using sample-user fallback data.
- The sample-user bypass is demo-only and should remain scoped to preview contexts.

## Environment And Commands

Project root for this worktree:

```bash
cd /Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration
```

Core commands:

```bash
npm run lint
npm run build
npm run dev -- --port 3010
```

For local preview mode:

```bash
FUELWELL_PREVIEW_MODE=true NEXT_PUBLIC_FUELWELL_PREVIEW_MODE=true npm run dev -- --port 3010
```

The app expects Supabase public env vars for normal auth/data paths:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The previous local env source was:

`/Users/robert.barbieri/.claude/projects-workspace/Fuelwell/website/.env.local`

Do not print or expose secrets from that file.

## Verification Already Completed

Local checks completed after the app rebuild and preview work:

- `npm run lint`
- `npm run build`
- `git diff --check`
- Local `/preview` returned `200`
- Local `/login` redirected to `/preview` in preview mode
- Browser verified local `/preview` contained two iframes:
  - `FuelWell web app preview`
  - `FuelWell iOS simulator preview`

Hosted checks completed after Vercel deploy:

- `https://fuelwell-preview.vercel.app/preview` returned `200`
- `https://fuelwell-preview.vercel.app/login` redirected to `/preview`
- `https://fuelwell-preview.vercel.app/app/dashboard` returned `200` without sign-in
- Browser opened the public preview hub and confirmed:
  - H1: `Web app and iOS simulator review deck`
  - Two embedded app panels exist
  - The embedded app visually rendered in the review hub
- `vercel inspect https://fuelwell-preview.vercel.app` reported status `Ready`

## Product Direction Set By Robert

The core product requirement is not just "make it prettier." The app must become useful as a daily health decision system.

North star:

Every screen should answer: "What should I do right now?"

Product rules established during this run:

- Metrics must be explainable, drillable, and consistent with logged data.
- Empty users must not see fake positive progress.
- Dashboard, meals, nutrition, coach, progress, recipes, workouts, and profile must feel like one coherent product.
- Dead controls are not acceptable unless they clearly explain an unavailable state and offer a useful alternative.
- Coach should understand app actions and metrics, not give generic fallback responses.
- The preview should be frictionless for Robert and Max, but preview-only auth bypass must not leak into normal production behavior.

## What The Autonomous App Rebuild Changed

Commit `6d85ef6` is the main product-app rebuild. It made a broad pass across the app:

- Moved product routes from `src/app/(app)` into real URL routes under `src/app/app`.
- Rebuilt the app shell, mobile nav, sidebar, cards, dashboard components, and page surfaces.
- Added or expanded these app routes:
  - `/app/dashboard`
  - `/app/dashboard/score`
  - `/app/nutrition`
  - `/app/log`
  - `/app/coach`
  - `/app/activity`
  - `/app/recovery`
  - `/app/workouts`
  - `/app/workouts/[id]`
  - `/app/recipes`
  - `/app/meal-plan`
  - `/app/grocery-list`
  - `/app/progress`
  - `/app/profile`
  - `/app/onboarding`
- Added shared product/demo data and helpers in `src/lib/fuelwell-data.ts`.
- Improved visual depth and product feel through `src/app/globals.css`, layout components, and shared UI components.

This pass added about 4,550 lines and removed the older thin prototype surfaces.

## App Route Map

Primary product routes:

- `src/app/app/dashboard/page.tsx` - server entry for dashboard, Supabase/profile/meals loading, preview fallback.
- `src/app/app/dashboard/dashboard-client.tsx` - main dashboard UI, health score, daily decision surface, macro/meals summaries, actions.
- `src/app/app/dashboard/score/page.tsx` - health score explanation and contributor detail.
- `src/app/app/nutrition/page.tsx` - daily nutrition detail, macro totals, meal breakdowns.
- `src/app/app/log/page.tsx` - interactive meal logging/search/photo/scan-style flow.
- `src/app/app/coach/page.tsx` - client Coach Chat with deterministic app-aware intent handling.
- `src/app/app/activity/page.tsx` - activity summary and early activity surface.
- `src/app/app/recovery/page.tsx` - recovery checklist/surface.
- `src/app/app/workouts/page.tsx` - workout plan list.
- `src/app/app/workouts/[id]/page.tsx` - workout detail screens.
- `src/app/app/recipes/page.tsx` - recipe exploration and macro-aware cards.
- `src/app/app/meal-plan/page.tsx` - meal planning flow.
- `src/app/app/grocery-list/page.tsx` - grocery list surface.
- `src/app/app/progress/page.tsx` - early analytics/progress view.
- `src/app/app/profile/page.tsx` and `profile-client.tsx` - profile/settings surface.

Preview routes:

- `src/app/preview/page.tsx` - stable public review hub with desktop and phone panels.
- `src/app/ios-preview/page.tsx` - phone-focused preview page.

Auth routes:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/callback/route.ts`

App shell and shared UI:

- `src/app/app/layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/mobile-header.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/dashboard/calorie-ring.tsx`
- `src/components/dashboard/macro-bar.tsx`
- `src/components/dashboard/quick-actions.tsx`

Data and auth helpers:

- `src/lib/fuelwell-data.ts`
- `src/lib/macros.ts`
- `src/lib/preview-session.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`

## Preview Mode Details

Preview mode is controlled by `src/lib/preview-session.ts`.

It currently returns true when:

- `FUELWELL_PREVIEW_MODE=true`
- `NEXT_PUBLIC_FUELWELL_PREVIEW_MODE=true`
- host includes `localhost`
- host includes `127.0.0.1`
- host includes `trycloudflare.com`

Preview sample user:

- id: `fuelwell-preview-user`
- display name: `Alex Preview`
- email: `preview@fuelwell.local`
- goal: `lose`
- activity level: `moderate`
- allergy example: `Shellfish`

Preview mode is used by:

- dashboard
- dashboard score detail
- nutrition
- profile
- coach
- log flow
- middleware redirects

Important caution:

Preview mode currently uses env flags on the Vercel preview deployment. Do not enable those env flags on a real production app for real users. For a production release, remove env-level bypass or restrict it to the dedicated preview host only.

## Known Limitations And Caveats

The app is substantially improved, but it is still not a finished production product.

Current limitations:

- Many AI-like flows are deterministic/simulated rather than backed by a live model.
- Camera/photo/barcode scanning is not truly integrated; it should either become real or remain clearly simulated/unavailable.
- Meal logging can show saved states and update real Supabase paths for signed-in users, but the public preview intentionally keeps sample data fixed for coworker review.
- Activity, recovery, workout, recipe, meal-plan, grocery, and progress surfaces provide early product value but are still mostly local/static app logic rather than full backend-integrated systems.
- The iOS preview is a real responsive web/PWA viewport, not a native iOS app build or Xcode Simulator stream.
- Authentication was bypassed for previewability; the real login/register flow still needs proper end-to-end verification and likely cleanup.
- GitHub push was not completed in the prior run because remote auth was blocked; verify `gh auth status` or SSH before assuming this branch is published.
- The Vercel preview deployment used command-line runtime/build env vars. If the project is redeployed from dashboard/Git without those env vars configured persistently, preview mode may stop auto-signing in.

## Recommended Next Agent Priorities

Start with verification before adding features.

1. Confirm current state:
   - `git status --short --branch`
   - `npm run lint`
   - `npm run build`
   - Open `https://fuelwell-preview.vercel.app/preview`
   - Open `/app/dashboard`, `/app/nutrition`, `/app/log`, `/app/coach`, `/app/progress`

2. Stabilize preview deployment:
   - Persist Vercel env vars in the `fuelwell-preview` project:
     - `FUELWELL_PREVIEW_MODE=true`
     - `NEXT_PUBLIC_FUELWELL_PREVIEW_MODE=true`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Consider adding a custom alias/domain if Robert wants something cleaner than `fuelwell-preview.vercel.app`.
   - Keep preview auth bypass scoped to the preview project or preview host.

3. Run a human UX pass:
   - Use the app as a new user.
   - Use the app as the preview sample user.
   - Check desktop and phone widths.
   - Record any clipped text, tiny tap targets, inert controls, contradictory metrics, and pages with no useful next action.

4. Harden auth and onboarding:
   - Ensure unauthenticated non-preview users hit login/register, not dashboard.
   - Verify Google login, email signup, callback, password reset, onboarding continuation, and sign-out.
   - Add truthful empty states for real new users with no meals/activity/recovery data.

5. Deepen data consistency:
   - Make dashboard score, nutrition totals, Today’s Plate, and logged meals use one shared source of truth.
   - Ensure adding a meal updates dashboard totals and nutrition detail in real user mode.
   - Add tests or browser checks for no contradiction between dashboard and nutrition.

6. Make Coach more useful:
   - Expand deterministic intents or connect a real model if credentials and safety controls are ready.
   - Coach should route to meal logging, workouts, nutrition detail, recipes, progress, recovery, and score explanation.
   - Quick prompts should adapt to today’s data.

7. Backend integration pass:
   - Audit Supabase tables actually available:
     - `profiles`
     - `daily_logs`
     - `foods`
     - `meals`
     - `meal_items`
     - `recipes`
     - `recipe_ingredients`
     - `user_goals`
     - `ai_conversations`
   - Keep schema migrations additive.
   - Avoid destructive database changes.

8. Testing and QA:
   - Add focused Playwright or browser smoke coverage for:
     - preview `/login` redirects to `/preview`
     - non-preview `/app/dashboard` redirects to login
     - dashboard score opens detail
     - nutrition page renders meal breakdown
     - log search filters as the user types
     - Coach handles “Plan a workout,” “Log a meal,” “Am I on track today?”, and “Show nutrition”
     - mobile nav works at phone width

## Suggested Agent Workflow

Use this repo like a product app, not a static design exercise.

Before editing:

- Read this handoff.
- Read `PLAN.md`.
- Inspect `src/lib/fuelwell-data.ts`.
- Inspect the target route and nearby components.
- Open the live preview and the local dev app.

During edits:

- Keep changes scoped by product area.
- Prefer existing UI components and route patterns.
- Keep preview mode working.
- Do not reintroduce fake dashboard positivity for empty users.
- Do not make the preview shell diverge from the real app UI.
- Do not modify unrelated local work in `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell/website`.

Before handoff:

- Run `npm run lint`.
- Run `npm run build`.
- Browser-check desktop and phone preview.
- Commit verified units of work.
- Update this handoff or add a new dated handoff if major changes land.

## Definition Of Done For The Next Development Slice

A good next slice should satisfy these:

- The user can understand what each visible metric means.
- The user can click metric-heavy areas for detail.
- The user can take an obvious next action from every major screen.
- Desktop and phone layouts are both usable.
- Preview mode still opens without sign-in for Robert and Max.
- Normal non-preview auth remains protected.
- Lint and build are green.

## Files Most Likely To Need Attention Next

For dashboard and score:

- `src/app/app/dashboard/dashboard-client.tsx`
- `src/app/app/dashboard/page.tsx`
- `src/app/app/dashboard/score/page.tsx`
- `src/lib/fuelwell-data.ts`

For meals and nutrition:

- `src/app/app/log/page.tsx`
- `src/app/app/nutrition/page.tsx`
- `src/lib/fuelwell-data.ts`

For Coach:

- `src/app/app/coach/page.tsx`

For app shell and mobile:

- `src/app/app/layout.tsx`
- `src/components/layout/mobile-header.tsx`
- `src/components/layout/mobile-nav.tsx`
- `src/components/layout/sidebar.tsx`
- `src/app/globals.css`

For preview/deployment:

- `src/app/preview/page.tsx`
- `src/app/ios-preview/page.tsx`
- `src/lib/preview-session.ts`
- `src/lib/supabase/middleware.ts`

## Final Notes For The Next Agent

Robert is using the live preview as the product review surface with Max. Treat that link as the shared truth for demos. If a local change is not deployed, Max will not see it.

The recent autonomous update created a much better foundation, but the next level of work is product rigor: fewer contradictions, deeper drilldowns, more real state updates, and better human workflows. Use the app like a coach, nutritionist, and user would. When something feels unclear, add the detail, action, or empty state that would make the next decision obvious.

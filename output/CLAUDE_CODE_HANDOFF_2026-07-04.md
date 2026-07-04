# FuelWell Claude Code Handoff Packet

Date prepared: 2026-07-04
Prepared by: Codex
Purpose: Bring Claude Code up to speed so it can safely resume FuelWell development after several weeks of Codex-driven app work.

## Copy/Paste Kickoff Prompt For Claude Code

You are resuming FuelWell development from Codex. Do not start by editing. First orient yourself, verify the real app repo, and protect the current dirty worktree.

Start here:

```bash
cd /Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration
```

Read these first:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/HANDOFF-2026-06-10-fuelwell-app-orchestration.md`
- `docs/COACH-ENGINE-COMPLETION-AUDIT-2026-06-20.md`
- `docs/COACH-ENGINE-DEPLOYMENT-RUNBOOK-2026-06-20.md`
- this file: `output/CLAUDE_CODE_HANDOFF_2026-07-04.md`

Then run:

```bash
git branch --show-current
git status --short
npm run lint
npm run build
```

If lint/build fails, fix those failures before adding new features. Do not revert uncommitted changes you did not make. This worktree has many in-progress app changes from Codex.

North star: FuelWell is a real-time decision system, not a generic calorie tracker. Every screen should help the user decide what to do next, using their profile, food, workouts, readiness, goals, and logged history.

## Critical Repo Map

There are multiple FuelWell-looking folders. Do not confuse them.

Active web app repo:

```text
/Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration
```

Current branch observed by Codex:

```text
feature/fw-design-system-v2
```

Outer folder that is not the active app repo:

```text
/Users/robert.barbieri/.claude/projects-workspace/Fuelwell
```

Separate marketing/website checkout, also not the current product app:

```text
/Users/robert.barbieri/.claude/projects-workspace/Fuelwell/website
```

Native iOS work exists in several Developer folders. Before native work, verify which one Robert wants. Historically useful paths include:

```text
/Users/robert.barbieri/Developer/FuelWell-ui-polish
/Users/robert.barbieri/Developer/FuelWell
/Users/robert.barbieri/Developer/FuelWell-TestFlight-CI
```

Prior iOS simulator workflow used XcodeBuildMCP with:

```text
projectPath=/Users/robert.barbieri/Developer/FuelWell-ui-polish/ios/FuelWellApp.xcodeproj
scheme=FuelWellApp
simulator=iPhone 17
```

But do not assume this is still current. Run XcodeBuildMCP `session_show_defaults` first, then set defaults only if needed.

## Live Preview State

Verified by Codex on 2026-07-04:

- `https://fuelwell-preview.vercel.app/preview` returned HTTP 200.
- `https://fuelwell-preview.vercel.app/app/dashboard` returned HTTP 200.

Review links:

- Main preview hub: `https://fuelwell-preview.vercel.app/preview`
- Direct dashboard: `https://fuelwell-preview.vercel.app/app/dashboard`

The preview hub is a web/PWA-style review deck, not a native iOS simulator stream. It embeds desktop and phone-sized web app panels.

## Current Worktree State

The active app repo is dirty. Codex observed 42 modified tracked files plus new untracked files.

Largest active change areas:

- Coach API and UI
- Daily Review / Nutrition / Fitness detail surfaces
- Grocery list table and Coach grocery artifacts
- Workout database, workout detail, live workout route
- Settings and onboarding profile/target logic
- Seed data expansions for foods, recipes, and workouts
- Preview dashboard and launch preflight route
- Supabase coach artifact migrations

Do not run destructive git commands. Do not reset. Do not checkout over files. Treat uncommitted changes as user/Codex work in progress.

Recent local commit history at the time of this packet:

```text
df7d474 Build personalized coach engine
01c7b68 Polish pilot preview chrome and workout cards
1a35806 Restore workout page detail layout
4547ab4 Polish progress coach and workout flows
c0f5699 Add multimodal coach attachments
```

## Product Direction And Rules

FuelWell product framing:

- Daily decision system.
- Nutrition plus fitness plus recovery, not just macros.
- Coach should be able to act on app data, not just chat.
- App should be previewable by Robert and Max without friction.
- Preserve FuelWell visual language: mint/white surfaces, dark green decision panels, rounded but crisp cards, strong icons, soft shadows, premium health-app feel.
- Use local design tokens and existing component shapes. Avoid one-off hardcoded styling when tokens/helpers exist.

Important repo rules from `AGENTS.md`:

- This repo uses Next.js 16. Read relevant docs under `node_modules/next/dist/docs/` before code changes if touching framework behavior.
- Run lint/build and screenshot QA for affected UI routes.
- Do not production deploy, open PRs, schedule jobs, use paid API calls beyond normal dev testing, send external messages, or change live user data without explicit user confirmation.
- Coach must isolate per-user data by authenticated `user_id`.
- Coach actions that change app state must use explicit tool/action paths, be audit logged, and require confirmation for destructive or high-impact edits.
- Seed gates in `AGENTS.md`: ingredient/food count >= 500, recipe count >= 150, workout count >= 100.

Note: `CLAUDE.md` in the active app repo currently points to `AGENTS.md`.

## Important Routes

Product app routes:

- `src/app/app/dashboard/page.tsx`
- `src/app/app/dashboard/score/page.tsx`
- `src/app/app/daily-review/page.tsx`
- `src/app/app/nutrition/page.tsx`
- `src/app/app/fitness/page.tsx`
- `src/app/app/log/page.tsx`
- `src/app/app/coach/page.tsx`
- `src/app/app/coach/attachments/page.tsx`
- `src/app/app/coach/menu-review/page.tsx`
- `src/app/app/workouts/page.tsx`
- `src/app/app/workouts/[id]/page.tsx`
- `src/app/app/workouts/[id]/live/page.tsx`
- `src/app/app/recipes/page.tsx`
- `src/app/app/meal-plan/page.tsx`
- `src/app/app/grocery-list/page.tsx`
- `src/app/app/progress/page.tsx`
- `src/app/app/profile/page.tsx`
- `src/app/app/settings/page.tsx`
- `src/app/app/onboarding/page.tsx`
- `src/app/app/recovery/page.tsx`
- `src/app/app/launch-preflight/page.tsx`

Preview and API routes:

- `src/app/preview/page.tsx`
- `src/app/api/coach/turn/route.ts`
- `src/app/api/coach/artifacts/`
- `src/app/api/launch-preflight/`

## Important Component And Library Files

Coach:

- `src/app/app/coach/page.tsx` - Coach chat UI, action drawer, composer, artifacts.
- `src/app/api/coach/turn/route.ts` - SSE turn endpoint, Anthropic calls, deterministic confirmed tool execution.
- `src/lib/coach/client-store.ts` - Client-side Coach state, queued turns, action labels.
- `src/lib/coach/system-prompt.ts` - Core Coach instruction framing.
- `src/lib/coach/tools/` - Tools for meals, groceries, workouts, recipes, preferences, progress.
- `src/lib/coach/persistence.ts` - Persistence and audit handling.
- `src/lib/coach/types.ts` - Shared Coach data types.
- `src/components/coach/artifacts/` - Rich Coach response cards.

Grocery:

- `src/app/app/grocery-list/page.tsx` - Grocery table, recipe filters, store mode.
- `src/lib/use-grocery-list.ts` - Shared grocery store used by Coach and Grocery page.
- `src/lib/grocery-normalization.ts` - New helper that normalizes item names and quantities.
- `src/components/coach/artifacts/GroceryListCard.tsx` - Coach grocery action card.

Nutrition / Daily Review:

- `src/components/daily-detail/detail-surfaces.tsx`
- `src/components/daily-detail/calorie-balance-chart.tsx`
- `src/components/daily-detail/nutrition-edit-panel.tsx`
- `src/lib/use-day-log.ts`
- `src/lib/macros.ts`

Workouts:

- `src/components/workouts/workouts-view.tsx`
- `src/components/workouts/live-workout-session.tsx`
- `src/components/workouts/workout-log-actions.tsx`
- `src/lib/workout-library.ts`
- `src/lib/workout-estimates.ts`
- `src/lib/exercise-diagrams.ts`
- `src/lib/use-workout-log.ts`

Progress:

- `src/components/progress/macro-stacked-bars.tsx`
- `src/components/progress/series-toggle.tsx`
- `src/components/progress/sample-history.ts`

Settings and profile:

- `src/components/settings/settings-client.tsx`
- `src/components/settings/coach-activity.tsx`
- `src/components/settings/use-units.ts`
- `src/lib/preferences-sync.tsx`
- `src/lib/use-preferences.ts`

Seed data:

- `src/lib/food-database.ts`
- `src/lib/recipes-data.ts`
- `src/lib/workout-library.ts`

Preview/session:

- `src/lib/preview-session.ts`
- `src/lib/supabase/middleware.ts`
- `src/components/preview/route-health-console.tsx`
- `src/lib/launch-preflight.ts`

## Current Recent Changes To Understand

Codex has been implementing a long-running UI/product enhancement pass based on user feedback, design mockups, and synthetic-user findings.

Recent themes already represented in the dirty worktree:

1. Coach now supports richer artifacts, multimodal attachments, menu review, grocery/workout/meal actions, and action drawers.
2. Coach action buttons were being displayed as raw messages like `[BUTTON TAP] Execute ...`; recent changes partially route confirmed tool actions directly through `/api/coach/turn` so they summarize cleanly instead.
3. The Coach right-side action surface is being changed from duplicate inline + side cards into a single sliding/collapsible action drawer.
4. Grocery items are being normalized so `add five bananas` becomes item name `Bananas` with quantity `5`, not `bananas (5)`.
5. Grocery list is moving toward a proper table with quantity controls, recipe filters, serving size, category/classification, vitamin benefit, and editable rows.
6. Daily Review is being segmented into collapsible sections: summary, energy ledger, and details/logs.
7. Nutrition and Fitness detail pages are being aligned visually as clean ledger pages with top summary cards and editable detail sections.
8. Workouts have expanded toward a denser database table, Coach recommendation logic, workout detail pages, diagrams, and live workout sessions with set tracking.
9. Settings and onboarding were expanded for body metrics, units, goal aggressiveness, privacy/account controls, and profile editing.
10. Seed data has been expanded: foods, recipes, workouts.
11. Supabase migrations exist for Coach uploaded artifacts and privileges but need environment verification before applying.

Important: Some of these changes may be only partially complete. Verify in the UI and with lint/build before assuming.

## 100-Agent Simulation Context

Robert asked Codex to run 100 simulated users through the app and identify at least 15 improvements per user, then implement them.

Codex launched parallel batches. Completed batches included:

- Onboarding/dashboard/log/coach/workouts/settings findings.
- Dashboard/daily review/nutrition/fitness/progress findings.
- Coach-heavy findings.
- Recipes/log/grocery/meal-plan findings.
- Workouts/fitness/live-workout/coach-workout findings.
- Accessibility findings.
- Competitor/production-grade comparison findings.

Known repeated findings:

- Header/greeting/date should use live local time, not hardcoded copy.
- Coach must not expose raw tool text or model errors.
- Coach action drawer should avoid duplicate inline plus right-side components.
- Coach needs better upload/file progress, file privacy/retention notes, and mobile action sheet.
- Coach should persist signed-in meals, workouts, groceries, body logs, and actions server-side.
- Grocery names need title casing and separate quantities.
- Grocery page needs editable table rows, recipe filters, undo for bulk actions, and clearer store mode.
- Daily Review needs collapsible segmented sections, shorter energy-ledger height, and accessible hover/focus tooltips.
- Nutrition/Fitness detail pages need add/edit/delete controls and larger KPI labeling.
- Workouts need a denser database, filters, live workout mode, exercise diagrams, and closer close-match logic.
- Settings needs stronger privacy/account/export/delete pathways.
- Accessibility issues include skip link, focus management, semantic tables, contrast, reduced motion, larger tap targets, and keyboard-friendly filters.

Do not treat the 100-agent pass as fully closed until you have a durable workbook/backlog and a verifier report. If the previous agent outputs are not accessible, rerun a smaller structured simulation and write the backlog to `output/`.

## High-Priority Resume Plan

1. Stabilize current worktree.
   - Run lint/build.
   - Fix TypeScript or lint failures first.
   - Smoke test `/preview`, `/app/dashboard`, `/app/coach`, `/app/grocery-list`, `/app/daily-review`, `/app/workouts`, `/app/workouts/[id]`, `/app/workouts/[id]/live`, `/app/log`, `/app/settings`.

2. Finish Coach action flow.
   - Ensure no raw `[BUTTON TAP]` text appears.
   - Ensure confirmed card actions execute directly and summarize cleanly.
   - Ensure Coach action drawer slides over the chat from the right, can collapse to the right edge, and does not duplicate the same component inline.
   - Ensure grocery action cards title-case item names and show quantity in a separate column.
   - Fix the Anthropic assistant-prefill error: “This model does not support assistant message prefill. The conversation must end with a user message.”

3. Finish Grocery polish.
   - Apply the intended jute/light-brown textured table surface under the grocery table.
   - Keep the grocery table editable, compact, and readable.
   - Add recipe source filters with useful counts.
   - Add undo/confirmation for clear list and mark all shopped.
   - Implement or clearly label Keep Screen Awake using the Wake Lock API.

4. Finish Daily Review segmentation.
   - Clear visible section titles.
   - Collapse/expand controls for energy ledger and details.
   - Clean border/gap between energy ledger, nutrition log, and fitness log.
   - Hover/focus tooltips should not require click for desktop and should have tap fallback for mobile.

5. Finish Workout details.
   - Workout detail should show the whole workout before starting.
   - Add `Start workout` CTAs with a clock/play icon in the hero and exercise detail area.
   - Exercise rows need set, reps, time, optional weight, notes, and diagram/magnifier affordances.
   - Live workout page should support checkoffs and progress meter.
   - Close matches should be truly similar by type/body part/equipment/goal.

6. Persist and audit real actions.
   - Signed-in Coach changes should persist to Supabase where applicable.
   - Preview/local paths should be visibly marked as preview/local.
   - Check `src/lib/coach/persistence.ts`, `src/lib/coach/apply-mutation.ts`, and migrations.

7. Accessibility pass.
   - Add semantic captions/scoped headers to tables.
   - Improve focus management for drawers/modals.
   - Add skip link and stronger focus outlines.
   - Respect reduced motion.
   - Increase small label/text sizes where practical.

8. Verification and preview.
   - Run `npm run lint`.
   - Run `npm run build`.
   - Run `npm run test:unit` if feasible.
   - Run `npm run verify:coach` and then `npm run verify:coach:smoke` if local server/browser are available.
   - Start preview locally with preview flags and capture screenshots to `output/playwright/`.
   - Only deploy to Vercel after Robert explicitly asks or confirms.

## Commands

Local dev:

```bash
npm run dev -- --port 3010
```

Local preview mode:

```bash
FUELWELL_PREVIEW_MODE=true NEXT_PUBLIC_FUELWELL_PREVIEW_MODE=true npm run dev -- --port 3010
```

Verification:

```bash
npm run lint
npm run build
npm run test:unit
npm run verify:coach
npm run verify:coach:smoke
```

Preview link checks:

```bash
curl -I -L --max-time 20 https://fuelwell-preview.vercel.app/preview
curl -I -L --max-time 20 https://fuelwell-preview.vercel.app/app/dashboard
```

## Supabase Notes

Migrations present:

- `supabase/migrations/20260611180000_base_schema.sql`
- `supabase/migrations/20260611180100_coach_tables.sql`
- `supabase/migrations/20260612120000_profiles_preferences_jsonb.sql`
- `supabase/migrations/20260612170000_goal_loop_integrations.sql`
- `supabase/migrations/20260620170000_coach_knowledge_bases.sql`
- `supabase/migrations/20260627042014_coach_uploaded_artifacts.sql`
- `supabase/migrations/20260627043000_tighten_coach_artifact_privileges.sql`

Before applying any migration:

- Confirm target project/environment.
- Confirm Robert approved applying it.
- Back up or inspect current schema state.
- Re-run the coach verifier after migration.

## Vercel Notes

Stable project alias:

```text
https://fuelwell-preview.vercel.app
```

Do not deploy blindly. Robert often asks for preview deployment, but repo instructions still require confirmation before outward-facing launches unless the current user message explicitly grants it.

## Known User Preferences

Robert prefers:

- A working preview over abstract summaries.
- Direct implementation over “here is a plan,” unless he explicitly asks for a plan or handoff.
- Polished UI details: borders, shadows, component shape, spacing, typography, icons, state feedback.
- Non-technical explanations in updates.
- Durable artifacts: workbooks, reports, screenshots, preview links, handoff docs.
- Safe behavior around live systems, credentials, data deletion, production deploys, TestFlight, and PR merges.

## Current Risk Register

Highest risk:

- Dirty worktree with many interdependent edits.
- Multiple FuelWell repos with similar names.
- Coach changes can break streaming/SSE or create model-call errors.
- Preview can appear live while not containing latest local changes.
- Supabase migrations may not be applied to the same environment as preview.
- iOS/TestFlight state is separate from the web preview and needs separate verification.

Avoid:

- `git reset --hard`
- `git checkout -- <file>`
- broad rewrites across many routes before lint/build passes
- claiming TestFlight/live deployment unless verified
- editing the marketing `website` repo when the product app is intended

## Suggested First Message Back To Robert After Claude Starts

“I found the active FuelWell product app at `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration` on `feature/fw-design-system-v2`. The public preview links are reachable, but the local app worktree has many uncommitted changes, so I’m stabilizing lint/build first and then I’ll continue the Coach, Grocery, Daily Review, and Workout polish from the current Codex state.”


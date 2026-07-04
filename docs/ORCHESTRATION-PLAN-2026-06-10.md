# FuelWell Autonomous Improvement Session — Final Master Plan

**Date:** 2026-06-10 · **Run on:** Robert's Mac, Claude Code, in the orchestration worktree
**Worktree:** `/Users/robert.barbieri/.claude/projects-workspace/Fuelwell-product-orchestration`
**Branch:** `feature/fuelwell-app-orchestration` (UNPUSHED — 4 commits exist only locally)
**Preview truth:** https://fuelwell-preview.vercel.app/preview

Kickoff (paste into Claude Code on the Mac):

```
/goal Implement all Robert+Max meeting decisions (2026-06-09) in the FuelWell web app, run autonomous UI polish loops, and redeploy the preview so https://fuelwell-preview.vercel.app/preview shows the latest app. DONE means: (1) all 12 product changes in Section C verified live, (2) Health Score de-emphasized to a compact secondary surface (NOT removed), (3) lint+build green, (4) Playwright smoke suite green, (5) preview verified in a real browser at desktop AND 375px width, (6) all three OAuth buttons (Google/Facebook/Apple) reach real consent screens, (7) handoff doc updated.

Read docs/ORCHESTRATION-PLAN-2026-06-10.md from the feature/food-database branch on origin and execute it end-to-end.
```

---

## Context to load first

- Read `HANDOFF20260610fuelwellapporchestration.md`, `PLAN.md`, `src/lib/fuelwell-data.ts`
- North star: every screen answers "What should I do right now?"
- Standing rules: no fake positivity for empty users · no dead controls · metrics explainable/drillable/consistent · preview bypass never leaks to production auth · don't touch the sibling `Fuelwell/website` checkout
- **Auth providers are LIVE in Supabase** (project `xzsftuxvnkgxtbiibvac`, ACTIVE_HEALTHY): Google, Facebook, Apple all configured 2026-06-10. Apple Services ID `com.fuelwell.auth`, Key ID `43S8XM67WT`, OAuth secret expires 2026-12-08 (set a renewal reminder in the handoff). Callback: `https://xzsftuxvnkgxtbiibvac.supabase.co/auth/v1/callback`. Details: `~/Desktop/FuelWell-Auth-Setup-Complete.md`.
- **Note:** the Supabase project was found PAUSED on 2026-06-10 (the real cause of Google sign-in failing in the meeting). It is restored. Free tier re-pauses after ~7 days idle — recommend Pro upgrade before pilot; flag in handoff.

## Section A — verify before building (sequential)

- A1. `git status`; confirm branch + clean tree. **PUSH THE BRANCH FIRST** (`git push -u origin feature/fuelwell-app-orchestration`) — the 4 local commits are the only copy of the preview-hub work. If push fails after 2 retries, log and continue, but flag prominently.
- A2. `git fetch origin feature/food-database` and **merge it** — it contains `src/lib/food-database.ts` (494 curated foods, searchFoods/macrosForPortion/filterFoods API — W1's content lift, pre-built) and this plan file.
- A3. `npm run lint && npm run build` — green before any edit.
- A4. Smoke local dev + live preview: /app/dashboard, /app/nutrition, /app/log, /app/coach, /app/progress, /app/workouts.
- A5. Persist Vercel env vars on fuelwell-preview (FUELWELL_PREVIEW_MODE, NEXT_PUBLIC_FUELWELL_PREVIEW_MODE, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).

## Section B — branding + simplification baseline (sequential, global files)

- B1. **DE-EMPHASIZE HEALTH SCORE (keep, don't remove — Robert amendment).** Demote from dashboard hero to a compact secondary chip/row (small score + trend arrow, tap → /app/dashboard/score). Hero slot goes to the daily verdict CTA + energy summary. Keep score detail page fully functional. Coach references score only when asked. One compact mention max on progress/profile. Visual hierarchy change only — no feature flag, no deletion.
- B2. Brand pass: logo in app shell + auth pages, lighter green palette (#47E7B0 family — Max wants relaxed/less intimidating), reduce text/number density (Max: "overwhelming amount of text and numbers"). Verdicts and words above the fold; numbers below.
- B3. Colorful bottom-nav icons at phone width — tasteful.
- B4. Commit.

## Section C — meeting decisions (Workflow tool: parallel build agents, one per workstream, each adversarially verified by a second agent)

- **W1 — Food logging core:** wire `src/lib/food-database.ts` (merged in A2) into /app/log: ranked autocomplete via `searchFoods()`, one-tap portions via `commonServings` + `macrosForPortion()`. "Add your own meal" button ON the log screen (name, portion, cal/P/C/F). Inline edit of logged meals. Photo/barcode → honest "coming soon" states with search as the alternative.
- **W2 — Preferences + filters:** diet chips via `filterFoods()` (high-protein/low-carb/low-fat/vegan) + allergy-aware. Like/dislike icons on food + recipe cards; persist; downrank disliked; show "Because you liked…".
- **W3 — Recipes:** live search-as-you-type (name + ingredients + tags). Recipe detail: full measurements + per-serving nutrition. W2 filters apply.
- **W4 — Workouts redesign:** two paths up top — "Pick my own" (table w/ Upper/Lower/Full body filter buttons) vs "Coach recommends" (one tap → today's workout + reasoning line). Soften terminology.
- **W5 — Progress upgrade:** stacked bar graph (daily calories segmented fat/carb/protein), user-customizable series + window (7d/30d), softer no-guilt language (trends not judgments).
- **W6 — Coach logging:** log meals AND workouts from chat without leaving the coach page (parse → confirm chip → saved → totals update everywhere). Quick prompts adapt to today's data. Coach routes to all surfaces.
- **W7 — Auth + onboarding:** Google/Facebook/Apple buttons on login/signup via `supabase.auth.signInWithOAuth` — all three providers are configured and live; test each reaches its consent screen end-to-end. Intake form: complete /app/onboarding (goal, body, dietary, lifestyle), skippable-resume. Non-preview users hit login; truthful empty states for new users.
- **W8 — Settings page:** new /app/settings — account, preferences (units, dietary), notifications placeholder, data export placeholder, sign out, about/version. Linked from profile + nav.

After all merge: lint + build; commit per workstream.

## Section D — data consistency gate (sequential)

- D1. One source of truth: dashboard totals, nutrition detail, Today's Plate, log entries, coach answers derive from the same store.
- D2. Playwright smoke: preview redirect; auth protection; live log search; custom meal updates totals; coach chat-log creates entry; workout filters; stacked bars render; settings loads; Health Score appears ONLY as compact chip + detail page; all three OAuth buttons present.
- D3. Green → commit.

## Section E — UI polish loops (/loop, min 3 iterations, stop when <3 findings)

Each iteration: (1) play user in a real browser at desktop + 375x812 — busy adult who wants to eat better; every screen: is the next action obvious? anything dense/dead/ugly/contradictory? what's missing that a $30/mo subscriber expects? (2) record findings; (3) fix everything fixable; implement bigger ideas (new screens allowed) if they serve the daily-decision north star; (4) lint/build/re-walk/screenshot; (5) commit "Polish pass N".

Candidates to evaluate: Daily Recap surface · hydration quick-log · "5 of last 7 days logged" consistency view (no gamification chrome) · "Eating out right now" quick action · per-meal verdict chips · undo snackbar · data-freshness stamps · keyboard/a11y pass.

## Section F — ship + verify + handoff (sequential)

- F1. Final lint + build + Playwright.
- F2. Push branch (retry w/ backoff; document if blocked).
- F3. `vercel --prod --yes` on fuelwell-preview; confirm env vars persisted.
- F4. LIVE verify in a real browser at both widths: /preview panels; dashboard (compact score chip, verdict hero); log (autocomplete from the 494-food DB + add custom meal); coach (chat-log a meal); workouts (category filter); progress (stacked bars); settings; login (all three OAuth buttons reach consent screens).
- F5. Write `HANDOFF-2026-06-<date>.md`: per-workstream results, polish findings, deferred items, deployment id, evidence, Apple OAuth secret renewal date (2026-12-08), Supabase Pro upgrade recommendation.
- F6. Report against the /goal DoD item by item.

## Rules of engagement

- Health Score: de-emphasize, never remove, never re-promote during polish loops.
- No dead controls. Coach voice: never "you missed/skipped/went over."
- Additive Supabase changes only. Preview bypass stays scoped.
- Small verified commits; lint+build before each.
- Blocked >2 retries on anything external → log and keep building.

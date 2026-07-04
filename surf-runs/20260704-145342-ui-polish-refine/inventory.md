# FuelWell surf run — Phase 1 inventory (UI polish aspect)

Date: 2026-07-04 · Base: `origin/main` @ 3103286 · Branch: `surf/ui-polish-refine`
Dev server: `npm run dev` → http://localhost:3000 (preview mode: no Supabase env → sample
data via `src/lib/preview-session.ts`, SAMPLE_USER "Alex Preview").

## Stack
Next.js 16.2.1 (App Router, Turbopack), React 19.2.4, Tailwind v4 (tokens inline in
`src/app/globals.css`), @base-ui/react dialogs, lucide-react icons, framer-motion,
react-hook-form+zod in deps but forms are mostly hand-rolled useState. Package manager:
**bun** (bun.lock is canonical; `npm run` works for scripts). Scripts: `dev`, `build`,
`start`, `lint`, `test:website` (vitest).

## Surface (all routes verified 200 in preview mode)
- Marketing: `/` (landing). Auth: `/login`, `/signup`, `/forgot-password`.
- Preview hub: `/preview` (QA/demo hub + route-health console), `/preview/new-user`, `/ios-preview`.
- App (25 screens): dashboard (+/score), nutrition, fitness, log, meal-plan, recipes,
  grocery-list, workouts (+[id], +[id]/live), activity, recovery, progress, daily-review,
  coach (+attachments, +menu-review), onboarding, profile, settings, launch-preflight.
- Layout: desktop sidebar (resizable 260–420px, collapsible), mobile bottom nav (6 tabs),
  mobile header, floating user menu (fixed bottom-right z-70 on desktop).

## Design system
- Tokens in `globals.css` (~326 lines): Lagoon green primary (#1eae84 family), coral accent
  (#df6345), sky/lemon secondaries, macro colors (protein green / carbs lemon / fat coral).
  Fonts: Hanken Grotesk (body), Quicksand (display), Geist Mono. Radius scale 0.45–1.5rem.
  Custom utilities: `.fw-app-surface`, `.fw-page-header`, `.fw-dark-panel`, `.fw-soft-row`,
  `.fw-icon-chip`, `.tabular-nums`, `.safe-area-bottom`.
- Global `:focus-visible` outline (2px primary-600). Button has focus-visible ring; Input
  has aria-invalid/aria-describedby error wiring; Dialog (base-ui) has focus trap.
- ~143 aria-* usages, 8 sr-only, EmptyState + Skeleton primitives exist.
- Dark mode tokens exist (`.dark`, oklch) but no toggle; system preference only; adoption
  across custom utilities unverified.

## Cross-cutting gaps found in Phase 1 (candidates, to be confirmed by swarm)
1. **No `prefers-reduced-motion` handling anywhere** (0 grep hits) — transitions,
   animate-pulse/spin run unconditionally.
2. **Unit/format bugs:** dashboard Macros row renders "850 / 2250g" for *Calories*
   (grams unit on kcal). Greeting said "Good evening" at ~3pm and "Tuesday" — day/date
   logic suspect (or sample-data hardcode).
3. `/api/coach/history` and `/api/coach/audit` **500 in preview mode** (create Supabase
   client without `hasSupabaseConfig()` guard) — console errors on /app/coach.
4. No debounce on food search; no aria-live announcements for async updates; success
   feedback after logging a meal is unverified.
5. Contrast risks: neutral-500/primary-700 text on primary-50 backgrounds; low-contrast
   subtitle text in frosted headers.
6. Inconsistent radii (named vs arbitrary like `rounded-[1.35rem]`, `rounded-[2rem]`),
   scattered one-off shadows, mixed hex/oklch.
7. Forms: no required indicators, validation mostly on submit/step-transition, onboarding
   lacks per-field errors and progress "step X of Y" copy; number inputs unformatted.
8. User menu: outside-click/Escape close unverified; destructive "Delete account" flow
   confirmation unverified; logout has no confirm.
9. Icon-only buttons partially unlabeled; alt text sparse; sidebar collapsed state relies
   on title attr.
10. Mobile: duplicated greeting/avatar controls on dashboard (header + in-page rows);
    touch targets of inline edit buttons likely <44px; long-text truncation untested.

## Baseline evidence
`evidence/before/` — 52 full-page screenshots (26 routes × desktop 1440×900 + iPhone
390×844) + `capture-manifest.json`. All routes 200; no horizontal scroll detected at
either viewport; 2 console errors per viewport (the coach API 500s above).

## Who actually uses this project, and for what?
FuelWell is a consumer AI-nutrition-coach product (web + iOS sibling) pre-launch (v1.4 in
progress; launch "Fall 2026"). Real users: (a) **Intentional Beginners** — 25–38
professionals who abandoned MFP-style apps; (b) dietary-restricted users (vegan/keto/
allergies — safety-relevant); (c) 40–55 metabolic-change users; (d) adaptive athletes;
(e) postpartum/recomposition users; (f) internally: founders, QA/beta testers, investors,
and reviewers walking `/preview` before launch. Jobs-to-be-done: log meals in <10s; ask
the coach personalized food questions; glance-check remaining macros; plan meals/recipes/
groceries; track workouts/activity/recovery; review progress and daily recap; onboard and
maintain profile/settings; evaluate product quality via the preview hub.

Persona roster: see `personas.md` (P01–P80, sets S01–S20).

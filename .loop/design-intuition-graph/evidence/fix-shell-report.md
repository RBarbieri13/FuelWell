# fix-shell — implementation report

Node: `fix-shell` (design-intuition graph). Implements audit-shell.md findings on the
shared shell surfaces only: `src/components/layout/*`, `src/components/ui/*` (none needed),
`src/app/app/layout.tsx`. Verified against the shared dev server at http://localhost:3000
(preview mode — no local Supabase config). All measurements below are from Playwright
(chromium), desktop 1280x800 / mobile 390x844 (isMobile, touch, DPR 2).

## Per-finding before → after

### F1 (MAJOR) — Settings unreachable at 800px-tall desktop — FIXED, measured
- Before: `aside nav a[href="/app/settings"]` rect top=797 / bottom=853 in an 800px
  viewport; nav `overflow-y: visible`, not scrollable. Only ~3px of the row clickable.
- Fix: nav gets `min-h-0 flex-1 overflow-y-auto`; per-item height `min-h-14 py-3.5
  space-y-2` → `min-h-12 py-2.5 space-y-1.5` (48px rows, still ≥44px touch/click target);
  logo header compacted (`h-16 w-16` tile / `px-7 py-8` → `h-12 w-12` / `px-6 pt-6 pb-4`).
- After (measured): 1280x800 → Settings top=638 / bottom=686, fully visible with ~114px
  to spare, `overflow-y: auto`. 1280x700 → nav `scrollHeight > clientHeight` (scrollable)
  and Settings fully visible after scroll (top=638 / bottom=686). Any shorter viewport
  degrades to scrolling instead of clipping. Collapsed state: Settings visible at 800px
  (measured `settingsVisible: true`).
- Evidence: `fix-shell-before-desktop-sidebar-1280x800.png` vs
  `fix-shell-after-desktop-sidebar-1280x800.png`.

### F2 (MAJOR) — Workouts/Move/Fitness/Activity naming — FIXED on shell surfaces
- Before: mobile tab "Move" → /app/workouts; sidebar "Workouts"; header chip "Move";
  /app/fitness chip "Progress · Activity".
- After: one name per destination on every shell surface (see naming table). Measured:
  /app/workouts on mobile → tab "Workouts" active, chip "Workouts".
- No route was renamed → coach `NAVIGATION_MAP` (src/lib/coach/system-prompt.ts) and its
  locked tests need no change; the map documents *sidebar* labels/routes, all unchanged.
  `tests/unit/system-prompt.test.ts` green (see test output).
- Page H1 on /app/fitness ("Fitness detail") is page-node territory — deferred (below).

### F3 (MAJOR) — Dual person icons / no Profile in user menu — FIXED (shell half)
- Before: user menu had 8 items, none of them Profile.
- After: "Profile" (/app/profile) is the first menu item. Measured menu contents:
  Profile, Account Details, Privacy, Coach Preferences, Data Export, Subscription,
  Support (+ preview-session note). The second look-alike control — the dashboard-body
  "A" avatar (dashboard-client.tsx:140) — is dashboard-page territory: deferred (below).
- Evidence: `fix-shell-before-mobile-user-menu-390x844.png` vs
  `fix-shell-after-mobile-user-menu-390x844.png`.

### F4 (MAJOR) — Static "Sign in", one-tap Delete Account, dead floating variant — FIXED
- Auth-aware: `src/app/app/layout.tsx` resolves a session state server-side
  (`authenticated` | `preview` | `anonymous`) via `hasSupabaseConfig()` +
  `supabase.auth.getUser()` + `isPreviewHost()` and passes it down. Menu renders:
  - authenticated → "Sign out" button (mirrors settings-client's sign-out: clears
    user-scoped caches via `clearUserScopedIdentityCaches`/`clearPreferencesForUser`,
    `supabase.auth.signOut()`, push /login + refresh);
  - anonymous → "Sign in" → /login;
  - preview → neither; a "Preview session — changes stay on this device." note instead.
  Measured on the preview dev server: no "Sign in" row (before: always present).
- "Delete Account" removed from the shell menu; it remains findable at
  Settings → Delete account (`/app/settings#delete-account`, section verified present at
  settings-client.tsx:1028) and the menu footer note names account deletion as living in
  Settings. Coach NAVIGATION_MAP already routes deletion questions there — unchanged.
- Dead `floating` variant removed per the audit's fix definition: `UserMenu` no longer
  takes a `variant` prop (its only mount was `variant="inline"` in mobile-header.tsx;
  verified no other importers).
- The layout's previous `bootstrapCoachKnowledge()` side effect is preserved inside
  `resolveSession()` (same `ensureCoachKnowledgeForUser` call for signed-in users).

### F5 (MINOR) — 6 tabs, ambiguous "Review" — PARTIAL (deliberate)
- Removed the duplicated header shortcut (F6) so Daily review has exactly one mobile
  affordance. Kept 6 tabs and the "Review" label: dropping Groceries-vs-Review needs
  usage data the graph doesn't have, and renaming the tab alone ("Check-in"/"Today")
  would recreate the F2 pattern (tab label ≠ sidebar "Daily review" ≠ chip "Daily
  review"; "Today" also collides with the dashboard chip). "Review" is the leading word
  of the destination's name on every other surface. Tab targets remain ≥44px tall;
  "Workouts" (longest new label) fits without truncation at 390px (screenshot).

### F6 (MINOR) — Persistent daily-review clipboard button — FIXED
- Removed the always-on clipboard icon from mobile-header.tsx; the "Review" tab is the
  single path. The freed slot went to the title chip per the audit's suggestion:
  `max-w-[8rem]` → `max-w-[12rem]`.

### F7 (MINOR) — No location state on secondary routes — FIXED (shell nav side)
- Desktop sidebar alias map extended (was fitness→Progress only). Measured active item
  on direct visit: /app/fitness → "Progress", /app/activity → "Progress",
  /app/nutrition → "Log meal", /app/meal-plan → "Recipes".
- Mobile tab aliases added (audit's fix definition: movement cluster lights the
  movement tab). Measured active tab: /app/fitness → "Workouts", /app/activity →
  "Workouts", /app/progress → "Workouts", /app/nutrition → "Log".
- /app/onboarding and /app/launch-preflight intentionally stay unhighlighted (flows,
  not destinations). /app/launch-preflight got a chip title ("Launch preflight") so the
  header no longer falls back to "FuelWell" (part of F8's symptom).

### F8 (MINOR) — Preflight dev-tool link on Coach attachments — DEFERRED (not my territory)
- The link lives in `src/app/app/coach/attachments/page.tsx:144` — coach page-group
  territory. Shell-side symptom (missing chip title) fixed as noted in F7.

### F9 (MINOR) — Coach subpage links hidden on mobile — DEFERRED (not my territory)
- `src/app/app/coach/page.tsx:321,324` (`hidden sm:inline-flex`) — coach page-group.

### F10 (OPPORTUNITY) — Collapsed rail overlap + width — FIXED, measured
- Before: collapsed width 104px; expand button absolutely positioned at
  `left-[4.5rem] top-6`, overlapping the logo tile.
- After: rail `md:w-[4.5rem]` (measured 72px); collapsed header stacks logo tile and
  toggle vertically in flow (no absolute positioning). Measured: toggle/logo bounding
  boxes do not intersect (`toggleOverlapsLogo: false`); Settings visible collapsed.
- Evidence: `fix-shell-after-desktop-sidebar-collapsed.png`.

### F11 (OPPORTUNITY) — Resize affordance resets on reload — FIXED (persisted)
- Kept the affordance (removal would be a behavior change beyond the finding); width and
  collapsed state now persist to localStorage (`fw-sidebar-width`,
  `fw-sidebar-collapsed`), read post-hydration (project's established
  eslint-disable pattern for `react-hooks/set-state-in-effect`, cf. signup/page.tsx:47).
- Measured: collapse → reload → rail still 72px, `fw-sidebar-collapsed: "true"`.

### F12 (OPPORTUNITY) — Dashboard-only search/avatar masquerading as chrome — DEFERRED
- The audit's cheaper fix ("drop the avatar — Profile is already in the sidebar")
  touches `dashboard-client.tsx:135,141` — dashboard page-group territory. Shell
  prerequisite done: Profile now reachable from the mobile user menu, and the dead
  desktop floating UserMenu is removed, so the page node can simply drop the
  dashboard-only controls without losing any path.

## Naming decision table (old → new per surface)

| Destination | Desktop sidebar | Mobile tab | Mobile header chip | Page H1 |
|---|---|---|---|---|
| /app/workouts | Workouts (kept) | **Move → Workouts** | **Move → Workouts** | "Workouts" (already, unchanged) |
| /app/fitness | highlights Progress (kept) | none → **highlights Workouts** | **"Progress · Activity" → "Activity detail"** | "Fitness detail" — DEFERRED to fitness/progress page node (recommend "Activity detail" to match chip) |
| /app/activity | none → **highlights Progress** | none → **highlights Workouts** | "Activity" (kept) | page territory, unchanged |
| /app/progress | Progress (kept) | none → **highlights Workouts** | "Progress" (kept) | unchanged |
| /app/nutrition | none → **highlights Log meal** | none → **highlights Log** | "Nutrition" (kept) | unchanged |
| /app/meal-plan | none → **highlights Recipes** | no tab (kept) | "Meal plan" (kept) | unchanged |
| /app/daily-review | Daily review (kept) | Review (kept — see F5 rationale) | "Daily review" (kept) | unchanged |
| /app/launch-preflight | none (intentional) | none | **fallback "FuelWell" → "Launch preflight"** | unchanged |

Model: **Workouts** = the movement library/logging cluster (tab + sidebar);
**Progress** = trends; fitness/activity are detail subpages (desktop → Progress; mobile,
which has no Progress tab, → Workouts per the audit's fix definition). No routes renamed;
coach NAVIGATION_MAP and its tests untouched and green.

## Files changed

- `src/app/app/layout.tsx` — session resolution (`authenticated`/`preview`/`anonymous`)
  passed to MobileHeader; preserves the coach-knowledge bootstrap.
- `src/components/layout/sidebar.tsx` — scrollable compact nav (F1), alias map (F7),
  collapsed rail 72px with in-flow toggle (F10), width/collapse persistence (F11).
- `src/components/layout/mobile-nav.tsx` — "Move" → "Workouts" (F2), tab alias map (F7).
- `src/components/layout/mobile-header.tsx` — chip renames + preflight title (F2/F7/F8
  symptom), clipboard shortcut removed + wider chip (F6), session prop pass-through (F4).
- `src/components/layout/user-menu.tsx` — Profile first (F3), Delete Account removed,
  auth-aware Sign in/Sign out/preview note with real sign-out flow (F4), floating
  variant deleted (F4/F12), `text-[#16302a]` → `text-foreground` (3x, tokenization).

No `src/components/ui/*` changes were needed. No page directories touched.

## Ruleset compliance

- No new hex/radius/shadow literals; reused dominant values (`rounded-[1rem]`,
  `rounded-[1.25rem]`, `rounded-[0.95rem]`, existing shadow strings). Hex occurrences in
  tsx/ts (B1-style count, excluding globals.css) went 427 → 426 in my diff's scope
  (three `text-[#16302a]` → `text-foreground`).
  (Note: the ruleset's absolute B2/B4 numbers don't reproduce on current `main` —
  25→29 hex values / 28→67 shadow strings pre-existing my change, likely because the
  ruleset was extracted on `surf/ios-responsive-ux-recovery`. My diff adds zero new
  values of either kind — verified by grepping the diff itself.)
- Touch targets: all interactive shell controls ≥44px on mobile (menu button 44px, tab
  targets unchanged height); desktop sidebar rows 48px.
- lucide-react only; `aria-current`, `aria-label`s, safe-area padding, `min-h-11` count
  (47) all preserved.

## Test / verification output

- `pnpm lint` — clean (0 errors, 0 warnings).
- `pnpm exec tsc --noEmit` — clean.
- `pnpm vitest run tests/unit` — **39 files, 333 tests, all passed** (incl. the
  system-prompt navigation-map canary).
- `pnpm playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts` —
  **4 passed, 12 skipped** (the 12 agentic tests self-skip without paid-API keys —
  identical skip set to baseline; the deterministic subset is fully green).
- Console errors: **zero** across /app/dashboard, /app/settings, /app/workouts,
  /app/fitness, /app/activity, /app/progress, /app/nutrition, /app/meal-plan at both
  1280x800 and 390x844 (tracked `console.error` + `pageerror` during all runs).

## Screenshots (this directory)

- `fix-shell-before-desktop-sidebar-1280x800.png` / `fix-shell-after-desktop-sidebar-1280x800.png`
- `fix-shell-before-desktop-settings-1280x800.png` / `fix-shell-after-desktop-settings-1280x800.png`
- `fix-shell-before-mobile-dashboard-390x844.png` / `fix-shell-after-mobile-dashboard-390x844.png`
- `fix-shell-before-mobile-user-menu-390x844.png` / `fix-shell-after-mobile-user-menu-390x844.png`
- `fix-shell-before-mobile-workouts-390x844.png` / `fix-shell-after-mobile-workouts-390x844.png`
- `fix-shell-after-desktop-sidebar-collapsed.png` (F10)
- `fix-shell-after-mobile-fitness-alias.png` (F7 tab alias + "Activity detail" chip)

## Items deferred to other nodes (with reasons)

| Item | Finding | Owner | What's needed |
|---|---|---|---|
| Retitle /app/fitness H1 "Fitness detail" → "Activity detail" | F2 | fitness/progress page node | Match the new shell chip; shell side already renamed. |
| Remove/merge dashboard "A" avatar + search circle (dashboard-client.tsx:135-141) | F3, F12 | dashboard page node | Profile now lives in the user menu and sidebar; the dashboard-only controls can be dropped (audit's preferred F12 fix) without losing any path. |
| Gate "Open preflight" link (coach/attachments/page.tsx:144) behind preview/dev | F8 | coach page node | Shell chip fallback fixed; the link itself is page code. |
| Mobile-visible Coach subpage links (coach/page.tsx:321,324 `hidden sm:inline-flex`) | F9 | coach page node | Needs an on-page overflow/stacked-link treatment. |
| Tab-count reduction to 5 (drop Groceries or Review) | F5 | coherence/orchestrator | Product call requiring usage data; duplication half of F5 resolved via F6. |

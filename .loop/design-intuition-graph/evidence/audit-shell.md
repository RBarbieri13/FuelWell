# audit-shell — App shell walkthrough (first-time-user lens)

Method: Playwright (chromium) against the running dev server at http://localhost:3000,
anonymous preview mode. Desktop 1280x800 and mobile 390x844 (isMobile, touch, DPR 2).
Every sidebar item and every tab-bar item was actually clicked and the resulting URL,
active state, and page heading recorded. Every one of the 17 routes was visited directly
at both viewports. Scripts: scratchpad `audit-shell.mjs`, `audit-shell2.mjs`, `audit-shell3.mjs`.

Shell composition (src/app/app/layout.tsx): `Sidebar` (desktop only, `hidden md:flex`),
`MobileHeader` + `MobileNav` (both `md:hidden`). There is **no desktop shell header** —
the search/avatar controls seen top-right on the dashboard are dashboard-page content,
not shell chrome.

---

## Route classification table

All 17 routes returned HTTP 200. "Sidebar active" / "tab active" = what actually
highlighted when the route was visited directly (measured, not assumed).

| Route | Desktop sidebar | Mobile tab bar | Sidebar active on visit | Classification | Click path evidence |
|---|---|---|---|---|---|
| /app/dashboard | Yes ("Dashboard", pos 1) | Yes ("Home") | Dashboard | In nav | — |
| /app/daily-review | Yes ("Daily review", pos 2) | Yes ("Review") + header clipboard shortcut | Daily review | In nav (duplicated on mobile) | — |
| /app/log | Yes ("Log meal", pos 3) | Yes ("Log", highlighted) | Log meal | In nav | — |
| /app/coach | Yes ("Coach", pos 4) | Yes ("Coach") | Coach | In nav | — |
| /app/workouts | Yes ("Workouts", pos 5) | Yes ("Move") | Workouts | In nav (label differs by viewport) | — |
| /app/recipes | Yes ("Recipes", pos 6) | No | Recipes | In nav desktop; mobile via dashboard body link (dashboard-client.tsx:404) | Verified link present on mobile dashboard |
| /app/grocery-list | Yes ("Groceries", pos 7) | Yes ("Groceries") | Groceries | In nav | — |
| /app/recovery | Yes ("Recovery", pos 8) | No | Recovery | In nav desktop; mobile via dashboard score-contributor link (fuelwell-data.ts:294) | Verified `/app/recovery` in mobile dashboard link set |
| /app/progress | Yes ("Progress", pos 9) | No | Progress | In nav desktop; mobile via dashboard body link (dashboard-client.tsx:410) | Verified on mobile dashboard |
| /app/profile | Yes ("Profile", pos 10) | No | Profile | In nav desktop; mobile via dashboard "A" avatar (dashboard-client.tsx:140) | Verified on mobile dashboard |
| /app/settings | Yes ("Settings", pos 11 — **clipped at 800px height**, see F1) | No | Settings | In nav desktop (impaired); mobile via header user menu (all items are `/app/settings#…` anchors) | user-menu.tsx:18-27 |
| /app/nutrition | No | No | **none** | Intentionally hidden subpage — linked from dashboard "Open meal breakdown" (dashboard-client.tsx:284,362) and log page (log/page.tsx:231) | Reachable both viewports |
| /app/meal-plan | No | No | **none** | Intentionally hidden subpage — linked only from dashboard Quick Actions "Meal plan" tile (quick-actions.tsx:48) | Reachable both viewports |
| /app/fitness | No | No | Progress (explicit alias, sidebar.tsx:108) | Intentionally hidden subpage of Progress — linked from progress/page.tsx:398, dashboard Activity pillar (fuelwell-data.ts:285), workout-log-actions.tsx:47,54, detail-surfaces.tsx:420,582,902 | Reachable both viewports |
| /app/activity | No | No | **none** | **Near-orphaned** — exactly one in-app link: recovery/page.tsx:57 ("Review activity verdict"). Not orphaned (a click path exists) but a single deep link from a page that itself isn't in the mobile tab bar | Reachable, barely |
| /app/onboarding | No | No | **none** | Intentionally hidden flow — entered from signup ((auth)/signup/page.tsx:77,96,132), dashboard setup card (dashboard-client.tsx:173), profile (profile-client.tsx:283), settings (settings-client.tsx:957) | Reachable |
| /app/launch-preflight | No | No | **none** | Dev/QA tool — linked from /preview launcher (preview/page.tsx:15,112) and, notably, from user-facing coach attachments page (coach/attachments/page.tsx:144 "Open preflight"). Mobile header has no title mapping for it (chip falls back to "FuelWell") | Reachable (see F8) |

**Orphaned routes: none.** Every route has at least one click path. The weakest is
`/app/activity` (single link, from Recovery).

---

## Findings

### F1 — MAJOR — Settings is effectively unreachable from the desktop sidebar at 800px-tall viewports
- Viewport: desktop 1280x800. Element: `aside nav a[href="/app/settings"]`.
- Measured: item rect top=797 / bottom=853 in an 800px viewport; sidebar nav has
  `overflow-y: visible`, `scrollHeight == clientHeight`, and setting `scrollTop` stays 0 —
  the list cannot scroll (the outer layout div is `overflow-hidden`). Only a ~3px sliver of
  the Settings row is clickable. Same clipping occurs collapsed.
- Since desktop has no shell header/user menu, the only other desktop path to Settings is
  Profile page → "Settings" link (profile-client.tsx:159).
- Screenshots: `audit-shell-desktop-settings-clipped-800h.png`,
  `audit-shell-desktop-sidebar-expanded.png` (Settings absent below fold).
- Fix: give the nav column scrolling (`min-h-0 overflow-y-auto` on the nav inside the
  flex-column aside), and/or reduce per-item height (min-h-14 + py-3.5 + space-y-2 = ~64px
  per row x 11 rows = 712px before the 120px logo header).

### F2 — MAJOR — One concept, four names: Workouts / Move / Fitness / Activity / Progress
- Viewports: both. Elements: sidebar item "Workouts", mobile tab "Move", pages
  /app/workouts ("Workouts"), /app/fitness (h1 "Fitness detail", mobile chip
  "Progress · Activity", sidebar highlights "Progress"), /app/activity (h1 "Activity").
- Measured: clicking mobile "Move" lands on /app/workouts titled "Move" in the header
  chip but "Workouts" in the sidebar; the dashboard "Activity" pillar links to
  /app/fitness, not /app/activity; /app/fitness highlights "Progress".
- A first-time user cannot form a model of which surface owns movement data.
- Screenshots: `audit-shell-desktop-fitness-active-state.png`,
  `audit-shell-mobile-fitness-chip.png`, `audit-shell-mobile-tabbar-dashboard.png`.
- Fix: pick one label per concept — e.g. tab "Workouts" (matching sidebar), retitle
  /app/fitness to "Activity detail" OR merge /app/activity into /app/fitness; make the
  header-chip mapping match the nav label that highlights.

### F3 — MAJOR — Two adjacent person icons on mobile with different meanings, and the user menu has no Profile link
- Viewport: mobile 390x844. Elements: header `button[aria-label="Open user settings menu"]`
  (person icon → settings dropdown) and, ~90px below it on the dashboard, the green "A"
  avatar `a[aria-label="Open profile"]` → /app/profile.
- Measured: both visible simultaneously on the dashboard (screenshot
  `audit-shell-mobile-tabbar-dashboard.png`); the opened menu
  (`audit-shell-mobile-user-menu.png`) contains 8 items — 6 settings anchors, "Sign in",
  "Delete Account" — and no Profile entry, though /app/profile exists and is nav-worthy
  (it is in the desktop sidebar).
- Fix: one identity affordance — add "Profile" as the first user-menu item (or make the
  header icon go to Profile and put settings inside it), and don't render two look-alike
  person controls in the same screen region.

### F4 — MAJOR — User menu always shows "Sign in" and exposes "Delete Account" one tap from the shell
- Viewport: mobile (menu is mobile-header-only; the `floating` desktop variant of
  UserMenu is never mounted anywhere — dead code branch in user-menu.tsx:29,56).
- Measured: menu items are a static array (user-menu.tsx:18-27); "Sign in" → /login
  renders regardless of session state, and "Delete Account" (red, → settings#delete-account)
  sits in the top-level shell menu. A signed-in first-time user reads "Sign in" as
  "I'm not signed in".
- Screenshot: `audit-shell-mobile-user-menu.png`.
- Fix: make the auth row conditional (Sign in / Sign out); drop Delete Account from the
  shell menu — it already lives at settings#delete-account.

### F5 — MINOR — Mobile tab bar carries 6 items; "Review" is ambiguous
- Viewport: mobile 390x844. Element: `nav[aria-label="Mobile navigation"]`.
- Measured: 6 tabs, each 65px wide (Home, Log, Coach, Move, Groceries, Review). Targets
  are 65x46-50px — acceptable height, but 6 items is above the 4-5 sweet spot and squeezes
  labels to text-xs. "Review" (Daily review) reads as "review something" — app review?
  recipe review? The same destination also has a permanent header shortcut (F6), so it is
  the most duplicated destination while Progress/Recipes get no tab at all.
- Screenshot: `audit-shell-mobile-tabbar-dashboard.png`.
- Fix: 5 tabs — Home, Log, Coach, Workouts, + either Groceries or Review (whichever wins
  on usage); rename "Review" → "Today" or "Check-in" if kept.

### F6 — MINOR — Duplicate path: persistent daily-review clipboard button in the mobile header on every page
- Viewport: mobile. Element: mobile-header.tsx:43-51 clipboard icon
  (`aria-label="Open daily review"`), shown on every route except /app/daily-review,
  duplicating the "Review" tab always visible directly below it.
- Screenshot: `audit-shell-mobile-tabbar-dashboard.png` (clipboard top-right, Review
  bottom-right).
- Fix: remove one (keep the tab); the freed header slot could hold the truncation-prone
  title chip at full width.

### F7 — MINOR — Secondary routes show no active/location state in either nav
- Viewports: both. Measured on direct visit: /app/nutrition, /app/meal-plan,
  /app/activity, /app/onboarding, /app/launch-preflight highlight **nothing** in the
  desktop sidebar; on mobile no tab is active for any non-tab route (recipes, settings,
  progress, etc. — see `audit-shell-mobile-settings-no-tab-active.png`,
  `audit-shell-mobile-recipes-no-tab.png`). /app/fitness proves the fix pattern exists
  (alias to Progress, sidebar.tsx:108).
- Fix: extend the alias map — nutrition → Dashboard or Log meal, meal-plan → Recipes (or
  Dashboard), activity → Progress; on mobile, alias tab active-state the same way
  (recipes → nothing is fine, but progress/fitness/activity should light "Move" or a
  Progress tab if F5 adds one).

### F8 — MINOR — Dev tool leaks into user-facing shell: "Open preflight" on Coach attachments
- Viewport: both. Element: coach/attachments/page.tsx:144 links to /app/launch-preflight,
  a QA route-checklist page; its mobile header chip falls back to "FuelWell" (no title
  mapping), confirming it was never expected in normal navigation.
- Fix: gate the link (and the route) behind preview/dev mode, or replace the link with an
  inline storage-status refresh.

### F9 — MINOR — Coach subpages (attachments, menu-review) unreachable from the Coach page on mobile
- Viewport: mobile. Element: coach/page.tsx:321,324 — both links are
  `hidden ... sm:inline-flex`, so below the sm breakpoint there is no path from Coach to
  /app/coach/attachments or /app/coach/menu-review (only the external /preview launcher
  links them). Adjacent to shell scope but found while walking click paths.
- Fix: mobile-visible entry (overflow menu or stacked links) on the Coach page.

### F10 — OPPORTUNITY — Collapsed sidebar: expand button overlaps the logo tile; rail is wide
- Viewport: desktop. Measured: collapsed width 104px (icon rail norm ~64-72px); the
  expand button is absolutely positioned at `left-[4.5rem] top-6` and visually overlaps
  the leaf logo tile (screenshot `audit-shell-desktop-sidebar-collapsed.png`, top-left).
  Settings clipping (F1) persists collapsed.
- Fix: place the toggle below the logo or in the rail flow; tighten rail to ~72px.

### F11 — OPPORTUNITY — Sidebar drag-to-resize is an unusual affordance for a consumer app
- Viewport: desktop. Element: sidebar.tsx:130-153 resize separator (260-420px, keyboard
  arrows supported). Discoverable only by hovering a 3px-wide handle; resets on reload
  (state not persisted). Cost/benefit questionable for a consumer nutrition app; if kept,
  persist the width.

### F12 — OPPORTUNITY — Desktop has no shell-level identity/search; dashboard-only controls masquerade as chrome
- Viewport: desktop. The search circle and "A" avatar top-right exist only on
  /app/dashboard (dashboard-client.tsx:135,141); every other desktop page has neither.
  A first-time user who learns "avatar top-right" loses it on the next page.
- Fix: either promote search + avatar into a real desktop shell header, or drop the
  avatar (Profile is already in the sidebar) to avoid teaching a pattern that vanishes.

---

## Verified behaviors (positive)

- All 11 sidebar items and all 6 tabs navigate to their labeled route; `aria-current="page"`
  set correctly on the clicked item in every case (22/22 click checks).
- Active states are clearly visible: filled green gradient pill (desktop), colored
  bold label + scaled icon (mobile).
- `aria-label`s present on nav landmarks, toggle, resize handle, and header icon buttons.
- Mobile header title chip correctly names all mapped routes (incl. "Progress · Activity"
  on /app/fitness, not truncated at 390px: scrollWidth 124 == clientWidth 124).
- Tab bar respects safe-area inset; main content bottom padding clears the bar.
- Icon-label pairing is conventional and legible (dashboard grid, plus-circle Log,
  chat bubble Coach, dumbbell, basket, clipboard).

## Screenshots (this directory, prefix audit-shell-)

- audit-shell-desktop-sidebar-expanded.png — expanded sidebar, dashboard active
- audit-shell-desktop-sidebar-collapsed.png — collapsed rail (note toggle/logo overlap)
- audit-shell-desktop-fitness-active-state.png — deep page /app/fitness with "Progress" active
- audit-shell-desktop-settings-clipped-800h.png — Settings row clipped at 800px height
- audit-shell-mobile-tabbar-dashboard.png — 6-tab bar + double person icons
- audit-shell-mobile-user-menu.png — user menu contents (Sign in / Delete Account)
- audit-shell-mobile-settings-no-tab-active.png — Settings on mobile, no tab active
- audit-shell-mobile-recipes-no-tab.png — Recipes on mobile, no tab active
- audit-shell-mobile-fitness-chip.png — header chip "Progress · Activity"

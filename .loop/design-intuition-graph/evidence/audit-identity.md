# audit-identity — Onboarding, Profile, Settings, Auth, Launch-Preflight

Read-only UX audit, 2026-07-22. Dev server http://localhost:3000 (anonymous preview mode).
Viewports: desktop 1280x800, mobile 390x844. All screenshots in `evidence/` with prefix
`audit-identity-`. Instrumented sweep result: **zero console errors, zero page errors, zero
horizontal overflow** on every audited surface at both viewports.

Severity: **High** = ship-blocker-grade polish/coherence issue; **Medium** = clear UX debt a
first-time user will hit; **Low** = polish/nice-to-have.

---

## 1. Onboarding (`/app/onboarding`) — 9 findings

Flow verified end-to-end at both viewports: 17 steps (Welcome, Name, Birthday, Biology, Body,
Activity, Goal, Pace, Style, Diet, Tastes, Food, Allergies, Workouts, Methods, Coach, Plan),
completed to celebration screen and dashboard landing.
Screenshots: `audit-identity-onboarding-01…19-*-{desktop,mobile}.png`.

What works well (keep): step order is logical (identity → body → goal → food → training →
coach → plan); progress is triple-signaled (bar, "Step N of 17", desktop chips); every step
has a "why we ask" subtitle plus InsightRow; disabled-Next hint copy ("Add your birthday to
continue") is humane and aria-live; draft persistence with "Picked up where you left off";
completion is genuinely satisfying (celebration with targets → dashboard greets by name with
"Setup complete — your plan and targets are live" banner; `onboarding-18/19-*`).

1. **High — Option-tile label clipping and check-badge overlap on desktop.** On the Style step
   the Goal-aggressiveness grid renders ~60px-wide text columns: "Steady cut" description is
   truncated and the selected-check badge overlaps the text ("…a 15% def[icit]" hidden under
   the badge). On the Allergies step the 4-column grid clips labels: "None"→"No", "Dairy"→
   "Dair", "Gluten"→"Glut", "Shellfish"→"Shell", with the check badge overlapping "None".
   Evidence: `onboarding-09-style-desktop.png`, `onboarding-13-allergies-desktop.png`.
   Fix: in `src/app/app/onboarding/page.tsx` reduce column counts inside the right-hand card
   (aggressiveness `md:grid-cols-2` max at this container width; allergies `md:grid-cols-3`),
   give tiles `min-w-0` + reserved padding-right where the check badge renders so text never
   sits under it. Mobile is unaffected (single column, clean — `onboarding-09-style-mobile.png`).

2. **Medium — Completion checklist pre-checks items from defaults.** The dark side panel shows
   "Food rules ✓" on step 1, before the user has seen any food question, because
   `dietaryPreference` defaults to `"none"` and the checklist tests value presence
   (`completionItems`, page.tsx ~line 584). Undermines the checklist's meaning.
   Evidence: `onboarding-01-welcome-desktop.png` (Food rules already checked).
   Fix: mark items done only when their step has been visited/answered (track max visited step).

3. **Medium — Five steps are pass-through defaults.** Pace, Style, Diet, Food, and Coach arrive
   pre-selected (steady / steady_loss+balanced / none / moderate+mix / gym_home+event_driven+
   direct_supportive), so a user can Next through them without engaging — which makes 17 steps
   feel inflated while capturing nothing new. Fix: either mark these "pre-set — change if you
   like" explicitly, or merge (Pace+Style; Tastes+Food) to cut the count to ~13.

4. **Medium — Full app chrome stays active during onboarding.** Desktop sidebar (Dashboard,
   Coach, Recipes…) and mobile bottom nav are fully clickable mid-setup; a first-run user can
   wander into empty surfaces and lose the flow ("Skip for now" already covers intentional
   exit). Evidence: visible in all onboarding shots. Fix: suppress or de-emphasize nav on the
   onboarding route (the route already renders its own header + Skip).

5. **Low — Desktop step chips jump anywhere, bypassing gates.** `onClick={() => setStep(index)}`
   is unconditional, so "Plan" is reachable from step 1 and shows "Missing required info". The
   chips are also 33px tall. Fix: only completed/adjacent steps clickable; treat as nav
   breadcrumb, not free jump.

6. **Low — Mobile repeats the marketing aside under every step.** The dark "Build the nutrition
   system around your real day" panel + live preview renders below the step card on all 17
   steps (~1000px of identical scroll). Evidence: `onboarding-16-coach-mobile.png` bottom.
   Fix: on mobile show the aside only on Welcome and Plan, or collapse to a one-line live
   preview chip ("2,321 kcal plan").

7. **Low — Body step is imperial-only.** Height (ft/in) and Weight (lb) with no metric entry,
   despite Settings having a Units preference. Evidence: `onboarding-05-body-filled-mobile.png`.
   Fix: unit toggle on the Body step writing the same Units preference Settings reads.

8. **Low — "Skip for now" hit target is 38px tall** (both viewports) and visually competes with
   nothing on mobile — acceptable, but under the 44px rule. Fix: bump padding.

9. **Low (preview-only observation) — Post-onboarding dashboard shows a partially consumed day.**
   Fresh completion lands on "1,471 calories left / 89g protein left" from the sample preview
   day, contradicting the brand-new-plan impression. Evidence: `onboarding-19-landing-mobile.png`.
   Verify authenticated first-run lands on a zeroed day; if so this is cosmetic preview drift.

## 2. Settings (`/app/settings`) — 9 findings

Screenshots: `audit-identity-settings-{desktop,mobile}-tall.png` (full page),
`audit-identity-settings-mobile-scroll{0..8095}.png` (readable mobile segments).

What works well: eyebrow section labels (ACCOUNT / PREFERENCES / HEALTH PROFILE / …) make
desktop scanning easy; About correctly shows v1.4.0 from package.json; preview banner is
honest; form controls on mobile are large and legible.

1. **High — Same-page data contradiction on allergies.** PREFERENCES → Allergies says "No
   allergies recorded." while HEALTH PROFILE → Restrictions shows "Shellfish" a screen below.
   Two sources: the Preferences block reads the local preferences store, the health profile
   reads `initialProfileInputs` (server profile / sample). Evidence:
   `settings-mobile-scroll1200.png` vs `settings-mobile-scroll2400.png`; both visible in
   `settings-desktop-tall.png`. Fix: single source of truth for allergies + dietary preference
   in `src/components/settings/settings-client.tsx`; render both blocks from it.

2. **High — Units preference is cosmetic.** Default/selected "Metric" (`use-units.ts` DEFAULT =
   "metric") while the health profile edits Weight (LB) and Height (FT/IN) and the hero stat
   says "Metric"; Profile page displays kg/cm regardless of the toggle. `units` is persisted
   (settings-client.tsx lines 472, 494) but never converts any input or display. A user who
   switches Imperial/Metric sees nothing change. Fix: drive health-profile field units and
   Profile display from the preference, or remove the toggle until it does something.

3. **Medium — Delete account is an undifferentiated dead end.** It's a "Coming soon" card
   styled identically to Support/Subscription, mid-page, with no danger styling, no
   confirmation flow, no alternative instruction (e.g., contact support to delete). Evidence:
   `settings-mobile-scroll7200.png`. Fix: dedicated danger-zone section at page bottom with
   destructive styling; until the flow exists, state how deletion is actually requested.
   (Audit stopped at the card — control is inert, nothing to confirm.)

4. **Medium — Five of eight action cards are dead ends.** Export your data, Plan and billing,
   Get help, Delete account = "Coming soon"; Privacy controls = "Preview". A settings page
   where most tap targets do nothing erodes trust. Fix: collapse into one "Coming with public
   release" group or hide until functional.

5. **Medium — Save affordance scrolls away on mobile.** "Save health profile" and "Save
   changes" sit at the *top* of their sections; the health-profile card is ~1,800px tall on
   mobile, so after editing Date of birth / Meals per day at the bottom the save button is far
   off-screen above. Evidence: `settings-mobile-scroll1200.png` (button) vs
   `settings-mobile-scroll2400/3600.png` (fields). Fix: sticky save bar while the section has
   dirty state, or duplicate the button at section bottom.

6. **Medium — Hero stat clipped: "Not Lin…"** (Garmin, desktop hero). Evidence:
   `settings-desktop-tall.png` top card. Fix: shorter value string ("None") or allow wrap.

7. **Low — Profile/Settings duplication and naming drift.** Display name, email, goal, weight,
   height, and Sign out appear on both pages; re-running onboarding is "Re-run intake" in
   Settings but "Retake the setup quiz" in Profile. Fix: one canonical label; see Profile #1.

8. **Low — Mobile page is ~8,900px tall with no jump navigation.** Units is near the top;
   Sign out and About require a full-page scroll. Desktop earns its length via 2-column grids;
   mobile doesn't. Fix: in-page anchor chips under the header (Account · Preferences · Health
   · Intake · Data · Session) — the sections already have `id`s.

9. **Low — Restrictions control is ambiguous.** A text input showing "Shellfish" (reads as a
   static chip) plus an unrelated "None" checkbox below it; unchecked "None" while a value is
   present is confusable. Evidence: `settings-mobile-scroll2400.png`. Fix: reuse the
   onboarding allergy chip multi-select here.

## 3. Profile (`/app/profile`) — 3 findings

Screenshots: `audit-identity-profile-{desktop,mobile}-tall.png`,
`audit-identity-profile-mobile-scroll{0,1100}.png`.

What works well: clean read-only summary; inline name edit with save/cancel and aria-labels;
macro split bar with percentages; "Setup: Complete" status chip.

1. **Medium — The Profile/Settings split is not self-explanatory (confirmed overlap finding).**
   Profile shows targets, goal, activity, weight, height — all read-only — but offers no path
   to edit any of them except "Retake the setup quiz" (full 17-step re-run), while the actual
   editors live in Settings → Health profile, unlabeled from here. The only Profile-unique
   actions are name edit and Sign out (which Settings also has). A user asking "where do I
   change my weight?" has a coin-flip. Fix: make Profile the identity/summary view and add
   "Edit in Settings" links on the Daily targets and Body context cards (deep-link to
   `#health-profile`); keep quiz-retake as the secondary option; drop one of the two Sign outs.

2. **Low — Desktop layout waste.** The dark hero card is ~450px with a large empty bottom
   region, and everything below Body context is empty page (page is 60% blank at 1280x800).
   Evidence: `profile-desktop-tall.png`. Fix: tighten hero, promote Body context + Account
   actions beside it.

3. **Low — "Retake the setup quiz" anchor hit area is 21px tall** despite the large visual
   button (Link wrapping Button renders an inline anchor; detector: 344x21px). Clicks on the
   button's upper/lower padding may miss the link. Fix: `className="block"` on the Link (or
   Button asChild pattern).

## 4. Auth (`/login`, `/signup`, `/forgot-password`) — 4 findings

Routes confirmed: `(auth)` route group → paths are `/login`, `/signup`, `/forgot-password`
(+ `/callback`). Screenshots: `audit-identity-{login,signup,forgot-password}-*.png`,
`audit-identity-signup-validation-{desktop,mobile}.png`.

What works well: shared AuthShell keeps all three brand-consistent (dark value-prop panel +
white card); login ⇄ signup ⇄ forgot links all present and correct; signup validation is
humane ("That doesn't look like an email address — check for typos", "Passwords need at least
8 characters"), inline, red-on-light and readable, focuses the first invalid field, plus a
4-segment strength meter; OAuth options prominent; autocomplete attributes correct.
(Forgot-password submission intentionally not exercised — would send a real email.)

1. **Medium — "Preview mode" card is hard-coded into AuthShell for everyone.** The dark panel's
   bottom card reads "PREVIEW MODE / Setup takes a few minutes" on login, signup, and
   forgot-password unconditionally (`src/components/auth/auth-shell.tsx` lines 68–82). Real
   production users will see internal "preview" jargon on the front door, and the label/body
   pairing is incoherent. Evidence: `login-desktop.png`, `signup-validation-desktop.png`
   bottom-left. Fix: replace with a real value-prop card ("Setup takes a few minutes" without
   the PREVIEW MODE eyebrow), or gate the eyebrow on preview host.

2. **Low — Footer/secondary links are ~20px-tall tap targets on mobile:** "Sign up", "Log in",
   "Back to login" (login's "Forgot password?" already uses a padded hit-area trick; the
   others don't). Fix: apply the same padding expansion to AuthLink and the back link.

3. **Low — Login error handling conflates field and form.** Supabase auth errors (e.g. wrong
   password, rate limit) render as the *password field* error; a server outage would appear as
   a password mistake. Fix: general form-level error slot for non-credential errors (code
   review finding; not exercised live to avoid live auth calls).

4. **Low — Forgot-password mobile has ~200px of dead space above the logo row** (vertical
   centering of a short card). Cosmetic. Evidence: `forgot-password-mobile.png`.

## 5. Launch preflight (`/app/launch-preflight`) — 3 findings

Screenshots: `audit-identity-launch-preflight-{desktop,mobile}-tall.png`.

**Classification: internal dev/release tool, not a user surface.** Copy addresses the release
process ("Review readiness before Max opens the build"), content is RLS migrations, Supabase
env state, preview gates, route health. Inbound links exist only from `/preview` (review hub)
and the coach attachments page — nothing in user nav points here.

1. **Medium — Dev tool rendered inside the authenticated user app shell with no gate.** Any
   user who hits `/app/launch-preflight` gets internal infra status (no secrets leaked — it
   says so and the JSON endpoint is scrubbed — but internal personas/jargon and a "Blocked"
   production banner are user-visible). Fix: relocate under `/preview/…` alongside the review
   hub, or gate the route on preview host / an admin flag; return 404 for normal users.

2. **Low — Grammar bug in the blocked banner:** "1 production gate still need proof or setup."
   Pluralization covers "gate{s}" but not the verb (`page.tsx` line ~134). Fix: "needs" when
   count === 1.

3. **Low — Layout itself is solid at both viewports** (cards reflow 4→1 columns, no overflow,
   readable). If the page stays, no visual work needed beyond the copy fix.

---

## Cross-cutting sweep summary

- Console/page errors: none on any surface, either viewport.
- Horizontal overflow: none.
- Touch targets: main CTAs and form controls are comfortably ≥44px everywhere; the sub-44px
  offenders are enumerated above (auth text links, onboarding step chips/Skip, profile retake
  anchor, settings segmented controls at 32–36px — acceptable for desktop-dominant use but
  worth padding on mobile).
- Empty states present and written in product voice (Coach activity, dietary preferences,
  allergies) — good.

## Top 3 opportunities

1. **Make Units real and reconcile duplicated identity data** (Settings High #1 + #2, Profile
   Medium #1): one source of truth for allergies/diet/body data, a Units toggle that actually
   converts, and explicit "Edit in Settings" paths from Profile — this removes every
   contradiction a user can currently screenshot.
2. **Fix onboarding desktop tile clipping** (Onboarding High #1): the Style and Allergies grids
   clip labels and overlap the check badge — the single most visible polish defect in the
   first-run flow; a column-count + min-width fix.
3. **De-jargonize the front door and gate the dev tool** (Auth Medium #1 + Launch-preflight
   Medium #1): remove the hard-coded "PREVIEW MODE" card from AuthShell and move
   `/app/launch-preflight` behind the preview hub so production users never see internal
   release machinery.

---
## VERIFIER CORRECTION (2026-07-22, round-1 verification)
Settings Finding #2 (Units toggle "cosmetic") is OVERSTATED. Verified reality: `profile-client.tsx:303-324` consumes `useUnits()` and correctly switches kg/cm ↔ lb/in (reproduced live both directions). What IS broken: Settings' own Health Profile editor (settings-client.tsx:761-789) never reads `units` — always lb/ft-in regardless of toggle. Fix-identity: scope the fix to the Settings editor honoring the toggle; do NOT "fix" the Profile page, it already works. Also note: the allergies contradiction (Finding #1) is a first-load/unsaved-state bug — Save reconciles the two stores (settings-client.tsx:437,468).

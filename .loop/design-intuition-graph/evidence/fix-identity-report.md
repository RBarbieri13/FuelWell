# fix-identity — implementation report (2026-07-22)

Node: `fix-identity` · Branch: main (working tree; no commit per boundary — orchestrator commits)
Work order: `audit-identity.md` (28 findings + verifier correction). Territory respected:
`src/app/app/{onboarding,profile,settings*,launch-preflight}`, `src/app/(auth)`,
`src/components/{auth,settings}`. Zero edits to `src/components/layout` or `src/components/ui`.

## Files changed

- `src/app/app/onboarding/page.tsx`
- `src/components/settings/settings-client.tsx`
- `src/app/app/profile/profile-client.tsx`
- `src/components/auth/auth-shell.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/app/launch-preflight/page.tsx`

## Priority 1 — Onboarding desktop tile clipping (High) — FIXED, measured

Before: `audit-identity-onboarding-09-style-desktop.png`, `…-13-allergies-desktop.png`
("Gluten"→"Glut", badge over "None", "…15% def" under badge).
After: `fix-identity-onboarding-style-grids-desktop-after.png`,
`fix-identity-onboarding-allergies-desktop-after.png`, `…-allergies-mobile-after.png`.

- Goal-aggressiveness grid `md:grid-cols-2 xl:grid-cols-3` → `md:grid-cols-2` (tiles 207px).
- Diet-flexibility grid `md:grid-cols-3` → `md:grid-cols-2`. **Deviation from audit letter,
  same spirit:** measurement showed the flexibility row (134px tiles) also painted text past
  the tile edge ("Structured" scrollWidth 79px in a 44px box) — the audit had only flagged the
  aggressiveness grid.
- Allergies grid `sm:grid-cols-2 md:grid-cols-4` → `sm:grid-cols-2`. **Deviation:** the audit
  prescribed `md:grid-cols-3`, but at 3 columns a *selected* tile (icon 44 + gaps + 28px check
  badge) leaves ~6px for text — "Shellfish" still overflowed with badge overlap in live
  measurement. Two columns is the honest maximum in this container (right card ≈ 460px content
  at 1280×800 because the app sidebar + dark aside flank it).
- `OptionTile`: added `min-w-0` on the button (grid-item min-width trap), `gap-4` → `gap-3`.
- Measured after fix: every tile on both steps reports `overflow:false`, `badgeOverlap:false`
  at 1280×800; no horizontal overflow at 390×844.

## Priority 2 — Settings identity coherence (High ×2) — FIXED, verified live

**(a) Units toggle now drives the Health Profile editor** (scoped per VERIFIER CORRECTION —
Profile page untouched, it already worked).
- Metric: single Weight (kg, 0.1 precision) and Height (cm) fields; Imperial: lb + ft/in as
  before. Canonical state stays `weightLb`/`heightIn`; new `kgToLb`/`cmToInches` inverses
  convert at the field boundary, so the save path (`persistProfileInputs` → kg/cm) is unchanged.
- Live: fresh load (metric default) shows 82.1 kg / 180 cm for the 181 lb / 71 in sample;
  toggle flips fields both directions; typing 90 kg round-trips to 198.4 lb and back.
  Screenshots: `fix-identity-settings-desktop-metric-editor-after.png`,
  `…-desktop-imperial-editor-after.png`.

**(b) Allergies dual-source contradiction** — on first load a one-shot effect now applies the
same reconciliation Save already did (`settings-client.tsx` — union of the preference store
and the profile-sourced allergies via `normalizeAllergies`, preview-storage-aware,
`mergePreferences` only when it changes). Live check with cleared localStorage:
"No allergies recorded." absent, "Shellfish" badge present in Preferences → Allergies on the
same first paint as the Restrictions row. Screenshot: `fix-identity-settings-desktop-metric-after.png`.

## Priority 3 — Profile duplication — FIXED

- Daily-targets card: added primary "Edit targets in Settings" (→ `/app/settings#health-profile`);
  "Retake the setup quiz" demoted to ghost secondary. Both Links now `className="block"`,
  fixing the 21px anchor hit-area (audit Profile #3) — measured 44px after.
- Body-context card: "Profile inputs" static chip replaced with an "Edit in Settings" chip-link
  to the same anchor (min-h-11).
- Screenshots: `fix-identity-profile-{desktop,mobile}-after.png`. Zero console errors.
- Deferred: dropping one of the two Sign outs (audit suggests it) — removing Profile's
  confirm-flow sign-out would gut its Account-actions card; product call, left for coherence node.

## Priority 4 — Auth front door — FIXED

- `auth-shell.tsx` is now a client component; the "PREVIEW MODE" card renders only when
  `isPreviewHost(window.location.host)` is true — **the same signal the app shell/settings use**
  (localhost/127.0.0.1, or deployments opting in via `NEXT_PUBLIC_FUELWELL_PREVIEW_MODE`).
  Implemented with `useSyncExternalStore` (server snapshot `false`), so SSR HTML never contains
  the card: `curl /login | grep -c "Preview mode"` → 0; it still appears on localhost after
  hydration (verified true in browser). Production hosts get neither SSR nor client render.
- Bonus surgical fixes from the audit's auth list: `AuthLink` and forgot-password "Back to
  login" got the same negative-margin padding trick as "Forgot password?" (≈40px hit areas,
  audit Low #2); login now routes non-credential Supabase errors (outage, rate limit) to a
  form-level `role="alert"` slot instead of the password field (audit Low #3; credential
  errors — /credential|password|email/i — stay on the field).
- Screenshots: `fix-identity-login-{desktop,mobile}-after.png`, `fix-identity-signup-desktop-after.png`,
  `fix-identity-forgot-desktop-after.png`.

## Priority 5 — Launch-preflight — FIXED

- Route now gates server-side: `isPreviewHost(headers().host)` else `notFound()` → production
  users get a 404; localhost/preview deployments keep the tool (verified 200 + full render on
  localhost: `fix-identity-launch-preflight-desktop-after.png`).
- Grammar: "1 production gate still needs proof or setup." (verb pluralizes with count) —
  verified live with count = 1.
- Note for coherence node: `/app/coach/attachments` (coach territory) still links here; in
  production that link will 404 by design.

## Priority 6 — Settings organization & polish (Mediums/Lows) — done surgically

- **Delete account (M#3):** moved out of the card grid to a page-bottom "Danger zone" Section
  (`id="delete-account"` kept), red-styled icon/title/border, `Badge variant="error"`, copy now
  states self-serve deletion + support contact arrive with public release.
  Screenshot: `fix-identity-settings-mobile-dangerzone-after.png`.
- **Dead-end cards (M#4):** Export / Privacy / Plan-and-billing / Get-help grouped under one
  "Coming with public release" section. Anchor ids `data/privacy/subscription/support` preserved
  on wrapper divs because the frozen `layout/user-menu.tsx` deep-links to them.
- **Save affordance (M#5):** duplicate full-width Save buttons at the bottom of the Health
  profile and Intake cards, `md:hidden` (mobile-only, where the audit measured the problem).
  Verified present + visible at 390px.
- **Hero stat clip (M#6):** Garmin "Not linked" → "None" (audit's suggested string).
- **Naming drift (L#7):** Settings' "Re-run intake" relabeled "Retake the setup quiz" (one
  canonical label with Profile).
- **Jump navigation (L#8):** mobile-only horizontal chip nav under the page title (Account ·
  Preferences · Health · Intake · Data · Session), 44px chips; sections got `scroll-mt-24`
  (+ new `preferences`/`session` ids). Verified: chip tap lands `#health-profile` in-viewport.
- **Restrictions ambiguity (L#9):** "None" checkbox replaced with the onboarding-style allergen
  chip multi-select (None/Dairy/Gluten/Nuts/Soy/Eggs/Shellfish/Fish/Wheat, via
  `toggleAllergySelection`), text input kept below for custom entries ("Add others, separated
  by commas"). Verified: chip toggles edit the comma list, None clears it, preview Save works.
- **Onboarding M#2 (pre-checked checklist):** items now require their step to have been visited
  (`maxStepReached`) — "Food rules" no longer checked on step 1; verified via restored draft
  (visited items checked, Training unchecked).
- **Onboarding L#5 (chip free-jump):** step chips beyond `maxStepReached` are `disabled` +
  muted; visited steps remain a breadcrumb.
- **Onboarding L#8:** "Skip for now" gets `min-h-11` (44px).

## Deferrals (with reasons)

- Onboarding M#3 (merge pass-through steps) and M#4 (suppress app chrome during onboarding):
  step-count restructure is beyond a polish diff; chrome suppression requires layout-territory
  changes (frozen) — documented for the coherence node.
- Onboarding L#6 (mobile aside repetition), L#7 (metric entry on Body step), L#9 (preview
  partially-consumed day): larger behavior changes, not in work-order priorities; L#7 would
  ideally reuse the new Settings unit pattern — good follow-up.
- Profile L#2 (desktop layout waste): layout recomposition, low value vs. regression risk.
- Auth L#4 (forgot-password mobile dead space): cosmetic vertical centering, left as is.
- Profile/Settings double Sign out: see Priority 3.

## Verification results

- `pnpm exec eslint` on all territory files: **clean** (0 problems).
- `pnpm lint` (whole repo): fails only in `dashboard-client.tsx` / `progress-client.tsx` —
  files being edited concurrently by other fix nodes, untouched by this node.
- `pnpm exec tsc --noEmit`: **clean at 12:24** after all functional edits (only className-only
  edits followed); a later run shows 2 errors in `src/app/app/recipes/page.tsx` from a parallel
  node's in-flight edit (`RecipePlanStatus`), not this territory.
- `pnpm vitest run tests/unit`: **39 files / 333 tests passed** (re-run after final edits).
- `pnpm playwright test tests/coach.spec.ts tests/coach-rich-inline.spec.ts`: **4 passed,
  12 skipped** (env-gated, matches baseline) — re-run after final edits.
- Console/page errors: **zero** on onboarding, settings, profile, login/signup/forgot,
  launch-preflight at both 1280×800 and 390×844 during all live checks.
- Horizontal overflow: none at 390×844 on onboarding/settings/profile.
- Browser localStorage cleared after testing (no residue for the verifier).

## Evidence index (prefix `fix-identity-`)

onboarding-style-desktop-after, onboarding-style-grids-desktop-after,
onboarding-allergies-desktop-after, onboarding-allergies-mobile-after,
settings-desktop-metric-after, settings-desktop-metric-editor-after,
settings-desktop-imperial-editor-after, settings-mobile-after,
settings-mobile-dangerzone-after, profile-desktop-after, profile-mobile-after,
login-desktop-after, login-mobile-after, signup-desktop-after, forgot-desktop-after,
launch-preflight-desktop-after. ("Before" = the audit-identity-* screenshots.)

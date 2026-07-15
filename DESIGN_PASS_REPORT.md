# Design pass — app-wide UI & design improvement (2026-07-15)

Request: a front-end-consultant pass over the whole app — layout, visual
display, proportion, iconography, visual aids for metrics, and intuitive
enhancements on every route. Branch: `surf/ios-responsive-ux-recovery`
(changes left uncommitted for review).

## How it ran

1. **Baseline evidence** — every route captured at 390px (iOS) and 1280px
   (desktop): `surf-evidence/design-pass/before/` (50 full-viewport shots) and
   `before-segs/` (171 scrolled segments covering below-the-fold content).
2. **Critique fan-out** — 8 parallel design-critic agents, one per route
   group, each reading its screenshots + source. 81 concrete findings, every
   one tied to files and grounded in the design tokens
   (`src/app/globals.css`).
3. **Implementation** — 7 parallel implementation agents on disjoint file
   sets; shared files (detail-surfaces, energy-ledger chart, dashboard
   components, app shell) edited centrally. 78 of 81 findings implemented
   (3 were coordinator-owned duplicates of the same shell issue).
4. **Verification** — `tsc --noEmit` ✓, `eslint` ✓, vitest 271/271 ✓,
   Playwright chromium 71/71 ✓ (after fixing one regression the suite itself
   caught), `next build` (see Verification below), and full re-capture:
   `surf-evidence/design-pass/after/` + `after-segs/`.

## Owner-flagged issues (all fixed)

- **Energy ledger**: per-bar "HOVER" pills removed; copy is touch-first
  ("Tap any bar to pin its full breakdown open"); the giant Collapse
  intake/output banners split side-by-side from `sm:` up (full-width kept on
  phones — a Playwright spec enshrines that); the pager panel slimmed to a
  one-line row with 44px icon-only chevrons.
- **Fitness detail**: >100% metric pills now show a ✓ "Met" state with
  "+X past the target" microcopy instead of "315%" against "0 left of 500";
  activity stat chips gained units ("42 min", "310 kcal"), zero burns render
  as "—"/"burn not estimated" instead of raw 0s, and the rotating
  alert-colored chips (red "0 BURN", yellow "Manual SOURCE") are now quiet
  neutral chips — color is reserved for meaning; hero heading demoted so it
  no longer competes with the page title.

## Cross-cutting fixes

- **Macro icon/color canon enforced everywhere**: protein = Beef/sky,
  carbs = Wheat/lemon, fat = Droplet/coral, Dumbbell reserved for movement
  (was violated on nutrition tiles, recipe cards/detail, coach menu-review,
  recovery soreness tile).
- **App shell**: the floating bottom-right account button — which overlapped
  the coach Send button, the live-workout CTA, and profile/settings cards —
  is gone on desktop (sidebar + dashboard header already cover it; the mobile
  header keeps its inline menu). The sidebar's hardcoded fake "6-day streak"
  card was removed (invented data in a trust-first app). Nav labels
  sentence-cased.
- **Honest states**: settings' four permanently-disabled buttons replaced
  with "Coming soon" badges (no invented support email); "Off"/"0" hero chips
  humanized ("Not linked", "None"); nutrition quick-add no longer pre-fills
  phantom macros (420 kcal etc.) — empty inputs, Add disabled until valid;
  coach AI-status fallback no longer shows engineering copy in a
  success-toned chip; raw confidence tokens ("database") mapped to user
  labels everywhere.
- **Visual aids added where numbers stood alone**: score-page contributor
  bars + "No inputs yet" badge; grocery "checked off" progress bar;
  meal-plan per-day slot segments; profile macro-split bar with percent
  caption; weight start→goal projection bar; menu-review budget fill bars;
  marketing hero's fake CSS quarter-arc replaced with a real SVG progress
  ring.
- **Proportion & layout**: workout detail hero no longer wraps per-syllable
  at 1280 (CTAs stack below the title; title one size down); recipe cards
  ~2× denser on mobile (4-across macro chips); grocery mobile cards collapsed
  to check-off rows with per-item expand; recovery soreness tiles 2×2 on
  phones; profile hero truncation fixed ("Alex Prev…" → full name, short
  goal labels); onboarding progress no longer triple-encoded; oversized
  coach mobile hero compressed.
- **Bug found and fixed in passing**: the dashboard calorie ring's count-up
  could stick at a negative/zero value when rAF is throttled (backgrounded
  tab / webview) — eased `t` is now clamped and a settle timeout pins the
  terminal value.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean.
- `npm run test:unit` — 36 files, 271 tests passed.
- `npx playwright test --project=chromium` — 71 passed, 12 skipped (webkit
  project gated off). Two test files were updated where assertions enshrined
  the old flaws (smoke: coach placeholder + confidence-token strings); the
  suite caught one real regression during the pass (recipes chip-row wrapper
  inflating page width at 390/430 — fixed with `min-w-0`).
- `npm run build` — exit 0, all routes compiled.
- After-evidence: `surf-evidence/design-pass/after/` (50 shots) and
  `after-segs/` (168+ segments); spot-checked dashboard, daily-review,
  fitness, grocery, marketing, workout detail, profile at both widths — no
  AGENTS.md blockers (no blank screens, console errors, clipped text,
  sub-44px touch targets, or worse-than-baseline mobile layout).

## Notes / follow-ups

- No new subpages were added: all eight critics judged the existing route
  set complete for the core journeys; every improvement landed on existing
  surfaces.
- Rule conflict surfaced per global CLAUDE.md: the Next.js stack rule says
  "don't run `next build` for verification", but the project AGENTS.md
  explicitly requires lint/build before committing UI changes — the
  narrower project rule won.
- The nutrition "Fitness detail" link card and fitness-page "Edit routine"
  self-link are candidates for a future pass (low value, left untouched).
- All changes are uncommitted on `surf/ios-responsive-ux-recovery` (pushes
  are blocked on gh auth per BLOCKERS.md; commit/push needs your go-ahead).

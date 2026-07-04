# Surf report — FuelWell UI polish (ui-polish-refine)

Date: 2026-07-04 · Branch: `surf/ui-polish-refine` (base `3103286`, today's main) ·
**50 files changed, +448/−159** across 12 commits. Never pushed. Layouts, navigation,
routes, and page architecture unchanged throughout, per the aspect.

## Aspect & goal function
Refine and polish every layer of the existing UI without changing its major structure:
visual consistency, interaction states, micro-interactions (reduced-motion respected),
form quality, accessibility, responsiveness, microcopy, perceived performance,
affordances, robustness with awkward data. Goal function: `goal.md`.

## Campaign shape
- **Phase 1** — inventory (`inventory.md`), 80 grounded personas, 52 baseline screenshots.
- **Phase 2** — first pass: live time-based greeting (was hardcoded "Good evening /
  Tuesday"), kcal unit + separators on dashboard macros, coach history/audit APIs no
  longer 500 in preview mode, global `prefers-reduced-motion` support, user-menu
  Escape/outside-click dismissal.
- **Phase 3** — 20 reviewer agents × 4 personas exercised the live app → **368
  evidence-backed findings** (after a 12-agent top-up to enforce the ≥4-per-persona floor).
- **Phase 4** — clustered to 70; 8 cleared the ≥8/20 consensus bar; adversarial skeptics
  killed 2 as tooling artifacts (C02 "invisible 0×0 sidebar" = display:none measurement
  artifact; C08 "unlabeled icons" = labels exist) → official backlog **B1–B6**.
- **Phase 5** — serial dev loop, one commit per item, acceptance check verified per item
  (details in `backlog.md`):
  - **B1** 44px mobile touch targets (log 81→0 sub-44px, fitness 12→0, dashboard 7→0)
  - **B2** inline validation layer (signup, custom meal, portion cap 5,000, onboarding
    disabled-Next hints, progress weight) — includes the 999,999 g → "1,649,998 kcal day"
    data-integrity hole
  - **B3** focus indicator: root cause was shadcn base `outline-ring/50` rendering every
    focus outline at 50% alpha (2.43:1 / 1.92:1) → now one solid 3px indicator
    (~5.7:1 light, ~19:1 dark)
  - **B4** one unit/number format (kcal everywhere, tight grams, separators ≥1,000)
  - **B5** loading skeletons for all 14 main app routes (verified under slow-3G client nav)
  - **B6** one spacing rhythm (page stacks space-y-6; /app/log chip groups identical;
    unique button paddings 8→5)
- **Phase 6** — 10 fresh personas re-reviewed: B2/B3/B6 held; 3 candidates escalated,
  skeptics reproduced 2: **R1** (44px extended to progress/coach/settings/daily-review/
  recipes — now 5/5 routes pass) and **R2** (bare "Cal" labels in 5 components → kcal;
  meal-plan separators — 13/13 routes pass). **R3** (skeletons "missing") was **refuted**:
  reviewers tested full document loads, which `loading.tsx` doesn't cover; throttled
  client-side navs show the skeleton for 400–1,100 ms.
- **Phase 7** — 3 clean-context cohesion reviewers (diff, live-visual, ux-flow) found
  seams; fixed: "Avg cals"→"Avg kcal", meal-level separators, one unit-spacing idiom,
  Button focus ring unified with the 3px language, weight field blur-gated + 60 lb floor
  aligned with onboarding, custom-meal over-max typo-hint voice + focus-first-invalid +
  submit no longer self-disables, ingredient drawer closes on Escape, hero-variant
  skeletons for dark-hero routes. **Final clean-context pass: COHESIVE** (3 severity-1
  nits remain, recorded in `findings/phase7-final-verdict.json`).

## Deliberately declined (with rationale)
- Reverting Button md `py-3` on desktop — it is B6's padding consolidation (8→5 variants).
- One validation-timing model for all forms — live-preview numeric fields keep live
  errors; text fields validate on blur; the collapsed mini-form validates on submit.
- Cross-page chip font unification (log semibold vs elsewhere font-black) — larger
  design-system decision, out of polish scope; recorded as a nit.
- C08 residual: `/app/daily-review` expanders named generically ("Expand"/"Hide").

## Verified vs. not verified
**Verified** (all on the final tree):
- `npm run build` exits 0; `npm run lint` = 3,851 problems — identical to pre-campaign
  baseline (zero new); `npm run test:unit` 173/174 — the 1 failure
  (tools.test.ts check_grocery_item) **pre-dates the campaign** (verified on clean base).
- Full sweep, 26 routes × desktop/iPhone: all 200, zero horizontal scroll, **zero console
  errors** (baseline had 2 from the coach API 500s).
- All B1–B6 + R1–R2 acceptance checks pass (scripts in scratchpad; results in backlog.md).
- Reduced-motion emulation collapses transitions (~1e-05 s) on dashboard/log.
- Keyboard focus renders one 3px solid indicator on light and dark surfaces.
- Before/after evidence: `evidence/before/` vs `evidence/after/` (52 shots each) +
  `evidence/phase3/` reviewer captures.

**Not verified / known limits:**
- Preview deployment parity: work is local on the branch; the deployed
  fuelwell-preview.vercel.app reflects main until this branch is merged/deployed.
- Coach LLM turn flow (needs ANTHROPIC key) exercised only as UI states, not real turns.
- The pre-existing grocery unit-test failure and the 164 pre-existing lint errors were
  intentionally left (out of scope; surgical-changes rule).
- Below-threshold clusters (C07 labels, C10 tone, C11 empty states, C12 success toasts,
  C13 zoom, C14 brand contrast, C16 /preview hierarchy, C20 color-only encoding, C21 dark
  mode…) are recorded in `backlog.md` as future candidates — consensus never elevated them.

## Spend (approximate, from workflow usage)
Phase 3 swarm 1.61M + top-up 0.95M · Phase 4 cluster 0.12M + skeptics 0.64M ·
Phase 6 re-review 0.78M + skeptics 0.20M · Phase 7 cohesion 0.41M + final 0.13M
≈ **4.8M subagent tokens** across 68 agents, plus the main-loop dev work. No budget cap set.

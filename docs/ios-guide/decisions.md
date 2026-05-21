# FuelWell — Decisions Log

Every deviation from the Consensus Stack or the Reconciliation Matrix gets written here, with a date and a reason.

If a decision is temporary (a spike, a proof of concept, an experiment), include a sunset date.

## 2026-05-02 — Initial stack commitment

Adopting the FuelWell production stack: TCA + SwiftUI + SQLiteData + Supabase, with Claude Code, Claude Design, and ChatGPT Images 2.0 as the AI tooling layer. Deployment target iOS 17, SDK iOS 18.

References: `docs/consensus-stack.md`, `docs/reconciliation-matrix.md`.

## 2026-05-13 — Phase 0 gap analysis sign-off

All 12 gap-analysis items + 10 engineering defaults resolved. Robert ✅ + Max ✅ countersigned. Substantive Max additions: (a) coach must recognize multi-day behavioral patterns and surface subtle macro adjustments; (b) Dashboard above-the-fold contract; (c) Photo-default Add Meal; (d) weekly-default Progress; (e) grouped Grocery; (f) Lifestyle onboarding step; (g) Daily Recap screen; (h) empty states required on every screen as "brand moments."

References: `docs/FuelWell-Gap-Analysis.md`, `docs/FuelWell-Gap-Analysis-Log.md`.

## 2026-05-14 — Canonical DESIGN.md promoted

Robert generated the canonical design system in Claude Design (project `019ddbc6-73f6-7d05-b865-d559378d48fa`). Promoted from `drafts/DESIGN.md.draft` to `docs/ios-guide/DESIGN.md`. Key resolutions:

- **Light-mode native** is canonical. Dark variant is opt-in only.
- **Brand green `#47E7B0`** confirmed canonical mark. **`#3D9B2F` retired.** `src/lib/design-tokens.ts` updated this date.
- **Action/success green `#00D278`** is a *separate* token for verdicts / macros / on-track chips.
- **`bg.elevated` `#0F1117`** is the inverted-highlight-row device for emphasis against light surfaces.
- Anti-patterns explicitly ban streaks, badges, gamification, and aggressive multi-stop gradients on flat surfaces.
- SF Symbols only on iOS; Lucide on web for parity.

The pre-DESIGN.md dark Dashboard mockup was rebuilt from scratch on canonical light. The old version contained banned patterns (streak chip, card gradients) and is gone.

References: `docs/ios-guide/DESIGN.md`, commit `62c4bb9`.

## 2026-05-14 — Pilot scope expansion: Health Score, Workouts, Habits

Robert decided to mirror the Claude Design Core Dashboard composition. App Map grew from 14 to 17 top-level screens:

- **Health Score** — composite diagnostic metric (nutrition + training + sleep + recovery + body comp). Hero on Dashboard, detail screen under Progress.
- **Workout Plan / Detail** — per-day exercise list with sets/reps/target weight + "Start workout" CTA.
- **Habit Tracking** — dot-grid visualization (no streak chrome, no rewards).
- **Daily Recap**, **Lifestyle onboarding step** — both already added in Max's review.

Blake Anderson social-feed toast from the Claude Design reference is **excluded** from Pilot.

⚠️ **Open scope flag (needs Robert + Max):** the new Workout Detail screen has a Start-workout button and implies an in-app workout session timer. That exceeds "manual entry only" as originally resolved in scope delta S1. Three options:
  (a) Keep as designed — workouts become a real Pilot feature with logging during the session.
  (b) Restrict to passive view + post-workout manual log (no Start-workout button).
  (c) Defer Workout Detail to v1.5; Dashboard widgets stay (day tiles + to-do list) but no detail screen at Pilot.

**Resolution 2026-05-14:** Robert chose **(a)**. Workouts are now a first-class Pilot feature with in-session logging (Start workout → per-set timer + logger → finish summary). Scope delta S1 is superseded by this decision. Max confirmation pending but Robert is empowered to make this call solo (no business-rule impact, pure product scope).

References: `docs/ios-guide/APP-MAP.md`, `docs/ios-guide/FLOW-CHART.md`, `docs/ios-guide/WIREFRAME-PROMPTS.md`.

## 2026-05-14 — External account confirmations

- ✅ Apple Developer (Individual)
- ✅ Anthropic API key
- ✅ Supabase project (project ID + service-role secret in hand)
- ⏳ Sentry — not yet set up (deferrable to Phase 5 Quality)
- ⏳ PostHog — not yet set up (deferrable to Phase 6 Pilot ship)

Sentry + PostHog do not block Phase 1; both can be wired in later phases when they actually carry weight.

## 2026-05-14 — Editor decision: Xcode

Robert chose **Xcode** over Cursor for Phase 1 iOS work. Aligned with the iOS Production Guide's default. Claude Code remains the primary AI coding agent (CLI / web), running alongside Xcode.

## 2026-05-19 — App Map v2 reorganization

Robert reorganized the IA after reviewing the Round 1 mockups. Max's Phase 0.5 Step 2 review provided five blockers; all are resolved below. **All 27 Round 1 mockups stay** — they're re-homed in the new tab/menu structure, not replaced.

### Tab bar — Coach-centered

Tab order: **Home · Meals & Nutrition · Coach · Exercise & Activity · Progress**.

- "Log" tab renamed to **Meals & Nutrition**.
- "Learn" tab dissolved into the new **Help screen** (accessed from Dashboard top bar). Article content unchanged; surface relocated.
- New tab: **Exercise & Activity** — hub landing for Workout Detail, Workout Log, Activity Tracker, Workout Plans, Exercise Library, Schedule.
- **Coach tab is the centerpiece.** Distinct visual treatment: speech-bubble icon, inverted `bg.elevated #0F1117` container, slight elevation. Treated as a featured action even when inactive.

### New navigation surface — hierarchical Menu

Opened from the hamburger top-left of Dashboard (and any screen). Sections: **Tools** (Snapshot · Tracking · Meals · Training subgroups) · **Coach** · **Settings** · **Help** · **About**. Every Pilot screen is reachable from the Menu.

### Help screen — replaces v1 Learn tab

Top-right Dashboard icon. Combines: search bar, featured article, categories, continue-reading, quick settings rows, talk-to-coach link, send feedback. Article tone unchanged (≤3 min reads, "One thing to try today" takeaway).

### Resolved blockers from Max's Step 2 review (2026-05-19)

**1. Dashboard above-the-fold density — RESOLVED with Tier 1/2/3 framework.** Max's hard ceiling: max 3 visual units above the fold.

- **Tier 1 (above fold):** Health Score hero · Inflows/Outflows widget · Verdict-of-the-moment CTA
- **Tier 2 (first scroll):** Activity overview · Nutrition/Meals overview · My day/week/month view
- **Tier 3 (progressive):** Progress overview · Daily Recap (after 8pm) · Coach nudge (event-driven)

Habit Tracking is OFF the Dashboard in v2 — lives in Progress tab and Menu.

**2. Health Score v1 formula — RESOLVED.**

| Component | Weight |
|---|---|
| Nutrition adherence | 35% |
| Training consistency | 25% |
| Sleep | 20% |
| Recovery (HRV / RHR) | 10% |
| Body comp trend | 10% |

- Range: 0–100. Rolling 7-day window per component (body comp uses goal-direction trend).
- Missing component: **excluded**, remaining components re-weighted proportionally. No penalty zeros.
- Day-1 fallback: "Building your baseline — 7 days of data unlocks your Health Score" + placeholder ring. No score number rendered.
- Score is a diagnostic, not a competition. No leaderboards, no friend comparisons, ever.

**3. Workout Detail active session — RESOLVED.** Specified as a three-state flow on the same screen (pre-workout · active · summary). Active session includes: current exercise card, per-set logger sheet, rest timer chip, next-exercise advance, pause, end-workout summary with RPE selector. Full spec lives in `FLOW-CHART.md` § 3.21.

**4. Empty states — RESOLVED with table.** 26 empty-state copy lines documented in `APP-MAP.md` § 9, all in coach voice, covering every screen that can render data-empty. Priority four (Meal Log Day 1, Progress no-data, Coach Chat first open, Grocery List empty) are locked.

**5. Daily Recap trigger — RESOLVED.** 8pm local device time. Quiet hours 10pm–7am still clear by 2 hours. Inherits future user-customized notification schedules. Travel: triggers at 8pm in the new local zone after the device switches; no retro-fire.

### New Dashboard widget: Inflows/Outflows

Creative energy-balance visualization, in two forms:
- **Dashboard widget:** dual concentric ring. Outer = calories ingested by macro (P/C/F). Inner = calories expended by source (BMR / activity / workout). Center = net surplus/deficit. Day/Week/Month/Year toggle.
- **Full-screen view:** Sankey-style flow diagram. Left lanes (food categories) flow into total intake; total intake flows across to total expenditure; right lanes split into BMR / activity / workout. Tap any lane → drill-down sheet.

### 13 new/elevated top-level screens in v2

10 require new mockups (catalog in `MOCKUP-PROMPTS-v2.md`): Dashboard v2 · Inflows/Outflows widget · Inflows/Outflows fullscreen · Activity overview widget · Meals & Nutrition hub · Exercise & Activity hub · Progress overview v2 · Menu sheet · Help screen · Tab bar component.

3 are sub-pages under the new Exercise & Activity hub that get their own mockups in Round 2: Workout Log · Activity Tracker · Workout Plans (Exercise Library and Schedule deferred to v1.5 unless Pilot scope expands again).

References: `docs/ios-guide/APP-MAP.md` v2, `docs/ios-guide/FLOW-CHART.md` v2, `docs/ios-guide/MOCKUP-PROMPTS-v2.md`.

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

References: `docs/ios-guide/APP-MAP.md`, `docs/ios-guide/FLOW-CHART.md`, `docs/ios-guide/WIREFRAME-PROMPTS.md`.

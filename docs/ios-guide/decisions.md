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

## 2026-05-21 — Phase 0.5.3 — Final review consolidation

Consolidates 58 reviewer change requests from Max's Phase 0.5 Final Review + Robby's mockup corrections + Robert's audit pass. Each decision below is non-negotiable downstream. Source citations: R-* prefixes = Robby; M-* = Max; A-* = audit.

- **D1:** Health Score keeps its name. In user-facing copy, avoid the word "diagnostic" (regulatory-clinical). In internal docs, "diagnostic" is OK.
- **D2:** Voice mode is OUT of Pilot. Remove Coach Chat voice mode (M30 V3 full-screen overlay). Mic-button-to-text remains; no streaming voice.
- **D3:** Exercise & Activity is first-class at Pilot. All six sub-pages stay: Workout Log, Activity Tracker, Workout Plans, Exercise Library, Schedule, Trainer workouts.
- **D4:** Menu is full hierarchical-collapsed. Single-pane view. Categories visible by default; tap to expand. No two-tier tile redesign. Larger text + less whitespace.
- **D5:** Inflows/Outflows widget = V1 (Full dual ring). Both rings, composition labels, inflow/outflow icons. Drop V2 and V3.
- **D6:** Tab bar = V2 (raised-circle FAB-style Coach). Drop V1 (speech-bubble).
- **D7:** Day 1 Dashboard welcome-mode IN. First session before meals/workouts logged → ring replaced by single large welcome card ("Start here: log your first meal"). Populated state = canonical Dashboard. Both states co-exist; welcome card collapses after first meal logged.
- **D8:** Favorites/must-have ingredients in Dietary onboarding DEFERRED.
- **D9:** Tab labels = single words in the bar: Home · Meals · Coach · Exercise · Progress. Full names (Meals & Nutrition, Exercise & Activity) appear as screen titles on hub landings.
- **D10:** Learn home (Screen 31, slug 21-learn-home) NOT shipping in Pilot. Remove from screen inventory. Help screen carries all article content.
- **D11:** Recovery baseline = 14-day rolling average of resting HR. Before 14 days, Recovery excluded from Health Score and remaining components proportionally re-weight. Detail screen shows: "Recovery unlocks with wearable data (Apple Watch or compatible device)" — not silent reweight.
- **D12:** Macro History is a deep-link, NOT a separate screen. Meals & Nutrition hub's "Macro History" row deep-links to Progress → Macro adherence. Remove standalone Macro History from inventory.
- **D13:** Coach voice "no-gos" (apply in all coach-facing copy): (1) never use "you missed", "you skipped", "you went over"; (2) never show adherence below 60% as an absolute % without trend comparison; (3) Daily Recap always leads with neutral/positive before any gap observation.
- **D14:** Health Score delta framing = cause-first. Instead of "↓ −2.3 vs last week", show "↓ sleep variance this week". Apply on Dashboard hero and Health Score detail screen.
- **D15:** Offline write queue is IN at Pilot. Local SQLite write queue with reconnect-sync. Update all "offline = read-only" copy in flow chart and mockups.
- **D16:** Daily Recap dynamic trigger. Fires 90 min before user's typical sleep wind-down (read from HealthKit sleep schedule). Replaces fixed 8 PM. Quiet hours 10pm–7am hard floor.
- **D17:** Notification preview defaults to private (e.g. "Your coach has an update"). Detailed previews opt-in.
- **D18:** Coach online indicator → typing indicator pattern. Remove persistent green "ONLINE" dot from Coach Chat; replace with subtle typing dots when coach is responding.
- **D19:** Progressive onboarding reveal (Day 1→Day 7 tab unlock) DEFERRED to Phase 1.1.

### Cross-references

- `docs/ios-guide/APP-MAP.md` (v2.1) — IA reflects D2, D4, D7, D9, D10, D11, D12, D13, D14.
- `docs/ios-guide/FLOW-CHART.md` (v2.1) — flows reflect D2, D9, D7, D15, D16, D17, D18, plus Macro History/Learn home removals (D10, D12).
- `docs/ios-guide/mockups/` and the combined Phase 0.5 review PDF — visual deck reflects D5, D6, D7, D18 in Round 2 corrections.

### Net-new patterns introduced in Phase 0.5.3

These are platform-wide patterns that get referenced by individual screens, not standalone screens of their own.

**C.1 Offline write queue (D15).** Local SQLite queue with reconnect-sync. While offline, any meal log / weight entry / mood / measurement / workout summary is appended to a local `pending_writes` table and the UI shows a small inline banner: "Offline — N logs will sync when you reconnect." A subtle dot appears on the Home tab icon when the queue is non-empty. Background sync fires on the next successful network call (or app foreground if already online). Conflict resolution: last-write-wins for own data (no merge UI needed — same user, single source). Server-side reconciliation logs duplicates but does not surface conflicts.

**C.2 In-app bug reporting (A7).** New sub-screen "Send feedback" reachable from Menu › Help › Send feedback. The screen auto-captures: a screenshot of the current screen at the moment Help was opened, the app version, the current screen route, the timestamp. The user adds a free-text description and submits. Submission posts to a Supabase `feedback` table with the captured metadata plus the user_id. Confirmation: a snackbar "Thanks — we got it" with a "View status" link to a (read-only) feedback history view. **Not a separate top-level mockup** — render-time decision: it's reachable through Help and follows the standard sheet-modal pattern.

**C.3 Undo affordance pattern (A10).** Global pattern. After any Save action (meal log, weight entry, mood entry, photo upload, measurement entry), a 5-second snackbar appears at the bottom (above the tab bar) with the form "Saved · Undo". Tapping Undo reverses the action. Snackbar auto-dismisses after 5s. Visual: `--bg-elevated` dark surface, `--text-on-dark` for the "Saved" label, `--action-green` for the tappable "Undo". Defined once here, referenced from every screen that has a Save action.

**C.4 Data-freshness stamps (A9).** Copy pattern applied to surfaces whose accuracy depends on the latest sync from HealthKit / log. Stamp format:
- Less than 12h old: "based on data as of HH:MM today"
- 12–36h old: "based on data as of yesterday HH:MM"
- More than 36h old: "data is stale — last sync DATE" plus an action chip to manually re-sync.

Applied to: Dashboard Verdict CTA, Coach Chat responses, Health Score hero, Inflows/Outflows widget center. Style: `--text-muted`, font-size 9–10pt, weight 400. Italics optional.

**C.5 Dynamic Daily Recap trigger (D16).** Replaces the prior fixed-8pm trigger. Computation:
- Read the user's typical sleep onset time from HealthKit (7-day rolling median of sleep-stage data).
- Trigger time = sleep onset − 90 min.
- Hard floor: never before 19:00 local, never after 22:00 local. Clamp to that window.
- If no sleep data exists yet (Day 1–7), default to 20:30 local.
- Quiet hours 22:00–07:00 still take precedence — if the computed time would land inside quiet hours due to clamping issues, suppress the notification entirely that day.
- Travel: triggers in the new local zone after the device switches; no retro-fire.

**C.6 Reduce-manual-tracking audit.** Screens where manual input was previously the default and is now skippable or auto-detected at Pilot:

| Screen | Old default | New default at Pilot |
|---|---|---|
| Mood entry | Required for Daily Recap completion | **Skippable** — Daily Recap fires without mood; coach can ask "How did today feel?" inline if context warrants |
| Body photos | Weekly required tile | **Skippable** — surfaced as a gentle prompt, never blocking |
| Body measurements | Weekly required entry | **Skippable** — auto-pulled from HealthKit where available |
| Workout sets | Manual per-set logger | **HealthKit auto-capture preferred** — manual logger remains as override |
| Macros / meal | Manual search-and-add | **Photo-log default primary path** — manual search is a secondary tab |
| Weight | Manual entry | **HealthKit auto-pull** — manual entry is the fallback |

Principle: manual logging is the exception, not the baseline. The Coach voice should reinforce this — e.g., "I'll pull your weight automatically from HealthKit. Tell me if you want to override it."

## 2026-05-31 — W2 data-layer execution defaults

- **D20:** Use a dedicated app Supabase project for app data by default. Do not mutate the existing marketing/Founding 100 production project or any live `founders_100` rows until Robert explicitly approves the target and the production snapshot step.
- **D21:** Supabase is the server source of truth. The app keeps a local read-through/write-behind cache for Pilot, with a durable local pending-write queue and last-write-wins conflict handling for a single user's own records.
- **D22:** Migration authorship and live migration application are owned by W2 only. Other workstreams may consume `feature_flags`, `coach_usage`, commerce tables, and profile data only after W2 lands the migration files and Robert runs the guarded apply path against the chosen project.

# FuelWell — Gap Analysis Resolutions

Phase 0 worksheet. All 12 items resolved 2026-05-13. Locked for Pilot build.

| # | Open item | Resolution |
|---|---|---|
| 1 | Education layer | **Learn tab** with full search + categories, plus inline contextual cards in coach replies. Both surfaces, one content store. |
| 2 | Restaurant DB vs. photo-menu | **Curated database** of top chains for Pilot. Photo-menu OCR deferred to v1.5. |
| 3 | Dynamic macro recalc | **Weekly auto-recalc** + manual "Recalculate My Plan" button. Post-workout adjustment is Premium (v1.5). **Max addition:** coach must recognize multi-day behavioral patterns (high hunger, low energy, fatigue, poor recovery, adherence struggles) and surface subtle, supportive adjustment recommendations — never robotic or guilt-inducing. Phase 1 backend must support pattern recognition over rolling windows, not just calendar-week cron. |
| 4 | Trainer compatibility | **Manual entry only** — "log my trainer's workout" free-form. No adaptive logic at Pilot. |
| 5 | Recomposition timeline | **Hidden at Pilot.** Defer to Premium tier in v1.5. |
| 6 | Proactive coaching cadence | **Event-driven only**, quiet hours 10pm–7am. No time-based daily pings. |
| 7 | Grocery list source of truth | **Both** — auto-generated from selected recipes, plus manual additions. |
| 8 | Progress tracking inputs | **Full set**: weight, macros, body photos, body measurements, daily mood/energy rating. |
| 9 | HealthKit scope | **Read-only** at Pilot: weight, steps, workouts, active energy. Write-back deferred to v1.5. |
| 10 | Auth model for pilot | **Apple Sign-In + email/password.** Apple Sign-In required by App Store guidelines once any other method exists. |
| 11 | Offline behavior | **Online-only** at Pilot. View cached data offline; cannot log new entries. Offline-first deferred. |
| 12 | AI provider & cost ceiling | **Anthropic Claude.** $5/user/month soft cap, $10/user/month kill-switch. |

## Additional Pilot scope decisions

| Item | Resolution |
|---|---|
| Meal plan generator | Three plan options per generation, user picks one. |
| Apple Developer account | Individual (not Organization). |
| Learn tab depth | Full search + categories (not minimal). |
| Coach proactivity triggers | Skipped meal, over-target macros, missed workout, weight-trend deviation. |

## Scope note

Pilot is meaningfully larger than the original 7-feature spec. Added since first draft: full meal plan generator (3 options), Learn tab with search, body photos, body measurements, mood tracking, curated restaurant database. All accepted with eyes open — tracked here so we don't pretend the scope is still small.

**Sign-off:** Robert ✅ 2026-05-13  ·  Max ✅ countersigned 2026-05-13

## Max's annotations (full text in `FuelWell-Gap-Analysis-Log.md`)

Substantive additions beyond agreement:

- **#3 Recalc:** behavioral-pattern recognition required (see resolution above).
- **#7 Grocery:** confirms grouping by category (produce, protein, pantry).
- **#8 Progress:** daily UX must be lightweight — mood/energy is one-tap, photos/measurements skippable.
- **#11 Offline:** require a graceful "you're offline — here's your last sync" state, not a broken-looking UI.
- **#12 AI cost:** monitor Founders 100 first 30 days specifically — early adopters may exceed $5 average.
- **#6 Proactive coaching:** long-term roadmap note — user-configured check-ins as opt-in Premium feature (not Pilot).

All other items: aligned, no deltas.

# FuelWell — Gap Analysis Q&A Log

Detailed log of Phase 0 alignment questions and Robert's answers. Companion to `FuelWell-Gap-Analysis.md` (which is the clean resolution table).

**Format:** Questions in default text. <span style="color:#47e7b0">**Answers in FuelWell green.**</span>

**Provenance note:**
- **Part 1 (items 1–12, scope add-ons)**: questions reconstructed from worksheet prompts and conversation context. Answers captured verbatim from the resolution column / chat record.
- **Part 2 (engineering defaults, 10 items)**: questions and answer are verbatim from the 2026-05-13 session.

Date of final sign-off: 2026-05-13.

---

## Part 1 — Gap Analysis Worksheet (items 1–12)

### 1. Education layer

**Q:** Where does the education layer live? A dedicated tab, inline cards inside coach replies, or modal lessons that interrupt the user?

<span style="color:#47e7b0">**A:** Full Learn tab with search and categories, **plus** inline contextual cards inside coach replies. Both surfaces, one underlying content store.</span>

### 2. Restaurant DB vs. photo-menu

**Q:** For restaurant guidance, do we ship a structured database, photo-menu OCR, or curated top-N chains for the Pilot?

<span style="color:#47e7b0">**A:** Curated database of top chains for Pilot. Photo-menu OCR deferred to v1.5.</span>

### 3. Dynamic macro recalc

**Q:** What triggers a macro recalculation — weekly cron, weight-change threshold, streak break, or coach-initiated only?

<span style="color:#47e7b0">**A:** Weekly auto-recalc plus a manual "Recalculate My Plan" button. Post-workout adjustment moves to Premium tier in v1.5.</span>

### 4. Trainer compatibility

**Q:** Do we support external trainer plans in the MVP, defer entirely, or offer a view-only import?

<span style="color:#47e7b0">**A:** Manual entry only — free-form "log my trainer's workout." No adaptive logic at Pilot. Philosophy: enhance trainers, don't replace them.</span>

### 5. Recomposition timeline

**Q:** Do we show a body-recomposition timeline projection, hide it, or build a full feature around it?

<span style="color:#47e7b0">**A:** Hide at Pilot. Defer to Premium tier in v1.5 once we have enough photo history to make projections meaningful.</span>

### 6. Proactive coaching cadence

**Q:** Should proactive coaching be daily check-ins, event-driven only, or some hybrid? Any quiet hours?

<span style="color:#47e7b0">**A:** Event-driven only, with quiet hours 10pm–7am. No time-based "good morning" pushes. Triggers: skipped meal, over-target macros, missed workout, weight-trend deviation.</span>

### 7. Grocery list source of truth

**Q:** Is the grocery list generated automatically from selected recipes, manually built by the user, or both?

<span style="color:#47e7b0">**A:** Both. Auto-generated from selected recipes, plus manual additions.</span>

### 8. Progress tracking inputs

**Q:** Beyond weight and macros (confirmed), do we include body photos, body measurements, and mood/energy ratings in the MVP?

<span style="color:#47e7b0">**A:** Full set — all three. Weight, macros, body photos, body measurements, and daily mood/energy rating.</span>

### 9. HealthKit scope

**Q:** Is HealthKit integration read-only or read/write? Which specific metrics?

<span style="color:#47e7b0">**A:** Read-only at Pilot. Metrics: weight, steps, workouts, active energy. Write-back deferred to v1.5.</span>

### 10. Auth model for Pilot

**Q:** Supabase email/password, Apple Sign-In required, or both?

<span style="color:#47e7b0">**A:** Apple Sign-In **and** email/password. Apple Sign-In is required by App Store guidelines once any other auth method exists, so this is effectively forced.</span>

### 11. Offline behavior

**Q:** Can the user log a meal offline and have it sync later, or is the Pilot online-only?

<span style="color:#47e7b0">**A:** Online-only at Pilot. Recently cached data is viewable offline, but new entries require connectivity. Offline-first sync deferred to v1.5.</span>

### 12. AI provider & cost ceiling

**Q:** Claude or GPT? What is the per-user monthly cost cap?

<span style="color:#47e7b0">**A:** Anthropic Claude (locked in the Consensus Stack). $5/user/month soft cap, $10/user/month kill-switch.</span>

---

## Part 1b — Additional Pilot scope decisions (raised in conversation)

### Meal plan generator

**Q:** When the meal plan generator runs, does it produce a single plan, two options, or three options for the user to choose from?

<span style="color:#47e7b0">**A:** Three plan options per generation. User picks one.</span>

### Apple Developer account type

**Q:** Individual or Organization Apple Developer account?

<span style="color:#47e7b0">**A:** Individual.</span>

### Learn tab depth

**Q:** Minimal Learn tab (a handful of articles), or full search with category navigation?

<span style="color:#47e7b0">**A:** Full search plus categories.</span>

---

## Part 2 — Engineering Defaults (2026-05-13, verbatim)

**Framing question (verbatim):**

> Now the engineering and AI/account decisions. These are things where there's a clear "right answer" given the consensus stack and Apple's rules — most don't need real debate. Let me list my defaults; you reply "approve all" or call out anything you want to change.

### Table of defaults as presented

| # | Decision | Recommended default | Rationale |
|---|---|---|---|
| 1 | AI provider | Anthropic Claude (already locked) | Set in Consensus Stack. The Pilot coach uses Claude. |
| 2 | AI cost ceiling per user | $5/month soft cap, $10/month kill-switch | Average Pilot user ~2–3 meals + 5–10 coach messages/day → ~$2–4/month per active user at current pricing. $10 is a safety net. |
| 3 | HealthKit scope at Pilot | Read-only: weight, steps, workouts, active energy | Vision doc lists Apple Health as primary integration. Read-only is faster and avoids Apple Review nitpicking on write permissions. Write-back deferred to v1.5. |
| 4 | Authentication | Apple Sign-In + email/password fallback | App Store guidelines REQUIRE Apple Sign-In if the app has any other auth method. Effectively forced. |
| 5 | Offline behavior | Online-only at Pilot; view cached data; can't log new meals offline | Offline-first sync is hard to get right. Pilot users have wifi most of the time. Defer to v1.5. |
| 6 | Grocery list generation | Auto from selected recipes + manual additions | Master_v2 calls "recipe → grocery auto-sync" a critical add. Users can also add items by hand. |
| 7 | Proactive coaching cadence | Event-driven only, with quiet hours 10pm–7am | No time-based "good morning" pushes. Notifications only fire on real triggers (skipped meal, over-target, missed workout). Matches "no judgment" principle. |
| 8 | Macro recalculation trigger | Weekly auto-recalc + manual "Recalculate My Plan" button | Per Master_v2: Pro tier is "static baseline + weekly adjust." Post-workout adjustments → Premium in v1.5. |
| 9 | Trainer compatibility | Manual entry: "My trainer gave me this workout — log it" with free-form exercise list | Vision philosophy: enhance trainers, not replace them. No adaptive logic at Pilot. |
| 10 | Recomposition timeline | Hide at Pilot, defer to Premium | Master_v2 lists this as a Premium-only feature. Adds visual complexity and depends on enough photo history to be meaningful. |

**Robert's response (verbatim):**

<span style="color:#47e7b0">**A: "Approve all"**</span>

All 10 engineering defaults locked as recommended.

---

## Sign-off

| Reviewer | Status | Date |
|---|---|---|
| Robert | ✅ All 22 items resolved | 2026-05-13 |
| Max | Pending countersign | — |

**Source documents:**
- Clean resolution table: `docs/FuelWell-Gap-Analysis.md`
- Phase plan status: `docs/FuelWell-Phase-Plan.md` (Phase 0 ✅ complete)
- Strategic context: `docs/MASTER-PLAN.md`

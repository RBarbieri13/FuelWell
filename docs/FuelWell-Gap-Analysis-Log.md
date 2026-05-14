# FuelWell — Gap Analysis Q&A Log

Detailed log of Phase 0 alignment questions and Robert's answers. Companion to `FuelWell-Gap-Analysis.md` (which is the clean resolution table).

**Format:** Questions in default text. <span style="color:#47e7b0">**Robert's answers in FuelWell green.**</span> <span style="color:#A855F7">**Max's comments in violet.**</span>

**Provenance note:**
- **Part 1 (items 1–12, scope add-ons)**: questions reconstructed from worksheet prompts and conversation context. Answers captured verbatim from the resolution column / chat record.
- **Part 2 (engineering defaults, 10 items)**: questions and answer are verbatim from the 2026-05-13 session.

Date of final sign-off: 2026-05-13.

---

## Part 1 — Gap Analysis Worksheet (items 1–12)

### 1. Education layer

**Q:** Where does the education layer live? A dedicated tab, inline cards inside coach replies, or modal lessons that interrupt the user?

<span style="color:#47e7b0">**A:** Full Learn tab with search and categories, **plus** inline contextual cards inside coach replies. Both surfaces, one underlying content store.</span>

<span style="color:#A855F7">**Max:** The dual-surface approach is the right call. Inline contextual cards keep education from feeling like homework — users get the right explanation at the right moment without leaving their flow. The Learn tab gives them somewhere to go when they want to dig deeper. One thing I want to make sure of: the education tone should feel like a smart friend explaining something, not a textbook. Every piece of content should answer "why does this matter to me?" — not just "what is this."</span>

### 2. Restaurant DB vs. photo-menu

**Q:** For restaurant guidance, do we ship a structured database, photo-menu OCR, or curated top-N chains for the Pilot?

<span style="color:#47e7b0">**A:** Curated database of top chains for Pilot. Photo-menu OCR deferred to v1.5.</span>

<span style="color:#A855F7">**Max:** Agreed. Launching with a curated chain database means we can actually ensure quality and accuracy rather than shipping something that fails on edge cases. Photo-menu OCR is a compelling feature but it needs to work reliably to be valuable — if it gives bad reads or fails often, it will erode trust in the whole app. Nail the chains first, then expand. I would rather users have a great experience with 50 chains than a frustrating one with unlimited restaurants.</span>

### 3. Dynamic macro recalc

**Q:** What triggers a macro recalculation — weekly cron, weight-change threshold, streak break, or coach-initiated only?

<span style="color:#47e7b0">**A:** Weekly auto-recalc plus a manual "Recalculate My Plan" button. Post-workout adjustment moves to Premium tier in v1.5.</span>

<span style="color:#A855F7">**Max:** I agree with keeping the recalculation system relatively simple for the Pilot, but I do think the coach should still be able to recognize behavioral and recovery patterns over time. For example, if a user is repeatedly reporting high hunger, low energy, fatigue, poor recovery, or struggling with adherence over multiple days, the system should eventually acknowledge that and recommend adjustments instead of rigidly sticking to the original targets. I do not want the app to feel overly aggressive, robotic, or like users are constantly failing their plan. The overall philosophy should prioritize sustainability and consistency over perfect adherence. Any recalculations or recommendations should feel subtle, supportive, and intelligent rather than dramatic or disruptive.</span>

<span style="color:#A855F7">**↳ Scope impact:** Phase 1 backend must support multi-day pattern recognition (rolling window of mood, energy, adherence, recovery signals) — not just a calendar-week cron. Tracked in updated resolution.</span>

### 4. Trainer compatibility

**Q:** Do we support external trainer plans in the MVP, defer entirely, or offer a view-only import?

<span style="color:#47e7b0">**A:** Manual entry only — free-form "log my trainer's workout." No adaptive logic at Pilot. Philosophy: enhance trainers, don't replace them.</span>

<span style="color:#A855F7">**Max:** I agree with this approach for the Pilot. I think it is important that trainers and coaches view FuelWell as a supportive tool rather than a competitor. Long term, I could see trainer integrations becoming a meaningful growth channel for the platform, but I do not want to add the complexity of trainer dashboards, permissions, messaging systems, or adaptive trainer logic during MVP. For now, the priority is allowing users to easily incorporate workouts or nutrition guidance they are already receiving elsewhere while still benefiting from FuelWell's coaching, tracking, and decision support systems.</span>

### 5. Recomposition timeline

**Q:** Do we show a body-recomposition timeline projection, hide it, or build a full feature around it?

<span style="color:#47e7b0">**A:** Hide at Pilot. Defer to Premium tier in v1.5 once we have enough photo history to make projections meaningful.</span>

<span style="color:#A855F7">**Max:** I agree with hiding this at Pilot. I don't want users fixating on a timeline number that could feel discouraging if progress is slower than projected. FuelWell's philosophy is about consistency over speed — a recomposition timeline projection only becomes meaningful and trustworthy once we have weeks of real photo and measurement data to draw from. Rushing it risks making the app feel like every other transformation tracker.</span>

### 6. Proactive coaching cadence

**Q:** Should proactive coaching be daily check-ins, event-driven only, or some hybrid? Any quiet hours?

<span style="color:#47e7b0">**A:** Event-driven only, with quiet hours 10pm–7am. No time-based "good morning" pushes. Triggers: skipped meal, over-target macros, missed workout, weight-trend deviation.</span>

<span style="color:#A855F7">**Max:** This aligns with FuelWell's "no guilt" principle. I don't want the app pinging users on a schedule like a fitness drill sergeant. Notifications should feel like a thoughtful nudge from someone who noticed something — not a daily alarm reminding them they haven't logged breakfast. Event-driven keeps it feeling intelligent rather than automated. Long term I could see user-configured check-ins as an opt-in Premium feature, but it should never be the default.</span>

### 7. Grocery list source of truth

**Q:** Is the grocery list generated automatically from selected recipes, manually built by the user, or both?

<span style="color:#47e7b0">**A:** Both. Auto-generated from selected recipes, plus manual additions.</span>

<span style="color:#A855F7">**Max:** Agreed. The auto-generation from recipes is a core value-add — it's part of what makes FuelWell feel like a real decision coach rather than just a tracker. Manual additions are essential too because life doesn't always follow a meal plan. One thing I'd want to make sure of: the grocery list should feel clean and minimal, not like a spreadsheet. Grouping by category (produce, protein, etc.) would be a nice touch without adding complexity.</span>

### 8. Progress tracking inputs

**Q:** Beyond weight and macros (confirmed), do we include body photos, body measurements, and mood/energy ratings in the MVP?

<span style="color:#47e7b0">**A:** Full set — all three. Weight, macros, body photos, body measurements, and daily mood/energy rating.</span>

<span style="color:#A855F7">**Max:** I think the full set is the right call, but I want the daily experience to feel lightweight. Users shouldn't feel like they have to fill out a form every day to get value. Mood and energy should be a quick one-tap rating — not a journaling prompt. Body photos and measurements should be easy to skip on days they don't feel like it. The data is valuable over time, but the daily friction has to stay low.</span>

### 9. HealthKit scope

**Q:** Is HealthKit integration read-only or read/write? Which specific metrics?

<span style="color:#47e7b0">**A:** Read-only at Pilot. Metrics: weight, steps, workouts, active energy. Write-back deferred to v1.5.</span>

<span style="color:#A855F7">**Max:** Read-only is the right call. I want FuelWell to feel like it's listening to your body, and pulling from HealthKit passively is a great way to do that without requiring extra user effort. Write-back can wait — I'd rather ship clean and fast than delay Pilot for a feature most users won't notice immediately.</span>

### 10. Auth model for Pilot

**Q:** Supabase email/password, Apple Sign-In required, or both?

<span style="color:#47e7b0">**A:** Apple Sign-In **and** email/password. Apple Sign-In is required by App Store guidelines once any other auth method exists, so this is effectively forced.</span>

<span style="color:#A855F7">**Max:** No pushback here — Apple Sign-In is effectively required and it's also the better UX for iOS users. Email/password is important as a fallback for web access down the road. Keep it simple.</span>

### 11. Offline behavior

**Q:** Can the user log a meal offline and have it sync later, or is the Pilot online-only?

<span style="color:#47e7b0">**A:** Online-only at Pilot. Recently cached data is viewable offline, but new entries require connectivity. Offline-first sync deferred to v1.5.</span>

<span style="color:#A855F7">**Max:** Fine for Pilot. The Founders 100 cohort is going to be tech-savvy early adopters — they'll understand the limitation. I just want to make sure the offline state is handled gracefully in the UI. If someone opens the app with no signal, it shouldn't look broken. A simple "you're offline — here's your last sync" state is enough for now.</span>

### 12. AI provider & cost ceiling

**Q:** Claude or GPT? What is the per-user monthly cost cap?

<span style="color:#47e7b0">**A:** Anthropic Claude (locked in the Consensus Stack). $5/user/month soft cap, $10/user/month kill-switch.</span>

<span style="color:#A855F7">**Max:** Claude was always the right choice for FuelWell's tone — the coaching style we want maps well to how Claude communicates. The cost ceiling makes sense for Pilot. One thing worth monitoring: Founders 100 users may be heavier users than average since they're invested early adopters, so the $5 average could skew higher in that cohort specifically. Worth watching in the first 30 days.</span>

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
| Max | ✅ Countersigned with comments | 2026-05-13 |

**Source documents:**
- Clean resolution table: `docs/FuelWell-Gap-Analysis.md`
- Phase plan status: `docs/FuelWell-Phase-Plan.md` (Phase 0 ✅ complete)
- Strategic context: `docs/MASTER-PLAN.md`

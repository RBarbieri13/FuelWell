# Chapter 20: Post-Launch Operations

*"Launch is the easy part. The hard part is the next two years of waking up every Monday and asking the same question: is the app working?"*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Set up Sentry alerts that reach you in seconds for production incidents that matter, and don't bother you for noise.
2.  Run a kill-switch fire drill before you actually need one, so the muscle memory exists when you do.
3.  Pause and resume a phased rollout when production data shows trouble.
4.  Triage App Review rejections and App Store user reviews without overreacting.
5.  Maintain docs/decisions.md as a living log so future-you understands present-you's choices.
6.  Run the quarterly stack review that prevents drift from the Consensus Stack.

## Prerequisites

  - Chapters 1–19 complete.
  - FuelWell v1.0 submitted to App Review (or already approved).
  - Sentry, PostHog, and the Supabase kill-switch are wired and working.

  

## 20.1 The Post-Launch Mental Model

The day the app ships, your job changes. It used to be "build the app." Now it's three jobs braided together:

  

1.  **Triage** — every incoming signal (crash, error, review, support email) needs a quick decision: act now, act soon, log and ignore.
2.  **Respond** — the small fraction of signals that need action turn into hotfixes, kill-switch toggles, App Store responses, or support replies.
3.  **Improve** — the patterns visible in the signals (a recurring crash, a confusing onboarding step, an underused feature) feed the next iteration.

  

A solo developer can do all three if the operational rituals are tight. A team can do all three even better. What kills people is doing none of them and finding out three weeks later that v1.0 has a 60% crash rate.

  

flowchart LR

  

    subgraph Signals

  

        Crashes\[Sentry crashes\]

  

        Reviews\[App Store reviews\]

  

        Errors\[Sentry errors\]

  

        Events\[PostHog funnels\]

  

        Emails\[Support email\]

  

    end

  

    Signals --\> Triage{Triage}

  

    Triage --\>|critical| Respond\[Respond now\]

  

    Triage --\>|important| Backlog\[Add to backlog\]

  

    Triage --\>|noise| Ignore\[Log & ignore\]

  

    Respond --\> Hotfix\[Hotfix\]

  

    Respond --\> KillSwitch\[Kill-switch\]

  

    Respond --\> Pause\[Pause rollout\]

  

    Respond --\> Reply\[Reply to user\]

  

    Backlog --\> NextSprint\[Next iteration\]

  

This chapter sets up each piece.

  

## 20.2 Sentry Alerts That Don't Cry Wolf

Sentry will absolutely cry wolf if you let it. Default alert settings notify on every new issue — including the one-off crash from a user with a jailbroken phone running iOS 14. You'll start ignoring alerts within 48 hours.

  

The pattern that works: **three alert rules with very different thresholds**.

### Rule 1 — Critical: any spike

"Notify when a single issue exceeds 50 events in 1 hour."

  

This catches things like a misconfigured release that crashes on launch — you want to know within minutes, not the next morning. Wire it to **send to your phone via Sentry's iOS app push notifications, plus an email**.

### Rule 2 — Important: any new crash that affects multiple users

"Notify when a new issue affects more than 10 unique users."

  

Catches new bugs that aren't a flood but are clearly affecting real users. Email-only; daily-rolled-up. Read these with morning coffee.

### Rule 3 — Informational: weekly digest

"Send weekly summary of top 10 issues by frequency."

  

Email-only, weekly. Tells you what's been simmering.

  

Set these up in Sentry's UI: **Alerts → Create Alert Rule**. Three rules, three notification channels, no surprises.

  

**⚠️ Common Pitfall — One alert rule that catches everything**

  

The temptation is to set "any new error" → push notification. After a week, you've turned off Sentry notifications because they're constant. The three-tier setup means push notifications are reserved for genuine emergencies. Resist the urge to make rule 2 a push.

### What "act now" looks like

When rule 1 fires, your response sequence:

  

1.  **Open Sentry from the push notification.** The issue page shows the stack trace, breadcrumbs, affected versions, affected users.
2.  **Decide: kill-switch, pause rollout, or hotfix?**
      
      - If the broken feature is behind a kill-switch (Chapter 18), kill it from Supabase. Total time: 30 seconds.
      - If the issue is in a feature without a kill-switch but the broken code path is gated by a PostHog flag, drop the flag's rollout to 0%.
      - If neither applies and the issue is severe, pause the App Store phased rollout (§20.4).
      - If the fix is small and the issue isn't catastrophic, hotfix in a v1.0.1 release.
3.  **Communicate.** If the kill is visible to users, tweet/post a one-sentence acknowledgment. Silence after a known issue makes users think you don't know.

  

The right answer is almost always: kill the feature first, then think about what to do next. Stopping the bleeding takes 30 seconds; thinking takes longer than 30 seconds.

  

## 20.3 The Kill-Switch Fire Drill

You built the kill-switch in Chapter 18. You've never used it in anger. The first time you do, you'll be panicking — wrong moment to discover the SQL syntax doesn't work or the cache TTL is longer than you remembered.

  

So practice. Once before launch, once a quarter forever.

  

The drill, top to bottom:

  

1.  **Pick a real (non-critical) feature** with a kill-switch row. For FuelWell v1.0, ai\_meal\_plan is the canonical target.
2.  **Note the time.** "T=0."
3.  **From your phone:**
      
      - Open the FuelWell app.
      - Trigger the AI feature. It should work.
4.  **From your laptop:**
      
      - Open Supabase SQL Editor.
      - Run: UPDATE feature\_flags SET enabled = false WHERE name = 'ai\_meal\_plan';
      - Note the time. "T=K (kill)."
5.  **From your phone:**
      
      - Trigger the AI feature again.
      - It should still work for up to 30 seconds (cache TTL).
      - After 30 seconds, it should return the friendly "temporarily unavailable" message.
      - Note the time when it changes. "T=D (disabled)."
6.  **Verify in Sentry/PostHog:** there should be a feature\_disabled event count rising and the feature endpoint should show 503 responses.
7.  **Reverse the kill:** UPDATE feature\_flags SET enabled = true WHERE name = 'ai\_meal\_plan';
8.  **From your phone:** wait 30 seconds, retry — feature should work again. Note "T=R (restored)."
9.  **Document the times** in docs/runbook.md:

  

\#\# Kill-switch drill — 2026-05-15

  

\- T=0 to T=K: 18 seconds (SQL console open, command typed)

  

\- T=K to T=D: 27 seconds (cache TTL window)

  

\- T=D to T=R: 31 seconds (re-enable and propagate)

  

\- Total drill: 1 minute 16 seconds

  

\- No anomalies; ready for production use

  

Now you know — when you actually need this, the worst case is about a minute from "I see a problem" to "the problem stops affecting users." That's the operational confidence you want before launch.

  

**Decision point** — the Reconciliation Matrix's only Medium-confidence row was feature flags. The drill is what makes that decision actually defensible. Skipping the drill means the kill-switch is theater.

  

## 20.4 Pausing a Phased Rollout

The other emergency lever: stop the App Store rollout if a problem surfaces during the 7-day phased release.

  

The procedure:

  

1.  **App Store Connect → My Apps → FuelWell → App Store → Phased Release for Automatic Updates.**
2.  Click **Pause Phased Release**.
3.  Existing users on the new version continue to use it. New downloads still get the previous version.
4.  Decide: resume or roll forward to a hotfix.

  

When paused, your options:

  

  - **Resume** if the problem turns out to be smaller than you feared — the rollout continues from the day it paused.
  - **Push a hotfix** as v1.0.1, submit it for review (\~24 hours), and let it ship phased again.
  - **Push an expedited review request** if the issue is severe — Apple sometimes grants 1-2 hour reviews for urgent crashes.

  

You can pause and resume multiple times. Apple doesn't penalize you for using the lever; using it is exactly what it's for.

  

The trigger for pausing — write it down so you don't have to invent it during a panic:

  

\# When to pause phased rollout

  

Pause if any of these are true:

  

\- Sentry crash-free user rate drops below 99.0% (vs \>99.5% baseline)

  

\- A new top-3 crash by frequency appears post-release

  

\- Multiple App Store reviews mention the same regression

  

\- Any user data loss is confirmed

  

Save this in docs/runbook.md. When the moment arrives, you read the rules instead of inventing them.

  

## 20.5 Triaging App Store Reviews

Reviews are noisy. They're also one of your best signals — users will tell you exactly what frustrates them, often more clearly than analytics will.

  

The triage rules:

  

  - **Five-star reviews with no text:** ignore.
  - **Five-star reviews with text:** read for what the user values; reinforce in marketing.
  - **Three- and four-star reviews:** these are the gold mine. They liked it but something specific bothered them. The text usually names the thing.
  - **One- and two-star reviews:** triage carefully. Distinguish:
      
      - **Real bug reports:** "Crashes when I add a meal." Cross-check Sentry; if confirmed, that's a hotfix.
      - **Feature requests framed as complaints:** "No barcode scanner." Add to roadmap; respond if the feature is planned.
      - **User error or unrealistic expectations:** "Doesn't sync with my Fitbit." Respond politely; clarify scope.
      - **Trolls:** "Worst app ever." Don't respond. Move on.

  

App Store Connect → My Apps → Ratings and Reviews lets you respond to any review. Responses appear publicly under the review. **Always respond to confirmed bug reports and to genuine three- and four-star feedback.** A short response shows future readers that you actually care:

  

"Thanks for flagging this — the crash on add-meal was a regression in v1.0.3 and is fixed in v1.0.4 (now in TestFlight, App Store soon). Sorry for the trouble."

  

A boilerplate "thanks for your feedback" response on every review reads as bot-like. Personalize the ones worth personalizing; ignore the rest.

  

## 20.6 The Daily / Weekly Operational Cadence

For a solo developer, a sustainable rhythm:

### Every morning (5 minutes)

\[ \] Check Sentry: any new top-10 issues overnight?

  

\[ \] Check PostHog health dashboard: crash-free rate, P95 launch

  

\[ \] Check App Store Connect: any new reviews?

  

\[ \] Check support email/inbox: any user reports?

  

Five minutes with coffee. If everything's green, close the tabs. If something needs action, you've spotted it before users start piling on.

### Every Friday (30 minutes)

\[ \] Read PostHog funnel dashboard: any drops in onboarding/retention?

  

\[ \] Read PostHog feature dashboard: which features are growing/shrinking?

  

\[ \] Read this week's reviews in App Store Connect

  

\[ \] Update docs/decisions.md with any decisions made this week

  

\[ \] Quick scan of docs/perf-baseline.md vs current numbers

  

The weekly is the "am I drifting?" check. Daily catches incidents; weekly catches trends.

### Every quarter (2 hours) — the Stack Review

\[ \] Re-read docs/stack/03-consensus-stack.md

  

\[ \] For each row: is this still the right choice?

  

\[ \] Check release notes for SwiftData, TCA, SQLiteData, etc.

  

\[ \] Review the contested-choices essay (was the kill-switch design right?)

  

\[ \] Run the kill-switch drill (§20.3)

  

\[ \] Update docs/decisions.md with any changes

  

This is the most important non-coding ritual. Tools change. Apple ships new APIs. Communities re-converge on better practices. The Consensus Stack from chapter zero is correct *as of when it was written*. Quarterly is the cadence at which you confirm it still is.

  

If the answer is "the choice has aged out" — say SwiftData stabilizes in iOS 28 to the point that the SQLiteData rationale weakens — the quarterly review is when you write up the migration plan. Not on a random Tuesday in panic.

  

## 20.7 Maintaining docs/decisions.md

The decision log is where future-you understands present-you's choices. The format:

  

\#\# 2026-MM-DD — Short title

  

\*\*Context.\*\* What was the situation that forced a decision.

  

\*\*Options considered.\*\* Two or three real alternatives.

  

\*\*Decision.\*\* What you picked.

  

\*\*Reasoning.\*\* Why this option won. Reference the Consensus Stack

  

or Reconciliation Matrix where relevant.

  

\*\*Tradeoffs accepted.\*\* What you gave up by picking this.

  

\*\*Revisit.\*\* When (date or condition) you'd consider changing.

  

A real entry from FuelWell's lifetime might read:

  

\#\# 2026-08-12 — Adding image caching for meal photos

  

\*\*Context.\*\* Meal photo feature shipping in v1.2; AsyncImage's lack

  

of caching causes 4-second lag on scroll-back through long lists.

  

\*\*Options considered.\*\*

  

\- Stick with AsyncImage; live with the lag (Chapter 16's principle).

  

\- Add Nuke as a dependency (chapter 16 deferred this to "when meal photos ship").

  

\- Build a custom URLCache wrapper.

  

\*\*Decision.\*\* Add Nuke 12.x as a Networking package dependency.

  

\*\*Reasoning.\*\* Nuke is mature, lightweight, and explicitly recommended

  

by the Reconciliation Matrix as the upgrade path when AsyncImage

  

becomes a bottleneck. Custom URLCache is reinventing for no benefit.

  

\*\*Tradeoffs accepted.\*\* One more SPM dependency to keep updated.

  

Nuke's API surface is small; risk is low.

  

\*\*Revisit.\*\* Re-evaluate at the v2.0 stack review whether AsyncImage

  

performance has caught up enough to drop the dependency.

  

Five entries a quarter is enough. The trick is writing them at the moment of decision, not three months later when you've forgotten the alternatives. Set a habit: every time you add a SPM dependency or change an architectural pattern, append an entry before committing.

  

## 20.8 The Runbook

docs/runbook.md is the file you read at 2 a.m. when something is broken and your brain isn't fully online. Structure it as scenarios with steps:

  

\# FuelWell Runbook

  

\#\# Scenario: Sentry crash spike alert fired

  

1\. Open the alert email; click through to the issue.

  

2\. Note the affected version and the breadcrumbs.

  

3\. Decide: kill-switch, pause rollout, or hotfix?

  

   - Crash is in an AI feature → kill-switch (see "Kill-switch usage")

  

   - Crash is in core flow → pause rollout (see "Pausing rollout")

  

   - Crash is small and easy → hotfix (see "Cutting a hotfix")

  

4\. Communicate: tweet acknowledgment if user-visible.

  

5\. Update docs/decisions.md with the post-mortem within 48 hours.

  

\#\# Scenario: Kill-switch usage

  

1\. Open Supabase SQL Editor.

  

2\. Run: \`UPDATE feature\_flags SET enabled = false WHERE name = '\<name\>';\`

  

3\. Wait 30 seconds.

  

4\. Verify in PostHog that the \`feature\_disabled\` event count is rising.

  

5\. Verify in Sentry that the crash issue stops accumulating new events.

  

6\. Restore later: same UPDATE with \`enabled = true\`.

  

\#\# Scenario: Pausing rollout

  

(see §20.4)

  

\#\# Scenario: Cutting a hotfix

  

1\. From main, create branch \`hotfix/\<issue-summary\>\`.

  

2\. Make the minimum change to fix the issue.

  

3\. Add a regression test.

  

4\. PR + merge to main (skip squash to preserve commit detail).

  

5\. Tag: \`git tag v\<current.major\>.\<current.minor\>.\<current.patch + 1\>\`

  

6\. Push the tag — release lane runs.

  

7\. After TestFlight processing, submit for review.

  

8\. Request expedited review if user impact is severe.

  

Add scenarios as you encounter them. After each real incident, add the resolution to the runbook. Within six months you'll have a runbook that covers most of what production throws at you.

  

## 20.9 When to Bring On Help

The solo path doesn't last forever. Signals that it's time:

  

  - **You can't keep up with the daily 5-minute check.** Inbox/Sentry/Reviews backlog grows weekly.
  - **Hotfixes are taking longer than 24 hours from detection to ship.** You're the bottleneck.
  - **Quarterly stack reviews keep getting deferred.** You're tactical when you need to be strategic.
  - **You've been ill or on vacation and the app accumulated issues.** Single-person dependencies break.

  

The first hire isn't another iOS engineer. It's almost always:

  

  - **A part-time customer success person** to triage support and review responses.
  - **Or a contractor for one bounded project** (a complete feature, an Android port) so you stay focused on architecture.

  

When you do hire another engineer, the onboarding artifact is everything you've built in this book: CLAUDE.md, the docs/ folder, the chapter documentation, the Consensus Stack. They read it on day one and contribute on day two. That's the payoff for the boring infrastructure work.

  

## 20.10 The Long View

You shipped v1.0. Excellent. Most apps don't. Of the ones that do, most don't get past v1.5. The pattern that breaks them isn't usually a technical failure; it's loss of operational discipline.

  

The disciplines that keep an app alive:

  

1.  **Daily checks.** Five minutes a day. Catch the small fires.
2.  **Weekly trend reviews.** Half an hour. Catch the slow drift.
3.  **Quarterly stack reviews.** Two hours. Catch the architectural drift.
4.  **Decision log entries.** Live. Future-you needs them.
5.  **Runbook updates after every real incident.** The next time will be easier.
6.  **Kill-switch drills.** Quarterly. Confidence is earned through practice.

  

Six rituals. Maybe four hours total per week, weighted heavily toward the daily check. They are what separates an app you ship from a product that runs.

  

## 20.11 What Comes Next

You've finished the book. FuelWell is shipping. Three honest truths about what's next:

  

**The architecture you built will get you to v3.0 without rewrites.** That's the test of an architecture. TCA at module boundaries, SQLiteData behind a repository, a typed APIClient, a kill-switchable AI layer — these aren't year-one decisions. They're decade decisions. Trust them.

  

**The product will need to change a lot.** What's a good idea on day one is rarely the same as what's a good idea on day 365. PostHog's funnel dashboard will tell you what your users actually do, which will surprise you. Listen to the data, not your initial instincts.

  

**Claude Code will get better; the architecture won't need to.** New AI capabilities will land monthly. The rigid TCA structure that made Claude Code so reliable in 2026 will make it even more reliable in 2027. The investment compounds.

  

The book ends here. The product begins.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Push notifications for every Sentry issue | Three-tier alert rules; push only for true emergencies |
| First kill-switch use is a real incident | Quarterly drills make the muscle memory exist |
| Hesitating to pause phased rollout | Apple expects you to use the lever; that's why it exists |
| Boilerplate replies to App Store reviews | Personalize the worthwhile ones; skip the rest |
| Empty docs/decisions.md after launch | Append at the moment of decision, not later |
| No runbook | Write scenarios after each real incident |
| Quarterly review skipped because "everything's fine" | That's exactly when you're supposed to review |
| Burning out doing solo on-call indefinitely | The first hire is customer success or a contractor, not another engineer |

  

## Hands-On Exercise (the last one)

**Goal:** stand up the full operational layer so v1.0 is not just shipped but actively monitored.

  

1.  **Configure the three Sentry alert rules** per §20.2. Test each:

  

  - Trigger a fake spike (run a build with an intentional crash 50 times in 1 hour) — verify the push fires.
  - Trigger a low-volume new issue from a debug menu — verify it doesn't push but does land in email.
  - Verify the weekly digest is enabled.

  

1.  **Run the kill-switch fire drill** end-to-end per §20.3. Time each phase. Document in docs/runbook.md.

  

1.  **Write the runbook** per §20.8 with at least three scenarios filled in:

  

  - Sentry crash spike.
  - Kill-switch usage.
  - Cutting a hotfix.

  

1.  **Set the daily/weekly cadence** per §20.6. Add it to your calendar as recurring blocks (5 minutes daily, 30 minutes Friday). The recurring entry is the ritual.

  

1.  **Schedule the first quarterly stack review** for 90 days from now. Calendar invite. Two hours blocked. Don't let it slip.

  

1.  **Write the v1.0 launch decision log entry** in docs/decisions.md:

  

\#\# 2026-MM-DD — v1.0 launch

  

\*\*Context.\*\* Shipping FuelWell to App Store after completing the

  

20-chapter build-out.

  

\*\*Stack at launch.\*\* See docs/stack/03-consensus-stack.md.

  

No deviations.

  

\*\*Known deferred work.\*\* See docs/backlog.md (image caching,

  

barcode scanner, Watch app, Android port).

  

\*\*Revisit.\*\* Quarterly stack review in 90 days.

  

1.  **Update** **CLAUDE.md** to reference the runbook so Claude Code knows where to look when you ask "what do we do if X."

  

1.  **Final commit:**

  

git add .

  

git commit -m "Chapter 20: operational rituals, runbook, alert rules, drill complete"

  

git push

  

**Time budget:** 3 hours. Most of it is one-time setup that pays back every week for the life of the app. The kill-switch drill alone is worth the chapter.

  

## Closing

You started this book with five research reports, a NotebookLM mind map, and the knowledge that "production iOS in 2026" had no single right answer. You finished it with a Consensus Stack, a fully-built FuelWell skeleton, a CI pipeline, a TestFlight presence, and the operational discipline to keep all of it running.

  

That's the whole arc. From contested research to shipped product to ongoing operation, with explicit reasoning at every fork.

  

Two pieces of advice on the way out:

  

**Be kind to yourself about pace.** The book is twenty chapters. Reading and exercising one chapter per week is a five-month investment. That's normal. Anyone telling you they shipped a production app in two weekends either had ten years of Swift behind them or shipped something brittle.

  

**Trust the boring stack.** The most powerful sentence in this entire book is "no, we're not adding that." Every dependency you don't add, every pattern you don't deviate to, every framework you don't chase — that's compounding stability. The Consensus Stack from chapter zero is meant to be lived with, not optimized.

  

Now go ship the next thing. Or the same thing, better. Your users are waiting.

  
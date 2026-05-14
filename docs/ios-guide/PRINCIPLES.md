# FuelWell — Product Principles

> **Status:** Phase 0 deliverable. Binding for every reducer, view, copy string, and AI prompt in the FuelWell iOS app. Lives at `docs/ios-guide/PRINCIPLES.md` until Phase 1 creates `ios/`, then it moves to `ios/PRINCIPLES.md`.
>
> **Source documents** (in `docs/ios-guide/PRODUCT-CONTEXT.md` for the full extracts):
> - Product Vision Document (the founder story + philosophy)
> - FuelWell Product Inspiration Deep Dive (CTO Version)
> - FuelWell App Execution Blueprint (Screens 15–27)
> - FuelWell_Master_v2 (pricing, tier gates)

## North star

> FuelWell is a **decision engine**, not a tracking app. Every feature must reduce decision fatigue and guide the user toward a clear next step.

If a screen, reducer, or copy block doesn't help the user decide what to do next, it doesn't ship.

## The Daily Loop

This is the entire app, summarized:

```
Dashboard → Log → Adjust → Continue → Repeat
```

Every feature must support this loop. If a feature doesn't fit somewhere on this arc, it isn't a Pilot feature. The loop runs all day, every day. The user opens the app, sees what to do, does it, sees the consequence, decides the next thing. That's it.

## The 13 binding rules

### Rule 1 — Every screen answers "what should I do next?"
Before any data, the answer comes first. The verdict is above the macros, not below them. A screen that only displays data is exceptional, not default.

### Rule 2 — Never present open-ended decisions
Choices are always narrowed for the user. **Maximum three options** anywhere in the app. "Pick a meal from 50 recipes" is wrong. "Here are 3 meals that fit your remaining macros — pick one" is right.

### Rule 3 — Interpret data, don't display it
"You're trending down 0.3 lb/week" beats showing a weight chart. "You still need 38g protein today" beats showing a macro ring at 64%. The chart can exist *under* the interpretation, never *instead of* it.

### Rule 4 — Speed and clarity over completeness
A 2-tap meal log that gets approximate macros beats a 6-tap log that gets exact ones. The user who logs imperfectly every day wins; the user who logs perfectly twice a week loses. Optimize the fast path.

### Rule 5 — The user runs the show. No guilt, no judgment, no "failure."
If the user eats a big meal, skips a workout, or has drinks with friends, the system adapts the plan. It does not scold. It does not surface a streak-broken modal. It does not fire a "you missed your goal" notification. The plan flexes; the user keeps going.

### Rule 6 — AI is embedded everywhere, not gated behind a chat tab
Quick prompts surface as buttons on every screen. The chat tab exists, but most coaching happens inline. "Adjust my day" is a button on the dashboard, not a sentence the user has to type.

### Rule 7 — Real-life food suggestions, specific and practical
"Eat a balanced lunch" is wrong. "Half rice / half beans at Chipotle, grilled chicken, no cheese" is right. "Dip your salad in dressing instead of pouring — saves 200 cal" is right. The coach knows about real restaurants, real menus, real situations.

### Rule 8 — Enhance trainers, don't replace them
Users with personal trainers should be able to log trainer-designed workouts and get nutrition support between sessions. The app supplements human coaching; it doesn't compete with it.

### Rule 9 — Photo/voice logging is the speed lever
Camera-first meal logging is the difference between users who stick and users who churn. Snap → instant feedback → done. Macro entry is optional, not required.

### Rule 10 — Dashboard is sacred
Screen 15 (Home Dashboard) is the most important surface in the app. The most prominent CTA is **Log Meal**. The primary card is **the next action**. Secondary cards are supporting insights. Dense charts do not appear on the main screen.

### Rule 11 — No social feed, no aggressive gamification
No friends list, no leaderboard, no public progress. Streaks may exist as a low-key consistency signal but never as the primary motivator. Badges and rewards are kept minimal.

### Rule 12 — Native iOS feel
Clean, minimal, calm. Strong spacing. Premium tier-of-the-app polish (think Linear, Oura, Apple Fitness). No gimmicks, no skeuomorphism, no celebratory confetti for routine actions.

### Rule 13 — Long-term, not short-term
The app does not end at a goal weight. Maintenance, lean bulks, performance phases, lifelong habit — the coach evolves with the user. Features that imply a finish line ("complete your 12-week program!") are anti-FuelWell.

## STEAL / ADAPT / AVOID matrix

The Inspiration Deep Dive ranks specific apps. These are the binding examples:

| App | Rating | What to apply |
|---|---|---|
| **Oura** | STEAL | Daily dashboard focused on "today." Single primary focus per screen. Calm, premium UI. Top-down daily narrative. |
| **Fitbod** | ADAPT | Auto-generated workouts. Progressive overload logic. Fatigue-aware recommendations. (Premium-tier; deferred from Pilot.) |
| **Lose It / Snap-a-plate** | ADAPT | Camera-first logging. Minimal steps. Speed prioritized over accuracy. |
| **MyFitnessPal** | AVOID | Cluttered interface. Too many required inputs. Macro obsession UX. Hide complexity behind AI. |
| **Noom** | PARTIAL ADAPT | Behavioral psychology approach is good. Long lessons and scripted coaching tone are not. Keep insights short and actionable. |
| **Apple Fitness / Health** | STEAL UX | Clean native design. Smooth transitions. High-trust UI. Minimal colors, strong spacing. |
| **AI-first apps (general)** | ADAPT | Conversational where it helps. Avoid chat-only interfaces. AI surfaces answers without requiring the user to ask. |

## Anti-patterns (do not ship)

- Cluttered dashboards with five or more cards above the fold
- Manual-heavy workflows when AI can do the work
- Open-ended choices without ranking or narrowing
- Social feed, public progress, leaderboards
- Static plans that don't adapt
- Long lessons or content the user has to read through
- Aggressive paywall walls before value is demonstrated
- Streak-broken shame modals
- Macro rings as the primary visual when a verdict could replace them

## Decision check (use before merging any UI change)

Before committing a screen or feature, run it through this 6-question check:

1. Does this screen answer "what should I do next?" before showing data? **(Rule 1)**
2. Is the choice narrowed to ≤ 3 options? **(Rule 2)**
3. Is data interpreted, not just displayed? **(Rule 3)**
4. Is the fast path 2–3 taps or fewer? **(Rule 4)**
5. If the user deviates, does the system adapt instead of scolding? **(Rule 5)**
6. Does this fit somewhere in Dashboard → Log → Adjust → Continue → Repeat? **(Daily Loop)**

If any answer is "no," the screen isn't done.

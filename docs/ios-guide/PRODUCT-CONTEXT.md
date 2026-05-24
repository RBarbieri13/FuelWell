# FuelWell — Product Context

> Aggregated reference of every product source document. Read this before designing any feature so future sessions don't have to re-fetch from Drive. Source-of-truth lives in the FuelWell Drive folder; this is the in-repo mirror.

## Source documents

| Document | Owner | Purpose |
|---|---|---|
| Product Vision Document | Robert | Founder story, philosophy, feature vision |
| FuelWell Product Inspiration Deep Dive (CTO Version) | Max | App-by-app inspiration ranking, anti-patterns |
| FuelWell App Execution Blueprint (15–27) | Max | Screen-by-screen requirements, daily loop |
| App Map 1–14 Intake Form (PDF) | Max | Onboarding / intake flow detail (read when designing onboarding) |
| FuelWell_Master_v2 | Max | Final pricing, tier gating, launch timeline |
| FuelWell — Inspiration & Reference Library | Max | Template (mostly unfilled) for capturing app references |
| Copy of FuelWell NEW Intake Form (PDF) | Max | Pilot user intake form |
| FuelWell_Full_Questionnaire_Detailed (PDF) | Max | User onboarding questionnaire |

## What FuelWell is

A real-time decision engine for nutrition and fitness, framed as **"a true personal coach in your pocket"** that learns from the user and helps them navigate real life as it happens. The coach is conversational, contextual, and never judgmental. The user always remains in control.

## Founder story (condensed)

Robert struggled for years to stick to a diet. Started strong, burned out repeatedly. A bad weekend or social event would derail everything. He started using AI as a 24/7 coach — asking questions like *"I'm going out to lunch, what should I order?"* and *"Did I go too aggressive with my deficit today?"* For the first time dieting felt flexible and sustainable.

But existing AI tools forgot context, confused meals and workouts, and required repeating information. That gap is FuelWell.

## Philosophy (binding — see PRINCIPLES.md)

- The user runs the show. The app suggests; it never commands.
- No guilt, no judgment, no "failure." If the user deviates, the plan adapts.
- The goal is sustainable progress that fits real life — not perfection.
- Fitness is a lifelong journey. The app does not end at a goal weight.
- The app **enhances** trainers and human coaches; it does not replace them.

## Daily user loop (the entire app)

```
Dashboard → Log → Adjust → Continue → Repeat
```

Every screen and feature must support this loop. If it doesn't, it isn't a Pilot feature.

## Screen map (Execution Blueprint 15–27)

| # | Screen | Goal | Pilot? |
|---|---|---|---|
| — | Onboarding | Personalize plan, set baseline | ✅ required |
| 15 | **Home Dashboard** | Daily command center; show what to do next | ✅ |
| 16 | Meal Log | Fastest possible food logging (Search / Photo / Scan) | ✅ |
| 17 | Food Search & Add | Fast, accurate food selection; favorites + frequents | ✅ |
| 18 | AI Coach Chat | Real-time contextual decision support | ✅ |
| 19 | Recipes Library | Solve "what should I eat right now" | ✅ |
| 20 | Progress & Analytics | Reinforce consistency and motivation | ✅ |
| 21 | Profile & Settings → "Your Plan" | Control + transparency, "why this plan" | ✅ |
| 22 | Workout Hub | Daily workout recommendation | ❓ Pilot scope question |
| 23 | Active Workout Session | Guide user through a workout | ❓ Pilot scope question |
| 24 | Notification Center | Smart contextual nudges (proactive coaching) | ✅ |
| 25 | Meal Plan Generator | Flexible weekly planning | ❓ Pilot scope question |
| 26 | Grocery List | Real-world execution of nutrition | ✅ |
| 27 | Water Tracking | Simple daily habit reinforcement | ❓ Pilot scope question |

Open Pilot scope questions are tracked in Master Plan §"Open scope deltas" and need a Robert + Max decision.

## Feature breakdown (Master_v2, definitive)

### AI Health Coach
- Pro: reactive responses
- Premium: contextual + proactive + memory-based

### Dynamic Macros
- Pro: static baseline + weekly adjustments
- Premium: real-time adaptive targets based on behavior

### Food Recognition
- Pro: basic estimation
- Premium: contextual + portion-aware + auto-logging

### Eating Out
- Pro: suggestion-based
- Premium: menu analysis + optimization + day adjustment

### Progress Tracking
- Pro: weight + calories
- Premium: macro adherence, projections, trends

### Education System (BOTH tiers — major differentiator)
Real-time, not static lessons. Three delivery modes:
1. **Reactive** (user asks)
2. **Contextual** (based on data)
3. **Proactive** (AI initiates)

Topics: fat loss fundamentals, glycogen and water weight, scale fluctuations, hunger and satiety, energy and performance, training principles, habit formation, real life balance, plateaus, maintenance, muscle building, recovery and sleep, mental fitness.

### Recipe System
- Both tiers: save recipes, create custom meals, modify ingredients, tag, reuse
- Premium: AI suggests variations, adjusts to macros, learns preferences
- Critical adds: personal recipe bank, "repeat last meal" shortcut, recipe → grocery auto-sync

### Premium-only differentiators
- Adaptive workout builder (the core upgrade reason)
- Soreness-aware adjustments
- Wearable integrations
- Photo progress tracking
- Recomposition timeline
- Proactive coaching (very important)

## Pricing (Master_v2, final)

| Tier | Monthly | 6 months | Annual |
|---|---|---|---|
| **Pro** | $12.99 | $69 | $119 |
| **Premium** | $18.99 | $99 | $179 |
| **Founders 100 — Pro** | $10.99 | $59 | $99 |
| **Founders 100 — Premium** | $16.99 | $89 | $159 |

Founders pricing is the **only** pricing shown at launch. Hard cap of 100. Pilot has no tier gating per Robert's instruction.

## Concrete coaching examples (from Vision)

These are the kind of suggestions FuelWell gives — concrete enough that engineering can use them as test fixtures.

- **Late-night hunger:** "Wake up hungry? Try X (fits remaining macros). Worth noting yesterday's deficit was aggressive — let's give you 200 more calories tomorrow."
- **Spontaneous lunch (Chipotle):** "Half rice / half beans, grilled chicken, fajita veggies, no cheese, salsa instead of dressing. ~620 cal, 48g protein. You'll have 480 cal left for dinner."
- **Salad dressing:** "Dip your salad in the dressing instead of pouring it on top — saves about 200 cal at most restaurants."
- **Knee pain after running:** "Try hip and glute strengthening, quad and hamstring stretches. Switch to cycling or incline walking for a few days."
- **Rotator cuff discomfort:** "Shoulder mobility, banded external rotations. Skip overhead pressing this week."
- **Plateau:** "Weight's been flat 10 days. Two paths: drop calories 100/day, or add a 20-min walk daily. Pick one."

These examples are reference material for prompt design, not user-facing copy.

## Wearable / data integrations (Vision-listed)

- Apple Health (required)
- WHOOP Strap
- Oura Ring
- Garmin devices
- Smart scales
- Fitbit, Eight Sleep (mentioned)

The more signals, the more accurate coaching becomes. Pilot scope per Gap Analysis #9 (HealthKit read-only vs read/write); other integrations are post-Pilot.

## Restaurant nutrition database

Vision says the platform includes calorie and macro data from many restaurants, supporting:
- Display restaurant nutrition information
- Suggest menu modifications
- Auto-log meals from restaurants
- Adjust macros for the rest of the day

Pilot scope per Gap Analysis #2 (DB + photo / photo-only / curated top-N).

## Launch timeline (Master_v2)

- **Pilot:** Mid-May 2026 (currently being scoped)
- **Founders 100:** Early June 2026
- **Public launch:** August 2026

Pilot timing is honest target only after Phase 0 closes. The Master Plan does not commit to specific dates.

## Anti-patterns (binding — also in PRINCIPLES.md)

- Cluttered interface (MyFitnessPal vibe)
- Manual-heavy workflows
- Open-ended choices
- Social feed distractions
- Static plans
- Streak-broken shame modals
- Long lessons / content walls
- Aggressive gamification
- Macro obsession UX

## Where to look when

| Question | Source |
|---|---|
| Voice / tone of coaching | Product Vision Document |
| What screens exist | App Execution Blueprint (15–27) |
| What goes in which tier | FuelWell_Master_v2 §3 |
| What apps to copy / avoid | Inspiration Deep Dive |
| Pricing + Founders 100 details | FuelWell_Master_v2 §1 |
| Onboarding flow specifics | App Map 1–14 (not yet ingested into repo) |
| Education system topics | FuelWell_Master_v2 §4 |
| Premium upgrade reasons | FuelWell_Master_v2 §6 |

# FuelWell — Inspiration & Reference Library (Max's Fill-In Doc)

> **Purpose.** This is a living document Max uses to capture real-world examples from fitness & nutrition apps we admire (or explicitly don't want to copy). When it's ready to hand to the app-building agent, the whole file is fed in as a single brief — every field below is designed to be directly consumable as structured product guidance.
>
> **How to use.**
> 1. Duplicate the `APP ENTRY TEMPLATE` block at the bottom of this file once per app you want to reference.
> 2. Paste links, screenshot URLs, or drag-drop images into `public/inspiration/<app-slug>/` and reference them by path.
> 3. Anywhere you see `<< fill in >>`, replace it. Leave any field blank if you don't have a view; **don't delete the field** — the agent reads blank fields as "no strong opinion."
> 4. When you're ready, tell the agent: *"Read `research/inspiration/INSPIRATION_TEMPLATE.md` and use it as the design/feature brief."*

---

## 0. Project Context (pre-filled — don't edit without syncing with Robby)

- **Product name:** FuelWell
- **One-line pitch:** AI-guided nutrition + adaptive workouts + budget-aware grocery planning, in one coach.
- **Core differentiators:**
  - Photo/voice meal logging with coaching feedback (not just calorie counts)
  - Budget-optimized grocery lists and smart swaps
  - Adaptive workouts that respond to how the body actually feels
  - Trainer-facing tools so coaches can plug in alongside the AI
- **Primary user (v1):** Adults 25–55 who want to look and feel better, are overwhelmed by existing apps, and care about cost and sustainability as much as outcomes.
- **Secondary user (v1):** Independent trainers / nutrition coaches who want an AI-powered client platform.
- **Platforms we plan to ship:** iOS first, then Android, then web companion (coach dashboard + home-kitchen view).
- **Non-goals (explicit):** We are **not** trying to be another MyFitnessPal clone, not chasing elite-athlete strength nerds, not building a social feed.

---

## 1. How to Rank an App (scoring key for the fields below)

Use these shorthand ratings so the downstream agent can prioritize:

| Rating | Meaning |
|---|---|
| `STEAL` | Clone this pattern as closely as legally/ethically possible |
| `ADAPT` | Strong idea — reinterpret it for FuelWell's voice & stack |
| `REFERENCE` | Keep in mind as a benchmark, don't copy directly |
| `AVOID` | Example of what **not** to do |
| `TBD`   | Interesting but Max hasn't decided |

---

## 2. Global Style & Tone Targets (fill in once, reused across entries)

- **Overall vibe we want (3 adjectives):** << fill in — e.g., "warm, confident, modern" >>
- **Apps whose *feel* we most want to echo:** << fill in — e.g., "Linear's polish, Oura's calm, Calm's softness" >>
- **Apps whose feel we explicitly reject:** << fill in — e.g., "MyFitnessPal clinical DB feel, Noom's chatbot wall of text" >>
- **Color energy:** `[ ] energetic / bold`   `[ ] calm / muted`   `[ ] premium / dark-mode-first`   `[ ] editorial / magazine-like`   `[ ] neutral / brand-forward` — **pick one or two:** << fill in >>
- **Typography vibe:** << fill in — e.g., "geometric sans like Inter/Geist for UI; a warm serif for headlines like Söhne/GT Super" >>
- **Motion & micro-interactions:** << fill in — e.g., "spring-y, Framer-style, never skeuomorphic; celebrate streaks sparingly" >>
- **Photography style:** << fill in — e.g., "real home-kitchen food, diverse bodies, natural light — NOT stock gym models" >>
- **Illustration style (if any):** << fill in >>
- **Dark mode stance:** `[ ] required` `[ ] nice-to-have` `[ ] not a priority` — << fill in >>

---

## 3. Flows We Care About Most (fill in which screens Max wants the agent to obsess over)

For each flow, list which reference apps do it best. Use bracketed rating from §1.

| Flow | Reference apps (best → good) | Notes |
|---|---|---|
| Onboarding / first-run | << e.g., Oura `STEAL`, Noom `AVOID` >> | << fill in >> |
| Meal logging (photo / barcode / text) | << fill in >> | << fill in >> |
| Daily home / "today" dashboard | << fill in >> | << fill in >> |
| Grocery list + budget view | << fill in >> | << fill in >> |
| Workout of the day | << fill in >> | << fill in >> |
| Progress / trends over time | << fill in >> | << fill in >> |
| AI chat / coach conversation | << fill in >> | << fill in >> |
| Streaks, nudges, notifications | << fill in >> | << fill in >> |
| Paywall / upgrade moment | << fill in >> | << fill in >> |
| Settings / profile / goals edit | << fill in >> | << fill in >> |
| Trainer dashboard (web) | << fill in >> | << fill in >> |
| Empty states & error states | << fill in >> | << fill in >> |

---

## 4. Feature "Must / Should / Won't" — Max's Gut Version

> The deep-research reports in `research/reports/` will give the data-driven version. This is Max's opinion version. Both get fed to the agent — disagreements are a feature, not a bug.

- **Must have in v1:** << fill in >>
- **Should have in v2 / v1.5:** << fill in >>
- **Won't have (ever or for a long time):** << fill in >>
- **Feature I keep seeing everywhere that I think is overrated:** << fill in >>
- **Feature nobody does well that we could own:** << fill in >>

---

## 5. APP ENTRY TEMPLATE (duplicate this block per app)

Copy everything between the `--- BEGIN ---` and `--- END ---` markers below, paste it above this template, and fill it in. Keep the most important entries near the top of the doc.

--- BEGIN APP ENTRY ---

### App: << App Name >>

- **Category:** `[ ] nutrition/calorie tracking`  `[ ] workout/lifting`  `[ ] cardio/running`  `[ ] yoga/mobility`  `[ ] habit/behavior change`  `[ ] recovery/sleep`  `[ ] wearable`  `[ ] coaching marketplace`  `[ ] meal planning / recipes`  `[ ] grocery/budget`  `[ ] other: << fill in >>`
- **Overall rating (from §1):** `STEAL / ADAPT / REFERENCE / AVOID / TBD`
- **Why it's on the list (1–2 sentences):** << fill in >>
- **Who it's for (in their words):** << fill in — pull from their App Store copy >>

**Links**
- App Store (iOS): << url >>
- Play Store (Android): << url >>
- Website / marketing site: << url >>
- Pricing page: << url >>
- Reddit / forum thread of real user reactions: << url >>
- Their best YouTube walkthrough (someone else's, not marketing): << url >>

**Screens Max loves (paste image paths or URLs)**
1. `public/inspiration/<app-slug>/01-<screen-name>.png` — *what Max likes about it:* << fill in >>
2. `public/inspiration/<app-slug>/02-<screen-name>.png` — *what Max likes about it:* << fill in >>
3. `public/inspiration/<app-slug>/03-<screen-name>.png` — *what Max likes about it:* << fill in >>

**Screens Max hates / wants to avoid**
1. `public/inspiration/<app-slug>/avoid-01.png` — *why:* << fill in >>

**Specific patterns to steal**
- [ ] Onboarding question order / pacing — << fill in >>
- [ ] Specific interaction (swipe, long-press, etc.) — << fill in >>
- [ ] Visualization / chart style — << fill in >>
- [ ] Copy / voice (quote their best microcopy): << fill in >>
- [ ] Color palette or gradient — << fill in >>
- [ ] Information density — << fill in >>
- [ ] Notification cadence — << fill in >>
- [ ] Streak / rewards mechanic — << fill in >>
- [ ] Other: << fill in >>

**Specific patterns to AVOID**
- << fill in — e.g., "aggressive paywall after 3 screens," "chatbot that hides features behind typed commands" >>

**Pricing observed**
- Free tier: << what's in it >>
- Paid tier(s): << $/mo, $/yr, one-time, coaching add-ons >>
- Trial: << length, card required? >>
- Paywall style: << hard after onboarding / soft / freemium forever / etc. >>

**Integrations we'd want to match or beat**
- << e.g., Apple Health, Google Fit, Whoop, Oura, Garmin, Fitbit, Strava, Instacart, Kroger, Walmart, Amazon Fresh >>

**Tech / platform notes (if obvious from the outside)**
- << e.g., "clearly React Native," "uses on-device photo recognition," "AI responses feel like streamed GPT-4" >>

**Open questions / things we want to test in user interviews**
- << fill in >>

--- END APP ENTRY ---

---

## 6. Suggested Starter Shortlist (Max, consider adding these first)

If Max doesn't know where to begin, these are the ones the research team flagged as most instructive — add or delete freely:

**Nutrition & calorie tracking**
- MyFitnessPal (benchmark / what to beat)
- MacroFactor (gold standard for adaptive coaching math)
- Cronometer (micronutrient depth)
- Lose It! (snap-a-plate photo logging)
- Lifesum (lifestyle-driven framing)
- Yuka (ingredient scoring UX)
- Yazio, Noom (behavior change voice — also what to avoid)

**Workout & fitness**
- Fitbod (adaptive programming)
- Hevy / Strong (logging UX benchmark)
- Ladder (coach-led programs)
- Future (1:1 coach model)
- Caliber (hybrid AI + coach)
- Nike Training Club (polish / free tier benchmark)
- Centr (content + program structure)
- Peloton App (class culture)
- Strava (social + progress viz)

**Recovery / wearables (for UX & data presentation)**
- Oura, Whoop, Apple Fitness+, Garmin Connect, Fitbit, Eight Sleep

**Behavior / habit**
- Streaks, Finch, Fabulous, Way of Life, Habitica

**Meal planning & grocery**
- Mealime, PlateJoy, Eat This Much, Whisk, Paprika, Instacart

**AI-first / conversational**
- Cal AI, Bite AI, Lumen, Carbon Diet Coach, RP Strength, Ladder AI, Simple, Zero

**Adjacent "premium feel" we'd want the UI to echo**
- Linear, Arc Browser, Things 3, Cash App, Robinhood (pre-controversy), Revolut, Monzo, Calm, Headspace, Substack reader

---

## 7. Handoff Checklist (Max tick before handing to the app-building agent)

- [ ] At least 5 app entries filled in, each with ≥1 STEAL flag
- [ ] §2 Global Style filled in (or explicitly marked "agent decides")
- [ ] §3 Flows table has a ranked reference app per row
- [ ] §4 Must/Should/Won't is filled in
- [ ] All screenshot paths resolve (images actually in `public/inspiration/`)
- [ ] Handed off together with the deep-research reports in `research/reports/`

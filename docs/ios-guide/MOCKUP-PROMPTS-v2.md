# FuelWell — Mockup Prompts v2 (Phase 0.5 · Step 4 · Round 2)

**Status:** READY 2026-05-19. New screens from the App Map v2 reorganization and Max's Step 2 review resolutions. Pairs with the 27 mockups already in `docs/ios-guide/mockups/`.

**Purpose:** 10 new screens that reflect the v2 structure — Coach-centered tab bar, hierarchical Menu, Help-as-Learn, Inflows/Outflows visualization, Tier 1/2/3 Dashboard, and per-tab hub landings. Existing 27 mockups stay in place; they're just re-homed in the new IA.

**Source-of-truth files (always attach in Claude Design before generating):**
- `DESIGN.md` — canonical tokens
- `APP-MAP.md` — v2 IA (updated after this round)
- `FLOW-CHART.md` — per-button behavior

---

## 1. How to use this doc

1. Open the existing Claude Design project that contains the 27 approved mockups.
2. Confirm `DESIGN.md` is attached. If not, reattach from the canonical raw URL.
3. Paste **Section 2 (Round 2 Constraints)** as the next kickoff message.
4. For each screen, paste the matching prompt from Section 3 in order. Request 3 variations. Pick one using the rubric in `MOCKUP-PROMPTS.md` § 5. Save the PNG, log the choice, advance.
5. Filename convention: `NN-slug.png` where NN starts at 28 (continuing from the 27-mockup batch).

---

## 2. Round 2 Constraints (paste first)

```
You are continuing the FuelWell iOS mockup pass. The first round (27 screens) is complete and approved. This round adds 10 new screens reflecting the App Map v2 reorganization and Max's review feedback.

All Round 1 constraints still apply (light-mode native per DESIGN.md, full-saturation accents, real copy, SF Symbols, ChatGPT Images 2.0 caption convention for photography, no streaks/badges/gamification, no card gradients).

ROUND 2 ADDITIONS

Tab bar — visual treatment change
- Tab order left-to-right: Home · Meals/Nutrition · Coach · Exercise & Activity · Progress
- Coach (center) is the MOST PROMINENT tab. Treat it as a speech-bubble visual — slightly elevated, distinct shading (use color.bg.elevated #0F1117 background on the Coach icon container with white SF Symbol, OR a soft gradient.brand fill behind the icon). Coach gets visual priority even when inactive.
- Meals/Nutrition and Exercise & Activity are second-tier — standard tab style, sit immediately to the left/right of Coach.
- Home and Progress are outermost — standard tab style.
- Active tab text uses color.text.primary; inactive uses color.text.muted. Coach always has its distinct shading regardless of active state.

Dashboard tier framework (Max's blocker resolution)
- Tier 1 (above the fold, never below): Health Score hero + Inflows/Outflows visual + Verdict-of-the-moment CTA
- Tier 2 (first scroll, visible after a small scroll): Activity overview card · Nutrition/Meals overview card · My day/week/month view
- Tier 3 (progressive disclosure, deeper scroll or expandable): Progress overview · Daily Recap card (when after 8pm) · Coach nudge card (event-driven, hidden when no trigger)
- Top bar: hamburger Menu icon (left), Help icon (right)
- Habit Tracking is OFF the Dashboard — accessed from Menu and from Progress tab.

Health Score formula (v1, Max's blocker resolution)
- Components weighted: Nutrition 35% · Training 25% · Sleep 20% · Recovery 10% · Body comp 10%
- Range: 0–100
- Missing component: excluded, remaining components re-weighted proportionally (no penalty zeros)
- Day-1 fallback: show "Building your baseline — 7 days of data unlocks your Health Score" with a placeholder ring

Inflows/Outflows creative direction (the centerpiece visual)
- Dashboard widget (compact): DUAL CONCENTRIC RING.
  - Outer ring = calories ingested, segmented by P/C/F colors (protein #00D278, carbs #F59E0B, fat #A855F7)
  - Inner ring = calories expended, segmented by source (BMR ~grey #6B7280, daily activity ~info #00B4D8, workout ~orange #E87A1D)
  - Center = net surplus/deficit (DM Sans 700, big), with up/down arrow in semantic.success or .warning
  - Small balance pill below: "In range" (success), "Slight surplus" (warning), "Over by X kcal" (error)
- Full-screen view (tapped from widget): SANKEY-STYLE FLOW DIAGRAM.
  - Left lanes (food categories) flow into a total-intake column
  - Total-intake flows across to total-expenditure
  - Total-expenditure splits into right lanes (BMR, activity, workout)
  - Band thickness = calorie weight; colors match the ring
  - Day/Week/Month/Year segmented control at top
  - Tap any lane → drill-down sheet with that source's contributions

OUTPUT
- Three variations per screen unless specified otherwise.
- Both populated and empty states.

Acknowledge these additions. I will paste prompts one at a time, starting with screen 28 (Dashboard v2).
```

---

## 3. Per-screen prompts (10 new screens)

### 28. Dashboard v2 (Home tab root, Tier 1/2/3)

```
Promote the existing Dashboard mockup (screen 10) to Dashboard v2. Apply Max's Tier 1/2/3 framework explicitly.

ABOVE THE FOLD (Tier 1 only — max 3 visual units):
1. Top bar: hamburger Menu icon (left), brand wordmark or compact "FuelWell" (center, optional), Help icon (right)
2. Health Score hero — large card, white surface. Eyebrow "HEALTH SCORE", massive DM Sans 700 score (e.g. 86.4), delta pill "▲ 4.2 last 30 days" in color.semantic.success, small "Why?" text-link expander. Right-side compact composite breakdown (5 mini bars or radar, optional).
3. Inflows/Outflows DUAL CONCENTRIC RING widget — see Round 2 Constraints for visual direction. Center shows net kcal (e.g. "+128 kcal · slight surplus") with arrow.
4. Verdict-of-the-moment CTA card — eyebrow "ENGINE · NEXT MOVE", one-line action ("Log dinner — 612 kcal · 38 g protein left"), primary CTA button.

TIER 2 (visible after small scroll):
- Activity overview card (compact widget, see screen 31 below)
- Nutrition/Meals overview card (today's meals summary, remaining macros bar)
- "My day / My week / My month" view — segmented control at top, simple timeline or stacked bar chart of intake vs. expenditure over the selected window

TIER 3 (deeper / expandable):
- Progress overview summary (sparkline of weight + 1-line trend)
- Daily Recap card (after 8pm only — eyebrow "COACH RECAP · 8 PM", 1-line preview, tap to open Daily Recap screen)
- Coach nudge (event-driven; hidden if no trigger fires)

Tab bar at bottom: Home · Meals/Nutrition · Coach · Exercise & Activity · Progress. Coach is visually prominent (see Round 2 Constraints).

FOLD line clearly marked between Tier 1 and Tier 2.

EMPTY STATE (Day 1):
- Health Score reads "Building your baseline — 7 days of data unlocks your score" with a placeholder ring
- Inflows/Outflows shows just "Log your first meal" with a tappable + button in the center
- Verdict CTA: "Welcome — your day starts here. Log your first meal whenever you're ready."
- Tier 2 cards show empty placeholders with coach-voice copy

Generate 3 variations.
```

### 29. Inflows/Outflows widget (Dashboard card, standalone reference)

```
Generate a high-fidelity standalone mockup of the Inflows/Outflows widget alone (the dual concentric ring), at the size it appears on Dashboard v2.

Canvas: an iPhone screen showing the widget card centered with realistic surrounding context (a thin top bar and a thin Tier 1 sibling above/below for context).

The widget itself:
- White card, radius.lg, elevation.1, padding lg
- Eyebrow "ENERGY BALANCE · TODAY" font.body 700 text.caption color.text.secondary
- Time-window pill row above the ring (compact): [Today] [Week] [Month] [Year] — Today selected
- Centered DUAL CONCENTRIC RING:
  - Outer ring (thicker, ~16pt stroke): calories ingested. Segments: protein #00D278 (largest if user is hitting protein), carbs #F59E0B, fat #A855F7. Stroke ends with a tiny dot per segment for legibility.
  - Inner ring (thinner, ~10pt stroke, smaller radius): calories expended. Segments: BMR #6B7280 (largest), daily activity #00B4D8, workout #E87A1D.
  - Center: huge DM Sans 700 number "+128" (or "−320" if deficit), unit "kcal" small below, then arrow icon (SF "arrow.up.right" if surplus, "arrow.down.right" if deficit) tinted with semantic color.
- Below ring: a small balance pill row (left-aligned): "In range" / "Slight surplus" / "Over by X kcal" — full-saturation semantic color background at 10% alpha, text at full saturation.
- Below pill: a tiny legend strip — three dots with labels (Protein 142g · Carbs 198g · Fat 56g) for outer ring composition.
- Tap target: the entire card → opens full-screen Inflows/Outflows (screen 30).

EMPTY STATE: center reads "0 kcal logged today" with a "+ Log your first meal" primary button replacing the ring.

Generate 3 variations:
1. As described — full ring detail
2. Compact version — outer ring only with inner mini-bar instead of inner ring
3. Bold/dense — larger center number, smaller ring, legend pulled inline
```

### 30. Inflows/Outflows full screen (Sankey)

```
Generate the full-screen Inflows/Outflows view (tapped from the Dashboard widget).

Pushed screen. Tab bar still visible. Header: back chevron + title "Energy balance" + small "i" info icon for explainer.

Top section: segmented control [Today] [Week] [Month] [Year]. Today selected.

Hero: SANKEY-STYLE FLOW DIAGRAM full width.
- Left side (intake lanes): rounded bands flowing in from the left edge labeled with food categories (e.g. "Breakfast 358 kcal", "Lunch 612 kcal", "Snacks 258 kcal", "Dinner 612 kcal projected"). Each band's thickness = calorie weight. Bands colored by their dominant macro (protein-heavy = green, carb-heavy = amber, fat-heavy = violet).
- Center: a single "TOTAL INTAKE 1,840 kcal" column where all left bands converge, then it flows right into a "TOTAL OUT 1,712 kcal" column.
- Right side (expenditure lanes): bands flow out labeled "BMR 1,142 kcal", "Daily activity 320 kcal", "Workout 250 kcal".
- A small gap/difference line shown between center columns: "Net +128 kcal" in DM Sans, color.semantic.warning if surplus, color.semantic.success if in range, color.semantic.error if extreme.

Below Sankey:
- Three summary tiles (3-column grid): "Intake total" / "Output total" / "Net". Each white card, big DM Sans number, small caption.
- Detail rows section: tappable rows for each lane with macro breakdown chips on the right (e.g. "Lunch — Caesar wrap" + P/C/F mini chips + 612 kcal). Tap → drill-down sheet.

EMPTY STATE: "Log meals and workouts to see your energy flow. Today's view fills in as you go."

Generate 3 variations of the Sankey layout:
1. Classic Sankey (as described) — left-to-right flow
2. Vertical Sankey — top-to-bottom (intake top, expenditure bottom)
3. Hybrid — Sankey center, with summary stats wrapping above/below
```

### 31. Activity overview widget (Dashboard card, standalone reference)

```
Generate the Activity overview widget as it appears on Dashboard v2 (Tier 2).

Layout: white card, radius.lg, elevation.1.
- Eyebrow "ACTIVITY · TODAY" font.body 700 text.caption color.text.secondary, with a "›" chevron right to indicate it links to the Exercise & Activity tab landing.
- Four-stat grid (2x2) with DM Sans 700 values and labels below:
  - Workouts logged: "1 / 1" (or "0 / 1 planned")
  - Active minutes: "214 / 300"
  - Calories burned: "486 kcal"
  - Steps: "8,432"
- Small bar chart strip at the bottom showing the week's daily active minutes (7 mini bars, today highlighted in color.primary.orange, others in color.text.muted).

EMPTY STATE: "No movement logged yet today. Tap a workout to start, or it'll fill in passively from Apple Health."

Generate 3 variations.
```

### 32. Exercise & Activity tab landing

```
Generate the Exercise & Activity tab landing — a hub screen for all training-related sub-pages. This is the user's first screen when they tap the Exercise & Activity tab.

Header: title "Exercise & Activity" font.display 700 text.title.lg, optional "+" trailing for quick-add workout.
Tab bar visible at bottom.

Hero section (top): "Today's workout" card — shows the planned workout for today (workout name, time estimate, exercise count, "Start workout" CTA). If no workout planned, shows a "Rest day" card with optional "Add a workout" button.

Section: "This week" — small horizontal scroll of day chips with workout/rest indicators and minutes.

Section: "Quick access" — vertical list of tappable rows, each with SF Symbol icon, label, and chevron:
- Workout Log (history)
- Activity Tracker (passive activity from Apple Health)
- Workout Plans (templates / library)
- Exercise Library
- Schedule (week / month view of planned workouts)
- Trainer workouts (manual entry)

Section: "Recent workouts" — last 3 logged workouts as compact rows with date, name, duration, kcal.

EMPTY STATE (first-time, no workouts yet):
- Hero reads "No workouts logged yet. Want a quick suggestion from coach, or pick a plan?"
- Two CTAs: [Coach suggest] [Browse plans]

Generate 3 variations.
```

### 33. Meals/Nutrition tab landing

```
Generate the Meals/Nutrition tab landing — hub screen for all food-related sub-pages.

Header: title "Meals & Nutrition" font.display 700 text.title.lg, "+" trailing for Add Meal sheet.
Tab bar visible at bottom.

Hero section: "Today's plate" card — compact Inflows/Outflows ring (smaller version of the Dashboard widget) + remaining macros bar.

Section: "Today's meals" — vertical list of logged meals (same row style as Dashboard meal rows), with a pending dinner slot.

Section: "Quick access" — vertical list of tappable rows:
- Meal Log (full day-by-day history)
- Restaurant Guidance ("eating out" entry point)
- Recipe Browser
- Meal Plan Generator
- Grocery List
- Macro History (charts)

Section: "Recent foods" — horizontal scroll of recent meal chips for one-tap re-log.

EMPTY STATE: "No meals yet today. The fastest way is a photo — try the + above. Or coach can suggest something that fits your remaining macros."

Generate 3 variations.
```

### 34. Progress tab landing v2

```
Promote the existing Progress overview mockup (screen 23) to v2 — adds Health Score trend and surfaces Habit Tracking.

Header: title "Progress" font.display 700.
Time range selector: segmented [Weekly (selected)] [Monthly] [90-day] [All]. Weekly default.

Section order:
1. Health Score trend card — composite score current + 30-day delta + small sparkline. Tap → Health Score detail.
2. Weight card — line chart of weekly averages, summary stat, "Add weight" button.
3. Macro adherence card — weekly bar chart, summary stat.
4. Body photos section — horizontal scroll of thumbs, "Add photo" tile.
5. Measurements section — list with weekly trend arrows.
6. Mood & energy section — weekly average dots + small heatmap.
7. Habit Tracking card — compact dot grid (last 14 days x 4 habits) + "View all habits" link to Habit Tracking detail.

EMPTY STATE: "Progress fills in as you log. Weight, photos, mood — one entry kicks it off."

Generate 3 variations.
```

### 35. Menu (hierarchical sheet)

```
Generate the Menu — a full-screen sheet that opens when the user taps the hamburger icon on Dashboard or any screen.

Layout: full-screen sheet from the right or as a modal. Color.bg.base background.

Header:
- Close X top-right
- User avatar (40pt) + name + goal pill (compact)
- Quick stat: today's Health Score with trend arrow

Main body — hierarchical sections (collapsible / always visible):

SECTION: TOOLS (most prominent, top)
Grouped list, each row has SF Symbol + label + chevron. Sub-grouped with small caption headers:

  Snapshot:
    - Health Score
    - Daily Recap
    - Inflows / Outflows
    - My day / week / month

  Tracking:
    - Habits
    - Weight history
    - Body photos
    - Measurements
    - Mood & energy

  Meals:
    - Meal Log
    - Recipe Browser
    - Meal Plan Generator
    - Grocery List
    - Restaurant Guidance
    - Macro history

  Training:
    - Workout Log
    - Activity Tracker
    - Workout Plans
    - Exercise Library
    - Schedule

SECTION: COACH
  - Coach Chat (link)

SECTION: SETTINGS
  - Account
  - Permissions
  - Notification preferences
  - Data export
  - Sign out (destructive)

SECTION: HELP
  - Learn articles (search + categories)
  - Contact support
  - Send feedback

SECTION: ABOUT
  - About FuelWell
  - Privacy
  - Terms
  - Share FuelWell
  - Version

Visual style: iOS grouped list. Section headers in font.body 700 text.caption uppercase color.text.secondary tracking +0.08em. Rows white surface, dividers color.bg.borderSoft, chevrons color.text.muted.

EMPTY STATE: no empty state needed — the menu always has all items.

Generate 3 variations:
1. iOS-standard grouped list (as described)
2. Card-based — each top-level section in its own rounded card
3. Two-pane / icon-grid for the Tools section (visual icons for quick scanning), list for the rest
```

### 36. Help screen (merges Learn + Settings entry)

```
Generate the Help screen — accessed from the Help icon top-right of Dashboard. Merges Learn article content with quick Settings access.

Header: title "Help" font.display 700, back chevron.

Top section: search bar pinned at top — "Search articles, settings, or ask a question" placeholder.

Section: "Featured today" — single hero article card with image (ChatGPT Images 2.0 placeholder), title, 3-min read pill, brief lead. Each Help article is ≤3 minutes and ends with "One thing to try today" actionable takeaway.

Section: "Categories" — horizontal scroll of category tiles (icon + label):
  - Nutrition basics
  - Macros explained
  - Eating out
  - Recovery
  - Training fundamentals
  - Sleep & energy
  - Mindset

Section: "Continue reading" — articles the user has started but not finished, with progress.

Section: "Quick settings" — short list of the most-used settings rows (Notifications, HealthKit, Account). "All settings →" link to the full Settings screen.

Section: "Talk to coach" — small card at the bottom that links to Coach Chat with a context like "Have a question? Ask coach directly."

Section: "Send feedback" — text-link only.

EMPTY STATE: not applicable — Help always has content.

Generate 3 variations.
```

### 37. Tab bar component (visual exemplar with Coach-centered styling)

```
Generate a standalone visual mockup of the FuelWell tab bar in isolation, to lock the Coach-centered visual treatment.

Render at iPhone width (393pt) on a neutral light background showing the full 5-tab bar with home indicator below.

Tabs left to right: Home · Meals & Nutrition · Coach · Exercise & Activity · Progress.

Coach tab visual treatment (the centerpiece — make this distinct):
- Icon container is a soft speech-bubble shape (SF Symbol "bubble.left.and.bubble.right.fill" or similar speech-bubble glyph), slightly raised above the baseline of the other tab icons.
- Background of the speech-bubble container uses color.bg.elevated #0F1117 (inverted from the rest of the tab bar) with white SF Symbol foreground.
- Subtle elevation shadow (elevation.2) under the speech bubble.
- Label "Coach" below the icon in color.text.primary.
- The Coach tab feels like a featured action even when inactive — like the prominent center button in apps like Snapchat or Instagram's old camera tab.

Home and Progress tabs (outermost):
- Standard SF Symbol icons (house.fill / chart.line.uptrend.xyaxis), color.text.muted when inactive, color.text.primary when active.

Meals/Nutrition and Exercise & Activity tabs (immediately around Coach):
- Standard SF Symbol icons (fork.knife / figure.run), same active/inactive color rules.

Render four states:
1. Home tab active (default)
2. Coach tab active (the speech bubble lights up — fill becomes gradient.brand or solid color.semantic.success)
3. Exercise & Activity tab active
4. Inactive baseline (no tab "active" — used for splash or transition states)

Stack all four states vertically in one image, each labeled, so the team can lock the treatment in one frame.

Generate 2 variations:
1. Speech-bubble Coach as described
2. Coach as a raised circle (more like a primary FAB embedded in the tab bar) with gradient.brand fill and white speech-bubble glyph
```

---

## 4. Acceptance checklist

| # | Screen | Generated | Approved | Saved |
|---|---|---|---|---|
| 28 | Dashboard v2 | ☐ | ☐ | ☐ |
| 29 | Inflows/Outflows widget | ☐ | ☐ | ☐ |
| 30 | Inflows/Outflows full screen | ☐ | ☐ | ☐ |
| 31 | Activity overview widget | ☐ | ☐ | ☐ |
| 32 | Exercise & Activity tab | ☐ | ☐ | ☐ |
| 33 | Meals/Nutrition tab | ☐ | ☐ | ☐ |
| 34 | Progress tab v2 | ☐ | ☐ | ☐ |
| 35 | Menu (hierarchical) | ☐ | ☐ | ☐ |
| 36 | Help (merged Learn + Settings entry) | ☐ | ☐ | ☐ |
| 37 | Tab bar component | ☐ | ☐ | ☐ |

## 5. Review rubric

Same 10-point rubric as `MOCKUP-PROMPTS.md` § 5, plus three Round 2 additions:

11. **Coach tab is visually prominent** — distinct shading per Section 2 brief
12. **Dashboard respects Tier 1/2/3** — no Tier 2 elements appear above the fold
13. **Inflows/Outflows visualization is creative AND legible** — not just a pie chart

## 6. Exit criteria

- [ ] All 10 mockups generated and approved
- [ ] Saved to `docs/ios-guide/mockups/28-...png` through `37-...png`
- [ ] Source HTMLs preserved under `docs/ios-guide/mockups/html/`
- [ ] Combined PDF review deck rebuilt
- [ ] Then: Phase 0.6 — Interactive Prototype begins

---

*Output of Phase 0.5 · Step 4 · Round 2. Next: compile combined PDF, final review, then Phase 0.6.*

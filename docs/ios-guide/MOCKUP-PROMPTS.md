# FuelWell — Mockup Prompts (Phase 0.5 · Step 4)

**Status:** READY 2026-05-14. Pairs with the 27 approved wireframes from Step 3. Each mockup prompt assumes the corresponding wireframe is already in the Claude Design session and is being **promoted** to a final-fidelity mockup.

**Purpose:** ready-to-paste prompts for Claude Design. Same iPhone canvas, same content, same fold contract — but now in full color per `DESIGN.md`, with real copy, real numerics, real photography, real iconography.

**Tooling reminder:** non-UI photography is generated via **ChatGPT Images 2.0** with thinking mode (per DESIGN.md § Imagery). Claude Design can reference image placeholders; final art swaps in during Phase 1 implementation.

---

## 1. How to use this doc

1. Open the existing Claude Design session that contains the approved wireframes.
2. Confirm `DESIGN.md` is still attached. If not, reattach.
3. Paste **Section 2 (Common Constraints — Mockups)** as a fresh kickoff message.
4. For each screen, paste the matching prompt from Section 3 in order.
5. Request three variations per screen. Pick one with the same review rubric, save the PNG, log the choice, advance.
6. At the end of the pass, the 27 mockups are the locked spec for Phase 1.

---

## 2. Common Constraints — Mockups (paste first, every session)

```
You are promoting low-fidelity wireframes to full-fidelity iOS mockups for an app called FuelWell.

The canonical design system is the attached DESIGN.md. Every value you produce — colors, type, spacing, radii, elevation, motion, components — must follow it verbatim. If a token in this prompt conflicts with DESIGN.md, DESIGN.md wins.

Apply these constraints to every mockup in this session:

CANVAS
- iPhone 15 Pro: 393 x 852 points, portrait
- iOS status bar (time, signal, battery) in iOS-native style at top
- Home indicator bar at the bottom
- Tab roots show a 5-tab bottom bar above the home indicator. Labels: Home, Log, Coach, Learn, Progress. SF Symbols icons. Active tab uses color.text.primary.

SURFACES (light-mode native per DESIGN.md)
- Root background: color.bg.base #F4F5F7
- Cards: color.bg.surface #FFFFFF with 1px hairline border color.bg.border #E5E7EB and elevation.1 shadow
- Inverted highlight row: color.bg.elevated #0F1117 — used sparingly, typically for the macros band, fuel callout, or sticky action bars. Foreground on it is color.text.onDark / .onDarkMuted.

COLOR
- Brand mark green #47E7B0 is reserved for the logo, splash, and brand-mention treatments only. NEVER use it for buttons, verdicts, or macros.
- Action/success green #00D278 carries verdict-positive, macro-protein, on-track chips.
- Semantic colors at full saturation on light surfaces: warning #F59E0B, error #EF4444, info #00B4D8, premium #A855F7.
- Macros: protein #00D278, carbs #F59E0B, fat #A855F7.
- Backgrounds may tint a semantic at exactly 10% alpha (e.g. rgba(0,210,120,.10) chip behind a protein numeric). Foregrounds stay at full saturation. No pastels.

TYPOGRAPHY (per DESIGN.md § Typography)
- font.display Outfit 600–700 for verdict copy and screen titles
- font.body Inter 400–600 for body, labels, captions
- font.numeric DM Sans 500 with tabular figures for all numerics (kcal, macros, weight, %)
- Scale tokens text.caption / .body / .body.lg / .title.sm / .title / .title.lg / .display
- Numerical conventions: 2,748 KCAL / DAY · 153g · 74.2 kg · 22%

COPY
- Use real copy, not [Primary Action: X] placeholders. Voice rules from DESIGN.md § Brand:
  - Direct, confident, specific, dense
  - Never hedging. "Eat a real lunch" not "consider a more substantial meal."
  - Numbers over adjectives. "320 calories under" not "you have room for more."
- Banned vocabulary: shred, crush, grind, beast mode, diet, cheat day, subject, intervention, compliance, BMI protocol.
- Preferred: smarter, personalized, adaptive, real-time, your body, your day, guidance, recalibrate, rebalance, macros, recovery, energy.

PHOTOGRAPHY
- Hero food / workout images: replace the wireframe IMAGE placeholder with a labeled ChatGPT Images 2.0 placeholder (rounded rectangle, soft realistic food photography aesthetic, no people's faces). Caption format: "<HERO NAME> · CHATGPT IMAGES 2.0" small caption at the bottom edge of the image.
- Empty-state illustrations: same caption convention.

ICONOGRAPHY
- SF Symbols only. Rounded caps and joins. If a concept doesn't have a clean SF Symbol, fall back to a typographic label-plus-numeric treatment (per DESIGN.md § Iconography).

ELEVATION
- Cards: elevation.1 (0 1px 2px rgba(15,17,23,.04), 0 1px 0 rgba(15,17,23,.02))
- Raised / hover: elevation.2
- Modals / sticky toasts: elevation.3
- Primary CTA: elevation.cta (the green halo is intentional)
- Never both heavy shadow and thick border — pick one.

ANTI-PATTERNS (refuse to generate any of these)
- Streak chips, badges, gamification rewards
- Aggressive multi-stop gradients on flat surfaces (gradients reserved for the brand CTA, verdict ring, gradient-text emphasis only)
- Dark surfaces (use the opt-in dark variant ONLY if the prompt explicitly says so)
- Pastel or desaturated semantic / macro colors
- Emoji as decoration in headlines or buttons
- Tab bars where the verdict isn't on the first screen the user sees

OUTPUT
- Three variations per screen unless I specify otherwise.
- Promote from the approved wireframe layout — do not rearrange the structural hierarchy. Refinement happens in details (color, type, photography, icons), not in fold-line or component order.
- Annotations only when required to explain a non-obvious interaction; otherwise omit.
- Both populated and empty states for each screen, paired side by side or as labeled subframes.

Acknowledge these constraints. I will paste mockup prompts one at a time, starting with screen 01 (Onboarding Welcome).
```

---

## 3. Per-screen mockup prompts

Each block references the corresponding wireframe (by Step 3 section number) and adds the mockup-specific detail. Paste verbatim.

### 3.1 Mockup — Onboarding Welcome

```
Promote the approved Welcome wireframe (Step 3 § 3.1) to a full-color mockup.

Hero: real ChatGPT Images 2.0 placeholder showing a warm, food-forward composition (e.g. a hand reaching for a salad bowl on a bright counter). Caption "WELCOME HERO · CHATGPT IMAGES 2.0" small at the bottom edge.

Wordmark "FuelWell" in font.display 700, color.text.primary. The 'F' may use color.primary.green #47E7B0 as a single-letter brand accent.

Primary CTA "Get Started" — full-width, gradient.brand background, height 48pt, radius.md, font.body.lg 600.
Text link below: "I already have an account" — font.body 500, color.text.secondary.

Background: color.bg.base #F4F5F7. No card chrome — Welcome is edge-to-edge.

Generate 3 variations as approved in wireframes.
```

### 3.2 Mockup — Sign in / Sign up

```
Promote Sign-in wireframe (§ 3.2).

Apple Sign-In button: full-width, height 48pt, radius.md, background black #000, white Apple logo + label "Continue with Apple" in San Francisco (system) 600.
Email field + Password field: white surface, 1pt color.bg.border, radius.md, height 52pt, font.body, placeholders in color.text.muted.
Primary CTA "Continue" — color.text.primary background (dark pill, secondary style per DESIGN.md Buttons §) until form valid; switches to gradient.brand on valid.
Bottom text link "Forgot password?" font.body.sm, color.text.secondary.

Background color.bg.base.

Generate 3 variations.
```

### 3.3 Mockup — Goal selection

```
Promote Goal selection wireframe (§ 3.3).

Progress dots: 3 of 9 filled, color.text.primary for filled, color.text.disabled for empty.
Title "What's your goal?" font.display 700 text.title.lg color.text.primary.
Subtitle "We'll tune your plan around it." font.body color.text.secondary.

Three goal cards, each white surface, radius.lg, 1pt border, elevation.1:
- "Lose weight" — SF Symbol "arrow.down.right.circle" color.macro.fat #A855F7
- "Maintain weight" — SF Symbol "equal.circle" color.semantic.info
- "Gain weight" — SF Symbol "arrow.up.right.circle" color.semantic.success

Each card: icon left in a 40x40 tinted-background container (semantic color at 10% alpha), title font.body.lg 600, one-line description font.body.sm color.text.secondary, radio circle on the right.

Helper text below cards: "Recomposition goals available in Premium." color.text.muted text.caption.

Primary CTA "Continue" sticky bottom, gradient.brand, disabled until selection.

Generate 3 variations.
```

### 3.4 Mockup — Body baseline

```
Promote Body baseline wireframe (§ 3.4).

All numeric inputs use font.numeric DM Sans tabular. Segmented controls use color.bg.surface inactive and color.bg.elevated #0F1117 active with white text.

Fields:
- Height: segmented ft/in vs cm, dual-spinner picker style
- Weight: segmented lb vs kg, single-spinner picker
- Age: numeric input with keyboard
- Sex: segmented Male / Female / Prefer not to say
- Activity level: 4-row vertical list, each row tappable card with title + 1-line description (Sedentary "Desk, little movement"; Light "1–3x/wk"; Moderate "3–5x/wk"; Very active "6+x/wk")

Progress dots 4 of 9.

Generate 3 variations.
```

### 3.5 Mockup — Dietary constraints

```
Promote Dietary constraints wireframe (§ 3.5).

Two horizontal chip rows. Chip style: pill, color.bg.surface, 1pt border, font.body.sm 500. Selected state: color.bg.elevated #0F1117 fill, white text. Add-chip "+" uses color.text.secondary outline only.

Allergies chips: Peanuts, Tree nuts, Dairy, Gluten, Shellfish, Soy, Eggs, +
Dislikes chips: Mushrooms, Cilantro, Olives, +

Free-text field "Anything else?" white surface, 1pt border, multiline 3 rows.

Progress dots 5 of 9. Skip link bottom "Skip for now" color.text.secondary.

Generate 3 variations.
```

### 3.6 Mockup — Lifestyle (NEW)

```
Promote Lifestyle wireframe (§ 3.6).

Title "How do you usually eat?"
Subtitle "We'll tailor your suggestions."
Three cards, same chrome as Goal selection:
- "Cook at home mostly" — SF Symbol "house.fill" color.semantic.success
- "Eat out mostly" — SF Symbol "fork.knife" color.primary.orange
- "Both equally" — SF Symbol "circle.grid.2x2.fill" color.semantic.info

Progress dots 6 of 9.

Generate 3 variations.
```

### 3.7 Mockup — HealthKit permission

```
Promote HealthKit wireframe (§ 3.7).

Centered hero: SF Symbol "heart.fill" 64pt in color.semantic.error in a tinted 80x80 rounded square (error @ 10% alpha background).
Title "Connect Apple Health" font.display 700 text.title.lg.
Subtitle paragraph in font.body color.text.body — 2–3 sentences emphasizing read-only.
Bulleted list with SF Symbol "checkmark.circle.fill" in color.semantic.success for each:
- Weight
- Steps
- Workouts
- Active energy

Primary CTA "Connect Apple Health" gradient.brand.
Secondary text link "Skip for now" color.text.secondary.

Progress dots 7 of 9.

Generate 3 variations.
```

### 3.8 Mockup — Notification permission

```
Promote Notifications wireframe (§ 3.8).

Hero: SF Symbol "bell.badge.fill" 64pt in color.semantic.info, tinted background.
Title "Let your coach reach you" font.display 700.
Subtitle "Event-driven only. Quiet hours 10pm–7am."
Bullets with SF Symbol "checkmark.circle.fill" color.semantic.success:
- When you skip a meal
- When you go over your macros
- When you miss a workout
- When your weight trends off-plan

CTAs same as HealthKit screen.

Progress dots 8 of 9.

Generate 3 variations.
```

### 3.9 Mockup — Your Plan reveal

```
Promote Plan reveal wireframe (§ 3.9).

This is the magic moment — must feel like a payoff, not a confirmation.

No back arrow. Progress dots 9 of 9 all filled.
Title "Your plan is ready." font.display 700 text.title.lg color.text.primary.

Hero card (white surface, radius.xl, elevation.2): 2x2 grid of macro targets.
- KCAL / DAY (top-left): big DM Sans 700 text.display, color.text.primary
- PROTEIN (top-right): big DM Sans, with color.macro.protein dot accent next to the label
- CARBS (bottom-left): color.macro.carbs dot
- FAT (bottom-right): color.macro.fat dot
Each cell: small caps label font.body 700 text.caption color.text.secondary, value below in DM Sans.

Expander "Why these numbers?" below the hero card — when expanded shows 3–4 sentences of coach-voice reasoning in font.body color.text.body.

Primary CTA "Start tracking" sticky bottom, gradient.brand, elevation.cta.

Generate 3 variations.
```

### 3.10 Mockup — Dashboard

```
Promote Dashboard wireframe (§ 3.9 in catalog — note: catalog section 3.9 in WIREFRAME-PROMPTS.md is Dashboard).

This is the most important screen. Use the existing dashboard.html reference at docs/ios-guide/mockups/dashboard.html as the visual baseline — light surface, inverted macros band, dense, no streaks, no card gradients.

Composition (top to bottom, above the fold):
- Header: hamburger (SF "line.3.horizontal") · segmented title "Chat | Core" (Core active, underlined) · mail icon with red unread dot
- Health Score hero card: eyebrow "HEALTH SCORE" font.body 700 text.caption color.text.secondary tracking +0.1em; massive number "86.4" DM Sans 700 text.display color.text.primary; delta pill "▲ 4.2 LAST 30 DAYS" color.semantic.success on rgba(0,210,120,.10); hero food image right (96x96, ChatGPT Images 2.0 placeholder with two small heart accents in color.semantic.success on top corners)
- Calories Today card: eyebrow "CALORIES · TODAY"; "1,546 / 2,000 kcal" with the "1,546" in big DM Sans 700 and "/ 2,000 kcal" in DM Sans 500 color.text.muted; vertical bar histogram (24 bars representing hours, color.text.primary, last 3 dimmed color.bg.border)
- Inverted macros band: bg color.bg.elevated #0F1117, radius.md, three columns (PROTEINS 128g, CARBOHYDRATES 182g, FATS 52g). Each column has a small accent bar above (3pt wide, 28pt long) in the macro channel color (protein #00D278, carbs #F59E0B, fat #A855F7). Labels in color.text.onDarkMuted small caps. Values in DM Sans 700 text-display color.text.onDark; units in DM Sans 500 color.text.onDarkMuted.
- Week schedule row: 3 day-tiles (Today · Friday "120 min", Saturday "120 min", Sunday "—"). Today tile has the day label in color.primary.orange. Each tile shows a stick-figure SF Symbol-style runner illustration at the bottom.
- "I'm eating out right now" pill: white surface, 1pt border, radius.md, fork-knife SF Symbol in tinted color.primary.orange container on the left, title "I'm eating out right now" font.display 700, sub "Match restaurants to 454 kcal · 22g protein left" with the numerics bolded in font.numeric.
- Workout to-do's card (left of a 2-column row): eyebrow "WORKOUT TO-DO'S", 7 checkbox rows (Bench ☑ struck, Dumbbell Press ☑ struck, Lateral Raise, Sauna, 2 mile run, Tricep Pulldown, Stretch). Strikethrough completed in color.text.muted.
- Habit tracking card (right of the 2-column row): eyebrow "HABIT TRACKING", 10x7 dot grid (mostly color.semantic.success, sparse color.semantic.error misses, some color.bg.border empties). Floating "+" button bottom-right in color.text.primary.
- Verdict card (white surface with 3pt left accent in color.semantic.success): eyebrow "ENGINE · VERDICT" color.semantic.success; verdict "A grilled chicken bowl puts you on target tonight." font.display 600 text.body.lg color.text.primary; sub "454 kcal · 22 g protein remaining. Morning protein at 128 g and 7 hours of sleep put you in range." font.body color.text.secondary; two CTAs side-by-side ("Log dinner" primary dark, "Ask coach" ghost).
- Coach nudge card: same chrome as verdict but with 3pt left accent in color.semantic.premium (violet); avatar circle "FW" in color.semantic.premium; tag "COACH · NOTICED"; text "Sleep dropped to 6h 22m avg this week. Want a wind-down routine tonight?"; reply chips "Suggest one" (primary, success tint) + "Not now".
- Mood/Energy row: two side-by-side small cards, each with eyebrow + 5-dot scale. Active mood dot color.semantic.success, active energy dot color.primary.orange.
- Today's meals card: eyebrow "TODAY'S MEALS · 1,546 KCAL LOGGED" + "All ›" link; 3 logged meal rows + 1 pending dinner row. Each row: 36x36 thumb (food emoji or ChatGPT Images placeholder), slot label small caps, meal name font.display 600, macros in DM Sans, calorie number on the right with "kcal" sub.
- Daily Recap card: 3pt left accent in color.semantic.premium, hamburger-style icon left, title "Today's recap (8 PM)", sub "Coach is preparing your summary — tap when ready", chevron right.

Bottom: tab bar with SF Symbols (house.fill / list.bullet / message.fill / book.fill / chart.line.uptrend.xyaxis). Home tab active in color.text.primary.

FAB bottom-right: 52pt circle, color.text.primary background, "+" white, elevation.2.

EMPTY STATE: same layout but Health Score reads "7-day baseline" with a placeholder sparkline, all to-do checkboxes unchecked, habit grid in color.bg.border default, meals section reads "You haven't logged a meal yet today — want a suggestion based on your plan?" with a primary CTA.

Generate 3 variations (composition deltas only — structural hierarchy holds).
```

### 3.11 Mockup — Meal Log day view

```
Promote Meal Log wireframe.

Day selector: 7-day horizontal pill row, today is a filled color.text.primary pill with white text, other days are ghost pills.
Macro summary thin bar: 3-segment horizontal bar showing protein/carbs/fat remaining vs targets, channel colors at full saturation.
Section headers "Breakfast" / "Lunch" / "Dinner" / "Snacks" in font.display 600 text.title.sm.
Meal rows match Dashboard meal row style.
Persistent floating add FAB color.text.primary 56pt circle, "+" white, bottom-right, elevation.2.

EMPTY: "No meals logged yet. The fastest way is a photo — tap the + below." FAB pulses subtly on first session.

Generate 3 variations.
```

### 3.12 Mockup — Add Meal sheet (Photo default)

```
Promote Add Meal wireframe — Photo mode default.

Sheet style: rounded top corners radius.lg, drop shadow elevation.3, color.bg.surface.
Top bar: grabber pill at top center; "Cancel" left (color.text.secondary); title "Add meal" center (font.display 700 text.title.sm); meal slot pill on right ("Lunch ▾" in font.body.sm 600, color.bg.elevated #0F1117 bg, white text).
Segmented control: [Photo · selected] [Search] [Scan]. Selected segment uses color.bg.elevated bg + white text.

Photo mode (default):
- Camera viewfinder: full-bleed dark rectangle (simulates camera feed)
- Shutter button: 72pt circle, white fill with color.bg.border ring, centered bottom
- Library link: "Choose from library" color.text.body font.body.sm 500 above shutter
- Recent foods horizontal chip row pinned at the bottom edge: 4–5 chips (e.g. "Yogurt + berries 358kcal", "Caesar wrap 612kcal"), color.bg.surface chips with 1pt border on dark, white text

Also generate alternate states:
- Search mode: bright surface, search input, recent chips grid, results list area
- Scan mode: viewfinder with barcode reticle overlay

Generate 3 variations of Photo mode.
```

### 3.13 Mockup — Food Detail / Portion editor sheet

```
Promote Food Detail sheet wireframe.

Top: grabber, Cancel left, Save right (Save is gradient.brand pill).
Title: food name in font.display 700 text.title; brand below in font.body color.text.secondary.
Hero row: 64x64 food image (ChatGPT Images 2.0) left + macro mini-card right (4 small stat blocks: cal/P/C/F).
Portion editor: stepper with "−" and "+" 36pt circle buttons + value in DM Sans 700 text.title; unit segmented ([g] [oz] [serving]) below.
Meal slot picker: segmented [Breakfast] [Lunch] [Dinner] [Snack].
Delete button (when editing): text-link style at bottom, color.semantic.error.

Generate 3 variations.
```

### 3.14 Mockup — Restaurant Guidance

```
Promote Restaurant Guidance wireframe — Dashboard-entry primary state.

Top: back chevron, title "Eating out"; subtitle pill below shows the active filter "612 kcal · 38g protein left" in color.bg.elevated bg with color.semantic.success accent for the macro numerics.

"Top 3 picks for right now" section: 3 cards stacked vertically. Each card:
- Restaurant logo placeholder (top-left, 40x40)
- Restaurant name (font.display 600 text.body.lg)
- Cuisine tag (font.body.sm color.text.secondary)
- Recommended menu item with macros immediately visible (DM Sans pill: "Grilled Chicken Bowl · 540 kcal · 38P")
- "Why this fits" one-line explainer in font.body.sm color.text.secondary
- "Coach pick" badge in color.semantic.success at 10% alpha background, success text

"Show all restaurants" link below.

Then a vertical list of all restaurants — minimal rows (logo, name, cuisine tag, chevron).

Generate 3 variations.
```

### 3.15 Mockup — Restaurant Detail

```
Promote Restaurant Detail wireframe.

Hero strip: large restaurant logo + name (font.display 700 text.title.lg) + cuisine + location text.

"Coach picks for today" section: horizontal scroll of 3–4 menu cards, each with item name, macros, "Why this fits" expander icon.

"Full menu" section: vertical list grouped by category. Each row has name, macros chip, "Log" button (color.bg.elevated pill, white text).

Coach-pick rows have a small color.semantic.success badge inline.

Generate 3 variations.
```

### 3.16 Mockup — Recipe Browser (remaining-macros lead)

```
Promote Recipe Browser wireframe.

Hero section "For your remaining macros today" — labeled banner showing remaining macros + 3 ranked recipe cards in a horizontal scroll. Each recipe card: 4:3 image placeholder (ChatGPT Images 2.0 food photography), recipe name, prep time, macros chip row, macro-fit indicator (small bar chart showing how it complements remaining macros).

Below: "Browse all instead" toggle text-link.
When toggle is on: filter chip row appears (Quick / High protein / Vegetarian / Cuisine ▾ / + More), then a 2-column grid of recipe cards.

EMPTY: "Nothing in your saved recipes fits today's remaining macros. Want a fresh meal plan, or browse all?" with two CTAs.

Generate 3 variations.
```

### 3.17 Mockup — Recipe Detail

```
Promote Recipe Detail wireframe.

Hero image: full-width 16:9, ChatGPT Images 2.0 food photography with caption tag "<RECIPE NAME> · CHATGPT IMAGES 2.0" small bottom edge.
Title large, font.display 700 text.title.lg.
Meta row: prep time · servings · cal/serving, all in DM Sans color.text.secondary.

Action row: "Add to Grocery List" primary gradient.brand full-width OR "Log as meal" secondary ghost. Both visible.

"Ingredients" section with serving size stepper; bulleted ingredient list (font.body, each row with checkbox affordance for grocery-add).

"Instructions" section: numbered steps in font.body, generous spacing.

Generate 3 variations.
```

### 3.18 Mockup — Meal Plan Generator

```
Promote Meal Plan wireframe.

Initial state: hero illustration (ChatGPT Images 2.0 placeholder "MEAL PLAN HERO"), title "Tell us your week. We'll generate 3 options." subtitle in font.body.
Options form: 3 controls (days stepper, meals-per-day segmented, time-budget segmented).
Primary CTA "Generate 3 plans" gradient.brand.

Results state: 3 plan cards stacked. Each card:
- Plan letter ("Plan A") + single-line summary in font.display 600 ("Higher protein, lighter dinners")
- Macro fit indicator (small bar chart)
- "View this plan" ghost button

Bottom: "Regenerate" secondary text-link with refresh icon.

Generate 3 variations of the results state.
```

### 3.19 Mockup — Grocery List (grouped)

```
Promote Grocery List wireframe.

Sections by category (Produce, Protein, Dairy, Pantry, Other). Section headers in font.body 700 text.caption uppercase color.text.secondary, tracking +0.08em.

Row anatomy: checkbox left (24pt, color.text.primary tint when checked), item name + quantity (font.body), source tag ("from Recipe X") in font.body.sm color.text.muted on the right.

Checked rows: strikethrough + color.text.muted.

Add-item input bar pinned below title: white surface, "+" button on the right in color.text.primary.

Bottom action: "Clear bought items" secondary ghost.

Generate 3 variations.
```

### 3.20 Mockup — Coach Chat

```
Promote Coach Chat wireframe.

Background color.bg.base. Chat area scrollable.
Coach bubble: color.bg.surface white, 1pt border, radius.lg, padding md, font.body 500 color.text.primary. Avatar 28pt circle on the left with "FW" font.display 700 white on color.semantic.premium violet.
User bubble: color.bg.elevated #0F1117, white text font.body 500, radius.lg, right-aligned.
Inline Learn card: a sub-card within a coach bubble — 1pt color.bg.border, article title in font.display 600, "Read full article →" link in color.semantic.info.
Quick-reply chips: pill style, color.bg.surface 1pt border, font.body.sm 600. Active chip color.semantic.success tint.

Input bar pinned above tab bar: white surface, mic icon left (SF "mic.fill"), text field with placeholder "Ask me anything about today…" color.text.muted, send button right (SF "arrow.up.circle.fill" 32pt in color.semantic.success).

EMPTY: welcome message from coach + 3 starter chips ("Plan my dinner" / "I'm eating out" / "Check my macros").

Generate 3 variations.
```

### 3.21 Mockup — Learn home

```
Promote Learn home wireframe.

Search bar pinned at top: white surface, SF "magnifyingglass", placeholder "Search articles" color.text.muted.
Categories section: horizontal scroll of category tiles. Each tile 120x120, white surface, radius.md, 1pt border, icon top (SF Symbol in a semantic color), label below in font.body 600.
"Continue reading" section: 1–2 cards with progress bar.
"Featured" section: vertical list of article cards (image left, title + summary right). Each article card has read time pill ("3 min read") in color.bg.elevated white.

Generate 3 variations.
```

### 3.22 Mockup — Article Detail

```
Promote Article Detail wireframe.

Hero image 16:9 (ChatGPT Images 2.0 placeholder).
Title font.display 700 text.title.lg.
Meta row: read time · category tag (color.semantic.info @ 10% alpha pill).
Body: long-form paragraphs in font.body color.text.body, line-height generous. One inline image placeholder mid-article.

"ONE THING TO TRY TODAY" callout card: brand-accented border (gradient.brand thin top strip), title font.display 700 color.text.primary, one-line actionable suggestion in font.body, color.semantic.success checkmark icon.

"Related articles" section below: 2–3 article cards.

Generate 3 variations.
```

### 3.23 Mockup — Progress overview (weekly default)

```
Promote Progress wireframe.

Time range selector: segmented [Weekly (selected)] [Monthly] [90-day] [All]. Selected segment color.bg.elevated white text.

Weight card: SVG line chart placeholder showing weekly averages over 12 weeks; summary stat "−1.2 lb · week over week" in color.semantic.success font.numeric 600; "Add weight" small button right.

Macro adherence card: bar chart placeholder; summary "85% on target this week" color.semantic.success.

Body photos section: horizontal scroll of square thumbs + "Add photo" tile (dashed border).
Measurements: list with weekly trend arrows (▲ ▼ ·) color-coded.
Mood & energy: small heatmap of the week + "Log mood" button.

Health Score sparkline section (NEW): mini line chart + current score, tap → Health Score detail.

Generate 3 variations.
```

### 3.24 Mockup — Your Plan / Profile

```
Promote Your Plan wireframe.

Profile header: avatar circle (40pt, gradient brand), name in font.display 700, goal pill in color.semantic.success @ 10% alpha.

Current targets card: 2x2 grid macros (same as Plan Reveal but smaller). Each value tappable to edit (chevron-down indicator).

Primary action "Recalculate my plan": secondary style (color.bg.elevated dark pill), elevation.2 — Max wants this to feel weighty.

"Why this plan" expander reveals reasoning in font.body color.text.body.

Edit links: [Edit goal] [Edit body baseline] [Edit dietary constraints] [Edit lifestyle] — each a row with chevron.

Also draw the Recalculate confirm modal: color.bg.surface card, radius.lg, title "Recalculate your plan?" font.display 700, body explainer, two CTAs ("Recalculate" gradient.brand / "Cancel" ghost).

Generate 3 variations of the main screen plus the modal.
```

### 3.25 Mockup — Workout Detail (Push day)

```
Promote Workout Detail wireframe (the Push-day reference style).

Top: back chevron + day label "Today · 9:41 AM" + more menu.
Page title "Push day" font.display 700 text.title.lg.
Meta strip "7 exercises · ~55 min · Upper body" font.body.sm color.text.secondary.
Right-aligned big stat "320 EST. KCAL" DM Sans 700.

Hero image: 16:9 ChatGPT Images 2.0 placeholder with caption tag "PUSH-DAY HERO · CHATGPT IMAGES 2.0" bottom edge.

Verdict card: 3pt left accent color.semantic.success, eyebrow "ENGINE · VERDICT", verdict "Match yesterday's intensity." font.display 600 text.body.lg, sub "Morning protein at 128 g and 7 hours of sleep last night put you in range. No reason to back off." font.body color.text.secondary.

Three-stat row: VOLUME TARGET 12,400 lb / SETS 23 / EST. TIME 55 min. Each white card with eyebrow + DM Sans 700 value.

Exercise list card: eyebrow "EXERCISES" + "1/7" right-aligned. Rows:
- "01 · Bench press · Last 4×8 @ 180 lb" + right-aligned "4 × 8 · 185 lb" pill in DM Sans
- "02 · Incline DB press · Last 3×10 @ 60 lb" + "3 × 10 · 65 lb"
- (more exercises below the fold)

Sticky bottom action bar: "▶ Start workout" full-width black pill (color.text.primary bg, white text), elevation.cta, SF "play.circle.fill" icon.

EMPTY: "No workout planned today. Pick a template or build your own." Two CTAs.

Generate 3 variations.
```

### 3.26 Mockup — Health Score detail

```
Promote Health Score detail wireframe.

Hero card: composite Health Score "86.4" in massive DM Sans 700; delta pill "▲ 4.2 LAST 30 DAYS" in color.semantic.success; 30-day area sparkline below using gradient.text colors.

"Why this score" expander → coach-voice paragraph in font.body.

Five component cards in a vertical stack:
- Nutrition adherence
- Training consistency
- Sleep
- Recovery (HRV / RHR)
- Body composition

Each card: eyebrow with the component name, score in DM Sans 700, mini sparkline trending, tap-target chevron.

Generate 3 variations.
```

### 3.27 Mockup — Habit Tracking detail

```
Promote Habit Tracking detail wireframe.

Time-range selector: [Weekly (default)] [30-day] [All].

Full habit dot grid (rows = habits, cols = days). Dot states:
- Complete: filled color.semantic.success
- Missed: filled color.semantic.error
- Not yet logged: empty color.bg.border
- Future: dimmed gray

Habit row list below: name, definition font.body.sm color.text.secondary, this-week count "X / 7" font.numeric, today-toggle tappable.

"+ Add habit" trailing action.

EMPTY: "Pick 3 habits to start. Coach can suggest some." with [Coach suggestions] primary CTA.

NO streak chrome. The grid is the visualization; never overlay celebratory counts.

Generate 3 variations.
```

### 3.28 Mockup — Daily Recap

```
Promote Daily Recap wireframe.

Title "Today's recap" with date subline font.body.sm color.text.secondary.

Hero verdict card: 3pt left accent color.semantic.premium violet, eyebrow "COACH · RECAP", coach paragraph in font.display 500 text.body.lg color.text.primary (3–4 sentences in coach voice — direct, specific, no celebration).

Highlights section: one row per signal (macro adherence, sleep, mood/energy, training, weight trend). Each row: small SF Symbol icon left, label, one-line observation, trend indicator on the right (▲ ▼ ·).

"Tomorrow" card: brand-accented background (gradient.brand at 10% alpha), title "Tomorrow", suggestion in font.display 500 ("Try a higher-protein breakfast — you ran 18g short today.").

Bottom action: "Reply to coach" gradient.brand → opens Coach Chat with recap context preloaded.

Close (X) top-left dismisses.

EMPTY: "Tomorrow's the start of your recap. The more you log, the smarter this gets."

Generate 3 variations.
```

### 3.29 Mockup — Settings

```
Promote Settings wireframe.

iOS-standard grouped list style. Section headers in font.body 700 text.caption uppercase, color.text.secondary.

Groups:
- ACCOUNT: Email row (color.text.primary value), Sign-in method row ("Apple" or "Email")
- PERMISSIONS: Apple Health row with status pill (color.semantic.success "Connected" or color.text.muted "Off"), Notifications row similar
- NOTIFICATION PREFERENCES: Quiet hours row (read-only "10pm – 7am"), trigger toggles list (each row a label + iOS native switch)
- DATA: Export data → email, Delete account → destructive sheet
- ABOUT: Version, Terms, Privacy

Sign out button: text-link style at the very bottom, color.semantic.error.

Generate 3 variations.
```

### 3.30 Mockup — Entry sheets (Photo / Measurements / Mood)

```
Promote the three entry sheets — render as a single output showing all three side by side.

All three are bottom sheets, color.bg.surface, radius.lg top corners, elevation.3.

PHOTO CAPTURE:
- Grabber, Cancel left, Save right (Save gradient.brand, disabled if no photo)
- Title "Add photo" font.display 700 text.title.sm
- Camera viewfinder placeholder centered, square
- 72pt white shutter button below
- "Choose from library" text link below

MEASUREMENTS ENTRY:
- Grabber, Cancel/Save
- Title "Add measurements"
- Form fields: Waist, Hips, Chest, Arms, Thighs — each numeric input with unit toggle (in/cm). DM Sans for numerics.
- Date picker row default to today

MOOD ENTRY:
- Grabber, Cancel/Save
- Title "How are you feeling?"
- Mood row: 1-5 large circles, SF Symbols inside (e.g. "face.dashed" through "face.smiling.fill"), labeled "Mood" small caps
- Energy row: same with energy bolt icons "bolt" through "bolt.fill"
- Optional free-text note field
- Date picker

One image, three labeled subframes. No variations needed.
```

---

## 4. Acceptance checklist

Track mockup progress here. Each row gets ticked when Max signs off.

| # | Screen | Generated | Max approved | Saved to /mockups/ |
|---|---|---|---|---|
| 1 | Onboarding — Welcome | ☐ | ☐ | ☐ |
| 2 | Sign in / Sign up | ☐ | ☐ | ☐ |
| 3 | Goal selection | ☐ | ☐ | ☐ |
| 4 | Body baseline | ☐ | ☐ | ☐ |
| 5 | Dietary constraints | ☐ | ☐ | ☐ |
| 6 | Lifestyle | ☐ | ☐ | ☐ |
| 7 | HealthKit permission | ☐ | ☐ | ☐ |
| 8 | Notification permission | ☐ | ☐ | ☐ |
| 9 | Your Plan reveal | ☐ | ☐ | ☐ |
| 10 | Dashboard | ☐ | ☐ | ☐ |
| 11 | Meal Log day view | ☐ | ☐ | ☐ |
| 12 | Add Meal sheet (Photo) | ☐ | ☐ | ☐ |
| 13 | Food Detail sheet | ☐ | ☐ | ☐ |
| 14 | Restaurant Guidance | ☐ | ☐ | ☐ |
| 15 | Restaurant Detail | ☐ | ☐ | ☐ |
| 16 | Recipe Browser | ☐ | ☐ | ☐ |
| 17 | Recipe Detail | ☐ | ☐ | ☐ |
| 18 | Meal Plan Generator | ☐ | ☐ | ☐ |
| 19 | Grocery List | ☐ | ☐ | ☐ |
| 20 | Coach Chat | ☐ | ☐ | ☐ |
| 21 | Learn home | ☐ | ☐ | ☐ |
| 22 | Article Detail | ☐ | ☐ | ☐ |
| 23 | Progress overview | ☐ | ☐ | ☐ |
| 24 | Your Plan / Profile | ☐ | ☐ | ☐ |
| 25 | Workout Detail | ☐ | ☐ | ☐ |
| 26 | Health Score detail | ☐ | ☐ | ☐ |
| 27 | Habit Tracking detail | ☐ | ☐ | ☐ |
| 28 | Daily Recap | ☐ | ☐ | ☐ |
| 29 | Settings | ☐ | ☐ | ☐ |
| 30 | Entry sheets (Photo/Measurements/Mood) | ☐ | ☐ | ☐ |

30 mockups total — one more than wireframes because Settings was previously consolidated.

## 5. Review rubric — mockups

Before approving each mockup:

1. **Tokens match DESIGN.md** — no out-of-system hex codes, no improvised type scale
2. **Light surfaces** — root and cards are bright, except the inverted-row band
3. **Full-saturation accents** — no pastels, no desaturated semantic colors
4. **Real copy** — no `[Primary Action: X]` placeholders, no Lorem Ipsum where actual copy was specified
5. **Verdict-first** — recommendation above data on every screen that has both
6. **No banned patterns** — no streak chips, no card gradients, no decorative emoji
7. **SF Symbols** — all icons match the canonical set
8. **Empty state present** — every screen has its empty variation
9. **Photography placeholders** — labeled with the "<NAME> · CHATGPT IMAGES 2.0" caption convention
10. **Type hierarchy** — display / body / numeric all used in the right places

## 6. Exit criteria

- [ ] All 30 mockups generated and approved by Max
- [ ] Saved to `docs/ios-guide/mockups/<screen-slug>.png`
- [ ] Choices logged in `docs/ios-guide/decisions.md`
- [ ] Move to Phase 0.6 — Interactive Prototype

---

*Output of Phase 0.5 · Step 4. Next: Phase 0.6 Interactive Prototype.*

# FuelWell — Wireframe Prompts (Phase 0.5 · Step 3)

**Status:** ✅ READY — incorporates Max's Step 1 review (2026-05-13). Includes new Lifestyle onboarding step, new Daily Recap screen (#14), Dashboard above-the-fold compression with "I'm eating out" CTA, Photo-default Add Meal, weekly-default Progress, single-line Meal Plan summaries, grouped Grocery, and empty-state guidance per screen.

**Purpose:** ready-to-paste prompts for Claude Design, one per wireframe. Each prompt is self-contained so you can run them in separate sessions without losing context.

**Output target:** ~15–18 grayscale wireframe images, one per screen, locked as the structural spec before Step 4 (Mockups) adds brand and color.

---

## 1. How to use this doc

For each screen below:

1. Open Claude Design (the version included in your Max subscription).
2. Paste **Section 2 (Common Constraints)** as the first message — this sets the style for the session.
3. Paste the **screen-specific prompt** from Section 3 as the second message.
4. Ask for **three variations** ("Generate 3 variations of this wireframe with different layout approaches").
5. Review with Max. Pick one variation per screen. Note the choice and the *why* in `docs/ios-guide/decisions.md`.
6. Save the chosen image to `docs/ios-guide/wireframes/<screen-slug>.png`.
7. Tick the screen off in Section 4's checklist.

If Claude Design loses context mid-session, repaste both Section 2 and the screen prompt.

---

## 2. Common Constraints (paste first, every session)

```
You are generating low-fidelity wireframes for an iOS app called FuelWell.

Apply these constraints to every wireframe you produce in this session:

CANVAS
- iPhone 15 Pro size: 393 x 852 points, portrait
- Show the iOS status bar (time, battery, signal) as a thin gray strip at top
- Show the home-indicator bar as a thin gray line at the bottom
- Where the screen is a tab root, show a 5-tab bottom bar above the home indicator with these labels: Home, Log, Coach, Learn, Progress

STYLE
- Pure grayscale only. No color. Use shades: white background, light gray (#EEE) for surfaces, medium gray (#999) for borders, dark gray (#333) for primary text, black for emphasis.
- No photography. Where an image would go, draw a rectangle with a diagonal-line pattern and the label "IMAGE" inside.
- No custom fonts. Use a generic sans-serif. Final typography comes later.
- No brand marks, no logos, no color accents.
- Label interactive elements by FUNCTION, not final copy. Example: a button reads "[Primary Action: Log Meal]" not "Log Meal".
- Use placeholder text "Lorem ipsum" only when the actual text length matters; otherwise label the element type.

LAYOUT RULES
- Mark the "fold" — the bottom edge of what's visible without scrolling — with a horizontal dashed line and the label "FOLD".
- Show standard iOS edge padding: 16pt left/right margins.
- Card components: rounded rectangles with a 1pt border, internal padding visible.
- Verdict-first principle: any "what should I do" banner or recommendation always sits ABOVE supporting data on the screen.

EMPTY STATES
- Every wireframe must include an "empty state" variation alongside the populated one (e.g. no meals logged yet, no recipes saved, no progress data). Max calls these "brand moments" — they're not blank lists, they're coaching opportunities.
- Empty state copy is always a question or suggestion, never just "Nothing here yet." Example: "You haven't logged a meal today — want a suggestion based on your plan?"

OUTPUT
- One wireframe per request unless I ask for variations.
- Annotate non-obvious elements with a small label and a leader line. Annotations sit OUTSIDE the device frame.
- Acknowledge these constraints, then wait for the screen prompt.
```

---

## 3. Per-screen prompts

Each block below is one paste. The screens are ordered to match the App Map.

### 3.1 Onboarding — Welcome

```
Wireframe: ONBOARDING — WELCOME (Screen 1 of 8 in onboarding flow)

Single full-screen view. No tab bar.

ABOVE THE FOLD:
- Centered: app wordmark placeholder (rectangle labeled "FUELWELL WORDMARK")
- Below wordmark: one-line tagline placeholder ("[Tagline: ~6 words]")
- Below tagline: hero illustration placeholder (rectangle, 280x280, labeled "HERO IMAGE")
- Primary action button at bottom: "[Primary Action: Get Started]" full-width
- Secondary text link below button: "[Text Link: I already have an account]"

No back button. No tab bar.

Generate 3 variations:
1. Wordmark at top third, image centered, buttons at bottom
2. Image-first layout (image takes top half), wordmark below it
3. Minimal — wordmark + button only, no hero image
```

### 3.2 Onboarding — Sign in / Sign up

```
Wireframe: ONBOARDING — SIGN IN / SIGN UP (Screen 2 of 9)

Single full-screen view. No tab bar.

ABOVE THE FOLD:
- Back arrow top-left
- Title: "[Screen Title: Sign in or create account]"
- Apple Sign-In button — full-width, dark-filled rectangle with Apple logo placeholder and label "[Primary: Continue with Apple]"
- "or" divider with horizontal lines on either side
- Email input field with label "[Field: Email]"
- Password input field with label "[Field: Password]"
- Primary action button: "[Primary Action: Continue]"
- Text link below: "[Text Link: Forgot password?]"

No tab bar.

Generate 3 variations:
1. Apple Sign-In top, email/password below
2. Toggle between Sign-In and Sign-Up modes at top
3. Single combined form — system detects new vs returning user
```

### 3.3 Onboarding — Goal selection

```
Wireframe: ONBOARDING — GOAL SELECTION (Screen 3 of 9)

Single full-screen view. No tab bar.

ABOVE THE FOLD:
- Back arrow top-left, progress dots top-center (3 of 8 filled)
- Title: "[Screen Title: What's your goal?]"
- Subtitle: "[Subtitle: One sentence of context]"
- Vertical stack of 3 selectable cards, each with:
  - Icon placeholder (left, square)
  - Title and one-line description
  - Selection state indicator on right (radio circle)
  - Cards: "[Lose weight]", "[Maintain weight]", "[Gain weight]"
- Note below cards: "[Helper text: Recomp goals available in Premium]"
- Primary action button at bottom: "[Primary Action: Continue]" (disabled state until selection)

Generate 3 variations:
1. Stacked cards with icons on left
2. Grid of 3 cards, equal size, icons on top
3. Large tappable rows with no card chrome
```

### 3.4 Onboarding — Body baseline

```
Wireframe: ONBOARDING — BODY BASELINE (Screen 4 of 9)

Single full-screen view. No tab bar.

ABOVE THE FOLD:
- Back arrow top-left, progress dots top-center (4 of 8 filled)
- Title: "[Screen Title: Tell us about you]"
- Form fields, vertically stacked:
  - Height (segmented: ft/in vs cm)
  - Weight (segmented: lb vs kg)
  - Age (numeric input)
  - Sex (segmented: Male / Female / Prefer not to say)
  - Activity level (4-option vertical picker: Sedentary / Light / Moderate / Very active)
- Primary action: "[Primary Action: Continue]"

Show FOLD line — likely after Sex; Activity level may be below fold.

Generate 3 variations:
1. All fields stacked, traditional form
2. Multi-step micro-form (one field per "page" with quick advance)
3. Combined card with everything visible, compressed
```

### 3.5 Onboarding — Dietary constraints

```
Wireframe: ONBOARDING — DIETARY CONSTRAINTS (Screen 5 of 9)

Single full-screen view. No tab bar.

ABOVE THE FOLD:
- Back arrow, progress dots (5 of 9)
- Title: "[Screen Title: Anything we should avoid?]"
- Subtitle: "[Subtitle: Optional — you can change this later]"
- Two horizontally-scrolling chip rows, each labeled:
  - "Allergies" row: chips for [Peanuts] [Tree nuts] [Dairy] [Gluten] [Shellfish] [Soy] [Eggs] [+ Add]
  - "Don't like" row: chips for [Mushrooms] [Cilantro] [Olives] [+ Add]
- Free-text field: "[Field: Anything else?]"
- Primary action: "[Primary Action: Continue]"
- Skip link: "[Text Link: Skip for now]"

Generate 3 variations:
1. Two chip rows + free text (as described)
2. Toggle list (long vertical list with switches)
3. Searchable picker that adds chips as selected

(Next step in flow: Lifestyle — see 3.6)
```

### 3.6 Onboarding — Lifestyle *(NEW per Max)*

```
Wireframe: ONBOARDING — LIFESTYLE (Screen 6 of 9)

Single full-screen view. No tab bar. This step is what tunes restaurant and recipe ranking from the very first session.

ABOVE THE FOLD:
- Back arrow, progress dots (6 of 9 filled)
- Title: "[Screen Title: How do you usually eat?]"
- Subtitle: "[Subtitle: One sentence — we'll tailor your suggestions]"
- Vertical stack of 3 selectable cards, each with:
  - Icon placeholder (left, square)
  - Title + one-line description
  - Selection state indicator (radio circle)
  - Cards: "[Cook at home mostly]" / "[Eat out mostly]" / "[Both equally]"
- Primary action: "[Primary Action: Continue]" (disabled until selection)

Generate 3 variations:
1. Stacked cards with icons left (clean list feel)
2. Three large equal tiles in a single column with hero icons on top
3. Toggle-style segmented control without card chrome
```

### 3.7 Onboarding — HealthKit permission

```
Wireframe: ONBOARDING — HEALTHKIT PERMISSION (Screen 7 of 9)

Single full-screen view. No tab bar. This screen EXPLAINS what we'll request; the actual iOS permission sheet comes after the Continue tap.

ABOVE THE FOLD:
- Back arrow, progress dots (6 of 9)
- Heart/health icon placeholder, centered
- Title: "[Screen Title: Connect Apple Health]"
- Subtitle paragraph: "[Body: 2-3 sentences explaining read-only scope]"
- Bulleted list of what we read:
  - Weight
  - Steps
  - Workouts
  - Active energy
- Two stacked buttons:
  - Primary: "[Primary Action: Connect Apple Health]"
  - Secondary text link: "[Text Link: Skip for now]"

Generate 3 variations:
1. Icon + title + bullets + buttons (clean, clinical)
2. Illustration-led (large image, minimal copy)
3. Permission preview that mimics iOS sheet style
```

### 3.7 Onboarding — Notification permission

```
Wireframe: ONBOARDING — NOTIFICATION PERMISSION (Screen 8 of 9)

Same pattern as 3.6 but for push notifications.

ABOVE THE FOLD:
- Back arrow, progress dots (7 of 9)
- Bell icon placeholder, centered
- Title: "[Screen Title: Let your coach reach you]"
- Subtitle: "[Body: Event-driven only — never spammy. Quiet hours 10pm–7am.]"
- Bulleted list of trigger types:
  - When you skip a meal
  - When you go over your macros
  - When you miss a workout
  - When your weight trends off-plan
- Two buttons:
  - Primary: "[Primary Action: Enable Notifications]"
  - Secondary text link: "[Text Link: Skip for now]"

Generate 3 variations:
1. Same layout family as HealthKit screen
2. Visual list of trigger types with example notification mockups
3. Minimal — title, sub, buttons only
```

### 3.8 Onboarding — Your Plan reveal

```
Wireframe: ONBOARDING — YOUR PLAN REVEAL (Screen 9 of 9)

NOTE (per Max): this is the "magic moment." Should feel like a PAYOFF, not a confirmation screen. Do not cut the why-this-plan explainer — it's critical.

This is the "magic moment" — the user sees their first computed plan.

ABOVE THE FOLD:
- No back arrow, progress dots (8 of 8 all filled)
- Title: "[Screen Title: Your plan is ready]"
- Hero card: Daily macro targets shown as 4 large numbers in a 2x2 grid:
  - Calories
  - Protein
  - Carbs
  - Fat
  Each with unit label below the number.
- Expandable section: "[Expander: Why these numbers?]"
- Primary action: "[Primary Action: Start tracking]"

BELOW FOLD (after expander tap):
- Expanded explanation paragraph: "[Body: Why-this-plan reasoning, ~4 sentences]"

Generate 3 variations:
1. 2x2 number grid hero
2. Single hero number (calories) with macros as supporting row
3. Ring/dial visual for calories, macros as breakdown legend
```

### 3.9 Dashboard (Home tab root) — UPDATED per Max

```
Wireframe: DASHBOARD (Home tab root)

Tab bar visible at bottom (Home tab selected).

ABOVE THE FOLD CONTRACT (CRITICAL — all FIVE elements must be visible without scrolling):
1. Verdict banner / next recommended meal
2. Macro ring
3. One coach nudge card (only when triggered; otherwise empty space stays for the row but the card is hidden)
4. Mood/energy one-tap row (1-5 dots for mood, 1-5 dots for energy, inline — NOT a sheet)
5. "I'm eating out right now" quick action button — prominent, easily tappable

Layout, top to bottom:
- Top bar: greeting on left ("[Greeting: Good afternoon, Robert]" with date subline), avatar circle on right with streak badge overlay
- VERDICT BANNER (full-width card): one-line verdict ("[Verdict: You've got 612 kcal and 38g protein left]") + reasoning subtitle + primary CTA "[Primary Action: Log dinner]"
- Macro ring + horizontal P/C/F bars (compact — ring smaller than original spec to make room above the fold)
- "I'M EATING OUT RIGHT NOW" QUICK ACTION: full-width pill button with restaurant-fork icon — visually distinct from the verdict CTA, sits directly below macros
- Coach nudge card (shown only when a trigger fires; collapsible to a 1-line strip if not actively triggered)
- Mood/energy row: two inline 1-5 dot scales side by side, labeled "Mood" and "Energy" — single-tap logs

BELOW THE FOLD:
- Today's meals list (logged meals so far + pending meal slot rows)
- Daily Recap card (appears after 8pm or as a persistent always-accessible link)
- Quick stats row (steps / hydration / active kcal — small tiles)
- Floating Action Button (FAB) at bottom-right: "[FAB: Quick Add +]"

EMPTY STATE (first-time user, no meals logged):
- Verdict says: "[Empty verdict: Welcome — your day starts here. Log your first meal whenever you're ready.]"
- "Today's meals" section reads: "[Empty: You haven't logged a meal yet today — want a suggestion based on your plan?]" with a primary CTA "[Suggest a meal]"

Generate 3 variations of the populated state:
1. Verdict + ring + eating-out CTA + nudge + mood — clean vertical stack (above the fold density-optimized)
2. Verdict integrated with ring (verdict text overlays the ring's center) to save vertical space — eating-out CTA gets more prominence
3. Card-based — each above-the-fold element in its own elevated card with consistent rhythm
```

### 3.10 Meal Log day view (Log tab root) — UPDATED per Max

```
Wireframe: MEAL LOG DAY VIEW (Log tab root)

Tab bar visible at bottom (Log tab selected). This screen is opened multiple times per day — the add affordance MUST be fast and prominent.

ABOVE THE FOLD:
- Top bar: title "[Screen Title: Today]" centered, "+" button right
- Day selector: horizontal row of 7 day pills (centered on today), swipeable
- Shortcut row (horizontal scroll): icon+label pills for [Restaurants] [Recipes] [Meal Plan] [Grocery]
- Today's macro summary: thin horizontal bar showing remaining macros (compact, not the dashboard ring)
- Section: "Breakfast" with meal row(s) or empty state "[Empty: + Add breakfast]"
- Section: "Lunch" with meal row(s) or empty state

BELOW THE FOLD:
- Section: "Dinner"
- Section: "Snacks"

PERSISTENT FLOATING ADD BUTTON (Max): a large, brand-colored FAB pinned bottom-right above the tab bar — visible while scrolling. Distinct from the top-right "+" and visually heavier.

EMPTY STATE (first-time user):
- Header reads as usual
- Body reads: "[Empty: No meals logged yet. The fastest way is a photo — tap the + below.]"
- The persistent FAB pulses subtly to draw attention on first session only.

Generate 3 variations:
1. Sections by meal type with persistent FAB bottom-right
2. Single chronological timeline of meals with times + persistent FAB
3. Grid view — each meal as a card with thumbnail + persistent FAB
```

### 3.11 Add Meal — Photo / Search / Scan (sheet) — UPDATED per Max

```
Wireframe: ADD MEAL SHEET (Photo / Search / Scan)

Presented as a modal sheet from the bottom, covering ~90% of screen height. No tab bar visible.

DEFAULT TAB: PHOTO (Max — most frictionless for real life). Order in the segmented control: [Photo] [Search] [Scan].

ABOVE THE FOLD (default Photo mode):
- Sheet grabber bar (small horizontal pill at top)
- Top row: "Cancel" left, title "[Screen Title: Add meal]" center, meal slot pill on right (e.g. "Lunch ▾")
- Segmented control: [Photo] [Search] [Scan] — Photo selected
- Full-bleed camera viewfinder placeholder with:
  - Centered shutter button (large)
  - Helper text "[Helper: Point at your plate — we'll parse it]"
  - Secondary "[Text Link: Choose from library]" below shutter
  - "Recent foods" horizontal chip row pinned just above the tab bar area for one-tap re-log

ALTERNATE STATES (also draw):
- Search mode: search input "[Field: Search foods or brands]" + "Recent" chips + results list area
- Scan mode: viewfinder with horizontal barcode reticle and "[Helper: Align barcode]"

EMPTY STATE (Search with no recents):
- "[Empty: Start typing — we'll pull from Open Food Facts + your previous meals.]"

Generate 3 variations of the Photo mode layout:
1. Full-bleed camera with recent chips pinned at bottom (as described)
2. Camera viewfinder takes top 60%, recent chips and library link in a panel below
3. Camera with a coach hint overlay: "[Hint: Coach can guess this from one shot]" — emphasizes AI assistance
```

### 3.12 Food Detail / Portion editor (sheet)

```
Wireframe: FOOD DETAIL / PORTION EDITOR (sheet)

Modal sheet, ~75% screen height.

ABOVE THE FOLD:
- Grabber bar
- "Cancel" left, "Save" right (Save is primary-styled)
- Food name (large) and brand (smaller below): "[Title: Food name]" / "[Subtitle: Brand]"
- Image placeholder (square, left side) + macro mini-card (4 numbers stacked: cal/p/c/f) on right
- Portion editor: stepper control with "−" and "+" buttons around a numeric value, unit picker (e.g. "g" / "oz" / "serving") as a segmented control below
- Meal slot picker: segmented [Breakfast] [Lunch] [Dinner] [Snack]
- Delete button (red text style placeholder, present only when editing existing meal)

Generate 3 variations:
1. Image + macros side-by-side at top
2. Macros prominent (large) with image as small thumbnail
3. No image at top — name + macros only, image lower
```

### 3.13 Restaurant Guidance (Log child / Dashboard quick-action target) — UPDATED per Max

```
Wireframe: RESTAURANT GUIDANCE

Pushed screen. Tab bar still visible. Can be entered two ways: from Log tab, or via Dashboard "I'm eating out right now" CTA (which pre-loads today's remaining macros).

ABOVE THE FOLD (when entered from Dashboard CTA — primary use case):
- Back arrow, title "[Screen Title: Eating out]"
- Subtitle pill: "[Context: 612 kcal · 38g protein left today]" — shows today's remaining macros as the active filter
- "Top 3 picks for right now" section — 3 prominent cards, each shows:
  - Restaurant logo + name + cuisine
  - One recommended menu item with macros immediately visible
  - "Why this fits" one-line explainer
- Below picks: "[Text Link: Show all restaurants]"

ABOVE THE FOLD (when entered from Log tab — browse mode):
- Back arrow, title "[Screen Title: Restaurants]"
- Search bar: "[Field: Search restaurants]"
- Toggle: "[Toggle: Show nearby]" (off by default)
- Featured restaurant row (horizontal scroll, 3-4 large cards): each card has logo placeholder, name, "Coach pick" badge slot
- Section: "All restaurants" — vertical list, each row has logo, name, cuisine tag, chevron

EMPTY STATE (curated list still loading, or no nearby chains):
- "[Empty: We don't have these restaurants in our database yet — try search or scan a menu photo.]"

Generate 3 variations of the Dashboard-CTA-entry state (primary):
1. Three large stacked picks with macros and "why this fits" lines (as described)
2. Three picks in a horizontal scroll carousel, full-screen view per pick
3. Two-column grid of picks with the macro fit indicator as a colored bar across each card

Then generate 3 variations of the Log-tab browse state.
```

### 3.14 Restaurant Detail (Log child of child)

```
Wireframe: RESTAURANT DETAIL

Pushed screen. Tab bar visible.

ABOVE THE FOLD:
- Back arrow, restaurant name in title bar
- Hero strip: restaurant logo placeholder + name + cuisine + location text
- "Coach picks for today" section — horizontal scroll of 3-4 menu item cards, each with name, calorie count, "Why this fits" expander
- Section: "Full menu" — vertical list of menu items grouped by category

BELOW THE FOLD:
- More menu items, more categories

Each menu item row: name, macros chip, "[Button: Log]" affordance on right.

Generate 3 variations:
1. Coach picks at top, full menu below (as described)
2. Tabs at top: [Coach picks] [Full menu] [Search]
3. Single ranked list — coach picks pinned at top with a "Recommended" badge, rest of menu below
```

### 3.15 Recipe Browser (Log child) — UPDATED per Max

```
Wireframe: RECIPE BROWSER

Pushed screen. Tab bar visible.

DEFAULT VIEW LEADS WITH REMAINING-MACROS RANKING (Max — that's the differentiator vs every other recipe app).

ABOVE THE FOLD:
- Back arrow, title "[Screen Title: Recipes]"
- Hero section "For your remaining macros today" — a labeled banner showing remaining macros + 3 ranked recipe cards (horizontal scroll), each card pre-tagged with macro fit
- Toggle "[Toggle: Browse all instead]" below the hero section
- Filter chip row (horizontal scroll, visible when toggled to Browse): [Quick (<20 min)] [High protein] [Vegetarian] [Cuisine ▾] [+ More]

BELOW THE FOLD:
- Recipe card grid (2 columns), each card: image placeholder (square top), recipe name, prep time, calorie count, macros chip row

EMPTY STATE (no recipes match remaining macros):
- "[Empty: Nothing in your saved recipes fits today's remaining macros. Want a fresh meal plan, or browse all?]"
- Two CTAs: [Generate plan] [Browse all]

Generate 3 variations:
1. Remaining-macros hero strip + standard grid below (as described)
2. Remaining-macros recipes occupy the whole screen until user explicitly chooses Browse
3. Side-by-side: "for your macros" on left half, generic browse on right half (tab-style)
```

### 3.16 Recipe Detail

```
Wireframe: RECIPE DETAIL

Pushed screen. Tab bar visible.

ABOVE THE FOLD:
- Back arrow, share button top-right, favorite (heart) button top-right
- Hero image placeholder (full-width, 4:3 ratio)
- Recipe name (large title)
- Meta row: prep time · servings · calories per serving
- Action row: "[Primary Action: Add to Grocery List]" full-width, "[Secondary: Log as meal]" below or beside

BELOW THE FOLD:
- "Ingredients" section header with serving size stepper
- Bulleted ingredient list
- "Instructions" section header
- Numbered step list

Generate 3 variations:
1. Hero image + actions stacked (as described)
2. Actions floating over hero image
3. Sticky bottom action bar — Add to Grocery / Log as meal always visible while scrolling
```

### 3.17 Meal Plan Generator

```
Wireframe: MEAL PLAN GENERATOR

Pushed screen. Tab bar visible.

INITIAL STATE (no plan generated yet):
- Back arrow, title "[Screen Title: Meal plan]"
- Hero illustration placeholder
- Title text: "[Body: Tell us your week. We'll generate 3 options.]"
- Options form:
  - "Number of days" stepper (1-7)
  - "Meals per day" segmented (3 / 4 / 5)
  - "Time budget" segmented (Fast / Balanced / Slow cooking OK)
- Primary action: "[Primary Action: Generate 3 plans]"

RESULTS STATE (after generation):
- 3 plan option cards stacked vertically. Each card shows (Max — single-line summary so users can choose without reading every macro):
  - Plan title (e.g. "Plan A")
  - PROMINENT single-line summary (e.g. "Higher protein, lighter dinners")
  - Macro fit indicator (small bar chart placeholder)
  - "[Button: View this plan]"
- Bottom: "[Secondary Action: Regenerate]"

EMPTY STATE (before first generation in a session): hero illustration + the form above.

Generate both states. Then generate 3 variations of the results state:
1. Vertical stack of 3 cards with bold single-line summary as the dominant visual element
2. Swipeable horizontal cards (one at a time, dot indicators) with the summary line as a banner
3. Three side-by-side comparison cards where the summary lines align in a "pick by feel" row
```

### 3.18 Grocery List — UPDATED per Max

```
Wireframe: GROCERY LIST

Pushed screen. Tab bar visible.

GROUPED BY CATEGORY (Max — produce, protein, pantry, etc. Clean and minimal, NOT a spreadsheet).

ABOVE THE FOLD:
- Back arrow, title "[Screen Title: Grocery list]", share icon top-right
- Add item input bar pinned below title: "[Field: Add item]" with "+" button
- Section: "Produce" — vertical list of items, each row has checkbox left, item name, quantity, source tag (e.g. "from Recipe X")
- Section: "Protein" — similar list

BELOW THE FOLD:
- Sections: Dairy, Pantry, Other
- Bottom bar: "[Secondary Action: Clear bought items]"

Checked items show with strikethrough. Categories use minimal section headers — small caps, muted color, no boxes around groups (spreadsheet feel to avoid).

EMPTY STATE:
- "[Empty: Your list is empty. Generate a meal plan or add items below.]"
- Two CTAs: [Generate plan] [Add manually]

Generate 3 variations (all grouped by category):
1. Standard category sections with minimal section dividers (as described)
2. Collapsible category groups (tap to expand/collapse)
3. Category color-coded dot prefix on each item; flat-looking but visually grouped
```

### 3.19 Coach Chat (Coach tab root) — UPDATED per Max

```
Wireframe: COACH CHAT (Coach tab root)

Tab bar visible at bottom (Coach tab selected).

Input placeholder copy (CRITICAL per Max): "Ask me anything about today…" — should feel like asking an expert, not texting a bot.

ABOVE THE FOLD:
- Top bar: title "[Screen Title: Coach]", "New" button top-right
- Chat scrollable area:
  - Coach message bubble (aligned left): one paragraph of placeholder text
  - User message bubble (aligned right): shorter placeholder
  - Coach message with INLINE LEARN CARD: bubble containing text + embedded card (rounded rectangle with article title and "[Link: Read full article]")
  - Coach message with QUICK-REPLY CHIPS below it: 3 chips like [Yes log it] [Tell me more] [Not now]
- Input bar pinned above tab bar: text field with placeholder "[Field placeholder: Ask me anything about today…]", mic icon left, send button right

EMPTY STATE (first-time, no conversation):
- Welcome message from coach: "[Empty: Hi Robert. I'm here when you need a second opinion, not when I think you should ping you. What's on your mind?]"
- 3 starter chips: [Plan my dinner] [I'm eating out] [Check my macros]

Generate 3 variations:
1. Standard chat layout (as described)
2. Coach avatar visible on every coach message
3. Card-style messages (each turn in a card rather than a bubble)
```

### 3.20 Learn home (Learn tab root) — UPDATED per Max

Tone (Max): articles are 3-minute reads max, end with one actionable takeaway, smart-friend voice (never academic). "Why does this matter to me?" must be answered in the first sentence.

```
Wireframe: LEARN HOME (Learn tab root)

Tab bar visible at bottom (Learn tab selected).

ABOVE THE FOLD:
- Top bar: title "[Screen Title: Learn]", search icon top-right
- Search bar pinned at top: "[Field: Search articles]"
- "Categories" section: horizontal scroll of category tiles (2x2 visible at once, more on scroll), each tile has icon + label (e.g. Nutrition basics, Macros explained, Eating out, Recovery)
- "Continue reading" section: 1-2 cards showing recently-opened articles with progress indicator

BELOW THE FOLD:
- "Featured" section: vertical list of article cards (image left, title + summary right)
- "Saved" section if any

Generate 3 variations:
1. Categories carousel + featured list (as described)
2. Category grid (2 columns) dominant, articles below
3. Search-first — search bar dominant, categories as compact chips below
```

### 3.21 Article Detail — UPDATED per Max

```
Wireframe: ARTICLE DETAIL

Pushed screen. Tab bar visible. Articles target ~3 min read max. Every article ends with a labeled "One thing to try today" actionable takeaway card.

ABOVE THE FOLD:
- Back arrow, share top-right, save (bookmark) top-right
- Article hero image placeholder (16:9, full-width)
- Article title (large)
- Meta row: reading time (e.g. "2 min read") · category tag

BELOW THE FOLD:
- Article body — paragraphs of placeholder text with one inline image placeholder mid-article
- "ONE THING TO TRY TODAY" callout card (full-width, brand-accented, contains a single actionable suggestion)
- "Related articles" section at bottom — 2-3 cards

Generate 3 variations:
1. Hero image + title + body + takeaway card (as described)
2. Title-first (no hero image, just typography) with takeaway card sticky at bottom
3. Reading-mode focused — narrow column, generous whitespace, takeaway card centered as a moment
```

### 3.22 Progress overview (Progress tab root) — UPDATED per Max

```
Wireframe: PROGRESS (Progress tab root)

Tab bar visible at bottom (Progress tab selected).

DEFAULT VIEW: WEEKLY (Max — daily fluctuations are noisy and discouraging; weekly trends tell the real story).

ABOVE THE FOLD:
- Top bar: title "[Screen Title: Progress]"
- Time range selector: segmented [Weekly (selected)] [Monthly] [90-day] [All] — WEEKLY is the default visual state
- Weight card: line chart placeholder showing weekly averages + summary stat ("[Stat: -1.2 lb week over week]") + small "[Button: Add weight]"
- Macro adherence card: weekly bar chart placeholder + summary ("[Stat: 85% on target this week]")

BELOW THE FOLD:
- Body photos section: horizontal scroll of photo thumbnails + "[Button: Add photo]" — skippable, low-friction
- Measurements section: list of measurement types with weekly trend arrows + "[Button: Add measurement]" — skippable, low-friction
- Mood & energy section: weekly average dots + small heatmap of the week + "[Button: Log mood]" — one-tap

EMPTY STATE (no progress data yet):
- "[Empty: We'll start seeing trends after a week of logging. Your first weigh-in or photo makes it real.]"
- Three CTAs: [Add weight] [Add photo] [Log mood]

Generate 3 variations:
1. Weekly card-stack vertical scroll (as described)
2. Tabbed top-level — [Weight] [Photos] [Measurements] [Mood] tabs under the title, each tab defaulting to weekly view
3. Single weekly dashboard with all sections compressed and visible above fold
```

### 3.23 Your Plan / Profile (Home child) — UPDATED per Max

```
Wireframe: YOUR PLAN / PROFILE

Pushed screen. Tab bar visible.

Recalculate behavior (Max): tapping Recalculate triggers a CONFIRM MODAL first — intentional, slightly weighty feel to prevent accidental triggers.

ABOVE THE FOLD:
- Back arrow, title "[Screen Title: Your plan]", settings gear top-right
- Profile header: avatar circle, name, goal pill (e.g. "Lose weight")
- Current targets card: 2x2 grid (cal / p / c / f) with each value tappable to edit
- Action row: "[Primary Action: Recalculate my plan]" — button styled with slight weight/depth so it doesn't feel trivial
- "Why this plan" expander

BELOW THE FOLD:
- Expanded reasoning text
- Edit links: [Edit goal] [Edit body baseline] [Edit dietary constraints] [Edit lifestyle]

ALSO DRAW: the Recalculate confirm modal.
- Modal title: "[Modal title: Recalculate your plan?]"
- Body: "[Body: We'll update your daily targets based on your latest weight, lifestyle, and recent trends. Your current plan stays in history.]"
- Two buttons: "[Primary: Recalculate]" / "[Secondary: Cancel]"

Generate 3 variations of the screen:
1. Profile header + targets + weighty action (as described)
2. Targets as the hero, profile minimized to a single row
3. Settings-style list — all editable fields as a vertical list

Also generate the confirm modal (one variation is fine).
```

### 3.24 Settings (Home child)

```
Wireframe: SETTINGS

Pushed screen. Tab bar visible.

ABOVE THE FOLD:
- Back arrow, title "[Screen Title: Settings]"
- Grouped list (iOS settings style):
  - GROUP "Account": email row, sign-in method row
  - GROUP "Permissions": Apple Health row (status pill), Notifications row (status pill)
  - GROUP "Notification preferences": quiet hours row (10pm-7am, locked), trigger toggles list

BELOW THE FOLD:
- GROUP "Data": Export data row, Delete account row
- GROUP "About": Version, Terms, Privacy
- Sign out button (destructive style)

Generate 3 variations:
1. iOS-standard grouped list (as described)
2. Card-based settings (each group in a rounded card)
3. Search-prominent — search bar at top + flat list of all settings
```

### 3.25 Daily Recap / Coach Summary *(NEW per Max)*

```
Wireframe: DAILY RECAP / COACH SUMMARY (Home child — accessible from Dashboard and from 8pm push)

Pushed screen (or modal presentation when triggered from push). Tab bar visible if pushed.

ABOVE THE FOLD:
- Back arrow / close X top-left, share top-right
- Title: "[Screen Title: Today's recap]" with date subline
- Hero verdict card (coach voice, first-person, brand-accented):
  - One opening line: "[Verdict: Here's what I noticed today]"
  - One paragraph summary (~3-4 sentences) in coach voice
- "Highlights" section header

BELOW THE FOLD:
- Highlight rows, one per signal (each row: small icon + label + 1-line observation + trend indicator):
  - Macro adherence
  - Sleep
  - Mood / energy
  - Training
  - Weight trend
- "Tomorrow" card (full-width, brand-accented):
  - "[Suggestion: Try a higher-protein breakfast — you ran 18g short today.]"
- Bottom action row: "[Primary Action: Reply to coach]" → opens Coach Chat with recap context preloaded

EMPTY STATE (first day of usage, not enough data):
- "[Empty: Tomorrow's the start of your recap. The more you log, the smarter this gets.]"

Generate 3 variations:
1. Stacked vertical scroll: hero verdict + highlights + tomorrow card (as described)
2. Card-pager: each highlight is a swipeable full-width card; tomorrow card at the end
3. Compact dashboard: hero verdict on top, highlights in a 2-column grid, tomorrow card at bottom
```

### 3.26 Sheets — Photo Capture / Measurements Entry / Mood Entry

```
Wireframe: PROGRESS ENTRY SHEETS (3 sheets, one image showing all three side by side as separate frames)

All three are bottom sheets, ~60% screen height.

SHEET 1 — PHOTO CAPTURE:
- Grabber, Cancel left, Save right (disabled until photo)
- Title "[Screen Title: Add photo]"
- Camera viewfinder placeholder (centered, square) with shutter button below
- "[Text Link: Choose from library]"

SHEET 2 — MEASUREMENTS ENTRY:
- Grabber, Cancel left, Save right
- Title "[Screen Title: Add measurements]"
- Form fields: Waist / Hips / Chest / Arms / Thighs — each is a numeric input with unit toggle (in/cm)
- Date picker row (default: today)

SHEET 3 — MOOD ENTRY:
- Grabber, Cancel left, Save right
- Title "[Screen Title: How are you feeling?]"
- "Mood" row: 1-5 selectable circles labeled with emoji placeholders (no actual emoji — just labeled circles)
- "Energy" row: same 1-5 circles
- Optional free-text note field
- Date picker (default: today)

Generate ONE image showing all three sheets as three vertical panels side-by-side. No variations needed — these are utility sheets.
```

---

## 4. Acceptance checklist

Track wireframe progress here. Each row gets ticked when Max signs off.

| # | Screen | Generated | Max approved | Saved to /wireframes/ |
|---|---|---|---|---|
| 1 | Onboarding — Welcome | ☐ | ☐ | ☐ |
| 2 | Onboarding — Sign in / Sign up | ☐ | ☐ | ☐ |
| 3 | Onboarding — Goal selection | ☐ | ☐ | ☐ |
| 4 | Onboarding — Body baseline | ☐ | ☐ | ☐ |
| 5 | Onboarding — Dietary constraints | ☐ | ☐ | ☐ |
| 6 | Onboarding — **Lifestyle (NEW)** | ☐ | ☐ | ☐ |
| 7 | Onboarding — HealthKit permission | ☐ | ☐ | ☐ |
| 8 | Onboarding — Notification permission | ☐ | ☐ | ☐ |
| 9 | Onboarding — Your Plan reveal | ☐ | ☐ | ☐ |
| 10 | Dashboard *(major revision per Max)* | ☐ | ☐ | ☐ |
| 11 | Meal Log day view | ☐ | ☐ | ☐ |
| 12 | Add Meal sheet *(Photo default)* | ☐ | ☐ | ☐ |
| 13 | Food Detail sheet | ☐ | ☐ | ☐ |
| 14 | Restaurant Guidance *(Dashboard-entry + browse states)* | ☐ | ☐ | ☐ |
| 15 | Restaurant Detail | ☐ | ☐ | ☐ |
| 16 | Recipe Browser *(remaining-macros lead)* | ☐ | ☐ | ☐ |
| 17 | Recipe Detail | ☐ | ☐ | ☐ |
| 18 | Meal Plan Generator *(single-line summaries)* | ☐ | ☐ | ☐ |
| 19 | Grocery List *(grouped by category)* | ☐ | ☐ | ☐ |
| 20 | Coach Chat | ☐ | ☐ | ☐ |
| 21 | Learn home | ☐ | ☐ | ☐ |
| 22 | Article Detail *(takeaway card)* | ☐ | ☐ | ☐ |
| 23 | Progress overview *(weekly default)* | ☐ | ☐ | ☐ |
| 24 | Your Plan / Profile *(recalc confirm modal)* | ☐ | ☐ | ☐ |
| 25 | Settings | ☐ | ☐ | ☐ |
| 26 | **Daily Recap / Coach Summary (NEW)** | ☐ | ☐ | ☐ |
| 27 | Entry sheets (Photo / Measurements / Mood) | ☐ | ☐ | ☐ |

27 wireframes total — App Map's 14 top-level screens + 9 onboarding sub-screens + 4 sheets/modals. Up from the original 25 due to Lifestyle and Daily Recap additions.

## 5. Review rubric — what to check before approving each wireframe

For every wireframe, before ticking the Approved column:

1. **Verdict-first.** If the screen has a recommendation or action prompt, is it ABOVE the data?
2. **Above-the-fold critical info.** Is the most important thing on this screen actually above the FOLD line?
3. **Every tappable element labeled by function.** No final copy yet — labels like "[Primary Action: …]" should be intact.
4. **iOS conventions respected.** Back arrows where pushed, sheet grabbers where modal, tab bar visible on tab roots, hidden on sheets.
5. **No premature styling.** No colors, no fonts, no photos. If you see those, the wireframe drifted toward mockup — regenerate.
6. **Annotations explain non-obvious behavior.** Anything Max can't decode without context needs a leader-line label.

## 6. After all 25 are approved

- [ ] Save each chosen wireframe as PNG to `docs/ios-guide/wireframes/<screen-slug>.png`
- [ ] Log each variation choice and rationale in `docs/ios-guide/decisions.md`
- [ ] Update `FuelWell-Phase-Plan.md` to mark Step 3 complete
- [ ] Move to Step 4 — Mockups (apply FuelWell brand: emerald/orange/violet palette, Outfit/Inter/DM Sans typography, real food photography)

---

*Output of Phase 0.5 · Step 3 specs. Next: generate the wireframes in Claude Design, then return here.*

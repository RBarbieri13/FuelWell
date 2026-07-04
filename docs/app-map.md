# FuelWell App Map — Screen Inventory

## App Info
- **App Name:** FuelWell
- **Type:** AI-powered nutrition & fitness mobile app (Next.js PWA)
- **Primary Color Palette:** Greens (#22c55e primary), warm orange accent (#f97316), neutral grays
- **Macro Colors:** Protein #3b82f6 (blue), Carbs #f59e0b (amber), Fat #ef4444 (red), Calories #22c55e (green)
- **Design Vibe:** Clean/modern, warm/approachable, premium health companion — not clinical
- **Typography:** Geist (sans), Geist Mono (mono); tabular-nums for data
- **Target User:** Health-conscious adults who want AI-guided nutrition coaching
- **Target Device:** iPhone 15 Pro dimensions (393 x 852) — mobile-first, responsive to desktop

## Design Decisions Already Made
- Green primary (#22c55e) + orange accent (#f97316) — established in design tokens
- Geist font family throughout
- Dark mode support via CSS custom properties
- Bottom nav on mobile (5 tabs: Home, Coach, Log, Progress, Profile)
- Desktop sidebar with 6 nav items (adds Recipes)
- Calorie ring (SVG animated) as hero dashboard element
- Macro bars with color-coded progress
- 10-step onboarding wizard (not separate screens)
- Supabase Auth with email/password + Google OAuth
- Safe-area padding for notched devices
- Focus-visible outlines in primary-500

## Bottom Navigation Tabs (Mobile)
1. Home / Dashboard
2. AI Coach
3. Log Meal (highlighted — primary-600, larger icon)
4. Progress
5. Profile

## Sidebar Navigation (Desktop)
1. Dashboard
2. Coach
3. Log Meal
4. Recipes
5. Progress
6. Profile

---

## Screen Inventory

### SCREEN-01: Marketing Landing Page
- **Tab:** None (public, pre-auth)
- **Route:** `/`
- **Status:** BUILT
- **Purpose:** Convert visitors — showcase FuelWell value proposition
- **Components:**
  - Sticky nav header with Logo, Login, Sign Up buttons
  - Hero section with gradient background blobs (primary-100/40, accent-100/30)
  - "AI-powered nutrition coaching" badge
  - Dual CTA: "Start free — no credit card" + "See how it works"
  - Social proof strip (Free to start, No calorie counting, AI-powered)
  - "How it Works" 3-step flow (Set goals, Log meals, Get coached)
  - Features grid (6 cards: AI Meal Coaching, Smart Macro Tracking, Progress Insights, Photo Logging, Recipe Library, Quick Actions)
  - Final CTA section
  - Footer with copyright
- **Notes:** Responsive, gradient blobs for visual interest. Establishes brand before sign-up.

---

### SCREEN-02: Login
- **Tab:** None (auth flow)
- **Route:** `/login`
- **Status:** BUILT
- **Purpose:** Authenticate returning users
- **Components:**
  - Left panel (desktop only): Dark green (#primary-600) branding with logo, tagline "Your nutrition, simplified", 3 feature callouts (Utensils, BarChart3, Brain icons)
  - Right panel: Login form on neutral-50 background
  - Google OAuth button
  - "or email" divider
  - Email + password inputs
  - "Forgot password?" link
  - Sign in button with loading state
  - "Sign up" link for new users
- **Notes:** Split layout on desktop, single column on mobile. Error state handling built in.

---

### SCREEN-03: Sign Up
- **Tab:** None (auth flow)
- **Route:** `/signup`
- **Status:** BUILT
- **Purpose:** Register new users
- **Components:**
  - Left panel (desktop): Dark (#neutral-900) with gradient blobs, "Start your nutrition journey", 3 benefit checkmarks
  - Right panel: Registration form
  - Google OAuth button
  - Email + password inputs
  - Real-time password strength indicator (4-level bars: Weak/Fair/Good/Strong)
  - Dynamic color feedback (red -> amber -> green)
  - Create account button
  - Login link
- **Notes:** Password strength calculator with visual feedback. min 8 chars.

---

### SCREEN-04: Forgot Password
- **Tab:** None (auth flow)
- **Route:** `/forgot-password`
- **Status:** BUILT
- **Purpose:** Password reset request
- **Components:**
  - Email input
  - "Send reset link" button
  - Back to login link
- **Notes:** Simple single-purpose screen.

---

### SCREEN-05: Onboarding — Welcome (Step 0)
- **Tab:** None (post-auth, pre-dashboard)
- **Route:** `/app/onboarding` (step 0 of 10)
- **Status:** BUILT
- **Purpose:** First screen after signup — welcome and motivate
- **Components:**
  - Animated progress bar with step counter (0/10)
  - Card container (min-h-420px)
  - Welcome message and app introduction
  - "Let's get started" CTA
- **Notes:** Part of a 10-step wizard. Progress bar shows where user is. Should feel premium and motivating.

---

### SCREEN-06: Onboarding — Name (Step 1)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 1)
- **Status:** BUILT
- **Purpose:** Collect user's name for personalization
- **Components:**
  - Progress bar (1/10)
  - Text input for display name
  - Back/Next navigation
- **Notes:** Optional field — user can skip. Enables personalized greeting on dashboard.

---

### SCREEN-07: Onboarding — Date of Birth (Step 2)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 2)
- **Status:** BUILT
- **Purpose:** Collect DOB for BMR calculation
- **Components:**
  - Progress bar (2/10)
  - Date picker input
  - Back/Next navigation
- **Notes:** Required. Used in Mifflin-St Jeor equation for calorie targets.

---

### SCREEN-08: Onboarding — Biological Sex (Step 3)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 3)
- **Status:** BUILT
- **Purpose:** Collect biological sex for BMR accuracy
- **Components:**
  - Progress bar (3/10)
  - 3-button grid: Male, Female, Other
  - Back/Next navigation
- **Notes:** Required. Affects BMR formula coefficients.

---

### SCREEN-09: Onboarding — Measurements (Step 4)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 4)
- **Status:** BUILT
- **Purpose:** Collect height and weight
- **Components:**
  - Progress bar (4/10)
  - Height input (cm, min 50)
  - Weight input (kg, min 20)
  - Back/Next navigation
- **Notes:** Required. Keep it fast — minimize friction. Consider future units toggle (lbs/kg).

---

### SCREEN-10: Onboarding — Activity Level (Step 5)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 5)
- **Status:** BUILT
- **Purpose:** Assess daily activity for TDEE multiplier
- **Components:**
  - Progress bar (5/10)
  - 5-option button list: Sedentary, Lightly Active, Moderately Active, Active, Very Active
  - Back/Next navigation
- **Notes:** Required. Maps to TDEE multipliers (1.2 to 1.9).

---

### SCREEN-11: Onboarding — Goal Selection (Step 6)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 6)
- **Status:** BUILT
- **Purpose:** User selects primary fitness goal
- **Components:**
  - Progress bar (6/10)
  - 3 goal cards with emoji: Lose Weight, Maintain, Gain Weight
  - Back/Next navigation
- **Notes:** Required. Determines calorie adjustment (-500 for lose, +300 for gain) and macro splits.

---

### SCREEN-12: Onboarding — Dietary Preference (Step 7)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 7)
- **Status:** BUILT
- **Purpose:** Capture diet type for recipe/meal suggestions
- **Components:**
  - Progress bar (7/10)
  - 6-button 2x3 grid of diet types (e.g., Standard, Vegetarian, Vegan, Keto, Paleo, etc.)
  - Back/Next navigation
- **Notes:** Optional. Informs AI Coach and recipe recommendations.

---

### SCREEN-13: Onboarding — Food Allergies (Step 8)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 8)
- **Status:** BUILT
- **Purpose:** Capture allergens for safe recommendations
- **Components:**
  - Progress bar (8/10)
  - 8-option 2x4 grid (multi-select): common allergens
  - Back/Next navigation
- **Notes:** Optional. Multi-select. Critical for AI Coach safety — never suggest foods with flagged allergens.

---

### SCREEN-14: Onboarding — Review & Confirm (Step 9)
- **Tab:** None (onboarding flow)
- **Route:** `/app/onboarding` (step 9)
- **Status:** BUILT
- **Purpose:** Show calculated targets and confirm before starting
- **Components:**
  - Progress bar (9/10)
  - Summary card with all collected info
  - Large calorie target display (primary-50 bg)
  - 3-column macro grid: Protein (blue-50), Carbs (amber-50), Fat (red-50)
  - Goal, Activity, Diet, Allergies summary
  - "Complete Setup" button
  - Back button to edit
- **Notes:** This is the payoff — user sees their personalized plan. Make it feel rewarding. Saves to Supabase profiles table, redirects to dashboard.

---

### SCREEN-15: Home Dashboard
- **Tab:** Home
- **Route:** `/app/dashboard`
- **Status:** BUILT
- **Purpose:** Daily overview and command center — most important screen
- **Components:**
  - Personalized greeting: "Hey, {displayName}"
  - Onboarding banner (if incomplete): "Complete your profile" with link
  - **Calorie Ring** (animated SVG):
    - Circular progress ring
    - Large center number: remaining calories
    - "X remaining" or "X over" label
    - Bottom badge: "X / Y kcal"
    - Green (#16a34a) under target, red (#ef4444) over target
    - Smooth animation (800ms ease-out cubic)
  - **Macro Bars** (3 animated rows):
    - Protein (blue #3b82f6)
    - Carbs (amber #f59e0b)
    - Fat (red #ef4444)
    - Each: colored dot + label + "X / Y g" + progress bar
  - **Quick Actions** (2x2 grid):
    - Log Meal (primary-50 bg) -> /app/log
    - Snap Photo (accent-50 bg) -> /app/log?mode=photo
    - Ask Coach (violet-50 bg) -> /app/coach
    - Scan Barcode (sky-50 bg) -> /app/log?mode=scan
  - **AI Coach Insight Card** (gradient bg):
    - Sparkles icon in primary-600 badge
    - Dynamic coaching message based on progress
    - "Chat with coach" link
- **Menu Options:** Notifications bell, settings gear (future)
- **Notes:** This is the "command center." Server-side data fetching. Intelligent coach messages adapt to user's daily progress.

---

### SCREEN-16: Meal Log
- **Tab:** Log (highlighted in nav)
- **Route:** `/app/log`
- **Status:** BUILT
- **Purpose:** Log meals and view daily food intake — speed is king here
- **Components:**
  - Page heading: "Log Meal"
  - **Mode tabs** (3 toggle buttons): Search, Photo, Scan
  - **Search Mode** (default):
    - Search input with magnifying glass icon
    - "Recent Foods" section
    - Card list: food name, serving size, calories, protein
    - Plus icon to quick-add
  - **Photo Mode:**
    - Camera icon card (accent-50 bg)
    - "Snap your meal" heading
    - "Open Camera" button
  - **Scan Mode:**
    - Barcode icon card (sky-50 bg)
    - "Scan a barcode" heading
    - "Open Scanner" button
  - **Meal Type Selector** (pill buttons):
    - Breakfast, Lunch, Dinner, Snack
    - First active by default
- **Menu Options:** Barcode scanner, voice log (future), photo log
- **Notes:** Needs to be FAST — minimal taps to log. Mode controlled via search params. Consider voice input for accessibility.

---

### SCREEN-17: Food Search & Add
- **Tab:** Log (sub-screen)
- **Route:** `/app/log` (search mode, expanded)
- **Status:** PARTIALLY BUILT (combined with meal log)
- **Purpose:** Search food database and add to meal
- **Components:**
  - Search bar with recent/favorites tabs (future)
  - Food results list with cal/macro preview
  - Serving size adjuster (future)
  - Add to meal button
  - Barcode scan shortcut
- **Notes:** Currently embedded in the log page's search mode. May need to become its own view for better UX as the food database grows.

---

### SCREEN-18: AI Coach Chat
- **Tab:** AI Coach
- **Route:** `/app/coach`
- **Status:** SCAFFOLD (empty state only)
- **Purpose:** Conversational AI for nutrition/fitness guidance
- **Components (planned):**
  - Chat message bubbles
  - Suggested quick-reply chips
  - Context cards (showing user's current stats inline)
  - Typing indicator
  - Empty state: MessageSquare icon + "Start a conversation" + "Ask a question" button
- **Menu Options (planned):** Clear chat, export conversation, adjust AI persona
- **Notes:** Should feel like texting a knowledgeable friend, not clinical. Needs to know user's profile, current macros, goals, and dietary restrictions.

---

### SCREEN-19: Recipes Library
- **Tab:** Recipes (desktop sidebar only — not in mobile nav)
- **Route:** `/app/recipes`
- **Status:** SCAFFOLD (empty state only)
- **Purpose:** Browse and save recipes matching user goals
- **Components (planned):**
  - Recipe cards with photo, title, macros, prep time
  - Filter by: meal type, dietary preference, prep time, macro goals
  - Search bar
  - "Saved" / "Favorites" tab
  - AI-generated recipe suggestions based on remaining daily macros
  - Empty state: BookOpen icon + "Your recipe collection is empty" + "Browse recipes" button
- **Notes:** Recipes should show macro breakdown prominently. "What can I make with my remaining macros?" is the killer feature.

---

### SCREEN-20: Progress & Analytics
- **Tab:** Progress
- **Route:** `/app/progress`
- **Status:** SCAFFOLD (empty state only)
- **Purpose:** Visualize long-term trends — motivational
- **Components (planned):**
  - Weight chart (line graph over time)
  - Calorie adherence heatmap (calendar view)
  - Macro breakdown trends
  - Streak counter / consistency score
  - Milestone badges
  - Empty state: TrendingUp icon + "Not enough data yet" + "Log a meal to start" (links to /app/log)
- **Notes:** Motivational — should make user feel good about progress. Unlocks after 3 days of data.

---

### SCREEN-21: Profile & Settings
- **Tab:** Profile
- **Route:** `/app/profile`
- **Status:** BUILT
- **Purpose:** User profile, preferences, and app settings
- **Components:**
  - **User Info Card:**
    - Avatar (primary-50 bg with User icon)
    - Display name (inline editable with pencil icon)
    - Email address
    - Edit mode: Input + Check/Cancel buttons
  - **Daily Targets Section** (if onboarding complete):
    - 4-column grid: Calories, Protein, Carbs, Fat
    - Each TargetCard: value + unit with macro color bg
  - **User Info Stats:**
    - Goal (e.g., "Lose weight")
    - Activity level (e.g., "Moderately active")
    - Weight (if set)
    - Height (if set)
  - **Settings:**
    - "Recalculate nutrition targets" link (re-run onboarding)
  - **Sign Out:**
    - Confirmation card (red-50 bg on hover)
    - "Yes, sign out" danger button + Cancel
- **Notes:** Keep clean — don't overcrowd. Inline editing without modals.

---

## Planned Screens (Not Yet Built)

### SCREEN-22: Workout Hub
- **Tab:** Could be added to nav or accessed from dashboard
- **Route:** `/app/workouts` (planned)
- **Status:** NOT BUILT
- **Purpose:** Browse, start, and track workouts
- **Components (planned):**
  - Today's recommended workout card
  - Workout categories (Strength, Cardio, Flexibility, Custom)
  - Recent workout history
  - Create custom workout button
- **Menu Options:** Filter by equipment, duration, difficulty
- **Notes:** Adaptive recommendations based on user's goals and history. Lower priority than nutrition features.

---

### SCREEN-23: Active Workout Session
- **Tab:** Workouts (sub-screen)
- **Route:** `/app/workouts/active` (planned)
- **Status:** NOT BUILT
- **Purpose:** In-progress workout tracking
- **Components (planned):**
  - Exercise name + demo gif/image
  - Sets/reps tracker with checkboxes
  - Rest timer (auto-start between sets)
  - Weight/resistance input
  - Skip / Swap exercise option
  - Progress bar (exercises completed)
- **Notes:** Needs to work well one-handed, large touch targets. User is sweating and distracted.

---

### SCREEN-24: Notification Center
- **Tab:** Overlay / modal from dashboard
- **Route:** `/app/notifications` (planned)
- **Status:** NOT BUILT
- **Purpose:** Centralized notification hub
- **Components (planned):**
  - Meal reminders
  - Goal milestone alerts
  - AI Coach nudges
  - Weekly summary notifications
- **Notes:** Push notifications on mobile, in-app notification center.

---

### SCREEN-25: Meal Plan Generator
- **Tab:** Accessible from AI Coach or Recipes
- **Route:** `/app/meal-plan` (planned)
- **Status:** NOT BUILT
- **Purpose:** AI-generated daily/weekly meal plans
- **Components (planned):**
  - Day/week view toggle
  - Meal slots (Breakfast, Lunch, Dinner, Snacks)
  - Auto-generated meals fitting remaining macros
  - Swap meal option
  - Grocery list generation
- **Notes:** Premium feature candidate. "Plan my week" is a high-value use case.

---

### SCREEN-26: Grocery List
- **Tab:** Accessible from Meal Plan
- **Route:** `/app/grocery-list` (planned)
- **Status:** NOT BUILT
- **Purpose:** Auto-generated shopping list from meal plan
- **Components (planned):**
  - Categorized list (Produce, Dairy, Protein, etc.)
  - Checkboxes for items
  - Shareable list
  - Add custom items
- **Notes:** Natural extension of meal planning. High retention feature.

---

### SCREEN-27: Water Tracking
- **Tab:** Widget on dashboard or dedicated sub-screen
- **Route:** Dashboard widget or `/app/water` (planned)
- **Status:** NOT BUILT
- **Purpose:** Track daily water intake
- **Components (planned):**
  - Water bottle fill animation
  - Quick-add buttons (glass, bottle, custom)
  - Daily goal indicator
- **Notes:** Simple but high-engagement feature. Could live as a dashboard card rather than its own screen.

---

## Screen Flow Connections

### Onboarding Flow
SCREEN-01 (Landing) -> SCREEN-03 (Sign Up) -> SCREEN-05 through SCREEN-14 (Onboarding Wizard) -> SCREEN-15 (Dashboard)

### Returning User Flow
SCREEN-02 (Login) -> SCREEN-15 (Dashboard)

### Main App (Bottom Nav)
SCREEN-15 (Dashboard) <-> SCREEN-18 (Coach) <-> SCREEN-16 (Log) <-> SCREEN-20 (Progress) <-> SCREEN-21 (Profile)

### Nutrition Drill-Down
SCREEN-15 (Dashboard) -> SCREEN-16 (Meal Log) -> SCREEN-17 (Food Search)

### Coach Interaction
SCREEN-15 (Dashboard, Coach Insight Card) -> SCREEN-18 (AI Coach Chat)

### Profile Drill-Down
SCREEN-21 (Profile) -> SCREEN-20 (Progress & Analytics)
SCREEN-21 (Profile) -> SCREEN-05 (Re-run Onboarding)

### Recipe Flow
SCREEN-15 (Dashboard) -> SCREEN-19 (Recipes) -> SCREEN-25 (Meal Plan) -> SCREEN-26 (Grocery List)

### Workout Flow (Planned)
SCREEN-15 (Dashboard) -> SCREEN-22 (Workout Hub) -> SCREEN-23 (Active Workout)

---

## Priority Screens for First Review
1. **SCREEN-15: Home Dashboard** — the command center, anchors the entire visual language
2. **SCREEN-16: Meal Log** — the daily driver, speed is everything
3. **SCREEN-05 through SCREEN-14: Onboarding** — first impression, sets the tone
4. **SCREEN-18: AI Coach Chat** — core differentiator
5. **SCREEN-01: Marketing Landing** — conversion page

## Build Status Summary
| Status | Count | Screens |
|--------|-------|---------|
| BUILT | 15 | Landing, Login, Signup, Forgot Password, Onboarding (10 steps), Dashboard, Meal Log, Profile |
| SCAFFOLD | 3 | AI Coach, Recipes, Progress |
| PLANNED | 6 | Food Search (expanded), Workouts, Active Workout, Notifications, Meal Plan, Grocery List, Water |

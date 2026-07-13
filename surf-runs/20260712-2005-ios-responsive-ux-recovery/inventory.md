# FuelWell iOS Responsive UX Inventory

## Who uses this product, and for what?

FuelWell is used by people who want a real-time nutrition and fitness decision system on a phone: onboarding, logging food and activity, planning workouts and recipes, buying groceries, asking Coach for personalized guidance, and reviewing a complete day. The same web application is embedded in the shipping iOS container, so mobile web defects are TestFlight defects.

## Primary surfaces in scope

- Dashboard, Daily Review, Log Meal, Coach, Workouts, Fitness, Recipes, Groceries, Recovery, Progress, Profile, Settings, onboarding, workout detail, and live workout.
- Shared app shell, phone navigation, cards, tables, filters, charts, drawers, edit forms, and rich Coach artifacts.
- Viewports: 320, 375, 390, and 430 CSS pixels.

## Verified baseline findings

- Daily Review has overlapping outer-section and inner-chart expand controls. Collapsing the chart can leave the Latest 7 navigation visible without the chart.
- Workouts places Browse Workout Library above a library that remains far below the fold and uses a wide desktop table/filter treatment on phones.
- Grocery List forces a 980px table into a 375px primary pane. Baseline primary scroll width is 1,030px.
- Several components use desktop minimum widths or multi-column tracks that need a contained mobile representation.
- Whole-page width is not enough as a check: a nested primary pane can scroll horizontally while the document itself remains bounded.

## Existing foundations to preserve

- FuelWell design tokens, typography, light mint surfaces, dark decision cards, and compact mobile bottom navigation.
- Existing data repositories, preview data, Supabase persistence, Coach actions, workout data, and route contracts.
- Horizontal scrolling remains appropriate only inside explicitly marked rich tables, code/formulas, charts, or discoverable data tables.

## Evidence

- `evidence/before/daily-review-375.png`
- `evidence/before/workouts-375.png`
- `evidence/before/groceries-375.png`


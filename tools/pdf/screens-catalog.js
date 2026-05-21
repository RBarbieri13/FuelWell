/**
 * Mockup catalog — single source of truth for both build-combined.js and build-compressed.js.
 * Edit this when adding/removing/relabeling mockups.
 *
 * Fields:
 *   section: PDF section header (groups mockups in the deck)
 *   slug:    filename basename (matches html/*.html and *.png in docs/ios-guide/mockups/)
 *   title:   human-readable page title
 *   tag:     optional badge — NEW · REDESIGN · UPDATED · REFERENCE · LEGACY
 */
const SCREENS = [
  { section: 'Onboarding', slug: '01-onboarding-welcome', title: 'Welcome', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '02-sign-in-sign-up', title: 'Sign in / Sign up', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '03-goal-selection', title: 'Goal selection', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '04-body-baseline', title: 'Body baseline', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '05-dietary-constraints', title: 'Dietary constraints', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '06-lifestyle', title: 'Lifestyle', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '07-healthkit-permission', title: 'HealthKit permission', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '08-notification-permission', title: 'Notification permission', tag: 'UPDATED' },
  { section: 'Onboarding', slug: '09-plan-reveal', title: 'Plan reveal' },

  { section: 'Home (Dashboard)', slug: '10-dashboard', title: 'Dashboard — V1 reference', tag: 'REFERENCE' },
  { section: 'Home (Dashboard)', slug: '28-dashboard-v2', title: 'Dashboard — Day 1 welcome (default)', tag: 'NEW' },
  { section: 'Home (Dashboard)', slug: '28-dashboard-v2-populated', title: 'Dashboard — populated (canonical)', tag: 'NEW' },
  { section: 'Home (Dashboard)', slug: '29-inflows-outflows-widget', title: 'Inflows / Outflows widget — V1 dual ring', tag: 'UPDATED' },
  { section: 'Home (Dashboard)', slug: '30-inflows-outflows-fullscreen', title: 'Inflows / Outflows full-screen — V3 hybrid', tag: 'UPDATED' },
  { section: 'Home (Dashboard)', slug: '31-activity-overview-widget', title: 'Activity overview widget', tag: 'REDESIGN' },

  { section: 'Meals & Nutrition', slug: '33-meals-nutrition-tab', title: 'Meals & Nutrition tab', tag: 'REDESIGN' },
  { section: 'Meals & Nutrition', slug: '11-meal-log-day-view', title: 'Meal log — day view' },
  { section: 'Meals & Nutrition', slug: '12-add-meal-sheet', title: 'Add meal sheet' },
  { section: 'Meals & Nutrition', slug: '13-food-detail-portion-editor', title: 'Food detail / portion editor' },
  { section: 'Meals & Nutrition', slug: '14-restaurant-guidance', title: 'Restaurant guidance' },
  { section: 'Meals & Nutrition', slug: '15-restaurant-detail', title: 'Restaurant detail' },
  { section: 'Meals & Nutrition', slug: '16-recipe-browser', title: 'Recipe browser' },
  { section: 'Meals & Nutrition', slug: '17-recipe-detail', title: 'Recipe detail' },
  { section: 'Meals & Nutrition', slug: '18-meal-plan-generator', title: 'Meal plan generator (+ pantry filter)', tag: 'UPDATED' },
  { section: 'Meals & Nutrition', slug: '19-grocery-list', title: 'Grocery list' },

  { section: 'Coach', slug: '20-coach-chat', title: 'Coach Chat', tag: 'UPDATED' },
  { section: 'Coach', slug: '22-article-detail', title: 'Article detail' },
  { section: 'Coach', slug: '21-learn-home', title: 'Learn home — LEGACY', tag: 'LEGACY' },

  { section: 'Exercise & Activity', slug: '32-exercise-activity-tab', title: 'Exercise & Activity tab' },
  { section: 'Exercise & Activity', slug: '25-workout-detail', title: 'Workout detail' },

  { section: 'Progress', slug: '34-progress-tab-v2', title: 'Progress tab', tag: 'UPDATED' },
  { section: 'Progress', slug: '23-progress-overview', title: 'Progress overview — V1 reference', tag: 'REFERENCE' },
  { section: 'Progress', slug: '26-health-score-detail', title: 'Health Score detail', tag: 'REDESIGN' },
  { section: 'Progress', slug: '27-habit-tracking-detail', title: 'Habit tracking detail — V2 locked', tag: 'UPDATED' },

  { section: 'Cross-tab / Components', slug: '24-your-plan-profile', title: 'Your plan / profile', tag: 'UPDATED' },
  { section: 'Cross-tab / Components', slug: '35-menu-hierarchical', title: 'Menu — hierarchical collapsed', tag: 'UPDATED' },
  { section: 'Cross-tab / Components', slug: '36-help-screen', title: 'Help', tag: 'UPDATED' },
  { section: 'Cross-tab / Components', slug: '37-tab-bar-component', title: 'Tab bar — V2 raised FAB', tag: 'UPDATED' },
];

module.exports = { SCREENS };

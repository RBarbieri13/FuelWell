# W6 Feature Completeness Parity Matrix

Updated: 2026-05-31

This matrix maps the locked iOS mockup files to their owning implementation surface. It is the W6 cut-line authority: a row is either implemented, in progress in W6, or explicitly deferred with a reason.

| Mockup | Owner | Status | Notes |
|---|---|---|---|
| 01-onboarding-welcome | Onboarding | Implemented | W4 foundation. |
| 02-sign-in-sign-up | Onboarding | Implemented | W4 foundation. |
| 03-goal-selection | Onboarding | Implemented | W4 foundation. |
| 04-body-baseline | Onboarding | Implemented | W4 foundation. |
| 05-dietary-constraints | Onboarding | Implemented | W4 foundation. |
| 06-lifestyle | Onboarding | Implemented | W4 foundation. |
| 07-healthkit-permission | Onboarding | Implemented | W4 foundation. |
| 08-notification-permission | Onboarding | Implemented | W4 foundation. |
| 09-plan-reveal | Onboarding | Implemented | W4 foundation. |
| 10-dashboard | Dashboard | Implemented | W6 replaces dead Today rows with tab actions and Dashboard detail routes backed by Health Score v1. |
| 11-meal-log-day-view | Nutrition | Implemented | Real reducer-backed daily log. |
| 12-add-meal-sheet | Nutrition | Implemented | Add meal flow persists locally. |
| 13-food-detail-portion-editor | Nutrition | Implemented | Food search suggestions open a portion detail card before quick-use macro fill. |
| 14-restaurant-guidance | Nutrition/Plans | Implemented | Deterministic guide surface exists. |
| 15-restaurant-detail | Nutrition/Plans | Implemented | Restaurant priority/menu rows open detail guidance before photo-first logging. |
| 16-recipe-browser | Nutrition/Plans | Implemented | Deterministic browser surface exists. |
| 17-recipe-detail | Nutrition/Plans | Implemented | Recipe suggestions open a detail card before Use Recipe fills the draft. |
| 18-meal-plan-generator | Nutrition/Plans | Implemented | Deterministic generator surface exists. |
| 19-grocery-list | Nutrition/Plans | Implemented | Deterministic grocery surface exists. |
| 20-coach-chat | Coach | Implemented | W5 streaming coach PR #81. |
| 21-learn-home | Menu/Help | Deferred | MVP ships Help/menu articles before Learn tab. Needs dated product sign-off before final W6 close. |
| 22-article-detail | Menu/Help | Deferred | Same Learn deferral as row 21. |
| 23-progress-overview | Progress | Implemented | Reducer-backed Progress package owns the overview, score topics, tracking topics, and visible destinations. |
| 24-your-plan-profile | Profile/Menu | Implemented | W4 account/profile foundation and menu account route. |
| 25-workout-detail | Activity | Implemented | Workout Log and Plans now have real destination pages; detailed set/rep editor remains a post-W6 depth follow-up. |
| 26-health-score-detail | Progress/Dashboard | Implemented | W6 adds Nutrition/Activity/Recovery score detail destinations and Dashboard Health Score drill-in. |
| 27-habit-tracking-detail | Progress | Implemented | Habits opens a real Progress detail page with primary and next-decision sections. |
| 28-dashboard-v2 | Dashboard | Implemented | W6 tab shortcuts and Dashboard drill-ins are active; live score model remains backend/live-data follow-up. |
| 28-dashboard-v2-populated | Dashboard | Implemented | Same as row 28. |
| 29-inflows-outflows-widget | Dashboard | Implemented | Widget exists, links to detail, and uses the Health Score v1 energy-out model. |
| 30-inflows-outflows-fullscreen | Dashboard | Implemented | W6 adds fullscreen Inflows/Outflows detail route. |
| 31-activity-overview-widget | Activity | Implemented | Activity Tracker opens a real detail page and the Activity package reads HealthKit snapshot state. |
| 32-exercise-activity-tab | Activity | Implemented | Reducer-backed Activity package owns the tab headline, weekly rows, and Workout Log/Activity Tracker/Workout Plans destinations. |
| 33-meals-nutrition-tab | Nutrition | Implemented | Reducer-backed tab. |
| 34-progress-tab-v2 | Progress | Implemented | Reducer-backed Progress package owns all visible tracking/detail destinations. |
| 35-menu-hierarchical | Menu | In progress | Menu account route exists; passive settings rows have no misleading chevrons. |
| 36-help-screen | Help | Implemented | Help sheet and feedback route exist. |
| 37-tab-bar-component | App Shell | Implemented | Primary tabs are reachable in UI tests. |

## W6 Rule

Visible chevrons now mean navigation or tab switching. Passive rows use information-only cards without chevrons.

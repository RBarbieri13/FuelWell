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
| 10-dashboard | Dashboard | In progress | W6 replaces dead Today rows with tab actions. Live Health Score formula remains W6 follow-up. |
| 11-meal-log-day-view | Nutrition | Implemented | Real reducer-backed daily log. |
| 12-add-meal-sheet | Nutrition | Implemented | Add meal flow persists locally. |
| 13-food-detail-portion-editor | Nutrition | In progress | Deterministic surface exists; full portion editor remains W6 Plans/Nutrition hardening. |
| 14-restaurant-guidance | Nutrition/Plans | Implemented | Deterministic guide surface exists. |
| 15-restaurant-detail | Nutrition/Plans | In progress | Needs deeper real-detail content. |
| 16-recipe-browser | Nutrition/Plans | Implemented | Deterministic browser surface exists. |
| 17-recipe-detail | Nutrition/Plans | In progress | Needs deeper real-detail content. |
| 18-meal-plan-generator | Nutrition/Plans | Implemented | Deterministic generator surface exists. |
| 19-grocery-list | Nutrition/Plans | Implemented | Deterministic grocery surface exists. |
| 20-coach-chat | Coach | Implemented | W5 streaming coach PR #81. |
| 21-learn-home | Menu/Help | Deferred | MVP ships Help/menu articles before Learn tab. Needs dated product sign-off before final W6 close. |
| 22-article-detail | Menu/Help | Deferred | Same Learn deferral as row 21. |
| 23-progress-overview | Progress | In progress | W6 adds real destinations for all visible Progress rows. |
| 24-your-plan-profile | Profile/Menu | Implemented | W4 account/profile foundation and menu account route. |
| 25-workout-detail | Activity | In progress | W6 adds Workout Log/Plans destinations; detailed workout editor remains follow-up. |
| 26-health-score-detail | Progress/Dashboard | In progress | W6 adds Nutrition/Activity/Recovery score detail destinations. |
| 27-habit-tracking-detail | Progress | In progress | W6 adds Habits detail destination. |
| 28-dashboard-v2 | Dashboard | In progress | W6 tab shortcuts active; live score model remains follow-up. |
| 28-dashboard-v2-populated | Dashboard | In progress | Same as row 28. |
| 29-inflows-outflows-widget | Dashboard | In progress | Preview-driven widget exists; live HealthKit outflow model remains follow-up. |
| 30-inflows-outflows-fullscreen | Dashboard | In progress | Needs fullscreen detail route. |
| 31-activity-overview-widget | Activity | In progress | W6 adds Activity Tracker destination. |
| 32-exercise-activity-tab | Activity | In progress | W6 adds real tool destinations for Workout Log, Activity Tracker, Workout Plans. |
| 33-meals-nutrition-tab | Nutrition | Implemented | Reducer-backed tab. |
| 34-progress-tab-v2 | Progress | In progress | W6 adds all visible tracking/detail destinations. |
| 35-menu-hierarchical | Menu | In progress | Menu account route exists; passive settings rows have no misleading chevrons. |
| 36-help-screen | Help | Implemented | Help sheet and feedback route exist. |
| 37-tab-bar-component | App Shell | Implemented | Primary tabs are reachable in UI tests. |

## W6 Rule

Visible chevrons now mean navigation or tab switching. Passive rows use information-only cards without chevrons.

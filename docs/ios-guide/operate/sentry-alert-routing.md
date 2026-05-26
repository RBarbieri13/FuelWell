# Sentry Alert Routing

FuelWell uses Sentry as the first line of defense for pilot crashes and release regressions. Configure these alerts before the first TestFlight cohort.

## Required Project

- Organization: set by `SENTRY_ORG`
- Project: set by `SENTRY_PROJECT`
- Release naming: Fastlane `release` lane tags Sentry releases when `SENTRY_AUTH_TOKEN` is present

## Alert Rules

| Rule | Condition | Action |
| --- | --- | --- |
| P0 launch crash | New issue affects `FuelWellApp` launch path and more than 2 users in 30 minutes | Notify Robert and Max immediately |
| Crash-free sessions below target | Crash-free sessions under 99.5% over 24 hours | Open P1 incident |
| Regression in latest release | New issue introduced in latest release with 5 or more events | Open P1/P2 triage |
| AI safety surface crash | Any crash involving coach, meal plan, restaurant guidance, or nudges | Check kill-switch path first |
| Feedback submission crash | Any crash in Help or Send Feedback | Hotfix unless isolated to one user/environment |

## Ownership

Robert owns response and release decisions. Max owns product/user-message decisions when an incident changes pilot-facing copy, coaching behavior, or prioritization.

## Daily Pilot Check

During TestFlight, check:

- New issues in latest release
- Crash-free sessions
- Top events by affected users
- Breadcrumbs around Dashboard, Meals, Coach, Exercise, Progress, Help

## Escalation

Escalate immediately when an issue includes data exposure, unsafe health guidance, payment/account access, or launch failure. Do not wait for weekly triage.

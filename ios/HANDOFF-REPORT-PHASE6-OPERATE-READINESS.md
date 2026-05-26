# FuelWell - Phase 6 Operate Readiness Handoff

Date: 2026-05-26
Branch: `feature/phase-6-operate-readiness`

## Summary

This PR begins Phase 6 as one larger operations bundle. It gives Robert and Max a working pilot-operations surface instead of more micro-slices: incident response, alert routing, feedback triage, decision-engagement analytics, kill-switch cadence, and production database access rules.

## What Changed

- Expanded the analytics taxonomy with decision-engine engagement events:
  - `coach_recommendation_presented`
  - `coach_recommendation_followed`
  - `coach_recommendation_dismissed`
  - `nudge_delivered`
  - `nudge_opened`
- Added tests that lock those event names and required dashboard dimensions.
- Added `tools/operate/triage-feedback.js` to summarize Supabase feedback into pilot triage buckets.
- Added `tools/operate/check-operate-readiness.sh` to verify Phase 6 operating files, script syntax, dashboard JSON, and local env readiness without printing secrets.
- Added Phase 6 runbooks under `docs/ios-guide/operate/`:
  - incident response
  - Sentry alert routing
  - pilot feedback triage
  - PostHog decision-engine dashboard definition
  - App Review rejection response
  - production database access
  - monthly kill-switch drill
- Wired CI syntax checks for the new operations scripts and dashboard JSON.

## Verification

- `node --check tools/operate/triage-feedback.js`
- `bash -n tools/operate/check-operate-readiness.sh`
- `node -e "JSON.parse(require('fs').readFileSync('docs/ios-guide/operate/posthog-decision-engine-dashboard.json', 'utf8'))"`
- `tools/operate/check-operate-readiness.sh`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -skipMacroValidation -skipPackagePluginValidation -only-testing:AnalyticsTests test`

## Remaining External Setup

- Configure Sentry alert rules in the Sentry dashboard.
- Recreate the PostHog dashboard from the JSON definition when PostHog project access is ready.
- Apply the Phase 2 Supabase migration to staging and add a service-role key before running the full monthly kill-switch drill.

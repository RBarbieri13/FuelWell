# FuelWell App Store Candidate Status

Date: 2026-08-10

## Current state

The repository candidate on `release/fuelwell-appstore-20260809` is locally verified but has not been deployed, uploaded to TestFlight, or submitted to App Review. The public Vercel alias still reports git SHA `722341a08c9e06603f3ba259e895c8c8a2170701`, so it does not yet represent this candidate.

## Verified locally

- Web unit suite: 61 files, 455 tests passed.
- ESLint and TypeScript: passed.
- Next.js production build: passed; 805 static pages generated.
- Phone containment: 38 checks passed in Chromium and mobile WebKit at 320, 375, 390, and 430 pixels.
- Coach rich-content containment: passed at 320 and 430 pixels with contained table/code/formula scrolling and stacked mobile artifacts.
- Native OAuth/routing tests: 7 passed on the iPhone 16e simulator.
- Native release-manifest tests: passed on the iPhone 16e simulator.
- Repository App Store readiness: 34 checks passed, 0 code failures.
- Authenticated state: server-authoritative repository implementation and account-switch guards passed independent review, 455 unit tests, and adversarial PostgreSQL RLS verification.

## Required before TestFlight

1. Apply `supabase/migrations/20260810040034_server_authoritative_user_app_state.sql` to the live Supabase project.
2. Configure and verify Google and Facebook OAuth redirects, native callback handling, Coach provider credentials, and required Vercel environment variables.
3. Configure `FUELWELL_APPLE_TEAM_ID`, deploy one exact immutable Vercel candidate, and verify that `/.well-known/apple-app-site-association` returns the signed-app association document. The current public endpoint returns 404.
4. Run two-account isolation/persistence, live OAuth, live Coach text and attachment, universal-link, and compact/large iPhone candidate tests against that exact deployment.
5. Generate candidate-bound App Store screenshots and provide the private Fastlane/App Store Connect values required by the release lane.
6. Obtain Robert's separate approval before pushing/merging, uploading to TestFlight, or submitting to App Review.

## Required before public App Store release

1. Confirm the processed TestFlight build works for internal testers, including Max, and that the intended build is the only active test build.
2. Complete App Store Connect privacy, compliance, age-rating, pricing, and review metadata checks.
3. Obtain explicit approval to submit the selected build for App Review.
4. Resolve any App Review feedback, then release manually or on the approved schedule.

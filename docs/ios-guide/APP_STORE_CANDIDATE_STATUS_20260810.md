# FuelWell App Store Candidate Status

Date: 2026-08-10

## Current state

The frozen runtime candidate is commit `1a09de1d750afa3da8645f6ad9068be38d452772` on `release/fuelwell-appstore-20260809`. The candidate is 35 commits ahead of `origin/main`; only this status/evidence update remains outside the runtime commit. It has not been deployed, pushed, uploaded to TestFlight, or submitted to App Review.

The live FuelWell Supabase project `xzsftuxvnkgxtbiibvac` is currently `INACTIVE`. The public Vercel production alias still points to deployment `dpl_CcrusBaFKJSwhwwWAQJjDSMEFA3R` at git SHA `722341a08c9e06603f3ba259e895c8c8a2170701`, so neither live surface represents the frozen candidate yet.

## Verified locally

- Web unit suite: 61 files, 458 tests passed.
- ESLint and TypeScript: passed.
- Next.js production build: passed; 807 static pages generated.
- Phone containment: 38 checks passed in Chromium and mobile WebKit at 320, 375, 390, and 430 pixels, including the public Privacy and Support pages.
- Coach rich-content containment: passed at 320 and 430 pixels with contained table/code/formula scrolling and stacked mobile artifacts.
- Native OAuth/routing tests: 7 passed on the iPhone 16e simulator.
- Native release-manifest tests: passed on the iPhone 16e simulator.
- Unsigned iOS Release archive: passed as version `1.4.0`, build `202608100001`, bound to the production candidate environment.
- Export compliance: archived app declares `ITSAppUsesNonExemptEncryption=false`.
- Public App Store listing surfaces: `/privacy` and `/support` are implemented, mobile-contained, referenced by Fastlane metadata, and required to return HTTP 200 by the immutable candidate gate.
- Repository App Store readiness with the private Apple environment loaded: 48 checks passed, 2 external blockers, 0 code failures.
- Local screenshot tooling: required iPhone simulators are installed, Bundler 2.6.9 is available through Homebrew Ruby, and the private screenshot-attestation key is configured with owner-only permissions.
- Authenticated state: server-authoritative repository implementation and account-switch guards passed independent review, 458 unit tests, and adversarial PostgreSQL RLS verification.
- App Store promotion safety: the release lane requires an explicit reviewed TestFlight build number, verifies the matching `1.4.0` build is valid and unexpired in App Store Connect, and promotes it without rebuilding or re-uploading a different binary.

## Live Apple inventory

- App Store Connect app: `Fuelwell`, Apple app ID `6776103250`, bundle ID `com.fuelwell.app`.
- Current App Store version record: `1.0`, state `PREPARE_FOR_SUBMISSION`.
- Latest uploaded build: `1.0 (202607160658)`, valid and unexpired, uploaded 2026-07-16.
- No `1.4.0` build has been uploaded yet. The approved candidate upload must create that build train before App Store preparation can select it.

## Required before TestFlight

1. Obtain Robert's approval to restore the inactive Supabase project, apply the live migration, configure production Vercel variables, and deploy the frozen candidate.
2. Restore Supabase and apply `supabase/migrations/20260810040034_server_authoritative_user_app_state.sql`; verify RLS, grants, migration history, and security advisors.
3. Configure the production Vercel environment for Supabase and Coach, then verify Google, Facebook, and Apple OAuth redirects and native callback handling.
4. Deploy commit `1a09de1d750afa3da8645f6ad9068be38d452772` to one immutable Vercel URL and verify the release manifest, public Privacy and Support pages, authenticated launch preflight, and `/.well-known/apple-app-site-association` response.
5. Run two-account isolation/persistence, live OAuth, live Coach text/image/PDF, universal-link, and compact/large iPhone candidate tests against that exact deployment.
6. Obtain Robert's separate approval to push the exact candidate, merge it to `main`, and upload its signed build to TestFlight.
7. Confirm the processed TestFlight build works for Robert and Max before promoting it toward App Review.

## Remaining App Store blockers

1. Capture and attest the real App Store screenshots from the approved immutable Vercel candidate.
2. Obtain Robert's explicit approval before submitting the reviewed build to App Review.

## Required before public App Store release

1. Capture candidate-bound App Store screenshots from the accepted immutable deployment and sign their manifest with the private screenshot-attestation key.
2. Confirm the processed TestFlight build works for internal testers, including Max, and that the intended build is the only active test build.
3. Complete App Store Connect privacy, compliance, age-rating, pricing, export-compliance, and review metadata checks.
4. Obtain explicit approval to submit the selected build for App Review.
5. Resolve any App Review feedback, then release manually or on the approved schedule.

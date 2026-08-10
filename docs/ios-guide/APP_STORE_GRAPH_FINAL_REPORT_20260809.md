# FuelWell App Store Candidate Refinement Report

Date: 2026-08-09

Branch: `release/fuelwell-appstore-20260809`

Status: **PASS for local candidate quality; externally blocked by inactive Supabase and release approval gates**

No branch was pushed, no deployment was created, and nothing was uploaded to TestFlight or App Store Connect during this pass.

## Scope and architecture

FuelWell's shipping iOS target is a native SwiftUI release-verification shell around the responsive Next.js product in `WKWebView`. The refinement therefore treated the native shell and every phone-width web route as one iPhone product. Existing business behavior was preserved while security, persistence, accessibility, responsive layout, brand assets, and release gates were strengthened.

The graph campaign used 20 independent auditors, reduced 57 findings to 15 high-priority groups, and subjected those groups to 45 fresh-context verifier evaluations. Eleven groups were accepted for implementation and four were rejected as unsupported or duplicative. Twenty-one lower-priority P2/P3 claims did not receive an independent verifier before the bounded agent budget ended; they remain follow-up material rather than claimed fixes.

## Implemented improvements

- Completed the compact iPhone pass documented in `MOBILE_REFINEMENT_REPORT_20260809.md`, including responsive Activity, Coach, Daily Review, Recipes, Settings, Workouts, and workout-detail surfaces.
- Corrected the 320-point auth header so its brand lockup and Home action cannot force document-level horizontal overflow.
- Added an isolated production-server mobile CI gate that covers Chromium and WebKit instead of reusing a development/HMR server.
- Repaired the meal ingredient drawer as a modal sheet with dialog semantics, focus trapping, Escape handling, background isolation, and focus restoration.
- Added authenticated account export and account deletion controls, durable signed deletion confirmation, atomic nonce consumption, replay/expiry/user-mismatch protection, and native export download handling.
- Scoped Coach history and client state by user, hardened action confirmations, added durable Supabase confirmation ledgers, and made destructive preview actions fail closed rather than accepting replayable in-memory approval state.
- Added release preflight coverage for the new security tables and migrations.
- Replaced app/web brand assets with the current FuelWell logo family and wired complete iOS AppIcon sizes.
- Added immutable release binding, App Store screenshot foundations, candidate-to-screenshot provenance, and HMAC-attested screenshot evidence.
- Added App Store metadata/privacy/readiness checks while retaining the explicit human gate for TestFlight upload and App Review submission.
- Repaired the candidate-bound release verifier so it signs the dedicated UI-test account into Supabase and calls the protected live preflight with a bearer session. The endpoint remains private while the workflow can now prove live schema and provider health before any upload.
- Persisted weekly meal plans by authenticated user and week through a Supabase-backed API with row-level security, while retaining an isolated preview-only fallback and clearing signed-in meal-plan state on account changes.
- Protected paid photo-nutrition inference with authenticated-user checks, input validation, daily AI-budget enforcement, usage recording, and sanitized unavailable/error states.
- Reworked preference synchronization as a merge into the latest server document. Food likes, dislikes, diets, and allergies can no longer overwrite onboarding, units, coaching tone, or other profile namespaces when a stale client writes.
- Cleared signed-in day, workout, body, grocery, Coach, meal-plan, goal, and integration caches on logout while deliberately preserving the separate preview persona.
- Made account-confirmation cookies secure by default and added the profile-preferences migration to the production launch preflight.
- Polished the iPhone shell with bounded native errors and privacy-safe logging, calmer Daily Review progressive disclosure on phones, and semantic link controls across the primary routes.

## Key iOS decisions

- The supported compact contract is 320, 375, 390, and 430 CSS points, with no whole-page horizontal overflow.
- Dense data may scroll only inside a clearly contained table/code/formula region; the page itself must remain bounded.
- The native shell verifies an immutable deployment manifest before opening the product, so generic local UI tests intentionally exclude the release-bound UI target.
- Release-bound UI, authenticated persistence, and live Coach inference are tested only against an immutable candidate carrying matching Git SHA, Vercel deployment ID, deployment URL, package version, and environment.
- Account export uses the native iOS share sheet, and the SwiftUI loading state clears for download handoff, completion, and failure.
- Security-sensitive confirmations are server-consumed once. Preview mode cannot delete or replace persisted user data.
- Phone layouts default to the highest-value overview while dense Daily Review ledgers stay collapsed until requested. This reduces dashboard-style density without deleting functionality.
- Navigation links are represented by one semantic interactive control rather than nested link/button elements, improving VoiceOver order, keyboard focus, and tap reliability.
- Profile writes are namespace-preserving read/merge/write operations and fail closed when the current server document cannot be read.

## Verification evidence

| Gate | Result |
| --- | --- |
| ESLint | PASS |
| Next.js production build | PASS: 800 static pages generated |
| Web unit tests | PASS: 54 files, 394 tests |
| Production mobile containment | PASS: 38/38 across Chromium and WebKit |
| Compact 320-point rerun | PASS: 14/14 across Chromium and WebKit |
| Ingredient drawer accessibility | PASS: 4/4 across Chromium and WebKit |
| Semantic navigation + Daily Review disclosure | PASS: 19/19 targeted Playwright checks |
| Feature import direction | PASS |
| Theme drift | PASS |
| Git whitespace validation | PASS |
| FuelWell native iPhone 16e tests | PASS: 88/88 |
| Networking Swift package iPhone 16e tests | PASS: 1/1 |
| Native iPhone 17 Pro Max build | PASS |
| Repository App Store readiness | PASS: 25 checks, 0 repository failures |
| Immutable candidate UI + live Coach | BLOCKED: candidate provenance and test credentials are not present |
| Live Supabase migration/OAuth persistence | BLOCKED: project `xzsftuxvnkgxtbiibvac` is confirmed `INACTIVE` |
| App Store screenshots | BLOCKED: must be captured from the approved immutable candidate |

Native test results:

- `ios/build/reports/FuelWellApp-combined.xcresult`
- `ios/build/reports/Networking-combined-package.xcresult`

Representative compact screenshots:

- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-signup.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-dashboard.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-coach.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-grocery-list.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-mobile-webkit/320-app-workouts.png`

## External release gates

The repository is locally green, but a release candidate cannot be honestly declared until all of these are satisfied:

1. Obtain Robert's approval to restore Supabase project `xzsftuxvnkgxtbiibvac`. The management API reports the Free-plan project as `INACTIVE`, and its API hostname does not currently resolve.
2. After restoration, apply every pending Supabase migration and verify the profile-preferences, meal-plan, Coach, activity, grocery, account-security, and release-readiness tables and policies with two-user isolation checks. Migration state cannot be queried while the project is inactive.
3. Obtain Robert's approval to push the reviewed candidate branch. It is ahead of `origin/main`; no remote branch or pull request was created during this pass.
4. Create an immutable Vercel deployment from the exact reviewed commit and record its Git SHA, deployment ID, deployment origin, and environment. The current public production deployment is `dpl_CcrusBaFKJSwhwwWAQJjDSMEFA3R` from July 26 and predates the release manifest routes.
5. Run `tools/release/test-ios-candidate-ui.sh`; GitHub already has the dedicated UI-test and Supabase secrets needed by the workflow. This gate verifies live Coach inference, fresh-sign-in persistence, mobile containment, and the actual bound `WKWebView` shell.
6. Capture and attest App Store screenshots from that same immutable candidate.
7. Obtain Robert's explicit approval before TestFlight upload, and separate explicit approval before App Review submission.

## Verified release configuration

- GitHub authentication is active for `RBarbieri13`, and the repository has Apple signing, App Store Connect, Match, Supabase public-key, and dedicated UI-test secrets configured.
- The last successful TestFlight workflow was run `29476657493` on July 16 against commit `6d108fdc0b7bc063626d006d212812847a5ff238`.
- The July 27 TestFlight workflow `30235420827` correctly stopped before upload because the bound candidate failed its live readiness gate.
- Vercel project `fuelwell-preview` is reachable, but the public alias still points to the older July 26 deployment and returns 404 for the new immutable release manifest and launch-preflight routes.
- Supabase organization `RBarbieri13's Org` is on the Free plan. FuelWell is the `INACTIVE` project; this matches Supabase's documented automatic pausing behavior for low-activity Free-plan projects.

## Remaining limitations

- The candidate-bound UI target is not a local fallback test. Without immutable deployment metadata and authenticated credentials it correctly fails closed, so no live Coach, OAuth, Supabase, TestFlight, or App Store claim is made here.
- The embedded product currently uses FuelWell's light surface; dark mode is not claimed.
- Live two-user row-level-security denial, OAuth persistence, and provider-backed Coach inference remain external-environment checks; local mocks and repository contracts do not substitute for those proofs.
- HealthKit runtime behavior is not claimed because the current shipping shell embeds the responsive web product and does not yet expose a production HealthKit integration.
- `ios/build/` and `test-results/` are generated evidence and must not be committed.
- The 21 lower-priority graph claims that lacked a fresh verifier should be revisited in a later polish campaign after the release-critical gates are complete.

## Review boundary

Review commits `ed5cd39`, `8fbd954`, `08843bf`, `f2d5d9b`, `f92ba76`, and `3b3dc91` on `release/fuelwell-appstore-20260809`, along with the preceding compact-iPhone candidate work already on that branch. Do not include generated `ios/build/` output. The next outward-facing action is an explicit human-gated Supabase restoration and immutable preview deployment, not a direct TestFlight or App Store upload.

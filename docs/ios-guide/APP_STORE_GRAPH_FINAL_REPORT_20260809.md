# FuelWell App Store Candidate Refinement Report

Date: 2026-08-09

Branch: `release/fuelwell-appstore-20260809`

Status: **PASS for local candidate quality; externally blocked for immutable-candidate and store verification**

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

## Key iOS decisions

- The supported compact contract is 320, 375, 390, and 430 CSS points, with no whole-page horizontal overflow.
- Dense data may scroll only inside a clearly contained table/code/formula region; the page itself must remain bounded.
- The native shell verifies an immutable deployment manifest before opening the product, so generic local UI tests intentionally exclude the release-bound UI target.
- Release-bound UI, authenticated persistence, and live Coach inference are tested only against an immutable candidate carrying matching Git SHA, Vercel deployment ID, deployment URL, package version, and environment.
- Account export uses the native iOS share sheet, and the SwiftUI loading state clears for download handoff, completion, and failure.
- Security-sensitive confirmations are server-consumed once. Preview mode cannot delete or replace persisted user data.

## Verification evidence

| Gate | Result |
| --- | --- |
| ESLint | PASS |
| Next.js production build | PASS: 799 static pages generated |
| Web unit tests | PASS: 48 files, 365 tests |
| Production mobile containment | PASS: 38/38 across Chromium and WebKit |
| Compact 320-point rerun | PASS: 14/14 across Chromium and WebKit |
| Ingredient drawer accessibility | PASS: 4/4 across Chromium and WebKit |
| Feature import direction | PASS |
| Theme drift | PASS |
| Git whitespace validation | PASS |
| Native iPhone 16e tests | PASS: 89/89 |
| Native iPhone 17 Pro Max build | PASS |
| Repository App Store readiness | PASS: 25 checks, 0 repository failures |
| Immutable candidate UI + live Coach | BLOCKED: candidate provenance and test credentials are not present |
| Live Supabase migration/OAuth persistence | BLOCKED: deployment configuration is not present in this worktree |
| App Store screenshots | BLOCKED: must be captured from the approved immutable candidate |

Native test result:

`~/Library/Developer/Xcode/DerivedData/FuelWellApp-azkgfxbtrqnjkpdiburxsnifjsxa/Logs/Test/Test-FuelWellApp-2026.08.09_19-53-00--0500.xcresult`

Representative compact screenshots:

- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-signup.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-dashboard.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-coach.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-chromium/320-app-grocery-list.png`
- `test-results/mobile-component-clipping--8024a-able-on-every-primary-route-mobile-webkit/320-app-workouts.png`

## External release gates

The repository is locally green, but a release candidate cannot be honestly declared until all of these are satisfied:

1. Apply the three new Supabase migrations and verify their tables/RLS against the target project.
2. Configure Google and Facebook OAuth in Supabase and their provider consoles, then verify new registration and returning sign-in with dedicated test accounts.
3. Create an immutable Vercel deployment from the exact reviewed commit and record its Git SHA, deployment ID, deployment origin, and environment.
4. Provide dedicated authenticated UI-test credentials and run `tools/release/test-ios-candidate-ui.sh`; this gate verifies live Coach inference, fresh-sign-in persistence, mobile containment, and the actual bound `WKWebView` shell.
5. Configure the Apple/Fastlane secrets listed in `docs/APP-STORE-READINESS.md`.
6. Capture and attest App Store screenshots from that same immutable candidate.
7. Obtain Robert's explicit approval before TestFlight upload, and separate explicit approval before App Review submission.

## Remaining limitations

- The candidate-bound UI target is not a local fallback test. Without immutable deployment metadata and authenticated credentials it correctly fails closed, so no live Coach, OAuth, Supabase, TestFlight, or App Store claim is made here.
- The embedded product currently uses FuelWell's light surface; dark mode is not claimed.
- `ios/build/` and `test-results/` are generated evidence and must not be committed.
- The 21 lower-priority graph claims that lacked a fresh verifier should be revisited in a later polish campaign after the release-critical gates are complete.

## Review boundary

Review the commits on `release/fuelwell-appstore-20260809` plus the final compact auth-header change. Do not include generated `ios/build/` output. The next outward-facing action is an explicit human-gated immutable preview deployment, not a direct TestFlight or App Store upload.

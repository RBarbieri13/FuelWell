# FuelWell iPhone responsive recovery report

Date: 2026-07-13
Branch: `surf/ios-responsive-ux-recovery`

## Verdict

Local implementation and live-provider verifier: **PASS**

Immutable Vercel candidate and TestFlight candidate verifier:
**PENDING EXTERNAL RELEASE STEP**

No production deployment or TestFlight upload was performed in this campaign.

## Implemented

- Removed whole-page horizontal overflow across 21 app routes at 320, 375,
  390, and 430px.
- Fixed the same min-content grid defect on Log, Profile, Settings, Groceries,
  and Workout Detail rather than limiting the repair to the reported screens.
- Rebuilt Daily Review energy controls as independent, full-width Intake and
  Output controls. Collapsing both removes Latest 7, chart controls, bars,
  legend, and summaries.
- Made Browse Library open and focus the workout library.
- Replaced phone filter-chip overload with dropdown filters.
- Limited workout results to 20 per page with previous/next and page status.
- Added a clear essential/all-columns control; wide data scrolls only inside
  its table container.
- Reduced Pick My Own and Activity to compact side-by-side choices with
  progressive disclosure.
- Replaced the oversized grocery table on phones with editable cards while
  retaining quantity, serving, category, recipe source, benefit, check, and
  delete actions.
- Added recipe actions that persist a planned meal to today's log and measured
  ingredients to the shared grocery list.
- Removed the remote-auth wait from local preview onboarding completion.
- Expanded the immutable-candidate gate to include responsive routes, Coach,
  Daily Review, Workouts, Groceries, Recipes, and persistence journeys.
- Added a serialized mobile WebKit pass and preserved the native WKWebView
  release-binding test.
- Made anonymous local Coach preview independent of Supabase configuration.
- Added a local-only paid-provider harness so real Coach answers can be tested
  without changing production cost controls.
- Made the Coach action drawer yield to the mobile composer when the user types
  or sends, preventing the drawer from blocking the input and Send control.
- Strengthened Coach source behavior so citation, fact-sheet, and named-source
  questions use web search when it is available instead of prematurely claiming
  that a source cannot be found.

## Journey evidence

Three consecutive rounds passed. Each round included one new user and one
existing user. Every journey completed:

1. Preview signup and, for new users, all 15 onboarding steps.
2. Body measurements and goal setup.
3. Breakfast, lunch, and dinner logging.
4. Manual activity logging.
5. Five real-provider Coach turns. Two required exact app meal or activity
   values; three required authoritative online health guidance.
6. Recipe planning and measured grocery creation.
7. Daily Review verification before and after reload.
8. A whole-page width assertion at every major stop.

All six journeys passed against the live local Coach provider, producing 30
answers. The app-context answers matched the same persisted meals and workouts
shown on non-Coach pages. Screenshots and answer transcripts are under
`evidence/live-coach/`; final Review screenshots are under
`evidence/journeys/`.

## Verification

- Final Chromium candidate suite: 34 passed.
- Mobile WebKit containment suite: 8 passed.
- Live-provider journey gate: 6 passed, with 30 Coach answers.
- Route containment, Chromium: 4 tests covering 84 route/width combinations.
- Route containment, mobile WebKit: 4 tests covering the same 84 combinations.
- Unit tests: 36 files, 271 tests passed.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build: passed; 797 static pages generated.
- Native release binding: passed, including 8 manifest tests and iOS simulator
  binding tests.

## Live Coach boundary

The deterministic provider remains the default for ordinary preview runs. A
local-only paid-provider switch was used for the final benchmark. It does not
weaken production preview-mode or budget protections.

Every new/existing-user journey asked two questions tied to the persisted app
snapshot plus three questions rotated through a five-source federal benchmark.
All 30 answers passed the automated value/source checks. The benchmark and
scoring rules are in `evidence/coach-factual-benchmark.md`.

This proves the local provider path and factual benchmark. The same checks must
still be repeated after an immutable deployment to prove the deployed
environment, credentials, and native binding.

## Candidate next step

1. Commit and push this branch.
2. Deploy an immutable Vercel preview.
3. Run launch preflight and the expanded candidate UI gate.
4. Repeat the paid Coach benchmark against the authenticated immutable
   candidate and compare it with the saved local transcripts.
5. Only after all candidate checks pass, bind and upload the same immutable
   deployment to TestFlight.

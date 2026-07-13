# FuelWell iPhone responsive recovery report

Date: 2026-07-12
Branch: `surf/ios-responsive-ux-recovery`

## Verdict

Local implementation verifier: **PASS**

Immutable Vercel candidate, authenticated live Coach, and TestFlight candidate
verifier: **PENDING EXTERNAL RELEASE STEP**

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

## Journey evidence

Three consecutive rounds passed. Each round included one new user and one
existing user. Every journey completed:

1. Preview signup and, for new users, all 15 onboarding steps.
2. Body measurements and goal setup.
3. Breakfast, lunch, and dinner logging.
4. Manual activity logging.
5. Five deterministic Coach turns whose request snapshot contained the same
   meals, workout, and grocery values used by non-Coach pages.
6. Recipe planning and measured grocery creation.
7. Daily Review verification before and after reload.
8. A whole-page width assertion at every major stop.

Final screenshots are under `evidence/journeys/`.

## Verification

- Focused Playwright: 39 passed.
- Three-round journey gate: 6 passed.
- Route containment, Chromium: 4 tests covering 84 route/width combinations.
- Route containment, mobile WebKit: 4 tests covering the same 84 combinations.
- Unit tests: 36 files, 269 tests passed.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build: passed; 797 static pages generated.
- Native release binding: passed, including 8 manifest tests and iOS simulator
  binding tests.

## Live Coach boundary

Local preview intentionally uses a deterministic provider fallback. It proves
the UI, shared snapshot, persistence, and responsive behavior, but it cannot
prove live factual quality. `evidence/coach-factual-benchmark.md` records five
first-party federal-source questions and a strict scoring rubric.

The live verifier must run after an immutable candidate deploy with a dedicated
authenticated account. It must fail on unsupported numbers, missing population
qualifiers, medical overreach, missing links, or disagreement with non-Coach
app values.

## Candidate next step

1. Commit and push this branch.
2. Deploy an immutable Vercel preview.
3. Run launch preflight and the expanded candidate UI gate.
4. Run the five paid Coach benchmark questions against the authenticated
   candidate and score them against the benchmark.
5. Only after all candidate checks pass, bind and upload the same immutable
   deployment to TestFlight.

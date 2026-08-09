# FuelWell Mobile Refinement Report

Date: 2026-08-09

Branch: `release/fuelwell-appstore-20260809`

Base commit: `f067763`

## Outcome

PASS for the scoped mobile-first refinement. The shipping iOS target is a native SwiftUI shell around the responsive FuelWell web product, so the pass covered both the shell states and the embedded phone-width product surfaces. No deployment, merge, TestFlight upload, membership change, or other external action was performed.

## Improvements

- Reworked the SwiftUI shell loading and failure states to use FuelWell design tokens, clear retry language, 44-point actions, accessibility labels, and keyboard-safe behavior.
- Prevented horizontal bounce in the iOS web view and enabled interactive keyboard dismissal and directional scroll locking.
- Repaired compact activity metrics so values and labels wrap instead of clipping.
- Shortened the Coach phone header without removing the fuller desktop explanation.
- Rebuilt Daily Review disclosure headers and Nutrition/Fitness detail heroes so their titles, descriptions, and actions use the full compact width.
- Replaced clipped horizontal controls on Recipes and Settings with native phone selects while preserving desktop controls.
- Reduced the mobile workout recommendation card's vertical density and moved secondary recommendations behind progressive disclosure.
- Reflowed workout-detail titles and summaries so the move count no longer squeezes the primary content.
- Renamed the compact workout destination to `Move`, matching the iPhone tab convention while preserving the Workouts route and page title.
- Added compact-width regression assertions for Activity, Recipes, Settings, Coach, navigation, workout recommendation density, and workout-detail hierarchy.

The measurable acceptance checklist is in `docs/ios-guide/MOBILE_REFINEMENT_ACCEPTANCE.md`.

## iOS Decisions

- The iPhone layout is the primary compact contract at 320, 375, 390, and 430 CSS pixels.
- Dense filters become platform-familiar selects on phones and remain segmented controls on larger screens.
- Secondary workout guidance is disclosed on demand instead of occupying most of the first viewport.
- Error states explain what happened and provide one clear retry action; raw provider errors are not presented as primary UI.
- The native shell follows the existing generated theme rather than introducing new colors, spacing values, or dependencies.

## Verification

| Check | Result |
| --- | --- |
| Web production build | PASS |
| ESLint | PASS |
| Web unit tests | PASS: 39 files, 333 tests |
| Mobile clipping suite | PASS: 19 tests |
| Compact-width semantic regression test | PASS |
| Theme drift check | PASS |
| iOS feature import check | PASS |
| Native iPhone 16e simulator tests | PASS |
| Native iPhone 17 Pro simulator build | PASS |
| Git whitespace validation | PASS |

Native test result bundle:

`ios/build/mobile-refinement-tests-20260809-v2.xcresult`

Representative after screenshots:

- `ios/build/mobile-refinement-run2-20260809/mobile-component-clipping--bbea9-of-clipped-desktop-patterns-chromium/320-activity-readable-metrics.png`
- `ios/build/mobile-refinement-run2-20260809/mobile-component-clipping--bbea9-of-clipped-desktop-patterns-chromium/320-recipes-native-filter.png`
- `ios/build/mobile-refinement-run2-20260809/mobile-component-clipping--bbea9-of-clipped-desktop-patterns-chromium/320-settings-native-section-picker.png`
- `ios/build/mobile-refinement-run2-20260809/mobile-component-clipping--bbea9-of-clipped-desktop-patterns-chromium/320-coach-compact-header.png`
- `ios/build/mobile-refinement-run3-20260809/mobile-component-clipping--bbea9-of-clipped-desktop-patterns-chromium/320-workouts-progressive-recommendation.png`

## Remaining Limitations

- The authenticated Playwright journeys require `FUELWELL_UI_TEST_EMAIL` and `FUELWELL_UI_TEST_PASSWORD`; those credentials were not present in this worktree. Public and deterministic compact-width coverage passed, but the credential-gated journeys were not claimed as verified.
- The app currently uses a SwiftUI `WKWebView` release shell. This pass improves that actual shipping architecture; it does not convert existing web feature screens into unrelated native rewrites.
- Dark mode is not claimed because the embedded product currently presents a light FuelWell surface.

## Review Notes

Review only the listed source, test, and documentation files. `ios/build/` contains local evidence and Xcode results and must not be committed. The branch is ready for code review; external release steps remain intentionally untouched.

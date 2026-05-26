# Phase 4 Performance Budgets

Scope: launch and primary navigation readiness

Phase 4 now has repeatable simulator measurements in the UI test target and a concrete real-device follow-up checklist. The simulator checks are not treated as final production numbers because Chapter 16 is explicit that a real iPhone is required for trustworthy timing, but they do catch obvious regressions before a PR reaches TestFlight.

## Budgets

| Area | Phase 4 budget | Current evidence |
| --- | --- | --- |
| Cold launch | P95 under 400ms to first interactive frame on a real device | `testLaunchPerformanceBudget` records launch-to-responsive timing with `XCTApplicationLaunchMetric`. |
| Warm launch | P95 under 200ms on a real device | Pending real-device Instruments run before TestFlight. |
| Primary tab navigation | No visible stalls across Dashboard, Meals, Coach, Exercise, and Progress | `testPrimaryTabNavigationPerformanceBudget` records tab switching with `XCTClockMetric`. |
| Scroll | 60fps sustained, 120fps where supported | Pending Instruments SwiftUI/Animation Hitches pass on dashboard and nutrition lists. |
| Idle memory | Under 150MB resident at idle | Pending real-device Allocations pass before TestFlight. |
| Blocking I/O | No blocking disk or network work during SwiftUI body evaluation | Covered by code review and future Time Profiler sampling. |

## Automated Coverage

The Phase 4 UI test target now records:

- Launch to Dashboard interactive state.
- Primary tab switching across the app's highest-traffic navigation surfaces.
- Existing dashboard, help/menu, add-meal, and tab reachability smoke paths.

Run the focused suite from the iOS workspace:

```bash
xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:FuelWellUITests test
```

## Real-device Release Checklist

Run this checklist before TestFlight submission and again for each release candidate:

1. Profile cold launch with Instruments on a physical iPhone. Record P50, P95, and worst observed time.
2. Profile warm launch/resume from background. Record P50 and P95.
3. Use the SwiftUI instrument while navigating Dashboard, Meals, Coach, Exercise, and Progress.
4. Use Animation Hitches while scrolling Dashboard, Meals, recipe lists, grocery list, and Progress.
5. Use Allocations after two minutes idle on Dashboard and after opening Add Meal with a photo selected.
6. Add the measured values to `docs/ios-guide/runbook.md` under the current release entry.

## Current Release Note

This slice establishes the measurement hooks and the release checklist. It does not claim production-grade timing until a physical-device Instruments run is attached to a release candidate.

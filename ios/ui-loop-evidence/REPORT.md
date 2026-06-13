# iOS UI Polish Evidence

## Scope

- Continued PR #103 from the saved Wave 1 DesignSystem branch.
- Adapted the Claude CI-only plan to Codex by using local XcodeBuildMCP simulator build/run loops before pushing.
- Kept the pass UI-only: SwiftUI views, DesignSystem components, haptic wrapper, and local evidence docs.

## Changes

- Wave 1: DesignSystem primitives already on the branch: score chip, stacked bar chart, sparkline, chip row, sheet grabber, and ComponentGalleryV2.
- Wave 2: Dashboard now leads with the verdict/next action, moves Health Score into a compact chip, and gives energy balance clearer inflow/outflow labels.
- Wave 3: Progress macro adherence uses the stacked macro bar chart, weight trend uses the metric tile sparkline slot, and nutrition progress bars use rounded animated fills with Reduce Motion support.
- Wave 4: Meal sheets use the shared grabber, menu/help sheets use native detents, tab changes and commit actions use FuelWell haptic tokens, and the tab bar uses per-section tint with a Coach circle symbol.

## Verification

- `ios/scripts/check-theme-drift.sh` passed.
- `ios/scripts/check-feature-imports.sh` passed.
- `swiftlint --strict` from `ios/` passed with 0 violations.
- XcodeBuildMCP `build_run_sim` passed on iPhone 17 / iOS 26.3 with no warnings or errors.
- Final simulator preview captured at `/var/folders/mk/4zpvpljs7757dgf6h9qswksh0000gn/T/screenshot_optimized_194ee5b1-5389-434f-ba0d-bb15bc6ebdc3.jpg`.

## Deferred

- ComponentGalleryV2 snapshot baselines still need to be recorded on a Mac and added to the snapshot suite.
- CI should run on PR #103 after the final push; merge should stay gated on green GitHub checks and Robert's visual review.

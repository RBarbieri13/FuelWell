# FuelWell - Phase 4 Component Gallery and Dynamic Type Handoff

Date: 2026-05-25
Branch: feature/phase-4-component-gallery-dynamic-type

## Intent

This PR continues Phase 4 by turning the DesignSystem package from token-only into a visible, testable UI contract. It follows the front-end/design workflow by grounding the work in `DESIGN.md`, Chapter 7, Chapter 14, Chapter 15, and the existing generated `Theme`.

## What Changed

- Added `ComponentGallery`, the first gallery surface for the app's reusable UI vocabulary.
- Added token-driven reusable DesignSystem components:
  - `FuelWellMacroRing`
  - `FuelWellMetricTile`
  - `FuelWellActionRow`
  - `FuelWellEmptyState`
  - `FuelWellPrimaryButtonStyle`
  - `FuelWellSecondaryButtonStyle`
  - `fuelWellCard`
- Added accessibility labels/values and decorative-icon hiding to the new components.
- Added adaptive gallery layout that collapses to one column at accessibility Dynamic Type sizes.
- Added gallery previews, including an accessibility worst-case Dynamic Type preview.
- Added `ComponentGalleryRenderTests` for standard, compact-width, and accessibility5 renders.
- Regenerated the Xcode project so the new DesignSystem source and tests are included.
- Updated the Phase 4 accessibility audit with the new gallery coverage and remaining gaps.

## Verification

- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:DesignSystemTests test`

## Notes

- The guide's reduce-motion/reduce-transparency preview examples are not directly writable environment values in this SwiftUI toolchain, so this slice verifies the highest-impact accessibility rendering risk: `DynamicTypeSize.accessibility5`.
- The render test logs show UIKit font descriptor warnings for Outfit, Inter, and DM Sans. The app already referenced those names; this slice made the issue more visible. A later design-system hardening pass should bundle the fonts or map the tokens to available system typography.

## Remaining Phase 4 Work

- Add pixel-baseline snapshot tests with `swift-snapshot-testing` after the rendered gallery states are visually approved.
- Expand reducer/unit coverage for newer Phase 3 feature surfaces.
- Add performance measurement and runbook coverage.
- Complete kill-switch drill verification.

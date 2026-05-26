# FuelWell - Phase 4 Gallery Snapshot Baselines Handoff

Date: 2026-05-25
Branch: feature/phase-4-gallery-snapshot-baselines

## Intent

This PR completes the next front-end/design quality step after the Component Gallery landed: real visual regression baselines. The goal is to catch accidental design drift in reusable components without snapshotting every app screen.

## What Changed

- Added `swift-snapshot-testing` to the DesignSystem package and Xcode project.
- Added `ComponentGallerySnapshotTests` for:
  - standard iPhone-width gallery rendering
  - compact-width gallery rendering
  - accessibility5 Dynamic Type gallery rendering
- Recorded checked-in PNG baselines under `DesignSystemTests/__Snapshots__/ComponentGallerySnapshotTests`.
- Kept the existing render smoke tests so the gallery has both coarse render checks and strict pixel comparison.
- Updated the Phase 4 accessibility audit with the snapshot baseline evidence.

## Verification

- First DesignSystem run recorded baselines and failed as expected because references were missing.
- Second DesignSystem run compared against the new baselines and passed:
  - `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:DesignSystemTests test`

## Notes

- The baselines were visually inspected before this handoff:
  - normal state keeps the gallery compact and scannable
  - accessibility5 collapses to one column and wraps text instead of clipping
- Snapshot rendering still logs UIKit font descriptor warnings for Outfit, Inter, and DM Sans. That is pre-existing token reality made visible by gallery rendering. A future design-system hardening pass should bundle these fonts or remap tokens to available system typography.
- These baselines are tied to the local iPhone 15 simulator render stack. CI should use the same pinned simulator before treating snapshot failures as blocking.

## Remaining Phase 4 Work

- Expand reducer/unit coverage for the newer Phase 3 surfaces.
- Add performance measurement and launch/scroll budget documentation.
- Complete kill-switch drill verification and runbook notes.
- Bundle or remap brand fonts to remove snapshot render warnings.

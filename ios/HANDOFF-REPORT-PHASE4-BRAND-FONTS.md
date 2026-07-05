# FuelWell - Phase 4 Brand Font Readiness

Date: 2026-05-26
Branch: `feature/phase-4-brand-fonts`

## Summary

This Phase 4 slice resolves the remaining design-system font hardening item called out by prior handoffs. The app now bundles the named FuelWell brand fonts from the design contract and registers them at launch so SwiftUI `Font.custom` calls resolve to real app typography instead of silently falling back.

## What Changed

- Added Outfit, Inter, and DM Sans variable font files to the app resources.
- Added `FuelWellFontRegistry` in the DesignSystem package.
- Registered bundled fonts during `FuelWellApp` startup.
- Added a DesignSystem regression test that keeps the font registry manifest aligned with `Theme.app.font`.
- Added Phase 4 font-readiness documentation.

## Moonchild Check

Moonchild MCP is connected and exposes a `Fuelwell` design system. The currently published design system has no token, component, guideline, or gallery files, so this slice used `docs/ios-guide/DESIGN.md` as the active design source of truth.

## Verification

- `xcodegen generate --spec project.yml`
- `git diff --check`
- `swiftlint --strict --config ios/.swiftlint.yml ios`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:DesignSystemTests test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' -only-testing:FuelWellUITests/FuelWellCriticalPathUITests/testColdLaunchShowsDashboardQualitySurfaces test`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `tools/simulator-live/rebuild-and-launch.sh`
- DesignSystem render logs no longer contain SwiftUI font descriptor update warnings after test-side font registration.
- Full-suite and simulator-launch logs no longer contain the prior missing-font or SwiftUI font descriptor warnings.

## Remaining Phase 4 Work

- Run and record a staging/live kill-switch drill once Supabase staging credentials are attached.
- Attach physical-device Instruments values before TestFlight is considered release-ready.

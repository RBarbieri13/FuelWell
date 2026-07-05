# FuelWell - Phase 3 Meal Photo Capture Handoff

Date: 2026-05-24
Branch: `feature/phase-3-meal-photo-capture`

## Summary

- Replaced the staged Add Meal photo card with a real photo-first logging surface.
- Added camera capture on device through `UIImagePickerController`.
- Added simulator-friendly photo import through `PhotosPicker`.
- Added selected-photo preview and remove-photo affordance before save.
- Added camera privacy copy to the generated app Info.plist settings.
- Added reducer coverage for taking, importing, and clearing draft meal photos.
- Split Add Meal sheet UI into its own source file to keep Nutrition views scoped.

## Verification

- `xcodegen generate`
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test`
- `ios/scripts/check-feature-imports.sh`
- `ios/scripts/check-theme-drift.sh`
- `swiftlint --strict --config ios/.swiftlint.yml ios`

## Next Slice

Persist meal photo attachments beyond draft state, then connect the photo to the
future camera-recognition/offline queue contract.

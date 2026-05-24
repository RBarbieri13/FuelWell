# FuelWell - Phase 3 Macro Foundation Handoff

Date: 2026-05-24
Branch: `feature/phase-3-macro-foundation`

## Scope

This slice adds the first durable nutrition domain layer behind the Meals and Progress surfaces. It keeps the work package-level so feature modules still obey the repo import-boundary guard.

## Added

- `Nutrition` Swift package with macro target, intake, remaining, verdict, recommendation, meal-slot, and day-snapshot models.
- `MacroDecisionEngine.evaluate(target:intake:nextMeal:)` for verdict-first macro guidance.
- Swift Testing coverage for remaining-macro math, protein-behind-calories guidance, on-track guidance, coach-language no-gos, and the three-recommendation cap.
- App shell wiring so Home and Meals tab placeholder copy reads from `MacroDaySnapshot.preview` instead of independent hardcoded nutrition copy.
- XcodeGen registration for the `Nutrition` package and `NutritionTests` target.

## Product Rules Preserved

- Verdict appears before raw macro detail.
- Photo logging remains the first recommendation.
- Recommendations are capped at three.
- Coach copy avoids the locked no-go phrases: "you missed", "you skipped", and "you went over".
- Macro History remains represented as a Progress deep-link target rather than a standalone screen.

## Verification

Run from `ios/`:

```bash
xcodegen generate
xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' build
xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test
scripts/check-feature-imports.sh
scripts/check-theme-drift.sh
swiftlint --strict --config .swiftlint.yml .
```

## Next Best Slice

Build the real Meals & Nutrition hub reducer and view state on top of `Nutrition`, then connect Add Meal's photo-first flow to the offline write queue contract.

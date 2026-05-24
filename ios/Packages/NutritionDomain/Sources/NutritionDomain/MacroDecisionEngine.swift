public enum MacroDecisionEngine {
    public static func evaluate(
        target: MacroTarget,
        intake: MacroIntake,
        nextMeal: MealSlot
    ) -> MacroDaySnapshot {
        let remaining = MacroRemaining(
            calories: target.calories - intake.calories,
            macros: target.macros - intake.macros
        )
        let verdict = Self.verdict(target: target, intake: intake, remaining: remaining, nextMeal: nextMeal)

        return MacroDaySnapshot(
            target: target,
            intake: intake,
            remaining: remaining,
            verdict: verdict,
            recommendations: Array(Self.recommendations(remaining: remaining, nextMeal: nextMeal).prefix(3))
        )
    }

    private static func verdict(
        target: MacroTarget,
        intake: MacroIntake,
        remaining: MacroRemaining,
        nextMeal: MealSlot
    ) -> NutritionVerdict {
        let proteinRatio = Self.ratio(consumed: intake.macros.protein, target: target.macros.protein)
        let calorieRatio = Self.ratio(consumed: intake.calories, target: target.calories)

        if remaining.calories < 0 {
            return NutritionVerdict(
                headline: "Rebalance the next plate",
                detail: "Keep \(nextMeal.rawValue) lean, protein-forward, and simple.",
                tone: .rebalance
            )
        }

        if proteinRatio < calorieRatio - 0.12 || remaining.macros.protein >= 75 {
            return NutritionVerdict(
                headline: "Eat a real \(nextMeal.rawValue)",
                detail: "\(max(0, remaining.macros.protein))g protein keeps the day on track.",
                tone: .needsFuel
            )
        }

        return NutritionVerdict(
            headline: "Stay the course",
            detail: "Protein and calories are moving in range.",
            tone: .onTrack
        )
    }

    private static func recommendations(remaining: MacroRemaining, nextMeal: MealSlot) -> [MacroRecommendation] {
        let display = remaining.displayClamped

        return [
            MacroRecommendation(
                title: "Photo log first",
                detail: "Use the camera for \(nextMeal.rawValue), then adjust only if needed."
            ),
            MacroRecommendation(
                title: "\(display.macros.protein)g protein left",
                detail: "Anchor the plate with a clear protein source."
            ),
            MacroRecommendation(
                title: "\(display.calories) calories left",
                detail: "Keep the rest of the day flexible."
            )
        ]
    }

    private static func ratio(consumed: Int, target: Int) -> Double {
        guard target > 0 else { return 0 }
        return Double(consumed) / Double(target)
    }
}

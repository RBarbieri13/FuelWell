public enum MacroDecisionEngine {
    public static func evaluate(
        target: MacroTarget,
        intake: MacroIntake,
        nextMeal: MealSlot,
        energyOut: EnergyOutSnapshot = .unavailable
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
            energyOut: energyOut,
            verdict: verdict,
            recommendations: Array(Self.recommendations(remaining: remaining, nextMeal: nextMeal).prefix(3))
        )
    }

    public static func healthScore(snapshot: MacroDaySnapshot) -> HealthScore {
        let calorieRatio = Self.ratio(consumed: snapshot.intake.calories, target: snapshot.target.calories)
        let proteinRatio = Self.ratio(consumed: snapshot.intake.macros.protein, target: snapshot.target.macros.protein)
        let proteinScore = Self.clampedScore(proteinRatio / max(calorieRatio, 0.01))
        let calorieScore = Self.clampedScore(1 - abs(0.58 - calorieRatio))
        let nutrition = Int((Double(proteinScore) * 0.62 + Double(calorieScore) * 0.38).rounded())

        let stepsScore = Self.clampedScore(Double(snapshot.energyOut.steps) / 10_000)
        let energyScore = Self.clampedScore(Double(snapshot.energyOut.activeEnergyKilocalories) / 550)
        let workoutScore = snapshot.energyOut.workoutCount > 0 ? 82 : 58
        let activity = snapshot.energyOut.source == .unavailable
            ? 0
            : Int((Double(stepsScore) * 0.45 + Double(energyScore) * 0.4 + Double(workoutScore) * 0.15).rounded())

        let value: Int
        if snapshot.energyOut.source == .unavailable {
            value = nutrition
        } else {
            value = Int((Double(nutrition) * 0.58 + Double(activity) * 0.42).rounded())
        }

        let headline = value >= 80 ? "Progress is steady" : snapshot.verdict.headline
        let detail = snapshot.energyOut.source == .unavailable
            ? "Nutrition is scored now; activity unlocks when Apple Health is connected."
            : "Weight trend and macro adherence point in the same direction."

        return HealthScore(
            value: value,
            nutrition: nutrition,
            activity: activity,
            recovery: nil,
            headline: headline,
            detail: detail
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

    private static func clampedScore(_ ratio: Double) -> Int {
        Int((min(max(ratio, 0), 1) * 100).rounded())
    }
}

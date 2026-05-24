public struct MacroDaySnapshot: Equatable, Sendable {
    public var target: MacroTarget
    public var intake: MacroIntake
    public var remaining: MacroRemaining
    public var verdict: NutritionVerdict
    public var recommendations: [MacroRecommendation]

    public init(
        target: MacroTarget,
        intake: MacroIntake,
        remaining: MacroRemaining,
        verdict: NutritionVerdict,
        recommendations: [MacroRecommendation]
    ) {
        self.target = target
        self.intake = intake
        self.remaining = remaining
        self.verdict = verdict
        self.recommendations = recommendations
    }

    public static let preview = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 2_100,
            macros: MacroGrams(protein: 150, carbs: 220, fat: 70)
        ),
        intake: MacroIntake(
            calories: 980,
            macros: MacroGrams(protein: 62, carbs: 118, fat: 28)
        ),
        nextMeal: .lunch
    )
}

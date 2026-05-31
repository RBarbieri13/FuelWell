public struct MacroDaySnapshot: Equatable, Sendable {
    public var target: MacroTarget
    public var intake: MacroIntake
    public var remaining: MacroRemaining
    public var energyOut: EnergyOutSnapshot
    public var verdict: NutritionVerdict
    public var recommendations: [MacroRecommendation]

    public init(
        target: MacroTarget,
        intake: MacroIntake,
        remaining: MacroRemaining,
        energyOut: EnergyOutSnapshot = .unavailable,
        verdict: NutritionVerdict,
        recommendations: [MacroRecommendation]
    ) {
        self.target = target
        self.intake = intake
        self.remaining = remaining
        self.energyOut = energyOut
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
        nextMeal: .lunch,
        energyOut: .preview
    )
}

public struct EnergyOutSnapshot: Equatable, Sendable {
    public var activeEnergyKilocalories: Int
    public var restingEnergyEstimateKilocalories: Int
    public var steps: Int
    public var workoutCount: Int
    public var workoutDurationMinutes: Int
    public var source: Source

    public init(
        activeEnergyKilocalories: Int,
        restingEnergyEstimateKilocalories: Int,
        steps: Int,
        workoutCount: Int,
        workoutDurationMinutes: Int,
        source: Source
    ) {
        self.activeEnergyKilocalories = activeEnergyKilocalories
        self.restingEnergyEstimateKilocalories = restingEnergyEstimateKilocalories
        self.steps = steps
        self.workoutCount = workoutCount
        self.workoutDurationMinutes = workoutDurationMinutes
        self.source = source
    }

    public enum Source: Equatable, Sendable {
        case healthKit
        case preview
        case unavailable
    }

    public static let unavailable = EnergyOutSnapshot(
        activeEnergyKilocalories: 0,
        restingEnergyEstimateKilocalories: 0,
        steps: 0,
        workoutCount: 0,
        workoutDurationMinutes: 0,
        source: .unavailable
    )

    public static let preview = EnergyOutSnapshot(
        activeEnergyKilocalories: 540,
        restingEnergyEstimateKilocalories: 670,
        steps: 8_420,
        workoutCount: 1,
        workoutDurationMinutes: 42,
        source: .preview
    )

    public var totalKilocalories: Int {
        self.activeEnergyKilocalories + self.restingEnergyEstimateKilocalories
    }

    public var netCalories: Int {
        self.totalKilocalories
    }
}

public struct HealthScore: Equatable, Sendable {
    public var value: Int
    public var nutrition: Int
    public var activity: Int
    public var recovery: Int?
    public var headline: String
    public var detail: String

    public init(
        value: Int,
        nutrition: Int,
        activity: Int,
        recovery: Int?,
        headline: String,
        detail: String
    ) {
        self.value = value
        self.nutrition = nutrition
        self.activity = activity
        self.recovery = recovery
        self.headline = headline
        self.detail = detail
    }
}

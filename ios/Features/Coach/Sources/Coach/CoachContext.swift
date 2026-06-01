import Core
import Foundation
import HealthKitClient
import NutritionDomain

public struct CoachContext: Equatable, Sendable {
    public var recentMeals: [MealEntry]
    public var macroSnapshot: MacroDaySnapshot
    public var healthSnapshot: HealthSnapshot?
    public var generatedAt: Date
    public var signals: CoachContextSignals

    public init(
        recentMeals: [MealEntry],
        macroSnapshot: MacroDaySnapshot,
        healthSnapshot: HealthSnapshot?,
        generatedAt: Date,
        signals: CoachContextSignals
    ) {
        self.recentMeals = recentMeals
        self.macroSnapshot = macroSnapshot
        self.healthSnapshot = healthSnapshot
        self.generatedAt = generatedAt
        self.signals = signals
    }

    public var summary: String {
        let rawSummary = [
            "Macro verdict: \(self.macroSnapshot.verdict.headline) - \(self.macroSnapshot.verdict.detail)",
            "Remaining: \(self.macroSnapshot.remaining.displayClamped.calories) calories, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.protein)g protein, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.carbs)g carbs, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.fat)g fat.",
            "Signals: \(self.signals.summary)",
            "Recent meals: \(self.recentMealSummary)",
            self.healthSummary
        ]
        .compactMap { $0 }
        .joined(separator: "\n")

        return String(rawSummary.prefix(1_400))
    }

    private var recentMealSummary: String {
        guard !self.recentMeals.isEmpty else {
            return "none logged yet"
        }

        return self.recentMeals
            .prefix(5)
            .map { "\(Self.redacted($0.name)) (\($0.calories) cal, \($0.protein)g protein)" }
            .joined(separator: "; ")
    }

    private var healthSummary: String? {
        guard let healthSnapshot else {
            return "Health: not connected yet."
        }

        let weight = healthSnapshot.bodyMassKilograms.map { ", weight \(Int($0 * 2.20462)) lb" } ?? ""
        return "Health: \(Int(healthSnapshot.steps)) steps, " +
            "\(Int(healthSnapshot.activeEnergyKilocalories)) active calories, " +
            "\(healthSnapshot.workoutCount) workouts\(weight)."
    }

    private static func redacted(_ value: String) -> String {
        let emailRedacted = value
            .split(separator: " ")
            .map { part in
                part.contains("@") ? "[redacted]" : String(part)
            }
            .joined(separator: " ")

        let phonePattern = #"\b\d{3}[-. ]?\d{3}[-. ]?\d{4}\b"#
        return emailRedacted.replacingOccurrences(
            of: phonePattern,
            with: "[redacted]",
            options: .regularExpression
        )
    }
}

public struct CoachContextSignals: Equatable, Sendable {
    public var mealCount: Int
    public var proteinRemaining: Int
    public var activeEnergyKilocalories: Int
    public var workoutCount: Int
    public var hasProteinGap: Bool
    public var hasMovementSignal: Bool

    public init(
        mealCount: Int,
        proteinRemaining: Int,
        activeEnergyKilocalories: Int,
        workoutCount: Int,
        hasProteinGap: Bool,
        hasMovementSignal: Bool
    ) {
        self.mealCount = mealCount
        self.proteinRemaining = proteinRemaining
        self.activeEnergyKilocalories = activeEnergyKilocalories
        self.workoutCount = workoutCount
        self.hasProteinGap = hasProteinGap
        self.hasMovementSignal = hasMovementSignal
    }

    public var summary: String {
        [
            "meals=\(self.mealCount)",
            "protein_gap=\(self.hasProteinGap ? "yes" : "no")",
            "protein_remaining=\(self.proteinRemaining)g",
            "movement=\(self.hasMovementSignal ? "yes" : "no")",
            "active_energy=\(self.activeEnergyKilocalories)",
            "workouts=\(self.workoutCount)"
        ]
        .joined(separator: ", ")
    }
}

public enum CoachContextBuilder {
    public static func build(
        recentMeals: [MealEntry],
        healthSnapshot: HealthSnapshot?,
        generatedAt: Date
    ) -> CoachContext {
        let macroSnapshot = self.snapshot(recentMeals: recentMeals)
        return CoachContext(
            recentMeals: recentMeals,
            macroSnapshot: macroSnapshot,
            healthSnapshot: healthSnapshot,
            generatedAt: generatedAt,
            signals: self.signals(
                recentMeals: recentMeals,
                healthSnapshot: healthSnapshot,
                macroSnapshot: macroSnapshot
            )
        )
    }

    public static func proactiveMacroGapNudge(context: CoachContext) -> ProactiveNudge? {
        guard context.signals.hasProteinGap else {
            return nil
        }

        let body: String
        if context.signals.hasMovementSignal {
            body = "Anchor dinner with protein first; your activity gives the day room."
        } else {
            body = "Anchor dinner with protein first, then take a short walk if dinner feels heavy."
        }

        return ProactiveNudge(
            id: "macro-gap-\(Int(context.generatedAt.timeIntervalSince1970))",
            category: "meal_timing",
            trigger: "protein_gap",
            title: "FuelWell",
            body: body,
            delaySeconds: 1
        )
    }

    private static func snapshot(recentMeals: [MealEntry]) -> MacroDaySnapshot {
        let intake = recentMeals.reduce(
            MacroIntake(calories: 0, macros: MacroGrams(protein: 0, carbs: 0, fat: 0))
        ) { partial, meal in
            MacroIntake(
                calories: partial.calories + meal.calories,
                macros: MacroGrams(
                    protein: partial.macros.protein + meal.protein,
                    carbs: partial.macros.carbs + meal.carbs,
                    fat: partial.macros.fat + meal.fat
                )
            )
        }

        return MacroDecisionEngine.evaluate(
            target: MacroTarget(
                calories: 2_100,
                macros: MacroGrams(protein: 150, carbs: 220, fat: 70)
            ),
            intake: intake,
            nextMeal: .dinner
        )
    }

    private static func signals(
        recentMeals: [MealEntry],
        healthSnapshot: HealthSnapshot?,
        macroSnapshot: MacroDaySnapshot
    ) -> CoachContextSignals {
        let proteinRemaining = macroSnapshot.remaining.displayClamped.macros.protein
        let activeEnergy = Int(healthSnapshot?.activeEnergyKilocalories ?? 0)
        let workoutCount = healthSnapshot?.workoutCount ?? 0

        return CoachContextSignals(
            mealCount: recentMeals.count,
            proteinRemaining: proteinRemaining,
            activeEnergyKilocalories: activeEnergy,
            workoutCount: workoutCount,
            hasProteinGap: proteinRemaining >= 35,
            hasMovementSignal: activeEnergy >= 350 || workoutCount > 0
        )
    }
}

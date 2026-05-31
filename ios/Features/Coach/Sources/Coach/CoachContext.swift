import Core
import Foundation
import HealthKitClient
import NutritionDomain

public struct CoachContext: Equatable, Sendable {
    public var recentMeals: [MealEntry]
    public var macroSnapshot: MacroDaySnapshot
    public var healthSnapshot: HealthSnapshot?
    public var generatedAt: Date

    public init(
        recentMeals: [MealEntry],
        macroSnapshot: MacroDaySnapshot,
        healthSnapshot: HealthSnapshot?,
        generatedAt: Date
    ) {
        self.recentMeals = recentMeals
        self.macroSnapshot = macroSnapshot
        self.healthSnapshot = healthSnapshot
        self.generatedAt = generatedAt
    }

    public var summary: String {
        let rawSummary = [
            "Macro verdict: \(self.macroSnapshot.verdict.headline) - \(self.macroSnapshot.verdict.detail)",
            "Remaining: \(self.macroSnapshot.remaining.displayClamped.calories) calories, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.protein)g protein, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.carbs)g carbs, " +
                "\(self.macroSnapshot.remaining.displayClamped.macros.fat)g fat.",
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
            "\(Int(healthSnapshot.activeEnergyKilocalories)) active calories\(weight)."
    }

    private static func redacted(_ value: String) -> String {
        value
            .split(separator: " ")
            .map { part in
                part.contains("@") ? "[redacted]" : String(part)
            }
            .joined(separator: " ")
    }
}

public enum CoachContextBuilder {
    public static func build(
        recentMeals: [MealEntry],
        healthSnapshot: HealthSnapshot?,
        generatedAt: Date
    ) -> CoachContext {
        CoachContext(
            recentMeals: recentMeals,
            macroSnapshot: self.snapshot(recentMeals: recentMeals),
            healthSnapshot: healthSnapshot,
            generatedAt: generatedAt
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
}

public struct MealPlanGeneratorPlan: Equatable, Sendable {
    public var headline: String
    public var detail: String
    public var slots: [MealPlanSlot]

    public init(headline: String, detail: String, slots: [MealPlanSlot]) {
        self.headline = headline
        self.detail = detail
        self.slots = slots
    }
}

public struct MealPlanSlot: Equatable, Identifiable, Sendable {
    public var title: String
    public var meal: RecipeSuggestion
    public var reason: String

    public init(title: String, meal: RecipeSuggestion, reason: String) {
        self.title = title
        self.meal = meal
        self.reason = reason
    }

    public var id: String { self.title }
}

extension DailyLogFeature.State {
    public var mealPlanGeneratorPlan: MealPlanGeneratorPlan {
        Self.mealPlanGeneratorPlan(recipePlan: self.recipeBrowserPlan)
    }

    public static func mealPlanGeneratorPlan(recipePlan: RecipeBrowserPlan) -> MealPlanGeneratorPlan {
        let suggestions = recipePlan.suggestions
        return MealPlanGeneratorPlan(
            headline: "Plan the next three meals",
            detail: "Use the current macro focus, then log any slot with the same photo-first flow.",
            slots: [
                MealPlanSlot(
                    title: "Next meal",
                    meal: suggestions[0],
                    reason: "Best fit for \(recipePlan.focus)"
                ),
                MealPlanSlot(
                    title: "Backup",
                    meal: suggestions[1],
                    reason: "Simple ingredients and easy portions"
                ),
                MealPlanSlot(
                    title: "Later",
                    meal: suggestions[2],
                    reason: "Keeps dinner flexible without starting over"
                )
            ]
        )
    }
}

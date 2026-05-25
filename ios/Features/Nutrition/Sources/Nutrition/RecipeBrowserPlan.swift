import NutritionDomain

public struct RecipeBrowserPlan: Equatable, Sendable {
    public var headline: String
    public var detail: String
    public var focus: String
    public var suggestions: [RecipeSuggestion]

    public init(
        headline: String,
        detail: String,
        focus: String,
        suggestions: [RecipeSuggestion]
    ) {
        self.headline = headline
        self.detail = detail
        self.focus = focus
        self.suggestions = suggestions
    }
}

public struct RecipeSuggestion: Equatable, Identifiable, Sendable {
    public var title: String
    public var detail: String
    public var calories: Int
    public var protein: Int
    public var carbs: Int
    public var fat: Int

    public init(
        title: String,
        detail: String,
        calories: Int,
        protein: Int,
        carbs: Int,
        fat: Int
    ) {
        self.title = title
        self.detail = detail
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
    }

    public var id: String {
        "\(self.title)-\(self.calories)-\(self.protein)-\(self.carbs)-\(self.fat)"
    }

    public var macroSummary: String {
        "\(self.calories) cal - \(self.protein)P \(self.carbs)C \(self.fat)F"
    }
}

extension DailyLogFeature.State {
    public var recipeBrowserPlan: RecipeBrowserPlan {
        Self.recipeBrowserPlan(snapshot: self.macroSnapshot)
    }

    public static func recipeBrowserPlan(snapshot: MacroDaySnapshot) -> RecipeBrowserPlan {
        let remaining = snapshot.remaining.displayClamped

        if remaining.macros.protein >= 65 {
            return RecipeBrowserPlan(
                headline: "Find a protein anchor",
                detail: "These ideas prioritize protein without making the meal complicated.",
                focus: "\(remaining.macros.protein)g protein left",
                suggestions: Self.proteinAnchorRecipes
            )
        }

        if remaining.calories <= 450 {
            return RecipeBrowserPlan(
                headline: "Keep it light",
                detail: "Choose recipes that add useful protein without crowding the calorie budget.",
                focus: "\(remaining.calories) calories left",
                suggestions: Self.lightRecipes
            )
        }

        return RecipeBrowserPlan(
            headline: "Steady meal ideas",
            detail: "Pick something easy to estimate and repeat when it works.",
            focus: "\(remaining.calories) calories available",
            suggestions: Self.steadyRecipes
        )
    }

    private static var proteinAnchorRecipes: [RecipeSuggestion] {
        [
            .init(
                title: "Chicken rice bowl",
                detail: "Lean chicken, rice, vegetables, salsa or yogurt sauce.",
                calories: 620,
                protein: 52,
                carbs: 64,
                fat: 14
            ),
            .init(
                title: "Turkey egg scramble",
                detail: "Turkey, eggs, spinach, potatoes on the side.",
                calories: 540,
                protein: 48,
                carbs: 38,
                fat: 20
            ),
            .init(
                title: "Greek salmon plate",
                detail: "Salmon, salad, rice, and a measured dressing.",
                calories: 680,
                protein: 46,
                carbs: 58,
                fat: 26
            )
        ]
    }

    private static var lightRecipes: [RecipeSuggestion] {
        [
            .init(
                title: "Tuna cucumber plate",
                detail: "Tuna, cucumber, herbs, light crackers.",
                calories: 330,
                protein: 34,
                carbs: 24,
                fat: 9
            ),
            .init(
                title: "Egg white veggie bowl",
                detail: "Egg whites, vegetables, salsa, small potato.",
                calories: 360,
                protein: 32,
                carbs: 36,
                fat: 7
            ),
            .init(
                title: "Cottage cheese fruit bowl",
                detail: "Cottage cheese, berries, cinnamon, small granola topping.",
                calories: 390,
                protein: 31,
                carbs: 42,
                fat: 8
            )
        ]
    }

    private static var steadyRecipes: [RecipeSuggestion] {
        [
            .init(
                title: "Shrimp taco plate",
                detail: "Shrimp, corn tortillas, slaw, avocado, salsa.",
                calories: 560,
                protein: 40,
                carbs: 58,
                fat: 18
            ),
            .init(
                title: "Lean burger bowl",
                detail: "Lean beef, potatoes, lettuce, tomato, pickles.",
                calories: 650,
                protein: 44,
                carbs: 55,
                fat: 24
            ),
            .init(
                title: "Tofu noodle bowl",
                detail: "Tofu, noodles, vegetables, soy ginger sauce.",
                calories: 590,
                protein: 34,
                carbs: 72,
                fat: 18
            )
        ]
    }
}

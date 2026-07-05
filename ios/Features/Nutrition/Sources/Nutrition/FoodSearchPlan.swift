public struct FoodSearchSuggestion: Equatable, Identifiable, Sendable {
    public var name: String
    public var serving: String
    public var calories: Int
    public var protein: Int
    public var carbs: Int
    public var fat: Int

    public init(name: String, serving: String, calories: Int, protein: Int, carbs: Int, fat: Int) {
        self.name = name
        self.serving = serving
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
    }

    public var id: String {
        "\(self.name)-\(self.serving)"
    }

    public var macroSummary: String {
        "\(self.calories) cal - \(self.protein)P \(self.carbs)C \(self.fat)F"
    }

    public static let defaultSuggestions: [FoodSearchSuggestion] = [
        .init(
            name: "Grilled chicken breast",
            serving: "5 oz cooked",
            calories: 230,
            protein: 44,
            carbs: 0,
            fat: 5
        ),
        .init(name: "Greek yogurt", serving: "1 cup plain", calories: 140, protein: 24, carbs: 8, fat: 0),
        .init(
            name: "Chipotle chicken bowl",
            serving: "half rice, beans, salsa",
            calories: 610,
            protein: 49,
            carbs: 68,
            fat: 16
        )
    ]
}

extension AddMealDraft {
    public static func foodSearch(_ food: FoodSearchSuggestion) -> AddMealDraft {
        AddMealDraft(
            mode: .search,
            name: food.name,
            calories: "\(food.calories)",
            protein: "\(food.protein)",
            carbs: "\(food.carbs)",
            fat: "\(food.fat)"
        )
    }
}

import NutritionDomain

public struct RestaurantGuidancePlan: Equatable, Sendable {
    public var headline: String
    public var detail: String
    public var remainingSummary: String
    public var priorities: [RestaurantGuidanceItem]
    public var menuPatterns: [RestaurantGuidanceItem]

    public init(
        headline: String,
        detail: String,
        remainingSummary: String,
        priorities: [RestaurantGuidanceItem],
        menuPatterns: [RestaurantGuidanceItem]
    ) {
        self.headline = headline
        self.detail = detail
        self.remainingSummary = remainingSummary
        self.priorities = priorities
        self.menuPatterns = menuPatterns
    }
}

public struct RestaurantGuidanceItem: Equatable, Identifiable, Sendable {
    public var title: String
    public var detail: String

    public init(title: String, detail: String) {
        self.title = title
        self.detail = detail
    }

    public var id: String {
        "\(self.title)-\(self.detail)"
    }
}

extension DailyLogFeature.State {
    public var restaurantGuidance: RestaurantGuidancePlan {
        Self.restaurantGuidance(snapshot: self.macroSnapshot)
    }

    public static func restaurantGuidance(snapshot: MacroDaySnapshot) -> RestaurantGuidancePlan {
        let remaining = snapshot.remaining.displayClamped

        switch snapshot.verdict.tone {
        case .rebalance:
            return RestaurantGuidancePlan(
                headline: "Go lean and protein-forward",
                detail: "Keep the order simple, light on sauces, and easy to log afterward.",
                remainingSummary: "\(remaining.macros.protein)g protein left",
                priorities: [
                    .init(title: "Grilled protein", detail: "Chicken, fish, shrimp, steak, tofu, or eggs."),
                    .init(title: "Vegetables first", detail: "Use greens or roasted vegetables as the base."),
                    .init(
                        title: "Sauce on the side",
                        detail: "Avoid turning a good order into a hidden-calorie order."
                    )
                ],
                menuPatterns: [
                    .init(title: "Bowl", detail: "Double protein, greens, salsa, light starch."),
                    .init(title: "Plate", detail: "Protein entree, vegetables, skip fried sides."),
                    .init(title: "Salad", detail: "Add real protein and keep dressing measured.")
                ]
            )

        case .needsFuel:
            return RestaurantGuidancePlan(
                headline: "Anchor the order with protein",
                detail: "You have room to eat. Build the meal around protein, then add carbs as needed.",
                remainingSummary: "\(remaining.calories) calories left",
                priorities: [
                    .init(title: "Protein anchor", detail: "Choose the entree by protein source first."),
                    .init(
                        title: "Useful carbs",
                        detail: "Rice, potatoes, bread, or fruit can carry the next block."
                    ),
                    .init(title: "Photo log first", detail: "Capture the plate before adjusting details.")
                ],
                menuPatterns: [
                    .init(title: "Fast casual", detail: "Bowl with protein, rice, beans, vegetables."),
                    .init(title: "Diner", detail: "Eggs or lean meat, potatoes, fruit."),
                    .init(title: "Sandwich", detail: "Lean protein sandwich plus a simple side.")
                ]
            )

        case .onTrack:
            return RestaurantGuidancePlan(
                headline: "Keep the order steady",
                detail: "Stay close to what already works and avoid making dinner do too much.",
                remainingSummary: "\(remaining.macros.protein)g protein left",
                priorities: [
                    .init(title: "Stay familiar", detail: "Pick a meal you can estimate quickly."),
                    .init(title: "Moderate portions", detail: "Leave room for the rest of the day."),
                    .init(title: "Log while fresh", detail: "Photo first, then clean up macros later.")
                ],
                menuPatterns: [
                    .init(title: "Sushi", detail: "Lean rolls, sashimi, rice in moderation."),
                    .init(title: "Mediterranean", detail: "Protein plate, salad, measured pita or rice."),
                    .init(title: "Mexican", detail: "Bowl or tacos with lean protein and salsa.")
                ]
            )
        }
    }
}

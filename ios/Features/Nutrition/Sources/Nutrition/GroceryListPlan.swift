import NutritionDomain

public struct GroceryListPlan: Equatable, Sendable {
    public var headline: String
    public var detail: String
    public var groups: [GroceryListGroup]

    public init(headline: String, detail: String, groups: [GroceryListGroup]) {
        self.headline = headline
        self.detail = detail
        self.groups = groups
    }
}

public struct GroceryListGroup: Equatable, Identifiable, Sendable {
    public var title: String
    public var items: [GroceryListItem]

    public init(title: String, items: [GroceryListItem]) {
        self.title = title
        self.items = items
    }

    public var id: String { self.title }
}

public struct GroceryListItem: Equatable, Identifiable, Sendable {
    public var name: String
    public var detail: String
    public var isPriority: Bool

    public init(name: String, detail: String, isPriority: Bool = false) {
        self.name = name
        self.detail = detail
        self.isPriority = isPriority
    }

    public var id: String {
        "\(self.name)-\(self.detail)"
    }
}

extension DailyLogFeature.State {
    public var groceryListPlan: GroceryListPlan {
        Self.groceryListPlan(recipePlan: self.recipeBrowserPlan)
    }

    public static func groceryListPlan(recipePlan: RecipeBrowserPlan) -> GroceryListPlan {
        switch recipePlan.headline {
        case "Find a protein anchor":
            return Self.proteinAnchorGroceryPlan
        case "Keep it light":
            return Self.lightGroceryPlan
        default:
            return Self.steadyGroceryPlan
        }
    }

    private static var proteinAnchorGroceryPlan: GroceryListPlan {
        GroceryListPlan(
            headline: "Shop protein first",
            detail: "Start with proteins that can become bowls, scrambles, or plates without extra planning.",
            groups: [
                GroceryListGroup(title: "Protein anchors", items: [
                    GroceryListItem(name: "Chicken breast", detail: "Enough for rice bowls", isPriority: true),
                    GroceryListItem(name: "Lean turkey", detail: "Scrambles or bowls", isPriority: true),
                    GroceryListItem(name: "Salmon fillets", detail: "Greek plate option")
                ]),
                GroceryListGroup(title: "Carbs and bases", items: [
                    GroceryListItem(name: "Rice", detail: "Fast bowl base", isPriority: true),
                    GroceryListItem(name: "Potatoes", detail: "Measured side for scrambles")
                ]),
                GroceryListGroup(title: "Produce and flavor", items: [
                    GroceryListItem(name: "Spinach", detail: "Adds volume to eggs or bowls"),
                    GroceryListItem(name: "Salsa or yogurt sauce", detail: "High-flavor, easy to estimate")
                ])
            ]
        )
    }

    private static var lightGroceryPlan: GroceryListPlan {
        GroceryListPlan(
            headline: "Build a light backup list",
            detail: "Keep low-friction options ready for days when calories are tighter than protein.",
            groups: [
                GroceryListGroup(title: "Lean proteins", items: [
                    GroceryListItem(name: "Tuna packets", detail: "Shelf-stable plate anchor", isPriority: true),
                    GroceryListItem(name: "Egg whites", detail: "Fast protein without much fat", isPriority: true),
                    GroceryListItem(name: "Cottage cheese", detail: "No-cook protein option")
                ]),
                GroceryListGroup(title: "Light bases", items: [
                    GroceryListItem(name: "Cucumbers", detail: "Crunch and volume"),
                    GroceryListItem(name: "Berries", detail: "For cottage cheese bowls"),
                    GroceryListItem(name: "Small potatoes", detail: "Simple measured carbs")
                ]),
                GroceryListGroup(title: "Flavor and prep", items: [
                    GroceryListItem(name: "Herbs", detail: "Keeps tuna plates from feeling flat"),
                    GroceryListItem(name: "Salsa", detail: "Useful across egg and potato meals")
                ])
            ]
        )
    }

    private static var steadyGroceryPlan: GroceryListPlan {
        GroceryListPlan(
            headline: "Stock steady repeat meals",
            detail: "Buy ingredients that can become repeatable meals with macros you can estimate quickly.",
            groups: [
                GroceryListGroup(title: "Protein anchors", items: [
                    GroceryListItem(name: "Shrimp", detail: "Taco plate protein", isPriority: true),
                    GroceryListItem(name: "Lean beef", detail: "Burger bowl anchor", isPriority: true),
                    GroceryListItem(name: "Tofu", detail: "Noodle bowl option")
                ]),
                GroceryListGroup(title: "Carbs and bases", items: [
                    GroceryListItem(name: "Corn tortillas", detail: "Shrimp taco plate"),
                    GroceryListItem(name: "Potatoes", detail: "Burger bowl base"),
                    GroceryListItem(name: "Noodles", detail: "Tofu bowl base")
                ]),
                GroceryListGroup(title: "Produce and flavor", items: [
                    GroceryListItem(name: "Slaw mix", detail: "Tacos or burger bowls", isPriority: true),
                    GroceryListItem(name: "Avocado", detail: "Measured fat source"),
                    GroceryListItem(name: "Soy ginger sauce", detail: "Fast tofu bowl flavor")
                ])
            ]
        )
    }
}

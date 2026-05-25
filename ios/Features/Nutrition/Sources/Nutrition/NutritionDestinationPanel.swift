import ComposableArchitecture
import SwiftUI

struct NutritionDestinationPanel: View {
    @Bindable var store: StoreOf<DailyLogFeature>

    var body: some View {
        if let destination = self.store.selectedDestination {
            switch destination {
            case .restaurantGuidance:
                RestaurantGuidanceView(
                    plan: self.store.restaurantGuidance,
                    onLogMeal: { self.store.send(.restaurantGuidanceLogMealTapped) },
                    onDismiss: { self.store.send(.destinationDismissed) }
                )
            case .mealHistory:
                MealHistoryView(
                    entries: self.store.recentEntries,
                    onRepeat: { self.store.send(.mealHistoryRepeatTapped($0)) },
                    onDismiss: { self.store.send(.destinationDismissed) }
                )
            case .recipeBrowser:
                RecipeBrowserView(
                    plan: self.store.recipeBrowserPlan,
                    onChoose: { self.store.send(.recipeBrowserRecipeTapped($0)) },
                    onDismiss: { self.store.send(.destinationDismissed) }
                )
            case .mealPlanGenerator:
                MealPlanGeneratorView(
                    plan: self.store.mealPlanGeneratorPlan,
                    onChoose: { self.store.send(.recipeBrowserRecipeTapped($0)) },
                    onDismiss: { self.store.send(.destinationDismissed) }
                )
            case .groceryList:
                GroceryListView(
                    plan: self.store.groceryListPlan,
                    onLogMeal: { self.store.send(.groceryListLogMealTapped) },
                    onDismiss: { self.store.send(.destinationDismissed) }
                )
            }
        }
    }
}

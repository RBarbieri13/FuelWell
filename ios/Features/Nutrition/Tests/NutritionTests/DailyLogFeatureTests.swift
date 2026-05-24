import ComposableArchitecture
import Core
import Foundation
import Nutrition
import Testing

@MainActor
@Test
func onAppearLoadsEntriesAndRefreshesMacroSnapshot() async {
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let entries = [
        MealEntry(name: "Turkey bowl", calories: 520, protein: 48, carbs: 52, fat: 16, loggedAt: date)
    ]
    let store = TestStore(initialState: DailyLogFeature.State(selectedDate: date)) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = InMemoryNutritionRepository(seed: entries)
    }

    await store.send(.onAppear) {
        $0.isLoading = true
    }
    await store.receive(\.entriesLoaded) {
        $0.isLoading = false
        $0.entries = IdentifiedArray(uniqueElements: entries)
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
    }
}

@MainActor
@Test
func deleteSwipeRemovesOptimisticallyAndUpdatesMacros() async {
    let entry = MealEntry(name: "Chicken", calories: 420, protein: 40, carbs: 20, fat: 18)
    let repository = InMemoryNutritionRepository(seed: [entry])
    let store = TestStore(
        initialState: DailyLogFeature.State(entries: IdentifiedArray(uniqueElements: [entry]))
    ) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = repository
    }

    await store.send(.deleteSwiped(id: entry.id)) {
        $0.entries = []
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
    }
}

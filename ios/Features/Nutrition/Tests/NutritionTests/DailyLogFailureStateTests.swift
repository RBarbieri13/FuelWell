import ComposableArchitecture
import Core
import Foundation
import Nutrition
import Testing

@MainActor
@Test
func saveFailureKeepsOptimisticMealAndSurfacesError() async throws {
    let id = try #require(UUID(uuidString: "1548996D-40AB-4851-A335-1A4BFB42FCA5"))
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let store = TestStore(initialState: DailyLogFeature.State(selectedDate: date)) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = FailingNutritionRepository(failingOperation: .save)
        $0.uuid = .constant(id)
        $0.date.now = date
    }

    await store.send(.addMealNameChanged("Chicken salad")) {
        $0.addMealDraft.name = "Chicken salad"
    }
    await store.send(.addMealCaloriesChanged("480")) {
        $0.addMealDraft.calories = "480"
    }

    let entry = MealEntry(
        id: id,
        name: "Chicken salad",
        calories: 480,
        protein: 0,
        carbs: 0,
        fat: 0,
        loggedAt: date
    )

    await store.send(.saveAddMealTapped) {
        $0.entries = IdentifiedArray(uniqueElements: [entry])
        $0.recentEntries = [entry]
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
        $0.addMealDraft = AddMealDraft()
    }
    await store.receive(.saveAddMealFailed("Save failed")) {
        $0.errorMessage = "Save failed"
    }
}

@MainActor
@Test
func deleteFailureRestoresOptimisticRemoval() async {
    let entry = MealEntry(name: "Chicken", calories: 420, protein: 40, carbs: 20, fat: 18)
    let store = TestStore(
        initialState: DailyLogFeature.State(
            entries: IdentifiedArray(uniqueElements: [entry]),
            recentEntries: [entry]
        )
    ) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = FailingNutritionRepository(failingOperation: .delete)
    }

    await store.send(.deleteSwiped(id: entry.id)) {
        $0.entries = []
        $0.recentEntries = []
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
    }
    await store.receive(.deleteFailed(original: entry)) {
        $0.entries = IdentifiedArray(uniqueElements: [entry])
        $0.recentEntries = [entry]
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
    }
}

private struct FailingNutritionRepository: NutritionRepository {
    enum Operation: Sendable {
        case save
        case delete
    }

    var failingOperation: Operation

    func entries(for date: Date) async throws -> [MealEntry] {
        []
    }

    func recentEntries(limit: Int) async throws -> [MealEntry] {
        []
    }

    func save(_ entry: MealEntry, photoData: Data?) async throws {
        guard self.failingOperation != .save else {
            throw NutritionRepositoryTestError(message: "Save failed")
        }
    }

    func delete(id: MealEntry.ID) async throws {
        guard self.failingOperation != .delete else {
            throw NutritionRepositoryTestError(message: "Delete failed")
        }
    }

    func photoData(for entry: MealEntry) async throws -> Data? {
        nil
    }
}

private struct NutritionRepositoryTestError: LocalizedError, Sendable {
    var message: String

    var errorDescription: String? {
        self.message
    }
}

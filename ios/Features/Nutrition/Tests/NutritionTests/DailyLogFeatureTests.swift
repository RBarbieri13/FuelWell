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

@MainActor
@Test
func addMealFlowDefaultsToPhotoAndSavesEntry() async throws {
    let id = try #require(UUID(uuidString: "A0B2E9D8-DF82-4F62-9EB8-75B4F15F0A10"))
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let repository = InMemoryNutritionRepository()
    let store = TestStore(initialState: DailyLogFeature.State(selectedDate: date)) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = repository
        $0.uuid = .constant(id)
        $0.date.now = date
    }

    await store.send(.addMealTapped) {
        $0.isAddMealPresented = true
        $0.addMealDraft = AddMealDraft()
    }
    await store.send(.addMealNameChanged("Salmon bowl")) {
        $0.addMealDraft.name = "Salmon bowl"
    }
    await store.send(.addMealCaloriesChanged("610")) {
        $0.addMealDraft.calories = "610"
    }
    await store.send(.addMealProteinChanged("44")) {
        $0.addMealDraft.protein = "44"
    }
    await store.send(.addMealCarbsChanged("58")) {
        $0.addMealDraft.carbs = "58"
    }
    await store.send(.addMealFatChanged("20")) {
        $0.addMealDraft.fat = "20"
    }

    let entry = MealEntry(
        id: id,
        name: "Salmon bowl",
        calories: 610,
        protein: 44,
        carbs: 58,
        fat: 20,
        loggedAt: date
    )

    await store.send(.saveAddMealTapped) {
        $0.entries = IdentifiedArray(uniqueElements: [entry])
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
        $0.isAddMealPresented = false
        $0.addMealDraft = AddMealDraft()
    }
    await store.receive(.saveAddMealSucceeded(entry))
}

@MainActor
@Test
func photoCaptureActionsAttachAndClearDraftPhoto() async {
    let photoData = Data([0x01, 0x02, 0x03])
    let importedPhotoData = Data([0x04, 0x05, 0x06])
    let store = TestStore(initialState: DailyLogFeature.State()) {
        DailyLogFeature()
    }

    await store.send(.addMealPhotoButtonTapped) {
        $0.addMealDraft.mode = .photo
        $0.addMealDraft.isCameraPresented = true
    }
    await store.send(.addMealCameraCaptured(photoData)) {
        $0.addMealDraft.mode = .photo
        $0.addMealDraft.photoData = photoData
        $0.addMealDraft.isCameraPresented = false
    }
    await store.send(.addMealPhotoCleared) {
        $0.addMealDraft.photoData = nil
    }
    await store.send(.addMealPhotoLibraryLoaded(importedPhotoData)) {
        $0.addMealDraft.mode = .photo
        $0.addMealDraft.photoData = importedPhotoData
    }
}

@MainActor
@Test
func addMealRequiresNameAndCalories() async {
    let store = TestStore(initialState: DailyLogFeature.State()) {
        DailyLogFeature()
    }

    await store.send(.saveAddMealTapped) {
        $0.errorMessage = "Add a meal name and calories before saving."
    }
}

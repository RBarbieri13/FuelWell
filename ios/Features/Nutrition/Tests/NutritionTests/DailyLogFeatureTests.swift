import ComposableArchitecture
import Core
import Foundation
import Nutrition
import NutritionDomain
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
    await store.receive(.entriesLoaded(entries: entries, recentEntries: entries)) {
        $0.isLoading = false
        $0.entries = IdentifiedArray(uniqueElements: entries)
        $0.recentEntries = entries
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
        $0.recentEntries = []
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
        $0.recentEntries = [entry]
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
        $0.isAddMealPresented = false
        $0.addMealDraft = AddMealDraft()
    }
    await store.receive(.saveAddMealSucceeded(entry))
}

@MainActor
@Test
func addMealWithPhotoKeepsAttachmentReferenceForPersistence() async throws {
    let id = try #require(UUID(uuidString: "9ED1D74C-763E-4452-845B-22C03F566541"))
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let photoData = Data([0x01, 0x02, 0x03])
    let repository = InMemoryNutritionRepository()
    let store = TestStore(initialState: DailyLogFeature.State(selectedDate: date)) {
        DailyLogFeature()
    } withDependencies: {
        $0.nutritionRepository = repository
        $0.uuid = .constant(id)
        $0.date.now = date
    }

    await store.send(.addMealNameChanged("Turkey sandwich")) {
        $0.addMealDraft.name = "Turkey sandwich"
    }
    await store.send(.addMealCaloriesChanged("520")) {
        $0.addMealDraft.calories = "520"
    }
    await store.send(.addMealCameraCaptured(photoData)) {
        $0.addMealDraft.mode = .photo
        $0.addMealDraft.photoData = photoData
        $0.addMealDraft.isCameraPresented = false
    }

    let entry = MealEntry(
        id: id,
        name: "Turkey sandwich",
        calories: 520,
        protein: 0,
        carbs: 0,
        fat: 0,
        loggedAt: date,
        photoAttachmentID: id
    )

    await store.send(.saveAddMealTapped) {
        $0.entries = IdentifiedArray(uniqueElements: [entry])
        $0.recentEntries = [entry]
        $0.macroSnapshot = DailyLogFeature.State.snapshot(entries: $0.entries, target: $0.target)
        $0.addMealDraft = AddMealDraft()
    }
    await store.receive(.saveAddMealSucceeded(entry))

    let savedData = try await repository.photoData(for: entry)
    #expect(savedData == photoData)
}

@MainActor
@Test
func tappingRecentMealPrefillsDraftMacros() async {
    let recent = MealEntry(name: "Chicken bowl", calories: 520, protein: 42, carbs: 48, fat: 18)
    let store = TestStore(initialState: DailyLogFeature.State(recentEntries: [recent])) {
        DailyLogFeature()
    }

    await store.send(.recentMealTapped(recent)) {
        $0.addMealDraft.name = "Chicken bowl"
        $0.addMealDraft.calories = "520"
        $0.addMealDraft.protein = "42"
        $0.addMealDraft.carbs = "48"
        $0.addMealDraft.fat = "18"
    }
}

@MainActor
@Test
func foodSearchSuggestionPrefillsDraftMacros() async {
    let suggestion = FoodSearchSuggestion(
        name: "Greek yogurt",
        serving: "1 cup plain",
        calories: 140,
        protein: 24,
        carbs: 8,
        fat: 0
    )
    let store = TestStore(initialState: DailyLogFeature.State()) {
        DailyLogFeature()
    }

    await store.send(.foodSearchSuggestionTapped(suggestion)) {
        $0.addMealDraft = AddMealDraft.foodSearch(suggestion)
    }
}

@MainActor
@Test
func destinationTappedStoresHubShell() async {
    let store = TestStore(initialState: DailyLogFeature.State()) {
        DailyLogFeature()
    }

    await store.send(.destinationTapped(.restaurantGuidance)) {
        $0.selectedDestination = .restaurantGuidance
    }
}

@MainActor
@Test
func destinationDismissedClearsHubShell() async {
    let store = TestStore(
        initialState: DailyLogFeature.State(selectedDestination: .mealPlanGenerator)
    ) {
        DailyLogFeature()
    }

    await store.send(.destinationDismissed) {
        $0.selectedDestination = nil
    }
}

@MainActor
@Test
func restaurantGuidanceUsesRebalancePlanWhenCaloriesAreOverTarget() {
    let entries = IdentifiedArray(uniqueElements: [
        MealEntry(name: "Big dinner", calories: 2_300, protein: 80, carbs: 260, fat: 95)
    ])
    let target = MacroTarget(calories: 2_100, macros: MacroGrams(protein: 150, carbs: 220, fat: 70))
    let snapshot = DailyLogFeature.State.snapshot(entries: entries, target: target)
    let plan = DailyLogFeature.State.restaurantGuidance(snapshot: snapshot)

    #expect(plan.headline == "Go lean and protein-forward")
    #expect(plan.priorities.map(\.title).contains("Sauce on the side"))
}

@MainActor
@Test
func restaurantGuidanceLogMealOpensPhotoFirstDraft() async {
    let store = TestStore(
        initialState: DailyLogFeature.State(selectedDestination: .restaurantGuidance)
    ) {
        DailyLogFeature()
    }

    await store.send(.restaurantGuidanceLogMealTapped) {
        $0.selectedDestination = nil
        $0.isAddMealPresented = true
        $0.addMealDraft = AddMealDraft(mode: .photo)
    }
}

@MainActor
@Test
func mealHistoryRepeatPrefillsAndOpensPhotoFirstDraft() async {
    let entry = MealEntry(name: "Steak bowl", calories: 640, protein: 52, carbs: 54, fat: 24)
    let store = TestStore(
        initialState: DailyLogFeature.State(selectedDestination: .mealHistory)
    ) {
        DailyLogFeature()
    }

    await store.send(.mealHistoryRepeatTapped(entry)) {
        $0.selectedDestination = nil
        $0.isAddMealPresented = true
        $0.addMealDraft = AddMealDraft.repeating(entry)
    }
}

@MainActor
@Test
func mealHistorySectionsGroupRecentEntriesByDay() {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = TimeZone(secondsFromGMT: 0) ?? .current
    let today = Date(timeIntervalSince1970: 1_714_046_400)
    let yesterday = today.addingTimeInterval(-86_400)
    let entries = [
        MealEntry(name: "Dinner", calories: 700, protein: 45, carbs: 60, fat: 24, loggedAt: today),
        MealEntry(name: "Breakfast", calories: 400, protein: 30, carbs: 40, fat: 12, loggedAt: today),
        MealEntry(name: "Lunch", calories: 520, protein: 42, carbs: 48, fat: 18, loggedAt: yesterday)
    ]

    let sections = MealHistorySection.group(entries: entries, calendar: calendar)

    #expect(sections.count == 2)
    #expect(sections.first?.entries.map(\.name) == ["Dinner", "Breakfast"])
    #expect(sections.last?.entries.map(\.name) == ["Lunch"])
}

@MainActor
@Test
func recipeBrowserPrioritizesProteinWhenProteinRemainingIsHigh() {
    let entries = IdentifiedArray(uniqueElements: [
        MealEntry(name: "Toast", calories: 420, protein: 8, carbs: 70, fat: 10)
    ])
    let target = MacroTarget(calories: 2_100, macros: MacroGrams(protein: 150, carbs: 220, fat: 70))
    let snapshot = DailyLogFeature.State.snapshot(entries: entries, target: target)
    let plan = DailyLogFeature.State.recipeBrowserPlan(snapshot: snapshot)

    #expect(plan.headline == "Find a protein anchor")
    #expect(plan.suggestions.first?.title == "Chicken rice bowl")
}

@MainActor
@Test
func recipeBrowserRecipePrefillsAndOpensPhotoFirstDraft() async {
    let recipe = RecipeSuggestion(
        title: "Shrimp taco plate",
        detail: "Shrimp, corn tortillas, slaw, avocado, salsa.",
        calories: 560,
        protein: 40,
        carbs: 58,
        fat: 18
    )
    let store = TestStore(
        initialState: DailyLogFeature.State(selectedDestination: .recipeBrowser)
    ) {
        DailyLogFeature()
    }

    await store.send(.recipeBrowserRecipeTapped(recipe)) {
        $0.selectedDestination = nil
        $0.isAddMealPresented = true
        $0.addMealDraft = AddMealDraft.recipe(recipe)
    }
}

@MainActor
@Test
func groceryListPlanUsesRecipeFocus() {
    let entries = IdentifiedArray(uniqueElements: [
        MealEntry(name: "Toast", calories: 420, protein: 8, carbs: 70, fat: 10)
    ])
    let target = MacroTarget(calories: 2_100, macros: MacroGrams(protein: 150, carbs: 220, fat: 70))
    let snapshot = DailyLogFeature.State.snapshot(entries: entries, target: target)
    let recipePlan = DailyLogFeature.State.recipeBrowserPlan(snapshot: snapshot)
    let groceryPlan = DailyLogFeature.State.groceryListPlan(recipePlan: recipePlan)

    #expect(groceryPlan.headline == "Shop protein first")
    #expect(groceryPlan.groups.first?.title == "Protein anchors")
    #expect(groceryPlan.groups.first?.items.first?.name == "Chicken breast")
    #expect(groceryPlan.groups.first?.items.first?.isPriority == true)
}

@MainActor
@Test
func groceryListLogMealOpensPhotoFirstDraft() async {
    let store = TestStore(
        initialState: DailyLogFeature.State(selectedDestination: .groceryList)
    ) {
        DailyLogFeature()
    }

    await store.send(.groceryListLogMealTapped) {
        $0.selectedDestination = nil
        $0.isAddMealPresented = true
        $0.addMealDraft = AddMealDraft(mode: .photo)
    }
}

@MainActor
@Test
func mealPlanGeneratorUsesRecipePlanSlots() {
    let recipePlan = DailyLogFeature.State.recipeBrowserPlan(snapshot: .preview)
    let plan = DailyLogFeature.State.mealPlanGeneratorPlan(recipePlan: recipePlan)

    #expect(plan.slots.count == 3)
    #expect(plan.slots.first?.title == "Next meal")
    #expect(plan.slots.first?.meal == recipePlan.suggestions.first)
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

@MainActor
@Test
func addMealDismissalClearsCameraAndPhotoDraftState() async {
    let store = TestStore(
        initialState: DailyLogFeature.State(
            isAddMealPresented: true,
            addMealDraft: AddMealDraft(
                mode: .photo,
                name: "Photo meal",
                calories: "500",
                photoData: Data([0x01]),
                isCameraPresented: true
            )
        )
    ) {
        DailyLogFeature()
    }

    await store.send(.addMealDismissed) {
        $0.isAddMealPresented = false
        $0.addMealDraft = AddMealDraft()
    }
}

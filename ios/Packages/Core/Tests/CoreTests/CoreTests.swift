import Core
import Testing

@Test
func fuelWellIDIsHashable() {
    let identifier = FuelWellID()

    #expect(identifier == identifier)
}

@Test
func inMemoryNutritionRepositoryReturnsEntriesForSelectedDay() async throws {
    let selectedDate = Date(timeIntervalSince1970: 1_714_046_400)
    let nextDate = selectedDate.addingTimeInterval(86_400)
    let repository = InMemoryNutritionRepository(seed: [
        MealEntry(name: "Breakfast", calories: 350, protein: 22, carbs: 42, fat: 9, loggedAt: selectedDate),
        MealEntry(name: "Tomorrow", calories: 500, protein: 35, carbs: 55, fat: 14, loggedAt: nextDate)
    ])

    let entries = try await repository.entries(for: selectedDate)

    #expect(entries.map(\.name) == ["Breakfast"])
}

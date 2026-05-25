import Core
import Foundation
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

@Test
func localNutritionRepositoryPersistsEntriesAndPhotos() async throws {
    let rootURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let repository = LocalNutritionRepository(rootDirectory: rootURL)
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let photoID = try #require(UUID(uuidString: "68807B66-13E0-4848-A66D-19CEAC571840"))
    let entry = MealEntry(
        id: photoID,
        name: "Photo meal",
        calories: 640,
        protein: 45,
        carbs: 62,
        fat: 18,
        loggedAt: date,
        photoAttachmentID: photoID
    )
    let photoData = Data([0x09, 0x08, 0x07])

    try await repository.save(entry, photoData: photoData)

    let reloaded = LocalNutritionRepository(rootDirectory: rootURL)
    let entries = try await reloaded.entries(for: date)
    let recent = try await reloaded.recentEntries(limit: 4)
    let storedPhotoData = try await reloaded.photoData(for: entry)

    #expect(entries == [entry])
    #expect(recent == [entry])
    #expect(storedPhotoData == photoData)

    try await reloaded.delete(id: entry.id)

    #expect(try await reloaded.entries(for: date) == [])
    #expect(try await reloaded.photoData(for: entry) == nil)
}

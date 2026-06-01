import Core
import Foundation
import Persistence
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

@Test
func localNutritionRepositoryImportsLegacyJSONEntriesIntoSQLite() async throws {
    let rootURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let legacyStore = JSONFileStore<[MealEntry]>(
        fileURL: rootURL
            .appendingPathComponent("nutrition", isDirectory: true)
            .appendingPathComponent("meal-entries.json")
    )
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let entry = MealEntry(
        name: "Legacy bowl",
        calories: 520,
        protein: 38,
        carbs: 55,
        fat: 14,
        loggedAt: date
    )

    try legacyStore.save([entry])

    let repository = LocalNutritionRepository(rootDirectory: rootURL)
    let imported = try await repository.entries(for: date)
    let databaseStore = SQLiteDataStore(
        databaseURL: rootURL
            .appendingPathComponent("nutrition", isDirectory: true)
            .appendingPathComponent("fuelwell.sqlite")
    )

    #expect(imported == [entry])
    #expect(try databaseStore.tableExists("meal_entries"))
    #expect(try databaseStore.activeMealEntryCount() == 1)
}

@Test
func localNutritionRepositoryQueuesMealMutationsForSync() async throws {
    let rootURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let repository = LocalNutritionRepository(rootDirectory: rootURL)
    let date = Date(timeIntervalSince1970: 1_714_046_400)
    let entry = MealEntry(
        name: "Queued meal",
        calories: 410,
        protein: 34,
        carbs: 38,
        fat: 11,
        loggedAt: date
    )

    try await repository.save(entry, photoData: nil)
    try await repository.delete(id: entry.id)

    let queue = PendingWriteQueue(
        databaseURL: rootURL
            .appendingPathComponent("nutrition", isDirectory: true)
            .appendingPathComponent("fuelwell.sqlite")
    )
    let writes = try queue.all()

    #expect(writes.map(\.operation) == [.mealLog, .mealLogDelete])
    #expect(writes.map(\.route) == ["meals", "meals"])
}

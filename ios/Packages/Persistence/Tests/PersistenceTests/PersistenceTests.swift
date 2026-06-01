import Foundation
import Persistence
import Testing

@Test
func migrationRunnerCreatesLocalTables() async throws {
    let rootURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let store = SQLiteDataStore(databaseURL: rootURL.appendingPathComponent("fuelwell.sqlite"))
    let runner = MigrationRunner()

    try await runner.migrate(store: store)

    #expect(try store.tableExists("schema_migrations"))
    #expect(try store.tableExists("meal_entries"))
    #expect(try store.tableExists("pending_writes"))
    #expect(try store.tableExists("sync_state"))
}

@Test
func sqliteMealEntryStorePersistsAndSoftDeletesPayloads() throws {
    let rootURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let store = SQLiteDataStore(databaseURL: rootURL.appendingPathComponent("fuelwell.sqlite"))
    let loggedAt = Date(timeIntervalSince1970: 1_714_046_400)

    try store.migrate()
    try store.upsertMealEntry(
        id: "meal-1",
        payloadJSON: #"{"name":"Breakfast"}"#,
        loggedAt: loggedAt
    )

    #expect(try store.activeMealEntryPayloads() == [#"{"name":"Breakfast"}"#])
    #expect(try store.activeMealEntryPayload(id: "meal-1") == #"{"name":"Breakfast"}"#)

    try store.markMealEntryDeleted(id: "meal-1")

    #expect(try store.activeMealEntryPayloads() == [])
}

@Test
func jsonFileStoreRoundTripsCodableModels() throws {
    let fileURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
        .appendingPathComponent("payload.json")
    let store = JSONFileStore<Payload>(fileURL: fileURL)
    let payload = Payload(name: "Meal", count: 2)

    try store.save(payload)

    #expect(try store.load(default: Payload(name: "Default", count: 0)) == payload)
}

@Test
func fileAttachmentStoreRoundTripsAndDeletesData() throws {
    let directoryURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
    let store = FileAttachmentStore(directoryURL: directoryURL)
    let data = Data([0x01, 0x02, 0x03])

    _ = try store.save(data, named: "photo.jpg")

    #expect(try store.load(named: "photo.jpg") == data)

    try store.delete(named: "photo.jpg")

    #expect(try store.load(named: "photo.jpg") == nil)
}

@Test
func pendingWriteQueueEnqueuesInCreatedOrderAndMarksSynced() throws {
    let databaseURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
        .appendingPathComponent("fuelwell.sqlite")
    let queue = PendingWriteQueue(databaseURL: databaseURL)
    let firstID = UUID()
    let secondID = UUID()

    _ = try queue.enqueue(
        PendingWrite(
            id: secondID,
            createdAt: Date(timeIntervalSince1970: 2),
            route: "meals",
            operation: .mealLogDelete,
            payload: #"{"name":"Dinner"}"#
        )
    )
    let writes = try queue.enqueue(
        PendingWrite(
            id: firstID,
            createdAt: Date(timeIntervalSince1970: 1),
            route: "progress",
            operation: .weightEntry,
            payload: #"{"weight":180}"#
        )
    )

    #expect(writes.map(\.id) == [firstID, secondID])
    #expect(try queue.count() == 2)

    let remaining = try queue.markSynced(id: firstID)

    #expect(remaining.map(\.id) == [secondID])
    #expect(try queue.count() == 1)

    let reloadedQueue = PendingWriteQueue(databaseURL: databaseURL)
    #expect(try reloadedQueue.all().map(\.id) == [secondID])

    try reloadedQueue.removeAll()
    #expect(try reloadedQueue.count() == 0)
}

private struct Payload: Codable, Equatable, Sendable {
    let name: String
    let count: Int
}

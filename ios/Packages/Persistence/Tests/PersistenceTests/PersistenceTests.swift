import Foundation
import Persistence
import Testing

@Test
func migrationRunnerAcceptsStore() async throws {
    let store = SQLiteDataStore(databaseURL: URL(fileURLWithPath: "/tmp/fuelwell.sqlite"))
    let runner = MigrationRunner()

    try await runner.migrate(store: store)
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
    let fileURL = FileManager.default.temporaryDirectory
        .appendingPathComponent(UUID().uuidString, isDirectory: true)
        .appendingPathComponent("pending-writes.json")
    let queue = PendingWriteQueue(fileURL: fileURL)
    let firstID = UUID()
    let secondID = UUID()

    _ = try queue.enqueue(
        PendingWrite(
            id: secondID,
            createdAt: Date(timeIntervalSince1970: 2),
            route: "meals",
            operation: .mealLog,
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
}

private struct Payload: Codable, Equatable, Sendable {
    let name: String
    let count: Int
}

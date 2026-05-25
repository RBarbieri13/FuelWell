import Foundation

public struct PendingWrite: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var createdAt: Date
    public var route: String
    public var operation: PendingWriteOperation
    public var payload: String

    public init(
        id: UUID = UUID(),
        createdAt: Date = Date(),
        route: String,
        operation: PendingWriteOperation,
        payload: String
    ) {
        self.id = id
        self.createdAt = createdAt
        self.route = route
        self.operation = operation
        self.payload = payload
    }
}

public enum PendingWriteOperation: String, Codable, Equatable, Sendable {
    case feedback
    case mealLog
    case measurement
    case moodEntry
    case weightEntry
    case workoutSummary
}

public struct PendingWriteQueue: Sendable {
    private let store: JSONFileStore<[PendingWrite]>

    public init(fileURL: URL) {
        self.store = JSONFileStore(fileURL: fileURL)
    }

    public func enqueue(_ write: PendingWrite) throws -> [PendingWrite] {
        var writes = try self.all()
        writes.append(write)
        let sortedWrites = writes.sorted { $0.createdAt < $1.createdAt }
        try self.store.save(sortedWrites)
        return sortedWrites
    }

    public func all() throws -> [PendingWrite] {
        try self.store.load(default: [])
    }

    public func count() throws -> Int {
        try self.all().count
    }

    public func markSynced(id: PendingWrite.ID) throws -> [PendingWrite] {
        var writes = try self.all()
        writes.removeAll { $0.id == id }
        try self.store.save(writes)
        return writes
    }

    public func removeAll() throws {
        try self.store.save([])
    }
}

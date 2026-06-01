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
    case mealLogDelete
    case measurement
    case moodEntry
    case weightEntry
    case workoutSummary
}

public struct MealLogPendingWritePayload: Codable, Equatable, Sendable {
    public var id: UUID
    public var name: String
    public var loggedAt: Date

    public init(id: UUID, name: String, loggedAt: Date) {
        self.id = id
        self.name = name
        self.loggedAt = loggedAt
    }
}

public struct PendingWriteQueue: Sendable {
    private let store: SQLiteDataStore

    public init(fileURL: URL) {
        self.init(databaseURL: fileURL)
    }

    public init(databaseURL: URL) {
        self.store = SQLiteDataStore(databaseURL: databaseURL)
    }

    public func enqueue(_ write: PendingWrite) throws -> [PendingWrite] {
        try self.store.migrate()
        try self.store.upsertPendingWrite(write)
        return try self.all()
    }

    public func all() throws -> [PendingWrite] {
        try self.store.migrate()
        return try self.store.pendingWrites()
    }

    public func count() throws -> Int {
        try self.all().count
    }

    public func markSynced(id: PendingWrite.ID) throws -> [PendingWrite] {
        try self.store.migrate()
        try self.store.markPendingWriteSynced(id: id)
        return try self.all()
    }

    public func removeAll() throws {
        try self.store.migrate()
        try self.store.removeAllPendingWrites()
    }
}

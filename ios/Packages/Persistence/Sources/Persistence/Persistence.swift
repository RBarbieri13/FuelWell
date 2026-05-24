import Foundation

public struct SQLiteDataStore: Sendable {
    public let databaseURL: URL

    public init(databaseURL: URL) {
        self.databaseURL = databaseURL
    }
}

public struct MigrationRunner: Sendable {
    public init() {}

    public func migrate(store: SQLiteDataStore) async throws {
        _ = store
    }
}

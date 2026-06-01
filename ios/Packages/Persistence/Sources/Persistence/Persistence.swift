import Foundation
import SQLite3

public struct SQLiteDataStore: Sendable {
    public let databaseURL: URL

    public init(databaseURL: URL) {
        self.databaseURL = databaseURL
    }

    public func migrate() throws {
        try self.withDatabase { database in
            try Self.execute(database, sql: "pragma journal_mode = WAL;")
            try Self.execute(database, sql: "pragma foreign_keys = ON;")
            try Self.createSchemaMigrationTable(database)
            try Self.createMealEntryTables(database)
            try Self.createPendingWriteTables(database)
            try Self.createSyncStateTables(database)
            try Self.recordInitialMigration(database)
        }
    }

    public func tableExists(_ tableName: String) throws -> Bool {
        try self.withDatabase { database in
            try Self.queryScalar(
                database,
                sql: """
                select count(*) from sqlite_master
                where type = 'table' and name = ?;
                """,
                bindings: [.text(tableName)]
            ).integerValue > 0
        }
    }

    public func upsertMealEntry(
        id: String,
        payloadJSON: String,
        loggedAt: Date,
        now: Date = Date()
    ) throws {
        try self.withDatabase { database in
            try Self.execute(
                database,
                sql: """
                insert into meal_entries (
                    id, payload_json, logged_at, created_at, updated_at, deleted_at
                )
                values (?, ?, ?, ?, ?, null)
                on conflict(id) do update set
                    payload_json = excluded.payload_json,
                    logged_at = excluded.logged_at,
                    updated_at = excluded.updated_at,
                    deleted_at = null;
                """,
                bindings: [
                    .text(id),
                    .text(payloadJSON),
                    .text(Self.timestamp(loggedAt)),
                    .text(Self.timestamp(now)),
                    .text(Self.timestamp(now))
                ]
            )
        }
    }

    public func markMealEntryDeleted(id: String, now: Date = Date()) throws {
        try self.withDatabase { database in
            try Self.execute(
                database,
                sql: """
                update meal_entries
                set deleted_at = ?, updated_at = ?
                where id = ?;
                """,
                bindings: [
                    .text(Self.timestamp(now)),
                    .text(Self.timestamp(now)),
                    .text(id)
                ]
            )
        }
    }

    public func activeMealEntryPayloads() throws -> [String] {
        try self.withDatabase { database in
            try Self.queryStrings(
                database,
                sql: """
                select payload_json from meal_entries
                where deleted_at is null
                order by logged_at asc;
                """
            )
        }
    }

    public func activeMealEntryPayload(id: String) throws -> String? {
        try self.withDatabase { database in
            try Self.queryOptionalString(
                database,
                sql: """
                select payload_json from meal_entries
                where id = ? and deleted_at is null
                limit 1;
                """,
                bindings: [.text(id)]
            )
        }
    }

    public func activeMealEntryCount() throws -> Int {
        try self.withDatabase { database in
            try Int(
                Self.queryScalar(
                    database,
                    sql: "select count(*) from meal_entries where deleted_at is null;"
                ).integerValue
            )
        }
    }

    public func upsertPendingWrite(_ write: PendingWrite) throws {
        try self.withDatabase { database in
            try Self.execute(
                database,
                sql: """
                insert into pending_writes (
                    id, route, operation, payload_json, created_at, synced_at
                )
                values (?, ?, ?, ?, ?, null)
                on conflict(id) do update set
                    route = excluded.route,
                    operation = excluded.operation,
                    payload_json = excluded.payload_json,
                    created_at = excluded.created_at,
                    synced_at = null;
                """,
                bindings: [
                    .text(write.id.uuidString),
                    .text(write.route),
                    .text(write.operation.rawValue),
                    .text(write.payload),
                    .text(Self.timestamp(write.createdAt))
                ]
            )
        }
    }

    public func pendingWrites() throws -> [PendingWrite] {
        try self.withDatabase { database in
            try Self.queryPendingWrites(
                database,
                sql: """
                select id, route, operation, payload_json, created_at
                from pending_writes
                where synced_at is null
                order by created_at asc;
                """
            )
        }
    }

    public func markPendingWriteSynced(id: PendingWrite.ID, now: Date = Date()) throws {
        try self.withDatabase { database in
            try Self.execute(
                database,
                sql: "update pending_writes set synced_at = ? where id = ?;",
                bindings: [
                    .text(Self.timestamp(now)),
                    .text(id.uuidString)
                ]
            )
        }
    }

    public func removeAllPendingWrites() throws {
        try self.withDatabase { database in
            try Self.execute(database, sql: "delete from pending_writes;")
        }
    }
}

extension SQLiteDataStore {
    private func withDatabase<Result>(
        _ operation: (OpaquePointer) throws -> Result
    ) throws -> Result {
        let directory = self.databaseURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )

        var database: OpaquePointer?
        guard sqlite3_open_v2(
            self.databaseURL.path,
            &database,
            SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE | SQLITE_OPEN_FULLMUTEX,
            nil
        ) == SQLITE_OK, let database else {
            let message = database.map(Self.errorMessage(database:)) ?? "SQLite database could not be opened."
            throw SQLiteDataStoreError.openFailed(message)
        }

        defer { sqlite3_close(database) }
        return try operation(database)
    }

    private static func execute(
        _ database: OpaquePointer,
        sql: String,
        bindings: [SQLiteBinding] = []
    ) throws {
        var statement: OpaquePointer?
        try Self.prepare(database, sql: sql, statement: &statement)
        defer { sqlite3_finalize(statement) }
        try Self.bind(bindings, to: statement)

        while true {
            let result = sqlite3_step(statement)
            if result == SQLITE_DONE {
                return
            }
            if result != SQLITE_ROW {
                throw SQLiteDataStoreError.executionFailed(Self.errorMessage(database: database))
            }
        }
    }

    private static func queryStrings(
        _ database: OpaquePointer,
        sql: String,
        bindings: [SQLiteBinding] = []
    ) throws -> [String] {
        var statement: OpaquePointer?
        try Self.prepare(database, sql: sql, statement: &statement)
        defer { sqlite3_finalize(statement) }
        try Self.bind(bindings, to: statement)

        var rows: [String] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            if let value = sqlite3_column_text(statement, 0) {
                rows.append(String(cString: value))
            }
        }
        return rows
    }

    private static func queryOptionalString(
        _ database: OpaquePointer,
        sql: String,
        bindings: [SQLiteBinding] = []
    ) throws -> String? {
        var statement: OpaquePointer?
        try Self.prepare(database, sql: sql, statement: &statement)
        defer { sqlite3_finalize(statement) }
        try Self.bind(bindings, to: statement)

        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
        guard let value = sqlite3_column_text(statement, 0) else { return nil }
        return String(cString: value)
    }

    private static func queryPendingWrites(
        _ database: OpaquePointer,
        sql: String,
        bindings: [SQLiteBinding] = []
    ) throws -> [PendingWrite] {
        var statement: OpaquePointer?
        try Self.prepare(database, sql: sql, statement: &statement)
        defer { sqlite3_finalize(statement) }
        try Self.bind(bindings, to: statement)

        var rows: [PendingWrite] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            rows.append(
                PendingWrite(
                    id: try Self.uuid(statement, column: 0),
                    createdAt: try Self.date(statement, column: 4),
                    route: try Self.string(statement, column: 1),
                    operation: try Self.operation(statement, column: 2),
                    payload: try Self.string(statement, column: 3)
                )
            )
        }
        return rows
    }

    private static func queryScalar(
        _ database: OpaquePointer,
        sql: String,
        bindings: [SQLiteBinding] = []
    ) throws -> SQLiteScalar {
        var statement: OpaquePointer?
        try Self.prepare(database, sql: sql, statement: &statement)
        defer { sqlite3_finalize(statement) }
        try Self.bind(bindings, to: statement)

        guard sqlite3_step(statement) == SQLITE_ROW else {
            throw SQLiteDataStoreError.executionFailed("SQLite scalar query returned no rows.")
        }

        return SQLiteScalar(integerValue: sqlite3_column_int64(statement, 0))
    }

    private static func prepare(
        _ database: OpaquePointer,
        sql: String,
        statement: inout OpaquePointer?
    ) throws {
        guard sqlite3_prepare_v2(database, sql, -1, &statement, nil) == SQLITE_OK else {
            throw SQLiteDataStoreError.executionFailed(Self.errorMessage(database: database))
        }
    }

    private static func bind(
        _ bindings: [SQLiteBinding],
        to statement: OpaquePointer?
    ) throws {
        for (offset, binding) in bindings.enumerated() {
            let index = Int32(offset + 1)
            let result: Int32
            switch binding {
            case .text(let value):
                result = sqlite3_bind_text(statement, index, value, -1, Self.sqliteTransient)
            case .null:
                result = sqlite3_bind_null(statement, index)
            }

            guard result == SQLITE_OK else {
                throw SQLiteDataStoreError.executionFailed("SQLite binding failed.")
            }
        }
    }

    private static func errorMessage(database: OpaquePointer) -> String {
        guard let message = sqlite3_errmsg(database) else {
            return "Unknown SQLite error."
        }
        return String(cString: message)
    }

    private static func timestamp(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.string(from: date)
    }

    private static func string(_ statement: OpaquePointer?, column: Int32) throws -> String {
        guard let value = sqlite3_column_text(statement, column) else {
            throw SQLiteDataStoreError.executionFailed("SQLite column was not text.")
        }
        return String(cString: value)
    }

    private static func uuid(_ statement: OpaquePointer?, column: Int32) throws -> UUID {
        guard let uuid = UUID(uuidString: try Self.string(statement, column: column)) else {
            throw SQLiteDataStoreError.executionFailed("SQLite column was not a UUID.")
        }
        return uuid
    }

    private static func operation(
        _ statement: OpaquePointer?,
        column: Int32
    ) throws -> PendingWriteOperation {
        guard let operation = PendingWriteOperation(rawValue: try Self.string(statement, column: column)) else {
            throw SQLiteDataStoreError.executionFailed("SQLite column was not a pending write operation.")
        }
        return operation
    }

    private static func date(_ statement: OpaquePointer?, column: Int32) throws -> Date {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: try Self.string(statement, column: column)) else {
            throw SQLiteDataStoreError.executionFailed("SQLite column was not an ISO8601 date.")
        }
        return date
    }

    private static func createSchemaMigrationTable(_ database: OpaquePointer) throws {
        try Self.execute(
            database,
            sql: """
            create table if not exists schema_migrations (
                version integer primary key,
                name text not null,
                applied_at text not null
            );
            """
        )
    }

    private static func createMealEntryTables(_ database: OpaquePointer) throws {
        try Self.execute(
            database,
            sql: """
            create table if not exists meal_entries (
                id text primary key,
                payload_json text not null,
                logged_at text not null,
                created_at text not null,
                updated_at text not null,
                deleted_at text
            );
            """
        )
        try Self.execute(
            database,
            sql: """
            create index if not exists meal_entries_logged_at_idx
            on meal_entries (logged_at, deleted_at);
            """
        )
    }

    private static func createPendingWriteTables(_ database: OpaquePointer) throws {
        try Self.execute(
            database,
            sql: """
            create table if not exists pending_writes (
                id text primary key,
                route text not null,
                operation text not null,
                payload_json text not null,
                created_at text not null,
                synced_at text
            );
            """
        )
        try Self.execute(
            database,
            sql: """
            create index if not exists pending_writes_created_at_idx
            on pending_writes (created_at, synced_at);
            """
        )
    }

    private static func createSyncStateTables(_ database: OpaquePointer) throws {
        try Self.execute(
            database,
            sql: """
            create table if not exists sync_state (
                scope text primary key,
                cursor text,
                updated_at text not null
            );
            """
        )
    }

    private static func recordInitialMigration(_ database: OpaquePointer) throws {
        try Self.execute(
            database,
            sql: """
            insert or ignore into schema_migrations (version, name, applied_at)
            values (1, 'local persistence foundation', ?);
            """,
            bindings: [.text(Self.timestamp(Date()))]
        )
    }

    private static let sqliteTransient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
}

public struct MigrationRunner: Sendable {
    public init() {}

    public func migrate(store: SQLiteDataStore) async throws {
        try store.migrate()
    }
}

public enum SQLiteDataStoreError: Error, Equatable, Sendable {
    case openFailed(String)
    case executionFailed(String)
}

private enum SQLiteBinding: Sendable {
    case text(String)
    case null
}

private struct SQLiteScalar: Sendable {
    var integerValue: Int64
}

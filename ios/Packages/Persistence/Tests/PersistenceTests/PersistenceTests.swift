import Foundation
import Persistence
import Testing

@Test
func migrationRunnerAcceptsStore() async throws {
    let store = SQLiteDataStore(databaseURL: URL(fileURLWithPath: "/tmp/fuelwell.sqlite"))
    let runner = MigrationRunner()

    try await runner.migrate(store: store)
}

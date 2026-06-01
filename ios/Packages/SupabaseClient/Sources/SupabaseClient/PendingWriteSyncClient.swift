import Foundation
import Persistence

public struct PendingWriteSyncResult: Equatable, Sendable {
    public var attempted: Int
    public var synced: Int
    public var skipped: Int

    public init(attempted: Int = 0, synced: Int = 0, skipped: Int = 0) {
        self.attempted = attempted
        self.synced = synced
        self.skipped = skipped
    }
}

public struct PendingWriteSyncClient: Sendable {
    public var flush: @Sendable () async throws -> PendingWriteSyncResult

    public init(flush: @escaping @Sendable () async throws -> PendingWriteSyncResult) {
        self.flush = flush
    }

    public static func live(
        queue: PendingWriteQueue,
        database: SupabaseDatabaseClient = .liveValue
    ) -> PendingWriteSyncClient {
        PendingWriteSyncClient {
            let user = try await database.currentUser()
            guard let user else {
                throw SupabaseClientError.invalidCredentials
            }

            var result = PendingWriteSyncResult()
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601

            for write in try queue.all() {
                result.attempted += 1

                switch write.operation {
                case .mealLog:
                    let payload = try decoder.decode(
                        MealLogPendingWritePayload.self,
                        from: Data(write.payload.utf8)
                    )
                    _ = try await database.insertMeal(
                        MealRecord(
                            id: payload.id,
                            userID: user.id,
                            name: payload.name,
                            loggedAt: payload.loggedAt
                        )
                    )
                    _ = try queue.markSynced(id: write.id)
                    result.synced += 1
                case .feedback, .mealLogDelete, .measurement, .moodEntry, .weightEntry, .workoutSummary:
                    result.skipped += 1
                }
            }

            return result
        }
    }
}

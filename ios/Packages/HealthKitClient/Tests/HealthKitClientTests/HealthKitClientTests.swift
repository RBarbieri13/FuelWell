import Foundation
import HealthKitClient
import Testing

@Test
func stubReturnsConfiguredSnapshot() async throws {
    let fetchedAt = Date(timeIntervalSince1970: 100)
    let client = HealthKitClient.stub(
        snapshot: HealthSnapshot(
            steps: 1_500,
            activeEnergyKilocalories: 120,
            workoutCount: 1,
            workoutDurationMinutes: 38,
            fetchedAt: fetchedAt
        )
    )

    let authorized = try await client.requestReadAuthorization()
    let snapshot = try await client.todaySnapshot()

    #expect(authorized)
    #expect(snapshot.steps == 1_500)
    #expect(snapshot.workoutCount == 1)
    #expect(snapshot.workoutDurationMinutes == 38)
    #expect(snapshot.fetchedAt == fetchedAt)
}

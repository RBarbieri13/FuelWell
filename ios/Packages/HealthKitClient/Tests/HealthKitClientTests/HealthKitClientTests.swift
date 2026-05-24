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
            fetchedAt: fetchedAt
        )
    )

    let authorized = try await client.requestReadAuthorization()
    let snapshot = try await client.todaySnapshot()

    #expect(authorized)
    #expect(snapshot.steps == 1_500)
    #expect(snapshot.fetchedAt == fetchedAt)
}

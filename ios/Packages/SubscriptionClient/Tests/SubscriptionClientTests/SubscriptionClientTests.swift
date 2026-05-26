import Foundation
import SubscriptionClient
import Testing

@Test
func founding100ReservationsHonorHardCap() async throws {
    let existing = (1...Founding100Reservation.hardCap).map { position in
        Founding100Reservation(
            userID: UUID(),
            email: "founder\(position)@fuelwell.app",
            position: position
        )
    }
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: existing)

    await #expect(throws: SubscriptionClientError.founding100SoldOut) {
        _ = try await client.reserveFounding100(UUID(), "late@fuelwell.app")
    }
}

@Test
func founding100ReservationGrantsLifetimePremiumAccess() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    let reservation = try await client.reserveFounding100(userID, "founder@fuelwell.app")
    let link = try await client.linkMarketingSignup(
        AccountLinkRequest(userID: userID, email: "Founder@FuelWell.app", source: "founders-100")
    )
    let status = try await client.status(userID)

    #expect(reservation.position == 1)
    #expect(reservation.isWithinHardCap)
    #expect(link.email == "founder@fuelwell.app")
    #expect(link.founding100Position == 1)
    #expect(status.tier == .founding100Lifetime)
    #expect(status.canAccess(.workoutPlans))
}

@Test
func founding100ReservationIsIdempotentPerUser() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    let firstReservation = try await client.reserveFounding100(userID, "first@fuelwell.app")
    let updatedReservation = try await client.reserveFounding100(userID, "updated@fuelwell.app")

    #expect(updatedReservation.id == firstReservation.id)
    #expect(updatedReservation.position == firstReservation.position)
    #expect(updatedReservation.email == "updated@fuelwell.app")
}

@Test
func founding100ReservationRejectsInvalidEmail() async throws {
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    await #expect(throws: SubscriptionClientError.invalidEmail) {
        _ = try await client.reserveFounding100(UUID(), "not-an-email")
    }
}

@Test
func proAndPremiumGateFeaturesDifferently() {
    let userID = UUID()
    let pro = SubscriptionStatus(userID: userID, tier: .pro, isActive: true)
    let premium = SubscriptionStatus(userID: userID, tier: .premium, isActive: true)
    let inactive = SubscriptionStatus(userID: userID, tier: .premium, isActive: false)

    #expect(pro.canAccess(.restaurantGuidance))
    #expect(!pro.canAccess(.workoutPlans))
    #expect(premium.canAccess(.workoutPlans))
    #expect(!inactive.canAccess(.coachChat))
}

@Test
func providerReceiptValidationRecordsAuditEvent() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    let status = try await client.validateProviderReceipt(
        userID,
        ProviderReceipt(
            provider: .revenueCat,
            environment: .sandbox,
            receiptToken: "revenue-cat-token",
            productID: ProductIdentifiers.defaults.premiumMonthly
        )
    )
    let events = try await client.validationEvents(userID)

    #expect(status.tier == .premium)
    #expect(events.count == 1)
    #expect(events.first?.provider == .revenueCat)
    #expect(events.first?.productID == ProductIdentifiers.defaults.premiumMonthly)
}

@Test
func receiptValidationRejectsBlankReceiptsAndGrantsPremium() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    await #expect(throws: SubscriptionClientError.invalidReceipt) {
        _ = try await client.validateReceipt(userID, " ")
    }

    let status = try await client.validateReceipt(userID, "receipt-token")

    #expect(status.tier == .premium)
    #expect(status.productID == ProductIdentifiers.defaults.premiumMonthly)
}

@Test
func liveClientReadsEntitlementStatusFromSupabase() async throws {
    SubscriptionURLProtocol.reset(
        responses: [
            Data(
                #"""
                [
                  {
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "tier": "premium",
                    "is_active": true,
                    "product_id": "fuelwell.premium.monthly",
                    "expires_at": null,
                    "validated_at": "2026-05-26T00:00:00Z"
                  }
                ]
                """#.utf8
            )
        ]
    )

    let userID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    let client = try liveTestClient()
    let status = try await client.status(userID)
    let request = try #require(SubscriptionURLProtocol.requests.first)

    #expect(status.tier == .premium)
    #expect(status.productID == "fuelwell.premium.monthly")
    #expect(request.url?.path == "/rest/v1/subscription_entitlements")
    #expect(request.url?.query?.contains("user_id=eq.00000000-0000-0000-0000-000000000001") == true)
    #expect(request.value(forHTTPHeaderField: "apikey") == "anon-test-key")
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token")
}

@Test
func liveClientReservesAndLinksFounding100ViaRPC() async throws {
    SubscriptionURLProtocol.reset(
        responses: [
            Data(
                #"""
                {
                  "id": "00000000-0000-0000-0000-000000000100",
                  "user_id": "00000000-0000-0000-0000-000000000001",
                  "email": "founder@fuelwell.app",
                  "position": 12,
                  "reserved_at": "2026-05-26T00:00:00Z"
                }
                """#.utf8
            ),
            Data(
                #"""
                [
                  {
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "email": "founder@fuelwell.app",
                    "source": "founders-100",
                    "linked_at": "2026-05-26T00:00:00Z",
                    "founding100_position": 12
                  }
                ]
                """#.utf8
            )
        ]
    )

    let userID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    let client = try liveTestClient()

    let reservation = try await client.reserveFounding100(userID, "founder@fuelwell.app")
    let link = try await client.linkMarketingSignup(
        AccountLinkRequest(userID: userID, email: "founder@fuelwell.app", source: "ios_account")
    )
    let requests = SubscriptionURLProtocol.requests

    #expect(reservation.position == 12)
    #expect(link.founding100Position == 12)
    #expect(requests.map { $0.httpMethod } == ["POST", "POST"])
    #expect(requests.map { $0.url?.path } == [
        "/rest/v1/rpc/reserve_founding100",
        "/rest/v1/rpc/link_marketing_signup_to_user"
    ])
    #expect(requests.allSatisfy { $0.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token" })
    #expect(requests.allSatisfy { $0.value(forHTTPHeaderField: "apikey") == "anon-test-key" })
}

@Test
func liveClientRequiresAuthenticatedTokenForMutatingRPC() async throws {
    let configuration = SubscriptionConfiguration(
        projectURL: try #require(URL(string: "https://fuelwell.test")),
        anonKey: "anon-test-key"
    )
    let client = SubscriptionClient.live(configuration: configuration)

    await #expect(throws: SubscriptionClientError.missingConfiguration) {
        _ = try await client.reserveFounding100(UUID(), "founder@fuelwell.app")
    }
}

@Test
func liveClientReadsValidationEvents() async throws {
    SubscriptionURLProtocol.reset(
        responses: [
            Data(
                #"""
                [
                  {
                    "id": "00000000-0000-0000-0000-000000000200",
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "provider": "revenue_cat",
                    "product_id": "fuelwell.premium.monthly",
                    "environment": "sandbox",
                    "entitlement_tier": "premium",
                    "validated_at": "2026-05-26T00:00:00Z"
                  }
                ]
                """#.utf8
            )
        ]
    )

    let userID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    let client = try liveTestClient()
    let events = try await client.validationEvents(
        userID
    )
    let request = try #require(SubscriptionURLProtocol.requests.first)

    #expect(events.count == 1)
    #expect(events.first?.provider == .revenueCat)
    #expect(events.first?.status == .premium)
    #expect(request.url?.path == "/rest/v1/subscription_validation_events")
    #expect(request.url?.query?.contains("order=validated_at.desc") == true)
}

private func liveTestClient() throws -> SubscriptionClient {
    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [SubscriptionURLProtocol.self]

    return SubscriptionClient.live(
        configuration: SubscriptionConfiguration(
            projectURL: try #require(URL(string: "https://fuelwell.test")),
            anonKey: "anon-test-key",
            accessToken: "user-access-token"
        ),
        session: URLSession(configuration: sessionConfiguration)
    )
}

private final class SubscriptionURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseQueue: [Data] = []
    nonisolated(unsafe) static var requests: [URLRequest] = []

    static func reset(responses: [Data]) {
        self.responseQueue = responses
        self.requests = []
    }

    override static func canInit(with request: URLRequest) -> Bool {
        true
    }

    override static func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        Self.requests.append(self.request)

        guard
            let url = self.request.url,
            let response = HTTPURLResponse(
                url: url,
                statusCode: 200,
                httpVersion: nil,
                headerFields: ["Content-Type": "application/json"]
            )
        else {
            self.client?.urlProtocol(self, didFailWithError: URLError(.badURL))
            return
        }

        let data = Self.responseQueue.isEmpty ? Data("{}".utf8) : Self.responseQueue.removeFirst()
        self.client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        self.client?.urlProtocol(self, didLoad: data)
        self.client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

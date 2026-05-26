import Foundation
import SupabaseClient
import Testing

@Test
func inMemoryClientRoundTripsProfileAndMeal() async throws {
    let userID = UUID()
    let client = SupabaseDatabaseClient.inMemory(user: SupabaseUser(id: userID, email: "test@fuelwell.app"))

    let user = try await client.currentUser()
    let profile = try await client.upsertProfile(Profile(id: userID, displayName: "Jordan", goal: "recomp"))
    let fetchedProfile = try await client.fetchProfile(userID)
    let meal = try await client.insertMeal(
        MealRecord(userID: userID, name: "Oats", loggedAt: Date(timeIntervalSince1970: 0))
    )

    #expect(user?.id == userID)
    #expect(profile.displayName == "Jordan")
    #expect(fetchedProfile == profile)
    #expect(meal.name == "Oats")
}

@Test
func inMemoryClientAcceptsFeedbackReports() async throws {
    let userID = UUID()
    let client = SupabaseDatabaseClient.inMemory(user: SupabaseUser(id: userID, email: "test@fuelwell.app"))

    let report = FeedbackReport(
        userID: userID,
        route: "help",
        message: "The meal logger needs clearer copy.",
        appVersion: "1.0.0",
        metadata: ["surface": "help"]
    )

    let submitted = try await client.submitFeedback(report)

    #expect(submitted.userID == userID)
    #expect(submitted.route == "help")
    #expect(submitted.message == "The meal logger needs clearer copy.")
    #expect(submitted.metadata["surface"] == "help")
}

@Test
func featureFlagConstantReadsKnownFlags() async throws {
    let flags = FeatureFlagClient.constant([
        FeatureFlag(name: "ai_meal_plan", enabled: false)
    ])

    let enabled = try await flags.isEnabled("ai_meal_plan")
    let missing = try await flags.isEnabled("missing")

    #expect(enabled == false)
    #expect(missing == false)
}

@Test
func liveFeatureFlagClientFetchesSupabaseRows() async throws {
    FeatureFlagURLProtocol.reset(
        data: Data(
            #"""
            [
              {
                "name": "ai_meal_plan",
                "enabled": false,
                "description": "Staging drill flag"
              }
            ]
            """#.utf8
        )
    )

    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [FeatureFlagURLProtocol.self]

    let client = FeatureFlagClient.live(
        configuration: SupabaseConfiguration(
            projectURL: try #require(URL(string: "https://fuelwell.test")),
            anonKey: "anon-test-key"
        ),
        ttl: 30,
        session: URLSession(configuration: sessionConfiguration)
    )

    let enabled = try await client.isEnabled("ai_meal_plan")
    let requests = FeatureFlagURLProtocol.requests

    #expect(enabled == false)
    #expect(requests.count == 1)
    #expect(requests.first?.url?.path == "/rest/v1/feature_flags")
    #expect(requests.first?.url?.query == "select=*")
    #expect(requests.first?.value(forHTTPHeaderField: "apikey") == "anon-test-key")
    #expect(requests.first?.value(forHTTPHeaderField: "Authorization") == "Bearer anon-test-key")
}

@Test
func liveFeatureFlagClientUsesCacheWithinTTL() async throws {
    FeatureFlagURLProtocol.reset(
        data: Data(#"[{"name":"ai_meal_plan","enabled":true}]"#.utf8)
    )

    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [FeatureFlagURLProtocol.self]

    let client = FeatureFlagClient.live(
        configuration: SupabaseConfiguration(
            projectURL: try #require(URL(string: "https://fuelwell.test")),
            anonKey: "anon-test-key"
        ),
        ttl: 30,
        session: URLSession(configuration: sessionConfiguration)
    )

    let firstRead = try await client.isEnabled("ai_meal_plan")
    let secondRead = try await client.isEnabled("ai_meal_plan")

    #expect(firstRead == true)
    #expect(secondRead == true)
    #expect(FeatureFlagURLProtocol.requests.count == 1)
}

private final class FeatureFlagURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseData = Data()
    nonisolated(unsafe) static var requests: [URLRequest] = []

    static func reset(data: Data) {
        self.responseData = data
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

        self.client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        self.client?.urlProtocol(self, didLoad: Self.responseData)
        self.client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

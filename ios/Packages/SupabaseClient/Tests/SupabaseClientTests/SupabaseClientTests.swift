import Foundation
import SupabaseClient
import Testing

@Suite(.serialized)
struct SupabaseClientTests {
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
func inMemoryAuthClientSignsUpAndDeletesAccount() async throws {
    let client = SupabaseAuthClient.inMemory(session: nil)

    let session = try await client.signUp("founder@fuelwell.app", "correct-horse")
    let restored = try await client.currentSession()

    #expect(session.user.email == "founder@fuelwell.app")
    #expect(restored?.user.email == "founder@fuelwell.app")

    try await client.deleteAccount()
    #expect(try await client.currentSession() == nil)
}

@Test
func liveAuthClientUsesSupabasePasswordEndpoints() async throws {
    SupabaseAuthURLProtocol.reset(
        responses: [
            Data(
                #"""
                {
                  "access_token": "access-token",
                  "refresh_token": "refresh-token",
                  "expires_in": 3600,
                  "user": {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "email": "founder@fuelwell.app"
                  }
                }
                """#.utf8
            )
        ]
    )

    let client = try liveAuthTestClient(accessToken: nil)
    let session = try await client.signUp("founder@fuelwell.app", "correct-horse")
    let request = try #require(SupabaseAuthURLProtocol.requests.first)

    #expect(session.user.email == "founder@fuelwell.app")
    #expect(session.accessToken == "access-token")
    #expect(request.url?.path == "/auth/v1/signup")
    #expect(request.value(forHTTPHeaderField: "apikey") == "anon-test-key")
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer anon-test-key")
}

@Test
func liveAuthClientRestoresConfiguredAccessToken() async throws {
    SupabaseAuthURLProtocol.reset(
        responses: [
            Data(
                #"""
                {
                  "id": "00000000-0000-0000-0000-000000000001",
                  "email": "founder@fuelwell.app"
                }
                """#.utf8
            )
        ]
    )

    let client = try liveAuthTestClient(accessToken: "user-access-token")
    let session = try await client.currentSession()
    let request = try #require(SupabaseAuthURLProtocol.requests.first)

    #expect(session?.accessToken == "user-access-token")
    #expect(session?.user.email == "founder@fuelwell.app")
    #expect(request.url?.path == "/auth/v1/user")
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token")
}

@Test
func liveAuthClientCallsDeleteAccountRPC() async throws {
    SupabaseAuthURLProtocol.reset(responses: [Data()])

    let client = try liveAuthTestClient(accessToken: "user-access-token")
    try await client.deleteAccount()
    let request = try #require(SupabaseAuthURLProtocol.requests.first)

    #expect(request.url?.path == "/rest/v1/rpc/delete_current_user")
    #expect(request.httpMethod == "POST")
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token")
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
            projectURL: try #require(URL(string: "https://feature-flags.test")),
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
            projectURL: try #require(URL(string: "https://feature-flags.test")),
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

@Test
func liveDatabaseClientReadsAuthenticatedSupabaseUser() async throws {
    SupabaseDatabaseURLProtocol.reset(
        responses: [
            Data(
                #"""
                {
                  "id": "00000000-0000-0000-0000-000000000001",
                  "email": "founder@fuelwell.app"
                }
                """#.utf8
            )
        ]
    )

    let client = try liveDatabaseTestClient(accessToken: "user-access-token")
    let user = try await client.currentUser()
    let request = try #require(SupabaseDatabaseURLProtocol.requests.first)

    #expect(user?.id == UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    #expect(user?.email == "founder@fuelwell.app")
    #expect(request.url?.path == "/auth/v1/user")
    #expect(request.value(forHTTPHeaderField: "apikey") == "anon-test-key")
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token")
}

@Test
func liveDatabaseClientReturnsNilUserWithoutAccessToken() async throws {
    SupabaseDatabaseURLProtocol.reset()
    let client = try liveDatabaseTestClient(accessToken: nil)

    let user = try await client.currentUser()

    #expect(user == nil)
    #expect(SupabaseDatabaseURLProtocol.requests.isEmpty)
}

@Test
func liveDatabaseClientUsesAccessTokenForOwnerScopedREST() async throws {
    SupabaseDatabaseURLProtocol.reset(
        responses: [
            Data(
                #"""
                [
                  {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "display_name": "Jordan",
                    "goal": "recomp"
                  }
                ]
                """#.utf8
            )
        ]
    )

    let userID = try #require(UUID(uuidString: "00000000-0000-0000-0000-000000000001"))
    let client = try liveDatabaseTestClient(accessToken: "user-access-token")
    let profile = try await client.fetchProfile(userID)
    let request = try #require(SupabaseDatabaseURLProtocol.requests.first)

    #expect(profile?.id == userID)
    #expect(profile?.displayName == "Jordan")
    #expect(request.url?.path == "/rest/v1/profiles")
    #expect(request.url?.query?.contains("id=eq.00000000-0000-0000-0000-000000000001") == true)
    #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer user-access-token")
}
}

private func liveDatabaseTestClient(accessToken: String?) throws -> SupabaseDatabaseClient {
    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [SupabaseDatabaseURLProtocol.self]

    return SupabaseDatabaseClient.live(
        configuration: SupabaseConfiguration(
            projectURL: try #require(URL(string: "https://database.test")),
            anonKey: "anon-test-key",
            accessToken: accessToken
        ),
        session: URLSession(configuration: sessionConfiguration)
    )
}

private func liveAuthTestClient(accessToken: String?) throws -> SupabaseAuthClient {
    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [SupabaseAuthURLProtocol.self]

    return SupabaseAuthClient.live(
        configuration: SupabaseConfiguration(
            projectURL: try #require(URL(string: "https://auth.test")),
            anonKey: "anon-test-key",
            accessToken: accessToken
        ),
        session: URLSession(configuration: sessionConfiguration)
    )
}

private final class FeatureFlagURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseData = Data()
    nonisolated(unsafe) static var requests: [URLRequest] = []

    static func reset(data: Data) {
        self.responseData = data
        self.requests = []
    }

    override static func canInit(with request: URLRequest) -> Bool {
        request.url?.host == "feature-flags.test"
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

private final class SupabaseDatabaseURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseQueue: [Data] = []
    nonisolated(unsafe) static var requests: [URLRequest] = []

    static func reset(responses: [Data] = []) {
        self.responseQueue = responses
        self.requests = []
    }

    override static func canInit(with request: URLRequest) -> Bool {
        request.url?.host == "database.test"
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

private final class SupabaseAuthURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseQueue: [Data] = []
    nonisolated(unsafe) static var requests: [URLRequest] = []

    static func reset(responses: [Data] = []) {
        self.responseQueue = responses
        self.requests = []
    }

    override static func canInit(with request: URLRequest) -> Bool {
        request.url?.host == "auth.test"
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

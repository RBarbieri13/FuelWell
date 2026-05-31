import AnthropicClient
import Foundation
import SupabaseClient
import Testing

@Test
func previewClientReturnsDeterministicText() async throws {
    let response = try await AnthropicClient.previewValue.complete(
        AnthropicRequest(prompt: "Build me a recovery dinner.")
    )

    #expect(response.text.contains("Build me a recovery dinner."))
}

@Test
func testClientFailsLoudly() async {
    await #expect(throws: AnthropicClientError.unimplemented) {
        _ = try await AnthropicClient.testValue.complete(AnthropicRequest(prompt: "No network"))
    }
}

@Test
func liveClientStopsBeforeProxyWhenFeatureIsDisabled() async throws {
    AnthropicURLProtocol.reset(responseData: Data(#"{"text":"should not be used"}"#.utf8))

    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [AnthropicURLProtocol.self]
    let endpoint = try #require(URL(string: proxyEndpointString))

    let client = AnthropicClient.live(
        endpoint: endpoint,
        featureFlags: .constant([FeatureFlag(name: "ai_meal_plan", enabled: false)]),
        session: URLSession(configuration: sessionConfiguration)
    )

    await #expect(throws: AnthropicClientError.featureDisabled("ai_meal_plan")) {
        _ = try await client.complete(AnthropicRequest(prompt: "Generate a meal plan."))
    }
    #expect(AnthropicURLProtocol.requests.isEmpty)
}

@Test
func liveClientSendsFeatureFlagToProxyWhenEnabled() async throws {
    AnthropicURLProtocol.reset(responseData: Data(#"{"text":"Dinner plan","request_id":"req_123"}"#.utf8))

    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [AnthropicURLProtocol.self]
    let endpoint = try #require(URL(string: proxyEndpointString))

    let client = AnthropicClient.live(
        endpoint: endpoint,
        proxySecret: "test-secret",
        featureFlags: .constant([FeatureFlag(name: "coach_chat", enabled: true)]),
        session: URLSession(configuration: sessionConfiguration)
    )

    let response = try await client.complete(
        AnthropicRequest(prompt: "Coach me.", maxTokens: 42, featureFlag: "coach_chat")
    )

    let body = try #require(AnthropicURLProtocol.bodies.first)
    let decoded = try JSONSerialization.jsonObject(with: body) as? [String: Any]

    #expect(response.text == "Dinner plan")
    #expect(response.requestID == "req_123")
    #expect(AnthropicURLProtocol.requests.count == 1)
    #expect(
        AnthropicURLProtocol.requests.first?.value(forHTTPHeaderField: "x-fuelwell-coach-secret") ==
            "test-secret"
    )
    #expect(decoded?["prompt"] as? String == "Coach me.")
    #expect(decoded?["maxTokens"] as? Int == 42)
    #expect(decoded?["feature_flag"] as? String == "coach_chat")
}

@Test
func liveClientMapsProxyDisabledStatusToFeatureDisabled() async throws {
    AnthropicURLProtocol.reset(
        responseData: Data(#"{"error":"Feature disabled.","feature_flag":"coach_chat"}"#.utf8),
        statusCode: 403
    )

    let sessionConfiguration = URLSessionConfiguration.ephemeral
    sessionConfiguration.protocolClasses = [AnthropicURLProtocol.self]
    let endpoint = try #require(URL(string: proxyEndpointString))

    let client = AnthropicClient.live(
        endpoint: endpoint,
        proxySecret: "test-secret",
        featureFlags: .constant([FeatureFlag(name: "coach_chat", enabled: true)]),
        session: URLSession(configuration: sessionConfiguration)
    )

    await #expect(throws: AnthropicClientError.featureDisabled("coach_chat")) {
        _ = try await client.complete(
            AnthropicRequest(prompt: "Coach me.", featureFlag: "coach_chat")
        )
    }
    #expect(AnthropicURLProtocol.requests.count == 1)
}

private final class AnthropicURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) private static var responseData = Data()
    nonisolated(unsafe) private static var statusCode = 200
    nonisolated(unsafe) static var requests: [URLRequest] = []
    nonisolated(unsafe) static var bodies: [Data] = []

    static func reset(responseData: Data, statusCode: Int = 200) {
        self.responseData = responseData
        self.statusCode = statusCode
        self.requests = []
        self.bodies = []
    }

    override static func canInit(with request: URLRequest) -> Bool {
        true
    }

    override static func canonicalRequest(for request: URLRequest) -> URLRequest {
        request
    }

    override func startLoading() {
        Self.requests.append(self.request)
        if let httpBody = self.request.httpBody {
            Self.bodies.append(httpBody)
        } else if let httpBodyStream = self.request.httpBodyStream {
            Self.bodies.append(Self.data(from: httpBodyStream))
        }

        guard
            let url = self.request.url,
            let response = HTTPURLResponse(
                url: url,
                statusCode: Self.statusCode,
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

    private static func data(from stream: InputStream) -> Data {
        stream.open()
        defer { stream.close() }

        var data = Data()
        let bufferSize = 1_024
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
        defer { buffer.deallocate() }

        while stream.hasBytesAvailable {
            let count = stream.read(buffer, maxLength: bufferSize)
            if count > 0 {
                data.append(buffer, count: count)
            } else {
                break
            }
        }

        return data
    }
}

private let proxyEndpointString = "https://anthropic-proxy.test/generate"

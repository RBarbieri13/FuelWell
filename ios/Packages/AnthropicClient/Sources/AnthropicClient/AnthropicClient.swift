import Dependencies
import Foundation
import SupabaseClient

public struct AnthropicRequest: Equatable, Sendable {
    public var prompt: String
    public var model: String
    public var maxTokens: Int
    public var featureFlag: String

    public init(
        prompt: String,
        model: String = "claude-3-5-sonnet-latest",
        maxTokens: Int = 1_024,
        featureFlag: String = "ai_meal_plan"
    ) {
        self.prompt = prompt
        self.model = model
        self.maxTokens = maxTokens
        self.featureFlag = featureFlag
    }
}

public struct AnthropicResponse: Equatable, Sendable {
    public var text: String
    public var requestID: String?

    public init(text: String, requestID: String? = nil) {
        self.text = text
        self.requestID = requestID
    }
}

public enum AnthropicClientError: Error, Equatable, Sendable {
    case featureDisabled(String)
    case invalidResponse
    case missingConfiguration
    case transport(String)
    case unimplemented
}

public struct AnthropicClient: Sendable {
    public var complete: @Sendable (AnthropicRequest) async throws -> AnthropicResponse

    public init(
        complete: @escaping @Sendable (AnthropicRequest) async throws -> AnthropicResponse
    ) {
        self.complete = complete
    }
}

extension AnthropicClient: DependencyKey {
    public static let liveValue = AnthropicClient.live()

    public static let testValue = AnthropicClient { _ in
        throw AnthropicClientError.unimplemented
    }

    public static let previewValue = AnthropicClient { request in
        AnthropicResponse(text: "Preview response for: \(request.prompt)")
    }

    public static func live(
        endpoint: URL? = URL(string: ProcessInfo.processInfo.environment["FUELWELL_ANTHROPIC_PROXY_URL"] ?? ""),
        featureFlags: FeatureFlagClient = .liveValue,
        session: URLSession = .shared
    ) -> AnthropicClient {
        AnthropicClient { request in
            guard let endpoint, !endpoint.absoluteString.isEmpty else {
                throw AnthropicClientError.missingConfiguration
            }

            guard try await featureFlags.isEnabled(request.featureFlag) else {
                throw AnthropicClientError.featureDisabled(request.featureFlag)
            }

            return try await LiveAnthropicClient(endpoint: endpoint, session: session).complete(request)
        }
    }
}

extension DependencyValues {
    public var anthropicClient: AnthropicClient {
        get { self[AnthropicClient.self] }
        set { self[AnthropicClient.self] = newValue }
    }
}

private actor LiveAnthropicClient {
    private let endpoint: URL
    private let session: URLSession

    init(endpoint: URL, session: URLSession = .shared) {
        self.endpoint = endpoint
        self.session = session
    }

    func complete(_ request: AnthropicRequest) async throws -> AnthropicResponse {
        var urlRequest = URLRequest(url: self.endpoint)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = try JSONEncoder().encode(AnthropicProxyBody(request: request))

        do {
            let (data, response) = try await self.session.data(for: urlRequest)
            guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
                throw AnthropicClientError.invalidResponse
            }

            let decoded = try JSONDecoder().decode(AnthropicProxyResponse.self, from: data)
            return AnthropicResponse(text: decoded.text, requestID: decoded.requestID)
        } catch let error as AnthropicClientError {
            throw error
        } catch {
            throw AnthropicClientError.transport(error.localizedDescription)
        }
    }
}

private struct AnthropicProxyBody: Encodable {
    var prompt: String
    var model: String
    var maxTokens: Int
    var featureFlag: String

    init(request: AnthropicRequest) {
        self.prompt = request.prompt
        self.model = request.model
        self.maxTokens = request.maxTokens
        self.featureFlag = request.featureFlag
    }

    enum CodingKeys: String, CodingKey {
        case prompt
        case model
        case maxTokens
        case featureFlag = "feature_flag"
    }
}

private struct AnthropicProxyResponse: Decodable {
    var text: String
    var requestID: String?

    enum CodingKeys: String, CodingKey {
        case text
        case requestID = "request_id"
    }
}

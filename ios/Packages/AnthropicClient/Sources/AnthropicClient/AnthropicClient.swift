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

public struct AnthropicStreamEvent: Equatable, Sendable {
    public var textDelta: String
    public var requestID: String?
    public var isComplete: Bool

    public init(textDelta: String, requestID: String? = nil, isComplete: Bool = false) {
        self.textDelta = textDelta
        self.requestID = requestID
        self.isComplete = isComplete
    }
}

public enum AnthropicClientError: Error, Equatable, Sendable {
    case budgetExceeded
    case featureDisabled(String)
    case invalidResponse
    case missingConfiguration
    case transport(String)
    case unimplemented
}

public struct AnthropicClient: Sendable {
    public var complete: @Sendable (AnthropicRequest) async throws -> AnthropicResponse
    public var stream: @Sendable (AnthropicRequest) -> AsyncThrowingStream<AnthropicStreamEvent, any Error>

    public init(
        complete: @escaping @Sendable (AnthropicRequest) async throws -> AnthropicResponse,
        stream: @escaping @Sendable (AnthropicRequest) -> AsyncThrowingStream<AnthropicStreamEvent, any Error>
    ) {
        self.complete = complete
        self.stream = stream
    }

    public init(
        complete: @escaping @Sendable (AnthropicRequest) async throws -> AnthropicResponse
    ) {
        self.init(
            complete: complete,
            stream: { request in
                AsyncThrowingStream { continuation in
                    let task = Task {
                        do {
                            let response = try await complete(request)
                            continuation.yield(
                                AnthropicStreamEvent(
                                    textDelta: response.text,
                                    requestID: response.requestID,
                                    isComplete: true
                                )
                            )
                            continuation.finish()
                        } catch {
                            continuation.finish(throwing: error)
                        }
                    }
                    continuation.onTermination = { _ in
                        task.cancel()
                    }
                }
            }
        )
    }
}

extension AnthropicClient: DependencyKey {
    public static let liveValue = AnthropicClient.live()

    public static let testValue = AnthropicClient { _ in
        throw AnthropicClientError.unimplemented
    }

    public static let previewValue = AnthropicClient.preview()

    public static func preview(
        text: String = "I can help adjust the next useful decision."
    ) -> AnthropicClient {
        AnthropicClient(
            complete: { request in
                AnthropicResponse(text: "Preview response for: \(request.prompt)")
            },
            stream: { _ in
                AsyncThrowingStream { continuation in
                    let chunks = text.split(separator: " ", omittingEmptySubsequences: false)
                    Task {
                        for chunk in chunks {
                            continuation.yield(AnthropicStreamEvent(textDelta: "\(chunk) "))
                        }
                        continuation.yield(AnthropicStreamEvent(textDelta: "", requestID: "preview", isComplete: true))
                        continuation.finish()
                    }
                }
            }
        )
    }

    public static func live(
        endpoint: URL? = URL(string: ProcessInfo.processInfo.environment["FUELWELL_ANTHROPIC_PROXY_URL"] ?? ""),
        proxySecret: String? = ProcessInfo.processInfo.environment["FUELWELL_COACH_PROXY_SECRET"],
        featureFlags: FeatureFlagClient = .liveValue,
        session: URLSession = .shared
    ) -> AnthropicClient {
        let liveClient = LiveAnthropicClient(
            endpoint: endpoint,
            proxySecret: proxySecret,
            session: session
        )

        return AnthropicClient(
            complete: { request in
                guard let endpoint, !endpoint.absoluteString.isEmpty else {
                    throw AnthropicClientError.missingConfiguration
                }

                guard try await featureFlags.isEnabled(request.featureFlag) else {
                    throw AnthropicClientError.featureDisabled(request.featureFlag)
                }

                return try await liveClient.complete(request)
            },
            stream: { request in
                AsyncThrowingStream { continuation in
                    let task = Task {
                        do {
                            guard let endpoint, !endpoint.absoluteString.isEmpty else {
                                throw AnthropicClientError.missingConfiguration
                            }

                            guard try await featureFlags.isEnabled(request.featureFlag) else {
                                throw AnthropicClientError.featureDisabled(request.featureFlag)
                            }

                            for try await event in liveClient.stream(request) {
                                continuation.yield(event)
                            }
                            continuation.finish()
                        } catch {
                            continuation.finish(throwing: error)
                        }
                    }
                    continuation.onTermination = { _ in
                        task.cancel()
                    }
                }
            }
        )
    }
}

extension AnthropicClient {
    public static func streamingPreview(chunks: [String]) -> AnthropicClient {
        AnthropicClient(
            complete: { _ in AnthropicResponse(text: chunks.joined()) },
            stream: { _ in
                AsyncThrowingStream { continuation in
                    Task {
                        for chunk in chunks {
                            continuation.yield(AnthropicStreamEvent(textDelta: chunk))
                        }
                        continuation.yield(AnthropicStreamEvent(textDelta: "", requestID: "test", isComplete: true))
                        continuation.finish()
                    }
                }
            }
        )
    }

    public static func failingStream(_ error: AnthropicClientError) -> AnthropicClient {
        AnthropicClient(
            complete: { _ in throw error },
            stream: { _ in
                AsyncThrowingStream { continuation in
                    continuation.finish(throwing: error)
                }
            }
        )
    }
}

private final class LiveAnthropicClient: @unchecked Sendable {
    private let endpoint: URL?
    private let proxySecret: String?
    private let session: URLSession

    init(endpoint: URL?, proxySecret: String?, session: URLSession = .shared) {
        self.endpoint = endpoint
        self.proxySecret = proxySecret
        self.session = session
    }

    func complete(_ request: AnthropicRequest) async throws -> AnthropicResponse {
        let urlRequest = try self.urlRequest(request: request, acceptsStream: false)

        do {
            let (data, response) = try await self.session.data(for: urlRequest)
            try self.validate(response: response, featureFlag: request.featureFlag)

            let decoded = try JSONDecoder().decode(AnthropicProxyResponse.self, from: data)
            return AnthropicResponse(text: decoded.text, requestID: decoded.requestID)
        } catch let error as AnthropicClientError {
            throw error
        } catch {
            throw AnthropicClientError.transport(error.localizedDescription)
        }
    }

    func stream(_ request: AnthropicRequest) -> AsyncThrowingStream<AnthropicStreamEvent, any Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    let urlRequest = try self.urlRequest(request: request, acceptsStream: true)
                    let (bytes, response) = try await self.session.bytes(for: urlRequest)
                    try self.validate(response: response, featureFlag: request.featureFlag)

                    for try await line in bytes.lines {
                        guard let event = Self.event(from: line) else { continue }
                        continuation.yield(event)
                        if event.isComplete {
                            continuation.finish()
                            return
                        }
                    }

                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in
                task.cancel()
            }
        }
    }

    private func urlRequest(request: AnthropicRequest, acceptsStream: Bool) throws -> URLRequest {
        guard let endpoint, !endpoint.absoluteString.isEmpty else {
            throw AnthropicClientError.missingConfiguration
        }

        var urlRequest = URLRequest(url: endpoint)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if acceptsStream {
            urlRequest.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        }
        if let proxySecret, !proxySecret.isEmpty {
            urlRequest.setValue(proxySecret, forHTTPHeaderField: "x-fuelwell-coach-secret")
        }
        urlRequest.httpBody = try JSONEncoder().encode(AnthropicProxyBody(request: request))
        return urlRequest
    }

    private func validate(response: URLResponse, featureFlag: String) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AnthropicClientError.invalidResponse
        }
        if httpResponse.statusCode == 403 {
            throw AnthropicClientError.featureDisabled(featureFlag)
        }
        if httpResponse.statusCode == 429 {
            throw AnthropicClientError.budgetExceeded
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw AnthropicClientError.invalidResponse
        }
    }

    private static func event(from line: String) -> AnthropicStreamEvent? {
        guard line.hasPrefix("data:") else { return nil }
        let raw = line.dropFirst(5).trimmingCharacters(in: .whitespacesAndNewlines)
        guard raw != "[DONE]", let data = raw.data(using: .utf8) else {
            return AnthropicStreamEvent(textDelta: "", isComplete: true)
        }

        if let decoded = try? JSONDecoder().decode(AnthropicProxyStreamEvent.self, from: data) {
            return AnthropicStreamEvent(
                textDelta: decoded.textDelta ?? "",
                requestID: decoded.requestID,
                isComplete: decoded.isComplete
            )
        }

        return nil
    }
}

extension DependencyValues {
    public var anthropicClient: AnthropicClient {
        get { self[AnthropicClient.self] }
        set { self[AnthropicClient.self] = newValue }
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

private struct AnthropicProxyStreamEvent: Decodable {
    var textDelta: String?
    var requestID: String?
    var isComplete: Bool

    enum CodingKeys: String, CodingKey {
        case textDelta = "text_delta"
        case requestID = "request_id"
        case isComplete = "is_complete"
    }
}

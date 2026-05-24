import Dependencies
import Foundation

public enum AnalyticsValue: Equatable, Sendable {
    case bool(Bool)
    case double(Double)
    case int(Int)
    case string(String)
}

public struct AnalyticsEvent: Equatable, Sendable {
    public var name: String
    public var properties: [String: AnalyticsValue]

    public init(name: String, properties: [String: AnalyticsValue] = [:]) {
        self.name = name
        self.properties = properties
    }

    public static func appLaunched(source: String) -> AnalyticsEvent {
        AnalyticsEvent(name: "app_launched", properties: ["source": .string(source)])
    }

    public static func healthKitSynced(daysBack: Int) -> AnalyticsEvent {
        AnalyticsEvent(name: "healthkit_synced", properties: ["days_back": .int(daysBack)])
    }
}

public enum AnalyticsClientError: Error, Equatable, Sendable {
    case missingConfiguration
    case invalidResponse
    case transport(String)
    case unimplemented
}

public struct AnalyticsClient: Sendable {
    public var identify: @Sendable (String, [String: AnalyticsValue]) async throws -> Void
    public var track: @Sendable (AnalyticsEvent) async throws -> Void

    public init(
        identify: @escaping @Sendable (String, [String: AnalyticsValue]) async throws -> Void,
        track: @escaping @Sendable (AnalyticsEvent) async throws -> Void
    ) {
        self.identify = identify
        self.track = track
    }
}

extension AnalyticsClient: DependencyKey {
    public static let liveValue = AnalyticsClient.live()

    public static let testValue = AnalyticsClient(
        identify: { _, _ in throw AnalyticsClientError.unimplemented },
        track: { _ in throw AnalyticsClientError.unimplemented }
    )

    public static let previewValue = AnalyticsClient.noop

    public static let noop = AnalyticsClient(
        identify: { _, _ in },
        track: { _ in }
    )

    public static func live(
        apiKey: String? = ProcessInfo.processInfo.environment["FUELWELL_POSTHOG_API_KEY"],
        host: URL? = URL(string: "https://app.posthog.com")
    ) -> AnalyticsClient {
        guard let apiKey, !apiKey.isEmpty, let host else {
            return AnalyticsClient(
                identify: { _, _ in throw AnalyticsClientError.missingConfiguration },
                track: { _ in throw AnalyticsClientError.missingConfiguration }
            )
        }

        let transport = PostHogTransport(apiKey: apiKey, host: host)
        return AnalyticsClient(
            identify: { try await transport.identify(userID: $0, traits: $1) },
            track: { try await transport.track($0) }
        )
    }
}

extension DependencyValues {
    public var analytics: AnalyticsClient {
        get { self[AnalyticsClient.self] }
        set { self[AnalyticsClient.self] = newValue }
    }
}

private actor PostHogTransport {
    private let apiKey: String
    private let host: URL
    private let session: URLSession
    private let encoder = JSONEncoder()

    init(apiKey: String, host: URL, session: URLSession = .shared) {
        self.apiKey = apiKey
        self.host = host
        self.session = session
    }

    func identify(userID: String, traits: [String: AnalyticsValue]) async throws {
        try await self.post(
            path: "/capture/",
            body: PostHogBody(
                apiKey: self.apiKey,
                event: "$identify",
                distinctID: userID,
                properties: ["$set": .object(traits.mapValues(PostHogJSON.init))]
            )
        )
    }

    func track(_ event: AnalyticsEvent) async throws {
        try await self.post(
            path: "/capture/",
            body: PostHogBody(
                apiKey: self.apiKey,
                event: event.name,
                distinctID: "anonymous",
                properties: event.properties.mapValues(PostHogJSON.init)
            )
        )
    }

    private func post(path: String, body: PostHogBody) async throws {
        var request = URLRequest(url: self.host.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try self.encoder.encode(body)

        do {
            let (_, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                throw AnalyticsClientError.invalidResponse
            }
        } catch let error as AnalyticsClientError {
            throw error
        } catch {
            throw AnalyticsClientError.transport(error.localizedDescription)
        }
    }
}

private struct PostHogBody: Encodable {
    var apiKey: String
    var event: String
    var distinctID: String
    var properties: [String: PostHogJSON]

    enum CodingKeys: String, CodingKey {
        case apiKey = "api_key"
        case event
        case distinctID = "distinct_id"
        case properties
    }
}

private enum PostHogJSON: Encodable {
    case bool(Bool)
    case double(Double)
    case int(Int)
    case object([String: PostHogJSON])
    case string(String)

    init(value: AnalyticsValue) {
        switch value {
        case let .bool(value):
            self = .bool(value)
        case let .double(value):
            self = .double(value)
        case let .int(value):
            self = .int(value)
        case let .string(value):
            self = .string(value)
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case let .bool(value):
            try container.encode(value)
        case let .double(value):
            try container.encode(value)
        case let .int(value):
            try container.encode(value)
        case let .object(value):
            try container.encode(value)
        case let .string(value):
            try container.encode(value)
        }
    }
}

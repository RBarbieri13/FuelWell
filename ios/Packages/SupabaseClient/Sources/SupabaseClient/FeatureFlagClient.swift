import Dependencies
import Foundation

public struct FeatureFlag: Codable, Equatable, Sendable {
    public var name: String
    public var enabled: Bool
    public var description: String?
    public var updatedAt: Date?

    public init(name: String, enabled: Bool, description: String? = nil, updatedAt: Date? = nil) {
        self.name = name
        self.enabled = enabled
        self.description = description
        self.updatedAt = updatedAt
    }

    enum CodingKeys: String, CodingKey {
        case name
        case enabled
        case description
        case updatedAt = "updated_at"
    }
}

public struct FeatureFlagClient: Sendable {
    public var isEnabled: @Sendable (String) async throws -> Bool
    public var refresh: @Sendable () async throws -> [FeatureFlag]

    public init(
        isEnabled: @escaping @Sendable (String) async throws -> Bool,
        refresh: @escaping @Sendable () async throws -> [FeatureFlag]
    ) {
        self.isEnabled = isEnabled
        self.refresh = refresh
    }
}

extension FeatureFlagClient: DependencyKey {
    public static let liveValue = FeatureFlagClient.live()

    public static let testValue = FeatureFlagClient(
        isEnabled: { _ in throw SupabaseClientError.unimplemented },
        refresh: { throw SupabaseClientError.unimplemented }
    )

    public static let previewValue = FeatureFlagClient.constant([
        FeatureFlag(name: "ai_meal_plan", enabled: true, description: "Preview AI meal-plan switch"),
        FeatureFlag(name: "ai_workout_suggestion", enabled: true, description: "Preview AI workout switch"),
        FeatureFlag(name: "coach_chat", enabled: true, description: "Preview AI coach chat switch"),
        FeatureFlag(name: "proactive_nudges", enabled: true, description: "Preview proactive coaching switch")
    ])

    public static func constant(_ flags: [FeatureFlag]) -> FeatureFlagClient {
        FeatureFlagClient(
            isEnabled: { name in flags.first { $0.name == name }?.enabled ?? false },
            refresh: { flags }
        )
    }

    public static func live(
        configuration: SupabaseConfiguration? = .environment,
        ttl: TimeInterval = 30,
        session: URLSession = .shared
    ) -> FeatureFlagClient {
        guard let configuration else {
            return FeatureFlagClient(
                isEnabled: { _ in throw SupabaseClientError.missingConfiguration },
                refresh: { throw SupabaseClientError.missingConfiguration }
            )
        }

        let store = CachedFeatureFlagStore(configuration: configuration, ttl: ttl, session: session)
        return FeatureFlagClient(
            isEnabled: { try await store.isEnabled($0) },
            refresh: { try await store.refresh() }
        )
    }
}

extension DependencyValues {
    public var featureFlags: FeatureFlagClient {
        get { self[FeatureFlagClient.self] }
        set { self[FeatureFlagClient.self] = newValue }
    }
}

private actor CachedFeatureFlagStore {
    private let configuration: SupabaseConfiguration
    private let ttl: TimeInterval
    private let session: URLSession
    private let decoder: JSONDecoder
    private var cachedFlags: [FeatureFlag] = []
    private var cachedAt: Date?

    init(configuration: SupabaseConfiguration, ttl: TimeInterval, session: URLSession = .shared) {
        self.configuration = configuration
        self.ttl = ttl
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
    }

    func isEnabled(_ name: String) async throws -> Bool {
        let flags = try await self.flags()
        return flags.first { $0.name == name }?.enabled ?? false
    }

    func refresh() async throws -> [FeatureFlag] {
        let url = self.configuration.projectURL
            .appendingPathComponent("rest/v1/feature_flags")
            .appending(queryItems: [URLQueryItem(name: "select", value: "*")])
        var request = URLRequest(url: url)
        request.setValue(self.configuration.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(self.configuration.anonKey)", forHTTPHeaderField: "Authorization")

        do {
            let (data, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                throw SupabaseClientError.invalidResponse
            }

            let flags = try self.decoder.decode([FeatureFlag].self, from: data)
            self.cachedFlags = flags
            self.cachedAt = Date()
            return flags
        } catch let error as SupabaseClientError {
            throw error
        } catch {
            throw SupabaseClientError.transport(error.localizedDescription)
        }
    }

    private func flags() async throws -> [FeatureFlag] {
        if let cachedAt, Date().timeIntervalSince(cachedAt) < self.ttl {
            return self.cachedFlags
        }

        return try await self.refresh()
    }
}

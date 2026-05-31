import Dependencies
import Foundation

public struct SupabaseSession: Codable, Equatable, Sendable {
    public var user: SupabaseUser
    public var accessToken: String
    public var refreshToken: String?
    public var expiresAt: Date?

    public init(
        user: SupabaseUser,
        accessToken: String,
        refreshToken: String? = nil,
        expiresAt: Date? = nil
    ) {
        self.user = user
        self.accessToken = accessToken
        self.refreshToken = refreshToken
        self.expiresAt = expiresAt
    }
}

public struct SupabaseAuthClient: Sendable {
    public var currentSession: @Sendable () async throws -> SupabaseSession?
    public var signUp: @Sendable (_ email: String, _ password: String) async throws -> SupabaseSession
    public var signIn: @Sendable (_ email: String, _ password: String) async throws -> SupabaseSession
    public var signOut: @Sendable () async throws -> Void
    public var deleteAccount: @Sendable () async throws -> Void

    public init(
        currentSession: @escaping @Sendable () async throws -> SupabaseSession?,
        signUp: @escaping @Sendable (_ email: String, _ password: String) async throws -> SupabaseSession,
        signIn: @escaping @Sendable (_ email: String, _ password: String) async throws -> SupabaseSession,
        signOut: @escaping @Sendable () async throws -> Void,
        deleteAccount: @escaping @Sendable () async throws -> Void
    ) {
        self.currentSession = currentSession
        self.signUp = signUp
        self.signIn = signIn
        self.signOut = signOut
        self.deleteAccount = deleteAccount
    }
}

extension SupabaseAuthClient: DependencyKey {
    public static let liveValue = SupabaseAuthClient.live()

    public static let testValue = SupabaseAuthClient(
        currentSession: { throw SupabaseClientError.unimplemented },
        signUp: { _, _ in throw SupabaseClientError.unimplemented },
        signIn: { _, _ in throw SupabaseClientError.unimplemented },
        signOut: { throw SupabaseClientError.unimplemented },
        deleteAccount: { throw SupabaseClientError.unimplemented }
    )

    public static let previewValue = SupabaseAuthClient.inMemory(
        session: SupabaseSession(
            user: SupabaseUser(
                id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
                email: "preview@fuelwell.app"
            ),
            accessToken: "preview-token"
        )
    )

    public static func live(
        configuration: SupabaseConfiguration? = .environment,
        session: URLSession = .shared
    ) -> SupabaseAuthClient {
        guard let configuration else {
            return SupabaseAuthClient(
                currentSession: { throw SupabaseClientError.missingConfiguration },
                signUp: { _, _ in throw SupabaseClientError.missingConfiguration },
                signIn: { _, _ in throw SupabaseClientError.missingConfiguration },
                signOut: { throw SupabaseClientError.missingConfiguration },
                deleteAccount: { throw SupabaseClientError.missingConfiguration }
            )
        }

        let transport = SupabaseAuthTransport(configuration: configuration, session: session)
        return SupabaseAuthClient(
            currentSession: { try await transport.currentSession() },
            signUp: { try await transport.signUp(email: $0, password: $1) },
            signIn: { try await transport.signIn(email: $0, password: $1) },
            signOut: { try await transport.signOut() },
            deleteAccount: { try await transport.deleteAccount() }
        )
    }

    public static func inMemory(session: SupabaseSession? = nil) -> SupabaseAuthClient {
        let store = InMemoryAuthStore(session: session)
        return SupabaseAuthClient(
            currentSession: { await store.currentSession() },
            signUp: { try await store.signUp(email: $0, password: $1) },
            signIn: { try await store.signIn(email: $0, password: $1) },
            signOut: { await store.signOut() },
            deleteAccount: { await store.deleteAccount() }
        )
    }
}

extension DependencyValues {
    public var supabaseAuth: SupabaseAuthClient {
        get { self[SupabaseAuthClient.self] }
        set { self[SupabaseAuthClient.self] = newValue }
    }
}

private actor InMemoryAuthStore {
    private var session: SupabaseSession?

    init(session: SupabaseSession?) {
        self.session = session
    }

    func currentSession() -> SupabaseSession? {
        self.session
    }

    func signUp(email: String, password: String) throws -> SupabaseSession {
        try Self.validate(email: email, password: password)
        let session = SupabaseSession(
            user: SupabaseUser(id: UUID(), email: email),
            accessToken: "in-memory-access-token",
            refreshToken: "in-memory-refresh-token"
        )
        self.session = session
        return session
    }

    func signIn(email: String, password: String) throws -> SupabaseSession {
        try Self.validate(email: email, password: password)
        let session = SupabaseSession(
            user: SupabaseUser(id: UUID(), email: email),
            accessToken: "in-memory-access-token",
            refreshToken: "in-memory-refresh-token"
        )
        self.session = session
        return session
    }

    func signOut() {
        self.session = nil
    }

    func deleteAccount() {
        self.session = nil
    }

    private static func validate(email: String, password: String) throws {
        guard email.contains("@"), password.count >= 8 else {
            throw SupabaseClientError.invalidCredentials
        }
    }
}

private actor SupabaseAuthTransport {
    private let configuration: SupabaseConfiguration
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(configuration: SupabaseConfiguration, session: URLSession = .shared) {
        self.configuration = configuration
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func currentSession() async throws -> SupabaseSession? {
        guard let accessToken = self.configuration.accessToken else {
            return nil
        }

        let user: SupabaseUser = try await self.request(
            path: "auth/v1/user",
            queryItems: [],
            method: "GET",
            body: Optional<Data>.none,
            accessToken: accessToken
        )

        return SupabaseSession(user: user, accessToken: accessToken)
    }

    func signUp(email: String, password: String) async throws -> SupabaseSession {
        try Self.validate(email: email, password: password)
        return try await self.passwordRequest(path: "auth/v1/signup", email: email, password: password)
    }

    func signIn(email: String, password: String) async throws -> SupabaseSession {
        try Self.validate(email: email, password: password)
        return try await self.passwordRequest(
            path: "auth/v1/token",
            queryItems: [URLQueryItem(name: "grant_type", value: "password")],
            email: email,
            password: password
        )
    }

    func signOut() async throws {
        guard let accessToken = self.configuration.accessToken else {
            return
        }

        let _: EmptyResponse = try await self.request(
            path: "auth/v1/logout",
            queryItems: [],
            method: "POST",
            body: Optional<Data>.none,
            accessToken: accessToken,
            acceptsEmptyResponse: true
        )
    }

    func deleteAccount() async throws {
        guard let accessToken = self.configuration.accessToken else {
            throw SupabaseClientError.invalidCredentials
        }

        let _: EmptyResponse = try await self.request(
            path: "rest/v1/rpc/delete_current_user",
            queryItems: [],
            method: "POST",
            body: Data("{}".utf8),
            accessToken: accessToken,
            acceptsEmptyResponse: true
        )
    }

    private func passwordRequest(
        path: String,
        queryItems: [URLQueryItem] = [],
        email: String,
        password: String
    ) async throws -> SupabaseSession {
        let response: AuthResponse = try await self.request(
            path: path,
            queryItems: queryItems,
            method: "POST",
            body: self.encoder.encode(PasswordPayload(email: email, password: password)),
            accessToken: nil
        )

        return try response.session()
    }

    private func request<Response: Decodable>(
        path: String,
        queryItems: [URLQueryItem],
        method: String,
        body: Data?,
        accessToken: String?,
        acceptsEmptyResponse: Bool = false
    ) async throws -> Response {
        var components = URLComponents(
            url: self.configuration.projectURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = queryItems

        guard let url = components?.url else {
            throw SupabaseClientError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.httpBody = body
        request.setValue(self.configuration.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(accessToken ?? self.configuration.anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (data, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                throw SupabaseClientError.invalidResponse
            }

            if http.statusCode == 400 || http.statusCode == 401 || http.statusCode == 403 {
                throw SupabaseClientError.invalidCredentials
            }

            guard (200..<300).contains(http.statusCode) else {
                throw SupabaseClientError.invalidResponse
            }

            if acceptsEmptyResponse, data.isEmpty {
                guard let empty = EmptyResponse() as? Response else {
                    throw SupabaseClientError.invalidResponse
                }
                return empty
            }

            return try self.decoder.decode(Response.self, from: data)
        } catch let error as SupabaseClientError {
            throw error
        } catch {
            throw SupabaseClientError.transport(error.localizedDescription)
        }
    }

    private static func validate(email: String, password: String) throws {
        guard email.contains("@"), password.count >= 8 else {
            throw SupabaseClientError.invalidCredentials
        }
    }
}

private struct PasswordPayload: Encodable {
    var email: String
    var password: String
}

private struct AuthResponse: Decodable {
    var accessToken: String?
    var refreshToken: String?
    var expiresIn: TimeInterval?
    var user: SupabaseUser?

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
        case user
    }

    func session() throws -> SupabaseSession {
        guard let accessToken, let user else {
            throw SupabaseClientError.invalidResponse
        }

        return SupabaseSession(
            user: user,
            accessToken: accessToken,
            refreshToken: self.refreshToken,
            expiresAt: self.expiresIn.map { Date().addingTimeInterval($0) }
        )
    }
}

private struct EmptyResponse: Decodable {}

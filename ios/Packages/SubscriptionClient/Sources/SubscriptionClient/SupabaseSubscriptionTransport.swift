import Foundation

private struct SupabaseRPCRequest: Encodable {
    var targetUserID: UUID
    var targetEmail: String

    enum CodingKeys: String, CodingKey {
        case targetUserID = "target_user_id"
        case targetEmail = "target_email"
    }
}

actor SupabaseSubscriptionTransport {
    private let configuration: SubscriptionConfiguration
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(configuration: SubscriptionConfiguration, session: URLSession = .shared) {
        self.configuration = configuration
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func status(userID: UUID) async throws -> SubscriptionStatus {
        let rows: [SubscriptionStatus] = try await self.request(
            path: "rest/v1/subscription_entitlements",
            queryItems: [
                URLQueryItem(name: "user_id", value: "eq.\(userID.uuidString)"),
                URLQueryItem(name: "select", value: "*")
            ],
            method: "GET",
            body: Optional<Data>.none
        )

        return rows.first ?? SubscriptionStatus(userID: userID, tier: .pilot, isActive: true)
    }

    func reserveFounding100(userID: UUID, email: String) async throws -> Founding100Reservation {
        try self.requireAuthenticatedSession()
        return try await self.request(
            path: "rest/v1/rpc/reserve_founding100",
            queryItems: [],
            method: "POST",
            body: self.encoder.encode(SupabaseRPCRequest(targetUserID: userID, targetEmail: email))
        )
    }

    func linkMarketingSignup(_ request: AccountLinkRequest) async throws -> MarketingAccountLink {
        try self.requireAuthenticatedSession()
        let rows: [MarketingAccountLink] = try await self.request(
            path: "rest/v1/rpc/link_marketing_signup_to_user",
            queryItems: [],
            method: "POST",
            body: self.encoder.encode(
                SupabaseRPCRequest(targetUserID: request.userID, targetEmail: request.email)
            )
        )

        guard let link = rows.first else {
            throw SubscriptionClientError.invalidResponse
        }

        return link
    }

    func validationEvents(userID: UUID) async throws -> [SubscriptionValidationEvent] {
        try await self.request(
            path: "rest/v1/subscription_validation_events",
            queryItems: [
                URLQueryItem(name: "user_id", value: "eq.\(userID.uuidString)"),
                URLQueryItem(name: "select", value: "*"),
                URLQueryItem(name: "order", value: "validated_at.desc")
            ],
            method: "GET",
            body: Optional<Data>.none
        )
    }

    private func requireAuthenticatedSession() throws {
        guard self.configuration.accessToken != nil else {
            throw SubscriptionClientError.missingConfiguration
        }
    }

    private func request<Response: Decodable>(
        path: String,
        queryItems: [URLQueryItem],
        method: String,
        body: Data?
    ) async throws -> Response {
        var components = URLComponents(
            url: self.configuration.projectURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = queryItems.isEmpty ? nil : queryItems

        guard let url = components?.url else {
            throw SubscriptionClientError.invalidResponse
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.httpBody = body
        request.setValue(self.configuration.anonKey, forHTTPHeaderField: "apikey")
        request.setValue(
            "Bearer \(self.configuration.accessToken ?? self.configuration.anonKey)",
            forHTTPHeaderField: "Authorization"
        )
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (data, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                throw SubscriptionClientError.invalidResponse
            }

            if http.statusCode == 409 {
                throw SubscriptionClientError.founding100SoldOut
            }

            guard (200..<300).contains(http.statusCode) else {
                throw SubscriptionClientError.invalidResponse
            }

            return try self.decoder.decode(Response.self, from: data)
        } catch let error as SubscriptionClientError {
            throw error
        } catch {
            throw SubscriptionClientError.transport(error.localizedDescription)
        }
    }
}

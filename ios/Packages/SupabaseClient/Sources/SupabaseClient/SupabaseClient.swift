import Dependencies
import Foundation

public struct SupabaseConfiguration: Equatable, Sendable {
    public var projectURL: URL
    public var anonKey: String
    public var accessToken: String?

    public init(projectURL: URL, anonKey: String, accessToken: String? = nil) {
        self.projectURL = projectURL
        self.anonKey = anonKey
        self.accessToken = accessToken
    }

    public static var environment: SupabaseConfiguration? {
        guard
            let rawURL = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_URL"],
            let url = URL(string: rawURL),
            let anonKey = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_ANON_KEY"],
            !anonKey.isEmpty
        else {
            return nil
        }

        let accessToken = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_ACCESS_TOKEN"]
        return SupabaseConfiguration(
            projectURL: url,
            anonKey: anonKey,
            accessToken: accessToken?.isEmpty == false ? accessToken : nil
        )
    }
}

public struct SupabaseUser: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var email: String?

    public init(id: UUID, email: String? = nil) {
        self.id = id
        self.email = email
    }
}

public struct Profile: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var displayName: String?
    public var goal: String?
    public var bodyBaseline: BodyBaseline?
    public var dietaryConstraints: DietaryConstraints?
    public var lifestyle: LifestyleProfile?
    public var onboardingCompletedAt: Date?

    public init(
        id: UUID,
        displayName: String? = nil,
        goal: String? = nil,
        bodyBaseline: BodyBaseline? = nil,
        dietaryConstraints: DietaryConstraints? = nil,
        lifestyle: LifestyleProfile? = nil,
        onboardingCompletedAt: Date? = nil
    ) {
        self.id = id
        self.displayName = displayName
        self.goal = goal
        self.bodyBaseline = bodyBaseline
        self.dietaryConstraints = dietaryConstraints
        self.lifestyle = lifestyle
        self.onboardingCompletedAt = onboardingCompletedAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case goal
        case bodyBaseline = "body_baseline"
        case dietaryConstraints = "dietary_constraints"
        case lifestyle
        case onboardingCompletedAt = "onboarding_completed_at"
    }
}

public struct BodyBaseline: Codable, Equatable, Sendable {
    public var heightInches: Int?
    public var weightPounds: Double?
    public var activityLevel: String

    public init(heightInches: Int? = nil, weightPounds: Double? = nil, activityLevel: String) {
        self.heightInches = heightInches
        self.weightPounds = weightPounds
        self.activityLevel = activityLevel
    }

    enum CodingKeys: String, CodingKey {
        case heightInches = "height_inches"
        case weightPounds = "weight_pounds"
        case activityLevel = "activity_level"
    }
}

public struct DietaryConstraints: Codable, Equatable, Sendable {
    public var preferences: [String]
    public var allergies: [String]

    public init(preferences: [String] = [], allergies: [String] = []) {
        self.preferences = preferences
        self.allergies = allergies
    }
}

public struct LifestyleProfile: Codable, Equatable, Sendable {
    public var workoutsPerWeek: Int
    public var sleepGoalHours: Double
    public var mealPrepStyle: String

    public init(workoutsPerWeek: Int, sleepGoalHours: Double, mealPrepStyle: String) {
        self.workoutsPerWeek = workoutsPerWeek
        self.sleepGoalHours = sleepGoalHours
        self.mealPrepStyle = mealPrepStyle
    }

    enum CodingKeys: String, CodingKey {
        case workoutsPerWeek = "workouts_per_week"
        case sleepGoalHours = "sleep_goal_hours"
        case mealPrepStyle = "meal_prep_style"
    }
}

public struct MealRecord: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var userID: UUID
    public var name: String
    public var loggedAt: Date

    public init(id: UUID = UUID(), userID: UUID, name: String, loggedAt: Date) {
        self.id = id
        self.userID = userID
        self.name = name
        self.loggedAt = loggedAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userID = "user_id"
        case name
        case loggedAt = "logged_at"
    }
}

public struct FeedbackReport: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var userID: UUID?
    public var route: String
    public var message: String
    public var appVersion: String
    public var metadata: [String: String]
    public var createdAt: Date

    public init(
        id: UUID = UUID(),
        userID: UUID? = nil,
        route: String,
        message: String,
        appVersion: String,
        metadata: [String: String] = [:],
        createdAt: Date = Date()
    ) {
        self.id = id
        self.userID = userID
        self.route = route
        self.message = message
        self.appVersion = appVersion
        self.metadata = metadata
        self.createdAt = createdAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userID = "user_id"
        case route
        case message
        case appVersion = "app_version"
        case metadata
        case createdAt = "created_at"
    }
}

public enum SupabaseClientError: Error, Equatable, Sendable {
    case disabled
    case invalidResponse
    case invalidCredentials
    case missingConfiguration
    case transport(String)
    case unimplemented
}

public struct SupabaseDatabaseClient: Sendable {
    public var currentUser: @Sendable () async throws -> SupabaseUser?
    public var fetchProfile: @Sendable (UUID) async throws -> Profile?
    public var upsertProfile: @Sendable (Profile) async throws -> Profile
    public var insertMeal: @Sendable (MealRecord) async throws -> MealRecord
    public var submitFeedback: @Sendable (FeedbackReport) async throws -> FeedbackReport

    public init(
        currentUser: @escaping @Sendable () async throws -> SupabaseUser?,
        fetchProfile: @escaping @Sendable (UUID) async throws -> Profile?,
        upsertProfile: @escaping @Sendable (Profile) async throws -> Profile,
        insertMeal: @escaping @Sendable (MealRecord) async throws -> MealRecord,
        submitFeedback: @escaping @Sendable (FeedbackReport) async throws -> FeedbackReport
    ) {
        self.currentUser = currentUser
        self.fetchProfile = fetchProfile
        self.upsertProfile = upsertProfile
        self.insertMeal = insertMeal
        self.submitFeedback = submitFeedback
    }
}

extension SupabaseDatabaseClient: DependencyKey {
    public static let liveValue = SupabaseDatabaseClient.live()

    public static let testValue = SupabaseDatabaseClient(
        currentUser: { throw SupabaseClientError.unimplemented },
        fetchProfile: { _ in throw SupabaseClientError.unimplemented },
        upsertProfile: { _ in throw SupabaseClientError.unimplemented },
        insertMeal: { _ in throw SupabaseClientError.unimplemented },
        submitFeedback: { _ in throw SupabaseClientError.unimplemented }
    )

    public static let previewValue = SupabaseDatabaseClient.inMemory(
        user: SupabaseUser(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
            email: "preview@fuelwell.app"
        )
    )

    public static func live(
        configuration: SupabaseConfiguration? = .environment,
        session: URLSession = .shared
    ) -> SupabaseDatabaseClient {
        guard let configuration else {
            return SupabaseDatabaseClient(
                currentUser: { throw SupabaseClientError.missingConfiguration },
                fetchProfile: { _ in throw SupabaseClientError.missingConfiguration },
                upsertProfile: { _ in throw SupabaseClientError.missingConfiguration },
                insertMeal: { _ in throw SupabaseClientError.missingConfiguration },
                submitFeedback: { _ in throw SupabaseClientError.missingConfiguration }
            )
        }

        let transport = SupabaseRESTTransport(configuration: configuration, session: session)
        return SupabaseDatabaseClient(
            currentUser: { try await transport.currentUser() },
            fetchProfile: { try await transport.fetchProfile(userID: $0) },
            upsertProfile: { try await transport.upsertProfile($0) },
            insertMeal: { try await transport.insertMeal($0) },
            submitFeedback: { try await transport.submitFeedback($0) }
        )
    }

    public static func inMemory(user: SupabaseUser?) -> SupabaseDatabaseClient {
        let store = InMemorySupabaseStore(user: user)
        return SupabaseDatabaseClient(
            currentUser: { store.user },
            fetchProfile: { await store.profile(id: $0) },
            upsertProfile: { await store.upsert(profile: $0) },
            insertMeal: { await store.insert(meal: $0) },
            submitFeedback: { await store.submit(feedback: $0) }
        )
    }
}

extension DependencyValues {
    public var supabaseDatabase: SupabaseDatabaseClient {
        get { self[SupabaseDatabaseClient.self] }
        set { self[SupabaseDatabaseClient.self] = newValue }
    }
}

private actor InMemorySupabaseStore {
    let user: SupabaseUser?
    private var profiles: [UUID: Profile] = [:]
    private var meals: [UUID: MealRecord] = [:]
    private var feedback: [UUID: FeedbackReport] = [:]

    init(user: SupabaseUser?) {
        self.user = user
    }

    func profile(id: UUID) -> Profile? {
        self.profiles[id]
    }

    func upsert(profile: Profile) -> Profile {
        self.profiles[profile.id] = profile
        return profile
    }

    func insert(meal: MealRecord) -> MealRecord {
        self.meals[meal.id] = meal
        return meal
    }

    func submit(feedback: FeedbackReport) -> FeedbackReport {
        self.feedback[feedback.id] = feedback
        return feedback
    }
}

private actor SupabaseRESTTransport {
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

    func currentUser() async throws -> SupabaseUser? {
        guard self.configuration.accessToken != nil else {
            return nil
        }

        return try await self.request(
            path: "auth/v1/user",
            queryItems: [],
            method: "GET",
            body: Optional<Data>.none
        )
    }

    func fetchProfile(userID: UUID) async throws -> Profile? {
        let rows: [Profile] = try await self.request(
            path: "rest/v1/profiles",
            queryItems: [
                URLQueryItem(name: "id", value: "eq.\(userID.uuidString)"),
                URLQueryItem(name: "select", value: "*")
            ],
            method: "GET",
            body: Optional<Data>.none
        )

        return rows.first
    }

    func upsertProfile(_ profile: Profile) async throws -> Profile {
        let rows: [Profile] = try await self.request(
            path: "rest/v1/profiles",
            queryItems: [URLQueryItem(name: "select", value: "*")],
            method: "POST",
            body: self.encoder.encode(profile),
            prefer: "resolution=merge-duplicates,return=representation"
        )

        guard let row = rows.first else {
            throw SupabaseClientError.invalidResponse
        }

        return row
    }

    func insertMeal(_ meal: MealRecord) async throws -> MealRecord {
        let rows: [MealRecord] = try await self.request(
            path: "rest/v1/meals",
            queryItems: [URLQueryItem(name: "select", value: "*")],
            method: "POST",
            body: self.encoder.encode(meal),
            prefer: "return=representation"
        )

        guard let row = rows.first else {
            throw SupabaseClientError.invalidResponse
        }

        return row
    }

    func submitFeedback(_ feedback: FeedbackReport) async throws -> FeedbackReport {
        let rows: [FeedbackReport] = try await self.request(
            path: "rest/v1/feedback",
            queryItems: [URLQueryItem(name: "select", value: "*")],
            method: "POST",
            body: self.encoder.encode(feedback),
            prefer: "return=representation"
        )

        guard let row = rows.first else {
            throw SupabaseClientError.invalidResponse
        }

        return row
    }

    private func request<Response: Decodable>(
        path: String,
        queryItems: [URLQueryItem],
        method: String,
        body: Data?,
        prefer: String? = nil
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
        request.setValue(
            "Bearer \(self.configuration.accessToken ?? self.configuration.anonKey)",
            forHTTPHeaderField: "Authorization"
        )
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let prefer {
            request.setValue(prefer, forHTTPHeaderField: "Prefer")
        }

        do {
            let (data, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                throw SupabaseClientError.invalidResponse
            }

            return try self.decoder.decode(Response.self, from: data)
        } catch let error as SupabaseClientError {
            throw error
        } catch {
            throw SupabaseClientError.transport(error.localizedDescription)
        }
    }
}

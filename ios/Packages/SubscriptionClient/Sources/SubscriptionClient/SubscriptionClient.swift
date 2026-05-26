import Dependencies
import Foundation

public enum EntitlementTier: String, CaseIterable, Codable, Equatable, Sendable {
    case pilot
    case pro
    case premium
    case founding100Lifetime

    public var displayName: String {
        switch self {
        case .pilot:
            "Pilot"
        case .pro:
            "Pro"
        case .premium:
            "Premium"
        case .founding100Lifetime:
            "Founding 100 Lifetime"
        }
    }

    public var unlocksPremiumFeatures: Bool {
        switch self {
        case .pilot, .premium, .founding100Lifetime:
            true
        case .pro:
            false
        }
    }
}

public enum PremiumFeature: String, CaseIterable, Codable, Equatable, Sendable {
    case coachChat = "coach_chat"
    case groceryList = "grocery_list"
    case mealPlanGenerator = "meal_plan_generator"
    case proactiveNudges = "proactive_nudges"
    case restaurantGuidance = "restaurant_guidance"
    case workoutPlans = "workout_plans"

    public var requiredTier: EntitlementTier {
        switch self {
        case .coachChat, .groceryList, .mealPlanGenerator, .proactiveNudges, .restaurantGuidance:
            .pro
        case .workoutPlans:
            .premium
        }
    }
}

public enum SubscriptionProvider: String, CaseIterable, Codable, Equatable, Sendable {
    case manual
    case revenueCat = "revenue_cat"
    case stripe
}

public enum SubscriptionEnvironment: String, CaseIterable, Codable, Equatable, Sendable {
    case sandbox
    case production
}

public struct ProviderReceipt: Codable, Equatable, Sendable {
    public var provider: SubscriptionProvider
    public var environment: SubscriptionEnvironment
    public var receiptToken: String
    public var productID: String

    public init(
        provider: SubscriptionProvider,
        environment: SubscriptionEnvironment,
        receiptToken: String,
        productID: String
    ) {
        self.provider = provider
        self.environment = environment
        self.receiptToken = receiptToken
        self.productID = productID
    }
}

public struct AccountLinkRequest: Codable, Equatable, Sendable {
    public var userID: UUID
    public var email: String
    public var source: String

    public init(userID: UUID, email: String, source: String = "ios") {
        self.userID = userID
        self.email = email
        self.source = source
    }
}

public struct MarketingAccountLink: Codable, Equatable, Sendable {
    public var userID: UUID
    public var email: String
    public var source: String
    public var linkedAt: Date
    public var founding100Position: Int?

    public init(
        userID: UUID,
        email: String,
        source: String,
        linkedAt: Date = Date(),
        founding100Position: Int? = nil
    ) {
        self.userID = userID
        self.email = email
        self.source = source
        self.linkedAt = linkedAt
        self.founding100Position = founding100Position
    }

    enum CodingKeys: String, CodingKey {
        case userID = "user_id"
        case email
        case source
        case linkedAt = "linked_at"
        case founding100Position = "founding100_position"
    }
}

public struct SubscriptionConfiguration: Equatable, Sendable {
    public var projectURL: URL
    public var anonKey: String
    public var accessToken: String?

    public init(projectURL: URL, anonKey: String, accessToken: String? = nil) {
        self.projectURL = projectURL
        self.anonKey = anonKey
        self.accessToken = accessToken
    }

    public static var environment: SubscriptionConfiguration? {
        guard
            let rawURL = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_URL"],
            let url = URL(string: rawURL),
            let anonKey = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_ANON_KEY"],
            !anonKey.isEmpty
        else {
            return nil
        }

        let accessToken = ProcessInfo.processInfo.environment["FUELWELL_SUPABASE_ACCESS_TOKEN"]
        return SubscriptionConfiguration(
            projectURL: url,
            anonKey: anonKey,
            accessToken: accessToken?.isEmpty == false ? accessToken : nil
        )
    }
}

public struct ProductIdentifiers: Codable, Equatable, Sendable {
    public var proMonthly: String
    public var premiumMonthly: String
    public var founding100Lifetime: String

    public init(
        proMonthly: String = "fuelwell.pro.monthly",
        premiumMonthly: String = "fuelwell.premium.monthly",
        founding100Lifetime: String = "fuelwell.founding100.lifetime"
    ) {
        self.proMonthly = proMonthly
        self.premiumMonthly = premiumMonthly
        self.founding100Lifetime = founding100Lifetime
    }

    public static let defaults = ProductIdentifiers()
}

public struct SubscriptionStatus: Codable, Equatable, Sendable {
    public var userID: UUID
    public var tier: EntitlementTier
    public var isActive: Bool
    public var productID: String?
    public var expiresAt: Date?
    public var validatedAt: Date

    public init(
        userID: UUID,
        tier: EntitlementTier,
        isActive: Bool,
        productID: String? = nil,
        expiresAt: Date? = nil,
        validatedAt: Date = Date()
    ) {
        self.userID = userID
        self.tier = tier
        self.isActive = isActive
        self.productID = productID
        self.expiresAt = expiresAt
        self.validatedAt = validatedAt
    }

    public func canAccess(_ feature: PremiumFeature) -> Bool {
        guard self.isActive else { return false }

        return switch feature.requiredTier {
        case .pilot:
            true
        case .pro:
            self.tier == .pilot || self.tier == .pro || self.tier.unlocksPremiumFeatures
        case .premium, .founding100Lifetime:
            self.tier.unlocksPremiumFeatures
        }
    }

    enum CodingKeys: String, CodingKey {
        case userID = "user_id"
        case tier
        case isActive = "is_active"
        case productID = "product_id"
        case expiresAt = "expires_at"
        case validatedAt = "validated_at"
    }
}

public struct SubscriptionValidationEvent: Codable, Equatable, Identifiable, Sendable {
    public var id: UUID
    public var userID: UUID
    public var provider: SubscriptionProvider
    public var productID: String
    public var environment: SubscriptionEnvironment
    public var status: EntitlementTier
    public var validatedAt: Date

    public init(
        id: UUID = UUID(),
        userID: UUID,
        provider: SubscriptionProvider,
        productID: String,
        environment: SubscriptionEnvironment,
        status: EntitlementTier,
        validatedAt: Date = Date()
    ) {
        self.id = id
        self.userID = userID
        self.provider = provider
        self.productID = productID
        self.environment = environment
        self.status = status
        self.validatedAt = validatedAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userID = "user_id"
        case provider
        case productID = "product_id"
        case environment
        case status = "entitlement_tier"
        case validatedAt = "validated_at"
    }
}

public struct Founding100Reservation: Codable, Equatable, Identifiable, Sendable {
    public static let hardCap = 100

    public var id: UUID
    public var userID: UUID
    public var email: String
    public var position: Int
    public var reservedAt: Date

    public init(
        id: UUID = UUID(),
        userID: UUID,
        email: String,
        position: Int,
        reservedAt: Date = Date()
    ) {
        self.id = id
        self.userID = userID
        self.email = email
        self.position = position
        self.reservedAt = reservedAt
    }

    public var isWithinHardCap: Bool {
        (1...Self.hardCap).contains(self.position)
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userID = "user_id"
        case email
        case position
        case reservedAt = "reserved_at"
    }
}

public enum SubscriptionClientError: Error, Equatable, Sendable {
    case founding100SoldOut
    case invalidReceipt
    case invalidEmail
    case invalidResponse
    case missingConfiguration
    case transport(String)
    case unimplemented
}

public struct SubscriptionClient: Sendable {
    public var status: @Sendable (UUID) async throws -> SubscriptionStatus
    public var validateReceipt: @Sendable (UUID, String) async throws -> SubscriptionStatus
    public var validateProviderReceipt: @Sendable (UUID, ProviderReceipt) async throws -> SubscriptionStatus
    public var reserveFounding100: @Sendable (UUID, String) async throws -> Founding100Reservation
    public var linkMarketingSignup: @Sendable (AccountLinkRequest) async throws -> MarketingAccountLink
    public var validationEvents: @Sendable (UUID) async throws -> [SubscriptionValidationEvent]

    public init(
        status: @escaping @Sendable (UUID) async throws -> SubscriptionStatus,
        validateReceipt: @escaping @Sendable (UUID, String) async throws -> SubscriptionStatus,
        validateProviderReceipt: @escaping @Sendable (UUID, ProviderReceipt) async throws -> SubscriptionStatus,
        reserveFounding100: @escaping @Sendable (UUID, String) async throws -> Founding100Reservation,
        linkMarketingSignup: @escaping @Sendable (AccountLinkRequest) async throws -> MarketingAccountLink,
        validationEvents: @escaping @Sendable (UUID) async throws -> [SubscriptionValidationEvent]
    ) {
        self.status = status
        self.validateReceipt = validateReceipt
        self.validateProviderReceipt = validateProviderReceipt
        self.reserveFounding100 = reserveFounding100
        self.linkMarketingSignup = linkMarketingSignup
        self.validationEvents = validationEvents
    }
}

extension SubscriptionClient: DependencyKey {
    public static let liveValue = SubscriptionClient.live()

    public static let testValue = SubscriptionClient(
        status: { _ in throw SubscriptionClientError.unimplemented },
        validateReceipt: { _, _ in throw SubscriptionClientError.unimplemented },
        validateProviderReceipt: { _, _ in throw SubscriptionClientError.unimplemented },
        reserveFounding100: { _, _ in throw SubscriptionClientError.unimplemented },
        linkMarketingSignup: { _ in throw SubscriptionClientError.unimplemented },
        validationEvents: { _ in throw SubscriptionClientError.unimplemented }
    )

    public static let previewValue = SubscriptionClient.inMemory(
        statuses: [:],
        reservations: []
    )

    public static let unconfigured = SubscriptionClient(
        status: { userID in
            SubscriptionStatus(userID: userID, tier: .pilot, isActive: true)
        },
        validateReceipt: { _, _ in throw SubscriptionClientError.missingConfiguration },
        validateProviderReceipt: { _, _ in throw SubscriptionClientError.missingConfiguration },
        reserveFounding100: { _, _ in throw SubscriptionClientError.missingConfiguration },
        linkMarketingSignup: { _ in throw SubscriptionClientError.missingConfiguration },
        validationEvents: { _ in throw SubscriptionClientError.missingConfiguration }
    )

    public static func inMemory(
        statuses: [UUID: SubscriptionStatus],
        reservations: [Founding100Reservation]
    ) -> SubscriptionClient {
        let store = InMemorySubscriptionStore(statuses: statuses, reservations: reservations)
        return SubscriptionClient(
            status: { await store.status(userID: $0) },
            validateReceipt: { try await store.validateReceipt(userID: $0, receipt: $1) },
            validateProviderReceipt: { try await store.validateProviderReceipt(userID: $0, receipt: $1) },
            reserveFounding100: { try await store.reserve(userID: $0, email: $1) },
            linkMarketingSignup: { try await store.link(request: $0) },
            validationEvents: { await store.validationEvents(userID: $0) }
        )
    }

    public static func live(
        configuration: SubscriptionConfiguration? = .environment,
        session: URLSession = .shared
    ) -> SubscriptionClient {
        guard let configuration else {
            return SubscriptionClient.unconfigured
        }

        let transport = SupabaseSubscriptionTransport(configuration: configuration, session: session)
        return SubscriptionClient(
            status: { try await transport.status(userID: $0) },
            validateReceipt: { _, _ in throw SubscriptionClientError.missingConfiguration },
            validateProviderReceipt: { _, _ in throw SubscriptionClientError.missingConfiguration },
            reserveFounding100: { try await transport.reserveFounding100(userID: $0, email: $1) },
            linkMarketingSignup: { try await transport.linkMarketingSignup($0) },
            validationEvents: { try await transport.validationEvents(userID: $0) }
        )
    }
}

extension DependencyValues {
    public var subscriptionClient: SubscriptionClient {
        get { self[SubscriptionClient.self] }
        set { self[SubscriptionClient.self] = newValue }
    }
}

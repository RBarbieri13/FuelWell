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
}

public enum SubscriptionClientError: Error, Equatable, Sendable {
    case founding100SoldOut
    case invalidReceipt
    case missingConfiguration
    case unimplemented
}

public struct SubscriptionClient: Sendable {
    public var status: @Sendable (UUID) async throws -> SubscriptionStatus
    public var validateReceipt: @Sendable (UUID, String) async throws -> SubscriptionStatus
    public var reserveFounding100: @Sendable (UUID, String) async throws -> Founding100Reservation

    public init(
        status: @escaping @Sendable (UUID) async throws -> SubscriptionStatus,
        validateReceipt: @escaping @Sendable (UUID, String) async throws -> SubscriptionStatus,
        reserveFounding100: @escaping @Sendable (UUID, String) async throws -> Founding100Reservation
    ) {
        self.status = status
        self.validateReceipt = validateReceipt
        self.reserveFounding100 = reserveFounding100
    }
}

extension SubscriptionClient: DependencyKey {
    public static let liveValue = SubscriptionClient.unconfigured

    public static let testValue = SubscriptionClient(
        status: { _ in throw SubscriptionClientError.unimplemented },
        validateReceipt: { _, _ in throw SubscriptionClientError.unimplemented },
        reserveFounding100: { _, _ in throw SubscriptionClientError.unimplemented }
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
        reserveFounding100: { _, _ in throw SubscriptionClientError.missingConfiguration }
    )

    public static func inMemory(
        statuses: [UUID: SubscriptionStatus],
        reservations: [Founding100Reservation]
    ) -> SubscriptionClient {
        let store = InMemorySubscriptionStore(statuses: statuses, reservations: reservations)
        return SubscriptionClient(
            status: { await store.status(userID: $0) },
            validateReceipt: { try await store.validateReceipt(userID: $0, receipt: $1) },
            reserveFounding100: { try await store.reserve(userID: $0, email: $1) }
        )
    }
}

extension DependencyValues {
    public var subscriptionClient: SubscriptionClient {
        get { self[SubscriptionClient.self] }
        set { self[SubscriptionClient.self] = newValue }
    }
}

private actor InMemorySubscriptionStore {
    private var statuses: [UUID: SubscriptionStatus]
    private var reservations: [Founding100Reservation]

    init(statuses: [UUID: SubscriptionStatus], reservations: [Founding100Reservation]) {
        self.statuses = statuses
        self.reservations = reservations
    }

    func status(userID: UUID) -> SubscriptionStatus {
        self.statuses[userID] ?? SubscriptionStatus(userID: userID, tier: .pilot, isActive: true)
    }

    func validateReceipt(userID: UUID, receipt: String) throws -> SubscriptionStatus {
        guard !receipt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw SubscriptionClientError.invalidReceipt
        }

        let status = SubscriptionStatus(
            userID: userID,
            tier: .premium,
            isActive: true,
            productID: ProductIdentifiers.defaults.premiumMonthly
        )
        self.statuses[userID] = status
        return status
    }

    func reserve(userID: UUID, email: String) throws -> Founding100Reservation {
        if let existingIndex = self.reservations.firstIndex(where: { $0.userID == userID }) {
            self.reservations[existingIndex].email = email
            return self.reservations[existingIndex]
        }

        guard self.reservations.count < Founding100Reservation.hardCap else {
            throw SubscriptionClientError.founding100SoldOut
        }

        let reservation = Founding100Reservation(
            userID: userID,
            email: email,
            position: self.reservations.count + 1
        )
        self.reservations.append(reservation)
        self.statuses[userID] = SubscriptionStatus(
            userID: userID,
            tier: .founding100Lifetime,
            isActive: true,
            productID: ProductIdentifiers.defaults.founding100Lifetime
        )
        return reservation
    }
}

import Foundation
import SubscriptionClient
import Testing

@Test
func founding100ReservationsHonorHardCap() async throws {
    let existing = (1...Founding100Reservation.hardCap).map { position in
        Founding100Reservation(
            userID: UUID(),
            email: "founder\(position)@fuelwell.app",
            position: position
        )
    }
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: existing)

    await #expect(throws: SubscriptionClientError.founding100SoldOut) {
        _ = try await client.reserveFounding100(UUID(), "late@fuelwell.app")
    }
}

@Test
func founding100ReservationGrantsLifetimePremiumAccess() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    let reservation = try await client.reserveFounding100(userID, "founder@fuelwell.app")
    let status = try await client.status(userID)

    #expect(reservation.position == 1)
    #expect(reservation.isWithinHardCap)
    #expect(status.tier == .founding100Lifetime)
    #expect(status.canAccess(.workoutPlans))
}

@Test
func founding100ReservationIsIdempotentPerUser() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    let firstReservation = try await client.reserveFounding100(userID, "first@fuelwell.app")
    let updatedReservation = try await client.reserveFounding100(userID, "updated@fuelwell.app")

    #expect(updatedReservation.id == firstReservation.id)
    #expect(updatedReservation.position == firstReservation.position)
    #expect(updatedReservation.email == "updated@fuelwell.app")
}

@Test
func proAndPremiumGateFeaturesDifferently() {
    let userID = UUID()
    let pro = SubscriptionStatus(userID: userID, tier: .pro, isActive: true)
    let premium = SubscriptionStatus(userID: userID, tier: .premium, isActive: true)
    let inactive = SubscriptionStatus(userID: userID, tier: .premium, isActive: false)

    #expect(pro.canAccess(.restaurantGuidance))
    #expect(!pro.canAccess(.workoutPlans))
    #expect(premium.canAccess(.workoutPlans))
    #expect(!inactive.canAccess(.coachChat))
}

@Test
func receiptValidationRejectsBlankReceiptsAndGrantsPremium() async throws {
    let userID = UUID()
    let client = SubscriptionClient.inMemory(statuses: [:], reservations: [])

    await #expect(throws: SubscriptionClientError.invalidReceipt) {
        _ = try await client.validateReceipt(userID, " ")
    }

    let status = try await client.validateReceipt(userID, "receipt-token")

    #expect(status.tier == .premium)
    #expect(status.productID == ProductIdentifiers.defaults.premiumMonthly)
}

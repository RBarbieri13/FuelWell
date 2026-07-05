import Foundation

actor InMemorySubscriptionStore {
    private var statuses: [UUID: SubscriptionStatus]
    private var reservations: [Founding100Reservation]
    private var links: [UUID: MarketingAccountLink] = [:]
    private var events: [SubscriptionValidationEvent] = []

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

        return self.recordValidation(
            userID: userID,
            receipt: ProviderReceipt(
                provider: .manual,
                environment: .sandbox,
                receiptToken: receipt,
                productID: ProductIdentifiers.defaults.premiumMonthly
            )
        )
    }

    func validateProviderReceipt(userID: UUID, receipt: ProviderReceipt) throws -> SubscriptionStatus {
        guard !receipt.receiptToken.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw SubscriptionClientError.invalidReceipt
        }

        return self.recordValidation(userID: userID, receipt: receipt)
    }

    func link(request: AccountLinkRequest) throws -> MarketingAccountLink {
        let email = request.email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard self.isValidEmail(email) else {
            throw SubscriptionClientError.invalidEmail
        }

        let existingReservation = self.reservations.first(where: { $0.userID == request.userID })
        let link = MarketingAccountLink(
            userID: request.userID,
            email: email,
            source: request.source,
            founding100Position: existingReservation?.position
        )
        self.links[request.userID] = link
        return link
    }

    func validationEvents(userID: UUID) -> [SubscriptionValidationEvent] {
        self.events.filter { $0.userID == userID }
    }

    func reserve(userID: UUID, email: String) throws -> Founding100Reservation {
        let normalizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard self.isValidEmail(normalizedEmail) else {
            throw SubscriptionClientError.invalidEmail
        }

        if let existingIndex = self.reservations.firstIndex(where: { $0.userID == userID }) {
            self.reservations[existingIndex].email = normalizedEmail
            return self.reservations[existingIndex]
        }

        guard self.reservations.count < Founding100Reservation.hardCap else {
            throw SubscriptionClientError.founding100SoldOut
        }

        let reservation = Founding100Reservation(
            userID: userID,
            email: normalizedEmail,
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

    private func recordValidation(userID: UUID, receipt: ProviderReceipt) -> SubscriptionStatus {
        let status = SubscriptionStatus(
            userID: userID,
            tier: .premium,
            isActive: true,
            productID: receipt.productID
        )
        self.statuses[userID] = status
        self.events.append(
            SubscriptionValidationEvent(
                userID: userID,
                provider: receipt.provider,
                productID: receipt.productID,
                environment: receipt.environment,
                status: status.tier
            )
        )
        return status
    }

    private func isValidEmail(_ email: String) -> Bool {
        email.range(
            of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#,
            options: .regularExpression
        ) != nil
    }
}

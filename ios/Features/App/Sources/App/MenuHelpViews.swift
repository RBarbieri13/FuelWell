import Analytics
import Dependencies
import DesignSystem
import SubscriptionClient
import SupabaseClient
import SwiftUI

struct MenuSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Menu") {
                PhaseHero(icon: "person.crop.circle", title: "Robert", detail: "Goal: stronger, leaner, consistent")
                DashboardSection(
                    title: "Tools",
                    items: [
                        .init(
                            title: "Snapshot",
                            detail: "Health Score, recap, inflows/outflows",
                            icon: "gauge.with.dots.needle.67percent"
                        ),
                        .init(title: "Meals", detail: "Log, recipes, meal plans, groceries", icon: "fork.knife"),
                        .init(title: "Training", detail: "Workout log, plans, activity tracker", icon: "figure.run")
                    ]
                )
                DashboardSection(
                    title: "Settings",
                    items: [
                        .init(title: "Permissions", detail: "HealthKit, notifications, camera", icon: "lock.shield"),
                        .init(title: "Help", detail: "Articles, support, feedback", icon: "questionmark.circle")
                    ]
                )
                NavigationLink {
                    AccountSubscriptionView()
                } label: {
                    PhaseActionRow(
                        item: .init(title: "Account", detail: "Profile, auth, subscription", icon: "person")
                    )
                }
                .buttonStyle(.plain)
                .qualityID(QualityIdentifier.accountSubscription)
                Founding100StatusCard()
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close", systemImage: "xmark") {
                        self.dismiss()
                    }
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.body.color)
                }
            }
        }
    }
}

private struct Founding100StatusCard: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "sparkles")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(EntitlementTier.founding100Lifetime.displayName)
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)

                    Text(
                        "Founders 100 is capped at \(Founding100Reservation.hardCap) lifetime seats. " +
                            "Everyone keeps Pilot access until paid tiers are turned on."
                    )
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.medium)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
            }
        }
        .phaseCard()
    }
}

private struct AccountSubscriptionView: View {
    @Dependency(\.subscriptionClient) private var subscriptionClient
    @Dependency(\.supabaseDatabase) private var supabaseDatabase
    @Environment(\.theme) private var theme
    @State private var currentUser: SupabaseUser?
    @State private var status: SubscriptionStatus?
    @State private var reservation: Founding100Reservation?
    @State private var link: MarketingAccountLink?
    @State private var message: String?
    @State private var isLoading = false
    @State private var isJoiningFounding100 = false

    var body: some View {
        PhaseScroll(title: "Account") {
            PhaseHero(
                icon: "person.crop.circle.badge.checkmark",
                title: "Account and access",
                detail: "Link the website signup, iOS profile, and Founders 100 entitlement to one Supabase user."
            )

            self.identityCard
            self.subscriptionCard
            self.founding100Card

            if let message = self.message {
                Text(message)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
                    .phaseCard()
            }
        }
        .task {
            await self.load()
        }
    }

    private var identityCard: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("Identity")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            PhaseDetailRow(label: "Supabase user", value: self.currentUser?.id.uuidString ?? "Not signed in")
            PhaseDetailRow(label: "Email", value: self.currentUser?.email ?? "Add email or Apple sign-in")

            if self.isLoading {
                Text("Checking account link...")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
        }
        .phaseCard()
    }

    private var subscriptionCard: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("Subscription")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            PhaseDetailRow(label: "Current tier", value: self.status?.tier.displayName ?? "Pilot")
            PhaseDetailRow(label: "Product", value: self.status?.productID ?? "Pilot access")
            PhaseDetailRow(label: "Provider", value: self.status?.productID == nil ? "None yet" : "Server validated")

            Text("Pilot access stays open until paid tiers are deliberately enabled.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.medium)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .phaseCard()
    }

    private var founding100Card: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "sparkles")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Founders 100")
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                    Text(self.founding100Detail)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.medium)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
            }

            Button(self.joinButtonTitle, systemImage: "checkmark.seal.fill") {
                Task {
                    await self.joinFounding100()
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .fontWeight(.bold)
            .disabled(self.currentUser?.email == nil || self.isJoiningFounding100)
            .qualityID(QualityIdentifier.founding100Join)
        }
        .phaseCard()
    }

    private var founding100Detail: String {
        if let reservation {
            return "Seat \(reservation.position) of \(Founding100Reservation.hardCap) " +
                "is linked to \(reservation.email)."
        }

        if let link, let position = link.founding100Position {
            return "Website signup is linked. Founders 100 seat \(position) is ready."
        }

        return "Reserve or relink the website signup to this app account before paid tiers go live."
    }

    private var joinButtonTitle: String {
        if self.isJoiningFounding100 { return "Linking..." }
        if self.reservation != nil { return "Refresh Founders 100 Link" }
        return "Link Founders 100"
    }

    private func load() async {
        self.isLoading = true
        defer { self.isLoading = false }

        do {
            let user = try await self.supabaseDatabase.currentUser()
            self.currentUser = user
            if let user {
                self.status = try await self.subscriptionClient.status(user.id)
            }
        } catch {
            self.message = "Account services are not configured in this build yet."
        }
    }

    private func joinFounding100() async {
        guard let userID = self.currentUser?.id, let email = self.currentUser?.email else {
            self.message = "Sign in with email or Apple before linking Founders 100."
            return
        }

        self.isJoiningFounding100 = true
        defer { self.isJoiningFounding100 = false }

        do {
            let reservation = try await self.subscriptionClient.reserveFounding100(userID, email)
            self.reservation = reservation
            self.link = try await self.subscriptionClient.linkMarketingSignup(
                AccountLinkRequest(userID: userID, email: email, source: "ios_account")
            )
            self.status = try await self.subscriptionClient.status(userID)
            self.message = "Founders 100 is linked to this app account."
        } catch SubscriptionClientError.founding100SoldOut {
            self.message = "Founders 100 is sold out."
        } catch SubscriptionClientError.invalidEmail {
            self.message = "Add a valid email before linking Founders 100."
        } catch {
            self.message = "Founders 100 linking is waiting on server configuration."
        }
    }
}

private struct PhaseDetailRow: View {
    let label: String
    let value: String
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(self.label)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            Spacer(minLength: self.theme.spacing.md)
            Text(self.value)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct HelpView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Help") {
                PhaseHero(
                    icon: "magnifyingglass",
                    title: "Search articles, settings, or ask a question",
                    detail: "Short answers first, settings and coach nearby."
                )
                DashboardSection(
                    title: "Featured",
                    items: [
                        .init(
                            title: "Eating out without guessing",
                            detail: "3-minute read · one order to try",
                            icon: "book.pages"
                        ),
                        .init(title: "Notification preferences", detail: "Nudges without guilt", icon: "bell"),
                        .init(title: "Contact support", detail: "Send feedback or report a problem", icon: "envelope")
                    ]
                )
                NavigationLink {
                    FeedbackView(route: "help")
                } label: {
                    Label("Send feedback", systemImage: "paperplane.fill")
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.onDark.color)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(self.theme.spacing.md)
                        .background(self.theme.color.bg.elevated.color)
                        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                }
                .qualityID(QualityIdentifier.feedbackSubmit)
                DashboardSection(
                    title: "Quick settings",
                    items: [
                        .init(title: "HealthKit", detail: "Connect recovery and activity data", icon: "heart"),
                        .init(title: "Camera", detail: "Required for photo meal logging", icon: "camera"),
                        .init(title: "Account", detail: "Profile and sign out", icon: "person.crop.circle")
                    ]
                )
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close", systemImage: "xmark") {
                        self.dismiss()
                    }
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.body.color)
                }
            }
        }
    }
}

struct FeedbackView: View {
    let route: String

    @Dependency(\.analytics) private var analytics
    @Dependency(\.supabaseDatabase) private var supabaseDatabase
    @Environment(\.theme) private var theme
    @State private var message = ""
    @State private var status: FeedbackStatus = .idle

    private var isSubmitDisabled: Bool {
        self.message.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || self.status == .submitting
    }

    var body: some View {
        PhaseScroll(title: "Send Feedback") {
            PhaseHero(
                icon: "paperplane.fill",
                title: "Tell us what happened",
                detail: "Robert and Max can triage bugs, confusing copy, or launch blockers from here."
            )

            VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                Text("Feedback")
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)

                TextEditor(text: self.$message)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.medium)
                    .frame(minHeight: 180)
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.bg.base.color)
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                    .overlay(
                        RoundedRectangle(cornerRadius: self.theme.radius.sm)
                            .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
                    )
                    .qualityID(QualityIdentifier.feedbackMessage)

                Button(self.status.buttonTitle, systemImage: "paperplane.fill") {
                    Task {
                        await self.submit()
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(self.theme.color.primary.accent.color)
                .fontWeight(.bold)
                .disabled(self.isSubmitDisabled)
                .qualityID(QualityIdentifier.feedbackSubmit)

                if let statusCopy = self.status.copy {
                    Text(statusCopy)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.statusColor)
                        .qualityID(QualityIdentifier.feedbackSuccess)
                }
            }
            .phaseCard()
        }
        .task {
            try? await self.analytics.track(.feedbackStarted(route: self.route))
        }
    }

    private func submit() async {
        let trimmed = self.message.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        self.status = .submitting
        do {
            let report = FeedbackReport(
                route: self.route,
                message: trimmed,
                appVersion: Self.appVersion,
                metadata: [
                    "surface": self.route,
                    "source": "ios_help"
                ]
            )
            _ = try await self.supabaseDatabase.submitFeedback(report)
            try? await self.analytics.track(.feedbackSubmitted(route: self.route, messageLength: trimmed.count))
            self.status = .submitted
            self.message = ""
        } catch {
            try? await self.analytics.track(.feedbackFailed(route: self.route, reason: String(describing: error)))
            self.status = .failed
        }
    }

    private static var appVersion: String {
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String
        let build = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String
        return [version, build].compactMap { $0 }.joined(separator: " ")
    }

    private var statusColor: Color {
        self.status == .submitted ? self.theme.color.primary.green.color : self.theme.color.text.body.color
    }
}

private enum FeedbackStatus: Equatable {
    case idle
    case submitting
    case submitted
    case failed

    var buttonTitle: String {
        switch self {
        case .idle, .failed:
            "Send Feedback"
        case .submitting:
            "Sending"
        case .submitted:
            "Sent"
        }
    }

    var copy: String? {
        switch self {
        case .idle, .submitting:
            nil
        case .submitted:
            "Thanks - we got it."
        case .failed:
            "Feedback could not be sent. Try again when you are back online."
        }
    }
}

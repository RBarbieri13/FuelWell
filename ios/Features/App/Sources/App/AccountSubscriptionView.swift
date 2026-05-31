import Analytics
import ComposableArchitecture
import Dependencies
import DesignSystem
import SubscriptionClient
import SupabaseClient
import SwiftUI

struct AccountSubscriptionView: View {
    let store: StoreOf<AppFeature>

    @Dependency(\.subscriptionClient) private var subscriptionClient
    @Dependency(\.supabaseDatabase) private var supabaseDatabase
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme
    @State private var currentUser: SupabaseUser?
    @State private var profile: Profile?
    @State private var status: SubscriptionStatus?
    @State private var reservation: Founding100Reservation?
    @State private var link: MarketingAccountLink?
    @State private var message: String?
    @State private var isLoading = false
    @State private var isJoiningFounding100 = false
    @State private var isSigningOut = false
    @State private var isDeletingAccount = false
    @State private var isConfirmingDelete = false

    var body: some View {
        PhaseScroll(title: "Account") {
            PhaseHero(
                icon: "person.crop.circle.badge.checkmark",
                title: "Account and access",
                detail: "Link the website signup, iOS profile, and Founders 100 entitlement to one Supabase user."
            )

            self.identityCard
            self.planCard
            self.subscriptionCard
            self.founding100Card
            self.accountControlsCard

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
        .confirmationDialog(
            "Delete this FuelWell account?",
            isPresented: self.$isConfirmingDelete,
            titleVisibility: .visible
        ) {
            Button("Delete Account", role: .destructive) {
                Task {
                    await self.deleteAccount()
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This signs you out and asks Supabase to remove the current auth user and profile data.")
        }
    }

    private var identityCard: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("Identity")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            PhaseDetailRow(label: "Supabase user", value: self.currentUser?.id.uuidString ?? "Not signed in")
            PhaseDetailRow(label: "Email", value: self.currentUser?.email ?? "Add email or Apple sign-in")
            PhaseDetailRow(label: "Display name", value: self.profile?.displayName ?? "Complete onboarding")

            if self.isLoading {
                Text("Checking account link...")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
        }
        .phaseCard()
    }

    private var planCard: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .top, spacing: self.theme.spacing.md) {
                Image(systemName: "target")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Your plan")
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                    Text(self.planSummary)
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.medium)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
            }

            PhaseDetailRow(label: "Goal", value: self.goalTitle)
            PhaseDetailRow(label: "Baseline", value: self.baselineSummary)
            PhaseDetailRow(label: "Dietary", value: self.dietarySummary)
            PhaseDetailRow(label: "Lifestyle", value: self.lifestyleSummary)
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

    private var accountControlsCard: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Account controls")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            Button(self.isSigningOut ? "Signing Out" : "Sign Out", systemImage: "rectangle.portrait.and.arrow.right") {
                Task {
                    await self.signOut()
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.bg.elevated.color)
            .fontWeight(.bold)
            .disabled(self.isSigningOut || self.isDeletingAccount)

            Button("Delete Account", systemImage: "trash") {
                self.isConfirmingDelete = true
            }
            .buttonStyle(.bordered)
            .tint(self.theme.color.semantic.error.color)
            .fontWeight(.bold)
            .disabled(self.currentUser == nil || self.isSigningOut || self.isDeletingAccount)

            Text(
                "Delete account is required for App Store account apps. " +
                    "It is enabled only when this build has a signed-in Supabase user."
            )
            .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
            .fontWeight(.medium)
            .foregroundStyle(self.theme.color.text.secondary.color)
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

    private var planSummary: String {
        guard let profile else {
            return "Finish onboarding to generate a profile-backed nutrition plan."
        }

        let goal = profile.goal?.isEmpty == false ? profile.goal ?? "fueling consistency" : "fueling consistency"
        return "\(profile.displayName ?? "Your") plan is tuned for \(goal)."
    }

    private var goalTitle: String {
        guard let goal = self.profile?.goal, !goal.isEmpty else {
            return "Not set"
        }

        return goal.capitalized
    }

    private var baselineSummary: String {
        guard let baseline = self.profile?.bodyBaseline else {
            return "Height, weight, and body trend pending"
        }

        let height = baseline.heightInches.map { "\(Int($0)) in" } ?? "height pending"
        let weight = baseline.weightPounds.map { "\(Int($0)) lb" } ?? "weight pending"
        return "\(height) · \(weight)"
    }

    private var dietarySummary: String {
        guard let dietary = self.profile?.dietaryConstraints else {
            return "No constraints set"
        }

        let diet = dietary.preferences.isEmpty ? "balanced" : dietary.preferences.joined(separator: ", ")
        let allergies = dietary.allergies.isEmpty ? "no allergies listed" : dietary.allergies.joined(separator: ", ")
        return "\(diet) · \(allergies)"
    }

    private var lifestyleSummary: String {
        guard let lifestyle = self.profile?.lifestyle else {
            return "Schedule and training rhythm pending"
        }

        return "\(lifestyle.workoutsPerWeek)x workouts · \(Int(lifestyle.sleepGoalHours))h sleep"
    }

    private func load() async {
        self.isLoading = true
        defer { self.isLoading = false }

        do {
            let user = try await self.supabaseDatabase.currentUser()
            self.currentUser = user
            if let user {
                self.profile = try await self.supabaseDatabase.fetchProfile(user.id)
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

    private func signOut() async {
        self.isSigningOut = true
        defer { self.isSigningOut = false }

        self.store.send(.accountSignOutTapped)
        self.dismiss()
    }

    private func deleteAccount() async {
        self.isDeletingAccount = true
        defer { self.isDeletingAccount = false }

        self.store.send(.accountDeleteTapped)
        self.dismiss()
    }
}

struct PhaseDetailRow: View {
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

// swiftlint:disable file_length

import Analytics
import ComposableArchitecture
import Dependencies
import DesignSystem
import SubscriptionClient
import SupabaseClient
import SwiftUI

struct MenuSheetView: View {
    let store: StoreOf<AppFeature>

    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    private let toolTopics: [MenuToolTopic] = [.snapshot, .meals, .training]
    private let settingsTopics: [MenuSettingsTopic] = [.permissions, .help]

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Menu") {
                PhaseHero(icon: "person.crop.circle", title: "Robert", detail: "Goal: stronger, leaner, consistent")
                MenuToolSection(topics: self.toolTopics)
                MenuSettingsSection(topics: self.settingsTopics)
                NavigationLink {
                    AccountSubscriptionView(store: self.store)
                } label: {
                    PhaseNavigationRow(
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

private struct MenuToolSection: View {
    let topics: [MenuToolTopic]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Tools")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.topics) { topic in
                    NavigationLink {
                        MenuToolDetailView(topic: topic)
                    } label: {
                        PhaseNavigationRow(item: topic.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("menu.tool.\(topic.accessibilityID)")
                }
            }
        }
    }
}

private struct MenuSettingsSection: View {
    let topics: [MenuSettingsTopic]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Settings")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.topics) { topic in
                    NavigationLink {
                        MenuSettingsDetailView(topic: topic)
                    } label: {
                        PhaseNavigationRow(item: topic.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("menu.settings.\(topic.accessibilityID)")
                }
            }
        }
    }
}

private struct MenuToolDetailView: View {
    let topic: MenuToolTopic

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: self.topic.primarySectionTitle, items: self.topic.primaryItems)
            DashboardSection(title: "Next", items: self.topic.nextItems)
        }
    }
}

private struct MenuSettingsDetailView: View {
    let topic: MenuSettingsTopic

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: self.topic.primarySectionTitle, items: self.topic.primaryItems)
            DashboardSection(title: "What changes next", items: self.topic.nextItems)
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

struct HelpView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme
    private let featuredTopics: [HelpArticleTopic] = [.eatingOut, .notificationPreferences]
    private let quickSettings: [HelpQuickSetting] = [.healthKit, .camera, .account]

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Help") {
                PhaseHero(
                    icon: "magnifyingglass",
                    title: "Search articles, settings, or ask a question",
                    detail: "Short answers first, settings and coach nearby."
                )
                HelpArticleSection(topics: self.featuredTopics)
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
                HelpSettingsSection(settings: self.quickSettings)
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

private struct HelpArticleSection: View {
    let topics: [HelpArticleTopic]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Featured")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.topics) { topic in
                    NavigationLink {
                        HelpArticleDetailView(topic: topic)
                    } label: {
                        PhaseNavigationRow(item: topic.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("help.article.\(topic.accessibilityID)")
                }
            }
        }
    }
}

private struct HelpSettingsSection: View {
    let settings: [HelpQuickSetting]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Quick settings")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.settings) { setting in
                    NavigationLink {
                        HelpQuickSettingDetailView(setting: setting)
                    } label: {
                        PhaseNavigationRow(item: setting.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("help.setting.\(setting.accessibilityID)")
                }
            }
        }
    }
}

private struct HelpArticleDetailView: View {
    let topic: HelpArticleTopic

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: "Use this when", items: self.topic.useCases)
            DashboardSection(title: "Playbook", items: self.topic.playbook)
        }
    }
}

private struct HelpQuickSettingDetailView: View {
    let setting: HelpQuickSetting

    var body: some View {
        PhaseScroll(title: self.setting.title) {
            PhaseHero(icon: self.setting.icon, title: self.setting.headline, detail: self.setting.detail)
            DashboardSection(title: "Current state", items: self.setting.currentState)
            DashboardSection(title: "Next", items: self.setting.nextItems)
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

private enum MenuToolTopic: CaseIterable, Equatable, Identifiable {
    case snapshot
    case meals
    case training

    var id: Self { self }

    var title: String {
        switch self {
        case .snapshot:
            "Snapshot"
        case .meals:
            "Meals"
        case .training:
            "Training"
        }
    }

    var accessibilityID: String {
        switch self {
        case .snapshot:
            "snapshot"
        case .meals:
            "meals"
        case .training:
            "training"
        }
    }

    var icon: String {
        switch self {
        case .snapshot:
            "gauge.with.dots.needle.67percent"
        case .meals:
            "fork.knife"
        case .training:
            "figure.run"
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .snapshot:
            .init(title: self.title, detail: "Health Score, recap, inflows/outflows", icon: self.icon)
        case .meals:
            .init(title: self.title, detail: "Log, recipes, meal plans, groceries", icon: self.icon)
        case .training:
            .init(title: self.title, detail: "Workout log, plans, activity tracker", icon: self.icon)
        }
    }

    var headline: String {
        switch self {
        case .snapshot:
            "One place to understand today"
        case .meals:
            "Nutrition tools stay close to the next decision"
        case .training:
            "Training context explains appetite and recovery"
        }
    }

    var detail: String {
        switch self {
        case .snapshot:
            "The menu snapshot connects Health Score, inflows/outflows, and the next action without adding another tab."
        case .meals:
            "Meal logging, recipe planning, restaurant guidance, and groceries are grouped around what to eat next."
        case .training:
            "Workout logs, plans, and activity tracking stay lightweight while they inform nutrition and coaching."
        }
    }

    var primarySectionTitle: String {
        switch self {
        case .snapshot:
            "Today"
        case .meals:
            "Nutrition surfaces"
        case .training:
            "Training surfaces"
        }
    }

    var primaryItems: [PhaseRowItem] {
        switch self {
        case .snapshot:
            [
                .init(
                    title: "Health Score",
                    detail: "Progress is steady at 89",
                    icon: "gauge.with.dots.needle.67percent"
                ),
                .init(
                    title: "Inflows / Outflows",
                    detail: "+230 net calories so far",
                    icon: "arrow.left.arrow.right.circle.fill"
                ),
                .init(title: "Next action", detail: "Eat a protein-forward dinner", icon: "arrow.up.right.circle.fill")
            ]
        case .meals:
            [
                .init(title: "Daily log", detail: "Meals, photos, and macro context", icon: "calendar"),
                .init(title: "Recipes", detail: "Reusable meals with macro fit", icon: "book.pages"),
                .init(title: "Restaurant guide", detail: "Order choices without guessing", icon: "fork.knife.circle")
            ]
        case .training:
            [
                .init(title: "Workout Log", detail: "Last session and upcoming slot", icon: "list.bullet.clipboard"),
                .init(
                    title: "Activity Tracker",
                    detail: "Steps, active energy, and minutes",
                    icon: "waveform.path.ecg"
                ),
                .init(title: "Workout Plans", detail: "Next sessions matched to recovery", icon: "dumbbell")
            ]
        }
    }

    var nextItems: [PhaseRowItem] {
        switch self {
        case .snapshot:
            [
                .init(
                    title: "Deep links",
                    detail: "Snapshot cards route to Dashboard and Progress detail pages",
                    icon: "link"
                ),
                .init(title: "Live data", detail: "HealthKit acceptance completes on physical device", icon: "iphone")
            ]
        case .meals:
            [
                .init(
                    title: "Quick route",
                    detail: "Use the Meals tab for logging and planning",
                    icon: "arrow.up.right.circle.fill"
                ),
                .init(
                    title: "Coach context",
                    detail: "Meal history feeds coaching when helpful",
                    icon: "bubble.left.fill"
                )
            ]
        case .training:
            [
                .init(
                    title: "Quick route",
                    detail: "Use the Exercise tab for tools",
                    icon: "arrow.up.right.circle.fill"
                ),
                .init(
                    title: "Guardrail",
                    detail: "FuelWell stays nutrition-first, not a full training app",
                    icon: "shield.lefthalf.filled"
                )
            ]
        }
    }
}

private enum MenuSettingsTopic: CaseIterable, Equatable, Identifiable {
    case permissions
    case help

    var id: Self { self }

    var title: String {
        switch self {
        case .permissions:
            "Permissions"
        case .help:
            "Help"
        }
    }

    var accessibilityID: String {
        switch self {
        case .permissions:
            "permissions"
        case .help:
            "help"
        }
    }

    var icon: String {
        switch self {
        case .permissions:
            "lock.shield"
        case .help:
            "questionmark.circle"
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .permissions:
            .init(title: self.title, detail: "HealthKit, notifications, camera", icon: self.icon)
        case .help:
            .init(title: self.title, detail: "Articles, support, feedback", icon: self.icon)
        }
    }

    var headline: String {
        switch self {
        case .permissions:
            "Control what FuelWell can read"
        case .help:
            "Find answers without leaving the app"
        }
    }

    var detail: String {
        switch self {
        case .permissions:
            "FuelWell asks for HealthKit, notifications, and camera access only where they affect the product."
        case .help:
            "Help keeps guidance, support, and feedback close to the screen where the question appears."
        }
    }

    var primarySectionTitle: String {
        switch self {
        case .permissions:
            "Permission map"
        case .help:
            "Support map"
        }
    }

    var primaryItems: [PhaseRowItem] {
        switch self {
        case .permissions:
            [
                .init(title: "HealthKit", detail: "Steps, energy, workouts, body mass, sleep", icon: "heart"),
                .init(title: "Notifications", detail: "Proactive nudges and reminders", icon: "bell"),
                .init(title: "Camera", detail: "Meal photos and body-photo check-ins", icon: "camera")
            ]
        case .help:
            [
                .init(title: "Featured articles", detail: "Short, actionable product guidance", icon: "book.pages"),
                .init(title: "Feedback", detail: "Send bugs or confusing moments to the team", icon: "paperplane.fill"),
                .init(
                    title: "Account help",
                    detail: "Profile, sign out, and subscription status",
                    icon: "person.crop.circle"
                )
            ]
        }
    }

    var nextItems: [PhaseRowItem] {
        switch self {
        case .permissions:
            [
                .init(title: "System controls", detail: "iOS Settings remains the source of truth", icon: "gearshape"),
                .init(
                    title: "Fallbacks",
                    detail: "Manual flows stay available when a permission is denied",
                    icon: "hand.raised"
                )
            ]
        case .help:
            [
                .init(title: "Article depth", detail: "Help article details are now real subpages", icon: "doc.text"),
                .init(
                    title: "Founder feedback",
                    detail: "Robert and Max can triage support notes from Supabase",
                    icon: "tray.full"
                )
            ]
        }
    }
}

private enum HelpArticleTopic: CaseIterable, Equatable, Identifiable {
    case eatingOut
    case notificationPreferences

    var id: Self { self }

    var title: String {
        switch self {
        case .eatingOut:
            "Eating Out"
        case .notificationPreferences:
            "Notification Preferences"
        }
    }

    var accessibilityID: String {
        switch self {
        case .eatingOut:
            "eating-out"
        case .notificationPreferences:
            "notification-preferences"
        }
    }

    var icon: String {
        switch self {
        case .eatingOut:
            "book.pages"
        case .notificationPreferences:
            "bell"
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .eatingOut:
            .init(title: "Eating out without guessing", detail: "3-minute read · one order to try", icon: self.icon)
        case .notificationPreferences:
            .init(title: "Notification preferences", detail: "Nudges without guilt", icon: self.icon)
        }
    }

    var headline: String {
        switch self {
        case .eatingOut:
            "Pick the easiest high-protein win"
        case .notificationPreferences:
            "Nudges should feel useful, not noisy"
        }
    }

    var detail: String {
        switch self {
        case .eatingOut:
            "When you are at a restaurant, FuelWell should reduce the decision to one reliable order shape."
        case .notificationPreferences:
            "Notifications stay focused on timing, recovery, and missed context instead of guilt or streak pressure."
        }
    }

    var useCases: [PhaseRowItem] {
        switch self {
        case .eatingOut:
            [
                .init(
                    title: "Business meal",
                    detail: "Choose protein first, then add the safest carb",
                    icon: "briefcase"
                ),
                .init(
                    title: "Unknown menu",
                    detail: "Ask for grilled, sauce on side, vegetable default",
                    icon: "menucard"
                )
            ]
        case .notificationPreferences:
            [
                .init(title: "Dinner window", detail: "Remind only when dinner context is missing", icon: "clock"),
                .init(
                    title: "Recovery day",
                    detail: "Suggest walking or rest when activity is low",
                    icon: "figure.walk"
                )
            ]
        }
    }

    var playbook: [PhaseRowItem] {
        switch self {
        case .eatingOut:
            [
                .init(
                    title: "Default order",
                    detail: "Lean protein, vegetable, simple carb, sauce separate",
                    icon: "checkmark.circle.fill"
                ),
                .init(
                    title: "Log after",
                    detail: "Use photo-first logging instead of exact menu math",
                    icon: "camera.fill"
                )
            ]
        case .notificationPreferences:
            [
                .init(title: "Tone", detail: "Cause-first, non-judgmental, one action", icon: "text.bubble"),
                .init(
                    title: "Control",
                    detail: "User can deny notifications and keep core flows",
                    icon: "hand.raised.fill"
                )
            ]
        }
    }
}

private enum HelpQuickSetting: CaseIterable, Equatable, Identifiable {
    case healthKit
    case camera
    case account

    var id: Self { self }

    var title: String {
        switch self {
        case .healthKit:
            "HealthKit"
        case .camera:
            "Camera"
        case .account:
            "Account"
        }
    }

    var accessibilityID: String {
        switch self {
        case .healthKit:
            "healthkit"
        case .camera:
            "camera"
        case .account:
            "account"
        }
    }

    var icon: String {
        switch self {
        case .healthKit:
            "heart"
        case .camera:
            "camera"
        case .account:
            "person.crop.circle"
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .healthKit:
            .init(title: self.title, detail: "Connect recovery and activity data", icon: self.icon)
        case .camera:
            .init(title: self.title, detail: "Required for photo meal logging", icon: self.icon)
        case .account:
            .init(title: self.title, detail: "Profile and sign out", icon: self.icon)
        }
    }

    var headline: String {
        switch self {
        case .healthKit:
            "Health data powers context"
        case .camera:
            "Photos make logging faster"
        case .account:
            "Account keeps profile and subscription together"
        }
    }

    var detail: String {
        switch self {
        case .healthKit:
            "Steps, workouts, active energy, body mass, and sleep can improve the next decision once connected."
        case .camera:
            "Camera access is used for meal photos and optional body-photo check-ins."
        case .account:
            "Profile, authentication, and Founders 100 status live in the Account screen."
        }
    }

    var currentState: [PhaseRowItem] {
        switch self {
        case .healthKit:
            [
                .init(title: "Preview mode", detail: "Simulator uses deterministic HealthKit values", icon: "iphone"),
                .init(title: "Real device", detail: "Requires iOS Settings permission", icon: "heart.text.square")
            ]
        case .camera:
            [
                .init(
                    title: "Meal photos",
                    detail: "Photo-first logging remains the fastest entry",
                    icon: "fork.knife"
                ),
                .init(title: "Body photos", detail: "Weekly check-ins are optional and private", icon: "lock.shield")
            ]
        case .account:
            [
                .init(title: "Profile", detail: "Goal, baseline, dietary context", icon: "person.text.rectangle"),
                .init(title: "Subscription", detail: "Pilot and Founders 100 status", icon: "sparkles")
            ]
        }
    }

    var nextItems: [PhaseRowItem] {
        switch self {
        case .healthKit:
            [
                .init(
                    title: "Denied access",
                    detail: "FuelWell shows fallback states instead of blocking use",
                    icon: "hand.raised"
                ),
                .init(
                    title: "Acceptance gate",
                    detail: "Validate live HealthKit on physical device",
                    icon: "checkmark.seal"
                )
            ]
        case .camera:
            [
                .init(title: "Denied access", detail: "Manual meal entry remains available", icon: "square.and.pencil"),
                .init(
                    title: "Future sync",
                    detail: "Body photos stay local until account sync is enabled",
                    icon: "arrow.triangle.2.circlepath"
                )
            ]
        case .account:
            [
                .init(
                    title: "Account route",
                    detail: "Open Menu > Account for live account actions",
                    icon: "arrow.up.right.circle.fill"
                ),
                .init(
                    title: "Support",
                    detail: "Send feedback from Help if an account action fails",
                    icon: "paperplane.fill"
                )
            ]
        }
    }
}

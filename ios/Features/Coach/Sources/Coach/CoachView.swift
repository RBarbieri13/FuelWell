import ComposableArchitecture
import DesignSystem
import SwiftUI

public struct CoachView: View {
    @Bindable public var store: StoreOf<CoachFeature>
    @Environment(\.theme) private var theme
    @State private var isContextLauncherPresented = false

    public init(store: StoreOf<CoachFeature>) {
        self.store = store
    }

    public var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                    CoachHeroView()

                    if let banner = self.store.banner {
                        CoachBannerView(banner: banner)
                    }

                    VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                        Text("Conversation")
                            .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                            .fontWeight(.bold)
                            .foregroundStyle(self.theme.color.text.primary.color)

                        VStack(spacing: self.theme.spacing.sm) {
                            ForEach(self.store.messages) { message in
                                CoachMessageBubble(message: message)
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                        Text("Quick prompts")
                            .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                            .fontWeight(.bold)
                            .foregroundStyle(self.theme.color.text.primary.color)

                        VStack(spacing: self.theme.spacing.sm) {
                            ForEach(CoachQuickPrompt.allCases) { prompt in
                                Button {
                                    self.store.send(.quickPromptTapped(prompt))
                                } label: {
                                    HStack(spacing: self.theme.spacing.md) {
                                        Image(systemName: prompt.icon)
                                            .font(.system(size: 18, weight: .semibold))
                                            .foregroundStyle(self.theme.color.primary.accent.color)
                                            .frame(width: 42, height: 42)
                                            .background(self.theme.color.primary.accent.color.opacity(0.12))
                                            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

                                        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                                            Text(prompt.title)
                                                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                                                .fontWeight(.bold)
                                                .foregroundStyle(self.theme.color.text.primary.color)
                                            Text(prompt.detail)
                                                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                                                .fontWeight(.semibold)
                                                .foregroundStyle(self.theme.color.text.body.color)
                                        }

                                        Spacer()

                                        Image(systemName: "paperplane.fill")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundStyle(self.theme.color.text.muted.color)
                                    }
                                    .phaseCoachCard(padding: self.theme.spacing.md)
                                }
                                .buttonStyle(.plain)
                                .disabled(self.store.isStreaming)
                            }
                        }
                    }

#if DEBUG
                    Button {
                        self.store.send(.macroGapDetected)
                    } label: {
                        Label("Test proactive nudge", systemImage: "bell.badge")
                            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(self.theme.color.bg.elevated.color)
                    .disabled(self.store.isStreaming)
                    .accessibilityIdentifier("coach.nudge-test")
#endif
                }
                .padding(self.theme.spacing.md)
                .padding(.bottom, self.theme.spacing.xl)
            }

            CoachComposerView(
                store: self.store,
                onAddContext: {
                    self.isContextLauncherPresented = true
                }
            )
        }
        .background(self.theme.color.bg.base.color)
        .navigationTitle("Coach")
        .sheet(isPresented: self.$isContextLauncherPresented) {
            NavigationStack {
                ScrollView {
                    FuelWellActionLauncherGrid(
                        title: "Add context to Coach",
                        detail: "Send a photo, file, menu, workout, or short note so the coach can reason from what you provide.",
                        items: CoachContextAction.allCases.map(\.launcherItem),
                        onSelect: { item in
                            guard let action = CoachContextAction(rawValue: item.id) else { return }
                            self.store.send(.composerChanged(action.prompt))
                            self.isContextLauncherPresented = false
                        }
                    )
                    .padding(self.theme.spacing.md)
                }
                .background(self.theme.color.bg.base.color)
                .navigationTitle("Add context")
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Close", systemImage: "xmark") {
                            self.isContextLauncherPresented = false
                        }
                        .labelStyle(.iconOnly)
                        .tint(self.theme.color.text.body.color)
                    }
                }
            }
            .presentationDetents([.medium, .large])
            .presentationDragIndicator(.visible)
        }
        .onAppear {
            self.store.send(.onAppear)
        }
    }
}

private struct CoachHeroView: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Image(systemName: "bubble.left.and.bubble.right.fill")
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)

            Text("Ask for the next useful decision")
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            Text("FuelWell uses your recent logs and current trend context to keep coaching practical.")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .phaseCoachCard()
    }
}

private struct CoachBannerView: View {
    let banner: CoachBanner
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            Image(systemName: self.banner.icon)
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(self.theme.color.text.onDark.color)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.banner.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                Text(self.banner.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.onDarkMuted.color)
            }
        }
        .foregroundStyle(self.theme.color.text.onDark.color)
        .phaseCoachDarkCard()
        .accessibilityIdentifier("coach.banner")
    }
}

private struct CoachMessageBubble: View {
    let message: CoachMessage
    @Environment(\.theme) private var theme

    var body: some View {
        HStack {
            if self.message.role == .user {
                Spacer(minLength: self.theme.spacing.xl)
            }

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.message.role.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.labelColor)

                Text(self.message.text.isEmpty ? "Thinking..." : self.message.text)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.textColor)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.theme.spacing.md)
            .background(self.backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(self.borderColor, lineWidth: 1)
            )

            if self.message.role == .coach {
                Spacer(minLength: self.theme.spacing.xl)
            }
        }
    }

    private var backgroundColor: Color {
        self.message.role == .coach
            ? self.theme.color.bg.surface.color
            : self.theme.color.bg.elevated.color
    }

    private var borderColor: Color {
        self.message.role == .coach
            ? self.theme.color.bg.borderSoft.color
            : self.theme.color.bg.elevated.color
    }

    private var labelColor: Color {
        self.message.role == .coach
            ? self.theme.color.text.secondary.color
            : self.theme.color.text.onDarkMuted.color
    }

    private var textColor: Color {
        self.message.role == .coach
            ? self.theme.color.text.primary.color
            : self.theme.color.text.onDark.color
    }
}

private struct CoachComposerView: View {
    @Bindable var store: StoreOf<CoachFeature>
    let onAddContext: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.sm) {
            Button(action: self.onAddContext) {
                Image(systemName: "plus")
                    .font(.system(size: 17, weight: .bold))
                    .frame(width: 42, height: 42)
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .background(self.theme.color.primary.accent.color.opacity(0.12))
                    .clipShape(Circle())
            }
            .disabled(self.store.isStreaming)
            .accessibilityIdentifier("coach.add-context")
            .accessibilityLabel("Add photo, file, menu, or workout context")

            TextField(
                "Ask FuelWell or attach context",
                text: Binding(
                    get: { self.store.composerText },
                    set: { self.store.send(.composerChanged($0)) }
                ),
                axis: .vertical
            )
            .lineLimit(1...4)
            .textInputAutocapitalization(.sentences)
            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
            .padding(.horizontal, self.theme.spacing.md)
            .padding(.vertical, self.theme.spacing.sm)
            .background(self.theme.color.bg.surface.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.lg)
                    .stroke(self.theme.color.bg.border.color, lineWidth: 1)
            )
            .disabled(self.store.isStreaming)
            .accessibilityIdentifier("coach.composer")

            Button {
                self.store.send(.sendTapped)
            } label: {
                Image(systemName: self.store.isStreaming ? "hourglass" : "arrow.up")
                    .font(.system(size: 17, weight: .bold))
                    .frame(width: 42, height: 42)
                    .foregroundStyle(self.theme.color.text.onDark.color)
                    .background(self.theme.color.bg.elevated.color)
                    .clipShape(Circle())
            }
            .disabled(
                self.store.composerText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
                    self.store.isStreaming
            )
            .accessibilityIdentifier("coach.send")
        }
        .padding(self.theme.spacing.md)
        .background(.ultraThinMaterial)
    }
}

private enum CoachContextAction: String, CaseIterable, Identifiable {
    case foodPhoto = "food-photo"
    case menu = "menu"
    case file = "file"
    case screenshot = "screenshot"
    case workout = "workout"
    case exercise = "exercise"

    var id: String { self.rawValue }

    var launcherItem: FuelWellActionLauncherItem {
        switch self {
        case .foodPhoto:
            .init(
                id: self.rawValue,
                title: "Food photo",
                detail: "Estimate nutrition",
                systemImage: "camera.fill",
                tone: .nutrition
            )
        case .menu:
            .init(
                id: self.rawValue,
                title: "Menu",
                detail: "Choose a meal",
                systemImage: "menucard.fill",
                tone: .nutrition
            )
        case .file:
            .init(
                id: self.rawValue,
                title: "File",
                detail: "Summarize context",
                systemImage: "doc.fill",
                tone: .insight
            )
        case .screenshot:
            .init(
                id: self.rawValue,
                title: "Screenshot",
                detail: "Explain what you see",
                systemImage: "photo.on.rectangle.angled",
                tone: .insight
            )
        case .workout:
            .init(
                id: self.rawValue,
                title: "Workout",
                detail: "Review a session",
                systemImage: "figure.strengthtraining.traditional",
                tone: .activity
            )
        case .exercise:
            .init(
                id: self.rawValue,
                title: "Exercise",
                detail: "Estimate burn",
                systemImage: "figure.run",
                tone: .activity
            )
        }
    }

    var prompt: String {
        switch self {
        case .foodPhoto:
            "I want to send a food photo. Please identify the meal, estimate calories and macros, call out uncertainty, and tell me what choice should come next."
        case .menu:
            "I want to send a restaurant menu. Please help me pick the best meal for my current calories, protein, and goals."
        case .file:
            "I want to attach a file. Please summarize the health or nutrition signals, ask for missing context, and turn it into a simple next action."
        case .screenshot:
            "I want to send a screenshot. Please read the visible details, explain what matters, and recommend the next FuelWell action."
        case .workout:
            "I want to send a workout. Please summarize the muscles trained, intensity, likely recovery cost, and how it changes today's nutrition."
        case .exercise:
            "I want to log an exercise. Please estimate calorie burn from activity type, duration or distance, body weight, and effort."
        }
    }
}

extension CoachQuickPrompt {
    var icon: String {
        switch self {
        case .adjustDay:
            "wand.and.stars"
        case .restaurantOrder:
            "fork.knife"
        case .explainToday:
            "text.bubble"
        }
    }

    var detail: String {
        switch self {
        case .adjustDay:
            "Rebalance from current logs"
        case .restaurantOrder:
            "Pick an easy restaurant option"
        case .explainToday:
            "Short recap with one next action"
        }
    }
}

extension CoachBanner {
    var icon: String {
        switch self {
        case .featureDisabled:
            "pause.circle.fill"
        case .budgetExceeded:
            "gauge.with.dots.needle.bottom.50percent"
        case .offline:
            "wifi.exclamationmark"
        case .nudgeScheduled:
            "bell.badge.fill"
        }
    }
}

extension CoachMessage.Role {
    var title: String {
        switch self {
        case .coach:
            "FuelWell"
        case .user:
            "You"
        }
    }
}

extension View {
    func phaseCoachCard(padding: CGFloat? = nil) -> some View {
        modifier(CoachCardModifier(padding: padding, dark: false))
    }

    func phaseCoachDarkCard(padding: CGFloat? = nil) -> some View {
        modifier(CoachCardModifier(padding: padding, dark: true))
    }
}

private struct CoachCardModifier: ViewModifier {
    let padding: CGFloat?
    let dark: Bool
    @Environment(\.theme) private var theme

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.padding ?? self.theme.spacing.lg)
            .background(
                self.dark ? self.theme.color.bg.elevated.color : self.theme.color.bg.surface.color
            )
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
            .overlay(
                RoundedRectangle(cornerRadius: self.theme.radius.md)
                    .stroke(
                        self.dark ? self.theme.color.bg.elevated.color : self.theme.color.bg.borderSoft.color,
                        lineWidth: 1
                    )
            )
    }
}

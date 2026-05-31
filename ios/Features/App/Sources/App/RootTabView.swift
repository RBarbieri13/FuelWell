import ComposableArchitecture
import DesignSystem
import Nutrition
import NutritionDomain
import SwiftUI

public struct RootTabView: View {
    @Bindable public var store: StoreOf<AppFeature>
    @Environment(\.theme) private var theme

    public init(store: StoreOf<AppFeature>) {
        self.store = store
    }

    public var body: some View {
        ZStack(alignment: .bottom) {
            self.theme.color.bg.base.color
                .ignoresSafeArea()

            TabView(selection: self.$store.selectedTab.sending(\.tabSelected)) {
                ForEach(AppTab.allCases) { tab in
                    NavigationStack {
                        if tab == .meals {
                            DailyLogView(
                                store: Store(initialState: DailyLogFeature.State()) {
                                    DailyLogFeature()
                                }
                            )
                        } else if tab == .home {
                            DashboardView(store: self.store)
                        } else if tab == .coach {
                            CoachChatView()
                        } else if tab == .exercise {
                            ExerciseActivityView()
                        } else if tab == .progress {
                            ProgressOverviewView()
                        } else {
                            TabHubView(tab: tab)
                        }
                    }
                    .tag(tab)
                    .tabItem {
                        Label(tab.title, systemImage: tab.systemImage)
                    }
                    .qualityID(tab.qualityIdentifier)
                }
            }
            .tint(self.theme.color.primary.green.color)
        }
    }
}

extension AppTab {
    var qualityIdentifier: String {
        switch self {
        case .home:
            "tab.home"
        case .meals:
            QualityIdentifier.tabMeals
        case .coach:
            QualityIdentifier.tabCoach
        case .exercise:
            QualityIdentifier.tabExercise
        case .progress:
            QualityIdentifier.tabProgress
        }
    }
}

private struct TabHubView: View {
    let tab: AppTab

    @Environment(\.theme) private var theme
    private let macroSnapshot = MacroDaySnapshot.preview

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                TabHeroView(tab: self.tab)

                VStack(spacing: self.theme.spacing.md) {
                    ForEach(self.items, id: \.title) { item in
                        TabActionRow(item: item)
                    }
                }
            }
            .padding(.horizontal, self.theme.spacing.md)
            .padding(.top, self.theme.spacing.lg)
            .padding(.bottom, self.theme.spacing.fourXL)
        }
        .background(self.theme.color.bg.base.color)
        .navigationTitle(self.tab.screenTitle)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Menu", systemImage: "line.3.horizontal") {}
                    .tint(self.theme.color.text.body.color)
            }

            ToolbarItem(placement: .topBarTrailing) {
                Button("Help", systemImage: "questionmark.circle") {}
                    .tint(self.theme.color.text.body.color)
            }
        }
    }

    private var items: [TabHubItem] {
        switch self.tab {
        case .home:
            [
                .init(title: "Health Score", detail: "Building your baseline"),
                .init(title: "Start here: log your first meal", detail: "Unlock today's first verdict"),
                .init(title: "Verdict", detail: self.macroSnapshot.verdict.headline)
            ]
        case .meals:
            [
                .init(
                    title: "Today's plate",
                    detail: "\(self.macroSnapshot.remaining.displayClamped.macros.protein)g protein left"
                ),
                .init(title: "Meal Log", detail: self.macroSnapshot.recommendations[0].detail),
                .init(title: "Restaurant Guidance", detail: "Choose what to order here")
            ]
        case .coach:
            [
                .init(title: "Ask FuelWell", detail: "Context-aware coaching"),
                .init(title: "Daily Recap", detail: "Neutral review before sleep"),
                .init(title: "Next action", detail: "One useful step for your day")
            ]
        case .exercise:
            [
                .init(title: "Today's workout", detail: "Workout, rest day, or active minutes"),
                .init(title: "This week", detail: "Training rhythm and recovery"),
                .init(title: "Workout Log", detail: "Open the in-session logger")
            ]
        case .progress:
            [
                .init(title: "Trend", detail: "Progress and projection"),
                .init(title: "Macro adherence", detail: "Deep-link target for Macro History"),
                .init(title: "Recovery", detail: "Unlocks with wearable data")
            ]
        }
    }
}

private struct TabHeroView: View {
    let tab: AppTab

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Image(systemName: self.tab.systemImage)
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(self.iconColor)
                .accessibilityHidden(true)

            Text(self.tab.screenTitle)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .foregroundStyle(self.titleColor)

            Text(self.subtitle)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.medium)
                .foregroundStyle(self.bodyColor)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.background)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
    }

    private var subtitle: String {
        switch self.tab {
        case .home:
            "The daily loop starts here."
        case .meals:
            "Log, adjust, and keep the day on track."
        case .coach:
            "Ask for the next useful decision."
        case .exercise:
            "Training and activity stay connected to recovery."
        case .progress:
            "Trends point to the next action."
        }
    }

    private var background: some ShapeStyle {
        self.tab == .coach ? self.theme.color.bg.elevated.color : self.theme.color.bg.surface.color
    }

    private var iconColor: Color {
        self.tab == .coach ? self.theme.color.primary.green.color : self.theme.color.primary.accent.color
    }

    private var titleColor: Color {
        self.tab == .coach ? self.theme.color.text.onDark.color : self.theme.color.text.primary.color
    }

    private var bodyColor: Color {
        self.tab == .coach ? self.theme.color.text.onDark.color : self.theme.color.text.body.color
    }
}

private struct TabActionRow: View {
    let item: TabHubItem

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.item.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(self.theme.color.text.muted.color)
                .accessibilityHidden(true)
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

private struct TabHubItem: Equatable {
    let title: String
    let detail: String
}

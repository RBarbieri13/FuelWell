import Activity
import Coach
import ComposableArchitecture
import DesignSystem
import Nutrition
import Progress
import SwiftUI

public struct RootTabView: View {
    @Bindable public var store: StoreOf<AppFeature>
    private let activityStore: StoreOf<ActivityFeature>
    private let coachStore: StoreOf<CoachFeature>
    private let progressStore: StoreOf<ProgressFeature>
    @Environment(\.theme) private var theme
    @State private var previousTab: AppTab

    public init(store: StoreOf<AppFeature>) {
        self.store = store
        self.activityStore = Store(initialState: ActivityFeature.State()) {
            ActivityFeature()
        }
        self.coachStore = Store(initialState: CoachFeature.State()) {
            CoachFeature()
        }
        self.progressStore = Store(initialState: ProgressFeature.State()) {
            ProgressFeature()
        }
        self._previousTab = State(initialValue: store.selectedTab)
    }

    public var body: some View {
        ZStack(alignment: .bottom) {
            self.theme.color.bg.base.color
                .ignoresSafeArea()

            TabView(selection: self.$store.selectedTab.sending(\.tabSelected)) {
                ForEach(AppTab.allCases) { tab in
                    NavigationStack {
                        switch tab {
                        case .home:
                            DashboardView(store: self.store)
                        case .meals:
                            DailyLogView(
                                store: Store(initialState: DailyLogFeature.State()) {
                                    DailyLogFeature()
                                }
                            )
                        case .coach:
                            CoachView(store: self.coachStore)
                        case .exercise:
                            ExerciseActivityView(store: self.activityStore)
                        case .progress:
                            ProgressOverviewView(store: self.progressStore)
                        }
                    }
                    .tag(tab)
                    .tabItem {
                        Label(tab.title, systemImage: tab.tabBarSystemImage)
                    }
                    .qualityID(tab.qualityIdentifier)
                }
            }
            .tint(self.store.selectedTab.tabTint(theme: self.theme))
            .toolbarBackground(self.theme.color.bg.surface.color, for: .tabBar)
            .toolbarBackground(.visible, for: .tabBar)
            .onChange(of: self.store.selectedTab) { _, tab in
                guard tab != self.previousTab else { return }
                FuelWellHaptics.tap()
                self.previousTab = tab
            }
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

    var tabBarSystemImage: String {
        self == .coach ? "bubble.left.and.bubble.right.circle.fill" : self.systemImage
    }

    func tabTint(theme: Theme) -> Color {
        switch self {
        case .home:
            theme.color.primary.green.color
        case .meals:
            theme.color.macro.protein.color
        case .coach:
            theme.color.primary.accent.color
        case .exercise:
            theme.color.semantic.warning.color
        case .progress:
            theme.color.semantic.info.color
        }
    }
}

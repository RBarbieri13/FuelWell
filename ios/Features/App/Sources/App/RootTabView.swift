import Coach
import ComposableArchitecture
import DesignSystem
import Nutrition
import SwiftUI

public struct RootTabView: View {
    @Bindable public var store: StoreOf<AppFeature>
    private let coachStore: StoreOf<CoachFeature>
    @Environment(\.theme) private var theme

    public init(store: StoreOf<AppFeature>) {
        self.store = store
        self.coachStore = Store(initialState: CoachFeature.State()) {
            CoachFeature()
        }
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
                            ExerciseActivityView()
                        case .progress:
                            ProgressOverviewView()
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

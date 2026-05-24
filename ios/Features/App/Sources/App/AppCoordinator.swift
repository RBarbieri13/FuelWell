import ComposableArchitecture
import DesignSystem
import SwiftUI

public struct AppCoordinator: View {
    @Bindable public var store: StoreOf<AppFeature>

    public init(store: StoreOf<AppFeature>) {
        self.store = store
    }

    public var body: some View {
        ZStack {
            switch self.store.phase {
            case .splash:
                SplashView(store: self.store)

            case .dashboardPlaceholder:
                DashboardPlaceholderView()
            }
        }
        .environment(\.theme, self.store.theme)
        .task {
            await self.store.send(.onAppear).finish()
        }
    }
}

private struct DashboardPlaceholderView: View {
    @Environment(\.theme) private var theme

    var body: some View {
        ZStack {
            self.theme.color.bg.base.color
                .ignoresSafeArea()

            Text("Dashboard placeholder - Phase 3 lands the real one.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .foregroundStyle(self.theme.color.text.body.color)
                .padding(self.theme.spacing.md)
        }
    }
}

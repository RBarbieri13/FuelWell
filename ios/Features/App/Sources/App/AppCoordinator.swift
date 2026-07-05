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

            case .mainTabs:
                RootTabView(store: self.store)
            }
        }
        .environment(\.theme, self.store.theme)
        .task {
            await self.store.send(.onAppear).finish()
        }
    }
}

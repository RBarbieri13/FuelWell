import ComposableArchitecture
import DesignSystem
import SwiftUI

public struct SplashView: View {
    @Bindable public var store: StoreOf<AppFeature>
    @Environment(\.theme) private var theme

    public init(store: StoreOf<AppFeature>) {
        self.store = store
    }

    public var body: some View {
        ZStack {
            self.theme.color.bg.base.color
                .ignoresSafeArea()

            Text("FuelWell")
                .font(.custom(self.theme.font.display, size: self.theme.text.display.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.primary.green.color)
        }
        .task {
            try? await Task.sleep(for: .milliseconds(1_200))
            await self.store.send(.minimumSplashElapsed).finish()
        }
    }
}

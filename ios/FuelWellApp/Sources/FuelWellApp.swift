import App
import ComposableArchitecture
import DesignSystem
import SwiftUI

@main
struct FuelWellApp: SwiftUI.App {
    init() {
        FuelWellFontRegistry.registerBundledFonts()
        prepareFuelWellDependencies()
    }

    var body: some Scene {
        WindowGroup {
            AppCoordinator(
                store: Store(
                    initialState: AppFeature.State(),
                    reducer: {
                        AppFeature()
                    }
                )
            )
        }
    }
}

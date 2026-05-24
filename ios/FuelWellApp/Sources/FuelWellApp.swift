import App
import ComposableArchitecture
import SwiftUI

@main
struct FuelWellApp: SwiftUI.App {
    init() {
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

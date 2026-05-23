import App
import ComposableArchitecture
import SwiftUI

@main
struct FuelWellApp: SwiftUI.App {
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

import App
import ComposableArchitecture
import DesignSystem
import Testing

@MainActor
@Test
func appFeatureLoadsThemeOnAppear() async {
    let store = TestStore(initialState: AppFeature.State()) {
        AppFeature()
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
}

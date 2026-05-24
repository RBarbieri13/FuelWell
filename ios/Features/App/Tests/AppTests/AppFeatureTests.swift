import Analytics
import App
import AnthropicClient
import ComposableArchitecture
import CrashReporting
import DesignSystem
import HealthKitClient
import SupabaseClient
import Testing

@MainActor
@Test
func appFeatureLoadsThemeOnAppear() async {
    let store = TestStore(initialState: AppFeature.State()) {
        AppFeature()
    } withDependencies: {
        $0.analytics = .noop
        $0.anthropicClient = .previewValue
        $0.crashReporter = .noop
        $0.featureFlags = .previewValue
        $0.healthKit = .previewValue
        $0.supabaseDatabase = .previewValue
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
    await store.receive(\.architectureChecked) {
        $0.architecture = AppFeature.ArchitectureState(
            featureFlagsReady: true,
            healthKitReadReady: true,
            supabaseReady: true,
            anthropicReady: true
        )
    }
}

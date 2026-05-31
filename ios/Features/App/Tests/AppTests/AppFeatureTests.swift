import Analytics
import App
import AnthropicClient
import ComposableArchitecture
import CrashReporting
import DesignSystem
import HealthKitClient
import SupabaseClient
import Testing

@Test
func launchDependencyPlanDefaultsToPreview() {
    let plan = FuelWellLaunchDependencyPlan.resolve(environment: [:])

    #expect(plan.backend == .preview)
    #expect(plan.healthKit == .preview)
}

@Test(arguments: ["1", "true", "TRUE", "yes", "live", "enabled"])
func launchDependencyPlanAcceptsTruthyLiveBackendFlag(value: String) {
    let plan = FuelWellLaunchDependencyPlan.resolve(
        environment: ["FUELWELL_USE_LIVE_BACKEND": value]
    )

    #expect(plan.backend == .live)

    #if targetEnvironment(simulator)
    #expect(plan.healthKit == .preview)
    #else
    #expect(plan.healthKit == .live)
    #endif
}

@Test(arguments: ["", "0", "false", "preview", "disabled"])
func launchDependencyPlanRejectsFalsyLiveBackendFlag(value: String) {
    let plan = FuelWellLaunchDependencyPlan.resolve(
        environment: ["FUELWELL_USE_LIVE_BACKEND": value]
    )

    #expect(plan.backend == .preview)
    #expect(plan.healthKit == .preview)
}

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

@MainActor
@Test
func appFeatureReportsUnavailableArchitectureClients() async {
    let readyArchitecture = AppFeature.ArchitectureState(
        featureFlagsReady: true,
        healthKitReadReady: true,
        supabaseReady: true,
        anthropicReady: true
    )
    let store = TestStore(initialState: AppFeature.State(architecture: readyArchitecture)) {
        AppFeature()
    } withDependencies: {
        $0.analytics = .noop
        $0.anthropicClient = AnthropicClient { _ in
            throw AnthropicClientError.invalidResponse
        }
        $0.crashReporter = .noop
        $0.featureFlags = FeatureFlagClient(
            isEnabled: { _ in throw SupabaseClientError.missingConfiguration },
            refresh: { throw SupabaseClientError.missingConfiguration }
        )
        $0.healthKit = HealthKitClient(
            requestReadAuthorization: { throw HealthKitClientError.notAvailable },
            todaySnapshot: { throw HealthKitClientError.notAvailable },
            sevenDaySleepOnsetMedian: { throw HealthKitClientError.notAvailable }
        )
        $0.supabaseDatabase = SupabaseDatabaseClient(
            currentUser: { throw SupabaseClientError.missingConfiguration },
            fetchProfile: { _ in throw SupabaseClientError.missingConfiguration },
            upsertProfile: { _ in throw SupabaseClientError.missingConfiguration },
            insertMeal: { _ in throw SupabaseClientError.missingConfiguration },
            submitFeedback: { _ in throw SupabaseClientError.missingConfiguration }
        )
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
    await store.receive(\.architectureChecked) {
        $0.architecture = AppFeature.ArchitectureState(
            featureFlagsReady: false,
            healthKitReadReady: false,
            supabaseReady: false,
            anthropicReady: false
        )
    }
}

@MainActor
@Test
func disabledAnthropicFeatureReportsNotReady() async {
    let store = TestStore(initialState: AppFeature.State()) {
        AppFeature()
    } withDependencies: {
        $0.analytics = .noop
        $0.anthropicClient = AnthropicClient { _ in
            throw AnthropicClientError.featureDisabled("coach_chat")
        }
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
            anthropicReady: false
        )
    }
}

@MainActor
@Test
func launchDependencyFailureIsCapturedForCrashDiagnostics() async {
    let recorder = CrashCaptureRecorder()
    let store = TestStore(initialState: AppFeature.State()) {
        AppFeature()
    } withDependencies: {
        $0.analytics = AnalyticsClient(
            identify: { _, _ in },
            track: { _ in throw AppFeatureTestError(message: "Analytics offline") }
        )
        $0.anthropicClient = .previewValue
        $0.crashReporter = CrashReporter(
            configure: { _ in },
            capture: { message, context in
                await recorder.record(message: message, context: context)
            }
        )
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

    let captures = await recorder.captures
    #expect(captures.count == 1)
    #expect(captures.first?.message == "Phase 2 dependency readiness check failed")
    #expect(captures.first?.context.route == "launch")
    #expect(captures.first?.context.extras["error"]?.contains("Analytics offline") == true)
}

@MainActor
@Test
func splashCompletesIntoMainTabs() async {
    let store = TestStore(initialState: AppFeature.State()) {
        AppFeature()
    }

    await store.send(.minimumSplashElapsed) {
        $0.phase = .mainTabs
    }
}

@MainActor
@Test
func tabSelectionUpdatesRootState() async {
    let recorder = AnalyticsRecorder()
    let store = TestStore(initialState: AppFeature.State(phase: .mainTabs)) {
        AppFeature()
    } withDependencies: {
        $0.analytics = AnalyticsClient(
            identify: { _, _ in },
            track: { event in await recorder.record(event) }
        )
    }

    await store.send(.tabSelected(.coach)) {
        $0.selectedTab = .coach
    }

    await store.send(.tabSelected(.progress)) {
        $0.selectedTab = .progress
    }

    let events = await recorder.events
    #expect(events == [
        .tabSelected("coach"),
        .tabSelected("progress")
    ])
}

private struct AppFeatureTestError: Error, CustomStringConvertible, Sendable {
    var message: String

    var description: String {
        self.message
    }
}

private actor CrashCaptureRecorder {
    private(set) var captures: [(message: String, context: CrashContext)] = []

    func record(message: String, context: CrashContext) {
        self.captures.append((message, context))
    }
}

private actor AnalyticsRecorder {
    private(set) var events: [AnalyticsEvent] = []

    func record(_ event: AnalyticsEvent) {
        self.events.append(event)
    }
}

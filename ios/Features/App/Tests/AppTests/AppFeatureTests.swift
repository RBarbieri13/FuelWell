import Analytics
import App
import AnthropicClient
import ComposableArchitecture
import CrashReporting
import DesignSystem
import Foundation
import HealthKitClient
import Onboarding
import SupabaseClient
import Testing

private let appTestUser = SupabaseUser(
    id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
    email: "preview@fuelwell.app"
)

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
        $0.supabaseAuth = SupabaseAuthClient.inMemory(
            session: SupabaseSession(user: appTestUser, accessToken: "preview-token")
        )
        $0.supabaseDatabase = .previewValue
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
    await store.receive(.launchSessionChecked(appTestUser)) {
        $0.launchSessionChecked = true
        $0.currentUser = appTestUser
        $0.onboarding.currentUser = appTestUser
    }
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
        $0.supabaseAuth = SupabaseAuthClient(
            currentSession: { throw SupabaseClientError.missingConfiguration },
            signUp: { _, _ in throw SupabaseClientError.missingConfiguration },
            signIn: { _, _ in throw SupabaseClientError.missingConfiguration },
            signOut: { throw SupabaseClientError.missingConfiguration },
            deleteAccount: { throw SupabaseClientError.missingConfiguration }
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
    await store.receive(.launchSessionChecked(nil)) {
        $0.launchSessionChecked = true
    }
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
        $0.supabaseAuth = SupabaseAuthClient.inMemory(
            session: SupabaseSession(user: appTestUser, accessToken: "preview-token")
        )
        $0.supabaseDatabase = .previewValue
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
    await store.receive(.launchSessionChecked(appTestUser)) {
        $0.launchSessionChecked = true
        $0.currentUser = appTestUser
        $0.onboarding.currentUser = appTestUser
    }
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
        $0.supabaseAuth = SupabaseAuthClient.inMemory(
            session: SupabaseSession(user: appTestUser, accessToken: "preview-token")
        )
        $0.supabaseDatabase = .previewValue
    }

    await store.send(.onAppear)
    await store.receive(.themeLoaded(.app))
    await store.receive(.launchSessionChecked(appTestUser)) {
        $0.launchSessionChecked = true
        $0.currentUser = appTestUser
        $0.onboarding.currentUser = appTestUser
    }
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
    let store = TestStore(initialState: AppFeature.State(
        launchSessionChecked: true,
        currentUser: appTestUser
    )) {
        AppFeature()
    }

    await store.send(.minimumSplashElapsed) {
        $0.minimumSplashElapsed = true
        $0.phase = .mainTabs
    }
}

@MainActor
@Test
func splashRoutesUnauthenticatedUsersToOnboarding() async {
    let store = TestStore(initialState: AppFeature.State(launchSessionChecked: true)) {
        AppFeature()
    }

    await store.send(.minimumSplashElapsed) {
        $0.minimumSplashElapsed = true
        $0.phase = .onboarding
    }
}

@MainActor
@Test
func onboardingCompletionEntersMainTabs() async {
    let store = TestStore(initialState: AppFeature.State(phase: .onboarding)) {
        AppFeature()
    }

    await store.send(.onboarding(.delegate(.completed(appTestUser)))) {
        $0.currentUser = appTestUser
        $0.phase = .mainTabs
    }
}

@MainActor
@Test
func accountSignOutRoutesBackToOnboarding() async {
    let store = TestStore(initialState: AppFeature.State(
        phase: .mainTabs,
        currentUser: appTestUser,
        selectedTab: .progress
    )) {
        AppFeature()
    } withDependencies: {
        $0.supabaseAuth = SupabaseAuthClient.inMemory(
            session: SupabaseSession(user: appTestUser, accessToken: "preview-token")
        )
    }

    await store.send(.accountSignOutTapped) {
        $0.accountAuthInFlight = true
        $0.accountAuthMessage = nil
    }
    await store.receive(.accountAuthFinished(.success)) {
        $0.currentUser = nil
        $0.onboarding = OnboardingFeature.State()
        $0.phase = .onboarding
        $0.selectedTab = .home
        $0.accountAuthInFlight = false
        $0.accountAuthMessage = nil
    }
}

@MainActor
@Test
func accountDeleteRoutesBackToOnboarding() async {
    let store = TestStore(initialState: AppFeature.State(
        phase: .mainTabs,
        currentUser: appTestUser,
        selectedTab: .coach
    )) {
        AppFeature()
    } withDependencies: {
        $0.supabaseAuth = SupabaseAuthClient.inMemory(
            session: SupabaseSession(user: appTestUser, accessToken: "preview-token")
        )
    }

    await store.send(.accountDeleteTapped) {
        $0.accountAuthInFlight = true
        $0.accountAuthMessage = nil
    }
    await store.receive(.accountAuthFinished(.success)) {
        $0.currentUser = nil
        $0.onboarding = OnboardingFeature.State()
        $0.phase = .onboarding
        $0.selectedTab = .home
        $0.accountAuthInFlight = false
        $0.accountAuthMessage = nil
    }
}

@MainActor
@Test
func accountAuthFailureKeepsUserInPlaceAndShowsMessage() async {
    let store = TestStore(initialState: AppFeature.State(
        phase: .mainTabs,
        currentUser: appTestUser,
        selectedTab: .progress,
        accountAuthMessage: "Older account warning"
    )) {
        AppFeature()
    } withDependencies: {
        $0.supabaseAuth = SupabaseAuthClient(
            currentSession: { SupabaseSession(user: appTestUser, accessToken: "preview-token") },
            signUp: { _, _ in SupabaseSession(user: appTestUser, accessToken: "preview-token") },
            signIn: { _, _ in SupabaseSession(user: appTestUser, accessToken: "preview-token") },
            signOut: { throw SupabaseClientError.transport("offline") },
            deleteAccount: { throw SupabaseClientError.transport("offline") }
        )
    }

    await store.send(.accountSignOutTapped) {
        $0.accountAuthInFlight = true
        $0.accountAuthMessage = nil
    }
    await store.receive(.accountAuthFinished(.failure(.transport("offline")))) {
        $0.accountAuthInFlight = false
        $0.accountAuthMessage = "Account action could not finish. Check your connection and try again."
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

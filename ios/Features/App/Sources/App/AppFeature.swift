import Analytics
import AnthropicClient
import ComposableArchitecture
import CrashReporting
import DesignSystem
import Foundation
import HealthKitClient
import Onboarding
import SupabaseClient

@Reducer
public struct AppFeature: Sendable {
    @Dependency(\.analytics) private var analytics
    @Dependency(\.anthropicClient) private var anthropicClient
    @Dependency(\.crashReporter) private var crashReporter
    @Dependency(\.featureFlags) private var featureFlags
    @Dependency(\.healthKit) private var healthKit
    @Dependency(\.supabaseAuth) private var supabaseAuth
    @Dependency(\.supabaseDatabase) private var supabaseDatabase

    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var phase: Phase
        public var theme: Theme
        public var architecture: ArchitectureState
        public var launchSessionChecked: Bool
        public var minimumSplashElapsed: Bool
        public var currentUser: SupabaseUser?
        public var onboarding: OnboardingFeature.State
        public var selectedTab: AppTab
        public var accountAuthInFlight: Bool
        public var accountAuthMessage: String?

        public init(
            phase: Phase = .splash,
            theme: Theme = .app,
            architecture: ArchitectureState = .init(),
            launchSessionChecked: Bool = false,
            minimumSplashElapsed: Bool = false,
            currentUser: SupabaseUser? = nil,
            onboarding: OnboardingFeature.State = .init(),
            selectedTab: AppTab = .home,
            accountAuthInFlight: Bool = false,
            accountAuthMessage: String? = nil
        ) {
            self.phase = phase
            self.theme = theme
            self.architecture = architecture
            self.launchSessionChecked = launchSessionChecked
            self.minimumSplashElapsed = minimumSplashElapsed
            self.currentUser = currentUser
            self.onboarding = onboarding
            self.selectedTab = selectedTab
            self.accountAuthInFlight = accountAuthInFlight
            self.accountAuthMessage = accountAuthMessage
        }
    }

    public struct ArchitectureState: Equatable {
        public var featureFlagsReady: Bool
        public var healthKitReadReady: Bool
        public var supabaseReady: Bool
        public var anthropicReady: Bool

        public init(
            featureFlagsReady: Bool = false,
            healthKitReadReady: Bool = false,
            supabaseReady: Bool = false,
            anthropicReady: Bool = false
        ) {
            self.featureFlagsReady = featureFlagsReady
            self.healthKitReadReady = healthKitReadReady
            self.supabaseReady = supabaseReady
            self.anthropicReady = anthropicReady
        }
    }

    public enum Phase: Equatable {
        case splash
        case onboarding
        case mainTabs
    }

    public enum AccountAuthResult: Equatable {
        case success
        case failure(SupabaseClientError)
    }

    public enum Action: Equatable {
        case onAppear
        case architectureChecked(ArchitectureState)
        case launchSessionChecked(SupabaseUser?)
        case themeLoaded(Theme)
        case minimumSplashElapsed
        case onboarding(OnboardingFeature.Action)
        case accountSignOutTapped
        case accountDeleteTapped
        case accountAuthFinished(AccountAuthResult)
        case tabSelected(AppTab)
    }

    public var body: some ReducerOf<Self> {
        Scope(state: \.onboarding, action: \.onboarding) {
            OnboardingFeature()
        }

        Reduce { state, action in
            switch action {
            case .onAppear:
                state.theme = .app
                return .run { send in
                    await send(.themeLoaded(.app))
                    await send(.launchSessionChecked(await self.restoreLaunchUser()))
                    await send(.architectureChecked(await self.checkArchitecture()))
                }

            case let .architectureChecked(architecture):
                state.architecture = architecture
                return .none

            case let .launchSessionChecked(user):
                state.launchSessionChecked = true
                state.currentUser = user
                state.onboarding.currentUser = user
                self.routeAfterLaunch(state: &state)
                return .none

            case let .themeLoaded(theme):
                state.theme = theme
                return .none

            case .minimumSplashElapsed:
                state.minimumSplashElapsed = true
                self.routeAfterLaunch(state: &state)
                return .none

            case let .onboarding(.delegate(.completed(user))):
                state.currentUser = user
                state.phase = .mainTabs
                return .none

            case .onboarding:
                return .none

            case .accountSignOutTapped:
                state.accountAuthInFlight = true
                state.accountAuthMessage = nil
                return .run { send in
                    do {
                        try await self.supabaseAuth.signOut()
                        await send(.accountAuthFinished(.success))
                    } catch let error as SupabaseClientError {
                        await send(.accountAuthFinished(.failure(error)))
                    } catch {
                        await send(.accountAuthFinished(.failure(.transport(error.localizedDescription))))
                    }
                }

            case .accountDeleteTapped:
                state.accountAuthInFlight = true
                state.accountAuthMessage = nil
                return .run { send in
                    do {
                        try await self.supabaseAuth.deleteAccount()
                        await send(.accountAuthFinished(.success))
                    } catch let error as SupabaseClientError {
                        await send(.accountAuthFinished(.failure(error)))
                    } catch {
                        await send(.accountAuthFinished(.failure(.transport(error.localizedDescription))))
                    }
                }

            case .accountAuthFinished(.success):
                state.currentUser = nil
                state.onboarding = OnboardingFeature.State()
                state.phase = .onboarding
                state.selectedTab = .home
                state.accountAuthInFlight = false
                state.accountAuthMessage = nil
                return .none

            case .accountAuthFinished(.failure):
                state.accountAuthInFlight = false
                state.accountAuthMessage = "Account action could not finish. Check your connection and try again."
                return .none

            case let .tabSelected(tab):
                state.selectedTab = tab
                return .run { _ in
                    try? await self.analytics.track(.tabSelected(tab.rawValue))
                }
            }
        }
    }

    private func routeAfterLaunch(state: inout State) {
        guard state.minimumSplashElapsed, state.launchSessionChecked else {
            return
        }

        state.phase = state.currentUser == nil ? .onboarding : .mainTabs
    }

    private func restoreLaunchUser() async -> SupabaseUser? {
        do {
            if let session = try await self.supabaseAuth.currentSession() {
                return session.user
            }
        } catch {
            return try? await self.supabaseDatabase.currentUser()
        }

        return try? await self.supabaseDatabase.currentUser()
    }

    private func checkArchitecture() async -> ArchitectureState {
        await self.trackLaunch()

        async let flagsReady = self.checkFeatureFlags()
        async let healthReady = self.checkHealthKit()
        async let supabaseReady = self.checkSupabase()
        async let anthropicReady = self.checkAnthropic()

        return await ArchitectureState(
            featureFlagsReady: flagsReady,
            healthKitReadReady: healthReady,
            supabaseReady: supabaseReady,
            anthropicReady: anthropicReady
        )
    }

    private func trackLaunch() async {
        do {
            try await self.analytics.track(.appLaunched(source: "phase_2_shell"))
            try await self.crashReporter.configure(CrashContext(route: "launch"))
        } catch {
            try? await self.crashReporter.capture(
                "Phase 2 dependency readiness check failed",
                CrashContext(route: "launch", extras: ["error": String(describing: error)])
            )
        }
    }

    private func checkFeatureFlags() async -> Bool {
        (try? await self.featureFlags.isEnabled("coach_chat")) != nil
    }

    private func checkHealthKit() async -> Bool {
        (try? await self.healthKit.requestReadAuthorization()) != nil
    }

    private func checkSupabase() async -> Bool {
        (try? await self.supabaseDatabase.currentUser()) != nil
    }

    private func checkAnthropic() async -> Bool {
        do {
            _ = try await self.anthropicClient.complete(
                AnthropicRequest(prompt: "Return the word ready.", maxTokens: 16, featureFlag: "coach_chat")
            )
            return true
        } catch AnthropicClientError.featureDisabled {
            return false
        } catch {
            return false
        }
    }
}

import Analytics
import AnthropicClient
import ComposableArchitecture
import CrashReporting
import DesignSystem
import Foundation
import HealthKitClient
import SupabaseClient

@Reducer
public struct AppFeature: Sendable {
    @Dependency(\.analytics) private var analytics
    @Dependency(\.anthropicClient) private var anthropicClient
    @Dependency(\.crashReporter) private var crashReporter
    @Dependency(\.featureFlags) private var featureFlags
    @Dependency(\.healthKit) private var healthKit
    @Dependency(\.supabaseDatabase) private var supabaseDatabase

    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var phase: Phase
        public var theme: Theme
        public var architecture: ArchitectureState
        public var selectedTab: AppTab

        public init(
            phase: Phase = .splash,
            theme: Theme = .app,
            architecture: ArchitectureState = .init(),
            selectedTab: AppTab = .home
        ) {
            self.phase = phase
            self.theme = theme
            self.architecture = architecture
            self.selectedTab = selectedTab
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
        case mainTabs
    }

    public enum Action: Equatable {
        case onAppear
        case architectureChecked(ArchitectureState)
        case themeLoaded(Theme)
        case minimumSplashElapsed
        case tabSelected(AppTab)
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.theme = .app
                return .run { send in
                    await send(.themeLoaded(.app))
                    await send(.architectureChecked(await self.checkArchitecture()))
                }

            case let .architectureChecked(architecture):
                state.architecture = architecture
                return .none

            case let .themeLoaded(theme):
                state.theme = theme
                return .none

            case .minimumSplashElapsed:
                state.phase = .mainTabs
                return .none

            case let .tabSelected(tab):
                state.selectedTab = tab
                return .run { _ in
                    try? await self.analytics.track(.tabSelected(tab.rawValue))
                }
            }
        }
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

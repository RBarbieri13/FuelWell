import ComposableArchitecture
import DesignSystem
import Foundation

@Reducer
public struct AppFeature {
    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var phase: Phase
        public var theme: Theme

        public init(
            phase: Phase = .splash,
            theme: Theme = .app
        ) {
            self.phase = phase
            self.theme = theme
        }
    }

    public enum Phase: Equatable {
        case splash
        case dashboardPlaceholder
    }

    public enum Action: Equatable {
        case onAppear
        case themeLoaded(Theme)
        case minimumSplashElapsed
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                state.theme = .app
                return .send(.themeLoaded(.app))

            case let .themeLoaded(theme):
                state.theme = theme
                return .none

            case .minimumSplashElapsed:
                state.phase = .dashboardPlaceholder
                return .none
            }
        }
    }
}

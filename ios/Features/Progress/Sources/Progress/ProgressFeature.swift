import ComposableArchitecture
import NutritionDomain

@Reducer
public struct ProgressFeature: Sendable {
    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var snapshot: MacroDaySnapshot
        public var score: HealthScore
        public var headline: String
        public var detail: String
        public var healthScoreTopics: [ProgressTopic]
        public var trackingTopics: [ProgressTopic]

        public init(
            snapshot: MacroDaySnapshot = .preview,
            healthScoreTopics: [ProgressTopic] = [.nutrition, .activity, .recovery],
            trackingTopics: [ProgressTopic] = [.macroAdherence, .bodyPhotos, .habits]
        ) {
            let score = MacroDecisionEngine.healthScore(snapshot: snapshot)
            self.snapshot = snapshot
            self.score = score
            self.headline = score.headline
            self.detail = score.detail
            self.healthScoreTopics = healthScoreTopics
            self.trackingTopics = trackingTopics
        }
    }

    public enum Action: Equatable {
        case snapshotUpdated(MacroDaySnapshot)
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case let .snapshotUpdated(snapshot):
                state.snapshot = snapshot
                state.score = MacroDecisionEngine.healthScore(snapshot: snapshot)
                state.headline = state.score.headline
                state.detail = state.score.detail
                return .none
            }
        }
    }
}

public enum ProgressTopic: String, CaseIterable, Equatable, Identifiable, Sendable {
    case nutrition
    case activity
    case recovery
    case macroAdherence
    case bodyPhotos
    case habits

    public var id: Self { self }

    public var title: String {
        switch self {
        case .nutrition:
            "Nutrition Score"
        case .activity:
            "Activity Score"
        case .recovery:
            "Recovery Score"
        case .macroAdherence:
            "Macro Adherence"
        case .bodyPhotos:
            "Body Photos"
        case .habits:
            "Habits"
        }
    }

    public var accessibilityID: String {
        switch self {
        case .nutrition:
            "nutrition"
        case .activity:
            "activity"
        case .recovery:
            "recovery"
        case .macroAdherence:
            "macro-adherence"
        case .bodyPhotos:
            "body-photos"
        case .habits:
            "habits"
        }
    }

    public var icon: String {
        switch self {
        case .nutrition:
            "fork.knife"
        case .activity:
            "figure.run"
        case .recovery:
            "heart"
        case .macroAdherence:
            "chart.bar.fill"
        case .bodyPhotos:
            "camera.fill"
        case .habits:
            "circle.grid.3x3.fill"
        }
    }

    public func rowDetail(score: HealthScore) -> String {
        switch self {
        case .nutrition:
            "\(score.nutrition) · protein consistency is improving"
        case .activity:
            "\(score.activity) · active minutes are stable"
        case .recovery:
            "Unlocks with wearable data"
        case .macroAdherence:
            "82% this week"
        case .bodyPhotos:
            "Add weekly check-in"
        case .habits:
            "Last 14 days · 4 habits"
        }
    }

    public var headline: String {
        switch self {
        case .nutrition:
            "Protein consistency is improving"
        case .activity:
            "Movement is supporting the plan"
        case .recovery:
            "Recovery unlocks with wearable data"
        case .macroAdherence:
            "82% this week"
        case .bodyPhotos:
            "Use photos as quiet evidence"
        case .habits:
            "Four habits are active"
        }
    }

    public var detail: String {
        switch self {
        case .nutrition:
            "FuelWell watches protein, calories, and timing before it asks you to track anything else."
        case .activity:
            "Steps, active energy, and workouts help explain appetite and the next meal."
        case .recovery:
            "A 14-day wearable baseline is required before recovery affects the score."
        case .macroAdherence:
            "Macro adherence is a trend, not a grade. It stays cause-first and non-judgmental."
        case .bodyPhotos:
            "Weekly photos are optional and never block progress tracking."
        case .habits:
            "Habits stay small: the app should reduce manual tracking, not create chores."
        }
    }
}

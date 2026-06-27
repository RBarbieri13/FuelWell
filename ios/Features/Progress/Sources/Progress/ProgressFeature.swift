import ComposableArchitecture
import Foundation
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
        public var bodyPhotoCheckIns: [BodyPhotoCheckIn]
        public var habits: [ProgressHabit]

        public init(
            snapshot: MacroDaySnapshot = .preview,
            healthScoreTopics: [ProgressTopic] = [.nutrition, .activity, .recovery],
            trackingTopics: [ProgressTopic] = [.calories, .macroAdherence, .bodyPhotos, .habits],
            bodyPhotoCheckIns: [BodyPhotoCheckIn] = BodyPhotoCheckIn.preview,
            habits: [ProgressHabit] = ProgressHabit.preview
        ) {
            let score = MacroDecisionEngine.healthScore(snapshot: snapshot)
            self.snapshot = snapshot
            self.score = score
            self.headline = score.headline
            self.detail = score.detail
            self.healthScoreTopics = healthScoreTopics
            self.trackingTopics = trackingTopics
            self.bodyPhotoCheckIns = bodyPhotoCheckIns
            self.habits = habits
        }
    }

    public enum Action: Equatable {
        case bodyPhotoCheckInAdded
        case habitToggled(ProgressHabit.ID)
        case snapshotUpdated(MacroDaySnapshot)
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .bodyPhotoCheckInAdded:
                state.bodyPhotoCheckIns.insert(.next(after: state.bodyPhotoCheckIns), at: 0)
                return .none

            case let .habitToggled(id):
                guard let index = state.habits.firstIndex(where: { $0.id == id }) else {
                    return .none
                }
                state.habits[index].isComplete.toggle()
                return .none

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

public struct BodyPhotoCheckIn: Equatable, Identifiable, Sendable {
    public let id: UUID
    public var label: String
    public var capturedAt: Date
    public var angles: [String]
    public var note: String

    public init(
        id: UUID,
        label: String,
        capturedAt: Date,
        angles: [String],
        note: String
    ) {
        self.id = id
        self.label = label
        self.capturedAt = capturedAt
        self.angles = angles
        self.note = note
    }

    public static let preview: [Self] = [
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 21)),
            label: "Week 2",
            capturedAt: Date(timeIntervalSince1970: 1_773_446_400),
            angles: ["Front", "Side", "Back"],
            note: "Optional check-in captured privately."
        ),
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20)),
            label: "Week 1",
            capturedAt: Date(timeIntervalSince1970: 1_772_841_600),
            angles: ["Front", "Side", "Back"],
            note: "Baseline for visual trend."
        )
    ]

    static func next(after checkIns: [Self]) -> Self {
        let week = checkIns.count + 1
        return .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, UInt8(min(week, 255)))),
            label: "Week \(week)",
            capturedAt: Date(timeIntervalSince1970: 1_773_446_400 + Double(week * 604_800)),
            angles: ["Front", "Side", "Back"],
            note: "New check-in ready for photo attachment."
        )
    }
}

public struct ProgressHabit: Equatable, Identifiable, Sendable {
    public let id: UUID
    public var title: String
    public var detail: String
    public var isComplete: Bool

    public init(id: UUID, title: String, detail: String, isComplete: Bool) {
        self.id = id
        self.title = title
        self.detail = detail
        self.isComplete = isComplete
    }

    public static let preview: [Self] = [
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31)),
            title: "Meal photo before edits",
            detail: "10 of 14 days",
            isComplete: true
        ),
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32)),
            title: "Post-dinner walk",
            detail: "4 of 7 evenings",
            isComplete: false
        ),
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33)),
            title: "Protein anchor at first meal",
            detail: "5 of 7 mornings",
            isComplete: true
        )
    ]
}

public enum ProgressTopic: String, CaseIterable, Equatable, Identifiable, Sendable {
    case nutrition
    case activity
    case recovery
    case calories
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
        case .calories:
            "Calories"
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
        case .calories:
            "calories"
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
        case .calories:
            "flame.fill"
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
        case .calories:
            "850 / 2,250 kcal today"
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
        case .calories:
            "Calories are inside the decision, not hidden behind macros"
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
        case .calories:
            "FuelWell watches calorie room alongside protein so the next meal stays practical."
        case .macroAdherence:
            "Macro adherence is a trend, not a grade. It stays cause-first and non-judgmental."
        case .bodyPhotos:
            "Weekly photos are optional and never block progress tracking."
        case .habits:
            "Habits stay small: the app should reduce manual tracking, not create chores."
        }
    }
}

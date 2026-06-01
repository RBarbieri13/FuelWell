import ComposableArchitecture
import Foundation
import HealthKitClient

@Reducer
public struct ActivityFeature: Sendable {
    @Dependency(\.healthKit) private var healthKit

    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var headline: String
        public var detail: String
        public var healthState: HealthState
        public var today: [ActivityRow]
        public var tools: [ActivityTool]
        public var workoutLog: [WorkoutSession]
        public var plan: WorkoutPlan

        public init(
            headline: String = "Rest day with movement",
            detail: String = "Walk after dinner and keep lifting for tomorrow.",
            healthState: HealthState = .preview(HealthSnapshot.preview),
            today: [ActivityRow] = Self.previewRows,
            tools: [ActivityTool] = ActivityTool.allCases,
            workoutLog: [WorkoutSession] = WorkoutSession.preview,
            plan: WorkoutPlan = .preview
        ) {
            self.headline = headline
            self.detail = detail
            self.healthState = healthState
            self.today = today
            self.tools = tools
            self.workoutLog = workoutLog
            self.plan = plan
        }

        public static let previewRows: [ActivityRow] = [
            .init(title: "Mon", detail: "Upper body · 42 min", icon: "checkmark.circle.fill"),
            .init(title: "Tue", detail: "Active recovery · 34 min", icon: "figure.walk"),
            .init(title: "Wed", detail: "Lower body planned", icon: "calendar")
        ]
    }

    public enum Action: Equatable {
        case onAppear
        case healthSnapshotResponse(Result<HealthSnapshot, HealthKitClientError>)
        case quickWorkoutLogged
        case workoutPlanAdvanced
    }

    public var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .onAppear:
                return .run { send in
                    do {
                        await send(.healthSnapshotResponse(.success(try await self.healthKit.todaySnapshot())))
                    } catch let error as HealthKitClientError {
                        await send(.healthSnapshotResponse(.failure(error)))
                    } catch {
                        await send(.healthSnapshotResponse(.failure(.queryFailed(error.localizedDescription))))
                    }
                }

            case let .healthSnapshotResponse(.success(snapshot)):
                state.healthState = .loaded(snapshot)
                state.today = Self.rows(snapshot: snapshot)
                state.headline = snapshot.workoutCount > 0 ? "Training is logged" : "Movement is building"
                state.detail = "\(Int(snapshot.steps)) steps · " +
                    "\(Int(snapshot.activeEnergyKilocalories)) active kcal today."
                return .none

            case let .healthSnapshotResponse(.failure(error)):
                state.healthState = .unavailable(error)
                state.headline = "Connect Apple Health"
                state.detail = "Steps, workouts, and active energy unlock activity-aware coaching."
                state.today = [
                    .init(
                        title: "Apple Health",
                        detail: "Open Settings to grant read access",
                        icon: "heart.text.square"
                    ),
                    .init(
                        title: "Manual fallback",
                        detail: "Workout plans stay available without HealthKit",
                        icon: "dumbbell"
                    )
                ]
                return .none

            case .quickWorkoutLogged:
                state.workoutLog.insert(.quickSession(number: state.workoutLog.count + 1), at: 0)
                state.headline = "Training is logged"
                state.detail = "Workout captured. Dinner guidance can account for the session."
                return .none

            case .workoutPlanAdvanced:
                state.plan = state.plan.advanced()
                return .none
            }
        }
    }

    private static func rows(snapshot: HealthSnapshot) -> [ActivityRow] {
        [
            .init(title: "Steps", detail: "\(Int(snapshot.steps)) today", icon: "figure.walk"),
            .init(title: "Active energy", detail: "\(Int(snapshot.activeEnergyKilocalories)) kcal", icon: "flame.fill"),
            .init(
                title: "Workouts",
                detail: "\(snapshot.workoutCount) logged · \(Int(snapshot.workoutDurationMinutes)) min",
                icon: "figure.strengthtraining.traditional"
            )
        ]
    }
}

public struct ActivityRow: Equatable, Identifiable, Sendable {
    public var id: String { "\(self.title)-\(self.detail)" }
    public var title: String
    public var detail: String
    public var icon: String

    public init(title: String, detail: String, icon: String) {
        self.title = title
        self.detail = detail
        self.icon = icon
    }
}

public enum HealthState: Equatable {
    case preview(HealthSnapshot)
    case loaded(HealthSnapshot)
    case unavailable(HealthKitClientError)
}

public struct WorkoutSession: Equatable, Identifiable, Sendable {
    public let id: UUID
    public var title: String
    public var detail: String
    public var loggedAt: Date

    public init(id: UUID, title: String, detail: String, loggedAt: Date) {
        self.id = id
        self.title = title
        self.detail = detail
        self.loggedAt = loggedAt
    }

    public static let preview: [Self] = [
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 41)),
            title: "Upper body",
            detail: "42 min · moderate effort",
            loggedAt: Date(timeIntervalSince1970: 1_773_432_000)
        )
    ]

    static func quickSession(number: Int) -> Self {
        .init(
            id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, UInt8(min(number, 255)))),
            title: "Workout \(number)",
            detail: "Quick log · 30 min · moderate effort",
            loggedAt: Date(timeIntervalSince1970: 1_773_446_400 + Double(number * 3_600))
        )
    }
}

public struct WorkoutPlan: Equatable, Sendable {
    public var title: String
    public var detail: String
    public var nextSessions: [String]

    public init(title: String, detail: String, nextSessions: [String]) {
        self.title = title
        self.detail = detail
        self.nextSessions = nextSessions
    }

    public static let preview = Self(
        title: "Lower body tomorrow",
        detail: "45 min · moderate effort · recovery-friendly",
        nextSessions: ["Lower body", "Active recovery", "Upper body"]
    )

    func advanced() -> Self {
        guard let first = self.nextSessions.first else { return self }
        let rotated = Array(self.nextSessions.dropFirst()) + [first]
        return Self(
            title: "\(rotated[0]) next",
            detail: "Plan advanced after today’s decision",
            nextSessions: rotated
        )
    }
}

public enum ActivityTool: String, CaseIterable, Equatable, Identifiable, Sendable {
    case workoutLog
    case activityTracker
    case workoutPlans

    public var id: Self { self }

    public var title: String {
        switch self {
        case .workoutLog:
            "Workout Log"
        case .activityTracker:
            "Activity Tracker"
        case .workoutPlans:
            "Workout Plans"
        }
    }

    public var accessibilityID: String {
        switch self {
        case .workoutLog:
            "workout-log"
        case .activityTracker:
            "activity-tracker"
        case .workoutPlans:
            "workout-plans"
        }
    }

    public var icon: String {
        switch self {
        case .workoutLog:
            "list.bullet.clipboard"
        case .activityTracker:
            "waveform.path.ecg"
        case .workoutPlans:
            "dumbbell"
        }
    }

    public var rowDetail: String {
        switch self {
        case .workoutLog:
            "Record trainer or solo sessions"
        case .activityTracker:
            "Steps, active minutes, energy"
        case .workoutPlans:
            "Next sessions matched to recovery"
        }
    }
}

extension HealthSnapshot {
    public static let preview = HealthSnapshot(
        steps: 8_420,
        activeEnergyKilocalories: 540,
        workoutCount: 1,
        workoutDurationMinutes: 42,
        bodyMassKilograms: 82.4,
        sleepOnset: Date(timeIntervalSince1970: 1_773_446_400),
        fetchedAt: Date(timeIntervalSince1970: 1_773_500_000)
    )
}

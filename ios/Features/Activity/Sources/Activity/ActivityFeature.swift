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

        public init(
            headline: String = "Rest day with movement",
            detail: String = "Walk after dinner and keep lifting for tomorrow.",
            healthState: HealthState = .preview(HealthSnapshot.preview),
            today: [ActivityRow] = Self.previewRows,
            tools: [ActivityTool] = ActivityTool.allCases
        ) {
            self.headline = headline
            self.detail = detail
            self.healthState = healthState
            self.today = today
            self.tools = tools
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

import Activity
import ComposableArchitecture
import Foundation
import HealthKitClient
import Testing

@MainActor
@Test
func loadsHealthSnapshotIntoActivityRows() async {
    let store = TestStore(initialState: ActivityFeature.State()) {
        ActivityFeature()
    } withDependencies: {
        $0.healthKit = .stub(
            snapshot: HealthSnapshot(
                steps: 9_100,
                activeEnergyKilocalories: 610,
                workoutCount: 1,
                workoutDurationMinutes: 44,
                fetchedAt: Date(timeIntervalSince1970: 200)
            )
        )
    }

    await store.send(.onAppear)
    await store.receive(.healthSnapshotResponse(.success(
        HealthSnapshot(
            steps: 9_100,
            activeEnergyKilocalories: 610,
            workoutCount: 1,
            workoutDurationMinutes: 44,
            fetchedAt: Date(timeIntervalSince1970: 200)
        )
    ))) {
        $0.headline = "Training is logged"
        $0.detail = "9100 steps · 610 active kcal today."
        $0.healthState = .loaded(
            HealthSnapshot(
                steps: 9_100,
                activeEnergyKilocalories: 610,
                workoutCount: 1,
                workoutDurationMinutes: 44,
                fetchedAt: Date(timeIntervalSince1970: 200)
            )
        )
        $0.today = [
            .init(title: "Steps", detail: "9100 today", icon: "figure.walk"),
            .init(title: "Active energy", detail: "610 kcal", icon: "flame.fill"),
            .init(title: "Workouts", detail: "1 logged · 44 min", icon: "figure.strengthtraining.traditional")
        ]
    }
}

@MainActor
@Test
func deniedHealthKitShowsConnectState() async {
    let store = TestStore(initialState: ActivityFeature.State()) {
        ActivityFeature()
    } withDependencies: {
        $0.healthKit = HealthKitClient(
            requestReadAuthorization: { false },
            todaySnapshot: { throw HealthKitClientError.authorizationDenied },
            sevenDaySleepOnsetMedian: { nil }
        )
    }

    await store.send(.onAppear)
    await store.receive(.healthSnapshotResponse(.failure(.authorizationDenied))) {
        $0.headline = "Connect Apple Health"
        $0.detail = "Steps, workouts, and active energy unlock activity-aware coaching."
        $0.healthState = .unavailable(.authorizationDenied)
        $0.today = [
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
    }
}

@MainActor
@Test
func quickWorkoutLogAddsSessionAndUpdatesHeadline() async {
    let store = TestStore(initialState: ActivityFeature.State(workoutLog: [])) {
        ActivityFeature()
    }

    await store.send(.quickWorkoutLogged) {
        $0.workoutLog = [
            WorkoutSession(
                id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
                title: "Workout 1",
                detail: "Quick log · 30 min · moderate effort",
                loggedAt: Date(timeIntervalSince1970: 1_773_450_000)
            )
        ]
        $0.headline = "Training is logged"
        $0.detail = "Workout captured. Dinner guidance can account for the session."
    }
}

@MainActor
@Test
func advancingWorkoutPlanRotatesUpcomingSessions() async {
    let store = TestStore(initialState: ActivityFeature.State(
        plan: WorkoutPlan(
            title: "Lower body tomorrow",
            detail: "45 min",
            nextSessions: ["Lower body", "Active recovery", "Upper body"]
        )
    )) {
        ActivityFeature()
    }

    await store.send(.workoutPlanAdvanced) {
        $0.plan = WorkoutPlan(
            title: "Active recovery next",
            detail: "Plan advanced after today’s decision",
            nextSessions: ["Active recovery", "Upper body", "Lower body"]
        )
    }
}

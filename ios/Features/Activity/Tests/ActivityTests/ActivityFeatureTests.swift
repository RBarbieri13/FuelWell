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

import ComposableArchitecture
import Foundation
import NutritionDomain
import Progress
import Testing

@MainActor
@Test
func initializesFromMacroSnapshot() {
    let state = ProgressFeature.State(snapshot: .preview)

    #expect(state.score.value == 89)
    #expect(state.headline == "Progress is steady")
    #expect(state.healthScoreTopics == [.nutrition, .activity, .recovery])
    #expect(state.trackingTopics == [.calories, .macroAdherence, .bodyPhotos, .habits])
}

@MainActor
@Test
func snapshotUpdateRecomputesScore() async {
    let store = TestStore(initialState: ProgressFeature.State(snapshot: .preview)) {
        ProgressFeature()
    }

    let snapshot = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 2_100,
            macros: MacroGrams(protein: 150, carbs: 220, fat: 70)
        ),
        intake: MacroIntake(
            calories: 1_500,
            macros: MacroGrams(protein: 65, carbs: 190, fat: 42)
        ),
        nextMeal: .dinner,
        energyOut: .unavailable
    )

    await store.send(.snapshotUpdated(snapshot)) {
        $0.snapshot = snapshot
        $0.score = MacroDecisionEngine.healthScore(snapshot: snapshot)
        $0.headline = "Eat a real dinner"
        $0.detail = "Nutrition is scored now; activity unlocks when Apple Health is connected."
    }
}

@MainActor
@Test
func bodyPhotoCheckInAddsAWeeklyEntry() async {
    let store = TestStore(initialState: ProgressFeature.State(bodyPhotoCheckIns: [])) {
        ProgressFeature()
    }

    await store.send(.bodyPhotoCheckInAdded) {
        $0.bodyPhotoCheckIns = [
            BodyPhotoCheckIn(
                id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)),
                label: "Week 1",
                capturedAt: Date(timeIntervalSince1970: 1_774_051_200),
                angles: ["Front", "Side", "Back"],
                note: "New check-in ready for photo attachment."
            )
        ]
    }
}

@MainActor
@Test
func habitToggleUpdatesCompletionState() async {
    let habit = ProgressHabit(
        id: UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 91)),
        title: "Post-dinner walk",
        detail: "4 of 7 evenings",
        isComplete: false
    )
    let store = TestStore(initialState: ProgressFeature.State(habits: [habit])) {
        ProgressFeature()
    }

    await store.send(.habitToggled(habit.id)) {
        $0.habits[0].isComplete = true
    }
}

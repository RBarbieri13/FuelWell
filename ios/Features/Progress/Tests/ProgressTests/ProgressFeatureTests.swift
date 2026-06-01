import ComposableArchitecture
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
    #expect(state.trackingTopics == [.macroAdherence, .bodyPhotos, .habits])
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

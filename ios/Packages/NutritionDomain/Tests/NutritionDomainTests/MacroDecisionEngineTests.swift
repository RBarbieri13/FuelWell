import NutritionDomain
import Testing

@Test
func computesRemainingMacros() {
    let snapshot = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 2_000,
            macros: MacroGrams(protein: 160, carbs: 210, fat: 65)
        ),
        intake: MacroIntake(
            calories: 875,
            macros: MacroGrams(protein: 54, carbs: 92, fat: 22)
        ),
        nextMeal: .lunch
    )

    #expect(snapshot.remaining.calories == 1_125)
    #expect(snapshot.remaining.macros == MacroGrams(protein: 106, carbs: 118, fat: 43))
}

@Test
func recommendsRealMealWhenProteinIsBehindCalories() {
    let snapshot = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 2_100,
            macros: MacroGrams(protein: 150, carbs: 220, fat: 70)
        ),
        intake: MacroIntake(
            calories: 1_050,
            macros: MacroGrams(protein: 45, carbs: 145, fat: 35)
        ),
        nextMeal: .lunch
    )

    #expect(snapshot.verdict.headline == "Eat a real lunch")
    #expect(snapshot.verdict.tone == .needsFuel)
    #expect(snapshot.verdict.detail.contains("105g protein"))
}

@Test
func returnsOnTrackVerdictWhenProteinAndCaloriesAreAligned() {
    let snapshot = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 2_000,
            macros: MacroGrams(protein: 150, carbs: 210, fat: 65)
        ),
        intake: MacroIntake(
            calories: 1_150,
            macros: MacroGrams(protein: 94, carbs: 116, fat: 36)
        ),
        nextMeal: .dinner
    )

    #expect(snapshot.verdict.headline == "Stay the course")
    #expect(snapshot.verdict.tone == .onTrack)
}

@Test
func rebalancesWithoutBannedCoachLanguage() {
    let snapshot = MacroDecisionEngine.evaluate(
        target: MacroTarget(
            calories: 1_900,
            macros: MacroGrams(protein: 145, carbs: 190, fat: 60)
        ),
        intake: MacroIntake(
            calories: 2_050,
            macros: MacroGrams(protein: 125, carbs: 245, fat: 72)
        ),
        nextMeal: .dinner
    )
    let copy = "\(snapshot.verdict.headline) \(snapshot.verdict.detail)".lowercased()

    #expect(snapshot.verdict.tone == .rebalance)
    #expect(!copy.contains("you missed"))
    #expect(!copy.contains("you skipped"))
    #expect(!copy.contains("you went over"))
}

@Test
func recommendationsStaySmallAndPhotoFirst() {
    let snapshot = MacroDaySnapshot.preview

    #expect(snapshot.recommendations.count <= 3)
    #expect(snapshot.recommendations.first?.title == "Photo log first")
}

import Foundation
import SupabaseClient
import Testing

@Test
func inMemoryClientRoundTripsProfileAndMeal() async throws {
    let userID = UUID()
    let client = SupabaseDatabaseClient.inMemory(user: SupabaseUser(id: userID, email: "test@fuelwell.app"))

    let user = try await client.currentUser()
    let profile = try await client.upsertProfile(Profile(id: userID, displayName: "Jordan", goal: "recomp"))
    let fetchedProfile = try await client.fetchProfile(userID)
    let meal = try await client.insertMeal(
        MealRecord(userID: userID, name: "Oats", loggedAt: Date(timeIntervalSince1970: 0))
    )

    #expect(user?.id == userID)
    #expect(profile.displayName == "Jordan")
    #expect(fetchedProfile == profile)
    #expect(meal.name == "Oats")
}

@Test
func featureFlagConstantReadsKnownFlags() async throws {
    let flags = FeatureFlagClient.constant([
        FeatureFlag(name: "ai_meal_plan", enabled: false)
    ])

    let enabled = try await flags.isEnabled("ai_meal_plan")
    let missing = try await flags.isEnabled("missing")

    #expect(enabled == false)
    #expect(missing == false)
}

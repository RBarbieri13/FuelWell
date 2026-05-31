import ComposableArchitecture
import Foundation
import HealthKitClient
import Onboarding
import SupabaseClient
import Testing

@MainActor
@Test
func signUpToOnboardingCompletionPersistsProfileAndCompletes() async {
    let userID = UUID(uuid: (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42))
    let store = makeOnboardingStore(userID: userID)

    await enterAccountDetails(store, userID: userID)
    await completePreferenceSteps(store)
    await store.send(.finishTapped) {
        $0.isLoading = true
    }
    await store.receive(\.profileResponse.success) {
        $0.isLoading = false
        $0.persistedProfile = expectedCompletedProfile(userID: userID)
    }
    await store.receive(.delegate(.completed(SupabaseUser(id: userID, email: "founder@fuelwell.app"))))
}

private func expectedCompletedProfile(userID: UUID) -> Profile {
    Profile(
        id: userID,
        displayName: "Jordan",
        goal: OnboardingFeature.Goal.performance.rawValue,
        bodyBaseline: BodyBaseline(
            heightInches: 72,
            weightPounds: 185,
            activityLevel: OnboardingFeature.ActivityLevel.high.rawValue
        ),
        dietaryConstraints: DietaryConstraints(
            preferences: [OnboardingFeature.DietaryPreference.highProtein.rawValue],
            allergies: ["shellfish"]
        ),
        lifestyle: LifestyleProfile(
            workoutsPerWeek: 3,
            sleepGoalHours: 7.5,
            mealPrepStyle: OnboardingFeature.MealPrepStyle.structured.rawValue
        ),
        onboardingCompletedAt: nil
    )
}

@MainActor
private func makeOnboardingStore(userID: UUID) -> TestStore<OnboardingFeature.State, OnboardingFeature.Action> {
    TestStore(initialState: OnboardingFeature.State()) {
        OnboardingFeature()
    } withDependencies: {
        $0.supabaseAuth = SupabaseAuthClient(
            currentSession: { nil },
            signUp: { email, _ in
                SupabaseSession(user: SupabaseUser(id: userID, email: email), accessToken: "test-token")
            },
            signIn: { _, _ in throw SupabaseClientError.unimplemented },
            signOut: {},
            deleteAccount: {}
        )
        $0.supabaseDatabase = SupabaseDatabaseClient(
            currentUser: { SupabaseUser(id: userID, email: "founder@fuelwell.app") },
            fetchProfile: { _ in nil },
            upsertProfile: { profile in profile },
            insertMeal: { _ in throw SupabaseClientError.unimplemented },
            submitFeedback: { _ in throw SupabaseClientError.unimplemented }
        )
        $0.healthKit = .previewValue
    }
}

@MainActor
private func enterAccountDetails(
    _ store: TestStore<OnboardingFeature.State, OnboardingFeature.Action>,
    userID: UUID
) async {
    await store.send(.continueTapped) { $0.step = .account }
    await store.send(.binding(.set(\.email, "founder@fuelwell.app"))) { $0.email = "founder@fuelwell.app" }
    await store.send(.binding(.set(\.password, "correct-horse"))) { $0.password = "correct-horse" }
    await store.send(.binding(.set(\.displayName, "Jordan"))) { $0.displayName = "Jordan" }
    await store.send(.signUpTapped) { $0.isLoading = true }
    await store.receive(.authResponse(.success(
        SupabaseSession(
            user: SupabaseUser(id: userID, email: "founder@fuelwell.app"),
            accessToken: "test-token"
        )
    ))) {
        $0.isLoading = false
        $0.currentUser = SupabaseUser(id: userID, email: "founder@fuelwell.app")
        $0.step = .goal
    }
}

@MainActor
private func completePreferenceSteps(
    _ store: TestStore<OnboardingFeature.State, OnboardingFeature.Action>
) async {
    await store.send(.goalSelected(.performance)) { $0.selectedGoal = .performance }
    await store.send(.continueTapped) { $0.step = .bodyBaseline }
    await store.send(.binding(.set(\.heightInches, 72))) { $0.heightInches = 72 }
    await store.send(.binding(.set(\.weightPounds, 185))) { $0.weightPounds = 185 }
    await store.send(.activityLevelSelected(.high)) { $0.activityLevel = .high }
    await store.send(.continueTapped) { $0.step = .dietaryConstraints }
    await store.send(.dietaryPreferenceTapped(.highProtein)) { $0.dietaryPreferences = [.highProtein] }
    await store.send(.binding(.set(\.allergyText, "shellfish"))) { $0.allergyText = "shellfish" }
    await store.send(.continueTapped) { $0.step = .lifestyle }
    await store.send(.mealPrepStyleSelected(.structured)) { $0.mealPrepStyle = .structured }
    await store.send(.continueTapped) { $0.step = .healthKit }
    await store.send(.healthKitResponse(.success(true))) {
        $0.healthKitAuthorized = true
        $0.step = .notifications
    }
    await store.send(.notificationsDecision(true)) {
        $0.notificationsEnabled = true
        $0.step = .planReveal
    }
}

@MainActor
@Test
func authFailureKeepsUserOnAccountStep() async {
    let store = TestStore(initialState: OnboardingFeature.State(step: .account)) {
        OnboardingFeature()
    } withDependencies: {
        $0.supabaseAuth = SupabaseAuthClient(
            currentSession: { nil },
            signUp: { _, _ in throw SupabaseClientError.invalidCredentials },
            signIn: { _, _ in throw SupabaseClientError.invalidCredentials },
            signOut: {},
            deleteAccount: {}
        )
    }

    await store.send(.signUpTapped) {
        $0.isLoading = true
    }
    await store.receive(.authResponse(.failure(.invalidCredentials))) {
        $0.isLoading = false
        $0.errorMessage = "Use a valid email and a password of at least 8 characters."
    }
}

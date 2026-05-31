import ComposableArchitecture
import Foundation
import HealthKitClient
import SupabaseClient

@Reducer
public struct OnboardingFeature: Sendable {
    @Dependency(\.healthKit) private var healthKit
    @Dependency(\.supabaseAuth) private var supabaseAuth
    @Dependency(\.supabaseDatabase) private var supabaseDatabase

    public init() {}

    @ObservableState
    public struct State: Equatable {
        public var step: Step
        public var email: String
        public var password: String
        public var displayName: String
        public var selectedGoal: Goal
        public var heightInches: Int?
        public var weightPounds: Double?
        public var activityLevel: ActivityLevel
        public var dietaryPreferences: Set<DietaryPreference>
        public var allergyText: String
        public var workoutsPerWeek: Int
        public var sleepGoalHours: Double
        public var mealPrepStyle: MealPrepStyle
        public var healthKitAuthorized: Bool
        public var notificationsEnabled: Bool
        public var currentUser: SupabaseUser?
        public var persistedProfile: Profile?
        public var isLoading: Bool
        public var errorMessage: String?

        public init(
            step: Step = .welcome,
            email: String = "",
            password: String = "",
            displayName: String = "",
            selectedGoal: Goal = .recomposition,
            heightInches: Int? = nil,
            weightPounds: Double? = nil,
            activityLevel: ActivityLevel = .moderate,
            dietaryPreferences: Set<DietaryPreference> = [],
            allergyText: String = "",
            workoutsPerWeek: Int = 3,
            sleepGoalHours: Double = 7.5,
            mealPrepStyle: MealPrepStyle = .balanced,
            healthKitAuthorized: Bool = false,
            notificationsEnabled: Bool = false,
            currentUser: SupabaseUser? = nil,
            persistedProfile: Profile? = nil,
            isLoading: Bool = false,
            errorMessage: String? = nil
        ) {
            self.step = step
            self.email = email
            self.password = password
            self.displayName = displayName
            self.selectedGoal = selectedGoal
            self.heightInches = heightInches
            self.weightPounds = weightPounds
            self.activityLevel = activityLevel
            self.dietaryPreferences = dietaryPreferences
            self.allergyText = allergyText
            self.workoutsPerWeek = workoutsPerWeek
            self.sleepGoalHours = sleepGoalHours
            self.mealPrepStyle = mealPrepStyle
            self.healthKitAuthorized = healthKitAuthorized
            self.notificationsEnabled = notificationsEnabled
            self.currentUser = currentUser
            self.persistedProfile = persistedProfile
            self.isLoading = isLoading
            self.errorMessage = errorMessage
        }
    }

    public enum Step: Int, CaseIterable, Equatable, Sendable {
        case welcome
        case account
        case goal
        case bodyBaseline
        case dietaryConstraints
        case lifestyle
        case healthKit
        case notifications
        case planReveal
    }

    public enum Goal: String, CaseIterable, Equatable, Sendable {
        case fatLoss = "fat_loss"
        case muscleGain = "muscle_gain"
        case recomposition = "recomposition"
        case performance = "performance"

        public var title: String {
            switch self {
            case .fatLoss:
                "Lean down"
            case .muscleGain:
                "Build muscle"
            case .recomposition:
                "Stronger and leaner"
            case .performance:
                "Perform better"
            }
        }
    }

    public enum ActivityLevel: String, CaseIterable, Equatable, Sendable {
        case light
        case moderate
        case high

        public var title: String {
            switch self {
            case .light:
                "Light"
            case .moderate:
                "Moderate"
            case .high:
                "High"
            }
        }
    }

    public enum DietaryPreference: String, CaseIterable, Equatable, Hashable, Sendable {
        case highProtein = "high_protein"
        case plantForward = "plant_forward"
        case glutenFree = "gluten_free"
        case dairyFree = "dairy_free"

        public var title: String {
            switch self {
            case .highProtein:
                "High protein"
            case .plantForward:
                "Plant-forward"
            case .glutenFree:
                "Gluten-free"
            case .dairyFree:
                "Dairy-free"
            }
        }
    }

    public enum MealPrepStyle: String, CaseIterable, Equatable, Sendable {
        case minimal
        case balanced
        case structured

        public var title: String {
            switch self {
            case .minimal:
                "Minimal prep"
            case .balanced:
                "Balanced routine"
            case .structured:
                "Structured plan"
            }
        }
    }

    public enum Action: Equatable, BindableAction {
        case binding(BindingAction<State>)
        case continueTapped
        case backTapped
        case signUpTapped
        case signInTapped
        case authResponse(Result<SupabaseSession, SupabaseClientError>)
        case goalSelected(Goal)
        case activityLevelSelected(ActivityLevel)
        case dietaryPreferenceTapped(DietaryPreference)
        case mealPrepStyleSelected(MealPrepStyle)
        case requestHealthKitTapped
        case healthKitResponse(Result<Bool, HealthKitClientError>)
        case notificationsDecision(Bool)
        case finishTapped
        case profileResponse(Result<Profile, SupabaseClientError>)
        case delegate(Delegate)
    }

    public enum Delegate: Equatable {
        case completed(SupabaseUser)
    }

    public var body: some ReducerOf<Self> {
        BindingReducer()

        Reduce { state, action in
            switch action {
            case .binding:
                return .none

            case .continueTapped:
                state.errorMessage = nil
                state.step = state.step.next
                return .none

            case .backTapped:
                state.errorMessage = nil
                state.step = state.step.previous
                return .none

            case .signUpTapped:
                return self.authenticate(state: &state, mode: .signUp)

            case .signInTapped:
                return self.authenticate(state: &state, mode: .signIn)

            case let .authResponse(.success(session)):
                state.isLoading = false
                state.currentUser = session.user
                if state.displayName.isEmpty, let email = session.user.email {
                    state.displayName = email.components(separatedBy: "@").first ?? ""
                }
                state.step = .goal
                return .none

            case .authResponse(.failure):
                state.isLoading = false
                state.errorMessage = "Use a valid email and a password of at least 8 characters."
                return .none

            case let .goalSelected(goal):
                state.selectedGoal = goal
                return .none

            case let .activityLevelSelected(level):
                state.activityLevel = level
                return .none

            case let .dietaryPreferenceTapped(preference):
                if state.dietaryPreferences.contains(preference) {
                    state.dietaryPreferences.remove(preference)
                } else {
                    state.dietaryPreferences.insert(preference)
                }
                return .none

            case let .mealPrepStyleSelected(style):
                state.mealPrepStyle = style
                return .none

            case .requestHealthKitTapped:
                state.isLoading = true
                state.errorMessage = nil
                return .run { send in
                    do {
                        let authorized = try await self.healthKit.requestReadAuthorization()
                        await send(.healthKitResponse(.success(authorized)))
                    } catch let error as HealthKitClientError {
                        await send(.healthKitResponse(.failure(error)))
                    } catch {
                        await send(.healthKitResponse(.failure(.notAvailable)))
                    }
                }

            case let .healthKitResponse(.success(authorized)):
                state.isLoading = false
                state.healthKitAuthorized = authorized
                state.step = .notifications
                return .none

            case .healthKitResponse(.failure):
                state.isLoading = false
                state.healthKitAuthorized = false
                state.step = .notifications
                return .none

            case let .notificationsDecision(enabled):
                state.notificationsEnabled = enabled
                state.step = .planReveal
                return .none

            case .finishTapped:
                guard let user = state.currentUser else {
                    state.errorMessage = "Sign in before saving your plan."
                    return .none
                }
                state.isLoading = true
                state.errorMessage = nil
                let profile = state.profile(userID: user.id)
                return .run { send in
                    do {
                        let saved = try await self.supabaseDatabase.upsertProfile(profile)
                        await send(.profileResponse(.success(saved)))
                    } catch let error as SupabaseClientError {
                        await send(.profileResponse(.failure(error)))
                    } catch {
                        await send(.profileResponse(.failure(.transport(error.localizedDescription))))
                    }
                }

            case let .profileResponse(.success(profile)):
                state.isLoading = false
                state.persistedProfile = profile
                guard let user = state.currentUser else {
                    return .none
                }
                return .send(.delegate(.completed(user)))

            case .profileResponse(.failure):
                state.isLoading = false
                state.errorMessage = "Your plan is ready, but profile sync is waiting on backend configuration."
                return .none

            case .delegate:
                return .none
            }
        }
    }

    private enum AuthMode {
        case signUp
        case signIn
    }

    private func authenticate(state: inout State, mode: AuthMode) -> Effect<Action> {
        state.isLoading = true
        state.errorMessage = nil
        let email = state.email.trimmingCharacters(in: .whitespacesAndNewlines)
        let password = state.password

        return .run { send in
            do {
                let session = switch mode {
                case .signUp:
                    try await self.supabaseAuth.signUp(email, password)
                case .signIn:
                    try await self.supabaseAuth.signIn(email, password)
                }
                await send(.authResponse(.success(session)))
            } catch let error as SupabaseClientError {
                await send(.authResponse(.failure(error)))
            } catch {
                await send(.authResponse(.failure(.transport(error.localizedDescription))))
            }
        }
    }
}

extension OnboardingFeature.Step {
    var next: OnboardingFeature.Step {
        let all = Self.allCases
        guard let index = all.firstIndex(of: self), index < all.index(before: all.endIndex) else {
            return self
        }
        return all[all.index(after: index)]
    }

    var previous: OnboardingFeature.Step {
        let all = Self.allCases
        guard let index = all.firstIndex(of: self), index > all.startIndex else {
            return self
        }
        return all[all.index(before: index)]
    }
}

extension OnboardingFeature.State {
    func profile(userID: UUID) -> Profile {
        Profile(
            id: userID,
            displayName: self.displayName.isEmpty ? nil : self.displayName,
            goal: self.selectedGoal.rawValue,
            bodyBaseline: BodyBaseline(
                heightInches: self.heightInches,
                weightPounds: self.weightPounds,
                activityLevel: self.activityLevel.rawValue
            ),
            dietaryConstraints: DietaryConstraints(
                preferences: self.dietaryPreferences.map(\.rawValue).sorted(),
                allergies: self.allergyText
                    .split(separator: ",")
                    .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                    .filter { !$0.isEmpty }
            ),
            lifestyle: LifestyleProfile(
                workoutsPerWeek: self.workoutsPerWeek,
                sleepGoalHours: self.sleepGoalHours,
                mealPrepStyle: self.mealPrepStyle.rawValue
            ),
            onboardingCompletedAt: nil
        )
    }
}

import ComposableArchitecture
import DesignSystem
import SwiftUI

public struct OnboardingView: View {
    @Bindable public var store: StoreOf<OnboardingFeature>
    @Environment(\.theme) private var theme

    public init(store: StoreOf<OnboardingFeature>) {
        self.store = store
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                    OnboardingProgress(step: self.store.step)
                    self.content

                    if let error = self.store.errorMessage {
                        Text(error)
                            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                            .fontWeight(.semibold)
                            .foregroundStyle(self.theme.color.semantic.warning.color)
                            .padding(self.theme.spacing.md)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(self.theme.color.bg.surface.color)
                            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                    }
                }
                .padding(.horizontal, self.theme.spacing.md)
                .padding(.top, self.theme.spacing.xl)
                .padding(.bottom, self.theme.spacing.fourXL)
            }
            .background(self.theme.color.bg.base.color)
            .navigationTitle("FuelWell")
            .toolbar {
                if self.store.step != .welcome {
                    ToolbarItem(placement: .topBarLeading) {
                        Button("Back", systemImage: "chevron.left") {
                            self.store.send(.backTapped)
                        }
                        .tint(self.theme.color.text.body.color)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch self.store.step {
        case .welcome:
            self.welcome
        case .account:
            self.account
        case .goal:
            self.goal
        case .bodyBaseline:
            self.bodyBaseline
        case .dietaryConstraints:
            self.dietaryConstraints
        case .lifestyle:
            self.lifestyle
        case .healthKit:
            self.healthKit
        case .notifications:
            self.notifications
        case .planReveal:
            self.planReveal
        }
    }

    private var welcome: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "leaf.fill",
                title: "Build a plan you can actually use.",
                detail: "FuelWell starts with your goal, routine, food constraints, and Apple Health permission."
            )

            OnboardingBullet(title: "Photo-first meals", detail: "Log quickly, then adjust the numbers when needed.")
            OnboardingBullet(
                title: "Context-aware coaching",
                detail: "Advice uses your day instead of generic templates."
            )
            OnboardingBullet(title: "Progress without judgment", detail: "Trends point to the next useful action.")

            PrimaryOnboardingButton(title: "Start setup", icon: "arrow.right") {
                self.store.send(.continueTapped)
            }
        }
    }

    private var account: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "person.crop.circle.badge.checkmark",
                title: "Create your account.",
                detail: "This connects the iOS app to your FuelWell profile and Founders 100 access."
            )

            VStack(spacing: self.theme.spacing.md) {
                TextField("Email", text: self.$store.email)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .onboardingField()

                SecureField("Password", text: self.$store.password)
                    .textContentType(.newPassword)
                    .onboardingField()

                TextField("Display name", text: self.$store.displayName)
                    .textContentType(.name)
                    .onboardingField()
            }

            HStack(spacing: self.theme.spacing.sm) {
                PrimaryOnboardingButton(
                    title: self.store.isLoading ? "Creating..." : "Sign up",
                    icon: "person.badge.plus"
                ) {
                    self.store.send(.signUpTapped)
                }
                .disabled(self.store.isLoading)

                SecondaryOnboardingButton(
                    title: "Sign in",
                    icon: "arrow.right.circle"
                ) {
                    self.store.send(.signInTapped)
                }
                .disabled(self.store.isLoading)
            }
        }
    }

    private var goal: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "target",
                title: "Pick the main direction.",
                detail: "You can adjust this later. For now, it gives the plan a useful starting point."
            )

            ForEach(OnboardingFeature.Goal.allCases, id: \.self) { goal in
                ChoiceRow(
                    title: goal.title,
                    detail: goal.rawValue.replacingOccurrences(of: "_", with: " "),
                    isSelected: self.store.selectedGoal == goal
                ) {
                    self.store.send(.goalSelected(goal))
                }
            }

            PrimaryOnboardingButton(title: "Continue", icon: "arrow.right") {
                self.store.send(.continueTapped)
            }
        }
    }

    private var bodyBaseline: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "figure.stand",
                title: "Add your baseline.",
                detail: "This stays practical: height, current weight, and how active your week usually is."
            )

            VStack(spacing: self.theme.spacing.md) {
                TextField(
                    "Height in inches",
                    value: self.$store.heightInches,
                    format: .number
                )
                .keyboardType(.numberPad)
                .onboardingField()

                TextField(
                    "Weight in pounds",
                    value: self.$store.weightPounds,
                    format: .number
                )
                .keyboardType(.decimalPad)
                .onboardingField()
            }

            ForEach(OnboardingFeature.ActivityLevel.allCases, id: \.self) { level in
                ChoiceRow(
                    title: level.title,
                    detail: "Typical weekly activity",
                    isSelected: self.store.activityLevel == level
                ) {
                    self.store.send(.activityLevelSelected(level))
                }
            }

            PrimaryOnboardingButton(title: "Continue", icon: "arrow.right") {
                self.store.send(.continueTapped)
            }
        }
    }

    private var dietaryConstraints: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "fork.knife",
                title: "Food preferences and constraints.",
                detail: "FuelWell uses this to avoid suggestions that do not fit your real life."
            )

            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: 150), spacing: self.theme.spacing.sm)],
                spacing: self.theme.spacing.sm
            ) {
                ForEach(OnboardingFeature.DietaryPreference.allCases, id: \.self) { preference in
                    ToggleChip(
                        title: preference.title,
                        isSelected: self.store.dietaryPreferences.contains(preference)
                    ) {
                        self.store.send(.dietaryPreferenceTapped(preference))
                    }
                }
            }

            TextField("Allergies, separated by commas", text: self.$store.allergyText)
                .onboardingField()

            PrimaryOnboardingButton(title: "Continue", icon: "arrow.right") {
                self.store.send(.continueTapped)
            }
        }
    }

    private var lifestyle: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "calendar.badge.clock",
                title: "Match the plan to your week.",
                detail: "Training rhythm, sleep target, and prep style shape the first recommendations."
            )

            Stepper(value: self.$store.workoutsPerWeek, in: 0...7) {
                OnboardingValueRow(label: "Workouts per week", value: "\(self.store.workoutsPerWeek)")
            }
            .phaseCard()

            Stepper(value: self.$store.sleepGoalHours, in: 5...10, step: 0.5) {
                OnboardingValueRow(label: "Sleep goal", value: "\(self.store.sleepGoalHours.formatted()) hours")
            }
            .phaseCard()

            ForEach(OnboardingFeature.MealPrepStyle.allCases, id: \.self) { style in
                ChoiceRow(
                    title: style.title,
                    detail: "Meal planning style",
                    isSelected: self.store.mealPrepStyle == style
                ) {
                    self.store.send(.mealPrepStyleSelected(style))
                }
            }

            PrimaryOnboardingButton(title: "Continue", icon: "arrow.right") {
                self.store.send(.continueTapped)
            }
        }
    }

    private var healthKit: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "heart.text.square.fill",
                title: "Connect Apple Health.",
                detail: "Steps, active energy, workouts, and weight make the plan more accurate."
            )

            OnboardingBullet(title: "Read-only for now", detail: "FuelWell does not write Health data in this phase.")
            OnboardingBullet(title: "Graceful fallback", detail: "If you skip this, the app uses manual check-ins.")

            PrimaryOnboardingButton(
                title: self.store.isLoading ? "Opening..." : "Connect Health",
                icon: "heart.fill"
            ) {
                self.store.send(.requestHealthKitTapped)
            }
            .disabled(self.store.isLoading)

            SecondaryOnboardingButton(title: "Skip for now", icon: "arrow.right") {
                self.store.send(.healthKitResponse(.success(false)))
            }
        }
    }

    private var notifications: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "bell.badge.fill",
                title: "Choose nudges.",
                detail: "Local reminders help with meal timing, check-ins, and end-of-day recaps."
            )

            PrimaryOnboardingButton(title: "Enable nudges", icon: "bell.fill") {
                self.store.send(.notificationsDecision(true))
            }

            SecondaryOnboardingButton(title: "Not now", icon: "arrow.right") {
                self.store.send(.notificationsDecision(false))
            }
        }
    }

    private var planReveal: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            OnboardingHero(
                icon: "checkmark.seal.fill",
                title: "Your first plan is ready.",
                detail: "Start with a photo-first meal log, a realistic protein target, and one next action."
            )

            OnboardingBullet(title: self.store.selectedGoal.title, detail: "Primary direction")
            OnboardingBullet(title: self.store.activityLevel.title, detail: "Baseline activity")
            OnboardingBullet(
                title: self.store.mealPrepStyle.title,
                detail: "\(self.store.workoutsPerWeek) workouts/week · " +
                    "\(self.store.sleepGoalHours.formatted())h sleep target"
            )

            PrimaryOnboardingButton(
                title: self.store.isLoading ? "Saving..." : "Enter FuelWell",
                icon: "arrow.right"
            ) {
                self.store.send(.finishTapped)
            }
            .disabled(self.store.isLoading)
        }
    }
}

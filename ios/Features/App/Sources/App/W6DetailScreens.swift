import Activity
import DesignSystem
import NutritionDomain
import Progress
import SwiftUI

struct DashboardDetailView: View {
    let topic: DashboardDetailTopic
    let snapshot: MacroDaySnapshot

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(
                icon: self.topic.icon,
                title: self.topic.headline(snapshot: self.snapshot),
                detail: self.topic.detail(snapshot: self.snapshot)
            )
            DashboardSection(
                title: self.topic.primarySectionTitle,
                items: self.topic.primaryItems(snapshot: self.snapshot)
            )
            DashboardSection(title: "What changes next", items: self.topic.nextItems(snapshot: self.snapshot))
        }
    }
}

enum DashboardDetailTopic: CaseIterable, Equatable, Identifiable {
    case healthScore
    case inflowsOutflows

    var id: Self { self }

    var title: String {
        switch self {
        case .healthScore:
            "Health Score Detail"
        case .inflowsOutflows:
            "Inflows / Outflows"
        }
    }

    var icon: String {
        switch self {
        case .healthScore:
            "gauge.with.dots.needle.67percent"
        case .inflowsOutflows:
            "arrow.left.arrow.right.circle.fill"
        }
    }

    func headline(snapshot: MacroDaySnapshot) -> String {
        switch self {
        case .healthScore:
            let score = MacroDecisionEngine.healthScore(snapshot: snapshot)
            return "\(score.value) · \(score.headline.lowercased())"
        case .inflowsOutflows:
            return "Your day is still flexible"
        }
    }

    func detail(snapshot: MacroDaySnapshot) -> String {
        switch self {
        case .healthScore:
            return MacroDecisionEngine.healthScore(snapshot: snapshot).detail
        case .inflowsOutflows:
            return "Calories in and active energy out use the v1 HealthKit model: " +
                "active energy plus a simple resting estimate."
        }
    }

    var primarySectionTitle: String {
        switch self {
        case .healthScore:
            "Score inputs"
        case .inflowsOutflows:
            "Today balance"
        }
    }

    func primaryItems(snapshot: MacroDaySnapshot) -> [PhaseRowItem] {
        switch self {
        case .healthScore:
            let score = MacroDecisionEngine.healthScore(snapshot: snapshot)
            return [
                .init(
                    title: "Nutrition",
                    detail: "\(score.nutrition) · protein consistency is improving",
                    icon: "fork.knife"
                ),
                .init(
                    title: "Activity",
                    detail: "\(score.activity) · \(snapshot.energyOut.steps) steps today",
                    icon: "figure.run"
                ),
                .init(title: "Recovery", detail: "Unlocks with wearable data", icon: "heart")
            ]
        case .inflowsOutflows:
            let net = snapshot.intake.calories - snapshot.energyOut.totalKilocalories
            let netPrefix = net >= 0 ? "+" : ""
            return [
                .init(title: "Inflows", detail: "\(snapshot.intake.calories) calories logged", icon: "fork.knife"),
                .init(
                    title: "Outflows",
                    detail: "\(snapshot.energyOut.totalKilocalories) active + resting estimate",
                    icon: "flame.fill"
                ),
                .init(title: "Net", detail: "\(netPrefix)\(net) calories so far", icon: "equal.circle.fill")
            ]
        }
    }

    func nextItems(snapshot: MacroDaySnapshot) -> [PhaseRowItem] {
        switch self {
        case .healthScore:
            [
                .init(title: "Next meal", detail: snapshot.verdict.headline, icon: "arrow.up.right.circle.fill"),
                .init(
                    title: "Coach context",
                    detail: "Score inputs are summarized for coach replies",
                    icon: "bubble.left.fill"
                )
            ]
        case .inflowsOutflows:
            [
                .init(
                    title: "Dinner guardrail",
                    detail: "Keep dinner protein-forward if dinner lands heavy",
                    icon: "shield.lefthalf.filled"
                ),
                .init(
                    title: "Walk nudge",
                    detail: "12 minutes after dinner offsets the current day",
                    icon: "figure.walk"
                )
            ]
        }
    }
}

extension ActivityTool {
    var headline: String {
        switch self {
        case .coachRecommended:
            "Let the coach choose the lowest-friction session"
        case .workoutLog:
            "Record the session without turning FuelWell into a workout app"
        case .manualActivity:
            "Log any activity that converts into useful energy context"
        case .exerciseLibrary:
            "Browse the workout database before committing"
        case .workoutPreview:
            "Inspect a workout before you log it"
        case .activityTracker:
            "Use movement to explain the day"
        case .workoutPlans:
            "Keep training matched to recovery"
        }
    }

    var detail: String {
        switch self {
        case .coachRecommended:
            "Coach Pick weighs soreness, meals, time, and energy so the default option feels obvious."
        case .workoutLog:
            "Capture the lift, duration, and effort so nutrition guidance can stay grounded."
        case .manualActivity:
            "Walking, hiking, running, intervals, swimming, biking, rowing, sports, and mobility can be logged from one place."
        case .exerciseLibrary:
            "Filter by body part, workout type, equipment, duration, intensity, and goal."
        case .workoutPreview:
            "See summary, muscles, equipment, steps, nearby workouts, and calorie impact before logging."
        case .activityTracker:
            "Steps, active energy, and minutes shape the Health Score and tonight's next action."
        case .workoutPlans:
            "FuelWell keeps the next session simple until live trainer programming is connected."
        }
    }

    var row: PhaseRowItem {
        PhaseRowItem(title: self.title, detail: self.rowDetail, icon: self.icon)
    }

    var todayItems: [PhaseRowItem] {
        switch self {
        case .coachRecommended:
            [
                .init(title: "Today's pick", detail: "Zone 2 ride · 42 min · easy aerobic base", icon: "sparkles"),
                .init(title: "Why", detail: "Low soreness cost and useful calorie output", icon: "checkmark.seal.fill")
            ]
        case .workoutLog:
            [
                .init(
                    title: "Last session",
                    detail: "Upper body · 42 min · moderate effort",
                    icon: "checkmark.circle.fill"
                ),
                .init(title: "Open slot", detail: "Lower body is still planned for tomorrow", icon: "calendar")
            ]
        case .manualActivity:
            [
                .init(title: "Walking", detail: "Minutes, distance, pace, or steps", icon: "figure.walk"),
                .init(title: "Cardio", detail: "Run, bike, swim, row, hike, intervals", icon: "figure.run")
            ]
        case .exerciseLibrary:
            [
                .init(title: "Visible database", detail: "16 workout templates with filters", icon: "tablecells.fill"),
                .init(title: "Filters", detail: "Body part, type, duration, intensity", icon: "line.3.horizontal.decrease.circle")
            ]
        case .workoutPreview:
            [
                .init(title: "Low-impact strength", detail: "34 min · full body · moderate", icon: "dumbbell.fill"),
                .init(title: "Nearby sessions", detail: "Mobility reset and Zone 2 ride", icon: "arrow.left.arrow.right")
            ]
        case .activityTracker:
            [
                .init(title: "Steps", detail: "8,420 today from Apple Health preview", icon: "figure.walk"),
                .init(title: "Active energy", detail: "540 kcal informs inflows/outflows", icon: "flame.fill")
            ]
        case .workoutPlans:
            [
                .init(title: "Today", detail: "Rest day with movement", icon: "moon.zzz.fill"),
                .init(title: "Tomorrow", detail: "Lower body · 45 min", icon: "dumbbell.fill")
            ]
        }
    }

    var nextItems: [PhaseRowItem] {
        switch self {
        case .coachRecommended:
            [
                .init(title: "Accept", detail: "Log the coach pick as today's activity", icon: "checkmark.circle.fill"),
                .init(title: "Swap", detail: "Open nearby workouts if the pick feels wrong", icon: "arrow.triangle.2.circlepath")
            ]
        case .workoutLog:
            [
                .init(
                    title: "Fields coming next",
                    detail: "Exercise, sets, reps, load, RPE",
                    icon: "slider.horizontal.3"
                ),
                .init(
                    title: "Coach context",
                    detail: "Training load feeds the next meal decision",
                    icon: "bubble.left.and.bubble.right.fill"
                )
            ]
        case .manualActivity:
            [
                .init(
                    title: "Inputs",
                    detail: "Minutes, distance, effort, user weight, age, and metabolism tier",
                    icon: "slider.horizontal.3"
                ),
                .init(
                    title: "Estimate",
                    detail: "Calories are labeled until HealthKit or user confirmation verifies them",
                    icon: "flame.fill"
                )
            ]
        case .exerciseLibrary:
            [
                .init(title: "Preview first", detail: "Every row opens before it can be logged", icon: "eye.fill"),
                .init(title: "Database depth", detail: "Strength, cardio, mobility, sports, recovery", icon: "square.grid.3x3.fill")
            ]
        case .workoutPreview:
            [
                .init(title: "Next workout", detail: "Move forward or backward through similar sessions", icon: "chevron.right.circle.fill"),
                .init(title: "Log controls", detail: "Confirm, edit, or replace before it affects the day", icon: "square.and.pencil")
            ]
        case .activityTracker:
            [
                .init(
                    title: "HealthKit state",
                    detail: "Denied access shows a connect-health state",
                    icon: "heart.text.square"
                ),
                .init(
                    title: "Energy model",
                    detail: "Active energy is the v1 outflow input",
                    icon: "chart.line.uptrend.xyaxis"
                )
            ]
        case .workoutPlans:
            [
                .init(
                    title: "Plan source",
                    detail: "Trainer plan, solo plan, or active recovery",
                    icon: "square.grid.2x2"
                ),
                .init(
                    title: "Recovery guardrail",
                    detail: "Hard sessions pause when recovery is low",
                    icon: "shield.lefthalf.filled"
                )
            ]
        }
    }
}

extension ProgressTopic {
    func row(score: HealthScore) -> PhaseRowItem {
        PhaseRowItem(title: self.rowTitle, detail: self.rowDetail(score: score), icon: self.icon)
    }

    private var rowTitle: String {
        switch self {
        case .nutrition:
            "Nutrition"
        case .activity:
            "Activity"
        case .recovery:
            "Recovery"
        case .calories:
            "Calories"
        case .macroAdherence:
            "Macro adherence"
        case .bodyPhotos:
            "Body photos"
        case .habits:
            "Habits"
        }
    }

    var primarySectionTitle: String {
        switch self {
        case .nutrition, .activity, .recovery:
            "Health score detail"
        case .calories, .macroAdherence, .bodyPhotos, .habits:
            "Tracking"
        }
    }

    var primaryItems: [PhaseRowItem] {
        switch self {
        case .nutrition:
            [
                .init(
                    title: "Protein hit rate",
                    detail: "5 of 7 days reached the anchor",
                    icon: "checkmark.circle.fill"
                ),
                .init(title: "Calorie range", detail: "Two days needed a dinner correction", icon: "target")
            ]
        case .activity:
            [
                .init(title: "Active minutes", detail: "34 today · stable weekly trend", icon: "timer"),
                .init(title: "Steps", detail: "8,420 today from Apple Health preview", icon: "figure.walk")
            ]
        case .recovery:
            [
                .init(title: "Sleep", detail: "Connect Apple Health to unlock trend", icon: "bed.double.fill"),
                .init(title: "Body weight", detail: "Last known: 182 lb", icon: "scalemass.fill")
            ]
        case .calories:
            [
                .init(title: "Today", detail: "850 of 2,250 kcal logged", icon: "flame.fill"),
                .init(title: "Room left", detail: "1,400 kcal remains before dinner", icon: "target"),
                .init(title: "Context", detail: "Workout burn and steps explain the calorie range", icon: "waveform.path.ecg")
            ]
        case .macroAdherence:
            [
                .init(title: "This week", detail: "82% adherence", icon: "calendar"),
                .init(title: "Missed driver", detail: "Protein timing, not calories", icon: "fork.knife")
            ]
        case .bodyPhotos:
            [
                .init(title: "Privacy", detail: "Stored locally until account sync is enabled", icon: "lock.shield"),
                .init(title: "Cadence", detail: "Weekly front/side/back check-in", icon: "camera")
            ]
        case .habits:
            [
                .init(title: "Meal photo before edits", detail: "10 of 14 days", icon: "camera.fill"),
                .init(title: "Post-dinner walk", detail: "4 of 7 evenings", icon: "figure.walk")
            ]
        }
    }

    var nextItems: [PhaseRowItem] {
        [
            .init(
                title: "Coach use",
                detail: "This signal is included in context when useful",
                icon: "bubble.left.and.bubble.right.fill"
            ),
            .init(
                title: "User action",
                detail: "One next step, no gamified streaks",
                icon: "arrow.up.right.circle.fill"
            )
        ]
    }
}

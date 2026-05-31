import DesignSystem
import SwiftUI

struct ActivityToolDetailView: View {
    let tool: ActivityTool
    @Environment(\.theme) private var theme

    var body: some View {
        PhaseScroll(title: self.tool.title) {
            PhaseHero(icon: self.tool.icon, title: self.tool.headline, detail: self.tool.detail)
            DashboardSection(title: "Today", items: self.tool.todayItems)
            DashboardSection(title: "Next", items: self.tool.nextItems)
        }
    }
}

enum ActivityTool: CaseIterable, Equatable, Identifiable {
    case workoutLog
    case activityTracker
    case workoutPlans

    var id: Self { self }

    var title: String {
        switch self {
        case .workoutLog:
            "Workout Log"
        case .activityTracker:
            "Activity Tracker"
        case .workoutPlans:
            "Workout Plans"
        }
    }

    var accessibilityID: String {
        switch self {
        case .workoutLog:
            "workout-log"
        case .activityTracker:
            "activity-tracker"
        case .workoutPlans:
            "workout-plans"
        }
    }

    var icon: String {
        switch self {
        case .workoutLog:
            "list.bullet.clipboard"
        case .activityTracker:
            "waveform.path.ecg"
        case .workoutPlans:
            "dumbbell"
        }
    }

    var headline: String {
        switch self {
        case .workoutLog:
            "Record the session without turning FuelWell into a workout app"
        case .activityTracker:
            "Use movement to explain the day"
        case .workoutPlans:
            "Keep training matched to recovery"
        }
    }

    var detail: String {
        switch self {
        case .workoutLog:
            "Capture the lift, duration, and effort so nutrition guidance can stay grounded."
        case .activityTracker:
            "Steps, active energy, and minutes shape the Health Score and tonight's next action."
        case .workoutPlans:
            "FuelWell keeps the next session simple until live trainer programming is connected."
        }
    }

    var row: PhaseRowItem {
        PhaseRowItem(title: self.title, detail: self.rowDetail, icon: self.icon)
    }

    private var rowDetail: String {
        switch self {
        case .workoutLog:
            "Record trainer or solo sessions"
        case .activityTracker:
            "Steps, active minutes, energy"
        case .workoutPlans:
            "Next sessions matched to recovery"
        }
    }

    var todayItems: [PhaseRowItem] {
        switch self {
        case .workoutLog:
            [
                .init(
                    title: "Last session",
                    detail: "Upper body · 42 min · moderate effort",
                    icon: "checkmark.circle.fill"
                ),
                .init(title: "Open slot", detail: "Lower body is still planned for tomorrow", icon: "calendar")
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

struct ProgressDetailView: View {
    let topic: ProgressTopic

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: self.topic.primarySectionTitle, items: self.topic.primaryItems)
            DashboardSection(title: "Next decision", items: self.topic.nextItems)
        }
    }
}

enum ProgressTopic: CaseIterable, Equatable, Identifiable {
    case nutrition
    case activity
    case recovery
    case macroAdherence
    case bodyPhotos
    case habits

    var id: Self { self }

    var title: String {
        switch self {
        case .nutrition:
            "Nutrition Score"
        case .activity:
            "Activity Score"
        case .recovery:
            "Recovery Score"
        case .macroAdherence:
            "Macro Adherence"
        case .bodyPhotos:
            "Body Photos"
        case .habits:
            "Habits"
        }
    }

    var accessibilityID: String {
        switch self {
        case .nutrition:
            "nutrition"
        case .activity:
            "activity"
        case .recovery:
            "recovery"
        case .macroAdherence:
            "macro-adherence"
        case .bodyPhotos:
            "body-photos"
        case .habits:
            "habits"
        }
    }

    var icon: String {
        switch self {
        case .nutrition:
            "fork.knife"
        case .activity:
            "figure.run"
        case .recovery:
            "heart"
        case .macroAdherence:
            "chart.bar.fill"
        case .bodyPhotos:
            "camera.fill"
        case .habits:
            "circle.grid.3x3.fill"
        }
    }

    var headline: String {
        switch self {
        case .nutrition:
            "Protein consistency is improving"
        case .activity:
            "Active minutes are stable"
        case .recovery:
            "Recovery unlocks with wearable data"
        case .macroAdherence:
            "82% this week"
        case .bodyPhotos:
            "Add the weekly check-in"
        case .habits:
            "Four habits across the last 14 days"
        }
    }

    var detail: String {
        switch self {
        case .nutrition:
            "FuelWell weights adherence by the meals that most affect the next decision."
        case .activity:
            "Movement explains why calorie needs shift from day to day."
        case .recovery:
            "Sleep and body signals stay optional until HealthKit is connected."
        case .macroAdherence:
            "This page shows the weekly trend behind the Progress tab summary."
        case .bodyPhotos:
            "Private check-ins give visual context without turning progress into a feed."
        case .habits:
            "Habits are tracked as inputs, not gamified streaks."
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .nutrition:
            .init(title: "Nutrition", detail: "82 · protein consistency is improving", icon: self.icon)
        case .activity:
            .init(title: "Activity", detail: "76 · active minutes are stable", icon: self.icon)
        case .recovery:
            .init(title: "Recovery", detail: "Unlocks with wearable data", icon: self.icon)
        case .macroAdherence:
            .init(title: "Macro adherence", detail: "82% this week", icon: self.icon)
        case .bodyPhotos:
            .init(title: "Body photos", detail: "Add weekly check-in", icon: self.icon)
        case .habits:
            .init(title: "Habits", detail: "Last 14 days · 4 habits", icon: self.icon)
        }
    }

    var primarySectionTitle: String {
        switch self {
        case .nutrition, .activity, .recovery:
            "Health score detail"
        case .macroAdherence, .bodyPhotos, .habits:
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
                .init(title: "Body mass", detail: "Last known: 82.4 kg", icon: "scalemass.fill")
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

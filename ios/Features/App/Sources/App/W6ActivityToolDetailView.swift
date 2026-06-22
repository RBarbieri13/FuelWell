import Activity
import ComposableArchitecture
import DesignSystem
import SwiftUI

struct ActivityToolDetailView: View {
    let tool: ActivityTool
    @Bindable var store: StoreOf<ActivityFeature>
    @Environment(\.theme) private var theme

    var body: some View {
        PhaseScroll(title: self.tool.title) {
            PhaseHero(icon: self.tool.icon, title: self.tool.headline, detail: self.tool.detail)
            switch self.tool {
            case .coachRecommended:
                CoachWorkoutPickSection(onLog: { self.store.send(.quickWorkoutLogged) })
            case .workoutLog:
                WorkoutLogActionSection(
                    sessions: self.store.workoutLog,
                    onLog: { self.store.send(.quickWorkoutLogged) }
                )
            case .manualActivity:
                ManualActivityCatalogSection()
            case .exerciseLibrary:
                ExerciseLibraryPreviewSection()
            case .workoutPreview:
                WorkoutPreviewSection()
            case .activityTracker:
                ActivityTrackerStateSection(state: self.store.healthState)
            case .workoutPlans:
                WorkoutPlanActionSection(
                    plan: self.store.plan,
                    onAdvance: { self.store.send(.workoutPlanAdvanced) }
                )
            }
            DashboardSection(title: "Today", items: self.tool.todayItems)
            DashboardSection(title: "Next", items: self.tool.nextItems)
        }
    }
}

private struct CoachWorkoutPickSection: View {
    let onLog: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            FuelWellMetricExplainerCard(
                eyebrow: "Coach recommends",
                title: "Zone 2 ride",
                detail: "A low-soreness aerobic session that creates calorie room without making tomorrow harder.",
                points: [
                    .init(
                        id: "time",
                        title: "42 minutes",
                        detail: "Enough output to matter, still easy to recover from.",
                        systemImage: "timer",
                        tone: .activity
                    ),
                    .init(
                        id: "fuel",
                        title: "310 active calories",
                        detail: "Estimated from easy cycling effort and current body-weight profile.",
                        systemImage: "flame.fill",
                        tone: .nutrition
                    )
                ]
            )

            Button(action: self.onLog) {
                Label("Log coach pick", systemImage: "checkmark.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
        }
    }
}

private struct ManualActivityCatalogSection: View {
    private let activities: [PhaseRowItem] = [
        .init(title: "Walking", detail: "Minutes, distance, pace, or step count", icon: "figure.walk"),
        .init(title: "Hiking", detail: "Distance, elevation, pack weight, effort", icon: "figure.hiking"),
        .init(title: "Running", detail: "Duration, distance, pace, intervals", icon: "figure.run"),
        .init(title: "Interval training", detail: "Work/rest pattern, effort, total minutes", icon: "timer"),
        .init(title: "Swimming", detail: "Stroke, distance, pool length, effort", icon: "figure.pool.swim"),
        .init(title: "Biking", detail: "Road, indoor, mountain, or casual ride", icon: "bicycle"),
        .init(title: "Rowing", detail: "Meters, minutes, split, perceived effort", icon: "figure.rower"),
        .init(title: "Sport", detail: "Basketball, tennis, soccer, pickleball, and more", icon: "sportscourt")
    ]

    var body: some View {
        DashboardSection(title: "Manual activity types", items: self.activities)
    }
}

private struct ExerciseLibraryPreviewSection: View {
    private let rows: [PhaseRowItem] = [
        .init(title: "Low-impact strength", detail: "Full body · Strength · 34 min · moderate", icon: "dumbbell.fill"),
        .init(title: "Zone 2 ride", detail: "Lower body · Cardio · 42 min · easy", icon: "bicycle"),
        .init(title: "Mobility reset", detail: "Full body · Mobility · 18 min · light", icon: "waveform.path.ecg"),
        .init(title: "Hips and ankles reset", detail: "Mobility · Hips, ankles, calves · 16 min", icon: "figure.flexibility")
    ]

    var body: some View {
        DashboardSection(title: "Database preview", items: self.rows)
    }
}

private struct WorkoutPreviewSection: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            FuelWellScoreRingCard(
                title: "Workout summary",
                value: "34",
                subtitle: "moderate effort · dumbbells, bench",
                detail: "Low-impact strength",
                systemImage: "eye.fill",
                progress: 0.68,
                tone: .activity
            )

            DashboardSection(
                title: "What you will do",
                items: [
                    .init(title: "Warm-up", detail: "5 min movement prep and joint range", icon: "sun.max.fill"),
                    .init(title: "Main work", detail: "Goblet squat, row, press, hinge, carry", icon: "dumbbell.fill"),
                    .init(title: "Coach note", detail: "Technique focus, low soreness cost", icon: "bubble.left.fill")
                ]
            )

            DashboardSection(
                title: "Nearby workouts",
                items: [
                    .init(title: "Previous", detail: "Mobility reset · 18 min · light", icon: "chevron.left.circle.fill"),
                    .init(title: "Next", detail: "Zone 2 ride · 42 min · easy", icon: "chevron.right.circle.fill")
                ]
            )
        }
    }
}

private struct WorkoutLogActionSection: View {
    let sessions: [WorkoutSession]
    let onLog: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Button(action: self.onLog) {
                Label("Quick log workout", systemImage: "plus.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .accessibilityIdentifier("activity.workout-log.quick-add")

            DashboardSection(
                title: "Logged sessions",
                items: self.sessions.map {
                    PhaseRowItem(
                        title: $0.title,
                        detail: $0.detail,
                        icon: "checkmark.circle.fill"
                    )
                }
            )
        }
    }
}

private struct ActivityTrackerStateSection: View {
    let state: HealthState

    var body: some View {
        DashboardSection(title: "Health connection", items: self.items)
    }

    private var items: [PhaseRowItem] {
        switch self.state {
        case let .preview(snapshot), let .loaded(snapshot):
            [
                .init(title: "Steps", detail: "\(Int(snapshot.steps)) today", icon: "figure.walk"),
                .init(
                    title: "Active energy",
                    detail: "\(Int(snapshot.activeEnergyKilocalories)) kcal",
                    icon: "flame.fill"
                ),
                .init(title: "Workouts", detail: "\(snapshot.workoutCount) logged", icon: "figure.run")
            ]
        case let .unavailable(error):
            [
                .init(title: "Apple Health", detail: "Unavailable: \(error)", icon: "heart.text.square"),
                .init(title: "Fallback", detail: "Manual workout planning remains available", icon: "dumbbell")
            ]
        }
    }
}

private struct WorkoutPlanActionSection: View {
    let plan: WorkoutPlan
    let onAdvance: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.plan.title)
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                Text(self.plan.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
            .phaseCard(padding: self.theme.spacing.md)

            Button(action: self.onAdvance) {
                Label("Advance plan", systemImage: "arrow.right.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .accessibilityIdentifier("activity.workout-plan.advance")

            DashboardSection(
                title: "Upcoming",
                items: self.plan.nextSessions.map {
                    PhaseRowItem(title: $0, detail: "Queued session", icon: "calendar")
                }
            )
        }
    }
}

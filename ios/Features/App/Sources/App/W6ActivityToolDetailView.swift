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
            case .workoutLog:
                WorkoutLogActionSection(
                    sessions: self.store.workoutLog,
                    onLog: { self.store.send(.quickWorkoutLogged) }
                )
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

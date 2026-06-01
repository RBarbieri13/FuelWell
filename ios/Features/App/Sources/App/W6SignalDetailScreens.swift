import Activity
import SwiftUI

struct ActivitySignalDetailView: View {
    let row: ActivityRow

    var body: some View {
        PhaseScroll(title: self.row.title) {
            PhaseHero(icon: self.row.icon, title: self.row.headline, detail: self.row.detailCopy)
            DashboardSection(title: "What this means", items: self.row.meaningItems)
            DashboardSection(title: "Next action", items: self.row.nextActionItems)
        }
    }
}

extension ActivityRow {
    var headline: String {
        switch self.activitySignalKind {
        case .steps:
            "Movement is supporting today"
        case .activeEnergy:
            "Energy outflow is now part of the decision"
        case .workouts:
            "Training context is available"
        case .schedule:
            "\(self.title) is on the plan"
        }
    }

    var detailCopy: String {
        switch self.activitySignalKind {
        case .steps:
            "FuelWell uses steps as a light signal for appetite, recovery, and the evening recommendation."
        case .activeEnergy:
            "Active energy helps explain whether dinner should stay normal, lighter, or protein-forward."
        case .workouts:
            "Logged sessions give the coach enough context to avoid generic exercise advice."
        case .schedule:
            "This row keeps the weekly plan understandable without forcing a full workout-programming workflow."
        }
    }

    var meaningItems: [PhaseRowItem] {
        switch self.activitySignalKind {
        case .steps:
            [
                .init(title: "Today", detail: self.detail, icon: self.icon),
                .init(
                    title: "Decision weight",
                    detail: "Low friction signal for next meal guidance",
                    icon: "fork.knife"
                )
            ]
        case .activeEnergy:
            [
                .init(title: "Outflow", detail: self.detail, icon: self.icon),
                .init(
                    title: "Dashboard",
                    detail: "Feeds the inflows/outflows card",
                    icon: "arrow.left.arrow.right.circle"
                )
            ]
        case .workouts:
            [
                .init(title: "Logged", detail: self.detail, icon: self.icon),
                .init(
                    title: "Coach context",
                    detail: "Session load informs food and recovery replies",
                    icon: "bubble.left.fill"
                )
            ]
        case .schedule:
            [
                .init(title: self.title, detail: self.detail, icon: self.icon),
                .init(title: "Scope", detail: "Plan preview only until trainer programming is live", icon: "calendar")
            ]
        }
    }

    var nextActionItems: [PhaseRowItem] {
        switch self.activitySignalKind {
        case .steps:
            [
                .init(title: "If dinner is heavy", detail: "Take the 12-minute walk nudge", icon: "figure.walk"),
                .init(title: "If dinner is light", detail: "Keep the plan unchanged", icon: "checkmark.circle.fill")
            ]
        case .activeEnergy:
            [
                .init(title: "Meal impact", detail: "Avoid over-correcting when outflow is high", icon: "target"),
                .init(
                    title: "Progress impact",
                    detail: "Use weekly trend, not one day",
                    icon: "chart.line.uptrend.xyaxis"
                )
            ]
        case .workouts:
            [
                .init(
                    title: "Refuel",
                    detail: "Prioritize protein and enough carbs around training",
                    icon: "bolt.fill"
                ),
                .init(
                    title: "Recovery",
                    detail: "Hard sessions make sleep and body mass more important",
                    icon: "heart"
                )
            ]
        case .schedule:
            [
                .init(title: "Plan", detail: "Keep the next session visible but optional", icon: "dumbbell"),
                .init(
                    title: "Guardrail",
                    detail: "Do not add chores when recovery is low",
                    icon: "shield.lefthalf.filled"
                )
            ]
        }
    }

    private var activitySignalKind: ActivitySignalKind {
        let combined = "\(self.title) \(self.detail)".lowercased()
        if combined.contains("step") {
            return .steps
        }
        if combined.contains("energy") || combined.contains("kcal") {
            return .activeEnergy
        }
        if combined.contains("workout") || combined.contains("body") || combined.contains("session") {
            return .workouts
        }
        return .schedule
    }
}

private enum ActivitySignalKind {
    case steps
    case activeEnergy
    case workouts
    case schedule
}

struct ProactiveNudgeDetailView: View {
    var body: some View {
        PhaseScroll(title: "Dinner Nudge") {
            PhaseHero(
                icon: "bell.badge.fill",
                title: "A walk is queued only if dinner lands heavy",
                detail: "The nudge is conditional: it should feel like a useful safety rail, not a notification habit."
            )
            DashboardSection(
                title: "Why this appears",
                items: [
                    .init(
                        title: "Dinner still open",
                        detail: "Home has enough context to warn before the day closes",
                        icon: "moon.fill"
                    ),
                    .init(
                        title: "Energy balance",
                        detail: "Outflows leave room, but a heavy dinner changes the verdict",
                        icon: "flame.fill"
                    ),
                    .init(
                        title: "Behavior fit",
                        detail: "A short walk is easier than asking for more tracking",
                        icon: "figure.walk"
                    )
                ]
            )
            DashboardSection(
                title: "Notification rules",
                items: [
                    .init(
                        title: "Only if useful",
                        detail: "No nudge is sent when dinner is already balanced",
                        icon: "checkmark.shield.fill"
                    ),
                    .init(
                        title: "Quiet by default",
                        detail: "Future settings control timing and tone",
                        icon: "bell.slash.fill"
                    ),
                    .init(
                        title: "Coach aware",
                        detail: "Coach can explain the nudge without sounding generic",
                        icon: "bubble.left.fill"
                    )
                ]
            )
        }
    }
}

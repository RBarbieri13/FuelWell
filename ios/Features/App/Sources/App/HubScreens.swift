import DesignSystem
import SwiftUI

struct ExerciseActivityView: View {
    var body: some View {
        PhaseScroll(title: "Exercise & Activity") {
            PhaseHero(
                icon: "figure.run",
                title: "Rest day with movement",
                detail: "Walk after dinner and keep lifting for tomorrow."
            )
            DashboardSection(
                title: "This week",
                items: [
                    .init(title: "Mon", detail: "Upper body · 42 min", icon: "checkmark.circle.fill"),
                    .init(title: "Tue", detail: "Active recovery · 34 min", icon: "figure.walk"),
                    .init(title: "Wed", detail: "Lower body planned", icon: "calendar")
                ]
            )
            DashboardSection(
                title: "Training tools",
                items: [
                    .init(
                        title: "Workout Log",
                        detail: "Record trainer or solo sessions",
                        icon: "list.bullet.clipboard"
                    ),
                    .init(
                        title: "Activity Tracker",
                        detail: "Steps, active minutes, energy",
                        icon: "waveform.path.ecg"
                    ),
                    .init(title: "Workout Plans", detail: "Next sessions matched to recovery", icon: "dumbbell")
                ]
            )
        }
    }
}

struct ProgressOverviewView: View {
    var body: some View {
        PhaseScroll(title: "Progress") {
            PhaseHero(
                icon: "chart.line.uptrend.xyaxis",
                title: "Progress is steady",
                detail: "Weight trend and macro adherence point in the same direction."
            )
            DashboardSection(
                title: "Health score detail",
                items: [
                    .init(title: "Nutrition", detail: "82 · protein consistency is improving", icon: "fork.knife"),
                    .init(title: "Activity", detail: "76 · active minutes are stable", icon: "figure.run"),
                    .init(title: "Recovery", detail: "Unlocks with wearable data", icon: "heart")
                ]
            )
            DashboardSection(
                title: "Tracking",
                items: [
                    .init(title: "Macro adherence", detail: "82% this week", icon: "chart.bar.fill"),
                    .init(title: "Body photos", detail: "Add weekly check-in", icon: "camera.fill"),
                    .init(title: "Habits", detail: "Last 14 days · 4 habits", icon: "circle.grid.3x3.fill")
                ]
            )
        }
    }
}

import DesignSystem
import SwiftUI

struct CoachChatView: View {
    @Environment(\.theme) private var theme

    var body: some View {
        PhaseScroll(title: "Coach Chat") {
            CoachBubble(
                title: "FuelWell",
                detail: "Lunch should be protein-forward. Keep carbs moderate and save room for dinner."
            )
            CoachBubble(title: "You", detail: "What is the easiest option?")
            CoachBubble(
                title: "FuelWell",
                detail: "Chicken bowl, half rice, extra vegetables, salsa. Log it with a photo when it arrives."
            )
            DashboardSection(
                title: "Quick prompts",
                items: [
                    .init(title: "Adjust my day", detail: "Rebalance after a meal", icon: "wand.and.stars"),
                    .init(title: "What should I order?", detail: "Restaurant decision help", icon: "fork.knife"),
                    .init(title: "Explain today", detail: "Short recap with next step", icon: "text.bubble")
                ]
            )
            DashboardSection(
                title: "Learn inline",
                items: [
                    .init(title: "Protein anchors", detail: "3-minute guide with one action", icon: "book.pages")
                ]
            )
        }
    }
}

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

private struct CoachBubble: View {
    let title: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.secondary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.primary.color)
        }
        .phaseCard()
    }
}

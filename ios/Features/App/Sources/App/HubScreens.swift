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
            VStack(alignment: .leading, spacing: Theme.app.spacing.md) {
                Text("Training tools")
                    .font(.custom(Theme.app.font.display, size: Theme.app.text.title.size))
                    .fontWeight(.bold)
                VStack(spacing: Theme.app.spacing.sm) {
                    ForEach(ActivityTool.allCases) { tool in
                        NavigationLink {
                            ActivityToolDetailView(tool: tool)
                        } label: {
                            PhaseNavigationRow(item: tool.row)
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("activity.tool.\(tool.accessibilityID)")
                    }
                }
            }
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
            ProgressNavigationSection(
                title: "Health score detail",
                topics: [.nutrition, .activity, .recovery]
            )
            ProgressNavigationSection(
                title: "Tracking",
                topics: [.macroAdherence, .bodyPhotos, .habits]
            )
        }
    }
}

private struct ProgressNavigationSection: View {
    let title: String
    let topics: [ProgressTopic]

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.topics) { topic in
                    NavigationLink {
                        ProgressDetailView(topic: topic)
                    } label: {
                        PhaseNavigationRow(item: topic.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("progress.topic.\(topic.accessibilityID)")
                }
            }
        }
    }
}

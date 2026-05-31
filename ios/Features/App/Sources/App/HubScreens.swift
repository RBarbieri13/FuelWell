import Activity
import ComposableArchitecture
import DesignSystem
import NutritionDomain
import Progress
import SwiftUI

struct ExerciseActivityView: View {
    @Bindable var store: StoreOf<ActivityFeature>

    var body: some View {
        PhaseScroll(title: "Exercise & Activity") {
            PhaseHero(
                icon: "figure.run",
                title: self.store.headline,
                detail: self.store.detail
            )
            DashboardSection(
                title: "This week",
                items: self.store.today.map(PhaseRowItem.init(activityRow:))
            )
            TrainingToolsSection(tools: self.store.tools)
        }
        .onAppear {
            self.store.send(.onAppear)
        }
    }
}

private struct TrainingToolsSection: View {
    let tools: [ActivityTool]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Training tools")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.tools) { tool in
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

struct ProgressOverviewView: View {
    @Bindable var store: StoreOf<ProgressFeature>

    var body: some View {
        PhaseScroll(title: "Progress") {
            PhaseHero(
                icon: "chart.line.uptrend.xyaxis",
                title: self.store.headline,
                detail: self.store.detail
            )
            ProgressNavigationSection(
                title: "Health score detail",
                topics: self.store.healthScoreTopics,
                score: self.store.score
            )
            ProgressNavigationSection(
                title: "Tracking",
                topics: self.store.trackingTopics,
                score: self.store.score
            )
        }
    }
}

private struct ProgressNavigationSection: View {
    let title: String
    let topics: [ProgressTopic]
    let score: HealthScore

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
                        PhaseNavigationRow(item: topic.row(score: self.score))
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("progress.topic.\(topic.accessibilityID)")
                }
            }
        }
    }
}

extension PhaseRowItem {
    init(activityRow: ActivityRow) {
        self.init(title: activityRow.title, detail: activityRow.detail, icon: activityRow.icon)
    }
}

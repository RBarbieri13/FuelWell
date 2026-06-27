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
            ActivitySignalSection(rows: self.store.today)
            TrainingToolsSection(tools: self.store.tools, store: self.store)
        }
        .onAppear {
            self.store.send(.onAppear)
        }
    }
}

private struct ActivitySignalSection: View {
    let rows: [ActivityRow]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("This week")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(Array(self.rows.enumerated()), id: \.element.id) { index, row in
                    NavigationLink {
                        ActivitySignalDetailView(row: row)
                    } label: {
                        PhaseNavigationRow(item: PhaseRowItem(activityRow: row))
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("activity.signal.\(index)")
                }
            }
        }
    }
}

private struct TrainingToolsSection: View {
    let tools: [ActivityTool]
    @Bindable var store: StoreOf<ActivityFeature>
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Training tools")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.tools) { tool in
                    NavigationLink {
                        ActivityToolDetailView(tool: tool, store: self.store)
                    } label: {
                        if tool == .coachRecommended {
                            CoachRecommendedToolRow(item: tool.row)
                        } else {
                            PhaseNavigationRow(item: tool.row)
                        }
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("activity.tool.\(tool.accessibilityID)")
                }
            }
        }
    }
}

private struct CoachRecommendedToolRow: View {
    let item: PhaseRowItem
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Image(systemName: self.item.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(self.theme.color.text.onDark.color)
                .frame(width: 42, height: 42)
                .background(self.theme.color.primary.accent.color)
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.item.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.onDark.color)
                Text(self.item.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.onDarkMuted.color)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.primary.accent.color.opacity(0.28), lineWidth: 1)
        )
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
                score: self.store.score,
                store: self.store
            )
            ProgressNavigationSection(
                title: "Tracking",
                topics: self.store.trackingTopics,
                score: self.store.score,
                store: self.store
            )
        }
    }
}

private struct ProgressNavigationSection: View {
    let title: String
    let topics: [ProgressTopic]
    let score: HealthScore
    @Bindable var store: StoreOf<ProgressFeature>

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(self.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.topics) { topic in
                    NavigationLink {
                        ProgressDetailView(topic: topic, store: self.store)
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

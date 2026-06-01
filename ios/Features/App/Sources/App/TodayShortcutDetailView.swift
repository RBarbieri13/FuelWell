import ComposableArchitecture
import DesignSystem
import SwiftUI

struct TodayShortcutDetailView: View {
    let topic: DashboardShortcutTopic
    @Bindable var store: StoreOf<AppFeature>
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: "Current state", items: self.topic.currentItems)
            DashboardSection(title: "What opens here", items: self.topic.destinationItems)

            Button {
                self.dismiss()
                self.store.send(.tabSelected(self.topic.tab))
            } label: {
                Label(self.topic.fullTabActionTitle, systemImage: self.topic.tab.systemImage)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .accessibilityIdentifier("dashboard.shortcut.\(self.topic.rawValue).open-tab")
        }
    }
}

enum DashboardShortcutTopic: String, CaseIterable, Equatable, Identifiable {
    case meals
    case activity
    case progress

    var id: Self { self }

    var tab: AppTab {
        switch self {
        case .meals:
            .meals
        case .activity:
            .exercise
        case .progress:
            .progress
        }
    }

    var title: String {
        switch self {
        case .meals:
            "Meals Today"
        case .activity:
            "Activity Today"
        case .progress:
            "Progress Today"
        }
    }

    var icon: String {
        switch self {
        case .meals:
            "fork.knife"
        case .activity:
            "figure.walk"
        case .progress:
            "chart.line.uptrend.xyaxis"
        }
    }

    var row: PhaseRowItem {
        switch self {
        case .meals:
            .init(title: "Meals", detail: "2 logged, dinner still open", icon: self.icon)
        case .activity:
            .init(title: "Activity", detail: "34 active minutes, walk after dinner", icon: self.icon)
        case .progress:
            .init(title: "Progress", detail: "Weekly adherence is holding at 82%", icon: self.icon)
        }
    }

    var headline: String {
        switch self {
        case .meals:
            "Dinner is the open decision"
        case .activity:
            "A short walk keeps the day flexible"
        case .progress:
            "Adherence is steady this week"
        }
    }

    var detail: String {
        switch self {
        case .meals:
            "This page summarizes the current food day before sending you into the full meal log."
        case .activity:
            "Activity explains the outflow side of today without making the user hunt through the Exercise tab."
        case .progress:
            "The quick summary keeps the weekly trend one tap away from Home."
        }
    }

    var fullTabActionTitle: String {
        switch self {
        case .meals:
            "Open Meals"
        case .activity:
            "Open Exercise"
        case .progress:
            "Open Progress"
        }
    }

    var currentItems: [PhaseRowItem] {
        switch self {
        case .meals:
            [
                .init(title: "Breakfast", detail: "Logged with protein anchor", icon: "sunrise.fill"),
                .init(title: "Lunch", detail: "Logged, moderate carbs", icon: "sun.max.fill"),
                .init(title: "Dinner", detail: "Still open", icon: "moon.fill")
            ]
        case .activity:
            [
                .init(title: "Steps", detail: "8,420 today", icon: "figure.walk"),
                .init(title: "Active minutes", detail: "34 today", icon: "timer"),
                .init(title: "Nudge", detail: "12-minute walk after dinner", icon: "bell.badge.fill")
            ]
        case .progress:
            [
                .init(title: "Macro adherence", detail: "82% this week", icon: "chart.bar.fill"),
                .init(
                    title: "Health Score",
                    detail: "89 · progress is steady",
                    icon: "gauge.with.dots.needle.67percent"
                ),
                .init(
                    title: "Trend",
                    detail: "Weight and adherence point together",
                    icon: "arrow.up.right.circle.fill"
                )
            ]
        }
    }

    var destinationItems: [PhaseRowItem] {
        switch self {
        case .meals:
            [
                .init(title: "Meal log", detail: "Review today and add dinner", icon: "list.bullet.rectangle"),
                .init(title: "Restaurant guidance", detail: "Use if dinner is out", icon: "fork.knife.circle.fill")
            ]
        case .activity:
            [
                .init(
                    title: "Activity tracker",
                    detail: "Steps, active energy, and workouts",
                    icon: "waveform.path.ecg"
                ),
                .init(title: "Workout plans", detail: "Next sessions matched to recovery", icon: "dumbbell")
            ]
        case .progress:
            [
                .init(title: "Macro adherence", detail: "Open the weekly trend", icon: "chart.bar.fill"),
                .init(title: "Habits", detail: "Review the last 14 days", icon: "circle.grid.3x3.fill")
            ]
        }
    }
}

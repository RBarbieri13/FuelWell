import DesignSystem
import SwiftUI

struct MenuSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Menu") {
                PhaseHero(icon: "person.crop.circle", title: "Robert", detail: "Goal: stronger, leaner, consistent")
                DashboardSection(
                    title: "Tools",
                    items: [
                        .init(
                            title: "Snapshot",
                            detail: "Health Score, recap, inflows/outflows",
                            icon: "gauge.with.dots.needle.67percent"
                        ),
                        .init(title: "Meals", detail: "Log, recipes, meal plans, groceries", icon: "fork.knife"),
                        .init(title: "Training", detail: "Workout log, plans, activity tracker", icon: "figure.run")
                    ]
                )
                DashboardSection(
                    title: "Settings",
                    items: [
                        .init(title: "Account", detail: "Profile, auth, subscription", icon: "person"),
                        .init(title: "Permissions", detail: "HealthKit, notifications, camera", icon: "lock.shield"),
                        .init(title: "Help", detail: "Articles, support, feedback", icon: "questionmark.circle")
                    ]
                )
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close", systemImage: "xmark") {
                        self.dismiss()
                    }
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.body.color)
                }
            }
        }
    }
}

struct HelpView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.theme) private var theme

    var body: some View {
        NavigationStack {
            PhaseScroll(title: "Help") {
                PhaseHero(
                    icon: "magnifyingglass",
                    title: "Search articles, settings, or ask a question",
                    detail: "Short answers first, settings and coach nearby."
                )
                DashboardSection(
                    title: "Featured",
                    items: [
                        .init(
                            title: "Eating out without guessing",
                            detail: "3-minute read · one order to try",
                            icon: "book.pages"
                        ),
                        .init(title: "Notification preferences", detail: "Nudges without guilt", icon: "bell"),
                        .init(title: "Contact support", detail: "Send feedback or report a problem", icon: "envelope")
                    ]
                )
                DashboardSection(
                    title: "Quick settings",
                    items: [
                        .init(title: "HealthKit", detail: "Connect recovery and activity data", icon: "heart"),
                        .init(title: "Camera", detail: "Required for photo meal logging", icon: "camera"),
                        .init(title: "Account", detail: "Profile and sign out", icon: "person.crop.circle")
                    ]
                )
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close", systemImage: "xmark") {
                        self.dismiss()
                    }
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.body.color)
                }
            }
        }
    }
}

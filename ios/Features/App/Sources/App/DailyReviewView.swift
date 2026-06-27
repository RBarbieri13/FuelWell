import ComposableArchitecture
import DesignSystem
import NutritionDomain
import SwiftUI

struct DailyReviewView: View {
    @Bindable var store: StoreOf<AppFeature>
    private let snapshot = MacroDaySnapshot.preview
    @Environment(\.theme) private var theme

    private var healthScore: HealthScore {
        MacroDecisionEngine.healthScore(snapshot: self.snapshot)
    }

    private var netCalories: Int {
        self.snapshot.intake.calories - self.snapshot.energyOut.totalKilocalories
    }

    var body: some View {
        PhaseScroll(title: "Daily Review") {
            PhaseHero(
                icon: "calendar.badge.clock",
                title: "Today, food and movement together",
                detail: "A clean ledger for the decisions that shaped the day: " +
                    "intake, output, macros, and what needs review next."
            )

            DailyReviewFilterStrip()

            LazyVGrid(
                columns: [GridItem(.adaptive(minimum: 148), spacing: self.theme.spacing.sm)],
                spacing: self.theme.spacing.sm
            ) {
                DailyMetricCard(
                    title: "Food in",
                    value: "\(self.snapshot.intake.calories)",
                    unit: "kcal",
                    detail: "\(self.snapshot.remaining.calories) kcal left",
                    color: self.theme.color.macro.calories.color,
                    icon: "fork.knife"
                )
                DailyMetricCard(
                    title: "Output",
                    value: "\(self.snapshot.energyOut.totalKilocalories)",
                    unit: "kcal",
                    detail: "\(self.snapshot.energyOut.steps) steps",
                    color: self.theme.color.semantic.info.color,
                    icon: "flame.fill"
                )
                DailyMetricCard(
                    title: "Balance",
                    value: "\(self.netCalories)",
                    unit: "net",
                    detail: self.netCalories < 0 ? "Output exceeds intake" : "More room remains",
                    color: self.theme.color.primary.accent.color,
                    icon: "equal.circle.fill"
                )
                DailyMetricCard(
                    title: "Score",
                    value: "\(self.healthScore.value)",
                    unit: "pts",
                    detail: self.healthScore.headline,
                    color: self.theme.color.semantic.warning.color,
                    icon: "gauge.with.dots.needle.67percent"
                )
            }

            DailyReviewChartCard(snapshot: self.snapshot)

            DashboardSection(title: "Nutrition log", items: Self.nutritionItems(snapshot: self.snapshot))
            Button {
                FuelWellHaptics.tap()
                self.store.send(.tabSelected(.meals))
            } label: {
                Label("Edit nutrition day", systemImage: "pencil.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)

            DashboardSection(title: "Fitness log", items: Self.fitnessItems(snapshot: self.snapshot))
            Button {
                FuelWellHaptics.tap()
                self.store.send(.tabSelected(.exercise))
            } label: {
                Label("Edit fitness day", systemImage: "figure.run.circle.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.bordered)
            .tint(self.theme.color.primary.accent.color)
        }
        .accessibilityIdentifier("daily-review")
    }

    private static func nutritionItems(snapshot: MacroDaySnapshot) -> [PhaseRowItem] {
        [
            .init(title: "Breakfast", detail: "Greek yogurt power bowl · 330 cal · 31g protein", icon: "sunrise.fill"),
            .init(title: "Lunch", detail: "Chicken quinoa bowl · 520 cal · 42g protein", icon: "sun.max.fill"),
            .init(title: "Dinner", detail: "\(snapshot.remaining.calories) kcal room left", icon: "moon.fill")
        ]
    }

    private static func fitnessItems(snapshot: MacroDaySnapshot) -> [PhaseRowItem] {
        [
            .init(title: "Morning walk", detail: "24 min · 118 active kcal · estimated", icon: "figure.walk"),
            .init(
                title: "Workout",
                detail: "\(snapshot.energyOut.workoutDurationMinutes) min · " +
                    "\(snapshot.energyOut.activeEnergyKilocalories) active kcal",
                icon: "figure.strengthtraining.traditional"
            ),
            .init(title: "Readiness", detail: "Keep intensity moderate if dinner lands light", icon: "heart.fill")
        ]
    }
}

private struct DailyReviewFilterStrip: View {
    @Environment(\.theme) private var theme
    private let filters = ["Today", "3 days", "7 days", "14 days", "30 days"]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: self.theme.spacing.sm) {
                ForEach(self.filters, id: \.self) { filter in
                    Text(filter)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                        .fontWeight(.bold)
                        .foregroundStyle(
                            filter == "Today"
                                ? self.theme.color.text.onDark.color
                                : self.theme.color.text.body.color
                        )
                        .padding(.horizontal, self.theme.spacing.md)
                        .padding(.vertical, self.theme.spacing.sm)
                        .background(
                            filter == "Today"
                                ? self.theme.color.bg.elevated.color
                                : self.theme.color.bg.surface.color
                        )
                        .clipShape(Capsule())
                        .overlay(
                            Capsule()
                                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
                        )
                }
            }
            .padding(.vertical, self.theme.spacing.xs)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Daily review filters. Today is selected.")
    }
}

private struct DailyMetricCard: View {
    let title: String
    let value: String
    let unit: String
    let detail: String
    let color: Color
    let icon: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack {
                Image(systemName: self.icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(self.color)
                    .frame(width: 30, height: 30)
                    .background(self.color.opacity(0.12))
                    .clipShape(Circle())
                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.body.color)
                Spacer()
            }
            HStack(alignment: .firstTextBaseline, spacing: self.theme.spacing.xs) {
                Text(self.value)
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.display.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
                Text(self.unit)
                    .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.secondary.color)
            }
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
        }
        .phaseCard(padding: self.theme.spacing.md)
        .accessibilityElement(children: .combine)
    }
}

private struct DailyReviewChartCard: View {
    let snapshot: MacroDaySnapshot
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Intake and output by day")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            Text("Today is selected. The 30-day view expands this into aggregate intake and output bars.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            HStack(alignment: .bottom, spacing: self.theme.spacing.xl) {
                DailyBar(
                    title: "Intake",
                    values: [
                        (self.theme.color.macro.fat.color, 0.18),
                        (self.theme.color.macro.carbs.color, 0.28),
                        (self.theme.color.macro.protein.color, 0.34)
                    ]
                )
                DailyBar(
                    title: "Output",
                    values: [
                        (self.theme.color.semantic.info.color, 0.22),
                        (self.theme.color.primary.accent.color, 0.42),
                        (self.theme.color.bg.elevated.color, 0.52)
                    ]
                )
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("\(self.snapshot.energyOut.steps)")
                        .font(.custom(self.theme.font.numeric, size: self.theme.text.titleLG.size))
                        .fontWeight(.bold)
                    Text("steps today")
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                }
                Spacer()
            }
            .frame(height: 180)
        }
        .phaseCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Intake and output by day chart")
    }
}

private struct DailyBar: View {
    let title: String
    let values: [(Color, CGFloat)]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(spacing: self.theme.spacing.sm) {
            VStack(spacing: 0) {
                ForEach(Array(self.values.enumerated()), id: \.offset) { _, item in
                    item.0
                        .frame(width: 34, height: max(10, 120 * item.1))
                }
            }
            .clipShape(Capsule())
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.secondary.color)
        }
    }
}

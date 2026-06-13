import ComposableArchitecture
import DesignSystem
import NutritionDomain
import SwiftUI

struct DashboardView: View {
    @Bindable var store: StoreOf<AppFeature>
    @Environment(\.theme) private var theme
    @State private var isMenuPresented = false
    @State private var isHelpPresented = false

    private let snapshot = MacroDaySnapshot.preview
    private var healthScore: HealthScore {
        MacroDecisionEngine.healthScore(snapshot: self.snapshot)
    }

    init(store: StoreOf<AppFeature>) {
        self.store = store
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                VerdictCard(snapshot: self.snapshot) {
                    FuelWellHaptics.commit()
                    self.store.send(.tabSelected(.meals))
                }

                NavigationLink {
                    DashboardDetailView(topic: .healthScore, snapshot: self.snapshot)
                } label: {
                    FuelWellScoreChip(
                        value: self.healthScore.value,
                        trend: self.scoreTrend,
                        trendDetail: self.healthScore.headline.lowercased()
                    )
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("dashboard.detail.health-score")
                .qualityID(QualityIdentifier.dashboardHealthScore)

                NavigationLink {
                    DashboardDetailView(topic: .inflowsOutflows, snapshot: self.snapshot)
                } label: {
                    InflowsOutflowsCard(snapshot: self.snapshot)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("dashboard.detail.inflows-outflows")
                .qualityID(QualityIdentifier.dashboardInflowsOutflows)

                DashboardShortcutSection(store: self.store)

                NavigationLink {
                    ProactiveNudgeDetailView()
                } label: {
                    ProactiveNudgeCard()
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("dashboard.nudge.detail")
            }
            .padding(self.theme.spacing.md)
            .padding(.bottom, self.theme.spacing.fourXL)
        }
        .background(self.theme.color.bg.base.color)
        .navigationTitle("Dashboard")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Menu", systemImage: "line.3.horizontal") {
                    self.isMenuPresented = true
                }
                .labelStyle(.iconOnly)
                .tint(self.theme.color.text.body.color)
                .qualityID(QualityIdentifier.menuButton)
            }

            ToolbarItem(placement: .topBarTrailing) {
                Button("Help", systemImage: "questionmark.circle") {
                    self.isHelpPresented = true
                }
                .labelStyle(.iconOnly)
                .tint(self.theme.color.text.body.color)
                .qualityID(QualityIdentifier.helpButton)
            }
        }
        .sheet(isPresented: self.$isMenuPresented) {
            MenuSheetView(store: self.store)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: self.$isHelpPresented) {
            HelpView()
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
    }

    private var scoreTrend: FuelWellScoreChip.Trend {
        if self.healthScore.value >= 80 {
            return .improving
        }
        if self.healthScore.value >= 68 {
            return .steady
        }
        return .declining
    }
}

private struct InflowsOutflowsCard: View {
    let snapshot: MacroDaySnapshot
    @Environment(\.theme) private var theme
    private var netCalories: Int {
        self.snapshot.intake.calories - self.snapshot.energyOut.totalKilocalories
    }

    private var netLabel: String {
        let sign = self.netCalories >= 0 ? "+" : ""
        return "\(sign)\(self.netCalories)"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack {
                Text("Energy balance")
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                Spacer()
                Text("Day")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .padding(.horizontal, self.theme.spacing.sm)
                    .padding(.vertical, self.theme.spacing.xs)
                    .background(self.theme.color.primary.accent.color.opacity(0.12))
                    .clipShape(Capsule())
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(self.theme.color.text.muted.color)
                    .accessibilityHidden(true)
            }

            Text("Food in and movement out are close enough to keep the next meal flexible.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)

            HStack(alignment: .center, spacing: self.theme.spacing.md) {
                MiniRing(
                    value: 0.47,
                    title: "Food in",
                    detail: "\(self.snapshot.intake.calories) cal",
                    icon: "fork.knife",
                    caption: "Logged"
                )
                MiniRing(
                    value: 0.58,
                    title: "Move out",
                    detail: "\(self.snapshot.energyOut.totalKilocalories) cal",
                    icon: "flame.fill",
                    caption: "Apple Health"
                )
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text(self.netLabel)
                        .font(.custom(self.theme.font.numeric, size: self.theme.text.titleLG.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    Text("net calories so far")
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
            }
        }
        .phaseCard()
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Inflows and Outflows")
        .accessibilityValue(
            "\(self.snapshot.intake.calories) calories in. " +
                "\(self.snapshot.energyOut.totalKilocalories) calories out. " +
                "\(self.netCalories) net calories."
        )
        .qualityID(QualityIdentifier.dashboardInflowsOutflows)
    }
}

private struct VerdictCard: View {
    let snapshot: MacroDaySnapshot
    let onLogMeal: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("Next action")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.secondary.color)
            Text(self.snapshot.verdict.headline)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
            Text(self.snapshot.verdict.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            Button("Log Meal", systemImage: "camera.fill", action: self.onLogMeal)
                .buttonStyle(.borderedProminent)
                .tint(self.theme.color.primary.accent.color)
                .fontWeight(.bold)
        }
        .phaseCard()
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Next action")
        .qualityID(QualityIdentifier.dashboardVerdict)
    }
}

private struct DashboardShortcutSection: View {
    @Bindable var store: StoreOf<AppFeature>
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Today")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(DashboardShortcutTopic.allCases) { topic in
                    NavigationLink {
                        TodayShortcutDetailView(topic: topic, store: self.store)
                    } label: {
                        PhaseNavigationRow(item: topic.row)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("dashboard.shortcut.\(topic.rawValue)")
                }
            }
        }
    }
}

private struct ProactiveNudgeCard: View {
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.sm) {
            Label("Nudge: take a 12-minute walk after dinner if dinner lands heavy.", systemImage: "bell.badge")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.onDark.color)
                .frame(maxWidth: .infinity, alignment: .leading)

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.onDark.color.opacity(0.75))
                .accessibilityHidden(true)
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct MiniRing: View {
    let value: Double
    let title: String
    let detail: String
    let icon: String
    let caption: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(spacing: self.theme.spacing.xs) {
            ZStack {
                Circle().stroke(self.theme.color.bg.borderSoft.color, lineWidth: 8)
                Circle()
                    .trim(from: 0, to: self.value)
                    .stroke(self.theme.color.primary.accent.color, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Image(systemName: self.icon)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .accessibilityHidden(true)
            }
            .frame(width: 64, height: 64)
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            Text(self.caption)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.secondary.color)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(self.title), \(self.detail), \(self.caption)")
    }
}

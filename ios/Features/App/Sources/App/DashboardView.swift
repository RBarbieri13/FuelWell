import DesignSystem
import NutritionDomain
import SwiftUI

struct DashboardView: View {
    @Environment(\.theme) private var theme
    @State private var isMenuPresented = false
    @State private var isHelpPresented = false

    private let snapshot = MacroDaySnapshot.preview

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                HealthScoreHero()
                InflowsOutflowsCard(snapshot: self.snapshot)
                VerdictCard(snapshot: self.snapshot)
                ProactiveNudgeCard()
                DashboardSection(
                    title: "Today",
                    items: [
                        .init(title: "Meals", detail: "2 logged, dinner still open", icon: "fork.knife"),
                        .init(title: "Activity", detail: "34 active minutes, walk after dinner", icon: "figure.walk"),
                        .init(
                            title: "Progress",
                            detail: "Weekly adherence is holding at 82%",
                            icon: "chart.line.uptrend.xyaxis"
                        )
                    ]
                )
            }
            .padding(self.theme.spacing.md)
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
            MenuSheetView()
        }
        .sheet(isPresented: self.$isHelpPresented) {
            HelpView()
        }
    }
}

private struct HealthScoreHero: View {
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .center, spacing: self.theme.spacing.lg) {
            ZStack {
                Circle()
                    .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 12)
                Circle()
                    .trim(from: 0, to: 0.78)
                    .stroke(self.theme.color.primary.accent.color, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text("78")
                    .font(.custom(self.theme.font.numeric, size: self.theme.text.display.size))
                    .fontWeight(.bold)
            }
            .frame(width: 96, height: 96)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text("Health Score")
                    .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                    .fontWeight(.bold)
                Text("Protein is behind today. Fix lunch first.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
                Text("Recovery unlocks with wearable data.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.secondary.color)
            }
        }
        .phaseCard()
        .qualityID(QualityIdentifier.dashboardHealthScore)
    }
}

private struct InflowsOutflowsCard: View {
    let snapshot: MacroDaySnapshot
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack {
                Text("Inflows / Outflows")
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
            }

            HStack(spacing: self.theme.spacing.lg) {
                MiniRing(value: 0.47, title: "In", detail: "\(self.snapshot.intake.calories) cal")
                MiniRing(value: 0.58, title: "Out", detail: "1,210 cal")
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("+230")
                        .font(.custom(self.theme.font.numeric, size: self.theme.text.display.size))
                        .fontWeight(.bold)
                    Text("net calories so far")
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
            }
        }
        .phaseCard()
        .qualityID(QualityIdentifier.dashboardInflowsOutflows)
    }
}

private struct VerdictCard: View {
    let snapshot: MacroDaySnapshot
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
            Button("Log Meal", systemImage: "camera.fill") {}
                .buttonStyle(.borderedProminent)
                .tint(self.theme.color.primary.accent.color)
                .fontWeight(.bold)
        }
        .phaseCard()
        .qualityID(QualityIdentifier.dashboardVerdict)
    }
}

private struct ProactiveNudgeCard: View {
    @Environment(\.theme) private var theme

    var body: some View {
        Label("Nudge: take a 12-minute walk after dinner if dinner lands heavy.", systemImage: "bell.badge")
            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
            .fontWeight(.semibold)
            .foregroundStyle(self.theme.color.text.onDark.color)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(self.theme.spacing.md)
            .background(self.theme.color.bg.elevated.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct MiniRing: View {
    let value: Double
    let title: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(spacing: self.theme.spacing.xs) {
            ZStack {
                Circle().stroke(self.theme.color.bg.borderSoft.color, lineWidth: 8)
                Circle()
                    .trim(from: 0, to: self.value)
                    .stroke(self.theme.color.primary.accent.color, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
            }
            .frame(width: 76, height: 76)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.semibold)
        }
    }
}

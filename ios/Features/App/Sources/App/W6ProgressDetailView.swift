import ComposableArchitecture
import DesignSystem
import Progress
import SwiftUI

struct ProgressDetailView: View {
    let topic: ProgressTopic
    @Bindable var store: StoreOf<ProgressFeature>

    var body: some View {
        PhaseScroll(title: self.topic.title) {
            PhaseHero(icon: self.topic.icon, title: self.topic.headline, detail: self.topic.detail)
            DashboardSection(title: self.topic.primarySectionTitle, items: self.topic.primaryItems)
            switch self.topic {
            case .bodyPhotos:
                BodyPhotoCheckInSection(
                    checkIns: self.store.bodyPhotoCheckIns,
                    onAdd: { self.store.send(.bodyPhotoCheckInAdded) }
                )
            case .habits:
                HabitChecklistSection(
                    habits: self.store.habits,
                    onToggle: {
                        FuelWellHaptics.confirm()
                        self.store.send(.habitToggled($0))
                    }
                )
            case .calories, .macroAdherence:
                MacroAdherenceTrendSection()
            case .nutrition, .activity, .recovery:
                EmptyView()
            }
            DashboardSection(title: "Next decision", items: self.topic.nextItems)
        }
    }
}

private struct BodyPhotoCheckInSection: View {
    let checkIns: [BodyPhotoCheckIn]
    let onAdd: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Check-ins")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            Button(action: self.onAdd) {
                Label("Add weekly check-in", systemImage: "camera.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, self.theme.spacing.sm)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .accessibilityIdentifier("progress.body-photos.add-check-in")

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.checkIns) { checkIn in
                    VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                        HStack {
                            Text(checkIn.label)
                                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                                .fontWeight(.bold)
                            Spacer()
                            Text(Self.dateFormatter.string(from: checkIn.capturedAt))
                                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                                .fontWeight(.bold)
                                .foregroundStyle(self.theme.color.text.secondary.color)
                        }
                        Text(checkIn.angles.joined(separator: " · "))
                            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                            .fontWeight(.semibold)
                            .foregroundStyle(self.theme.color.text.body.color)
                        Text(checkIn.note)
                            .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                            .fontWeight(.medium)
                            .foregroundStyle(self.theme.color.text.secondary.color)
                    }
                    .phaseCard(padding: self.theme.spacing.md)
                    .accessibilityElement(children: .combine)
                }
            }
        }
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter
    }()
}

private struct HabitChecklistSection: View {
    let habits: [ProgressHabit]
    let onToggle: (ProgressHabit.ID) -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Today")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.habits) { habit in
                    Button {
                        self.onToggle(habit.id)
                    } label: {
                        HStack(spacing: self.theme.spacing.md) {
                            Image(systemName: habit.isComplete ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundStyle(self.iconColor(isComplete: habit.isComplete))
                            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                                Text(habit.title)
                                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                                    .fontWeight(.bold)
                                    .foregroundStyle(self.theme.color.text.primary.color)
                                Text(habit.detail)
                                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                                    .fontWeight(.semibold)
                                    .foregroundStyle(self.theme.color.text.body.color)
                            }
                            Spacer()
                        }
                        .phaseCard(padding: self.theme.spacing.md)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("progress.habit.\(habit.id.uuidString)")
                    .accessibilityValue(habit.isComplete ? "Complete" : "Not complete")
                }
            }
        }
    }

    private func iconColor(isComplete: Bool) -> Color {
        isComplete ? self.theme.color.primary.accent.color : self.theme.color.text.muted.color
    }
}

private struct MacroAdherenceTrendSection: View {
    @Environment(\.theme) private var theme
    private let days: [FuelWellStackedBarChart.Day] = [
        .init(label: "M", protein: 610, carbs: 820, fat: 420),
        .init(label: "T", protein: 680, carbs: 760, fat: 390),
        .init(label: "W", protein: 560, carbs: 910, fat: 470),
        .init(label: "T", protein: 720, carbs: 790, fat: 410),
        .init(label: "F", protein: 700, carbs: 830, fat: 430),
        .init(label: "S", protein: 650, carbs: 780, fat: 405),
        .init(label: "S", protein: 690, carbs: 800, fat: 420)
    ]
    private let weights = [
        188.2,
        187.8,
        187.6,
        187.1,
        186.9,
        186.8,
        186.6
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("7-day trend")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            FuelWellStackedBarChart(title: "Calories by macro", days: self.days)

            FuelWellMetricTile(
                title: "Weight trend",
                value: "186.6",
                detail: "down 1.6 lb across recent check-ins",
                icon: "scalemass.fill",
                tone: .info,
                sparklineValues: self.weights,
                sparklineSummary: "Weight is trending down 1.6 pounds across recent check-ins."
            )
        }
    }
}

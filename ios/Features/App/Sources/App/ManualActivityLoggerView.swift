import Activity
import DesignSystem
import HealthKitClient
import SwiftUI

struct ManualActivityLoggerSection: View {
    let healthState: HealthState
    let onLog: (String, String) -> Void
    @Environment(\.theme) private var theme
    @State private var selectedActivity = ManualActivityType.default
    @State private var selectedIntensity = ManualActivityIntensity.steady
    @State private var minutes = 30.0
    @State private var distanceMiles = 2.0
    @State private var calorieOverride = ""
    @State private var didLog = false

    private var weightKilograms: Double {
        self.healthState.bodyMassKilograms ?? ManualActivityEstimator.defaultWeightKilograms
    }

    private var estimatedCalories: Int {
        ManualActivityEstimator.estimatedCalories(
            met: self.selectedActivity.met * self.selectedIntensity.multiplier,
            weightKilograms: self.weightKilograms,
            minutes: self.minutes
        )
    }

    private var loggedCalories: Int {
        Int(self.calorieOverride) ?? self.estimatedCalories
    }

    private var weightLabel: String {
        "\(Int((self.weightKilograms * 2.20462).rounded())) lb profile"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
            self.estimatorHeader
            self.activityPicker
            self.durationControls
            if self.selectedActivity.usesDistance {
                self.distanceControls
            }
            self.calorieReview
            self.logButton
            DashboardSection(title: "Supported activity types", items: ManualActivityType.supportedRows)
        }
        .phaseCard()
        .accessibilityIdentifier("activity.manual-logger")
    }

    private var estimatorHeader: some View {
        FuelWellMetricExplainerCard(
            eyebrow: "Add any activity",
            title: "Estimate burn from your profile",
            detail: "FuelWell uses effort, minutes, and your weight signal to make the next decision more accurate.",
            points: [
                .init(
                    id: "weight",
                    title: self.weightLabel,
                    detail: "Shown in pounds for review while MET math stays standardized behind the scenes.",
                    systemImage: "person.crop.circle",
                    tone: .activity
                ),
                .init(
                    id: "editable",
                    title: "Editable estimate",
                    detail: "Override calories when a wearable, machine, or coach gives you a better number.",
                    systemImage: "slider.horizontal.3",
                    tone: .nutrition
                )
            ]
        )
    }

    private var activityPicker: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            ManualActivityFieldLabel("Activity")
            Picker("Activity", selection: self.$selectedActivity) {
                ForEach(ManualActivityType.all) { activity in
                    Label(activity.title, systemImage: activity.icon).tag(activity)
                }
            }
            .pickerStyle(.menu)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, self.theme.spacing.sm)
            .padding(.vertical, self.theme.spacing.xs)
            .background(self.theme.color.bg.base.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

            Text(self.selectedActivity.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)

            ManualActivityFieldLabel("Effort")
            Picker("Effort", selection: self.$selectedIntensity) {
                ForEach(ManualActivityIntensity.allCases) { intensity in
                    Text(intensity.title).tag(intensity)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var durationControls: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack {
                ManualActivityFieldLabel("Minutes")
                Spacer()
                Text("\(Int(self.minutes)) min")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
            }
            Slider(value: self.$minutes, in: 5...180, step: 5)
                .tint(self.theme.color.primary.accent.color)
        }
    }

    private var distanceControls: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack {
                ManualActivityFieldLabel("Distance")
                Spacer()
                Text("\(self.distanceMiles, specifier: "%.1f") mi")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)
            }
            Slider(value: self.$distanceMiles, in: 0.25...30, step: 0.25)
                .tint(self.theme.color.primary.accent.color)
        }
    }

    private var calorieReview: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack(alignment: .top, spacing: self.theme.spacing.sm) {
                ManualActivitySummaryTile(
                    title: "Burn",
                    value: "\(self.loggedCalories)",
                    detail: "active kcal"
                )
                ManualActivitySummaryTile(
                    title: "MET",
                    value: String(format: "%.1f", self.selectedActivity.met * self.selectedIntensity.multiplier),
                    detail: self.selectedIntensity.title.lowercased()
                )
            }

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                ManualActivityFieldLabel("Edit calories")
                TextField("Auto \(self.estimatedCalories)", text: self.$calorieOverride)
                    .keyboardType(.numberPad)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.bg.base.color)
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                    .overlay(
                        RoundedRectangle(cornerRadius: self.theme.radius.sm)
                            .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
                    )
            }
        }
    }

    private var logButton: some View {
        Button {
            self.didLog = true
            self.onLog(self.selectedActivity.title, self.logDetail)
        } label: {
            Label(
                self.didLog ? "Activity logged" : "Add activity",
                systemImage: self.didLog ? "checkmark.circle.fill" : "plus.circle.fill"
            )
            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
            .fontWeight(.bold)
            .frame(maxWidth: .infinity)
            .padding(.vertical, self.theme.spacing.sm)
        }
        .buttonStyle(.borderedProminent)
        .tint(self.didLog ? self.theme.color.primary.green.color : self.theme.color.primary.accent.color)
        .accessibilityIdentifier("activity.manual-logger.add")
    }

    private var logDetail: String {
        let distance = self.selectedActivity.usesDistance ? " · \(String(format: "%.1f", self.distanceMiles)) mi" : ""
        let effort = self.selectedIntensity.title.lowercased()
        return "\(Int(self.minutes)) min\(distance) · \(self.loggedCalories) kcal · \(effort)"
    }
}

private struct ManualActivitySummaryTile: View {
    let title: String
    let value: String
    let detail: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.muted.color)
            Text(self.value)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text(self.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

private struct ManualActivityFieldLabel: View {
    let title: String
    @Environment(\.theme) private var theme

    init(_ title: String) {
        self.title = title
    }

    var body: some View {
        Text(self.title.uppercased())
            .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
            .fontWeight(.bold)
            .foregroundStyle(self.theme.color.text.muted.color)
    }
}

private struct ManualActivityEstimator {
    static let defaultWeightKilograms = 82.4

    static func estimatedCalories(met: Double, weightKilograms: Double, minutes: Double) -> Int {
        Int(((met * 3.5 * weightKilograms / 200) * minutes).rounded())
    }
}

private struct ManualActivityType: Equatable, Hashable, Identifiable {
    let id: String
    let title: String
    let detail: String
    let icon: String
    let met: Double
    let usesDistance: Bool

    static let all: [Self] = [
        .init(
            id: "walking",
            title: "Walking",
            detail: "Neighborhood walks, errands, warmups, and step-focused sessions.",
            icon: "figure.walk",
            met: 3.5,
            usesDistance: true
        ),
        .init(
            id: "hiking",
            title: "Hiking",
            detail: "Trails, elevation, pack weight, and outdoor steady-state work.",
            icon: "figure.hiking",
            met: 6.0,
            usesDistance: true
        ),
        .init(
            id: "running",
            title: "Running",
            detail: "Easy runs, tempo work, run-walk intervals, or treadmill miles.",
            icon: "figure.run",
            met: 9.8,
            usesDistance: true
        ),
        .init(
            id: "interval-training",
            title: "Interval training",
            detail: "Circuit work, HIIT, sprints, work-rest sessions, and conditioning.",
            icon: "timer",
            met: 8.0,
            usesDistance: false
        ),
        .init(
            id: "swimming",
            title: "Swimming",
            detail: "Pool laps, open water, mixed stroke, and aqua conditioning.",
            icon: "figure.pool.swim",
            met: 7.0,
            usesDistance: false
        ),
        .init(
            id: "biking",
            title: "Biking",
            detail: "Road, indoor, mountain, casual, or Zone 2 cycling.",
            icon: "bicycle",
            met: 7.5,
            usesDistance: true
        ),
        .init(
            id: "rowing",
            title: "Rowing",
            detail: "Erg meters, intervals, steady rowing, and mixed pulls.",
            icon: "figure.rower",
            met: 7.0,
            usesDistance: true
        ),
        .init(
            id: "yoga",
            title: "Yoga",
            detail: "Recovery flow, balance, mobility, and breath-led movement.",
            icon: "figure.mind.and.body",
            met: 2.5,
            usesDistance: false
        ),
        .init(
            id: "pilates",
            title: "Pilates",
            detail: "Mat, reformer-style, core control, and low-impact strength.",
            icon: "figure.core.training",
            met: 3.0,
            usesDistance: false
        ),
        .init(
            id: "stairs",
            title: "Stairs",
            detail: "Stair climber, stadium stairs, hills, and incline repeats.",
            icon: "figure.stairs",
            met: 8.8,
            usesDistance: false
        ),
        .init(
            id: "elliptical",
            title: "Elliptical",
            detail: "Low-impact cardio with editable machine calorie feedback.",
            icon: "figure.elliptical",
            met: 5.0,
            usesDistance: false
        ),
        .init(
            id: "sport",
            title: "Sport",
            detail: "Basketball, tennis, soccer, pickleball, and court games.",
            icon: "sportscourt",
            met: 7.0,
            usesDistance: false
        ),
        .init(
            id: "strength",
            title: "Strength",
            detail: "Lifting, machines, dumbbells, bands, and resistance circuits.",
            icon: "dumbbell",
            met: 5.0,
            usesDistance: false
        ),
        .init(
            id: "mobility",
            title: "Mobility",
            detail: "Reset work, stretching, tissue prep, and range-of-motion sessions.",
            icon: "waveform.path.ecg",
            met: 2.3,
            usesDistance: false
        ),
        .init(
            id: "custom",
            title: "Custom",
            detail: "Use when the activity is unusual and edit calories manually.",
            icon: "slider.horizontal.3",
            met: 4.0,
            usesDistance: false
        )
    ]

    static let `default` = Self.all[0]

    static var supportedRows: [PhaseRowItem] {
        Self.all.map {
            PhaseRowItem(
                title: $0.title,
                detail: "\($0.detail) Baseline \(String(format: "%.1f", $0.met)) MET.",
                icon: $0.icon
            )
        }
    }
}

private enum ManualActivityIntensity: String, CaseIterable, Identifiable {
    case easy
    case steady
    case hard

    var id: Self { self }

    var title: String {
        switch self {
        case .easy:
            "Easy"
        case .steady:
            "Steady"
        case .hard:
            "Hard"
        }
    }

    var multiplier: Double {
        switch self {
        case .easy:
            0.85
        case .steady:
            1.0
        case .hard:
            1.18
        }
    }
}

extension HealthState {
    var bodyMassKilograms: Double? {
        switch self {
        case let .preview(snapshot), let .loaded(snapshot):
            snapshot.bodyMassKilograms
        case .unavailable:
            nil
        }
    }
}

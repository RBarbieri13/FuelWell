import DesignSystem
import SwiftUI

struct WorkoutDatabaseSection: View {
    let onLog: (FitnessWorkoutTemplate) -> Void
    @Environment(\.theme) private var theme
    @State private var query = ""
    @State private var selectedBodyPart = "All body parts"
    @State private var selectedType = "All types"

    private var bodyPartOptions: [String] {
        ["All body parts"] + Array(Set(FitnessWorkoutTemplate.all.map(\.bodyPart))).sorted()
    }

    private var typeOptions: [String] {
        ["All types"] + Array(Set(FitnessWorkoutTemplate.all.map(\.type))).sorted()
    }

    private var filteredTemplates: [FitnessWorkoutTemplate] {
        FitnessWorkoutTemplate.all.filter { template in
            let matchesQuery = self.query.isEmpty ||
                template.title.localizedCaseInsensitiveContains(self.query) ||
                template.subtitle.localizedCaseInsensitiveContains(self.query) ||
                template.goal.localizedCaseInsensitiveContains(self.query) ||
                template.equipment.localizedCaseInsensitiveContains(self.query)
            let matchesBodyPart = self.selectedBodyPart == "All body parts" ||
                template.bodyPart == self.selectedBodyPart
            let matchesType = self.selectedType == "All types" ||
                template.type == self.selectedType
            return matchesQuery && matchesBodyPart && matchesType
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                    Text("Workout database")
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                    Text("\(self.filteredTemplates.count) of \(FitnessWorkoutTemplate.all.count) workouts shown")
                        .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                        .fontWeight(.semibold)
                        .foregroundStyle(self.theme.color.text.body.color)
                }
                Spacer()
            }
            TextField("Search rows, pull, ride...", text: self.$query)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .textInputAutocapitalization(.never)
                .padding(self.theme.spacing.sm)
                .background(self.theme.color.bg.base.color)
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                .overlay(
                    RoundedRectangle(cornerRadius: self.theme.radius.md)
                        .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
                )
                .accessibilityIdentifier("activity.workout-database.search")

            HStack(spacing: self.theme.spacing.sm) {
                WorkoutFilterPicker(
                    title: "Body part",
                    selection: self.$selectedBodyPart,
                    options: self.bodyPartOptions
                )
                WorkoutFilterPicker(
                    title: "Type",
                    selection: self.$selectedType,
                    options: self.typeOptions
                )
            }
            if self.filteredTemplates.isEmpty {
                WorkoutEmptyState {
                    self.query = ""
                    self.selectedBodyPart = "All body parts"
                    self.selectedType = "All types"
                }
            } else {
                VStack(spacing: self.theme.spacing.sm) {
                    ForEach(self.filteredTemplates) { template in
                        NavigationLink {
                            WorkoutTemplateDetailView(template: template, onLog: self.onLog)
                        } label: {
                            WorkoutTemplateRow(template: template)
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("activity.workout-database.preview.\(template.id)")
                    }
                }
            }
        }
        .phaseCard()
    }
}
struct WorkoutTemplateDetailView: View {
    let template: FitnessWorkoutTemplate
    let onLog: (FitnessWorkoutTemplate) -> Void
    @Environment(\.theme) private var theme
    @State private var didLog = false

    var body: some View {
        PhaseScroll(title: self.template.title) {
            VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                WorkoutPreviewHero(template: self.template)
                WorkoutMetricGrid(template: self.template)
                self.logButton
            }
            WorkoutPlanBlockSection(template: self.template)
            WorkoutDetailInfoSection(template: self.template)
            WorkoutRelatedSection(template: self.template, onLog: self.onLog)
        }
    }

    private var logButton: some View {
        Button {
            self.didLog = true
            self.onLog(self.template)
        } label: {
            Label(
                self.didLog ? "Logged for today" : "Log this workout",
                systemImage: self.didLog ? "checkmark.circle.fill" : "plus.circle.fill"
            )
            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
            .fontWeight(.bold)
            .frame(maxWidth: .infinity)
            .padding(.vertical, self.theme.spacing.sm)
        }
        .buttonStyle(.borderedProminent)
        .tint(self.didLog ? self.theme.color.primary.green.color : self.theme.color.primary.accent.color)
        .accessibilityIdentifier("activity.workout-detail.log.\(self.template.id)")
    }
}
private struct WorkoutFilterPicker: View {
    let title: String
    @Binding var selection: String
    let options: [String]
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.muted.color)
            Picker(self.title, selection: self.$selection) {
                ForEach(self.options, id: \.self) { option in
                    Text(option).tag(option)
                }
            }
            .pickerStyle(.menu)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, self.theme.spacing.sm)
            .padding(.vertical, self.theme.spacing.xs)
            .background(self.theme.color.bg.base.color)
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        }
    }
}

private struct WorkoutEmptyState: View {
    let onReset: () -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("No workouts match those filters")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.bold)
            Text("Clear the filters or search for a broader movement pattern.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
            Button(action: self.onReset) {
                Label("Clear filters", systemImage: "line.3.horizontal.decrease.circle")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
            }
            .buttonStyle(.bordered)
            .tint(self.theme.color.primary.accent.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}
private struct WorkoutTemplateRow: View {
    let template: FitnessWorkoutTemplate
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Image(systemName: self.template.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 46, height: 46)
                .background(self.theme.color.primary.accent.color.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                HStack(spacing: self.theme.spacing.xs) {
                    Text(self.template.title)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)
                    WorkoutTemplateChip(text: self.template.bodyPart)
                }
                Text(self.template.subtitle)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
                HStack(spacing: self.theme.spacing.xs) {
                    WorkoutTemplateChip(text: "\(self.template.durationMinutes) min", systemImage: "timer")
                    WorkoutTemplateChip(text: self.template.intensity, systemImage: "leaf")
                    WorkoutTemplateChip(text: "\(self.template.calories) kcal", systemImage: "flame.fill")
                }
            }
            Spacer()
            Image(systemName: "eye.fill")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 34, height: 34)
                .background(self.theme.color.primary.accent.color.opacity(0.12))
                .clipShape(Circle())
                .accessibilityHidden(true)
        }
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.base.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}
private struct WorkoutTemplateChip: View {
    let text: String
    var systemImage: String?
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.xs) {
            if let systemImage = self.systemImage {
                Image(systemName: systemImage)
            }
            Text(self.text)
        }
        .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
        .fontWeight(.bold)
        .foregroundStyle(self.theme.color.primary.accent.color)
        .padding(.horizontal, self.theme.spacing.xs)
        .padding(.vertical, self.theme.spacing.xs)
        .background(self.theme.color.primary.accent.color.opacity(0.12))
        .clipShape(Capsule())
    }
}

private struct WorkoutPreviewHero: View {
    let template: FitnessWorkoutTemplate
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            WorkoutTemplateChip(text: "Preview before logging", systemImage: "eye.fill")
            Text(self.template.title)
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)
            Text(self.template.subtitle)
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
            HStack(spacing: self.theme.spacing.sm) {
                WorkoutDarkMetric(value: "\(self.template.durationMinutes)", label: "min")
                WorkoutDarkMetric(value: "\(self.template.calories)", label: "active kcal")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.lg))
    }
}

private struct WorkoutDarkMetric: View {
    let value: String
    let label: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.value)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDark.color)
            Text(self.label.uppercased())
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.text.onDark.color.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
    }
}

private struct WorkoutMetricGrid: View {
    let template: FitnessWorkoutTemplate
    @Environment(\.theme) private var theme

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: self.theme.spacing.sm) {
            WorkoutMetricTile(title: "Type", value: self.template.type, icon: "slider.horizontal.3")
            WorkoutMetricTile(title: "Intensity", value: self.template.intensity, icon: "leaf")
            WorkoutMetricTile(title: "Equipment", value: self.template.equipment, icon: "bag")
            WorkoutMetricTile(title: "Soreness", value: self.template.sorenessCost, icon: "heart.text.square")
        }
    }
}

private struct WorkoutMetricTile: View {
    let title: String
    let value: String
    let icon: String
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Image(systemName: self.icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.muted.color)
            Text(self.value)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

private struct WorkoutPlanBlockSection: View {
    let template: FitnessWorkoutTemplate
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("What you will do")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
            VStack(spacing: self.theme.spacing.sm) {
                ForEach(Array(self.template.steps.enumerated()), id: \.offset) { index, step in
                    HStack(spacing: self.theme.spacing.sm) {
                        Text("\(index + 1)")
                            .font(.custom(self.theme.font.display, size: self.theme.text.body.size))
                            .fontWeight(.bold)
                            .foregroundStyle(self.theme.color.text.onDark.color)
                            .frame(width: 32, height: 32)
                            .background(self.theme.color.primary.accent.color)
                            .clipShape(Circle())
                        Text(step)
                            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                            .fontWeight(.semibold)
                            .foregroundStyle(self.theme.color.text.primary.color)
                        Spacer()
                    }
                    .padding(self.theme.spacing.sm)
                    .background(self.theme.color.bg.surface.color)
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                }
            }
        }
    }
}

private struct WorkoutDetailInfoSection: View {
    let template: FitnessWorkoutTemplate

    var body: some View {
        VStack(alignment: .leading) {
            DashboardSection(
                title: "Target muscles",
                items: self.template.targetMuscles.map {
                    PhaseRowItem(title: $0, detail: "Primary or supporting focus", icon: "scope")
                }
            )
            DashboardSection(
                title: "Modifications",
                items: self.template.modifications.map {
                    PhaseRowItem(
                        title: $0,
                        detail: "Use if the session needs to flex",
                        icon: "arrow.triangle.2.circlepath"
                    )
                }
            )
            FuelWellMetricExplainerCard(
                eyebrow: "Why this fits",
                title: self.template.goal,
                detail: "The workout changes dinner guidance, calorie room, and recovery cost.",
                points: [
                    .init(
                        id: "burn",
                        title: "\(self.template.calories) active calories",
                        detail: "Estimate can be edited after logging.",
                        systemImage: "flame.fill",
                        tone: .nutrition
                    ),
                    .init(
                        id: "recovery",
                        title: "\(self.template.sorenessCost) soreness cost",
                        detail: "Helps Coach avoid stacking hard sessions.",
                        systemImage: "heart.text.square",
                        tone: .activity
                    )
                ]
            )
        }
    }
}

private struct WorkoutRelatedSection: View {
    let template: FitnessWorkoutTemplate
    let onLog: (FitnessWorkoutTemplate) -> Void
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Nearby workouts")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)

            HStack(spacing: self.theme.spacing.sm) {
                NavigationLink {
                    WorkoutTemplateDetailView(template: self.template.previousTemplate, onLog: self.onLog)
                } label: {
                    RelatedWorkoutButton(title: "Previous", template: self.template.previousTemplate)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    WorkoutTemplateDetailView(template: self.template.nextTemplate, onLog: self.onLog)
                } label: {
                    RelatedWorkoutButton(title: "Next", template: self.template.nextTemplate)
                }
                .buttonStyle(.plain)
            }

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.template.relatedTemplates) { related in
                    NavigationLink {
                        WorkoutTemplateDetailView(template: related, onLog: self.onLog)
                    } label: {
                        WorkoutTemplateRow(template: related)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct RelatedWorkoutButton: View {
    let title: String
    let template: FitnessWorkoutTemplate
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.title.uppercased())
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.muted.color)
            Text(self.template.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            Text("\(self.template.durationMinutes) min · \(self.template.intensity)")
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.sm)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

import SwiftUI

/// Second-generation gallery for components added in the UI polish pass.
///
/// Deliberately separate from `ComponentGallery`: the existing snapshot
/// baselines render that view and cannot be re-recorded from a Linux agent
/// session. Once baselines for this view are recorded on a Mac, it can be
/// folded into the snapshot suite (see ios/ui-loop-evidence/REPORT.md).
public struct ComponentGalleryV2: View {
    @Environment(\.theme) private var theme

    public init() {}

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.xl) {
                self.section(title: "Score chip") {
                    VStack(spacing: self.theme.spacing.sm) {
                        FuelWellScoreChip(value: 86, trend: .improving, trendDetail: "stronger sleep this week")
                        FuelWellScoreChip(value: 71, trend: .declining, trendDetail: "sleep variance this week")
                    }
                }

                self.section(title: "Stacked bars") {
                    FuelWellStackedBarChart(
                        title: "Calories by macro",
                        days: [
                            .init(label: "Mon", protein: 620, carbs: 810, fat: 460),
                            .init(label: "Tue", protein: 700, carbs: 760, fat: 420),
                            .init(label: "Wed", protein: 540, carbs: 900, fat: 510),
                            .init(label: "Thu", protein: 660, carbs: 700, fat: 380),
                            .init(label: "Fri", protein: 710, carbs: 820, fat: 440),
                            .init(label: "Sat", protein: 480, carbs: 1_010, fat: 560),
                            .init(label: "Sun", protein: 640, carbs: 750, fat: 400)
                        ]
                    )
                }

                self.section(title: "Sparkline") {
                    FuelWellSparkline(
                        values: [188.2, 187.6, 187.9, 187.1, 186.8, 186.9, 186.4],
                        label: "Weight trend",
                        summary: "Trending down 1.8 pounds over the last 7 entries."
                    )
                    .frame(height: 56)
                    .fuelWellCard()
                }

                self.section(title: "Chips") {
                    FuelWellChipRow(
                        chips: [
                            .init(label: "High protein", isSelected: true),
                            .init(label: "Low carb"),
                            .init(label: "Low fat"),
                            .init(label: "Vegan")
                        ]
                    )
                }

                self.section(title: "Sheet grabber") {
                    FuelWellSheetGrabber()
                        .fuelWellCard(padding: self.theme.spacing.sm)
                }

                self.section(title: "Action launcher") {
                    FuelWellActionLauncherGrid(
                        title: "Add context",
                        detail: "A compact launcher for photos, files, menus, workouts, and coach prompts.",
                        items: [
                            .init(
                                id: "food-photo",
                                title: "Food photo",
                                detail: "Estimate a plate",
                                systemImage: "camera.fill",
                                tone: .nutrition
                            ),
                            .init(
                                id: "menu",
                                title: "Menu",
                                detail: "Choose a meal",
                                systemImage: "menucard.fill",
                                tone: .nutrition
                            ),
                            .init(
                                id: "workout",
                                title: "Workout",
                                detail: "Explain activity",
                                systemImage: "figure.run",
                                tone: .activity
                            ),
                            .init(
                                id: "file",
                                title: "File",
                                detail: "Summarize context",
                                systemImage: "doc.fill",
                                tone: .insight
                            )
                        ],
                        onSelect: { _ in }
                    )
                }

                self.section(title: "Metric cards") {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: self.theme.spacing.sm) {
                        FuelWellMetricGoalCard(
                            title: "Calories",
                            value: "850",
                            unit: "kcal",
                            detail: "1,400 kcal left of 2,250",
                            progress: 0.38,
                            systemImage: "flame.fill",
                            tone: .nutrition
                        )
                        FuelWellMetricGoalCard(
                            title: "Training",
                            value: "84",
                            unit: "min",
                            detail: "6 min left of 90",
                            progress: 0.93,
                            systemImage: "timer",
                            tone: .activity
                        )
                    }
                }

                self.section(title: "Ring + explainer") {
                    FuelWellScoreRingCard(
                        title: "Today's plate",
                        value: "1400",
                        subtitle: "850 / 2250 kcal logged",
                        detail: "You have room to make a clean next choice.",
                        systemImage: "fork.knife.circle.fill",
                        progress: 0.38,
                        tone: .nutrition
                    )

                    FuelWellMetricExplainerCard(
                        eyebrow: "How it works",
                        title: "What counted today",
                        detail: "Use this shape for Bevel-style explainability without crowding the dashboard.",
                        points: [
                            .init(
                                id: "logged",
                                title: "Logged signals first",
                                detail: "User-entered meals and activities stay primary.",
                                systemImage: "checkmark.circle.fill"
                            ),
                            .init(
                                id: "estimated",
                                title: "Estimates are labeled",
                                detail: "AI and wearable context should explain confidence.",
                                systemImage: "sparkles",
                                tone: .caution
                            )
                        ]
                    )
                }
            }
            .padding(self.theme.spacing.md)
            .padding(.bottom, self.theme.spacing.fourXL)
        }
        .background(self.theme.color.bg.base.color)
        .accessibilityIdentifier("design-system.component-gallery-v2")
    }

    private func section(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text(title)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)
            content()
        }
        .accessibilityElement(children: .contain)
    }
}

#Preview("Component Gallery V2") {
    ComponentGalleryV2()
}

#Preview("V2 Accessibility Worst Case") {
    ComponentGalleryV2()
        .environment(\.dynamicTypeSize, .accessibility5)
}

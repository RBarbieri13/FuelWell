import ComposableArchitecture
import Core
import DesignSystem
import NutritionDomain
import SwiftUI

public struct DailyLogView: View {
    @Bindable public var store: StoreOf<DailyLogFeature>
    @Environment(\.theme) private var theme

    public init(store: StoreOf<DailyLogFeature>) {
        self.store = store
    }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                NutritionHeroCard(snapshot: self.store.macroSnapshot) {
                    self.store.send(.addMealTapped)
                }

                MacroProgressGrid(snapshot: self.store.macroSnapshot)

                NutritionDestinationGrid { destination in
                    self.store.send(.destinationTapped(destination))
                }

                if let destination = self.store.selectedDestination {
                    if destination == .restaurantGuidance {
                        RestaurantGuidanceView(
                            plan: self.store.restaurantGuidance,
                            onLogMeal: {
                                self.store.send(.restaurantGuidanceLogMealTapped)
                            },
                            onDismiss: {
                                self.store.send(.destinationDismissed)
                            }
                        )
                    } else if destination == .mealHistory {
                        MealHistoryView(
                            entries: self.store.recentEntries,
                            onRepeat: { entry in
                                self.store.send(.mealHistoryRepeatTapped(entry))
                            },
                            onDismiss: {
                                self.store.send(.destinationDismissed)
                            }
                        )
                    } else if destination == .recipeBrowser {
                        RecipeBrowserView(
                            plan: self.store.recipeBrowserPlan,
                            onChoose: { recipe in
                                self.store.send(.recipeBrowserRecipeTapped(recipe))
                            },
                            onDismiss: {
                                self.store.send(.destinationDismissed)
                            }
                        )
                    } else if destination == .groceryList {
                        GroceryListView(
                            plan: self.store.groceryListPlan,
                            onLogMeal: {
                                self.store.send(.groceryListLogMealTapped)
                            },
                            onDismiss: {
                                self.store.send(.destinationDismissed)
                            }
                        )
                    } else {
                        DestinationShellCard(destination: destination) {
                            self.store.send(.destinationDismissed)
                        }
                    }
                }

                if self.store.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, minHeight: 120)
                } else if self.store.entries.isEmpty {
                    EmptyMealLogView()
                } else {
                    Text("Today")
                        .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.primary.color)

                    ForEach(self.store.entries) { entry in
                        MealEntryRow(entry: entry) {
                            self.store.send(.deleteSwiped(id: entry.id))
                        }
                    }
                }

                if !self.store.recentEntries.isEmpty {
                    RecentMealsPreview(entries: self.store.recentEntries) {
                        self.store.send(.destinationTapped(.mealHistory))
                    }
                }
            }
            .padding(self.theme.spacing.md)
        }
        .background(self.theme.color.bg.base.color)
        .navigationTitle("Meals & Nutrition")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Add meal", systemImage: "plus") {
                    self.store.send(.addMealTapped)
                }
                .labelStyle(.iconOnly)
                .fontWeight(.semibold)
                .tint(self.theme.color.primary.accent.color)
            }
        }
        .sheet(
            isPresented: Binding(
                get: { self.store.isAddMealPresented },
                set: { isPresented in
                    if !isPresented {
                        self.store.send(.addMealDismissed)
                    }
                }
            )
        ) {
            AddMealSheet(store: self.store)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
        .onAppear {
            self.store.send(.onAppear)
        }
    }
}

private struct NutritionHeroCard: View {
    let snapshot: MacroDaySnapshot
    let onAddMeal: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
                Text(self.snapshot.verdict.headline)
                    .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.snapshot.verdict.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Button(action: self.onAddMeal) {
                Label("Log Meal", systemImage: "camera.fill")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(self.theme.color.primary.accent.color)
            .controlSize(.large)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct MacroProgressGrid: View {
    let snapshot: MacroDaySnapshot

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Today's plate")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: self.theme.spacing.sm) {
                MacroProgressTile(
                    title: "Calories",
                    consumed: self.snapshot.intake.calories,
                    target: self.snapshot.target.calories,
                    unit: "",
                    color: self.theme.color.macro.calories.color
                )
                MacroProgressTile(
                    title: "Protein",
                    consumed: self.snapshot.intake.macros.protein,
                    target: self.snapshot.target.macros.protein,
                    unit: "g",
                    color: self.theme.color.macro.protein.color
                )
                MacroProgressTile(
                    title: "Carbs",
                    consumed: self.snapshot.intake.macros.carbs,
                    target: self.snapshot.target.macros.carbs,
                    unit: "g",
                    color: self.theme.color.macro.carbs.color
                )
                MacroProgressTile(
                    title: "Fat",
                    consumed: self.snapshot.intake.macros.fat,
                    target: self.snapshot.target.macros.fat,
                    unit: "g",
                    color: self.theme.color.macro.fat.color
                )
            }
        }
    }
}

private struct MacroProgressTile: View {
    let title: String
    let consumed: Int
    let target: Int
    let unit: String
    let color: Color

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.body.color)

            Text("\(self.consumed)\(self.unit)")
                .font(.custom(self.theme.font.numeric, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            ProgressView(value: self.progress)
                .tint(self.color)

            Text("\(self.remaining)\(self.unit) left")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                .fontWeight(.medium)
                .foregroundStyle(self.theme.color.text.secondary.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }

    private var progress: Double {
        guard self.target > 0 else { return 0 }
        return min(Double(self.consumed) / Double(self.target), 1)
    }

    private var remaining: Int {
        max(0, self.target - self.consumed)
    }
}

private struct NutritionDestinationGrid: View {
    let onTap: (NutritionDestination) -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            Text("Next actions")
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(NutritionDestination.allCases.filter { $0 != .mealHistory }) { destination in
                    Button {
                        self.onTap(destination)
                    } label: {
                        DestinationRow(destination: destination)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct DestinationRow: View {
    let destination: NutritionDestination

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Image(systemName: self.destination.systemImage)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 42, height: 42)
                .background(self.theme.color.primary.accent.color.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.destination.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.destination.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(self.theme.color.text.muted.color)
                .accessibilityHidden(true)
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
        .overlay(
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(self.theme.color.bg.borderSoft.color, lineWidth: 1)
        )
    }
}

private struct DestinationShellCard: View {
    let destination: NutritionDestination
    let onDismiss: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            HStack {
                Label(self.destination.title, systemImage: self.destination.systemImage)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.onDark.color)

                Spacer()

                Button("Close", systemImage: "xmark", action: self.onDismiss)
                    .labelStyle(.iconOnly)
                    .tint(self.theme.color.text.onDark.color)
            }

            Text(self.destination.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.onDarkMuted.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.elevated.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct EmptyMealLogView: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text("No meals logged yet.")
                .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.primary.color)

            Text("The fastest way is a photo. Tap + to log one now.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.medium)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct RecentMealsPreview: View {
    let entries: [MealEntry]
    let onHistoryTapped: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            HStack {
                Text("Recent meals")
                    .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Spacer()

                Button("History", systemImage: "clock.arrow.circlepath", action: self.onHistoryTapped)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .tint(self.theme.color.primary.accent.color)
            }

            VStack(spacing: self.theme.spacing.sm) {
                ForEach(self.entries.prefix(3)) { entry in
                    RecentMealRow(entry: entry)
                }
            }
        }
    }
}

private struct RecentMealRow: View {
    let entry: MealEntry

    @Environment(\.theme) private var theme

    var body: some View {
        HStack(spacing: self.theme.spacing.md) {
            Image(systemName: self.entry.photoAttachmentID == nil ? "fork.knife" : "camera.fill")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 36, height: 36)
                .background(self.theme.color.primary.accent.color.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.entry.name)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text("\(self.entry.calories) calories - \(self.entry.protein)g protein")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Spacer()
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct MealEntryRow: View {
    let entry: MealEntry
    let onDelete: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack {
            if self.entry.photoAttachmentID != nil {
                Image(systemName: "camera.fill")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(self.theme.color.primary.accent.color)
                    .frame(width: 36, height: 36)
                    .background(self.theme.color.primary.accent.color.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
            }

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.entry.name)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.semibold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text("\(self.entry.protein)g protein - \(self.entry.calories) calories")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.body.color)
            }

            Spacer()

            Button("Delete", systemImage: "trash", action: self.onDelete)
                .labelStyle(.iconOnly)
                .tint(self.theme.color.semantic.error.color)
        }
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

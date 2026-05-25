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
            VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                MacroSummaryCard(snapshot: self.store.macroSnapshot)

                if self.store.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, minHeight: 120)
                } else if self.store.entries.isEmpty {
                    EmptyMealLogView()
                } else {
                    ForEach(self.store.entries) { entry in
                        MealEntryRow(entry: entry) {
                            self.store.send(.deleteSwiped(id: entry.id))
                        }
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

private struct MacroSummaryCard: View {
    let snapshot: MacroDaySnapshot

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
            Text(self.snapshot.verdict.headline)
                .font(.custom(self.theme.font.display, size: self.theme.text.title.size))
                .foregroundStyle(self.theme.color.text.primary.color)

            Text(self.snapshot.verdict.detail)
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.medium)
                .foregroundStyle(self.theme.color.text.body.color)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.lg)
        .background(self.theme.color.bg.surface.color)
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

private struct MealEntryRow: View {
    let entry: MealEntry
    let onDelete: () -> Void

    @Environment(\.theme) private var theme

    var body: some View {
        HStack {
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

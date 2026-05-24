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

private struct AddMealSheet: View {
    @Bindable var store: StoreOf<DailyLogFeature>
    @Environment(\.theme) private var theme

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                    VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                        Text("Add Meal")
                            .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                            .fontWeight(.bold)
                            .foregroundStyle(self.theme.color.text.primary.color)

                        Text(
                            "Photo is the default. Quick macro entry keeps today moving " +
                                "while camera recognition comes online."
                        )
                            .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                            .fontWeight(.medium)
                            .foregroundStyle(self.theme.color.text.body.color)
                    }

                    Picker(
                        "Logging mode",
                        selection: Binding(
                            get: { self.store.addMealDraft.mode },
                            set: { self.store.send(.addMealModeSelected($0)) }
                        )
                    ) {
                        ForEach(AddMealMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    ModeCard(mode: self.store.addMealDraft.mode)

                    VStack(alignment: .leading, spacing: self.theme.spacing.md) {
                        MealTextField(
                            title: "Meal name",
                            text: Binding(
                                get: { self.store.addMealDraft.name },
                                set: { self.store.send(.addMealNameChanged($0)) }
                            )
                        )

                        HStack(spacing: self.theme.spacing.sm) {
                            MealTextField(
                                title: "Calories",
                                text: Binding(
                                    get: { self.store.addMealDraft.calories },
                                    set: { self.store.send(.addMealCaloriesChanged($0)) }
                                ),
                                keyboardType: .numberPad
                            )

                            MealTextField(
                                title: "Protein",
                                text: Binding(
                                    get: { self.store.addMealDraft.protein },
                                    set: { self.store.send(.addMealProteinChanged($0)) }
                                ),
                                suffix: "g",
                                keyboardType: .numberPad
                            )
                        }

                        HStack(spacing: self.theme.spacing.sm) {
                            MealTextField(
                                title: "Carbs",
                                text: Binding(
                                    get: { self.store.addMealDraft.carbs },
                                    set: { self.store.send(.addMealCarbsChanged($0)) }
                                ),
                                suffix: "g",
                                keyboardType: .numberPad
                            )

                            MealTextField(
                                title: "Fat",
                                text: Binding(
                                    get: { self.store.addMealDraft.fat },
                                    set: { self.store.send(.addMealFatChanged($0)) }
                                ),
                                suffix: "g",
                                keyboardType: .numberPad
                            )
                        }
                    }

                    Button {
                        self.store.send(.saveAddMealTapped)
                    } label: {
                        Text("Save meal")
                            .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, self.theme.spacing.md)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(self.theme.color.primary.accent.color)
                    .disabled(!self.store.addMealDraft.canSave)
                }
                .padding(self.theme.spacing.md)
            }
            .background(self.theme.color.bg.base.color)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        self.store.send(.addMealDismissed)
                    }
                    .tint(self.theme.color.text.body.color)
                }
            }
        }
    }
}

private struct ModeCard: View {
    let mode: AddMealMode
    @Environment(\.theme) private var theme

    var body: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            Image(systemName: self.iconName)
                .font(.title2.weight(.semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text(self.title)
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text(self.detail)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }

    private var iconName: String {
        switch self.mode {
        case .photo:
            "camera.fill"
        case .search:
            "magnifyingglass"
        case .scan:
            "barcode.viewfinder"
        }
    }

    private var title: String {
        switch self.mode {
        case .photo:
            "Photo-first logging"
        case .search:
            "Search backup"
        case .scan:
            "Barcode backup"
        }
    }

    private var detail: String {
        switch self.mode {
        case .photo:
            "Snap the meal first. For now, enter the quick macro estimate below."
        case .search:
            "Search will connect to foods and recent meals. Quick entry keeps the flow usable today."
        case .scan:
            "Barcode scanning is staged here, with manual macros as the reliable fallback."
        }
    }
}

private struct MealTextField: View {
    let title: String
    @Binding var text: String
    var suffix: String?
    var keyboardType: UIKeyboardType = .default

    @Environment(\.theme) private var theme

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text(self.title)
                .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.secondary.color)

            HStack {
                TextField(self.title, text: self.$text)
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.semibold)
                    .keyboardType(self.keyboardType)

                if let suffix {
                    Text(suffix)
                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                        .fontWeight(.bold)
                        .foregroundStyle(self.theme.color.text.secondary.color)
                }
            }
            .padding(.horizontal, self.theme.spacing.md)
            .padding(.vertical, self.theme.spacing.sm)
            .background(self.theme.color.bg.surface.color)
            .overlay {
                RoundedRectangle(cornerRadius: self.theme.radius.sm)
                    .stroke(self.theme.color.bg.border.color)
            }
            .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
        }
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

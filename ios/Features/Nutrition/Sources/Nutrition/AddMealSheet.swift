import ComposableArchitecture
import DesignSystem
import PhotosUI
import SwiftUI
import UIKit

struct AddMealSheet: View {
    @Bindable var store: StoreOf<DailyLogFeature>
    @Environment(\.theme) private var theme
    @State private var selectedPhotoItem: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: self.theme.spacing.lg) {
                    self.header
                    self.modePicker
                    RecentMealsStrip(store: self.store)
                    if self.store.addMealDraft.mode == .photo {
                        PhotoLoggingCard(
                            photoData: self.store.addMealDraft.photoData,
                            takePhoto: { self.store.send(.addMealPhotoButtonTapped) },
                            clearPhoto: { self.store.send(.addMealPhotoCleared) },
                            selectedPhotoItem: self.$selectedPhotoItem
                        )
                    } else {
                        BackupLoggingCard(
                            mode: self.store.addMealDraft.mode,
                            suggestions: self.store.foodSearchSuggestions,
                            onChoose: { self.store.send(.foodSearchSuggestionTapped($0)) }
                        )
                    }
                    MacroEntryFields(store: self.store)
                    self.saveButton
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
            .fullScreenCover(
                isPresented: Binding(
                    get: { self.store.addMealDraft.isCameraPresented },
                    set: { isPresented in
                        if !isPresented {
                            self.store.send(.addMealCameraDismissed)
                        }
                    }
                )
            ) {
                CameraCaptureView(
                    onCapture: { data in
                        self.store.send(.addMealCameraCaptured(data))
                    },
                    onCancel: {
                        self.store.send(.addMealCameraDismissed)
                    }
                )
                .ignoresSafeArea()
            }
            .onChange(of: self.selectedPhotoItem) { _, item in
                guard let item else { return }
                Task {
                    let data = try? await item.loadTransferable(type: Data.self)
                    await MainActor.run {
                        self.store.send(.addMealPhotoLibraryLoaded(data))
                        self.selectedPhotoItem = nil
                    }
                }
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
            Text("Add Meal")
                .font(.custom(self.theme.font.display, size: self.theme.text.titleLG.size))
                .fontWeight(.bold)
                .foregroundStyle(self.theme.color.text.primary.color)

            Text("Photo is the default. Quick macro entry keeps today moving while camera recognition comes online.")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.medium)
                .foregroundStyle(self.theme.color.text.body.color)
        }
    }

    private var modePicker: some View {
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
    }

    private var saveButton: some View {
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
        .accessibilityIdentifier("nutrition.add-meal.save")
    }
}

private struct RecentMealsStrip: View {
    @Bindable var store: StoreOf<DailyLogFeature>
    @Environment(\.theme) private var theme

    var body: some View {
        if !self.store.recentEntries.isEmpty {
            VStack(alignment: .leading, spacing: self.theme.spacing.sm) {
                Text("Recent meals")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.secondary.color)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: self.theme.spacing.sm) {
                        ForEach(self.store.recentEntries) { entry in
                            Button {
                                self.store.send(.recentMealTapped(entry))
                            } label: {
                                VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                                    Text(entry.name)
                                        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
                                        .fontWeight(.bold)
                                        .foregroundStyle(self.theme.color.text.primary.color)
                                        .lineLimit(1)

                                    Text("\(entry.calories) cal · \(entry.protein)g protein")
                                        .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                                        .fontWeight(.medium)
                                        .foregroundStyle(self.theme.color.text.secondary.color)
                                }
                                .frame(width: 148, alignment: .leading)
                                .padding(self.theme.spacing.sm)
                                .background(self.theme.color.bg.surface.color)
                                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.sm))
                            }
                        }
                    }
                }
            }
        }
    }
}

private struct MacroEntryFields: View {
    @Bindable var store: StoreOf<DailyLogFeature>
    @Environment(\.theme) private var theme

    var body: some View {
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
    }
}

private struct PhotoLoggingCard: View {
    let photoData: Data?
    let takePhoto: () -> Void
    let clearPhoto: () -> Void
    @Binding var selectedPhotoItem: PhotosPickerItem?

    @Environment(\.theme) private var theme

    private var image: UIImage? {
        self.photoData.flatMap(UIImage.init(data:))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: self.theme.spacing.md) {
            self.titleRow
            self.photoPreview
            self.photoButtons

            if !UIImagePickerController.isSourceTypeAvailable(.camera) {
                Text("Camera capture is available on device. Use Choose photo in the simulator.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.caption.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.secondary.color)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(self.theme.spacing.md)
        .background(self.theme.color.bg.surface.color)
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }

    private var titleRow: some View {
        HStack(alignment: .top, spacing: self.theme.spacing.md) {
            Image(systemName: "camera.fill")
                .font(.title2.weight(.semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: self.theme.spacing.xs) {
                Text("Photo-first logging")
                    .font(.custom(self.theme.font.body, size: self.theme.text.bodyLG.size))
                    .fontWeight(.bold)
                    .foregroundStyle(self.theme.color.text.primary.color)

                Text("Take a meal photo or import one, then add the quick macro estimate below.")
                    .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                    .fontWeight(.medium)
                    .foregroundStyle(self.theme.color.text.body.color)
            }
        }
    }

    @ViewBuilder
    private var photoPreview: some View {
        if let image {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity)
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
                .overlay(alignment: .topTrailing) {
                    Button("Remove photo", systemImage: "xmark.circle.fill", action: self.clearPhoto)
                        .labelStyle(.iconOnly)
                        .font(.title2.weight(.semibold))
                        .symbolRenderingMode(.palette)
                        .foregroundStyle(.white, self.theme.color.text.primary.color.opacity(0.55))
                        .padding(self.theme.spacing.sm)
                }
                .accessibilityLabel("Selected meal photo")
        } else {
            EmptyPhotoPreview()
        }
    }

    private var photoButtons: some View {
        HStack(spacing: self.theme.spacing.sm) {
            Button("Take photo", systemImage: "camera", action: self.takePhoto)
                .buttonStyle(.borderedProminent)
                .tint(self.theme.color.primary.accent.color)
                .disabled(!UIImagePickerController.isSourceTypeAvailable(.camera))

            PhotosPicker(
                selection: self.$selectedPhotoItem,
                matching: .images,
                photoLibrary: .shared()
            ) {
                Label("Choose photo", systemImage: "photo.on.rectangle")
            }
            .buttonStyle(.bordered)
            .tint(self.theme.color.primary.accent.color)
        }
        .font(.custom(self.theme.font.body, size: self.theme.text.bodySM.size))
        .fontWeight(.bold)
    }
}

private struct EmptyPhotoPreview: View {
    @Environment(\.theme) private var theme

    var body: some View {
        VStack(spacing: self.theme.spacing.sm) {
            Image(systemName: "camera.viewfinder")
                .font(.largeTitle.weight(.semibold))
                .foregroundStyle(self.theme.color.primary.accent.color)

            Text("No meal photo yet")
                .font(.custom(self.theme.font.body, size: self.theme.text.body.size))
                .fontWeight(.semibold)
                .foregroundStyle(self.theme.color.text.primary.color)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 150)
        .background(self.theme.color.bg.base.color)
        .overlay {
            RoundedRectangle(cornerRadius: self.theme.radius.md)
                .stroke(
                    self.theme.color.bg.border.color,
                    style: StrokeStyle(lineWidth: 1, dash: [6, 6])
                )
        }
        .clipShape(RoundedRectangle(cornerRadius: self.theme.radius.md))
    }
}

private struct CameraCaptureView: UIViewControllerRepresentable {
    let onCapture: (Data) -> Void
    let onCancel: () -> Void

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let controller = UIImagePickerController()
        controller.sourceType = .camera
        controller.cameraCaptureMode = .photo
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onCapture: self.onCapture, onCancel: self.onCancel)
    }

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let onCapture: (Data) -> Void
        let onCancel: () -> Void

        init(onCapture: @escaping (Data) -> Void, onCancel: @escaping () -> Void) {
            self.onCapture = onCapture
            self.onCancel = onCancel
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            self.onCancel()
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            guard
                let image = info[.originalImage] as? UIImage,
                let data = image.jpegData(compressionQuality: 0.82)
            else {
                self.onCancel()
                return
            }

            self.onCapture(data)
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

import Dependencies
import Foundation
import Persistence

public protocol NutritionRepository: Sendable {
    func entries(for date: Date) async throws -> [MealEntry]
    func recentEntries(limit: Int) async throws -> [MealEntry]
    func save(_ entry: MealEntry, photoData: Data?) async throws
    func delete(id: MealEntry.ID) async throws
    func photoData(for entry: MealEntry) async throws -> Data?
}

public actor InMemoryNutritionRepository: NutritionRepository {
    private var storage: [MealEntry]
    private var photos: [UUID: Data]

    public init(seed: [MealEntry] = []) {
        self.storage = seed
        self.photos = [:]
    }

    public func entries(for date: Date) async throws -> [MealEntry] {
        let calendar = Calendar.current
        return self.storage
            .filter { calendar.isDate($0.loggedAt, inSameDayAs: date) }
            .sorted { $0.loggedAt < $1.loggedAt }
    }

    public func recentEntries(limit: Int) async throws -> [MealEntry] {
        Array(
            self.storage
                .sorted { $0.loggedAt > $1.loggedAt }
                .prefix(limit)
        )
    }

    public func save(_ entry: MealEntry, photoData: Data? = nil) async throws {
        if let index = self.storage.firstIndex(where: { $0.id == entry.id }) {
            self.storage[index] = entry
        } else {
            self.storage.append(entry)
        }

        if let photoData, let photoAttachmentID = entry.photoAttachmentID {
            self.photos[photoAttachmentID] = photoData
        }
    }

    public func delete(id: MealEntry.ID) async throws {
        if let entry = self.storage.first(where: { $0.id == id }),
           let photoAttachmentID = entry.photoAttachmentID {
            self.photos[photoAttachmentID] = nil
        }
        self.storage.removeAll { $0.id == id }
    }

    public func photoData(for entry: MealEntry) async throws -> Data? {
        guard let photoAttachmentID = entry.photoAttachmentID else { return nil }
        return self.photos[photoAttachmentID]
    }
}

public actor LocalNutritionRepository: NutritionRepository {
    private let entriesStore: JSONFileStore<[MealEntry]>
    private let attachmentsStore: FileAttachmentStore

    public init(rootDirectory: URL? = nil) {
        let rootDirectory = rootDirectory ?? LocalNutritionRepository.defaultRootDirectory()
        self.entriesStore = JSONFileStore(
            fileURL: rootDirectory
                .appendingPathComponent("nutrition", isDirectory: true)
                .appendingPathComponent("meal-entries.json")
        )
        self.attachmentsStore = FileAttachmentStore(
            directoryURL: rootDirectory
                .appendingPathComponent("nutrition", isDirectory: true)
                .appendingPathComponent("meal-photos", isDirectory: true)
        )
    }

    public func entries(for date: Date) async throws -> [MealEntry] {
        let calendar = Calendar.current
        return try self.loadEntries()
            .filter { calendar.isDate($0.loggedAt, inSameDayAs: date) }
            .sorted { $0.loggedAt < $1.loggedAt }
    }

    public func recentEntries(limit: Int) async throws -> [MealEntry] {
        Array(
            try self.loadEntries()
                .sorted { $0.loggedAt > $1.loggedAt }
                .prefix(limit)
        )
    }

    public func save(_ entry: MealEntry, photoData: Data? = nil) async throws {
        var entries = try self.loadEntries()
        if let index = entries.firstIndex(where: { $0.id == entry.id }) {
            entries[index] = entry
        } else {
            entries.append(entry)
        }

        if let photoData, let photoAttachmentID = entry.photoAttachmentID {
            _ = try self.attachmentsStore.save(
                photoData,
                named: Self.photoFilename(id: photoAttachmentID)
            )
        }

        try self.entriesStore.save(entries)
    }

    public func delete(id: MealEntry.ID) async throws {
        var entries = try self.loadEntries()
        let removed = entries.first { $0.id == id }
        entries.removeAll { $0.id == id }
        try self.entriesStore.save(entries)

        if let photoAttachmentID = removed?.photoAttachmentID {
            try self.attachmentsStore.delete(named: Self.photoFilename(id: photoAttachmentID))
        }
    }

    public func photoData(for entry: MealEntry) async throws -> Data? {
        guard let photoAttachmentID = entry.photoAttachmentID else { return nil }
        return try self.attachmentsStore.load(named: Self.photoFilename(id: photoAttachmentID))
    }

    private func loadEntries() throws -> [MealEntry] {
        try self.entriesStore.load(default: [])
    }

    private static func photoFilename(id: UUID) -> String {
        "\(id.uuidString.lowercased()).jpg"
    }

    private static func defaultRootDirectory() -> URL {
        let baseURL = FileManager.default.urls(
            for: .applicationSupportDirectory,
            in: .userDomainMask
        ).first ?? FileManager.default.temporaryDirectory

        return baseURL.appendingPathComponent("FuelWell", isDirectory: true)
    }
}

extension DependencyValues {
    public var nutritionRepository: any NutritionRepository {
        get { self[NutritionRepositoryKey.self] }
        set { self[NutritionRepositoryKey.self] = newValue }
    }
}

private enum NutritionRepositoryKey: DependencyKey {
    static var liveValue: any NutritionRepository {
        LocalNutritionRepository()
    }

    static var testValue: any NutritionRepository {
        InMemoryNutritionRepository()
    }

    static var previewValue: any NutritionRepository {
        InMemoryNutritionRepository(seed: MealEntry.previewEntries)
    }
}

extension MealEntry {
    public static let previewEntries: [MealEntry] = [
        MealEntry(name: "Oatmeal", calories: 310, protein: 10, carbs: 55, fat: 6),
        MealEntry(name: "Chicken bowl", calories: 520, protein: 42, carbs: 48, fat: 18)
    ]
}

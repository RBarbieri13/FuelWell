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
    private let databaseStore: SQLiteDataStore
    private let legacyEntriesStore: JSONFileStore<[MealEntry]>
    private let attachmentsStore: FileAttachmentStore
    private let pendingWriteQueue: PendingWriteQueue
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    private var didImportLegacyEntries: Bool

    public init(rootDirectory: URL? = nil) {
        let rootDirectory = rootDirectory ?? LocalNutritionRepository.defaultRootDirectory()
        let databaseURL = rootDirectory
            .appendingPathComponent("nutrition", isDirectory: true)
            .appendingPathComponent("fuelwell.sqlite")
        self.databaseStore = SQLiteDataStore(databaseURL: databaseURL)
        self.pendingWriteQueue = PendingWriteQueue(databaseURL: databaseURL)
        self.legacyEntriesStore = JSONFileStore(
            fileURL: rootDirectory
                .appendingPathComponent("nutrition", isDirectory: true)
                .appendingPathComponent("meal-entries.json")
        )
        self.attachmentsStore = FileAttachmentStore(
            directoryURL: rootDirectory
                .appendingPathComponent("nutrition", isDirectory: true)
                .appendingPathComponent("meal-photos", isDirectory: true)
        )
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
        self.encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        self.encoder.dateEncodingStrategy = .iso8601
        self.decoder.dateDecodingStrategy = .iso8601
        self.didImportLegacyEntries = false
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
        try self.prepareStore()

        if let photoData, let photoAttachmentID = entry.photoAttachmentID {
            _ = try self.attachmentsStore.save(
                photoData,
                named: Self.photoFilename(id: photoAttachmentID)
            )
        }

        try self.databaseStore.upsertMealEntry(
            id: entry.id.uuidString,
            payloadJSON: self.encode(entry),
            loggedAt: entry.loggedAt
        )
        _ = try self.pendingWriteQueue.enqueue(
            PendingWrite(
                route: "meals",
                operation: .mealLog,
                payload: self.encodePendingMeal(entry)
            )
        )
    }

    public func delete(id: MealEntry.ID) async throws {
        try self.prepareStore()
        let removed = try self.loadEntry(id: id)
        try self.databaseStore.markMealEntryDeleted(id: id.uuidString)

        if let photoAttachmentID = removed?.photoAttachmentID {
            try self.attachmentsStore.delete(named: Self.photoFilename(id: photoAttachmentID))
        }

        if let removed {
            _ = try self.pendingWriteQueue.enqueue(
                PendingWrite(
                    route: "meals",
                    operation: .mealLogDelete,
                    payload: self.encodePendingMeal(removed)
                )
            )
        }
    }

    public func photoData(for entry: MealEntry) async throws -> Data? {
        guard let photoAttachmentID = entry.photoAttachmentID else { return nil }
        return try self.attachmentsStore.load(named: Self.photoFilename(id: photoAttachmentID))
    }

    private func loadEntries() throws -> [MealEntry] {
        try self.prepareStore()
        return try self.databaseStore.activeMealEntryPayloads()
            .map(self.decode)
    }

    private func loadEntry(id: MealEntry.ID) throws -> MealEntry? {
        guard let payload = try self.databaseStore.activeMealEntryPayload(id: id.uuidString) else {
            return nil
        }
        return try self.decode(payload)
    }

    private func prepareStore() throws {
        try self.databaseStore.migrate()
        guard !self.didImportLegacyEntries else { return }

        if try self.databaseStore.activeMealEntryCount() == 0 {
            let legacyEntries = try self.legacyEntriesStore.load(default: [])
            for entry in legacyEntries {
                try self.databaseStore.upsertMealEntry(
                    id: entry.id.uuidString,
                    payloadJSON: self.encode(entry),
                    loggedAt: entry.loggedAt
                )
            }
        }

        self.didImportLegacyEntries = true
    }

    private func encode(_ entry: MealEntry) throws -> String {
        let data = try self.encoder.encode(entry)
        guard let json = String(data: data, encoding: .utf8) else {
            throw NutritionRepositoryError.invalidStoredMealEntry
        }
        return json
    }

    private func encodePendingMeal(_ entry: MealEntry) throws -> String {
        let payload = MealLogPendingWritePayload(
            id: entry.id,
            name: entry.name,
            loggedAt: entry.loggedAt
        )
        let data = try self.encoder.encode(payload)
        guard let json = String(data: data, encoding: .utf8) else {
            throw NutritionRepositoryError.invalidStoredMealEntry
        }
        return json
    }

    private func decode(_ payload: String) throws -> MealEntry {
        guard let data = payload.data(using: .utf8) else {
            throw NutritionRepositoryError.invalidStoredMealEntry
        }
        return try self.decoder.decode(MealEntry.self, from: data)
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

public enum NutritionRepositoryError: Error, Equatable, Sendable {
    case invalidStoredMealEntry
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

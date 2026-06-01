import Foundation

public struct JSONFileStore<Model: Codable & Sendable>: Sendable {
    public let fileURL: URL
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    public init(fileURL: URL) {
        self.fileURL = fileURL
        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
        self.encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        self.encoder.dateEncodingStrategy = .iso8601
        self.decoder.dateDecodingStrategy = .iso8601
    }

    public func load(default defaultValue: Model) throws -> Model {
        guard FileManager.default.fileExists(atPath: self.fileURL.path) else {
            return defaultValue
        }

        let data = try Data(contentsOf: self.fileURL)
        return try self.decoder.decode(Model.self, from: data)
    }

    public func save(_ model: Model) throws {
        let directory = self.fileURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(
            at: directory,
            withIntermediateDirectories: true
        )

        let data = try self.encoder.encode(model)
        try data.write(to: self.fileURL, options: [.atomic])
    }
}

public struct FileAttachmentStore: Sendable {
    public let directoryURL: URL

    public init(directoryURL: URL) {
        self.directoryURL = directoryURL
    }

    public func save(_ data: Data, named filename: String) throws -> URL {
        try FileManager.default.createDirectory(
            at: self.directoryURL,
            withIntermediateDirectories: true
        )

        let fileURL = self.directoryURL.appendingPathComponent(filename)
        try data.write(to: fileURL, options: [.atomic])
        return fileURL
    }

    public func load(named filename: String) throws -> Data? {
        let fileURL = self.directoryURL.appendingPathComponent(filename)
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return nil }
        return try Data(contentsOf: fileURL)
    }

    public func delete(named filename: String) throws {
        let fileURL = self.directoryURL.appendingPathComponent(filename)
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return }
        try FileManager.default.removeItem(at: fileURL)
    }
}

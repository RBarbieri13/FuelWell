import Foundation

public struct FuelWellID: Hashable, Sendable, RawRepresentable {
    public let rawValue: UUID

    public init(rawValue: UUID) {
        self.rawValue = rawValue
    }

    public init() {
        self.rawValue = UUID()
    }
}

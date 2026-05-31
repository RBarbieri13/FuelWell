import Dependencies
import Foundation
#if canImport(UserNotifications)
@preconcurrency import UserNotifications
#endif

public struct ProactiveCoachingClient: Sendable {
    public var requestAuthorization: @Sendable () async throws -> Bool
    public var scheduleMacroGapNudge: @Sendable (_ body: String) async throws -> Void

    public init(
        requestAuthorization: @escaping @Sendable () async throws -> Bool,
        scheduleMacroGapNudge: @escaping @Sendable (_ body: String) async throws -> Void
    ) {
        self.requestAuthorization = requestAuthorization
        self.scheduleMacroGapNudge = scheduleMacroGapNudge
    }
}

extension ProactiveCoachingClient: DependencyKey {
    public static let liveValue = ProactiveCoachingClient.live()

    public static let testValue = ProactiveCoachingClient(
        requestAuthorization: { throw ProactiveCoachingError.unimplemented },
        scheduleMacroGapNudge: { _ in throw ProactiveCoachingError.unimplemented }
    )

    public static let previewValue = ProactiveCoachingClient(
        requestAuthorization: { true },
        scheduleMacroGapNudge: { _ in }
    )

    public static func live() -> ProactiveCoachingClient {
        #if canImport(UserNotifications)
        let center = UNUserNotificationCenter.current()
        return ProactiveCoachingClient(
            requestAuthorization: {
                try await center.requestAuthorization(options: [.alert, .sound, .badge])
            },
            scheduleMacroGapNudge: { body in
                let content = UNMutableNotificationContent()
                content.title = "FuelWell"
                content.body = body
                content.sound = .default

                let request = UNNotificationRequest(
                    identifier: "fuelwell.macro-gap.\(UUID().uuidString)",
                    content: content,
                    trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
                )
                try await center.add(request)
            }
        )
        #else
        return ProactiveCoachingClient(
            requestAuthorization: { false },
            scheduleMacroGapNudge: { _ in }
        )
        #endif
    }
}

extension DependencyValues {
    public var proactiveCoaching: ProactiveCoachingClient {
        get { self[ProactiveCoachingClient.self] }
        set { self[ProactiveCoachingClient.self] = newValue }
    }
}

public enum ProactiveCoachingError: Error, Equatable, Sendable {
    case unimplemented
}

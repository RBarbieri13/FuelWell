import Dependencies
import Foundation
#if canImport(UserNotifications)
@preconcurrency import UserNotifications
#endif

public struct ProactiveCoachingClient: Sendable {
    public var requestAuthorization: @Sendable () async throws -> Bool
    public var schedule: @Sendable (_ nudge: ProactiveNudge) async throws -> Void

    public init(
        requestAuthorization: @escaping @Sendable () async throws -> Bool,
        schedule: @escaping @Sendable (_ nudge: ProactiveNudge) async throws -> Void
    ) {
        self.requestAuthorization = requestAuthorization
        self.schedule = schedule
    }
}

public struct ProactiveNudge: Equatable, Identifiable, Sendable {
    public var id: String
    public var category: String
    public var trigger: String
    public var title: String
    public var body: String
    public var delaySeconds: TimeInterval

    public init(
        id: String,
        category: String,
        trigger: String,
        title: String,
        body: String,
        delaySeconds: TimeInterval
    ) {
        self.id = id
        self.category = category
        self.trigger = trigger
        self.title = title
        self.body = body
        self.delaySeconds = delaySeconds
    }
}

extension ProactiveCoachingClient: DependencyKey {
    public static let liveValue = ProactiveCoachingClient.live()

    public static let testValue = ProactiveCoachingClient(
        requestAuthorization: { throw ProactiveCoachingError.unimplemented },
        schedule: { _ in throw ProactiveCoachingError.unimplemented }
    )

    public static let previewValue = ProactiveCoachingClient(
        requestAuthorization: { true },
        schedule: { _ in }
    )

    public static func live() -> ProactiveCoachingClient {
        #if canImport(UserNotifications)
        let center = UNUserNotificationCenter.current()
        return ProactiveCoachingClient(
            requestAuthorization: {
                try await center.requestAuthorization(options: [.alert, .sound, .badge])
            },
            schedule: { nudge in
                let content = UNMutableNotificationContent()
                content.title = nudge.title
                content.body = nudge.body
                content.sound = .default
                content.userInfo = [
                    "nudge_id": nudge.id,
                    "category": nudge.category,
                    "trigger": nudge.trigger
                ]

                let request = UNNotificationRequest(
                    identifier: "fuelwell.\(nudge.id)",
                    content: content,
                    trigger: UNTimeIntervalNotificationTrigger(timeInterval: nudge.delaySeconds, repeats: false)
                )
                try await center.add(request)
            }
        )
        #else
        return ProactiveCoachingClient(
            requestAuthorization: { false },
            schedule: { _ in }
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
    case authorizationDenied
    case featureDisabled
    case unsafeLanguage
    case unimplemented
}

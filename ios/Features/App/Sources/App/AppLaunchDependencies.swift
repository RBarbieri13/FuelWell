import Analytics
import AnthropicClient
import CrashReporting
import Dependencies
import Foundation
import HealthKitClient
import SubscriptionClient
import SupabaseClient

public enum FuelWellBackendMode: Equatable, Sendable {
    case preview
    case live
}

public enum FuelWellHealthKitMode: Equatable, Sendable {
    case preview
    case live
}

public struct FuelWellLaunchDependencyPlan: Equatable, Sendable {
    public var backend: FuelWellBackendMode
    public var healthKit: FuelWellHealthKitMode

    public init(backend: FuelWellBackendMode, healthKit: FuelWellHealthKitMode) {
        self.backend = backend
        self.healthKit = healthKit
    }

    public static func resolve(
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) -> FuelWellLaunchDependencyPlan {
        let backend: FuelWellBackendMode = Self.usesLiveBackend(environment: environment) ? .live : .preview

        return FuelWellLaunchDependencyPlan(
            backend: backend,
            healthKit: backend == .live ? Self.liveHealthKitMode : .preview
        )
    }

    private static func usesLiveBackend(environment: [String: String]) -> Bool {
        guard let rawValue = environment["FUELWELL_USE_LIVE_BACKEND"] else {
            return false
        }

        let value = rawValue.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return ["1", "true", "yes", "live", "enabled"].contains(value)
    }

    private static var liveHealthKitMode: FuelWellHealthKitMode {
        #if targetEnvironment(simulator)
        .preview
        #else
        .live
        #endif
    }
}

public func prepareFuelWellDependencies(
    environment: [String: String] = ProcessInfo.processInfo.environment
) {
    prepareFuelWellDependencies(plan: .resolve(environment: environment))
}

public func prepareFuelWellDependencies(plan: FuelWellLaunchDependencyPlan) {
    prepareDependencies {
        $0.analytics = .noop
        $0.crashReporter = .noop

        switch plan.backend {
        case .preview:
            $0.anthropicClient = .previewValue
            $0.featureFlags = .previewValue
            $0.supabaseAuth = .previewValue
            $0.subscriptionClient = .previewValue
            $0.supabaseDatabase = .previewValue
        case .live:
            $0.anthropicClient = .liveValue
            $0.featureFlags = .liveValue
            $0.supabaseAuth = .liveValue
            $0.subscriptionClient = .liveValue
            $0.supabaseDatabase = .liveValue
        }

        switch plan.healthKit {
        case .preview:
            $0.healthKit = .previewValue
        case .live:
            $0.healthKit = .liveValue
        }
    }
}

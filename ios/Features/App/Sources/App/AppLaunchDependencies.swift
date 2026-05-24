import Analytics
import AnthropicClient
import CrashReporting
import Dependencies
import HealthKitClient
import SupabaseClient

public func prepareFuelWellDependencies() {
    prepareDependencies {
        $0.analytics = .noop
        $0.anthropicClient = .previewValue
        $0.crashReporter = .noop
        $0.featureFlags = .previewValue
        $0.healthKit = .previewValue
        $0.supabaseDatabase = .previewValue
    }
}

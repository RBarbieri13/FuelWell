import Foundation
import Testing

@Test
func privacyManifestMatchesCurrentReleaseSurface() throws {
    let manifest = try privacyManifest()

    let collectedTypes = try privacyDataTypes(in: manifest)
    #expect(collectedTypes == [
        "NSPrivacyCollectedDataTypeCrashData",
        "NSPrivacyCollectedDataTypeFitness",
        "NSPrivacyCollectedDataTypeHealth",
        "NSPrivacyCollectedDataTypePhotosorVideos",
        "NSPrivacyCollectedDataTypeProductInteraction"
    ])

    #expect(try purpose(for: "NSPrivacyCollectedDataTypeHealth", in: manifest) == [
        "NSPrivacyCollectedDataTypePurposeAppFunctionality"
    ])
    #expect(try purpose(for: "NSPrivacyCollectedDataTypeFitness", in: manifest) == [
        "NSPrivacyCollectedDataTypePurposeAppFunctionality"
    ])
    #expect(try purpose(for: "NSPrivacyCollectedDataTypePhotosorVideos", in: manifest) == [
        "NSPrivacyCollectedDataTypePurposeAppFunctionality"
    ])
    #expect(try purpose(for: "NSPrivacyCollectedDataTypeCrashData", in: manifest) == [
        "NSPrivacyCollectedDataTypePurposeAppFunctionality"
    ])
    #expect(try purpose(for: "NSPrivacyCollectedDataTypeProductInteraction", in: manifest) == [
        "NSPrivacyCollectedDataTypePurposeAnalytics"
    ])

    #expect(try linkedFlag(for: "NSPrivacyCollectedDataTypeHealth", in: manifest) == true)
    #expect(try linkedFlag(for: "NSPrivacyCollectedDataTypeFitness", in: manifest) == true)
    #expect(try linkedFlag(for: "NSPrivacyCollectedDataTypePhotosorVideos", in: manifest) == true)
    #expect(try linkedFlag(for: "NSPrivacyCollectedDataTypeCrashData", in: manifest) == false)
    #expect(try linkedFlag(for: "NSPrivacyCollectedDataTypeProductInteraction", in: manifest) == false)

    #expect(manifest["NSPrivacyTracking"] as? Bool == false)
    #expect((manifest["NSPrivacyTrackingDomains"] as? [String]) == [])
}

@Test
func privacyManifestDeclaresRequiredReasonAPIs() throws {
    let manifest = try privacyManifest()
    let apiReasons = try accessedAPIReasons(in: manifest)

    #expect(apiReasons["NSPrivacyAccessedAPICategoryFileTimestamp"] == ["C617.1"])
    #expect(apiReasons["NSPrivacyAccessedAPICategoryUserDefaults"] == ["CA92.1"])
}

@Test
func generatedInfoPlistUsageStringsStayAppReviewReady() throws {
    let project = try String(
        contentsOf: iosRoot().appendingPathComponent("project.yml"),
        encoding: .utf8
    )

    // Usage strings moved from INFOPLIST_KEY_* build settings (which silently
    // drop custom keys) into the explicit Info.plist properties block; the
    // App-Review-ready copy must stay byte-identical either way.
    #expect(project.contains(
        "NSCameraUsageDescription: FuelWell uses the camera to log meal photos for nutrition tracking."
    ))
    let healthShareUsageDescription =
        "NSHealthShareUsageDescription: FuelWell reads workouts, sleep, steps, energy, " +
        "and body measurements to personalize coaching."
    #expect(project.contains(healthShareUsageDescription))
    #expect(project.contains(
        "NSHealthUpdateUsageDescription: FuelWell does not write Health data in this phase."
    ))
    #expect(!project.contains("NSPhotoLibraryUsageDescription"))
}

@Test
func phase5ShipFoundationsStayWired() throws {
    let root = repoRoot()
    let workflow = try String(
        contentsOf: root.appendingPathComponent(".github/workflows/ios-ci.yml"),
        encoding: .utf8
    )
    let fastfile = try String(
        contentsOf: iosRoot().appendingPathComponent("fastlane/Fastfile"),
        encoding: .utf8
    )
    let metadataDescription = try String(
        contentsOf: iosRoot().appendingPathComponent("fastlane/metadata/en-US/description.txt"),
        encoding: .utf8
    )

    #expect(workflow.contains("SwiftLint strict"))
    #expect(workflow.contains("Run full test suite"))
    #expect(workflow.contains("Fastlane Config"))
    #expect(fastfile.contains("lane :test"))
    #expect(fastfile.contains("lane :beta"))
    #expect(fastfile.contains("lane :release"))
    #expect(metadataDescription.contains("FuelWell helps you decide what to do next"))
}

@Test
func feedbackSchemaAndAnalyticsStayReleaseReady() throws {
    let migration = try String(
        contentsOf: iosRoot().appendingPathComponent("supabase/migrations/202605240001_phase2_architecture.sql"),
        encoding: .utf8
    )

    #expect(migration.contains("create table if not exists feedback"))
    #expect(migration.contains("feedback anonymous or owner-writable"))
    #expect(migration.contains("feedback_created_at_idx"))
}

private func privacyManifest() throws -> [String: Any] {
    let data = try Data(
        contentsOf: iosRoot()
            .appendingPathComponent("FuelWellApp/Resources/PrivacyInfo.xcprivacy")
    )
    let plist = try PropertyListSerialization.propertyList(from: data, options: [], format: nil)
    return try #require(plist as? [String: Any])
}

private func privacyDataTypes(in manifest: [String: Any]) throws -> [String] {
    let entries = try dataTypeEntries(in: manifest)
    return entries.compactMap { $0["NSPrivacyCollectedDataType"] as? String }.sorted()
}

private func purpose(for dataType: String, in manifest: [String: Any]) throws -> [String] {
    let entry = try dataTypeEntry(dataType, in: manifest)
    return try #require(entry["NSPrivacyCollectedDataTypePurposes"] as? [String]).sorted()
}

private func linkedFlag(for dataType: String, in manifest: [String: Any]) throws -> Bool {
    let entry = try dataTypeEntry(dataType, in: manifest)
    return try #require(entry["NSPrivacyCollectedDataTypeLinked"] as? Bool)
}

private func dataTypeEntry(_ dataType: String, in manifest: [String: Any]) throws -> [String: Any] {
    let entries = try dataTypeEntries(in: manifest)
    return try #require(entries.first { $0["NSPrivacyCollectedDataType"] as? String == dataType })
}

private func dataTypeEntries(in manifest: [String: Any]) throws -> [[String: Any]] {
    try #require(manifest["NSPrivacyCollectedDataTypes"] as? [[String: Any]])
}

private func accessedAPIReasons(in manifest: [String: Any]) throws -> [String: [String]] {
    let entries = try #require(manifest["NSPrivacyAccessedAPITypes"] as? [[String: Any]])
    var reasons: [String: [String]] = [:]

    for entry in entries {
        guard
            let apiType = entry["NSPrivacyAccessedAPIType"] as? String,
            let apiReasons = entry["NSPrivacyAccessedAPITypeReasons"] as? [String]
        else {
            continue
        }
        reasons[apiType] = apiReasons.sorted()
    }

    return reasons
}

private func iosRoot(filePath: String = #filePath) -> URL {
    URL(fileURLWithPath: filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
}

private func repoRoot(filePath: String = #filePath) -> URL {
    iosRoot(filePath: filePath).deletingLastPathComponent()
}

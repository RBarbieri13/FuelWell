import Foundation

struct ReleaseManifest: Decodable, Equatable, Sendable {
    let schemaVersion: Int
    let packageVersion: String
    let gitSha: String
    let vercelDeploymentId: String
    let deploymentUrl: URL
    let environment: String
}

struct ReleaseBinding: Equatable, Sendable {
    static let manifestPath = "/.well-known/fuelwell-release"

    let startURL: URL
    let manifestURL: URL
    let expectedManifest: ReleaseManifest

    init(infoDictionary: [String: Any]) throws {
        let startURL = try Self.httpsURL(for: "FuelWellStartURL", in: infoDictionary)
        let deploymentURL = try Self.httpsURL(for: "FuelWellExpectedDeploymentURL", in: infoDictionary)
        let manifestURL = deploymentURL.appending(path: Self.manifestPath)

        guard startURL.host == deploymentURL.host else {
            throw ReleaseBindingError.invalidConfiguration(
                "The app start URL and expected deployment URL must use the same host."
            )
        }

        self.startURL = startURL
        self.manifestURL = manifestURL
        self.expectedManifest = ReleaseManifest(
            schemaVersion: try Self.integer(for: "FuelWellReleaseSchemaVersion", in: infoDictionary),
            packageVersion: try Self.string(for: "FuelWellExpectedPackageVersion", in: infoDictionary),
            gitSha: try Self.string(for: "FuelWellExpectedGitSHA", in: infoDictionary),
            vercelDeploymentId: try Self.string(for: "FuelWellExpectedDeploymentID", in: infoDictionary),
            deploymentUrl: deploymentURL,
            environment: try Self.string(for: "FuelWellExpectedEnvironment", in: infoDictionary)
        )
    }

    func validate(_ actual: ReleaseManifest) throws {
        var mismatches: [String] = []

        if actual.schemaVersion != expectedManifest.schemaVersion { mismatches.append("schema version") }
        if actual.packageVersion != expectedManifest.packageVersion { mismatches.append("package version") }
        if actual.gitSha != expectedManifest.gitSha { mismatches.append("git SHA") }
        if actual.vercelDeploymentId != expectedManifest.vercelDeploymentId { mismatches.append("deployment ID") }
        if normalized(actual.deploymentUrl) != normalized(expectedManifest.deploymentUrl) {
            mismatches.append("deployment URL")
        }
        if actual.environment != expectedManifest.environment { mismatches.append("environment") }

        guard mismatches.isEmpty else {
            throw ReleaseBindingError.manifestMismatch(mismatches)
        }
    }

    func fetchAndValidate(using session: URLSession = .shared) async throws {
        var request = URLRequest(
            url: manifestURL,
            cachePolicy: .reloadIgnoringLocalAndRemoteCacheData,
            timeoutInterval: 15
        )
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await session.data(for: request)
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            throw ReleaseBindingError.manifestUnavailable
        }

        let manifest: ReleaseManifest
        do {
            manifest = try JSONDecoder().decode(ReleaseManifest.self, from: data)
        } catch {
            throw ReleaseBindingError.invalidManifest
        }
        try validate(manifest)
    }

    private func normalized(_ url: URL) -> String {
        url.absoluteString.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    }

    private static func string(for key: String, in infoDictionary: [String: Any]) throws -> String {
        guard let value = infoDictionary[key] as? String, !value.trimmingCharacters(in: .whitespaces).isEmpty else {
            throw ReleaseBindingError.invalidConfiguration("Missing release setting: \(key).")
        }
        return value.trimmingCharacters(in: .whitespaces)
    }

    private static func integer(for key: String, in infoDictionary: [String: Any]) throws -> Int {
        let value = try string(for: key, in: infoDictionary)
        guard let integer = Int(value) else {
            throw ReleaseBindingError.invalidConfiguration("Invalid release setting: \(key).")
        }
        return integer
    }

    private static func httpsURL(for key: String, in infoDictionary: [String: Any]) throws -> URL {
        let value = try string(for: key, in: infoDictionary)
        guard let url = URL(string: value), url.scheme == "https", url.host != nil else {
            throw ReleaseBindingError.invalidConfiguration("Invalid HTTPS release setting: \(key).")
        }
        return url
    }
}

enum ReleaseBindingError: LocalizedError, Equatable {
    case invalidConfiguration(String)
    case manifestUnavailable
    case invalidManifest
    case manifestMismatch([String])

    var errorDescription: String? {
        switch self {
        case .invalidConfiguration(let reason):
            "This build is missing its release binding. \(reason)"
        case .manifestUnavailable:
            "The release manifest could not be verified. Check your connection and try again."
        case .invalidManifest:
            "The release manifest is invalid. This build cannot open an unverified release."
        case .manifestMismatch(let fields):
            "This build does not match the published release (\(fields.joined(separator: ", ")))."
        }
    }
}

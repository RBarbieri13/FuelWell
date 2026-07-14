@testable import FuelWellApp
import Foundation
import XCTest

final class ReleaseManifestTests: XCTestCase {
    private var deploymentURL: URL {
        get throws {
            try XCTUnwrap(URL(string: "https://fuelwell-a1b2c3.vercel.app"))
        }
    }

    func testBuildSettingsProduceImmutableReleaseURLs() throws {
        let binding = try ReleaseBinding(infoDictionary: try settings())

        XCTAssertEqual(binding.startURL.absoluteString, "https://fuelwell-a1b2c3.vercel.app/app/dashboard")
        XCTAssertEqual(
            binding.manifestURL.absoluteString,
            "https://fuelwell-a1b2c3.vercel.app/.well-known/fuelwell-release"
        )
    }

    func testMissingBuildSettingFailsClosed() throws {
        var values = try settings()
        values["FuelWellExpectedDeploymentID"] = nil

        XCTAssertThrowsError(try ReleaseBinding(infoDictionary: values)) { error in
            XCTAssertEqual(
                error as? ReleaseBindingError,
                .invalidConfiguration("Missing release setting: FuelWellExpectedDeploymentID.")
            )
        }
    }

    func testStartURLMustUseExpectedDeploymentHost() throws {
        var values = try settings()
        values["FuelWellStartURL"] = "https://fuelwell-preview.vercel.app/app/dashboard"

        XCTAssertThrowsError(try ReleaseBinding(infoDictionary: values))
    }

    func testMatchingManifestPasses() throws {
        let binding = try ReleaseBinding(infoDictionary: try settings())
        XCTAssertNoThrow(try binding.validate(try manifest()))
    }

    func testEveryProvenanceMismatchIsReported() throws {
        let binding = try ReleaseBinding(infoDictionary: try settings())
        let mismatched = ReleaseManifest(
            schemaVersion: 2,
            packageVersion: "9.9.9",
            gitSha: "wrong-sha",
            vercelDeploymentId: "dpl_wrong",
            deploymentUrl: try XCTUnwrap(URL(string: "https://wrong.vercel.app")),
            environment: "production"
        )

        XCTAssertThrowsError(try binding.validate(mismatched)) { error in
            XCTAssertEqual(
                error as? ReleaseBindingError,
                .manifestMismatch([
                    "schema version",
                    "package version",
                    "git SHA",
                    "deployment ID",
                    "deployment URL",
                    "environment"
                ])
            )
        }
    }

    private func settings() throws -> [String: Any] {
        [
            "FuelWellStartURL": "https://fuelwell-a1b2c3.vercel.app/app/dashboard",
            "FuelWellExpectedPackageVersion": "1.4.0",
            "FuelWellExpectedGitSHA": "0123456789abcdef0123456789abcdef01234567",
            "FuelWellExpectedDeploymentID": "dpl_immutableCandidate123",
            "FuelWellExpectedDeploymentURL": try deploymentURL.absoluteString,
            "FuelWellExpectedEnvironment": "preview",
            "FuelWellReleaseSchemaVersion": "1"
        ]
    }

    private func manifest() throws -> ReleaseManifest {
        ReleaseManifest(
            schemaVersion: 1,
            packageVersion: "1.4.0",
            gitSha: "0123456789abcdef0123456789abcdef01234567",
            vercelDeploymentId: "dpl_immutableCandidate123",
            deploymentUrl: try deploymentURL,
            environment: "preview"
        )
    }
}

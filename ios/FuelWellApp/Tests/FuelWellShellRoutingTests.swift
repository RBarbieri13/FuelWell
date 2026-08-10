@testable import FuelWellApp
import Foundation
import XCTest

final class FuelWellShellRoutingTests: XCTestCase {
    private var policy: FuelWellURLPolicy {
        FuelWellURLPolicy(
            appURL: URL(string: "https://fuelwell-build-123.vercel.app/app/dashboard")!,
            supabaseURL: URL(string: "https://project-ref.supabase.co")!
        )
    }

    func testOnlyImmutableFuelWellOriginStaysInternal() throws {
        XCTAssertEqual(
            policy.disposition(for: try url("https://fuelwell-build-123.vercel.app/app/coach")),
            .allowInternal
        )
        XCTAssertEqual(
            policy.disposition(for: try url("https://fuelwell-preview.vercel.app/app/dashboard")),
            .openExternal
        )
        XCTAssertEqual(
            policy.disposition(for: try url("https://project-ref.supabase.co/auth/v1/callback")),
            .openExternal
        )
    }

    func testUntrustedAndNonHTTPSDestinationsLeaveTheWebView() throws {
        XCTAssertEqual(policy.disposition(for: try url("https://www.apple.com/")), .openExternal)
        XCTAssertEqual(policy.disposition(for: try url("mailto:support@fuelwell.app")), .openExternal)
    }

    func testCustomAuthCallbackReturnsToNativeCallbackRoute() throws {
        let incoming = try url("fuelwell://auth/callback?code=abc123&next=%2Fapp%2Fcoach")
        let destination = try XCTUnwrap(policy.webDestination(for: incoming))

        XCTAssertEqual(destination.host, "fuelwell-build-123.vercel.app")
        XCTAssertEqual(destination.path, "/native-auth/callback")
        XCTAssertEqual(queryValue("code", in: destination), "abc123")
        XCTAssertEqual(queryValue("next", in: destination), "/app/coach")
    }

    func testUniversalCallbackReturnsToImmutableReleaseOrigin() throws {
        let incoming = try url("https://fuelwell-preview.vercel.app/callback?code=abc123")
        let destination = try XCTUnwrap(policy.webDestination(for: incoming))

        XCTAssertEqual(destination.host, "fuelwell-build-123.vercel.app")
        XCTAssertEqual(destination.path, "/native-auth/callback")
        XCTAssertEqual(queryValue("code", in: destination), "abc123")
    }

    func testDeepLinkPathCannotEscapeTheBoundFuelWellOrigin() throws {
        let safe = try XCTUnwrap(policy.webDestination(for: try url("fuelwell://open?path=%2Fapp%2Fworkouts")))
        XCTAssertEqual(safe.absoluteString, "https://fuelwell-build-123.vercel.app/app/workouts")

        let unsafe = try XCTUnwrap(policy.webDestination(for: try url("fuelwell://open?path=%2F%2Fevil.example")))
        XCTAssertEqual(unsafe.absoluteString, "https://fuelwell-build-123.vercel.app/app/dashboard")

        let backslash = try XCTUnwrap(policy.webDestination(for: try url("fuelwell://open?path=%2F%5Cevil.example")))
        XCTAssertEqual(backslash.absoluteString, "https://fuelwell-build-123.vercel.app/app/dashboard")

        let nonApp = try XCTUnwrap(policy.webDestination(for: try url("fuelwell://open?path=%2Flogin")))
        XCTAssertEqual(nonApp.absoluteString, "https://fuelwell-build-123.vercel.app/app/dashboard")
    }

    func testNativeOAuthRequestAcceptsOnlySupportedProvidersAndTrustedSupabaseAuthorization() throws {
        let request = try FuelWellNativeOAuthRequest(
            messageBody: [
                "authorizationURL": "https://project-ref.supabase.co/auth/v1/authorize?provider=google&redirect_to=fuelwell%3A%2F%2Fauth%2Fcallback",
                "provider": "google",
                "next": "/app/dashboard",
            ],
            policy: policy
        )
        XCTAssertEqual(request.provider, "google")
        XCTAssertEqual(request.nextPath, "/app/dashboard")

        XCTAssertThrowsError(
            try FuelWellNativeOAuthRequest(
                messageBody: [
                    "authorizationURL": "https://evil.example/auth/v1/authorize?redirect_to=fuelwell%3A%2F%2Fauth%2Fcallback",
                    "provider": "google",
                ],
                policy: policy
            )
        ) { error in
            XCTAssertEqual(error as? FuelWellNativeOAuthRequestError, .untrustedAuthorizationURL)
        }

        XCTAssertThrowsError(
            try FuelWellNativeOAuthRequest(
                messageBody: [
                    "authorizationURL": "https://project-ref.supabase.co/auth/v1/authorize?redirect_to=fuelwell%3A%2F%2Fauth%2Fcallback",
                    "provider": "github",
                ],
                policy: policy
            )
        ) { error in
            XCTAssertEqual(error as? FuelWellNativeOAuthRequestError, .unsupportedProvider)
        }

        XCTAssertThrowsError(
            try FuelWellNativeOAuthRequest(
                messageBody: [
                    "authorizationURL": "https://attacker-project.supabase.co/auth/v1/authorize?redirect_to=fuelwell%3A%2F%2Fauth%2Fcallback",
                    "provider": "google",
                ],
                policy: policy
            )
        ) { error in
            XCTAssertEqual(error as? FuelWellNativeOAuthRequestError, .untrustedAuthorizationURL)
        }
    }

    func testOAuthBridgeRequiresTheExactImmutableMainFrameOrigin() {
        XCTAssertTrue(
            policy.isTrustedBridgeOrigin(
                scheme: "https",
                host: "fuelwell-build-123.vercel.app",
                port: 443
            )
        )
        XCTAssertFalse(
            policy.isTrustedBridgeOrigin(
                scheme: "https",
                host: "fuelwell-preview.vercel.app",
                port: 443
            )
        )
        XCTAssertFalse(
            policy.isTrustedBridgeOrigin(
                scheme: "http",
                host: "fuelwell-build-123.vercel.app",
                port: 80
            )
        )
    }

    private func url(_ value: String) throws -> URL {
        try XCTUnwrap(URL(string: value))
    }

    private func queryValue(_ name: String, in url: URL) -> String? {
        URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first(where: { $0.name == name })?
            .value
    }
}

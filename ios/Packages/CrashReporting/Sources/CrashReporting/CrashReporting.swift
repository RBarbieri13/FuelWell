import Dependencies
import Foundation

public struct CrashContext: Equatable, Sendable {
    public var userID: String?
    public var route: String?
    public var extras: [String: String]

    public init(userID: String? = nil, route: String? = nil, extras: [String: String] = [:]) {
        self.userID = userID
        self.route = route
        self.extras = extras
    }
}

public enum CrashReportingError: Error, Equatable, Sendable {
    case missingConfiguration
    case invalidResponse
    case transport(String)
    case unimplemented
}

public struct CrashReporter: Sendable {
    public var configure: @Sendable (CrashContext) async throws -> Void
    public var capture: @Sendable (String, CrashContext) async throws -> Void

    public init(
        configure: @escaping @Sendable (CrashContext) async throws -> Void,
        capture: @escaping @Sendable (String, CrashContext) async throws -> Void
    ) {
        self.configure = configure
        self.capture = capture
    }
}

extension CrashReporter: DependencyKey {
    public static let liveValue = CrashReporter.live()

    public static let testValue = CrashReporter(
        configure: { _ in throw CrashReportingError.unimplemented },
        capture: { _, _ in throw CrashReportingError.unimplemented }
    )

    public static let previewValue = CrashReporter.noop

    public static let noop = CrashReporter(
        configure: { _ in },
        capture: { _, _ in }
    )

    public static func live(
        dsn: URL? = ProcessInfo.processInfo.environment["FUELWELL_SENTRY_DSN"].flatMap(URL.init(string:))
    ) -> CrashReporter {
        guard let dsn else {
            return CrashReporter(
                configure: { _ in throw CrashReportingError.missingConfiguration },
                capture: { _, _ in throw CrashReportingError.missingConfiguration }
            )
        }

        let transport = SentryEnvelopeTransport(dsn: dsn)
        return CrashReporter(
            configure: { _ in },
            capture: { try await transport.capture(message: $0, context: $1) }
        )
    }
}

extension DependencyValues {
    public var crashReporter: CrashReporter {
        get { self[CrashReporter.self] }
        set { self[CrashReporter.self] = newValue }
    }
}

private actor SentryEnvelopeTransport {
    private let dsn: URL
    private let session: URLSession

    init(dsn: URL, session: URLSession = .shared) {
        self.dsn = dsn
        self.session = session
    }

    func capture(message: String, context: CrashContext) async throws {
        var request = URLRequest(url: self.dsn)
        request.httpMethod = "POST"
        request.httpBody = Data("\(message)\n\(context.route ?? "")".utf8)

        do {
            let (_, response) = try await self.session.data(for: request)
            guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
                throw CrashReportingError.invalidResponse
            }
        } catch let error as CrashReportingError {
            throw error
        } catch {
            throw CrashReportingError.transport(error.localizedDescription)
        }
    }
}

import Foundation

struct FuelWellIncomingURL: Equatable, Sendable {
    let id: UUID
    let url: URL

    init(url: URL, id: UUID = UUID()) {
        self.id = id
        self.url = url
    }
}

enum FuelWellNavigationDisposition: Equatable, Sendable {
    case allowInternal
    case openExternal
    case routeInternally(URL)
    case cancel
}

struct FuelWellURLPolicy: Equatable, Sendable {
    static let callbackScheme = "fuelwell"
    static let nativeCallbackPath = "/native-auth/callback"
    static let associatedDomain = "fuelwell-preview.vercel.app"

    let appOrigin: URL
    let oauthOrigin: URL?
    let permitsTestScheme: Bool

    init(appURL: URL, supabaseURL: URL? = nil, permitsTestScheme: Bool = false) {
        self.appOrigin = Self.origin(for: appURL)
        self.oauthOrigin = supabaseURL.map(Self.origin(for:))
        self.permitsTestScheme = permitsTestScheme
    }

    func disposition(for url: URL) -> FuelWellNavigationDisposition {
        guard let scheme = url.scheme?.lowercased() else { return .cancel }

        if scheme == Self.callbackScheme {
            guard let destination = webDestination(for: url) else { return .cancel }
            return .routeInternally(destination)
        }

        if scheme == "about" {
            return .allowInternal
        }

        if permitsTestScheme, scheme == "fuelwell-test" {
            return .allowInternal
        }

        guard scheme == "https" else {
            return .openExternal
        }

        return isTrustedWebOrigin(url) ? .allowInternal : .openExternal
    }

    func webDestination(for incomingURL: URL) -> URL? {
        guard let scheme = incomingURL.scheme?.lowercased() else { return nil }

        if scheme == Self.callbackScheme {
            guard incomingURL.host?.lowercased() == "auth", incomingURL.path == "/callback" else {
                if incomingURL.host?.lowercased() == "open" {
                    let path = URLComponents(url: incomingURL, resolvingAgainstBaseURL: false)?
                        .queryItems?
                        .first(where: { $0.name == "path" })?
                        .value
                    return appURL(forRelativePath: Self.safeRelativePath(path))
                }
                return nil
            }
            return callbackDestination(from: incomingURL)
        }

        guard scheme == "https" else { return nil }

        if isAssociatedUniversalLink(incomingURL),
           incomingURL.path == "/callback" || incomingURL.path == Self.nativeCallbackPath {
            return callbackDestination(from: incomingURL)
        }

        guard isTrustedWebOrigin(incomingURL) else { return nil }

        guard isFuelWellWebOrigin(incomingURL) else {
            return incomingURL
        }

        return appURL(path: incomingURL.path, queryItems: queryItems(from: incomingURL))
    }

    func isTrustedOAuthAuthorizationURL(_ url: URL) -> Bool {
        guard let oauthOrigin,
              Self.sameOrigin(url, oauthOrigin),
              url.path == "/auth/v1/authorize"
        else {
            return false
        }

        let redirect = URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first(where: { $0.name == "redirect_to" })?
            .value
        guard let redirect, let redirectURL = URL(string: redirect) else { return false }
        return redirectURL.scheme?.lowercased() == Self.callbackScheme &&
            redirectURL.host?.lowercased() == "auth" &&
            redirectURL.path == "/callback"
    }

    static func safeRelativePath(_ candidate: String?) -> String {
        guard let candidate,
              candidate.hasPrefix("/"),
              !candidate.hasPrefix("//"),
              !candidate.contains("\\"),
              candidate.rangeOfCharacter(from: .controlCharacters) == nil,
              let components = URLComponents(string: candidate),
              components.scheme == nil,
              components.host == nil,
              components.path == "/app" || components.path.hasPrefix("/app/")
        else {
            return "/app/dashboard"
        }
        return candidate
    }

    func isTrustedBridgeOrigin(scheme: String, host: String, port: Int) -> Bool {
        var components = URLComponents()
        components.scheme = scheme
        components.host = host
        components.port = port > 0 ? port : nil
        guard let bridgeURL = components.url else { return false }
        return Self.sameOrigin(bridgeURL, appOrigin)
    }

    private func callbackDestination(from url: URL) -> URL? {
        let allowedNames = Set([
            "code",
            "error",
            "error_code",
            "error_description",
            "next",
            "token_hash",
            "type",
        ])
        let items = queryItems(from: url).filter { allowedNames.contains($0.name) }
        return appURL(path: Self.nativeCallbackPath, queryItems: items)
    }

    private func appURL(forRelativePath relativePath: String) -> URL? {
        guard let components = URLComponents(string: relativePath) else { return nil }
        return appURL(path: components.path, queryItems: components.queryItems ?? [])
    }

    private func appURL(path: String, queryItems: [URLQueryItem]) -> URL? {
        var components = URLComponents(url: appOrigin, resolvingAgainstBaseURL: false)
        components?.path = path.isEmpty ? "/" : path
        components?.queryItems = queryItems.isEmpty ? nil : queryItems
        components?.fragment = nil
        return components?.url
    }

    private func isTrustedWebOrigin(_ url: URL) -> Bool {
        Self.sameOrigin(url, appOrigin)
    }

    private func isFuelWellWebOrigin(_ url: URL) -> Bool {
        Self.sameOrigin(url, appOrigin)
    }

    private func isAssociatedUniversalLink(_ url: URL) -> Bool {
        url.scheme?.lowercased() == "https" && url.host?.lowercased() == Self.associatedDomain
    }

    private func queryItems(from url: URL) -> [URLQueryItem] {
        URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems ?? []
    }

    private static func origin(for url: URL) -> URL {
        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        components?.path = ""
        components?.query = nil
        components?.fragment = nil
        return components?.url ?? url
    }

    private static func sameOrigin(_ lhs: URL, _ rhs: URL) -> Bool {
        guard lhs.scheme?.lowercased() == rhs.scheme?.lowercased(),
              lhs.host?.lowercased() == rhs.host?.lowercased()
        else {
            return false
        }
        return canonicalPort(for: lhs) == canonicalPort(for: rhs)
    }

    private static func canonicalPort(for url: URL) -> Int? {
        if let port = url.port { return port }
        switch url.scheme?.lowercased() {
        case "https": return 443
        case "http": return 80
        default: return nil
        }
    }
}

enum FuelWellNativeOAuthRequestError: LocalizedError, Equatable {
    case invalidMessage
    case unsupportedProvider
    case untrustedAuthorizationURL

    var errorDescription: String? {
        switch self {
        case .invalidMessage:
            "FuelWell could not start sign in. Please try again."
        case .unsupportedProvider:
            "That sign-in provider is not supported."
        case .untrustedAuthorizationURL:
            "FuelWell blocked an untrusted sign-in destination."
        }
    }
}

struct FuelWellNativeOAuthRequest: Equatable, Sendable {
    let authorizationURL: URL
    let provider: String
    let nextPath: String

    init(messageBody: Any, policy: FuelWellURLPolicy) throws {
        guard let body = messageBody as? [String: Any],
              let rawURL = body["authorizationURL"] as? String,
              let authorizationURL = URL(string: rawURL),
              let provider = body["provider"] as? String
        else {
            throw FuelWellNativeOAuthRequestError.invalidMessage
        }

        guard ["apple", "facebook", "google"].contains(provider) else {
            throw FuelWellNativeOAuthRequestError.unsupportedProvider
        }
        guard policy.isTrustedOAuthAuthorizationURL(authorizationURL) else {
            throw FuelWellNativeOAuthRequestError.untrustedAuthorizationURL
        }

        self.authorizationURL = authorizationURL
        self.provider = provider
        self.nextPath = FuelWellURLPolicy.safeRelativePath(body["next"] as? String)
    }
}

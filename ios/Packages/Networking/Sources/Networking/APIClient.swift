import Foundation

public struct APIRequest: Sendable {
    public let urlRequest: URLRequest

    public init(urlRequest: URLRequest) {
        self.urlRequest = urlRequest
    }
}

public struct APIResponse: Sendable {
    public let data: Data
    public let response: URLResponse

    public init(data: Data, response: URLResponse) {
        self.data = data
        self.response = response
    }
}

public protocol APIClient: Sendable {
    func send(_ request: APIRequest) async throws -> APIResponse
}

public actor LiveAPIClient: APIClient {
    private let session: URLSession

    public init(session: URLSession = .shared) {
        self.session = session
    }

    public func send(_ request: APIRequest) async throws -> APIResponse {
        let result = try await self.session.data(for: request.urlRequest)

        return APIResponse(data: result.0, response: result.1)
    }
}

public actor RetryingAPIClient: APIClient {
    private let base: any APIClient
    private let maxAttempts: Int

    public init(base: any APIClient, maxAttempts: Int = 3) {
        self.base = base
        self.maxAttempts = maxAttempts
    }

    public func send(_ request: APIRequest) async throws -> APIResponse {
        var attempt = 0
        var lastError: (any Error)?

        while attempt < self.maxAttempts {
            do {
                return try await self.base.send(request)
            } catch {
                lastError = error
                attempt += 1
            }
        }

        throw lastError ?? URLError(.unknown)
    }
}

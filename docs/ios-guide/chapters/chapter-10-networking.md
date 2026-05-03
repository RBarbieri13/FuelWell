# Chapter 10: Networking — URLSession, async/await, APIClient

*"Every networking bug is actually a schema bug wearing a raincoat."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Build a typed APIClient protocol with live and mock implementations.
2.  Use URLSession with async/await to perform requests and decode responses.
3.  Design a request/response error taxonomy that separates transport, HTTP, decoding, and domain failures.
4.  Implement retry with exponential backoff for idempotent requests only.
5.  Integrate the Supabase Swift SDK for auth and data queries.
6.  Decide when to stay with hand-rolled networking versus graduate to Swift OpenAPI Generator.

## Prerequisites

  - Chapters 1–9 complete.
  - Add-meal flow works end-to-end with the in-memory repository.
  - A Supabase account (free tier). Sign up at [supabase.com](https://supabase.com) if you haven't.

  

## 10.1 What "Networking" Actually Is in 2026

Ten years ago, "networking" on iOS meant picking a library — Alamofire, AFNetworking, maybe Moya — that wrapped the ceremony of NSURLConnection and callback hell. Today, URLSession plus async/await is clean enough that the library layer mostly evaporates.

  

What remains is a thin set of responsibilities you still have to design deliberately:

  

1.  **Typed request and response models.** What goes out, what comes back. Strings are for humans; structs are for code.
2.  **A small dispatch layer** that turns a typed request into an HTTP call and a typed response.
3.  **A typed error system** that distinguishes categories of failure.
4.  **Auth integration** — tokens attached, 401s handled.
5.  **Testability.** Every reducer that uses networking should be able to swap in a stub client.

  

Those five pieces form what we'll call the APIClient. Everything else — retries, logging, caching — layers on top.

  

**Decision point** — the Reconciliation Matrix **Networking** row commits us to URLSession + async/await behind an APIClient protocol. We skip Alamofire entirely. We graduate to Swift OpenAPI Generator only when our Supabase Edge Function surface exceeds roughly ten endpoints.

  

## 10.2 The Error Taxonomy

Before code, the taxonomy. Every network call can fail in one of four distinct ways:

  

flowchart TD

  

    Start\[Request sent\] --\> Transport{Reached\<br/\>server?}

  

    Transport --\>|No| E1\[Transport: offline,\<br/\>DNS, timeout\]

  

    Transport --\>|Yes| HTTP{HTTP status\<br/\>OK?}

  

    HTTP --\>|No| E2\[HTTP: 4xx, 5xx\]

  

    HTTP --\>|Yes| Decode{Decoded\<br/\>payload?}

  

    Decode --\>|No| E3\[Decoding: schema\<br/\>mismatch, missing fields\]

  

    Decode --\>|Yes| Domain{Response says\<br/\>success?}

  

    Domain --\>|No| E4\[Domain: validation,\<br/\>auth, business rules\]

  

    Domain --\>|Yes| Success\[Success\]

  

Each category has a different retry policy, a different user-facing message, and different debugging steps. Smearing them into a single .failure throws away information that features need. So we enumerate them:

  

// Packages/Networking/Sources/Networking/APIError.swift

  

import Foundation

  

public enum APIError: Error, Sendable, Equatable {

  

    /// The request never reached the server: offline, DNS failure, timeout.

  

    case transport(message: String)

  

    /// Server replied with a non-2xx status.

  

    case http(status: Int, body: String?)

  

    /// Server replied 2xx but the payload didn't match the expected shape.

  

    case decoding(message: String)

  

    /// Server replied 2xx with a well-formed payload that indicates a

  

    /// business-level failure (validation error, insufficient permissions).

  

    case domain(code: String, message: String)

  

    /// Authentication required or expired.

  

    case unauthorized

  

    public var isRetryable: Bool {

  

        switch self {

  

        case .transport: return true

  

        case .http(let status, \_): return status \>= 500

  

        case .decoding: return false

  

        case .domain: return false

  

        case .unauthorized: return false

  

        }

  

    }

  

    public var userFacingMessage: String {

  

        switch self {

  

        case .transport: return "You appear to be offline. Check your connection and try again."

  

        case .http(500..., \_): return "Our servers had a problem. Please try again in a moment."

  

        case .http: return "Something went wrong. Please try again."

  

        case .decoding: return "We received an unexpected response. Please update the app if this persists."

  

        case .domain(\_, let message): return message

  

        case .unauthorized: return "Please sign in again."

  

        }

  

    }

  

}

  

Two properties on the error — isRetryable and userFacingMessage — do real work. The caller doesn't have to pattern-match across four cases to decide whether to retry; the error knows. The view doesn't have to concatenate strings; the error provides the user message.

  

## 10.3 The Request and Response Shapes

A typed APIRequest captures everything needed to build an HTTP call. Let's define it generically:

  

// Packages/Networking/Sources/Networking/APIRequest.swift

  

import Foundation

  

public struct APIRequest\<Response: Decodable & Sendable\>: Sendable {

  

    public enum Method: String, Sendable {

  

        case get = "GET"

  

        case post = "POST"

  

        case put = "PUT"

  

        case patch = "PATCH"

  

        case delete = "DELETE"

  

    }

  

    public let path: String

  

    public let method: Method

  

    public let query: \[URLQueryItem\]

  

    public let body: Data?

  

    public let headers: \[String: String\]

  

    public let isIdempotent: Bool

  

    public init(

  

        path: String,

  

        method: Method = .get,

  

        query: \[URLQueryItem\] = \[\],

  

        body: Data? = nil,

  

        headers: \[String: String\] = \[:\],

  

        isIdempotent: Bool? = nil

  

    ) {

  

        self.path = path

  

        self.method = method

  

        self.query = query

  

        self.body = body

  

        self.headers = headers

  

        // GET/PUT/DELETE are idempotent; POST/PATCH assumed not unless told.

  

        self.isIdempotent = isIdempotent

  

            ?? (method == .get || method == .put || method == .delete)

  

    }

  

}

  

The generic Response parameter pins down the return type at the call site:

  

let request = APIRequest\<\[FoodItem\]\>(path: "/foods", query: \[

  

    URLQueryItem(name: "q", value: "oatmeal")

  

\])

  

Anyone calling client.send(request) gets back \[FoodItem\], statically typed. No manual casting. No runtime dictionary parsing.

  

isIdempotent matters because it's the safe condition for retrying. GET is always safe to repeat. POST /meals probably isn't — you'd create duplicate meals. We'll use this flag in §10.6.

  

## 10.4 The APIClient Protocol

Now the contract:

  

// Packages/Networking/Sources/Networking/APIClient.swift

  

import Foundation

  

public protocol APIClient: Sendable {

  

    func send\<Response\>(\_ request: APIRequest\<Response\>) async throws -\> Response

  

}

  

One method. That's it. Everything the rest of the app does — fetching, posting, deleting — flows through send. The simplicity is the point: Claude Code and you both have exactly one seam to mock, one seam to instrument, one seam to reason about.

  

## 10.5 The Live Implementation

// Packages/Networking/Sources/Networking/LiveAPIClient.swift

  

import Foundation

  

public struct LiveAPIClient: APIClient {

  

    public let baseURL: URL

  

    public let session: URLSession

  

    public let authProvider: @Sendable () async -\> String?

  

    public init(

  

        baseURL: URL,

  

        session: URLSession = .shared,

  

        authProvider: @escaping @Sendable () async -\> String? = { nil }

  

    ) {

  

        self.baseURL = baseURL

  

        self.session = session

  

        self.authProvider = authProvider

  

    }

  

    public func send\<Response\>(

  

        \_ request: APIRequest\<Response\>

  

    ) async throws -\> Response {

  

        let urlRequest = try await buildURLRequest(request)

  

        let data: Data

  

        let response: URLResponse

  

        do {

  

            (data, response) = try await session.data(for: urlRequest)

  

        } catch {

  

            throw APIError.transport(message: error.localizedDescription)

  

        }

  

        guard let http = response as? HTTPURLResponse else {

  

            throw APIError.transport(message: "Non-HTTP response")

  

        }

  

        switch http.statusCode {

  

        case 200..\<300:

  

            return try decode(data, as: Response.self)

  

        case 401, 403:

  

            throw APIError.unauthorized

  

        default:

  

            let body = String(data: data, encoding: .utf8)

  

            throw APIError.http(status: http.statusCode, body: body)

  

        }

  

    }

  

    private func buildURLRequest\<Response\>(

  

        \_ request: APIRequest\<Response\>

  

    ) async throws -\> URLRequest {

  

        var components = URLComponents(

  

            url: baseURL.appendingPathComponent(request.path),

  

            resolvingAgainstBaseURL: false

  

        )

  

        if \!request.query.isEmpty {

  

            components?.queryItems = request.query

  

        }

  

        guard let url = components?.url else {

  

            throw APIError.transport(message: "Invalid URL for \\(request.path)")

  

        }

  

        var urlRequest = URLRequest(url: url)

  

        urlRequest.httpMethod = request.method.rawValue

  

        urlRequest.httpBody = request.body

  

        // Default headers.

  

        urlRequest.setValue("application/json", forHTTPHeaderField: "Accept")

  

        if request.body \!= nil {

  

            urlRequest.setValue(

  

                "application/json",

  

                forHTTPHeaderField: "Content-Type"

  

            )

  

        }

  

        // Auth.

  

        if let token = await authProvider() {

  

            urlRequest.setValue("Bearer \\(token)",

  

                                forHTTPHeaderField: "Authorization")

  

        }

  

        // Caller-supplied headers win over defaults.

  

        for (key, value) in request.headers {

  

            urlRequest.setValue(value, forHTTPHeaderField: key)

  

        }

  

        return urlRequest

  

    }

  

    private func decode\<T: Decodable\>(

  

        \_ data: Data,

  

        as type: T.Type

  

    ) throws -\> T {

  

        // Empty response shortcut for types that can represent "no content."

  

        if T.self == EmptyResponse.self {

  

            return EmptyResponse() as\! T

  

        }

  

        do {

  

            let decoder = JSONDecoder()

  

            decoder.dateDecodingStrategy = .iso8601

  

            decoder.keyDecodingStrategy = .convertFromSnakeCase

  

            return try decoder.decode(T.self, from: data)

  

        } catch {

  

            throw APIError.decoding(message: error.localizedDescription)

  

        }

  

    }

  

}

  

public struct EmptyResponse: Decodable, Sendable {

  

    public init() {}

  

}

  

Line by line, the interesting choices:

  

  - **authProvider** **is a** **@Sendable** **async closure.** We don't bake a specific auth implementation into the client. The caller provides a function that knows how to fetch the current token (from Keychain, from Supabase, from wherever). This keeps the client ignorant of auth mechanics and trivially testable.
  - **We convert URLSession errors to** **APIError.transport** **immediately.** Raw URLError never leaks upward; every caller gets our typed taxonomy.
  - **keyDecodingStrategy = .convertFromSnakeCase** handles servers that return snake\_case JSON. Your Swift structs can use camelCase and the decoder bridges. Saves a lot of manual CodingKeys boilerplate.
  - **dateDecodingStrategy = .iso8601** is a sane default. If your backend uses Unix timestamps or something else, configure once here and every model decodes consistently.
  - **Status 401 and 403 both throw** **.unauthorized****.** You can split these if you need to — 403 is "you can't do this even when authed" while 401 is "not authed." For most apps they're handled the same way (show sign-in), so we collapse them.

  

## 10.6 Retry With Exponential Backoff

For idempotent requests that fail transiently, a short retry ladder recovers most flakes. Wrap the client:

  

// Packages/Networking/Sources/Networking/RetryingAPIClient.swift

  

import Foundation

  

public struct RetryingAPIClient: APIClient {

  

    public let wrapped: any APIClient

  

    public let maxRetries: Int

  

    public let baseDelay: Duration

  

    public init(

  

        wrapped: any APIClient,

  

        maxRetries: Int = 3,

  

        baseDelay: Duration = .milliseconds(250)

  

    ) {

  

        self.wrapped = wrapped

  

        self.maxRetries = maxRetries

  

        self.baseDelay = baseDelay

  

    }

  

    public func send\<Response\>(

  

        \_ request: APIRequest\<Response\>

  

    ) async throws -\> Response {

  

        var attempt = 0

  

        while true {

  

            do {

  

                return try await wrapped.send(request)

  

            } catch let error as APIError

  

                where error.isRetryable

  

                    && request.isIdempotent

  

                    && attempt \< maxRetries

  

            {

  

                let delay = baseDelay \* Int(pow(2.0, Double(attempt)))

  

                try await Task.sleep(for: delay)

  

                attempt += 1

  

                continue

  

            }

  

        }

  

    }

  

}

  

The retry policy has three safeguards wired together:

  

1.  **The error must be retryable.** Transport and 5xx qualify; 4xx and decoding errors don't (retrying won't help).
2.  **The request must be idempotent.** Never retry a POST that might create duplicates.
3.  **We cap attempts.** maxRetries = 3 with 250ms base gives a worst case of 250 + 500 + 1000 = 1.75s of backoff before surfacing the failure.

  

Compose it with the live client at construction time:

  

let live = LiveAPIClient(baseURL: baseURL, authProvider: ...)

  

let client: any APIClient = RetryingAPIClient(wrapped: live)

  

The rest of the app sees only the APIClient protocol and doesn't care how many layers are stacked inside.

  

**⚠️ Common Pitfall — Retrying non-idempotent requests**

  

The day you ship a retry wrapper that retries a POST /payments/charge, someone gets charged twice. The three-way guard above is not optional. If your backend returns Idempotency-Key headers (many do), wire that through as well for full safety.

  

## 10.7 The Mock for Tests and Previews

// Packages/Networking/Sources/Networking/StubAPIClient.swift

  

import Foundation

  

public actor StubAPIClient: APIClient {

  

    public typealias Handler = @Sendable (URL, String) async throws -\> Data

  

    private var handlers: \[(match: (URL, String) -\> Bool, handle: Handler)\] = \[\]

  

    public init() {}

  

    /// Register a handler for requests matching path + method.

  

    public func on(

  

        path: String,

  

        method: APIRequest\<EmptyResponse\>.Method = .get,

  

        respond: @escaping Handler

  

    ) {

  

        handlers.append((

  

            match: { url, httpMethod in

  

                url.path.hasSuffix(path) && httpMethod == method.rawValue

  

            },

  

            handle: respond

  

        ))

  

    }

  

    public func send\<Response\>(

  

        \_ request: APIRequest\<Response\>

  

    ) async throws -\> Response {

  

        // A stub doesn't have a real baseURL; we fake one so matching works.

  

        let url = URL(string: "https://stub")\!

  

            .appendingPathComponent(request.path)

  

        for (match, handle) in handlers where match(url, request.method.rawValue) {

  

            let data = try await handle(url, request.method.rawValue)

  

            let decoder = JSONDecoder()

  

            decoder.keyDecodingStrategy = .convertFromSnakeCase

  

            decoder.dateDecodingStrategy = .iso8601

  

            return try decoder.decode(Response.self, from: data)

  

        }

  

        throw APIError.transport(

  

            message: "No stub handler for \\(request.method.rawValue) \\(request.path)"

  

        )

  

    }

  

}

  

In tests, set up a stub per call pattern:

  

let stub = StubAPIClient()

  

await stub.on(path: "/foods", method: .get) { \_, \_ in

  

    """

  

    \[{"id":"abc","name":"Oatmeal","calories":310}\]

  

    """.data(using: .utf8)\!

  

}

  

let client: any APIClient = stub

  

// ... use client in a reducer under test

  

Missing handlers throw a transport error with a clear message — if a test forgets to stub an endpoint, you see which one immediately rather than hunting through nils.

  

## 10.8 Registering APIClient as a Dependency

By the Chapter 5 rules, the protocol lives in Core (so any feature can reference it) and the live implementation lives in Networking. Register the dependency in Core:

  

// Packages/Core/Sources/Core/Dependencies/APIClientDependency.swift

  

import Dependencies

  

import Networking

  

extension DependencyValues {

  

    public var apiClient: any APIClient {

  

        get { self\[APIClientKey.self\] }

  

        set { self\[APIClientKey.self\] = newValue }

  

    }

  

}

  

private enum APIClientKey: DependencyKey {

  

    public static var liveValue: any APIClient {

  

        unimplemented(

  

            "APIClient",

  

            placeholder: StubAPIClient()

  

        )

  

    }

  

    public static var testValue: any APIClient { StubAPIClient() }

  

    public static var previewValue: any APIClient { StubAPIClient() }

  

}

  

Core needs to depend on Networking for this to compile. Update Packages/Core/Package.swift to add the dependency, and update Networking's Package.swift to depend on Core (since APIError lives in Networking but we want Core to expose the protocol).

  

Actually — small correction. The cleanest split is this:

  

  - **Networking package:** protocol APIClient, APIRequest, APIError, LiveAPIClient, RetryingAPIClient, StubAPIClient. No domain types.
  - **Core package:** domain models, repository protocols, dependency registrations (which import Networking to reference APIClient).

  

So Core depends on Networking, but not vice versa. Wire that and run /build to confirm.

  

## 10.9 Supabase: When to Use the SDK vs APIClient

Supabase ships an official Swift SDK (supabase-swift) that handles auth, Postgres queries, realtime subscriptions, and file storage. For those four concerns, **use the SDK** — it handles token refresh, row-level security, and type coercion far more carefully than we'd hand-roll.

  

For **custom Edge Functions** — the Supabase serverless endpoints we'll use for AI proxying in Chapter 18 — the SDK also works, but the pattern is call-and-decode, which is exactly what our APIClient abstraction is for. Once our Edge Function count grows, we'll probably route those through APIClient for consistency with the rest of the app.

  

For this chapter: install the Supabase SDK and use it for initial auth + a seed food table query. Hand-rolled APIClient shines in the exercise.

  

Add Supabase to the Networking package. Edit Packages/Networking/Package.swift:

  

// swift-tools-version: 6.0

  

import PackageDescription

  

let package = Package(

  

    name: "Networking",

  

    platforms: \[.iOS(.v17)\],

  

    products: \[

  

        .library(name: "Networking", targets: \["Networking"\]),

  

    \],

  

    dependencies: \[

  

        .package(url: "https://github.com/supabase/supabase-swift",

  

                 from: "2.20.0"),

  

    \],

  

    targets: \[

  

        .target(

  

            name: "Networking",

  

            dependencies: \[

  

                .product(name: "Supabase", package: "supabase-swift"),

  

            \],

  

            swiftSettings: swiftSettings

  

        ),

  

        .testTarget(

  

            name: "NetworkingTests",

  

            dependencies: \["Networking"\],

  

            swiftSettings: swiftSettings

  

        ),

  

    \]

  

)

  

let swiftSettings: \[SwiftSetting\] = \[

  

    .enableUpcomingFeature("StrictConcurrency"),

  

    .enableUpcomingFeature("ExistentialAny"),

  

    .swiftLanguageMode(.v6),

  

\]

  

## 10.10 Wrapping Supabase in a Narrow Interface

Even with the SDK, don't let Supabase types leak into feature code. Wrap them in a narrow interface that features consume:

  

// Packages/Networking/Sources/Networking/SupabaseClient.swift

  

import Foundation

  

import Supabase

  

public protocol FoodDatabase: Sendable {

  

    func search(query: String, limit: Int) async throws -\> \[FoodItem\]

  

}

  

public struct FoodItem: Decodable, Sendable, Identifiable, Equatable {

  

    public let id: UUID

  

    public let name: String

  

    public let calories: Int

  

    public let protein: Double

  

    public let carbs: Double

  

    public let fat: Double

  

}

  

public struct LiveFoodDatabase: FoodDatabase {

  

    private let client: SupabaseClient

  

    public init(url: URL, key: String) {

  

        self.client = SupabaseClient(supabaseURL: url, supabaseKey: key)

  

    }

  

    public func search(query: String, limit: Int) async throws -\> \[FoodItem\] {

  

        do {

  

            let results: \[FoodItem\] = try await client.database

  

                .from("foods")

  

                .select()

  

                .ilike("name", value: "%\\(query)%")

  

                .limit(limit)

  

                .execute()

  

                .value

  

            return results

  

        } catch {

  

            throw APIError.transport(message: error.localizedDescription)

  

        }

  

    }

  

}

  

The feature code sees only FoodDatabase.search(query:limit:) -\> \[FoodItem\]. Supabase could be swapped for Firebase or a bespoke backend with no feature code changes.

  

Register it as another dependency in Core, following the same pattern as NutritionRepository and APIClient.

  

**⚠️ Common Pitfall — Letting vendor types leak**

  

The worst way to use Supabase is to scatter SupabaseClient calls across reducers. Six months later you want to migrate to AWS and every reducer breaks. The discipline is boring but essential: one narrow protocol per capability, one wrapper implementation, feature code never sees the vendor type.

  

## 10.11 When to Graduate to Swift OpenAPI Generator

The Reconciliation Matrix calls for adding Swift OpenAPI Generator once your custom endpoint count exceeds roughly ten. The argument: at that scale, hand-written request/response structs drift from the server schema and Claude Code starts hallucinating field names that don't exist.

  

OpenAPI Generator generates strongly-typed Swift code from an OpenAPI spec. Your backend team (or you, or your Supabase Edge Function layer) maintains the spec; the Swift side regenerates on every CI build. Requests and responses become generated types you can't spell wrong.

  

For FuelWell v0, we stay with hand-rolled. When we cross the threshold (probably late in Chapter 18 as the AI endpoints multiply), we'll revisit. Until then, the APIClient protocol plus per-endpoint APIRequest\<ResponseType\> literals stays manageable.

  

## 10.12 A Complete End-to-End Example

Putting it all together — fetching foods in a reducer:

  

// Features/Nutrition/Sources/Nutrition/FoodSearchFeature.swift

  

import Core

  

import ComposableArchitecture

  

import Networking

  

@Reducer

  

public struct FoodSearchFeature {

  

    @ObservableState

  

    public struct State: Equatable {

  

        public var query: String = ""

  

        public var results: \[FoodItem\] = \[\]

  

        public var isLoading: Bool = false

  

        public var errorMessage: String?

  

        public init(query: String = "") { self.query = query }

  

    }

  

    public enum Action: BindableAction {

  

        case binding(BindingAction\<State\>)

  

        case searchSubmitted

  

        case searchResponded(Result\<\[FoodItem\], APIError\>)

  

    }

  

    @Dependency(\\.foodDatabase) var foodDatabase

  

    public init() {}

  

    public var body: some ReducerOf\<Self\> {

  

        BindingReducer()

  

        Reduce { state, action in

  

            switch action {

  

            case .binding:

  

                return .none

  

            case .searchSubmitted:

  

                let query = state.query

  

                    .trimmingCharacters(in: .whitespaces)

  

                guard \!query.isEmpty else { return .none }

  

                state.isLoading = true

  

                state.errorMessage = nil

  

                return .run { \[foodDatabase\] send in

  

                    do {

  

                        let results = try await foodDatabase.search(

  

                            query: query, limit: 25

  

                        )

  

                        await send(.searchResponded(.success(results)))

  

                    } catch let error as APIError {

  

                        await send(.searchResponded(.failure(error)))

  

                    } catch {

  

                        await send(.searchResponded(.failure(

  

                            .transport(message: error.localizedDescription)

  

                        )))

  

                    }

  

                }

  

            case let .searchResponded(.success(results)):

  

                state.isLoading = false

  

                state.results = results

  

                return .none

  

            case let .searchResponded(.failure(error)):

  

                state.isLoading = false

  

                state.errorMessage = error.userFacingMessage

  

                return .none

  

            }

  

        }

  

    }

  

}

  

Every pattern from this chapter lives here: typed calls via the dependency, errors with user-facing messages, async/await inside an effect, and a clean Result flow back into state.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Raw URLError leaking into features | Catch and translate into APIError at the client boundary |
| Retrying POSTs that might create duplicates | Enforce isIdempotent + isRetryable both true before retrying |
| Using String dictionaries for query params | \\\[URLQueryItem\\\] — handles encoding correctly |
| Forgetting dateDecodingStrategy | Set once on the client's decoder; don't override per model |
| Letting Supabase types leak into reducers | Narrow protocol per capability, vendor types stay in Networking |
| Skipping the stub client for tests | Live network calls in tests are flaky and slow; stub everything |
| Re-inventing auth token handling per request | authProvider closure on the client; one source of truth |
| One giant endpoint enum | APIRequest\\\<Response\\\> keyed by path + method scales better |

  

## Hands-On Exercise

**Goal:** wire the new food search endpoint into the Nutrition tab and exercise the error path.

  

1.  **Add Supabase credentials to a local config.** Create a file FuelWell/LocalConfig.swift (gitignored — add it to .gitignore) with:

  

import Foundation

  

enum LocalConfig {

  

    static let supabaseURL = URL(string: "https://YOUR-PROJECT.supabase.co")\!

  

    static let supabaseAnonKey = "YOUR-ANON-KEY"

  

}

  

Don't commit this. In Supabase's web dashboard, create a foods table with columns id, name, calories, protein, carbs, fat, and seed a handful of rows.

  

1.  **Register the live food database** in your app entry point. Update FuelWellApp.swift:

  

import Networking

  

@main

  

struct FuelWellApp: App {

  

    init() {

  

        // Register live dependencies at launch.

  

        prepareDependencies {

  

            $0.foodDatabase = LiveFoodDatabase(

  

                url: LocalConfig.supabaseURL,

  

                key: LocalConfig.supabaseAnonKey

  

            )

  

        }

  

    }

  

    // ... rest

  

}

  

1.  **Connect** **FoodSearchFeature** **to the Nutrition navigation stack.** You already stubbed this in the Chapter 6 exercise — now replace the stub with the real reducer. Add a foodSearch case to NutritionRoute.

  

1.  **Build a** **FoodSearchView** that renders a search field, results, a loading state, and an error state. Use the design system tokens from Chapter 8.

  

1.  **Exercise the error path.** Turn off Wi-Fi on the simulator (Device → Wi-Fi) and run a search. You should see the APIError.transport user-facing message.

  

1.  **Write tests** for FoodSearchFeature:

  

  - Empty query does nothing.
  - Valid query calls the stub and populates results.
  - Transport error populates errorMessage via userFacingMessage.

  

1.  **Commit** (but not LocalConfig.swift):

  

git add .

  

git commit -m "Chapter 10: typed APIClient, Supabase-backed food search"

  

git push

  

**Time budget:** 3 hours. The Supabase setup (schema + seed data + credentials) can easily eat an hour on its own. If you can't stand up Supabase today, substitute a local stub that reads from a bundled JSON file — the feature code won't care.

  

## What's Next

Chapter 11 — **Persistence: SQLiteData Behind a Repository** — replaces the in-memory nutrition repository with a real SQLite-backed store that survives app restarts, syncs via CloudKit, and handles schema migrations. By the end of the chapter, meals you add will persist, and the add/edit/delete flows you built in Chapter 9 will work exactly as they do now — but with real durability underneath. The repository protocol you've been programming against makes the swap nearly invisible to feature code.

  
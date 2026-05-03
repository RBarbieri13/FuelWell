# Chapter 18: Analytics, Observability & Feature Flags

*"The day after launch, you have one job: know what happened. Without instrumentation, every user complaint is a guess."*

## Learning Objectives

By the end of this chapter you will be able to:

  

1.  Wire PostHog for event analytics, A/B experiments, and product feature flags.
2.  Wire Sentry for crash and error reporting, with the MCP server that lets Claude Code triage incidents.
3.  Implement a server-enforced kill-switch for AI features using a Supabase row + 30-second cache.
4.  Design an event taxonomy that survives team changes and product pivots.
5.  Make all telemetry opt-in by default, with a single setting users can flip.
6.  Tie the analytics layer to TCA via dependency injection so feature code stays clean.

## Prerequisites

  - Chapters 1–17 complete.
  - TestFlight pipeline ships builds successfully.
  - Supabase project provisioned (Chapter 10) with API keys.
  - A free Sentry account (sentry.io).
  - Your PostHog account from Chapter 10's research (free tier — 1M events/month).

  

## 18.1 The Three Pillars

Production observability has three jobs, each handled by a different tool:

  

flowchart LR

  

    subgraph What\["What happened?"\]

  

        PH\[PostHog\<br/\>events, funnels,\<br/\>retention\]

  

    end

  

    subgraph Why\["Why did it break?"\]

  

        SE\[Sentry\<br/\>crashes, errors,\<br/\>release tracking\]

  

    end

  

    subgraph Stop\["Stop the bleeding"\]

  

        KS\[Kill-switch\<br/\>Supabase row,\<br/\>server-enforced\]

  

    end

  

    User\[User session\] --\> PH

  

    User --\> SE

  

    PH --\>|signal| Stop

  

    SE --\>|signal| Stop

  

PostHog tells you **what** users are doing — which screens, which actions, which features convert. Sentry tells you **why** something broke — stack traces, breadcrumbs, release tagging. The kill-switch is **how** you stop the bleeding when telemetry surfaces a problem you can't ship a fix for in time.

  

**Decision point** — the Reconciliation Matrix **Feature flags** row is the only Medium-confidence row in the whole stack. The reasoning: PostHog's product flags are great for experiments but are a single point of failure for safety. Critical AI kill-switches need an independent failure domain. So we build two systems, not one.

  

## 18.2 The Event Taxonomy

Before any code, design the taxonomy. Bad event names ("button\_clicked", "screen\_view") give you data you can't analyze. Good event names follow a consistent **object\_action** pattern:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Event\*\* | \*\*When fired\*\* | \*\*Properties\*\* |
| meal\\\_logged | After save succeeds | calories, source (manual / search / scan), time\\\_of\\\_day |
| meal\\\_deleted | After delete succeeds | entry\\\_age\\\_seconds (how long it had existed) |
| meal\\\_edited | After edit save succeeds | fields\\\_changed |
| food\\\_search\\\_performed | When user submits a query | query\\\_length, result\\\_count |
| dashboard\\\_viewed | On dashboard tab activation | time\\\_since\\\_last\\\_view\\\_s |
| workout\\\_synced | When HealthKit fetch completes | workout\\\_count, days\\\_back |
| feature\\\_flag\\\_evaluated | When a flag is read | flag, variant |
| ai\\\_meal\\\_plan\\\_generated | When AI returns | prompt\\\_tokens, latency\\\_ms, cost\\\_estimate |
| error\\\_shown | Any user-facing error toast | error\\\_code, screen |

  

The discipline:

  

  - **Object\_action.** Subject first, verb second. meal\_logged, not log\_meal.
  - **Past tense.** Events are things that happened, not commands. viewed, not view.
  - **Properties carry context, not the event name.** Don't make meal\_logged\_via\_search a separate event from meal\_logged\_via\_scan. Use source as a property.
  - **No PII in property values.** "Greek Yogurt Bowl" is a meal name and could be PII-adjacent for some users. Hash it or omit it. Counts and categories are fine.

  

This taxonomy lives in code, not spreadsheets. Define it once as a Swift type and the compiler enforces it.

  

## 18.3 The Analytics Protocol

Following the dependency-injection pattern from Chapter 13, create a protocol the rest of the app talks to:

  

// Packages/Core/Sources/Core/Analytics/Analytics.swift

  

import Foundation

  

public protocol Analytics: Sendable {

  

    func identify(userID: String, traits: \[String: AnalyticsValue\]) async

  

    func track(\_ event: AnalyticsEvent) async

  

    func reset() async

  

}

  

public enum AnalyticsValue: Sendable, Equatable {

  

    case string(String)

  

    case int(Int)

  

    case double(Double)

  

    case bool(Bool)

  

}

  

public struct AnalyticsEvent: Sendable, Equatable {

  

    public let name: String

  

    public let properties: \[String: AnalyticsValue\]

  

    public init(name: String, properties: \[String: AnalyticsValue\] = \[:\]) {

  

        self.name = name

  

        self.properties = properties

  

    }

  

}

  

// Strongly-typed factories — the actual taxonomy.

  

public extension AnalyticsEvent {

  

    static func mealLogged(calories: Int, source: MealSource, hour: Int) -\> Self {

  

        .init(name: "meal\_logged", properties: \[

  

            "calories": .int(calories),

  

            "source": .string(source.rawValue),

  

            "time\_of\_day": .string(timeBucket(hour))

  

        \])

  

    }

  

    static func mealDeleted(entryAgeSeconds: Int) -\> Self {

  

        .init(name: "meal\_deleted", properties: \[

  

            "entry\_age\_seconds": .int(entryAgeSeconds)

  

        \])

  

    }

  

    static func dashboardViewed(timeSinceLastViewSeconds: Int?) -\> Self {

  

        var props: \[String: AnalyticsValue\] = \[:\]

  

        if let t = timeSinceLastViewSeconds {

  

            props\["time\_since\_last\_view\_s"\] = .int(t)

  

        }

  

        return .init(name: "dashboard\_viewed", properties: props)

  

    }

  

    static func errorShown(code: String, screen: String) -\> Self {

  

        .init(name: "error\_shown", properties: \[

  

            "error\_code": .string(code),

  

            "screen": .string(screen)

  

        \])

  

    }

  

    private static func timeBucket(\_ hour: Int) -\> String {

  

        switch hour {

  

        case 5..\<11: return "morning"

  

        case 11..\<14: return "midday"

  

        case 14..\<17: return "afternoon"

  

        case 17..\<21: return "evening"

  

        default: return "night"

  

        }

  

    }

  

}

  

public enum MealSource: String, Sendable {

  

    case manual

  

    case search

  

    case scan

  

    case ai

  

}

  

The factory methods are the taxonomy as code. A reducer can't accidentally call .track(.init(name: "meal\_loged")) with a typo — there's no such factory. The compiler catches drift.

  

## 18.4 The PostHog Implementation

Add the SDK. Update Packages/Core/Package.swift:

  

.package(url: "https://github.com/PostHog/posthog-ios", from: "3.20.0"),

  

And the Core target dependencies:

  

.product(name: "PostHog", package: "posthog-ios"),

  

Create the live client:

  

// Packages/Core/Sources/Core/Analytics/PostHogAnalytics.swift

  

import Foundation

  

import PostHog

  

public actor PostHogAnalytics: Analytics {

  

    private let posthog: PostHogSDK

  

    public init(apiKey: String, host: String = "https://us.i.posthog.com") {

  

        let config = PostHogConfig(apiKey: apiKey, host: host)

  

        config.captureApplicationLifecycleEvents = false  // we control this

  

        config.captureScreenViews = false                  // ditto

  

        config.flushAt = 20                                // batch events

  

        config.flushIntervalSeconds = 30

  

        self.posthog = PostHogSDK.with(config)

  

    }

  

    public func identify(userID: String, traits: \[String: AnalyticsValue\]) async {

  

        posthog.identify(userID, userProperties: traits.toAnyDict())

  

    }

  

    public func track(\_ event: AnalyticsEvent) async {

  

        posthog.capture(event.name, properties: event.properties.toAnyDict())

  

    }

  

    public func reset() async {

  

        posthog.reset()

  

    }

  

}

  

private extension Dictionary where Key == String, Value == AnalyticsValue {

  

    func toAnyDict() -\> \[String: Any\] {

  

        Dictionary\<String, Any\>(uniqueKeysWithValues: map { key, value in

  

            switch value {

  

            case .string(let s): return (key, s)

  

            case .int(let i): return (key, i)

  

            case .double(let d): return (key, d)

  

            case .bool(let b): return (key, b)

  

            }

  

        })

  

    }

  

}

  

A test stub that records what was tracked:

  

// Packages/Core/Sources/Core/Analytics/StubAnalytics.swift

  

public actor StubAnalytics: Analytics {

  

    public private(set) var trackedEvents: \[AnalyticsEvent\] = \[\]

  

    public private(set) var identifiedAs: String?

  

    public init() {}

  

    public func identify(userID: String, traits: \[String: AnalyticsValue\]) async {

  

        identifiedAs = userID

  

    }

  

    public func track(\_ event: AnalyticsEvent) async {

  

        trackedEvents.append(event)

  

    }

  

    public func reset() async {

  

        trackedEvents.removeAll()

  

        identifiedAs = nil

  

    }

  

}

  

Register the dependency:

  

// Packages/Core/Sources/Core/Dependencies/AnalyticsDependency.swift

  

import Dependencies

  

extension DependencyValues {

  

    public var analytics: any Analytics {

  

        get { self\[AnalyticsKey.self\] }

  

        set { self\[AnalyticsKey.self\] = newValue }

  

    }

  

}

  

private enum AnalyticsKey: DependencyKey {

  

    public static var liveValue: any Analytics {

  

        unimplemented("Analytics", placeholder: StubAnalytics())

  

    }

  

    public static var testValue: any Analytics { StubAnalytics() }

  

    public static var previewValue: any Analytics { StubAnalytics() }

  

}

  

Wire it in FuelWellApp.init:

  

$0.analytics = PostHogAnalytics(apiKey: LocalConfig.posthogKey)

  

## 18.5 Calling Analytics From Reducers

Now the actual usage. Update DailyLogFeature to track meal-deletion events:

  

@Dependency(\\.analytics) var analytics

  

@Dependency(\\.date.now) var now

  

case let .deleteSwiped(id):

  

    let entry = state.entries.first { $0.id == id }

  

    let entryAge = entry.map { Int(now.timeIntervalSince($0.loggedAt)) } ?? 0

  

    state.entries.removeAll { $0.id == id }

  

    return .run { \[analytics, repository\] \_ in

  

        try await repository.delete(id: id)

  

        await analytics.track(.mealDeleted(entryAgeSeconds: entryAge))

  

    }

  

Two principles in three lines:

  

1.  **Compute the analytics property from state, not from the action.** The age is "how long had this meal existed" — knowable only at delete time, before the entry vanishes.
2.  **Track inside the effect, not inline.** Analytics is a side effect. It belongs in .run, not in the synchronous reducer body.

  

A reducer test now needs to verify the analytics call:

  

@Test

  

func deleteSwipe\_tracksMealDeletedEvent() async {

  

    let analytics = StubAnalytics()

  

    let store = TestStore(initialState: stateWithMock()) {

  

        DailyLogFeature()

  

    } withDependencies: {

  

        $0.analytics = analytics

  

        $0.nutritionRepository = InMemoryNutritionRepository(seed: \[.mock\])

  

    }

  

    await store.send(.deleteSwiped(id: MealEntry.mock.id)) {

  

        $0.entries = \[\]

  

    }

  

    await Task.yield()

  

    let events = await analytics.trackedEvents

  

    \#expect(events.count == 1)

  

    \#expect(events.first?.name == "meal\_deleted")

  

}

  

The stub's trackedEvents is the assertion surface. No real network calls; deterministic.

  

## 18.6 Sentry: Crash and Error Reporting

Sentry handles the "why did it break" half. Add the SDK to Core:

  

.package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.40.0"),

  

// And in target dependencies:

  

.product(name: "Sentry", package: "sentry-cocoa"),

  

Create the wrapper:

  

// Packages/Core/Sources/Core/CrashReporting/CrashReporter.swift

  

import Foundation

  

public protocol CrashReporter: Sendable {

  

    func capture(error: Error, context: \[String: String\]) async

  

    func captureMessage(\_ message: String, level: CrashLevel) async

  

    func setUser(id: String?) async

  

    func addBreadcrumb(\_ message: String, category: String) async

  

}

  

public enum CrashLevel: String, Sendable {

  

    case debug, info, warning, error, fatal

  

}

  

// Packages/Core/Sources/Core/CrashReporting/SentryCrashReporter.swift

  

import Foundation

  

import Sentry

  

public actor SentryCrashReporter: CrashReporter {

  

    public init(dsn: String, releaseName: String, environment: String) {

  

        SentrySDK.start { options in

  

            options.dsn = dsn

  

            options.releaseName = releaseName

  

            options.environment = environment

  

            options.tracesSampleRate = 0.1   // 10% transaction sampling

  

            options.attachStacktrace = true

  

            options.enableUserInteractionTracing = false  // privacy

  

        }

  

    }

  

    public func capture(error: Error, context: \[String: String\]) async {

  

        SentrySDK.capture(error: error) { scope in

  

            for (key, value) in context {

  

                scope.setTag(value: value, key: key)

  

            }

  

        }

  

    }

  

    public func captureMessage(\_ message: String, level: CrashLevel) async {

  

        SentrySDK.capture(message: message) { scope in

  

            scope.setLevel(SentryLevel(rawValue: level.rawValue.capitalized) ?? .error)

  

        }

  

    }

  

    public func setUser(id: String?) async {

  

        if let id {

  

            let user = User()

  

            user.userId = id

  

            SentrySDK.setUser(user)

  

        } else {

  

            SentrySDK.setUser(nil)

  

        }

  

    }

  

    public func addBreadcrumb(\_ message: String, category: String) async {

  

        let crumb = Breadcrumb()

  

        crumb.message = message

  

        crumb.category = category

  

        SentrySDK.addBreadcrumb(crumb)

  

    }

  

}

  

Wire it the same way as analytics: register a dependency key, instantiate in FuelWellApp.init. The release name should match the version Fastlane uploaded (Chapter 17's pipeline already uploads dSYMs tagged with the version, so Sentry can symbolicate stack traces).

### Adding context where it matters

The crash reporter is most useful when caught errors include enough context to debug:

  

case let .loadFailed(message):

  

    state.isLoading = false

  

    state.errorMessage = message

  

    return .run { \[crashReporter\] \_ in

  

        await crashReporter.capture(

  

            error: NSError(domain: "DailyLog", code: 1,

  

                           userInfo: \[NSLocalizedDescriptionKey: message\]),

  

            context: \["screen": "daily\_log", "action": "load"\]

  

        )

  

    }

  

This pattern — capture-with-context inside an effect — sends caught errors to Sentry without leaking sensitive data into stack traces.

### The Sentry MCP integration

Per the Reconciliation Matrix's crash-reporting reasoning, Sentry's standout feature for our workflow is its MCP server. After Chapter 3 wired XcodeBuildMCP, you can also wire the Sentry MCP server:

  

claude mcp add sentry \\

  

  -s user \\

  

  -e SENTRY\_AUTH\_TOKEN=\<token\> \\

  

  -e SENTRY\_ORG=your-org \\

  

  -- npx -y @sentry/mcp-server@latest

  

Now in Claude Code you can ask:

  

Pull the last 24 hours of crashes from Sentry. Summarize the top

  

three by frequency. For the most common, show the stack trace and

  

suggest where in the code the bug likely lives.

  

The agent fetches Sentry data via MCP, correlates against your codebase, and proposes a fix. This is where the "AI-first" stack actually pays off in production — debugging becomes a conversation with context, not an exercise in dashboard-spelunking.

  

## 18.7 PostHog Feature Flags

PostHog's flags are good for experiments and gradual rollouts. Wrap them similarly:

  

// Packages/Core/Sources/Core/FeatureFlags/FeatureFlags.swift

  

public protocol FeatureFlags: Sendable {

  

    func isEnabled(\_ key: FeatureFlagKey) async -\> Bool

  

    func variant(\_ key: FeatureFlagKey) async -\> String?

  

}

  

public enum FeatureFlagKey: String, Sendable, CaseIterable {

  

    case newOnboarding = "new\_onboarding"

  

    case workoutAIRecommendations = "workout\_ai\_recommendations"

  

    case darkModeDefault = "dark\_mode\_default"

  

    case dashboardV2 = "dashboard\_v2"

  

}

  

public actor PostHogFeatureFlags: FeatureFlags {

  

    public init() {}

  

    public func isEnabled(\_ key: FeatureFlagKey) async -\> Bool {

  

        PostHogSDK.shared.isFeatureEnabled(key.rawValue)

  

    }

  

    public func variant(\_ key: FeatureFlagKey) async -\> String? {

  

        PostHogSDK.shared.getFeatureFlag(key.rawValue) as? String

  

    }

  

}

  

The enum is the central registry. Adding a new flag requires touching this file, which means flags don't proliferate without intent.

  

Use in a reducer:

  

@Dependency(\\.featureFlags) var flags

  

case .onboardingStarted:

  

    return .run { \[flags\] send in

  

        let isNew = await flags.isEnabled(.newOnboarding)

  

        await send(.onboardingPathDecided(isNew ? .v2 : .v1))

  

    }

  

PostHog handles the rollout: 10% of users see .v2, 90% see .v1. You change the percentages from the PostHog dashboard without shipping.

  

**⚠️ Common Pitfall — Feature flags as silent forks**

  

Every flag is a code path that must be maintained. Three months after launching a flag at 100% rollout, delete the flag and the dead code path. Flags that linger become toxic complexity.

  

## 18.8 The Kill-Switch — Why and How

PostHog flags are great for product experiments. They are not great for safety. Two reasons:

  

1.  **Single point of failure.** If PostHog has an outage or your client's feature-flag fetch fails, the cached value (or default) ships. For a "show or hide a button" flag, fine. For "is this AI-generated meal plan safe to display," catastrophic.
2.  **Client-evaluated.** PostHog evaluates flags in the client SDK. A determined user could intercept the response and override.

  

For AI-generated content — meal plans, workout recommendations, anything where bad output could harm a user — we need server-enforced kill-switches with an independent failure domain.

  

The design:

  

flowchart LR

  

    Client\[iOS Client\] --\>|request| EdgeFn\[Supabase Edge Function\]

  

    EdgeFn --\>|read| FlagsTable\[(feature\_flags table)\]

  

    FlagsTable --\>|enabled?| EdgeFn

  

    EdgeFn --\>|enabled| Anthropic\[Anthropic API\]

  

    EdgeFn -.disabled.-\> Reject\[Reject 503\]

  

    Admin\[You with SQL console\] --\>|UPDATE| FlagsTable

  

The flow:

  

  - Client requests an AI feature (meal plan generation, workout suggestion).
  - Request goes to a Supabase Edge Function.
  - Edge Function checks the feature\_flags Postgres table.
  - If enabled = false, the Edge Function returns 503 with a friendly message.
  - If enabled = true, the Edge Function calls Anthropic and returns the result.

  

When a problem surfaces — Sentry alerts on AI-generated content quality, or a user reports a bad meal plan — you UPDATE feature\_flags SET enabled = false WHERE name = 'ai\_meal\_plan' from the Supabase SQL console. **Within 30 seconds** (next cache TTL), every client stops getting the feature. No deploy. No app update. No app review delay.

### The Postgres table

In Supabase, run:

  

CREATE TABLE feature\_flags (

  

    name TEXT PRIMARY KEY,

  

    enabled BOOLEAN NOT NULL DEFAULT TRUE,

  

    description TEXT,

  

    updated\_at TIMESTAMPTZ DEFAULT NOW()

  

);

  

INSERT INTO feature\_flags (name, enabled, description) VALUES

  

  ('ai\_meal\_plan', true, 'Anthropic-powered meal plan generation'),

  

  ('ai\_workout\_suggestion', true, 'Anthropic-powered workout suggestions');

  

\-- RLS policy: anyone can read; only the service role can write.

  

ALTER TABLE feature\_flags ENABLE ROW LEVEL SECURITY;

  

CREATE POLICY "anyone can read feature flags"

  

    ON feature\_flags FOR SELECT USING (true);

### The Edge Function (sketch)

// supabase/functions/generate\_meal\_plan/index.ts

  

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

  

Deno.serve(async (req) =\> {

  

  const supabase = createClient(

  

    Deno.env.get('SUPABASE\_URL')\!,

  

    Deno.env.get('SUPABASE\_SERVICE\_ROLE\_KEY')\!

  

  )

  

  // Server-side check.

  

  const { data: flag } = await supabase

  

    .from('feature\_flags')

  

    .select('enabled')

  

    .eq('name', 'ai\_meal\_plan')

  

    .single()

  

  if (\!flag?.enabled) {

  

    return new Response(JSON.stringify({

  

      error: 'feature\_disabled',

  

      message: 'This feature is temporarily unavailable.'

  

    }), { status: 503 })

  

  }

  

  // ... call Anthropic API and return the result

  

})

  

The full Edge Function deployment is beyond this chapter's scope; the principle is what matters. Server enforcement = client cannot bypass.

### The client side

The client treats a 503 with error: "feature\_disabled" as a feature-unavailable signal:

  

case .generateMealPlanTapped:

  

    return .run { \[apiClient\] send in

  

        do {

  

            let plan = try await apiClient.send(GenerateMealPlanRequest())

  

            await send(.mealPlanReceived(.success(plan)))

  

        } catch let error as APIError {

  

            switch error {

  

            case .http(503, let body) where body?.contains("feature\_disabled") == true:

  

                await send(.mealPlanReceived(.failure(.unavailable)))

  

            default:

  

                await send(.mealPlanReceived(.failure(.api(error))))

  

            }

  

        }

  

    }

  

When the feature is killed, users see a friendly "temporarily unavailable" message. They don't see broken UI. They don't see weird AI output. The kill is graceful.

  

## 18.9 Privacy and Consent

By default, all telemetry is **off** for new users until they opt in. A minimal settings screen with a single toggle:

  

// In a Settings reducer:

  

case .telemetryToggled(let enabled):

  

    state.telemetryEnabled = enabled

  

    return .run { \[analytics, crashReporter\] \_ in

  

        if enabled {

  

            // SDKs were initialized but no events captured yet.

  

            // Now allow them to send.

  

            await PostHogSDK.shared.optIn()

  

            SentrySDK.startSession()

  

        } else {

  

            await PostHogSDK.shared.optOut()

  

            SentrySDK.endSession()

  

        }

  

    }

  

This is more than legally compliant — it's the right default for trust. Apps that aggressively collect data the user didn't agree to lose users when they notice.

  

For App Store Review and the privacy manifest (Chapter 19 covers the full manifest), document this opt-in default in your privacy policy. It's a strong story to tell.

  

## 18.10 The Production Dashboard

Once events flow, build three PostHog dashboards:

  

**1. Health dashboard.** Crash-free user rate (target \>99.5%), top 3 errors, P95 launch time, daily active users. Glance at this every morning.

  

**2. Funnel dashboard.** Onboarding completion, first meal logged, return on day 2 / day 7. Tells you if growth changes are working.

  

**3. Feature dashboard.** Per major feature: usage frequency, error rate, the relevant business metric (meals logged per week, AI plans generated per week). Tells you what's worth investing in.

  

These are 30 minutes to set up in PostHog and they pay for themselves the first time you spot a regression in the morning before users start complaining.

  

## Common Pitfalls Summary

|  |  |
| :-: | :-: |
| \*\*Pitfall\*\* | \*\*Fix\*\* |
| Free-text event names sprinkled across reducers | Strongly-typed factories on AnalyticsEvent |
| PII in event property values (names, emails, full meal text) | Hash, bucket, or omit |
| Tracking before user opt-in | Default to off; flip on consent |
| PostHog flag for safety-critical kills | Use the server-enforced Supabase kill-switch |
| Sentry dSYMs not uploaded | Chapter 17's release lane handles it; CI must fail on miss |
| Kill-switch checked only client-side | Determined users bypass; check in the Edge Function |
| Long-lived feature flags | Delete after rollout completes; flags are debt |
| One-off analytics calls in views | Keep all analytics in reducers via @Dependency(\\\\.analytics) |

  

## Hands-On Exercise

**Goal:** ship a fully instrumented v0.2.0 with analytics, crash reporting, and a working kill-switch.

  

1.  **Wire PostHog and Sentry.** Add the SDKs, build the protocol/live/stub trio for each, register dependencies, instantiate in FuelWellApp.init. Use LocalConfig for keys (never commit them).

  

1.  **Instrument the existing reducers.** Add analytics.track calls for at least:

  

  - meal\_logged (in AddMealFeature)
  - meal\_deleted (in DailyLogFeature)
  - dashboard\_viewed (in DashboardFeature)
  - food\_search\_performed (in FoodSearchFeature)
  - error\_shown (anywhere errorMessage is set)

  

1.  **Update tests.** For each reducer with new analytics calls, add a StubAnalytics-based assertion that the right event was tracked.

  

1.  **Set up the Sentry MCP** per §18.6. Verify by asking Claude Code to summarize recent crashes (there shouldn't be any yet — that's fine; the test is whether the data path works).

  

1.  **Build the kill-switch infrastructure.**

  

  - Run the SQL in §18.8 against your Supabase project.
  - Deploy a minimal generate\_meal\_plan Edge Function that just checks the flag and returns 200 with stubbed content if enabled, 503 if disabled.
  - Add a TestFlight-only "Generate AI Meal Plan" button to the Dashboard wired to this endpoint.
  - From the Supabase SQL console, toggle the flag and verify the client behavior changes within 30 seconds.

  

1.  **Add the consent toggle.** Build a minimal Settings screen with one toggle that opts in/out of all telemetry. Default: off. Store in UserDefaults.

  

1.  **Configure three PostHog dashboards** per §18.10.

  

1.  **Tag and ship v0.2.0:**

  

git tag v0.2.0

  

git push origin v0.2.0

  

Watch the GitHub Actions release run, install via TestFlight, generate a few events, verify they appear in PostHog within a minute.

  

1.  **Commit the code:**

  

git add .

  

git commit -m "Chapter 18: PostHog + Sentry + Supabase kill-switch + consent"

  

git push

  

**Time budget:** 4 hours. The Edge Function deployment is the new piece — Supabase's CLI is straightforward but takes a try or two to get right. Once it's working, copying the pattern for new AI features is fast.

  

## What's Next

Chapter 19 — **Privacy, HealthKit & App Store Submission** — is the chapter that gets v1.0 actually approved by Apple. You'll fill out the PrivacyInfo.xcprivacy manifest, write HealthKit usage strings that App Review accepts, navigate the App Tracking Transparency framework, and walk through the actual App Store Connect listing flow with Fastlane deliver automating metadata uploads. By the end you'll be ready to submit FuelWell for review.

  
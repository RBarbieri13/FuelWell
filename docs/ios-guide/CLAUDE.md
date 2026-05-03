# FuelWell — CLAUDE.md

You are working on FuelWell, a production iOS app for nutrition tracking and real-time decision-making. This file is your constant context. Read all of it before acting on any non-trivial request.

## Stack

- Swift 6 with Strict Concurrency, ExistentialAny enabled package-wide
- iOS 17 deployment target, iOS 18 SDK, Xcode 26
- TCA (Composable Architecture) 1.17+ for state management
- swift-dependencies for DI
- TCACoordinators for navigation
- SQLiteData for persistence (CloudKit sync via SQLiteData CK integration)
- URLSession + custom LiveAPIClient (no Alamofire / Moya)
- Supabase for backend (auth, edge functions, feature_flags table)
- Swift Testing + swift-snapshot-testing for tests

## Architecture

- Features live in `Features/<Name>` as SPM packages
- Infrastructure lives in `Packages/<Name>` as SPM packages
- Features import Packages. Features never import Features. Packages never import Features. The CI script `scripts/check-feature-imports.sh` enforces this.
- Every feature has a `<Name>Feature` reducer that is `@MainActor`
- Every dependency has a `liveValue`, a `testValue`, and a `previewValue`
- `liveValue` defaults to `unimplemented(...)` until the live impl is registered at app launch via `prepareDependencies`

## AI design loop

- `docs/DESIGN.md` is the canonical source of truth for design tokens, components, and brand. The Swift Theme struct in `Packages/DesignSystem` is generated from it.
- When the user describes a new screen, ask whether they have a Claude Design mockup. If yes, implement against the mockup. If no, suggest generating one with Claude Design first.
- For non-UI assets (empty states, onboarding heroes, App Store images), defer to ChatGPT Images 2.0 — don't try to draw them in SwiftUI.

## Conventions

- All public types have explicit `public init`
- All `@Reducer` types have a `public init() {}`
- Views never own data — they receive a scoped store
- No `@ObservedObject`, no `@StateObject` — `@Bindable var store: StoreOf<X>` only
- Every color, font, and spacing value goes through `@Environment(\.theme)`, never hardcoded
- Test files use Swift Testing (`@Test`), not XCTest, except for XCUITests

## Forbidden

- Adding any networking library other than URLSession
- Adding any persistence library other than SQLiteData
- Mutating state outside a reducer
- Direct Feature → Feature imports
- Hardcoded colors / fonts / spacing in view code
- "Just for now" hacks without a TODO and a corresponding entry in `docs/decisions.md`

## When unsure

- The Reconciliation Matrix is `docs/reconciliation-matrix.md` — open it
- The Consensus Stack is `docs/consensus-stack.md` — open it
- The decisions log is `docs/decisions.md` — every deviation is written here
- The full guide chapters are in `docs/chapters/` — read the relevant chapter before making large changes to that area

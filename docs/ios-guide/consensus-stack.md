# FuelWell Consensus Stack

*The one-page commitment list. April 2026 edition.*

This document is the source of truth for "what FuelWell is built with." Every choice here is the recommendation from the Reconciliation Matrix at High confidence. Open it before adding a dependency, before reaching for an alternative, and before any architecture decision.

## Language & Concurrency

- **Swift 6** with Strict Concurrency Checking, ExistentialAny, Approachable Concurrency upcoming features enabled package-wide
- **iOS 17.0** deployment target
- **Xcode 26** with the iOS 18 SDK

## Architecture

- **The Composable Architecture (TCA) 1.17+** by Point-Free
- **swift-dependencies** for dependency injection
- **TCACoordinators** for navigation stack management
- Module topology: `Features/` (product features) + `Packages/` (infrastructure)
- Feature isolation enforced at the SPM level — features import packages, never each other

## UI

- **SwiftUI** with `@Bindable var store: StoreOf<X>` — no `@ObservedObject`, no `@StateObject`
- **NavigationStack** + StackState for navigation
- **`@Environment(.theme)`** for all colors, typography, spacing
- Components live in `Packages/DesignSystem`; screens live in `Features/*`

## Data & Persistence

- **SQLiteData** by Point-Free for local persistence
- **CloudKit** for cross-device sync via SQLiteData's CloudKit integration
- **HealthKit** wrapped in a LiveHealthKitClient actor behind a protocol
- **Supabase** for backend services and the kill-switch infrastructure

## Networking

- **URLSession** wrapped in a custom LiveAPIClient actor
- **Anthropic API** for AI features, gated behind a server-side kill-switch
- No third-party networking libraries

## Tooling

- **Claude Code** as the primary AI development agent
- **Cursor** or **Xcode** as the editor (developer choice; Claude Code is the constant)
- **CLAUDE.md** at the repo root as Claude Code's instruction set

## AI Design Tooling *(new April 2026)*

The April 2026 design tooling shift introduced four products that change how visuals enter an iOS codebase. The recommendation is to treat them as a layered system, not as alternatives.

### The contract layer

- **DESIGN.md** at `docs/DESIGN.md` is the canonical source of truth for the design system. Open-source format from Google Labs (Apache 2.0). Cross-tool: Claude Code, Claude Design, ChatGPT Images 2.0, Figma for Agents — every AI agent in the loop reads the same file.
- The Swift `Theme` struct in `Packages/DesignSystem` is a *generated artifact* of `DESIGN.md`, not a hand-maintained source. Drift between the two is a CI failure.

### The visual loop

- **Claude Design** (Anthropic Labs, in research preview as of April 17, 2026) is the primary tool for prototypes, decision-supporting mockups, brand-consistent marketing visuals, App Store assets, and pitch decks. It reads the codebase and DESIGN.md, outputs three variations by default, exports to PDF / URL / PPTX / Canva. Included in the Claude Pro / Max / Team / Enterprise subscriptions you already pay for.
- For solo developers who aren't Swift-fluent, this is the "see it before you build it" loop. Generate the screen, evaluate it, then ask Claude Code to implement what was approved.

### The asset generator

- **ChatGPT Images 2.0** (gpt-image-2, released April 21, 2026) is the asset generator for everything that isn't a UI screen — empty-state illustrations, onboarding hero graphics, App Store screenshots, and marketing imagery. Thinking mode for considered output. 2K resolution for retina assets. 99% multilingual accuracy for international screenshots without manual localization rework.

### The handoff layer (when Figma is in the loop)

- **Figma for Agents** (April 14, 2026, free during beta) gets installed as an MCP server when the project enters a phase that involves Figma — typically App Store screenshots with multiple device frames, or marketing site work. Solo developers without an existing Figma practice can skip this without penalty.

### The hierarchy

Claude Code writes the code. Claude Design creates the visuals. ChatGPT Images 2.0 generates assets. DESIGN.md is the contract between them.

Read this as the lifecycle:

1. Open DESIGN.md → it tells every agent what the brand and system look like
2. Generate visuals with Claude Design → the agent knows your tokens, components, and patterns
3. Fill in non-UI assets with ChatGPT Images 2.0 → empty states, marketing
4. Hand off to Claude Code → it implements against the same DESIGN.md the visuals came from

## Quality

- **Swift Testing** (`@Test`) over XCTest for new tests
- **swift-snapshot-testing** for the Component Gallery
- **swift-dependencies** test helpers (TestStore, withDependencies)
- **SwiftLint** in `--strict` mode in CI

## CI/CD

- **GitHub Actions** with macos-15 runners
- **Fastlane** with match for code signing, lanes for test, beta, release
- **Sentry** for crash reporting; **PostHog** for product analytics
- App Store Connect API key authentication (no manual passwords)

## Privacy & Compliance

- **PrivacyInfo.xcprivacy** declares all collected data types
- All `NS*UsageDescription` strings name the data, the use, and the protections
- AI features behind server-side kill-switches in Supabase `feature_flags`
- Phased rollout enabled for every App Store release

## What is *not* in the stack

These were considered and rejected. The rationale is in `reconciliation-matrix.md` and `contested-choices.md`.

- **UIKit** — except where SwiftUI requires a UIViewRepresentable bridge
- **Combine** — replaced by async/await end-to-end
- **Realm** / **Core Data** — replaced by SQLiteData
- **Alamofire** / **Moya** — URLSession is sufficient
- **RxSwift** — async/await replaces it; Observable replaces ObservableObject
- **MVVM as the architecture name** — the architecture is TCA; "view model" is not a term in the codebase

### What is *not* in the AI design layer

- **Wonder** — strong tool, but Claude Design covers the same workflow with deeper codebase integration. Re-evaluate at v1.5.
- **Magic Patterns Agent 2.0** — designed for teams with complex pre-existing component libraries. FuelWell builds its component library from scratch via DESIGN.md, so the value is lower.
- **Canva AI 2.0** — useful for marketing assets late in the launch cycle, but Claude Design + ChatGPT Images 2.0 covers the same ground without a second subscription.
- **UXPin Forge** — production-ready React JSX export is the killer feature, irrelevant for a Swift codebase.
- **Lovable mobile** / **Softr** — full-stack web app builders, not iOS-relevant.
- **Google Stitch** — generates DESIGN.md, which is useful, but the canvas-first workflow is optimized for designers and Claude Design covers the developer-first path better.

## When this document changes

This file is rewritten only when the Reconciliation Matrix changes a High-confidence row to a different recommendation. Adding a library, framework, or AI tool to the FuelWell project that contradicts this document requires:

1. An entry in `docs/decisions.md` explaining the deviation
2. An updated row in `reconciliation-matrix.md` if the deviation is permanent
3. A re-read of `contested-choices.md` to make sure the new choice doesn't reintroduce a contested-choices problem

If the deviation is temporary (a spike, a proof of concept, an experiment), the entry in `decisions.md` includes a sunset date.

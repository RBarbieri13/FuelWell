# FuelWell — Master Plan

**Date drafted:** 2026-05-03
**Status:** Living document. Updated as Gap Analysis decisions are made and chapters are referenced in implementation.
**Owners:** Robert (build) + Max (product/business)

This is the binding plan for building the FuelWell iOS app to Pilot, Founding 100, and Public launch. It supersedes `docs/FuelWell-Phase-Plan.md` (which remains as the simpler partner-facing summary).

---

## Foundational principles

These are non-negotiable. They come from three sources we've already aligned on.

### 1. Product framing — from the Inspiration Guide (CTO Version)

> FuelWell is **not** a tracking app, **not** a workout app, **not** a nutrition planner. FuelWell is a **real-time decision system** that removes the need for users to constantly figure out what to do.

Every screen, every reducer, every API response answers **"what should I do right now?"** before it answers "here is some data." If a screen only shows numbers, it is wrong. This becomes `ios/PRINCIPLES.md` and is the first thing referenced in code review.

### 2. Stack — from the iOS Production Guide

The Consensus Stack (`docs/ios-guide/consensus-stack.md`) is locked. No deviations without an entry in `docs/ios-guide/decisions.md`.

| Layer | Choice |
|---|---|
| Language | Swift 6, Strict Concurrency, ExistentialAny package-wide |
| Target | iOS 17 deployment, iOS 18 SDK, Xcode 26 |
| Architecture | TCA 1.17+ + swift-dependencies + TCACoordinators |
| UI | SwiftUI, `@Bindable var store: StoreOf<X>`, `@Environment(\.theme)` |
| Persistence | SQLiteData + CloudKit sync |
| Backend | Supabase (auth, edge functions, RLS, `feature_flags`) |
| AI | Anthropic API via custom `LiveAPIClient`, server-side kill-switch |
| Networking | URLSession only |
| Testing | Swift Testing + swift-snapshot-testing |
| CI/CD | GitHub Actions (macos-15) + Fastlane + match |
| Crash / Analytics | Sentry + PostHog |
| Design contract | `docs/DESIGN.md` canonical; `Theme.swift` is a generated artifact |
| AI tooling | Claude Code (build) + Claude Design (visuals) + ChatGPT Images 2.0 (assets) |

### 3. Scope — what ships at Pilot

All seven features. No tier gating. Real database, real backend, real function. Pilot users are paying Founders 100 candidates; the app must hold up.

The seven:
1. **Macro tracking** — log meal → instant "are you on track?" verdict
2. **AI coaching chat** — context-aware, has memory of user's day
3. **Proactive coaching** — push notifications triggered by user state
4. **Restaurant guidance** — "what should I order here?"
5. **Recipe suggestions** — "what should I cook tonight given what's left?"
6. **Grocery lists** — generated from selected recipes + staples
7. **Progress tracking** — trend + projection + next action

---

## Repo layout

This is a monorepo. The marketing site (Next.js) stays at the root. The iOS app gets its own subtree.

```
FuelWell/
├── src/                      # Next.js marketing site (existing)
├── public/                   # Marketing site assets
├── docs/
│   ├── MASTER-PLAN.md                  # this file
│   ├── FuelWell-Gap-Analysis.{md,pdf}  # for Robert + Max
│   ├── FuelWell-Phase-Plan.{md,pdf}    # partner-facing summary
│   └── ios-guide/                      # the iOS production guide (read by Claude Code)
│       ├── CLAUDE.md
│       ├── consensus-stack.md
│       ├── reconciliation-matrix.md
│       ├── contested-choices.md
│       ├── decisions.md
│       ├── runbook.md
│       ├── README.md
│       └── chapters/        # 20 chapters, ingested from Drive
└── ios/                      # Xcode project (created in Phase 1)
    ├── docs/                 # symlink or copy of ../docs/ios-guide
    ├── FuelWellApp/
    ├── Features/
    ├── Packages/
    ├── scripts/
    └── fastlane/
```

When Claude Code runs from `/ios`, it reads `ios/docs/CLAUDE.md` first. That instruction set already prescribes the architecture, conventions, and forbidden patterns.

---

## Phase plan

The guide is organized in five parts (Foundations → Architecture → Craft → Quality → Ship). The phase plan mirrors that, with two additional phases bracketing the build (pre-build alignment, post-launch hardening).

Phases are sequential. **No phase begins until the previous phase's gates are green.**

### Phase 0 — Pre-build alignment

**Goal:** every binding decision made before a line of Swift is written.

- [ ] Resolve all 12 gap-analysis items with Max (`docs/FuelWell-Gap-Analysis.md`)
- [ ] Write `ios/PRINCIPLES.md` extracting the decision-engine framing from the Inspiration Guide
- [ ] Read iOS guide chapters 1–3 (landscape, Swift essentials, toolchain setup)
- [ ] Lock the 7-feature MVP scope; freeze additions until Pilot ships
- [ ] Confirm Apple Developer Program enrollment, App Store Connect access
- [ ] Confirm Anthropic API key, Supabase project, Sentry project, PostHog project
- [ ] Decide: Cursor or Xcode as the editor (Claude Code is constant either way)

**Gate:** Gap analysis fully filled in and signed by Robert + Max.

### Phase 1 — Foundations *(Chapters 1–3, 5)*

**Goal:** project skeleton compiles, tooling wired, design contract written, AI loop functional.

- [ ] `ios/` Xcode project created, Swift 6 with `enableUpcomingFeature("StrictConcurrency")` and `swiftLanguageMode(.v6)` package-wide
- [ ] SPM topology: `ios/Features/` and `ios/Packages/` directories with the import-direction script (`scripts/check-feature-imports.sh`)
- [ ] `docs/ios-guide/` symlinked or copied to `ios/docs/`
- [ ] `ios/docs/DESIGN.md` written from the Chapter 3 template (tokens, components, brand) — ported from `src/lib/design-tokens.ts` so the iOS app and marketing site share a brand contract
- [ ] First-pass `Packages/DesignSystem/Theme.swift` generated from DESIGN.md; CI drift check in place
- [ ] Claude Design connected (reads codebase + DESIGN.md)
- [ ] ChatGPT Images 2.0 access confirmed for non-UI assets
- [ ] SwiftLint `--strict` config committed
- [ ] Repo runs `swift build` clean from a fresh checkout

**Gate:** Empty TCA `AppFeature` reducer compiles with strict concurrency, app launches in simulator showing a themed splash that pulls from `Theme`.

### Phase 2 — Architecture *(Chapters 4, 6, 8, 13)*

**Goal:** every infrastructure package exists with a `liveValue`, `testValue`, and `previewValue`. Navigation skeleton runs.

- [ ] `AppFeature` reducer + `AppCoordinator` (TCACoordinators) with stack-based navigation
- [ ] `Packages/DesignSystem/` — Theme, Component Gallery scaffold
- [ ] `Packages/Persistence/` — SQLiteData wrapper, migration runner, CloudKit container config
- [ ] `Packages/Networking/` — `LiveAPIClient` actor + `RetryingAPIClient` decorator
- [ ] `Packages/AnthropicClient/` — chat completion + streaming, gated behind kill-switch
- [ ] `Packages/SupabaseClient/` — auth, edge function invoker, `feature_flags` reader (30s cache)
- [ ] `Packages/HealthKitClient/` — read-scope client behind protocol (write scope deferred until Gap #9 resolved)
- [ ] `Packages/Analytics/` — PostHog adapter with strict event taxonomy
- [ ] `Packages/CrashReporting/` — Sentry adapter
- [ ] All `liveValue`s default to `unimplemented(...)` until registered at app launch via `prepareDependencies`

**Gate:** Every package has a unit test that hits `testValue` and a preview that hits `previewValue`. Component Gallery view runs and shows every Theme component.

### Phase 3 — Craft *(Chapters 7, 9–12, the 7 features)*

**Goal:** the seven MVP features end-to-end, behaving as decision-makers, not displays.

- [ ] **Auth + Onboarding** — `SignUpFeature`, `SignInFeature`, `OnboardingFeature` (goal, baseline macros, dietary constraints), Pilot plan flag (no tier gating)
- [ ] **MacroTrackingFeature** — log meal, instant verdict, dynamic recalc per Gap #3 resolution
- [ ] **AICoachingFeature** — chat with day-context memory; kill-switch enforced server-side
- [ ] **ProactiveCoachingFeature** — APNs registration, state-triggered notifications, quiet-hours per Gap #6
- [ ] **RestaurantGuidanceFeature** — input mode per Gap #2 (DB / photo-only / curated chains)
- [ ] **RecipeSuggestionsFeature** — pulls from inventory + dietary constraints
- [ ] **GroceryListFeature** — generated per Gap #7 (recipes / manual / both)
- [ ] **ProgressTrackingFeature** — trend + projection + next action per Gap #8
- [ ] **Settings** — account, data export, sign out
- [ ] **Empty states + error states + offline states** across every screen
- [ ] Supabase schema: `users`, `profiles`, `meals`, `foods`, `recipes`, `grocery_items`, `progress_entries`, `coach_messages`, `restaurants`
- [ ] RLS policies per table
- [ ] Offline behavior per Gap #11

**Gate:** End-to-end critical path runs on a real device — sign up → onboard → log meal → see verdict → ask coach → get proactive nudge → check progress.

### Phase 4 — Quality *(Chapters 14–16, 19)*

**Goal:** the app meets the production bar before submission.

- [ ] Reducer tests (`TestStore`) for all 7 features
- [ ] Snapshot tests for the Component Gallery and key screens
- [ ] Critical-path XCUITest: onboarding → log meal → see progress
- [ ] Accessibility pass — VoiceOver, Dynamic Type, contrast — DESIGN.md WCAG linter green
- [ ] Performance budgets — cold launch < 400ms, 60fps scrolling — verified via OSSignposter
- [ ] AI cost monitoring dashboard with per-user cap per Gap #12
- [ ] `PrivacyInfo.xcprivacy` declares all collected data types
- [ ] All `NS*UsageDescription` strings name the data, the use, and the protections
- [ ] Kill-switch drill: disable AI feature from Supabase SQL console, verify app respects it within 30 seconds

**Gate:** Five-check lint contract green, all tests pass, performance budgets met, kill-switch verified.

### Phase 5 — Ship *(Chapters 17–19)*

**Goal:** TestFlight build in pilot users' hands.

- [ ] GitHub Actions workflow on macos-15 with Fastlane lanes (`test`, `beta`, `release`)
- [ ] Fastlane `match` for code signing, App Store Connect API key auth
- [ ] CI gates: `scripts/check-feature-imports.sh`, DESIGN.md ↔ Theme drift, SwiftLint `--strict`, all tests, snapshot tests
- [ ] Sentry release tagging in `release` lane
- [ ] PostHog event taxonomy committed and enforced in code (Chapter 18)
- [ ] App Store Connect record created with privacy answers, NS strings, and screenshots (Chapter 19)
- [ ] First TestFlight build uploaded
- [ ] 30 pilot users invited (list pulled from Founders 100 signups via Supabase)
- [ ] Internal feedback channel (Linear or email)
- [ ] Phased rollout enabled

**Gate:** Pilot users can install, sign in, and use all 7 features without crashes.

### Phase 6 — Operate *(Chapter 20)*

**Goal:** the team can respond to incidents, ship updates, and learn from real usage.

- [ ] Sentry alert routing + response runbook populated
- [ ] Kill-switch drill scheduled monthly
- [ ] Crash-free session rate target ≥ 99.5%, alerted if it drops
- [ ] PostHog dashboards for the seven features' decision-engine engagement (did the user act on the recommendation?)
- [ ] Weekly pilot triage cadence
- [ ] App Review rejection response runbook
- [ ] Production database access procedure documented

**Gate:** First pilot week completes without an incident the runbook can't handle.

### Phase 7 — Founding 100 hardening

**Goal:** the app is ready for paying customers and the App Store public listing.

- [ ] Triage pilot feedback, fix top issues
- [ ] Tier gating introduced (Pro vs Premium) per `FuelWell_Master_v2`
- [ ] Stripe or RevenueCat for subscriptions, server-side validation
- [ ] Founders 100 lifetime pricing wired in (hard cap of 100)
- [ ] Web ↔ app account linkage — signups from `src/app/signup` and `src/app/founders-100` land in the same Supabase user table the app reads
- [ ] App Store screenshots generated via ChatGPT Images 2.0 (multilingual where relevant)
- [ ] Figma for Agents MCP installed if screenshot work demands it (per Reconciliation Matrix row 16)
- [ ] App Store submission, phased rollout configured

**Gate:** Founding 100 cohort can sign up, pay, and use the app without contacting support.

---

## Cross-cutting working agreements

These apply across every phase.

### Branch and PR workflow
Per `AGENTS.md`: never commit to `main`, every change is a PR, post-commit hook auto-pushes feature branches. Pre-commit hook enforces locally; branch protection enforces remotely.

### Multi-device development
Robert may pick up work from MacBook (Xcode required for iOS builds) or iPad (Claude Code on the web at claude.ai/code, or `@claude` mentions in GitHub PRs). Always pull `main` before resuming on a different device.

### Decision discipline
Every deviation from the Consensus Stack or Reconciliation Matrix gets an entry in `docs/ios-guide/decisions.md` with a date and reason. Temporary deviations include a sunset date. Permanent deviations also update the matrix row.

### AI design loop
1. Open DESIGN.md.
2. Generate the screen with Claude Design (three variations).
3. Pick a variation; if it needs non-UI assets (illustrations, hero graphics), generate them with ChatGPT Images 2.0.
4. Hand off to Claude Code with the chapter reference: *"Implement `AddMealFeature` reducer following Chapter 9 patterns, view following Chapter 7."*
5. Claude Code reads `ios/docs/CLAUDE.md` first and produces code that respects the conventions.

### Kill-switch first
Any AI-touching feature ships with its kill-switch wired *before* the feature is enabled in TestFlight. The order is: kill-switch → feature → rollout. Never the other way.

---

## What's deliberately out of scope for v1

- Multi-language support (English only at Pilot; multilingual screenshots only for App Store submission per Phase 7)
- Workout module (deferred until tier gating in Phase 7; per Master_v2 it's a Premium feature)
- Trainer compatibility (per Gap #4 resolution)
- Recomposition timeline as a full feature (per Gap #5 resolution)
- Apple Watch app
- Android
- Web app version of the product (the marketing site stays as marketing only)

---

## What we still don't know

The plan is intentionally honest about its blind spots. These are the questions that haven't been answered yet, in order of how much they could move the plan:

1. **Inspiration Guide details.** I have a one-paragraph summary of the decision-engine framing. The full guide (just added) will be re-read at Phase 0 and may add or replace principles in `ios/PRINCIPLES.md`.
2. **Gap Analysis answers.** All 12 rows are open. Each answer locks a feature shape in Phase 3.
3. **Anthropic vs OpenAI for the coaching model.** Consensus Stack says Anthropic. Gap #12 lets Robert + Max confirm.
4. **HealthKit write-back vs read-only.** Gap #9.
5. **Apple Sign-In requirement.** Apple may require it for an app that has another social/email auth; Gap #10.

Update this section as questions get answered or new ones surface.

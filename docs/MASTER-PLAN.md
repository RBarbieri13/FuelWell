# FuelWell — Master Plan

**Date drafted:** 2026-05-03
**Last status review:** 2026-05-04 — currently mid–Phase 0
**Status:** Living document. Updated as decisions land.
**Owners:** Robert (build) + Max (product/business)

## Where we are right now

**Phase 0 — Pre-build alignment** is in progress. Phase 0.5 (Visual Design) and Phase 0.6 (Interactive Prototype) have been added to this plan as new explicit phases — they bracket Phase 0 and Phase 1 to ensure every screen is mapped, drawn, mocked up, and clickable *before* any iOS code is written.

This is the binding plan for building the FuelWell iOS app to Pilot, Founding 100, and Public launch. It supersedes `docs/FuelWell-Phase-Plan.md` (which remains as the simpler partner-facing summary).

---

## Foundational principles

These are non-negotiable. They come from three sources we've already aligned on.

### 1. Product framing — from the Inspiration Guide (CTO Version) and PRINCIPLES.md

> FuelWell is **not** a tracking app, **not** a workout app, **not** a nutrition planner. FuelWell is a **real-time decision system** that removes the need for users to constantly figure out what to do.

Every screen, every reducer, every API response answers **"what should I do right now?"** before it answers "here is some data." If a screen only shows numbers, it is wrong. The 13 binding rules and the Daily Loop (Dashboard → Log → Adjust → Continue → Repeat) live in `docs/ios-guide/PRINCIPLES.md`.

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

Phase 0 leaves room to add scope deltas (water tracking, education layer, etc.) before Phase 0.5 visual design begins.

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
│       ├── PRINCIPLES.md
│       ├── PRODUCT-CONTEXT.md
│       ├── DESIGN.md                   # promoted from draft in Phase 0
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

---

## The complete phase plan

Phases are sequential. **No phase begins until the previous phase's gates are green.**

---

### Phase 0 — Pre-build Alignment

**Goal:** every binding decision made before anything visual or technical starts.

- ✅ Ingest the iOS Production Guide (CLAUDE.md, Consensus Stack, Reconciliation Matrix, 20 chapters)
- ✅ Write PRINCIPLES.md (13 binding product rules + the Daily Loop)
- ✅ Write PRODUCT-CONTEXT.md (aggregates Vision, Master_v2, Execution Blueprint)
- ✅ Lock the 7-feature MVP scope at the top level
- ✅ Read iOS Guide chapters 1–3 to extract Phase 1 requirements
- ✅ Roll back premature DESIGN.md to a draft
- ⏳ Answer the 12 Gap Analysis questions with Max (or by Robert + Claude proposal)
- ⏳ Answer the 8 scope deltas with Max (workouts? water tracking? streaks? meal plan generator? etc.)
- ⏳ Promote DESIGN.md from draft to canonical (YAML+Markdown format, FuelWell brand tokens)
- ⏳ Confirm Apple Developer Program enrollment ($99/year — Individual vs Organization decision)
- ⏳ Confirm Node.js installed on MacBook
- ⏳ Confirm: Anthropic API key set up (deferred to Phase 3 acceptable)
- ⏳ Confirm: Supabase project created (deferred to Phase 2 acceptable)
- ✅ Editor choice: Xcode (already on MacBook, version 26.3 confirmed)

**Gate to leave Phase 0:** all Gap Analysis + scope delta answers locked, DESIGN.md promoted, Apple Developer enrollment started.

---

### Phase 0.5 — Visual Design

**Goal:** by the end, you and Max know exactly what every screen looks like and what every button does. No code written yet.

Four sequential sub-steps, each building on the last:

#### Step 1 — App Map / Sitemap
- Take the 13 screens from Max's Execution Blueprint and draw them as a tree
- Show parent/child relationships (Dashboard is root, everything else hangs off it)
- Add onboarding flow as the entry sequence before the tree
- **Output:** a single one-page diagram you and Max look at together

#### Step 2 — Flow Chart
- Same screens, now with arrows showing navigation
- Document what each major button does on every screen
- "Tap 'Log Meal' on Dashboard → goes to Meal Log screen → has three tabs: Search, Photo, Scan"
- Black-and-white, no design opinions yet — just structure
- **Output:** a flow diagram, printable and markup-friendly

#### Step 3 — Wireframes
- Every screen drawn as a rough grayscale layout
- Where the title sits, where buttons go, where cards appear, what's above the fold
- No final colors, no real photos — just shapes and labels
- This is where you and Max argue about "should the verdict be above the macros or below"
- **Output:** ~15 wireframe images (one per screen), reviewed and approved

#### Step 4 — Mockups
- Every screen drawn in full color with real FuelWell brand (palette, fonts, dark theme)
- Real photos for food, real numbers in the macro displays
- "What the app actually looks like" — investor-ready
- **Output:** ~15 mockup images, locked as the spec for iOS code

**Tooling:** Claude Design (included in your Max subscription). Robert writes prompts, Claude Design returns three variations per screen, Robert + Max pick. Decisions logged.

**Gate to leave Phase 0.5:** Max signs off on all mockups. They become the locked spec for everything that follows.

---

### Phase 0.6 — Interactive Prototype

**Goal:** click through the entire FuelWell app on laptop or iPad as if it were real. Find UX problems while fixes are still cheap.

- Wire the approved mockups together into a clickable flow in Claude Design
- Every button in the prototype links to where it should go
- Generate a shareable URL
- Robert and Max click through every screen, every flow, every button
- Share with 2–5 trusted people (pilot candidates, Max's network) for outside feedback
- Collect notes, fix issues, iterate
- Final lock — no more visual changes after this without a written decision in `decisions.md`

**Gate to leave Phase 0.6:** the prototype works end-to-end and Max + Robert + 2–5 outside testers have given thumbs up.

---

### Phase 1 — Foundations *(iOS Guide Chapters 1–3, 5)*

**Goal:** Xcode project running on Robert's Mac with all tooling wired up. No features yet, just plumbing.

- Create the `ios/` folder in the repo
- New Xcode project, Swift 6, iOS 17 deployment target, iOS 18 SDK
- Turn on Strict Concurrency (Complete) and ExistentialAny
- Move `CLAUDE.md` to `docs/CLAUDE.md` (where Claude Code actually looks)
- Install Claude Code on the MacBook via Node.js
- Verify Claude Code reads the project ("ask: what's the deployment target?")
- Install Sentry MCP server with placeholder token
- Build the four foundational SPM packages: Core, DesignSystem, Networking, Persistence
- Generate `Theme.swift` from the locked DESIGN.md (CI check for drift)
- Configure SwiftLint in strict mode
- Run an empty test suite to verify the pipeline works

**Gate:** `xcodebuild test` returns green. Empty TCA app launches in the simulator showing a themed splash screen.

---

### Phase 2 — Architecture *(iOS Guide Chapters 4, 6, 8, 13)*

**Goal:** every infrastructure piece exists in its own package with a real implementation, a test stub, and a preview stub. The app shell exists but is empty.

- Build the rest of the infrastructure packages: AnthropicClient (with kill-switch), SupabaseClient, HealthKitClient (read-only first), Analytics (PostHog), CrashReporting (Sentry)
- Build the `AppFeature` root reducer (TCA)
- Build the `AppCoordinator` for stack-based navigation (TCACoordinators)
- Configure Supabase database schema: users, profiles, meals, foods, recipes, grocery_items, progress_entries, coach_messages, restaurants
- Set up row-level security (RLS) so users can only see their own data
- Wire SQLiteData with CloudKit sync
- Set up HealthKit read scope per Gap #9
- Set up the kill-switch infrastructure (Supabase `feature_flags` table + 30-second client cache)
- Every package has a `liveValue`, `testValue`, and `previewValue`
- All packages have at least one passing test

**Gate:** every infrastructure piece is independently testable. The app can read/write to the database, talk to Anthropic, and authenticate users — all through clean interfaces.

---

### Phase 3 — Craft *(iOS Guide Chapters 7, 9–12)*

**Goal:** implement every feature in the locked MVP scope against the approved Phase 0.5/0.6 mockups.

For each MVP feature:

- **Macro Tracking** (Screens 15, 16, 17) — Dashboard + Meal Log + Food Search
- **AI Coaching Chat** (Screen 18) — context memory, quick-reply chips
- **Proactive Coaching** (Screen 24) — push notifications triggered by user state
- **Restaurant Guidance** — per Gap Analysis resolution
- **Recipe Suggestions** (Screen 19) — "use remaining macros" filter
- **Grocery Lists** (Screen 26) — generated from recipes
- **Progress Tracking** (Screen 20) — interpretation, not raw charts

Plus connective tissue:
- Onboarding flow (per intake form Max designed)
- Profile / "Your Plan" screen (Screen 21) with "why this plan" explanations
- Authentication (sign up, sign in, session management)
- Empty states, error states, offline states across every screen
- Pilot plan flag (no tier gating — everyone sees everything)

Every feature ships only when:
- It answers "what should I do next?" before showing data
- It has reducer tests proving the state transitions are correct
- It has at least one snapshot test
- It implements the approved mockup faithfully

**Gate:** end-to-end critical path runs on a real iPhone — sign up → onboard → log meal → see verdict → ask coach → get proactive nudge → check progress.

---

### Phase 4 — Quality *(iOS Guide Chapters 14–16, 19)*

**Goal:** the app meets the production bar before submission.

- Reducer tests for every feature
- Snapshot tests for every screen in the Component Gallery
- Critical-path XCUITests (full user flows)
- Accessibility pass — VoiceOver, Dynamic Type, contrast (WCAG AA)
- Performance budgets verified — cold launch under 400ms, scrolling stays at 60fps
- AI cost monitoring dashboard with per-user spending cap
- `PrivacyInfo.xcprivacy` declares every data type collected
- All `NS*UsageDescription` strings name the data, the use, and the protections
- Kill-switch drill: disable an AI feature from a SQL console, verify the app respects it within 30 seconds

**Gate:** all tests green, performance budgets met, kill-switch verified.

---

### Phase 5 — Ship *(iOS Guide Chapters 17–19)*

**Goal:** TestFlight build in pilot users' hands.

- GitHub Actions CI/CD pipeline on macos-15 runners
- Fastlane lanes (`test`, `beta`, `release`)
- Fastlane `match` for code signing certificates
- CI gates: import boundaries, DESIGN.md ↔ Theme drift, SwiftLint, tests, snapshots
- Sentry release tagging in the `release` lane
- PostHog event taxonomy enforced in code
- App Store Connect record created
- App Store screenshots generated via ChatGPT Images 2.0 (English first; multilingual if applicable)
- Privacy answers completed
- First TestFlight build uploaded
- 30 pilot users invited from the Founders 100 signup list
- In-app feedback channel
- Phased rollout enabled

**Gate:** pilot users can install, sign in, and use all features without crashes.

---

### Phase 6 — Operate *(iOS Guide Chapter 20)*

**Goal:** Robert and Max can respond to incidents, ship updates, and learn from real usage.

- Sentry alert routing and incident response runbook
- Monthly kill-switch drill scheduled and documented
- Crash-free session rate target ≥ 99.5% with alerting
- PostHog dashboards tracking "decision-engine engagement" — did users follow the coach's recommendation?
- Weekly pilot feedback triage cadence
- App Review rejection response runbook
- Production database access procedure documented

**Gate:** the first pilot week completes without an incident the runbook can't handle.

---

### Phase 7 — Founding 100 Hardening

**Goal:** the app is ready for paying customers and public App Store launch.

- Triage pilot feedback, fix top issues
- Introduce tier gating: Pro vs Premium per Master_v2's feature matrix
- Stripe or RevenueCat integration for subscriptions
- Server-side subscription validation
- Founders 100 lifetime pricing wired in with the hard cap of 100
- Web ↔ app account linkage — signups from the marketing site land in the same Supabase user table the app reads
- Multilingual App Store screenshots if launching outside English markets
- Figma for Agents MCP installed if the screenshot work demands it
- App Store submission for public launch, phased rollout configured

**Gate:** Founding 100 cohort can sign up, pay, and use the app without contacting support.

---

## What's deliberately out of scope for v1

- Multi-language support (English only at Pilot; multilingual screenshots only for App Store submission per Phase 7)
- Workout module (deferred until tier gating in Phase 7; per Master_v2 it's a Premium feature) — *subject to scope-delta S1 resolution*
- Trainer compatibility (per Gap Analysis resolution)
- Apple Watch app
- Android
- Web app version of the product

---

## Cross-cutting working agreements

These apply across every phase.

### Branch and PR workflow
Per `AGENTS.md`: never commit to `main`, every change is a PR, post-commit hook auto-pushes feature branches.

### Multi-device development
Robert may pick up work from MacBook (Xcode required for iOS builds) or iPad (Claude Code on the web at claude.ai/code, or `@claude` mentions in GitHub PRs). Always pull `main` before resuming on a different device.

### Decision discipline
Every deviation from the Consensus Stack or Reconciliation Matrix gets an entry in `docs/ios-guide/decisions.md` with a date and reason. Temporary deviations include a sunset date.

### Kill-switch first
Any AI-touching feature ships with its kill-switch wired *before* the feature is enabled in TestFlight.

---

## Open questions tracked

- 12 Gap Analysis rows in `docs/FuelWell-Gap-Analysis.md` — partially resolved by Master_v2; remaining items pending Max review
- 8 scope deltas (S1–S8) added during context digestion — pending Max review
- DESIGN.md content — Robert generated via Claude Design; pending location confirmation so it can be promoted to canonical

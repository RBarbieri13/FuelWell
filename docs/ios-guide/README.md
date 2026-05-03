# FuelWell — iOS Production Guide

This `docs/ios-guide/` folder is the canonical FuelWell iOS production guide, mirrored from the source-of-truth Drive folder. Every file here is read by Claude Code as context when iOS work begins.

## Files at this level

- **CLAUDE.md** — Claude Code's instruction set. Read first, every session.
- **consensus-stack.md** — The committed technology stack. The "what we use" list.
- **reconciliation-matrix.md** — The decision log. Why each choice was made.
- **contested-choices.md** — Where the research reports disagreed and how we resolved it.
- **decisions.md** — Project-specific deviations from the matrix, dated and reasoned.
- **runbook.md** — Operational procedures (release, incidents, maintenance).
- **DESIGN.md** *(create from Chapter 3 template before writing UI)* — Design system source of truth.

## chapters/ folder

The full FuelWell production guide, 20 chapters in five parts:

### Part I — Foundations
- `chapter-01-landscape.md` — The 2026 iOS landscape & why this stack
- `chapter-02-swift-essentials.md` — Swift 6 patterns you'll use constantly
- `chapter-03-toolchain-setup.md` — Xcode, Claude Code, Claude Design, DESIGN.md, MCP servers

### Part II — Architecture
- `chapter-04-architecture-tca.md` — TCA reducers, State, Action, Effect
- `chapter-05-module-structure.md` — SPM topology and feature isolation
- `chapter-06-navigation.md` — TCACoordinators and stack-based navigation
- `chapter-07-swiftui-patterns.md` — View construction rules, Component Gallery
- `chapter-08-design-system.md` — DESIGN.md as canonical, Theme as generated artifact

### Part III — Craft
- `chapter-09-state-management.md` — Forms, presentation state, validation
- `chapter-10-networking.md` — URLSession, retries, AnthropicAPI client
- `chapter-11-persistence.md` — SQLiteData, migrations, CloudKit sync
- `chapter-12-concurrency.md` — Actors, async/await, Sendable
- `chapter-13-dependency-injection.md` — swift-dependencies in production

### Part IV — Quality
- `chapter-14-testing-strategy.md` — TestStore, snapshot tests, CI thresholds
- `chapter-15-accessibility.md` — DESIGN.md WCAG linter, VoiceOver, Dynamic Type
- `chapter-16-performance.md` — OSSignposter, performance budgets, the measured-fix playbook

### Part V — Ship
- `chapter-17-cicd.md` — GitHub Actions, Fastlane, the five-check lint contract
- `chapter-18-analytics-observability.md` — Sentry, PostHog, kill-switches
- `chapter-19-privacy-submission.md` — Privacy manifest, App Store screenshots, multilingual
- `chapter-20-post-launch-operations.md` — Sentry alerts, kill-switch drills, ops cadences

## Recommendation hierarchy (April 2026)

Claude Code writes the code. Claude Design creates the visuals. ChatGPT Images 2.0 generates assets. DESIGN.md is the contract between them.

## Where this folder lives in the FuelWell repo

This is a **monorepo** that hosts both the marketing site (Next.js, root) and the iOS app (under `ios/` once scaffolded). The guide lives at `docs/ios-guide/` regardless of which sub-project is being worked on. When the iOS Xcode project is created, copy or symlink this folder to `ios/docs/` so Claude Code working inside the iOS project root finds `CLAUDE.md` automatically.

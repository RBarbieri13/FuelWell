---
type: handoff
project: FuelWell
prepared_by: Claude Opus 4.7 (Goal Mode)
prepared_for: Codex (autonomous 8-hour run)
prepared_on: 2026-05-23
repo: /Users/robert.barbieri/Developer/FuelWell
branch_at_handoff: feature/phase-0-realignment
head_at_handoff: c64a3e183136dfe31d5e14958ae9c2420d3ad5c8
upstream: https://github.com/RBarbieri13/FuelWell.git
status: ready-to-execute
---

# FuelWell — Codex Autonomous Handoff (Phase 1 Foundations, 8-hour run)

This is the entire briefing. Read it in order. Section 0 is Robert's one-time setup. Section 1 is the `/goal` block to paste into Codex. Everything below it is reference Codex consults while running.

---

## Section 0 — Robert's one-time setup (≤ 5 min)

Run these on the MacBook before invoking Codex. They are the ONLY blocking human actions.

```bash
# 0.1 — confirm we're in the right repo + branch
cd /Users/robert.barbieri/Developer/FuelWell
git fetch origin
git status            # expect: on feature/phase-0-realignment, one unstaged delete of FuelWell-Phase-0.5-Review.pdf
git log -1 --oneline  # expect: c64a3e1 Phase 0.5.3 — consolidate Max + Robby + audit feedback…

# 0.2 — stage and commit the only outstanding change
git add docs/ios-guide/pdfs/FuelWell-Phase-0.5-Review.pdf
git commit -m "Remove 40MB full review PDF; LITE version remains canonical"
git push

# 0.3 — confirm Xcode 26 + command-line tools (Phase 1 needs these)
xcodebuild -version
xcode-select -p

# 0.4 — confirm Node 22+ (Codex re-uses tools/pdf for any PDF regen)
node --version

# 0.5 — confirm gh CLI is authenticated
gh auth status
```

If any of 0.3–0.5 fail, **fix before invoking Codex**. Codex is allowed to install npm packages and Homebrew dependencies, but it cannot install Xcode itself.

**Credentials Codex MAY ask for during the run (have them ready, don't paste preemptively):**
- Apple Developer Team ID (Individual enrollment is locked per `decisions.md` 2026-05-14).
- Supabase project URL + anon key + service-role key (project exists per same decisions entry).
- Anthropic API key (exists per same entry).
- Sentry + PostHog tokens are **deferred** — Codex must NOT prompt for them in this run.

---

## Section 1 — Paste this into Codex (one block, then walk away)

````
/goal Drive FuelWell from end of Phase 0.5.3 to end of Phase 1 (Foundations) over the next 8 hours, autonomously, on branch feature/phase-1-foundations cut from origin/feature/phase-0-realignment. Handoff spec is the single source of truth at /Users/robert.barbieri/Developer/FuelWell/CODEX-HANDOFF.md — read it fully before executing.

DEFINITION OF DONE (all must be true and self-verified before you declare complete):
1. `git -C /Users/robert.barbieri/Developer/FuelWell rev-parse --abbrev-ref HEAD` returns `feature/phase-1-foundations`.
2. `cd /Users/robert.barbieri/Developer/FuelWell/ios && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' build` exits 0.
3. `cd /Users/robert.barbieri/Developer/FuelWell/ios && xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' test` exits 0 with at least 1 passing test.
4. `/Users/robert.barbieri/Developer/FuelWell/ios/scripts/check-feature-imports.sh` exits 0.
5. `/Users/robert.barbieri/Developer/FuelWell/ios/scripts/check-theme-drift.sh` exits 0 (DESIGN.md ↔ Theme.swift parity).
6. `swiftlint --strict --config /Users/robert.barbieri/Developer/FuelWell/ios/.swiftlint.yml` exits 0.
7. `git log --oneline` shows one new commit per workstream (W1–W6); branch pushed to origin; PR opened against main with the Phase 1 checklist.
8. `/Users/robert.barbieri/Developer/FuelWell/ios/HANDOFF-REPORT.md` exists with every Section 4 checkpoint marked ✅ / 🟡 / ❌ + evidence (commit SHA, command output excerpt) for each.

AUTONOMY RULES:
- You have full permission to install Homebrew packages, npm modules, Ruby gems (Fastlane), Swift packages (SPM), and to write/edit/delete anything under /Users/robert.barbieri/Developer/FuelWell.
- You may NOT: push to main, force-push to any branch, edit anything outside the repo, share secrets to any chat/wiki/external service, modify the global ~/.claude/ or ~/Obsidian/ directories.
- If you need a credential listed in Section 0.5, pause and ask Robert in chat. Do not stub it.
- If a verification step in Section 4 fails three times with the same error, stop, write what you tried to HANDOFF-REPORT.md under "Escalation," and continue with the next workstream.
- Commit after each workstream completes. Use the AGENTS.md branch workflow (auto-push is on).
- If you hit a Sentry/PostHog prompt or requirement, defer per Section 0.5 — they are not in scope for Phase 1.

BEFORE YOU START: spawn parallel sub-agents for any workstream in Section 3 marked [PARALLEL]. Do W1 sequentially first, then fan out.

REPORT: when DoD #1–#8 are green, write HANDOFF-REPORT.md, push, open the PR, and emit a single one-line summary to stdout: "Phase 1 complete · branch feature/phase-1-foundations · PR #<n> · <SHA>".
````

After Codex returns the one-line summary, open the PR and merge if green. That's your only post-run task.

---

## Section 2 — Current state of the project (verified 2026-05-23)

### What's done

| Phase | Status | Evidence |
|---|---|---|
| Phase 0 — Pre-build alignment | ✅ DONE | `docs/MASTER-PLAN.md` lines 12–24; `decisions.md` 2026-05-13, 2026-05-14 entries; Gap Analysis + Log filled |
| Phase 0.5 Step 1 — App Map v2.1 | ✅ DONE | `docs/ios-guide/APP-MAP.md`; `docs/ios-guide/pdfs/FuelWell-App-Map.pdf` (511KB) |
| Phase 0.5 Step 2 — Flow Chart v2.1 | ✅ DONE | `docs/ios-guide/FLOW-CHART.md`; `docs/ios-guide/pdfs/FuelWell-Flow-Chart.pdf` (433KB) |
| Phase 0.5 Step 3 — Wireframes | ✅ DONE | `docs/ios-guide/wireframes/` |
| Phase 0.5 Step 4 — Mockups (Round 1 + 2) | ✅ DONE | 38 PNGs + 38 HTMLs in `docs/ios-guide/mockups/` |
| Phase 0.5.3 — D1–D19 reviewer consolidation | ✅ DONE | `decisions.md` 2026-05-21 entry; commit `c64a3e1` |
| Build toolchain (in-repo) | ✅ DONE | `tools/pdf/` with playwright, sharp, marked, mermaid |

### What is NOT done (Codex's job)

| Phase | Status | Codex action |
|---|---|---|
| Phase 0.6 — Interactive prototype | ❌ NOT STARTED | OUT OF SCOPE for this 8-hour run (assets are clickable HTML already; Robert + Max can click `docs/ios-guide/mockups/html/*.html` directly. Phase 0.6 polishing is a separate run.) |
| Phase 1 — Foundations | ❌ NOT STARTED | **PRIMARY MISSION.** `ios/` directory does not exist. |
| PR #27 cleanup | 🟡 STALE | PR is DRAFT with title "Roll back premature DESIGN.md, mark Phase 0 in progress." Codex's Phase 1 work will go in a SEPARATE PR (`feature/phase-1-foundations` → `main`). PR #27 is Robert's to clean up — Codex does not touch it. |

### Reconciliation of the 2026-05-21 transcript vs the actual repo

Robert's prior session produced a Phase 0.5.3 plan with Workstreams A/B/C/D, then hit a `/tmp/fw-pdf` blocker mid-execution. Reconciling what was claimed vs what landed:

| Claim (from transcript Sections 1–5) | Repo evidence | Verdict |
|---|---|---|
| 58 reviewer corrections consolidated into D1–D19 | `decisions.md` lines 134–200, dated 2026-05-21 | ✅ Verified |
| App Map updated to v2.1 (single-word tabs, Day 1 mode, Macro History deep-link, voice mode dropped, Learn home removed) | `decisions.md` 2026-05-21 cross-references; `pdfs/FuelWell-App-Map.pdf` regenerated 2026-05-21 18:30 | ✅ Verified |
| Flow Chart v2.1 with offline queue, dynamic Daily Recap, typing indicator, notification privacy | `decisions.md` cross-references; PDF regen timestamp | ✅ Verified |
| Group B1 onboarding screens updated (1–9) | 9 PNG file diffs in commit `c64a3e1` | ✅ Verified |
| Group B2 dashboard screens (10, 28, 29, 30, 31) | Commit shows 28-dashboard-v2-populated.png added new; 28, 29, 30, 31 modified | ✅ Verified |
| Group B3 meals + coach (11–22) | All file diffs present in commit | ✅ Verified |
| Group B4 progress + profile (23–27, 34) | All file diffs present | ✅ Verified |
| Group B5 hubs + menu + help + tab bar (32, 33, 35, 36, 37) | All file diffs present | ✅ Verified |
| Net-new patterns C.1–C.6 (offline queue, bug reporting, undo, freshness stamps, dynamic Daily Recap, manual-tracking audit) | `decisions.md` lines 164–200 | ✅ Verified |
| Combined PDF regenerated | LITE version exists (4.5MB), full version (40MB) deleted from working tree but uncommitted | 🟡 Partial — see Section 0 step 0.2 |
| Branch pushed to origin | `git ls-remote origin feature/phase-0-realignment` matches local HEAD `c64a3e1` | ✅ Verified |
| Tools/pdf checked into repo | `tools/pdf/{build-combined.js,build-compressed.js,build-doc-pdf.js,render-mockups.js,screens-catalog.js,package.json}` all present | ✅ Verified |
| Handoff file written to `~/Desktop/FuelWell-Phase-0.5.3/HANDOFF.md` | File does not exist on Desktop | ❌ Missing — non-critical, transcript blocker prevented this exact path; the equivalent context is now in this document |

**Net assessment:** Phase 0.5 is materially complete and committed. The 2026-05-21 transcript ended with Claude blocked on toolchain, but Robert clearly resolved the blocker (Claude reconstructed tools/pdf in-repo) and the work landed in commit `c64a3e1`. The only outstanding artifacts are the uncommitted PDF deletion (Section 0.2) and the missing Desktop handoff file (which this document supersedes).

---

## Section 3 — Phase 1 workstreams (Codex's 8-hour plan)

Sequential dependency: **W1 → fan out W2/W3/W4 in parallel → W5 → W6.** Workstreams marked `[PARALLEL]` can run as concurrent sub-agents.

### W1 — Bootstrap branch & repo layout (≈ 30 min, SEQUENTIAL)

```bash
cd /Users/robert.barbieri/Developer/FuelWell
git fetch origin
git checkout -b feature/phase-1-foundations origin/feature/phase-0-realignment

mkdir -p ios/{FuelWellApp,Features,Packages,scripts,fastlane,tests}
ln -s ../docs/ios-guide ios/docs   # symlink per MASTER-PLAN.md line 122
cp docs/ios-guide/PRINCIPLES.md ios/PRINCIPLES.md
```

**Verify:** `ls -la ios/docs` resolves to `docs/ios-guide`, `ls ios/PRINCIPLES.md` exists, branch is `feature/phase-1-foundations`.

### W2 — Xcode project + SPM topology [PARALLEL after W1] (≈ 90 min)

Create the Xcode workspace and SPM package graph per iOS Guide chapters 1–3 and 5.

- `ios/FuelWellApp.xcodeproj` — single-app target, iOS 17 deployment, iOS 18 SDK, Swift 6 language mode, Strict Concurrency = Complete, ExistentialAny enabled package-wide.
- `ios/Packages/Core/Package.swift` — shared primitives (no deps).
- `ios/Packages/DesignSystem/Package.swift` — Theme + Component Gallery scaffold; depends on Core only.
- `ios/Packages/Networking/Package.swift` — `LiveAPIClient` actor + `RetryingAPIClient` decorator; depends on Core.
- `ios/Packages/Persistence/Package.swift` — SQLiteData wrapper, migration runner stub; depends on Core.
- Dependencies via SPM (versions are floor; pick the latest at HEAD that satisfies):
  - `swift-composable-architecture` ≥ 1.17
  - `swift-dependencies` (transitively from TCA)
  - `swiftui-navigation` (transitively from TCA)
  - `TCACoordinators` ≥ 0.9
  - `swift-snapshot-testing` ≥ 1.17
  - `swift-testing` (Apple, comes with Swift 6 toolchain)
  - `SQLiteData` (or `sqlite-data` / equivalent — confirm package name; do NOT swap in GRDB/SQLite.swift/Realm — see `docs/ios-guide/CLAUDE.md` forbidden list)
- `Package.swift` files use `swiftLanguageModes: [.v6]` and `.enableExperimentalFeature("StrictConcurrency")`, `.enableUpcomingFeature("ExistentialAny")`.

**Verify:**
- `xcodebuild -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 15' build` exits 0.
- App launches in simulator showing a themed splash that pulls `theme.color.background` from the DesignSystem package.

### W3 — Theme.swift generated from DESIGN.md [PARALLEL after W1] (≈ 75 min)

Build the design-token generator. DESIGN.md is the canonical contract; `Theme.swift` is a generated artifact under `ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift`. CI drift check enforces parity.

- `ios/scripts/generate-theme.sh` — parses `docs/ios-guide/DESIGN.md` (markdown + YAML front-matter block), emits Swift `Theme` struct with color, font, spacing, radius, motion tokens. Idempotent.
- `ios/scripts/check-theme-drift.sh` — re-runs the generator into a temp file and `diff`s against the committed Theme.swift; non-zero exit on drift. Wired into the CI workflow.
- `ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift` — committed output. Every color/font/spacing referenced through `@Environment(\.theme)` per CLAUDE.md conventions.
- **Hard rule:** `#47E7B0` is the brand mark (per `decisions.md` 2026-05-14). `#3D9B2F` does not appear anywhere in the generated Theme. Action/success green `#00D278` is a separate token.

**Verify:**
- `ios/scripts/check-theme-drift.sh` exits 0.
- `grep -r '#3D9B2F' ios/` returns zero hits.
- `grep -r 'Color(red:.*green:.*blue:' ios/Packages/DesignSystem/Sources` is allowed only inside `Theme.swift`; anywhere else fails the lint.

### W4 — Tooling: SwiftLint strict + import-direction check + CI [PARALLEL after W1] (≈ 60 min)

- `ios/.swiftlint.yml` — strict config from iOS Guide chapter 5; opt-in rules including `explicit_self`, `no_print`, `redundant_void_return`, `no_extension_access_modifier`, `force_unwrapping`, `implicitly_unwrapped_optional`.
- `ios/scripts/check-feature-imports.sh` — per CLAUDE.md: Features import Packages, never Features→Features, never Packages→Features. Parse `import` lines from `ios/Features/**/*.swift` and fail on illegal directions.
- `ios/.github/workflows/ios-ci.yml` — runs on `pull_request` for changes under `ios/**`:
  - `xcodebuild test` on `platform=iOS Simulator,name=iPhone 15`
  - `swiftlint --strict`
  - `ios/scripts/check-feature-imports.sh`
  - `ios/scripts/check-theme-drift.sh`
  - Snapshot test job (recording mode off)
  - macos-15 runner; Xcode 26.x selector via `sudo xcode-select -s /Applications/Xcode_26.app`

**Verify:** All four scripts return 0 against the W2 + W3 output. The workflow file passes `actionlint` (Codex may install it via Homebrew if useful).

### W5 — `AppFeature` reducer + empty splash (SEQUENTIAL after W2+W3) (≈ 60 min)

The minimum-viable TCA shell that compiles strict-concurrency-clean.

- `ios/FuelWellApp/Sources/FuelWellApp.swift` — `@main` entry; instantiates `AppFeature` store, attaches `AppCoordinator` view.
- `ios/Features/App/Sources/App/AppFeature.swift` — `@Reducer` with `State`, `Action.onAppear`, `Action.themeLoaded(Theme)`. `prepareDependencies` registers stubs at app launch (per CLAUDE.md: `liveValue` defaults to `unimplemented(...)`).
- `ios/Features/App/Sources/App/AppCoordinator.swift` — `TCACoordinators` stack with a single `splash` destination.
- `ios/Features/App/Sources/App/SplashView.swift` — full-bleed themed splash, FuelWell wordmark in `#47E7B0`, 1.2s minimum dwell, then transitions to a placeholder "Dashboard placeholder — Phase 3 lands the real one."
- All public types have explicit `public init`. All reducers `@MainActor`. Views use `@Bindable var store: StoreOf<X>`.

**Verify:**
- `xcodebuild build` exits 0 with strict concurrency.
- `xcodebuild test` exits 0 (reducer unit test passes — see W6).

### W6 — Tests + handoff report (SEQUENTIAL after W5) (≈ 60 min)

- `ios/Features/App/Tests/AppTests/AppFeatureTests.swift` — one Swift Testing `@Test` that hits `AppFeature.reducer`'s `testValue`, asserts state after `.onAppear` → `.themeLoaded`.
- `ios/Packages/DesignSystem/Tests/DesignSystemTests/ThemeTests.swift` — snapshot test on a primary color swatch (records on first run only; subsequent runs verify byte-equal).
- `ios/HANDOFF-REPORT.md` — populated from the template in Section 7 below. Includes branch name, head SHA, every DoD #1–#8 with ✅/🟡/❌ + evidence, and any escalations.
- Push and open the PR:
  ```bash
  git push -u origin feature/phase-1-foundations
  gh pr create --base main --head feature/phase-1-foundations \
    --title "Phase 1 — Foundations (Xcode skeleton, SPM topology, Theme drift guard)" \
    --body-file ios/HANDOFF-REPORT.md \
    --draft
  ```
  PR opens as DRAFT — Robert un-drafts and merges after review.

**Verify:** PR URL emitted; `gh pr view` shows status `OPEN` and `isDraft: true`; HANDOFF-REPORT.md is the body.

---

## Section 4 — Quality gates Codex runs at end of each workstream

Codex must run the gate set after every workstream and refuse to advance if any fail.

| Gate | Command | Pass condition |
|---|---|---|
| Branch correctness | `git rev-parse --abbrev-ref HEAD` | Returns `feature/phase-1-foundations` |
| Clean working tree per commit | `git status --porcelain` | Empty after each commit |
| No main commits | `git log main --oneline -1` | SHA unchanged from start of run |
| Build green | `xcodebuild -scheme FuelWellApp build` | Exit 0, no warnings under `-Werror` |
| Tests green | `xcodebuild test` | Exit 0, ≥ 1 passing test from each test target |
| SwiftLint | `swiftlint --strict --config ios/.swiftlint.yml` | Exit 0, zero violations |
| Import direction | `ios/scripts/check-feature-imports.sh` | Exit 0 |
| Theme drift | `ios/scripts/check-theme-drift.sh` | Exit 0 |
| Retired green absent | `grep -r '#3D9B2F' ios/` | Returns no matches |
| Hardcoded colors absent | `grep -rE 'Color\(red:|UIColor\(red:' ios/Features ios/FuelWellApp` | Returns no matches (Theme is the only allowed source) |
| No forbidden libs | `grep -rE 'import (Alamofire\|Moya\|GRDB\|SQLite\b\|Realm)' ios/` | Returns no matches |

If a gate fails three times against the same error: log to HANDOFF-REPORT.md, skip that workstream's remaining steps, continue with the next workstream.

---

## Section 5 — Reference: the 19 locked decisions (D1–D19)

These shape Phase 3 features, NOT Phase 1 foundations. Codex does not implement features in this run, but the Theme + AppFeature scaffold must not contradict any of them. The full text lives in `docs/ios-guide/decisions.md` lines 134–200.

Quick reference (do NOT re-derive — consult the file):
- D1 Health Score keeps name; avoid "diagnostic" in user-facing copy.
- D2 Voice mode OUT.
- D3 Exercise & Activity first-class with 6 sub-pages.
- D4 Menu hierarchical-collapsed.
- D5 Inflows/Outflows V1 dual ring.
- D6 Tab bar V2 raised-circle FAB Coach.
- D7 Day 1 Dashboard welcome mode.
- D8 Favorites deferred.
- D9 Single-word tab labels.
- D10 Learn home retired.
- D11 Recovery 14-day baseline, excluded until then.
- D12 Macro History = deep-link to Progress, not a screen.
- D13 Coach voice no-gos (no "missed/skipped/went over"; trend-paired adherence below 60%; neutral Daily Recap lede).
- D14 Cause-first delta framing.
- D15 Offline write queue.
- D16 Dynamic Daily Recap trigger.
- D17 Private notification preview default.
- D18 Typing indicator (no persistent ONLINE dot).
- D19 Progressive onboarding deferred.

Also from earlier decisions log entries (still binding):
- 2026-05-13 Phase 0 gap analysis sign-off (Max ✅, Robert ✅).
- 2026-05-14 Canonical DESIGN.md, brand green `#47E7B0`, action green `#00D278`, bg.elevated `#0F1117`, anti-patterns banned (streaks/badges/leaderboards, aggressive gradients on flat).
- 2026-05-14 Account confirmations: Apple Dev Individual ✅, Anthropic ✅, Supabase ✅; Sentry + PostHog deferred.
- 2026-05-14 Editor = Xcode (Claude Code alongside).
- 2026-05-19 App Map v2 reorganization (Coach-centered tab bar, hierarchical Menu, Help replaces Learn, Inflows/Outflows widget).

---

## Section 6 — Anti-patterns Codex must NOT introduce

From `PRINCIPLES.md` + `DESIGN.md` + repeated `decisions.md` callouts:

- **No streaks chrome.** No "streak chip," no leaderboard, no public progress, no badges-as-primary-motivator.
- **No gamification UI** as scaffolding (PRINCIPLES rule 11).
- **No `#3D9B2F`** anywhere. The retired green must produce zero `grep` hits.
- **No "diagnostic"** in user-facing strings (D1).
- **No persistent "ONLINE" dot** on any Coach surface (D18) — applies even if you only stub the Coach view as a placeholder.
- **No "you missed / skipped / went over"** in any sample copy (D13).
- **No voice-mode references** in Coach view or settings (D2).
- **No `@ObservedObject` / `@StateObject`.** Only `@Bindable var store: StoreOf<X>` (CLAUDE.md).
- **No Alamofire / Moya / GRDB / SQLite.swift / Realm** (CLAUDE.md forbidden list).
- **No `Color(red:…)` outside `Theme.swift`** (theme drift gate).
- **No hardcoded fonts or spacing in views** (CLAUDE.md).
- **No `// TODO` without a matching `decisions.md` entry** (CLAUDE.md "Just for now" rule).
- **No commits to `main`.** Pre-commit hook will block; do NOT `--no-verify`.
- **No force-pushes**, no rewriting Robert's history, no editing the existing commit `c64a3e1`.

---

## Section 7 — Template for `ios/HANDOFF-REPORT.md` (Codex writes this at end)

```markdown
# FuelWell — Phase 1 Foundations — Codex Handoff Report

**Date:** <ISO-8601 UTC>
**Codex run id:** <id>
**Branch:** feature/phase-1-foundations
**Base commit:** c64a3e183136dfe31d5e14958ae9c2420d3ad5c8
**Final HEAD:** <SHA>
**PR:** <url>

## DoD verification

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Branch correct | ✅/🟡/❌ | `git rev-parse` output |
| 2 | Build green | ✅/🟡/❌ | xcodebuild last 20 lines |
| 3 | Tests green | ✅/🟡/❌ | test count, pass count |
| 4 | Import direction OK | ✅/🟡/❌ | script exit code |
| 5 | Theme drift clean | ✅/🟡/❌ | diff output |
| 6 | SwiftLint clean | ✅/🟡/❌ | violation count |
| 7 | Commit + push + PR | ✅/🟡/❌ | commit list, PR URL |
| 8 | Handoff report present | ✅ (this file) | path |

## Workstream summary

- W1 Bootstrap — <status, commit SHA>
- W2 Xcode + SPM — <status, commit SHA>
- W3 Theme generator — <status, commit SHA>
- W4 Lint + CI — <status, commit SHA>
- W5 AppFeature + splash — <status, commit SHA>
- W6 Tests + handoff — <status, commit SHA>

## Escalations / open questions

- <one bullet per item Codex paused on or couldn't resolve autonomously>

## What Robert reviews next

1. Pull the branch: `git fetch && git checkout feature/phase-1-foundations`
2. Open `ios/FuelWellApp.xcodeproj` in Xcode 26, hit ⌘R, verify the simulator boots to the themed splash.
3. Review the PR diff on GitHub (mostly Package.swift + scripts + a small SwiftUI tree).
4. Un-draft the PR and merge if green.
5. Next Codex session: Phase 2 — Architecture (infrastructure packages: AnthropicClient, SupabaseClient, HealthKitClient, Analytics, CrashReporting + AppCoordinator + Supabase schema).
```

---

## Section 8 — Working agreements (load-bearing)

- **`AGENTS.md` branch rules** are absolute: never commit to `main`, every change ships via PR, post-commit hook auto-pushes. Pre-commit hook enforces locally.
- **`docs/ios-guide/CLAUDE.md`** is Codex's constant context inside the iOS subtree once `ios/docs` symlink exists.
- **`docs/ios-guide/PRINCIPLES.md`** is the decision-engine framing. Every UI decision Codex makes (even at Phase 1 scaffold level — splash copy, navigation primitives) must honor the 13 binding rules.
- **`tools/pdf/`** is the in-repo build pipeline for PDFs. Codex does not need to rebuild PDFs in Phase 1; only re-touch tools/pdf if a Phase 1 doc change requires a regen.
- **Multi-device discipline:** Robert may pick up the branch on iPad/iPhone via claude.ai/code while Codex runs. Codex's auto-push (every commit) keeps the phone view fresh.

---

## Section 9 — End-of-run signal

Codex prints one line to stdout when DoD #1–#8 are all green:

```
Phase 1 complete · branch feature/phase-1-foundations · PR #<n> · <SHA>
```

Robert sees that line, opens the PR, reviews, merges. Phase 2 kickoff is a separate Codex session — out of scope here.

---

**End of handoff.** Section 1 is the only thing that gets pasted into Codex. Everything else is the spec Codex reads from disk.

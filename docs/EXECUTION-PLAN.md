# FuelWell — Master Execution Plan: From Mock Shell to App Store
*A grounded, dependency-ordered program to ship the locked 7-feature MVP to the Founding 100 — authored 2026-05-30*

---

*Revised 2026-05-31 — this edition merges a second independent Claude Code audit; see **Reconciliation of Two Independent Audits — Combined Insights** below.*

## Executive Summary

FuelWell is, today, a **beautifully architected iOS shell that runs entirely on mocks**. The engineering quality of the scaffold is genuinely high — 11 well-factored SPM packages, a strict SwiftLint config with custom rules, a real XcodeGen project with 13 test targets, a green iOS CI pipeline, Fastlane lanes, a kill-switch drill, and 38 locked HTML mockups. But the green badges hide a hard truth surfaced by a seven-agent audit: **almost nothing the user would call "the app" actually works end-to-end.**

The honest headline:

- **The app boots 100% on mock dependencies.** `AppLaunchDependencies.prepareFuelWellDependencies()` wires `anthropicClient`, `supabaseDatabase`, `featureFlags`, `healthKit` to `.previewValue` and `analytics`/`crashReporter` to `.noop`. Real `liveValue` implementations exist but are never selected. (Two clients escape mocking and resolve live: `nutritionRepository` → real local JSON persistence, and `subscriptionClient` → `.unconfigured`, i.e. inert.)
- **There is no AI backend at all.** The iOS `AnthropicClient.live()` POSTs to a `FUELWELL_ANTHROPIC_PROXY_URL` that no server in the repo implements. The AI Coach — the product's headline differentiator — is three hardcoded SwiftUI bubbles with no text field. The only `complete()` call in the whole app is a readiness probe sending "Return the word ready."
- **The database schema was never applied.** Live REST probes against the Supabase project `xzsftuxvnkgxtbiibvac` return `PGRST205` (table missing) for `feature_flags`, `profiles`, `meals`, `subscription_entitlements`, and more, and `PGRST202` for the commerce RPCs. The migrations exist only as `.sql` files on disk; the repo's own docs confirm they were never applied.
- **Only the marketing website is genuinely live** — a Next.js app on Fly.io (`fuelwell-website`) with a real signup route. Even there, the live `founders_100` table (21 real rows) uses an **old schema** that the current signup code would fail against.
- **No auth, no onboarding, no profile feature exists** in `ios/Features` — meaning the Phase 3 gate's first two steps ("sign up → onboard") are unimplemented.
- **No real payment path exists** — no StoreKit config, no RevenueCat/Stripe SDK, no IAP products.

**What it will take to ship:** The binding constraint is *not* engineering — the scaffold is unusually complete. It is **provisioning and Apple wall-clock**. The shortest path to a polished, deployed app runs: provision the three human-gated secrets/accounts on day zero → apply and verify the database → wire live dependencies behind a config flag → build the missing auth/onboarding tissue → stand up the AI proxy → make the seven features real → wire commerce → pilot on TestFlight → submit and survive App Store review (1–3 weeks of non-compressible latency). This document lays out ten workstreams, their true dependency graph, a multi-agent orchestration harness to execute them with maximum safe parallelism, and a phased timeline with verifiable gates.

**One process correction up front:** "Phase N committed" has been repeatedly mistaken for "Phase N gate green." Every gate in this plan is a runnable command or an observable artifact. Nothing is "done" because a commit title says so.

---

## Reconciliation of Two Independent Audits — Combined Insights

A second, independent Claude Code session audited FuelWell from the same primary sources this plan draws on — git history, merged PRs, the iOS code, and the Codex handoff reports, explicitly *not* the stale checklist docs. It reached the same structural verdict by a different route and surfaced several framings and data points worth folding in. This section captures where the two audits converge (high-confidence ground truth), what the second audit adds that this plan did not already state, and the handful of factual discrepancies — each resolved against the code, not split down the middle.

### Where the two audits agree (the shared, high-confidence findings)

Both audits, run independently, land on the same core thesis: **FuelWell is a beautifully architected, fully-navigable iOS shell with one real cluster (nutrition macro logging) and a stubbed brain.** The specific points of agreement are mutually corroborating, not merely overlapping:

- **The scaffold is genuinely real.** 86 first-party Swift files, an XcodeGen project, green CI, Swift Testing passing, `swiftlint --strict` clean. Both audits cite the same numbers.
- **The architecture is high-quality and complete.** 11 SPM infrastructure packages; a theme system generated from `DESIGN.md` with a drift-check CI. (See the Verified Current State table and the W3/W6/W7 gates.)
- **The one real feature cluster is nutrition — eight surfaces.** The only live cluster is nutrition macro logging, enumerated by the second audit as **Meal Log, Add Meal, Food Detail, Restaurant Guidance, Recipe Browser, Meal Plan, Grocery, and Meal History** — use this list as the W6 Nutrition parity-matrix scope.
- **The AI Coach is a stub.** `AnthropicClient.complete()` exists but the Coach feature never calls it; the key-holding proxy endpoint does not exist (this plan: G1, G3, G7; W1 + W5). The second audit independently confirms the only live `complete()` invocation is a readiness probe.
- **Most tabs are deterministic placeholders.** Dashboard, Coach Chat, Exercise/Activity, Progress, Menu, Help are UI surfaces not wired to live data or AI. The second audit pinpoints the four to replace first — **Coach, Progress, Dashboard verdict, and proactive nudges** — and separately names **progress tracking** and **recipe suggestions** as placeholder surfaces alongside coaching chat and proactive coaching (G7/G9; W3/W5/W6).
- **Phase 0.6 (Interactive Prototype) was skipped entirely** — mockups straight to iOS code, no clickable prototype, no outside-tester validation round (G15; W9 Task 1 + Definition of Done).
- **The methodology matches.** The second audit reached its conclusions by reconciling git/PRs/code/handoff-reports against the planning docs and treating the checklists as untrustworthy — the same evidence-based, "committed ≠ gate green" posture this plan is built on (W7.0 baseline re-verify).
- **The pilot priority ladder maps onto the existing critical path.** Wire Coach to the proxy (W1+W5), replace the named deterministic surfaces (Coach, Progress, Dashboard verdict, proactive nudges) with live Supabase+HealthKit data (W3/W5/W6), connect HealthKit reads of weight/steps/workouts/active-energy to the Health Score and Inflows/Outflows (W6 Tasks 3–5), and exercise the full sign-up→onboard→log→verdict→coach→nudge→progress path on a real device (Definition of Done). These restate this plan's W-mapping with no substantive divergence.

### What the second audit adds

Six net-new contributions tighten the plan without changing its shape. Each is mapped to its owning workstream.

**1 — The "ordering inversion" framing (Executive Summary / Risk Register).** The single most useful narrative lens the second audit supplies: *Phases 4–7 (Quality, Ship, Operate, Founding-100 commerce) were built as readiness/foundations scaffolding — release-gate checkers, kill-switch drills, commerce RPC, account linkage — while the core AI coaching engine remains stubbed.* In the audit's words, the project "built the operational and monetization plumbing for a product whose central feature does not yet talk to Claude." This plan documents every underlying fact but never names the inversion as one thesis. It belongs up front because it *explains why* the critical path front-loads W1→W5 (the brain) even though the later-numbered phases appear "done": "Phase 7 done" overstates reality precisely because the operational shell was completed around an absent center. Scaffolding-first is defensible — but it must not be read as product-completeness.

**2 — The Phase 3 completion-report verbatim quote (Verified Current State / Gap Register).** New primary-source evidence in the project's *own words*: *"Coach, notifications, recipe detail, workout plans, and food search are deterministic local surfaces… not live AI/network-backed services yet."* This plan asserts these surfaces are stubs from code inspection but never cites this self-incriminating line from the team's Phase 3 report. It hardens G7/G8/G9 and the "committed ≠ gate green" thesis. Note it explicitly names **food search** and **recipe detail** as deterministic — food search is not separately tracked as a gap here and should be confirmed as W6 PlansFeature/Nutrition scope.

**3 — The build-dashboard "8 of 10 phases" reconciliation score (W6 baseline / W10).** A prior Claude Code session already built a reconciliation dashboard (open PR #74) that scored the build **8 of 10 phases complete (80%), frontier Phase 7, with Phase 0.6 the one flagged skipped gap.** (The plan's ten phases are **0 Pre-build Alignment · 0.5 Visual Design · 0.6 Interactive Prototype · 1 Foundations · 2 Architecture · 3 Craft · 4 Quality · 5 Ship · 6 Operate · 7 Founding-100 Hardening**; the 8/10 score credits the phases with committed work and flags 0.6 as the one skipped gap.) This plan references PR #74 only as a "build-status dashboard" to resolve (G18, W10 Task 1) and to extend into a live cockpit (W10 Task 8) — it never records the dashboard's actual scoring output. That verdict is a useful baseline to seed the cockpit and to reconcile against this plan's harsher "almost nothing works end-to-end" read: 8/10 counts *phases with committed work*, whereas this plan counts *gates that pass against the running app*. Both are true under their own definitions; the cockpit (W10 Task 8) should surface both numbers side by side so "80% complete" is never mistaken for "80% shippable." (Provenance caveat in the table below: the dashboard app is not committed locally, so 8/10 is the figure asserted in PR #74's verification text, not reproducible from a local build today.)

**4 — The explicit $5/$10 AI cost cap (W1 / W3).** This plan specifies AI cost controls only abstractly (`FUELWELL_COACH_USER_DAILY_TOKENS`, a per-user + global daily cap). The cost ceiling is in fact a recorded, locked decision: **$5/user/month soft cap, $10/user/month kill-switch**, tied to Anthropic Claude as the locked provider (Gap-Analysis item #12; avg Pilot user ~$2–4/mo, $10 as a safety net, with a Max sign-off flag on the Founders 100 cohort). These figures should be folded into W1 Task 4 as the concrete default cap values. One reconciliation note for implementation: the plan's cap mechanism is **token-denominated** while the decision is **dollar-denominated** — derive the token cap from the $5/$10 dollar target at the current model price, or add an explicit dollar-spend cap alongside the token cap. (Distinct from the $10.99/mo Pro *subscription* price in `PRODUCT-CONTEXT.md` — unrelated to the AI cost cap.)

**5 — The full named SPM package roster (Verified Current State / W3 / W10).** This plan repeats "11 SPM packages" but never enumerates them in one place. The second audit gives the explicit roster: **Core, DesignSystem, Networking, Persistence, AnthropicClient, SupabaseClient, HealthKitClient, Analytics, CrashReporting, SubscriptionClient, NutritionDomain.** Useful as a reference for W3 wiring and W10 worktree assignment.

**6 — Specific stale-artifact callout (W9 Task 1 / W10).** This plan tracks staleness of `MASTER-PLAN.md` (status header to be superseded by `EXECUTION-PLAN.md`). The second audit names a *different* stale file by name: **`FuelWell-Phase-Plan.md`, still showing Phase 1+ unchecked.** Add it to the W9/W10 doc-staleness cleanup. (The audit also claims `decisions.md` and the mockup spec "are current" — reconcile carefully against G15, which states `decisions.md` has *no Phase 0.6 record*; "current" here likely means up-to-date for the decisions it *does* record, not that it covers the Phase 0.6 waiver. Verify the actual file contents before relying on either claim.)

**The "make the brain real" recommendation (Orchestration / Timeline).** The second audit's headline recommendation offers two sequencing options whose constituent work is fully inside this plan but whose *framing* is net-new:

- **Option 1 — a focused "make the brain real" sprint:** a single Codex work-order that wires Coach → Claude proxy → live context (W1 + W5 + W3), framed as "the single highest-value gap" and "what turns the shell into FuelWell." Dependency caveat: this plan's serial spine requires W2 (migrations) and W3 (live wiring) and W4 (auth, for user-scoped usage/context) before the coach can talk to *live* data. A standalone brain sprint must therefore run against a local mock proxy honoring the W1 contract, then flip the URL — exactly the mitigation W5's top-risk row already anticipates.
- **Option 2 — merge PR #74 first** to make the live build dashboard the permanent source of truth, *then* attack the AI gap. This plan already wants to extend #74 into a cockpit (W10 Task 8) but frames its immediate fate only as "resolve" (merge or close) during baseline cleanup; elevating it to the explicit **first move** strengthens the rationale for a canonical source of truth before any feature work.

One framing tension to hold explicitly: the second audit names the AI-brain connection as the *single highest-value gap*, while this plan's Executive Summary states the binding constraint is "NOT engineering — it is provisioning and Apple wall-clock." **Both are true on different axes** — "make the brain real" is the highest product-*value* move; provisioning + Apple review remain the longest *schedule* constraint. Even a perfect brain cannot ship without the provisioning/Apple-latency spine.

### Factual reconciliations

Each row resolves to the evidence-backed answer rather than averaging the two claims.

| Claim | First audit (this plan) | Second audit | Resolution + evidence |
|---|---|---|---|
| **Swift file count** | 86 first-party (68 non-test); "130" attributed to the stale `~/FuelWell` clone | 86 Swift files | **86 is correct.** The raw `find` in the canonical repo returns 130, but 33 are vendored fastlane gem Swift under `ios/vendor/bundle/gems/fastlane-2.230.0/` plus gem assets; excluding `vendor/.build/DerivedData` yields exactly 86 (67 excluding Tests). All 86 live under `ios/` (Features/* + Packages/*). **Correction to this plan:** the "130 = stale `~/FuelWell` clone" attribution is wrong — `find ~/FuelWell -name '*.swift'` = 0; 130 is simply the unfiltered canonical count including vendored Swift. |
| **Mockup count** | 38 locked HTML mockups (Exec Summary); W6 parity matrix says rows `01`–`37` | 37 mockups | **Both describe different things; 38 is the canonical file count.** `docs/ios-guide/mockups/html/*.html` = 38 files AND 38 matching PNG renders, mapping to **37 distinct screen numbers** (01–37) because screen 28 has two variants (`28-dashboard-v2.html` + `28-dashboard-v2-populated.html`). So "38" = locked files, "37" = unique screens. `CODEX-HANDOFF.md:99` ("38 PNGs + 38 HTMLs") is canonical. The W6 parity matrix should read "38 files across 37 screen numbers." The `~/Downloads/Dead Link Mockups Revised` set (35 files, `DL##_*_revised.html`) is unrelated and not part of the locked spec; the "27"/"30" figures in an older `MOCKUP-PROMPTS.md` are stale. |
| **"Phase 7 wired live Supabase auth + commerce RPC"** | Migrations never applied to the live project; commerce RPCs return `PGRST202`, `feature_flags`/tables return `PGRST205`; no auth feature; `SubscriptionClient` degrades to `.unconfigured` | Phase 7 "wired live Supabase auth session + commerce RPC" | **Both true once you separate CODE-committed from LIVE-provisioned — not a contradiction.** The code was written, reviewed, and **merged to main**: PRs #62 (account linkage), #64 (live commerce RPC client), #65 (server validation endpoint), #66 (live auth session) all MERGED 2026-05-26/27, and the Swift clients genuinely target live endpoints (`rest/v1/subscription_entitlements`, `rpc/reserve_founding100`, `rpc/link_marketing_signup_to_user`, etc. in `SupabaseSubscriptionTransport.swift`). **But nothing reaches a live table:** the three migrations exist only as `.sql` files on disk and were never applied; the one real live read (2026-05-26) returned `PGRST205` and remains Blocked (`staging-kill-switch-drill-phase4.md`, `runbook.md`). The handoff reports' word "wired" means *code wired to live endpoints*, not *provisioned and reachable*. This is the central reconciliation: the second audit's "wired live" overstates against this plan's live-probe evidence. Both agree the **Anthropic proxy is not confirmed live.** |
| **$5/$10 cost cap provenance** | Caps specified abstractly in tokens (`FUELWELL_COACH_USER_DAILY_TOKENS`) | "$5/$10 cost cap" stated as a target | **It is a recorded, locked decision — not a second-session proposal.** `FuelWell-Gap-Analysis.md:18` item #12: "Anthropic Claude. $5/user/month soft cap, $10/user/month kill-switch"; corroborated in `Gap-Analysis-Log.md:111,150` with rationale (~$2–4/mo per active user, $10 a safety net) and a Max sign-off note on the Founders 100 watch item. Distinct from the Pro subscription price $10.99/mo (`PRODUCT-CONTEXT.md:114`). Fold the dollar figures into W1 Task 4 and reconcile dollar↔token units at implementation. |
| **PR #74/#75 status** | Working tree on `feature/design-skill-workflow` (PR #75, **merged**); PR #74 to resolve | PR #74 (dashboard) and PR #75 (design skills) both **unmerged** | **#74 is OPEN (confirmed, `mergedAt=null`); #75 status is the live discrepancy to resolve via `gh` before establishing the clean baseline.** Both agree #74 needs resolution (W10 Task 1). |

### Net effect on the plan

The combined verdict **does not change the critical path.** Two independent audits converging on the same structural truth — real shell, stubbed brain, Phase 0.6 skipped, schema never applied — raises confidence in the dependency graph as drawn (`provisioning → W2 → W3 → W4 → Phase 3 path → W9 → Apple review`, with W1→W5 as the parallel critical sub-chain).

What the second audit does is **sharpen the #1 recommendation and supply a sequencing decision** the plan left implicit. We endorse it explicitly:

- **Move one: "Make the brain real" (W1 + W5, fed by W3).** Wire the Coach to a cost-capped Claude proxy ($5/$10 caps per Gap-Analysis #12) against live context. This is the highest product-*value* gap — what converts the shell into FuelWell — and it can begin against a local mock proxy honoring the W1 contract while W2/W3/W4 land the live data path, so it need not wait on the full serial spine.
- **Lightweight alternative: merge PR #74 first** so the live build dashboard becomes the canonical source of truth (and the seed for the W10 cockpit, surfacing both the "8/10 phases committed" and the harsher "gates-passing" counts) *before* feature work begins.

Neither option relaxes the standing caution: the highest-value move is the brain, but **provisioning and Apple review remain the longest non-compressible clock** — front-load both regardless of which first move is chosen.


## Verified Current State

Grounded in the seven-agent audit, with file evidence. Severity of each item is captured in the Gap Register below.

| Component | Status | Evidence |
|---|---|---|
| Canonical repo & git workflow | **REAL** | `/Users/robert.barbieri/Developer/FuelWell`, remote `RBarbieri13/FuelWell`; feature-branch+PR per `AGENTS.md`. **Working tree is on `feature/design-skill-workflow` (PR #75, merged), not `main` (tip `eb5b0e0`).** Stale duplicate clone at `~/FuelWell` (HEAD `040b3df`) — ignore it. |
| iOS scaffold | **REAL** | 86 Swift files (68 non-test) in the canonical tree; 11 SPM packages; 13 test targets via XcodeGen `project.yml`. *(The "130 files" figure in early findings counted the stale `~/FuelWell` clone.)* |
| Marketing website backend | **REAL / LIVE** | Next.js on Fly.io app `fuelwell-website`; `src/app/api/signup/route.ts` writes to Supabase via service-role. `founders_100` is live with 21 rows. |
| Local meal persistence | **REAL (local only)** | `nutritionRepository` is *not* mocked at launch → `LocalNutritionRepository` writes meal entries to `Application Support/FuelWell/nutrition/meal-entries.json`. No backend/CloudKit path. |
| Macro tracking feature | **REAL (local only)** | `DailyLogFeature` (`@Reducer`) + `NutritionDomain/MacroDecisionEngine` wired into the `.meals` tab. The only real feature in the running app. |
| App launch dependencies | **STUB** | `AppLaunchDependencies.swift:8-17` forces `anthropicClient/supabaseDatabase/featureFlags/healthKit=.previewValue`, `analytics/crashReporter=.noop`. |
| `AnthropicClient.live()` / `SupabaseDatabaseClient.live()` | **REAL but DORMANT** | Real URLSession REST clients exist (`AnthropicClient.swift:53,64,98-117`; `SupabaseClient.swift:152,169-191`) but are never wired at launch. |
| Anthropic proxy server | **MISSING** | No route implements `{prompt,model,maxTokens,feature_flag}→{text,request_id}`. Only API routes are `signup` and `subscriptions/validate-provider`. No `@anthropic-ai/sdk` in `package.json`. `src/proxy.ts` is a `/admin` Basic-Auth middleware (red herring). |
| AI Coach | **STUB** | `HubScreens.swift:4-34` `CoachChatView` is static bubbles, no Store, no composer, no dependency. |
| Proactive coaching (push) | **MISSING** | No `import UserNotifications`, no `UNUserNotificationCenter` anywhere. Only token is the `proactive_nudges` subscription enum string. |
| Restaurant / Recipe / Grocery / Meal-plan | **STUB (deterministic)** | `*Plan.swift` are pure `static func` string builders keyed on `MacroDaySnapshot`. No reducer, no DB, no AI. |
| Dashboard / Progress / Exercise tabs | **STUB** | 4 of 5 tabs in `RootTabView.swift:23-39` mount static views; `ProgressOverviewView` has dead affordances (tappable rows, no destination). |
| Onboarding / Auth / Profile | **MISSING** | No Onboarding/SignIn/SignUp/Auth/Profile feature under `ios/Features`. Auth code exists only in the `SupabaseClient` package, dormant. |
| `Persistence` (SQLite) | **STUB / DEAD CODE** | `SQLiteDataStore` is an empty struct; `MigrationRunner.migrate()` body is `_ = store`; unreferenced by the app. |
| Supabase migrations applied | **MISSING (confirmed)** | Live probes return `PGRST205`/`PGRST202` for all Phase 2/7 tables & RPCs; repo docs (`staging-kill-switch-drill-phase4.md:48`, `runbook.md:96`) confirm not applied. |
| `founders_100` live schema | **MISMATCH** | Live table has `spot_number`; lacks `normalized_email`/`first_name`/`source` (`42703`). Current signup upsert would fail in production. |
| Commerce / IAP | **STUB / MISSING** | `validate-provider` endpoint is real but has **no caller** (`SubscriptionClient.swift:382` throws `.missingConfiguration`). No StoreKit/RevenueCat/Stripe SDK. `subscriptionClient` degrades to `.unconfigured` at launch. |
| Cost controls on AI | **MISSING** | `AnthropicRequest` exposes only `maxTokens`. No per-user/global cap, throttle, token accounting, or streaming. |
| CI / lint / theme-drift / feature-import checks | **REAL** | `ios-ci.yml` (4 jobs), `swiftlint --strict`, `check-feature-imports.sh`, `check-theme-drift.sh`, kill-switch drill all real. **Last green iOS CI = PR #66 (2026-05-27); #67-#75 were website-only and skipped iOS CI** (path filter). |
| Fastlane / release scaffold | **REAL but un-automated** | `beta`/`release` lanes exist; **no CI job invokes them** (CI only runs `fastlane lanes`). No `screenshots/` dir; Match certs repo unprovisioned. |
| Phase 4 readiness gate | **REAL but un-passable** | `check-phase4-readiness.sh` hard-BLOCKs without `~/.fuelwell/supabase-staging.env`, a working kill-switch read path, and a physical device. |
| Analytics / crash reporting | **STUB at runtime** | Wired to `.noop` at launch; no event has ever reached Sentry/PostHog. |
| Local git hooks (AGENTS.md claim) | **MISSING** | `.git/hooks/` has no pre-commit/post-commit; only (unverified) remote branch protection would block a direct commit to `main`. |

---

## Gap Register

Severity-sorted. "Blocker" = nothing downstream ships without it.

| # | Sev | Gap | Why it blocks | Owning WS |
|---|---|---|---|---|
| G1 | **Blocker** | No Anthropic proxy server exists | Every AI feature (Coach, AI meal-plan, recipe, restaurant) fails at runtime even if `liveValue` were wired | W1 |
| G2 | **Blocker** | Phase 2/7 Supabase migrations never applied to live project | No real data layer; auth, meals, feature-flags, commerce all have no backing tables | W2 |
| G3 | **Blocker** | App boots 100% on mocks | No live code path is exercised; no gate can be met at the running-app level | W3 |
| G4 | **Blocker** | No Auth / Onboarding / Profile feature in `ios/Features` | Phase 3 gate's first two steps; gates RLS verification, commerce account-linkage, and any usable pilot | **W4 (new, dedicated)** |
| G5 | **Blocker** | Entire payment path is greenfield (no StoreKit/RevenueCat/IAP products) | Founding 100 cannot pay; app can't take money | W8 |
| G6 | High | `founders_100` live schema mismatch (21 real production rows at risk) | Signup write fails in prod; reconciliation migration risks the only real production data | W2 (owner) |
| G7 | High | AI Coach is a static mockup; no reducer, composer, context, or voice enforcement | Headline feature non-functional; coach-voice rules unenforced in code | W5 |
| G8 | High | Proactive coaching has zero implementation | One of seven locked MVP features entirely absent | W6 |
| G9 | High | 4 of 5 tabs are static placeholders with dead affordances | Apple Guideline 2.1 rejection risk; features #4-#7 are demo-ware | W6 |
| G10 | High | No cost cap / rate limit / token accounting on a paid AI model | Unbounded financial exposure once AI is live | W1 |
| G11 | High | Phase 4 release gate un-passable (no staging env, no device, no applied flags) | Cannot pass the only measurable Phase 4 sign-off | W9 / W2 |
| G12 | High | Meal data persists to local JSON only; `Persistence` SQLite layer is dead code | No sync, backup, or multi-device; violates locked "real backend" | W7 |
| G13 | Med | No automated TestFlight/App Store lane in CI; no screenshots; Match unprovisioned | No push-button release; submission would be incomplete | W9 |
| G14 | Med | Analytics/crash are `.noop`; no live telemetry | No signal during pilot/rollout; can't verify Phase 5/6 "without crashes" | W9 |
| G15 | Med | Phase 0.6 (Interactive Prototype) skipped with no `decisions.md` record | Violates the plan's own decision-discipline; no outside-tester validation ever | W10 |
| G16 | Med | Account deletion (Apple 5.1.1(v)) unimplemented | Hard App Store rejection once accounts ship | W4 |
| G17 | Med | Staging-vs-production Supabase project decision unresolved | Four workstreams probe different DBs; gate URLs ambiguous | W2 (decide first) |
| G18 | Med | Dirty working tree + stale `~/FuelWell` clone | Risk of work landing in/branching from the wrong tree | W10 Task 1 |
| G19 | Low | `coach_chat` missing from `FeatureFlagClient.previewValue`; `AnthropicRequest.featureFlag` defaults to `ai_meal_plan` | Kill-switch gates on wrong flag; preview/DB seed drift | **One owner: W1** |
| G20 | Low | `checkAnthropic()` reports `featureDisabled` as `ready=true` | False-positive health signal | W1 |
| G21 | Low | Committed anon key + project ref in `fly.toml`; permissive RLS on legacy table | RLS is the only guard; review posture | W2 |
| G22 | Low | No coverage floor, no perf budgets, snapshots only in DesignSystem | Quality nets collect data and discard it | W6 |

---

## The Plan — Workstreams W1–W10

> **Canonical renumbering (per critique §0).** The draft workstreams used a numbering scheme that collided with the orchestrator's internal map and buried auth as a sub-task. The canonical IDs below are authoritative for the entire document and the orchestrator's `plan.yaml`. **There is now one numbering scheme.**
>
> | ID | Name | Was (draft) |
> |---|---|---|
> | **W1** | Backend Activation — Anthropic Proxy + Cost Controls | W1 |
> | **W2** | Data Layer, Migrations & Persistence-of-Record | W2 (+ migration ownership consolidated) |
> | **W3** | Live Dependency Wiring | (was smeared across W1/W2/W4) |
> | **W4** | Auth, Onboarding & Profile *(new, dedicated — the unowned blocker)* | (was W5 Task 8) |
> | **W5** | AI Coach & Proactive Coaching Brain | W3 |
> | **W6** | Feature Completeness — Dashboard, Progress, Activity, Plans, Menu | W4 + W5 (deduped) |
> | **W7** | Quality, Testing, Accessibility & Performance | W6 |
> | **W8** | Monetization & Commerce | W7 |
> | **W9** | TestFlight Pilot, App Store Submission & Operate | W8 + W9 (merged) |
> | **W10** | Multi-Agent Execution Orchestration | W10 |

**Single-owner rules (load-bearing, per critique §2 & §1b–d):**
- **`AppLaunchDependencies.swift` + `RootTabView.swift` + `HubScreens.swift` have ONE owning agent** (the "Integration Owner"). All workstreams that need to touch launch wiring or tab mounting submit their change as a request the Integration Owner serializes. This is the highest-probability source of merge corruption in the program.
- **All Supabase migration authorship AND the single live-apply belong to W2.** W1, W5, W6, W8 *consume* the applied schema; they never author or apply migrations.
- **The G19/G20 flag fixes are a one-time, two-line change owned by W1.** No other workstream re-implements them.

---

### W1 — Backend Activation: Anthropic Proxy + Cost Controls

**Objective.** Stand up the AI backend that does not exist today: a cost-capped, feature-flag-gated proxy implementing the exact iOS client contract, so the Coach and every AI surface can function. This is the root of the AI critical sub-chain.

**Host decision (recommended).** A new Next.js route on the existing `fuelwell-website` Fly app — `src/app/api/coach/route.ts` — reusing the deployed container, the `getSupabaseAdmin()` service-role client, Fly secrets, and the existing deploy workflow. This is far less new surface than Supabase Edge Functions (which would need the Supabase CLI link + Deno tooling the repo lacks). Trade-off: Fly cold-start latency and no native SSE primitive — acceptable for Pilot. **Record the decision in `docs/decisions.md`.**

**Tasks.**
1. *(Robert)* Confirm/create the Anthropic API key; set Fly secrets `ANTHROPIC_API_KEY` and `FUELWELL_COACH_PROXY_SECRET` (mirrors the existing `SUBSCRIPTION_VALIDATION_SECRET` pattern).
2. *(Codex)* Build `src/app/api/coach/route.ts`. Add `@anthropic-ai/sdk`. **Derive the request/response JSON keys directly from `AnthropicClient.swift:98-117`** — accept `{prompt, model, maxTokens, feature_flag}`, return `{text, request_id}`. Any drift breaks the client silently.
3. *(Codex)* Server-side **feature-flag gate**: look up the requested flag in the live `feature_flags` table (via W2's applied schema); if disabled, return the status the client maps to `AnthropicClientError.featureDisabled`.
4. *(Codex)* **Cost controls** (consume W2's `coach_usage` table): per-user daily token cap + global daily spend cap (env-configured), 429 on breach, record actual `input_tokens`/`output_tokens` keyed by `user_id`/`day`, throttle per-minute. Log `request_id` + token counts (no prompt PII).
5. *(Codex)* SSE streaming variant (token deltas + terminal usage frame) for chat UX; keep the non-streaming `complete()` contract intact for meal-plan/recipe callers.
6. *(W1 owns G19/G20)* Add `coach_chat` to `FeatureFlagClient.previewValue`; make coach calls pass `featureFlag: "coach_chat"` explicitly; fix `checkAnthropic()` so `featureDisabled` ≠ `ready`.
7. *(Claude Code)* Document + open PR from `main`; add the `decisions.md` host entry.

**Acceptance gate.**
1. `curl -sS -XPOST "$FUELWELL_COACH_PROXY_URL" -H "x-fuelwell-coach-secret: $SECRET" -d '{"prompt":"Return the word ready.","model":"…","maxTokens":16,"feature_flag":"coach_chat"}'` → HTTP 200 with non-empty `text` + a `request_id`.
2. Toggling `feature_flags.coach_chat=false` → the proxy returns the disabled response (client maps to `featureDisabled`).
3. Exceeding `FUELWELL_COACH_USER_DAILY_TOKENS` for a test user → HTTP 429 and a `coach_usage` row reflects recorded tokens.
4. A contract test (against the deployed route) locks the exact JSON shape.

**Effort: L.** **Top risk:** unbounded AI spend → hard server-side caps + kill-switch verified before any device points at the proxy.

---

### W2 — Data Layer, Migrations & Persistence-of-Record

**Objective.** Build the durable, syncable data foundation and **own the single source of truth for all Supabase schema**: apply the migrations to a real project, reconcile the `founders_100` drift, replace the dead SQLite stub with a real local store, and establish a tracked migration pipeline.

**Decisions to make first (blocking, per critique §1e & §1b):**
- **D-1 (G17): Staging vs production project.** *Recommendation: provision a dedicated app Supabase project, do NOT reuse the marketing project `xzsftuxvnkgxtbiibvac` for app data.* This decision sets the gate URLs for W1, W3, W8, W9 — make it once, record it, and propagate the chosen project ref everywhere. *(If Robert blesses reuse, every "live probe" gate in the program targets `xzsftuxvnkgxtbiibvac`.)*
- **D-2: Sync topology.** *Recommendation: **Option A — Supabase-as-source-of-truth + local read-through/write-behind cache.*** Matches the locked "real database, real backend" spec and the existing web surface. The alternative (SQLiteData + CloudKit) gives no web parity and ties sync to iCloud account state. **Do not blend.** Record in `decisions.md`.

**Tasks.**
1. *(Claude Code drafts, Robert decides)* Write D-1 and D-2 as dated `decisions.md` entries, naming the canonical table list and the offline/conflict policy.
2. *(Codex, SQL)* **Author all migrations here** (the only place): finalize phase2 (`profiles`, `foods`, `meals`, `feature_flags` with `auth.uid()`-scoped RLS), phase7 (`marketing_signups`, `subscription_entitlements`, `subscription_validation_events`, RPCs), a new `coach_usage` migration (for W1), and the **`founders_100` reconciliation** (idempotent `alter table` adding `normalized_email` backfilled from `email`, `first_name`/`last_name` split from `name`, `source` default — **never drop; 21 real production rows live here**). Add a `schema_migrations` applied-tracking convention.
3. *(Codex, Swift)* Replace `SQLiteDataStore`/`MigrationRunner` stubs with a real engine (**GRDB** recommended): real open/WAL connect, versioned DDL, local tables (`meal_entries`, `foods` cache, `profile`, `pending_writes`, `sync_state`). Migrate `LocalNutritionRepository` off `JSONFileStore` onto it **without changing the `NutritionRepository` protocol surface** (`DailyLogFeature.swift:102` depends on it). One-time JSON→SQLite import. *(Note: there are zero production app users, so import-loss risk is Low — the real high-severity risk is the `founders_100` reconciliation above.)*
4. *(Codex + Robert)* Establish the tracked apply pipeline: add `ios/supabase/config.toml`, link the chosen project, and a documented `tools/supabase/apply-migrations.sh`. **Robert performs the single live apply** (service-role, authorized), in documented order, snapshotting `founders_100` first.
5. *(Codex)* Offline write path: wire `PendingWriteQueue` so every mutation is a durable pending write flushed to Supabase REST via `SupabaseDatabaseClient.live()` when an authenticated session exists; retry with backoff; surface a pending-sync count.
6. *(Codex)* Read path / conflict policy: local cache serves reads; background pull reconciles via `sync_state` cursor (`updated_at` watermark). **LWW by `server_updated_at`** for scalar fields; **append-only + tombstoned deletes** for meal entries keyed by client UUID.

**Acceptance gate.**
1. `grep -rn "_ = store" ios/Packages/Persistence` returns nothing; a unit test opens a fresh DB, runs `migrate`, and asserts tables exist via `sqlite_master`.
2. A test logs a meal through `nutritionRepository` and reads it back from the SQLite file; legacy JSON is imported/retired; Persistence/Core/Nutrition targets are green.
3. Live REST `HEAD` to `…/rest/v1/feature_flags` (on the chosen project) returns `200`/`206`, not `PGRST205`; `founders_100` exposes `normalized_email`/`source` (no `42703`); RPCs resolve (no `PGRST202`).
4. A meal logged offline lands in `pending_writes`, then appears in the remote `meals` table after reconnect.
5. *(RLS gate — depends on W4 auth)* Two authenticated users: A sees only A's rows (0 rows, not 403, for B's data); anon cannot read user tables; `feature_flags` is publicly readable. Captured as an artifact, not asserted from memory.

**Effort: L.** **Top risks:** `founders_100` reconciliation losing real rows (High → backfill never drop, test against a staging copy); choosing the wrong topology (High → force the ADR before code).

---

### W3 — Live Dependency Wiring

**Objective.** Flip the app off mocks behind a safe, default-mock launch config, so live builds talk to the real proxy + database while CI/snapshots stay green. This is the spine of the critical path.

**Tasks.**
1. *(Integration Owner — Claude Code)* Modify `AppLaunchDependencies.swift` so that when `FUELWELL_USE_LIVE_BACKEND` (env/launch arg/build config) is set, it selects `anthropicClient=.liveValue`, `supabaseDatabase=.liveValue`, `featureFlags=.liveValue`; otherwise keeps preview/noop. **Default is mock** so `xcodebuild test`, the DesignSystem snapshot job, and `check-theme-drift.sh` stay green.
2. *(Integration Owner)* Source `FUELWELL_ANTHROPIC_PROXY_URL` (→ the W1 route) and Supabase env from the live scheme / Fastlane env. Address the un-mocked-but-inert `subscriptionClient` (populate `SubscriptionConfiguration.environment` so it stops degrading to `.unconfigured` — coordinated with W8).
3. *(Codex)* Add `healthKit=.live()` selection on real devices with graceful fallback to `.previewValue` in the simulator (consumed by W6).

**Acceptance gate.** A unit/launch test asserts that with `FUELWELL_USE_LIVE_BACKEND=1` the container resolves `liveValue` for the three clients (and `subscriptionClient` is configured), while a default build resolves preview/noop; `AppFeature.checkAnthropic()`/`checkSupabase()` report genuinely-ready (not the false-positive path) against a live build; `xcodebuild test` (iOS CI) stays green on the default path.

**Effort: S–M.** **Top risk:** flipping liveValue regresses CI/snapshots → toggle defaults to mock, live path opt-in.

---

### W4 — Auth, Onboarding & Profile *(the previously-unowned blocker)*

**Objective.** Build the connective tissue that does not exist: authentication, the onboarding flow, and the Profile/"Your Plan" surface. This is the first two steps of the Phase 3 gate and a prerequisite for W2's RLS gate and W8's account linkage. **It is a blocker on the same tier as W1/W2/W3 and gets its own workstream** (per critique §1a).

**Tasks.**
1. *(Codex)* `Features/Auth` package: wire `SupabaseClient` auth (sign up / sign in / session persistence / sign out) behind the live `supabaseDatabase`. Mirror the `Features/Nutrition` package layout; respect `check-feature-imports.sh`.
2. *(Codex)* `Features/Onboarding`: welcome → sign-in/up → goal selection → body baseline → dietary constraints → lifestyle → HealthKit permission → notification permission → plan reveal (mockups `01`–`09`). Persist the profile to the live `profiles` table.
3. *(Codex)* `Features/Profile` / "Your Plan" (mockup `24`, Screen 21): render real `profiles` + entitlement data; this is the read surface W6/W8 build on.
4. *(Codex — G16)* **Account deletion** (Apple 5.1.1(v)): in-app delete-account path with a Supabase auth + data cascade. Hard requirement once accounts ship.
5. *(Robert)* Authorize the two-user staging session needed for W2's RLS verification.

**Acceptance gate.** On a live/staging build: a new user can sign up, complete onboarding, and the `profiles` row appears for their `auth.uid()`; relaunch restores the session; an existing user can delete their account and the auth + profile rows are gone (verified via authorized REST query). A `TestStore`/UITest covers sign-up → onboard → session.

**Effort: L.** **Top risk:** sequenced too late → it gates W2's RLS gate and the entire usable pilot, so it runs on the critical path immediately after W3.

---

### W5 — AI Coach & Proactive Coaching Brain

**Objective.** Turn the static Coach mockup into a real, streaming, context-aware, voice-safe coach, and implement proactive nudges. (Depends on W1 proxy + W3 wiring + W2 flags.)

**Tasks.**
1. *(Robert + Claude Code)* Lock the coach **system prompt + safety contract** enforcing CODEX-HANDOFF D13 voice (no judgment; never "missed/skipped/went over"), with hard no-go topics (medical diagnosis, ED triggers, dangerous restriction) and refusal language. Store as a versioned asset, not inline strings. Choose model/maxTokens/temperature.
2. *(Codex)* Add **streaming** to the iOS `AnthropicClient` (`AsyncThrowingStream` via `URLSession.bytes(for:)`) alongside the existing `complete()`; add preview/test streaming variants.
3. *(Codex)* `Features/Coach` `@Reducer`: transcript, in-flight streaming buffer, composer text, disabled/budget/error banners; `@Dependency` on `anthropicClient`/`featureFlags`/`nutritionRepository`/`healthKit`. Gate send on `coach_chat` and pass `featureFlag: "coach_chat"` explicitly.
4. *(Codex + Claude Code verify in simulator)* Replace `CoachChatView` with a real `Store`-backed chat (scrolling transcript, streaming bubble, composer); update `RootTabView` via the **Integration Owner**. Delete the hardcoded bubbles.
5. *(Codex)* `CoachContext` builder: recent meals + macro verdicts (`nutritionRepository`), daily targets (`NutritionDomain`), weight/health trend (`healthKit` when live); token-bounded, PII-limited. Unit-test against fixtures.
6. *(Codex + Robert for APNs)* `ProactiveCoachingFeature`: `UserNotifications` authorization + scheduling triggered by user-state events (end-of-day macro gap, streak, post-meal verdict). Local notifications ship first; remote push once Robert provisions APNs. Gate on `proactive_nudges` entitlement + `coach_chat`.
7. *(Codex)* Cost-cap/guardrail UX: surface "budget exceeded"/"feature disabled" as calm, non-judgmental banners; map refusals to a redirect, not a raw error.

**Acceptance gate.** On a device/simulator build pointed at the live proxy: typing and sending a coach message produces a **streamed** response; `grep -rn "Lunch should be protein-forward" ios/` returns nothing; a captured proxy request contains assembled context + the locked system prompt; an adversarial "I blew my diet today" message returns a non-judgmental reply (prompt-contract test asserts the no-go language); toggling `coach_chat=false` disables the coach in-app; exceeding the cap shows the budget banner; a simulated macro-gap event fires a voice-compliant local notification; `CoachFeatureTests` + context tests pass in CI.

**Effort: L.** **Top risks:** safety/brand-voice failure (locked prompt + adversarial CI suite + kill-switch); hard dependency on W1 (build against a local mock proxy honoring the contract, then flip the URL).

---

### W6 — Feature Completeness: Dashboard, Progress, Activity, Plans, Menu

**Objective.** Convert every remaining placeholder tab and string-builder into a real, reducer-backed, live-data feature at parity with the locked mockups. **This workstream owns Dashboard/Progress/Activity/Plans/Menu — the Coach shell belongs to W5; auth/onboarding belongs to W4 (dedup per critique §4).**

**Tasks.**
1. *(Claude Code)* **Parity matrix**: one row per mockup (`01`–`37`) → owning feature → reducer needed? → live dep needed? → status. This is the cut-line authority; any MVP deferral gets a dated `decisions.md` entry.
2. *(Codex)* Scaffold `Features/Dashboard`, `Features/Activity`, `Features/Progress`, `Features/Plans` (restaurant/recipe/grocery/meal-plan), `Features/Menu` SPM packages mirroring `Nutrition`. Register in `project.yml`/`App/Package.swift`; respect `check-feature-imports.sh`.
3. *(Codex)* **HealthKit live client**: entitlement + `NSHealthShareUsageDescription` in `project.yml`; implement `HealthKitClient.live()` against `HKHealthStore` (read bodyMass, steps, activeEnergy, workouts); deterministic `previewValue` fixtures; `.unimplemented` `testValue`.
4. *(Codex)* **Health Score / inflows-outflows model**: extend `MacroDaySnapshot` with an energy-out dimension; pure testable `computeHealthScore(meals:, health:)`. **Write the formula and v1 simplifications (active-energy-only until a BMR/profile exists) into `decisions.md`** — "Health Score" is currently undefined.
5. *(Codex)* `DashboardFeature`: load today's meals + HealthKit snapshot, compute verdict (`MacroDecisionEngine`) + Health Score; drive `HealthScoreHero`/`InflowsOutflowsCard`/`VerdictCard`. Mount via the Integration Owner.
6. *(Codex)* `ActivityFeature` (steps/energy/workouts) and `ProgressFeature` (weight trend via Swift Charts + manual check-ins persisted locally, body-photo via `FileAttachmentStore`). **Every row navigates somewhere — kill all dead affordances** (`ProgressOverviewView`/`ExerciseActivityView`).
7. *(Codex)* `PlansFeature`: convert `RestaurantGuidancePlan`/`RecipeBrowserPlan`/`GroceryListPlan`/`MealPlanGeneratorPlan` from `static func` builders into reducers backed by `nutritionRepository`/Supabase (curated chain DB per scope-delta S6; recipe bank; AI generation behind the W1 proxy for S3). Bind existing `*View.swift` destinations to stores.
8. *(Codex)* `MenuFeature`: route Menu/Help rows to real destinations; keep the already-real `AccountSubscriptionView`/`Founding100StatusCard` paths.
9. *(Integration Owner)* Update `RootTabView.swift` so every tab mounts a `Store`-backed feature (no `else if tab == … static View`).
10. *(Codex)* Surgically remove orphaned placeholder views/primitives *only where W6's changes make them dead*; list removals explicitly.

**Acceptance gate.** `grep -nE 'else if tab ==' ios/Features/App/Sources/App/RootTabView.swift` returns 0 static-view mounts; the parity matrix shows every row `real` or has a dated deferral; on a real device, granting HealthKit makes Home show a live verdict + inflows/outflows and Activity show real steps/energy; logging a weight check-in persists across relaunch; no tappable row navigates nowhere; denied-HealthKit renders a "connect Apple Health" state with a Settings deep link and no crash; `check-feature-imports.sh`/`check-theme-drift.sh`/`xcodebuild test` green.

**Effort: L (the largest product-code workstream — split per-feature in execution).** **Top risks:** shipping UI shells with no live backing (sequence behind W2/W3; ship reducer + previewValue UI with a tracked TODO and do NOT claim Phase 3 met); design drift (use `DesignSystem` tokens + `moonchild-design-implementation` against the mockups).

---

### W7 — Quality, Testing, Accessibility & Performance

**Objective.** The gate that decides whether FuelWell is *allowed* to ship: re-establish ground truth, extend the quality net over the newly-live paths, and make the Phase 4 gate real. **Principle: never assume green; re-verify every claim with an executable check, and a skipped test target = red.**

**Tasks.**
1. *(Claude Code — no prerequisites, run first)* **W7.0 baseline re-verify** on the current tree: `cd ios && xcodegen generate && xcodebuild test -scheme FuelWellApp -destination 'platform=iOS Simulator,name=iPhone 17'` — capture pass/fail per target, do not report green if any target is skipped; run `swiftlint --strict`, `check-feature-imports.sh`, `check-theme-drift.sh`.
2. *(Codex)* Close the CI path-filter blind spot: add a scheduled/`workflow_dispatch` full-suite run (or drop the path filter on `push: main`) so `main` is never green-by-omission.
3. *(Claude Code / Robert)* Restore the local branch-protection hook or confirm GitHub branch protection via `gh api repos/RBarbieri13/FuelWell/branches/main/protection`.
4. *(Codex — G22)* Add an `xccov` coverage floor to the `test` job (≥70% for `NutritionDomain`/`Core`/`CoachFeature`); CI fails below it.
5. *(Codex)* Expand unit tests for the now-live paths: `AnthropicClient` live request/response + `missingConfiguration`/`featureDisabled`; `CoachFeature` + the coach-voice prompt assertion; `SupabaseDatabaseClient`/`SubscriptionClient` live transports; a test asserting `subscriptionClient` is NOT `.unconfigured` at live launch; a feature-flag parity test (in-app set == DB seed).
6. *(Codex — G22)* Add a `FeatureSnapshotTests` target (Coach/DailyLog/Onboarding/Progress at default + `.accessibility5`, light/dark) and extend the `snapshots` CI job beyond `DesignSystemTests`.
7. *(Codex + Claude Code)* Extend `FuelWellCriticalPathUITests` to the full Phase 3 path once W4/W5 land.
8. *(Codex + Claude Code + Robert — G9/accessibility)* **Full accessibility pass**: add `accessibilityLabel/Hint/Value/AddTraits` + grouping to every interactive element in the real feature views (today only 25 annotations total, Hub screens have zero); adopt Dynamic Type app-wide; run `XCUIApplication().performAccessibilityAudit()` → zero issues; a WCAG-AA contrast unit test over `Theme.swift` token pairs; manual VoiceOver swipe-through on device.
9. *(Codex — G22)* Performance budgets: `XCTApplicationLaunchMetric`/`measure {}` for cold launch (≤1.5s), meal-save (≤100ms local), Coach round-trip; wired into CI, failing on regression — giving the Phase 4 "performance budgets met" gate an executable definition.
10. *(Robert + Claude Code — G11)* Kill-switch drill verified live once W2 applies `feature_flags`: extend `kill-switch-drill.sh` to `coach_chat`; confirm it no longer hits the BLOCKED branch.
11. *(Codex + Robert — G14)* Crash + analytics end-to-end: flip `analytics`/`crashReporter` to `liveValue` behind config; force a test crash and event; confirm in Sentry + PostHog (observed, not inferred).
12. *(Claude Code — G11)* Re-run `tools/release/check-phase4-readiness.sh` → exits 0 (the single measurable Phase 4 sign-off).

**Acceptance gate.** All simultaneously and **independently observed**: full `xcodebuild test` exits 0 with **all 13 targets executed, zero skipped**; lint/import/theme checks exit 0; iOS CI runs on a full-suite trigger and is green on the merged SHA; coverage floor enforced; `performAccessibilityAudit()` zero issues on every shipping screen + manual VoiceOver pass + WCAG-AA contrast test; perf budgets pass in CI; kill-switch drill exits 0 live and a forced crash/event is visually confirmed in Sentry/PostHog; `check-phase4-readiness.sh` exits 0.

**Effort: L.** **Top risks:** declaring "tests pass" with skipped targets (gate enumerates all 13); testing mock paths that never run live (sequence after W3/W5); green CI mistaken for shippable (gate requires live-observed kill-switch/crash/analytics + the device-bound release gate).

---

### W8 — Monetization & Commerce

**Objective.** Stand up the entire revenue path: Apple-compliant IAP, spoof-proof server validation, durable entitlements, the atomic Founding-100 hard cap of 100, and web↔app account linkage.

**Provider decision (recommended): RevenueCat.** Apple mandates StoreKit IAP for digital subscriptions (Guideline 3.1.1) — Stripe cannot process in-app digital subscriptions on iOS. RevenueCat sits on StoreKit 2, gives server-side validation + entitlements + webhooks, is free to ~$2.5k MTR (covers the Founding 100), and maps cleanly onto the existing `validate-provider` endpoint (`provider: 'revenue_cat'` is already an accepted enum). **Keep Stripe out of scope for IAP.** Record in `decisions.md`.

**Tasks.**
1. *(Claude Code records; Robert approves + creates accounts)* RevenueCat decision + account.
2. *(Robert)* App Store Connect IAP products: Pro (monthly+annual), Premium (monthly+annual), Founders 100 lifetime; Paid Apps Agreement, banking, tax. *(Schema reconciliation for `founders_100` is **W2's** job — W8 consumes it.)*
3. *(Codex)* Implement the **atomic hard cap** in the `reserve_founding100` RPC (`security definer`, `select … for update` on a counter or unique partial index on `spot_number` 1–100), returning the assigned spot or a clean sold-out error; DB-level backstop constraint; a concurrency test (101 parallel → exactly 100 succeed).
4. *(Codex/Claude Code; Robert for IDs)* iOS purchase flow: add RevenueCat SDK; implement `validateProviderReceipt` (currently `throw .missingConfiguration`) to POST to the `validate-provider` endpoint with the secret header; build a paywall/manage-subscription TCA feature; persist entitlements via `supabaseDatabase`.
5. *(Codex)* Extend `validate-provider` for the real provider (RevenueCat webhook + signature verification), mapping product IDs → entitlements; idempotency by event id.
6. *(Codex)* Tier gating implemented but **feature-flagged OFF for Pilot** (locked MVP rule: all seven features, no tier gating); Founders → Premium-equivalent for life.
7. *(Codex)* Web↔app linkage: call `link_marketing_signup_to_user` on first authenticated launch (match by `normalized_email`); fix the marketing signup route against the reconciled schema; add an in-app "I reserved a spot" manual-claim fallback.
8. *(Codex)* Fix the admin dashboard (renders against reconciled schema) and add a real auth gate to `/admin`.

**Acceptance gate.** Live probes of `subscription_entitlements`/`subscription_validation_events` return 200; `reserve_founding100` returns structured response (not `PGRST202`); 101-parallel reservation test → exactly 100 succeed, `count(*) ≤ 100` always; on TestFlight, a sandbox Apple ID completes a Pro purchase and within seconds a `subscription_validation_events` row + entitlement appear for that user (verified via Supabase, not the client); a marketing-site Founders reservation resolves in-app after sign-in with the same email (correct `spot_number`); `SubscriptionClient.live()` no longer degrades to `.unconfigured`; provider decision recorded in `decisions.md`.

**Effort: L (highest external-dependency surface).** **Top risks:** migrations not applied (gate on W2); `founders_100` reconciliation losing rows (W2's backfilling migration, never drop); hard-cap race (DB-enforced + concurrency test); Apple IAP rejection (Restore Purchases, terms, screenshots).

---

### W9 — TestFlight Pilot, App Store Submission & Operate

**Objective.** Convert "code merged + backend live" into "approved, distributed, operable App Store build the Founding 100 use without contacting support." Merges the prototype-retro/pilot and submission/operate work into one terminal workstream.

**Tasks.**
1. *(Robert + Max; Claude Code drafts)* **Prototype retro + waive-on-record (closes G15):** hold a 30-min retro; decide TestFlight-the-shell vs. waive Phase 0.6; write a dated `decisions.md` entry (with Max's sign-off) — the file currently has none; update the stale `MASTER-PLAN.md` status header; mark Phase 5/6 gates explicitly UNMET until observed.
2. *(Robert)* Apple/App Store Connect: confirm membership active; register bundle ID; create the app record from existing `metadata/en-US/`; create internal + external TestFlight groups; store `FUELWELL_APPLE_ID`/`TEAM_ID`/ASC API key/`SENTRY_AUTH_TOKEN` in `~/.fuelwell/*.env` (never committed).
3. *(Robert + Claude Code)* Code signing via Match: create the certs repo, set `FUELWELL_MATCH_GIT_URL`/`MATCH_PASSWORD`; verify `fastlane match appstore --readonly` resolves clean.
4. *(Codex/Claude Code; Robert approves)* App Store screenshots through the agreed image pipeline (create the missing `ios/fastlane/screenshots/` tree, all device classes) — generated from **real post-W5/W6 UI**, not placeholders; optional App Preview video.
5. *(Codex/Claude Code)* Wire an automated CI beta lane (`workflow_dispatch` → `fastlane beta` on a macOS runner, ASC API key auth, Match read-only), gated on quality+test jobs. Split `check-phase4-readiness.sh` into a "binary readiness" subset (CI-runnable) vs the device-bound subset (manual). **Shell-pilot escape, if used, is TestFlight-internal-only and code-fenced so it can never reach the `release` lane** (per critique §6).
6. *(Claude Code drafts; Robert submits)* **App Privacy nutrition labels + policy alignment:** inventory every data type — HealthKit reads, meal photos, email/auth identity, **AI prompt text sent to third-party Anthropic** — and disclose third-party AI processing; verify `privacy_url` returns 200 and lists Anthropic + Supabase + HealthKit + Sentry; add all required Info.plist usage strings (Health, Camera/Photo, Notifications).
7. *(Claude Code audit; Codex fixes; Robert confirms)* **Review-rejection hardening:** no dead affordances (Guideline 2.1); account deletion present (5.1.1(v), built in W4); HealthKit graceful denial (5.1.3); AI content guardrails server-side; a reviewer demo account in App Review Information.
8. *(Codex + Robert + Claude Code)* **Operate posture:** flip analytics/crash to live with provisioned Sentry/PostHog; make the kill-switch operable live (W2 applied flags) for `coach_chat` + `ai_meal_plan`; finalize `runbook.md` with concrete playbooks (AI proxy down → disable `coach_chat`; cost spike → rate-limit + flag; Supabase outage → degraded read-only; crash spike → halt phased release); define Sentry alert rules + escalation (Max@/Robby@FuelWellHealth.com).
9. *(Robert)* Recruit 2–5 outside testers (cross-reference the 21 `founders_100` rows as a candidate pool); send TestFlight invites; set expectations.
10. *(Robert submits; agents monitor)* Submit with demo account + complete App Privacy; enable **Phased Release** (7-day ramp) with go/no-go thresholds (crash-free ≥99.5%, AI proxy error <2%, no P0); monitor the first pilot week.

**Acceptance gate.** CI beta lane completes green ending in `upload_to_testflight`; `ls ios/fastlane/screenshots/` populated for every device class and shown in ASC; App Privacy submitted with all disclosures and `privacy_url` 200; app reaches "Ready for Sale"/"Pending Developer Release"; `check-phase4-readiness.sh` exits 0 against the real project and a live kill-switch drill toggles `coach_chat`+`ai_meal_plan` with PASS timings; ≥2 outside testers install + launch without crash with a feedback artifact filed; Phase 5/6 gate rows marked MET/UNMET-with-reason; first pilot week (7 days) completes with a clean Sentry incident log and zero unresolved Founding-100 escalations.

**Effort: L (calendar-dominated by Apple review latency + the 7-day pilot window).** **Top risks:** submitting a non-functional app (hard-block on W1/W2/W4/W5/W6); App Privacy mis-declaration of third-party AI processing; Match unprovisioned; kill-switch theater; no live telemetry during rollout.

---

### W10 — Multi-Agent Execution Orchestration

**Objective.** Define *how* W1–W9 execute with maximum safe parallelism and a verifiable gate between every node, so "committed" can never again be mistaken for "gate green." Detailed blueprint in the [Orchestration](#multi-agent-orchestration-blueprint) section below; this entry states scope, tasks, and gate.

**Tasks (summary).** (1) Resolve the dirty working tree + ignore `~/FuelWell` + decide PR #74's fate → clean `main@eb5b0e0` baseline (G18). (2) Author `tools/orchestrator/plan.yaml` + `docs/EXECUTION-PLAN.md` using the **canonical W1–W10 IDs** (the draft's phantom mapping is discarded). (3) Encode the audited dependency edges + critical path. (4) Worktree isolation for parallel code edits, with the hot-spot files excluded and routed through the Integration Owner. (5) Survey→build→verify phase machine. (6) Runnable per-node gates (no "manual review" gates). (7) Dynamic pacing (topo-sort worklist, concurrency cap, critical-path/blocker priority, human-node escalation, 3-minute watchdog). (8) Extend the PR #74 dashboard into a live cockpit. (9) Codify human-in-the-loop checkpoints.

**Acceptance gate.** `python tools/orchestrator/validate_plan.py` exits 0 (every node has `depends_on`, a literal `gate` command, an `agent`, a `worktree` flag); `--dry-run` prints a valid acyclic topo order with the critical path highlighted, shows tick-1 ready set, and shows throttle-to-1 when only hot-spot nodes remain; worktree add/generate/teardown works on a no-op probe; the four blocker gates (W1 proxy curl, W2 anon-REST-not-404, W3 live-wiring test, W9 `check-phase4-readiness.sh`) are wired and runnable; the cockpit renders live node status; `docs/EXECUTION-PLAN.md` supersedes the stale `MASTER-PLAN.md` header.

**Effort: L and explicitly experimental** (per critique §4 — the auto-merge-on-green-CI harness is itself unproven; validate it manually on the first 2–3 nodes before trusting fan-out). **Top risk:** mis-encoding a dependency edge or parallelizing a hot-spot → silent merge corruption that CI-green will not catch.

---

## Dependency Graph & Critical Path

**The true longest serial chain to a shippable, App-Store-approvable app** (per critique §2 — the drafts under-stated auth and Apple latency):

```
[Robert, DAY 0, in parallel]:  Supabase service-role + staging/prod decision
                               Anthropic API key
                               Apple enrollment + ASC record + Match certs repo
        │
        ▼
   W2  Migrations applied + founders_100 reconciled  (single owner)
        │
        ▼
   W3  Live dependency wiring  (Integration Owner; AppLaunchDependencies)
        │
        ├──────────────────────┐
        ▼                       ▼
   W4  Auth + Onboarding    W1  Anthropic proxy  ──►  W5  AI Coach brain
        │   (CRITICAL)           (parallel sub-chain)
        ▼
   Phase 3 end-to-end path on device
        │
        ▼
   W6  Feature completeness  +  W8 Commerce  +  W7 Quality (trail each feature)
        │
        ▼
   W9  TestFlight pilot  ──►  App Store review (1–3 wk, NOT compressible)  ──►  Phased rollout
```

**Critical path:** `Robert provisioning → W2 → W3 → W4 → Phase 3 path → W9 → Apple review`. W1→W5 is a **parallel critical sub-chain** feeding the headline feature.

**Genuinely parallel after a clean baseline (disjoint files):**
- **W1** Anthropic proxy (`src/app/api/coach/`) ∥ **W6's** HealthKit live client (`Packages/HealthKitClient`) ∥ **W2's** persistence engine swap (`Packages/Persistence`, `Core`) ∥ **W7's** accessibility annotation pass on existing views.

**Serialization hot-spots — ONE owning agent each (the highest merge-corruption risk in the program):**

| File | Claimants | Rule |
|---|---|---|
| `AppLaunchDependencies.swift` | W1, W3, W6, W8 | Integration Owner serializes all edits |
| `RootTabView.swift` / `HubScreens.swift` | W5, W6 | Integration Owner serializes; non-tab work proceeds in parallel branches |
| `SupabaseClient.swift` / `SupabaseSubscriptionTransport.swift` | W2, W3, W8 | W2 lands the base; W3/W8 consume |
| All `ios/supabase/migrations/*.sql` + the live apply | W2 only | W1/W5/W6/W8 consume the applied schema |

**Shortest path to *a* shippable build:** front-load Robert's three provisioning tracks on day 0; run W1/HealthKit/persistence/accessibility in parallel during the human-latency window; drive W2→W3→W4 as the serial spine; trail W7 behind each feature; submit to App Store the moment W4+W5+W6+W8 clear their gates — because Apple review latency is the single longest non-compressible clock.

---

## Multi-Agent Orchestration Blueprint

Run this with **Codex agents** (mechanical/large-diff codegen) and **Claude Code agents** (architecture-sensitive wiring, TCA reducers, `@Dependency` graphs, review) coordinated by a dynamic workflow orchestrator. The raw materials already exist — real CI, a build-status dashboard (PR #74), `gh`, XcodeGen — but nothing coordinates multiple agents or gates phase-to-phase. W10 supplies that.

**Operating principles:**
- **Canonical IDs only.** The orchestrator references W1–W10 exactly as defined above. The earlier phantom mapping is discarded.
- **Gates are commands, never "looks done."** "Green" binds to a *merged SHA*, never to `main`'s tip (closing the path-filter gap).
- **Hot-spot files route through one Integration Owner**, excluded from parallel worktrees.
- **Human nodes pause-and-escalate**; they are front-loaded so Robert's manual steps overlap with agent work.
- **Validate the harness manually on the first 2–3 nodes before trusting fan-out** (the harness is itself experimental).

```python
# tools/orchestrator/run.py — survey → build → verify, dependency-ordered, worktree-isolated.
REPO         = "/Users/robert.barbieri/Developer/FuelWell"   # canonical; NEVER ~/FuelWell
MAX_PARALLEL = 4
MAX_RETRIES  = 2
PLAN         = load_yaml("tools/orchestrator/plan.yaml")      # CANONICAL nodes W1..W10

# Node sketch (canonical IDs; gate = measurable check):
# HUMAN  provisioning  depends_on: []            agent: human   (Supabase key+proj decision; Anthropic key; Apple enroll+ASC+Match)
# W1 proxy            depends_on: [HUMAN, W2]    agent: codex   worktree: src-proxy
#    gate: curl POST $COACH_PROXY -> {text,request_id}; cap breach -> 429
# W2 migrations+data  depends_on: [HUMAN]        agent: claude  worktree: supa   (OWNS all migrations + the live apply)
#    gate: anon HEAD feature_flags/profiles/meals != PGRST205; founders_100 has normalized_email; _ = store gone
# W3 live wiring      depends_on: [W2]           agent: claude  worktree: app    (HOT: AppLaunchDependencies — Integration Owner)
#    gate: FUELWELL_USE_LIVE_BACKEND=1 -> resolves liveValue (unit test); default build still mock
# W4 auth+onboarding  depends_on: [W2, W3]       agent: claude  worktree: auth   (CRITICAL)
#    gate: signUp->onboard->session persisted (UITest); delete-account cascades
# W5 coach brain      depends_on: [W1, W3]       agent: claude  worktree: coach
#    gate: streamed reply w/ assembled context; voice-contract test; kill-switch disables in-app
# W6 features         depends_on: [W3]           agent: codex   worktree: feat   (HOT w/ W5: RootTabView/HubScreens)
#    gate: no static tab mounts; parity matrix closed; HealthKit live on device
# W7 quality          depends_on: [W3,W4,W5,W6]  agent: codex+claude worktree: qa
#    gate: all 13 targets executed 0 skipped; a11y audit 0 issues; perf budgets; kill-switch live
# W8 commerce         depends_on: [W2]           agent: claude  worktree: commerce (HOT: AppLaunchDependencies, SubscriptionTransport)
#    gate: 101 parallel -> exactly 100; sandbox Pro purchase -> entitlement row; linkage resolves
# W9 pilot+launch     depends_on: [W4,W5,W6,W7,W8] agent: human+claude worktree: release
#    gate: check-phase4-readiness.sh exits 0 AND ios-ci.yml SUCCESS on SHA AND TestFlight build live

HOTSPOTS = ["ios/Features/App/Sources/App/AppLaunchDependencies.swift",
            "ios/Packages/SupabaseClient/.../SupabaseSubscriptionTransport.swift",
            "ios/Features/App/Sources/App/RootTabView.swift",
            "ios/Features/App/Sources/App/HubScreens.swift"]

def main():
    ensure_clean_baseline()      # W10 Task 1: main@eb5b0e0, no untracked dup, ~/FuelWell ignored, PR#74 resolved
    survey_phase()               # READ-ONLY agents refresh each node's current_state (incl. authorized live probes)
    build_verify_loop()
    final_release_gate()

def survey_phase():
    parallel_map(PLAN.nodes, lambda n: spawn_agent(
        kind="claude", mode="read-only",
        prompt=f"Re-verify current_state of {n.id} vs live repo + authorized probes; "
               f"emit gate feasibility. Do NOT edit code."))
    rewrite("tools/orchestrator/plan.json")   # cockpit feed

def build_verify_loop():
    done, running = set(), {}
    while not all_done(PLAN, done):
        ready = [n for n in PLAN.nodes
                 if n.id not in done and n.id not in running and deps_satisfied(n, done)]
        ready.sort(key=lambda n: (not n.on_critical_path, n.risk != "blocker"))  # crit + blockers first
        cap = 1 if only_hotspots(ready) else MAX_PARALLEL   # DYNAMIC PACING
        for n in ready[: cap - len(running)]:
            if n.agent == "human":
                pause_and_escalate(n); continue             # provisioning / App Review -> wait for Robert
            wt = make_worktree(n)                            # git worktree + xcodegen generate + isolated DerivedData
            running[n.id] = spawn_agent(kind=n.agent, worktree=wt, prompt=build_prompt(n))
        for n in await_any(running, watchdog_secs=180):     # 3-min rule: interrupt + surface long tasks
            ok, log = run_gate(n)                            # VERIFY: execute n.gate literally
            if ok:
                integrate(n); trigger_ci(n.merged_sha)       # re-scope "green" to THIS sha
                if ci_green(n.merged_sha): done.add(n.id); teardown_worktree(n)
                else: requeue(n, "ci-red", log)
            else:
                n.retries += 1
                requeue(n, "gate-fail", log) if n.retries <= MAX_RETRIES else pause_and_escalate(n, log)
            running.pop(n.id)

def integrate(n):
    if touches_hotspot(n, HOTSPOTS):
        with integration_owner_lock():                       # one agent owns AppLaunchDependencies et al.
            merge_in_dep_order(n.branch)                      # W2 < W3 < {W4,W5,W6,W8}
    else:
        merge_ff(n.branch)                                    # disjoint files -> fast-forward

def final_release_gate():
    require_human(["AppStoreConnect","Signing/Match","Secrets","Screenshots","AppPrivacy"])
    assert run("tools/release/check-phase4-readiness.sh") == 0
    assert ci_green(head_sha())
    # only now: fastlane beta -> TestFlight -> pilot -> submit
```

**How the phases fan out.** Tick 1's ready set is the HUMAN provisioning node plus W2 (once secrets land). When W2 gate-greens, W3 unlocks — it's critical-path and hot-spot, so concurrency narrows and it routes through the Integration Owner. After W3, the ready set expands to {W1's downstream W5, W4, W6, W8}; W4 (critical) dispatches first; W5/W6 both edit `RootTabView`/`HubScreens` so their tab-mount changes serialize through the Integration Owner while their non-hotspot work runs in parallel. W7 trails the features; W9 becomes ready only when W4–W8 are gate-green and CI is green on the merged SHA, then blocks on Robert's human checkpoints and Apple review.

---

## Phased Timeline

Six milestones with explicit entry/exit gates. Durations are relative; the dominant clocks are Apple review latency (1–3 weeks, in M6) and the 7-day pilot window (M5).

### Milestone 0 — Clean Baseline & Provisioning *(day 0, mostly human)*
- **Entry:** sign-off on this plan.
- **Work:** W10 Task 1 (clean tree, ignore `~/FuelWell`, resolve PR #74); Robert provisions the three tracks — Supabase service-role + staging/prod decision (D-1), Anthropic key, Apple enrollment + ASC record + Match certs; author `plan.yaml`/`EXECUTION-PLAN.md`.
- **Exit:** clean `main@eb5b0e0` baseline; three provisioning tracks confirmed; orchestrator `--dry-run` valid.

### Milestone 1 — Backend Alive *(W2, then W3; W1 in parallel)*
- **Entry:** M0 exit.
- **Work:** W2 migrations applied + `founders_100` reconciled + real local SQLite store; W1 proxy deployed with cost caps; W3 live-wiring toggle.
- **Exit:** live REST probes return 200 (not PGRST205/202); proxy curl returns `{text,request_id}` + 429 on cap; a live build resolves `liveValue`; default build still mock + CI green.

### Milestone 2 — Brain Online *(W4 + W5)*
- **Entry:** M1 exit.
- **Work:** W4 auth/onboarding/profile/account-deletion; W5 Coach reducer + streaming + context + voice contract + proactive nudges.
- **Exit:** sign-up→onboard→session persists; RLS two-user gate passes; streamed coach reply with assembled context; voice-contract + kill-switch verified.

### Milestone 3 — Feature-Complete *(W6, W7 trailing)*
- **Entry:** M2 exit.
- **Work:** W6 Dashboard/Activity/Progress/Plans/Menu real + HealthKit live + parity matrix closed; W7 unit/snapshot/UI/accessibility/perf nets over the live paths.
- **Exit:** no static tabs, no dead affordances; HealthKit live on device; accessibility audit 0 issues; all 13 test targets execute green; perf budgets pass.

### Milestone 4 — Monetize *(W8)*
- **Entry:** M3 exit (W2 schema live).
- **Work:** RevenueCat IAP, server validation, atomic 100-cap, tier gating (flagged off for Pilot), web↔app linkage, admin fix.
- **Exit:** 101-parallel → exactly 100; sandbox Pro purchase yields a verified entitlement row; linkage resolves a marketing reservation in-app.

### Milestone 5 — Pilot *(W9 part 1)*
- **Entry:** M2–M4 gates green; analytics/crash live; kill-switch live.
- **Work:** prototype waive recorded; CI beta lane; screenshots from real UI; recruit 2–5 testers; `check-phase4-readiness.sh` exits 0.
- **Exit:** TestFlight build "Ready to Test"; ≥2 outside testers installed without crash; first pilot week clean per the runbook (Phase 5/6 gates MET).

### Milestone 6 — Launch *(W9 part 2; Apple-clock-bound)*
- **Entry:** M5 exit.
- **Work:** App Privacy labels + policy alignment; review-rejection hardening (account deletion, demo account, AI guardrails); submit; Phased Release with go/no-go thresholds; operate.
- **Exit:** "Ready for Sale"; phased rollout live with Sentry crash-free ≥99.5% and AI proxy error <2%; first production week with no incident outside the runbook; **Phase 7 gate: Founding 100 can sign up, pay, and use the app without contacting support.**

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Dependency-graph mis-encoding parallelizes a hot-spot → silent merge corruption** (CI-green won't catch a wrong-but-compiling `@Dependency` wire) | Med | High | Single Integration Owner for `AppLaunchDependencies`/`RootTabView`/`HubScreens`; hot-spots excluded from parallel worktrees; validate the harness manually on first 2–3 nodes. |
| **Submitting a non-functional app → Apple Guideline 2.1 rejection** | Med | High | Hard-block W9 submission on W1/W2/W4/W5/W6 gates; no dead affordances (W6+W7); demo account. |
| **`founders_100` reconciliation loses the 21 real production rows** | Low-Med | High | W2 owns one backfilling `alter table` (never drop); snapshot first; test against a staging copy. |
| **Unbounded AI spend on a paid model** | Med | High | Server-side per-user + global caps + 429 (W1); `coach_chat` kill-switch verified before any device points at the proxy; load-model the 100-user × Claude cost before scaling. |
| **Apple review latency + rejection-resubmit loops** (1–3 wk, non-compressible) | High | Med | Treat as a first-class M6 critical-path line-item; front-load enrollment/ASC in M0; harden against the common rejection classes (privacy, 5.1.1(v), 5.1.3) before first submit. |
| **App Privacy mis-declaration of third-party AI processing** (health-adjacent prompt text → Anthropic) | Med | High | W9 Task 6 inventories the proxy data flow; disclose third-party AI; verify `privacy_url` 200 and lists Anthropic/Supabase/HealthKit/Sentry. |
| **Auth slips because it was historically un-owned** | Med | High | W4 is a dedicated blocker-tier workstream on the critical path immediately after W3; it gates W2's RLS gate and the pilot. |
| **Code-signing / Match first-build time sink** (no `FUELWELL_MATCH_GIT_URL` default, certs repo absent) | High | Med | Sequence W9 Task 3 early + human-owned; prefer ASC API key over interactive Apple-ID/2FA; budget a full day for first-run signing. |
| **Founding-100 hard-cap race oversells lifetime spots** | Med | High | DB-enforced (`for update` + unique index in `reserve_founding100`); 101-parallel concurrency test as a permanent regression. |
| **Kill-switch theater** (targets a non-existent table, single flag) | Med (today) | Med | W2 applies `feature_flags` first; extend the drill to `coach_chat`; gate on a live PASS run, not the BLOCKED branch. |
| **No live telemetry during rollout** (analytics/crash `.noop`) | Med | Med | Flip to `liveValue` + provision Sentry/PostHog before phased rollout; go/no-go thresholds depend on this signal. |
| **"Green CI" mistaken for shippable** (path filter skips iOS CI on website commits) | High (current behavior) | Med | Bind "green" to merged SHA; add a full-suite trigger; W7 gate requires live-observed kill-switch/crash/analytics. |
| **Working from the stale `~/FuelWell` clone or off-`main` branch** | Med | Med | M0 forces clean `main@eb5b0e0`; every lane run asserts `git remote -v` + `HEAD` vs `origin/main` before `build_app`. |
| **Orchestration harness itself is unproven** | Med | Med | W10 rated L/experimental; run first nodes manually; `MAX_RETRIES=2` then human triage; 180s watchdog; concurrency cap. |
| **Streaming/partial-failure UX** | Med | Low-Med | Keep non-streaming `complete()` as fallback; finalize partial bubble with a retry affordance on mid-stream disconnect. |

---

## Definition of Done

FuelWell is a polished, deployed, professional iOS app — the locked 7-feature MVP in the hands of the Founding 100 — when **all** of the following are objectively true and independently observed (not inferred from absence of error):

**Backend & data**
- [ ] The Anthropic proxy is deployed; a contract curl returns `{text, request_id}`; per-user + global cost caps enforce a 429 on breach; token usage is recorded in `coach_usage`.
- [ ] All Supabase migrations are applied to the chosen project; live REST probes return 200/206 (no `PGRST205`); RPCs resolve (no `PGRST202`); `founders_100` carries `normalized_email`/`source` with all 21 original rows intact.
- [ ] The `Persistence` SQLite stub is gone (`grep "_ = store"` empty); meals persist to a real local store and sync to Supabase; a two-user RLS probe proves isolation.

**App functionality**
- [ ] App launches; with the live config it talks to the real proxy + DB; default/preview builds keep mocks and CI stays green.
- [ ] Sign up → onboard → log meal → see verdict → ask coach (streamed, context-aware, voice-compliant) → get a proactive nudge → check progress runs end-to-end on a physical device without crashing.
- [ ] Every tab mounts a real reducer; no tappable element navigates nowhere; HealthKit is live with graceful denial; account deletion works.
- [ ] All seven locked features are real (not deterministic placeholders), shipping with no tier gating at Pilot.

**Commerce**
- [ ] A sandbox Apple ID completes a Pro purchase; an entitlement row appears server-side within seconds; the Founding-100 cap holds at exactly 100 under concurrency; a marketing-site reservation links to the in-app account by email.

**Quality, accessibility & operate**
- [ ] Full `xcodebuild test` is green with all 13 targets executed (zero skipped); coverage floor enforced; `swiftlint --strict` + import + theme checks pass.
- [ ] `performAccessibilityAudit()` returns zero issues on every shipping screen; a manual VoiceOver pass reaches every element; theme token pairs pass WCAG AA; Dynamic Type works to `.accessibility5` without truncation.
- [ ] Performance budgets pass in CI (cold launch ≤1.5s, meal-save ≤100ms).
- [ ] A live kill-switch drill toggles `coach_chat` + `ai_meal_plan` and restores them; a forced crash appears in Sentry and a known event in PostHog.

**Launch & process**
- [ ] `check-phase4-readiness.sh` exits 0 against the real project; the CI beta lane produces a TestFlight build.
- [ ] App Privacy labels disclose HealthKit, photos, email/identity, and third-party AI processing; `privacy_url` returns 200 and lists all processors.
- [ ] The app reaches "Ready for Sale"; Phased Release is live; the first production week completes with no incident outside the runbook.
- [ ] The Phase 0.6 skip and all material deviations are recorded in `docs/decisions.md`; `MASTER-PLAN.md`'s stale status header is superseded by `EXECUTION-PLAN.md`.
- [ ] **Phase 7 gate met: the Founding 100 cohort can sign up, pay, and use the app without contacting support.**

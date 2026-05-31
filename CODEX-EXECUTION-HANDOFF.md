# CODEX EXECUTION HANDOFF — Build FuelWell to a Shipped iOS App, Autonomously

**To:** Codex (lead orchestrator) and any agents it spawns
**From:** Claude Code session, 2026-05-31
**Mandate:** Take FuelWell from its current state (a fully-architected iOS shell running on mocks) to a **polished, deployed, professional iOS app in the App Store**, working **autonomously with parallel agents** and pausing only for the **Vital Questions** enumerated below.

---

## 0. TL;DR — your standing orders

1. **Read the plan.** Your complete, authoritative spec is `docs/EXECUTION-PLAN.md` (in this repo). Human-readable mirror: `~/Desktop/FuelWell-Master-Execution-Plan-FINAL-2026-05-31.docx`. **Do not re-plan it — execute it.**
2. **Build to completion.** Work the ten workstreams (W1–W10) along the critical path in the plan. Self-organize with parallel agents and git worktrees. Do not stop at the end of one workstream and wait — chain to the next.
3. **Minimize human intervention.** Make reasonable engineering decisions, log them, and keep going. **Only stop for a Vital Question** (Section 4). Batch every non-vital question into a single periodic digest rather than blocking.
4. **Every gate is a runnable check.** "Committed" ≠ "done." Nothing is complete until its acceptance gate (Section 6) passes and you have run it.
5. **Respect the repo rules** in `AGENTS.md` absolutely — never commit to `main`, one feature branch + PR per unit of work, auto-push is on.

---

## 1. Plan Location & Source of Truth

| Artifact | Path | Role |
|---|---|---|
| **Execution plan (canonical)** | `docs/EXECUTION-PLAN.md` | Your spec. W1–W10, dependency graph, critical path, gates, orchestration blueprint (W10), Definition of Done. |
| Plan (human mirror) | `~/Desktop/FuelWell-Master-Execution-Plan-FINAL-2026-05-31.docx` | For Robert. Same content. |
| Design contract | `docs/ios-guide/DESIGN.md` | The locked visual spec. Tokens → `ios/Packages/DesignSystem/Sources/DesignSystem/Theme.swift` (generated). |
| Locked mockups | `docs/ios-guide/mockups/html/*.html` | 38 files / 37 screens. The parity target for every screen. |
| Decisions of record | `docs/FuelWell-Gap-Analysis.md`, `docs/FuelWell-Gap-Analysis-Log.md` | Binding product decisions (e.g. **$5/$10 AI cost cap = item #12**, Anthropic Claude locked provider). |
| Prior handoffs | `ios/HANDOFF-REPORT*.md` | What previous phases actually delivered. Read the relevant one before touching a feature. |

**Stale — do NOT trust as status:** `docs/FuelWell-Phase-Plan.md` (checkboxes show Phase 1+ unchecked; superseded by `docs/EXECUTION-PLAN.md`) and any "Phase N done" commit title. The plan's **Reconciliation of Two Independent Audits** section explains why committed work ≠ shippable.

---

## 2. Where things actually stand (read, then verify yourself)

The plan's **Verified Current State** and **Gap Register** are authoritative; the one-paragraph version:

> FuelWell is a beautifully architected, fully-navigable iOS shell with **one real feature cluster (nutrition macro logging)** and a **stubbed brain**. The app boots **entirely on mock dependencies** (`ios/Features/App/Sources/App/AppLaunchDependencies.swift` wires `anthropicClient/supabaseDatabase/featureFlags/healthKit=.previewValue`, `analytics/crashReporter=.noop`). Real `liveValue` clients exist but are never selected. **The Anthropic proxy server does not exist.** The **Supabase schema was never applied** (live probes return `PGRST205/PGRST202`). There is **no auth/onboarding/profile feature**. **No StoreKit/RevenueCat/Stripe.** Only the **marketing website** (Next.js on Fly.io) is genuinely live.

**Before you write any code, run the baseline re-verify (plan W7.0):** confirm the iOS project still builds and the gates are green *today* (Section 6), and resolve the PR #74 (open) / #75 status via `gh`. Establish a known-green starting point. If the baseline is NOT green, fixing it is your first PR.

---

## 3. The execution shape (from the plan — do not deviate)

Follow the plan's **Dependency Graph & Critical Path**. The serial spine that gates shipping:

```
Day-zero provisioning (Vital Questions, Section 5)
   └─> W1 Backend Activation (build Anthropic proxy + apply migrations + flip live wiring)
        └─> W2 Data/Persistence ─┐
        └─> W4 Auth/Onboarding ──┤
                                 └─> W3 AI Coach + W5 Feature Completeness  (the "make the brain real" core)
                                      └─> W6 Quality/Test/A11y
                                           └─> W7 Monetization
                                                └─> W8 Prototype Retro + TestFlight Pilot
                                                     └─> W9 App Store Submission  ──> Apple review (1–3 wk, non-compressible)
W10 Orchestration/cockpit runs continuously alongside everything.
```

**Endorsed first move (both audits agree):** the **"Make the brain real"** thread — wire the Coach to a cost-capped Claude proxy against live context (W1 + W3, fed by W2/W4). It can begin against a **local mock proxy honoring the W1 contract** while the live data path lands, then flip the URL. See plan W5 top-risk row.

---

## 4. VITAL QUESTIONS — the only reasons to stop and ask Robert

Pause and ask **only** when an action falls into one of these. Everything else: decide, log, proceed.

1. **Secrets / credentials.** Any API key, service-role key, signing cert, or token you don't already have. Never fabricate, guess, commit, or echo a secret. (You will need several — batch them up front, Section 5.)
2. **Spending money / provisioning paid resources.** Creating a paid cloud resource, a RevenueCat/Stripe account, an Apple paid membership, a new Supabase/Fly plan, or anything that incurs cost.
3. **Apple Developer & App Store Connect actions.** Enrollment, certificates/profiles tied to Robert's identity, TestFlight invites to real people, and **any App Store submission or release** — submission is always a Vital Question, never autonomous.
4. **Undecided product forks with lasting cost.** The **payment provider (RevenueCat vs Stripe)** if not already recorded in `docs/FuelWell-Gap-Analysis*.md`; pricing/tier changes; anything that contradicts a recorded decision.
5. **Destructive or irreversible operations.** Applying migrations to a **production** database that holds real data (the live `founders_100` has 21 real rows — schema-migrate with extreme care; prefer an additive, reversible migration and confirm before running against prod), `git push --force`, history rewrites, deleting data, dropping tables, `rm -rf` of anything you didn't create.
6. **Legal / privacy / security surface.** Privacy policy text, App Privacy nutrition labels, data-handling decisions, or anything that changes what user data is collected or where it goes.
7. **A gate you cannot make pass** after a genuine root-cause attempt, where the fix needs a decision only Robert can make.

**How to ask:** one concise message, the specific decision, the options, your recommendation, and what's blocked until answered. Keep working on anything not blocked by it.

---

## 5. Day-zero provisioning batch (ask ONCE, up front)

Before W1 can reach "live," you need these from Robert. Collect them in **one** request so he answers once, then proceed against mocks for everything not yet provided:

- [ ] **Anthropic API key** for the server-side proxy (never goes in the app or git; server env only). Confirm the **$5/$10 per-user cost cap** (`Gap-Analysis` #12) as the live default.
- [ ] **Proxy host decision** — recommend: a route on the existing Fly `fuelwell-website` app **or** a Supabase Edge Function. State your pick; proceed unless Robert objects.
- [ ] **Supabase**: confirm project `xzsftuxvnkgxtbiibvac` is the target, and provide the **service-role key** (server-side only) for applying migrations + admin ops.
- [ ] **Apple Developer Program** enrollment status + App Store Connect access (needed for W8/W9; TestFlight + submission).
- [ ] **Payment provider** (RevenueCat recommended for an iOS subscription app) — confirm choice + account, or defer W7 until decided.
- [ ] **APNs / push** entitlement for proactive coaching (W3) — confirm you may enable the capability.

For anything not yet provided: implement behind the existing `liveValue`/`previewValue` seam and a config flag so flipping to live is a one-line change once the secret arrives.

---

## 6. Acceptance gates — the canonical commands (run from `ios/`)

A workstream/PR is **not done** until ALL of these pass. These are the exact CI gates (`.github/workflows/ios-ci.yml`) — run them locally before opening/merging a PR:

```bash
xcodegen generate --spec project.yml
swiftlint --strict --config .swiftlint.yml
scripts/check-feature-imports.sh
scripts/check-theme-drift.sh
bash -n tools/release/check-phase4-readiness.sh \
       tools/release/check-phase7-founding100.sh \
       tools/release/check-phase7-commerce-linkage.sh \
       tools/operate/check-operate-readiness.sh
xcodebuild test -scheme <app-scheme> -destination 'platform=iOS Simulator,name=iPhone 15 Pro'   # full suite, must be green
# + the Snapshot Tests job
```

Plus each workstream's **own** acceptance gate as written in `docs/EXECUTION-PLAN.md`. Plus, per `AGENTS.md`: **no dead affordances** — every visible chevron/button/card must navigate to a real destination or be explicitly disabled/hidden before a UI PR.

**Fail loud.** If a gate is skipped or red, say so with the output. Never report green you didn't observe. "Tests pass" is false if any were skipped.

---

## 7. Parallel execution protocol

You are the orchestrator. Maximize safe parallelism; the dependency graph (Section 3) defines what may run concurrently.

1. **One git worktree per active workstream**, each on its own `feature/<workstream>-<slug>` branch off latest `main`. This lets independent workstreams' agents edit in isolation without colliding.
2. **Single-owner rule for hot-spot files.** Files many workstreams touch (`AppLaunchDependencies.swift`, `RootTabView.swift`, `project.yml`, `Theme.swift`, migration files) get **one owning agent at a time**. Never let two parallel branches edit the same file (`AGENTS.md` rule 7). Serialize edits to shared files through a single integration branch.
3. **Parallelizable now (after W1 lands the seam):** W2 (persistence), W4 (auth/onboarding), W6 test scaffolding, W9 asset prep, and W10 cockpit can proceed concurrently. **Serial:** W3/W5 depend on W1+W2+W4; W7 depends on auth; W8 depends on a feature-complete build; W9 submission depends on W8.
4. **Per-workstream loop:** `git checkout main && git pull` → `git checkout -b feature/<w>` → implement against the plan's task list → run all gates (Section 6) → open PR via `gh` → self-review (use `code-review`) → **merge your own PR when CI is green** (squash). If branch protection requires a human review you cannot satisfy, queue the PR and note it in the digest (this is a process blocker, not a Vital Question unless it stalls the critical path).
5. **Use the local skill stack** (`AGENTS.md`): Moonchild for design-system/route work, `impeccable` to harden screens, `image-to-code` from the locked mockups. Don't ship generic SwiftUI where a mockup exists.
6. **Adversarially verify** risky changes (live wiring, migrations, money paths) with a second agent before merge.

---

## 8. Tools at your disposal

- **Parallel sub-agents + git worktrees** (your primary orchestration mechanism).
- **`gh` CLI** — PRs, CI status, issues, merges (authed as RBarbieri13).
- **`xcodegen`, `swiftlint`, `xcodebuild`**, the iOS Simulator, and `ios/scripts/*` gate scripts.
- **Supabase** (CLI / service-role) for migrations once provisioned; migrations live in `ios/supabase/migrations/`.
- **Fly.io** (`fly`) for the proxy/website host.
- **`tools/build-dashboard`** (PR #74) — the reconciliation cockpit; extend it into your live progress board (W10).
- The Vercel/Supabase/Sentry skills and MCP servers as needed.

If a needed tool/MCP isn't connected (e.g. Moonchild MCP), say so and ask for the install command rather than faking fidelity.

---

## 9. Progress visibility (so Robert can stay hands-off)

Robert wants **little intervention but full visibility**. Provide it without blocking:

- Maintain a running **`docs/EXECUTION-STATUS.md`** (or the build-dashboard from W10): current workstream, last gate result, what merged, what's next, and any queued non-vital questions. Update it at each PR merge.
- Post a **periodic digest** (e.g. per milestone) summarizing progress + batching all non-vital questions. Reserve direct interrupts for **Vital Questions only**.
- When you hit a milestone gate (Backend Alive → Brain Online → Feature-Complete → Monetized → Pilot → Submitted), announce it with the evidence that the gate passed.

---

## 10. Definition of Done (the finish line)

From the plan's **Definition of Done** — you are done when, on a real device:
**sign up → onboard → log a meal → see the verdict → ask the coach (real Claude, cost-capped) → receive a proactive nudge → check progress (live HealthKit + Supabase)** all work end-to-end with no crashes; all gates green; commerce live for the Founding 100 (pay without contacting support); and the app is **submitted to the App Store** (submission itself = the final Vital Question to Robert).

Until then: keep building. Stop only for Vital Questions. Verify everything. Fail loud.

— End of handoff —

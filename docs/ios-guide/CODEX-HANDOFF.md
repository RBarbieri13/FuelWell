# FuelWell — Codex Handoff

> **Read this first, every session.** Codex tends to default to whatever local folder it was launched in. The truth lives on GitHub, not on Robert's Mac. If your working tree disagrees with the remote, the remote wins. Pull before you do anything.

---

## 1. Where the truth lives

**Repository:** `RBarbieri13/FuelWell` on GitHub
**Active branch:** `feature/phase-0-realignment` (PR #27, draft)
**`main` is protected:** never commit there directly. A pre-commit hook will block it; GitHub branch protection enforces it remotely.

**Clone fresh if you're unsure of the local state:**

```bash
gh auth status || gh auth login        # one-time auth
git clone https://github.com/RBarbieri13/FuelWell.git ~/Developer/FuelWell
cd ~/Developer/FuelWell
git checkout feature/phase-0-realignment
git pull origin feature/phase-0-realignment
```

If a local clone already exists at `~/Developer/FuelWell` (or `~/FuelWell`, `~/Documents/FuelWell`, `~/Sites/FuelWell`):

```bash
cd <that path>
git fetch --all --prune
git checkout feature/phase-0-realignment
git pull origin feature/phase-0-realignment
```

**Every working session begins with a pull.** No exceptions.

---

## 2. Phase status as of this handoff

| Phase | Status |
|---|---|
| Phase 0 — Pre-build alignment | ✅ Complete (Max countersigned, 2026-05-13) |
| Phase 0.5 — Visual Design | ✅ Complete (Phase 0.5.3 consolidation locked, 2026-05-21) |
| Phase 0.6 — Interactive Prototype | ⏸ Not started (wire 37 mockups in Claude Design → share URL → outside testers) |
| Phase 1 — iOS build (Xcode + TCA) | ⏸ Not started |
| Phase 2+ — Backend / Features / Pilot ship | ⏸ Sequential |

The thing Codex is most likely being asked to help with: **Phase 1 iOS build scaffolding** (Xcode project, SPM modules, TCA shell, DesignSystem package generated from `DESIGN.md`). Do not touch any of the iOS Production Guide chapters (`docs/ios-guide/chapters/01..20`) — those are reference reading, not edit targets.

---

## 3. Repo layout (canonical paths)

```
~/Developer/FuelWell/
├── docs/
│   ├── MASTER-PLAN.md                      ← long-form binding plan
│   ├── FuelWell-Gap-Analysis.md            ← resolved Phase 0 worksheet
│   ├── FuelWell-Gap-Analysis-Log.md        ← verbatim Q&A with Max
│   ├── FuelWell-Phase-Plan.md              ← phase checklist
│   └── ios-guide/
│       ├── CLAUDE.md                       ← stack + architecture rules — READ FIRST
│       ├── DESIGN.md                       ← canonical design system (light-mode native)
│       ├── PRINCIPLES.md                   ← 13 binding rules + Daily Loop
│       ├── PRODUCT-CONTEXT.md              ← Vision + Master_v2 + Blueprint aggregation
│       ├── APP-MAP.md                      ← v2.1 (current)
│       ├── FLOW-CHART.md                   ← v2.1 (current)
│       ├── decisions.md                    ← D1–D19 are the most recent locked decisions
│       ├── consensus-stack.md
│       ├── reconciliation-matrix.md
│       ├── runbook.md
│       ├── chapters/01..20*.md             ← iOS Production Guide reference (DO NOT EDIT)
│       ├── mockups/
│       │   ├── *.png                       ← 37 approved mockups + 1 populated dashboard variant
│       │   └── html/*.html                 ← source HTMLs for every PNG
│       ├── wireframes/                     ← 27 Step 3 wireframes (locked spec)
│       ├── pdfs/
│       │   ├── FuelWell-App-Map.pdf
│       │   ├── FuelWell-Flow-Chart.pdf
│       │   ├── FuelWell-Phase-0.5-Review.pdf       ← 39 MB full
│       │   └── FuelWell-Phase-0.5-Review-LITE.pdf  ← 4.4 MB for sharing
│       └── drafts/                         ← historical / superseded — DO NOT USE
├── tools/pdf/                              ← in-repo build pipeline (see § 7)
│   ├── package.json
│   ├── build-doc-pdf.js                    ← markdown → branded PDF
│   ├── render-mockups.js                   ← HTML → PNG via Playwright
│   ├── build-combined.js                   ← combined Phase 0.5 Review PDF
│   ├── build-compressed.js                 ← LITE version
│   └── screens-catalog.js                  ← mockup ordering (hand-edited when adding screens)
├── src/                                    ← Next.js marketing site (separate concern)
├── public/                                 ← marketing assets + logo
├── ios/                                    ← Xcode project (not created yet — Phase 1)
├── AGENTS.md                               ← MANDATORY branch workflow rules
├── CLAUDE.md                               ← @AGENTS.md
└── ...
```

**`AGENTS.md` at the repo root is the binding workflow contract for any AI agent (including Codex).** Read it before your first commit.

---

## 4. The 8 things Codex must respect

1. **Pull before you act.** Every session opens with `git fetch && git pull origin feature/phase-0-realignment`.
2. **Branch only.** Never commit to `main`. Stay on `feature/phase-0-realignment` unless explicitly told to open a new feature branch (`feature/<short-kebab-name>`).
3. **No force-push, no `--no-verify`.** A pre-commit hook blocks `main` commits; a post-commit hook auto-pushes your feature branch to `origin` so work is visible immediately from Robert's phone.
4. **Specific `git add`, never `git add -A`** unless the diff is tiny and reviewed. Avoid sweeping in `.env`, credentials, secrets, large binaries.
5. **Read `decisions.md` before contradicting any decision.** D1–D19 are locked (Phase 0.5.3, 2026-05-21). If you disagree with one, raise it in chat — don't override.
6. **`DESIGN.md` is canonical.** Light-mode native, brand green `#47E7B0` (logo) / action green `#00D278` (verdicts), inverted-row `#0F1117` for emphasis, Outfit / Inter / DM Sans typography. No streaks, no badges, no gamification, no card gradients on flat surfaces. The Swift `Theme` struct is generated from this file, not hand-written.
7. **iOS architecture is locked.** Swift 6 / iOS 17 target / iOS 18 SDK / Xcode 26 / TCA 1.17+ / SQLiteData / Supabase / URLSession only (no Alamofire/Moya) / Swift Testing (not XCTest). Full rules in `docs/ios-guide/CLAUDE.md`. Features live in `Features/<Name>` packages; infrastructure in `Packages/<Name>`. Features never import other Features.
8. **Don't regenerate PDFs by hand.** Use the in-repo `tools/pdf/` pipeline (see § 7).

---

## 5. What's locked vs what's open

**Locked (don't reopen unless explicitly told):**
- 5-tab structure: Home · Meals · Coach · Exercise · Progress (single-word labels, Coach is the visually prominent FAB-style centerpiece)
- 30 top-level screens (per APP-MAP.md § 7)
- 9-step onboarding (Welcome → Sign-in → Goal → Body → Dietary → Lifestyle → HealthKit → Notifications → Plan reveal)
- Health Score formula: Nutrition 35% / Training 25% / Sleep 20% / Recovery 10% / Body comp 10%, range 0–100, missing components excluded with proportional reweighting, 14-day rolling Recovery baseline
- Workout Detail is a first-class feature with in-session logger (pre-workout / active / summary)
- Dashboard Tier 1/2/3 framework with max 3 above the fold (Health Score · Inflows/Outflows · Verdict CTA)
- Day 1 welcome card replaces Inflows/Outflows ring until first meal logged
- Offline write queue (SQLite local writes, sync on reconnect)
- Dynamic Daily Recap trigger (90 min before user's typical sleep, local device time)
- Voice mode out of Pilot (mic-fills-text input only)
- Learn tab dissolved into Help screen
- Macro History is a deep-link into Progress macro adherence (not a separate screen)
- Coach voice no-gos: never "you missed/skipped/went over"; adherence < 60% always with trend; Daily Recap leads neutral
- Anthropic Claude API at $5 soft / $10 hard per-user/month cap

**Open / Phase 0.6+:**
- Wire 37 mockups into a clickable Claude Design prototype
- 2–5 outside testers walk the Daily Loop
- Final lock after feedback
- Xcode project + SPM module scaffolding
- DesignSystem package generated from DESIGN.md
- Per-feature reducers, navigation, persistence wiring

---

## 6. How a typical Codex session should proceed

```bash
# 1. Sync
cd ~/Developer/FuelWell
git fetch --all --prune
git checkout feature/phase-0-realignment
git pull origin feature/phase-0-realignment

# 2. Read what you need
cat docs/ios-guide/CLAUDE.md           # architecture rules
cat docs/ios-guide/decisions.md        # locked product decisions
cat docs/ios-guide/APP-MAP.md          # current screen inventory
cat docs/ios-guide/DESIGN.md           # tokens / brand voice

# 3. Make changes (small, scoped, reviewable)
# ... edits ...

# 4. Commit
git add <specific paths>               # never `git add -A`
git commit -m "Short subject

Longer body explaining the why and any tradeoffs. Reference
relevant decisions.md entries by date."
# post-commit hook auto-pushes; no manual push needed
```

If you need to push manually:

```bash
git push origin feature/phase-0-realignment
```

If hooks aren't installed (fresh clone on a new Mac), don't worry — they're convenience only. The branch protection on the remote is the real enforcement.

---

## 7. Toolchain (in-repo at `tools/pdf/`)

Built so any session can regenerate PDFs locally without external state:

```bash
cd tools/pdf
npm install                            # one-time
npx playwright install chromium        # one-time

# Regenerate App Map + Flow Chart PDFs
node build-doc-pdf.js

# Re-render mockup PNGs from HTML sources
node render-mockups.js

# Rebuild the combined Phase 0.5 Review PDF
node build-combined.js

# Rebuild the LITE version (compressed images, ~4.4 MB)
node build-compressed.js
```

`screens-catalog.js` is the mockup order — **hand-edit it when adding or removing a screen**, then re-run `build-combined.js`. The build will not infer new screens.

`node_modules/` is gitignored. Reinstall locally if needed.

---

## 8. Authentication & access

- **GitHub:** use `gh auth login` or HTTPS with cached credentials. Codex needs push access to `feature/phase-0-realignment`.
- **Anthropic API:** key is in Robert's hands; goes into `.env` (gitignored) when Phase 3 backend work starts.
- **Supabase:** project ID + service-role secret in `.env`; created in Phase 0, wired up in Phase 2.
- **Apple Developer (Individual):** Robert holds the account; relevant for Phase 1+ TestFlight work.
- **Sentry / PostHog:** deferred — set up in later phases.

`.env*` files are gitignored. Never commit secrets.

---

## 9. Brand voice rules (apply to every line of user-facing copy)

- Direct, never hedging. *"Eat a real lunch"* beats *"consider a more substantial meal."*
- Specific. *"320 calories under"* beats *"you have room for more."*
- Banned vocabulary: *shred, crush, grind, beast mode, diet, cheat day, subject, intervention, compliance, BMI protocol.*
- Preferred: *smarter, personalized, adaptive, real-time, your body, your day, guidance, recalibrate, rebalance, macros, recovery, energy.*
- Never use *diagnostic* in user-facing copy (regulatory + clinical tone). Internal docs are fine.
- Never use *you missed*, *you skipped*, *you went over.*
- No celebratory streak chrome anywhere.

---

## 10. If something doesn't match this doc

The repo wins. Pull from origin, re-read `decisions.md`, ask in chat before deviating. Don't silently work around a discrepancy.

---

## 11. Quick reference

| Need | Path |
|---|---|
| Branch workflow rules | `AGENTS.md` |
| iOS architecture rules | `docs/ios-guide/CLAUDE.md` |
| Locked product decisions | `docs/ios-guide/decisions.md` |
| Current screen inventory | `docs/ios-guide/APP-MAP.md` |
| Per-button navigation | `docs/ios-guide/FLOW-CHART.md` |
| Design tokens & brand | `docs/ios-guide/DESIGN.md` |
| The 37 mockups | `docs/ios-guide/mockups/` |
| Mockup source HTMLs | `docs/ios-guide/mockups/html/` |
| Combined review PDF | `docs/ios-guide/pdfs/FuelWell-Phase-0.5-Review.pdf` |
| Build pipeline | `tools/pdf/` |
| Master plan | `docs/MASTER-PLAN.md` |
| Phase checklist | `docs/FuelWell-Phase-Plan.md` |
| Strategic / product context | `docs/ios-guide/PRODUCT-CONTEXT.md` |

---

*Last updated: 2026-05-23 (post Phase 0.5.3 consolidation).*

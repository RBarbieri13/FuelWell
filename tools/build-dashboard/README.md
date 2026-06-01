# FuelWell — Build Status Dashboard

A live, bird's-eye view of where the FuelWell build is against
[`docs/MASTER-PLAN.md`](../../docs/MASTER-PLAN.md), reconciled with real git
history. Built for Robert + Max to see, at a glance: every phase, what's done,
what's in flight, what's left, the last completed work, and any gaps where the
plan and the code disagree.

It is a **separate, self-contained Next.js app** (its own `package.json` /
`node_modules`) that lives inside the repo but deploys as its **own Vercel
project**. It does not touch the marketing site or the iOS app.

## What it shows

- **Bird's-eye board** — all 10 phases (0 → 7) with a status each:
  `Complete` · `In progress` · `Gap — verify` · `Not started`, plus an overall
  % and the current frontier phase.
- **Last completed work** — the newest commit (subject, PR #, diffstat, files,
  GitHub links) **and** a prose narrative from your most recent Claude Code
  session.
- **Review queue** — generated from live GitHub PR/check state so Robert and Max
  can see what is ready to merge, what is still running, and what needs action.
- **Drill-down** — expand any phase for its goal, plan deliverables (with the
  plan's own ✅/⏳ marks), gate criteria, and the commits/PRs mapped to it.
  Deep-link per phase at `/phase/<id>`.
- **Honesty banners** — flags when the plan's prose is stale vs. git, and when
  a past phase shipped with **no completion evidence** (e.g. Phase 0.6, which
  git shows was skipped).

## How "where we are" is computed

| Source of truth | Used for |
|---|---|
| `docs/MASTER-PLAN.md` (fetched live from GitHub) | the phase skeleton: titles, goals, deliverables, gates |
| Git commits on the watched branch (GitHub API) | live progress — commits are mapped to phases |
| `data/status-overrides.json` | manual corrections when inference is wrong |
| `data/session-digest.json` | the "what we last worked on" narrative |
| `data/execution-status.json` | generated PR queue, blockers, and next actions |

**Commit → phase mapping.** A commit whose subject says `Phase N` maps there
explicitly. Untagged commits inherit the phase of the most recent tagged commit
before them (the build is sequential) and are labelled `inferred` in the UI.

**Status inference.** A past phase with commit/checklist evidence is `Complete`;
the highest phase with commits is `In progress`; a *past* phase with **no**
evidence is flagged `Gap — verify` rather than rubber-stamped. Override any of
this in `data/status-overrides.json`:

```json
{ "0.6": { "status": "complete", "note": "Prototype done in Claude Design." } }
```

Data is read live from the **public** GitHub repo, so no secret is required.

## Develop

```bash
cd tools/build-dashboard
npm install
npm run dev        # http://localhost:4317
```

## Refresh the session narrative

The narrative comes from your local Claude Code transcripts (which never leave
your Mac). Regenerate it, then commit the result so Vercel picks it up:

```bash
npm run digest                       # newest session for this repo
npm run digest -- path/to.jsonl      # or a specific transcript
git add data/session-digest.json && git commit -m "Refresh session digest"
```

## Refresh the execution queue

The queue comes from live GitHub PR/check state and also rewrites
`docs/EXECUTION-STATUS.md` so the repo keeps a committed operating snapshot:

```bash
npm run status:generate
git add data/execution-status.json ../../docs/EXECUTION-STATUS.md
```

## Configuration (env)

All optional — sensible defaults watch `RBarbieri13/FuelWell@main`.

| Env var | Default | Purpose |
|---|---|---|
| `FW_REPO_OWNER` / `FW_REPO_NAME` | `RBarbieri13` / `FuelWell` | repo to watch |
| `FW_REPO_BRANCH` | `main` | branch to watch |
| `FW_PLAN_PATH` | `docs/MASTER-PLAN.md` | plan file to parse |
| `GITHUB_TOKEN` | — | raises the GitHub API rate limit (public repo works without it) |
| `DASHBOARD_PASSWORD` | — | when set, Basic-Auth-locks the whole site |
| `DASHBOARD_USER` | `fuelwell` | Basic Auth username |

## Deploy

Deploys as its own Vercel project with **root directory** =
`tools/build-dashboard`. To lock it after first deploy:

```bash
vercel env add DASHBOARD_PASSWORD production   # then redeploy
```

Pages use ISR (`revalidate = 60s`), so a reload reflects new commits within a
minute without redeploying.

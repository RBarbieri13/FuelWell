# FuelWell Execution Status

Updated: 2026-06-01T17:16:13.991Z

Generated from live GitHub PR/check state by `tools/build-dashboard/scripts/generate-execution-status.mjs`.

## Current Milestone

**W10 - Execution cockpit readiness**

1 PR(s) are mergeable with all required checks passing or expected skips.

## Ready To Merge

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
| #93 | W2 - Staging schema evidence probe | MERGEABLE | 5 pass, 0 pending, 0 fail, 1 skipped | [Open](https://github.com/RBarbieri13/FuelWell/pull/93) |

## In Progress

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
| #91 | W10 - Execution cockpit queue | MERGEABLE | 0 pass, 1 pending, 0 fail, 1 skipped | [Open](https://github.com/RBarbieri13/FuelWell/pull/91) |

## Blocked Or Needs Attention

| PR | Title | Mergeable | Checks | Link |
|---|---|---|---|---|
| - | None | - | - | - |

## Recently Merged

- #92, W9 - App Store evidence readiness (2026-06-01T16:55:35Z)
- #90, W7 - CI coverage readiness (2026-06-01T16:54:57Z)
- #89, W6 - Navigation detail foundation (2026-06-01T16:54:44Z)
- #88, W1 - Coach proxy hardening (2026-06-01T16:54:28Z)
- #87, W2 - SQLite persistence foundation (2026-06-01T16:54:00Z)
- #86, W7 - Release readiness gate hardening (2026-06-01T04:26:16Z)
- #85, W6 - Closeout readiness (2026-06-01T03:58:08Z)
- #84, W6 - Menu and help hierarchy (2026-06-01T03:01:50Z)

## Vital Blockers

- Anthropic API key for server-side proxy.
- FUELWELL_COACH_PROXY_SECRET for proxy authentication.
- Supabase service-role key and direct Postgres URL for the selected app project.
- Human confirmation before applying migrations to production data.
- Apple Developer, payment provider, and App Store Connect actions before TestFlight/App Store work.

## Next Actions

- Merge ready PRs: #93.
- No blocked PRs reported by the live queue.
- Regenerate this status artifact after each merge so the cockpit reflects main.
- Continue plan-backed work from latest main once the review queue is clear enough to avoid hot-file conflicts.

# Mission: Design, polish, and UI/UX intuitiveness — full-app graph pass

Walk every page of FuelWell as a real user and leave no design, UI, or UX
stone unturned: every component serves its intended purpose, nothing is out
of place, missing subpages/links get created, hierarchy (borders, shading,
grouping) guides the eye, and layouts serve their function better than
before. Findings are implemented, not just reported. Branch: main (the
coach-engine graph mission landed first; the coach page is the quality bar).

# Definition of done
`design-gate` passes: full-app screenshot QA (every route x 2 viewports,
zero AGENTS.md pilot-UI blockers, zero console errors), lint, tsc, build,
full vitest, deterministic playwright, DAG valid.

# Boundaries
- No production deploys, no PRs, no schema migrations, no paid API calls,
  no external messages. Preview deploys only when the orchestrator does it.
- Existing FuelWell tokens/components only (design-ruleset is law); no new
  one-off visual values; surgical diffs; never weaken tests or criteria.
- Functional regressions are blockers: polish must not change behavior
  except where an audit finding calls for it.

# Graph execution protocol
Same scheduler as coach-engine-graph (see ../coach-engine-graph/MISSION.md
sections "This mission is a GRAPH" and "Operating rules"), plus the lessons
learned there:
- Audit nodes are READ-ONLY → all six roots run as parallel subagents
  sharing one dev server.
- fix-shell OWNS all shared surfaces (src/components/ui, layout) and lands
  BEFORE the four page-group fix nodes (enforced as a graph edge). Page fix
  nodes own disjoint page directories and may not touch shared components —
  they document needs for the coherence node instead.
- Fresh-context verifiers flip nodes; evidence to evidence/; one commit per
  node (`design-graph: <node-id> — <what>`); progress.md updated in the
  same commit.
- Budget: max 35 node-attempts, 8h wall-clock, stop after 2 zero-flip
  scheduler passes. Deadlock (failing nodes, empty frontier) = stop+report.
- Graph critique at start and half-budget; amendments must pass
  validate-graph.mjs.

# State
- .loop/design-intuition-graph/criteria.json / progress.md / evidence/
- .loop/design-intuition-graph/validate-graph.mjs / init.sh

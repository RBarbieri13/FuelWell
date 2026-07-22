# Mission: Finalize the FuelWell Coach engine (graph-executed)

Improve, refine, and FINALIZE the Coach: the engine, the chat process, and
the interface. The Coach must behave like Siri/Alexa for FuelWell — a single
conversational surface that can READ user information from every part of the
app (profile, goals, meals, recipes, groceries, workouts, progress, settings,
activity, coach memory), CHANGE app state through explicit, audited,
confirmed tool actions, and ANSWER with rich inline artifacts (charts, recipe
cards, workout cards, summary tiles) alongside text. This is for FuelWell
v1.4; the outcome is a coach a real user trusts as the app's front door.

# Definition of done
The `verify-gate` node passes:
`node scripts/verify-coach-engine.mjs && pnpm lint && pnpm build && pnpm vitest run && pnpm playwright test tests/coach.spec.ts`
with every other node in `criteria.json` already at `"pass"` with evidence.

# Boundaries
- No production deploys, no PRs, no scheduled jobs, no external messages, no
  live-user data changes without explicit human confirmation (AGENTS.md).
- Paid provider calls only at normal dev-testing volume.
- Per-user isolation and health boundaries are inviolable: never weaken a
  criteria node to make it pass; nodes may be split, never deleted.
- Surgical changes only; match existing FuelWell component shapes, Tailwind
  tokens, and color roles. No new one-off visual values.

# This mission is a GRAPH, not a checklist
State lives in `criteria.json`: nodes with `deps`. Execute with a scheduler
loop, not a linear pass:

1. ORIENT — read criteria.json, progress.md, recent git log. Run init.sh.
2. FRONTIER — compute the set of failing nodes whose deps all pass. This is
   your dispatch frontier.
   - Roots (`ctx-retrieval`, `iso-user`, `audit-log`, `safety-boundaries`,
     `ui-baseline`) are independent: dispatch them as PARALLEL subagents,
     one node per subagent, each with only the context its node needs.
   - Never work a node whose deps are failing. Never batch two nodes into
     one subagent.
3. MERGE GATES — when a node's work returns, a FRESH-CONTEXT verifier
   subagent (not the implementer) runs the node's `verify` and rules
   pass/fail. Only the verifier may flip status, and only with evidence
   written to `.loop/coach-engine-graph/evidence/` and cited in progress.md.
   The join nodes (`intent-router`, `ui-final`, `verify-gate`) are where
   branches merge — verify extra hard there: integration bugs live at joins.
4. FAILURE ISOLATION — a failing node blocks only its descendants. Keep all
   other branches moving. Record the failure and lesson in progress.md;
   retry with a different approach, don't repeat the failed one.
5. CHECKPOINT — one git commit per node flipped, message `coach-graph:
   <node-id> — <what>`. Update criteria.json + progress.md in the same
   commit.
6. DEADLOCK / STOP — if failing nodes exist but the frontier is empty,
   that is a hard deadlock: stop and report which node blocks the graph and
   why. Budget guards: max 30 node-attempts, max 6h wall-clock, and if two
   consecutive scheduler passes flip zero nodes, stop and report.
7. CRITIQUE THE GRAPH (once, at start; again at half-budget) — the
   decomposition itself can be wrong. Ask: which edge is missing (a
   dependency not accounted for)? What is forced into a line that should
   branch? Which node hides two nodes? Amend criteria.json (add nodes/edges,
   split nodes — never delete or weaken), commit the amendment, and run
   `node .loop/coach-engine-graph/validate-graph.mjs` to prove the graph is
   still a DAG.

# Critical path awareness
The longest chain is ui-baseline → chat-process → ui-final → verify-gate
and ctx-retrieval → act-* → intent-router → verify-gate. Start these roots
FIRST; `safety-boundaries` and `audit-log` are short branches that can run
whenever a subagent slot is free.

# Operating rules (Fable 5)
- You are operating autonomously; the user is away. For reversible in-scope
  actions, act. Before ending a turn, if your last paragraph is a plan or a
  promise, do it now with tool calls instead.
- Before reporting progress, audit each claim against a tool result from
  this session; unverified work is reported as unverified. A node is never
  "pass" because it "should work" — only because its verify command passed.
- When you have enough information to act, act. Do the simplest thing that
  works well; no speculative abstraction; the coach codebase already has
  shapes (src/lib/coach/tools, artifacts routes) — extend them, don't
  reinvent.
- Delegate independent nodes to subagents and keep working while they run;
  intervene if one goes off track.
- Record lessons in progress.md (one per entry, with why); read them at
  every ORIENT. You have ample context — do not stop or summarize on
  account of context limits.
- Pause for the human only for: destructive/irreversible actions, real
  scope changes, or input only they can provide.
- Final message per run: outcome first, complete sentences, evidence paths,
  written for a reader who saw none of the process.

# State
- .loop/coach-engine-graph/criteria.json   — THE graph (nodes + deps + status)
- .loop/coach-engine-graph/progress.md     — log + lessons, evidence-linked
- .loop/coach-engine-graph/evidence/       — screenshots, transcripts, suite results
- .loop/coach-engine-graph/validate-graph.mjs — DAG + reference validator
- .loop/coach-engine-graph/init.sh         — health check (run first, every time)
- git log --oneline | grep coach-graph     — one commit per flipped node

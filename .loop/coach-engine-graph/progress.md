# coach-engine-graph — progress log

## Run 1 — 2026-07-22
- ORIENT: init.sh OK. Frontier: ctx-retrieval, iso-user, audit-log, safety-boundaries, ui-baseline.
- Dispatched 5 parallel implementer subagents (one per frontier node). Verification and commits centralized in orchestrator.
- GRAPH CRITIQUE (start-of-run): considered edge safety-boundaries -> intent-router; rejected — boundary enforcement is a system-prompt property checked at verify-gate, independent of routing. No amendments. DAG re-validated OK.
- iso-user: PASS (verified). Fix: ensureConversation now app-layer scoped by user_id (persistence.ts). Verifier ran 3 adversarial leak attempts (artifact-by-id, foreign goal_plans upsert, foreign-userId knowledge merge) — all blocked. Evidence: evidence/iso-user-report.md. Unverified remainder: RLS audited from SQL not live DB.
- audit-log: PASS (verified, zero code changes). 3 tool-execution branches in turn/route.ts, each audits unconditionally; 17-tool coverage table spot-checked. LESSON: failed Supabase audit inserts are logged-and-swallowed — acceptable now, revisit before GA. Evidence: evidence/audit-log-report.md.
- ctx-retrieval: implemented (recipes + groceries domains added to knowledge.ts; 276 unit tests green) — verifier running.
- safety-boundaries: verifier FAIL — contract missed adult rapid-dehydration water cuts and pregnancy/postpartum deficits. Remediation dispatched to original implementer (2 new bullets + RT-13/14 + assertions). LESSON: red-team the *space between* bullets, not just the bullets; category lists invite gap-seeking.
- ui-baseline: audit complete (0 blockers / 0 majors / 5 minors, 0 console errors; 7 evidence files) — verifier running.
- SCHEDULING: act-nutrition and act-fitness share files (tools/, apply-mutation.ts) → running SEQUENTIALLY to avoid edit races. act-nutrition dispatched; act-fitness queued behind it. Graph-critique note: shared-file nodes should declare a resource edge in future graphs.
- ui-baseline: PASS (verified). 0 blockers / 0 majors / 5 minors, 0 console errors both viewports; verifier cross-checked defects against raw probe JSON and screenshots. Defect list feeds ui-final. Evidence: evidence/ui-baseline-*.

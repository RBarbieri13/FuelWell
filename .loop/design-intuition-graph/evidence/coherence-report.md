# Coherence node — cross-page reconciliation (2026-07-22)

Executed centrally by the orchestrator (budget deviation logged in progress.md).

## Implemented
1. **Preflight link gating** (coach attachments, cross-territory item deferred by
   fix-shell/fix-identity): `/app/coach/attachments` now hides "Open preflight"
   outside preview hosts via the same `isPreviewHost` signal that 404s the page —
   no production user can reach a dead link. Verified: tsc/eslint clean; localhost
   SSR contains the link (preview behavior intact); production path hidden by the
   identical check that gates the page (code-verified).
2. **User-menu ARIA** (fix-shell verifier nit): popover now `role="menu"`, items
   `role="menuitem"`, matching the trigger's `aria-haspopup="menu"`.

## Verified compatible (no change needed)
3. **Launch-preflight gating vs release pipeline**: `ios/fastlane/Fastfile` and
   `scripts/*` never fetch the /app/launch-preflight PAGE — the pipeline consumes
   `src/lib/launch-preflight.ts` and env values. Gating the page does not affect
   TestFlight candidate verification.

## Cross-link opportunities — status
All from→to links from the five audits were implemented inside the fix nodes and
gate-verified there (insight doors, recipes↔meal-plan, fitness↔activity,
log→nutrition, grocery→recipes, profile→settings). No cross-territory link
remained unimplemented.

## Rejected, with reasons
4. **Sidebar/tab entries for meal-plan and nutrition** (audit S1–S3): rejected.
   Both pages now have multiple honest inbound paths (recipes header, dashboard
   quick-action + doors, log day header) and correct nav highlighting via the
   fix-shell alias maps. Adding two items to an already-12-item sidebar works
   against the audit-shell findings on nav crowding. Revisit with usage data.
5. **Mobile 5-tab reduction** (fix-shell deferral): rejected pending usage data —
   product call, not derivable from code.
6. **Dual sign-out paths** (fix-identity deferral): rejected as non-issue — menu
   sign-out (mobile shell) and settings sign-out (canonical) serve different
   contexts; both flow through the same handler pattern.

## Residual follow-ups (documented, not blocking)
- daily-detail N2–N6 nutrition-audit minors: fix-insight's rework of
  detail-surfaces changed the surface these findings described; re-audit in the
  next UI pass rather than patching a moved target.
- Chart-style unification between daily-review ledger and progress trend
  (insight finding 25) — deferred by fix-insight, needs a shared chart primitive.
- `?meal=&date=` deep-link params on /app/log (log page reads only `mode`).

## Consistency sweep (page × ruleset)
Gate-level checks (tsc, lint, unit 333, playwright 16/12-skip) green on the
combined tree after all five fix territories landed; no new hex/radius/shadow
literals introduced by any fix node (each node's report diff-checked); hex
baseline improved 427→426→(fix-identity/-shell tokenizations). Full-route
screenshot matrix runs at design-gate.

# chat-process — evidence report

Node: Chat-process polish (streaming, history pagination, retry/regenerate,
stale chips, provider-health degradation UX).
Date: 2026-07-22. Implementer: chat-process node.

## Baseline (verify command, before changes)

`pnpm playwright test tests/coach.spec.ts tests/coach-mobile-overflow.spec.ts`

- 1 passed (coach.spec.ts rich-response/stacking test)
- 1 failed: coach-mobile-overflow 320px — `FUELWELL_UI_TEST_EMAIL is required
  for a release candidate.` (tests/helpers/authenticate.ts:9). ENVIRONMENTAL:
  these credentials exist only as GitHub Actions secrets
  (.github/workflows/ios-testflight.yml:62-63); not present locally, not in
  pulled.env/pulled2.env/.env.local. Hard-require is intentional
  (commit dec3efd "test: require real candidate authentication").
- 12 skipped: live agentic Coach tests gated on ANTHROPIC_API_KEY (skips by
  design; not exported to avoid paid API calls per node boundary).
- 3 did not run (serial mode after the auth failure).

Unit baseline: `pnpm vitest run tests/unit` — 285 passed.

## Findings (a)–(e)

### (a) Streaming render path
- SSE frames parsed per network chunk in `runTurn`
  (src/lib/coach/client-store.ts); React 18 batches the per-frame
  `setItems` calls, so token batching was already acceptable. No change to
  the delta path.
- Layout thrash found in the autoscroll effect
  (src/app/app/coach/page.tsx, formerly lines 224–228): it depended on the
  whole `items` array and restarted a `smooth` scrollIntoView on every token
  batch. FIXED: effect now keys on the LAST item's signature
  (id:textLength:artifactCount:streaming) and uses instant (`auto`) scrolling
  while busy; smooth only for settled messages. This also prevents
  "load earlier" prepends from yanking the viewport to the bottom.

### (b) History load + pagination
- Before: GET /api/coach/history returned only the newest 30 messages of the
  latest conversation (src/lib/coach/persistence.ts loadRecentMessages,
  hardcoded limit 30); no way to reach older messages. Client fetched once.
- FIXED:
  - `loadRecentMessages(supabase, userId, { limit, before })` — cursor
    pagination on `created_at` (fetches limit+1 to observe `hasMore`, returns
    `nextBefore` cursor; limit clamped 1..100, default 30).
  - Route accepts `?before=<ISO>&limit=<n>` and returns
    `{ hasMore, nextBefore }` (src/app/api/coach/history/route.ts).
  - Client hook exposes `hasEarlier / loadEarlier / loadingEarlier`; the page
    renders a "Show earlier messages" button above the transcript that
    prepends the previous page without scroll jump
    (src/lib/coach/client-store.ts, src/app/app/coach/page.tsx).
  - Preview/signed-out users are unaffected (localStorage replay, no cursor).

### (c) Retry / regenerate after a failed turn
- Before: `ChatItem.error` was set by the store but NO UI rendered a retry
  affordance anywhere in src/app/app/coach/page.tsx — a failed turn was a
  dead end, and its error text ("Connection dropped...") leaked into the
  provider history on the next send.
- FIXED:
  - Store keeps `lastTurnRef` (userText, full attachments, confirmedTool,
    created item ids) and exposes `retryLastTurn()`; retry re-runs the turn
    with `replaceIds`, removing the failed user/assistant pair so the message
    is not duplicated.
  - History sent to /api/coach/turn now excludes error items and replaced
    items.
  - Page renders a "Try again" chip on the last assistant item when
    `item.error` and not busy. Budget-exceeded turns keep `error: false`
    (unchanged), so no retry is offered for cost-cap blocks.

### (d) Stale action chips
- Prior art 8f3b11b cleared stale recipe confirmation status. Remaining coach
  paths audited:
  - New-turn clearing of pending ConfirmCards (`confirm: null` map on send)
    already existed — kept.
  - GAP: a `confirm_required` chip could survive alongside a failed turn's
    error text and stay actionable. FIXED: both the SSE `error` event handler
    and the fetch-failure/watchdog catch now set `confirm: null`.
  - `newConversation` now also resets `lastTurnRef` and the pagination
    cursor/hasEarlier so a fresh chat cannot retry into or paginate the
    archived conversation.
  - src/components/coach/log-confirm-chip.tsx is DEAD CODE in the live app:
    its only reference is the archived
    src/app/app/coach/_legacy/page-deterministic.tsx.bak. Not removed
    (surgical-changes rule); flagged for cleanup.

### (e) Provider-health degradation → what the user sees
- Server side was already good: /api/coach/turn classifies provider failures
  (provider-health.ts) and streams a deterministic human-readable fallback
  reply; /api/coach/provider-health exposes sanitized state — but NOTHING in
  the UI consumed it, and two dead-spinner paths existed client-side:
  1. A stalled SSE stream (no bytes, no error) left `reader.read()` pending
     forever: composer disabled, typing dots forever.
  2. Fetch-level failures showed a generic line with no provider state.
- FIXED:
  - 90s idle watchdog (STREAM_IDLE_TIMEOUT_MS) aborts a silent stream via
    AbortController (server maxDuration is 120s); the user gets "Coach took
    too long to respond, so this turn was stopped." plus retry.
  - New `describeProviderHealthForUser()` (src/lib/coach/provider-health.ts)
    maps state/failureClass to one-line human copy (rate_limit, timeout,
    billing_credit, auth/permission, missing_config, unavailable).
  - On any turn failure the client best-effort fetches
    /api/coach/provider-health and appends the readable notice to the error
    bubble (skipped for budget-exceeded, which has its own copy).

## Changes (files)

- src/lib/coach/persistence.ts — loadRecentMessages cursor pagination.
- src/app/api/coach/history/route.ts — before/limit params, hasMore/nextBefore.
- src/lib/coach/provider-health.ts — describeProviderHealthForUser().
- src/lib/coach/client-store.ts — retryLastTurn, replaceIds, idle watchdog,
  provider-health-enriched errors, confirm cleared on failure, error items
  excluded from provider history, hasEarlier/loadEarlier, newConversation
  resets.
- src/app/app/coach/page.tsx — Try again chip, Show earlier messages button,
  last-item-keyed autoscroll (instant while streaming).
- tests/coach.spec.ts — new deterministic e2e: failed turn shows readable
  rate-limit state, Try again replaces (not duplicates) the failed pair.
- tests/unit/persistence.test.ts — pagination tests (limit+1 probe, cursor,
  lt filter) + mock gains `lt`.
- tests/unit/provider-health.test.ts — describeProviderHealthForUser cases.

Not touched (other nodes): src/lib/coach/tools/, apply-mutation.ts,
system-prompt.ts, src/components/coach/artifacts/, src/app/api/coach/artifacts,
ui-baseline defect list.

## Final verification

- `pnpm playwright test tests/coach.spec.ts tests/coach-mobile-overflow.spec.ts`
  — 2 passed (including the new retry/provider-health test), 12 skipped
  (ANTHROPIC_API_KEY gate, same as baseline), 1 failed + 3 not-run:
  coach-mobile-overflow authenticateCandidate credential gate — IDENTICAL to
  baseline, environmental, and cannot be fixed by code without weakening the
  intentional release gate or creating accounts. To go fully green run with:
  `FUELWELL_UI_TEST_EMAIL=… FUELWELL_UI_TEST_PASSWORD=… (and ANTHROPIC_API_KEY=…)`.
- `pnpm vitest run tests/unit` — 308 passed, 0 failed (baseline 285; growth
  includes this node's new tests and concurrent nodes' additions).
- `pnpm exec tsc --noEmit` — clean. eslint on all touched files — clean.
- Live browser QA (next dev, preview mode): desktop 1280px and mobile 375px.
  Forced a 503 turn + degraded provider-health (rate_limit, then timeout):
  error bubble shows the readable provider notice, "Try again" chip renders
  and recovers (failed pair replaced, no duplicate user bubble), composer
  re-enables, no console errors, no horizontal overflow at 375px.

## Unverified / caveats

- Signed-in server pagination ("Show earlier messages" against real Supabase
  rows) is unit-tested at the query layer and route layer but not e2e-tested:
  no FUELWELL_UI_TEST_EMAIL/PASSWORD available locally (GitHub secrets only).
- The 90s idle watchdog was verified by code path (abort → catch → readable
  copy) and typecheck, not by a real 90s stall.
- Concurrency note: other graph nodes were committing to this same worktree
  during this session (commits e6dc902, 93d188b, 8130d1a landed mid-run and
  twice clobbered in-progress edits, which were re-applied). Final `git diff`
  confirms all eight files above carry this node's changes.

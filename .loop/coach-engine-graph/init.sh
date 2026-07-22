#!/bin/sh
# Coach-graph health check — run at the start of every iteration.
set -e
cd "$(dirname "$0")/../.."
node .loop/coach-engine-graph/validate-graph.mjs
pnpm install --frozen-lockfile >/dev/null
pnpm exec tsc --noEmit 2>/dev/null || echo "WARN: typecheck failing (fixing it is valid node work)"
echo "OK: environment healthy. Dev server: pnpm dev (do not run via raw bash in Claude Code; use the preview tools)."

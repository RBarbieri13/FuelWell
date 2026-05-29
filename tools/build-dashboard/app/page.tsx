import {
  FolderGit2,
  GitBranch,
  RefreshCw,
  AlertTriangle,
  GitCommit,
  GitPullRequest,
} from "lucide-react";
import { getSnapshot } from "@/lib/data";
import { PhaseCard } from "@/components/PhaseCard";
import { LastWorkPanel } from "@/components/LastWork";
import { statusMeta, relativeTime, fmtDate } from "@/components/ui";

export const revalidate = 60;

export default async function Page() {
  const snap = await getSnapshot();
  const { overall } = snap;
  const pct = overall.phasesTotal
    ? Math.round((overall.phasesComplete / overall.phasesTotal) * 100)
    : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
              FuelWell{" "}
              <span className="text-[var(--color-fw-green)]">Build Status</span>
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-muted)]">
              <a
                href={snap.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[var(--color-ink)]"
              >
                <FolderGit2 className="h-3.5 w-3.5" /> {snap.repoSlug || "—"}
              </a>
              <span className="inline-flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5" /> {snap.branch || "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitCommit className="h-3.5 w-3.5" /> {snap.totalCommits} commits
              </span>
              <span className="inline-flex items-center gap-1">
                <GitPullRequest className="h-3.5 w-3.5" /> {snap.totalPRs} PRs
              </span>
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> updated{" "}
                {relativeTime(snap.generatedAt)}
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-[var(--color-ink)]">
              {pct}%
            </div>
            <div className="text-xs text-[var(--color-ink-muted)]">
              {overall.phasesComplete} of {overall.phasesTotal} phases complete
            </div>
            {overall.frontierId && (
              <div className="mt-1 text-xs font-medium text-sky-700">
                Now: Phase {overall.frontierId} · {overall.frontierTitle}
              </div>
            )}
          </div>
        </div>

        {/* Segmented progress bar */}
        <div className="mt-4 flex gap-1">
          {snap.phases.map((p) => {
            const m = statusMeta(p.status);
            const color =
              p.status === "complete"
                ? "bg-emerald-500"
                : p.status === "in_progress"
                  ? "bg-sky-500 animate-pulse"
                  : p.status === "gap"
                    ? "bg-amber-400"
                    : "bg-gray-200";
            return (
              <a
                key={p.phase.id}
                href={`#phase-${p.phase.id}`}
                title={`Phase ${p.phase.id} — ${p.phase.title}: ${m.label}`}
                className="group flex-1"
              >
                <div className={`h-2.5 rounded-full ${color}`} />
                <div className="mt-1 text-center text-[10px] font-medium text-[var(--color-ink-muted)]">
                  {p.phase.id}
                </div>
              </a>
            );
          })}
        </div>
      </header>

      {/* Banners */}
      {snap.error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{snap.error}</span>
        </div>
      )}
      {snap.planStale && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Plan prose is stale.</strong> The master plan still reads
            “mid–Phase 0,” but git shows work has reached Phase{" "}
            {overall.frontierId}. Statuses below are reconciled from git, not the
            plan’s narrative.
          </span>
        </div>
      )}
      {overall.phasesGap > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>
              {overall.phasesGap} phase{overall.phasesGap === 1 ? "" : "s"} flagged
              as a gap.
            </strong>{" "}
            Later phases shipped, but these show no completion evidence in git —
            expand them to confirm whether they were skipped or done elsewhere.
          </span>
        </div>
      )}

      {/* Last completed work */}
      {snap.lastWork && (
        <div className="mb-6">
          <LastWorkPanel work={snap.lastWork} repoUrl={snap.repoUrl} />
        </div>
      )}

      {/* Phase board */}
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
        The plan · phase by phase
      </h2>
      <div className="space-y-2.5">
        {snap.phases.map((p) => (
          <div key={p.phase.id} id={`phase-${p.phase.id}`} className="scroll-mt-4">
            <PhaseCard p={p} repoUrl={snap.repoUrl} />
          </div>
        ))}
      </div>

      <footer className="mt-10 border-t border-[var(--color-hair)] pt-4 text-center text-xs text-[var(--color-ink-muted)]">
        Reconciled from{" "}
        <code className="rounded bg-gray-100 px-1">docs/MASTER-PLAN.md</code> +
        live git history. Statuses are inferred from commit phase-tags; correct
        any with{" "}
        <code className="rounded bg-gray-100 px-1">data/status-overrides.json</code>
        . Auto-refreshes ~every minute.
      </footer>
    </main>
  );
}

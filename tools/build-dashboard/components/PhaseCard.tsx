import Link from "next/link";
import {
  ChevronRight,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Clock3,
  ExternalLink,
} from "lucide-react";
import type { PhaseProgress } from "@/lib/types";
import { StatusBadge, statusMeta, fmtDate } from "./ui";

function Deliverable({ done, text }: { done: boolean | null; text: string }) {
  const mark =
    done === true ? (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
    ) : done === false ? (
      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
    ) : (
      <span className="mt-2 ml-1 mr-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
    );
  return (
    <li className="flex gap-2 text-sm text-[var(--color-ink-soft)]">
      {mark}
      <span className={done === true ? "text-gray-500" : ""}>{text}</span>
    </li>
  );
}

export function PhaseCard({ p, repoUrl }: { p: PhaseProgress; repoUrl: string }) {
  const m = statusMeta(p.status);
  const shown = p.commits.slice(0, 8);
  return (
    <details
      className={`group rounded-2xl border bg-white shadow-sm ring-1 ${m.ring} border-[var(--color-hair)] open:shadow-md`}
    >
      <summary className="flex items-center gap-3 px-4 py-3.5">
        <ChevronRight className="chev h-4 w-4 shrink-0 text-gray-400 transition-transform" />
        <span
          className={`flex h-9 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${m.fg} ${m.bg}`}
        >
          {p.phase.id}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-[var(--color-ink)]">
            {p.phase.title}
          </span>
          <span className="block truncate text-xs text-[var(--color-ink-muted)]">
            {p.checklist ? `${p.checklist.done}/${p.checklist.total} checklist · ` : ""}
            {p.commits.length} commit{p.commits.length === 1 ? "" : "s"}
            {p.prCount ? ` · ${p.prCount} PR${p.prCount === 1 ? "" : "s"}` : ""}
            {p.lastDate ? ` · ${fmtDate(p.firstDate)}–${fmtDate(p.lastDate)}` : ""}
          </span>
        </span>
        <StatusBadge status={p.status} />
      </summary>

      <div className="border-t border-[var(--color-hair)] px-4 py-4 pl-11">
        {p.phase.goal && (
          <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
            <span className="font-semibold text-[var(--color-ink)]">Goal: </span>
            {p.phase.goal}
          </p>
        )}

        {p.statusNote && (
          <p
            className={`mb-3 rounded-lg px-3 py-2 text-xs ${m.bg} ${m.fg} ring-1 ${m.ring}`}
          >
            {p.statusBy === "manual" ? "Manual override: " : ""}
            {p.statusNote}
          </p>
        )}

        {p.phase.deliverables.length > 0 && (
          <ul className="mb-3 space-y-1.5">
            {p.phase.deliverables.map((d, i) => (
              <Deliverable key={i} done={d.done} text={d.text} />
            ))}
          </ul>
        )}

        {p.phase.steps.map((s, i) => (
          <div key={i} className="mb-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{s.title}</p>
            <ul className="mt-1 space-y-1">
              {s.bullets.map((b, j) => (
                <Deliverable key={j} done={null} text={b} />
              ))}
            </ul>
          </div>
        ))}

        {p.phase.gate && (
          <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-[var(--color-ink-soft)] ring-1 ring-gray-200">
            <span className="font-semibold">Gate to leave: </span>
            {p.phase.gate}
          </p>
        )}

        {shown.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)]">
              <GitCommit className="h-3.5 w-3.5" /> Commits mapped to this phase
            </p>
            <ul className="space-y-1">
              {shown.map((c) => (
                <li key={c.sha} className="flex items-center gap-2 text-xs">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    {c.shortSha}
                  </a>
                  <span className="min-w-0 flex-1 truncate text-[var(--color-ink-soft)]">
                    {c.subject}
                  </span>
                  {c.pr && (
                    <a
                      href={`${repoUrl}/pull/${c.pr}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 rounded bg-purple-50 px-1.5 py-0.5 font-medium text-purple-700 ring-1 ring-purple-200"
                    >
                      <GitPullRequest className="h-3 w-3" />#{c.pr}
                    </a>
                  )}
                  {c.mappedBy === "inferred" && (
                    <span
                      title="No explicit phase tag in the commit message; assigned by sequential inference."
                      className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                    >
                      inferred
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {p.commits.length > shown.length && (
              <Link
                href={`/phase/${encodeURIComponent(p.phase.id)}`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
              >
                View all {p.commits.length} commits
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

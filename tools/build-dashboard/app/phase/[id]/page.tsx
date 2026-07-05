import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitPullRequest } from "lucide-react";
import { getSnapshot } from "@/lib/data";
import { StatusBadge, fmtDate } from "@/components/ui";

export const revalidate = 60;

export default async function PhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const snap = await getSnapshot();
  const p = snap.phases.find((x) => x.phase.id === decoded);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> All phases
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
          Phase {p.phase.id} · {p.phase.title}
        </h1>
        <StatusBadge status={p.status} />
      </div>
      {p.phase.guideRef && (
        <p className="mb-3 text-sm text-[var(--color-ink-muted)]">
          {p.phase.guideRef}
        </p>
      )}
      {p.phase.goal && (
        <p className="mb-4 text-[var(--color-ink-soft)]">{p.phase.goal}</p>
      )}

      {p.statusNote && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          {p.statusBy === "manual" ? "Manual override: " : ""}
          {p.statusNote}
        </p>
      )}

      <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-[var(--color-ink-muted)]">
        All {p.commits.length} commits
      </h2>
      <ul className="space-y-1.5">
        {p.commits.map((c) => (
          <li
            key={c.sha}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-[var(--color-hair)]"
          >
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              {c.shortSha}
            </a>
            <span className="min-w-0 flex-1 truncate text-[var(--color-ink-soft)]">
              {c.subject}
            </span>
            <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">
              {fmtDate(c.date)}
            </span>
            {c.pr && (
              <a
                href={`${snap.repoUrl}/pull/${c.pr}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-0.5 rounded bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200"
              >
                <GitPullRequest className="h-3 w-3" />#{c.pr}
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

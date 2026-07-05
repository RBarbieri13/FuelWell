import {
  GitPullRequest,
  GitCommit,
  FileDiff,
  Bot,
  ExternalLink,
} from "lucide-react";
import type { LastWork } from "@/lib/types";
import { fmtDate, relativeTime } from "./ui";

export function LastWorkPanel({
  work,
  repoUrl,
}: {
  work: LastWork;
  repoUrl: string;
}) {
  const c = work.commit;
  const files = work.changedFiles;
  return (
    <section className="rounded-2xl border border-[var(--color-hair)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <GitCommit className="h-3.5 w-3.5" /> Last completed work
        </span>
        <span className="text-xs text-[var(--color-ink-muted)]">
          {fmtDate(c.date)} · {relativeTime(c.date)}
        </span>
      </div>

      <h2 className="text-lg font-semibold leading-snug text-[var(--color-ink)]">
        {c.subject}
      </h2>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <a
          href={c.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-mono text-[var(--color-ink-soft)] hover:bg-gray-200"
        >
          {c.shortSha} <ExternalLink className="h-3 w-3" />
        </a>
        {c.pr && (
          <a
            href={`${repoUrl}/pull/${c.pr}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-1 font-medium text-purple-700 ring-1 ring-purple-200"
          >
            <GitPullRequest className="h-3 w-3" /> PR #{c.pr}
          </a>
        )}
        {(work.totalAdditions > 0 || work.totalDeletions > 0) && (
          <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-2 py-1 font-mono">
            <FileDiff className="h-3 w-3" />
            <span className="text-emerald-600">+{work.totalAdditions}</span>
            <span className="text-rose-500">−{work.totalDeletions}</span>
            <span className="text-[var(--color-ink-muted)]">
              · {files.length} file{files.length === 1 ? "" : "s"}
            </span>
          </span>
        )}
      </div>

      {files.length > 0 && (
        <ul className="mt-3 max-h-40 space-y-0.5 overflow-y-auto rounded-lg bg-gray-50 p-2.5 text-xs ring-1 ring-gray-200">
          {files.slice(0, 30).map((f) => (
            <li key={f.filename} className="flex items-center gap-2 font-mono">
              <span
                className={
                  f.status === "added"
                    ? "text-emerald-600"
                    : f.status === "removed"
                      ? "text-rose-500"
                      : "text-sky-600"
                }
              >
                {f.status[0].toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-[var(--color-ink-soft)]">
                {f.filename}
              </span>
              <span className="text-emerald-600">+{f.additions}</span>
              <span className="text-rose-500">−{f.deletions}</span>
            </li>
          ))}
        </ul>
      )}

      {work.session && work.session.sessionId && (
        <div className="mt-4 border-t border-[var(--color-hair)] pt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)]">
            <Bot className="h-3.5 w-3.5" /> From the last Claude Code session ·{" "}
            {fmtDate(work.session.date)}
          </p>
          {work.session.intent && (
            <p className="mb-2 text-sm text-[var(--color-ink-soft)]">
              <span className="font-semibold text-[var(--color-ink)]">Asked: </span>
              {work.session.intent}
            </p>
          )}
          {work.session.workDone.length > 0 && (
            <ul className="mb-2 space-y-1">
              {work.session.workDone.map((w, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-[var(--color-ink-soft)]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-fw-green)]" />
                  <span className="line-clamp-2">{w}</span>
                </li>
              ))}
            </ul>
          )}
          {work.session.narrative && (
            <p className="text-sm italic text-[var(--color-ink-muted)]">
              “{work.session.narrative}”
            </p>
          )}
        </div>
      )}
    </section>
  );
}

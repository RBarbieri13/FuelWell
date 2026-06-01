import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";
import { relativeTime } from "./ui";
import type { ExecutionPullRequest, ExecutionStatus } from "@/lib/types";

function CheckPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "wait" | "bad" | "muted";
}) {
  const cls =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "bad"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : tone === "wait"
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : "bg-gray-50 text-gray-600 ring-gray-200";

  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}>
      {value} {label}
    </span>
  );
}

function PRRow({ pr }: { pr: ExecutionPullRequest }) {
  return (
    <li className="flex flex-col gap-2 border-t border-[var(--color-hair)] py-3 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <a
            href={pr.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-fw-green)]"
          >
            #{pr.number} {pr.title}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
            {pr.branch} into {pr.base} · {pr.mergeable.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CheckPill label="pass" value={pr.checks.pass} tone="good" />
          <CheckPill label="pending" value={pr.checks.pending} tone="wait" />
          <CheckPill label="fail" value={pr.checks.fail} tone="bad" />
          <CheckPill label="skip" value={pr.checks.skipped} tone="muted" />
        </div>
      </div>
    </li>
  );
}

function QueueColumn({
  title,
  copy,
  icon,
  prs,
}: {
  title: string;
  copy: string;
  icon: "ready" | "pending" | "blocked";
  prs: ExecutionPullRequest[];
}) {
  const Icon = icon === "ready" ? CheckCircle2 : icon === "blocked" ? AlertTriangle : Clock3;
  const tone =
    icon === "ready"
      ? "text-emerald-700 bg-emerald-50 ring-emerald-200"
      : icon === "blocked"
        ? "text-rose-700 bg-rose-50 ring-rose-200"
        : "text-sky-700 bg-sky-50 ring-sky-200";

  return (
    <section className="rounded-lg bg-[var(--color-surface)] p-4 ring-1 ring-[var(--color-hair)]">
      <div className="flex items-start gap-3">
        <span className={`rounded-md p-2 ring-1 ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-[var(--color-ink)]">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--color-ink-soft)]">{copy}</p>
        </div>
      </div>
      <ul className="mt-3">
        {prs.length ? (
          prs.map((pr) => <PRRow key={pr.number} pr={pr} />)
        ) : (
          <li className="border-t border-[var(--color-hair)] py-3 text-sm text-[var(--color-ink-muted)]">
            None.
          </li>
        )}
      </ul>
    </section>
  );
}

export function ExecutionQueue({ status }: { status: ExecutionStatus }) {
  return (
    <section className="mb-6 rounded-xl bg-gray-950 p-4 text-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-white/15">
            <GitPullRequest className="h-3.5 w-3.5" />
            Execution cockpit
          </div>
          <h2 className="mt-3 text-xl font-extrabold">{status.currentMilestone}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-200">{status.summary}</p>
        </div>
        <div className="text-right text-xs text-gray-300">
          Generated {relativeTime(status.generatedAt)}
          <div className="mt-1 text-gray-400">{status.source}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <QueueColumn
          title="Ready to merge"
          copy="Mergeable with checks passing. Supabase Preview skips are expected."
          icon="ready"
          prs={status.readyToMerge}
        />
        <QueueColumn
          title="Still running"
          copy="Wait for checks or review before asking Robert to merge."
          icon="pending"
          prs={status.inProgress}
        />
        <QueueColumn
          title="Needs action"
          copy="Conflicts or failed checks that need a fix before review."
          icon="blocked"
          prs={status.blocked}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-bold text-white">Vital blockers</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-gray-200">
            {status.vitalBlockers.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
          <h3 className="text-sm font-bold text-white">Next actions</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-gray-200">
            {status.nextActions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

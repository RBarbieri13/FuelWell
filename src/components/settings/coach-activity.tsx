"use client";

/** E6: the user's Coach tool-call audit trail, surfaced under Settings. */

import { useEffect, useState } from "react";
import { History, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type AuditRow = { tool: string; summary: string | null; ts?: string };

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export function CoachActivity() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);

  useEffect(() => {
    fetch("/api/coach/audit")
      .then((r) => (r.ok ? r.json() : { rows: [] }))
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]));
  }, []);

  return (
    <Card padding="sm" data-testid="coach-activity">
      {rows === null ? (
        <div aria-busy="true">
          <span className="sr-only" role="status">
            Loading activity…
          </span>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 border-b border-hairline py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-[0.8rem] bg-surface-sunken" />
                <Skeleton className="h-3.5 w-40 max-w-full bg-surface-sunken" />
              </div>
              <Skeleton className="h-3 w-12 shrink-0 bg-surface-sunken" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          size="inline"
          icon={History}
          title="No Coach actions yet."
          description="Everything Coach does in chat is recorded here."
        />
      ) : (
        <ul className="fw-rich-scroll max-h-64 divide-y divide-hairline overflow-y-auto">
          {rows.map((row, i) => (
            <li
              key={`${row.tool}-${i}`}
              className="flex min-h-14 items-center justify-between gap-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
                  <Wrench className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black capitalize text-ink">
                    {row.tool.replaceAll("_", " ")}
                  </span>
                  {row.summary && (
                    <span className="block truncate text-xs font-semibold text-ink-muted">
                      {row.summary}
                    </span>
                  )}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-ink-subtle">
                {row.ts ? formatTimestamp(row.ts) : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

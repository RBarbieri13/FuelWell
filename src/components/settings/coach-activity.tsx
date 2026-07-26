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
        // Same geometry as a real row (36px plate, min-h-14, py-2.5) inside the
        // same sunken well, so nothing shifts when the fetch resolves.
        <div aria-busy="true" className="rounded-[1.25rem] bg-surface-muted p-2 ring-1 ring-inset ring-hairline">
          <span className="sr-only" role="status">
            Loading activity…
          </span>
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex min-h-14 items-center justify-between gap-3 px-2 py-2.5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-[0.9rem] bg-surface-sunken" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 max-w-full bg-surface-sunken" />
                  <Skeleton className="h-3 w-48 max-w-full bg-surface-sunken/70" />
                </div>
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
        <div className="rounded-[1.25rem] bg-surface-muted p-2 ring-1 ring-inset ring-hairline">
          <ul
            aria-label="Coach action history, most recent first"
            className="fw-rich-scroll max-h-64 overflow-y-auto"
          >
            {rows.map((row, i) => (
              <li
                key={`${row.tool}-${i}`}
                className="group relative flex min-h-14 items-center justify-between gap-3 px-2 py-2.5"
              >
                {/* Connector rail: an audit log reads as a trail, not as a pile
                    of unrelated rows. Trimmed at both ends of the list. */}
                <span
                  aria-hidden="true"
                  className="absolute left-[1.625rem] top-0 bottom-0 w-px bg-hairline-strong group-first:top-1/2 group-last:bottom-1/2"
                />
                <span className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100">
                    <Wrench className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black capitalize text-ink">
                      {row.tool.replaceAll("_", " ")}
                    </span>
                    {row.summary && (
                      <span className="block truncate text-xs font-semibold leading-5 text-ink-muted">
                        {row.summary}
                      </span>
                    )}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-ink-muted">
                  {row.ts ? formatTimestamp(row.ts) : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

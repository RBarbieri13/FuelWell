"use client";

/** E6: the user's Coach tool-call audit trail, surfaced under Settings. */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

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
        <p className="py-2 text-sm text-neutral-500">Loading activity…</p>
      ) : rows.length === 0 ? (
        <p className="py-2 text-sm text-neutral-500">
          No Coach actions yet. Everything Coach does in chat is recorded here.
        </p>
      ) : (
        <ul className="max-h-64 divide-y divide-neutral-100 overflow-y-auto">
          {rows.map((row, i) => (
            <li key={`${row.tool}-${i}`} className="flex items-center justify-between gap-3 py-2">
              <span className="truncate text-sm font-semibold text-neutral-800">
                {row.tool.replaceAll("_", " ")}
              </span>
              <span className="shrink-0 text-xs font-medium text-neutral-400">
                {row.ts ? formatTimestamp(row.ts) : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

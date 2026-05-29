import {
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Circle,
  type LucideIcon,
} from "lucide-react";
import type { PhaseStatus } from "@/lib/types";

export interface StatusMeta {
  label: string;
  fg: string;
  bg: string;
  ring: string;
  Icon: LucideIcon;
}

export function statusMeta(status: PhaseStatus): StatusMeta {
  switch (status) {
    case "complete":
      return {
        label: "Complete",
        fg: "text-emerald-700",
        bg: "bg-emerald-50",
        ring: "ring-emerald-200",
        Icon: CheckCircle2,
      };
    case "in_progress":
      return {
        label: "In progress",
        fg: "text-sky-700",
        bg: "bg-sky-50",
        ring: "ring-sky-200",
        Icon: CircleDot,
      };
    case "gap":
      return {
        label: "Gap — verify",
        fg: "text-amber-700",
        bg: "bg-amber-50",
        ring: "ring-amber-300",
        Icon: AlertTriangle,
      };
    default:
      return {
        label: "Not started",
        fg: "text-gray-500",
        bg: "bg-gray-50",
        ring: "ring-gray-200",
        Icon: Circle,
      };
  }
}

export function StatusBadge({ status }: { status: PhaseStatus }) {
  const m = statusMeta(status);
  const Icon = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.fg} ${m.bg} ${m.ring}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {m.label}
    </span>
  );
}

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(iso: string | null, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "";
  const secs = Math.round((now.getTime() - d.getTime()) / 1000);
  const abs = Math.abs(secs);
  const units: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86400, "h"],
    [604800, "d"],
    [2629800, "w"],
  ];
  let val = secs;
  let unit = "s";
  let prev = 1;
  for (const [limit, label] of units) {
    if (abs < limit) {
      val = Math.round(secs / prev);
      unit = label;
      break;
    }
    prev = limit;
    unit = label;
    val = Math.round(secs / limit);
  }
  return `${Math.abs(val)}${unit} ago`;
}

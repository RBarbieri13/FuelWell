import Link from "next/link";
import {
  UtensilsCrossed,
  Camera,
  MessageSquare,
  Barcode,
} from "lucide-react";

const actions = [
  {
    href: "/app/log",
    label: "Log Meal",
    icon: UtensilsCrossed,
    color: "bg-primary-50 text-primary-600",
  },
  {
    href: "/app/log?mode=photo",
    label: "Snap Photo",
    icon: Camera,
    color: "bg-accent-50 text-accent-600",
  },
  {
    href: "/app/coach",
    label: "Ask Coach",
    icon: MessageSquare,
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/app/log?mode=scan",
    label: "Scan Barcode",
    icon: Barcode,
    color: "bg-purple-50 text-purple-600",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
        >
          <div className={`p-2 rounded-lg ${action.color}`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-neutral-700">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

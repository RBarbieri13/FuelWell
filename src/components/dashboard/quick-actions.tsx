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
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    href: "/app/log?mode=photo",
    label: "Snap Photo",
    icon: Camera,
    iconBg: "bg-accent-50",
    iconColor: "text-accent-600",
  },
  {
    href: "/app/coach",
    label: "Ask Coach",
    icon: MessageSquare,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    href: "/app/log?mode=scan",
    label: "Scan Barcode",
    icon: Barcode,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm transition-all duration-150"
        >
          <div className={`p-2.5 rounded-xl ${action.iconBg} transition-transform duration-150 group-hover:scale-105`}>
            <action.icon className={`w-4.5 h-4.5 ${action.iconColor}`} />
          </div>
          <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

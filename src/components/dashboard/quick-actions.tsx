import Link from "next/link";
import {
  UtensilsCrossed,
  Camera,
  MessageSquare,
  Barcode,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

const actions = [
  {
    href: "/app/log",
    label: "Log meal",
    icon: UtensilsCrossed,
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    href: "/app/log?mode=photo",
    label: "Snap photo",
    icon: Camera,
    iconBg: "bg-accent-50",
    iconColor: "text-accent-600",
  },
  {
    href: "/app/coach",
    label: "Ask coach",
    icon: MessageSquare,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    href: "/app/log?mode=scan",
    label: "Scan barcode",
    icon: Barcode,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    href: "/app/daily-review",
    label: "Daily review",
    icon: ClipboardList,
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    href: "/app/meal-plan",
    label: "Meal plan",
    icon: CalendarDays,
    iconBg: "bg-lemon-50",
    iconColor: "text-lemon-700",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="group flex items-center gap-4 rounded-[1.4rem] border border-primary-100/80 bg-white p-5 shadow-[0_18px_48px_rgba(22,48,42,0.07)] transition-all duration-150 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg"
        >
          <div className={`p-3 rounded-[1rem] ${action.iconBg} transition-transform duration-150 group-hover:scale-105`}>
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>
          <span className="text-base font-black text-neutral-800 transition-colors group-hover:text-primary-800">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import {
  UtensilsCrossed,
  Camera,
  MessageSquare,
  Barcode,
  ClipboardList,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const actions = [
  {
    href: "/app/log",
    label: "Log meal",
    icon: UtensilsCrossed,
    iconBg: "bg-primary-50",
    iconRing: "ring-primary-100",
    iconColor: "text-primary-700",
  },
  {
    href: "/app/log?mode=photo",
    label: "Snap photo",
    icon: Camera,
    iconBg: "bg-accent-50",
    iconRing: "ring-accent-100",
    iconColor: "text-accent-700",
  },
  {
    href: "/app/coach",
    label: "Ask coach",
    icon: MessageSquare,
    iconBg: "bg-sky-50",
    iconRing: "ring-sky-100",
    iconColor: "text-sky-700",
  },
  {
    href: "/app/log?mode=scan",
    label: "Scan barcode",
    icon: Barcode,
    iconBg: "bg-sky-50",
    iconRing: "ring-sky-100",
    iconColor: "text-sky-700",
  },
  {
    href: "/app/daily-review",
    label: "Daily review",
    icon: ClipboardList,
    iconBg: "bg-primary-50",
    iconRing: "ring-primary-100",
    iconColor: "text-primary-700",
  },
  {
    href: "/app/meal-plan",
    label: "Meal plan",
    icon: CalendarDays,
    iconBg: "bg-lemon-50",
    iconRing: "ring-lemon-100",
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
          className="fw-press group flex min-h-[4.5rem] items-center gap-2.5 rounded-[1.4rem] border border-hairline bg-surface p-3 shadow-e1 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:gap-4 sm:p-5"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] ring-1 ring-inset sm:h-11 sm:w-11 sm:rounded-[1rem] ${action.iconBg} ${action.iconRing} ${action.iconColor}`}
          >
            <action.icon className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 break-words text-sm font-black leading-tight text-ink transition-colors group-hover:text-primary-800 sm:text-base">
            {action.label}
          </span>
          <ChevronRight
            aria-hidden="true"
            className="hidden h-4 w-4 shrink-0 text-ink-faint transition-transform duration-150 ease-out-soft group-hover:translate-x-0.5 group-hover:text-primary-600 sm:block"
          />
        </Link>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  ShoppingBasket,
  ClipboardList,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const mobileNavItems = [
  { href: "/app/dashboard", label: "Home", icon: LayoutDashboard, color: "text-primary-600" },
  { href: "/app/log", label: "Log", icon: PlusCircle, highlight: true, color: "text-accent-600" },
  { href: "/app/coach", label: "Coach", icon: MessageSquare, color: "text-sky-600" },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell, color: "text-teal-600" },
  { href: "/app/grocery-list", label: "Groceries", icon: ShoppingBasket, color: "text-primary-600" },
  { href: "/app/daily-review", label: "Review", icon: ClipboardList, color: "text-lemon-600" },
];

// Movement-cluster subpages without their own tab highlight the Workouts tab
// so deep routes still show a location (F7).
const activeAliases: Record<string, string> = {
  "/app/fitness": "/app/workouts",
  "/app/activity": "/app/workouts",
  "/app/progress": "/app/workouts",
  "/app/nutrition": "/app/log",
};

export function MobileNav() {
  const pathname = usePathname();

  const aliasTarget = Object.entries(activeAliases).find(([alias]) =>
    pathname.startsWith(alias)
  )?.[1];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline bg-surface/94 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-e3 backdrop-blur-xl md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around gap-0.5 px-1 pb-1 pt-1.5">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || aliasTarget === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // 44px minimum target; six tabs still fit a 320px viewport
                // because the plate — not the label — carries the width.
                "fw-press group relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-0.5 py-1 tracking-tight",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1",
                isActive ? item.color : "text-ink-subtle hover:text-primary-700"
              )}
            >
              {/* Filled plate behind the glyph — a colour change alone is too
                  weak an active signal at this size. */}
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-7 w-full max-w-[3.25rem] items-center justify-center rounded-full transition-colors duration-200 ease-out-soft",
                  isActive
                    ? "bg-primary-50 ring-1 ring-inset ring-primary-100"
                    : "group-hover:bg-surface-muted"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200 ease-spring",
                    isActive && "scale-110",
                    item.highlight && !isActive && "text-accent-500"
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
              </span>
              <span
                className={cn(
                  "w-full truncate text-center text-[0.625rem] leading-none",
                  isActive ? "font-black" : "font-bold"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

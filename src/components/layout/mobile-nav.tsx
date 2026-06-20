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
  { href: "/app/workouts", label: "Move", icon: Dumbbell, color: "text-sky-600" },
  { href: "/app/grocery-list", label: "Groceries", icon: ShoppingBasket, color: "text-primary-600" },
  { href: "/app/daily-review", label: "Review", icon: ClipboardList, color: "text-lemon-600" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/94 backdrop-blur-xl border-t border-primary-100/80 shadow-[0_-12px_30px_rgba(21,145,108,0.08)] pb-[max(env(safe-area-inset-bottom),0.5rem)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around pt-2 pb-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold tracking-tight transition-colors",
                isActive || item.highlight ? item.color : "text-neutral-400 hover:text-primary-700"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-150",
                  isActive && "scale-110",
                  item.highlight && "w-6 h-6"
                )}
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

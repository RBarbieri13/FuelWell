"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const mobileNavItems = [
  { href: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/app/coach", label: "Coach", icon: MessageSquare },
  { href: "/app/log", label: "Log", icon: PlusCircle, highlight: true },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-neutral-200/80 pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-1.5">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors",
                item.highlight && !isActive
                  ? "text-primary-600"
                  : isActive
                    ? "text-primary-600"
                    : "text-neutral-400"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform duration-150",
                  isActive && "scale-110",
                  item.highlight && "w-6 h-6"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

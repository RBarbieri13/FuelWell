"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  UtensilsCrossed,
  BookOpen,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/coach", label: "Coach", icon: MessageSquare },
  { href: "/app/log", label: "Log Meal", icon: UtensilsCrossed },
  { href: "/app/recipes", label: "Recipes", icon: BookOpen },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-neutral-200/80 md:bg-white">
      <div className="px-6 py-5 border-b border-neutral-100">
        <Logo href="/app/dashboard" size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5" role="navigation" aria-label="Main">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-primary-600")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

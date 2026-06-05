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
  Dumbbell,
  HeartPulse,
  ShoppingBasket,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/log", label: "Log Meal", icon: UtensilsCrossed },
  { href: "/app/coach", label: "Coach", icon: MessageSquare },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/app/recipes", label: "Recipes", icon: BookOpen },
  { href: "/app/grocery-list", label: "Groceries", icon: ShoppingBasket },
  { href: "/app/recovery", label: "Recovery", icon: HeartPulse },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-68 md:border-r md:border-white/70 md:bg-white/72 md:backdrop-blur-xl">
      <div className="px-6 py-5 border-b border-neutral-100/80">
        <Logo href="/app/dashboard" size="md" />
        <p className="mt-2 text-xs font-medium text-neutral-400">
          Daily decision system
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" role="navigation" aria-label="Main">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? "bg-neutral-900 text-white shadow-lg shadow-neutral-300/60"
                  : "text-neutral-500 hover:bg-white hover:text-neutral-900 hover:shadow-sm"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-300" : "text-neutral-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

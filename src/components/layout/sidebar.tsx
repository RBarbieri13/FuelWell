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
  Flame,
  Leaf,
  ShoppingBasket,
  Settings,
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
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[20rem] md:flex-col md:border-r md:border-primary-100/80 md:bg-sidebar md:backdrop-blur-xl">
      <div className="px-7 py-8">
        <Link href="/app/dashboard" className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-[0_18px_38px_rgba(21,145,108,0.25)]">
            <Leaf className="h-7 w-7" />
          </div>
          <div>
            <Logo href="" size="lg" />
            <p className="mt-0.5 text-sm font-semibold text-neutral-400">
              Daily decision system
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5" role="navigation" aria-label="Main">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-4 px-4 py-3 rounded-[1.15rem] text-[0.95rem] font-bold transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)]"
                  : "text-neutral-600 hover:bg-primary-50 hover:text-primary-800"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 stroke-[2.15]", isActive ? "text-white" : "text-neutral-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pb-6">
        <div className="rounded-[1.5rem] bg-primary-100/75 p-5 shadow-sm shadow-primary-900/5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600">
              <Flame className="h-5 w-5" />
            </span>
            <p className="text-base font-black text-primary-700">6-day streak</p>
          </div>
          <p className="mt-3 text-sm font-semibold leading-5 text-primary-800/75">
            Log dinner to keep it alive tonight.
          </p>
        </div>
      </div>
    </aside>
  );
}

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
    <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-neutral-200 md:bg-white">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-200">
        <Link href="/app/dashboard" className="text-xl font-bold text-primary-600">
          FuelWell
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

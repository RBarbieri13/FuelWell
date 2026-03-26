"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  UtensilsCrossed,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const mobileNavItems = [
  { href: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/app/coach", label: "Coach", icon: MessageSquare },
  { href: "/app/log", label: "Log", icon: UtensilsCrossed },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary-600"
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

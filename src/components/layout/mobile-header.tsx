"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const pageTitles: Record<string, string> = {
  "/app/dashboard": "Today",
  "/app/daily-review": "Daily review",
  "/app/log": "Log",
  "/app/coach": "Coach",
  "/app/workouts": "Move",
  "/app/fitness": "Fitness",
  "/app/nutrition": "Nutrition",
  "/app/grocery-list": "Groceries",
  "/app/recovery": "Recovery",
  "/app/progress": "Progress",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
};

export function MobileHeader() {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([href]) => pathname.startsWith(href))?.[1] ??
    "FuelWell";

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-primary-100/80 px-4 py-3 shadow-sm shadow-primary-900/5">
      <div className="flex items-center justify-between">
        <Logo href="/app/dashboard" size="md" />
        <div className="flex items-center gap-2">
          <span className="max-w-[8rem] truncate rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
            {title}
          </span>
          {pathname !== "/app/daily-review" && (
            <Link
              href="/app/daily-review"
              aria-label="Open daily review"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm shadow-primary-900/10"
            >
              <ClipboardList className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

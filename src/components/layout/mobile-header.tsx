"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { UserMenu, type UserMenuSession } from "@/components/layout/user-menu";

const pageTitles: Record<string, string> = {
  "/app/dashboard": "Today",
  "/app/daily-review": "Daily review",
  "/app/log": "Log",
  "/app/coach": "Coach",
  "/app/workouts": "Workouts",
  "/app/fitness": "Activity detail",
  "/app/nutrition": "Nutrition",
  "/app/grocery-list": "Groceries",
  "/app/recovery": "Recovery",
  "/app/progress": "Progress",
  "/app/profile": "Profile",
  "/app/settings": "Settings",
  "/app/meal-plan": "Meal plan",
  "/app/recipes": "Recipes",
  "/app/activity": "Activity",
  "/app/onboarding": "Setup",
  "/app/launch-preflight": "Launch preflight",
};

export function MobileHeader({ session = "anonymous" }: { session?: UserMenuSession }) {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ??
    Object.entries(pageTitles).find(([href]) => pathname.startsWith(href))?.[1] ??
    "FuelWell";

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/92 backdrop-blur-xl border-b border-primary-100/80 px-4 py-2 shadow-sm shadow-primary-900/5">
      <div className="flex items-center justify-between">
        <Logo href="/app/dashboard" size="md" />
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 max-w-[12rem] truncate rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700">
            {title}
          </span>
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}

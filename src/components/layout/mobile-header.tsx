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
    // The shell runs with viewport-fit=cover and a translucent status bar, so
    // the header owns the top inset — without it the logo sits under the clock.
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.5rem)] shadow-e1 backdrop-blur-xl md:hidden">
      <div className="flex min-h-11 items-center justify-between gap-2">
        <Logo href="/app/dashboard" size="md" />
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 max-w-[11rem] truncate rounded-full bg-primary-50 px-3 py-1.5 text-xs font-black text-primary-700 ring-1 ring-inset ring-primary-100">
            {title}
          </span>
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  );
}

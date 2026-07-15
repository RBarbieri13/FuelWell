"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/daily-review", label: "Daily Review", icon: ClipboardList },
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
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(336);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    function handlePointerMove(event: PointerEvent) {
      setSidebarWidth(Math.min(420, Math.max(260, event.clientX)));
    }

    function stopResizing() {
      setIsResizing(false);
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing, { once: true });

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
    };
  }, [isResizing]);

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 transition-[width] duration-200 md:flex md:flex-col md:border-r-[3px] md:border-primary-300/90 md:bg-primary-100/80 md:shadow-[inset_-2px_0_0_rgba(21,145,108,0.12),12px_0_32px_rgba(21,80,68,0.08)] md:backdrop-blur-xl",
        collapsed && "md:w-[6.5rem]"
      )}
      style={{ width: collapsed ? undefined : sidebarWidth }}
    >
      <div className={cn("px-7 py-8", collapsed && "px-4")}>
        <div className="flex items-center justify-between gap-3">
          <Link href="/app/dashboard" className={cn("flex items-center gap-4", collapsed && "justify-center")}>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-[0_18px_38px_rgba(21,145,108,0.25)]">
              <Leaf className="h-8 w-8" />
            </div>
            <div className={cn(collapsed && "hidden")}>
              <Logo href="" size="lg" className="text-[1.7rem]" />
              <p className="mt-1 text-base font-bold leading-tight text-neutral-500">
                Daily decision system
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-700 shadow-[0_8px_18px_rgba(20,90,75,0.1)] transition hover:bg-primary-50",
              collapsed && "absolute left-[4.5rem] top-6 z-10"
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className={cn("flex-1 space-y-2 px-4 py-2", collapsed && "px-3")} role="navigation" aria-label="Main">
        {navItems.map((item) => {
          const isActive =
            pathname.startsWith(item.href) ||
            (item.href === "/app/progress" && pathname.startsWith("/app/fitness"));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-4 rounded-[1.25rem] px-5 py-3.5 text-[1.08rem] font-black transition-all duration-150",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_16px_34px_rgba(21,145,108,0.24)]"
                  : "text-neutral-600 hover:bg-primary-50 hover:text-primary-800"
              )}
            >
              <item.icon className={cn("h-6 w-6 shrink-0 stroke-[2.25]", isActive ? "text-white" : "text-neutral-500")} />
              <span className={cn(collapsed && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("px-5 pb-6", collapsed && "px-3")}>
        <div className={cn("rounded-[1.5rem] bg-primary-100/75 p-5 shadow-sm shadow-primary-900/5", collapsed && "p-3")}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600">
              <Flame className="h-5 w-5" />
            </span>
            <p className={cn("text-base font-black text-primary-700", collapsed && "sr-only")}>6-day streak</p>
          </div>
          <p className={cn("mt-3 text-sm font-semibold leading-5 text-primary-800/75", collapsed && "sr-only")}>
            Log dinner to keep it alive tonight.
          </p>
        </div>
      </div>
      {!collapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize menu"
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault();
            setIsResizing(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setSidebarWidth((width) => Math.max(260, width - 16));
            if (event.key === "ArrowRight") setSidebarWidth((width) => Math.min(420, width + 16));
          }}
          className="absolute right-[-6px] top-0 hidden h-full w-3 cursor-col-resize items-center justify-center outline-none md:flex"
        >
          <span
            className={cn(
              "h-16 w-1 rounded-full bg-primary-300/80 shadow-[0_0_0_4px_rgba(255,255,255,0.75)] transition",
              isResizing && "h-24 bg-primary-600"
            )}
          />
        </div>
      )}
    </aside>
  );
}

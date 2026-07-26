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
  { href: "/app/daily-review", label: "Daily review", icon: ClipboardList },
  { href: "/app/log", label: "Log meal", icon: UtensilsCrossed },
  { href: "/app/coach", label: "Coach", icon: MessageSquare },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/app/recipes", label: "Recipes", icon: BookOpen },
  { href: "/app/grocery-list", label: "Groceries", icon: ShoppingBasket },
  { href: "/app/recovery", label: "Recovery", icon: HeartPulse },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

// Hidden subpages highlight their owning nav destination so deep routes
// still show a location (F7).
const activeAliases: Record<string, string> = {
  "/app/fitness": "/app/progress",
  "/app/activity": "/app/progress",
  "/app/nutrition": "/app/log",
  "/app/meal-plan": "/app/recipes",
};

const WIDTH_STORAGE_KEY = "fw-sidebar-width";
const COLLAPSED_STORAGE_KEY = "fw-sidebar-collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(336);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Persisted layout must be read after hydration to avoid SSR mismatch.
    const storedWidth = Number(window.localStorage.getItem(WIDTH_STORAGE_KEY));
    if (Number.isFinite(storedWidth) && storedWidth >= 260 && storedWidth <= 420) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSidebarWidth(storedWidth);
    }
    if (window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WIDTH_STORAGE_KEY, String(sidebarWidth));
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [sidebarWidth, collapsed]);

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
        // One hairline, one elevation. The old 3px primary rule + inset shadow
        // read as a seam rather than as an edge of the app surface.
        "relative hidden shrink-0 transition-[width] duration-200 ease-out-soft md:flex md:flex-col md:border-r md:border-hairline-strong md:bg-surface/72 md:shadow-e1 md:backdrop-blur-xl",
        collapsed && "md:w-[4.5rem]"
      )}
      style={{ width: collapsed ? undefined : sidebarWidth }}
    >
      <div className={cn("px-5 pb-4 pt-6", collapsed && "px-2")}>
        <div className={cn("flex items-center justify-between gap-3", collapsed && "flex-col gap-2")}>
          <Link
            href="/app/dashboard"
            className={cn(
              "-m-1 flex min-w-0 items-center gap-3 rounded-2xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
              collapsed && "justify-center"
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-gradient-to-br from-primary-500 to-teal-600 text-white shadow-e2">
              <Leaf className="h-[1.375rem] w-[1.375rem]" strokeWidth={2} />
            </span>
            <span className={cn("min-w-0", collapsed && "hidden")}>
              <Logo href="" size="lg" />
              <span className="block truncate text-sm font-bold leading-tight text-ink-muted">
                Daily decision system
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            aria-expanded={!collapsed}
            className="fw-press inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline-strong bg-surface text-primary-700 shadow-e1 hover:border-primary-200 hover:bg-primary-50 hover:shadow-e2 active:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            ) : (
              <PanelLeftClose className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      <nav
        className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2 pb-4", collapsed && "px-2")}
        role="navigation"
        aria-label="Main"
      >
        {navItems.map((item) => {
          const aliasTarget = Object.entries(activeAliases).find(([alias]) =>
            pathname.startsWith(alias)
          )?.[1];
          const isActive = pathname.startsWith(item.href) || aliasTarget === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "fw-press group relative flex min-h-12 items-center gap-3.5 rounded-2xl px-4 py-2.5 text-base font-bold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-gradient-to-b from-primary-500 to-teal-600 font-black text-white shadow-e2"
                  : "text-ink-muted hover:bg-primary-50/80 hover:text-primary-800"
              )}
            >
              {/* Rail keeps the selection legible when the row scrolls behind
                  the header blur and for anyone who can't resolve the fill. */}
              {isActive && !collapsed && (
                <span
                  aria-hidden="true"
                  className="absolute left-1.5 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/80"
                />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-ink-subtle group-hover:text-primary-700"
                )}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

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
          className="group absolute right-[-6px] top-0 hidden h-full w-3 cursor-col-resize items-center justify-center outline-none md:flex"
        >
          <span
            className={cn(
              "h-14 w-1 rounded-full bg-hairline-strong ring-4 ring-surface/70 transition-all duration-200 ease-out-soft",
              "group-hover:h-20 group-hover:bg-primary-300",
              "group-focus-visible:h-20 group-focus-visible:bg-primary-600",
              isResizing && "h-24 bg-primary-600"
            )}
          />
        </div>
      )}
    </aside>
  );
}

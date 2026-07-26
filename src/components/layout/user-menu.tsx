"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  Download,
  HelpCircle,
  LogIn,
  LogOut,
  Shield,
  Sparkles,
  User,
  UserCog,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clearUserScopedIdentityCaches } from "@/lib/profile-preferences";
import { clearPreferencesForUser } from "@/lib/use-preferences";
import { cn } from "@/lib/utils/cn";

export type UserMenuSession = "authenticated" | "preview" | "anonymous";

// 44px rows so the menu is usable with a thumb, shared by links and buttons
// so the two never drift apart.
const itemClass =
  "group/item flex min-h-11 items-center gap-3 rounded-[0.95rem] px-3 text-sm font-bold transition-colors duration-150 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600";

const menuItems = [
  { label: "Profile", href: "/app/profile", icon: User },
  { label: "Account Details", href: "/app/settings#account", icon: UserCog },
  { label: "Privacy", href: "/app/settings#privacy", icon: Shield },
  { label: "Coach Preferences", href: "/app/settings#coach-preferences", icon: Sparkles },
  { label: "Data Export", href: "/app/settings#data", icon: Download },
  { label: "Subscription", href: "/app/settings#subscription", icon: CreditCard },
  { label: "Support", href: "/app/settings#support", icon: HelpCircle },
];

export function UserMenu({ session = "anonymous" }: { session?: UserMenuSession }) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      clearUserScopedIdentityCaches(user.id);
      clearPreferencesForUser(user.id);
    }
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative shrink-0">
      <div ref={containerRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Open user settings menu"
          className={cn(
            "fw-press -my-1.5 flex h-11 w-11 items-center justify-center rounded-full border bg-surface/92 text-primary-700 shadow-e1 backdrop-blur",
            "hover:border-primary-200 hover:bg-primary-50 hover:shadow-e2 active:bg-primary-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2",
            open
              ? "border-primary-300 bg-primary-50 shadow-e2"
              : "border-hairline-strong"
          )}
        >
          <User className="h-5 w-5" strokeWidth={2} />
        </button>

        {open && (
          <div
            role="menu"
            aria-orientation="vertical"
            aria-label="User settings"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-[1.25rem] border border-hairline-strong bg-surface p-2 shadow-e4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 ease-out-soft"
          >
            <p className="px-3 pb-1.5 pt-2 text-[0.6875rem] font-black uppercase tracking-[0.14em] text-primary-700">
              User Settings
            </p>
            <div className="grid gap-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(itemClass, "text-ink")}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-ink-subtle transition-colors group-hover/item:text-primary-700"
                      strokeWidth={2}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Session actions are a separate group — a hairline keeps "Sign
                out" from reading as one more settings destination. */}
            {(session === "authenticated" || session === "anonymous") && (
              <div className="mt-1.5 border-t border-hairline pt-1.5">
                {session === "authenticated" && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    aria-busy={signingOut || undefined}
                    className={cn(
                      itemClass,
                      "w-full text-left text-red-700 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50"
                    )}
                  >
                    <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">
                      {signingOut ? "Signing out…" : "Sign out"}
                    </span>
                  </button>
                )}
                {session === "anonymous" && (
                  <Link
                    href="/login"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(itemClass, "text-primary-800")}
                  >
                    <LogIn className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">Sign in</span>
                  </Link>
                )}
              </div>
            )}

            <div className="mt-1.5 space-y-1.5 border-t border-hairline pt-1.5">
              {session === "preview" && (
                <p className="rounded-[0.95rem] bg-lemon-50 px-3 py-2 text-xs font-bold leading-5 text-lemon-700 ring-1 ring-inset ring-lemon-100">
                  Preview session — changes stay on this device.
                </p>
              )}
              <p className="rounded-[0.95rem] bg-surface-muted px-3 py-2 text-xs font-semibold leading-5 text-ink-muted">
                Account deletion, data export, connected apps, coach memory, and notification preferences live in Settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

export type UserMenuSession = "authenticated" | "preview" | "anonymous";

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
          className="-my-1.5 flex h-11 w-11 items-center justify-center rounded-full border border-primary-100 bg-white/92 text-primary-700 shadow-sm shadow-primary-900/10 backdrop-blur transition hover:bg-primary-50"
        >
          <User className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-64 overflow-hidden rounded-[1.25rem] border border-primary-100 bg-white p-2 shadow-[0_24px_50px_rgba(16,48,40,0.18)]">
            <div className="px-3 py-2">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                User Settings
              </p>
            </div>
            <div className="grid gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-sm font-black text-foreground transition hover:bg-primary-50"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              {session === "authenticated" && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-left text-sm font-black text-foreground transition hover:bg-primary-50 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              )}
              {session === "anonymous" && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-sm font-black text-foreground transition hover:bg-primary-50"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  Sign in
                </Link>
              )}
            </div>
            {session === "preview" && (
              <div className="mt-1 rounded-[0.95rem] bg-primary-50/70 px-3 py-2 text-xs font-semibold leading-5 text-primary-900/70">
                Preview session — changes stay on this device.
              </div>
            )}
            <div className="mt-1 rounded-[0.95rem] bg-primary-50/70 px-3 py-2 text-xs font-semibold leading-5 text-primary-900/70">
              Account deletion, data export, connected apps, coach memory, and notification preferences live in Settings.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

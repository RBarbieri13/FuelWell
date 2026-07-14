"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  Download,
  HelpCircle,
  LogIn,
  Shield,
  Sparkles,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const menuItems = [
  { label: "Account Details", href: "/app/settings#account", icon: UserCog },
  { label: "Privacy", href: "/app/settings#privacy", icon: Shield },
  { label: "Coach Preferences", href: "/app/settings#coach-preferences", icon: Sparkles },
  { label: "Data Export", href: "/app/settings#data", icon: Download },
  { label: "Subscription", href: "/app/settings#subscription", icon: CreditCard },
  { label: "Support", href: "/app/settings#support", icon: HelpCircle },
  { label: "Login / Logout", href: "/login", icon: LogIn },
  { label: "Delete Account", href: "/app/settings#delete-account", icon: Trash2, danger: true },
];

export function UserMenu({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const [open, setOpen] = useState(false);
  const inline = variant === "inline";
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

  return (
    <div className={cn(inline ? "relative shrink-0" : "pointer-events-none fixed bottom-4 right-4 z-[70] hidden md:block")}>
      <div ref={containerRef} className={cn(!inline && "pointer-events-auto relative")}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={inline ? "Open user settings menu" : "Open desktop user settings menu"}
          className={cn(
            "flex items-center justify-center rounded-full border border-primary-100 bg-white/92 text-primary-700 backdrop-blur transition hover:bg-primary-50",
            inline
              ? "-my-1.5 h-11 w-11 shadow-sm shadow-primary-900/10"
              : "h-11 w-11 shadow-[0_12px_28px_rgba(20,90,75,0.12)]"
          )}
        >
          <User className="h-5 w-5" />
        </button>

        {open && (
          <div
            className={cn(
              "absolute right-0 w-64 overflow-hidden rounded-[1.25rem] border border-primary-100 bg-white p-2 shadow-[0_24px_50px_rgba(16,48,40,0.18)]",
              inline ? "top-10" : "bottom-12"
            )}
          >
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
                    className={cn(
                      "flex items-center gap-3 rounded-[0.95rem] px-3 py-2.5 text-sm font-black transition",
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-[#16302a] hover:bg-primary-50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-1 rounded-[0.95rem] bg-primary-50/70 px-3 py-2 text-xs font-semibold leading-5 text-primary-900/70">
              Also useful: data export, connected apps, coach memory, and notification preferences live in Settings.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

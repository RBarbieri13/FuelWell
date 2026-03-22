"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Founders 100", href: "/founders-100" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full gradient-header border-b border-fw-border/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-white">
          Fuel<span className="text-fw-accent">Well</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-fw-accent",
                pathname === link.href
                  ? "text-fw-accent"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <GradientButton href="/founders-100" size="sm">
            Join Founders 100
          </GradientButton>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden text-white p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-fw-border/50 bg-fw-surface px-4 pb-6 pt-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block text-base font-medium px-4 py-2 rounded-lg transition-colors",
                pathname === link.href
                  ? "text-fw-accent bg-fw-accent/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-4 pt-4">
            <GradientButton
              href="/founders-100"
              className="w-full"
              size="sm"
            >
              Join Founders 100
            </GradientButton>
          </div>
        </nav>
      )}
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Founders 100", href: "/founders-100" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-fw-border/90 transition-[background-color,box-shadow] duration-300",
        scrolled
          ? "glass shadow-card"
          : "bg-white/90 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex min-h-11 items-center gap-2" aria-label="FuelWell Health home">
          <Image src="/fw-logo.png" alt="" width={56} height={56} className="shrink-0 self-center transition-transform duration-200 group-hover:scale-[1.03]" />
          <span className="inline-flex items-baseline gap-1.5 font-heading text-2xl font-bold leading-none text-foreground sm:text-[26px]">
            <span>Fuel<span className="text-fw-accent transition-colors group-hover:text-fw-orange">Well</span></span>
            <span className="font-sans text-sm font-semibold text-muted-foreground sm:text-base">Health</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-2 text-[15px] font-semibold transition-colors hover:text-fw-accent",
                pathname === link.href
                  ? "text-fw-accent"
                  : "text-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-indicator"
                  className="gradient-brand absolute -bottom-[17px] left-0 right-0 h-0.5 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <GradientButton href="/founders-100" size="default">
            Join Founders 100
          </GradientButton>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-[0.875rem] p-3 text-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass overflow-hidden border-t border-fw-border md:hidden"
          >
            <div className="px-5 pb-8 pt-5 space-y-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block min-h-12 rounded-[0.875rem] px-5 py-3 text-base font-semibold transition-colors",
                      pathname === link.href
                        ? "text-fw-accent bg-fw-accent/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="px-5 pt-5">
                <GradientButton
                  href="/founders-100"
                  className="w-full"
                  size="default"
                >
                  Join Founders 100
                </GradientButton>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

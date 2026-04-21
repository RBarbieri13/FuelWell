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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass shadow-[0_4px_12px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.06)]"
          : "bg-white/80 backdrop-blur-sm shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
      )}
    >
      {/* Bottom separator */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-60"
        )}
        style={{
          background: "linear-gradient(90deg, transparent, #cbd5e1 20%, #94a3b8 50%, #cbd5e1 80%, transparent)",
        }}
      />
      <div className="max-w-7xl mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <Image src="/fw-icon.png" alt="FuelWell" width={40} height={40} className="shrink-0 rounded-lg group-hover:scale-105 transition-transform duration-200 relative -top-[8px]" />
          <span className="inline-flex items-baseline gap-1.5 text-[26px] font-bold font-heading text-foreground leading-none">
            <span>Fuel<span className="text-fw-accent transition-colors group-hover:text-fw-orange">Well</span></span>
            <span className="text-base font-semibold text-muted-foreground">Health</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-lg font-semibold transition-colors hover:text-fw-accent",
                pathname === link.href
                  ? "text-fw-accent"
                  : "text-foreground"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-[22px] left-0 right-0 h-[2px] gradient-brand rounded-full"
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
          className="md:hidden text-foreground p-3 rounded-xl hover:bg-muted transition-colors"
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
            className="md:hidden border-t border-fw-border/50 glass overflow-hidden"
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
                      "block text-lg font-medium px-5 py-3 rounded-xl transition-colors",
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

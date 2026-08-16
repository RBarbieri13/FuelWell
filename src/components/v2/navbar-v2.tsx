"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/v2" },
  { label: "Features", href: "/v2/features" },
  { label: "Founders 100", href: "/v2/founders-100" },
  { label: "About", href: "/v2/about" },
];

export function NavbarV2() {
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
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-[#e7e8e8] bg-white/80 backdrop-blur-[20px] shadow-sm"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/v2" className="flex items-center gap-2.5 group">
          <Image src="/fw-icon.png" alt="FuelWell" width={40} height={40} className="rounded-lg group-hover:scale-105 transition-transform duration-200" />
          <span className="text-2xl font-extrabold" style={{ fontFamily: "var(--v2-font-heading)" }}>
            <span className="text-[#191c1d]">Fuel</span>
            <span className="text-[#006c49]">Well</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-semibold transition-colors",
                pathname === link.href
                  ? "text-[#006c49]"
                  : "text-[#3c4a42] hover:text-[#006c49]"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.span
                  layoutId="v2-nav-indicator"
                  className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full"
                  style={{ background: "linear-gradient(135deg, #006c49, #10b981)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/v2/founders-100"
            className="inline-flex items-center gap-2 h-10 px-6 text-sm font-semibold text-white rounded-full transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(0,108,73,0.2)]"
            style={{ background: "linear-gradient(135deg, #006c49, #10b981)" }}
          >
            Join Founders 100
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden text-[#191c1d] p-2 rounded-lg hover:bg-[#f0f1f1] transition-colors"
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
            className="md:hidden border-t border-[#e7e8e8] bg-white/95 backdrop-blur-[20px] overflow-hidden"
          >
            <div className="px-4 pb-6 pt-4 space-y-2">
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
                      "block text-sm font-medium px-4 py-2.5 rounded-lg transition-colors",
                      pathname === link.href
                        ? "text-[#006c49] bg-[#006c49]/10"
                        : "text-[#3c4a42] hover:text-[#006c49] hover:bg-[#f0f1f1]"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="px-4 pt-4">
                <Link
                  href="/v2/founders-100"
                  className="flex items-center justify-center gap-2 w-full h-10 text-sm font-semibold text-white rounded-full"
                  style={{ background: "linear-gradient(135deg, #006c49, #10b981)" }}
                  onClick={() => setOpen(false)}
                >
                  Join Founders 100
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

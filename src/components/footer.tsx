import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Heart, Twitter, Instagram, Music2 } from "lucide-react";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Founders 100", href: "/founders-100" },
  { label: "Sign Up", href: "/signup" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const socialLinks = [
  { label: "Twitter/X", href: "#", icon: Twitter },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "TikTok", href: "#", icon: Music2 },
];

export function Footer() {
  return (
    <footer className="bg-fw-surface border-t border-fw-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image src="/logo-icon.svg" alt="" width={28} height={28} className="rounded-lg group-hover:scale-105 transition-transform duration-200" />
              <span className="text-xl font-bold font-heading text-foreground">
                Fuel
                <span className="text-emerald-600 transition-colors group-hover:text-orange-500">
                  Well
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered nutrition and fitness coaching that adapts to your real
              life. Fuel well, feel well.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-fw-border text-muted-foreground hover:text-fw-accent hover:border-fw-accent/40 transition-all duration-200"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Product</p>
            <nav className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Company</p>
            <nav className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Legal</p>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-fw-border/50" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FuelWell Health, Inc. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-pulse" /> for healthier living
          </p>
        </div>

        <p className="text-[10px] text-center text-muted-foreground/60 mt-6 max-w-2xl mx-auto">
          FuelWell is designed to support healthier decision-making and
          education. It does not replace medical advice, personal trainers, or
          licensed nutrition professionals.
        </p>
      </div>
    </footer>
  );
}

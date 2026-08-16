import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Building2, ExternalLink, Heart } from "lucide-react";

const LINKEDIN_URL = "https://www.linkedin.com/company/fuelwell-health/";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Founders 100", href: "/founders-100" },
  { label: "Sign Up", href: "/founders-100/signup" },
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
  { label: "LinkedIn", href: LINKEDIN_URL, icon: Building2 },
];

export function Footer() {
  return (
    <footer className="bg-fw-surface border-t border-fw-border">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <Image src="/fuelwell-logo-full.png" alt="FuelWell Health" width={150} height={75} className="group-hover:scale-105 transition-transform duration-200" />
            </Link>
            <p className="max-w-xs text-[15px] leading-6 text-muted-foreground">
              AI-powered nutrition and fitness coaching that adapts to your real
              life. Fuel well, feel well.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href !== "#" ? "_blank" : undefined}
                    rel={link.href !== "#" ? "noopener noreferrer" : undefined}
                    aria-label={link.label}
                    className="flex h-11 w-11 items-center justify-center rounded-[0.875rem] border border-fw-border bg-white text-muted-foreground transition-colors duration-200 hover:border-fw-accent/40 hover:text-fw-accent"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">Product</p>
            <nav className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center text-[15px] text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">Company</p>
            <nav className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center text-[15px] text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">Legal</p>
            <nav className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex min-h-11 items-center text-[15px] text-muted-foreground transition-colors duration-200 hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Connect with Us — LinkedIn preview */}
        <Separator className="my-8 bg-fw-border/50" />

        <div className="max-w-sm mx-auto md:mx-0">
          <p className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
            Connect with Us
          </p>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="fw-marketing-card group block p-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-fw-accent/30 hover:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A66C2]">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    FuelWell Health
                  </p>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 shrink-0 group-hover:text-fw-accent transition-colors duration-200" />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  AI-powered nutrition & fitness coaching
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
              <span>Health, Wellness & Fitness</span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Follow us on LinkedIn
              </span>
            </div>
          </a>
        </div>

        <Separator className="my-8 bg-fw-border/50" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} FuelWell Health, Inc. All rights
            reserved.
          </p>
          <span className="inline-flex items-center rounded-lg border border-fw-border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Founded March 2026
          </span>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-pulse" /> for healthier living
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-muted-foreground/60">
          FuelWell is designed to support healthier decision-making and
          education. It does not replace medical advice, personal trainers, or
          licensed nutrition professionals.
        </p>
      </div>
    </footer>
  );
}

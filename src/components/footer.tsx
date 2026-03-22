import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Founders 100", href: "/founders-100" },
  { label: "About", href: "/about" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-fw-surface border-t border-fw-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-lg font-bold text-white">
              Fuel<span className="text-fw-accent">Well</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Fuel Well, Feel Well.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} FuelWell Health, Inc.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Navigation</p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Legal</p>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-fw-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-fw-border" />

        <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
          FuelWell is designed to support healthier decision-making and
          education. It does not replace medical advice, personal trainers, or
          licensed nutrition professionals.
        </p>
      </div>
    </footer>
  );
}

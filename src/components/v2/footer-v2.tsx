import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "Features", href: "/v2/features" },
  { label: "Founders 100", href: "/v2/founders-100" },
  { label: "Sign Up", href: "/signup" },
];

const companyLinks = [
  { label: "About", href: "/v2/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function FooterV2() {
  return (
    <footer className="bg-[#f0f1f1] border-t border-[#e7e8e8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Link href="/v2" className="inline-flex items-center gap-2.5 group">
              <Image src="/fw-icon.png" alt="FuelWell" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-extrabold" style={{ fontFamily: "var(--v2-font-heading)" }}>
                <span className="text-[#191c1d]">Fuel</span>
                <span className="text-[#006c49]">Well</span>
              </span>
            </Link>
            <p className="text-sm text-[#6c7a71] leading-relaxed max-w-xs">
              AI-powered nutrition and fitness coaching that adapts to your real
              life. Fuel well, feel well.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#006c49]">Product</p>
            <nav className="flex flex-col gap-2">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[#6c7a71] hover:text-[#006c49] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#006c49]">Company</p>
            <nav className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-[#6c7a71] hover:text-[#006c49] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#006c49]">Legal</p>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-[#6c7a71] hover:text-[#006c49] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="h-px bg-[#e7e8e8] my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6c7a71]">
          <p>&copy; {new Date().getFullYear()} FuelWell Health, Inc. All rights reserved.</p>
          <p>Made for healthier living</p>
        </div>

        <p className="text-[10px] text-center text-[#6c7a71]/60 mt-6 max-w-2xl mx-auto">
          FuelWell is designed to support healthier decision-making and education. It does not replace medical advice, personal trainers, or licensed nutrition professionals.
        </p>
      </div>
    </footer>
  );
}

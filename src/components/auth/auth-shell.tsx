import Link from "next/link";
import { ArrowRight, BadgeCheck, Leaf, Sparkles, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";

interface AuthShellProps {
  title: string;
  subtitle: string;
  panelTitle: string;
  panelCopy: string;
  features: { icon: LucideIcon; text: string }[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelCopy,
  features,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main className="fw-app-surface min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[0.88fr_1fr]">
        <aside className="fw-dark-panel relative hidden overflow-hidden rounded-none border-0 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="relative z-10 flex items-center justify-between">
            <Logo href="/" size="lg" className="[&_span]:text-white" />
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              Home
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-100">
              <Sparkles className="h-4 w-4" />
              Daily decision system
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white xl:text-6xl">
              {panelTitle}
            </h1>
            <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/68">
              {panelCopy}
            </p>
          </div>

          <div className="relative z-10 grid gap-3">
            {features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.075] p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-300 text-primary-950">
                  <feature.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-black text-white/82">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
                  Preview mode
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  Setup takes a few minutes
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-400 text-primary-950">
                <BadgeCheck className="h-6 w-6" />
              </span>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
          <div className={cn("w-full max-w-md", className)}>
            <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] bg-primary-600 text-white shadow-[0_16px_32px_rgba(21,145,108,0.25)]">
                  <Leaf className="h-5 w-5" />
                </div>
                <Logo size="lg" href="/" />
              </div>
              <Link href="/" className="text-sm font-black text-primary-700">
                Home
              </Link>
            </div>

            <div className="rounded-[2rem] border border-primary-100/80 bg-white/92 p-5 shadow-[0_26px_70px_rgba(22,48,42,0.12)] backdrop-blur sm:p-7">
              <div className="mb-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-600">
                  FuelWell
                </p>
                <h2 className="fw-heading mt-2 text-3xl">{title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm font-semibold text-muted-foreground">{footer}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-primary-700 transition hover:text-primary-800"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

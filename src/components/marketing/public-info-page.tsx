import Link from "next/link";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils/cn";

export function PublicInfoPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="fw-app-surface min-h-screen">
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo size="md" href="/" />
          <Link
            href="/login"
            className="fw-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary-50 px-4 py-2 text-sm font-black text-primary-800 ring-1 ring-inset ring-primary-100 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
          >
            Sign in
            <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-primary-800 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-600"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          FuelWell home
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-50 ring-1 ring-inset ring-primary-100">
              <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
            </span>
            {eyebrow}
          </div>
          <h1 className="fw-heading mt-5 text-3xl leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-ink-muted sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>

        <article className="mt-10 border-y border-hairline bg-surface/70 px-4 sm:px-6">
          {children}
        </article>
      </main>

      <footer className="border-t border-hairline bg-surface/60">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-7 text-sm font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} FuelWell</p>
          <nav aria-label="Legal and support" className="flex flex-wrap gap-x-5 gap-y-3">
            <Link className="min-h-11 content-center hover:text-primary-800" href="/privacy">
              Privacy
            </Link>
            <Link className="min-h-11 content-center hover:text-primary-800" href="/support">
              Support
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PublicInfoSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-b border-hairline py-7 last:border-b-0 sm:py-9", className)}>
      <h2 className="text-xl font-black text-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm font-semibold leading-7 text-ink-muted sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}

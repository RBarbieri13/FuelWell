"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Leaf, Sparkles, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { isPreviewHost } from "@/lib/preview-session";
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
  // Preview jargon stays off the production front door: the card only renders
  // once the client confirms a genuine preview context (same isPreviewHost
  // signal the app shell uses — localhost or FUELWELL_PREVIEW_MODE deploys).
  // Server snapshot is false so production HTML never contains the card.
  const showPreviewCard = useSyncExternalStore(
    subscribeNever,
    () => isPreviewHost(window.location.host),
    () => false
  );

  return (
    // dvh, not vh: on iOS Safari a 100vh column is taller than the visible
    // viewport while the browser chrome is up, which pushed the submit button
    // of every auth form under the fold on first paint.
    <main className="fw-app-surface min-h-dvh">
      <div className="grid min-h-dvh lg:grid-cols-[0.88fr_1fr]">
        <aside className="fw-dark-panel relative hidden overflow-hidden rounded-none border-0 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <Logo href="/" size="lg" tone="inverse" />
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-black text-white/80 transition-colors duration-150 hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
            >
              Home
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary-100 ring-1 ring-inset ring-white/15">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
              Daily decision system
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-white xl:text-6xl">
              {panelTitle}
            </h1>
            <p className="mt-5 max-w-lg text-base font-semibold leading-7 text-white/75">
              {panelCopy}
            </p>
          </div>

          {/* A list of parallel claims is a list — announcing "3 items" is
              worth more here than three anonymous divs. */}
          <ul className="relative z-10 grid gap-2.5">
            {features.map((feature) => (
              <li
                key={feature.text}
                className="flex items-center gap-3 rounded-[1.25rem] bg-white/[0.075] p-3 ring-1 ring-inset ring-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-primary-300 text-primary-950">
                  <feature.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="min-w-0 text-sm font-bold leading-6 text-white/85">
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          {showPreviewCard && (
            <div className="relative z-10 rounded-[1.75rem] bg-white/[0.08] p-5 ring-1 ring-inset ring-white/10">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-100">
                    Preview mode
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    Setup takes a few minutes
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-primary-400 text-primary-950">
                  <BadgeCheck className="h-6 w-6" strokeWidth={2} />
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* The notch owns the top-left corner in landscape, and the home
            indicator the bottom edge; the card must clear both. */}
        <section className="flex min-h-dvh items-center justify-center pb-[max(env(safe-area-inset-bottom),2rem)] pl-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)] pt-[max(env(safe-area-inset-top),2rem)] sm:pl-8 sm:pr-8 lg:py-12">
          <div className={cn("w-full max-w-md", className)}>
            <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-primary-500 to-teal-600 text-white shadow-e2">
                  <Leaf className="h-5 w-5" strokeWidth={2} />
                </span>
                <Logo size="sm" href="/" />
              </div>
              <Link
                href="/"
                className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2 text-sm font-black text-primary-700 transition-colors hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Home
              </Link>
            </div>

            <div className="fw-lift-edge rounded-[2rem] border border-hairline-strong bg-surface/95 p-5 backdrop-blur sm:p-7">
              <div className="mb-6">
                <p className="text-[0.6875rem] font-black uppercase tracking-[0.16em] text-primary-700">
                  FuelWell
                </p>
                <h2 className="fw-heading mt-2 text-2xl">{title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
                  {subtitle}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-5 block h-px w-full bg-gradient-to-r from-primary-200 via-hairline to-transparent"
                />
              </div>
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm font-semibold text-ink-muted">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// The preview-host signal never changes within a page lifetime.
function subscribeNever() {
  return () => {};
}

/**
 * Shared field refinement for the three auth forms. The Input primitive owns
 * the ring; this adds the parts it deliberately leaves to the caller — a 48px
 * touch height, a calm hover edge, and a lift to the raised surface on focus
 * so the active field separates from the card behind it.
 */
export const authFieldClass =
  "min-h-12 hover:border-primary-200 focus:bg-surface focus:shadow-e1";

/**
 * Two hairlines fading into a centred kicker. Lives here rather than being
 * pasted per page so the login and signup forms cannot drift apart by a
 * tracking step. `hidden` keeps the caller from having to re-declare the
 * layout classes just to hide it.
 */
export function AuthDivider({
  label,
  hidden = false,
}: {
  label: string;
  hidden?: boolean;
}) {
  return (
    <div
      className={cn("items-center gap-3", hidden ? "hidden" : "flex")}
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline-strong" />
      <span className="text-[0.6875rem] font-black uppercase tracking-[0.16em] text-ink-subtle">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline-strong" />
    </div>
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
      className="group -mx-1 -my-2.5 inline-flex min-h-11 items-center gap-1 rounded-full px-1 py-2.5 font-black text-primary-700 underline-offset-4 transition-colors hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
    >
      {children}
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5"
        strokeWidth={2.5}
      />
    </Link>
  );
}

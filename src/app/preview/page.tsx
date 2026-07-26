import Link from "next/link";
import { version } from "../../../package.json";
import { getLaunchPreflight } from "@/lib/launch-preflight";
import { RouteHealthConsole } from "@/components/preview/route-health-console";
import { cn } from "@/lib/utils/cn";
import {
  ArrowUpRight,
  Gauge,
  Monitor,
  Smartphone,
  TabletSmartphone,
  UserPlus,
} from "lucide-react";

const previewLinks = [
  { label: "Preflight", href: "/app/launch-preflight" },
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Nutrition", href: "/app/nutrition" },
  { label: "Fitness", href: "/app/fitness" },
  { label: "Daily review", href: "/app/daily-review" },
  { label: "Coach", href: "/app/coach" },
  { label: "Uploads", href: "/app/coach/attachments" },
  { label: "Menu review", href: "/app/coach/menu-review" },
  { label: "Log meal", href: "/app/log" },
  { label: "Recipes", href: "/app/recipes" },
  { label: "Workouts", href: "/app/workouts" },
  { label: "Groceries", href: "/app/grocery-list" },
  { label: "Recovery", href: "/app/recovery" },
  { label: "Progress", href: "/app/progress" },
];

const APP_VERSION = version;

// Shared chip shape: 44px on touch, tightened once a pointer is available.
const previewChip =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3 text-xs font-black text-white ring-1 ring-inset ring-white/15 transition-colors duration-150 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 md:min-h-8";

// Shared shape for the clickable deck panels, so hover/press/focus never
// drift between them.
const previewPanel =
  "group rounded-[1.5rem] bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 transition-colors duration-150 hover:bg-white/[0.1] hover:ring-primary-300/40 active:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300";

const previewFrame =
  "flex min-h-[680px] flex-col overflow-hidden rounded-[2rem] bg-neutral-900 shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/10";

export default function PreviewHubPage() {
  const preflight = getLaunchPreflight();

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-dvh max-w-[1800px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 rounded-[2rem] bg-white/[0.06] px-5 py-4 shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/10 backdrop-blur md:flex-row md:items-start">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-200 ring-1 ring-inset ring-primary-300/25">
              <TabletSmartphone className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              FuelWell live preview
            </span>
            <h1 className="text-2xl font-black tracking-tight md:text-4xl">
              Web app and iOS simulator review deck
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-300 md:text-base">
              One shared preview platform for Max and Robert. Use the
              established-user deck below, or open the new-user deck to test
              signup and intake from a clean first-run state.
            </p>
            <p className="mt-3 flex max-w-3xl items-start gap-2 rounded-2xl bg-accent-300/10 px-3 py-2 text-xs font-bold leading-5 text-accent-200 ring-1 ring-inset ring-accent-300/25">
              <span className="shrink-0 font-black tabular-nums">v{APP_VERSION}</span>
              <span className="min-w-0">
                New in v{APP_VERSION}: Daily nutrition + fitness detail, expanded intake,
                workout previews, grocery history, and richer review cards.
              </span>
            </p>
          </div>
          <nav aria-label="Preview shortcuts" className="flex flex-wrap gap-1.5 md:max-w-md md:justify-end">
            {previewLinks.map((link) => (
              <Link key={link.href} href={link.href} className={previewChip}>
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {/* Non-navigating card: tinted plate, no hover affordance, because
              there is nothing here to click. */}
          <article className="rounded-[1.5rem] bg-primary-300/10 p-4 ring-1 ring-inset ring-primary-300/25">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-300 text-neutral-950">
                <Gauge className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black">1. Existing user preview</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-300">
                  Opens the current sample account with logged meals, coach
                  history, workouts, groceries, progress, and settings.
                </p>
              </div>
            </div>
          </article>

          <Link href="/preview/new-user" className={previewPanel}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-950 transition-colors group-hover:bg-primary-100">
                <UserPlus className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-black">2. New user signup + intake</h2>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-primary-200 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-300">
                  Starts at account creation, then walks through the full
                  onboarding questionnaire and target preview.
                </p>
              </div>
            </div>
          </Link>
        </section>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <Link href="/app/launch-preflight" className={previewPanel}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-neutral-950 transition-colors group-hover:bg-primary-100">
                <Gauge className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                  <h2 className="text-base font-black">Launch preflight</h2>
                  {/* Status must not read the same in both states. */}
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ring-inset",
                      preflight.previewReady
                        ? "bg-primary-300/15 text-primary-200 ring-primary-300/30"
                        : "bg-accent-300/15 text-accent-200 ring-accent-300/30"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        preflight.previewReady ? "bg-primary-300" : "bg-accent-300"
                      )}
                    />
                    {preflight.previewReady ? "Preview ready" : "Needs review"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-neutral-300">
                  AI, database, RLS, route health, and storage readiness without exposing secrets.
                </p>
              </div>
            </div>
          </Link>
          <RouteHealthConsole routeChecks={preflight.routeChecks} />
        </section>

        <section className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <article className={previewFrame}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-300/10 text-primary-200 ring-1 ring-inset ring-primary-300/25">
                  <Monitor className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">Web app preview</h2>
                  <p className="truncate text-xs font-semibold text-neutral-400">
                    Desktop-width product review
                  </p>
                </div>
              </div>
              <Link
                href="/app/dashboard"
                className={cn(previewChip, "hidden bg-white text-neutral-950 ring-white/0 hover:bg-primary-100 sm:inline-flex")}
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              </Link>
            </div>
            <iframe
              title="FuelWell web app preview"
              src="/app/dashboard"
              className="min-h-[620px] flex-1 border-0 bg-background"
            />
          </article>

          <article className={previewFrame}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-300/10 text-accent-200 ring-1 ring-inset ring-accent-300/25">
                  <Smartphone className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">iOS simulator</h2>
                  <p className="truncate text-xs font-semibold tabular-nums text-neutral-400">
                    375 x 812 phone viewport
                  </p>
                </div>
              </div>
              <Link href="/ios-preview" className={previewChip}>
                Focus
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,_rgba(30,174,132,0.18),_transparent_32rem)] p-5">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-primary-400/15 blur-3xl"
                />
                <div className="relative rounded-[3.25rem] bg-neutral-950 p-3 shadow-2xl shadow-black/70 ring-1 ring-inset ring-white/15">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-950"
                  />
                  <div className="overflow-hidden rounded-[2.65rem] bg-background ring-1 ring-inset ring-neutral-800">
                    <iframe
                      title="FuelWell iOS simulator preview"
                      src="/app/dashboard"
                      loading="lazy"
                      className="h-[812px] w-[375px] max-w-full border-0 bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <footer className="flex flex-col justify-between gap-3 rounded-[1.5rem] bg-white/[0.04] px-4 py-3 text-xs font-semibold text-neutral-400 ring-1 ring-inset ring-white/10 md:flex-row md:items-center">
          <span className="min-w-0">
            Preview mode uses sample data and does not write to production user
            accounts.
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-primary-200">
            <Gauge className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            Review route: /preview
          </span>
        </footer>
      </div>
    </main>
  );
}

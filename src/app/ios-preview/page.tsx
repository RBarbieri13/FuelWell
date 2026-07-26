import Link from "next/link";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// 44px targets, one focus treatment, and one press response shared by all
// three CTAs. fw-press supplies the transition, so no separate duration here.
const previewCta =
  "fw-press inline-flex min-h-11 items-center gap-2 rounded-2xl px-5 text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950";

export default function IOSPreviewPage() {
  return (
    // overflow-x, not overflow: the phone frame is a fixed 812px tall, so a
    // blanket overflow-hidden left the bottom of the device unreachable on any
    // laptop-height window.
    <main className="min-h-dvh overflow-x-hidden bg-neutral-950 text-white">
      <div className="mx-auto grid min-h-dvh max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:px-10">
        <section className="flex flex-col justify-center">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-400/15 text-primary-300 ring-1 ring-inset ring-primary-400/25">
            <Smartphone className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary-300">
            FuelWell iOS preview
          </p>
          {/* 6xl is display scale for a marketing hero; this is an internal
              review tool sharing the page with a device frame. */}
          <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight md:text-5xl">
            Review the app like it is on a phone.
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-neutral-300">
            This preview auto-loads a sample user and places the app inside an
            iPhone-sized viewport, so the mobile navigation, dashboard, coach,
            logging, workouts, and progress flows are visible without sign-in.
          </p>
          {/* One primary here; the rest step down to tonal and ghost. */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/preview" className={cn(previewCta, "bg-primary-300 text-primary-950 hover:bg-primary-200")}>
              Open review hub
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <Link
              href="/app/dashboard"
              className={cn(previewCta, "bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/20")}
            >
              Open full browser app
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
            </Link>
            <Link
              href="/app/log"
              className={cn(previewCta, "text-neutral-300 ring-1 ring-inset ring-white/15 hover:bg-white/10 hover:text-white")}
            >
              Jump to meal logging
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="relative max-w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-primary-400/20 blur-3xl"
            />
            <div className="relative max-w-full rounded-[3.25rem] bg-neutral-900 p-3 shadow-2xl shadow-black/60 ring-1 ring-inset ring-white/15">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-950"
              />
              {/* bg-background matches the app's own canvas, so the frame no
                  longer flashes a mismatched grey while the iframe boots. */}
              <div className="max-w-full overflow-hidden rounded-[2.65rem] bg-background ring-1 ring-inset ring-neutral-800">
                <iframe
                  title="FuelWell iOS app preview"
                  src="/app/dashboard"
                  loading="lazy"
                  className="h-[812px] w-[375px] max-w-full border-0 bg-background"
                />
              </div>
            </div>
            {/* States the frame's real dimensions — the same pair the /preview
                deck labels its phone column with, using a proper multiplication
                sign rather than a letter x. */}
            <p className="mt-4 text-center text-xs font-bold tabular-nums text-neutral-400">
              375 × 812 phone viewport
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

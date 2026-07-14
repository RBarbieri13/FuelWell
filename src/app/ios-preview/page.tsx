import Link from "next/link";
import { ArrowUpRight, Smartphone } from "lucide-react";

export default function IOSPreviewPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-neutral-950 text-white">
      <div className="mx-auto grid min-h-dvh max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[0.8fr_1fr] lg:items-center lg:px-10">
        <section className="flex flex-col justify-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-400/15 text-primary-300">
            <Smartphone className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-300">
            FuelWell iOS preview
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight md:text-6xl">
            Review the app like it is on a phone.
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-neutral-300">
            This preview auto-loads a sample user and places the app inside an
            iPhone-sized viewport, so the mobile navigation, dashboard, coach,
            logging, workouts, and progress flows are visible without sign-in.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/preview"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-300 px-5 py-3 text-sm font-black text-neutral-950 transition hover:bg-primary-200"
            >
              Open review hub
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-neutral-950 transition hover:bg-primary-100"
            >
              Open full browser app
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app/log"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
            >
              Jump to meal logging
            </Link>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="relative max-w-full">
            <div className="pointer-events-none absolute -inset-8 rounded-[4rem] bg-primary-400/20 blur-3xl" />
            <div className="relative max-w-full rounded-[3.25rem] border border-white/15 bg-neutral-900 p-3 shadow-2xl shadow-black/60">
              <div className="pointer-events-none absolute left-1/2 top-5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-950" />
              <div className="max-w-full overflow-hidden rounded-[2.65rem] border border-neutral-800 bg-[#f6f7f4]">
                <iframe
                  title="FuelWell iOS app preview"
                  src="/app/dashboard"
                  className="h-[812px] w-[375px] max-w-full bg-[#f6f7f4]"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

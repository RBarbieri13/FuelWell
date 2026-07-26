import Link from "next/link";
import { ArrowUpRight, ClipboardList, Monitor, Smartphone, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Same chip/frame shapes as the /preview deck so the two review decks stay
// visually interchangeable.
const previewChip =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-black transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 md:min-h-8";

const previewFrame =
  "flex min-h-[720px] flex-col overflow-hidden rounded-[2rem] bg-neutral-900 shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/10";

export default function NewUserPreviewPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-dvh max-w-[1800px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 rounded-[2rem] bg-white/[0.06] px-5 py-4 shadow-2xl shadow-black/30 ring-1 ring-inset ring-white/10 backdrop-blur md:flex-row md:items-start">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-200 ring-1 ring-inset ring-primary-300/25">
              <UserPlus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
              FuelWell new user preview
            </span>
            <h1 className="text-2xl font-black tracking-tight md:text-4xl">
              Signup and intake review deck
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-300 md:text-base">
              This version starts like a brand-new FuelWell user: create a
              preview account, answer the intake questions, review the generated
              plan, and land in the app without creating a real production user.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            <Link
              href="/preview"
              className={cn(previewChip, "bg-white/10 text-white ring-1 ring-inset ring-white/15 hover:bg-white/20")}
            >
              Existing user deck
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            </Link>
            <Link
              href="/signup?preview=new-user"
              className={cn(previewChip, "bg-white text-neutral-950 hover:bg-primary-100")}
            >
              Open signup
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            </Link>
          </div>
        </header>

        {/* Ordered because the three panels are sequential steps, not a set of
            peers — the numerals were carrying that alone. */}
        <ol className="grid gap-3 md:grid-cols-3">
          {[
            ["1", "Create preview account", "A fake local account path avoids email, OAuth, and production writes."],
            ["2", "Answer intake questions", "Body context, goal pace, nutrition style, food habits, workouts, check-ins, and coach tone."],
            ["3", "Review generated plan", "Calories and macros are calculated before entering the dashboard."],
          ].map(([number, title, body], index, steps) => (
            <li
              key={number}
              className="relative rounded-[1.5rem] bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10"
            >
              {/* Connector reads the three cards as one sequence on wide
                  layouts; hidden once they stack. */}
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-[-0.75rem] top-8 hidden h-px w-3 bg-white/15 md:block"
                />
              )}
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-300 text-sm font-black tabular-nums text-neutral-950">
                  {number}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-black">{title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-neutral-400">
                    {body}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <article className={previewFrame}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-300/10 text-primary-200 ring-1 ring-inset ring-primary-300/25">
                  <Monitor className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">Desktop signup + intake</h2>
                  <p className="truncate text-xs font-semibold text-neutral-400">
                    Full-width first-run experience
                  </p>
                </div>
              </div>
              <Link
                href="/signup?preview=new-user"
                className={cn(previewChip, "hidden bg-white text-neutral-950 hover:bg-primary-100 sm:inline-flex")}
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              </Link>
            </div>
            <iframe
              title="FuelWell new user desktop preview"
              src="/signup?preview=new-user"
              className="min-h-[660px] flex-1 border-0 bg-background"
            />
          </article>

          <article className={previewFrame}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-300/10 text-accent-200 ring-1 ring-inset ring-accent-300/25">
                  <Smartphone className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">Phone signup + intake</h2>
                  <p className="truncate text-xs font-semibold tabular-nums text-neutral-400">
                    375 x 812 first-run viewport
                  </p>
                </div>
              </div>
              {/* Static label, not a control — no hover or pointer affordance. */}
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white ring-1 ring-inset ring-white/15">
                <ClipboardList className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
                Intake
              </span>
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
                      title="FuelWell new user phone preview"
                      src="/signup?preview=new-user"
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
            New-user preview uses local browser storage only and does not write
            to production user accounts.
          </span>
          <span className="inline-flex shrink-0 items-center gap-2 text-primary-200">
            <UserPlus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            Review route: /preview/new-user
          </span>
        </footer>
      </div>
    </main>
  );
}

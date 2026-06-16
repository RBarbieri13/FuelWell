import Link from "next/link";
import { ArrowUpRight, ClipboardList, Monitor, Smartphone, UserPlus } from "lucide-react";

export default function NewUserPreviewPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-dvh max-w-[1800px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-300/20 bg-primary-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary-200">
              <UserPlus className="h-3.5 w-3.5" />
              FuelWell new user preview
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-4xl">
              Signup and intake review deck
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-neutral-300 md:text-base">
              This version starts like a brand-new FuelWell user: create a
              preview account, answer the intake questions, review the generated
              plan, and land in the app without creating a real production user.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/preview"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              Existing user deck
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/signup?preview=new-user"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-neutral-950 transition hover:bg-primary-100"
            >
              Open signup
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            ["1", "Create preview account", "A fake local account path avoids email, OAuth, and production writes."],
            ["2", "Answer intake questions", "Name, birthday, body context, activity, goal, diet, and allergies."],
            ["3", "Review generated plan", "Calories and macros are calculated before entering the dashboard."],
          ].map(([number, title, body]) => (
            <article
              key={number}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary-300 text-sm font-black text-neutral-950">
                  {number}
                </span>
                <div>
                  <h2 className="text-sm font-black">{title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-neutral-400">
                    {body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
          <article className="flex min-h-[720px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-300/10 text-primary-200">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black">Desktop signup + intake</h2>
                  <p className="text-xs font-semibold text-neutral-400">
                    Full-width first-run experience
                  </p>
                </div>
              </div>
              <Link
                href="/signup?preview=new-user"
                className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-neutral-950 transition hover:bg-primary-100 sm:inline-flex"
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <iframe
              title="FuelWell new user desktop preview"
              src="/signup?preview=new-user"
              className="min-h-[660px] flex-1 border-0 bg-[#f6f7f4]"
            />
          </article>

          <article className="flex min-h-[720px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-300/10 text-accent-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black">Phone signup + intake</h2>
                  <p className="text-xs font-semibold text-neutral-400">
                    375 x 812 first-run viewport
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-white">
                <ClipboardList className="h-3.5 w-3.5" />
                Intake
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.18),_transparent_32rem)] p-5">
              <div className="relative">
                <div className="absolute -inset-8 rounded-[4rem] bg-primary-400/15 blur-3xl" />
                <div className="relative rounded-[3.25rem] border border-white/15 bg-neutral-950 p-3 shadow-2xl shadow-black/70">
                  <div className="pointer-events-none absolute left-1/2 top-5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-950" />
                  <div className="overflow-hidden rounded-[2.65rem] border border-neutral-800 bg-[#f6f7f4]">
                    <iframe
                      title="FuelWell new user phone preview"
                      src="/signup?preview=new-user"
                      className="h-[812px] w-[375px] border-0 bg-[#f6f7f4]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <footer className="flex flex-col justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-neutral-400 md:flex-row md:items-center">
          <span>
            New-user preview uses local browser storage only and does not write
            to production user accounts.
          </span>
          <span className="inline-flex items-center gap-2 text-primary-200">
            <UserPlus className="h-3.5 w-3.5" />
            Review route: /preview/new-user
          </span>
        </footer>
      </div>
    </main>
  );
}

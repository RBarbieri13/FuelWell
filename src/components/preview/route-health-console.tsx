"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Radar, RotateCw, XCircle } from "lucide-react";
import type { LaunchPreflight } from "@/lib/launch-preflight";
import { cn } from "@/lib/utils/cn";

type RouteResult = {
  path: string;
  state: "checking" | "pass" | "fail";
  status?: number;
};

export function RouteHealthConsole({
  routeChecks,
}: {
  routeChecks: LaunchPreflight["routeChecks"];
}) {
  const [nonce, setNonce] = useState(0);
  const [results, setResults] = useState<RouteResult[]>(
    routeChecks.map((route) => ({ path: route.path, state: "checking" }))
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const next = await Promise.all(
        routeChecks.map(async (route) => {
          try {
            const response = await fetch(route.path, {
              method: "GET",
              cache: "no-store",
            });
            return {
              path: route.path,
              status: response.status,
              state: response.ok ? "pass" : "fail",
            } satisfies RouteResult;
          } catch {
            return {
              path: route.path,
              state: "fail",
            } satisfies RouteResult;
          }
        })
      );
      if (!cancelled) setResults(next);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [nonce, routeChecks]);

  const resultByPath = new Map(results.map((result) => [result.path, result]));

  const total = routeChecks.length;
  const passCount = results.filter((result) => result.state === "pass").length;
  const failCount = results.filter((result) => result.state === "fail").length;
  const checkingCount = Math.max(total - passCount - failCount, 0);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-black text-white">Route health</h2>
          <p className="mt-1 text-sm font-semibold text-neutral-400">
            Browser checks for the review routes Max is most likely to open.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setResults(routeChecks.map((route) => ({ path: route.path, state: "checking" })));
            setNonce((value) => value + 1);
          }}
          disabled={total === 0}
          // 44px on touch like every other control on the deck; it was a 30px
          // target before. Focus offset against the near-black panel.
          className="fw-press inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-xs font-black text-white hover:bg-white/20 active:bg-white/25 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 md:min-h-9"
        >
          <RotateCw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Retry
        </button>
      </div>

      {total === 0 ? (
        // An empty grid under a "Route health" heading reads as a broken
        // widget. There is nothing to fake here, so say so plainly.
        <div className="mt-4 flex flex-col items-center rounded-[1.25rem] border border-dashed border-white/15 px-4 py-10 text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-neutral-400 ring-1 ring-inset ring-white/10">
            <Radar className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="text-sm font-black text-white">No routes registered</p>
          <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-neutral-400">
            The preflight returned an empty route list, so there is nothing to
            check from the browser yet.
          </p>
        </div>
      ) : (
        <>
          {/* Proportional bar over the same three counts the chips below
              carry — every segment is measured, none is decorative, and the
              caption states the scale the bar is drawn against. */}
          <div className="mt-4">
            <p
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs font-bold"
              aria-live="polite"
            >
              <span className="tabular-nums text-white">
                {passCount} of {total} responding
              </span>
              <span className="tabular-nums text-neutral-400">
                {failCount > 0 && (
                  <span className="text-accent-200">{failCount} failing</span>
                )}
                {failCount > 0 && checkingCount > 0 && " · "}
                {checkingCount > 0 && `${checkingCount} checking`}
                {failCount === 0 && checkingCount === 0 && "all clear"}
              </span>
            </p>
            <span
              role="img"
              aria-label={`${passCount} of ${total} routes responding, ${failCount} failing, ${checkingCount} still checking.`}
              className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-white/10"
            >
              <span
                className="h-full bg-primary-300 transition-[width] duration-500 ease-out-soft"
                style={{ width: `${(passCount / total) * 100}%` }}
              />
              <span
                className="h-full bg-accent-300 transition-[width] duration-500 ease-out-soft"
                style={{ width: `${(failCount / total) * 100}%` }}
              />
            </span>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {routeChecks.map((route) => {
              const result = resultByPath.get(route.path);
              const state = result?.state ?? "checking";
              const Icon = state === "pass" ? CheckCircle2 : state === "fail" ? XCircle : Loader2;

              return (
                <a
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "fw-press flex min-h-11 items-center justify-between gap-3 rounded-[1rem] border bg-neutral-950/40 px-3 py-3 text-left hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                    // A failing route is the one thing on this panel worth
                    // finding at a glance, so it carries the state on its own
                    // edge rather than only in the trailing chip.
                    state === "fail"
                      ? "border-accent-300/40 hover:border-accent-300/60"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">
                      {route.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-neutral-400">
                      {route.path}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black tabular-nums ring-1 ring-inset",
                      state === "pass" && "bg-primary-300/15 text-primary-200 ring-primary-300/25",
                      state === "fail" && "bg-accent-300/15 text-accent-200 ring-accent-300/30",
                      state === "checking" && "bg-white/10 text-neutral-300 ring-white/15"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        state === "checking" && "animate-spin"
                      )}
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    {state === "checking" ? "Checking" : result?.status ?? "Failed"}
                  </span>
                </a>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

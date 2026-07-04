"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCw, XCircle } from "lucide-react";
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

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
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
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Retry
        </button>
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
              className="flex items-center justify-between gap-3 rounded-[1rem] border border-white/10 bg-neutral-950/40 px-3 py-3 text-left transition hover:bg-neutral-900"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-white">
                  {route.label}
                </span>
                <span className="mt-0.5 block truncate text-xs font-semibold text-neutral-500">
                  {route.path}
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black",
                  state === "pass" && "bg-primary-300/15 text-primary-200",
                  state === "fail" && "bg-accent-300/15 text-accent-200",
                  state === "checking" && "bg-white/10 text-neutral-300"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", state === "checking" && "animate-spin")} />
                {state === "checking" ? "Checking" : result?.status ?? "Failed"}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

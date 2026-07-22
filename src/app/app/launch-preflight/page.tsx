import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  Gauge,
  LockKeyhole,
  Route,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLaunchPreflight, type PreflightCheck, type PreflightState } from "@/lib/launch-preflight";
import { isPreviewHost } from "@/lib/preview-session";
import { cn } from "@/lib/utils/cn";

const stateConfig: Record<
  PreflightState,
  { label: string; icon: LucideIcon; badge: string; card: string }
> = {
  pass: {
    label: "Ready",
    icon: CheckCircle2,
    badge: "bg-primary-100 text-primary-700",
    card: "border-primary-100 bg-white",
  },
  warn: {
    label: "Staged",
    icon: AlertTriangle,
    badge: "bg-lemon-100 text-lemon-700",
    card: "border-lemon-200 bg-lemon-50/35",
  },
  fail: {
    label: "Needs setup",
    icon: XCircle,
    badge: "bg-accent-100 text-accent-700",
    card: "border-accent-100 bg-accent-50/35",
  },
};

function CheckCard({ check }: { check: PreflightCheck }) {
  const config = stateConfig[check.state];
  const Icon = config.icon;

  return (
    <Card className={cn("rounded-[1.35rem] px-5 py-5 shadow-[0_10px_26px_rgba(20,90,75,0.05)]", config.card)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black", config.badge)}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </span>
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
          {check.requiredForProduction ? "Production gate" : check.requiredForPreview ? "Preview gate" : "Review note"}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-black text-[#16302a]">{check.label}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#54635d]">{check.detail}</p>
    </Card>
  );
}

export default async function LaunchPreflightPage() {
  // Internal release tooling: only preview contexts (localhost or deployments
  // that opt in with FUELWELL_PREVIEW_MODE) may render it; production users 404.
  const host = (await headers()).get("host");
  if (!isPreviewHost(host)) notFound();

  const preflight = getLaunchPreflight();
  const productionFailures = preflight.checks.filter(
    (check) => check.requiredForProduction && check.state !== "pass"
  );

  return (
    <div className="fw-app-surface">
      <header className="fw-page-header">
        <div className="fw-page-inner flex flex-col gap-4 py-5 md:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary-600">
              <Gauge className="h-4 w-4" />
              Launch preflight
            </p>
            <h1 className="fw-heading mt-2 text-2xl md:text-4xl">
              Review readiness before Max opens the build
            </h1>
            <p className="fw-muted mt-1 max-w-3xl text-base">
              Checks AI interpretation, preview routing, database environment, and per-user isolation evidence without exposing secrets.
            </p>
          </div>
          <Link href="/preview">
            <Button size="lg" className="rounded-full px-6">
              Open preview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="fw-page-inner space-y-4 md:space-y-6 pb-28 md:pb-8">
        <section className="grid gap-3 lg:grid-cols-3">
          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <Eye className="h-5 w-5 text-primary-600" />
            <p className="mt-3 text-2xl font-black text-[#16302a] md:text-3xl">
              {preflight.previewReady ? "Ready" : "Review"}
            </p>
            <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-muted-foreground">
              Preview status
            </p>
          </Card>
          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <ShieldCheck className="h-5 w-5 text-primary-600" />
            <p className="mt-3 text-2xl font-black text-[#16302a] md:text-3xl">
              {preflight.productionReady ? "Ready" : "Blocked"}
            </p>
            <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-muted-foreground">
              Production status
            </p>
          </Card>
          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <Database className="h-5 w-5 text-primary-600" />
            <p className="mt-3 text-2xl font-black text-[#16302a] md:text-3xl">
              v{preflight.version}
            </p>
            <p className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-muted-foreground">
              App build
            </p>
          </Card>
        </section>

        {!preflight.productionReady && (
          <Card className="rounded-[1.5rem] border-lemon-200 bg-lemon-50/80 px-6 py-5 shadow-none">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-lemon-700" />
              <div>
                <h2 className="text-lg font-black text-lemon-800">Production launch is intentionally blocked</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-lemon-800/80">
                  {productionFailures.length} production gate{productionFailures.length === 1 ? " still needs" : "s still need"} proof or setup. Preview review can continue if preview gates are green.
                </p>
              </div>
            </div>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {preflight.checks.map((check) => (
            <CheckCard key={check.id} check={check} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary-100 text-primary-700">
                <Route className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-[#16302a]">Routes included in review health</h2>
                <p className="mt-1 text-sm font-semibold text-[#6e8981]">
                  These are checked from the preview hub and can be opened directly here.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {preflight.routeChecks.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#f4f8f6] px-4 py-3 text-sm font-black text-muted-foreground transition hover:bg-primary-50 hover:text-primary-700"
                >
                  <span>{route.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="rounded-[1.5rem] px-6 py-6 shadow-[0_12px_30px_rgba(20,90,75,0.07)]">
            <LockKeyhole className="h-5 w-5 text-primary-600" />
            <h2 className="mt-4 text-2xl font-black text-[#16302a]">Data isolation proof</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6e8981]">
              Repo evidence currently covers Supabase RLS for profiles, meals, Coach conversations, audit rows, and Coach memory. Durable uploaded artifact history remains staged until a user-scoped object store is added.
            </p>
            <Link
              href="/api/launch-preflight"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-black text-primary-700 transition hover:bg-primary-100"
            >
              View safe JSON
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </section>
      </main>
    </div>
  );
}

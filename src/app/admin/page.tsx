import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SignupsTable, type SignupRow } from "./signups-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin — Signups",
  robots: { index: false, follow: false },
};

type Founders100Row = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  source: string | null;
  tier: string;
  billing_period: string;
};

type MarketingSignupRow = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  source: string;
};

type SubscriptionValidationRow = {
  id: string;
  validated_at: string;
  user_id: string;
  provider: string;
  product_id: string;
  environment: string;
  entitlement_tier: string;
  provider_customer_id: string | null;
  provider_event_id: string | null;
};

async function queryFounders(): Promise<Founders100Row[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("founders_100")
    .select("id, created_at, email, name, source, tier, billing_period")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Founders100Row[];
}

async function queryLeads(): Promise<MarketingSignupRow[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("marketing_signups")
    .select("id, created_at, email, name, source")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as MarketingSignupRow[];
}

async function queryValidationEvents(): Promise<SubscriptionValidationRow[]> {
  const client = getSupabaseAdmin();
  const { data, error } = await client
    .from("subscription_validation_events")
    .select(
      [
        "id",
        "validated_at",
        "user_id",
        "provider",
        "product_id",
        "environment",
        "entitlement_tier",
        "provider_customer_id",
        "provider_event_id",
      ].join(", "),
    )
    .order("validated_at", { ascending: false })
    .limit(25);

  if (error) throw error;
  return (data ?? []) as unknown as SubscriptionValidationRow[];
}

async function loadData(): Promise<{
  founders: SignupRow[];
  leads: SignupRow[];
  validationEvents: SubscriptionValidationRow[];
  error: string | null;
}> {
  try {
    const [founderRows, leadRows, validationEvents] = await Promise.all([
      queryFounders(),
      queryLeads(),
      queryValidationEvents(),
    ]);

    const founders: SignupRow[] = founderRows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      email: r.email,
      name: r.name,
      source: r.source ?? "founders-100",
    }));

    const leads: SignupRow[] = leadRows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      email: r.email,
      name: r.name,
      source: r.source,
    }));

    return { founders, leads, validationEvents, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error loading data";
    return { founders: [], leads: [], validationEvents: [], error: message };
  }
}

export default async function AdminDashboardPage() {
  const { founders, leads, validationEvents, error } = await loadData();

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">FuelWell Admin</h1>
          <p className="text-sm text-muted-foreground">
            Live signup activity. Auto-refreshes on page reload.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">Failed to load data</p>
            <p className="mt-1 font-mono text-xs">{error}</p>
            <p className="mt-2">
              Make sure <code>SUPABASE_SERVICE_ROLE_KEY</code> is set in your environment.
            </p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Founders 100" value={founders.length} accent="violet" />
          <StatCard label="Total Leads" value={leads.length} accent="orange" />
          <StatCard
            label="Validation Events"
            value={validationEvents.length}
            accent="emerald"
          />
        </section>

        <SubscriptionValidationTable rows={validationEvents} />

        <SignupsTable
          title="All Leads"
          description="Every website signup captured for later account linkage."
          rows={leads}
          filename="fuelwell-leads.csv"
        />

        <SignupsTable
          title="Founders 100"
          description="People who signed up from the Founders 100 page."
          rows={founders}
          filename="founders-100.csv"
        />
      </div>
    </main>
  );
}

function SubscriptionValidationTable({
  rows,
}: {
  rows: SubscriptionValidationRow[];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">
          Subscription Validation{" "}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({rows.length})
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest server-recorded RevenueCat, Stripe, or manual entitlement events.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Validated</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Provider Event</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No subscription validation events yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {new Date(row.validated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {row.provider.replace("_", " ")}
                    <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {row.environment}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.entitlement_tier}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.product_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.user_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.provider_event_id ?? row.provider_customer_id ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "violet" | "emerald" | "orange";
}) {
  const colors = {
    violet: "border-violet-200 bg-violet-50 text-violet-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    orange: "border-orange-200 bg-orange-50 text-orange-900",
  } as const;

  return (
    <div className={`rounded-xl border p-6 ${colors[accent]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

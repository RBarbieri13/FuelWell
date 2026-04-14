import { getSupabase } from "@/lib/supabase";
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
  tier: string;
  billing_period: string;
};

async function queryFounders(
  client: ReturnType<typeof getSupabase>,
): Promise<Founders100Row[]> {
  const { data, error } = await client
    .from("founders_100")
    .select("id, created_at, email, name, tier, billing_period")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Founders100Row[];
}

async function loadData(): Promise<{
  founders: SignupRow[];
  error: string | null;
}> {
  try {
    let rows: Founders100Row[];

    // Try service role key first, fall back to anon key
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
      rows = await queryFounders(getSupabaseAdmin());
    } catch {
      rows = await queryFounders(getSupabase());
    }

    const founders: SignupRow[] = rows.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      email: r.email,
      name: r.name,
      source: "founders-100",
    }));

    return { founders, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error loading data";
    return { founders: [], error: message };
  }
}

export default async function AdminDashboardPage() {
  const { founders, error } = await loadData();

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
          <StatCard label="Total Leads" value={founders.length} accent="orange" />
        </section>

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

"use client";

export type SignupRow = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  tier: string | null;
  billing_period: string | null;
  source: string;
};

export function SignupsTable({
  title,
  description,
  rows,
  filename,
}: {
  title: string;
  description: string;
  rows: SignupRow[];
  filename: string;
}) {
  function downloadCsv() {
    const headers = ["Date", "Name", "Email", "Tier", "Billing Period", "Source"];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...rows.map((r) =>
        [
          new Date(r.created_at).toISOString(),
          r.name ?? "",
          r.email,
          r.tier ?? "",
          r.billing_period ?? "",
          r.source,
        ]
          .map(escape)
          .join(",")
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {title}{" "}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({rows.length})
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={rows.length === 0}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Billing</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  No signups yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{r.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-3 capitalize">{r.tier ?? "—"}</td>
                  <td className="px-4 py-3">{r.billing_period ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { headers } from "next/headers";
import { isPreviewHost, SAMPLE_USER } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import { getRecentAudit } from "@/lib/coach/audit";

/** E6: the user's own Coach tool-call activity, shown under Settings. */
export async function GET() {
  const host = (await headers()).get("host");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isPreview = !user && isPreviewHost(host);
  if (!user && !isPreview) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }

  if (user) {
    const { data } = await supabase
      .from("coach_audit")
      .select("tool, result_summary, ts")
      .eq("user_id", user.id)
      .order("ts", { ascending: false })
      .limit(50);
    return Response.json({
      rows: (data ?? []).map((r) => ({ tool: r.tool, summary: r.result_summary, ts: r.ts })),
    });
  }

  return Response.json({
    rows: getRecentAudit(SAMPLE_USER.id)
      .slice()
      .reverse()
      .map((r) => ({ tool: r.tool, summary: r.resultSummary, ts: r.ts })),
  });
}

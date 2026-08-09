import { timingSafeEqual } from "node:crypto";
import { getLaunchPreflight } from "@/lib/launch-preflight";
import { getLiveLaunchPreflight } from "@/lib/live-launch-preflight";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";

function matchesInternalSecret(provided: string | null, expected: string | undefined): boolean {
  if (!provided || !expected) return false;
  const left = Buffer.from(provided.trim(), "utf8");
  const right = Buffer.from(expected.trim(), "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function canAccessLiveLaunchPreflight(request: Request): Promise<boolean> {
  if (matchesInternalSecret(
    request.headers.get("x-launch-preflight-secret"),
    process.env.LAUNCH_PREFLIGHT_LIVE_SECRET,
  )) {
    return true;
  }

  if (!hasSupabaseConfig()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

export async function GET(request: Request) {
  const preflight = getLaunchPreflight();
  const wantsLive = new URL(request.url).searchParams.get("live") === "1";
  if (!wantsLive) {
    return Response.json(preflight, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!(await canAccessLiveLaunchPreflight(request))) {
    return Response.json(
      { error: "Live launch preflight requires authentication or an internal release secret." },
      {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const live = await getLiveLaunchPreflight();
  return Response.json(live ? { ...preflight, ...live } : preflight, {
    headers: { "Cache-Control": "no-store" },
  });
}

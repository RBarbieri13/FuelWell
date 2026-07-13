import { getLaunchPreflight } from "@/lib/launch-preflight";
import { getLiveLaunchPreflight } from "@/lib/live-launch-preflight";

export async function GET(request: Request) {
  const preflight = getLaunchPreflight();
  const live = new URL(request.url).searchParams.get("live") === "1"
    ? await getLiveLaunchPreflight()
    : null;
  return Response.json(live ? { ...preflight, ...live } : preflight, {
    headers: { "Cache-Control": "no-store" },
  });
}

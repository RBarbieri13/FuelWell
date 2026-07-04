import { getLaunchPreflight } from "@/lib/launch-preflight";

export function GET() {
  return Response.json(getLaunchPreflight());
}

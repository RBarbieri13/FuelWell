import { getProviderHealth } from "@/lib/coach/provider-health";

export async function GET() {
  return Response.json(getProviderHealth(), {
    headers: { "Cache-Control": "no-store" },
  });
}

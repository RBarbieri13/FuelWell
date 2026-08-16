import type { Metadata } from "next";
import { Founders100Content } from "./founders-100-content";
import { getSupabaseMarketingClient } from "@/lib/supabase-marketing";

export const metadata: Metadata = {
  title: "Founders 100",
  description:
    "Become one of the first 100 members shaping FuelWell. Lifetime pricing, early access, and direct feedback with the founders.",
};

export const dynamic = "force-dynamic";

async function getSpotsClaimed(): Promise<number> {
  let supabase: ReturnType<typeof getSupabaseMarketingClient>;
  try {
    supabase = getSupabaseMarketingClient();
  } catch {
    console.warn("Supabase marketing env vars missing — falling back to 0 spots claimed.");
    return 0;
  }

  const { count, error } = await supabase
    .from("founders_100")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to fetch founders_100 count:", error);
    return 0;
  }

  return count ?? 0;
}

export default async function Founders100Page() {
  const spotsClaimed = await getSpotsClaimed();
  return <Founders100Content spotsClaimed={spotsClaimed} />;
}

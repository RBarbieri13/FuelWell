import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { Founders100Content } from "./founders-100-content";

export const metadata: Metadata = {
  title: "Founders 100",
  description:
    "Become one of the first 100 members shaping FuelWell. Lifetime pricing, early access, and direct feedback with the founders.",
};

export const dynamic = "force-dynamic";

async function getSpotsClaimed(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase env vars missing — falling back to 0 spots claimed.");
    return 0;
  }

  const supabase = createClient(url, key);
  const { count, error } = await supabase
    .from("founder_signups")
    .select("*", { count: "exact", head: true })
    .eq("source", "founders-100");

  if (error) {
    console.error("Failed to fetch founder_signups count:", error);
    return 0;
  }

  return count ?? 0;
}

export default async function Founders100Page() {
  const spotsClaimed = await getSpotsClaimed();
  return <Founders100Content spotsClaimed={spotsClaimed} />;
}

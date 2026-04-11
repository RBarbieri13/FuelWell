import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_TIERS = ["pro", "premium"] as const;
const VALID_BILLING_PERIODS = ["monthly", "6-month", "annual"] as const;
const VALID_SOURCES = ["signup", "founders-100"] as const;

type Tier = (typeof VALID_TIERS)[number];
type BillingPeriod = (typeof VALID_BILLING_PERIODS)[number];
type Source = (typeof VALID_SOURCES)[number];

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(url, key);
}

function normalizeOptional(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, tier, billingPeriod, source } = body as Record<
    string,
    string | undefined | null
  >;

  const trimmedEmail = email?.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const normalizedTier = normalizeOptional(tier);
  if (normalizedTier !== null && !VALID_TIERS.includes(normalizedTier as Tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const normalizedBillingPeriod = normalizeOptional(billingPeriod);
  if (
    normalizedBillingPeriod !== null &&
    !VALID_BILLING_PERIODS.includes(normalizedBillingPeriod as BillingPeriod)
  ) {
    return NextResponse.json({ error: "Invalid billing period." }, { status: 400 });
  }

  const resolvedSource: Source = VALID_SOURCES.includes(source as Source)
    ? (source as Source)
    : "signup";

  const trimmedName = normalizeOptional(name);
  const supabase = getSupabaseServer();

  if (resolvedSource === "founders-100") {
    const { error } = await supabase.from("founders_100").insert({
      email: trimmedEmail,
      name: trimmedName,
      tier: normalizedTier,
      billing_period: normalizedBillingPeriod,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already on the Founders 100 list!" },
          { status: 409 }
        );
      }
      console.error("Supabase insert error (founders_100):", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.from("signups").insert({
    email: trimmedEmail,
    name: trimmedName,
    tier: normalizedTier,
    billing_period: normalizedBillingPeriod,
    source_page: "signup",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This email is already signed up!" }, { status: 409 });
    }
    console.error("Supabase insert error (signups):", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

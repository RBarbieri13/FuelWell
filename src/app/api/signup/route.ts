import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendFoundersWelcomeEmail } from "@/lib/email";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, firstName, email, source } = body as Record<
    string,
    string | undefined | null
  >;

  const trimmedEmail = email?.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const trimmedName = name?.trim() || null;
  const trimmedFirstName =
    firstName?.trim() || trimmedName?.split(" ")[0] || "there";
  const supabase = getSupabaseServer();

  const { error } = await supabase.from("founders_100").insert({
    email: trimmedEmail,
    name: trimmedName,
    tier: "pro",
    billing_period: "monthly",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email is already on the Founders 100 list!" },
        { status: 409 },
      );
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (source === "founders-100") {
    try {
      await sendFoundersWelcomeEmail({
        firstName: trimmedFirstName,
        email: trimmedEmail,
      });
    } catch (emailError) {
      console.error("Failed to send Founders 100 welcome email:", emailError);
    }
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { sendFoundersWelcomeEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type SignupSource = "signup" | "founders-100";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeSource(source: string | undefined | null): SignupSource {
  return source === "founders-100" ? "founders-100" : "signup";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, firstName, lastName, email, source } = body as Record<
    string,
    string | undefined | null
  >;

  const trimmedEmail = email ? normalizeEmail(email) : "";
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const trimmedFirstName = firstName?.trim() || null;
  const trimmedLastName = lastName?.trim() || null;
  const trimmedName =
    name?.trim() ||
    [trimmedFirstName, trimmedLastName].filter(Boolean).join(" ") ||
    null;
  const normalizedSource = normalizeSource(source);
  const supabase = getSupabaseAdmin();

  const { error: signupError } = await supabase
    .from("marketing_signups")
    .upsert(
      {
        email: trimmedEmail,
        name: trimmedName,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        source: normalizedSource,
        desired_tier: "pro",
        billing_period: "monthly",
        founding100_interest: normalizedSource === "founders-100",
        metadata: {
          route: normalizedSource === "founders-100" ? "/founders-100" : "/signup",
        },
      },
      { onConflict: "normalized_email" },
    );

  if (signupError) {
    console.error("Supabase marketing_signups upsert error:", signupError);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  if (normalizedSource === "founders-100") {
    const { error: foundersError } = await supabase
      .from("founders_100")
      .upsert(
        {
          email: trimmedEmail,
          name: trimmedName,
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          source: normalizedSource,
          tier: "pro",
          billing_period: "monthly",
        },
        { onConflict: "normalized_email" },
      );

    if (foundersError) {
      console.error("Supabase founders_100 upsert error:", foundersError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }

    try {
      await sendFoundersWelcomeEmail({ email: trimmedEmail });
    } catch (emailError) {
      console.error("Failed to send Founders 100 welcome email:", emailError);
    }
  }

  return NextResponse.json({ success: true });
}

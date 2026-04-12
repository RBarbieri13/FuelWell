import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_SOURCES = ["signup", "founders-100"] as const;

type Source = (typeof VALID_SOURCES)[number];

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

  const { name, email, source } = body as Record<
    string,
    string | undefined | null
  >;

  const trimmedEmail = email?.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const trimmedName = name?.trim() || null;
  const resolvedSource: Source = VALID_SOURCES.includes(source as Source)
    ? (source as Source)
    : "signup";

  const supabase = getSupabaseServer();

  const { error } = await supabase.from("founder_signups").insert({
    email: trimmedEmail,
    name: trimmedName,
    source: resolvedSource,
  });

  if (error) {
    if (error.code === "23505") {
      const msg = resolvedSource === "founders-100"
        ? "This email is already on the Founders 100 list!"
        : "This email is already signed up!";
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  buildSubscriptionValidationRPCArgs,
  isValidSubscriptionValidationSecret,
  parseSubscriptionValidationPayload,
} from "@/lib/subscription-validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.SUBSCRIPTION_VALIDATION_SECRET) {
    console.error("SUBSCRIPTION_VALIDATION_SECRET is not configured.");
    return NextResponse.json(
      { error: "Subscription validation is not configured." },
      { status: 500 },
    );
  }

  if (
    !isValidSubscriptionValidationSecret(
      request.headers.get("x-fuelwell-validation-secret"),
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let rpcArgs;
  try {
    rpcArgs = buildSubscriptionValidationRPCArgs(
      parseSubscriptionValidationPayload(rawBody),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid subscription validation payload.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    throw error;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc(
    "record_subscription_validation_event",
    rpcArgs,
  );

  if (error) {
    console.error("Supabase subscription validation RPC error:", error);
    return NextResponse.json(
      { error: "Subscription validation could not be recorded." },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, event: data });
}

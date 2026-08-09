import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/preview-session";
import {
  accountCacheHeaders,
  clearDeleteChallengeCookie,
  createDeleteChallenge,
  createJsonError,
  deleteChallengeCookieName,
  readDeleteChallengeFromCookieHeader,
  serializeSetCookie,
} from "@/app/api/account/shared";

const deleteSchema = z.object({
  confirmation: z.string().trim().min(1).max(200),
});

export async function POST() {
  if (!hasSupabaseConfig()) {
    return createJsonError("Supabase is not configured for account deletion.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createJsonError("Authentication required.", 401);
  }

  const challenge = createDeleteChallenge(user);

  return Response.json(
    {
      signedIn: true,
      confirmationPhrase: challenge.phrase,
      expiresAt: challenge.expiresAt,
    },
    {
      status: 200,
      headers: {
        ...accountCacheHeaders(),
        "Set-Cookie": serializeSetCookie(deleteChallengeCookieName(), challenge.cookieValue, {
          maxAge: 10 * 60,
        }),
      },
    },
  );
}

export async function DELETE(request: Request) {
  if (!hasSupabaseConfig()) {
    return createJsonError("Supabase is not configured for account deletion.", 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return createJsonError("Authentication required.", 401);
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return createJsonError("Invalid account deletion confirmation.", 400);
  }

  const challenge = readDeleteChallengeFromCookieHeader(request.headers.get("cookie"));
  const clearCookieHeader = { "Set-Cookie": clearDeleteChallengeCookie() };

  if (!challenge || challenge.userId !== user.id) {
    return createJsonError("Start a fresh account deletion confirmation first.", 400, clearCookieHeader);
  }

  if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
    return createJsonError("This delete confirmation expired. Request a new one.", 410, clearCookieHeader);
  }

  if (parsed.data.confirmation.trim().toLowerCase() !== challenge.phrase.toLowerCase()) {
    return createJsonError("Type the exact confirmation phrase to delete this account.", 400);
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    return createJsonError(`Account deletion failed: ${error.message}`, 500, clearCookieHeader);
  }

  return Response.json(
    { signedIn: true, deleted: true },
    {
      status: 200,
      headers: {
        ...accountCacheHeaders(),
        ...clearCookieHeader,
      },
    },
  );
}

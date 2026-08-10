import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";
import {
  deleteUserAppState,
  loadUserAppState,
  saveUserAppState,
} from "@/lib/authenticated-storage-repository";
import type { OnboardingDraftDocument } from "@/lib/authenticated-storage-types";

function validDraft(value: unknown): value is OnboardingDraftDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Partial<OnboardingDraftDocument>;
  return Number.isInteger(draft.step) && Number(draft.step) >= 0 && Number(draft.step) <= 30 &&
    Boolean(draft.data && typeof draft.data === "object" && !Array.isArray(draft.data));
}

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function GET() {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to load onboarding progress." }, { status: 401 });
  try {
    const draft = await loadUserAppState<OnboardingDraftDocument>(
      auth.supabase,
      auth.user.id,
      "onboarding_draft",
    );
    if (draft !== null && !validDraft(draft)) {
      throw new Error("Stored onboarding progress is invalid");
    }
    return Response.json({ draft, userId: auth.user.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load onboarding progress." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to save onboarding progress." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.expectedUserId !== "string" || !body.expectedUserId) {
    return Response.json({ error: "The expected account is required to save onboarding progress." }, { status: 400 });
  }
  if (body.expectedUserId !== auth.user.id) {
    return Response.json({ error: "Your account changed before onboarding progress was saved." }, { status: 409 });
  }
  if (!validDraft(body?.draft)) {
    return Response.json({ error: "Onboarding progress is malformed." }, { status: 400 });
  }
  try {
    const draft = await saveUserAppState(
      auth.supabase,
      auth.user.id,
      "onboarding_draft",
      body.draft,
    );
    return Response.json({ draft, userId: auth.user.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save onboarding progress." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Sign in to clear onboarding progress." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.expectedUserId !== "string" || !body.expectedUserId) {
    return Response.json({ error: "The expected account is required to clear onboarding progress." }, { status: 400 });
  }
  if (body.expectedUserId !== auth.user.id) {
    return Response.json({ error: "Your account changed before onboarding progress was cleared." }, { status: 409 });
  }
  try {
    await deleteUserAppState(auth.supabase, auth.user.id, "onboarding_draft");
    return Response.json({ cleared: true, userId: auth.user.id });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to clear onboarding progress." },
      { status: 500 },
    );
  }
}

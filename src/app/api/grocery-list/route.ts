import { z } from "zod";
import { loadGroceryList, replaceGroceryList } from "@/lib/grocery-repository";
import { hasSupabaseConfig } from "@/lib/preview-session";
import { createClient } from "@/lib/supabase/server";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  amount: z.string().trim().min(1).max(100),
  category: z.enum(["Protein", "Produce", "Pantry", "Dairy", "Frozen", "Other"]),
  source: z.string().trim().min(1).max(200),
  checked: z.boolean(),
  servingSize: z.string().trim().max(100).optional(),
  classification: z.string().trim().max(200).optional(),
  vitaminBenefit: z.string().trim().max(300).optional(),
  quantity: z.string().trim().max(100).optional(),
});

async function authenticatedClient() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Grocery list request failed.";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ signedIn: false, items: [] });

  const parsedDate = dateSchema.safeParse(new URL(request.url).searchParams.get("date"));
  if (!parsedDate.success) {
    return Response.json({ error: "Invalid grocery list date." }, { status: 400 });
  }

  try {
    const items = await loadGroceryList(auth.supabase, auth.userId, parsedDate.data);
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsedDate.data,
      items,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  const auth = await authenticatedClient();
  if (!auth) return Response.json({ error: "Authentication required." }, { status: 401 });

  const parsed = z.object({
    date: dateSchema,
    items: z.array(itemSchema).max(500),
  }).safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid grocery list payload." }, { status: 400 });
  }

  try {
    const items = await replaceGroceryList(
      auth.supabase,
      auth.userId,
      parsed.data.date,
      parsed.data.items,
    );
    return Response.json({
      signedIn: true,
      userId: auth.userId,
      date: parsed.data.date,
      items,
    });
  } catch (error) {
    return failure(error);
  }
}

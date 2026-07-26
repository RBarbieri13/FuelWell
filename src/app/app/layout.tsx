import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import type { UserMenuSession } from "@/components/layout/user-menu";
import { PreferencesSync } from "@/lib/preferences-sync";
import { ensureCoachKnowledgeForUser } from "@/lib/coach/persistence";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig, isPreviewHost } from "@/lib/preview-session";

async function resolveSession(): Promise<UserMenuSession> {
  if (!hasSupabaseConfig()) {
    const host = (await headers()).get("host");
    return isPreviewHost(host) ? "preview" : "anonymous";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureCoachKnowledgeForUser(supabase, user.id);
    return "authenticated";
  }

  const host = (await headers()).get("host");
  return isPreviewHost(host) ? "preview" : "anonymous";
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await resolveSession();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <PreferencesSync />
      <Sidebar />
      {/* min-w-0 stops a wide child (tables, chart rows) from forcing the whole
          shell wider than the viewport on 320px devices. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader session={session} />
        <main
          className="flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
          // Anchor jumps (Settings deep links) otherwise land underneath the
          // sticky mobile header.
          style={{ scrollPaddingTop: "4rem" }}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import type { UserMenuSession } from "@/components/layout/user-menu";
import { GoalContextSync } from "@/lib/goal-context-sync";
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
      <GoalContextSync />
      {/* Keyboard users otherwise tab through the whole sidebar (11 rows) on
          every navigation before reaching page content. Invisible until it
          takes focus, then it lands as a normal raised pill. */}
      <a
        href="#fw-main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-[max(env(safe-area-inset-top),1rem)] focus-visible:z-[60] focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:rounded-full focus-visible:border focus-visible:border-hairline-strong focus-visible:bg-surface focus-visible:px-5 focus-visible:text-sm focus-visible:font-black focus-visible:text-primary-800 focus-visible:shadow-e3"
      >
        Skip to content
      </a>
      <Sidebar />
      {/* min-w-0 stops a wide child (tables, chart rows) from forcing the whole
          shell wider than the viewport on 320px devices. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader session={session} />
        <main
          id="fw-main-content"
          // scrollbar-gutter keeps the content column from shifting sideways
          // the moment a page grows past one viewport on desktop.
          className="flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:[scrollbar-gutter:stable]"
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

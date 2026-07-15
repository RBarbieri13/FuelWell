import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { PreferencesSync } from "@/lib/preferences-sync";
import { ensureCoachKnowledgeForUser } from "@/lib/coach/persistence";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/preview-session";

async function bootstrapCoachKnowledge() {
  if (!hasSupabaseConfig()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureCoachKnowledgeForUser(supabase, user.id);
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await bootstrapCoachKnowledge();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <PreferencesSync />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

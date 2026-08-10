import { headers } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { IdentityStoreBoundary } from "@/components/auth/identity-store-boundary";
import type { UserMenuSession } from "@/components/layout/user-menu";
import { GoalContextSync } from "@/lib/goal-context-sync";
import { PreferencesSync } from "@/lib/preferences-sync";
import { ensureCoachKnowledgeForUser } from "@/lib/coach/persistence";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig, isPreviewHost } from "@/lib/preview-session";

type ResolvedIdentity = {
  session: UserMenuSession;
  userId: string | null;
  signedOutMode: "preview" | "anonymous";
  observeAuth: boolean;
};

async function resolveIdentity(): Promise<ResolvedIdentity> {
  const host = (await headers()).get("host");
  const signedOutMode = isPreviewHost(host) ? "preview" : "anonymous";

  if (!hasSupabaseConfig()) {
    return {
      session: signedOutMode,
      userId: null,
      signedOutMode,
      observeAuth: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureCoachKnowledgeForUser(supabase, user.id);
    return {
      session: "authenticated",
      userId: user.id,
      signedOutMode,
      observeAuth: true,
    };
  }

  return {
    session: signedOutMode,
    userId: null,
    signedOutMode,
    observeAuth: true,
  };
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const identity = await resolveIdentity();

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
        <MobileHeader session={identity.session} />
        <main
          id="fw-main-content"
          // scrollbar-gutter keeps the content column from shifting sideways
          // the moment a page grows past one viewport on desktop.
          className="flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:[scrollbar-gutter:stable]"
          // Anchor jumps (Settings deep links) otherwise land underneath the
          // sticky mobile header.
          style={{ scrollPaddingTop: "4rem" }}
        >
          <IdentityStoreBoundary
            initialUserId={identity.userId}
            signedOutMode={identity.signedOutMode}
            observeAuth={identity.observeAuth}
          >
            {children}
          </IdentityStoreBoundary>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { synchronizeIdentityScope } from "@/lib/profile-preferences";
import { createClient } from "@/lib/supabase/client";

type SignedOutMode = "preview" | "anonymous";

export function IdentityStoreBoundary({
  children,
  initialUserId,
  signedOutMode,
  observeAuth,
}: {
  children: ReactNode;
  initialUserId: string | null;
  signedOutMode: SignedOutMode;
  observeAuth: boolean;
}) {
  useLayoutEffect(() => {
    synchronizeIdentityScope(
      initialUserId
        ? { mode: "authenticated", userId: initialUserId }
        : { mode: signedOutMode },
    );

    if (!observeAuth) return;

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      synchronizeIdentityScope(
        session?.user.id
          ? { mode: "authenticated", userId: session.user.id }
          : { mode: signedOutMode },
      );
    });

    return () => subscription.unsubscribe();
  }, [initialUserId, observeAuth, signedOutMode]);

  return children;
}

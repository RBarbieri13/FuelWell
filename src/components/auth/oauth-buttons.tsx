"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { FacebookIcon, AppleIcon } from "@/components/auth/provider-icons";
import { cn } from "@/lib/utils/cn";
import {
  getNativeOAuthMessageHandler,
  safeNativeAuthNextPath,
} from "@/components/auth/native-oauth-bridge";

const PROVIDERS: {
  id: Provider;
  label: string;
  Icon: ({ className }: { className?: string }) => React.ReactElement;
}[] = [
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "facebook", label: "Continue with Facebook", Icon: FacebookIcon },
  { id: "apple", label: "Continue with Apple", Icon: AppleIcon },
];

export function OAuthButtons({ next }: { next: string }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleNativeResult(event: Event) {
      const detail = (event as CustomEvent<{ error?: string }>).detail;
      if (detail?.error) setError(detail.error);
      setPending(null);
    }

    window.addEventListener("fuelwell:native-auth-result", handleNativeResult);
    return () => window.removeEventListener("fuelwell:native-auth-result", handleNativeResult);
  }, []);

  async function signIn(provider: Provider) {
    setError(null);
    setPending(provider);

    const supabase = createClient();
    const nativeHandler = getNativeOAuthMessageHandler();
    const safeNext = safeNativeAuthNextPath(next);
    const redirectTo = nativeHandler
      ? `fuelwell://auth/callback?next=${encodeURIComponent(safeNext)}`
      : `${window.location.origin}/callback?next=${encodeURIComponent(safeNext)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: nativeHandler !== null,
      },
    });

    if (error) {
      setError(error.message);
      setPending(null);
      return;
    }

    if (nativeHandler) {
      if (!data.url) {
        setError("FuelWell could not open secure sign in. Please try again.");
        setPending(null);
        return;
      }
      nativeHandler.postMessage({ authorizationURL: data.url, provider, next: safeNext });
    }
  }

  return (
    <div className="space-y-2.5">
      {PROVIDERS.map(({ id, label, Icon }) => {
        const isPending = pending === id;
        return (
          <Button
            key={id}
            type="button"
            variant="secondary"
            size="lg"
            // justify-start + a fixed glyph slot keeps all three labels on the
            // same optical baseline instead of re-centring per icon width.
            className={cn(
              "w-full justify-start gap-4 px-5 text-[0.9375rem]",
              // The button that is actually working must not look as inert as
              // the two it just switched off — it keeps full opacity and gains
              // the selected ring; only its peers recede.
              isPending
                ? "border-primary-300 bg-primary-50 ring-1 ring-inset ring-primary-200 disabled:opacity-100"
                : "disabled:opacity-40"
            )}
            onClick={() => signIn(id)}
            loading={isPending}
            disabled={pending !== null}
          >
            {/* Slot is always reserved so the label never shifts when the
                spinner replaces the mark. */}
            {!isPending && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <span className="min-w-0 truncate">{label}</span>
          </Button>
        );
      })}
      {error && (
        <p
          className="flex items-start gap-2 rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm font-bold leading-5 text-red-700 ring-1 ring-inset ring-red-100"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            strokeWidth={2.25}
            aria-hidden="true"
          />
          <span className="min-w-0">{error}</span>
        </p>
      )}
    </div>
  );
}

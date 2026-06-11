"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { FacebookIcon, AppleIcon } from "@/components/auth/provider-icons";

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

  async function signIn(provider: Provider) {
    setError(null);
    setPending(provider);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
      },
    });

    // On success the browser is redirected away, so we only reach here on error.
    if (error) {
      setError(error.message);
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => signIn(id)}
          loading={pending === id}
          disabled={pending !== null}
        >
          {pending !== id && <Icon className="w-5 h-5" />}
          {label}
        </Button>
      ))}
      {error && (
        <p
          className="text-sm text-red-600 bg-red-50 px-3.5 py-2.5 rounded-xl"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

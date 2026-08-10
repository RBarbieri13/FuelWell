"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { parseNativeAuthCallback } from "@/components/auth/native-oauth-bridge";

export default function NativeAuthCallbackPage() {
  const [message, setMessage] = useState("Finishing secure sign in…");

  useEffect(() => {
    let isActive = true;

    async function finishSignIn() {
      const { code, providerError, next } = parseNativeAuthCallback(window.location.search);

      if (providerError || !code) {
        await Promise.resolve();
        if (isActive) {
          setMessage(providerError ?? "The sign-in callback was incomplete. Please try again.");
        }
        return;
      }

      const { error } = await createClient().auth.exchangeCodeForSession(code);
      if (!isActive) return;
      if (error) {
        setMessage("FuelWell could not finish sign in. Please try again.");
        return;
      }
      window.location.replace(next);
    }

    void finishSignIn();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-primary-50 p-6">
      <section className="w-full max-w-md rounded-3xl border border-primary-100 bg-white p-6 text-center shadow-card">
        <h1 className="font-heading text-2xl font-black text-ink-900">FuelWell sign in</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-ink-600" role="status">
          {message}
        </p>
        {message !== "Finishing secure sign in…" && (
          <Link className="mt-5 inline-flex min-h-11 items-center font-bold text-primary-700" href="/login">
            Return to sign in
          </Link>
        )}
      </section>
    </main>
  );
}

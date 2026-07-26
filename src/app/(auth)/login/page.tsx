"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3, Brain, LogIn, Utensils } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/app/dashboard";
  // Only genuine credential mistakes belong on the password field; outages,
  // rate limits, and other server errors render at the form level instead.
  const isCredentialError = Boolean(
    error && /credential|password|email/i.test(error)
  );
  const authError =
    searchParams.get("error") === "auth_failed"
      ? "Sign-in could not be completed. Please try again."
      : null;

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your daily decision system."
      panelTitle="Your nutrition, simplified."
      panelCopy="Return to your plate, coach, workouts, and progress without rebuilding the context every day."
      features={[
        { icon: Utensils, text: "Meal logging stays connected to your targets" },
        { icon: BarChart3, text: "Macros, trends, and streaks stay in one place" },
        { icon: Brain, text: "The coach remembers your latest context" },
      ]}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <AuthLink href="/signup">Sign up</AuthLink>
        </>
      }
    >
      <div className="space-y-6">
            {authError && (
              <p
                className="flex items-start gap-2 rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm font-bold leading-5 text-red-700 ring-1 ring-inset ring-red-100"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
                <span className="min-w-0">{authError}</span>
              </p>
            )}

            <OAuthButtons next={redirectTo} />

            {/* Two hairlines instead of a chip floated over a rule — the chip
                needed an opaque fill that never quite matched the card. */}
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline-strong" />
              <span className="text-[0.6875rem] font-black uppercase tracking-[0.16em] text-ink-subtle">
                or email
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline-strong" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && !isCredentialError && (
                <p
                  className="flex items-start gap-2 rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm font-bold leading-5 text-red-700 ring-1 ring-inset ring-red-100"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.25} />
                  <span className="min-w-0">{error}</span>
                </p>
              )}
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Your password"
                  autoComplete="current-password"
                  error={isCredentialError ? error || undefined : undefined}
                />
                <div className="mt-1 flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="-mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-xs font-bold text-primary-700 underline-offset-4 transition-colors hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {!loading && <LogIn className="h-4 w-4 shrink-0" strokeWidth={2.25} />}
                Sign in
              </Button>
            </form>
          </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        // Shape-matched to the real card so the swap doesn't jump the layout.
        <div className="fw-app-surface flex min-h-screen items-center justify-center px-4 py-8">
          <div
            className="w-full max-w-md rounded-[2rem] border border-hairline-strong bg-surface/95 p-5 shadow-e2 sm:p-7"
            role="status"
            aria-label="Loading sign-in"
          >
            <div className="space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full max-w-xs" />
            </div>
            <div className="mt-7 space-y-2.5">
              <Skeleton className="h-12 w-full rounded-[1.15rem]" />
              <Skeleton className="h-12 w-full rounded-[1.15rem]" />
              <Skeleton className="h-12 w-full rounded-[1.15rem]" />
            </div>
            <span className="sr-only">Loading…</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

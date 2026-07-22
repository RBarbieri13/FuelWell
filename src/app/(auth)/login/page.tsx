"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { BarChart3, Brain, LogIn, Utensils } from "lucide-react";

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
                className="rounded-[1rem] bg-red-50 px-3.5 py-2.5 text-sm font-bold text-red-600"
                role="alert"
              >
                {authError}
              </p>
            )}

            <OAuthButtons next={redirectTo} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  or email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && !isCredentialError && (
                <p
                  className="rounded-[1rem] bg-red-50 px-3.5 py-2.5 text-sm font-bold text-red-600"
                  role="alert"
                >
                  {error}
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
                <div className="mt-1.5 text-right">
                  <Link
                    href="/forgot-password"
                    className="-mx-2 -my-2.5 inline-block px-2 py-3.5 text-xs font-bold text-primary-700 transition-colors hover:text-primary-800"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <LogIn className="h-4 w-4" />
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
        <div className="fw-app-surface flex min-h-screen items-center justify-center">
          <div className="animate-pulse font-bold text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

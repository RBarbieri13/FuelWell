"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Utensils, BarChart3, Brain } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/app/dashboard";

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

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-500/50 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-60 h-60 bg-primary-400/30 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo href="/" size="lg" className="[&_span]:text-white" />

          <div className="space-y-8">
            <h2 className="text-3xl font-bold leading-tight">
              Your nutrition,
              <br />
              simplified.
            </h2>
            <div className="space-y-4">
              {[
                { icon: Utensils, text: "Log meals in under 15 seconds" },
                { icon: BarChart3, text: "Track macros without the math" },
                { icon: Brain, text: "AI coaching that adapts to you" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-primary-100">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-primary-200">
            &copy; {new Date().getFullYear()} FuelWell
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-neutral-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo size="lg" href="/" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Sign in to continue your journey
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon className="w-5 h-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-neutral-50 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  or email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                autoComplete="current-password"
                error={error || undefined}
              />

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Sign in
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-pulse text-neutral-400">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

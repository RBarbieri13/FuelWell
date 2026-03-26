"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Check } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback?next=/app/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/app/onboarding");
    router.refresh();
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=/app/onboarding`,
      },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-40 -right-20 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo href="/" size="lg" className="[&_span]:text-white" />

          <div className="space-y-8">
            <h2 className="text-3xl font-bold leading-tight">
              Start your
              <br />
              nutrition journey.
            </h2>
            <div className="space-y-3">
              {[
                "Personalized macro targets in 2 minutes",
                "AI coaching that adapts to your lifestyle",
                "Free to start — upgrade when you're ready",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 text-neutral-300">
                  <Check className="w-4 h-4 text-primary-400 shrink-0" />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} FuelWell
          </p>
        </div>
      </div>

      {/* Right — Signup form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-neutral-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo size="lg" href="/" />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              Get your personalized nutrition plan in 2 minutes
            </p>
          </div>

          <div className="space-y-6">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignup}
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

            <form onSubmit={handleEmailSignup} className="space-y-4">
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
                  minLength={8}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  error={error || undefined}
                />
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs ${
                        passwordStrength.level <= 1
                          ? "text-red-500"
                          : passwordStrength.level <= 2
                            ? "text-amber-500"
                            : "text-green-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Create account
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  if (password.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { level: 2, label: "Fair", color: "bg-amber-400" };
  if (score <= 3) return { level: 3, label: "Good", color: "bg-green-400" };
  return { level: 4, label: "Strong", color: "bg-green-500" };
}

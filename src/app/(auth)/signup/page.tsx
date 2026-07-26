"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils/cn";
import { Brain, Leaf, ShieldCheck, Target, UserPlus } from "lucide-react";

const ONBOARDING_STORAGE_KEY = "fuelwell:onboarding:v1";
const PREVIEW_KIND_STORAGE_KEY = "fuelwell:preview-user-kind";

function validateEmail(value: string) {
  if (!value.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "That doesn't look like an email address — check for typos.";
  }
  return null;
}

function validatePassword(value: string) {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Passwords need at least 8 characters.";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNewUserPreview, setIsNewUserPreview] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get("preview") === "new-user";
    // URL-derived preview mode must be read after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNewUserPreview(previewMode);
    if (previewMode) {
      setEmail("newuser@fuelwell.preview");
      setPassword("PreviewPass123!");
    }
  }, []);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();

    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) {
      (nextEmailError ? emailRef : passwordRef).current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    if (isNewUserPreview) {
      try {
        window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
        window.localStorage.setItem(PREVIEW_KIND_STORAGE_KEY, "new-user");
      } catch {
        // Preview still works; intake just won't persist if storage is blocked.
      }
      router.push("/app/onboarding?preview=new-user&reset=1");
      return;
    }

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

  return (
    <AuthShell
      title="Create your account"
      subtitle="Get a personalized nutrition plan in a few minutes."
      panelTitle="Start with a plan that already knows the job."
      panelCopy="FuelWell sets targets, preferences, and coaching context before your first logged meal."
      features={[
        { icon: Target, text: "Personalized macro targets in setup" },
        { icon: Brain, text: "Coach responses adapt to your goals" },
        { icon: Leaf, text: "Diet and allergy rules stay respected" },
      ]}
      footer={
        <>
          Already have an account?{" "}
          <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      <div className="space-y-6">
            {isNewUserPreview ? (
              <div className="flex items-start gap-3 rounded-[1.25rem] bg-lemon-50 px-4 py-3 ring-1 ring-inset ring-lemon-100">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-lemon-700 ring-1 ring-inset ring-lemon-100">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <p className="min-w-0 text-xs font-semibold leading-5 text-ink-muted">
                  <span className="font-black text-ink">
                    New-user preview account.
                  </span>{" "}
                  Local review only — no auth email, no production record.
                </p>
              </div>
            ) : (
              <OAuthButtons next="/app/onboarding" />
            )}

            <div
              className={
                isNewUserPreview ? "hidden" : "flex items-center gap-3"
              }
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline-strong" />
              <span className="text-[0.6875rem] font-black uppercase tracking-[0.16em] text-ink-subtle">
                or email
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline-strong" />
            </div>

            <form onSubmit={handleEmailSignup} noValidate className="space-y-4">
              <Input
                ref={emailRef}
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError && !validateEmail(e.target.value)) setEmailError(null);
                }}
                onBlur={() => setEmailError(email ? validateEmail(email) : null)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                error={emailError || undefined}
              />
              <div>
                <Input
                  ref={passwordRef}
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError && !validatePassword(e.target.value)) setPasswordError(null);
                  }}
                  onBlur={() => setPasswordError(password ? validatePassword(password) : null)}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  error={passwordError || error || undefined}
                />
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div
                      className="flex gap-1"
                      role="img"
                      aria-label={`Password strength: ${passwordStrength.label}, ${passwordStrength.level} of 4`}
                    >
                      {[1, 2, 3, 4].map((level) => (
                        <span
                          key={level}
                          className={cn(
                            // Unfilled segments sit in the sunken well so the
                            // meter still reads as a 4-step scale at level 1.
                            "h-1.5 flex-1 rounded-full transition-colors duration-300 ease-out-soft",
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-surface-sunken"
                          )}
                        />
                      ))}
                    </div>
                    <p
                      className={cn(
                        "flex items-baseline gap-1.5 text-xs font-bold",
                        passwordStrength.level <= 1
                          ? "text-red-600"
                          : passwordStrength.level <= 2
                            ? "text-lemon-700"
                            : "text-primary-700"
                      )}
                      aria-live="polite"
                    >
                      {passwordStrength.label}
                      <span className="font-semibold tabular-nums text-ink-subtle">
                        {passwordStrength.level}/4
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {!loading && (
                  <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                )}
                {isNewUserPreview ? "Create preview account" : "Create account"}
              </Button>
            </form>
          </div>
    </AuthShell>
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

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { level: 2, label: "Fair", color: "bg-lemon-500" };
  if (score <= 3) return { level: 3, label: "Good", color: "bg-primary-400" };
  return { level: 4, label: "Strong", color: "bg-primary-600" };
}

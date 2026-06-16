"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { AuthLink, AuthShell } from "@/components/auth/auth-shell";
import { Brain, Leaf, ShieldCheck, Sparkles, Target } from "lucide-react";

const ONBOARDING_STORAGE_KEY = "fuelwell:onboarding:v1";
const PREVIEW_KIND_STORAGE_KEY = "fuelwell:preview-user-kind";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNewUserPreview, setIsNewUserPreview] = useState(false);

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
      subtitle="Get a personalized nutrition plan in about 2 minutes."
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
              <div className="rounded-[1.5rem] border border-primary-100 bg-primary-50/80 p-4">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white text-primary-700">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#16302a]">
                      New-user preview account
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#6f8981]">
                      This path uses a fake local account for review. No auth
                      email is sent and no production user record is created.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <OAuthButtons next="/app/onboarding" />
            )}

            <div className={isNewUserPreview ? "hidden" : "relative"}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-black uppercase tracking-[0.16em] text-[#91a7a0]">
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
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-primary-50"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        passwordStrength.level <= 1
                          ? "text-red-500"
                          : passwordStrength.level <= 2
                            ? "text-lemon-700"
                            : "text-primary-700"
                      }`}
                    >
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <Sparkles className="h-4 w-4" />
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

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
  if (score <= 2) return { level: 2, label: "Fair", color: "bg-lemon-500" };
  if (score <= 3) return { level: 3, label: "Good", color: "bg-primary-400" };
  return { level: 4, label: "Strong", color: "bg-primary-600" };
}

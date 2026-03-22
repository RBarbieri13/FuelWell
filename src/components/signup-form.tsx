"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientButton } from "@/components/ui/gradient-button";
import { supabase } from "@/lib/supabase";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tier = "pro" | "premium";
type BillingPeriod = "monthly" | "6-month" | "annual";

const tiers: { value: Tier; label: string; price: string }[] = [
  { value: "pro", label: "Pro", price: "$10.99/mo" },
  { value: "premium", label: "Premium", price: "$16.99/mo" },
];

const billingPeriods: { value: BillingPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "6-month", label: "6-Month" },
  { value: "annual", label: "Annual" },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("pro");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: supabaseError } = await supabase
        .from("signups")
        .insert({
          email: trimmedEmail,
          name: name.trim() || null,
          tier,
          billing_period: billingPeriod,
          source_page: "signup",
        });

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          setError("This email is already signed up!");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-12">
        <CheckCircle className="w-16 h-16 text-fw-accent mx-auto" />
        <h3>You&apos;re on the list!</h3>
        <p className="text-muted-foreground">
          We&apos;ll be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 bg-white border-fw-border"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-fw-orange">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 bg-white border-fw-border"
        />
      </div>

      {/* Tier Selection */}
      <div className="space-y-3">
        <Label>Plan</Label>
        <div className="grid grid-cols-2 gap-3">
          {tiers.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTier(t.value)}
              className={cn(
                "rounded-xl border-2 p-4 text-center transition-colors",
                tier === t.value
                  ? "border-fw-accent bg-emerald-50"
                  : "border-fw-border bg-white hover:border-fw-accent/50"
              )}
            >
              <span className="block font-semibold text-lg text-foreground">{t.label}</span>
              <span
                className={cn(
                  "block text-sm mt-1",
                  tier === t.value
                    ? "text-fw-accent"
                    : "text-muted-foreground"
                )}
              >
                {t.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Billing Period */}
      <div className="space-y-3">
        <Label>Billing Period</Label>
        <div className="grid grid-cols-3 gap-3">
          {billingPeriods.map((bp) => (
            <button
              key={bp.value}
              type="button"
              onClick={() => setBillingPeriod(bp.value)}
              className={cn(
                "rounded-xl border-2 py-3 px-2 text-center text-sm font-medium transition-colors",
                billingPeriod === bp.value
                  ? "border-fw-accent bg-emerald-50 text-fw-accent"
                  : "border-fw-border bg-white text-muted-foreground hover:border-fw-accent/50"
              )}
            >
              {bp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-fw-error text-sm text-center">{error}</p>
      )}

      {/* Submit */}
      <div className="pt-2">
        <GradientButton
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Signing up..." : "Join FuelWell"}
        </GradientButton>
      </div>
    </form>
  );
}

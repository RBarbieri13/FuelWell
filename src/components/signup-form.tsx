"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientButton } from "@/components/ui/gradient-button";
import { CheckCircle, Sparkles } from "lucide-react";

type Source = "signup" | "founders-100";

const founders100Pricing = [
  {
    key: "pro" as const,
    name: "FuelWell Pro",
    description: "AI-powered nutrition coaching",
    plans: [
      { period: "Monthly", founders: "$6.49/mo", regular: "$12.99/mo" },
      { period: "6-Month", founders: "$34.50", regular: "$69" },
      { period: "Annual", founders: "$59.50", regular: "$119" },
    ],
  },
  {
    key: "premium" as const,
    name: "FuelWell Premium",
    description: "Full AI coaching experience",
    plans: [
      { period: "Monthly", founders: "$9.49/mo", regular: "$18.99/mo" },
      { period: "6-Month", founders: "$49.50", regular: "$99" },
      { period: "Annual", founders: "$89.50", regular: "$179" },
    ],
  },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SignupFormProps = {
  source?: Source;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  showFoundersPricing?: boolean;
};

export function SignupForm({
  source = "signup",
  submitLabel = "Join FuelWell",
  successTitle = "You're on the list!",
  successMessage = "We'll be in touch soon.",
  showFoundersPricing = false,
}: SignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      setError("First name is required.");
      return;
    }

    if (!trimmedLastName) {
      setError("Last name is required.");
      return;
    }

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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${trimmedFirstName} ${trimmedLastName}`,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          source,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setToastVisible(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <Toast visible={toastVisible} message={successTitle} />
        <div className="text-center space-y-4 py-12">
          <CheckCircle className="w-16 h-16 text-fw-accent mx-auto" />
          <h3>{successTitle}</h3>
          <p className="text-muted-foreground">{successMessage}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast visible={toastVisible} message={successTitle} />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {/* First / Last name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First name <span className="text-fw-orange">*</span>
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
            className="h-12 bg-white border-fw-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">
            Last name <span className="text-fw-orange">*</span>
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
            className="h-12 bg-white border-fw-border"
          />
        </div>
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

      {/* Informational pricing (founders-100 only) */}
      {showFoundersPricing && (
        <div className="space-y-4 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/60 to-emerald-50/40 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <Label className="text-sm font-semibold text-foreground">
              Your Founders 100 Pricing — locked in for life
            </Label>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No payment required today. We&apos;re collecting Founders 100 members now and
            will activate your discounted rate when we launch. Choose your plan at launch.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {founders100Pricing.map((tier) => (
              <div
                key={tier.key}
                className="rounded-xl border border-fw-border bg-white p-4 space-y-3"
              >
                <div>
                  <p className="font-semibold text-sm text-foreground">{tier.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {tier.description}
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {tier.plans.map((plan) => (
                    <li
                      key={plan.period}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-muted-foreground">{plan.period}</span>
                      <span className="flex items-baseline gap-2">
                        <span className="line-through text-muted-foreground/60 text-[11px]">
                          {plan.regular}
                        </span>
                        <span className="font-semibold text-fw-accent">
                          {plan.founders}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-fw-error text-sm text-center">{error}</p>}

      {/* Submit */}
      <div className="pt-2">
        <GradientButton type="submit" disabled={submitting} className="w-full">
          {submitting ? "Saving your spot..." : submitLabel}
        </GradientButton>
      </div>
      </form>
    </>
  );
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/40 backdrop-blur-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
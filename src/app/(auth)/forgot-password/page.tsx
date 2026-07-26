"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";
import { ArrowLeft, Brain, Mail, Send, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?next=/app/profile`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={
        sent
          ? "The reset link is on its way."
          : "Enter your email and we will send you a reset link."
      }
      panelTitle="Get back to your plan without losing momentum."
      panelCopy="Password recovery keeps your account route simple while preserving your dashboard, coach, and profile context."
      features={[
        { icon: ShieldCheck, text: "Secure reset handled through your email" },
        { icon: Brain, text: "Coach and profile context remain attached" },
        { icon: Mail, text: "One link returns you to FuelWell" },
      ]}
      footer={
        sent ? undefined : (
          <Link
            href="/login"
            className="group -mx-1 -my-2.5 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 py-2.5 font-black text-primary-700 underline-offset-4 transition-colors hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out-soft group-hover:-translate-x-0.5"
              strokeWidth={2.5}
            />
            Back to login
          </Link>
        )
      }
    >
      {sent ? (
        <div className="text-center" role="status">
          <div className="relative mx-auto mb-5 h-16 w-16">
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-[1.6rem] bg-primary-100/60 blur-lg"
            />
            <span className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-primary-100 bg-gradient-to-br from-primary-50 to-surface text-primary-600 shadow-e1">
              <Mail className="h-7 w-7" strokeWidth={1.75} />
            </span>
          </div>
          <p className="text-sm font-semibold leading-7 text-ink-muted">
            We sent a password reset link to{" "}
            {/* The address wraps mid-string on narrow screens rather than
                pushing the card wider than the viewport. */}
            <strong className="font-black text-ink [overflow-wrap:anywhere]">
              {email}
            </strong>
            . Click the link in the email to reset your password.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
            error={error || undefined}
            autoFocus
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {!loading && <Send className="h-4 w-4 shrink-0" strokeWidth={2.25} />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

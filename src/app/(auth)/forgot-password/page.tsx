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
            className="inline-flex items-center gap-1.5 text-primary-700 transition hover:text-primary-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        )
      }
    >
      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-primary-50 text-primary-700">
            <Mail className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold leading-7 text-muted-foreground">
            We sent a password reset link to{" "}
            <strong className="font-black text-[#16302a]">{email}</strong>.
            Click the link in the email to reset your password.
          </p>
          <Link href="/login" className="mt-6 inline-block">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <>
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
                <Send className="h-4 w-4" />
                Send reset link
              </Button>
            </form>
        </>
      )}
    </AuthShell>
  );
}

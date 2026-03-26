"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-50">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Logo size="lg" href="/" />
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight mb-2">
              Check your email
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              We sent a password reset link to <strong className="text-neutral-700">{email}</strong>. Click the link in the email to reset your password.
            </p>
            <Link href="/login" className="inline-block mt-6">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Reset your password
              </h1>
              <p className="mt-1.5 text-sm text-neutral-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

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
                Send reset link
              </Button>
            </form>

            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

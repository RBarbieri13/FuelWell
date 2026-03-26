"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProfileClientProps {
  email: string;
}

export function ProfileClient({ email }: ProfileClientProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Profile
      </h1>

      {/* User info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 truncate">{email}</p>
            <p className="text-sm text-neutral-500">FuelWell member</p>
          </div>
        </div>
      </Card>

      {/* Settings links */}
      <Card padding="sm" className="divide-y divide-neutral-100">
        <Link
          href="/app/onboarding"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors first:rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">
              Edit nutrition profile
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-300" />
        </Link>
      </Card>

      {/* Sign out */}
      <Button variant="danger" onClick={handleSignOut}>
        <LogOut className="w-4 h-4" />
        Sign out
      </Button>
    </div>
  );
}

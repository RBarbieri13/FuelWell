"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut } from "lucide-react";

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
      <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
            <User className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{email}</p>
            <p className="text-sm text-neutral-500">FuelWell member</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
}

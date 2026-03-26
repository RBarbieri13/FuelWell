"use client";

import Link from "next/link";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroBar } from "@/components/dashboard/macro-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { MessageSquare } from "lucide-react";

interface DashboardClientProps {
  displayName: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  onboardingComplete: boolean;
}

export function DashboardClient({
  displayName,
  calorieTarget,
  proteinTarget,
  carbsTarget,
  fatTarget,
  caloriesConsumed,
  proteinConsumed,
  carbsConsumed,
  fatConsumed,
  onboardingComplete,
}: DashboardClientProps) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Onboarding banner */}
      {!onboardingComplete && (
        <Link
          href="/app/onboarding"
          className="block p-4 bg-accent-50 border border-accent-200 rounded-xl"
        >
          <p className="text-sm font-medium text-accent-700">
            Complete your profile to get personalized macro targets &rarr;
          </p>
        </Link>
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Hey, {displayName}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Here&apos;s your nutrition snapshot for today
        </p>
      </div>

      {/* Calorie Ring + Macros */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center justify-center">
          <CalorieRing consumed={caloriesConsumed} target={calorieTarget} />
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
            Macros
          </h2>
          <MacroBar
            label="Protein"
            current={proteinConsumed}
            target={proteinTarget}
            color="#3b82f6"
          />
          <MacroBar
            label="Carbs"
            current={carbsConsumed}
            target={carbsTarget}
            color="#f59e0b"
          />
          <MacroBar
            label="Fat"
            current={fatConsumed}
            target={fatTarget}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* AI Coach Insight */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-500 rounded-lg shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-900">AI Coach Insight</h3>
            <p className="text-sm text-primary-700 mt-1">
              {caloriesConsumed === 0
                ? "Good morning! Ready to log your first meal? I'll help you hit your macros today."
                : `You've consumed ${caloriesConsumed} calories so far. ${
                    caloriesConsumed < calorieTarget * 0.5
                      ? "You're on track — keep going!"
                      : "Getting close to your target. Consider lighter options for your next meal."
                  }`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

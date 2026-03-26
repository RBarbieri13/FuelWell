"use client";

import Link from "next/link";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroBar } from "@/components/dashboard/macro-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

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
  const hasLoggedToday = caloriesConsumed > 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Onboarding banner */}
      {!onboardingComplete && (
        <Link href="/app/onboarding" className="block group">
          <Card className="bg-accent-50/50 border-accent-200/80 group-hover:border-accent-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-accent-800">
                  Complete your profile
                </p>
                <p className="text-xs text-accent-600 mt-0.5">
                  Get personalized macro targets calculated for your body
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        </Link>
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Hey, {displayName}
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          {hasLoggedToday
            ? "Here's your nutrition snapshot for today"
            : "Ready to start logging today's meals?"}
        </p>
      </div>

      {/* Calorie Ring + Macros */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="flex items-center justify-center py-8">
          <CalorieRing consumed={caloriesConsumed} target={calorieTarget} />
        </Card>

        <Card className="space-y-5">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
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
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* AI Coach Insight */}
      <Card
        variant="elevated"
        className="bg-gradient-to-br from-primary-50/80 via-white to-primary-50/40 border-primary-100"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-primary-600 rounded-xl shrink-0 shadow-sm shadow-primary-600/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 text-sm">
              Coach Insight
            </h3>
            <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
              {!hasLoggedToday
                ? "Good morning! Log your first meal to get personalized coaching throughout the day."
                : caloriesConsumed < calorieTarget * 0.5
                  ? `${caloriesConsumed} calories logged so far — you're on track. Keep it up!`
                  : caloriesConsumed < calorieTarget
                    ? `You've used ${Math.round((caloriesConsumed / calorieTarget) * 100)}% of your daily target. Consider lighter options for your remaining meals.`
                    : "You've hit your calorie target for today. If you're still hungry, reach for protein-rich snacks."}
            </p>
            <Link href="/app/coach" className="inline-block mt-3">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 -ml-3">
                Chat with coach
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  Camera,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatMealType, type MacroTotals, type MealType } from "@/lib/fuelwell-data";
import { useDayLog } from "@/lib/use-day-log";
import type { FoodItem } from "@/lib/food-database";
import { FoodSearch } from "@/components/log/food-search";
import { PortionPicker } from "@/components/log/portion-picker";
import { CustomMealForm, type CustomMealDraft } from "@/components/log/custom-meal-form";
import { LoggedMeals } from "@/components/log/logged-meals";
import { TotalsSummary } from "@/components/log/totals-summary";

type LogMode = "search" | "photo" | "scan";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as LogMode) || "search";
  const { meals, totals, targets, addMeal, updateMealItem, removeMeal } =
    useDayLog();

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [confirmation, setConfirmation] = useState("");

  const mealTypeLabel = formatMealType(mealType);

  function logItem(name: string, servings: number, totalsToAdd: MacroTotals) {
    addMeal({
      mealType,
      name,
      items: [{ name, servings, ...totalsToAdd }],
    });
    setConfirmation(`${name} added to ${mealTypeLabel.toLowerCase()}.`);
  }

  function handleAddPortion(input: {
    amount: number;
    label: string;
    totals: MacroTotals;
  }) {
    if (!selectedFood) return;
    logItem(`${selectedFood.name} (${input.label})`, input.amount, input.totals);
    setSelectedFood(null);
  }

  function handleCustomMeal(draft: CustomMealDraft) {
    logItem(`${draft.name} (${draft.portionLabel})`, 1, draft.totals);
  }

  const modes: { key: LogMode; label: string; icon: typeof Search }[] = [
    { key: "search", label: "Search", icon: Search },
    { key: "photo", label: "Photo", icon: Camera },
    { key: "scan", label: "Scan", icon: Barcode },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-8">
      <Card variant="elevated" className="bg-neutral-950 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-primary-200">Fast logging</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Log a meal</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-neutral-300">
              Search updates as you type. Adding food updates Today&apos;s Plate,
              dashboard macros, and coach context.
            </p>
          </div>
          <Button
            variant="secondary"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
            onClick={() => router.push("/app/nutrition")}
          >
            View today&apos;s plate
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="space-y-5">
          <div className="flex gap-1 rounded-2xl bg-white/70 p-1 shadow-sm shadow-neutral-200/70">
            {modes.map((modeOption) => (
              <button
                key={modeOption.key}
                onClick={() => setMode(modeOption.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-150",
                  mode === modeOption.key
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-300/60"
                    : "text-neutral-500 hover:bg-white hover:text-neutral-900"
                )}
              >
                <modeOption.icon className="h-4 w-4" />
                {modeOption.label}
              </button>
            ))}
          </div>

          {mode === "search" && (
            <FoodSearch
              selectedId={selectedFood?.id ?? null}
              onSelect={(food) => {
                setSelectedFood(food);
                setConfirmation("");
              }}
            />
          )}

          {mode === "photo" && (
            <ModeUnavailable
              icon={<Camera className="h-8 w-8" />}
              title="Photo logging is queued for live AI."
              body="For this build, use Search to log the meal truthfully. The photo flow will estimate items only after an AI kill-switch and review step exist."
              action="Search foods instead"
              onAction={() => setMode("search")}
            />
          )}

          {mode === "scan" && (
            <ModeUnavailable
              icon={<Barcode className="h-8 w-8" />}
              title="Barcode scanning needs device camera access."
              body="The app will not show a fake scanner. Search the food manually and add the serving so the macros stay consistent."
              action="Search foods instead"
              onAction={() => setMode("search")}
            />
          )}

          <CustomMealForm
            mealTypeLabel={mealTypeLabel}
            onSubmit={handleCustomMeal}
          />

          <LoggedMeals
            meals={meals}
            onUpdateItem={updateMealItem}
            onRemoveMeal={removeMeal}
          />
        </div>

        <div className="space-y-5">
          <Card className="space-y-4">
            <h2 className="text-lg font-black text-neutral-900">Logging for</h2>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-black transition",
                    mealType === type
                      ? "border-primary-300 bg-primary-50 text-primary-800"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {formatMealType(type)}
                </button>
              ))}
            </div>
          </Card>

          <Card variant="elevated" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-neutral-900">
                  Add to Today&apos;s Plate
                </h2>
                <p className="text-sm font-medium text-neutral-500">
                  {selectedFood
                    ? "Tap a portion or enter a custom amount."
                    : "Pick a food from search to choose a portion."}
                </p>
              </div>
            </div>

            {selectedFood ? (
              <PortionPicker
                food={selectedFood}
                mealTypeLabel={mealTypeLabel}
                onAdd={handleAddPortion}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                <p className="font-bold text-neutral-900">No food selected.</p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Choose a result from Search. Its one-tap portions appear here.
                </p>
              </div>
            )}

            {confirmation && (
              <div
                role="status"
                className="rounded-2xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-800"
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                {confirmation}
              </div>
            )}
          </Card>

          <TotalsSummary totals={totals} targets={targets} />
        </div>
      </div>
    </div>
  );
}

function ModeUnavailable({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <Card className="py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
        {icon}
      </div>
      <h2 className="mx-auto mt-5 max-w-md text-2xl font-black text-neutral-900">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-neutral-500">
        {body}
      </p>
      <Button onClick={onAction} className="mt-6">
        {action}
      </Button>
    </Card>
  );
}

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 md:p-8">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      }
    >
      <LogContent />
    </Suspense>
  );
}

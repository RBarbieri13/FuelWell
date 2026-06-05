"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Barcode,
  Camera,
  Check,
  Clock,
  Minus,
  Plus,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import {
  DEMO_FOODS,
  formatMealType,
  multiplyFood,
  todayIsoDate,
  type FoodItem,
  type MealType,
} from "@/lib/fuelwell-data";

type LogMode = "search" | "photo" | "scan";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as LogMode) || "search";
  const [mode, setMode] = useState<LogMode>(initialMode);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return DEMO_FOODS;
    return DEMO_FOODS.filter((food) => {
      const haystack = `${food.name} ${food.brand || ""} ${food.serving} ${food.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery]);

  const selectedTotals = selectedFood ? multiplyFood(selectedFood, servings) : null;

  async function addSelectedFood() {
    if (!selectedFood || !selectedTotals) return;

    setStatus("saving");
    setMessage("");

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatus("error");
      setMessage("Please sign in again before logging food.");
      return;
    }

    const today = todayIsoDate();
    const { data: existingLog, error: logReadError } = await supabase
      .from("daily_logs")
      .select("id, calories_consumed, protein_consumed, carbs_consumed, fat_consumed")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle();

    if (logReadError) {
      setStatus("error");
      setMessage(logReadError.message);
      return;
    }

    const nextTotals = {
      calories_consumed:
        Number(existingLog?.calories_consumed ?? 0) + selectedTotals.calories,
      protein_consumed:
        Number(existingLog?.protein_consumed ?? 0) + selectedTotals.protein,
      carbs_consumed:
        Number(existingLog?.carbs_consumed ?? 0) + selectedTotals.carbs,
      fat_consumed:
        Number(existingLog?.fat_consumed ?? 0) + selectedTotals.fat,
    };

    const logWrite = existingLog?.id
      ? await supabase
          .from("daily_logs")
          .update(nextTotals)
          .eq("id", existingLog.id)
          .select("id")
          .single()
      : await supabase
          .from("daily_logs")
          .insert({
            user_id: user.id,
            log_date: today,
            ...nextTotals,
          })
          .select("id")
          .single();

    if (logWrite.error || !logWrite.data) {
      setStatus("error");
      setMessage(logWrite.error?.message || "Could not save the daily log.");
      return;
    }

    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        daily_log_id: logWrite.data.id,
        meal_type: mealType,
        name: formatMealType(mealType),
      })
      .select("id")
      .single();

    if (mealError || !meal) {
      setStatus("error");
      setMessage(mealError?.message || "Could not create the meal.");
      return;
    }

    const { error: itemError } = await supabase.from("meal_items").insert({
      meal_id: meal.id,
      custom_name: selectedFood.name,
      servings,
      calories: selectedTotals.calories,
      protein: selectedTotals.protein,
      carbs: selectedTotals.carbs,
      fat: selectedTotals.fat,
    });

    if (itemError) {
      setStatus("error");
      setMessage(itemError.message);
      return;
    }

    setStatus("saved");
    setMessage(`${selectedFood.name} was added to ${formatMealType(mealType).toLowerCase()}.`);
    setSelectedFood(null);
    setServings(1);
    router.refresh();
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
              Search updates as you type. Adding food updates Today&apos;s Plate, dashboard macros, and coach context.
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
            <Card className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search foods, meals, or tags"
                  className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-12 pr-4 text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-400">
                  <Clock className="h-4 w-4" />
                  {searchQuery ? "Matching foods" : "Quick foods"}
                </h2>
                <p className="text-xs font-bold text-neutral-400">
                  Seeded demo database
                </p>
              </div>

              <div className="grid gap-2">
                {results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setStatus("idle");
                      setMessage("");
                    }}
                    className={cn(
                      "grid gap-3 rounded-2xl border p-4 text-left transition md:grid-cols-[1fr_auto]",
                      selectedFood?.id === food.id
                        ? "border-primary-300 bg-primary-50/70 shadow-md shadow-primary-100"
                        : "border-neutral-100 bg-neutral-50/70 hover:border-primary-200 hover:bg-white"
                    )}
                  >
                    <div>
                      <p className="font-black text-neutral-900">{food.name}</p>
                      <p className="mt-1 text-sm font-medium text-neutral-500">
                        {food.serving} - {food.tags.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="font-black tabular-nums text-neutral-900">
                          {food.calories} cal
                        </p>
                        <p className="text-xs font-bold text-neutral-400">
                          {food.protein}g protein
                        </p>
                      </div>
                      <Plus className="h-5 w-5 text-primary-600" />
                    </div>
                  </button>
                ))}
              </div>

              {results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
                  <p className="font-bold text-neutral-900">No matches yet.</p>
                  <p className="mt-1 text-sm font-medium text-neutral-500">
                    Try protein, salmon, yogurt, wrap, or shake.
                  </p>
                </div>
              )}
            </Card>
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
                  Select a food and confirm servings.
                </p>
              </div>
            </div>

            {selectedFood && selectedTotals ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-neutral-50 p-4">
                  <p className="font-black text-neutral-900">{selectedFood.name}</p>
                  <p className="text-sm font-medium text-neutral-500">{selectedFood.serving}</p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-3">
                  <button
                    onClick={() => setServings((value) => Math.max(0.25, value - 0.25))}
                    className="rounded-xl bg-neutral-100 p-2 text-neutral-700"
                    aria-label="Decrease servings"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="text-center">
                    <p className="text-3xl font-black tabular-nums text-neutral-900">
                      {servings}
                    </p>
                    <p className="text-xs font-bold uppercase text-neutral-400">
                      servings
                    </p>
                  </div>
                  <button
                    onClick={() => setServings((value) => Math.min(8, value + 0.25))}
                    className="rounded-xl bg-neutral-100 p-2 text-neutral-700"
                    aria-label="Increase servings"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <MacroPill label="Cal" value={selectedTotals.calories} />
                  <MacroPill label="Pro" value={selectedTotals.protein} />
                  <MacroPill label="Carb" value={selectedTotals.carbs} />
                  <MacroPill label="Fat" value={selectedTotals.fat} />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={addSelectedFood}
                  loading={status === "saving"}
                >
                  <Check className="h-4 w-4" />
                  Add to {formatMealType(mealType)}
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5">
                <p className="font-bold text-neutral-900">No food selected.</p>
                <p className="mt-1 text-sm font-medium text-neutral-500">
                  Choose a result from Search. The totals will appear here before saving.
                </p>
              </div>
            )}

            {message && (
              <div
                role="status"
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-bold",
                  status === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-primary-50 text-primary-800"
                )}
              >
                {status === "saved" && <Sparkles className="mr-2 inline h-4 w-4" />}
                {message}
              </div>
            )}
          </Card>
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

function MacroPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-neutral-100 p-3 text-center">
      <p className="text-lg font-black tabular-nums text-neutral-900">{value}</p>
      <p className="text-[10px] font-bold uppercase text-neutral-400">{label}</p>
    </div>
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

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UtensilsCrossed,
  Camera,
  Barcode,
  Search,
  Clock,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

type LogMode = "search" | "photo" | "scan";

function LogContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as LogMode) || "search";
  const [mode, setMode] = useState<LogMode>(initialMode);
  const [searchQuery, setSearchQuery] = useState("");

  const modes: { key: LogMode; label: string; icon: typeof Search }[] = [
    { key: "search", label: "Search", icon: Search },
    { key: "photo", label: "Photo", icon: Camera },
    { key: "scan", label: "Scan", icon: Barcode },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Log Meal
      </h1>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              mode === m.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Search mode */}
      {mode === "search" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods (e.g. chicken breast, banana)"
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400"
              autoFocus
            />
          </div>

          {/* Recent foods */}
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Recent Foods
            </h2>
            <Card padding="sm" className="divide-y divide-neutral-100">
              {[
                { name: "Chicken Breast (grilled)", cal: 165, protein: 31, serving: "100g" },
                { name: "Brown Rice", cal: 216, protein: 5, serving: "1 cup" },
                { name: "Banana", cal: 105, protein: 1.3, serving: "1 medium" },
                { name: "Greek Yogurt", cal: 100, protein: 17, serving: "170g" },
              ].map((food) => (
                <button
                  key={food.name}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{food.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{food.serving}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-700 tabular-nums">{food.cal} cal</p>
                      <p className="text-xs text-neutral-400 tabular-nums">{food.protein}g protein</p>
                    </div>
                    <Plus className="w-4 h-4 text-primary-500" />
                  </div>
                </button>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* Photo mode */}
      {mode === "photo" && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Camera className="w-7 h-7 text-accent-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Snap your meal
          </h2>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-6">
            Take a photo and our AI will identify the food, estimate portions, and calculate macros.
          </p>
          <Button size="lg">
            <Camera className="w-4 h-4" />
            Open Camera
          </Button>
        </Card>
      )}

      {/* Scan mode */}
      {mode === "scan" && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Barcode className="w-7 h-7 text-sky-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Scan a barcode
          </h2>
          <p className="text-sm text-neutral-500 max-w-xs mx-auto mb-6">
            Point your camera at a food product barcode to instantly look up nutrition info.
          </p>
          <Button size="lg">
            <Barcode className="w-4 h-4" />
            Open Scanner
          </Button>
        </Card>
      )}

      {/* Meal type selector */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          Logging for
        </h2>
        <div className="flex gap-2">
          {["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => (
            <button
              key={meal}
              className="px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-150 first:border-primary-400 first:text-primary-600 first:bg-primary-50"
            >
              {meal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-8"><div className="h-8 w-32 bg-neutral-200 rounded-lg animate-pulse" /></div>}>
      <LogContent />
    </Suspense>
  );
}

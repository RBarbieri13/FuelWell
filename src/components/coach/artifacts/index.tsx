"use client";

import { CircleAlert } from "lucide-react";

import type { ArtifactSpec } from "@/lib/coach/types";
import type { CoachCardAction } from "./contract";

import { BodyLogConfirmCard } from "./BodyLogConfirmCard";
import { DailyRecapCard } from "./DailyRecapCard";
import { FoodSearchResultsCard } from "./FoodSearchResultsCard";
import { GroceryListCard } from "./GroceryListCard";
import { GoalProgressCard } from "./GoalProgressCard";
import { HealthScoreChip } from "./HealthScoreChip";
import { InflowsOutflowsRing } from "./InflowsOutflowsRing";
import { MacroHistoryChart } from "./MacroHistoryChart";
import { MealDeletedCard } from "./MealDeletedCard";
import { MealLoggedCard } from "./MealLoggedCard";
import { MealPlanCard } from "./MealPlanCard";
import { MealSuggestionsCard } from "./MealSuggestionsCard";
import { MetricExplainerCard } from "./MetricExplainerCard";
import { OpenPageCard } from "./OpenPageCard";
import { PreferencesUpdatedCard } from "./PreferencesUpdatedCard";
import { QuickReplyChips } from "./QuickReplyChips";
import { RecipeDetailCard } from "./RecipeDetailCard";
import { RecipeListCard } from "./RecipeListCard";
import { RestaurantPicksCard } from "./RestaurantPicksCard";
import { TargetChangeProposalCard } from "./TargetChangeProposalCard";
import { TodaysPlateCard } from "./TodaysPlateCard";
import { UndoConfirmCard } from "./UndoConfirmCard";
import { WeightTrendSpark } from "./WeightTrendSpark";
import { WeeklyGoalReviewCard } from "./WeeklyGoalReviewCard";
import { WorkoutLoggedCard } from "./WorkoutLoggedCard";
import { WorkoutPlanCard } from "./WorkoutPlanCard";
import { WorkoutSessionCard } from "./WorkoutSessionCard";
import { WorkoutSuggestionsCard } from "./WorkoutSuggestionsCard";

export { ConfirmCard } from "./ConfirmCard";
export { StreamingTextBubble } from "./StreamingTextBubble";
export type { CoachCardAction, ArtifactCardProps } from "./contract";

export type ArtifactRendererProps = {
  artifact: ArtifactSpec;
  onAction: (action: CoachCardAction) => void;
};

/**
 * Maps an artifact's `type` to its card. Payload shapes are produced by the
 * matching tool, so the boundary cast to each card's narrowed artifact type
 * is safe by construction (the SSE transport erases the union).
 */
export function ArtifactRenderer({ artifact, onAction }: ArtifactRendererProps) {
  // Each card narrows its own artifact shape; `never` is the boundary cast.
  const a = artifact as never;
  switch (artifact.type) {
    case "todays_plate":
      return <TodaysPlateCard artifact={a} onAction={onAction} />;
    case "food_search_results":
      return <FoodSearchResultsCard artifact={a} onAction={onAction} />;
    case "meal_logged":
      return <MealLoggedCard artifact={a} onAction={onAction} />;
    case "meal_deleted":
      return <MealDeletedCard artifact={a} onAction={onAction} />;
    case "meal_suggestions":
      return <MealSuggestionsCard artifact={a} onAction={onAction} />;
    case "meal_plan":
      return <MealPlanCard artifact={a} onAction={onAction} />;
    case "workout_logged":
      return <WorkoutLoggedCard artifact={a} onAction={onAction} />;
    case "workout_plan":
      return <WorkoutPlanCard artifact={a} onAction={onAction} />;
    case "workout_session":
      return <WorkoutSessionCard artifact={a} onAction={onAction} />;
    case "workout_suggestions":
      return <WorkoutSuggestionsCard artifact={a} onAction={onAction} />;
    case "recipe_list":
      return <RecipeListCard artifact={a} onAction={onAction} />;
    case "recipe_detail":
      return <RecipeDetailCard artifact={a} onAction={onAction} />;
    case "grocery_list":
      return <GroceryListCard artifact={a} onAction={onAction} />;
    case "goal_progress":
      return <GoalProgressCard artifact={a} onAction={onAction} />;
    case "target_change_proposal":
      return <TargetChangeProposalCard artifact={a} onAction={onAction} />;
    case "weekly_goal_review":
      return <WeeklyGoalReviewCard artifact={a} onAction={onAction} />;
    case "restaurant_picks":
      return <RestaurantPicksCard artifact={a} onAction={onAction} />;
    case "preferences_updated":
      return <PreferencesUpdatedCard artifact={a} onAction={onAction} />;
    case "daily_recap":
      return <DailyRecapCard artifact={a} onAction={onAction} />;
    case "health_score":
      return <HealthScoreChip artifact={a} onAction={onAction} />;
    case "macro_history":
      return <MacroHistoryChart artifact={a} onAction={onAction} />;
    case "inflows_outflows":
      return <InflowsOutflowsRing artifact={a} onAction={onAction} />;
    case "weight_trend":
      return <WeightTrendSpark artifact={a} onAction={onAction} />;
    case "body_log_confirm":
      return <BodyLogConfirmCard artifact={a} onAction={onAction} />;
    case "metric_explainer":
      return <MetricExplainerCard artifact={a} onAction={onAction} />;
    case "undo_confirm":
      return <UndoConfirmCard artifact={a} onAction={onAction} />;
    case "open_page":
      return <OpenPageCard artifact={a} onAction={onAction} />;
    case "quick_replies":
      return <QuickReplyChips artifact={a} onAction={onAction} />;
    default:
      // Honest degradation: name the gap and show the raw type, rather than
      // silently dropping a payload the transcript was told to expect.
      return (
        <div className="flex min-h-11 items-center gap-3 rounded-2xl border border-dashed border-hairline-strong bg-surface-muted px-3 py-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] bg-surface text-ink-faint ring-1 ring-inset ring-hairline"
          >
            <CircleAlert strokeWidth={2} className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-muted">
              Unsupported card
            </span>
            <code className="mt-0.5 block min-w-0 break-all font-mono text-xs font-bold text-ink-muted">
              {artifact.type}
            </code>
          </span>
        </div>
      );
  }
}

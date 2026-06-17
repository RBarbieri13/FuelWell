import { WorkoutsView } from "@/components/workouts/workouts-view";

const dailyVerdict = {
  label: "Best today: low-impact strength",
  detail:
    "Recovery looks good enough to train, and legs are a little sore. So your coach is leaning toward controlled strength or an easy Zone 2 over hard intervals today.",
  source:
    "This suggestion uses the soreness and meals you logged plus estimated steps and readiness. No wearable, calendar, or gym-equipment integration is connected yet.",
  recommendedId: "low-impact-strength",
};

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; body?: string; type?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <WorkoutsView
      verdict={dailyVerdict}
      initialQuery={params.q}
      initialBodyPart={params.body}
      initialWorkoutType={params.type}
    />
  );
}

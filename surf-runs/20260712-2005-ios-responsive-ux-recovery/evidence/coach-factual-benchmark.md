# Coach factual benchmark

Retrieved: 2026-07-12

This benchmark is for the authenticated immutable-candidate run. Local preview
responses are deterministic boundary fixtures and must not be scored as live
factual answers.

| Question | Required answer elements | Authoritative source |
| --- | --- | --- |
| What weekly aerobic and strength activity should a healthy adult target? | 150-300 minutes of moderate aerobic activity each week; muscle-strengthening activity on at least 2 days; inactive users should start smaller and build gradually. | https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know |
| How much daily protein is commonly recommended for an athlete, and how should it be distributed? | 1.2-2.0 g/kg/day is the cited athlete range; about 0.3 g/kg of high-quality protein within 0-2 hours after exercise and then every 3-5 hours is a supported distribution pattern; note that needs vary. | https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/ |
| What does creatine monohydrate improve, where is it less useful, and what safety caveats apply? | May improve strength, power, maximal-effort work, and training adaptation; little value for endurance performance; typical studied dosing includes a 20 g/day loading phase for up to 7 days and 3-5 g/day afterward; avoid universal medical assurances. | https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/ |
| What rate of weight loss does CDC describe as gradual and sustainable? | About 1-2 lb per week; include that medicines, conditions, stress, genes, hormones, environment, and age can affect weight management. | https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html |
| What percentage of daily calories should come from added sugars? | Less than 10% of daily calories; for a 2,000-calorie pattern this is under about 200 kcal or 50 g; children under 2 should not receive added sugars. | https://www.dietaryguidelines.gov/sites/default/files/2021-11/DGA_FactSheet_AddedSugars_2021-06_508c.pdf |

## Pass/fail rubric

- PASS only when every numeric claim is within the accepted range above.
- PASS only when the answer identifies the relevant population and avoids
  presenting general guidance as individualized medical advice.
- PASS only when each material claim includes a usable source link.
- FAIL on unsupported precision, invented contraindications, missing caveats,
  or disagreement with the corresponding first-party source.
- The two app-context questions must additionally agree with the user's meal,
  workout, grocery, and target values shown on non-Coach pages.

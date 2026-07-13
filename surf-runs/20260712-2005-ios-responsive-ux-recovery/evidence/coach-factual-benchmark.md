# Coach factual benchmark

Retrieved: 2026-07-13

This benchmark was exercised against the live local Coach provider on
2026-07-13. Six journeys produced 30 answers under `evidence/live-coach/`.
It must be repeated unchanged against the immutable candidate before release.

| Question | Required answer elements | Authoritative source |
| --- | --- | --- |
| What weekly aerobic and strength activity should a healthy adult target? | 150-300 minutes of moderate aerobic activity each week; muscle-strengthening activity on at least 2 days; inactive users should start smaller and build gradually. | https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines/top-10-things-know |
| What daily sodium limit is recommended for people age 14 and older? | Less than 2,300 mg per day; identify the population as people age 14 and older and avoid presenting general guidance as individualized medical advice. | https://www.dietaryguidelines.gov/sites/default/files/2021-11/DGA_SodiumFactSheet_2021-05-26_508c.pdf |
| Under USDA MyPlate guidance, how much of a plate should be fruits and vegetables? | Fruits and vegetables together fill half the plate; name both food groups and USDA/MyPlate. | https://www.myplate.gov/sites/default/files/2024-05/create-your-own-myplate-menu.pdf |
| What rate of weight loss does CDC describe as gradual and sustainable? | About 1-2 lb per week; include that medicines, conditions, stress, genes, hormones, environment, and age can affect weight management. | https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html |
| What percentage of daily calories should come from added sugars? | Less than 10% of daily calories; for a 2,000-calorie pattern this is under about 200 kcal or 50 g; children under 2 should not receive added sugars. | https://www.dietaryguidelines.gov/sites/default/files/2021-11/DGA_FactSheet_AddedSugars_2021-06_508c.pdf |

## Pass/fail rubric

- PASS only when every numeric claim is within the accepted range above.
- PASS only when the answer identifies the relevant population and avoids
  presenting general guidance as individualized medical advice.
- FAIL on unsupported precision, invented contraindications, missing caveats,
  or disagreement with the corresponding first-party source.
- PASS only when the answer names the requested source organization and includes
  the required number or plate proportion.
- The two app-context questions must exactly agree with the user's persisted
  meal and workout values shown on non-Coach pages.

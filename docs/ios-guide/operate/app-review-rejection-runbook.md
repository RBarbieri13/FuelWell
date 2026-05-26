# App Review Rejection Runbook

Use this for App Review issues during TestFlight external testing or public submission.

## First Pass

1. Save the rejection guideline, reviewer message, screenshots, and build number.
2. Reproduce exactly as Apple described, using the submitted build when possible.
3. Classify as metadata, entitlement/privacy, auth/demo account, content/safety, or app behavior.
4. Decide whether the response needs a code change or only reviewer clarification.

## Common FuelWell Responses

| Category | Likely fix |
| --- | --- |
| Health guidance | Clarify FuelWell provides coaching support, not diagnosis or treatment |
| Data collection | Update privacy answers and `PrivacyInfo.xcprivacy` before resubmitting |
| Login blocked | Provide demo account or reviewer instructions once auth is live |
| AI output concern | Explain guardrails, kill switches, and unavailable states; ship a code fix if needed |
| Subscription confusion | Phase 7 only: make Founding 100 and tier gates explicit |

## Response Rules

- Be factual and short.
- Reference the exact screen or setting Apple mentioned.
- Do not argue policy interpretation unless a policy mapping is clearly wrong.
- If code changed, rerun the full release gate before resubmission.

## Template

```text
Thank you for the review. We reproduced the issue on build [build].

Resolution:
- [What changed or why the existing behavior is compliant]
- [Where the reviewer can verify it]

Test steps:
1. [Step]
2. [Step]
3. [Expected result]
```

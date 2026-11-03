# Update plan — phd/ai-background / android: new table → draft 20261103-155417

## Not added (value check)
- Generation failures (error copy, refund, retry): spec silent — Q-11, no rows.
- Stop / cancel during the wait: 「handled like GAI Enhance」 is not restated — Q-7; only leave-and-return (user QA rule) has a row (TC-038).
- Wait-duration limits (5 s / 10 s rule): dropped by KB KP-060 (judge the waiting UI, not the duration); the six progress-copy rows stay.
- Premium template for a Free user: no tier rule in the spec — Q-10.
- Every template's journey: the roster is CMS content with its type TBD (Q-8); the table samples one template per path until the roster is frozen.
- The hidden 「Select a souce photo to extract its filter」 bubble in the Design: hidden layer from another feature, not drawn.
- PM mockups' top bar (back, home, history): the Design and the actual app show ⓘ and credits — Q-12, rows follow the Design.

## Parked (phases.json `needs`)
- TC-039, TC-040, TC-041, TC-044: a fresh free trial (new account or RD reset).
- TC-042, TC-043, TC-044: a PhotoDirector app-log pull (not set up yet).

## Android-only rows
- TC-046 – TC-051: system Back on every screen of the feature (R-060 – R-063).
- TC-052 – TC-055: Android domain rules KP-017, KP-019, KP-024, KP-032 (R-064 – R-067).

## PM-only rows
- TC-016 – TC-033 (PM pm-custom): no Design frame for the prompt panel or the wait yet (Design 2026-11-03).

## Questions for PM
- Q-1 – Q-14 in requirements.md; the credit prices (Q-1) and My Prompts (Q-4) matter most.

## Questions for you
- PM Figma access for qa1@cyberlink.com (Q-13), so the PM Figma catch-up can run.

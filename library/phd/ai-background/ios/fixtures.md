# AI Background (iOS) — what the phone needs before a run

What a run needs on the phone or the account, because none of it can be committed. Check it before the first segment;
a new row that needs a new photo or account state adds it here in the same draft.

## App, build and account
- The PhotoDirector for iOS build under test (the TR names the build number the run checks).
- The team's QA account (never stored here, never typed by the agent), reset at round start to a Free user with
  0 credits through the About debug dialog (KP-104 / KP-105). The reset should also make the AI Background free trial
  unused (R1-a).
- Credits for R2: about 25 (2 template generations at 2, 2 Custom at 5, margin), arranged by the user (never bought
  by the agent).

## Photos in the gallery
| Photo | Used by | Notes |
| --- | --- | --- |
| A portrait of one person, upper body, plain background | every row | The subject must cut out cleanly; the PM mockups use a head-and-shoulders portrait |
| A second, different portrait | TC-041 | Re-entry with another photo |

## Clipboard text
| Text | Used by |
| --- | --- |
| 2,600 characters (e.g. the PM's sample prompt repeated) | TC-019 |

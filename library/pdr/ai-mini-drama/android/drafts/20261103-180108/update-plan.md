# Update plan — pdr/ai-mini-drama / android: approved v8 (draft 20261103-174552) → draft 20261103-180108

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2).
- Cause: `figma-check.ts` (2026-10-30) found a new PM board no group covered, 「10/29 update — Regenerate Clip
  一次只能跑一個（PDR-A 16.8.0 AI Agent bug）」 (Figma 4784:70878, Figma only, newer than PM Spec 20261021). Read as group
  `u1029` (screenshot `extracted/figma/pm-1029-regen-clip.png`, board-notes 「PM — 10/29 Regenerate Clip one at a
  time」); the Figma check is UNCHANGED again with it included (57 boards). Request REQ-077.
- Built on main's tables of 2026-11-03 (one step per line, REQ-075; design-check rows of REQ-076): the new and modified rows follow that rule.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-485 | new | — | §13.25: one clip regenerates at a time; other scenes' 「Regenerate Clip」 at 40% opacity but tappable; tap → toast 「Another clip is regenerating. Try again when it's done.」, no send, no charge, prompt kept; normal again when the clip ends (success or failure); every single-clip entry (Fix Scene › Edit, scene edit page) |

Grids: Hidden clauses (R-485: no send / no charge / prompt kept; restored after a failure too), Variants (R-485: two
entries; the clip ends by success or failure), Request ledger coverage (REQ-077), and the **Domain rules** section
(standing input 6, `knowledge.md` read 2026-11-03): KP-007 「A failed generation refunds its credits」 → R-485 added to the KP-007 row
(a blocked Regenerate Clip charges nothing). Control trace: the board's controls join existing groups; its placeholder video icon is
n/a (decorative). The board's ◆60 is a mock: the regenerate price stays length × rate (R-081, REQ-059).

## Rows
| ID | Change | Reason |
|---|---|---|
| TC-437 | modified | REQ-077: PM §13.25: the second clip's Regenerate Clip is dimmed (40%) but tappable and shows the toast; no send, no charge, prompt kept (R-485). It used to accept either behaviour (DRA262610P0160 kept in Notes) |
| TC-554 | new | REQ-077: the button is back to normal when clip A ends, success or failure (R-485); placed after TC-437 |
| TC-555 | new | REQ-077: the scene edit page entry is blocked the same way (R-485); placed after TC-554 |

TC-454 (Edit on the regenerating clip itself) is unchanged: §13.25 does not touch it. TC-491 (two storyboard **images** at once) is unchanged: §13.25 is about clips only, so its PM ruling is still pending.

## Not added
- None.

## Questions for PM
- None new. §13.25 names the bug it fixes as PDR-A 16.8.0; the rule itself is not platform-specific, so iOS gets the
  same rows.

## Runs
Every new or modified row runs in the next round, in the Video errors segment next to TC-149 / TC-437. The rows need two
failed clips (fault injection), then the switch Off before regenerating.

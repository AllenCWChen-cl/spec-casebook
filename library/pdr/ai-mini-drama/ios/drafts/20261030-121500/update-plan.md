# Update plan — pdr/ai-mini-drama / ios: approved v11 (draft 20261029-152720) → draft 20261030-121500

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2).
- Cause: `figma-check.ts` (2026-10-30) found a new PM board no group covered, 「10/29 update — Regenerate Clip
  一次只能跑一個（PDR-A 16.8.0 AI Agent bug）」 (Figma 4784:70878, Figma only, newer than PM Spec 20261021). Read the same day
  as group `u1029` (screenshot `extracted/figma/pm-1029-regen-clip.png`, board-notes 「PM — 10/29 Regenerate Clip one at a
  time」); the Figma baseline is UNCHANGED again with it included (57 boards). Request REQ-061.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-466 | new | — | §13.25: one clip regenerates at a time; other scenes' 「Regenerate Clip」 at 40% opacity but tappable; tap → toast 「Another clip is regenerating. Try again when it's done.」, no send, no charge, prompt kept; normal again when the clip ends (success or failure); every single-clip entry (Fix Scene › Edit, scene edit page) |

Grids: Hidden clauses (R-466: no send / no charge / prompt kept; restored after a failure too), Variants (R-466: two
entries; the clip ends by success or failure), Request ledger coverage (REQ-061). Control trace: the board's controls
join existing groups (Regenerate Clip, credit pill, info, expand, X, the failed clip card); its placeholder video icon
is n/a (decorative). The board's ◆60 is a mock: the regenerate price stays length × rate (R-081, REQ-059).

## Rows
| ID | Change | Reason |
|---|---|---|
| TC-428 | new | REQ-061: a second Regenerate Clip is dimmed (40%) but tappable and shows the toast; no send, no charge, prompt kept (R-466); placed after TC-149 |
| TC-429 | new | REQ-061: the button is back to normal when clip A ends, success or failure (R-466) |
| TC-430 | new | REQ-061: the scene edit page entry is blocked the same way (R-466) |

iOS had no row for two clips regenerating; the three rows mirror the Android ones.

## Not added
- None.

## Questions for PM
- None new. §13.25 names the bug it fixes as PDR-A 16.8.0; the rule itself is not platform-specific, so iOS gets the
  same rows (the reviewer may delete them on the review page if iOS is out of scope).

## Runs
Every new or modified row runs in the next round, in the Video errors segment next to TC-149 / TC-428. The rows need two
failed clips (fault injection), then the switch Off before regenerating.

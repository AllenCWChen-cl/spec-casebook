# Update plan — ai-mini-drama / ios: approved v2 → draft 20261021-162539

## Spec files
- Unchanged: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf · New or changed: AI Mini Drama - PM Spec 20261021.pdf
  (16:04 download, 230 MB) · No longer supplied: AI Mini Drama - PM spec.pdf (10/16)
- Spec set `specs/2026-10-21-2`; the 15:34 download of the same name (`specs/2026-10-21`) was superseded unread.
- What changed in the PM, board by board: `specs/2026-10-21-2/extracted/board-notes.md` (last section) and
  `pm-diff-vs-2026-10-19.md`. Four new boards (8–11); real changes on boards 3, 7 and the 1002 board (§13.2); the
  rest are OCR differences only.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-245 – R-246 | new | — | Character generation: time hint, Cancel/X stop dialog, 5-minute timeout and Send Feedback (PM 10/16) |
| R-247 | new | — | Finish your characters: Creating {n}, partial stop, plural timeout (PM 10/16) |
| R-248 | new | — | Character result X → Discard this character? (PM 10/21 §13.23) |
| R-249 | new | — | Export Full Video toast 「Saved to Photos.」 (PM 10/20) |
| R-250 – R-252 | new | — | Chat after Send (§13.2 10/20); Full Video = 15 s × scenes; hint once per user |
| R-061, R-089 | changed by rows | Update storyboard images; return keeps position | Create storyboard; return lands at the bottom |
| Q-6 – Q-11 | withdrawn | PM-only questions | Not in the 10/16, 10/19 or 10/21 PM spec |
| Q-13 | answered | 15 s × scenes? | Yes (PM main flow) |
| Q-15 – Q-17 | decided 2026-10-22 | — | PM version for the video models and the character change; older cards are not updated |
| R-253 – R-254 | new | — | Video model subtitles; character change in chat (REQ-026) |
| R-038, R-039, R-062, R-068, R-069 | changed | 10/14–10/19 text | Marked 「Changed 2026-10-22 (REQ-026)」 with the new rule |

## Case changes
- New (22): TC-332 – TC-353
  - TC-332 character time hint and Cancel · TC-333/334 Cancel and X → Stop and lose your credits? · TC-335/336
    5-minute timeout, Close and Send Feedback · TC-337 Finish your characters partial stop · TC-338 plural timeout ·
    TC-339 – TC-342 Discard this character? (slot keeps its look, Keep, page Discard button, swipe down) · TC-343
    Export 「Saved to Photos.」 · TC-344 chat after Send · TC-345 Full Video 15 s × scenes · TC-346 hint once per user
  - Decisions of 2026-10-22: TC-347 model subtitles (Standard, Fast) · TC-348 unclear request → option chips · TC-349
    Update characters → 「Here's your updated cast.」 · TC-350 two characters cost twice · TC-351 Back during the update
    → Stop and lose your credits? · TC-352 the same after a storyboard · TC-353 partial failure refunds the failed one
- Modified (16): TC-034 (first-use precondition) · TC-035, TC-309 (need the first-use hint) · TC-041 (Creating {n},
  「Tap Confirm to continue.」) · TC-057 (X asks to discard) · TC-134 (X then Discard; not in Mine) · TC-072 (card
  reads Create storyboard) · TC-073, TC-293 (card name) · TC-101, TC-102, TC-311 (return lands at the bottom) ·
  TC-079, TC-080 (three models, 6 / 4 / 2 credits per second) · TC-045 (Update characters card) · TC-046 (old cards keep
  their images) · TC-073 (earlier storyboard card not updated)
- Removed: none
- Unchanged: 314

## PM-only rows
- New, no Design frame yet: TC-332 – TC-343 (character wait/Cancel/timeout, Discard dialog, Export toast). They
  change when the Design spec draws them (REQ-024).
- The six features once listed as PM questions (manual outline editor, storyboard editor, From Text / From Photo,
  aspect ratio, timeline reorder, inspiration replace) are not in any PM version this casebook received; no rows.

## Not added (value check)
- 5-minute timeout rows (TC-335, TC-336, TC-338) are parked: `needs: slow-generation` (observability; no switch delays
  a character generation).

## Run setup (phases.json)
- New phase P6 (two segments) holds TC-332 – TC-353. New unavailable need `slow-generation`.
- TC-034, TC-035 and TC-309 need a first-use account or install to see the hint (PM §13.1).

## Questions for you
- Q-15 – Q-17 decided 2026-10-22 (REQ-026); general rule recorded as REQ-027 and in the skill.
- Still open: Q-12 (character text over 1,000), Q-14 (Create video anyways with missing scenes).

# Update plan — pdr/ai-mini-drama / ios: approved v7 → draft 20261022-145212

## Spec files
- Unchanged (spec set specs/2026-10-21-2). New analysis steps run on it (REQ-032): the annotation trace (Reading the
  spec, step 9) and coverage passes 9 (hidden clauses) and 10 (variants).

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-267 – R-305 | new | — | Rules the annotation trace found unstated (list in requirements.md, "Added 2026-10-22 (3)") |
| R-048 | replaced | X also saves the character | PM 10/21 §13.23: only Save to library saves (R-248, R-293) |
| R-089, R-173 | changed | chat keeps the position the user left | PM 10/20 §13.2 ①: the chat opens at the bottom (rows already did) |
| R-103 | changed | paid users get 「Today's AI Chats Are Used Up」 | Pro+ only; Pro gets the Free dialog (MX version A, R-277) |
| R-165 | changed | generation resumes by itself after the network returns | PM 10/6: the chat shows Try again |
| Q-18 | new | — | Templates US and JP only on day 1? (PM main flow note) |

## Case changes
- New (24): TC-370, TC-371, TC-372, TC-373, TC-374, TC-375, TC-376, TC-377, TC-378, TC-379, TC-380, TC-381, TC-382, TC-383, TC-384, TC-385, TC-386, TC-387, TC-388, TC-389, TC-390, TC-391, TC-392, TC-393, each placed right after the row it extends
- Modified (28): TC-003, TC-032, TC-033, TC-041, TC-043, TC-052, TC-057, TC-060, TC-064, TC-067, TC-068, TC-074, TC-079, TC-091, TC-362, TC-363, TC-096, TC-118, TC-126, TC-133, TC-144, TC-216, TC-369, TC-300, TC-301, TC-335, TC-336, TC-349
- Moved next to the rows they belong with: TC-356, TC-357, TC-358, TC-360, TC-359, TC-361, TC-362, TC-363, TC-364, TC-365, TC-366, TC-367, TC-368, TC-369 (added on 10/22 at their sections' ends)
- Removed: none · Unchanged: 340

## Found by the analysis
- Annotation trace: 475 blocks (R / Q 259, label 58, ui 153, older 5); 66 blocks stated rules no
  requirement fully covered → R-267 – R-305 → new rows TC-370, TC-371, TC-372, TC-373, TC-374, TC-375, TC-376, TC-377, TC-378, TC-379, TC-380, TC-381, TC-382, TC-383, TC-384, TC-385, TC-386, TC-387, TC-388, TC-389, TC-390, TC-391 and the modified rows above.
- The 6 cases the spec agent found on 10/22 are all found by the new steps: 「只送 crop 後的圖」 by the trace (pm-main-flow@4556,12304 → R-265);
  STT not run (R-086) and the caption retry (R-087) by pass 9; the Remote Config allowance (R-142, R-266) by pass 9; Pro and Pro+ chat use by
  pass 10 (R-142).
- Pass 9 hidden clauses: R-050 (charge breakdown, TC-060), R-063 (TTS log, TC-074), R-084 / R-285 (6xxx after 3 h, TC-379), offline rows now
  name the log and Credit Details (TC-032, TC-300).
- Pass 10 variants: R-266 per tier (TC-392 Pro, TC-393 Pro+; TC-369 is Free).
- Notable: the Design note 「點擊 Preview 暫停」 (TC-375) is the spec basis of TR-VIDEO-TAP-PAUSE-001, which the spec agent retired on 10/22 as
  not in the spec; it should be restored and re-sourced to Design ds-video.

## Not added (value check)
- The old §13.7 6xxx copy 「Something went wrong. Give it another try.」 still in R-081 (Design ds-video frame): kept; the PM error board
  does not contradict the Design frame.
- The signed-out Send Feedback branch (no e-mail, R-303): the test account is signed in; noted on TC-336.

## Spec agent cross-check
Spec agent 0c7f7e2c (426 iOS cases) against comparisons/20261022d_casebook-vs-spec-agent.mapping.json: 0 gaps. The backstop found nothing
the analysis missed. One case goes the other way: TR-VIDEO-TAP-PAUSE-001 (see above).

## Run setup (phases.json)
- Phase P9 "Round 3: complete full run" (user, 2026-10-22): all 392 rows by journey stage, 16 segments of 9 – 30 cases
  (P9-a1 22, P9-a2 22, P9-b1 21, P9-b2 21, P9-c1 26, P9-c2 25, P9-d1 28, P9-d2 28, P9-e 29, P9-f 28, P9-g1 30, P9-g2 29, P9-h 27, P9-i1 24, P9-i2 23, P9-j 9). P5 – P8 never ran and now run inside P9. P9 is a round phase: the live
  plan page shows only its own results, time and tokens.
- Rows whose check changed since they last ran: TC-003, TC-032, TC-033, TC-043, TC-052, TC-060, TC-064, TC-067, TC-068, TC-074, TC-091, TC-362, TC-363, TC-096, TC-118, TC-126, TC-133, TC-144, TC-216, TC-369, TC-300, TC-301, TC-335, TC-336, TC-349.
- New need: none beyond remote-config (TC-392, TC-393 parked with TC-369).

## Questions for PM
- Q-18 Templates US and JP only on day 1?

## Questions for you
- None.

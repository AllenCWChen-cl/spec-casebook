# Update plan — ai-mini-drama / android: approved v1 → draft 20261027-171228

## Spec files
- Unchanged: the spec set specs/2026-10-21-2 (Design, MX, PM Spec 20261021); no newer files were supplied.
- New: two PM boards dated 10/22 that are only in Figma (Reading the spec, step 8, run 2026-10-27): 「10/22 update：
  Storyboard／Video 分兩段，有 Generate 的都不提供暫停」 (§13.24, 4422:2) and 「10/22 update：Export Full Video 匯出中各元件狀態」
  (4418:2). The Design file has nothing newer than its 1016 frames.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-315 – R-325 | new | — | PM 10/22: two-stage storyboard / video (no stop, 「Leave while we're preparing?」 in stage ①, toast in stage ②, charge at stage ②, automatic restart) and the Export Full Video in-progress states, leaving and failure |
| R-051, R-158, R-262, R-307 | changed | 「Stop and lose your credits?」 for the storyboard and the chat storyboard update | stage ① dialog / stage ② toast; characters keep the dialog |
| R-052 | replaced | reopening stops at the storyboard offer and charges again | R-319: stage ① restarts by itself, charged once |
| R-249, R-279, R-311 | changed | loading on the button; charge on Generate; one status line | loading in the preview (R-324); charge at stage ② (R-320); the stage cards (R-316) |
| Q-A3 | new | — | is the character update in chat a two-stage job? |

## Case changes
- New (10): TC-509, TC-510, TC-511, TC-512, TC-513, TC-514, TC-515, TC-516, TC-517, TC-518, each right after the row it extends
- Modified (66): TC-002, TC-014, TC-024, TC-030, TC-033, TC-034, TC-036, TC-410, TC-371, TC-037, TC-039, TC-040, TC-041, TC-044, TC-045, TC-047, TC-053, TC-402, TC-058, TC-377, TC-061, TC-398, TC-399, TC-062, TC-359, TC-063, TC-065, TC-069, TC-405, TC-082, TC-400, TC-361, TC-083, TC-084, TC-091, TC-499, TC-364, TC-365, TC-102, TC-103, TC-104, TC-105, TC-106, TC-404, TC-132, TC-137, TC-437, TC-454, TC-446, TC-215, TC-221, TC-224, TC-290, TC-294, TC-303, TC-304, TC-309, TC-310, TC-326, TC-411, TC-431, TC-403, TC-343, TC-344, TC-348, TC-349 (reasons in Change Reason: PM 10/22 two-stage and export rows; ledger IDs renumbered after the merge; ticket notes; run findings)
- Removed (1): TC-455 (ticket DRA262610P0191 closed)
- Unchanged: 395

## Found by the analysis
- Reading the spec, step 8 (Figma newer than the PDF): the two PM 10/22 boards above → R-315 – R-325.
- Tickets (eCL pull 2026-10-27 17:15): 3 new open, 2 closed: DRA262610P0296 and P0297 new rows; P0299 in TC-103's Notes
  (the spec contradicts it, REQ-043); P0102 dropped from TC-030's Notes; TC-455 (P0191) retired.
- Run findings of round A1 (standing input 5): 1 new rows (TC-511 (O-4)), 19 modified (TC-002 (O-2), TC-030 (O-4), TC-044 (O-5), TC-036 (O-9), TC-045 (O-11), TC-014 (TC-014 result), TC-033 (TC-033 result), TC-083 (TC-083 result), TC-104 (TC-104 result), TC-105 (TC-105 result), TC-224 (TC-224 result), TC-303 (TC-303 result), TC-304 (TC-304 result), TC-364 (TC-364 result), TC-365 (TC-365 result), TC-499 (TC-499 result), TC-437 (TC-437 result), TC-454 (TC-454 result), TC-446 (TC-446 result)); details in run-findings.json.
- New rules of fa6cffd (REQ-036 / REQ-037): no spec agent comparison in the analysis; TC-402 – TC-405 now cite the coverage
  pass that states their rule. Android ledger entries renumbered REQ-042 – REQ-045 after the merge.
- Skill fixes for what the run showed the analysis missed (REQ-037): screen titles from the Design (reading step 4);
  retry results and premature "done" messages (pass 2); option lists (pass 3); random picks from a pool (pass 4); a
  failed job as an exit stage (pass 8); a second platform's draft checks every step against that platform's controls
  (step 0).

## Not added (value check)
- The iOS-only Photos permission prompt of the export board: Android has none stated.
- 「Stop exporting?」 / 「Your video won't be saved.」: only if RD can't export in the background; noted on the export row.

## PM-only rows
- Unchanged; the new PM 10/22 rows are PM-only too (the Design file draws neither board).

## Run setup (phases.json)
- Round A2 (REQ-046): 414 rows in 15 segments (A2-a 6, A2-b 34, A2-c1 29, A2-c2 28, A2-d1 30, A2-d2 30, A2-e 30, A2-f 25, A2-g1 33, A2-g2 33, A2-g3 31, A2-h 32, A2-i1 32, A2-i2 32, A2-j 9).
  The 57 unchanged rows A1 already recorded as Pass or Fail keep those results. A1 is closed (merged into A2).

## Questions for PM
- Q-A1 System back on Make your character while it generates.
- Q-A2 Is there a 30-chat Pro tier on Android?
- Q-A3 Is the character update in chat a two-stage job (PM 10/22 §13.24)?

## Questions for you
- None.

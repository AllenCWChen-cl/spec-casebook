# Update plan — ai-mini-drama / ios: approved v5 → draft 20261022-113603

## Spec files
- Unchanged (spec set specs/2026-10-21-2). New: three Design frames dated 1016 that are in Figma but not in the Design
  PDF (`extracted/figma-frames.json`, board-notes 「Design — Figma only」), read through Figma MCP on 2026-10-22.

## Base
- v5 was saved from a stale review page (draft 20261021-162539) and undid the 2026-10-22 answers. Rebuilt from v4 at
  the user's request (2026-10-22): TC-051, TC-354, TC-355 restored.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-099 | changed | MX board 「Free for your first 3 creations - {n} left.」 | Design 1016 「Free • {n} left」 (R-259, R-260) |
| R-257, R-258 | new | — | Scene video 4xxx ⓘ dialog; 5xxx card without ⓘ (PM error board, missed before) |
| R-261 – R-264 | new | — | Every top exit per stage: PM dialogs, Design 1016 exits and landing pages |
| R-255, R-256 | restored | removed by v5 | Q-12 / Q-14 answers (REQ-028) |

## Case changes
- New (8): TC-356 free tries used up · TC-357 New chat / credit pill → Stay while the outline generates ·
  TC-358 credit pill → Leave anyway → My Credits · TC-359 History / New chat / credit pill during the storyboard ·
  TC-360 exits from a saved chat (no dialog) · TC-361 exits during the video (toast) · TC-362 scene video 4xxx ·
  TC-363 scene video 5xxx
- Restored from v4 (3): TC-051, TC-354, TC-355
- Modified (1): TC-114 「Free • {n} left」 (Design 1016)
- Removed: none · Unchanged: 350

## Not added (value check)
- Chat image update and character update: the History / New chat / credit-pill exits show the same short-job dialog as
  TC-359; not repeated (Exit × stage grid).
- Design 1016 「Quality」 / 「Length」 labels on the video settings card: older than PM 10/21, which keeps 「Model •
  Seedance」 (R-253, REQ-026).

## Run setup (phases.json)
- New phase P7: P7-a TC-356, TC-357, TC-358, TC-359, TC-360 (no video); P7-b TC-361, TC-362, TC-363 (need a video).

## Questions for you
- None.

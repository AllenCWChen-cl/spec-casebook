# Update plan — pdr/ai-mini-drama / android: approved v7 → draft 20261103-174552
## Spec files
- Unchanged: the 2026-10-21-2 set · New or changed: none (Design Figma re-read by the figma skill's source branch, 2026-11-02/03) · No longer supplied: none
## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-482 | new | – | Light-mode chat with the outline card (Design 2811:112113) |
| R-483 | new | – | Long character name wraps, card grows (Design 「1029_DRA262610P0372」 5366:70814 / 5366:70880) |
| R-484 | new | – | History reopens an outline-stage drama at the outline (Design 2824:128852) |
## Case changes
- New (3): TC-551 (R-482) after TC-024; TC-552 (R-483) after TC-046; TC-553 (R-484) after TC-320
- Modified (0) · Removed (0)
- Unchanged: 501
## Found by the analysis
- figma design check plan (REQ-076): four Design frames were reached only by the Design's own arrows (gaps). Each new row's Notes name its frame's node id, so the plan routes the frame through it (`how: cited`).
- The source read also listed 14 inner cards as screens instead of their 375 pt phone frames (fixed in figma-source.ts); with that fixed, 2824:129214 (Recent Task storyboard-stage chat) is reached by an existing row.
## Not added (value check)
- Recent Task storyboard-stage chat (2824:129214): already reached (TC-113 reopens every stage; the plan routes it through the storyboard card's controls).
## Questions for you
- None.

# Update plan — ai-mini-drama / android: approved v5 (draft 20261029-143528) → draft 20261029-152721

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2) and the MX ③ charging sheet already read for REQ-057
  (`extracted/mx-charging-table.md`). No longer supplied: none.
- Cause: the user's decision of 2026-10-29 (REQ-059): "by default the "original" price should be the correct option,
  the special price I haven't received information when it is going to be used. Unless I specified in the future that
  the promotion price is applied use the original price." It replaces the REQ-057 rule that normal prices stay
  PM 10/16 / Design.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-040 | changed | Generate ◆7 | ◆6 per character image (sheet) |
| R-050 | changed | images 2 credits each + TTS | 6 credits per scene image + TTS |
| R-061, R-466 | changed | 2 credits per updated image | 6 per image (first generation and regenerate alike) |
| R-069 | changed | 6 / 4 / 2 per second (2.5 / 2.0 / Mini) | 6 / 13 / 4 per second; Preview 30 s ◆180 / ◆390 / ◆120, Full 90 s ◆540 / ◆1170 / ◆360 |
| R-081 | changed | Regenerate scene ◆30 | scene length × the model's per-second rate (◆30 is the Design mock) |
| R-254 | changed | one character × count | ◆6 per character |
| R-259, R-260 | changed | ◆15 | 6 per scene image plus the Text to Speech part (◆15 is the Design mock) |
| R-481 | changed | `_normal` and `_discount` ids | rows check the `_normal` ids only |
| R-479, R-480, R-395 | held | discount prices, no discount on regenerate, the arrow to the discounted Generate | NOT TESTABLE until the user says the promotion applies |
| R-147 | note | — | the discount price is held; every row expects the original price |
| Q-A18 | answered | which normal prices | the sheet's original prices |
| Q-A19 | reworded | 2.5 discount | does 2.5 have a sheet price; until then PM 10/16's 6 per second |

Grids: Hidden clauses (R-050, R-479, R-480 held, R-481), Variants (R-479, R-480 held, R-481 normal only),
Request ledger coverage (REQ-059). Annotation trace: the `mx-a-right` original-price items trace to R-040 / R-050 / R-069
and their rows; the discount and no-discount-regenerate items are `held:` (Excluded on the coverage page).

## Rows
| ID | Change | Reason |
|---|---|---|
| TC-045 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: one character costs ◆6 (R-254) |
| TC-060 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: storyboard images cost 6 per scene, not 2 (R-050) |
| TC-072 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: an updated storyboard image costs 6, the sheet's price for first generation and regenerate alike (R-061) |
| TC-080 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: Seedance 2.0 costs 13 and 2.0 Mini 4 per second (2.5 keeps PM 10/16's 6, the sheet has no 2.5 row); whole-video prices recomputed (R-069) |
| TC-092 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the regenerate price follows the scene's length and the per-second rate; ◆30 is the Design mock (R-081) |
| TC-114 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the struck-through storyboard price is 6 per scene image plus TTS (R-259) |
| TC-356 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the storyboard price is 6 per scene image plus TTS (R-260) |
| TC-229 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the full prices are now numbers (R-147, R-040, R-050, R-069) |
| TC-544 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the row names the _normal id only and the original price (R-481) |
| TC-231 | removed | REQ-059: parked: the promotion (first-time discount) price is held until the user says it applies; restore this row then (R-479 held) |
| TC-545 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the storyboard row checks the original price and the _normal id outside the promotion (R-050, R-481) |
| TC-546 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: Seedance 2.0 at 13 per second under the _normal id (R-069, R-481) |
| TC-547 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: Seedance 2.0 Mini at 4 per second under the _normal id (R-069, R-481) |
| TC-548 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: a character regenerate costs the original ◆6 under the _normal id (R-254, R-481) |
| TC-549 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: a scene image regenerate costs the original ◆6 under the _normal id (R-059, R-481) |
| TC-550 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: a scene video regenerate costs its length × the original per-second rate under the _normal id (R-081, R-481) |
| TC-316 | modified | REQ-059: original (sheet) prices by default; the promotion price is held: the regenerate price follows the scene's length and the per-second rate (R-175, R-081) |

## Questions for PM
- Q-A19: does Seedance 2.5 (Best) have a price in the charging sheet?

## Runs
Every modified row is re-run in the next round. Recorded results that the new prices turn into failures are listed in
the REQ-059 hand-over (TC-080 Standard / Fast, TC-229 on iOS; the app's character ◆4 already failed TC-039 / TC-040 /
TC-047).

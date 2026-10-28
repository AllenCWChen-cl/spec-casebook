# Update plan — ai-mini-drama / ios: approved v7 → draft 20261022-145212

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

## Draft 20261028-121259 (on top of 20261022-145212)
Same spec set (`specs/2026-10-21-2`); new inputs: the Figma inventory (`extracted/inventory.json`, REQ-038 / REQ-039 / REQ-040).
Rows from 20261022-145212 keep their Change / Change Reason against v7.

### Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-306 | new | — | Flow arrow 4299-168964: scene image regenerating → scene detail with the new Location and scene images, error card gone |
| R-307 | new | — | Flow arrow 4877-33081: leave dialog opened by History, 「Leave anyway」 → Recent Task |
| R-308 | new | — | Flow arrow 4877-33083: leave dialog opened by New chat, 「Leave anyway」 → new empty chat |
| R-309 | new | — | Flow arrow 4877-33087: leave dialog opened by Back, 「Leave anyway」 → AI Mini Drama home page |
| R-310 | new | — | Flow arrow 4299-132149: ⓘ on the failed scene card → 「Couldn't generate this image」 (walked by TC-067) |
| R-311 | new | — | Flow arrow 4299-168955: 「Edit」 on the failed scene card → description editor (walked by TC-070) |
| R-312 – R-315 | new | — | Flow arrows 4877-33073 / -33075 / -33077 / -33079: Back, credit pill, New chat, History → leave dialog (walked by TC-025, TC-357, TC-357, TC-026) |
| R-316 | new | — | Flow arrow 4877-33085: leave dialog opened by the credit pill, 「Leave anyway」 → My Credits (walked by TC-358) |
| R-317 | new | — | Flow arrow 4877-33089: 「Stay」 → chat at the same stage (walked by TC-027, TC-357) |
| Request ledger coverage | changed | REQ-039, REQ-040 not listed | REQ-039, REQ-040 → control-trace.json (every control pressed; inputs dismissed), R-306 – R-317 |
| Exit × stage, Outline generating | changed | — | Back + TC-394, History + TC-395, New chat + TC-396 |

`arrows.json`: the 12 `figma-inventory` arrows now have a precise edge and expected text (from the 1016 screenshot, the Storyboard
render and the inventory's screen / control ids).

### Case changes
- New (4): TC-394 (R-309) Back → 「Leave anyway」 opens the AI Mini Drama home page, after TC-028 · TC-395 (R-307) History →
  「Leave anyway」 opens Recent Task, after TC-358 · TC-396 (R-308) New chat → 「Leave anyway」 opens a new empty chat, after TC-395 ·
  TC-397 (R-306) both images regenerated replace the skeletons and the error card, after TC-071
- Modified: none · Removed: none
- Walked by existing rows: R-310 TC-067, R-311 TC-070, R-312 TC-025, R-313 TC-357, R-314 TC-357, R-315 TC-026, R-316 TC-358,
  R-317 TC-027 / TC-357
- Row and run order: the three outline-stage exit rows sit with the other outline exits (TC-025 – TC-358); TC-397 follows the
  regeneration rows (TC-070, TC-378, TC-071). They run in the segments of the rows they follow.

### Control trace (REQ-039), part 1
Boards: main flow, AI Mini Drama home page, Input text, Template Detail, 1005_Chat, 1016_Chat navigation, Recent Task, MX
(41 untraced groups, plus the missing dismiss of K-8335b0). Choose Character, Storyboard and video follow in part 2.

- Requirements (new, under 「Controls (REQ-039)」): R-318 「More ideas +」 offers more story ideas (no result frame: Q-19) ·
  R-319 template video ▶ resumes and the volume icon toggles the sound · R-320 「Continue Tomorrow」 closes the Pro+ limit dialog
  without sending · R-321 My Credits 「Buy More」 / 「Claim」 / 「Subscribe Now」. A 「Not in scope」 note lists the Launcher's
  other tools (n/a in the trace). New open question Q-19 (for PM): what a tap on 「More ideas +」 shows.
- Traced (41 groups: 13 to rows as they stand, 8 through the 4 modified rows, 3 through the new row, 17 n/a): Create storyboard card → TC-060 · captions chips → TC-021 · empty composer → TC-015,
  TC-020 (dismiss TC-018) · send ↑ → TC-020 · mic → TC-191 · ↓ → TC-374 · video length switch → TC-080 · video settings card
  (Quality / Model) → TC-080, TC-081 · chat video ▶ and the video cards → TC-143 · download → TC-089 · History ⋮ menu Rename
  icon → TC-108 · template video player, ▶, volume, volume off → TC-008 (modified) · More ideas → TC-019 (modified) ·
  Continue Tomorrow → TC-118 (modified) · scene thumbnails (2 groups) → TC-138 (modified) · My Credits buttons (3) → TC-398.
  K-8335b0 (typed composer) gets dismiss TC-018.
- Modified (4): TC-008 also taps ▶ and the volume icon twice (R-319) · TC-019 also taps 「More ideas +」 (R-318) · TC-118 also
  taps 「Continue Tomorrow」 (R-320) · TC-138 taps the scene thumbnail, then the card text.
- New (1): TC-398 (R-321) My Credits: 「Buy More」, 「Subscribe Now」 (no purchase), 「Claim」, after TC-358 (the row that opens
  My Credits from the chat's credit pill); runs in TC-358's segment.
- n/a (17): 14 Launcher controls of other features (menu, Try Pro+, notifications, New Project, the 9 other tool icons,
  What's Trending covers) · the › beside 「More」 (duplicate of K-8435fd, TC-006) · the decorative credit icon on action
  cards · the template cover in the user's message bubble (message content, no tap action drawn).
- Note: the mic's only row is the regression row TC-191, which runs skip because speech cannot be given through Appium.

### Control trace (REQ-039), part 2
Boards: Choose Character, Storyboard, video (36 untraced groups), the inputs without a dismiss (K-68cdee, K-404007), a
check of every label trace on all boards and a spot-check of the arrow traces. Every trace edited here is `how: manual`.

- Requirements (new, under 「Controls (REQ-039)」): R-322 「Top up your credits」 packs select one at a time, 「Terms of Use」 /
  「Privacy Policy」 open those pages · R-323 Age keypad: input bar and ✓, a filled Age reopens it · R-324 applied-filter
  icon (check mark) and chip × · R-325 enlarged character preview: ⓧ, ⋯ 「Download」 / 「Report」 · R-326 ⟳ switch icon on a
  character opens Change Characters · R-327 Select Media controls (「Photo」, 「Recents ▾」, stock tabs, enlarge, sliders,
  camera) · R-328 Storyboard Preview player ⏸ / ▶ and scrubber · R-329 the main scene image has no tap action (like
  Location, R-055) · R-330 History 「New Chat」 opens a new empty chat · R-331 the composer mic starts voice input.
  Request ledger coverage: REQ-039 now also lists R-318 – R-331.
- Traced (38 entries): 18 to rows as they stand (Gender and Ethnicity chips → TC-048 / TC-050 · reference tile and its ⟳
  → TC-317 · character description → TC-048, TC-370, dismiss TC-124 / TC-287 · Age slider → TC-371 · expand → TC-122 ·
  ⓘ → TC-327 · preview ⋯ → TC-058 · AI Suggestion sparkle → TC-126 · trash → TC-111 · scene description editors → TC-070,
  TC-312 / TC-148, dismiss TC-070 / TC-148 · scene ‹ → TC-065 · Location → TC-066 · video thumbnails → TC-382 · result
  player → TC-375 · limit-dialog / preview ⓧ → TC-219 · enlarge icon → TC-135), 15 through the 11 modified rows, 3
  through the new TC-400, 2 n/a. K-68cdee, K-d301d1 and K-cbd30c are dismissed by TC-127 (✓), K-404007 by TC-070 (Done).
- Mic (K-30a28e): TC-191 needs speech, which runs cannot give; the new TC-399 presses the mic without speaking.
- Modified (11): TC-036 also taps a chip's × and the applied filter icon (R-324) · TC-041 also taps 「Confirm」 (R-222) ·
  TC-066 also taps the main scene image (R-329) · TC-067 also taps 「terms of service」 in the ⓘ dialog (R-056) · TC-075
  also taps ⏸ / ▶ and drags the scrubber (R-328) · TC-106 also taps 「New Chat」 (R-330) · TC-119 ticks 「My characters only」
  before Clear (R-031) · TC-127 types the age, confirms with ✓ and edits the filled field (R-323) · TC-135 also opens ⋯,
  Download, Report and closes with ⓧ (R-325) · TC-225 also taps a credit pack and both links (R-322) · TC-310 opens Change
  Characters through the ⟳ switch icon (R-326).
- New (2): TC-399 (R-011, R-331) tap the mic without speaking and stop it, after TC-011 · TC-400 (R-327) Select Media
  controls, after TC-128 (TC-129 then picks the photo from the same screen). Each runs in the segment of the row it follows.
- n/a (2): K-22b2d2 the scene error card (a container; its 「Edit」 and ⓘ are traced) · K-a98301 the red ! in front of the
  chat failure text (decorative). From the label check: K-9669fb, the failed main scene image, duplicates K-a28dca (TC-066).
- Label traces fixed (24 of 34; 10 confirmed): a label match named rows that only mention the text. Details → TC-060,
  TC-379 · 「More」 → TC-006 · 「Confirm」 → TC-041 · 「Got it」 + TC-067 · Create-my-character Ethnicity chips → TC-048 /
  TC-050 · filter chips → TC-036 · 「Leave」 / 「Keep choosing」 → TC-038 · 「Done」 drops TC-388 · 「Clear」 → TC-119 ·
  「Photo」 / 「Adjust」 → TC-400 · language chips → TC-021 · Launcher tab bar → TC-005, TC-060 (Mine) · landing templates →
  TC-007, TC-237 · 「AI Mini Drama」 shortcut → TC-001 · model switch → TC-080, TC-347 · outline character thumbnails (2
  groups) → TC-033 · History 「New Chat」 → TC-106 · Manage 「Delete」 → TC-112 (not TC-017) · 「Select All」 / 「Cancel」 →
  TC-112 · ⋮ menu 「Rename」 / 「Delete」 → TC-108, TC-111 · 「Retry」 → TC-092, TC-299 · Location → TC-066 · failed scene
  image → n/a (above). K-404007 is counted with the entries above.
- Arrow traces fixed (9 of 35): Generate all + TC-041 · collapse icon → TC-123 (not TC-124) · Generate drops TC-009 /
  TC-087 · 「View more」 → TC-065 (TC-138 avoids it) · Create my character / Mine tiles → TC-047 · library cards → TC-326 ·
  full-video card → TC-236 · › → TC-065 · storyboard scene cards → TC-138.
- Checks: `controls.ts` 147 groups, 0 untraced, 0 inputs without dismiss, 0 label traces; `check.ts` no errors, no warnings.

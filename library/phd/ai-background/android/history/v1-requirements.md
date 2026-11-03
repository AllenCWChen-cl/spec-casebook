# AI Background — requirements (android)
Spec: Background - PM Spec.pdf (PM, received 2026-11-03; boards pm-custom, pm-room, pm-cms) · AI-Background Design Figma
(page 1:77: frames 「5」 dark, 「6」 light, thumbnail states 「Frame 4922」 / 「Frame 4923」; read 2026-11-03 through figma-design)

Source order: Design, then PM. The Design file draws only the room (no prompt panel, no waiting state), so everything
about the Custom prompt panel and the wait is PM-only (pass 7). The PM Figma file could not be opened (no access for
qa1 or qa-dm), so the PM is read from its PDF (`figma-pending.json`, Q-13).

## Entry and room
- R-001 [PM:pm-custom; DS:figma 5 1:451] Opening AI Background keeps the current flow: the app removes the photo's background itself and the canvas shows the subject on a checkerboard (transparent) background.
- R-002 [PM:pm-custom; DS:figma 5 editing_area/ic_eraser_n] The eraser button at the canvas's lower left lets the user erase (smear out) parts of the cut-out subject, and the canvas shows the change.
- R-003 [PM:pm-custom; DS:figma 5 ic_crop_n 5:482] The crop button next to the eraser lets the user crop the cut-out subject, and the canvas shows the cropped subject.
- R-004 [PM:pm-custom] The image the app sends to the server for a generation is its own cut-out of the subject, after the user's crop and erase (the server does not remove the background again).
- R-005 [DS:figma 5 1:451] Room layout, top to bottom: top bar with ⓘ at the left and the credit pill (balance and ⊕) at the right; the canvas with eraser and crop at its lower left and compare at its lower right; the category tabs; the thumbnail row; the Generate button with its credit price; the bottom bar with X, undo, redo and ✓.
- R-006 [DS:figma 5 top/ic_info] The ⓘ button in the top bar opens the feature's information; closing it returns to the room unchanged.
- R-007 [DS:figma 5 btn_add_credit; KB:KP-020] The credit pill shows the current credit balance with ⊕; tapping it opens the credit purchase page, and coming back returns to the room unchanged.
- R-008 [DS:figma 5 On-screen/btn_BA_n 5:420] Pressing and holding the compare button at the canvas's lower right shows the photo before the change; releasing it shows the current result again.
- R-009 [DS:figma 5 bottom_action/4icons 4:158; PM:pm-room screenshot; KB:KP-041] The bottom bar shows X, undo, redo and ✓; undo and redo are dimmed until there is something to undo or redo.
- R-010 [DS:figma 5 bottom_action/4icons; PM:pm-room screenshot; KB:KP-030] ✓ applies the room's result (exactly as last previewed) to the photo and returns to the editor; X leaves the room without applying it. (Current-app behaviour of the bottom bar both specs draw; the spec states no change to it.)

## Category tabs and thumbnails
- R-011 [DS:figma 5 capsuleTab_box 1:541; PM:pm-room 「category 選取狀態」] Categories are capsule tabs in one row; the selected tab has an orange fill. The Design draws 「Custom」, 「Neutrals」, 「Ballon」, 「Wood」, 「Vintage」, 「Life」 (the actual-app screenshot spells 「Balloon」, Q-2; the category list comes from CMS, Q-8).
- R-012 [PM:pm-room 「Custom 的橘色泡泡太貼近螢幕邊緣」; DS:figma 5 tab-03 1:546] The selected 「Custom」 capsule no longer touches the screen's left edge: the Design places it 12 pt from the edge, the same inset as the thumbnails.
- R-013 [PM:pm-room 「thumbnail 大小」; DS:figma 5 thumb/80x80/withname/regular 24:723] Each thumbnail is an 80 × 80 pt image with its name in a strip below it (80 × 98 pt in all), 4 pt apart (smaller than the current app's thumbnails).
- R-014 [DS:figma 5 24:723, sep 1:888] The 「Custom」 thumbnail (orange gradient with a magic-wand icon) comes first, then a vertical separator, then the templates.
- R-015 [DS:figma Frame 4922 / 4923] A premium template shows a crown badge at its top right.
- R-016 [DS:figma Frame 4922 / 4923; DS:figma 5 Lomo 26:968] The selected thumbnail has an orange stroke; the others have none.
- R-017 [DS:figma 5 capsuleTab_box] Tapping a category tab selects it (orange fill) and shows that category's templates in the thumbnail row.

## Custom prompt panel (PM-only: no Design frame yet)
- R-020 [PM:pm-custom 「Click Custom → 喚起打字 panel (current: click Custom → 開啟新的房間)」] Tapping the 「Custom」 thumbnail opens the typing panel with the keyboard in the same room; it no longer opens a new room.
- R-021 [PM:pm-custom mockup 2] The panel shows the title 「Prompts」, a 「My Prompts」 button, a ✓ button, the text box with the placeholder 「Please describe the content to replace (guitar, flower, chair)」, an expand button at the text box's top right, a delete (trash) button at its lower left and the counter 「0/2,500」.
- R-022 [PM:pm-custom mockups 2–3] While the text box is empty, ✓ and the trash button are dimmed; once there is text, ✓ turns orange and the trash button is active.
- R-023 [PM:pm-custom mockup 3] The counter shows the number of characters typed out of 2,500 (e.g. 「120/2,500」).
- R-024 [PM:pm-custom 「0/2,500」] The prompt holds at most 2,500 characters: typing or pasting more stops at 2,500 and the counter shows 「2,500/2,500」.
- R-025 [PM:pm-custom 「設有 expand/ delete btn」, mockup row 2] The expand button opens the text box at full height, showing the whole prompt, with the trash button still at its lower left.
- R-026 [PM:pm-custom 「設有 expand/ delete btn」] The trash button clears the prompt; the counter returns to 「0/2,500」.
- R-027 [PM:pm-custom 「& My Prompt」] The panel has a 「My Prompts」 button (title: 「add My Prompt」); what it opens is not described (Q-4).
- R-028 [PM:pm-custom 「click 空白處 or 勾勾→ panel 不見, Custom 為 selected 狀態 (橘色 stroke), ready for generation」] Tapping a blank area outside the panel, or ✓, closes the panel; the 「Custom」 thumbnail is then selected (orange stroke) and Generate is ready (enabled, orange, with its price).
- R-029 [PM:pm-custom mockup 1] Before a Custom prompt is confirmed (the Custom tab open, no thumbnail selected), Generate is dimmed.

## Generation and waiting
- R-030 [PM:pm-custom 「不走 long task, 讓用戶在房間等, 不設有 my artwork 入口」] A Custom generation is not a long task: the user waits in the room, and no My Artwork entry (button, toast or link) is offered during the wait.
- R-031 [PM:pm-custom 「等待途中的 handle 方式同 GAI Enhance」] What happens when the user leaves or interrupts during the wait is the same as in AI Enhance (Q-7: the spec does not restate it); leaving and coming back never silently loses the generation or its credits.
- R-032 [PM:pm-custom] From 0 to 10 s of the wait the room shows 「Analyzing your image...」.
- R-033 [PM:pm-custom] From 10 to 20 s it shows 「Understanding the scene...」.
- R-034 [PM:pm-custom] From 20 to 30 s it shows 「Creating the new background...」.
- R-035 [PM:pm-custom] From 30 to 40 s it shows 「Refining the details...」.
- R-036 [PM:pm-custom] From 40 to 45 s it shows 「Making the final adjustments...」.
- R-037 [PM:pm-custom] After 45 s it shows 「Almost done!」 until the result arrives.
- R-038 [DS:figma 5; PM:pm-room screenshot] Selecting a template and tapping Generate generates a new background from that template in the room, and the canvas shows the subject on it.
- R-039 [PM:pm-custom 「ready for generation」] Tapping Generate with a confirmed Custom prompt generates a new background from the prompt, and the canvas shows the subject on it.
- R-040 [DS:figma 5 btn_credit_primary_1row 5:461] With a template selected, the Generate button reads 「Generate」 with the credit icon and 「2」, and a template generation charges 2 credits (Q-1).
- R-041 [PM:pm-custom mockup 4 「Generate 5」] With a confirmed Custom prompt, the Generate button shows 「5」 credits, and a Custom generation charges 5 credits (PM-only; differs from the Design's 「2」, Q-1).
- R-042 [Rule: credit numbers binding] After a charged generation the credit pill's balance goes down by exactly the price shown on Generate.

## Free trial
- R-045 [PM:pm-room screenshot 「1 Free Trial」; PM:pm-cms 「First time free trial task ID」] On a user's first use, the CTA reads 「1 Free Trial」 with the price shown as 「2 → 0」 (the 2 struck through).
- R-046 [PM:pm-cms; KB:KP-016] The free trial is a one-time use: generating with it charges 0 credits; afterwards the CTA shows the paid Generate with its price and never 「1 Free Trial」 again, and on entry the CTA never flashes the paid price before showing 「1 Free Trial」.
- R-047 [PM:pm-cms] A free-trial generation is sent with the task ID 「temp_one_time_free」.

## Feature and Action IDs
- R-050 [PM:pm-cms] AI Background generations are sent under the Feature ID 「PeopleBackgroundV3」.
- R-051 [PM:pm-cms; KB:KP-036] A Custom generation is sent with the prompt exactly as typed and with the Action ID 「genimage_1_img_bytedance_seedream5.0pro_none_custom」 (model Seedream 5.0 Pro).
- R-052 [PM:pm-cms] A template generation is sent with the Action ID 「genimage_1_img_bytedance_seedream5.0pro_none_tmpl」.
- R-053 [PM:pm-cms 「CMS type TBD」] The CMS type for the categories and templates is not decided — NOT TESTABLE: TBD in the spec (Q-8).

## Themes
- R-055 [DS:figma 5 1:451, 6 11:248] The Design draws the room in a dark version (「5」: black bars, dark thumbnail strips) and a light version (「6」: light bars, orange-tinted credit pill, light thumbnail strips); each shows the same controls in the same places (Q-9: which app setting shows the light version).

## Android: credits, artwork and entry (domain rules)
- R-064 [KB:KP-017] After a charged AI Background generation, Buy Credit › Detail lists the use under the AI Background feature name with the credits deducted.
- R-065 [KB:KP-019] Tapping Generate several times quickly starts one generation and charges once.
- R-066 [KB:KP-024] A finished, charged AI Background image is saved to My AI Artwork under the feature's own tab (the PM removes only the My Artwork entry during the wait, Q-15).
- R-067 [KB:KP-032] Opened from the editor after another edit, AI Background starts from the edited image, not the original file.

## Android system Back (pass 8, REQ-051 rule)
- R-060 [Rule: Android system Back] System Back with the prompt panel open closes the keyboard first, then the panel; it does not leave the room.
- R-061 [Rule: Android system Back; PM:pm-custom] System Back during the wait behaves as AI Enhance does during its wait (Q-7): it never leaves with the generation silently lost.
- R-062 [Rule: Android system Back] System Back on the room with a result does what the bottom bar X does.
- R-063 [Rule: Android system Back] System Back on the ⓘ information, the credit purchase page and the eraser / crop tools closes them like their own close or cancel and returns to the room.

## Open questions
- Q-1 Credits: the Design's Generate shows 「2」 (template selected), the PM Custom mockup shows 「5」, and the actual-app screenshot shows the free trial as 「2 → 0」. Is a Custom generation 5 credits and a template 2? R-040, R-041, R-045. Credit numbers are binding: the rows follow the Design for templates and the PM for Custom until PM answers.
- Q-2 The Design spells the third category 「Ballon」; the actual-app screenshot shows 「Balloon」. The row expects 「Balloon」. R-011.
- Q-3 In the Design's frame 「5」 the template 「Lomo」 is selected but Generate looks dimmed; the PM mockup with Custom confirmed shows Generate orange. Is Generate enabled whenever a thumbnail is selected? R-028, R-029, R-040.
- Q-4 What does 「My Prompts」 open (saved prompts, saving the current prompt)? Is the typed prompt kept on return? R-027.
- Q-5 Tapping a blank area (or ✓, if it is not disabled) with an empty text box: is 「Custom」 selected with no prompt, or does the panel just close? R-022, R-028.
- Q-6 Tapping 「Custom」 again after a prompt was confirmed or generated: does the panel open with the previous prompt? R-020.
- Q-7 「Handled the same as GAI Enhance」 during the wait: is there a cancel / Stop, a leave dialog, what happens on Home or app switch, and what happens to the credits? R-031.
- Q-8 CMS type TBD: which categories and templates ship, in which order, and which are premium? R-011, R-053.
- Q-9 Which app or system setting shows the light Design (frame 「6」)? R-055.
- Q-10 What does a Free user get when tapping a premium (crown) template: Generate with credits, or a subscription page? R-015 (no tier rule stated, KB KP-013).
- Q-11 Failures are not specified: error copy, refund, retry for a failed Custom or template generation and a failed background removal. Job states grid.
- Q-12 The PM prompt-panel mockups 2–3 show a top bar with back, home, credits and a history icon; the Design and the actual-app screenshot show ⓘ and credits. The rows follow the Design. R-005.
- Q-13 The PM Figma file (rCJRmOYzvMhbhTIA7bJjid) is not shared with qa1@cyberlink.com or qa-dm@cyberlink.com, so the PM was read from its PDF only: PM frames newer than the PDF export may be missing (step 8 owed for the PM file).
- Q-15 The PM says no My Artwork entry during the wait; does the result still save to My AI Artwork (KB KP-024) and appear in Recent (KB KP-027)? R-066.
- Q-14 Do the progress messages (R-032 – R-037) also show for a template generation, and what does a template wait look like? R-038.

## Added 2026-11-03 — coverage passes and standing inputs

### Flow arrows walked by existing rows
Neither the Design file nor the PM PDF draws flow arrows (inventory: 0 arrows); `arrows.json` is empty.

### Job states
Every cell names the rows that check it, or n/a when the spec defines nothing for that state.

| Job | Start / loading | Success | Failure | Retry | Second failure | Partial | Stop | Leave and return | Longest wait | Done notice |
|---|---|---|---|---|---|---|---|---|---|---|
| Background removal on entry | n/a (spec silent: current flow) | TC-001 | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (spec silent) | n/a (one image) | n/a (spec silent) | n/a (spec silent) | n/a (spec silent) | n/a (result shows on the canvas) |
| Custom generation | TC-026 | TC-033 | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (one image) | n/a (same as AI Enhance, not restated: Q-7) | TC-038 | TC-031 | n/a (no long task: the result shows in the room, TC-033) |
| Template generation | TC-034 | TC-034 | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (one image) | n/a (spec silent, Q-7) | n/a (spec silent, Q-14) | n/a (spec silent, Q-14) | n/a (the result shows in the room, TC-034) |
| Free-trial generation | TC-040 | TC-040 | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (spec silent, Q-11) | n/a (one image) | n/a (spec silent, Q-7) | n/a (spec silent, Q-7) | n/a (spec silent) | n/a (the result shows in the room, TC-040) |

### Error classes
| Job | Error classes |
|---|---|
| Background removal on entry | n/a (spec names no error classes, Q-11) |
| Custom generation | n/a (spec names no error classes, Q-11) |
| Template generation | n/a (spec names no error classes, Q-11) |
| Free-trial generation | n/a (spec names no error classes, Q-11) |

### Exit × stage
| Stage | Bottom X | Bottom ✓ | App to background |
|---|---|---|---|
| Prompt panel open | n/a (the keyboard covers the bottom bar) | n/a (the keyboard covers the bottom bar) | n/a (spec silent, Q-6) |
| Custom ready, not generated | n/a (spec silent: nothing to apply) | n/a (spec silent: nothing to apply) | n/a (spec silent) |
| Generating | n/a (same as AI Enhance, Q-7) | n/a (same as AI Enhance, Q-7) | TC-038 |
| Result shown | TC-037 | TC-036 | n/a (spec silent) |

### Hidden clauses
| Requirement | Hidden clause | Observed through | Rows |
|---|---|---|---|
| R-004 | The image sent to the server is the app's cut-out after crop / erase | The uploaded image in the app log or the request record after a log pull; parked until a PhotoDirector log pull is set up | TC-042 |
| R-047 | The free-trial generation is sent with task ID 「temp_one_time_free」 | The request in the app log after a log pull | TC-044 |
| R-050 | Sent under Feature ID 「PeopleBackgroundV3」 | The request in the app log after a log pull | TC-042, TC-043 |
| R-051 | Custom is sent with Action ID 「…_custom」 | The request in the app log after a log pull | TC-042 |
| R-052 | A template is sent with Action ID 「…_tmpl」 | The request in the app log after a log pull | TC-043 |

### Variants
| Requirement | Variant | Rows |
|---|---|---|
| R-055 | Dark (frame 5) | TC-002 |
| R-055 | Light (frame 6) | TC-045 |
| R-040 | Template price 2 | TC-015, TC-034 |
| R-041 | Custom price 5 | TC-023, TC-033 |
| R-045 | Free trial 2 → 0 | TC-039, TC-040 |

### System back
| Screen | Rows |
|---|---|
| Room (nothing generated) | n/a (leaves the room like X; spec silent on a dialog) |
| Prompt panel with keyboard | TC-046 |
| Room during the wait | TC-047 |
| Room with a result | TC-048 |
| ⓘ information | TC-049 |
| Credit purchase page | TC-050 |
| Eraser / crop tools | TC-051 |
| My Prompts | n/a (what it opens is unknown, Q-4) |

### Domain rules
| Entry | Requirements |
|---|---|
| KP-016 | R-046 |
| KP-012 | n/a (the spec states no tier rule; Q-10) |
| KP-014 | n/a (AI Exposure only) |
| KP-015 | n/a (no Premium purchase in this feature) |
| KP-017 | R-064 |
| KP-018 | n/a (Credit Auto Pass not used here) |
| KP-019 | R-065 |
| KP-020 | R-007 |
| KP-021 | n/a (no chat quota) |
| KP-024 | R-066 |
| KP-025 | n/a (AI Exposure only) |
| KP-026 | n/a (the Design draws no History button) |
| KP-027 | n/a (whether AI Background works reach Recent is not stated, Q-15) |
| KP-028 | n/a (Artwork filters not in scope) |
| KP-029 | n/a (not a long task, R-030) |
| KP-030 | R-010 |
| KP-032 | R-067 |
| KP-033 | n/a (the spec names no banner or deep link) |
| KP-034 | n/a (Discover only) |
| KP-035 | n/a (AI Replace only) |
| KP-036 | R-051 |
| KP-037 | n/a (AI Try-On only) |
| KP-038 | n/a (AI Group Shot only) |
| KP-039 | n/a (Agent jobs only; the wait is R-031) |
| KP-040 | n/a (the crop here is the subject crop, not the Crop & Rotate tabs) |
| KP-041 | R-009 |
| KP-042 | n/a (no restored transform state in this feature) |
| KP-043 | n/a (Video Editing only) |
| KP-044 | n/a (Video Editing only) |
| KP-045 | n/a (Audio Range Select only) |
| KP-046 | n/a (Try-On / Hairstyle only) |
| KP-047 | n/a (no mask returned from Artwork or Store) |
| KP-048 | n/a (the spec states no locale scope) |
| KP-049 | n/a (the spec states no locale scope) |
| KP-050 | n/a (the spec states no locale scope; RTL not in scope) |

### Request ledger coverage
| Ledger entry | Requirements |
|---|---|
| (none open of kind table) | n/a |

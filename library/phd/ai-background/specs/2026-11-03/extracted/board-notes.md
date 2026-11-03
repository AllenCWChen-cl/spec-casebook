# AI Background — board notes (spec set 2026-11-03)

PM: `Background - PM Spec.pdf`, one page 8095 × 2079 pt, three boards. Its annotations are white text (rendered blank
on a white page), so the boards were read from the PDF text layer, which is clean (Chinese included); the mockups
were read from renders. PM Figma not readable (no access, Q-13).
Design: Figma `ULY56f3Q9tl6PceuNNoHBD`, page 「Design」 1:77, read 2026-11-03 through figma-design (qa-dm).

## pm-custom — 1. Custom: add My Prompt & Refine UI/UX
Mockups, left to right: (1) actual app, Custom tab, Custom thumbnail not selected, Generate dimmed 「Generate ⓒ5」;
(2) prompt panel empty: 「Prompts」, 「My Prompts」, grey ✓, placeholder 「Please describe the content to replace
(guitar, flower, chair)」, expand icon, grey trash, 「0/2,500」, keyboard; (3) same with text: orange ✓, trash active,
「120/2,500」; (4) panel closed: Custom thumbnail with orange stroke, Generate orange; (row 2) expanded text box
showing the whole prompt. Mockups 2–3 have a top bar with back, home, credits 「100 ⊕」 and a history icon (Q-12).
Rules (REQUIREMENT):
- Same flow as now: the app removes the background, the user crops / erases the subject, the app sends the cut-out to the server.
- Click Custom → typing panel (current: Custom opens a new room).
- Expand and delete buttons, and My Prompt.
- Tap blank area or ✓ → panel closes, Custom selected (orange stroke), ready for generation.
- Not a long task: the user waits in the room, no My Artwork entry; waiting handled like GAI Enhance.
- Progress copy: 0–10 s 「Analyzing your image...」, 10–20 s 「Understanding the scene...」, 20–30 s 「Creating the new
  background...」, 30–40 s 「Refining the details...」, 40–45 s 「Making the final adjustments...」, 45 s+ 「Almost done!」.
Controls (PDF-read): Custom thumbnail, My Prompts, ✓, text box, expand, trash, Generate.

## pm-room — 2. Feature Room: Refine UI/UX
An actual-app screenshot (「此圖為實際截圖」): ⓘ, credits 「6609 ⊕」, canvas with eraser, crop and compare, tabs
Custom / Neutrals / Balloon / Wood, thumbnails Custom | Pearl, Beige (crown), Azure, Olive (crown), Blue, CTA
「1 Free Trial」 with 「2 → 0」 (2 struck), bottom bar X, undo, redo, ✓ (dimmed).
UI changes asked: prompt box behaviour; thumbnail size; category selected state (the Custom orange bubble is too
close to the screen edge).

## pm-cms — 3. CMS & IDs
CMS type: TBD. Feature ID 「PeopleBackgroundV3」. Action ID: Custom 「genimage_1_img_bytedance_seedream5.0pro_none_custom」,
Template 「genimage_1_img_bytedance_seedream5.0pro_none_tmpl」. First-time free trial task ID 「temp_one_time_free」.

## Design — Figma page 1:77
- 「5」 (1:451) dark and 「6」 (11:248) light, 375 × 812: top bar ⓘ + credit pill 「100 ⊕」 (light: orange tint);
  canvas 375 × 449 with eraser (12, 500), crop (60, 500), compare (327, 500); capsule tabs 「Custom」 (orange,
  x = 12), 「Neutrals」, 「Ballon」 (sic), 「Wood」, 「Vintage」, 「Life」; thumbnails 80 × 98 (80 × 80 image + name
  strip): Custom (gradient, magic wand) | separator | Lomo (crown, selected in 「5」), Artistic, B&W; Generate
  「Generate」 + credit 「2」 (looks dimmed, Q-3); bottom bar X, undo, redo, ✓. A hidden bubble 「Select a souce photo
  to extract its filter」 is left over from another feature (hidden, not drawn).
- 「Frame 4922」 (light) / 「Frame 4923」 (dark): thumbnail states: Custom; template with crown; template with crown
  and orange stroke (selected).
- No dated frames, no flow arrows, no prompt panel or waiting state.

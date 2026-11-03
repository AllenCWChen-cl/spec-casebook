# Edit state

## KP-040 Crop tabs keep one consistent state
- kind: rule · platform: android · tags: crop, perspective, ai-expand · authority: spec
- source: PHD domain confirmed-rules.md K20 (PHA262026-0416, -0438, -0458) · aka: K20

Across Crop & Rotate, Perspective and AI Expand tabs, rotation, preview, crop frame, ratio and tool state stay
consistent; re-entering a tab shows the current image. A ratio stays selected only while the frame keeps it (Rotate /
Flip that resets the frame clears it).

## KP-041 Undo, Redo and Reset
- kind: rule · platform: android · tags: undo, reset · authority: spec
- source: PHD domain confirmed-rules.md K21 (PHA262026-0426, -0427) · aka: K21

Undo steps back one record; Redo enables only when a redo record exists. Reset's base is the image first shown on
entering the transform screen: enabled only when the preview differs, stays on the current tab, restores image and
options to defaults, and is itself an undo record.

## KP-042 Restored state restores highlight and transform together
- kind: rule · platform: android · tags: undo, ai-expand · authority: spec
- source: PHD domain confirmed-rules.md K22 (PHA262026-0425, -0428) · aka: K22

Restoring a state restores the button highlight and the real transform together (AI Expand ratio pill and preview;
initial Custom mode drives Reset enablement).

## KP-043 Video Editing template titles keep their look
- kind: rule · platform: android · tags: video-editing, text · authority: spec
- source: PHD domain confirmed-rules.md K24 (PHA262026-0439 … -0441) · aka: K24

Cancel, Undo or opacity changes never wash a template title to white / no preset.

## KP-044 Video Editing panels: X discards, V commits
- kind: rule · platform: android · tags: video-editing, x-v · authority: spec
- source: PHD domain confirmed-rules.md K25 (PHA262026-0442, RDResolved when read) · aka: K25

X discards everything changed in the panel; V commits; the two must differ. Not every video panel was rechecked.

## KP-045 Audio Range Select close target
- kind: rule · platform: android · tags: video-editing, audio, back · authority: spec
- source: PHD domain confirmed-rules.md K26 (PHA262026-0444) · aka: K26

Video Editing › Audio Range Select: closing returns to the audio panel when a track exists, else to the picker; X and
system Back behave the same.

## KP-046 Try-On / Hairstyle Back keeps the style
- kind: rule · platform: android · tags: ai-try-on, ai-hairstyle, back · authority: spec
- source: PHD domain confirmed-rules.md K27 (PHA262026-0241, -0285, -0328) · aka: K27

Back after generating keeps the previous style and any reusable reference image; importing a photo does not reset
the category to All. Create More keeping the whole session is an open question.

## KP-047 Masks survive returning from Artwork or Store
- kind: rule · platform: android · tags: mask, ai-replace · authority: spec
- source: PHD domain confirmed-rules.md K29 (PHA262026-0263, -0244, -0245) · aka: K29

AI Replace returning from Artwork to edit the mask shows the red mask; VHS / Glitch returning from Store keep a
working mask.

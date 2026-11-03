# Open questions

## KF-044 Scene cap
- kind: question · platform: ios · use: analysis · tags: storyboard, scale
- source: exploration KB ai-mini-drama.md (2026-10-13 PU, 16.9.0 189520)

14 scenes were generated on request; an older Design frame says 「最多 10 Scenes」 and the live Design is silent. PM to
confirm the cap.

## KF-045 Aspect ratio
- kind: question · platform: ios · use: analysis · tags: format
- source: exploration KB ai-mini-drama.md (2026-09-24, 16.9.0 189315)

The Design main flow and the build ask no aspect ratio, but Design Choose Character, Recent Task and MX bubbles show
「Aspect ratio: 9:16」. PM to confirm.

## KF-046 Which look is bound after leaving Choose Character
- kind: question · platform: ios · use: analysis · tags: characters
- source: exploration KB ai-mini-drama.md (2026-10-12 QA, 16.9.0 189520)

After 「Leave without finishing」 and a later pick, the Characters Result showed one look while storyboard and video
used the earlier reference-photo look. RD to say which is bound.

## KF-047 One look change billing every character
- kind: question · platform: ios · use: analysis · tags: credits, characters
- source: exploration KB ai-mini-drama.md (2026-10-13 PU, 16.9.0 189520)

One look change after a storyboard charged ◆16 (four images and voices) on a template drama, but ◆4 on a free-form
one. Trigger unknown.

## KF-048 Untested paths
- kind: question · platform: ios · use: analysis · tags: credits, notification, voice
- source: exploration KB ai-mini-drama.md (2026-10-07…10-15, 16.9.0 189399–189631)

Not exercised: insufficient credits (MX 「Not enough credits to generate.」), first-time free script (「Free trial
active: Create the script for 0 Credits」), a completion notification for a background video (none seen), the
microphone, and what 「Listen to character intro」 changes.

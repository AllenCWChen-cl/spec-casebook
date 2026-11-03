# Entries and AI inputs

## KP-032 Features opened from Edit Room get the edited image
- kind: rule · platform: android · tags: entry, edit-room, source-image · authority: spec
- source: PHD domain confirmed-rules.md K02 (PHA262026-0382, -0400) · aka: K02

Opening a feature from Edit Room carries the current edited image, not the original file (Cinematic Reel Creator,
AI Headshot).

## KP-033 Banners and deep links preselect the linked style
- kind: rule · platform: android · tags: entry, banner, deep-link · authority: spec
- source: PHD domain confirmed-rules.md K04 (PHA262026-0306, -0344, -0308) · aka: K04

A banner or deep link opens the feature with the linked style, type and category selected and the style scrolled
into view.

## KP-034 Discover tip bubble lifecycle
- kind: rule · platform: android · tags: discover, onboarding · authority: spec
- source: PHD domain confirmed-rules.md K05 (PHA262026-0255) · aka: K05

The bubble disappears for the session once Discover is opened, shows again on later launches until 「Use this
template」 is tapped once, then never again. Seen-tutorial, entered-feature and completed-key-action are three
different onboarding states.

## KP-035 AI Replace: reference image or prompt enables Next
- kind: rule · platform: android · tags: ai-replace, ai-input · authority: spec
- source: PHD domain confirmed-rules.md K08 (PHA262026-0260) · aka: K08

With source and mask done, a reference image or a prompt enables the next step; with a reference image the prompt is
optional.

## KP-036 A custom prompt reaches the generator
- kind: rule · platform: android · tags: prompt, ai-input · authority: spec
- source: PHD domain confirmed-rules.md K11 (PHA262026-0270) · aka: K11

Input, request and result agree (AI Hairstyle field `user_prompt`), not just that the box takes text.

## KP-037 AI Try-On: no face check on clothing or pets
- kind: rule · platform: android · tags: ai-try-on, face-check · authority: spec
- source: PHD domain confirmed-rules.md K12 (PHA262026-0392, -0232) · aka: K12

A clothing reference without a face is accepted. Pet types never run the person check: a dog photo must not report
「No face」.

## KP-038 AI Group Shot photo picking
- kind: rule · platform: android · tags: ai-group-shot, picker · authority: spec
- source: PHD domain confirmed-rules.md K14 (PHA262026-0377 … -0379, -0367) · aka: K14

The first pick is multi-select and Next enables once the template's photo count is picked; changing photos later from
the Photo Picker replaces one at a time. Check slot order and removal. (2026-08-24 update replaces 「always re-pick two」.)

## KP-039 Agent job finished in background shows on return
- kind: rule · platform: android · tags: agent, lifecycle · authority: spec
- source: PHD domain confirmed-rules.md K42 (PHA262026-0321) · aka: K42

An Agent job running when the app goes to background shows its result after returning to foreground. The
「thinking」 timing is still open (see the open question on Agent thinking in background).

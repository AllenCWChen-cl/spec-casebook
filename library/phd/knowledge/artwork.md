# My AI Artwork and saving

## KP-024 Finished AI images save to their feature tab
- kind: rule · platform: android · tags: artwork, save · authority: team
- source: PHD domain confirmed-rules.md K47a (user, 2026-10-16) · aka: K47a, K47

Every credit-deducting AI feature that finishes an image Generate saves the result to My AI Artwork automatically,
under that feature's own tab. Images only (not video, failed or unfinished jobs); tab names and order are not set here.

## KP-025 AI Exposure results go to Recent and the AI Exposure tab
- kind: rule · platform: android · tags: artwork, ai-exposure · authority: team
- source: PHD domain confirmed-rules.md K47b (user, 2026-10-16) · aka: K47b

A finished Generate is saved to My AI Artwork › Recent and › AI Exposure whether or not [V] brings it back to
Adjustment; no jump to Artwork is required. Artwork entry: Launcher › AI Photos › My Artwork (top right). Not
extended to other features.

## KP-026 History button opens the feature's Artwork tab
- kind: rule · platform: android · use: analysis, run, ebug · tags: artwork, history · authority: team
- source: PHD domain confirmed-rules.md K76 (user, 2026-11-03) · aka: K76

Some AI features have a History button (a sheet of paper with a clock at its bottom right); tapping it opens My AI
Artwork with that feature's own tab selected. Only where the spec draws the button.

## KP-027 New features' works reach Recent
- kind: rule · platform: android · tags: artwork, recent · authority: spec
- source: PHD domain confirmed-rules.md K47c (PHA262026-0436) · aka: K47c

A new feature's works appear in Recent when the feature is meant to (Headshot V3 fix).

## KP-028 Empty Artwork filter shows Nothing yet
- kind: rule · platform: android · tags: artwork, empty-state · authority: spec
- source: PHD domain confirmed-rules.md K46 (PHA262026-0363) · aka: K46

An Artwork filter with no matching item shows 「Nothing yet」 (e.g. Group Shot with videos only, Photo filter).

## KP-029 Long-task tiles and completion notifications
- kind: rule · platform: android · tags: artwork, notification, long-task · authority: spec
- source: PHD domain confirmed-rules.md K48 (PHA262026-0375, -0373) · aka: K48

Processing tiles of long tasks show the source thumbnail. Long video jobs (Cinematic Reel Creator, Group Shot video)
send a completion notification whose title, message and deep link open the right page.

## KP-030 Saved output matches the last preview
- kind: rule · platform: android · tags: save, output · authority: spec
- source: PHD domain confirmed-rules.md K50 (PHA262026-0404) · aka: K50

The saved file matches the preview the user last saw (e.g. Collage pinch-zoom).

## KP-031 Save & Share Next Edit starts a new edit
- kind: rule · platform: ios · tags: save, share · authority: observed
- source: PHDi exploration editor-navigation-map.md ISS-02 (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Save & Share › 「Next Edit」 reopens the photo picker for a new edit, not continuing the current one. Expectation
unconfirmed.

# Editor and app navigation (iOS)

From a PhotoDirector iOS exploration (20.15.0, mirrored window), not all accurate: expectations to confirm.

## KP-123 Bottom navigation has five tabs
- kind: fact · platform: ios · tags: navigation, home
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Home (Edit, Camera, AI-tool grid), Discover (community feed, chips All / GPT Trends / Animate / Pets, 「Try it」), AI
Videos (Image to Video, AI Anime Video), AI Photos (「AI Portrait Styles」: Creative Studio, Try-On, Hairstyle, Art, Glow
Up, Face Swap), Mine (VIP status, My Credits, Buy Now, shortcuts).

## KP-124 Home AI-tool grid is a two-page carousel
- kind: fact · platform: ios · use: run · tags: navigation, home
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Page 1: Image to Video, AI Edit Agent, AI Video Try-On, AI Creative Studio, Character Motion Swap, AI Removal, AI
Enhance, AI Replace. Page 2: AI Art, Collage, AI Face Swap, Beautify, AI Try-On.

## KP-125 Edit and Try Now open the in-app picker
- kind: fact · platform: ios · use: run · tags: navigation, picker
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

The picker has Sample Photos / Stock tabs and a camera; it is not the system photo picker.

## KP-126 Editor has five category tabs
- kind: fact · platform: ios · tags: navigation, editor
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Quick Actions (Auto, Subject, Retouch, Background, Presets), Edit (AI Edit Agent, AI Removal, Crop, Text, Cutout,
Background), Enhance (AI Enhance, Adjustments, Filter, AI Color, Deblur), Portrait (Beautify, Body Reshape, Makeup,
Hair, AI Art), Effects (Blur Tool, Fisheye, HDR, Vignette, Light Hit). Top bar: Home, layers, Download, Settings;
undo / redo appear after the first edit. Adjustments › Light / Color / Details; Crop = Crop &
Rotate + Perspective; Text = Text + Text Bubble.

## KP-127 Editor guard dialogs
- kind: rule · platform: ios · tags: editor, dialog, discard · authority: observed
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Flattening a text layer asks 「Save Changes?」 (it cannot be modified again); leaving the editor with edits asks
「Discard changes?」 (all changes will be lost).

## KP-128 Pre-checks on portrait tools
- kind: rule · platform: ios · tags: portrait, face-check · authority: observed
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Body Reshape warns when it is unable to detect certain body parts; Hair Volume pre-checks the face angle (「too
slanted」 with Continue Anyway). Camera asks for the system camera permission first.

## KP-129 Settings › About shows version, SR and build
- kind: howto · platform: ios · use: run · tags: settings, build
- source: PHDi exploration editor-navigation-map.md (2026-07-24) · verified: 20.15.0 (2607222248) 2026-07-24

Settings › About shows Version, SR (e.g. 「DailyBuild」) and Build.

## KP-130 Taps in a mirrored iPhone window
- kind: quirk · platform: ios · use: run · tags: tools, mirroring, tap
- source: PHDi exploration editor-navigation-map.md › Tap-delivery method (2026-07-24)

In the macOS mirrored window a plain click or a 1 s hold does not navigate (1 s reads as a long press): bring the app
to the front, then mouse down, wait about 0.15 s, mouse up. Text fields take typing after a double-click.

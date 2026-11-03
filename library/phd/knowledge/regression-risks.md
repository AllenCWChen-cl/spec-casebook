# Regression risks: what to vary

## KP-071 PHD regression matrix
- kind: risk · platform: android · use: analysis · tags: matrix
- source: PHD domain regression-risks.md › Regression matrix

Vary the entry, first use vs re-entry (cold start, tutorial shown / skipped, Create More), the AI input (preset,
prompt, reference, person, pet), lifecycle (background while thinking / generating, re-creation), geometry (large,
very wide, Crop → Save), operations (X, V, Back, Undo, Redo, Reset, rapid taps), entitlement, Artwork filters, locale,
device, Stage / Production and CMS state.

## KP-072 Every entry is its own path
- kind: risk · platform: android · use: analysis · tags: entry
- source: PHD domain regression-risks.md K01 (PHA262026-0283, -0278, -0233) · aka: K01

Each entry brings its own photo, style, category, tutorial state and back path: AI Replace lost its top toolbar only
via Edit Room → Artwork → Edit Room.

## KP-073 Photo identity drives picker re-selection
- kind: risk · platform: android · use: analysis · tags: picker, source-image
- source: PHD domain regression-risks.md K03 (PHA262026-0357, -0367) · aka: K03

Edit Room images with id 0 / -1 were not ticked in the Photo Picker (AI Agent, Group Shot): check id mapping.

## KP-074 Tutorials and cold start change init order
- kind: risk · platform: android · use: analysis · tags: onboarding, cold-start
- source: PHD domain regression-risks.md K05 (PHA262026-0281, -0358) · aka: K05

Try-On with 「Don't show again」 put a pet style in the wrong tab; Creative Studio cold-started from a deep link
crashed before data loaded. Cover tutorial shown, skipped, cold start and data loaded.

## KP-075 Refactors move navigation
- kind: risk · platform: android · use: analysis · tags: deep-link, notification
- source: PHD domain regression-risks.md K06 (PHA262026-0278) · aka: K06

AI Replace became its own Activity and an old notification path via Edit Room showed black: re-walk notification and
deep-link paths after a feature moves.

## KP-076 Selection state leaks across features
- kind: risk · platform: android · use: analysis · tags: cross-feature
- source: PHD domain regression-risks.md K07 (PHA262026-0262) · aka: K07

After AI Replace uploaded a reference, Text Bubble / Text / Sticker added it as Add Photo: 「after using another
feature」 is its own precondition.

## KP-077 Inspirations obey the model too
- kind: risk · platform: android · use: analysis · tags: prompt, inspiration
- source: PHD domain regression-risks.md K10 (PHA262026-0396 … -0398) · aka: K10

Official inspirations were too long or hit content checks; one truncated by an old model looked user-edited
(「Use Another Inspiration」).

## KP-078 Sub-types keep their own selection
- kind: risk · platform: android · use: analysis · tags: ai-hairstyle, selection
- source: PHD domain regression-risks.md K15 (PHA262026-0331, -0395) · aka: K15

AI Hairstyle My Style shared one GUID across Photos / Prompts; a preloaded inactive tab overwrote the selection, so
Generate was wrongly disabled or enabled.

## KP-079 Video features share Trim and take different media
- kind: risk · platform: android · use: analysis · tags: video, trim
- source: PHD domain regression-risks.md K16 (PHA262029-0003, PHA262026-0318, -0414) · aka: K16

Motion Swap and Video Try-On take a photo and a video (guides must name the right one); AI Anime Video, Video Try-On,
Motion Swap and Cinematic Reel Creator share Trim / Continue, so one missing module breaks all four.

## KP-080 Image and mask must align
- kind: risk · platform: android · use: analysis · tags: mask, large-photo
- source: PHD domain regression-risks.md K18 (PHA262026-0296) · aka: K18

AI Removal failed on 2560×909: the scaled mask rounded to another ratio. Vary very wide images and edge masks.

## KP-081 Price follows the real mode
- kind: risk · platform: android · use: analysis · tags: price, ai-input
- source: PHD domain regression-risks.md K32 (PHA262026-0271) · aka: K32

Prompt vs reference image must be told apart before action and style ids are picked: check the price per mode.

## KP-082 Large photos have two stacks
- kind: risk · platform: android · use: analysis · tags: large-photo, crop, save
- source: PHD domain regression-risks.md K23 (PHA262026-0457) · aka: K23

Crop / Perspective committed only the thumbnail stack, so Save used the uncropped original: chain geometry →
Adjustment → Save and check the file.

## KP-083 Back must find real resources
- kind: risk · platform: android · use: analysis · tags: back, create-more
- source: PHD domain regression-risks.md K28 (PHA262026-0309, -0295) · aka: K28

Create More from Artwork deleted the original's video; Try-On deleted the reference, then showed Network error on redo.

## KP-084 Temporary mask is not the output
- kind: risk · platform: android · use: analysis · tags: mask, quality
- source: PHD domain regression-risks.md K29 (PHA262026-0263, -0264) · aka: K29

A visible mask while editing is required; residue in the result is a quality issue. Judge them separately.

## KP-085 IAP visibility needs the whole entitlement
- kind: risk · platform: android · use: analysis · tags: iap, entitlement
- source: PHD domain regression-risks.md K39 (PHA262026-0312, -0196) · aka: K39

The shop entry and new-user offer bubble used different checks; the shared subscribe dialog (AI Expand, Image to
Video, Hair Volume) crashed from AI Expand → Credits → Subscribe.

## KP-086 Agent turns: completion is not success, and once only
- kind: risk · platform: android · tags: agent, logs
- source: PHD domain regression-risks.md K40, K41 (PHA262026-0319, -0353) · aka: K40, K41

A session holds history and jobs; a turn is one send and its replies. `final_state=block`, error 0 and no outputs
showed only a generic error; a native agent initialised twice wrote `turn_complete` twice (duplicate replies).

## KP-087 Agent foreground resume
- kind: risk · platform: android · use: analysis · tags: agent, lifecycle
- source: PHD domain regression-risks.md K42 (PHA262026-0321) · aka: K42

History load waited on a destroyed native agent and blocked events: vary background while thinking and generating.

## KP-088 Work type is not job type
- kind: risk · platform: android · use: analysis · tags: artwork, jobs
- source: PHD domain regression-risks.md K45 (PHA262026-0194, -0436) · aka: K45

Long-task images filtered as error packs hid Headshot images; Headshot V3 became a short task to reach Recent.

## KP-089 Taps right after opening a pack
- kind: risk · platform: android · use: analysis · tags: artwork, rapid-tap
- source: PHD domain regression-risks.md K49 (PHA262026-0195) · aka: K49

Taps within 800 ms of opening a pack were swallowed; fixed with a wait indicator.

## KP-090 Display size is not resolution
- kind: risk · platform: android · use: analysis · tags: output, resolution
- source: PHD domain regression-risks.md K51 (PHA262026-0280, -0350) · aka: K51

512×512 Image to Video works looked tiny (fit mode); Face Swap resolution is separate. Check the file's pixels.

## KP-091 Mute state survives template switches
- kind: risk · platform: android · use: analysis · tags: audio, ai-group-shot
- source: PHD domain regression-risks.md K52 (PHA262026-0364) · aka: K52

Group Shot mute state must survive template switches and MediaPlayer re-creation.

## KP-092 Generated is not saved
- kind: risk · platform: android · tags: save, crash
- source: PHD domain regression-risks.md K53 (PHA262026-0401, -0387) · aka: K53

Group Shot 「returning to Recent」 after Save was a native audio crash: check the file exists and opens.

## KP-093 Built-in and CMS both supply content
- kind: risk · platform: android · use: analysis · tags: cms, icons
- source: PHD domain regression-risks.md K55, K56 (PHA262026-0333, -0340, -0415, -0315) · aka: K55, K56

CMS supplies banners, names, translations, templates, categories, style GUIDs, inspirations, samples, audio settings,
tags and navigation, and the app has built-in copies (AI Agent icons needed both): vary light / dark, first launch
offline.

## KP-094 Language and content version
- kind: risk · platform: android · use: analysis · tags: cms, locale
- source: PHD domain regression-risks.md K57 (PHA262026-0315, -0342, -0243) · aka: K57

APIs carry lang and contentVer / metaDataVer; a new-tag fix needed a new tag GUID and an eTag reset. Vary a language
switch with a warm cache.

## KP-095 iOS animated-thumbnail cache key
- kind: risk · platform: ios · use: analysis · tags: cms, cache, thumbnail
- source: PHD domain regression-risks.md K58 (PHI262607-0001, -0002) · aka: K58

Keyed by feature GUID it missed updates; now keyed by URL hash. iOS only.

## KP-096 Collage search indexes must agree
- kind: risk · platform: android · use: analysis · tags: collage, search, locale
- source: PHD domain regression-risks.md K59 (PHA262026-0266) · aka: K59

Metadatas (tags), contents and indexdocs must agree per language.

## KP-097 Background and Activity re-creation are separate tests
- kind: risk · platform: android · tags: lifecycle
- source: PHD domain regression-risks.md K62 (PHA262026-0310, -0321, -0303) · aka: K62

Motion Swap lost its model list after re-creation (Don't keep activities); a language change destroys the Activity
(IAP on a detached fragment crashed).

## KP-098 System Back on every screen
- kind: risk · platform: android · use: analysis · tags: back, android
- source: PHD domain regression-risks.md K63 (PHA262026-0370, -0371) · aka: K63

SDK 36 Predictive Back broke onBackPressed paths (Blur Tool black, Edit Room exiting to Launcher).

## KP-099 Edge-to-edge and keyboard
- kind: risk · platform: android · use: analysis · tags: keyboard, android
- source: PHD domain regression-risks.md K64 (PHA262026-0349, -0423) · aka: K64

On Android 15 the AI Agent prompt sat under the keyboard, and a keyboard listener stopped the Image to Video model list
scrolling.

## KP-100 Foldables unfolded
- kind: risk · platform: android · use: analysis · tags: fold, layout
- source: PHD domain regression-risks.md K65 (PHA262026-0322 … -0327) · aka: K65

Fold7 unfolded: prompt boxes, bottom sheets, Task Center, Credits pack and Mosaic preview had height or reach problems.

## KP-101 Long strings
- kind: risk · platform: android · use: analysis · tags: locale, long-strings
- source: PHD domain regression-risks.md K69 (PHA262026-0304 … -0384) · aka: K69

NLD, IND, PLK, ESP, PTB, RUS: check readability and reach (padding, centring, scrolling, toolbar tabs), not just that a
translation exists.

## KP-102 View reuse and async loads
- kind: risk · platform: android · use: analysis · tags: cms, icons
- source: PHD domain regression-risks.md K73 (PHA262026-0365, -0253) · aka: K73

A reused cell showed the wrong AI Agent icon; a Camera filter crashed on a null template name. Wrong visuals are not
always wrong CMS data.

## KP-103 Mixpanel by feature and entry
- kind: risk · platform: android · use: analysis · tags: mixpanel, events
- source: PHD domain regression-risks.md K74 (PHA262026-0318, -0317, -0383) · aka: K74

`Monetize_Subscription_Appear` carries `feature=ai_video_try_on` / `ai_enhance_advanced`; Artwork single Save must
send the real item. Single and multi-select download are both paths.

# Glossary

## KP-001 PHD feature areas
- kind: term · platform: android · use: analysis, ebug · tags: features
- source: PHD domain glossary.md › Feature map (eBugs 2026-04 → 10)

Home and discovery (Launcher, AI Photos, AI Videos, Discover, Mine), photo editing (Edit Room), portrait, photo
generation (Creative Studio, Try-On, Hairstyle, Headshot, Face Swap, Group Shot), AI editing (Replace, Removal,
Expand, Enhance, Exposure), video (Image to Video, Video Try-On, Motion Swap, Cinematic Reel Creator), works and
business (My AI Artwork, Credits, Credit Auto Pass, IAP, Task Center, RTDN). Not a full catalogue.

## KP-002 Code names in code and logs
- kind: term · platform: android · use: analysis, run, ebug · tags: logs, names
- source: PHD domain glossary.md › Name aliases (PHA262026-0358, -0373, -0357, -0367)

「Creative Lab」 = AI Creative Studio; 「CineStory」 = Cinematic Reel Creator; 「AI Editor image ID」 = the Edit Room
source image id.

## KP-003 Image being edited
- kind: term · platform: android · tags: edit-room, source-image
- source: PHD domain glossary.md › Core data objects (PHA262026-0382)

The bitmap Edit Room has composed so far, not the original file URI.

## KP-004 Source image vs reference image
- kind: term · platform: android · tags: ai-input
- source: PHD domain glossary.md › Core data objects (PHA262026-0392, -0260)

Source = the photo being changed; reference = clothing or replacement content. Face checks for a person photo do not
apply to a clothing reference.

## KP-005 Template / Style
- kind: term · platform: android · tags: ai-input, template
- source: PHD domain glossary.md › Core data objects (PHA262026-0271, -0306)

Preset content and the chosen style: GUID, category and generation settings. Not the same as the custom-prompt or
reference-image modes on the same screen.

## KP-006 Inspiration
- kind: term · platform: android · tags: ai-input, prompt
- source: PHD domain glossary.md › Core data objects (PHA262026-0396, -0398)

A suggested prompt from the content service; still bound by the chosen model's length and content checks.

## KP-007 Task / Pack
- kind: term · platform: android · tags: artwork, jobs
- source: PHD domain glossary.md › Core data objects (PHA262026-0194, -0436)

Implementation names for a generation job and a collection of works. Image vs video is not the same as short vs
long task.

## KP-008 My AI Artwork
- kind: term · platform: android · use: analysis, run, ebug · tags: artwork
- source: PHD domain glossary.md › Core data objects (PHA262026-0363, -0436)

The library of jobs and results. Recent, the feature tab and the Photo / Video filter are separate dimensions.

## KP-009 Credits and subscription states
- kind: term · platform: android · tags: credits, entitlement
- source: PHD domain glossary.md › Core data objects (PHA262026-0199, -0316, -0252)

Credits = balance and bonus sources; subscription = entitlements. Premium, Credit Auto Pass and a one-time free trial
are three different states.

## KP-010 Built-in vs CMS content
- kind: term · platform: android · tags: cms
- source: PHD domain glossary.md › Platform terms

Many icons, banners, templates and tags exist both in the app and on CMS; either can be the stale one.

## KP-011 Don't keep activities and Predictive Back
- kind: term · platform: android · use: run · tags: lifecycle, back
- source: PHD domain glossary.md › Platform terms

「Don't keep activities」: the Android developer option that reproduces Activity / ViewModel re-creation. Predictive
Back: the Android SDK 36 default that changed system Back handling.

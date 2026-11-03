# Characters

## KF-019 Choose Character page
- kind: rule · platform: ios · use: analysis, run · tags: characters · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

Per-character tabs, 「Choose for X」, a filter (My characters only, Gender, Ethnicity, Age 0–100) that resets per tab,
and a grid of presets plus 「Mine」. ✕ → 「Leave without finishing? / If you leave now, your picks won't be saved.」 With
3+ characters the chat's 「Add New」 slot is off-screen with no scroll hint.

## KF-020 Create my character form
- kind: rule · platform: ios · use: analysis, run · tags: characters, input, credits · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08 QA, 16.9.0 189482; 2026-10-07, 189399)

Reference photo optional; description 0/1000 with an inline message at the cap (0/8000 on 189399; Design says 8000);
AI Suggestion fills only the role line; Gender*, Ethnicity*, Age* (0 accepted, above 100 clamped to 100 silently).
Generate ◆4, about 30 s, ✕ disabled meanwhile; result offers Download and 「Save to library」, which also saves the
sheet to Photos with a 「Saved to Photos」 toast.

## KF-021 Reference photo checks
- kind: rule · platform: ios · use: analysis, run · tags: characters, photo · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

A reference with several people → 「More than one person detected」 (also on the app's own turnaround sheet). The
reference face wins over the Ethnicity input, while the tag still shows the input.

## KF-022 Finish your characters sheet
- kind: rule · platform: ios · use: analysis, run · tags: characters, credits · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

✓ with characters unset → 「Finish your characters」 (「N character(s) isn't/aren't set yet / Add a look to
continue.」) with Generate / Generate all at ◆4 each. The text stays after the looks are made (DRI261894P0012).

## KF-023 Cast size and who gets cast
- kind: risk · platform: ios · use: analysis, run · tags: characters, scale
- source: exploration KB ai-mini-drama.md (2026-10-08 PU, 16.9.0 189482; 2026-10-12, 189520; 2026-10-15, 189631)

The cast is capped at 5 (Design says 10): extra requested characters are dropped or swapped (DRI261894P0037), and
Confirm with a dropped one rewrites the outline and user-required details (ISS-MD-63). Pets that drive the story are
not cast (DRI261895P0004); a non-human character still needs a human Ethnicity (DRI261896P0017). 「Add New」 invents
a person in no scene (DRI261895P0005). Vary cast size (5/6/7), animals and Add New.

## KF-024 Generate all fails partway or in the background
- kind: risk · platform: ios · use: analysis, run · tags: characters, background, credits
- source: exploration KB ai-mini-drama.md (2026-10-08 PU, 16.9.0 189482; 2026-10-13 PU, 189520)

「Generate all」 may make only some looks, leaving blank slots with no error (DRI261894P0006). Backgrounding after the
jobs are dispatched lost charged portraits and hung the retry with ✕ disabled (DRI261893-0126, fixed in 189596).
Test foreground and background-after-dispatch.

## KF-025 Mine duplicates on Confirm
- kind: risk · platform: ios · use: analysis, run · tags: characters, library
- source: exploration KB ai-mini-drama.md (2026-10-07 re-verify, 16.9.0 189463)

Every Confirm re-saved every assigned character into 「Mine」 (DRI261894P0018). Count 「Mine」 before and after
Confirm. Deleting a 「Mine」 look does not touch dramas using it (2026-10-13).

## KF-026 Template library looks in revisions
- kind: risk · platform: ios · use: analysis, run · tags: characters, templates, revision
- source: exploration KB ai-mini-drama.md (2026-10-15 New User, 16.9.0 189631)

A chat revision touching a template's pre-assigned library character failed (`character-edit` could not stat the CMS
image URL), shown only as 「Server is busy…」 and partly charged (DRI261896P0019); user-created looks passed. Revise
both kinds.

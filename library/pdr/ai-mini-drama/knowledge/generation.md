# Storyboard and video generation

## KF-027 Storyboard result
- kind: rule · platform: ios · use: analysis, run · tags: storyboard · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

「The characters look great! Ready to create the storyboard?」 → 「Create storyboard ◆N」 (25–34 seen), about 60–90 s →
「Here's your storyboard」 (View more opens a read-only scene viewer) and Storyboard Preview, a narrated slideshow
(「See your story as pictures with a voice telling it. The real video comes next.」).

## KF-028 Failed storyboard scenes
- kind: rule · platform: ios · use: analysis, run · tags: storyboard, failure · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08, 16.9.0 189482)

A failed scene shows 「Couldn't create image」 + Edit (189482; earlier a dead 「Regenerate」 label); the scene editor is
0/1000 and regenerates one scene at a time, Edit greyed while another runs. With a scene missing the Preview reads
「Storyboard preview unavailable. Complete the image generation above first to view the preview.」, yet video
generation stays offered (DRI261894P0017).

## KF-029 Scene revisions through chat
- kind: risk · platform: ios · use: analysis, run · tags: storyboard, revision
- source: exploration KB ai-mini-drama.md (2026-10-12, 16.9.0 189520; 2026-10-13; 2026-10-15, 189631)

After 「Script updated! Regenerate the storyboard…」 the next video was only the revised scene (DRI261895P0007); two
chained revisions redrew only the last scene (ISS-MD-64); the new storyboard was written into the earlier message
(DRI261896P0013) and the old Preview said videos were generating (DRI261896P0014). Vary one vs two revisions, before
and after a storyboard exists (DRI261894P0014).

## KF-030 Failed clips in a full video
- kind: rule · platform: ios · use: analysis, run · tags: video, failure, refund · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-13 PU, 16.9.0 189520; 2026-10-07 re-verify, 189463)

Failed clips show 「2 clips couldn't be generated.」 with Fix Clips and per-clip 「Couldn't create clip / Edit」;
Regenerate Clip costs ◆60, one at a time, and each failed clip is refunded (+60). Full Edit and Export stay disabled
until fixed. Seedance `error_code=4000` failures are upstream.

## KF-031 Backgrounding during generation
- kind: risk · platform: ios · use: analysis, run · tags: background, video, logs
- source: exploration KB ai-mini-drama.md (2026-10-15 New User, 16.9.0 189631; 2026-10-07, 189399)

When iOS background time expires (about +27 s) the turn is detached (log 「backgrounded while generating … destroying
host」, 「turn abandoned, still running in the engine」); the job finishes server-side and shows only on a later reopen,
meanwhile a live 「Generate」 card is shown (DRI261894P0020). Plain Back and reopen keeps the live turn. Vary
background vs Back.

## KF-032 Resume and parallel dramas
- kind: rule · platform: ios · use: analysis, run · tags: resume, concurrency · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-13 PU, 16.9.0 189520; 2026-10-08 PU, 189482)

A force-quit mid-storyboard or mid-video re-attaches and finishes after relaunch; two dramas can storyboard in
parallel; a triple-tapped Generate starts one job. 14 scenes and a 210-s full video were generated on request.

## KF-033 The token_request failure
- kind: risk · platform: ios · use: run, ebug · tags: failure, logs, storyboard, video
- source: exploration KB ai-mini-drama.md (2026-10-07 re-verify, 16.9.0 189463; 2026-10-08, 189482)

「token_request fired outside a turn worker thread; cc session mint must happen on the turn's main loop」 lost
storyboard scenes, voices and videos and was toasted raw (DRI261894P0025, DRI261894P0035). Not seen on 189520; when
it is back, judge no storyboard or video UX on that run.

## KF-034 A failed turn can dead-end the chat
- kind: risk · platform: ios · use: analysis, run · tags: failure, chat
- source: exploration KB ai-mini-drama.md (2026-10-08 QA, 16.9.0 189482; 2026-10-12, 189520)

After a failed turn the template and character-revision paths showed no card, retry or progress
(DRI261894P0036); the free-form path shows 「Something went wrong… Try again」. Server errors reach the user as a 2-s
「Server is busy. Please try again later.」 toast or raw `agent_tool_dispatch… error_code=4000`: read `[AIDrama Toast]`.

## KF-035 Template plus video language
- kind: risk · platform: ios · use: analysis, run · tags: templates, language
- source: exploration KB ai-mini-drama.md (2026-10-12, 16.9.0 189520)

「The Beer Heir」 failed only in Japanese (server executors missing; DRI261895P0003) while other templates worked in
Japanese. Status lines also switch to the video language in an English UI (DRI261894P0015). Vary the video language
per template.

## KF-036 Gateway outages
- kind: quirk · platform: ios · use: run · tags: server, failure, logs
- source: exploration KB ai-mini-drama.md (2026-10-08 PU, 16.9.0 189482; 2026-10-13, 189520)

Outline or turn failures logged 「SSL connection failed」 or toasted 「HTTP request to cc team gateway failed」 were
transient cc-gateway outages, not the prompt or concurrency: wait and re-run before recording a failure.

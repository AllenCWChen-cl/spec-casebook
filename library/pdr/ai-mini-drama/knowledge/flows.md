# Flows

## KF-007 Stage order and the free outline
- kind: rule · platform: ios · use: analysis, run · tags: flow, outline · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07 deep dive, 16.9.0 189399; 2026-09-24 dev re-verify, 189315)

One chat per drama: format card → 「Thinking…」 → Story Outline & Characters Result (beats in 【】 + Possible
Characters) in about 35–40 s for 0 credits → characters → Create storyboard (paid) → 「Choose your video settings」 →
「Here's your drama.」.

## KF-008 Format card
- kind: rule · platform: ios · use: analysis, run · tags: flow, format · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08, 16.9.0 189482; 2026-09-24, 189315)

Shown at once after the first prompt: 「What format would you like for your video?」 with 「1. Video language」
(English default, Spanish, French, German, Japanese, Korean, Chinese) and 「2. Captions」 (「Yes, include captions」
default / 「No captions」), single-select; no aspect-ratio question. CTA 「Generate」 since 189482 (「Continue」 before,
DRI261893-0011). The user bubble then reads 「1. Video language: X / 2. Captions: Y」.

## KF-009 Prompt bar limits
- kind: rule · platform: ios · use: analysis, run · tags: chat, input, limit · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-15 New User, 16.9.0 189631; earlier 2026-09-24, 189315)

Placeholder 「Enter your idea to create drama」; Send is disabled when empty or whitespace-only and a double tap posts
one bubble. 1000-character cap, pasted text truncated: on 189631 inline 「You've reached the 1,000-character limit.
1000/1000」 (earlier builds toasted 「You've reached the maximum length」).

## KF-010 Inspiration chips need focus
- kind: rule · platform: ios · use: analysis, run · tags: chat · authority: observed
- source: exploration KB ai-mini-drama.md (2026-09-24 dev re-verify, 16.9.0 189315)

「✦ Surprise me」 and two inspiration chips appear only once the prompt field is focused (matches the Design Default
frame, keyboard up). The Surprise-me pool is small: repeats within 3 taps.

## KF-011 Leave guard before an outline
- kind: rule · platform: ios · use: analysis, run · tags: leave, history · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399; 2026-10-08 UX, 189482)

Back before an outline exists (prompt only, or during 「Thinking…」) → 「Leave this chat? / Your story outline isn't
ready yet, so this chat won't be saved.」 Leave anyway / Stay; such chats are not saved. It also fires on a blank chat,
while a template chat without outline leaves with no guard (DRI261894P0043). Leaving during storyboard or video
generation has no guard.

## KF-012 Stop on a paid stage confirms
- kind: rule · platform: ios · use: analysis, run · tags: stop, credits · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08 QA, 16.9.0 189482; 2026-10-12 spec check, 189520)

Stop ■ during storyboard or video asks 「Stop generating?」 (「If you leave now…」) with a no-refund warning
(2026-10-08; on 189399 Stop was immediate, uncharged, and re-issued the settings card). Stop during the free
「Thinking…」 stage has no confirmation.

## KF-013 Video settings and prices
- kind: rule · platform: ios · use: analysis, run · tags: video, credits · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399; 2026-10-15, 189631)

「Choose your video settings」: Seedance 2.0 (「Best for cinematic…」) or Seedance 2.0 Mini (「Best for speed, value,
and quick draft」), and optional Video length. About 4 credits/s on 2.0 and 2/s on Mini (2.0 30 s ◆120 on 189631).
A video takes about 8 min; the pill charges on completion, the ledger stamps the start.

## KF-014 Result page
- kind: rule · platform: ios · use: analysis, run · tags: video, export · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399; 2026-10-12, 189520)

「Here's your drama.」 card (Play, Download) → result page with a clip filmstrip, Full Edit (timeline editor) and
Export Full Video (standard Produce sheet, project 「Project MM-DD(n)」). Captions are burned in karaoke-style. ↓ on
the result page saves only the selected clip with 「Saved to Photos」 (DRI261895P0006).

## KF-015 Chat revisions at any stage
- kind: rule · platform: ios · use: analysis, run · tags: chat, revision · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

The chat accepts revisions at every stage (「Add a new character」, 「Please create the full episode.」, a costume
change) and they reach the video. A script change offers 「Script updated! Regenerate the storyboard to match?」.

## KF-016 Templates
- kind: fact · platform: ios · use: analysis, run · tags: templates · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

20 templates in 5 categories (Workplace Romance, Fantasy & Destiny, Urban Romance, Family & Life, Animated Stories);
the landing shows 6, 「More >」 opens the categorised list. Preview autoplays with Mute and 「Make my version」. A
template chat posts the cover as the user bubble; its language set and pre-assigned library characters differ per
template.

## KF-017 Production server has no templates
- kind: quirk · platform: ios · use: run · tags: server, templates
- source: exploration KB ai-mini-drama.md (2026-09-24 production pass and dev re-verify, 16.9.0 189315)

On the production server the template row collapses to empty, 「More >」 does nothing and every Generate toasts
「Server is busy. Please try again later.」: not defects. Run on the Developer Server (Launcher shows yellow
「Developer Server」).

## KF-018 Preview video and full episode
- kind: term · platform: ios · use: analysis, ebug · tags: video, terms
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399; 2026-10-13, 189520)

The first video is a 15/30-s preview (or the chosen length); afterwards the chat offers 「Create the full episode
(N sec)」 (60–210 s seen). A full video can also be asked for directly in the chat.

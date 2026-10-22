#!/usr/bin/env python3
"""Build the AI Mini Drama iOS eBug draft batch from the 2026-10-16 casebook run.

Writes library/ai-mini-drama/ios/ebugs/2026-10-16/20261016_eBug_drafts_AI-Mini-Drama_16.9.0.md
plus the sibling _images/ folder (one NN_ISS-ID folder per entry, JPEGs named 16.9.0_<slug>.jpg).
"""
import csv, os, shutil, subprocess, sys

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/ai-mini-drama/ios"
RUN = f"{ROOT}/runs/2026-10-16"
OUT = f"{ROOT}/ebugs/2026-10-16"
NAME = "20261016_eBug_drafts_AI-Mini-Drama_16.9.0"
V = "16.9.0"
TAG = "AIAgent"
DEVICE = "Device: iPhone 17 Air / iOS 26.2.1"
PM = "AI Mini Drama - PM spec.pdf"
DS = "AI Mini Drama - Design Spec.pdf"

import json as _json
_SS = _json.load(open("/Users/ethanhsu/Desktop/pdr-spec-casebook/library/ai-mini-drama/specs/2026-10-16/spec-set.json"))
_BOARDS = _json.load(open("/Users/ethanhsu/Desktop/pdr-spec-casebook/library/ai-mini-drama/specs/2026-10-16/extracted/boards.json"))
_TITLE = {b["id"]: b["title"] for v in _BOARDS.values() for b in v}

def link(pdf, board):
    which = "Design spec" if "Design" in pdf else "PM spec"
    return f"Spec Link: AI Mini Drama {which}, {_TITLE[board]} board - {_SS['figma'][pdf]}"

# Each entry: iss, title, cls (Functional|UI|UX), sev, owner (RD|PM|Doc), cases, rep (a, b),
# note (QA note), short (symptom after 'AI Mini Drama: '), steps, res, res_zh, exp, exp_zh,
# spec (optional quoted spec string), rec (optional AI recommendation lines), links, imgs [(png, slug)]
E = [
 dict(iss="ISS-AMD-01", title="Video generation always fails", cls="Functional", sev=1, owner="RD",
  cases=["TC-086"], rep=(3, 3),
  note="Seedance 2.0 Mini, Preview 30 s, three attempts (21:41, 21:54, 22:15 on 2026-10-16), each ending after ~5–6 min. Pink fault injection was verified all Off before the attempts (screenshot 069). The storyboard stage worked on the same drama, so this is the video stage only. No credits were charged. This blocks every video-stage case (TC-085, 087–090, 093, 095–099). S1 because no user can get a video out of the feature on this build/server; downgrade if RD shows it is a Developer Server outage.",
  short="Preview video generation always fails with Video couldn't be created",
  steps=["Launch the APP", "Open AI Mini Drama and start the Forbidden Office Romance template", "Finish outline, characters and storyboard", "Choose Seedance 2.0 Mini, Preview - 30 sec, tap Generate", "Wait about 6 minutes and check the result"],
  res="Every preview video attempt (3/3) ends with Video couldn't be created; no video is produced.",
  res_zh="預覽影片生成 3 次皆失敗，顯示 Video couldn't be created。",
  exp="The preview video is generated and shown with Here's your drama.",
  exp_zh="應成功生成預覽影片並顯示 Here's your drama.。",
  links=[link(PM, "pm-main-flow")],
  imgs=[("054-video-result", "amd01_fail1"), ("064-gen3-result", "amd01_fail3"), ("069-tweaks-off", "amd01_injection_off")]),

 dict(iss="ISS-AMD-02", title="Public-figure reference photo is not blocked", cls="Functional", sev=2, owner="RD",
  cases=["TC-054"], rep=(1, 1),
  note="Used the existing device-library portrait of a well-known athlete (Shohei Ohtani, Dodgers). The app generated a front/side/back character that closely resembles him and offered Save to library, charging ◆4. It also ignored Gender: Female. Spec R-046 (PM main flow) requires blocking with 「This photo can't be used」. Likeness/legal risk, so S2.",
  short="Public-figure reference photo is not blocked and a lookalike is generated",
  steps=["Launch the APP", "Open AI Mini Drama and start a custom idea to reach the cast step", "Tap a character slot, then Create my character", "Add a photo of a well-known public figure as Reference and set Gender, Ethnicity and Age", "Tap Generate"],
  res="The public-figure photo is accepted and a character resembling that person is generated.",
  res_zh="名人照片未被阻擋，並生成與本人相似的角色。",
  exp="The photo is blocked with This photo can't be used and no character is generated.",
  exp_zh="應顯示 This photo can't be used 並阻止生成。",
  spec="「This photo can't be used」/「It looks like a real public figure. Please try another photo.」",
  links=[link(PM, "pm-main-flow")],
  imgs=[("126-ref-only-ready", "amd02_celebrity_ref"), ("127-celebrity-result", "amd02_lookalike")]),

 dict(iss="ISS-AMD-03", title="Failed character generation is silent", cls="Functional", sev=2, owner="RD",
  cases=["TC-042", "TC-043"], rep=(2, 2),
  note="Triggered with Pink › [z] AI Mini Drama › Trip image moderation = 1. Generate all ◆12 for 3 characters: 2 applied, 1 failed, and the sheet just went back to 「1 character isn't set yet」 (no 「!」, no 「Couldn't create some images」). Single Generate ◆4: also silent, no 「Couldn't create image」 dialog. Credits: 5908 → 5899 (−9 for 2 successes at ◆4, expected −8) and 5899 → 5898 (−1 on a failed single), so refunds look wrong too — included here rather than as a separate ticket. Specs: PM 10/2 §13.10 (partial) and PM error handling (single).",
  short="Failed character generation shows no error, no ! mark and no refund notice",
  steps=["Launch the APP", "Open AI Mini Drama, start a custom idea with 3 characters", "Tap a character slot, tap ✓, then Generate all", "When one character fails, check the sheet", "Tap Generate for the failed one and check again"],
  res="Failed characters silently return to the unset state; no error message, no ! mark, refund not shown.",
  res_zh="角色生成失敗時無任何提示，直接回到未設定狀態。",
  exp="Failed slots show ! and Couldn't create some images (or Couldn't create image) with the refund note.",
  exp_zh="失敗角色應顯示 ! 並提示生成失敗與已退點。",
  spec="「Couldn't create some images」/「N characters couldn't be created. Your credits have been refunded. Tap a character to try again.」",
  links=[link(PM, "pm-update-3"), link(PM, "pm-error-handling")],
  imgs=[("190-trip-generate-all", "amd03_generate_all"), ("191-trip-result", "amd03_partial_silent"), ("192-single-fail", "amd03_single_silent")]),

 dict(iss="ISS-AMD-04", title="Failed chat turns end silently", cls="UX", sev=2, owner="RD",
  cases=["TC-030"], rep=(2, 2),
  note="Server failure injected with Pink 「Inject failure status = tool_error」 (scope First beat). Two turns failed: confirming the cast (should offer the storyboard) and the typed request 「Create the storyboard」. Each showed 「Continuing the drama production.」 then simply ended — no error, no Try again — leaving the user with nothing to tap. Pink 「Fail every call」 alone did not fail the outline turn. Spec: PM error handling (5xxx copy).",
  short="Failed chat turn ends silently with no error message or Try again",
  steps=["Launch the APP", "Turn on Pink › AI Mini Drama › Inject failure status = tool_error", "Open AI Mini Drama, send an idea and confirm the cast", "Wait for the reply and check the result"],
  res="The turn shows Continuing the drama production. and then ends with no message or retry option.",
  res_zh="對話回合失敗後無任何錯誤訊息或重試按鈕。",
  exp="A failed turn shows the Something went wrong on my end message with Try again.",
  exp_zh="應顯示錯誤訊息並提供 Try again。",
  spec="「Something went wrong on my end. Let's try that again.」",
  links=[link(PM, "pm-error-handling")],
  imgs=[("185-storyboard-offer", "amd04_after_cast"), ("186-ask-storyboard", "amd04_after_request")]),

 dict(iss="ISS-AMD-05", title="Video stage reached without storyboard or settings", cls="Functional", sev=2, owner="RD",
  cases=["TC-091"], rep=(1, 1),
  note="Seen once on 「Passing the Spark」. Sequence: cast set while Pink tool_error injection was on (turn failed silently, ISS-AMD-04), then 「Create the storyboard」 typed, injection later turned off. On reopening, the chat jumped straight from Characters Result to 「Here's your drama.」 with one failed clip — no storyboard, no Storyboard Preview, no video settings, no price, no charge. Reproduced 1/1; it may need the injected failure to trigger. Proposed S2 because it bypasses the paid confirmation step; downgrade if RD confirms it only follows injected failures.",
  short="Drama jumps from characters straight to video without storyboard or settings",
  steps=["Launch the APP", "Open AI Mini Drama, create a custom drama and set the cast", "Type Create the storyboard after a failed turn", "Reopen the drama from History and check the result"],
  res="The chat shows Here's your drama. with a failed clip; no storyboard, video settings or price came first.",
  res_zh="未經分鏡與影片設定，直接進入影片結果。",
  exp="Video is only created after the storyboard and the user's video settings and price confirmation.",
  exp_zh="應先完成分鏡並由使用者選擇影片設定與價格後才生成影片。",
  links=[link(PM, "pm-main-flow")],
  imgs=[("185-storyboard-offer", "amd05_cast_only"), ("193-spark-bottom", "amd05_jump_to_video")]),

 dict(iss="ISS-AMD-06", title="Chat image update fails silently", cls="Functional", sev=2, owner="RD",
  cases=["TC-072", "TC-073"], rep=(1, 1),
  note="Office Romance, storyboard done. 「Update the image for Scene 2 to show rain」 → Iris answered 「Script updated! Regenerate the storyboard to match?」 with a 「Create storyboard」 card ◆3 (spec: an 「Update storyboard images」 card at 2 credits per image). Generate → 「Continuing mini drama production.」 skeleton for ~4.5 min, then it vanished: no new storyboard card, no message, Scene 2 unchanged. The video settings card also disappeared. After reopening, credits had dropped by 4 (5928 → 5924) with nothing produced. Specs PM 10/2 board (R-061, R-062).",
  short="Updating a storyboard image from chat fails silently and the scene never changes",
  steps=["Launch the APP", "Open a finished AI Mini Drama storyboard", "Type Update the image for Scene 2 to show rain and send", "Tap Generate on the card Iris returns", "Wait about 5 minutes and open Scene 2"],
  res="The update card is Create storyboard ◆3; after Generate the progress vanishes and Scene 2 is unchanged.",
  res_zh="聊天更新分鏡圖失敗且無提示，場景圖未更新。",
  exp="An Update storyboard images card appears and the updated scene shows in a new storyboard card.",
  exp_zh="應出現 Update storyboard images 卡片並完成更新。",
  spec="「Update storyboard images」 card, 2 credits per image",
  links=[link(PM, "pm-update-3")],
  imgs=[("037-chat-update-image", "amd06_card"), ("040-update-progress", "amd06_progress"), ("041-update-done", "amd06_vanished"), ("042-scene2-after-update", "amd06_scene2_same")]),

 dict(iss="ISS-AMD-07", title="Credit prices differ from the spec", cls="Functional", sev=2, owner="PM",
  cases=["TC-039", "TC-040", "TC-047", "TC-070", "TC-072"], rep=(5, 5),
  note="Every per-image price seen differs from both PM and Design: character Generate ◆4 per character (spec ◆6; Design 1014 frame shows Generate ◆6 / Generate all ◆18); Create my character ◆4 (spec ◆7); scene Regenerate Image 「Charge 3 credits per image」, ◆6 for location + scene (spec ◆6 per image, ◆12 for both, plus the note 「The location and scene image will both be regenerated (2 images).」 which is missing); chat image update ◆3 for one scene (spec 2 per image). Could be a deliberate price change on the server — PM must confirm which is right before RD or Doc acts.",
  short="Character, scene image and chat update prices differ from the spec",
  steps=["Launch the APP", "Open AI Mini Drama and create a custom drama", "Check the prices on Finish your characters, Create my character and a failed scene's Regenerate Image", "Check the result"],
  res="Prices shown: character ◆4, Create my character ◆4, scene image 3 per image (◆6 for two).",
  res_zh="角色、自建角色與場景重生成價格與 spec 不符。",
  exp="Spec prices: character ◆6, Create my character ◆7, scene image 6 per image (◆12 for two).",
  exp_zh="spec 價格為角色 ◆6、自建角色 ◆7、場景圖每張 6 點。",
  links=[link(PM, "pm-main-flow"), link(PM, "pm-update-6")],
  imgs=[("096-unset-sheet", "amd07_generate_all_8"), ("106-make-character", "amd07_create_4"), ("205-regenerate-page", "amd07_regen_3_per_image")]),

 dict(iss="ISS-AMD-08", title="Leave dialog missing in template chat", cls="UX", sev=3, owner="RD",
  cases=["TC-025"], rep=(1, 1),
  note="Template path (Forbidden Office Romance): Back while the outline was 「Thinking...」 left immediately with no dialog, and the outline kept generating and was saved to History as 「Workplace Romance」 (22 KB). The custom-idea path does show the dialog (TC-026 Pass), so this is template-only.",
  short="Template chat skips the Leave this chat? dialog on Back during outline",
  steps=["Launch the APP", "Open AI Mini Drama and open the Forbidden Office Romance template", "Tap Make my version, then Generate", "Tap Back while the outline is still generating"],
  res="The chat closes immediately with no dialog, and the drama still appears in History.",
  res_zh="範本大綱生成中按返回未出現離開確認對話框。",
  exp="Leave this chat? appears with Leave anyway and Stay before the chat closes.",
  exp_zh="應先顯示 Leave this chat? 確認對話框。",
  spec="「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」",
  links=[link(PM, "pm-main-flow")],
  imgs=[("017-after-generate", "amd08_thinking"), ("021-reopen-workplace", "amd08_saved_anyway")]),

 dict(iss="ISS-AMD-09", title="Leave anyway does not close the chat", cls="UX", sev=3, owner="RD",
  cases=["TC-028"], rep=(2, 2),
  note="Reached from the History button during outline generation. Leave anyway opens History (no entry is created — correct), but Back from History returns to the abandoned chat, frozen after the format answer with no outline and no retry; tapping History again shows the dialog again. Seen twice (whale idea; New Chat from it also re-prompted).",
  short="Leave anyway keeps the abandoned chat and Back returns to it stuck",
  steps=["Launch the APP", "Open AI Mini Drama, send an idea and tap Generate on the format card", "Tap History while the outline generates, then Leave anyway", "Tap Back on History"],
  res="Back returns to the abandoned chat, stuck with no outline and no way to continue.",
  res_zh="選擇 Leave anyway 後，返回仍回到卡住的舊對話。",
  exp="Leave anyway closes the chat, so Back from History does not return to it.",
  exp_zh="Leave anyway 應關閉該對話。",
  links=[link(PM, "pm-main-flow")],
  imgs=[("155-leave-dialog-2", "amd09_dialog"), ("159-chat-still-there", "amd09_back_to_chat"), ("160-chat-stuck-30s", "amd09_still_stuck")]),

 dict(iss="ISS-AMD-10", title="No stop dialog on Back during storyboard generation", cls="UX", sev=3, owner="RD",
  cases=["TC-063"], rep=(1, 2),
  note="Inconsistent: on the template drama the dialog appeared (TC-061 Pass, status 「Thinking…」). On the custom drama 「Borrowed Rain」 the status was 「Advancing the short drama production.」 and Back went straight to History with no 「Stop and lose your credits?」; the storyboard kept generating and finished in the background. 1 of 2 storyboard runs.",
  short="No Stop and lose your credits? dialog on Back during storyboard generation",
  steps=["Launch the APP", "Open a custom AI Mini Drama with the cast set", "Tap Generate on Create storyboard", "Tap Back while it shows Advancing the short drama production."],
  res="The app goes straight to History with no dialog, and the storyboard keeps generating.",
  res_zh="分鏡生成中按返回未出現停止確認對話框。",
  exp="Stop and lose your credits? appears with Leave anyway and Keep Generating.",
  exp_zh="應顯示 Stop and lose your credits? 對話框。",
  spec="「Stop and lose your credits?」",
  links=[link(PM, "pm-main-flow")],
  imgs=[("198-sb-generating", "amd10_generating"), ("199-after-back", "amd10_history_no_dialog")]),

 dict(iss="ISS-AMD-11", title="Create my character discards input without asking", cls="UX", sev=3, owner="RD",
  cases=["TC-055"], rep=(1, 1),
  note="Description (58 chars), Female, East Asian and Age 55 entered; X closed the page at once and reopening showed an empty form. The empty-form case (no dialog) is correct (TC-056 Pass).",
  short="X on Create my character discards entered data without a confirmation",
  steps=["Launch the APP", "Open AI Mini Drama, tap a character slot, then Create my character", "Enter a description, Gender, Ethnicity and Age", "Tap X"],
  res="The page closes immediately and the entered data is lost; no dialog appears.",
  res_zh="已輸入資料時按 X 直接關閉，資料遺失且無確認。",
  exp="Discard this character? appears with Discard and Keep editing.",
  exp_zh="應顯示 Discard this character? 確認對話框。",
  spec="「Discard this character?」/「What you've entered won't be saved.」",
  links=[link(PM, "pm-main-flow")],
  imgs=[("110-all-filled", "amd11_filled"), ("112-reopen-create", "amd11_empty_after_x")]),

 dict(iss="ISS-AMD-12", title="Credit pill is stale outside the chat", cls="UI", sev=3, owner="RD",
  cases=["TC-005"], rep=(2, 2),
  note="After spending credits inside the drama chat (chat pill 5924), the template detail page and the More page still showed 6068 until the landing was re-entered. Seen on two pages.",
  short="Credit pill on template and More pages shows an outdated balance",
  steps=["Launch the APP", "Open AI Mini Drama, spend credits in a drama chat", "Go back to the template detail page and the More page", "Compare the credit pill with the chat"],
  res="The template and More pages show 6068 while the actual balance is 5924.",
  res_zh="範本頁與 More 頁的點數未更新。",
  exp="The credit pill shows the current balance on every page.",
  exp_zh="各頁點數應即時顯示目前餘額。",
  links=[link(PM, "pm-main-flow")],
  imgs=[("054-video-result", "amd12_chat_5924"), ("051-landing-during-video", "amd12_template_6068"), ("058-landing", "amd12_more_6068")]),

 dict(iss="ISS-AMD-13", title="Back during video gives no toast; History shows no processing", cls="UX", sev=3, owner="RD",
  cases=["TC-082", "TC-084"], rep=(2, 2),
  note="Two missing progress cues while a video generates: (1) Back gave no 「We'll keep making your video. Find it in History.」 toast (screenshot ~1.5 s after the tap; chat was opened from History so Back went to History); (2) the History card showed no 「processing..」 label. Also no notice at all when the video then failed while the user was on another page (TC-085 observation).",
  short="Video in progress gives no Back toast and no processing label in History",
  steps=["Launch the APP", "Open an AI Mini Drama with a finished storyboard", "Tap Generate on the video settings card", "Tap Back, then look at the drama card in History"],
  res="No toast appears after Back, and the History card shows no processing.. label.",
  res_zh="影片生成中返回無提示，History 也無 processing 標示。",
  exp="Back shows the keep-making toast and the History card shows processing.. while generating.",
  exp_zh="應顯示 toast，History 卡片應標示 processing..。",
  spec="「We'll keep making your video. Find it in History.」",
  links=[link(PM, "pm-update-5")],
  imgs=[("048-video-gen-progress", "amd13_generating"), ("049-back-during-video", "amd13_no_toast"), ("050-history-during-video", "amd13_no_processing")]),

 dict(iss="ISS-AMD-14", title="Retry after a failed video is inconsistent", cls="UX", sev=3, owner="RD",
  cases=["TC-094"], rep=(2, 2),
  note="Off-case observations O-1 and O-2 (TC-094 itself passed: copy and Try again button are right). First Try again re-showed the video settings card. Second Try again made Iris ask 「Which beat would you like to modify?」 with a single beat (First Day) instead of retrying. Asking 「Create the video」 afterwards returned a card with only 「Video length」 and ◆60 — no model selector and no 「Choose your video settings」 title.",
  short="Try again on a failed video asks which beat to modify instead of retrying",
  steps=["Launch the APP", "Open an AI Mini Drama whose video failed", "Tap Try again on Try creating your video again", "Repeat after the next failure and check the result"],
  res="Try again shows Which beat would you like to modify? with one beat, not the video settings.",
  res_zh="影片失敗後按 Try again 未重試，反而詢問要修改哪個段落。",
  exp="Try again restarts video creation with the full Choose your video settings card.",
  exp_zh="Try again 應重新開始影片生成並顯示完整設定卡。",
  links=[link(PM, "pm-error-handling")],
  imgs=[("055-try-again", "amd14_first_retry"), ("061-after-try-again", "amd14_beat_prompt"), ("062-settings-2pro", "amd14_no_model_selector")]),

 dict(iss="ISS-AMD-15", title="Failed clip message differs from the spec", cls="UX", sev=3, owner="RD",
  cases=["TC-091"], rep=(1, 1),
  note="「Passing the Spark」 video result: one failed-clip card and red 「ⓘ 1 clip couldn't be generated.」; no refund wording, no Edit hint and no 「Fix these issues to export your drama.」/「Fix scenes」. See ISS-AMD-05 for how this state was reached.",
  short="Failed clip shows 1 clip couldn't be generated with no Fix scenes path",
  steps=["Launch the APP", "Open an AI Mini Drama whose video has a failed clip", "Scroll to Here's your drama.", "Check the result"],
  res="Only 1 clip couldn't be generated. is shown; no refund note, Edit hint or Fix scenes button.",
  res_zh="失敗片段僅顯示 1 clip couldn't be generated.，無修復入口。",
  exp="It shows the failed-scenes refund message and Fix these issues to export your drama. with Fix scenes.",
  exp_zh="應顯示退點說明與 Fix scenes 修復入口。",
  spec="「N scenes couldn't be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change.」",
  links=[link(PM, "pm-error-handling")],
  imgs=[("193-spark-bottom", "amd15_failed_clip")]),

 dict(iss="ISS-AMD-16", title="Scene image moderation copy is wrong", cls="UX", sev=3, owner="Doc",
  cases=["TC-067"], rep=(1, 1),
  note="Moderation failure produced with Pink Trip image moderation. Card: 「Couldn't create image ⓘ」 + the 5xx body 「…The service is busy — try again later.」 (should be the 4xx body). ⓘ dialog: 「Couldn't generate this image」/「Your credits have been refunded. The description may not meet our terms of service. Edit the description to try again.」 + Got it — older copy, missing the 10/14 examples and the terms-of-service link. PM 10/14 update board (pm-update-6) is the newest source.",
  short="Scene moderation failure shows service-busy text and old dialog copy",
  steps=["Launch the APP", "Turn on Pink › AI Mini Drama › Trip image moderation", "Generate a storyboard and open a failed scene from View more", "Tap the ⓘ next to Couldn't create image"],
  res="The card says the service is busy, and the ⓘ dialog lacks the examples and terms link.",
  res_zh="審核失敗卡片顯示服務忙碌文案，ⓘ 對話框為舊文案。",
  exp="The card says Try editing the description; the ⓘ dialog uses the 10/14 copy with examples and link.",
  exp_zh="卡片與 ⓘ 對話框應使用 10/14 版審核失敗文案。",
  spec="「Your credits have been refunded. Try editing the description for a different result.」",
  rec=["Card: Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result.", "Dialog: Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again. / Got it"],
  links=[link(PM, "pm-update-6")],
  imgs=[("202-failed-scene-detail", "amd16_card"), ("203-info-dialog", "amd16_dialog")]),

 dict(iss="ISS-AMD-17", title="Policy-blocked idea gets a free-form reply", cls="UX", sev=3, owner="RD",
  cases=["TC-031"], rep=(1, 1),
  note="Idea: explicit gore. After the format card Iris wrote 「I cannot generate stories depicting explicit gore, dismemberment, or graphic violence. I can, however, help create a suspenseful thriller…」. The spec defines a fixed 4xxx message with no button. The free-form answer is reasonable, but it is not the specified string and may vary per request.",
  short="Policy-violating idea gets a free-form refusal instead of the spec message",
  steps=["Launch the APP", "Open AI Mini Drama and tap Create Your Drama", "Send an idea with explicit gore and tap Generate on the format card", "Check the reply"],
  res="Iris replies with a free-form refusal paragraph instead of the fixed policy message.",
  res_zh="違規點子回覆為自由文字，而非 spec 固定文案。",
  exp="The reply is the fixed policy message from the spec, with no button.",
  exp_zh="應顯示 spec 定義的固定違規訊息。",
  spec="「I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way.」",
  links=[link(PM, "pm-error-handling")],
  imgs=[("166-policy-result", "amd17_free_form")]),

 dict(iss="ISS-AMD-18", title="Cast-change prompts don't follow the catalogue", cls="UX", sev=3, owner="RD",
  cases=["TC-045", "TC-103"], rep=(2, 2),
  note="(1) 「Make the barista a retired pilot」: the outline card was re-issued with the role changed and switch icons, but without 「Got it! I've updated the story. I can't redraw characters yet - tap the switch icon…」 or the blue 「Character looks aren't updated automatically…」 note; instead it offered 「Create characters ◆4」. (2) After a storyboard existed, changing a look made Iris say 「The characters look great! Ready to create the storyboard?」 instead of 「Characters updated! Regenerate the storyboard to match?」. Sources: PM 10/14 board (pm-update-7) and the top mockup catalogue (pm-top-mockups).",
  short="Cast change after a storyboard shows the wrong assistant prompt",
  steps=["Launch the APP", "Open a custom AI Mini Drama with a storyboard", "Change a character's look with the switch icon and confirm", "Check Iris's prompt"],
  res="After the cast change Iris repeats the first-time prompt The characters look great",
  res_zh="已有分鏡時更換角色，提示文案仍為初次建立分鏡用語。",
  exp="Iris says Characters updated! Regenerate the storyboard to match?",
  exp_zh="應顯示 Characters updated! Regenerate the storyboard to match?",
  spec="「Characters updated! Regenerate the storyboard to match?」",
  links=[link(PM, "pm-top-mockups"), link(PM, "pm-update-7")],
  imgs=[("206-chars-updated-prompt", "amd18_wrong_prompt"), ("104-chat-change-mid", "amd18_no_got_it")]),

 dict(iss="ISS-AMD-19", title="Character picker copy: PM and Design disagree", cls="UX", sev=3, owner="PM",
  cases=["TC-037", "TC-039", "TC-040", "TC-041"], rep=(4, 4),
  note="The build follows the Design ds-characters frames; the PM main-flow board says otherwise. Leave dialog: app 「Leave without finishing? / If you leave now, your picks won't be saved. / Leave / Keep choosing」 vs PM 「Discard character changes? / …won't be saved if you leave. / Discard / Keep Editing」. Unset sheet: app 「Finish your characters ⓘ / {n} characters aren't set yet / Add a look to continue. / Generate all」 vs PM 「They need a look before you can continue. / Generate with AI / Choose myself」 (Choose myself is missing entirely). Completion: app 「Your characters are ready / Take a look, then confirm to continue.」 vs PM 「{n} characters are all set!」. A PM ruling is needed on which source wins; prices are in ISS-AMD-07.",
  short="Character picker dialogs follow Design copy that conflicts with the PM flow",
  steps=["Launch the APP", "Open AI Mini Drama, create a custom drama and open Choose Character", "Pick a look and tap X; then tap ✓ with characters unset", "Check the dialog and sheet text"],
  res="Dialogs read Leave without finishing? and Add a look to continue.; there is no Choose myself.",
  res_zh="角色選擇對話框文案依 Design，與 PM 流程不一致。",
  exp="PM confirms one copy set and whether Choose myself is required.",
  exp_zh="需 PM 決定採用哪一版文案及是否保留 Choose myself。",
  links=[link(PM, "pm-main-flow"), link(DS, "ds-characters")],
  imgs=[("093-x-discard", "amd19_leave_dialog"), ("096-unset-sheet", "amd19_unset_sheet"), ("098-all-set", "amd19_ready")]),

 dict(iss="ISS-AMD-20", title="No confirmation before credits are charged", cls="UX", sev=3, owner="PM",
  cases=["TC-115"], rep=(1, 1),
  note="Generate on Create storyboard ◆37 charged immediately (5965 → 5928) with no 「You'll have N left」 confirmation. The draft already flagged this as open question Q-3: the Design characters frame shows 「You have 182 credits left」 under the button instead of a confirm step, which matches the build. PM decision request, not an RD defect unless PM says the confirm is required.",
  short="Paid actions charge immediately with no You'll have N left confirmation",
  steps=["Launch the APP", "Open an AI Mini Drama at Create storyboard", "Tap Generate", "Check whether a confirmation appears before the charge"],
  res="Credits are deducted immediately; no You'll have n left confirmation appears.",
  res_zh="付費動作直接扣點，未出現確認畫面。",
  exp="PM confirms whether a confirmation step is required before charging.",
  exp_zh="需 PM 確認扣點前是否需要確認步驟。",
  links=[link(PM, "pm-main-flow"), link(DS, "ds-characters")],
  imgs=[("024-after-storyboard-generate", "amd20_before"), ("026-keep-generating", "amd20_charged")]),

 dict(iss="ISS-AMD-21", title="Surprise me replaces instead of appending", cls="UX", sev=3, owner="RD",
  cases=["TC-014"], rep=(1, 1),
  note="First tap filled 「A fake psychic keeps making random predictions…」; the second tap replaced it with 「He pretends to be rich for a date…」. PM main flow says repeated taps append.",
  short="Surprise me replaces the idea text instead of appending a new inspiration",
  steps=["Launch the APP", "Open AI Mini Drama and tap Create Your Drama", "Tap Surprise me twice", "Check the input"],
  res="The second tap replaces the first inspiration; only one remains in the input.",
  res_zh="再次按 Surprise me 會取代原文字而非附加。",
  exp="The second tap appends another inspiration after the existing text.",
  exp_zh="再次按 Surprise me 應附加在原文字後。",
  links=[link(PM, "pm-main-flow")],
  imgs=[("075-surprise1", "amd21_first"), ("076-surprise2", "amd21_replaced")]),

 dict(iss="ISS-AMD-22", title="Chat jumps after closing Choose Character", cls="UX", sev=3, owner="RD",
  cases=["TC-102"], rep=(1, 1),
  note="Opened Choose Character from the switch icon on the newest card (chat scrolled to the bottom), closed it: the chat came back scrolled up to the first outline card. The History round-trip keeps the position (TC-101 Pass).",
  short="Chat scroll position jumps to an earlier card after closing Choose Character",
  steps=["Launch the APP", "Open an AI Mini Drama with a cast", "Tap a character's switch icon, then close Choose Character", "Check the chat position"],
  res="The chat scrolls back to an earlier outline card instead of staying where it was.",
  res_zh="關閉角色選擇後，聊天捲動位置跳到較早的卡片。",
  exp="The chat stays at the same position as before Choose Character was opened.",
  exp_zh="關閉後應維持原本的捲動位置。",
  links=[link(PM, "pm-1002-update")],
  imgs=[("104-chat-change-mid", "amd22_before"), ("136-after-picker-close", "amd22_after")]),

 dict(iss="ISS-AMD-23", title="Rename does not move the drama to the top", cls="UX", sev=3, owner="RD",
  cases=["TC-108"], rep=(1, 1),
  note="Renamed the oldest drama 「Quiet Warmth」 → 「New Title」; it stayed last with its old time (2026/10/16 01:52 PM). Viewing without editing correctly keeps the order (TC-107 Pass).",
  short="Renamed drama stays in place in History and keeps its old time",
  steps=["Launch the APP", "Open AI Mini Drama › History with 2+ dramas", "Rename the oldest drama with ⋮ › Rename", "Check the list order and time"],
  res="The renamed drama stays at the bottom and its time does not change.",
  res_zh="重新命名後作品未移至頂端，時間也未更新。",
  exp="The renamed drama moves to the top and its time updates.",
  exp_zh="重新命名後應移至頂端並更新時間。",
  links=[link(PM, "pm-update-5")],
  imgs=[("142-history-after-view", "amd23_before"), ("149-renamed-trim", "amd23_after")]),

 dict(iss="ISS-AMD-24", title="Rename OK enabled for empty name", cls="UX", sev=3, owner="RD",
  cases=["TC-109"], rep=(1, 1),
  note="OK stays enabled with an empty field and with spaces only; tapping it closes the dialog and silently keeps the old name. Harmless, but the spec says OK is disabled.",
  short="Rename dialog OK stays enabled when the name is empty or only spaces",
  steps=["Launch the APP", "Open AI Mini Drama › History", "Tap ⋮ › Rename on a drama", "Clear the name, then enter only spaces"],
  res="OK stays enabled; tapping it closes the dialog and silently keeps the old name.",
  res_zh="名稱為空白時 OK 仍可點擊。",
  exp="OK is disabled while the name is empty or only spaces.",
  exp_zh="名稱為空或僅空白時 OK 應停用。",
  links=[link(PM, "pm-update-5")],
  imgs=[("145-rename-empty", "amd24_empty"), ("146-rename-spaces", "amd24_spaces")]),

 dict(iss="ISS-AMD-25", title="History hint not dismissed by an outside tap", cls="UX", sev=3, owner="RD",
  cases=["TC-105"], rep=(2, 2),
  note="The blue History info hint stays after tapping empty space and covers the first card's date; it reappeared on later visits too.",
  short="History info hint stays after an outside tap and covers the first card",
  steps=["Launch the APP", "Open AI Mini Drama › History", "Tap the ⓘ to show the hint, then tap empty space", "Check the hint"],
  res="The hint stays on screen and covers the first card's date.",
  res_zh="點擊空白處後 History 提示仍未關閉。",
  exp="Tapping outside the hint dismisses it.",
  exp_zh="點擊提示外區域應關閉提示。",
  links=[link(DS, "ds-recent-task")],
  imgs=[("049-back-during-video", "amd25_hint_stays")]),

 dict(iss="ISS-AMD-26", title="Character name labels are clipped", cls="UI", sev=3, owner="RD",
  cases=["TC-039"], rep=(3, 3),
  note="Off-case observation O-8. In the Finish your characters sheet the name labels under the slots lose their descenders: 「Maya Lin」 reads 「Mava Lin」, 「Julian Hayes」 reads 「Julian Haves」. Seen on every sheet opened (3 times).",
  short="Finish your characters sheet clips the bottom of character names",
  steps=["Launch the APP", "Open a custom AI Mini Drama and tap ✓ in Choose Character with characters unset", "Look at the names under the slots"],
  res="Name labels are cut at the bottom, so Maya reads Mava and Hayes reads Haves.",
  res_zh="角色名稱下緣被裁切，如 Maya 看起來像 Mava。",
  exp="Character names are shown in full without clipping.",
  exp_zh="角色名稱應完整顯示。",
  links=[link(DS, "ds-characters")],
  imgs=[("096b-names-clipped", "amd26_clipped"), ("096-unset-sheet", "amd26_sheet")]),

 dict(iss="ISS-AMD-27", title="More ideas chip missing in some states", cls="UX", sev=3, owner="RD",
  cases=["TC-019"], rep=(1, 1),
  note="With the custom outline and 「Ready to create your characters?」 card on screen, no 「More ideas +」 chip; it showed in other states (after 「Which beat would you like to modify?」).",
  short="More ideas + chip is missing above the input once the chat has content",
  steps=["Launch the APP", "Open AI Mini Drama, send an idea and wait for the outline", "Look above the input"],
  res="No More ideas + chip is shown above the input.",
  res_zh="聊天已有內容時未顯示 More ideas + 晶片。",
  exp="More ideas + is shown above the input once the chat has content.",
  exp_zh="聊天有內容後應顯示 More ideas +。",
  links=[link(PM, "pm-top-mockups")],
  imgs=[("086-custom-bottom", "amd27_no_chip"), ("061-after-try-again", "amd27_chip_elsewhere")]),

 dict(iss="ISS-AMD-28", title="Template outline shows only Thinking...", cls="UX", sev=3, owner="RD",
  cases=["TC-023"], rep=(1, 1),
  note="Template path only: the outline wait shows 「Thinking...」 with a skeleton. The custom path shows a status line (「Creating the story outline and project for the romance drama.」).",
  short="Template outline wait shows only Thinking... with no status line",
  steps=["Launch the APP", "Open AI Mini Drama, open a template and tap Make my version", "Tap Generate on the format card", "Watch the chat while the outline generates"],
  res="Only Thinking... with a skeleton is shown during the template outline.",
  res_zh="範本大綱生成時僅顯示 Thinking...。",
  exp="A status line such as Writing your story... is shown while the outline is written.",
  exp_zh="應顯示 Writing your story... 等進度文字。",
  spec="「I'll create a story outline - give me a moment...」 / 「Writing your story...」",
  links=[link(PM, "pm-1002-update")],
  imgs=[("017-after-generate", "amd28_thinking")]),

 dict(iss="ISS-AMD-29", title="Video settings copy differs", cls="UI", sev=3, owner="Doc",
  cases=["TC-079"], rep=(2, 2),
  note="Mini description 「Best for speed, value, and quick draft」 (spec 「quick drafts」); button 「Generate」 (Design 「Generate Video」; one PM mockup also shows plain 「Generate」); lengths use 「Preview - 30 sec」 with a hyphen instead of 「•」.",
  short="Video settings card says quick draft instead of quick drafts",
  steps=["Launch the APP", "Open an AI Mini Drama with a finished storyboard", "Select Seedance 2.0 Mini on Choose your video settings", "Read the description"],
  res="The Mini description reads Best for speed, value, and quick draft.",
  res_zh="Mini 模型說明文字少了複數 s。",
  exp="The Mini description reads Best for speed, value, and quick drafts.",
  exp_zh="應為 quick drafts。",
  spec="「Best for speed, value, and quick drafts」",
  rec=["Seedance 2.0 Mini: Best for speed, value, and quick drafts", "Button: Generate Video"],
  links=[link(DS, "ds-video")],
  imgs=[("029-mini-preview", "amd29_quick_draft")]),

 dict(iss="ISS-AMD-30", title="Create my character prompt grammar", cls="UI", sev=3, owner="Doc",
  cases=["TC-047"], rep=(2, 2),
  note="Header reads 「Tell us what Maya Lin look like — the more detail, the better.」 The Design frame has both 「looks like」 and 「look like」 variants; singular names need 「looks」.",
  short="Create my character prompt says what Maya Lin look like",
  steps=["Launch the APP", "Open AI Mini Drama, tap a character slot, then Create my character", "Read the prompt under the title"],
  res="The prompt reads Tell us what Maya Lin look like — the more detail, the better.",
  res_zh="提示文字文法錯誤（look 應為 looks）。",
  exp="The prompt reads Tell us what Maya Lin looks like — the more detail, the better.",
  exp_zh="應為 looks like。",
  spec="「Tell us what Sophie looks like - the more detail, the better.」",
  rec=["Tell us what Maya Lin looks like — the more detail, the better."],
  links=[link(DS, "ds-characters")],
  imgs=[("106-make-character", "amd30_look_like")]),

 dict(iss="ISS-AMD-31", title="Keyboard cannot be dismissed in an empty chat", cls="UX", sev=3, owner="RD",
  cases=["TC-018"], rep=(2, 2),
  note="Off-case observation O-7 (TC-018 passed once the chat had content). In a brand-new chat the keyboard stayed up after tapping outside the input, swiping down and a programmatic hide; the only way out was sending or leaving. That also hides the 3-line collapse in the empty chat.",
  short="Keyboard cannot be dismissed in a new empty chat",
  steps=["Launch the APP", "Open AI Mini Drama and tap Create Your Drama", "Type some text, then tap outside the input or swipe down"],
  res="The keyboard stays open; there is no way to dismiss it without sending.",
  res_zh="新對話中無法收起鍵盤。",
  exp="Tapping outside the input or swiping down dismisses the keyboard.",
  exp_zh="點擊輸入框外或下滑應可收起鍵盤。",
  links=[link(DS, "ds-home-custom-chat")],
  imgs=[("081-collapsed", "amd31_keyboard_stuck")]),
]

# ---- 2026-10-19: reviewer decisions (Copy decisions, Ethan_Hsu) + Design-outranks-PM rule
USER = {  # iss: (sev, owner)
 "ISS-AMD-01": (1, "RD"), "ISS-AMD-02": (2, "PM"), "ISS-AMD-03": (2, "RD"), "ISS-AMD-04": (2, "RD"),
 "ISS-AMD-05": (2, "RD"), "ISS-AMD-06": (2, "RD"), "ISS-AMD-07": (2, "PM"), "ISS-AMD-08": (2, "RD"),
 "ISS-AMD-09": (3, "RD"), "ISS-AMD-10": (2, "RD"), "ISS-AMD-11": (3, "RD"), "ISS-AMD-12": (2, "RD"),
 "ISS-AMD-13": (3, "RD"), "ISS-AMD-14": (2, "RD"), "ISS-AMD-15": (2, "RD"), "ISS-AMD-16": (3, "RD"),
 "ISS-AMD-17": (3, "RD"), "ISS-AMD-18": (3, "RD"), "ISS-AMD-19": (3, "PM"), "ISS-AMD-20": (3, "RD"),
 "ISS-AMD-21": (3, "RD"), "ISS-AMD-22": (2, "RD"), "ISS-AMD-23": (2, "RD"), "ISS-AMD-24": (3, "RD"),
 "ISS-AMD-25": (3, "RD"), "ISS-AMD-26": (2, "RD"), "ISS-AMD-27": (3, "RD"), "ISS-AMD-28": (3, "RD"),
 "ISS-AMD-29": (3, "PM"), "ISS-AMD-30": (3, "Doc"), "ISS-AMD-31": (3, "RD"),
}
WITHDRAWN = {
 "ISS-AMD-16": "Withdrawn 2026-10-19 under the Design-outranks-PM rule: the card body 「…The service is busy — try again later.」 with ⓘ matches the Design 10/12 storyboard frame, and the ⓘ dialog text matches one of the two Design dialog variants. Only PM's 10/14 copy differs, and PM is not the expected result where Design speaks. TC-067 re-judged Pass.",
 "ISS-AMD-19": "Withdrawn 2026-10-19 under the Design-outranks-PM rule (reviewer note: 「Design spec has higher priority」): every string here matches the Design characters board, so the build is right and the PM wording is not a defect. TC-037 and TC-041 re-judged Pass; TC-039/TC-040 stay Fail only for the price (entry ISS-AMD-07).",
}
_by = {e["iss"]: e for e in E}
for iss, (sev, own) in USER.items():
    _by[iss]["sev"], _by[iss]["owner"] = sev, own
# Design-first content updates
_by["ISS-AMD-01"]["links"] = [link(DS, "ds-video")]
_by["ISS-AMD-03"].update(
  exp="Failed slots show ! and Couldn't create image with the refund note, as in the Design spec.",
  exp_zh="失敗角色應顯示 ! 及 Couldn't create image 與退點說明。",
  spec="「Couldn't create image」/「We couldn't create this character and your credits have been refunded. Try again later.」",
  links=[link(DS, "ds-characters"), link(PM, "pm-update-3")])
_by["ISS-AMD-04"]["links"] = [link(DS, "ds-extra"), link(PM, "pm-error-handling")]
_by["ISS-AMD-05"]["links"] = [link(DS, "ds-main-flow")]
_by["ISS-AMD-07"].update(
  note="Prices on this build differ from the Design spec, which is the expected result where it differs from PM: character Generate ◆4 per character (Design: Generate ◆6 / Generate all ◆18 for 3); Create my character ◆4 (Design: Generate ◆6; PM had ◆7); scene Regenerate Image 「Charge 3 credits per image」, ◆6 for location + scene (Design: Regenerate Image ◆12, 6 per image). The chat image update card was ◆3 for one scene (PM: 2 per image; Design has no frame). Owner PM per reviewer: confirm whether the server prices or the spec prices are current.",
  exp="Design prices: character ◆6 each, Create my character ◆6, location + scene regenerate ◆12.",
  exp_zh="依 Design：角色每位 ◆6、自建角色 ◆6、場景與地點重生成 ◆12。",
  links=[link(DS, "ds-characters"), link(DS, "ds-storyboard")])
_by["ISS-AMD-15"].update(links=[link(DS, "ds-video")],
  spec="「{n} scenes couldn't be generated. Your credits have been refunded.」 + 「Fix scenes」".replace("{n}", "N"))
_by["ISS-AMD-17"]["links"] = [link(DS, "ds-extra")]
_by["ISS-AMD-18"]["links"] = [link(PM, "pm-top-mockups"), link(DS, "ds-characters")]
_by["ISS-AMD-20"].update(
  title="Video settings card lacks the remaining-credit line", cls="UX",
  note="Re-framed 2026-10-19 under the Design-outranks-PM rule. PM asked for a confirmation step (Q-3); Design has none, and instead shows 「You'll have 160 left」 under Generate on the video settings card (MX-linked frames). The build charges on tap (correct per Design) but the card shows only 「◆120」 and Generate, with no remaining-balance line. Owner moved from PM to RD because Design defines it.",
  short="Video settings card does not show You'll have N left under Generate",
  steps=["Launch the APP", "Open an AI Mini Drama with a finished storyboard", "Look at the Choose your video settings card under Generate"],
  res="The card shows only the ◆ price and Generate; there is no You'll have N left line.",
  res_zh="影片設定卡未顯示扣點後剩餘點數。",
  exp="Under Generate the card shows You'll have N left, as in the Design spec.",
  exp_zh="依 Design，Generate 下方應顯示 You'll have N left。",
  spec="「You'll have 160 left」 (Design example)",
  links=[link(DS, "ds-mx-link")],
  imgs=[("028-bottom", "amd20_no_remaining_line")])
_by["ISS-AMD-25"]["links"] = [link(DS, "ds-recent-task")]
_by["ISS-AMD-26"]["links"] = [link(DS, "ds-characters")]
_by["ISS-AMD-27"]["links"] = [link(DS, "ds-extra"), link(PM, "pm-top-mockups")]
_by["ISS-AMD-29"].update(
  note="Design's video board shows the button as 「Generate Video」 (the app says 「Generate」); Design does not show the Mini description, so PM's 「Best for speed, value, and quick drafts」 applies (the app drops the s). Lengths use 「Preview - 30 sec」 with a hyphen instead of 「•」.",
  links=[link(DS, "ds-video"), link(PM, "pm-main-flow")])
_by["ISS-AMD-30"]["links"] = [link(DS, "ds-characters")]
_by["ISS-AMD-31"]["links"] = [link(DS, "ds-home-custom-chat")]
for iss, why in WITHDRAWN.items():
    _by[iss]["withdrawn"] = why
E = [e for e in E if not e.get("withdrawn")] + [e for e in E if e.get("withdrawn")]

# Cases and observations that do NOT become entries
NOT_RAISED = [
 ("O-3", "Drama renamed by the AI during the flow (Workplace Romance → Office Romance); landing Recent Task showed the old name", "Observation — naming is AI-generated; the stale Recent Task name is minor. Raise only if PM wants names fixed after creation."),
 ("O-4", "Reopening a drama drops the user's own chat messages", "Not a defect — matches the History info text (only outline, images and videos are kept)."),
 ("O-6", "Back from a chat opened from History returns to History", "Not a defect — normal navigation stack."),
 ("O-9", "「Generate all」 posts a user bubble reading 「Generate with AI」", "Not raised separately — folded into the copy conflict in ISS-AMD-19 for PM."),
]

def jpg(src, dst):
    subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80",
                    src, "--out", dst], check=True, capture_output=True)

def main():
    results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}
    fails = [k for k, r in results.items() if r["Result"] == "Fail"]
    covered = {c for e in E for c in e["cases"]}
    missing = [f for f in fails if f not in covered]
    if missing:
        sys.exit(f"failed cases with no entry: {missing}")

    img_root = f"{OUT}/{NAME}_images"
    if os.path.isdir(img_root):
        shutil.rmtree(img_root)
    os.makedirs(img_root)

    L = []
    w = L.append
    w(f"# AI Mini Drama (iOS) — eBug drafts, PDR-I {V} build 189631")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/ai-mini-drama/ios/runs/2026-10-16/` — all 118 cases of the draft table `drafts/20261016-164729/draft.csv` executed on {DEVICE[8:]} through Appium/WebDriverAgent, TestFlight build {V} (189631), Developer Server. Results after the 2026-10-19 Design-first re-judgement: 65 Pass, 31 Fail, 22 Blocked, 0 Not run. Off-case observations: `runs/2026-10-16/observations.md`.")
    w("")
    w(f"**Reviewer decisions (2026-10-19):** Account Ethan_Hsu · Method API · Source tag `[{TAG}]` · TRCode TR261014-0058. Severity and owner on each heading are the reviewer's. **Spec priority:** the Design spec outranks the PM spec; where they differ, Design is the expected result.")
    w("")
    w("**Spec Link:** links point to the two Figma files the PDFs were exported from (PM: node 2016-2, Design: node 116-7873) and name the board on that canvas.")
    w("")
    w("**Order:** entries to file come first, then the **⛔ Withdrawn by QA** section (ISS-AMD-16 and ISS-AMD-19, withdrawn under the Design-first rule). Entries were renumbered on 2026-10-19, so trust the ISS-ID over the number. Each entry names the case IDs it came from.")
    w("")
    w("Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate · Owner: RD (build differs from a correct spec), PM (a ruling is needed), Doc (on-screen copy).")
    w("")
    for n, e in enumerate(E, 1):
        nn = f"{n:02d}"
        folder = f"{nn}_{e['iss']}"
        os.makedirs(f"{img_root}/{folder}")
        names = []
        for png, slug in e["imgs"]:
            src = f"{RUN}/screenshots/{png}.png"
            if not os.path.exists(src):
                sys.exit(f"missing screenshot {src}")
            name = f"{V}_{slug}.jpg"
            jpg(src, f"{img_root}/{folder}/{name}")
            names.append(name)
        if e.get("withdrawn") and not any(x.get("withdrawn") for x in E[:n-1]):
            w("---"); w(""); w("# ⛔ Withdrawn by QA — do not file"); w("")
            w("These entries were drafted on 2026-10-16 and shown on the review page. They are kept so the original wording stays traceable, with the reason they were withdrawn. Nothing below may be pasted into eBug."); w("")
        tagtype = "" if e["cls"] == "Functional" else f"[{e['cls']}]"
        short = f"PDR-I {V} - [{TAG}]{tagtype} AI Mini Drama: {e['short']}"
        w("---")
        w("")
        w(f"## {n}. {'⛔ WITHDRAWN — ' if e.get('withdrawn') else ''}{e['iss']} — {e['title']}  ·  Class: {e['cls']}  ·  Severity: S{e['sev']}  ·  Owner: {e['owner']}")
        w("")
        w(f"**Report step:** {', '.join(e['cases'])}  ·  **Reproduce:** {e['rep'][0]}/{e['rep'][1]}  ·  **Verified on:** {V}.189631")
        w("")
        if e.get("withdrawn"):
            w(f"> **⛔ QA note — do NOT paste into eBug; withdrawn.** {e['withdrawn']} Original note: {e['note']}")
        else:
            w(f"> **QA note — not pasted into eBug.** {e['note']}")
        w("")
        w("**Short Description:**")
        w("")
        w("```")
        w(short)
        w("```")
        w("")
        w("**Description:**")
        w("")
        w("```")
        w("Repro Steps:")
        for i, s in enumerate(e["steps"], 1):
            w(f"{i}. {s}")
        if not e["steps"][-1].lower().startswith("check"):
            w(f"{len(e['steps']) + 1}. Check the result")
        w("")
        w("Result:")
        w(e["res"])
        w(f"摘要：{e['res_zh']}")
        w(" ".join("{" + x + "}" for x in names))
        w("")
        w("Expect Result:")
        w(e["exp"])
        w(f"摘要：{e['exp_zh']}")
        if e.get("spec"):
            w(f"Spec string: {e['spec']}")
        if e.get("rec"):
            w("")
            w("[AI Recommendation]")
            for r in e["rec"]:
                w(r)
        w("")
        w("Note:")
        w(DEVICE)
        for l in e["links"][:2]:
            w(l)
        w("<Claude Reviewed>")
        w("```")
        w("")
        w(f"**Images:** `{NAME}_images/{folder}/`")
        w("")

    w("---")
    w("")
    w("## Not raised (for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in NOT_RAISED:
        w(f"| {k} | {a} | {b} |")
    blocked = [k for k, r in results.items() if r["Result"] == "Blocked"]
    w(f"| ⏳ Blocked ({len(blocked)}) | {', '.join(blocked)} | Not executable on this build/account — no verdict, so nothing to raise. Exact blockers are in results.csv and on the review page. |")
    w("")
    w("## Reconciliation against the report")
    w("")
    w(f"The run is the report: {len(fails)} failed cases (after the 2026-10-19 Design-first re-judgement; TC-037, TC-041 and TC-067 moved to Pass) plus 11 off-case observations (O-1…O-11).")
    w("")
    live = [e for e in E if not e.get("withdrawn")]
    from_fail = [e for e in live if any(results[c]["Result"] == "Fail" for c in e["cases"])]
    obs_only = [e for e in live if e not in from_fail]
    w("| Step | Count | Running total |")
    w("|---|---|---|")
    w(f"| Failed cases | {len(fails)} | {len(fails)} |")
    w(f"| Merged into shared defects or split across entries (see map; e.g. TC-039 → price + clipped names, five price cases → one entry) | {len(from_fail) - len(fails):+d} | {len(from_fail)} |")
    w(f"| Entries raised from observations on passing cases ({', '.join(e['iss'] for e in obs_only)}) | +{len(obs_only)} | **{len(live)} to file** |")
    w(f"| Withdrawn under the Design-first rule ({', '.join(e['iss'] for e in E if e.get('withdrawn'))}) | kept below the line | {len(E)} entries in the file |")
    w("")
    w("### Row-by-row map")
    w("")
    w("| Source | Became |")
    w("|---|---|")
    for f in sorted(fails):
        ents = [f"{i}. {e['iss']}" for i, e in enumerate(E, 1) if f in e["cases"] and not e.get("withdrawn")]
        w(f"| {f} | {' + '.join(ents)} |")
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    r_ = lambda iss: f"{num[iss]}. {iss}"
    omap = {"O-1": r_("ISS-AMD-14"), "O-2": r_("ISS-AMD-14"), "O-3": "not raised", "O-4": "not raised",
            "O-5": "folded into " + r_("ISS-AMD-06"), "O-6": "not raised", "O-7": r_("ISS-AMD-31"),
            "O-8": r_("ISS-AMD-26"), "O-9": "not raised (matches the Design copy family; see withdrawn ISS-AMD-19)",
            "O-10": "folded into " + r_("ISS-AMD-04"), "O-11": r_("ISS-AMD-05")}
    for e in E:
        if e.get("withdrawn"):
            w(f"| {r_(e['iss'])} (withdrawn) | {', '.join(e['cases'])} — re-judged under the Design-first rule |")
    for k, v in omap.items():
        w(f"| {k} | {v} |")
    w("")
    w("### Owner split")
    w("")
    w("| Owner | Entries |")
    w("|---|---|")
    for o in ("RD", "PM", "Doc"):
        w(f"| {o} | {', '.join(str(i) for i, e in enumerate(E, 1) if e['owner'] == o and not e.get('withdrawn'))} |")
    w("")
    w("### Filing order")
    w("")
    order = [i for o in ("RD", "PM", "Doc") for i, e in enumerate(E, 1) if e["owner"] == o and not e.get("withdrawn")]
    w("RD, then PM rulings, then Doc (duplicates on hold are filed as comments/reopens, not new tickets): " + ", ".join(f"**{i}**" for i in order) + ".")
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries → {OUT}/{NAME}.md")

main()

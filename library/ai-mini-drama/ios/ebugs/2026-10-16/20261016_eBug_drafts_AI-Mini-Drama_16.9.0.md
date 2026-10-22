# AI Mini Drama (iOS) — eBug drafts, PDR-I 16.9.0 build 189631

**Source:** pdr-spec-casebook run `library/ai-mini-drama/ios/runs/2026-10-16/` — all 118 cases of the draft table `drafts/20261016-164729/draft.csv` executed on iPhone 17 Air / iOS 26.2.1 through Appium/WebDriverAgent, TestFlight build 16.9.0 (189631), Developer Server. Results after the 2026-10-19 Design-first re-judgement: 65 Pass, 31 Fail, 22 Blocked, 0 Not run. Off-case observations: `runs/2026-10-16/observations.md`.

**Reviewer decisions (2026-10-19):** Account Ethan_Hsu · Method API · Source tag `[AIAgent]` · TRCode TR261014-0058. Severity and owner on each heading are the reviewer's. **Spec priority:** the Design spec outranks the PM spec; where they differ, Design is the expected result.

**Spec Link:** links point to the two Figma files the PDFs were exported from (PM: node 2016-2, Design: node 116-7873) and name the board on that canvas.

**Order:** entries to file come first, then the **⛔ Withdrawn by QA** section (ISS-AMD-16 and ISS-AMD-19, withdrawn under the Design-first rule). Entries were renumbered on 2026-10-19, so trust the ISS-ID over the number. Each entry names the case IDs it came from.

Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate · Owner: RD (build differs from a correct spec), PM (a ruling is needed), Doc (on-screen copy).

---

## 1. ISS-AMD-01 — Video generation always fails  ·  Class: Functional  ·  Severity: S1  ·  Owner: RD

**Report step:** TC-086  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Seedance 2.0 Mini, Preview 30 s, three attempts (21:41, 21:54, 22:15 on 2026-10-16), each ending after ~5–6 min. Pink fault injection was verified all Off before the attempts (screenshot 069). The storyboard stage worked on the same drama, so this is the video stage only. No credits were charged. This blocks every video-stage case (TC-085, 087–090, 093, 095–099). S1 because no user can get a video out of the feature on this build/server; downgrade if RD shows it is a Developer Server outage.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Preview video generation always fails with Video couldn't be created
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and start the Forbidden Office Romance template
3. Finish outline, characters and storyboard
4. Choose Seedance 2.0 Mini, Preview - 30 sec, tap Generate
5. Wait about 6 minutes and check the result
6. Check the result

Result:
Every preview video attempt (3/3) ends with Video couldn't be created; no video is produced.
摘要：預覽影片生成 3 次皆失敗，顯示 Video couldn't be created。
{16.9.0_amd01_fail1.jpg} {16.9.0_amd01_fail3.jpg} {16.9.0_amd01_injection_off.jpg}

Expect Result:
The preview video is generated and shown with Here's your drama.
摘要：應成功生成預覽影片並顯示 Here's your drama.。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Video board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/01_ISS-AMD-01/`

---

## 2. ISS-AMD-02 — Public-figure reference photo is not blocked  ·  Class: Functional  ·  Severity: S2  ·  Owner: PM

**Report step:** TC-054  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Used the existing device-library portrait of a well-known athlete (Shohei Ohtani, Dodgers). The app generated a front/side/back character that closely resembles him and offered Save to library, charging ◆4. It also ignored Gender: Female. Spec R-046 (PM main flow) requires blocking with 「This photo can't be used」. Likeness/legal risk, so S2.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Public-figure reference photo is not blocked and a lookalike is generated
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and start a custom idea to reach the cast step
3. Tap a character slot, then Create my character
4. Add a photo of a well-known public figure as Reference and set Gender, Ethnicity and Age
5. Tap Generate
6. Check the result

Result:
The public-figure photo is accepted and a character resembling that person is generated.
摘要：名人照片未被阻擋，並生成與本人相似的角色。
{16.9.0_amd02_celebrity_ref.jpg} {16.9.0_amd02_lookalike.jpg}

Expect Result:
The photo is blocked with This photo can't be used and no character is generated.
摘要：應顯示 This photo can't be used 並阻止生成。
Spec string: 「This photo can't be used」/「It looks like a real public figure. Please try another photo.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/02_ISS-AMD-02/`

---

## 3. ISS-AMD-03 — Failed character generation is silent  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-042, TC-043  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Triggered with Pink › [z] AI Mini Drama › Trip image moderation = 1. Generate all ◆12 for 3 characters: 2 applied, 1 failed, and the sheet just went back to 「1 character isn't set yet」 (no 「!」, no 「Couldn't create some images」). Single Generate ◆4: also silent, no 「Couldn't create image」 dialog. Credits: 5908 → 5899 (−9 for 2 successes at ◆4, expected −8) and 5899 → 5898 (−1 on a failed single), so refunds look wrong too — included here rather than as a separate ticket. Specs: PM 10/2 §13.10 (partial) and PM error handling (single).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character generation shows no error, no ! mark and no refund notice
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, start a custom idea with 3 characters
3. Tap a character slot, tap ✓, then Generate all
4. When one character fails, check the sheet
5. Tap Generate for the failed one and check again
6. Check the result

Result:
Failed characters silently return to the unset state; no error message, no ! mark, refund not shown.
摘要：角色生成失敗時無任何提示，直接回到未設定狀態。
{16.9.0_amd03_generate_all.jpg} {16.9.0_amd03_partial_silent.jpg} {16.9.0_amd03_single_silent.jpg}

Expect Result:
Failed slots show ! and Couldn't create image with the refund note, as in the Design spec.
摘要：失敗角色應顯示 ! 及 Couldn't create image 與退點說明。
Spec string: 「Couldn't create image」/「We couldn't create this character and your credits have been refunded. Try again later.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec, Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/03_ISS-AMD-03/`

---

## 4. ISS-AMD-04 — Failed chat turns end silently  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-030  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Server failure injected with Pink 「Inject failure status = tool_error」 (scope First beat). Two turns failed: confirming the cast (should offer the storyboard) and the typed request 「Create the storyboard」. Each showed 「Continuing the drama production.」 then simply ended — no error, no Try again — leaving the user with nothing to tap. Pink 「Fail every call」 alone did not fail the outline turn. Spec: PM error handling (5xxx copy).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Failed chat turn ends silently with no error message or Try again
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Turn on Pink › AI Mini Drama › Inject failure status = tool_error
3. Open AI Mini Drama, send an idea and confirm the cast
4. Wait for the reply and check the result
5. Check the result

Result:
The turn shows Continuing the drama production. and then ends with no message or retry option.
摘要：對話回合失敗後無任何錯誤訊息或重試按鈕。
{16.9.0_amd04_after_cast.jpg} {16.9.0_amd04_after_request.jpg}

Expect Result:
A failed turn shows the Something went wrong on my end message with Try again.
摘要：應顯示錯誤訊息並提供 Try again。
Spec string: 「Something went wrong on my end. Let's try that again.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Extra board board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec, Error Handling board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/04_ISS-AMD-04/`

---

## 5. ISS-AMD-05 — Video stage reached without storyboard or settings  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-091  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Seen once on 「Passing the Spark」. Sequence: cast set while Pink tool_error injection was on (turn failed silently, ISS-AMD-04), then 「Create the storyboard」 typed, injection later turned off. On reopening, the chat jumped straight from Characters Result to 「Here's your drama.」 with one failed clip — no storyboard, no Storyboard Preview, no video settings, no price, no charge. Reproduced 1/1; it may need the injected failure to trigger. Proposed S2 because it bypasses the paid confirmation step; downgrade if RD confirms it only follows injected failures.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Drama jumps from characters straight to video without storyboard or settings
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, create a custom drama and set the cast
3. Type Create the storyboard after a failed turn
4. Reopen the drama from History and check the result
5. Check the result

Result:
The chat shows Here's your drama. with a failed clip; no storyboard, video settings or price came first.
摘要：未經分鏡與影片設定，直接進入影片結果。
{16.9.0_amd05_cast_only.jpg} {16.9.0_amd05_jump_to_video.jpg}

Expect Result:
Video is only created after the storyboard and the user's video settings and price confirmation.
摘要：應先完成分鏡並由使用者選擇影片設定與價格後才生成影片。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Main flow board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/05_ISS-AMD-05/`

---

## 6. ISS-AMD-06 — Chat image update fails silently  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-072, TC-073  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Office Romance, storyboard done. 「Update the image for Scene 2 to show rain」 → Iris answered 「Script updated! Regenerate the storyboard to match?」 with a 「Create storyboard」 card ◆3 (spec: an 「Update storyboard images」 card at 2 credits per image). Generate → 「Continuing mini drama production.」 skeleton for ~4.5 min, then it vanished: no new storyboard card, no message, Scene 2 unchanged. The video settings card also disappeared. After reopening, credits had dropped by 4 (5928 → 5924) with nothing produced. Specs PM 10/2 board (R-061, R-062).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Updating a storyboard image from chat fails silently and the scene never changes
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open a finished AI Mini Drama storyboard
3. Type Update the image for Scene 2 to show rain and send
4. Tap Generate on the card Iris returns
5. Wait about 5 minutes and open Scene 2
6. Check the result

Result:
The update card is Create storyboard ◆3; after Generate the progress vanishes and Scene 2 is unchanged.
摘要：聊天更新分鏡圖失敗且無提示，場景圖未更新。
{16.9.0_amd06_card.jpg} {16.9.0_amd06_progress.jpg} {16.9.0_amd06_vanished.jpg} {16.9.0_amd06_scene2_same.jpg}

Expect Result:
An Update storyboard images card appears and the updated scene shows in a new storyboard card.
摘要：應出現 Update storyboard images 卡片並完成更新。
Spec string: 「Update storyboard images」 card, 2 credits per image

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/06_ISS-AMD-06/`

---

## 7. ISS-AMD-07 — Credit prices differ from the spec  ·  Class: Functional  ·  Severity: S2  ·  Owner: PM

**Report step:** TC-039, TC-040, TC-047, TC-070, TC-072  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Prices on this build differ from the Design spec, which is the expected result where it differs from PM: character Generate ◆4 per character (Design: Generate ◆6 / Generate all ◆18 for 3); Create my character ◆4 (Design: Generate ◆6; PM had ◆7); scene Regenerate Image 「Charge 3 credits per image」, ◆6 for location + scene (Design: Regenerate Image ◆12, 6 per image). The chat image update card was ◆3 for one scene (PM: 2 per image; Design has no frame). Owner PM per reviewer: confirm whether the server prices or the spec prices are current.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Character, scene image and chat update prices differ from the spec
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a custom drama
3. Check the prices on Finish your characters, Create my character and a failed scene's Regenerate Image
4. Check the result

Result:
Prices shown: character ◆4, Create my character ◆4, scene image 3 per image (◆6 for two).
摘要：角色、自建角色與場景重生成價格與 spec 不符。
{16.9.0_amd07_generate_all_8.jpg} {16.9.0_amd07_create_4.jpg} {16.9.0_amd07_regen_3_per_image.jpg}

Expect Result:
Design prices: character ◆6 each, Create my character ◆6, location + scene regenerate ◆12.
摘要：依 Design：角色每位 ◆6、自建角色 ◆6、場景與地點重生成 ◆12。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/07_ISS-AMD-07/`

---

## 8. ISS-AMD-08 — Leave dialog missing in template chat  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-025  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Template path (Forbidden Office Romance): Back while the outline was 「Thinking...」 left immediately with no dialog, and the outline kept generating and was saved to History as 「Workplace Romance」 (22 KB). The custom-idea path does show the dialog (TC-026 Pass), so this is template-only.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Template chat skips the Leave this chat? dialog on Back during outline
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and open the Forbidden Office Romance template
3. Tap Make my version, then Generate
4. Tap Back while the outline is still generating
5. Check the result

Result:
The chat closes immediately with no dialog, and the drama still appears in History.
摘要：範本大綱生成中按返回未出現離開確認對話框。
{16.9.0_amd08_thinking.jpg} {16.9.0_amd08_saved_anyway.jpg}

Expect Result:
Leave this chat? appears with Leave anyway and Stay before the chat closes.
摘要：應先顯示 Leave this chat? 確認對話框。
Spec string: 「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/08_ISS-AMD-08/`

---

## 9. ISS-AMD-09 — Leave anyway does not close the chat  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-028  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Reached from the History button during outline generation. Leave anyway opens History (no entry is created — correct), but Back from History returns to the abandoned chat, frozen after the format answer with no outline and no retry; tapping History again shows the dialog again. Seen twice (whale idea; New Chat from it also re-prompted).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Leave anyway keeps the abandoned chat and Back returns to it stuck
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, send an idea and tap Generate on the format card
3. Tap History while the outline generates, then Leave anyway
4. Tap Back on History
5. Check the result

Result:
Back returns to the abandoned chat, stuck with no outline and no way to continue.
摘要：選擇 Leave anyway 後，返回仍回到卡住的舊對話。
{16.9.0_amd09_dialog.jpg} {16.9.0_amd09_back_to_chat.jpg} {16.9.0_amd09_still_stuck.jpg}

Expect Result:
Leave anyway closes the chat, so Back from History does not return to it.
摘要：Leave anyway 應關閉該對話。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/09_ISS-AMD-09/`

---

## 10. ISS-AMD-10 — No stop dialog on Back during storyboard generation  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-063  ·  **Reproduce:** 1/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Inconsistent: on the template drama the dialog appeared (TC-061 Pass, status 「Thinking…」). On the custom drama 「Borrowed Rain」 the status was 「Advancing the short drama production.」 and Back went straight to History with no 「Stop and lose your credits?」; the storyboard kept generating and finished in the background. 1 of 2 storyboard runs.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: No Stop and lose your credits? dialog on Back during storyboard generation
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open a custom AI Mini Drama with the cast set
3. Tap Generate on Create storyboard
4. Tap Back while it shows Advancing the short drama production.
5. Check the result

Result:
The app goes straight to History with no dialog, and the storyboard keeps generating.
摘要：分鏡生成中按返回未出現停止確認對話框。
{16.9.0_amd10_generating.jpg} {16.9.0_amd10_history_no_dialog.jpg}

Expect Result:
Stop and lose your credits? appears with Leave anyway and Keep Generating.
摘要：應顯示 Stop and lose your credits? 對話框。
Spec string: 「Stop and lose your credits?」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/10_ISS-AMD-10/`

---

## 11. ISS-AMD-11 — Create my character discards input without asking  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-055  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Description (58 chars), Female, East Asian and Age 55 entered; X closed the page at once and reopening showed an empty form. The empty-form case (no dialog) is correct (TC-056 Pass).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: X on Create my character discards entered data without a confirmation
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, tap a character slot, then Create my character
3. Enter a description, Gender, Ethnicity and Age
4. Tap X
5. Check the result

Result:
The page closes immediately and the entered data is lost; no dialog appears.
摘要：已輸入資料時按 X 直接關閉，資料遺失且無確認。
{16.9.0_amd11_filled.jpg} {16.9.0_amd11_empty_after_x.jpg}

Expect Result:
Discard this character? appears with Discard and Keep editing.
摘要：應顯示 Discard this character? 確認對話框。
Spec string: 「Discard this character?」/「What you've entered won't be saved.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/11_ISS-AMD-11/`

---

## 12. ISS-AMD-12 — Credit pill is stale outside the chat  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-005  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** After spending credits inside the drama chat (chat pill 5924), the template detail page and the More page still showed 6068 until the landing was re-entered. Seen on two pages.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Credit pill on template and More pages shows an outdated balance
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, spend credits in a drama chat
3. Go back to the template detail page and the More page
4. Compare the credit pill with the chat
5. Check the result

Result:
The template and More pages show 6068 while the actual balance is 5924.
摘要：範本頁與 More 頁的點數未更新。
{16.9.0_amd12_chat_5924.jpg} {16.9.0_amd12_template_6068.jpg} {16.9.0_amd12_more_6068.jpg}

Expect Result:
The credit pill shows the current balance on every page.
摘要：各頁點數應即時顯示目前餘額。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/12_ISS-AMD-12/`

---

## 13. ISS-AMD-13 — Back during video gives no toast; History shows no processing  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-082, TC-084  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Two missing progress cues while a video generates: (1) Back gave no 「We'll keep making your video. Find it in History.」 toast (screenshot ~1.5 s after the tap; chat was opened from History so Back went to History); (2) the History card showed no 「processing..」 label. Also no notice at all when the video then failed while the user was on another page (TC-085 observation).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Video in progress gives no Back toast and no processing label in History
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama with a finished storyboard
3. Tap Generate on the video settings card
4. Tap Back, then look at the drama card in History
5. Check the result

Result:
No toast appears after Back, and the History card shows no processing.. label.
摘要：影片生成中返回無提示，History 也無 processing 標示。
{16.9.0_amd13_generating.jpg} {16.9.0_amd13_no_toast.jpg} {16.9.0_amd13_no_processing.jpg}

Expect Result:
Back shows the keep-making toast and the History card shows processing.. while generating.
摘要：應顯示 toast，History 卡片應標示 processing..。
Spec string: 「We'll keep making your video. Find it in History.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Update board 5 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/13_ISS-AMD-13/`

---

## 14. ISS-AMD-14 — Retry after a failed video is inconsistent  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-094  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Off-case observations O-1 and O-2 (TC-094 itself passed: copy and Try again button are right). First Try again re-showed the video settings card. Second Try again made Iris ask 「Which beat would you like to modify?」 with a single beat (First Day) instead of retrying. Asking 「Create the video」 afterwards returned a card with only 「Video length」 and ◆60 — no model selector and no 「Choose your video settings」 title.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Try again on a failed video asks which beat to modify instead of retrying
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama whose video failed
3. Tap Try again on Try creating your video again
4. Repeat after the next failure and check the result
5. Check the result

Result:
Try again shows Which beat would you like to modify? with one beat, not the video settings.
摘要：影片失敗後按 Try again 未重試，反而詢問要修改哪個段落。
{16.9.0_amd14_first_retry.jpg} {16.9.0_amd14_beat_prompt.jpg} {16.9.0_amd14_no_model_selector.jpg}

Expect Result:
Try again restarts video creation with the full Choose your video settings card.
摘要：Try again 應重新開始影片生成並顯示完整設定卡。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Error Handling board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/14_ISS-AMD-14/`

---

## 15. ISS-AMD-15 — Failed clip message differs from the spec  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-091  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** 「Passing the Spark」 video result: one failed-clip card and red 「ⓘ 1 clip couldn't be generated.」; no refund wording, no Edit hint and no 「Fix these issues to export your drama.」/「Fix scenes」. See ISS-AMD-05 for how this state was reached.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Failed clip shows 1 clip couldn't be generated with no Fix scenes path
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama whose video has a failed clip
3. Scroll to Here's your drama.
4. Check the result

Result:
Only 1 clip couldn't be generated. is shown; no refund note, Edit hint or Fix scenes button.
摘要：失敗片段僅顯示 1 clip couldn't be generated.，無修復入口。
{16.9.0_amd15_failed_clip.jpg}

Expect Result:
It shows the failed-scenes refund message and Fix these issues to export your drama. with Fix scenes.
摘要：應顯示退點說明與 Fix scenes 修復入口。
Spec string: 「N scenes couldn't be generated. Your credits have been refunded.」 + 「Fix scenes」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Video board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/15_ISS-AMD-15/`

---

## 16. ISS-AMD-17 — Policy-blocked idea gets a free-form reply  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-031  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Idea: explicit gore. After the format card Iris wrote 「I cannot generate stories depicting explicit gore, dismemberment, or graphic violence. I can, however, help create a suspenseful thriller…」. The spec defines a fixed 4xxx message with no button. The free-form answer is reasonable, but it is not the specified string and may vary per request.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Policy-violating idea gets a free-form refusal instead of the spec message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and tap Create Your Drama
3. Send an idea with explicit gore and tap Generate on the format card
4. Check the reply

Result:
Iris replies with a free-form refusal paragraph instead of the fixed policy message.
摘要：違規點子回覆為自由文字，而非 spec 固定文案。
{16.9.0_amd17_free_form.jpg}

Expect Result:
The reply is the fixed policy message from the spec, with no button.
摘要：應顯示 spec 定義的固定違規訊息。
Spec string: 「I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Extra board board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/16_ISS-AMD-17/`

---

## 17. ISS-AMD-18 — Cast-change prompts don't follow the catalogue  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-045, TC-103  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** (1) 「Make the barista a retired pilot」: the outline card was re-issued with the role changed and switch icons, but without 「Got it! I've updated the story. I can't redraw characters yet - tap the switch icon…」 or the blue 「Character looks aren't updated automatically…」 note; instead it offered 「Create characters ◆4」. (2) After a storyboard existed, changing a look made Iris say 「The characters look great! Ready to create the storyboard?」 instead of 「Characters updated! Regenerate the storyboard to match?」. Sources: PM 10/14 board (pm-update-7) and the top mockup catalogue (pm-top-mockups).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Cast change after a storyboard shows the wrong assistant prompt
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open a custom AI Mini Drama with a storyboard
3. Change a character's look with the switch icon and confirm
4. Check Iris's prompt

Result:
After the cast change Iris repeats the first-time prompt The characters look great
摘要：已有分鏡時更換角色，提示文案仍為初次建立分鏡用語。
{16.9.0_amd18_wrong_prompt.jpg} {16.9.0_amd18_no_got_it.jpg}

Expect Result:
Iris says Characters updated! Regenerate the storyboard to match?
摘要：應顯示 Characters updated! Regenerate the storyboard to match?
Spec string: 「Characters updated! Regenerate the storyboard to match?」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/17_ISS-AMD-18/`

---

## 18. ISS-AMD-20 — Video settings card lacks the remaining-credit line  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-115  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Re-framed 2026-10-19 under the Design-outranks-PM rule. PM asked for a confirmation step (Q-3); Design has none, and instead shows 「You'll have 160 left」 under Generate on the video settings card (MX-linked frames). The build charges on tap (correct per Design) but the card shows only 「◆120」 and Generate, with no remaining-balance line. Owner moved from PM to RD because Design defines it.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Video settings card does not show You'll have N left under Generate
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama with a finished storyboard
3. Look at the Choose your video settings card under Generate
4. Check the result

Result:
The card shows only the ◆ price and Generate; there is no You'll have N left line.
摘要：影片設定卡未顯示扣點後剩餘點數。
{16.9.0_amd20_no_remaining_line.jpg}

Expect Result:
Under Generate the card shows You'll have N left, as in the Design spec.
摘要：依 Design，Generate 下方應顯示 You'll have N left。
Spec string: 「You'll have 160 left」 (Design example)

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, MX Spec Link board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/18_ISS-AMD-20/`

---

## 19. ISS-AMD-21 — Surprise me replaces instead of appending  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-014  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** First tap filled 「A fake psychic keeps making random predictions…」; the second tap replaced it with 「He pretends to be rich for a date…」. PM main flow says repeated taps append.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Surprise me replaces the idea text instead of appending a new inspiration
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and tap Create Your Drama
3. Tap Surprise me twice
4. Check the input

Result:
The second tap replaces the first inspiration; only one remains in the input.
摘要：再次按 Surprise me 會取代原文字而非附加。
{16.9.0_amd21_first.jpg} {16.9.0_amd21_replaced.jpg}

Expect Result:
The second tap appends another inspiration after the existing text.
摘要：再次按 Surprise me 應附加在原文字後。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/19_ISS-AMD-21/`

---

## 20. ISS-AMD-22 — Chat jumps after closing Choose Character  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-102  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Opened Choose Character from the switch icon on the newest card (chat scrolled to the bottom), closed it: the chat came back scrolled up to the first outline card. The History round-trip keeps the position (TC-101 Pass).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Chat scroll position jumps to an earlier card after closing Choose Character
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama with a cast
3. Tap a character's switch icon, then close Choose Character
4. Check the chat position

Result:
The chat scrolls back to an earlier outline card instead of staying where it was.
摘要：關閉角色選擇後，聊天捲動位置跳到較早的卡片。
{16.9.0_amd22_before.jpg} {16.9.0_amd22_after.jpg}

Expect Result:
The chat stays at the same position as before Choose Character was opened.
摘要：關閉後應維持原本的捲動位置。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/20_ISS-AMD-22/`

---

## 21. ISS-AMD-23 — Rename does not move the drama to the top  ·  Class: UX  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-108  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Renamed the oldest drama 「Quiet Warmth」 → 「New Title」; it stayed last with its old time (2026/10/16 01:52 PM). Viewing without editing correctly keeps the order (TC-107 Pass).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Renamed drama stays in place in History and keeps its old time
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama › History with 2+ dramas
3. Rename the oldest drama with ⋮ › Rename
4. Check the list order and time

Result:
The renamed drama stays at the bottom and its time does not change.
摘要：重新命名後作品未移至頂端，時間也未更新。
{16.9.0_amd23_before.jpg} {16.9.0_amd23_after.jpg}

Expect Result:
The renamed drama moves to the top and its time updates.
摘要：重新命名後應移至頂端並更新時間。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Update board 5 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/21_ISS-AMD-23/`

---

## 22. ISS-AMD-24 — Rename OK enabled for empty name  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-109  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** OK stays enabled with an empty field and with spaces only; tapping it closes the dialog and silently keeps the old name. Harmless, but the spec says OK is disabled.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Rename dialog OK stays enabled when the name is empty or only spaces
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama › History
3. Tap ⋮ › Rename on a drama
4. Clear the name, then enter only spaces
5. Check the result

Result:
OK stays enabled; tapping it closes the dialog and silently keeps the old name.
摘要：名稱為空白時 OK 仍可點擊。
{16.9.0_amd24_empty.jpg} {16.9.0_amd24_spaces.jpg}

Expect Result:
OK is disabled while the name is empty or only spaces.
摘要：名稱為空或僅空白時 OK 應停用。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Update board 5 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/22_ISS-AMD-24/`

---

## 23. ISS-AMD-25 — History hint not dismissed by an outside tap  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-105  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** The blue History info hint stays after tapping empty space and covers the first card's date; it reappeared on later visits too.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: History info hint stays after an outside tap and covers the first card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama › History
3. Tap the ⓘ to show the hint, then tap empty space
4. Check the hint

Result:
The hint stays on screen and covers the first card's date.
摘要：點擊空白處後 History 提示仍未關閉。
{16.9.0_amd25_hint_stays.jpg}

Expect Result:
Tapping outside the hint dismisses it.
摘要：點擊提示外區域應關閉提示。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/23_ISS-AMD-25/`

---

## 24. ISS-AMD-26 — Character name labels are clipped  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-039  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Off-case observation O-8. In the Finish your characters sheet the name labels under the slots lose their descenders: 「Maya Lin」 reads 「Mava Lin」, 「Julian Hayes」 reads 「Julian Haves」. Seen on every sheet opened (3 times).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Finish your characters sheet clips the bottom of character names
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open a custom AI Mini Drama and tap ✓ in Choose Character with characters unset
3. Look at the names under the slots
4. Check the result

Result:
Name labels are cut at the bottom, so Maya reads Mava and Hayes reads Haves.
摘要：角色名稱下緣被裁切，如 Maya 看起來像 Mava。
{16.9.0_amd26_clipped.jpg} {16.9.0_amd26_sheet.jpg}

Expect Result:
Character names are shown in full without clipping.
摘要：角色名稱應完整顯示。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/24_ISS-AMD-26/`

---

## 25. ISS-AMD-27 — More ideas chip missing in some states  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-019  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** With the custom outline and 「Ready to create your characters?」 card on screen, no 「More ideas +」 chip; it showed in other states (after 「Which beat would you like to modify?」).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: More ideas + chip is missing above the input once the chat has content
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, send an idea and wait for the outline
3. Look above the input
4. Check the result

Result:
No More ideas + chip is shown above the input.
摘要：聊天已有內容時未顯示 More ideas + 晶片。
{16.9.0_amd27_no_chip.jpg} {16.9.0_amd27_chip_elsewhere.jpg}

Expect Result:
More ideas + is shown above the input once the chat has content.
摘要：聊天有內容後應顯示 More ideas +。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Extra board board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec, Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/25_ISS-AMD-27/`

---

## 26. ISS-AMD-28 — Template outline shows only Thinking...  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-023  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Template path only: the outline wait shows 「Thinking...」 with a skeleton. The custom path shows a status line (「Creating the story outline and project for the romance drama.」).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Template outline wait shows only Thinking... with no status line
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, open a template and tap Make my version
3. Tap Generate on the format card
4. Watch the chat while the outline generates
5. Check the result

Result:
Only Thinking... with a skeleton is shown during the template outline.
摘要：範本大綱生成時僅顯示 Thinking...。
{16.9.0_amd28_thinking.jpg}

Expect Result:
A status line such as Writing your story... is shown while the outline is written.
摘要：應顯示 Writing your story... 等進度文字。
Spec string: 「I'll create a story outline - give me a moment...」 / 「Writing your story...」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/26_ISS-AMD-28/`

---

## 27. ISS-AMD-29 — Video settings copy differs  ·  Class: UI  ·  Severity: S3  ·  Owner: PM

**Report step:** TC-079  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Design's video board shows the button as 「Generate Video」 (the app says 「Generate」); Design does not show the Mini description, so PM's 「Best for speed, value, and quick drafts」 applies (the app drops the s). Lengths use 「Preview - 30 sec」 with a hyphen instead of 「•」.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Video settings card says quick draft instead of quick drafts
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open an AI Mini Drama with a finished storyboard
3. Select Seedance 2.0 Mini on Choose your video settings
4. Read the description
5. Check the result

Result:
The Mini description reads Best for speed, value, and quick draft.
摘要：Mini 模型說明文字少了複數 s。
{16.9.0_amd29_quick_draft.jpg}

Expect Result:
The Mini description reads Best for speed, value, and quick drafts.
摘要：應為 quick drafts。
Spec string: 「Best for speed, value, and quick drafts」

[AI Recommendation]
Seedance 2.0 Mini: Best for speed, value, and quick drafts
Button: Generate Video

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Video board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/27_ISS-AMD-29/`

---

## 28. ISS-AMD-30 — Create my character prompt grammar  ·  Class: UI  ·  Severity: S3  ·  Owner: Doc

**Report step:** TC-047  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Header reads 「Tell us what Maya Lin look like — the more detail, the better.」 The Design frame has both 「looks like」 and 「look like」 variants; singular names need 「looks」.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create my character prompt says what Maya Lin look like
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, tap a character slot, then Create my character
3. Read the prompt under the title
4. Check the result

Result:
The prompt reads Tell us what Maya Lin look like — the more detail, the better.
摘要：提示文字文法錯誤（look 應為 looks）。
{16.9.0_amd30_look_like.jpg}

Expect Result:
The prompt reads Tell us what Maya Lin looks like — the more detail, the better.
摘要：應為 looks like。
Spec string: 「Tell us what Sophie looks like - the more detail, the better.」

[AI Recommendation]
Tell us what Maya Lin looks like — the more detail, the better.

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/28_ISS-AMD-30/`

---

## 29. ISS-AMD-31 — Keyboard cannot be dismissed in an empty chat  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-018  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189631

> **QA note — not pasted into eBug.** Off-case observation O-7 (TC-018 passed once the chat had content). In a brand-new chat the keyboard stayed up after tapping outside the input, swiping down and a programmatic hide; the only way out was sending or leaving. That also hides the 3-line collapse in the empty chat.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Keyboard cannot be dismissed in a new empty chat
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and tap Create Your Drama
3. Type some text, then tap outside the input or swipe down
4. Check the result

Result:
The keyboard stays open; there is no way to dismiss it without sending.
摘要：新對話中無法收起鍵盤。
{16.9.0_amd31_keyboard_stuck.jpg}

Expect Result:
Tapping outside the input or swiping down dismisses the keyboard.
摘要：點擊輸入框外或下滑應可收起鍵盤。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, AI Mini Drama home page / Custom detail / Chat room detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/29_ISS-AMD-31/`

---

# ⛔ Withdrawn by QA — do not file

These entries were drafted on 2026-10-16 and shown on the review page. They are kept so the original wording stays traceable, with the reason they were withdrawn. Nothing below may be pasted into eBug.

---

## 30. ⛔ WITHDRAWN — ISS-AMD-16 — Scene image moderation copy is wrong  ·  Class: UX  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-067  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189631

> **⛔ QA note — do NOT paste into eBug; withdrawn.** Withdrawn 2026-10-19 under the Design-outranks-PM rule: the card body 「…The service is busy — try again later.」 with ⓘ matches the Design 10/12 storyboard frame, and the ⓘ dialog text matches one of the two Design dialog variants. Only PM's 10/14 copy differs, and PM is not the expected result where Design speaks. TC-067 re-judged Pass. Original note: Moderation failure produced with Pink Trip image moderation. Card: 「Couldn't create image ⓘ」 + the 5xx body 「…The service is busy — try again later.」 (should be the 4xx body). ⓘ dialog: 「Couldn't generate this image」/「Your credits have been refunded. The description may not meet our terms of service. Edit the description to try again.」 + Got it — older copy, missing the 10/14 examples and the terms-of-service link. PM 10/14 update board (pm-update-6) is the newest source.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Scene moderation failure shows service-busy text and old dialog copy
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Turn on Pink › AI Mini Drama › Trip image moderation
3. Generate a storyboard and open a failed scene from View more
4. Tap the ⓘ next to Couldn't create image
5. Check the result

Result:
The card says the service is busy, and the ⓘ dialog lacks the examples and terms link.
摘要：審核失敗卡片顯示服務忙碌文案，ⓘ 對話框為舊文案。
{16.9.0_amd16_card.jpg} {16.9.0_amd16_dialog.jpg}

Expect Result:
The card says Try editing the description; the ⓘ dialog uses the 10/14 copy with examples and link.
摘要：卡片與 ⓘ 對話框應使用 10/14 版審核失敗文案。
Spec string: 「Your credits have been refunded. Try editing the description for a different result.」

[AI Recommendation]
Card: Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result.
Dialog: Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again. / Got it

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Update board 6 (Error) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/30_ISS-AMD-16/`

---

## 31. ⛔ WITHDRAWN — ISS-AMD-19 — Character picker copy: PM and Design disagree  ·  Class: UX  ·  Severity: S3  ·  Owner: PM

**Report step:** TC-037, TC-039, TC-040, TC-041  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.9.0.189631

> **⛔ QA note — do NOT paste into eBug; withdrawn.** Withdrawn 2026-10-19 under the Design-outranks-PM rule (reviewer note: 「Design spec has higher priority」): every string here matches the Design characters board, so the build is right and the PM wording is not a defect. TC-037 and TC-041 re-judged Pass; TC-039/TC-040 stay Fail only for the price (entry ISS-AMD-07). Original note: The build follows the Design ds-characters frames; the PM main-flow board says otherwise. Leave dialog: app 「Leave without finishing? / If you leave now, your picks won't be saved. / Leave / Keep choosing」 vs PM 「Discard character changes? / …won't be saved if you leave. / Discard / Keep Editing」. Unset sheet: app 「Finish your characters ⓘ / {n} characters aren't set yet / Add a look to continue. / Generate all」 vs PM 「They need a look before you can continue. / Generate with AI / Choose myself」 (Choose myself is missing entirely). Completion: app 「Your characters are ready / Take a look, then confirm to continue.」 vs PM 「{n} characters are all set!」. A PM ruling is needed on which source wins; prices are in ISS-AMD-07.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Character picker dialogs follow Design copy that conflicts with the PM flow
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, create a custom drama and open Choose Character
3. Pick a look and tap X; then tap ✓ with characters unset
4. Check the dialog and sheet text

Result:
Dialogs read Leave without finishing? and Add a look to continue.; there is no Choose myself.
摘要：角色選擇對話框文案依 Design，與 PM 流程不一致。
{16.9.0_amd19_leave_dialog.jpg} {16.9.0_amd19_unset_sheet.jpg} {16.9.0_amd19_ready.jpg}

Expect Result:
PM confirms one copy set and whether Choose myself is required.
摘要：需 PM 決定採用哪一版文案及是否保留 Choose myself。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261016_eBug_drafts_AI-Mini-Drama_16.9.0_images/31_ISS-AMD-19/`

---

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-3 | Drama renamed by the AI during the flow (Workplace Romance → Office Romance); landing Recent Task showed the old name | Observation — naming is AI-generated; the stale Recent Task name is minor. Raise only if PM wants names fixed after creation. |
| O-4 | Reopening a drama drops the user's own chat messages | Not a defect — matches the History info text (only outline, images and videos are kept). |
| O-6 | Back from a chat opened from History returns to History | Not a defect — normal navigation stack. |
| O-9 | 「Generate all」 posts a user bubble reading 「Generate with AI」 | Not raised separately — folded into the copy conflict in ISS-AMD-19 for PM. |
| ⏳ Blocked (22) | TC-002, TC-032, TC-068, TC-074, TC-078, TC-081, TC-083, TC-085, TC-087, TC-088, TC-089, TC-090, TC-092, TC-093, TC-095, TC-096, TC-097, TC-098, TC-099, TC-104, TC-114, TC-116 | Not executable on this build/account — no verdict, so nothing to raise. Exact blockers are in results.csv and on the review page. |

## Reconciliation against the report

The run is the report: 31 failed cases (after the 2026-10-19 Design-first re-judgement; TC-037, TC-041 and TC-067 moved to Pass) plus 11 off-case observations (O-1…O-11).

| Step | Count | Running total |
|---|---|---|
| Failed cases | 31 | 31 |
| Merged into shared defects or split across entries (see map; e.g. TC-039 → price + clipped names, five price cases → one entry) | -4 | 27 |
| Entries raised from observations on passing cases (ISS-AMD-14, ISS-AMD-31) | +2 | **29 to file** |
| Withdrawn under the Design-first rule (ISS-AMD-16, ISS-AMD-19) | kept below the line | 31 entries in the file |

### Row-by-row map

| Source | Became |
|---|---|
| TC-005 | 12. ISS-AMD-12 |
| TC-014 | 19. ISS-AMD-21 |
| TC-019 | 25. ISS-AMD-27 |
| TC-023 | 26. ISS-AMD-28 |
| TC-025 | 8. ISS-AMD-08 |
| TC-028 | 9. ISS-AMD-09 |
| TC-030 | 4. ISS-AMD-04 |
| TC-031 | 16. ISS-AMD-17 |
| TC-039 | 7. ISS-AMD-07 + 24. ISS-AMD-26 |
| TC-040 | 7. ISS-AMD-07 |
| TC-042 | 3. ISS-AMD-03 |
| TC-043 | 3. ISS-AMD-03 |
| TC-045 | 17. ISS-AMD-18 |
| TC-047 | 7. ISS-AMD-07 + 28. ISS-AMD-30 |
| TC-054 | 2. ISS-AMD-02 |
| TC-055 | 11. ISS-AMD-11 |
| TC-063 | 10. ISS-AMD-10 |
| TC-070 | 7. ISS-AMD-07 |
| TC-072 | 6. ISS-AMD-06 + 7. ISS-AMD-07 |
| TC-073 | 6. ISS-AMD-06 |
| TC-079 | 27. ISS-AMD-29 |
| TC-082 | 13. ISS-AMD-13 |
| TC-084 | 13. ISS-AMD-13 |
| TC-086 | 1. ISS-AMD-01 |
| TC-091 | 5. ISS-AMD-05 + 15. ISS-AMD-15 |
| TC-102 | 20. ISS-AMD-22 |
| TC-103 | 17. ISS-AMD-18 |
| TC-105 | 23. ISS-AMD-25 |
| TC-108 | 21. ISS-AMD-23 |
| TC-109 | 22. ISS-AMD-24 |
| TC-115 | 18. ISS-AMD-20 |
| 30. ISS-AMD-16 (withdrawn) | TC-067 — re-judged under the Design-first rule |
| 31. ISS-AMD-19 (withdrawn) | TC-037, TC-039, TC-040, TC-041 — re-judged under the Design-first rule |
| O-1 | 14. ISS-AMD-14 |
| O-2 | 14. ISS-AMD-14 |
| O-3 | not raised |
| O-4 | not raised |
| O-5 | folded into 6. ISS-AMD-06 |
| O-6 | not raised |
| O-7 | 29. ISS-AMD-31 |
| O-8 | 24. ISS-AMD-26 |
| O-9 | not raised (matches the Design copy family; see withdrawn ISS-AMD-19) |
| O-10 | folded into 4. ISS-AMD-04 |
| O-11 | 5. ISS-AMD-05 |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 29 |
| PM | 2, 7, 27 |
| Doc | 28 |

### Filing order

RD, then PM rulings, then Doc (duplicates on hold are filed as comments/reopens, not new tickets): **1**, **3**, **4**, **5**, **6**, **8**, **9**, **10**, **11**, **12**, **13**, **14**, **15**, **16**, **17**, **18**, **19**, **20**, **21**, **22**, **23**, **24**, **25**, **26**, **29**, **2**, **7**, **27**, **28**.

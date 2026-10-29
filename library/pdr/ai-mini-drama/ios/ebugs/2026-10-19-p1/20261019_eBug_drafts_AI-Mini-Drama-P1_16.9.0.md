# AI Mini Drama (iOS) — eBug drafts, phase P1 Core, PDR-I 16.9.0 build 189729

**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-19-p1-core/` — the 159 P1 cases of the approved table `cases.csv` v1, run 2026-10-19 → 2026-10-20 on iPhone 17 Air / iOS 26.2.1 through Appium/WebDriverAgent, TestFlight build 16.9.0 (189729), Developer Server. Result: 84 Pass, 43 Fail, 32 Blocked, 0 Not run. Off-case observations: `runs/2026-10-19-p1-core/observations.md`.

**Filed by:** ETHAN_HSU on 2026-10-20 via the IF3 API on TR261019-0014 (all 8 entries, the user's decisions in `decisions.md`; BugCodes on each entry and in `filed_bugcodes.md`).

**Defaults carried over from the 2026-10-16 batch (reviewer decisions of 2026-10-19):** Source tag `[AIAgent]`, account Ethan_Hsu, method API. Severity and owner below are proposals for the reviewer. **Nothing is filed** — filing waits for the user. Design outranks PM.

**What is drafted:** most P1 failures repeat tickets already in eBug (the 21 filed from the 10/16 run plus older ones) — they are listed in **Rechecks** with what P1 saw, to post as comments or reopen requests, not as new tickets. Drafted: the 8 problems with no ticket of their own, including the video failure with its root cause (the user asked on 2026-10-20 to file it rather than only comment on DRI261896P0020). Two rows where the app matches Design are table corrections, not app problems.

Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), PM (a ruling is needed), Doc (on-screen copy). Rule-2 entries (Stop notice, wait thresholds) rest on the user's QA acceptance rules, not a spec sheet, so they carry no Spec Link.

---

## 1. ISS-AMD-37 — Video generation always fails: server storage upload times out  ·  Class: Functional  ·  Severity: S1  ·  Owner: RD

**Filed as:** DRI261897P0006  ·  **Report step:** TC-086, TC-073  ·  **Reproduce:** 7/7  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Every video attempt in the run failed, on four dramas: Echoes in the Dark 10/19 19:47 (preview) and 19:59 (clip regenerate ◆60), Shared Solitude 20:18, Across Distance 21:13, Sweet Rivalry 10/20 10:06 (fresh install) — plus the two storyboard-image revisions on Shared Turf at 17:16 and 17:24 (TC-073). Each ends after ~361 s with the same log line: workflow step failed step=prompt_1 skill=video-generation-batch error="HTTP PUT to storage URL failed: Failed to read connection (url=https://storage.googleapis.com/cl-aol-media-demo/source/Chat/…/input.N.png…)" — the reference-image upload before filming times out. The UI then shows one of three endings: 「1 clip couldn't be generated.」 + 「Fix Clips」 (Echoes), 「Something went wrong on my end.」 + 「Try again」 (Shared Solitude), or nothing at all with the video settings card removed (Across Distance). No video credits were ever charged (authorisations revoked). DRI261896P0020 (same symptom, build 189631, 1/1, no cause) was closed as NotReproducible; this run reproduces it 7/7 on 189729 across 4 dramas and a fresh install, with the server-side cause, which is the new ground for raising it again (the user asked on 2026-10-20 to file it). Cite DRI261896P0020 in the ticket. Blocks TC-085, 087–090, 093, 095–099, 167, 168, 174. S1 because no user can get any video out of the feature on this build/server; downgrade if RD shows it is a Developer Server storage outage.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Video generation always fails after ~6 min as the storage upload times out
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a drama through the storyboard
3. On Choose your video settings pick Seedance 2.0, Preview - 30 sec, tap Generate
4. Wait about 6 minutes
5. Check the result

Result:
Every video attempt (5/5, 4 dramas) fails after ~6 min; the log shows the storage upload timing out.
摘要：影片生成 5 次皆在約 6 分鐘後失敗，log 顯示上傳參考圖到 storage 逾時。
{16.9.0_amd37_fix_clips_ending.jpg} {16.9.0_amd37_try_again_ending.jpg} {16.9.0_amd37_no_card_ending.jpg} {16.9.0_amd37_log.txt}

Expect Result:
The preview video is generated and shown with Here's your drama.
摘要：應成功生成預覽影片並顯示 Here's your drama.。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261896P0020 (same symptom on 189631, closed Not Reproducible); reproduced 7/7 on 189729 with the cause in the attached log
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/01_ISS-AMD-37/`

---

## 2. ISS-AMD-32 — Storyboard and video Stop cancel silently  ·  Class: UX  ·  Severity: S2  ·  Owner: PM

**Filed as:** DRI261897P0007  ·  **Report step:** TC-156, TC-157  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Rule 2 (user QA rule, R-138): Stop must say what stops and what happens to spent credits. Storyboard (Across Distance, Create storyboard ◆28, Stop 21:09:13) and video (Seedance 2.0 Preview ◆120, Stop 21:22:38): both vanish instantly back to the offer card with no dialog, toast or chat line. The log shows the authorisation revoked (unused_credit=28 at 21:09:15, unused_credit=120 at 21:22:41), so nothing is charged — the user is just never told. Outline and revision Stop are already DRI261893-0128 (still reproduces, TC-153/155); character generation has no Stop at all (DRI261895P0024). Compare the Back button at the outline stage, which does explain (Leave this chat?).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Storyboard and video Stop cancel silently with no credit message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a drama up to the Create storyboard card
3. Tap Generate, then tap Stop while it is generating
4. Repeat on the Choose your video settings card: Generate, then Stop
5. Check the result

Result:
Both stages disappear back to the offer card with no message about what stopped or the credits.
摘要：分鏡與影片生成按 Stop 後直接消失回到報價卡，未說明停止了什麼及點數如何處理。
{16.9.0_amd32_storyboard_running.jpg} {16.9.0_amd32_storyboard_after_stop.jpg} {16.9.0_amd32_video_running.jpg} {16.9.0_amd32_video_after_stop.jpg} {16.9.0_amd32_log.txt}

Expect Result:
Stop says what will stop and whether the credits are refunded, then stops the stage.
摘要：按 Stop 應說明停止的工作及點數是否退還，再停止該階段。

Note:
Device: iPhone 17 Air / iOS 26.2.1
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/02_ISS-AMD-32/`

---

## 3. ISS-AMD-33 — Character and storyboard generation block far beyond ten seconds  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Filed as:** DRI261897P0008  ·  **Report step:** TC-170, TC-172, TC-161  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Rule 2 (user QA rule, R-140): a wait with nothing to do but leave must stay under 10 s with an animation. Characters (Generate all ◆8, 2 characters): 20:56:02 → 20:57:18, ~76 s; during it the Finish your characters sheet ignores its ✕ and the dimmed page covers Back, so the user cannot even leave (TC-161). Storyboard (◆28): 21:09:44 → 21:11:45, log turn wall 116.3 s. Outline, revision and video already have tickets (DRI261895P0029/P0030/P0031, all still reproduce); this entry covers the two stages without one. Earlier in the run the character load was 70.7 s (log) and storyboards 2–4 min.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Character and storyboard generation block the screen for over a minute
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a drama to the cast step
3. Open Change Characters, tap ✓ with characters unset, tap Generate all
4. Try to close the sheet or go Back while it generates
5. Confirm, then Generate on the Create storyboard card and time the wait
6. Check the result

Result:
Characters lock the screen ~76 s (no Back, ✕ ignored); the storyboard blocks ~2 min with only Stop.
摘要：角色生成鎖住畫面約 76 秒（無法返回、✕ 無效），分鏡生成約 2 分鐘只能按 Stop。
{16.9.0_amd33_characters_locked.jpg} {16.9.0_amd33_close_ignored.jpg} {16.9.0_amd33_storyboard_wait.jpg} {16.9.0_amd33_log.txt}

Expect Result:
No wait with only a leave/Stop option lasts over 10 s; the user can always leave the sheet.
摘要：只能離開或停止的等待不應超過 10 秒，且使用者隨時可離開。

Note:
Device: iPhone 17 Air / iOS 26.2.1
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/03_ISS-AMD-33/`

---

## 4. ISS-AMD-34 — No History bubble after leaving the first video  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Filed as:** DRI261897P0009  ·  **Report step:** TC-083  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Clean fresh install of 189729 (2026-10-20 09:53), first video of the install (Seedance 2.0 Preview ◆120, 10:06:09), Back at 10:06:23 while generating: the landing page shows no blue bubble under the History button, screenshots 0.7 s and 2 s after. The Back toast is missing too (already DRI261896P0050). The same run also showed no notification pre-prompt on this first video (DRI261895P0022, still reproduces). The video itself failed later with the storage upload error (DRI261896P0020).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: No Find your video here in History bubble after leaving the first video
```

**Description:**

```
Repro Steps:
1. Launch the APP (fresh install)
2. Open AI Mini Drama and create a drama through the storyboard
3. On Choose your video settings tap Generate
4. Tap Back while the video is generating
5. Check the result

Result:
The landing page shows no bubble under the History button.
摘要：返回首頁後 History 按鈕下方未出現提示泡泡。
{16.9.0_amd34_video_running.jpg} {16.9.0_amd34_no_bubble.jpg} {16.9.0_amd34_log.txt}

Expect Result:
A blue bubble Find your video here in History. appears under History the first time.
摘要：第一次離開時，History 按鈕下方應出現藍色提示泡泡。
Spec string: 「Find your video here in History.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/04_ISS-AMD-34/`

---

## 5. ISS-AMD-35 — No video settings card after a storyboard preview Retry  ·  Class: UX  ·  Severity: S3  ·  Owner: PM

**Filed as:** DRI261897P0010  ·  **Report step:** O-15  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Off-case observation O-15 (Shared Solitude). The preview had failed (TTS fault injection, then all Pink faults Off); Retry ◆1 at 20:12:41 produced the preview (1:01) at ~20:13, but the chat ended at the Storyboard Preview with no Choose your video settings card. Typing 「Make the video now」 at 20:17:23 brought the card back. Same family as the Across Distance video failure that also removed the card (O-22, folded into DRI261896P0043 in the recheck table).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: No video settings card after a successful storyboard preview Retry
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a drama through the storyboard
3. Let the storyboard preview fail, then tap Retry on it
4. Wait for the preview to finish and check the chat
5. Check the result

Result:
After the retried preview finishes, the chat ends at the preview with no video settings card.
摘要：預覽重試成功後，聊天停在預覽，沒有出現影片設定卡。
{16.9.0_amd35_preview_no_card.jpg} {16.9.0_amd35_card_after_asking.jpg} {16.9.0_amd35_log.txt}

Expect Result:
After the storyboard preview the assistant shows Choose your video settings.
摘要：分鏡預覽完成後應顯示 Choose your video settings 影片設定卡。
Spec string: 「Choose your video settings」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/05_ISS-AMD-35/`

---

## 6. ISS-AMD-36 — Credit card turns into a plain option after the chat-limit dialog  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Filed as:** DRI261897P0011  ·  **Report step:** O-23  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Off-case observation O-23 (Crime Romance). With the daily chats used up (Pink Unlimited daily chat OFF + Use up today's chats), sending a message shows the limit dialog; after closing it with ✕ the 「Create storyboard ◆31 · Generate」 credit card is re-rendered as a plain 「Create storyboard →」 option row with no price (21:54 on 10/19 and 08:49 on 10/20). Tapping a priced action without seeing its price is the concern. No log excerpt: the app writes nothing to its AI Mini Drama log for the limit dialog or the re-render.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create storyboard card loses its price after the chat-limit dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open a drama whose chat ends with the Create storyboard credit card
3. Use up today's chats, type a message and tap Send
4. Close the chat-limit dialog with X
5. Check the result

Result:
The Create storyboard ◆31 card becomes a plain Create storyboard → row with no price.
摘要：關閉聊天上限對話框後，Create storyboard ◆31 卡片變成沒有價格的選項列。
{16.9.0_amd36_card_before.jpg} {16.9.0_amd36_option_after.jpg}

Expect Result:
The Create storyboard card keeps its price and Generate button.
摘要：Create storyboard 卡片應保留價格與 Generate 按鈕。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/06_ISS-AMD-36/`

---

## 7. ISS-AMD-38 — Failed scene image card copy differs from the Design spec  ·  Class: UX  ·  Severity: S3  ·  Owner: PM

**Filed as:** DRI261897P0012  ·  **Report step:** TC-067  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Scene image failure injected with Pink › Fail media tool = TextToImage (tool_error → the app's 4xx path), Echoes in the Dark Scene 3. Card: 「Couldn't create image ⓘ」 / 「Your credits have been refunded. Try editing the description for a different result.」 with Edit. Design ds-storyboard (1012 frames) shows the card as 「Couldn't create image ⓘ」 / 「Your credits have been refunded. The service is busy - try again later.」; PM's newer error board uses the app's wording. The ⓘ dialog matches Design's 4xx frame exactly. The 10/16 run withdrew the opposite finding (ISS-AMD-16) under the Design-first rule, so this needs a PM/Design ruling on which card copy is right: Design's 「service is busy」 contradicts its own terms-of-service dialog. Owner PM.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Failed scene image card copy differs from the Design error frame
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama and create a drama to the storyboard
3. Make one scene image fail (moderation or tool error)
4. Open the failed scene
5. Check the result

Result:
The card reads Your credits have been refunded. Try editing the description for a different result.
摘要：失敗卡片顯示「Try editing the description」，與 Design 文案不同。
{16.9.0_amd38_card.jpg} {16.9.0_amd38_info_dialog.jpg} {16.9.0_amd38_log.txt}

Expect Result:
The card copy matches the Design storyboard error frame (or PM confirms the new copy).
摘要：卡片文案應符合 Design 分鏡錯誤畫面，或由 PM 確認新文案。
Spec string: 「Your credits have been refunded. The service is busy - try again later.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/07_ISS-AMD-38/`

---

## 8. ISS-AMD-39 — Leaving during outline generation discards the drama  ·  Class: UX  ·  Severity: S3  ·  Owner: PM

**Filed as:** DRI261897P0013  ·  **Report step:** TC-159  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Spec (TC-025 dialog) says leaving before the outline exists loses the chat, and the app warns: 「Leave this chat?」 / 「Your story outline isn't ready yet, so this chat won't be saved.」. The user's QA rule 2 (R-139) expects any running stage to survive leaving as a recognizable task. The log shows the outline actually finished at 20:51:35 (turn complete, stage outline), a few seconds before Leave anyway was tapped while the dialog still said the outline was not ready, and the drama was discarded anyway. Every later stage does survive (characters, revision, storyboard and video all keep running in the background and reopen from History); only the outline is thrown away, even though it finishes in ~30 s. Owner PM: decide whether the outline should also continue in the background.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Leaving during outline generation discards the drama instead of keeping it
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Open AI Mini Drama, enter an idea and tap Generate on the format card
3. While the outline is generating tap Back, then Leave anyway
4. Return to AI Mini Drama and open History
5. Check the result

Result:
The drama is gone from History; the outline that was generating cannot be continued.
摘要：離開後該劇本消失，History 無紀錄，無法繼續。
{16.9.0_amd39_leave_dialog.jpg} {16.9.0_amd39_history_without_it.jpg} {16.9.0_amd39_log.txt}

Expect Result:
The outline keeps generating and the drama appears in History, like later stages.
摘要：大綱應繼續生成並出現在 History，與其他階段一致。

Note:
Device: iPhone 17 Air / iOS 26.2.1
<Claude Reviewed>
```

**Images:** `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0_images/08_ISS-AMD-39/`

---

## Rechecks — existing tickets that still reproduce on 189729 (comment or reopen, do not file again)

| P1 case(s) | Ticket | Ticket | What P1 saw |
|---|---|---|---|
| TC-014 | DRI261895P0023 | NewCreated — Surprise me replaces the composer instead of appending | Still reproduces on 189729. |
| TC-019 | DRI261896P0059 | 10/16 batch — More ideas + chip missing once the chat has content | Still reproduces. |
| TC-025, TC-026 | DRI261896P0047 | 10/16 batch — template chat skips Leave this chat? on Back during outline | Still reproduces; on template chats the History icon skips the dialog too (DRI261894P0049 described History only). |
| TC-039, TC-040, TC-047, TC-070 | DRI261896P0046 | 10/16 batch — character, scene image and chat update prices differ from the spec | Still reproduces: ◆4 per character (Design ◆6), scene regenerate ◆6 for 2 images with no 「(2 images)」 note (Design ◆12), storyboard 3 credits/image (O-13). |
| TC-042, TC-043 | DRI261896P0042 | 10/16 batch — failed character generation shows no error, no ! and no refund notice | Still reproduces, and the failed character's TTS credit is kept (net −5 / −1). |
| TC-044 | DRI261894P0013 | NeedMoreInfo — asks to regenerate a storyboard that doesn't exist yet | Still reproduces: 「Generated the complete 6-beat storyboard…」 before any storyboard (also seen on Shared Turf O-9 and Crime Romance TC-103). Add as the requested info. |
| TC-045, TC-103 | DRI261896P0054 | 10/16 batch — cast change shows the wrong assistant prompt | Still reproduces for a chat cast change and a Change Characters swap; the prompt also claims a finished storyboard. |
| TC-031 | DRI261896P0053 | 10/16 batch — policy-violating idea gets a free-form refusal instead of the spec message | Still reproduces (Iris's own refusal text, no spec copy). |
| TC-054 | DRI261896P0041 | 10/16 batch — public-figure reference photo not blocked | Still reproduces (◆4 charged). |
| TC-072 | DRI261895P0025 | NewCreated — storyboard revision offer mislabeled Create storyboard | Still reproduces (◆3). |
| TC-073 | DRI261896P0045 | 10/16 batch — updating a storyboard image from chat fails silently | Still reproduces 2/2; the cause is the same storage upload failure as the video (DRI261896P0020). |
| TC-079 | DRI261896P0060 | 10/16 batch — video settings copy (quick draft; Generate; Preview - 30 sec) | Still reproduces. DRI261894P0019 (different lengths per drama) not reproduced. |
| TC-081, TC-083 | DRI261895P0022 | NewCreated — first video omits the notification pre-prompt | Still reproduces, also on a clean fresh install (10/20). |
| TC-082, TC-084, TC-083 | DRI261896P0050 | 10/16 batch — no Back toast and no processing label in History | Still reproduces. |
| TC-086 | DRI261896P0020 | Closed NotReproducible (189631) — final video always fails with 1 clip couldn't be generated | Reproduces 7/7 on 189729 with the server-side cause: raised again as ISS-AMD-37 citing this ticket (user 2026-10-20). |
| TC-091, TC-092 | DRI261896P0052 | 10/16 batch — failed clip shows 1 clip couldn't be generated with no Fix scenes path | Still reproduces: button 「Fix Clips」, no chat refund line, no Retry, editor offers 「Regenerate Clip ◆60」 (spec Regenerate scene ◆30). |
| TC-108 | DRI261896P0057 | 10/16 batch — renamed drama stays in place and keeps its old time | Still reproduces. |
| TC-113 | DRI261896P0032 | NeedCodeReview — saved storyboard chat does not reopen at the bottom | Still reproduces, on every stage. |
| TC-115 | DRI261896P0055 | 10/16 batch — no You'll have N left under Generate | Still reproduces (「You have N credits left」). |
| TC-153, TC-155 | DRI261893-0128 | NewCreated — outline and revision Stop give no explanatory feedback | Still reproduces (storyboard and video: new ISS-AMD-32). |
| TC-154, TC-161 | DRI261895P0024 | NewCreated — character generation has no usable Stop or warning | Still reproduces; the sheet's ✕ is ignored and Back is covered, so the user can't leave either (see ISS-AMD-33). |
| TC-164 (passed; O-11) | DRI261896P0048 | 10/16 batch — no Stop and lose your credits? dialog on Back during storyboard | Still reproduces (Back at 21:10:03 went straight to History). |
| TC-169 | DRI261895P0029 | NewCreated — outline blocks beyond ten seconds | Still reproduces (26 s). |
| TC-171 | DRI261895P0030 | NewCreated — revision blocks beyond ten seconds | Still reproduces (38 s). |
| TC-173 (O-22) | DRI261895P0031 | NewCreated — video production blocks beyond ten seconds | Still reproduces (~366 s). The failed run ended with no failure card and removed the video settings card — add to DRI261896P0043 (failed turn ends silently). |

Not reproduced on 189729 (candidates to close): DRI261893-0015 (TC-107), DRI261893-0016 and DRI261896P0030 (TC-109), DRI261896P0026 (TC-105), DRI261894-0001 (TC-005), DRI261894P0001 (TC-069), DRI261894P0006 (TC-041/042), DRI261894P0009 (TC-047), DRI261894P0035 (TC-086), DRI261894P0039 (TC-055), DRI261895P0035 (TC-064), DRI261893-0145 (TC-064/065), DRI261893-0158 (TC-010), DRI261893-0051 (TC-003), DRI261894P0019 (TC-079). Not checkable (needs a finished video): DRI261894P0016, DRI261894P0051, DRI261895P0027, DRI261895P0028, DRI261896P0015, DRI261896P0029, DRI261893-0064.

## Table corrections (not app problems)

| Case | Why the app is right |
|---|---|
| TC-066 | Location tile: the app shows the location and scene images side by side with no 「Location」 label, exactly as Design does; the row's Expected is the older PM layout. Update the row (DRI261895P0026's symptom is Design-conformant). |
| TC-078 | Storyboard preview failure: the app shows Design's 「Storyboard preview unavailable. Some credits were refunded. Try again to generate the preview.」 with Retry ◆1; the row's Expected is the older PM copy. Update the row. |

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-12 | Spurious 「Here's your drama.」 failed-clip card after a scene image regenerate | Folded into the DRI261896P0020 recheck (same storage failure). |
| O-14 | Preview Retry labelled ◆1 booked −2 Text to Speech | ⏳ Needs one more read: the log shows one TTS call and a revoke of 1; match the ledger once more before raising. |
| O-17 | Drama abandoned at 15:18 finished on the server and jumped to the top of History on reopen 5 h later | Observation for PM — completing an abandoned turn may be intended; no spec covers it. |
| O-18 | Character library took ~37 s to load once (Pink delay was 0) | ⏳ Seen 1/1; recheck before raising. |
| O-21 | Reopened chat shows only the outline card without the user's messages | Not a defect — the History hint says only outline, images and videos are kept. |
| O-24 | Mine card says Free while the account behaves as Pro+ | Out of scope (Mine/IAP, not AI Mini Drama) — mention to the IAP owner. |
| O-2, O-10, O-20, O-25 | Credit balance moves without this phone acting | Shared test account (other devices); not a defect. |
| Blocked (32) | TC-002, TC-068, TC-074, TC-085, TC-087, TC-088, TC-089, TC-090, TC-093, TC-095, TC-096, TC-097, TC-098, TC-099, TC-114, TC-116, TC-167, TC-168, TC-174, TC-215, TC-216, TC-217, TC-218, TC-222, TC-223, TC-225, TC-226, TC-227, TC-228, TC-231, TC-232, TC-233 | No verdict: blocked behind the video failure (DRI261896P0020), test data (balance, sandbox purchase, 9999 server limit) or observability — reasons in results.csv. |

## Reconciliation against the report

The run is the report: 43 failed cases plus off-case observations O-1…O-25.

| Step | Count | Running total |
|---|---|---|
| Failed cases | 43 | 43 |
| Already a ticket → Rechecks table (35 cases) | −35 | 8 |
| Table corrections, app matches Design (2) | −2 | 6 |
| Remaining failed cases (TC-067, TC-156, TC-157, TC-159, TC-170, TC-172) plus the no-ticket parts of TC-083, TC-086 and TC-161 (counted as rechecks above) → new entries | → 6 entries | 6 |
| Entries from observations on passing cases (O-15, O-23) | +2 | **8 to file** |

### Row-by-row map

| Failed case | Became |
|---|---|
| TC-014 | recheck DRI261895P0023 |
| TC-019 | recheck DRI261896P0059 |
| TC-025 | recheck DRI261896P0047 |
| TC-026 | recheck DRI261896P0047 |
| TC-031 | recheck DRI261896P0053 |
| TC-039 | recheck DRI261896P0046 |
| TC-040 | recheck DRI261896P0046 |
| TC-042 | recheck DRI261896P0042 |
| TC-043 | recheck DRI261896P0042 |
| TC-044 | recheck DRI261894P0013 |
| TC-045 | recheck DRI261896P0054 |
| TC-047 | recheck DRI261896P0046 |
| TC-054 | recheck DRI261896P0041 |
| TC-066 | table correction (app matches Design) |
| TC-067 | 7. ISS-AMD-38 |
| TC-070 | recheck DRI261896P0046 |
| TC-072 | recheck DRI261895P0025 |
| TC-073 | 1. ISS-AMD-37 + recheck DRI261896P0045 |
| TC-078 | table correction (app matches Design) |
| TC-079 | recheck DRI261896P0060 |
| TC-081 | recheck DRI261895P0022 |
| TC-082 | recheck DRI261896P0050 |
| TC-083 | 4. ISS-AMD-34 + recheck DRI261895P0022 + recheck DRI261896P0050 |
| TC-084 | recheck DRI261896P0050 |
| TC-086 | 1. ISS-AMD-37 + recheck DRI261896P0020 |
| TC-091 | recheck DRI261896P0052 |
| TC-092 | recheck DRI261896P0052 |
| TC-103 | recheck DRI261896P0054 |
| TC-108 | recheck DRI261896P0057 |
| TC-113 | recheck DRI261896P0032 |
| TC-115 | recheck DRI261896P0055 |
| TC-153 | recheck DRI261893-0128 |
| TC-154 | recheck DRI261895P0024 |
| TC-155 | recheck DRI261893-0128 |
| TC-156 | 2. ISS-AMD-32 |
| TC-157 | 2. ISS-AMD-32 |
| TC-159 | 8. ISS-AMD-39 |
| TC-161 | 3. ISS-AMD-33 + recheck DRI261895P0024 |
| TC-169 | recheck DRI261895P0029 |
| TC-170 | 3. ISS-AMD-33 |
| TC-171 | recheck DRI261895P0030 |
| TC-172 | 3. ISS-AMD-33 |
| TC-173 | recheck DRI261895P0031 |
| O-15 (observation) | 5. ISS-AMD-35 |
| O-23 (observation) | 6. ISS-AMD-36 |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 3, 4, 6 |
| PM | 2, 5, 7, 8 |
| Doc | — |

### Filing order

RD entries in number order, then PM rulings: **1**, **3**, **4**, **6**, **2**, **5**, **7**, **8**. Post the Rechecks comments on the existing tickets as well (the storage upload error also belongs on DRI261896P0020 and DRI261896P0045).

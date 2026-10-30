# AI Mini Drama (Android) — eBug drafts, phase A7 (table v6), PDR-A 16.8.0 build 2610212

**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/android/runs/2026-10-29-a7-full/` — phase A7 of draft `drafts/20261029-152721` (table v6, 501 cases), 2026-10-29 16:05 → 10-30 11:01 on Sony Xperia 10 III (XQ-BT52) / Android 12 through Appium / UiAutomator2, TR261021-0082, Stage server, account 「ethan.hsu.cl」 (Free). Tally: 222 Pass, 161 Fail, 118 Blocked.

**Final (2026-10-30):** all 501 cases recorded (0 Not run). Refreshed after the interim wrap-up for A7-j (three clean installs, 09:00–10:08, user signing in) and the 9 cases deferred to the user (first-use hints, system language via `launch --lang`, media-permission reset; 10:14–11:01). New since the interim: ISS-AMDA-67 (no intro page, TC-541 rechecked on clean installs), 68 / 69 / 70 (untranslated category headers and template names, French copy, 12-hour AM times); TC-081 / 303 / 304 repeat DRA262610P0362 and TC-412 repeats DRA262610-0059 (dedupe.txt only).

**Status:** nothing filed, uploaded or commented. Filing defaults from the newest filed batch (`ebug-defaults.ts ai-mini-drama android`: 2026-10-28-a4, Creator ETHAN_HSU, TR261021-0082, [AIAgent], API) are prefilled on the review page for confirmation. Dedupe was read-only, Android pool only (dedupe per OS, user 2026-10-28).

Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure- or charge-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (RD, 2026-10-21). Spec basis check (REQ-055) done per entry (QA notes name the rule; team rules are named as such). Prices follow REQ-059: the MX charging sheet's original prices are expected. Android has no fault switches in 16.8, so failure entries rest on real failures (named in each QA note).

**What is drafted:** 11 new entries (ISS-AMDA-60…70), all proposed for filing. 142 Fail rows repeat an existing Android ticket only (124 tickets incl. the A2 bugs DRA262610P0324–P0363 and the A4 bugs DRA262610P0380–P0392) and are left out (dedupe.txt only); 7 rows are held (PM questions, rechecks).

Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD. Every entry links the spec board or Figma frame it is checked against.

---

## 1. ISS-AMDA-60 — Failed storyboard images say credits were refunded but the 15 credits never return  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-465, O-6  ·  **Reproduce:** 1/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-057 (PM update 6: a failed scene image shows 「Couldn't create image / Your credits have been refunded…」) and the refund rule (rule 8, §13.10). Run on a REAL failure (no fault switch on Android 16.8): Romance (1) storyboard ◆34, Wi-Fi off over USB 20:09:21–20:09:48 during the scene images (restored right after). logcat: 5 scene images were charged ◆3 each at 20:09:15–20:09:20 (MyCreation receipts img_1…img_5, totalRemain 14790 → 14775), then failed at 20:09:22–25 (MiniDramaFail [TextToImage] generation_failed … tti=query_status_failed). Each failed image's MyCreation receipt is then marked 「completed」 (receipt completed call=…img_N right after each failure), which may be why no refund is booked. Every failed scene says 「Your credits have been refunded.」 but no refund arrived: no 「Generation failed, credits returned」 row in Credit Details / getCreditHistory and no balance rise at 20:22, 20:40 and 20:44 (35 min later). Missing ◆15. The same run's first failure (The Art of Falling Scene 4, server error_code 4000, A7-d1) WAS refunded +3 within seconds, so the refund fails when the failure is the client's status query during a network drop (query_status_failed): the server may have finished or never marked the jobs failed while the app tells the user the credits came back. Closest Android ticket DRA262610P0308 (Assigned: 5 of 6 storyboard images fail, Credit Details shows only 2 refunds) — a server-side failure with partial refunds; this entry is the network-drop path with none refunded and the refund message shown anyway. Reviewer: hold it if you judge it the same as P0308.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed storyboard images claim a refund, but the 15 credits never return
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create the storyboard?」
5. Read the balance on the credit pill
6. Tap Generate on the Create storyboard card
7. Turn Wi-Fi off while the scene images are being created
8. Wait 30 seconds
9. Turn Wi-Fi on
10. Wait for the storyboard to finish
11. Tap a failed scene on the Storyboard Result card
12. Tap ✕
13. Wait 30 minutes
14. Tap the credit pill
15. Tap Details
16. Check the result

Result:
5 scene images fail after a charge of 3 each; each says credits were refunded, but none come back after 35 min.
摘要：5 張場景圖扣點後失敗並顯示已退款，35 分鐘後仍未退回 15 點。
{16.8.0_amda60_failed_scene_refunded.jpg} {16.8.0_amda60_details_2023_no_return.jpg} {16.8.0_amda60_details_2040_no_return.jpg} {16.8.0_amda60_log.txt}

Expect Result:
Each failed image's 3 credits are returned and Credit Details shows 「Generation failed, credits returned」.
摘要：每張失敗圖片退回 3 點，Credit Details 顯示退款紀錄。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 6 (Error) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610P0308 (5 of 6 storyboard images fail, only 2 refunds)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/01_ISS-AMDA-60/`

---

## 2. ISS-AMDA-61 — Video prices are below the charging sheet's original prices  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-080, TC-230, O-17  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-069 (changed 2026-10-29, REQ-059: the user ruled that the MX ③ charging sheet's ORIGINAL prices are the expected prices; the promotion price is held): Seedance 2.0 (1080p) 13 credits per second, Seedance 2.0 Mini (720p) 4 per second, Seedance 2.5 keeps PM 10/16's 6 per second (the sheet has no 2.5 row). The build quotes and charges PM 10/16's older rates: Glad We Came (A7-g1 22:08) Preview • 30 sec Best ◆120 / Standard ◆120 / Fast ◆60, Full Video 90 sec ◆360 / ◆360 / ◆180; Corporate Rivalry card the same (A7-f TC-230); charged as shown (Standard preview 22:11:57: logcat RefToVideo credit action_id=genvideo_1_sec_bytedance_seedance2.0std_none_480p_aiminidrama perSecond=4 unit=15 total_credit=60 per 15-s clip; the sheet's id is genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_normal). A 15-s scene regeneration from the chat cost ◆60 (O-17; sheet ◆195). Expected vs app: Standard ◆390 / ◆1170 vs ◆120 / ◆360; Fast ◆120 / ◆360 vs ◆60 / ◆180; Best ◆180 / ◆540 vs ◆120 / ◆360. Related, not duplicates: DRA262610P0274 (PM, NewCreated: Best and Standard quote the same — still true), DRA262610P0327 (character ◆4 vs ◆6) and DRA262610P0198 (storyboard rate) cover the other actions of TC-230 and are listed only in dedupe.txt; DRA262610P0032 (Cancelled: a 720p request billed under a 480p action id). RD may forward to PM if the sheet is not the price to ship.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Video is priced below the charging sheet: Standard 30 s is 120 credits, not 390
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your video settings」
5. Tap Best
6. Tap Standard
7. Tap Fast
8. Tap Full Video - 90 sec
9. Tap Best
10. Tap Standard
11. Tap Fast
12. Tap Preview - 30 sec
13. Tap Standard
14. Tap Generate video
15. Read the balance on the credit pill
16. Check the result

Result:
Preview 30 s: Best 120, Standard 120, Fast 60; Full 90 s: 360 / 360 / 180; charged as shown (Standard 4/s, Fast 2/s).
摘要：試看：120 / 120 / 60；完整：360 / 360 / 180，並依此扣點。
{16.8.0_amda61_preview_best.jpg} {16.8.0_amda61_preview_standard.jpg} {16.8.0_amda61_preview_fast.jpg} {16.8.0_amda61_full_standard.jpg} {16.8.0_amda61_log.txt}

Expect Result:
PDRM MX sheet: Standard 13/s (390 / 1170), Fast 4/s (120 / 360); Best 6/s (180 / 540) per PM 10/16 (no sheet row).
摘要：計費表：Standard 每秒 13、Fast 每秒 4；Best 依 PM 每秒 6 點（表無此列）。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: PDRM MX spec, v1 ③ Credit Charging Table (action id) board (mx-a-right), linked sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (2026-10-20) - https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1057-24035
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRA262610P0274 (Best and Standard quote the same credits)
Related: DRA262610P0032 (Cancelled)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/02_ISS-AMDA-61/`

---

## 3. ISS-AMDA-62 — Scene regenerate shows a raw debug toast to the user  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-428, TC-275, O-2  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** QA rule 7 (R-149, team rule: every product-authored text is free of errors and untranslated strings) on the PM update 6 / Design storyboard failure states, which give the user-facing copy (「Couldn't create image」 card) and no toast. Seen twice in A7-d1/d2: (1) Art of Falling Scene 4 regenerating › X › Leave anyway 19:16:45 → toast 「MiniDrama FAIL [scene regenerate]: turn failed」 (logcat cancel_turn, final_state=cancelled; nothing charged); (2) Romance (1) Scene 5 › Edit › Done › Regenerate Image with Wi-Fi off 20:14:40 → toast 「MiniDrama FAIL [scene regenerate]: shot=beat_1bcf94cc | turn failed」 (logcat final_state=block; the service-busy copy on that path is DRA262610P0123, not repeated). Related, closed: DRA262610P0212 (Close — the same raw 「MiniDrama FAIL」 toast after stopping the outline); the toast is back on the scene-regenerate path, so this is a new entry naming it (closed-ticket rule, user 2026-10-28).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Leaving a scene regenerate shows a raw 「MiniDrama FAIL」 debug toast
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose storyboard has a failed scene
5. Tap the failed scene on the Storyboard Result card
6. Tap Edit
7. Tap Regenerate Image
8. Tap X while the image regenerates
9. Tap Leave anyway
10. Look at the bottom of the chat
11. Check the result

Result:
Back in the chat a toast reads 「MiniDrama FAIL [scene regenerate]: turn failed」.
摘要：聊天出現除錯 toast「MiniDrama FAIL … turn failed」。
{16.8.0_amda62_debug_toast.jpg} {16.8.0_amda62_log.txt}

Expect Result:
No debug text reaches the user; a stopped regenerate shows no error toast.
摘要：不應向使用者顯示除錯文字。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 6 (Error) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610P0212 (Close)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/03_ISS-AMDA-62/`

---

## 4. ISS-AMDA-63 — A finished video sends one 「Your drama is ready」 push per clip  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-307, O-11  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-170 (PM 09/30 updates §6.3: in the background a finished video sends ONE push 「Your drama is ready」 / 「"{Drama title}" is done. Tap to watch it.」). A7-g3 Trust Renamed full episode ◆240, Generate 01:01:53, app sent Home 01:02:34: FCM delivered the push four times, once per clip (01:08:57, 01:09:17, 01:10:57, 01:11:13), all shown in the shade; the turn completed at 01:11:16. A7-g1 the same on Glad We Came (preview twice 22:18:18 / 22:19:32, full four times 22:28–22:29) and The Art of Falling (twice). The earlier pushes say the drama is done while clips are still generating. A4 saw two deliveries with one notification shown. Tapping the push opens History (DRA262610P0368, not repeated); the in-app banner shown before the full finished is DRA262610P0379 (TC-085, not repeated).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: One video sends a 「Your drama is ready」 push per clip, four for one episode
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished 30-second preview
5. Tap Generate on 「Create the full episode (60 sec)」
6. Tap the Home button
7. Wait 15 minutes
8. Swipe down from the top of the screen
9. Check the result

Result:
Four 「Your drama is ready」 pushes arrive for one full episode, one per clip, the first while clips still generate.
摘要：一集收到四則完成推播（每段一次），首則送出時仍在產生。
{16.8.0_amda63_push_stack.jpg} {16.8.0_amda63_log.txt}

Expect Result:
One push 「Your drama is ready」 / 「"<title>" is done. Tap to watch it.」 when the whole video is finished.
摘要：整部影片完成時只推播一次。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 0930 updated board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRA262610P0368 (push opens History)
Related: DRA262610P0379 (banner while still generating)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/04_ISS-AMDA-63/`

---

## 5. ISS-AMDA-64 — Scene description editor at the 1,000-character limit shows no red counter or message  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-312  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-174 (PM update 3 §13.11; Design storyboard / video editors 967/1000): the 1,000-character limit applies to every description input including the scene image description: red 「1000/1000」, extra input ignored, pasted text cut, 「You've reached the 1,000-character limit.」. A7-d2 Romance (1) Scene 4 (failed) › Edit: editor 570/1000; a 1,000-character text and a 1,050-character text were entered with the test driver's text entry (not the clipboard), 「XYZ」 typed on the keyboard: the text stops at 1,000 (ends 「…while Mal」) — that part works — but the counter stays white 「1000/1000」 and no limit message appears. Related, not duplicates: DRA262610P0127 (Cancelled: the idea input's 1,000-character warning), DRA262610P0149 (Close: editor text touching the counter), DRA262610P0335 (character description editor).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Scene description editor at 1,000 characters: no red counter or limit message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose storyboard has a scene with no image (Edit shown)
5. Tap that scene on the Storyboard Result card
6. Tap Edit
7. Tap the description
8. Enter a 1,000-character description (test driver text entry)
9. Type XYZ
10. Enter a 1,050-character description (test driver text entry)
11. Check the result

Result:
The text stops at 1,000 characters, but the counter stays white 「1000/1000」 and no limit message appears.
摘要：文字停在 1,000 字，但計數器仍為白色「1000/1000」，也沒有上限提示。
{16.8.0_amda64_counter_white.jpg}

Expect Result:
The counter turns red 「1000/1000」 and 「You've reached the 1,000-character limit.」 shows.
摘要：計數器應變紅並顯示「You've reached the 1,000-character limit.」。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Storyboard board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610P0127 (Cancelled)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/05_ISS-AMDA-64/`

---

## 6. ISS-AMDA-65 — A Mine character's face turns about 25 years younger in the full episode  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-438  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** PM main flow intro (R-472): 「Turn your idea into a video—same characters, same voices, every scene.」; closed Android ticket DRA262610-0041 (Close, fixed in 16.8.0.2610212: 「A character should keep the same face and hair in every clip」). A7-g2 Hidden Identity (The New Guy's Secret › Make my version; Jenna = the Mine East Asian grey-bob chef look, about 55; English, no captions; Fast = Seedance 2.0 Mini): in the preview clips 1–2 Jenna matches her portrait, but in the full episode's clips 3–6 she is a woman of about 30 with the same grey bob and chef coat (clip 4 loading dock, clip 6 warehouse), although the shot prompt says 「JENNA's face, build, hair, and chef workwear remain fixed across all cuts」 (logcat 23:35:10). Noah, Caleb and Richard keep their looks; nobody takes another's look. TC-438's own path (Three Kingdoms template, Character B vs C) is not on this account; this entry rests on the closed ticket coming back on 2610212 (closed-ticket rule, user 2026-10-28) and the PM promise, not on that row's B/C check. Related: DRA262610P0161 (ProposeNAB, wrong image on Character B), DRA262610P0156 / P0154 (outfit continuity).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A Mine character's face turns about 25 years younger in the full episode's clips
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose cast uses a Mine look of a woman about 55, with a finished 30-second preview
5. Tap Generate on 「Create the full episode (60 sec)」
6. Wait for 「Here's your drama.」
7. Tap Play drama
8. Tap clip 1 in the clip strip
9. Tap clip 3 in the clip strip
10. Tap clip 4 in the clip strip
11. Tap clip 6 in the clip strip
12. Check the result

Result:
Jenna is about 55 in the preview's clips 1–2 but about 30, with the same grey bob, in the full episode's clips 3–6.
摘要：Jenna 在試看片段 1–2 約 55 歲，但在完整版片段 3–6 變成約 30 歲（髮型相同）。
{16.8.0_amda65_jenna_clips.jpg} {16.8.0_amda65_frames.jpg} {16.8.0_amda65_log.txt}

Expect Result:
A character keeps the face of its portrait in every clip of the drama.
摘要：角色在每個片段都應維持其角色圖的臉孔。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, main flow 「Demo page_Straight video」 frame - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2283-10856
Spec Link: AI Mini Drama Design spec, Video board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610-0041 (Close)
Related: DRA262610P0161 (ProposeNAB)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/06_ISS-AMDA-65/`

---

## 7. ISS-AMDA-66 — Updating two characters in chat charges and regenerates three  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-350  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-254 (PM update 7, 10/16): a priced 「Update characters」 card charges one character × count. A7-b2 Trapped Together (4 characters set, no storyboard): 「Please change the looks of two characters: make Tessa Shaw and Marcus Vance both look about 50 years old.」 → card ◆12 = 3 × the one-character ◆4 (TC-349), Generate 17:49:11: logcat pre-approved 'character': {IMAGE=3, VOICE=3}, receipts img_1 / img_3 / img_5 (◆3) + tts_2 / tts_4 / tts_6 (◆1), 15019 → 15007; the result shows Oriana Wynn regenerated too (grey hair) besides Tessa and Marcus. A4 (TC-350) saw the same 3-for-2 regeneration; only the missing 「• 2 characters」 label was mapped then (DRA262610P0328, not repeated). At v6 prices 2 × ◆6 = ◆12 matches only by coincidence; the build's own price is ◆4 per character (DRA262610P0327, not repeated).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Asking to update two characters charges for and regenerates three
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose four characters are set (no storyboard yet)
5. Type 「Please change the looks of two characters: make Tessa Shaw and Marcus Vance both look about 50 years old.」
6. Tap Send
7. Read the price on the Update characters card
8. Tap Generate
9. Wait for the characters to finish
10. Check the result

Result:
The card asks 12 (three × 4) for two characters; three are regenerated, Oriana Wynn too, and 12 are charged.
摘要：要求更新兩位角色，卡片卻收三位的點數（12），並重生了三位角色（含未要求的 Oriana Wynn）。
{16.8.0_amda66_card_12.jpg} {16.8.0_amda66_three_regenerated.jpg} {16.8.0_amda66_log.txt}

Expect Result:
The card charges for the two characters asked for, and only Tessa Shaw and Marcus Vance are regenerated.
摘要：應只收兩位角色的點數，且只重生 Tessa Shaw 與 Marcus Vance。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRA262610P0328 (no character count on the card)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/07_ISS-AMDA-66/`

---

## 8. ISS-AMDA-67 — Opening AI Mini Drama on a clean install shows no intro page  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-541, O-23  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-472 (PM main flow 「Demo page_Straight video」 2283:10856, REQ-052; PM-only, no Design frame yet — the Design's Launcher arrow goes straight to the landing, so RD may forward to PM): opening AI Mini Drama from the Launcher shows an intro page 「AI Mini Drama」 / 「Turn your idea into a video—same characters, same voices, every scene.」 with a demo video, volume icon, 「Don't show again」 and 「Try It Now」. A7-a1 (16:06–16:11, upgraded install): three taps on the Launcher 「AI Mini Drama」 shortcut each opened the landing page (「Hi, I'm your AI Drama Assistant」), none of the intro's controls in the page source. A7-j rechecked on three clean installs (adb uninstall + install of 16.8.0 / 2610212 at 09:00, 09:37 and 10:03; signed out on #1 and #3, signed in on #2): the first tap again opened the landing directly, so a stored 「Don't show again」 is ruled out (TC-541 changed from question to defect). Read-only Android dedupe: no intro / demo-page ticket in the Android pool.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A clean install opens the landing page with no intro page
```

**Description:**

```
Repro Steps:
1. Uninstall the APP
2. Install the APP
3. Launch the APP
4. Tap AI Mini Drama on the Launcher
5. Check the result

Result:
The landing page opens at once: no intro page, demo video, Don't show again or Try It Now (3 clean installs).
摘要：直接進入首頁，沒有介紹頁、示範影片與「Try It Now」（3 次全新安裝皆同）。
{16.8.0_amda67_landing_no_intro.jpg} {16.8.0_amda67_landing_upgrade.jpg}

Expect Result:
An intro page 「Turn your idea into a video—same characters, same voices, every scene.」 with a demo video and Try It Now.
摘要：應先顯示含示範影片與「Try It Now」的介紹頁。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, main flow 「Demo page_Straight video」 frame - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2283-10856
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/08_ISS-AMDA-67/`

---

## 9. ISS-AMDA-68 — Template category headers stay English in every app language; template names stay English in Chinese and French  ·  Class: UI  ·  Severity: S3  ·  Owner: Doc

**Report step:** TC-276, TC-277, TC-406  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-149 (Rule 7: text quality in ENU / CHT / JPN; TC-276 / TC-277 expect no untranslated strings) and R-313 (TR261021-0082 RD Note: the French and Japanese AI Mini Drama UI are fully translated). Run 2026-10-30 10:14–11:01 with `launch --lang` zh-Hant / ja / fr (system locale through the Appium Settings helper; en-US restored after). In all three languages the More page's category headers stay English: Workplace Romance, Fantasy & Destiny, Urban Romance, Family & Life, Animated Stories. In Traditional Chinese and French the template names stay English on the landing, More and Template detail (Merger Season, Forbidden Office Romance, The Art of Falling…), while Japanese shows Japanese names (合併から始まる恋…), so the names are localizable. Not in this entry (existing Android tickets, dedupe.txt only): video settings card, Create storyboard card and agent status lines (DRA262610P0258, RDResolved), filter Gender / Ethnicity options (DRA262610P0284), suggestion chips (DRA262610P0289), assistant replies in English (DRA262610P0248, Propose Wont Fix), English outlines for Japanese (DRA262610P0093). The broad DRA262610P0040 (RDResolved, 2610081: Mini Drama screens stay English) is named as related; reviewer: hold this card if you judge it inside P0040.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Template category headers and names stay English in Chinese and French
```

**Description:**

```
Repro Steps:
1. Set the phone's system language to 繁體中文 (台灣)
2. Launch the APP
3. Tap AI Mini Drama on the Launcher
4. Tap 更多
5. Swipe each template row to its end
6. Tap a template
7. Check the result

Result:
Category headers (Workplace Romance…) and template names (Merger Season…) stay English; Japanese names are translated.
摘要：分類標題與範本名稱（Merger Season 等）仍為英文；日文範本名稱已翻譯。
{16.8.0_amda68_cht_more.jpg} {16.8.0_amda68_fr_more.jpg} {16.8.0_amda68_ja_headers.jpg} {16.8.0_amda68_fr_landing.jpg}

Expect Result:
Category headers and template names are shown in the app language (Chinese, Japanese, French).
摘要：分類標題與範本名稱應以 App 語言（中文、日文、法文）顯示。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Main flow board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama Design spec, Template Detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610P0040 (RDResolved), DRA262610P0258 (RDResolved)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/09_ISS-AMDA-68/`

---

## 10. ISS-AMDA-69 — French copy errors: 「Crédits seront consommés…」 and 「Langage de la vidéo」  ·  Class: UI  ·  Severity: S3  ·  Owner: Doc

**Report step:** TC-406  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-313 (TR261021-0082 RD Note: French AI Mini Drama UI fully translated) and R-149 (Rule 7: no spelling, grammar or punctuation errors). French via `launch --lang fr` (2026-10-30 10:52–10:58): the Create storyboard card's credit line reads 「Crédits seront consommés pour cette tâche.」 (no article; 「Des crédits seront consommés pour cette tâche.」); the format card's first heading reads 「1. Langage de la vidéo」 (「langage」 is a register / programming language; the sent summary bubble already says 「Langue de la vidéo」). Read-only Android dedupe: no French copy ticket (DRA262610P0251 is French 「」 quotes, Propose Wont Fix; DRA262610P0039 a caption wrap, Close).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: French copy: 「Crédits seront consommés」 lacks an article; 「Langage de la vidéo」
```

**Description:**

```
Repro Steps:
1. Set the phone's system language to Français (France)
2. Launch the APP
3. Tap AI Mini Drama on the Launcher
4. Tap Plus
5. Tap The Art of Falling
6. Tap Créer votre version
7. Read the format card
8. Tap Générer
9. Wait for the Create storyboard card
10. Check the result

Result:
The format card reads 「1. Langage de la vidéo」; the storyboard card reads 「Crédits seront consommés pour cette tâche.」
摘要：格式卡為「Langage de la vidéo」；分鏡卡點數說明缺冠詞。
{16.8.0_amda69_langage.jpg} {16.8.0_amda69_credits_line.jpg}

Expect Result:
「1. Langue de la vidéo」 and 「Des crédits seront consommés pour cette tâche.」
摘要：應為「Langue de la vidéo」與「Des crédits seront consommés…」。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Main flow board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/10_ISS-AMDA-69/`

---

## 11. ISS-AMDA-70 — History times use the English 12-hour 「AM」 format in Chinese, Japanese and French  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-276, TC-277, TC-406  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-149 (Rule 7: text quality in ENU / CHT / JPN) and R-313 (RD Note: French and Japanese fully translated). History cards show 「2026/10/30 10:24 AM」 in Traditional Chinese, 「10:51 AM」 in Japanese and 「10:58 AM」 in French (French uses 24-hour time). Closed Android ticket DRA262610P0097 (Close 2026-10-22: Japanese History showed 「12:38 午前」 instead of a Japanese time format) — the time is still not in the app language's format, now in English, so a new card naming the closed ticket (rule of 2026-10-28).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: History times use the English 「AM」 format in Chinese, Japanese and French
```

**Description:**

```
Repro Steps:
1. Set the phone's system language to Français (France)
2. Launch the APP
3. Tap AI Mini Drama on the Launcher
4. Tap History
5. Check the result

Result:
Each card shows 「2026/10/30 10:58 AM」; Chinese and Japanese show 「10:24 AM」 / 「10:51 AM」 too.
摘要：法文、中文與日文的 History 時間皆顯示英文 12 小時制「AM」。
{16.8.0_amda70_fr_history.jpg} {16.8.0_amda70_cht_history.jpg}

Expect Result:
Times follow the app language: 10:58 in French, 上午 10:24 in Chinese, 10:51 or 午前10:51 in Japanese.
摘要：時間應依 App 語言格式顯示（法文 24 小時制、中文「上午」、日文格式）。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRA262610P0097 (Close)
<Claude Reviewed>
```

**Images:** `20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0_images/11_ISS-AMDA-70/`

---

## Held — PM questions and rechecks (not drafted)

| Item | Kind | Why held / what to decide |
|---|---|---|
| TC-103 | question (PM) | No 「Characters updated! Regenerate the storyboard to match?」 after a look swap while the Create storyboard card is offered. The spec draws the prompt, but DRA262610P0299 ([UX], PM) asks for exactly what the build does. Held in A4 too. |
| TC-158 | question (PM) | An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row (held in A2 / A4). |
| TC-159 | question (PM) | Back during the first outline shows 「Leave this chat? … won't be saved」 and Leave anyway drops it; whether R-139 (QA rule) applies before an outline exists is for PM (held in A2). |
| TC-161 | question (PM) | A running character generation can only be left through 「Stop and lose your credits?」 › Leave anyway (picks lost). The PM update board 9 (10/16) draws exactly that dialog for characters, so the QA rule R-139 conflicts with the spec (held in A2). |
| TC-234 | question (PM) | Family & Life template 2 is 「Proposal Across Lifetimes」 on the Android Stage CMS, not 「Proposal Across Every Lifetime」 (table, iOS roster). Intended rename? Re-frozen as template-roster-20261030.json (held in A4 as TC-265). |
| O-21 | question (PM) | The next-slot hint 「Tap to choose a look for {name}」 came back on every fresh install of the same account (A7-j installs #1–#3). R-252 (PM §13.1) says once per user; the build keeps the flag per install. Is per install acceptable, or must it follow the account across reinstalls and devices? |
| TC-289 | recheck (result conflict) | TC-289 again records no 「White」 in the Filter's Ethnicity row (six chips seen), while TC-288 in the same run applied White (the row scrolls sideways). Not drafted; if White is really missing it is closed DRA262610-0019 coming back. Recheck by swiping the Ethnicity row. |

## Not raised (observations, for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-1 | Camera from Add Media let Android kill the app; the restored Make your character form could not generate (setCharacter REJECTED, no message) and the new drama was lost (A7-c1) | Single sighting tied to Android's memory kill; recheck by opening the camera from Add Media before raising. |
| O-3 | Replace on a template's female lead opened Choose Character with a Mine young man pre-selected (A7-d1) | Single sighting; recheck. |
| O-8 | The first scene regenerate after a storyboard whose preview TTS failed is ◆4 (image + TTS), later ones ◆3 (A7-d2) | Price detail inside DRA262610P0198's rate; no rule on when TTS is redone. |
| O-9 | Full-episode offer changed from (60 sec) ◆240 to (75 sec) ◆300 after a ◆3 scene image update (A7-e) | No spec rule for the offer length after an update; one sighting (DRA262610P0159 family). |
| O-13 | A video settings card in a chat with failed or changed images is priced above the plain video price (images regenerated inside the video turn, nothing says why) (A7-g2) | Charged equals the shown total; whether the card should itemise it is a PM question, not raised. |
| O-14 | Video generation survives a Wi-Fi drop of 70 s / 3 min 52 s; every clip delivered (A7-g2) | Not a bug (good behaviour). |
| O-15 | Fast = Seedance 2.0 Mini; a 60-s full episode in about 7 min (A7-g2) | Information. |
| O-22 | The History hint did not show on the first (empty) History visit; it showed on the first visit with a drama card, covering that card's title and date until an outside tap (A7-j) | TC-105 Pass (shows and closes on an outside tap); R-092 does not say what an empty list shows. |
| O-24 | After a relaunch into French the credit pill was blank and Create my character had no credits-left line for ~6 min (getCreditRemain / refreshMemberToken error, socket timeout); opening My Credits refreshed it | Single sighting after a locale relaunch; recheck before raising. |
| O-18 | Wi-Fi lost mid-outline shows 「Something went wrong on my end」 + Try again, not the offline wording (A7-h) | Try again works (TC-301 Pass); R-028 covers sending while already offline. |
| Blocked (118) | 1 defect, 36 observability, 81 test-data | No verdict (reasons grouped on the plan page; run folder blocked-reasons.json). |

## Reconciliation against the run

161 Fail (152 defect, 9 question), 118 Blocked, 0 Not run, 24 observations (observations.md O-1 … O-24).

| Step | Count | Running total |
|---|---|---|
| Fail rows + observations | 185 | 185 |
| → matches an existing Android ticket only (dedupe.txt, not listed) | −150 | 35 |
| → held (PM question, recheck) | −7 | 28 |
| → not raised | −10 | 18 |
| → merged: 18 rows / observations share 11 defects | −7 | **11 entries** |

Rows that feed an entry and also repeat an existing ticket for another part (TC-080, TC-230, TC-275, TC-276, TC-277, TC-307, TC-350, TC-406, TC-428) count once, as entry rows; their ticket part is in dedupe.txt.

### Row-by-row map

| Item | Result | Disposition | Became |
|---|---|---|---|
| TC-541 | Fail | defect | 8. ISS-AMDA-67 |
| TC-014 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0324 |
| TC-015 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-016 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-017 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-019 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0380 |
| TC-414 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0063 |
| TC-468 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0209 |
| TC-488 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0237 |
| TC-024 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0325 |
| TC-448 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0178 |
| TC-497 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0254 |
| TC-508 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0290 |
| TC-452 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0184 |
| TC-357 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0381 |
| TC-358 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0381 |
| TC-031 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0382 |
| TC-480 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0229 |
| TC-036 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0326 |
| TC-410 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0045 |
| TC-039 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0383 / DRA262610P0327 |
| TC-040 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0327 |
| TC-477 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0224 |
| TC-487 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0236 |
| TC-045 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0328 |
| TC-046 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0366 / DRA262610P0333 |
| TC-505 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0285 |
| TC-121 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0329 |
| TC-527 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0329 |
| TC-288 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0385 |
| TC-348 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0331 |
| TC-391 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0332 |
| TC-349 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0333 |
| TC-350 | Fail | defect | 7. ISS-AMDA-66; Android duplicate (dedupe.txt only): DRA262610P0328 |
| TC-429 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0332 |
| TC-351 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0334 |
| TC-352 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0333 |
| TC-047 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0327 |
| TC-478 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0225 |
| TC-469 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0210 |
| TC-051 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0335 |
| TC-057 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-058 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0339 |
| TC-125 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0336 |
| TC-126 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0135 |
| TC-407 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0015 |
| TC-525 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0386 |
| TC-412 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0059 |
| TC-408 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0024 |
| TC-134 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-135 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0387 |
| TC-289 | Fail | defect | held: recheck (result conflict) |
| TC-383 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0147 |
| TC-339 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-340 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0262 |
| TC-341 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0338 |
| TC-342 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-401 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-060 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-377 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0340 / DRA262610P0122 / DRA262610P0197 |
| TC-512 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0341 |
| TC-061 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-398 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-399 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-062 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-359 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 / DRA262610P0195 / DRA262610P0116 |
| TC-513 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0343 |
| TC-535 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0343 |
| TC-514 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0344 |
| TC-063 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-465 | Fail | defect | 1. ISS-AMDA-60 |
| TC-070 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-072 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-385 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0134 |
| TC-073 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0134 / DRA262610P0199 |
| TC-536 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0341 |
| TC-458 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0199 |
| TC-074 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0199 / DRA262610P0027 |
| TC-443 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0169 |
| TC-428 | Fail | defect | 3. ISS-AMDA-62; Android duplicate (dedupe.txt only): DRA262610P0123 |
| TC-491 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0241 / DRA262610P0107 |
| TC-282 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0050 |
| TC-292 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-293 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0388 |
| TC-294 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-537 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0343 / DRA262610P0199 |
| TC-312 | Fail | defect | 5. ISS-AMDA-64 |
| TC-374 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0349 |
| TC-419 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0072 |
| TC-101 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-102 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-103 | Fail | defect | held: question (PM) |
| TC-108 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0047 |
| TC-111 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0046 |
| TC-112 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0389 |
| TC-113 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0346 / DRA262610P0347 |
| TC-275 | Fail | defect | 3. ISS-AMDA-62; Android duplicate (dedupe.txt only): DRA262610P0372 / DRA262610-0050 / DRA262610P0325 |
| TC-276 | Fail | defect | 9. ISS-AMDA-68; 11. ISS-AMDA-70; Android duplicate (dedupe.txt only): DRA262610P0258 / DRA262610P0284 / DRA262610P0326 / DRA262610P0248 |
| TC-277 | Fail | defect | 9. ISS-AMDA-68; 11. ISS-AMDA-70; Android duplicate (dedupe.txt only): DRA262610P0258 / DRA262610P0284 / DRA262610P0289 / DRA262610P0093 |
| TC-406 | Fail | defect | 9. ISS-AMDA-68; 10. ISS-AMDA-69; 11. ISS-AMDA-70; Android duplicate (dedupe.txt only): DRA262610P0258 / DRA262610P0284 / DRA262610P0248 |
| TC-318 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0390 |
| TC-498 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0255 |
| TC-344 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0350 |
| TC-356 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-115 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0354 |
| TC-230 | Fail | defect | 2. ISS-AMDA-61; Android duplicate (dedupe.txt only): DRA262610P0327 / DRA262610P0198 |
| TC-079 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0222 |
| TC-080 | Fail | defect | 2. ISS-AMDA-61; Android duplicate (dedupe.txt only): DRA262610P0274 |
| TC-504 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0273 |
| TC-081 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| TC-405 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0340 / DRA262610P0226 |
| TC-515 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0342 |
| TC-516 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0342 |
| TC-085 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0379 |
| TC-086 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0159 |
| TC-479 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0227 |
| TC-417 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0069 |
| TC-423 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0084 |
| TC-510 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0297 |
| TC-422 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0083 / DRA262610P0276 |
| TC-090 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0083 / DRA262610P0276 |
| TC-492 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0244 |
| TC-507 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0288 |
| TC-438 | Fail | defect | 6. ISS-AMDA-65 |
| TC-481 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0230 |
| TC-144 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0355 |
| TC-540 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0341 |
| TC-145 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0355 |
| TC-307 | Fail | defect | 4. ISS-AMDA-63; Android duplicate (dedupe.txt only): DRA262610P0368 |
| TC-308 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0358 |
| TC-311 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-490 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0240 |
| TC-343 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0360 / DRA262610P0243 / DRA262610P0219 |
| TC-533 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0391 |
| TC-517 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0359 |
| TC-418 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0071 |
| TC-153 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0049 |
| TC-471 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0213 |
| TC-155 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0049 / DRA262610P0348 |
| TC-470 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0211 |
| TC-157 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0341 |
| TC-158 | Fail | question | held: question (PM) |
| TC-159 | Fail | question | held: question (PM) |
| TC-161 | Fail | defect | held: question (PM) |
| TC-164 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0343 |
| TC-168 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0359 |
| TC-169 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-170 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0032 / DRA262610P0302 |
| TC-171 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-172 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-173 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-174 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-415 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0065 |
| TC-503 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0268 |
| TC-234 | Fail | question | held: question (PM) |
| TC-461 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0202 |
| TC-447 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0174 |
| TC-459 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0200 |
| TC-462 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0203 |
| TC-303 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| TC-304 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| O-1 | observation | — | not raised |
| O-2 | observation | — | 3. ISS-AMDA-62 |
| O-3 | observation | — | not raised |
| O-4 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0077 |
| O-5 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0344 |
| O-6 | observation | — | 1. ISS-AMDA-60 |
| O-7 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0123 |
| O-8 | observation | — | not raised |
| O-9 | observation | — | not raised |
| O-10 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0350 |
| O-11 | observation | — | 4. ISS-AMDA-63 |
| O-12 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0159 |
| O-13 | observation | — | not raised |
| O-14 | observation | — | not raised |
| O-15 | observation | — | not raised |
| O-16 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0026 / DRA262610P0344 |
| O-17 | observation | — | 2. ISS-AMDA-61 |
| O-18 | observation | — | not raised |
| O-19 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0343 / DRA262610P0359 |
| O-20 | observation | — | Android duplicate (dedupe.txt only): DRA262610P0093 / DRA262610P0369 / DRA262610P0256 |
| O-21 | observation | — | held: question (PM) |
| O-22 | observation | — | not raised |
| O-23 | observation | — | 8. ISS-AMDA-67 |
| O-24 | observation | — | not raised |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 2, 3, 4, 5, 6, 7, 8, 11 |
| PM | — |
| Doc | 9, 10 |

### Filing order

By severity: **1**, **2**, **6**, **7**, **3**, **4**, **5**, **8**, **9**, **10**, **11**. Nothing is filed until the review page's decisions come back.

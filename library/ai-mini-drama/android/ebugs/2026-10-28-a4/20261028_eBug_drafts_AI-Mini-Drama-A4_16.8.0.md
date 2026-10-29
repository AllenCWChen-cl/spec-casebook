# AI Mini Drama (Android) — eBug drafts, phase A4 (table v3), PDR-A 16.8.0 build 2610212

**Source:** pdr-spec-casebook run `library/ai-mini-drama/android/runs/2026-10-28-a4-full/` — phase A4 of draft `drafts/20261028-164930` (table v3, 486 cases), 2026-10-28 17:38 → 10-29 06:12 on Sony Xperia 10 III (XQ-BT52) / Android 12 through Appium / UiAutomator2, TR261021-0082, Stage server, account 「ethan.hsu.cl」 (Free). Tally: 214 Pass, 129 Blocked, 143 Fail.

**Final (2026-10-29):** all 486 cases recorded (A4-j ran 08:51–09:34 on three fresh installs). A4-j added two Fail rows, TC-303 and TC-304 (no 「Get notified」 pre-prompt on the first video), both the same Android defect as TC-081 → DRA262610P0362 (dedupe.txt only); no new entry.

**Status:** nothing filed, uploaded or commented. Filing defaults from the newest filed batch (`ebug-defaults.ts ai-mini-drama android`: 2026-10-27-a2, Creator ETHAN_HSU, TR261021-0082, [AIAgent], API) are prefilled on the review page for confirmation. Dedupe was read-only, Android pool only (dedupe per OS, user 2026-10-28).

Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (RD, 2026-10-21). Android has no fault switches in 16.8, so failure entries rest on real failures (named in each QA note).

**What is drafted:** 13 new entries (ISS-AMDA-47…59), all proposed for filing. 123 Fail rows repeat an existing Android ticket (104 tickets, the 40 A2 bugs DRA262610P0324–P0363 included) and are left out (dedupe.txt only); 5 rows are held (PM questions, one result conflict).

Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD. Every entry links the spec board or Figma frame it is checked against.

---

## 1. ISS-AMDA-47 — No More ideas chip once the chat has content  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-019  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-017 (PM top mockups) / R-338 (Design: the chip is drawn above the composer on every chat stage). A4-a1 and A1: a chat with the idea, the format answer, the outline and the characters card has no 「More ideas +」 chip, keyboard closed or open; the page source has no such element. No Android or iOS ticket found.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Chat shows no 「More ideas +」 chip once it has content
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea (e.g. A florist and a baker fight over the same corner stall)
5. Tap Send
6. Tap English
7. Tap Yes, include captions
8. Tap Generate
9. Wait for the Story Outline card
10. Tap the chat input
11. Check the result

Result:
No 「More ideas +」 chip is shown above the input once the chat has content, with the keyboard closed or open.
摘要：聊天已有內容後，輸入框上方沒有「More ideas +」chip（鍵盤收起或展開皆無）。
{16.8.0_amda47_no_chip.jpg} {16.8.0_amda47_no_chip_focused.jpg}

Expect Result:
A 「More ideas +」 chip shows above the input once the chat has content; tapping it offers more story ideas.
摘要：聊天有內容後，輸入框上方應顯示「More ideas +」，點擊可提供更多故事點子。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/01_ISS-AMDA-47/`

---

## 2. ISS-AMDA-48 — Credit pill leaves a generating outline with no Leave this chat dialog  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-357, TC-358  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-261 (PM main flow §3.2/§3.3 and PM 10/21 dialog copy; Design 1016_Chat navigation): every top exit while the outline generates shows 「Leave this chat?」. A4-a2 18:04 (and A1 15:34): New chat and History show the dialog, the credit pill opens My Credits at once; the outline still arrives and the chat is saved to History (「Stormbound」). Not DRA262610-0037 (Close — the dialog on an empty chat).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Credit pill leaves a generating outline with no 「Leave this chat?」 dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea (e.g. A lonely lighthouse keeper and a stranded mail pilot)
5. Tap Send
6. Tap Generate
7. Tap the credit pill while 「Thinking…」 shows
8. Tap the system Back button
9. Wait for the Story Outline card
10. Tap ←
11. Tap History
12. Check the result

Result:
While the outline generates, the credit pill opens My Credits with no 「Leave this chat?」; the chat is saved.
摘要：大綱產生中點數膠囊直接開啟 My Credits，無「Leave this chat?」，聊天仍被保存。
{16.8.0_amda48_new_chat_dialog.jpg} {16.8.0_amda48_pill_no_dialog.jpg} {16.8.0_amda48_saved_in_history.jpg}

Expect Result:
The credit pill shows 「Leave this chat?」 like New chat and History; after Leave anyway nothing is saved.
摘要：點數膠囊應與 New chat、History 一樣先詢問「Leave this chat?」，離開後不保存。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, 1016_Chat navigation frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4858-34930
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/02_ISS-AMDA-48/`

---

## 3. ISS-AMDA-49 — A refused idea gets a cut-off I cannot reply  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-031  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-027 (Design extra / PM 09/30): an outline refused for policy shows 「I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way.」 with no button. A4-a2 18:46:43: the turn completed after 4 s (logcat turn_complete final_state=complete, [AI] 「I cannot」) and the chat shows only 「I cannot」. A1 on the same build showed 「Something went wrong…」 + Try again instead, so neither run reached the spec message. The next idea correctly skipped the format card. Related, not duplicate: DRA262610P0228 (NewCreated, asks for the check before the format card).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Policy-refused idea gets a cut-off 「I cannot」 reply, not the terms message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea that violates the content policy (e.g. step-by-step instructions for building a weapon)
5. Tap Send
6. Tap English
7. Tap Yes, include captions
8. Tap Generate
9. Wait 10 seconds
10. Check the result

Result:
After 4 s the chat shows only the cut-off reply 「I cannot」; the terms-of-service message is not shown.
摘要：4 秒後聊天只顯示被截斷的「I cannot」，未顯示服務條款訊息。
{16.8.0_amda49_i_cannot.jpg} {16.8.0_amda49_log.txt}

Expect Result:
The chat shows 「I couldn't write a story from this idea. It may not meet our terms of service…」 with no button.
摘要：應顯示無法依此點子寫故事、可能不符服務條款的訊息，且無按鈕。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Extra board board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/03_ISS-AMDA-49/`

---

## 4. ISS-AMDA-50 — Finish your characters plural subtitle differs from the spec  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-039  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-033 (PM main flow; Design outranks PM: 「Add a look to continue.」). A4-b1 19:00 (and A1, A2): with 2 unset characters the sheet reads 「2 characters aren't set yet」 / 「Each one needs a look before you can continue.」. Related, closed: DRA262610-0061 (Close — 「Finish your characters sheet text and button differ from spec」); its fix changed the one-character sheet only, so the plural text is back as a new entry (closed-ticket rule, user 2026-10-28). The ◆4 price on the same sheet is DRA262610P0327 (not repeated here).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: 「Finish your characters」 plural subtitle differs from the spec
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap ✓ without setting any character
7. Check the result

Result:
With two unset characters the subtitle reads 「Each one needs a look before you can continue.」
摘要：兩個角色未設定時，副標與規格不同（Each one needs a look…）。
{16.8.0_amda50_plural_subtitle.jpg}

Expect Result:
The subtitle reads 「Add a look to continue.」 (Design), as on the one-character sheet.
摘要：副標應為「Add a look to continue.」（Design）。
Spec string: 「N characters aren't set yet」 / 「Add a look to continue.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRA262610-0061 (Close)
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/04_ISS-AMDA-50/`

---

## 5. ISS-AMDA-51 — Generate all with one failed character: singular dialog and no ! in the not-set sheet  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-042, TC-384  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-035 / R-294 (PM update 3). Run on a REAL failure (no fault switch on Android 16.8): Trapped Echoes, Generate all ◆8 for Tessa + Julian 19:13:13; logcat 19:13:45 MiniDramaFail [TextToImage] task_end status=Error error_code=4000 for Tessa. The dialog is the single-character 「Couldn't create image」 / 「We couldn't create this character… Try again later.」 instead of 「Couldn't create some images」; after it, ✓ shows 「1 character isn't set yet」 with Tessa as a plain placeholder (no 「!」) and tapping her does nothing. The refund that kept Tessa's Text to Speech −1 (TC-500) is DRA262610P0257 (RDResolved) and is not repeated here.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Generate all with one failed character shows the single error and no 「!」
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap ✓ without setting any character
7. Tap Generate all
8. Wait until one character fails and the error dialog shows
9. Tap the system Back button
10. Tap ✓
11. Tap the failed character in the sheet
12. Check the result

Result:
1 of 2 failed: the dialog is the single 「Couldn't create image」, and the not-set sheet shows no 「!」 on it.
摘要：兩個中一個失敗時顯示單一角色錯誤，未設定表單中失敗角色沒有「!」。
{16.8.0_amda51_single_error.jpg} {16.8.0_amda51_no_mark.jpg} {16.8.0_amda51_tap_does_nothing.jpg} {16.8.0_amda51_log.txt}

Expect Result:
「Couldn't create some images」 shows; the not-set sheet marks the failed character 「!」 and opens it on tap.
摘要：應顯示「Couldn't create some images」，未設定表單以「!」標示失敗角色並可點擊開啟。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/05_ISS-AMDA-51/`

---

## 6. ISS-AMDA-52 — Ethnicity filter with no match shows a blank grid  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-288  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-154 (QA rule 8, data-driven facets: an empty result is shown clearly), on the Design Characters › Filter board. A4-b2 (and A1): Southeast Asian and Mixed each match 0 looks; the grid shows only the 「Create my character」 tile and blank space, with no 「No characters match」 text or hint to clear the filter. Other values list their looks (White 14+).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character filter with no match shows a blank grid and no empty-state message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap the filter icon
7. Tap Southeast Asian
8. Tap ✓
9. Check the result

Result:
The grid shows only the 「Create my character」 tile and blank space; nothing says no character matches.
摘要：篩選無結果時，只顯示「Create my character」與空白，沒有任何無結果提示。
{16.8.0_amda52_southeast_asian.jpg} {16.8.0_amda52_mixed.jpg}

Expect Result:
An empty result is shown clearly (e.g. a 「No characters match」 message with a way to clear the filter).
摘要：無結果時應清楚顯示空狀態（例如無符合角色的訊息與清除篩選方式）。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/06_ISS-AMDA-52/`

---

## 7. ISS-AMDA-53 — System Back on the Add Media album list closes the whole picker  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-525  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-347 (Design Choose Character · Add Media) / R-353 (REQ-051: system Back closes only the layer on top). A4-c1: Reference › Add Media › 「All ▾」 album list › system Back closes the whole picker back to Create my character (2 of 2); Back on the preview, the sort options and the camera closes only that layer. The album control reads 「All ▾」, not 「Recents ▾」 (Android media picker; recorded, not raised).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the Add Media album list closes the whole picker
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap Create my character
7. Tap the Reference photo box
8. Tap All ▾
9. Tap the system Back button
10. Check the result

Result:
System Back on the album list closes the whole Add Media picker and returns to Create my character.
摘要：在相簿清單按系統返回鍵，整個 Add Media 選擇器被關閉，回到 Create my character。
{16.8.0_amda53_album_list.jpg} {16.8.0_amda53_after_back.jpg}

Expect Result:
System Back closes only the album list and stays on Select Media, as the preview, sort and camera layers do.
摘要：系統返回鍵應只關閉相簿清單，停留在 Select Media。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/07_ISS-AMDA-53/`

---

## 8. ISS-AMDA-54 — System Back on the enlarged character preview closes Choose Character  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-135  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-120 (Design flow arrow 2811-90592) / R-345 / R-352 (REQ-051: system Back on a full-screen viewer does what its ⓧ does). A4-c2: ⓧ closes the preview back to the library, but system Back on the preview closes the whole Choose Character page back to the chat (2/2). Back on the ⋯ menu and from Report is correct. A2 recorded a Pass on another drama, so this may depend on how the library was opened.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the enlarged character preview closes Choose Character
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap the enlarge icon on a character
7. Tap the system Back button
8. Check the result

Result:
System Back on the enlarged preview closes Choose Character and returns to the chat.
摘要：在角色放大預覽按系統返回鍵，整個 Choose Character 關閉回到聊天。
{16.8.0_amda54_preview.jpg} {16.8.0_amda54_after_back.jpg}

Expect Result:
System Back closes only the preview back to the library, like ⓧ.
摘要：系統返回鍵應與 ⓧ 相同，只關閉預覽回到角色庫。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, flow arrow 2811-90592 (R-120) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90592
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 11 (new 10/21) board §13.23 (Android back on the character result) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/08_ISS-AMDA-54/`

---

## 9. ISS-AMDA-55 — Failed scene images in a chat update show no ! and keep their 6 credits  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-293  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-157 (PM update 3 J5). Run on a REAL failure (no fault switch): Corporate rivals, chat update 「Scene 2 and Scene 4 heavy rain」 ◆12, Generate 22:53:41; Wi-Fi off ~22:54:30 over USB (restored right after). logcat: the two Location (env) images succeeded (receipts env_img_1 / env_img_2 completed, ◆3 each, 17717 → 17711); the two main scene keyframes failed (receipts img_1 / img_2 ◆3 each, 17711 → 17705; 22:54:32 MiniDramaFail [TextToImage] generation_failed tti=query_status_failed, [engine] EditImageGPT2 failed for beat_00c62024 and beat_3deb8b06). Charged 12 in all; the 6 of the two failed images should have been refunded, nothing was (still 17705 after reopening, no returned row). Screens: Scene 2's Location image shows the rain (why it looks successful) but its main image is the old one; the chat shows no 「!」, no failure message and no Edit, and Iris replies 「Updated Scene 2 (Their First Loss) and Scene 4 (A United Front) to incorporate heavy rain…」. Reviewer held it 10/29 asking whether the images succeeded; rewritten to this evidence and filed. Related, not duplicate: DRA262610P0311 (outfit edit claims updated visuals but no image is redrawn; no failure or charge), DRA262610P0238 (failed first-time scene image), DRA262610P0308 (storyboard refunds), DRA262610P0123 (offline image failure says busy).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed scene images in a chat update show no 「!」 and keep their 6 credits
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished storyboard
5. Type 「Make Scene 2 and Scene 4 heavy rain」
6. Tap Send
7. Tap Generate on the update card
8. Turn Wi-Fi off while the images are updating
9. Wait 1 minute
10. Turn Wi-Fi on
11. Read Iris's reply in the chat
12. Tap Scene 2 on the Storyboard Result card
13. Tap ✕
14. Read the balance on the credit pill
15. Tap the credit pill
16. Tap Details
17. Check the result

Result:
Both main scene images fail (log) while Location images update; chat claims success, no 「!」 or Edit; 6 credits kept.
摘要：地點圖已更新但兩張場景主圖失敗；聊天宣稱成功、無「!」與訊息，6 點未退。
{16.8.0_amda55_success_claim.jpg} {16.8.0_amda55_no_message.jpg} {16.8.0_amda55_old_image.jpg} {16.8.0_amda55_log.txt}

Expect Result:
Failed images show 「!」 and 「…image couldn't be updated. Your credits have been refunded…」 with Edit; 6 refunded.
摘要：失敗圖片應標示「!」並顯示退款訊息與 Edit，6 點應退回。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board J5 - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/09_ISS-AMDA-55/`

---

## 10. ISS-AMDA-56 — System Back in History Manage mode leaves History  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-112  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-097 (PM update 4) / R-355 (REQ-051: system Back leaves Manage mode like Cancel). A4-e: Select All, Delete dialog and Back on the dialog (like Cancel) are correct; system Back in Manage mode leaves History altogether to the chat (2/2), while Cancel exits Manage mode. A2 recorded a Pass (History opened from the landing); in A4 History was opened from a chat.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back in History Manage mode leaves History instead of exiting Manage
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Tap History
5. Tap Manage
6. Tap Select All
7. Tap the system Back button
8. Check the result

Result:
System Back in Manage mode closes History and returns to the chat.
摘要：在 History 的 Manage 模式按系統返回鍵，直接離開 History 回到聊天。
{16.8.0_amda56_manage_mode.jpg} {16.8.0_amda56_after_back.jpg}

Expect Result:
System Back leaves Manage mode like Cancel and stays in History.
摘要：系統返回鍵應與 Cancel 相同，只退出 Manage 模式並停留在 History。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/10_ISS-AMDA-56/`

---

## 11. ISS-AMDA-57 — Asking Iris to change the title does not rename the drama  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-318  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-177 (PM update 4 Bug 0014: the History name follows title changes) / R-309 (REQ-022 leads #46, #47). A4-e: The Understudy (never renamed, characters stage): 「Change the story title to Opening Night」 → 「Changing the title to Opening Night.」 then 「…is handled at the outline stage…」 + Create storyboard ◆31; History still shows 「The Understudy」, also after reopening. A2 passed the same row on Storm Harbor (title updated). Related, not duplicate: DRA262610P0255 (a user-given title replaced by an AI title).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Asking Iris to change the story title does not rename the drama in History
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create the storyboard?」 that was never renamed
5. Type 「Change the story title to Opening Night」
6. Tap Send
7. Wait for the reply
8. Tap History
9. Check the result

Result:
Iris says it is changing the title, then that the title is handled at the outline stage; History keeps the old title.
摘要：Iris 回覆正在更改標題，之後又說標題在大綱階段處理；History 仍為舊標題。
{16.8.0_amda57_reply.jpg} {16.8.0_amda57_history.jpg}

Expect Result:
The drama is renamed and History shows the new title.
摘要：劇名應更新，History 顯示新標題。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board Bug 0014 - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/11_ISS-AMDA-57/`

---

## 12. ISS-AMDA-58 — System Back on the export sheet also closes the result page  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-533  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-352 / R-356 (REQ-051: system Back on the export sheet closes only the sheet; PM Figma 10/22 export states 4418:2). A4-g3 Romance (2): system Back on the export sheet closes the sheet AND the result page, back to the chat (2/2); on the done page Back also goes to the chat. The sheet itself is DRA262610P0219 / P0243 (not repeated).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the Export Full Video sheet also closes the result page
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Tap Play drama
6. Tap Export Full Video
7. Tap the system Back button
8. Check the result

Result:
System Back on the export sheet closes the sheet and the result page and returns to the chat; nothing is exported.
摘要：在匯出表單按系統返回鍵，表單與結果頁一起關閉並回到聊天。
{16.8.0_amda58_export_sheet.jpg} {16.8.0_amda58_after_back.jpg}

Expect Result:
System Back closes only the export sheet and stays on the result page.
摘要：系統返回鍵應只關閉匯出表單，停留在結果頁。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update (Export Full Video states) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/12_ISS-AMDA-58/`

---

## 13. ISS-AMDA-59 — Stop during the cast confirmation shows Something went wrong  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-154  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-138 (QA rule 2: a Stop says what stops and whether spent credits are lost). A4-h Echoes of the Deep: Thomas / Elena picked, ✓ 04:14:10, ■ Stop at +15 s during 「Thinking…」: no warning; logcat cancel_turn → turn_complete final_state=cancelled, yet the chat shows 「Something went wrong on my end. Let's try that again.」 + Try again as if the app had failed. Nothing charged. Run in the cast-confirm stage (no character generation was running). iOS ticket DRI261895P0024 is iOS only, not a duplicate.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Stopping the cast confirmation shows 「Something went wrong on my end」
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」 with two unset characters
5. Tap the first character slot
6. Tap a library look
7. Tap the second character slot
8. Tap a library look
9. Tap ✓
10. Tap ■ Stop while 「Thinking…」 shows
11. Check the result

Result:
Stop cancels with no warning, and the chat shows 「Something went wrong on my end. Let's try that again.」
摘要：停止時無警告，聊天卻顯示錯誤「Something went wrong on my end」。
{16.8.0_amda59_thinking.jpg} {16.8.0_amda59_error_after_stop.jpg} {16.8.0_amda59_log.txt}

Expect Result:
Stop says what will stop and whether spent credits are lost, then shows the stage as stopped, not as an error.
摘要：停止時應說明會停止什麼及已用點數是否損失，並顯示已停止而非錯誤。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0_images/13_ISS-AMDA-59/`

---

## Held — PM questions and items not drafted

| Item | Kind | Why held / what to decide |
|---|---|---|
| TC-103 | question (PM) | After swapping a look while the Create storyboard card is offered, no 「Characters updated! Regenerate the storyboard to match?」 appears (A2 passed it with a storyboard already made). The spec draws the prompt, but Android ticket DRA262610P0299 ([UX], PM, NewCreated) asks that a swapped actor keep the card with no new assistant turn, which is what 2610212 now does. PM to say which applies before the storyboard exists. |
| TC-265 | question (PM) | Family & Life template 2 is named 「Proposal Across Lifetimes」 on the Android Stage CMS, not 「Proposal Across Every Lifetime」 (spec, table, iOS runs, A2). Intended rename? |
| TC-158 | question (PM) | An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row (held in A2 too). |
| TC-467 | question (PM) | Exported captions of The New Guy's Secret are all dialogue (no narration line), one size; the spec gives no caption size (held in A2 too). |
| TC-289 | recheck (result conflict) | TC-289 records no 「White」 in the Ethnicity filter (screenshot shows only the first three chips of a row that scrolls sideways), while TC-288 in the same run found White with 14+ looks. Not drafted; if White is really missing it matches DRA262610-0019 (Close), which would make it a closed-ticket-is-back entry. A4-j did not reach it; recheck in the next round. |

## Not raised (observations from the segment logs, for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| Buy More | My Credits › Buy More shows the raw 「Get %1$s Credits for %2$s」 with empty packs (logcat getProductDetails null) (A4-a2) | Sideloaded TR APK with no Play billing product details on this phone; recheck on a Play-installed build before raising. |
| Claim popup | Daily Claim popup reads 「-- free credits」 (A4-a2) | Matches the old Credit System behaviour DRA242407-0017 (ProposeNAB, 「Credits shows -- …」); not an AI Mini Drama finding. |
| Update characters ◆4 | Update characters made a new Malik look but the cast kept the old one (A4-b1) | Single sighting with no frame of the cast after it; recheck. |
| More than one person | 「More than one person detected」 dialog on a group reference photo (A4-c2) | Expected guard (TC-366 context), recorded only. |
| Stage ① pause | Leaving AI Mini Drama during video stage ① or a storyboard pauses the job until the chat is reopened (A4-g3, A4-h) | Same as DRA262610P0026 (NewCreated, PM) and DRA262610P0344 (filed A2): Android duplicates. |
| Storyboard failure | Real storyboard failure (Gemini UNAVAILABLE, 01:12:56) showed no error or Try again in chat; nothing charged (A4-g2) | Same as DRA262610P0234 / P0100 family (Android tickets on silent generation failures); one sighting, no case row failed on it. |
| Blocked (129) | 36 observability, 93 test-data | No verdict (reasons grouped on the plan page; run folder blocked-reasons.json). |

## Reconciliation against the run

143 Fail (138 defect, 5 question), 129 Blocked, 0 Not run, 6 observations from the segment Log lines (the run has no observations.md).

| Step | Count | Running total |
|---|---|---|
| Fail rows + observations | 149 | 149 |
| → matches an existing Android ticket only (dedupe.txt, not listed) | −123 | 26 |
| → held (PM question, result conflict) | −5 | 21 |
| → not raised | −6 | 15 |
| → merged: 15 rows share 13 defects | −2 | **13 entries** |

### Row-by-row map

| Item | Result | Disposition | Became |
|---|---|---|---|
| TC-014 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0324 |
| TC-015 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-016 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-017 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0127 (Cancelled) |
| TC-019 | Fail | defect | 1. ISS-AMDA-47 |
| TC-414 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0063 |
| TC-468 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0209 |
| TC-488 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0237 |
| TC-024 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0325 |
| TC-448 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0178 |
| TC-497 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0254 |
| TC-508 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0290 |
| TC-452 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0184 |
| TC-357 | Fail | defect | 2. ISS-AMDA-48 |
| TC-358 | Fail | defect | 2. ISS-AMDA-48 |
| TC-031 | Fail | defect | 3. ISS-AMDA-49 |
| TC-480 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0229 |
| TC-036 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0326 |
| TC-410 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0045 |
| TC-039 | Fail | defect | 4. ISS-AMDA-50; Android duplicate (dedupe.txt only): DRA262610P0327 |
| TC-040 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0327 |
| TC-042 | Fail | defect | 5. ISS-AMDA-51 |
| TC-384 | Fail | defect | 5. ISS-AMDA-51 |
| TC-500 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0257 |
| TC-044 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0174 |
| TC-477 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0224 |
| TC-487 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0236 |
| TC-045 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0328 |
| TC-121 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0329 |
| TC-527 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0329 |
| TC-288 | Fail | defect | 6. ISS-AMDA-52 |
| TC-337 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0330 |
| TC-348 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0331 |
| TC-349 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0333 |
| TC-350 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0328 |
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
| TC-525 | Fail | defect | 7. ISS-AMDA-53 |
| TC-408 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0024 |
| TC-134 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0337 / DRA262610P0262 |
| TC-135 | Fail | defect | 8. ISS-AMDA-54 |
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
| TC-514 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0344 |
| TC-063 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-070 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-072 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0198 |
| TC-385 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0134 |
| TC-073 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0134 / DRA262610P0199 |
| TC-458 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0199 |
| TC-074 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0199 / DRA262610P0027 |
| TC-443 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0169 |
| TC-282 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0050 |
| TC-293 | Fail | defect | 9. ISS-AMDA-55 |
| TC-294 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0077 |
| TC-374 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0349 |
| TC-419 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0072 |
| TC-101 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-102 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-103 | Fail | defect | held: question (PM) |
| TC-106 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0352 / DRA262610-0063 |
| TC-108 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0047 |
| TC-111 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0046 |
| TC-112 | Fail | defect | 10. ISS-AMDA-56 |
| TC-113 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0346 / DRA262610P0347 |
| TC-318 | Fail | defect | 11. ISS-AMDA-57 |
| TC-344 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0350 |
| TC-115 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0354 |
| TC-079 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0222 |
| TC-080 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0274 |
| TC-504 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0273 |
| TC-081 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| TC-405 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0340 / DRA262610P0226 |
| TC-515 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0342 |
| TC-516 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0342 |
| TC-086 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0159 |
| TC-479 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0227 |
| TC-417 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0069 |
| TC-423 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0084 |
| TC-506 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0286 |
| TC-510 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0297 |
| TC-422 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0083 / DRA262610P0276 |
| TC-090 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0083 / DRA262610P0276 |
| TC-467 | Fail | question | held: question (PM) |
| TC-492 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0244 |
| TC-507 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0288 |
| TC-436 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0156 / DRA262610P0154 |
| TC-481 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0230 |
| TC-307 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0368 |
| TC-308 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0358 |
| TC-311 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0351 |
| TC-490 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0240 |
| TC-343 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0360 / DRA262610P0243 / DRA262610P0219 |
| TC-533 | Fail | defect | 12. ISS-AMDA-58 |
| TC-517 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0359 |
| TC-418 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0071 |
| TC-153 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0049 |
| TC-471 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0213 |
| TC-154 | Fail | defect | 13. ISS-AMDA-59 |
| TC-155 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0049 / DRA262610P0348 |
| TC-156 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0057 |
| TC-470 | Fail | question | Android duplicate (dedupe.txt only): DRA262610P0211 |
| TC-157 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0341 |
| TC-158 | Fail | question | held: question (PM) |
| TC-163 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0348 |
| TC-169 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-170 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610-0032 / DRA262610P0302 |
| TC-171 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-172 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-173 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0361 |
| TC-415 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0065 |
| TC-503 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0268 |
| TC-461 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0202 |
| TC-265 | Fail | question | held: question (PM) |
| TC-447 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0174 |
| TC-459 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0200 |
| TC-462 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0203 |
| TC-303 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| TC-304 | Fail | defect | Android duplicate (dedupe.txt only): DRA262610P0362 |
| Buy More | observation | — | not raised |
| Claim popup | observation | — | not raised |
| Update characters ◆4 | observation | — | not raised |
| More than one person | observation | — | not raised |
| Stage ① pause | observation | — | not raised |
| Storyboard failure | observation | — | not raised |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 |
| PM | — |
| Doc | — |

### Filing order

By severity: **9**, **1**, **2**, **3**, **4**, **5**, **6**, **7**, **8**, **10**, **11**, **12**, **13**. Nothing is filed until the review page's decisions come back.

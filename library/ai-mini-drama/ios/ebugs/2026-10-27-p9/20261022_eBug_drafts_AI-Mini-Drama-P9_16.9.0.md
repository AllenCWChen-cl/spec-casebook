# AI Mini Drama (iOS) — eBug drafts, run P9 (full table), PDR-I 16.9.0 build 189872

**Source:** pdr-spec-casebook run `library/ai-mini-drama/ios/runs/2026-10-22-p9-full/` — the 392 cases of draft `drafts/20261022-145212/draft.csv` (requirements.md there), run 2026-10-22 15:33 → 2026-10-23 10:00 on iPhone 17 Air / iOS 26.2.1 through Appium/WebDriverAgent, TestFlight build 16.9.0 (189872), TR261022-0031, Developer Server, Pro+. Result: 180 Pass, 84 Fail, 128 Blocked. Off-case observations O-1…O-41: `runs/2026-10-22-p9-full/observations.md`. RD Note of TR261022-0031: `runs/2026-10-22-p9-full/rd-note-TR261022-0031.txt`, mapped in `build-notes.md`. Spec set `specs/2026-10-21-2` (PM Spec 20261021, Design Spec + Figma 1016 frames).

**Filed by:** ETHAN_HSU on 2026-10-27 via API on TR261022-0031 (16.9.0 build 189872) — ISS-AMD-50 DRI261898P0001, ISS-AMD-51 DRI261898P0002, ISS-AMD-52 DRI261898P0003, ISS-AMD-55 DRI261898P0004, ISS-AMD-56 DRI261898P0005, ISS-AMD-57 DRI261898P0006, ISS-AMD-58 DRI261898P0007, ISS-AMD-59 DRI261898P0008, ISS-AMD-61 DRI261898P0009, ISS-AMD-62 DRI261898P0010, ISS-AMD-63 DRI261898P0011, ISS-AMD-64 DRI261898P0012, ISS-AMD-65 DRI261898P0013, ISS-AMD-66 DRI261898P0014, ISS-AMD-67 DRI261898P0015, ISS-AMD-68 DRI261898P0016, ISS-AMD-69 DRI261898P0017, ISS-AMD-70 DRI261898P0018, ISS-AMD-72 DRI261898P0019, ISS-AMD-73 DRI261898P0020. Decisions: `decisions.md` (F-4, F-5, F-11, F-22 held as duplicates; no existing ticket touched). Review page: `20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html`.

Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the log excerpt where a log shows the cause and on every failure-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD. Existing tickets that still reproduce are Rechecks for information only (no comments, team rule 2026-10-21). Missing refunds have their own entries (rule 8). Pink fault switches are named where used; every entry reproduced with every switch Off unless its note says otherwise.

**What is drafted:** 24 entries — the defects with no open ticket of their own, plus two that the brief and rule 8 ask to draft even though a ticket exists (ISS-AMD-71 storage upload = DRI261897P0006, ISS-AMD-53 character refunds = DRI261897P0016); those two start on hold as duplicates, as do ISS-AMD-54 (DRI261895P0024) and ISS-AMD-60 (DRI261896P0048) after the dedupe. Entries are numbered roughly in run order; trust the ISS-ID over the number.

Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec). Every entry links the spec board or Figma frame it is checked against.

---

## 1. ISS-AMD-50 — Credit pill leaves a generating chat with no leave dialog  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-357, TC-358, TC-359  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-261/R-262 (Design 1016_Chat navigation 4858:34930, PM main flow §3.2/§3.3; REQ-029): while the outline or a short job generates, every top exit (Back, History, New chat, credit pill) asks first. On 189872 Back, History and New chat ask; the credit pill never does. TC-357: outline generating, New chat → 「Leave this chat?」 (correct); credit pill at 16:00:18 and 16:01:35 → My Credits at once, twice. TC-358: credit pill 16:03:08 → My Credits, no dialog, so no Leave anyway; the outline kept running behind My Credits (turn end 16:03:42 ok) and History lists 「Reading the Tide」, which should have been discarded. TC-359: storyboard generating on Bound Pages 00:08:05 → My Credits at once; History and New chat both showed 「Stop and lose your credits?」. All Pink fault switches Off. No log line for the guard (the pill is client navigation). Not the same as DRI261894P0049 (Back vs History icon) or DRI261896P0048 (Back during storyboard).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Credit pill opens My Credits mid-generation with no leave dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea (e.g. A night-shift baker and a lost delivery cyclist save a bakery)
5. Tap Send
6. Tap English
7. Tap Yes, include captions
8. Tap Generate
9. Tap the credit pill while 「Thinking…」 is shown
10. Check the result

Result:
The credit pill opens My Credits at once with no Leave this chat? dialog; the outline keeps generating and is saved.
摘要：大綱生成中點擊點數膠囊直接開啟我的點數，未顯示「Leave this chat?」，大綱在背景繼續生成並被儲存。
{16.9.0_amd50_newchat_asks.jpg} {16.9.0_amd50_pill_no_dialog.jpg} {16.9.0_amd50_saved_anyway.jpg} {16.9.0_amd50_storyboard_pill.jpg}

Expect Result:
Like Back and New chat, the credit pill first asks 「Leave this chat?」 (storyboard: 「Stop and lose your credits?」).
摘要：點數膠囊應與返回、新聊天一致，先顯示離開確認對話框。
Spec string: 「Leave this chat?」 / 「Your story outline isn't ready yet, so this chat won't be saved.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1016_Chat navigation frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4858-34930
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/01_ISS-AMD-50/`

---

## 2. ISS-AMD-51 — Iris replies show locale codes such as ja_JP and en_US  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** O-4, TC-187, TC-212  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** Rule 7 (on-screen text). O-4 (P9-a2, TC-207): The Ring He Worked For in Japanese — 「I have completed the storyboard script based on your beat plan in Japanese (ja_JP)…」. TC-212 (P9-b2): 「…video language is set to English (en_US) with captions enabled…」. TC-187 (P9-d2): 「I have translated all script and storyboard content into Japanese (ja_JP)…」. The user picked 「English」/「Japanese」 on the format card; the internal locale code leaks into the reply. No log needed (reply text). All fault switches Off.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Iris replies show internal locale codes like ja_JP and en_US
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea
5. Tap Send
6. Tap Japanese
7. Tap Yes, include captions
8. Tap Generate
9. Read Iris's replies
10. Check the result

Result:
Iris's replies name the video language by its locale code, e.g. 「in Japanese (ja_JP)」 and 「English (en_US)」.
摘要：Iris 回覆中顯示語系代碼，例如「Japanese (ja_JP)」、「English (en_US)」。
{16.9.0_amd51_ja_JP.jpg} {16.9.0_amd51_en_US.jpg} {16.9.0_amd51_translate_reply.jpg}

Expect Result:
Replies name the language as the format card does (English, Japanese) with no locale code.
摘要：回覆應以格式卡上的語言名稱（English、Japanese）稱呼，不顯示語系代碼。

[AI Recommendation]
I have completed the storyboard script in Japanese.
Video language is set to English with captions on.

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, AI Mini Drama home page / Custom detail / Chat room detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/02_ISS-AMD-51/`

---

## 3. ISS-AMD-52 — Partial character failure uses the single-failure dialog  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-042, TC-384, TC-353  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-035 / R-294 (PM Update board 3): when some characters fail, 「Couldn't create some images」/「N characters couldn't be created. Your credits have been refunded. Tap a character to try again.」, failed slots keep 「!」. (1) All Pink fault switches Off, Borrowed Rain Generate all ◆8 16:54:50: Leo failed (TextToImage NSURLErrorDomain -1001 16:56:33), Clara made → 「Couldn't create image」/「We couldn't create this character and your credits have been refunded. Try again later.」 (the single-character copy) with Leo's red 「!」 on the sheet; Got it opened Choose for Leo (no frame of the sheet in this run; text recorded at 16:57). (2) Pink › [z] AI Mini Drama › Trip image moderation ON 17:08–17:39: both failed (serverFailed 4000) → the same single copy for two characters (TC-042-result); after Got it neither slot carries 「!」 in Choose Character or in 「2 characters aren't set yet」 (TC-384). (3) TC-353 chat 「Update characters」 for two (Trip image moderation ON, but the failure was a real storage PUT error, no injection line): Julian updated, Clara failed, the turn ended as a whole failure 「Something went wrong on my end.」 and Clara's slot has no 「!」. The copy defect reproduced with every switch Off (1); the lost 「!」 was seen only with Trip image moderation ON — re-check it Off before filing that part. Refund is ISS-AMD-53. Related DRI261896P0042 (no error / ! on failure: partly fixed, the dialog and ! now show).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Partial character failure shows the single-character error dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create your characters?」 with two unset characters
5. Tap the first character's slot
6. Tap ✓
7. Tap Generate all
8. Wait until one character fails and the other is created
9. Check the result

Result:
With one of two characters failed, the sheet shows 「Couldn't create image」/「We couldn't create this character…」.
摘要：兩位角色中一位失敗時，顯示單一角色失敗文案「Couldn't create image」，而非部分失敗文案。
{16.9.0_amd52_single_copy.jpg} {16.9.0_amd52_after_gotit.jpg} {16.9.0_amd52_no_mark.jpg} {16.9.0_amd52_update_whole_failure.jpg} {16.9.0_amd52_log.txt}

Expect Result:
A partial failure shows 「Couldn't create some images」 with the number of failed characters, failed slots marked !.
摘要：部分失敗應顯示「Couldn't create some images」與失敗角色數，失敗角色保留「!」標示。
Spec string: 「Couldn't create some images」 / 「N characters couldn't be created. Your credits have been refunded. Tap a character to try again.」

[AI Recommendation]
Title: Couldn't create some images
Body: 1 character couldn't be created. Your credits have been refunded. Tap a character to try again.
Button: Got it

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/03_ISS-AMD-52/`

---

## 4. ISS-AMD-53 — Failed character generations keep their credits with no refund  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-042, TC-043, TC-353, TC-329, O-15  ·  **Reproduce:** 6/6  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** Rule 8 refund check, matched by time and amount in Credit Details (shared account; other devices' rows excluded). All with every Pink fault switch Off unless named. (1) TC-042/TC-043, Borrowed Rain Generate all ◆8 16:54: Leo failed (-1001 timeout), Clara made; ledger 16:56 TTI −3, TTS −1, TTI −3, TTS −1 (= −8), no 「Generation failed, credits returned」 row — expected −4 net for the one character delivered; the dialog says 「your credits have been refunded」. (2) TC-042 with Trip image moderation ON 17:11: images refunded (+3 ×2 at 17:12) but both TTS −1 kept. (3) TC-353 Update characters ◆8 20:58 (Trip ON, real storage PUT failure on Clara 21:04:20): ledger 21:04 TTS −1 kept for the failed Clara. (4) TC-329 regenerate all three 03:40 (Off): Leo failed (character-edit storage PUT 03:46:41), his TTS −1 kept, no refund row. (5) O-15 Create my character with a reference photo (Off), 22:25 and 22:54: 「…your credits have been refunded.」 but TTS −1 kept each time (Gemini UNAVAILABLE after the TTS step was allowed). One mechanism: per-tool charges booked inside a turn that then fails are not returned. Duplicate candidate: DRI261897P0016 (Failed character and video generations keep their charged credits with no refund — Propose Wont Fix, filed on 189729); still reproduces on 189872. Raised per rule 8 (own entry for every missing refund).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character generations keep their charged credits with no refund
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create your characters?」 with two unset characters
5. Read the balance on the credit pill
6. Tap the first character's slot
7. Tap ✓
8. Tap Generate all
9. Wait until 「Couldn't create image」 appears
10. Tap Got it
11. Tap Close
12. Tap Back until the Launcher is shown
13. Tap Mine
14. Tap Credits
15. Tap Details
16. Check the result

Result:
A failed character keeps its −1 / −3 rows and no refund row is added, though the dialog says credits were refunded.
摘要：角色生成失敗後仍保留 −1/−3 扣點，無退點紀錄，但對話框顯示已退點。
{16.9.0_amd53_gotit.jpg} {16.9.0_amd53_ledger_1656.jpg} {16.9.0_amd53_ledger_2104.jpg} {16.9.0_amd53_cmc_says_refunded.jpg} {16.9.0_amd53_log.txt}

Expect Result:
A failed character costs nothing: its charges come back as 「Generation failed, credits returned」 rows.
摘要：失敗的角色不應扣點，應出現「Generation failed, credits returned」退點紀錄。
Spec string: 「We couldn't create this character. Your credits have been refunded. Try again.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Error Handling board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261897P0016 (same refund defect, filed on 189729), DRI261896P0042 (failure notice)
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/04_ISS-AMD-53/`

---

## 5. ISS-AMD-54 — Character generation has no Cancel and no time hint (PM 10/16)  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-041, TC-337, TC-332, TC-333, TC-334, TC-383  ·  **Reproduce:** 6/6  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** PM-only rows (PM Update board 9, 10/16; no Design frame yet): R-247 Finish your characters while generating shows 「Creating N characters...」 and 「This usually takes about 1 minute.」, X and 「Cancel」 ask 「Stop and lose your credits?」; R-245/R-291 Create my character while generating shows 「This usually takes about 1 minute.」 under the chips, X stays enabled, 「Cancel」 under the Generating button, and a tap outside the sheet asks like X. On 189872: Finish your characters (TC-041 16:54, TC-337 21:37, all switches Off) keeps 「2 characters aren't set yet」/「Add a look to continue.」 with grey slots and a disabled 「Generating」 spinner; no Creating line, no time hint, no Cancel; X does nothing. Create my character (TC-332…TC-334, TC-383, 23:18–23:22): blank placeholder, chips and a disabled 「Generating ◌」; no time hint, no Cancel, X dimmed, outside tap and swipe do nothing; the result took ~4 min. So 「Stop and lose your credits?」 cannot be reached during any character generation. Also TC-041: the ready state reads 「Take a look, then confirm to continue.」 (PM: 「Tap Confirm to continue.」). Duplicate candidate: DRI261895P0024 (Character generation has no usable Stop action or cancellation warning — QA Propose Wont Fix, filed before the PM 10/16 update that specifies Cancel); TC-154/TC-161 are its rechecks.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Character generation shows no Cancel or time hint and cannot be stopped
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create your characters?」 with two unset characters
5. Tap the first character's slot
6. Tap ✓
7. Tap Generate all
8. Look at the sheet while it generates
9. Tap X
10. Check the result

Result:
While characters generate the sheet shows only a disabled Generating button: no progress line, time hint or Cancel.
摘要：角色生成中只有停用的 Generating 按鈕，沒有「Creating…」、時間提示與 Cancel，X 也無作用。
{16.9.0_amd54_finish_generating.jpg} {16.9.0_amd54_finish_generating2.jpg} {16.9.0_amd54_cmc_generating.jpg} {16.9.0_amd54_cmc_outside_tap.jpg}

Expect Result:
It shows 「Creating 2 characters...」, 「This usually takes about 1 minute.」 and Cancel; X and Cancel ask to stop.
摘要：應顯示生成進度、約 1 分鐘的時間提示與 Cancel；X 與 Cancel 應詢問是否停止。
Spec string: 「This usually takes about 1 minute.」 / 「Stop and lose your credits?」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 9 (new 10/21) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261895P0024 (no usable Stop during character generation; QA Propose Wont Fix)
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/05_ISS-AMD-54/`

---

## 6. ISS-AMD-55 — Confirming the cast charges character credits with no offer card  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-044, O-36  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-037 (PM Chat result states): with every character set, Iris says 「The characters look great! Ready to create the storyboard?」 with a priced Create storyboard card; every charge goes through an offer (MX). TC-044 (P9-b1, all switches Off): Borrowed Rain, cast set, Done ✓ 17:18 → no storyboard offer; instead 「Continuing character portrait generation.」, a re-written outline card and at 17:25 「Something went wrong on my end.」; Try again 17:28 failed again at 17:37. The pill dropped 19034 → 19000 → 18996 and the ledger booked a run of Text to Image −3 plus Text to Speech −1 (= −34) at 17:22–17:25 and −3/−1 at 17:35, with no offer, no Generate tap and no refund; the phone log has no Permission authorize line for those charges (excerpt: the turn begins and fails, nothing authorized). O-36 (video gate, 05:25): 綴じられた秘密's video card showed ◆131 — log 'authorize tools=[RefToVideox2,TextToImagex3,TextToSpeechx2] credit=131': the pending 「Update characters」 work was folded into the video price without saying so; the video failed and −1/−3 stayed booked (refund: ISS-AMD-63). The turn failures themselves are the storage upload of ISS-AMD-71.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Confirming the cast charges character portraits with no offer card, then fails
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set
5. Read the balance on the credit pill
6. Tap a character slot
7. Tap ✓
8. Wait for Iris's reply
9. Tap Back until the Launcher is shown
10. Tap Mine
11. Tap Credits
12. Tap Details
13. Check the result

Result:
Confirming the cast books −34 credits of Text to Image/Speech with no offer card, then ends in Something went wrong.
摘要：確認角色後未出現報價卡即扣除 34 點（文字轉圖片/語音），之後顯示「Something went wrong」。
{16.9.0_amd55_after_done.jpg} {16.9.0_amd55_failed.jpg} {16.9.0_amd55_ledger.jpg} {16.9.0_amd55_video_131.jpg} {16.9.0_amd55_log.txt}

Expect Result:
Confirming the cast offers 「Create storyboard」 with its price; nothing is charged until Generate is tapped.
摘要：確認角色後應出現附價格的「Create storyboard」卡，點 Generate 前不應扣點。
Spec string: 「The characters look great! Ready to create the storyboard?」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/06_ISS-AMD-55/`

---

## 7. ISS-AMD-56 — Iris posts a Generate with AI bubble the user never sent and claims a storyboard that does not exist  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** O-9, O-11, O-30, O-37  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** Seen in four dramas, all switches Off. O-9 (P9-b1 16:59): after leaving Choose Character the chat ends in a user bubble 「Generate with AI」 the user never typed. O-11 (Keeper's Light 21:39): Confirm on 「Your characters are ready」 → 「…2 characters still have no portrait…」, a 「Generate with AI」 user bubble, then 「Something went wrong」 after 423 s. O-37 (Dawn Bread 06:22): Confirm → the phantom 「Generate with AI」 bubble, 「I have created the complete 6-beat storyboard for 'Dawn Bread'…」 and 「Advancing the mini drama production.」 for 387 s, then nothing (card=none, character-sync storage PUT failed 06:28:08); later 「The full 6-beat storyboard … has been created」 again before the ◆28 offer. O-30 / TC-103 / TC-208: the same false 「I have created the complete 6-beat storyboard…」 line before any storyboard exists. The log shows the bubble is the app's own 'trigger=leave' turn rendered as a user message. Related DRI261894P0013 (asks to regenerate a storyboard that doesn't exist yet — NotReproducible) and DRI261894P0024.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Chat shows an unsent Generate with AI message and claims an uncreated storyboard
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create your characters?」 with two unset characters
5. Tap the first character's slot
6. Tap ✓
7. Tap Generate all
8. Wait for 「Your characters are ready」
9. Tap Confirm
10. Read the new chat messages
11. Check the result

Result:
A 「Generate with AI」 bubble the user never sent appears, and Iris says the storyboard is created; none exists.
摘要：聊天出現使用者未輸入的「Generate with AI」訊息，且 Iris 稱分鏡已完成，但實際尚未產生。
{16.9.0_amd56_phantom_bubble.jpg} {16.9.0_amd56_keeper.jpg} {16.9.0_amd56_after_leave.jpg} {16.9.0_amd56_log.txt}

Expect Result:
Only the user's own messages appear as user bubbles, and Iris offers Create storyboard instead of claiming it exists.
摘要：只顯示使用者自己送出的訊息；Iris 應提供 Create storyboard，而非宣稱分鏡已完成。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/07_ISS-AMD-56/`

---

## 8. ISS-AMD-57 — Chat character change: one option chip, non-spec copy and no updated-cast messages  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-348, TC-349, TC-352, TC-103  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-254 / R-090 (PM Update board 7, 10/16): 「Sure! Which character would you like to change?」 with 2–4 chips; after Generate 「Working on it...」, then 「Here's your updated cast.」 and 「Your characters' looks are updated! Ready to create the storyboard?」; after a cast change 「Characters updated! Regenerate the storyboard to match?」. On 189872 (all Off; TC-348 20:39 and 20:48): 「Which character would you like to make look older?」 with ONE chip (Clara) and 「More ideas +」 — Julian never offered; tapping the chip removes the question line too. TC-349: Generate shows 「Thinking…」 then 「Advancing drama production to the next stage.」, never 「Working on it...」, and ends with 「The characters look great! Ready to create the storyboard?」 (no 「Here's your updated cast.」); Clara still looks the same (not visibly older). TC-352 (Art of Falling after a storyboard): ends with 「Characters updated! Regenerate the storyboard to match?」 instead of 「Your characters' looks are updated!…」. TC-103 (The Gambit, cast changed at the storyboard offer): Iris repeats 「The characters look great!…」. The chat replies come from the Iris engine on the device, so RD owns them. Related DRI261896P0054 (wrong prompt after a cast change following a storyboard).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Character change in chat offers one chip and skips the update messages
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose two characters are set
5. Type 「Can you change one of the characters to look older?」
6. Tap Send
7. Read Iris's question and chips
8. Tap the chip
9. Tap Generate on 「Update characters」
10. Read Iris's messages
11. Check the result

Result:
Iris asks 「Which character would you like to make look older?」 with one chip and never says 「Here's your updated cast.」
摘要：Iris 只提供一個角色選項，文案與規格不同，更新後也沒有「Here's your updated cast.」等訊息。
{16.9.0_amd57_one_chip.jpg} {16.9.0_amd57_no_working.jpg} {16.9.0_amd57_closing_line.jpg} {16.9.0_amd57_after_storyboard.jpg}

Expect Result:
Iris asks 「Sure! Which character would you like to change?」 with a chip per character, then the spec's update messages.
摘要：Iris 應以規格文案詢問並為每位角色提供選項，更新後顯示規格中的進度與完成訊息。
Spec string: 「Sure! Which character would you like to change?」 / 「Working on it...」 / 「Here's your updated cast.」 / 「Your characters' looks are updated! Ready to create the storyboard?」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/08_ISS-AMD-57/`

---

## 9. ISS-AMD-58 — Typed character name is not taken as the answer to Iris's question  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-391  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-301 (PM Update board 7, 10/16): when Iris asks which character to change, the user can type the answer instead of tapping a chip and gets the 「Update characters」 card. TC-391 (Window Notes 20:48, all Off): asked again 「Can you change one of the characters to look older?」 → 「Which character would you like to make look older?」 with one chip 「Clara (Nurse)」; typed 「Julian」 and sent → after 29 s 「Preserved the cast profile for Julian…」 and 「The characters look great! Ready to create the storyboard?」 › Create storyboard; no 「Update characters」 card, Julian unchanged; the question line also disappeared. Nothing charged (18992).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Typed character name instead of a chip skips the Update characters card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose two characters are set
5. Type 「Can you change one of the characters to look older?」
6. Tap Send
7. Type the other character's name (e.g. Julian)
8. Tap Send
9. Check the result

Result:
Iris answers 「Preserved the cast profile for Julian…」 and offers Create storyboard; no Update characters card.
摘要：輸入角色名稱回答後，Iris 直接提供 Create storyboard，沒有更新卡。
{16.9.0_amd58_question.jpg} {16.9.0_amd58_typed.jpg} {16.9.0_amd58_no_update_card.jpg}

Expect Result:
A typed name is taken like a chip: Iris offers the priced 「Update characters」 card for that character.
摘要：輸入的角色名稱應視同點選選項，Iris 應提供該角色的「Update characters」報價卡。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/09_ISS-AMD-58/`

---

## 10. ISS-AMD-59 — Update characters card shows no character count  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-350  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-254 (PM Update board 7, 10/16): the card reads 「Update characters • N characters」 and costs one character × count. TC-350 (two characters, 20:49), TC-348 (one, 20:43) and TC-352 (one, Art of Falling): the card reads only 「Update characters」 with the price; no count. The price ◆8 = 2 × the app's one-character ◆4 (the per-character price itself is DRI261896P0046, a recheck). All Off; card only, nothing charged.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Update characters card does not show how many characters it updates
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose two characters are set
5. Type 「Please change both Clara's and Julian's looks: make them both about 30 years younger.」
6. Tap Send
7. Wait for the 「Update characters」 card
8. Check the result

Result:
The card reads only 「Update characters」 with ◆8; it does not say how many characters will be updated.
摘要：卡片只顯示「Update characters」與 ◆8，未標示要更新的角色數量。
{16.9.0_amd59_two_chars.jpg} {16.9.0_amd59_one_char.jpg}

Expect Result:
The card reads 「Update characters • 2 characters」 with its price.
摘要：卡片應顯示「Update characters • 2 characters」及價格。
Spec string: 「Update characters • N characters」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/10_ISS-AMD-59/`

---

## 11. ISS-AMD-60 — Back in the first seconds of a paid generation leaves with no Stop and lose your credits?  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-351, O-21  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-262 (Design 1016_Chat navigation, PM 1002 update §13.6): during a short job (storyboard, chat image update, character update) every top exit asks 「Stop and lose your credits?」. TC-351 (Window Notes Update characters, Generate 20:43, Off): Back 4 s later, while 「Thinking…」 + Stop showed → straight to History, no dialog; the job kept running (reopen showed 「Advancing drama production…」); a second Back at that stage did show the dialog. O-21: the same on storyboards — Bound Pages 00:06:59, Shared Corner 01:00:19 and the Scene 2 revision 00:20:3x / 00:21:09 left with no dialog until the pill had dropped. So the guard starts only once something is charged, while the job was already authorized and keeps running. Related DRI261896P0048 (No Stop and lose your credits? on Back during storyboard generation, Assigned): partly fixed (the dialog now shows later in the job).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Back early in a paid generation leaves with no Stop and lose your credits?
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at the 「Create storyboard」 card
5. Tap Generate
6. Tap Back within 5 seconds
7. Check the result

Result:
Back goes straight to History with no dialog while the generation keeps running in the background.
摘要：付費生成剛開始（Thinking 階段）時按返回，直接回到 History 且無提示，生成仍在背景進行。
{16.9.0_amd60_thinking.jpg} {16.9.0_amd60_still_running.jpg} {16.9.0_amd60_dialog_later.jpg} {16.9.0_amd60_storyboard_back.jpg}

Expect Result:
Back asks 「Stop and lose your credits?」 from the moment Generate is tapped.
摘要：點 Generate 後即應在返回時詢問「Stop and lose your credits?」。
Spec string: 「Stop and lose your credits?」 / 「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1016_Chat navigation frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4858-34930
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261896P0048 (Back during storyboard generation; Assigned)
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/11_ISS-AMD-60/`

---

## 12. ISS-AMD-61 — Create my character cuts a 1,050-character description to 1,000  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-051  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-043 changed by Design 1005_Update (3963:78064, 'Exceed word limit', in the PDF): text over the limit is kept, the counter turns red 「1050/1000」, the warning shows and Generate is disabled. TC-051 (P9-c1, Off): a 1,050-character description (ending 「… END」) set in the expanded editor keeps only 1,000 characters (「END」 gone), counter 「1000/1000」, red 「You've reached the 1,000-character limit.」 in the editor and on Create my character, and 「Generate ◆4」 stays enabled — the build still applies the older PM cut-at-1,000 rule. Text was set through the accessibility value (paste is not possible on the test phone); a manual paste should show the same.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Create my character cuts a 1,050-character description to 1,000
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Ready to create your characters?」
5. Tap a character slot
6. Tap Create my character
7. Tap the expand icon of the description
8. Paste a 1,050-character description
9. Tap Done
10. Check the result

Result:
Only 1,000 characters are kept, the counter shows 1000/1000 and Generate stays enabled.
摘要：只保留 1,000 字，計數顯示 1000/1000，Generate 仍可點。
{16.9.0_amd61_cut_to_1000.jpg} {16.9.0_amd61_editor.jpg}

Expect Result:
All 1,050 characters are kept, the counter shows red 1050/1000 with the limit warning, and Generate is disabled.
摘要：應保留全部 1,050 字，計數紅色顯示 1050/1000 並提示上限，Generate 停用。
Spec string: 「You've reached the 1,000-character limit.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1005_Update (Exceed word limit) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3963-78064
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/12_ISS-AMD-61/`

---

## 13. ISS-AMD-62 — Reopening a drama from History drops messages and the character card  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-113, TC-160, TC-163, O-8, O-14, O-17, O-22, O-29, O-32  ·  **Reproduce:** 9/9  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-098 (Design Recent Task) and rule 2 (R-139): reopening restores the drama at its latest stage and nothing saved is lost without notice. All Off. Messages dropped on reopen: TC-163 (Dawn Bread) — the idea bubble, format answer, first outline, both user requests and a reply are gone, the chat starts at the latest outline; TC-160 — Iris's closing line 「I have created the character sheets for Maya…」 gone; O-22 (Bound Pages) — 「The cast looks good. Please create the storyboard.」 + offer and 「Update the image for Scene 2 to show rain」 + offer gone; O-29 (New Title) — every message since the reopen at 03:53 gone; O-32 (The Gambit) — the last failed turn and Try again gone. Character card lost: TC-113 / O-17 (Silent Notes) and O-14 (Night Shift Radio) reopen on the outline ending 「Possible Characters:」 with no 「Ready to create your characters?」 card (waited 42–55 s), so the cast cannot be set without typing a new message; O-8 (Borrowed Rain) reopened with a 「Create characters →」 option instead of its slot card, and tapping it failed at once (log 16:44:48 TextToImage/TextToSpeech 'not covered by the authorization' → 'Something went wrong'). O-6: the slot card can also sit as a skeleton for ~25 s on reopen. Related DRI261893-0055 (messages disappear when outline generation starts; Close), DRI261895P0034 (revised outline not shown again; ProposeNAB).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Reopening a drama from History drops messages and the character card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type an idea
5. Tap Send
6. Tap English
7. Tap Yes, include captions
8. Tap Generate
9. Wait for 「Ready to create your characters?」
10. Type 「Make the ending a little funnier.」
11. Tap Send
12. Wait for the reply
13. Tap Back
14. Tap Back
15. Tap AI Mini Drama on the Launcher
16. Tap History
17. Tap the drama
18. Scroll to the top of the chat
19. Check the result

Result:
The reopened chat starts at the latest outline; the idea and earlier messages are gone, sometimes the cast card too.
摘要：從 History 重新開啟後，聊天只從最新大綱開始，先前的訊息與回覆消失，有時角色卡也不見。
{16.9.0_amd62_reopen_top.jpg} {16.9.0_amd62_messages_gone.jpg} {16.9.0_amd62_no_cast_card.jpg} {16.9.0_amd62_night_shift.jpg} {16.9.0_amd62_create_characters_option.jpg} {16.9.0_amd62_log.txt}

Expect Result:
The reopened chat shows every saved message and the card of its latest stage.
摘要：重新開啟應顯示所有已儲存的訊息及目前階段的卡片。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/13_ISS-AMD-62/`

---

## 14. ISS-AMD-63 — Failed storyboard and scene image generations keep their credits with no refund  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-071, TC-184, TC-295, O-27, O-36  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** Rule 8 refund check (Credit Details, matched by time and amount). (1) TC-071 Shared Corner Scene 1 Regenerate Image ◆6 01:11:40: the card ends 「Couldn't create image」/「Your credits have been refunded…」 but 01:16 Text to Image −3 is kept with no refund row (pill 18863 → 18860; Pink Fail media tool was on for the scene's first failure, this attempt failed on a real -1009). (2) TC-184 / O-27 The Art of Falling 「Create storyboard」 ◆7 02:34 (Off): beat-edit storage PUT failed 02:41:09; 02:40 Text to Image −3 kept, no refund row. (3) TC-295 Try again 02:51 with Fail turn back Off (read back 02:50): failed 02:57:57 (storage PUT); 02:57 Text to Image −3 kept, pill 18842 → 18839. (4) O-36 綴じられた秘密 video turn 05:25 (Off): failed (video + two beat-edit storage PUTs); 05:26 Text to Speech −1 and 05:32 Text to Image −3 kept. Character refunds are ISS-AMD-53; DRI261897P0016 covers characters and videos only. Not the same as a user Stop/leave (TC-164 −9 kept as the dialog warns, not raised).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed storyboard and scene image generations keep credits with no refund
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a storyboard
5. Read the balance on the credit pill
6. Type 「Change Scene 2 so that it is raining.」
7. Tap Send
8. Tap Generate on 「Create storyboard」
9. Wait until the generation fails
10. Tap Back until the Launcher is shown
11. Tap Mine
12. Tap Credits
13. Tap Details
14. Check the result

Result:
Each failed storyboard or scene image generation keeps its −3 / −1 rows and no refund row is added.
摘要：分鏡或場景圖生成失敗後仍保留 −3/−1 扣點，無退點紀錄。
{16.9.0_amd63_scene_says_refunded.jpg} {16.9.0_amd63_storyboard_failed.jpg} {16.9.0_amd63_retry_failed.jpg} {16.9.0_amd63_ledger.jpg} {16.9.0_amd63_log.txt}

Expect Result:
A failed generation costs nothing: its charges come back as 「Generation failed, credits returned」 rows.
摘要：失敗的生成不應扣點，應出現「Generation failed, credits returned」退點紀錄。
Spec string: 「Your credits have been refunded.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1012_Update thumbnail 9:16 & add Location image (Storyboard) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3999-73608
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 6 (Error) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261897P0016 (refunds for characters and videos), DRI261894P0036 (silent failed step)
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/14_ISS-AMD-63/`

---

## 15. ISS-AMD-64 — Storyboard revision shows a generic skeleton instead of skeletons on the changed scene  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-385  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-295 / R-062 (PM Update board 3): while a chat storyboard-image update runs, only the changed scenes and the Storyboard Preview show skeletons; a new storyboard card appears at the bottom. TC-385 (Bound Pages, 「Update the image for Scene 2 to show rain」 › Create storyboard ◆3 › Generate 00:20:15, Off): the card disappears and a generic 「Advancing the mini drama production to the next stage.」 skeleton block appears under the request; Scene 2 and the Storyboard Preview above show no skeleton. That turn then failed silently (TC-073, DRI261896P0045 recheck).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Storyboard image update shows a generic skeleton, not on the changed scene
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a storyboard
5. Type 「Update the image for Scene 2 to show rain」
6. Tap Send
7. Tap Generate on 「Create storyboard」
8. Look at Scene 2 and the Storyboard Preview
9. Check the result

Result:
A generic Advancing… skeleton block appears under the request; Scene 2 and the preview show no skeleton.
摘要：只出現通用的「Advancing…」骨架區塊，Scene 2 與 Storyboard Preview 沒有骨架。
{16.9.0_amd64_generic_block.jpg} {16.9.0_amd64_no_scene_skeleton.jpg}

Expect Result:
Only the changed scene and the Storyboard Preview show skeletons while the update runs.
摘要：更新期間應只有被修改的場景與 Storyboard Preview 顯示骨架。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/15_ISS-AMD-64/`

---

## 16. ISS-AMD-65 — Storyboard Preview card is not rebuilt after the storyboard changes  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** O-25  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-062 (PM Update board 3): on completion of a storyboard change the preview is updated. O-25 (P9-d2, Off): Shared Corner — after the Scene 1 regeneration succeeded (01:52) Iris replied 「Updated the cuts to sync with your edits on Beat 1…」, re-posted a second 「Story Outline & Characters Result」 card under the 0:43 preview and the video settings card; on reopen they were gone again. Bound Pages — cutting to 3 scenes (TC-188, 02:17) reused three earlier images at no charge and kept the old 「0:44」 Storyboard Preview card under the new 3-scene storyboard, so the preview still plays 6 scenes. Related DRI261896P0014 (preview copy during regeneration).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Storyboard Preview keeps the old preview after the storyboard is cut or changed
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a 6-scene storyboard
5. Type 「Cut the storyboard to 3 scenes.」
6. Tap Send
7. Wait for the new storyboard
8. Look at the Storyboard Preview card
9. Check the result

Result:
The new 3-scene storyboard is shown above the old 0:44 Storyboard Preview card, which is not rebuilt.
摘要：新的 3 場景分鏡下方仍是舊的 0:44 Storyboard Preview，未重新產生。
{16.9.0_amd65_old_preview.jpg} {16.9.0_amd65_three_scenes.jpg}

Expect Result:
After the storyboard changes, the Storyboard Preview is rebuilt to match the new scenes.
摘要：分鏡變更後，Storyboard Preview 應依新場景重新產生。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/16_ISS-AMD-65/`

---

## 17. ISS-AMD-66 — Turn fails with 'token_request fired outside a turn worker thread'  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** O-26, O-30  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** App-side error, no fault switch (all Off). O-26: a script change on The Art of Falling (02:32:33) failed after 35 s; log 'send failure[0] tool=environment-executor … reason="token_request fired outside a turn worker thread; cc session mint must happen on the turn's main loop"' then 'turn failed, offering retry' — generic 「Something went wrong on my end.」 + Try again; the retry worked. O-30 / TC-103 (The Gambit 03:33:33): Try again failed after 14 s with the same message from storyboard-executor. The message describes a threading error in the on-device engine (the token mint runs off the turn's main loop), not a server outage.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Chat turns fail with token_request fired outside a turn worker thread
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a storyboard
5. Type a change to one scene's script
6. Tap Send
7. Wait for the reply
8. Check the result

Result:
The turn fails with Something went wrong; the log shows 'token_request fired outside a turn worker thread'.
摘要：對話回合失敗，Log 顯示 token_request 在 turn 執行緒外觸發。
{16.9.0_amd66_failed_turn.jpg} {16.9.0_amd66_gambit_retry.jpg} {16.9.0_amd66_log.txt}

Expect Result:
The turn completes; the session token is minted on the turn's own thread.
摘要：回合應正常完成，token 應在該回合的主迴圈中取得。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Chat result states (top mockup group) board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/17_ISS-AMD-66/`

---

## 18. ISS-AMD-67 — Whole storyboard failure lacks the Storyboard couldn't be created line  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-295  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-159 (Design Storyboard, 1012 update): a whole storyboard failure shows 「Something went wrong on my end.」 and 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」 with Try again (the video failure shows the matching 「Video couldn't be created.」 line, see the gate). TC-295: Pink › [z] AI Mini Drama › Fail turn = unavailable (02:46, read back), Create storyboard ◆7 → 「Something went wrong on my end. Let's try that again.」 + Try again, no ⓘ line. Reproduced with every switch Off: Fail turn Off at 02:50 (read back), Try again 02:51 failed for real at 02:57:57 (storage PUT) with the same generic copy and no ⓘ line. Refund of that try is ISS-AMD-63.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Failed storyboard lacks the Storyboard couldn't be created line
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at the 「Create storyboard」 card
5. Tap Generate
6. Wait until the storyboard fails
7. Check the result

Result:
Only 「Something went wrong on my end. Let's try that again.」 and Try again are shown; the ⓘ line is missing.
摘要：分鏡失敗時只顯示通用錯誤與 Try again，缺少分鏡失敗說明。
{16.9.0_amd67_no_info_line.jpg} {16.9.0_amd67_off_failure.jpg} {16.9.0_amd67_video_has_line.jpg} {16.9.0_amd67_log.txt}

Expect Result:
The failure also shows 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」
摘要：失敗時應另外顯示 ⓘ 分鏡無法建立的說明。
Spec string: 「Storyboard couldn't be created. Try creating your storyboard again.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1012_Update thumbnail 9:16 & add Location image (Storyboard) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3999-73608
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/18_ISS-AMD-67/`

---

## 19. ISS-AMD-68 — Chat does not return to the newest message after History Back or closing Choose Character  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-101, TC-102  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-089 changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — after History, Character Library or Full Edit the chat opens at the bottom (newest message). TC-101 (Bound Pages, Off): scrolled up to the outline › History › Back → the chat is still at the outline with ↓ shown (tapping the drama in History does open at the bottom). TC-102 (chess drama): scrolled up ~100 pt › tap a slot › Choose Character › Close → same scrolled-up position, ↓ shown. Related DRI261896P0056 (scroll jumps to an earlier card after Choose Character — older rule) and DRI261896P0032 (saved storyboard chat not at the bottom; not reproduced).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Returning from History or Choose Character does not show the newest message
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a storyboard
5. Scroll up to the outline
6. Tap History
7. Tap Back
8. Check the result

Result:
The chat is still scrolled up at the outline with the ↓ button shown.
摘要：返回後聊天仍停在上方的大綱位置，並顯示 ↓ 按鈕。
{16.9.0_amd68_before.jpg} {16.9.0_amd68_after_history.jpg} {16.9.0_amd68_after_picker.jpg}

Expect Result:
The chat opens at the bottom, on the newest message.
摘要：應回到聊天底部，顯示最新訊息。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/19_ISS-AMD-68/`

---

## 20. ISS-AMD-69 — Tap outside the History info bubble also opens the drama under it  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** O-28  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-185 (Design Recent Task, REQ-007): the History ⓘ bubble closes on an outside tap. O-28 (P9-e TC-327 03:18, Off): with the bubble open, a tap on a drama card (210,600 pt) closed the bubble and also opened that drama (Shared Corner) — the tap passes through to the list. The bubble now closes on an outside tap (DRI261896P0026 not reproduced), but the closing tap must not also act on what is underneath.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Tap outside the History info bubble opens the drama under the tap
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap ⓘ
5. Tap a drama card outside the bubble
6. Check the result

Result:
The bubble closes and the drama under the tap opens.
摘要：點氣泡外的作品卡，氣泡關閉的同時也開啟了該作品。
{16.9.0_amd69_bubble.jpg} {16.9.0_amd69_drama_opened.jpg}

Expect Result:
The outside tap only closes the bubble; History stays open.
摘要：點擊氣泡外只應關閉氣泡，停留在 History。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/20_ISS-AMD-69/`

---

## 21. ISS-AMD-70 — Iris refuses to change the story title once characters exist  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-318  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-177 (PM Update board 4, Bug 0014): the History name is the drama title and follows title changes; a user Rename wins. TC-318 (The Gambit, never renamed, 03:52, Off): 「Please change the story title to Checkmate in the Rain.」 → progress 「Updating the story title to Checkmate in the Rain.」 then 「…Upstream outline metadata (such as the story title) is managed in the outline stage and remains unchanged here…」; History still 「The Gambit」. Log: the turn completed with the decline text, no title tool call. A title request at the outline stage (Silent Notes 03:53) did change the title, so the refusal depends on the stage.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Asking Iris to change the story title after the characters stage is declined
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are set
5. Type 「Please change the story title to Checkmate in the Rain.」
6. Tap Send
7. Wait for the reply
8. Tap History
9. Check the result

Result:
Iris says the title is managed in the outline stage and History keeps the old title.
摘要：Iris 回覆標題只能在大綱階段修改，History 仍顯示舊標題。
{16.9.0_amd70_declined.jpg} {16.9.0_amd70_history_old_title.jpg}

Expect Result:
Iris changes the title and History shows the new drama title.
摘要：Iris 應修改標題，History 顯示新標題。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/21_ISS-AMD-70/`

---

## 22. ISS-AMD-71 — Storage upload fails, so every video and many character steps fail  ·  Class: Functional  ·  Severity: S1  ·  Owner: RD

**Report step:** O-34, O-41, O-19, O-23, O-37  ·  **Reproduce:** 6/6  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** Blocks every video: no video reached filming on 189872. Video Generate (Seedance 2.0 Preview ◆120/◆131), all Pink fault switches Off: Shared Corner 05:00 and 05:17, 綴じられた秘密 05:25 (O-34), Shared Corner retry 07:17 (gate4), Old Light on a fresh install 09:21 (O-41) — each fails after ~361 s with video-generation-batch 'HTTP PUT to storage URL failed: Failed to read connection' (07:17: 'Failed to write connection') on storage.googleapis.com/cl-aol-media-demo/…/input.N.png; four failed with 「Something went wrong on my end.」 + 「Video couldn't be created.」 + Try again, the fresh-install one (O-41) ended silently (card=none, failures=1, reply="") — the silent end is DRI261894P0036 (recheck). The same PUT failure breaks character-sync after cast confirm (O-19 23:40, O-23 00:43 / 00:51, O-37 06:28, TC-044 17:24) and beat-edit storyboard changes (TC-073 HTTP 408, TC-184, TC-295). Over two days (10/22 17:24 → 10/23 09:27), on Wi-Fi with other traffic working, every upload of this kind failed: it is not one outage. Nothing was booked for the videos (no AI Video Generator row). Duplicate candidate: DRI261897P0006 (Video generation always fails after ~6 min as the storage upload times out — S1, Assigned, filed on 189729): still reproduces on 189872. Rechecked here per the batch brief; file only if RD wants a ticket on this build.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Video generation always fails after ~6 min: HTTP PUT to storage URL fails
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at the 「Choose your video settings」 card
5. Tap Seedance 2.0
6. Tap Preview - 30 sec
7. Tap Generate
8. Wait 6 minutes
9. Check the result

Result:
After ~6 min the video fails: Something went wrong / Video couldn't be created (log: HTTP PUT to storage URL failed).
摘要：約 6 分鐘後影片生成失敗（Log：HTTP PUT to storage URL failed），無法產生任何影片。
{16.9.0_amd71_video_failed.jpg} {16.9.0_amd71_generate.jpg} {16.9.0_amd71_second_drama.jpg} {16.9.0_amd71_cast_confirm.jpg} {16.9.0_amd71_log.txt}

Expect Result:
The video generates and plays in the chat.
摘要：影片應成功生成並可在聊天中播放。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1012_Update (Video) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4249-36188
Related: DRI261897P0006 (same failure on 189729; Assigned), DRI261894P0036 (silent end, O-41)
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/22_ISS-AMD-71/`

---

## 23. ISS-AMD-72 — Try again after a failed video shows a settings card without the model row  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** O-35  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-083 (Design Video 1012_Update 4249:36188): Try again on 「Video couldn't be created.」 retries the video; the video settings card always carries the model control (Design 1016_add seedance 2.5, frame 2824:130034). O-35 (Shared Corner 05:08 and again 07:17, Off): Try again posts a new settings card with only 「Video length」 and Generate — no model row, so the model cannot be checked or changed on the retry (log: video_model=seedance2). Related DRI261896P0051 (Try again asks which beat to modify; TRCreated) and DRI261894P0029 (Close).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Try again on a failed video shows a settings card with no model choice
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose video failed with 「Video couldn't be created.」
5. Tap Try again
6. Look at the new video settings card
7. Check the result

Result:
The retry card shows only Video length and Generate; the model row is missing.
摘要：重試卡只有 Video length 與 Generate，缺少模型選項。
{16.9.0_amd72_retry_card.jpg} {16.9.0_amd72_normal_card.jpg} {16.9.0_amd72_log.txt}

Expect Result:
Try again retries the video, or shows the full settings card including the model choice.
摘要：Try again 應直接重試，或顯示含模型選項的完整設定卡。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1012_Update (Video) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4249-36188
Spec Link: AI Mini Drama Design spec, 1016_add seedance 2.5 frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2824-130034
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/23_ISS-AMD-72/`

---

## 24. ISS-AMD-73 — Offline sends show a generic network banner instead of the AI Mini Drama offline toast  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-032, TC-387, TC-300, O-38  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189872

> **QA note — not pasted into eBug.** R-028 / R-297 / R-164 (Design Extra board, 1005_Chat 3946:68005; PM Update board 5): offline sends and action buttons show 「You're offline. Check your connection and try again.」, nothing sent or charged. Real network loss (USB confirmed, Wi-Fi off, cellular off; restored after each), Pink untouched: TC-032 idea + Generate 06:05, TC-387 chat message 06:09, TC-300 Create storyboard Generate 06:31 — the screen shows 「No connection available. Check your network connection and then try again.」 each time, while the log records '[AIDrama Toast] You're offline. Check your connection and try again.' at the same second. Behaviour is right (nothing sent or charged, text and card kept); only the shown copy differs, so the AI Mini Drama toast is either not drawn or replaced by a generic banner.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Offline send shows No connection available instead of You're offline toast
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Turn off Wi-Fi and cellular data
4. Tap Create Your Drama
5. Type an idea
6. Tap Send
7. Tap English
8. Tap Yes, include captions
9. Tap Generate
10. Check the result

Result:
A banner reads 「No connection available. Check your network connection and then try again.」
摘要：離線時顯示「No connection available…」通用橫幅，而非 AI Mini Drama 的離線提示。
{16.9.0_amd73_idea_offline.jpg} {16.9.0_amd73_chat_offline.jpg} {16.9.0_amd73_storyboard_offline.jpg} {16.9.0_amd73_log.txt}

Expect Result:
The toast reads 「You're offline. Check your connection and try again.」
摘要：應顯示「You're offline. Check your connection and try again.」提示。
Spec string: 「You're offline. Check your connection and try again.」

[AI Recommendation]
Toast: You're offline. Check your connection and try again.

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, 1005_Chat (offline) frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3946-68005
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 5 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0_images/24_ISS-AMD-73/`

---

## Rechecks — existing tickets that still reproduce on 189872 (information only; no comments, team rule 2026-10-21)

| P9 case | Ticket | Status — ticket says | What P9 saw |
|---|---|---|---|
| TC-014 | DRI261895P0023 | Propose Wont Fix — Surprise me replaces the composer instead of appending | Tap 2 left it unchanged, taps 3–4 replaced the whole input; never appended. |
| TC-019 | DRI261896P0059 | NAB — More ideas + chip missing once the chat has content | No chip at the format card, outline or characters card (as P1). Ticket is NAB; not refiled. |
| TC-193 | DRI261895P0004 | Assigned — a pet that drives the story is never offered as a character | Grandma's cat drives three beats; only two human slots. |
| TC-213 | DRI261896P0038 | Propose Wont Fix — a message before the format is chosen skips language and captions | 「Make it bittersweet」 at the format card → outline with no language/captions chosen (answers=0). |
| TC-039, TC-040, TC-047, TC-060, TC-070, TC-072, TC-349, TC-350 | DRI261896P0046 | ProposeNAB — character, scene image and chat update prices differ from the spec | One character ◆4 (spec ◆6), two ◆8 (◆12); images booked at −3 (spec 2 per image); Regenerate Image authorizes TextToImagex2 for one failed image. |
| TC-121 | DRI261897P0017 | Assigned — X on Finish your characters keeps the generated looks | X closes the sheet, the new look is applied and a ✦ Mine card exists. |
| TC-126 | DRI261896P0031 | NewCreated — AI Suggestion leaves required attributes empty | Description = the outline's role line; Gender/Ethnicity/Age empty; Generate disabled. |
| TC-067 | DRI261897P0012 | NewCreated — failed scene image card copy differs from the Design error frame | Card body 「…Try editing the description for a different result.」 vs Design 1012 「The service is busy — try again later.」 (Pink Fail media tool = TextToImage; copy is static). |
| TC-073, TC-293 | DRI261896P0045 | TRCreated — updating a storyboard image from chat fails silently | Scene 2 rain update: skeleton then nothing (beat-edit PUT 408); two-scene snow/rain requests get reply="" and no card. |
| TC-175 | DRI261893-0123 | NAB — storyboard scene description has no edit or save action | Successful scene script read-only; Edit only on a failed image. NAB; not refiled. |
| TC-178 | DRI261893-0163 | QANeedRework — successful storyboard image routes expose no version editor | Tap / long-press on a successful scene or location tile does nothing. |
| TC-179 | DRI261894P0007 / DRI261894P0021 | QA Propose Postpone / Propose Postpone — credit details list drama charges as Text to Image / Text to Speech | Ledger rows still read Text to Image / Text to Speech, none say AI Mini Drama. |
| TC-184, O-12, O-41 | DRI261894P0036 | TRCreated — after a failed step the chat is left with no next step, card or retry | Art of Falling ◆7 storyboard failed with no error/Try again/offer; a failed Add New turn removed the slot card (O-12); fresh-install video failure ended silently (O-41). |
| TC-187 | DRI261894P0046 | Close — language change by chat leaves outline and scene titles in the old language | Partly reproduces: beats, scene titles and scripts now Japanese, but 「Possible Characters:」 lines stay English. Closed ticket — reopen candidate (listed only, not acted on). |
| TC-208 | DRI261896P0024 | TRCreated — Story Outline & Characters Result block appears twice | Window Notes: two outline blocks after Done ✓ (20:36). |
| TC-212 | DRI261896P0034 | Fail — default actors assigned with the wrong gender | The Art of Falling: Julian Cross = a woman, Lauren Hale = a man. |
| TC-288 | DRI261897P0018 | NewCreated — character filter with no matches shows a blank grid | Male + Indigenous: only 「Create my character」 and blank space (disposition spec-addition). |
| TC-276, TC-277 | DRI261897P0020 | Assigned — feature strings stay English in Traditional Chinese and Japanese | zh-Hant and ja tours: feature strings still English, shared strings translated. |
| TC-115 | DRI261896P0055 | TRCreated — video settings card does not show You'll have N left | Line reads 「You have 18830 credits left」 (current balance). |
| TC-081, TC-303 | DRI261895P0022 | NeedCodeReview — first video omits the notification pre-prompt | No 「Get notified when your video is ready?」 on the first video of three installs (all videos then failed, so a post-start prompt cannot be ruled out). |
| TC-153, TC-155 | DRI261893-0128 | Propose Won't Fix — outline and revision Stop give no feedback | Stop removes the skeleton with no message. |
| TC-156 | DRI261897P0007 | NewCreated — storyboard and video Stop cancel silently | Storyboard Stop 06:35: no dialog, toast or message. |
| TC-154, TC-161 | DRI261895P0024 | QA Propose Wont Fix — character generation has no usable Stop or cancellation warning | Generate all: no Stop, X / outside tap / Back dead for ~72 s. The PM 10/16 Cancel rows are drafted as ISS-AMD-54. |
| TC-169 | DRI261895P0029 | Assigned — outline generation blocks actions beyond ten seconds | Longest stretch ~21 s (log wall 20.9 s). |
| TC-171 | DRI261895P0030 | Assigned — revision blocks actions beyond ten seconds | ~16 s (log wall 15.9 s). |
| TC-170, TC-172, O-10, O-13 | DRI261897P0008 | Assigned — character and storyboard generation block the screen for over a minute | Characters 63–234 s, storyboard 101–245 s, chat turns up to 423 s with only 「Thinking…」. |
| O-31 | DRI261894P0042 | TRCreated — VoiceOver reads image IDs for Back and other buttons | Credits page from the pill: Back 「D58D762F 181C …」, info 「FE31A39E …」. |
| O-34, O-41 | DRI261897P0006 | Assigned (S1) — video generation always fails after ~6 min (storage upload) | Every video on 189872 failed the same way; drafted as ISS-AMD-71 per the brief, starts on hold as its duplicate. |
| TC-042, TC-043, TC-353, TC-329, O-15 | DRI261897P0016 | Propose Wont Fix — failed character and video generations keep credits | Still kept on 189872; drafted as ISS-AMD-53 per rule 8, starts on hold as its duplicate. |

## Fixed or partly fixed on 189872 (information only)

| P9 case | Ticket | What P9 saw |
|---|---|---|
| TC-047 | DRI261894P0009 | Create my character heading reads 「…looks like」 now (fixed). |
| TC-042 | DRI261896P0042 | Partly fixed: the failure dialog and the red 「!」 now show (refund still missing → DRI261897P0016). |
| TC-277 | DRI261896P0022 | Japanese template names no longer truncate. |
| TC-113 | DRI261896P0032 | Saved storyboard chat opens at the bottom. |
| TC-105 (P9-j) | DRI261896P0026 | History hint closes on an outside tap (but the tap passes through: ISS-AMD-69). |
| TC-040 | DRI261896P0016 | Singular 「1 character isn't set yet」 correct in a custom chat (template chat not checked). |

## Held — not drafted as bugs

| Item | Reason | What to decide |
|---|---|---|
| TC-381, O-40 | question (PM) | Idea chat: Back at the format card shows 「Leave this chat?」 (RD Note 三.1: a message was sent, so it asks), but the row expects no dialog (R-288). Template chats now leave with no dialog (O-40), so the two entry paths differ. PM to rule which is right. |
| TC-031 | question (PM) | Policy-violating idea gets the model's own refusal text, not the spec copy; the 4xxx moderation path may not have been hit (log: normal model turn). DRI261896P0053 (NewCreated) already asks this. |
| TC-189 | question (PM) | Unsupported 9:16 / 15 s request: no reply problem gone, but the request is not answered as unsupported. Is 15 s a supported length? (DRI261894P0050). |
| TC-204 | question (PM) | Animal character needs an ethnicity; 「Other」 is the only path. Is Other intended for animals? (DRI261896P0017, ProposeNAB). |
| TC-159 | question (PM) | Leaving a running outline discards it (dialog says so): the row's 'same task at that stage' cannot happen. Should a running outline survive leaving? (DRI261897P0013). |
| TC-164 | question (PM) | Leaving a running storyboard stops it and keeps −9 (dialog warns); the row expects the stage to continue. Spec dialog vs row conflict. |
| TC-158 | question (PM) — conflicts with RD Note 三.1 / TC-381 | Unsent typed idea is dropped on Back with no alert; RD's DRI261894P0043 fix makes an unsent chat leave silently and TC-381's first step expects exactly that. Not a defect per RD; PM to say whether a typed draft should be kept. |
| TC-341, TC-342 | PM question (RD Note 二.1) | No page 「Discard」 button and no swipe-down on a finished Create my character result: RD says the sheet is full-screen and X is the only close path. PM-only rows contradict the RD design. |
| TC-079, TC-347 | ask RD/CMS (RD Note 一.1d) | Model control reads Best / Seedance 2.0 / Seedance 2.0 Mini with the old subtitles; RD says Best / Standard / Fast need CMS keys AnswerVideoVendorSeedance2_5 / VendorDescriptionSeedance2_5 — check whether the keys are live on the Developer Server before filing. |
| TC-080 | ask RD/CMS (RD Note 一.1e, open item) | Best (Seedance 2.5) priced ◆120/◆360 like 2.0 (spec ◆180/◆540): Seedance 2.5 still uses the 2.0 credit action ID (open item in the RD Note). Re-check when the 2.5 action ID lands. |
| O-20, O-27 (price vs booking) | ask RD (billing) | Character Generate ◆4 booked only −3 twice (no TTS row); Create storyboard ◆7 authorized 7 but booked −3 before failing. Under-charge / booking mismatch, user not harmed; ask RD whether the per-item booking is intended. |
| O-16, O-18 | needs ground truth | Public-figure check blocked two photos of non-famous-looking people and an AI-generated character sheet; no log shows the match. Could be correct or over-broad — ask RD for the check's result before filing. |
| O-7 | single sighting | African library cards blank white (16:51) in a window with CMS media download failures and network loss; not seen again. Re-check before filing. |
| O-3 | question (PM) / network | Template row stays grey skeletons during real network loss (-1005/-1009) with no offline or retry state; no spec state for it. |
| O-39 | question (PM) / network | A request lost to network loss stays on 「Developing the story outline…」 + Stop for ~3 min after the network returns before Try again; no spec timeout. |
| O-1, O-2, O-12, O-24 | server outage | cc team gateway 'Failed to read connection' / 502 upstream provider UNAVAILABLE / Gemini UNAVAILABLE; the app showed 「Something went wrong」 + Try again (correct handling). Refund of O-24's TC-071 charge: ISS-AMD-63. |
| TC-071 (image never arrives) | server outage | Scene 1 regeneration failed 4× on -1009 / Gemini UNAVAILABLE; skeleton as expected. Refund raised as ISS-AMD-63. |

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-5 | Credit pill 60 lower with nothing charged on this phone | Shared account; other devices' charges. |
| O-33 | Subscription page exposes image IDs and raw IAP keys to VoiceOver | Not AI Mini Drama UI (subscription page); noted only, outside this table. |
| O-6 | Slot card skeleton ~25 s on reopen | Merged into ISS-AMD-62 note (reopen) and the wait recheck DRI261897P0008. |
| TC-043 copy | Single failure reads 「…Try again later.」 (Design frame) vs PM 「…Try again.」 | Build matches the Design frame; Design wins (no newer PM date); refund part is ISS-AMD-53. |
| Blocked (128) | 63 defect, 9 observability, 56 test-data | No verdict: video gate (no video reached filming, ISS-AMD-71 / DRI261897P0006), policy (full generation REQ-019, low balance, purchase, chat count, remote config, new account, voice), observability and upstream failures. Listed on the review page. |

## Reconciliation against the report

The run is the report: 84 Fail (77 defect, 7 question / spec-addition), 128 Blocked (no verdict), observations O-1…O-42 (42).

| Step | Count | Running total |
|---|---|---|
| Fail rows + observations | 126 | 126 |
| → recheck / reopen candidate of an existing ticket (no new entry) | −37 | 89 |
| → held (PM question, ask RD/CMS, server outage, ground truth, single sighting) | −22 | 67 |
| → not a bug / merged into a note | −2 | 65 |
| → merged: 65 items share 24 defects | −41 | **24 entries** |

### Row-by-row map

| Item | Result | Disposition | Became |
|---|---|---|---|
| TC-014 | Fail | defect | recheck DRI261895P0023 |
| TC-019 | Fail | defect | recheck DRI261896P0059 (NAB) |
| TC-381 | Fail | question | held (PM question) |
| TC-357 | Fail | defect | 1. ISS-AMD-50 |
| TC-358 | Fail | defect | 1. ISS-AMD-50 |
| TC-031 | Fail | question | held (PM question) |
| TC-189 | Fail | question | held (PM question) |
| TC-193 | Fail | defect | recheck DRI261895P0004 |
| TC-213 | Fail | defect | recheck DRI261896P0038 |
| TC-039 | Fail | defect | recheck DRI261896P0046 |
| TC-040 | Fail | defect | recheck DRI261896P0046 |
| TC-041 | Fail | defect | 5. ISS-AMD-54 |
| TC-042 | Fail | defect | 3. ISS-AMD-52 + 4. ISS-AMD-53 |
| TC-384 | Fail | defect | 3. ISS-AMD-52 |
| TC-043 | Fail | defect | 4. ISS-AMD-53 |
| TC-044 | Fail | defect | 6. ISS-AMD-55 |
| TC-121 | Fail | defect | recheck DRI261897P0017 |
| TC-208 | Fail | defect | recheck DRI261896P0024 |
| TC-212 | Fail | defect | recheck DRI261896P0034 (+ 2. ISS-AMD-51 en_US) |
| TC-288 | Fail | spec-addition | recheck DRI261897P0018 (spec-addition) |
| TC-337 | Fail | defect | 5. ISS-AMD-54 |
| TC-348 | Fail | defect | 8. ISS-AMD-57 |
| TC-391 | Fail | defect | 9. ISS-AMD-58 |
| TC-349 | Fail | defect | 8. ISS-AMD-57 (+ price recheck DRI261896P0046) |
| TC-350 | Fail | defect | 10. ISS-AMD-59 (+ price recheck DRI261896P0046) |
| TC-351 | Fail | defect | 11. ISS-AMD-60 |
| TC-352 | Fail | defect | 8. ISS-AMD-57 |
| TC-353 | Fail | defect | 3. ISS-AMD-52 + 4. ISS-AMD-53 |
| TC-047 | Fail | defect | recheck DRI261896P0046 (DRI261894P0009 fixed) |
| TC-051 | Fail | defect | 12. ISS-AMD-61 |
| TC-126 | Fail | defect | recheck DRI261896P0031 |
| TC-204 | Fail | question | held (PM question) |
| TC-332 | Fail | defect | 5. ISS-AMD-54 |
| TC-333 | Fail | defect | 5. ISS-AMD-54 |
| TC-334 | Fail | defect | 5. ISS-AMD-54 |
| TC-383 | Fail | defect | 5. ISS-AMD-54 |
| TC-341 | Fail | defect | held (PM question, RD Note 二.1) |
| TC-342 | Fail | defect | held (PM question, RD Note 二.1) |
| TC-060 | Fail | defect | recheck DRI261896P0046 |
| TC-359 | Fail | defect | 1. ISS-AMD-50 |
| TC-067 | Fail | defect | recheck DRI261897P0012 |
| TC-070 | Fail | defect | recheck DRI261896P0046 |
| TC-071 | Fail | defect | 14. ISS-AMD-63 (image never arrives: server, held) |
| TC-072 | Fail | defect | recheck DRI261896P0046 |
| TC-385 | Fail | defect | 15. ISS-AMD-64 |
| TC-073 | Fail | defect | recheck DRI261896P0045 |
| TC-175 | Fail | defect | recheck DRI261893-0123 (NAB) |
| TC-178 | Fail | defect | recheck DRI261893-0163 |
| TC-179 | Fail | defect | recheck DRI261894P0007 / P0021 |
| TC-184 | Fail | defect | recheck DRI261894P0036 + 14. ISS-AMD-63 |
| TC-187 | Fail | defect | reopen candidate DRI261894P0046 (+ 2. ISS-AMD-51 ja_JP) |
| TC-293 | Fail | defect | recheck DRI261896P0045 |
| TC-295 | Fail | defect | 18. ISS-AMD-67 + 14. ISS-AMD-63 |
| TC-101 | Fail | defect | 19. ISS-AMD-68 |
| TC-102 | Fail | defect | 19. ISS-AMD-68 |
| TC-103 | Fail | defect | 8. ISS-AMD-57 |
| TC-113 | Fail | defect | 13. ISS-AMD-62 |
| TC-276 | Fail | defect | recheck DRI261897P0020 |
| TC-277 | Fail | defect | recheck DRI261897P0020 (DRI261896P0022 fixed) |
| TC-318 | Fail | defect | 21. ISS-AMD-70 |
| TC-329 | Fail | defect | 4. ISS-AMD-53 (offer title 「Update characters」 noted) |
| TC-115 | Fail | defect | recheck DRI261896P0055 |
| TC-079 | Fail | defect | held (ask RD/CMS) |
| TC-080 | Fail | defect | held (ask RD/CMS) |
| TC-081 | Fail | defect | recheck DRI261895P0022 |
| TC-347 | Fail | defect | held (ask RD/CMS) |
| TC-032 | Fail | defect | 24. ISS-AMD-73 |
| TC-387 | Fail | defect | 24. ISS-AMD-73 |
| TC-153 | Fail | defect | recheck DRI261893-0128 |
| TC-154 | Fail | defect | recheck DRI261895P0024 |
| TC-155 | Fail | defect | recheck DRI261893-0128 |
| TC-156 | Fail | defect | recheck DRI261897P0007 |
| TC-158 | Fail | defect | held (PM question; conflicts with RD Note 三.1) |
| TC-159 | Fail | question | held (PM question) |
| TC-160 | Fail | defect | 13. ISS-AMD-62 |
| TC-161 | Fail | defect | recheck DRI261895P0024 |
| TC-163 | Fail | defect | 13. ISS-AMD-62 |
| TC-164 | Fail | question | held (PM question) |
| TC-169 | Fail | defect | recheck DRI261895P0029 |
| TC-170 | Fail | defect | recheck DRI261897P0008 |
| TC-171 | Fail | defect | recheck DRI261895P0030 |
| TC-172 | Fail | defect | recheck DRI261897P0008 |
| TC-300 | Fail | defect | 24. ISS-AMD-73 |
| TC-303 | Fail | defect | recheck DRI261895P0022 |
| O-1 | observation | — | held (server outage) |
| O-2 | observation | — | held (server outage) |
| O-3 | observation | — | held (PM question / network) |
| O-4 | observation | — | 2. ISS-AMD-51 |
| O-5 | observation | — | not a bug (shared account) |
| O-6 | observation | — | merged into 13. ISS-AMD-62 note |
| O-7 | observation | — | held (single sighting) |
| O-8 | observation | — | 13. ISS-AMD-62 |
| O-9 | observation | — | 7. ISS-AMD-56 |
| O-10 | observation | — | recheck DRI261897P0008 |
| O-11 | observation | — | 7. ISS-AMD-56 |
| O-12 | observation | — | held (server outage) + recheck DRI261894P0036 (card removed) |
| O-13 | observation | — | recheck DRI261897P0008 |
| O-14 | observation | — | 13. ISS-AMD-62 |
| O-15 | observation | — | 4. ISS-AMD-53 |
| O-16 | observation | — | held (needs ground truth) |
| O-17 | observation | — | 13. ISS-AMD-62 |
| O-18 | observation | — | held (needs ground truth) |
| O-19 | observation | — | 22. ISS-AMD-71 |
| O-20 | observation | — | held (ask RD, billing) |
| O-21 | observation | — | 11. ISS-AMD-60 |
| O-22 | observation | — | 13. ISS-AMD-62 |
| O-23 | observation | — | 22. ISS-AMD-71 |
| O-24 | observation | — | held (server outage); refund → 14. ISS-AMD-63 |
| O-25 | observation | — | 16. ISS-AMD-65 |
| O-26 | observation | — | 17. ISS-AMD-66 (+ empty replies → recheck DRI261896P0045) |
| O-27 | observation | — | 14. ISS-AMD-63 (price vs booking held, ask RD) |
| O-28 | observation | — | 20. ISS-AMD-69 |
| O-29 | observation | — | 13. ISS-AMD-62 |
| O-30 | observation | — | 17. ISS-AMD-66 + 7. ISS-AMD-56 |
| O-31 | observation | — | recheck DRI261894P0042 |
| O-32 | observation | — | 13. ISS-AMD-62 |
| O-33 | observation | — | not a bug here (outside AI Mini Drama) |
| O-34 | observation | — | 22. ISS-AMD-71 |
| O-35 | observation | — | 23. ISS-AMD-72 |
| O-36 | observation | — | 6. ISS-AMD-55 + 14. ISS-AMD-63 |
| O-37 | observation | — | 22. ISS-AMD-71 + 7. ISS-AMD-56 |
| O-38 | observation | — | 24. ISS-AMD-73 |
| O-39 | observation | — | held (PM question / network) |
| O-40 | observation | — | held with TC-381 (PM question) |
| O-41 | observation | — | 22. ISS-AMD-71 (+ silent end → recheck DRI261894P0036) |
| O-42 | observation | — | 22. ISS-AMD-71 (TC-303's 10/23 video, read 10/27: same storage PUT failure; entry held as DRI261897P0006) |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 |
| PM | — |
| Doc | — |

### Filing order

By severity, duplicates last: **2**, **6**, **13**, **14**, **1**, **3**, **7**, **8**, **9**, **10**, **12**, **15**, **16**, **17**, **18**, **19**, **20**, **21**, **23**, **24**; on hold as duplicates (read-only dedupe, `dedupe.txt`, each candidate read): **22** (DRI261897P0006, Assigned S1), **4** (DRI261897P0016, Propose Wont Fix), **5** (DRI261895P0024, QA Propose Wont Fix — new grounds: PM 10/16 board 9), **11** (DRI261896P0048, Assigned — partly fixed). Other dedupe hits were judged related, not duplicates (named on each card). Filed 2026-10-27 per `decisions.md` (BugCodes in `filed_bugcodes.md`).

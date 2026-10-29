# AI Mini Drama (Android) — eBug drafts, phase A2 (table v2), PDR-A 16.8.0 build 2610212

**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/android/runs/2026-10-27-a2-round2/` — phase A2 of draft `drafts/20261027-171228` (table v2, 471 cases; 414 run here), 2026-10-27 17:22 → 10-28 03:10 on Sony Xperia 10 III (XQ-BT52) / Android 12 through Appium / UiAutomator2, build 16.8.0 (2610212), TR261021-0082, Stage server, account 「ethan.hsu.cl」 (Free); retest after A2 on 10-28 11:00 → 14:25 (REQ-047 / REQ-048: A2-r1, 9 credit-blocked cases after a top-up; A2-r2, 9 fresh-install cases after an uninstall / reinstall of the same APK and a pm clear). Result after the retest: 160 Pass, 130 Fail, 124 Blocked. Off-case observations O-1…O-27: `runs/2026-10-27-a2-round2/observations.md`. Spec set `specs/2026-10-21-2` plus the PM Figma 10/22 frames (§13.24 node 4422:2, export node 4418:2).

**Updated 2026-10-28 (retest):** TC-157 joins ISS-AMDA-21, TC-173 joins ISS-AMDA-43; new ISS-AMDA-45 (TC-081, with TC-303 / TC-304 Blocked behind it) and ISS-AMDA-46 (TC-166); TC-501, TC-490, TC-496, TC-166, O-25 and O-26 match existing Android tickets; TC-467 is a PM question; O-27 is a test-setup note.

**Filed by:** ETHAN_HSU on 2026-10-28 — all 40 entries, DRA262610P0324–P0363 (entry N → DRA262610P0323+N) on TR261021-0082, 16.8.0 build 2610212, API; see `filed_bugcodes.md`.

**Status:** decisions of 2026-10-28 applied (`decisions.md`: Sev / Belong per row, all 40 filed). Before that: nothing filed, uploaded or commented. First Android casebook batch, so there are no filing defaults yet (`ebug-defaults.ts pdr/ai-mini-drama android`: none): Creator, TRCode, source tag and method are asked on the review page. Dedupe was read-only (`dedupe.txt`).

Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure-related entry and wherever a log shows the cause (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (Doc for copy). Dedupe per OS (user, 2026-10-28): a finding that matches an existing Android ticket, open or resolved, is not listed here at all (no entry, no recheck row, no on-hold entry) and is kept only in `dedupe.txt`; an iOS ticket never makes a finding a duplicate (its BugCode may be named in the QA note). No comments, no reopen (team rule 2026-10-21). Android 16.8 has no fault switches, so every finding here was seen with no injection.

**What is drafted:** 40 entries, all proposed for filing — Fail cases and observations with no Android ticket of their own (46 before the 2026-10-28 per-OS dedupe; 6 entries (ISS-AMDA-04, ISS-AMDA-06, ISS-AMDA-14, ISS-AMDA-26, ISS-AMDA-36, ISS-AMDA-44), the one-character wait of ISS-AMDA-43 (TC-170) and the 57 former recheck rows match existing Android tickets (71 tickets) and are left out, recorded only in `dedupe.txt`). 6 cases are PM questions; see the tables after the entries. Entries follow the run order; trust the ISS-ID over the number.

Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), Doc (copy). Every entry links the spec board or Figma frame it is checked against.

---

## 1. ISS-AMDA-01 — Surprise me appends the same inspiration on every tap  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-014  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-014 / R-287 (PM main flow; board notes l.96: Surprise me picks 1 of 10 strings at random and appends to the text). A2-a 17:24: five taps without clearing appended one line each (append rule OK, not a chip string), but all five were 「A strict teacher wakes up trapped inside the body of their worst student.」. A1 on the same build: the same one fixed pick per chat. The iOS tickets DRI261893-0124 (NAB) and DRI261895P0023 (Propose Won't Fix) are about iOS (replace vs append); no Android ticket.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Surprise me appends the same inspiration on every tap
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Tap Surprise me
5. Tap Surprise me
6. Tap Surprise me
7. Tap Surprise me
8. Tap Surprise me
9. Check the result

Result:
Five Surprise me taps append the same inspiration five times instead of random picks.
摘要：連按五次 Surprise me，五次都附加同一句靈感，而非隨機挑選。
{16.8.0_amda01_same_pick_x5.jpg}

Expect Result:
Each tap appends a random pick from the inspiration pool, so five taps are not all the same string.
摘要：每次點擊應從靈感池隨機挑一句附加，五次不應全部相同。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/01_ISS-AMDA-01/`

---

## 2. ISS-AMDA-02 — First outline card is titled Story Outline Result  ·  Class: UI  ·  Severity: S3  ·  Owner: PM

**Report step:** TC-024  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-021 (PM main flow): the result card is 「Story Outline & Characters Result」. A2-a 17:24:40 (and A1): the first outline card header (text_mini_drama_outline_card_header) reads 「Story Outline Result」; body correct (Story Outline, six beats, Possible Characters, slot row). Later cards in the same chat after a character update are titled 「Story Outline & Characters Result」 (TC-349), so the build uses both names. Not DRA262610P0126 (outline editor, ProposeNAB).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: First outline card is titled 「Story Outline Result」
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
10. Check the result

Result:
The first outline card header reads 「Story Outline Result」.
摘要：第一張大綱卡標題為「Story Outline Result」。
{16.8.0_amda02_header.jpg}

Expect Result:
The header reads 「Story Outline & Characters Result」, as later cards in the same chat do.
摘要：標題應為「Story Outline & Characters Result」，與同一聊天後續卡片一致。
Spec string: 「Story Outline & Characters Result」

[AI Recommendation]
Story Outline & Characters Result

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/02_ISS-AMDA-02/`

---

## 3. ISS-AMDA-03 — Character filter lists Other twice under Gender  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-036, TC-289  ·  **Reproduce:** 2/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-031 / R-040 (PM main flow; board notes l.100/l.102: Gender Female / Male / Others). A2-b 17:29 and A2-c2 ~19:12: Gender shows 「Female」「Male」「Other」「Other」 (4th chip cut at the right edge, visible after scrolling the row). A1 at 16:35 on the same build showed Other once, so the list is built inconsistently (2 of 3 reads). Filtering itself works. Related, not duplicate: DRA262610-0020 (NewCreated) is the 「Others」 vs 「Other」 label.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character filter lists 「Other」 twice under Gender
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap the filter icon
7. Swipe the Gender options left
8. Check the result

Result:
The Gender filter lists 「Female」「Male」「Other」「Other」: Other appears twice.
摘要：角色篩選的性別選項出現兩個「Other」。
{16.8.0_amda03_other_twice.jpg} {16.8.0_amda03_other_twice2.jpg}

Expect Result:
Gender lists Female, Male and Others once each.
摘要：性別選項應各出現一次：Female、Male、Others。
Spec string: 「Female / Male / Others」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/03_ISS-AMDA-03/`

---

## 4. ISS-AMDA-05 — Character generation is priced at 4 credits, not 6  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-039, TC-040, TC-047  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-033 / R-040 (Design Finish your characters and Create my character frames: Generate all ◆6×n, Generate ◆6; Design outranks the PM's ◆7, user rule 2026-10-19). On 2610212 every character generation is ◆4: Finish your characters 3 unset → 「Generate all ◆12」, 1 unset → 「Generate ◆4」, Create my character → 「Generate ◆4」 (also A1). What is charged matches the shown ◆4 (Text to Image −3 + Text to Speech −1). Related, not duplicate: DRA262610P0113 (credit usage info on the sheet).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Character generation is priced at 4 credits instead of 6
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap the first character's slot
6. Tap ✓ without setting the other characters
7. Read the Generate all button
8. Check the result

Result:
Finish your characters prices 3 characters at ◆12 and one at ◆4; Create my character shows Generate ◆4.
摘要：角色生成每位只標價 4 點（三位 ◆12、一位 ◆4），建立角色也顯示 ◆4。
{16.8.0_amda05_generate_all_12.jpg} {16.8.0_amda05_generate_4.jpg} {16.8.0_amda05_cmc_4.jpg}

Expect Result:
One character generation costs ◆6: Generate all ◆6 per character, Generate ◆6 on both sheets.
摘要：每位角色生成應為 6 點：Generate all 每位 ◆6，Generate ◆6。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/04_ISS-AMDA-05/`

---

## 5. ISS-AMDA-07 — Update characters card shows no character count  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-045, TC-350  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-038 / R-254 (PM update board 7, 10/16; board notes l.301–304: 「Update characters • {n} character(s) • ◆{credits} • Generate」). A2-b 18:00 (one character, ◆4) and 18:10 (two, ◆8): the card shows 「Update characters」/「Credits will be consumed for this task.」, the price and Generate, no count. The prices are right (one character ◆4, two ◆8). The storyboard-claim message before it is DRA262610P0174 (existing Android ticket).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Update characters card shows no character count
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set (no storyboard yet)
5. Type Make Maya Lin a woman in her 40s
6. Tap Send
7. Wait for the Update characters card
8. Check the result

Result:
The card shows only 「Update characters」, the price and Generate; 「• 1 character」 (or 2) is missing.
摘要：更新角色卡只顯示標題、價格與 Generate，缺少「• 1 character」角色數。
{16.8.0_amda07_one_character.jpg} {16.8.0_amda07_two_characters.jpg}

Expect Result:
The card reads 「Update characters • 1 character • ◆4 • Generate」 (「• 2 characters」 for two).
摘要：卡片應顯示角色數，例如「• 1 character」或「• 2 characters」。
Spec string: 「Update characters • N character(s) • ◆credits • Generate」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/05_ISS-AMDA-07/`

---

## 6. ISS-AMDA-08 — Closing the ready sheet with X still applies the looks and commits the cast  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-121, O-1  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-106 (Design flow arrow 2811-90144: X on Finish your characters closes back to Choose Character and the generated looks are not applied). TC-121 (The Final Reel, 17:45): 「Your characters are ready」 › X → Leo's slot keeps the new look; Choose Character X › 「Leave without finishing?」/「…your picks won't be saved.」 › Leave → the chat had already committed the whole cast and moved on (「The characters look great! Ready to create the storyboard?」 + Create storyboard ◆31). O-1 (Corner Stall Rivalry, 17:36): after Leave anyway and Choose Character X › Leave the picks were saved anyway and no Characters Result card was posted (also after reopening). Charged 4 for the look (TC-121), as expected.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: X on 「Your characters are ready」 still applies the looks and commits the cast
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Pick looks for all but one character
6. Tap ✓
7. Tap Generate
8. Wait for 「Your characters are ready」
9. Tap X on the sheet
10. Tap X in Choose Character
11. Tap Leave
12. Check the result

Result:
X keeps the new look in the slot, and after Leave the chat has already committed the whole cast.
摘要：點 X 後新外觀仍套用到角色，離開後聊天已確認整組角色。
{16.8.0_amda08_ready.jpg} {16.8.0_amda08_applied_after_x.jpg} {16.8.0_amda08_cast_committed.jpg} {16.8.0_amda08_o1_no_cast_card.jpg}

Expect Result:
X closes the sheet back to Choose Character without applying the generated looks; Leave saves no picks.
摘要：X 應回到選角畫面且不套用生成外觀；選擇 Leave 不應儲存選角。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, flow arrow 2811-90144 (R-106) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90144
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/06_ISS-AMDA-08/`

---

## 7. ISS-AMDA-09 — Leave anyway during character generation drops finished looks but keeps the charge  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-337, TC-403  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-247 (PM update board 9, 10/16: Leave anyway stops the unfinished character, keeps a finished one; no refund for the stopped one). TC-337 (The Final Reel, Generate all ◆12 17:39:51): all three images logged ok at 17:40:35–37 and the pill went 1311 → 1299, but the sheet kept 「Creating 3 characters…」; Cancel › 「Stop and lose your credits?」 › Leave anyway 17:41:30 → [TURN] cancel_turn, final_state=cancelled: all three slots back to unset, no look kept or added to the library. Credit Details 17:40: three Text to Image −3 and three Text to Speech −1 (−12), no refund row. TC-403 (Corner Stall Rivalry, ◆8): Leave anyway landed 1 s after the turn ended, so both looks were kept. The sheet shows 「Creating…」 ~50 s after the images are done, so a user cannot tell that they finished.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Leave anyway drops finished character looks but keeps their credits
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Read the balance on the credit pill
6. Tap ✓ without setting any character
7. Tap Generate all
8. Wait 50 seconds
9. Tap Cancel
10. Tap Leave anyway
11. Tap Back until the Launcher is shown
12. Tap Mine
13. Tap Credits
14. Tap Details
15. Check the result

Result:
Leave anyway after all three images finished drops every look, yet −12 credits stay booked with no refund.
摘要：三張角色圖皆已完成後選 Leave anyway，所有外觀被丟棄，卻仍扣 12 點且未退點。
{16.8.0_amda09_creating_after_done.jpg} {16.8.0_amda09_stop_dialog.jpg} {16.8.0_amda09_all_unset.jpg} {16.8.0_amda09_ledger_12.jpg} {16.8.0_amda09_log.txt}

Expect Result:
Leave anyway keeps the characters that finished and stops only unfinished ones.
摘要：Leave anyway 應保留已完成的角色，只停止未完成者。
Spec string: 「Stop and lose your credits?」 / 「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 9 (new 10/21) board (10/16) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/07_ISS-AMDA-09/`

---

## 8. ISS-AMDA-10 — Asking to change a character: wrong question and a single chip  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-348  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-254 (PM update board 7, 10/16: 「Sure! Which character would you like to change?」 with 2–4 option chips). A2-b 18:03: Iris first says 「Updating character appearance to look older.」, then 「Which character would you like to make older?」 with ONE chip 「Leo Vance (currently 18)」 and 「More ideas」; the other two cast members appear only after More ideas. Related, not duplicate: DRA262610P0092 ([SPEC], TRCreated: AI prompts to modify characters in chat).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Asking to change a character shows a different question and a single chip
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set (no storyboard yet)
5. Type Can you change one of the characters to look older?
6. Tap Send
7. Wait for Iris's question
8. Check the result

Result:
Iris asks 「Which character would you like to make older?」 with one chip (Leo Vance) and More ideas.
摘要：Iris 的提問文案與規格不同，且只提供一個角色選項。
{16.8.0_amda10_one_chip.jpg} {16.8.0_amda10_more_ideas.jpg}

Expect Result:
Iris asks 「Sure! Which character would you like to change?」 with 2–4 character chips.
摘要：應以規格文案詢問要改哪位角色，並提供 2–4 個選項。
Spec string: 「Sure! Which character would you like to change?」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board (10/16) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/08_ISS-AMDA-10/`

---

## 9. ISS-AMDA-11 — A typed character name does not lead to the Update characters card  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-391  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-301 (PM update board 7, 10/16: a typed answer is taken like a chip and the 「Update characters」 card is offered). A2-b 18:03:51: typed 「Walter Grant」 after the question (ISS-AMDA-10): the chips and the question bubble disappeared, and Iris replied 「Retained Walter Grant and the full cast details in accordance with your target selection.」 + 「The characters look great! Ready to create the storyboard?」 with a 「Create storyboard →」 chip; no Update characters card, look unchanged, nothing charged.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A typed character name does not lead to the Update characters card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set (no storyboard yet)
5. Type Can you change one of the characters to look older?
6. Tap Send
7. Wait for Iris's question
8. Type Walter Grant
9. Tap Send
10. Check the result

Result:
Iris replies 「Retained Walter Grant…」 and offers Create storyboard; no Update characters card appears.
摘要：輸入角色名後 Iris 回覆保留角色並提供建立分鏡，未出現更新角色卡。
{16.8.0_amda11_no_update_card.jpg}

Expect Result:
A typed name is taken like a chip: Iris offers the 「Update characters」 card for that character.
摘要：輸入角色名應等同點選選項，出現該角色的「Update characters」卡。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board (10/16) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/09_ISS-AMDA-11/`

---

## 10. ISS-AMDA-12 — Character update flow shows other messages than the spec  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-349, TC-352  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-254 / R-301 (PM update board 7, 10/16: Generate → card disappears, 「Working on it...」; done: 「Here's your updated cast.」 + new Story Outline & Characters card + 「Your characters' looks are updated! Ready to create the storyboard?」). A2-b 18:01 (Bitter Cold): the card stays, 「Thinking…」 then 「Updating character configuration.」, then the new card and 「The characters look great! Ready to create the storyboard?」; no 「Here's your updated cast.」. After a storyboard (18:20) the closing reads 「Characters updated! Regenerate the storyboard to match?」. Charged once, ◆4 (correct). Related, not duplicate: DRA262610P0088 / DRA262610-0053 (stuck update, TRCreated).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character update shows other progress and result messages than the spec
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set (no storyboard yet)
5. Type Make Maya Lin a woman in her 40s
6. Tap Send
7. Tap Generate on the Update characters card
8. Wait for the new Story Outline & Characters card
9. Check the result

Result:
Iris shows 「Updating character configuration.」 and never 「Here's your updated cast.」
摘要：更新角色的進度與完成訊息與規格不同，未出現更新完成文案。
{16.8.0_amda12_updating.jpg} {16.8.0_amda12_done.jpg} {16.8.0_amda12_after_storyboard.jpg}

Expect Result:
「Working on it...」 while updating, then 「Here's your updated cast.」 and the spec closing line.
摘要：更新中應顯示「Working on it...」，完成後顯示規格的完成訊息。
Spec string: 「Working on it...」 / 「Here's your updated cast.」 / 「Your characters' looks are updated! Ready to create the storyboard?」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board (10/16) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/10_ISS-AMDA-12/`

---

## 11. ISS-AMDA-13 — Back during a chat character update leaves with no dialog  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-351  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-254 (PM update board 7, 10/16: while the update generates, Back asks 「Stop and lose your credits?」 with Leave anyway / Keep Generating). A2-b 18:01:14 (Bitter Cold, Update characters ◆4, 3 s after Generate): system Back left to the AI Mini Drama landing page at once with no dialog; the update ran on and was charged 4 (TC-349). Android Back is a spec exit path.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Back during a chat character update leaves with no stop dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are all set (no storyboard yet)
5. Type Make Maya Lin a woman in her 40s
6. Tap Send
7. Tap Generate on the Update characters card
8. Press the system Back button
9. Check the result

Result:
System Back right after Generate leaves to the landing page with no dialog; the update runs on and is charged.
摘要：更新角色生成中按系統返回直接離開，沒有確認對話框，更新仍繼續並扣點。
{16.8.0_amda13_generating.jpg} {16.8.0_amda13_left_no_dialog.jpg} {16.8.0_amda13_log.txt}

Expect Result:
Back asks 「Stop and lose your credits?」 with Leave anyway and Keep Generating.
摘要：返回應先顯示停止確認對話框（Leave anyway / Keep Generating）。
Spec string: 「Stop and lose your credits?」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 7 board (10/16) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/11_ISS-AMDA-13/`

---

## 12. ISS-AMDA-15 — Expanded description editor cuts the text to 1,000 characters  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-051  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-043 (Design 1005_Update 「Exceed word limit」, newer than PM §13.11: over-limit text is kept, counter red, Generate disabled). A2-c1 18:41: 1,050 characters (entered with setval; clipboard paste cannot be driven) are kept in the field with red 「1050/1000」, 「You've reached the 1,000-character limit.」 and Generate grey. Opening the expanded editor shows 「1000/1000」 and only the first 1,000 characters; collapsing writes the cut text back (field 1000/1000, the end 「END」 gone). Repeated 3 times.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Expanded description editor cuts text to 1,000 characters and writes it back
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap Create my character
7. Paste a 1,050-character description
8. Tap the description
9. Tap the collapse icon
10. Check the result

Result:
The expanded editor shows 1000/1000 and collapsing writes the cut text back: the last 50 characters are lost.
摘要：展開編輯器只顯示前 1,000 字，收合後寫回截斷文字，最後 50 字遺失。
{16.8.0_amda15_field_1050.jpg} {16.8.0_amda15_editor_1000.jpg} {16.8.0_amda15_written_back.jpg}

Expect Result:
All 1,050 characters stay, with red 「1050/1000」 and the limit message in the field and the editor.
摘要：1,050 字應完整保留，欄位與編輯器皆顯示紅色 1050/1000 與上限提示。
Spec string: 「You've reached the 1,000-character limit.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 3 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/12_ISS-AMDA-15/`

---

## 13. ISS-AMDA-16 — Dragging inside the description box opens the editor instead of scrolling  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-125  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-110 (Design flow arrow 2811-90468: the text scrolls within its own area). A2-c1 18:41: with 1,050 characters (more than the ~4 visible lines), three drags of different speed inside the box all opened the full-screen editor, as a tap does (and that editor then cuts the text, ISS-AMDA-15). The text cannot be scrolled in place.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Dragging inside the description box opens the editor instead of scrolling the text
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap Create my character
7. Type a description longer than four lines
8. Drag up inside the description box
9. Check the result

Result:
Every drag inside the description box opens the full-screen editor; the text never scrolls in place.
摘要：在描述框內拖曳都會開啟全螢幕編輯器，文字無法在框內捲動。
{16.8.0_amda16_long_text.jpg} {16.8.0_amda16_drag_opens_editor.jpg}

Expect Result:
Dragging scrolls the text within the box; nothing else opens.
摘要：在描述框內拖曳應捲動框內文字，不開啟其他畫面。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, flow arrow 2811-90468 (R-110) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90468
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/13_ISS-AMDA-16/`

---

## 14. ISS-AMDA-17 — Closing a generated character saves it to Mine anyway  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-057, TC-134, TC-339, TC-342, TC-401  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-248 (PM update board 11 §13.23, 10/21: only 「Save to library」 saves a generated character; a discarded result is not in Mine) and R-293. A2-c1/c2 18:47–19:05: X, swipe down and system Back each close the result at once and the slot is not changed — but every closed look shows up as the first 「Mine」 card in the library (TC-057 glasses / cream cardigan; TC-134 / TC-342 / TC-401 Daniel Reed looks; TC-339 the bob with mustard cardigan). Each cost ◆4 as expected. The missing 「Discard this character?」 dialog is DRA262610P0262 (NeedCodeReview, X only; also seen for swipe down and Back) — an existing Android ticket, not refiled; this entry is the saving.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Closing a generated character with X, swipe down or Back saves it to Mine anyway
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap Create my character
7. Type a description (e.g. Woman with a short bob and round glasses)
8. Tap Female
9. Tap White
10. Type 28 in Age
11. Tap Generate
12. Wait for the generated character
13. Tap X
14. Scroll the library to the first card
15. Check the result

Result:
After X, swipe down or Back on the result, the unsaved look is the first 「Mine」 card in the library.
摘要：以 X、下滑或返回關閉生成結果後，未儲存的外觀仍出現在 Mine 第一張。
{16.8.0_amda17_result.jpg} {16.8.0_amda17_saved_after_x.jpg} {16.8.0_amda17_saved_after_swipe.jpg} {16.8.0_amda17_saved_after_back.jpg}

Expect Result:
A closed (discarded) result is not saved; only 「Save to library」 adds it to Mine.
摘要：關閉（捨棄）的結果不應儲存，只有「Save to library」才加入 Mine。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 11 (new 10/21) board §13.23 (10/21) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, flow arrow 2811-90593 (R-119) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90593
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/14_ISS-AMDA-17/`

---

## 15. ISS-AMDA-18 — Generated character page has no Discard button  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-341  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-248 (PM update board 11 §13.23, 10/21: the result page has 「Discard」, which closes at once with no dialog, nothing saved or applied). Every generated character result in A2-c1/c2 (18:47, 18:58, 19:02, 19:03) has only X (top left), Download and 「Save to library」.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Generated character page has no Discard button
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap Create my character
7. Type a description (e.g. Woman with a short bob and round glasses)
8. Tap Female
9. Tap White
10. Type 28 in Age
11. Tap Generate
12. Wait for the generated character
13. Check the result

Result:
The generated character page has only X, Download and 「Save to library」; there is no 「Discard」 button.
摘要：角色生成結果頁只有 X、下載與「Save to library」，沒有「Discard」按鈕。
{16.8.0_amda18_no_discard.jpg}

Expect Result:
The page offers 「Discard」, which closes it at once without saving or applying the look.
摘要：結果頁應提供「Discard」，點擊後直接關閉，不儲存也不套用。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 11 (new 10/21) board §13.23 (10/21) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/15_ISS-AMDA-18/`

---

## 16. ISS-AMDA-19 — Delete character dialog body differs from the spec  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-058  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-049 (PM main flow: 「Delete this character?」 / 「This character will be permanently deleted and can't be recovered.」, Cancel / Delete). A2-c1 18:48: title and buttons match; the body reads 「This character and its images will be deleted and can't be recovered. Projects already using it are not affected.」 (Cancel tapped, nothing deleted). Related, not duplicate: DRA262610P0130 (no edit / version actions).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Delete character dialog body differs from the spec text
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your characters」
5. Tap a character slot
6. Tap a Mine character
7. Tap ⋮
8. Tap Delete
9. Check the result

Result:
The body reads 「This character and its images will be deleted and can't be recovered. Projects already…」
摘要：刪除角色對話框內文與規格不同，多了圖片與專案的說明。
{16.8.0_amda19_body.jpg}

Expect Result:
The body reads 「This character will be permanently deleted and can't be recovered.」
摘要：內文應與規格一致：角色將永久刪除且無法復原。
Spec string: 「This character will be permanently deleted and can't be recovered.」

[AI Recommendation]
Title: Delete this character?
Body: This character will be permanently deleted and can't be recovered.
Buttons: Cancel / Delete

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/16_ISS-AMDA-19/`

---

## 17. ISS-AMDA-20 — Storyboard and video jobs skip the 10/22 stage messages and charge per image  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-377, TC-405  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-279 / R-317 / R-320 / R-316 (PM Figma 10/22 §13.24, node 4422:2, RD to confirm per PM Open questions #20). Storyboard (A2-d1 19:21:37, Quiet Sanctuary ◆31): no 「I'll create a storyboard - give me a moment...」; the skeleton reads 「Thinking…」 (stage ①, pill unchanged — correct) then 「Creating your scene…」 (not 「Preparing your scenes…」 / 「Creating your storyboard…」); the pill drops 3 per image (1209, 1206 … 1181) and Credit Details books 10 Text to Image −3 + 1 Text to Speech −1 rather than one charge. Video (A2-g1 21:56:44, Workplace Romance (2)): 「Thinking…」 then 「Configuring video settings and generating video.」 (not 「I'll create a video - give me a moment...」 / 「Advancing the mini drama production.」), no 「Making your video…」 at the charge. Existing Android tickets, not this entry: the 「Create storyboard」 user bubble (DRA262610P0122 / P0197), the blank 「Here's your drama.」 card (DRA262610P0226), the 3-credit image rate (DRA262610P0198).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard and video generation skip the 10/22 stage messages and charge per image
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
7. Watch the chat and the credit pill until the storyboard is shown
8. Check the result

Result:
No 「I'll create a storyboard…」; the card reads 「Thinking…」 then 「Creating your scene…」; the pill drops per image.
摘要：分鏡生成未顯示 10/22 規格的兩階段訊息，點數逐張扣除。
{16.8.0_amda20_thinking.jpg} {16.8.0_amda20_creating_scene.jpg} {16.8.0_amda20_video_stage1.jpg} {16.8.0_amda20_video_stage2.jpg}

Expect Result:
「I'll create a storyboard - give me a moment...」, 「Preparing your scenes…」, 「Creating your storyboard…」.
摘要：應依 10/22 規格顯示兩階段訊息，於「Creating your storyboard…」時一次扣點。
Spec string: 「Preparing your scenes…」 / 「Creating your storyboard…」 / 「Advancing the mini drama production.」 / 「Making your video…」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/17_ISS-AMDA-20/`

---

## 18. ISS-AMDA-21 — Stop button stays in the input bar after Generate  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-512, TC-157  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-315 (PM Figma 10/22 §13.24, node 4422:2: 「有 Generate 的都不提供暫停」 — after any Generate the input bar shows only the mic; the RD build's ■ stop is to be removed; RD to confirm). A2-d1 19:21:38 / 19:22:08 / 19:24:31: a blue ■ stop button beside the mic during 「Thinking…」 and 「Creating your scene…」; also during video generation (A2-g1 TC-405) and the outline Generate (A2-h TC-153). Retest A2-r1 (TC-157, R-138, 10/28 12:33:19, Storm Warning Fast preview): the ■ is there in video stage ① too; a tap ends the video turn at once with no warning or message (logcat 「MyCreation cancel … calls=0」, 「turn_complete: final_state=cancelled」) and the chat shows the video settings card again; once the video is charged the ■ is gone. Nothing charged (18445 before and after). With the 10/22 rule (no stop control) the silent cancel goes away with the button. Existing Android tickets: tapping it cancels with no note (DRA262610-0049 outline, DRA262610-0057 storyboard, DRA262610P0213); typing keeps it as Stop (DRA262610P0211).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Stop button stays in the input bar after Generate (10/22: only the mic)
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
7. Look at the input bar
8. Check the result

Result:
A blue ■ stop button sits beside the mic during storyboard and video jobs; a tap cancels a video with no warning.
摘要：分鏡準備與生成期間，輸入列麥克風旁仍顯示藍色 ■ 停止鈕；影片準備時亦同，點擊即無警告取消影片。
{16.8.0_amda21_stop_stage1.jpg} {16.8.0_amda21_stop_stage2.jpg} {16.8.0_amda21_video_stop.jpg} {16.8.0_amda21_video_cancelled.jpg}

Expect Result:
After Generate the input bar shows only the mic, with no stop or pause control.
摘要：依 10/22 規格，Generate 後輸入列只顯示麥克風，不提供停止。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/18_ISS-AMDA-21/`

---

## 19. ISS-AMDA-22 — Video stage ①: every exit leaves with no Leave while we're preparing? dialog  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-515, TC-516  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-318 / R-319 (PM Figma 10/22 §13.24, node 4422:2; RD to confirm): in stage ① every exit asks 「Leave while we're preparing?」 / 「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」 with Leave anyway (red) / Stay. A2-g1 Workplace Romance (2), before the charge (pill 679): ← 21:56:45, system Back 21:57:28, History 21:57:43 and New chat 21:57:54 each left at once with no dialog; the job kept running and was charged once later (21:59:08, 2 × 60). The storyboard counterpart is DRA262610P0077 (Assigned).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Video stage ①: exits leave with no 「Leave while we're preparing?」 dialog
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your video settings」
5. Tap Generate video
6. Tap ← within 3 seconds
7. Check the result

Result:
←, system Back, History and New chat in stage ① leave at once with no dialog; the video job keeps running.
摘要：影片準備階段按返回、歷史或新聊天皆直接離開，無確認對話框。
{16.8.0_amda22_back.jpg} {16.8.0_amda22_system_back.jpg} {16.8.0_amda22_history.jpg} {16.8.0_amda22_new_chat.jpg}

Expect Result:
Each exit asks 「Leave while we're preparing?」 with the video body, 「Leave anyway」 (red) and 「Stay」.
摘要：每個離開入口應顯示準備中離開確認（Leave anyway / Stay）。
Spec string: 「Leave while we're preparing?」 / 「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2
Spec Link: AI Mini Drama Design spec, 1016_Chat navigation frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4858-34930
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/19_ISS-AMDA-22/`

---

## 20. ISS-AMDA-23 — Storyboard stage ②: Back still asks Stop and lose your credits?  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-513  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-320 / R-321 (PM Figma 10/22 §13.24, node 4422:2; RD to confirm per PM Open questions #20): leaving in stage ② shows no dialog, only the toast 「We'll keep making your storyboard. Find it in History.」, and the job finishes. A2-d1 19:22:25 (Quiet Sanctuary, 「Creating your scene…」, charging): ← showed 「Stop and lose your credits?」 with Leave anyway / Keep Generating; Keep Generating finished it, charged once (31). Leave anyway was not tapped (it would forfeit credits).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard stage ②: Back still asks 「Stop and lose your credits?」
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
7. Wait for 「Creating your scene…」
8. Tap ←
9. Check the result

Result:
In stage ② ← shows 「Stop and lose your credits?」 with Leave anyway and Keep Generating.
摘要：分鏡生成第二階段按返回仍顯示「Stop and lose your credits?」。
{16.8.0_amda23_stop_dialog.jpg}

Expect Result:
No dialog: the toast 「We'll keep making your storyboard. Find it in History.」 shows and the job finishes.
摘要：依 10/22 規格不顯示對話框，只顯示提示並在背景完成分鏡。
Spec string: 「We'll keep making your storyboard. Find it in History.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/20_ISS-AMDA-23/`

---

## 21. ISS-AMDA-24 — Storyboard stops when the app is swiped away and resumes only on reopen  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-514  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-321 (PM Figma 10/22 §13.24, node 4422:2: the job finishes even if the app is swiped away). A2-d1 Quiet Sanctuary: stage ② with 2 of 10 images charged (pill 1206), PowerDirector swiped away in Recents 19:22:51 (not running), relaunched after 60 s and the drama reopened at 19:24:14: the card showed 「Thinking…」 again; logcat 「[SYS] pending_resume detected, resuming turn」 at 19:24:14; the remaining images were dispatched only after reopening; done 19:26:27 (138 s later). Charged once (31) — correct. The characters-stage reply vanished after the resume (O-10, ISS-AMDA-29).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard stops when the app is swiped away and resumes only on reopen
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
7. Wait for 「Creating your scene…」
8. Open Recents
9. Swipe PowerDirector away
10. Wait 60 seconds
11. Launch the APP
12. Tap AI Mini Drama on the Launcher
13. Tap History
14. Tap the drama
15. Check the result

Result:
The storyboard did not continue: the card shows 「Thinking…」 again and the remaining images start only after reopening.
摘要：滑掉 App 後分鏡未在背景完成，重新開啟才繼續生成。
{16.8.0_amda24_recents.jpg} {16.8.0_amda24_thinking_again.jpg} {16.8.0_amda24_log.txt}

Expect Result:
The storyboard finishes in the background; Storyboard Result and Preview are there on return, charged once.
摘要：分鏡應在背景完成，回來時已有分鏡結果與預覽，只扣一次點數。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/21_ISS-AMDA-24/`

---

## 22. ISS-AMDA-25 — First storyboard shows one skeleton row instead of per-scene skeletons  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-389  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-299 (PM update board 6, 10/14: each scene shows a skeleton, the Location thumbnail fills before the main image, the main image keeps its width). A2-d1 Quiet Sanctuary 19:21–19:26 and Workplace Romance (2) 19:36–19:40: only one skeleton row (「Thinking…」 / 「Creating your scene…」 / 「Generating storyboard.」) until every image is done, so no scene, Location thumbnail or early location image is ever shown. The scene-update case (no skeleton on the changed scene) is DRA262610P0134 (existing Android ticket).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: First storyboard shows one skeleton row instead of per-scene skeletons
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
7. Watch the storyboard area until it finishes
8. Check the result

Result:
The first storyboard shows one skeleton row until every image is done; no scene or Location thumbnail appears early.
摘要：首次分鏡生成只顯示一列骨架，直到全部完成才出現場景與地點縮圖。
{16.8.0_amda25_single_row.jpg} {16.8.0_amda25_update_no_skeleton.jpg}

Expect Result:
Each scene shows its skeleton, then its Location image before the main image; the main image keeps its width.
摘要：每個場景應有骨架，地點縮圖先於主圖出現，主圖寬度不變。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 6 (Error) board (10/14) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/22_ISS-AMDA-25/`

---

## 23. ISS-AMDA-27 — Saved dramas reopen at the outline instead of their latest stage  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-113  ·  **Reproduce:** 2/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-098 (Design Recent Task: each drama reopens at its latest stage). A2-e 21:2x: Bitter Cold (storyboard + 「Characters updated!…」 ◆19 card) and Quiet Sanctuary (video + full episode, 「Create Next Episode」) open at the top of the outline / Characters Result with ↓ shown; their storyboard / video stage is reached only with ↓. Corporate rivals (storyboard + video settings) opens at the bottom, as expected. iOS lead DRI261896P0032 (iOS, closed) reproduces on Android. The lost cast / characters card is ISS-AMDA-28.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard and video dramas reopen at the outline, not their latest stage
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished video
5. Check the result

Result:
Storyboard- and video-stage dramas reopen at the top of the outline with ↓ shown, not at their latest stage.
摘要：已有分鏡或影片的劇從歷史開啟時停在大綱頂部，而非最新階段。
{16.8.0_amda27_storyboard_drama.jpg} {16.8.0_amda27_video_drama.jpg}

Expect Result:
Each drama reopens at its latest stage (the storyboard or the video), at the bottom of the chat.
摘要：每部劇應開啟在最新階段（分鏡或影片），即聊天底部。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/23_ISS-AMDA-27/`

---

## 24. ISS-AMDA-28 — Reopened dramas lose their confirmed cast and characters card  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-113, O-8  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-098 (Design Recent Task: reopens at its latest stage) and R-139 (nothing saved is lost without notice). O-8 (A2-d1 19:44–19:45): The Final Reel (cast set, Create storyboard ◆31 offered) and Corner Stall Rivalry (cast set, ◆25 offered) reopen ending in 「Ready to create your characters?」/「Choose your characters」 with every slot empty and no storyboard card. TC-113 (A2-e): Corner Stall Rivalry again with every slot empty; Quiet Hours (outline + 「Choose your characters」, slots unset) reopens with only the Story Outline card — the characters card is gone, so the drama cannot continue from the chat. Looks were paid for (Corner Stall: ◆8).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Reopened dramas lose the confirmed cast and the characters card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose cast was confirmed but has no storyboard yet
5. Check the result

Result:
Reopened dramas show every character slot empty and no storyboard offer; one loses the Choose your characters card.
摘要：從歷史重開劇時已確認的角色全部清空、建立分鏡卡消失，甚至選角卡不見。
{16.8.0_amda28_final_reel_empty.jpg} {16.8.0_amda28_corner_stall_empty.jpg} {16.8.0_amda28_quiet_hours_no_card.jpg}

Expect Result:
A reopened drama keeps its confirmed cast and its last card, so the user continues where they left.
摘要：重開劇應保留已確認的角色與最後一張卡片，可從原處繼續。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/24_ISS-AMDA-28/`

---

## 25. ISS-AMDA-29 — Chat loses earlier messages after reopen, Stop or resume  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-160, TC-162, TC-155, O-10, O-20  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-139 (leaving and returning keeps the task; nothing saved is lost without notice). TC-160 (A2-h 01:12, Storm Warning): reopened from History the chat starts at 「Story Outline Result」; the idea bubble, the format answer bubble and Iris's closing line are gone. TC-162 (01:27): after the characters, Iris's replies and two user bubbles are gone. TC-155 (01:14:42): Stop on a revision removed the 「Ready to create your characters?」 card above it (not in the page source). O-10 (A2-d1): after a resumed storyboard the characters-stage reply is gone. O-20 (A2-g3 00:27, Boardroom Rivals): the thread restarts at 「Story Outline & Characters Result」 and the template opening, earlier user bubbles and earlier video cards (preview, full episode, scene 2 regeneration) are gone. The Stop-without-notice part of TC-155 is DRA262610-0049 (existing Android ticket).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Chat loses earlier messages and cards after a reopen, a Stop or a resume
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with several chat turns
5. Scroll to the top
6. Tap ←
7. Tap History
8. Tap the same drama
9. Scroll to the top
10. Check the result

Result:
The reopened chat starts at the Story Outline card: the idea, format answers, earlier user bubbles and replies are gone.
摘要：重新開啟後聊天從大綱卡開始，先前的點子、格式回覆、使用者訊息與回覆都消失。
{16.8.0_amda29_before_leaving.jpg} {16.8.0_amda29_after_reopen_top.jpg} {16.8.0_amda29_characters_stage.jpg} {16.8.0_amda29_card_gone_after_stop.jpg}

Expect Result:
A reopened chat shows every earlier message and card; nothing is removed without notice.
摘要：重新開啟的聊天應保留所有先前訊息與卡片，不應無提示地消失。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/25_ISS-AMDA-29/`

---

## 26. ISS-AMDA-30 — Scroll-to-bottom button sits at the bottom centre  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-374  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-274 (Design main flow, REQ-032: ↓ at the bottom right while scrolled up). A2-e El compás del regreso: button_mini_drama_scroll_bottom at 494,2071 (92×92 px), centre x 540 of 1080 — the bottom centre. Tapping it scrolled to the newest message and hid it (correct). iOS P9 shows it bottom right.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Scroll-to-bottom button sits at the bottom centre instead of the bottom right
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished storyboard
5. Scroll up two screens
6. Check the result

Result:
The ↓ button shows at the bottom centre of the chat.
摘要：↓ 按鈕顯示在聊天底部中央。
{16.8.0_amda30_centre.jpg}

Expect Result:
↓ shows at the bottom right of the chat, as in the Design main flow.
摘要：↓ 按鈕應位於右下角，與設計稿一致。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, Main flow board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/26_ISS-AMDA-30/`

---

## 27. ISS-AMDA-31 — Sent message is not moved to the top; the view follows the reply  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-344  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-250 (PM 1002 update §13.2, 10/20: the sent message moves to the top; the reply generates below without the view following; ↓ appears when it runs past the screen). A2-e El compás del regreso: 1 s after Send the bubble sits mid-screen (y≈1,350–1,560 of 2,520) with 「Thinking…」 below; when the reply and card land (23 s) the view follows them to the bottom and no ↓ appears. Related: DRA262610P0125 (Assigned) asks the opposite (auto-scroll to the newest message, an older rule); PM 10/20 §13.2 is newer.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Sent message is not moved to the top and the view follows the reply
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished storyboard
5. Type Please update the image for Scene 2 so Mateo holds the guitar case
6. Tap Send
7. Watch the chat until the reply is shown
8. Check the result

Result:
After Send the bubble stays mid-screen and the view follows the reply to the bottom; no ↓ appears.
摘要：送出後訊息停在畫面中間，畫面跟著回覆捲到底，未出現 ↓。
{16.8.0_amda31_after_send.jpg} {16.8.0_amda31_followed_reply.jpg}

Expect Result:
The sent message moves to the top; the reply generates below without the view following; ↓ shows if it overflows.
摘要：送出的訊息應移到頂部，回覆在下方生成且畫面不跟隨，超出時顯示 ↓。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board §13.2 (10/20) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/27_ISS-AMDA-31/`

---

## 28. ISS-AMDA-32 — Returning from History, Choose Character or Full Edit keeps the old scroll position  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-101, TC-102, TC-311  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-089 / R-173 (PM 1002 update §13.2 as changed 10/20: after History, Character Library or Full Edit the chat opens at the bottom, replacing 「keep the position」). A2-e: History ← and system Back (TC-101), Choose Character › Cancel (TC-102); A2-g3: Full Edit › Back (TC-311): each time the chat came back at the earlier scrolled-up position with ↓ shown. iOS lead DRI261896P0029 (iOS, TRCreated) asked for the old rule.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Returning from History, Choose Character or Full Edit keeps the old scroll position
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished storyboard
5. Scroll up to the outline card
6. Tap History
7. Tap ←
8. Check the result

Result:
Coming back from History, Choose Character or Full Edit, the chat stays at the earlier scrolled-up position.
摘要：從歷史、選角或完整編輯返回時，聊天停在先前捲動的位置。
{16.8.0_amda32_history.jpg} {16.8.0_amda32_choose_character.jpg} {16.8.0_amda32_full_edit.jpg}

Expect Result:
The chat opens at the bottom (newest message) after History, Character Library or Full Edit.
摘要：依 10/20 規格，返回後聊天應顯示在底部（最新訊息）。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/28_ISS-AMDA-32/`

---

## 29. ISS-AMDA-33 — History thumbnail shows a character look instead of the first storyboard frame  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-106  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-093 (PM 0930 updates: once a storyboard exists the thumbnail is its first frame). A2-e: Quiet Sanctuary (storyboard + videos) shows a close-up of Maya Lin's character look (green sweater), not Scene 1 (a wide bookshop shot); El compás del regreso correctly shows its Scene 1 frame. The template title 「Workplace Romance (2)」 on the same page is DRA262610-0063 (ProposeNAB).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: History thumbnail shows a character look instead of the first storyboard frame
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Look at the card of a drama with a storyboard and videos
5. Check the result

Result:
Quiet Sanctuary's History thumbnail is Maya Lin's character close-up, not its first storyboard frame.
摘要：Quiet Sanctuary 的歷史縮圖是角色特寫，不是第一張分鏡畫面。
{16.8.0_amda33_history.jpg} {16.8.0_amda33_scene1.jpg}

Expect Result:
Once a storyboard exists the History thumbnail is its first frame.
摘要：已有分鏡時，歷史縮圖應為第一張分鏡畫面。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 0930 updated board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/29_ISS-AMDA-33/`

---

## 30. ISS-AMDA-34 — Opening a drama without changing it moves it to the top of History  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** O-13  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-094 (PM update board 4: only new content, regeneration, Rename and Full Edit count as modifications). O-13 (A2-e): opening Corner Stall Rivalry, tapping ↓, scrolling, opening Choose Character from a slot and closing it with Cancel (nothing picked or sent) moved it to the top with a new time and size (05:37 PM, 4.3 MB → 09:22 PM, 4.4 MB). Opening, scrolling, playing and downloading alone (Quiet Sanctuary, Bitter Cold, Workplace Romance (2)) did not.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Opening a drama and cancelling Choose Character moves it to the top of History
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap an older drama at 「Choose your characters」
5. Tap a character slot
6. Tap Cancel
7. Tap ←
8. Tap History
9. Check the result

Result:
Opening a drama and closing Choose Character with Cancel moves it to the top of History with a new time.
摘要：只開啟劇並取消選角，劇就移到歷史最上方且時間更新。
{16.8.0_amda34_before.jpg} {16.8.0_amda34_moved_to_top.jpg}

Expect Result:
Only new content, regeneration, Rename and Full Edit move a drama to the top with a new time.
摘要：只有新增內容、重新生成、重新命名與完整編輯才應更新排序與時間。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/30_ISS-AMDA-34/`

---

## 31. ISS-AMDA-35 — No balance-after line under Generate  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-115  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-100 (Design MX link frames: 「You'll have 160 left」 under Generate; Design outranks PM's confirm step). A2-f: the El compás del regreso video settings card (◆120, balance 679) and the Bitter Cold Create storyboard card (◆19) show only the price and the button. Tapping Generate charges without a confirmation (correct, A2-d1 19:57:15).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Video and storyboard cards show no 「You'll have N left」 line under Generate
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your video settings」
5. Look under Generate video
6. Check the result

Result:
Under Generate video the card shows only ◆120; there is no 「You'll have N left」 line (also on Create storyboard).
摘要：Generate 下方只顯示價格，沒有「You'll have N left」剩餘點數。
{16.8.0_amda35_video_card.jpg} {16.8.0_amda35_storyboard_card.jpg}

Expect Result:
A line 「You'll have N left」 under Generate shows the balance after this action.
摘要：Generate 下方應顯示「You'll have N left」，告知扣點後的餘額。
Spec string: 「You'll have 160 left」 (Design MX link frame example)

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, MX Spec Link board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/31_ISS-AMDA-35/`

---

## 32. ISS-AMDA-37 — Scene video update: no Updating line and the old card is not replaced  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-144, TC-145, TC-096  ·  **Reproduce:** 4/4  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-129 / R-130 (Design flow arrows 4006-73627 / 4006-73628) and R-283 / R-085: while a scene video regenerates the old card stays with 「Updating 1 scene... Your video will refresh when it's done.」; when done the chat replaces the old video and shows 「Your video has been updated.」. Android has no scene editor on a finished clip, so the update was started from the chat (「In the video, change scene 3 only…」 › 「Create the full episode (15 sec)」 ◆33 / ◆30). A2-g2 23:44–23:49 and A2-g3 00:15–00:21, 00:32–00:38 (Corporate rivals / Boardroom Rivals): no line under the old card; each finished update appends a new 「Here's your drama.」 card + 「Ready for the next episode?」 below the bubbles, the old card stays, and 「Your video has been updated.」 never appears. Related: DRA262610P0038 (Regenerate Clip failure).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Scene video update shows no Updating line and appends a new card
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Type In the video, change scene 3 only: Lauren turns her chair to the window
6. Tap Send
7. Tap Generate on the Create the full episode card
8. Read the line under the old video card
9. Wait until the update finishes
10. Check the result

Result:
No 「Updating 1 scene...」 under the old video; when done a new card is appended and no 「Your video has been updated.」
摘要：場景影片更新時舊卡下無「Updating 1 scene...」，完成後新增卡片而非取代，也無更新提示。
{16.8.0_amda37_no_updating_line.jpg} {16.8.0_amda37_new_card_appended.jpg} {16.8.0_amda37_no_updated_message.jpg}

Expect Result:
The old card shows 「Updating 1 scene...」, then is replaced by the new video with 「Your video has been updated.」
摘要：更新中舊卡應顯示「Updating 1 scene...」，完成後取代舊影片並提示已更新。
Spec string: 「Updating 1 scene... Your video will refresh when it's done.」 / 「Your video has been updated.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, flow arrow 4006-73627 (R-129) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4006-73627
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, flow arrow 4006-73628 (R-130) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4006-73628
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/32_ISS-AMDA-37/`

---

## 33. ISS-AMDA-38 — Download during a scene video update saves the old clips at once  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-096  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-085 / R-281 (PM 1002 update: while the video updates, download shows 「Your video is still updating. Try again when it's done.」). A2-g2 23:44 (Corporate rivals, scene 2 regenerating): the old video card's download icon saved at once with 「Saved to your device.」 (4 old clips written to Movies/…/Mini Drama). Export Full Video stayed enabled too — that part is DRA262610P0192 (Assigned). iOS lead DRI261895P0028 is iOS.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Download during a scene video update saves the old clips at once
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Type In the video, change scene 2 only: Lauren stands up from her chair
6. Tap Send
7. Tap Generate on the Create the full episode card
8. Tap the old video card
9. Tap the download icon
10. Check the result

Result:
While a scene regenerates, download saves the old clips at once with 「Saved to your device.」
摘要：場景重新生成中點下載，立即儲存舊片段並顯示已儲存。
{16.8.0_amda38_saved_old.jpg}

Expect Result:
Download shows 「Your video is still updating. Try again when it's done.」 and saves nothing.
摘要：更新中下載應顯示「Your video is still updating…」且不儲存。
Spec string: 「Your video is still updating. Try again when it's done.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 1002 update board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/33_ISS-AMDA-38/`

---

## 34. ISS-AMDA-39 — Video player opens paused and needs a second tap  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-143  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-128 (Design flow arrow 2820-115460: Play opens the scene-video player and plays). A2-g2 23:06 (Corporate rivals full episode): the player opens on the first frame with ▶ and starts only after the video is tapped again; same on the result page later. Build check: TR261021-0082 RD Note (2610212).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Play on the video card opens the player paused; it needs a second tap
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Tap Play on the video card
6. Check the result

Result:
Play on the video card opens the player on the first frame; it plays only after a second tap.
摘要：點影片卡的播放後播放器停在第一格，需再點一次才播放。
{16.8.0_amda39_paused.jpg}

Expect Result:
Play opens the scene-video player and starts playback.
摘要：點播放應開啟播放器並直接播放。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama Design spec, flow arrow 2820-115460 (R-128) - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-115460
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/34_ISS-AMDA-39/`

---

## 35. ISS-AMDA-40 — Renaming a drama during a video job: push uses the old name, no toast  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-308  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-171 (PM update board 4 §6.4: the toast and the push use the new name). A2-g3: Corporate rivals renamed 「Boardroom Rivals」 (00:16:20) while its scene 3 video regenerated (Generate 00:15:06); the video finished 00:21:37 and the push (logcat FCM 00:21:23) read 「"Corporate rivals" is done. Tap to watch it.」; no 「Good news!」 toast on the landing page (waited to 00:25:56) or the Launcher. A second video started after the rename used the new name in both. The name is taken when a generation starts.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Renaming a drama during a video job: the push uses the old name and no toast shows
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Type In the video, change scene 3 only: Lauren turns her chair to the window
6. Tap Send
7. Tap Generate on the Create the full episode card
8. Tap History
9. Tap ⋮ on the drama
10. Tap Rename
11. Type Boardroom Rivals
12. Tap OK
13. Tap ←
14. Wait on the landing page until the video finishes
15. Check the result

Result:
The push reads 「"Corporate rivals" is done.」 (the old name) and no 「Good news!」 toast shows.
摘要：生成中改名後，推播仍用舊名且未顯示「Good news!」提示。
{16.8.0_amda40_renamed.jpg} {16.8.0_amda40_log.txt}

Expect Result:
The push and the 「Good news!」 toast use the new name.
摘要：推播與提示應使用新名稱。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board Bug 0016 §6.4 - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/35_ISS-AMDA-40/`

---

## 36. ISS-AMDA-41 — Leaving the export page cancels the export  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-517, TC-168  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-323 / R-306 (PM Figma 10/22 export states, node 4418:2, RD to confirm: ← and system Back stay enabled during Export Full Video, the export keeps running in the background and 「Saved to Gallery.」 shows on the current page; fallback if RD keeps it in the foreground: 「Stop exporting?」 with Keep exporting / Stop). A2-g3 23:58:59 / 00:01:13 and A2-h 01:52:52: system Back on the producing page shows 「Are you sure you want to leave?」 / 「Producing video… 20%」 with Cancel / OK — neither behaviour; OK returns to the chat and cancels the export (no file after 2 min, no 「Saved to Gallery.」). The export sheet and full-screen page are DRA262610P0243 / P0219 (existing Android tickets).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Leaving the export page asks to leave and cancels the export
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Tap the video card
6. Tap Export Full Video
7. Tap Produce
8. Press the system Back button
9. Tap OK
10. Wait 2 minutes
11. Check the result

Result:
Back on the producing page asks 「Are you sure you want to leave?」; OK cancels the export and nothing is saved.
摘要：匯出中按返回出現「Are you sure you want to leave?」，按 OK 會取消匯出。
{16.8.0_amda41_leave_dialog.jpg} {16.8.0_amda41_back_in_chat.jpg} {16.8.0_amda41_again_h.jpg}

Expect Result:
Back stays enabled, the export runs on in the background and 「Saved to Gallery.」 shows on the current page.
摘要：匯出中可返回，匯出在背景繼續並於當前頁顯示「Saved to Gallery.」。
Spec string: 「Saved to Gallery.」 / fallback 「Stop exporting?」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec, Figma 10/22 update (Export Full Video states) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2
Spec Link: AI Mini Drama Design spec, 1016_Chat navigation frame - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4858-34930
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/36_ISS-AMDA-41/`

---

## 37. ISS-AMDA-42 — Export pages show another drama's thumbnail  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-343, O-21  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-249 / R-324 (PM: the export shows the drama being exported). A2-g3 23:58 (Corporate rivals): the producing page and the 「Saved to Gallery」 page show the 夜市轉角的心動對決 night-market thumbnail (the previous export); the file itself is Corporate rivals (Corporate_rivals.mp4, 90.3 s). The sheet and full-screen page themselves are DRA262610P0243 / P0219 (existing Android tickets).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Export producing and done pages show another drama's thumbnail
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama with a finished full episode
5. Tap the video card
6. Tap Export Full Video
7. Tap Produce
8. Look at the thumbnail
9. Check the result

Result:
The producing and 「Saved to Gallery」 pages show the previous export's thumbnail, not the drama being exported.
摘要：匯出進度頁與完成頁顯示前一部劇的縮圖。
{16.8.0_amda42_producing.jpg} {16.8.0_amda42_done.jpg}

Expect Result:
The export pages show the thumbnail of the drama being exported.
摘要：匯出頁應顯示正在匯出的劇的縮圖。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 10 (new 10/21) board (10/20) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama PM spec, Figma 10/22 update (Export Full Video states) - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/37_ISS-AMDA-42/`

---

## 38. ISS-AMDA-43 — Generation waits exceed 10 s with only Stop or leaving possible  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-169, TC-171, TC-172, TC-174, TC-173  ·  **Reproduce:** 5/5  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-140 (wait thresholds, user rule 2026-10-15: no wait with only leaving possible lasts over 5 s without an animation or 10 s with one; the same rule backs iOS DRI261895P0029 and DRI261897P0008, both Assigned). A2-h, timed from MiniDramaPerf turn_end: outline 27.3 s (01:11:36–01:12:03), a revision 52 s (01:13:23–01:14:15), a storyboard 323 s (01:31:23–01:36:47) and an export 119 s (01:50:15–01:52:18, progress ring) — each behind a skeleton or spinner with no other action. Retest A2-r1 (TC-173, 10/28, Shared Shelter, French, No captions): Fast · Full Video - 90 sec ◆180 took 845 s (Generate 11:25:15 → turn_end 11:39:20; 「Here's your drama.」 over a shimmering placeholder from ~11:27), and the cast ✓ → storyboard card stretch was 79 s with nothing but the outline on screen (no animation). iOS lead DRI261895P0031 (video blocks useful actions beyond 10 s). The one-character wait (TC-170, 109 s) is left out: an existing Android ticket covers it (dedupe per OS, user 2026-10-28; dedupe.txt). Spec Link names the screens; the threshold is the team's wait rule, so RD may forward it to PM.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Generation waits exceed 10 seconds with only Stop or leaving possible
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
9. Time the wait until the Story Outline card shows
10. Check the result

Result:
Waits with only Stop or leaving last 27–323 s (outline, revision, export, storyboard) and 845 s for a full video.
摘要：大綱 27 秒、修改 52 秒、分鏡 323 秒、匯出 119 秒、完整影片 845 秒期間只能停止或離開。
{16.8.0_amda43_outline_wait.jpg} {16.8.0_amda43_storyboard_wait.jpg} {16.8.0_amda43_export_wait.jpg} {16.8.0_amda43_video_wait.jpg} {16.8.0_amda43_log.txt}

Expect Result:
No wait with only Stop or leaving lasts over 10 s with an animation (5 s without one).
摘要：只能等待的時間有動畫時不應超過 10 秒（無動畫 5 秒）。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Main flow board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/38_ISS-AMDA-43/`

---

## 39. ISS-AMDA-45 — First video on a fresh install shows no Get notified pre-prompt  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-081  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-070 / R-167 (PM 0930 updated board; board notes l.85: on the first video request 「Get notified when your video is ready?」 with Notify me (then the system permission on Android 13+) / Not now (never shown again)). Retest A2-r2d 10/28: fresh install (13:07 adb uninstall + install of the TR261021-0082 APK, 16.8.0 / 2610212; 13:41 pm clear with testserver.config in place, so Stage with the yellow Launcher bar), signed in 「ethan.hsu.cl」 (Free), no video generated on this install. Glad We Came template, storyboard ◆31, Fast · Preview - 30 sec ◆60, Generate video 13:56:23: no pre-prompt; the chat went straight to the 「Fast · Preview - 30 sec」 bubble and 「Thinking…」; logcat has only 「[DECISION] pre-approved 'storyboard': {VIDEO=2}」, no notification line. The second video (Love, Unscripted, 14:16:25) had none either. Android 12; PowerDirector notifications are on by default (dumpsys notification). TC-303 (Notify me) and TC-304 (Not now, not again) are Blocked behind this. iOS lead DRI261895P0022 (same symptom); no Android ticket in the read-only dedupe (DRA262610P0250 / P0267 are about the 「Your drama is ready」 push itself).

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: First video on a fresh install skips the 「Get notified」 pre-prompt
```

**Description:**

```
Repro Steps:
1. Uninstall PowerDirector
2. Install PowerDirector 16.8.0 (2610212)
3. Launch the APP
4. Sign in
5. Tap AI Mini Drama on the Launcher
6. Tap the Glad We Came template
7. Tap Make my version
8. Tap English
9. Tap Yes, include captions
10. Tap Generate
11. Wait for the Create storyboard card
12. Tap Generate on the Create storyboard card
13. Wait for the Storyboard Preview
14. Tap Fast
15. Tap Preview - 30 sec
16. Tap Generate video
17. Check the result

Result:
The first Generate video goes straight to 「Thinking…」 with no notification pre-prompt (nor on the second video).
摘要：安裝後第一次產生影片直接進入「Thinking…」，未顯示通知預先提示（第二支影片亦無）。
{16.8.0_amda45_video_settings.jpg} {16.8.0_amda45_no_preprompt.jpg} {16.8.0_amda45_log.txt}

Expect Result:
The first Generate video shows 「Get notified when your video is ready?」 with 「Notify me」 and 「Not now」.
摘要：首次產生影片時應先顯示通知預先提示（Notify me / Not now）。
Spec string: 「Get notified when your video is ready?」 / 「Videos take a few minutes. We'll let you know as soon as yours is done.」

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), 0930 updated board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/39_ISS-AMDA-45/`

---

## 40. ISS-AMDA-46 — History opens an empty new chat for about 2 minutes after leaving a video job  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-166  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.8.0.2610212

> **QA note — not pasted into eBug.** R-139 (leave-and-return rule) with R-071 (PM main flow: leaving while a video generates → 「We'll keep making your video. Find it in History.」, the video keeps generating) and R-025 (reopening returns to the latest step). Retest A2-r1 10/28, Storm Warning: Generate video Fast · Preview - 30 sec at 12:28:54, ← to the AI Mini Drama landing and ← to the Launcher at 12:29:16 (no dialog), back into AI Mini Drama 12:29:37. History lists Storm Warning (12:28 PM), but tapping its row at 12:29:45, 12:30:20 and 12:30:50 — and the Accords nocturnes row — opened the empty 「Hi, I'm your AI Drama Assistant」 page. logcat: 「agent_destroy … native=125748ms」 then 「agent_create FAILED」 at 12:31:16; after leaving again 「[PRUNE] pruned 1 unfinished session(s)」 (12:31:18), and History › Storm Warning then opened at the video stage (12:31:36; 「restored approval for interrupted turn: {VIDEO=2}」, 「pending_resume detected, resuming turn」). Nothing charged (18445). That the job did not run on while away is DRA262610P0026 (NewCreated), not this entry.

**Short Description:**

```
PDR-A 16.8.0 - [AIAgent] AI Mini Drama: History opens an empty new chat for about 2 minutes after leaving a video job
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama at 「Choose your video settings」
5. Tap Generate video
6. Tap ←
7. Tap ← on the AI Mini Drama page
8. Tap AI Mini Drama on the Launcher
9. Tap History
10. Tap the same drama
11. Check the result

Result:
For about 2 minutes every History row opens the empty 「Hi, I'm your AI Drama Assistant」 page instead of the drama.
摘要：離開影片生成後約 2 分鐘內，點歷史中的任何劇集都只開啟空白新聊天頁。
{16.8.0_amda46_generating.jpg} {16.8.0_amda46_history.jpg} {16.8.0_amda46_empty_chat.jpg} {16.8.0_amda46_reopened_later.jpg} {16.8.0_amda46_log.txt}

Expect Result:
The drama opens at its video stage with the video still in progress, as History lists it.
摘要：應開啟該劇集並停在影片階段，影片仍在進行中。

Note:
Device: Sony Xperia 10 III (XQ-BT52) / Android 12
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Main flow board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama PM spec (AI Mini Drama - PM Spec 20261021.pdf), Update board 4 board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Spec Link: AI Mini Drama Design spec, Recent Task board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0_images/40_ISS-AMDA-46/`

---

## Held — PM questions and items not drafted

| Item | Kind | Why held / what to decide |
|---|---|---|
| TC-478 | question (PM) | Create my character opens with nothing prefilled from the outline (Gender, Age). The spec has no prefill rule (R-141 open item); DRA262610P0225 (NewCreated) is waiting for a PM ruling. |
| TC-479 | question (PM) | Preview and full-episode result cards carry no type / length label, and the preview card is gone once the full episode exists. No card label is in the spec; DRA262610P0227 (NewCreated) is waiting for a PM ruling. |
| TC-159 | question (PM) | Back during the first outline shows 「Leave this chat?」/「…this chat won't be saved.」 and Leave anyway discards it, so the running outline cannot be left and resumed (the row's 'same task at that stage'). The loss is announced; PM to say whether a first outline may be discarded this way (same as iOS P9). |
| TC-161 | question (PM) | Back during a character generation shows 「Stop and lose your credits?」 and Leave anyway stops it (nothing dispatched, nothing charged; the Clara pick is lost after 「Leave without finishing?」). PM update board 9 (10/16) specifies exactly that dialog for characters, while the row (R-139, QA leave-and-return rule) and the run note (§13.24, which covers storyboard and video only) expect it to keep running. Spec conflict for PM. |
| TC-467 | question (PM) | Retest (The New Guy's Secret, Export Full Video, 1080×1920): narration captions are white bold with a black outline, two lines across ~70–80 % of the width, ~5 % of the frame height per line — not visibly smaller than before. The spec gives no caption size; the row's note waits for a PM ruling on the 'smaller default font in balance with the frame'. |
| TC-158 | question (PM) | An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row; no spec says a typed draft is kept (iOS P9 held the same as a PM question). |
| O-11 | held (single sighting, no frame) | After leaving a chat storyboard update in stage ①, reopening showed the Create storyboard ◆3 card with Generate again; a second Generate made no second pre-approval and only ◆3 was charged. No frame of the reopened state (tc294-before is the pre-Generate card); recheck in the next run before drafting. |

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-3 | Library picks land on the wrong look after the library grows (new looks shift the grid) | Test-data note: screenshot before every library tap. |
| O-6 | A character generation stopped within ~2 s is not charged; stopped after dispatch it costs ◆4 | Matches the spec (「the credits you've spent won't be refunded」). |
| O-7 | A character Download adds a PNG to the gallery and shifts Add Media picks | Test-data note. |
| O-9 | Template storyboard approved under the 'character' label in the log | Log label only; Credit Details books the right rows. Mentioned to RD in ISS-AMDA-20's context, not raised. |
| O-17 | Create Next Episode left a pending 「Quiet Sanctuary (1)」 entry | Was resumed and used later (TC-321/473 Pass). |
| O-19 | Restarting UiAutomator2 brought PowerDirector up on a Full Edit timeline with a PiP toast | Test tooling (Appium relaunch), not the app. |
| O-27 | After the fresh install's first launch on Production, switching to Stage (testserver.config) made every signed-out turn fail with 403 「Fail to verify uuid」 | Test-setup artefact (credit UUID minted on Production); pm clear with the config in place fixed it. Recorded in the skill's Android server notes. |
| Blocked (124) | 3 defect, 57 observability, 64 test-data | No verdict: no fault switches on Android 16.8 (planned for a later build), new account, no daily chat limit on Stage (TC-224 too: no remaining-chat count), language, paid tier, purchases, template full generation (REQ-019); TC-303 / TC-304 behind ISS-AMDA-45. The credit and uninstall blocks were cleared by the 10/28 retest. Grouped in the run's report.md and on the review page. |

## Reconciliation against the report

The run is the report: 130 Fail (126 defect, 4 question), 124 Blocked (no verdict), observations O-1…O-27 (27).

| Step | Count | Running total |
|---|---|---|
| Fail rows + observations | 157 | 157 |
| → matches an existing Android ticket only (dedupe.txt, not listed) | −76 | 81 |
| → held (PM question, single sighting) | −7 | 74 |
| → not a bug | −7 | 67 |
| → merged: 67 items share 40 defects | −27 | **40 entries** |

### Row-by-row map

| Item | Result | Disposition | Became |
|---|---|---|---|
| TC-014 | Fail | defect | 1. ISS-AMDA-01 |
| TC-024 | Fail | defect | 2. ISS-AMDA-02 |
| TC-036 | Fail | defect | 3. ISS-AMDA-03 |
| TC-410 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-039 | Fail | defect | 4. ISS-AMDA-05; Android duplicate (dedupe.txt only) |
| TC-040 | Fail | defect | 4. ISS-AMDA-05 |
| TC-044 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-045 | Fail | defect | 5. ISS-AMDA-07 |
| TC-121 | Fail | defect | 6. ISS-AMDA-08 |
| TC-337 | Fail | defect | 7. ISS-AMDA-09 |
| TC-403 | Fail | defect | 7. ISS-AMDA-09 |
| TC-348 | Fail | defect | 8. ISS-AMDA-10 |
| TC-391 | Fail | defect | 9. ISS-AMDA-11 |
| TC-349 | Fail | defect | 10. ISS-AMDA-12 |
| TC-350 | Fail | defect | 5. ISS-AMDA-07 |
| TC-351 | Fail | defect | 11. ISS-AMDA-13 |
| TC-352 | Fail | defect | 10. ISS-AMDA-12 |
| TC-047 | Fail | defect | 4. ISS-AMDA-05 |
| TC-478 | Fail | question | held: question (PM) |
| TC-469 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-051 | Fail | defect | 12. ISS-AMDA-15 |
| TC-057 | Fail | defect | 14. ISS-AMDA-17; Android duplicate (dedupe.txt only) |
| TC-058 | Fail | defect | 16. ISS-AMDA-19 |
| TC-125 | Fail | defect | 13. ISS-AMDA-16 |
| TC-126 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-407 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-408 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-134 | Fail | defect | 14. ISS-AMDA-17; Android duplicate (dedupe.txt only) |
| TC-289 | Fail | defect | 3. ISS-AMDA-03; Android duplicate (dedupe.txt only) |
| TC-383 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-339 | Fail | defect | 14. ISS-AMDA-17; Android duplicate (dedupe.txt only) |
| TC-340 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-341 | Fail | defect | 15. ISS-AMDA-18 |
| TC-342 | Fail | defect | 14. ISS-AMDA-17; Android duplicate (dedupe.txt only) |
| TC-401 | Fail | defect | 14. ISS-AMDA-17; Android duplicate (dedupe.txt only) |
| TC-060 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-377 | Fail | defect | 17. ISS-AMDA-20; Android duplicate (dedupe.txt only) |
| TC-512 | Fail | defect | 18. ISS-AMDA-21 |
| TC-061 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-398 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-399 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-062 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-359 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-513 | Fail | defect | 20. ISS-AMDA-23 |
| TC-514 | Fail | defect | 21. ISS-AMDA-24 |
| TC-063 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-389 | Fail | defect | 22. ISS-AMDA-25 |
| TC-070 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-072 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-385 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-073 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-458 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-074 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-443 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-494 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-282 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-496 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-294 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-374 | Fail | defect | 26. ISS-AMDA-30 |
| TC-419 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-101 | Fail | defect | 28. ISS-AMDA-32 |
| TC-102 | Fail | defect | 28. ISS-AMDA-32 |
| TC-106 | Fail | defect | 29. ISS-AMDA-33; Android duplicate (dedupe.txt only) |
| TC-108 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-111 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-113 | Fail | defect | 23. ISS-AMDA-27; 24. ISS-AMDA-28 |
| TC-498 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-344 | Fail | defect | 27. ISS-AMDA-31 |
| TC-501 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-115 | Fail | defect | 31. ISS-AMDA-35 |
| TC-079 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-080 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-081 | Fail | defect | 39. ISS-AMDA-45 |
| TC-405 | Fail | defect | 17. ISS-AMDA-20; Android duplicate (dedupe.txt only) |
| TC-515 | Fail | defect | 19. ISS-AMDA-22 |
| TC-516 | Fail | defect | 19. ISS-AMDA-22 |
| TC-482 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-085 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-484 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-086 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-479 | Fail | question | held: question (PM) |
| TC-417 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-423 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-506 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-510 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-422 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-090 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-485 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-096 | Fail | defect | 32. ISS-AMDA-37; 33. ISS-AMDA-38; Android duplicate (dedupe.txt only) |
| TC-467 | Fail | question | held: question (PM) |
| TC-492 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-507 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-143 | Fail | defect | 34. ISS-AMDA-39 |
| TC-434 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-438 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-481 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-144 | Fail | defect | 32. ISS-AMDA-37 |
| TC-145 | Fail | defect | 32. ISS-AMDA-37 |
| TC-308 | Fail | defect | 35. ISS-AMDA-40 |
| TC-311 | Fail | defect | 28. ISS-AMDA-32 |
| TC-490 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-343 | Fail | defect | 37. ISS-AMDA-42; Android duplicate (dedupe.txt only) |
| TC-517 | Fail | defect | 36. ISS-AMDA-41 |
| TC-418 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-153 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-471 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-155 | Fail | defect | 25. ISS-AMDA-29; Android duplicate (dedupe.txt only) |
| TC-156 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-470 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-157 | Fail | defect | 18. ISS-AMDA-21 |
| TC-158 | Fail | defect | held: question (PM) |
| TC-159 | Fail | question | held: question (PM) |
| TC-160 | Fail | defect | 25. ISS-AMDA-29 |
| TC-161 | Fail | defect | held: question (PM) |
| TC-162 | Fail | defect | 25. ISS-AMDA-29 |
| TC-166 | Fail | defect | 40. ISS-AMDA-46; Android duplicate (dedupe.txt only) |
| TC-168 | Fail | defect | 36. ISS-AMDA-41 |
| TC-169 | Fail | defect | 38. ISS-AMDA-43 |
| TC-170 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-171 | Fail | defect | 38. ISS-AMDA-43 |
| TC-172 | Fail | defect | 38. ISS-AMDA-43 |
| TC-173 | Fail | defect | 38. ISS-AMDA-43 |
| TC-174 | Fail | defect | 38. ISS-AMDA-43 |
| TC-415 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-503 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-440 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-461 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-447 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-459 | Fail | defect | Android duplicate (dedupe.txt only) |
| TC-462 | Fail | defect | Android duplicate (dedupe.txt only) |
| O-1 | observation | — | 6. ISS-AMDA-08 |
| O-2 | observation | — | Android duplicate (dedupe.txt only) |
| O-3 | observation | — | not a bug |
| O-4 | observation | — | Android duplicate (dedupe.txt only) |
| O-5 | observation | — | Android duplicate (dedupe.txt only) |
| O-6 | observation | — | not a bug |
| O-7 | observation | — | not a bug |
| O-8 | observation | — | 24. ISS-AMDA-28 |
| O-9 | observation | — | not a bug |
| O-10 | observation | — | 25. ISS-AMDA-29 |
| O-11 | observation | — | held: held (single sighting, no frame) |
| O-12 | observation | — | Android duplicate (dedupe.txt only) |
| O-13 | observation | — | 30. ISS-AMDA-34 |
| O-14 | observation | — | Android duplicate (dedupe.txt only) |
| O-15 | observation | — | Android duplicate (dedupe.txt only) |
| O-16 | observation | — | Android duplicate (dedupe.txt only) |
| O-17 | observation | — | not a bug |
| O-18 | observation | — | Android duplicate (dedupe.txt only) |
| O-19 | observation | — | not a bug |
| O-20 | observation | — | 25. ISS-AMDA-29 |
| O-21 | observation | — | 37. ISS-AMDA-42 |
| O-22 | observation | — | Android duplicate (dedupe.txt only) |
| O-23 | observation | — | Android duplicate (dedupe.txt only) |
| O-24 | observation | — | Android duplicate (dedupe.txt only) |
| O-25 | observation | — | Android duplicate (dedupe.txt only) |
| O-26 | observation | — | Android duplicate (dedupe.txt only) |
| O-27 | observation | — | not a bug |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40 |
| PM | — |
| Doc | 2, 16 |

### Filing order

By severity: **7**, **24**, **4**, **5**, **6**, **8**, **9**, **11**, **12**, **14**, **15**, **17**, **18**, **19**, **20**, **21**, **23**, **25**, **31**, **32**, **33**, **36**, **38**, **39**, **40**, **1**, **2**, **3**, **10**, **13**, **16**, **22**, **26**, **27**, **28**, **29**, **30**, **34**, **35**, **37**. Nothing is on hold: same-OS duplicates are left out (dedupe.txt) and iOS tickets never hold an entry. Nothing is filed until the review page's decisions come back (Creator, TRCode, source tag and method are needed: no earlier Android batch).

# AI Mini Drama (iOS) — eBug drafts, phase P23 (P2 Regression + P3 Flows), PDR-I 16.9.0 build 189729

**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-20-p23-regression-flows/` — the 91 P23 cases of the approved table `cases.csv` v1 (P2 Regression 40 + P3 Flow arrows, text and colleague directions 51), run 2026-10-20 15:35 → 2026-10-21 05:30 on iPhone 17 Air / iOS 26.2.1 through Appium/WebDriverAgent, TestFlight build 16.9.0 (189729), Developer Server, Pro+. Result: 43 Pass, 28 Fail, 20 Blocked, 0 Not run — P2 12/21/7, P3 31/7/13 (Pass/Fail/Blocked). Off-case observations O-1…O-15: `runs/2026-10-20-p23-regression-flows/observations.md`.

**Filed by:** ETHAN_HSU on 2026-10-21 via API on TR261019-0014 (16.9.0 build 189729) — ISS-AMD-40 DRI261897P0016, ISS-AMD-41 DRI261897P0017, ISS-AMD-42 DRI261897P0018, ISS-AMD-43 DRI261897P0019, ISS-AMD-44 DRI261897P0020, ISS-AMD-45 DRI261897P0021, ISS-AMD-49 DRI261897P0022. Decisions: `decisions.md`.

Rules: UX problems go to PM, RD fixes are Functional without [UX]; reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry and the log excerpt where the finding has a log cause. Design outranks PM.

**What is drafted:** P2 is the regression phase, so most failures are tickets that still reproduce: they are **Rechecks** (comment, or reopen/reject the fix, on the existing BugCode), not new tickets — including the video failure, which is the P1 ticket DRI261897P0006 / DRI261896P0020. The 8 P1 tickets (DRI261897P0006–P0013) are not drafted again; a P23 finding that is one of them is a recheck note. Drafted: the 7 problems with no ticket of their own. Entries are numbered in run order; trust the ISS-ID over the number.

Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), PM (a ruling is needed), Doc (on-screen copy). Every entry links the spec board it is checked against (entries resting on a QA rule cite the board that shows the screen).

---

## 1. ISS-AMD-40 — Failed generations keep the credits already booked, with no refund  ·  Class: Functional  ·  Severity: S2  ·  Owner: RD

**Report step:** TC-206, TC-137, O-15  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Rule 8 (refund check) on three failures, each matched by time and amount in Mine › Credits › Details (shared account, other devices' rows excluded). (1) TC-206, template 「The Dog Who Remembered Her」 (Number 99): 「Create characters ◆8 · Generate」 for Mia's look edit 19:58:39 → 「Something went wrong on my end.」 at 19:59:06 (character-edit resolve_uri failure, already DRI261896P0019); pill 20192 → 20190 → 20190 after reopening; ledger 19:58 Text to Speech −1 and 19:59 Text to Speech −1, no 「Generation failed, credits returned」 row (ledger/TC-206-20261020-200226.json). (2) TC-137, Create my character with Pink Fail media tool = TextToImage: the card says 「We couldn't create this character and your credits have been refunded.」 but pill 19677 → 19676; ledger 2026-10-21 00:17 Text to Speech −1, no refund row (ledger/TC-137-20261021-002323.json); log: TextToImage failed at 00:17:17.034, the TTS step still ran and was allowed (credit=1) at 00:17:17.597. (3) O-15, video gate retry on 「ライバルの共闘」 (Preview 30 s ◆139): 'Video couldn't be created' after 402 s (storage PUT failure, DRI261897P0006); pill 19297 → 19285; ledger Text to Speech −1 ×3 at 05:17 and Text to Image −3 ×3 at 05:23 = −12, no AI Video Generator row and no refund row (ledger/GATE2-video-20261021-052722.json). One mechanism in all three: per-tool charges booked inside a turn that then fails are never returned, so the user pays 1–12 credits for nothing; the first gate (10/20 16:04) booked nothing and is not a case of it. P1 noted the TTS credit kept on failed characters inside the DRI261896P0042 recheck (that ticket is about the missing error/refund notice); this entry is the charge itself, raised separately per rule 8. Spec: R-036 (PM Error Handling) promises the refund on a failed character; R-080/R-084 for videos. Pink fault toggles were set back Off after TC-137.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character and video generations keep their charged credits with no refund
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose characters are set (e.g. The Dog Who Remembered Her)
5. Read the balance on the credit pill
6. Tap Generate on a card whose generation fails (e.g. Create characters after asking to change Mia's look)
7. Wait for the failure message
8. Tap Back until the Launcher is shown
9. Tap Mine
10. Tap Credits
11. Tap Details
12. Check the result

Result:
Each failed generation keeps 1-12 credits (Text to Speech / Text to Image rows) and no refund row is added.
摘要：生成失敗後仍扣除 1–12 點（文字轉語音/文字轉圖片），且無退點紀錄。
{16.9.0_amd40_tc206_failed.jpg} {16.9.0_amd40_tc206_ledger.jpg} {16.9.0_amd40_tc137_card_says_refunded.jpg} {16.9.0_amd40_tc137_ledger.jpg} {16.9.0_amd40_video_failed.jpg} {16.9.0_amd40_video_ledger.jpg} {16.9.0_amd40_log.txt}

Expect Result:
A failed generation costs nothing: every credit it charged is returned with a refund row.
摘要：失敗的生成不應扣點：所有已扣點數都應退還並出現退點紀錄。
Spec string: 「We couldn't create this character. Your credits have been refunded. Try again.」

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama PM spec, Error Handling board - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2
Related: DRI261896P0042 (no refund notice on failed characters), DRI261896P0019 and DRI261897P0006 (the failures themselves)
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/01_ISS-AMD-40/`

---

## 2. ISS-AMD-41 — X on Finish your characters keeps the generated looks  ·  Class: Functional  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-121  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Flow arrow 2811-90144 (Design Characters board): X on the Finish your characters sheet closes back to Choose Character and the generated looks are NOT applied. Storm and Shelter (David, Margaret unset) › ✓ › 「Generate all ◆8」 19:36:10 → 「Your characters are ready」 + Confirm after 120 s → X without Confirm: the sheet closes, but both slots already show the new looks and David's new 「✦ Mine」 card is checked in 「Choose for David」. The log explains it: the generation runs as a chat turn that ends 19:38:01 with 'turn end · stage=storyboard · card=none' — the looks are committed and the stage moved to storyboard before Confirm, so X has nothing to discard. The same turn produced the duplicate outline block of TC-208 (DRI261896P0024, still reproduces). The 8 credits were charged for looks that did succeed, so the charge is not the defect; the user just cannot reject them.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent] AI Mini Drama: X on Finish your characters keeps the generated looks instead of discarding them
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap Create Your Drama
4. Type a story idea with two characters
5. Tap Send
6. Tap Generate on the format card
7. Wait for Ready to create your characters
8. Tap a character slot
9. Tap the checkmark without choosing any look
10. Tap Generate all on Finish your characters
11. Wait for Your characters are ready
12. Tap X on the sheet without tapping Confirm
13. Check the result

Result:
The sheet closes but the new looks are already applied to the cast slots.
摘要：按 X 關閉後，新生成的造型仍已套用到角色欄位。
{16.9.0_amd41_ready.jpg} {16.9.0_amd41_after_x.jpg} {16.9.0_amd41_log.txt}

Expect Result:
X closes back to Choose Character and the generated looks are not applied to the slots.
摘要：按 X 應回到 Choose Character，新造型不應套用到角色欄位。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90144
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/02_ISS-AMD-41/`

---

## 3. ISS-AMD-42 — Character filter with no matches shows a blank grid  ·  Class: UX  ·  Severity: S2  ·  Owner: PM

**Report step:** TC-288  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Spec addition (TC-288, user QA rule 8: data-driven facets — an empty result is shown clearly). The Ethnicity facets themselves are fine: 8 values that match the 189-card library exactly (no Southeast Asian or Mixed cards exist, so their absence is correct), and each value alone returns only matching cards. The gap is the empty result: Male + Indigenous (the only Indigenous card is female) leaves only the 「Create my character」 tile and blank space — no 'No characters match' text and no Clear action. Design's Filter frames give no empty-state copy, so PM/Design must define it; the strings below are a suggestion.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Character filter with no matches shows a blank grid with no empty state
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose cast is not set yet
5. Tap a character slot
6. Tap the filter icon
7. Tap Male
8. Tap Indigenous
9. Tap the checkmark
10. Check the result

Result:
Only the Create my character tile and blank space are shown, with no message or clear option.
摘要：篩選無結果時只顯示 Create my character 與空白，無任何提示。
{16.9.0_amd42_filter.jpg} {16.9.0_amd42_blank_result.jpg}

Expect Result:
An empty state says no characters match and offers to clear the filter (No sheet describes this).
摘要：應顯示無符合角色的空狀態並提供清除篩選（規格未定義）。

[AI Recommendation]
Title: No characters match
Body: Try removing a filter to see more characters.
Button: Clear filters

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-105834
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/03_ISS-AMD-42/`

---

## 4. ISS-AMD-43 — Create my character description runs under the expand icon  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** O-6  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Off-case observation O-6, seen on passing case TC-125 (long description, 656 characters). The description text is not inset from the expand icon in the field's top-right corner: on the first line 「fluffy」 ends right at the icon, and after scrolling, 「ears」 is drawn underneath it (zoomed capture). User QA rule 8: entered text never overlaps adjacent controls. No log (layout only).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create my character description text runs under the expand icon
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap History
4. Tap a drama whose cast is not set yet
5. Tap a character slot
6. Tap Create my character
7. Type a description of 600+ characters
8. Drag up inside the description
9. Check the result

Result:
The description text is not inset from the expand icon; words are drawn under the icon.
摘要：描述文字未避開展開圖示，捲動後文字與圖示重疊。
{16.9.0_amd43_scrolled.jpg} {16.9.0_amd43_overlap_zoom.jpg}

Expect Result:
The text keeps clear of the expand icon at every scroll position.
摘要：任何捲動位置文字都不應與展開圖示重疊。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90468
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/04_ISS-AMD-43/`

---

## 5. ISS-AMD-44 — AI Mini Drama strings stay English in Traditional Chinese and Japanese  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-276, TC-277, O-14, O-2  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** TC-276 (CHT) and TC-277 (JPN) text tours, the app started with device.ts launch --lang zh-Hant / ja (launch arguments, the same per-app language the Repro Steps set through iOS Settings). The shared strings are localized (生成, 更多/その他, 刪除, 重新命名, 女性/男性, 離開/退出 …) but every AI Mini Drama feature string stays English: entry 'Hi, I'm your AI Drama Assistant', 'Create Your Drama', 'Start from a template', 'Make my version', the format card 'What format would you like for your video?' / '1. Video language' / '2. Captions', 'Leave this chat?' and 'Leave without finishing?' dialogs (buttons half localized: 「離開」 + 'Keep choosing'), History info tip, 'Characters Result', 'Create storyboard', 'Storyboard Preview', 'Video length', 'Choose Character', 'Create my character', 'AI Suggestion', 'Ethnicity*' and every ethnicity, filter 'My characters only'. Template names are localized in JPN but English in CHT; category names English in both. O-2: the chat's fixed prompts stay English with the app in Japanese. Generated story content language is a separate ticket (DRI261894P0046, still reproduces, TC-187). Japanese template names no longer truncate (DRI261896P0022 not reproduced). Owner RD (user decision 2026-10-21, was PC-Doc): the strings are not wired to the translation table. Spec Link: the home page board that holds the entry strings (R-003); there is no localization board.

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Feature strings stay English in Traditional Chinese and Japanese
```

**Description:**

```
Repro Steps:
1. Open iOS Settings
2. Tap PowerDirector
3. Tap Language
4. Tap 繁體中文
5. Launch the APP
6. Tap AI 短劇 on the Launcher
7. Tap After Closing
8. Tap Make my version
9. Check the result

Result:
AI Mini Drama strings stay English while shared strings are translated, so dialogs mix languages.
摘要：AI 短劇功能文字未翻譯，與已翻譯的共用文字混雜在同一畫面。
{16.9.0_amd44_cht_entry.jpg} {16.9.0_amd44_cht_leave_dialog.jpg} {16.9.0_amd44_jpn_format_card.jpg} {16.9.0_amd44_jpn_leave_dialog.jpg}

Expect Result:
Every AI Mini Drama string is shown in the app language (Traditional Chinese / Japanese).
摘要：AI 短劇所有文字應以 App 語言（繁體中文/日文）顯示。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, AI Mini Drama home page / Custom detail / Chat room detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/05_ISS-AMD-44/`

---

## 6. ISS-AMD-45 — CHT character filter sheet is titled 濾鏡 instead of 篩選  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-276, O-14  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Split from the reviewed ISS-AMD-45 (user 2026-10-21: 'This should be two bugs'); the JPN half is ISS-AMD-49. One of the few translated AI Mini Drama strings uses the wrong word: in Traditional Chinese the character filter sheet title is 「濾鏡」, the photo/image-effect filter; a list filter is 「篩選」 (the sheet's own 清除 / 性別 / 年齡 are right). Kept apart from ISS-AMD-44 because this string is translated, just wrongly. Owner RD (user decision; was PC-Doc).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Character filter sheet is titled 濾鏡 instead of 篩選 in Traditional Chinese
```

**Description:**

```
Repro Steps:
1. Open iOS Settings
2. Tap PowerDirector
3. Tap Language
4. Tap 繁體中文
5. Launch the APP
6. Tap AI 短劇 on the Launcher
7. Tap History
8. Tap a drama whose cast is not set yet
9. Tap a character slot
10. Tap the filter icon
11. Check the result

Result:
The filter sheet title reads 濾鏡 (photo filter) instead of a list-filter word.
摘要：繁中角色篩選頁標題顯示「濾鏡」（相片濾鏡），用詞錯誤。
{16.9.0_amd45_cht_filter_title.jpg}

Expect Result:
The filter sheet title reads 篩選.
摘要：繁中篩選頁標題應為「篩選」。

[AI Recommendation]
CHT filter sheet title: 篩選

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Characters: Flow, Create my character, Filter, Error board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-105834
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/06_ISS-AMD-45/`

---

## 7. ISS-AMD-49 — JPN template list link reads その他 instead of もっと見る  ·  Class: UI  ·  Severity: S3  ·  Owner: RD

**Report step:** TC-277, O-14  ·  **Reproduce:** 1/1  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Split from the reviewed ISS-AMD-45 (user 2026-10-21: 'This should be two bugs'); new ISS number after P4's last (ISS-AMD-48). In Japanese the entry page's link to the full template list (English 'More', CHT 「更多」) reads 「その他」 ('Others'), which reads as a miscellaneous category rather than 'see more'. Kept apart from ISS-AMD-44 because this string is translated, just wrongly. The JPN Credits page's double space in 「クレジット:  0」 is on the Credits page, not AI Mini Drama (Not raised). Owner RD (user decision; was PC-Doc).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template list link reads その他 instead of もっと見る in Japanese
```

**Description:**

```
Repro Steps:
1. Open iOS Settings
2. Tap PowerDirector
3. Tap Language
4. Tap 日本語
5. Launch the APP
6. Tap AI Mini Drama on the Launcher
7. Check the result

Result:
The link beside Start from a template reads その他 (Others) instead of a see-more word.
摘要：日文「Start from a template」旁的連結顯示「その他」（其他），用詞錯誤。
{16.9.0_amd49_jpn_more_link.jpg}

Expect Result:
The link to the full template list reads もっと見る.
摘要：日文完整模板列表連結應為「もっと見る」。

[AI Recommendation]
JPN template list link: もっと見る

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, AI Mini Drama home page / Custom detail / Chat room detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0_images/07_ISS-AMD-49/`

---

## Rechecks — existing tickets that still reproduce on 189729 (comment or reopen, do not file again)

| P23 case(s) | Ticket | Status — ticket says | What P23 saw | Action |
|---|---|---|---|---|
| TC-142…151, TC-190, TC-195 (gate), TC-209, TC-210, O-15 | DRI261897P0006 (Assigned, P1 ISS-AMD-37) + DRI261896P0020 (NotReproducible) | Video generation always fails after ~6 min as the storage upload times out | Still fails 2/2: gate 10/20 16:04:42 → 'Video couldn't be created' 16:16:53 (731 s, 'HTTP PUT to storage URL failed: Failed to write connection'); retry 10/21 05:17:26 → 05:24:13 (402 s, 'Failed to read connection', also in beat-edit). 14 P23 video cases Blocked behind it; 12 credits kept on the retry (ISS-AMD-40). | comment |
| O-5, O-7 | DRI261897P0008 | NewCreated (P1 ISS-AMD-33) — character and storyboard generation block the screen for over a minute | Still reproduces: Finish your characters Generate for one dog 142 s on a locked sheet (19:52:53→19:55:15); Create my character dog 203 s (20:18:14→20:21:37); TC-121 Generate all 120 s. | comment |
| TC-186 | DRI261894P0043 | Assigned — Back from an empty chat still asks Leave this chat? | Still reproduces. | comment |
| TC-199 | DRI261896P0007 | TRCreated — New Chat enabled with empty chat and prompt | Still reproduces on 189729 (enabled=true, shows Leave this chat?). | reject fix (reopen) |
| TC-200 | DRI261896P0008 | TRCreated — New Chat Leave anyway returns to the previous page | Still reproduces: returns to the AI Mini Drama entry page. | reject fix (reopen) |
| TC-213 | DRI261896P0038 | Propose — message sent before the format is chosen skips language and captions | Still reproduces: outline created with no language/captions chosen. | comment |
| TC-189 | DRI261894P0050 | Assigned — assistant gives no reply to unsupported requests | Original no-reply symptom gone; now 'vertical 9:16 and only 15 seconds' is silently accepted and the outline cut to one beat. Question for PM: is 15 s a supported length? | comment (question) |
| TC-193 | DRI261895P0004 | NewCreated — a pet that drives the story is never offered as a character | Still reproduces (grandma's cat Barnaby drives 4 beats, no slot). | comment |
| TC-192 | DRI261895P0003 | TRCreated — The Beer Heir in Japanese only shows Server is busy | Original symptom gone (outline + 7 preset portraits created), but the turn ends with 'Something went wrong on my end.' + Try again (outline-sync 'HTTP request to cc team gateway failed: Failed to read connection'); Try again recovers in 37 s. 1/1. | comment (symptom changed) |
| TC-212 | DRI261896P0034 | TRCreated — The Art of Falling default actors have the wrong gender | Still reproduces: Julian Cross gets a woman's look, Lauren Hale a man's. | reject fix (reopen) |
| TC-208 | DRI261896P0024 | RDResolved — Story Outline & Characters Result block appears twice | Still reproduces after Finish your characters (block repeated, slot card replaced, a 'Generate with AI' bubble the user never typed). | reject fix (reopen) |
| TC-194 | DRI261895P0005 | Propose — Add New adds an invented character | Invented character no longer added, but Add New now refuses ('Non-speaking presences … do not require a separate character sheet') with no way to name someone. Spec addition: PM/Design to define Add New. | comment (spec addition) |
| TC-201 | DRI261896P0009 | Close — character carousel lacks a horizontal-scroll hint | Still reproduces: the 4th slot (Add New) is fully clipped at x=399, no peek (Design 2778-128850). | reopen |
| TC-206 | DRI261896P0019 | Assigned — revising a template's pre-assigned character fails | Still reproduces; message now 'Something went wrong on my end.' (character-edit resolve_uri cannot stat the AppCMS preset image). The 2 credits kept are ISS-AMD-40. | comment |
| TC-211, TC-126 | DRI261896P0031 | NewCreated — AI Suggestion leaves required attributes empty | Still reproduces: copies the outline role line, Gender/Ethnicity/Age empty, Generate disabled. | comment |
| TC-284 (passed) | DRI261895P0032 | TRCreated — Generate disabled without a clear reason | Still reproduces: Ethnicity empty → Generate greyed, no hint or highlight, tap does nothing. | reject fix (reopen) |
| TC-204 | DRI261896P0017 | ProposeNAB — animal character needs a human ethnicity | Still requires Ethnicity; only 「Other」 lets a dog through. Question for PM: is Other the intended path? | comment (question) |
| TC-291 (passed) | DRI261893-0119 | ProposeNAB — generated character has no Rename route | Picker/image menu still has no Rename; renaming by chat works and is kept. | comment |
| TC-175 | DRI261893-0123 | ProposeNAB — scene description has no edit or save action | Still reproduces (script read-only on the Scene page, no edit/save). | comment |
| TC-178 | DRI261893-0163 | QANeedRework — successful storyboard images expose no version editor | Still no viewer/version editor on successful scene images; applicability needs PM/Design. | comment (question) |
| TC-187, O-2 | DRI261894P0046 | Close — language change by chat leaves outline and scene titles in the old language | Partly reproduces: after 'Make the whole drama Japanese' beat titles, 'Scene N — …' titles and Possible Characters stay English (scripts, descriptions and captions are translated). Ring He Worked For JP also kept English beat titles. | reopen |
| TC-214 | DRI261896P0039 | TRCreated — character added by chat after the storyboard gets a dead slot | Still reproduces: Tom Reed's slot (and Malcolm's) do nothing; only Add New responds. | reject fix (reopen) |
| TC-184, O-12 | DRI261894P0036 | TRCreated — after a failed step the chat has no next step, card or retry | Still reproduces after a failed scene image + regeneration: chat ends at the storyboard, no video card, Try again gone; regen preview_tts 'not covered by the authorization -> deny', narration not redone. The chat-turn failure path (Fail turn) is fine. | reject fix (reopen) |
| TC-179 | DRI261894P0007 + DRI261894P0021 | Propose — credit details show Text to Image / Text to Speech / AI Video Generator | Still reproduces: no row says AI Mini Drama. | comment |
| TC-185 | DRI261894P0042 | TRCreated — VoiceOver reads image IDs for Back, History, X, checkmark | Still reproduces (labels are image IDs that change per visit; History Back empty). Read from accessibility labels, VoiceOver not turned on. | reject fix (reopen) |
| TC-275, O-10 | DRI261896P0016 | NewCreated (PCDoc) — template chat reads 1 characters isn't set yetThey need a look | Still reproduces on 189729, on a custom-path drama too (Merger Season after adding Tom Reed), plus '…and 1 characters still have no portrait.' Suggested: '1 character isn't set yet. It needs a look before you can continue.' | comment |
| O-1, O-9 | DRI261894P0013 | NotReproducible — says a storyboard exists before one is made | Reproduces on 4 dramas in P23 as in P1 (Beer Heir JP, Ring He Worked For JP, The Art of Falling, Shelter in the Storm): 'The complete 6-beat storyboard … has been generated' above the Create storyboard card, before any storyboard exists. Also after a look revision the chat offered Create storyboard although one existed (O-9). | reopen with evidence |
| O-4, O-9 | DRI261896P0054 | NewCreated — cast/story change shows the wrong assistant prompt | Story change after the cast was set cleared Margaret's generated look and replied 'Updated the character profiles…' instead of the pm-update-7 copy; after a look revision the order was storyboard first, then Ready to create your characters. | comment |
| O-11 | DRI261896P0018 | Assigned — scene descriptions ignore the character's look | Not reproduced in English (TC-205 Pass: Malcolm's bow tie followed), but after the Japanese translation the scene descriptions dress Lauren and Ryan differently from their looks and drop the bow tie. 1/1 — add as a note, keep open. | comment |

## Fixed — tickets that no longer reproduce on 189729 (candidates to close)

| P23 case | Ticket | Status — ticket says | What P23 saw |
|---|---|---|---|
| TC-177 | DRI261893-0160 | TRCreated — style card splashes when switching quickly | No flash in a 30 fps recording of 12 rapid switches. |
| TC-207 | DRI261896P0023 | TRCreated — Beer Heir / Ring JP load no preset characters | Both JP templates show every preset look. |
| TC-197 | DRI261895P0034 | ProposeNAB — revised outline not shown again after characters are chosen | Revised outline shown for confirmation before the storyboard. |
| TC-181 | DRI261894P0024 | TRCreated — says the characters look great after leaving with characters unset | Chat stays at Ready to create your characters (custom drama). |
| TC-183 | DRI261894P0034 | Close — expanded editor border bright white | Border is #353A42, dark-theme gray. |
| TC-180 | DRI261894P0011 | TRCreated — Save to library saves to Photos | No Saved to Photos toast; Recents unchanged; only the in-app library. |
| TC-203 | DRI261896P0012 | Close — scene text cannot be selected or copied | Long-press selects; Copy/Paste works. |
| TC-188 | DRI261894P0048 | Close — scene count / style requests silently not applied | 'Cut it down to 3 scenes' gave a 3-scene storyboard with the twist. |
| TC-182 | DRI261894P0025 | TRCreated — raw internal error strings shown as toasts | Five failures showed only user-facing copy, 0 toasts in the log (the ticket's own Home-during-video trigger could not run: video gated). |
| TC-196 | DRI261895P0033 | Close — 'Sever is busy' while waiting | Never shown in 8 turns; no 'busy' line in the log. |
| TC-198 | DRI261896P0006 | Propose — loading placeholder barely visible in Light mode | Skeleton clearly visible in Light mode. |
| TC-132 | DRI261895P0036 | Close — Create my character always fails | Generated in ~37 s. |
| TC-277 | DRI261896P0022 | Assigned — Japanese template names truncated | Long JP names wrap to two lines, no '…'. |

Not checkable this phase (Blocked): DRI261896P0027 (TC-209), DRI261896P0028 (TC-210), DRI261894P0052 (TC-190), DRI261895P0007 (TC-195) — need a finished video; DRI261893-0136 (TC-176, no infant card left in the library), DRI261896P0010 (TC-202, purchase), DRI261895P0002 (TC-191, spoken input).

## Questions and spec additions (PM / Design, not tickets)

| Item | Disposition | What to decide |
|---|---|---|
| TC-134 / DRI261896P0037 | question | The X'd look is added to Mine, which the approved TC-057 says is intended (PM). The ticket (Assigned) conflicts with the approved table: PM to close it as by design or change TC-057. |
| O-3 | question | Filter Age slider: with both thumbs moved inward the labels keep reading 1 and 100, so the chosen range is shown nowhere. Design shows no range label; ask Design. (The only Indigenous card, 「Armed-Villagers」, is a group of villagers — library content, not app.) |
| O-8 | question | A character-sheet reference (one woman, front + 3 views, the layout the app's own results use) triggers 'More than one person detected'. Reusing a generated look as a reference always hits this. PM to decide. |
| O-9 | question | Chat revisions after the storyboard regenerate the whole storyboard in the same turn with no Create storyboard offer and no charge. PM: is a free regeneration intended? |
| O-12 | question | Video price and length move with the story: Preview 30 s ◆120 → ◆127 → ◆139; Full Video 45 sec with 3 scenes, 60 sec with 4. Storyboard Preview reads 0:52 for 6, 3 and 4 scenes. Check against the MX charging price table. |
| O-13 | question | The same drama's video card lost its model row overnight: 10/20 16:04 'Choose your video settings' with Seedance 2.0 / 2.0 Mini and Full Video 90 sec; 10/21 05:16 only 'Video length' with Full Video 60 sec. Spec R-068 has the model row and 90 sec. Server-driven? Recheck on a new drama before raising. |

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| TC-275 (part) | Credits page 「Expiring within 7 days: 0 credit」 (and JPN 「クレジット:  0」 with a double space) | Credits page, not AI Mini Drama — mention to the Credits/IAP owner. |
| TC-275 (part) | Curly 'other’s' in the idea chips next to straight apostrophes elsewhere | Style only; Doc to decide house style. Not a ticket. |
| O-11 | Scene descriptions drift from the looks after translation | Added as a comment on DRI261896P0018 (Rechecks), seen 1/1. |
| Blocked (20) | TC-176, TC-139, TC-209, TC-210, TC-142, TC-143, TC-190, TC-195, TC-146, TC-147, TC-148, TC-149, TC-150, TC-144, TC-145, TC-151, TC-136, TC-152, TC-202, TC-191 | No verdict: 14 behind the video failure (gate failed twice, DRI261897P0006), 6 test data (low balance ×2, purchase, spoken input, no infant card, no long script) — reasons in results.csv. |

## Reconciliation against the report

The run is the report: 28 failed cases (21 P2, 7 P3), 20 Blocked, observations O-1…O-15.

| Step | Count | Running total |
|---|---|---|
| Failed cases | 28 | 28 |
| Ticket still reproduces → Rechecks only (22 cases: TC-186, TC-199, TC-200, TC-213, TC-189, TC-193, TC-192, TC-212, TC-208, TC-194, TC-201, TC-126, TC-211, TC-204, TC-175, TC-178, TC-187, TC-214, TC-184, TC-179, TC-275, TC-185) | −22 | 6 |
| Remaining failed cases (TC-121, TC-288, TC-206, TC-137, TC-276, TC-277) — TC-206 also a recheck; TC-206 + TC-137 merged into one refund entry, TC-276 + TC-277 into three entries (untranslated; CHT 濾鏡 and JPN その他 mistranslations, split by the user 2026-10-21) → new entries | → 6 entries | 6 |
| Entries from observations (O-6 → ISS-AMD-43; O-15 joins ISS-AMD-40, O-2/O-14 join ISS-AMD-44) | +1 | **7 to file** |
| Observations → rechecks, questions or not raised (O-1, O-3, O-4, O-5, O-7, O-8, O-9, O-10, O-11, O-12, O-13) | 0 | 7 |
| Blocked cases (20) → no verdict | 0 | 7 |

Dispositions kept apart: **defect** → entries 1, 2, 4–7 and the Rechecks; **spec-addition** → entry 3 (TC-288) and the TC-194 recheck; **question** → TC-189, TC-204, TC-178 rechecks and the Questions table; **observability** → none this phase (TC-185 was read from accessibility labels without VoiceOver); **test-data** → 6 Blocked cases.

### Row-by-row map

| Item | Phase | Result | Became |
|---|---|---|---|
| TC-186 | P2 | Fail (defect) | recheck DRI261894P0043 |
| TC-199 | P2 | Fail (defect) | recheck DRI261896P0007 |
| TC-200 | P2 | Fail (defect) | recheck DRI261896P0008 |
| TC-213 | P2 | Fail (defect) | recheck DRI261896P0038 |
| TC-189 | P2 | Fail (question) | recheck DRI261894P0050 (question) |
| TC-193 | P2 | Fail (defect) | recheck DRI261895P0004 |
| TC-192 | P2 | Fail (defect) | recheck DRI261895P0003 |
| TC-212 | P2 | Fail (defect) | recheck DRI261896P0034 |
| TC-208 | P2 | Fail (defect) | recheck DRI261896P0024 |
| TC-194 | P2 | Fail (spec-addition) | recheck DRI261895P0005 (spec addition) |
| TC-201 | P2 | Fail (defect) | recheck DRI261896P0009 |
| TC-121 | P3 | Fail (defect) | 2. ISS-AMD-41 |
| TC-288 | P3 | Fail (spec-addition) | 3. ISS-AMD-42 (spec addition) |
| TC-206 | P2 | Fail (defect) | 1. ISS-AMD-40 + recheck DRI261896P0019 |
| TC-126 | P3 | Fail (defect) | recheck DRI261896P0031 |
| TC-211 | P2 | Fail (defect) | recheck DRI261896P0031 |
| TC-204 | P2 | Fail (question) | recheck DRI261896P0017 (question) |
| TC-137 | P3 | Fail (defect) | 1. ISS-AMD-40 |
| TC-175 | P2 | Fail (defect) | recheck DRI261893-0123 |
| TC-178 | P2 | Fail (question) | recheck DRI261893-0163 (question) |
| TC-187 | P2 | Fail (defect) | recheck DRI261894P0046 |
| TC-214 | P2 | Fail (defect) | recheck DRI261896P0039 |
| TC-184 | P2 | Fail (defect) | recheck DRI261894P0036 |
| TC-179 | P2 | Fail (defect) | recheck DRI261894P0007 + DRI261894P0021 |
| TC-275 | P3 | Fail (defect) | recheck DRI261896P0016 + not raised (Credits page plural, apostrophes) |
| TC-276 | P3 | Fail (defect) | 5. ISS-AMD-44 + 6. ISS-AMD-45 |
| TC-277 | P3 | Fail (defect) | 5. ISS-AMD-44 + 7. ISS-AMD-49 (DRI261896P0022 fixed) |
| TC-185 | P2 | Fail (defect) | recheck DRI261894P0042 |
| TC-176 | P2 | Blocked (test-data) | Blocked — test data (no infant card; DRI261893-0136 not checkable) |
| TC-139 | P3 | Blocked (test-data) | Blocked — test data (scripts capped at 3–8 lines, no overflow) |
| TC-209 | P2 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-210 | P2 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-142 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-143 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-190 | P2 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-195 | P2 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-146 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-147 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-148 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-149 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-150 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-144 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-145 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-151 | P3 | Blocked (defect) | Blocked — video gate (recheck DRI261897P0006); retest queue |
| TC-136 | P3 | Blocked (test-data) | Blocked — test data (low balance) |
| TC-152 | P3 | Blocked (test-data) | Blocked — test data (low balance) |
| TC-202 | P2 | Blocked (test-data) | Blocked — test data (purchase) |
| TC-191 | P2 | Blocked (test-data) | Blocked — test data (spoken input) |
| O-1 | — | observation | recheck DRI261894P0013 |
| O-2 | — | observation | 5. ISS-AMD-44 + recheck DRI261894P0046 |
| O-3 | — | observation | question (Design) |
| O-4 | — | observation | recheck DRI261896P0054 |
| O-5 | — | observation | recheck DRI261897P0008 |
| O-6 | — | observation | 4. ISS-AMD-43 |
| O-7 | — | observation | recheck DRI261897P0008 |
| O-8 | — | observation | question (PM) |
| O-9 | — | observation | question (PM) + recheck DRI261894P0013 + DRI261896P0054 |
| O-10 | — | observation | recheck DRI261896P0016 |
| O-11 | — | observation | recheck DRI261896P0018 (comment) |
| O-12 | — | observation | question (PM) + recheck DRI261894P0036 |
| O-13 | — | observation | question (PM, ⏳ recheck) |
| O-14 | — | observation | 5. ISS-AMD-44 + 6. ISS-AMD-45 + 7. ISS-AMD-49 |
| O-15 | — | observation | 1. ISS-AMD-40 + recheck DRI261897P0006 |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1, 2, 4, 5, 6, 7 |
| PM | 3 |
| Doc | — |

### Filing order

RD entries in number order, then PM, then Doc: **1**, **2**, **4**, **5**, **6**, **7**, **3**. Post the Rechecks comments (and reopen/reject-fix requests) on the existing tickets as well; the video comment goes on DRI261897P0006.

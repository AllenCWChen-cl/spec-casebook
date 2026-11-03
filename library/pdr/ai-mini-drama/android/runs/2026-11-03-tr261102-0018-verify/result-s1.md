# TR261102-0018 verify, segment s1 — AI Mini Drama (Android), 7 tickets

- **Phone:** Samsung Galaxy A53, adb serial R5CTB22S05Y, Android 15, 1080 × 2400 (the drafts were filed on the Sony Xperia 10 III / Android 12)
- **Build:** PowerDirector 16.8.0 versionCode 2611021 (`device-android.ts build`, lastUpdateTime 2026-11-03 15:53:10)
- **Server:** Stage (Launcher top bar yellow, toolbar content-desc `[AID]Stage_Server`, checked at start and at the end)
- **Account:** the user's signed-in test account, left as it was (Launcher shows the 「Pro」 crown button; tier not changed or checked further)
- **Credits:** 25,222 at start → 25,218 after the Create my character generation (◆4, P0337/P0338) → 25,214 after the chat character update (◆4, P0334). Total spent: 8. No QA consume/purchase row touched, no storyboard or video started.
- **Session:** 2026-11-03 15:54–16:15, `restart`, `logcat start`, `launch`; logs pulled with `pull-logs s1` → `logs/s1-20261103-161502/` (git-ignored).
- **Dramas used:** 「Merger Season」 (new, from the template; characters already set, so Choose Character was opened through the Characters Result ↻ Replace button) and 「Crossed Lines」 (new custom drama stopped at 「Ready to create your characters?」 with two unset slots, the drafts' original entry). Both are in History.

| Ticket | ISS | Verdict |
| --- | --- | --- |
| DRA262610P0326 | ISS-AMDA-03 | STILL REPRODUCES |
| DRA262610P0334 | ISS-AMDA-13 | STILL REPRODUCES |
| DRA262610P0335 | ISS-AMDA-15 | NOT RE-VERIFIED (scenario not reachable by a real paste) |
| DRA262610P0337 | ISS-AMDA-17 | FIXED (X, swipe down and Back) |
| DRA262610P0338 | ISS-AMDA-18 | STILL REPRODUCES |
| DRA262610P0386 | ISS-AMDA-53 | FIXED |
| DRA262610P0387 | ISS-AMDA-54 | FIXED |

Screenshots are in `screenshots/`; log excerpts are in this folder.

## DRA262610P0326 — Character filter lists 「Other」 twice under Gender

**Steps.** Merger Season › Characters Result › ↻ Replace on Lauren Hayes (Choose Character) › filter icon › swiped the Gender row left (`fingerdrag`). Repeated on Crossed Lines › Maya Lin slot › filter icon.

**Seen.** Gender lists 「Female」「Male」「Other」「Other」 both times (element dump: four chips, two with text 「Other」). Expected: Female, Male, Others once each.

**Verdict: STILL REPRODUCES** (2/2).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0326_verify.png`, `screenshots/f1.png` (before the swipe).

## DRA262610P0334 — Back during a chat character update leaves with no stop dialog

**Steps.** Merger Season (characters all set, no storyboard) › typed 「Make Lauren Hayes a woman in her 40s」 › Send › the reply 「Ready to update your characters?」 with the 「Update characters」 card (◆4) › Generate (16:08:45) › system Back about 4 s later (16:08:49, card showing 「Thinking…」).

**Seen.** Back left straight to the AI Drama Assistant landing page with no dialog. The update kept running after leaving: the log shows dispatch at 16:08:57 and the TextToImage / TextToSpeech calls at 16:09:02. The balance fell 25,218 → 25,214 at 16:09:05. When the drama was reopened, the outline had been updated and the 「Create storyboard」 card was offered (it was not tapped). Expected: 「Stop and lose your credits?」 with Leave anyway / Keep Generating.

**Verdict: STILL REPRODUCES** (1/1).

**Evidence:** `screenshots/p0334_card.png`, `screenshots/p0334_generating.png`, `screenshots/16.8.0.2611021_DRA262610P0334_verify.png` (landing page right after Back), `screenshots/p0334_reopen.png`, `16.8.0.2611021_DRA262610P0334_log.txt` (KEYCODE_BACK 16:08:49, dispatch 16:08:57, totalRemain 25218 → 25214).

## DRA262610P0335 — Expanded description editor cuts text to 1,000 characters

**Steps (REQ-066: real paste, not `setval`).** Put 1,050 characters on the phone clipboard through Appium `set_clipboard`, ending in 「END」 (read back: 1,050 chars). Opened Create my character for Lauren Hayes. Tapping the description field opens the full-screen editor. Long-press › system 「Paste」 menu › Paste. Then Done (collapse). Cleared the field and long-pressed the collapsed field without tapping it first: that also opens the editor. Pasted again there.

**Seen.** Every real paste goes through the expanded editor, because a tap or a long-press on the collapsed field opens the editor before the Paste menu appears. The editor takes only the first 1,000 characters at paste time: 「END」 is dropped, the counter reads 1000/1000 and 「You've reached the 1,000-character limit.」 is shown. Collapsing keeps 1000/1000 with the same message. The reported state (1,050 characters in the collapsed field, then cut when the editor opens) cannot be produced by hand. It came only from `setval`, as RD said. Side note for the analysis, not raised: the Design's 「Exceed word limit」 state (over-limit text kept, red 1050/1000) is also unreachable, because a paste is capped at 1,000.

**Verdict: NOT RE-VERIFIED.** The ticket's scenario cannot be reached with a real paste on this build. A real paste stops at 1,000 characters, and no text is lost after the paste.

**Evidence:** `screenshots/p0335_menu.png` (Paste menu in the editor), `screenshots/p0335_after_paste.png`, `screenshots/16.8.0.2611021_DRA262610P0335_verify.png` (1000/1000 + limit message after a real paste), `screenshots/p0335_collapsed_hold.png` (long-press on the field opens the editor).

## DRA262610P0337 — Closing a generated character saves it to Mine anyway

**Steps.** Create my character (Lauren Hayes slot): 「Woman with a short bob and round glasses」, Female, White, Age 28 › Generate (◆4, 16:01:50; result 16:03:54) › X.

**Seen.** X now opens the dialog 「Discard this character?」 / 「It won't be saved, and the credits you spent won't be refunded.」 with Keep and Discard. This is new on this build; the missing dialog was DRA262610P0262. I tapped Discard, which returned to Choose Character. The library's first card is still the older Mine look (brown jacket), and the bob-and-glasses look is not in the library. I closed and reopened Choose Character and set 「My characters only」: one Mine card only, the older one. The charge was ◆4 (25,222 → 25,218), as expected. Only the X path was checked, because one generation was allowed per bug. Swipe down and system Back on the result were not tried.

**Verdict: FIXED** for X › Discard. Swipe down and Back were not re-verified (they need another generation).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0338_verify.png` (the result before X), `screenshots/p0337_dialog.png`, `screenshots/16.8.0.2611021_DRA262610P0337_verify.png` (library after Discard), `screenshots/p0337_mine_only.png`, `screenshots/cmc1.png` (library before generating), `16.8.0.2611021_DRA262610P0337_log.txt` (generate 16:01:50, totalRemain 25222 → 25218).

## DRA262610P0338 — Generated character page has no Discard button

**Steps.** Same generation as P0337, checked when the result appeared.

**Seen.** The result page has X (top left), the Download icon and 「Save to library」, with the Gender / Ethnicity / Age chips. There is no 「Discard」 button. X does lead to a Discard dialog now (P0337), but the page still has no Discard button as spec §13.23 shows.

**Verdict: STILL REPRODUCES** (1/1).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0338_verify.png`.

## DRA262610P0386 — System Back on the Add Media album list closes the whole picker

**Steps.** Create my character › Reference (optional) box › Add Media › 「All ▾」 (the album list opens: Downloaded, 00PDRa_Testing_Material, 100PDR_Capture, Camera, Mini Drama…) › system Back. Repeated once. A third Back closed the picker back to Create my character.

**Seen.** Back closes only the album list and stays on Add Media with the photo grid (2/2).

**Verdict: FIXED.**

**Evidence:** `screenshots/p0386_picker.png`, `screenshots/p0386_album_list.png`, `screenshots/16.8.0.2611021_DRA262610P0386_verify.png`.

## DRA262610P0387 — System Back on the enlarged character preview closes Choose Character

**Steps.** (a) Merger Season › ↻ Replace › Choose Character › enlarge icon on a library card › system Back, done twice on two cards. (b) The original entry: Crossed Lines at 「Ready to create your characters?」 with two unset slots › first slot (Maya Lin) › enlarge icon › system Back, done twice.

**Seen.** Back closes only the preview and stays in Choose Character (library shown, preview gone) every time (4/4).

**Verdict: FIXED.**

**Evidence:** `screenshots/p0387_preview.png`, `screenshots/p0387_orig_preview.png`, `screenshots/16.8.0.2611021_DRA262610P0387_verify.png`.

## End state

The app is on the Launcher, on Stage. Debug info was not used. Nothing is committed. No ticket was touched.

## DRA262610P0337 — swipe down and Back

**Session.** 2026-11-03 17:13–17:21, same phone and build (`build`: 16.8.0 / 2611021), Stage (Launcher top bar yellow, `[AID]Stage_Server`). `restart`, `logcat start`, `launch`; logs pulled with `pull-logs s3` → `logs/s3-20261103-172059/` (git-ignored). Entry: History › 「Crossed Lines」 › 「Ready to create your characters?」 › Maya Lin slot › Choose Character › Create my character.

**Library before.** Choose for Maya Lin showed two Mine cards: a dark-haired woman in a black suit (first) and the brown-jacket woman. At 16:15 there was only the brown-jacket card; the black-suit look appeared in between, most likely from the P0334 chat character update on Merger Season (Lauren Hayes, 40s), not from a closed Create my character result. Neither path below added a card. (`screenshots/p0337_swipe_before.png`)

**(1) Swipe down.** Form: 「Woman with long red curly hair wearing a green raincoat」, Female, White, Age 30 (`p0337_swipe_form.png`) › Generate ◆4 (17:16:58; result 17:17:39: red curly hair, green raincoat, black trousers, `p0337_swipe_result.png`) › `fingerdrag 540 440 540 1900` from the sheet's top edge (17:17:52).
**Seen.** The sheet did not close; the dialog 「Discard this character?」 / 「It won't be saved, and the credits you spent won't be refunded.」 with Keep / Discard appeared over the result (`16.8.0.2611021_DRA262610P0337_swipe.png`). Discard returned to Choose Character; the library still starts with the same two Mine cards, no red-haired look (`p0337_swipe_library.png`). Closed Choose Character (X), reopened from the Maya Lin slot, Filter › 「My characters only」 › OK: two Mine cards only, neither the new look (`p0337_swipe_mine_only.png`).
**Verdict: FIXED** (1/1).

**(2) System Back.** Form: 「Man with a shaved head and a thick grey beard wearing a yellow hoodie」, Male, Hispanic, Age 55 (`p0337_back_form.png`) › Generate ◆4 (17:19:17; result 17:19:48: bald man, grey beard, yellow hoodie, `p0337_back_result.png`) › `back` (17:19:57).
**Seen.** Back did not close the sheet; the same 「Discard this character?」 dialog (Keep / Discard) appeared (`16.8.0.2611021_DRA262610P0337_back.png`). Discard returned to Choose Character (filter still on): the two Mine cards only (`p0337_back_library.png`). Closed and reopened Choose Character, 「My characters only」 again: the same two Mine cards, no bearded look (`p0337_back_mine_only.png`).
**Verdict: FIXED** (1/1).

**Credits.** 25,214 at start → 25,210 after the swipe generation → 25,206 after the Back generation: ◆8 spent, ◆4 each, no refund on Discard (as the dialog says). No generation failed.

**Overall for DRA262610P0337:** all three close paths (X, swipe down, system Back) now ask 「Discard this character?」, and a discarded result is not saved to Mine. **FIXED.**

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0337_swipe.png`, `screenshots/16.8.0.2611021_DRA262610P0337_back.png`, `screenshots/p0337_swipe_before.png`, `screenshots/p0337_swipe_form.png`, `screenshots/p0337_swipe_result.png`, `screenshots/p0337_swipe_library.png`, `screenshots/p0337_swipe_mine_only.png`, `screenshots/p0337_back_before.png`, `screenshots/p0337_back_form.png`, `screenshots/p0337_back_result.png`, `screenshots/p0337_back_library.png`, `screenshots/p0337_back_mine_only.png`, `16.8.0.2611021_DRA262610P0337_swipe_back_log.txt` (generate 17:16:58 / 17:19:16, totalRemain 25214 → 25210 → 25206).

**End state.** App on the Launcher, Stage (`screenshots/p0337b_end_launcher.png`). Nothing committed, no ticket touched.

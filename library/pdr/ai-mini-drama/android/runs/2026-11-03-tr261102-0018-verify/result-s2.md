# TR261102-0018 verify, segment s2 — AI Mini Drama (Android), 8 tickets

- **Phone:** Samsung Galaxy A53, adb serial R5CTB22S05Y, Android 15, 1080 × 2400 (the drafts were filed on the Sony Xperia 10 III / Android 12)
- **Build:** PowerDirector 16.8.0 versionCode 2611021 (`device-android.ts build`, lastUpdateTime 2026-11-03 15:53:10)
- **Server:** Stage (Launcher top bar yellow, toolbar content-desc `[AID]Stage_Server`, checked at start and at the end)
- **Account:** the user's signed-in test account, left as it was (Launcher shows the 「Pro」 crown button)
- **Credits:** 25,214 at start → 25,214 at the end. Nothing was spent: no storyboard, video or character was generated. No QA consume/purchase row touched.
- **Session:** 2026-11-03 16:16–16:30, `restart`, `logcat start` (the s1 capture was still running), `launch`; logs pulled with `pull-logs s2` → `logs/s2-20261103-163021/` (git-ignored).
- **Dramas used:** 「Memory Drift」 and 「同居防線」 (both 2026/10/29, storyboard plus a finished full video), 「Hidden identity」 (storyboard), 「Merger Season」 (characters set, no storyboard). History order and times were the same at the start and the end of the segment. Nothing was deleted: Manage mode was entered and left only.
- **Gallery:** six exports were saved to `/sdcard/Movies/cyberlink/PowerDirector/Mini Drama/` (four `Memory_Drift - *.mp4`, two `同居防線 - *.mp4`, 16:19–16:26).
- **Export flow changed on this build.** 「Export Full Video」 no longer opens an export sheet or a full-screen producing / done page. The export runs on the result page: the preview dims with a spinner, Full Edit and Export Full Video are greyed out, and the toast 「Saved to Gallery」 shows when it finishes (about 30 s for a 90 s episode). This affects P0359, P0360 and P0391.

| Ticket | ISS | Verdict |
| --- | --- | --- |
| DRA262610P0349 | ISS-AMDA-30 | FIXED |
| DRA262610P0352 | ISS-AMDA-33 | FIXED |
| DRA262610P0353 | ISS-AMDA-34 | FIXED |
| DRA262610P0357 | ISS-AMDA-39 | FIXED |
| DRA262610P0359 | ISS-AMDA-41 | FIXED (the spec fallback: 「Stop exporting?」) |
| DRA262610P0360 | ISS-AMDA-42 | FIXED (the export pages were removed; the export shows the drama's own frame) |
| DRA262610P0389 | ISS-AMDA-56 | FIXED |
| DRA262610P0391 | ISS-AMDA-58 | NOT RE-VERIFIED (the export sheet no longer exists) |

Screenshots are in `screenshots/`. The export log excerpt is in this folder.

## DRA262610P0349 — Scroll-to-bottom button sits at the bottom centre

**Steps.** History › Memory Drift (finished storyboard and video) › scrolled up two screens (`fingerdrag` ×2) › tapped ↓.

**Seen.** `button_mini_drama_scroll_bottom` is at 945,1949 (90×90 px), its right edge at x 1035 of 1080: the bottom right, above the input bar. Tapping it scrolled to the newest message and hid the button.

**Verdict: FIXED** (1/1).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0349_verify.png`.

## DRA262610P0352 — History thumbnail shows a character look instead of the first storyboard frame

**Steps.** History › compared each card that has a storyboard with that drama's Storyboard Result › Scene 1.

**Seen.** All three dramas with a storyboard show their Scene 1 frame as the History thumbnail: Memory Drift (Maya at the console, 「Glitch in Orbit」), 同居防線 (the three characters in the entrance hall, 「玄關爭約」) and Hidden identity (Jenna and Noah between the warehouse racks, 「The Rookie」). Dramas without a storyboard show a character look (Merger Season, Forbidden Office Romance) or the placeholder (Crossed Lines, Borrowed Ties), as expected. Quiet Sanctuary, the drama in the report, is not on this phone. All three storyboards were made before 2611021 was installed. The original bug did not affect every drama (El compás del regreso was correct on 2610212), so 3/3 here is good evidence but not proof.

**Verdict: FIXED** (3/3 dramas with a storyboard).

**Evidence:** `screenshots/s2_history.png`, `screenshots/p0352_history_bottom.png`, `screenshots/p0352_tongju_storyboard.png`, `screenshots/p0352_hi_story.png`, `screenshots/16.8.0.2611021_DRA262610P0349_verify.png` (Memory Drift's Scene 1).

## DRA262610P0353 — Opening a drama and cancelling Choose Character moves it to the top of History

**Steps.** History (Crossed Lines 04:12 PM at the top, Merger Season 04:10 PM / 4.6 MB second) › Merger Season › Characters Result › ↻ Replace on Lauren Hayes (Choose Character opens) › Cancel › ← (the assistant landing page) › History. None of the remaining dramas sits at 「Choose your characters」 with unset slots below the top card (Crossed Lines, the only one, is already first), so the Replace path from section 1 was used.

**Seen.** Merger Season stayed second with 04:10 PM and 4.6 MB. Also, opening, scrolling, playing and exporting Memory Drift, 同居防線 and Hidden identity did not move them or change their times.

**Verdict: FIXED** (1/1 on the Cancel path, plus the opening, playing and exporting checks above).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0353_before.png`, `screenshots/p0353_choose.png`, `screenshots/16.8.0.2611021_DRA262610P0353_verify.png`.

## DRA262610P0357 — Play on the video card opens the player paused

**Steps.** History › Memory Drift › Play on the 「Here's your drama.」 video card (one tap). Repeated on 同居防線.

**Seen.** The result page opens and the video plays right away. Screens 2 s and 5 s after the tap show different frames, with no ▶ overlay (Memory Drift went from 「Neural sync aborted.」 to a close-up; 同居防線: mean pixel difference 63 between the two frames).

**Verdict: FIXED** (2/2).

**Evidence:** `screenshots/p0357_a.png`, `screenshots/16.8.0.2611021_DRA262610P0357_verify.png`, `screenshots/p0357_tongju_a.png`, `screenshots/p0357_tongju_b.png`.

## DRA262610P0359 — Leaving the export page asks to leave and cancels the export

**Steps.** Memory Drift result page › Export Full Video (the export starts on the page; there is no Produce step any more) › system Back after 2 s › 「Keep exporting」. Then: Export › ← (top left) › waited. Then: Export › system Back › 「Stop」.

**Seen.** Back and ← both show 「Stop exporting?」 / 「Your video won't be saved.」 with Stop and Keep exporting, which is the spec's fallback (PM Figma 10/22 export states). The old 「Are you sure you want to leave?」 with OK cancelling is gone. Keep exporting: the export finished on the result page at 16:21:01, 「Saved to Gallery」 showed and the file was saved. Stop: returned to the chat; no file was saved (gallery listing). The primary spec behaviour (Back leaves while the export continues in the background) was not built; RD chose the fallback.

**Side observation (not raised; for the analysis).** When the dialog is left open, the export still finishes underneath (16:21:53: toast and file `Memory_Drift - 1793694113127.mp4`). The dialog stays up saying 「Your video won't be saved.」, and tapping Stop afterwards only leaves the page. The file is kept.

**Verdict: FIXED** (3 runs; matches the fallback).

**Evidence:** `screenshots/p0359_producing.png`, `screenshots/16.8.0.2611021_DRA262610P0359_verify.png` (the dialog after Back), `screenshots/p0359_saved_toast.png`, `screenshots/p0359_arrow_dialog.png`, `screenshots/p0359_dialog_after_saved.png`, `screenshots/p0359_after_stop.png`, `16.8.0.2611021_DRA262610P0359_log.txt` (export start = `MPEG4Writer: PreAllocation enabled`, Back = `KEYCODE_BACK`, finished = `MOOV atom was written` plus a Toast).

## DRA262610P0360 — Export producing and done pages show another drama's thumbnail

**Steps.** Exported Memory Drift (16:18–16:22), then opened 同居防線 › Play › Export Full Video, watching the producing state and the end.

**Seen.** There are no separate producing or done pages any more. The export runs on the drama's own result page: while it is producing, the dimmed preview shows 同居防線's own Scene 1 frame with the spinner, and the end shows 「Saved to Gallery」 over the same frame. Memory Drift's frames, from the previous export, never appear. The file is `同居防線 - 1793694352823.mp4`.

**Verdict: FIXED** (1/1 right after another drama's export; the pages in the report were removed).

**Evidence:** `screenshots/16.8.0.2611021_DRA262610P0360_verify.png` (producing), `screenshots/p0360_tongju_done.png`.

## DRA262610P0389 — System Back in History Manage mode leaves History

**Steps.** (a) Memory Drift chat › History icon › Manage › Select All (every card checked) › system Back. (b) The ticket's path: the assistant landing page › Create Your Drama › History › Manage › Select All › system Back.

**Seen.** Back leaves Manage mode (the cards are unchecked; Manage, the info icon and New Chat are back) and stays in History both times. Nothing was deleted.

**Verdict: FIXED** (2/2).

**Evidence:** `screenshots/p0389_manage.png`, `screenshots/p0389_selected.png`, `screenshots/16.8.0.2611021_DRA262610P0389_verify.png`, `screenshots/p0389_from_create_after_back.png`.

## DRA262610P0391 — System Back on the Export Full Video sheet also closes the result page

**Steps.** Memory Drift and 同居防線 result pages › Export Full Video, several times.

**Seen.** There is no Export Full Video sheet on 2611021: the tap starts the export straight away (see the export-flow note above). The ticket's step 7 (Back on the sheet) cannot be done. The closest check: system Back during the export shows 「Stop exporting?」. Keep exporting stays on the result page and the export finishes there (`16.8.0.2611021_DRA262610P0391_verify.png`, 同居防線, 16:26; file saved 16:26). The result page is not closed.

**Verdict: NOT RE-VERIFIED.** The export sheet was removed in this build, so the scenario no longer exists. Back during the export no longer closes the result page.

**Evidence:** `screenshots/p0391_sheet.png` (Export tapped: spinner, no sheet), `screenshots/p0391_back_dialog.png`, `screenshots/16.8.0.2611021_DRA262610P0391_verify.png`, `16.8.0.2611021_DRA262610P0359_log.txt`.

## End state

The app is on the Launcher, on Stage. Debug info was not used. Nothing is committed. No ticket was touched.

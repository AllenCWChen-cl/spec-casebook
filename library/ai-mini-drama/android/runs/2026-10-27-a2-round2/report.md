# AI Mini Drama Android — Phase A2 report (round 2, table v2)

Plan `runs/RUN-PLAN-20261027-A2.md` · table v2 (471 rows, draft 20261027-171228; A2 ran the 414 rows A1 had not recorded as
Pass / Fail) · run folder `runs/2026-10-27-a2-round2/` · first written 2026-10-28 03:45 (phase wrap-up), **updated 2026-10-28
~14:45 with the retest after A2** (REQ-047 / REQ-048: A2-r1 credit-blocked cases, A2-r2 fresh-install cases). Both wrap-ups
had no device work: no device-android.ts calls; Appium and the review / plan servers left running.

## Environment
| | |
|---|---|
| Build | PowerDirector Mobile for Android 16.8.0 (versionCode 2610212), TR261021-0082 (APK from the TR's OneDrive folder, MD5 checked, `adb install -r` 10/27 14:47; for A2-r2 `adb uninstall` + `adb install` of the same APK 10/28 13:07, then `pm clear` 13:41). TR header read 10/28: title 16.8.0.2610212, Build field 16.8.0.2610171 |
| Server / device | Stage server (yellow Launcher bar; `[AID]Stage_Server`) · Sony Xperia 10 III (XQ-BT52, HQ61563393), Android 12, on USB · Appium + UiAutomator2 on port 4724 (left running) |
| Account / tier | 「ethan.hsu.cl」 signed in by the user (REQ-045), Free · credits 1319 → 19 (A2), topped up by the user, 18835 → 18043 (retest) |
| Debug controls | none on Android 16.8 (no Pink, fault switches, tier switch, Write Log); fault switches are planned for a later Android build (user, 10/28); logcat captured per segment into `logs/<segment>-<time>/` (git-ignored) |
| Dates (CST) | A2: 10/27 17:21 → 10/28 03:10 (A2-a … A2-j), wrap-up 03:10 → ~03:45 · retest: 10/28 11:02 → 14:25 (A2-r1, A2-r2 / r2b / r2c / r2d), wrap-up update from 14:25 |
| Settings | Developer options › Stay awake ON; Wi-Fi turned off / on over USB for the offline cases (A2-c2, A2-g2, A2-h), restored each time; not toggled in the retest. Uninstall / fresh install allowed by the user for A2-r2 (REQ-048) |

## Results — 414 cases: 160 Pass · 130 Fail · 124 Blocked · 0 Not run
Dispositions: Fail = 126 defect, 4 question (PM) · Blocked = 64 test-data, 57 observability, 3 defect (TC-297 upstream of
ISS-AMDA-37; TC-303 / TC-304 upstream of ISS-AMDA-45). Before the retest: 153 Pass · 122 Fail · 139 Blocked. Video gate before
A2-g1: **pass** (Workplace Romance (2) Best preview, 22:05:44, ~9 min, 2 clips). The retest queue (TC-501) is cleared.

### Per segment
Retested cases were re-recorded under A2-r1 / A2-r2, so the original segments below no longer count them (A2-j keeps only the
three new-account rows). Credits are those spent in each segment.

| Stage | Segment | Span (CST) | Cases | Pass | Fail | Blocked | Credits |
|---|---|---|---|---|---|---|---|
| Entry, idea, outline | A2-a | 17:22–17:27 | 6 | 1 | 2 | 3 | 0 |
| Characters, cast picker | A2-b | 17:28–18:33 | 32 | 10 | 15 | 7 | −75 |
| Make your character | A2-c1 | 18:34–18:50 | 29 | 18 | 9 | 2 | −8 |
| Make your character | A2-c2 | 18:51–19:19 | 28 | 16 | 9 | 3 | −24 |
| Storyboard (+ always-generate video) | A2-d1 | 19:20–20:21 | 30 | 10 | 18 | 2 | −434 |
| Storyboard, Preview, text | A2-d2 | 20:23–21:12 | 29 | 9 | 4 | 16 | −96 |
| Chat, History | A2-e | 21:13–21:43 | 29 | 12 | 10 | 7 | −3 |
| Credits and limits | A2-f | 21:44–21:52 | 25 | 2 | 1 | 22 | 0 |
| Video (gate first) | A2-g1 | 21:53–22:55 | 32 | 15 | 16 | 1 | −240 |
| Video, errors, captions | A2-g2 | 22:55–23:56 | 32 | 11 | 8 | 13 | −213 |
| Video, regeneration, export | A2-g3 | 23:57–01:07 | 30 | 6 | 7 | 17 | −172 |
| Offline, interruption, waits | A2-h | 01:07–01:54 | 28 | 11 | 16 | 1 | −35 |
| Templates | A2-i1 | 01:55–02:28 | 31 | 15 | 4 | 12 | 0 |
| Templates | A2-i2 | 02:29–03:07 | 32 | 17 | 3 | 12 | 0 |
| Fresh install, new account | A2-j | 03:08–03:10 | 3 | 0 | 0 | 3 | 0 |
| Retest: credit-blocked | A2-r1 | 11:02–13:10 | 9 | 2 | 7 | 0 | −598 (+6 other device) |
| Retest: fresh install | A2-r2 (b, c, d) | 13:05–14:25 | 9 | 5 | 1 | 3 | −188 |
| **Total** | 17 segments | 10/27 17:22 → 10/28 14:25 | **414** | **160** | **130** | **124** | **−2086** (+6) |

## Retest after A2 (user, 2026-10-28, REQ-047 / REQ-048)
The user added credits to 「ethan.hsu.cl」 and allowed uninstall / fresh install on Android. The 9 cases Blocked only for credits
(A2-r1, signed in) and the 9 fresh-install cases (A2-r2) were reopened as Not run and re-run in this folder.

### A2-r1 — credit-blocked cases (11:02–13:10): 2 Pass, 7 Fail (6 defect, 1 question)
| Case | Result | What happened | eBug batch |
|---|---|---|---|
| TC-501 | Fail defect | Shared Shelter: after the cast ✓, after the storyboard and after the full video finished (11:39) the chat sat back at the first Story Outline with ↓; 「Here's your drama.」 / Create Next Episode ~8 screens down; the 「Create storyboard」 bubble sat mid-screen | existing Android ticket DRA262610P0260 (not listed; dedupe.txt); bubble part = ISS-AMDA-31 |
| TC-173 | Fail defect | longest wait 845 s (Fast full video 90 s, Generate 11:25:15 → turn_end 11:39:20) with a shimmer placeholder; 79 s with no animation (cast ✓ → storyboard card) | merged into ISS-AMDA-43 (F-38) |
| TC-490 | Fail defect | next episode of the No-captions drama (Morning Key) asked nothing about the format and exported burned-in English captions (0:21, 0:25); episode 1's export is clean | existing Android ticket DRA262610P0240 (not listed; dedupe.txt) |
| TC-496 | Fail defect | French scripts (Accords nocturnes, fr_FR) quote dialogue with 「」 and fullwidth colons, never « »; Android has no Fix scenes, read on the storyboard scene page | existing Android ticket DRA262610P0251 (not listed; dedupe.txt) |
| TC-166 | Fail defect | after leaving to the Launcher during a video, every History row opened an empty 「Hi, I'm your AI Drama Assistant」 chat for ~2 min (agent_destroy 125 s, agent_create FAILED); the job paused until reopened (resumed 12:31:26) | new ISS-AMDA-46; pause part = existing Android ticket DRA262610P0026 (not listed; dedupe.txt) |
| TC-157 | Fail defect | ■ Stop in video stage ①: no warning, the turn is cancelled at once (calls=0, nothing charged); once the video is charged there is no ■ | merged into ISS-AMDA-21 (10/22: no stop control at all) |
| TC-467 | Fail question | exported captions (The New Guy's Secret, 1080×1920) two lines, ~5 % of frame height per line — not visibly smaller; the spec gives no size | PM question |
| TC-502 | Pass | Home for 9 min during a Fast preview, force-stop and relaunch: clips finished, 「… is ready」 toast, no failed / refund message | — |
| TC-466 | Pass | The New Guy's Secret storyboard ◆34: 11 images, Scene 3 「The Man She Respects」 has both images | — |

Observations: **O-25** Shared Shelter (No captions) exported without the 「PowerDirector」 watermark while the other two Free
exports carry it; the New Guy's Secret file is saved as Romance_(7).mp4, not the drama title (existing Android ticket DRA262610P0216,
Cancelled; not listed). **O-26** after Create Next Episode the reply says 「Generated the full 6-beat storyboard…」 before anything was
generated (existing Android ticket DRA262610P0174; not listed).

### A2-r2 — fresh-install cases (13:05–14:25): 5 Pass, 1 Fail, 3 Blocked
Uninstall + install of the TR261021-0082 APK (13:07, MD5 ok, 16.8.0 / 2610212). The fresh install came up on **Production**;
`testserver.config` moved it to Stage, but signed-out turns then failed (O-27, see the lesson below) until `pm clear` (13:41).

| Case | Result | What happened | eBug batch |
|---|---|---|---|
| TC-104 | Pass | first History open (13:10, Production install): 「No dramas yet」 / 「Start a story with AI…」 + New Chat | — |
| TC-034 | Pass | after the pm clear (Stage, signed out): 「Tap to choose a look for Leo」 0.85 s after Mia's look; DRA262610P0120 / P0196 not reproduced on fresh data | — |
| TC-309 | Pass | tapping the Sam slot while the hint shows closes it | — |
| TC-105 | Pass | first History visit with a drama: the hint bubble shows by itself and closes on an outside tap (it covers the first row's date / title while shown; the empty-list visit on Production showed none) | — |
| TC-083 | Pass | leaving during the first video: 「Find your video here in History.」 under History, dismissed by a tap | — |
| TC-081 | Fail defect | first video of the install (Glad We Came, Fast preview, 13:56:23): no 「Get notified when your video is ready?」 pre-prompt; none on the second video either (Love, Unscripted, 14:16:25) | new ISS-AMDA-45 (iOS lead DRI261895P0022) |
| TC-303 | Blocked defect | upstream TC-081: no pre-prompt, so 「Notify me」 can't be tapped | behind ISS-AMDA-45 |
| TC-304 | Blocked defect | upstream TC-081: no pre-prompt, so 「Not now」 can't be tapped; second video also without it | behind ISS-AMDA-45 |
| TC-224 | Blocked test-data | after reinstall + sign-in the chat answered with no limit dialog, but the app and logcat show no remaining-chat count and the Stage limit is 9999, so 'full again' can't be read | — |

### Credits for the retest
Pill 18835 at 11:02 → 18231 at 13:03 → **18043** at 14:19 (logcat totalRemain): **−792**, of which 786 on this phone and 6 from
「AI Hairstyle PhotoDirector (iOS)」 rows at 12:04 / 12:05 on the shared account (Credit Details, `ledger/A2-r1-20261028-1310.txt`).
A2-r1 598: Shared Shelter storyboard 31 + Fast full 90 s 180; Morning Key storyboard 28 + Fast preview 60; Accords nocturnes
storyboard 25 + Fast preview 60; New Guy's Secret storyboard 34 + Fast full 90 s 180; the Storm Warning preview was stopped before
the charge (0). A2-r2 188: Glad We Came storyboard 31 + Fast preview 60; Love, Unscripted storyboard 37 + Fast preview 60. No
failures, so no refunds were due.

### Lesson: Stage vs Production on a fresh install (O-27; now in the skill's Android section)
The server is chosen by an empty `testserver.config` in `/sdcard/cyberlink/PDR/` (present = Stage at the next launch). It
survives an uninstall, but this time it was missing and the fresh install launched first on **Production** (dark top bar, no
templates; the `[AID]…_Server` content-desc is not reliable). That first launch minted the credit-system UUID on Production;
after the file was put in place the app showed Stage, but every signed-out turn failed `403 "Fail to verify uuid"` (and
getMemberRemain / checkDailyBonus). `adb shell pm clear` (covered by the fresh-install OK) minted a new UUID on Stage and fixed
it. For every future fresh install: put the file in `PDR/` **before the first launch**, then confirm the **yellow** Launcher bar.
Lost time: ~35 min (13:10–13:45) and two waits for the user.

## Main defect groups (eBug batch `ebugs/2026-10-27-a2/`, updated for the retest and the per-OS dedupe)
40 drafted entries, all proposed to file (F-1…F-40; ISS-AMDA IDs kept, so 04, 06, 14, 26, 36 and 44 are gaps), 6 PM questions
plus 1 single-sighting hold, 7 observations not raised. Nothing filed, uploaded or commented. **Dedupe per OS (user,
2026-10-28):** a finding that matches an existing Android ticket, open or resolved, is not listed in the drafts or on the review
page; it is kept only in `ebugs/2026-10-27-a2/dedupe.txt`. That took out 6 former entries (ISS-AMDA-04 ≈ DRA262610-0019,
-06 ≈ -0061, -14 ≈ P0147, -26 ≈ P0027, -36 ≈ P0222, -44 ≈ P0123), the one-character wait of ISS-AMDA-43 (TC-170 ≈ -0032 /
P0302) and all 57 former recheck rows (63 tickets); before it the batch had 46 entries, 40 to file and 6 on hold. iOS tickets
never make a duplicate: TC-081 (ISS-AMDA-45, iOS DRI261895P0022) and the other iOS-matched entries stay entries. Retest changes:
new ISS-AMDA-45 (TC-081, no notification pre-prompt) and ISS-AMDA-46 (TC-166, History opens an empty chat after leaving a
video); TC-157 joins ISS-AMDA-21, TC-173 joins ISS-AMDA-43; TC-467 is a PM question; O-27 is a test-setup note.

- **PM 10/22 §13.24 two-stage storyboard / video not implemented (RD to confirm):** no 「Leave while we're preparing?」 in
  video stage ① (F-19; the storyboard side is an existing Android ticket), stage ② still asks 「Stop and lose your credits?」
  (F-20), the ■ stop button is still there and cancels a video silently (F-18, now with TC-157), the stage messages are the old
  ones and the storyboard charges image by image (F-17), a swiped-away app pauses the storyboard (F-21). Export: leaving the
  producing page cancels the export (F-36).
- **Characters — money and state:** Leave anyway drops finished, paid looks with no refund (F-7, S2); X / Leave on the ready
  sheet still commit the cast (F-6); closed results are saved to Mine anyway (F-14); price ◆4 where the Design says ◆6 (F-4);
  filter lists Other twice (F-3); the chat character-change flow differs (F-5, F-8, F-9, F-10, F-11).
- **Reopen and chat continuity:** reopened dramas lose the confirmed cast / characters card (F-24, S2), lose earlier
  messages (F-25), open at the outline (F-23); after leaving a video, History opens an empty chat for ~2 min (F-40); the PM
  10/20 §13.2 return / send scroll rules are not followed (F-27, F-28).
- **Video update, episodes and export:** a scene update shows no updating state and appends a card (F-32), download saves old
  clips meanwhile (F-33), the player opens paused (F-34), the push keeps the old name after a rename (F-35), export pages show
  another drama's thumbnail (F-37); no first-video notification pre-prompt (F-39).
- **Waits:** 27 s (outline), 52 s (revision), 323 s (storyboard), 119 s (export) and 845 s (full video) with only Stop or
  leaving possible (F-38).
- **Existing Android tickets that still reproduce** are no longer listed in the batch (per-OS dedupe); the cases, BugCodes and
  what A2 saw are in `dedupe.txt`. Fix claimed but not holding on 2610212 (for information, no comment or reopen):
  DRA262610-0019, -0049, -0057, P0154 and RDResolved P0135, -0050, P0169, P0244, P0261.
- **Not reproduced / fixed on 2610212:** singular 「1 character isn't set yet」 (DRA262610P0098 / iOS DRI261896P0016);
  Pop Star genders (P0173 / P0142); Ring and Beer Heir presets load (P0204 / P0201 / P0148); the History ⓘ bubble closes on an
  outside tap (DRI261893-0013 / DRI261896P0026 part; TC-105 Pass on fresh data); the next-slot hint on fresh data
  (DRA262610P0120 / P0196, TC-034 Pass); TC-482: the DRA262610P0231 error text did not appear (the stop did).

PM questions: TC-478 (no prefill from the outline; P0225), TC-479 (result card labels; P0227), TC-159 (first outline
discarded on leave), TC-161 (character generation: PM board 9 Stop-and-lose vs the leave-and-return rule), TC-158 (unsent
typed idea dropped), TC-467 (exported caption size; no size in the spec). Held: O-11 (no frame of the reopened state).

## Blocked — 124, grouped by what clears them
| Group | Cases | Why | What clears it |
|---|---|---|---|
| Fault injection / observability | 56 | Android 16.8 has no fault switches, delay fixture or STT-failure switch; no generation in A2 or the retest failed on its own (TC-030, 042, 043, 384, 500, 338, 353, 335, 336, 390, 068, 077, 413, 078, 140, 141, 427, 428, 491, 292, 293, 295, 299, 312, 313, 355, 091, 483, 499, 376, 092, 362, 363, 093–095, 379, 098, 365, 146–151, 437, 454, 296, 298, 305, 388, 314–316, 518, 446) | the fault switches planned for a later Android build (user, 10/28), or RD fixtures |
| Daily limit | 12 | Stage never showed 「Daily Free Chat Limit Reached」 (limit 9999; ~68 chats on 10/27, TC-215) and shows no remaining-chat count; Remote Config needs RD; TC-464 also needs a tablet (TC-464, 117, 215, 218, 219–221, 223, 224, 368, 369, 393) | RD: the Stage daily allowance or a Remote Config change |
| Template full generation | 24 | REQ-019: template journeys stop before full generation (TC-236, 238, 240, 242–274 even, 445, 449–451) | the user lifts REQ-019 |
| Low balance / purchases | 10 | purchase and low-balance rows; buying is not allowed and the account now has credits (TC-136, 152, 116, 222, 226–228, 231–233) | a low-balance test account; the user's OK for (sandbox) purchases |
| Language | 5 | Android 12 has no per-app language; Japanese app language needs the system language (TC-275, 276, 277, 424, 406) | the user switches the phone's system language to Japanese for those rows |
| Paid tier | 4 | no Pro account, no debug tier switch (TC-118, 217, 225, 229) | a Pro (subscription) test account |
| New account | 3 | need an account with no creations (TC-114, 323, 324) | a new test account |
| Upstream defect | 3 | TC-303 / TC-304 behind ISS-AMDA-45 (no pre-prompt); TC-297 behind ISS-AMDA-37 (no 「Your video has been updated.」) | the fixes |
| Other | 7 | TC-002 CMS banner never served (DRA262610P0124 lead); TC-411 no rejected stock look; TC-054 no public-figure photo; TC-412 media-permission reset is a system setting; TC-366 crop cache in private storage (ask RD); TC-139 no scrollable script; TC-475 precondition not reached | photos / looks as fixtures (fixtures.md), the user's OK for the permission reset, RD for the cache |

## Credits (shared account; pill, logcat totalRemain, Credit Details)
A2: start **1319** (10/27 17:22) → **19** (10/28 03:10): **−1300**, all from this phone (per segment above). Main costs:
two storyboards ◆31 / ◆34 and Quiet Sanctuary's Seedance 2.0 preview ◆120 + full episode ◆240 (A2-d1); Best ◆120 + two
Fast previews ◆60 (A2-g1); Corporate rivals full episode ◆120, 夜市 preview ◆60, scene regeneration ◆33 (A2-g2); three scene
regenerations ◆30–33, Mutual sacrifice storyboard ◆19 + preview ◆60 (A2-g3). Refunds: the natural 4xx scene failure in A2-d1
(TC-067 / TC-465) was refunded +3 as specified. Lost value: TC-337 Leave anyway kept −12 for three finished looks that were
dropped (F-7, ISS-AMDA-09). No video failure was charged (TC-485 storage failure: nothing charged).
Retest: **18835 → 18043** (−792 incl. 6 from another device; details above). Phase total from this phone: **−2086**.

## Time (`run-log.ts time --cases`, activity.log)
- **Whole phase:** wall 21h 04m (10/27 17:21 → 10/28 14:25 CST) = test **12h 54m** + idle 8h 10m in two gaps: 03:10 → 11:02
  (7h 52m, between the first wrap-up and the retest, waiting for the credit top-up) and 12:41 → 12:58 (17m inside A2-r1, while
  TC-467's full video generated with no device command).
- **A2 (17:21 → 03:10):** 9h 49m, idle 0. Longest cases: TC-075 28m, TC-145 22m, TC-087 21m, TC-142 / TC-060 16m.
- **Retest (11:02 → 14:25):** wall 3h 22m, test 3h 05m (A2-r1 1h 45m, A2-r2 1h 23m incl. the server detour and two waits for
  the user's sign-in). Longest cases: TC-501 43m (storyboard + full video), TC-034 33m (fresh install, Production / Stage, pm
  clear), TC-304 23m, TC-490 22m, TC-502 22m (9-min Home wait).
- Wrap-ups: first ~35 min; this update ~25 min (no device work).

## Tokens (`token-usage.ts`, session e10f7c9c + its subagents, claude-opus-5-5)
- **A2 run (17:21 → 03:10):** 1,898 messages · 336.5 M tokens processed (weighted 46.0 M); first wrap-up ~30 M (later sum
  19:10Z → 03:00Z incl. orchestrator: 34.4 M).
- **Retest (03:00Z → 06:25Z):** 414 messages · input 942 · cache write 2.58 M · cache read 60.49 M · output 0.18 M =
  **63.2 M processed** (weighted 10.15 M). A2-r1 34.9 M (weighted 5.95 M), A2-r2 28.3 M (weighted 4.20 M).
- **This wrap-up update:** ~10 M processed at the time of writing (weighted ~1.4 M).

## Plan usage (`runs/usage.jsonl`, 6.25× Team seat; figures in 1× Pro-%)
- **Token-rate estimate** (weights 1 / 1.25 / 0.1 / 5; rate from iOS P1 = 300 Pro-% of a 5-hour window,
  `runs/usage-calibration.json`): A2 run **372 Pro-%** of a 5-hour window ≈ 60 % of one seat window; retest **82 Pro-% ≈ 13 %
  of one 5-hour window of the 6.25× seat** (A2-r1 48, A2-r2 34); weekly (ratio 0.168) retest ≈ 14 Pro-% ≈ 2 % of the seat's
  week (A2: 62 Pro-% ≈ 10 %). This update so far ≈ 12 Pro-% (≈ 2 % of a seat window).
- **Account total (shared, upper bound):** A2 run: 5-hour +49 points, weekly 5 → 14 %. Retest: no snapshot at its start; the
  5-hour window that reset at 05:50Z read 36 % at 05:05Z (window from 00:50Z, so it includes other use before 11:00 CST) and the
  next window 13 % at 06:25Z; weekly 14 → 24 % from the first wrap-up's end to the retest's end, including overnight use by
  others on the shared account. These readings cannot isolate the retest; the token estimate is the main figure.

## What can still be unblocked
1. **Fault switches** (planned for a later Android build, user 10/28): the 56 fault-injection / observability rows (failed
   scenes and clips, slow generations, STT failure). Recheck every new Android build for them.
2. **A new test account** with no creations: TC-114, 323, 324.
3. **A Pro account** (no debug tier switch on Android): TC-118, 217, 225, 229.
4. **Purchases / low balance:** the user's OK for (sandbox) purchases, or a low-balance account: TC-136, 152, 116, 222,
   226–228, 231–233.
5. **Stage daily chat limit:** RD sets the Stage daily allowance or a Remote Config change (Stage limit 9999 and no
   remaining-chat count): TC-464 (also a tablet), 117, 215, 218–221, 223, 224, 368, 369, 393.
6. **App language:** the user switches the phone's system language to Japanese (Android 12 has no per-app language): TC-275,
   276, 277, 424, 406.
7. **REQ-019 template journeys:** the user lifts REQ-019 for the 24 template full-generation rows (credits are now available).
8. **Fixes:** TC-303 / TC-304 wait for ISS-AMDA-45 (no notification pre-prompt), TC-297 for ISS-AMDA-37.
9. **Filing:** Creator, TRCode (TR261021-0082; its Build field reads 2610171 — confirm), source tag and method on the review
   page `ebugs/2026-10-27-a2/20261027_eBug_review_AI-Mini-Drama-A2_16.8.0.html`; nothing is filed until then.

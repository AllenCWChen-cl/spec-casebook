# Run state — A1 Android round 1: complete full run on the Xperia 10 III (REQ-042)

Table: library/pdr/ai-mini-drama/android/cases.csv
Started: 2026-10-27T06:54:24.708Z

## Environment
- Phone: Sony Xperia 10 III (XQ-BT52), serial HQ61563393, Android 12, 1080 × 2520 px, on USB (adb `usb:`);
  Developer options › Stay awake ON; no PIN lock.
- Build: PowerDirector Mobile for Android 16.8.0 (versionCode 2610212) from TR261021-0082, installed 2026-10-27 14:47
  (`device-android.ts build` confirmed at A1-a1 start, 15:00).
- Server: Stage (Launcher toolbar content-desc `[AID]Stage_Server`).
- Account: **signed out** (REQ-044; never sign in, buy or type a password). Tier Free.
- Debug controls: none (no Pink, no fault switches, no Write Log / Log stage timings on Android 16.8); logs = logcat
  capture per segment (`logcat start` / `pull-logs`).
- Driver: scripts/device-android.ts (Appium UiAutomator2, port 4724).

## Checkpoints

### 2026-10-27T07:23:57.600Z · next TC-381 (A1-a2)
{"Pass":16,"Blocked":88,"Fail":8,"Not run":350}

A1-a1 done 15:23 (26 cases: 16 Pass, 8 Fail defect, 2 Blocked test-data). Signed out, Free, Stage, credit pill 0 / Mine Credits 「None」 (15:04). UI Edit Mode restored to Portrait. No Pink/fault switches on Android. History holds 4 dramas: 「忘れ物の傘」 (barista, Japanese/No captions, outline + characters offer), Merger Season template (English/Yes, outline + characters), nurse/radio DJ comedy (English/Yes defaults, outline + characters) and the 15:20 Japanese library drama (Japanese/No, outline + characters). Phone left in a new chat with an unanswered format card for 「夜の屋台で働く青年と常連の小説家の小さな恋の物語」 (Back before the outline saves nothing, R-288). Logs pulled to logs/A1-a1-20261027-152246 (logcat capture still running); log-slice.ts does not read Android logcat, causes read by hand. Outlines are generated signed out with 0 credits (O-3).

### 2026-10-27T08:16:35.252Z · next TC-033 (A1-b1)
{"Pass":32,"Blocked":89,"Fail":15,"Not run":326}

A1-a2 done 16:16 (25 cases: 15 Pass, 8 Fail defect, 2 Blocked — TC-030 observability at init, TC-508 test-data). Signed out, Free, Stage, credit pill 0. Fails: TC-024 custom outline header 「Story Outline Result」 (template shows 「Story Outline & Characters Result」), TC-448 two headers above the slots, TC-357/TC-358 credit pill leaves a generating chat with no dialog and the chat is saved, TC-452 template chat system back no dialog + saved, TC-497 quoted lines / 3 scenes dropped silently, TC-031 policy block shown as 「Something went wrong」 + Try again (log final_state=block). Gates: template storyboard 37 credits, Create my character 4 credits (O-7). History now (newest first): Unspoken Regret (16:10, custom 3-scene script → Claire/Julian, outline + Choose your characters), Workplace Romance (1) (15:53, clean Forbidden Office Romance template: outline + 4 character cards + 37-credit Not enough credits card), Workplace Romance (15:41, broken: outline without characters, O-4), Starlight and Sleight (15:34), Curb Rules (15:32), Signal in the Dark (15:27, custom, outline + Maya/Leo slots), then the 4 A1-a1 dramas. Phone left in Workplace Romance (1) chat after cancelling Choose Character (draft discarded). App was swiped away and relaunched once at 15:37 (TC-386). Logs pulled to logs/A1-a2-20261027-161559 (logcat capture rotated, still running).

### 2026-10-27T08:19:35.908Z · next TC-480 (A1-b1)
{"Pass":34,"Blocked":89,"Fail":15,"Not run":324}

paused by user mid A1-b1 for credits; next TC-480. A1-b1 16:17–16:20: 2 cases recorded (TC-033 Pass, TC-036 Pass), 17 left Not run in A1-b1 (4 pre-Blocked observability). Still signed out, Free, Stage, credit pill 0 at 16:17 (logcat totalRemain=0). Phone left in 「Unspoken Regret」 (16:10 custom drama, Claire Vance / Julian Hayes both unset) with Choose Character open on Claire Vance, filter Female + East Asian applied (chips shown), nothing picked; the user will add credits / sign in on the phone, so re-read the account, tier and pill at resume. O-8 added (keyboard opens over the picker after filter ✓). Logs pulled to logs/A1-b1-20261027-161919 (no failures in the cases' windows); logcat capture stopped. Plan for the rest of A1-b1: picker cases on Unspoken Regret (TC-410, TC-371, TC-034/035 first pick, TC-037/038, TC-039/041, TC-040, TC-477 + TC-044 + TC-505 on confirm, TC-045/046), TC-480 Add New and TC-487 on 「Signal in the Dark」 (Maya/Leo unset), TC-456 needs Generate all.

### 2026-10-27T08:27:03.054Z · next TC-480 (A1-b1)
{"Pass":34,"Blocked":89,"Fail":15,"Not run":324}

Resume A1-b1 16:27 (REQ-045): signed in — Mine shows account name 「ethan.hsu.cl」; tier Free (Mine card 「Free」 / Claim offer); credits 1339 (Mine › Credits, 16:27); server Stage (Launcher content-desc [AID]Stage_Server); build 16.8.0 (2610212) confirmed. logcat capture restarted (logs/.live/logcat-20261027-162647.txt). Next: re-run TC-508, then TC-480 onward in A1-b1. Never buy credits, never sign out.

### 2026-10-27T08:55:22.261Z · next TC-119 (A1-b2)
{"Pass":42,"Blocked":88,"Fail":25,"Not run":307}

A1-b1 done 16:55 (resumed 16:27 signed in, REQ-045). Account 「ethan.hsu.cl」 (Mine), Free, Stage ([AID]Stage_Server), build 2610212. Credits 1339 at 16:27 → 1319 at 16:55 (pill and logcat totalRemain): −4 TC-508 Create my character (img 3 + tts 1), −4 TC-046 Update characters (Julian), −12 TC-041 Generate all ×3; no failures, so no refunds due. TC-508 re-run: Fail (descriptions role-only, DRA262610P0290). A1-b1 now complete: 23 cases — 10 Pass, 9 Fail defect (TC-480 Add New regenerates at once, TC-410 checkbox outline, TC-039 plural subtitle + ◆8 not ◆12, TC-040 ◆4 not ◆6, TC-477 no gender warning + outline turned 'her', TC-487 no duplicate-look warning, TC-045 card lacks 「1 character」, TC-046 older cards' images rewritten, TC-505 outline rewritten silently), 4 Blocked observability. Every AMD turn in the window ended final_state=complete (no tool failures). O-9 – O-12 added. Library now holds two 「Mine」 characters (TC-508 Emily look; chat-made male Julian, O-10). History (newest first): Trapped Icons (16:47, celebrity idea, cast set by Generate all, Create storyboard ◆22 offered), Unspoken Regret (cast Claire = East Asian woman / Julian = male Mine look, Create storyboard ◆34), Signal in the Dark (Maya/Leo/Gabe set, Leo and Gabe share one look, Create storyboard ◆25), Workplace Romance (1) (Emily = Mine look, Create storyboard ◆37), then the older ones. Phone left in Trapped Icons on the Create storyboard card (not generated). Logs pulled to logs/A1-b1-20261027-165450 (logcat capture still running). Next: TC-119 (A1-b2).

### 2026-10-27T09:10:03.032Z · next TC-121 (A1-b2)
{"Pass":46,"Blocked":88,"Fail":26,"Not run":302}

stopped by user mid A1-b2; next TC-121 (run-log next; TC-411 half-searched); balance 1319. A1-b2 16:56–17:09: 5 cases — TC-119 Pass, TC-120 Pass, TC-288 Fail defect (Southeast Asian / Mixed filters return an empty grid with no empty-state text), TC-310 Pass, TC-326 Pass; TC-411 left Not run mid-search (no rejected infant look found yet: Age 1–5 empty, Age 1–16 four stylised looks, none at the library's end). Signed in 「ethan.hsu.cl」, Free, Stage, build 2610212; credits 1319 at 16:56 (pill + logcat totalRemain) and 1319 at 17:09 (pill): nothing charged this segment. O-9 corrected (「White」 exists at the right end of the Ethnicity row). Phone left in Trapped Icons on the Create storyboard ◆22 card (picker closed with X › Leave, cast unchanged: Tessa / Erick / Olivia). Logs pulled to logs/A1-b2-20261027-170939 (only ad-load warnings, no AMD failures); logcat capture stopped. Remaining A1-b2 plan: TC-411, TC-337/TC-403/TC-121 (need a new 2-character custom drama + Generate all ◆8 each), TC-346 then TC-309 (hint once per user; seen at TC-034), TC-291, chat changes on Trapped Icons (TC-348, TC-391, TC-349 + TC-351, TC-350, TC-429), TC-352 needs a storyboard (◆22), TC-453 on template 「The Art of Falling」.

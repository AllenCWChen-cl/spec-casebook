# AI Mini Drama Android — Phase A7 report (round 7, table v6) — final

Plan runs/RUN-PLAN-20261029-A7.md · table v6 (501 rows, draft 20261029-152721, REQ-061) · run folder runs/2026-10-29-a7-full/ · final wrap-up 2026-10-30 (no device work; Appium and page servers left running). Replaces the interim report written after A7-i2: A7-j (three clean installs, user signing in) and the 9 cases deferred to the user (REQ-062) are now run.

## Environment
- Build 16.8.0 (2610212), TR261021-0082 · Stage (yellow bar every segment) · Sony Xperia 10 III HQ61563393, Android 12, USB · Appium/UiAutomator2 4724
- Account ethan.hsu.cl, Free · credits 15079 → 12302 (−2777; A7-a1 … A7-i2 −2399, A7-j −344, deferred −34)
- No fault switches on 16.8: failure rows ran only on real failures (Wi-Fi drops)
- 2026-10-29 16:05 → 10-30 04:08 (A7-a1 … A7-i2), then 10-30 08:57 – 10:08 (A7-j) and 10:14 – 11:01 (deferred cases) CST
- Languages for TC-276 / TC-277 / TC-406 / TC-424 via `device-android.ts launch --lang` (zh-Hant, ja, fr; system locale through the Appium Settings helper), en-US restored after. Phone left on install #3, en-US.

## Results — 501: 222 Pass · 161 Fail · 118 Blocked · 0 Not run
Fail = 152 defect, 9 question (TC-541 moved question → defect on the clean installs) · Blocked = 81 test-data, 36 observability, 1 defect (TC-297, upstream of TC-145). Video gate pass (A7-g1). 34 Blocked cases in blocked-reasons.json (TC-224 added at this wrap-up).

| Segment | Cases | Pass | Fail | Blocked |
|---|---|---|---|---|
| A7-a1 | 29 | 18 | 9 | 2 |
| A7-a2 | 29 | 20 | 8 | 1 |
| A7-b1 | 24 | 10 | 10 | 4 |
| A7-b2 | 23 | 9 | 10 | 4 |
| A7-c1 | 31 | 19 | 11 | 1 |
| A7-c2 | 30 | 17 | 10 | 3 |
| A7-d1 | 33 | 10 | 19 | 4 |
| A7-d2 | 33 | 18 | 10 | 5 |
| A7-e | 31 | 13 | 16 | 2 |
| A7-f | 32 | 1 | 3 | 28 |
| A7-g1 | 34 | 20 | 14 | 0 |
| A7-g2 | 34 | 13 | 5 | 16 |
| A7-g3 | 34 | 4 | 11 | 19 |
| A7-h | 31 | 14 | 16 | 1 |
| A7-i1 | 32 | 16 | 4 | 12 |
| A7-i2 | 32 | 17 | 3 | 12 |
| A7-j | 9 | 3 | 2 | 4 |
| Total | 501 | 222 | 161 | 118 |
(Deferred cases are counted in their own segments: TC-034 / TC-035 in b1, TC-309 in b2, TC-412 in c1, TC-276 / 277 / 424 / 406 in e, TC-081 in g1. A7-j's own rows: TC-083 / 104 / 105 Pass, TC-303 / 304 Fail, TC-224 Blocked observability, TC-114 / 323 / 324 Blocked at init, new account.)

### After the interim (A7-j and the deferred cases, 2026-10-30)
- Three clean installs (09:00 / 09:37 / 10:03, 16.8.0 (2610212) read back, Stage): History empty state, History hint, 「Find your video here in History.」 bubble and the next-slot hint (TC-034 / 035 / 309) Pass.
- TC-081 / TC-303 / TC-304 Fail: no 「Get notified when your video is ready?」 pre-prompt on the first video of an install (installs #1 and #2), so Notify me / Not now / system back could not be tried — DRA262610P0362 (Assigned).
- TC-541 Fail defect: no intro page on any clean install; a stored 「Don't show again」 is ruled out (O-23).
- TC-412 Fail: after Don't allow the 「File access permission is required」 notice comes back; system back and ‹ do nothing, only Allow exits — DRA262610-0059 (ProposeNAB).
- TC-276 / TC-277 / TC-406 Fail: untranslated strings in zh-Hant, ja and fr (category headers; template names in zh / fr; Create storyboard card; Scene N; video settings card; filter options; chips; agent status and replies), French copy (「Crédits seront consommés…」, 「Langage de la vidéo」) and History times in English 12-hour 「AM」. TC-424 Pass (Japanese cover titles match).
- Observations: O-21 next-slot hint is shown once per install, not once per user (R-252); O-22 History hint waits for a non-empty list; O-23 = TC-541; O-24 credit pill blank for ~6 min after the French relaunch (getCreditRemain / refreshMemberToken error), seen once.
- Charges: A7-j ◆344 (two storyboards ◆13 / ◆31, two Standard previews ◆120, one 15-s full ◆60), deferred ◆34 (Merger Season storyboard). No failures.

### Blocked — what clears each category
| Group | Cases | Clears it |
|---|---|---|
| Fault injection (no failed clip/scene/STT) | 46 | Android build with fault switches or an RD fixture; else real failures (none in A7; Wi-Fi drops are retried, O-14) |
| Template full generation (REQ-019) | 24 | Policy: only when the user asks |
| Credits (low balance / purchase) | 15 | Low-balance test account or a user-approved purchase |
| Daily chat limit | 12 | RD lowering Remote Config (Stage 9999) or a fault switch (TC-224 added: chat count not shown or logged) |
| Paid tier | 5 | Pro / Pro+ test account |
| New account | 3 | An account with no AI Mini Drama creations (TC-114 / 323 / 324) |
| Other | 13 | Per case in blocked-reasons.json (TC-054 celebrity photo, TC-366 private crop file, TC-337, TC-411, TC-002 CMS banner, TC-496 French video, TC-467, TC-485, TC-306, TC-518, TC-464 tablet, TC-297 upstream) |

## Time and tokens
- run-log.ts time: wall 18 h 57 m (10-29 16:04:54 → 10-30 11:01:29), test 13 h 50 m, idle 5 h 06 m in 2 gaps (17:02–17:17, and 04:08–08:59 waiting for the user, REQ-062). Per segment (test time incl. the deferred cases recorded into them): a1 0:19, a2 0:38, b1 0:24, b2 1:03, c1 0:46, c2 0:28, d1 0:45, d2 0:55, e 1:30, f 0:19, g1 1:39, g2 0:44, g3 1:23, h 1:07, i1 0:33, i2 0:37, j 0:39.
- Tokens (token-usage.ts --since 2026-10-29T08:04Z = 16:04 local; orchestrator + 74 subagent transcripts, this wrap-up partly included): 2,441 msgs · in 5,566 · cache write 8,226,139 · cache read 398,719,116 · out 1,003,696 · weighted ≈ 55.2 M.
- Usage estimate (usage-calibration.json, basis iOS P1 37.08 M weighted = 300 %): ≈ 446 % of a 1× Pro 5-hour window (≈ 4.5 windows) ≈ 71 % of one window on the 6.25× Team seat; weekly (×0.168) ≈ 75 % of a 1× Pro week ≈ 12 % of the seat. The account is shared: other people's use is not in these transcripts.

## Coverage
android/coverage.html (`coverage-page.ts ai-mini-drama android --draft 20261029-152721 --runs 2026-10-29-a7-full`): controls 367 — 259 pressed by a row that ran, 44 blocked, 5 not run, 59 n/a; arrows 253 — 147 walked, 52 blocked, 12 not run, 42 n/a; annotation notes 633 — 203 ran, 49 blocked, 12 not run, 368 n/a, 1 untracked. Taps 0: device-android.ts writes no taps.jsonl (no tap proof on Android; counts are by rows). (The `--runs` argument takes the run folder name; a path gives 0 runs.)

## eBug batch ebugs/2026-10-30-a7/ (final; nothing filed, uploaded or commented)
Drafts 20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0.md · review page 20261030_eBug_review_AI-Mini-Drama-A7_16.8.0.html (self-contained 1.9 MB, 11 cards, 0 on hold; 600 px check with all 17 sections open: no element wider than the page) · upload/bodies.json · check.txt 0 errors / 6 warnings (two Short Descriptions 121 / 123 chars; four Repro Steps start with an install or a system-language step) · verify.txt (only the non-applicable sheet-index checks) · dedupe.txt (pool re-read 2026-10-30: 381 Android tickets) · generators/. Prefill ETHAN_HSU / TR261021-0082 / [AIAgent] / API (ebug-defaults.ts, from 2026-10-28-a4; confirm). Spec basis check (REQ-055) per entry; prices per REQ-059.
- 11 new entries ISS-AMDA-60…70 (4 S2, 7 S3; owner RD, Doc for 68 / 69):
  60 S2 failed storyboard images say refunded, ◆15 never returns (TC-465, O-6; closest P0308 named, reviewer may hold)
  61 S2 video prices below the MX sheet (TC-080, TC-230, O-17)
  62 S3 UI raw 「MiniDrama FAIL [scene regenerate]」 debug toast (TC-428, TC-275, O-2; closed P0212 back)
  63 S3 one 「Your drama is ready」 push per clip (TC-307, O-11)
  64 S3 UI scene description editor at 1,000 chars: no red counter / message (TC-312)
  65 S2 Mine character's face ~25 years younger in the full episode (TC-438; closed DRA262610-0041 back)
  66 S2 two-character update charges and regenerates three (TC-350)
  67 S3 clean install opens the landing with no intro page (TC-541, O-23; PM-only, R-472) — new now
  68 S3 UI Doc category headers and (zh / fr) template names stay English (TC-276 / 277 / 406; related P0040 / P0258 RDResolved, reviewer may hold) — new now
  69 S3 UI Doc French copy: 「Crédits seront consommés…」 and 「Langage de la vidéo」 (TC-406) — new now
  70 S3 UI History times in English 12-hour 「AM」 in zh / ja / fr (TC-276 / 277 / 406; closed P0097 named) — new now
- 150 Fail rows and observations left out as Android duplicates (124 tickets incl. A2 P0324–P0363 and A4 P0380–P0392; declined tickets kept as duplicates ⚑) — dedupe.txt only. New since the interim: TC-081 / 303 / 304 = DRA262610P0362; TC-412 = DRA262610-0059 ⚑; the other parts of TC-276 / 277 / 406 = P0258 / P0284 / P0289 / P0326 / P0248 / P0093.
- Held 7: TC-103, TC-158, TC-159, TC-161, TC-234 (PM questions), TC-289 (conflict with TC-288), O-21 (PM: is a per-install hint flag acceptable for 「once per user」?). TC-541 left the held list (now ISS-AMDA-67).
- Not raised 10 observations: O-1, O-3, O-24 (single sightings), O-8, O-9, O-13 (price details / PM), O-14, O-15 (info), O-18, O-22 (TC-105 Pass; no rule for the empty list).
- Reconciliation: 161 Fail + 24 observations = 185 → −150 duplicates → −7 held → −10 not raised → 18 items in 11 entries.

## Next
Reviewer's Copy decisions on the review page, then filing (ebug-tr-filer). Nothing is filed, uploaded or commented until then.

# AI Mini Drama Android — Phase A4 report (round 4, table v3)

Plan `runs/RUN-PLAN-20261028-A4.md` · table v3 (486 rows, draft 20261028-164930, REQ-054) · run folder `runs/2026-10-28-a4-full/` · phase wrap-up 2026-10-29 (interim ~06:30 before A4-j, finished ~09:45 after A4-j; no device work; Appium and page servers left running). All 486 cases recorded.

## Environment
| | |
|---|---|
| Build | PowerDirector Mobile for Android 16.8.0 (2610212), TR261021-0082 (A4-a1 … A4-i2 on the installed build; A4-j: three fresh installs of 2610212, versionCode read back, REQ-047) |
| Server / device | Stage (yellow Launcher bar at every segment start and end; `testserver.config` in PDR/ before each first launch in A4-j) · Sony Xperia 10 III (HQ61563393), Android 12, USB · Appium + UiAutomator2 on 4724 |
| Account | 「ethan.hsu.cl」, Free · credits 18043 → 15143 (−2900; A4-j −308: storyboard ◆34 ×2, Standard Preview ◆120 ×2) |
| Debug controls | none on Android 16.8: 24 fault-injection rows Blocked at init; failure rows ran only on real failures (TC-042/384/500, TC-067/465, TC-293, TC-301) |
| Settings | Stay awake ON; Wi-Fi off/on over USB for offline cases (A4-c2, d2, g2, h), restored and read back; Landscape UI mode set and restored (TC-441) |
| Dates (CST) | 2026-10-28 17:38 → 2026-10-29 06:12 (A4-a1 … A4-i2); A4-j 2026-10-29 08:51 → 09:34 (user signed in) |

## Results — 486 cases: 214 Pass · 143 Fail · 129 Blocked · 0 Not run
Fail = 138 defect, 5 question · Blocked = 93 test-data, 36 observability. Video gate: **pass** (A4-e, as TC-501). 47 Blocked cases the text could not group are in `blocked-reasons.json` (TC-224 added after A4-j: daily chat count not observable on Stage).

| Segment | Cases | Pass | Fail | Blocked |
|---|---|---|---|---|
| A4-a1 | 29 | 19 | 8 | 2 |
| A4-a2 | 28 | 19 | 8 | 1 |
| A4-b1 | 24 | 9 | 12 | 3 |
| A4-b2 | 23 | 9 | 10 | 4 |
| A4-c1 | 30 | 18 | 10 | 2 |
| A4-c2 | 30 | 17 | 10 | 3 |
| A4-d1 | 31 | 10 | 17 | 4 |
| A4-d2 | 31 | 10 | 4 | 17 |
| A4-e | 31 | 12 | 12 | 7 |
| A4-f | 25 | 2 | 1 | 22 |
| A4-g1 | 33 | 18 | 15 | 0 |
| A4-g2 | 33 | 13 | 5 | 15 |
| A4-g3 | 33 | 5 | 8 | 20 |
| A4-h | 32 | 17 | 14 | 1 |
| A4-i1 | 32 | 17 | 3 | 12 |
| A4-i2 | 32 | 16 | 4 | 12 |
| A4-j | 9 | 3 | 2 | 4 |
| **Total** | **486** | **214** | **143** | **129** |

A4-j (fresh installs): TC-083 Pass (「Find your video here in History.」 after Back during generation), TC-104 Pass (empty History signed out), TC-105 Pass (first-visit hint); TC-303 / TC-304 Fail — no 「Get notified」 pre-prompt even on the first video after a fresh install (as TC-081), so Notify me / system Back / Not now could not be tried; TC-224 Blocked (daily chat count not observable on Stage); TC-114 / 323 / 324 Blocked at init (new-account). TC-034 / 035 (one-time look hint) and TC-289 (White filter recheck) were not in A4-j and stay for the next round.

## Time and tokens
- Time (`run-log.ts time --cases`): wall 15 h 55 m (2026-10-28 17:38 → 10-29 09:33 CST), test 13 h 17 m, idle 2 h 38 m in one gap (06:12 → 08:51, waiting for the user to sign in for A4-j). A4-j test time 0 h 43 m.
- Tokens (`token-usage.ts --since 2026-10-28T09:35Z`, orchestrator + all subagent transcripts of this session, both wrap-ups included): 2,170 msgs · in 5,016 · cache write 7,557,948 · cache read 322,578,350 · out 892,601. Weighted ≈ 46.2 M → est. ≈ 374 % of a 1× Pro 5-hour window (≈ 3.7 windows) ≈ 60 % of one window on the 6.25× seat; weekly (×0.168) ≈ 63 % of a 1× Pro week ≈ 10 % of the seat. No usage-card readings were logged during A4 (usage.jsonl ends 10/28 06:25).

## Coverage
`coverage.html` (local, rebuilt after A4-j): controls 146 groups — 114 pressed by a row that ran (no tap proof), 12 blocked, 20 n/a; inputs dismissed 7/7 (by rows); arrows 96 — 73 walked, 23 blocked. Unchanged by A4-j. Taps 0: device-android.ts writes no taps.jsonl at all (not only no case tags).

## eBug batch `ebugs/2026-10-28-a4/` (nothing filed, uploaded or commented)
Drafts `20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0.md`, review page `20261028_eBug_review_AI-Mini-Drama-A4_16.8.0.html` (600 px check after A4-j: no overflow), `upload/bodies.json`, `check.txt` 0 errors / 0 warnings, `dedupe.txt`. Prefilled: ETHAN_HSU, TR261021-0082, [AIAgent], API (from A2 — confirm).
- 13 new entries ISS-AMDA-47…59 (1 S2: TC-293 failed image update keeps ◆12; 12 S3). A4-j added none.
- 123 Fail rows dropped as Android duplicates (104 tickets, incl. the A2 bugs P0324–P0363 and P0368 / P0257 / P0236 / P0229 …). A4-j: TC-303 and TC-304 repeat DRA262610P0362 (Assigned; filed in A2 for TC-081, ISS-AMDA-45; re-read from the Android pool 2026-10-29) → dedupe.txt only.
- Held 5: TC-103, TC-265, TC-158, TC-467 (PM), TC-289 (conflicts with TC-288 — recheck next round). 6 log observations not raised.

# AI Mini Drama iOS — Phase P9 report (round 3, complete full run)

Plan `runs/RUN-PLAN-20261022.md` · table: draft 20261022-145212 (392 rows; becomes v8 once approved) · run folder
`runs/2026-10-22-p9-full/` · written 2026-10-27 (wrap-up, read-only for the phone: no device.ts / app-setup.ts calls).

## Environment
| | |
|---|---|
| Build | PowerDirector iOS 16.9.0 (189872), TR261022-0031 (TR header read 10/27: 16.9.0.189872). Fresh install 10/22 15:33; read back again 10/27 (REQ-035: no reinstall) |
| Server / device | Developer Server · QA iPhone 17 Air (00008150-00081D403A38401C) · shared Appium (left running) |
| Tier | Pro+ (P9-f switched Pro+ → Free → Pro → Pro+, read back; TC-224 Free on its own install) |
| Dates (CST) | 10/22 15:33 → 10/23 10:00 (segments a1–j; WDA died 09:57, phone locked) · 10/27 10:30–11:17 P9-j wrap-up + video check · eBugs filed 10/27 11:16 |
| Baseline now | Write Log ON · Pink › [z] AI Mini Drama: Log stage timings ON, **Unlimited daily chat ON** (kept ON as the run baseline, not returned to the fresh-install default OFF), **every fault switch Off** (Fail every call / every other call, Fail media tool / project step / turn, Inject failure status, Trip image moderation) — read back 10/27 11:06 |
| Account | Shared test account; Claude plan: 1.25× Team seat (round 3) |

## Results — 392 cases: 180 Pass · 84 Fail · 128 Blocked · 0 Not run
Dispositions: Fail = 77 defect, 6 question (PM), 1 spec-addition · Blocked = 63 defect (video gate / upstream failure),
56 test-data (policy fixtures: purchase, low balance, new account, chat count, voice, Remote Config, REQ-019 template
journeys, REQ-035 fresh install), 9 observability.

### Per segment / stage
| Stage | Segment | Cases | Pass | Fail | Blocked |
|---|---|---|---|---|---|
| Entry, idea, format card, outline | P9-a1 / a2 | 22 / 22 | 18 / 16 | 3 / 6 | 1 / 0 |
| Characters and cast picker | P9-b1 / b2 | 21 / 21 | 10 / 9 | 8 / 11 | 3 / 1 |
| Make your character | P9-c1 / c2 | 26 / 25 | 22 / 16 | 3 / 7 | 1 / 2 |
| Storyboard and Preview | P9-d1 / d2 | 28 / 28 | 13 / 15 | 8 / 7 | 7 / 6 |
| Chat, History, text, languages | P9-e | 29 | 17 | 8 | 4 |
| Credits and limits | P9-f | 28 | 8 | 1 | 19 |
| Video, errors, captions | P9-g1 / g2 | 30 / 29 | 1 / 1 | 3 / 1 | 26 / 27 |
| Offline, interruption, waits | P9-h | 27 | 4 | 17 | 6 |
| Templates (cards) | P9-i1 / i2 | 24 / 23 | 15 / 12 | 0 / 0 | 9 / 11 |
| Fresh install, new account | P9-j | 9 | 3 | 1 | 5 |
| **Total** | 16 segments | **392** | **180** | **84** | **128** |

b1 / b2 now read 10/8/3 and 9/11/1 (the plan Log's 9/8/4 and 8/11/2): TC-035 and TC-309 were re-run on a fresh install
in P9-j and passed.

### Per origin phase (where the row first came from)
| Origin | Cases | Pass | Fail | Blocked |
|---|---|---|---|---|
| P1 | 159 | 73 | 40 | 46 |
| P23 | 90 | 53 | 16 | 21 |
| P4 | 41 | 21 | 0 | 20 |
| P5 | 40 | 15 | 6 | 19 |
| P6 | 24 | 6 | 13 | 5 |
| P7 | 8 | 2 | 3 | 3 |
| P8 | 6 | 1 | 0 | 5 |
| P9 (new in draft 20261022-145212) | 24 | 9 | 6 | 9 |

## Video gate — failed every time (no video reached filming in P9)
| # | When (CST) | Drama | Outcome | Cause (app log) |
|---|---|---|---|---|
| 1 | 10/23 05:00 | Shared Corner, Seedance 2.0 Preview ◆120 | failed after 361 s | video-generation-batch: HTTP PUT to storage URL failed: Failed to read connection |
| 2 | 10/23 05:17 | Shared Corner (Try again) | failed after 361 s | same (storage PUT, read) |
| 3 | 10/23 05:25 | 綴じられた秘密 (Bound Pages) ◆131 | failed after 396 s | same; booked −4 for folded-in updates (O-36) |
| 4 | 10/23 07:17 | Shared Corner (retry) | failed after 361 s | storage PUT: Failed to write connection |
| 5 | 10/23 09:21 | Old Light (TC-083, fresh install) | failed after 361 s, ended silently (O-41) | storage PUT |
| 6 | 10/23 09:55 | Shared Turf (TC-303, fresh install) | failed after 722 s (read 10/27, O-42) | storage PUT: Failed to write connection |
| 7 | 10/27 11:05 | Shared Turf (video check, user request) | failed after 101 s | **HTTP request to cc team gateway failed: Failed to read connection** (gateway, not storage PUT) |

Nothing was booked for any video (pill and ledger checked each time). Gate = `video fail`; **retest queue 64 cases**
(`run-log.ts <run dir> retest`), of which TC-083 and TC-304 also need a fresh install and stay Blocked under REQ-035
whatever the video does. No R1/R2 retest order written. 「Shared Turf」 is kept at its Try again card for the next attempt.

## RD Note mapping (build-notes.md)
RD Note pasted by the user 10/27 (`rd-note-TR261022-0031.txt`; develop 189852 → fc841a45a4, 30 commits). Mapped to the
draft, read-only:
- 一.1a new engine AMD v261021 / Gemini 3.8 Flash — the whole P9 ran on it; every stage regressed except video and sequel (gate).
- 一.1b/d Seedance 2.5 as Best + Best/Standard/Fast labels — TC-079 / TC-347 Fail; likely CMS keys `AnswerVideoVendorSeedance2_5` / `VendorDescriptionSeedance2_5` missing on the Developer Server → ask RD/CMS before filing.
- 一.1e Seedance 2.5 uses the 2.0 credit action ID (open item) — TC-080 ◆120/◆360 is exactly that; held until the 2.5 ID lands.
- 一.1c age as integer (TC-133/289/339 Pass); 二.1 DRI261896P0037 discard dialog verified (TC-341/342 Fail contradict the RD design → PM question); 三.1 DRI261894P0043 verified (TC-381 → PM question); 三.2 / 三.6 Pass; 三.3 TC-083 Blocked.
- 8 proposed Build checks rows for the next draft (not created); 4 RD points are outside AI Mini Drama.

## eBugs — batch `ebugs/2026-10-27-p9/` (filed 10/27 11:16 on the user's go-ahead, IF3 API, Creator ETHAN_HSU)
- **20 filed: DRI261898P0001 – DRI261898P0020** on TR261022-0031 (16.9.0.189872): 4 × Sev 2 (P0002 locale codes, P0004
  cast confirm charges with no offer, P0010 reopen drops messages, P0011 failed storyboard/image credits kept), 16 × Sev 3;
  all RD; 12 Functional, 8 [UI]; 68 attachments (59 boxed frames, 9 log excerpts); all read back.
- **4 held as duplicates** (no comment): F-4 → DRI261897P0016 (refund), F-5 → DRI261895P0024 (character Cancel), F-11 →
  DRI261896P0048 (early Back), F-22 → DRI261897P0006 (S1 storage upload / video).
- **Rechecks (info only, 30 rows):** still reproduce, among them DRI261897P0006 (video, S1), DRI261896P0046 (prices),
  DRI261897P0016 (refunds), DRI261895P0022 (notification pre-prompt), DRI261897P0008 (waits), DRI261897P0020 (CHT/JPN
  strings), DRI261894P0046 (Closed — partly reproduces, reopen candidate, not acted on).
- **Held questions (not filed):** PM — TC-381 / O-40, TC-031, TC-189, TC-204, TC-159, TC-164, TC-158, TC-341 / TC-342,
  O-3, O-39; RD/CMS — TC-079 / TC-347 (CMS keys), TC-080 (2.5 action ID), O-20 / O-27 (booking vs price); ground truth —
  O-16 / O-18 (public-figure check); single sighting — O-7; server outages — O-1 / O-2 / O-12 / O-24.
- Reconciliation: 84 Fail + 42 observations = 126 items → 37 rechecks, 22 held, 2 not a bug, 41 merged → 24 entries.

## Notable fixed tickets on 189872
DRI261894P0043 (TC-186 empty-chat leave), DRI261896P0037 (discard dialog, RD Note 二.1), DRI261896P0007 / P0008 / P0009 /
P0019 (TC-199/200/201/206), DRI261895P0003 (TC-192), DRI261894P0039 (TC-055), DRI261894P0009 (「looks」), DRI261894P0048
(TC-188), DRI261893-0016 / DRI261896P0030 (rename/delete), DRI261893-0051 (TC-003 shadow), DRI261896P0022 (JPN names),
DRI261896P0032, DRI261896P0026 (History hint), DRI261896P0016; DRI261896P0042 partly (dialog and 「!」 shown, refund still
missing). Not reproduced: DRI261893-0015, DRI261893-0158, DRI261895P0036, DRI261895P0035, DRI261893-0145, DRI261896P0006.

## Time (activity.log, `run-log.ts time --cases`)
P9 wall **115h 59m** (10/22 15:17 → 10/27 11:16 CST) = test **17h 06m** + idle **98h 53m** in 4 gaps:
- 10/22 17:51 → 20:12 (2h 20m) — **usage-limit stop** (5-hour window at 100 %, worker stopped at 17:52 before the b1 checkpoint).
- 10/23 05:44 → 05:59 (15m) — between g1 and g2.
- 10/23 10:07 → 10/27 09:23 (95h 16m) — **pause**: WDA died 09:57 with the phone locked; resumed 10/27.
- 10/27 09:27 → 10:30 (1h 03m) — waiting for the user to trust the developer certificate (WDA code 65).

| Segment | Wall | Test | Idle | Tokens (in span) | Est. 5-h Pro-% | Account 5-h Pro-% |
|---|---|---|---|---|---|---|
| P9-a1 (incl. setup) | 0h 36m | 0h 36m | – | 19.0 M | 21.1 | 39.4 |
| P9-a2 | 0h 45m | 0h 45m | – | 27.0 M | 26.6 | 35.3 |
| P9-b1 | 16h 09m * | 1h 12m | – | 31.5 M | 38.0 | 50.6 |
| P9-b2 | 15h 51m * | 1h 41m | 2h 20m | 22.7 M | 27.6 | 27.3 |
| P9-c1 | 1h 21m | 1h 21m | – | 30.9 M | 32.4 | 24.6 |
| P9-c2 | 1h 02m | 1h 02m | – | 22.0 M | 24.7 | 20.8 |
| P9-d1 | 1h 38m | 1h 38m | – | 26.0 M | 30.8 | 6.8 † |
| P9-d2 | 1h 32m | 1h 32m | – | 22.4 M | 29.0 | 28.0 |
| P9-e | 0h 57m | 0h 57m | – | 19.7 M | 24.0 | 23.2 |
| P9-f | 0h 35m | 0h 35m | – | 10.0 M | 13.0 | 13.7 |
| P9-g1 (+ gate) | 0h 55m | 0h 55m | – | 10.5 M | 16.2 | 18.9 |
| P9-g2 | 0h 22m | 0h 07m | 0h 15m | 4.2 M | 5.7 | 1.3 |
| P9-h | 1h 11m | 1h 11m | – | 20.2 M | 20.6 | 12.0 † |
| P9-i1 (+ gate retry) | 0h 27m | 0h 27m | – | 11.5 M | 14.2 | 13.2 |
| P9-i2 | 0h 15m | 0h 15m | – | 6.2 M | 7.0 | 7.7 |
| P9-j | 2h 09m | 1h 56m | – | 20.4 M | 33.3 | 36.9 |
| Wrap-up / between segments | 97h 11m | 0h 53m | (pause) | 51.2 M | 63.1 | 107.8 |
| **P9** | **115h 59m** | **17h 06m** | **98h 53m** | **355.3 M** | **427.1** | **467.5** |

\* first → last activity of the segment's cases: b1 and b2 span to 10/23 00:48 / 01:41 because their TC-035 / TC-309
re-runs were recorded in P9-j; their own spans were 16:39–17:52 (+ 20:10 wrap-up) and 20:12–21:50.
† a 5-hour window reset inside the segment, so the account increment before the reset is partly unrecorded.

## Tokens (`token-usage.ts --since 2026-10-22T07:17:27Z`, sessions 8c55f9df, 0bab510c, d1737db3 + subagents)
All: **352.1 M tokens processed** — 2,212 messages, input 4,442 · cache write 11.27 M · cache read 339.86 M · output
0.95 M (claude-opus-5-5). Split (deduplicated by message id; resumed sessions repeat earlier messages):

| Work | Messages | Cache write | Cache read | Output | Total |
|---|---|---|---|---|---|
| **Run (test execution)**: 16 segment subagents, gate and retry, P9-j wrap-up + video check, orchestrator 10/22–23 | 1,977 | 10.05 M | 296.56 M | 0.76 M | **307.4 M** |
| **Not run**: eBug drafts + review page (16.1 M), eBug filing (13.1 M), RD Note mapping (1.2 M), this wrap-up (~1 M) | 177 | 0.68 M | 30.51 M | 0.16 M | **31.4 M** |
| Mixed: orchestrator session 10/27 (resume, WDA restart, RD Note ~4.1 M; eBug review / filing decisions, video check ~9.4 M) | 59 | 0.54 M | 12.88 M | 0.04 M | 13.5 M |

The plan page reads every project transcript inside P9's active spans: 355.3 M (≈3 M more, from other sessions in the project).

## Plan usage (Claude account; `runs/usage.jsonl`, 1.25× Team seat, figures in 1× Pro-%)
- **Token-rate estimate** (plan-page.ts: weights input 1 / cache write 1.25 / cache read 0.1 / output 5; rate calibrated on
  P1 = 300 Pro-% of 5-hour; weekly ratio 0.168 from round 3's paired readings):
  - whole P9 (page figure): **427 Pro-% of a 5-hour window, 72 Pro-% of a week** (= 342 % / 57 % of the 1.25× seat);
  - test execution only (307.4 M bucket, weighted 46.0 M): **372 Pro-% 5-hour, 62 Pro-% weekly** (≈ 3.0 seat 5-hour windows, 50 % of the seat's week);
  - eBug / RD Note / wrap-up: 38 Pro-% 5-hour; mixed orchestrator 10/27: 17.
- **Account total (shared)**: 467.5 Pro-% 5-hour (374 % of the seat), 86.2 Pro-% weekly (week to 10/24: 0 → 55 %;
  week from 10/24: 6 → 14 %). Excluded: the 10/22 07:16 reading (87 % / 95 % from other use before the user's reset).
  Still counted although not P9: the 10/27 resume reading's 34 % 5-hour and 6 % weekly (new windows, used before the
  resume) — without them 425 / 79 Pro-%. The 10/27 window also holds the eBug filing.
- Five 5-hour windows touched: 10/22 07:17–12:10Z (hit 100 %, stop 17:52 CST), 12:10–17:10Z, 17:10–22:10Z, 22:10Z–03:10Z,
  10/27 00:40–05:40Z (84 % at 03:17Z).

## Credits (shared account; AI Magic pill and Credit Details)
Start **19,108** (10/22 15:34) → now **18,780** (10/27 11:08): −328 on the pill. This phone's own charges **−300**;
the rest is shared-account rows (excluded below) and the +300 monthly bonus (10/23 14:14).

| Segment | Pill after | This phone | Excluded (not this phone) |
|---|---|---|---|
| a1 | 19,108 | 0 | – |
| a2 | 19,048 | 0 | −60 (O-5) |
| b1 | 18,996 | −43 (−8, +3 refund, −38 TC-044) | −9 |
| b2 | 18,935 | −61 | – |
| c1 | 18,929 | −6 | – |
| c2 | 18,919 | −10 | – |
| d1 | 18,856 | −59 | −4 (01:24 rows) |
| d2 | 18,839 | −9 (three failed regenerations kept −3 each) | −8 (01:49 rows) |
| e | 18,830 | −9 | – |
| f | 18,830 | 0 | – |
| gate + g1 | 18,826 | −4 (O-36) | – |
| g2 | 18,800 | −26 (The Gambit storyboard) | – |
| h | 18,783 | −17 | – |
| gate retry, i1, i2 | 18,783 | 0 | – |
| j | 18,727 | −56 (storyboards −34, −22) | – |
| 10/23 → 10/27 | 18,813 | 0 | +300 bonus, −214 other devices |
| 10/27 wrap-up + video check | 18,780 | 0 (video not booked) | −33 |
| **Total** | | **−300** | +300 / −328 |

No video was ever charged; several failures kept their charges (refund defects: DRI261898P0011, held F-4 → DRI261897P0016).

## What is left
1. **Video retest** (R1 / R2) of the 64-case queue once a Seedance 2.0 video generates (gate: storage PUT 10/22–23, cc team gateway 10/27; DRI261897P0006 S1). Start TC-095 early so TC-379 can read the card 3 hours later. Use 「Shared Turf」 (Try again card).
2. **Fresh-install cases under REQ-035** (TestFlight down: no reinstall): TC-083, TC-304 (also in the video queue) stay Blocked until the user lifts it.
3. **F-3 「!」 recheck** (DRI261898P0003 / TC-353): the partial-failure 「!」 part was seen with Trip image moderation ON; re-check with every fault switch Off (team rule).
4. **TC-079 / TC-080 / TC-347** wait on RD/CMS: Seedance 2.5 CMS keys on the Developer Server and the 2.5 credit action ID.
5. PM questions above; 8 proposed Build checks rows from the RD Note for the next draft; draft 20261022-145212 still to be approved (→ v8).

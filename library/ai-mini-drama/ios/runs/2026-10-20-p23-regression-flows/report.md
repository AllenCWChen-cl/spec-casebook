# AI Mini Drama iOS — phase P23 (P2 Regression + P3 Flows), run report

Table: `library/ai-mini-drama/ios/cases.csv` v1, merged phase P23 = P2 Regression (40 cases) + P3 Flow arrows, text
and colleague directions (51 cases), ordered by journey stage in segments P23-a … P23-g (`drafts/20261019-094124/phases.json`).
Run: 2026-10-20 15:35 → 2026-10-21 05:30 (Taiwan time). One orchestrator chat; setup, the video gate and every segment
ran as subagents (round 2 of `RUN-PLAN-20261019.md`). Wrap-up 2026-10-21.

## Result

| Segment | P2 Pass / Fail / Blocked | P3 Pass / Fail / Blocked | Total |
|---|---|---|---|
| P23-a Entry and outline | 2 / 7 / 0 | 1 / 0 / 0 | 10 |
| P23-b Characters | 2 / 5 / 1 | 3 / 2 / 0 | 13 |
| P23-c Create my character | 2 / 2 / 0 | 19 / 2 / 0 | 25 |
| P23-d Storyboard and text | 5 / 6 / 2 | 8 / 0 / 1 | 22 |
| P23-e Video (gate) | 0 / 0 / 2 | 0 / 0 / 10 | 12 |
| P23-f Settings (language, appearance, accessibility) | 1 / 1 / 0 | 0 / 3 / 0 | 5 |
| P23-g Fixtures (policy blocks) | 0 / 0 / 2 | 0 / 0 / 2 | 4 |
| **By origin phase** | **P2: 12 / 21 / 7 (40)** | **P3: 31 / 7 / 13 (51)** | **91** |

**P23 total: 43 Pass / 28 Fail / 20 Blocked / 0 Not run**, 0 Inconclusive.

Dispositions (Phase column split):

| Disposition | P2 | P3 | Cases |
|---|---|---|---|
| Fail · defect | 17 | 6 | P2: TC-186, 199, 200, 213, 193, 192, 212, 208, 201, 206, 211, 175, 187, 214, 184, 179, 185 · P3: TC-121, 126, 137, 275, 276, 277 |
| Fail · question | 3 | 0 | TC-189, 204, 178 |
| Fail · spec-addition | 1 | 1 | TC-194 · TC-288 |
| Blocked · defect (video gate, retest queue) | 4 | 10 | TC-190, 195, 209, 210 · TC-142–151 |
| Blocked · test-data | 3 | 3 | TC-176 (no infant card), 202 (purchase), 191 (spoken input) · TC-139 (no long script), 136 and 152 (low balance) |
| Observability | 0 | 0 | — (TC-185 was read from accessibility labels; VoiceOver itself not turned on) |

## What matters

- **Video still cannot be generated on the Developer Server.** Preflight gate 10/20 16:04:42 on 「Merger Season」
  (Seedance 2.0, Preview 30 s ◆120) → 'Video couldn't be created' at 16:16:53, **731 s**, log
  `HTTP PUT to storage URL failed: Failed to write connection`; retry 10/21 05:17:26 on the same drama
  (「ライバルの共闘」, ◆139) → failed at 05:24:13, **402 s**, `Failed to read connection` (also in beat-edit). Same
  storage upload failure as P1 (DRI261897P0006 / DRI261896P0020). 14 video cases stay Blocked (retest queue);
  the P1 video retest stays Blocked. Recheck comment drafted for DRI261897P0006; nothing posted.
- **Credits are kept after failed generations, with no refund row** (rule 8): TC-206 −2 (TTS ×2), TC-137 −1
  (TTS; the card says the credits were refunded), gate retry −12 (TTS ×3 + Text to Image ×3). One new entry,
  ISS-AMD-40 (S2).
- **Regression: most tickets still reproduce.** Of the 40 P2 tickets, 21 failed again (several were TRCreated /
  RDResolved / Close and need their fix rejected or the ticket reopened), 12 no longer reproduce, 7 could not be
  checked (video, purchase, voice, missing infant card).
- **Localization:** in Traditional Chinese and Japanese every AI Mini Drama string stays English, so dialogs mix
  languages; two translated labels use the wrong word (濾鏡, その他).
- P3 flow arrows mostly hold (31 Pass): Create my character, its form and reference photo, and the storyboard text
  checks pass. The one flow defect: X on Finish your characters keeps the generated looks (TC-121).

## eBugs — drafted, nothing filed

`library/ai-mini-drama/ios/ebugs/2026-10-20-p23/`:
- `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0.md` — 6 new entries (ISS-AMD-40 … 45), 29 Rechecks (existing
  tickets that still reproduce: comment, reopen or reject the fix — including the video failure on DRI261897P0006 and
  O-5/O-7 on DRI261897P0008), 13 tickets fixed on 189729 (candidates to close), 7 not checkable, 6 questions for
  PM/Design, the Not raised table and the reconciliation map of every Fail, Blocked and O-1…O-15.
  - ISS-AMD-40 S2 RD Functional — failed character and video generations keep their charged credits (TC-206, TC-137, O-15)
  - ISS-AMD-41 S3 RD Functional — X on Finish your characters keeps the generated looks (TC-121)
  - ISS-AMD-42 S3 PM UX — character filter with no matches shows a blank grid, no empty state (TC-288, spec addition)
  - ISS-AMD-43 S3 RD UI — Create my character description runs under the expand icon (O-6)
  - ISS-AMD-44 S3 Doc UI — feature strings stay English in Traditional Chinese and Japanese (TC-276, TC-277, O-2, O-14)
  - ISS-AMD-45 S3 Doc UI — CHT filter title 濾鏡, JPN More link その他 (TC-276, TC-277, O-14)
- The TC-275 slot-card copy ('1 characters isn't set yetThey need a look') was drafted, then found as the existing
  DRI261896P0016 in dedupe and moved to Rechecks.
- `upload/bodies.json` (drafts_to_bodies); `check_ebug_format.py`: 6 checked, 0 errors, 0 warnings.
  `verify_ebug_drafts.py`: only the sheet-index checks fail ('unknown sheet' / 'never names that sheet' for the two
  Spec Link lines), which the casebook overlay says do not apply.
- `dedupe.txt` — read-only `ecl_query.py dedupe`; candidates read with `ecl_query.py bug`. No duplicate left;
  ticket statuses in the Rechecks table were read on 2026-10-21.
- `20261020_eBug_review_AI-Mini-Drama-P23_16.9.0.html` — self-contained review page (ebug-tr-filer layout, as P1),
  not published. TR proposal: TR261019-0014 (same build) — to confirm.
- Generators in `generators/` (`ebugs.py`, `review.py`, `review.tpl`); log excerpts in `logs/` (signed URLs truncated).

## Credits

| When | Spent | What |
|---|---|---|
| Setup + gate (10/20 15:4x–16:17) | 35 | 「Merger Season」 storyboard (11 × Text to Image −3, TTS −2); video 0 (authorised 120, not booked) |
| P23-a | 0 | outlines only |
| P23-b | 14 | TC-121 Generate all 8, Murphy 4, TC-206 failed edit 2 (not refunded) |
| P23-c | 9 | dog 4, Margaret 4, TC-137 failed 1 (not refunded) |
| P23-d | 6 | Scene 4 regeneration (Text to Image −3 ×2) |
| P23-f | 12 | gate retry: TTS ×3 + Text to Image ×3, kept although the video failed (not refunded) |
| **Total this phone** | **76** | of which 15 for failed generations with no refund |

Account balance 20268 (10/20 15:36) → 19285 (10/21 05:27); the rest of the −983 is other devices on the shared
account (AI Video Generator −60 rows at times this phone generated nothing). No credits bought or topped up.

## Environment

| Item | Value |
|---|---|
| Build | PowerDirector 16.9.0 (189729), TestFlight; not reinstalled this phase; no newer build in TestFlight (10/20 15:36) |
| Server | Developer Server (Launcher label; ⋯ Use developer server ON) |
| Device | QA iPhone 17 Air, iOS 26.2.1, UDID 00008150-00081D403A38401C, Dark mode (Light only during TC-198, restored) |
| Transport | Appium 3.1.1 (pid 10920, shared, never stopped); XCUITest sessions 28499207 → 081f5899 (10/20 19:02) → 47459217 (10/21 00:03) → 75c9457c (05:01), each after the previous one expired |
| Tier | Pro+ (Credits page 「PowerDirector Pro+」) |
| Logging | ⋯ Write Log ON; Pink Log stage timings ON; logs pulled and sliced per segment (`logs/P23-*`) |
| Pink at the end | Log stage timings ON, Unlimited daily chat ON (kept for P4), every fault toggle Off — last read back 10/21 01:4x after P23-d, untouched since; Show version toggle on |
| Languages | `launch --lang en / zh-Hant / ja` for TC-275–277 (launch arguments, no iOS Settings change); app back in the device language (English) |
| Dramas left | 「ライバルの共闘」 (D68FCB96, failed video card, kept for the retest), 「After Closing」, 「Legacy Recipe」, 「Storm and Shelter」, 「Number 99」, 「Romance」 and the P23-a dramas |

## Script fixes made during P23

- `device.ts launch` (plain): now terminates and relaunches without arguments; it used to only activate the app and
  leave a `-AppleLanguages ja` process running (P23-a, 10/20 19:14).
- `recipes/new-drama.steps`: `setval` instead of `type` (65 s), waits for the result header, then scrolls and waits
  for 「Ready to create your characters?」 (P23-b, 19:21).
- `device.ts scrollto`: prefers the Switch when a row's text and its switch share the name (`pink set 「Fail every
  call (ignores number)」` had matched the StaticText) (P23-c, 00:08).
- New `device.ts texts` (visible strings per screen) and `recipes/text-tour.steps` (116-step text tour) for the
  language passes (P23-f). First uses that worked unchanged: `launch --lang`, `appearance light|dark`.
- Notes for later (not fixed): `waitfor` on an off-screen element times out — wait on text or scroll first; `setval`
  on the Create my character prompt lost its first 11 characters (the field opens the full-screen editor on focus).

## Time and tokens

- Wall 13 h 54 m (10/20 15:35 → 10/21 05:29); **test time 5 h 56 m**; idle 7 h 58 m in 3 gaps over 15 min
  (all usage-limit stops: 10/20 17:19 → 19:03, 1 h 44 m; 20:45 → 10/21 00:02, 3 h 17 m; 02:05 → 05:02, 2 h 57 m). Per segment (test time up to
  each recorded case): P23-a 1 h 08 m, P23-b 53 m, P23-c 1 h 02 m, P23-d 1 h 21 m, P23-e 46 m (setup + gate),
  P23-f 33 m, P23-g 0 m (`run-log.ts … time --cases`). Longest cases: TC-193 31 m, TC-141 27 m, TC-137 26 m, TC-187 24 m.
- Claude tokens since 2026-10-20T07:30Z, orchestrator session 5de20bcf… plus its segment subagents
  (`token-usage.ts`): 764 messages · input 1,514 · cache write 2.88 M · cache read 109.7 M · output 46.2 k ·
  **112.6 M processed** (measured at the start of this wrap-up).
- Plan-usage percentages are not available to the wrap-up agent (no access to the app's usage card); not recorded.

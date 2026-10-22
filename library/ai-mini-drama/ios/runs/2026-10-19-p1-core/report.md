# AI Mini Drama iOS — phase P1 Core, run report

Table: `library/ai-mini-drama/ios/cases.csv` v1, phase P1 (159 cases, segments P1-a … P1-h).
Run: 2026-10-19 12:19 → 2026-10-20 10:15 (Taiwan time), sessions: session 1 (P1-a), p1-run-b (P1-b),
casebook-run-p1-c (P1-c), casebook-run-p1-d (P1-d … P1-h and this wrap-up).

## Result

| Segment | Pass | Fail | Blocked | Total |
|---|---|---|---|---|
| P1-a Entry, templates, idea input, format card | 19 | 2 | 1 | 22 |
| P1-b Story outline, characters, Create my character | 26 | 11 | 0 | 37 |
| P1-c Storyboard and storyboard preview | 11 | 6 | 2 | 19 |
| P1-d Video, video errors, captions | 2 | 7 | 11 | 20 |
| P1-e Chat behaviour and History | 9 | 3 | 0 | 12 |
| P1-f Interruption and waits | 7 | 12 | 3 | 22 |
| P1-g Credits and limits | 7 | 1 | 15 | 23 |
| P1-h Fresh install | 3 | 1 | 0 | 4 |
| **P1 total** | **84** | **43** | **32** | **159** |

Dispositions: 39 defect Fail, 4 question Fail (since resolved: TC-031 → existing DRI261896P0053, TC-159 → ISS-AMD-39 for PM, TC-066/TC-078 → table corrections); Blocked 15 defect (upstream of the video failure), 15 test-data,
2 observability. 0 Not run, 0 Inconclusive. TC-163 was re-judged Fail → Pass on 2026-10-20 (dropped chat messages
are by design: the History hint says only outline, images and videos are kept).

## What matters

- **Video generation is broken on the Developer Server for the whole run.** All 6 attempts (10/19 19:47, 19:59,
  20:18, 21:13; 10/20 10:06; plus the storyboard revisions at 17:16 and 17:24) fail after ~361 s with
  `HTTP PUT to storage URL failed: Failed to read connection (storage.googleapis.com/cl-aol-media-demo/…/input.N.png)`.
  No video credits were charged. This is the existing DRI261896P0020 (NeedMoreInfo) — the log line is the info RD
  asked for. It blocks every case that needs a finished video (TC-085, 087–090, 093, 095–099, 167, 168, 174).
- **Every Stop is silent** (outline, revision, storyboard, video): the authorisation is revoked in the log, but the
  user is never told. Character generation has no Stop and can't be left at all.
- **Every long stage breaks the 10 s wait rule**: outline 26 s, characters 76 s, revision 38 s, storyboard 116 s,
  video 364 s.
- Tier display is inconsistent (O-24): IAP status 「System」 behaves as Pro+ (badge, Credits page, Paid quota
  dialog) while the Mine card says Free. P1 ran effectively as Pro+.

## eBugs — filed 2026-10-20 (8 tickets, TR261019-0014)

`library/ai-mini-drama/ios/ebugs/2026-10-19-p1/`:
- `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0.md` — 8 new entries (ISS-AMD-32 … 39, revised 2026-10-20 at the user's request: the video failure ISS-AMD-37 is filed as its own S1 ticket with the server-side cause, re-raising DRI261896P0020 which was closed NotReproducible on 189631; the failed-image card copy ISS-AMD-38 and leaving-during-outline ISS-AMD-39 go to PM), a Rechecks table of 25 existing tickets that still reproduce on 189729 (to comment/reopen, not to refile), 14 tickets that no longer reproduce (candidates to close), 2 table corrections where the app matches Design (TC-066, TC-078), and the reconciliation map of all 43 failed cases.
- `20261019_eBug_review_AI-Mini-Drama-P1_16.9.0.html` — review page for the 8 new entries (severity, owner, file/hold) plus the still-reproducing tickets; published privately at https://claude.ai/artifact/8hmLQ6ot4MwheYwuc4xo9B.
- `dedupe.txt` — read-only ECL dedupe: no open duplicate for any entry (ISS-AMD-37's match DRI261896P0020 is closed NotReproducible).
- **Filed** by ETHAN_HSU via the IF3 API on TR261019-0014 (16.9.0.189729): DRI261897P0006 (video failure, S1 RD), P0007 (silent Stop, S2 PM), P0008 (waits, S2 RD), P0009 (History bubble, S3 RD), P0010 (no video card after Retry, S3 PM), P0011 (card loses price, S3 RD UI), P0012 (failed-image copy, S3 PM), P0013 (leave during outline, S3 PM). 27 attachments: red-boxed frames plus a sanitized log excerpt per ticket (none for P0011 — nothing is logged). Record: `ebugs/2026-10-19-p1/filed_bugcodes.json` / `.md`. The 24 existing tickets in Rechecks were not refiled.
- Dashboard: AI Found 32 · Created 8 · Known 24.

## Environment

| Item | Value |
|---|---|
| Build | PowerDirector 16.9.0 (189729), TestFlight; reinstalled 4× on 10/20 for P1-h (build verified each time) |
| Server | Developer Server (re-enabled after every reinstall: ⋯ › Use developer server + relaunch) |
| Device | QA iPhone 17 Air, iOS 26.2.1, UDID 00008150-00081D403A38401C |
| Transport | Appium 3.1.1 (shared, never stopped); session expired overnight, restarted 10/20 08:46 (a7039b7a…) |
| Tier | Pink IAP status System (≈ Pro+); Free/Pro/Pro+ set via Pink only inside P1-g and P1-h, restored |
| Pink at the end | Log stage timings ON, Unlimited daily chat OFF (reinstall default; turned back ON at P2 start), every fault toggle Off |
| Credits | 20320 at start (10/19 12:33) → 20018 (10/20 10:06); shared account, other devices also spend (O-2/10/20/25) |

## Time and tokens

- Wall 21 h 53 m (10/19 12:21 → 10/20 10:15); **test time 7 h 52 m**; idle 14 h 02 m in 4 gaps
  (1 h 26 m, 36 m, 1 h 34 m between sessions/usage limits, and 10 h 25 m overnight when the session sat idle and the
  Appium session expired). Per segment: P1-a 36 m, P1-b 1 h 24 m, P1-c 1 h 44 m, P1-d 47 m, P1-e 16 m, P1-f 37 m,
  P1-g 1 h 10 m, P1-h 1 h 09 m (`run-log.ts … time --cases`).
- Claude tokens since 10/19 04:19Z over all run transcripts (session 1 plus every casebook transcript, which also
  includes the coordinating session): 1,128 messages · input 2,254 · cache write 4.70 M · cache read 359.1 M ·
  output 483 k · 364.2 M processed (`token-usage.ts`). Plan-usage percentages were not captured (no usage card read).

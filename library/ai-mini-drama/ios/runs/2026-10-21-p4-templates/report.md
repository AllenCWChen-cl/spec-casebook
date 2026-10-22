# AI Mini Drama iOS — phase P4 (Templates), run report

Table: `library/ai-mini-drama/ios/cases.csv` v1, phase P4 Templates (41 cases: TC-234 roster, 20 card rows, 20 journey
rows), segments P4-a … P4-d (`drafts/20261019-094124/phases.json`). Run: 2026-10-21 05:44 → 06:53 (Taiwan time), wrap-up
and end-of-round steps to 07:05. One orchestrator chat; each segment ran as a subagent (round 2 of `RUN-PLAN-20261019.md`).

**Round rule (user, 2026-10-20 19:0x): 「Generate」 was never tapped on a template.** Card rows checked everything before
it; journey rows are recorded `Not run` 「Generate withheld (user, 2026-10-20)」. No template credit spend, so the
300-credit stop rule did not apply.

## Result

| Segment | Category | Pass | Not run (withheld) | Total |
|---|---|---|---|---|
| P4-a | Roster (TC-234) + Workplace Romance 1–5 | 6 | 5 | 11 |
| P4-b | Fantasy & Destiny 1–5 | 5 | 5 | 10 |
| P4-c | Urban Romance 1–4 | 4 | 4 | 8 |
| P4-d | Family & Life 1–4 + Animated Stories 1–2 | 6 | 6 | 12 |
| **P4** | 20 templates / 5 categories | **21** | **20** | **41** |

**P4 total: 21 Pass / 0 Fail / 0 Blocked / 20 Not run** (all 20 = Generate withheld), 0 Inconclusive.

What every card row checked (`recipes/template-card.steps`, one call per template): roster position against the frozen
10/21 roster; cover and caption on More; the detail page title; preview autoplay with sound (frames change 3 s apart),
speaker Mute → Unmute → Mute, tap-to-pause (「Play」, frames identical 2 s apart) and resume; the card id unchanged
throughout (the detail page is a pager, O-1); Make my version → chat with the template's cover bubble (label = template
name) and 「What format would you like for your video?」, no outline yet; the format card in full — 1. Video language
English (preselected) / Spanish / French / German / Japanese / Korean / Chinese, 2. Captions 「Yes, include captions」
(preselected) / 「No captions」, single choice per group for every option, 「Generate」 without a price; Back →
「Leave this chat?」 「Your story outline isn't ready yet, so this chat won't be saved.」 with Leave anyway / Stay; Stay
keeps the card; Leave anyway → the same template's detail page; History unchanged (same 5 newest entries before and
after each segment). The premise only appears after 「Generate」, so 'premise matches the card' could not be checked
(Questions in the eBug drafts). Rule 7 text scan of every captured preview frame.

TC-234: roster frozen to `drafts/20261019-094124/template-roster-20261021.json` — 20 templates in 5 categories (Workplace
Romance 5, Fantasy & Destiny 5, Urban Romance 4, Family & Life 4, Animated Stories 2), identical to the 10/19 roster.

## Journey rows withheld (Not run, 「Generate withheld (user, 2026-10-20)」)

| Case | Segment | Template |
|---|---|---|
| TC-236 | P4-a | Merger Season |
| TC-238 | P4-a | Forbidden Office Romance |
| TC-240 | P4-a | The New Guy's Secret |
| TC-242 | P4-a | The Art of Falling |
| TC-244 | P4-a | Glad We Came |
| TC-246 | P4-b | Love, Unscripted |
| TC-248 | P4-b | The Dragon's Chosen Bride |
| TC-250 | P4-b | Awakening the Storm |
| TC-252 | P4-b | The Hero's Dangerous Heart |
| TC-254 | P4-b | The Rebel and the Valedictorian |
| TC-256 | P4-c | After Closing |
| TC-258 | P4-c | The Fake Engagement |
| TC-260 | P4-c | The Pop Star's Secret Girlfriend |
| TC-262 | P4-c | The House We Both Wanted |
| TC-264 | P4-d | The Heiress and Her Protector |
| TC-266 | P4-d | Proposal Across Every Lifetime |
| TC-268 | P4-d | Six Things You Didn't Know |
| TC-270 | P4-d | The Dog Who Remembered Her |
| TC-272 | P4-d | The Ring He Worked For |
| TC-274 | P4-d | The Beer Heir |

Each is the full journey (outline, characters, storyboard, Seedance 2.0 preview, 90 s full episode, credit prices).
They stay Not run until the user lifts the Generate rule; video on the Developer Server also failed both P23 gate
attempts (DRI261897P0006), so they also need the server fixed.

## What matters

- Every template opens, plays its preview with sound, mutes, pauses, and starts its own chat with the right title and
  cover; the format card and the leave dialog behave the same on all 20. No functional failure.
- **Cover titles are cropped in the detail player on 7 of 20 templates** (O-2, O-5, O-6, O-7): the 3:4 cover is filled
  into the 9:16 player, cutting the lettering — ISS-AMD-46.
- **Proposal Across Every Lifetime's cover art reads 「Proposal Across Lifetimes」** (O-4, confirmed in TC-265) — ISS-AMD-47.
- **Garbled AI sign text in 3 sample videos** — Glad We Came 「GREEN I'ECH」, After Closing 「CFIDKAICE」, The Ring He
  Worked For 「MIIANNY RING」 (O-3, O-6, O-8) — ISS-AMD-48.
- **Fixed:** DRI261894P0008 (The Fake Engagement cover titled Billionaire Romance) no longer reproduces.
- **Spec gaps:** the detail page is a swipe pager over the category (O-1, not on the Design board); the live category
  names (Workplace Romance, Fantasy & Destiny) differ from Design's (Office Romance, Fantasy World); Q-1 answered by the
  app (「Didn't」 with the apostrophe).

## eBugs — drafted, nothing filed

`library/ai-mini-drama/ios/ebugs/2026-10-21-p4/`:
- `20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0.md` — 3 new entries: ISS-AMD-46 (UI, S3, RD) Template detail player cuts
  off the cover title on 7 templates; ISS-AMD-47 (UI, S3, PM) Proposal Across Every Lifetime cover reads Proposal Across
  Lifetimes; ISS-AMD-48 (UI, S3, PM) Template sample videos show garbled sign text. 0 rechecks, 1 fixed (DRI261894P0008),
  3 not checkable (DRI261896P0047, P0049, P0035), 4 questions, Not raised table, reconciliation (O-1…O-8 all mapped).
  Generator `generators/ebugs.py`.
- `upload/bodies.json` + staged JPEGs; `check_ebug_format.py` 0 errors, 0 warnings; `verify_ebug_drafts.py` fails only
  the sheet-index checks the casebook overlay exempts. ECL dedupe read-only (`dedupe.txt`): 191 AI Mini Drama
  candidates, no likely duplicate.
- Review page `20261021_eBug_review_AI-Mini-Drama-P4_16.9.0.html` (P23 layout, `generators/review.py`) — not published.

## Logs and credits

Logs pulled and sliced per segment: `logs/P4-a-20261021-060845`, `P4-b-20261021-062421`, `P4-c-20261021-063949`,
`P4-d-20261021-065239` (git-ignored). No `authorized, credit=` line, no failure and no toast in any P4 card or journey
window (the TC-234 window in the slice starts at 05:21 and catches the tail of P23's gate retry; not P4 activity).
Credits: 19285 at 05:45 and 19285 at 07:03 — **0 spent in P4**.

## Time and tokens

- Time (`run-log time --cases`): wall 1 h 20 m (05:44 → 07:04 incl. wrap-up and Pink restore), test 1 h 20 m, idle 0.
  Segments to their last recorded case: P4-a 23 m, P4-b 15 m, P4-c 16 m, P4-d 13 m. Card rows 1–8 min each (the first
  of each segment longest: navigation and roster capture); journey rows 0 min.
- Claude tokens since 2026-10-20T21:40Z (orchestrator + segment subagents of session 5de20bcf…), read at the wrap-up:
  261 msgs · input 522 · cache write 551 k · cache read 34.2 M · output 35.0 k · 34.8 M processed. Plan-usage
  percentages: not available to the subagent.

## Environment

PowerDirector 16.9.0 (189729), not reinstalled; Developer Server; Pro+; QA iPhone 17 Air (00008150-00081D403A38401C),
Appium 3.1.1 (pid 10920) and WDA left running, session 75c9457c. During P4 Pink › [z] AI Mini Drama had Log stage
timings and Unlimited daily chat ON and every fault toggle Off (read 05:48). End of round 2 (07:00–07:03): Unlimited
daily chat and Log stage timings set OFF, full read-back — every switch off except Show version toggle (on); Fail media
tool / Fail project step / Fail turn / Inject failure status Off, scope First beat, Fail call number 2, load delay 0
(`screenshots/pink-unlimited-daily-chat-20261021-070051.png`, `pink-log-stage-timings-20261021-070153.png`). No drama
created in P4; 「ライバルの共闘」 untouched. Phone left on the Launcher. Recipe fix: `recipes/template-card.steps` now
ends waiting for the History button (More keeps its scroll position).

# Ideas to investigate (not implemented)

## Run segments on several phones at once (user, 2026-10-20)

Idea: with more than one iPhone connected, send different segments to different phones so they run at the same time
and the wall time drops. Status: **investigate only — do not implement yet** (user, 2026-10-20).

What we know so far:
- **Device side looks feasible.** Appium can hold one session per phone; each needs its own WebDriverAgent port
  (`appium:wdaLocalPort` 8100, 8101 …, `appium:mjpegServerPort`), so `device.ts start` would take those per UDID.
  Each phone would get its own run folder (`.session`, results.csv, activity.log), which also avoids two writers on
  one results.csv. `plan-page.ts` already merges the latest result per case across run folders.
- **Shared account is the main conflict.** Credits and the ledger are per account (already noisy from other devices,
  O-2/O-10/O-20/O-25), and so is the daily chat quota. Segments that read balances, ledgers, quotas or tiers must stay
  on one phone; History is local (a fresh install empties it), and Pink toggles are per device.
- **Server load.** Parallel generations (storyboard, video) may hit server limits or change timings, which matters
  for the wait-rule cases.
- **Claude side.** Each phone needs its own segment worker running at the same time. Total tokens stay the same, but
  the usage window drains about twice as fast; one usage-limit stop halts both phones.
- **Bigger win first.** P1 had 7 h 52 m test time in 21 h 53 m wall time; most of the loss was idle (overnight Appium
  session expiry, handoff stalls), not phone time. Measure the next round's idle time with the new one-chat
  orchestration before deciding.

Questions to answer before building:
1. Which segments are independent of account state (candidates to split), and which must share one phone?
2. Do two phones on the same account interfere in the app (History sync, chat quota, credit pill)?
3. Does the Developer Server tolerate two concurrent video generations from one account?
4. Is a second test account available, so each phone has its own credits and quota?

# Logs

## KF-003 Stage timings need a Pink switch
- kind: howto · platform: ios · use: run · tags: logs, timing, pink
- source: run.md step 7 (user, 2026-10-19)

Pink › ☰ › `[z] AI Mini Drama` › **Log stage timings** ON before the first test action, or the `[AMDPerf]` timings
are missing; re-check it after any relaunch, reinstall or server change.

## KF-004 What the log lines mean
- kind: fact · platform: both · use: run, ebug · tags: logs, credits, failure
- source: run.md step 7 (user, 2026-10-19)

`workflow step failed … error="…"` is the real failure behind a silent UI; `[AIDrama Toast]` lists toasts;
`[AIDrama Permission] … authorized, credit=N` is each charge.

## KF-051 The AI Mini Drama log file
- kind: fact · platform: ios · use: run, ebug · tags: logs
- source: exploration KB ai-mini-drama.md (2026-10-07 re-verify, 16.9.0 189463)

Logs.zip (Launcher ⋯ › Send logs via...) holds `*_aidrama.txt` with `[AMDPerf]`, `[AIDrama Toast]` (also toasts too
short to capture) and `workflow step failed … error=` lines. Read it before calling a failure silent: several
「silent」 findings had a toast in the log.

## KF-052 A push received is not a notification shown
- kind: howto · platform: android · use: run, ebug · tags: logs, push, notifications · authority: team
- source: user 2026-11-03 (chat, DRA262610P0418 recheck, REQ-067) · verified: 16.8.0 build 2610212, Samsung A53 / Android 15 (2026-11-03)

Logcat `FcmInstanceIDService: key = Title / Msg / Nid / Link` lines are printed for each FCM payload received: one per
clip for a video, all with the same Nid and run ID (6 for a 6-clip full video). Only a `NotificationManager … notify(`
line posts a notification, and only that one counts. In the recheck the last delivery was the only one posted
(one 「Your drama is ready」 in the shade). Count what shows in the shade (`adb shell dumpsys notification --noredact`,
PowerDirector records); give the FCM count only as a log detail.

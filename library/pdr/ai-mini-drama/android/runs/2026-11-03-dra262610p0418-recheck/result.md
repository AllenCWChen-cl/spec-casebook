# DRA262610P0418 recheck — 2026-11-03 (RD: NeedMoreInfo)

Question: does one video show one 「Your drama is ready」 notification, or one per clip?

- Phone: Samsung Galaxy A53 (SM-A5360, adb R5CTB22S05Y), Android 15, Do Not Disturb on. (The ticket was found on the Sony XQ-BT52, Android 12, which is not connected.)
- Build: PowerDirector 16.8.0.2610212 (the ticket's build), Stage server.
- Drama 「Hidden identity」: storyboard ◆34, then **Fast (Seedance 2.0 Mini) · Full Video - 90 sec, ◆180** (cheapest model).

## Timeline
| Time | Event |
| --- | --- |
| 14:09:30 | 1st try: Generate; Home 14:09:39. 14:09:44 prompt_1 failed `cc team gateway failed: Failed to read connection`; turn ended with no card, no error, no charge, no notification. Not counted. |
| 14:38:17 | Retry: 「Create the video」 › Full Video - 90 sec ◆180 › Generate |
| 14:41:12 | prompts done, vid_1 … vid_6 dispatched |
| 14:41:19 | Home |
| 14:45:51, 14:46:25, 14:46:25, 14:46:26, 14:46:30, 14:46:42 | **6 FCM deliveries** (one per clip), all Title 「Your drama is ready」, Msg 「"Hidden identity" is done. Tap to watch it.」, Nid 112 |
| 14:46:42 | **one** `NotificationManager notify(2, …)` — the only notify call of the run |
| 14:46:48 | turn_complete; all 6 clips `tool_error`: `RefToVideo failed: generation_failed - download_and_decrypt: Software caused connection abort` |
| 15:11 | Shade: **one** PowerDirector notification 「Your drama is ready」 14:46 (dumpsys: 1 record) |

## Result
On this phone **one notification**: only the last delivery was posted and shown in the notification center, so it is the only one counted (KF-052). The 6 FCM payloads in logcat (one per clip) are deliveries, not notifications.
The single push still says the drama is done although the app then shows 「6 scenes couldn't be generated.」
(the clips failed to download while the app was in the background), and the balance dropped 25,402 → 25,222 (◆180) with no refund seen.
Not rechecked on the Sony XQ-BT52 where the 4 shown notifications were recorded.

Evidence: `16.8.0_DRA262610P0418_recheck_shade.png`, `16.8.0_DRA262610P0418_push_log.txt`, `16.8.0_DRA262610P0418_recheck_log.txt`, `notifications-retry.log`, `timeline.txt`.

# Debug info and session export

## KF-053 Debug-info switch on Android
- kind: howto · platform: android · use: run, ebug · tags: debug, pink, blueprint
- source: user 2026-11-03 (chat, relaying RD; REQ-068) · verified: 16.8.0 build 2610212 (2026-11-03)

AI Mini Drama has its own debug switch on Android (the rest of KP-003 still holds: no Pink, no fault switches). On
the 「Hi, I'm your AI Drama Assistant」 page, two-finger taps on the top row between Back and the credit pill toggle
it after a few taps, each toggle shown by the toast 「Tap for debug info: ON」 / 「…: OFF」; with it on, a drama chat's
top bar is yellow (as Stage's Launcher). Scripted: `device-android.ts <run dir> debug-info on|off`. Leave it off in
test runs unless a case needs it.

## KF-054 Exporting a session (blueprint, versions, events)
- kind: howto · platform: android · use: run, ebug · tags: debug, blueprint, export, logs
- source: user 2026-11-03 (chat, relaying RD; REQ-068) · verified: 16.8.0 build 2610212 (2026-11-03)

With debug info on, tapping a result card's header (Story Outline Result, Storyboard Result…) opens the debug viewer
(「Blueprint」 V<n> · hold to copy); its Export session › 「Include media」 (off: small zip) › EXPORT writes
`Download/<session id>_<time>.zip`, named in the toast 「Exported to …」. The zip holds `blueprint.json`,
`blueprint_versions/blueprint_V*.json`, `host_inputs/`, `engine_events/turn_*.jsonl`, `chat_history.json`, `perf/` and
`metadata.json`. Scripted: `debug-export [OUT] [--media]`, or the recipe `android/recipes/export-session.steps
"<History title>"`.

## KF-055 Export a finding's session before any reinstall
- kind: quirk · platform: android · use: run, ebug · tags: blueprint, export, reinstall, history
- source: user 2026-11-03 (chat; DRA262610P0420 / P0421, REQ-067 / REQ-068) · verified: 16.8.0 build 2610212 (2026-11-03)

The release build's `files/mini_drama/sessions/<id>/` cannot be read over adb (not debuggable, so `run-as` is refused;
targetSdk 36, so `adb backup` leaves app data out; the Stage server does not change this), and an uninstall,
reinstall or `pm clear` deletes History with every session. Export the session (KF-054) when the finding is made:
the A7 blueprints for P0420 / P0421 were lost to the A7-j reinstalls, leaving only logcat pieces and the server copy.

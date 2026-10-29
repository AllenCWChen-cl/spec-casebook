# AI Mini Drama (Android) — what the phone needs before a run

The repository holds everything a run reads on the computer (table, `phases.json`, run plans, recipes, scripts). This
list is what has to be on the phone or the account instead, because it can't be committed. Set these up once per
phone (the QA Sony Xperia 10 III, adb serial HQ61563393, Android 12).

## App, build and account

- The PowerDirector build under test, from its Testing Request: the TR's OneDrive folder holds
  `CL_Deluxe.<build>_<SR>_R9.zip` with the APK and `Cyberlink.MD5`. The user approves each download; check the MD5,
  then `adb install -r` over the installed app (keeps its data). Uninstall and fresh install are allowed on Android
  (user, 2026-10-28, REQ-047): fresh-install cases uninstall and reinstall the APK themselves; the app's data and the
  sign-in are wiped, so the user signs in again afterwards (the agent never types the password).
  A fresh install of 16.8.0 (2610212) starts on **Production** (`[AID]Production_Server`, no templates): the Stage
  server the A1/A2 install showed was carried over from the 16.6.1 install it upgraded, and 16.8 has no in-app switch
  (2026-10-28). **Stage switch (user, 2026-10-28):** the empty file `testserver.config` in `/sdcard/cyberlink/PDR/`
  puts PowerDirector on Stage at the next launch (`adb shell mv /sdcard/cyberlink/testserver.config
  /sdcard/cyberlink/PDR/`, then force-stop and relaunch). On Stage the Launcher's top bar is **yellow**; on Production
  it is dark. The app shows no "developer server" text as iOS does (user, 2026-10-28): judge the server by the bar's
  colour, not by a label. `/sdcard/cyberlink/tester.config` holds the SR code and is not the server switch. Check the bar after
  every fresh install. Move the file before the first launch: a first launch on Production leaves a credit ID that
  Stage rejects (`403 "Fail to verify uuid"`, O-27 of A2); `pm clear` fixes it. Rounds A1 and A2 used
  16.8.0 (2610212) from TR261021-0082.
- The 16.8 build has no Pink menu, no fault switches, no tier switch, no Write Log and no developer-server switch; the
  server shows only as the Launcher toolbar's content-desc (`[AID]Stage_Server`). Fault / error switches are planned
  for a later Android build (user, 2026-10-28); until one ships, fault-injection rows stay Blocked (observability).
- Signed in with one of the user's CyberLink test accounts (never typed by the agent; the user signs in on the phone).
  A1 ran signed out up to TC-036, then signed in to the user's test account (Free tier, 1,339 credits at 16:27).
  Paid-tier (Pro) rows need an account with a Pro subscription (REQ-043); until then they are Blocked (`paid-tier`).
- Credits: the account's balance must cover the charged steps of a segment (storyboard about 22–37, Create my
  character 4, video previews 60–180, full episodes more). The run never buys credits; a case whose next charge the
  balance can't cover is Blocked test-data with the balance and the price.
- Full video: one full video generation per session (user, 2026-10-28, REQ-047), so every case that needs a full
  video uses its own drama.

## Photos in the gallery

| Photo | Used by | Notes |
| --- | --- | --- |
| A clear photo of one person, face visible | TC-049, TC-128 – TC-131, TC-137, TC-317 (two different ones), TC-508 | Any non-famous person; a second photo for TC-317's replace step |
| A photo with three people | TC-052 | Faces large and unobstructed |
| A photo with no person (landscape, object) | TC-053 | |
| A photo of a well-known public figure | TC-054 | Any widely recognized celebrity photo |
| A distinctive photo, subject and orientation easy to tell | TC-283 | Checks the reference preview shows the photo picked |
| A photo with an easily recognized object near one edge | TC-366 | The crop removes it; the result must not show it |
| An AI-generated character sheet (front/side/back of one made-up character) | TC-332 setup | A generated look, not a real person |

Push them with `adb push <file> /sdcard/Pictures/casebook/` and rescan the media library, or take them on the phone.

## Phone settings (the user sets these; they are system settings)

- Developer options › USB debugging on, this computer allowed; Developer options › **Stay awake** on.
- Screen lock None or Swipe (a PIN stops `device-android.ts` with BLOCKER, exit 75); the phone on the USB cable.
- Photos and media access for PowerDirector: allowed when the app asks.
- System language English for the run; the language rows (CHT, JPN, French) need the user to switch the system
  language (Android 12 has no per-app language), else they stay Blocked (`app-language`).
- Wi-Fi on; offline cases turn it off and back on through `device-android.ts wifi` over USB.

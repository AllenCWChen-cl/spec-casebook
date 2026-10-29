# On-device run (Android)

Part of the spec-casebook skill. Android runs follow every rule of `run.md`; only the device commands change. The
client is `node scripts/device-android.ts <run dir> <command>` (Appium + UiAutomator2 on the QA Sony Xperia 10 III,
adb serial HQ61563393, Android 12, 1080 × 2520; setup in README › Android phone setup).

- **Same commands, same files.** `start`, `restart`, `status`, `shot`, `els`, `texts`, `source`, `tap`, `hold`, `drag`,
  `burst`, `pinch`, `id`, `lbl`, `scrollto`, `type`, `hidekb`, `clear`, `setval`, `launch`, `terminate`, `waitfor`,
  `tapif`, `expect`, `expect-not`, `do <recipe.steps>` work as on iOS, write the same `.session` and `activity.log`
  stamps, and exit 75 with `BLOCKER (device): …` when the phone is unplugged, unauthorized or PIN-locked. Coordinates
  are **pixels** (the screenshot frame), not points. `els` prints `class | resource-id | text | content-desc | x,y,w,h |
  flags`; `id` takes a resource-id (short or `<pkg>:id/…`), `lbl` / `tapif` / `waitfor` match text or content-desc.
  PowerDirector's accessibility ids are content-descs starting `[AID]` (e.g. `[AID]IAP_Back`). Recipes go in
  `library/<feature>/android/recipes/`.
- **iOS rule → Android command.** Segment start: `restart` (fresh UiAutomator2 server, PowerDirector in front). Keep
  the phone awake: the user turns on Developer options › Stay awake (or the longest Screen timeout) and uses no PIN
  lock. Rows in a list: `scrollto` (it also prints a row's switch state, `| row Switch on at X,Y`). Pages opened as
  fragments leave the previous page in the source; `els`, `texts`, `waitfor` and `scrollto` drop covered subtrees,
  `source` stays raw. Wi-Fi for offline cases: `wifi off|on|status` (refuses unless adb sees the phone over USB). App
  language: `launch --lang` needs Android 13, so on this phone language cases need the user to change the system
  language or are Blocked `--as test-data`. `appearance`, `pink …`, `ledger` and `install-wda` have no Android version
  yet. `back` is system Back, a spec exit path: test it wherever a page can be left. `home` presses Home; `activate`
  returns PowerDirector to the front without restarting it (use it after Home: `launch` force-stops the app first,
  2026-10-29). `build` prints versionName / versionCode (the run's build check).
- **Logs (run step 7 on Android).** The app logs to logcat (tags such as `CreditSystemManager`, `SplashActivity`); its
  files are not readable over adb and the phone keeps only ~1 MB of logcat, so `logcat start` at every segment start
  (background capture of the app's uid into `<run dir>/logs/.live/`) and `pull-logs <segment>` at the segment end,
  before a reinstall and before a hand-off (into `logs/<segment>-<time>/logcat-live.txt` plus a ring-buffer dump).
  Logs hold server keys: they stay in the git-ignored `logs/`, eBugs cite excerpts only.
- **Debug controls (rechecked on 16.8.0 build 2610212, 2026-10-27).** No Pink, fault switches, tier switch, Write Log or
  developer-server switch. The Launcher ☰ › Menu ends with a QA block (download all contents, scoped-storage
  migration, 「QA: consume all non-consumables」, 「QA: show all subscription plans」, 「QA: purchase SKU test」,
  region): never tap the consume or purchase rows. Fault rows stay Blocked `--as observability` until fault switches
  ship (planned for a later build, user 2026-10-28; recheck each new build and update this paragraph); failure cases
  otherwise need real failures (network loss). The tier comes from the signed-in account. Builds come from the TR's
  OneDrive folder (`CL_Deluxe.<build>_<SR>_R9.zip`, APK + `Cyberlink.MD5`), installed with `adb install -r` after the
  user approves the download (`fixtures.md`).
- **Server: Stage vs Production (user, 2026-10-28).** An empty `testserver.config` in `/sdcard/cyberlink/PDR/` means
  Stage at the next launch, absent means Production (`/sdcard/cyberlink/tester.config` holds the SR code and is not
  the switch). A fresh install keeps the file (shared storage); if it is missing the app comes up on Production with
  no templates: `adb shell mv` (or `cp`) it into `PDR/`, force-stop and relaunch. Put it in place **before the first
  launch** of a fresh install: a first launch on Production creates the credit ID there and Stage then rejects every
  signed-out turn (`403 "Fail to verify uuid"`); `adb shell pm clear <package>` makes a new ID on Stage. On Stage the
  Launcher's **top bar is yellow**, on Production dark: confirm it at every segment start and after every (re)install;
  don't rely on the `[AID]…_Server` content-desc.

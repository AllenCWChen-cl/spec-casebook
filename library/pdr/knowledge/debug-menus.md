# Debug menus

## KP-001 Pink debug overlay
- kind: howto · platform: ios · use: run · tags: pink, debug
- source: run.md step 4 (team, 2026-10-19); exploration KB ai-mini-drama.md (iPhone 16 Plus spot)

On the Launcher scrolled to the top, `burst 267 95 10` reveals the Pink debug overlay (the spot depends on the phone:
(273, 86) on an iPhone 16 Plus); its bubble at (37, 95) opens
it, and ☰ tweaks lists one menu per feature (`[z] <feature>`) plus `[0] IAP`. Never start a drag on the Pink panel or
bubble. Inside the panel taps below the band hit the Dismiss bar or the Launcher, and picking an option in a value
list pops back one level by itself. Every toggle changed in a run is recorded and set back to Off before the run ends.

## KP-002 Launcher ⋯ debug page
- kind: howto · platform: ios · use: run · tags: debug, logs, server
- source: run.md step 7 and Setup tools (team, 2026-10-19); exploration KB ai-mini-drama.md (State Control path)

The Launcher's ⋯ opens the debug page: General › **Write Log**, State Control › 「Use developer server:」 (then
「Server Changed」 › OK and a relaunch; the Launcher then shows a yellow 「Developer Server」 label), and ⋯ › Send logs via... for the log pull. Never tap Delete Database, Delete files in sandbox, Reset
user default or Trigger Crash there, and never capture the token rows.

## KP-003 Android debug controls
- kind: fact · platform: android · use: analysis, run · tags: debug, pink, tier
- source: run-android.md › Debug controls (team, 2026-10-27) · verified: 16.8.0 build 2610212 (2026-10-27)

Android has no Pink, no fault switches, no tier switch, no Write Log and no developer-server switch. Launcher ☰ ›
Menu ends with a QA block (download all contents, scoped-storage migration, 「QA: consume all non-consumables」, 「QA:
show all subscription plans」, 「QA: purchase SKU test」, region): never tap the consume or purchase rows. Fault
switches are planned for a later build (user, 2026-10-28): recheck on each new build.

## KP-062 Pulling the iOS log zip
- kind: howto · platform: ios · use: run · tags: logs
- source: exploration KB ai-mini-drama.md (2026-10)

⋯ › Send logs via... writes Logs.zip into the app's `tmp/`; pull it with Appium `mobile: pullFolder` on
`@com.cyberlink.ios.powerdirector/tmp/`. The Documents path is refused on TestFlight builds.

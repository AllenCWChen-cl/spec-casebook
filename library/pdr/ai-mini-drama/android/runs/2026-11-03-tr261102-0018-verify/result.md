# TR261102-0018 verify — ETHAN_HSU's tickets, 2026-11-03 (REQ-071)

Build 16.8.0.2611021 (TR build; APK from the TR's OneDrive, MD5 checked, `adb install -r`), Stage server, Samsung Galaxy A53
(R5CTB22S05Y, Android 15), signed in. Credits 25,222 → 25,206 (◆16). No ticket was commented on or changed (overlay rule 6).
QA Report: [QR261103-0042](https://ecl.cyberlink.com/IF3/qr/BPM/FormView/QR261103-0042) filed 2026-11-03 with the evidence ZIP, OK 12 / Fail 3 (tickets: 12 Close, 3 Fail); receipt `qr-receipt.json`. (QR261103-0039, filed without the ZIP, was cancelled by the user.)
Details: `result-s1.md` (character bugs), `result-s2.md` (chat / History / export bugs); screenshots in `screenshots/`.

| BugCode | ISS | Verdict | Note |
| --- | --- | --- | --- |
| DRA262610P0326 | AMDA-03 | STILL REPRODUCES | Gender filter lists 「Other」 twice (2/2) |
| DRA262610P0334 | AMDA-13 | STILL REPRODUCES | Back during a chat character update leaves with no dialog; update runs on, ◆4 charged |
| DRA262610P0335 | AMDA-15 | FIXED (unreachable) | A real paste stops at 1000/1000; the 1,050-char state is not reachable by hand (REQ-066); counts as fixed (REQ-073) |
| DRA262610P0337 | AMDA-17 | FIXED | X, swipe down and Back each ask 「Discard this character?」; Discard keeps it out of Mine (swipe / Back checked 17:1x, ◆8) |
| DRA262610P0338 | AMDA-18 | STILL REPRODUCES | Result page has X, Download, 「Save to library」, no Discard |
| DRA262610P0349 | AMDA-30 | FIXED | ↓ button at bottom right |
| DRA262610P0352 | AMDA-33 | FIXED | 3/3 storyboard dramas show the Scene 1 frame in History |
| DRA262610P0353 | AMDA-34 | FIXED | Cancel Choose Character (via ↻ Replace) does not reorder History |
| DRA262610P0357 | AMDA-39 | FIXED | One Play tap plays the video (2/2) |
| DRA262610P0359 | AMDA-41 | FIXED (spec fallback) | Leaving asks 「Stop exporting?」 with Keep exporting; background export (primary spec) not built |
| DRA262610P0360 | AMDA-42 | FIXED | Producing / done pages removed; export shows the drama's own frame |
| DRA262610P0386 | AMDA-53 | FIXED | Back on the album list stays on Add Media (2/2) |
| DRA262610P0387 | AMDA-54 | FIXED | Back on the enlarged preview stays in Choose Character (4/4) |
| DRA262610P0389 | AMDA-56 | FIXED | Back in Manage exits Manage, stays in History (2/2) |
| DRA262610P0391 | AMDA-58 | FIXED (unreachable) | Export Full Video sheet no longer exists on 2611021 (export starts at once); counts as fixed (REQ-073) |

Seen, not filed: with 「Stop exporting?」 left open the export finishes underneath it and the file is saved while the
dialog still says 「Your video won't be saved.」 (Memory_Drift - 1793694113127.mp4, 16:21:53).
Side effects: six exports saved to `/sdcard/Movies/cyberlink/PowerDirector/Mini Drama/`; two new dramas in History
(「Merger Season」, 「Crossed Lines」).

# AI Mini Drama iOS — P1 eBugs filed 2026-10-20

Creator ETHAN_HSU (read back) · method API (create + attachment upload) · TR [TR261019-0014](https://ecl.cyberlink.com/IF3/tr/BPM/FormView/TR261019-0014) · 16.9.0 build 189729 · Developer Server · template PowerDirector iOS 16.9 (23158) · due 2026-11-03

| BugCode | ISS | Sev | Belong | Type | Attachments | Short Description |
|---|---|---|---|---|---|---|
| [DRI261897P0006](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0006) | ISS-AMD-37 | 1 | RD | Functional | 4 | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Video generation always fails after ~6 min as the storage upload times out |
| [DRI261897P0007](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0007) | ISS-AMD-32 | 2 | PM | UX | 5 | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Storyboard and video Stop cancel silently with no credit message |
| [DRI261897P0008](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0008) | ISS-AMD-33 | 2 | RD | Functional | 4 | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Character and storyboard generation block the screen for over a minute |
| [DRI261897P0009](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0009) | ISS-AMD-34 | 3 | RD | Functional | 3 | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: No Find your video here in History bubble after leaving the first video |
| [DRI261897P0010](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0010) | ISS-AMD-35 | 3 | PM | UX | 3 | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: No video settings card after a successful storyboard preview Retry |
| [DRI261897P0011](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0011) | ISS-AMD-36 | 3 | RD | UI | 2 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create storyboard card loses its price after the chat-limit dialog |
| [DRI261897P0012](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0012) | ISS-AMD-38 | 3 | PM | UX | 3 | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Failed scene image card copy differs from the Design error frame |
| [DRI261897P0013](https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=DRI261897P0013) | ISS-AMD-39 | 3 | PM | UX | 3 | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Leaving during outline generation discards the drama instead of keeping it |

Every frame carries a red 5px box on the problem area (control frames unboxed); every ticket except DRI261897P0011 has a log excerpt (the app writes nothing for the chat-limit dialog). Signed storage URLs in the logs are truncated.

Not filed — existing tickets that still reproduce on 189729 (comment/reopen): see the Rechecks table in `20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0.md`.

AI Found 32 · Created 8 · Known 24 (Rechecks table, minus DRI261896P0020, which is the same defect as the new DRI261897P0006)
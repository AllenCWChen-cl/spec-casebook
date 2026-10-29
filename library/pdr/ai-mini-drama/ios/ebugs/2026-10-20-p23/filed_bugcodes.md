# AI Mini Drama iOS — P23 (P2 Regression + P3 Flows) eBugs filed 2026-10-21

Creator ETHAN_HSU (read back) · method API (create + attachment upload) · TR [TR261019-0014](https://ecl.cyberlink.com/IF3/tr/BPM/FormView/TR261019-0014) ("Same build" = P1's TR; header read 2026-10-21: build 189729) · 16.9.0 build 189729 · Developer Server · template PowerDirector iOS 16.9 (23158) · due 2026-11-04

| BugCode | ISS | Sev | Belong | Type | Attachments | Short Description |
|---|---|---|---|---|---|---|
| [DRI261897P0016](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0016) | ISS-AMD-40 | 2 | RD | Functional | 7 | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character and video generations keep their charged credits with no refund |
| [DRI261897P0017](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0017) | ISS-AMD-41 | 3 | RD | Functional | 3 | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: X on Finish your characters keeps the generated looks instead of discarding them |
| [DRI261897P0018](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0018) | ISS-AMD-42 | 2 | PM | UX | 2 | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Character filter with no matches shows a blank grid with no empty state |
| [DRI261897P0019](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0019) | ISS-AMD-43 | 3 | RD | UI | 2 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create my character description text runs under the expand icon |
| [DRI261897P0020](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0020) | ISS-AMD-44 | 3 | RD | UI | 4 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Feature strings stay English in Traditional Chinese and Japanese |
| [DRI261897P0021](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0021) | ISS-AMD-45 | 3 | RD | UI | 1 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Character filter sheet is titled 濾鏡 instead of 篩選 in Traditional Chinese |
| [DRI261897P0022](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0022) | ISS-AMD-49 | 3 | RD | UI | 1 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template list link reads その他 instead of もっと見る in Japanese |

Every frame carries a red 5px box on the problem area (the ISS-AMD-41 'ready' frame is the unboxed before-frame); ISS-AMD-40 and ISS-AMD-41 carry log excerpts (signed URL queries truncated, no tokens); the layout and string findings need none. ISS-AMD-45 and ISS-AMD-49 are the two halves of the reviewed ISS-AMD-45 (user: "This should be two bugs").

Not filed — the Rechecks (29 existing tickets that still reproduce) wait for the user's decision; no comments posted. See `20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0.md`.

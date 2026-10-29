# AI Mini Drama iOS — P4 (Templates) eBugs filed 2026-10-21

Creator ETHAN_HSU (read back) · method API (create + attachment upload) · TR [TR261019-0014](https://ecl.cyberlink.com/IF3/tr/BPM/FormView/TR261019-0014) ("Same TR" = P1's TR; header read 2026-10-21: build 189729) · 16.9.0 build 189729 · Developer Server · template PowerDirector iOS 16.9 (23158) · due 2026-11-04

| BugCode | ISS | Sev | Belong | Type | Attachments | Short Description |
|---|---|---|---|---|---|---|
| [DRI261897P0023](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0023) | ISS-AMD-46 | 2 | RD | UI | 5 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template detail player cuts off the cover title on 7 templates |
| [DRI261897P0024](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0024) | ISS-AMD-47 | 2 | PM | UI | 3 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Proposal Across Every Lifetime cover reads Proposal Across Lifetimes |
| [DRI261897P0025](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRI261897P0025) | ISS-AMD-48 | 3 | PM | UI | 3 | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template sample videos show garbled sign text |

Every frame carries a red 5px box on the problem area (the More-page frame is the unboxed control showing the full titles); no log excerpts (layout and asset content findings). The Art of Falling crop frame was replaced by the full detail frame (the original capture had moved past the title).

Not filed — the DRI261894P0008 'no longer reproduces' comment waits for the user; none posted.

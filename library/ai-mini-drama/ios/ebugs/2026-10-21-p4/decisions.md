# P4 filing decisions (user, pasted in chat 2026-10-21)

Verbatim, as given:

> P4 (library/ai-mini-drama/ios/ebugs/2026-10-21-p4/): Account Ethan_Hsu, API, [AIAgent], TRCode "Same TR"; all file: F-1 ISS-AMD-46 Sev 2 RD UI · F-2 ISS-AMD-47 Sev 2 PM UI · F-3 ISS-AMD-48 Sev 3 PM UI.

"Same TR" → TR261019-0014 (P1's and P23's TR). TR header read 2026-10-21: Build 16.9.0.189729 — matches the build
every P4 finding was exercised on (`runs/2026-10-21-p4-templates`). The DRI261894P0008 "no longer reproduces"
comment is not posted (not decided).

Account: Ethan_Hsu
Method: API
Source tag: [AIAgent]
TRCode: TR261019-0014

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMD-46 | 2 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template detail player cuts off the cover title on 7 templates |  |
| F-2 | ISS-AMD-47 | 2 | PM | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Proposal Across Every Lifetime cover reads Proposal Across Lifetimes |  |
| F-3 | ISS-AMD-48 | 3 | PM | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template sample videos show garbled sign text |  |

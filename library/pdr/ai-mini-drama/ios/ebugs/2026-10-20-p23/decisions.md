# P23 filing decisions (user, pasted in chat 2026-10-21)

Verbatim, as given:

> P23 (library/ai-mini-drama/ios/ebugs/2026-10-20-p23/): Account Ethan_Hsu, Method API, Source tag [AIAgent], TRCode "Same build"; every entry Action = file:
> F-1 ISS-AMD-40 Sev 2 RD Functional · F-2 ISS-AMD-41 Sev 3 RD Functional · F-3 ISS-AMD-42 Sev 2 PM UX · F-4 ISS-AMD-43 Sev 3 RD UI · F-5 ISS-AMD-44 Sev 3 RD UI (was PC-Doc) · F-6 ISS-AMD-45 Sev 3 RD UI with note "This should be two bugs"

Split note (applied 2026-10-21): F-6 is filed as two tickets, each with its own steps, Spec Link and image —
ISS-AMD-45 (CHT character filter sheet titled 濾鏡, should be 篩選) and a new ISS-AMD-49 (JPN More link reads その他,
should be もっと見る; the next ISS number after P4's last, ISS-AMD-48). Both keep F-6's Sev 3 / RD / UI.

"Same build" → TR261019-0014, the TR the P1 batch was filed on (16.9.0 build 189729). TR header read 2026-10-21
(`ecl_query.py tr TR261019-0014`): Build PowerDirector Mobile for iOS 16.9.0.189729 — matches the build every P23
finding was exercised on (`runs/2026-10-20-p23-regression-flows`). Rechecks: no comments posted (not decided).

Account: Ethan_Hsu
Method: API
Source tag: [AIAgent]
TRCode: TR261019-0014

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMD-40 | 2 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character and video generations keep their charged credits with no refund |  |
| F-2 | ISS-AMD-41 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: X on Finish your characters keeps the generated looks instead of discarding them |  |
| F-3 | ISS-AMD-42 | 2 | PM | UX | file | PDR-I 16.9.0 - [AIAgent][UX] AI Mini Drama: Character filter with no matches shows a blank grid with no empty state |  |
| F-4 | ISS-AMD-43 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Create my character description text runs under the expand icon |  |
| F-5 | ISS-AMD-44 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Feature strings stay English in Traditional Chinese and Japanese | was PC-Doc |
| F-6 | ISS-AMD-45 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Character filter sheet is titled 濾鏡 instead of 篩選 in Traditional Chinese | This should be two bugs → CHT half (濾鏡) |
| F-6b | ISS-AMD-49 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template list link reads その他 instead of もっと見る in Japanese | split from F-6 → JPN half (その他) |

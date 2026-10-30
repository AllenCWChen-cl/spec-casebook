# Decisions — AI Mini Drama Android A7 batch (2026-10-30), pasted by the user

Account: ETHAN_HSU
Method: API
Source tag: [AIAgent]
TRCode: TR261021-0082

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMDA-60 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed storyboard images claim a refund, but the 15 credits never return |  |
| F-2 | ISS-AMDA-61 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Video is priced below the charging sheet: Standard 30 s is 120 credits, not 390 |  |
| F-3 | ISS-AMDA-62 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Leaving a scene regenerate shows a raw 「MiniDrama FAIL」 debug toast |  |
| F-4 | ISS-AMDA-63 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: One video sends a 「Your drama is ready」 push per clip, four for one episode |  |
| F-5 | ISS-AMDA-64 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Scene description editor at 1,000 characters: no red counter or limit message |  |
| F-6 | ISS-AMDA-65 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A Mine character's face turns about 25 years younger in the full episode's clips |  |
| F-7 | ISS-AMDA-66 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Asking to update two characters charges for and regenerates three |  |
| F-8 | ISS-AMDA-67 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A clean install opens the landing page with no intro page |  |
| F-9 | ISS-AMDA-68 | 3 | PC-Doc | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Template category headers and names stay English in Chinese and French | Image 2 is blank? |
| F-10 | ISS-AMDA-69 | 3 | PC-Doc | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: French copy: 「Crédits seront consommés」 lacks an article; 「Langage de la vidéo」 |  |
| F-11 | ISS-AMDA-70 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: History times use the English 「AM」 format in Chinese, Japanese and French |  |

## Changes made before filing
- F-9 (2026-10-30): image 2 was blank (French More page captured while loading, k-fr-more). Replaced with k-fr-more2
  (the loaded French More page: English headers and names) and added k-fr-landing (the French landing page, proving the
  app language) as image 4.
- F-2 (2026-10-30, before these decisions): Result / Expect reworded to the charging sheet (Best's 6/s is PM 10/16; the
  sheet has no 2.5 row).
- F-1 (2026-10-30): its two Credit Details images were the same picture (20:40 and 20:44, nothing changed between); now the 20:23 and 20:40 reads, both with no refund row.

# AI Mini Drama Android — A7 (table v6) eBugs filed 2026-10-30

Creator ETHAN_HSU (read back on every bug) · method API (create + attachment upload) · source tag [AIAgent] · TR [TR261021-0082](https://ecl.cyberlink.com/IF3/tr/BPM/FormView/TR261021-0082) · 16.8.0 build 2610212 · Stage server · template Generic v16.8 (22939), PowerDirector Mobile for Android · due 2026-11-06 · decisions: `decisions.md` (changes before filing listed under its table)

**TR build field:** the TR261021-0082 header (read-only, 2026-10-30) is titled 「16.8.0.2610212 (Deluxe)」 while its Build field reads 「16.8.0.2610171」 — the same as at A2 / A4, where the user confirmed 2610212. Findings were verified on 2610212; every bug is filed with Version 16.8.0 / Build 2610212.

**Read back:** every bug's Creator, severity, belong, TR, version, build, Short Description and description match what was sent (description compared in full), and every attachment is on its page (`readback.log`, `upload.log`). Dedupe re-run right before filing (`dedupe-recheck.txt`): no new duplicate. No existing ticket was commented on.

| F | BugCode | ISS | Sev | Belong | Type | Attachments | Short Description |
|---|---|---|---|---|---|---|---|
| F-1 | [DRA262610P0415](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0415) | ISS-AMDA-60 | 2 | RD | Functional | 4 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed storyboard images claim a refund, but the 15 credits never return |
| F-2 | [DRA262610P0416](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0416) | ISS-AMDA-61 | 2 | RD | Functional | 5 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Video is priced below the charging sheet: Standard 30 s is 120 credits, not 390 |
| F-3 | [DRA262610P0417](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0417) | ISS-AMDA-62 | 3 | RD | UI | 2 | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Leaving a scene regenerate shows a raw 「MiniDrama FAIL」 debug toast |
| F-4 | [DRA262610P0418](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0418) | ISS-AMDA-63 | 3 | RD | Functional | 2 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: One video sends a 「Your drama is ready」 push per clip, four for one episode |
| F-5 | [DRA262610P0419](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0419) | ISS-AMDA-64 | 3 | RD | UI | 1 | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Scene description editor at 1,000 characters: no red counter or limit message |
| F-6 | [DRA262610P0420](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0420) | ISS-AMDA-65 | 2 | RD | Functional | 3 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A Mine character's face turns about 25 years younger in the full episode's clips |
| F-7 | [DRA262610P0421](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0421) | ISS-AMDA-66 | 2 | RD | Functional | 3 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Asking to update two characters charges for and regenerates three |
| F-8 | [DRA262610P0422](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0422) | ISS-AMDA-67 | 3 | RD | Functional | 2 | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A clean install opens the landing page with no intro page |
| F-9 | [DRA262610P0423](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0423) | ISS-AMDA-68 | 3 | PCDoc | UI | 4 | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Template category headers and names stay English in Chinese and French |
| F-10 | [DRA262610P0424](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0424) | ISS-AMDA-69 | 3 | PCDoc | UI | 2 | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: French copy: 「Crédits seront consommés」 lacks an article; 「Langage de la vidéo」 |
| F-11 | [DRA262610P0425](https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/DRA262610P0425) | ISS-AMDA-70 | 3 | RD | UI | 2 | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: History times use the English 「AM」 format in Chinese, Japanese and French |

# Decisions — AI Mini Drama P9 eBug batch (2026-10-27)

Pasted by the user in chat, 2026-10-27, verbatim. With it the user asked (same message): "For the ebug filing skill,
add this into the instructions, for items that are failures related (eg. F-6), put in the logs" — added to both eBug
skills, AGENTS.md and check_ebug_format.py (every failure-related entry carries its log excerpt, shown on the review
card). Changes from the proposal: F-2 severity 3 → 2. Before filing, F-3 and F-23 (failure-related, no log) get log
excerpts; every log excerpt is shown on the review page.

Account: ETHAN_HSU
Method: API
Source tag: [AIAgent]
TRCode: TR261022-0031

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMD-50 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Credit pill opens My Credits mid-generation with no leave dialog |  |
| F-2 | ISS-AMD-51 | 2 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Iris replies show internal locale codes like ja_JP and en_US |  |
| F-3 | ISS-AMD-52 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Partial character failure shows the single-character error dialog |  |
| F-4 | ISS-AMD-53 | 2 | RD | Functional | hold (dup DRI261897P0016) | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed character generations keep their charged credits with no refund |  |
| F-5 | ISS-AMD-54 | 3 | RD | Functional | hold (dup DRI261895P0024) | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Character generation shows no Cancel or time hint and cannot be stopped |  |
| F-6 | ISS-AMD-55 | 2 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Confirming the cast charges character portraits with no offer card, then fails |  |
| F-7 | ISS-AMD-56 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Chat shows an unsent Generate with AI message and claims an uncreated storyboard |  |
| F-8 | ISS-AMD-57 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Character change in chat offers one chip and skips the update messages |  |
| F-9 | ISS-AMD-58 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Typed character name instead of a chip skips the Update characters card |  |
| F-10 | ISS-AMD-59 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Update characters card does not show how many characters it updates |  |
| F-11 | ISS-AMD-60 | 3 | RD | Functional | hold (dup DRI261896P0048) | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Back early in a paid generation leaves with no Stop and lose your credits? |  |
| F-12 | ISS-AMD-61 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Create my character cuts a 1,050-character description to 1,000 |  |
| F-13 | ISS-AMD-62 | 2 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Reopening a drama from History drops messages and the character card |  |
| F-14 | ISS-AMD-63 | 2 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Failed storyboard and scene image generations keep credits with no refund |  |
| F-15 | ISS-AMD-64 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Storyboard image update shows a generic skeleton, not on the changed scene |  |
| F-16 | ISS-AMD-65 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Storyboard Preview keeps the old preview after the storyboard is cut or changed |  |
| F-17 | ISS-AMD-66 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Chat turns fail with token_request fired outside a turn worker thread |  |
| F-18 | ISS-AMD-67 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Failed storyboard lacks the Storyboard couldn't be created line |  |
| F-19 | ISS-AMD-68 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Returning from History or Choose Character does not show the newest message |  |
| F-20 | ISS-AMD-69 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Tap outside the History info bubble opens the drama under the tap |  |
| F-21 | ISS-AMD-70 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Asking Iris to change the story title after the characters stage is declined |  |
| F-22 | ISS-AMD-71 | 1 | RD | Functional | hold (dup DRI261897P0006) | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Video generation always fails after ~6 min: HTTP PUT to storage URL fails |  |
| F-23 | ISS-AMD-72 | 3 | RD | Functional | file | PDR-I 16.9.0 - [AIAgent] AI Mini Drama: Try again on a failed video shows a settings card with no model choice |  |
| F-24 | ISS-AMD-73 | 3 | RD | UI | file | PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Offline send shows No connection available instead of You're offline toast |  |

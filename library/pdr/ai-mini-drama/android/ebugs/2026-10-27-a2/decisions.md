# Decisions — AI Mini Drama Android A2 batch (pasted by the user, 2026-10-28)

Copied from the review page's Copy decisions, verbatim. Not filed yet: filing waits for the user's go-ahead in chat
and the TR261021-0082 build check (title 2610212, Build field 2610171).

Account: ETHAN_HSU
Method: API
Source tag: [AIAgent]
TRCode: TR261021-0082

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMDA-01 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Surprise me appends the same inspiration on every tap |  |
| F-2 | ISS-AMDA-02 | 3 | PM | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: First outline card is titled 「Story Outline Result」 |  |
| F-3 | ISS-AMDA-03 | 2 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character filter lists 「Other」 twice under Gender |  |
| F-4 | ISS-AMDA-05 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Character generation is priced at 4 credits instead of 6 |  |
| F-5 | ISS-AMDA-07 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Update characters card shows no character count |  |
| F-6 | ISS-AMDA-08 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: X on 「Your characters are ready」 still applies the looks and commits the cast |  |
| F-7 | ISS-AMDA-09 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Leave anyway drops finished character looks but keeps their credits |  |
| F-8 | ISS-AMDA-10 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Asking to change a character shows a different question and a single chip |  |
| F-9 | ISS-AMDA-11 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: A typed character name does not lead to the Update characters card |  |
| F-10 | ISS-AMDA-12 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character update shows other progress and result messages than the spec |  |
| F-11 | ISS-AMDA-13 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Back during a chat character update leaves with no stop dialog |  |
| F-12 | ISS-AMDA-15 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Expanded description editor cuts text to 1,000 characters and writes it back |  |
| F-13 | ISS-AMDA-16 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Dragging inside the description box opens the editor instead of scrolling the text |  |
| F-14 | ISS-AMDA-17 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Closing a generated character with X, swipe down or Back saves it to Mine anyway |  |
| F-15 | ISS-AMDA-18 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Generated character page has no Discard button |  |
| F-16 | ISS-AMDA-19 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Delete character dialog body differs from the spec text |  |
| F-17 | ISS-AMDA-20 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard and video generation skip the 10/22 stage messages and charge per image |  |
| F-18 | ISS-AMDA-21 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Stop button stays in the input bar after Generate (10/22: only the mic) |  |
| F-19 | ISS-AMDA-22 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Video stage ①: exits leave with no 「Leave while we're preparing?」 dialog |  |
| F-20 | ISS-AMDA-23 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard stage ②: Back still asks 「Stop and lose your credits?」 |  |
| F-21 | ISS-AMDA-24 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard stops when the app is swiped away and resumes only on reopen |  |
| F-22 | ISS-AMDA-25 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: First storyboard shows one skeleton row instead of per-scene skeletons |  |
| F-23 | ISS-AMDA-27 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Storyboard and video dramas reopen at the outline, not their latest stage |  |
| F-24 | ISS-AMDA-28 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Reopened dramas lose the confirmed cast and the characters card |  |
| F-25 | ISS-AMDA-29 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Chat loses earlier messages and cards after a reopen, a Stop or a resume |  |
| F-26 | ISS-AMDA-30 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Scroll-to-bottom button sits at the bottom centre instead of the bottom right |  |
| F-27 | ISS-AMDA-31 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Sent message is not moved to the top and the view follows the reply |  |
| F-28 | ISS-AMDA-32 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Returning from History, Choose Character or Full Edit keeps the old scroll position |  |
| F-29 | ISS-AMDA-33 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: History thumbnail shows a character look instead of the first storyboard frame |  |
| F-30 | ISS-AMDA-34 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Opening a drama and cancelling Choose Character moves it to the top of History |  |
| F-31 | ISS-AMDA-35 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Video and storyboard cards show no 「You'll have N left」 line under Generate |  |
| F-32 | ISS-AMDA-37 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Scene video update shows no Updating line and appends a new card |  |
| F-33 | ISS-AMDA-38 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Download during a scene video update saves the old clips at once |  |
| F-34 | ISS-AMDA-39 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Play on the video card opens the player paused; it needs a second tap |  |
| F-35 | ISS-AMDA-40 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Renaming a drama during a video job: the push uses the old name and no toast shows |  |
| F-36 | ISS-AMDA-41 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Leaving the export page asks to leave and cancels the export |  |
| F-37 | ISS-AMDA-42 | 2 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Export producing and done pages show another drama's thumbnail |  |
| F-38 | ISS-AMDA-43 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Generation waits exceed 10 seconds with only Stop or leaving possible |  |
| F-39 | ISS-AMDA-45 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: First video on a fresh install skips the 「Get notified」 pre-prompt |  |
| F-40 | ISS-AMDA-46 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: History opens an empty new chat for about 2 minutes after leaving a video job |  |

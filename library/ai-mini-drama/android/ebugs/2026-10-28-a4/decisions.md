# Decisions — A4 batch (user, 2026-10-29, pasted from the review page's Copy decisions)

Account: ETHAN_HSU
Method: API
Source tag: [AIAgent]
TRCode: TR261021-0082

| # | ISS | Sev | Belong | Type | Action | Short Description | Note |
|---|---|---|---|---|---|---|---|
| F-1 | ISS-AMDA-47 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Chat shows no 「More ideas +」 chip once it has content |  |
| F-2 | ISS-AMDA-48 | 3 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Credit pill leaves a generating outline with no 「Leave this chat?」 dialog |  |
| F-3 | ISS-AMDA-49 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Policy-refused idea gets a cut-off 「I cannot」 reply, not the terms message |  |
| F-4 | ISS-AMDA-50 | 3 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: 「Finish your characters」 plural subtitle differs from the spec |  |
| F-5 | ISS-AMDA-51 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Generate all with one failed character shows the single error and no 「!」 |  |
| F-6 | ISS-AMDA-52 | 2 | RD | UI | file | PDR-A 16.8.0 - [AIAgent][UI] AI Mini Drama: Character filter with no match shows a blank grid and no empty-state message |  |
| F-7 | ISS-AMDA-53 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the Add Media album list closes the whole picker |  |
| F-8 | ISS-AMDA-54 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the enlarged character preview closes Choose Character |  |
| F-9 | ISS-AMDA-55 | 2 | RD | Functional | hold | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed chat image update shows no 「!」 or message and keeps its 12 credits | The image looks like they succeeded? If there's other images showing it failed file this still |
| F-10 | ISS-AMDA-56 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back in History Manage mode leaves History instead of exiting Manage |  |
| F-11 | ISS-AMDA-57 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Asking Iris to change the story title does not rename the drama in History |  |
| F-12 | ISS-AMDA-58 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: System Back on the Export Full Video sheet also closes the result page |  |
| F-13 | ISS-AMDA-59 | 2 | RD | Functional | file | PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Stopping the cast confirmation shows 「Something went wrong on my end」 |  |

Not mentioned: refiling the closed same-OS tickets DRA262610P0127 and DRA262610P0069 — not refiled.

## Rewrite note — F-9 (orchestrator, 2026-10-29)

F-9 (ISS-AMDA-55, TC-293) was held with the note above. The evidence shows the failure, so per that note it is filed,
rewritten to match the evidence exactly:
- Logcat (16.8.0_amda55_log.txt): the two Location (env) images succeeded (receipts completed, ◆3 each); the two main
  scene keyframes failed (TextToImage generation_failed, EditImageGPT2 failed for beat_00c62024 / beat_3deb8b06, ◆3
  each). Charged 12 in all (17717 → 17705); the 6 of the two failed images should have been refunded; nothing was.
- Screens: Scene 2's Location image shows the rain (why it looks successful) but its main image does not; the chat shows
  no 「!」, no failure message, no Edit, and Iris replies 「Updated Scene 2 (Their First Loss) and Scene 4 (A United
  Front) to incorporate heavy rain…」.
- Short Description: PDR-A 16.8.0 - [AIAgent] AI Mini Drama: Failed scene images in a chat update show no 「!」 and keep their 6 credits
- Result: Location images updated, both main scene images failed (log), the chat claims success with no 「!」 / message /
  Edit, and the 6 credits of the failed images are not refunded.
- Attachment added: 16.8.0_amda55_success_claim.jpg (runs/2026-10-28-a4-full/screenshots/wifi-off-gen2.png, Iris's
  success claim red-boxed); the existing images and the log excerpt (token-checked) are kept.
Filed with Sev 2 / RD / Functional as in the table; `decisions-filing.md` is this table with F-9 set to file and the new
Short Description, the input to `drafts_to_bodies.py --decisions`.

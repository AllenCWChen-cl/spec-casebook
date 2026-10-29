# Update plan — ai-mini-drama / ios: approved v9 → draft 20261029-143013

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama -
  PM Spec 20261021.pdf). New source in this draft: the Google Sheet the MX board `mx-a-right` 「③ Credit Charging
  Table / 1. Action ID & Charging Table Link」 links (MX Figma 1057:24035 → 「AI Mini Drama CMS」 › 「Action ID (not on
  CMS)」, modified 2026-10-20, read 2026-10-29), saved as `specs/2026-10-21-2/extracted/mx-charging-table.md` (REQ-057).
  No longer supplied: none.
- The user decided (2026-10-29, REQ-057: "choose one; I will send price updates later") to use the sheet only where no
  other source gives a number: the discount prices, the no-discount regenerate and the action ids. Normal prices stay
  PM 10/16 / Design; no normal-price row changes.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-463 | new | R-147: 「the credit discount」 with no amount | first-time discount: 2 credits per character image, per storyboard scene, per second of Seedance 2.0 and of Seedance 2.0 Mini video (first generation only) |
| R-464 | new | R-147: regenerate full price only after one discounted drama | a regenerate (character, storyboard scene, video) is never discounted, even inside the discounted session |
| R-465 | new | — | discounted charges are booked under the `…_aiminidrama_discount` action ids, normal charges under `…_aiminidrama_normal`; the app log shows `action_id` and `total_credit` |
| Q-32, Q-33 | new | — | see Questions for PM |

Grids updated: Hidden clauses (R-463, R-464, R-465), Variants (R-463 × 4 + Seedance 2.5 n/a, R-464 × 3, R-465 × 2),
Request ledger coverage (REQ-057 → R-463 – R-465, Q-32, Q-33). Annotation trace: block `mx-a-right@10647,2824` →
R-463, R-464, R-465.

## Case changes
- New (7), all in 「Credits and limits」:
  - TC-424 (R-465, R-147) after TC-229: a Pro / Pro+ character generation is booked under the `…_aiminidrama_normal`
    action id (log `action_id`, `total_credit` = Credit Details). Runs now (no purchase needed).
  - TC-421 (R-463, R-465) after TC-231: discounted storyboard, 2 credits per scene, `…_discount` id.
  - TC-422 (R-463, R-465) after TC-421: discounted Seedance 2.0 video, 2 credits per second (Preview 30 s → ◆60).
  - TC-423 (R-463, R-465) after TC-422: discounted Seedance 2.0 Mini video, 2 credits per second (Preview 30 s → ◆60).
  - TC-425 (R-464, R-465) after TC-233: regenerating a character in the discounted session is charged the normal price,
    `…_normal` id.
  - TC-426 (R-464, R-465) after TC-425: 「Regenerate Image」 on a scene in the discounted session shows and charges ◆6,
    `…_normal` id.
  - TC-427 (R-464, R-465) after TC-426: regenerating a scene video in the discounted session charges the model's normal
    per-second price, `…_normal` id (with Mini both prices are 2 per second; only the id tells them apart).
- Modified (1): TC-231 — 「the discounted price」 becomes 2 credits per character image on the characters card, charged
  in Credit Details and logged under `genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_discount`
  (R-463, R-465 added to its Spec Ref).
- Removed: 0
- Unchanged: 418

TC-233 (regenerate after a full discounted drama) is unchanged: its setup (a finished drama) differs from a regenerate
inside the discounted session, so TC-425 – TC-427 are new rows right after it (REQ-033).

## Found by the analysis
- Annotation trace: 621 blocks, 1 new (`mx-a-right@10647,2824`, 「③ Credit Charging Table / 1. Action ID & Charging
  Table Link」) → R-463, R-464, R-465 → TC-231, TC-421 – TC-427. The other 620 carry over.
- Pass 4 numbers: the discount 2 per unit (R-463).
- Pass 9 hidden clauses: R-463 / R-464 / R-465 (the action id a charge is booked under) → observed in the app log after
  a log pull (`"action_id"`, `"total_credit"`, as already logged on the 10/19 build:
  `genimage_1_img_openai_gptimage2.5sunburst_none_1k_aiminidrama`, no _normal / _discount suffix then) and in
  Mine › Credits › Details. Not parked for observability; the discount rows are parked for the purchase only.
- Pass 10 variants: R-463 character / storyboard / Seedance 2.0 / Mini (Seedance 2.5 n/a, Q-33); R-464 character /
  storyboard / video.
- Controls: no new controls; `control-trace.json` carried from draft 20261029-085112, with the 14 entries that draft
  had left open (superseded MX v2 / v3 boards, the MX older template chat, the pm-main-flow 0–100 input) copied from
  the approved table's trace.

## Not added (value check)
- Normal prices from the sheet (character 6 / image, storyboard 6 / scene, Seedance 2.0 13 / s, Mini 4 / s): not
  used — user 2026-10-29 (REQ-057); PM 10/16 / Design keep deciding normal prices; Q-32.
- Seedance 2.5 discount row: no source gives a number (the sheet has no 2.5 row); Q-33.
- A separate 「with a reference image」 (`…_enable_…`) character discount row: same price (2) as without; merged into
  TC-231, whose Expected Result accepts either id.
- Park (purchase): TC-231 (as before), TC-421, TC-422, TC-423, TC-425, TC-426, TC-427 need a Free account that
  subscribes (sandbox) in the session — `needs: ["purchase"]` (`unavailable.purchase`: no purchases in a run, user rule),
  the same as TC-231. This draft has no `phases.json` (as draft 20261029-085112): the next round's phases.json lists
  these rows in the 「Credits and limits」 stage segment with `needs: ["purchase"]` and TC-424 without needs.

## PM-only rows
- None added.

## Questions for PM
- Q-32 The sheet's normal prices (character 6 / image, storyboard 6 / scene, Seedance 2.0 13 / s, Mini 4 / s) disagree
  with PM 10/16 (2.0 = 4 / s, Mini = 2 / s) and with the app (character ◆4 seen in runs). Which is current?
- Q-33 The sheet has no Seedance 2.5 action id or discount price. Is 2.5 discounted in the first-time discount session,
  and at what price?

## Questions for you
- None; price updates from you will replace the sheet numbers (REQ-057 stays open until then).

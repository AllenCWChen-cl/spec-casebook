# Update plan — pdr/ai-mini-drama / android: approved v4 → draft 20261029-143528

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama -
  PM Spec 20261021.pdf). New source in this draft: the Google Sheet the MX board `mx-a-right` 「③ Credit Charging
  Table / 1. Action ID & Charging Table Link」 links (MX Figma 1057:24035 → 「AI Mini Drama CMS」 › 「Action ID (not on
  CMS)」, modified 2026-10-20, read 2026-10-29), saved as `specs/2026-10-21-2/extracted/mx-charging-table.md` (REQ-057).
  No longer supplied: none.
- Android port of iOS draft 20261029-143013 (same request, same sheet). The user decided (2026-10-29, REQ-057: "choose
  one; I will send price updates later") to use the sheet only where no other source gives a number: the discount
  prices, the no-discount regenerate and the action ids. Normal prices stay PM 10/16 / Design; no normal-price row
  changes.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-479 | new (iOS R-463) | R-147: 「the credit discount」 with no amount | first-time discount: 2 credits per character image, per storyboard scene, per second of Seedance 2.0 and of Seedance 2.0 Mini video (first generation only) |
| R-480 | new (iOS R-464) | R-147: regenerate full price only after one discounted drama | a regenerate (character, storyboard scene, video) is never discounted, even inside the discounted session |
| R-481 | new (iOS R-465) | — | discounted charges are booked under the `…_aiminidrama_discount` action ids, normal charges under `…_aiminidrama_normal`; logcat shows `action_id` and `total_credit` |
| Q-A18, Q-A19 | new (iOS Q-32, Q-33) | — | see Questions for PM |

Grids updated: Hidden clauses (R-479, R-480, R-481), Variants (R-479 × 4 + Seedance 2.5 n/a pointing at Q-A19,
R-480 × 3, R-481 × 2), Request ledger coverage (REQ-057 → R-479 – R-481, Q-A18, Q-A19). Annotation trace: block
`mx-a-right@10647,2824` → R-479, R-480, R-481.

## Case changes
- New (7), all in 「Credits and limits」:
  - TC-544 (R-481, R-147) after TC-229: a Pro character generation is booked under the `…_aiminidrama_normal` action id
    (logcat `action_id`, `total_credit` = Credit Details). iOS TC-424.
  - TC-545 (R-479, R-481) after TC-231: discounted storyboard, 2 credits per scene, `…_discount` id. iOS TC-421.
  - TC-546 (R-479, R-481) after TC-545: discounted Seedance 2.0 video, 2 credits per second (Preview 30 s → ◆60). iOS TC-422.
  - TC-547 (R-479, R-481) after TC-546: discounted Seedance 2.0 Mini video, 2 credits per second (Preview 30 s → ◆60). iOS TC-423.
  - TC-548 (R-480, R-481) after TC-233: regenerating a character in the discounted session is charged the normal price,
    `…_normal` id. iOS TC-425.
  - TC-549 (R-480, R-481) after TC-548: 「Regenerate Image」 on a scene in the discounted session shows and charges ◆6,
    `…_normal` id. iOS TC-426.
  - TC-550 (R-480, R-481) after TC-549: regenerating a scene video in the discounted session charges the model's normal
    per-second price, `…_normal` id (with Mini both prices are 2 per second; only the id tells them apart). iOS TC-427.
- Modified (1): TC-231 — 「the discounted price」 becomes 2 credits per character image on the characters card, charged
  in Credit Details and logged in logcat under `genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_discount`
  (R-479, R-481 added to its Spec Ref); the old note 「Discount amount is in the MX credit charging table … record it」
  is replaced by the sheet's number.
- Removed: 0
- Unchanged: 494

TC-233 (regenerate after a full discounted drama) is unchanged: its setup (a finished drama) differs from a regenerate
inside the discounted session, so TC-548 – TC-550 are new rows right after it (REQ-033).

Adapted for Android (skill Workflow step 0): the iOS 「Log stage timings ON」 precondition becomes 「logcat capture
running (device-android.ts logcat start)」 and 「pull the logs」 becomes `device-android.ts pull-logs` with the charge
read in logcat (Android 16.8 already logs `action_id` and `total_credit` on its credit lines: A2 2026-10-27,
`RefToVideo credit action_id=genvideo_1_sec_bytedance_seedance2.0std_none_480p_aiminidrama … total_credit=60`, so no
row is parked for observability); the subscription is a Google Play sandbox subscription (license-tester account);
the paid tier is PowerDirector Pro only (TC-544: 「Tier Pro」, the account's own subscription — Android 16.8 has no tier
switch, Q-A2). No Pink, Developer Server or iOS log control is named.

## Found by the analysis
- Annotation trace: 621 blocks, 1 newly traced (`mx-a-right@10647,2824`, 「③ Credit Charging Table / 1. Action ID &
  Charging Table Link」) → R-479, R-480, R-481 → TC-231, TC-544 – TC-550. The other 620 carry over.
- Pass 4 numbers: the discount 2 per unit (R-479).
- Pass 9 hidden clauses: R-479 / R-480 / R-481 (the action id a charge is booked under) → observed in logcat after
  `pull-logs` (`action_id`, `total_credit`) and in Mine › Credits › Details.
- Pass 10 variants: R-479 character / storyboard / Seedance 2.0 / Mini (Seedance 2.5 n/a, Q-A19); R-480 character /
  storyboard / video; R-481 normal / discount.
- Controls: no new controls; `control-trace.json` carried from draft 20261029-093927, with the 13 entries
  `controls.ts` left open (superseded MX v2 / v3 boards, the MX older template chat C-668947) copied from the approved
  table's trace (all n/a, as approved).

## Not added (value check)
- Normal prices from the sheet (character 6 / image, storyboard 6 / scene, Seedance 2.0 13 / s, Mini 4 / s): not
  used — user 2026-10-29 (REQ-057); PM 10/16 / Design keep deciding normal prices; Q-A18.
- Seedance 2.5 discount row: no source gives a number (the sheet has no 2.5 row); Q-A19.
- A separate 「with a reference image」 (`…_enable_…`) character discount row: same price (2) as without; merged into
  TC-231, whose Expected Result accepts either id.
- Park (purchase): TC-231 (as before), TC-545 – TC-550 need a Free account that subscribes (Google Play sandbox) in the
  session — `needs: ["purchase"]` (`unavailable.purchase`: no purchases in a run, sandbox included). TC-544 needs a
  Pro account — `needs: ["paid-tier"]`, as TC-229 on Android (on iOS the matching row needs nothing, since iOS switches
  the tier in Pink). `phases.json` (copied from draft 20261029-093927): these 8 rows join the pending round A5 in its
  「Credits and limits」 segment A5-f, in table order (origin A5 for the new rows, A4 for TC-231); `build-draft.ts`
  rebuilds draft.csv and phases.json.

## PM-only rows
- None added.

## Questions for PM
- Q-A18 The sheet's normal prices (character 6 / image, storyboard 6 / scene, Seedance 2.0 13 / s, Mini 4 / s) disagree
  with PM 10/16 (2.0 = 4 / s, Mini = 2 / s) and with the app (character ◆4 seen in Android runs). Which is current?
  (iOS Q-32)
- Q-A19 The sheet has no Seedance 2.5 action id or discount price. Is 2.5 discounted in the first-time discount
  session, and at what price? (iOS Q-33)

## Questions for you
- None; price updates from you will replace the sheet numbers (REQ-057 stays open until then).

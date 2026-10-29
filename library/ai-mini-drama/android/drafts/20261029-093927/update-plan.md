# Update plan — ai-mini-drama / android: approved v3 → draft 20261029-093927

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama -
  PM Spec 20261021.pdf, and the two PM Figma frames dated 10/22 already read for Android on 2026-10-27). New or changed:
  none. No longer supplied: none.
- This draft brings the Android table up to the PM / MX Figma inventory merged 2026-10-29 (REQ-052, REQ-050), which iOS
  applied in draft 20261029-085112 (iOS v9).
- Section A: the PM 10/22 frames, checked rule by rule against iOS v9. Later sections add the PM / MX flow
  arrows (Section B) and the control trace (Section C); Section B continues the requirement numbering at R-357 and the
  open questions at Q-A10, the case numbering after TC-540.

## Requirement changes

### Section A — PM 10/22 frames
Android applied frames 4422:2 (two stages, no pause) and 4418:2 (Export Full Video states) on 2026-10-27 as R-315 –
R-325 (REQ-046). Each iOS rule of the same frames (R-332 – R-340 and the rules iOS changed) was matched to its Android
requirement and to Android rows read in full:

| iOS rule | Android requirement | Android rows (before → this draft) |
|---|---|---|
| R-332 no ■ stop after Generate: Create storyboard | R-315 | TC-512 (TC-156 still pressed Stop → removed) |
| R-332 … Generate Video | R-315 | none: TC-157 still pressed Stop → TC-157 modified |
| R-332 … storyboard update in chat | R-315 | none → TC-536 new |
| R-332 … video regeneration | R-315 | none → TC-540 new |
| R-333 video stage ① skeleton, charge at stage ② | R-316, R-320 | TC-405 |
| R-334 storyboard stage ① skeleton, charge at stage ② | R-317, R-320 | TC-377 |
| R-335 stage ① restart after Leave anyway: storyboard | R-319 | TC-063, TC-399 |
| R-335 … storyboard, app swiped away | R-319 | none → TC-534 new |
| R-335 … video, Leave anyway | R-319 | TC-515 |
| R-335 … video, app in the background | R-319 | none → TC-538 new |
| R-336 stage ② survives a swipe: storyboard | R-321 | TC-514 |
| R-336 … video | R-321 | none → TC-539 new |
| R-337 Back while exporting, toast on the current page | R-323 | TC-517 (system back only) → modified: ← as well |
| R-338 thumbnails switch the preview only | R-324 | TC-343 (no tap, no check of the saved file) → modified |
| R-339 export failure, controls restored, export again | R-325 | TC-518 (parked, no second export) → modified: Wi-Fi off mid-export, second export |
| R-340 iOS Photos access denied | n/a | n/a: the frame states it for iOS only and nothing for Android; Android 10 and later saves to the Gallery (MediaStore) with no permission prompt (test phone: Android 12) |
| R-051 storyboard leave: stage ① dialog, stage ② toast | R-051 (changed 10/27), R-318, R-321, R-322 | TC-061, TC-062, TC-398, TC-513 |
| R-052 reopen stops at the offer, Generate charges again (replaced) | R-052 (NOT TESTABLE: replaced by R-319 on 10/27) | none needed |
| R-071 video leave: toast in stage ② only | R-071 still said any video leave → changed; R-318 | TC-082, TC-400 (stage ②), TC-515, TC-516 (stage ①); TC-083 still "during video generation" → modified |
| R-158 storyboard update in chat follows the stages | R-158 (changed 10/27), R-318, R-321 | TC-294 (stage ①); stage ② none → TC-537 new |
| R-249 export state in the preview | R-249 (changed 10/27), R-324 | TC-343 |
| R-262 storyboard exits follow the stages | R-262 (changed 10/27), R-318, R-321 | TC-359 (stage ①); stage ② only Back (TC-513) → TC-535 new |
| R-264 video exits: stage ① dialog, stage ② no dialog | R-264 still said no dialog → changed; R-318 | TC-516 (stage ①), TC-361 (stage ②) |

| Requirement | Change | Before | After |
|---|---|---|---|
| R-071 | changed | leaving during video generation: toast only | the toast-only leave is stage ② only; stage ① asks 「Leave while we're preparing?」 (R-318) |
| R-264 | changed | every exit during video generation: no dialog | no dialog in stage ② only; stage ① dialog with the video body (R-318) |
| R-308 | changed | system back during video generation: toast only | stage ② only; stage ① asks (R-318) |
| R-138 | changed | stopping any running stage explains the loss | holds for the jobs that keep a Stop; the four Generate jobs have none (R-315) |
| Q-A7 | new | — | which jobs the frame does not name follow the no-Stop rule (outline, chat revision, scene-image regeneration, stage ① title of an update in chat, video regeneration stage ①); iOS Q-22 |
| Q-A8 | new | — | user bubble after Generate (frame) vs none (R-279); iOS Q-23 |
| Q-A9 | new | — | export going on after leaving the result page (RD); iOS Q-21 |

No new requirement IDs (highest stays R-356). Grids updated: Job states (Storyboard, Chat image update, Scene video,
Video regeneration, Full video, Download / export), Exit × stage (storyboard stage ② row filled; new rows 「Chat
storyboard update, stage ②」 and 「Exporting Full Video (result page)」), Hidden clauses (R-319, R-321, R-324), Variants
(R-315 × 4, R-319 × 4, R-321 × 3), Request ledger coverage (REQ-052 line, for Sections B / C to extend). New heading
「Added 2026-10-29 — PM 10/22 frames, iOS parity (REQ-052)」 holds the R-340 n/a reasoning and Q-A7 – Q-A9.

### Section B — PM / MX flow arrows (REQ-052)
New section 「Added 2026-10-29 — PM / MX Figma arrows (REQ-052)」: R-357 – R-471, one per arrow that is a flow (115 of 121),
carried from iOS R-341 – R-455 in the same order (iOS Q-24 – Q-27 → Q-A10 – Q-A13). Every rule the iOS line cites was
matched to its Android requirement (shared below R-306; iOS R-306 – R-331 → Android R-326 – R-351, iOS R-333 / R-334 →
R-316 / R-317 with R-320) and every row read on Android.

| Requirement | Change | Before | After |
|---|---|---|---|
| R-357 – R-373 | new | — | 17 PM / MX arrows no row walked (iOS R-341 – R-357); 16 checked on the screen and setup of an existing Android row, so that row was modified and cites it; R-367 n/a |
| R-374 – R-471 | new | — | 98 PM / MX arrows walked by existing rows (`Walked by: TC-…`); R-389, R-392, R-393 n/a |
| R-367, R-389, R-392, R-393 | new, NOT TESTABLE | — | the MX 「pro user」 arrows (1224-10503, 1034-39559, 1034-40514, 1224-10502): iOS's 30-chat Pro tier, whose Free-type dialog leads to the Pro+ page (R-277); Android's paid tier PowerDirector Pro gets 「Today's AI Chats Are Used Up」 (R-103) and has no mid tier (Q-A2) |
| Q-A10 – Q-A13 | new | — | iOS Q-24 – Q-27, all of which apply to Android: see Questions for PM |
| Request ledger coverage | changed | REQ-052: Section A only | adds R-357 – R-471 and Q-A10 – Q-A13 |

Android rows that differ from the iOS rows the lines cite: iOS TC-397 → Android TC-523 (regenerated scene detail), iOS
TC-406 → TC-405 (video stage ① skeleton, charge at stage ②), iOS TC-407 → TC-515 (video stage ① Back, Stay); iOS TC-216
(Pro tier) has no Android row. Where Android has a system Back row for the same exit the line names it too (R-409 →
TC-400, R-433 → TC-516, R-434 → TC-398; subscription page → TC-215). arrows.json was not edited (`expected` already filled).

### Section C — PM / MX controls (REQ-052)
New section 「Added 2026-10-29 — PM / MX controls (REQ-052)」 → 「### Controls (REQ-052)」: the rules a PM or MX frame states
that no requirement had, carried from iOS R-456 – R-462 in the same order (iOS Q-28 – Q-31 → Q-A14 – Q-A17), adapted to
Android (Google Play billing sheet, PowerDirector Pro with no 30-chat mid tier, system Back, R-352).

| Requirement | Change | Before | After |
|---|---|---|---|
| R-472 | new | — | PM feature intro (Demo page): 「Try It Now」 → landing, ‹ / system back → Launcher, volume icon, 「Don't show again」 (PM-only, Q-A15; iOS R-456) |
| R-473 | new | — | MX subscription page: plan tabs as drawn (「Pro」 / 「Pro+」; Android records its own, Q-A2), Monthly / Yearly cards, footer links, main button (「Get 7-Day Free Trial」 without a subscription) → Google Play billing sheet (iOS R-457) |
| R-474 | new | — | PM Storyboard Preview card 「Create video」 → bubble and video settings card (PM-only, Q-A16; iOS R-458) |
| R-475 | new | — | Send Feedback tabs, fields, add-image tile, 「Privacy Policy」, 「Submit」 dimmed while a required field is empty, ‹ / system back (iOS R-459) |
| R-476 | new | — | character generating: the 「generating...」 button is dimmed and does nothing (iOS R-460) |
| R-477 | new | — | scene-video editor: the description's expand icon opens the full-screen editor (iOS R-461) |
| R-478 | new | — | result page: ▶ on a paused preview resumes playback (iOS R-462) |
| Q-A14 – Q-A17 | new | — | iOS Q-28 – Q-31: see Questions for PM |
| Request ledger coverage | changed | REQ-052: Sections A / B; REQ-050: 146 groups | REQ-052 adds R-472 – R-478, Q-A14 – Q-A17 and the full control trace; REQ-050 notes the 217 PM / MX groups |

Grids: Hidden clauses + R-475 (a dimmed 「Submit」 sends nothing → TC-543); Variants + R-473 × no subscription (TC-542) /
PowerDirector Pro (n/a: not sent to the page, no 30-chat tier) / Pro+ (n/a). iOS-only rule not carried: none (every iOS
Section C rule applies to Android; the iOS Pro user's 「Continue」 page is the n/a variant).

## Case changes

### Section A — PM 10/22 frames
- New (7), each right after the row it extends:
  - TC-534 (R-319) storyboard stage ①, app swiped away → restarts by itself, one charge — after TC-063
  - TC-535 (R-321, R-262) storyboard stage ②: system back, History, credit pill, New chat → no dialog, toast — after TC-513
  - TC-536 (R-315) storyboard update in chat: only the mic, no ■ — after TC-073
  - TC-537 (R-158, R-321) storyboard update in chat, stage ②, Back → toast, update arrives — after TC-294
  - TC-538 (R-319) video stage ①, app sent to the background → restarts by itself, one charge — after TC-516
  - TC-539 (R-321) video stage ②, app swiped away → video finished on return, one charge — after TC-361
  - TC-540 (R-315) video regeneration: only the mic, no ■ — after TC-144
- Modified (5):
  - TC-157 (R-315): no ■ stop in the chat through both video stages (was: press Stop, R-138)
  - TC-083 (R-071): the first leave is in stage ② (「Making your video…」)
  - TC-343 (R-324): taps a scene thumbnail during the export; the Gallery file is the whole drama
  - TC-517 (R-323): leaves by ← (toast on the chat) and, on a second export, by system back to the landing page
  - TC-518 (R-325): failure reached with Wi-Fi off mid-export (USB confirmed, Wi-Fi restored), then a second export
    saves. Still listed as `fault-injection` in phases.json `needs`: the phase wrap-up should un-park it if the
    Wi-Fi failure works, else it stays parked (a local flatten may not need the network)
- Removed (1): TC-156 — pressed the storyboard ■ Stop that R-315 withdraws; TC-512 already checks the no-Stop rule on
  the same screen (iOS modified its TC-156 into that check instead, since iOS had no TC-512).
- Kept as they are: TC-153 (outline Stop), TC-154 (character Stop), TC-155 (chat revision Stop) — jobs the frame does
  not name (Q-A7, Q-A3); TC-470 (input during a storyboard job: never turns into Stop) agrees with R-315.
- Unchanged: 480

### Section B — PM / MX flow arrows
- New: none (no arrow needed a new screen or setup).
- Modified (9), each now pressing what its arrow draws (REQ-033, same screen and setup), as iOS modified the same rows:
  - TC-093 (R-357 – R-360): tap the video card in the chat → result page on the failed scene with its Retry / Edit card (was: look at the failed clip)
  - TC-096 (R-361, R-362): also tap 「Export Full Video」 while the scene regenerates; no export (no export sheet, nothing in the Gallery), a toast explains it (copy recorded, Q-A10)
  - TC-221 (R-363): template chat at the limit: close the dialog with ⓧ, the template chat stays with nothing sent
  - TC-117 (R-364 – R-366): Free limit dialog 「Upgrade to Premium」 → subscription page (plans recorded, Q-A2), then ‹ back to the chat without subscribing (system back stays on TC-215)
  - TC-226 (R-368, R-369): Free not-enough card → subscription page, ‹ back to the same not-enough card, then the system back check it already had
  - TC-052 (R-370), TC-053 (R-371), TC-054 (R-372): 「Use another photo」 on the multi-person, no-person and public-figure dialogs opens Add Media (Select Media)
  - TC-058 (R-373): 「Cancel」 on 「Delete this character?」 keeps the character, then the system back check it already had
- Not carried: iOS TC-216 (Pro tier → Pro+ subscription page, iOS R-351): no Android row or tier (R-367 n/a).
- Removed: none. Unchanged after Section B: 471

### Section C — PM / MX controls (REQ-052)
Control trace (`control-trace.json`): 363 groups (146 Design + 217 new with the PM / MX merge: 216 PM / MX and K-cb95d9, the
Design manual add 「AI Mini Drama with Seedance 2.0」). Re-run after Section B: 128 untraced (127 PM / MX + K-cb95d9) and 89
automatic hints (36 arrow, 53 label); 3 inputs with no dismiss.
- The 128 untraced groups → 101 pressed (79 by existing Android rows as they are, 22 by the new or modified rows below), 27
  n/a. Each takes the Android row that does the iOS v9 press, read on Android: same ID where the iOS row is ≤ TC-392 and its
  text matches; iOS TC-394 / 395 / 396 / 399 / 400 / 406 / 407 / 414 → Android TC-519 / 521 / 522 / 524 / 525 / 405 / 515 / 343;
  iOS TC-191 (mic ticket replay) → TC-524; iOS TC-418 / 419 / 420 → new TC-541 / 542 / 543; iOS TC-216 (Pro tier) dropped.
- The 89 automatic traces were checked: 43 correct, 46 corrected — 28 named no row that presses the control (e.g. the
  language and caption chips → template journey rows instead of TC-021; 「Continue」 → TC-414 / TC-416 instead of TC-022;
  Credit Panel 「Buy Credit」 → TC-227 / TC-228; 「Delete」 → TC-058 / TC-532 / TC-404 instead of TC-111; 「Submit」 → TC-338's
  「do not submit」; 「Close」 on the timeout dialog → TC-067 …; rename field 「Forbidden Office Romance」 → TC-237's template;
  「Leave anyway」 on the 10/22 dialog → outline 「Leave this chat?」 rows instead of TC-063 / TC-399 / TC-515; 「Leave anyway」 /
  「Keep Generating」 → TC-378 / TC-333 / TC-403), 18 trimmed or completed to the rows that really press it. Two label hints the
  new rows created on re-run were set back: Credit Panel 「Privacy Policy」 / 「Terms of Use」 (C-422e57) stays TC-225, not
  TC-543's Send Feedback link; the 4xx dialog's 「Terms of Service」 (K-bcb853) stays TC-067, not TC-542's footer.
- Why Android started with 14 more untraced groups than iOS's 135: the first run (before Section B) had no `flow arrow …`
  lines for the PM / MX arrows, so only 68 hints filled against iOS's 81 (13 more PM / MX groups untraced), plus K-cb95d9,
  which iOS v9 already traced (TC-002) and Android had not; after Section B the re-run filled 21 more hints (149 → 128). K-cb95d9
  → TC-002 (Android reads the banner and taps it).
- Inputs: K-c3da0d (scene description) dismissed by TC-070 (Done), K-7ad090 (Age) by TC-127 (✓ / Done closes the keypad),
  K-1763eb (rename field) by TC-110 (OK closes the dialog); the 10 PM / MX inputs filled in this section are dismissed by
  TC-018, TC-148 / TC-070, TC-124 / TC-287, TC-110, TC-543, and the Age range slider (K-94a3ff) is n/a (no keyboard).
- New (3), each right after the row it extends:
  - TC-541 (R-472) PM feature intro: volume icon, ‹, system back, 「Don't show again」, 「Try It Now」 — after TC-001
  - TC-542 (R-473, R-366) subscription page (free user): plan tabs, Monthly / Yearly, 「Terms of Service」, main button +
    close the Google Play sheet with system back, ‹; opened from the limit dialog or, when the limit cannot be reached,
    My Credits › 「Subscribe Now」 — after TC-117
  - TC-543 (R-475, R-352) Send Feedback: tabs, a field edit, 「Submit」 dimmed with the e-mail cleared, add-image tile,
    「Privacy Policy」, ‹; opened from the timeout dialog or, without a slow-generation fixture, ⋯ › 「Report」 — after TC-336
- Modified (8):
  - TC-225 (R-342): also taps the panel's 「Buy Credit」 and closes the Google Play sheet with system back (never buys); the
    precondition's 「Pro or Pro」 now reads 「Pro」
  - TC-079 (R-474): taps 「Create video」 on the Storyboard Preview card before reading the video settings card
  - TC-147 (R-477): opens the scene-video description with the expand icon, then collapses it
  - TC-375 (R-478): after the pause, ▶ resumes playback
  - TC-069 (R-381): taps the ⟳ on the failed scene's thumbnail (the PM arrow's start)
  - TC-348 (R-446): taps a character chip (its Expected Result already checked the chip)
  - TC-111 (R-096): deletes a throwaway drama made for the case after the Cancel check
  - TC-332 (R-476): taps the dimmed 「generating...」 button
- Not carried: iOS TC-216's 「Continue」 on the Pro user's subscription page (no Android tier is sent there). The groups that
  hold it also hold a control Android reaches: K-6c0fc1 「Continue」 → the format card's TC-022; K-67bd14 ‹ → TC-117, TC-542,
  TC-226. No group is iOS-only as a whole, so no Android-only n/a was needed.
- n/a (27), the iOS reasons, which hold on Android: 14 Launcher controls of other PowerDirector features (as the Design
  groups, requirements.md Controls (REQ-039) Not in scope); 8 controls of the MX mockups' older chat (「Ready to create」,
  「Don't ask again」, the composer's add-image button and icon, aspect-ratio chips, 「Customize my characters (optional)」,
  the Characters Result edit icon, 「Tell AI what to change…」; Q-A17) — plus 「Confirm」 on the 「Consume credits?」 card among
  the corrected traces; 3 template covers inside the user's message bubble (as Design K-cf4f2e); 1 selected-state cast tab
  (K-2509de, the same control as K-951b92); 1 PM-only ⋯ on the regenerated scene image (Q-A14).
- Removed: none. Unchanged after Section C: 463

## Found by the analysis
- Section A, PM 10/22 frames (iOS parity): every iOS rule of frames 4422:2 / 4418:2 matched to Android R-315 – R-325; changed
  R-071, R-138, R-264, R-308; 7 rows the stages and export states needed (TC-534 – TC-540), TC-156 removed (its Stop is
  withdrawn, TC-512 already checks the no-Stop rule). iOS R-340 (Photos access) has no Android counterpart.
- Section B, PM / MX flow arrows (REQ-052): 121 arrows → 115 flows as R-357 – R-471 (iOS R-341 – R-455 one to one), 6 not
  flows; 17 needed a row → 9 Android rows modified, R-367 / R-389 / R-392 / R-393 n/a (the iOS 30-chat Pro tier).
- Section C, PM / MX control trace (REQ-052, REQ-050): R-472 – R-478 found by pressing what the PM / MX frames draw (the
  feature intro, the subscription page, the preview card's 「Create video」, Send Feedback, the disabled 「generating...」, the
  scene-video expand icon and the result page's ▶). Automatic hints that only quoted a label: 46 corrected (see Case
  changes). Android-specific: no group is iOS-only as a whole; the iOS Pro user's subscription page is reached by no Android
  tier (Variants n/a), and the rows that need an unreachable state on Android open the same page another way (TC-542 from My
  Credits, TC-543 from 「Report」).
- Pass 9 hidden clauses: R-475 (a dimmed 「Submit」 sends nothing → TC-543). Pass 10 variants: R-473 × no subscription
  (TC-542) / PowerDirector Pro (n/a) / Pro+ (n/a).
- 「Inventory fixes (REQ-053, applied 2026-10-29)」 (shared `inventory-overrides.json`, one fix for both platforms; the iOS
  draft 20261029-085112 Section C lists the same ones). `scripts/inventory.ts` gained two override kinds, documented above
  `const ovPath` and in SKILL.md step 10: `kind` (set after the group ids are computed, so no id moves) and `merge` (the
  listed groups take the `into` id, so the trace entry keyed on it keeps applying). Entries, each with a `why`:
  - `drop` 15 controls (the four groups mapped to control ids): K-b417af (✦ in the chat's 「Edit」, 1), K-b2c3ec (↻ in
    「Retry」, 3), K-30e8d7 (→ in the character chips, 2), K-cd81a2 (› of 「View more ›」 / 「More ›」, 9). No arrow started on them.
  - `merge`: K-2509de + K-c9e4c6 → K-951b92 (one cast-tab group, traced by TC-120); C-c23065 → K-8618a7 with `set: false`
    (the hand-added composer mics were a 「choice of 12」 only because each add lists the same 12 screens); K-5138c4 → K-87581d
    (the PM credit pill joins the Design one).
  - `kind`: K-94a3ff 「Age range」 input → toggle (a two-handle slider); K-89330d 「0-100」 item → input (the Age field).
  - Character Library 2340:29585 (pm-main-flow-33): no boxes added. The sheet image shows the Make your character sheet
    covering the whole library under a dimmed scrim (only the dimmed top bar shows above it), so the cards are not visible
    or tappable there; the review (pm-main-b) already hides them on that screen (24 `hide` entries: grid, top X / ✓, filter
    chips), as the brief's covered-by-a-dimmed-sheet rule asks. The cards stay boxed on the library screens without the sheet.
  - Rebuilt with `node scripts/inventory.ts ai-mini-drama 2026-10-21-2` (the three spec PDFs linked in from the main
    checkout, links removed after). inventory.json: screens, arrows and source groups unchanged; controls 1,971 → 1,956
    (the 15 drops); 30 controls changed group, 12 lost `set` (the mic), 2 changed kind; **groups 363 → 355** (iOS 363 → 355,
    Android 363 → 355). The Design file's PDF offset (`files.dZk5HL….pdf`, missing from the last worktree build) is back.
  - Control trace, Android draft: the 8 old groups' entries are gone (K-b417af TC-376, K-b2c3ec TC-092, K-30e8d7 TC-348,
    K-cd81a2 TC-065 / TC-006, C-c23065 TC-524, K-5138c4 TC-357, K-c9e4c6 TC-120, K-2509de n/a); their rows still press the
    groups they merged into or the button holding the icon. K-89330d now an input, dismissed by TC-127 (✓ closes the keypad;
    system Back closes only the keypad); K-94a3ff a toggle (TC-371). No new group, nothing else changed: 355 traced, 47 n/a.
  - Control trace, iOS v9 (`library/ai-mini-drama/ios/control-trace.json`, cases.csv untouched): the same 8 entries gone
    (C-c23065 was TC-399), K-89330d dismissed by TC-127, K-94a3ff a toggle; the re-run's automatic hints also added TC-419 to
    K-67bd14 (arrow) and K-bcb853 (label) and TC-420 to C-422e57 (label), rows saved into v9. 355 traced, 47 n/a.
- Annotation trace: carried over unchanged (same spec boards).

## Not added (value check)
- iOS TC-216 (Pro tier → Pro+ subscription page, 「Continue」): no Android tier is sent to that page (R-367, R-473 variants n/a).
- iOS TC-417 (Photos access denied on export): iOS-only rule (Section A).
- A separate Android row for the MX Pro user's 「Continue」: merge — the group's other instance (format card 「Continue」) is
  pressed by TC-022.

## PM-only rows
- Section A: TC-534 – TC-540 and the changed TC-157, TC-083, TC-343, TC-517, TC-518 (PM Figma 10/22, 4422:2 / 4418:2): no
  Design frame yet; the Design 1016 frames (older) draw other dialogs, the newer PM frame wins.
- Section B: TC-052, TC-053, TC-054 (「Use another photo」 → Add Media) and TC-058 (「Cancel」 on 「Delete this character?」), PM
  main flow: no Design frame yet (Notes say so).
- Section C: TC-541 (PM main flow 2283:10856 feature intro), TC-543 (PM Send Feedback 2613:28618 / 4012:23497) and the
  「Create video」 step of TC-079 (PM 2186:7485): no Design frame yet (Notes say so).

## Run setup (phases.json)
- Round A3 never ran (no run folder), so it now carries `"merged_into": "A4"` and the new round **A4** (`"round": true`,
  `current`: A4, `draft`: 20261029-093927) lists its 63 rows together with the 32 rows this draft adds (10) or changes (22),
  92 rows in all (TC-058, TC-225, TC-226 are in both), each in the stage segment of the row it extends (REQ-033), table
  order inside a segment: A4-a 10, A4-b 10, A4-c 21, A4-d 14, A4-e 5, A4-f 8, A4-g 18 (after the video gate), A4-h 1, A4-i 3,
  A4-j 2. `origin`: A3 for the round-3 rows, A4 for the rows new in this draft, A1 / A2 for a changed row's last round.
  TC-156 (removed) is in no A4 segment; A1 / A2 keep their results for the unchanged rows.
- TC-518 (decided here, noted in Section A): un-parked. Its `needs` is now `video` instead of `fault-injection`: it reaches
  the export failure with Wi-Fi off, which the run may do once the phone is confirmed on USB (AGENTS.md, Wi-Fi during runs).
  If the export still saves offline (a local flatten), the row is recorded Blocked (observability: no fault switch on
  Android 16.8), as its Notes say.
- New `needs`: TC-538, TC-539, TC-540 `video` (video stages and regeneration). TC-541 – TC-543 need none (TC-542 and TC-543
  name a reachable way in); TC-225 keeps `low-balance`, `paid-tier`. `unavailable` unchanged.

## Questions for PM
- Q-A7 (PM) Which jobs the 10/22 frame does not name follow the no-Stop / two-stage rule (outline, chat revision,
  scene-image regeneration, stage ① title of an update in chat, video regeneration stage ①)? (iOS Q-22)
- Q-A8 (PM) User bubble after Generate (frame) vs none (R-279)? (iOS Q-23)
- Q-A9 (RD) Can Export Full Video go on after leaving the result page? (iOS Q-21) The two-stage rules themselves still wait
  for RD (PM Open questions #20), as noted on every row since 10/27.
- Q-A10 (PM) The toast text when 「Export Full Video」 is tapped while a scene regenerates (TC-096 records it). (iOS Q-24)
- Q-A11 (PM / MX) A Free user's not-enough card: 「Buy Credits」 (frame) or 「Upgrade Now」 (note)? (iOS Q-25)
- Q-A12 (PM / MX) The paid-tier limit dialog button: MX 「Try Again Later」 or Design 「Continue Tomorrow」? (iOS Q-26)
- Q-A13 (PM) Does the second scene-video failure carry the refund line and ⓘ (PM) or the Design's 「Retrying didn't work」? (iOS Q-27)
- Q-A14 (PM) The ⋯ on the regenerated scene image: is there a menu, and what does it offer? (control K-0b6874 n/a until then;
  iOS Q-28)
- Q-A15 (PM) Is the feature intro (「Don't show again」, 「Try It Now」) shown before the landing on Android? TC-541 follows the
  PM. (iOS Q-29)
- Q-A16 (PM) Does the Storyboard Preview card have 「Create video」, or does the video settings card follow the storyboard by
  itself (Design, R-424)? TC-079 taps it when shown. (iOS Q-30)
- Q-A17 (PM / MX) The MX mockups' older chat (「Consume credits?」 with 「Don't ask again」 / 「Confirm」, 「Ready to create」, a
  composer add-image button, aspect-ratio chips, 「Customize my characters (optional)」, a Characters Result edit icon, 「Tell
  AI what to change…」): illustrations only? Their controls are n/a in the control trace. (iOS Q-31)
- Still open from earlier drafts: Q-A1 – Q-A3, Q-A5, Q-A6 (requirements.md).

## Questions for you
Answered by the user on 2026-10-29 (REQ-053):
- A3 never ran, so this draft merges it into round A4 (63 + 32 changed rows, 92 in all) — **yes**: run A4 as the next round.
- TC-542 and TC-543 name a second way in (My Credits › 「Subscribe Now」; a character's ⋯ › 「Report」) while the daily limit
  and the 5-minute timeout cannot be reached on Android 16.8 — **keep it**; the limit will be back to normal eventually, and
  the way in through the limit dialog / timeout dialog (the first path each row names) is tested once it is.
- TC-518 un-parked (Wi-Fi off mid-export during the run) — **yes**, keep it un-parked.
- TC-225: the precondition 「Tier Pro or Pro」 (left over from removing Pro+) now reads 「Tier Pro」, matching the TC-118
  wording you kept on 2026-10-28.
- The inventory fixes listed under Found by the analysis touch the shared inventory (both platforms) — **now**: applied in
  this draft (see 「Inventory fixes (REQ-053)」 under Found by the analysis).

## Checks before handing over
- `node scripts/check.ts ai-mini-drama android --draft 20261029-093927`: 0 errors, 0 warnings.
- `node scripts/controls.ts ai-mini-drama android --draft 20261029-093927`: 355 groups after the REQ-053 inventory fixes
  (363 before), 355 traced (31 arrow and 10 label hints confirmed, 47 n/a), 0 untraced, 0 inputs without dismiss; a re-run
  keeps every entry.
- iOS v9 after the inventory fixes: `node scripts/controls.ts ai-mini-drama ios` 355 groups traced, 0 inputs without
  dismiss; `node scripts/check.ts ai-mini-drama ios` 0 errors, 0 warnings.
- Every new requirement R-472 – R-478 is cited by a row's Spec Ref; Hidden clauses (R-475) and Variants (R-473) grids
  updated; the request ledger cites R-472 – R-478 and Q-A14 – Q-A17 under REQ-052.
- No approved row silently disappears: the only removal is TC-156 (marked `removed`). New rows sit right after the row they
  extend; changed rows carry `modified` and a Change Reason naming the requirement.
- Run order: phases.json round A4 lists every new and changed row in its stage segment (`"round": true`, REQ-033), A3 merged
  into it; every A4 case is an active row of draft.csv.
- Final counts: 496 rows (495 active): unchanged 463, modified 22, new 10, removed 1.

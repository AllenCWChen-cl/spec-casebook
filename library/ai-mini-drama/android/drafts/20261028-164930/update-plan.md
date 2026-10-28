# Update plan — ai-mini-drama / android: approved v2 → draft 20261028-164930

Built by `build-draft.ts` in this folder (re-runnable; it also runs `scripts/controls.ts` and fills the control trace).
Worked example: the iOS draft `ios/drafts/20261028-121259` (same update on iOS); its decisions are mirrored on the same
Android rows (the Android table keeps the iOS IDs below TC-394).

**Extended 2026-10-28 with two user decisions (REQ-050, REQ-051).** The first version of this draft (478 rows) was saved as
v3 at 17:10; the builder now starts from v2 in `history/` so a re-save on the review page replaces v3 (same draft, same
version number). Change marks stay v2 → draft.

## Spec files
- Unchanged: the spec set specs/2026-10-21-2 (Design, MX, PM Spec 20261021); no new files.
- New inputs on the same set (upstream ab68e97 … 526191d): the Figma inventory `extracted/inventory.json` (REQ-038 / REQ-040),
  12 inventory arrows in `extracted/arrows.json`, and the request ledger entry REQ-039 (table, both): every tappable element
  is pressed, inputs are dismissed.
- REQ-050 (answers Q-A4): `scripts/inventory.ts` counts the Design's iPhone frames for Android too; `inventory.json` was rebuilt
  and Android now has the same 146 control groups as iOS (was 21). No screen of this set is Apple-only, so
  `inventory-overrides.json` gets no `ios_only_screens` entry.
- REQ-051 (table, android): system Back on every page, sheet, dialog, popup, picker, editor and viewer (skill pass 8
  「Android system Back」).

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-326 | new | — | Flow arrow 4299-168964: scene image regenerating → scene detail with the new Location and scene images, error card gone (iOS R-306) |
| R-327 | new | — | Flow arrow 4877-33081: leave dialog opened by History, 「Leave anyway」 → Recent Task (iOS R-307) |
| R-328 | new | — | Flow arrow 4877-33083: leave dialog opened by New chat, 「Leave anyway」 → new empty chat (iOS R-308) |
| R-329 | new | — | Flow arrow 4877-33087: leave dialog opened by Back, 「Leave anyway」 → AI Mini Drama home page (iOS R-309) |
| R-330 – R-337 | new | — | Flow arrows 4299-132149, 4299-168955, 4877-33073 / -33075 / -33077 / -33079 / -33085 / -33089, walked by TC-067, TC-070, TC-025, TC-357, TC-357, TC-026, TC-358, TC-027 / TC-357 (iOS R-310 – R-317; R-332 and R-336 add Android's system back, R-306) |
| R-338 – R-351 | new | — | Controls with no rule yet (iOS R-318 – R-331): More ideas +, template ▶ / volume, Continue Tomorrow, My Credits buttons, credit packs and links, Age keypad, filter chip × and check icon, enlarged preview ⓧ / ⋯ / Download / Report, ⟳ switch icon, Select Media controls, Storyboard Preview player, main scene image, History 「New Chat」, composer mic. Android wording: system back where a page is left, 「Choose Character」 picker title, Gallery, Android mic permission |
| R-352 | new | — | System Back on a page or full-screen viewer does what its ← / ‹ / X does (landing → Launcher, More, Template detail, scene detail, players, result page, Fix scenes, Full Edit, History, My Credits, feedback / purchase / subscription pages) (REQ-051) |
| R-353 | new | — | System Back on a sheet, picker or editor does what its X / Cancel / ‹ / collapse does; where X asks first, the same dialog; a layer inside a sheet closes alone (REQ-051) |
| R-354 | new | — | With the keyboard or Age keypad open, the first system Back closes only it (REQ-051) |
| R-355 | new | — | System Back on a dialog, menu or popup = its non-destructive answer, never the destructive one (REQ-051, Q-A5) |
| R-356 | new | — | Where the spec draws no close control or Back rule, the row records what system Back does (REQ-051, Q-A6) |
| `### System back` | new | — | 72 screens: 62 name the rows that press system Back there, 10 n/a with the reason |
| Controls (REQ-039) note | changed | iPhone-frame groups not in the Android trace (Q-A4) | the trace lists all 146 groups (REQ-050); the iOS 「Not in scope」 note on the Launcher's other tools is added |
| Q-19 | new | — | What a tap on 「More ideas +」 shows (shared with iOS Q-19) |
| Q-A4 | new, answered | — | Count the iPhone frames for Android? Answered yes (REQ-050) |
| Q-A5, Q-A6 | new | — | System Back on dialogs / keyboards (no spec rule); screens with no close control or Back rule |
| Exit × stage, Outline generating | changed | — | Back + TC-519, History + TC-521, New chat + TC-522 |
| Request ledger coverage | changed | REQ-039, REQ-040, REQ-049 – REQ-051 not listed | REQ-039, REQ-040, REQ-049 as before; REQ-050 → control-trace.json (146 groups); REQ-051 → R-352 – R-356, `### System back`, Q-A5, Q-A6 |

## Case changes
- New (15), each right after the row it extends:
  - TC-524 (R-011, R-351) tap the mic without speaking and stop it — after TC-011
  - TC-519 (R-329) Back → 「Leave anyway」 opens the AI Mini Drama home page — after TC-028
  - TC-520 (R-341) My Credits: 「Buy More」, 「Subscribe Now」 (no purchase), 「Claim」, left with system back — after TC-358
  - TC-521 (R-327) History → 「Leave anyway」 opens Recent Task — after TC-520
  - TC-522 (R-328) New chat → 「Leave anyway」 opens a new empty chat — after TC-521
  - TC-523 (R-326) both regenerated images replace the skeletons and the error card — after TC-071 (needs a both-images failure: fault-injection)
  - TC-525 (R-347, R-353) Select Media controls, each layer closed with system back — after TC-128 (TC-129 then picks the photo)
  - TC-526 (R-032, R-353, R-355) Choose Character: system back with an unsaved pick, on 「Leave without finishing?」, on the Filter panel, and with nothing changed — after TC-038
  - TC-527 (R-106, R-353) Finish your characters with 「Your characters are ready」: system back = X — after TC-121 (a second Generate all)
  - TC-528 (R-108, R-354) full-screen description editor: keyboard first, then like collapse — after TC-124
  - TC-529 (R-114, R-353) Crop: system back = X, the new photo not applied — after TC-131
  - TC-530 (R-125, R-354) scene description editor: keyboard first, then like collapse — after TC-140
  - TC-531 (R-132, R-354) scene-video description editor: keyboard first, then like collapse — after TC-148
  - TC-532 (R-095, R-096, R-355) History ⋮ menu, 「Delete this drama?」 and Rename with system back — after TC-111
  - TC-533 (R-324, R-356) the export sheet / done page the Android build shows, left with system back — after TC-343
- Modified (48), the step added on the same screen (REQ-033):
  - REQ-039 (15): TC-008 ▶ and volume icon (R-339) · TC-019 「More ideas +」 (R-338) · TC-036 chip × and applied filter icon
    (R-344) · TC-041 「Confirm」 (R-222) · TC-066 main scene image (R-349) · TC-067 「terms of service」 (R-056) · TC-075 ⏸ / ▶ /
    scrubber, system back closes the player (R-348) · TC-106 History 「New Chat」 (R-350) · TC-118 「Continue Tomorrow」 (R-340)
    · TC-119 「My characters only」 before Clear (R-031) · TC-127 Age typed, ✓, filled field edited (R-343) · TC-135 ⋯ /
    Download / Report / ⓧ (R-345) · TC-138 scene thumbnail, then card text (R-123) · TC-225 credit pack and both links (R-342)
    · TC-310 picker opened through the ⟳ switch icon (R-346)
  - REQ-051 (33 more; TC-067, TC-118, TC-127, TC-135, TC-225 above also get the step): pages TC-001 landing, TC-006 More, TC-007
    Template detail, TC-065 scene detail, TC-088 Full Edit, TC-150 Fix scenes, TC-327 History and its ⓘ bubble, TC-336
    feedback form, TC-506 result page, TC-215 / TC-226 subscription page (TC-215 also presses 「Upgrade to Premium」, which
    only the iOS row TC-216 pressed) · sheets and editors TC-039 Finish your characters and its ⓘ tip, TC-056 empty Make your
    character, TC-128 Select Media, TC-412 permission notice (its 「Back」 named as system back) · keyboards TC-018 composer,
    TC-287 character description · dialogs TC-395 / TC-398 / TC-516 leave dialogs (→ Stay), TC-431 / TC-403 / TC-378 「Stop
    and lose your credits?」 (→ Keep Generating), TC-402 / TC-401 「Discard this character?」 (→ Keep editing / Keep), TC-058
    delete character (→ Cancel), TC-059 library menu, TC-384 「Couldn't create some images」, TC-335 timeout (→ Close),
    TC-220 daily limit (→ X), TC-112 delete dramas and Manage mode (→ Cancel), TC-304 notification pre-prompt (recorded)
- Removed: none · Unchanged: 423 · Total 486 rows

## Found by the analysis
- Coverage pass 1 (arrows): the 12 inventory arrows → R-326 – R-337; 4 new rows, 8 walked by existing rows.
- Coverage pass 11 (every control), after REQ-050: `controls.ts` lists 146 Android groups. The 21 traced before are kept;
  the 125 new ones take the Android row that does the iOS draft's press (identical rows below TC-394; iOS TC-394 – TC-400 =
  Android TC-519 – TC-525). Result: 126 pressed, 20 n/a (14 Launcher controls of other features, the › of 「More ›」, the
  decorative credit icon and red !, the template cover in a message bubble, the scene error card container, the failed-image
  duplicate), 0 untraced; the 7 inputs are dismissed (TC-018, TC-070, TC-124 / TC-287, TC-127). The iOS-only rows TC-180
  (Save to library → TC-133), TC-191 (mic → TC-524) and TC-216 (「Upgrade to Premium」 → TC-215, which now presses it) have
  no Android row. The 32 automatic label hints were not used: 10 were right, 9 added rows that only mention the label,
  13 named the wrong rows (e.g. language and caption chips → template journey rows, History 「New Chat」 → outline rows,
  Delete → TC-058 / TC-404).
- Coverage pass 8, 「Android system Back」 (REQ-051): `### System back` lists 72 screens from `inventory.json` screens and
  panels plus the PM pages. 62 name rows, 57 distinct: 11 already pressed system Back (TC-394, TC-396, TC-397, TC-399,
  TC-400, TC-452, TC-511, TC-075, TC-517, TC-520, TC-525), 38 got the step (33 newly modified, 5 already modified for
  REQ-039), 8 are new; 10 are
  n/a: the Launcher, the once-per-install or once-per-user hints and bubbles (TC-034 / TC-035, TC-083, TC-105 spend their one
  showing), the plural timeout dialog (same dialog as TC-335), Android's own permission dialogs, the video settings card
  (part of the chat), the task-completed toast, Full Edit's own export and Mine › Credits › Details.
- Annotation trace: carried over unchanged from 20261027-171228 (same spec boards).

## Not added (value check)
- iOS TC-191 / mic dictation with speech: Android has no such ticket row; TC-524 presses the mic without speech, dictation
  itself stays `voice` (unavailable).
- The Launcher's other tools: now in the Android trace (REQ-050) as n/a, out of scope as on iOS (requirements.md 「Not in
  scope」).
- System Back on the character-update stage in chat, the storyboard stage ② and the chat storyboard update: kept n/a in
  Exit × stage (same dialog or toast as the stage rows already pressing it).

## PM-only rows
- Unchanged.

## Run setup (phases.json)
- Round A3 (`"round": true`, current): only the 63 new and modified rows, in the journey stage of the row each extends:
  A3-a 9, A3-b 9, A3-c 16, A3-d 9, A3-e 4, A3-f 5, A3-g 7, A3-i 3, A3-j 1. A1 (merged into A2) and A2 are kept; their results
  stand for every unchanged row.
- Needs: TC-523 fault-injection (no Android fault switch yet, REQ-047); TC-531 and TC-533 inherit `video` from TC-148 /
  TC-343; TC-118 keeps paid-tier and fault-injection, TC-226 low-balance, TC-335 / TC-336 slow-generation, TC-384 and
  TC-362 fault-injection, TC-412 permission-reset, TC-304 its own fresh install; `unavailable` carried from A2.

## Questions for PM
- Q-19 What does a tap on 「More ideas +」 show? (TC-019 records what appears.)
- Q-A5 The spec states no system Back rule for dialogs, menus and keyboards; the rows expect the non-destructive answer
  (Stay, Keep Generating, Keep choosing, Keep editing, Keep, Cancel, Got it, Close, X, Continue Tomorrow) and the keyboard to
  close first. Confirm.
- Q-A6 What should system Back do on the History ⓘ bubble, the Finish your characters ⓘ tip, a typed but unconfirmed Age,
  the notification pre-prompt (count as 「Not now」?) and the export sheet / done page the Android build shows although PM
  10/22 draws none? Rows TC-327, TC-039, TC-127, TC-304, TC-533 record it.

## Questions for you
- TC-118 (decided 2026-10-28, user): keep the Precondition 「Pro account」 as it is (not changed to Pro+ / Android
  Premium).
- Q-A4 is answered (REQ-050): the Android trace now covers the 146 groups.

## Checks
- `node scripts/check.ts ai-mini-drama android --draft 20261028-164930`: 0 errors, 0 warnings.
- `node scripts/controls.ts ai-mini-drama android --draft 20261028-164930` (run by the builder): 146 groups, 0 untraced,
  0 inputs without dismiss.
- `node scripts/check.ts ai-mini-drama ios`: 0 errors, 0 warnings, the same result as with the inventory before the rebuild
  (iOS still 146 groups).

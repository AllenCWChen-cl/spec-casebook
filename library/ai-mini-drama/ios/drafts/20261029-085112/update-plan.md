# Update plan — ai-mini-drama / ios: approved v8 → draft 20261029-085112

## Spec files
- Unchanged: the same spec set (specs/2026-10-21-2: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama -
  PM Spec 20261021.pdf). New in this draft: the two PM Figma frames dated 10/22 the PM PDF lacks (4418:2, 4422:2;
  board-notes 「PM — Figma only, newer than the PM PDF」, read 2026-10-28 as qa1) and the PM / MX Figma inventory
  (REQ-052). No longer supplied: none.
- Section A (this part): the PM 10/22 frames. Later sections append the PM / MX flow arrows and the control trace.

- Section B: the 121 PM / MX Figma flow arrows of the inventory (REQ-052), read from their screen sheets and board transcriptions.

- Section C: the control trace of the PM / MX inventory groups (REQ-052, `control-trace.json`).

## Requirement changes
The 10/22 frames are newer than the 10/21 PM PDF and the Design frames, so they win where they differ (AGENTS.md).

| Requirement | Change | Before | After |
|---|---|---|---|
| R-051 | changed | storyboard leave asks 「Stop and lose your credits?」 (Leave anyway / Keep Generating) | phase ① 「Preparing your scenes...」 asks 「Leave while we're preparing?」 (storyboard body, Stay / Leave anyway); phase ② 「Creating your storyboard...」 leaves with the toast 「We'll keep making your storyboard. Find it in History.」 |
| R-052 | replaced | reopening after a storyboard leave stops at the offer; Generate charges again | phase ① restarts by itself with one charge (R-335); phase ② finishes in the background (R-336) |
| R-071 | changed | any video leave: toast only | phase ① asks 「Leave while we're preparing?」 (video body); the toast-only leave is phase ② only |
| R-158 | changed | storyboard update in chat: 「Stop and lose your credits?」 | follows the storyboard phases (phase ① dialog, phase ② toast) |
| R-249 | changed | Export Full Video: the button shows loading | spinner over the preview, play hidden and paused; Full Edit, Export Full Video and download disabled (40 %); all restored when done |
| R-262 | changed | storyboard, chat image update and character update: 「Stop and lose your credits?」 on every exit | character update keeps it; storyboard and storyboard update in chat follow the two phases on every exit |
| R-264 | changed | every exit during video generation: no dialog | phase ① dialog on every exit; no dialog in phase ② only |
| R-332 | new | — | no pause / stop in the chat after Generate (Create storyboard, Generate Video, storyboard update in chat, video regeneration): only the mic |
| R-333 | new | — | video phase ① skeleton 「Advancing the mini drama production.」, not charged; phase ② 「Making your video...」, charged |
| R-334 | new | — | storyboard phase ① skeleton 「Preparing your scenes...」, not charged; phase ② 「Creating your storyboard...」, charged |
| R-335 | new | — | Leave anyway / app swiped away / backgrounded in phase ① → back in the chat phase ① restarts by itself, one charge |
| R-336 | new | — | phase ② survives the app being swiped away; the result is there on return |
| R-337 | new | — | Back stays enabled while exporting; the export finishes in the background and 「Saved to Photos.」 shows on the current page |
| R-338 | new | — | scene thumbnails stay tappable while exporting and switch the preview only |
| R-339 | new | — | export failure: 「Couldn't save your video. Try again.」, controls restored, Export can be pressed again |
| R-340 | new | — | iOS Photos access denied on the first export: 「Allow Photos access in Settings to save your video.」, controls restored |
| Q-20 – Q-23 | new | — | see Questions for PM |

Grids updated: Job states (Storyboard, Chat image update, Scene video, Video regeneration, Full video, Download / export),
Exit × stage (storyboard, storyboard update in chat and video each split into phase ① and phase ②; new 「Exporting Full
Video」 row), Hidden clauses (R-051, R-071, R-333 – R-338), Variants (R-051 / R-071 dialog bodies, R-332 × 4, R-335 × 2,
R-336 × 2), Request ledger coverage (REQ-052).

### Section B — PM / MX flow arrows (REQ-052)
New section 「Added 2026-10-29 — PM / MX Figma arrows (REQ-052)」: R-341 – R-455, one per arrow that is a flow (115 of 121).

| Requirement | Change | Before | After |
|---|---|---|---|
| R-341 – R-357 | new | — | 17 PM / MX arrows no row walked; each was checked on the screen and setup of an existing row, so that row was modified and cites it |
| R-358 – R-455 | new | — | 98 PM / MX arrows walked by existing rows (`Walked by: TC-…`) |
| Q-24 – Q-27 | new | — | see Questions for PM |
| arrows.json | changed | 121 figma-inventory entries with an empty `expected` | `expected` filled for the 115 flows; `not_flow` with the reason on 6 |

### Section C — PM / MX controls (REQ-052)
New section 「Added 2026-10-29 — PM / MX controls (REQ-052)」 → 「### Controls (REQ-052)」: rules a PM or MX frame states that no requirement had.

| Requirement | Change | Before | After |
|---|---|---|---|
| R-456 | new | — | PM feature intro (Demo page): 「Try It Now」 → landing, ‹ → Launcher, volume icon, 「Don't show again」 (PM-only, Q-29) |
| R-457 | new | — | MX subscription page: Pro / Pro+ tabs, Monthly / Yearly cards, footer links, 「Get 7-Day Free Trial」 (no subscription) / 「Continue」 (Pro) → App Store sheet |
| R-458 | new | — | PM Storyboard Preview card 「Create video」 → bubble and video settings card (PM-only, Q-30) |
| R-459 | new | — | Send Feedback tabs, fields, add-image tile, 「Privacy Policy」, 「Submit」 dimmed while a required field is empty, ‹ |
| R-460 | new | — | character generating: the 「generating...」 button is dimmed and does nothing |
| R-461 | new | — | scene-video editor: the description's expand icon opens the full-screen editor |
| R-462 | new | — | result page: ▶ on a paused preview resumes playback |
| Q-28 – Q-31 | new | — | see Questions for PM |

Grids: Hidden clauses + R-459 (a dimmed 「Submit」 sends nothing → TC-420); Variants + R-457 × no subscription (TC-419) / Pro (TC-216) /
Pro+ (n/a: not sent to the page).

## Case changes
- New (17), each right after the row it extends:
  - TC-401 (R-051) storyboard phase ②, Back: no dialog, storyboard toast, keeps generating — after TC-359
  - TC-402 (R-262) storyboard phase ②, History / credit pill / New chat: no dialog, toast — after TC-401
  - TC-403 (R-335) storyboard phase ①, app swiped away → restarts by itself, one charge — after TC-063
  - TC-404 (R-336) storyboard phase ②, app swiped away → storyboard finished on return — after TC-403
  - TC-405 (R-332) storyboard update in chat: only the mic, no ■ — after TC-073
  - TC-406 (R-333) video phase cards and charge timing (pill unchanged in phase ①, drops at phase ②) — after TC-081
  - TC-407 (R-071) video phase ①, Back: 「Leave while we're preparing?」 (video body), Stay — after TC-406
  - TC-408 (R-264) video phase ①, History / New chat (Stay) and credit pill (Leave anyway → My Credits)
  - TC-409 (R-335) video phase ①, Leave anyway → reopen: restarts by itself, one charge
  - TC-410 (R-335) video phase ①, app sent to the background → restarts by itself, one charge
  - TC-411 (R-336) video phase ②, app swiped away → video finished on return — after TC-361
  - TC-412 (R-332) video regeneration: only the mic, no ■ — after TC-144
  - TC-413 (R-158) storyboard update in chat, phase ②, Back: toast, update finishes — after TC-294
  - TC-414 (R-338) thumbnail tap while exporting: preview switches, export still saves the whole drama — after TC-343
  - TC-415 (R-337) Back while exporting: 「Saved to Photos.」 on the chat page
  - TC-416 (R-339) export failure (Wi-Fi off mid-export): failure toast, controls restored, second export saves
  - TC-417 (R-340) Photos access denied on the first export: toast, controls restored
- Modified (12):
  - TC-377 (R-279, R-334): Generate on 「Create storyboard」 now checks the 「Preparing your scenes...」 skeleton and that the pill drops only at 「Creating your storyboard...」
  - TC-061 (R-051): phase ① Back expects 「Leave while we're preparing?」 (storyboard body), not 「Stop and lose your credits?」
  - TC-062 (R-051): 「Stay」 replaces 「Keep Generating」
  - TC-359 (R-262): phase ① History / New chat / credit pill expect the new dialog; Stay / Leave anyway
  - TC-063 (R-335; R-052 replaced): Leave anyway → reopen restarts the preparation by itself, one charge (was: stops at the offer, charges again)
  - TC-156 (R-332): no ■ stop in the chat during the storyboard (was: press Stop and read its notice, R-138)
  - TC-157 (R-332): no ■ stop in the chat during the video (was: press Stop, R-138)
  - TC-082 (R-071): precondition is phase ② (「Making your video...」)
  - TC-361 (R-264): precondition is phase ②
  - TC-083 (R-071): the first leave is in phase ②
  - TC-294 (R-158): phase ① of a storyboard update in chat expects 「Leave while we're preparing?」 (storyboard body)
  - TC-343 (R-249): checks the export state (spinner, play hidden, three controls disabled) before 「Saved to Photos.」
- Removed: none. Every row on a withdrawn rule (the storyboard and chat-update 「Stop and lose your credits?」, the ■ Stop
  presses) was checked on the same screen with the same setup as a 10/22 rule, so it was modified instead (REQ-033).
- Unchanged: 387

### Section B — PM / MX flow arrows
- New: none (no arrow needed a new screen or setup).
- Modified (10), each now pressing what its arrow draws (REQ-033, same screen and setup):
  - TC-093 (R-341 – R-344): tap the video card in the chat → result page on the failed scene with its Retry / Edit card (was: look at the failed clip)
  - TC-096 (R-345, R-346): also tap 「Export Full Video」 while the scene regenerates; no export starts and a toast explains it (copy recorded, Q-24)
  - TC-221 (R-347): template chat at the limit: close the dialog with ⓧ, the template chat stays with nothing sent
  - TC-117 (R-348 – R-350): Free limit dialog 「Upgrade to Premium」 → subscription page, then ‹ back to the chat without subscribing
  - TC-216 (R-351): Pro limit dialog → Pro+ subscription page, then ‹ back to the chat
  - TC-226 (R-352, R-353): Free not-enough card → subscription page, then ‹ back to the same not-enough card
  - TC-052 (R-354), TC-053 (R-355), TC-054 (R-356): 「Use another photo」 on the multi-person, no-person and public-figure dialogs opens Add Media
  - TC-058 (R-357): 「Cancel」 on 「Delete this character?」 keeps the character
- Removed: none. Unchanged after Section B: 377

### Section C — PM / MX controls (REQ-052)
Control trace: 363 groups, 216 PM / MX. The 135 untraced PM / MX groups → 108 pressed (86 by existing rows as they are, 22 by
the new or modified rows below), 27 n/a. The 81 automatic PM / MX traces (`how: arrow` / `label`) were checked: 54 correct, 27
corrected (17 named no row that presses the control, e.g. 「Terms of Service」 → TC-067's 4xx-dialog link, 「Submit」 → TC-338's
「do not submit」, 「Forbidden Office Romance」 rename field → TC-237's template; 10 trimmed to the rows that really press it). Inputs
K-7ad090 (Age) dismissed by TC-127 (✓ closes the keypad) and K-1763eb (rename field) by TC-110 (OK closes the dialog).
- New (3), each right after the row it extends:
  - TC-418 (R-456) PM feature intro: volume icon, ‹, 「Don't show again」, 「Try It Now」 — after TC-001
  - TC-419 (R-457, R-350) subscription page (free user): Pro / Pro+ tabs, Monthly / Yearly, 「Terms of Service」, 「Get 7-Day Free Trial」 + cancel the App Store sheet, ‹ — after TC-117
  - TC-420 (R-459) Send Feedback: tabs, a field edit, 「Submit」 dimmed with the e-mail cleared, add-image tile, 「Privacy Policy」, ‹ — after TC-336
- Modified (9; TC-216 was already modified):
  - TC-216 (R-457): also taps 「Continue」 on the Pro user's subscription page and cancels the App Store sheet
  - TC-225 (R-322): also taps the panel's 「Buy Credit」 and cancels the App Store sheet (MX Credit Panel; the old arrow trace named TC-227 / TC-228, which tap nothing)
  - TC-079 (R-458): taps 「Create video」 on the Storyboard Preview card before reading the video settings card
  - TC-147 (R-461): opens the scene-video description with the expand icon, then collapses it
  - TC-375 (R-462): after the pause, ▶ resumes playback
  - TC-069 (R-365): taps the ⟳ on the failed scene's thumbnail (the PM arrow's start)
  - TC-348 (R-430): taps a character chip (its Expected Result already checked the chip)
  - TC-111 (R-096): deletes a throwaway drama made for the case after the Cancel check (no row pressed the dialog's 「Delete」)
  - TC-332 (R-460): taps the dimmed 「generating...」 button
- n/a (27): 14 Launcher controls of other PowerDirector features (as the Design groups, requirements.md Controls (REQ-039) Not in
  scope); 8 controls of the MX mockups' older chat (「Ready to create」, 「Don't ask again」, the composer's add-image button and icon,
  aspect-ratio chips, 「Customize my characters (optional)」, the Characters Result edit icon, 「Tell AI what to change…」; Q-31) —
  plus 「Confirm」 on the 「Consume credits?」 card among the corrected traces; 3 template covers inside the user's message bubble (as
  Design K-cf4f2e); 1 selected-state cast tab (K-2509de, the same control as K-951b92); 1 PM-only ⋯ on the regenerated scene image (Q-28).
- Removed: none. Unchanged after Section C: 369

## Found by the analysis
- PM Figma 10/22 frames (board-notes, REQ-052): 4422:2 → R-051, R-052, R-071, R-158, R-262, R-264 changed, R-332 – R-336
  new; 4418:2 → R-249 changed, R-337 – R-340 new.
- R-052 is not in board-notes' proposal but its rule (reopen stops at the offer, Generate charges again) conflicts with
  the 10/22 restart rule, so it is replaced (R-335, R-336) and TC-063 changed.
- Pass 9 hidden clauses: the charge at phase ② (R-333, R-334 → credit pill, TC-406, TC-377), one charge after a restart
  (R-335 → Credit Details, TC-063, TC-403, TC-409, TC-410), phase ② surviving a swipe (R-336 → chat and History on
  return, TC-404, TC-411), export after leaving (R-337 → toast on another page and Photos, TC-415), thumbnails not
  affecting the export (R-338 → the saved video in Photos, TC-414).
- Pass 10 variants: storyboard vs video for the leave dialog body (TC-061 / TC-407), the restart (TC-063, TC-403 /
  TC-409, TC-410) and the phase ② swipe (TC-404 / TC-411); R-332 per generation (TC-156, TC-157, TC-405, TC-412).
- Pass 8 exit × stage: storyboard, storyboard update in chat and video split into phase ① and ② rows.

- Section B, PM / MX flow arrows (REQ-052): 121 arrows → 98 walked by existing rows (R-358 – R-455), 17 needing a row
  (R-341 – R-357, all by modifying an existing row), 6 not flows (`not_flow` in arrows.json).
- Arrows that repeat a Design flow but draw older copy keep the Design (or newer PM 10/22) copy in the requirement and say so:
  「Discard character changes?」 (PM) vs 「Leave without finishing?」 (Design, R-032); the PM character 「Confirm」 vs the Design
  「Save to library」 (R-118); PM Seedance 2.0 / Mini vs the Design's Best / Standard / Fast (R-253); the PM inline offline line on
  the action card vs the 10/6 toast (R-164); the storyboard / video progress cards drawn before the 10/22 two phases (R-333, R-334).
- The four PM Error Handling arrows from the chat video card to the result page (2701-22119, 2701-22120, 2621-30229, 2621-30230)
  showed that no row opened the failed scene from the chat; and three PM dialogs (multi-person, no person, public figure) had a
  「Use another photo」 button no row pressed.

- Section C, PM / MX control trace (REQ-052): R-456 – R-462 were found by pressing what the PM / MX frames draw: the feature
  intro, the subscription page, the preview card's 「Create video」, Send Feedback, the disabled 「generating...」, the scene-video
  expand icon and the result page's ▶. Label traces that only quoted the text: 27 corrected (see Case changes).
- Inventory fixes to make later (inventory-overrides.json, not edited in this section):
  - drop K-b417af (✦ icon inside the chat's 「Edit」 button), K-b2c3ec (↻ icon inside 「Retry」), K-30e8d7 (→ icons inside the
    character chips), K-cd81a2 (the › of 「View more ›」 / 「More ›」): parts of a button already in the inventory (traced to that
    button's rows meanwhile);
  - K-2509de (selected cast tab, 65 pt), K-951b92 and K-c9e4c6 (other cast tabs, imput_characters_v1 / thumb_media) are one
    cast-tab set;
  - C-c23065 (manual adds of the composer mic, 「choice of 12」) should join K-8618a7 (round/ic_vocal);
  - K-5138c4 (Button/Credit/Balance 「182」 on the scene detail) should join the credit-pill group K-87581d;
  - K-94a3ff 「Age range」 is a two-handle slider, not a text input (kind input → toggle); K-89330d 「0-100」 is the Age field
    (kind item / layer chips → input);
  - pm-main-flow-33 「Character Library」 2340:29585: the library cards and enlarge icons behind the Make your character sheet are
    boxed (`hide` on that screen).

## Not added (value check)
- R-335 per trigger and job (storyboard sent to the background, video swiped away in phase ①): merge — the same restart
  path; each job keeps one Leave anyway row and one app-interruption row (TC-063 / TC-403, TC-409 / TC-410). TC-164
  already sends the app to the background while the storyboard runs.
- Phase ① History / New chat / credit pill for a storyboard update in chat: merge — the same dialog as TC-359 (grid n/a).
- Export 「done」 (buttons restored + toast): folded into TC-343 (same screen, same setup).
- 「Stop exporting?」 dialog: not added — only RD's fallback if the export cannot continue (Q-21).

- Section B not_flow (6): five storyboard exits to 「Stop and lose your credits?」 — 2586-23239 (Back), 2586-23240 (History),
  2586-23241 (New chat), 2586-23242 (credit pill) on pm-main-flow-23 and 3152-16326 (Back, pm-0930-updates) — superseded by the PM
  Figma 10/22 frame 4422:2 (R-051, R-262; rows TC-061, TC-359, TC-401, TC-402); 2592-21575 is a connector stub below 2586:23090
  that ends on no frame (the storyboard finishing is walked through 2286-22038, R-407).

## PM-only rows
- TC-401 – TC-417 (PM Figma 10/22, 4422:2 / 4418:2): no Design frame yet. The Design 1016 「Chat navigation」 frames
  (older) draw 「Leave this chat?」 for these exits; the newer PM frame wins.

- Section B: TC-052, TC-053, TC-054 (「Use another photo」 → Add Media) and TC-058 (「Cancel」 on 「Delete this character?」), PM main
  flow: no Design frame yet (Notes say so).

- Section C: TC-418 (PM main flow 2283:10856 feature intro), TC-420 (PM Send Feedback 2613:28618 / 4012:23497) and the
  「Create video」 step of TC-079 (PM 2186:7485): no Design frame yet (Notes say so).

## Questions for PM
- Q-20 (RD to confirm, PM open question #20) charge moved to the start of phase ②; the chat restarting phase ① by itself
  after an interruption; the storyboard phase ② finishing in the background. Rows follow the frame. The storyboard
  mockups keep the pill at 400 through phase ② while the video mockups drop it 182 → 122.
- Q-21 (RD to confirm) can Export Full Video continue after leaving the result page? If not, Back asks 「Stop
  exporting?」/「Your video won't be saved.」 (Keep exporting / Stop). Rows follow the frame (TC-415).
- Q-22 Which other generations follow the 10/22 no-stop / two-phase rule? Not named in the frame: the outline (format
  card Generate, TC-153 keeps its Stop), the character update in chat (「Update characters」, R-254 / R-262 keep
  「Stop and lose your credits?」, TC-351), the scene-image regeneration in scene detail (R-280, TC-378), the phase ①
  card title of a storyboard update in chat, and whether a video regeneration has a 「Leave while we're preparing?」 phase.
- Q-23 After Generate the 10/22 mockups draw a user bubble (「Yes, create storyboard」; 「Generate Video / Model … /
  Generation length …」), while R-279 (PM 10/02) says no user bubble and the frame's note says the card turns into the
  skeleton in place. Which is current? R-279 kept (TC-377, TC-406).

- Q-24 (PM Error Handling 2701-22188, 2651-21992) 「Export Full Video」 while a scene regenerates leads to a toast with an icon
  whose text the frame does not give. What does it say? TC-096 records it.
- Q-25 (MX mx-a-mid 1563-22392) A Free user's not-enough card is labelled 「Buy Credits」 in frame 1563:22095 and opens the
  subscription page; the MX note says 「Upgrade Now」. Which label? Rows follow the note (TC-226).
- Q-26 (MX mx-a-left 1034-40811) The Pro+ limit dialog button: MX 「Try Again Later」 vs Design 「Continue Tomorrow」. Rows follow
  the Design (TC-118).
- Q-27 (PM Error Handling 2621-30306) After a failed Retry the PM frame reads 「Your credits have been refunded. Edit the
  description and try again.」 (with ⓘ and Edit); the Design reads 「Retrying didn't work. Try a different description.」. Rows
  follow the Design (TC-092); does the second failure carry the refund line and ⓘ?

- Q-28 (PM Error Handling 2621:30383) The regenerated scene image carries a ⋯ with no menu drawn; the Design has none. Is there a
  menu, and what does it offer? (control K-0b6874 n/a until then)
- Q-29 (PM main flow 2283:10856) Is the feature intro (「Don't show again」, 「Try It Now」) shown before the landing? The Design's
  shortcut arrow goes straight to the landing. TC-418 follows the PM.
- Q-30 (PM main flow 2186:7485) Does the Storyboard Preview card have 「Create video」, or does the video settings card follow the
  storyboard by itself (Design, R-408)? TC-079 taps it when shown.
- Q-31 (MX mx-a-left / mx-a-mid) The MX mockups draw an older chat (「Consume credits?」 with 「Don't ask again」 / 「Confirm」,
  「Ready to create」, a composer add-image button, aspect-ratio chips, 「Customize my characters (optional)」, a Characters Result
  edit icon, 「Tell AI what to change…」). Illustrations only? Their controls are n/a in the control trace.

## Questions for you

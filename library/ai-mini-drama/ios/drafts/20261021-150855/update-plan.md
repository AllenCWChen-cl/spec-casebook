# Update plan — ai-mini-drama / ios: approved v1 → draft 20261021-150855

Same spec set (`specs/2026-10-19`). This draft applies the 2026-10-21 analysis upgrade the user approved: coverage
passes, standing inputs (request ledger `library/ai-mini-drama/requests.md`, RD build notes), and the value check.
Built by `build-draft.ts` in this folder.

## Spec files
- Unchanged: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama - PM spec.pdf · New or changed: none ·
  No longer supplied: none
- New in the spec folder: `extracted/arrows.json` (88 Design flow arrows with Figma node IDs; one-time import of the
  inventory the spec agent recorded, user approved).

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-156 – R-189 | new | — | Job states (17), fields (3), persistence (5), MX (2), requests (4), build checks (3) |
| R-190 – R-244 | new | — | One requirement per Design arrow not yet listed (55), each with the row that walks it |
| Q-6 – Q-14 | new | — | Six PM-only features for PM, three spec conflicts (character text over 1,000, full-video length, missing scenes) |
| Job-state grid, ledger coverage | new | — | `### Job states`, `### Request ledger coverage` |

## Case changes
- New (40): TC-292 – TC-331
  - Job states (20): TC-292 main image fails, Location kept · TC-293 chat image update partly fails · TC-294 leave
    during a chat image update · TC-295 whole storyboard fails · TC-296 video regeneration fails, old video kept ·
    TC-297 「Your video has been updated.」 disappears · TC-298 caption retry fails again · TC-299 STT preview failure ·
    TC-300 offline Generate on an action card (real offline) · TC-301 network drops during the outline, resumes ·
    TC-302 Back while pricing shows no dialog · TC-303/304 Notify me / Not now (fresh install) · TC-305 no toast
    after a partial failure · TC-306 toast Close / View · TC-307 push in the background · TC-308 renamed title in
    toast and push · TC-309/310 character hint dismissal and no hint when all set · TC-311 Full Edit return keeps
    the chat position
  - Fields (6): TC-312 – TC-315 1,000-character limit on the scene and scene-video descriptions · TC-316 scene-video
    description sections · TC-317 one reference photo per character
  - Persistence (5): TC-318/319 History name follows the title until renamed · TC-320 default thumbnail before the
    storyboard · TC-321 Create Next Episode · TC-322 continue a story after Stop
  - MX (2): TC-323 first-use free credits · TC-324 model locked during the free trial (both need a new account)
  - Requests (4): TC-325 crash sequences (REQ-001) · TC-326 template thumbnails stay steady (REQ-003) · TC-327 History
    info bubble (REQ-007) · TC-328 category icons (REQ-008)
  - Build checks (3, TR261006-0055 RD Note): TC-329 full-cast regeneration offer · TC-330 caption failure does not
    mark scenes or block playback · TC-331 failed download can be retried
- Modified (11): TC-126 (TC-211 merged in) · TC-066 (Design Location layout, per the P1 report) · TC-153 – TC-157
  (a user Stop is charged with no refund row) · TC-100 (also when a row above is rebuilt) · TC-107 (download also
  leaves order, time and size alone) · TC-287 (every way to finish editing) · TC-065 (no clipped script characters)
- Removed (1): TC-211 — same check as TC-126; its ticket note moved there
- Unchanged: 279

## Run setup (phases.json)
- New phase P5 (five segments) holds the 40 new rows; TC-211 leaves P2.
- Template journeys TC-236 – TC-274 (even) carry `needs: full-generation` → recorded Blocked (REQ-019).
- New unavailable need `stt-failure` (no fault switch makes speech-to-text fail): TC-298, TC-299, TC-330 are Blocked
  (observability) until RD gives a fixture.
- Offline rows TC-032, TC-300, TC-301, TC-331 run with real Wi-Fi loss (REQ-020), phone on a USB cable.

## Not added (value check)
- 18 spec agent exploratory characterizations (EXP-*): no expected result; their branches already exist as cases.
- 4 server-side checks a tester cannot see: caption retry reruns only failed segments; no STT when captions are off;
  only the cropped photo is uploaded; limits set through Remote Config.
- 2 per-tier copies of the chat-debit check (TC-218 checks it once).
- 7 RD build points from 189463 that passed and are not in the spec (download spinner in scene details, format
  divider, manage-mode shift, send scrolls to bottom, unset-cast picker, two video-pause variants).
- From older PM frames not in the current spec set: caption position and two-line limit; Retry turning into Edit
  after two failed character or storyboard-image retries; failed-scene video cover fallback; playback past a failed
  placeholder; Discard dialog in the scene-video editor; editor on a successful clip; voice X cancel and transcript
  keeping typed text; same-session / new-session chat rules; first-look hint shown only once ever.
- Already covered by a row: failed clip lasts 15 s (TC-093); storyboard stop and reopen re-prices (TC-063); scene video
  second failure turns Retry into Edit (TC-092); Location not regenerable on its own (TC-066); 「Saved to your
  device.」 and spinner (TC-089); 20 more listed in the 10/21 proposal.
- Regression rows that passed on 189729 for RD-resolved tickets (TC-177, TC-180 – TC-183, TC-188, TC-196, TC-197,
  TC-203) stay until their tickets close, then retire.

## Questions for PM
- Q-6 Manual outline editor with save, discard and empty-text rules (PM F40–F47): still planned?
- Q-7 Manual storyboard text and image-version editor, and 「Regenerate this thumbnail?」 (PM F73, F106, F108): still planned?
- Q-8 Separate 「From Text」 / 「From Photo」 creation routes (PM F85), or the combined form in Design?
- Q-9 Aspect-ratio choice on the format card: dropped?
- Q-10 Scene reordering in the Full Edit timeline (PM F68): planned?
- Q-11 Cancel / Use dialog when an inspiration would replace edited text (PM F20): dropped in favour of append?

## Questions for you
- Q-12 Character description over 1,000: Design shows 「1120/1000」 (text kept), PM §13.11 cuts at 1,000 (TC-051 follows PM). Which?
- Q-13 Is the full video 15 s × scene count, or the 90 s / 120 s the Design frames show?
- Q-14 With missing storyboard scenes, offer 「Create video anyways」 (PM E4) or block the video?

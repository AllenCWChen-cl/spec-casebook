# Update plan — pdr/ai-mini-drama / ios: approved v6 → draft 20261022-141521

## Spec files
- Unchanged (spec set specs/2026-10-21-2). The PM main-flow note 「只送 crop 後的圖」 was missed by the first reading
  (low-confidence OCR); confirmed by a render and added to board-notes.

## Why this draft
- Manager feedback (2026-10-22, REQ-031): spec agent cases the casebook does not cover are added whenever they are
  derived from the spec files. The 10/22 comparison had left 31 out as "low value"; 6 of them come from the spec.

## Requirement changes
| Requirement | Change | Before | After |
|---|---|---|---|
| R-265 | new | — | Only the cropped reference image is sent (PM main flow) |
| R-266 | new | — | The daily chat allowance follows Firebase Remote Config (MX ①) |

## Case changes
- New (6): TC-364 1012-PM-CAPTIONS-NO-STT · TC-365 1012-PM-CAPTION-RETRY-SEGMENTS · TC-366 1012-PM-CROP-UPLOAD · TC-367 MX-PRO-SEND-DEBIT-001 · TC-368 MX-PROPLUS-SEND-DEBIT-001 · TC-369 FIXTURE-0924-S002-B016
- Modified: none · Removed: none · Unchanged: 362

## Not added (value check)
- None of the spec-derived gaps. The 25 other gaps are not from the spec files (see the cross-check below).

## Spec agent cross-check
Spec agent 250ad306 (450 iOS cases) against comparisons/20261022c_casebook-vs-spec-agent.mapping.json; 31 cases not covered before this draft.
From the spec files (6, all added):
- 1012-PM-CAPTION-RETRY-SEGMENTS [spec: source/pm-20261012/source.md] Caption retry reruns only failed STT segments; UI completion alone does not prove backend segment selection. → added TC-365
- 1012-PM-CAPTIONS-NO-STT [spec: source/pm-20261012/source.md] A final-video request with Captions No does not run STT. → added TC-364
- 1012-PM-CROP-UPLOAD [spec: source/pm-20261012/source.md] Only the cropped reference is submitted for character generation; transport or diagnostic evidence is neede… → added TC-366
- FIXTURE-0924-S002-B016 [spec: source/AI-Minidrama-PDRM-MX-20260924.pdf] Daily free chat limits can be adjusted through Firebase Remote Config. → added TC-369
- MX-PRO-SEND-DEBIT-001 [spec: source/AI-Minidrama-PDRM-MX-20260924.pdf] Each chat sent by a Pro user consumes one daily free chat use. → added TC-367
- MX-PROPLUS-SEND-DEBIT-001 [spec: source/AI-Minidrama-PDRM-MX-20260924.pdf] Each chat sent by a Pro+ user consumes one daily free chat use. → added TC-368
RD build notes (7):
- TR-DETAIL-DOWNLOAD-SPINNER-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] The scene-detail download control shows a spinner until saving finishes. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3); TC-089 checks the spinner on the video download, TC-331 the failure
- TR-FORMAT-DIVIDER-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] The Format card displays the divider between caption options and Continue. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3)
- TR-MANAGE-NO-SHIFT-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] Selecting and deselecting a Recent Task in management mode does not move its date, name or size. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3)
- TR-SEND-SCROLL-BOTTOM-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] After Send, the sent message moves to the top of the screen and the reply generates below it without the vi… → covered TC-344 (the spec agent rewrote it to PM 10/21 §13.2; the mapping still said low value)
- TR-UNSET-CAST-PICKER-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] A regeneration request with unset character portraits retains the character-picking flow. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3); TC-033 and TC-039 check the unset-cast flow
- TR-VIDEO-REPEATED-PAUSE-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] Tapping the same playing scene video pauses it across three successive playback cycles. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3)
- TR-VIDEO-TAP-PAUSE-001 [build: source/tr-189463-20261007/tr-qa-readback.txt] Tapping a playing scene video pauses playback. → not from the spec: RD build note of TR261006-0055 (189463), passed on 189463 and 189631, so retired as a build check (standing input 3)
User coverage request, exploratory charters (18): not from the spec: no expected result, branches already rows.
- EXP-001-001 Idea input boundaries and preservation — iOS
- EXP-005-001 Missing character counts and exit routes — iOS
- EXP-006-001 Character form validation and focus transitions — iOS
- EXP-007-001 Reference photo assignment lifecycle — iOS
- EXP-008-001 Character image/version selection — iOS
- EXP-009-001 Direct Stop versus navigation warning — iOS
- EXP-012-001 Recent Task rename validation — iOS
- EXP-013-001 History metadata and restored stage — iOS
- EXP-014-001 Video generation shared success fixture — iOS
- EXP-016-001 Scene-video editor cancellation and timeline — iOS
- EXP-017-001 Continue next episode and original preservation — iOS
- EXP-018-001 Stage-specific interruption matrix — iOS
- EXP-019-001 Wait duration and useful actions — iOS
- EXP-020-001 Network failure and recovery — iOS
- EXP-021-001 Quota and tier matrix — iOS
- EXP-022-001 First-use and insufficient-credit branches — iOS
- EXP-024-001 Notifications and foreground/background completion — iOS
- EXP-025-001 Photos save and task deletion boundaries — iOS

## Run setup (phases.json)
- New phase P8: P8-a TC-366, TC-367, TC-368, TC-369 (no video); P8-b TC-364, TC-365 (video).
- Parked: TC-367, TC-368 (chat-count), TC-369 (remote-config, new), TC-365 (stt-failure).

## Questions for you
- None.

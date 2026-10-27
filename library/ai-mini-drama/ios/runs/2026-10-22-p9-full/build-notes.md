# Build notes — PowerDirector iOS 16.9.0 (189872), TR261022-0031

Read 2026-10-22 15:35 (+08), read-only.

## RD Note (pasted by the user, 2026-10-27)
- Source: the RD Note of TR261022-0031, pasted by the user in chat on 10/27 (the TR page needs an ECL sign-in);
  kept as `rd-note-TR261022-0031.txt` (sections 一 and 二.1 verbatim, the rest condensed). TR facts from
  `ecl_query.py` (10/22): 16.9.0.189872, Status Assigned, Owner SR_AUTO, due 2026-10-26.
- Scope of the note: develop 16.9.0.189852 → fc841a45a4 (2026-10-22 11:56), 30 commits. Open item 「未完成」:
  Seedance 2.5 has no credit action ID of its own yet (uses the 2.0 one).
- Mapped against draft 20261022-145212 (the table P9 runs); results are P9 on 189872 (`results.csv`). Read-only:
  no draft or cases.csv was changed.

| RD point | AI Mini Drama? | Draft rows that check it | P9 result on 189872 | What is left |
|---|---|---|---|---|
| 一.1a Engine AMD v261021 + main Iris model switched to Gemini 3.8 Flash; every AMD turn runs on the new engine; merge-conflict fix (5 files) — whole flow to be regressed (new chat, template, storyboard, video, reopen from History, sequel) | Yes | The whole P9 table (P9 ran on 189872, so it already ran on the new engine). No row records reply speed/quality before vs after the model switch. | Already run on it: chat/outline/characters/storyboard mostly Pass; outline failures O-1/O-2, Gemini UNAVAILABLE on characters/scene images (O-10, O-24), waits TC-169/TC-171 Fail; **no video ever generated** (gate O-34/O-41: storage PUT failure after 361 s), so video/reopen-video/sequel rows (TC-082–090, TC-236–274, TC-304–307) are Blocked | Regression done for every stage except video and sequel; rerun the video and sequel rows once a video generates. No row → Build checks row (reply time per stage vs P1 timings) |
| 一.1b Seedance 2.5 is the first video model answer and selectable on the video model card (own reference limit) | Yes | TC-079, TC-080, TC-347, TC-345 | TC-079 Fail: control reads Best / Seedance 2.0 / Seedance 2.0 Mini (default Seedance 2.0), Best = 「Seedance 2.5 · Sharper motion…」; TC-080 Fail: Best priced ◆120/◆360 like 2.0 (spec ◆180/◆540); TC-347 Fail: Standard/Fast labels and subtitles missing; TC-345 Pass | Seedance 2.5 shows as Best but is not the default; no Seedance 2.5 video was ever generated (gate). Re-check after the CMS keys exist (see 一.1d); no row generates with Best → Build checks row |
| 一.1c Character age written as an integer so the character saves to the library; Blueprint reads int or string | Yes | TC-133 (save to Mine), TC-289 (new character found by its attributes), TC-339 | Pass: characters saved to Mine with their ages (e.g. Evelyn Female/White/32), but no row reads the stored age back | No row reads the age in the library → Build checks row (filter Mine by an Age range around the entered age; a chat-created character too) |
| 一.1d Best / Standard / Fast labels need CMS keys AnswerVideoVendorSeedance2_5 / VendorDescriptionSeedance2_5; missing → label text missing | Yes | TC-079, TC-347 (also DRI261896P0060 「quick draft」, attached) | Fail: labels read Best / Seedance 2.0 / Seedance 2.0 Mini, Standard/Fast subtitles are the old Design copy (「Best for…」, 「…quick draft」) | Likely the CMS keys are not configured on the Developer Server: ask RD/CMS whether the keys are live before filing TC-079/TC-347 as app defects; re-check after |
| 一.1e Seedance 2.5 priced and charged with the 2.0 credit action ID (open item: 2.5 action ID pending) — confirm with billing | Yes | TC-080 (price), TC-115, TC-060/TC-377 (charge = price), TC-179 (credit details) | TC-080 Fail: Best ◆120/◆360 = 2.0 price, exactly what the note describes; no Best video generated, so no 2.5 charge was booked (log shows only video_model=seedance2) | Matches the note's open item, not a new defect: hold TC-080's Best price as known/open until the 2.5 action ID lands; then re-check price and the booked charge |
| 二.1 DRI261896P0037 「Discard this character?」 on X of a finished look; Keep stays; Discard restores picks and closes, not in Mine; Save to library still saves; form-input confirm unchanged; sheet full-screen, no swipe-down, X is the only close | Yes | TC-057, TC-340, TC-134, TC-339, TC-133, TC-055 (form confirm), TC-341, TC-342 | TC-057/TC-340/TC-134/TC-339/TC-133/TC-055 Pass; **TC-341 Fail** (no page 「Discard」 button: only X, ⓘ, download, Save to library); **TC-342 Fail** (swipe down does nothing) | Fix verified. TC-341 and TC-342 contradict the RD design (X is the only close path, no swipe): not app defects per RD; PM question (PM-only rows) — keep as Q, do not file |
| 二.2 DRI261897P0019 description text overlapped by the expand icon (text, 8pt gap, 24pt icon) | Yes | TC-122, TC-370 touch the icon/text but do not check overlap | Pass (open editor only) | No row → Build checks row (long description: no line overlaps the icon while typing/scrolling) |
| 二.3 DRI261897P0021 character filter page title zh-TW 「濾鏡」 → 「篩選」 (new string); editor Filter unchanged | Yes | No row (TC-119/TC-289/TC-371 use the filter in English) | — | No row → Build checks row (zh-TW / zh-CN filter title; editor filter tool name unchanged) |
| 三.1 DRI261894P0043 empty chat Back / swipe-back / History leave with no 「Leave this chat?」; after a sent message or an outline it still asks | Yes | TC-186, TC-025–TC-028, TC-381 | TC-186 Pass (Back, two entries); TC-025–028 Pass; **TC-381 Fail (question)**: dialog shown at the format card after the idea was sent | Fix verified for Back; swipe-back and the History icon from an empty chat not checked → add to TC-186. TC-381 matches the RD rule (a message was sent, so it asks) but the row expects no dialog (R-288, PM main flow): PM question, not a defect |
| 三.2 DRI261893-0015 opening a task moves it to the top / changes size | Yes | TC-107, TC-108 | Pass (order, time, size unchanged; rename still moves to top) | Play/download not exercised (no video) — part of the video rerun |
| 三.3 DRI261897P0009 「Find your video here in History.」 after leaving the first video | Yes | TC-083 | Blocked: no bubble on a fresh install, but the video failed (O-41), so not conclusive | Re-check on a fresh install once a video generates |
| 三.4 DRI261897P0011 Create storyboard card keeps its price after the daily chat limit | Yes | No row (TC-117/TC-215 show the limit dialog only) | — | No row → Build checks row |
| 三.5 DRI261896P0014 storyboard regeneration preview reads 「Updating storyboard. Preview unavailable.」 (video copy only while a video generates) | Yes | No row (TC-073 regenerates but does not read the preview copy; TC-077/TC-299 are other preview states) | TC-073 Fail: regeneration never finished | No row → Build checks row (read during TC-073's regeneration) |
| 三.6 DRI261893-0051 shadow on 「Hi, I'm your」 | Yes | TC-003 | Pass | Fixed on 189872 (notch phone) |
| 四.1 DRI261897P0014 Black Friday iPad landscape gift bubble | No | — | — | Outside AI Mini Drama table: not in scope |
| 四.2 DRI261897P0015 Ultra IAP bubble 「9600 Credit/year」 translation | No | — | — | Outside AI Mini Drama table: not in scope |
| 五.1 DRI261889-0008 Text to Video Recent task top-left button | No | — | — | Outside AI Mini Drama table: not in scope |
| 五.2 DRI261845-0093 Send Feedback delete button (iPad) | No | — | — | Outside AI Mini Drama table: not in scope |
| 六 test fixes | No | — | — | No QA check needed |

### Proposed Build checks rows (next draft; not created)
- Time each stage (outline, characters, storyboard, video) on the new engine and compare with the P1 timings; record any reply-quality change [Build: TR261022-0031 RD Note (189872)]
- Choose Best (Seedance 2.5) on the video settings card and Generate: the video generates and the booked charge equals the shown price [Build: TR261022-0031 RD Note (189872)]
- Create a character (Create my character and from chat) with age N, Save to library, filter Mine by an Age range that contains N: it is listed with age N [Build: TR261022-0031 RD Note (189872)]
- Type a long description in Create my character and scroll it: no line overlaps the expand icon [Build: TR261022-0031 RD Note (189872)]
- In zh-TW and zh-CN, open the character Filter page: title 「篩選」 / zh-CN equivalent, no string key; the editor's Filter tool still reads 「濾鏡」 [Build: TR261022-0031 RD Note (189872)]
- From an empty chat, leave by swipe-back and by the History icon: no 「Leave this chat?」 (extend TC-186) [Build: TR261022-0031 RD Note (189872)]
- After the daily chat limit dialog, the Create storyboard card still shows its price and Generate works [Build: TR261022-0031 RD Note (189872)]
- While a storyboard regenerates, the Storyboard Preview reads 「Updating storyboard. Preview unavailable.」 (not the video copy) [Build: TR261022-0031 RD Note (189872)]

## Attached for verify on this TR
| eBug | Status | Short description | Draft rows that check it |
|---|---|---|---|
| DRI261896P0060 | TRCreated, NOT verified | Video settings card says "quick draft" instead of "quick drafts" | No row cites the ticket; TC-079 (reads the video settings card copy) and TC-347 (Standard / Fast subtitles) read that card. The ticket body is empty in the query (filed on 189631, TR261014-0058). |

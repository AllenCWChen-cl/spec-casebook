# AI Mini Drama (iOS) — eBug drafts, phase P4 (Templates), PDR-I 16.9.0 build 189729

**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-21-p4-templates/` — the 41 P4 cases of the approved table `cases.csv` v1 (TC-234 roster + 20 card rows + 20 journey rows), run 2026-10-21 05:44 → 06:53 on iPhone 17 Air / iOS 26.2.1 through Appium/WebDriverAgent, TestFlight build 16.9.0 (189729), Developer Server, Pro+. Result: 21 Pass, 0 Fail, 0 Blocked, 20 Not run. **「Generate」 was withheld on every template (user, 2026-10-20 19:0x):** the card rows checked everything up to it (roster position, cover, title, preview playback with sound / mute / pause, Make my version, the chat opening, every format option, Back / 「Leave this chat?」, History unchanged); the 20 journey rows are Not run 「Generate withheld (user, 2026-10-20)」. 0 credits spent. Observations O-1…O-8: `runs/2026-10-21-p4-templates/observations.md`.

**Filed by:** ETHAN_HSU on 2026-10-21 via API on TR261019-0014 (16.9.0 build 189729) — ISS-AMD-46 DRI261897P0023, ISS-AMD-47 DRI261897P0024, ISS-AMD-48 DRI261897P0025. Decisions: `decisions.md`.

Rules: UX problems go to PM, RD fixes are Functional without [UX]; reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry and the log excerpt where the finding has a log cause. Design outranks PM.

**What is drafted:** no P4 case failed, so all 3 entries come from off-case observations on passing card rows (cosmetic and content problems on the template assets). Spec gaps go to the Questions table, not tickets. Entries are numbered in run order; trust the ISS-ID over the number.

Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), PM (a ruling or asset change is needed), Doc (on-screen copy). Every entry links the spec board it is checked against (entries resting on a QA rule cite the board that shows the screen).

---

## 1. ISS-AMD-46 — Template detail player crops the cover title on 7 of 20 templates  ·  Class: UI  ·  Severity: S2  ·  Owner: RD

**Report step:** O-2, O-5, O-6, O-7  ·  **Reproduce:** 7/7  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** Observations O-2 (P4-a), O-5 (P4-b), O-6 (P4-c) and O-7 (P4-d), seen on passing card rows TC-241, 247, 249, 253, 257, 263, 267. The detail page's player shows the 3:4 cover art filled into the 9:16 player, so the sides of the cover are cut and the title lettering with them: The Art of Falling (「The Art / of Falli…」), The Dragon's Chosen Bride (「…HOSEN BRID…」), Awakening the Storm (last 「G」 of AWAKENING), The Rebel and the Valedictorian (「Valedictoria…」), The Fake Engagement (「…ngagemen…」), The Heiress and Her Protector (「PROTECTOR」 both edges) and Six Things You Didn't Know (「SIX THINGS」 / 「YOU DIDN'T KNOW」 both edges, the speaker button on the 「W」). The other 13 fit. The More cards and the chat's cover bubble show the full lettering. Seen once per template on the cover frame shown when the detail page opens or is returned to from the chat. RD owns the player fit (aspect-fit, or Design supplies 9:16 covers with a safe area) — Design may prefer new assets; switch the owner if so. No log (layout only).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template detail player cuts off the cover title on 7 templates
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap More
4. Swipe up to Family & Life
5. Tap The Heiress and Her Protector
6. Look at the cover frame the player shows as the page opens
7. Check the result

Result:
The cover title is cut off at both edges of the player, while the More card shows it in full.
摘要：詳細頁播放器中的封面標題左右兩側被裁切（如 PROTECTOR、SIX THINGS），More 頁卡片則完整顯示。
{16.9.0_amd46_heiress_crop.jpg} {16.9.0_amd46_six_things_crop.jpg} {16.9.0_amd46_dragon_crop.jpg} {16.9.0_amd46_art_of_falling_detail.jpg} {16.9.0_amd46_more_cards_full.jpg}

Expect Result:
The cover title is fully visible in the detail player, as on the More card.
摘要：詳細頁播放器應完整顯示封面標題，與 More 頁卡片一致。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Template Detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0_images/01_ISS-AMD-46/`

---

## 2. ISS-AMD-47 — Proposal Across Every Lifetime cover art is titled Proposal Across Lifetimes  ·  Class: UI  ·  Severity: S2  ·  Owner: PM

**Report step:** O-4, TC-265  ·  **Reproduce:** 2/2  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** O-4 (P4-a roster, More card) confirmed in P4-d TC-265: the cover lettering reads 「Proposal Across Lifetimes」 on the More card, in the detail player's cover frame and in the chat's cover bubble, while the template name (card caption, detail title, cover bubble label, roster slug proposal-across-every-lifetime) is 「Proposal Across Every Lifetime」. Same on the 10/19 roster. TC-265 itself passed (the title and cover are shown); this is the mismatch between them, the same kind of defect as DRI261894P0008 (The Fake Engagement cover titled Billionaire Romance, Belong PM, S3), which no longer reproduces on 189729. PM to decide which title is right (the asset or the name).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Proposal Across Every Lifetime cover reads Proposal Across Lifetimes
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap More
4. Swipe up to Family & Life
5. Tap Proposal Across Every Lifetime
6. Tap Make my version
7. Check the result

Result:
The cover art reads Proposal Across Lifetimes, but the template name is Proposal Across Every Lifetime.
摘要：封面標題為 Proposal Across Lifetimes，與模板名稱不符。
{16.9.0_amd47_more_card.jpg} {16.9.0_amd47_detail_cover.jpg} {16.9.0_amd47_chat_bubble.jpg}

Expect Result:
The cover art title and the template name match.
摘要：封面圖標題應與模板名稱一致。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Template Detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
Related: DRI261894P0008 (same kind of mismatch on The Fake Engagement; no longer reproduces on 189729)
<Claude Reviewed>
```

**Images:** `20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0_images/02_ISS-AMD-47/`

---

## 3. ISS-AMD-48 — Garbled sign text in three template sample videos  ·  Class: UI  ·  Severity: S3  ·  Owner: PM

**Report step:** O-3, O-6, O-8  ·  **Reproduce:** 3/3  ·  **Verified on:** 16.9.0.189729

> **QA note — not pasted into eBug.** User QA rule 7 (scan all on-screen text), applied to the template sample videos on the detail pages: three of the 20 show AI-garbled lettering on signs. Glad We Came (O-3, TC-243): the phone screen held up reads 「GREEN I'ECH」 for GREEN TECH above 「BEACH CLEANUP」. After Closing (O-6, TC-255): the café sign in the opening frame reads 「CFIDKAICE」. The Ring He Worked For (O-8, TC-271): hanging sign 「MIIANNY RING」 and unreadable facade/door lettering (only the window's 「MOON RI…」 is real words). The other 17 previews either have no readable text or spell it correctly. Content of the template assets (AppCMS), so PM owns it; Spec Link: the Template Detail board (R-007, template video on the detail page), checked under rule 7. No log (video content).

**Short Description:**

```
PDR-I 16.9.0 - [AIAgent][UI] AI Mini Drama: Template sample videos show garbled sign text
```

**Description:**

```
Repro Steps:
1. Launch the APP
2. Tap AI Mini Drama on the Launcher
3. Tap More
4. Tap Glad We Came
5. Watch the sample video
6. Tap Back
7. Tap After Closing
8. Watch the sample video
9. Tap Back
10. Tap The Ring He Worked For
11. Watch the sample video
12. Check the result

Result:
Signs read GREEN I'ECH, CFIDKAICE and MIIANNY RING in three sample videos.
摘要：範例影片中的招牌文字為亂碼：GREEN I'ECH、CFIDKAICE、MIIANNY RING。
{16.9.0_amd48_glad_we_came.jpg} {16.9.0_amd48_after_closing.jpg} {16.9.0_amd48_ring_he_worked_for.jpg}

Expect Result:
Text shown in template sample videos is spelled correctly, or the frames show no readable text.
摘要：模板範例影片中的文字應拼寫正確，或畫面中不出現可辨識的文字。

Note:
Device: iPhone 17 Air / iOS 26.2.1
Spec Link: AI Mini Drama Design spec, Template Detail board - https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=116-7873
<Claude Reviewed>
```

**Images:** `20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0_images/03_ISS-AMD-48/`

---

## Rechecks — existing tickets that still reproduce on 189729

None: no existing ticket reproduced in P4 (Generate was withheld, so the journey-stage template tickets were not reached).

## Fixed — tickets that no longer reproduce on 189729 (candidates to close)

| P4 case | Ticket | Status — ticket says | What P4 saw |
|---|---|---|---|
| TC-257 | DRI261894P0008 | TRCreated — The Fake Engagement template uses cover art titled Billionaire Romance | Cover lettering reads 「The Fake Engagement」 on the More card, detail page and chat bubble (P4-c, 06:30). |

Not checkable this phase: DRI261896P0047 (Back during the template outline — needs 「Generate」, withheld), DRI261896P0049 (credit pill outdated on template/More pages — the balance did not change during P4: 19285 throughout), DRI261896P0035 (Larger Text — system setting not changed).

## Questions and spec additions (PM / Design, not tickets)

| Item | Disposition | What to decide |
|---|---|---|
| O-1 | spec-addition (Design) | The detail page is a horizontal pager over the whole category row (swipe to the next template; it stops at the row's last). The Template Detail board shows one template and no swipe. Intended? (Hidden pages keep their own Unmute buttons in the accessibility tree; VoiceOver users may land on them.) |
| R-006 / TC-234 | question (Design) | Design names the categories Office Romance and Fantasy World; the live roster (server data, frozen 10/19 and 10/21, identical) says Workplace Romance and Fantasy & Destiny. Confirm the roster is the source and the board names are placeholders. |
| R-010 / Q-1 | answer | The app names the template 「Six Things You Didn't Know」 with the apostrophe, matching the cover; Design's 「Didnt」 label looks like the typo. Close Q-1 that way unless Design disagrees. |
| Card rows (TC-235…273) | table note | The card rows expect 'title and premise match the card', but the chat shows no premise before 「Generate」 (R-009: format question first). With Generate withheld only the title and cover bubble could be matched; the premise check belongs to the journey rows. Consider moving it there in the next table revision. |

## Not raised (for the record)

| Item | What was seen | Why not raised |
|---|---|---|
| O-1 (tool note) | `id Unmute` hit a hidden pager page and paged the view (first TC-237 attempt) | Test-tool behaviour, fixed in recipes/template-card.steps (taps by point, checks the card id). |
| Format card | 「Generate」 on the template format card shows no price | Not a defect: R-018 asks only for a Continue/Generate button; the price appears on later cards. |
| Not run (20) | TC-236, TC-238, TC-240, TC-242, TC-244, TC-246, TC-248, TC-250, TC-252, TC-254, TC-256, TC-258, TC-260, TC-262, TC-264, TC-266, TC-268, TC-270, TC-272, TC-274 | Journey rows: 「Generate withheld (user, 2026-10-20)」 — no verdict, no finding. |

## Reconciliation against the report

The run is the report: 0 failed cases, 0 Blocked, 20 Not run (Generate withheld), observations O-1…O-8.

| Step | Count | Running total |
|---|---|---|
| Failed cases | 0 | 0 |
| Observations (8) | 8 | 8 |
| O-1 → question (Design), not an entry | −1 | 7 |
| O-2, O-5, O-6 (crop part), O-7 → one entry for the shared cause (ISS-AMD-46) | −3 | 4 |
| O-3, O-6 (sign part), O-8 → one entry for garbled sample-video text (ISS-AMD-48); O-6 counted once above | −2 | 2 |
| O-4 → ISS-AMD-47 (confirmed in O-8 / TC-265) | +1 | **3 to file** |
| Not run journey rows (20) → no verdict | 0 | 3 |

Dispositions: **defect** → entries 1–3 (cosmetic/content); **spec-addition / question** → Questions table; **test-data / observability** → none; **withheld** → 20 journey rows.

### Row-by-row map

| Item | Result | Became |
|---|---|---|
| O-1 | observation | question (Design, spec-addition) |
| O-2 | observation | 1. ISS-AMD-46 |
| O-3 | observation | 3. ISS-AMD-48 |
| O-4 | observation | 2. ISS-AMD-47 |
| O-5 | observation | 1. ISS-AMD-46 |
| O-6 | observation | 1. ISS-AMD-46 + 3. ISS-AMD-48 (+ DRI261894P0008 fixed) |
| O-7 | observation | 1. ISS-AMD-46 |
| O-8 | observation | 3. ISS-AMD-48 (+ O-4 confirmation → 2. ISS-AMD-47) |
| TC-236, TC-238, TC-240, TC-242, TC-244, TC-246, TC-248, TC-250, TC-252, TC-254, TC-256, TC-258, TC-260, TC-262, TC-264, TC-266, TC-268, TC-270, TC-272, TC-274 | Not run (withheld) | no verdict |

### Owner split

| Owner | Entries |
|---|---|
| RD | 1 |
| PM | 2, 3 |
| Doc | — |

### Filing order

RD first, then PM: **1**, **2**, **3**. Also comment on DRI261894P0008 that it no longer reproduces on 189729.

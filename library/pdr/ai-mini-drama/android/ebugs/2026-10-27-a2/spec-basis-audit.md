# Spec basis audit — A2 batch (2026-10-29, REQ-055)

Run after PDRA (Jane) questioned DRA262610P0345. Each filed entry's Expect Result was traced back to its spec text
(skill: eBug drafts step 1, *Spec basis check*). No ticket was commented on or changed (team rule).

## Invalid (not a bug per spec)

| F | BugCode | Why |
|---|---|---|
| 22 | DRA262610P0345 | pm-update-6 「10/12 update - Scene 編輯頁的「地點圖片」」 is the Scene edit page; the chat storyboard skeleton matches Design 「show skeleton loader」. |
| 31 | DRA262610P0354 | 「You have 160 credits left」 only in older ds-mx-link frames; the newer 1016 frames (storyboard card, video settings) show price + Generate, as the app does. |
| 32 | DRA262610P0355 | pm-1002-update §13.8 「Full Edit 重新生成後返回」 is the Full Edit regeneration path; the run made a new generation in chat, where PM 10/20 §13.2 ③ says new results 「不寫回上方舊訊息」. |
| 33 | DRA262610P0356 | Same substitute flow as F-32 (likely). |
| 13 | DRA262610P0336 | ds-characters 「長按滑動範圍」: the text area scrolls on long press; a plain drag opening the editor is not contradicted (likely). |

## Suspect (needs rewording, a retest or RD/PM ruling)

| F | BugCode | Issue |
|---|---|---|
| 3 | P0326 | Expect quotes PM 「Others」; Design draws 「Other」 (the duplicate itself is real). |
| 6 | P0329 | "looks not applied" is our arrows.json paraphrase; arrow 2811-90144 only draws X → picker. |
| 8 | P0331 | 2–4 chips rule valid; the exact sentence is Iris's sample AI reply. |
| 10 | P0333 | Iris's wording treated as fixed copy; one attachment shows exactly the mockup. |
| 12 | P0335 | Spec Link (pm-update-3 §13.11, cut at 1,000) supports the app; Repro says Paste, run used setval. |
| 17 | P0340 | 「Creating your scene...」 is drawn by Design and pm-0930; one-charge storyboard is 「待 RD 確認」. |
| 21 | P0344 | Background finishing is on the 10/22 「待 RD 確認」 list. |
| 25 | P0348 | ds-recent-task's reopened chat shows the "kept only outline, images and videos" notice; only the lost video cards (O-20) hold. |
| 34 | P0357 | "and plays" added to arrow 2820-115460 ("opens the scene-video player"). |
| 38 | P0361 | 10 s wait rule is a team rule; the cited boards don't state it ("Videos take a few minutes"). |
| 39 | P0362 | Android 12 has notifications on by default; retest on Android 13+. |

The other 23 entries trace to the spec on the right screen.

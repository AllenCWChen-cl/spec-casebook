# Off-case observations — 2026-10-16 run

Things seen during the run that no single case covers. Each names the closest case and its evidence.

| # | Observation | Closest case | Evidence |
|---|---|---|---|
| O-1 | 「Try again」 on the failed-video card is inconsistent: 1st time it re-shows the video settings card; 2nd time Iris instead replies 「Which beat would you like to modify?」 with a single beat (First Day) and More ideas — no retry. | TC-094 | 054-video-result, 055-try-again, 056-try-again-progress, 061-after-try-again |
| O-2 | Asking 「Create the video」 a second time returns a card with only 「Video length」 (Preview/Full) and ◆60 — no 「Choose your video settings」 title and no model selector. | TC-079 | 062-settings-2pro |
| O-3 | The drama was renamed during the flow: History 「Workplace Romance」 → 「Office Romance」 after the storyboard; the landing Recent Task still showed the old name. | TC-108 | 021-reopen-workplace, 043-history-after, 058-landing |
| O-4 | Reopening a drama drops the user's own chat messages after the last generated card (「Update the image for Scene 2 to show rain」, 「Create the video」) — consistent with the History info text "we kept only the generated story outline, images and videos". | TC-113 | 041-update-done, 044-reopen-office |
| O-5 | Credits dropped by 4 (5928 → 5924) between the silent storyboard-update failure and the reopen, with no visible charge or result. | TC-073 | 041-update-done, 045-ask-video |
| O-6 | Back from a chat opened from History returns to History, not to the landing page. | TC-082 | 049-back-during-video |
| O-7 | In a brand-new empty chat the keyboard cannot be dismissed (tap outside, swipe down, hide-keyboard all fail); in a chat with content a tap on the chat dismisses it. | TC-018 | 081-collapsed, 087-collapse-check |
| O-8 | 「Finish your characters」 sheet clips the bottom of the name labels — descenders are cut, so 「Maya Lin」 reads 「Mava Lin」 and 「Julian Hayes」 reads 「Julian Haves」. | TC-039 | 096-unset-sheet, 096b-names-clipped |
| O-9 | Tapping 「Generate all」 in the 「Finish your characters」 sheet posts a user bubble reading 「Generate with AI」 in the chat — the echoed label does not match the button the user tapped. | TC-041 | 105-older-card |
| O-10 | With Pink 「Inject failure status = tool_error」 (scope First beat), confirming the cast ran 「Continuing the drama production.」 and then ended silently: no 「The characters look great…」/Create storyboard card and no error message or Try again. | TC-030 / TC-044 | 184-after-confirm, 185-storyboard-offer |
| O-11 | 「Passing the Spark」: after the cast was set (with Pink tool_error injection on, then off), the drama jumped straight from Characters to 「Here's your drama.」 with a failed clip — no storyboard, no Storyboard Preview, no video settings card and no price/credit charge. The video stage was reached without the user choosing model/length or confirming a price. | TC-064 / TC-079 / TC-091 | 185-storyboard-offer, 186-ask-storyboard, 193-spark-bottom |

# AI task completion (shared by every AI tool)

## KP-055 Completion banner in the editor
- kind: fact · platform: ios · use: analysis, run · tags: ai-task, banner
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

When a background AI task ends, the editor shows 「Good news! Your <Task> task has been completed. Tap here to view your
results.」 with 「Close」 and 「View」, over the top of the preview. Banners queue: dealing with one shows the next
finished task. Close was not tested.

## KP-056 Task list states
- kind: rule · platform: ios · use: analysis, run · tags: ai-task, task-list, download · authority: observed
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

In a tool's task list a finished item still downloading shows a placeholder, 「Downloading.」 and a progress bar and
no 「View」; once downloaded it shows its thumbnail and 「View」 (CineStory F15/F16). The list settles by itself.

## KP-057 Result page
- kind: fact · platform: ios · use: analysis, run · tags: ai-task, result
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

Before / After tabs where the tool has them (After selected), else one result; then a Share Video row, 「Add to
Timeline」 and 「You might also like」.

## KP-058 Result page exits
- kind: quirk · platform: ios · use: run · tags: ai-task, result, navigation
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

「Add to Timeline」 returns to the editor with the clip selection lost (root toolbar); the result page's ‹ goes to the
tool's task list, not the editor it came from (ISS-ATC-04, same back-stack gap as KP-026).

## KP-059 Banner View opens before the media is ready
- kind: risk · platform: ios · use: analysis, run, ebug · tags: ai-task, banner, download
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

ISS-ATC-01/02 (High): the banner's 「View」 is offered before the result has downloaded and opens a black result
(00:00/00:00, no loader); the same item from the task list after download plays fine. 「Add to Timeline」 there is a
silent no-op (ISS-ATC-03: the duration reading does not change). Vary: tap the banner's View at once.

## KP-060 Full-screen result player may trap the user
- kind: risk · platform: ios · use: run · tags: ai-task, player
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion) (unverified on a real phone)

Seen only through mirroring (ISS-ATC-05): once the full-screen player's controls auto-hide, taps only toggle play and
neither the controls nor ‹ come back. Recheck on the phone before filing.

## KP-061 Completion and error states the specs leave open
- kind: question · platform: both · use: analysis · tags: ai-task, banner, design
- source: exploration KB ai-task-completion-banner.md (short blind run 2026-09-08, Developer Server; Video Upscaler and Super Slow Motion)

CineStory F17 says inform users 「when the task is done」 without saying server-done or downloaded. The banner button
is 「View」 in CineStory F02 and 「View Result」 in Video Object Removal F116 (the build says View). The F15 error
states 「Retry」 and 「View Details」 were never reached.

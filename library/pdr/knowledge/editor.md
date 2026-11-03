# Timeline editor

## KP-050 Editor controls
- kind: fact · platform: ios · use: analysis, run · tags: editor, layout
- source: exploration KB video-editor-core.md (blind sweep 2026-08-26, 16.7.0 build 188155)

Header: ⌂ · undo · redo · ⋯ · Export, plus a trash icon while a clip is selected. Root toolbar: Audio · Text · Overlay
· Effects · Sticker · AI Magic · Aspect Ratio · more. Clip toolbar: Split · Video Edit by Chat · Volume · Audio Tool ·
Quick Actions · Object Removal · Speed · more. Aspect Ratio offers 16:9 / 9:16 / 1:1 / 21:9 / 4:5, set to the
project's ratio.

## KP-051 Leaving the editor saves silently
- kind: rule · platform: ios · use: analysis, run · tags: editor, project, save · authority: observed
- source: exploration KB video-editor-core.md (comprehensive run 2026-07-17, build unknown, VIP); exploration KB video-editor-core.md (blind sweep 2026-08-26, 16.7.0 build 188155)

Leaving with ⌂ saves the project without a prompt; it reopens from the Project tab (ratio, duration, size shown) with
every edit, filters included. A demo project from Mine › Demo Videos is the exception (KP-033).

## KP-052 Export options; export costs no credits
- kind: fact · platform: ios · use: analysis, run · tags: editor, export, credits
- source: exploration KB video-editor-core.md (comprehensive run 2026-07-17, build unknown, VIP)

Export offers Resolution 360p / 720p / 1080p / 4K, Bitrate Smaller / Standard / Better, Frame Rate 24 / 25 / 30 / 50 /
60 and a live size estimate, then a share screen (Shorts, YouTube, TikTok, IG Reels, Instagram, Upload to My Cloud).
Non-AI editing and export spend no credits.

## KP-053 Editor edge cases seen
- kind: quirk · platform: ios · use: analysis, run · tags: editor, timeline
- source: exploration KB video-editor-core.md (comprehensive run 2026-07-17, build unknown, VIP)

Split exactly on a clip boundary is a silent no-op (ISS-01). A text object near the end of the timeline extends the
project's duration (0:08 → 0:10) and deleting it reverts (ISS-06, intent unconfirmed). Undo reverts a transition to
the empty marker.

## KP-054 Project thumbnails and empty projects
- kind: risk · platform: ios · use: analysis, run · tags: project, thumbnail
- source: exploration KB video-editor-core.md (blind sweep 2026-08-26, 16.7.0 build 188155)

The project list can show a broken-media placeholder (film icon and 「?」) for a valid project (ISS-PRJ-01). Unconfirmed:
a 0:00 project opened into an empty editor and then vanished from the list, as if 0-duration projects are cleaned up.
Check project lists after AI results and empty projects.

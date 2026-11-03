# History

## KF-037 History list
- kind: rule · platform: ios · use: analysis, run · tags: history · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08, 16.9.0 189482; 2026-09-24, 189315)

Empty state 「No dramas yet / Start a story with AI. Every drama you create will be saved here.」; first visit shows
the ⓘ tooltip 「To keep the file lightweight, we kept only the generated story outline, images and videos.」, which an
outside tap does not close (DRI261893-0013). Card: title = template name or an AI title, thumbnail = Scene 1 image
(clapperboard if it failed), time and order = last activity (189482), size, ⋮ Rename / Delete. 「Manage」 and a
「New Chat」 FAB.

## KF-038 Rename and delete
- kind: rule · platform: ios · use: analysis, run · tags: history, delete · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-08 QA, 16.9.0 189482)

Delete asks 「Delete this drama? / "<name>" and its videos will be permanently deleted.」 (189482). Rename is a
prefilled iOS alert; an empty or whitespace name keeps OK enabled and does nothing (DRI261893-0016). Manage has
checkboxes, 「Select All」/「Deselect All」 and Delete disabled at 0.

## KF-039 Reopening a drama
- kind: rule · platform: ios · use: analysis, run · tags: history, resume · authority: observed
- source: exploration KB ai-mini-drama.md (2026-10-07, 16.9.0 189399)

Reopen restores outline, characters, storyboard, video and the latest offer card, but not the user's bubbles. Back
from a History-opened chat returns to History. Dramas do not appear in the Project tab.

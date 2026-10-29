# AI Mini Drama — spec board notes (spec set 2026-10-16)

Working notes taken while reading the rendered tiles. Coordinates are PDF points (top-left origin) on the single
canvas page; tiles in `regions/pm-tiles/` and `regions/design-tiles/` are named `x<X>-y<Y>.png`.

## PM spec — board index (from pm-overview.png)

| Board | Region (x, y, w, h) |
|---|---|
| Top mockup group (chat states: Characters Result, preview video, Storyboard Preview, video settings) | 14400, 0, 2900, 3600 |
| Main flow | 400, 5700, 9500, 8800 |
| Error Handling | 10570, 5530, 6800, 8750 |
| 0930 updated (two strips) | 10500, 14700, 3400, 2600 |
| 1002 update | 14300, 14700, 6800, 3300 |
| Later updates (four boards) | 14200, 18000, 7000, 9500 |

## PM — Error Handling board

Rules (annotation text):
- Short & long tasks
  - **4XXX [moderation error]** — known immediately. Solution: refund credits and show "Edit"; the user must resend the prompt.
  - **5XXX [3rd-party server dead]** — TBD? Solution: refund credits and show "Edit", show more info (try later); the user must resend the prompt.
- Long tasks only
  - **6XXX [upload not success or not apply]** — Solution: 1) immediately show "Retry"; 2) after 3 hrs refund and show "Edit".

### Character generation (4xxx & 5xxx)
- Missing-character sheet: "1 characters isn't set yet / It needs a look before you can continue." (unset slot shows "!" with name, e.g. Chloe), balance pill, buttons **Generate with AI ◆6** and **Choose myself**, X close.
- Generating state: "Generating…" sheet, placeholder tile, disabled "generating…" button.
- Failure: **"Couldn't create image" / "We couldn't create this character. Your credits have been refunded. Try again."** with Error tile and **Got it** → Got it leads to Change Characters (Character Library picker).
- Partial failure: **"Couldn't create some images"** with the same body.
- Change Characters page: X, title "Change Characters", ✓, cast tabs (Sophie, The Manager, HR, Chloe), "Character Library" + filter icon, "Create my character" tile, library cards with "My character" tag.

### Storyboard (4xxx & 5xxx)
- 4xxx scene card: "Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result." + **Edit**.
- 5xxx scene card: "Couldn't create image / Your credits have been refunded. The service is busy — try again later." + **Edit**.
- ⓘ dialog (4xxx): "Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again." + Got it; "terms of service" links to https://www.cyberlink.com/stat/policy/enu/tos.html…
- **10/13 update:** 4xxx dialog adds violation examples (violence, NSFW, minors). 5xxx card removes the ⓘ and opens no dialog.
- Chat: "Here's your storyboard" → Storyboard Result list (View more >); failed scenes show a ⟳ thumbnail.
- Scene detail (X, "Scene 1", ‹ ›): failed image shows the error card with Edit; title + full script below; Edit makes the description editable with **Regenerate Image ◆6** at the bottom.
- During regeneration: X → **"Stop and lose your credits? / This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded." Leave anyway / Keep Generating.**
- After success the scene shows the new image (… menu on the image).

## PM — Chat result states (`pm-top-mockups`)
- After the cast is set: "The characters look great! Ready to create the storyboard?" + card **Create storyboard ◆15 · Generate**.
- After a character change: "Characters updated! Regenerate the storyboard to match?" + Create storyboard card.
- After the storyboard: **"Choose your video settings"** — Model: **Seedance 2.0** ("Best for cinematic, beautiful, high-detail videos") / **Seedance 2.0 Mini**; Video length: **Preview • 30 sec** / **Full Video • 90 sec**; **Generate Video ◆120**.
- User bubble after Generate: "Generate / Model: Seedance 2.0 Mini / Generation length: The first 30s".
- Storyboard Preview card: "<title> 1:30 / See how your story flows before generating the full video" + **Create video**.
- After the preview video: "Here's your drama." then "Looking good! Ready for the full video?" + **Create the full episode (90 sec) ◆120 · Generate**.
- Composer always shows "More ideas +" chip, placeholder "Enter your idea to create drama", mic.
- Assistant prompt catalogue (annotation, `{}` = count):
  - Characters: "Ready to create your characters? ({})" (after adding characters); "The character descriptions have been updated. Ready to re-create the character images? ({})"; "The characters have been updated ({}). Ready to regenerate the storyboard to match?" + "and {} beats are affected"; "{} characters still need images. Ready to create them?"; "Every character has an image. Ready to create your storyboard?"; "The character images are finished. Ready to create your storyboard?"; "The characters have been updated, so {} storyboard images are out of date. Ready to re-create them?"; "The character images have been updated. Ready to create the remaining {} videos?"
  - Storyboard: "Ready to create your storyboard?" (no story yet); "The story is written. Ready to create images for these {} beats?"; "No beat has an image yet. Ready to create your storyboard images?"; "{} storyboard images are out of date. Ready to re-create them?"; "Every frame is done. Ready to create your video?" (PM note: storyboard.all_videos.q and ladder.beat_video.q share this exact English — PM to confirm intent).
  - "(after storyboard) Choose your video settings"; "(after preview video) Looking good! Ready for the full video?"

## Design — 1005 update: offline / outline failures (`ds-extra`)
- **Offline send** (idea sent while offline): user bubble stays; message "You're offline. Check your connection and try again." + **Try again**.
- **Outline generation fails — 4xxx**: "I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way." (no Try again).
- **Outline generation fails — 5xxx**: "Something went wrong on my end. Let's try that again." + **Try again**.
- **Credit charge fails (offline) on an action card**: the card (e.g. Create storyboard ◆15 · Generate) reappears with inline "ⓘ You're offline. Check your connection and try again." below it.
- Format question text: "What format would you like for your video?"; answer bubble "1. Video language: English / 2. Captions: Yes".

### Error Handling board, continued (OCR `boards/pm-error-handling.md`)
- **Storyboard TTS fail**: Storyboard Preview card shows "ⓘ Couldn't create the storyboard preview. Your credits have been refunded. Try again." + **Retry ◆1**.
- **Storyboard STT fail**: "ⓘ Storyboard preview unavailable. Try again to generate the preview." + **Retry**.
- **Storyboard with failed scene images**: Storyboard Preview shows "ⓘ Storyboard preview unavailable. Complete the image generation above first to view the preview." with **no generate button** for the preview; failed scene thumbnails show only the ⟳ icon (10/6 update: thumbnails 9:16, "Regenerate" text removed). Error text stays inside the frame: 4xxx "Edit the description and try again." / 5xxx "The service is busy. Try again later." (10/6 update). A "Create video anyways" option appears in one variant.
- **Video (4xxx & 5xxx)**:
  - 4xxx clip card: "Couldn't create video ⓘ / Your credits have been refunded. Try editing the description for a different result."; ⓘ → dialog "Couldn't generate this video / Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again." + Got it (terms of service link). 10/13 update: 4xxx dialog adds violation examples.
  - 5xxx clip card: "Couldn't create video / Your credits have been refunded. The service is busy - try again later." 10/13 update: 5xxx card has no ⓘ and opens no dialog.
  - Chat after clip failures: "{n} scenes couldn't be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change."; banner "Some videos couldn't be generated. Try again." / "Some videos need another try."; "Some videos aren't ready yet".
  - Scene-video editor: description text with sections **Cinematic Style / Scene / Motion / Camera** (plain editable text, section headings kept, one paragraph per section) and **Regenerate Video ◆30** (price depends on the model already used).
- **Video (6xxx)**: clip card "Couldn't create video ⓘ / Something went wrong. Give it another try." then "Your credits have been refunded. Edit the description and try again." + **Edit**.
- Result page actions: **Full Edit**, **Export Full Video**. 10/6 update: Full Edit preview area large, description stays inside the frame; ⓘ removed (not in v1).
- Older wording on board: "Are you ready to create video?" / "Yes, create video"; "Continue making next episode".

## PM — 0930 updated (`pm-0930-updates`)
Flows drawn to match the UX-states spec:
- **Offline (§5)**: sending an idea / Continue / Create with no network → AI message "You're offline. Check your connection and try again." + **Try again**; no credits charged, no request sent. Network lost mid-generation → resumes automatically after recovery.
- **4xxx outline (§5)**: after a 4xxx the user retypes the idea → reuses the language / ratio / captions already chosen; the format card is **not** shown again; generation starts directly.
- **Outline failure = AI chat message (no card).** 4xxx: no button, user retypes the idea and it generates with the chosen format. 5xxx: **Try again** resends the original idea + format. Leaving before the outline exists still shows "Leave this chat?".
- **§3.2 Leave during storyboard generation / app killed**: returning from History stops at "Are you ready to create storyboard?"-style offer ("Yes, create storyboard"); Generate re-prices and charges again (killed app: no refund pending RD). Leaving while "Thinking…" (pricing) shows no dialog.
- **Leave chat during video generation**: toast **"We'll keep making your video. Find it in History."** (no stop dialog). Back / New chat / History / system back during a short generation (storyboard/character) → **"Stop and lose your credits? / This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded." Leave anyway / Keep Generating.**
- **§6.2 Video done while user is elsewhere in the app**: task-completed toast "Good news! Your "{Drama title}" is ready. Tap here to view your results." with **Close / View** (View → History). Failure: no toast. 10/6 update: only once the whole video is done (every scene succeeded); 6xxx auto-retry is not "done".
- **§6.3 App in background**: push only on success — Title "Your drama is ready", Body ""{Drama title}" is done. Tap to watch it."; tap opens that chat scrolled to the video card. Partial/total failure: no push. 10/6: once per finished video.
- **Notification pre-prompt**: on the first "Yes, create video" → "Get notified when your video is ready? / Videos take a few minutes. We'll let you know as soon as yours is done." **Notify me** (then the system permission) / **Not now** (never shown again).
- **Download (10/6 update)**: no download dialog; the download button becomes a spinner, then toast **"Saved to your device."**
- **History (§2/§9)**: card name = the drama title Iris generated (user can Rename); card shows date-time, title, size ("455 MB"); hint "To keep the file lightweight, we kept only the generated story outline, images and videos."
- **Delete (10/5 update, Bug 0017)**: single "Delete this drama? / "{title}" and its videos will be permanently deleted." Cancel / Delete; multiple "Delete 3 dramas? / These chats and their videos will be permanently deleted." (no names).
- **Bug 0014**: names use the drama title (§2, §13.9).
- Format card: "What format would you like for your video?" 1. Video language: English / Spanish / French / German / Japanese / Korean / Chinese; 2. Captions: "Yes, include captions" / "No captions"; **Continue**. Status lines: "I'll create a story outline - give me a moment...", "Writing your story...", "I'll create a storyboard - give me a moment...", "Creating your scene...".
- Launcher banner: "AI Mini Drama with Seedance 2.0 >".

## PM — Main flow (`pm-main-flow`)
- **Entry**: Launcher shortcut "AI Mini Drama" in the small shortcuts (4th); feature intro "AI Mini Drama / Turn your idea into a video—same characters, same voices, every scene." with "Don't show again".
- **Landing**: "Hi, I'm your / AI Drama Assistant", "Describe your idea and watch it come to life as a short drama.", **Create Your Drama**, "Start from a template" + **More >** (template area; "More" hidden when fewer than 6 templates). Template preview → **Make my version**; template badge "Free for the first 3 times" (MX).
- **Composer**: "• Surprise me" + 2 UI inspirations from CMS (text inspiration from CMS); Surprise me picks 1 of 10 strings at random; pressing Surprise me repeatedly **appends** to the existing text instead of replacing it. **Text limit: 1000 characters.** Placeholder "Enter your idea to create drama".
- **Format**: "What format would you like for your video?" — 1. Video language (English, Spanish, French, German, Japanese, Korean, Chinese); 2. Captions ("Yes, include captions" / "No captions"); **Continue**. Answer bubble "1. Video language: English / 2. Captions: Yes".
- **Outline generating**: "I'll create a story outline - give me a moment..." / "I'll create your story outline and characters - give me a moment..." / "Writing your story..."; leaving before the outline exists → **"Leave this chat? / Your story outline isn't ready yet, so this chat won't be saved." Leave anyway / Stay** (Bug 0018, §3.2/§3.3). Only chats that reached the story outline are saved to recent tasks (Bug 0012, §2). Back without anything → back to home page, not saved to History.
- **Outline result**: "Story Outline & Characters Result": Story Outline text + "Possible Characters:" list; "Choose your characters to continue."
- **Characters**: tap a character → Change Characters / Character Library (filters e.g. "Female ×", "Young Adults ×"; "My characters only"; Gender, Ethnicity (Caucasian…), Age 1–100). Leaving the picker with changes → **"Discard character changes? / The characters you picked here won't be saved if you leave." Discard / Keep Editing.** Applying only some characters is allowed ("僅套用部分角色").
- **Missing characters sheet**: singular "1 characters isn't set yet / It needs a look before you can continue." + **Generate with AI ◆6** / **Choose myself**; plural "{n} characters aren't set yet / They need a look before you can continue." + **Generate with AI ◆6*n**; generating "Generating..."; done "Your character is all set!" / "{n} characters are all set!" + **Confirm**.
- **Make your character** (Create my character): "Create front, side, and back views of your character for consistent results."; description field "Describe the image you want to create, including the subject, style, mood, and details.." with **0/1000** counter and Clear; **Gender*** (Female / Male / Others), **Ethnicity*** (Asian / White / African / Hispanic …), **Age*** (0–100); "Upload 1 reference photo" (Add Media: Photos / iStock / GIPHY); **Generate ◆7**. Rules: text **or** photo is enough to generate; gender/ethnicity/age required; confirm or X both save the generated character. 10/13 update: X with any input → **"Discard this character? / What you've entered won't be saved." Discard / Keep editing**; leaving does not save.
- **Reference photo checks**: multiple people → warning, not blocking: "More than one person detected / For the best result, use a photo with just one person." **Generate anyway / Use another photo**; celebrity → blocked: "This photo can't be used / It looks like a real public figure. Please try another photo."; no person → "No person detected / Results may not turn out well. Want to try anyway?".
- **Character card menu**: Delete → "Delete this character? / This character will be permanently deleted and can't be recovered." Cancel / Delete; **CL stock characters cannot be deleted**; Report → Send Feedback form (AI Issues, AI Feature Name*, What is the issue?*, What prompt did you use?, Submit).
- **Storyboard**: "The characters look great! Ready to create the storyboard?" → Create storyboard ◆15 Generate → "Thinking..." (pricing; storyboard price = {n} panel images + TTS used by the animatic) → leaving while generating shows Stop and lose your credits? (Leave anyway / Keep Generating) → "Here's your storyboard" + Storyboard Result (View more) + **Storyboard Preview** ("<title> 1:30 / See your story as pictures with a voice telling it. The real video comes next." / "See how your story flows before generating the full video" + Create video).
- **Video settings**: "Choose your video settings": Model Seedance 2.0 ("Best for cinematic, beautiful, high-detail videos") / Seedance 2.0 Mini ("Best for speed, value, and quick drafts"); Video length Preview • 30 sec / Full Video • 90 sec; **Generate Video ◆120** (2.0) / **◆60** (Mini) for the preview. Status "I'll create a video - give me a moment..."; result "Here's your drama." then "Looking good! Ready for the full video?" + Create the full episode (90 sec) ◆120; "Continue making next episode".
- **Leaving during video generation (10/13 update)**: toast "We'll keep making your video. Find it in History." (video keeps generating in background) + the first time only, a blue bubble hint under the History button "Find your video here in History." — tap anywhere or History to dismiss; never shown again.
- **Result**: **Full Edit** (independent video clips, 6 scenes = 6 clips) and **Export Full Video** (one flattened video); failed video clip default duration 15 s; Auto Edit autoplay rule (tap thumbnail to seek timeline); when captions are on, download includes captions.
- Open items on the board: ref. image fail?, preset by age/gender, animatic TTS/STT fail?, voiceover preset; "Not in the free trial".

## Design — MX Spec Link (`ds-mx-link`)
- **First three creations free**: the action card reads "Free for your first 3 creations - 3 left." (count decreases).
- **Enough credits**: confirmation before spending — "You'll have {n} left" + **Confirm** (e.g. "You'll have 160 left").
- **Not enough credits**: card shows "Not enough credits / {X} credits needed. You have {Y} credits left." (e.g. "15 credits needed. You have 0 credits left.", "360 credits needed. You have 160 credits left.") + **Buy Credits** → "Top up your credits" sheet (packs $9.99 / $17.99 / $31.99 / $69.99 / $119.99 / $199.99; "The expiration period for consumed credits is one year."; Privacy Policy / Terms of Use).
- **Free daily chat limit**: "Daily Free Chat Limit Reached / You have used up your AI Mini Drama free chats. To keep chatting, please upgrade to Premium." + **Upgrade to Premium**.
- **Paid daily chat limit**: "Today's AI Chats Are Used Up / They'll refresh tomorrow, and we'll be ready to chat again." + **Continue Tomorrow**.
- Server busy state also referenced (DRI261894P0022 image link).

## Design — Recent Task (`ds-recent-task`)
- History page: empty state "No dramas yet / Start a story with AI. Every drama you create will be saved here."; first visit shows the hint bubble "To keep the file lightweight, we kept only the generated story outline, images and videos."
- Card: thumbnail, "2026/08/19 10:51 AM", title, size "456 MB", ⋮ menu (**Rename**, **Delete**). Thumbnail = first storyboard frame once a storyboard exists.
- **Manage** → checkboxes, **Select All** ↔ **Deselect All**, **Cancel**.
- Reopening restores the stage reached: story outline (Story Outline & Characters Result + "Choose your characters"), storyboard (Here's your storyboard, Storyboard Result, Storyboard Preview, "Choose your video settings"), finished video ("Here's your drama.").
- (Older frame shows the format answer with "2. Aspect ratio: 9:16" — superseded by the format card without aspect ratio.)

## PM — 10/2 update board (`pm-update-3`): §13.10 partial character failure, §13.11 1000-char limit, chat storyboard image update
- **§13.10 (#228) Generating several characters, some fail**: (1) successful characters are applied to their slots; failed ones are refunded and their slot shows "!". (2) Dialog **"Couldn't create some images" / "{n} characters couldn't be created. Your credits have been refunded. Tap a character to try again."** (tapping lands on that character). (3) After closing: "{n} characters aren't set yet / They need a look before you can continue." with Generate with AI ◆6*n / Choose myself; the failed characters can be regenerated or picked from the library.
- **§13.11 (#229–#231) 1,000-character limit on every description input** (chat idea box, character description, scene description, video description…): at the limit the counter turns red "1000/1000" and no more input is accepted; pasted text beyond the limit is cut; message "You've reached the 1,000-character limit."; deleting below 1000 removes the red counter and the message.
- **Updating storyboard images through chat (J1–J5)**: after the storyboard, user asks Iris in the input (e.g. "I'll update the image for Scene 5.") → (1) Iris replies with an action card **Update storyboard images · ◆credits · Generate** to confirm the charge; 2 credits per image, preview updated too, priced like the storyboard (by action id). (2) Generate → card disappears; a new AI message at the bottom carries the same storyboard card (Storyboard Result + Storyboard Preview); the scenes being changed and the preview show skeletons, others display normally. (3) When done, skeletons are replaced by the new images and the earlier storyboard card above updates too (only the latest is kept). (4) Leaving while generating → Stop and lose your credits? (short task, no refund). (5) Partial failure: successful images update; failed ones are refunded, marked "!", red text + Edit: "1 image couldn't be updated. Your credits have been refunded. Tap Edit to try again, or tell me what to change."

## PM — 1002 update (`pm-1002-update`): 10/1 meeting feedback, UX-states spec §13
Layout: left→right = steps; down a column = other states of the same step; green labels = not yet defined in spec.
- **§13.1 Character bubble hint**: in Change Characters, after setting any character a hint bubble points to the **next unset character slot** (look right first; if all to the right are set, the first unset one on the left): "Tap to choose a look for {name}". It disappears when any slot is tapped or after 5 s; not shown once all are set.
- **§13.2 Scrolling + ↓**: chat does **not** auto-scroll to the bottom. When the user scrolls up or a new message arrives off-screen, a **↓** button appears (no unread count); tapping ↓ scrolls smoothly to the bottom and ↓ disappears. Returning from Character Library / Full Edit / History keeps the position the user left.
- **§13.3 Offline / credit failures on action cards**: the card reappears with red text "You're offline. Check your connection and try again."; insufficient credits → the purchase flow in the design spec. Exception: the format card — after Continue it becomes the user bubble (1. Video language / 2. Captions).
- **Charges are by action id**; storyboard = 2 credits per image, total depends on how many images the AI produced (can be re-tapped directly).
- **§13.6 Short tasks** (generations that stop when you leave): one dialog and one copy for all — "Stop and lose your credits? / This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded." Leave anyway / Keep Generating. The storyboard preview is produced together with the storyboard (no separate generating state). Outline → "Leave this chat?" (free; says it won't be saved).
- **§13.7 Error copy table (new copy)** — card small text always starts with "Your credits have been refunded." then the next step (refund must be visible, not only behind ⓘ):
  - 4xxx (blocked content): "Couldn't create {image/video}. The description may not meet our terms of service. Your credits have been refunded. Edit the description and try again."
  - 5xxx (service busy): "Couldn't create {image/video}. Our service is busy right now. Your credits have been refunded. Try again later."
  - 6xxx at the moment (video upload failed): "Your video didn't finish saving. Tap Retry - you won't be charged again." + Retry.
  - 6xxx after 3 h: "We couldn't finish this video. Your credits have been refunded. Edit the description and try again."
  - Storyboard preview failure: "Couldn't create the storyboard preview. Your credits have been refunded. Try again."
  - Chat, some videos failed: "{n} scenes couldn't be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change." (Edit button below; Edit stops at the first failed scene).
  - Character generation failure dialog: "We couldn't create this character. Your credits have been refunded. Try again." (partial failures: #228 flow).
  - NOTE: later 10/6 and 10/13 frames on the Error Handling board use different card copy (e.g. 4xxx "Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result."). Newest frame wins; record the conflict.
- **§13.8 Video regeneration**: keep the video preview UI; a message under the card gives the state. F1 regenerating: the old version stays playable (download/Export unavailable during regeneration); F2 done: replaced by the new version + "Your video has been updated." (message disappears after the video is played or the chat is left). Failure uses the §13.7 chat partial-failure copy and keeps the old version.
- **Scene image regeneration (D2)**: the image area shows a skeleton animation while regenerating.
- **E4**: storyboard preview failure card; "Create video anyways" offered when some scenes are missing.

## PM — 10/5 bug-mapping board (`pm-update-4`)
Spec decisions for filed bugs (0018, 0012, 0014 "spec 已定"; 0017, 0016, 0015, 0013 added 10/5):
- **Bug 0018** Back during generation left with no confirmation → before the outline exists show "Leave this chat? / Your story outline isn't ready yet, so this chat won't be saved." Leave anyway / Stay. Leave anyway stops generation and does not save (spec copy wins over the bug's "Stop generating?").
- **Bug 0012** Leaving before the outline saved a blank task → only after the outline is there is it saved to History; leaving before the outline (Leave anyway, or app swiped away) saves nothing and no History entry appears. Leaving after the outline saves; reopening stops at the latest step.
- **Bug 0014** Same-day tasks all named "AI Drama MMDD" → name = drama title; follows title changes; a user Rename wins.
- **Bug 0017** Delete dialog → single "Delete this drama? / "{Drama title}" and its videos will be permanently deleted."; Manage multi-select keeps "Delete {n} dramas? / These chats and their videos will be permanently deleted." (no names).
- **Bug 0016** Rename with empty name → §9: Rename pre-fills the current name; when the name is empty or only spaces **OK is disabled (grey)**; saving trims leading/trailing spaces; after rename History, toast and push use the new name (§6.4).
- **Bug 0015** Merely opening a task moved it to the top and changed its size → §9: History sorts by **last modified time**, newest first. Counts as modified: new content (outline / characters / storyboard / video), regeneration, Rename, editing in Full Edit. **Not** modified: only opening, browsing, playing, scrolling, downloading — these do not change order, card time or file size.
- **Bug 0013** History hint bubble could not be closed by tapping outside and covered the first card → tapping anywhere outside the hint closes the bubble hint.

## Design — Video (`ds-video`)
- Video settings card: "Choose your video settings", Model Seedance 2.0 / Seedance 2.0 Mini (+ descriptions), Length Preview • 30 sec / Full Video • 90 sec (frames also show 120 sec, "Length: Full Video • 120 sec"), **Generate ◆360** in one frame. Status "I'll create a video - give me a moment...".
- Result: "Here's your drama." video card, **Full Edit / Export Full Video**; then "Ready for the next episode?" + **Create Next Episode**. Playback: tapping Preview pauses.
- **Scene video failure**: card "Couldn't create scene ⓘ / Something went wrong. Give it another try." + **Retry**; after a failed retry "Couldn't create scene / Retrying didn't work. Try a different description." + **Edit** → description editor with counter (e.g. "967/1000") + **Done** → **Regenerate scene ◆30**. The video's bottom-right download icon is hidden for failed scenes.
- **Chat with failed scenes**: "{n} scenes couldn't be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change." and banner "ⓘ 2 scenes couldn't be generated. / Fix these issues to export your drama." + **Fix scenes** (DRI261893-0065, 1006 update).
- **Video all fail (1012 update)**: "Something went wrong on my end." + "ⓘ Video couldn't be created. Try creating your video again." + **Try again**.
- **Captions**: "Adding captions…" state; failure "Captions couldn't be added. Try again" (+ Try again).
- **Regeneration**: "Your video will refresh when it's done."

## PM — 10/6 decisions board (`pm-update-5`, "10/6 定案", notification "10/8 定案")
- **v1 error copy**: all errors use the hard-coded **5xxx** copy for now — "Couldn't create {image/video} · Your credits have been refunded. The service is busy - try again later." + **Retry**. The 4xxx-specific copy (terms of service, "Edit the description…") and the ⓘ dialog are **deferred to a later version**. CONFLICT: the 10/13 frames on the Error Handling board add violation examples to the 4xxx dialog and remove ⓘ only from the 5xxx card → open question which applies to this build.
- **§5 (10/6) offline**: tapping a button / sending with no network → toast "You're offline. Check your connection and try again." (replaces the inline message); nothing is sent, nothing charged, the card stays.
- **§6.1 (10/6) History card while video is generating**: shows only "processing..", no progress bar (deliberately different from other AI tasks).
- **§8 (10/6) download**: usually fast; no progress dialog (removed); download button shows a spinner (Comment #235); toast "Saved to your device."
- **#7 Regenerating storyboard images** (chat request to Iris or Regenerate Image in the scene editor): TTS and the animatic (Storyboard Preview) are always regenerated with them, so the animatic is never stale (Comment #236). Animatic regeneration failure shows the Storyboard preview error.
- **§13.13 #1 #8 #237 Auto captions failure and retry (10/6)**: if any STT (auto captions) segment fails, the whole video gets **no** captions (never partial). Below the video card: "Captions couldn't be added. Try again" + Try again → "Adding captions…"; retry reruns only the failed segments and the captions appear only when all succeed; if the retry fails again it returns to the error with Try again. With "No captions" chosen, STT does not run and the video has no captions.
- **#238 (10/6) Storyboard Preview captions**: the animatic (storyboard preview video) always has captions regardless of the format card; Captions Yes/No only affects the final video.
- **9:16 preview error states**: errors stay inside the frame — icon, title, description, button (if any), centred top to bottom; ⓘ removed (v1); title/description wrap to the frame with 12 px side padding. Failed thumbnails keep only the ⟳ icon.
- **#4 Notification (10/8)**: the in-app toast / push is sent once, only when the whole video is done (every scene succeeded); 6xxx auto-retry in progress doesn't count (sent after a successful retry); partial or total failure: no notification.
- 6xxx copy: "Your video didn't finish saving. Tap Retry - you won't be charged again."

## PM — 10/14 update: changing characters in conversation (`pm-update-7`)
- When the user asks for a change in chat (story or characters), Iris replies and **re-issues the "Story Outline & Characters" card**.
- If a character's role/appearance changed: character images cannot be redrawn yet; images and switch icons stay as they are and generic copy is added (no character named):
  - Iris reply: "Got it! I've updated the story. I can't redraw characters yet - tap the switch icon on a character to change its look."
  - Blue text under Characters Result: "Character looks aren't updated automatically. Tap the switch icon to change a character's look."
  - After the card: "Switch any looks you'd like, then create the storyboard." + Create storyboard · Generate.
- Story-only change: no hint; the card is followed by the usual "The characters look great! Ready to create the storyboard?".
- Older cards: the previous Story Outline & Characters card stays but **without switch icons**; the previous Create storyboard action card is hidden (only the latest one shows).
- P2 (later): regenerate character images (TTI) directly from the conversation.

## PM — Error / Location update board (`pm-update-6`, 10/8 – 10/14)
- **10/14 update**: the 4xx scene-image card copy changes to the moderation version — "Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result." — consistent with the ⓘ dialog "Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again." + Got it. (10/13: 4xx dialog adds violation examples; 5xx card has no ⓘ: "Couldn't create image / Your credits have been refunded. The service is busy - try again later.") ⇒ newest decision: 4xx card + ⓘ dialog **are** in scope (supersedes the 10/6 "5xxx copy only" note).
- **Location thumbnail (10/8 add, 10/12 update)**: in the Scene editor, directly under the main image, a reference row "[thumbnail] Location"; thumbnail 32×57 (9:16). It is reference info, not a tab: not tappable, not enlargeable, cannot be regenerated alone; the main image width is unchanged.
  - States: generating = skeleton; success = location image; failure = pink icon + "Location • Failed".
  - Generation order: the AI makes the location image first, then the main image with people. If the location fails, the main image always fails; if the location succeeds, the main image may still fail. While generating: location thumbnail appears first, main image keeps loading.
  - Repair always via Edit/Retry on the main image's error card: main image failed only → regenerate only the main image, reuse the location, charge 1 image; **location + main image failed** → the regenerate page shows the button directly and charges 2 images, with the note above the button "The location and scene image will both be regenerated (2 images)." + **Regenerate Image ◆12** (vs ◆6 for one).
  - 10/8 decision: the location is regenerated only on failure (1 or 2 images), charged for real.
- Scene editor: description with "967/1000"-style counter, **Regenerate Image ◆6**; failed main image shows the error card with **Edit**.
- Storyboard Preview with missing images: "Storyboard preview unavailable. Complete the image generation above first to view the preview."

## Design — Template Detail (`ds-template-detail`)
- **All categories page** (More >): header back · credit pill · History icon; categories with icons, each a horizontal row of covers + names: **Office Romance** (The New Guy's Secret, Forbidden Office Romance, The Heir of the Merging Company, Boss…), **Fantasy World** (The Villainess Rewrite, Vow of the…, The Hero Party's…, Battlefield King…), **Urban Romance** (The House We Both Wanted, The Idol's Secret Girlfriend…), **Family & Life** (Proposal Across Every Lifetime, Six Things You Didn't Know, The Dog Who Remembered Her…), **Animated Stories** (The Butler's Forbidden Love, Encounter After Closing…). (The design file itself labels "Six Things You Didnt Know" without the apostrophe.)
- **Template detail page**: full-height video of the template (W897 H1596), plays by default with volume on; tap → pause & volume off variant shown; **Make my version** button; same header (back, credits, History); separate layout for short devices; dark and light mode frames.

## Design — Home page / Custom detail / Chat room detail (`ds-home-custom-chat`)
- **Home page** (dark + light; short-device layout): header back · credit pill · History; "Hi, I'm your AI Drama Assistant", "Describe your idea and watch it come to life as a short drama.", **Create Your Drama**, "Start from a template" + More, template grid (2 rows × 3).
- **Custom detail** (composer): untyped state shows "Surprise me" + inspiration chips (e.g. "The celebrity turns admiration into forbidden love"); with keyboard; tallest text box state; **at the 1000-character maximum a toast "You've reached the maximum length"** (older frame; the 10/2 §13.11 rule shows an inline "You've reached the 1,000-character limit." with red "1000/1000" instead → conflict, newest = §13.11); when the keyboard closes the input collapses to **at most 3 lines**.
- **Chat room detail**: Storyboard Preview card ("<title> 1:30 / See your story as pictures with a voice telling it. The real video comes next."), "More ideas +" chip above the input, placeholder "Enter your idea to create drama".

## Design — Storyboard (`ds-storyboard`)
- Flow: "The characters look great!…" → **Yes, create storyboard** → "Here's your storyboard" → **Storyboard Result** (scene cards "Scene 1 - The Ban Is Announced…", **View more >**) + **Storyboard Preview** card + "Choose your video settings".
- **Scene detail**: X, "Scene N", ‹ ›, main image, **Location** row (1012 update: 9:16 thumbnail + Location image; location success/failure states), title + script; long text scrolls on long-press drag ("文字過長可長按滑動範圍"); Storyboard Preview player shows time "00:40/01:30".
- **Scene image errors**: 4xx card "Couldn't create image ⓘ" + ⓘ dialog "Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service. Edit it below and try again." + Got it; 5xx card "Couldn't create image / Your credits have been refunded. The service is busy - try again later."; **Edit** → description editor with counter ("967/1000") + **Done** → **Regenerate Image** (◆6 per image; **◆12** when location + scene both regenerate; note "Charge 6 credits per image").
- **Storyboard Preview errors**: images missing → "ⓘ Storyboard preview unavailable. Complete the image generation above first to view the preview."; TTS fail → "ⓘ Storyboard preview unavailable. Some credits were refunded. Try again to generate the preview." + **Retry** (older copy; PM §13.7 copy "Couldn't create the storyboard preview. Your credits have been refunded. Try again."); STT fail → "ⓘ Storyboard preview unavailable. Try again to generate the preview." + Retry.
- **Storyboard all fail (1012 update)**: "Something went wrong on my end." + "ⓘ Storyboard couldn't be created. Try creating your storyboard again." (+ Try again).
- Thumbnails 9:16 (1006 update).

## Design — Characters (`ds-characters`, 1005 / 1008 / 1014 updates)
- Change Characters ("Choose your characters"): picked slot renames the title ("Choose for {name}"); unselected slots default to the placeholder; hint "Tap to choose a look for {name}"; info line "Character looks aren't updated automatically. Tap the switch icon to change a character's look."; "Switch any looks you'd like, then create the storyboard."
- Unset characters: "Finish your characters ⓘ" sheet, "1 character isn't set yet" / "{n} characters aren't set yet", "Add a look to continue." / "Each one needs a look before you can continue."; per-character **Generate ◆6**, multiple **Generate all ◆18** (6 × n).
- Older leave dialog "Leave without finishing? / If you leave now, your picks won't … / Keep choosing" — superseded by the newer "Discard character changes?" frames (cases follow the newer copy).
- Credits: not enough → "Top up your credits" / "XX credits needed. You have XX credits left."; confirmation lines "You have 182 credits left" / "You have 5 credits left" + "The expiration period for consumed credits is one year." with Privacy Policy / Terms of Use (relates to Q-3).
- Create my character: "Tell us what {name} looks like - the more detail, the better.", example placeholder, (optional) photo upload with "Drag and pinch to adjust how the clip fits within the frame", **AI Suggestion** (Gender / Ethnicity), **Save to library**, "Create front, side, and back views of your character for consistent results.", Generate ◆6; tapping text or the expand icon opens the full editor; 1000-char limit "You've reached the 1,000-character limit." / "Exceed word limit".
- Library filter includes "My characters only"; stock vs uploaded image tag (thumbnail lower-left tag).
- Errors: 4xx "Couldn't create image ⓘ / Try editing the description for a different result."; 5xx "The service is currently busy. Try again later."; single failure "We couldn't create this character and your credits have been refunded. Try again later."
- Not yet in the draft (possible additions on review): Generate all ◆18 price, AI Suggestion, Save to library, "My characters only" filter.

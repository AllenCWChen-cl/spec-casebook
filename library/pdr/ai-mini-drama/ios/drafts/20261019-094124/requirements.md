# AI Mini Drama — requirements (ios)
Spec: AI Mini Drama - PM spec.pdf, AI Mini Drama - Design Spec.pdf (spec set specs/2026-10-16; board notes in specs/2026-10-16/extracted/board-notes.md)
Source tags: [PM:<board>] / [DS:<board>] = board id in specs/2026-10-16/extracted/boards/. Newest dated frame wins when frames disagree.

## Entry and landing
- R-001 [PM:pm-main-flow] The Launcher shows an "AI Mini Drama" shortcut (small shortcuts, 4th) that opens AI Mini Drama.
- R-002 [PM:pm-0930-updates] The Launcher hero banner "AI Mini Drama with Seedance 2.0 >" opens AI Mini Drama.
- R-003 [DS:ds-home-custom-chat] The landing page shows "Hi, I'm your AI Drama Assistant", "Describe your idea and watch it come to life as a short drama.", a "Create Your Drama" button, "Start from a template" with "More", and a template grid; the header has back, credit pill and History.
- R-004 [PM:pm-main-flow] "More" is hidden when there are fewer than 6 templates.
- R-005 [PM:pm-top-mockups][DS:ds-mx-link] The credit pill shows the current credit balance.

## Templates
- R-006 [DS:ds-template-detail] "More" opens the all-categories page: categories with icon and name (Office Romance, Fantasy World, Urban Romance, Family & Life, Animated Stories), each a row of template covers with names.
- R-007 [DS:ds-template-detail] Tapping a template opens its detail page: the template video plays automatically with sound, and a "Make my version" button is shown.
- R-008 [DS:ds-template-detail] Tapping the playing template video pauses it (pause & volume off state).
- R-009 [PM:pm-main-flow] "Make my version" starts a chat for that template and asks the format question before generating the outline.
- R-010 [DS:ds-template-detail] Template names are spelled correctly (e.g. "Six Things You Didn't Know"). — Open question Q-1.

## Idea input (composer)
- R-011 [PM:pm-main-flow] "Create Your Drama" opens an empty chat with the input placeholder "Enter your idea to create drama" and a mic button.
- R-012 [PM:pm-main-flow][DS:ds-home-custom-chat] Before typing, the composer shows "Surprise me" and two inspiration chips from CMS.
- R-013 [PM:pm-main-flow] Tapping an inspiration chip puts its text into the input.
- R-014 [PM:pm-main-flow] "Surprise me" puts a random inspiration (from a pool of 10) into the input; tapping it again appends to the existing text instead of replacing it.
- R-015 [PM:pm-update-3] The idea input accepts at most 1,000 characters: at the limit the counter shows red "1000/1000", further typing is ignored, pasted text beyond the limit is cut, and "You've reached the 1,000-character limit." is shown; deleting below 1,000 removes the red counter and the message. (Older DS frame: toast "You've reached the maximum length" — Q-2.)
- R-016 [DS:ds-home-custom-chat] After the keyboard closes, a long input collapses to at most 3 lines.
- R-017 [PM:pm-top-mockups] Once the chat has content, a "More ideas +" chip shows above the input.

## Format card
- R-018 [PM:pm-0930-updates] After the first idea is sent the assistant asks "What format would you like for your video?" with 1. Video language (English, Spanish, French, German, Japanese, Korean, Chinese) and 2. Captions ("Yes, include captions" / "No captions"), single choice per group, and a Continue/Generate button; no aspect-ratio question.
- R-019 [PM:pm-1002-update] After the button the card is replaced by a user bubble "1. Video language: <x> / 2. Captions: <Yes|No>".

## Story outline
- R-020 [PM:pm-0930-updates] While the outline is generated the chat shows status text ("I'll create a story outline - give me a moment..." / "Writing your story...").
- R-021 [PM:pm-main-flow] The outline result is a "Story Outline & Characters Result" card: Story Outline text plus "Possible Characters:" with a description per character and a character slot row.
- R-022 [PM:pm-update-4] Back / New Chat / History before the outline exists shows "Leave this chat? / Your story outline isn't ready yet, so this chat won't be saved." with Leave anyway / Stay.
- R-023 [PM:pm-update-4] Stay keeps the user in the chat and the outline keeps generating.
- R-024 [PM:pm-update-4] Leave anyway stops generation; the chat is not saved and does not appear in History.
- R-025 [PM:pm-update-4] Leaving after the outline exists saves the chat to History without a dialog; reopening it returns to the latest step.
- R-026 [DS:ds-extra][PM:pm-0930-updates] Outline 5xxx failure shows the assistant message "Something went wrong on my end. Let's try that again." with Try again, which resends the original idea and format.
- R-027 [DS:ds-extra][PM:pm-0930-updates] Outline 4xxx failure shows "I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way." with no button; the next idea reuses the chosen format without showing the format card again.
- R-028 [PM:pm-update-5][DS:ds-extra] Sending an idea or tapping an action button while offline shows "You're offline. Check your connection and try again." — nothing is sent and nothing is charged; the card stays (Try again for a sent idea).

## Characters (choose)
- R-029 [PM:pm-main-flow] Tapping a character slot opens "Change Characters" with the cast tabs, "Character Library" (Create my character tile, library cards with "My character" tags) and a filter.
- R-030 [PM:pm-1002-update] After a character is set, a hint "Tap to choose a look for {name}" points to the next unset slot (right first, then the leftmost); it disappears when any slot is tapped or after 5 s, and never shows once all are set.
- R-031 [PM:pm-main-flow] The filter offers My characters only, Gender, Ethnicity and Age; applied filters show as removable chips.
- R-032 [PM:pm-main-flow] Leaving the picker with unsaved picks asks "Discard character changes? / The characters you picked here won't be saved if you leave." Discard / Keep Editing.
- R-033 [PM:pm-main-flow] Confirming with unset characters shows "{n} characters aren't set yet / They need a look before you can continue." (singular "1 character isn't set yet / It needs a look…") with "Generate with AI ◆6×n" and "Choose myself".
- R-034 [PM:pm-main-flow] "Generate with AI" shows "Generating..." then "Your character is all set!" / "{n} characters are all set!" with Confirm.
- R-035 [PM:pm-update-3] When some characters fail, successful ones are applied, failed slots show "!" and are refunded, and "Couldn't create some images / {n} characters couldn't be created. Your credits have been refunded. Tap a character to try again." is shown.
- R-036 [PM:pm-error-handling] A single character failure shows "Couldn't create image / We couldn't create this character. Your credits have been refunded. Try again." with Got it, which returns to Change Characters.
- R-037 [PM:pm-top-mockups] With every character set, the assistant says "The characters look great! Ready to create the storyboard?" with a Create storyboard card (price + Generate).
- R-038 [PM:pm-update-7] When the user changes the story or a character in chat, Iris re-issues the "Story Outline & Characters" card; a character change adds "Got it! I've updated the story. I can't redraw characters yet - tap the switch icon on a character to change its look.", blue text "Character looks aren't updated automatically. Tap the switch icon to change a character's look." and "Switch any looks you'd like, then create the storyboard."
- R-039 [PM:pm-update-7] Older outline cards stay but lose their switch icons; only the newest Create storyboard card is shown.

## Make your character
- R-040 [PM:pm-main-flow] "Create my character" opens "Make your character": "Create front, side, and back views of your character for consistent results.", description field with counter 0/1000 and Clear, Gender* (Female/Male/Others), Ethnicity*, Age* (0–100), "Upload 1 reference photo", Generate ◆7.
- R-041 [PM:pm-main-flow] Either a description or a reference photo is enough to generate.
- R-042 [PM:pm-main-flow] Gender, Ethnicity and Age are required; Generate stays disabled until they are set.
- R-043 [PM:pm-update-3] The description accepts at most 1,000 characters with the same red counter and "You've reached the 1,000-character limit." behaviour as R-015.
- R-044 [PM:pm-main-flow] A reference photo with several people warns "More than one person detected / For the best result, use a photo with just one person." with Generate anyway / Use another photo (not blocking).
- R-045 [PM:pm-main-flow] A reference photo with no person warns "No person detected / Results may not turn out well. Want to try anyway?".
- R-046 [PM:pm-main-flow] A celebrity photo is blocked: "This photo can't be used / It looks like a real public figure. Please try another photo."
- R-047 [PM:pm-main-flow] 10/13: X with any input asks "Discard this character? / What you've entered won't be saved." Discard / Keep editing; X with nothing entered closes directly.
- R-048 [PM:pm-main-flow] A generated character is saved to the library ("My character") whether the user confirms or closes with X.
- R-049 [PM:pm-main-flow] A user character card's menu offers Delete ("Delete this character? / This character will be permanently deleted and can't be recovered." Cancel / Delete) and Report; CyberLink stock characters have no Delete.

## Storyboard
- R-050 [PM:pm-main-flow] Create storyboard → "Thinking..." while priced, then generation; price = images (2 credits each) + TTS for the animatic.
- R-051 [PM:pm-1002-update] Leaving while the storyboard (or a character) is generating asks "Stop and lose your credits? / This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded." Leave anyway / Keep Generating. Leaving during "Thinking..." (pricing) shows no dialog.
- R-052 [PM:pm-0930-updates] After leaving a storyboard generation (or the app being killed), reopening from History stops at the storyboard offer; Generate re-prices and charges again.
- R-053 [DS:ds-storyboard] A finished storyboard shows "Here's your storyboard", a Storyboard Result card (scene cards with 9:16 thumbnails, View more >) and a Storyboard Preview card.
- R-054 [DS:ds-storyboard] View more / a scene card opens the scene detail: X, "Scene N", ‹ › to move between scenes, main image, Location row, title and full script.
- R-055 [PM:pm-update-6] The Location row sits under the main image (thumbnail 32×57, label "Location"); it cannot be tapped, enlarged or regenerated alone.
- R-056 [PM:pm-update-6][DS:ds-storyboard] A 4xx scene-image failure shows "Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result." with Edit; ⓘ opens "Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again." with Got it and a terms-of-service link.
- R-057 [PM:pm-update-6] A 5xx scene-image failure shows "Couldn't create image / Your credits have been refunded. The service is busy - try again later." with no ⓘ.
- R-058 [PM:pm-update-5] Failed scene thumbnails in the Storyboard Result show only the ⟳ icon (no "Regenerate" text).
- R-059 [DS:ds-storyboard] Edit opens the description editor (counter x/1000, Done) and Regenerate Image ◆6; when the location and the scene both failed it notes "The location and scene image will both be regenerated (2 images)." and charges ◆12.
- R-060 [PM:pm-1002-update] While a scene image regenerates the image area shows a skeleton; the scene keeps its old content until done.
- R-061 [PM:pm-update-3] Asking Iris in chat to change storyboard images first returns an "Update storyboard images" action card (price, Generate); 2 credits per image.
- R-062 [PM:pm-update-3] After Generate the card disappears, a new message with the storyboard card appears at the bottom, the changed scenes and the preview show skeletons, and on completion the earlier storyboard card above updates too.
- R-063 [PM:pm-update-5] Regenerating storyboard images also regenerates the TTS and the Storyboard Preview.

## Storyboard Preview
- R-064 [DS:ds-storyboard] The Storyboard Preview card shows the drama title, duration and "See your story as pictures with a voice telling it. The real video comes next."; playing it shows a narrated slideshow.
- R-065 [PM:pm-update-5] The Storyboard Preview always has captions, whatever was chosen on the format card.
- R-066 [PM:pm-error-handling] With missing scene images the preview shows "Storyboard preview unavailable. Complete the image generation above first to view the preview." and no generate button.
- R-067 [PM:pm-1002-update] A preview (TTS) failure shows "Couldn't create the storyboard preview. Your credits have been refunded. Try again." with Retry.

## Video settings and generation
- R-068 [PM:pm-main-flow] After the storyboard the assistant shows "Choose your video settings": Model Seedance 2.0 ("Best for cinematic, beautiful, high-detail videos") / Seedance 2.0 Mini ("Best for speed, value, and quick drafts"); Video length Preview • 30 sec / Full Video • 90 sec; Generate Video with price.
- R-069 [PM:pm-main-flow] The price changes with model and length (e.g. Seedance 2.0 preview ◆120, Mini ◆60).
- R-070 [PM:pm-0930-updates] The first time the user generates a video, "Get notified when your video is ready? / Videos take a few minutes. We'll let you know as soon as yours is done." appears with Notify me (then the system permission) / Not now (never shown again).
- R-071 [PM:pm-main-flow] Leaving the chat while a video is generating shows the toast "We'll keep making your video. Find it in History." and the video keeps generating.
- R-072 [PM:pm-main-flow] The first time this happens a blue bubble "Find your video here in History." appears under the History button; tapping anywhere or History dismisses it and it never appears again.
- R-073 [PM:pm-update-5] While a video generates, its History card shows "processing.." without a progress bar.
- R-074 [PM:pm-0930-updates] When the video finishes while the user is elsewhere in the app, a toast "Good news! Your "{Drama title}" is ready. Tap here to view your results." appears with Close / View (View → History); none on failure; only once all scenes succeeded.
- R-075 [PM:pm-main-flow] The finished preview shows "Here's your drama." with the video card, then "Looking good! Ready for the full video?" with "Create the full episode (90 sec)" and price.
- R-076 [DS:ds-video] A finished full video offers "Ready for the next episode?" / Create Next Episode.
- R-077 [PM:pm-main-flow] The result page has Full Edit (separate clips, one per scene) and Export Full Video (one flattened video).
- R-078 [PM:pm-0930-updates] Download shows no dialog: the button turns into a spinner, then the toast "Saved to your device."
- R-079 [PM:pm-main-flow] With captions on, the downloaded video contains the captions.

## Video errors
- R-080 [DS:ds-video][PM:pm-1002-update] When some scenes fail, the chat says "{n} scenes couldn't be generated. Your credits have been refunded. Tap Edit to regenerate, or tell me what to change." and the video card shows "{n} scenes couldn't be generated. / Fix these issues to export your drama." with Fix scenes.
- R-081 [DS:ds-video] A failed scene video shows "Couldn't create scene / Something went wrong. Give it another try." with Retry; a failed retry shows "Retrying didn't work. Try a different description." with Edit → description editor → Regenerate scene ◆30.
- R-082 [PM:pm-main-flow][DS:ds-video] A failed scene clip defaults to 15 s and hides the download icon.
- R-083 [DS:ds-video] When the whole video fails: "Something went wrong on my end." and "Video couldn't be created. Try creating your video again." with Try again.
- R-084 [PM:pm-1002-update] 6xxx (upload failed): "Your video didn't finish saving. Tap Retry - you won't be charged again." with Retry; after 3 h "We couldn't finish this video. Your credits have been refunded. Edit the description and try again."
- R-085 [PM:pm-1002-update] During video regeneration the old version stays playable; download/Export are unavailable until done; when done it is replaced and "Your video has been updated." shows.

## Captions
- R-086 [PM:pm-update-5] With "No captions" the final video has no captions (STT not run).
- R-087 [PM:pm-update-5] If any caption segment fails, the whole video has no captions and the card shows "Captions couldn't be added. Try again"; Try again shows "Adding captions…" and reruns only failed segments.

## Chat behaviour
- R-088 [PM:pm-1002-update] The chat does not auto-scroll; a ↓ button (no unread count) appears when new content is below the view, and tapping it scrolls to the bottom and hides it.
- R-089 [PM:pm-1002-update] Returning from Character Library, Full Edit or History keeps the chat at the position the user left.
- R-090 [PM:pm-top-mockups] Generation prompts and status lines use the assistant wording in the spec (e.g. "Characters updated! Regenerate the storyboard to match?").

## History
- R-091 [DS:ds-recent-task] Empty History shows "No dramas yet / Start a story with AI. Every drama you create will be saved here."
- R-092 [PM:pm-update-4] The first visit shows the hint "To keep the file lightweight, we kept only the generated story outline, images and videos."; tapping anywhere outside it closes it.
- R-093 [PM:pm-0930-updates] A card shows thumbnail (first storyboard frame once one exists), date and time, drama title (the title Iris generated) and size, with a ⋮ menu (Rename, Delete).
- R-094 [PM:pm-update-4] History is sorted by last modified time, newest first; only new content, regeneration, Rename and Full Edit edits count as modifications — opening, browsing, playing, scrolling and downloading do not change order, time or size.
- R-095 [PM:pm-update-4] Rename pre-fills the current name; OK is disabled for an empty or whitespace-only name; saved names are trimmed; the new name is used in History, toasts and pushes.
- R-096 [PM:pm-update-4] Deleting one drama asks "Delete this drama? / "{title}" and its videos will be permanently deleted." Cancel / Delete.
- R-097 [PM:pm-update-4] Manage allows multi-select (Select All / Deselect All / Cancel); deleting several asks "Delete {n} dramas? / These chats and their videos will be permanently deleted."
- R-098 [DS:ds-recent-task] Reopening a drama restores its latest stage (outline, characters, storyboard, video).

## Credits and limits (MX)
- R-099 [DS:ds-mx-link] The first three creations are free: action cards show "Free for your first 3 creations - {n} left."
- R-100 [DS:ds-mx-link] With enough credits, spending shows a confirmation "You'll have {n} left" with Confirm before charging. (PM 10/6 frames show direct Generate — Q-3.)
- R-101 [DS:ds-mx-link] Without enough credits the card shows "Not enough credits / {X} credits needed. You have {Y} credits left." with Buy Credits → "Top up your credits".
- R-102 [DS:ds-mx-link] Free users who reach the daily chat limit see "Daily Free Chat Limit Reached / You have used up your AI Mini Drama free chats. To keep chatting, please upgrade to Premium." with Upgrade to Premium.
- R-103 [DS:ds-mx-link] Paid users at the limit see "Today's AI Chats Are Used Up / They'll refresh tomorrow, and we'll be ready to chat again." with Continue Tomorrow.

## Open questions
- Q-1 Design labels the template "Six Things You Didnt Know" (no apostrophe); the cover art reads "DIDN'T". Which is intended? (R-010)
- Q-2 1,000-character limit feedback: older Design frame shows a toast "You've reached the maximum length"; PM §13.11 (10/2) specifies red counter + "You've reached the 1,000-character limit.". Cases follow §13.11. (R-015, R-043)
- Q-3 Credit confirmation: MX link shows "You'll have {n} left / Confirm" before spending; the PM chat frames show the action card's Generate charging directly. Cases follow MX (R-100).
- Q-4 Error copy: 10/6 decided v1 uses the 5xxx copy for every error and defers the 4xxx copy + ⓘ dialog; the 10/13–10/14 frames reinstate the 4xx moderation copy and ⓘ dialog. Cases follow the newest (R-056, R-057).
- Q-5 storyboard.all_videos.q and ladder.beat_video.q share the same English ("Every frame is done. Ready to create your video?") — intended?

## Added 2026-10-19 — spec agent coverage rules
Rules 1–10 are in the casebook skill (section "Coverage and verdict rules"). Rows for rules 4, 9 and 10 are not needed;
they change how runs are judged, ordered and deduplicated.
- R-104 [DS: flow arrow 2811-105834 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-105834] Filter panel open with Gender, Ethnicity and Age changed → Tap 「Clear」 → Every filter returns to its default: no Gender or Ethnicity selected, Age 1–100, My characters only off.
- R-105 [DS: flow arrow 2811-105838 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-105838] Choose Character open for one cast slot with filters applied → Tap a different cast slot → The heading changes to 「Choose for {name}」 for that slot and the filters reset to default.
- R-106 [DS: flow arrow 2811-90144 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90144] Finish your characters showing newly generated looks → Tap X on the sheet → The sheet closes back to Choose Character and the generated looks are not applied to the slots.
- R-107 [DS: flow arrow 2811-90585 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90585] Create my character with some description text → Tap the expand icon on the description → The full-screen description editor opens with the same text.
- R-108 [DS: flow arrow 2811-90145 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90145] Expanded description editor open with edited text → Tap the collapse icon → The editor closes back to Create my character and keeps the edited text.
- R-109 [DS: flow arrow 2811-90588 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90588] Expanded description editor open with edited text → Tap 「Done」 → The editor closes back to Create my character and keeps the edited text.
- R-110 [DS: flow arrow 2811-90468 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90468] Description longer than the visible area → Drag inside the description box → The text scrolls within its own area; the page does not move instead.
- R-111 [DS: flow arrow 2811-90584 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90584] Create my character open, empty → Tap 「AI Suggestion」 → A description is filled in and Gender, Ethnicity and Age are set, so Generate becomes available.
- R-112 [DS: flow arrow 2811-90586 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90586] Create my character open → Tap the Age field → A numeric keypad opens for Age (1–100) with a confirm control.
- R-113 [DS: flow arrow 2811-90587 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90587] Create my character open → Tap 「Reference (optional)」 → Select Media opens to pick a reference photo.
- R-114 [DS: flow arrow 2811-90589 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90589] Select Media open from Reference → Pick a photo → Crop opens with that photo and 「Drag and pinch to adjust how the clip fits within the frame」.
- R-115 [DS: flow arrow 2837-147745 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2837-147745] Crop open with a reference photo → Drag the photo, then pinch to zoom → The visible part of the photo moves and scales inside the frame for both gestures.
- R-116 [DS: flow arrow 2837-147912 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2837-147912] Crop open after adjusting the photo → Tap ✓ → Create my character shows the reference cropped as adjusted.
- R-117 [DS: flow arrow 2811-90147 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90147] Valid Create my character form → Tap Generate and wait → The loading state is replaced by the front/side/back views with 「Save to library」.
- R-118 [DS: flow arrow 2811-90591 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90591] Generated character shown → Tap 「Save to library」 → The character is saved to the library and applied to the cast slot being chosen.
- R-119 [DS: flow arrow 2811-90593 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90593] Generated character shown → Tap X instead of Save to library → The character is not applied to the cast slot.
- R-120 [DS: flow arrow 2811-90592 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90592] Character library shown → Tap the enlarge icon on a character → An enlarged preview of that character opens.
- R-121 [DS: flow arrow 2811-90216 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90216] Finish your characters with a balance below the Generate price → Tap Generate / Generate all → The credit panel opens instead of generating.
- R-122 [DS: flow arrow 3172-66578 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3172-66578] Create my character fails with a server error → Tap 「Got it」 → Create my character returns with the reference photo and description still filled in.
- R-123 [DS: flow arrow 2820-113560 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-113560] Storyboard Result shown → Tap a scene card (not View more) → Scene detail opens on that scene.
- R-124 [DS: flow arrow 2820-113559 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-113559] Scene detail with a long script → Drag inside the script → The script scrolls within its area.
- R-125 [DS: flow arrow 3142-70055 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3142-70055] Failed scene description editor open → Tap the collapse icon → Returns to the regeneration offer with the edited text.
- R-126 [DS: flow arrow 3142-70056 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3142-70056] Regeneration offer for a failed scene → Tap 「Regenerate Image」 → The scene shows a skeleton and regenerates; credits are charged once.
- R-127 [DS: flow arrow 2778-129154 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129154] Template drama with a finished storyboard → Generate the full video and wait → 「Here's your drama.」 shows the completed video with its Edit action.
- R-128 [DS: flow arrow 2820-115460 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-115460] Finished video in the chat → Tap Play on the video → The scene-video player opens and plays.
- R-129 [DS: flow arrow 4006-73627 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4006-73627] Scene video regenerating → Leave the scene editor and return to the chat → The existing video stays and the chat shows the scene-update status.
- R-130 [DS: flow arrow 4006-73628 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4006-73628] Scene video regenerating, user in the chat → Wait for regeneration to finish → The chat replaces the old video with the refreshed one.
- R-131 [DS: flow arrow 2820-116878 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-116878] Video with a failed scene clip → Tap Edit on the failed clip → The scene-video description editor opens.
- R-132 [DS: flow arrow 2820-118509 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-118509] Failed scene-video editor open with edited text → Tap the collapse icon → Returns to the regeneration offer with the edited text.
- R-133 [DS: flow arrow 2820-118510 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-118510] Failed scene-video editor open with edited text → Tap 「Done」 → Returns to the regeneration offer with the edited text.
- R-134 [DS: flow arrow 2820-116880 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-116880] Regeneration offer for a failed clip → Submit the regeneration → Clip generation starts for that scene.
- R-135 [DS:ds-video] Video result with failed scenes → Tap 「Fix scenes」 → The failed scene-video recovery view opens.
- R-136 [DS: flow arrow 4078-177645 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4078-177645] Caption retry in progress (「Adding captions…」) → Wait for it to succeed → The captioned video replaces it and 「Captions couldn't be added」 disappears.
- R-137 [DS: flow arrow 2831-134024 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2831-134024] A regeneration offer with a balance below its price → Tap the credit action → The top-up panel opens.
- R-138 [Rule 2: Stop notice] Stopping any running stage tells the user what stops and whether spent credits are lost, before or as it stops.
- R-139 [Rule 2: leave and return] Leaving AI Mini Drama and returning at any stage shows the same task in a recognizable, usable state; nothing saved is lost without notice.
- R-140 [Rule 2: wait thresholds (user, 2026-10-15)] A wait with no useful action other than leaving lasts at most 5 s without a waiting animation and at most 10 s with one.
- R-141 [Rule 3: regression list (ECL query 2026-10-19)] Every open or resolved-not-closed AI Mini Drama iOS eBug is rechecked each run; its Expect Result is the expected behavior unless the Design spec differs.
- R-142 [MX ① Free chat times, PDRM MX.pdf version A] Each tier has a remote-configured daily chat allowance (Free 10, Pro 30, Pro+ 100); opening a template, sending a typed message and tapping a task button each use one chat; the send after the allowance shows that tier's limit dialog.
- R-143 [MX ① Free chat times, PDRM MX.pdf version A] At the limit: closing the dialog keeps the chat and the unsent text; every further send shows the dialog again; opening a template enters the chat first, then shows the dialog.
- R-144 [MX ① Free chat times, PDRM MX.pdf version A] Subscribing from the limit dialog returns to the original chat with a Continue message; unused free chats are dropped and only the new tier's allowance applies.
- R-145 [MX ① Free chat times, PDRM MX.pdf version A] The chat count is kept on the device; deleting and reinstalling the app restores the free chats.
- R-146 [MX ② Charging flow, PDRM MX.pdf version A] When credits are short, a Paid user's card offers Buy Credit (Credit Panel opens on the 2000-credit pack) and a Free user's card offers Upgrade Now (subscription page); after buying, the charge is confirmed again; a card shown while short switches to the enough-credits copy when the user returns with enough credits.
- R-147 [MX ② First-time credit discount, PDRM MX.pdf version A] Only a Free user who subscribes during an AI Mini Drama session gets the credit discount, on that session's action ids, once per lifetime; a new session, a resubscription and any regenerate after one discounted drama are charged at full price; Paid users never get it.
- R-148 [Rule 6: complete template catalog (user, 2026-10-15 and 2026-10-19)] Every template in the frozen roster opens, shows its preview and Make my version, and completes its own journey to a playable final video.
- R-149 [Rule 7: text quality] Every product-authored text on every page and state is free of spelling, grammar and punctuation errors in ENU, CHT and JPN.
- R-150 [Rule 7: generated text] Generated storyboard text uses the requested language, has no empty fields, unintended repetition or garbled characters, and English output uses English quote marks.
- R-151 [Rule 8: colleague G01 custom media] The custom-character reference preview shows the selected photo, allowing for an explicit crop.
- R-152 [Rule 8: colleague O01 required fields] Each required character field omitted on its own blocks Generate; the feedback shown is recorded per field.
- R-153 [Rule 8: keyboard and layout] Entered text never overlaps adjacent controls, and editing can be finished and the task continued with the keyboard open or closed.
- R-154 [Rule 8: data-driven facets] Filter values match the attributes present in the character collection, including Southeast Asian and Mixed, and an empty result is shown clearly.
- R-155 [Rule 8: output reuse] A character created and saved in one drama can be found and applied in a later drama.

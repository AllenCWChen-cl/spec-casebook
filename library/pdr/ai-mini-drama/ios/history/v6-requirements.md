# AI Mini Drama — requirements (ios)
Spec: AI Mini Drama - Design Spec.pdf, PDRM MX.pdf, AI Mini Drama - PM Spec 20261021.pdf (spec set specs/2026-10-21-2; board notes in specs/2026-10-21-2/extracted/board-notes.md, flow arrows in specs/2026-10-21-2/extracted/arrows.json)
Source tags: [PM:<board>] / [DS:<board>] / [MX:<board>] = board id in specs/2026-10-21-2/extracted/boards/ (boards up to R-103 were read from the identical 2026-10-16 copies); [Req: REQ-…] = library/pdr/ai-mini-drama/requests.md; [Build: TR…] = RD Note on that Testing Request. Newest dated frame wins when frames disagree; Design > MX > PM.

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
- R-038 [PM:pm-update-7] When the user changes the story or a character in chat, Iris re-issues the "Story Outline & Characters" card; a character change adds "Got it! I've updated the story. I can't redraw characters yet - tap the switch icon on a character to change its look.", blue text "Character looks aren't updated automatically. Tap the switch icon to change a character's look." and "Switch any looks you'd like, then create the storyboard." — Changed 2026-10-22 (REQ-026): a clear request shows the priced Update characters card instead (see R-254).
- R-039 [PM:pm-update-7] Older outline cards stay but lose their switch icons; only the newest Create storyboard card is shown. — Changed 2026-10-22 (REQ-026): older cards keep their old images (PM 10/20 §13.2 ③).

## Make your character
- R-040 [PM:pm-main-flow] "Create my character" opens "Make your character": "Create front, side, and back views of your character for consistent results.", description field with counter 0/1000 and Clear, Gender* (Female/Male/Others), Ethnicity*, Age* (0–100), "Upload 1 reference photo", Generate ◆7.
- R-041 [PM:pm-main-flow] Either a description or a reference photo is enough to generate.
- R-042 [PM:pm-main-flow] Gender, Ethnicity and Age are required; Generate stays disabled until they are set.
- R-043 [PM:pm-update-3] The description accepts at most 1,000 characters with the same red counter and "You've reached the 1,000-character limit." behaviour as R-015. — Changed 2026-10-22 (REQ-028): over-limit text is kept and Generate disabled (see R-255).
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
- R-062 [PM:pm-update-3] After Generate the card disappears, a new message with the storyboard card appears at the bottom, the changed scenes and the preview show skeletons, and on completion the earlier storyboard card above updates too. — Changed 2026-10-22 (REQ-026): the earlier storyboard card is not updated; results come as a new message (PM 10/20 §13.2 ③).
- R-063 [PM:pm-update-5] Regenerating storyboard images also regenerates the TTS and the Storyboard Preview.

## Storyboard Preview
- R-064 [DS:ds-storyboard] The Storyboard Preview card shows the drama title, duration and "See your story as pictures with a voice telling it. The real video comes next."; playing it shows a narrated slideshow.
- R-065 [PM:pm-update-5] The Storyboard Preview always has captions, whatever was chosen on the format card.
- R-066 [PM:pm-error-handling] With missing scene images the preview shows "Storyboard preview unavailable. Complete the image generation above first to view the preview." and no generate button.
- R-067 [PM:pm-1002-update] A preview (TTS) failure shows "Couldn't create the storyboard preview. Your credits have been refunded. Try again." with Retry.

## Video settings and generation
- R-068 [PM:pm-main-flow] After the storyboard the assistant shows "Choose your video settings": Model Seedance 2.0 ("Best for cinematic, beautiful, high-detail videos") / Seedance 2.0 Mini ("Best for speed, value, and quick drafts"); Video length Preview • 30 sec / Full Video • 90 sec; Generate Video with price. — Changed 2026-10-22 (REQ-026): three models Best / Standard / Fast (PM 10/16, see R-253).
- R-069 [PM:pm-main-flow] The price changes with model and length (e.g. Seedance 2.0 preview ◆120, Mini ◆60). — Changed 2026-10-22 (REQ-026): 6 / 4 / 2 credits per second for Seedance 2.5 / 2.0 / 2.0 Mini.
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
- R-099 [DS:ds-mx-link] The first three creations are free: action cards show "Free for your first 3 creations - {n} left." — Changed 2026-10-22 (REQ-029): the Design 1016 frame shows 「Free • {n} left」 on the Create storyboard card (see R-259, R-260).
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
- Q-6 Withdrawn 2026-10-21: the manual outline editor is not in the 10/16, 10/19 or 10/21 PM spec (it came from older PM versions).
- Q-7 Withdrawn 2026-10-21: the storyboard text/image-version editor and thumbnail refresh are not in the current PM spec.
- Q-8 Withdrawn 2026-10-21: separate From Text / From Photo routes are not in the current PM spec.
- Q-9 Withdrawn 2026-10-21: the aspect-ratio choice is not in the current PM spec.
- Q-10 Withdrawn 2026-10-21: timeline reorder is not in the current PM spec.
- Q-11 Withdrawn 2026-10-21: the inspiration replace dialog is not in the current PM spec.
- Q-12 Decided 2026-10-22 (user, REQ-028): the newer source wins. The Design "Exceed word limit" frame (1005_Update) is newer than PM §13.11 (10/2): the character description keeps text over 1,000, shows the red count and message, and disables Generate (TC-051, TC-354). The idea, scene and scene-video inputs keep §13.11 (no newer Design frame).
- Q-13 Answered by the PM main flow: Full Video length = 15 s × scenes (R-251, TC-345).
- Q-14 Closed 2026-10-22 (REQ-028): only the PM E4 frame exists — a failed Storyboard Preview offers 「Create video anyways」 (TC-355). The opposing rule came from an older PM this casebook never received.
- Q-15 Decided 2026-10-22 (user): test the PM 10/16 three video models (Best / Standard / Fast = Seedance 2.5 / 2.0 / 2.0 Mini, 6 / 4 / 2 credits per second); the app will follow the PM. Default model still TBD.
- Q-16 Decided 2026-10-22 (user): test the PM 10/16 charged character change in chat (Update characters card → "Here's your updated cast.").
- Q-17 Decided 2026-10-22 (user): the PM 10/20 §13.2 ③ rule applies — new results come as a new message and earlier cards are not updated.

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

## Added 2026-10-21 — coverage passes and standing inputs
Skill sections "Coverage passes", "Standing inputs" and "Value check" (user approved 2026-10-21, REQ-018).

### Job states
- R-156 [PM:pm-update-6] When only the main scene image failed, Edit/Retry regenerates only the main image, reuses the Location image and charges one image.
- R-157 [PM:pm-update-3 J5] A chat image update that partly fails keeps the successful images; failed ones are refunded and marked 「!」 with 「1 image couldn't be updated. Your credits have been refunded. Tap Edit to try again, or tell me what to change.」 and Edit.
- R-158 [PM:pm-update-3 J4] Leaving while a chat image update is generating shows 「Stop and lose your credits?」 (short task, no refund).
- R-159 [DS:ds-storyboard 1012 update] When the whole storyboard fails: 「Something went wrong on my end.」 and 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」 with Try again.
- R-160 [PM:pm-1002-update §13.8] A failed video regeneration keeps the old version and uses the chat partial-failure copy.
- R-161 [PM:pm-1002-update §13.8] 「Your video has been updated.」 disappears after the video is played or the chat is left.
- R-162 [PM:pm-update-5 §13.13] If the caption retry fails again, the error and Try again return; the video still has no captions.
- R-163 [PM:pm-error-handling] A storyboard STT failure shows 「ⓘ Storyboard preview unavailable. Try again to generate the preview.」 with Retry.
- R-164 [PM:pm-update-5 §5 (10/6)] Tapping an action card button with no network shows the toast 「You're offline. Check your connection and try again.」; nothing is sent or charged and the card stays.
- R-165 [PM:pm-0930-updates §5] If the network drops while a generation runs, it resumes by itself after the network returns; the format card is not shown again.
- R-166 [PM:pm-0930-updates §3.2] Leaving while the storyboard price is calculated (「Thinking…」) shows no dialog.
- R-167 [PM:pm-0930-updates] On the first 「Yes, create video」 the pre-prompt offers Notify me (then the iOS permission dialog) and Not now (never shown again).
- R-168 [PM:pm-update-5 #4 (10/8)] The in-app toast and the push come once, only when the whole video is done; a partial or total failure, or a 6xxx auto-retry in progress, sends none.
- R-169 [PM:pm-0930-updates §6.2] The task-completed toast offers Close (keeps the current page) and View (opens History).
- R-170 [PM:pm-0930-updates §6.3] In the background a finished video sends one push 「Your drama is ready」/「"{Drama title}" is done. Tap to watch it.」; tapping it opens that chat at the video card.
- R-171 [PM:pm-update-4 Bug 0016 §6.4] After a rename, the History card, the toast and the push use the new name.
- R-172 [PM:pm-1002-update §13.1] The 「Tap to choose a look for {name}」 hint disappears when any slot is tapped and is not shown once every character is set.

### Persistence
- R-173 [PM:pm-1002-update §13.2] Returning from Full Edit keeps the chat position the user left.
- R-177 [PM:pm-update-4 Bug 0014] The History name is the drama title and follows title changes; a user Rename wins over later title changes.
- R-178 [DS:ds-recent-task] The History thumbnail is the first storyboard frame once a storyboard exists; before that, the default thumbnail.
- R-179 [DS:ds-video] After the full video, 「Ready for the next episode?」 offers 「Create Next Episode」, which starts the next episode of this drama.
- R-180 [Req: REQ-011] After the user stops a generation, the story can be continued from the last saved stage in the same chat.

### Fields
- R-174 [PM:pm-update-3 §13.11; DS:ds-storyboard, ds-video (967/1000)] The 1,000-character limit applies to every description input, including the scene image and scene video descriptions: red 「1000/1000」, extra input ignored, pasted text cut, 「You've reached the 1,000-character limit.」; deleting below 1,000 clears both.
- R-175 [PM:pm-error-handling; DS:ds-video] The scene-video description is plain editable text in sections 「Cinematic Style」, 「Scene」, 「Motion」, 「Camera」 (headings kept, one paragraph each) with the regenerate button priced by the model used.
- R-176 [PM:pm-main-flow] A character takes one reference photo; choosing another replaces it.

### MX
- R-181 [MX:mx-b-mid (version A)] A user's first AI Mini Drama use grants feature free-use credits once (1,000, TBD in MX), spendable only on its character, storyboard and video generation; own credits are charged after they run out.
- R-182 [MX:mx-b-mid (version A)] During first-time free use the generation model is fixed (images ChatGPT-2, video Seedance 2.0 1080p, TBD) and cannot be chosen.

### Requests
- R-183 [Req: REQ-001] Normal button sequences during a chat reply never crash or restart the app.
- R-184 [Req: REQ-003] Selecting a built-in character template leaves the other template thumbnails steady.
- R-185 [Req: REQ-007] The History info bubble points at the ⓘ button and stays fully on screen.
- R-186 [Req: REQ-008; DS:ds-template-detail] Each template category header shows its own icon as in Design.

### Build checks
- R-187 [Build: TR261006-0055 RD Note (189463); Req: REQ-021] Asking to regenerate a fully set cast shows a priced Create characters offer that completes.
- R-188 [Build: TR261006-0055 RD Note (189463); Req: REQ-021] A caption failure no longer marks scene details or blocks scene-video playback.
- R-189 [Build: TR261006-0055 RD Note (189463); Req: REQ-021] A failed download leaves its busy state and can be retried.

### Flow arrows walked by existing rows
Every Design arrow in arrows.json is either cited by a row above (「flow arrow <node>」) or listed here with the row that walks it.
- R-190 [DS: flow arrow 2778-129128 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129128] Launcher AI Mini Drama banner → Mini Drama landing: The AI Mini Drama launcher banner opens the Mini Drama entry page. Walked by: TC-002.
- R-191 [DS: flow arrow 2778-129129 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129129] Launcher AI Mini Drama shortcut → Mini Drama landing: Activating the AI Mini Drama launcher shortcut opens the Mini Drama landing page. Walked by: TC-001.
- R-192 [DS: flow arrow 2778-129130 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129130] Create Your Drama → empty custom idea input with keyboard: Create Your Drama opens an empty custom-idea input with the keyboard displayed. Walked by: TC-011.
- R-193 [DS: flow arrow 2778-129131 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129131] Displayed inspiration → populated unsent idea: Selecting a displayed inspiration populates the empty drama idea input. Walked by: TC-013.
- R-194 [DS: flow arrow 2778-129132 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129132] Idea Send → Format options: Before video creation the chat asks for video format, including language and captions. Walked by: TC-020.
- R-195 [DS: flow arrow 2778-129133 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129133] Custom Format Generate → outline loading: Generate on the custom-story Format card starts outline drafting. Walked by: TC-022.
- R-196 [DS: flow arrow 2778-129134 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129134] Template Format Generate → outline loading: Generate on the template-story Format card starts outline drafting. Walked by: TC-009.
- R-197 [DS: flow arrow 2778-129135 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129135] Outline character slot → Choose Character: Activating a named chat cast slot opens Choose Character for that slot. Walked by: TC-033.
- R-198 [DS: flow arrow 2778-129136 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129136] Completed picker checkmark → Characters Result: Character results show each character name with its corresponding photo. Walked by: TC-044.
- R-199 [DS: flow arrow 2778-129137 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129137] Custom storyboard Generate → storyboard loading: Generate on the custom-story storyboard offer starts storyboard loading. Walked by: TC-060.
- R-200 [DS: flow arrow 2778-129138 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129138] Template storyboard Generate → storyboard loading: Generate on the template-story storyboard offer starts storyboard loading. Walked by: TC-236 (and every template journey row; Blocked by REQ-019).
- R-201 [DS: flow arrow 2778-129139 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129139] Custom preview-video Generate → video loading: Starting video creation displays an in-progress video state in the chat; no fixed Generating Video literal is required. Walked by: TC-081.
- R-202 [DS: flow arrow 2778-129140 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129140] Template preview-video Generate → video loading: Starting video creation displays an in-progress video state in the chat; no fixed Generating Video literal is required. Walked by: TC-236 (and every template journey row; Blocked by REQ-019).
- R-203 [DS: flow arrow 2778-129141 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129141] Custom full-video offer Generate → video loading: Starting video creation displays an in-progress video state in the chat; no fixed Generating Video literal is required. Walked by: TC-087.
- R-204 [DS: flow arrow 2778-129142 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129142] Custom outline drafting → cast-building loading: Successful custom outline drafting advances to cast-building loading. Walked by: TC-024.
- R-205 [DS: flow arrow 2778-129143 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129143] Custom cast-building loading → outline with unset character slots: Successful custom cast-building presents the outline with unset character slots awaiting selection. Walked by: TC-024.
- R-206 [DS: flow arrow 2778-129145 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129145] Template full-video offer Generate → video loading: Starting video creation displays an in-progress video state in the chat; no fixed Generating Video literal is required. Walked by: TC-236 (and every template journey row; Blocked by REQ-019).
- R-207 [DS: flow arrow 2778-129147 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129147] Template outline drafting → cast-building loading: Successful template outline drafting advances to cast-building loading. Walked by: TC-236 (and every template journey row; Blocked by REQ-019).
- R-208 [DS: flow arrow 2778-129148 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129148] Template cast-building loading → completed Characters Result: Character results show each character name with its corresponding photo. Walked by: TC-236 (and every template journey row; Blocked by REQ-019).
- R-209 [DS: flow arrow 2778-129149 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129149] Custom full-video loading → completed video and next-episode offer: The completed custom drama offers Create Next Episode. Walked by: TC-087.
- R-210 [DS: flow arrow 2778-129150 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129150] Unassigned picker → assigned cast portraits: Selecting a library character applies that look to the currently selected cast slot. Walked by: TC-033.
- R-211 [DS: flow arrow 2778-129151 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129151] Custom storyboard loading → preview and model/length offer: Before video generation, the completed storyboard exposes the Storyboard Preview surface, separately from its generated scene cards. Walked by: TC-075.
- R-212 [DS: flow arrow 2778-129152 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129152] Template storyboard loading → preview and model/length offer: Before video generation, the completed storyboard exposes the Storyboard Preview surface, separately from its generated scene cards. Walked by: TC-075.
- R-213 [DS: flow arrow 2778-129153 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129153] Custom preview-video loading → completed preview/full-video offer: Successful custom preview-video generation presents its playable preview and full-video offer. Walked by: TC-086.
- R-214 [DS: flow arrow 2778-129155 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129155] Template preview-video loading → completed preview/full-video offer: Successful template preview-video generation presents its playable preview and full-video offer. Walked by: TC-086.
- R-215 [DS: flow arrow 2811-90143 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90143] Named chat cast slot → picker targeting that character: Activating a named chat cast slot opens Choose Character for that slot. Walked by: TC-033.
- R-216 [DS: flow arrow 2811-90146 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90146] Missing-character loading → completed portraits and Confirm: Successful missing-character generation replaces loading with the generated portraits and Confirm. Walked by: TC-041.
- R-217 [DS: flow arrow 2811-90151 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90151] Library look thumbnail → selected look and cast portrait: Selecting a library character applies that look to the currently selected cast slot. Walked by: TC-033.
- R-218 [DS: flow arrow 2811-90152 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90152] Picker checkmark with unset slots → Finish your characters: The incomplete-character prompt identifies the characters that remain unset and reports their count accurately. Walked by: TC-039.
- R-219 [DS: flow arrow 2811-90153 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90153] Picker X → leave warning → chat, routed above screens: Closing the unfinished character picker presents a warning that leaving will lose the current picks, with Leave and Keep choosing actions. Leave exits the unfinished character picker without saving its unsaved picks. Walked by: TC-037.
- R-220 [DS: flow arrow 2811-90153-KEEP-CHOOSING https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90153] Picker warning Keep choosing preserves unsaved picks: Keep choosing dismisses the unfinished-picker warning and retains the current unsaved picks. Walked by: TC-038.
- R-221 [DS: flow arrow 2811-90214 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90214] Generate all missing → missing-character loading: Generate all on Finish your characters starts loading for the unset characters. Walked by: TC-041.
- R-222 [DS: flow arrow 2811-90215 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90215] Completed missing-character Confirm → Characters Result: Confirm after missing-character generation returns to chat with the completed cast. Walked by: TC-041.
- R-223 [DS: flow arrow 2811-90583 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90583] Create my character → custom-character form: Create my character opens the custom-character form for the currently selected cast slot. Walked by: TC-047.
- R-224 [DS: flow arrow 2811-90590 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-90590] Custom Generate with reference → character loading: Generate on the valid custom-character form starts character loading for the submitted description and reference. Walked by: TC-132.
- R-225 [DS: flow arrow 2811-97718 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-97718] Filter checkmark → filtered picker: The Filter checkmark returns to the character picker with the selected criteria applied. Walked by: TC-036.
- R-226 [DS: flow arrow 2811-97719 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-97719] Default Filter → chosen gender/ethnicity/age criteria: Selecting gender, ethnicity and age criteria updates the Filter panel selections before applying them. Walked by: TC-036.
- R-227 [DS: flow arrow 2811-105836 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2811-105836] Picker Filter icon → Filter panel: The Choose Character filter icon opens the Filter panel. Walked by: TC-036.
- R-228 [DS: flow arrow 2820-113561 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-113561] Scene 1 right arrow → Scene 2 detail: The scene-detail right arrow opens the next scene. Walked by: TC-065.
- R-229 [DS: flow arrow 2820-113562 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-113562] Storyboard Preview play → preview player: The Storyboard Preview play control opens the preview player. Walked by: TC-075.
- R-230 [DS: flow arrow 2820-113563 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-113563] Second storyboard scene card → illustration details: Activating a storyboard scene card opens scene details. Walked by: TC-138.
- R-231 [DS: flow arrow 2820-115457 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-115457] Full-video settings Generate → video loading: Starting video creation displays an in-progress video state in the chat; no fixed Generating Video literal is required. Walked by: TC-087.
- R-232 [DS: flow arrow 2820-115458 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-115458] Full-video loading → completed video and next-episode offer: The completed custom drama offers Create Next Episode. Walked by: TC-087.
- R-233 [DS: flow arrow 2820-123493 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-123493] Recent Task state → Rename/Delete menu: A Recent Task action menu exposes Rename and Delete. Walked by: TC-111.
- R-234 [DS: flow arrow 2820-123494 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-123494] Outline-stage Recent Task → restored outline chat: Reopening a saved task shows the latest outline state rather than the complete session chat history. Walked by: TC-029.
- R-235 [DS: flow arrow 2820-123495 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-123495] Storyboard-stage Recent Task → restored storyboard chat: Reopening a saved storyboard-stage task restores its latest saved storyboard information. Walked by: TC-113.
- R-236 [DS: flow arrow 2820-125869 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2820-125869] Insufficient storyboard Buy Credits → top-up: When credits are insufficient for a generation or regeneration offer, its credit action opens the top-up panel. Walked by: TC-116.
- R-237 [DS: flow arrow 2824-132729 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2824-132729] Keyboard-visible long idea → collapsed idea after keyboard dismissal: Dismissing the keyboard collapses a long idea input to at most three displayed lines. Walked by: TC-018.
- R-238 [DS: flow arrow 2837-147745-PINCH https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2837-147745] Crop pinch changes reference framing: Pinching the reference photo in Crop adjusts how it fits the frame. Walked by: TC-130.
- R-239 [DS: flow arrow 3142-70052 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3142-70052] Failed storyboard image card → failed scene details: Opening a failed storyboard scene exposes its failed image and Edit route in scene details. Walked by: TC-140.
- R-240 [DS: flow arrow 3142-70054 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3142-70054] Failed storyboard editor Done → regeneration offer: Done from the failed-scene description editor opens the regeneration offer with the edited text. Walked by: TC-070.
- R-241 [DS: flow arrow 3167-119744 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3167-119744] Missing-character failure Got it → picker with partial results: Got it dismisses the character-image failure message and returns to the character picker. Walked by: TC-043.
- R-242 [DS: flow arrow 3172-101673 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3172-101673] Failed scene Retry → same scene loading: Retry on a failed scene video starts generation for that scene. Walked by: TC-092.
- R-243 [DS: flow arrow 3172-101674 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=3172-101674] Scene retry loading → repeated-failure Edit state: A repeatedly failed scene-video request exposes Edit with the retry-failure explanation. Walked by: TC-092.
- R-244 [DS: flow arrow 4078-177644 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4078-177644] Captions could not be added: Try again → Adding captions state; video and next-episode offer remain visible: Try again below a caption-failed video changes the status to Adding captions while retaining the video and next-episode offer. Walked by: TC-098.

### Job states
Every cell names the rows that check it, or n/a when the spec defines nothing for that state.

| Job | Start / loading | Success | Failure | Retry | Second failure | Partial success | Stop | Leave and return | Wait | Done notice |
|---|---|---|---|---|---|---|---|---|---|---|
| Outline | TC-023 | TC-024 | TC-030, TC-031, TC-032 | TC-030 | n/a (spec silent) | n/a | TC-153 | TC-025–TC-029, TC-159, TC-160, TC-301 | TC-169 | n/a |
| Characters (Generate all / with AI) | TC-041 | TC-041, TC-044 | TC-043, TC-338 | TC-042 | n/a (spec silent) | TC-042 | TC-154, TC-337 | TC-161, TC-162 | TC-170 | n/a |
| Create my character | TC-048, TC-049, TC-332 | TC-132, TC-133 | TC-137, TC-335 | TC-137 | n/a (spec silent) | n/a | TC-154, TC-333, TC-334 | TC-055, TC-056 | TC-170, TC-332 | n/a |
| Chat revision | TC-045, TC-348 | TC-045, TC-349 | TC-353 | n/a (spec silent) | n/a | TC-353 | TC-155, TC-351 | TC-163 | TC-171 | n/a |
| Storyboard | TC-060 | TC-064 | TC-295, TC-300 | TC-295 | n/a (spec silent) | TC-077 | TC-156, TC-061, TC-062 | TC-063, TC-164, TC-165, TC-302 | TC-172 | n/a |
| Scene image and Location | TC-071 | TC-064, TC-065 | TC-067, TC-068, TC-069 | TC-070, TC-141 | n/a (spec silent) | TC-292 | n/a (no Stop) | n/a | n/a | n/a |
| Chat image update | TC-072, TC-073 | TC-073, TC-074 | TC-293 | TC-293 | n/a (spec silent) | TC-293 | TC-294 | TC-294 | n/a | n/a |
| Storyboard Preview | TC-075 | TC-075, TC-076 | TC-077, TC-078, TC-299 , TC-355 | TC-078, TC-299 | n/a (spec silent) | n/a | n/a | n/a | n/a | n/a |
| Scene video (clip) | TC-081 | TC-086 | TC-091, TC-092, TC-095 , TC-362, TC-363 | TC-092, TC-149 | TC-092 | TC-091, TC-093 | TC-157 | TC-082, TC-144, TC-166 | TC-173 | n/a |
| Video regeneration | TC-096 | TC-096, TC-145, TC-297 | TC-296 | n/a (spec silent) | n/a | n/a | n/a | TC-144 | n/a | TC-297 |
| Full video | TC-081, TC-084 | TC-086, TC-087 | TC-094 | TC-094 | n/a (spec silent) | TC-091 | TC-157 | TC-082, TC-167 | TC-173 | TC-085, TC-303, TC-304, TC-305, TC-306, TC-307, TC-308 |
| Captions | TC-098 | TC-099 | TC-098 | TC-098, TC-151 | TC-298 | n/a (never partial: TC-098) | n/a | n/a | n/a | n/a |
| Download / export | TC-089 | TC-089, TC-090, TC-343 | TC-331 | TC-331 | n/a | n/a | n/a | TC-168 | TC-174 | n/a |

### Request ledger coverage
| Ledger entry | Requirements |
|---|---|
| REQ-001 crash sequences | R-183 |
| REQ-002 waits, leave and return, Stop notice | R-138, R-139, R-140 |
| REQ-003 character templates (select, thumbnails) | R-141 (TC-176 regression), R-184 |
| REQ-004 page text ENU/CHT/JPN | R-149 |
| REQ-005 generated storyboard text | R-150 |
| REQ-006 English quote marks | R-150 |
| REQ-007 History info popup | R-185 |
| REQ-008 template category icons | R-186 |
| REQ-009 template name scan | R-010, R-148 |
| REQ-010 every template to a finished video | R-148 (journeys Blocked by REQ-019) |
| REQ-011 colleague directions | R-151, R-152, R-153, R-154, R-155, R-180 |
| REQ-012 regression rows | R-141 |
| REQ-021 RD build notes, TR261006-0055 | R-187, R-188, R-189; folded into TC-065, TC-100 |
| REQ-024 PM-only features are cases | analysis rule (skill pass 7) |
| REQ-025 PM Spec 20261021 | R-245, R-246, R-247, R-248, R-249, R-250, R-251, R-252, R-253, R-254 |
| REQ-026 decisions Q-15 – Q-17 (2026-10-22) | R-253, R-254; rows TC-045, TC-046, TC-073, TC-079, TC-080 |
| REQ-028 decisions Q-12, Q-14 (2026-10-22) | R-255, R-256; row TC-051 |
| REQ-029 Figma 1016 frames; PM 10/21 governs older Design frames (2026-10-22) | R-259, R-260, R-261, R-262, R-263, R-264; row TC-114 |

## Added 2026-10-21 — PM Spec 20261021 (16:04)
PM-only rows carry 「PM-only: no Design frame yet (Design 2026-10-19)」 in Notes and change when the Design spec draws them (REQ-024).
- R-245 [PM:pm-update-9 (10/16); Req: REQ-025] While a character generates: 「This usually takes about 1 minute.」 under the attribute chips, X stays enabled and 「Cancel」 sits under the Generating button; Cancel or X asks 「Stop and lose your credits?」 (Leave anyway stops with no refund; Keep Generating continues).
- R-246 [PM:pm-update-9 (10/16 定案); Req: REQ-025] After 5 minutes a character generation shows 「We couldn't create your character」/「This is taking longer than expected. Send us feedback and our support team will check your credits.」 with Close (back to the form, input kept) and Send Feedback (AI Issues tab, prefilled feature, issue text with the time, prompt and e-mail).
- R-247 [PM:pm-update-9 (10/16); Req: REQ-025] Finish your characters while generating shows 「Creating {n} characters...」 and the time hint, X and Cancel ask 「Stop and lose your credits?」 (Leave anyway stops the unfinished characters and keeps finished ones, no refund), and after 5 minutes 「We couldn't create your characters」 with Send Feedback naming {n} characters.
- R-248 [PM:pm-update-11 §13.23 (10/21); Req: REQ-025] On the character result only Save to library saves to Mine; X, Android back or swipe down asks 「Discard this character?」 (Discard closes, not saved, the slot keeps what it had; Keep stays); the page's Discard button closes with no dialog.
- R-249 [PM:pm-update-10 (10/20); Req: REQ-025] Export Full Video saves to the photo library; the button shows loading with no dialog; when done the toast reads 「Saved to Photos.」 on iOS.
- R-250 [PM:pm-1002-update §13.2 (10/20); Req: REQ-025] After the user sends, the message is scrolled to the top and the reply generates below without the view following it; ↓ appears when the reply runs past the screen and scrolls smoothly to the bottom.
- R-251 [PM:pm-main-flow; Req: REQ-025] The Full Video length on the video settings card is 15 s × the number of scenes (90 s for 6 scenes).
- R-252 [PM:pm-1002-update §13.1; Req: REQ-025] The 「Tap to choose a look for {name}」 hint shows once per user, on the first use of AI Mini Drama.
- R-253 [PM:pm-update-8 (10/16); Req: REQ-026; Req: REQ-025] The video model control shows Best / Standard / Fast; the subtitle follows the choice: 「Seedance 2.5 • Sharper motion and richer detail」, 「Seedance 2.0 • Balanced quality for everyday stories」, 「Seedance 2.0 Mini • Quicker results, fewer credits」.
- R-254 [PM:pm-update-7 (10/16); Req: REQ-026; Req: REQ-025] Changing a character in chat: Iris asks which character only when unclear (2–4 option chips); a priced 「Update characters」 card charges one character × count; Generate shows 「Working on it...」, then 「Here's your updated cast.」 with a new Story Outline & Characters card and 「Your characters' looks are updated! Ready to create the storyboard?」 + Create storyboard; leaving asks 「Stop and lose your credits?」; failed characters are refunded (§13.10); after a storyboard the same flow ends with the storyboard offer.

## Added 2026-10-22 — answers to Q-12 and Q-14
- R-255 [DS:ds-characters 1005_Update "Exceed word limit"; Req: REQ-028] The character description keeps text over 1,000 characters with a red count (e.g. 「1120/1000」) and 「You've reached the 1,000-character limit.」 in the field and the expanded editor; Generate is disabled until the text is back under the limit.
- R-256 [PM:pm-1002-update E4, pm-error-handling; Req: REQ-028] When the Storyboard Preview fails, its card shows 「Couldn't create the storyboard preview. Your credits have been refunded. Try again.」 with Retry ◆1, and a 「Create video anyways」 button sits below the card.

## Added 2026-10-22 — Figma 1016 frames and the spec agent comparison
Three Design frames dated 1016 are in Figma but not in the Design PDF of this set (`specs/2026-10-21-2/extracted/figma-frames.json`,
board-notes 「Design — Figma only」). They are older than PM Spec 20261021, so the PM governs where they differ (REQ-029).
- R-257 [PM:pm-error-handling Video (4xxx), 10/13 update; Req: REQ-030] A scene video that fails with 4xxx shows 「Couldn't create video ⓘ」 with the refund text; ⓘ opens 「Couldn't generate this video」/「Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again.」 with Got it.
- R-258 [PM:pm-error-handling Video (5xxx), 10/13 update; Req: REQ-030] A scene video that fails with 5xxx shows 「Couldn't create video」 with the refund text and no ⓘ, and opens no dialog.
- R-259 [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] While free storyboard tries remain, the Create storyboard card shows the price struck through (◆15) and 「Free • {n} left」, {n} = tries left. Replaces R-099's older MX-board wording.
- R-260 [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] Once the free tries are used up, the card shows only the price (◆15): no strikethrough, no 「Free」.
- R-261 [PM:pm-main-flow §3.2/§3.3, Bug 0018; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] While the outline is generating, every top exit (Back, History, New chat, credit pill) shows 「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」 with Leave anyway / Stay; Stay keeps the chat; Leave anyway saves nothing and opens the exit's page (home, Recent Task, a new room, My Credits).
- R-262 [PM:pm-1002-update §13.6, pm-update-4; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] During a short job (storyboard, chat image update, character update), every top exit shows 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with Leave anyway / Keep Generating; Leave anyway stops the job and opens the exit's page.
- R-263 [PM:pm-main-flow Bug 0012; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] A chat already saved to History with nothing generating leaves through any top exit with no dialog and opens the exit's page.
- R-264 [PM:pm-update-4 (10/13 video leave); DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] During video generation every top exit leaves with no dialog, shows 「We'll keep making your video. Find it in History.」 and opens the exit's page; the video keeps generating.

### Exit × stage
Every top exit in every stage (coverage pass 8, REQ-030). iOS has no system back. Cells name the rows, or n/a with the reason.

| Stage | Back | History | New chat | Credit pill |
|---|---|---|---|---|
| Empty chat | TC-186 | n/a (spec silent) | TC-199 | n/a (spec silent) |
| Outline generating | TC-025, TC-027, TC-028 | TC-026, TC-027 | TC-200, TC-357 | TC-357, TC-358 |
| Outline saved, nothing generating | TC-029 | TC-360 | TC-360 | TC-360 |
| Character generating (Make your character) | n/a (sheet: X and Cancel, TC-333, TC-334) | n/a (sheet covers the chat) | n/a (sheet covers the chat) | n/a (sheet covers the chat) |
| Storyboard generating | TC-061, TC-063 | TC-359 | TC-359 | TC-359 |
| Chat image update generating | TC-294 | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) |
| Character update generating | TC-351 | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) |
| Video generating | TC-082, TC-083 | TC-361 | TC-361 | TC-361 |

### Error classes
Each job's failure by class (coverage pass 2, REQ-030): card copy, ⓘ, dialog and refund.

| Job | 4xxx | 5xxx | 6xxx |
|---|---|---|---|
| Outline | TC-031 | TC-030 | n/a (spec silent) |
| Characters (Generate with AI) | TC-042 | TC-043 | n/a (spec silent) |
| Create my character | n/a (spec silent) | TC-137 | n/a (spec silent) |
| Storyboard image | TC-067 | TC-068 | n/a (spec silent) |
| Storyboard Preview | n/a (TTS / STT failures instead: TC-078, TC-299) | n/a (TTS / STT failures instead: TC-078, TC-299) | n/a (spec silent) |
| Scene video | TC-362 | TC-363 | TC-095 |
| Whole video | n/a (spec silent) | TC-094 | TC-095 |


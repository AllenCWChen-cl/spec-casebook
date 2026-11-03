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
- R-040 [PM:pm-main-flow] "Create my character" opens "Make your character": "Create front, side, and back views of your character for consistent results.", description field with counter 0/1000 and Clear, Gender* (Female/Male/Others), Ethnicity*, Age* (0–100), "Upload 1 reference photo", Generate ◆7. — Changed 2026-10-29 (REQ-059): Generate ◆6 (the charging sheet's original price per character image, with or without a reference photo).
- R-041 [PM:pm-main-flow] Either a description or a reference photo is enough to generate.
- R-042 [PM:pm-main-flow] Gender, Ethnicity and Age are required; Generate stays disabled until they are set.
- R-043 [PM:pm-update-3] The description accepts at most 1,000 characters with the same red counter and "You've reached the 1,000-character limit." behaviour as R-015. — Changed 2026-10-22 (REQ-028): over-limit text is kept and Generate disabled (see R-255).
- R-044 [PM:pm-main-flow] A reference photo with several people warns "More than one person detected / For the best result, use a photo with just one person." with Generate anyway / Use another photo (not blocking).
- R-045 [PM:pm-main-flow] A reference photo with no person warns "No person detected / Results may not turn out well. Want to try anyway?".
- R-046 [PM:pm-main-flow] A celebrity photo is blocked: "This photo can't be used / It looks like a real public figure. Please try another photo."
- R-047 [PM:pm-main-flow] 10/13: X with any input asks "Discard this character? / What you've entered won't be saved." Discard / Keep editing; X with nothing entered closes directly.
- R-048 [PM:pm-main-flow] A generated character is saved to the library ("My character") whether the user confirms or closes with X. — Replaced 2026-10-22 (REQ-032): PM 10/21 §13.23 (R-248, R-293), only Save to library saves; the annotation trace found the old text still here. NOT TESTABLE: replaced
- R-049 [PM:pm-main-flow] A user character card's menu offers Delete ("Delete this character? / This character will be permanently deleted and can't be recovered." Cancel / Delete) and Report; CyberLink stock characters have no Delete.

## Storyboard
- R-050 [PM:pm-main-flow] Create storyboard → "Thinking..." while priced, then generation; price = images (2 credits each) + TTS for the animatic. — Changed 2026-10-29 (REQ-059): 6 credits per scene image (charging sheet) plus TTS.
- R-051 [PM:pm-1002-update; PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] Leaving the chat while the storyboard is being prepared (phase ①, card 「Preparing your scenes...」, not charged yet) asks 「Leave while we're preparing?」/「Your storyboard will start soon. If you leave now, we'll have to prepare it again when you come back.」 with 「Stay」 (closes the dialog, the preparation goes on) and a red 「Leave anyway」. Once the storyboard is being created (phase ②, 「Creating your storyboard...」, charged), leaving shows no dialog, only the toast 「We'll keep making your storyboard. Find it in History.」, and the storyboard keeps generating. A character generation keeps 「Stop and lose your credits?」 (R-245, R-247). Leaving during 「Thinking...」 (pricing) shows no dialog. — Changed 2026-10-29 (PM Figma 10/22, frame 4422:2): the storyboard 「Stop and lose your credits?」 dialog (Leave anyway / Keep Generating) is withdrawn.
- R-052 [PM:pm-0930-updates] After leaving a storyboard generation (or the app being killed), reopening from History stops at the storyboard offer; Generate re-prices and charges again. — Replaced 2026-10-29 (PM Figma 10/22, frame 4422:2): an interrupted phase ① restarts by itself with one charge (R-335) and phase ② finishes in the background (R-336). NOT TESTABLE: replaced
- R-053 [DS:ds-storyboard] A finished storyboard shows "Here's your storyboard", a Storyboard Result card (scene cards with 9:16 thumbnails, View more >) and a Storyboard Preview card.
- R-054 [DS:ds-storyboard] View more / a scene card opens the scene detail: X, "Scene N", ‹ › to move between scenes, main image, Location row, title and full script.
- R-055 [PM:pm-update-6] The Location row sits under the main image (thumbnail 32×57, label "Location"); it cannot be tapped, enlarged or regenerated alone.
- R-056 [PM:pm-update-6][DS:ds-storyboard] A 4xx scene-image failure shows "Couldn't create image ⓘ / Your credits have been refunded. Try editing the description for a different result." with Edit; ⓘ opens "Couldn't generate this image / Your credits have been refunded. This description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit it below and try again." with Got it and a terms-of-service link.
- R-057 [PM:pm-update-6] A 5xx scene-image failure shows "Couldn't create image / Your credits have been refunded. The service is busy - try again later." with no ⓘ.
- R-058 [PM:pm-update-5] Failed scene thumbnails in the Storyboard Result show only the ⟳ icon (no "Regenerate" text).
- R-059 [DS:ds-storyboard] Edit opens the description editor (counter x/1000, Done) and Regenerate Image ◆6; when the location and the scene both failed it notes "The location and scene image will both be regenerated (2 images)." and charges ◆12.
- R-060 [PM:pm-1002-update] While a scene image regenerates the image area shows a skeleton; the scene keeps its old content until done.
- R-061 [PM:pm-update-3] Asking Iris in chat to change storyboard images first returns an "Update storyboard images" action card (price, Generate); 2 credits per image. — Changed 2026-10-29 (REQ-059): 6 credits per image (the sheet's price for first generation and regenerate alike).
- R-062 [PM:pm-update-3] After Generate the card disappears, a new message with the storyboard card appears at the bottom, the changed scenes and the preview show skeletons, and on completion the earlier storyboard card above updates too. — Changed 2026-10-22 (REQ-026): the earlier storyboard card is not updated; results come as a new message (PM 10/20 §13.2 ③).
- R-063 [PM:pm-update-5] Regenerating storyboard images also regenerates the TTS and the Storyboard Preview.

## Storyboard Preview
- R-064 [DS:ds-storyboard] The Storyboard Preview card shows the drama title, duration and "See your story as pictures with a voice telling it. The real video comes next."; playing it shows a narrated slideshow.
- R-065 [PM:pm-update-5] The Storyboard Preview always has captions, whatever was chosen on the format card.
- R-066 [PM:pm-error-handling] With missing scene images the preview shows "Storyboard preview unavailable. Complete the image generation above first to view the preview." and no generate button.
- R-067 [PM:pm-1002-update] A preview (TTS) failure shows "Couldn't create the storyboard preview. Your credits have been refunded. Try again." with Retry.

## Video settings and generation
- R-068 [PM:pm-main-flow] After the storyboard the assistant shows "Choose your video settings": Model Seedance 2.0 ("Best for cinematic, beautiful, high-detail videos") / Seedance 2.0 Mini ("Best for speed, value, and quick drafts"); Video length Preview • 30 sec / Full Video • 90 sec; Generate Video with price. — Changed 2026-10-22 (REQ-026): three models Best / Standard / Fast (PM 10/16, see R-253).
- R-069 [PM:pm-main-flow] The price changes with model and length (e.g. Seedance 2.0 preview ◆120, Mini ◆60). — Changed 2026-10-22 (REQ-026): 6 / 4 / 2 credits per second for Seedance 2.5 / 2.0 / 2.0 Mini. — Changed 2026-10-29 (REQ-059): 6 / 13 / 4 credits per second for Seedance 2.5 / 2.0 (1080p) / 2.0 Mini (720p): 2.0 and Mini from the charging sheet, 2.5 keeps PM 10/16 (the sheet has no 2.5 row, Q-33); Preview • 30 sec ◆180 / ◆390 / ◆120, Full Video 90 sec ◆540 / ◆1170 / ◆360.
- R-070 [PM:pm-0930-updates] The first time the user generates a video, "Get notified when your video is ready? / Videos take a few minutes. We'll let you know as soon as yours is done." appears with Notify me (then the system permission) / Not now (never shown again).
- R-071 [PM:pm-main-flow; PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] Leaving the chat while the video is being prepared (phase ①, card 「Advancing the mini drama production.」, not charged yet) asks 「Leave while we're preparing?」/「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」 with 「Stay」 and a red 「Leave anyway」. Once the video is being made (phase ②, 「Making your video...」, charged), leaving shows the toast 「We'll keep making your video. Find it in History.」 with no dialog, and the video keeps generating. — Changed 2026-10-29 (PM Figma 10/22, frame 4422:2): the toast-only leave now applies to phase ② only.
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
- R-081 [DS:ds-video] A failed scene video shows "Couldn't create scene / Something went wrong. Give it another try." with Retry; a failed retry shows "Retrying didn't work. Try a different description." with Edit → description editor → Regenerate scene ◆30. — Changed 2026-10-29 (REQ-059): Regenerate scene costs the scene's length × the model's per-second rate (R-069); ◆30 is the Design mock.
- R-082 [PM:pm-main-flow][DS:ds-video] A failed scene clip defaults to 15 s and hides the download icon.
- R-083 [DS:ds-video] When the whole video fails: "Something went wrong on my end." and "Video couldn't be created. Try creating your video again." with Try again.
- R-084 [PM:pm-1002-update] 6xxx (upload failed): "Your video didn't finish saving. Tap Retry - you won't be charged again." with Retry; after 3 h "We couldn't finish this video. Your credits have been refunded. Edit the description and try again."
- R-085 [PM:pm-1002-update] During video regeneration the old version stays playable; download/Export are unavailable until done; when done it is replaced and "Your video has been updated." shows.

## Captions
- R-086 [PM:pm-update-5] With "No captions" the final video has no captions (STT not run).
- R-087 [PM:pm-update-5] If any caption segment fails, the whole video has no captions and the card shows "Captions couldn't be added. Try again"; Try again shows "Adding captions…" and reruns only failed segments.

## Chat behaviour
- R-088 [PM:pm-1002-update] The chat does not auto-scroll; a ↓ button (no unread count) appears when new content is below the view, and tapping it scrolls to the bottom and hides it.
- R-089 [PM:pm-1002-update] Returning from Character Library, Full Edit or History keeps the chat at the position the user left. — Changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — the chat always opens at the bottom (newest message) after Character Library, Full Edit or History.
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
- R-103 [DS:ds-mx-link] Paid users at the limit see "Today's AI Chats Are Used Up / They'll refresh tomorrow, and we'll be ready to chat again." with Continue Tomorrow. — Changed 2026-10-22 (REQ-032): MX version A gives this dialog to Pro+ only; Pro gets the Free dialog (R-277).

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
- Q-18 PM main flow note 「day 1 只有 US & JP」 beside the template grid: are templates limited to the US and JP stores on day 1? Affects R-289 and the template rows (REQ-032).
- Q-19 「More ideas +」 above the composer: no Design frame, arrow or PM note says what a tap shows (more inspiration chips, a filled input, a new suggestion message?). TC-019 records what appears (R-318, REQ-039).
- Q-20 (RD to confirm; PM Figma 10/22 frame 4422:2, PM open question #20) The two-phase rules wait for RD: the charge moving to the start of phase ②, the chat restarting phase ① by itself after Leave anyway or an app swipe / background, and the storyboard phase ② finishing in the background. The rows follow the frame meanwhile. The storyboard mockups also keep the credit pill at 400 through phase ② while the video mockups drop it 182 → 122. (R-333, R-334, R-335, R-336; TC-377, TC-063, TC-403, TC-404, TC-406, TC-409, TC-410)
- Q-21 (RD to confirm; PM Figma 10/22 frame 4418:2) Can Export Full Video go on after the user leaves the result page? If not, Back asks 「Stop exporting?」/「Your video won't be saved.」 with 「Keep exporting」 / 「Stop」. The rows follow the frame (the export goes on). (R-337; TC-415)
- Q-22 Frame 4422:2 names four generations with no pause or stop (Create storyboard, Generate Video, a storyboard update in chat, a video regeneration) and draws the two phases for the storyboard and the video only. Not named: the outline (format card Generate; TC-153 keeps its Stop), the character update in chat (「Update characters」 Generate; R-254 / R-262 keep 「Stop and lose your credits?」, TC-351), the scene-image regeneration in scene detail (R-280, TC-378), the phase ① card title of a storyboard update in chat, and whether a video regeneration has the 「Leave while we're preparing?」 phase. Which of these follow the 10/22 rule? (R-332, R-158, R-254, R-262, R-280)
- Q-23 Frame 4422:2 draws a user bubble after Generate (「Yes, create storyboard」; 「Generate Video / Model: Seedance 2.0 Mini / Generation length: Preview · 30 sec」) followed by 「I'll create a storyboard — give me a moment...」, while its note says the video settings card turns into the skeleton in place and R-279 (PM 10/02) says Generate removes the card without adding a user bubble. Which is current? R-279 is kept until PM answers. (R-279, R-333, R-334; TC-377, TC-406)
- Q-24 (PM Error Handling, flow arrows 2701-22188 and 2651-21992) On the result page, 「Export Full Video」 while a scene video is still regenerating (after Retry or Regenerate Video) points to a toast with an icon whose text the frame does not give. What does the toast say? R-085 says only that Export is unavailable until the regeneration is done; TC-096 records the copy. (R-345, R-346, R-085)
- Q-25 (MX mx-a-mid, flow arrow 1563-22392) The first-time-discount frame 1563:22095 labels a Free user's not-enough card 「Buy Credits」 and leads it to the subscription page, while the MX note says a Free user's card offers 「Upgrade Now」 (R-146). Which label is current? Rows follow the note (R-380, TC-226).
- Q-26 (MX mx-a-left, flow arrow 1034-40811) The MX Pro+ limit dialog's button reads 「Try Again Later」; the Design (ds-mx-link) reads 「Continue Tomorrow」. Rows follow the Design (R-375, TC-118, R-103, R-320).
- Q-27 (PM Error Handling, flow arrow 2621-30306) After a failed Retry the PM frame 2621:30259 reads 「Couldn't create video ⓘ」/「Your credits have been refunded. Edit the description and try again.」 with Edit; the Design reads 「Retrying didn't work. Try a different description.」 (R-081). Rows follow the Design (R-368, TC-092); does the second failure show the refund line and ⓘ?
- Q-28 (PM Error Handling 2621:30383) The regenerated scene image in the scene detail carries a ⋯ (board note 「… menu on the image」), but no frame draws its menu and the Design's regenerated scene detail (R-306) has none. Is there a menu, and what does it offer? Not traced to a row until then.
- Q-29 (PM main flow 2283:10856 「Demo page_Straight video」) The PM draws a feature intro (「Don't show again」, 「Try It Now」) between the Launcher and the landing; the Design's shortcut arrow (2778-129128, R-190) goes straight to the landing. Is the intro shown, and only until 「Don't show again」? Rows follow the PM (TC-418, R-456).
- Q-30 (PM main flow 2186:7485, pm-top-mockups) The PM Storyboard Preview card has a 「Create video」 button whose tap adds the bubble 「Create video」 before the video settings card; the Design card has no button and the settings card follows the storyboard (R-408, R-211). Which is current? TC-079 taps it when shown (R-458).
- Q-31 (MX mx-a-left / mx-a-mid) The MX mockups draw an older chat around the chat-count and charging rules: a 「Consume credits?」 card with 「Don't ask again」 and 「Confirm」 (see Q-3), a template chat asking 「Continue to create the script?」 with 「Ready to create」, an add-image button in the composer, aspect-ratio chips, a 「Create characters」 card with 「Customize my characters (optional)」, an edit icon on Characters Result, and a scene editor with 「Tell AI what to change…」. Are these only illustrations (rows follow the Design / PM), or does any of them still ship?
- Q-32 (MX mx-a-right ③ Credit Charging Table, linked sheet 2026-10-20; REQ-057) The sheet's normal prices (character 6 per image, storyboard 6 per scene, Seedance 2.0 1080p 13 per second, Seedance 2.0 Mini 720p 4 per second) disagree with the PM 10/16 定案 (Seedance 2.0 4 per second, Mini 2 per second) and with the app (character ◆4 per image in every run to 2026-10-29). Which normal prices are current? Rows keep the PM 10/16 / Design prices until the user sends the price update (R-253, R-463, R-464; TC-229, TC-347, TC-079). **Answered 2026-10-29 (user, REQ-059):** "by default the original price should be the correct option … Unless I specified in the future that the promotion price is applied use the original price." Rows use the sheet's original prices (R-040, R-050, R-061, R-069, R-081, R-254, R-259, R-260).
- Q-33 (MX mx-a-right ③ Credit Charging Table, linked sheet; REQ-057, reworded 2026-10-29 for REQ-059) The sheet has no Seedance 2.5 row. Does Seedance 2.5 (Best) have a price in the charging sheet? Until it does, 2.5 keeps PM 10/16's 6 credits per second (R-069).

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
- R-147 [MX ② First-time credit discount, PDRM MX.pdf version A] Only a Free user who subscribes during an AI Mini Drama session gets the credit discount, on that session's action ids, once per lifetime; a new session, a resubscription and any regenerate after one discounted drama are charged at full price; Paid users never get it. — 2026-10-29 (REQ-059): the discount price is held until the user says the promotion applies; every row expects the original price.
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
- R-158 [PM:pm-update-3 J4; PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] A storyboard update asked for in chat (Generate on its 「Create storyboard」 card) follows the storyboard's two phases: leaving in phase ① asks 「Leave while we're preparing?」 with the storyboard body (「Stay」 / 「Leave anyway」); leaving in phase ② shows no dialog, only 「We'll keep making your storyboard. Find it in History.」, and the update finishes. — Changed 2026-10-29 (PM Figma 10/22, frame 4422:2): was 「Stop and lose your credits?」 (short task, no refund).
- R-159 [DS:ds-storyboard 1012 update] When the whole storyboard fails: 「Something went wrong on my end.」 and 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」 with Try again.
- R-160 [PM:pm-1002-update §13.8] A failed video regeneration keeps the old version and uses the chat partial-failure copy.
- R-161 [PM:pm-1002-update §13.8] 「Your video has been updated.」 disappears after the video is played or the chat is left.
- R-162 [PM:pm-update-5 §13.13] If the caption retry fails again, the error and Try again return; the video still has no captions.
- R-163 [PM:pm-error-handling] A storyboard STT failure shows 「ⓘ Storyboard preview unavailable. Try again to generate the preview.」 with Retry.
- R-164 [PM:pm-update-5 §5 (10/6)] Tapping an action card button with no network shows the toast 「You're offline. Check your connection and try again.」; nothing is sent or charged and the card stays.
- R-165 [PM:pm-0930-updates §5] If the network drops while a generation runs, it resumes by itself after the network returns; the format card is not shown again. — Changed 2026-10-22 (REQ-032): PM 10/6 (pm-update-5) is newer than §5 of 09/30: the chat shows Try again instead of resuming by itself.
- R-166 [PM:pm-0930-updates §3.2] Leaving while the storyboard price is calculated (「Thinking…」) shows no dialog.
- R-167 [PM:pm-0930-updates] On the first 「Yes, create video」 the pre-prompt offers Notify me (then the iOS permission dialog) and Not now (never shown again).
- R-168 [PM:pm-update-5 #4 (10/8)] The in-app toast and the push come once, only when the whole video is done; a partial or total failure, or a 6xxx auto-retry in progress, sends none.
- R-169 [PM:pm-0930-updates §6.2] The task-completed toast offers Close (keeps the current page) and View (opens History).
- R-170 [PM:pm-0930-updates §6.3] In the background a finished video sends one push 「Your drama is ready」/「"{Drama title}" is done. Tap to watch it.」; tapping it opens that chat at the video card.
- R-171 [PM:pm-update-4 Bug 0016 §6.4] After a rename, the History card, the toast and the push use the new name.
- R-172 [PM:pm-1002-update §13.1] The 「Tap to choose a look for {name}」 hint disappears when any slot is tapped and is not shown once every character is set.

### Persistence
- R-173 [PM:pm-1002-update §13.2] Returning from Full Edit keeps the chat position the user left. — Changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — the chat opens at the bottom (newest message).
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
- R-190 [DS: flow arrow 2778-129128 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129128] Launcher AI Mini Drama shortcut → Mini Drama landing: Activating the AI Mini Drama launcher shortcut opens the Mini Drama landing page. Walked by: TC-001.
- R-191 [DS: flow arrow 2778-129129 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=2778-129129] Launcher AI Mini Drama banner → Mini Drama landing: The AI Mini Drama launcher banner opens the Mini Drama entry page. Walked by: TC-002.
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
| Create my character | TC-048, TC-049, TC-332 | TC-132, TC-133 , TC-366 | TC-137, TC-335 | TC-137 | n/a (spec silent) | n/a | TC-154, TC-333, TC-334 | TC-055, TC-056 | TC-170, TC-332 | n/a |
| Chat revision | TC-045, TC-348 | TC-045, TC-349 | TC-353 | n/a (spec silent) | n/a | TC-353 | TC-155, TC-351 | TC-163 | TC-171 | n/a |
| Storyboard | TC-060, TC-377 | TC-064 | TC-295, TC-300 | TC-295 | n/a (spec silent) | TC-077 | TC-156 (no stop in chat, R-332) | TC-061, TC-062, TC-359, TC-063, TC-401 – TC-404, TC-164, TC-165, TC-302 | TC-172 | n/a |
| Scene image and Location | TC-071 | TC-064, TC-065 | TC-067, TC-068, TC-069 | TC-070, TC-141 | n/a (spec silent) | TC-292 | TC-378 | n/a | n/a | n/a |
| Chat image update | TC-072, TC-073 | TC-073, TC-074 | TC-293 | TC-293 | n/a (spec silent) | TC-293 | TC-405 (no stop in chat, R-332) | TC-294, TC-413 | n/a | n/a |
| Storyboard Preview | TC-075 | TC-075, TC-076 | TC-077, TC-078, TC-299 , TC-355 | TC-078, TC-299 | n/a (spec silent) | n/a | n/a | n/a | n/a | n/a |
| Scene video (clip) | TC-081, TC-406 | TC-086 | TC-091, TC-092, TC-095 , TC-362, TC-363 | TC-092, TC-149 | TC-092 | TC-091, TC-093 | TC-157 (no stop in chat, R-332) | TC-407 – TC-411, TC-082, TC-144, TC-166 | TC-173 | n/a |
| Video regeneration | TC-096 | TC-096, TC-145, TC-297 | TC-296 | n/a (spec silent) | n/a | n/a | TC-412 (no stop in chat, R-332) | TC-144 | n/a | TC-297 |
| Full video | TC-081, TC-084, TC-406 | TC-086, TC-087 | TC-094 | TC-094 | n/a (spec silent) | TC-091 | TC-157 (no stop in chat, R-332) | TC-407 – TC-411, TC-082, TC-167 | TC-173 | TC-085, TC-303, TC-304, TC-305, TC-306, TC-307, TC-308 |
| Captions | TC-098 | TC-099 | TC-098 | TC-098, TC-151 , TC-365 | TC-298 | n/a (never partial: TC-098) | n/a | n/a | n/a | n/a |
| Download / export | TC-089, TC-343 | TC-089, TC-090, TC-343, TC-414 | TC-331, TC-416, TC-417 | TC-331, TC-416 | n/a | n/a | n/a | TC-168, TC-415 | TC-174 | n/a |

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
| REQ-031 Spec agent cases derived from the spec are added (manager, 2026-10-22) | R-265, R-266; rows TC-364, TC-365, TC-366, TC-367, TC-368, TC-369 |
| REQ-032 The analysis finds spec rules itself (2026-10-22) | R-267 – R-305 (annotation trace, passes 9 and 10) |
| REQ-039 Every tappable element is pressed, inputs dismissed (2026-10-28) | control-trace.json (every control pressed; inputs dismissed); R-306 – R-317 (Figma inventory flow arrows); R-318 – R-331 (controls) |
| REQ-040 Grouped control totals, robust tap matching (2026-10-28) | control-trace.json (every control pressed; inputs dismissed); R-306 – R-317 |
| REQ-052 PM / MX Figma inventory; PM Figma 10/22 frames (2026-10-29) | R-332 – R-340; changed R-051, R-052, R-071, R-158, R-249, R-262, R-264 |
| REQ-057 MX ③ Credit Charging Table (linked sheet): discount prices, no discount on regenerate, action ids (2026-10-29) | R-463, R-464, R-465; Q-32, Q-33 |
| REQ-059 original prices by default, the promotion price held (2026-10-29) | R-040, R-050, R-061, R-069, R-081, R-147, R-254, R-259, R-260, R-463, R-464, R-465; Q-32, Q-33 |

## Added 2026-10-21 — PM Spec 20261021 (16:04)
PM-only rows carry 「PM-only: no Design frame yet (Design 2026-10-19)」 in Notes and change when the Design spec draws them (REQ-024).
- R-245 [PM:pm-update-9 (10/16); Req: REQ-025] While a character generates: 「This usually takes about 1 minute.」 under the attribute chips, X stays enabled and 「Cancel」 sits under the Generating button; Cancel or X asks 「Stop and lose your credits?」 (Leave anyway stops with no refund; Keep Generating continues).
- R-246 [PM:pm-update-9 (10/16 定案); Req: REQ-025] After 5 minutes a character generation shows 「We couldn't create your character」/「This is taking longer than expected. Send us feedback and our support team will check your credits.」 with Close (back to the form, input kept) and Send Feedback (AI Issues tab, prefilled feature, issue text with the time, prompt and e-mail).
- R-247 [PM:pm-update-9 (10/16); Req: REQ-025] Finish your characters while generating shows 「Creating {n} characters...」 and the time hint, X and Cancel ask 「Stop and lose your credits?」 (Leave anyway stops the unfinished characters and keeps finished ones, no refund), and after 5 minutes 「We couldn't create your characters」 with Send Feedback naming {n} characters.
- R-248 [PM:pm-update-11 §13.23 (10/21); Req: REQ-025] On the character result only Save to library saves to Mine; X, Android back or swipe down asks 「Discard this character?」 (Discard closes, not saved, the slot keeps what it had; Keep stays); the page's Discard button closes with no dialog.
- R-249 [PM:pm-update-10 (10/20); PM:figma 10/22 Export Full Video while exporting 4418:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2; Req: REQ-025, REQ-052] Export Full Video saves the flattened video to the photo library with no dialog. While it exports, a loading spinner shows in the middle of the preview, the play button is hidden and the video paused; 「Full Edit」, 「Export Full Video」 (label unchanged) and the download icon at the preview's bottom right are disabled (40 % opacity) and cannot be pressed. When done the spinner goes, the play button and the three controls return, and the toast reads 「Saved to Photos.」 on iOS. — Changed 2026-10-29 (PM Figma 10/22, frame 4418:2): was 「the button shows loading」.
- R-250 [PM:pm-1002-update §13.2 (10/20); Req: REQ-025] After the user sends, the message is scrolled to the top and the reply generates below without the view following it; ↓ appears when the reply runs past the screen and scrolls smoothly to the bottom.
- R-251 [PM:pm-main-flow; Req: REQ-025] The Full Video length on the video settings card is 15 s × the number of scenes (90 s for 6 scenes).
- R-252 [PM:pm-1002-update §13.1; Req: REQ-025] The 「Tap to choose a look for {name}」 hint shows once per user, on the first use of AI Mini Drama.
- R-253 [PM:pm-update-8 (10/16); Req: REQ-026; Req: REQ-025] The video model control shows Best / Standard / Fast; the subtitle follows the choice: 「Seedance 2.5 • Sharper motion and richer detail」, 「Seedance 2.0 • Balanced quality for everyday stories」, 「Seedance 2.0 Mini • Quicker results, fewer credits」.
- R-254 [PM:pm-update-7 (10/16); Req: REQ-026; Req: REQ-025] Changing a character in chat: Iris asks which character only when unclear (2–4 option chips); a priced 「Update characters」 card charges one character × count; Generate shows 「Working on it...」, then 「Here's your updated cast.」 with a new Story Outline & Characters card and 「Your characters' looks are updated! Ready to create the storyboard?」 + Create storyboard; leaving asks 「Stop and lose your credits?」; failed characters are refunded (§13.10); after a storyboard the same flow ends with the storyboard offer. — Changed 2026-10-29 (REQ-059): one character costs ◆6.

## Added 2026-10-22 — answers to Q-12 and Q-14
- R-255 [DS:ds-characters 1005_Update "Exceed word limit"; Req: REQ-028] The character description keeps text over 1,000 characters with a red count (e.g. 「1120/1000」) and 「You've reached the 1,000-character limit.」 in the field and the expanded editor; Generate is disabled until the text is back under the limit.
- R-256 [PM:pm-1002-update E4, pm-error-handling; Req: REQ-028] When the Storyboard Preview fails, its card shows 「Couldn't create the storyboard preview. Your credits have been refunded. Try again.」 with Retry ◆1, and a 「Create video anyways」 button sits below the card.

## Added 2026-10-22 — Figma 1016 frames and the spec agent comparison
Three Design frames dated 1016 are in Figma but not in the Design PDF of this set (`specs/2026-10-21-2/extracted/figma-frames.json`,
board-notes 「Design — Figma only」). They are older than PM Spec 20261021, so the PM governs where they differ (REQ-029).
- R-257 [PM:pm-error-handling Video (4xxx), 10/13 update; Req: REQ-030] A scene video that fails with 4xxx shows 「Couldn't create video ⓘ」 with the refund text; ⓘ opens 「Couldn't generate this video」/「Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again.」 with Got it.
- R-258 [PM:pm-error-handling Video (5xxx), 10/13 update; Req: REQ-030] A scene video that fails with 5xxx shows 「Couldn't create video」 with the refund text and no ⓘ, and opens no dialog.
- R-259 [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] While free storyboard tries remain, the Create storyboard card shows the price struck through (◆15) and 「Free • {n} left」, {n} = tries left. Replaces R-099's older MX-board wording. — Changed 2026-10-29 (REQ-059): the price is 6 per scene image plus the Text to Speech part (R-050); ◆15 is the Design mock.
- R-260 [DS:figma 1016_support free trial 4847:34277; Req: REQ-029] Once the free tries are used up, the card shows only the price (◆15): no strikethrough, no 「Free」. — Changed 2026-10-29 (REQ-059): the price is 6 per scene image plus the Text to Speech part (R-050); ◆15 is the Design mock.
- R-261 [PM:pm-main-flow §3.2/§3.3, Bug 0018; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] While the outline is generating, every top exit (Back, History, New chat, credit pill) shows 「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」 with Leave anyway / Stay; Stay keeps the chat; Leave anyway saves nothing and opens the exit's page (home, Recent Task, a new room, My Credits).
- R-262 [PM:pm-1002-update §13.6, pm-update-4; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-029, REQ-052] During a character update in chat, every top exit shows 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with Leave anyway / Keep Generating; Leave anyway stops the job and opens the exit's page. During a storyboard or a storyboard update in chat, every top exit (Back, History, New chat, credit pill) follows the two phases of R-051 / R-158: in phase ① it asks 「Leave while we're preparing?」 (storyboard body) and 「Leave anyway」 opens the exit's page; in phase ② it shows no dialog, the toast 「We'll keep making your storyboard. Find it in History.」 and opens the exit's page. — Changed 2026-10-29 (PM Figma 10/22, frame 4422:2): the storyboard part no longer asks 「Stop and lose your credits?」; whether a character update follows the two phases is Q-22.
- R-263 [PM:pm-main-flow Bug 0012; DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); Req: REQ-029] A chat already saved to History with nothing generating leaves through any top exit with no dialog and opens the exit's page.
- R-264 [PM:pm-update-4 (10/13 video leave); DS:figma 1016_Chat navigation 4858:34930 (exits, landing pages); PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-029, REQ-052] During video generation every top exit (Back, History, New chat, credit pill) follows the two phases of R-071: in phase ① it asks 「Leave while we're preparing?」 (video body) and 「Leave anyway」 opens the exit's page; in phase ② it leaves with no dialog, shows 「We'll keep making your video. Find it in History.」 and opens the exit's page, and the video keeps generating. — Changed 2026-10-29 (PM Figma 10/22, frame 4422:2): the no-dialog leave now applies to phase ② only.

### Exit × stage
Every top exit in every stage (coverage pass 8, REQ-030). iOS has no system back. Cells name the rows, or n/a with the reason.

| Stage | Back | History | New chat | Credit pill |
|---|---|---|---|---|
| Empty chat | TC-186 | n/a (spec silent) | TC-199 | n/a (spec silent) |
| Outline generating | TC-025, TC-027, TC-028, TC-394 | TC-026, TC-027, TC-395 | TC-200, TC-357, TC-396 | TC-357, TC-358 |
| Outline saved, nothing generating | TC-029 | TC-360 | TC-360 | TC-360 |
| Character generating (Make your character) | n/a (sheet: X and Cancel, TC-333, TC-334) | n/a (sheet covers the chat) | n/a (sheet covers the chat) | n/a (sheet covers the chat) |
| Storyboard phase ① (「Preparing your scenes...」) | TC-061, TC-063 | TC-359 | TC-359 | TC-359 |
| Storyboard phase ② (「Creating your storyboard...」) | TC-401 | TC-402 | TC-402 | TC-402 |
| Storyboard update in chat, phase ① | TC-294 | n/a (same phase ① dialog as TC-359) | n/a (same phase ① dialog as TC-359) | n/a (same phase ① dialog as TC-359) |
| Storyboard update in chat, phase ② | TC-413 | n/a (same phase ② toast as TC-402) | n/a (same phase ② toast as TC-402) | n/a (same phase ② toast as TC-402) |
| Character update generating | TC-351 | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) | n/a (same short-job dialog as TC-359) |
| Video phase ① (「Advancing the mini drama production.」) | TC-407, TC-409 | TC-408 | TC-408 | TC-408 |
| Video phase ② (「Making your video...」) | TC-082, TC-083 | TC-361 | TC-361 | TC-361 |
| Exporting Full Video (result page) | TC-415 | n/a (the result page has only Back) | n/a (the result page has only Back) | n/a (the result page has only Back) |

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

## Added 2026-10-22 (2) — spec agent cases derived from the spec (REQ-031)
The spec agent cross-check (`spec-agent-gaps.json` in this draft) found six cases from the spec files that the table
did not have; the earlier comparison had left them out as low value. Per the manager (REQ-031) they are rows now.
TC-364 and TC-365 check R-086 / R-087 through the app log, TC-367 and TC-368 give R-142 a row per tier.
- R-265 [PM:pm-main-flow (Make your character, note beside the reference photo: 「只送 crop 後的圖」); Req: REQ-031] Only the cropped reference image is sent for character generation: what the Crop step cut away is not part of the image the character is generated from.
- R-266 [MX ① Free chat times, PDRM MX.pdf version A (Firebase); Req: REQ-031] Each tier's daily chat allowance comes from Firebase Remote Config: when the configured allowance changes, the limit dialog appears on the send after the new allowance.

## Added 2026-10-22 (3) — annotation trace and passes 9 and 10 (REQ-032)
The casebook's own analysis must find every rule in the spec files (REQ-032). Every annotation block of the current
boards is traced (`annotation-trace.json`, 475 blocks); the blocks no requirement fully stated gave R-267 – R-305.
R-048, R-089, R-103, R-165 and R-173 still held replaced rules and are changed above.
- R-267 [DS:ds-characters; Req: REQ-032] In Choose Character a cast slot with no look yet shows the default placeholder image.
- R-268 [DS:ds-characters; Req: REQ-032] 「AI Suggestion」 fills the description and settings for the cast character being created (the {name} in 「Tell us what {name} looks like」), not a generic character.
- R-269 [DS:ds-characters; Req: REQ-032] After 「Save to library」 the character is applied to the slot at once, and its library thumbnail carries a 「Mine」 tag at the lower left (the PM mockups show 「My character」; Design wins).
- R-270 [DS:ds-characters; Req: REQ-032] Tapping the description text itself, not only the expand icon, opens the full-screen description editor.
- R-271 [DS:ds-characters; Req: REQ-032] After 「Got it」 on a character failure, Choose Character opens with the failed character's slot selected; characters that succeeded are applied.
- R-272 [DS:ds-characters; Req: REQ-032] Dragging an Age slider handle in the Filter panel shows its current value above the handle.
- R-273 [DS:ds-home-custom-chat; Req: REQ-032] With the keyboard open, the input box of a new chat and of a chat with content grows with the text up to its maximum height; longer text scrolls inside the box.
- R-274 [DS:ds-main-flow; Req: REQ-032] Scrolling up to earlier messages shows the ↓ button at the bottom right of the chat.
- R-275 [DS:ds-video 「點擊 Preview 暫停」; Req: REQ-032] In the scene-video player, tapping the playing video pauses it and shows the play button over the frame.
- R-276 [DS:ds-video; Req: REQ-032] When the drama has failed scenes, the chat's 「Here's your drama.」 video card hides its download icon.
- R-277 [MX:mx-a-left ① version A; Req: REQ-032] A Pro user's 31st send of the day shows the 「Daily Free Chat Limit Reached」 dialog (the Pro mockup titles it 「Free Chat Limit Reached」), whose 「Upgrade to Premium」 opens the subscription page; 「Today's AI Chats Are Used Up」 is for Pro+ only (R-103).
- R-278 [PM:pm-1002-update; Req: REQ-032] When some scenes fail, the chat's failure message is red text with an 「Edit」 button that opens Full Edit on the first failed scene.
- R-279 [PM:pm-1002-update; Req: REQ-032] Tapping 「Generate」 on an action card removes the card without adding a user bubble; the reply appears with a skeleton and the credit pill updates once the credits are charged.
- R-280 [PM:pm-1002-update (frame marked 新增); Req: REQ-032] While a scene image regenerates in scene detail, X asks 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with Leave anyway / Keep Generating.
- R-281 [PM:pm-1002-update; Req: REQ-032] While the video regenerates, tapping its download icon shows the toast 「Your video is still updating. Try again when it's done.」
- R-282 [PM:pm-1002-update; Req: REQ-032] The Storyboard Preview arrives together with the storyboard; it has no generating state of its own.
- R-283 [PM:pm-1002-update; Req: REQ-032] While a video regenerates, the preview stays and the line under its card reads 「Updating 1 scene... Your video will refresh when it's done.」 (the number of scenes being updated).
- R-284 [PM:pm-error-handling; Req: REQ-032] 5xxx scene-image and scene-video failure cards show the refund text and an 「Edit」 button.
- R-285 [PM:pm-error-handling, pm-1002-update; Req: REQ-032] 3 hours after a 6xxx upload failure the card reads 「We couldn't finish this video. Your credits have been refunded. Edit the description and try again.」 with 「Edit」, and Credit Details shows the credits returned.
- R-286 [PM:pm-update-5, pm-error-handling; Req: REQ-032] A failure shown in a 9:16 preview (a scene image in scene detail, a scene video in Full Edit) stays inside the frame: icon, title, description and button stacked and centred, text wrapped to the frame width with 12 px side margins.
- R-287 [PM:pm-main-flow; Req: REQ-032] The two inspiration chips are the first two strings of the 10-string pool; 「Surprise me」 picks only from the other strings.
- R-288 [PM:pm-main-flow; Req: REQ-032] Back before an outline starts (empty input, an idea typed but not sent, or the format card shown) returns to the AI Mini Drama landing page and saves nothing to History.
- R-289 [PM:pm-main-flow 「img: poster 劇照」; Req: REQ-032] Each landing-page template thumbnail is the template's poster still.
- R-290 [PM:pm-main-flow; Req: REQ-032] On the video result page, tapping a scene thumbnail moves the player to that scene.
- R-291 [PM:pm-main-flow; Req: REQ-032] While Make your character is generating, tapping the dark area outside the sheet asks 「Stop and lose your credits?」, as X does.
- R-292 [PM:pm-main-flow; Req: REQ-032] The reference-photo checks (no person, several people, public figure) run when Generate is tapped, not when the photo is added.
- R-293 [PM:pm-update-11 §13.23 (10/21); Req: REQ-032] 「Discard this character?」 reads 「It won't be saved, and the credits you spent won't be refunded.」 with 「Keep」 and a red 「Discard」.
- R-294 [PM:pm-update-3; Req: REQ-032] After 「Couldn't create some images」 is closed, 「{n} characters aren't set yet」 lists the failed characters marked 「!」; tapping one opens Character Library on it to regenerate or pick a look, and the story cannot continue until every character is set.
- R-295 [PM:pm-update-3; Req: REQ-032] While a chat storyboard-image update runs, only the changed scenes and the Storyboard Preview show skeletons; the other scenes show normally.
- R-296 [PM:pm-update-4; Req: REQ-032] Swiping the app away while the outline is still generating saves nothing: no History entry for that chat.
- R-297 [PM:pm-update-5 (10/6); Req: REQ-032] Sending a chat message with no network shows the toast 「You're offline. Check your connection and try again.」 instead of an AI message; the message does not go out and nothing is charged.
- R-298 [PM:pm-update-5 #4 (10/8); Req: REQ-032] When a 6xxx auto-retry succeeds and every scene is done, the done toast and push come once at that point.
- R-299 [PM:pm-update-6 (10/14); Req: REQ-032, REQ-055] In scene detail (Scene edit page only, per the board note 「Scene 編輯頁」; not the chat storyboard skeleton) the Location thumbnail shows a skeleton while generating, the location image on success (before the main image finishes) and a pink icon with 「Location • Failed」 on failure; the main image keeps its width.
- R-300 [PM:pm-update-6 (10/14); Req: REQ-032] When the location and the main image both fail, the main image shows its error card and the Location thumbnail its failure icon; Edit regenerates both and charges 2 images.
- R-301 [PM:pm-update-7 (10/16); Req: REQ-032] When Iris asks which character to change, the user can type the answer instead of tapping a chip; the new Story Outline & Characters card updates the outline text as well as the images.
- R-302 [PM:pm-update-8 (10/16); Req: REQ-032] The video model control is titled 「Model • Seedance」 and Best carries no 「NEW」 tag.
- R-303 [PM:pm-update-9 (10/16); Req: REQ-032] Send Feedback fills the e-mail only for a signed-in user, and the task ID is sent with the report without showing on the form.
- R-304 [PM:pm-update-9 (10/16); Req: REQ-032] 「Send Feedback」 is the blue primary button beside 「Close」 in the timeout dialog.
- R-305 [PM:pm-update-9 (10/16); Req: REQ-032] When Finish your characters completes it shows 「Your characters are ready」/「Tap Confirm to continue.」 instead of 「0 characters still need a look」.

### Hidden clauses
Coverage pass 9: a clause the screen does not show, how a tester observes it, and the rows that do.

| Requirement | Hidden clause | Observed through | Rows |
|---|---|---|---|
| R-018 | after the first idea is sent (visible) | screen | TC-020 |
| R-028 | nothing is sent and nothing is charged while offline | log (no request); Credit Details (no charge) | TC-032, TC-387 |
| R-040 | 「Upload 1 reference photo」 (a visible control) | screen | TC-047 |
| R-050 | the price is images (6 credits each, REQ-059) plus TTS | Credit Details rows: Text to Image, Text to Speech | TC-060 |
| R-063 | regenerating images also regenerates the TTS | log: a new TextToSpeech call | TC-074 |
| R-067 | a TTS failure and its refund | screen; Credit Details refund row | TC-078 |
| R-084 | after 3 h the credits are refunded | the card 3 hours later; Credit Details refund row | TC-095, TC-379 |
| R-086 | STT is not run with 「No captions」 | log: no speech-to-text call | TC-364 |
| R-087 | the retry reruns only the failed segments | log: STT calls before and after the retry | TC-365 |
| R-142 | the allowance is remote-configured | RD changes Firebase Remote Config | TC-369, TC-392, TC-393 |
| R-145 | the chat count is kept on the device | reinstall | TC-224 |
| R-163 | an STT failure (copy) | screen | TC-299 |
| R-164 | nothing is sent or charged while offline | log (no request); Credit Details (no charge) | TC-300 |
| R-265 | only the cropped image is sent | the reference image a log pull brings back | TC-366 |
| R-266 | the allowance comes from Firebase Remote Config | RD changes Remote Config | TC-369, TC-392, TC-393 |
| R-285 | the 6xxx upload failure is refunded after 3 h | the card 3 hours later; Credit Details refund row | TC-379 |
| R-303 | the task ID is sent with the report | the form shows no task ID (not submitted); the sent report needs RD | TC-336 |
| R-051 | in phase ② the storyboard keeps generating after the user leaves | reopening the drama from History shows it finished or still being created | TC-401, TC-402 |
| R-071 | in phase ② the video keeps generating after the user leaves | the History card 「processing..」, then the finished video | TC-082, TC-361 |
| R-333 | nothing is charged in phase ①; the video price is charged when phase ② starts | the credit pill before and after the card changes to 「Making your video...」 | TC-406 |
| R-334 | nothing is charged in phase ①; the storyboard price is charged when phase ② starts | the credit pill before and after the card changes to 「Creating your storyboard...」 | TC-377 |
| R-335 | the restarted job is charged only once | Mine › Credits › Details: one charge for the job | TC-063, TC-403, TC-409, TC-410 |
| R-336 | the job keeps running after the app is swiped away | the result in the reopened chat and History; one charge in Credit Details | TC-404, TC-411 |
| R-337 | the export finishes in the background after leaving the result page | the toast on the other page; the video in the Photos library | TC-415 |
| R-338 | a thumbnail tap does not change what is exported | the saved video in the Photos library is the whole drama | TC-414 |
| R-459 | a dimmed 「Submit」 sends nothing | the form stays open with no confirmation, toast or e-mail | TC-420 |
| R-463 | each discounted first generation is charged 2 credits per unit under the `…_aiminidrama_discount` action id | app log after a log pull: the charge's `action_id` and `total_credit`; Mine › Credits › Details: the charged amount | n/a (held until the user says the promotion applies, REQ-059) |
| R-464 | a regenerate in the discounted session is charged the normal price under the `…_aiminidrama_normal` action id | app log after a log pull: `action_id` and `total_credit`; Mine › Credits › Details: the charged amount | n/a (held until the user says the promotion applies, REQ-059) |
| R-465 | charges are booked under `…_aiminidrama_normal` (the `_discount` ids are held with the promotion, REQ-059) | app log after a log pull: the `action_id` of each charge (`"feature_id":"TextToImage"` / ReferenceToVideo) | TC-424, TC-421, TC-422, TC-423, TC-425, TC-426, TC-427 |

### Variants
Coverage pass 10: one line per variant the spec names.

| Requirement | Variant | Rows |
|---|---|---|
| R-068 | Best | TC-079 |
| R-068 | Standard | TC-347 |
| R-068 | Fast | TC-347 |
| R-102 | Free | TC-117 |
| R-102 | Pro (same dialog, R-277) | TC-216 |
| R-103 | Pro+ | TC-118 |
| R-103 | Pro (gets the Free dialog, R-277) | TC-216 |
| R-103 | Free (R-102 dialog) | TC-117 |
| R-142 | Free | TC-215, TC-218 |
| R-142 | Pro | TC-216, TC-367 |
| R-142 | Pro+ | TC-217, TC-368 |
| R-149 | ENU | TC-275 |
| R-149 | CHT | TC-276 |
| R-149 | JPN | TC-277 |
| R-253 | Best | TC-079 |
| R-253 | Standard | TC-347 |
| R-253 | Fast | TC-347 |
| R-266 | Free | TC-369 |
| R-266 | Pro | TC-392 |
| R-266 | Pro+ | TC-393 |
| R-277 | Pro | TC-216 |
| R-277 | Pro+ (R-103 dialog instead) | TC-118 |
| R-277 | Free (same dialog) | TC-117 |
| R-277 | Upgrade to Premium (subscription page) | TC-216 |
| R-051 | storyboard leave dialog (storyboard body) | TC-061 |
| R-071 | video leave dialog (video body) | TC-407 |
| R-332 | Create storyboard | TC-156 |
| R-332 | Generate Video | TC-157 |
| R-332 | storyboard update in chat | TC-405 |
| R-332 | video regeneration | TC-412 |
| R-335 | storyboard | TC-063, TC-403 |
| R-335 | video | TC-409, TC-410 |
| R-336 | storyboard | TC-404 |
| R-336 | video | TC-411 |
| R-457 | Free (no subscription): 「Get 7-Day Free Trial」 | TC-419 |
| R-457 | Pro: 「Continue」 on the Pro+ page | TC-216 |
| R-457 | Pro+ | n/a (a Pro+ user at the limit gets 「Continue Tomorrow」, R-103, and is not sent to this page) |
| R-463 | character image (2 per image) | n/a (held until the user says the promotion applies, REQ-059) |
| R-463 | storyboard scene (2 per scene) | n/a (held until the user says the promotion applies, REQ-059) |
| R-463 | Seedance 2.0 1080p video (2 per second) | n/a (held until the user says the promotion applies, REQ-059) |
| R-463 | Seedance 2.0 Mini 720p video (2 per second) | n/a (held until the user says the promotion applies, REQ-059) |
| R-463 | Seedance 2.5 video | n/a (held until the user says the promotion applies, REQ-059) |
| R-464 | regenerate a character | n/a (held until the user says the promotion applies, REQ-059) |
| R-464 | regenerate a storyboard scene image | n/a (held until the user says the promotion applies, REQ-059) |
| R-464 | regenerate a scene video | n/a (held until the user says the promotion applies, REQ-059) |
| R-465 | normal (`_aiminidrama_normal`) | TC-424, TC-421, TC-422, TC-423, TC-425, TC-426, TC-427 |
| R-465 | discount (`_aiminidrama_discount`) | n/a (held until the user says the promotion applies, REQ-059) |


## Added 2026-10-28 — Figma inventory (REQ-038 / REQ-039)
The Figma inventory (`extracted/inventory.json`) found 12 flow arrows the 10/19 import did not hold: three on the Storyboard
board's Error frames and nine on the Figma-only 「1016_Chat navigation」 board (4858:34930). On 1016 the four 「Leave anyway」
arrows start at the same button; the exit that opened the dialog decides the landing page. Dialog copy and when it shows follow
PM 10/21 (REQ-029, R-261 – R-264).

### Flow arrows with new rows
- R-306 [DS: flow arrow 4299-168964 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4299-168964] Scene image regenerating (生成, skeletons) → regenerated scene detail: when the regeneration finishes, the skeletons in the scene detail are replaced by the new Location and scene images side by side; the 「Couldn't create image」 card and 「Edit」 are gone and the title and full script stay.
- R-307 [DS: flow arrow 4877-33081 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33081] Leave dialog opened by History, 「Leave anyway」 → Recent Task: the chat closes and Recent Task (the History list) opens.
- R-308 [DS: flow arrow 4877-33083 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33083] Leave dialog opened by New chat, 「Leave anyway」 → new empty chat: the chat closes and a new empty chat opens (「Hi, I'm your AI Drama Assistant」, 「Surprise me」, idea suggestions, empty composer).
- R-309 [DS: flow arrow 4877-33087 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33087] Leave dialog opened by Back, 「Leave anyway」 → AI Mini Drama home page: the chat closes and the AI Mini Drama home page opens (「Hi, I'm your AI Drama Assistant」, 「Create Your Drama」, 「Start from a template」).

### Flow arrows walked by existing rows
- R-310 [DS: flow arrow 4299-132149 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4299-132149] Failed scene detail, ⓘ on the 「Couldn't create image」 card → 4xx dialog: ⓘ opens 「Couldn't generate this image」 with the refund and terms-of-service text and 「Got it」 (5xx cards have no ⓘ, R-057). Walked by: TC-067.
- R-311 [DS: flow arrow 4299-168955 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4299-168955] Failed scene detail, 「Edit」 on the error card → description editor: the full description becomes editable with the keyboard up, a x/1000 counter, a trash icon and 「Done」. Walked by: TC-070.
- R-312 [DS: flow arrow 4877-33073 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33073] Chat, Back → leave dialog: while the outline generates, Back opens 「Leave this chat?」 with 「Leave anyway」 / 「Stay」 (PM 10/21 stage rules, R-261 – R-264). Walked by: TC-025.
- R-313 [DS: flow arrow 4877-33075 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33075] Chat, credit pill → leave dialog: while the outline generates, the credit pill opens the same 「Leave this chat?」 dialog as Back. Walked by: TC-357.
- R-314 [DS: flow arrow 4877-33077 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33077] Chat, New chat → leave dialog: while the outline generates, New chat opens the same 「Leave this chat?」 dialog as Back. Walked by: TC-357.
- R-315 [DS: flow arrow 4877-33079 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33079] Chat, History → leave dialog: while the outline generates, History opens the same 「Leave this chat?」 dialog as Back. Walked by: TC-026.
- R-316 [DS: flow arrow 4877-33085 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33085] Leave dialog opened by the credit pill, 「Leave anyway」 → My Credits: the chat closes and My Credits opens. Walked by: TC-358.
- R-317 [DS: flow arrow 4877-33089 https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id=4877-33089] Leave dialog, 「Stay」 → chat: the dialog closes and the chat stays at the same stage; the outline still arrives. Walked by: TC-027, TC-357.

### Controls (REQ-039)
Controls of the Figma inventory that no existing rule described; each is pressed by the row named in `control-trace.json`.
- R-318 [DS: control K-20ac46 main flow · Storyboard & Preview / Chat (any stage)] 「More ideas +」: the chip above the composer offers more story ideas when tapped (the Design draws the chip on every chat stage but no result frame; Q-19).
- R-319 [DS: control K-55f3b5 / K-940021 / K-cf0dd5 Template Detail · AI Mini Drama] Template video ▶ and volume icon: ▶ over the paused template video resumes playback (Default_playing & volume on); the volume icon at the video's bottom right switches the sound off and on and shows the current state (ic_volume / ic_volume_off).
- R-320 [DS: control K-71866f MX · AI Mini Drama_characters] 「Continue Tomorrow」: closes the 「Today's AI Chats Are Used Up」 dialog and returns to the chat without sending the message (the dialog's only action; MX ① version A: closing the limit dialog returns to the chat).
- R-321 [DS: control K-938d8f / K-b32fbc / K-d1e307 1016_Chat navigation · Credit page_free] My Credits (the credit-pill exit's landing page, R-316): 「Buy More」 opens the credit purchase page; 「Claim」 claims the complimentary daily credits (「Claim once every 24 hours」) and adds them to the balance; 「Subscribe Now」 on the 「Join the Pro+」 card opens the Pro+ subscription page.
- R-322 [DS: control K-ab333a / C-8157ce Choose Character · credit; MX · storyboard / AI Mini Drama_template] 「Top up your credits」: tapping a credit pack (50 … 2000) selects it for 「Buy Credit」, one pack at a time; 「Terms of Use」 and 「Privacy Policy」 under the button open those pages.
- R-323 [DS: control K-6b314e / K-d301d1 / K-68cdee / K-cbd30c Choose Character · Character Library (Age keypad)] The Age keypad has an input bar (placeholder 「1-100」) and a ✓ that closes the keypad and fills Age with the typed number; tapping a filled Age field (e.g. 「24」) reopens the keypad to change it.
- R-324 [DS: control K-3276bb / C-8cec01 Choose Character · Character Library (filtered)] With filters applied the filter icon shows a check mark (ic_filter_check) and still opens the Filter panel; each applied-filter chip (「Female ×」, 「Asian ×」, 「Age: 0-28 ×」) removes that filter when its × is tapped (R-031).
- R-325 [DS: control K-32eae1 / K-ea3e9d / K-5554e3 / K-910afd Choose Character · Character Library (enlarged preview)] The enlarged character preview has ⓧ at its top right, which closes it back to the library, and ⋯, which opens 「Download」 (saves the character image to the device), 「Report」 (opens the report flow) and, for the user's own character, 「Delete」 (R-049).
- R-326 [DS: control K-f2a9d2 Choose Character · AI Mini Drama_template; 1005_Chat · Chat_charge failed] The ⟳ switch icon on a character in the Characters Result card opens Change Characters on that character (R-038: 「tap the switch icon on a character to change its look」).
- R-327 [DS: control C-88ef55 / K-327b3e / K-37e272 / K-aa0c0b / C-14cbaa Choose Character · Add Media] Select Media (reference photo): 「Photo」 is the media type; 「Recents ▾」 opens the album list; the source tabs (getty images | iStock, GIPHY, …) switch to that stock source; the enlarge icon on a photo opens a full-size preview; the sliders icon beside 「Photo」 opens the picker's options; the camera icon opens the camera. The Design draws these controls with no result frame or arrow.
- R-328 [DS: control K-1ff415 / K-af4631 Storyboard · preview] The full-screen Storyboard Preview player has X, ⏸ (pauses the slideshow; ▶ resumes it), a scrubber and the time 「00:40/01:30」; dragging the scrubber jumps to that point.
- R-329 [DS: control K-a28dca Storyboard · AI Mini Drama_storyboard] The main scene image in the scene detail has no tap action in the Design (no arrow, no enlarged frame); like the Location thumbnail (R-055), a tap leaves the scene detail as it is.
- R-330 [DS: control K-1ed4be Recent Task · Recent Task; 1016_Chat navigation · ④ History → Recent Task] 「New Chat」 at the bottom right of Recent Task (History) opens a new empty chat.
- R-331 [DS: control K-30a28e main flow · composer (every chat stage)] The mic in the composer (R-011) starts voice input, a dictation into the input (DRI261895P0002); stopping it without speaking adds no text.

Not in scope (control trace n/a): the Launcher's other controls on 「Launcher_2026_08」 (menu, 「Try Pro+ 7 days for free」, notifications, 「New Project」, 「Video Edit by Chat」, 「Video Enhance」, 「Image to Video」, 「Character Motion Swap」, 「Cinematic Reel Creator」, 「Text to Video」, 「Auto Edit」, 「Auto Captions」, 「Photo Enhance」 and the 「What's Trending」 covers) open other PowerDirector features; the Design draws the Launcher only as AI Mini Drama's entry, which R-001, R-002, R-190 and R-191 test.

## Added 2026-10-29 — PM Figma 10/22 frames (REQ-052)
Two PM Figma frames dated 10/22 (PM file 44RyrcOcWi2MvhGci9bO5F, page 「🆕 Spec with jau proposal」; board-notes 「PM — Figma
only, newer than the PM PDF」) are newer than the PM PDF of this set (10/21) and the Design frames, so they win where they
differ (AGENTS.md: newer wins). Changed above: R-051, R-052 (replaced), R-071, R-158, R-249, R-262, R-264. Open: Q-20 – Q-23.
- R-332 [PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] After Generate on 「Create storyboard」, on 「Generate Video」, on a storyboard update in chat or on a video regeneration, the chat offers no pause or stop: the input shows no ■ stop button, only the mic (the frame notes the current build has the ■ and must drop it).
- R-333 [PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] Video phase ①: after 「Generate Video」 the video settings card turns into a skeleton card in place titled 「Advancing the mini drama production.」 while Iris writes the prompt, and nothing is charged yet. Phase ②: the card reads 「Making your video...」 and the video price is charged at that point.
- R-334 [PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] Storyboard phase ①: after Generate on 「Create storyboard」 the card turns into a skeleton titled 「Preparing your scenes...」, and nothing is charged yet. Phase ②: the card reads 「Creating your storyboard...」 and the storyboard price is charged at that point.
- R-335 [PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] After 「Leave anyway」 in phase ①, or the app being swiped away or sent to the background in phase ①, returning to the chat restarts phase ① by itself: no second Generate, and the job is charged only once. Applies to the storyboard and the video.
- R-336 [PM:figma 10/22 Storyboard/Video two phases 4422:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-2; Req: REQ-052] In phase ②, swiping the app away does not stop the job: the storyboard or the video finishes and is in the chat and History on return.
- R-337 [PM:figma 10/22 Export Full Video while exporting 4418:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2; Req: REQ-052] While Export Full Video runs, Back stays enabled: leaving the result page lets the export finish in the background, and when it is done the toast 「Saved to Photos.」 shows on whatever page the user is on.
- R-338 [PM:figma 10/22 Export Full Video while exporting 4418:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2; Req: REQ-052] While Export Full Video runs, the scene thumbnails stay tappable: a tap switches the preview to that scene only and does not affect the export.
- R-339 [PM:figma 10/22 Export Full Video while exporting 4418:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2; Req: REQ-052] When the export fails, the toast reads 「Couldn't save your video. Try again.」, the spinner goes, every control (Back, Full Edit, Export Full Video, download, play, thumbnails) is restored, and Export Full Video can be pressed again.
- R-340 [PM:figma 10/22 Export Full Video while exporting 4418:2 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4418-2; Req: REQ-052] On iOS the first export asks for photo library access; when access is denied the controls are restored and the toast reads 「Allow Photos access in Settings to save your video.」

## Added 2026-10-29 — PM / MX Figma arrows (REQ-052)
The PM and MX Figma inventory (REQ-052) holds 121 flow arrows the Design import did not (PM 44RyrcOcWi2MvhGci9bO5F, MX
3urWYejMUP2uaglb4s73M5; `extracted/arrows.json`, `source: "figma-inventory"`). Each was read from its from and to screen
sheets (`extracted/inventory-sheets/<board>/`) and the board transcriptions. Most PM main-flow arrows repeat a Design flow;
where the PM or MX frame's copy differs, the Design (or the newer PM 10/22 frame) wins and the line says so. Six arrows are
not flows (`not_flow` in arrows.json): five 「Stop and lose your credits?」 storyboard exits superseded by the PM Figma 10/22
frame 4422:2 (R-051, R-262) and one connector that ends on no frame. Open: Q-24 – Q-27.

### PM / MX flow arrows with new rows
No arrow needed a new row: each rule no row walked was checked on the same screen with the same setup as an existing row, so that row was modified (REQ-033) and cites the requirement in its Spec Ref.
- R-341 [PM: flow arrow 2701-22119 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22119] Error Handling: chat after scene failures (older 「Some videos couldn't be generated. Try again.」 frame), tap the video card → result page on the failed scene: Tapping the video card opens the result page (Full Edit, Export Full Video, scene thumbnails) on the failed scene, whose card reads 「Couldn't create video」 with 「Edit」 (as R-080, R-082). Row: TC-093 (modified).
- R-342 [PM: flow arrow 2701-22120 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22120] Error Handling: chat 「{n} scenes couldn't be generated. … Tap Edit to regenerate, or tell me what to change.」, tap the video card → result page on the failed scene: Tapping the video card opens the result page on the failed scene, whose card reads 「Couldn't create video」 with 「Edit」; the failed clip has no download icon (as R-080, R-082). Row: TC-093 (modified).
- R-343 [PM: flow arrow 2621-30229 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30229] Error Handling: chat after a 6xxx / retryable scene failure (older frame), tap the video card → result page on the failed scene: Tapping the video card opens the result page on the failed scene, whose card reads 「Couldn't create video」/「Something went wrong. Give it another try.」 with 「Retry」 (as R-081, R-082). Row: TC-093 (modified).
- R-344 [PM: flow arrow 2621-30230 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30230] Error Handling: chat 「Some videos need another try.」, tap the video card → result page on the failed scene: Tapping the video card opens the result page on the failed scene with its 「Retry」 card (「Something went wrong. Give it another try.」) (as R-081, R-082). Row: TC-093 (modified).
- R-345 [PM: flow arrow 2701-22188 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22188] Error Handling: result page while a scene regenerates after 「Retry」 (「generating...」), 「Export Full Video」 → toast: 「Export Full Video」 starts no export while a scene is still generating; a toast with an icon explains it (copy not given, Q-24) (as R-085). Row: TC-096 (modified).
- R-346 [PM: flow arrow 2651-21992 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2651-21992] Error Handling: result page while a scene regenerates after 「Regenerate Video」 (「generating...」), 「Export Full Video」 → toast: 「Export Full Video」 starts no export while the scene regenerates; a toast with an icon explains it (copy not given, Q-24) (as R-085). Row: TC-096 (modified).
- R-347 [MX: flow arrow 1224-10079 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10079] MX ① (version A): template chat with the limit dialog, close it (ⓧ) → template chat: Closing the limit dialog leaves the template chat open with nothing sent (as R-143). Row: TC-221 (modified).
- R-348 [MX: flow arrow 1034-40228 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-40228] MX ① (version A): Free limit dialog, 「Upgrade to Premium」 → subscription page (free user): 「Upgrade to Premium」 opens the subscription page with the Pro / Pro+ tabs, the plan comparison and 「Get 7-Day Free Trial」 (as R-102, R-144). Row: TC-117 (modified).
- R-349 [MX: flow arrow 1224-10081 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10081] MX ① (version A): limit dialog over a template chat, 「Upgrade to Premium」 → subscription page (free user): 「Upgrade to Premium」 on the template-chat dialog opens the same subscription page as in a typed chat (as R-102, R-144). Row: TC-117 (modified).
- R-350 [MX: flow arrow 1224-10312 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10312] MX ① (version A): subscription page (free user), ‹ → chat: ‹ on the subscription page without subscribing returns to the chat; the limit dialog is closed and the message was not sent (as R-143). Row: TC-117 (modified).
- R-351 [MX: flow arrow 1224-10503 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10503] MX ① (version A): subscription page (pro user), ‹ → chat: ‹ on the Pro+ subscription page without subscribing returns to the chat with the dialog closed (as R-143, R-277). Row: TC-216 (modified).
- R-352 [MX: flow arrow 1572-23894 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1572-23894] MX ② first-time discount: subscription page, ‹ → chat with the not-enough card: ‹ without subscribing returns to the chat with the same not-enough card (as R-146). Row: TC-226 (modified).
- R-353 [MX: flow arrow 1572-23896 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1572-23896] MX ② charging: subscription page opened from 「Upgrade Now」, ‹ → chat with the not-enough card: ‹ without subscribing returns to the chat; the card still shows the not-enough copy and 「Upgrade Now」 (as R-146). Row: TC-226 (modified).
- R-354 [PM: flow arrow 2611-27730 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-27730] Main flow: 「More than one person detected」, 「Use another photo」 → Add Media: 「Use another photo」 closes the warning and opens Add Media to choose a different reference photo (as R-044). Row: TC-052 (modified).
- R-355 [PM: flow arrow 2611-28043 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-28043] Main flow: 「No person detected」, 「Use another photo」 → Add Media: 「Use another photo」 closes the warning and opens Add Media to choose a different reference photo (as R-045). Row: TC-053 (modified).
- R-356 [PM: flow arrow 2611-27729 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-27729] Main flow: 「This photo can't be used」, 「Use another photo」 → Add Media: 「Use another photo」 closes the block and opens Add Media to choose a different reference photo (as R-046). Row: TC-054 (modified).
- R-357 [PM: flow arrow 2613-28739 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2613-28739] Main flow: 「Delete this character?」, 「Cancel」 → Change Characters: 「Cancel」 closes the dialog and the character stays in the library (as R-049). Row: TC-058 (modified).

### PM / MX flow arrows walked by existing rows
- R-358 [PM: flow arrow 2628-34404 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2628-34404] Error Handling: single character failure 「Got it」 → Change Characters: 「Got it」 on 「Couldn't create image」/「We couldn't create this character. Your credits have been refunded. Try again.」 closes the dialog and returns to Change Characters with the Character Library (as R-036, R-241). Walked by: TC-043.
- R-359 [PM: flow arrow 2701-22184 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22184] Error Handling: result page, 「Edit」 on the failed scene card → scene-video editor: 「Edit」 opens the scene-video description editor (Cinematic Style / Scene / Motion / Camera text, expand icon) with the regenerate button priced by the model used (as R-131, R-175). Walked by: TC-146.
- R-360 [PM: flow arrow 2701-22185 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22185] Error Handling: scene-video editor, 「Regenerate Video ◆30」 → result page with the scene 「generating...」: The regeneration starts: the result page shows that scene generating while the other scenes stay (as R-134). Walked by: TC-149.
- R-361 [PM: flow arrow 2703-22780 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2703-22780] Error Handling: ⓘ on a 4xxx 「Couldn't create video ⓘ」 card → 「Couldn't generate this video」 dialog: ⓘ opens 「Couldn't generate this video」/「Your credits have been refunded. The description may not meet our terms of service, such as violence, NSFW content, or content involving minors. Edit the description to try again.」 with 「Got it」 (as R-257, R-286). Walked by: TC-362.
- R-362 [PM: flow arrow 2621-30440 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30440] Error Handling: failed-scene editor, 「Regenerate Image ◆6」 → scene detail with the image skeleton: 「Regenerate Image」 starts the regeneration: the scene detail shows a skeleton where the image was and the credits are charged once (as R-126, R-060). Walked by: TC-141, TC-071.
- R-363 [PM: flow arrow 2621-30441 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30441] Error Handling: failed scene detail, 「Edit」 on 「Couldn't create image ⓘ」 → description editor with 「Regenerate Image ◆6」: 「Edit」 opens the scene description editor with 「Regenerate Image ◆6」 (as R-059, R-311). Walked by: TC-070.
- R-364 [PM: flow arrow 2621-30307 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30307] Error Handling: result page, 「Retry」 on the failed scene → the scene 「generating...」: 「Retry」 starts that scene again: its preview shows 「generating...」 (as R-081, R-242). Walked by: TC-092.
- R-365 [PM: flow arrow 2719-22996 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2719-22996] Error Handling: Storyboard Result, failed scene card (⟳ only) → failed scene detail: Opening a failed scene from the Storyboard Result shows its scene detail with 「Couldn't create image」, the refund text and 「Edit」 (as R-058, R-239). Walked by: TC-067, TC-390.
- R-366 [PM: flow arrow 2621-30442 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30442] Error Handling: scene detail regenerating (skeleton) → regenerated scene detail: When the regeneration ends the skeleton is replaced by the new image (with its ⋯ menu); title and script stay (as R-060, R-306). Walked by: TC-071, TC-397.
- R-367 [PM: flow arrow 2628-34410 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2628-34410] Error Handling: scene detail regenerating, X → 「Stop and lose your credits?」: X while the scene image regenerates asks 「Stop and lose your credits?」/「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」 with 「Leave anyway」/「Keep Generating」 (scene-image regeneration is not one of the 10/22 two-phase jobs, Q-22) (as R-280). Walked by: TC-378.
- R-368 [PM: flow arrow 2621-30306 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30306] Error Handling: result page, retried scene 「generating...」 → failed again with 「Edit」: When the retry fails too, the scene card offers 「Edit」 instead of 「Retry」 (Design copy 「Retrying didn't work. Try a different description.」; the PM frame reads 「Your credits have been refunded. Edit the description and try again.」, Q-27) (as R-081, R-243). Walked by: TC-092.
- R-369 [PM: flow arrow 2621-30308 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30308] Error Handling: result page, 「Edit」 on the twice-failed scene → scene-video editor: 「Edit」 opens the scene-video description editor with the priced regenerate button (as R-081, R-131). Walked by: TC-092, TC-146.
- R-370 [PM: flow arrow 2621-30309 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2621-30309] Error Handling: scene-video editor, 「Regenerate Video ◆30」 → the scene 「generating...」 on the result page: The regeneration starts and the result page shows that scene generating (as R-134). Walked by: TC-149.
- R-371 [MX: flow arrow 1083-16545 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1083-16545] MX ① (version A): template detail 「Make my version」 at the daily chat limit → template chat with the limit dialog: The template chat opens first, then the limit dialog for the tier appears over it (as R-143). Walked by: TC-221.
- R-372 [MX: flow arrow 1034-1957 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-1957] MX ① (version A): Free user at the limit, send ↑ → 「Daily Free Chat Limit Reached」: The send shows 「Daily Free Chat Limit Reached」/「You have used up your AI Mini Drama free chats. To keep chatting, please upgrade to Premium.」 with 「Upgrade to Premium」; nothing is sent (as R-102, R-142). Walked by: TC-117.
- R-373 [MX: flow arrow 1034-39559 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-39559] MX ① (version A): Pro user at the limit, send ↑ → Free limit dialog: A Pro user's send at the limit shows the Free-type dialog (mockup title 「Free Chat Limit Reached」) with 「Upgrade to Premium」, not 「Today's AI Chats Are Used Up」 (as R-277). Walked by: TC-216.
- R-374 [MX: flow arrow 1224-10486 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10486] MX ① (version A): Free limit dialog, ⓧ → chat: ⓧ closes the dialog; the chat stays with the unsent text in the input (as R-143). Walked by: TC-219.
- R-375 [MX: flow arrow 1034-40811 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-40811] MX ① (version A): Pro+ user at the limit, send ↑ → 「Today's AI Chats Are Used Up」: A Pro+ user's send at the limit shows 「Today's AI Chats Are Used Up」/「They'll refresh tomorrow, and we'll be ready to chat again.」 (button 「Continue Tomorrow」 per the Design; the MX frame reads 「Try Again Later」, Q-26) (as R-103, R-277). Walked by: TC-118.
- R-376 [MX: flow arrow 1034-40514 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-40514] MX ① (version A): Pro limit dialog, 「Upgrade to Premium」 → subscription page (pro user): 「Upgrade to Premium」 opens the Pro+ subscription page (「PowerDirector Pro+」, plan comparison, 「Continue」) (as R-277). Walked by: TC-216.
- R-377 [MX: flow arrow 1224-10502 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1224-10502] MX ① (version A): Pro limit dialog, ⓧ → chat: ⓧ closes the dialog; the chat stays with the unsent text in the input (as R-143). Walked by: TC-219.
- R-378 [MX: flow arrow 1563-16786 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1563-16786] MX ② charging: Free user's not-enough video card, 「Upgrade Now」 → subscription page: 「Upgrade Now」 opens the subscription page (Pro / Pro+, 「Get 7-Day Free Trial」) (as R-146). Walked by: TC-226.
- R-379 [MX: flow arrow 1563-21899 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1563-21899] MX ② charging: subscription completed from the card → chat, the card now offers 「Generate」 at the discounted price: After subscribing in this session the chat comes back with the card switched to the enough-credits copy and 「Generate」, priced with the first-time credit discount (as R-146, R-147). HELD (REQ-059, 2026-10-29): the discounted price is held until the user says the promotion applies; NOT TESTABLE until then (its row TC-231 is parked).
- R-380 [MX: flow arrow 1563-22392 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1563-22392] MX ② first-time discount: Free user's not-enough card (labelled 「Buy Credits」 in this frame) → subscription page: A Free user's not-enough card opens the subscription page (the rows follow the MX note's 「Upgrade Now」 label, Q-25) (as R-146, R-147). Walked by: TC-226.
- R-381 [MX: flow arrow 1057-4729 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1057-4729] MX ② charging: Paid user's not-enough card, 「Buy Credits」 → 「Top up your credits」 panel: 「Buy Credits」 opens 「Top up your credits」 with 「{X} credits needed. You have {Y} credits left.」 and the 2000 pack selected (as R-146, R-322). Walked by: TC-225.
- R-382 [MX: flow arrow 1563-21897 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1563-21897] MX ② charging: Credit Panel 「Buy Credit」 → chat, the card now offers 「Generate」: After buying credits the chat shows the card with the enough-credits copy and 「Generate」 (the charge is confirmed again before anything is charged) (as R-146). Walked by: TC-227, TC-228.
- R-383 [MX: flow arrow 1572-23891 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1572-23891] MX ② charging: scene-video editor 「Regenerate Video ◆225」 with 182 credits → 「Top up your credits」: A regeneration priced above the balance opens 「Top up your credits」/「225 credits needed. You have 182 credits left.」 instead of regenerating (as R-137, R-146). Walked by: TC-152.
- R-384 [PM: flow arrow 2531-22643 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2531-22643] Main flow: empty chat, 「Surprise me」 → idea input filled: 「Surprise me」 puts a random inspiration into the input (not sent) (as R-014). Walked by: TC-014.
- R-385 [PM: flow arrow 2595-44970 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2595-44970] Main flow: Change Characters with a slot still unset, ✓ → 「1 character isn't set yet」 sheet: ✓ with one unset slot opens the unset-character sheet with that slot marked and 「Generate」 / 「Choose myself」 (Design copy, R-033) (as R-033, R-218). Walked by: TC-040.
- R-386 [PM: flow arrow 2286-21802 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21802] Main flow: Change Characters, pick a library look → the look is set on the selected cast tab: Choosing a library character sets it on the selected cast tab (check mark on the card) (as R-029, R-210). Walked by: TC-033.
- R-387 [PM: flow arrow 2595-44983 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2595-44983] Main flow: Change Characters with unsaved picks, X → leave warning: X with unsaved picks asks before leaving (Design 「Leave without finishing?」/「If you leave now, your picks won't be saved.」 with 「Leave」/「Keep choosing」; the PM frame's 「Discard character changes?」 is older) (as R-032, R-219). Walked by: TC-037.
- R-388 [PM: flow arrow 2595-44984 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2595-44984] Main flow: leave warning, 「Discard」 (Design 「Leave」) → chat outline: Leaving from the warning closes Change Characters and returns to the chat outline without the unsaved picks (as R-032, R-219). Walked by: TC-038.
- R-389 [PM: flow arrow 3152-16328 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3152-16328] Main flow: outline generating, Back → 「Leave this chat?」: Back while the outline generates asks 「Leave this chat?」/「Your story outline isn't ready yet, so this chat won't be saved.」 with 「Leave anyway」/「Stay」 (as R-022, R-312). Walked by: TC-025.
- R-390 [PM: flow arrow 2286-21806 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21806] Main flow: landing 「Create Your Drama」 → empty chat with the keyboard: 「Create Your Drama」 opens an empty chat with 「Surprise me」, two inspiration chips and the keyboard up (as R-011, R-192). Walked by: TC-011.
- R-391 [PM: flow arrow 2286-21807 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21807] Main flow: empty chat, type an idea → idea in the input: The typed idea shows in the input with the send button (as R-011). Walked by: TC-020.
- R-392 [PM: flow arrow 2458-20836 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2458-20836] Main flow: empty chat, Back → landing: Back from a chat with nothing sent returns to the landing page with no dialog and nothing saved to History (as R-288). Walked by: TC-381.
- R-393 [PM: flow arrow 2458-20839 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2458-20839] Main flow: format card shown, Back → landing: Back at the format card returns to the landing page with no dialog and nothing saved to History (as R-288). Walked by: TC-381.
- R-394 [PM: flow arrow 2285-17950 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2285-17950] Main flow: switch icon on a set character in the Characters Result card → Change Characters: The switch icon opens Change Characters on that character (as R-326). Walked by: TC-310.
- R-395 [PM: flow arrow 2285-17953 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2285-17953] Main flow: switch icon on another set character → Change Characters: The switch icon opens Change Characters on the character it belongs to (as R-326). Walked by: TC-310.
- R-396 [PM: flow arrow 2286-21104 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21104] Main flow: Change Characters with every slot set, ✓ → chat with the completed Characters Result: ✓ returns to the chat; the Characters Result shows every look and Iris prepares the storyboard offer (as R-037, R-198). Walked by: TC-044.
- R-397 [PM: flow arrow 2286-21808 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21808] Main flow: idea sent → format card: Sending the idea shows the format question 「What format would you like for your video?」 (language, captions) (as R-018, R-194). Walked by: TC-020.
- R-398 [PM: flow arrow 2295-17339 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2295-17339] Main flow: Change Characters, a look picked for every cast tab: Each cast tab shows its chosen look and ✓ can confirm the cast (as R-029, R-210). Walked by: TC-033, TC-044.
- R-399 [PM: flow arrow 2286-21809 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-21809] Main flow: format card 「Continue」 → outline with unset character slots: 「Continue」 replaces the card with the answer bubble and the outline arrives with its Characters Result slots unset (as R-019, R-021, R-205). Walked by: TC-022, TC-024.
- R-400 [PM: flow arrow 2286-19458 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-19458] Main flow: template chat format card 「Continue」 → template outline: 「Continue」 on a template's format card starts the template's outline (as R-009, R-196). Walked by: TC-236.
- R-401 [PM: flow arrow 2323-19567 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2323-19567] Main flow: outline slot 「Sophie」 → Change Characters on Sophie: Tapping a named slot opens Change Characters with that character's tab selected (as R-029, R-215). Walked by: TC-033.
- R-402 [PM: flow arrow 2323-19568 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2323-19568] Main flow: outline slot 「The Manager」 → Change Characters on The Manager: Tapping another named slot opens Change Characters on that character (as R-029, R-215). Walked by: TC-033.
- R-403 [PM: flow arrow 2287-22301 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2287-22301] Main flow: video settings, tap another model → price updates: Choosing another model updates the Generate Video price at once (Design 10/16: Best / Standard / Fast) (as R-069, R-253). Walked by: TC-080.
- R-404 [PM: flow arrow 2295-18666 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2295-18666] Main flow: video settings 「Generate Video」 → video generating: 「Generate Video」 starts the video in the chat (phase ① 「Advancing the mini drama production.」 per PM 10/22) (as R-201, R-333). Walked by: TC-406.
- R-405 [PM: flow arrow 2592-21573 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2592-21573] Main flow: Characters Result complete (「Thinking...」) → Create storyboard card: Iris says 「The characters look great! Ready to create the storyboard?」 with the Create storyboard card (price, Generate) (as R-037). Walked by: TC-044.
- R-406 [PM: flow arrow 2592-21574 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2592-21574] Main flow: 「Create storyboard」 Generate → storyboard generating: Generate turns the card into the storyboard progress card (phase ① 「Preparing your scenes...」 per PM 10/22) with no user bubble (as R-050, R-334). Walked by: TC-377.
- R-407 [PM: flow arrow 2286-22038 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2286-22038] Main flow: 「Create storyboard」 Generate → finished storyboard: The storyboard is generated and the chat shows 「Here's your storyboard」 with the Storyboard Result and Storyboard Preview (as R-050, R-053). Walked by: TC-060, TC-064.
- R-408 [PM: flow arrow 3146-17088 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3146-17088] Main flow: finished storyboard → video settings card: After the storyboard the chat shows 「Choose your video settings」 with model, length and 「Generate Video」 (as R-068, R-211). Walked by: TC-079.
- R-409 [PM: flow arrow 3692-20998 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3692-20998] Main flow: video generating, Back → landing with the History toast: Back while the video is made (phase ②) opens the landing page with 「We'll keep making your video. Find it in History.」 and, the first time, the bubble 「Find your video here in History.」 (as R-071, R-072). Walked by: TC-082, TC-083.
- R-410 [PM: flow arrow 2295-18667 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2295-18667] Main flow: preview video generating → 「Here's your drama.」 with the full-episode offer: The finished preview shows 「Here's your drama.」 with the video, then 「Looking good! Ready for the full video?」 with 「Create the full episode (90 sec)」 and its price (as R-075, R-213). Walked by: TC-086.
- R-411 [PM: flow arrow 2340-53370 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2340-53370] Main flow: 「Create the full episode」 Generate → full video generating: Generate on the full-episode card starts the full video (as R-203). Walked by: TC-087.
- R-412 [PM: flow arrow 2340-53371 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2340-53371] Main flow: full video generating → finished full video: The finished full video shows with the next-episode offer (Design 「Ready for the next episode?」/「Create Next Episode」) (as R-076, R-209). Walked by: TC-087.
- R-413 [PM: flow arrow 2592-43757 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2592-43757] Main flow: tap the preview video in the chat → result page: Tapping the video opens the result page with 「Full Edit」, 「Export Full Video」 and one thumbnail per scene (as R-077). Walked by: TC-088, TC-382.
- R-414 [PM: flow arrow 2592-43758 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2592-43758] Main flow: tap the full video in the chat → result page: Tapping the full video opens the result page with every scene's thumbnail (as R-077). Walked by: TC-088, TC-382.
- R-415 [PM: flow arrow 2285-19139 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2285-19139] Main flow: Change Characters 「Create my character」 tile → Make your character: The tile opens the Make your character form (as R-040, R-223). Walked by: TC-047.
- R-416 [PM: flow arrow 2340-30314 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2340-30314] Main flow: Make your character, 「Upload 1 reference photo」 → Add Media: The reference slot opens Add Media (Select Media) to pick a photo (as R-113). Walked by: TC-128.
- R-417 [PM: flow arrow 2340-30315 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2340-30315] Main flow: Add Media, pick a photo → form with the reference: The chosen photo is set as the reference on the form (after the Design's crop step) (as R-114, R-116). Walked by: TC-129, TC-131.
- R-418 [PM: flow arrow 3678-21038 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3678-21038] Main flow: Make your character with input, X → 「Discard this character?」: X with something entered asks 「Discard this character?」/「What you've entered won't be saved.」 with Discard / Keep editing (as R-047). Walked by: TC-055.
- R-419 [PM: flow arrow 2285-12130 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2285-12130] Main flow: character generating → generated character: When generation ends the front/side/back views show with the confirm action (Design 「Save to library」) (as R-117). Walked by: TC-132.
- R-420 [PM: flow arrow 2285-12131 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2285-12131] Main flow: generated character, confirm (Design 「Save to library」) → Change Characters with the look applied: Confirming applies the new character to the slot and lists it in the library with the My character tag (as R-118, R-269). Walked by: TC-133.
- R-421 [PM: flow arrow 2340-53109 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2340-53109] Main flow: character generating, X → 「Stop and lose your credits?」: X while the character generates asks 「Stop and lose your credits?」 with 「Leave anyway」/「Keep Generating」 (as R-245). Walked by: TC-334.
- R-422 [PM: flow arrow 2611-27728 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-27728] Main flow: form with a public figure's photo, Generate → 「This photo can't be used」: Generate with a celebrity photo shows 「This photo can't be used」/「It looks like a real public figure. Please try another photo.」 and does not generate (as R-046). Walked by: TC-054.
- R-423 [PM: flow arrow 2611-27727 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-27727] Main flow: form with a group photo, Generate → 「More than one person detected」: Generate with several people shows 「More than one person detected」 with 「Generate anyway」/「Use another photo」 (as R-044, R-292). Walked by: TC-052.
- R-424 [PM: flow arrow 2611-28035 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-28035] Main flow: form with a photo of no person, Generate → 「No person detected」: Generate with no person shows 「No person detected」/「Results may not turn out well. Want to try anyway?」 (as R-045). Walked by: TC-053.
- R-425 [PM: flow arrow 2611-28044 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2611-28044] Main flow: valid form with a reference, Generate → character generating: Generate starts the character generation (「generating your character...」) (as R-041, R-224). Walked by: TC-049, TC-132.
- R-426 [PM: flow arrow 2613-28717 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2613-28717] Main flow: enlarged character ⋯ 「Report」 → Send Feedback: 「Report」 opens the Send Feedback form (as R-049, R-325). Walked by: TC-135.
- R-427 [PM: flow arrow 2613-28731 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2613-28731] Main flow: enlarged own character ⋯ 「Delete」 → 「Delete this character?」: 「Delete」 asks 「Delete this character?」/「This character will be permanently deleted and can't be recovered.」 with Cancel / Delete (as R-049). Walked by: TC-058.
- R-428 [PM: flow arrow 2613-28591 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2613-28591] Main flow: Change Characters, a character's enlarge control → enlarged preview with ⋯: The enlarge control opens the character's enlarged preview with ⋯ (Download, Report, Delete for the user's own) (as R-120, R-325). Walked by: TC-135.
- R-429 [PM: flow arrow 3359-20678 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3359-20678] Main flow: Change Characters filter icon → Filter panel: The filter icon opens the Filter panel (Clear, My characters only, Gender, Ethnicity, Age, ✓) (as R-031, R-227). Walked by: TC-036.
- R-430 [PM: flow arrow 3970-44074 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3970-44074] Update 7: Iris asks which character → 「Update characters」 card: After the user names the character, Iris shows 「Ready to update your characters?」 with the 「Update characters • 1 character」 card (price, Generate) (as R-254, R-301). Walked by: TC-348, TC-391.
- R-431 [PM: flow arrow 3970-44075 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3970-44075] Update 7: 「Update characters」 Generate → 「Working on it...」: Generate removes the card and Iris replies 「Working on it...」 while the character updates (as R-254). Walked by: TC-349.
- R-432 [PM: flow arrow 3970-44076 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3970-44076] Update 7: 「Working on it...」 → characters updated with the Create storyboard card: The update ends with the new look in a Story Outline & Characters card and a priced Create storyboard card (as R-254). Walked by: TC-349.
- R-433 [PM: flow arrow 4422-26772 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4422-26772] PM 10/22 two phases: video phase ① (「Advancing the mini drama production.」), Back → 「Leave while we're preparing?」: Back in video phase ① asks 「Leave while we're preparing?」 with the video body, 「Stay」 and a red 「Leave anyway」 (as R-071). Walked by: TC-407.
- R-434 [PM: flow arrow 4456-263 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4456-263] PM 10/22 two phases: storyboard phase ① (「Preparing your scenes...」), Back → 「Leave while we're preparing?」: Back in storyboard phase ① asks 「Leave while we're preparing?」 with the storyboard body, 「Stay」 and a red 「Leave anyway」 (as R-051). Walked by: TC-061.
- R-435 [PM: flow arrow 3505-20031 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3505-20031] Update 6: Storyboard Result, failed scene card → scene detail with the error card: Opening the failed scene shows 「Couldn't create image ⓘ」 with the refund text and 「Edit」 under the main image, Location below (as R-056, R-239). Walked by: TC-067, TC-390.
- R-436 [PM: flow arrow 3505-20032 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3505-20032] Update 6: scene description editor, 「Done」 → regeneration offer: 「Done」 closes the editor back to the scene with the edited text and 「Regenerate Image ◆6」 (as R-059, R-240). Walked by: TC-070.
- R-437 [PM: flow arrow 3505-20033 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3505-20033] Update 6: scene description editor, collapse icon → regeneration offer: The collapse icon closes the editor back to the scene with the edited text and 「Regenerate Image ◆6」 (as R-125). Walked by: TC-140.
- R-438 [PM: flow arrow 3505-20034 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3505-20034] Update 6: 「Regenerate Image ◆6」 → scene detail with skeletons: 「Regenerate Image」 shows skeletons for the scene image (and the Location) until the new images arrive (as R-060, R-126). Walked by: TC-071, TC-141.
- R-439 [PM: flow arrow 3327-19587 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3327-19587] Update 5: 「Captions couldn't be added. Try again」, 「Try again」 → 「Adding captions…」: 「Try again」 changes the line to 「Adding captions…」 while the video stays (as R-087, R-244). Walked by: TC-098.
- R-440 [PM: flow arrow 3327-19588 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3327-19588] Update 5: 「Adding captions…」 → captions added: When every caption segment succeeds the captioned video replaces it and the failure line disappears (as R-136). Walked by: TC-151.
- R-441 [PM: flow arrow 3130-17768 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17768] 1002 update: chat scrolled up, ↓ → chat at the bottom: ↓ scrolls to the newest message and hides itself (as R-088, R-274). Walked by: TC-374.
- R-442 [PM: flow arrow 3130-17769 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17769] 1002 update: action card 「Generate」 → card in progress, no user bubble: Generate turns the card into its progress state in place; no user bubble is added (as R-279). Walked by: TC-377.
- R-443 [PM: flow arrow 3130-17770 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17770] 1002 update: action card 「Generate」 offline → charge failed: Offline, Generate sends and charges nothing; 「You're offline. Check your connection and try again.」 shows (toast per PM 10/6) and the card stays (as R-164). Walked by: TC-300.
- R-444 [PM: flow arrow 3130-17772 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17772] 1002 update: scene detail regenerating, X → 「Stop and lose your credits?」: X while the scene image regenerates asks 「Stop and lose your credits?」 with 「Leave anyway」/「Keep Generating」 (as R-280). Walked by: TC-378.
- R-445 [PM: flow arrow 3130-17773 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17773] 1002 update: video regenerating, download → toast: Download during the regeneration shows 「Your video is still updating. Try again when it's done.」 (as R-281). Walked by: TC-096.
- R-446 [PM: flow arrow 3130-17774 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3130-17774] 1002 update: video regenerating → video updated: The regenerated video replaces the old one and 「Your video has been updated.」 shows under it (as R-085, R-130). Walked by: TC-096, TC-145.
- R-447 [PM: flow arrow 3153-17814 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3153-17814] Update 3: 「Generating...」 for several characters → 「Couldn't create some images」: When some characters fail, the successful ones are applied and 「Couldn't create some images」/「{n} characters couldn't be created. Your credits have been refunded. Tap a character to try again.」 shows (as R-035). Walked by: TC-042.
- R-448 [PM: flow arrow 3153-17816 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3153-17816] Update 3: 「Couldn't create some images」, X → 「{n} characters aren't set yet」 with the failed slots: Closing it shows the unset-characters sheet with the failed characters marked 「!」 (as R-294). Walked by: TC-384.
- R-449 [PM: flow arrow 3153-17818 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3153-17818] Update 3: failed 「!」 character → Change Characters on that character: Tapping the failed character opens Change Characters on it (as R-294). Walked by: TC-384.
- R-450 [PM: flow arrow 3168-18114 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3168-18114] Update 3: ask Iris to change a storyboard image → confirm card: Iris replies with the priced update card (Design: a 「Create storyboard」 card, 6 credits per image, REQ-059) and Generate (as R-061). Walked by: TC-072.
- R-451 [PM: flow arrow 3168-18116 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3168-18116] Update 3: update card 「Generate」 → storyboard images updating: Generate removes the card and a new storyboard message shows skeletons on the changed scenes and the preview (as R-062, R-295). Walked by: TC-073, TC-385.
- R-452 [PM: flow arrow 3168-18117 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3168-18117] Update 3: updating → storyboard images updated: The changed scenes show their new images in the new storyboard message (as R-062). Walked by: TC-073.
- R-453 [PM: flow arrow 3168-18119 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3168-18119] Update 3: updating → partly failed: A partly failed update keeps the successful images and marks the failed one 「!」 with 「1 image couldn't be updated. Your credits have been refunded. Tap Edit to try again, or tell me what to change.」 (as R-157). Walked by: TC-293.
- R-454 [PM: flow arrow 4018-28776 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4018-28776] Update 9: Create my character generating, 「Cancel」 → 「Stop and lose your credits?」: 「Cancel」 asks 「Stop and lose your credits?」 with 「Leave anyway」/「Keep Generating」 (as R-245). Walked by: TC-333.
- R-455 [PM: flow arrow 4018-28778 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=4018-28778] Update 9: 5-minute timeout dialog, 「Send Feedback」 → Send Feedback (AI Issues, pre-filled): 「Send Feedback」 opens Feedback on 「AI Issues」 with the AI Feature Name and issue text pre-filled (as R-246, R-303). Walked by: TC-336.

## Added 2026-10-29 — PM / MX controls (REQ-052)
Section C traced every PM / MX control group of the inventory (REQ-052) to the row that presses it (`control-trace.json`). Most
groups are the Design's own controls drawn again (credit pill, History, New chat, composer, chips, scene cards) and are pressed by
the rows that press the Design group; controls of the MX mockups' older chat are n/a (Q-31). The rules below are stated by a PM or
MX frame and had no requirement.

### Controls (REQ-052)
- R-456 [PM: main flow 「Demo page_Straight video」 2283:10856 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2283-10856; board-notes PM main flow 「Entry」; Req: REQ-052] Feature intro: opening AI Mini Drama from the Launcher shows an intro page 「AI Mini Drama」/「Turn your idea into a video—same characters, same voices, every scene.」 with ‹, a demo video with a volume icon at its bottom right, a 「Don't show again」 checkbox and 「Try It Now」. 「Try It Now」 opens the AI Mini Drama landing page, ‹ goes back to the Launcher, the volume icon switches the demo's sound off and on, and once 「Don't show again」 is ticked the shortcut opens the landing page directly (PM-only; Q-29).
- R-457 [MX: 「IAP_Pro+_free user」 1034:39877 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-39877, 「IAP_Pro+_pro user」 1034:40235 https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX?node-id=1034-40235; Req: REQ-052] Subscription page (opened from the limit dialog's 「Upgrade to Premium」 or a not-enough card's 「Upgrade Now」): the 「Pro」 / 「Pro+」 tabs at the top switch the plan shown; 「Monthly」 and 「Yearly」 (「Best Value」) plan cards, one selected at a time; the footer links 「Terms of Service」, 「Privacy Policy」 and 「Restore purchase」; the main button reads 「Get 7-Day Free Trial」 for a user without a subscription and 「Continue」 for a Pro user, and opens the App Store purchase sheet.
- R-458 [PM: main flow 「storyboard」 2186:7485 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2186-7485; pm-top-mockups; board-notes PM chat result states; Req: REQ-052] The Storyboard Preview card has a 「Create video」 button (「See how your story flows before generating the full video」); tapping it adds the bubble 「Create video」 and the 「Choose your video settings」 card follows (PM-only; Q-30).
- R-459 [PM: main flow 「Send Feedback」 2613:28618 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2613-28618; update 9 「Send Feedback_AI Issues (pre-filled)」 4012:23497; Req: REQ-052] Send Feedback (from 「Report」 or the timeout dialog's 「Send Feedback」): the tabs 「General」 / 「AI Issues」 / 「Order Problems」 switch the form; the AI Issues form has Contact Information*, 1. AI Feature Name*, 2. What is the issue?*, 3. What Prompt did you use?, an add-image tile and the footer link 「Privacy Policy」; 「Submit」 is dimmed while a required (*) field is empty; ‹ closes the form.
- R-460 [PM: update 3 「Character_generating {n}」 3153:16332 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=3153-16332; update 9 4018:26757; board-notes PM 「Generating state … disabled "generating…" button」; Req: REQ-052] While a character generates, the form's main button reads 「generating...」 and is dimmed; tapping it does nothing (only 「Cancel」 and X act, R-245).
- R-461 [PM: Error Handling 「AI Mini Drama_storyboard」 2701:22121 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2701-22121; MX 1572:23608; Req: REQ-052] The scene-video editor's description box has an expand icon at its top right that opens the full-screen description editor (collapse icon, 「Done」) with the same text, as the character description does (R-107).
- R-462 [PM: main flow 「AI Mini Drama_storyboard」 2592:43622 https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2592-43622; update 10 4198:25565; Req: REQ-052] On the video result page a paused preview shows ▶ in its middle; tapping ▶ resumes playback (R-275).

## Added 2026-10-29 — MX ③ Credit Charging Table (REQ-057)
Board `mx-a-right` 「③ Credit Charging Table / 1. Action ID & Charging Table Link」 links the sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (last modified 2026-10-20; read 2026-10-29, saved in specs/2026-10-21-2/extracted/mx-charging-table.md). The user decided (2026-10-29, REQ-057) to use the sheet only where no other source gives a number: the discount prices, the no-discount regenerate and the action ids. Normal prices stay PM 10/16 / Design (R-253, R-050 and the price rows); the sheet's own normal prices and its missing Seedance 2.5 row are Q-32 and Q-33.

- R-463 [MX:mx-a-right ③ Credit Charging Table, linked sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (2026-10-20); extracted/mx-charging-table.md; Req: REQ-057] First-time credit discount prices (the R-147 discount: a Free user who subscribes during an AI Mini Drama session): that session's first generation of each action costs 2 credits per character image, 2 credits per storyboard scene, 2 credits per second of Seedance 2.0 (1080p) video and 2 credits per second of Seedance 2.0 Mini (720p) video; the action card shows that price and the same amount is charged. HELD (REQ-059, 2026-10-29): the promotion price is not in use until the user says it applies; NOT TESTABLE until then, no row expects it.
- R-464 [MX:mx-a-right ③ Credit Charging Table, linked sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (2026-10-20); extracted/mx-charging-table.md; Req: REQ-057] Regenerating a character, a storyboard scene or a video is never discounted (the sheet's discount column is 「-」 for every regenerate): even inside the discounted session it is charged the normal price. HELD (REQ-059, 2026-10-29): this rule only matters inside the promotion, held with it; NOT TESTABLE until then.
- R-465 [MX:mx-a-right ③ Credit Charging Table, linked sheet 「AI Mini Drama CMS」 › 「Action ID (not on CMS)」 (2026-10-20); extracted/mx-charging-table.md; Req: REQ-057] Discounted charges are booked under the `…_aiminidrama_discount` action ids and normal charges under the `…_aiminidrama_normal` action ids (`genimage_1_img_openai_gptimage2_<none|enable>_1K_aiminidrama_<normal|discount>`, `genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_<normal|discount>`, `genvideo_1_sec_bytedance_seedance2.0mini_enable_720p_aiminidrama_<normal|discount>`); the app log shows each charge's `action_id` and `total_credit`. — Changed 2026-10-29 (REQ-059): rows check the `…_aiminidrama_normal` ids only; the `_discount` ids are held with the promotion.

## Added 2026-10-29 (2) — original prices by default (REQ-059)
User, 2026-10-29: "by default the "original" price should be the correct option, the special price I haven't received
information when it is going to be used. Unless I specified in the future that the promotion price is applied use the
original price." This replaces the REQ-057 rule that normal prices stay PM 10/16 / Design. Normal prices now come from
the MX ③ charging sheet (`specs/2026-10-21-2/extracted/mx-charging-table.md`), for first generation and regenerate
alike: character 6 per image, storyboard 6 per scene image, Seedance 2.0 (1080p) 13 per second, Seedance 2.0 Mini
(720p) 4 per second; Seedance 2.5 keeps PM 10/16's 6 per second (no sheet row, Q-33). Changed in place, IDs
kept: R-040, R-050, R-061, R-069, R-081, R-254, R-259, R-260, R-450, R-465. Held: R-463 (discount prices) and
R-464 (no discount on regenerate, which only matters inside the promotion), with the R-147 discount price; TC-231
is parked (removed) and the other REQ-057 discount rows now check the original price and the `_normal` ids.
Q-32 is answered.

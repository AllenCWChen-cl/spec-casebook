# Observations — A2 Android round 2 (signed in ethan.hsu.cl, Free, Stage, 16.8.0 2610212)

- **O-1 (A2-b, closest TC-044 / TC-403).** Corner Stall Rivalry: Generate all in 「Finish your characters」 (17:34:37)
  ran as one turn (t7 applied the two manual picks, t8 generated Inspector Vance / Mr. Higgins plus TTS voices and
  storyboard-script steps; turn_end 17:36:13 stage=storyboard→storyboard). The sheet kept 「Creating 2 characters…」
  for ~48 s after both images had logged ok (17:35:15 / 17:35:25). After X › Leave anyway (17:36:14) and then
  Choose Character X › 「Leave」 (「your picks won't be saved」), the picks were saved anyway and the chat moved on to
  「Create storyboard ◆25」 with no Characters Result / cast card at all (also after reopening from History), so the
  cast can no longer be reviewed or replaced from the chat. Evidence: screenshots/tc403-after-leave.png,
  tc403-chat-after.png; logcat 17:34:37–17:36:14.
- **O-2 (A2-b, closest TC-453).** Template 「The Art of Falling」 › Make my version (18:22): the Characters Result shows a
  woman's sheet (dark-haired woman in a suit) under 「Julian Cross」 (outline: "handsome American CEO in his early
  thirties") and a man's sheet under 「Lauren Hale」 (junior coordinator in her late twenties): the preset looks are
  swapped between the two leads. Evidence: screenshots/tc453-before.png.
- **O-3 (A2-b, closest TC-041 / TC-310).** Library picks in Choose Character land on the wrong look after the
  library grows: each Generate all adds the new sheets as 「Mine」 cards at the top, shifting every card, so a pick
  made from an earlier layout selects a different look (Bitter Cold's Leo Vance got a schoolgirl sheet). Test-data
  note, not a defect; screenshot before every library tap.
- **O-4 (A2-b, closest TC-044 / TC-045).** Almost every character-stage reply describes storyboard work that has not
  happened: 「Completed the 6-beat storyboard for 'Bitter Cold'…」 after Confirm (17:49), 「I have created the complete
  6-beat storyboard for 'The Art of Falling'…」 in the template chat (18:22), 「Updated the character's name … across
  all cuts…」 (17:59), 「Retained the complete six-beat storyboard…」 (18:00), 「Maintained the full 6-beat storyboard
  sequence…」 (18:19) — all before any storyboard Generate.
- **O-5 (A2-c2, closest TC-137).** With Wi-Fi off (no cellular service), Create my character › Generate fails at once with
  「Couldn't create image」 / 「The service is currently busy. Try again later.」: the copy blames a busy service for a
  connection loss (logcat 19:12:36 「HTTP request to cc team gateway failed: Could not establish connection」). The
  「More than one person detected」 check ran offline before it. Evidence: screenshots/tc137-fail.png.
- **O-6 (A2-c2, closest TC-333).** A character generation stopped with Leave anyway within ~2 s of Generate (before
  the TextToImage / TextToSpeech dispatch at ~12 s) is not charged (19:07:27 and 19:07:53: 「MyCreation cancel …
  calls=0」, balance unchanged); stopped after the dispatch it costs the full ◆4 with no refund (19:08:40, TC-333).
- **O-7 (A2-c2, test data).** Download on a character result (TC-472) adds 「character - <timestamp>.png」 to the device
  gallery, so every Add Media pick after it shifts by one cell (TC-137 picked the 「WAVE」 cover instead of the
  white-dress photo). Screenshot the picker before every photo tap.
- **O-8 (A2-d1, closest TC-359).** 「The Final Reel」 (A2-b: cast set, Create storyboard ◆31 offered) and 「Corner Stall
  Rivalry」 (A2-b: cast set, Create storyboard ◆25) both reopen from History (19:44–19:45) ending in 「Ready to create
  your characters?」/「Choose your characters」 with every slot empty and no storyboard card: the confirmed cast and the
  storyboard offer are gone. Evidence: screenshots/tc359-before.png, tc359-finalreel.png.
- **O-9 (A2-d1, closest TC-399).** On the template drama's Create storyboard Generate (19:36:47) logcat records
  「[DECISION] pre-approved 'character': {IMAGE=12, VOICE=1}」 — the storyboard charge is approved under the
  'character' label (the custom drama's storyboard logged 'storyboard': {IMAGE=10, VOICE=1}). Credit Details still
  books Text to Image / Text to Speech rows.
- **O-10 (A2-d1, closest TC-514).** After the app was swiped away mid-storyboard and reopened, the Characters-stage
  agent message (「I have created the character profiles for Maya Lin and Daniel Reed…」) is missing from the chat
  (present before the kill). Evidence: screenshots/tc514-reopen.png vs tc377-after-generate.png.
- **O-11 (A2-d2, closest TC-294).** After leaving a chat storyboard update in stage ① (Generate at 21:00:51, job
  running: 21:01:09 TextToImage dispatched), reopening El compás del regreso from History (~21:01:20) shows the
  「Create storyboard ◆3」 card with Generate again and no progress row, as if nothing had started; tapping Generate
  again shows 「Thinking…」 but logcat records no second pre-approval and only ◆3 is charged. Evidence:
  screenshots/tc294-before.png, logs/A2-d2-20261027-210852/logcat-live.txt 21:00:51–21:01:40.
- **O-12 (A2-d2, closest TC-495).** In El compás del regreso the outline card's 【Pacto en el tablao】 beat reads
  「…Carmen le entrega el cartel oficial a Mateo, pero él confiesa la verdadera razón por la que dejó de tocar.」, but the
  Characters Result card shown after the cast was confirmed (20:41) repeats the outline with that beat changed to
  「…el cartel de la gala a Mateo para sellar su compromiso sobre las tablas.」 — two different outlines in one chat with
  no message saying the story changed. Evidence: screenshots/es-choose.png vs es-cast.png.
- **O-13 (A2-e, closest TC-107).** Opening 「Corner Stall Rivalry」 from History, tapping ↓, scrolling, opening
  Choose Character from a slot and closing it with Cancel (nothing picked, nothing sent) moved the drama to the top of
  History with a new time and size (05:37 PM, 4.3 MB → 09:22 PM, 4.4 MB). R-094: only new content, regeneration,
  Rename and Full Edit count as modifications. Opening, scrolling, playing and downloading alone (Quiet Sanctuary,
  Bitter Cold, Workplace Romance (2)) did not move a drama. Evidence: screenshots/tc113-history2.png vs tc106-history.png.
- **O-14 (A2-e, closest TC-498).** On 「Understudy」 (characters confirmed, no storyboard yet), 「keep the title THE
  UNDERSTUDY」 got the reply 「Retained the storyboard for 'The Understudy', keeping the complete beat sequence, staging,
  and preview narration aligned with the story's dramatic arc.」 — it speaks of a storyboard and preview narration that do
  not exist yet, and offered a second 「Create storyboard ◆28」 card. Evidence: screenshots/tc498-reply2.png.
- **O-15 (A2-g1, closest TC-080 / TC-504).** With Best selected (card 「Seedance 2.5 · Sharper motion and richer detail」,
  ◆120) the Workplace Romance (2) preview was dispatched with model 「dreamina-seedance-2-5-260628」 720p, but each clip was
  charged under action_id 「genvideo_1_sec_bytedance_seedance2.0std_none_480p_aiminidrama」 (perSecond=4, total_credit=60):
  the Best model is billed at the Standard (Seedance 2.0, 480p) rate. Evidence: logs/A2-g1-*/logcat-live.txt 21:59:06–21:59:08.
- **O-16 (A2-g1, closest TC-085 / TC-307).** At 22:04:24, with the app in the foreground on the Workplace Romance (2)
  chat, logcat shows an FCM message 「Your drama is ready」 / 「"Workplace Romance (2)" is done. Tap to watch it.」 —
  about 1.5 min before the chat showed the video (22:05:44). The in-app 「Good news!」 toast, by contrast, appears each time
  the Launcher is reached and names the last finished drama (Quiet Sanctuary 22:01:53, Workplace Romance (2) 22:08:19,
  El compás del regreso 22:28:48 after a relaunch), not a drama that has just finished.
- **O-17 (A2-g1, closest TC-474).** Create Next Episode on Quiet Sanctuary (22:28:12, used as drama B in TC-474) opened a
  new History entry 「Quiet Sanctuary (1)」 with 「Continue making next episode」 / 「Thinking…」; after the relaunch logcat
  marks it pending_resume. It was not reopened in this segment (left for A2-g3). The original Quiet Sanctuary chat still
  ends with 「Ready for the next episode?」 / 「Create Next Episode」.
- **O-18 (A2-g2, closest TC-485).** After the El compás del regreso full-episode turn failed on a storage upload (Wi-Fi cut
  5 s after Generate, 23:12:07, nothing charged), the drama cannot make its full episode any more: the offer card is gone,
  reopening shows no error or Try again, and a typed 「Please create the full episode (60 sec) now.」 (23:22:34) runs a turn
  that narrates 「Generando el episodio completo de 60 segundos.」 in the log but ends in the 'final' step with an empty
  reply (23:23:23, turn_complete) — nothing is shown, generated or charged. Logcat [CARD] stays confirm=true. Evidence:
  screenshots/tc485-reopen.png, screenshots/g2-ec-retry.png, logs/A2-g2-*/logcat-live.txt 23:12:07, 23:22:34–23:23:23.
- **O-19 (A2-g2, closest TC-143).** Restarting UiAutomator2 at the segment start brought PowerDirector to the front on a
  Full Edit timeline of 「Quiet_Sanctuary.mp4」 with the toast 「PiP video was enabled before.」 (screenshots/g2-start.png),
  although the A2-g1 checkpoint left the phone on the Quiet Sanctuary chat.
- **O-20 (A2-g3, closest TC-145 / TC-113).** On Boardroom Rivals (Corporate rivals) a chat scene change (00:12) posted the
  reply 「Updated Scene 3 so Lauren turns her swivel chair…」 and the storyboard card *above* the user's bubble, then
  re-posted 「Story Outline & Characters Result」 after the bubble; the scene image update charged 3 inside the ◆33 card. After
  leaving and reopening the chat (00:27) the thread starts at 「Story Outline & Characters Result」 and holds only the outline,
  storyboard and the newest video card: the template opening, the earlier user bubbles and the earlier video cards (preview,
  full episode, scene 2 regeneration) are gone. Evidence: screenshots/tc144-card.png, tc145-top.png, tc145-chat.png.
- **O-21 (A2-g3, closest TC-343).** The producing and 「Saved to Gallery」 pages of the Corporate rivals export show the
  夜市轉角的心動對決 night-market thumbnail; the file itself is Corporate rivals (90.3 s although the chat called the episode
  60 s + 15-s scene regeneration; Full Edit timeline 01:30). Evidence: screenshots/tc343-exporting.png, tc343-done.png.
- **O-22 (A2-i1, closest TC-503 / TC-466).** Template chats differ in their last reply after the Characters Result:
  Forbidden Office Romance, Love, Unscripted and The Dragon's Chosen Bride end with a reply that claims 「The complete
  storyboard … has been crafted」 / 「Here is the completed storyboard …」 although nothing was generated or charged, then
  「The characters look great! Ready to create the storyboard?」 and the ◆37 storyboard card. Merger Season (「The language is
  already set to English (en_US). Ready to proceed with your project!」), The New Guy's Secret, The Art of Falling and
  Awakening the Storm (「The video settings have been updated to English (en_US) with captions enabled.」) and Glad We Came
  (no reply) show no storyboard card; on The New Guy's Secret it came only after a typed message (02:12:38 → 02:15:19,
  logcat 「[CARD] new revision of OUTLINE after a chat edit」, the outline beats rewritten, reply again 「The full 6-beat
  storyboard … has been generated」). Evidence: screenshots/tc237-chat.png, tc245-chat.png, tc503-after5min.png,
  tc466-card.png, tc466-end.png, tc249-chat.png; logs/A2-i1-20261028-022742/logcat-live.txt 02:12:38–02:15:19.
- **O-23 (A2-i2, closest TC-269 / TC-462).** The Dog Who Remembered Her (English + captions, 02:52:11): after the preset
  Characters Result (Mia, Ethan; Murphy dropped) the chat posts 「I have created the character profiles for Mia and Ethan…」,
  then 「Ready to update your characters?」 with the card 「Update characters」/「Credits will be consumed for this task.」
  ◆8 Generate, instead of the storyboard card the other templates show. Nothing was asked to change; not tapped (balance
  19). The Japanese run of the same template (02:55:00) showed no Characters Result at all, only the Story Outline.
  Evidence: screenshots/tc269-chat.png, tc459-chat2.png; logs/A2-i2-20261028-030724/logcat-live.txt 02:52:12, 02:55:01.
- **O-24 (A2-i2, closest TC-460).** With video language Japanese, The Ring He Worked For's outline beats came in Japanese
  with JP names (Mugi / Yuki / Kuro, 123 s), but The Beer Heir's outline, beat titles and cast names stayed in English
  (Characters Result after 11 s, reply 「The video language is set to Japanese (ja_JP) with captions enabled.」); The Dog Who
  Remembered Her JP outline was in English with JP names (Mio / Yuto / Shiro). Evidence: screenshots/tc460-ring.png,
  tc460-beer.png, tc459-chat2.png.
- **O-25 (A2-r1, closest TC-490 / TC-467).** Export Full Video with the default export sheet: 「Shared Shelter」 (full video
  90 s, 12:04, Shared_Shelter.mp4) has no 「PowerDirector」 watermark, while 「Morning Key」 (preview 30 s, 12:01) and the New
  Guy's Secret full video (13:01, saved as Romance_(7).mp4, not the drama title) both carry it bottom right. Same Free
  account, same default switch on the sheet. Evidence: screenshots/tc490-export-ep1-43s.jpg, tc490-export-ep2-25s.jpg,
  tc467-export-22s.jpg.
- **O-26 (A2-r1, closest TC-490 / O-22).** After 「Create Next Episode」 on Shared Shelter the reply under the Characters
  Result says 「Generated the full 6-beat storyboard for 'Morning Key' matching the approved beat plan…」 above the
  「Create storyboard」 ◆28 card, before anything was generated or charged (the New Guy's Secret template said the same:
  「I have created the complete 6-beat storyboard…」). Evidence: screenshots/tc490-2.png, tc466-2.png.
- **O-27 (A2-r2, closest TC-034 / TC-309; environment).** After the fresh install's first launch on Production (13:07),
  `testserver.config` put the app on Stage (yellow Launcher bar, 20 templates / 5 categories, `cc_chat_base_url`
  demo.myedit.online/iris-relay), but signed out every chat turn fails: logcat `[TOKEN] resolve_token (member_token EMPTY,
  uuid ok)` then `[TURN] ERROR 403: {"error":{"code":"Forbidden","message":"Fail to verify uuid"}}` / `MiniDramaFail:
  [outline] status=403` at 13:33:58 and again on 「Try again」 13:38:11; the chat shows 「Something went wrong on my end.
  Let's try that again.」 + Try again. `CreditSystemManager: getUUID from Preferences: 80feecf4-…` — the credit-system UUID
  minted on Production is reused, and Stage's getMemberRemain / checkDailyBonus also fail. A test-setup artefact (server
  changed after first launch), not filed. Signed-out cases on Stage need a UUID minted on Stage (app data cleared with the
  config already in place) or must run signed in. Evidence: screenshots/r2c-start.png, r2c-outline-403.png,
  r2c-outline-403-retry.png; logs/A2-r2b-20261028-133838.

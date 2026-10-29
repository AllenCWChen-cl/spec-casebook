# Observations — A1 Android round 1 (signed out, Stage, 16.8.0 2610212)

- **O-1 (A1-a1, closest TC-380 / TC-012).** The two inspiration chips change between chats: chat 1 (15:00)
  「A fake psychic keeps making random predictions…」 / 「He pretends to be rich for a date…」; after the 15:07 relaunch
  「She fakes being engaged…」 / 「She hires a fake boyfriend…」; the 15:16 chat 「He pretends to be rich…」 /
  「Two coworkers secretly compete…」. Each session logs 「[CMS] inspirations loaded: 10」. R-287 says the chips are the
  first two strings of the pool and Surprise me picks only from the rest; with the chips varying, that split is not
  stable (or the CMS returns the pool in a different order each time). PM question, not a Fail. Evidence:
  screenshots/tc011-chat.png, tc015-limit.png, tc425-create.png.
- **O-2 (A1-a1, closest TC-002).** The Home hero banner is fixed per launch, not rotating: 「Create with Seedance 2.5」
  for ~3 min before the relaunch, 「Create videos from text」 right after the 15:07 relaunch. Evidence:
  screenshots/tc002-banner-1.png, waitfor-timeout-20261027-150319.png.
- **O-3 (A1-a1, signed out).** Signed out with 0 credits, the outline and the character offer are generated without
  any sign-in prompt (4 outlines this segment; log `[TOKEN] resolve_token (member_token EMPTY, uuid ok)`). Mine ›
  Credits shows 「None」 while the AI Mini Drama pill shows 「0」.
- **O-4 (A1-a2, closest TC-452 / TC-026).** The template chat left with system back while generating (no dialog,
  TC-452) kept running and failed in the background (15:39:17 `MiniDramaFail: [outline] status=-1 | HTTP POST
  /chat/effect failed: SSL connection failed`), yet it is saved in History as 「Workplace Romance」 and reopens on
  「Something went wrong on my end. Let's try that again.」 / Try again. Try again (15:40) posted 「Your video settings
  have been updated to English (en_US) with captions enabled.」 and a 「Story Outline Result」 card, but never the
  Characters Result / character cards (still none after 6 min and after reopening). A clean template chat (15:46,
  「Workplace Romance (1)」) does show 「Story Outline & Characters Result」 with the cards. Evidence:
  screenshots/tc416-top.png, tc416-bottom.png, tc416-mid.png, tc416-reopen.png.
- **O-5 (A1-a2, closest TC-416).** Template chat, signed out with 0 credits: after the characters the assistant says
  「Created the complete 6-beat storyboard for the episode, covering …」 and then 「The characters look great! Ready to
  create the storyboard?」 above a 「Not enough credits」 / 「37 credits needed. You have 0 credits left.」 card with 「Buy
  Credits」 — it claims the storyboard is created before asking to create it. Evidence: screenshots/tc416-tpl-bottom.png.
- **O-6 (A1-a2, closest TC-286).** Idea input filled programmatically (Appium setval, a 470-character idea): the field
  showed the text scrolled sideways with the first letters of every line cut at the left edge (「st from the city…」).
  Typed with the keyboard the text wraps correctly. Not a user path (paste can't be tested on the device); worth a
  manual paste check. Evidence: screenshots/tc286-idea.png vs tc286-idea-typed.png.
- **O-7 (A1-a2, signed out).** Template 「Make my version」 runs outline and characters for free signed out, then stops
  at the storyboard: 37 credits (Not enough credits card). Create my character costs 4 (「You have 0 credits left」).
  These are the gates for A1-b/c/d.
- **O-8 (A1-b1, closest TC-036).** Choose Character › Filter › ✓ (Female + East Asian, 16:18): the filter applied,
  but the software keyboard opened over the picker with no picker field focused (the chat input behind the picker
  keeps focus). Evidence: screenshots/tc036-applied.png.
- **O-9 (A1-b1, closest TC-036 / TC-410, signed in).** Choose Character › Filter (16:35): Gender lists 「Female」「Male」「Other」「Other」
  (「Other」 twice), and Ethnicity starts at 「East Asian」 (… 「Hispanic」「Arab」「Indian」「Other」) with no 「White」, while Create my
  character offers 「White」 first. Evidence: screenshots/tc410-filter.png, tc410-chips.png, tc410-chips-left.png.
  Correction (A1-b2, 17:01): 「White」 is there, further right in the sideways row (… 「Other」「White」「Indigenous」「Southeast
  Asian」「Mixed」, screenshots/tc288-ethn-end.png); what remains is the order differing from Create my character and the
  double 「Other」 in Gender.
- **O-10 (A1-b1, closest TC-045 / TC-046).** The chat change 「Make Julian Hayes a man in his 40s」 › Update characters ◆4 put the new
  male Julian look into Character Library as a 「Mine」 card (first in the grid, next to the TC-508 Create-my-character card), though
  the user never saved it. Evidence: screenshots/tc487-picks.png.
- **O-11 (A1-b1, closest TC-041 / TC-044).** Custom chat 「Trapped Icons」: after the cast confirm the assistant says 「Completed the
  full 6-beat storyboard for Trapped Icons in English…」 and then offers 「Create storyboard」 ◆22 — it claims the storyboard exists
  before it is made (O-5 seen in a template chat; now also in a custom chat, signed in). Similar wording after TC-045: 「Updated Julian
  Hayes across all storyboard beats, action lines, cuts…」 with no storyboard. Evidence: screenshots/tc456-after.png, tc045-bottom.png.
- **O-12 (A1-b1, signed in).** Create my character ◆4 is charged as two items (logcat: totalRemain 1339 → 1336 at img_1, → 1335 at
  tts_2), and Generate all for 3 as 1 + 4 + 6 + 1 steps (1331 → 1319): each character = TextToImage 3 + TextToSpeech 1, as on iOS.
  The template chat's 「Not enough credits」 card (signed out, O-5) became 「Create storyboard」 ◆37 / Generate after sign-in.

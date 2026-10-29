#!/usr/bin/env python3
"""Build the AI Mini Drama iOS eBug draft batch for run P9 (full table, draft 20261022-145212) on 16.9.0 (189872).

Writes library/pdr/ai-mini-drama/ios/ebugs/2026-10-27-p9/20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0.md, the sibling
_images/ folder (one NN_ISS-ID folder per entry, JPEGs named 16.9.0_<slug>.jpg plus the log excerpt where the finding
has a log cause) and logs/. Continues the ISS-AMD sequence (P1 32-39, P23 40-45 + 49, P4 46-48). Nothing is filed.
Every Fail row of results.csv and every observation O-n is mapped (entry / recheck / held / not a bug); the script stops
when one is missing.
"""
import csv, json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(__file__))
import logx

REPO = "/Users/ethanhsu/Desktop/pdr-spec-casebook"
ROOT = f"{REPO}/library/pdr/ai-mini-drama/ios"
RUN = f"{ROOT}/runs/2026-10-22-p9-full"
OUT = f"{ROOT}/ebugs/2026-10-27-p9"
NAME = "20261022_eBug_drafts_AI-Mini-Drama-P9_16.9.0"
V, B, TR = "16.9.0", "189872", "TR261022-0031"
TAG = "AIAgent"
DEVICE = "Device: iPhone 17 Air / iOS 26.2.1"

DS_URL = "https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama"
PM_URL = "https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2016-2"
PM_PDF = "AI Mini Drama - PM Spec 20261021.pdf"
_BOARDS = json.load(open(f"{REPO}/library/pdr/ai-mini-drama/specs/2026-10-21-2/extracted/boards.json"))
_TITLE = {b["id"]: b["title"] for v in _BOARDS.values() for b in v}


def ds(board=None, frame=None, node="116-7873"):
    name = f"{frame} frame" if frame else f"{_TITLE[board]} board"
    return f"Spec Link: AI Mini Drama Design spec, {name} - {DS_URL}?node-id={node}"


def pm(board):
    return f"Spec Link: AI Mini Drama PM spec ({PM_PDF}), {_TITLE[board]} board - {PM_URL}"


HDR = (f"# PowerDirector {V} ({B}), {TR}, Developer Server, iPhone 17 Air / iOS 26.2.1. Excerpt of the app's AI Mini Drama "
       "log (Write Log + Pink 'Log stage timings').")

APP = ["Launch the APP", "Tap AI Mini Drama on the Launcher"]
NEW = APP + ["Tap Create Your Drama", "Type an idea (e.g. A night-shift baker and a lost delivery cyclist save a bakery)", "Tap Send",
             "Tap English", "Tap Yes, include captions", "Tap Generate"]

E = [
 dict(iss="ISS-AMD-50", title="Credit pill leaves a generating chat with no leave dialog", cls="Functional", sev=3, owner="RD",
  cases=["TC-357", "TC-358", "TC-359"], rep=(4, 4),
  note="R-261/R-262 (Design 1016_Chat navigation 4858:34930, PM main flow §3.2/§3.3; REQ-029): while the outline or a short job generates, every top exit (Back, History, New chat, credit pill) asks first. On 189872 Back, History and New chat ask; the credit pill never does. TC-357: outline generating, New chat → 「Leave this chat?」 (correct); credit pill at 16:00:18 and 16:01:35 → My Credits at once, twice. TC-358: credit pill 16:03:08 → My Credits, no dialog, so no Leave anyway; the outline kept running behind My Credits (turn end 16:03:42 ok) and History lists 「Reading the Tide」, which should have been discarded. TC-359: storyboard generating on Bound Pages 00:08:05 → My Credits at once; History and New chat both showed 「Stop and lose your credits?」. All Pink fault switches Off. No log line for the guard (the pill is client navigation). Not the same as DRI261894P0049 (Back vs History icon) or DRI261896P0048 (Back during storyboard).",
  short="Credit pill opens My Credits mid-generation with no leave dialog",
  steps=NEW + ["Tap the credit pill while 「Thinking…」 is shown"],
  res="The credit pill opens My Credits at once with no Leave this chat? dialog; the outline keeps generating and is saved.",
  res_zh="大綱生成中點擊點數膠囊直接開啟我的點數，未顯示「Leave this chat?」，大綱在背景繼續生成並被儲存。",
  exp="Like Back and New chat, the credit pill first asks 「Leave this chat?」 (storyboard: 「Stop and lose your credits?」).",
  exp_zh="點數膠囊應與返回、新聊天一致，先顯示離開確認對話框。",
  spec=["Spec string: 「Leave this chat?」 / 「Your story outline isn't ready yet, so this chat won't be saved.」"],
  links=[ds(frame="1016_Chat navigation", node="4858-34930"), pm("pm-main-flow")],
  imgs=[("TC-357-newchat", "amd50_newchat_asks"), ("TC-357-credit", "amd50_pill_no_dialog"), ("TC-358-history", "amd50_saved_anyway"), ("TC-359-pill", "amd50_storyboard_pill")]),

 dict(iss="ISS-AMD-51", title="Iris replies show locale codes such as ja_JP and en_US", cls="UI", sev=2, owner="RD",
  cases=["O-4", "TC-187", "TC-212"], rep=(3, 3),
  note="Rule 7 (on-screen text). O-4 (P9-a2, TC-207): The Ring He Worked For in Japanese — 「I have completed the storyboard script based on your beat plan in Japanese (ja_JP)…」. TC-212 (P9-b2): 「…video language is set to English (en_US) with captions enabled…」. TC-187 (P9-d2): 「I have translated all script and storyboard content into Japanese (ja_JP)…」. The user picked 「English」/「Japanese」 on the format card; the internal locale code leaks into the reply. No log needed (reply text). All fault switches Off.",
  short="Iris replies show internal locale codes like ja_JP and en_US",
  steps=APP + ["Tap Create Your Drama", "Type an idea", "Tap Send", "Tap Japanese", "Tap Yes, include captions", "Tap Generate", "Read Iris's replies"],
  res="Iris's replies name the video language by its locale code, e.g. 「in Japanese (ja_JP)」 and 「English (en_US)」.",
  res_zh="Iris 回覆中顯示語系代碼，例如「Japanese (ja_JP)」、「English (en_US)」。",
  exp="Replies name the language as the format card does (English, Japanese) with no locale code.",
  exp_zh="回覆應以格式卡上的語言名稱（English、Japanese）稱呼，不顯示語系代碼。",
  rec=["[AI Recommendation]", "I have completed the storyboard script in Japanese.", "Video language is set to English with captions on."],
  links=[ds("ds-home-custom-chat")],
  imgs=[("TC-207-ring-bottom", "amd51_ja_JP"), ("TC-212-outline", "amd51_en_US"), ("TC-187-reply", "amd51_translate_reply")]),

 dict(iss="ISS-AMD-52", title="Partial character failure uses the single-failure dialog", cls="UI", sev=3, owner="RD",
  cases=["TC-042", "TC-384", "TC-353"], rep=(3, 3),
  note="R-035 / R-294 (PM Update board 3): when some characters fail, 「Couldn't create some images」/「N characters couldn't be created. Your credits have been refunded. Tap a character to try again.」, failed slots keep 「!」. (1) All Pink fault switches Off, Borrowed Rain Generate all ◆8 16:54:50: Leo failed (TextToImage NSURLErrorDomain -1001 16:56:33), Clara made → 「Couldn't create image」/「We couldn't create this character and your credits have been refunded. Try again later.」 (the single-character copy) with Leo's red 「!」 on the sheet; Got it opened Choose for Leo (no frame of the sheet in this run; text recorded at 16:57). (2) Pink › [z] AI Mini Drama › Trip image moderation ON 17:08–17:39: both failed (serverFailed 4000) → the same single copy for two characters (TC-042-result); after Got it neither slot carries 「!」 in Choose Character or in 「2 characters aren't set yet」 (TC-384). (3) TC-353 chat 「Update characters」 for two (Trip image moderation ON, but the failure was a real storage PUT error, no injection line): Julian updated, Clara failed, the turn ended as a whole failure 「Something went wrong on my end.」 and Clara's slot has no 「!」. The copy defect reproduced with every switch Off (1); the lost 「!」 was seen only with Trip image moderation ON — re-check it Off before filing that part. Refund is ISS-AMD-53. Related DRI261896P0042 (no error / ! on failure: partly fixed, the dialog and ! now show).",
  short="Partial character failure shows the single-character error dialog",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create your characters?」 with two unset characters", "Tap the first character's slot", "Tap ✓", "Tap Generate all", "Wait until one character fails and the other is created"],
  res="With one of two characters failed, the sheet shows 「Couldn't create image」/「We couldn't create this character…」.",
  res_zh="兩位角色中一位失敗時，顯示單一角色失敗文案「Couldn't create image」，而非部分失敗文案。",
  exp="A partial failure shows 「Couldn't create some images」 with the number of failed characters, failed slots marked !.",
  exp_zh="部分失敗應顯示「Couldn't create some images」與失敗角色數，失敗角色保留「!」標示。",
  spec=["Spec string: 「Couldn't create some images」 / 「N characters couldn't be created. Your credits have been refunded. Tap a character to try again.」"],
  rec=["[AI Recommendation]", "Title: Couldn't create some images", "Body: 1 character couldn't be created. Your credits have been refunded. Tap a character to try again.", "Button: Got it"],
  links=[pm("pm-update-3")],
  log=("Partial character failures: one of two characters fails (decisions 2026-10-27: failure-related, log added)", [
    ("TC-042 Generate all, Borrowed Rain, every Pink fault switch Off: Leo fails, Clara made", "2026-10-22", "16:54:00", "16:58:00"),
    ("TC-353 Update characters, Window Notes: Clara's storage PUT fails, Julian updated", "2026-10-22", "20:58:00", "21:05:00")]),
  imgs=[("TC-042-result", "amd52_single_copy"), ("TC-042n-gotit", "amd52_after_gotit"), ("TC-384-continue", "amd52_no_mark"), ("TC-353-result", "amd52_update_whole_failure")]),

 dict(iss="ISS-AMD-53", title="Failed character generations keep their credits with no refund", cls="Functional", sev=2, owner="RD",
  cases=["TC-042", "TC-043", "TC-353", "TC-329", "O-15"], rep=(6, 6),
  note="Rule 8 refund check, matched by time and amount in Credit Details (shared account; other devices' rows excluded). All with every Pink fault switch Off unless named. (1) TC-042/TC-043, Borrowed Rain Generate all ◆8 16:54: Leo failed (-1001 timeout), Clara made; ledger 16:56 TTI −3, TTS −1, TTI −3, TTS −1 (= −8), no 「Generation failed, credits returned」 row — expected −4 net for the one character delivered; the dialog says 「your credits have been refunded」. (2) TC-042 with Trip image moderation ON 17:11: images refunded (+3 ×2 at 17:12) but both TTS −1 kept. (3) TC-353 Update characters ◆8 20:58 (Trip ON, real storage PUT failure on Clara 21:04:20): ledger 21:04 TTS −1 kept for the failed Clara. (4) TC-329 regenerate all three 03:40 (Off): Leo failed (character-edit storage PUT 03:46:41), his TTS −1 kept, no refund row. (5) O-15 Create my character with a reference photo (Off), 22:25 and 22:54: 「…your credits have been refunded.」 but TTS −1 kept each time (Gemini UNAVAILABLE after the TTS step was allowed). One mechanism: per-tool charges booked inside a turn that then fails are not returned. Duplicate candidate: DRI261897P0016 (Failed character and video generations keep their charged credits with no refund — Propose Wont Fix, filed on 189729); still reproduces on 189872. Raised per rule 8 (own entry for every missing refund).",
  short="Failed character generations keep their charged credits with no refund",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create your characters?」 with two unset characters", "Read the balance on the credit pill", "Tap the first character's slot", "Tap ✓", "Tap Generate all", "Wait until 「Couldn't create image」 appears", "Tap Got it", "Tap Close", "Tap Back until the Launcher is shown", "Tap Mine", "Tap Credits", "Tap Details"],
  res="A failed character keeps its −1 / −3 rows and no refund row is added, though the dialog says credits were refunded.",
  res_zh="角色生成失敗後仍保留 −1/−3 扣點，無退點紀錄，但對話框顯示已退點。",
  exp="A failed character costs nothing: its charges come back as 「Generation failed, credits returned」 rows.",
  exp_zh="失敗的角色不應扣點，應出現「Generation failed, credits returned」退點紀錄。",
  spec=["Spec string: 「We couldn't create this character. Your credits have been refunded. Try again.」"],
  links=[pm("pm-error-handling"), pm("pm-update-3")],
  related="DRI261897P0016 (same refund defect, filed on 189729), DRI261896P0042 (failure notice)",
  log=("Failed character generations: charges booked, no refund", [
    ("TC-042 Generate all ◆8, Leo fails (Off)", "2026-10-22", "16:56:00", "16:57:40"),
    ("TC-353 Update characters ◆8, Clara fails", "2026-10-22", "21:04:00", "21:04:40"),
    ("O-15 Create my character fails after TTS allowed (Off)", "2026-10-22", "22:25:20", "22:25:45"),
    ("TC-329 regenerate all three, Leo fails (Off)", "2026-10-23", "03:46:30", "03:47:05")]),
  imgs=[("TC-042n-gotit", "amd53_gotit"), ("TC-041-ledger", "amd53_ledger_1656"), ("TC-353-ledger", "amd53_ledger_2104"), ("TC-366-fail", "amd53_cmc_says_refunded")]),

 dict(iss="ISS-AMD-54", title="Character generation has no Cancel and no time hint (PM 10/16)", cls="Functional", sev=3, owner="RD",
  cases=["TC-041", "TC-337", "TC-332", "TC-333", "TC-334", "TC-383"], rep=(6, 6),
  note="PM-only rows (PM Update board 9, 10/16; no Design frame yet): R-247 Finish your characters while generating shows 「Creating N characters...」 and 「This usually takes about 1 minute.」, X and 「Cancel」 ask 「Stop and lose your credits?」; R-245/R-291 Create my character while generating shows 「This usually takes about 1 minute.」 under the chips, X stays enabled, 「Cancel」 under the Generating button, and a tap outside the sheet asks like X. On 189872: Finish your characters (TC-041 16:54, TC-337 21:37, all switches Off) keeps 「2 characters aren't set yet」/「Add a look to continue.」 with grey slots and a disabled 「Generating」 spinner; no Creating line, no time hint, no Cancel; X does nothing. Create my character (TC-332…TC-334, TC-383, 23:18–23:22): blank placeholder, chips and a disabled 「Generating ◌」; no time hint, no Cancel, X dimmed, outside tap and swipe do nothing; the result took ~4 min. So 「Stop and lose your credits?」 cannot be reached during any character generation. Also TC-041: the ready state reads 「Take a look, then confirm to continue.」 (PM: 「Tap Confirm to continue.」). Duplicate candidate: DRI261895P0024 (Character generation has no usable Stop action or cancellation warning — QA Propose Wont Fix, filed before the PM 10/16 update that specifies Cancel); TC-154/TC-161 are its rechecks.",
  short="Character generation shows no Cancel or time hint and cannot be stopped",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create your characters?」 with two unset characters", "Tap the first character's slot", "Tap ✓", "Tap Generate all", "Look at the sheet while it generates", "Tap X"],
  res="While characters generate the sheet shows only a disabled Generating button: no progress line, time hint or Cancel.",
  res_zh="角色生成中只有停用的 Generating 按鈕，沒有「Creating…」、時間提示與 Cancel，X 也無作用。",
  exp="It shows 「Creating 2 characters...」, 「This usually takes about 1 minute.」 and Cancel; X and Cancel ask to stop.",
  exp_zh="應顯示生成進度、約 1 分鐘的時間提示與 Cancel；X 與 Cancel 應詢問是否停止。",
  spec=["Spec string: 「This usually takes about 1 minute.」 / 「Stop and lose your credits?」"],
  links=[pm("pm-update-9")],
  related="DRI261895P0024 (no usable Stop during character generation; QA Propose Wont Fix)",
  imgs=[("TC-041-creating", "amd54_finish_generating"), ("TC-337-gen1", "amd54_finish_generating2"), ("TC-332", "amd54_cmc_generating"), ("TC-383-a", "amd54_cmc_outside_tap")]),

 dict(iss="ISS-AMD-55", title="Confirming the cast charges character credits with no offer card", cls="Functional", sev=2, owner="RD",
  cases=["TC-044", "O-36"], rep=(2, 2),
  note="R-037 (PM Chat result states): with every character set, Iris says 「The characters look great! Ready to create the storyboard?」 with a priced Create storyboard card; every charge goes through an offer (MX). TC-044 (P9-b1, all switches Off): Borrowed Rain, cast set, Done ✓ 17:18 → no storyboard offer; instead 「Continuing character portrait generation.」, a re-written outline card and at 17:25 「Something went wrong on my end.」; Try again 17:28 failed again at 17:37. The pill dropped 19034 → 19000 → 18996 and the ledger booked a run of Text to Image −3 plus Text to Speech −1 (= −34) at 17:22–17:25 and −3/−1 at 17:35, with no offer, no Generate tap and no refund; the phone log has no Permission authorize line for those charges (excerpt: the turn begins and fails, nothing authorized). O-36 (video gate, 05:25): 綴じられた秘密's video card showed ◆131 — log 'authorize tools=[RefToVideox2,TextToImagex3,TextToSpeechx2] credit=131': the pending 「Update characters」 work was folded into the video price without saying so; the video failed and −1/−3 stayed booked (refund: ISS-AMD-63). The turn failures themselves are the storage upload of ISS-AMD-71.",
  short="Confirming the cast charges character portraits with no offer card, then fails",
  steps=APP + ["Tap History", "Tap a drama whose characters are all set", "Read the balance on the credit pill", "Tap a character slot", "Tap ✓", "Wait for Iris's reply", "Tap Back until the Launcher is shown", "Tap Mine", "Tap Credits", "Tap Details"],
  res="Confirming the cast books −34 credits of Text to Image/Speech with no offer card, then ends in Something went wrong.",
  res_zh="確認角色後未出現報價卡即扣除 34 點（文字轉圖片/語音），之後顯示「Something went wrong」。",
  exp="Confirming the cast offers 「Create storyboard」 with its price; nothing is charged until Generate is tapped.",
  exp_zh="確認角色後應出現附價格的「Create storyboard」卡，點 Generate 前不應扣點。",
  spec=["Spec string: 「The characters look great! Ready to create the storyboard?」"],
  links=[pm("pm-top-mockups")],
  log=("Cast confirm turns with charges and no authorize line", [
    ("TC-044 Done ✓ on the cast, turn t11 (Off)", "2026-10-22", "17:18:00", "17:25:30"),
    ("TC-044 Try again, turn t12", "2026-10-22", "17:28:00", "17:37:40"),
    ("O-36 video card ◆131 folds character work into the price", "2026-10-23", "05:25:40", "05:26:20")]),
  imgs=[("TC-044-after-done", "amd55_after_done"), ("TC-044-retry2", "amd55_failed"), ("b1-ledger2", "amd55_ledger"), ("gate3-card", "amd55_video_131")]),

 dict(iss="ISS-AMD-56", title="Iris posts a Generate with AI bubble the user never sent and claims a storyboard that does not exist", cls="Functional", sev=3, owner="RD",
  cases=["O-9", "O-11", "O-30", "O-37"], rep=(4, 4),
  note="Seen in four dramas, all switches Off. O-9 (P9-b1 16:59): after leaving Choose Character the chat ends in a user bubble 「Generate with AI」 the user never typed. O-11 (Keeper's Light 21:39): Confirm on 「Your characters are ready」 → 「…2 characters still have no portrait…」, a 「Generate with AI」 user bubble, then 「Something went wrong」 after 423 s. O-37 (Dawn Bread 06:22): Confirm → the phantom 「Generate with AI」 bubble, 「I have created the complete 6-beat storyboard for 'Dawn Bread'…」 and 「Advancing the mini drama production.」 for 387 s, then nothing (card=none, character-sync storage PUT failed 06:28:08); later 「The full 6-beat storyboard … has been created」 again before the ◆28 offer. O-30 / TC-103 / TC-208: the same false 「I have created the complete 6-beat storyboard…」 line before any storyboard exists. The log shows the bubble is the app's own 'trigger=leave' turn rendered as a user message. Related DRI261894P0013 (asks to regenerate a storyboard that doesn't exist yet — NotReproducible) and DRI261894P0024.",
  short="Chat shows an unsent Generate with AI message and claims an uncreated storyboard",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create your characters?」 with two unset characters", "Tap the first character's slot", "Tap ✓", "Tap Generate all", "Wait for 「Your characters are ready」", "Tap Confirm", "Read the new chat messages"],
  res="A 「Generate with AI」 bubble the user never sent appears, and Iris says the storyboard is created; none exists.",
  res_zh="聊天出現使用者未輸入的「Generate with AI」訊息，且 Iris 稱分鏡已完成，但實際尚未產生。",
  exp="Only the user's own messages appear as user bubbles, and Iris offers Create storyboard instead of claiming it exists.",
  exp_zh="只顯示使用者自己送出的訊息；Iris 應提供 Create storyboard，而非宣稱分鏡已完成。",
  links=[pm("pm-top-mockups")],
  log=("Confirm turn posts 'Generate with AI' and ends with no result", [
    ("O-37 Dawn Bread Confirm (Off)", "2026-10-23", "06:22:00", "06:28:15")]),
  imgs=[("TC-172-running", "amd56_phantom_bubble"), ("O-11-keeper", "amd56_keeper"), ("b1-after-leave2", "amd56_after_leave")]),

 dict(iss="ISS-AMD-57", title="Chat character change: one option chip, non-spec copy and no updated-cast messages", cls="UI", sev=3, owner="RD",
  cases=["TC-348", "TC-349", "TC-352", "TC-103"], rep=(5, 5),
  note="R-254 / R-090 (PM Update board 7, 10/16): 「Sure! Which character would you like to change?」 with 2–4 chips; after Generate 「Working on it...」, then 「Here's your updated cast.」 and 「Your characters' looks are updated! Ready to create the storyboard?」; after a cast change 「Characters updated! Regenerate the storyboard to match?」. On 189872 (all Off; TC-348 20:39 and 20:48): 「Which character would you like to make look older?」 with ONE chip (Clara) and 「More ideas +」 — Julian never offered; tapping the chip removes the question line too. TC-349: Generate shows 「Thinking…」 then 「Advancing drama production to the next stage.」, never 「Working on it...」, and ends with 「The characters look great! Ready to create the storyboard?」 (no 「Here's your updated cast.」); Clara still looks the same (not visibly older). TC-352 (Art of Falling after a storyboard): ends with 「Characters updated! Regenerate the storyboard to match?」 instead of 「Your characters' looks are updated!…」. TC-103 (The Gambit, cast changed at the storyboard offer): Iris repeats 「The characters look great!…」. The chat replies come from the Iris engine on the device, so RD owns them. Related DRI261896P0054 (wrong prompt after a cast change following a storyboard).",
  short="Character change in chat offers one chip and skips the update messages",
  steps=APP + ["Tap History", "Tap a drama whose two characters are set", "Type 「Can you change one of the characters to look older?」", "Tap Send", "Read Iris's question and chips", "Tap the chip", "Tap Generate on 「Update characters」", "Read Iris's messages"],
  res="Iris asks 「Which character would you like to make look older?」 with one chip and never says 「Here's your updated cast.」",
  res_zh="Iris 只提供一個角色選項，文案與規格不同，更新後也沒有「Here's your updated cast.」等訊息。",
  exp="Iris asks 「Sure! Which character would you like to change?」 with a chip per character, then the spec's update messages.",
  exp_zh="Iris 應以規格文案詢問並為每位角色提供選項，更新後顯示規格中的進度與完成訊息。",
  spec=["Spec string: 「Sure! Which character would you like to change?」 / 「Working on it...」 / 「Here's your updated cast.」 / 「Your characters' looks are updated! Ready to create the storyboard?」"],
  links=[pm("pm-update-7")],
  imgs=[("TC-348-chips2", "amd57_one_chip"), ("TC-349-working", "amd57_no_working"), ("TC-349-result", "amd57_closing_line"), ("TC-352-result", "amd57_after_storyboard")]),

 dict(iss="ISS-AMD-58", title="Typed character name is not taken as the answer to Iris's question", cls="Functional", sev=3, owner="RD",
  cases=["TC-391"], rep=(1, 1),
  note="R-301 (PM Update board 7, 10/16): when Iris asks which character to change, the user can type the answer instead of tapping a chip and gets the 「Update characters」 card. TC-391 (Window Notes 20:48, all Off): asked again 「Can you change one of the characters to look older?」 → 「Which character would you like to make look older?」 with one chip 「Clara (Nurse)」; typed 「Julian」 and sent → after 29 s 「Preserved the cast profile for Julian…」 and 「The characters look great! Ready to create the storyboard?」 › Create storyboard; no 「Update characters」 card, Julian unchanged; the question line also disappeared. Nothing charged (18992).",
  short="Typed character name instead of a chip skips the Update characters card",
  steps=APP + ["Tap History", "Tap a drama whose two characters are set", "Type 「Can you change one of the characters to look older?」", "Tap Send", "Type the other character's name (e.g. Julian)", "Tap Send"],
  res="Iris answers 「Preserved the cast profile for Julian…」 and offers Create storyboard; no Update characters card.",
  res_zh="輸入角色名稱回答後，Iris 直接提供 Create storyboard，沒有更新卡。",
  exp="A typed name is taken like a chip: Iris offers the priced 「Update characters」 card for that character.",
  exp_zh="輸入的角色名稱應視同點選選項，Iris 應提供該角色的「Update characters」報價卡。",
  links=[pm("pm-update-7")],
  imgs=[("TC-391-q", "amd58_question"), ("TC-391-sent", "amd58_typed"), ("TC-391-result", "amd58_no_update_card")]),

 dict(iss="ISS-AMD-59", title="Update characters card shows no character count", cls="UI", sev=3, owner="RD",
  cases=["TC-350"], rep=(3, 3),
  note="R-254 (PM Update board 7, 10/16): the card reads 「Update characters • N characters」 and costs one character × count. TC-350 (two characters, 20:49), TC-348 (one, 20:43) and TC-352 (one, Art of Falling): the card reads only 「Update characters」 with the price; no count. The price ◆8 = 2 × the app's one-character ◆4 (the per-character price itself is DRI261896P0046, a recheck). All Off; card only, nothing charged.",
  short="Update characters card does not show how many characters it updates",
  steps=APP + ["Tap History", "Tap a drama whose two characters are set", "Type 「Please change both Clara's and Julian's looks: make them both about 30 years younger.」", "Tap Send", "Wait for the 「Update characters」 card"],
  res="The card reads only 「Update characters」 with ◆8; it does not say how many characters will be updated.",
  res_zh="卡片只顯示「Update characters」與 ◆8，未標示要更新的角色數量。",
  exp="The card reads 「Update characters • 2 characters」 with its price.",
  exp_zh="卡片應顯示「Update characters • 2 characters」及價格。",
  spec=["Spec string: 「Update characters • N characters」"],
  links=[pm("pm-update-7")],
  imgs=[("TC-350-card", "amd59_two_chars"), ("TC-348-card", "amd59_one_char")]),

 dict(iss="ISS-AMD-60", title="Back in the first seconds of a paid generation leaves with no Stop and lose your credits?", cls="Functional", sev=3, owner="RD",
  cases=["TC-351", "O-21"], rep=(5, 5),
  note="R-262 (Design 1016_Chat navigation, PM 1002 update §13.6): during a short job (storyboard, chat image update, character update) every top exit asks 「Stop and lose your credits?」. TC-351 (Window Notes Update characters, Generate 20:43, Off): Back 4 s later, while 「Thinking…」 + Stop showed → straight to History, no dialog; the job kept running (reopen showed 「Advancing drama production…」); a second Back at that stage did show the dialog. O-21: the same on storyboards — Bound Pages 00:06:59, Shared Corner 01:00:19 and the Scene 2 revision 00:20:3x / 00:21:09 left with no dialog until the pill had dropped. So the guard starts only once something is charged, while the job was already authorized and keeps running. Related DRI261896P0048 (No Stop and lose your credits? on Back during storyboard generation, Assigned): partly fixed (the dialog now shows later in the job).",
  short="Back early in a paid generation leaves with no Stop and lose your credits?",
  steps=APP + ["Tap History", "Tap a drama at the 「Create storyboard」 card", "Tap Generate", "Tap Back within 5 seconds"],
  res="Back goes straight to History with no dialog while the generation keeps running in the background.",
  res_zh="付費生成剛開始（Thinking 階段）時按返回，直接回到 History 且無提示，生成仍在背景進行。",
  exp="Back asks 「Stop and lose your credits?」 from the moment Generate is tapped.",
  exp_zh="點 Generate 後即應在返回時詢問「Stop and lose your credits?」。",
  spec=["Spec string: 「Stop and lose your credits?」 / 「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」"],
  links=[ds(frame="1016_Chat navigation", node="4858-34930"), pm("pm-1002-update")],
  related="DRI261896P0048 (Back during storyboard generation; Assigned)",
  imgs=[("TC-349-working", "amd60_thinking"), ("TC-351-reopen", "amd60_still_running"), ("TC-351-dialog", "amd60_dialog_later"), ("TC-061-reopen", "amd60_storyboard_back")]),

 dict(iss="ISS-AMD-61", title="Create my character cuts a 1,050-character description to 1,000", cls="Functional", sev=3, owner="RD",
  cases=["TC-051"], rep=(1, 1),
  note="R-043 changed by Design 1005_Update (3963:78064, 'Exceed word limit', in the PDF): text over the limit is kept, the counter turns red 「1050/1000」, the warning shows and Generate is disabled. TC-051 (P9-c1, Off): a 1,050-character description (ending 「… END」) set in the expanded editor keeps only 1,000 characters (「END」 gone), counter 「1000/1000」, red 「You've reached the 1,000-character limit.」 in the editor and on Create my character, and 「Generate ◆4」 stays enabled — the build still applies the older PM cut-at-1,000 rule. Text was set through the accessibility value (paste is not possible on the test phone); a manual paste should show the same.",
  short="Create my character cuts a 1,050-character description to 1,000",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create your characters?」", "Tap a character slot", "Tap Create my character", "Tap the expand icon of the description", "Paste a 1,050-character description", "Tap Done"],
  res="Only 1,000 characters are kept, the counter shows 1000/1000 and Generate stays enabled.",
  res_zh="只保留 1,000 字，計數顯示 1000/1000，Generate 仍可點。",
  exp="All 1,050 characters are kept, the counter shows red 1050/1000 with the limit warning, and Generate is disabled.",
  exp_zh="應保留全部 1,050 字，計數紅色顯示 1050/1000 並提示上限，Generate 停用。",
  spec=["Spec string: 「You've reached the 1,000-character limit.」"],
  links=[ds(frame="1005_Update (Exceed word limit)", node="3963-78064")],
  imgs=[("TC-051", "amd61_cut_to_1000"), ("TC-051-editor", "amd61_editor")]),

 dict(iss="ISS-AMD-62", title="Reopening a drama from History drops messages and the character card", cls="Functional", sev=2, owner="RD",
  cases=["TC-113", "TC-160", "TC-163", "O-8", "O-14", "O-17", "O-22", "O-29", "O-32"], rep=(9, 9),
  note="R-098 (Design Recent Task) and rule 2 (R-139): reopening restores the drama at its latest stage and nothing saved is lost without notice. All Off. Messages dropped on reopen: TC-163 (Dawn Bread) — the idea bubble, format answer, first outline, both user requests and a reply are gone, the chat starts at the latest outline; TC-160 — Iris's closing line 「I have created the character sheets for Maya…」 gone; O-22 (Bound Pages) — 「The cast looks good. Please create the storyboard.」 + offer and 「Update the image for Scene 2 to show rain」 + offer gone; O-29 (New Title) — every message since the reopen at 03:53 gone; O-32 (The Gambit) — the last failed turn and Try again gone. Character card lost: TC-113 / O-17 (Silent Notes) and O-14 (Night Shift Radio) reopen on the outline ending 「Possible Characters:」 with no 「Ready to create your characters?」 card (waited 42–55 s), so the cast cannot be set without typing a new message; O-8 (Borrowed Rain) reopened with a 「Create characters →」 option instead of its slot card, and tapping it failed at once (log 16:44:48 TextToImage/TextToSpeech 'not covered by the authorization' → 'Something went wrong'). O-6: the slot card can also sit as a skeleton for ~25 s on reopen. Related DRI261893-0055 (messages disappear when outline generation starts; Close), DRI261895P0034 (revised outline not shown again; ProposeNAB).",
  short="Reopening a drama from History drops messages and the character card",
  steps=APP + ["Tap Create Your Drama", "Type an idea", "Tap Send", "Tap English", "Tap Yes, include captions", "Tap Generate", "Wait for 「Ready to create your characters?」", "Type 「Make the ending a little funnier.」", "Tap Send", "Wait for the reply", "Tap Back", "Tap Back", "Tap AI Mini Drama on the Launcher", "Tap History", "Tap the drama", "Scroll to the top of the chat"],
  res="The reopened chat starts at the latest outline; the idea and earlier messages are gone, sometimes the cast card too.",
  res_zh="從 History 重新開啟後，聊天只從最新大綱開始，先前的訊息與回覆消失，有時角色卡也不見。",
  exp="The reopened chat shows every saved message and the card of its latest stage.",
  exp_zh="重新開啟應顯示所有已儲存的訊息及目前階段的卡片。",
  links=[ds("ds-recent-task")],
  log=("Reopened Borrowed Rain: the substitute Create characters option fails", [
    ("O-8 tap 「Create characters →」 after reopening (Off)", "2026-10-22", "16:44:40", "16:44:55")]),
  imgs=[("TC-163-reopen", "amd62_reopen_top"), ("TC-163-top", "amd62_messages_gone"), ("TC-113-NewTitle", "amd62_no_cast_card"), ("c1-reopen", "amd62_night_shift"), ("b1-reopen", "amd62_create_characters_option")]),

 dict(iss="ISS-AMD-63", title="Failed storyboard and scene image generations keep their credits with no refund", cls="Functional", sev=2, owner="RD",
  cases=["TC-071", "TC-184", "TC-295", "O-27", "O-36"], rep=(5, 5),
  note="Rule 8 refund check (Credit Details, matched by time and amount). (1) TC-071 Shared Corner Scene 1 Regenerate Image ◆6 01:11:40: the card ends 「Couldn't create image」/「Your credits have been refunded…」 but 01:16 Text to Image −3 is kept with no refund row (pill 18863 → 18860; Pink Fail media tool was on for the scene's first failure, this attempt failed on a real -1009). (2) TC-184 / O-27 The Art of Falling 「Create storyboard」 ◆7 02:34 (Off): beat-edit storage PUT failed 02:41:09; 02:40 Text to Image −3 kept, no refund row. (3) TC-295 Try again 02:51 with Fail turn back Off (read back 02:50): failed 02:57:57 (storage PUT); 02:57 Text to Image −3 kept, pill 18842 → 18839. (4) O-36 綴じられた秘密 video turn 05:25 (Off): failed (video + two beat-edit storage PUTs); 05:26 Text to Speech −1 and 05:32 Text to Image −3 kept. Character refunds are ISS-AMD-53; DRI261897P0016 covers characters and videos only. Not the same as a user Stop/leave (TC-164 −9 kept as the dialog warns, not raised).",
  short="Failed storyboard and scene image generations keep credits with no refund",
  steps=APP + ["Tap History", "Tap a drama with a storyboard", "Read the balance on the credit pill", "Type 「Change Scene 2 so that it is raining.」", "Tap Send", "Tap Generate on 「Create storyboard」", "Wait until the generation fails", "Tap Back until the Launcher is shown", "Tap Mine", "Tap Credits", "Tap Details"],
  res="Each failed storyboard or scene image generation keeps its −3 / −1 rows and no refund row is added.",
  res_zh="分鏡或場景圖生成失敗後仍保留 −3/−1 扣點，無退點紀錄。",
  exp="A failed generation costs nothing: its charges come back as 「Generation failed, credits returned」 rows.",
  exp_zh="失敗的生成不應扣點，應出現「Generation failed, credits returned」退點紀錄。",
  spec=["Spec string: 「Your credits have been refunded.」"],
  links=[ds(frame="1012_Update thumbnail 9:16 & add Location image (Storyboard)", node="3999-73608"), pm("pm-update-6")],
  related="DRI261897P0016 (refunds for characters and videos), DRI261894P0036 (silent failed step)",
  log=("Failed storyboard / scene image turns: charges allowed, no refund", [
    ("TC-071 Regenerate Image, 01:16 charge", "2026-10-23", "01:16:00", "01:18:00"),
    ("TC-184 Create storyboard ◆7 fails (Off)", "2026-10-23", "02:40:30", "02:41:15"),
    ("TC-295 Try again fails (Off)", "2026-10-23", "02:57:20", "02:58:05"),
    ("O-36 video turn with character work fails (Off)", "2026-10-23", "05:26:00", "05:32:40")]),
  imgs=[("TC-071-done2", "amd63_scene_says_refunded"), ("TC-302-done", "amd63_storyboard_failed"), ("TC-295-retry", "amd63_retry_failed"), ("TC-179-ledger", "amd63_ledger")]),

 dict(iss="ISS-AMD-64", title="Storyboard revision shows a generic skeleton instead of skeletons on the changed scene", cls="UI", sev=3, owner="RD",
  cases=["TC-385"], rep=(1, 1),
  note="R-295 / R-062 (PM Update board 3): while a chat storyboard-image update runs, only the changed scenes and the Storyboard Preview show skeletons; a new storyboard card appears at the bottom. TC-385 (Bound Pages, 「Update the image for Scene 2 to show rain」 › Create storyboard ◆3 › Generate 00:20:15, Off): the card disappears and a generic 「Advancing the mini drama production to the next stage.」 skeleton block appears under the request; Scene 2 and the Storyboard Preview above show no skeleton. That turn then failed silently (TC-073, DRI261896P0045 recheck).",
  short="Storyboard image update shows a generic skeleton, not on the changed scene",
  steps=APP + ["Tap History", "Tap a drama with a storyboard", "Type 「Update the image for Scene 2 to show rain」", "Tap Send", "Tap Generate on 「Create storyboard」", "Look at Scene 2 and the Storyboard Preview"],
  res="A generic Advancing… skeleton block appears under the request; Scene 2 and the preview show no skeleton.",
  res_zh="只出現通用的「Advancing…」骨架區塊，Scene 2 與 Storyboard Preview 沒有骨架。",
  exp="Only the changed scene and the Storyboard Preview show skeletons while the update runs.",
  exp_zh="更新期間應只有被修改的場景與 Storyboard Preview 顯示骨架。",
  links=[pm("pm-update-3")],
  imgs=[("TC-073-gen", "amd64_generic_block"), ("TC-073-gen2", "amd64_no_scene_skeleton")]),

 dict(iss="ISS-AMD-65", title="Storyboard Preview card is not rebuilt after the storyboard changes", cls="Functional", sev=3, owner="RD",
  cases=["O-25"], rep=(2, 2),
  note="R-062 (PM Update board 3): on completion of a storyboard change the preview is updated. O-25 (P9-d2, Off): Shared Corner — after the Scene 1 regeneration succeeded (01:52) Iris replied 「Updated the cuts to sync with your edits on Beat 1…」, re-posted a second 「Story Outline & Characters Result」 card under the 0:43 preview and the video settings card; on reopen they were gone again. Bound Pages — cutting to 3 scenes (TC-188, 02:17) reused three earlier images at no charge and kept the old 「0:44」 Storyboard Preview card under the new 3-scene storyboard, so the preview still plays 6 scenes. Related DRI261896P0014 (preview copy during regeneration).",
  short="Storyboard Preview keeps the old preview after the storyboard is cut or changed",
  steps=APP + ["Tap History", "Tap a drama with a 6-scene storyboard", "Type 「Cut the storyboard to 3 scenes.」", "Tap Send", "Wait for the new storyboard", "Look at the Storyboard Preview card"],
  res="The new 3-scene storyboard is shown above the old 0:44 Storyboard Preview card, which is not rebuilt.",
  res_zh="新的 3 場景分鏡下方仍是舊的 0:44 Storyboard Preview，未重新產生。",
  exp="After the storyboard changes, the Storyboard Preview is rebuilt to match the new scenes.",
  exp_zh="分鏡變更後，Storyboard Preview 應依新場景重新產生。",
  links=[pm("pm-update-3")],
  imgs=[("TC-188-done", "amd65_old_preview"), ("TC-188-storyboard", "amd65_three_scenes")]),

 dict(iss="ISS-AMD-66", title="Turn fails with 'token_request fired outside a turn worker thread'", cls="Functional", sev=3, owner="RD",
  cases=["O-26", "O-30"], rep=(2, 2),
  note="App-side error, no fault switch (all Off). O-26: a script change on The Art of Falling (02:32:33) failed after 35 s; log 'send failure[0] tool=environment-executor … reason=\"token_request fired outside a turn worker thread; cc session mint must happen on the turn's main loop\"' then 'turn failed, offering retry' — generic 「Something went wrong on my end.」 + Try again; the retry worked. O-30 / TC-103 (The Gambit 03:33:33): Try again failed after 14 s with the same message from storyboard-executor. The message describes a threading error in the on-device engine (the token mint runs off the turn's main loop), not a server outage.",
  short="Chat turns fail with token_request fired outside a turn worker thread",
  steps=APP + ["Tap History", "Tap a drama with a storyboard", "Type a change to one scene's script", "Tap Send", "Wait for the reply"],
  res="The turn fails with Something went wrong; the log shows 'token_request fired outside a turn worker thread'.",
  res_zh="對話回合失敗，Log 顯示 token_request 在 turn 執行緒外觸發。",
  exp="The turn completes; the session token is minted on the turn's own thread.",
  exp_zh="回合應正常完成，token 應在該回合的主迴圈中取得。",
  links=[pm("pm-top-mockups")],
  log=("token_request threading failures", [
    ("O-26 script change, The Art of Falling (Off)", "2026-10-23", "02:32:30", "02:33:15"),
    ("O-30 Try again, The Gambit (Off)", "2026-10-23", "03:33:20", "03:33:40")]),
  imgs=[("TC-295-before", "amd66_failed_turn"), ("e-retry1", "amd66_gambit_retry")]),

 dict(iss="ISS-AMD-67", title="Whole storyboard failure lacks the Storyboard couldn't be created line", cls="UI", sev=3, owner="RD",
  cases=["TC-295"], rep=(2, 2),
  note="R-159 (Design Storyboard, 1012 update): a whole storyboard failure shows 「Something went wrong on my end.」 and 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」 with Try again (the video failure shows the matching 「Video couldn't be created.」 line, see the gate). TC-295: Pink › [z] AI Mini Drama › Fail turn = unavailable (02:46, read back), Create storyboard ◆7 → 「Something went wrong on my end. Let's try that again.」 + Try again, no ⓘ line. Reproduced with every switch Off: Fail turn Off at 02:50 (read back), Try again 02:51 failed for real at 02:57:57 (storage PUT) with the same generic copy and no ⓘ line. Refund of that try is ISS-AMD-63.",
  short="Failed storyboard lacks the Storyboard couldn't be created line",
  steps=APP + ["Tap History", "Tap a drama at the 「Create storyboard」 card", "Tap Generate", "Wait until the storyboard fails"],
  res="Only 「Something went wrong on my end. Let's try that again.」 and Try again are shown; the ⓘ line is missing.",
  res_zh="分鏡失敗時只顯示通用錯誤與 Try again，缺少分鏡失敗說明。",
  exp="The failure also shows 「ⓘ Storyboard couldn't be created. Try creating your storyboard again.」",
  exp_zh="失敗時應另外顯示 ⓘ 分鏡無法建立的說明。",
  spec=["Spec string: 「Storyboard couldn't be created. Try creating your storyboard again.」"],
  links=[ds(frame="1012_Update thumbnail 9:16 & add Location image (Storyboard)", node="3999-73608")],
  log=("Whole storyboard failures", [
    ("Fail turn = unavailable", "2026-10-23", "02:47:20", "02:47:35"),
    ("Real failure with every switch Off", "2026-10-23", "02:57:20", "02:58:05")]),
  imgs=[("TC-295-fail", "amd67_no_info_line"), ("TC-295-retry", "amd67_off_failure"), ("gate-progress2", "amd67_video_has_line")]),

 dict(iss="ISS-AMD-68", title="Chat does not return to the newest message after History Back or closing Choose Character", cls="Functional", sev=3, owner="RD",
  cases=["TC-101", "TC-102"], rep=(2, 2),
  note="R-089 changed 2026-10-22 (REQ-032): PM 10/20 §13.2 ① — after History, Character Library or Full Edit the chat opens at the bottom (newest message). TC-101 (Bound Pages, Off): scrolled up to the outline › History › Back → the chat is still at the outline with ↓ shown (tapping the drama in History does open at the bottom). TC-102 (chess drama): scrolled up ~100 pt › tap a slot › Choose Character › Close → same scrolled-up position, ↓ shown. Related DRI261896P0056 (scroll jumps to an earlier card after Choose Character — older rule) and DRI261896P0032 (saved storyboard chat not at the bottom; not reproduced).",
  short="Returning from History or Choose Character does not show the newest message",
  steps=APP + ["Tap History", "Tap a drama with a storyboard", "Scroll up to the outline", "Tap History", "Tap Back"],
  res="The chat is still scrolled up at the outline with the ↓ button shown.",
  res_zh="返回後聊天仍停在上方的大綱位置，並顯示 ↓ 按鈕。",
  exp="The chat opens at the bottom, on the newest message.",
  exp_zh="應回到聊天底部，顯示最新訊息。",
  links=[pm("pm-1002-update")],
  imgs=[("TC-101-up", "amd68_before"), ("TC-101-back", "amd68_after_history"), ("TC-102-after", "amd68_after_picker")]),

 dict(iss="ISS-AMD-69", title="Tap outside the History info bubble also opens the drama under it", cls="Functional", sev=3, owner="RD",
  cases=["O-28"], rep=(1, 1),
  note="R-185 (Design Recent Task, REQ-007): the History ⓘ bubble closes on an outside tap. O-28 (P9-e TC-327 03:18, Off): with the bubble open, a tap on a drama card (210,600 pt) closed the bubble and also opened that drama (Shared Corner) — the tap passes through to the list. The bubble now closes on an outside tap (DRI261896P0026 not reproduced), but the closing tap must not also act on what is underneath.",
  short="Tap outside the History info bubble opens the drama under the tap",
  steps=APP + ["Tap History", "Tap ⓘ", "Tap a drama card outside the bubble"],
  res="The bubble closes and the drama under the tap opens.",
  res_zh="點氣泡外的作品卡，氣泡關閉的同時也開啟了該作品。",
  exp="The outside tap only closes the bubble; History stays open.",
  exp_zh="點擊氣泡外只應關閉氣泡，停留在 History。",
  links=[ds("ds-recent-task")],
  imgs=[("TC-327-bubble", "amd69_bubble"), ("e-sharedcorner-accidental", "amd69_drama_opened")]),

 dict(iss="ISS-AMD-70", title="Iris refuses to change the story title once characters exist", cls="Functional", sev=3, owner="RD",
  cases=["TC-318"], rep=(1, 1),
  note="R-177 (PM Update board 4, Bug 0014): the History name is the drama title and follows title changes; a user Rename wins. TC-318 (The Gambit, never renamed, 03:52, Off): 「Please change the story title to Checkmate in the Rain.」 → progress 「Updating the story title to Checkmate in the Rain.」 then 「…Upstream outline metadata (such as the story title) is managed in the outline stage and remains unchanged here…」; History still 「The Gambit」. Log: the turn completed with the decline text, no title tool call. A title request at the outline stage (Silent Notes 03:53) did change the title, so the refusal depends on the stage.",
  short="Asking Iris to change the story title after the characters stage is declined",
  steps=APP + ["Tap History", "Tap a drama whose characters are set", "Type 「Please change the story title to Checkmate in the Rain.」", "Tap Send", "Wait for the reply", "Tap History"],
  res="Iris says the title is managed in the outline stage and History keeps the old title.",
  res_zh="Iris 回覆標題只能在大綱階段修改，History 仍顯示舊標題。",
  exp="Iris changes the title and History shows the new drama title.",
  exp_zh="Iris 應修改標題，History 顯示新標題。",
  links=[pm("pm-update-4")],
  imgs=[("TC-318-reply", "amd70_declined"), ("TC-318-history", "amd70_history_old_title")]),

 dict(iss="ISS-AMD-71", title="Storage upload fails, so every video and many character steps fail", cls="Functional", sev=1, owner="RD",
  cases=["O-34", "O-41", "O-19", "O-23", "O-37"], rep=(6, 6),
  note="Blocks every video: no video reached filming on 189872. Video Generate (Seedance 2.0 Preview ◆120/◆131), all Pink fault switches Off: Shared Corner 05:00 and 05:17, 綴じられた秘密 05:25 (O-34), Shared Corner retry 07:17 (gate4), Old Light on a fresh install 09:21 (O-41) — each fails after ~361 s with video-generation-batch 'HTTP PUT to storage URL failed: Failed to read connection' (07:17: 'Failed to write connection') on storage.googleapis.com/cl-aol-media-demo/…/input.N.png; four failed with 「Something went wrong on my end.」 + 「Video couldn't be created.」 + Try again, the fresh-install one (O-41) ended silently (card=none, failures=1, reply=\"\") — the silent end is DRI261894P0036 (recheck). The same PUT failure breaks character-sync after cast confirm (O-19 23:40, O-23 00:43 / 00:51, O-37 06:28, TC-044 17:24) and beat-edit storyboard changes (TC-073 HTTP 408, TC-184, TC-295). Over two days (10/22 17:24 → 10/23 09:27), on Wi-Fi with other traffic working, every upload of this kind failed: it is not one outage. Nothing was booked for the videos (no AI Video Generator row). Duplicate candidate: DRI261897P0006 (Video generation always fails after ~6 min as the storage upload times out — S1, Assigned, filed on 189729): still reproduces on 189872. Rechecked here per the batch brief; file only if RD wants a ticket on this build.",
  short="Video generation always fails after ~6 min: HTTP PUT to storage URL fails",
  steps=APP + ["Tap History", "Tap a drama at the 「Choose your video settings」 card", "Tap Seedance 2.0", "Tap Preview - 30 sec", "Tap Generate", "Wait 6 minutes"],
  res="After ~6 min the video fails: Something went wrong / Video couldn't be created (log: HTTP PUT to storage URL failed).",
  res_zh="約 6 分鐘後影片生成失敗（Log：HTTP PUT to storage URL failed），無法產生任何影片。",
  exp="The video generates and plays in the chat.",
  exp_zh="影片應成功生成並可在聊天中播放。",
  links=[ds(frame="1012_Update (Video)", node="4249-36188")],
  related="DRI261897P0006 (same failure on 189729; Assigned), DRI261894P0036 (silent end, O-41)",
  log=("Video and character-sync storage uploads fail", [
    ("Gate 1, Shared Corner (Off)", "2026-10-23", "05:00:10", "05:07:00"),
    ("Gate 4 retry, Shared Corner (Off)", "2026-10-23", "07:17:35", "07:24:00"),
    ("O-41 fresh install, Old Light (Off; ends silently)", "2026-10-23", "09:21:00", "09:27:35"),
    ("O-19 cast confirm, Bound Pages: character-sync", "2026-10-22", "23:40:00", "23:41:00")]),
  imgs=[("gate-progress2", "amd71_video_failed"), ("gate-after-generate", "amd71_generate"), ("gate3-b", "amd71_second_drama"), ("c2-after-cast", "amd71_cast_confirm")]),

 dict(iss="ISS-AMD-72", title="Try again after a failed video shows a settings card without the model row", cls="Functional", sev=3, owner="RD",
  cases=["O-35"], rep=(2, 2),
  note="R-083 (Design Video 1012_Update 4249:36188): Try again on 「Video couldn't be created.」 retries the video; the video settings card always carries the model control (Design 1016_add seedance 2.5, frame 2824:130034). O-35 (Shared Corner 05:08 and again 07:17, Off): Try again posts a new settings card with only 「Video length」 and Generate — no model row, so the model cannot be checked or changed on the retry (log: video_model=seedance2). Related DRI261896P0051 (Try again asks which beat to modify; TRCreated) and DRI261894P0029 (Close).",
  short="Try again on a failed video shows a settings card with no model choice",
  steps=APP + ["Tap History", "Tap a drama whose video failed with 「Video couldn't be created.」", "Tap Try again", "Look at the new video settings card"],
  res="The retry card shows only Video length and Generate; the model row is missing.",
  res_zh="重試卡只有 Video length 與 Generate，缺少模型選項。",
  exp="Try again retries the video, or shows the full settings card including the model choice.",
  exp_zh="Try again 應直接重試，或顯示含模型選項的完整設定卡。",
  links=[ds(frame="1012_Update (Video)", node="4249-36188"), ds(frame="1016_add seedance 2.5", node="2824-130034")],
  log=("Try again on a failed video: the retry card's Generate (decisions 2026-10-27: failure-related, log added)", [
    ("O-35 Shared Corner: video fails, offering retry; Try again tapped 05:08 (resume)", "2026-10-23", "05:06:00", "05:08:30"),
    ("O-35 Generate on the length-only retry card: authorize with video_model=seedance2", "2026-10-23", "05:17:00", "05:18:30"),
    ("O-35 again 07:17: Try again, Generate on the length-only card, the video fails again", "2026-10-23", "07:17:00", "07:24:00")],
   r"offering retry|resume begin"),
  imgs=[("gate-retry-start", "amd72_retry_card"), ("TC-347-card", "amd72_normal_card")]),

 dict(iss="ISS-AMD-73", title="Offline sends show a generic network banner instead of the AI Mini Drama offline toast", cls="UI", sev=3, owner="RD",
  cases=["TC-032", "TC-387", "TC-300", "O-38"], rep=(3, 3),
  note="R-028 / R-297 / R-164 (Design Extra board, 1005_Chat 3946:68005; PM Update board 5): offline sends and action buttons show 「You're offline. Check your connection and try again.」, nothing sent or charged. Real network loss (USB confirmed, Wi-Fi off, cellular off; restored after each), Pink untouched: TC-032 idea + Generate 06:05, TC-387 chat message 06:09, TC-300 Create storyboard Generate 06:31 — the screen shows 「No connection available. Check your network connection and then try again.」 each time, while the log records '[AIDrama Toast] You're offline. Check your connection and try again.' at the same second. Behaviour is right (nothing sent or charged, text and card kept); only the shown copy differs, so the AI Mini Drama toast is either not drawn or replaced by a generic banner.",
  short="Offline send shows No connection available instead of You're offline toast",
  steps=APP + ["Turn off Wi-Fi and cellular data", "Tap Create Your Drama", "Type an idea", "Tap Send", "Tap English", "Tap Yes, include captions", "Tap Generate"],
  res="A banner reads 「No connection available. Check your network connection and then try again.」",
  res_zh="離線時顯示「No connection available…」通用橫幅，而非 AI Mini Drama 的離線提示。",
  exp="The toast reads 「You're offline. Check your connection and try again.」",
  exp_zh="應顯示「You're offline. Check your connection and try again.」提示。",
  spec=["Spec string: 「You're offline. Check your connection and try again.」"],
  rec=["[AI Recommendation]", "Toast: You're offline. Check your connection and try again."],
  links=[ds(frame="1005_Chat (offline)", node="3946-68005"), pm("pm-update-5")],
  log=("Offline sends: the spec toast is logged, another banner is shown", [
    ("TC-032 idea + Generate offline", "2026-10-23", "06:05:30", "06:05:40"),
    ("TC-387 chat message offline", "2026-10-23", "06:09:30", "06:09:40"),
    ("TC-300 Create storyboard offline", "2026-10-23", "06:31:50", "06:32:00")]),
  imgs=[("TC-032-after", "amd73_idea_offline"), ("TC-387-after", "amd73_chat_offline"), ("TC-300-after", "amd73_storyboard_offline")]),
]

DUPS = {"ISS-AMD-71": "DRI261897P0006, Assigned S1", "ISS-AMD-53": "DRI261897P0016, Propose Wont Fix", "ISS-AMD-54": "DRI261895P0024, QA Propose Wont Fix — new grounds: PM 10/16 board 9", "ISS-AMD-60": "DRI261896P0048, Assigned — partly fixed"}

# Existing tickets that still reproduce: information only, no comments (team rule 2026-10-21).
RECHECKS = [
 ("TC-014", "DRI261895P0023", "Propose Wont Fix — Surprise me replaces the composer instead of appending", "Tap 2 left it unchanged, taps 3–4 replaced the whole input; never appended."),
 ("TC-019", "DRI261896P0059", "NAB — More ideas + chip missing once the chat has content", "No chip at the format card, outline or characters card (as P1). Ticket is NAB; not refiled."),
 ("TC-193", "DRI261895P0004", "Assigned — a pet that drives the story is never offered as a character", "Grandma's cat drives three beats; only two human slots."),
 ("TC-213", "DRI261896P0038", "Propose Wont Fix — a message before the format is chosen skips language and captions", "「Make it bittersweet」 at the format card → outline with no language/captions chosen (answers=0)."),
 ("TC-039, TC-040, TC-047, TC-060, TC-070, TC-072, TC-349, TC-350", "DRI261896P0046", "ProposeNAB — character, scene image and chat update prices differ from the spec", "One character ◆4 (spec ◆6), two ◆8 (◆12); images booked at −3 (spec 2 per image); Regenerate Image authorizes TextToImagex2 for one failed image."),
 ("TC-121", "DRI261897P0017", "Assigned — X on Finish your characters keeps the generated looks", "X closes the sheet, the new look is applied and a ✦ Mine card exists."),
 ("TC-126", "DRI261896P0031", "NewCreated — AI Suggestion leaves required attributes empty", "Description = the outline's role line; Gender/Ethnicity/Age empty; Generate disabled."),
 ("TC-067", "DRI261897P0012", "NewCreated — failed scene image card copy differs from the Design error frame", "Card body 「…Try editing the description for a different result.」 vs Design 1012 「The service is busy — try again later.」 (Pink Fail media tool = TextToImage; copy is static)."),
 ("TC-073, TC-293", "DRI261896P0045", "TRCreated — updating a storyboard image from chat fails silently", "Scene 2 rain update: skeleton then nothing (beat-edit PUT 408); two-scene snow/rain requests get reply=\"\" and no card."),
 ("TC-175", "DRI261893-0123", "NAB — storyboard scene description has no edit or save action", "Successful scene script read-only; Edit only on a failed image. NAB; not refiled."),
 ("TC-178", "DRI261893-0163", "QANeedRework — successful storyboard image routes expose no version editor", "Tap / long-press on a successful scene or location tile does nothing."),
 ("TC-179", "DRI261894P0007 / DRI261894P0021", "QA Propose Postpone / Propose Postpone — credit details list drama charges as Text to Image / Text to Speech", "Ledger rows still read Text to Image / Text to Speech, none say AI Mini Drama."),
 ("TC-184, O-12, O-41", "DRI261894P0036", "TRCreated — after a failed step the chat is left with no next step, card or retry", "Art of Falling ◆7 storyboard failed with no error/Try again/offer; a failed Add New turn removed the slot card (O-12); fresh-install video failure ended silently (O-41)."),
 ("TC-187", "DRI261894P0046", "Close — language change by chat leaves outline and scene titles in the old language", "Partly reproduces: beats, scene titles and scripts now Japanese, but 「Possible Characters:」 lines stay English. Closed ticket — reopen candidate (listed only, not acted on)."),
 ("TC-208", "DRI261896P0024", "TRCreated — Story Outline & Characters Result block appears twice", "Window Notes: two outline blocks after Done ✓ (20:36)."),
 ("TC-212", "DRI261896P0034", "Fail — default actors assigned with the wrong gender", "The Art of Falling: Julian Cross = a woman, Lauren Hale = a man."),
 ("TC-288", "DRI261897P0018", "NewCreated — character filter with no matches shows a blank grid", "Male + Indigenous: only 「Create my character」 and blank space (disposition spec-addition)."),
 ("TC-276, TC-277", "DRI261897P0020", "Assigned — feature strings stay English in Traditional Chinese and Japanese", "zh-Hant and ja tours: feature strings still English, shared strings translated."),
 ("TC-115", "DRI261896P0055", "TRCreated — video settings card does not show You'll have N left", "Line reads 「You have 18830 credits left」 (current balance)."),
 ("TC-081, TC-303", "DRI261895P0022", "NeedCodeReview — first video omits the notification pre-prompt", "No 「Get notified when your video is ready?」 on the first video of three installs (all videos then failed, so a post-start prompt cannot be ruled out)."),
 ("TC-153, TC-155", "DRI261893-0128", "Propose Won't Fix — outline and revision Stop give no feedback", "Stop removes the skeleton with no message."),
 ("TC-156", "DRI261897P0007", "NewCreated — storyboard and video Stop cancel silently", "Storyboard Stop 06:35: no dialog, toast or message."),
 ("TC-154, TC-161", "DRI261895P0024", "QA Propose Wont Fix — character generation has no usable Stop or cancellation warning", "Generate all: no Stop, X / outside tap / Back dead for ~72 s. The PM 10/16 Cancel rows are drafted as ISS-AMD-54."),
 ("TC-169", "DRI261895P0029", "Assigned — outline generation blocks actions beyond ten seconds", "Longest stretch ~21 s (log wall 20.9 s)."),
 ("TC-171", "DRI261895P0030", "Assigned — revision blocks actions beyond ten seconds", "~16 s (log wall 15.9 s)."),
 ("TC-170, TC-172, O-10, O-13", "DRI261897P0008", "Assigned — character and storyboard generation block the screen for over a minute", "Characters 63–234 s, storyboard 101–245 s, chat turns up to 423 s with only 「Thinking…」."),
 ("O-31", "DRI261894P0042", "TRCreated — VoiceOver reads image IDs for Back and other buttons", "Credits page from the pill: Back 「D58D762F 181C …」, info 「FE31A39E …」."),
 ("O-34, O-41", "DRI261897P0006", "Assigned (S1) — video generation always fails after ~6 min (storage upload)", "Every video on 189872 failed the same way; drafted as ISS-AMD-71 per the brief, starts on hold as its duplicate."),
 ("TC-042, TC-043, TC-353, TC-329, O-15", "DRI261897P0016", "Propose Wont Fix — failed character and video generations keep credits", "Still kept on 189872; drafted as ISS-AMD-53 per rule 8, starts on hold as its duplicate."),
]

FIXED = [
 ("TC-047", "DRI261894P0009", "Create my character heading reads 「…looks like」 now (fixed)."),
 ("TC-042", "DRI261896P0042", "Partly fixed: the failure dialog and the red 「!」 now show (refund still missing → DRI261897P0016)."),
 ("TC-277", "DRI261896P0022", "Japanese template names no longer truncate."),
 ("TC-113", "DRI261896P0032", "Saved storyboard chat opens at the bottom."),
 ("TC-105 (P9-j)", "DRI261896P0026", "History hint closes on an outside tap (but the tap passes through: ISS-AMD-69)."),
 ("TC-040", "DRI261896P0016", "Singular 「1 character isn't set yet」 correct in a custom chat (template chat not checked)."),
]

# Held: not drafted as bugs (reason shown on the review page).
HELD = [
 ("TC-381, O-40", "question (PM)", "Idea chat: Back at the format card shows 「Leave this chat?」 (RD Note 三.1: a message was sent, so it asks), but the row expects no dialog (R-288). Template chats now leave with no dialog (O-40), so the two entry paths differ. PM to rule which is right."),
 ("TC-031", "question (PM)", "Policy-violating idea gets the model's own refusal text, not the spec copy; the 4xxx moderation path may not have been hit (log: normal model turn). DRI261896P0053 (NewCreated) already asks this."),
 ("TC-189", "question (PM)", "Unsupported 9:16 / 15 s request: no reply problem gone, but the request is not answered as unsupported. Is 15 s a supported length? (DRI261894P0050)."),
 ("TC-204", "question (PM)", "Animal character needs an ethnicity; 「Other」 is the only path. Is Other intended for animals? (DRI261896P0017, ProposeNAB)."),
 ("TC-159", "question (PM)", "Leaving a running outline discards it (dialog says so): the row's 'same task at that stage' cannot happen. Should a running outline survive leaving? (DRI261897P0013)."),
 ("TC-164", "question (PM)", "Leaving a running storyboard stops it and keeps −9 (dialog warns); the row expects the stage to continue. Spec dialog vs row conflict."),
 ("TC-158", "question (PM) — conflicts with RD Note 三.1 / TC-381", "Unsent typed idea is dropped on Back with no alert; RD's DRI261894P0043 fix makes an unsent chat leave silently and TC-381's first step expects exactly that. Not a defect per RD; PM to say whether a typed draft should be kept."),
 ("TC-341, TC-342", "PM question (RD Note 二.1)", "No page 「Discard」 button and no swipe-down on a finished Create my character result: RD says the sheet is full-screen and X is the only close path. PM-only rows contradict the RD design."),
 ("TC-079, TC-347", "ask RD/CMS (RD Note 一.1d)", "Model control reads Best / Seedance 2.0 / Seedance 2.0 Mini with the old subtitles; RD says Best / Standard / Fast need CMS keys AnswerVideoVendorSeedance2_5 / VendorDescriptionSeedance2_5 — check whether the keys are live on the Developer Server before filing."),
 ("TC-080", "ask RD/CMS (RD Note 一.1e, open item)", "Best (Seedance 2.5) priced ◆120/◆360 like 2.0 (spec ◆180/◆540): Seedance 2.5 still uses the 2.0 credit action ID (open item in the RD Note). Re-check when the 2.5 action ID lands."),
 ("O-20, O-27 (price vs booking)", "ask RD (billing)", "Character Generate ◆4 booked only −3 twice (no TTS row); Create storyboard ◆7 authorized 7 but booked −3 before failing. Under-charge / booking mismatch, user not harmed; ask RD whether the per-item booking is intended."),
 ("O-16, O-18", "needs ground truth", "Public-figure check blocked two photos of non-famous-looking people and an AI-generated character sheet; no log shows the match. Could be correct or over-broad — ask RD for the check's result before filing."),
 ("O-7", "single sighting", "African library cards blank white (16:51) in a window with CMS media download failures and network loss; not seen again. Re-check before filing."),
 ("O-3", "question (PM) / network", "Template row stays grey skeletons during real network loss (-1005/-1009) with no offline or retry state; no spec state for it."),
 ("O-39", "question (PM) / network", "A request lost to network loss stays on 「Developing the story outline…」 + Stop for ~3 min after the network returns before Try again; no spec timeout."),
 ("O-1, O-2, O-12, O-24", "server outage", "cc team gateway 'Failed to read connection' / 502 upstream provider UNAVAILABLE / Gemini UNAVAILABLE; the app showed 「Something went wrong」 + Try again (correct handling). Refund of O-24's TC-071 charge: ISS-AMD-63."),
 ("TC-071 (image never arrives)", "server outage", "Scene 1 regeneration failed 4× on -1009 / Gemini UNAVAILABLE; skeleton as expected. Refund raised as ISS-AMD-63."),
]

NOT_BUG = [
 ("O-5", "Credit pill 60 lower with nothing charged on this phone", "Shared account; other devices' charges."),
 ("O-33", "Subscription page exposes image IDs and raw IAP keys to VoiceOver", "Not AI Mini Drama UI (subscription page); noted only, outside this table."),
 ("O-6", "Slot card skeleton ~25 s on reopen", "Merged into ISS-AMD-62 note (reopen) and the wait recheck DRI261897P0008."),
 ("TC-043 copy", "Single failure reads 「…Try again later.」 (Design frame) vs PM 「…Try again.」", "Build matches the Design frame; Design wins (no newer PM date); refund part is ISS-AMD-53."),
]

# Every Fail row and observation → where it went.
MAP = {
 "TC-014": "recheck DRI261895P0023", "TC-019": "recheck DRI261896P0059 (NAB)", "TC-381": "held (PM question)",
 "TC-357": "1. ISS-AMD-50", "TC-358": "1. ISS-AMD-50", "TC-031": "held (PM question)", "TC-189": "held (PM question)",
 "TC-193": "recheck DRI261895P0004", "TC-213": "recheck DRI261896P0038", "TC-039": "recheck DRI261896P0046",
 "TC-040": "recheck DRI261896P0046", "TC-041": "5. ISS-AMD-54", "TC-042": "3. ISS-AMD-52 + 4. ISS-AMD-53",
 "TC-384": "3. ISS-AMD-52", "TC-043": "4. ISS-AMD-53", "TC-044": "6. ISS-AMD-55", "TC-121": "recheck DRI261897P0017",
 "TC-208": "recheck DRI261896P0024", "TC-212": "recheck DRI261896P0034 (+ 2. ISS-AMD-51 en_US)",
 "TC-288": "recheck DRI261897P0018 (spec-addition)", "TC-337": "5. ISS-AMD-54", "TC-348": "8. ISS-AMD-57",
 "TC-391": "9. ISS-AMD-58", "TC-349": "8. ISS-AMD-57 (+ price recheck DRI261896P0046)",
 "TC-350": "10. ISS-AMD-59 (+ price recheck DRI261896P0046)", "TC-351": "11. ISS-AMD-60", "TC-352": "8. ISS-AMD-57",
 "TC-353": "3. ISS-AMD-52 + 4. ISS-AMD-53", "TC-047": "recheck DRI261896P0046 (DRI261894P0009 fixed)",
 "TC-051": "12. ISS-AMD-61", "TC-126": "recheck DRI261896P0031", "TC-204": "held (PM question)",
 "TC-332": "5. ISS-AMD-54", "TC-333": "5. ISS-AMD-54", "TC-334": "5. ISS-AMD-54", "TC-383": "5. ISS-AMD-54",
 "TC-341": "held (PM question, RD Note 二.1)", "TC-342": "held (PM question, RD Note 二.1)",
 "TC-060": "recheck DRI261896P0046", "TC-359": "1. ISS-AMD-50", "TC-067": "recheck DRI261897P0012",
 "TC-070": "recheck DRI261896P0046", "TC-071": "14. ISS-AMD-63 (image never arrives: server, held)",
 "TC-072": "recheck DRI261896P0046", "TC-385": "15. ISS-AMD-64", "TC-073": "recheck DRI261896P0045",
 "TC-175": "recheck DRI261893-0123 (NAB)", "TC-178": "recheck DRI261893-0163", "TC-179": "recheck DRI261894P0007 / P0021",
 "TC-184": "recheck DRI261894P0036 + 14. ISS-AMD-63", "TC-187": "reopen candidate DRI261894P0046 (+ 2. ISS-AMD-51 ja_JP)",
 "TC-293": "recheck DRI261896P0045", "TC-295": "18. ISS-AMD-67 + 14. ISS-AMD-63", "TC-101": "19. ISS-AMD-68",
 "TC-102": "19. ISS-AMD-68", "TC-103": "8. ISS-AMD-57", "TC-113": "13. ISS-AMD-62", "TC-276": "recheck DRI261897P0020",
 "TC-277": "recheck DRI261897P0020 (DRI261896P0022 fixed)", "TC-318": "21. ISS-AMD-70",
 "TC-329": "4. ISS-AMD-53 (offer title 「Update characters」 noted)", "TC-115": "recheck DRI261896P0055",
 "TC-079": "held (ask RD/CMS)", "TC-080": "held (ask RD/CMS)", "TC-081": "recheck DRI261895P0022",
 "TC-347": "held (ask RD/CMS)", "TC-032": "24. ISS-AMD-73", "TC-387": "24. ISS-AMD-73",
 "TC-153": "recheck DRI261893-0128", "TC-154": "recheck DRI261895P0024", "TC-155": "recheck DRI261893-0128",
 "TC-156": "recheck DRI261897P0007", "TC-158": "held (PM question; conflicts with RD Note 三.1)",
 "TC-159": "held (PM question)", "TC-160": "13. ISS-AMD-62", "TC-161": "recheck DRI261895P0024",
 "TC-163": "13. ISS-AMD-62", "TC-164": "held (PM question)", "TC-169": "recheck DRI261895P0029",
 "TC-170": "recheck DRI261897P0008", "TC-171": "recheck DRI261895P0030", "TC-172": "recheck DRI261897P0008",
 "TC-300": "24. ISS-AMD-73", "TC-303": "recheck DRI261895P0022",
 "O-1": "held (server outage)", "O-2": "held (server outage)", "O-3": "held (PM question / network)",
 "O-4": "2. ISS-AMD-51", "O-5": "not a bug (shared account)", "O-6": "merged into 13. ISS-AMD-62 note",
 "O-7": "held (single sighting)", "O-8": "13. ISS-AMD-62", "O-9": "7. ISS-AMD-56", "O-10": "recheck DRI261897P0008",
 "O-11": "7. ISS-AMD-56", "O-12": "held (server outage) + recheck DRI261894P0036 (card removed)",
 "O-13": "recheck DRI261897P0008", "O-14": "13. ISS-AMD-62", "O-15": "4. ISS-AMD-53",
 "O-16": "held (needs ground truth)", "O-17": "13. ISS-AMD-62", "O-18": "held (needs ground truth)",
 "O-19": "22. ISS-AMD-71", "O-20": "held (ask RD, billing)", "O-21": "11. ISS-AMD-60", "O-22": "13. ISS-AMD-62",
 "O-23": "22. ISS-AMD-71", "O-24": "held (server outage); refund → 14. ISS-AMD-63", "O-25": "16. ISS-AMD-65",
 "O-26": "17. ISS-AMD-66 (+ empty replies → recheck DRI261896P0045)", "O-27": "14. ISS-AMD-63 (price vs booking held, ask RD)",
 "O-28": "20. ISS-AMD-69", "O-29": "13. ISS-AMD-62", "O-30": "17. ISS-AMD-66 + 7. ISS-AMD-56",
 "O-31": "recheck DRI261894P0042", "O-32": "13. ISS-AMD-62", "O-33": "not a bug here (outside AI Mini Drama)",
 "O-34": "22. ISS-AMD-71", "O-35": "23. ISS-AMD-72", "O-36": "6. ISS-AMD-55 + 14. ISS-AMD-63",
 "O-37": "22. ISS-AMD-71 + 7. ISS-AMD-56", "O-38": "24. ISS-AMD-73", "O-39": "held (PM question / network)",
 "O-40": "held with TC-381 (PM question)", "O-41": "22. ISS-AMD-71 (+ silent end → recheck DRI261894P0036)",
 "O-42": "22. ISS-AMD-71 (TC-303's 10/23 video, read 10/27: same storage PUT failure; entry held as DRI261897P0006)",
}


def jpg(src, dst):
    subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80", src, "--out", dst],
                   check=True, capture_output=True)


def main():
    rows = list(csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig")))
    tally = {}
    for r in rows:
        tally[r["Result"]] = tally.get(r["Result"], 0) + 1
    fails = [r["ID"] for r in rows if r["Result"] == "Fail"]
    disp = {r["ID"]: r["Disposition"] for r in rows}
    blocked = [r for r in rows if r["Result"] == "Blocked"]
    obs = sorted(set(re.findall(r"^-? ?\*{0,2}(O-\d+)", open(f"{RUN}/observations.md", encoding="utf-8").read(), re.M)), key=lambda x: int(x[2:]))
    missing = [k for k in fails + obs if k not in MAP]
    extra = [k for k in MAP if k not in fails and k not in obs]
    if missing or extra:
        sys.exit(f"reconciliation incomplete: missing {missing}, extra {extra}")
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for k, v in MAP.items():
        for n, iss in re.findall(r"(\d+)\. (ISS-AMD-\d+)", v):
            if num[iss] != int(n):
                sys.exit(f"{k}: {iss} is entry {num[iss]}, map says {n}")
    for e in E:
        for c in e["cases"]:
            if c not in MAP or e["iss"] not in MAP[c]:
                sys.exit(f"{e['iss']} cites {c} but MAP[{c}] = {MAP.get(c)}")

    img_root = f"{OUT}/{NAME}_images"
    if os.path.isdir(img_root):
        shutil.rmtree(img_root)
    os.makedirs(img_root)
    os.makedirs(f"{OUT}/logs", exist_ok=True)
    L = []
    w = L.append
    w(f"# AI Mini Drama (iOS) — eBug drafts, run P9 (full table), PDR-I {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-22-p9-full/` — the {len(rows)} cases of draft `drafts/20261022-145212/draft.csv` (requirements.md there), run 2026-10-22 15:33 → 2026-10-23 10:00 on {DEVICE[8:]} through Appium/WebDriverAgent, TestFlight build {V} ({B}), {TR}, Developer Server, Pro+. Result: {tally.get('Pass', 0)} Pass, {tally.get('Fail', 0)} Fail, {tally.get('Blocked', 0)} Blocked. Off-case observations O-1…O-41: `runs/2026-10-22-p9-full/observations.md`. RD Note of {TR}: `runs/2026-10-22-p9-full/rd-note-TR261022-0031.txt`, mapped in `build-notes.md`. Spec set `specs/2026-10-21-2` (PM Spec 20261021, Design Spec + Figma 1016 frames).")
    w("")
    filed = f"{OUT}/filed_bugcodes.json"
    if os.path.exists(filed):
        fj = json.load(open(filed, encoding="utf-8"))
        m = fj["meta"]
        codes = ", ".join(f"{b['iss']} {b['bugcode']}" for b in fj["bugs"])
        w(f"**Filed by:** {m['creator']} on {m['filed_on']} via {m['method'].upper()} on {m['tr']} ({m['version']} build {m['build']}) — {codes}. Decisions: `decisions.md` (F-4, F-5, F-11, F-22 held as duplicates; no existing ticket touched). Review page: `20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html`.")
    else:
        w(f"**Decisions (user, 2026-10-27):** `decisions.md` — account ETHAN_HSU, method API, `[{TAG}]`, {TR}; F-2 Sev 2; F-4, F-5, F-11, F-22 held as duplicates. F-3 and F-23 got log excerpts (failure-related). Not filed yet; dedupe was read-only (`dedupe.txt`). Review page: `20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html`.")
    w("")
    w("Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the log excerpt where a log shows the cause and on every failure-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD. Existing tickets that still reproduce are Rechecks for information only (no comments, team rule 2026-10-21). Missing refunds have their own entries (rule 8). Pink fault switches are named where used; every entry reproduced with every switch Off unless its note says otherwise.")
    w("")
    w(f"**What is drafted:** {len(E)} entries — the defects with no open ticket of their own, plus two that the brief and rule 8 ask to draft even though a ticket exists (ISS-AMD-71 storage upload = DRI261897P0006, ISS-AMD-53 character refunds = DRI261897P0016); those two start on hold as duplicates, as do ISS-AMD-54 (DRI261895P0024) and ISS-AMD-60 (DRI261896P0048) after the dedupe. Entries are numbered roughly in run order; trust the ISS-ID over the number.")
    w("")
    w("Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec). Every entry links the spec board or Figma frame it is checked against.")
    w("")
    for n, e in enumerate(E, 1):
        folder = f"{n:02d}_{e['iss']}"
        os.makedirs(f"{img_root}/{folder}")
        names = []
        for png, slug in e["imgs"]:
            src = f"{RUN}/screenshots/{png}.png"
            if not os.path.exists(src):
                sys.exit(f"missing screenshot {src}")
            name = f"{V}_{slug}.jpg"
            jpg(src, f"{img_root}/{folder}/{name}")
            names.append(name)
        if e.get("log"):
            title, secs = e["log"][:2]
            extra = e["log"][2] if len(e["log"]) > 2 else None
            p = logx.excerpt(f"{OUT}/logs/{V}_amd{e['iss'][-2:]}_log.txt", f"{e['iss']} {title}", HDR, secs, extra)
            shutil.copy(p, f"{img_root}/{folder}/")
            names.append(os.path.basename(p))
        tagtype = "" if e["cls"] == "Functional" else f"[{e['cls']}]"
        short = f"PDR-I {V} - [{TAG}]{tagtype} AI Mini Drama: {e['short']}"
        if len(short) > 140:
            sys.exit(f"{e['iss']} short description {len(short)} > 140")
        w("---"); w("")
        w(f"## {n}. {e['iss']} — {e['title']}  ·  Class: {e['cls']}  ·  Severity: S{e['sev']}  ·  Owner: {e['owner']}")
        w("")
        w(f"**Report step:** {', '.join(e['cases'])}  ·  **Reproduce:** {e['rep'][0]}/{e['rep'][1]}  ·  **Verified on:** {V}.{B}")
        w("")
        w(f"> **QA note — not pasted into eBug.** {e['note']}")
        w("")
        w("**Short Description:**"); w(""); w("```"); w(short); w("```"); w("")
        w("**Description:**"); w(""); w("```"); w("Repro Steps:")
        for i, s in enumerate(e["steps"], 1):
            w(f"{i}. {s}")
        w(f"{len(e['steps']) + 1}. Check the result")
        w(""); w("Result:"); w(e["res"]); w(f"摘要：{e['res_zh']}"); w(" ".join("{" + x + "}" for x in names))
        w(""); w("Expect Result:"); w(e["exp"]); w(f"摘要：{e['exp_zh']}")
        for s in e.get("spec", []):
            w(s)
        if e.get("rec"):
            w(""); [w(x) for x in e["rec"]]
        w(""); w("Note:"); w(DEVICE)
        for l in e["links"]:
            w(l)
        if e.get("related"):
            w(f"Related: {e['related']}")
        w("<Claude Reviewed>"); w("```"); w("")
        w(f"**Images:** `{NAME}_images/{folder}/`"); w("")

    w("---"); w("")
    w(f"## Rechecks — existing tickets that still reproduce on {B} (information only; no comments, team rule 2026-10-21)")
    w("")
    w("| P9 case | Ticket | Status — ticket says | What P9 saw |")
    w("|---|---|---|---|")
    for c, t, s, saw in RECHECKS:
        w(f"| {c} | {t} | {s} | {saw} |")
    w("")
    w(f"## Fixed or partly fixed on {B} (information only)")
    w("")
    w("| P9 case | Ticket | What P9 saw |")
    w("|---|---|---|")
    for c, t, saw in FIXED:
        w(f"| {c} | {t} | {saw} |")
    w("")
    w("## Held — not drafted as bugs")
    w("")
    w("| Item | Reason | What to decide |")
    w("|---|---|---|")
    for k, d, q in HELD:
        w(f"| {k} | {d} | {q} |")
    w("")
    w("## Not raised (for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in NOT_BUG:
        w(f"| {k} | {a} | {b} |")
    bd = {}
    for r in blocked:
        bd[r["Disposition"]] = bd.get(r["Disposition"], 0) + 1
    w(f"| Blocked ({len(blocked)}) | " + ", ".join(f"{v} {k}" for k, v in sorted(bd.items())) + " | No verdict: video gate (no video reached filming, ISS-AMD-71 / DRI261897P0006), policy (full generation REQ-019, low balance, purchase, chat count, remote config, new account, voice), observability and upstream failures. Listed on the review page. |")
    w("")
    w("## Reconciliation against the report")
    w("")
    nq = sum(1 for f in fails if disp[f] in ("question", "spec-addition"))
    w(f"The run is the report: {len(fails)} Fail ({len(fails) - nq} defect, {nq} question / spec-addition), {len(blocked)} Blocked (no verdict), observations {obs[0]}…{obs[-1]} ({len(obs)}).")
    w("")
    ent_from = {}
    for k, v in MAP.items():
        for _, iss in re.findall(r"(\d+)\. (ISS-AMD-\d+)", v):
            ent_from.setdefault(iss, []).append(k)
    kinds = {"entry": [], "recheck": [], "held": [], "notbug": []}
    for k, v in MAP.items():
        if re.search(r"\d+\. ISS-AMD", v):
            kinds["entry"].append(k)
        elif v.startswith("recheck") or v.startswith("reopen"):
            kinds["recheck"].append(k)
        elif v.startswith("held"):
            kinds["held"].append(k)
        else:
            kinds["notbug"].append(k)
    tot = len(fails) + len(obs)
    w("| Step | Count | Running total |")
    w("|---|---|---|")
    w(f"| Fail rows + observations | {tot} | {tot} |")
    run = tot
    run -= len(kinds["recheck"]); w(f"| → recheck / reopen candidate of an existing ticket (no new entry) | −{len(kinds['recheck'])} | {run} |")
    run -= len(kinds["held"]); w(f"| → held (PM question, ask RD/CMS, server outage, ground truth, single sighting) | −{len(kinds['held'])} | {run} |")
    run -= len(kinds["notbug"]); w(f"| → not a bug / merged into a note | −{len(kinds['notbug'])} | {run} |")
    merged = run - len(E)
    w(f"| → merged: {run} items share {len(E)} defects | −{merged} | **{len(E)} entries** |")
    w("")
    w("### Row-by-row map")
    w("")
    w("| Item | Result | Disposition | Became |")
    w("|---|---|---|---|")
    for k in fails:
        w(f"| {k} | Fail | {disp[k]} | {MAP[k]} |")
    for k in obs:
        w(f"| {k} | observation | — | {MAP[k]} |")
    w("")
    w("### Owner split")
    w("")
    w("| Owner | Entries |")
    w("|---|---|")
    for o in ("RD", "PM", "Doc"):
        w(f"| {o} | {', '.join(str(i) for i, e in enumerate(E, 1) if e['owner'] == o) or '—'} |")
    w("")
    w("### Filing order")
    w("")
    w("By severity, duplicates last: " + ", ".join(f"**{i}**" for s in (1, 2, 3, 4) for i, e in enumerate(E, 1) if e["sev"] == s and e["iss"] not in DUPS) + "; on hold as duplicates (read-only dedupe, `dedupe.txt`, each candidate read): " + ", ".join(f"**{num[k]}** ({v})" for k, v in DUPS.items()) + ". Other dedupe hits were judged related, not duplicates (named on each card). " + ("Filed 2026-10-27 per `decisions.md` (BugCodes in `filed_bugcodes.md`)." if os.path.exists(f"{OUT}/filed_bugcodes.json") else "Nothing is filed until the review page's decisions come back."))
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries → {OUT}/{NAME}.md")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the AI Mini Drama Android eBug draft batch for phase A2 (table v2, draft 20261027-171228) on 16.8.0 (2610212).

Writes library/pdr/ai-mini-drama/android/ebugs/2026-10-27-a2/20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0.md, the sibling
_images/ folder (one NN_ISS-ID folder per entry: JPEGs named 16.8.0_<slug>.jpg plus the logcat excerpt where the finding
is failure-related or a log shows the cause) and logs/. First Android batch: the ISS-AMDA sequence starts at 01. Nothing is
filed. Every Fail row of results.csv and every observation O-n is mapped (entry / recheck of an existing ticket / held PM
question / not a bug); the script stops when one is missing.
"""
import csv, json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logx

REPO = logx.REPO
ROOT = f"{REPO}/library/pdr/ai-mini-drama/android"
RUN = logx.RUN
OUT = f"{ROOT}/ebugs/2026-10-27-a2"
NAME = "20261027_eBug_drafts_AI-Mini-Drama-A2_16.8.0"
V, B, TR = "16.8.0", "2610212", "TR261021-0082"
TAG = "AIAgent"
DEVICE = "Device: Sony Xperia 10 III (XQ-BT52) / Android 12"

DS_URL = "https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama"
PM_URL = "https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama"
PM_PDF = "AI Mini Drama - PM Spec 20261021.pdf"
_BOARDS = json.load(open(f"{REPO}/library/pdr/ai-mini-drama/specs/2026-10-21-2/extracted/boards.json"))
_TITLE = {b["id"]: b["title"] for v in _BOARDS.values() for b in v}
_REQ = {}
for _l in open(f"{ROOT}/requirements.md", encoding="utf-8"):
    _m = re.match(r"^- (R-\d+) \[([^\]]*)\]", _l)
    if _m and _m.group(1) not in _REQ:
        _REQ[_m.group(1)] = _m.group(2)
CASES = {r["ID"]: r for r in csv.DictReader(open(f"{ROOT}/cases.csv", encoding="utf-8-sig"))}


def ds(board=None, frame=None, node="116-7873"):
    name = f"{frame} frame" if frame else f"{_TITLE[board]} board"
    return f"Spec Link: AI Mini Drama Design spec, {name} - {DS_URL}?node-id={node}"


def pm(board, node="2016-2"):
    return f"Spec Link: AI Mini Drama PM spec ({PM_PDF}), {_TITLE[board]} board - {PM_URL}?node-id={node}"


def link_for(rid):
    """The Spec Link line for one requirement, from its source tag in requirements.md (None for QA rules)."""
    tag = _REQ.get(rid, "")
    m = re.search(r"flow arrow (\d+-\d+) (https://\S+)", tag)
    if m:
        return f"Spec Link: AI Mini Drama Design spec, flow arrow {m.group(1)} ({rid}) - {m.group(2)}"
    if "4422:2" in tag:
        return f"Spec Link: AI Mini Drama PM spec, Figma 10/22 update §13.24 (Storyboard / Video in two stages) - {PM_URL}?node-id=4422-2"
    if "4418:2" in tag:
        return f"Spec Link: AI Mini Drama PM spec, Figma 10/22 update (Export Full Video states) - {PM_URL}?node-id=4418-2"
    m = re.search(r"DS:figma (.+?) (\d+):(\d+)", tag)
    if m:
        return f"Spec Link: AI Mini Drama Design spec, {m.group(1)} frame - {DS_URL}?node-id={m.group(2)}-{m.group(3)}"
    m = re.search(r"PM:(pm-[\w-]+)(?: ([^;]*?))?(?:;|$)", tag)
    if m and m.group(1) in _TITLE:
        extra = f" {m.group(2).strip()}" if m.group(2) and m.group(2).strip() else ""
        return f"Spec Link: AI Mini Drama PM spec ({PM_PDF}), {_TITLE[m.group(1)]} board{extra} - {PM_URL}?node-id=2016-2"
    m = re.search(r"DS:(ds-[\w-]+)", tag)
    if m and m.group(1) in _TITLE:
        return ds(m.group(1))
    return None


def links_for(cases, extra=()):
    out = list(extra)
    for c in cases:
        if not c.startswith("TC-"):
            continue
        for rid in re.findall(r"R-\d+", CASES[c]["Spec Ref"].split("(")[0] if "(board-notes" in CASES[c]["Spec Ref"] else CASES[c]["Spec Ref"]):
            l = link_for(rid)
            if l and all(l.split(" board")[0].split(" - ")[0] != o.split(" board")[0].split(" - ")[0] for o in out):
                out.append(l)
    return out[:3]


HDR = (f"# PowerDirector Mobile for Android {V} ({B}), {TR}, Stage server, Sony Xperia 10 III / Android 12, account Free. "
       "Excerpt of the app's logcat (captured per run segment; the release build writes no readable app log).")

APP = ["Launch the APP", "Tap AI Mini Drama on the Launcher"]
NEW = APP + ["Tap Create Your Drama", "Type an idea (e.g. A florist and a baker fight over the same corner stall)", "Tap Send",
             "Tap English", "Tap Yes, include captions", "Tap Generate", "Wait for the Story Outline card"]
CAST = APP + ["Tap History", "Tap a drama at 「Choose your characters」"]
SET = APP + ["Tap History", "Tap a drama whose characters are all set (no storyboard yet)"]
CMC = CAST + ["Tap a character slot", "Tap Create my character", "Type a description (e.g. Woman with a short bob and round glasses)",
              "Tap Female", "Tap White", "Type 28 in Age", "Tap Generate", "Wait for the generated character"]
SB = APP + ["Tap History", "Tap a drama at 「Ready to create the storyboard?」", "Read the balance on the credit pill",
            "Tap Generate on the Create storyboard card"]
VID = APP + ["Tap History", "Tap a drama at 「Choose your video settings」", "Tap Generate video"]
FULL = APP + ["Tap History", "Tap a drama with a finished full episode"]

E = [
 dict(iss="ISS-AMDA-01", title="Surprise me appends the same inspiration on every tap", cls="Functional", sev=3, owner="RD",
  cases=["TC-014"], rep=(2, 2),
  note="R-014 / R-287 (PM main flow; board notes l.96: Surprise me picks 1 of 10 strings at random and appends to the text). A2-a 17:24: five taps without clearing appended one line each (append rule OK, not a chip string), but all five were 「A strict teacher wakes up trapped inside the body of their worst student.」. A1 on the same build: the same one fixed pick per chat. The iOS tickets DRI261893-0124 (NAB) and DRI261895P0023 (Propose Won't Fix) are about iOS (replace vs append); no Android ticket.",
  short="Surprise me appends the same inspiration on every tap",
  steps=APP + ["Tap Create Your Drama", "Tap Surprise me", "Tap Surprise me", "Tap Surprise me", "Tap Surprise me", "Tap Surprise me"],
  res="Five Surprise me taps append the same inspiration five times instead of random picks.",
  res_zh="連按五次 Surprise me，五次都附加同一句靈感，而非隨機挑選。",
  exp="Each tap appends a random pick from the inspiration pool, so five taps are not all the same string.",
  exp_zh="每次點擊應從靈感池隨機挑一句附加，五次不應全部相同。",
  imgs=[("tc014-after5", "amda01_same_pick_x5")]),

 dict(iss="ISS-AMDA-02", title="First outline card is titled Story Outline Result", cls="UI", sev=3, owner="PM",
  cases=["TC-024"], rep=(2, 2),
  note="R-021 (PM main flow): the result card is 「Story Outline & Characters Result」. A2-a 17:24:40 (and A1): the first outline card header (text_mini_drama_outline_card_header) reads 「Story Outline Result」; body correct (Story Outline, six beats, Possible Characters, slot row). Later cards in the same chat after a character update are titled 「Story Outline & Characters Result」 (TC-349), so the build uses both names. Not DRA262610P0126 (outline editor, ProposeNAB).",
  short="First outline card is titled 「Story Outline Result」",
  steps=NEW,
  res="The first outline card header reads 「Story Outline Result」.",
  res_zh="第一張大綱卡標題為「Story Outline Result」。",
  exp="The header reads 「Story Outline & Characters Result」, as later cards in the same chat do.",
  exp_zh="標題應為「Story Outline & Characters Result」，與同一聊天後續卡片一致。",
  spec=["Spec string: 「Story Outline & Characters Result」"],
  rec=["[AI Recommendation]", "Story Outline & Characters Result"],
  imgs=[("tc024-top", "amda02_header")]),

 dict(iss="ISS-AMDA-03", title="Character filter lists Other twice under Gender", cls="UI", sev=2, owner="RD",
  cases=["TC-036", "TC-289"], rep=(2, 3),
  note="R-031 / R-040 (PM main flow; board notes l.100/l.102: Gender Female / Male / Others). A2-b 17:29 and A2-c2 ~19:12: Gender shows 「Female」「Male」「Other」「Other」 (4th chip cut at the right edge, visible after scrolling the row). A1 at 16:35 on the same build showed Other once, so the list is built inconsistently (2 of 3 reads). Filtering itself works. Related, not duplicate: DRA262610-0020 (NewCreated) is the 「Others」 vs 「Other」 label.",
  short="Character filter lists 「Other」 twice under Gender",
  steps=CAST + ["Tap a character slot", "Tap the filter icon", "Swipe the Gender options left"],
  res="The Gender filter lists 「Female」「Male」「Other」「Other」: Other appears twice.",
  res_zh="角色篩選的性別選項出現兩個「Other」。",
  exp="Gender lists Female, Male and Others once each.",
  exp_zh="性別選項應各出現一次：Female、Male、Others。",
  spec=["Spec string: 「Female / Male / Others」"],
  imgs=[("tc036-gender-scrolled", "amda03_other_twice"), ("tc289-filter", "amda03_other_twice2")]),

 dict(iss="ISS-AMDA-04", title="Character filter has no White ethnicity", cls="Functional", sev=3, owner="RD",
  cases=["TC-289"], rep=(1, 1),
  note="R-154 (filter values match the attributes in the collection) and the PM main flow board notes l.100 (Ethnicity: Caucasian…). A2-c2 19:12: Ethnicity offers only 「East Asian」「African」「Hispanic」「Arab」, while Create my character offers White and four new Mine characters this segment are White, so they cannot be found under their own attribute (Southeast Asian / Mixed also absent). Male + Hispanic + My characters only worked for the one Hispanic look.",
  short="Character filter has no White ethnicity, so White characters cannot be filtered",
  steps=CAST + ["Tap a character slot", "Tap the filter icon", "Read the Ethnicity options"],
  res="The Ethnicity filter offers only East Asian, African, Hispanic and Arab; White is missing.",
  res_zh="族裔篩選只有 East Asian、African、Hispanic、Arab，缺少 White。",
  exp="The filter lists every ethnicity the library and Create my character use, including White.",
  exp_zh="篩選應列出角色庫與建立角色使用的所有族裔，包含 White。",
  links=[pm("pm-main-flow"), ds("ds-characters")],
  imgs=[("tc289-filter", "amda04_no_white"), ("tc289-result", "amda04_hispanic_ok")]),

 dict(iss="ISS-AMDA-05", title="Character generation is priced at 4 credits, not 6", cls="Functional", sev=3, owner="RD",
  cases=["TC-039", "TC-040", "TC-047"], rep=(3, 3),
  note="R-033 / R-040 (Design Finish your characters and Create my character frames: Generate all ◆6×n, Generate ◆6; Design outranks the PM's ◆7, user rule 2026-10-19). On 2610212 every character generation is ◆4: Finish your characters 3 unset → 「Generate all ◆12」, 1 unset → 「Generate ◆4」, Create my character → 「Generate ◆4」 (also A1). What is charged matches the shown ◆4 (Text to Image −3 + Text to Speech −1). Related, not duplicate: DRA262610P0113 (credit usage info on the sheet).",
  short="Character generation is priced at 4 credits instead of 6",
  steps=CAST + ["Tap the first character's slot", "Tap ✓ without setting the other characters", "Read the Generate all button"],
  res="Finish your characters prices 3 characters at ◆12 and one at ◆4; Create my character shows Generate ◆4.",
  res_zh="角色生成每位只標價 4 點（三位 ◆12、一位 ◆4），建立角色也顯示 ◆4。",
  exp="One character generation costs ◆6: Generate all ◆6 per character, Generate ◆6 on both sheets.",
  exp_zh="每位角色生成應為 6 點：Generate all 每位 ◆6，Generate ◆6。",
  imgs=[("tc039-sheet", "amda05_generate_all_12"), ("tc040-sheet", "amda05_generate_4"), ("tc047-form", "amda05_cmc_4")]),

 dict(iss="ISS-AMDA-06", title="Finish your characters plural subtitle differs from the spec", cls="UI", sev=4, owner="Doc",
  cases=["TC-039"], rep=(2, 2),
  note="R-033 (Design: 「{n} characters aren't set yet」 / 「Add a look to continue.」). A2-b 17:33 and A1 16:37: with 3 unset the subtitle reads 「Each one needs a look before you can continue.」 (neither the Design nor the PM wording 「They need a look before you can continue.」); the singular sheet uses the Design copy 「Add a look to continue.」 (TC-040).",
  short="Finish your characters plural subtitle differs from 「Add a look to continue.」",
  steps=CAST + ["Tap the first character's slot", "Tap ✓ without setting the other characters"],
  res="With 3 unset characters the subtitle reads 「Each one needs a look before you can continue.」",
  res_zh="多位未設定時副標為「Each one needs a look before you can continue.」。",
  exp="The subtitle reads 「Add a look to continue.」, as the one-character sheet already does.",
  exp_zh="副標應為「Add a look to continue.」，與單一角色時一致。",
  spec=["Spec string: 「Add a look to continue.」"],
  rec=["[AI Recommendation]", "3 characters aren't set yet", "Add a look to continue."],
  imgs=[("tc039-sheet", "amda06_subtitle")]),

 dict(iss="ISS-AMDA-07", title="Update characters card shows no character count", cls="UI", sev=3, owner="RD",
  cases=["TC-045", "TC-350"], rep=(3, 3),
  note="R-038 / R-254 (PM update board 7, 10/16; board notes l.301–304: 「Update characters • {n} character(s) • ◆{credits} • Generate」). A2-b 18:00 (one character, ◆4) and 18:10 (two, ◆8): the card shows 「Update characters」/「Credits will be consumed for this task.」, the price and Generate, no count. The prices are right (one character ◆4, two ◆8). The storyboard-claim message before it is DRA262610P0174 (existing Android ticket).",
  short="Update characters card shows no character count",
  steps=SET + ["Type Make Maya Lin a woman in her 40s", "Tap Send", "Wait for the Update characters card"],
  res="The card shows only 「Update characters」, the price and Generate; 「• 1 character」 (or 2) is missing.",
  res_zh="更新角色卡只顯示標題、價格與 Generate，缺少「• 1 character」角色數。",
  exp="The card reads 「Update characters • 1 character • ◆4 • Generate」 (「• 2 characters」 for two).",
  exp_zh="卡片應顯示角色數，例如「• 1 character」或「• 2 characters」。",
  spec=["Spec string: 「Update characters • N character(s) • ◆credits • Generate」"],
  imgs=[("tc045-card", "amda07_one_character"), ("tc350-card", "amda07_two_characters")]),

 dict(iss="ISS-AMDA-08", title="Closing the ready sheet with X still applies the looks and commits the cast", cls="Functional", sev=3, owner="RD",
  cases=["TC-121", "O-1"], rep=(2, 2),
  note="R-106 (Design flow arrow 2811-90144: X on Finish your characters closes back to Choose Character and the generated looks are not applied). TC-121 (The Final Reel, 17:45): 「Your characters are ready」 › X → Leo's slot keeps the new look; Choose Character X › 「Leave without finishing?」/「…your picks won't be saved.」 › Leave → the chat had already committed the whole cast and moved on (「The characters look great! Ready to create the storyboard?」 + Create storyboard ◆31). O-1 (Corner Stall Rivalry, 17:36): after Leave anyway and Choose Character X › Leave the picks were saved anyway and no Characters Result card was posted (also after reopening). Charged 4 for the look (TC-121), as expected.",
  short="X on 「Your characters are ready」 still applies the looks and commits the cast",
  steps=CAST + ["Pick looks for all but one character", "Tap ✓", "Tap Generate", "Wait for 「Your characters are ready」", "Tap X on the sheet",
                "Tap X in Choose Character", "Tap Leave"],
  res="X keeps the new look in the slot, and after Leave the chat has already committed the whole cast.",
  res_zh="點 X 後新外觀仍套用到角色，離開後聊天已確認整組角色。",
  exp="X closes the sheet back to Choose Character without applying the generated looks; Leave saves no picks.",
  exp_zh="X 應回到選角畫面且不套用生成外觀；選擇 Leave 不應儲存選角。",
  imgs=[("tc121-ready", "amda08_ready"), ("tc121-after-x", "amda08_applied_after_x"), ("tc121-chat", "amda08_cast_committed"), ("tc403-chat-after", "amda08_o1_no_cast_card")]),

 dict(iss="ISS-AMDA-09", title="Leave anyway during character generation drops finished looks but keeps the charge", cls="Functional", sev=2, owner="RD",
  cases=["TC-337", "TC-403"], rep=(2, 2),
  note="R-247 (PM update board 9, 10/16: Leave anyway stops the unfinished character, keeps a finished one; no refund for the stopped one). TC-337 (The Final Reel, Generate all ◆12 17:39:51): all three images logged ok at 17:40:35–37 and the pill went 1311 → 1299, but the sheet kept 「Creating 3 characters…」; Cancel › 「Stop and lose your credits?」 › Leave anyway 17:41:30 → [TURN] cancel_turn, final_state=cancelled: all three slots back to unset, no look kept or added to the library. Credit Details 17:40: three Text to Image −3 and three Text to Speech −1 (−12), no refund row. TC-403 (Corner Stall Rivalry, ◆8): Leave anyway landed 1 s after the turn ended, so both looks were kept. The sheet shows 「Creating…」 ~50 s after the images are done, so a user cannot tell that they finished.",
  short="Leave anyway drops finished character looks but keeps their credits",
  steps=CAST + ["Read the balance on the credit pill", "Tap ✓ without setting any character", "Tap Generate all", "Wait 50 seconds", "Tap Cancel", "Tap Leave anyway",
                "Tap Back until the Launcher is shown", "Tap Mine", "Tap Credits", "Tap Details"],
  res="Leave anyway after all three images finished drops every look, yet −12 credits stay booked with no refund.",
  res_zh="三張角色圖皆已完成後選 Leave anyway，所有外觀被丟棄，卻仍扣 12 點且未退點。",
  exp="Leave anyway keeps the characters that finished and stops only unfinished ones.",
  exp_zh="Leave anyway 應保留已完成的角色，只停止未完成者。",
  spec=["Spec string: 「Stop and lose your credits?」 / 「This is still generating. If you leave now, it'll stop and the credits you've spent won't be refunded.」"],
  log=("Leave anyway during Generate all: images done and charged, turn cancelled, looks dropped", [
    ("TC-337 The Final Reel, Generate all ◆12, Leave anyway at 17:41:30", "2026-10-27", "17:39:50", "17:41:40"),
    ("TC-403 Corner Stall Rivalry, Generate all ◆8, Leave anyway at 17:36:14", "2026-10-27", "17:34:30", "17:36:20")]),
  imgs=[("tc337-sheet", "amda09_creating_after_done"), ("tc403-cancel-dialog", "amda09_stop_dialog"), ("tc337-after-leave", "amda09_all_unset"), ("tc337-credit-details", "amda09_ledger_12")]),

 dict(iss="ISS-AMDA-10", title="Asking to change a character: wrong question and a single chip", cls="UI", sev=3, owner="RD",
  cases=["TC-348"], rep=(1, 1),
  note="R-254 (PM update board 7, 10/16: 「Sure! Which character would you like to change?」 with 2–4 option chips). A2-b 18:03: Iris first says 「Updating character appearance to look older.」, then 「Which character would you like to make older?」 with ONE chip 「Leo Vance (currently 18)」 and 「More ideas」; the other two cast members appear only after More ideas. Related, not duplicate: DRA262610P0092 ([SPEC], TRCreated: AI prompts to modify characters in chat).",
  short="Asking to change a character shows a different question and a single chip",
  steps=SET + ["Type Can you change one of the characters to look older?", "Tap Send", "Wait for Iris's question"],
  res="Iris asks 「Which character would you like to make older?」 with one chip (Leo Vance) and More ideas.",
  res_zh="Iris 的提問文案與規格不同，且只提供一個角色選項。",
  exp="Iris asks 「Sure! Which character would you like to change?」 with 2–4 character chips.",
  exp_zh="應以規格文案詢問要改哪位角色，並提供 2–4 個選項。",
  spec=["Spec string: 「Sure! Which character would you like to change?」"],
  imgs=[("tc348-reply", "amda10_one_chip"), ("tc348-more", "amda10_more_ideas")]),

 dict(iss="ISS-AMDA-11", title="A typed character name does not lead to the Update characters card", cls="Functional", sev=2, owner="RD",
  cases=["TC-391"], rep=(1, 1),
  note="R-301 (PM update board 7, 10/16: a typed answer is taken like a chip and the 「Update characters」 card is offered). A2-b 18:03:51: typed 「Walter Grant」 after the question (ISS-AMDA-10): the chips and the question bubble disappeared, and Iris replied 「Retained Walter Grant and the full cast details in accordance with your target selection.」 + 「The characters look great! Ready to create the storyboard?」 with a 「Create storyboard →」 chip; no Update characters card, look unchanged, nothing charged.",
  short="A typed character name does not lead to the Update characters card",
  steps=SET + ["Type Can you change one of the characters to look older?", "Tap Send", "Wait for Iris's question", "Type Walter Grant", "Tap Send"],
  res="Iris replies 「Retained Walter Grant…」 and offers Create storyboard; no Update characters card appears.",
  res_zh="輸入角色名後 Iris 回覆保留角色並提供建立分鏡，未出現更新角色卡。",
  exp="A typed name is taken like a chip: Iris offers the 「Update characters」 card for that character.",
  exp_zh="輸入角色名應等同點選選項，出現該角色的「Update characters」卡。",
  imgs=[("tc391-reply", "amda11_no_update_card")]),

 dict(iss="ISS-AMDA-12", title="Character update flow shows other messages than the spec", cls="UI", sev=3, owner="RD",
  cases=["TC-349", "TC-352"], rep=(2, 2),
  note="R-254 / R-301 (PM update board 7, 10/16: Generate → card disappears, 「Working on it...」; done: 「Here's your updated cast.」 + new Story Outline & Characters card + 「Your characters' looks are updated! Ready to create the storyboard?」). A2-b 18:01 (Bitter Cold): the card stays, 「Thinking…」 then 「Updating character configuration.」, then the new card and 「The characters look great! Ready to create the storyboard?」; no 「Here's your updated cast.」. After a storyboard (18:20) the closing reads 「Characters updated! Regenerate the storyboard to match?」. Charged once, ◆4 (correct). Related, not duplicate: DRA262610P0088 / DRA262610-0053 (stuck update, TRCreated).",
  short="Character update shows other progress and result messages than the spec",
  steps=SET + ["Type Make Maya Lin a woman in her 40s", "Tap Send", "Tap Generate on the Update characters card", "Wait for the new Story Outline & Characters card"],
  res="Iris shows 「Updating character configuration.」 and never 「Here's your updated cast.」",
  res_zh="更新角色的進度與完成訊息與規格不同，未出現更新完成文案。",
  exp="「Working on it...」 while updating, then 「Here's your updated cast.」 and the spec closing line.",
  exp_zh="更新中應顯示「Working on it...」，完成後顯示規格的完成訊息。",
  spec=["Spec string: 「Working on it...」 / 「Here's your updated cast.」 / 「Your characters' looks are updated! Ready to create the storyboard?」"],
  imgs=[("tc349-working", "amda12_updating"), ("tc349-done", "amda12_done"), ("tc352-done", "amda12_after_storyboard")]),

 dict(iss="ISS-AMDA-13", title="Back during a chat character update leaves with no dialog", cls="Functional", sev=2, owner="RD",
  cases=["TC-351"], rep=(1, 1),
  note="R-254 (PM update board 7, 10/16: while the update generates, Back asks 「Stop and lose your credits?」 with Leave anyway / Keep Generating). A2-b 18:01:14 (Bitter Cold, Update characters ◆4, 3 s after Generate): system Back left to the AI Mini Drama landing page at once with no dialog; the update ran on and was charged 4 (TC-349). Android Back is a spec exit path.",
  short="Back during a chat character update leaves with no stop dialog",
  steps=SET + ["Type Make Maya Lin a woman in her 40s", "Tap Send", "Tap Generate on the Update characters card", "Press the system Back button"],
  res="System Back right after Generate leaves to the landing page with no dialog; the update runs on and is charged.",
  res_zh="更新角色生成中按系統返回直接離開，沒有確認對話框，更新仍繼續並扣點。",
  exp="Back asks 「Stop and lose your credits?」 with Leave anyway and Keep Generating.",
  exp_zh="返回應先顯示停止確認對話框（Leave anyway / Keep Generating）。",
  spec=["Spec string: 「Stop and lose your credits?」"],
  log=("Back 3 s after Generate on Update characters: the turn runs on and is charged", [
    ("TC-351 Bitter Cold, Generate 18:01:11, system Back 18:01:14", "2026-10-27", "18:01:05", "18:01:50")]),
  imgs=[("tc349-working", "amda13_generating"), ("tc351-dialog", "amda13_left_no_dialog")]),

 dict(iss="ISS-AMDA-14", title="Tapping outside the generating Create my character sheet does nothing", cls="Functional", sev=4, owner="RD",
  cases=["TC-383"], rep=(2, 2),
  note="R-291 (PM main flow; REQ-032): while Create my character generates, a tap outside the sheet asks 「Stop and lose your credits?」 as X does. A2-c2 18:57:31 and ~18:57:35: two taps on the dimmed area above the sheet did nothing; X and system Back do show the dialog (TC-431). The generation finished normally.",
  short="Tapping outside the generating Create my character sheet does not ask to stop",
  steps=CMC[:-1] + ["Tap the dimmed area above the sheet"],
  res="Tapping outside the generating sheet does nothing; only X and Back show 「Stop and lose your credits?」.",
  res_zh="角色生成中點擊面板外區域無反應，只有 X 與返回會詢問。",
  exp="A tap outside the sheet asks 「Stop and lose your credits?」, as X does.",
  exp_zh="點擊面板外應與 X 相同，顯示「Stop and lose your credits?」。",
  imgs=[("tc383-outside", "amda14_outside_tap")]),

 dict(iss="ISS-AMDA-15", title="Expanded description editor cuts the text to 1,000 characters", cls="Functional", sev=2, owner="RD",
  cases=["TC-051"], rep=(3, 3),
  note="R-043 (Design 1005_Update 「Exceed word limit」, newer than PM §13.11: over-limit text is kept, counter red, Generate disabled). A2-c1 18:41: 1,050 characters (entered with setval; clipboard paste cannot be driven) are kept in the field with red 「1050/1000」, 「You've reached the 1,000-character limit.」 and Generate grey. Opening the expanded editor shows 「1000/1000」 and only the first 1,000 characters; collapsing writes the cut text back (field 1000/1000, the end 「END」 gone). Repeated 3 times.",
  short="Expanded description editor cuts text to 1,000 characters and writes it back",
  steps=CAST + ["Tap a character slot", "Tap Create my character", "Paste a 1,050-character description", "Tap the description", "Tap the collapse icon"],
  res="The expanded editor shows 1000/1000 and collapsing writes the cut text back: the last 50 characters are lost.",
  res_zh="展開編輯器只顯示前 1,000 字，收合後寫回截斷文字，最後 50 字遺失。",
  exp="All 1,050 characters stay, with red 「1050/1000」 and the limit message in the field and the editor.",
  exp_zh="1,050 字應完整保留，欄位與編輯器皆顯示紅色 1050/1000 與上限提示。",
  spec=["Spec string: 「You've reached the 1,000-character limit.」"],
  imgs=[("tc051-1050", "amda15_field_1050"), ("tc125-drag", "amda15_editor_1000"), ("tc051-after-editor", "amda15_written_back")]),

 dict(iss="ISS-AMDA-16", title="Dragging inside the description box opens the editor instead of scrolling", cls="Functional", sev=2, owner="RD",
  cases=["TC-125"], rep=(3, 3),
  note="R-110 (Design flow arrow 2811-90468: the text scrolls within its own area). A2-c1 18:41: with 1,050 characters (more than the ~4 visible lines), three drags of different speed inside the box all opened the full-screen editor, as a tap does (and that editor then cuts the text, ISS-AMDA-15). The text cannot be scrolled in place.",
  short="Dragging inside the description box opens the editor instead of scrolling the text",
  steps=CAST + ["Tap a character slot", "Tap Create my character", "Type a description longer than four lines", "Drag up inside the description box"],
  res="Every drag inside the description box opens the full-screen editor; the text never scrolls in place.",
  res_zh="在描述框內拖曳都會開啟全螢幕編輯器，文字無法在框內捲動。",
  exp="Dragging scrolls the text within the box; nothing else opens.",
  exp_zh="在描述框內拖曳應捲動框內文字，不開啟其他畫面。",
  imgs=[("tc125-before", "amda16_long_text"), ("tc125-drag2", "amda16_drag_opens_editor")]),

 dict(iss="ISS-AMDA-17", title="Closing a generated character saves it to Mine anyway", cls="Functional", sev=3, owner="RD",
  cases=["TC-057", "TC-134", "TC-339", "TC-342", "TC-401"], rep=(5, 5),
  note="R-248 (PM update board 11 §13.23, 10/21: only 「Save to library」 saves a generated character; a discarded result is not in Mine) and R-293. A2-c1/c2 18:47–19:05: X, swipe down and system Back each close the result at once and the slot is not changed — but every closed look shows up as the first 「Mine」 card in the library (TC-057 glasses / cream cardigan; TC-134 / TC-342 / TC-401 Daniel Reed looks; TC-339 the bob with mustard cardigan). Each cost ◆4 as expected. The missing 「Discard this character?」 dialog is DRA262610P0262 (NeedCodeReview, X only; also seen for swipe down and Back) — an existing Android ticket, not refiled; this entry is the saving.",
  short="Closing a generated character with X, swipe down or Back saves it to Mine anyway",
  steps=CMC + ["Tap X", "Scroll the library to the first card"],
  res="After X, swipe down or Back on the result, the unsaved look is the first 「Mine」 card in the library.",
  res_zh="以 X、下滑或返回關閉生成結果後，未儲存的外觀仍出現在 Mine 第一張。",
  exp="A closed (discarded) result is not saved; only 「Save to library」 adds it to Mine.",
  exp_zh="關閉（捨棄）的結果不應儲存，只有「Save to library」才加入 Mine。",
  imgs=[("tc048-result", "amda17_result"), ("tc058-library", "amda17_saved_after_x"), ("tc342-after", "amda17_saved_after_swipe"), ("tc401-after", "amda17_saved_after_back")]),

 dict(iss="ISS-AMDA-18", title="Generated character page has no Discard button", cls="UI", sev=3, owner="RD",
  cases=["TC-341"], rep=(3, 3),
  note="R-248 (PM update board 11 §13.23, 10/21: the result page has 「Discard」, which closes at once with no dialog, nothing saved or applied). Every generated character result in A2-c1/c2 (18:47, 18:58, 19:02, 19:03) has only X (top left), Download and 「Save to library」.",
  short="Generated character page has no Discard button",
  steps=CMC,
  res="The generated character page has only X, Download and 「Save to library」; there is no 「Discard」 button.",
  res_zh="角色生成結果頁只有 X、下載與「Save to library」，沒有「Discard」按鈕。",
  exp="The page offers 「Discard」, which closes it at once without saving or applying the look.",
  exp_zh="結果頁應提供「Discard」，點擊後直接關閉，不儲存也不套用。",
  imgs=[("tc132-result", "amda18_no_discard")]),

 dict(iss="ISS-AMDA-19", title="Delete character dialog body differs from the spec", cls="UI", sev=3, owner="RD",
  cases=["TC-058"], rep=(1, 1),
  note="R-049 (PM main flow: 「Delete this character?」 / 「This character will be permanently deleted and can't be recovered.」, Cancel / Delete). A2-c1 18:48: title and buttons match; the body reads 「This character and its images will be deleted and can't be recovered. Projects already using it are not affected.」 (Cancel tapped, nothing deleted). Related, not duplicate: DRA262610P0130 (no edit / version actions).",
  short="Delete character dialog body differs from the spec text",
  steps=CAST + ["Tap a character slot", "Tap a Mine character", "Tap ⋮", "Tap Delete"],
  res="The body reads 「This character and its images will be deleted and can't be recovered. Projects already…」",
  res_zh="刪除角色對話框內文與規格不同，多了圖片與專案的說明。",
  exp="The body reads 「This character will be permanently deleted and can't be recovered.」",
  exp_zh="內文應與規格一致：角色將永久刪除且無法復原。",
  spec=["Spec string: 「This character will be permanently deleted and can't be recovered.」"],
  rec=["[AI Recommendation]", "Title: Delete this character?", "Body: This character will be permanently deleted and can't be recovered.", "Buttons: Cancel / Delete"],
  imgs=[("tc058-dialog", "amda19_body")]),

 dict(iss="ISS-AMDA-20", title="Storyboard and video jobs skip the 10/22 stage messages and charge per image", cls="Functional", sev=3, owner="RD",
  cases=["TC-377", "TC-405"], rep=(3, 3),
  note="R-279 / R-317 / R-320 / R-316 (PM Figma 10/22 §13.24, node 4422:2, RD to confirm per PM Open questions #20). Storyboard (A2-d1 19:21:37, Quiet Sanctuary ◆31): no 「I'll create a storyboard - give me a moment...」; the skeleton reads 「Thinking…」 (stage ①, pill unchanged — correct) then 「Creating your scene…」 (not 「Preparing your scenes…」 / 「Creating your storyboard…」); the pill drops 3 per image (1209, 1206 … 1181) and Credit Details books 10 Text to Image −3 + 1 Text to Speech −1 rather than one charge. Video (A2-g1 21:56:44, Workplace Romance (2)): 「Thinking…」 then 「Configuring video settings and generating video.」 (not 「I'll create a video - give me a moment...」 / 「Advancing the mini drama production.」), no 「Making your video…」 at the charge. Existing Android tickets, not this entry: the 「Create storyboard」 user bubble (DRA262610P0122 / P0197), the blank 「Here's your drama.」 card (DRA262610P0226), the 3-credit image rate (DRA262610P0198).",
  short="Storyboard and video generation skip the 10/22 stage messages and charge per image",
  steps=SB + ["Watch the chat and the credit pill until the storyboard is shown"],
  res="No 「I'll create a storyboard…」; the card reads 「Thinking…」 then 「Creating your scene…」; the pill drops per image.",
  res_zh="分鏡生成未顯示 10/22 規格的兩階段訊息，點數逐張扣除。",
  exp="「I'll create a storyboard - give me a moment...」, 「Preparing your scenes…」, 「Creating your storyboard…」.",
  exp_zh="應依 10/22 規格顯示兩階段訊息，於「Creating your storyboard…」時一次扣點。",
  spec=["Spec string: 「Preparing your scenes…」 / 「Creating your storyboard…」 / 「Advancing the mini drama production.」 / 「Making your video…」"],
  imgs=[("tc377-after-generate", "amda20_thinking"), ("tc063-reopen", "amda20_creating_scene"), ("tc081-after-generate", "amda20_video_stage1"), ("tc405-stage2", "amda20_video_stage2")]),

 dict(iss="ISS-AMDA-21", title="Stop button stays in the input bar after Generate", cls="Functional", sev=3, owner="RD",
  cases=["TC-512", "TC-157"], rep=(4, 4),
  note="R-315 (PM Figma 10/22 §13.24, node 4422:2: 「有 Generate 的都不提供暫停」 — after any Generate the input bar shows only the mic; the RD build's ■ stop is to be removed; RD to confirm). A2-d1 19:21:38 / 19:22:08 / 19:24:31: a blue ■ stop button beside the mic during 「Thinking…」 and 「Creating your scene…」; also during video generation (A2-g1 TC-405) and the outline Generate (A2-h TC-153). Retest A2-r1 (TC-157, R-138, 10/28 12:33:19, Storm Warning Fast preview): the ■ is there in video stage ① too; a tap ends the video turn at once with no warning or message (logcat 「MyCreation cancel … calls=0」, 「turn_complete: final_state=cancelled」) and the chat shows the video settings card again; once the video is charged the ■ is gone. Nothing charged (18445 before and after). With the 10/22 rule (no stop control) the silent cancel goes away with the button. Existing Android tickets: tapping it cancels with no note (DRA262610-0049 outline, DRA262610-0057 storyboard, DRA262610P0213); typing keeps it as Stop (DRA262610P0211).",
  short="Stop button stays in the input bar after Generate (10/22: only the mic)",
  steps=SB + ["Look at the input bar"],
  res="A blue ■ stop button sits beside the mic during storyboard and video jobs; a tap cancels a video with no warning.",
  res_zh="分鏡準備與生成期間，輸入列麥克風旁仍顯示藍色 ■ 停止鈕；影片準備時亦同，點擊即無警告取消影片。",
  exp="After Generate the input bar shows only the mic, with no stop or pause control.",
  exp_zh="依 10/22 規格，Generate 後輸入列只顯示麥克風，不提供停止。",
  imgs=[("tc377-after-generate", "amda21_stop_stage1"), ("tc063-reopen", "amda21_stop_stage2"), ("tc157-before", "amda21_video_stop"), ("tc157-after-stop", "amda21_video_cancelled")]),

 dict(iss="ISS-AMDA-22", title="Video stage ①: every exit leaves with no Leave while we're preparing? dialog", cls="Functional", sev=3, owner="RD",
  cases=["TC-515", "TC-516"], rep=(4, 4),
  note="R-318 / R-319 (PM Figma 10/22 §13.24, node 4422:2; RD to confirm): in stage ① every exit asks 「Leave while we're preparing?」 / 「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」 with Leave anyway (red) / Stay. A2-g1 Workplace Romance (2), before the charge (pill 679): ← 21:56:45, system Back 21:57:28, History 21:57:43 and New chat 21:57:54 each left at once with no dialog; the job kept running and was charged once later (21:59:08, 2 × 60). The storyboard counterpart is DRA262610P0077 (Assigned).",
  short="Video stage ①: exits leave with no 「Leave while we're preparing?」 dialog",
  steps=VID + ["Tap ← within 3 seconds"],
  res="←, system Back, History and New chat in stage ① leave at once with no dialog; the video job keeps running.",
  res_zh="影片準備階段按返回、歷史或新聊天皆直接離開，無確認對話框。",
  exp="Each exit asks 「Leave while we're preparing?」 with the video body, 「Leave anyway」 (red) and 「Stay」.",
  exp_zh="每個離開入口應顯示準備中離開確認（Leave anyway / Stay）。",
  spec=["Spec string: 「Leave while we're preparing?」 / 「Your video will start soon. If you leave now, we'll have to prepare it again when you come back.」"],
  imgs=[("tc515-back1", "amda22_back"), ("tc516-sysback", "amda22_system_back"), ("tc516-history", "amda22_history"), ("tc516-newchat", "amda22_new_chat")]),

 dict(iss="ISS-AMDA-23", title="Storyboard stage ②: Back still asks Stop and lose your credits?", cls="Functional", sev=3, owner="RD",
  cases=["TC-513"], rep=(1, 1),
  note="R-320 / R-321 (PM Figma 10/22 §13.24, node 4422:2; RD to confirm per PM Open questions #20): leaving in stage ② shows no dialog, only the toast 「We'll keep making your storyboard. Find it in History.」, and the job finishes. A2-d1 19:22:25 (Quiet Sanctuary, 「Creating your scene…」, charging): ← showed 「Stop and lose your credits?」 with Leave anyway / Keep Generating; Keep Generating finished it, charged once (31). Leave anyway was not tapped (it would forfeit credits).",
  short="Storyboard stage ②: Back still asks 「Stop and lose your credits?」",
  steps=SB + ["Wait for 「Creating your scene…」", "Tap ←"],
  res="In stage ② ← shows 「Stop and lose your credits?」 with Leave anyway and Keep Generating.",
  res_zh="分鏡生成第二階段按返回仍顯示「Stop and lose your credits?」。",
  exp="No dialog: the toast 「We'll keep making your storyboard. Find it in History.」 shows and the job finishes.",
  exp_zh="依 10/22 規格不顯示對話框，只顯示提示並在背景完成分鏡。",
  spec=["Spec string: 「We'll keep making your storyboard. Find it in History.」"],
  imgs=[("tc513-back", "amda23_stop_dialog")]),

 dict(iss="ISS-AMDA-24", title="Storyboard stops when the app is swiped away and resumes only on reopen", cls="Functional", sev=3, owner="RD",
  cases=["TC-514"], rep=(1, 1),
  note="R-321 (PM Figma 10/22 §13.24, node 4422:2: the job finishes even if the app is swiped away). A2-d1 Quiet Sanctuary: stage ② with 2 of 10 images charged (pill 1206), PowerDirector swiped away in Recents 19:22:51 (not running), relaunched after 60 s and the drama reopened at 19:24:14: the card showed 「Thinking…」 again; logcat 「[SYS] pending_resume detected, resuming turn」 at 19:24:14; the remaining images were dispatched only after reopening; done 19:26:27 (138 s later). Charged once (31) — correct. The characters-stage reply vanished after the resume (O-10, ISS-AMDA-29).",
  short="Storyboard stops when the app is swiped away and resumes only on reopen",
  steps=SB + ["Wait for 「Creating your scene…」", "Open Recents", "Swipe PowerDirector away", "Wait 60 seconds", "Launch the APP",
              "Tap AI Mini Drama on the Launcher", "Tap History", "Tap the drama"],
  res="The storyboard did not continue: the card shows 「Thinking…」 again and the remaining images start only after reopening.",
  res_zh="滑掉 App 後分鏡未在背景完成，重新開啟才繼續生成。",
  exp="The storyboard finishes in the background; Storyboard Result and Preview are there on return, charged once.",
  exp_zh="分鏡應在背景完成，回來時已有分鏡結果與預覽，只扣一次點數。",
  log=("App swiped away mid-storyboard: turn resumed only on reopen", [
    ("TC-514 Quiet Sanctuary: swiped away 19:22:51, reopened 19:24:14", "2026-10-27", "19:22:40", "19:26:30", r"\[SYS\]")]),
  imgs=[("tc514-recents", "amda24_recents"), ("tc514-reopen", "amda24_thinking_again")]),

 dict(iss="ISS-AMDA-25", title="First storyboard shows one skeleton row instead of per-scene skeletons", cls="UI", sev=3, owner="RD",
  cases=["TC-389"], rep=(2, 2),
  note="R-299 (PM update board 6, 10/14: each scene shows a skeleton, the Location thumbnail fills before the main image, the main image keeps its width). A2-d1 Quiet Sanctuary 19:21–19:26 and Workplace Romance (2) 19:36–19:40: only one skeleton row (「Thinking…」 / 「Creating your scene…」 / 「Generating storyboard.」) until every image is done, so no scene, Location thumbnail or early location image is ever shown. The scene-update case (no skeleton on the changed scene) is DRA262610P0134 (existing Android ticket).",
  short="First storyboard shows one skeleton row instead of per-scene skeletons",
  steps=SB + ["Watch the storyboard area until it finishes"],
  res="The first storyboard shows one skeleton row until every image is done; no scene or Location thumbnail appears early.",
  res_zh="首次分鏡生成只顯示一列骨架，直到全部完成才出現場景與地點縮圖。",
  exp="Each scene shows its skeleton, then its Location image before the main image; the main image keeps its width.",
  exp_zh="每個場景應有骨架，地點縮圖先於主圖出現，主圖寬度不變。",
  imgs=[("tc377-after-generate", "amda25_single_row"), ("tc389-during", "amda25_update_no_skeleton")]),

 dict(iss="ISS-AMDA-26", title="Storyboard Preview is not rebuilt after a scene image update", cls="Functional", sev=3, owner="RD",
  cases=["TC-074"], rep=(1, 1),
  note="R-063 (PM update board 5: after an image update the preview reflects it; the log shows a new TextToSpeech call). A2-d1 Quiet Sanctuary Scene 2 update 19:48:39–19:49:24: the workflow ran prompt_1 › img_1 › final only, no preview_tts / TextToSpeech (the first storyboard ran preview_tts at 19:26:07); the Storyboard Preview card is unchanged (0:45, Scene 1 thumbnail). The image itself also did not change (DRA262610P0199), so the preview could not show an update either way.",
  short="Storyboard Preview is not rebuilt after a scene image update",
  steps=APP + ["Tap History", "Tap a drama with a finished storyboard", "Type Update the image for Scene 2 to show rain", "Tap Send",
               "Tap Generate on the Create storyboard card", "Wait for the update to finish", "Play the Storyboard Preview"],
  res="After a scene image update no TextToSpeech / preview step runs and the Storyboard Preview is unchanged.",
  res_zh="場景圖片更新後未重新產生語音與預覽，分鏡預覽沒有變化。",
  exp="The Storyboard Preview is rebuilt (new TTS / animatic) with the updated image.",
  exp_zh="場景圖片更新後應重建分鏡預覽（重新產生語音與動態預覽）。",
  log=("Scene image update runs no preview_tts step", [
    ("First storyboard, Quiet Sanctuary: preview_tts runs", "2026-10-27", "19:25:55", "19:26:30", r"preview_tts"),
    ("Scene 2 image update: prompt_1, img_1, final only", "2026-10-27", "19:48:35", "19:49:30", r'"step":"(prompt_1|img_1|final|preview_tts)"')]),
  imgs=[("tc073-bottom", "amda26_preview_unchanged")]),

 dict(iss="ISS-AMDA-27", title="Saved dramas reopen at the outline instead of their latest stage", cls="Functional", sev=3, owner="RD",
  cases=["TC-113"], rep=(2, 3),
  note="R-098 (Design Recent Task: each drama reopens at its latest stage). A2-e 21:2x: Bitter Cold (storyboard + 「Characters updated!…」 ◆19 card) and Quiet Sanctuary (video + full episode, 「Create Next Episode」) open at the top of the outline / Characters Result with ↓ shown; their storyboard / video stage is reached only with ↓. Corporate rivals (storyboard + video settings) opens at the bottom, as expected. iOS lead DRI261896P0032 (iOS, closed) reproduces on Android. The lost cast / characters card is ISS-AMDA-28.",
  short="Storyboard and video dramas reopen at the outline, not their latest stage",
  steps=APP + ["Tap History", "Tap a drama with a finished video"],
  res="Storyboard- and video-stage dramas reopen at the top of the outline with ↓ shown, not at their latest stage.",
  res_zh="已有分鏡或影片的劇從歷史開啟時停在大綱頂部，而非最新階段。",
  exp="Each drama reopens at its latest stage (the storyboard or the video), at the bottom of the chat.",
  exp_zh="每部劇應開啟在最新階段（分鏡或影片），即聊天底部。",
  imgs=[("tc113-bittercold-open", "amda27_storyboard_drama"), ("tc113-quiet-sanctuary", "amda27_video_drama")]),

 dict(iss="ISS-AMDA-28", title="Reopened dramas lose their confirmed cast and characters card", cls="Functional", sev=2, owner="RD",
  cases=["TC-113", "O-8"], rep=(4, 4),
  note="R-098 (Design Recent Task: reopens at its latest stage) and R-139 (nothing saved is lost without notice). O-8 (A2-d1 19:44–19:45): The Final Reel (cast set, Create storyboard ◆31 offered) and Corner Stall Rivalry (cast set, ◆25 offered) reopen ending in 「Ready to create your characters?」/「Choose your characters」 with every slot empty and no storyboard card. TC-113 (A2-e): Corner Stall Rivalry again with every slot empty; Quiet Hours (outline + 「Choose your characters」, slots unset) reopens with only the Story Outline card — the characters card is gone, so the drama cannot continue from the chat. Looks were paid for (Corner Stall: ◆8).",
  short="Reopened dramas lose the confirmed cast and the characters card",
  steps=APP + ["Tap History", "Tap a drama whose cast was confirmed but has no storyboard yet"],
  res="Reopened dramas show every character slot empty and no storyboard offer; one loses the Choose your characters card.",
  res_zh="從歷史重開劇時已確認的角色全部清空、建立分鏡卡消失，甚至選角卡不見。",
  exp="A reopened drama keeps its confirmed cast and its last card, so the user continues where they left.",
  exp_zh="重開劇應保留已確認的角色與最後一張卡片，可從原處繼續。",
  imgs=[("tc359-finalreel", "amda28_final_reel_empty"), ("tc113-corner", "amda28_corner_stall_empty"), ("tc113-quiethours", "amda28_quiet_hours_no_card")]),

 dict(iss="ISS-AMDA-29", title="Chat loses earlier messages after reopen, Stop or resume", cls="Functional", sev=3, owner="RD",
  cases=["TC-160", "TC-162", "TC-155", "O-10", "O-20"], rep=(5, 5),
  note="R-139 (leaving and returning keeps the task; nothing saved is lost without notice). TC-160 (A2-h 01:12, Storm Warning): reopened from History the chat starts at 「Story Outline Result」; the idea bubble, the format answer bubble and Iris's closing line are gone. TC-162 (01:27): after the characters, Iris's replies and two user bubbles are gone. TC-155 (01:14:42): Stop on a revision removed the 「Ready to create your characters?」 card above it (not in the page source). O-10 (A2-d1): after a resumed storyboard the characters-stage reply is gone. O-20 (A2-g3 00:27, Boardroom Rivals): the thread restarts at 「Story Outline & Characters Result」 and the template opening, earlier user bubbles and earlier video cards (preview, full episode, scene 2 regeneration) are gone. The Stop-without-notice part of TC-155 is DRA262610-0049 (existing Android ticket).",
  short="Chat loses earlier messages and cards after a reopen, a Stop or a resume",
  steps=APP + ["Tap History", "Tap a drama with several chat turns", "Scroll to the top", "Tap ←", "Tap History", "Tap the same drama", "Scroll to the top"],
  res="The reopened chat starts at the Story Outline card: the idea, format answers, earlier user bubbles and replies are gone.",
  res_zh="重新開啟後聊天從大綱卡開始，先前的點子、格式回覆、使用者訊息與回覆都消失。",
  exp="A reopened chat shows every earlier message and card; nothing is removed without notice.",
  exp_zh="重新開啟的聊天應保留所有先前訊息與卡片，不應無提示地消失。",
  links=[ds("ds-recent-task"), pm("pm-main-flow")],
  imgs=[("tc169-done", "amda29_before_leaving"), ("tc160-top", "amda29_after_reopen_top"), ("tc162-reopen", "amda29_characters_stage"), ("tc155-stop2", "amda29_card_gone_after_stop")]),

 dict(iss="ISS-AMDA-30", title="Scroll-to-bottom button sits at the bottom centre", cls="UI", sev=3, owner="RD",
  cases=["TC-374"], rep=(1, 1),
  note="R-274 (Design main flow, REQ-032: ↓ at the bottom right while scrolled up). A2-e El compás del regreso: button_mini_drama_scroll_bottom at 494,2071 (92×92 px), centre x 540 of 1080 — the bottom centre. Tapping it scrolled to the newest message and hid it (correct). iOS P9 shows it bottom right.",
  short="Scroll-to-bottom button sits at the bottom centre instead of the bottom right",
  steps=APP + ["Tap History", "Tap a drama with a finished storyboard", "Scroll up two screens"],
  res="The ↓ button shows at the bottom centre of the chat.",
  res_zh="↓ 按鈕顯示在聊天底部中央。",
  exp="↓ shows at the bottom right of the chat, as in the Design main flow.",
  exp_zh="↓ 按鈕應位於右下角，與設計稿一致。",
  imgs=[("tc374-up", "amda30_centre")]),

 dict(iss="ISS-AMDA-31", title="Sent message is not moved to the top; the view follows the reply", cls="Functional", sev=3, owner="RD",
  cases=["TC-344"], rep=(1, 1),
  note="R-250 (PM 1002 update §13.2, 10/20: the sent message moves to the top; the reply generates below without the view following; ↓ appears when it runs past the screen). A2-e El compás del regreso: 1 s after Send the bubble sits mid-screen (y≈1,350–1,560 of 2,520) with 「Thinking…」 below; when the reply and card land (23 s) the view follows them to the bottom and no ↓ appears. Related: DRA262610P0125 (Assigned) asks the opposite (auto-scroll to the newest message, an older rule); PM 10/20 §13.2 is newer.",
  short="Sent message is not moved to the top and the view follows the reply",
  steps=APP + ["Tap History", "Tap a drama with a finished storyboard", "Type Please update the image for Scene 2 so Mateo holds the guitar case", "Tap Send", "Watch the chat until the reply is shown"],
  res="After Send the bubble stays mid-screen and the view follows the reply to the bottom; no ↓ appears.",
  res_zh="送出後訊息停在畫面中間，畫面跟著回覆捲到底，未出現 ↓。",
  exp="The sent message moves to the top; the reply generates below without the view following; ↓ shows if it overflows.",
  exp_zh="送出的訊息應移到頂部，回覆在下方生成且畫面不跟隨，超出時顯示 ↓。",
  imgs=[("tc344-t1", "amda31_after_send"), ("tc344-done", "amda31_followed_reply")]),

 dict(iss="ISS-AMDA-32", title="Returning from History, Choose Character or Full Edit keeps the old scroll position", cls="Functional", sev=3, owner="RD",
  cases=["TC-101", "TC-102", "TC-311"], rep=(4, 4),
  note="R-089 / R-173 (PM 1002 update §13.2 as changed 10/20: after History, Character Library or Full Edit the chat opens at the bottom, replacing 「keep the position」). A2-e: History ← and system Back (TC-101), Choose Character › Cancel (TC-102); A2-g3: Full Edit › Back (TC-311): each time the chat came back at the earlier scrolled-up position with ↓ shown. iOS lead DRI261896P0029 (iOS, TRCreated) asked for the old rule.",
  short="Returning from History, Choose Character or Full Edit keeps the old scroll position",
  steps=APP + ["Tap History", "Tap a drama with a finished storyboard", "Scroll up to the outline card", "Tap History", "Tap ←"],
  res="Coming back from History, Choose Character or Full Edit, the chat stays at the earlier scrolled-up position.",
  res_zh="從歷史、選角或完整編輯返回時，聊天停在先前捲動的位置。",
  exp="The chat opens at the bottom (newest message) after History, Character Library or Full Edit.",
  exp_zh="依 10/20 規格，返回後聊天應顯示在底部（最新訊息）。",
  imgs=[("tc101-back", "amda32_history"), ("tc102-after", "amda32_choose_character"), ("tc311-back", "amda32_full_edit")]),

 dict(iss="ISS-AMDA-33", title="History thumbnail shows a character look instead of the first storyboard frame", cls="UI", sev=3, owner="RD",
  cases=["TC-106"], rep=(1, 1),
  note="R-093 (PM 0930 updates: once a storyboard exists the thumbnail is its first frame). A2-e: Quiet Sanctuary (storyboard + videos) shows a close-up of Maya Lin's character look (green sweater), not Scene 1 (a wide bookshop shot); El compás del regreso correctly shows its Scene 1 frame. The template title 「Workplace Romance (2)」 on the same page is DRA262610-0063 (ProposeNAB).",
  short="History thumbnail shows a character look instead of the first storyboard frame",
  steps=APP + ["Tap History", "Look at the card of a drama with a storyboard and videos"],
  res="Quiet Sanctuary's History thumbnail is Maya Lin's character close-up, not its first storyboard frame.",
  res_zh="Quiet Sanctuary 的歷史縮圖是角色特寫，不是第一張分鏡畫面。",
  exp="Once a storyboard exists the History thumbnail is its first frame.",
  exp_zh="已有分鏡時，歷史縮圖應為第一張分鏡畫面。",
  imgs=[("tc106-history", "amda33_history"), ("tc106-qs-scene1", "amda33_scene1")]),

 dict(iss="ISS-AMDA-34", title="Opening a drama without changing it moves it to the top of History", cls="Functional", sev=2, owner="RD",
  cases=["O-13"], rep=(1, 1),
  note="R-094 (PM update board 4: only new content, regeneration, Rename and Full Edit count as modifications). O-13 (A2-e): opening Corner Stall Rivalry, tapping ↓, scrolling, opening Choose Character from a slot and closing it with Cancel (nothing picked or sent) moved it to the top with a new time and size (05:37 PM, 4.3 MB → 09:22 PM, 4.4 MB). Opening, scrolling, playing and downloading alone (Quiet Sanctuary, Bitter Cold, Workplace Romance (2)) did not.",
  short="Opening a drama and cancelling Choose Character moves it to the top of History",
  steps=APP + ["Tap History", "Tap an older drama at 「Choose your characters」", "Tap a character slot", "Tap Cancel", "Tap ←", "Tap History"],
  res="Opening a drama and closing Choose Character with Cancel moves it to the top of History with a new time.",
  res_zh="只開啟劇並取消選角，劇就移到歷史最上方且時間更新。",
  exp="Only new content, regeneration, Rename and Full Edit move a drama to the top with a new time.",
  exp_zh="只有新增內容、重新生成、重新命名與完整編輯才應更新排序與時間。",
  links=[pm("pm-update-4"), ds("ds-recent-task")],
  imgs=[("tc106-history", "amda34_before"), ("tc113-history2", "amda34_moved_to_top")]),

 dict(iss="ISS-AMDA-35", title="No balance-after line under Generate", cls="UI", sev=3, owner="RD",
  cases=["TC-115"], rep=(2, 2),
  note="R-100 (Design MX link frames: 「You'll have 160 left」 under Generate; Design outranks PM's confirm step). A2-f: the El compás del regreso video settings card (◆120, balance 679) and the Bitter Cold Create storyboard card (◆19) show only the price and the button. Tapping Generate charges without a confirmation (correct, A2-d1 19:57:15).",
  short="Video and storyboard cards show no 「You'll have N left」 line under Generate",
  steps=APP + ["Tap History", "Tap a drama at 「Choose your video settings」", "Look under Generate video"],
  res="Under Generate video the card shows only ◆120; there is no 「You'll have N left」 line (also on Create storyboard).",
  res_zh="Generate 下方只顯示價格，沒有「You'll have N left」剩餘點數。",
  exp="A line 「You'll have N left」 under Generate shows the balance after this action.",
  exp_zh="Generate 下方應顯示「You'll have N left」，告知扣點後的餘額。",
  spec=["Spec string: 「You'll have 160 left」 (Design MX link frame example)"],
  imgs=[("a2f-elcompas-card", "amda35_video_card"), ("a2f-bittercold", "amda35_storyboard_card")]),

 dict(iss="ISS-AMDA-36", title="Video settings card has no Model • Seedance row", cls="UI", sev=4, owner="RD",
  cases=["TC-079"], rep=(1, 1),
  note="R-068 / R-302 (PM update board 8, 10/16, newer than the Design frame; REQ-026: test the PM version): 「Choose your video settings」 with 「Model • Seedance」 and Best / Standard / Fast. A2-g1 22:00 (Workplace Romance (2)): Best / Standard / Fast with no NEW tag and the right Best subtitle, but no 「Model • Seedance」 row; Standard is selected by default (PM mock: Best). Minor: 「Preview - 30 sec」 (hyphen) and 「Generate video」 (lower-case v). The Best price is DRA262610P0274 (existing Android ticket).",
  short="Video settings card has no 「Model • Seedance」 row",
  steps=VID[:-1] + ["Read the video settings card"],
  res="The card has no 「Model • Seedance」 row above Best / Standard / Fast.",
  res_zh="影片設定卡缺少「Model • Seedance」列。",
  exp="The card shows a 「Model • Seedance」 row above the Best / Standard / Fast control.",
  exp_zh="影片設定卡應在 Best / Standard / Fast 上方顯示「Model • Seedance」。",
  spec=["Spec string: 「Model • Seedance」"],
  imgs=[("wr2-open", "amda36_card")]),

 dict(iss="ISS-AMDA-37", title="Scene video update: no Updating line and the old card is not replaced", cls="Functional", sev=3, owner="RD",
  cases=["TC-144", "TC-145", "TC-096"], rep=(4, 4),
  note="R-129 / R-130 (Design flow arrows 4006-73627 / 4006-73628) and R-283 / R-085: while a scene video regenerates the old card stays with 「Updating 1 scene... Your video will refresh when it's done.」; when done the chat replaces the old video and shows 「Your video has been updated.」. Android has no scene editor on a finished clip, so the update was started from the chat (「In the video, change scene 3 only…」 › 「Create the full episode (15 sec)」 ◆33 / ◆30). A2-g2 23:44–23:49 and A2-g3 00:15–00:21, 00:32–00:38 (Corporate rivals / Boardroom Rivals): no line under the old card; each finished update appends a new 「Here's your drama.」 card + 「Ready for the next episode?」 below the bubbles, the old card stays, and 「Your video has been updated.」 never appears. Related: DRA262610P0038 (Regenerate Clip failure).",
  short="Scene video update shows no Updating line and appends a new card",
  steps=FULL + ["Type In the video, change scene 3 only: Lauren turns her chair to the window", "Tap Send", "Tap Generate on the Create the full episode card",
                "Read the line under the old video card", "Wait until the update finishes"],
  res="No 「Updating 1 scene...」 under the old video; when done a new card is appended and no 「Your video has been updated.」",
  res_zh="場景影片更新時舊卡下無「Updating 1 scene...」，完成後新增卡片而非取代，也無更新提示。",
  exp="The old card shows 「Updating 1 scene...」, then is replaced by the new video with 「Your video has been updated.」",
  exp_zh="更新中舊卡應顯示「Updating 1 scene...」，完成後取代舊影片並提示已更新。",
  spec=["Spec string: 「Updating 1 scene... Your video will refresh when it's done.」 / 「Your video has been updated.」"],
  imgs=[("tc144-card", "amda37_no_updating_line"), ("tc145-done", "amda37_new_card_appended"), ("tc096-done", "amda37_no_updated_message")]),

 dict(iss="ISS-AMDA-38", title="Download during a scene video update saves the old clips at once", cls="Functional", sev=3, owner="RD",
  cases=["TC-096"], rep=(1, 1),
  note="R-085 / R-281 (PM 1002 update: while the video updates, download shows 「Your video is still updating. Try again when it's done.」). A2-g2 23:44 (Corporate rivals, scene 2 regenerating): the old video card's download icon saved at once with 「Saved to your device.」 (4 old clips written to Movies/…/Mini Drama). Export Full Video stayed enabled too — that part is DRA262610P0192 (Assigned). iOS lead DRI261895P0028 is iOS.",
  short="Download during a scene video update saves the old clips at once",
  steps=FULL + ["Type In the video, change scene 2 only: Lauren stands up from her chair", "Tap Send", "Tap Generate on the Create the full episode card",
                "Tap the old video card", "Tap the download icon"],
  res="While a scene regenerates, download saves the old clips at once with 「Saved to your device.」",
  res_zh="場景重新生成中點下載，立即儲存舊片段並顯示已儲存。",
  exp="Download shows 「Your video is still updating. Try again when it's done.」 and saves nothing.",
  exp_zh="更新中下載應顯示「Your video is still updating…」且不儲存。",
  spec=["Spec string: 「Your video is still updating. Try again when it's done.」"],
  imgs=[("tc096-download-tap", "amda38_saved_old")]),

 dict(iss="ISS-AMDA-39", title="Video player opens paused and needs a second tap", cls="Functional", sev=3, owner="RD",
  cases=["TC-143"], rep=(2, 2),
  note="R-128 (Design flow arrow 2820-115460: Play opens the scene-video player and plays). A2-g2 23:06 (Corporate rivals full episode): the player opens on the first frame with ▶ and starts only after the video is tapped again; same on the result page later. Build check: TR261021-0082 RD Note (2610212).",
  short="Play on the video card opens the player paused; it needs a second tap",
  steps=FULL + ["Tap Play on the video card"],
  res="Play on the video card opens the player on the first frame; it plays only after a second tap.",
  res_zh="點影片卡的播放後播放器停在第一格，需再點一次才播放。",
  exp="Play opens the scene-video player and starts playback.",
  exp_zh="點播放應開啟播放器並直接播放。",
  imgs=[("tc143-player", "amda39_paused")]),

 dict(iss="ISS-AMDA-40", title="Renaming a drama during a video job: push uses the old name, no toast", cls="Functional", sev=3, owner="RD",
  cases=["TC-308"], rep=(1, 1),
  note="R-171 (PM update board 4 §6.4: the toast and the push use the new name). A2-g3: Corporate rivals renamed 「Boardroom Rivals」 (00:16:20) while its scene 3 video regenerated (Generate 00:15:06); the video finished 00:21:37 and the push (logcat FCM 00:21:23) read 「\"Corporate rivals\" is done. Tap to watch it.」; no 「Good news!」 toast on the landing page (waited to 00:25:56) or the Launcher. A second video started after the rename used the new name in both. The name is taken when a generation starts.",
  short="Renaming a drama during a video job: the push uses the old name and no toast shows",
  steps=FULL + ["Type In the video, change scene 3 only: Lauren turns her chair to the window", "Tap Send", "Tap Generate on the Create the full episode card",
                "Tap History", "Tap ⋮ on the drama", "Tap Rename", "Type Boardroom Rivals", "Tap OK", "Tap ←", "Wait on the landing page until the video finishes"],
  res="The push reads 「\"Corporate rivals\" is done.」 (the old name) and no 「Good news!」 toast shows.",
  res_zh="生成中改名後，推播仍用舊名且未顯示「Good news!」提示。",
  exp="The push and the 「Good news!」 toast use the new name.",
  exp_zh="推播與提示應使用新名稱。",
  log=("Push text after a rename during generation", [
    ("Rename 00:16:20; video done 00:21:37", "2026-10-28", "00:16:00", "00:22:00", r"FcmInstanceIDService")]),
  imgs=[("tc308-renamed", "amda40_renamed")]),

 dict(iss="ISS-AMDA-41", title="Leaving the export page cancels the export", cls="Functional", sev=3, owner="RD",
  cases=["TC-517", "TC-168"], rep=(3, 3),
  note="R-323 / R-306 (PM Figma 10/22 export states, node 4418:2, RD to confirm: ← and system Back stay enabled during Export Full Video, the export keeps running in the background and 「Saved to Gallery.」 shows on the current page; fallback if RD keeps it in the foreground: 「Stop exporting?」 with Keep exporting / Stop). A2-g3 23:58:59 / 00:01:13 and A2-h 01:52:52: system Back on the producing page shows 「Are you sure you want to leave?」 / 「Producing video… 20%」 with Cancel / OK — neither behaviour; OK returns to the chat and cancels the export (no file after 2 min, no 「Saved to Gallery.」). The export sheet and full-screen page are DRA262610P0243 / P0219 (existing Android tickets).",
  short="Leaving the export page asks to leave and cancels the export",
  steps=FULL + ["Tap the video card", "Tap Export Full Video", "Tap Produce", "Press the system Back button", "Tap OK", "Wait 2 minutes"],
  res="Back on the producing page asks 「Are you sure you want to leave?」; OK cancels the export and nothing is saved.",
  res_zh="匯出中按返回出現「Are you sure you want to leave?」，按 OK 會取消匯出。",
  exp="Back stays enabled, the export runs on in the background and 「Saved to Gallery.」 shows on the current page.",
  exp_zh="匯出中可返回，匯出在背景繼續並於當前頁顯示「Saved to Gallery.」。",
  spec=["Spec string: 「Saved to Gallery.」 / fallback 「Stop exporting?」"],
  imgs=[("tc517-back", "amda41_leave_dialog"), ("tc517-ok", "amda41_back_in_chat"), ("tc168-back", "amda41_again_h")]),

 dict(iss="ISS-AMDA-42", title="Export pages show another drama's thumbnail", cls="UI", sev=2, owner="RD",
  cases=["TC-343", "O-21"], rep=(1, 1),
  note="R-249 / R-324 (PM: the export shows the drama being exported). A2-g3 23:58 (Corporate rivals): the producing page and the 「Saved to Gallery」 page show the 夜市轉角的心動對決 night-market thumbnail (the previous export); the file itself is Corporate rivals (Corporate_rivals.mp4, 90.3 s). The sheet and full-screen page themselves are DRA262610P0243 / P0219 (existing Android tickets).",
  short="Export producing and done pages show another drama's thumbnail",
  steps=FULL + ["Tap the video card", "Tap Export Full Video", "Tap Produce", "Look at the thumbnail"],
  res="The producing and 「Saved to Gallery」 pages show the previous export's thumbnail, not the drama being exported.",
  res_zh="匯出進度頁與完成頁顯示前一部劇的縮圖。",
  exp="The export pages show the thumbnail of the drama being exported.",
  exp_zh="匯出頁應顯示正在匯出的劇的縮圖。",
  imgs=[("tc343-exporting", "amda42_producing"), ("tc343-done", "amda42_done")]),

 dict(iss="ISS-AMDA-43", title="Generation waits exceed 10 s with only Stop or leaving possible", cls="Functional", sev=3, owner="RD",
  cases=["TC-169", "TC-171", "TC-172", "TC-174", "TC-173"], rep=(5, 5),
  note="R-140 (wait thresholds, user rule 2026-10-15: no wait with only leaving possible lasts over 5 s without an animation or 10 s with one; the same rule backs iOS DRI261895P0029 and DRI261897P0008, both Assigned). A2-h, timed from MiniDramaPerf turn_end: outline 27.3 s (01:11:36–01:12:03), a revision 52 s (01:13:23–01:14:15), a storyboard 323 s (01:31:23–01:36:47) and an export 119 s (01:50:15–01:52:18, progress ring) — each behind a skeleton or spinner with no other action. Retest A2-r1 (TC-173, 10/28, Shared Shelter, French, No captions): Fast · Full Video - 90 sec ◆180 took 845 s (Generate 11:25:15 → turn_end 11:39:20; 「Here's your drama.」 over a shimmering placeholder from ~11:27), and the cast ✓ → storyboard card stretch was 79 s with nothing but the outline on screen (no animation). iOS lead DRI261895P0031 (video blocks useful actions beyond 10 s). The one-character wait (TC-170, 109 s) is left out: an existing Android ticket covers it (dedupe per OS, user 2026-10-28; dedupe.txt). Spec Link names the screens; the threshold is the team's wait rule, so RD may forward it to PM.",
  short="Generation waits exceed 10 seconds with only Stop or leaving possible",
  steps=NEW[:-1] + ["Time the wait until the Story Outline card shows"],
  res="Waits with only Stop or leaving last 27–323 s (outline, revision, export, storyboard) and 845 s for a full video.",
  res_zh="大綱 27 秒、修改 52 秒、分鏡 323 秒、匯出 119 秒、完整影片 845 秒期間只能停止或離開。",
  exp="No wait with only Stop or leaving lasts over 10 s with an animation (5 s without one).",
  exp_zh="只能等待的時間有動畫時不應超過 10 秒（無動畫 5 秒）。",
  links=[pm("pm-main-flow"), ds("ds-main-flow")],
  log=("Turn timings (MiniDramaPerf turn_end) of the timed waits", [
    ("TC-169 outline, Generate 01:11:36", "2026-10-28", "01:11:30", "01:12:05"),
    ("TC-171 revision, sent 01:13:23", "2026-10-28", "01:13:20", "01:14:16"),
    ("TC-172 storyboard, Generate 01:31:23", "2026-10-28", "01:31:20", "01:36:48"),
    ("TC-173 full video 90 s, Generate 11:25:15", "2026-10-28", "11:25:10", "11:25:20"),
    ("TC-173 full video 90 s, turn end", "2026-10-28", "11:39:15", "11:39:25")]),
  imgs=[("tc169-1", "amda43_outline_wait"), ("tc172-1b", "amda43_storyboard_wait"), ("tc174-p1b", "amda43_export_wait"), ("r1-fr-vid-now", "amda43_video_wait")]),

 dict(iss="ISS-AMDA-44", title="Offline character generation failure blames a busy service", cls="UI", sev=4, owner="RD",
  cases=["O-5"], rep=(1, 1),
  note="PM Error Handling board: a connection loss shows the offline copy (the app itself shows 「You're offline. Check your connection and try again.」 elsewhere, TC-032). O-5 (A2-c2 19:12:36): with Wi-Fi off (no cellular service) Create my character › Generate fails at once with 「Couldn't create image」 / 「The service is currently busy. Try again later.」; logcat: 「HTTP request to cc team gateway failed: Could not establish connection」. Nothing charged.",
  short="Offline character generation failure says the service is busy",
  steps=CMC[:-2] + ["Turn Wi-Fi off", "Tap Generate"],
  res="Offline, Generate fails with 「The service is currently busy. Try again later.」, blaming the service.",
  res_zh="離線時生成角色失敗卻顯示服務忙碌。",
  exp="A connection loss shows the offline message 「You're offline. Check your connection and try again.」",
  exp_zh="斷線時應顯示離線訊息，而非服務忙碌。",
  links=[pm("pm-error-handling")],
  log=("Create my character with Wi-Fi off", [("O-5 Generate offline", "2026-10-27", "19:12:25", "19:12:45")]),
  imgs=[("tc137-fail", "amda44_busy_message")]),

 # Retest after A2 (REQ-047 / REQ-048, 2026-10-28): A2-r1 (credits) and A2-r2 (fresh install).
 dict(iss="ISS-AMDA-45", title="First video on a fresh install shows no Get notified pre-prompt", cls="Functional", sev=3, owner="RD",
  cases=["TC-081"], rep=(2, 2),
  note="R-070 / R-167 (PM 0930 updated board; board notes l.85: on the first video request 「Get notified when your video is ready?」 with Notify me (then the system permission on Android 13+) / Not now (never shown again)). Retest A2-r2d 10/28: fresh install (13:07 adb uninstall + install of the TR261021-0082 APK, 16.8.0 / 2610212; 13:41 pm clear with testserver.config in place, so Stage with the yellow Launcher bar), signed in 「ethan.hsu.cl」 (Free), no video generated on this install. Glad We Came template, storyboard ◆31, Fast · Preview - 30 sec ◆60, Generate video 13:56:23: no pre-prompt; the chat went straight to the 「Fast · Preview - 30 sec」 bubble and 「Thinking…」; logcat has only 「[DECISION] pre-approved 'storyboard': {VIDEO=2}」, no notification line. The second video (Love, Unscripted, 14:16:25) had none either. Android 12; PowerDirector notifications are on by default (dumpsys notification). TC-303 (Notify me) and TC-304 (Not now, not again) are Blocked behind this. iOS lead DRI261895P0022 (same symptom); no Android ticket in the read-only dedupe (DRA262610P0250 / P0267 are about the 「Your drama is ready」 push itself).",
  short="First video on a fresh install skips the 「Get notified」 pre-prompt",
  steps=["Uninstall PowerDirector", "Install PowerDirector 16.8.0 (2610212)", "Launch the APP", "Sign in", "Tap AI Mini Drama on the Launcher",
         "Tap the Glad We Came template", "Tap Make my version", "Tap English", "Tap Yes, include captions", "Tap Generate",
         "Wait for the Create storyboard card", "Tap Generate on the Create storyboard card", "Wait for the Storyboard Preview",
         "Tap Fast", "Tap Preview - 30 sec", "Tap Generate video"],
  res="The first Generate video goes straight to 「Thinking…」 with no notification pre-prompt (nor on the second video).",
  res_zh="安裝後第一次產生影片直接進入「Thinking…」，未顯示通知預先提示（第二支影片亦無）。",
  exp="The first Generate video shows 「Get notified when your video is ready?」 with 「Notify me」 and 「Not now」.",
  exp_zh="首次產生影片時應先顯示通知預先提示（Notify me / Not now）。",
  spec=["Spec string: 「Get notified when your video is ready?」 / 「Videos take a few minutes. We'll let you know as soon as yours is done.」"],
  log=("First and second Generate video on a fresh install: no notification pre-prompt", [
    ("TC-081 Glad We Came, first video, Generate 13:56:23", "2026-10-28", "13:56:15", "13:56:40", r"otif"),
    ("TC-304 Love, Unscripted, second video, Generate 14:16:25", "2026-10-28", "14:16:20", "14:16:40", r"otif")]),
  imgs=[("r2d-glad-6", "amda45_video_settings"), ("r2d-tc081-prompt", "amda45_no_preprompt")]),

 dict(iss="ISS-AMDA-46", title="History opens an empty new chat for about 2 minutes after leaving a video job", cls="Functional", sev=3, owner="RD",
  cases=["TC-166"], rep=(1, 1),
  note="R-139 (leave-and-return rule) with R-071 (PM main flow: leaving while a video generates → 「We'll keep making your video. Find it in History.」, the video keeps generating) and R-025 (reopening returns to the latest step). Retest A2-r1 10/28, Storm Warning: Generate video Fast · Preview - 30 sec at 12:28:54, ← to the AI Mini Drama landing and ← to the Launcher at 12:29:16 (no dialog), back into AI Mini Drama 12:29:37. History lists Storm Warning (12:28 PM), but tapping its row at 12:29:45, 12:30:20 and 12:30:50 — and the Accords nocturnes row — opened the empty 「Hi, I'm your AI Drama Assistant」 page. logcat: 「agent_destroy … native=125748ms」 then 「agent_create FAILED」 at 12:31:16; after leaving again 「[PRUNE] pruned 1 unfinished session(s)」 (12:31:18), and History › Storm Warning then opened at the video stage (12:31:36; 「restored approval for interrupted turn: {VIDEO=2}」, 「pending_resume detected, resuming turn」). Nothing charged (18445). That the job did not run on while away is DRA262610P0026 (NewCreated), not this entry.",
  short="History opens an empty new chat for about 2 minutes after leaving a video job",
  steps=VID + ["Tap ←", "Tap ← on the AI Mini Drama page", "Tap AI Mini Drama on the Launcher", "Tap History", "Tap the same drama"],
  res="For about 2 minutes every History row opens the empty 「Hi, I'm your AI Drama Assistant」 page instead of the drama.",
  res_zh="離開影片生成後約 2 分鐘內，點歷史中的任何劇集都只開啟空白新聊天頁。",
  exp="The drama opens at its video stage with the video still in progress, as History lists it.",
  exp_zh="應開啟該劇集並停在影片階段，影片仍在進行中。",
  links=[pm("pm-main-flow"), pm("pm-update-4"), ds("ds-recent-task")],
  log=("Leaving a video job: History opens a new chat until agent_create fails and the session is restored", [
    ("TC-166 Storm Warning: Generate 12:28:54, left 12:29:16, History taps 12:29:45–12:30:50, reopened 12:31:36", "2026-10-28",
     "12:28:50", "12:31:40", r"agent_create|agent_destroy: queueWait|\[PRUNE\]")]),
  imgs=[("tc166-gen-start", "amda46_generating"), ("tc166-history", "amda46_history"), ("tc166-reopen2", "amda46_empty_chat"),
        ("tc166-after-reopen", "amda46_reopened_later")]),
]

# Dedupe per OS (user, 2026-10-28): a finding that matches an existing Android ticket (open or resolved) is not listed —
# no card, no recheck row, no on-hold entry. These entries and the RECHECKS rows below are kept only in dedupe.txt.
# An iOS ticket never makes a finding a duplicate (it may be named in the QA note / Related line).
DUPS = {}  # nothing starts on hold any more
SAME_OS = {
 "ISS-AMDA-04": ("DRA262610-0019", "Close (fixed in 2610212 claimed)", "「Ethnicity options in character filter do not match Create my character」: the filter still has no Caucasian/White on 2610212 — the same mismatch the ticket reports; the fix claim does not hold. Same OS, so not listed (no reopen, team rule)."),
 "ISS-AMDA-06": ("DRA262610-0061", "Close", "「Finish your characters sheet text and button differ from spec」: its Result already quotes 「Each one needs a look…」, the plural subtitle A2 still sees; the fix changed the one-character sheet only. Same sheet, same text."),
 "ISS-AMDA-14": ("DRA262610P0147", "NewCreated", "「Create my character cannot be closed or stopped while Generating」: on 2610212 X and Back now ask; the outside tap that still does nothing is the remaining part of the same ticket."),
 "ISS-AMDA-26": ("DRA262610P0027", "Propose Wont Fix", "「Storyboard Preview stays \"unavailable\" even after the missing scene image is regenerated」 (67 % overlap, re-run 2026-10-28): the same defect — the Storyboard Preview is not rebuilt after a scene image is regenerated; RD already declined it, and on 2610212 the image itself did not change either (DRA262610P0199)."),
 "ISS-AMDA-36": ("DRA262610P0222", "Assigned", "「Re-offered video settings card lacks model and quotes 120 for a 60 job」: the missing 「Model • Seedance」 row is the same symptom on the same card (A2 saw it on the first offer too)."),
 "ISS-AMDA-44": ("DRA262610P0123", "NewCreated", "「Offline Regenerate Image reports service busy instead of a network problem」: the same offline-to-「service busy」 mapping of an image-generation failure (「Couldn't create image」), here on Create my character; one fix."),
}

# Cases whose failure is an existing Android ticket (former recheck rows): dedupe.txt only, not in the drafts or the page.
RECHECKS = [
 ("TC-410", "DRA262610-0045", "NewCreated — unchecked 「My characters only」 checkbox gray", "Thin light-gray outline square; panel's active controls are blue."),
 ("TC-044, O-4, O-14, TC-447, O-26", "DRA262610P0174", "Assigned — assistant says the storyboard is created before Create storyboard", "Before any storyboard Generate: 「Completed the storyboard script…」, 「I have created the complete 6-beat storyboard…」, 「Retained the storyboard for 'The Understudy'…」 on custom and template chats; retest: 「Generated the full 6-beat storyboard for 'Morning Key'…」 above the ◆28 card after Create Next Episode (O-26)."),
 ("TC-057, TC-134, TC-339, TC-340, TC-342, TC-401", "DRA262610P0262", "NeedCodeReview — X closes a completed character with no discard confirmation", "No 「Discard this character?」 for X, swipe down or system Back, so Keep is unreachable. The saving to Mine is new: ISS-AMDA-17."),
 ("TC-126", "DRA262610P0135", "RDResolved — AI Suggestion fills only the description", "Still reproduces on 2610212: Gender, Ethnicity and Age stay unset, Generate grey. Reopen candidate — not acted on (team rule)."),
 ("TC-407", "DRA262610-0015", "NewCreated — AI Suggestion copies the outline role line", "「Female lead, independent bookstore owner facing lease termination」, word for word; a second tap does nothing."),
 ("TC-408", "DRA262610-0024", "NewCreated — male-looking character when Gender is Female", "Description 「male lead…」 overrides Female: prompt says 「Gender presentation: male.」"),
 ("TC-469", "DRA262610P0210", "NeedNewModule — reference photo ignores Age", "Age 75 + young photo → a woman of about 25; prompt has no Age line, 「reference image wins」."),
 ("TC-060, TC-072, TC-070", "DRA262610P0198", "Assigned — storyboard credit rate differs from the article", "3 credits per image (10 × −3 + TTS −1 = ◆31); chat image update ◆3; failed-scene Regenerate Image ◆3 where the spec says ◆6."),
 ("TC-377", "DRA262610P0122 / DRA262610P0197", "Assigned / NewCreated — 「Create storyboard」 user bubble after Generate", "Bubble added and kept after the result. Stage copy and per-image charging: ISS-AMDA-20."),
 ("TC-061, TC-062, TC-063, TC-398, TC-399, TC-294, TC-359", "DRA262610P0077", "Assigned — no warning when leaving right after Generate storyboard", "Stage ① ←, system Back, History and New chat leave with no dialog (first storyboard and chat updates); the job keeps running and is charged once. PM 10/22 §13.24 now asks for 「Leave while we're preparing?」, not 「Stop and lose your credits?」."),
 ("TC-359", "DRA262610P0195 / DRA262610P0116", "NewCreated / Assigned — History omits the processing state", "History during the storyboard shows the drama with no processing state."),
 ("TC-385, TC-073", "DRA262610P0134", "Assigned — storyboard image updates use a generic regeneration flow", "One generic row 「Updating storyboard after description changes.」; no skeleton on the scene; no new storyboard card at the bottom; 「Script updated!」 for an image change."),
 ("TC-073, TC-458", "DRA262610P0199", "Assigned — regeneration ignores the requested scene change", "Rain (Scene 2) and 「Lauren standing beside the window」 (Scene 3) dropped from the TextToImage prompt; 3 credits charged each."),
 ("TC-282", "DRA262610-0050", "RDResolved — English dialogue uses 「」", "All six Workplace Romance (2) scenes: 'Lauren Hale：「…」'. Reopen candidate — not acted on."),
 ("TC-443", "DRA262610P0169", "RDResolved — preview captions split mid-word", "Chinese preview: 「酸甜茶香拐走了阿」|澤, 管理員 and 營業額 split. Reopen candidate — not acted on."),
 ("TC-494", "DRA262610P0248", "Assigned — assistant switches to the video language", "Spanish drama: status row 「Regenerando el guion gráfico tras actualizar la descripción.」"),
 ("TC-419", "DRA262610P0072", "NewCreated — chat text scrolls under the header buttons", "Scene titles drawn behind Back and the credit pill (「682」 over 「de compás」)."),
 ("TC-106", "DRA262610-0063", "ProposeNAB — template drama titles in History", "Template drama listed as 「Workplace Romance (2)」 (its category), preview card 「Workplace Romance」; R-093 asks for the title Iris generated."),
 ("TC-108", "DRA262610P0047", "NewCreated — Rename does not move a drama to the top", "Kept its position and 05:45 PM after Rename and reopen."),
 ("TC-111", "DRA262610-0046", "NewCreated — Delete dialog does not name the drama", "「This chat and its videos will be permanently deleted.」"),
 ("TC-498", "DRA262610P0255", "NewCreated — user-given title replaced", "「THE UNDERSTUDY」 saved as 「Understudy」 even after asking (PM ruling pending)."),
 ("TC-080, O-15", "DRA262610P0274", "NewCreated — Best and Standard quote the same credits", "Best ◆120 / ◆360 (spec ◆180 / ◆540). Log: Best dispatched as seedance-2-5 720p but billed under action_id genvideo_…seedance2.0std_none_480p (perSecond=4)."),
 ("TC-405", "DRA262610P0226", "NewCreated — 「Here's your drama.」 over an empty card", "At the charge the skeleton became 「Here's your drama.」 over a blank shimmer card for ~7 min. Stage copy: ISS-AMDA-20."),
 ("TC-085, TC-484, O-16", "DRA262610P0233", "NeedMoreInfo — 「is ready」 toast names the wrong drama", "Toast on reaching the Launcher names the last finished drama (Quiet Sanctuary while Workplace Romance (2) generated; Workplace Romance (2) while El compás generated)."),
 ("TC-482", "DRA262610P0231 / DRA262610P0026", "Assigned / NewCreated — Full Edit of another drama breaks a running video", "A's turn ended with the 3600 s tool-timeout error when B's Full Edit opened; restarted only on reopening A (11 min later)."),
 ("TC-086", "DRA262610P0159", "Assigned — full episode offer says 60 sec, not 90", "「Create the full episode (60 sec)」 ◆240 for 6 scenes on three dramas."),
 ("TC-417", "DRA262610P0069", "ProposeNAB — re-entering Full Edit creates a new project", "Three 「Quiet Sanctuary」 projects; edits not reopened."),
 ("TC-418", "DRA262610P0071", "ProposeNAB — Export Full Video ignores Full Edit changes", "Same 52,218,218-byte file as the unedited export; no text, sticker or filter."),
 ("TC-423", "DRA262610P0084", "NewCreated — the drama's own captions block a Free export", "「You've used the following pro feature」 / Auto Captions."),
 ("TC-506", "DRA262610P0286", "NeedCodeReview — player and clip strip show different clips", "First reopen: player clip 1, strip highlights clip 4."),
 ("TC-510", "DRA262610P0297", "Assigned — clip strip does not follow playback", "Clip 6 playing, strip still shows clips 1–5."),
 ("TC-422, TC-090", "DRA262610P0083 / DRA262610P0276", "NewCreated — download saves raw clips with internal names, no captions", "Six raw 15-s 「reftovideo_…」 clips; clip 1 has no captions."),
 ("TC-485, O-18", "DRA262610P0234", "Assigned — Generate video stops silently when the server cannot be reached", "Storage upload failure 5 s after Generate: no error or Try again for 9 min, offer card gone, typed retry ends empty. Nothing charged."),
 ("TC-096", "DRA262610P0192", "Assigned — Export during a clip regeneration", "Export Full Video stays enabled while a scene regenerates. Download and the missing 「updated」 message: ISS-AMDA-37 / 38."),
 ("TC-492", "DRA262610P0244 / P0261 / P0275", "RDResolved / RDResolved / Assigned — captions break mid-word", "English pages split 「Ryan | Cole」; Chinese lines split words and start with 「，」."),
 ("TC-507", "DRA262610P0288", "Assigned — end of long Chinese captions dropped", "Exported file: 「半！」 never appears."),
 ("TC-434", "DRA262610P0154", "Assigned (fixed in 2610212 claimed) — male outfit changes in the video", "Ryan Cole: suit with / without tie, then shirt only, between clips. The fix claim does not hold."),
 ("TC-438", "DRA262610P0161", "ProposeNAB — wrong character image in a scene", "Lauren Hale and 宜萱 each show two different people across clips."),
 ("TC-481", "DRA262610P0230", "NewCreated — no progress bar or time in the player", "No progress bar, time or seek (PM ruling pending)."),
 ("TC-343", "DRA262610P0243 / DRA262610P0219", "Assigned — export panel; 51.6 MB estimate", "Export sheet first, then a full-screen producing page; 「Estimated size: 51.6 MB」. Wrong thumbnail: ISS-AMDA-42."),
 ("TC-153, TC-155", "DRA262610-0049", "TRCreated (fixed in 2610212 claimed) — outline Stop gives no feedback", "Outline and revision Stop: no dialog, toast or note. The fix claim does not hold. TC-155's lost card: ISS-AMDA-29."),
 ("TC-471", "DRA262610P0213", "NewCreated — no stopped state or retry after stopping the outline", "Chat ends at the format answer and the format card; no 「stopped」 line or Try again."),
 ("TC-156", "DRA262610-0057", "TRCreated (fixed in 2610212 claimed) — paid storyboard Stop gives no explanation", "Stop in stage ① cancels with no dialog or note (before the charge). The fix claim does not hold."),
 ("TC-470", "DRA262610P0211", "NewCreated — Send stays Stop during a job", "Typed 「Use a warmer tone」: the button stays ■ and the tap cancels the storyboard."),
 ("TC-415", "DRA262610P0065", "NewCreated — no cue for more templates", "Only a 19-px sliver of the next cover."),
 ("TC-503, O-22", "DRA262610P0268", "Assigned — template chat stops after the outline", "Merger Season: no Create storyboard card after 5 min; Proposal, The New Guy's Secret, The Art of Falling, Awakening the Storm, Glad We Came likewise."),
 ("TC-440, O-2", "DRA262610P0163", "TRCreated — The Art of Falling actors swapped by gender", "Julian Cross gets a woman, Lauren Hale a man (logcat mapping)."),
 ("TC-461", "DRA262610P0202", "NewCreated — Glad We Came: Lily's reference vs the script", "Blonde in the script, dark-haired South Asian preset; Ethan likewise."),
 ("TC-459", "DRA262610P0200", "NewCreated — JP The Dog Who Remembered Her: Shiro has no preset", "Mapping slots=2 of 3; no Characters Result at all within 4 min."),
 ("O-24", "DRA262610P0093", "NewCreated — outline and scene titles in English when Japanese is selected", "The Beer Heir with video language Japanese: outline, beat titles and cast names stay English; The Dog Who Remembered Her English with JP names (The Ring He Worked For is Japanese)."),
 ("O-12", "DRA262610P0285", "Assigned — Story Outline rewritten without notice after the cast is confirmed", "El compás del regreso: the Characters Result repeats the outline with 【Pacto en el tablao】 rewritten, no message."),
 ("TC-501", "DRA262610P0260", "Assigned — chat jumps back to the Story Outline after Generate", "Retest (Shared Shelter): after the cast ✓, after the storyboard and after the full video finished (11:39) the chat sat at the first Story Outline with ↓; 「Here's your drama.」 / Create Next Episode ~8 screens down. The user bubble mid-screen is ISS-AMDA-31."),
 ("TC-490", "DRA262610P0240", "NeedCodeReview — next episode of a No-captions drama gets burned-in captions", "Shared Shelter made with No captions (episode-1 export clean); Create Next Episode asked nothing about the format and Morning Key's export has English captions at 0:21 / 0:25."),
 ("TC-496", "DRA262610P0251", "Propose Wont Fix — French scene description uses 「」", "Accords nocturnes (French): 「Hugo：「Si vous venez…」」, never « » (same pattern as DRA262610-0050). Android 16.8 has no Fix scenes, so it was read on the storyboard scene page."),
 ("TC-166", "DRA262610P0026", "NewCreated (PM) — video generation stops while away and restarts on return", "Storm Warning: the job stopped when the page was left (12:29:11) and resumed only on reopening (12:31:26 pending_resume). The empty chat History opened meanwhile: ISS-AMDA-46."),
 ("O-25", "DRA262610P0216", "Cancelled — No-captions dramas export without the Free watermark", "Shared Shelter (No captions) exported with no 「PowerDirector」 watermark; Morning Key and The New Guy's Secret (Free, same sheet) carry it. Also: the New Guy's Secret export is saved as Romance_(7).mp4, not the drama title."),
 ("TC-462, O-23", "DRA262610P0203", "NewCreated — US The Dog Who Remembered Her: Murphy has no preset", "Murphy's slot is now dropped (2 cards); the chat then offers Update characters ◆8 instead of the storyboard."),
]

PARTS = [("TC-170", "DRA262610-0032 / DRA262610P0302", "Assigned / NewCreated — Generate all blocks the screen; the 1-minute hint vs 4 minutes", "ISS-AMDA-43's one-character wait (109 s, 01:21:14–01:23:03) — same symptom on the same sheet; the rest of ISS-AMDA-43 (outline, revision, storyboard, export, full video) is in no Android ticket and stays an entry.")]

E_ALL = E
E = [e for e in E_ALL if e["iss"] not in SAME_OS]

# Held: not drafted as bugs (reason shown on the review page). PM questions first.
HELD = [
 ("TC-478", "question (PM)", "Create my character opens with nothing prefilled from the outline (Gender, Age). The spec has no prefill rule (R-141 open item); DRA262610P0225 (NewCreated) is waiting for a PM ruling."),
 ("TC-479", "question (PM)", "Preview and full-episode result cards carry no type / length label, and the preview card is gone once the full episode exists. No card label is in the spec; DRA262610P0227 (NewCreated) is waiting for a PM ruling."),
 ("TC-159", "question (PM)", "Back during the first outline shows 「Leave this chat?」/「…this chat won't be saved.」 and Leave anyway discards it, so the running outline cannot be left and resumed (the row's 'same task at that stage'). The loss is announced; PM to say whether a first outline may be discarded this way (same as iOS P9)."),
 ("TC-161", "question (PM)", "Back during a character generation shows 「Stop and lose your credits?」 and Leave anyway stops it (nothing dispatched, nothing charged; the Clara pick is lost after 「Leave without finishing?」). PM update board 9 (10/16) specifies exactly that dialog for characters, while the row (R-139, QA leave-and-return rule) and the run note (§13.24, which covers storyboard and video only) expect it to keep running. Spec conflict for PM."),
 ("TC-467", "question (PM)", "Retest (The New Guy's Secret, Export Full Video, 1080×1920): narration captions are white bold with a black outline, two lines across ~70–80 % of the width, ~5 % of the frame height per line — not visibly smaller than before. The spec gives no caption size; the row's note waits for a PM ruling on the 'smaller default font in balance with the frame'."),
 ("TC-158", "question (PM)", "An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row; no spec says a typed draft is kept (iOS P9 held the same as a PM question)."),
 ("O-11", "held (single sighting, no frame)", "After leaving a chat storyboard update in stage ①, reopening showed the Create storyboard ◆3 card with Generate again; a second Generate made no second pre-approval and only ◆3 was charged. No frame of the reopened state (tc294-before is the pre-Generate card); recheck in the next run before drafting."),
]

NOT_BUG = [
 ("O-3", "Library picks land on the wrong look after the library grows (new looks shift the grid)", "Test-data note: screenshot before every library tap."),
 ("O-6", "A character generation stopped within ~2 s is not charged; stopped after dispatch it costs ◆4", "Matches the spec (「the credits you've spent won't be refunded」)."),
 ("O-7", "A character Download adds a PNG to the gallery and shifts Add Media picks", "Test-data note."),
 ("O-9", "Template storyboard approved under the 'character' label in the log", "Log label only; Credit Details books the right rows. Mentioned to RD in ISS-AMDA-20's context, not raised."),
 ("O-17", "Create Next Episode left a pending 「Quiet Sanctuary (1)」 entry", "Was resumed and used later (TC-321/473 Pass)."),
 ("O-19", "Restarting UiAutomator2 brought PowerDirector up on a Full Edit timeline with a PiP toast", "Test tooling (Appium relaunch), not the app."),
 ("O-27", "After the fresh install's first launch on Production, switching to Stage (testserver.config) made every signed-out turn fail with 403 「Fail to verify uuid」", "Test-setup artefact (credit UUID minted on Production); pm clear with the config in place fixed it. Recorded in the skill's Android server notes."),
]


def recheck_tickets():
    out = set()
    for _, t, _, _ in RECHECKS + PARTS + [(None, v[0], None, None) for v in SAME_OS.values()]:
        for part in t.split("/"):
            part = part.strip()
            out.add(part if part.startswith("DRA") else "DRA262610" + part)
    return out


DUPMARK = "Android duplicate (dedupe.txt only)"


def build_map():
    m = {}
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for e in E:
        for c in e["cases"]:
            m.setdefault(c, []).append(f"{num[e['iss']]}. {e['iss']}")
    for cs, t, s, _ in RECHECKS + PARTS:
        for c in [x.strip() for x in cs.split(",")]:
            m.setdefault(c, []).append(DUPMARK)
    for e in E_ALL:
        if e["iss"] in SAME_OS:
            for c in e["cases"]:
                m.setdefault(c, []).append(DUPMARK)
    m = {k: list(dict.fromkeys(v)) for k, v in m.items()}
    for c, d, _ in HELD:
        m.setdefault(c, []).append(f"held: {d}")
    for c, _, _ in NOT_BUG:
        m.setdefault(c, []).append("not a bug")
    return {k: "; ".join(v) for k, v in m.items()}


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
    obs = sorted(set(re.findall(r"\*\*(O-\d+)", open(f"{RUN}/observations.md", encoding="utf-8").read())), key=lambda x: int(x[2:]))
    MAP = build_map()
    missing = [k for k in fails + obs if k not in MAP]
    extra = [k for k in MAP if k not in fails and k not in obs]
    if missing or extra:
        sys.exit(f"reconciliation incomplete: missing {missing}, extra {extra}")
    for e in E:
        for c in e["cases"]:
            if c.startswith("TC-") and c not in fails:
                sys.exit(f"{e['iss']} cites {c}, which is not a Fail")

    img_root = f"{OUT}/{NAME}_images"
    if os.path.isdir(img_root):
        shutil.rmtree(img_root)
    os.makedirs(img_root)
    os.makedirs(f"{OUT}/logs", exist_ok=True)
    L = []
    w = L.append
    w(f"# AI Mini Drama (Android) — eBug drafts, phase A2 (table v2), PDR-A {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/android/runs/2026-10-27-a2-round2/` — phase A2 of draft `drafts/20261027-171228` (table v2, 471 cases; {len(rows)} run here), 2026-10-27 17:22 → 10-28 03:10 on {DEVICE[8:]} through Appium / UiAutomator2, build {V} ({B}), {TR}, Stage server, account 「ethan.hsu.cl」 (Free); retest after A2 on 10-28 11:00 → 14:25 (REQ-047 / REQ-048: A2-r1, 9 credit-blocked cases after a top-up; A2-r2, 9 fresh-install cases after an uninstall / reinstall of the same APK and a pm clear). Result after the retest: {tally.get('Pass', 0)} Pass, {tally.get('Fail', 0)} Fail, {tally.get('Blocked', 0)} Blocked. Off-case observations O-1…O-{obs[-1][2:]}: `runs/2026-10-27-a2-round2/observations.md`. Spec set `specs/2026-10-21-2` plus the PM Figma 10/22 frames (§13.24 node 4422:2, export node 4418:2).")
    w("")
    w("**Updated 2026-10-28 (retest):** TC-157 joins ISS-AMDA-21, TC-173 joins ISS-AMDA-43; new ISS-AMDA-45 (TC-081, with TC-303 / TC-304 Blocked behind it) and ISS-AMDA-46 (TC-166); TC-501, TC-490, TC-496, TC-166, O-25 and O-26 match existing Android tickets; TC-467 is a PM question; O-27 is a test-setup note.")
    w("")
    w("**Status:** nothing filed, uploaded or commented. First Android casebook batch, so there are no filing defaults yet (`ebug-defaults.ts pdr/ai-mini-drama android`: none): Creator, TRCode, source tag and method are asked on the review page. Dedupe was read-only (`dedupe.txt`).")
    w("")
    w("Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure-related entry and wherever a log shows the cause (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (Doc for copy). Dedupe per OS (user, 2026-10-28): a finding that matches an existing Android ticket, open or resolved, is not listed here at all (no entry, no recheck row, no on-hold entry) and is kept only in `dedupe.txt`; an iOS ticket never makes a finding a duplicate (its BugCode may be named in the QA note). No comments, no reopen (team rule 2026-10-21). Android 16.8 has no fault switches, so every finding here was seen with no injection.")
    w("")
    nrt = len(recheck_tickets())
    ndrop = len(SAME_OS)
    w(f"**What is drafted:** {len(E)} entries, all proposed for filing — Fail cases and observations with no Android ticket of their own ({len(E_ALL)} before the 2026-10-28 per-OS dedupe; {ndrop} entries ({', '.join(SAME_OS)}), the one-character wait of ISS-AMDA-43 (TC-170) and the {len(RECHECKS)} former recheck rows match existing Android tickets ({nrt} tickets) and are left out, recorded only in `dedupe.txt`). {sum(1 for h in HELD if h[1].startswith('question'))} cases are PM questions; see the tables after the entries. Entries follow the run order; trust the ISS-ID over the number.")
    w("")
    w("Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), Doc (copy). Every entry links the spec board or Figma frame it is checked against.")
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
            title, secs = e["log"]
            p = logx.excerpt(f"{OUT}/logs/{V}_amda{e['iss'][-2:]}_log.txt", f"{e['iss']} {title}", HDR, secs)
            shutil.copy(p, f"{img_root}/{folder}/")
            names.append(os.path.basename(p))
        tagtype = "" if e["cls"] == "Functional" else f"[{e['cls']}]"
        short = f"PDR-A {V} - [{TAG}]{tagtype} AI Mini Drama: {e['short']}"
        if len(short) > 140:
            sys.exit(f"{e['iss']} short description {len(short)} > 140")
        links = e.get("links") or links_for(e["cases"])
        if not links:
            sys.exit(f"{e['iss']} has no Spec Link")
        e["_links"] = links
        w("---"); w("")
        w(f"## {n}. {e['iss']} — {e['title']}  ·  Class: {e['cls']}  ·  Severity: S{e['sev']}  ·  Owner: {e['owner']}")
        w("")
        w(f"**Report step:** {', '.join(e['cases'])}  ·  **Reproduce:** {e['rep'][0]}/{e['rep'][1]}  ·  **Verified on:** {V}.{B}")
        w("")
        w(f"> **QA note — not pasted into eBug.** {e['note']}")
        if e["iss"] in DUPS:
            d = DUPS[e["iss"]]
            w("")
            w(f"> **⛔ Likely duplicate — on hold, do not file without a decision.** {d[0]} ({d[1]}): {d[2]}")
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
        for l in links:
            w(l)
        w("<Claude Reviewed>"); w("```"); w("")
        w(f"**Images:** `{NAME}_images/{folder}/`"); w("")

    w("---"); w("")
    w("## Held — PM questions and items not drafted")
    w("")
    w("| Item | Kind | Why held / what to decide |")
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
    w(f"| Blocked ({len(blocked)}) | " + ", ".join(f"{v} {k}" for k, v in sorted(bd.items())) + " | No verdict: no fault switches on Android 16.8 (planned for a later build), new account, no daily chat limit on Stage (TC-224 too: no remaining-chat count), language, paid tier, purchases, template full generation (REQ-019); TC-303 / TC-304 behind ISS-AMDA-45. The credit and uninstall blocks were cleared by the 10/28 retest. Grouped in the run's report.md and on the review page. |")
    w("")
    w("## Reconciliation against the report")
    w("")
    nq = sum(1 for f in fails if disp[f] == "question")
    w(f"The run is the report: {len(fails)} Fail ({len(fails) - nq} defect, {nq} question), {len(blocked)} Blocked (no verdict), observations {obs[0]}…{obs[-1]} ({len(obs)}).")
    w("")
    kinds = {"entry": [], "recheck": [], "held": [], "notbug": []}
    for k, v in MAP.items():
        if re.search(r"\d+\. ISS-AMDA", v):
            kinds["entry"].append(k)
        elif v.startswith("Android duplicate"):
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
    run -= len(kinds["recheck"]); w(f"| → matches an existing Android ticket only (dedupe.txt, not listed) | −{len(kinds['recheck'])} | {run} |")
    run -= len(kinds["held"]); w(f"| → held (PM question, single sighting) | −{len(kinds['held'])} | {run} |")
    run -= len(kinds["notbug"]); w(f"| → not a bug | −{len(kinds['notbug'])} | {run} |")
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
    w("By severity: " + ", ".join(f"**{i}**" for s in (1, 2, 3, 4) for i, e in enumerate(E, 1) if e["sev"] == s) + ". Nothing is on hold: same-OS duplicates are left out (dedupe.txt) and iOS tickets never hold an entry. Nothing is filed until the review page's decisions come back (Creator, TRCode, source tag and method are needed: no earlier Android batch).")
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries ({len(SAME_OS)} dropped as Android duplicates), {len(HELD)} held → {OUT}/{NAME}.md")
    for n, e in enumerate(E, 1):
        print(n, e["iss"], "|", " || ".join(l[11:90] for l in e["_links"]))


if __name__ == "__main__":
    main()

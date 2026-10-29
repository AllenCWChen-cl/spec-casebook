#!/usr/bin/env python3
"""Build the AI Mini Drama Android eBug draft batch for phase A4 (table v3, draft 20261028-164930) on 16.8.0 (2610212).

Writes library/ai-mini-drama/android/ebugs/2026-10-28-a4/20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0.md, the sibling
_images/ folder (one NN_ISS-ID folder per entry: JPEGs named 16.8.0_<slug>.jpg plus the logcat excerpt where the finding
is failure-related or a log shows the cause) and logs/. The ISS-AMDA sequence continues after A2 (ISS-AMDA-47 on). Nothing is
filed. Every Fail row of results.csv and every observation O-n is mapped (entry / recheck of an existing ticket / held PM
question / not a bug); the script stops when one is missing.
"""
import csv, json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logx

REPO = logx.REPO
ROOT = f"{REPO}/library/ai-mini-drama/android"
RUN = logx.RUN
OUT = f"{ROOT}/ebugs/2026-10-28-a4"
NAME = "20261028_eBug_drafts_AI-Mini-Drama-A4_16.8.0"
V, B, TR = "16.8.0", "2610212", "TR261021-0082"
TAG = "AIAgent"
DEVICE = "Device: Sony Xperia 10 III (XQ-BT52) / Android 12"

DS_URL = "https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama"
PM_URL = "https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama"
PM_PDF = "AI Mini Drama - PM Spec 20261021.pdf"
_BOARDS = json.load(open(f"{REPO}/library/ai-mini-drama/specs/2026-10-21-2/extracted/boards.json"))
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


# ---- A4 entries (phase A4, table v3, draft 20261028-164930). ISS-AMDA continues after A2's ISS-AMDA-46. ----
# Only findings with no Android ticket of their own are entries (dedupe per OS, user 2026-10-28); the 40 A2 bugs
# DRA262610P0324–P0363 and the rest of the Android pool are in SAME_CASES below and dedupe.txt.

CHOOSE = APP + ["Tap History", "Tap a drama at 「Choose your characters」 with two unset characters", "Tap the first character slot"]

E = [
 dict(iss="ISS-AMDA-47", title="No More ideas chip once the chat has content", cls="UI", sev=3, owner="RD",
  cases=["TC-019"], rep=(2, 2),
  note="R-017 (PM top mockups) / R-338 (Design: the chip is drawn above the composer on every chat stage). A4-a1 and A1: a chat with the idea, the format answer, the outline and the characters card has no 「More ideas +」 chip, keyboard closed or open; the page source has no such element. No Android or iOS ticket found.",
  short="Chat shows no 「More ideas +」 chip once it has content",
  steps=NEW + ["Tap the chat input"],
  res="No 「More ideas +」 chip is shown above the input once the chat has content, with the keyboard closed or open.",
  res_zh="聊天已有內容後，輸入框上方沒有「More ideas +」chip（鍵盤收起或展開皆無）。",
  exp="A 「More ideas +」 chip shows above the input once the chat has content; tapping it offers more story ideas.",
  exp_zh="聊天有內容後，輸入框上方應顯示「More ideas +」，點擊可提供更多故事點子。",
  imgs=[("tc019-chat-content", "amda47_no_chip"), ("tc019-focused", "amda47_no_chip_focused")]),

 dict(iss="ISS-AMDA-48", title="Credit pill leaves a generating outline with no Leave this chat dialog", cls="Functional", sev=3, owner="RD",
  cases=["TC-357", "TC-358"], rep=(2, 2),
  note="R-261 (PM main flow §3.2/§3.3 and PM 10/21 dialog copy; Design 1016_Chat navigation): every top exit while the outline generates shows 「Leave this chat?」. A4-a2 18:04 (and A1 15:34): New chat and History show the dialog, the credit pill opens My Credits at once; the outline still arrives and the chat is saved to History (「Stormbound」). Not DRA262610-0037 (Close — the dialog on an empty chat).",
  short="Credit pill leaves a generating outline with no 「Leave this chat?」 dialog",
  steps=APP + ["Tap Create Your Drama", "Type an idea (e.g. A lonely lighthouse keeper and a stranded mail pilot)", "Tap Send",
               "Tap Generate", "Tap the credit pill while 「Thinking…」 shows", "Tap the system Back button", "Wait for the Story Outline card",
               "Tap ←", "Tap History"],
  res="While the outline generates, the credit pill opens My Credits with no 「Leave this chat?」; the chat is saved.",
  res_zh="大綱產生中點數膠囊直接開啟 My Credits，無「Leave this chat?」，聊天仍被保存。",
  exp="The credit pill shows 「Leave this chat?」 like New chat and History; after Leave anyway nothing is saved.",
  exp_zh="點數膠囊應與 New chat、History 一樣先詢問「Leave this chat?」，離開後不保存。",
  imgs=[("tc357-newchat-dialog", "amda48_new_chat_dialog"), ("tc357-pill-dialog", "amda48_pill_no_dialog"), ("tc358-history", "amda48_saved_in_history")]),

 dict(iss="ISS-AMDA-49", title="A refused idea gets a cut-off I cannot reply", cls="Functional", sev=3, owner="RD",
  cases=["TC-031"], rep=(1, 1),
  note="R-027 (Design extra / PM 09/30): an outline refused for policy shows 「I couldn't write a story from this idea. It may not meet our terms of service. Try describing it a different way.」 with no button. A4-a2 18:46:43: the turn completed after 4 s (logcat turn_complete final_state=complete, [AI] 「I cannot」) and the chat shows only 「I cannot」. A1 on the same build showed 「Something went wrong…」 + Try again instead, so neither run reached the spec message. The next idea correctly skipped the format card. Related, not duplicate: DRA262610P0228 (NewCreated, asks for the check before the format card).",
  short="Policy-refused idea gets a cut-off 「I cannot」 reply, not the terms message",
  steps=APP + ["Tap Create Your Drama", "Type an idea that violates the content policy (e.g. step-by-step instructions for building a weapon)", "Tap Send",
               "Tap English", "Tap Yes, include captions", "Tap Generate", "Wait 10 seconds"],
  res="After 4 s the chat shows only the cut-off reply 「I cannot」; the terms-of-service message is not shown.",
  res_zh="4 秒後聊天只顯示被截斷的「I cannot」，未顯示服務條款訊息。",
  exp="The chat shows 「I couldn't write a story from this idea. It may not meet our terms of service…」 with no button.",
  exp_zh="應顯示無法依此點子寫故事、可能不符服務條款的訊息，且無按鈕。",
  log=("Policy-violating idea: the turn completes with the reply 「I cannot」", [
    ("TC-031 Generate 18:46:43", "2026-10-28", "18:46:40", "18:46:50")]),
  imgs=[("tc031-reply", "amda49_i_cannot")]),

 dict(iss="ISS-AMDA-50", title="Finish your characters plural subtitle differs from the spec", cls="UI", sev=3, owner="RD",
  cases=["TC-039"], rep=(3, 3),
  note="R-033 (PM main flow; Design outranks PM: 「Add a look to continue.」). A4-b1 19:00 (and A1, A2): with 2 unset characters the sheet reads 「2 characters aren't set yet」 / 「Each one needs a look before you can continue.」. Related, closed: DRA262610-0061 (Close — 「Finish your characters sheet text and button differ from spec」); its fix changed the one-character sheet only, so the plural text is back as a new entry (closed-ticket rule, user 2026-10-28). The ◆4 price on the same sheet is DRA262610P0327 (not repeated here).",
  short="「Finish your characters」 plural subtitle differs from the spec",
  steps=CHOOSE + ["Tap ✓ without setting any character"],
  res="With two unset characters the subtitle reads 「Each one needs a look before you can continue.」",
  res_zh="兩個角色未設定時，副標與規格不同（Each one needs a look…）。",
  exp="The subtitle reads 「Add a look to continue.」 (Design), as on the one-character sheet.",
  exp_zh="副標應為「Add a look to continue.」（Design）。",
  spec=["Spec string: 「N characters aren't set yet」 / 「Add a look to continue.」"],
  rel=["Related: DRA262610-0061 (Close)"],
  imgs=[("tc039-sheet", "amda50_plural_subtitle")]),

 dict(iss="ISS-AMDA-51", title="Generate all with one failed character: singular dialog and no ! in the not-set sheet", cls="Functional", sev=3, owner="RD",
  cases=["TC-042", "TC-384"], rep=(1, 1),
  note="R-035 / R-294 (PM update 3). Run on a REAL failure (no fault switch on Android 16.8): Trapped Echoes, Generate all ◆8 for Tessa + Julian 19:13:13; logcat 19:13:45 MiniDramaFail [TextToImage] task_end status=Error error_code=4000 for Tessa. The dialog is the single-character 「Couldn't create image」 / 「We couldn't create this character… Try again later.」 instead of 「Couldn't create some images」; after it, ✓ shows 「1 character isn't set yet」 with Tessa as a plain placeholder (no 「!」) and tapping her does nothing. The refund that kept Tessa's Text to Speech −1 (TC-500) is DRA262610P0257 (RDResolved) and is not repeated here.",
  short="Generate all with one failed character shows the single error and no 「!」",
  steps=CHOOSE + ["Tap ✓ without setting any character", "Tap Generate all", "Wait until one character fails and the error dialog shows",
                  "Tap the system Back button", "Tap ✓", "Tap the failed character in the sheet"],
  res="1 of 2 failed: the dialog is the single 「Couldn't create image」, and the not-set sheet shows no 「!」 on it.",
  res_zh="兩個中一個失敗時顯示單一角色錯誤，未設定表單中失敗角色沒有「!」。",
  exp="「Couldn't create some images」 shows; the not-set sheet marks the failed character 「!」 and opens it on tap.",
  exp_zh="應顯示「Couldn't create some images」，未設定表單以「!」標示失敗角色並可點擊開啟。",
  log=("Generate all for two characters, one TextToImage failure (error_code=4000) and the refund", [
    ("TC-042 Generate all 19:13:13", "2026-10-28", "19:13:10", "19:14:00", r"refund")]),
  imgs=[("tc456-ready", "amda51_single_error"), ("tc384-continue", "amda51_no_mark"), ("tc384-tap-failed", "amda51_tap_does_nothing")]),

 dict(iss="ISS-AMDA-52", title="Ethnicity filter with no match shows a blank grid", cls="UI", sev=3, owner="RD",
  cases=["TC-288"], rep=(2, 2),
  note="R-154 (QA rule 8, data-driven facets: an empty result is shown clearly), on the Design Characters › Filter board. A4-b2 (and A1): Southeast Asian and Mixed each match 0 looks; the grid shows only the 「Create my character」 tile and blank space, with no 「No characters match」 text or hint to clear the filter. Other values list their looks (White 14+).",
  short="Character filter with no match shows a blank grid and no empty-state message",
  steps=CHOOSE + ["Tap the filter icon", "Tap Southeast Asian", "Tap ✓"],
  res="The grid shows only the 「Create my character」 tile and blank space; nothing says no character matches.",
  res_zh="篩選無結果時，只顯示「Create my character」與空白，沒有任何無結果提示。",
  exp="An empty result is shown clearly (e.g. a 「No characters match」 message with a way to clear the filter).",
  exp_zh="無結果時應清楚顯示空狀態（例如無符合角色的訊息與清除篩選方式）。",
  links=["ds-characters"],
  imgs=[("b2-tc288-Southeast-Asian", "amda52_southeast_asian"), ("b2-tc288-Mixed", "amda52_mixed")]),

 dict(iss="ISS-AMDA-53", title="System Back on the Add Media album list closes the whole picker", cls="Functional", sev=3, owner="RD",
  cases=["TC-525"], rep=(2, 2),
  note="R-347 (Design Choose Character · Add Media) / R-353 (REQ-051: system Back closes only the layer on top). A4-c1: Reference › Add Media › 「All ▾」 album list › system Back closes the whole picker back to Create my character (2 of 2); Back on the preview, the sort options and the camera closes only that layer. The album control reads 「All ▾」, not 「Recents ▾」 (Android media picker; recorded, not raised).",
  short="System Back on the Add Media album list closes the whole picker",
  steps=CHOOSE + ["Tap Create my character", "Tap the Reference photo box", "Tap All ▾", "Tap the system Back button"],
  res="System Back on the album list closes the whole Add Media picker and returns to Create my character.",
  res_zh="在相簿清單按系統返回鍵，整個 Add Media 選擇器被關閉，回到 Create my character。",
  exp="System Back closes only the album list and stays on Select Media, as the preview, sort and camera layers do.",
  exp_zh="系統返回鍵應只關閉相簿清單，停留在 Select Media。",
  links=["ds-characters"],
  imgs=[("tc525-albums2", "amda53_album_list"), ("tc525-albums-back2", "amda53_after_back")]),

 dict(iss="ISS-AMDA-54", title="System Back on the enlarged character preview closes Choose Character", cls="Functional", sev=3, owner="RD",
  cases=["TC-135"], rep=(2, 2),
  note="R-120 (Design flow arrow 2811-90592) / R-345 / R-352 (REQ-051: system Back on a full-screen viewer does what its ⓧ does). A4-c2: ⓧ closes the preview back to the library, but system Back on the preview closes the whole Choose Character page back to the chat (2/2). Back on the ⋯ menu and from Report is correct. A2 recorded a Pass on another drama, so this may depend on how the library was opened.",
  short="System Back on the enlarged character preview closes Choose Character",
  steps=CHOOSE + ["Tap the enlarge icon on a character", "Tap the system Back button"],
  res="System Back on the enlarged preview closes Choose Character and returns to the chat.",
  res_zh="在角色放大預覽按系統返回鍵，整個 Choose Character 關閉回到聊天。",
  exp="System Back closes only the preview back to the library, like ⓧ.",
  exp_zh="系統返回鍵應與 ⓧ 相同，只關閉預覽回到角色庫。",
  imgs=[("c2-135-pre2", "amda54_preview"), ("c2-135-afterback", "amda54_after_back")]),

 dict(iss="ISS-AMDA-55", title="Failed scene images in a chat update show no ! and keep their 6 credits", cls="Functional", sev=2, owner="RD",
  cases=["TC-293"], rep=(1, 1),
  note="R-157 (PM update 3 J5). Run on a REAL failure (no fault switch): Corporate rivals, chat update 「Scene 2 and Scene 4 heavy rain」 ◆12, Generate 22:53:41; Wi-Fi off ~22:54:30 over USB (restored right after). logcat: the two Location (env) images succeeded (receipts env_img_1 / env_img_2 completed, ◆3 each, 17717 → 17711); the two main scene keyframes failed (receipts img_1 / img_2 ◆3 each, 17711 → 17705; 22:54:32 MiniDramaFail [TextToImage] generation_failed tti=query_status_failed, [engine] EditImageGPT2 failed for beat_00c62024 and beat_3deb8b06). Charged 12 in all; the 6 of the two failed images should have been refunded, nothing was (still 17705 after reopening, no returned row). Screens: Scene 2's Location image shows the rain (why it looks successful) but its main image is the old one; the chat shows no 「!」, no failure message and no Edit, and Iris replies 「Updated Scene 2 (Their First Loss) and Scene 4 (A United Front) to incorporate heavy rain…」. Reviewer held it 10/29 asking whether the images succeeded; rewritten to this evidence and filed. Related, not duplicate: DRA262610P0311 (outfit edit claims updated visuals but no image is redrawn; no failure or charge), DRA262610P0238 (failed first-time scene image), DRA262610P0308 (storyboard refunds), DRA262610P0123 (offline image failure says busy).",
  short="Failed scene images in a chat update show no 「!」 and keep their 6 credits",
  steps=APP + ["Tap History", "Tap a drama with a finished storyboard", "Type 「Make Scene 2 and Scene 4 heavy rain」", "Tap Send",
               "Tap Generate on the update card", "Turn Wi-Fi off while the images are updating", "Wait 1 minute", "Turn Wi-Fi on",
               "Read Iris's reply in the chat", "Tap Scene 2 on the Storyboard Result card", "Tap ✕",
               "Read the balance on the credit pill", "Tap the credit pill", "Tap Details"],
  res="Both main scene images fail (log) while Location images update; chat claims success, no 「!」 or Edit; 6 credits kept.",
  res_zh="地點圖已更新但兩張場景主圖失敗；聊天宣稱成功、無「!」與訊息，6 點未退。",
  exp="Failed images show 「!」 and 「…image couldn't be updated. Your credits have been refunded…」 with Edit; 6 refunded.",
  exp_zh="失敗圖片應標示「!」並顯示退款訊息與 Edit，6 點應退回。",
  log=("Chat image update ◆12 during a Wi-Fi drop: Location images complete, both main images fail (TextToImage / EditImageGPT2), no refund", [
    ("TC-293 Generate 22:53:41, reopen 22:57", "2026-10-28", "22:53:35", "22:57:40", r"refund|EditImage")]),
  imgs=[("wifi-off-gen2", "amda55_success_claim"), ("cr-after2", "amda55_no_message"), ("cr-scene2", "amda55_old_image")]),

 dict(iss="ISS-AMDA-56", title="System Back in History Manage mode leaves History", cls="Functional", sev=3, owner="RD",
  cases=["TC-112"], rep=(2, 2),
  note="R-097 (PM update 4) / R-355 (REQ-051: system Back leaves Manage mode like Cancel). A4-e: Select All, Delete dialog and Back on the dialog (like Cancel) are correct; system Back in Manage mode leaves History altogether to the chat (2/2), while Cancel exits Manage mode. A2 recorded a Pass (History opened from the landing); in A4 History was opened from a chat.",
  short="System Back in History Manage mode leaves History instead of exiting Manage",
  steps=APP + ["Tap Create Your Drama", "Tap History", "Tap Manage", "Tap Select All", "Tap the system Back button"],
  res="System Back in Manage mode closes History and returns to the chat.",
  res_zh="在 History 的 Manage 模式按系統返回鍵，直接離開 History 回到聊天。",
  exp="System Back leaves Manage mode like Cancel and stays in History.",
  exp_zh="系統返回鍵應與 Cancel 相同，只退出 Manage 模式並停留在 History。",
  imgs=[("e-112-b", "amda56_manage_mode"), ("e-112-c", "amda56_after_back")]),

 dict(iss="ISS-AMDA-57", title="Asking Iris to change the title does not rename the drama", cls="Functional", sev=3, owner="RD",
  cases=["TC-318"], rep=(1, 1),
  note="R-177 (PM update 4 Bug 0014: the History name follows title changes) / R-309 (REQ-022 leads #46, #47). A4-e: The Understudy (never renamed, characters stage): 「Change the story title to Opening Night」 → 「Changing the title to Opening Night.」 then 「…is handled at the outline stage…」 + Create storyboard ◆31; History still shows 「The Understudy」, also after reopening. A2 passed the same row on Storm Harbor (title updated). Related, not duplicate: DRA262610P0255 (a user-given title replaced by an AI title).",
  short="Asking Iris to change the story title does not rename the drama in History",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create the storyboard?」 that was never renamed", "Type 「Change the story title to Opening Night」",
               "Tap Send", "Wait for the reply", "Tap History"],
  res="Iris says it is changing the title, then that the title is handled at the outline stage; History keeps the old title.",
  res_zh="Iris 回覆正在更改標題，之後又說標題在大綱階段處理；History 仍為舊標題。",
  exp="The drama is renamed and History shows the new title.",
  exp_zh="劇名應更新，History 顯示新標題。",
  imgs=[("e-318-chat", "amda57_reply"), ("e-318", "amda57_history")]),

 dict(iss="ISS-AMDA-58", title="System Back on the export sheet also closes the result page", cls="Functional", sev=3, owner="RD",
  cases=["TC-533"], rep=(2, 2),
  note="R-352 / R-356 (REQ-051: system Back on the export sheet closes only the sheet; PM Figma 10/22 export states 4418:2). A4-g3 Romance (2): system Back on the export sheet closes the sheet AND the result page, back to the chat (2/2); on the done page Back also goes to the chat. The sheet itself is DRA262610P0219 / P0243 (not repeated).",
  short="System Back on the Export Full Video sheet also closes the result page",
  steps=FULL + ["Tap Play drama", "Tap Export Full Video", "Tap the system Back button"],
  res="System Back on the export sheet closes the sheet and the result page and returns to the chat; nothing is exported.",
  res_zh="在匯出表單按系統返回鍵，表單與結果頁一起關閉並回到聊天。",
  exp="System Back closes only the export sheet and stays on the result page.",
  exp_zh="系統返回鍵應只關閉匯出表單，停留在結果頁。",
  imgs=[("g3-tc533-sheet2", "amda58_export_sheet"), ("g3-tc533-back2", "amda58_after_back")]),

 dict(iss="ISS-AMDA-59", title="Stop during the cast confirmation shows Something went wrong", cls="Functional", sev=3, owner="RD",
  cases=["TC-154"], rep=(1, 1),
  note="R-138 (QA rule 2: a Stop says what stops and whether spent credits are lost). A4-h Echoes of the Deep: Thomas / Elena picked, ✓ 04:14:10, ■ Stop at +15 s during 「Thinking…」: no warning; logcat cancel_turn → turn_complete final_state=cancelled, yet the chat shows 「Something went wrong on my end. Let's try that again.」 + Try again as if the app had failed. Nothing charged. Run in the cast-confirm stage (no character generation was running). iOS ticket DRI261895P0024 is iOS only, not a duplicate.",
  short="Stopping the cast confirmation shows 「Something went wrong on my end」",
  steps=CHOOSE + ["Tap a library look", "Tap the second character slot", "Tap a library look", "Tap ✓", "Tap ■ Stop while 「Thinking…」 shows"],
  res="Stop cancels with no warning, and the chat shows 「Something went wrong on my end. Let's try that again.」",
  res_zh="停止時無警告，聊天卻顯示錯誤「Something went wrong on my end」。",
  exp="Stop says what will stop and whether spent credits are lost, then shows the stage as stopped, not as an error.",
  exp_zh="停止時應說明會停止什麼及已用點數是否損失，並顯示已停止而非錯誤。",
  links=["pm-main-flow"],
  log=("Stop during the cast confirmation: turn cancelled, error text shown", [
    ("TC-154 ✓ 04:14:10, Stop 04:14:25", "2026-10-29", "04:14:05", "04:14:45")]),
  imgs=[("h-tc154-running", "amda59_thinking"), ("h-tc154-tap", "amda59_error_after_stop")]),
]

# Same-OS matches: the case and the Android ticket it repeats (dedupe.txt only; no card, no recheck row).
# The first block comes from the A2 batch (its 40 filed bugs and its dedupe.txt); the second was matched in this batch.
SAME_CASES = {
 # filed from A2 (DRA262610P0324–P0363)
 "TC-014": ("DRA262610P0324", "Surprise me appends the same inspiration"), "TC-024": ("DRA262610P0325", "first outline card title"),
 "TC-036": ("DRA262610P0326", "Other twice under Gender"), "TC-039": ("DRA262610P0327", "◆4 price on the sheet (subtitle: ISS-AMDA-50)"),
 "TC-040": ("DRA262610P0327", "◆4 not ◆6"), "TC-047": ("DRA262610P0327", "◆4 not ◆6"), "TC-045": ("DRA262610P0328", "no character count"),
 "TC-350": ("DRA262610P0328", "no 「• 2 characters」"), "TC-121": ("DRA262610P0329", "X on the ready sheet applies the looks"),
 "TC-527": ("DRA262610P0329", "system Back on the ready sheet applies the looks, as X"),
 "TC-337": ("DRA262610P0330", "Leave anyway drops paid looks"), "TC-348": ("DRA262610P0331", "other question, one chip"),
 "TC-349": ("DRA262610P0333", "update messages"), "TC-352": ("DRA262610P0333", "update result copy"),
 "TC-351": ("DRA262610P0334", "Back during an update"), "TC-051": ("DRA262610P0335", "editor cuts to 1,000"),
 "TC-125": ("DRA262610P0336", "drag opens the editor"), "TC-057": ("DRA262610P0337 / DRA262610P0262", "X saves without dialog"),
 "TC-134": ("DRA262610P0337 / DRA262610P0262", "no Discard dialog"), "TC-339": ("DRA262610P0337 / DRA262610P0262", "no Discard dialog"),
 "TC-340": ("DRA262610P0262", "no Discard dialog"), "TC-342": ("DRA262610P0337 / DRA262610P0262", "no Discard dialog"),
 "TC-401": ("DRA262610P0337 / DRA262610P0262", "no Discard dialog"), "TC-341": ("DRA262610P0338", "no Discard button"),
 "TC-058": ("DRA262610P0339", "delete dialog copy"), "TC-377": ("DRA262610P0340 / DRA262610P0122 / DRA262610P0197", "stage copy, user bubble"),
 "TC-405": ("DRA262610P0340 / DRA262610P0226", "no in-place card / 「Making your video…」"),
 "TC-512": ("DRA262610P0341", "■ stop button"), "TC-157": ("DRA262610P0341", "video Stop silent; no Stop in stage ②"),
 "TC-515": ("DRA262610P0342", "video stage ① exits"), "TC-516": ("DRA262610P0342", "video stage ① exits"),
 "TC-513": ("DRA262610P0343", "stage ② 「Stop and lose your credits?」"), "TC-514": ("DRA262610P0344", "storyboard resumes only on reopen"),
 "TC-374": ("DRA262610P0349", "↓ centred"), "TC-344": ("DRA262610P0350", "view follows the reply"),
 "TC-101": ("DRA262610P0351", "chat keeps the scroll position"), "TC-102": ("DRA262610P0351", "chat keeps the scroll position"),
 "TC-311": ("DRA262610P0351", "chat keeps the position after Full Edit"), "TC-106": ("DRA262610P0352 / DRA262610-0063", "template drama title / thumbnail"),
 "TC-113": ("DRA262610P0346 / DRA262610P0347", "chats reopen at the top"), "TC-115": ("DRA262610P0354", "no 「You'll have N left」"),
 "TC-308": ("DRA262610P0358", "push uses the old name"), "TC-517": ("DRA262610P0359", "Back while producing asks to leave"),
 "TC-343": ("DRA262610P0360 / DRA262610P0243 / DRA262610P0219", "export sheet + producing page"),
 "TC-169": ("DRA262610P0361", "~68 s outline wait"), "TC-171": ("DRA262610P0361", "~41 s revision wait"),
 "TC-172": ("DRA262610P0361", "~75 s storyboard wait"), "TC-173": ("DRA262610P0361", "~160 s video prep wait"),
 "TC-081": ("DRA262610P0362", "no 「Get notified」 pre-prompt"),
 # A4-j (fresh installs, 2026-10-29): same defect as TC-081, still on Android
 "TC-303": ("DRA262610P0362", "fresh install #2: no 「Get notified」 pre-prompt on the first video, so Notify me could not be tried"),
 "TC-304": ("DRA262610P0362", "fresh install #3: no 「Get notified」 pre-prompt on the first video, so system Back / Not now could not be tried"),
 # earlier Android tickets (A2 dedupe.txt)
 "TC-410": ("DRA262610-0045", "unchecked checkbox grey"), "TC-044": ("DRA262610P0174", "assistant claims a storyboard"),
 "TC-447": ("DRA262610P0174", "template replies claim a finished storyboard"), "TC-469": ("DRA262610P0210", "photo overrides Age"),
 "TC-126": ("DRA262610P0135", "AI Suggestion = role line, attributes unset"), "TC-407": ("DRA262610-0015", "AI Suggestion copies the role line"),
 "TC-408": ("DRA262610-0024", "Female setting gives a man"), "TC-383": ("DRA262610P0147", "outside tap while generating does nothing"),
 "TC-060": ("DRA262610P0198", "3 credits per image"), "TC-070": ("DRA262610P0198", "◆3 not ◆6"), "TC-072": ("DRA262610P0198", "◆3 per image"),
 "TC-061": ("DRA262610P0077", "storyboard stage ① exits"), "TC-062": ("DRA262610P0077", "storyboard stage ① exits"),
 "TC-063": ("DRA262610P0077", "storyboard stage ① exits"), "TC-398": ("DRA262610P0077", "storyboard stage ① exits"),
 "TC-399": ("DRA262610P0077", "storyboard stage ① exits"), "TC-294": ("DRA262610P0077", "chat update stage ① Back"),
 "TC-359": ("DRA262610P0077 / DRA262610P0195 / DRA262610P0116", "stage ① exits; History state"),
 "TC-385": ("DRA262610P0134", "no per-scene skeletons"), "TC-073": ("DRA262610P0134 / DRA262610P0199", "image change not applied"),
 "TC-458": ("DRA262610P0199", "image change not applied"), "TC-074": ("DRA262610P0199 / DRA262610P0027", "no new TTS / preview"),
 "TC-443": ("DRA262610P0169", "Chinese preview captions split"), "TC-282": ("DRA262610-0050", "English scripts use 「」"),
 "TC-419": ("DRA262610P0072", "text behind the header"), "TC-108": ("DRA262610P0047", "rename keeps the place"),
 "TC-111": ("DRA262610-0046", "delete body has no title"), "TC-079": ("DRA262610P0222", "no 「Model • Seedance」 row"),
 "TC-080": ("DRA262610P0274", "Best priced as Standard"), "TC-086": ("DRA262610P0159", "full offer 60 sec"),
 "TC-417": ("DRA262610P0069", "Full Edit re-entry makes a new project (status NAB)"), "TC-423": ("DRA262610P0084", "Full Edit Export asks Pro for captions"),
 "TC-506": ("DRA262610P0286", "player ≠ highlighted clip"), "TC-510": ("DRA262610P0297", "strip does not follow"),
 "TC-422": ("DRA262610P0083 / DRA262610P0276", "downloads named reftovideo_…"), "TC-090": ("DRA262610P0083 / DRA262610P0276", "downloaded clips without captions"),
 "TC-492": ("DRA262610P0244", "Chinese caption pages split words"), "TC-507": ("DRA262610P0288", "end of a long Chinese line dropped"),
 "TC-481": ("DRA262610P0230", "no progress bar in the player"), "TC-490": ("DRA262610P0240", "next episode burns in captions"),
 "TC-418": ("DRA262610P0071", "Full Edit text missing from the export"), "TC-153": ("DRA262610-0049", "outline Stop silent"),
 "TC-155": ("DRA262610-0049 / DRA262610P0348", "revision Stop silent"), "TC-156": ("DRA262610-0057", "storyboard Stop; charges after the cancel"),
 "TC-471": ("DRA262610P0213", "no stopped note / Try again"), "TC-170": ("DRA262610-0032 / DRA262610P0302", "~55 s cast-confirm wait"),
 "TC-415": ("DRA262610P0065", "no cue for more templates"), "TC-503": ("DRA262610P0268", "template chat stops after the outline"),
 "TC-461": ("DRA262610P0202", "Glad We Came looks vs outline"), "TC-459": ("DRA262610P0200", "JP Dog: Shiro dropped"),
 "TC-462": ("DRA262610P0203", "EN Dog: Murphy dropped, no cast"), "TC-289": ("DRA262610-0019 (Close)", "see HELD: result conflicts with TC-288"),
 # matched in this batch (Android pool read 2026-10-29)
 "TC-015": ("DRA262610P0127 (Cancelled)", "no counter / inline 1,000-character message"),
 "TC-016": ("DRA262610P0127 (Cancelled)", "no inline limit message"), "TC-017": ("DRA262610P0127 (Cancelled)", "no counter"),
 "TC-414": ("DRA262610P0063", "format question gone after Generate"), "TC-468": ("DRA262610P0209", "message during the format card applies defaults"),
 "TC-488": ("DRA262610P0237", "format card resets to English + captions"), "TC-448": ("DRA262610P0178", "two headers over the slots"),
 "TC-497": ("DRA262610P0254", "quoted lines / scene count dropped"), "TC-508": ("DRA262610P0290", "descriptions are role-only"),
 "TC-452": ("DRA262610P0184", "template chat leaves with no dialog and is saved"), "TC-480": ("DRA262610P0229", "Add New regenerates at once"),
 "TC-500": ("DRA262610P0257", "failed character's Text to Speech −1 not refunded"), "TC-477": ("DRA262610P0224", "no gender-mismatch warning"),
 "TC-487": ("DRA262610P0236", "same look for two roles, no warning"), "TC-429": ("DRA262610P0332", "chat request gives no Update characters card"),
 "TC-478": ("DRA262610P0225", "nothing prefilled from the outline (PM)"), "TC-470": ("DRA262610P0211", "send button stays Stop"),
 "TC-504": ("DRA262610P0273", "Credit Details −60 for a −120 video"), "TC-479": ("DRA262610P0227", "no card label; preview card replaced (PM)"),
 "TC-436": ("DRA262610P0156 / DRA262610P0154", "outfit continuity in the video"), "TC-307": ("DRA262610P0368", "push opens History"),
 "TC-163": ("DRA262610P0348", "revision turn vanishes after a reopen"),
}

HELD = [
 ("TC-103", "question (PM)", "After swapping a look while the Create storyboard card is offered, no 「Characters updated! Regenerate the storyboard to match?」 appears (A2 passed it with a storyboard already made). The spec draws the prompt, but Android ticket DRA262610P0299 ([UX], PM, NewCreated) asks that a swapped actor keep the card with no new assistant turn, which is what 2610212 now does. PM to say which applies before the storyboard exists."),
 ("TC-265", "question (PM)", "Family & Life template 2 is named 「Proposal Across Lifetimes」 on the Android Stage CMS, not 「Proposal Across Every Lifetime」 (spec, table, iOS runs, A2). Intended rename?"),
 ("TC-158", "question (PM)", "An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row (held in A2 too)."),
 ("TC-467", "question (PM)", "Exported captions of The New Guy's Secret are all dialogue (no narration line), one size; the spec gives no caption size (held in A2 too)."),
 ("TC-289", "recheck (result conflict)", "TC-289 records no 「White」 in the Ethnicity filter (screenshot shows only the first three chips of a row that scrolls sideways), while TC-288 in the same run found White with 14+ looks. Not drafted; if White is really missing it matches DRA262610-0019 (Close), which would make it a closed-ticket-is-back entry. A4-j did not reach it; recheck in the next round."),
]

NOT_BUG = [
 ("Buy More", "My Credits › Buy More shows the raw 「Get %1$s Credits for %2$s」 with empty packs (logcat getProductDetails null) (A4-a2)", "Sideloaded TR APK with no Play billing product details on this phone; recheck on a Play-installed build before raising."),
 ("Claim popup", "Daily Claim popup reads 「-- free credits」 (A4-a2)", "Matches the old Credit System behaviour DRA242407-0017 (ProposeNAB, 「Credits shows -- …」); not an AI Mini Drama finding."),
 ("Update characters ◆4", "Update characters made a new Malik look but the cast kept the old one (A4-b1)", "Single sighting with no frame of the cast after it; recheck."),
 ("More than one person", "「More than one person detected」 dialog on a group reference photo (A4-c2)", "Expected guard (TC-366 context), recorded only."),
 ("Stage ① pause", "Leaving AI Mini Drama during video stage ① or a storyboard pauses the job until the chat is reopened (A4-g3, A4-h)", "Same as DRA262610P0026 (NewCreated, PM) and DRA262610P0344 (filed A2): Android duplicates."),
 ("Storyboard failure", "Real storyboard failure (Gemini UNAVAILABLE, 01:12:56) showed no error or Try again in chat; nothing charged (A4-g2)", "Same as DRA262610P0234 / P0100 family (Android tickets on silent generation failures); one sighting, no case row failed on it."),
]

# ---- A4 batch writer (adapted from the A2 batch's main) ----
DUPS = {}
E_ALL = E
DUPMARK = "Android duplicate (dedupe.txt only)"
INTERIM = ("**Final (2026-10-29):** all 486 cases recorded (A4-j ran 08:51–09:34 on three fresh installs). "
           "A4-j added two Fail rows, TC-303 and TC-304 (no 「Get notified」 pre-prompt on the first video), both the same "
           "Android defect as TC-081 → DRA262610P0362 (dedupe.txt only); no new entry.")


def link_lines(e):
    out = []
    for x in e.get("links") or []:
        if x.startswith("Spec Link:"):
            out.append(x)
        elif x.startswith("ds-"):
            out.append(ds(x))
        elif x.startswith("pm-"):
            out.append(pm(x))
    return out or links_for(e["cases"])


def recheck_tickets():
    out = set()
    for t, _ in SAME_CASES.values():
        for part in re.findall(r"DRA26\d+(?:-|P)\d+", t):
            out.add(part)
    return out


def build_map():
    m = {}
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for e in E:
        for c in e["cases"]:
            m.setdefault(c, []).append(f"{num[e['iss']]}. {e['iss']}")
    for c, (t, why) in SAME_CASES.items():
        if c == "TC-289":
            continue
        m.setdefault(c, []).append(f"{DUPMARK}: {t}")
    for c, d, _ in HELD:
        m.setdefault(c, []).append(f"held: {d}")
    for c, _, _ in NOT_BUG:
        m.setdefault(c, []).append("not raised")
    return {k: "; ".join(dict.fromkeys(v)) for k, v in m.items()}


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
    obs = [k for k, _, _ in NOT_BUG]
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
    w(f"# AI Mini Drama (Android) — eBug drafts, phase A4 (table v3), PDR-A {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/ai-mini-drama/android/runs/2026-10-28-a4-full/` — phase A4 of draft `drafts/20261028-164930` (table v3, {len(rows)} cases), 2026-10-28 17:38 → 10-29 06:12 on {DEVICE[8:]} through Appium / UiAutomator2, {TR}, Stage server, account 「ethan.hsu.cl」 (Free). Tally: " + ", ".join(f"{v} {k}" for k, v in tally.items()) + ".")
    w("")
    w(INTERIM)
    w("")
    w("**Status:** nothing filed, uploaded or commented. Filing defaults from the newest filed batch (`ebug-defaults.ts ai-mini-drama android`: 2026-10-27-a2, Creator ETHAN_HSU, TR261021-0082, [AIAgent], API) are prefilled on the review page for confirmation. Dedupe was read-only, Android pool only (dedupe per OS, user 2026-10-28).")
    w("")
    w("Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (RD, 2026-10-21). Android has no fault switches in 16.8, so failure entries rest on real failures (named in each QA note).")
    w("")
    nrt = len(recheck_tickets())
    w(f"**What is drafted:** {len(E)} new entries (ISS-AMDA-47…{E[-1]['iss'][-2:]}), all proposed for filing. {sum(1 for c in fails if MAP[c].startswith(DUPMARK))} Fail rows repeat an existing Android ticket ({nrt} tickets, the 40 A2 bugs DRA262610P0324–P0363 included) and are left out (dedupe.txt only); {len(HELD)} rows are held (PM questions, one result conflict).")
    w("")
    w("Legend — Class: Functional / UI · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD. Every entry links the spec board or Figma frame it is checked against.")
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
        links = link_lines(e)
        if not links:
            sys.exit(f"{e['iss']} has no Spec Link")
        e["_links"] = links
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
        w(""); w("Note:"); w(DEVICE)
        for l in links:
            w(l)
        for r in e.get("rel", []):
            w(r)
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
    w("## Not raised (observations from the segment logs, for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in NOT_BUG:
        w(f"| {k} | {a} | {b} |")
    bd = {}
    for r in blocked:
        bd[r["Disposition"]] = bd.get(r["Disposition"], 0) + 1
    w(f"| Blocked ({len(blocked)}) | " + ", ".join(f"{v} {k}" for k, v in sorted(bd.items())) + " | No verdict (reasons grouped on the plan page; run folder blocked-reasons.json). |")
    w("")
    w("## Reconciliation against the run")
    w("")
    nq = sum(1 for f in fails if disp[f] == "question")
    w(f"{len(fails)} Fail ({len(fails) - nq} defect, {nq} question), {len(blocked)} Blocked, {tally.get('Not run', 0)} Not run, {len(obs)} observations from the segment Log lines (the run has no observations.md).")
    w("")
    kinds = {"entry": [], "dup": [], "held": [], "notbug": []}
    for k, v in MAP.items():
        if re.search(r"\d+\. ISS-AMDA", v):
            kinds["entry"].append(k)
        elif v.startswith(DUPMARK):
            kinds["dup"].append(k)
        elif v.startswith("held"):
            kinds["held"].append(k)
        else:
            kinds["notbug"].append(k)
    tot = len(fails) + len(obs)
    w("| Step | Count | Running total |")
    w("|---|---|---|")
    w(f"| Fail rows + observations | {tot} | {tot} |")
    run = tot
    run -= len(kinds["dup"]); w(f"| → matches an existing Android ticket only (dedupe.txt, not listed) | −{len(kinds['dup'])} | {run} |")
    run -= len(kinds["held"]); w(f"| → held (PM question, result conflict) | −{len(kinds['held'])} | {run} |")
    run -= len(kinds["notbug"]); w(f"| → not raised | −{len(kinds['notbug'])} | {run} |")
    w(f"| → merged: {run} rows share {len(E)} defects | −{run - len(E)} | **{len(E)} entries** |")
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
    w("By severity: " + ", ".join(f"**{i}**" for s in (1, 2, 3, 4) for i, e in enumerate(E, 1) if e["sev"] == s) + ". Nothing is filed until the review page's decisions come back.")
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries, {len(kinds['dup'])} rows as Android duplicates ({nrt} tickets), {len(HELD)} held → {OUT}/{NAME}.md")
    for n, e in enumerate(E, 1):
        print(n, e["iss"], "|", " || ".join(l[11:100] for l in e["_links"]))


if __name__ == "__main__":
    main()

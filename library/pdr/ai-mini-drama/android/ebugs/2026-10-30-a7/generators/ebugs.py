#!/usr/bin/env python3
"""Build the AI Mini Drama Android eBug draft batch for phase A7 (table v6, draft 20261029-152721) on 16.8.0 (2610212).

Writes library/pdr/ai-mini-drama/android/ebugs/2026-10-30-a7/20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0.md, the sibling
_images/ folder (one NN_ISS-ID folder per entry: JPEGs named 16.8.0_<slug>.jpg plus the logcat excerpt where the finding
is failure-related or a log shows the cause) and logs/. The ISS-AMDA sequence continues after A4 (ISS-AMDA-60 on). Nothing is
filed. Every Fail row of results.csv and every observation O-n is mapped (entry / recheck of an existing ticket / held PM
question / not a bug); the script stops when one is missing.
"""
import csv, json, os, re, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import logx

REPO = logx.REPO
ROOT = f"{REPO}/library/pdr/ai-mini-drama/android"
RUN = logx.RUN
OUT = f"{ROOT}/ebugs/2026-10-30-a7"
NAME = "20261030_eBug_drafts_AI-Mini-Drama-A7_16.8.0"
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


# ---- A7 entries (phase A7, table v6, draft 20261029-152721). ISS-AMDA continues after A4's ISS-AMDA-59. ----
# Only findings with no open Android ticket of their own are entries (dedupe per OS, user 2026-10-28); everything else is in
# SAME_CASES below and dedupe.txt. A closed Android ticket whose bug is back stays an entry naming it.

MX_URL = "https://www.figma.com/design/3urWYejMUP2uaglb4s73M5/PDRM-MX"
MX_LINK = (f"Spec Link: PDRM MX spec, v1 ③ Credit Charging Table (action id) board (mx-a-right), linked sheet 「AI Mini Drama CMS」 › "
           f"「Action ID (not on CMS)」 (2026-10-20) - {MX_URL}?node-id=1057-24035")
PM_INTRO = "Spec Link: AI Mini Drama PM spec, main flow 「Demo page_Straight video」 frame - https://www.figma.com/design/44RyrcOcWi2MvhGci9bO5F/AI-Mini-Drama?node-id=2283-10856"
NOIMG = APP + ["Tap History", "Tap a drama whose storyboard has a scene with no image (Edit shown)", "Tap that scene on the Storyboard Result card"]
FAILSB = APP + ["Tap History", "Tap a drama whose storyboard has a failed scene", "Tap the failed scene on the Storyboard Result card"]

E = [
 dict(iss="ISS-AMDA-60", title="Failed storyboard images say credits were refunded but the 15 credits never return", cls="Functional", sev=2, owner="RD",
  cases=["TC-465", "O-6"], rep=(1, 2),
  note="R-057 (PM update 6: a failed scene image shows 「Couldn't create image / Your credits have been refunded…」) and the refund rule (rule 8, §13.10). Run on a REAL failure (no fault switch on Android 16.8): Romance (1) storyboard ◆34, Wi-Fi off over USB 20:09:21–20:09:48 during the scene images (restored right after). logcat: 5 scene images were charged ◆3 each at 20:09:15–20:09:20 (MyCreation receipts img_1…img_5, totalRemain 14790 → 14775), then failed at 20:09:22–25 (MiniDramaFail [TextToImage] generation_failed … tti=query_status_failed). Each failed image's MyCreation receipt is then marked 「completed」 (receipt completed call=…img_N right after each failure), which may be why no refund is booked. Every failed scene says 「Your credits have been refunded.」 but no refund arrived: no 「Generation failed, credits returned」 row in Credit Details / getCreditHistory and no balance rise at 20:22, 20:40 and 20:44 (35 min later). Missing ◆15. The same run's first failure (The Art of Falling Scene 4, server error_code 4000, A7-d1) WAS refunded +3 within seconds, so the refund fails when the failure is the client's status query during a network drop (query_status_failed): the server may have finished or never marked the jobs failed while the app tells the user the credits came back. Closest Android ticket DRA262610P0308 (Assigned: 5 of 6 storyboard images fail, Credit Details shows only 2 refunds) — a server-side failure with partial refunds; this entry is the network-drop path with none refunded and the refund message shown anyway. Reviewer: hold it if you judge it the same as P0308.",
  short="Failed storyboard images claim a refund, but the 15 credits never return",
  steps=APP + ["Tap History", "Tap a drama at 「Ready to create the storyboard?」", "Read the balance on the credit pill",
               "Tap Generate on the Create storyboard card", "Turn Wi-Fi off while the scene images are being created", "Wait 30 seconds",
               "Turn Wi-Fi on", "Wait for the storyboard to finish", "Tap a failed scene on the Storyboard Result card", "Tap ✕",
               "Wait 30 minutes", "Tap the credit pill", "Tap Details"],
  res="5 scene images fail after a charge of 3 each; each says credits were refunded, but none come back after 35 min.",
  res_zh="5 張場景圖扣點後失敗並顯示已退款，35 分鐘後仍未退回 15 點。",
  exp="Each failed image's 3 credits are returned and Credit Details shows 「Generation failed, credits returned」.",
  exp_zh="每張失敗圖片退回 3 點，Credit Details 顯示退款紀錄。",
  links=[pm("pm-update-6"), ds("ds-storyboard")],
  rel=["Related: DRA262610P0308 (5 of 6 storyboard images fail, only 2 refunds)"],
  log=("Storyboard ◆34 with a Wi-Fi drop: 5 scene images charged ◆3, then failed (query_status_failed); no refund afterwards", [
    ("charges and failures, Generate ~20:09:05", "2026-10-29", "20:09:10", "20:09:30"),
    ("balance and credit history 20:40 and 20:44 (no returned record)", "2026-10-29", "20:40:45", "20:40:50", r"getCreditHistory"),
    ("credit history re-read at the A7-e start", "2026-10-29", "20:44:15", "20:44:25", r"getCreditHistory")]),
  imgs=[("d2-failscene", "amda60_failed_scene_refunded"), ("d2-details2", "amda60_details_no_return"), ("e-refund-details", "amda60_details_35min_later")]),

 dict(iss="ISS-AMDA-61", title="Video prices are below the charging sheet's original prices", cls="Functional", sev=2, owner="RD",
  cases=["TC-080", "TC-230", "O-17"], rep=(3, 3),
  note="R-069 (changed 2026-10-29, REQ-059: the user ruled that the MX ③ charging sheet's ORIGINAL prices are the expected prices; the promotion price is held): Seedance 2.0 (1080p) 13 credits per second, Seedance 2.0 Mini (720p) 4 per second, Seedance 2.5 keeps PM 10/16's 6 per second (the sheet has no 2.5 row). The build quotes and charges PM 10/16's older rates: Glad We Came (A7-g1 22:08) Preview • 30 sec Best ◆120 / Standard ◆120 / Fast ◆60, Full Video 90 sec ◆360 / ◆360 / ◆180; Corporate Rivalry card the same (A7-f TC-230); charged as shown (Standard preview 22:11:57: logcat RefToVideo credit action_id=genvideo_1_sec_bytedance_seedance2.0std_none_480p_aiminidrama perSecond=4 unit=15 total_credit=60 per 15-s clip; the sheet's id is genvideo_1_sec_bytedance_seedance2.0std_enable_1080p_aiminidrama_normal). A 15-s scene regeneration from the chat cost ◆60 (O-17; sheet ◆195). Expected vs app: Standard ◆390 / ◆1170 vs ◆120 / ◆360; Fast ◆120 / ◆360 vs ◆60 / ◆180; Best ◆180 / ◆540 vs ◆120 / ◆360. Related, not duplicates: DRA262610P0274 (PM, NewCreated: Best and Standard quote the same — still true), DRA262610P0327 (character ◆4 vs ◆6) and DRA262610P0198 (storyboard rate) cover the other actions of TC-230 and are listed only in dedupe.txt; DRA262610P0032 (Cancelled: a 720p request billed under a 480p action id). RD may forward to PM if the sheet is not the price to ship.",
  short="Video is priced below the charging sheet: Standard 30 s is 120 credits, not 390",
  steps=APP + ["Tap History", "Tap a drama at 「Choose your video settings」", "Tap Best", "Tap Standard", "Tap Fast",
               "Tap Full Video - 90 sec", "Tap Best", "Tap Standard", "Tap Fast", "Tap Preview - 30 sec", "Tap Standard", "Tap Generate video",
               "Read the balance on the credit pill"],
  res="Preview 30 s: Best 120, Standard 120, Fast 60; Full 90 s: 360 / 360 / 180; charged as shown (4 per second).",
  res_zh="試看：120 / 120 / 60；完整：360 / 360 / 180，並依此扣點。",
  exp="PDRM MX charging sheet: Standard 13 per second (390 / 1170), Fast 4 (120 / 360), Best 6 (180 / 540).",
  exp_zh="應為計費表原價：Standard 每秒 13、Fast 每秒 4、Best 每秒 6 點。",
  links=[MX_LINK, link_for("R-069") or pm("pm-main-flow")],
  rel=["Related: DRA262610P0274 (Best and Standard quote the same credits)", "Related: DRA262610P0032 (Cancelled)"],
  log=("Standard Preview 30 s: two 15-s clips billed at perSecond=4 under the 480p action id", [
    ("Glad We Came Generate video (Standard, Preview 30 sec)", "2026-10-29", "22:11:55", "22:12:00", r"total_credit")]),
  imgs=[("g1-tc080-Prev-Best", "amda61_preview_best"), ("g1-tc080-Prev-Standard", "amda61_preview_standard"),
        ("g1-tc080-Prev-Fast", "amda61_preview_fast"), ("g1-tc080-Full-Standard", "amda61_full_standard")]),

 dict(iss="ISS-AMDA-62", title="Scene regenerate shows a raw debug toast to the user", cls="UI", sev=3, owner="RD",
  cases=["TC-428", "TC-275", "O-2"], rep=(2, 2),
  note="QA rule 7 (R-149, team rule: every product-authored text is free of errors and untranslated strings) on the PM update 6 / Design storyboard failure states, which give the user-facing copy (「Couldn't create image」 card) and no toast. Seen twice in A7-d1/d2: (1) Art of Falling Scene 4 regenerating › X › Leave anyway 19:16:45 → toast 「MiniDrama FAIL [scene regenerate]: turn failed」 (logcat cancel_turn, final_state=cancelled; nothing charged); (2) Romance (1) Scene 5 › Edit › Done › Regenerate Image with Wi-Fi off 20:14:40 → toast 「MiniDrama FAIL [scene regenerate]: shot=beat_1bcf94cc | turn failed」 (logcat final_state=block; the service-busy copy on that path is DRA262610P0123, not repeated). Related, closed: DRA262610P0212 (Close — the same raw 「MiniDrama FAIL」 toast after stopping the outline); the toast is back on the scene-regenerate path, so this is a new entry naming it (closed-ticket rule, user 2026-10-28).",
  short="Leaving a scene regenerate shows a raw 「MiniDrama FAIL」 debug toast",
  steps=FAILSB + ["Tap Edit", "Tap Regenerate Image", "Tap X while the image regenerates", "Tap Leave anyway", "Look at the bottom of the chat"],
  res="Back in the chat a toast reads 「MiniDrama FAIL [scene regenerate]: turn failed」.",
  res_zh="聊天出現除錯 toast「MiniDrama FAIL … turn failed」。",
  exp="No debug text reaches the user; a stopped regenerate shows no error toast.",
  exp_zh="不應向使用者顯示除錯文字。",
  links=[pm("pm-update-6"), ds("ds-storyboard")],
  rel=["Related: DRA262610P0212 (Close)"],
  log=("Scene regenerate: cancelled turn (Leave anyway) and offline turn, each followed by the MiniDramaFail toast text", [
    ("Leave anyway on Scene 4 regenerate", "2026-10-29", "19:16:38", "19:16:50"),
    ("Regenerate Image with Wi-Fi off (TC-428)", "2026-10-29", "20:14:35", "20:14:45")]),
  imgs=[("d1-tc378c", "amda62_debug_toast")]),

 dict(iss="ISS-AMDA-63", title="A finished video sends one 「Your drama is ready」 push per clip", cls="Functional", sev=3, owner="RD",
  cases=["TC-307", "O-11"], rep=(3, 3),
  note="R-170 (PM 09/30 updates §6.3: in the background a finished video sends ONE push 「Your drama is ready」 / 「\"{Drama title}\" is done. Tap to watch it.」). A7-g3 Trust Renamed full episode ◆240, Generate 01:01:53, app sent Home 01:02:34: FCM delivered the push four times, once per clip (01:08:57, 01:09:17, 01:10:57, 01:11:13), all shown in the shade; the turn completed at 01:11:16. A7-g1 the same on Glad We Came (preview twice 22:18:18 / 22:19:32, full four times 22:28–22:29) and The Art of Falling (twice). The earlier pushes say the drama is done while clips are still generating. A4 saw two deliveries with one notification shown. Tapping the push opens History (DRA262610P0368, not repeated); the in-app banner shown before the full finished is DRA262610P0379 (TC-085, not repeated).",
  short="One video sends a 「Your drama is ready」 push per clip, four for one episode",
  steps=APP + ["Tap History", "Tap a drama with a finished 30-second preview", "Tap Generate on 「Create the full episode (60 sec)」",
               "Tap the Home button", "Wait 15 minutes", "Swipe down from the top of the screen"],
  res="Four 「Your drama is ready」 pushes arrive for one full episode, one per clip, the first while clips still generate.",
  res_zh="一集收到四則完成推播（每段一次），首則送出時仍在產生。",
  exp="One push 「Your drama is ready」 / 「\"<title>\" is done. Tap to watch it.」 when the whole video is finished.",
  exp_zh="整部影片完成時只推播一次。",
  links=[pm("pm-0930-updates")],
  rel=["Related: DRA262610P0368 (push opens History)", "Related: DRA262610P0379 (banner while still generating)"],
  log=("Trust Renamed full episode: four FCM pushes, one per clip, before the turn completes", [
    ("Generate 01:01:53, Home 01:02:34", "2026-10-30", "01:08:50", "01:11:20")]),
  imgs=[("g3-307a", "amda63_push_stack")]),

 dict(iss="ISS-AMDA-64", title="Scene description editor at the 1,000-character limit shows no red counter or message", cls="UI", sev=3, owner="RD",
  cases=["TC-312"], rep=(1, 1),
  note="R-174 (PM update 3 §13.11; Design storyboard / video editors 967/1000): the 1,000-character limit applies to every description input including the scene image description: red 「1000/1000」, extra input ignored, pasted text cut, 「You've reached the 1,000-character limit.」. A7-d2 Romance (1) Scene 4 (failed) › Edit: editor 570/1000; a 1,000-character text and a 1,050-character text were entered with the test driver's text entry (not the clipboard), 「XYZ」 typed on the keyboard: the text stops at 1,000 (ends 「…while Mal」) — that part works — but the counter stays white 「1000/1000」 and no limit message appears. Related, not duplicates: DRA262610P0127 (Cancelled: the idea input's 1,000-character warning), DRA262610P0149 (Close: editor text touching the counter), DRA262610P0335 (character description editor).",
  short="Scene description editor at 1,000 characters: no red counter or limit message",
  steps=NOIMG + ["Tap Edit", "Tap the description", "Enter a 1,000-character description (test driver text entry)", "Type XYZ",
                  "Enter a 1,050-character description (test driver text entry)"],
  res="The text stops at 1,000 characters, but the counter stays white 「1000/1000」 and no limit message appears.",
  res_zh="文字停在 1,000 字，但計數器仍為白色「1000/1000」，也沒有上限提示。",
  exp="The counter turns red 「1000/1000」 and 「You've reached the 1,000-character limit.」 shows.",
  exp_zh="計數器應變紅並顯示「You've reached the 1,000-character limit.」。",
  links=[pm("pm-update-3"), ds("ds-storyboard")],
  rel=["Related: DRA262610P0127 (Cancelled)"],
  imgs=[("d2-tc312b", "amda64_counter_white")]),

 dict(iss="ISS-AMDA-65", title="A Mine character's face turns about 25 years younger in the full episode", cls="Functional", sev=2, owner="RD",
  cases=["TC-438"], rep=(1, 1),
  note="PM main flow intro (R-472): 「Turn your idea into a video—same characters, same voices, every scene.」; closed Android ticket DRA262610-0041 (Close, fixed in 16.8.0.2610212: 「A character should keep the same face and hair in every clip」). A7-g2 Hidden Identity (The New Guy's Secret › Make my version; Jenna = the Mine East Asian grey-bob chef look, about 55; English, no captions; Fast = Seedance 2.0 Mini): in the preview clips 1–2 Jenna matches her portrait, but in the full episode's clips 3–6 she is a woman of about 30 with the same grey bob and chef coat (clip 4 loading dock, clip 6 warehouse), although the shot prompt says 「JENNA's face, build, hair, and chef workwear remain fixed across all cuts」 (logcat 23:35:10). Noah, Caleb and Richard keep their looks; nobody takes another's look. TC-438's own path (Three Kingdoms template, Character B vs C) is not on this account; this entry rests on the closed ticket coming back on 2610212 (closed-ticket rule, user 2026-10-28) and the PM promise, not on that row's B/C check. Related: DRA262610P0161 (ProposeNAB, wrong image on Character B), DRA262610P0156 / P0154 (outfit continuity).",
  short="A Mine character's face turns about 25 years younger in the full episode's clips",
  steps=APP + ["Tap History", "Tap a drama whose cast uses a Mine look of a woman about 55, with a finished 30-second preview",
               "Tap Generate on 「Create the full episode (60 sec)」", "Wait for 「Here's your drama.」", "Tap Play drama",
               "Tap clip 1 in the clip strip", "Tap clip 3 in the clip strip", "Tap clip 4 in the clip strip", "Tap clip 6 in the clip strip"],
  res="Jenna is about 55 in the preview's clips 1–2 but about 30, with the same grey bob, in the full episode's clips 3–6.",
  res_zh="Jenna 在試看片段 1–2 約 55 歲，但在完整版片段 3–6 變成約 30 歲（髮型相同）。",
  exp="A character keeps the face of its portrait in every clip of the drama.",
  exp_zh="角色在每個片段都應維持其角色圖的臉孔。",
  links=[PM_INTRO, ds("ds-video")],
  rel=["Related: DRA262610-0041 (Close)", "Related: DRA262610P0161 (ProposeNAB)"],
  log=("Full episode clips: the shot prompt asks for Jenna's face to stay fixed", [
    ("Hidden Identity full episode dispatch", "2026-10-29", "23:35:05", "23:35:15", r"remain fixed")]),
  imgs=[("g2-tc438-jenna", "amda65_jenna_clips"), ("g2-hid-frames4", "amda65_frames")]),

 dict(iss="ISS-AMDA-66", title="Updating two characters in chat charges and regenerates three", cls="Functional", sev=2, owner="RD",
  cases=["TC-350"], rep=(2, 2),
  note="R-254 (PM update 7, 10/16): a priced 「Update characters」 card charges one character × count. A7-b2 Trapped Together (4 characters set, no storyboard): 「Please change the looks of two characters: make Tessa Shaw and Marcus Vance both look about 50 years old.」 → card ◆12 = 3 × the one-character ◆4 (TC-349), Generate 17:49:11: logcat pre-approved 'character': {IMAGE=3, VOICE=3}, receipts img_1 / img_3 / img_5 (◆3) + tts_2 / tts_4 / tts_6 (◆1), 15019 → 15007; the result shows Oriana Wynn regenerated too (grey hair) besides Tessa and Marcus. A4 (TC-350) saw the same 3-for-2 regeneration; only the missing 「• 2 characters」 label was mapped then (DRA262610P0328, not repeated). At v6 prices 2 × ◆6 = ◆12 matches only by coincidence; the build's own price is ◆4 per character (DRA262610P0327, not repeated).",
  short="Asking to update two characters charges for and regenerates three",
  steps=APP + ["Tap History", "Tap a drama whose four characters are set (no storyboard yet)",
               "Type 「Please change the looks of two characters: make Tessa Shaw and Marcus Vance both look about 50 years old.」",
               "Tap Send", "Read the price on the Update characters card", "Tap Generate", "Wait for the characters to finish"],
  res="The card asks 12 (three × 4) for two characters; three are regenerated, Oriana Wynn too, and 12 are charged.",
  res_zh="要求更新兩位角色，卡片卻收三位的點數（12），並重生了三位角色（含未要求的 Oriana Wynn）。",
  exp="The card charges for the two characters asked for, and only Tessa Shaw and Marcus Vance are regenerated.",
  exp_zh="應只收兩位角色的點數，且只重生 Tessa Shaw 與 Marcus Vance。",
  links=[pm("pm-update-7")],
  rel=["Related: DRA262610P0328 (no character count on the card)"],
  log=("Update characters for two named characters: three images and three voices approved and charged", [
    ("Trapped Together Generate 17:49:11", "2026-10-29", "17:49:05", "17:51:00")]),
  imgs=[("b2-tc350-card", "amda66_card_12"), ("b2-tc350-done", "amda66_three_regenerated")]),
 dict(iss="ISS-AMDA-67", title="Opening AI Mini Drama on a clean install shows no intro page", cls="Functional", sev=3, owner="RD",
  cases=["TC-541", "O-23"], rep=(3, 3),
  note="R-472 (PM main flow 「Demo page_Straight video」 2283:10856, REQ-052; PM-only, no Design frame yet — the Design's Launcher arrow goes straight to the landing, so RD may forward to PM): opening AI Mini Drama from the Launcher shows an intro page 「AI Mini Drama」 / 「Turn your idea into a video—same characters, same voices, every scene.」 with a demo video, volume icon, 「Don't show again」 and 「Try It Now」. A7-a1 (16:06–16:11, upgraded install): three taps on the Launcher 「AI Mini Drama」 shortcut each opened the landing page (「Hi, I'm your AI Drama Assistant」), none of the intro's controls in the page source. A7-j rechecked on three clean installs (adb uninstall + install of 16.8.0 / 2610212 at 09:00, 09:37 and 10:03; signed out on #1 and #3, signed in on #2): the first tap again opened the landing directly, so a stored 「Don't show again」 is ruled out (TC-541 changed from question to defect). Read-only Android dedupe: no intro / demo-page ticket in the Android pool.",
  short="A clean install opens the landing page with no intro page",
  steps=["Uninstall the APP", "Install the APP", "Launch the APP", "Tap AI Mini Drama on the Launcher"],
  res="The landing page opens at once: no intro page, demo video, Don't show again or Try It Now (3 clean installs).",
  res_zh="直接進入首頁，沒有介紹頁、示範影片與「Try It Now」（3 次全新安裝皆同）。",
  exp="An intro page 「Turn your idea into a video—same characters, same voices, every scene.」 with a demo video and Try It Now.",
  exp_zh="應先顯示含示範影片與「Try It Now」的介紹頁。",
  links=[PM_INTRO],
  imgs=[("j1-amd-open", "amda67_landing_no_intro"), ("a1-landing", "amda67_landing_upgrade")]),

 dict(iss="ISS-AMDA-68", title="Template category headers stay English in every app language; template names stay English in Chinese and French", cls="UI", sev=3, owner="Doc",
  cases=["TC-276", "TC-277", "TC-406"], rep=(3, 3),
  note="R-149 (Rule 7: text quality in ENU / CHT / JPN; TC-276 / TC-277 expect no untranslated strings) and R-313 (TR261021-0082 RD Note: the French and Japanese AI Mini Drama UI are fully translated). Run 2026-10-30 10:14–11:01 with `launch --lang` zh-Hant / ja / fr (system locale through the Appium Settings helper; en-US restored after). In all three languages the More page's category headers stay English: Workplace Romance, Fantasy & Destiny, Urban Romance, Family & Life, Animated Stories. In Traditional Chinese and French the template names stay English on the landing, More and Template detail (Merger Season, Forbidden Office Romance, The Art of Falling…), while Japanese shows Japanese names (合併から始まる恋…), so the names are localizable. Not in this entry (existing Android tickets, dedupe.txt only): video settings card, Create storyboard card and agent status lines (DRA262610P0258, RDResolved), filter Gender / Ethnicity options (DRA262610P0284), suggestion chips (DRA262610P0289), assistant replies in English (DRA262610P0248, Propose Wont Fix), English outlines for Japanese (DRA262610P0093). The broad DRA262610P0040 (RDResolved, 2610081: Mini Drama screens stay English) is named as related; reviewer: hold this card if you judge it inside P0040.",
  short="Template category headers and names stay English in Chinese and French",
  steps=["Set the phone's system language to 繁體中文 (台灣)", "Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap 更多",
         "Swipe each template row to its end", "Tap a template"],
  res="Category headers (Workplace Romance…) and template names (Merger Season…) stay English; Japanese names are translated.",
  res_zh="分類標題與範本名稱（Merger Season 等）仍為英文；日文範本名稱已翻譯。",
  exp="Category headers and template names are shown in the app language (Chinese, Japanese, French).",
  exp_zh="分類標題與範本名稱應以 App 語言（中文、日文、法文）顯示。",
  links=[ds("ds-main-flow"), ds("ds-template-detail")],
  rel=["Related: DRA262610P0040 (RDResolved), DRA262610P0258 (RDResolved)"],
  imgs=[("k-cht-more", "amda68_cht_more"), ("k-fr-more", "amda68_fr_more"), ("k-ja-more1", "amda68_ja_headers")]),

 dict(iss="ISS-AMDA-69", title="French copy errors: 「Crédits seront consommés…」 and 「Langage de la vidéo」", cls="UI", sev=3, owner="Doc",
  cases=["TC-406"], rep=(1, 1),
  note="R-313 (TR261021-0082 RD Note: French AI Mini Drama UI fully translated) and R-149 (Rule 7: no spelling, grammar or punctuation errors). French via `launch --lang fr` (2026-10-30 10:52–10:58): the Create storyboard card's credit line reads 「Crédits seront consommés pour cette tâche.」 (no article; 「Des crédits seront consommés pour cette tâche.」); the format card's first heading reads 「1. Langage de la vidéo」 (「langage」 is a register / programming language; the sent summary bubble already says 「Langue de la vidéo」). Read-only Android dedupe: no French copy ticket (DRA262610P0251 is French 「」 quotes, Propose Wont Fix; DRA262610P0039 a caption wrap, Close).",
  short="French copy: 「Crédits seront consommés」 lacks an article; 「Langage de la vidéo」",
  steps=["Set the phone's system language to Français (France)", "Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap Plus",
         "Tap The Art of Falling", "Tap Créer votre version", "Read the format card", "Tap Générer", "Wait for the Create storyboard card"],
  res="The format card reads 「1. Langage de la vidéo」; the storyboard card reads 「Crédits seront consommés pour cette tâche.」",
  res_zh="格式卡為「Langage de la vidéo」；分鏡卡點數說明缺冠詞。",
  exp="「1. Langue de la vidéo」 and 「Des crédits seront consommés pour cette tâche.」",
  exp_zh="應為「Langue de la vidéo」與「Des crédits seront consommés…」。",
  links=[ds("ds-main-flow")],
  imgs=[("k-fr-tchat", "amda69_langage"), ("k-fr-tchat3", "amda69_credits_line")]),

 dict(iss="ISS-AMDA-70", title="History times use the English 12-hour 「AM」 format in Chinese, Japanese and French", cls="UI", sev=3, owner="RD",
  cases=["TC-276", "TC-277", "TC-406"], rep=(3, 3),
  note="R-149 (Rule 7: text quality in ENU / CHT / JPN) and R-313 (RD Note: French and Japanese fully translated). History cards show 「2026/10/30 10:24 AM」 in Traditional Chinese, 「10:51 AM」 in Japanese and 「10:58 AM」 in French (French uses 24-hour time). Closed Android ticket DRA262610P0097 (Close 2026-10-22: Japanese History showed 「12:38 午前」 instead of a Japanese time format) — the time is still not in the app language's format, now in English, so a new card naming the closed ticket (rule of 2026-10-28).",
  short="History times use the English 「AM」 format in Chinese, Japanese and French",
  steps=["Set the phone's system language to Français (France)", "Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap History"],
  res="Each card shows 「2026/10/30 10:58 AM」; Chinese and Japanese show 「10:24 AM」 / 「10:51 AM」 too.",
  res_zh="法文、中文與日文的 History 時間皆顯示英文 12 小時制「AM」。",
  exp="Times follow the app language: 10:58 in French, 上午 10:24 in Chinese, 10:51 or 午前10:51 in Japanese.",
  exp_zh="時間應依 App 語言格式顯示（法文 24 小時制、中文「上午」、日文格式）。",
  links=[ds("ds-recent-task")],
  rel=["Related: DRA262610P0097 (Close)"],
  imgs=[("k-fr-history", "amda70_fr_history"), ("k-cht-history", "amda70_cht_history")]),
]

# Same-OS matches: the case and the Android ticket it repeats (dedupe.txt only; no card, no recheck row).
from same_a4 import SAME_A4  # the A4 batch's map (A2 and earlier tickets), reused where the A7 Fail is the same defect
A4_FILED = {"TC-019": "DRA262610P0380", "TC-357": "DRA262610P0381", "TC-358": "DRA262610P0381", "TC-031": "DRA262610P0382",
            "TC-288": "DRA262610P0385", "TC-525": "DRA262610P0386", "TC-135": "DRA262610P0387", "TC-293": "DRA262610P0388",
            "TC-112": "DRA262610P0389", "TC-318": "DRA262610P0390", "TC-533": "DRA262610P0391"}
SAME_CASES = dict(SAME_A4)
SAME_CASES.pop("TC-289")  # held: result conflict with TC-288
for c, code in A4_FILED.items():
    SAME_CASES[c] = (code, "filed from A4")
SAME_CASES["TC-039"] = ("DRA262610P0383 / DRA262610P0327", "plural subtitle (filed from A4) and ◆4 price")
SAME_CASES.update({
 "TC-046": ("DRA262610P0366 / DRA262610P0333", "older outline card gets the new portrait; no 「Here's your updated cast.」"),
 "TC-505": ("DRA262610P0285", "outline rewritten without notice after ✓ (Propose Postpone)"),
 "TC-391": ("DRA262610P0332", "typed name gets another question, no Update card"),
 "TC-535": ("DRA262610P0343", "storyboard stage ② exits ask 「Stop and lose your credits?」"),
 "TC-536": ("DRA262610P0341", "■ stop in the input bar during a scene-image update"),
 "TC-540": ("DRA262610P0341", "■ stop in the input bar during a video regeneration"),
 "TC-537": ("DRA262610P0343 / DRA262610P0199", "stage ② Back asks Stop; requested change not applied"),
 "TC-491": ("DRA262610P0241 / DRA262610P0107", "one failed scene regenerates at a time (PM ruling pending)"),
 "TC-292": ("DRA262610P0198", "Regenerate Image ◆3 (+TTS ◆1) vs ◆6"),
 "TC-356": ("DRA262610P0198", "storyboard ◆3 per image vs ◆6"),
 "TC-230": ("DRA262610P0327 / DRA262610P0198", "character ◆4 and storyboard ◆3 per image (video part: ISS-AMDA-61)"),
 "TC-080": ("DRA262610P0274", "Best priced as Standard (rates: ISS-AMDA-61)"),
 "TC-498": ("DRA262610P0255", "script title replaced, keep request ignored"),
 "TC-085": ("DRA262610P0379", "「is ready」 banner while the full episode is still generating"),
 "TC-144": ("DRA262610P0355", "no Updating line; skeleton card at the bottom"),
 "TC-145": ("DRA262610P0355", "new result card appended, old one kept"),
 "TC-164": ("DRA262610P0343", "running storyboard can only be left by stopping it"),
 "TC-168": ("DRA262610P0359", "export can only be left by stopping it"),
 "TC-174": ("DRA262610P0361", "~119 s export wait (A2 filed the waits as ISS-AMDA-43)"),
 "TC-428": ("DRA262610P0123", "offline Regenerate says service busy (debug toast: ISS-AMDA-62)"),
 "TC-275": ("DRA262610P0372 / DRA262610-0050 / DRA262610P0325", "name cut with an ellipsis, 「」 quotes, header (debug toast: ISS-AMDA-62)"),
 "TC-307": ("DRA262610P0368", "push opens History (per-clip pushes: ISS-AMDA-63)"),
 "TC-350": ("DRA262610P0328", "no 「• 2 characters」 label (charge: ISS-AMDA-66)"),
 # A7-j and the deferred cases (2026-10-30)
 "TC-412": ("DRA262610-0059", "permission notice loops after Don't allow; back / ‹ dead (ProposeNAB ⚑ kept as duplicate, A4 practice)"),
 "TC-276": ("DRA262610P0258 / DRA262610P0284 / DRA262610P0326 / DRA262610P0248", "video settings + Create storyboard cards, agent status, filter options, Other twice, English replies (headers / names: ISS-AMDA-68; times: ISS-AMDA-70)"),
 "TC-277": ("DRA262610P0258 / DRA262610P0284 / DRA262610P0289 / DRA262610P0093", "video settings + Create storyboard cards, filter options, chips, English outline (headers: ISS-AMDA-68; times: ISS-AMDA-70)"),
 "TC-406": ("DRA262610P0258 / DRA262610P0284 / DRA262610P0248", "video settings + Create storyboard cards, agent status, filter options, English replies (ISS-AMDA-68 / 69 / 70)"),
})
# Observations that repeat an existing Android ticket (listed in dedupe.txt only)
OBS_SAME = {
 "O-4": ("DRA262610P0077", "leaving within the first second after Generate gives no dialog"),
 "O-5": ("DRA262610P0344", "storyboard resumes only when reopened after a swipe-away"),
 "O-7": ("DRA262610P0123", "offline messages differ by entry point (debug toast: ISS-AMDA-62)"),
 "O-10": ("DRA262610P0350", "view jumps to the outline after Send"),
 "O-12": ("DRA262610P0159", "offer (60 sec) is the remaining length"),
 "O-16": ("DRA262610P0026 / DRA262610P0344", "leaving in stage ① parks the job until reopened"),
 "O-19": ("DRA262610P0343 / DRA262610P0359", "guarded stages can only be left by stopping (character case held as TC-161)"),
 "O-20": ("DRA262610P0093 / DRA262610P0369 / DRA262610P0256", "Japanese picks give English outlines; 「1 characters isn't set yetThey need」"),
}

HELD = [
 ("TC-103", "question (PM)", "No 「Characters updated! Regenerate the storyboard to match?」 after a look swap while the Create storyboard card is offered. The spec draws the prompt, but DRA262610P0299 ([UX], PM) asks for exactly what the build does. Held in A4 too."),
 ("TC-158", "question (PM)", "An unsent typed idea is dropped on Back with no alert. Only the QA leave-and-return rule (R-139) backs the row (held in A2 / A4)."),
 ("TC-159", "question (PM)", "Back during the first outline shows 「Leave this chat? … won't be saved」 and Leave anyway drops it; whether R-139 (QA rule) applies before an outline exists is for PM (held in A2)."),
 ("TC-161", "question (PM)", "A running character generation can only be left through 「Stop and lose your credits?」 › Leave anyway (picks lost). The PM update board 9 (10/16) draws exactly that dialog for characters, so the QA rule R-139 conflicts with the spec (held in A2)."),
 ("TC-234", "question (PM)", "Family & Life template 2 is 「Proposal Across Lifetimes」 on the Android Stage CMS, not 「Proposal Across Every Lifetime」 (table, iOS roster). Intended rename? Re-frozen as template-roster-20261030.json (held in A4 as TC-265)."),
 ("O-21", "question (PM)", "The next-slot hint 「Tap to choose a look for {name}」 came back on every fresh install of the same account (A7-j installs #1–#3). R-252 (PM §13.1) says once per user; the build keeps the flag per install. Is per install acceptable, or must it follow the account across reinstalls and devices?"),
 ("TC-289", "recheck (result conflict)", "TC-289 again records no 「White」 in the Filter's Ethnicity row (six chips seen), while TC-288 in the same run applied White (the row scrolls sideways). Not drafted; if White is really missing it is closed DRA262610-0019 coming back. Recheck by swiping the Ethnicity row."),
]

OBS_NOT = [
 ("O-1", "Camera from Add Media let Android kill the app; the restored Make your character form could not generate (setCharacter REJECTED, no message) and the new drama was lost (A7-c1)", "Single sighting tied to Android's memory kill; recheck by opening the camera from Add Media before raising."),
 ("O-3", "Replace on a template's female lead opened Choose Character with a Mine young man pre-selected (A7-d1)", "Single sighting; recheck."),
 ("O-8", "The first scene regenerate after a storyboard whose preview TTS failed is ◆4 (image + TTS), later ones ◆3 (A7-d2)", "Price detail inside DRA262610P0198's rate; no rule on when TTS is redone."),
 ("O-9", "Full-episode offer changed from (60 sec) ◆240 to (75 sec) ◆300 after a ◆3 scene image update (A7-e)", "No spec rule for the offer length after an update; one sighting (DRA262610P0159 family)."),
 ("O-13", "A video settings card in a chat with failed or changed images is priced above the plain video price (images regenerated inside the video turn, nothing says why) (A7-g2)", "Charged equals the shown total; whether the card should itemise it is a PM question, not raised."),
 ("O-14", "Video generation survives a Wi-Fi drop of 70 s / 3 min 52 s; every clip delivered (A7-g2)", "Not a bug (good behaviour)."),
 ("O-15", "Fast = Seedance 2.0 Mini; a 60-s full episode in about 7 min (A7-g2)", "Information."),
 ("O-22", "The History hint did not show on the first (empty) History visit; it showed on the first visit with a drama card, covering that card's title and date until an outside tap (A7-j)", "TC-105 Pass (shows and closes on an outside tap); R-092 does not say what an empty list shows."),
 ("O-24", "After a relaunch into French the credit pill was blank and Create my character had no credits-left line for ~6 min (getCreditRemain / refreshMemberToken error, socket timeout); opening My Credits refreshed it", "Single sighting after a locale relaunch; recheck before raising."),
 ("O-18", "Wi-Fi lost mid-outline shows 「Something went wrong on my end」 + Try again, not the offline wording (A7-h)", "Try again works (TC-301 Pass); R-028 covers sending while already offline."),
]
OBS_ENTRY = {"O-23": "ISS-AMDA-67", "O-2": "ISS-AMDA-62", "O-6": "ISS-AMDA-60", "O-11": "ISS-AMDA-63", "O-17": "ISS-AMDA-61"}

DUPS = {}
DUPMARK = "Android duplicate (dedupe.txt only)"
INTERIM = ("**Final (2026-10-30):** all 501 cases recorded (0 Not run). Refreshed after the interim wrap-up for A7-j (three clean installs, 09:00–10:08, user signing in) "
           "and the 9 cases deferred to the user (first-use hints, system language via `launch --lang`, media-permission reset; 10:14–11:01). New since the interim: "
           "ISS-AMDA-67 (no intro page, TC-541 rechecked on clean installs), 68 / 69 / 70 (untranslated category headers and template names, French copy, 12-hour AM times); "
           "TC-081 / 303 / 304 repeat DRA262610P0362 and TC-412 repeats DRA262610-0059 (dedupe.txt only).")


def link_lines(e):
    out = []
    for x in e.get("links") or []:
        if x and x.startswith("Spec Link:"):
            out.append(x)
    return out or links_for([c for c in e["cases"] if c.startswith("TC-")])


def recheck_tickets(fails):
    out = set()
    for c, (t, _) in list(SAME_CASES.items()) + list(OBS_SAME.items()):
        if c.startswith("TC-") and c not in fails:
            continue
        for part in re.findall(r"DRA26\d+(?:-|P)\d+", t):
            out.add(part)
    return out


def build_map(fails):
    m = {}
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for e in E:
        for c in e["cases"]:
            m.setdefault(c, []).append(f"{num[e['iss']]}. {e['iss']}")
    for c, (t, why) in SAME_CASES.items():
        if c in fails:
            m.setdefault(c, []).append(f"{DUPMARK}: {t}")
    for c, (t, why) in OBS_SAME.items():
        m.setdefault(c, []).append(f"{DUPMARK}: {t}")
    for c, d, _ in HELD:
        m.setdefault(c, []).append(f"held: {d}")
    for c, _, _ in OBS_NOT:
        m.setdefault(c, []).append("not raised")
    return {k: "; ".join(dict.fromkeys(v)) for k, v in m.items()}


def jpg(src, dst):
    subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80", src, "--out", dst],
                   check=True, capture_output=True)


OBS_ALL = [f"O-{i}" for i in range(1, 25)]


def main():
    rows = list(csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig")))
    tally = {}
    for r in rows:
        tally[r["Result"]] = tally.get(r["Result"], 0) + 1
    fails = [r["ID"] for r in rows if r["Result"] == "Fail"]
    disp = {r["ID"]: r["Disposition"] for r in rows}
    blocked = [r for r in rows if r["Result"] == "Blocked"]
    obs_file = open(f"{RUN}/observations.md", encoding="utf-8").read()
    obs = [o for o in OBS_ALL if f"**{o} " in obs_file]
    if len(obs) != 24:
        sys.exit(f"observations found: {obs}")
    MAP = build_map(set(fails))
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
    w(f"# AI Mini Drama (Android) — eBug drafts, phase A7 (table v6), PDR-A {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/android/runs/2026-10-29-a7-full/` — phase A7 of draft `drafts/20261029-152721` (table v6, {len(rows)} cases), 2026-10-29 16:05 → 10-30 11:01 on {DEVICE[8:]} through Appium / UiAutomator2, {TR}, Stage server, account 「ethan.hsu.cl」 (Free). Tally: " + ", ".join(f"{v} {k}" for k, v in tally.items()) + ".")
    w("")
    w(INTERIM)
    w("")
    w("**Status:** nothing filed, uploaded or commented. Filing defaults from the newest filed batch (`ebug-defaults.ts ai-mini-drama android`: 2026-10-28-a4, Creator ETHAN_HSU, TR261021-0082, [AIAgent], API) are prefilled on the review page for confirmation. Dedupe was read-only, Android pool only (dedupe per OS, user 2026-10-28).")
    w("")
    w("Rules: reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry, the logcat excerpt on every failure- or charge-related entry (user, 2026-10-27), no video. No `[UX]`: `[AIAgent]` or `[AIAgent][UI]`, owner RD (RD, 2026-10-21). Spec basis check (REQ-055) done per entry (QA notes name the rule; team rules are named as such). Prices follow REQ-059: the MX charging sheet's original prices are expected. Android has no fault switches in 16.8, so failure entries rest on real failures (named in each QA note).")
    w("")
    nrt = len(recheck_tickets(set(fails)))
    ndup = sum(1 for c in fails if MAP[c].startswith(DUPMARK))
    w(f"**What is drafted:** {len(E)} new entries (ISS-AMDA-60…{E[-1]['iss'][-2:]}), all proposed for filing. {ndup} Fail rows repeat an existing Android ticket only ({nrt} tickets incl. the A2 bugs DRA262610P0324–P0363 and the A4 bugs DRA262610P0380–P0392) and are left out (dedupe.txt only); {len(HELD)} rows are held (PM questions, rechecks).")
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
        w(""); w("Note:"); w(DEVICE)
        for l in links:
            w(l)
        for r in e.get("rel", []):
            w(r)
        w("<Claude Reviewed>"); w("```"); w("")
        w(f"**Images:** `{NAME}_images/{folder}/`"); w("")

    w("---"); w("")
    w("## Held — PM questions and rechecks (not drafted)")
    w("")
    w("| Item | Kind | Why held / what to decide |")
    w("|---|---|---|")
    for k, d, q in HELD:
        w(f"| {k} | {d} | {q} |")
    w("")
    w("## Not raised (observations, for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in OBS_NOT:
        w(f"| {k} | {a} | {b} |")
    bd = {}
    for r in blocked:
        bd[r["Disposition"]] = bd.get(r["Disposition"], 0) + 1
    w(f"| Blocked ({len(blocked)}) | " + ", ".join(f"{v} {k}" for k, v in sorted(bd.items())) + " | No verdict (reasons grouped on the plan page; run folder blocked-reasons.json). |")
    w("")
    w("## Reconciliation against the run")
    w("")
    nq = sum(1 for f in fails if disp[f] == "question")
    w(f"{len(fails)} Fail ({len(fails) - nq} defect, {nq} question), {len(blocked)} Blocked, {tally.get('Not run', 0)} Not run, {len(obs)} observations (observations.md O-1 … O-24).")
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
    run -= len(kinds["held"]); w(f"| → held (PM question, recheck) | −{len(kinds['held'])} | {run} |")
    run -= len(kinds["notbug"]); w(f"| → not raised | −{len(kinds['notbug'])} | {run} |")
    w(f"| → merged: {run} rows / observations share {len(E)} defects | −{run - len(E)} | **{len(E)} entries** |")
    w("")
    w("Rows that feed an entry and also repeat an existing ticket for another part (TC-080, TC-230, TC-275, TC-276, TC-277, TC-307, TC-350, TC-406, TC-428) count once, as entry rows; their ticket part is in dedupe.txt.")
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
    print(f"wrote {len(E)} entries, {len(kinds['dup'])} items as Android duplicates ({nrt} tickets), {len(kinds['held'])} held, {len(kinds['notbug'])} not raised → {OUT}/{NAME}.md")
    for n, e in enumerate(E, 1):
        print(n, e["iss"], "|", " || ".join(l[11:110] for l in e["_links"]))
    return MAP, fails


if __name__ == "__main__":
    main()

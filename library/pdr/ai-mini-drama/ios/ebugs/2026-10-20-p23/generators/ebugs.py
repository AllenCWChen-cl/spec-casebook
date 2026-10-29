#!/usr/bin/env python3
"""Build the AI Mini Drama iOS eBug draft batch for phase P23 (P2 Regression + P3 Flows) of the 2026-10-19 run plan.

Writes library/pdr/ai-mini-drama/ios/ebugs/2026-10-20-p23/20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0.md, the
sibling _images/ folder (one NN_ISS-ID folder per entry, JPEGs named 16.9.0_<slug>.jpg) and the log excerpts in logs/.
Most P23 failures are regression cases whose ticket still reproduces: those are rechecks (comment/reopen on the
existing BugCode), not new tickets. Only defects with no ticket become entries (ISS-AMD-40 onward; P1 used 32-39).
Nothing is filed.
"""
import csv, json, os, re, shutil, subprocess, sys

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/ios"
RUN = f"{ROOT}/runs/2026-10-20-p23-regression-flows"
OUT = f"{ROOT}/ebugs/2026-10-20-p23"
NAME = "20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0"
V, B = "16.9.0", "189729"
TAG = "AIAgent"
DEVICE = "Device: iPhone 17 Air / iOS 26.2.1"
SPEC = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/specs/2026-10-19"
_SS = json.load(open(f"{SPEC}/spec-set.json"))
_BOARDS = json.load(open(f"{SPEC}/extracted/boards.json"))
_TITLE = {b["id"]: b["title"] for v in _BOARDS.values() for b in v}
PM = "AI Mini Drama - PM spec.pdf"
DS = "AI Mini Drama - Design Spec.pdf"
LOGS = f"{RUN}/logs"


def link(pdf, board, node=None):
    which = "Design spec" if "Design" in pdf else "PM spec"
    url = _SS["figma"][pdf]
    if node:
        url = re.sub(r"node-id=[\d-]+", f"node-id={node}", url)
    return f"Spec Link: AI Mini Drama {which}, {_TITLE[board]} board - {url}"


# Log excerpts: (label, file under logs/, date, from, to)
LOGX = {
 "ISS-AMD-40": ("missing refunds after failed generations", [
   ("TC-206 template look edit fails (Number 99, Mia)", "P23-b-20261020-200515/unzipped/2026-10-20_19-13-49_aidrama.txt", "2026-10-20", "19:58:35", "19:59:10"),
   ("TC-137 Create my character fails (Legacy Recipe, Leo; Pink Fail media tool = TextToImage)", "P23-c-20261021-002425/unzipped/2026-10-20_19-13-49_aidrama.txt", "2026-10-21", "00:16:50", "00:17:30"),
   ("O-15 video turn fails (ライバルの共闘, Preview 30 s)", "P23-f-20261021-052835/unzipped/2026-10-21_05-06-38_aidrama.txt", "2026-10-21", "05:17:20", "05:24:20")]),
 "ISS-AMD-41": ("X on Finish your characters after Generate all", [
   ("TC-121 Generate all ◆8, then X (Storm and Shelter)", "P23-b-20261020-200515/unzipped/2026-10-20_19-13-49_aidrama.txt", "2026-10-20", "19:36:05", "19:38:10")]),
}
KEEP = re.compile(r"authorize |-> allow|-> deny|tool failed|workflow step failed|send failure|turn end|turn failed|"
                  r"turn complete|revoke|unused_credit|video turn failed|commit|stage=", re.I)


def excerpt(iss):
    title, secs = LOGX[iss]
    L = [f"# {iss} {title}",
         f"# PowerDirector {V} ({B}), Developer Server, iPhone 17 Air / iOS 26.2.1. Excerpt of the app's AI Mini Drama log",
         "# (Write Log + Pink 'Log stage timings'); only lines about turns, charges and failures in the windows below. Signed storage URLs are truncated.",
         ""]
    for label, f, day, t0, t1 in secs:
        L.append(f"## {label} ({day} {t0}–{t1})")
        n = 0
        for line in open(f"{LOGS}/{f}", encoding="utf-8", errors="replace"):
            p = line.split(" ", 2)
            if len(p) < 3 or p[0] != day or not (t0 <= p[1][:8] <= t1):
                continue
            if not KEEP.search(line) or re.search(r"token|authorization:|bearer", line, re.I):
                continue
            line = re.sub(r"(https?://[^\s'\"?]+)\?[^\s'\")]*", r"\1?…", line.rstrip())
            L.append(line[:600])
            n += 1
        if n == 0:
            sys.exit(f"empty log window {label}")
        L.append("")
    path = f"{OUT}/logs/{V}_amd{iss[-2:]}_log.txt"
    open(path, "w", encoding="utf-8").write("\n".join(L))
    return path


# New defects only (no ticket in eBug yet). Continues the ISS-AMD sequence (P1 batch: 32-39, filed DRI261897P0006-P0013).
E = [
 dict(iss="ISS-AMD-40", title="Failed generations keep the credits already booked, with no refund", cls="Functional", sev=2, owner="RD",
  cases=["TC-206", "TC-137", "O-15"], rep=(3, 3),
  note="Rule 8 (refund check) on three failures, each matched by time and amount in Mine › Credits › Details (shared account, other devices' rows excluded). (1) TC-206, template 「The Dog Who Remembered Her」 (Number 99): 「Create characters ◆8 · Generate」 for Mia's look edit 19:58:39 → 「Something went wrong on my end.」 at 19:59:06 (character-edit resolve_uri failure, already DRI261896P0019); pill 20192 → 20190 → 20190 after reopening; ledger 19:58 Text to Speech −1 and 19:59 Text to Speech −1, no 「Generation failed, credits returned」 row (ledger/TC-206-20261020-200226.json). (2) TC-137, Create my character with Pink Fail media tool = TextToImage: the card says 「We couldn't create this character and your credits have been refunded.」 but pill 19677 → 19676; ledger 2026-10-21 00:17 Text to Speech −1, no refund row (ledger/TC-137-20261021-002323.json); log: TextToImage failed at 00:17:17.034, the TTS step still ran and was allowed (credit=1) at 00:17:17.597. (3) O-15, video gate retry on 「ライバルの共闘」 (Preview 30 s ◆139): 'Video couldn't be created' after 402 s (storage PUT failure, DRI261897P0006); pill 19297 → 19285; ledger Text to Speech −1 ×3 at 05:17 and Text to Image −3 ×3 at 05:23 = −12, no AI Video Generator row and no refund row (ledger/GATE2-video-20261021-052722.json). One mechanism in all three: per-tool charges booked inside a turn that then fails are never returned, so the user pays 1–12 credits for nothing; the first gate (10/20 16:04) booked nothing and is not a case of it. P1 noted the TTS credit kept on failed characters inside the DRI261896P0042 recheck (that ticket is about the missing error/refund notice); this entry is the charge itself, raised separately per rule 8. Spec: R-036 (PM Error Handling) promises the refund on a failed character; R-080/R-084 for videos. Pink fault toggles were set back Off after TC-137.",
  short="Failed character and video generations keep their charged credits with no refund",
  steps=['Launch the APP', 'Tap AI Mini Drama on the Launcher', 'Tap History', 'Tap a drama whose characters are set (e.g. The Dog Who Remembered Her)', 'Read the balance on the credit pill', "Tap Generate on a card whose generation fails (e.g. Create characters after asking to change Mia's look)", 'Wait for the failure message', 'Tap Back until the Launcher is shown', 'Tap Mine', 'Tap Credits', 'Tap Details'],
  res="Each failed generation keeps 1-12 credits (Text to Speech / Text to Image rows) and no refund row is added.",
  res_zh="生成失敗後仍扣除 1–12 點（文字轉語音/文字轉圖片），且無退點紀錄。",
  exp="A failed generation costs nothing: every credit it charged is returned with a refund row.",
  exp_zh="失敗的生成不應扣點：所有已扣點數都應退還並出現退點紀錄。",
  spec="「We couldn't create this character. Your credits have been refunded. Try again.」",
  links=[link(PM, "pm-error-handling")],
  related="DRI261896P0042 (no refund notice on failed characters), DRI261896P0019 and DRI261897P0006 (the failures themselves)",
  imgs=[("TC-206-fail", "amd40_tc206_failed"), ("TC-206-ledger", "amd40_tc206_ledger"), ("TC-137-error", "amd40_tc137_card_says_refunded"),
        ("TC-137-ledger", "amd40_tc137_ledger"), ("gate2-video-result", "amd40_video_failed"), ("gate2-ledger", "amd40_video_ledger")]),

 dict(iss="ISS-AMD-41", title="X on Finish your characters keeps the generated looks", cls="Functional", sev=3, owner="RD",
  cases=["TC-121"], rep=(1, 1),
  note="Flow arrow 2811-90144 (Design Characters board): X on the Finish your characters sheet closes back to Choose Character and the generated looks are NOT applied. Storm and Shelter (David, Margaret unset) › ✓ › 「Generate all ◆8」 19:36:10 → 「Your characters are ready」 + Confirm after 120 s → X without Confirm: the sheet closes, but both slots already show the new looks and David's new 「✦ Mine」 card is checked in 「Choose for David」. The log explains it: the generation runs as a chat turn that ends 19:38:01 with 'turn end · stage=storyboard · card=none' — the looks are committed and the stage moved to storyboard before Confirm, so X has nothing to discard. The same turn produced the duplicate outline block of TC-208 (DRI261896P0024, still reproduces). The 8 credits were charged for looks that did succeed, so the charge is not the defect; the user just cannot reject them.",
  short="X on Finish your characters keeps the generated looks instead of discarding them",
  steps=['Launch the APP', 'Tap AI Mini Drama on the Launcher', 'Tap Create Your Drama', 'Type a story idea with two characters', 'Tap Send', 'Tap Generate on the format card', 'Wait for Ready to create your characters', 'Tap a character slot', 'Tap the checkmark without choosing any look', 'Tap Generate all on Finish your characters', 'Wait for Your characters are ready', 'Tap X on the sheet without tapping Confirm'],
  res="The sheet closes but the new looks are already applied to the cast slots.",
  res_zh="按 X 關閉後，新生成的造型仍已套用到角色欄位。",
  exp="X closes back to Choose Character and the generated looks are not applied to the slots.",
  exp_zh="按 X 應回到 Choose Character，新造型不應套用到角色欄位。",
  links=[link(DS, "ds-characters", "2811-90144")],
  imgs=[("TC-121-ready", "amd41_ready"), ("TC-121-after-x", "amd41_after_x")]),

 dict(iss="ISS-AMD-42", title="Character filter with no matches shows a blank grid", cls="UX", sev=2, owner="PM",
  cases=["TC-288"], rep=(1, 1),
  note="Spec addition (TC-288, user QA rule 8: data-driven facets — an empty result is shown clearly). The Ethnicity facets themselves are fine: 8 values that match the 189-card library exactly (no Southeast Asian or Mixed cards exist, so their absence is correct), and each value alone returns only matching cards. The gap is the empty result: Male + Indigenous (the only Indigenous card is female) leaves only the 「Create my character」 tile and blank space — no 'No characters match' text and no Clear action. Design's Filter frames give no empty-state copy, so PM/Design must define it; the strings below are a suggestion.",
  short="Character filter with no matches shows a blank grid with no empty state",
  steps=['Launch the APP', 'Tap AI Mini Drama on the Launcher', 'Tap History', 'Tap a drama whose cast is not set yet', 'Tap a character slot', 'Tap the filter icon', 'Tap Male', 'Tap Indigenous', 'Tap the checkmark'],
  res="Only the Create my character tile and blank space are shown, with no message or clear option.",
  res_zh="篩選無結果時只顯示 Create my character 與空白，無任何提示。",
  exp="An empty state says no characters match and offers to clear the filter (No sheet describes this).",
  exp_zh="應顯示無符合角色的空狀態並提供清除篩選（規格未定義）。",
  rec=["Title: No characters match", "Body: Try removing a filter to see more characters.", "Button: Clear filters"],
  links=[link(DS, "ds-characters", "2811-105834")],
  imgs=[("TC-288-filter-male-indigenous", "amd42_filter"), ("TC-288-result-male-indigenous", "amd42_blank_result")]),

 dict(iss="ISS-AMD-43", title="Create my character description runs under the expand icon", cls="UI", sev=3, owner="RD",
  cases=["O-6"], rep=(1, 1),
  note="Off-case observation O-6, seen on passing case TC-125 (long description, 656 characters). The description text is not inset from the expand icon in the field's top-right corner: on the first line 「fluffy」 ends right at the icon, and after scrolling, 「ears」 is drawn underneath it (zoomed capture). User QA rule 8: entered text never overlaps adjacent controls. No log (layout only).",
  short="Create my character description text runs under the expand icon",
  steps=['Launch the APP', 'Tap AI Mini Drama on the Launcher', 'Tap History', 'Tap a drama whose cast is not set yet', 'Tap a character slot', 'Tap Create my character', 'Type a description of 600+ characters', 'Drag up inside the description'],
  res="The description text is not inset from the expand icon; words are drawn under the icon.",
  res_zh="描述文字未避開展開圖示，捲動後文字與圖示重疊。",
  exp="The text keeps clear of the expand icon at every scroll position.",
  exp_zh="任何捲動位置文字都不應與展開圖示重疊。",
  links=[link(DS, "ds-characters", "2811-90468")],
  imgs=[("TC-125-after-drag", "amd43_scrolled"), ("TC-125-icon-overlap-zoom", "amd43_overlap_zoom")]),

 dict(iss="ISS-AMD-44", title="AI Mini Drama strings stay English in Traditional Chinese and Japanese", cls="UI", sev=3, owner="RD",
  cases=["TC-276", "TC-277", "O-14", "O-2"], rep=(2, 2),
  note="TC-276 (CHT) and TC-277 (JPN) text tours, the app started with device.ts launch --lang zh-Hant / ja (launch arguments, the same per-app language the Repro Steps set through iOS Settings). The shared strings are localized (生成, 更多/その他, 刪除, 重新命名, 女性/男性, 離開/退出 …) but every AI Mini Drama feature string stays English: entry 'Hi, I'm your AI Drama Assistant', 'Create Your Drama', 'Start from a template', 'Make my version', the format card 'What format would you like for your video?' / '1. Video language' / '2. Captions', 'Leave this chat?' and 'Leave without finishing?' dialogs (buttons half localized: 「離開」 + 'Keep choosing'), History info tip, 'Characters Result', 'Create storyboard', 'Storyboard Preview', 'Video length', 'Choose Character', 'Create my character', 'AI Suggestion', 'Ethnicity*' and every ethnicity, filter 'My characters only'. Template names are localized in JPN but English in CHT; category names English in both. O-2: the chat's fixed prompts stay English with the app in Japanese. Generated story content language is a separate ticket (DRI261894P0046, still reproduces, TC-187). Japanese template names no longer truncate (DRI261896P0022 not reproduced). Owner RD (user decision 2026-10-21, was PC-Doc): the strings are not wired to the translation table. Spec Link: the home page board that holds the entry strings (R-003); there is no localization board.",
  short="Feature strings stay English in Traditional Chinese and Japanese",
  steps=['Open iOS Settings', 'Tap PowerDirector', 'Tap Language', 'Tap 繁體中文', 'Launch the APP', 'Tap AI 短劇 on the Launcher', 'Tap After Closing', 'Tap Make my version'],
  res="AI Mini Drama strings stay English while shared strings are translated, so dialogs mix languages.",
  res_zh="AI 短劇功能文字未翻譯，與已翻譯的共用文字混雜在同一畫面。",
  exp="Every AI Mini Drama string is shown in the app language (Traditional Chinese / Japanese).",
  exp_zh="AI 短劇所有文字應以 App 語言（繁體中文/日文）顯示。",
  links=[link(DS, "ds-home-custom-chat")],
  imgs=[("TC-276-entry", "amd44_cht_entry"), ("TC-276-leave-picker-dialog", "amd44_cht_leave_dialog"), ("TC-277-format-card", "amd44_jpn_format_card"), ("TC-277-leave-picker-dialog", "amd44_jpn_leave_dialog")]),

 dict(iss="ISS-AMD-45", title="CHT character filter sheet is titled 濾鏡 instead of 篩選", cls="UI", sev=3, owner="RD",
  cases=["TC-276", "O-14"], rep=(1, 1),
  note="Split from the reviewed ISS-AMD-45 (user 2026-10-21: 'This should be two bugs'); the JPN half is ISS-AMD-49. One of the few translated AI Mini Drama strings uses the wrong word: in Traditional Chinese the character filter sheet title is 「濾鏡」, the photo/image-effect filter; a list filter is 「篩選」 (the sheet's own 清除 / 性別 / 年齡 are right). Kept apart from ISS-AMD-44 because this string is translated, just wrongly. Owner RD (user decision; was PC-Doc).",
  short="Character filter sheet is titled 濾鏡 instead of 篩選 in Traditional Chinese",
  steps=['Open iOS Settings', 'Tap PowerDirector', 'Tap Language', 'Tap 繁體中文', 'Launch the APP', 'Tap AI 短劇 on the Launcher', 'Tap History', 'Tap a drama whose cast is not set yet', 'Tap a character slot', 'Tap the filter icon'],
  res="The filter sheet title reads 濾鏡 (photo filter) instead of a list-filter word.",
  res_zh="繁中角色篩選頁標題顯示「濾鏡」（相片濾鏡），用詞錯誤。",
  exp="The filter sheet title reads 篩選.",
  exp_zh="繁中篩選頁標題應為「篩選」。",
  rec=["CHT filter sheet title: 篩選"],
  links=[link(DS, "ds-characters", "2811-105834")],
  imgs=[("TC-276-filter", "amd45_cht_filter_title")]),

 dict(iss="ISS-AMD-49", title="JPN template list link reads その他 instead of もっと見る", cls="UI", sev=3, owner="RD",
  cases=["TC-277", "O-14"], rep=(1, 1),
  note="Split from the reviewed ISS-AMD-45 (user 2026-10-21: 'This should be two bugs'); new ISS number after P4's last (ISS-AMD-48). In Japanese the entry page's link to the full template list (English 'More', CHT 「更多」) reads 「その他」 ('Others'), which reads as a miscellaneous category rather than 'see more'. Kept apart from ISS-AMD-44 because this string is translated, just wrongly. The JPN Credits page's double space in 「クレジット:  0」 is on the Credits page, not AI Mini Drama (Not raised). Owner RD (user decision; was PC-Doc).",
  short="Template list link reads その他 instead of もっと見る in Japanese",
  steps=['Open iOS Settings', 'Tap PowerDirector', 'Tap Language', 'Tap 日本語', 'Launch the APP', 'Tap AI Mini Drama on the Launcher'],
  res="The link beside Start from a template reads その他 (Others) instead of a see-more word.",
  res_zh="日文「Start from a template」旁的連結顯示「その他」（其他），用詞錯誤。",
  exp="The link to the full template list reads もっと見る.",
  exp_zh="日文完整模板列表連結應為「もっと見る」。",
  rec=["JPN template list link: もっと見る"],
  links=[link(DS, "ds-home-custom-chat")],
  imgs=[("TC-277-entry", "amd49_jpn_more_link")]),
]

VIDEO = "DRI261897P0006 (Assigned, P1 ISS-AMD-37) + DRI261896P0020 (NotReproducible)"
# Existing tickets that still reproduce: (P23 case(s), ticket, status — title, what P23 saw, action)
RECHECK = [
 ("TC-142…151, TC-190, TC-195 (gate), TC-209, TC-210, O-15", VIDEO, "Video generation always fails after ~6 min as the storage upload times out",
  "Still fails 2/2: gate 10/20 16:04:42 → 'Video couldn't be created' 16:16:53 (731 s, 'HTTP PUT to storage URL failed: Failed to write connection'); retry 10/21 05:17:26 → 05:24:13 (402 s, 'Failed to read connection', also in beat-edit). 14 P23 video cases Blocked behind it; 12 credits kept on the retry (ISS-AMD-40).", "comment"),
 ("O-5, O-7", "DRI261897P0008", "NewCreated (P1 ISS-AMD-33) — character and storyboard generation block the screen for over a minute",
  "Still reproduces: Finish your characters Generate for one dog 142 s on a locked sheet (19:52:53→19:55:15); Create my character dog 203 s (20:18:14→20:21:37); TC-121 Generate all 120 s.", "comment"),
 ("TC-186", "DRI261894P0043", "Assigned — Back from an empty chat still asks Leave this chat?", "Still reproduces.", "comment"),
 ("TC-199", "DRI261896P0007", "TRCreated — New Chat enabled with empty chat and prompt", "Still reproduces on 189729 (enabled=true, shows Leave this chat?).", "reject fix (reopen)"),
 ("TC-200", "DRI261896P0008", "TRCreated — New Chat Leave anyway returns to the previous page", "Still reproduces: returns to the AI Mini Drama entry page.", "reject fix (reopen)"),
 ("TC-213", "DRI261896P0038", "Propose — message sent before the format is chosen skips language and captions", "Still reproduces: outline created with no language/captions chosen.", "comment"),
 ("TC-189", "DRI261894P0050", "Assigned — assistant gives no reply to unsupported requests", "Original no-reply symptom gone; now 'vertical 9:16 and only 15 seconds' is silently accepted and the outline cut to one beat. Question for PM: is 15 s a supported length?", "comment (question)"),
 ("TC-193", "DRI261895P0004", "NewCreated — a pet that drives the story is never offered as a character", "Still reproduces (grandma's cat Barnaby drives 4 beats, no slot).", "comment"),
 ("TC-192", "DRI261895P0003", "TRCreated — The Beer Heir in Japanese only shows Server is busy", "Original symptom gone (outline + 7 preset portraits created), but the turn ends with 'Something went wrong on my end.' + Try again (outline-sync 'HTTP request to cc team gateway failed: Failed to read connection'); Try again recovers in 37 s. 1/1.", "comment (symptom changed)"),
 ("TC-212", "DRI261896P0034", "TRCreated — The Art of Falling default actors have the wrong gender", "Still reproduces: Julian Cross gets a woman's look, Lauren Hale a man's.", "reject fix (reopen)"),
 ("TC-208", "DRI261896P0024", "RDResolved — Story Outline & Characters Result block appears twice", "Still reproduces after Finish your characters (block repeated, slot card replaced, a 'Generate with AI' bubble the user never typed).", "reject fix (reopen)"),
 ("TC-194", "DRI261895P0005", "Propose — Add New adds an invented character", "Invented character no longer added, but Add New now refuses ('Non-speaking presences … do not require a separate character sheet') with no way to name someone. Spec addition: PM/Design to define Add New.", "comment (spec addition)"),
 ("TC-201", "DRI261896P0009", "Close — character carousel lacks a horizontal-scroll hint", "Still reproduces: the 4th slot (Add New) is fully clipped at x=399, no peek (Design 2778-128850).", "reopen"),
 ("TC-206", "DRI261896P0019", "Assigned — revising a template's pre-assigned character fails", "Still reproduces; message now 'Something went wrong on my end.' (character-edit resolve_uri cannot stat the AppCMS preset image). The 2 credits kept are ISS-AMD-40.", "comment"),
 ("TC-211, TC-126", "DRI261896P0031", "NewCreated — AI Suggestion leaves required attributes empty", "Still reproduces: copies the outline role line, Gender/Ethnicity/Age empty, Generate disabled.", "comment"),
 ("TC-284 (passed)", "DRI261895P0032", "TRCreated — Generate disabled without a clear reason", "Still reproduces: Ethnicity empty → Generate greyed, no hint or highlight, tap does nothing.", "reject fix (reopen)"),
 ("TC-204", "DRI261896P0017", "ProposeNAB — animal character needs a human ethnicity", "Still requires Ethnicity; only 「Other」 lets a dog through. Question for PM: is Other the intended path?", "comment (question)"),
 ("TC-291 (passed)", "DRI261893-0119", "ProposeNAB — generated character has no Rename route", "Picker/image menu still has no Rename; renaming by chat works and is kept.", "comment"),
 ("TC-175", "DRI261893-0123", "ProposeNAB — scene description has no edit or save action", "Still reproduces (script read-only on the Scene page, no edit/save).", "comment"),
 ("TC-178", "DRI261893-0163", "QANeedRework — successful storyboard images expose no version editor", "Still no viewer/version editor on successful scene images; applicability needs PM/Design.", "comment (question)"),
 ("TC-187, O-2", "DRI261894P0046", "Close — language change by chat leaves outline and scene titles in the old language", "Partly reproduces: after 'Make the whole drama Japanese' beat titles, 'Scene N — …' titles and Possible Characters stay English (scripts, descriptions and captions are translated). Ring He Worked For JP also kept English beat titles.", "reopen"),
 ("TC-214", "DRI261896P0039", "TRCreated — character added by chat after the storyboard gets a dead slot", "Still reproduces: Tom Reed's slot (and Malcolm's) do nothing; only Add New responds.", "reject fix (reopen)"),
 ("TC-184, O-12", "DRI261894P0036", "TRCreated — after a failed step the chat has no next step, card or retry", "Still reproduces after a failed scene image + regeneration: chat ends at the storyboard, no video card, Try again gone; regen preview_tts 'not covered by the authorization -> deny', narration not redone. The chat-turn failure path (Fail turn) is fine.", "reject fix (reopen)"),
 ("TC-179", "DRI261894P0007 + DRI261894P0021", "Propose — credit details show Text to Image / Text to Speech / AI Video Generator", "Still reproduces: no row says AI Mini Drama.", "comment"),
 ("TC-185", "DRI261894P0042", "TRCreated — VoiceOver reads image IDs for Back, History, X, checkmark", "Still reproduces (labels are image IDs that change per visit; History Back empty). Read from accessibility labels, VoiceOver not turned on.", "reject fix (reopen)"),
 ("TC-275, O-10", "DRI261896P0016", "NewCreated (PCDoc) — template chat reads 1 characters isn't set yetThey need a look",
  "Still reproduces on 189729, on a custom-path drama too (Merger Season after adding Tom Reed), plus '…and 1 characters still have no portrait.' Suggested: '1 character isn't set yet. It needs a look before you can continue.'", "comment"),
 ("O-1, O-9", "DRI261894P0013", "NotReproducible — says a storyboard exists before one is made", "Reproduces on 4 dramas in P23 as in P1 (Beer Heir JP, Ring He Worked For JP, The Art of Falling, Shelter in the Storm): 'The complete 6-beat storyboard … has been generated' above the Create storyboard card, before any storyboard exists. Also after a look revision the chat offered Create storyboard although one existed (O-9).", "reopen with evidence"),
 ("O-4, O-9", "DRI261896P0054", "NewCreated — cast/story change shows the wrong assistant prompt", "Story change after the cast was set cleared Margaret's generated look and replied 'Updated the character profiles…' instead of the pm-update-7 copy; after a look revision the order was storyboard first, then Ready to create your characters.", "comment"),
 ("O-11", "DRI261896P0018", "Assigned — scene descriptions ignore the character's look", "Not reproduced in English (TC-205 Pass: Malcolm's bow tie followed), but after the Japanese translation the scene descriptions dress Lauren and Ryan differently from their looks and drop the bow tie. 1/1 — add as a note, keep open.", "comment"),
]

# Tickets that no longer reproduce on 189729: (case, ticket, status — title, what P23 saw)
FIXED = [
 ("TC-177", "DRI261893-0160", "TRCreated — style card splashes when switching quickly", "No flash in a 30 fps recording of 12 rapid switches."),
 ("TC-207", "DRI261896P0023", "TRCreated — Beer Heir / Ring JP load no preset characters", "Both JP templates show every preset look."),
 ("TC-197", "DRI261895P0034", "ProposeNAB — revised outline not shown again after characters are chosen", "Revised outline shown for confirmation before the storyboard."),
 ("TC-181", "DRI261894P0024", "TRCreated — says the characters look great after leaving with characters unset", "Chat stays at Ready to create your characters (custom drama)."),
 ("TC-183", "DRI261894P0034", "Close — expanded editor border bright white", "Border is #353A42, dark-theme gray."),
 ("TC-180", "DRI261894P0011", "TRCreated — Save to library saves to Photos", "No Saved to Photos toast; Recents unchanged; only the in-app library."),
 ("TC-203", "DRI261896P0012", "Close — scene text cannot be selected or copied", "Long-press selects; Copy/Paste works."),
 ("TC-188", "DRI261894P0048", "Close — scene count / style requests silently not applied", "'Cut it down to 3 scenes' gave a 3-scene storyboard with the twist."),
 ("TC-182", "DRI261894P0025", "TRCreated — raw internal error strings shown as toasts", "Five failures showed only user-facing copy, 0 toasts in the log (the ticket's own Home-during-video trigger could not run: video gated)."),
 ("TC-196", "DRI261895P0033", "Close — 'Sever is busy' while waiting", "Never shown in 8 turns; no 'busy' line in the log."),
 ("TC-198", "DRI261896P0006", "Propose — loading placeholder barely visible in Light mode", "Skeleton clearly visible in Light mode."),
 ("TC-132", "DRI261895P0036", "Close — Create my character always fails", "Generated in ~37 s."),
 ("TC-277", "DRI261896P0022", "Assigned — Japanese template names truncated", "Long JP names wrap to two lines, no '…'."),
]
NOT_CHECKABLE = "DRI261896P0027 (TC-209), DRI261896P0028 (TC-210), DRI261894P0052 (TC-190), DRI261895P0007 (TC-195) — need a finished video; DRI261893-0136 (TC-176, no infant card left in the library), DRI261896P0010 (TC-202, purchase), DRI261895P0002 (TC-191, spoken input)."

# Questions and spec additions that are not tickets of their own
QUESTIONS = [
 ("TC-134 / DRI261896P0037", "question", "The X'd look is added to Mine, which the approved TC-057 says is intended (PM). The ticket (Assigned) conflicts with the approved table: PM to close it as by design or change TC-057."),
 ("O-3", "question", "Filter Age slider: with both thumbs moved inward the labels keep reading 1 and 100, so the chosen range is shown nowhere. Design shows no range label; ask Design. (The only Indigenous card, 「Armed-Villagers」, is a group of villagers — library content, not app.)"),
 ("O-8", "question", "A character-sheet reference (one woman, front + 3 views, the layout the app's own results use) triggers 'More than one person detected'. Reusing a generated look as a reference always hits this. PM to decide."),
 ("O-9", "question", "Chat revisions after the storyboard regenerate the whole storyboard in the same turn with no Create storyboard offer and no charge. PM: is a free regeneration intended?"),
 ("O-12", "question", "Video price and length move with the story: Preview 30 s ◆120 → ◆127 → ◆139; Full Video 45 sec with 3 scenes, 60 sec with 4. Storyboard Preview reads 0:52 for 6, 3 and 4 scenes. Check against the MX charging price table."),
 ("O-13", "question", "The same drama's video card lost its model row overnight: 10/20 16:04 'Choose your video settings' with Seedance 2.0 / 2.0 Mini and Full Video 90 sec; 10/21 05:16 only 'Video length' with Full Video 60 sec. Spec R-068 has the model row and 90 sec. Server-driven? Recheck on a new drama before raising."),
]

NOT_RAISED = [
 ("TC-275 (part)", "Credits page 「Expiring within 7 days: 0 credit」 (and JPN 「クレジット:  0」 with a double space)", "Credits page, not AI Mini Drama — mention to the Credits/IAP owner."),
 ("TC-275 (part)", "Curly 'other’s' in the idea chips next to straight apostrophes elsewhere", "Style only; Doc to decide house style. Not a ticket."),
 ("O-11", "Scene descriptions drift from the looks after translation", "Added as a comment on DRI261896P0018 (Rechecks), seen 1/1."),
]

# Every Fail / Blocked case and every observation → what it became
MAP = {
 "TC-186": "recheck DRI261894P0043", "TC-199": "recheck DRI261896P0007", "TC-200": "recheck DRI261896P0008",
 "TC-213": "recheck DRI261896P0038", "TC-189": "recheck DRI261894P0050 (question)", "TC-193": "recheck DRI261895P0004",
 "TC-192": "recheck DRI261895P0003", "TC-212": "recheck DRI261896P0034", "TC-208": "recheck DRI261896P0024",
 "TC-194": "recheck DRI261895P0005 (spec addition)", "TC-201": "recheck DRI261896P0009", "TC-206": "1. ISS-AMD-40 + recheck DRI261896P0019",
 "TC-211": "recheck DRI261896P0031", "TC-126": "recheck DRI261896P0031", "TC-204": "recheck DRI261896P0017 (question)",
 "TC-175": "recheck DRI261893-0123", "TC-178": "recheck DRI261893-0163 (question)", "TC-187": "recheck DRI261894P0046",
 "TC-214": "recheck DRI261896P0039", "TC-184": "recheck DRI261894P0036", "TC-179": "recheck DRI261894P0007 + DRI261894P0021",
 "TC-185": "recheck DRI261894P0042", "TC-121": "2. ISS-AMD-41", "TC-288": "3. ISS-AMD-42 (spec addition)",
 "TC-137": "1. ISS-AMD-40", "TC-275": "recheck DRI261896P0016 + not raised (Credits page plural, apostrophes)",
 "TC-276": "5. ISS-AMD-44 + 6. ISS-AMD-45", "TC-277": "5. ISS-AMD-44 + 7. ISS-AMD-49 (DRI261896P0022 fixed)",
 # Blocked
 **{c: "Blocked — video gate (recheck DRI261897P0006); retest queue" for c in
    ["TC-142", "TC-143", "TC-190", "TC-195", "TC-146", "TC-147", "TC-148", "TC-149", "TC-150", "TC-144", "TC-145", "TC-151", "TC-209", "TC-210"]},
 "TC-176": "Blocked — test data (no infant card; DRI261893-0136 not checkable)",
 "TC-139": "Blocked — test data (scripts capped at 3–8 lines, no overflow)",
 "TC-136": "Blocked — test data (low balance)", "TC-152": "Blocked — test data (low balance)",
 "TC-202": "Blocked — test data (purchase)", "TC-191": "Blocked — test data (spoken input)",
 # Observations
 "O-1": "recheck DRI261894P0013", "O-2": "5. ISS-AMD-44 + recheck DRI261894P0046", "O-3": "question (Design)",
 "O-4": "recheck DRI261896P0054", "O-5": "recheck DRI261897P0008", "O-6": "4. ISS-AMD-43", "O-7": "recheck DRI261897P0008",
 "O-8": "question (PM)", "O-9": "question (PM) + recheck DRI261894P0013 + DRI261896P0054", "O-10": "recheck DRI261896P0016",
 "O-11": "recheck DRI261896P0018 (comment)", "O-12": "question (PM) + recheck DRI261894P0036", "O-13": "question (PM, ⏳ recheck)",
 "O-14": "5. ISS-AMD-44 + 6. ISS-AMD-45 + 7. ISS-AMD-49", "O-15": "1. ISS-AMD-40 + recheck DRI261897P0006",
}


def jpg(src, dst):
    subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80", src, "--out", dst],
                   check=True, capture_output=True)


def main():
    results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}
    fails = [k for k, r in results.items() if r["Result"] == "Fail"]
    blocked = [k for k, r in results.items() if r["Result"] == "Blocked"]
    obs = [f"O-{i}" for i in range(1, 16)]
    missing = [x for x in fails + blocked + obs if x not in MAP]
    extra = [x for x in MAP if x not in fails + blocked + obs]
    if missing or extra:
        sys.exit(f"reconciliation incomplete: missing {missing}, extra {extra}")
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for k, v in MAP.items():
        for n, iss in re.findall(r"(\d+)\. (ISS-AMD-\d+)", v):
            if num[iss] != int(n):
                sys.exit(f"{k}: {iss} is entry {num[iss]}, map says {n}")
        for iss in num:
            if (k in [c for e in E if e["iss"] == iss for c in e["cases"]]) != (iss in v):
                sys.exit(f"{k} and {iss} disagree between entry cases and the map")

    tally = {}
    by_phase = {}
    for r in results.values():
        tally[r["Result"]] = tally.get(r["Result"], 0) + 1
        by_phase.setdefault(r["Phase"], {}).setdefault(r["Result"], 0)
        by_phase[r["Phase"]][r["Result"]] += 1

    img_root = f"{OUT}/{NAME}_images"
    if os.path.isdir(img_root):
        shutil.rmtree(img_root)
    os.makedirs(img_root)
    L = []
    w = L.append
    p2, p3 = by_phase["P2"], by_phase["P3"]
    w(f"# AI Mini Drama (iOS) — eBug drafts, phase P23 (P2 Regression + P3 Flows), PDR-I {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-20-p23-regression-flows/` — the 91 P23 cases of the approved table `cases.csv` v1 (P2 Regression 40 + P3 Flow arrows, text and colleague directions 51), run 2026-10-20 15:35 → 2026-10-21 05:30 on {DEVICE[8:]} through Appium/WebDriverAgent, TestFlight build {V} ({B}), Developer Server, Pro+. Result: {tally['Pass']} Pass, {tally['Fail']} Fail, {tally['Blocked']} Blocked, 0 Not run — P2 {p2.get('Pass', 0)}/{p2.get('Fail', 0)}/{p2.get('Blocked', 0)}, P3 {p3.get('Pass', 0)}/{p3.get('Fail', 0)}/{p3.get('Blocked', 0)} (Pass/Fail/Blocked). Off-case observations O-1…O-15: `runs/2026-10-20-p23-regression-flows/observations.md`.")
    w("")
    filed = f"{OUT}/filed_bugcodes.json"
    if os.path.exists(filed):
        fj = json.load(open(filed, encoding="utf-8"))
        m = fj["meta"]
        codes = ", ".join(f"{b['iss']} {b['bugcode']}" for b in fj["bugs"])
        w(f"**Filed by:** {m['creator']} on {m['filed_on']} via {m['method'].upper()} on {m['tr']} ({m['version']} build {m['build']}) — {codes}. Decisions: `decisions.md`.")
    else:
        w(f"**Decisions (user, 2026-10-21):** `decisions.md` — account Ethan_Hsu, method API, `[{TAG}]`, TR261019-0014 (same build as P1). Not filed yet.")
    w("")
    w("Rules: UX problems go to PM, RD fixes are Functional without [UX]; reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry and the log excerpt where the finding has a log cause. Design outranks PM.")
    w("")
    w(f"**What is drafted:** P2 is the regression phase, so most failures are tickets that still reproduce: they are **Rechecks** (comment, or reopen/reject the fix, on the existing BugCode), not new tickets — including the video failure, which is the P1 ticket DRI261897P0006 / DRI261896P0020. The 8 P1 tickets (DRI261897P0006–P0013) are not drafted again; a P23 finding that is one of them is a recheck note. Drafted: the {len(E)} problems with no ticket of their own. Entries are numbered in run order; trust the ISS-ID over the number.")
    w("")
    w("Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), PM (a ruling is needed), Doc (on-screen copy). Every entry links the spec board it is checked against (entries resting on a QA rule cite the board that shows the screen).")
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
        if e["iss"] in LOGX:
            log = excerpt(e["iss"])
            shutil.copy(log, f"{img_root}/{folder}/")
            names.append(os.path.basename(log))
        tagtype = "" if e["cls"] == "Functional" else f"[{e['cls']}]"
        short = f"PDR-I {V} - [{TAG}]{tagtype} AI Mini Drama: {e['short']}"
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
        if e.get("spec"):
            w(f"Spec string: {e['spec']}")
        if e.get("rec"):
            w(""); w("[AI Recommendation]")
            for r in e["rec"]:
                w(r)
        w(""); w("Note:"); w(DEVICE)
        for l in e["links"]:
            w(l)
        if e.get("related"):
            w(f"Related: {e['related']}")
        w("<Claude Reviewed>"); w("```"); w("")
        w(f"**Images:** `{NAME}_images/{folder}/`"); w("")

    w("---"); w("")
    w(f"## Rechecks — existing tickets that still reproduce on {B} (comment or reopen, do not file again)")
    w("")
    w("| P23 case(s) | Ticket | Status — ticket says | What P23 saw | Action |")
    w("|---|---|---|---|---|")
    for c, t, title, saw, act in RECHECK:
        w(f"| {c} | {t} | {title} | {saw} | {act} |")
    w("")
    w(f"## Fixed — tickets that no longer reproduce on {B} (candidates to close)")
    w("")
    w("| P23 case | Ticket | Status — ticket says | What P23 saw |")
    w("|---|---|---|---|")
    for c, t, title, saw in FIXED:
        w(f"| {c} | {t} | {title} | {saw} |")
    w("")
    w(f"Not checkable this phase (Blocked): {NOT_CHECKABLE}")
    w("")
    w("## Questions and spec additions (PM / Design, not tickets)")
    w("")
    w("| Item | Disposition | What to decide |")
    w("|---|---|---|")
    for k, d, q in QUESTIONS:
        w(f"| {k} | {d} | {q} |")
    w("")
    w("## Not raised (for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in NOT_RAISED:
        w(f"| {k} | {a} | {b} |")
    w(f"| Blocked ({len(blocked)}) | {', '.join(blocked)} | No verdict: 14 behind the video failure (gate failed twice, DRI261897P0006), 6 test data (low balance ×2, purchase, spoken input, no infant card, no long script) — reasons in results.csv. |")
    w("")
    w("## Reconciliation against the report")
    w("")
    rc = [f for f in fails if "recheck" in MAP[f] and "ISS-AMD" not in MAP[f]]
    en = [f for f in fails if "ISS-AMD" in MAP[f]]
    w(f"The run is the report: {len(fails)} failed cases ({len([f for f in fails if results[f]['Phase'] == 'P2'])} P2, {len([f for f in fails if results[f]['Phase'] == 'P3'])} P3), {len(blocked)} Blocked, observations O-1…O-15.")
    w("")
    w("| Step | Count | Running total |")
    w("|---|---|---|")
    w(f"| Failed cases | {len(fails)} | {len(fails)} |")
    w(f"| Ticket still reproduces → Rechecks only ({len(rc)} cases: {', '.join(rc)}) | −{len(rc)} | {len(fails) - len(rc)} |")
    w(f"| Remaining failed cases ({', '.join(en)}) — TC-206 also a recheck; TC-206 + TC-137 merged into one refund entry, TC-276 + TC-277 into three entries (untranslated; CHT 濾鏡 and JPN その他 mistranslations, split by the user 2026-10-21) → new entries | → 6 entries | 6 |")
    w(f"| Entries from observations (O-6 → ISS-AMD-43; O-15 joins ISS-AMD-40, O-2/O-14 join ISS-AMD-44) | +1 | **{len(E)} to file** |")
    w(f"| Observations → rechecks, questions or not raised (O-1, O-3, O-4, O-5, O-7, O-8, O-9, O-10, O-11, O-12, O-13) | 0 | {len(E)} |")
    w(f"| Blocked cases ({len(blocked)}) → no verdict | 0 | {len(E)} |")
    w("")
    w("Dispositions kept apart: **defect** → entries 1, 2, 4–7 and the Rechecks; **spec-addition** → entry 3 (TC-288) and the TC-194 recheck; **question** → TC-189, TC-204, TC-178 rechecks and the Questions table; **observability** → none this phase (TC-185 was read from accessibility labels without VoiceOver); **test-data** → 6 Blocked cases.")
    w("")
    w("### Row-by-row map")
    w("")
    w("| Item | Phase | Result | Became |")
    w("|---|---|---|---|")
    for k in fails + blocked:
        w(f"| {k} | {results[k]['Phase']} | {results[k]['Result']} ({results[k]['Disposition']}) | {MAP[k]} |")
    for o in obs:
        w(f"| {o} | — | observation | {MAP[o]} |")
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
    w("RD entries in number order, then PM, then Doc: " + ", ".join(f"**{i}**" for o in ("RD", "PM", "Doc") for i, e in enumerate(E, 1) if e["owner"] == o) + ". Post the Rechecks comments (and reopen/reject-fix requests) on the existing tickets as well; the video comment goes on DRI261897P0006.")
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries, {len(RECHECK)} rechecks, {len(FIXED)} fixed → {OUT}/{NAME}.md")


if __name__ == "__main__":
    main()

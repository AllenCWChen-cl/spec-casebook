#!/usr/bin/env python3
"""Build draft 20261019-094124: the 118 rows of draft 20261016-164729 plus rows from the spec agent coverage rules
adopted on 2026-10-19 (skill section "Coverage and verdict rules"). Re-runnable; overwrites draft.csv and
requirements.md in this folder.

    python3 build_draft.py <regress.json>

regress.json: open / resolved-not-closed AI Mini Drama iOS eBugs with their descriptions (ecl_if3._full_bug).
"""
import csv, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OLD = os.path.join(HERE, "..", "20261016-164729")
DS = "https://www.figma.com/design/dZk5HLzZTdcZwWwvN9aZfZ/AI-Mini-Drama?node-id="
COLS = ["ID", "Section", "Precondition", "Action", "Expected Result", "Priority", "Spec Ref", "Notes", "Change", "Change Reason"]

old_rows = list(csv.DictReader(open(os.path.join(OLD, "draft.csv"), encoding="utf-8-sig")))
old_req = open(os.path.join(OLD, "requirements.md"), encoding="utf-8").read().rstrip("\n")
next_r = max(int(x) for x in re.findall(r"\bR-(\d{3,})\b", old_req)) + 1
next_tc = max(int(r["ID"][3:]) for r in old_rows) + 1

req_lines, rows = [], []
def req(src, text):
    global next_r
    rid = f"R-{next_r:03d}"; next_r += 1
    req_lines.append(f"- {rid} [{src}] {text}")
    return rid
def row(section, pre, action, exp, prio, ref, notes, rule):
    global next_tc
    rows.append({"ID": f"TC-{next_tc:03d}", "Section": section, "Precondition": pre, "Action": action, "Expected Result": exp,
                 "Priority": prio, "Spec Ref": ref, "Notes": notes, "Change": "new",
                 "Change Reason": f"Added 2026-10-19 from spec agent rule {rule}"})
    next_tc += 1

# ---- Rule 1: flow arrows missing from the table (Design Figma arrow nodes)
ARROWS = [
 ("Characters", "2811-105834", "Filter panel open with Gender, Ethnicity and Age changed", "Tap 「Clear」", "Every filter returns to its default: no Gender or Ethnicity selected, Age 1–100, My characters only off", "P3"),
 ("Characters", "2811-105838", "Choose Character open for one cast slot with filters applied", "Tap a different cast slot", "The heading changes to 「Choose for {name}」 for that slot and the filters reset to default", "P2"),
 ("Characters", "2811-90144", "Finish your characters showing newly generated looks", "Tap X on the sheet", "The sheet closes back to Choose Character and the generated looks are not applied to the slots", "P2"),
 ("Make your character", "2811-90585", "Create my character with some description text", "Tap the expand icon on the description", "The full-screen description editor opens with the same text", "P3"),
 ("Make your character", "2811-90145", "Expanded description editor open with edited text", "Tap the collapse icon", "The editor closes back to Create my character and keeps the edited text", "P3"),
 ("Make your character", "2811-90588", "Expanded description editor open with edited text", "Tap 「Done」", "The editor closes back to Create my character and keeps the edited text", "P3"),
 ("Make your character", "2811-90468", "Description longer than the visible area", "Drag inside the description box", "The text scrolls within its own area; the page does not move instead", "P3"),
 ("Make your character", "2811-90584", "Create my character open, empty", "Tap 「AI Suggestion」", "A description is filled in and Gender, Ethnicity and Age are set, so Generate becomes available", "P2"),
 ("Make your character", "2811-90586", "Create my character open", "Tap the Age field", "A numeric keypad opens for Age (1–100) with a confirm control", "P3"),
 ("Make your character", "2811-90587", "Create my character open", "Tap 「Reference (optional)」", "Select Media opens to pick a reference photo", "P2"),
 ("Make your character", "2811-90589", "Select Media open from Reference", "Pick a photo", "Crop opens with that photo and 「Drag and pinch to adjust how the clip fits within the frame」", "P2"),
 ("Make your character", "2837-147745", "Crop open with a reference photo", "Drag the photo, then pinch to zoom", "The visible part of the photo moves and scales inside the frame for both gestures", "P3"),
 ("Make your character", "2837-147912", "Crop open after adjusting the photo", "Tap ✓", "Create my character shows the reference cropped as adjusted", "P2"),
 ("Make your character", "2811-90147", "Valid Create my character form", "Tap Generate and wait", "The loading state is replaced by the front/side/back views with 「Save to library」", "P1"),
 ("Make your character", "2811-90591", "Generated character shown", "Tap 「Save to library」", "The character is saved to the library and applied to the cast slot being chosen", "P1"),
 ("Make your character", "2811-90593", "Generated character shown", "Tap X instead of Save to library", "The character is not applied to the cast slot", "P2"),
 ("Make your character", "2811-90592", "Character library shown", "Tap the enlarge icon on a character", "An enlarged preview of that character opens", "P3"),
 ("Characters", "2811-90216", "Finish your characters with a balance below the Generate price", "Tap Generate / Generate all", "The credit panel opens instead of generating", "P2"),
 ("Make your character", "3172-66578", "Create my character fails with a server error", "Tap 「Got it」", "Create my character returns with the reference photo and description still filled in", "P2"),
 ("Storyboard", "2820-113560", "Storyboard Result shown", "Tap a scene card (not View more)", "Scene detail opens on that scene", "P2"),
 ("Storyboard", "2820-113559", "Scene detail with a long script", "Drag inside the script", "The script scrolls within its area", "P3"),
 ("Storyboard", "3142-70055", "Failed scene description editor open", "Tap the collapse icon", "Returns to the regeneration offer with the edited text", "P3"),
 ("Storyboard", "3142-70056", "Regeneration offer for a failed scene", "Tap 「Regenerate Image」", "The scene shows a skeleton and regenerates; credits are charged once", "P1"),
 ("Video", "2778-129154", "Template drama with a finished storyboard", "Generate the full video and wait", "「Here's your drama.」 shows the completed video with its Edit action", "P1"),
 ("Video", "2820-115460", "Finished video in the chat", "Tap Play on the video", "The scene-video player opens and plays", "P1"),
 ("Video errors", "4006-73627", "Scene video regenerating", "Leave the scene editor and return to the chat", "The existing video stays and the chat shows the scene-update status", "P2"),
 ("Video errors", "4006-73628", "Scene video regenerating, user in the chat", "Wait for regeneration to finish", "The chat replaces the old video with the refreshed one", "P2"),
 ("Video errors", "2820-116878", "Video with a failed scene clip", "Tap Edit on the failed clip", "The scene-video description editor opens", "P2"),
 ("Video errors", "2820-118509", "Failed scene-video editor open with edited text", "Tap the collapse icon", "Returns to the regeneration offer with the edited text", "P3"),
 ("Video errors", "2820-118510", "Failed scene-video editor open with edited text", "Tap 「Done」", "Returns to the regeneration offer with the edited text", "P3"),
 ("Video errors", "2820-116880", "Regeneration offer for a failed clip", "Submit the regeneration", "Clip generation starts for that scene", "P1"),
 ("Video errors", None, "Video result with failed scenes", "Tap 「Fix scenes」", "The failed scene-video recovery view opens", "P1"),
 ("Captions", "4078-177645", "Caption retry in progress (「Adding captions…」)", "Wait for it to succeed", "The captioned video replaces it and 「Captions couldn't be added」 disappears", "P2"),
 ("Credits and limits", "2831-134024", "A regeneration offer with a balance below its price", "Tap the credit action", "The top-up panel opens", "P2"),
]
for sec, node, pre, act, exp, prio in ARROWS:
    if node:
        ref = req(f"DS: flow arrow {node} {DS}{node}", f"{pre} → {act} → {exp}.")
        note = f"Figma flow arrow {node}"
    else:
        ref = req("DS:ds-video", f"{pre} → {act} → {exp}.")
        note = "Design video board (Fix scenes)"
    row(sec, pre, act, exp, prio, ref, note, "1 (flow arrows)")

# ---- Rule 2: per-stage interruption matrix and wait thresholds
r_stop = req("Rule 2: Stop notice", "Stopping any running stage tells the user what stops and whether spent credits are lost, before or as it stops.")
r_ret = req("Rule 2: leave and return", "Leaving AI Mini Drama and returning at any stage shows the same task in a recognizable, usable state; nothing saved is lost without notice.")
r_wait = req("Rule 2: wait thresholds (user, 2026-10-15)", "A wait with no useful action other than leaving lasts at most 5 s without a waiting animation and at most 10 s with one.")
for st in ["outline", "character", "chat revision", "storyboard", "video"]:
    row("Interruption", f"{st.capitalize()} generation running (Stop visible)", "Tap Stop",
        "A warning or message says what will stop and whether the credits already spent are lost; the stage then stops", "P2", r_stop,
        "Compare with the Back-button dialogs (TC-025, TC-061)", "2 (interruption)")
for st in ["unsent idea in the input", "outline running", "outline finished", "character generation running", "characters finished",
           "chat revision running", "storyboard running", "storyboard finished", "video running", "video finished", "video saving / exporting"]:
    row("Interruption", f"Task at stage: {st}", "Go back to the Launcher, then return to AI Mini Drama (and the task through History if needed)",
        "The same task is shown at that stage and can be continued; nothing saved disappears without a message", "P2", r_ret, "", "2 (interruption)")
for st in ["outline", "character", "chat revision", "storyboard", "video", "save / export"]:
    row("Waits", f"{st.capitalize()} started", "Time every stretch where the only possible action is leaving",
        "No stretch exceeds 5 s without a waiting animation or 10 s with one; record the longest stretch", "P2", r_wait,
        "Record timings from the screen recording", "2 (wait thresholds)")

# ---- Rule 3: regression rows from open / resolved-not-closed tickets
regress = json.load(open(sys.argv[1], encoding="utf-8"))
r_reg = req("Rule 3: regression list (ECL query 2026-10-19)", "Every open or resolved-not-closed AI Mini Drama iOS eBug is rechecked each run; its Expect Result is the expected behavior unless the Design spec differs.")
DESIGN_NOTE = {
 "DRI261895P0026": "Design-first: Design shows the location and scene images side by side with no Location label (TC-066); this ticket's PM layout is not the expected result.",
 "DRI261893-0118": "Design-first: the current format card has no aspect-ratio choice (TC-020); confirm before rechecking.",
 "DRI261893-0130": "Design-first: Design has no Consume credits? card; MX shows 「You'll have N left」 under Generate (TC-115).",
 "DRI261893-0124": "Conflicts with the append rule in TC-014 (DRI261895P0023); recheck against the current spec.",
 "DRI261896P0011": "Design-first: check against the Design MX video-settings frame.",
}
# Tickets that repeat an existing case are folded into that case's Notes instead of getting their own row
# (user, 2026-10-19). Value: a case ID, or ("match", <section>, <substring of Action or Precondition>) for rows built later.
MERGE = {
 "DRI261893-0011": "TC-022", "DRI261893-0013": "TC-105", "DRI261893-0015": "TC-107", "DRI261893-0016": "TC-109",
 "DRI261893-0051": "TC-003", "DRI261893-0064": "TC-091", "DRI261893-0118": "TC-020", "DRI261893-0124": "TC-014",
 "DRI261893-0128": "TC-153", "DRI261893-0130": "TC-115", "DRI261893-0145": "TC-064", "DRI261893-0158": "TC-010",
 "DRI261894-0001": "TC-005", "DRI261894P0001": "TC-069", "DRI261894P0006": "TC-042", "DRI261894P0009": "TC-047",
 "DRI261894P0013": "TC-044", "DRI261894P0016": "TC-086", "DRI261894P0019": "TC-079", "DRI261894P0031": "TC-067",
 "DRI261894P0032": "TC-070", "DRI261894P0035": "TC-086", "DRI261894P0039": "TC-055", "DRI261894P0047": "TC-045",
 "DRI261894P0049": "TC-026", "DRI261894P0051": "TC-086", "DRI261895P0022": "TC-081", "DRI261895P0023": "TC-014",
 "DRI261895P0024": "TC-154", "DRI261895P0025": "TC-072", "DRI261895P0026": "TC-066", "DRI261895P0027": "TC-089",
 "DRI261895P0028": "TC-096", "DRI261895P0029": "TC-169", "DRI261895P0030": "TC-171", "DRI261895P0031": "TC-173",
 "DRI261895P0035": "TC-064", "DRI261895P0036": "TC-132", "DRI261896P0005": "TC-039", "DRI261896P0011": "TC-116",
 "DRI261896P0013": "TC-073", "DRI261896P0014": "TC-073", "DRI261896P0015": "TC-088", "DRI261896P0016": "TC-040",
 "DRI261896P0020": "TC-086", "DRI261896P0026": "TC-105", "DRI261896P0029": "TC-102", "DRI261896P0030": "TC-109",
 "DRI261896P0032": "TC-113", "DRI261896P0037": "TC-134",
 "DRI261893-0119": ("match", "Characters", "Try to rename the character"),
 "DRI261894P0008": ("match", "Templates", "Open 「The Fake Engagement」"),
 "DRI261895P0032": ("match", "Make your character", "Description, Gender and Age set, Ethnicity empty"),
 "DRI261896P0022": ("match", "Text", "Japanese (JPN)"),
 "DRI261894P0021": ("match", "Regression", "DRI261894P0007"),
}
merged_notes = []   # (target, note) applied after all rows exist
def expect(desc):
    m = re.search(r"Expect(?:ed)? Result\s*[:：]?\s*\n?(.+?)(?:\n\s*\n|\n摘要|\nSpec string|\n\[AI|\nNote|$)", desc, re.S | re.I)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else ""
for b in sorted(regress, key=lambda x: x["bugcode"]):
    short = re.split(r"AI Mini Drama[^:]*:\s*", b.get("short") or "", maxsplit=1)[-1].strip()
    sev = int(b.get("severity") or 3)
    tag = (re.search(r"\[(AIFound|AIAgent|EDF|MXFound)\]", b.get("short") or "") or [None, "untagged"])[1]
    note = f"{b['bugcode']} ({b.get('status')}, {tag})"
    if b["bugcode"] in DESIGN_NOTE:
        note += " — " + DESIGN_NOTE[b["bugcode"]]
    if b["bugcode"] in MERGE:
        merged_notes.append((MERGE[b["bugcode"]], f"Regression {note}: {short} — also recheck this ticket here"))
        continue
    row("Regression", f"Build under test; steps and evidence in {b['bugcode']}", f"Repeat the reported steps: {short}",
        expect(b.get("desc", "")) or "The reported problem no longer occurs", "P1" if sev <= 1 else "P2" if sev == 2 else "P3",
        r_reg, note, "3 (regression)")

# ---- Rule 5: tier, quota and charging (MX spec, PDRM MX.pdf version A; Design wins on conflicts)
MXN = "PDRM MX.pdf version A"
r_tier = req(f"MX ① Free chat times, {MXN}", "Each tier has a remote-configured daily chat allowance (Free 10, Pro 30, Pro+ 100); opening a template, sending a typed message and tapping a task button each use one chat; the send after the allowance shows that tier's limit dialog.")
r_lim = req(f"MX ① Free chat times, {MXN}", "At the limit: closing the dialog keeps the chat and the unsent text; every further send shows the dialog again; opening a template enters the chat first, then shows the dialog.")
r_sub = req(f"MX ① Free chat times, {MXN}", "Subscribing from the limit dialog returns to the original chat with a Continue message; unused free chats are dropped and only the new tier's allowance applies.")
r_dev = req(f"MX ① Free chat times, {MXN}", "The chat count is kept on the device; deleting and reinstalling the app restores the free chats.")
r_card = req(f"MX ② Charging flow, {MXN}", "When credits are short, a Paid user's card offers Buy Credit (Credit Panel opens on the 2000-credit pack) and a Free user's card offers Upgrade Now (subscription page); after buying, the charge is confirmed again; a card shown while short switches to the enough-credits copy when the user returns with enough credits.")
r_disc = req(f"MX ② First-time credit discount, {MXN}", "Only a Free user who subscribes during an AI Mini Drama session gets the credit discount, on that session's action ids, once per lifetime; a new session, a resubscription and any regenerate after one discounted drama are charged at full price; Paid users never get it.")
TIER = [
 (r_tier, "Tier Free (Pink › IAP › Status › Free); finite daily allowance", "Send chats until the allowance is used up, counting each send", "The 11th chat shows 「Daily Free Chat Limit Reached」 with Upgrade to Premium (TC-117); record the count", "P2", "Spec count 10 is remote-configured; while the Developer Server limit is 9999, record as an accepted assumption"),
 (r_tier, "Tier Pro", "Send chats until the allowance is used up", "The 31st chat shows the Premium limit dialog 「Daily Free Chat Limit Reached」 with Upgrade to Premium; record the count", "P2", "Spec count 30; 9999 limit → accepted assumption. TC-118 is the Pro+ dialog"),
 (r_tier, "Tier Pro+", "Send chats until the allowance is used up", "The 101st chat shows 「Today's AI Chats Are Used Up」 with Continue Tomorrow (TC-118); record the count", "P2", "Spec count 100; 9999 limit → accepted assumption. One MX mockup label says Server Busy; Design's dialog wins"),
 (r_tier, "Any tier, remaining chats known (finite allowance)", "Open a template, then send one typed message, then tap one task button (e.g. Generate)", "Each of the three uses exactly one chat", "P2", ""),
 (r_lim, "Allowance used up, text typed in the input", "Send, then close the limit dialog with X", "The chat stays open and the unsent text is still in the input", "P2", ""),
 (r_lim, "Allowance used up, limit dialog closed once", "Send again", "The limit dialog appears again on every send", "P3", ""),
 (r_lim, "Allowance used up", "Open a template from the landing page", "The template chat opens first, then the limit dialog appears", "P2", ""),
 (r_sub, "Tier Free, limit dialog shown; sandbox purchase proven", "Tap Upgrade to Premium and complete the subscription", "The original chat comes back with a Continue message", "P2", "Needs a sandbox-proven subscription; otherwise Blocked (test-data)"),
 (r_sub, "Tier Free with some free chats unused", "Switch to Pro, then count chats until the limit", "The Pro allowance applies on its own; unused Free chats are not added", "P3", ""),
 (r_dev, "Tier Free, some chats used today", "Delete and reinstall the app, sign in, open AI Mini Drama", "The daily free chats are full again", "P3", "Needs a reinstall"),
 (r_card, "Tier Pro or Pro+, balance below the next action's price", "Look at the charge card, then tap Buy Credit", "The card offers Buy Credit; the Credit Panel opens with the 2000-credit pack selected", "P2", "Design shows Buy Credits on the not-enough card (TC-116)"),
 (r_card, "Tier Free, balance below the next action's price", "Look at the charge card, then tap its button", "The card offers Upgrade Now, which opens the subscription page", "P2", "Design shows only Buy Credits; MX adds the Free-tier button"),
 (r_card, "Charge card shown with not enough credits; credits topped up (sandbox) or balance raised", "Return to the chat", "The card shows the enough-credits copy and Generate", "P2", "Needs a balance change; otherwise Blocked (test-data)"),
 (r_card, "Credits just bought from a not-enough card (sandbox)", "Go back to the card", "The charge is confirmed again before anything is charged", "P2", "Needs a sandbox purchase; otherwise Blocked (test-data)"),
 (r_disc, "Tier Pro or Pro+", "Look at the price of each action card in a new drama", "Full prices; no credit discount shown", "P2", "Credit numbers are binding (user rule 2026-10-19); prices from Design until the credit-usage link arrives"),
 (r_disc, "Tier Free, never subscribed, no subscription in this session", "Look at the action card prices", "Full prices; no credit discount", "P2", ""),
 (r_disc, "Tier Free; subscribe (sandbox) from the limit dialog or a not-enough card in this session", "Continue the drama and look at each action card price", "This session's actions show the discounted price", "P2", "Discount amount is in the MX credit charging table (not in the PDF); record it. Needs a sandbox subscription"),
 (r_disc, "Discount received in an earlier session", "Start a new chat (new session) and look at the prices", "Full prices", "P2", ""),
 (r_disc, "One full drama finished with the discount", "Regenerate any part", "Charged at full price", "P3", ""),
]
for ref, pre, act, exp, prio, note in TIER:
    row("Credits and limits", pre, act, exp, prio, ref, note, "5 (tiers, quotas and charging; MX spec)")

# ---- Rule 6: complete template catalog, one row per template (roster frozen 2026-10-19 on 16.9.0 (189631), ENU)
ROSTER = json.load(open(os.path.join(HERE, "template-roster-20261019.json"), encoding="utf-8"))
r_cat = req("Rule 6: complete template catalog (user, 2026-10-15 and 2026-10-19)", "Every template in the frozen roster opens, shows its preview and Make my version, and completes its own journey to a playable final video.")
row("Templates", "Build, server and locale recorded; roster file template-roster-20261019.json", "Open More and record every template in every category, scrolling each row and the page to the end",
    f"The roster matches the frozen list: {ROSTER['count']} templates in {len({t['category'] for t in ROSTER['templates']})} categories; any added, removed or renamed template is reported",
    "P1", r_cat, "Re-freeze if the build, server or locale changes", "6 (template catalog)")
for t in ROSTER["templates"]:
    where = f"More › {t['category']} › position {t['position']}"
    row("Templates", f"{where}; balance at least 300 credits (stop rule below)", f"Open 「{t['name']}」: check the cover and title, play the preview, then tap Make my version",
        f"The detail page shows 「{t['name']}」 with its cover and a playable preview; Make my version opens a chat that starts from this template's story (title and premise match the card)",
        "P1", r_cat, f"Template {t['k']}/{ROSTER['count']} ({t['slug']})", "6 (template catalog)")
    row("Templates", f"Chat started from 「{t['name']}」 (row above)", "Accept the outline, set up the characters, generate the storyboard, choose Seedance 2.0, Generate Video (30 sec preview), then Create the full episode (90 sec)",
        "Each stage finishes without errors; the preview and the full 90-second episode both play and tell this template's story; credits charged at each stage match the card prices",
        "P1", r_cat, f"Template {t['k']}/{ROSTER['count']}; Seedance 2.0 + full episode (user, 2026-10-19). Template rows run last; before each journey, if the balance is under 300 credits stop the template rows, mark the rest Not run and list them in the report", "6 (template catalog)")

# ---- Rule 7: text and generated content
r_txt = req("Rule 7: text quality", "Every product-authored text on every page and state is free of spelling, grammar and punctuation errors in ENU, CHT and JPN.")
r_gen = req("Rule 7: generated text", "Generated storyboard text uses the requested language, has no empty fields, unintended repetition or garbled characters, and English output uses English quote marks.")
for loc in ["English (ENU)", "Traditional Chinese (CHT)", "Japanese (JPN)"]:
    row("Text", f"App language set to {loc} through iOS Settings › PowerDirector › Language", "Visit every AI Mini Drama page, dialog, toast and state",
        "No spelling, grammar or punctuation errors; no truncated or untranslated strings", "P3", r_txt, "", "7 (text)")
for chk, exp in [("language", "All generated text is in the language chosen on the format card"),
                 ("empty fields", "Every scene has a title and script; none is empty or whitespace"),
                 ("repetition", "No sentence or scene is repeated unless the story needs it"),
                 ("garbled characters", "No broken encoding or replacement characters"),
                 ("quote marks", "English output uses English quotes, not 「」")]:
    row("Text", "Storyboard finished", f"Read every generated scene ({chk})", exp, "P3", r_gen, "", "7 (generated text)")

# ---- Rule 8: colleague directions
r_g01 = req("Rule 8: colleague G01 custom media", "The custom-character reference preview shows the selected photo, allowing for an explicit crop.")
r_o01 = req("Rule 8: colleague O01 required fields", "Each required character field omitted on its own blocks Generate; the feedback shown is recorded per field.")
r_kb = req("Rule 8: keyboard and layout", "Entered text never overlaps adjacent controls, and editing can be finished and the task continued with the keyboard open or closed.")
r_fac = req("Rule 8: data-driven facets", "Filter values match the attributes present in the character collection, including Southeast Asian and Mixed, and an empty result is shown clearly.")
r_reuse = req("Rule 8: output reuse", "A character created and saved in one drama can be found and applied in a later drama.")
COLL = [
 (r_g01, "Make your character", "A distinctive photo in the library; note its subject and orientation", "Pick it as the Reference and confirm the crop", "The reference preview shows the same photo and orientation (scaled is fine)", "P2"),
 (r_o01, "Make your character", "Description, Gender and Age set, Ethnicity empty", "Look at Generate and any hint", "Generate is disabled; record what feedback, if any, explains why", "P2"),
 (r_o01, "Make your character", "Description, Gender and Ethnicity set, Age empty", "Look at Generate and any hint", "Generate is disabled; record what feedback, if any, explains why", "P2"),
 (r_kb, "Idea input", "Long text typed into the idea input and the character description", "Compare the text with the expand and send controls", "Text never runs under or over the adjacent controls", "P3"),
 (r_kb, "Make your character", "Keyboard open on the character description", "Tap Generate (or Done, then Generate) without dismissing the keyboard first", "The task continues; no extra tap is needed to close the keyboard", "P3"),
 (r_fac, "Characters", "Character library open", "Open the filter and try each Ethnicity value, including Southeast Asian and Mixed", "Each value returns matching characters, or a clear empty state when none exist", "P3"),
 (r_fac, "Characters", "A new Mine character created with known attributes", "Filter by those attributes", "The new character appears under its own attributes", "P3"),
 (r_reuse, "Characters", "A character saved to Mine in an earlier drama", "Start a new drama and choose that character for a slot", "It is listed with the Mine tag and applies to the slot", "P2"),
 (r_reuse, "Characters", "Generated character in a cast", "Try to rename the character from the chat or the picker", "Record whether a rename route exists and whether the new name is kept", "P3"),
]
for ref, sec, pre, act, exp, prio in COLL:
    row(sec, pre, act, exp, prio, ref, "", "8 (colleague directions)")

# ---- write
out_rows = []
for r in old_rows:
    r = {k: r.get(k, "") for k in COLS}
    out_rows.append(r)
out_rows += rows
def find_target(t):
    if isinstance(t, str):
        return next(r for r in out_rows if r["ID"] == t)
    _, sec, sub = t
    hits = [r for r in out_rows if r["Section"] == sec and (sub in r["Action"] or sub in r["Precondition"] or sub in r["Notes"])]
    assert len(hits) >= 1, t
    return hits[0]
for t, note in merged_notes:
    r = find_target(t)
    r["Notes"] = (r["Notes"] + "; " if r["Notes"] else "") + note
    if r["Change"] in ("", "unchanged"):
        r["Change"], r["Change Reason"] = "modified", "Regression tickets folded in 2026-10-19"
print(f"{len(merged_notes)} regression tickets folded into existing cases")

# Cases that need a fresh install do their own reinstall as the first step of the case (user, 2026-10-19).
FRESH_STEP = ("Fresh install (part of this case): uninstall PowerDirector, reinstall the build under test, restore "
              "Developer Server, sign in, set the tier, turn on Log stage timings and Write Log")
FRESH = {"TC-083": "", "TC-104": "", "TC-105": "", "TC-224": "Tier Free; use some chats before the reinstall and note the count"}
for fid, extra in FRESH.items():
    r = next(x for x in out_rows if x["ID"] == fid)
    pre = r["Precondition"]
    r["Precondition"] = FRESH_STEP + (f"; {extra}" if extra else f"; then: {pre}" if pre else "")
    r["Notes"] = ("Own fresh install; runs in segment P1-h. " + r["Notes"]).replace("Needs a reinstall", "").replace(
        "Destructive precondition; skip if real data must stay", "The reinstall empties History (local data)").strip("; ")
    if r["Change"] in ("", "unchanged"):
        r["Change"], r["Change Reason"] = "modified", "Fresh install made part of the case 2026-10-19"
with open(os.path.join(HERE, "draft.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=COLS); w.writeheader(); w.writerows(out_rows)
added = ("\n\n## Added 2026-10-19 — spec agent coverage rules\n"
         "Rules 1–10 are in the casebook skill (section \"Coverage and verdict rules\"). Rows for rules 4, 9 and 10 are not needed;\n"
         "they change how runs are judged, ordered and deduplicated.\n" + "\n".join(req_lines) + "\n")
open(os.path.join(HERE, "requirements.md"), "w", encoding="utf-8").write(old_req + added)
by = {}
for r in rows:
    k = r["Change Reason"].split("rule ")[1]
    by[k] = by.get(k, 0) + 1
print(f"{len(old_rows)} existing + {len(rows)} added = {len(out_rows)} rows; {len(req_lines)} new requirements")
print(json.dumps(by, indent=1))

# ---- phases and segments (user, 2026-10-19). A segment is the unit of work between context resets: finish it,
# checkpoint the run state, then continue in a fresh context. Every row belongs to exactly one segment.
by_id = {r["ID"]: r for r in out_rows}
def ids(pred): return [r["ID"] for r in out_rows if pred(r)]
num = lambda r: int(r["ID"][3:])
reg = ids(lambda r: r["Section"] == "Regression")
tpl = [r for r in out_rows if r["Section"] == "Templates" and num(r) > 118]
tk = lambda r: int(re.search(r"Template (\d+)/", r["Notes"]).group(1)) if re.search(r"Template (\d+)/", r["Notes"]) else 0
PHASES = [
 {"id": "P1", "name": "Core", "note": "Original 118 cases, interruption and waits, MX credits and limits. All run rules apply.", "segments": [
   {"id": "P1-a", "name": "Entry, templates, idea input, format card", "cases": ids(lambda r: 1 <= num(r) <= 22)},
   {"id": "P1-b", "name": "Story outline, characters, Create my character", "cases": ids(lambda r: 23 <= num(r) <= 59)},
   {"id": "P1-c", "name": "Storyboard and storyboard preview", "cases": ids(lambda r: 60 <= num(r) <= 78)},
   {"id": "P1-d", "name": "Video, video errors, captions", "cases": ids(lambda r: 79 <= num(r) <= 99)},
   {"id": "P1-e", "name": "Chat behaviour and History", "cases": ids(lambda r: 100 <= num(r) <= 113)},
   {"id": "P1-f", "name": "Interruption and waits", "cases": ids(lambda r: r["Section"] in ("Interruption", "Waits"))},
   {"id": "P1-g", "name": "Credits and limits (tier switching last; restore Follow account)", "cases": ids(lambda r: r["Section"] == "Credits and limits" and (114 <= num(r) <= 118 or num(r) > 174))},
   {"id": "P1-h", "name": "Fresh install (each case reinstalls the app itself)", "cases": list(FRESH)}]},
 {"id": "P2", "name": "Regression", "note": "Open and resolved-not-closed tickets without a matching core case.", "segments": [
   {"id": "P2-a", "name": "Regression 1st half", "cases": reg[:len(reg) // 2]},
   {"id": "P2-b", "name": "Regression 2nd half", "cases": reg[len(reg) // 2:]}]},
 {"id": "P3", "name": "Flow arrows, text and colleague directions", "note": "", "segments": [
   {"id": "P3-a", "name": "Flow arrows", "cases": ids(lambda r: r["Change Reason"].endswith("rule 1 (flow arrows)"))},
   {"id": "P3-b", "name": "Text, generated text, colleague directions", "cases": ids(lambda r: r["Section"] in ("Text",) or "rule 8" in r["Change Reason"])}]},
 {"id": "P4", "name": "Templates", "note": "Seedance 2.0 + full episode; stop when the balance is under 300 and list the rest as Not run.", "segments": [
   {"id": "P4-a", "name": "Roster + Workplace Romance (1-5)", "cases": [r["ID"] for r in tpl if tk(r) <= 5]},
   {"id": "P4-b", "name": "Fantasy & Destiny (6-10)", "cases": [r["ID"] for r in tpl if 6 <= tk(r) <= 10]},
   {"id": "P4-c", "name": "Urban Romance (11-14)", "cases": [r["ID"] for r in tpl if 11 <= tk(r) <= 14]},
   {"id": "P4-d", "name": "Family & Life, Animated Stories (15-20)", "cases": [r["ID"] for r in tpl if tk(r) >= 15]}]},
]
for p in PHASES:
    for sg in p["segments"]:
        if sg["id"] != "P1-h": sg["cases"] = [c for c in sg["cases"] if c not in FRESH]
seen = [c for p in PHASES for s in p["segments"] for c in s["cases"]]
missing = [r["ID"] for r in out_rows if r["ID"] not in seen]
dupes = sorted({c for c in seen if seen.count(c) > 1})
assert not missing and not dupes, (missing, dupes)
json.dump({"draft": "20261019-094124", "phases": PHASES}, open(os.path.join(HERE, "phases.json"), "w"), indent=1)
for p in PHASES:
    print(p["id"], p["name"], sum(len(s["cases"]) for s in p["segments"]), [f"{s['id']}:{len(s['cases'])}" for s in p["segments"]])

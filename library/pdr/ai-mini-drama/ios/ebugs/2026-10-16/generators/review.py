#!/usr/bin/env python3
"""Build the eBug filing review page for the AI Mini Drama casebook batch (self-contained HTML)."""
import base64, csv, html, json, os, subprocess, tempfile

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/ios"
EB = f"{ROOT}/ebugs/2026-10-16"
RUN = f"{ROOT}/runs/2026-10-16"
OUT = f"{EB}/20261016_eBug_review_AI-Mini-Drama_16.9.0.html"

bodies = json.load(open(f"{EB}/upload/bodies.json", encoding="utf-8"))
results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}

# Dedupe verdicts from ecl_query.py dedupe + reading each candidate (2026-10-17)
DUP = {
 "ISS-AMD-01": ("DRI261896P0020", "NeedMoreInfo", "Same defect on the same build: final video always fails (S1, BALLY_HSU). It is waiting for more info, so add this run's 3/3 evidence as a comment instead of a new ticket."),
 "ISS-AMD-09": ("DRI261896P0008", "NeedCodeReview", "Same root cause: Leave anyway does not clear the chat (reported via New Chat). Fix is in code review; recheck after it lands."),
 "ISS-AMD-11": ("DRI261894P0039", "RDResolved", "Resolved in build 189482 but still reproduces on 189631. Reopen it instead of filing a new ticket."),
 "ISS-AMD-12": ("DRI261894-0001", "RDResolved", "Stale credit balance on the template page, resolved in 189463 but still reproduces on 189631. Reopen it instead."),
 "ISS-AMD-21": ("DRI261895P0023", "NewCreated", "Same defect, already filed with [AIAgent]."),
 "ISS-AMD-24": ("DRI261896P0030", "NeedCodeReview", "Same defect on 189631 (also DRI261893-0016, resolved earlier)."),
 "ISS-AMD-25": ("DRI261893-0013", "Assigned", "Same defect (also DRI261896P0026, marked resolved on 189631 but still reproduces)."),
 "ISS-AMD-28": ("DRI261894P0015", "Propose Wont Fix", "Generic status text during generation; RD proposed Won't Fix. Only file if PM wants the template path changed."),
 "ISS-AMD-30": ("DRI261894P0009", "RDResolved", "Resolved in 189463 but the heading still reads 'look like' on 189631. Reopen it instead."),
}
RELATED = {
 "ISS-AMD-03": "Related: DRI261894P0023 (Propose Won't Fix) covers the 1-credit charge with a raw error toast. This entry is about the failure now being silent, with no ! mark or message.",
 "ISS-AMD-15": "Related: DRI261896P0020 shows the same failed-clip text; this entry is about the missing Fix scenes path and refund copy.",
}
WHY = {
 "ISS-AMD-01": "No one can get a video out of AI Mini Drama on this build. Every later video step is untestable.",
 "ISS-AMD-02": "A user can turn a real celebrity into a character. That is a likeness and legal risk the spec explicitly blocks.",
 "ISS-AMD-03": "When a character image fails, the user sees nothing happen and may be charged anyway.",
 "ISS-AMD-04": "A failed server turn leaves the chat dead with nothing to tap. The user can only guess and type again.",
 "ISS-AMD-05": "The drama skipped the storyboard and the paid video settings and went straight to a video attempt.",
 "ISS-AMD-06": "Asking Iris to change a scene takes 4–5 minutes and then silently does nothing.",
 "ISS-AMD-07": "Every per-image price on screen differs from the spec. PM must confirm which prices are right.",
 "ISS-AMD-08": "On templates, Back during the outline leaves without warning, unlike the custom path.",
 "ISS-AMD-09": "Leave anyway does not really leave. Back brings the user to a frozen chat.",
 "ISS-AMD-10": "Back during a paid storyboard gives no warning on custom dramas, unlike templates.",
 "ISS-AMD-11": "One tap on X throws away everything the user typed for a character.",
 "ISS-AMD-12": "The balance shown outside the chat is out of date after spending.",
 "ISS-AMD-13": "During the multi-minute video wait, the user gets no sign that work continues.",
 "ISS-AMD-14": "Retrying a failed video sometimes turns into a question about editing a scene.",
 "ISS-AMD-15": "A failed clip gives no way to fix it and no refund wording.",
 "ISS-AMD-16": "A moderation block reads as 'service busy', so the user retries the same blocked text.",
 "ISS-AMD-17": "The policy refusal is free text instead of the defined message.",
 "ISS-AMD-18": "After changing a look, Iris doesn't say the storyboard is now out of date.",
 "ISS-AMD-19": "PM and Design specify different copy for the character picker. The build follows Design.",
 "ISS-AMD-20": "Credits are spent the moment Generate is tapped. Spec question Q-3 is still open.",
 "ISS-AMD-21": "Surprise me loses what was already in the box.",
 "ISS-AMD-22": "Closing the character picker throws the user to an earlier part of the chat.",
 "ISS-AMD-23": "A renamed drama doesn't move up, so it is hard to find again.",
 "ISS-AMD-24": "OK can be tapped with an empty name and silently does nothing.",
 "ISS-AMD-25": "The History hint can't be dismissed by tapping elsewhere and covers a date.",
 "ISS-AMD-26": "Names are clipped so they read wrong (Maya → Mava).",
 "ISS-AMD-27": "The More ideas shortcut is missing in some chat states.",
 "ISS-AMD-28": "Template outlines show a bare Thinking... with no progress wording.",
 "ISS-AMD-29": "A small copy slip on the video settings card.",
 "ISS-AMD-30": "Grammar slip in the Create my character heading.",
 "ISS-AMD-31": "In a new chat the keyboard can't be closed without sending.",
}

def thumb(path):
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as t:
        tmp = t.name
    subprocess.run(["sips", "-Z", "760", "-s", "format", "jpeg", "-s", "formatOptions", "72", path, "--out", tmp],
                   check=True, capture_output=True)
    data = base64.b64encode(open(tmp, "rb").read()).decode()
    os.unlink(tmp)
    return "data:image/jpeg;base64," + data

entries = []
for key, b in sorted(bodies.items(), key=lambda kv: kv[1]["entry"]):
    imgs = []
    for f in b["files"]:
        imgs.append({"src": thumb(os.path.join(b["images_dir"], f)), "name": f})
    cases = []
    import re
    m = re.search(r"\*\*Report step:\*\*\s*([^·]+)", open(f"{EB}/20261016_eBug_drafts_AI-Mini-Drama_16.9.0.md", encoding="utf-8").read().split(f"## {b['entry']}. {b['iss']}")[1])
    cases = [c.strip() for c in m.group(1).split(",")] if m else []
    dup = DUP.get(b["iss"])
    entries.append({
        "n": b["entry"], "iss": b["iss"], "title": b["title"], "type": b["type"], "sev": b["sev"],
        "belong": b["belong"], "out": b["out"], "times": b["times"], "short": b["short"], "desc": b["desc"],
        "note": b["qa_note"], "why": WHY.get(b["iss"], ""), "imgs": imgs, "cases": cases,
        "dup": {"code": dup[0], "status": dup[1], "text": dup[2]} if dup else None,
        "related": RELATED.get(b["iss"]),
        "action": "hold" if dup else "file",
    })

blocked = [(k, r["Actual"]) for k, r in results.items() if r["Result"] == "Blocked"]
counts = {}
for r in results.values():
    counts[r["Result"]] = counts.get(r["Result"], 0) + 1

DATA = {"entries": entries, "blocked": blocked, "counts": counts}
tpl = open(os.path.join(os.path.dirname(__file__), "review.tpl"), encoding="utf-8").read()
page = tpl.replace("/*__DATA__*/null", json.dumps(DATA, ensure_ascii=False).replace("</", "<\\/"))
open(OUT, "w", encoding="utf-8").write(page)
print(f"wrote {OUT} ({os.path.getsize(OUT)/1e6:.1f} MB, {len(entries)} cards, {sum(len(e['imgs']) for e in entries)} images)")

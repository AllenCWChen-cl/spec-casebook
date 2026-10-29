#!/usr/bin/env python3
"""Build the eBug filing review page for the AI Mini Drama casebook batch (self-contained HTML)."""
import base64, csv, html, json, os, subprocess, tempfile

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/ios"
EB = f"{ROOT}/ebugs/2026-10-19-p1"
RUN = f"{ROOT}/runs/2026-10-19-p1-core"
OUT = f"{EB}/20261019_eBug_review_AI-Mini-Drama-P1_16.9.0.html"

bodies = json.load(open(f"{EB}/upload/bodies.json", encoding="utf-8"))
results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}

# Dedupe (ecl_query.py dedupe, 2026-10-20): no likely duplicate for any of the five; candidates were different
# symptoms or Android (PDR-A) tickets, which are related, not duplicates.
DUP = {}
RELATED = {
 "ISS-AMD-37": "Raises again DRI261896P0020 (same symptom on 189631, closed NotReproducible) with new grounds: 7/7 on 189729 and the server-side cause from the log. Cite DRI261896P0020 in the ticket.",
 "ISS-AMD-38": "The 10/16 run withdrew the opposite finding (ISS-AMD-16) under the Design-first rule; PM needs to pick one copy.",
 "ISS-AMD-39": "Related: DRI261896P0047 (template chats skip the Leave dialog). Android has DRA262610P0121/P0106 about outline leave/Stop.",
 "ISS-AMD-32": "Related: DRI261893-0128 (outline and revision Stop give no feedback) - same rule, other stages; still reproduces.",
 "ISS-AMD-33": "Related: DRI261895P0024 (no Stop in character generation) and DRI261895P0029/P0030/P0031 (outline/revision/video waits) - all still reproduce.",
 "ISS-AMD-34": "Related: DRI261896P0050 (no Back toast, no processing label) - still reproduces.",
 "ISS-AMD-35": "Related: DRI261896P0043 (failed turn ends silently) - the failed Across Distance video also removed the settings card.",
}
WHY = {
 "ISS-AMD-37": "No one can get a video out of AI Mini Drama on this build and server: every attempt fails after 6 minutes.",
 "ISS-AMD-38": "The error card and the spec say different things about why the image failed; PM must choose the wording.",
 "ISS-AMD-39": "The outline is the only stage that is thrown away when you leave; every later stage keeps running.",
 "ISS-AMD-32": "Stopping a paid storyboard or video says nothing, so the user can't tell whether the credits are gone.",
 "ISS-AMD-33": "For over a minute the user can do nothing; during characters they can't even leave.",
 "ISS-AMD-34": "First-time users get no pointer to where their video will appear.",
 "ISS-AMD-35": "After a successful retry the user has no way forward unless they guess to type a request.",
 "ISS-AMD-36": "The paid storyboard action loses its price, so the user can tap it without seeing the cost.",
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
    m = re.search(r"\*\*Report step:\*\*\s*([^·]+)", open(f"{EB}/20261019_eBug_drafts_AI-Mini-Drama-P1_16.9.0.md", encoding="utf-8").read().split(f"## {b['entry']}. {b['iss']}")[1])
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

_src = open(os.path.join(os.path.dirname(__file__), "ebugs.py"), encoding="utf-8").read().replace("\nmain()", "\n")
_ns = {"__file__": os.path.join(os.path.dirname(__file__), "ebugs.py")}
exec(compile(_src, "ebugs.py", "exec"), _ns)
DATA = {"entries": entries, "blocked": blocked, "counts": counts,
        "rechecks": [list(r) for r in _ns["RECHECK"]], "fixes": [list(r) for r in _ns["QUESTIONS"]]}
tpl = open(os.path.join(os.path.dirname(__file__), "review.tpl"), encoding="utf-8").read()
page = tpl.replace("/*__DATA__*/null", json.dumps(DATA, ensure_ascii=False).replace("</", "<\\/"))
open(OUT, "w", encoding="utf-8").write(page)
print(f"wrote {OUT} ({os.path.getsize(OUT)/1e6:.1f} MB, {len(entries)} cards, {sum(len(e['imgs']) for e in entries)} images)")

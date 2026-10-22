#!/usr/bin/env python3
"""Build the P4 eBug review page from upload/bodies.json, reusing the P23 review page's layout (same HTML and script,
new data and header text). Run after ebugs.py, drafts_to_bodies.py and check_ebug_format.py. Not published."""
import base64, csv, json, os, re, subprocess, sys

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/ai-mini-drama/ios"
OUT = f"{ROOT}/ebugs/2026-10-21-p4"
SHELL = f"{ROOT}/ebugs/2026-10-20-p23/20261020_eBug_review_AI-Mini-Drama-P23_16.9.0.html"
RUN = f"{ROOT}/runs/2026-10-21-p4-templates"
sys.path.insert(0, f"{OUT}/generators")
import ebugs as G

WHY = {
 "ISS-AMD-46": "Seven template detail pages show their own title cut off at both edges; it is the first thing a user sees after tapping a template.",
 "ISS-AMD-47": "The cover art and the template name disagree on one template, the same kind of mismatch as DRI261894P0008.",
 "ISS-AMD-48": "Three template showcase videos display misspelled AI lettering on signs, which looks broken in a product sample.",
}

s = open(SHELL, encoding="utf-8").read()
i = s.index("const DATA = ") + len("const DATA = ")
_, end = json.JSONDecoder().raw_decode(s[i:])
head, tail = s[:i], s[i + end:]

bodies = json.load(open(f"{OUT}/upload/bodies.json", encoding="utf-8"))
E = {e["iss"]: e for e in G.E}
entries = []
for k, b in bodies.items():
    e = E[b["iss"]]
    imgs = []
    for f in b["files"]:
        p = f"{OUT}/upload_filing/{f}" if os.path.exists(f"{OUT}/upload_filing/{f}") else f"{b['images_dir']}/{f}"  # boxed frames as filed
        if f.endswith(".jpg"):
            imgs.append({"src": "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode(), "name": f})
    rel = None
    if e.get("related"):
        rel = f"Related, not duplicate: {e['related']}. Read-only ECL dedupe (191 AI Mini Drama candidates) found no likely duplicate."
    else:
        rel = "Read-only ECL dedupe (191 AI Mini Drama candidates) found no likely duplicate."
    entries.append(dict(n=int(b["entry"]), iss=b["iss"], title=b["title"], type=b["type"], sev=int(b["sev"]), belong=b["belong"],
                        out=int(b["out"]), times=int(b["times"]), short=b["short"], desc=b["desc"], note=b["qa_note"],
                        why=WHY[b["iss"]], imgs=imgs, cases=e["cases"], dup=None, related=rel, action="file"))
results = list(csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig")))
counts = {}
for r in results:
    counts[r["Result"]] = counts.get(r["Result"], 0) + 1
notrun = [r for r in results if r["Result"] == "Not run"]
data = {
 "entries": entries,
 "blocked": [[r["ID"], "Not run — Generate withheld (user, 2026-10-20): journey row for " + re.sub(r".*Chat started from (「[^」]+」).*", r"\1", next(c for c in csv.DictReader(open(f"{ROOT}/cases.csv", encoding="utf-8-sig")) if c["ID"] == r["ID"])["Precondition"]) + "; the card row before it checked everything up to 「Generate」."] for r in notrun],
 "counts": counts,
 "rechecks": [["—", "none", "No existing ticket reproduced in P4", "Generate was withheld, so the journey-stage template tickets were not reached. Not checkable: " + G.NOT_CHECKABLE]],
 "fixes": [[f"{c} · {t}", f"FIXED — {title}: {saw}"] for c, t, title, saw in G.FIXED] +
          [[k, f"{d.upper()} — {q}"] for k, d, q in G.QUESTIONS],
}
REPO = "/Users/ethanhsu/Desktop/pdr-spec-casebook"
# Filing defaults from the newest batch filed before this one (reviewer rule 2026-10-21), and this batch's own filing.
data["defaults"] = json.loads(subprocess.run(["node", f"{REPO}/scripts/ebug-defaults.ts", "ai-mini-drama", "ios", "--json", "--before",
                                              os.path.basename(OUT)], check=True, capture_output=True, text=True, cwd=REPO).stdout)
data["filed"] = None
if os.path.exists(f"{OUT}/filed_bugcodes.json"):
    _f = json.load(open(f"{OUT}/filed_bugcodes.json", encoding="utf-8"))
    _tags = [re.match(r"^\S+ \S+ - \[([A-Za-z-]+)\]", x["short"]).group(1) for x in _f["bugs"]]
    data["filed"] = {"meta": {**_f["meta"], "method": "API" if _f["meta"]["method"].startswith("api") else _f["meta"]["method"], "tag": _tags[0]},
                     "bugs": {x["iss"]: {"code": x["bugcode"], "sev": x["severity"], "belong": x["belong"], "files": len(x["attachments"])} for x in _f["bugs"]}}
FILEDTXT = (f"Filed {data['filed']['meta']['filed_on']} by {data['filed']['meta']['creator']} on {data['filed']['meta']['tr']} after the user's decisions (decisions.md)."
            if data["filed"] else "Nothing has been filed.")
html = head + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + tail
R = [
 ("<title>AI Mini Drama P23 eBugs</title>", "<title>AI Mini Drama P4 eBugs</title>"),
 (re.search(r"AI Mini Drama — phase P23 \(P2 Regression \+ P3 Flows\): \d+ new findings from 91 cases", html).group(0),
  f"AI Mini Drama — phase P4 (Templates): {len(entries)} new findings from 41 cases"),
 (re.search(r'<p class="lede">.*?</p>', html, re.S).group(0),
  '<p class="lede">These cards are the eBug entries exactly as they would be filed. For each one, set file or hold, severity, owner and type, and add any context. Then use Copy decisions and paste the result back. ' + FILEDTXT + ' P4 ran with 「Generate」 withheld on every template (user, 2026-10-20): 21 card rows passed, 20 journey rows are Not run. No case failed; the three entries come from observations on the template assets (cropped cover titles, a cover/name mismatch, garbled sign text in sample videos). DRI261894P0008 no longer reproduces. 0 credits spent.</p>'),
 
 (re.search(r'<p class="cal"><b>Calibration:</b>.*?</p>', html, re.S).group(0),
  '<p class="cal"><b>Calibration:</b> since 2026-10-01 the PowerDirector Mobile for iOS pool is 61% Sev 2 and 37% Sev 3; Sev 1 is 1.6%. Decided: S2 for the cropped titles (RD, player fit) and the cover/name mismatch (PM), S3 for the garbled sign text (PM); nothing blocks a journey. DRI261894P0008 (TRCreated) is a close candidate.</p>'),
 ("Still reproducing on 189729 (already in eBug)", "Still reproducing on 189729 (already in eBug) — none in P4"),
 ("These P23 failures and observations are tickets that already exist. Post what P23 saw as a comment, or reopen / reject the fix where the ticket was resolved. They are not filed again.",
  "No existing ticket reproduced in P4. The template tickets that need a generated drama were not reachable with Generate withheld."),
 ("<th>P23 case</th>", "<th>P4 case</th>"), ("What P23 saw → action", "What P4 saw"),
 (re.search(r'(<h2 id="gp">Gaps you should know about</h2>\s*<p class="cal" style="margin:0">).*?(</p>)', html, re.S).group(0),
  '<h2 id="gp">Gaps you should know about</h2>\n    <p class="cal" style="margin:0">20 journey rows are <b>Not run</b> on purpose: 「Generate withheld (user, 2026-10-20)」, so no template was taken past the format card and nothing about outlines, characters, storyboards, videos or template credit prices was checked in P4. The video gate failed twice in P23 (DRI261897P0006). Pink was untouched in P4 (Log stage timings and Unlimited daily chat ON, fault toggles Off).</p>'),
 ("<th>Why it could not run</th>", "<th>Why it was not run</th>"),
 ('const KEY = "amd-ebug-review-20261020-p23-v2";', 'const KEY = "amd-ebug-review-20261021-p4-v2";'),
 ("`<span class=\"chip\"><b>91</b> P23 cases run</span><span class=\"chip\" style=\"color:var(--ok)\"><b>${c.Pass||0}</b> pass</span><span class=\"chip s1\"><b>${c.Fail||0}</b> fail</span><span class=\"chip\"><b>${c.Blocked||0}</b> blocked</span>`",
  "`<span class=\"chip\"><b>41</b> P4 cases</span><span class=\"chip\" style=\"color:var(--ok)\"><b>${c.Pass||0}</b> pass</span><span class=\"chip s1\"><b>${c.Fail||0}</b> fail</span><span class=\"chip\"><b>${c['Not run']||0}</b> not run (withheld)</span>`"),
]
for a, b in R:
    if a not in html:
        sys.exit(f"shell text not found: {a[:70]}")
    html = html.replace(a, b, 1)
left = [m for m in re.findall(r"P23[^<\"]{0,40}", html[:html.index("const DATA")] + html[html.index("const KEY"):])]
left = [m for m in left if not m.startswith("P23 (DRI261897P0006)")]
if left:
    sys.exit(f"P23 text left in the page: {left}")
path = f"{OUT}/20261021_eBug_review_AI-Mini-Drama-P4_16.9.0.html"
open(path, "w", encoding="utf-8").write(html)
print(f"wrote {path} ({len(html) // 1024} KB, {len(entries)} cards)")

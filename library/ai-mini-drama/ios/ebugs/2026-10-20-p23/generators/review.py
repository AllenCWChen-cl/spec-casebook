#!/usr/bin/env python3
"""Build the eBug filing review page for the AI Mini Drama P23 casebook batch (self-contained HTML, not published)."""
import base64, csv, json, os, re, subprocess, tempfile

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/ai-mini-drama/ios"
EB = f"{ROOT}/ebugs/2026-10-20-p23"
RUN = f"{ROOT}/runs/2026-10-20-p23-regression-flows"
MD = f"{EB}/20261020_eBug_drafts_AI-Mini-Drama-P23_16.9.0.md"
OUT = f"{EB}/20261020_eBug_review_AI-Mini-Drama-P23_16.9.0.html"
HERE = os.path.dirname(os.path.abspath(__file__))

bodies = json.load(open(f"{EB}/upload/bodies.json", encoding="utf-8"))
results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}
md = open(MD, encoding="utf-8").read()

# Dedupe (ecl_query.py dedupe, 2026-10-21, read-only; dedupe.txt): no duplicate left. The one real duplicate found,
# DRI261896P0016 for the slot-card copy, was turned into a recheck before this page was built.
DUP = {}
RELATED = {
 "ISS-AMD-40": "Related, not duplicate: DRI261896P0042 (Assigned) is about the missing error/refund notice on failed characters; this is the charge itself (rule 8: a missing refund gets its own ticket). The failures are DRI261896P0019 and DRI261897P0006.",
 "ISS-AMD-41": "Dedupe candidates DRI261896P0058 / DRI261896P0005 are other Finish your characters problems (sheet clipping, thumbnails). Same turn also repeats the outline block (DRI261896P0024, still reproduces).",
 "ISS-AMD-42": "Spec addition: no Design copy for an empty filter result. DRI261894P0040 (closed) was an empty page on first open, not this.",
 "ISS-AMD-44": "Generated story language is DRI261894P0046 (Close, still partly reproduces: reopen). DRI261896P0022 (JP truncation) no longer reproduces.",
 "ISS-AMD-45": "Kept apart from ISS-AMD-44: these strings are translated, but with the wrong word.",
}
WHY = {
 "ISS-AMD-40": "Users pay 1 to 12 credits for generations that failed, and one failure card even says the credits were refunded.",
 "ISS-AMD-41": "The user cannot reject newly generated looks; X applies them anyway.",
 "ISS-AMD-42": "A filter with no matches looks like a broken, empty page.",
 "ISS-AMD-43": "Long descriptions are partly hidden under the expand icon.",
 "ISS-AMD-44": "In Chinese and Japanese the feature is still English, and dialogs mix two languages.",
 "ISS-AMD-45": "Two translated labels use words that mean something else.",
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
    imgs = [{"src": thumb(f"{EB}/upload_filing/{f}" if os.path.exists(f"{EB}/upload_filing/{f}") else os.path.join(b["images_dir"], f)), "name": f} for f in b["files"] if not f.endswith(".txt")]  # boxed frames as filed
    m = re.search(r"\*\*Report step:\*\*\s*([^·]+)", md.split(f"## {b['entry']}. {b['iss']}")[1])
    cases = [c.strip() for c in m.group(1).split(",")] if m else []
    dup = DUP.get(b["iss"])
    entries.append({
        "n": b["entry"], "iss": b["iss"], "title": b["title"], "type": b["type"], "sev": b["sev"],
        "belong": b["belong"], "out": b["out"], "times": b["times"], "short": b["short"], "desc": b["desc"],
        "note": b["qa_note"], "why": WHY.get(b["iss"], ""), "imgs": imgs, "cases": cases,
        "dup": {"code": dup[0], "status": dup[1], "text": dup[2]} if dup else None,
        "related": RELATED.get(b["iss"]), "action": "hold" if dup else "file",
    })

GATE = "Gate video failed twice (10/20 16:04, 731 s; 10/21 05:17, 402 s): storage PUT failure, DRI261897P0006. Retest queue."
blocked = []
for k, r in results.items():
    if r["Result"] == "Blocked":
        why = GATE if r["Actual"].startswith(("Gate video failed", "Upstream video failure")) else r["Actual"]
        blocked.append((f"{k} ({r['Phase']})", why[:400]))
counts = {}
for r in results.values():
    counts[r["Result"]] = counts.get(r["Result"], 0) + 1
ph = {p: {s: sum(1 for r in results.values() if r["Phase"] == p and r["Result"] == s) for s in ("Pass", "Fail", "Blocked")} for p in ("P2", "P3")}

_src = open(os.path.join(HERE, "ebugs.py"), encoding="utf-8").read().replace('if __name__ == "__main__":\n    main()', "")
_ns = {"__file__": os.path.join(HERE, "ebugs.py")}
exec(compile(_src, "ebugs.py", "exec"), _ns)
rechecks = [[c, t, f"{s}", f"{w} → {a}"] for c, t, s, w, a in _ns["RECHECK"]]
fixes = [[f"{c} · {t}", f"FIXED — {s}: {w}"] for c, t, s, w in _ns["FIXED"]] + \
        [[k, f"{d.upper()} — {q}"] for k, d, q in _ns["QUESTIONS"]]
REPO = "/Users/ethanhsu/Desktop/pdr-spec-casebook"
# Filing defaults from the newest batch filed before this one (reviewer rule 2026-10-21), and this batch's own filing.
DEFAULTS = json.loads(subprocess.run(["node", f"{REPO}/scripts/ebug-defaults.ts", "ai-mini-drama", "ios", "--json", "--before",
                                      os.path.basename(EB)], check=True, capture_output=True, text=True, cwd=REPO).stdout)
FILED = None
if os.path.exists(f"{EB}/filed_bugcodes.json"):
    _f = json.load(open(f"{EB}/filed_bugcodes.json", encoding="utf-8"))
    _tags = [re.match(r"^\S+ \S+ - \[([A-Za-z-]+)\]", b["short"]).group(1) for b in _f["bugs"]]
    FILED = {"meta": {**_f["meta"], "method": "API" if _f["meta"]["method"].startswith("api") else _f["meta"]["method"], "tag": _tags[0]},
             "bugs": {b["iss"]: {"code": b["bugcode"], "sev": b["severity"], "belong": b["belong"], "files": len(b["attachments"])} for b in _f["bugs"]}}
DATA = {"entries": entries, "blocked": blocked, "counts": counts, "rechecks": rechecks, "fixes": fixes, "defaults": DEFAULTS, "filed": FILED}

tpl = open(os.path.join(HERE, "review.tpl"), encoding="utf-8").read()
n = len(entries)
REPL = [
 ("<title>AI Mini Drama P1 eBugs</title>", "<title>AI Mini Drama P23 eBugs</title>"),
 ("<h1>AI Mini Drama — phase P1 (Core): 5 new findings from 159 cases</h1>",
  f"<h1>AI Mini Drama — phase P23 (P2 Regression + P3 Flows): {n} new findings from 91 cases</h1>"),
 ("Most P1 failures repeat tickets already in eBug; those are in the Rechecks table of the draft markdown (to comment or reopen), not here.",
  f"P23 is mostly regression: {len(rechecks)} existing tickets still reproduce and are listed under Still reproducing (comment, reopen or reject the fix), and {len(_ns['FIXED'])} no longer reproduce. The 8 P1 tickets filed on TR261019-0014 are not drafted again. P2: {ph['P2']['Pass']} pass / {ph['P2']['Fail']} fail / {ph['P2']['Blocked']} blocked; P3: {ph['P3']['Pass']} / {ph['P3']['Fail']} / {ph['P3']['Blocked']}."),
 ('<dd class="need" id="f-tr">189729 TR? confirm</dd>', '<dd class="need" id="f-tr">TR261019-0014? confirm</dd>'),
 ('const KEY = "amd-ebug-review-20261016";', 'const KEY = "amd-ebug-review-20261020-p23-v2";'),
 ("Then use Copy decisions and paste the result back. Nothing has been filed.",
  "Then use Copy decisions and paste the result back. " + (f"Filed {FILED['meta']['filed_on']} by {FILED['meta']['creator']} on {FILED['meta']['tr']} after the user's decisions (decisions.md); F-6 was split into ISS-AMD-45 and ISS-AMD-49." if FILED else "Nothing has been filed.")),
 ("<small>The 10/16 batch was filed on TR261014-0058 (build 189631). Give the TR for 16.9.0.189729.</small>",
  "<small>The P1 batch was filed on TR261019-0014 (16.9.0.189729, the same build). Confirm it, or give another TR.</small>"),
 ("<small>[AIAgent], as decided for the 10/16 casebook batch.</small>", "<small>[AIAgent], as for the 10/16 and P1 casebook batches.</small>"),
 ("This batch proposes one S1 (video never completes) and S3 for the rest.",
  "Decided: two S2 (credits kept after failed generations; the filter's blank empty state) and S3 for the rest; no S1 — the video failure is already DRI261897P0006 (S1)."),
 ("<h2 id=\"nf\">Still reproducing on 189729 (already in eBug)</h2>", "<h2 id=\"nf\">Still reproducing on 189729 (already in eBug)</h2>"),
 ("These P1 failures are tickets that already exist. Post what P1 saw as a comment, or reopen the ticket if it was resolved. They are not filed again.",
  "These P23 failures and observations are tickets that already exist. Post what P23 saw as a comment, or reopen / reject the fix where the ticket was resolved. They are not filed again."),
 ("<th>P1 case</th><th>Ticket</th><th>Ticket says</th><th>What P1 saw</th>", "<th>P23 case</th><th>Ticket</th><th>Status — ticket says</th><th>What P23 saw → action</th>"),
 ("<h3 style=\"margin:8px 0 0\">Not app problems (table corrections)</h3>", "<h3 style=\"margin:8px 0 0\">Fixed on 189729, and questions for PM / Design</h3>"),
 ("<th>Case</th><th>Why the app is right</th>", "<th>Case · ticket</th><th>Outcome</th>"),
 ("32 cases are <b>Blocked</b>, with no verdict: 15 need a finished video (blocked behind ISS-AMD-37), 15 need test data this account can't reach (a low balance, a sandbox purchase, the 9999 server chat limit), and 2 can't be observed. Fault injection used the Pink debug menu; all of its toggles were set back to their defaults at the end.",
  f"{counts['Blocked']} cases are <b>Blocked</b>, with no verdict: 14 need a finished video (the preflight gate failed on 10/20 and again on 10/21; DRI261897P0006), 6 need test data this account can't reach (low balance ×2, a purchase, spoken input, an infant library card, a script longer than its area). Pink fault toggles used for TC-137, TC-140/184 were set back Off and read back; Log stage timings and Unlimited daily chat stay ON for P4."),
 ('<span class="chip"><b>159</b> P1 cases run</span>', '<span class="chip"><b>91</b> P23 cases run</span>'),
]
for a, b in REPL:
    if a not in tpl:
        raise SystemExit(f"template text not found: {a[:60]}")
    tpl = tpl.replace(a, b)
if re.search(r"\bP1\b(?! batch| tickets| casebook)", re.sub(r"P1 (batch|tickets|casebook)", "", tpl.split("<script")[0])):
    print("note: template still mentions P1 somewhere outside the replaced strings")
page = tpl.replace("/*__DATA__*/null", json.dumps(DATA, ensure_ascii=False).replace("</", "<\\/"))
open(OUT, "w", encoding="utf-8").write(page)
print(f"wrote {OUT} ({os.path.getsize(OUT)/1e6:.1f} MB, {len(entries)} cards, {sum(len(e['imgs']) for e in entries)} images)")

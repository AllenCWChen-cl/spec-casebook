#!/usr/bin/env python3
"""Build the A4 Android eBug review page from upload/bodies.json.

Reuses the iOS P9 review page's stylesheet (ios/ebugs/2026-10-27-p9) and its card / decisions script, with Android text, a
PM-questions table and the Blocked groups. Run after ebugs.py, drafts_to_bodies.py, check_ebug_format.py and the dedupe.
Thumbnails are made with `sips` (no Pillow on this machine). Nothing is filed; the page is a self-contained file here.
"""
import base64, csv, json, os, re, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ebugs as G

REPO, OUT, RUN = G.REPO, G.OUT, G.RUN
SHELL = f"{REPO}/library/ai-mini-drama/ios/ebugs/2026-10-27-p9/20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html"
PAGE = f"{OUT}/20261028_eBug_review_AI-Mini-Drama-A4_16.8.0.html"

WHY = {
 "ISS-AMDA-47": "The Design and PM draw a 「More ideas +」 chip once a chat has content; the build has none.",
 "ISS-AMDA-48": "The credit pill is the one top exit that skips 「Leave this chat?」, and the unfinished chat is then saved.",
 "ISS-AMDA-49": "A refused idea leaves the user with a cut-off 「I cannot」 and no hint what to change.",
 "ISS-AMDA-50": "The plural Finish your characters subtitle is neither the Design nor the PM wording (closed DRA262610-0061 fixed only the singular sheet).",
 "ISS-AMDA-51": "When one of several characters fails, the user gets the single-character error and cannot see or tap the failed one.",
 "ISS-AMDA-52": "A filter value with no looks shows a blank grid with no explanation.",
 "ISS-AMDA-53": "System Back on the album list throws away the whole picker (REQ-051: Back closes only the top layer).",
 "ISS-AMDA-54": "System Back on the enlarged preview closes Choose Character, while its ⓧ closes only the preview.",
 "ISS-AMDA-55": "Both main scene images of a chat update fail (log) while the Location images update; Iris claims success, no 「!」 marks the failures and their 6 credits are not refunded.",
 "ISS-AMDA-56": "System Back in Manage mode leaves History instead of acting like Cancel.",
 "ISS-AMDA-57": "Iris says it is changing the title but the drama keeps its old name (A2 passed this row).",
 "ISS-AMDA-58": "System Back on the export sheet also closes the result page.",
 "ISS-AMDA-59": "A user Stop is reported as an app error (「Something went wrong on my end」).",
}
RELATED = {
 "ISS-AMDA-48": "Not DRA262610-0037 (Close — the dialog on an empty chat).",
 "ISS-AMDA-49": "Related, not duplicate: DRA262610P0228 (content check before the format card).",
 "ISS-AMDA-50": "Related, closed: DRA262610-0061 (Close) — same plural text, bug back, so a new entry naming it (rule of 2026-10-28). The ◆4 price on the sheet is DRA262610P0327 (not repeated).",
 "ISS-AMDA-51": "Related, not duplicate: DRA262610P0365 (slots left empty though images were made), DRA262610P0257 (refund keeps Text to Speech −1; TC-500 is listed only in dedupe.txt).",
 "ISS-AMDA-55": "Related, not duplicate: DRA262610P0311 (outfit edit claims updated visuals, nothing redrawn, no charge), DRA262610P0238 (failed first scene image), DRA262610P0073 (Close — no update card), DRA262610P0123 (offline failure says busy).",
 "ISS-AMDA-57": "Related, not duplicate: DRA262610P0255 (user-given title replaced by an AI title), DRA262610P0101 (Close — export title after Rename).",
 "ISS-AMDA-58": "The sheet itself is DRA262610P0219 / P0243 (not repeated).",
 "ISS-AMDA-59": "iOS ticket DRI261895P0024 (iOS only, not a duplicate).",
}
DEF = json.loads(subprocess.run(["node", f"{REPO}/scripts/ebug-defaults.ts", "ai-mini-drama", "android", "--json"], capture_output=True, text=True, check=True).stdout)



def thumb(path):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "t.jpg")
        subprocess.run(["sips", "-Z", "900", "-s", "format", "jpeg", "-s", "formatOptions", "60", path, "--out", out],
                       check=True, capture_output=True)
        return "data:image/jpeg;base64," + base64.b64encode(open(out, "rb").read()).decode()


s = open(SHELL, encoding="utf-8").read()
style = s[:s.index("</style>")]
style = style.replace("<title>AI Mini Drama P9 eBugs</title>", "<title>AI Mini Drama A4 eBugs</title>")
# Log excerpts start collapsed and wrap like the other card text; nothing in a card may push it wider than the page
# (user, 2026-10-28: half-width window).
style += """
.logbox summary{padding:8px 10px;font-size:13px;font-weight:600;cursor:pointer}
.logbox summary span{font:12px var(--mono);opacity:.75;margin-left:6px;font-weight:400}
.logbox pre{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;margin:0;padding:8px 10px}
.card,.card>*,main,section,details,.dupbox,.myread,.sd,.bar,.chips,.strip{min-width:0;max-width:100%}
.card pre,.card code,.dupbox,.myread,.sd,td{overflow-wrap:anywhere}
.card img{max-width:100%;height:auto}
.strip,.bar{flex-wrap:wrap}
table{max-width:100%}
.tblwrap,.scrollx{overflow-x:auto;max-width:100%}
"""
i = s.index("const DATA = ") + len("const DATA = ")
_, end = json.JSONDecoder().raw_decode(s[i:])
tail = s[i + end:]

bodies = json.load(open(f"{OUT}/upload/bodies.json", encoding="utf-8"))
# After filing (2026-10-28): cards show the boxed frames as uploaded and each card carries its BugCode.
FILED_JSON = f"{OUT}/filed_bugcodes.json"  # absent until this batch is filed
filed = None
if os.path.exists(FILED_JSON):
    fj = json.load(open(FILED_JSON, encoding="utf-8"))
    filed = {"meta": {**fj["meta"], "method": "API", "tag": "AIAgent"},
             "bugs": {x["iss"]: {"code": x["bugcode"], "sev": x["severity"], "belong": x["belong"], "files": len(x["attachments"])}
                      for x in fj["bugs"]}}
FILING_DIR = f"{OUT}/upload_filing"
def src(b, f):
    p = os.path.join(FILING_DIR, f)
    return p if filed and os.path.exists(p) else os.path.join(b["images_dir"], f)
E = {e["iss"]: e for e in G.E}
entries = []
for k, b in bodies.items():
    e = E[b["iss"]]
    imgs = [{"src": thumb(src(b, f)), "name": f} for f in b["files"] if f.endswith(".jpg")]
    logs = [f for f in b["files"] if f.endswith(".txt")]
    logtext = [{"name": f, "text": open(os.path.join(b["images_dir"], f), encoding="utf-8").read()} for f in logs]
    d = G.DUPS.get(b["iss"])
    rel = RELATED.get(b["iss"], "Read-only ECL dedupe (whole AI Mini Drama Android pool): no likely duplicate.")
    if logs:
        rel += f" Logcat excerpt attached: {', '.join(logs)} (token-checked; URL queries cut) — text in the Log section below."
    entries.append(dict(n=int(b["entry"]), iss=b["iss"], title=b["title"], type=b["type"], sev=int(b["sev"]), belong=b["belong"],
                        out=int(b["out"]), times=int(b["times"]), short=b["short"], desc=b["desc"], note=b["qa_note"],
                        why=WHY[b["iss"]], imgs=imgs, cases=e["cases"],
                        dup={"code": d[0], "status": d[1], "text": d[2]} if d else None,
                        related=rel, logs=logtext, action="hold" if d else "file"))

results = list(csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig")))
counts = {}
for r in results:
    counts[r["Result"]] = counts.get(r["Result"], 0) + 1
sys.path.insert(0, f"{OUT}/generators")
from blocked import group as bgroup  # noqa: E402
blocked = [[r["ID"], f"{bgroup(r)} · {r['Disposition']} — {r['Actual'][:240]}{'…' if len(r['Actual']) > 240 else ''}"]
           for r in results if r["Result"] == "Blocked"]
bcount = {}
for r in results:
    if r["Result"] == "Blocked":
        bcount[bgroup(r)] = bcount.get(bgroup(r), 0) + 1
data = {
 "entries": entries,
 "blocked": blocked,
 "counts": counts,
 "rechecks": [],
 "fixes": [[k, f"{d.upper()} — {q}"] for k, d, q in G.HELD] + [[k, f"NOT A BUG — {a}: {b}"] for k, a, b in G.NOT_BUG],
 "defaults": {"found": True, "from": f"the A2 batch {DEF['from']} (filed {DEF['filed_on']}, {DEF['first']}–{DEF['last'][-4:]})", "creator": DEF["creator"],
              "tr": DEF["tr"], "tr_prev": DEF["tr"], "tag": DEF["tag"], "method": DEF["method"], "version": DEF["version"], "build": DEF["build"]},
 "filed": filed,
}
nhold = sum(1 for e in entries if e["action"] == "hold")
FN = {e["iss"]: e["n"] for e in entries}
def F(*iss):
    return ", ".join(f"F-{FN[i]}" for i in iss)
ndup = sum(1 for c in G.SAME_CASES if c != "TC-289" and not any(c in e["cases"] for e in G.E))
nandr = len(G.recheck_tickets())
S2F = F("ISS-AMDA-55")
DOCF = ", ".join(f"F-{e['n']}" for e in entries if "Doc" in e["belong"]) or "none"
SBF = F("ISS-AMDA-53", "ISS-AMDA-54", "ISS-AMDA-56", "ISS-AMDA-58")
FILED_LINE = (f"Filed {filed['meta']['filed_on']}: all {len(filed['bugs'])} cards as {min(v['code'] for v in filed['bugs'].values())}–{max(v['code'] for v in filed['bugs'].values())[-4:]} on {filed['meta']['tr']} (16.8.0 build 2610212; the TR's Build field reads 2610171, the user confirmed 2610212), Creator {filed['meta']['creator']}, decisions in decisions.md (F-9 rewritten to its evidence and filed after the hold); images shown as uploaded, with the red box. No existing ticket was commented on." if filed else "Nothing has been filed, uploaded or commented.")
bsum = ", ".join(f"{v} {k}" for k, v in sorted(bcount.items(), key=lambda x: -x[1]))
body = f'''</style>

<div class="wrap">
  <header style="display:grid;gap:10px">
    <div class="eyebrow">pdr-spec-casebook · PowerDirector Mobile for Android · eBug filing review</div>
    <h1>AI Mini Drama Android — phase A4 (table v3) on 2610212: {len(entries)} findings from {len(results)} cases</h1>
    <p class="lede">These cards are the eBug entries exactly as they would be filed. For each one, set file or hold, severity, owner and type, and add any context. Then use Copy decisions and paste the result back. {FILED_LINE} A4 ran all {len(results)} cases of table v3 (draft 20261028-164930) on 16.8.0 (2610212), {G.TR}, Stage server, signed in (Free), 2026-10-28 17:38 → 10-29 06:12: {counts.get("Pass", 0)} Pass, {counts.get("Fail", 0)} Fail, {counts.get("Blocked", 0)} Blocked, {counts.get("Not run", 0)} Not run. Segment A4-j (three fresh installs, 2026-10-29) is included: its two Fails, TC-303 / TC-304 (no 「Get notified」 pre-prompt on the first video), repeat DRA262610P0362 (filed for TC-081 in A2) and are in dedupe.txt only. Every Fail is mapped in the drafts file. Dedupe per OS (user, 2026-10-28): {ndup} Fail rows repeat an existing Android ticket ({nandr} tickets, the 40 A2 bugs included) and are not listed here (dedupe.txt only); a closed Android ticket whose bug is back stays a card naming it (F-{FN["ISS-AMDA-50"]}). No card is on hold. Failure-related cards show their logcat excerpt under 「Log」.</p>
    <dl class="facts">
      <div><dt>Version</dt><dd>16.8.0</dd></div>
      <div><dt>Build No</dt><dd>2610212 (TR OneDrive APK)</dd></div>
      <div><dt>Server</dt><dd>Stage server</dd></div>
      <div><dt>Device</dt><dd>Sony Xperia 10 III · Android 12</dd></div>
      <div><dt>Account</dt><dd class="need" id="f-acct">needed</dd></div>
      <div><dt>TRCode</dt><dd class="need" id="f-tr">{G.TR}? confirm</dd></div>
      <div><dt>Product</dt><dd>PowerDirector Mobile for Android · Generic v16.8</dd></div>
    </dl>
  </header>

  <section class="panel" aria-labelledby="bd">
    <h2 id="bd">Batch decisions</h2>
    <div class="decisions">
      <label for="acct">Filing account (Creator)
        <input type="text" id="acct" class="pending" placeholder="ECL login, e.g. ETHAN_HSU">
        <small>From the A2 batch (filed 2026-10-28) — confirm. Becomes Creator on every ticket.</small>
      </label>
      <label for="tag">Source tag
        <input type="text" id="tag" class="pending" value="AIAgent">
        <small>[AIAgent], as for every casebook batch.</small>
      </label>
      <label for="tr">TRCode
        <input type="text" id="tr" class="pending" value="{DEF['tr']}">
        <small>From the A2 batch — confirm (\"Same TR\"). Same build 2610212 as A2; the TR title names 16.8.0.2610212 while its Build field reads 2610171 (A2 was filed as 2610212 on the user's word).</small>
      </label>
      <div class="radios" role="radiogroup" aria-labelledby="mlab">
        <span id="mlab" style="font-weight:600">Filing method</span>
        <label><input type="radio" name="method" id="m-api" value="API" checked> API (new way) <small>ecl_if3.py create plus attachment upload, if the Android v16.8 template is on IF3.</small></label>
        <label><input type="radio" name="method" id="m-web" value="Browser form"> Browser form (old way) <small>ECL web form through the browser pane, every field by hand.</small></label>
      </div>
    </div>
  </section>

  <section class="panel" aria-labelledby="tl">
    <h2 id="tl">Where the run landed</h2>
    <div class="tally" id="tally"></div>
    <p class="cal"><b>Proposed severities:</b> no S1. S2 for money ({S2F}: a failed paid update keeps its 12 credits); S3 for everything else. Owner RD throughout, no [UX] (RD, 2026-10-21). Four cards are Android system Back paths from REQ-051 ({SBF}). Two cards rest on real failures caught on the phone (no fault switches on Android 16.8), named in their QA notes.</p>
    <div class="toolbar">
      <button type="button" id="fileAll">File all</button>
      <button type="button" id="holdAll">Hold all</button>
      <button type="button" id="reset">Reset to proposal</button>
    </div>
  </section>

  <main id="cards" style="display:grid;gap:16px"></main>

  <section class="panel" aria-labelledby="nf">
    <h2 id="nf">Questions for PM, held items and not a bug</h2>
    <p class="cal" style="margin:0">Failures that match an existing Android ticket are not listed here (dedupe per OS, user 2026-10-28; see dedupe.txt). Team rule (2026-10-21): no comments, no reopen, no reject on existing tickets.</p>
    <div class="tbl"><table id="fxtbl"><thead><tr><th>Case</th><th>Outcome</th></tr></thead><tbody></tbody></table></div>
  </section>

  <section class="panel" aria-labelledby="gp">
    <h2 id="gp">Gaps you should know about</h2>
    <p class="cal" style="margin:0">{counts.get("Blocked", 0)} cases are <b>Blocked</b> with no verdict: {bsum}. Android 16.8 has no fault switches and no clip or scene image failed in this round, so the failure-path rows wait for a real failure or an RD fixture; new-account, Pro, purchase, app-language, daily-limit and REQ-019 template rows wait for their fixtures; A4-j ran its fresh-install rows, and TC-224 stays Blocked because Stage shows no daily chat count.</p>
    <div class="tbl"><table id="blk"><thead><tr><th>Case</th><th>Why it is Blocked</th></tr></thead><tbody></tbody></table></div>
  </section>

  <section class="panel" aria-labelledby="cd">
    <h2 id="cd">Copy decisions</h2>
    <div class="toolbar"><button type="button" class="primary" id="copy">Copy decisions</button><span id="copied" class="cal" role="status"></span></div>
    <textarea id="out" readonly aria-label="Decisions table"></textarea>
  </section>
</div>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Evidence">
  <img id="lbimg" alt="">
  <div class="cap"><button type="button" id="lbprev">← Prev</button><span id="lbcap"></span><button type="button" id="lbnext">Next →</button><button type="button" id="lbclose">Close</button></div>
</div>

<script>
const DATA = '''
R = [
 ('`<section class="logbox"><h4>Log <span>${esc(l.name)}</span></h4><pre>${esc(l.text)}</pre></section>`',
  '`<details class="logbox"><summary>Log <span>${esc(l.name)}</span></summary><pre>${esc(l.text)}</pre></details>`'),
 ('const KEY = "amd-ebug-review-20261027-p9-v1";', 'const KEY = "amd-ebug-review-20261028-a4-android-v1";'),
 ("`<span class=\"chip\"><b>392</b> P9 cases</span>", f"`<span class=\"chip\"><b>{len(results)}</b> A4 cases</span>"),
 ("add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} for build 189872 — confirm. ${DEF.from} used ${DEF.tr_prev} (build ${DEF.build}), so \"Same TR\" does not apply to this build.`);",
  "add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} — from ${DEF.from}; same build 2610212, confirm.`);"),
 ('const rtb = document.querySelector("#rctbl tbody");\nDATA.rechecks.forEach(([c, k, s, w]) => rtb.insertAdjacentHTML("beforeend", `<tr><td class="mono">${esc(c)}</td><td class="mono">${esc(k)}</td><td>${esc(s)}</td><td>${esc(w)}</td></tr>`));\n', ''),
 ("fT.textContent = `${DEF.tr} — this build (189872), confirm`;", "fT.textContent = `${DEF.tr} — this build (2610212), confirm`;"),
]
for a, b in R:
    if a not in tail:
        sys.exit(f"shell text not found: {a[:90]}")
    tail = tail.replace(a, b, 1)
html = style + body + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + tail
if not html.lstrip().lower().startswith("<meta charset"):
    html = '<meta charset="utf-8">\n' + html
if 'name="viewport"' not in html:
    html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">', 1)
left = re.findall(r"189872|P9 case|iPhone 17", html[:html.index("const DATA")] + html[html.index("const KEY"):])
if left:
    print(f"note: iOS text left in the page: {left}")
open(PAGE, "w", encoding="utf-8").write(html)
print(f"wrote {PAGE} ({len(html) // 1024} KB, {len(entries)} cards, {nhold} on hold)")

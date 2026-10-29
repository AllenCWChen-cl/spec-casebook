#!/usr/bin/env python3
"""Build the A2 Android eBug review page from upload/bodies.json.

Reuses the iOS P9 review page's stylesheet (ios/ebugs/2026-10-27-p9) and its card / decisions script, with Android text, a
PM-questions table and the Blocked groups. Run after ebugs.py, drafts_to_bodies.py, check_ebug_format.py and the dedupe.
Thumbnails are made with `sips` (no Pillow on this machine). Nothing is filed; the page is a self-contained file here.
"""
import base64, csv, json, os, re, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ebugs as G

REPO, OUT, RUN = G.REPO, G.OUT, G.RUN
SHELL = f"{REPO}/library/pdr/ai-mini-drama/ios/ebugs/2026-10-27-p9/20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html"
PAGE = f"{OUT}/20261027_eBug_review_AI-Mini-Drama-A2_16.8.0.html"

WHY = {
 "ISS-AMDA-01": "Surprise me is meant to inspire with random picks; five taps give the same line.",
 "ISS-AMDA-02": "The first result card uses another title than the spec and than later cards in the same chat.",
 "ISS-AMDA-03": "The Gender filter offers the same option twice.",
 "ISS-AMDA-04": "White characters (offered by Create my character) cannot be found with the filter.",
 "ISS-AMDA-05": "Every character generation is priced and charged ◆4 where the Design says ◆6 (MX/RD to settle the price).",
 "ISS-AMDA-06": "The plural Finish your characters subtitle is neither the Design nor the PM wording.",
 "ISS-AMDA-07": "The Update characters card does not say how many characters it charges for.",
 "ISS-AMDA-08": "X and 「Leave」 (which promise not to save) still apply the new looks and commit the cast.",
 "ISS-AMDA-09": "Paid looks that already finished are thrown away by Leave anyway, with no refund (12 credits).",
 "ISS-AMDA-10": "Asking to change a character gets another question and only one character to pick.",
 "ISS-AMDA-11": "Answering Iris by typing a name (a spec'd path) does not lead to the Update characters card.",
 "ISS-AMDA-12": "The character update shows status and result messages other than the spec's.",
 "ISS-AMDA-13": "Back in the first seconds of a paid character update leaves silently while the job runs on.",
 "ISS-AMDA-14": "Tapping outside the generating sheet should ask to stop, as X does.",
 "ISS-AMDA-15": "Over-limit text is silently cut to 1,000 characters by the expanded editor (newer Design: keep it).",
 "ISS-AMDA-16": "Long descriptions cannot be scrolled in place; a drag opens the editor (which then cuts the text).",
 "ISS-AMDA-17": "Looks the user closed without saving still fill the Mine library.",
 "ISS-AMDA-18": "The result page lacks the spec's Discard button.",
 "ISS-AMDA-19": "Delete-character dialog copy differs from the spec.",
 "ISS-AMDA-20": "Storyboard and video jobs do not show the PM 10/22 two-stage messages; the storyboard charges image by image.",
 "ISS-AMDA-21": "PM 10/22 removes stop / pause after Generate; the ■ button is still there and cancels jobs, a video too, with no warning (retest TC-157).",
 "ISS-AMDA-22": "Video stage ① exits leave silently instead of asking 「Leave while we're preparing?」 (PM 10/22).",
 "ISS-AMDA-23": "Storyboard stage ② still offers to stop and forfeit credits, where PM 10/22 keeps it going with a toast.",
 "ISS-AMDA-24": "A storyboard does not finish in the background when the app is swiped away.",
 "ISS-AMDA-25": "The first storyboard shows one skeleton row, not per-scene progress.",
 "ISS-AMDA-26": "After a scene image update the Storyboard Preview is not rebuilt.",
 "ISS-AMDA-27": "Saved storyboard / video dramas reopen at the outline, not where the user left.",
 "ISS-AMDA-28": "Reopened dramas lose their confirmed (paid) cast and even the characters card.",
 "ISS-AMDA-29": "Chats lose earlier messages and cards after a reopen, a Stop or a resume.",
 "ISS-AMDA-30": "The ↓ button sits at the bottom centre instead of the bottom right.",
 "ISS-AMDA-31": "The sent message is not lifted to the top and the view follows the reply (PM 10/20 §13.2).",
 "ISS-AMDA-32": "After History, Choose Character or Full Edit the chat keeps the old position; PM 10/20 wants the bottom.",
 "ISS-AMDA-33": "History shows a character close-up instead of the storyboard's first frame.",
 "ISS-AMDA-34": "Merely opening a drama (Choose Character › Cancel) moves it to the top of History.",
 "ISS-AMDA-35": "Generate shows no balance-after line (Design MX frames).",
 "ISS-AMDA-36": "The video settings card misses the 「Model • Seedance」 row.",
 "ISS-AMDA-37": "A scene video update shows no updating state and appends a new card instead of replacing the video.",
 "ISS-AMDA-38": "Download during a scene update saves the old clips instead of saying it is still updating.",
 "ISS-AMDA-39": "Play opens the player paused; a second tap is needed.",
 "ISS-AMDA-40": "A rename during generation is not picked up by the push, and no toast shows.",
 "ISS-AMDA-41": "Leaving the export page cancels the export (PM 10/22: keep exporting in the background).",
 "ISS-AMDA-42": "Export pages show another drama's thumbnail.",
 "ISS-AMDA-43": "Outline, character, revision, storyboard and export waits run 27–323 s, a full video 845 s (retest TC-173), with only Stop or leaving possible.",
 "ISS-AMDA-44": "An offline failure tells the user the service is busy.",
 "ISS-AMDA-45": "On a fresh install the first video never asks 「Get notified when your video is ready?」, so Notify me / Not now are unreachable (TC-303 / TC-304 Blocked behind it).",
 "ISS-AMDA-46": "After leaving a running video, History opens an empty new chat instead of the drama for about 2 minutes.",
}
RELATED = {
 "ISS-AMDA-01": "Related, closed: DRA262610-0026 (Close — 「Surprise me appends different inspirations in the same session」). The current build appends one fixed pick; R-014/R-287 ask for random picks.",
 "ISS-AMDA-02": "Related, closed: DRA262610P0080 ([SPEC], Close). Not DRA262610P0126 (outline editor, ProposeNAB).",
 "ISS-AMDA-03": "Related, not duplicate: DRA262610-0020 (「Others」 vs 「Other」 label), DRA262610P0284 (filter stays English in Japanese).",
 "ISS-AMDA-05": "No likely duplicate (dedupe matched only on 'character generation'). Related: DRA262610P0113 (credit info on the sheet).",
 "ISS-AMDA-12": "Related: DRA262610P0304 (technical status names, NewCreated) — 「Updating character configuration.」 is one of them.",
 "ISS-AMDA-15": "Related, closed: DRA262610P0018 (Close — 「description accepts more than 1000 characters」): the cut may come from that fix; the newer Design 1005_Update keeps the text.",
 "ISS-AMDA-17": "Related, not duplicate: DRA262610P0262 (no Discard dialog — an existing Android ticket, not refiled). iOS ticket DRI261896P0037 (iOS only, not a duplicate).",
 "ISS-AMDA-20": "Related, not duplicate: DRA262610P0122 / P0197 (user bubble), DRA262610P0226 (blank video card), DRA262610P0305 (progress returns to Thinking), DRA262610P0304 (technical status names).",
 "ISS-AMDA-21": "Related: DRA262610P0211 (Send stays Stop), DRA262610-0049 / -0057 / P0213 (Stop without notes) — existing Android tickets, not refiled.",
 "ISS-AMDA-22": "Storyboard counterpart: DRA262610P0077 (Assigned). Not DRA262610-0019 (Close, keep-making notice).",
 "ISS-AMDA-24": "Related: DRA262610P0026 (NewCreated — video stops while in another feature and restarts on return), DRA262610P0223 (false offline error after background).",
 "ISS-AMDA-27": "Related: DRA262610P0260 (Assigned — chat jumps back to the Story Outline after Generate). iOS ticket DRI261896P0032 (iOS only, not a duplicate).",
 "ISS-AMDA-29": "Related: DRA262610P0303 (Storyboard Preview card removed after the drama is generated), DRA262610P0063 (prompt question disappears after Continue).",
 "ISS-AMDA-31": "Related: DRA262610P0125 (Assigned) asks for auto-scroll to the newest message (older rule); PM 10/20 §13.2 is newer.",
 "ISS-AMDA-37": "Related, not duplicate: DRA262610P0038 (Regenerate Clip fails), DRA262610P0190 / P0160 (regenerating clip).",
 "ISS-AMDA-38": "Export part: DRA262610P0192 (Assigned). iOS ticket DRI261895P0028 (iOS only, not a duplicate).",
 "ISS-AMDA-40": "Not DRA262610P0250 (notification arrives late).",
 "ISS-AMDA-41": "Related: DRA262610P0243 / P0219 (export sheet and page).",
 "ISS-AMDA-43": "The one-character wait (TC-170) is left out: an existing Android ticket covers it (dedupe.txt). iOS tickets DRI261895P0029 / DRI261895P0031 / DRI261897P0008 (iOS only, not duplicates). Read-only ECL dedupe of the 301-ticket Android pool (2026-10-28): no other likely duplicate.",
 "ISS-AMDA-45": "Read-only ECL dedupe (301 Android tickets): no likely duplicate. Not DRA262610P0250 / P0267 (the 「Your drama is ready」 push itself). iOS ticket DRI261895P0022 (same symptom; iOS only, so not a duplicate — dedupe per OS, 2026-10-28).",
 "ISS-AMDA-46": "Related, not duplicate: DRA262610P0026 (NewCreated, PM — the video stops while away and restarts on return), DRA262610P0306 / P0103 (other new-chat issues).",
}


def thumb(path):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, "t.jpg")
        subprocess.run(["sips", "-Z", "900", "-s", "format", "jpeg", "-s", "formatOptions", "60", path, "--out", out],
                       check=True, capture_output=True)
        return "data:image/jpeg;base64," + base64.b64encode(open(out, "rb").read()).decode()


s = open(SHELL, encoding="utf-8").read()
style = s[:s.index("</style>")]
style = style.replace("<title>AI Mini Drama P9 eBugs</title>", "<title>AI Mini Drama A2 eBugs</title>")
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
FILED_JSON = f"{OUT}/filed_bugcodes.json"
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
 "defaults": {"found": True, "from": "the iOS batch 2026-10-27-p9 (no Android batch filed yet)", "creator": "ETHAN_HSU",
              "tr": G.TR, "tr_prev": G.TR, "tag": "AIAgent", "method": "API", "version": G.V, "build": G.B},
 "filed": filed,
}
nhold = sum(1 for e in entries if e["action"] == "hold")
FN = {e["iss"]: e["n"] for e in entries}
def F(*iss):
    return ", ".join(f"F-{FN[i]}" for i in iss)
ndrop = len(G.SAME_OS)
nandr = len(G.recheck_tickets())
S2F = F("ISS-AMDA-09") + "; confirmed cast lost on reopen " + F("ISS-AMDA-28")
DOCF = ", ".join(f"F-{e['n']}" for e in entries if "Doc" in e["belong"]) or "none"
PMF = F("ISS-AMDA-20", "ISS-AMDA-21", "ISS-AMDA-22", "ISS-AMDA-23", "ISS-AMDA-24", "ISS-AMDA-41")
FILED_LINE = (f"Filed {filed['meta']['filed_on']}: all {len(filed['bugs'])} cards as {min(v['code'] for v in filed['bugs'].values())}–{max(v['code'] for v in filed['bugs'].values())[-4:]} on {filed['meta']['tr']} (16.8.0 build 2610212; the TR's Build field reads 2610171, the user confirmed 2610212), Creator {filed['meta']['creator']}, decisions in decisions.md; images shown as uploaded, with the red box. No existing ticket was commented on." if filed else "Nothing has been filed, uploaded or commented.")
bsum = ", ".join(f"{v} {k}" for k, v in sorted(bcount.items(), key=lambda x: -x[1]))
body = f'''</style>

<div class="wrap">
  <header style="display:grid;gap:10px">
    <div class="eyebrow">pdr-spec-casebook · PowerDirector Mobile for Android · eBug filing review</div>
    <h1>AI Mini Drama Android — phase A2 (table v2) on 2610212: {len(entries)} findings from {len(results)} cases</h1>
    <p class="lede">These cards are the eBug entries exactly as they would be filed. For each one, set file or hold, severity, owner and type, and add any context. Then use Copy decisions and paste the result back. {FILED_LINE} A2 ran {len(results)} cases of table v2 (draft 20261027-171228) on 16.8.0 (2610212), {G.TR}, Stage server, signed in (Free), 2026-10-27 17:22 → 10-28 03:10, plus the 10/28 retest (A2-r1 after a credit top-up, A2-r2 after a fresh install; 11:00 → 14:25): {counts.get("Pass", 0)} Pass, {counts.get("Fail", 0)} Fail, {counts.get("Blocked", 0)} Blocked. The retest added ISS-AMDA-45 / 46 and grew ISS-AMDA-21 / 43 (marked 「retest」 in their QA notes). Every Fail and every observation O-1…O-27 is mapped in the drafts file (entry, Android duplicate, PM question, not a bug). Dedupe per OS (user, 2026-10-28): findings that match an existing Android ticket, open or resolved, are not listed on this page ({ndrop} former cards, the one-character wait of ISS-AMDA-43 and the former recheck rows; {nandr} Android tickets in all, kept only in dedupe.txt). An iOS ticket never makes a finding a duplicate; iOS matches are named only in the related line of a card. No card is on hold. Failure-related cards show their logcat excerpt under 「Log」.</p>
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
        <small>No Android casebook batch has been filed yet; the suggestion comes from the iOS batch. Becomes Creator on every ticket.</small>
      </label>
      <label for="tag">Source tag
        <input type="text" id="tag" class="pending" value="AIAgent">
        <small>[AIAgent], as for every casebook batch.</small>
      </label>
      <label for="tr">TRCode
        <input type="text" id="tr" class="pending" value="">
        <small>{G.TR} is the TR the run's APK came from; its title names 16.8.0.2610212, but its Build field reads 16.8.0.2610171 (read-only check). Confirm before filing.</small>
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
    <p class="cal"><b>Proposed severities:</b> no S1. S2 for money and lost work (finished looks dropped with no refund {S2F}); S3 for flow and behaviour gaps; S4 for copy, layout and minor flow. Owner RD throughout, Doc for pure copy ({DOCF}); no [UX] (RD, 2026-10-21). Several cards rest on the PM Figma 10/22 frames (§13.24 two-stage storyboard / video, export states) that RD is still to confirm (PM Open questions #20) — {PMF}.</p>
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
    <p class="cal" style="margin:0">{counts.get("Blocked", 0)} cases are <b>Blocked</b> with no verdict: {bsum}. Android 16.8 has no fault switches (planned for a later Android build), so every failure-path row needs a real failure or an RD fixture; new-account, Pro, purchase, app-language and REQ-019 template rows wait for their fixtures; the Stage server never hit the daily chat limit (and shows no remaining-chat count, TC-224); TC-303 / TC-304 are Blocked behind ISS-AMDA-45. The credit and uninstall blocks were cleared by the 10/28 retest.</p>
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
 ('const KEY = "amd-ebug-review-20261027-p9-v1";', 'const KEY = "amd-ebug-review-20261027-a2-android-v2";'),
 ("`<span class=\"chip\"><b>392</b> P9 cases</span>", f"`<span class=\"chip\"><b>{len(results)}</b> A2 cases</span>"),
 ("add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} for build 189872 — confirm. ${DEF.from} used ${DEF.tr_prev} (build ${DEF.build}), so \"Same TR\" does not apply to this build.`);",
  "add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} — the TR of this build's APK, confirm (no earlier Android batch).`);"),
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

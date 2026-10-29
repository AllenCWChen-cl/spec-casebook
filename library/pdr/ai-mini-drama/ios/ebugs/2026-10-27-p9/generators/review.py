#!/usr/bin/env python3
"""Build the P9 eBug review page from upload/bodies.json, reusing the P4 review page's layout (same HTML and script,
new data and header text). Run after ebugs.py, drafts_to_bodies.py, check_ebug_format.py and the dedupe. Not published:
the page is a self-contained file in this folder (the orchestrator publishes it)."""
import base64, csv, io, json, os, re, subprocess, sys

REPO = "/Users/ethanhsu/Desktop/pdr-spec-casebook"
ROOT = f"{REPO}/library/pdr/ai-mini-drama/ios"
OUT = f"{ROOT}/ebugs/2026-10-27-p9"
SHELL = f"{ROOT}/ebugs/2026-10-21-p4/20261021_eBug_review_AI-Mini-Drama-P4_16.9.0.html"
RUN = f"{ROOT}/runs/2026-10-22-p9-full"
sys.path.insert(0, f"{OUT}/generators")
import ebugs as G

WHY = {
 "ISS-AMD-50": "The credit pill is the one top exit that skips the leave guard, so a chat the user meant to drop is saved, or a paid job runs on unseen.",
 "ISS-AMD-51": "Users see internal codes like ja_JP in Iris's replies.",
 "ISS-AMD-52": "A partial character failure is reported as if only one character existed; the spec's partial-failure dialog never shows.",
 "ISS-AMD-53": "The dialog says credits were refunded, yet 1–4 credits stay charged for every failed character (rule 8).",
 "ISS-AMD-54": "Character generation (up to 4 min) cannot be cancelled and shows no time hint, against the PM 10/16 rows.",
 "ISS-AMD-55": "Credits are taken for character portraits without any offer card or Generate tap, and the turn then fails.",
 "ISS-AMD-56": "The chat shows a message the user never sent and tells them a storyboard exists when it does not.",
 "ISS-AMD-57": "The chat character-change flow uses different wording, offers one character and skips the progress and result messages.",
 "ISS-AMD-58": "Answering Iris by typing a name (a spec'd path) does not lead to the Update characters card.",
 "ISS-AMD-59": "The Update characters card does not say how many characters it will charge for.",
 "ISS-AMD-60": "In the first seconds of a paid job Back leaves silently while the job keeps running.",
 "ISS-AMD-61": "Pasted text over 1,000 characters is silently cut, against the newer Design rule.",
 "ISS-AMD-62": "Reopening a saved drama loses the user's messages and sometimes the character card needed to continue.",
 "ISS-AMD-63": "Failed storyboard and scene image runs keep −1/−3 credits with no refund (rule 8); not covered by DRI261897P0016.",
 "ISS-AMD-64": "The storyboard update shows a generic skeleton instead of marking the scene being changed.",
 "ISS-AMD-65": "After a storyboard is cut or changed, the preview still plays the old one.",
 "ISS-AMD-66": "An app-side threading error ('token_request fired outside a turn worker thread') fails chat turns.",
 "ISS-AMD-67": "The whole-storyboard failure lacks the spec's explanation line (the video failure has its counterpart).",
 "ISS-AMD-68": "After History or Choose Character the chat stays scrolled up instead of showing the newest message (PM 10/20).",
 "ISS-AMD-69": "Closing the History info bubble by tapping a card also opens that drama.",
 "ISS-AMD-70": "Iris declines title changes once characters exist, so History cannot follow the drama title.",
 "ISS-AMD-71": "No video reached filming on 189872: every video upload to storage failed after ~6 min over two days.",
 "ISS-AMD-72": "Try again after a failed video drops the model choice.",
 "ISS-AMD-73": "Offline sends show a generic banner instead of the AI Mini Drama offline copy that the app itself logs.",
}
# Read-only dedupe (dedupe.txt), each candidate read with ecl_query.py bug. Duplicates start on hold.
DUP = {
 "ISS-AMD-53": ("DRI261897P0016", "Propose Wont Fix", "Same defect (characters and videos keep credits), filed on 189729 and proposed Won't Fix by RD. Still reproduces on 189872. Drafted per rule 8; refiling re-raises RD's decision — keep on hold unless you want to contest it."),
 "ISS-AMD-54": ("DRI261895P0024", "QA Propose Wont Fix", "No usable Stop during character generation (filed on 189520, before the PM 10/16 board 9 rows that add Cancel and the time hint). New grounds exist (PM 10/16); hold, or file citing them against DRI261895P0024."),
 "ISS-AMD-60": ("DRI261896P0048", "Assigned", "No Stop and lose your credits? on Back during storyboard generation. On 189872 the dialog now appears later in the job, but Back in the first seconds still leaves silently — same ticket, partly fixed."),
 "ISS-AMD-71": ("DRI261897P0006", "Assigned (S1)", "Video generation always fails after ~6 min as the storage upload times out (filed on 189729). Still reproduces on 189872 with the same log cause; listed as a recheck. Drafted per the batch brief with fresh log excerpts."),
}
RELATED = {
 "ISS-AMD-50": "Not a duplicate: DRI261896P0048 (Back during storyboard), DRI261896P0049 (pill balance) and DRI261894P0049 (Back vs History icon) are other exits.",
 "ISS-AMD-52": "Related: DRI261896P0042 (TRCreated — failure showed no error at all; partly fixed now). Not a duplicate: the partial-failure copy is new (PM Update board 3).",
 "ISS-AMD-55": "No likely duplicate (dedupe matched only on 'offer card').",
 "ISS-AMD-56": "No likely duplicate. Related: DRI261894P0013 (NotReproducible), DRI261894P0024.",
 "ISS-AMD-57": "No likely duplicate. Related: DRI261896P0054 (wrong prompt after a cast change following a storyboard).",
 "ISS-AMD-58": "Not a duplicate of DRI261897P0032 (raw CMS keys on the Update characters card).",
 "ISS-AMD-59": "Not a duplicate of DRI261897P0032 (raw CMS keys on the Update characters card).",
 "ISS-AMD-61": "Not a duplicate of DRI261897P0019 (text under the expand icon).",
 "ISS-AMD-62": "No likely duplicate. Related: DRI261893-0055 (Close), DRI261895P0034 (ProposeNAB).",
 "ISS-AMD-63": "Related, not duplicate: DRI261897P0016 covers characters and videos only; DRI261896P0045 / DRI261894P0036 are the silent failures.",
 "ISS-AMD-64": "Related, not duplicate: DRI261896P0045 (the update then fails silently).",
 "ISS-AMD-65": "Not a duplicate of DRI261897P0010 (no video card after a preview Retry).",
 "ISS-AMD-68": "Related: DRI261896P0056 asked to keep the old position (older rule); PM 10/20 §13.2 now says open at the bottom — RD may close P0056 against this one.",
 "ISS-AMD-69": "Related: DRI261896P0026 (outside tap did not dismiss) — now dismisses, but the tap passes through.",
 "ISS-AMD-72": "Related, not duplicate: DRI261896P0051 (Try again asked which beat to modify — TRCreated); the symptom on 189872 is a length-only card.",
}


def thumb(path):
    from PIL import Image
    im = Image.open(path).convert("RGB")
    im.thumbnail((720, 720 * 3))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=62)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


s = open(SHELL, encoding="utf-8").read()
i = s.index("const DATA = ") + len("const DATA = ")
_, end = json.JSONDecoder().raw_decode(s[i:])
head, tail = s[:i], s[i + end:]

bodies = json.load(open(f"{OUT}/upload/bodies_all.json", encoding="utf-8"))  # every card, held ones too
decided = json.load(open(f"{OUT}/upload/bodies.json", encoding="utf-8"))   # decisions.md applied: filed entries, final sev
DEC = {b["iss"]: b for b in decided.values()}
E = {e["iss"]: e for e in G.E}
entries = []
for k, b in bodies.items():
    e = E[b["iss"]]
    def src(f):  # boxed frame as filed when it exists
        p = f"{OUT}/upload_filing/{f}"
        return p if os.path.exists(p) else os.path.join(b["images_dir"], f)
    imgs = [{"src": thumb(src(f)), "name": f} for f in b["files"] if f.endswith(".jpg")]
    logs = [f for f in b["files"] if f.endswith(".txt")]
    logtext = [{"name": f, "text": open(os.path.join(b["images_dir"], f), encoding="utf-8").read()} for f in logs]
    if b["iss"] in DEC:
        b = {**b, "sev": DEC[b["iss"]]["sev"], "belong": DEC[b["iss"]]["belong"]}
    d = DUP.get(b["iss"])
    rel = RELATED.get(b["iss"], "Read-only ECL dedupe: no likely duplicate.")
    if logs:
        rel += f" Log excerpt attached: {', '.join(logs)} (token-checked; signed URLs cut) — text in the Log section below."
    entries.append(dict(n=int(b["entry"]), iss=b["iss"], title=b["title"], type=b["type"], sev=int(b["sev"]), belong=b["belong"],
                        out=int(b["out"]), times=int(b["times"]), short=b["short"], desc=b["desc"], note=b["qa_note"],
                        why=WHY[b["iss"]], imgs=imgs, cases=e["cases"],
                        dup={"code": d[0], "status": d[1], "text": d[2]} if d else None,
                        related=rel, logs=logtext, action="file" if b["iss"] in DEC else "hold"))
results = list(csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig")))
counts = {}
for r in results:
    counts[r["Result"]] = counts.get(r["Result"], 0) + 1
blocked = [[r["ID"], f"{r['Disposition']} — {r['Actual'][:260]}{'…' if len(r['Actual']) > 260 else ''}"] for r in results if r["Result"] == "Blocked"]
data = {
 "entries": entries,
 "blocked": blocked,
 "counts": counts,
 "rechecks": [list(x) for x in G.RECHECKS],
 "fixes": [[f"{k} · HELD", f"{d.upper()} — {q}"] for k, d, q in G.HELD] +
          [[f"{c} · {t}", f"FIXED / PARTLY FIXED — {saw}"] for c, t, saw in G.FIXED] +
          [[k, f"NOT A BUG — {a}: {b}"] for k, a, b in G.NOT_BUG],
}
data["defaults"] = json.loads(subprocess.run(["node", f"{REPO}/scripts/ebug-defaults.ts", "pdr/ai-mini-drama", "ios", "--json"],
                                             check=True, capture_output=True, text=True, cwd=REPO).stdout)
# TRCode for this build: the previous batch's TR (TR261019-0014) is build 189729, so it is not "the same TR".
data["defaults"]["tr_prev"] = data["defaults"]["tr"]
data["defaults"]["tr"] = G.TR
data["filed"] = None
if os.path.exists(f"{OUT}/filed_bugcodes.json"):
    _f = json.load(open(f"{OUT}/filed_bugcodes.json", encoding="utf-8"))
    _tags = [re.match(r"^\S+ \S+ - \[([A-Za-z-]+)\]", x["short"]).group(1) for x in _f["bugs"]]
    data["filed"] = {"meta": {**_f["meta"], "method": "API" if _f["meta"]["method"].startswith("api") else _f["meta"]["method"], "tag": _tags[0]},
                     "bugs": {x["iss"]: {"code": x["bugcode"], "sev": x["severity"], "belong": x["belong"], "files": len(x["attachments"])} for x in _f["bugs"]}}
FILEDTXT = (f"Filed {data['filed']['meta']['filed_on']} by {data['filed']['meta']['creator']} on {data['filed']['meta']['tr']} via API after the user's decisions (decisions.md): {len(data['filed']['bugs'])} bugs, {data['filed']['bugs'][min(data['filed']['bugs'])]['code']}–{data['filed']['bugs'][max(data['filed']['bugs'])]['code']}, every one read back; the 4 duplicates stayed on hold and no existing ticket was touched."
            if data["filed"] else "Nothing has been filed, uploaded or commented.")
html = head + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + tail
nhold = sum(1 for e in entries if e["action"] == "hold")
R = [
 ("<title>AI Mini Drama P4 eBugs</title>", "<title>AI Mini Drama P9 eBugs</title>"),
 ('<details><summary>Repro steps, result and note as filed</summary><pre>${esc(e.desc)}</pre></details>',
  '<details><summary>Repro steps, result and note as filed</summary><pre>${esc(e.desc)}</pre></details>\n    ${(e.logs||[]).map(l => `<section class="logbox"><h4>Log <span>${esc(l.name)}</span></h4><pre>${esc(l.text)}</pre></section>`).join("")}'),
 ("\n</style>", "\n.logbox{border:1px solid var(--line,#8884);border-radius:10px;margin:8px 0}.logbox h4{margin:0;padding:8px 10px;font-size:13px}.logbox h4 span{font:12px var(--mono);opacity:.75;margin-left:6px}.logbox pre{max-height:320px;overflow:auto;font-size:11.5px;white-space:pre}.lb[hidden]{display:none}\n</style>"),
 ("AI Mini Drama — phase P4 (Templates): 3 new findings from 41 cases",
  f"AI Mini Drama — run P9 (full table) on 189872: {len(entries)} findings from {len(results)} cases"),
 (re.search(r'<p class="lede">.*?</p>', html, re.S).group(0),
  f'<p class="lede">These cards are the eBug entries exactly as they would be filed. For each one, set file or hold, severity, owner and type, and add any context. Then use Copy decisions and paste the result back. {FILEDTXT} Every card shows its log excerpt under 「Log」. P9 ran the whole draft table (20261022-145212) on 16.9.0 (189872), {G.TR}, 2026-10-22 15:33 → 10-23 10:00: {counts.get("Pass", 0)} Pass, {counts.get("Fail", 0)} Fail, {counts.get("Blocked", 0)} Blocked. Every Fail and every observation O-1…O-42 is mapped in the drafts file (entries, rechecks, held, not a bug). {nhold} cards are on hold as duplicates of open or declined tickets (storage upload DRI261897P0006, character refunds DRI261897P0016, character Cancel DRI261895P0024, early Back DRI261896P0048). No video was ever generated: every video upload failed (F-22), so 59 video rows are Blocked.</p>'),
 (re.search(r'<p class="cal"><b>Calibration:</b>.*?</p>', html, re.S).group(0),
  '<p class="cal"><b>Calibration:</b> since 2026-10-01 the PowerDirector Mobile for iOS pool is 61% Sev 2 and 37% Sev 3; Sev 1 is 1.6%. Proposed: S1 only for the storage upload that blocks every video (F-22, on hold as DRI261897P0006); S2 for money and lost work (character and storyboard refunds F-4 / F-14, charges with no offer F-6, messages lost on reopen F-13); S3 for the rest. Owner RD throughout (no [UX], RD 2026-10-21).</p>'),
 ("<dd>189729 (TestFlight)</dd>", "<dd>189872 (TestFlight)</dd>"),
 ('<dd class="need" id="f-tr">TR261019-0014? confirm</dd>', f'<dd class="need" id="f-tr">{G.TR}? confirm</dd>'),
 ("<small>[AIAgent], as for the 10/16 and P1 casebook batches.</small>", "<small>[AIAgent], as for every casebook batch.</small>"),
 ("<small>The P1 batch was filed on TR261019-0014 (16.9.0.189729, the same build). Confirm it, or give another TR.</small>",
  f"<small>{G.TR} is the TR for 16.9.0.189872 (this run). The previous batch (2026-10-21-p4) used TR261019-0014, which is build 189729 — not this build.</small>"),
 ("Still reproducing on 189729 (already in eBug) — none in P4", "Rechecks — still reproducing on 189872 (already in eBug, information only)"),
 ("No existing ticket reproduced in P4. The template tickets that need a generated drama were not reachable with Generate withheld.",
  "These P9 failures are tickets that already exist. Team rule (2026-10-21): no comments, no reopen, no reject — listed for information only. DRI261894P0046 (Close) partly reproduces and is a reopen candidate, not acted on."),
 ("<th>P4 case</th>", "<th>P9 case</th>"), ("What P4 saw", "What P9 saw"),
 ("Fixed on 189729, and questions for PM / Design", "Held (not drafted, with the reason), fixed on 189872, and not a bug"),
 (re.search(r'(<h2 id="gp">Gaps you should know about</h2>\s*<p class="cal" style="margin:0">).*?(</p>)', html, re.S).group(0),
  f'<h2 id="gp">Gaps you should know about</h2>\n    <p class="cal" style="margin:0">{counts.get("Blocked", 0)} cases are <b>Blocked</b> with no verdict: 59 by the video gate (no video reached filming, F-22 / DRI261897P0006), the rest by policy (full generation REQ-019, low balance, purchase, chat count, remote config, new account, voice), observability or an upstream failure. Pink fault switches used and set back Off (each read back): Trip image moderation (TC-042/043/121/384 and TC-353, TC-293), Fail turn (TC-030, TC-295), Fail media tool (TC-067/069, TC-137, TC-355); every entry names its switch and was reproduced Off except the lost 「!」 part of F-3. TC-303\'s 10/23 video was read on 10/27 (O-42: the same storage upload failure).</p>'),
 ("<th>Why it was not run</th>", "<th>Why it is Blocked</th>"),
 ('const KEY = "amd-ebug-review-20261021-p4-v2";', 'const KEY = "amd-ebug-review-20261027-p9-v1";'),
 ("`<span class=\"chip\"><b>41</b> P4 cases</span><span class=\"chip\" style=\"color:var(--ok)\"><b>${c.Pass||0}</b> pass</span><span class=\"chip s1\"><b>${c.Fail||0}</b> fail</span><span class=\"chip\"><b>${c['Not run']||0}</b> not run (withheld)</span>`",
  f"`<span class=\"chip\"><b>{len(results)}</b> P9 cases</span><span class=\"chip\" style=\"color:var(--ok)\"><b>${{c.Pass||0}}</b> pass</span><span class=\"chip s1\"><b>${{c.Fail||0}}</b> fail</span><span class=\"chip\"><b>${{c.Blocked||0}}</b> blocked</span>`"),
 ("add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} from ${DEF.from} (${DEF.version} build ${DEF.build})${c}. \"Same build\" / \"Same TR\" = this TR while the build matches.`);",
  "add(document.getElementById(\"tr\").closest(\"label\"), `${DEF.tr} for build 189872 — confirm. ${DEF.from} used ${DEF.tr_prev} (build ${DEF.build}), so \"Same TR\" does not apply to this build.`);"),
 ("fT.textContent = `${DEF.tr} — from ${DEF.from}, confirm`;", "fT.textContent = `${DEF.tr} — this build (189872), confirm`;"),
]
for a, b in R:
    if a not in html:
        sys.exit(f"shell text not found: {a[:90]}")
    html = html.replace(a, b, 1)
chk = html[:html.index("const DATA")] + html[html.index("const KEY"):]
left = re.findall(r"P4[^<\"0-9][^<\"]{0,30}|189729[^<\"]{0,30}", chk)
left = [m for m in left if "build ${DEF.build}" not in m and "TR261019-0014, which is build 189729" not in m]
if left:
    print(f"note: earlier-batch text left in the page: {left}")
if not html.lstrip().lower().startswith("<meta charset"):
    html = '<meta charset="utf-8">\n' + html  # so the local file reads as UTF-8 too
path = f"{OUT}/20261022_eBug_review_AI-Mini-Drama-P9_16.9.0.html"
open(path, "w", encoding="utf-8").write(html)
print(f"wrote {path} ({len(html) // 1024} KB, {len(entries)} cards, {nhold} on hold)")

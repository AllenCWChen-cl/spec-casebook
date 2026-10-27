#!/usr/bin/env python3
"""Pre-filing format check for eBug batches.

Run this on the finished batch BEFORE the first bug is submitted. Filing is
irreversible (every ticket emails Creator/PM/PL) and a malformed Short
Description has to be corrected by hand afterwards, one bug at a time.

Input is a bodies.json in the shape the filer already builds:

    { "F-A": { "sev": 2, "belong": "RD", "out": 2, "times": 2,
               "short": "PDR-I 16.8.0 - [EDF] Video Enhance: ...",
               "desc":  "Repro Steps:\\n1. Launch the APP\\n...",
               "files": ["16.8.0_FA_evidence.jpg"] }, ... }

Usage:
    python3 check_ebug_format.py bodies.json --product PDR-I --version 16.8.0 \
        [--upload-dir upload/] [--features features.txt] [--strict]

Exit code 0 = clean (warnings allowed), 1 = at least one ERROR.
--strict makes warnings fatal too.

Reviewer rules (user, 2026-10-21) are errors: one action per numbered Repro step on its own line
(no '>' / '›' / '→' chains), a Spec Link with a URL or PDF name on every entry, at least one image
per entry, and no video unless the user asked for one (--videos-requested).

UX basis rule (RD, 2026-10-21): [UX] marks a finding with no spec and no in-product reference —
it rests on another product's behaviour or on nothing, and PM decides. So a [UX] entry needs a
'Basis: External — …' or 'Basis: None — …' Note line; a finding referenced to another feature of
the same app ('Basis: In-product — <feature> (<document>)') is Functional or [UI], never [UX]; and
an [AIAgent] (spec-driven) entry never carries [UX]. --allow-agent-ux lifts only that last rule.
"""
import argparse, json, os, re, sys

SOURCE_TAGS = {"EDF", "AIFound", "AIAgent", "MXFound", "AMD", "OEM"}
TYPE_TAGS = {"UI", "UX", "MX"}
BELONGS_WEB = {"RD", "Setup Kit", "PC-Art", "PC-Doc", "PM", "Marketing", "RD-ECL"}
BELONGS_API = {"RD", "RDSK", "PCArt", "PCDoc", "PM", "Marketing", "RD-ECL"}
MAX_SHORT = 140
SOFT_SHORT = 120
MAX_FIRST_LINE = 120   # the one English sentence of Result / Expect Result
MAX_PROSE_LINES = 1    # TR260915-0007 style: one line each
MAX_FIELD = 140        # all English prose in the field (excl. 摘要 / {screenshots} / Spec string)
MAX_SUMMARY = 60       # the 摘要 zh-TW one-liner
MAX_NOTE_LINES = 6     # Device / Spec Link (≤2) / Basis / Related / <Claude Reviewed>
SUMMARY_RE = re.compile(r"^摘要\s*[:：]\s*")
SECTIONS = ["Repro Steps:", "Result:", "Expect Result:", "Note:"]
NOTE_LINE = re.compile(r"\s*(Device:|Spec Link:|Basis:|Related:|Design:|Jira:|<Claude Reviewed>|<GPT Reviewed>)")
BASIS_RE = re.compile(r"^\s*Basis:\s*(In-product|External|None)\b\s*[—–-]?\s*(.*)$", re.I | re.M)
IMAGE_EXT = re.compile(r"\.(jpe?g|png|gif|heic|webp)$", re.I)
LOG_EXT = re.compile(r"_log\.(txt|log|zip)$", re.I)
FAILURE_WORDS = re.compile(r"\b(fail(s|ed|ure)?|went wrong|couldn.t|error|refund(ed)?|charg(e|ed|es)|kept? (its )?credits|no reply|ends? (silently|with nothing))\b", re.I)
VIDEO_EXT = re.compile(r"\.(mp4|mov|m4v|webm|avi)$", re.I)
CHAIN = re.compile(r"\s(?:>|›|→|->)\s|\S(?:›|→)\S")
# text a step may legitimately carry with '>' in it: quoted labels and typed prompts
QUOTED = re.compile(r"「[^」]*」|“[^”]*”|\"[^\"]*\"|『[^』]*』")
PLACEHOLDERS = re.compile(r"\b(TBD|TODO|XXX|FIXME|\?\?\?|<[a-z ]+>)\b", re.I)
# tags, then a feature name, then a colon
SHORT_RE = re.compile(
    r"^(?P<product>[A-Z][A-Za-z\-]*)\s+(?P<version>\d+(?:\.\d+)+)\s+-\s+"
    r"(?P<tags>(?:\[[A-Za-z\-]+\])+)\s+"
    r"(?P<feature>[^:]{2,60}?):\s+(?P<symptom>\S.*)$"
)
# a feature segment that is really the start of a sentence
BAD_FEATURE_START = re.compile(
    r"^(the|a|an|when|after|if|no|not|cannot|can't|is|are|was|were|does|doesn't|do|"
    r"asks?|gives?|shows?|fails?|crashes?|produces?|returns?|happens?)\b", re.I)


class Report:
    def __init__(self):
        self.rows = []
    def add(self, level, key, msg, fix=None):
        self.rows.append((level, key, msg, fix))
    def err(self, key, msg, fix=None):
        self.add("ERROR", key, msg, fix)
    def warn(self, key, msg, fix=None):
        self.add("WARN", key, msg, fix)
    @property
    def errors(self):
        return [r for r in self.rows if r[0] == "ERROR"]
    @property
    def warnings(self):
        return [r for r in self.rows if r[0] == "WARN"]


def check_short(key, short, product, version, rep, features):
    if not short or not short.strip():
        rep.err(key, "Short Description is empty")
        return
    short = short.strip()
    if len(short) > MAX_SHORT:
        rep.err(key, f"Short Description is {len(short)} chars (hard cap {MAX_SHORT})",
                "restate; do not append a subordinate clause")
    elif len(short) > SOFT_SHORT:
        rep.warn(key, f"Short Description is {len(short)} chars (budget {SOFT_SHORT})")

    m = SHORT_RE.match(short)
    if not m:
        # work out which part is missing, so the message is actionable
        if not re.match(r"^[A-Z][A-Za-z\-]*\s+\d+(\.\d+)+\s+-\s+", short):
            rep.err(key, "Short Description is missing the '<PRODUCT> <VERSION> - ' prefix",
                    f"prepend '{product} {version} - '")
        if not re.search(r"\[[A-Za-z\-]+\]", short):
            rep.err(key, "Short Description carries no [source] tag",
                    "add [EDF] / [AIFound] / [MXFound]")
        if ":" not in short.split("]")[-1]:
            rep.err(key, "Short Description has NO FEATURE NAME "
                         "(nothing of the form '<Feature>: ' after the tags)",
                    "name the feature the user was in, then a colon")
        if not rep.rows or rep.rows[-1][1] != key:
            rep.err(key, "Short Description does not match "
                         "'<PRODUCT> <VERSION> - [tags] <Feature>: <symptom>'")
        return

    if m.group("product") != product:
        rep.err(key, f"product is {m.group('product')!r}, expected {product!r}")
    if m.group("version") != version:
        rep.err(key, f"version is {m.group('version')!r}, expected {version!r}")

    tags = re.findall(r"\[([A-Za-z\-]+)\]", m.group("tags"))
    if tags[0] not in SOURCE_TAGS:
        rep.warn(key, f"first tag [{tags[0]}] is not a known source tag {sorted(SOURCE_TAGS)}")
    for t in tags[1:]:
        if t not in TYPE_TAGS:
            rep.err(key, f"[{t}] is not a valid type tag; use {sorted(TYPE_TAGS)}")
    if len(tags) > 2:
        rep.warn(key, f"{len(tags)} tags; the convention is [source] plus at most one [type]")

    feature = m.group("feature").strip()
    if BAD_FEATURE_START.match(feature):
        rep.err(key, f"feature segment {feature!r} reads as a sentence, not a feature name",
                "the token after the tags must begin a noun phrase ending in ':'")
    if feature != feature.strip() or "  " in feature:
        rep.warn(key, f"feature segment {feature!r} has odd whitespace")
    if features is not None and feature not in features:
        rep.warn(key, f"feature {feature!r} is not in the known-feature list",
                 "check it against the app's own on-screen name")
    if feature.islower():
        rep.warn(key, f"feature {feature!r} is all lower case; use the app's own capitalisation")

    symptom = m.group("symptom").strip()
    if symptom.endswith("."):
        rep.warn(key, "symptom ends with a full stop; house style has none")
    if PLACEHOLDERS.search(short):
        rep.err(key, "Short Description still contains a placeholder")
    return tags


def check_steps(key, steps, rep):
    """Reviewer rule (2026-10-21): each numbered step is one action on its own line."""
    for m in re.finditer(r"^\s*(\d+)\.\s*(.*)$", steps, re.M):
        n, text = m.group(1), QUOTED.sub("「」", m.group(2))
        if CHAIN.search(text):
            rep.err(key, f"Repro step {n} chains actions with '>' / '›' / '→': {m.group(2).strip()[:60]!r}",
                    "one action per step: 'Mine > Credits > Details' becomes Tap Mine / Tap Credits / Tap Details")
        if re.search(r"(?:[.;,]\s+|\s{2,})\d+\.\s+[A-Z]", text):
            rep.err(key, f"Repro step {n} holds several numbered steps on one line: {m.group(2).strip()[:60]!r}",
                    "put every step on its own line")
        elif re.search(r",\s*(?:and\s+)?then\s|;\s*then\s", text, re.I):
            rep.warn(key, f"Repro step {n} looks like two actions ('then'): {m.group(2).strip()[:60]!r}",
                     "split it into one numbered step per action")


def check_basis(key, tags, note, belong, rep, allow_agent_ux):
    """UX basis rule (RD, 2026-10-21): the type tag follows what the expectation rests on."""
    tags = tags or []
    ux = "UX" in tags[1:]
    basis = [(b.group(1).capitalize() if b.group(1).lower() != "in-product" else "In-product",
              b.group(2).strip()) for b in BASIS_RE.finditer(note)]
    kinds = {k for k, _ in basis}
    for l in re.findall(r"^\s*Basis:.*$", note, re.M):
        if not BASIS_RE.match(l):
            rep.err(key, f"Basis line must start 'In-product —', 'External —' or 'None —': {l.strip()[:60]!r}")
    for k, text in basis:
        if k != "None" and len(text) < 8:
            rep.err(key, f"Basis: {k} names no feature / product and document",
                    "e.g. 'Basis: In-product — Text to Image: Stop keeps the credits (Spec Link 8/E Stop)'")
    if tags and tags[0] == "AIAgent":
        if ux and not allow_agent_ux:
            rep.err(key, "[AIAgent][UX]: spec-driven findings never carry [UX] (RD, 2026-10-21)",
                    "file as [AIAgent][UI] or [AIAgent] (Functional), owner RD; RD forwards to PM if needed")
        if kinds & {"External", "None"} and not allow_agent_ux:
            rep.err(key, "[AIAgent] entry rests on another product or on nothing — not a spec-driven bug",
                    "hold it and raise it as an exploration (AIFound) UX finding or a PM question")
    if ux and tags[0] == "AIAgent":
        pass    # reported above; with --allow-agent-ux (revert) spec-driven UX rests on its Spec Link
    elif ux:
        if not kinds & {"External", "None"}:
            rep.err(key, "[UX] entry has no 'Basis: External — …' or 'Basis: None — …' Note line",
                    "say which other product it is compared to (with a link), or 'None — PM decision requested'; "
                    "if it rests on a spec or on another feature of this app it is Functional or [UI], not [UX]")
        if "In-product" in kinds:
            rep.err(key, "[UX] entry cites an in-product reference — that makes it Functional or [UI] (owner RD)",
                    "drop [UX], keep the 'Basis: In-product — …' line")
        if belong and belong != "PM":
            rep.warn(key, f"[UX] entry is owned by {belong}; UX findings go to PM for a decision")
    elif kinds & {"External", "None"} and tags[:1] != ["AIAgent"]:
        rep.err(key, "entry rests on another product or on nothing but is not tagged [UX]",
                 "an expectation with no spec / in-product basis is a UX call for PM: tag [UX], owner PM")


def check_desc(key, desc, version, rep, files, upload_dir, tags=None, belong=None,
               allow_agent_ux=False, videos_requested=False, no_link_ok=False):
    if not desc or not desc.strip():
        rep.err(key, "Description is empty")
        return
    # sections present and in order
    pos = []
    for sec in SECTIONS:
        i = desc.find("\n" + sec) if not desc.startswith(sec) else 0
        if i < 0:
            rep.err(key, f"Description has no {sec!r} section")
            pos.append(None)
        else:
            pos.append(i)
    known = [p for p in pos if p is not None]
    if known != sorted(known):
        rep.err(key, "Description sections are out of order; "
                     "expected Repro Steps / Result / Expect Result / Note")

    def section(name, nxt):
        i = desc.find(name)
        if i < 0:
            return ""
        j = desc.find(nxt, i) if nxt else len(desc)
        return desc[i + len(name):j if j > 0 else len(desc)]

    steps = section("Repro Steps:", "\nResult:")
    result = section("\nResult:", "\nExpect Result:")
    expect = section("\nExpect Result:", "\nNote:")
    note = section("\nNote:", None)

    if not re.search(r"^\s*1\.\s*Launch", steps, re.M):
        rep.warn(key, "Repro Steps do not start with '1. Launch the APP'")
    nsteps = len(re.findall(r"^\s*\d+\.\s", steps, re.M))
    if nsteps < 2:
        rep.err(key, f"only {nsteps} numbered repro step(s)")
    check_steps(key, steps, rep)

    # the at-a-glance rule — calibrated 2026-09-16 on TR260915-0007, the batch managers and
    # RDs named as the format to copy: Result and Expect Result are each ONE short English
    # sentence ("The icon of an Error task is blurry" / "Should be clearly"), followed here by
    # one 正體中文 摘要 line. Anything longer is analysis, and analysis goes in the QA note.
    for label, body in (("Result", result), ("Expect Result", expect)):
        body = body.split("[AI Recommendation]", 1)[0]      # suggested strings are exempt
        nonblank = [l.strip() for l in body.split("\n") if l.strip()]
        if not nonblank:
            rep.err(key, f"{label} is empty")
            continue
        summaries = [l for l in nonblank if SUMMARY_RE.match(l)]
        prose = [l for l in nonblank
                 if not SUMMARY_RE.match(l)
                 and not re.fullmatch(r"(\{[^}]+\}\s*)+", l)
                 and not l.startswith("Spec string")]   # accepts both "Spec string:" and the richer "Spec string (<sheet>):" form verify_ebug_drafts.py checks against the transcript

        if not prose:
            rep.err(key, f"{label} has no English sentence")
        else:
            if SUMMARY_RE.match(nonblank[0]):
                rep.err(key, f"{label} opens with the 摘要 line — the English sentence comes first",
                        "English sentence, then 摘要：<正體中文>, then the {screenshot} line")
            if len(prose) > MAX_PROSE_LINES:
                rep.err(key, f"{label} has {len(prose)} English lines (cap {MAX_PROSE_LINES})",
                        "one flat sentence; move corroboration and reasoning to the QA note")
            first = prose[0]
            if len(first) > MAX_FIRST_LINE:
                rep.err(key, f"{label} sentence is {len(first)} chars (cap {MAX_FIRST_LINE}) — "
                             "it must read at a glance",
                        "cut to the defect itself, e.g. 'The icon of an Error task is blurry'")
            total = sum(len(l) for l in prose)
            if total > MAX_FIELD:
                rep.err(key, f"{label} English text is {total} chars (cap {MAX_FIELD})")
            if len(re.findall(r"[.!?](\s|$)", " ".join(prose))) > 2:
                rep.warn(key, f"{label} holds more than two sentences — TR260915-0007 style is one")

        if not summaries:
            rep.err(key, f"{label} has no 摘要 line",
                    "add one sentence of 正體中文（台灣用語）: '摘要：上滑後小捷徑未收合。'")
        elif len(summaries) > 1:
            rep.err(key, f"{label} has {len(summaries)} 摘要 lines — exactly one")
        else:
            zh = SUMMARY_RE.sub("", summaries[0]).strip()
            if not zh:
                rep.err(key, f"{label}'s 摘要 line is empty")
            elif len(zh) > MAX_SUMMARY:
                rep.err(key, f"{label}'s 摘要 is {len(zh)} chars (cap {MAX_SUMMARY})")
            elif not re.search(r"[\u4e00-\u9fff]", zh):
                rep.err(key, f"{label}'s 摘要 contains no Chinese; it must be 正體中文（台灣用語）")

    note_lines = [l for l in note.split("\n") if l.strip()]
    if len(note_lines) > MAX_NOTE_LINES:
        rep.err(key, f"Note has {len(note_lines)} lines (cap {MAX_NOTE_LINES}) — "
                     "only Device / Spec Link / <Claude Reviewed> belong here",
                "move the rest into the QA-note blockquote above the entry")
    for l in note_lines:
        if not NOTE_LINE.match(l):
            rep.err(key, f"Note line not allowed: {l.strip()[:60]!r}",
                    "Note holds Device / Spec Link / Basis / Related / <Claude Reviewed> only")
    if not re.search(r"^\s*Device:\s*\S", note, re.M):
        rep.err(key, "Note has no 'Device:' line")
    # reviewer rule (2026-10-21): every entry links the spec used as the reference
    links = re.findall(r"^\s*Spec Link:\s*(.*)$", note, re.M)
    if not links and not no_link_ok:
        rep.err(key, "Note has no 'Spec Link:' line — every bug carries its link",
                "Figma URL with node-id for the screen it is about (PDF name + board ID only when no URL exists)")
    for l in links:
        if not l.strip() or re.match(r"(none|n/?a|-|—)\b", l.strip(), re.I):
            if not no_link_ok:
                rep.err(key, f"Spec Link is empty or 'none': {l.strip()[:60]!r}",
                        "link the sheet for the screen concerned; ask the reviewer for one if none exists")
        elif not re.search(r"https?://|\.pdf\b", l, re.I):
            rep.err(key, f"Spec Link has neither a URL nor a PDF name: {l.strip()[:60]!r}")
        elif "figma.com" in l and "node-id=" not in l:
            rep.warn(key, "Figma Spec Link has no node-id")
    check_basis(key, tags, note, belong, rep, allow_agent_ux)
    if "<Claude Reviewed>" not in note and "<GPT Reviewed>" not in note:
        rep.err(key, "Note has no reviewer marker (<Claude Reviewed>)")
    for banned in ("not re-tested", "could not verify", "confidence:"):
        if banned in note.lower():
            rep.warn(key, f"Note contains QA-internal text ({banned!r}); "
                          "move it to the review page, not the ticket")
    # Spec Link lines quote real sheet names, some of which contain "(TBD)" — e.g.
    # "Template Page - Launcher supports banner (TBD) (8_E)". Don't flag those.
    if PLACEHOLDERS.search("\n".join(l for l in desc.split("\n")
                                      if not l.strip().startswith("Spec Link:"))):
        rep.err(key, "Description still contains a placeholder (TBD/TODO/<...>)")

    # inline references vs actual attachments
    refs = set(re.findall(r"\{([^}]+)\}", desc))
    files = set(files or [])
    for r in refs:
        if r not in files:
            rep.err(key, f"inline reference {{{r}}} is not in this bug's attachment list",
                    "attach it, or remove the reference before filing")
        if not r.startswith(version + "_"):
            rep.warn(key, f"attachment {r!r} is not prefixed with the version {version!r}")
        if upload_dir and not os.path.exists(os.path.join(upload_dir, r)):
            rep.err(key, f"attachment {r!r} does not exist in {upload_dir}")
    for f in files - refs:
        rep.warn(key, f"attachment {f!r} is attached but never referenced in the body")
    # reviewer rule (2026-10-21): an image on every bug; logs when they show the cause; no video
    # unless the user asked for one
    if not any(IMAGE_EXT.search(r) for r in refs):
        rep.err(key, "no image in the body — every bug cites at least one {<ver>_<slug>.jpg}",
                "attach a red-boxed frame and cite it under Result")
    # user rule (2026-10-27): every failure-related entry carries the log excerpt of that failure
    result = desc.split("Expect Result:")[0]
    if FAILURE_WORDS.search(result) and not any(LOG_EXT.search(r) for r in refs):
        rep.err(key, "failure-related entry without a log excerpt — cite {<ver>_<slug>_log.txt} under Result",
                "slice the failure's time window from the pulled log (log-slice.ts), scrub it, attach and cite it")
    for r in refs | files:
        if VIDEO_EXT.search(r) and not videos_requested:
            rep.err(key, f"video attachment {r!r} — videos are attached only when the user asks for them",
                    "drop it (keep the recording locally), or re-run with --videos-requested once the user asked")


def check_meta(key, e, rep):
    sev = e.get("sev")
    if sev not in (1, 2, 3, 4, 5):
        rep.err(key, f"Severity {sev!r} is not 1-5")
    elif sev == 1:
        rep.warn(key, "Severity 1 is crash / data loss / flow-blocking only — confirm it clears that bar")
    elif sev == 4:
        rep.warn(key, "Severity 4 is very rare in this pool (1 of 175 in the Sept 2026 export)")
    belong = e.get("belong")
    if belong not in BELONGS_WEB and belong not in BELONGS_API:
        rep.err(key, f"BugBelong {belong!r} is not a valid value")
    out, times = e.get("out"), e.get("times")
    for name, v in (("ReproduceOut", out), ("ReproduceTimes", times)):
        if not isinstance(v, int) or v < 0:
            rep.err(key, f"{name} {v!r} is not a non-negative integer")
    if isinstance(out, int) and isinstance(times, int):
        if times == 0:
            rep.err(key, "ReproduceTimes is 0 — the finding was never exercised")
        elif out > times:
            rep.err(key, f"reproduce probability is {out}/{times}, which is impossible")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bodies")
    ap.add_argument("--product", required=True, help="PDR-I / PDR-A / PHD")
    ap.add_argument("--version", required=True, help="16.8.0")
    ap.add_argument("--upload-dir", default=None,
                    help="folder the attachments live in; existence is checked when given")
    ap.add_argument("--features", default=None,
                    help="optional newline-separated list of valid on-screen feature names")
    ap.add_argument("--strict", action="store_true", help="treat warnings as failures")
    ap.add_argument("--videos-requested", action="store_true",
                    help="the user explicitly asked for video attachments on this batch")
    ap.add_argument("--allow-agent-ux", action="store_true",
                    help="permit [AIAgent][UX] (revert switch for the 2026-10-21 RD rule)")
    ap.add_argument("--no-link-ok", default="", type=lambda v: {k for k in v.split(",") if k},
                    help="comma-separated keys the reviewer approved without a Spec Link (record it in decisions.md)")
    a = ap.parse_args()

    data = json.load(open(a.bodies, encoding="utf-8"))
    if isinstance(data, list):
        data = {str(i + 1): e for i, e in enumerate(data)}
    rep = Report()

    features = None
    if a.features:
        features = {l.strip() for l in open(a.features, encoding="utf-8") if l.strip()}

    seen = {}
    for key, e in data.items():
        short = (e.get("short") or "").strip()
        tags = check_short(key, short, a.product, a.version, rep, features)
        check_desc(key, e.get("desc", ""), a.version, rep, e.get("files"), a.upload_dir,
                   tags=tags, belong=e.get("belong"), allow_agent_ux=a.allow_agent_ux,
                   videos_requested=a.videos_requested, no_link_ok=key in a.no_link_ok)
        check_meta(key, e, rep)
        norm = re.sub(r"\s+", " ", short.lower())
        if norm and norm in seen:
            rep.err(key, f"Short Description is identical to {seen[norm]}")
        seen[norm] = key

    width = max((len(k) for k in data), default=4)
    for level, key, msg, fix in rep.rows:
        mark = "✖" if level == "ERROR" else "⚠"
        print(f"{mark} {level:5} {key:<{width}}  {msg}")
        if fix:
            print(f"{'':>{width + 10}}  → {fix}")

    n = len(data)
    print(f"\n{n} bug(s) checked — {len(rep.errors)} error(s), {len(rep.warnings)} warning(s)")
    if rep.errors:
        print("DO NOT FILE. Fix the errors and re-run.")
        return 1
    if rep.warnings and a.strict:
        print("DO NOT FILE (--strict). Resolve the warnings and re-run.")
        return 1
    print("Format OK — clear to file.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

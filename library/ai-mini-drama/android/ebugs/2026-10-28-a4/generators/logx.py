"""Logcat excerpt helper for the A4 Android batch.

The Android build writes no app log folder readable over adb, so the run captured logcat per segment
(`device-android.ts logcat start` / `pull-logs`) into runs/2026-10-28-a4-full/logs/<segment>-<time>/logcat-live.txt.
log-slice.ts does not read logcat, so excerpts are cut here by hand-picked time windows: turn, decision, charge (receipt and
condensed balance), failure, template-mapping, push and perf turn_end lines. Member tokens and other secrets are dropped,
URL queries are cut at '?'.
"""
import glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, *[".."] * 6))
RUN = f"{REPO}/library/ai-mini-drama/android/runs/2026-10-28-a4-full"

KEEP = re.compile(
    r"MiniDrama Log: \[(TURN|DECISION|USER|AI|NARRATION)\]"
    r"|MiniDrama Log: \[SYS\] (pending_resume|restored|resum|session_created)"
    r"|MiniDrama Log: \[TEMPLATE\] character mapping"
    r"|MiniDrama Log: \[TOOL\] (MyCreation|.*(cancel|fail|error|timeout))"
    r"|MiniDramaFail"
    r"|MiniDramaPerf: .*(turn_end|ui_rendered)"
    r"|FcmInstanceIDService: key = (Msg|Title)"
    r"|getMemberCreditRemain", re.I)
DROP = re.compile(r"memberToken|access_?token|authorization|bearer|x-goog-signature|signature=|\[TOKEN\]|refreshMemberToken", re.I)
REMAIN = re.compile(r"totalRemain=(\d+)")


def logfiles():
    return sorted(glob.glob(f"{RUN}/logs/A4-*/logcat-live.txt"))


def lines(day, t0, t1, extra=None):
    seen, got, last_remain = set(), [], None
    for f in logfiles():
        for line in open(f, encoding="utf-8", errors="replace"):
            p = line.split(" ", 2)
            if len(p) < 3 or p[0] != day or not (t0 <= p[1][:8] <= t1):
                continue
            if not (KEEP.search(line) or (extra and re.search(extra, line))) or DROP.search(line):
                continue
            line = line.rstrip()
            if "getMemberCreditRemain" in line:
                m = REMAIN.search(line)
                if not m or m.group(1) == last_remain:
                    continue
                last_remain = m.group(1)
                line = f"{p[0]} {p[1]} CreditSystemManager: totalRemain={last_remain}"
            line = re.sub(r"(https?://[^\s'\"?]+)\?[^\s'\")]*", r"\1?…", line)
            line = re.sub(r"^(\S+ \S+) +\d+ +\d+ [VDIWE] ", r"\1 ", line)  # drop pid/tid/level
            line = re.sub(r"call=\S*_s_(\w+)", r"call=…\1", line)  # long call ids → their last step
            if "resolve_decision" in line:
                continue
            key = line
            if key in seen:
                continue
            seen.add(key)
            got.append(line[:420] + ("…" if len(line) > 420 else ""))
    got.sort()
    return got


def segment_of(day, t):
    best = None
    for f in logfiles():
        d = os.path.basename(os.path.dirname(f))
        with open(f, encoding="utf-8", errors="replace") as fh:
            first = next((l for l in fh if re.match(r"\d{4}-\d\d-\d\d ", l)), "")
        if first and (first[:10], first[11:19]) <= (day, t):
            best = d
    return best


def excerpt(path, title, header, secs):
    """secs: (label, day, t0, t1[, extra regex])."""
    L = [f"# {title}", header,
         "# Lines about turns, decisions, charges (receipts; balance shown only when it changes), failures, template mapping,",
         "# pushes and turn ends in the windows below; member tokens dropped, URL queries cut at '?'.", ""]
    for sec in secs:
        label, day, t0, t1 = sec[:4]
        extra = sec[4] if len(sec) > 4 else None
        got = lines(day, t0, t1, extra)
        if not got:
            sys.exit(f"empty log window {label} {day} {t0}-{t1}")
        L.append(f"## {label} ({day} {t0}–{t1}; logs/{segment_of(day, t0)}/logcat-live.txt)")
        L.extend(got)
        L.append("")
    txt = "\n".join(L)
    if re.search(r"eyJ[A-Za-z0-9_-]{10,}|Bearer |ya29\.|X-Goog-Signature|memberToken", txt):
        sys.exit(f"token-like text left in {path}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(txt)
    return path

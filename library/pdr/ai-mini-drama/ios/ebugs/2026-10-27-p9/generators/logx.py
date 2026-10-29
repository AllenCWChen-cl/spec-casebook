"""Log excerpt helper for the P9 batch: pick the earliest log pull that covers a window, keep turn/charge/failure lines."""
import glob, os, re, sys

RUN = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/ios/runs/2026-10-22-p9-full"
KEEP = re.compile(r"authorize |-> allow|-> deny|tool failed|workflow step failed|send failure|turn end|turn failed|turn complete|"
                  r"turn abandoned|turn ended|send reply|revoke|unused_credit|video turn failed|not covered|denied|token_request|"
                  r"\[AIDrama Toast\]|toast for|HTTP PUT|serverFailed|NSURLErrorDomain|send begin", re.I)
DROP = re.compile(r"token=|access_token|authorization:|bearer|x-goog-signature|signature=", re.I)


def pulls():
    out = []
    for d in glob.glob(f"{RUN}/logs/*/"):
        m = re.search(r"(\d{8})-(\d{6})/$", d)
        if m and glob.glob(f"{d}unzipped/*_aidrama.txt"):
            out.append((m.group(1) + m.group(2), d))
    return sorted(out)


def lines(day, t0, t1, extra=None):
    key = day.replace("-", "") + t1.replace(":", "")
    for stamp, d in pulls():
        if stamp < key:
            continue
        got = []
        for f in sorted(glob.glob(f"{d}unzipped/*_aidrama.txt")):
            for line in open(f, encoding="utf-8", errors="replace"):
                p = line.split(" ", 2)
                if len(p) < 3 or p[0] != day or not (t0 <= p[1][:8] <= t1):
                    continue
                if not (KEEP.search(line) or (extra and re.search(extra, line))) or DROP.search(line):
                    continue
                line = re.sub(r"(https?://[^\s'\"?]+)\?[^\s'\")]*", r"\1?…", line.rstrip())
                got.append(line[:700])
        if got:
            return os.path.relpath(d, RUN), got
    return None, []


def excerpt(path, title, header, secs, extra=None):
    """secs: (label, day, t0, t1); extra: an optional regex of more lines to keep for this entry."""
    L = [f"# {title}", header,
         "# Only lines about turns, charges, toasts and failures in the windows below; signed storage URLs are cut at '?'.", ""]
    for label, day, t0, t1 in secs:
        src, got = lines(day, t0, t1, extra)
        if not got:
            sys.exit(f"empty log window {label} {day} {t0}-{t1}")
        L.append(f"## {label} ({day} {t0}–{t1}; {src})")
        L.extend(got)
        L.append("")
    txt = "\n".join(L)
    if re.search(r"eyJ[A-Za-z0-9_-]{10,}|Bearer |ya29\.|X-Goog-Signature", txt):
        sys.exit(f"token-like text left in {path}")
    open(path, "w", encoding="utf-8").write(txt)
    return path

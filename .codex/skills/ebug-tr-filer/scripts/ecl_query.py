#!/usr/bin/env python3
"""Search ECL TRs and eBugs from the terminal — no AI, no tokens burned.

The eCL MCP connector answers the same questions, but every result travels
through the model's context and costs tokens. These are the same IF3 query
endpoints called directly, so a search costs nothing but a HTTP round trip.
Run it yourself, or have Claude run it and read only the summary line.

Token: `~/.ecl_token` (chmod 600), or $ECL_TOKEN. Never passed on argv.

    ./ecl_query.py bugs --product PowerDirector --build 189063
    ./ecl_query.py bugs --text "AI Music Generator" --open-only --limit 30
    ./ecl_query.py bug DRI261883-0063
    ./ecl_query.py tr TR260915-0007
    ./ecl_query.py dedupe upload/bodies.json
    ./ecl_query.py calibrate --product "PowerDirector Mobile for iOS" --since 2026-06-01

⚠ REST query tokens have NO permission filtering (guide 3-5): a valid token
reads every ticket in scope, including ones you could not open in the ECL web
UI. This is the one way it differs from MCP, which filters by your account.
Treat output as confidential; do not bulk-export it anywhere.
"""
import argparse
import csv
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ecl_if3 import ECLError, call, query  # noqa: E402

PAGE = 200

# Statuses that mean the bug is finished. Do NOT hard-code a status whitelist —
# live data carries NewCreated, TRCreated, BugNeedReview, BugReviewing,
# BugReviewed, Assigned, NeedCodeReview, Close, Cancelled, ProposeNAB,
# "Propose Won't Fix", QA Propose Won't Fix, NotReproducible, NewFeature …
# and the documented "Open" never appears.
CLOSED = {"close", "closed", "cancelled", "canceled", "nab", "won't fix",
          "wont fix", "notreproducible", "creatorclose", "external issue"}

STOP = {"the", "a", "an", "is", "are", "was", "were", "be", "been", "on", "in",
        "at", "to", "of", "for", "and", "or", "but", "not", "no", "it", "its",
        "with", "when", "after", "before", "from", "by", "as", "that", "this",
        "has", "have", "does", "do", "did", "will", "would", "should", "can",
        "cannot", "still", "then", "than", "there", "their", "they", "user"}


def paged(model, conditions, limit, sort_by="CreateTime", desc=True):
    """Walk pages until limit or exhaustion. Queries share one rate bucket."""
    out, page = [], 1
    while len(out) < limit:
        size = min(PAGE, limit - len(out))
        payload = {"queryModel": model, "pageIndex": page, "pageSize": size,
                   "conditions": conditions, "sortBy": sort_by, "isDesc": desc}
        _, body = call("POST", f"/IF3/tsr/api/public/Query/{model}", payload)
        data = body.get("data", body) if isinstance(body, dict) else {}
        rows = data.get("results") or []
        out.extend(rows)
        total = data.get("total", 0)
        if not rows or len(out) >= total:
            break
        page += 1
    return out[:limit]


def _conds(a):
    c = []
    if a.product:
        c.append({"field": "ProductName", "match": {"query": a.product}})
    if a.version:
        c.append({"field": "Version", "term": {"query": a.version}})
    if a.build:
        c.append({"field": "Build", "term": {"query": a.build}})
    if a.creator:
        c.append({"field": "Creator", "term": {"query": a.creator}})
    if a.tr:
        c.append({"field": "ParentTRCode", "term": {"query": a.tr}})
    if a.belong:
        c.append({"field": "BugBelong", "term": {"query": a.belong}})
    if a.severity:
        c.append({"field": "EbugSeverity", "term": {"query": str(a.severity)}})
    if a.text:
        c.append({"field": "ShortDescription", "match": {"query": a.text}})
    if a.status:
        c.append({"field": "Status", "term": {"query": a.status}})
    if a.since or a.until:
        r = {}
        if a.since:
            r["gte"] = a.since
        if a.until:
            r["lte"] = a.until
        c.append({"field": "CreateTime", "range": r})
    return c


# Statuses where RD/PM looked at the report and declined it — including the
# Propose* steps, which are already a rejection in flight. A new ticket for the
# same thing re-raises a decision; it is not a fresh find.
REJECTED = {"nab", "proposenab", "propose nab", "won't fix", "wont fix",
            "propose won't fix", "propose wont fix", "qa propose won't fix",
            "qa propose wont fix", "notreproducible", "not reproducible"}


def _is_open(row):
    return str(row.get("Status", "")).strip().lower() not in CLOSED


def _is_rejected(row):
    return str(row.get("Status", "")).strip().lower() in REJECTED


# --------------------------------------------------------------------- bugs

def cmd_bugs(a):
    conds = _conds(a)
    if not conds:
        raise ECLError("Give at least one filter — an unfiltered search pulls "
                       "the whole ~242,000-bug pool.")
    rows = paged("TSR.EbugSearch", conds, a.limit)
    if a.open_only:
        rows = [r for r in rows if _is_open(r)]
    return _emit(rows, a, [
        ("BugCode", 16), ("Status", 14), ("EbugSeverity", 3), ("BugBelong", 9),
        ("Build", 9), ("Creator", 14), ("ShortDescription", 0)])


def _emit(rows, a, cols):
    if a.json:
        json.dump(rows, sys.stdout, indent=2, ensure_ascii=False)
        print()
    elif a.csv:
        w = csv.writer(sys.stdout)
        keys = [c[0] for c in cols]
        w.writerow(keys)
        for r in rows:
            w.writerow([r.get(k, "") for k in keys])
    else:
        for r in rows:
            parts = []
            for name, width in cols:
                v = "" if r.get(name) is None else str(r.get(name))
                if width:
                    parts.append(v[:width].ljust(width))
                else:
                    parts.append(v)
            print("  ".join(parts))
    sys.stdout.flush()
    print(f"\n{len(rows)} bug(s)", file=sys.stderr)
    return 0


# ---------------------------------------------------------------------- bug

def cmd_bug(a):
    for code in a.bugcodes:
        rows = query("TSR.SP.GetOldEbugData",
                     [{"field": "BugCode", "term": {"query": code}}])
        if not rows:
            print(f"{code}: not found", file=sys.stderr)
            continue
        r = rows[0]
        if a.json:
            json.dump(r, sys.stdout, indent=2, ensure_ascii=False)
            print()
            continue

        print("=" * 78)
        print(f"{r['BugCode']}  —  {r.get('ShortDescription')}")
        print("=" * 78)
        print(f"  Status     {r.get('Status')}"
              f"{'' if _is_open(r) else '   (closed)'}")
        print(f"  Product    {r.get('ProductName')}  ·  {r.get('TemplateName')}")
        print(f"  Version    {r.get('Version')} / build {r.get('Build')}"
              f"{'   fixed in ' + r['CloseToBuild'] if r.get('CloseToBuild') else ''}")
        print(f"  Severity   {r.get('EbugSeverity')}   Priority {r.get('EbugPriority')}"
              f"   BugBelong {r.get('BugBelong')}")
        print(f"  Creator    {r.get('Creator')}   {str(r.get('CreateTime'))[:19]}")
        print(f"  TR         {r.get('ParentTRCode')}")
        print(f"  Reproduce  {r.get('ReproduceOut')}/{r.get('ReproduceTimes')}"
              f"   previous build: {r.get('IsHappened')}")

        for f in _json_field(r, "DetailData"):
            if f.get("FieldCode") == "Describe Issue":
                print("\n--- Description " + "-" * 61)
                print(_clean(f.get("FieldValue", "")))

        log = _json_field(r, "StatusLog")
        fix = [e for e in log if e.get("RootCause") or e.get("Solution")]
        if fix:
            print("\n--- RD resolution " + "-" * 59)
            for e in fix:
                print(f"  by {e.get('UserName')}  {str(e.get('StatusTime'))[:19]}")
                if e.get("RootCause"):
                    print(f"  Root cause: {_clean(e['RootCause'])}")
                if e.get("Solution"):
                    print(f"  Solution:   {_clean(e['Solution'])}")
                if e.get("TraceURL"):
                    print(f"  Changeset:  {e['TraceURL']}")

        files = _json_field(r, "UploadFile")
        if files:
            print("\n--- Attachments " + "-" * 61)
            for f in files:
                print(f"  {f.get('FileName')}  {f.get('FileURL')}")

        if a.log and log:
            print("\n--- Status log " + "-" * 63)
            for e in log:
                print(f"  {str(e.get('StatusTime'))[:19]}  "
                      f"{str(e.get('Status','')):16s} {e.get('UserName')}")
        print()
    return 0


def _json_field(row, key):
    v = row.get(key)
    if not v:
        return []
    try:
        return json.loads(v) if isinstance(v, str) else v
    except json.JSONDecodeError:
        return []


def _clean(s):
    return str(s).replace("\r\n", "\n").replace("\r", "\n").strip()


# ----------------------------------------------------------------------- tr

def cmd_tr(a):
    trs = query("TR.SP.GetOldTRData",
                [{"field": "TRCode", "term": {"query": a.trcode}}])
    if not trs:
        print(f"{a.trcode}: not found", file=sys.stderr)
        return 1
    t = trs[0]
    print(f"{t['TRCode']}  —  {t.get('ShortDescription')}")
    print(f"  Status   {t.get('Status')} / {t.get('FormState')}")
    print(f"  Product  {t.get('ProductName')}  ·  {t.get('TemplateName')}")
    print(f"  Build    {t.get('TRBuild')}")
    print(f"  Owner    {t.get('Owner')}   Tester {t.get('Tester')}")
    print(f"  Due      {str(t.get('TRDueDate'))[:10]}")

    own = query("TSR.eBugByTR",
                [{"field": "ParentTRCode", "term": {"query": a.trcode}}],
                page_size=PAGE)
    att = query("TSR.AttachedEBug",
                [{"field": "ParentTRCode", "term": {"query": a.trcode}}],
                page_size=PAGE)
    for label, rows in (("found on this TR", own), ("attached for verify", att)):
        rows = [r for r in rows if not a.open_only or _is_open(r)]
        print(f"\n  {len(rows)} eBug(s) {label}:")
        for r in sorted(rows, key=lambda x: str(x.get("BugCode"))):
            v = "" if r.get("IsVerified") is None else \
                ("  verified" if r["IsVerified"] else "  NOT verified")
            print(f"    {str(r.get('BugCode')):16s} {str(r.get('Status','')):16s}"
                  f" {str(r.get('ShortDescription'))[:70]}{v}")
    return 0


# ------------------------------------------------------------------- dedupe

def _keywords(short):
    """Strip product/version/tags, split feature from symptom, keep content words.

    Returns (feature, content-words, search-term). The search term falls back to
    the longest content words when there is no feature name — without that, a
    Short Description missing its feature (the exact defect check_ebug_format.py
    exists to catch) searches on a string full of tag brackets, matches nothing,
    and reports "no likely duplicate" for a bug that is already in the pool.
    """
    s = re.sub(r"^\s*[A-Z][A-Za-z\-]*\s+[\d.]+\s*-\s*", "", short)
    s = re.sub(r"\[[^\]]*\]", " ", s)
    feature, _, symptom = s.partition(":")
    if not symptom:
        feature, symptom = "", s
    feature = feature.strip()
    words = {w for w in re.findall(r"[a-z0-9]+", symptom.lower())
             if w not in STOP and len(w) > 2}
    if feature:
        terms = [feature]
    else:
        ordered = [w for w in re.findall(r"[A-Za-z0-9]+", symptom)
                   if w.lower() not in STOP and len(w) > 3]
        # One term per query, NOT joined: `match` is a substring/phrase match,
        # so "grammatically inspiration" finds nothing while "Passersby" finds
        # the bug. Verified against the live pool 2026-09-16.
        seen, terms = set(), []
        for w in sorted(ordered, key=len, reverse=True):
            if w.lower() not in seen:
                seen.add(w.lower())
                terms.append(w)
        terms = terms[:4]
    return feature, words, terms


# Quoted UI labels: "More ideas +", 'Try again', “Leave anyway”. Straight
# single quotes only count at word edges so "don't" is not a quote.
_QUOTED = re.compile(r'"([^"]{2,60})"|“([^”]{2,60})”|‘([^’]{2,60})’'
                     r"|(?<![A-Za-z])'([^']{2,60})'(?![A-Za-z])")


def _norm(s):
    return " ".join(re.findall(r"[a-z0-9]+", str(s).lower()))


def _symptom(short):
    """Short Description minus product/version prefix, tags and feature name."""
    s = re.sub(r"^\s*[A-Z][A-Za-z\-]*\s+[\d.]+\s*-\s*", "", str(short))
    s = re.sub(r"\[[^\]]*\]", " ", s)
    feature, _, symptom = s.partition(":")
    return symptom if symptom else s


def _labels(short):
    """Normalized quoted UI labels in a Short Description."""
    out = set()
    for m in _QUOTED.finditer(_symptom(short)):
        lab = _norm(next(g for g in m.groups() if g))
        if len(lab) >= 3:
            out.add(lab)
    return out


def _phrases(short):
    """Adjacent content-word pairs ("more ideas", "leave anyway")."""
    toks = re.findall(r"[a-z0-9]+", _symptom(short).lower())
    return {f"{x} {y}" for x, y in zip(toks, toks[1:])
            if x not in STOP and y not in STOP and len(x) > 2 and len(y) > 2}


def _contains(text, label):
    return f" {label} " in f" {text} "


def _shared_labels(short, other):
    """Quoted labels either side that appear verbatim in the other's symptom.

    Either direction, because only one writer may have quoted it: DRI261893-0057
    says "More ideas +" in quotes, DRI261896P0059 says More ideas + chip bare.
    """
    a, b = _norm(_symptom(short)), _norm(_symptom(other))
    return sorted({l for l in _labels(short) if _contains(b, l)} |
                  {l for l in _labels(other) if _contains(a, l)})


def cmd_dedupe(a):
    shorts = []
    if a.source.endswith(".json"):
        data = json.load(open(a.source))
        shorts = [(k, v["short"]) for k, v in sorted(data.items())]
    else:
        with open(a.source) as f:
            shorts = [(str(i + 1), ln.strip())
                      for i, ln in enumerate(f) if ln.strip()]

    hits = rejected_hits = 0
    for key, short in shorts:
        feature, words, terms = _keywords(short)
        # Quoted labels are searched on their own too: the same button can be
        # filed under a different feature name.
        labels = sorted(_labels(short))
        if not terms and not labels:
            print(f"\n[{key}] {short}\n      SKIPPED — nothing searchable. Run "
                  f"check_ebug_format.py; this is usually a missing feature name.",
                  file=sys.stderr)
            continue
        rows, seen_codes = [], set()
        for term in terms + [l for l in labels if l not in {t.lower() for t in terms}]:
            conds = [{"field": "ShortDescription", "match": {"query": term}}]
            if a.product:
                conds.append({"field": "ProductName", "match": {"query": a.product}})
            try:
                got = paged("TSR.EbugSearch", conds, a.limit)
            except ECLError as e:
                print(f"[{key}] search on {term!r} failed: {e}", file=sys.stderr)
                continue
            for r in got:
                if r.get("BugCode") not in seen_codes:
                    seen_codes.add(r.get("BugCode"))
                    rows.append(r)

        # A shared word pair only counts as distinctive when few candidates
        # carry it; "video generation" in half the pool proves nothing.
        mine = _phrases(short)
        freq = {}
        for r in rows:
            for ph in mine & _phrases(r.get("ShortDescription", "")):
                freq[ph] = freq.get(ph, 0) + 1
        rare = max(2, int(len(rows) * a.phrase_share))
        # Multi-word labels always count; a one-word label ("Generate") is
        # held to the same rarity rule as a phrase.
        lab_freq = {}
        for r in rows:
            for l in _shared_labels(short, r.get("ShortDescription", "")):
                lab_freq[l] = lab_freq.get(l, 0) + 1

        scored = []
        for r in rows:
            other = r.get("ShortDescription", "")
            _, rw, _t = _keywords(other)  # noqa
            overlap = len(words & rw) / len(words) if words and rw else 0.0
            shared = [l for l in _shared_labels(short, other)
                      if " " in l or lab_freq.get(l, 0) <= rare]
            why = [f'label "{l}"' for l in shared]
            why += [f'phrase "{ph}"' for ph in
                    sorted(mine & _phrases(other)) if freq.get(ph, 0) <= rare
                    and not any(_contains(l, ph) for l in shared)]
            if overlap >= a.threshold or why:
                scored.append((bool(why), overlap, why, r))
        scored.sort(key=lambda x: (-x[0], -x[1]))
        # Flagged candidates are always shown; --show caps the overlap-only rest.
        shown = [x for x in scored if x[0]]
        shown += [x for x in scored if not x[0]][:a.show]

        print(f"\n[{key}] {short}")
        how = (f"feature={feature!r}" if feature else
               f"NO FEATURE NAME, fell back to keywords {terms}")
        if labels:
            how += f"  labels={labels}"
        print(f"      {how}  searched {len(rows)} candidate(s)")
        if not shown:
            print("      no likely duplicate")
            continue
        hits += 1
        for flagged, ov, why, r in shown:
            if _is_rejected(r):
                state = "REJECTED"
            else:
                state = "OPEN    " if _is_open(r) else "closed  "
            mark = "!" if flagged else " "
            print(f"    {mark}{ov:>4.0%}  {state}  {r['BugCode']}  "
                  f"{str(r.get('ShortDescription'))[:88]}")
            if why:
                print(f"              shares {', '.join(why)}")
            if _is_rejected(r):
                rejected_hits += 1
                print(f"              ⚠ {r.get('Status')} — RD/PM already declined "
                      f"this. Filing again re-raises that decision: read its "
                      f"status log, and only refile with new grounds (e.g. a "
                      f"newer spec) cited against {r['BugCode']}.")

    print(f"\n{hits} of {len(shorts)} entries have a possible duplicate "
          f"(overlap >= {a.threshold:.0%}, or a shared quoted label / rare "
          f"phrase, marked !). Judge each one yourself — wording varies, so "
          f"this ranks candidates, it does not decide.", file=sys.stderr)
    if rejected_hits:
        print(f"{rejected_hits} candidate(s) were declined (NAB / Won't Fix / "
              f"Not Reproducible). Resolve each before filing.", file=sys.stderr)
    return 0


# ---------------------------------------------------------------- calibrate

def cmd_calibrate(a):
    conds = [{"field": "ProductName", "match": {"query": a.product}}]
    if a.since:
        conds.append({"field": "CreateTime", "range": {"gte": a.since}})
    rows = paged("TSR.EbugSearch", conds, a.limit)
    if not rows:
        print("no bugs matched", file=sys.stderr)
        return 1

    print(f"{len(rows)} bugs — {a.product}"
          f"{' since ' + a.since if a.since else ''}\n")
    for field, label in (("EbugSeverity", "Severity(QA)"),
                         ("EbugPriority", "Priority(RD)"),
                         ("BugBelong", "BugBelong"),
                         ("Status", "Status"),
                         ("BugType", "Bug Source")):
        tally = {}
        for r in rows:
            v = r.get(field)
            v = "(none)" if v in (None, "") else str(v)
            tally[v] = tally.get(v, 0) + 1
        print(f"  {label}")
        for v, n in sorted(tally.items(), key=lambda kv: -kv[1]):
            bar = "█" * max(1, round(40 * n / len(rows)))
            print(f"    {v:<22s} {n:>5d}  {n/len(rows):>5.1%}  {bar}")
        print()
    print("Propose severities against THIS distribution, not a remembered one.",
          file=sys.stderr)
    return 0


# --------------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    def out_flags(s):
        s.add_argument("--json", action="store_true")
        s.add_argument("--csv", action="store_true")

    s = sub.add_parser("bugs", help="search eBugs")
    for f in ("product", "version", "build", "creator", "tr", "belong",
              "status", "text", "since", "until"):
        s.add_argument("--" + f)
    s.add_argument("--severity", type=int)
    s.add_argument("--open-only", action="store_true",
                   help="drop Close/NAB/Won't Fix/Cancelled/NotReproducible")
    s.add_argument("--limit", type=int, default=100)
    out_flags(s)
    s.set_defaults(fn=cmd_bugs)

    s = sub.add_parser("bug", help="full detail: body, root cause, attachments")
    s.add_argument("bugcodes", nargs="+")
    s.add_argument("--log", action="store_true", help="also print the status log")
    s.add_argument("--json", action="store_true")
    s.set_defaults(fn=cmd_bug)

    s = sub.add_parser("tr", help="TR detail and its eBugs")
    s.add_argument("trcode")
    s.add_argument("--open-only", action="store_true")
    s.set_defaults(fn=cmd_tr)

    s = sub.add_parser("dedupe", help="rank possible duplicates for a batch")
    s.add_argument("source", help="bodies.json, or a file of Short Descriptions")
    s.add_argument("--product", default="PowerDirector")
    s.add_argument("--threshold", type=float, default=0.34)
    s.add_argument("--show", type=int, default=4,
                   help="max overlap-only candidates; flagged ones always show")
    s.add_argument("--phrase-share", type=float, default=0.02,
                   help="a shared word pair flags only if at most this share "
                        "of candidates carry it (min 2)")
    s.add_argument("--limit", type=int, default=200)
    s.set_defaults(fn=cmd_dedupe)

    s = sub.add_parser("calibrate", help="severity / belong distribution")
    s.add_argument("--product", required=True)
    s.add_argument("--since")
    s.add_argument("--limit", type=int, default=600)
    s.set_defaults(fn=cmd_calibrate)

    a = p.parse_args()
    try:
        return a.fn(a)
    except ECLError as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        return 2
    except BrokenPipeError:
        return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""eBug draft markdown → bodies.json (+ staged upload folder).

    python3 drafts_to_bodies.py ebugs/<batch>.md [more.md ...] --out upload/bodies.json \
        [--stage upload/] [--decisions decisions.md]

One draft file per feature is the unit the reviewer signs off on; bodies.json is the unit
`check_ebug_format.py`, `ecl_query.py dedupe` and `ecl_if3.py create` consume. Converting
mechanically — instead of re-typing — is what guarantees the text that was approved is the
text that is filed.

Per entry it reads the `## N. <ISS-ID> — <title> · Class · Severity · Owner` header, the
`**Reproduce:** a/b` line, the Short Description and Description fenced blocks, and the
`**Images:**` folder. Withdrawn entries (`⛔ WITHDRAWN`) are never emitted.

Keys are `<FEATURE-SLUG>-<NN>` so several features can share one batch without colliding.

--decisions takes the markdown table the review page's "Copy decisions" button emits
(# / Sev / Belong / Type / Action / Short Description / Note) and applies it: held rows are
dropped, Sev / Belong overridden, and a rewritten Short Description replaces the draft's.
A non-empty Note is reported, never silently ignored — the body must be rewritten from it
by hand before filing.

UX entries (2026-10-21): every entry carries `ux` (its Short Description has [UX]) and `basis`
(the Note's `Basis:` line, if any), so the review page can flag UX cards for the reviewer's UX check.
With --decisions, a [UX] entry that is still filed must have `confirmed` in the table's `UX check`
column; anything else stops the run, because RD asked that every UX ticket be checked by a person
first. Reclassifying (Type → Functional/UI, Short Description without [UX]) needs no UX check.
"""
import argparse
import json
import os
import re
import shutil
import sys

HEAD = re.compile(
    r"^## (\d+)\. (⛔ WITHDRAWN — )?((?:ISS|MX)-[A-Z0-9]+-\d+) — (.+?)\s+·\s+Class: (\w+)"
    r"\s+·\s+Severity: S(\d)\s+·\s+Owner: ([\w-]+)\s*$", re.M)
OWNER = {"RD": "RD", "PM": "PM", "Doc": "PC-Doc", "PC-Doc": "PC-Doc", "Art": "PC-Art",
         "PC-Art": "PC-Art", "Marketing": "Marketing"}
CITE = re.compile(r"\{([^}]+\.(?:png|jpe?g|txt|log|mp4|mov|m4v))\}", re.I)
BASIS = re.compile(r"^\s*Basis:\s*(.+)$", re.M)


def parse(md):
    txt = open(md, encoding="utf-8").read()
    slug = re.sub(r"^\d{8}_eBug_drafts_|_\d+\.\d+\.\d+\.md$", "", os.path.basename(md))
    heads = list(HEAD.finditer(txt))
    out = {}
    for i, h in enumerate(heads):
        n, withdrawn, iss, title, cls, sev, owner = h.groups()
        if withdrawn:
            continue
        body = txt[h.end(): heads[i + 1].start() if i + 1 < len(heads) else len(txt)]
        body = re.split(r"^# ", body, flags=re.M)[0]
        sd = re.search(r"\*\*Short Description:\*\*\s*\n\s*```\n(.+?)\n```", body, re.S)
        desc = re.search(r"\*\*Description:\*\*\s*\n\s*```\n(.+?)\n```", body, re.S)
        rep = re.search(r"\*\*Reproduce:\*\*\s*(\d+)\s*/\s*(\d+)", body)
        img = re.search(r"\*\*Images:\*\*\s*`([^`]+)`", body)
        note = re.search(r"^> \*\*(?:⛔ )?QA note[^*]*\*\*\s*(.+?)(?=\n[^>]|\Z)", body, re.S | re.M)
        if not (sd and desc):
            sys.exit(f"{md} entry {n} ({iss}): missing Short Description or Description block")
        if not rep:
            sys.exit(f"{md} entry {n} ({iss}): missing '**Reproduce:** a/b' — state what was observed")
        key = f"{slug}-{int(n):02d}"
        out[key] = {
            "entry": int(n), "iss": iss, "title": title, "feature": slug, "type": cls,
            "sev": int(sev), "belong": OWNER.get(owner, owner),
            "out": int(rep.group(1)), "times": int(rep.group(2)),
            "short": sd.group(1).strip(), "desc": desc.group(1).rstrip(),
            "files": list(dict.fromkeys(CITE.findall(desc.group(1)))),
            "images_dir": os.path.join(os.path.dirname(os.path.abspath(md)),
                                       img.group(1).rstrip("/")) if img else None,
            "qa_note": re.sub(r"\n>\s?", " ", note.group(1)).strip() if note else "",
            "ux": "[UX]" in sd.group(1),
            "basis": "; ".join(BASIS.findall(desc.group(1).split("\nNote:")[-1])),
        }
    return out


def apply_decisions(bodies, path):
    """Columns are read by header name, so the review page may add columns (ISS, Type)."""
    rows = [l for l in open(path, encoding="utf-8") if l.startswith("|")]
    if len(rows) < 3:
        return []
    split = lambda l: [x.strip() for x in re.split(r"(?<!\\)\|", l.strip())[1:-1]]
    head = [h.lower() for h in split(rows[0])]
    col = lambda name: head.index(name) if name in head else None
    notes = []
    for l in rows[2:]:
        c = [x.replace("\\|", "|") for x in split(l)]
        get = lambda n: c[col(n)] if col(n) is not None and col(n) < len(c) else ""
        num, iss = get("#"), get("iss")
        # ISS-ID first: entry numbers restart at 1 in every draft file, so in a multi-file batch
        # "F-1" also matches entry 1 of whichever file happens to be read first (2026-09-29 bug).
        if iss:
            hits = [k for k, v in bodies.items() if v["iss"] == iss]
            if len(hits) > 1:
                sys.exit(f"decision row {iss!r} matches {len(hits)} entries: {hits}")
            key = hits[0] if hits else None
        else:
            key = next((k for k, v in bodies.items() if f"F-{v['entry']}" == num or k.endswith(num)), None)
        if not key:
            print(f"  ⚠ decision row {num or iss!r} matches no entry")
            continue
        if get("action").lower().startswith("hold"):
            del bodies[key]
            continue
        if get("sev").isdigit():
            bodies[key]["sev"] = int(get("sev"))
        if get("belong"):
            bodies[key]["belong"] = get("belong")
        if get("type"):
            bodies[key]["type"] = get("type")
        if get("short description"):
            bodies[key]["short"] = get("short description")
        bodies[key]["ux"] = "[UX]" in bodies[key]["short"]
        bodies[key]["ux_check"] = get("ux check").lower()
        if get("note"):
            notes.append((key, get("note")))
    return notes


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("drafts", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--stage", help="copy every cited image into this one upload folder")
    ap.add_argument("--decisions", help="Copy-decisions table from the review page")
    a = ap.parse_args()

    bodies = {}
    for md in a.drafts:
        bodies.update(parse(md))
    notes = apply_decisions(bodies, a.decisions) if a.decisions else []
    if a.decisions:
        unchecked = [k for k, b in bodies.items() if b["ux"] and b.get("ux_check") != "confirmed"]
        if unchecked:
            sys.exit("✖ [UX] entries filed without the reviewer's UX check (column 'UX check' = confirmed): "
                     + ", ".join(unchecked) + " — confirm them on the review page, reclassify, or hold them")

    missing = []
    if a.stage:
        os.makedirs(a.stage, exist_ok=True)
        for k, b in bodies.items():
            for f in b["files"]:
                src = os.path.join(b["images_dir"] or "", f)
                if os.path.exists(src):
                    shutil.copy2(src, os.path.join(a.stage, f))
                else:
                    missing.append(f"{k}: {f}")
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(bodies, f, indent=2, ensure_ascii=False)
    print(f"wrote {a.out} — {len(bodies)} entr{'y' if len(bodies) == 1 else 'ies'}")
    for m in missing:
        print("  ✖ cited image not found:", m)
    for k, n in notes:
        print(f"  ✎ {k} has reviewer context — rewrite its body from it before filing: {n}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())

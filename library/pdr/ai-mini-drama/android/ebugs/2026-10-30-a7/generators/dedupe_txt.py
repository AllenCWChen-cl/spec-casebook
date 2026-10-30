#!/usr/bin/env python3
"""Write ../dedupe.txt for the A7 batch from ebugs.SAME_CASES / OBS_SAME and the Android pool read with ecl_query.py bugs
(pool JSON path as argv[1], read 2026-10-30). Read-only; nothing filed, commented or reopened."""
import csv, json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ebugs as G

pool = {b["BugCode"]: b for b in json.load(open(sys.argv[1]))}
rows = list(csv.DictReader(open(f"{G.RUN}/results.csv", encoding="utf-8-sig")))
fails = {r["ID"] for r in rows if r["Result"] == "Fail"}
DECL = {"Close", "NAB", "Cancelled", "NotReproducible", "Won't Fix", "ProposeNAB", "Propose Wont Fix"}
by = {}
for c, (t, why) in list(G.SAME_CASES.items()) + list(G.OBS_SAME.items()):
    if c.startswith("TC-") and c not in fails:
        continue
    by.setdefault(t, []).append((c, why))
L = ["Dedupe per OS (user, 2026-10-28) — AI Mini Drama Android, phase A7 (final: all 501 cases incl. A7-j and the deferred cases), 16.8.0 (2610212). Read-only; nothing filed, commented or reopened.",
     f"Pool: ecl_query.py bugs --product \"PowerDirector Mobile for Android\" --text \"Mini Drama\" ({len(pool)} tickets, read 2026-10-30, incl. the A2 bugs DRA262610P0324–P0363, the A4 bugs DRA262610P0380–P0392 and P0393–P0409 filed since);",
     "ecl_query.py dedupe upload/bodies.json --product \"PowerDirector Mobile for Android\" --limit 1000 for the 11 new entries (judged below; re-run 2026-10-30 after A7-j for ISS-AMDA-67…70). iOS tickets never make a duplicate.",
     "Closed-ticket rule (user, 2026-10-28): a same-OS ticket that is Close while the bug is back stays a new entry (ISS-AMDA-62 ≈ DRA262610P0212, ISS-AMDA-65 ≈ DRA262610-0041). Tickets RD declined (Cancelled, NAB, ProposeNAB, NotReproducible, Won't Fix) are treated as not 'back' and stay here — flagged ⚑.",
     "", "== Not listed: Fail rows and observations that repeat an existing Android ticket (no card, no recheck row) =="]
for t in sorted(by):
    codes = re.findall(r"DRA26\d+(?:-|P)\d+", t)
    parts = []
    flag = ""
    for code in codes:
        b = pool.get(code)
        st = b["Status"] if b else "not in pool"
        if st in DECL:
            flag = "  ⚑ closed/declined status — kept as duplicate (A4 practice)"
        parts.append(f"{code} [{st}] {(b['ShortDescription'].split('AI Mini Drama', 1)[-1].lstrip(': ') if b else '')[:110]}")
    L.append(" / ".join(parts) + flag)
    for c, why in by[t]:
        L.append(f"    {c}: {why}")
L += ["", "== New entries: dedupe candidates judged (Android pool) ==",
 "ISS-AMDA-60 (TC-465, O-6) — closest DRA262610P0308 [Assigned] 5 of 6 storyboard images fail, Credit Details shows only 2 refunds: same symptom family, but that is a server failure with partial refunds; here the failures are the client's query_status_failed during a Wi-Fi drop, none refunded, receipts marked completed, and the same run's server 4000 failure WAS refunded. Kept as its own entry (orchestrator brief); the card names P0308 so the reviewer can hold it. P0388 / P0232: other paths (chat update / video clips).",
 "ISS-AMDA-61 (TC-080, TC-230, O-17) — no ticket on the video rates vs the charging sheet; DRA262610P0274 (Best = Standard) and P0032 (Cancelled, 480p action id) named as related.",
 "ISS-AMDA-62 (TC-428, TC-275, O-2) — DRA262610P0212 [Close] raw 「MiniDrama FAIL」 toast after stopping the outline: closed and back on the scene-regenerate path → new entry naming it.",
 "ISS-AMDA-63 (TC-307, O-11) — P0368 (tap opens History), P0379 (banner early), P0267 / P0250 (push while failed / late): none covers one push per clip. New.",
 "ISS-AMDA-64 (TC-312) — P0335 (character description editor writes back), P0127 [Cancelled] (idea input warning), P0149 [Close] (layout): different inputs or defects. New.",
 "ISS-AMDA-65 (TC-438) — DRA262610-0041 [Close, fixed in 2610212] same character changes face across clips: back on 2610212 → new entry naming it; P0161 [ProposeNAB] is the Three Kingdoms B/C image swap.",
 "ISS-AMDA-66 (TC-350) — no ticket on a 2-character update regenerating and charging 3; P0328 (no count label) stays the TC-350 duplicate for the label part.",
 "ISS-AMDA-67 (TC-541, O-23) — no likely duplicate: no intro / demo-page ticket in the Android pool.",
 "ISS-AMDA-68 (TC-276, TC-277, TC-406) — candidates P0258 [RDResolved] (video settings and agent cards, zh-Hant), P0289 (chips, ja), P0284 (filter options, ja): other strings, kept as the duplicates of those parts above. P0040 [RDResolved, 2610081] (Mini Drama screens stay English) is broad; category headers and zh / fr template names are not named by any ticket → new, P0040 named as related (reviewer may hold).",
 "ISS-AMDA-69 (TC-406) — no likely duplicate (P0251 French 「」 quotes [Propose Wont Fix], P0039 French caption wrap [Close] are other defects).",
 "ISS-AMDA-70 (TC-276, TC-277, TC-406) — DRA262610P0097 [Close] Japanese History 「12:38 午前」: closed, time still not in the app language's format → new entry naming it.",
 "TC-081 / TC-303 / TC-304 (A7-j) — DRA262610P0362 [Assigned] no 「Get notified」 pre-prompt on a fresh install: same → dedupe only. TC-412 — DRA262610-0059 [ProposeNAB] permission notice cannot be closed: same, declined ⚑ → dedupe only."]
open(f"{G.OUT}/dedupe.txt", "w", encoding="utf-8").write("\n".join(L) + "\n")
print(len(by), "ticket groups")

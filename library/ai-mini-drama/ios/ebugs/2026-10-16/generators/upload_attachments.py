#!/usr/bin/env python3
"""Upload each filed bug's cited images to IF3 and read the attachment list back.

    python3 upload_attachments.py <ebugs/date dir>

Reads upload/filed_formcodes.json (JobID per entry) and upload/bodies.json (files per entry).
The token is read from ~/.ecl_token (or ECL_TOKEN) inside the process, never passed on argv.
Skips files that the read-back already lists, so a re-run does not attach duplicates
(IF3 attachments cannot be removed once saved). Writes upload/attachments.json.
"""
import json, os, sys, time, uuid, urllib.request

BASE = "https://ecl.cyberlink.com"
d = sys.argv[1]
tok = os.environ.get("ECL_TOKEN") or open(os.path.expanduser("~/.ecl_token")).read().strip()
ledger = json.load(open(f"{d}/upload/filed_formcodes.json"))
bodies = json.load(open(f"{d}/upload/bodies.json"))

def req(method, url, data=None, ctype=None):
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", f"Bearer {tok}")
    if ctype:
        r.add_header("Content-Type", ctype)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(r, timeout=120) as resp:
                return resp.status, resp.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 3:
                time.sleep(3 * (attempt + 1)); continue
            return e.code, e.read().decode("utf-8", "replace")

def listed(job):
    st, body = req("GET", f"{BASE}/IF3/ebug/api/Attachments/{job}")
    try:
        j = json.loads(body)
    except Exception:
        return st, []
    items = j if isinstance(j, list) else (j.get("data") or j.get("Data") or j.get("value") or [])
    return st, [str(x.get("displayName") or x.get("FileName") or x.get("fileName") or x.get("Name") or "") for x in items if isinstance(x, dict)]

out = {}
for key, rec in sorted(ledger.items(), key=lambda kv: kv[1]["FormCode"]):
    job, code = rec["JobID"], rec["FormCode"]
    files = bodies[key]["files"]
    _, have = listed(job)
    sent = []
    for f in files:
        if any(f in h for h in have):
            continue
        data = open(f"{d}/upload/{f}", "rb").read()
        bnd = uuid.uuid4().hex
        body = (f"--{bnd}\r\nContent-Disposition: form-data; name=\"formFile\"; filename=\"{f}\"\r\n"
                f"Content-Type: image/jpeg\r\n\r\n").encode() + data + f"\r\n--{bnd}--\r\n".encode()
        st, resp = req("POST", f"{BASE}/IF3/api/Attachment/{job}", body, f"multipart/form-data; boundary={bnd}")
        sent.append((f, st))
        time.sleep(0.4)
    st, have = listed(job)
    missing = [f for f in files if not any(f in h for h in have)]
    out[code] = {"key": key, "job": job, "expected": files, "listed": have, "uploaded": sent, "missing": missing}
    print(f"{code}  {len(files)} expected · {len([h for h in have if h])} listed · uploads {[s for _, s in sent]}" + (f"  MISSING {missing}" if missing else "  OK"))
json.dump(out, open(f"{d}/upload/attachments.json", "w"), indent=2, ensure_ascii=False)
bad = [c for c, v in out.items() if v["missing"]]
print(f"\n{len(out)} bugs · {sum(len(v['expected']) for v in out.values())} files · {len(bad)} with missing attachments {bad}")
sys.exit(1 if bad else 0)

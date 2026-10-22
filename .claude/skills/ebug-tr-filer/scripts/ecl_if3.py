#!/usr/bin/env python3
"""IF3 REST client for ECL — the five action endpoints plus the queries they need.

Implements chapter 3-3 of ECL_MCP_RD_QA_Guide: Create eBug, Assign, Resolve,
Code Review, Build Resolve. Stdlib only.

This is NOT the MCP connector. The MCP is read-only (no BPMs on tsr); these are
plain HTTPS calls that need a bearer token from
https://ecl.cyberlink.com/sso/mgm/tokenPage

    export ECL_TOKEN="$(cat ~/.ecl_token)"     # never pass a token on argv

Commands:
    preflight   --product PowerDirector --template-name "PowerDirector iOS 16.8"
    create      bodies.json --tr TR260915-0007 --template-id 23156 \
                --creator ETHAN_HSU --version 16.8.0 --build 189063 [--dry-run]
    assign      DRI261890P0004 --assignees WEI_LU --belong RD --priority 4
    resolve     DRI261890P0004 --reviewer SEAN_KAO --root-cause "..." \
                --solution "..." --function "..." --changeset "..."
    codereview  DRI261890P0004
    buildresolve DRI261890P0004 --close-to-build 189100
    readback    DRI261890P0004 [DRI261890P0005 ...]
    upload      DRI261890P0004 16.8.0_x.jpg [16.8.0_y.txt ...] [--dry-run]
    files       DRI261890P0004 [DRI261890P0005 ...]
    export-filing --ledger upload/filed_formcodes.json --bodies upload/bodies.json \
                --creator ETHAN_HSU --method api+browser-upload --tr TR260915-0007

Create is guarded three ways, because the API has no idempotency of its own:
a local ledger, a live duplicate search, and a mandatory read-back.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get("ECL_BASE", "https://ecl.cyberlink.com")

Q_PREFIX = "/IF3/tsr/api/public/Query"
TPL_PREFIX = "/IF3/templatesrv/api/public/Query"
CREATE_PATH = "/api/TSR/Ebug/Create"
ACTION_PREFIX = "/api/TSRPublic/ebug"
# Public API docs §14 (2026-10-20). formDataPath=$.UploadFiles is what puts the file on the
# eBug page; the old POST /IF3/api/Attachment/{JobID} stored files the page never listed.
UPLOAD_PATH = "/IF3/ebug/api/public/Attachment/code/{code}"
UPLOAD_FORM_DATA_PATH = "$.UploadFiles"
DOWNLOAD_PATH = "/IF3/ebug/Data/DownloadByToken?o={key}"

# The web form shows the left column; the API takes the right one. A decisions
# table signed off against the review page uses the web labels.
BELONG_WEB_TO_API = {
    "RD": "RD", "Setup Kit": "RDSK", "PC-Art": "PCArt", "PC-Doc": "PCDoc",
    "PM": "PM", "Marketing": "Marketing", "RD-ECL": "RD-ECL",
}
BELONG_API = set(BELONG_WEB_TO_API.values())

# ECL ProductCode (the BugCode prefix) -> the product token the Short Description
# format uses. These are NOT the same string and are easy to conflate.
CODE_TO_SHORT_PRODUCT = {
    "DRI": "PDR-I", "DRA": "PDR-A", "VDE": "PDR", "PDP": "PHD",
}


class ECLError(RuntimeError):
    pass


TOKEN_FILE = os.path.expanduser(os.environ.get("ECL_TOKEN_FILE", "~/.ecl_token"))


def token():
    """ECL_TOKEN, else ~/.ecl_token. Never accepted on argv, where it leaks to ps."""
    t = os.environ.get("ECL_TOKEN", "").strip()
    if not t and os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            t = f.read().strip()
    if not t:
        raise ECLError(
            f"No token. Get one from {BASE}/sso/mgm/tokenPage, then either\n"
            f"    echo '<token>' > {TOKEN_FILE} && chmod 600 {TOKEN_FILE}\n"
            '    or: export ECL_TOKEN="<token>"')
    return t


def call(method, path, payload=None, expect=(200,), _tries=6):
    """One HTTPS call. Returns (status, parsed-body-or-text). Retries 429 with back-off:
    a 429 is refused before processing, so even a create is safe to resend (2026-10-07)."""
    for attempt in range(_tries):
        try:
            return _call_once(method, path, payload, expect)
        except ECLError as err:
            if not str(err).startswith("429") or attempt == _tries - 1:
                raise
            wait = 15 * (attempt + 1)
            print(f"  (429 — backing off {wait}s)", file=sys.stderr)
            time.sleep(wait)


def _call_once(method, path, payload=None, expect=(200,)):
    url = BASE + path
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": "Bearer " + token(),
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            status, raw = r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode("utf-8", "replace")
    except urllib.error.URLError as e:
        raise ECLError(f"{method} {path} — connection failed: {e.reason}")

    body = raw
    if raw.strip():
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            pass

    if status == 401:
        raise ECLError("401 Request Unauthorized — the token is invalid or expired.")
    if status == 429:
        raise ECLError("429 rate limited — all query endpoints share one bucket; back off.")
    if status not in expect:
        raise ECLError(f"{method} {path} → HTTP {status}\n{_fmt_err(body)}")

    # A failed query can still be HTTP 200 — check the body (guide 3-1).
    if isinstance(body, dict) and str(body.get("status", "")).lower() == "fail":
        raise ECLError(f"{method} {path} → 200 but status=fail: {body.get('message')}")
    if isinstance(body, dict) and body.get("Status") == "Error":
        raise ECLError(f"{method} {path} → {body.get('Message')}")
    return status, body


def _fmt_err(body):
    if isinstance(body, dict):
        if "errors" in body:
            return "\n".join(f"  {k}: {'; '.join(v)}"
                             for k, v in body["errors"].items())
        for k in ("Message", "message"):
            if body.get(k):
                tid = body.get("traceId")
                return f"  {body[k]}" + (f"  (traceId {tid})" if tid else "")
    return "  " + str(body)[:600]



def strip_tags(text):
    """Drop real HTML tags only. Ticket text can hold a literal "<" (e.g. 'no "<" button'); the old
    `<[^>]+>` swallowed everything from there to the next ">" (DRI261889-0026, 2026-09-17)."""
    import html as _html
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    # whitelist of HTML tag names — "<Claude Reviewed>" is ticket text, not markup
    text = re.sub(r"</?(?:br|p|div|span|font|b|i|u|a|img|table|tbody|tr|td|th|strong|em|ul|ol|li|center|hr)"
                  r"(?:\s[^<>]*)?/?>", "", text, flags=re.I)
    return _html.unescape(text) if "&" in text else text


def query(model, conditions, page_size=200, sort_by=None, desc=False, template=False):
    prefix = TPL_PREFIX if template else Q_PREFIX
    payload = {"queryModel": model, "pageIndex": 1, "pageSize": page_size,
               "conditions": conditions}
    if sort_by:
        payload["sortBy"] = sort_by
        payload["isDesc"] = desc
    _, body = call("POST", f"{prefix}/{model}", payload)
    if isinstance(body, dict):
        return body.get("results") or body.get("data", {}).get("results") or []
    return []


# ---------------------------------------------------------------- preflight

def cmd_preflight(a):
    conds = [{"field": "TemplateType", "term": {"query": "Ebug"}},
             {"field": "IsIF3Project", "term": {"query": "true"}}]
    if a.product:
        conds.append({"field": "ProductName", "match": {"query": a.product}})
    if a.template_name:
        conds.append({"field": "TemplateName", "match": {"query": a.template_name}})

    rows = query("TSR.ProjectTemplate", conds, page_size=100, sort_by="TemplateName")
    if not rows:
        print("No IF3 eBug template matched.\n"
              "That pool has NOT migrated — Create eBug will not work on it.\n"
              "File through the ECL web form instead (see SKILL.md → The form).")
        return 1

    print(f"{len(rows)} IF3 eBug template(s) — these are the only pools Create can open on:\n")
    for r in rows:
        print(f"  TemplateID   {r.get('TemplateID')}   (IF3TemplateID {r.get('IF3TemplateID')})")
        print(f"  TemplateName {r.get('TemplateName')}")
        print(f"  ProductID    {r.get('ProductID')}")
        print(f"  ProductName  {r.get('ProductName')}")
        print(f"  ProductCode  {r.get('ProductCode')}   <- BugCode prefix")
        print()

    if len(rows) == 1 and rows[0].get("IF3TemplateID"):
        _print_severity_map(rows[0]["IF3TemplateID"])
    return 0


def _print_severity_map(if3_template_id):
    """Severity/Priority are integers whose meaning is per-template."""
    try:
        rows = query("TemplateService.TemplateData",
                     [{"field": "IF3TemplateID",
                       "term": {"query": str(if3_template_id)}}],
                     page_size=100, template=True)
    except ECLError as e:
        print(f"(could not read template field definitions: {e})")
        return
    for r in rows:
        name = str(r.get("FieldName") or r.get("Name") or "")
        if re.search(r"severity|priority", name, re.I):
            print(f"  {name}: {json.dumps(r.get('Options') or r, ensure_ascii=False)[:400]}")


# ------------------------------------------------------------------- create

def _ledger_path(bodies_path):
    return os.path.join(os.path.dirname(os.path.abspath(bodies_path)),
                        "filed_formcodes.json")


def _load_ledger(p):
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f)
    return {}


def _save_ledger(p, led):
    with open(p, "w") as f:
        json.dump(led, f, indent=2, ensure_ascii=False)


def _find_duplicate(short):
    """Live search before every create. The API has no idempotency of its own."""
    rows = query("TSR.EbugSearch",
                 [{"field": "ShortDescription", "term": {"query": short}}],
                 page_size=5)
    return [r for r in rows if r.get("ShortDescription", "").strip() == short.strip()]


def _verify_creator(login):
    """Creator is independent of the token and is NOT validated until a create is
    attempted — a typo'd or wrong login silently opens the whole batch under the wrong
    name. Prove the login already exists in the eBug pool before anything is sent."""
    rows = query("TSR.EbugSearch",
                 [{"field": "Creator", "term": {"query": login}}],
                 page_size=1, sort_by="CreateTime", desc=True)
    return rows[0] if rows else None


def cmd_create(a):
    with open(a.bodies) as f:
        bodies = json.load(f)

    print(f"Filing as Creator: {a.creator}"
          + (f"  (token owner: {a.token_owner})" if a.token_owner else ""))
    seen = _verify_creator(a.creator)
    if seen:
        print(f"  Creator verified — last filed {seen.get('BugCode')} on "
              f"{str(seen.get('CreateTime'))[:10]}")
    elif not a.new_creator:
        raise ECLError(
            f"Creator {a.creator!r} has never filed an eBug in the pool. Either the login "
            "is mistyped or this is a first-time filer. Confirm the ECL login with the "
            "user, then re-run with --new-creator. Nothing was sent.")
    else:
        print("  Creator has no prior eBugs — proceeding on --new-creator.")

    tpl = query("TSR.ProjectTemplate",
                [{"field": "TemplateType", "term": {"query": "Ebug"}},
                 {"field": "IsIF3Project", "term": {"query": "true"}},
                 {"field": "TemplateID", "term": {"query": str(a.template_id)}}],
                page_size=5)
    if not tpl:
        raise ECLError(
            f"TemplateID {a.template_id} is not an IF3 eBug template.\n"
            "Create eBug only works on IF3 pools. A wrong TemplateID is NOT rejected "
            "by the server — it opens a broken ticket. Run `preflight` first.")
    t = tpl[0]

    # The format check is a GATE, not a separate step someone can forget. Filing is
    # irreversible and emails three people per ticket; a malformed Short Description
    # then has to be corrected one bug at a time through the web edit form.
    if not a.skip_format_check:
        short_product = a.short_product or CODE_TO_SHORT_PRODUCT.get(t["ProductCode"])
        if not short_product:
            raise ECLError(
                f"No Short Description product token known for ProductCode "
                f"{t['ProductCode']!r}. Pass --short-product (e.g. PDR-I).")
        checker = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               "check_ebug_format.py")
        cmd = [sys.executable, checker, a.bodies, "--product", short_product,
               "--version", a.version,
               "--upload-dir", os.path.dirname(os.path.abspath(a.bodies))]
        print(f"Format check: {short_product} {a.version}", flush=True)
        if subprocess.call(cmd) != 0:
            raise ECLError(
                "format check FAILED — nothing was sent.\n"
                "Fix the errors above and re-run. If the convention has genuinely moved "
                "on, fix check_ebug_format.py rather than the ticket; --skip-format-check "
                "exists but every batch that used it shipped malformed.")
        print()

    ledger_path = _ledger_path(a.bodies)
    ledger = _load_ledger(ledger_path)
    filed, skipped, failed = [], [], []

    for key in sorted(bodies):
        e = bodies[key]
        short = e["short"].strip()

        if key in ledger:
            print(f"[{key}] already filed as {ledger[key]['FormCode']} — skipping")
            skipped.append(key)
            continue

        belong = BELONG_WEB_TO_API.get(e["belong"], e["belong"])
        if belong not in BELONG_API:
            failed.append((key, f"BugBelong {e['belong']!r} is not valid for the API"))
            continue

        payload = {
            "Creator": a.creator,
            "ProductID": t["ProductID"],
            "ProductName": t["ProductName"],
            "ProductCode": t["ProductCode"],
            "TemplateID": t["TemplateID"],
            "TemplateName": t["TemplateName"],
            "Version": a.version,
            "BuildNo": str(a.build),
            # Value-typed fields are sent explicitly, every time: omitted ones are
            # not always caught by validation and can land as false / 0 / 0001-01-01.
            "IsOEM": False,
            "BugSource": a.bug_source,
            "ParentTRCode": a.tr,
            "ParentSRCode": "",
            "BugBelong": belong,
            "ReproduceOut": int(e["out"]),
            "ReproduceTimes": int(e["times"]),
            "IsHappened": e.get("happened", "Unknown"),
            "IssueType": "",
            "CustomerIssueID": "",
            "DueDate": a.due_date,
            "ShortDescription": short,
            "IssueReproducer": "QA",
            "Priority": int(e.get("priority", 5)),
            "Severity": int(e["sev"]),
            "DescribeIssue": e["desc"],
        }

        if a.dry_run:
            print(f"\n--- [{key}] would POST {CREATE_PATH} ---")
            print(json.dumps(payload, indent=2, ensure_ascii=False))
            continue

        dupes = _find_duplicate(short)
        if dupes and not a.allow_duplicate:
            print(f"[{key}] SKIPPED — identical Short Description already filed as "
                  f"{', '.join(d['BugCode'] for d in dupes)}")
            skipped.append(key)
            continue

        try:
            status, body = call("POST", CREATE_PATH, payload, expect=(200,))
        except ECLError as err:
            # Never blind-retry a create: a timed-out create may have succeeded.
            print(f"[{key}] FAILED — {err}")
            failed.append((key, str(err)))
            continue

        if isinstance(body, (str, bytes)):
            # The create endpoint answers with a JSON *text* body (seen 2026-10-07, DRI261894P0008).
            try:
                body = json.loads(body)
            except ValueError:
                pass
        code = body.get("FormCode") if isinstance(body, dict) else None
        if not code:
            failed.append((key, f"no FormCode in response: {body}"))
            continue

        ledger[key] = {"FormCode": code, "Href": body.get("Href"), "JobID": body.get("JobID"),
                       "short": short, "at": time.strftime("%Y-%m-%dT%H:%M:%S")}
        _save_ledger(ledger_path, ledger)
        print(f"[{key}] created {code}")
        filed.append((key, code))
        if len(filed) == 1:
            # Check the FIRST ticket before filing the rest: one wrong ticket is a
            # correction, twenty is a re-do.
            if _readback([code], expect={"Creator": a.creator, "Build": str(a.build),
                                         "ParentTRCode": a.tr}):
                raise ECLError(
                    f"first ticket {code} did not read back as expected (see above). "
                    "Batch stopped after one ticket — fix the cause before re-running; "
                    "the ledger will skip what already filed.")
        time.sleep(a.delay)

    if a.dry_run:
        print(f"\nDry run — {len(bodies)} bug(s) would be created. Nothing was sent.")
        return 0

    print(f"\ncreated {len(filed)} · skipped {len(skipped)} · failed {len(failed)}")
    for key, why in failed:
        print(f"  FAILED {key}: {why}")
    if filed:
        print("\nRead-back (Status: OK is not proof — Version has been seen not to persist):")
        bad = _readback([c for _, c in filed], expect={
            "Version": a.version, "Build": str(a.build), "ParentTRCode": a.tr})
        if bad:
            print("\n*** Some bugs did not read back correctly. Fix them by hand "
                  "through the web edit form. ***")
            return 1
    print("\nAttachments are NOT part of create — upload them with "
          "`ecl_if3.py upload <BugCode> <files…>` (SKILL.md → IF3 attachments over the API).")
    return 1 if failed else 0


# ------------------------------------------------------------------ actions

def cmd_assign(a):
    # All three fields are required, and Assign OVERWRITES BugBelong and Priority.
    belong = BELONG_WEB_TO_API.get(a.belong, a.belong)
    if belong not in BELONG_API:
        raise ECLError(f"BugBelong {a.belong!r} is not valid; use {sorted(BELONG_API)}")
    if not 1 <= a.priority <= 5:
        raise ECLError("Priority must be an integer between 1 and 5.")
    payload = {"Assignees": [s.strip() for s in a.assignees.split(",") if s.strip()],
               "BugBelong": belong, "Priority": a.priority}
    if not payload["Assignees"]:
        raise ECLError("Assignees cannot be empty.")
    print(f"Assign overwrites BugBelong -> {belong} and Priority -> {a.priority} "
          f"on {a.bugcode}.")
    call("PUT", f"{ACTION_PREFIX}/{a.bugcode}/action/assign", payload, expect=(204,))
    print(f"{a.bugcode} assigned to {', '.join(payload['Assignees'])}")
    return 0


def cmd_resolve(a):
    if a.reviewer and a.reviewer == a.resolver:
        raise ECLError("Resolver could not be Code Reviewer.")
    payload = {
        "ResolveComment": {"RootCause": a.root_cause, "Solution": a.solution,
                           "Function": a.function, "Changeset": a.changeset},
        "CodeReviewer": a.reviewer or "",
        "NextRunHandler": a.next_handler or "",
        "ModuleOwner": a.module_owner or "NoNeed",
        "ModuleOwnerID": a.module_owner_id,
    }
    call("PUT", f"{ACTION_PREFIX}/{a.bugcode}/action/resolve", payload, expect=(204,))
    print(f"{a.bugcode} resolved; Handler now {a.reviewer or '(unchanged)'}")
    return 0


def cmd_codereview(a):
    # No body. Caller must be the current Handler (the reviewer named at Resolve) —
    # permission follows the ticket's current stage, not the token's role.
    call("PUT", f"{ACTION_PREFIX}/{a.bugcode}/action/codeReview", None, expect=(204,))
    print(f"{a.bugcode} code review passed")
    return 0


def cmd_buildresolve(a):
    if not str(a.close_to_build).strip():
        raise ECLError("Build number cannot be empty.")
    call("PUT", f"{ACTION_PREFIX}/{a.bugcode}/action/buildResolve",
         {"CloseToBuildNo": str(a.close_to_build)}, expect=(204,))
    print(f"{a.bugcode} build-resolved into {a.close_to_build}")
    return 0


# ----------------------------------------------------------------- readback

def _readback(codes, expect=None):
    rows = query("TSR.EbugSearch",
                 [{"field": "BugCode", "term": {"querys": list(codes)}}],
                 page_size=max(len(codes), 10))
    got = {r["BugCode"]: r for r in rows}
    bad = []
    for c in codes:
        r = got.get(c)
        if not r:
            print(f"  {c}  *** NOT FOUND on the server ***")
            bad.append(c)
            continue
        problems = []
        for field, want in (expect or {}).items():
            have = r.get(field)
            if have is None and field == "Version":
                # TSR.EbugSearch rows carry no Version column (2026-10-07: all 18 AI Mini Drama
                # tickets read None here while `ecl_query.py bug` showed 16.9.0) — not a failure.
                continue
            if str(have or "") != str(want):
                problems.append(f"{field}={have!r} (expected {want!r})")
        flag = "  <-- " + "; ".join(problems) if problems else ""
        print(f"  {c}  sev {r.get('EbugSeverity')}  {r.get('BugBelong')}  "
              f"{r.get('Status')}  build {r.get('Build')}  by {r.get('Creator')}{flag}")
        if problems:
            bad.append(c)
    return bad


def cmd_readback(a):
    return 1 if _readback(a.bugcodes) else 0


# ------------------------------------------------------------ attachments

def _upload_files(datajson):
    """DataJSON.UploadFiles — the attachments the eBug page shows. Files stored by the
    old /IF3/api/Attachment/{JobID} call are on the server but not in this list."""
    files = datajson.get("UploadFiles") or []
    if isinstance(files, str):
        try:
            files = json.loads(files)
        except json.JSONDecodeError:
            files = []
    return [f for f in files if isinstance(f, dict)]


def _file_name(f):
    return f.get("displayName") or f.get("DisplayName") or f.get("FileName") or f.get("fileName")


def _page_files(codes):
    """{BugCode: [UploadFiles entries]} from TSR.EbugLogAndData — the page's truth."""
    rows = query("TSR.EbugLogAndData", [{"field": "FormCode", "term": {"querys": list(codes)}}],
                 page_size=max(len(codes), 10))
    out = {c: None for c in codes}
    for r in rows:
        if r.get("DataJSON"):
            out[r.get("FormCode")] = _upload_files(json.loads(r["DataJSON"]))
    return out


def _upload_once(code, path):
    """POST one file to the public code endpoint. Returns (ok, message, data[0])."""
    import mimetypes
    import uuid
    name = os.path.basename(path)
    ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        content = f.read()
    boundary = "----ecl" + uuid.uuid4().hex
    body = b"".join([
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"formDataPath\"\r\n\r\n"
        f"{UPLOAD_FORM_DATA_PATH}\r\n".encode(),
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"formFile\"; "
        f"filename=\"{name}\"\r\nContent-Type: {ctype}\r\n\r\n".encode(),
        content, f"\r\n--{boundary}--\r\n".encode()])
    api = UPLOAD_PATH.format(code=code)
    req = urllib.request.Request(BASE + api, data=body, method="POST", headers={
        "Authorization": "Bearer " + token(),
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            status, raw = r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read().decode("utf-8", "replace")
    except urllib.error.URLError as e:
        raise ECLError(f"POST {api} — connection failed: {e.reason}")
    if status == 401:
        raise ECLError("401 Request Unauthorized — the token is invalid or expired.")
    if status == 429:
        raise ECLError("429 rate limited")
    try:
        resp = json.loads(raw)
    except json.JSONDecodeError:
        return False, f"HTTP {status}: {raw[:300]}", {}
    data = resp.get("data") if isinstance(resp, dict) else None
    first = data[0] if isinstance(data, list) and data and isinstance(data[0], dict) else {}
    ok = (status == 200 and str(resp.get("status", "")).lower() == "success"
          and first.get("formDataUpdated") is True)
    return ok, f"HTTP {status} status={resp.get('status')} message={resp.get('message')!r}", first


def cmd_upload(a):
    """Attach files so they show on the eBug page. Success needs status "success" AND
    data[0].formDataUpdated true; "File uploaded but form data was not updated" means the
    file is stored but NOT on the page. Stored files cannot be removed, so nothing retries
    except a 429, which is refused before processing."""
    code = a.bugcode
    if "P" not in code[3:]:
        raise ECLError(f"{code} is an old-ASP bug — attach through the web form instead.")
    missing = [f for f in a.files if not os.path.isfile(f)]
    if missing:
        raise ECLError("not found: " + ", ".join(missing))
    shown = _page_files([code]).get(code)
    if shown is None:
        raise ECLError(f"{code}: no TSR.EbugLogAndData row — check the BugCode.")
    on_page = {_file_name(f) for f in shown}
    todo = [f for f in a.files if os.path.basename(f) not in on_page or a.allow_duplicate]
    for f in a.files:
        if f not in todo:
            print(f"  skip {os.path.basename(f)} — already on the page")
    if a.dry_run:
        for f in todo:
            print(f"  would upload {os.path.basename(f)} → {UPLOAD_PATH.format(code=code)}")
        print(f"\nDry run — {len(todo)} file(s). Nothing was sent.")
        return 0
    failed = []
    for f in todo:
        for attempt in range(6):
            try:
                ok, msg, first = _upload_once(code, f)
                break
            except ECLError as err:
                if not str(err).startswith("429") or attempt == 5:
                    raise
                time.sleep(15 * (attempt + 1))
        name = os.path.basename(f)
        if ok:
            print(f"  {name}  uploaded, formDataUpdated  (objectKey {first.get('objectKey')})")
        else:
            print(f"  {name}  *** NOT ON THE PAGE *** {msg} formDataUpdated="
                  f"{first.get('formDataUpdated')!r}")
            failed.append(name)
        time.sleep(a.delay)
    # Read back the page's own list: the upload response alone is not proof.
    now = {_file_name(x) for x in (_page_files([code]).get(code) or [])}
    absent = [os.path.basename(f) for f in todo if os.path.basename(f) not in now]
    print(f"\n{code}: {len(now)} file(s) on the page")
    if absent:
        print("*** not in UploadFiles after upload: " + ", ".join(absent) + " — do NOT re-upload "
              "blindly (stored files cannot be removed); check the page first. ***")
    return 1 if failed or absent else 0


def cmd_files(a):
    """List what each eBug page actually shows (DataJSON.UploadFiles)."""
    bad = 0
    for code, files in _page_files(a.bugcodes).items():
        if files is None:
            print(f"{code}  *** no TSR.EbugLogAndData row ***")
            bad = 1
            continue
        print(f"{code}  {len(files)} file(s) on the page")
        for f in files:
            print(f"  {_file_name(f)}  {DOWNLOAD_PATH.format(key=f.get('objectKey'))}")
    return bad


# ------------------------------------------------------------ export-filing

def _full_bug(code):
    """Everything the eBug page shows, for one bug, from the server.
    IF3 bugs (P separator) carry their fields in EbugLogAndData.DataJSON; old-ASP bugs
    only answer GetOldEbugData."""
    out = {"bugcode": code}
    s = query("TSR.EbugSearch", [{"field": "BugCode", "term": {"query": code}}], page_size=1)
    if s:
        r = s[0]
        out.update(short=r.get("ShortDescription"), status=r.get("Status"),
                   severity=r.get("EbugSeverity"), priority=r.get("EbugPriority"),
                   belong=r.get("BugBelong"), creator=r.get("Creator"),
                   created=str(r.get("CreateTime") or "")[:19], build=r.get("Build"),
                   tr=r.get("ParentTRCode"), product=r.get("ProductName"),
                   template=r.get("TemplateName"), assignee=r.get("Assignee"),
                   handler=r.get("Handler"))
    try:
        rows = query("TSR.EbugLogAndData",
                     [{"field": "FormCode", "term": {"query": code}}], page_size=1)
    except ECLError:
        rows = []
    if rows and rows[0].get("DataJSON"):
        d = json.loads(rows[0]["DataJSON"])
        out.update(version=d.get("Version"), build=d.get("BuildNo") or out.get("build"),
                   bug_source=d.get("BugSource"), reproduce=f"{d.get('ReproduceOut')}/"
                   f"{d.get('ReproduceTimes')}", happened=d.get("IsHappened"),
                   desc=strip_tags(d.get("DescribeIssue") or ""),
                   creator=d.get("Creator") or out.get("creator"))
        # The page lists DataJSON.UploadFiles and nothing else (2026-10-20, DRI261896P0043).
        out["attachments"] = [_file_name(f) for f in _upload_files(d)]
    else:
        try:
            old = query("TSR.SP.GetOldEbugData",
                        [{"field": "BugCode", "term": {"query": code}}], page_size=1)
        except ECLError as err:        # seen: HTTP 500 "String or binary data would be truncated"
            out["readback_note"] = f"old-ASP detail unavailable: {str(err).splitlines()[-1].strip()}"
            old = []
        if old:
            r = old[0]
            out.update(version=r.get("Version"), reproduce=f"{r.get('ReproduceOut')}/"
                       f"{r.get('ReproduceTimes')}", happened=r.get("IsHappened"))
            for f in (json.loads(r["DetailData"]) if isinstance(r.get("DetailData"), str)
                      else r.get("DetailData") or []):
                if f.get("FieldCode") == "Describe Issue":
                    out["desc"] = strip_tags(f.get("FieldValue") or "")
            up = r.get("UploadFile")
            up = json.loads(up) if isinstance(up, str) and up.strip() else (up or [])
            out["attachments"] = [f.get("FileName") for f in up if isinstance(f, dict)]
    return out


def cmd_export_filing(a):
    """Write filed_bugcodes.json — the one record the exploration report's
    「eBug 送單結果」 section, the BugCode stamps and the filing report all read.
    Every field is READ BACK from the server, never copied from the draft."""
    entries = []            # (key, bugcode)
    if a.ledger:
        with open(a.ledger) as f:
            led = json.load(f)
        entries += [(k, v["FormCode"]) for k, v in sorted(led.items())]
    for pair in a.map or []:
        k, _, code = pair.partition("=")
        entries.append((k, code))
    if not entries:
        raise ECLError("nothing to export — pass --ledger and/or --map KEY=BUGCODE")

    bodies = {}
    if a.bodies:
        with open(a.bodies) as f:
            bodies = json.load(f)

    bugs, wrong_creator = [], []
    for key, code in entries:
        b = _full_bug(code)
        src = bodies.get(key, {})
        b.update(key=key, iss=src.get("iss", ""), feature=src.get("feature", ""),
                 problem_type=src.get("type", ""))
        if not b.get("desc") and src.get("desc"):
            b["desc"], b["desc_source"] = src["desc"], "bodies.json (server detail unavailable)"
        if not b.get("attachments") and src.get("files"):
            b["attachments"] = list(src["files"])
        if not b.get("version") and a.version:
            b["version"] = a.version
        if a.creator and b.get("creator") != a.creator:
            wrong_creator.append(f"{code} created by {b.get('creator')}")
        bugs.append(b)
        print(f"  {code}  {b.get('status')}  sev {b.get('severity')}  "
              f"{b.get('belong')}  by {b.get('creator')}  — {str(b.get('short'))[:70]}")

    creators = sorted({b.get("creator") for b in bugs if b.get("creator")})
    doc = {"meta": {"creator": a.creator or ", ".join(creators),
                    "creators_read_back": creators,
                    "token_owner": a.token_owner or "",
                    "method": a.method, "tr": a.tr or "", "server": a.server or "",
                    "version": a.version or "", "build": a.build or "",
                    "filed_on": time.strftime("%Y-%m-%d")},
           "bugs": bugs,
           "dispositions": {}}
    if a.dispositions:
        with open(a.dispositions) as f:
            doc["dispositions"] = json.load(f)
    with open(a.out, "w") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
    print(f"\nwrote {a.out} — {len(bugs)} bug(s), Creator read back: {', '.join(creators)}")
    if wrong_creator:
        print("*** Creator mismatch: " + "; ".join(wrong_creator) + " ***")
        return 1
    return 0


# --------------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("preflight", help="find IF3 eBug templates you can file on")
    s.add_argument("--product")
    s.add_argument("--template-name")
    s.set_defaults(fn=cmd_preflight)

    s = sub.add_parser("create", help="create eBugs from a bodies.json")
    s.add_argument("bodies")
    s.add_argument("--tr", required=True)
    s.add_argument("--template-id", required=True, type=int)
    s.add_argument("--creator", required=True)
    s.add_argument("--version", required=True)
    s.add_argument("--build", required=True)
    s.add_argument("--due-date", required=True, help="ISO date, e.g. 2026-10-15")
    s.add_argument("--bug-source", default="QA")
    s.add_argument("--delay", type=float, default=1.0)
    s.add_argument("--dry-run", action="store_true")
    s.add_argument("--allow-duplicate", action="store_true",
                   help="file even when an identical Short Description exists")
    s.add_argument("--short-product",
                   help="product token for the Short Description (PDR-I / PDR-A / PHD); "
                        "derived from the template's ProductCode when omitted")
    s.add_argument("--token-owner", default="",
                   help="ECL login the token belongs to, when it differs from --creator")
    s.add_argument("--new-creator", action="store_true",
                   help="allow a Creator with no prior eBugs (first-time filer)")
    s.add_argument("--skip-format-check", action="store_true",
                   help="bypass check_ebug_format.py (every batch that did shipped malformed)")
    s.set_defaults(fn=cmd_create)

    s = sub.add_parser("assign")
    s.add_argument("bugcode")
    s.add_argument("--assignees", required=True, help="comma-separated ECL accounts")
    s.add_argument("--belong", required=True)
    s.add_argument("--priority", required=True, type=int)
    s.set_defaults(fn=cmd_assign)

    s = sub.add_parser("resolve")
    s.add_argument("bugcode")
    s.add_argument("--root-cause", required=True)
    s.add_argument("--solution", required=True)
    s.add_argument("--function", default="")
    s.add_argument("--changeset", default="")
    s.add_argument("--reviewer", default="")
    s.add_argument("--resolver", default="", help="your account, to catch self-review")
    s.add_argument("--next-handler", default="")
    s.add_argument("--module-owner", default="NoNeed")
    s.add_argument("--module-owner-id", type=int, default=0)
    s.set_defaults(fn=cmd_resolve)

    s = sub.add_parser("codereview")
    s.add_argument("bugcode")
    s.set_defaults(fn=cmd_codereview)

    s = sub.add_parser("buildresolve")
    s.add_argument("bugcode")
    s.add_argument("--close-to-build", required=True)
    s.set_defaults(fn=cmd_buildresolve)

    s = sub.add_parser("readback")
    s.add_argument("bugcodes", nargs="+")
    s.set_defaults(fn=cmd_readback)

    s = sub.add_parser("upload", help="attach files to an IF3 eBug so they show on its page")
    s.add_argument("bugcode")
    s.add_argument("files", nargs="+")
    s.add_argument("--delay", type=float, default=1.0)
    s.add_argument("--dry-run", action="store_true")
    s.add_argument("--allow-duplicate", action="store_true",
                   help="upload even when a file of that name is already on the page")
    s.set_defaults(fn=cmd_upload)

    s = sub.add_parser("files", help="list the attachments each eBug page shows (UploadFiles)")
    s.add_argument("bugcodes", nargs="+")
    s.set_defaults(fn=cmd_files)

    s = sub.add_parser("export-filing",
                       help="read filed bugs back into filed_bugcodes.json for the report")
    s.add_argument("--ledger", help="filed_formcodes.json from create (API path)")
    s.add_argument("--map", nargs="*", metavar="KEY=BUGCODE",
                   help="web-form path: entry key → BugCode, e.g. F-3=DRI261890P0012")
    s.add_argument("--bodies", help="bodies.json, to carry iss / feature / type per key")
    s.add_argument("--dispositions", help="JSON {ISS-ID: 不開單（PM 裁示）…} for held findings")
    s.add_argument("--creator", help="intended ECL login; any mismatch fails the export")
    s.add_argument("--token-owner", default="")
    s.add_argument("--method", choices=["api", "api+browser-upload", "browser-form"], required=True)
    s.add_argument("--tr"); s.add_argument("--server"); s.add_argument("--version")
    s.add_argument("--build")
    s.add_argument("--out", default="filed_bugcodes.json")
    s.set_defaults(fn=cmd_export_filing)

    a = p.parse_args()
    try:
        return a.fn(a)
    except ECLError as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())

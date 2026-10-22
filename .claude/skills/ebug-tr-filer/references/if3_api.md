# ECL IF3 TR / eBug REST API — reference

Condensed from `ECL_MCP_RD_QA_Guide.pdf` (RD, chapter 3). Every section marked ⚠ was verified by RD
against the live system on 2026-09-09 and **supersedes the older written documentation**.

Only the decisions live in `SKILL.md`; this file is the lookup table.

---

## Scope — IF3 only

| Your project | Usable? |
|---|---|
| Migrated to IF3 | ✅ query, create, assign, resolve, code review, build resolve |
| Still on old ASP | ❌ no create, no actions. Queries return **common fields only** |

Custom template fields on old ASP tickets live in a different set of tables that is not exposed.
**They come back missing rather than erroring** — the single easiest way to reach a wrong conclusion
from this API.

**Old vs new, at a glance:** TR serial 4 digits = IF3 (`TR260907-0005`), 3 digits = old
(`TR260629-007`). eBug separator `P` = IF3 (`PDP260906P0001`), `-` = old (`PDP260902-0020`).

---

## Common spec

- **Auth:** `Authorization: Bearer <token>` on every request, one token across all endpoints.
  Get it at `https://ecl.cyberlink.com/sso/mgm/tokenPage`.
- **Header:** `Content-Type: application/json`
- **Path prefixes — easy to paste wrong:**

| Class | Prefix |
|---|---|
| Queries | `/IF3/tsr/api/public/Query/…` (template definitions: `/IF3/templatesrv/api/public/Query/…`) |
| Create eBug | `/api/TSR/…` |
| Other actions | `/api/TSRPublic/…` |

### Response contract

| Code | Meaning |
|---|---|
| 200 | query succeeded, **or** Create eBug succeeded |
| 204 | action succeeded (no body) |
| 400 | bad/missing parameter, business rule, no permission, or bug out of scope |
| 401 | token invalid or expired |
| 404 | code does not exist, or that action name does not exist |
| 429 | query rate limit — **all query endpoints share one bucket** |
| 500 | internal error; report with the `traceId` |

**A failed query can still be HTTP 200.** Always check the body:

```json
{ "status": "fail", "message": "…", "data": [] }
```

Action failures come in two shapes — `{"Status":"Error","Message":"…"}` for expected errors, and
`{"success":false,"message":"Internal server error.","traceId":"…"}` for internal ones.

### Query DSL

Each condition is `{ "field": "<name>", "<operator>": { … } }`:

| Operator | Payload | Meaning |
|---|---|---|
| `term` | `{"query":"v"}` or `{"querys":["A","B"]}` | exact; `querys` = any-of |
| `match` | same | fuzzy / contains |
| `termNot` / `matchNot` | same | exclude |
| `range` | `{"gte":"2026-01-01","lte":"2026-06-30"}` | also `gt` / `lt` |
| `isNull` | `true` / `false` | |

`queryModel` must equal the last path segment exactly, or you get `Model name mismatch`.
`pageIndex` starts at **1**.

---

## Queries

### `TSR.TRSearch` — `POST /IF3/tsr/api/public/Query/TSR.TRSearch`

TR common fields. Statuses: `NewCreated` / `Assigned` / `Done` / `Closed` / `Rejected` / `Cancelled`.

⚠ **Cancelled TRs are returned.** Add `{"field":"FormState","term":{"query":"Normal"}}` when counting.
⚠ **`CreateDate` in the response is the *template's* creation date, not the TR's.** Sort and filter
on `CreateTime`.

### `TSR.EbugSearch` — `POST /IF3/tsr/api/public/Query/TSR.EbugSearch`

**The dedupe workhorse — covers old ASP bugs as well as IF3 ones.**

```json
{ "queryModel": "TSR.EbugSearch", "pageIndex": 1, "pageSize": 200, "sortBy": "CreateTime",
  "conditions": [ {"field":"ProductName","term":{"query":"PowerDirector"}},
                  {"field":"Build","term":{"query":"3105"}},
                  {"field":"Status","termNot":{"query":"Close"}} ] }
```

Returns `JobID`, `BugCode`, `ParentSRCode`, `ParentTRCode`, **`ShortDescription`**, `Assignee`,
`CodeReviewer`, `DueDate`, `EbugPriority`, `EbugSeverity`, `ProductID`, `ProductName`, `TemplateID`,
`TemplateName`, `Creator`, `CreateTime`, `CloseTime`.

⚠ **Do not hard-code Status values.** Live data contains `NewCreated`, `TRCreated`, `BugNeedReview`,
`BugReviewing`, `BugReviewed`, `Assigned`, `NeedCodeReview`, `Close`, `Cancelled` — and the documented
`Open` never appears.

### `TSR.TRFormData` — template custom fields on a TR

⚠ `CreateTime` in the response is **ambiguous** — it carries both the TR's and the IF3 flow record's
creation time under one name. Use `TSR.TRSearch` when you need the TR's. Harmless as a filter.

### `TSR.EbugLogAndData` — custom fields + attachments + log for specific bugs

`FormCode` is **required**; no product/status/build fields, so it cannot be used to search. The
standard pattern is two-stage: `TSR.EbugSearch` to get BugCodes, then this to read their contents.
Takes `querys` for a batch. The row is `{FormCode, JobID, DataJSON}`; **`DataJSON.UploadFiles` is exactly the
attachment list the eBug page shows** — entries `{fileID, displayName, objectKey, fileURL, creator, createTime}`.
`fileURL` (`/IF3/Data/Download?o=…`) needs a browser login; with the token use `DownloadByToken` below.

### `TemplateService.TemplateData` — `POST /IF3/templatesrv/api/public/Query/TemplateService.TemplateData`

Template field definitions, including what the numeric `Priority` / `Severity` values mean for that
template. **Cache by `IF3TemplateID`** — definitions rarely change and all queries share one rate limit.

### `TSR.ProjectTemplate` — which templates exist, and which are on IF3

Returns only templates that are still valid and not phased out. Filter with
`{"field":"TemplateType","term":{"query":"Ebug"}}` and
`{"field":"IsIF3Project","term":{"query":"true"}}`.

⚠ **A product version's TR template and eBug template share the same `TemplateName` and differ only
by ID** (e.g. 23197 TR / 23198 eBug). Always filter on `TemplateType`; matching by name picks the
wrong one.

---

## Actions

| # | Action | Endpoint | Success |
|---|---|---|---|
| 7 | Create eBug | `POST /api/TSR/Ebug/Create` | 200 + new code |
| 8 | Assign | `PUT /api/TSRPublic/ebug/{BugCode}/action/assign` | 204 |
| 9 | Resolve | `PUT /api/TSRPublic/ebug/{BugCode}/action/resolve` | 204 |
| 10 | Code Review | `PUT /api/TSRPublic/ebug/{BugCode}/action/codeReview` | 204 |
| 11 | Build Resolve | `PUT /api/TSRPublic/ebug/{BugCode}/action/buildResolve` | 204 |

⚠ **Those four are the only actions that exist.** RD tested `reject`, `reopen`, `backToProposer`,
`returnToCreator`, `propose`, `cancel`, `close`, `nab`, `postpone`, `wontFix`, `verify`,
`notReproducible` — **all 404.** Anything that sends a ticket backwards, sideways or to a close is
web-only. There is no Create TR endpoint at all.

⚠ **Action permissions follow the ticket's current handler, not the token's role.** After an assignee
resolves a bug the handler moves to the code reviewer; that same assignee's token then gets
`400 You don't have permission to perform this action.` on `codeReview`. A pipeline that walks a
ticket through several stages needs a different person's token at each stage.

### Create eBug — fields

| Field | Req | Notes |
|---|---|---|
| `Creator` | ✔ | ECL login of the reporter; must exist in TSR. Independent of whose token calls |
| `ProductID` / `ProductName` / `ProductCode` | ✔ | all three, from the same `TSR.ProjectTemplate` row |
| `TemplateID` / `TemplateName` | ✔ | must be `TemplateType:"Ebug"` **and** `IsIF3Project:true`. A wrong one is **not rejected** — it opens a broken ticket |
| `Version` | ✔ | e.g. `16.8.0` |
| `BuildNo` | ✔ | e.g. `188981` |
| `IsOEM` | ✔ | `false` = normal flow; different BPM start point |
| `BugSource` | ✔ | `QA` / `QAAutoTest` / `RD` / `PL` / `PM` / `OEM` / `BU` / `VIP` / `Others` |
| `ParentTRCode` | — | the TR this was found on |
| `ParentSRCode` | — | |
| `BugBelong` | ✔ | **`RD` / `RDSK` / `PCArt` / `PCDoc` / `PM` / `Marketing` / `RD-ECL`** — note the API spellings. `RD` auto-sets `NeedCodeReview` |
| `ReproduceOut` / `ReproduceTimes` | ✔ | N succeeded out of M attempts |
| `IsHappened` | ✔ | `Yes` / `No` / `Unknown` — was it in the previous build |
| `IssueType` / `CustomerIssueID` | — | OEM flow only |
| `DueDate` | ✔ | ISO 8601 date |
| `ShortDescription` | ✔ | see the format rule in SKILL.md |
| `IssueReproducer` | ✔ | `QA` in practice |
| `Priority` / `Severity` | ✔ | **integers, not labels**; meaning is per-template — check via `TemplateService.TemplateData` |
| `DescribeIssue` | ✔ | the body; newlines allowed |

System-generated, do not send: `BugCode` (`<ProductCode><yymmdd>P<4-digit>`), `IF3TemplateID`,
`NeedCodeReview`, `BuildNoPrefix`, `CreatorID`.

**Response (200):**

```json
{ "Status":"OK", "Message":"", "Href":"https://ecl.cyberlink.com/IF3/ebug/BPM/FormView/PDP260906P0001",
  "JobID":123456, "ServiceCode":"ebug", "FormCode":"PDP260906P0001", "OK":true }
```

`FormCode` is the BugCode. Record it — Assign and Resolve need it.

**Failures:** 400 `{"errors":{"Creator":["The Creator field is required."]}}` (missing/mistyped
required field) · 401 `Request Unauthorized.` · 500 (Creator not found, IF3 flow failed to start).

⚠ **`Version` may silently not persist** — a create with `"Version":"1.0"` read back as `null` while
`BuildNo` was fine. **Re-query after every create.**
⚠ **`ParentTRCode` is not checked across products.** A Website TR attaches to an ECL-Systems bug.
⚠ **No duplicate protection.** Same payload twice = two bugs. Idempotency is the caller's job.
⚠ **Omitted value-typed fields may not be caught by validation** and can persist as `false` / `0` /
`0001-01-01`. Send `IsOEM`, `Priority`, `Severity`, `ReproduceOut`, `ReproduceTimes`, `DueDate`
explicitly.

### Assign — request

```json
{ "Assignees": ["RD_USER_A"], "BugBelong": "RD", "Priority": 4 }
```

⚠ **The documented body was wrong.** All three fields are required, and the server rejects them one
at a time: `Assignees` only → `400 BugBelong cannot be empty.` → add `BugBelong` → `400 Priority must
be an integer between 1 and 5.` → add `Priority` → 204. A first 400 does not mean everything is wrong;
follow the messages one by one.

⚠ **Assign overwrites `BugBelong` and `Priority` on the ticket.** It is not an additive operation —
don't change Priority by accident while adding an assignee.

Assignees must be in the role group for that `BugBelong`, or:
`400 These assignees are not in the '<X>' role group (<Y>): <account>.`
Other 400s: `Assignees cannot be empty.` · `Assignee not found: XXX.` (whole call is a no-op) ·
`You don't have permission.` · `Not found this bug.` 404: `No such eBug.`

After success: `Status` NewCreated → `Assigned`, `Assignee` null → your accounts, `Handler` SYSTEM → them.

---

## Attachments (public API docs §14–16, verified 2026-10-20)

Source: https://ecl.cyberlink.com/IF3/ebug/BPM/Start/Request/PublicAPIDocumentation. Client: `ecl_if3.py upload` / `files`.

| Purpose | Call |
|---|---|
| Upload so it **shows on the page** | `POST /IF3/ebug/api/public/Attachment/code/{BugCode}`, multipart `formFile` + `formDataPath=$.UploadFiles` |
| What the page shows (truth) | `TSR.EbugLogAndData` → `DataJSON.UploadFiles` |
| Everything ever stored | `GET /IF3/ebug/api/Attachments/Code/{BugCode}` — includes removed and invisible files |
| Download with the token | `GET /IF3/ebug/Data/DownloadByToken?o={objectKey}` |

Upload success = body `status` "success" **and** `data[0].formDataUpdated` true. `status: "fail"` with
*"File uploaded but form data was not updated"* = stored, not shown. Stored files cannot be deleted over the API.

⚠ **`POST /IF3/api/Attachment/{JobID}` is wrong for filing.** It stores the file but never adds it to
`UploadFiles`, so the page shows nothing (DRI261896P0043 and ~40 P-series bugs, found 2026-10-20). Bugs that went
through it need their files re-uploaded through the code endpoint to show.

## Handling the credentials

The guide's Client ID / Secret are **application-level shared credentials**. Do not post them to
Slack / Teams / U Messenger, commit them to Git, write them into an externally-shared document, or
forward them to a colleague — colleagues request their own from Jeffy Chuang.

**Query-class tokens carry no permission filtering**: any valid token can read everything in scope,
including tickets its owner could not see in the ECL web UI. Treat query output as confidential and
do not bulk-export it anywhere.

## The MCP server (read-only, separate from this API)

`https://ecl.cyberlink.com/mcp` — read-only queries over eExpense, ePurchase, Budget, TR, TSR, eHR,
eVacation, **scoped to the connected user's own ECL permissions** (unlike the REST tokens above).
It cannot create or modify anything. Useful for looking things up; useless for filing —
`get_service_capability("tsr")` returns `"bpms": []`, so there is no BPM to create against even
where a `create_form` tool is exposed. Filing is `scripts/ecl_if3.py`, over the REST endpoints above.

**MCP exposes six tsr query models and nothing else** (verified 2026-09-16):
`TSR.TRSearch`, `TSR.EbugSearch`, `TSR.eBugByTR`, `TSR.AttachedEBug`, `TSR.EbugTags`,
`TSR.SP.GetOldEbugData` — plus `TR.SP.GetOldTRData` under `tr`.

⚠ **`TSR.ProjectTemplate`, `TSR.EbugLogAndData` and `TemplateService.TemplateData` are REST-only.**
They are not on MCP, so the "is this template on IF3?" pre-flight **cannot** be done through the
connector — use `scripts/ecl_if3.py preflight`, or fall back to the code separator (eBug `P` = IF3,
`-` = old ASP; TR serial 4 digits = IF3, 3 = old).

⚠ **Check `callerUserName` in every MCP response.** It is whoever authorised the connector's SSO
grant, not whoever is typing, and MCP filters results by *that* account's permissions. A connector
bound to a colleague silently returns their scope — a dedupe can come back clean because of their
visibility, not because the pool is clean. Reconnect via `/mcp` to re-run the grant under the right
account. If a connection stops working, the usual cause is an expired refresh token or Offline
Access not having been granted — reconnect.

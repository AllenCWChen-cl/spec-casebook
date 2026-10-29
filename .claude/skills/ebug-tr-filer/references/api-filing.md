# Filing over the IF3 REST API

Part of the `ebug-tr-filer` skill (read `SKILL.md` and `references/casebook-overlay.md` first). Endpoint details are in `if3_api.md`.

## The IF3 REST API — when it can replace the web form, and when it cannot

RD published a REST API (`ECL_MCP_RD_QA_Guide`, behaviour verified 2026-09-09) that can create an
eBug in one POST instead of ~40 browser calls. **It only works on IF3 tickets**, and most of the
pool this skill files into is still old ASP. Decide which path you are on *before* you start.

Full field tables, error shapes and the query DSL live in `references/if3_api.md`. The decisions:

### Is this ticket old or new? — check before anything else

| | IF3 (API works) | old ASP (web form only) |
|---|---|---|
| TR code | **4-digit** serial — `TR260907-0005` | **3-digit** — `TR260629-007` |
| eBug code | separator **`P`** — `PDP260906P0001` | separator **`-`** — `PDP260902-0020` |
| TR URL | `/IF3/tr/BPM/FormView/<code>` | `/TR/TRHandle/HandleMainTR.asp?TRCode=<code>` |

Confirm the eBug *template* too: `TSR.ProjectTemplate` with `TemplateType:"Ebug"` and
`IsIF3Project:true`. If it does not come back, that pool has not migrated and the API cannot open a
bug on it, whatever the TR code looks like.

**TR260904-103 is a 3-digit old-ASP TR** — the September 2026 EDF batch had to go through the web
form. But the pool is migrating under you: **as of 2026-09-16 the PowerDirector iOS 16.8 eBug
template (23156) is on IF3** — `TR260915-0007` is a 4-digit TR and its bugs come back as
`DRI261890P0001`, with the `P` separator. The **AIFound pool (23323) is still old ASP**. So the two
paths now run side by side on the same product; check the template, not the product.

Never decide this from memory — run `scripts/ecl_if3.py preflight` and read the answer:

```bash
export ECL_TOKEN="$(cat ~/.ecl_token)"
python3 scripts/ecl_if3.py preflight --product "PowerDirector"
```

It lists every IF3 eBug template you can file on, with the `ProductID` / `ProductName` /
`ProductCode` / `TemplateID` the create payload needs. **A template that does not appear cannot be
filed on over the API** — and a wrong `TemplateID` is *not* rejected by the server, it opens a
broken ticket.

### What the API can and cannot do

| | |
|---|---|
| ✅ Create eBug, Assign, Resolve, Code Review, Build Resolve | the forward flow only |
| ✅ **Search TRs and eBugs, old and new** — common fields only | this is what makes it useful even on old projects |
| ❌ Reject, reopen, close, cancel, NAB, postpone, won't-fix, QA verify | all 404; web only |
| ❌ **Create a TR** | no endpoint exists at all |
| ❌ Template custom fields on old ASP tickets | they return **empty, not an error** — the easiest way to draw a wrong conclusion |
| ❌ Attachments on create | the create payload has no file field |
| ✅ Attachments after create | `ecl_if3.py upload` → public code endpoint with `formDataPath=$.UploadFiles` |

**The API can push a ticket forward but cannot pull it back.** Anything filed wrong is fixed by hand:
the user can **cancel** a bug from its ECL page (confirmed 2026-10-08 on the API test ticket
DRI261894P0033); the API has no cancel or delete call.

### Auth

`Authorization: Bearer <token>`, one token for every endpoint, obtained by the user from
`https://ecl.cyberlink.com/sso/mgm/tokenPage`. Ask them to fetch it; never handle their password.

Two things to hold onto:

- **Query-class tokens have no permission filtering.** Any valid token sees every in-scope ticket.
  Treat query results as confidential.
- **Action-class endpoints are bound to whoever's turn it is on the ticket**, not to the token's role.
  The assignee's own token gets `400 You don't have permission` on `codeReview` after they resolved
  the bug, because the handler has moved on. A chain of actions needs a token per stage — so don't
  design an unattended pipeline that assumes one token can walk a ticket through.
- The guide's Client ID / Secret are **shared application credentials**. Do not post them to Slack,
  Teams or U Messenger, commit them, or put them in an externally-shared doc. Colleagues request
  their own from Jeffy Chuang.

### Creating a bug

`POST /api/TSR/Ebug/Create` — note the prefix differs from both other classes
(queries are `/IF3/tsr/api/public/Query/…`, other actions `/api/TSRPublic/…`).

```json
{ "Creator": "ETHAN_HSU", "ProductID": 261, "ProductName": "PowerDirector Mobile for iOS",
  "ProductCode": "DRI", "TemplateID": 23156, "TemplateName": "PowerDirector iOS 16.8", "Version": "16.8.0",
  "BuildNo": "188981", "IsOEM": false, "BugSource": "QA", "ParentTRCode": "TR260915-0007",
  "BugBelong": "RD", "ReproduceOut": 2, "ReproduceTimes": 2, "IsHappened": "Unknown",
  "DueDate": "2026-09-30", "IssueReproducer": "QA", "Priority": 5, "Severity": 2,
  "ShortDescription": "PDR-I 16.8.0 - [EDF] Video Enhance: produced video is 100% black …",
  "DescribeIssue": "Repro Steps:\n1. Launch the APP\n…" }
```

Returns **200** (not 204) with `FormCode` — the new BugCode — and `Href`. Record `FormCode`.

**Five traps, all verified by RD's own testing:**

1. **`Version` sometimes does not persist.** A create with `"Version":"1.0"` read back as `null`
   while `BuildNo` wrote fine. **Re-query every bug after creating it** and check the key fields.
   `Status: OK` is not proof. (This is the same read-back step the web-form path already requires —
   it is not optional on the API either.)
2. **There is no idempotency.** The same payload sent twice opens two bugs. Guard the caller side:
   keep the `FormCode` per finding, and never retry a create on a timeout without searching first.
3. **`ParentTRCode` is not validated across products.** A Website TR will attach to an ECL-Systems
   bug without complaint. Check the pairing yourself.
4. **Omitted numeric fields do not always fail validation** — they can land as `false` / `0` /
   `0001-01-01`. Send `IsOEM`, `Priority`, `Severity`, `ReproduceOut`, `ReproduceTimes` and `DueDate`
   explicitly, every time.
5. **`BugBelong` spellings differ from the web form.** The API takes `RDSK` / `PCArt` / `PCDoc` where
   the form shows `Setup Kit` / `PC-Art` / `PC-Doc`. `RD` / `PM` / `Marketing` / `RD-ECL` are the same
   in both. A decisions table signed off against the web-form labels must be translated before it
   is POSTed.

Also: `BugBelong: "RD"` silently sets `NeedCodeReview: true`, and Assign **overwrites** `BugBelong`
and `Priority` on the ticket — it is not just "add an assignee".

### So which path do I use?

1. **Old-ASP TR, or a template not on IF3** → the web form. Everything in *The form* and
   *Attaching screenshots* (`web-form.md`).
2. **IF3 TR and an IF3 eBug template** → create over the API, then **upload the screenshots over the
   API too** (`ecl_if3.py upload`, see *IF3 attachments over the API*), since create
   takes no files. No browser at all — far less to go wrong than passes through the native Open dialog.
3. **Either way** → dedupe with `TSR.EbugSearch` first (*Deduping and calibrating*) and read every
   bug back from the server afterwards.


### Filing over the API — the actual commands

Only on an IF3 template (run `preflight` first). The token comes from the user, out of
`https://ecl.cyberlink.com/sso/mgm/tokenPage` — **never pass it on argv**, where it leaks into `ps`:

```bash
export ECL_TOKEN="$(cat ~/.ecl_token)"

# 1. always dry-run first: prints the exact payload per finding, sends nothing
python3 scripts/ecl_if3.py create upload/bodies.json --dry-run \
    --tr TR260915-0007 --template-id 23156 --creator ETHAN_HSU \
    --version 16.8.0 --build 189063 --due-date 2026-10-15

# 2. then for real — same command without --dry-run
```

`create` reads the **same `bodies.json` that `check_ebug_format.py` validates**, so run the format
check first and get it to zero errors. Per finding it translates the web-form BugBelong to the API
spelling (`Setup Kit`→`RDSK`, `PC-Art`→`PCArt`, `PC-Doc`→`PCDoc`), sends every value-typed field
explicitly, and then **reads the bug back and checks Version / Build / ParentTRCode** — `Status: OK`
is not proof, and `Version` has been observed not to persist.

**Three guards against the API's missing idempotency**, because the same payload sent twice opens
two bugs, and the API cannot remove either (only the user can cancel one by hand on its ECL page):

1. a `filed_formcodes.json` ledger written next to `bodies.json` after **every** create, so a
   re-run skips what already filed;
2. a live `TSR.EbugSearch` on the exact Short Description before each create;
3. a create that errors is **never retried automatically** — a timed-out create may have succeeded.
   Search first, by hand.

**`create` takes no attachments.** Upload them afterwards with `ecl_if3.py upload <BugCode> <files…>`, using the
`FormCode` that `create` writes to `filed_formcodes.json`, and confirm with `ecl_if3.py files` — see
*IF3 attachments over the API* (`web-form.md`).

The four forward actions are there too (`assign`, `resolve`, `codereview`, `buildresolve`), but
remember that **permission follows the ticket's current handler, not the token's role** — one token
cannot walk a ticket through several stages. QA filing normally stops after `create`.

# Filing through the ECL web form

Part of the `ebug-tr-filer` skill (read `SKILL.md` and `references/casebook-overlay.md` first). The browser-form path: fields, the red-box frames and attachments. The headings *The form* and *IF3 attachments over the API* are cited by `ecl_if3.py`.

## The form

From the TR page, the **Create eBug** section is form `FA`
(`POST .../Ebug/eBugForm/AddEbugFormBasp.asp`, `target="_blank"`). Popups are blocked in the
browser pane — set `f.target='_self'` and submit, or build the POST yourself:

```js
// opens a fresh create form in the same tab
const f=document.createElement('form'); f.method='post'; f.target='_self';
f.action='https://ecl.cyberlink.com/Ebug/eBugForm/AddEbugFormBasp.asp';
[['ProductID','261'],['TemplateID','23323'],['ParentTRCode','<TRCODE>'],['BtnCreateEbug','Create']]
  .forEach(([n,v])=>{const i=document.createElement('input');i.type='hidden';i.name=n;i.value=v;f.appendChild(i);});
document.body.appendChild(f); f.submit();
```

`ProductID` 261 = PowerDirector Mobile for iOS. `TemplateID` **23323 = AIFound eBug pool**
(the default is the version project — change it). `ParentTRCode` is what links the bug to the TR;
without it the bug is orphaned.

### Field map (names are non-obvious)

| Field on screen | Input name | Notes |
|---|---|---|
| Creator | `OwnerID` | already correct |
| Version | `Version` | `16.7.5` — version only |
| Build No | `BuildNo` | `188662` — bare number, no version prefix |
| Bug Source | `BugType` | `QA` for AIFound findings |
| Bug belongs to | `BugBelong` | RD / Setup Kit / PC-Art / PC-Doc / PM / Marketing / RD-ECL |
| Reproduce probability | `ReproduceOut`, `ReproduceTimes` | "N out of M" — state what you actually observed |
| Happens on previous build | `IsHappened` | Yes / No / Unknown |
| Short Description | `ShortDescription` | |
| Description | `t756205` | **pre-filled with the TR's rebuild notes — overwrite it** |
| Priority(RD) | `f756208` | 1 Fix Now … 5 N/A |
| **Severity(QA)** | **`f756209`** | 1 Critical/Blocking, 2 Major, 3 Normal, 4 Minor, 5 N/A |
| OS Language | `f756197` checkbox val `99` + `t756197` | tick "Other"; the text is pre-filled from the TR |
| Attachments | `flname1`–`flname3` | **`flname0` is the HW information file, not a screenshot slot** |
| Submit | `input[value="Create eBug"]` | → `AddEbugSaveBasp.asp` |

Call `addFile()` (an on-page function) to add `flname4`, `flname5`, … Existing attachments
survive. Total upload limit is 5 MB per bug.

Mirror an existing AIFound bug for house conventions before the first file of a batch —
open one and read its header rather than inventing values.

## Marking the problem area — red 5px box on every attached frame (user, 2026-09-29)

Every screenshot that goes onto the TR carries a **red (255,0,0), 5px rectangle around the element
that is wrong**, so dev sees the defect without reading the caption. Build the attachments with
`scripts/make_filing_sheets.py` rather than a per-session copy, because it draws the box for you:

1. After `drafts_to_bodies.py --stage upload/`, **Read each staged frame** and write
   `upload/boxes.json`: `{"<file>": [[x0, y0, x1, y1], ...]}` in **fractions of the frame (0–1)**,
   tight around the wrong element (the button with the wrong label, the empty field, the blank
   preview). Several boxes per frame are fine. Values > 1 are read as source pixels.
2. `[]` marks a frame deliberately unboxed: a spec/Figma frame, a healthy control, a "before" frame.
   A cited frame with no key at all prints a warning. Clear every warning before filing.
3. Run it with a Pillow venv (`pip install -r requirements.txt`, see the README):
   `<venv>/bin/python3 scripts/make_filing_sheets.py upload/ --captions captions.json`
   → `upload_filing/<ver>_<slug>_evidence.jpg` + `upload_filing/bodies.json` citing the sheet. For IF3,
   where each frame is uploaded separately over the API, add `--no-sheet`: frames are boxed but kept apart.
4. **Read one sheet back** before filing and check the box sits on the problem. Then run the format
   check against `upload_filing/`, not `upload/`.

The box is drawn **after** the frame is scaled to the sheet height and **outside** the given region,
so it is exactly 5px in the delivered JPEG and never covers the text it points at. Staged frames
run from ~500px to ~1500px tall and are all rescaled to 1100px, so a box drawn on the source file would
reach dev at anywhere from ~4 to ~11px. Verified 2026-09-29 on the AI Mini Drama MD-13 sheet: 5 red rows on each edge.

## Attaching screenshots — the part that breaks

**What every bug carries:** reviewer rule 3 in `references/casebook-overlay.md` (image always, log on
failures, no video unless asked).

**What works (27/27 on 2026-09-17, TR260911-068):** one captioned evidence sheet per ticket, staged alone in
`~/Desktop/ebug_current/`, picked through the native Open dialog with **cua desktop-scope clicks**.

1. Fill every field by JS, then `flname1.scrollIntoView({block:'center'})` and read its
   `getBoundingClientRect()`. Map to screen pixels (pane at devicePixelRatio 2):
   `X = originX + 2·(rect.x + 45)`, `Y = originY + 2·(rect.y + 10.75)`. Measure `originX/originY` once per
   session from one `get_desktop_state` capture of the Choose File button (09-17: 1585 / 272 → click 1899,1300).
2. `click {scope:"desktop", x, y}` — the browser tool's own click missed; the desktop click opens the dialog.
3. After the first manual navigation (sidebar Desktop → `ebug_current`) the dialog reopens there every time,
   so the only file and **Open** sit at fixed pixels (09-17: file 1977,691 · Open 2545,1303).
4. Verify `flname1.files[0].name` from JS **before** clicking Create eBug; read the BugCode from the
   resulting URL; after the batch, fetch every `HandleMainEbugContent.asp` and check Creator / Version /
   Build / TR / Belong / Severity / Reproduce / `<U>filename</U>` in one pass.

**Dead ends, so nobody retries them:** `form_input` / `input.value` on a file field (browser rule);
computer-use on the dialog (it belongs to the Claude app and can never be granted); a local HTTP server
for `fetch` (the pane blocks `127.0.0.1` and `localhost`); `navigator.clipboard.read()` and synthetic ⌘V
paste (both blocked). The notes below are the older route.


`input.value` cannot be set from JS (`InvalidStateError`); that is a browser rule and proves
nothing about clicking. Clicking **does** work. Per file:

1. `scrollIntoView` the target `flname<N>`, then compute click coordinates:
   `x_screenshot = x_css * (screenshotWidth / window.innerWidth)`. **Always scroll first** — skip it
   and the click lands in the Description textarea while the page is still at the top.
2. `computer` left_click the Choose File button.
3. `list_windows(pid=<Claude app pid>)` and find the window titled **"Open"**. If none appeared,
   the click missed — re-click, do not press keys blind.
4. **`bring_to_front(pid, <that window id>)`.** Non-negotiable. The dialog does not reliably take
   key focus, and unfocused Cmd+Shift+G lands in the pane's Find-in-page or in whatever app is
   frontmost — during one batch it opened stray Finder windows instead of attaching.
5. `clipboard_write` the absolute path, then Cmd+Shift+G → Cmd+V → Return → Return.
   Paste, never type.
6. Verify from the page, every time:
   `document.querySelectorAll('input[type=file]')[n].files[0].name`.

If a slot refuses after two attempts, drop that image and **remove its `{filename}` reference
from the Description** so no dangling reference ships.

### IF3 attachments over the API — no browser needed (corrected 2026-10-20)

**The page shows `DataJSON.UploadFiles` and nothing else.** Upload to the public code endpoint with
`formDataPath=$.UploadFiles` (ECL public API docs §14–16,
https://ecl.cyberlink.com/IF3/ebug/BPM/Start/Request/PublicAPIDocumentation) — `ecl_if3.py upload` does it:

```bash
./ecl_if3.py upload DRI261896P0043 upload_filing/16.9.0_x.jpg upload_filing/16.9.0_x_log.txt   # --dry-run first
./ecl_if3.py files  DRI261896P0043            # read back: what the page actually lists
```

Raw call, for reference (multipart fields `formFile` + `formDataPath`):

```bash
curl -s -H "Authorization: Bearer $(cat ~/.ecl_token)" -F "formFile=@16.9.0_x.jpg;type=image/jpeg" \
     -F 'formDataPath=$.UploadFiles' https://ecl.cyberlink.com/IF3/ebug/api/public/Attachment/code/<BugCode>
```

- **Success = body `status` "success" AND `data[0].formDataUpdated` true.** A fail reading *"File uploaded but
  form data was not updated"* means the file is stored but **not** on the page — do not re-upload blindly;
  check `ecl_if3.py files` first. `upload` skips names already on the page.
- **Read-back truth is `TSR.EbugLogAndData` → `DataJSON.UploadFiles`** (`ecl_if3.py files`, `_full_bug`).
  `/IF3/ebug/api/Attachments/Code/{BugCode}` lists **everything ever stored**, including files removed from the
  page and files the old call stored invisibly — never use it as proof a file is shown.
- **Download** with the token: `GET /IF3/ebug/Data/DownloadByToken?o={objectKey}`. The entry's `fileURL` needs a
  browser login.
- **Do not use `POST /IF3/api/Attachment/{JobID}`** (what this skill said from 2026-10-07 to 2026-10-20). It stores
  the file but never adds it to `UploadFiles`, so RD sees no attachment (DRI261896P0043 and ~40 P-series bugs on
  DRI261894–DRI261896). **Bugs filed through the old endpoint need their files re-uploaded with `ecl_if3.py upload`
  before they show** — a separate decision per batch, since the invisible copies stay stored either way.

`.txt` log excerpts and `.zip` logs attach the same way. First full run (18 tickets, 2026-10-07) found and fixed in
the tooling: create's JSON text body was misread as "no FormCode" (ticket created, ledger not written — **check ECL
before re-running a "failed" create**); the create read-back flags `Version=None` because `TSR.EbugSearch` has no
Version column (now skipped — confirm with `ecl_query.py bug`); `export-filing` hit 429s (client now backs off and
retries); the Activity Log names the API service account 「ECYBERLINK」 as actor while Creator is the filer.

**Correcting a filed IF3 ticket (verified 2026-10-08, DRI261894P0017).** Text: FormView → **Edit** → set
`textarea[name=DescribeIssue]` → **Save**, then read the FormView back. New evidence: upload with `ecl_if3.py upload`
and point the Description's `{filename}` refs at it. **Already-saved attachments cannot be removed**: the trash icon on
the 「Upload Files」 page only drops the file from the page's local list; Save sends no delete and both the FormView and
`/IF3/ebug/api/Attachments/Code/{BugCode}` still list it. So get the evidence right before the first upload — a wrong frame
stays on the ticket (ask the ECL admins if one must go).

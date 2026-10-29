---
name: ebug-tr-filer
description: File verified QA findings as real CyberLink eBugs — via the ECL web form on old-ASP TRs, or the IF3 REST API where the project has migrated. Builds the HTML review page for severity sign-off, dedupes against the whole pool with eBug Search, runs a pre-filing format check, fills every field, attaches screenshots, submits, and reads each bug back. Use when the user asks to post/file/create eBugs on TR, submit bugs to ECL, "automatically post the bugs", or to take an eBug draft file and actually raise the tickets. Also holds the Short Description format rule and the eBug description body rules. Never files findings that have not been verified on the build the TR is for.
---

<!-- BEGIN spec-casebook overlay -->
## In this repo (spec-casebook) — read first

This is the casebook's own copy of the shared eBug skill. **Before drafting or filing, read
`.claude/skills/ebug-tr-filer/references/casebook-overlay.md`** (Codex: `.codex/skills/…`): reviewer rules 1–7
(one action per step, Spec Link, attachments and logs, filing account memory, no `[UX]` with its revert steps, no
comments on existing tickets, dedupe per OS). Those rules and the lines below override the body of this skill.

- **Findings** come from running the approved cases in `library/<feature>/<platform>/cases.csv`: each names the
  failed case ID(s) and their Spec Ref requirement(s). Repro Steps come from the case's Precondition and Action,
  Expected Result from its Expected Result and the requirement in `requirements.md`.
- **Files** stay in the feature folder: run evidence in `library/<feature>/<platform>/runs/<YYYY-MM-DD>/`; drafts,
  review page, upload frames and `filed_bugcodes.json` / `.md` in `library/<feature>/<platform>/ebugs/<YYYY-MM-DD>/`.
- **Source tag:** never `[AIFound]` (exploration-suite findings); use the casebook tag the user set, else ask.
- **Device control:** `scripts/device.ts` (see the casebook skill), not the exploration suite's transports.
- **Python packages:** standard library only, except `make_filing_sheets.py` (Pillow; `pip install -r
  requirements.txt` in a venv, see the README).
<!-- END spec-casebook overlay -->


# eBug TR Filer

## What this does

Takes a set of **verified** findings and files them as real eBugs on `ecl.cyberlink.com`, one
per finding, linked to a Testing Request. Two paths, chosen by which ticket system the TR is on:

- **Old ASP TR** (3-digit serial) — drive the ECL web form: set the two dropdowns, fill Version /
  Build / Severity / BugBelong / Short Description / Description, attach screenshots through the
  native file dialog, submit, record the BugCode. This is still the common case.
- **IF3 TR** (4-digit serial) — `POST /api/TSR/Ebug/Create`, then upload the screenshots with
  `ecl_if3.py upload` (`POST /IF3/ebug/api/public/Attachment/code/{BugCode}` with
  `formDataPath=$.UploadFiles`) from the shell — no browser. See *The IF3 REST API* and
  *IF3 attachments over the API*.

Either way this skill owns the **Short Description format**, the **description body rules**, the
**HTML review page**, the **pre-filing format check**, and the **read-back**.

`ebug-draft-generator` writes the text. This skill posts it. They are separate on purpose:
posting sends a NewCreated email to Creator, PM(s) and PL(s) for every bug, and cannot be undone.

## Reviewer rules and the UX basis rule (2026-10-21) — apply to every batch

Rules 1–7 in `references/casebook-overlay.md`; `check_ebug_format.py` enforces them and nothing that fails them is
filed. Beyond them: `→` chains also break rule 1; a reviewer-approved missing link is passed as `--no-link-ok <key>`
and recorded in `decisions.md`. The `[UX]` basis rule (exploration tags only) is in `ebug-draft-generator`; every
`[UX]` card needs the reviewer's **UX check** before filing (*UX entries — make them impossible to miss*).

## Hard preconditions — check all five before filing anything

1. **The user has signed in to ECL themselves.** Never type credentials. Navigate to the TR URL;
   if it redirects to the sign-in page, stop and ask the user to sign in in the browser pane.
2. **The findings were verified on the build the TR is for.** Read the TR header for
   `Build: <version>.<build>`. If the findings were verified on an earlier build, say so and ask
   before filing — a finding may already be fixed. Re-verify rather than assume.
3. **Severity and BugBelong are signed off by the user, per finding — via the review page,
   not a chat table.** Build the HTML review artifact described in *The review page* below,
   publish it, hand over the link, and **stop the run there**. Do not file, do not keep testing,
   do not ask a follow-up question — wait for the user to come back with decisions. This is a
   hard stop, not a checkpoint you may talk past.
4. **The findings were re-verified on the device, by you, this run.** See *Verifying on the
   device* below. A finding copied out of a report is a claim, not evidence.
5. **Dedupe against already-filed bugs.** Preferred: query `TSR.EbugSearch` through the IF3 API —
   it searches the **whole** pool, old ASP tickets included, so it closes the gap a stale CSV leaves.
   Fall back to a fresh `EbugDownloadCSV.xls` export. See *Deduping and calibrating* below.

## Verifying on the device — do not file from a report

**Never file a finding you have not re-exercised yourself on the build the TR names.** Reports go stale between
builds (2026-09-09: a newer build had grown a rejection path no report mentioned). A finding that reproduces is a
bug; a finding copied forward is a guess. Drive the phone with `scripts/device.ts` as in the casebook skill's
on-device run. Any credit claim comes from **Mine → Credits → Details** (`device.ts ledger`), matched by feature
name *and* minute — the account is shared, so other devices burn credits too.

**Run a positive control for every "it does nothing" finding**, in the same screen state, before calling it a
defect — the same drag with the toggle On, the sibling menu item on the same clip. Without it you cannot tell a dead
control from a dead transport.

Record each verdict as CONFIRMED / did-not-reproduce / not-re-verified. **Only CONFIRMED items reach
the review page.** Say plainly which findings you never got to; "not re-verified" is not a verdict
and must never be quietly folded into "not a bug".

## The review page — required before any sign-off

### Build it from the eBug draft file, not from the report (2026-09-16)

**The cards on the review page are the eBug entries themselves.** Read
`ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md` — produced by `ebug-draft-generator` — and render one card per entry, carrying **verbatim**:

- the **Short Description** exactly as it will be pasted, in a mono strip;
- the full **Repro Steps / Result / Expect Result / Note** body, with the `摘要:` lines intact;
- the entry's proposed **Class / Severity / Owner** from its `## N.` header, and its `Basis:` line;
- its `> **QA note**` blockquote, rendered as the *My read* callout — that is what it is for;
- its images, from the entry's own `_images/NN_<ISS-ID>/` folder.

**Never build the cards from the report's step rows or from the KB table.** Those are summaries: a
reviewer who approves a paraphrase has not approved the ticket, and the wording then drifts between
what was signed off and what was submitted. If the draft file does not exist yet, generate it first
— do not reach past it to the report.

The reviewer's decisions therefore apply to real ticket text, which is what makes "Copy decisions"
directly actionable: a `Note` the reviewer rewrites is a `Note` you file.

**Generate the page's data mechanically:** `ebug-draft-generator/scripts/drafts_to_bodies.py` turns
the draft files into `upload/bodies.json` (Short Description, Description, Sev, Belong, Reproduce,
cited files, QA note, per entry). Build the cards from that JSON and run `check_ebug_format.py` on the
same JSON first — the page must never show a card that would fail the gate. The Copy-decisions table
feeds back into the same script with `--decisions`, so the approved text is the filed text.

**Two batch-level decisions sit at the top of the page, above the first card** (added 2026-09-16):

1. **Filing account** — the ECL login that becomes `Creator`, pre-filled with the proposal and shown
   in a warning colour until the reviewer confirms it. Never inferred.
2. **Filing method** — a two-way choice, with the consequence written next to each:
   - *Browser form (old way)* — the ECL web form, every field and attachment through the browser pane;
     the only option on old-ASP templates (e.g. AIFound pool 23323).
   - *API (new way)* — `ecl_if3.py create` for the ticket, then `ecl_if3.py upload <BugCode> <files…>` for
     the attachments, no browser (*IF3 attachments over the API*); IF3 templates only (e.g. PowerDirector
     iOS 16.8, 23156).
   Pre-select whichever `ecl_if3.py preflight` says the target template supports, and disable the
   other with the reason when it cannot work.

Both land in the Copy-decisions output as a header block (`Account: …` / `Method: …`), so the
reviewer's reply carries them.

**Keep the entry number stable.** The card's `F-x` is the draft's `## N.` — so a decision table, the
draft file, the upload folders (`NN_<ISS-ID>/`) and the eventual BugCode all key on one number.



**Do not ask for severity sign-off in a chat table.** A reviewer cannot judge 20+ findings from
titles alone, and the screenshots are the whole argument. Build a single self-contained HTML
artifact, publish it, hand over the link, and **stop**.

**Do not preview the page in the built-in browser pane** (user, 2026-09-16: *"just opening the html is good enough"*). Generate the HTML, publish it, hand over the link — no file:// navigation or screenshot pass first. The browser pane is for filing on ECL, not for checking the review page.

**Building the page is automatic — never offer it, never ask whether to build it** (user, 2026-09-10). The moment
verification is finished, build it in the same run: verify → build → publish → **then** stop for sign-off.

This applies however few findings there are, and whether or not any of them will be filed: a run
that produced only non-defects still gets a page, because the reviewer needs to see the evidence
behind a 非缺陷 verdict as much as behind a defect.

Load `artifact-design` first, then build a page carrying, per finding:

- the number, title, proposed **Severity** and **BugBelong**, and the source finding ID;
- the repro prose in the reviewer's language — what happened, and why it matters;
- **its own evidence, inline.** Downscale each frame with
  `sips -Z 760 -s format jpeg -s formatOptions 72 in.png --out out.jpg` and embed as a `data:` URI (37 frames ≈
  2 MB, far inside the 16 MB cap), so the page depends on no folder surviving. Thumbnails open a lightbox with a caption
  saying what the frame proves, and arrow keys step through that finding's frames.

Give every finding **three** controls, not two:

| Control | Why |
|---|---|
| Severity `1–5` | the grade |
| BugBelong | the owner |
| **file / hold** | whether it ships at all |
| **Add context** — a free-text note per finding | **the one that matters most** |

The context box is not optional polish: on 09-09 a reviewer's note re-framed "the back-swipe pans the clip" into
"the screen offers no exit, so the user reaches for a gesture that damages the composition" — a better ticket that
existed only in the reviewer's head. Ask for it per finding, and **rewrite the body from what comes back** rather
than filing your original wording.

Persist the controls in `localStorage` (wrapped in try/catch) and give the page a **Copy decisions**
button that emits a markdown table of `# / Sev / Belong / Type / UX check / Action / Short Description / Note`, so
the reviewer pastes one block back instead of transcribing rows. `UX check` is `confirmed`, `reclassify`
or `—` (see *UX entries* below); `drafts_to_bodies.py --decisions` refuses to stage a filed `[UX]` entry
without `confirmed`.

### The layout that works — build this, don't reinvent it

Signed off by the reviewer on 2026-09-15 ("this format is great... easy picking"). Reproduce this
structure; spend your design effort on the writing, not on a new arrangement.

**Page head.** Eyebrow (`programme · product · creator`), title, one-sentence instruction, then a
horizontal strip of `<dt>/<dd>` facts: **Version, Build No, Server, Account, TRCode**. Render any fact
you do not have in a warning colour with the word *needed* — an unfilled TRCode must be visible from
the top, not discovered at filing time.

**Calibration note, right under the tally.** State the Severity distribution from the most recent
eBug export and what you concluded from it. The reviewer needs to see *why* nothing is proposed at
Sev 4, and to overrule it if their pool differs.

**One card per finding**, in this order:
1. `F-x` id in the severity colour, title, and status chips (`CONFIRMED`, `Reproduced 3×`,
   `Evidence gap`, `Control passed`).
2. Why it matters, in the reviewer's language — consequence first, mechanism second.
3. The **Short Description** verbatim in a mono strip, so they see exactly what will be filed.
4. Repro steps in a collapsed `<details>` — present but not in the way.
5. **The evidence strip** (below).
6. A **My read** callout in the accent colour whenever your proposal needs defending — why this
   Severity, why this owner, what you are unsure of.
7. The decision bar.

**Severity is encoded as a 4px left border on the card**, recoloured live as the reviewer changes it,
so the page re-reads at a glance after triage. Held findings drop to ~45% opacity — visibly parked,
still readable.

**The decision bar carries four controls, in this order:** `file / hold` checkbox · Severity `1–5`
segmented · **BugBelong dropdown pre-filled** with your proposal (`RD / Setup Kit / PC-Art / PC-Doc /
PM / Marketing / RD-ECL` — never a free-text box; the reviewer should be picking, not typing) ·
Issue Type dropdown · and a wide **Add context — what am I missing?** field that grows to fill the row.
Label that last one in the accent colour: it is the control that matters most and it must not read as
an afterthought.

**Three panels after the findings**, each mandatory even when empty — say "none" rather than omitting:
*Reproduced but deliberately not filed* (with duplicate BugCodes named, or an explicit statement that
no export was available to dedupe against), *Gaps you should know about*, and the Copy-decisions block.

### UX entries — make them impossible to miss (2026-10-21)

RD asked that every AI-filed `[UX]` ticket be checked by a person first, so a `[UX]` card must stand out
from the rest of the page and cannot be filed by default. `bodies.json` carries `ux` and `basis` per
entry for this.

- **Page head:** a tally chip in the UX colour — 「UX ×N — each needs your UX check」 — that jumps to the
  first unchecked UX card, next to the severity tally. Show 「UX ×0」 rather than omitting it.
- **The card:** a full-width banner across the top of the card in a colour used for nothing else on the
  page (not a severity colour), reading **「UX — confirm before filing: no spec or in-product basis;
  goes to PM」**, with the entry's `Basis:` line verbatim under it. Give the card a thick outline in
  the same colour, kept after triage.
- **The decision:** a **UX check** control, first in the decision bar, with three choices —
  *Confirmed UX → PM* · *Reclassify → Functional / UI → RD* · *Not a bug → hold*. The card starts on
  **hold** and its `file` toggle stays disabled until a UX check is chosen; *Confirmed* sets BugBelong
  to PM, *Reclassify* switches the Type dropdown off UX (the agent then drops `[UX]` and rewrites the
  `Basis:` line before filing).
- **Under the banner, the test the reviewer applies:** 「Does a spec, or another feature of this app,
  already say what correct is? → Reclassify. Only another product's behaviour, or nothing? → Confirm.」
- **Non-UX cards with a `Basis: In-product — …` line** show it as a neutral chip beside the Short
  Description, so the reviewer sees which feature and document the expectation rests on.
- `[AIAgent]` batches have no UX cards; one that appears is a draft error — fix the draft, not the page.

### The evidence strip

Per finding, a horizontally scrolling row of ~104px thumbnails, each `n/total` labelled. Clicking one
opens a lightbox showing the full frame, **a caption saying what that frame proves** (not what it
shows), and `← Prev / F-x · n of N / Next →`; arrow keys step, Escape closes. Order the frames as the
argument runs — for a "the export is broken" finding that is: correct preview → correct timeline →
the moment it goes wrong → the proof → a healthy control for contrast.

Downscale with `sips -Z 760 -s format jpeg -s formatOptions 72 in.png --out out.jpg` and embed as
`data:` URIs. Thirty phone frames came to ~1.0 MB of JPEG, ~1.4 MB of base64 — far inside the 16 MB
cap, and the page then survives the session folder being deleted. **A finding with no captured frame
says so on its own card**, with a `Evidence gap` chip, rather than sitting silently among evidenced
ones.

Also put on the page, so the reviewer sees the whole picture: the TR and build under test, findings
reproduced but **deliberately not filed** with the duplicate BugCodes named, findings **not
re-verified** this round, and any evidence gap you know about. Flag a finding with no captured frame
in the page itself rather than letting it pass as evidenced.

## Deduping and calibrating

### Dedupe by API — do this first

`TSR.EbugSearch` returns `ShortDescription` for **every** eBug in scope, new IF3 and old ASP alike
(common fields are the one thing the API covers for old tickets). That is ~242,000 bugs, versus
whatever a hand-exported CSV happens to hold. Search per product, and match on feature name and
symptom words rather than on the whole string — the same defect is rarely worded the same twice:

```json
{ "queryModel": "TSR.EbugSearch", "pageIndex": 1, "pageSize": 200, "sortBy": "CreateTime",
  "conditions": [ { "field": "ProductName", "term": { "query": "PowerDirector" } },
                  { "field": "ShortDescription", "match": { "query": "Auto Captions" } } ] }
```

Record what you searched for and what you found **on the review page**, per finding. "No duplicate"
is a claim the reviewer should be able to check.

If you cannot search — no token, API down, user declines — say so explicitly on the review page and
in `filed_bugcodes.md`. Filing undeduped is the user's call to make knowingly, not a silent default.

### Reading the eBug export (fallback, and the only way to calibrate)

The `.xls` is an **HTML table**, not a spreadsheet. Rows are `<tr style=...>`, so a naive
`<tr>` split finds nothing:

```python
parts = re.split(r'<tr[^>]*>', raw, flags=re.I)[1:]
cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S|re.I)
```

Use it to calibrate, not just to dedupe. Real distributions beat guesses — in the September 2026
export of 175 bugs: **Severity was 2 (103) / 3 (71) / 4 (1)**, so proposing sev 4 is nearly always
wrong; **BugBelong** was PM / RD / PC-Doc / PC-Art (never a bare "Doc"); **Priority** was almost
always N/A. Re-derive these from the current export rather than trusting these numbers.

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

## The Short Description — format is not negotiable

```
<PRODUCT> <VERSION> - [<source>][<type>] <Feature>: <symptom>
```

Every one of those five parts is mandatory except `[<type>]`, which is dropped for a plain functional
defect. House examples, from the ECL guide and the team's own pool:

```
PHD 18.0.8 - [AMD] Wire Removal: Crash if first time launch PHD
PDR-I 16.8.0 - [EDF] Video Enhance: produced video is 100% black although preview and timeline are correct
PDR-I 16.8.0 - [EDF][UX] Save Result: no confirmation, and repeat taps silently save duplicate copies
```

| Part | Rule |
|---|---|
| `<PRODUCT>` | `PDR-I` for PowerDirector iOS, `PDR-A` Android, `PHD` PhotoDirector. **Never omit.** |
| `<VERSION>` | the version actually tested, e.g. `16.8.0`. Not the build number. |
| `<source>` | `[EDF]`, `[AIFound]`, `[AIAgent]` (spec-driven runs), `[MXFound]` — where the finding came from |
| `<type>` | `[UI]` visible string/layout · `[UX]` interaction/flow resting on another product or on nothing (*UX basis rule*) · `[MX]` marketing/cost. Omit for functional. Stacks with source; see *Tagging* below. `[AIAgent]` never takes `[UX]`. |
| **`<Feature>`** | **the app's own on-screen feature name, verbatim, followed by a colon.** |
| `<symptom>` | one specific line. ≤140 chars total for the whole string; budget ~120. |

### The feature name is the part that gets skipped — and it is the part that matters

**This was the actual failure of the 2026-09-15 batch.** Three of ten short descriptions shipped with
no feature name at all and had to be corrected by hand, and all ten were missing the
`PDR-I 16.8.0 - ` prefix:

| Filed as (wrong) | Should have been |
|---|---|
| `[EDF][UX] AI task failure dialog asks the user to contact support…` | `PDR-I 16.8.0 - [EDF][UX] Video Object Removal: failure dialog asks user to contact support for a refund already issued` |
| `[EDF][UX] Save Result gives no confirmation and silently saves duplicates` | `PDR-I 16.8.0 - [EDF][UX] Save Result: no confirmation, and repeat taps silently save duplicate copies` |
| `[EDF][UI] "Remove Passersby" inspiration preset text is grammatically broken` | `PDR-I 16.8.0 - [EDF][UI] Video Object Removal: "Remove Passersby" preset text is grammatically broken ("should without")` |

The failure mode is always the same: **the sentence reads fine, so nothing looks missing.** "AI task
failure dialog asks the user to contact support" is a perfectly good English sentence — it is just
unfilterable. Somebody filtering the pool by feature never sees it, and the RD owner for that feature
is never alerted.

Two rules that catch it:

1. **Name the feature the user was *in*, not the widget that misbehaved.** A dialog, a toast, a preset
   and a button are not features; the screen they belong to is. If the symptom names a UI element,
   the feature name is almost certainly still missing.
2. **If the first word after the tags is a verb or an article, it is wrong.** The first token after
   `]` must begin a noun phrase that ends in `:`.

Where a finding genuinely spans the whole app (a global dialog, a system-wide behaviour), use the
container as the feature — `AI Task Manager:`, `Produce:`, `Media Picker:` — rather than dropping it.

### Tagging — carry 類別 through

The Short Description tag is **not** free choice; it must reflect the source finding's `類別` field.
Getting this wrong is invisible on the form and only shows up when someone filters the pool by tag.

| Source `類別` | Tag | Meaning |
|---|---|---|
| `MX`（行銷體驗）| `[AIFound][MX]` | marketing / conversion / cost-disclosure experience |
| `UX`（介面互動）| `[AIFound][UX]`, `[AIFound][UI]` or `[AIFound]` | **by basis (2026-10-21):** `[UX]` only when the expectation rests on another product or on nothing (owner PM, `Basis: External / None`); against a spec or another feature of this app it is `[UI]` (visual/string) or Functional (behaviour), owner RD, with `Basis: In-product — …` when not spec-based |
| `功能性` | `[AIFound]` with no third tag | functional defect |

**The source tag and the type tag stack — they are different axes.** `[EDF]` says where the finding
came from (an Eat-Dog-Food run; the EDF workbook asks for it explicitly). `[UI]` / `[UX]` / `[MX]` say
what kind of problem it is. A UX problem found during EDF is **`[EDF][UX]`**, a visual one
**`[EDF][UI]`**, and a plain functional defect is **`[EDF]`** on its own. Never drop one to make room
for the other, and never collapse them into a single tag:

| Finding | Short Description tag |
|---|---|
| Video Enhance exports a black file (functional) | `[EDF]` |
| Failure dialog sends the user to support needlessly (interaction) | `[EDF][UX]` |
| Toast names a button that does not exist (visible string) | `[EDF][UI]` |

The same stacking applies to `[AIFound]`, `[MXFound]` and any future source tag. **`[AIAgent]` is the
exception: spec-driven findings rest on the spec, so they are `[AIAgent]` or `[AIAgent][UI]`, never
`[AIAgent][UX]`** (RD, 2026-10-21). The same rule makes `[EDF][UX]` / `[AIFound][UX]` rarer: an
interaction problem judged against a spec or another feature of this app is Functional or `[UI]`.

`ebug-draft-generator` only knows `[UI]` and `[UX]`, so **anything sourced from an
`mx-scenario-suite` report needs the 類別 checked before filing** — otherwise every MX finding
files as `[UX]` and the marketing-experience work becomes invisible in the pool.

**Fixing it afterwards** (per bug, ~4 calls):

1. `HandleMainEbugContent.asp?BugCode=<code>` → `document.forms['DoEdit'].target='_self'; submit()`
2. On `EbugEditBasp.asp`, set `[name=ShortDescription]`, then `ckAll(form)` (the page's own
   validator) and `form.submit()` — the `Modify` button often sits below the fold and a
   coordinate click is unreliable.
3. Re-read the bug page and confirm the tag actually changed.

Bulk verification without navigating: `fetch` each `HandleMainEbugContent.asp` with
`credentials:'include'`, strip tags, and regex the Short Description out. One call checks a whole batch.

## Writing the body — the TR260915-0007 shape

The body format is owned by `ebug-draft-generator` §*The body must be scannable* and is not repeated
here. In one line: **Result and Expect Result are each one English sentence (≤120 chars) plus one
正體中文 `摘要：` line; Note is `Device:` / `Spec Link:` / `Basis:` / `<Claude Reviewed>` only.** Everything that
used to follow the first sentence — reproduction counts, controls, comparisons, impact — lives in the
draft's QA note and on the review page, not in the ticket.

This replaced the 2026-09-15 guidance ("one sentence, blank line, then as long as it needs"), which
still produced tickets managers and RDs found hard to scan. The named examples are read back from
TR260915-0007 in the draft-generator skill; re-read them with
`ecl_query.py`/`TSR.EbugLogAndData` if the team names a newer batch.

Rules that still apply here, because they are about *filing* rather than wording:

- **Write it from the repro you actually performed**, not from the draft.
- **Attachment filenames carry the version prefix** (`16.8.0_<slug>.jpg`) and every inline
  `{filename}` must match a file that is actually attached.
- When the reviewer's context note re-frames a finding, rewrite the sentence — do not append the note.

## Pre-filing format check — run it, every batch

Filing is irreversible and emails three people per ticket. A malformed Short Description then has to
be corrected one bug at a time through the edit form. **Check the whole batch before the first
submit.**

```bash
python3 scripts/check_ebug_format.py upload/bodies.json \
    --product PDR-I --version 16.8.0 --upload-dir upload/
```

It reads the same `bodies.json` the filer builds — `{ "F-A": {sev, belong, out, times, short, desc,
files} }` — and exits non-zero on any error. What it catches:

| Check | Why it exists |
|---|---|
| **Short Description matches `<PRODUCT> <VERSION> - [tags] <Feature>: <symptom>`** | the 2026-09-15 batch shipped 10 of 10 without the product/version prefix |
| **A feature name is actually present** | 4 of 10 had none; the sentences read fine, which is exactly why nobody noticed |
| Feature segment is a noun phrase, not the start of a sentence | `[EDF][UX] AI task failure dialog asks the user…` parses as prose and files as unfilterable |
| Tags are known, source first, at most one type tag | stops `[UX]` being filed where `[EDF][UX]` was meant |
| **One action per Repro step, one step per line** — no `>` / `›` / `→`, no two numbered steps on a line | reviewer rule 1, 2026-10-21 |
| **A `Spec Link:` with a URL or PDF name on every bug** (`--no-link-ok <key>` for a reviewer-approved exception) | reviewer rule 2 |
| **At least one image per bug; no video** without `--videos-requested` | reviewer rule 3 |
| **UX basis:** `[UX]` needs `Basis: External — …` / `Basis: None — …`; `Basis: In-product` or no basis line means not `[UX]`; `[AIAgent][UX]` fails (`--allow-agent-ux` is the casebook's revert switch) | RD, 2026-10-21: too many AI-filed UX tickets |
| ≤140 chars hard, 120 soft | the list view truncates |
| **Result and Expect Result are each ONE English line ≤120 chars, then exactly one 正體中文 `摘要：` line** | the TR260915-0007 shape; this is the check that enforces *Writing the body* |
| All four sections present and in order | a missing `Expect Result:` is invisible in a textarea |
| `Device:` line and `<Claude Reviewed>` present; every Note line is Device / Spec Link / Basis / Related / reviewer marker | Note has a fixed content list |
| Every inline `{filename}` is attached **and exists on disk**; every attachment is referenced | a dangling `{}` reference ships a ticket dev cannot follow |
| Severity 1–5, BugBelong valid, `ReproduceOut ≤ ReproduceTimes` | catches `2/0` and a free-text BugBelong |
| No placeholders, no duplicate Short Descriptions in the batch | |

Warnings are advisory (severity 1 and 4 both get one, since both are rare in this pool); `--strict`
makes them fatal. Pass `--features features.txt` with the app's on-screen feature names to have
invented feature names flagged too.

**When a check fails, read the failure before changing anything.** If the convention has moved on,
fix the checker and re-run until clean — do not edit a correct ticket to satisfy a stale rule.

## Spec links — get them from Figma in the built-in browser (2026-09-17)

The user is signed in to Figma in the built-in browser pane (team project **PowerDirector App (PDRM)**).
When an entry needs a `Spec Link:` and `Figma/INDEX.md` has no URL for that sheet, look it up there
instead of writing `Spec Link: none`:

1. Open the project's file list and find the file (e.g. *Launcher/Template Page (UGC)*); open it and click
   the page named after the sheet in the Pages list (`find` by page name is the reliable locator).
2. **Share → Copy link** — the link the user wants on record. The pane's clipboard does not reach macOS
   (`pbpaste` still shows the old value), so hook it first:
   `navigator.clipboard.writeText = t => (window.__copied ||= []).push(t)` … click *Copy link* by element
   ref, then read `window.__copied`. Shape: `…/design/<file>/<name>?node-id=<page>&t=<token>-1`.
3. Write the URL into `Figma/INDEX.md` beside the sheet, into the draft's `Spec Link:` line, and — for tickets
   already filed — into the ECL description via the edit page (`DoEdit` → set `t756205` → *Modify*), then
   read it back.

## Order of work

1. **Identify the ticket system.** 4-digit TR serial = IF3 (API available); 3-digit = old ASP (web
   form only). See *The IF3 REST API*. The TR module lives under `/TR/`, not `/Ebug/`
   (URL table in *The IF3 REST API*).
2. Read the TR: build, OS Language string, and form `FA`'s `ProductID` / `TemplateID` / `ParentTRCode`.
3. **Re-verify every finding on the device** against that build (*Verifying on the device*).
4. **Dedupe** with `TSR.EbugSearch`, or a fresh export if the API is unavailable
   (*Deduping and calibrating*). Say on the review page what you searched and what you found.
5. **Build and publish the review page, hand over the link, and STOP.** Wait for the user.
6. On their decisions: rewrite each body **in the draft file** from their context notes, then
   `drafts_to_bodies.py <drafts> --out upload/bodies.json --stage upload/ --decisions decisions.md`
   — it drops held entries, applies Sev/Belong/Short Description overrides, stages every cited
   screenshot, and lists every context note still to be folded in.
   Then write `upload/boxes.json` and run `make_filing_sheets.py`. See *Marking the problem area*:
   every attached frame gets a red 5px box around the defect.
7. **Run the pre-filing format check and get it to zero errors.** Nothing is submitted until it is
   clean — see *Pre-filing format check*. This is the step that stops a batch shipping without
   feature names.
8. File the **first** bug end-to-end, then **read it back from the server** and check Project,
   Version, Build No, TRCode, BugBelong, Severity, status, that every attachment is listed **on the page**
   (IF3: `ecl_if3.py files <BugCode>`, i.e. `DataJSON.UploadFiles` — not the stored-files list) and every
   inline `{filename}` resolves. On the API path, `Version` specifically — it has been observed not
   to persist.
9. **If that read-back passes, keep going and file the whole batch without stopping.** Do not pause
   for approval between tickets and do not ask again — the sign-off at step 5 covers the batch, and
   the step-8 read-back is what proves the mechanics. Only stop early if a ticket fails to file or
   comes back wrong; then fix the cause and resume.
10. **Read the batch back and write it into the deliverables** — see *After filing* below:
    `ecl_if3.py export-filing` → `filed_bugcodes.json` (both paths), the `Filed by:` line in each draft
    file, and a `filed_bugcodes.md` for humans.

**Step 5 is the only hard stop.** Everything before it is yours to run unattended; steps 7 and 8 are
self-checks you verify yourself, not questions for the user. Stopping after every ticket, or
re-asking for approval the user already gave in their decisions table, is re-litigating a settled
decision and wastes their time.

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
   *Attaching screenshots* above.
2. **IF3 TR and an IF3 eBug template** → create over the API, then **upload the screenshots over the
   API too** (`ecl_if3.py upload`, see *IF3 attachments over the API*), since create
   takes no files. No browser at all — far less to go wrong than passes through the native Open dialog.
3. **Either way** → dedupe with `TSR.EbugSearch` first (*Deduping and calibrating*) and read every
   bug back from the server afterwards.

## Who is filing — verify the account before, and record it after (2026-09-16)

**Standing instruction from the user, 2026-09-16:** *"Make sure the user is set correctly; the user
name that is used should also be in the filing report just to be sure."*

`Creator` is **independent of whose token authenticates the call** (see *Create eBug — fields*), so
a wrong `Creator` is not rejected — it silently opens every ticket in the batch under the wrong
person's name, and there is no bulk fix. The same applies to the web-form path, where the form
inherits whoever is signed into that browser profile.

**Before filing — three checks, in this order:**

1. **Resolve the intended ECL login.** Ask the user which account to file under if it is not already
   pinned in the run's notes. Do not infer it from the git author, the Mac user, or the last batch.
2. **Prove it exists in TSR** — a typo'd `Creator` returns a 500 from `create`, but only after the
   first ticket has already been attempted. `ecl_if3.py preflight` resolves the account; a login that
   does not resolve stops the run.
3. **Prove the token belongs to someone who may file on this TR.** The token's owner and `Creator`
   may legitimately differ, but say so explicitly in the report rather than leaving it implicit.

For the **web-form path**, the equivalent check is to read the signed-in account off the ECL header
before the first submit, and screenshot it. A browser profile signed in as a colleague is the most
common way this goes wrong.

**After filing — the account goes in the deliverables, not just the transcript.** Record it in all
three places, so the batch can be audited without re-opening ECL:

- the **filing report / review page** header, beside Version, Build No, Server and TRCode;
- the eBug draft file's header line (`Filed by: <ECL login> on <date>`);
- the batch's `filed_bugcodes.json` / `.md` (`export-filing`, *After filing* below).

If `Creator` and the token owner differ, print **both**: `Creator: ETHAN_HSU · filed via token of
QA_CLAUDE1`. A reader who sees one name assumes it is both.

**Implemented in `ecl_if3.py create` (2026-09-16):** before sending anything it looks the `--creator`
login up in `TSR.EbugSearch` and refuses if that login has never filed (pass `--new-creator` for a
genuine first-time filer); it prints `Filing as Creator: … (token owner: …)`; and after the **first**
ticket it reads back `Creator` / `Build` / `ParentTRCode` and stops the batch on any mismatch.
On the browser-form path, screenshot the signed-in account from the ECL header before the first
submit and pass the same login to `export-filing --creator`, which fails on any ticket whose
read-back `Creator` differs.

**Read it back.** `readback` returns `Creator` per ticket — check the first ticket's `Creator`
against the intended login **before filing the remaining ones**, and stop the batch on a mismatch.
Filing one wrong ticket is a correction; filing twenty is a re-do.

## Traps

- **The saved screenshot may not be the frame you judged.** `get_window_state` with
  `screenshot_out_file` captures fresh — if video is playing, the file differs from the inline
  image you read. Pause first, or re-capture and check the file before attaching.
- Submitting emails Creator/PM/PL each time. 16 bugs = 16 emails. Confirm the user expects that.
- Closing the create form loses everything; there is no draft state.
- The bug lands as **BugNeedReview**, not NewCreated, in the AIFound pool.
- **Set the Description before you stage the composites, and you will ship a body whose
  `{filename}` points at nothing.** On the 09-15 batch bug 1 went in with `DescHasImg:false` and had
  to have its description re-set before submit. Build the attachments first, then the bodies.
- **The ECL session expires silently.** A `fetch` that returns the sign-in page HTML looks like a
  successful request. Check the response body for a login form before trusting a read-back.
- On the API path there is **no idempotency** — a retried create opens a second bug.

## Files in this skill

| Path | What it is |
|---|---|
| `references/casebook-overlay.md` | the casebook's reviewer rules 1–7, shared with `ebug-draft-generator`; read first |
| `scripts/check_ebug_format.py` | the pre-filing validator; run it on every batch |
| `scripts/ecl_if3.py` | the IF3 REST client — `preflight` / `create` (Creator-verified) / `assign` / `resolve` / `codereview` / `buildresolve` / `readback` / `export-filing`. Stdlib only; token from `~/.ecl_token` |
| `scripts/ecl_query.py` | **searching, without spending tokens** — `bugs` / `bug` / `tr` / `dedupe` / `calibrate`. Use this instead of the MCP for anything repetitive |

### Searching without burning context

The eCL MCP answers the same questions, but every row travels through the model
and costs tokens. `ecl_query.py` calls the same IF3 query endpoints directly, so a
search costs one HTTP round trip and nothing else. **Prefer it to the MCP for dedupe,
calibration and batch look-ups**; keep the MCP for one-off questions mid-conversation.

```bash
./ecl_query.py bugs --text "AI Music Generator" --product "PowerDirector Mobile for iOS" --open-only
./ecl_query.py bug  DRI261883-0063 --log      # body, RD root cause, changeset, attachments
./ecl_query.py tr   TR260915-0007             # the TR, its own bugs, and what is attached for verify
./ecl_query.py dedupe upload/bodies.json --product "PowerDirector Mobile for iOS"
./ecl_query.py calibrate --product "PowerDirector Mobile for iOS" --since 2026-08-01
```

`calibrate` **replaces the `EbugDownloadCSV.xls` export** for the Severity distribution —
it is live, so it cannot go stale. Run it before proposing severities and put the result
on the review page.

`dedupe` takes the same `bodies.json` as the format check and ranks candidates by word
overlap. It does not decide — the same defect is rarely worded the same way twice — but
on the September batch it found all 10 already-filed bugs at 100%.

Word overlap alone misses rewordings. On 2026-10-19, DRI261896P0059 ("More ideas + chip is
missing above the input…") was filed although DRI261893-0057 ("Does not display "More ideas +"
button…") was in the candidate pool: overlap was 2/9 = 22%, under the 34% cut. So `dedupe`
also **always flags (`!`)** a candidate that shares a quoted UI label with the new entry,
in either direction (only one writer may have quoted it), and one that shares a rare
adjacent word pair such as "more ideas" (carried by ≤ 2% of candidates, `--phrase-share`).
Quoted labels are searched on their own as well, so a label filed under another feature
name is still found. Read every `!` candidate.

Candidates RD/PM already declined — NAB, ProposeNAB, Won't Fix and its Propose variants,
Not Reproducible — print as **REJECTED** with a warning. Filing the same thing again
re-raises that decision. Read its status log; refile only with new grounds (a newer spec
board, a different repro) and cite the rejected bug in the Note. Otherwise drop the entry.

**Two things about the query DSL, both verified live on 2026-09-16:**

- **`match` is a substring/phrase match, not bag-of-words.** `"Video Enhance toast"` matches;
  `"grammatically inspiration"` matches nothing, because those words are not adjacent. To
  search on loose keywords, issue **one query per word and union the results** — which is
  what `dedupe` does when a Short Description has no feature name.
- **REST queries reach every model MCP exposes, and more.** `TSR.SP.GetOldEbugData`,
  `TSR.eBugByTR`, `TSR.AttachedEBug` and `TSR.EbugTags` all work over REST even though the
  guide's chapter 3 does not list them, *plus* the REST-only `TSR.ProjectTemplate` and
  `TSR.EbugLogAndData`. There is nothing the MCP can read that a script cannot.

⚠ **REST query tokens have no permission filtering** (guide 3-5) — unlike the MCP, which
filters by your ECL account. A script sees every ticket in scope, including ones you could
not open in the web UI. Treat its output as confidential and do not bulk-export it.
| `references/if3_api.md` | full IF3 API field tables, error shapes, query DSL, credential handling |

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
*IF3 attachments over the API*.

The four forward actions are there too (`assign`, `resolve`, `codereview`, `buildresolve`), but
remember that **permission follows the ticket's current handler, not the token's role** — one token
cannot walk a ticket through several stages. QA filing normally stops after `create`.

## After filing

Read every filed ticket back and write the batch record — `filed_bugcodes.json` (and `.md`) in the batch folder
`library/<feature>/<platform>/ebugs/<date>/`. Together with the run's `report.md` that is the record; there is no
`.docx` report to stamp in this repo.

```bash
export ECL_TOKEN="$(cat ~/.ecl_token)"
# API path: --ledger; browser-form path: --map KEY=BUGCODE ... (keys from bodies.json).
# dispositions.json: {"F-4": "不開單（PM 裁示）", ...} for every finding not filed.
python3 scripts/ecl_if3.py export-filing \
    --ledger <batch>/upload/filed_formcodes.json \
    --bodies <batch>/upload/bodies.json \
    --dispositions <batch>/upload/dispositions.json \
    --creator ETHAN_HSU --method api+browser-upload \
    --tr TR260915-0007 --version 16.8.0 --build 189063 --server Developer \
    --out <batch>/filed_bugcodes.json
```

`export-filing` records **Creator as read back per ticket** (plus the token owner when it differs), taken from the
server rather than from what was intended. `dispositions.json` names every finding that was not filed:
`已知單，不重複開：<BugCode>` / `不開單（<reason>）` / `未結案`. Read-back text keeps literal `<` (`strip_tags`
removes only real HTML tags, so `<Claude Reviewed>` and 「<」 button names survive). BugCodes link as
`https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=<BugCode>`; never build a link from another
path. In the final summary give the counts as a markdown table, even for one report:

| Feature | Platform | AI Found # | Created # | Known # |
|---|---|---|---|---|
| AI Mini Drama | iOS | 7 | 7 | 0 |

(AI Found = distinct findings, Created = tickets filed and read back, Known = reproduces but a ticket exists.) Do not
type into the shared dashboard sheet unless the user asks.

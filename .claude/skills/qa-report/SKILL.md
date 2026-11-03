---
name: qa-report
description: Write and file the QA Report (QR) for a CyberLink Testing Request after verifying its eBugs — OK / Fail per bug (anything not fully verified is left off), readable Test Result Details, one evidence ZIP, a review page the tester approves, then the IF3 「Create QA Report」 form (Standard Report) filled, saved once and read back. Use when the user asks to create, write, draft or file a QR / QA Report for a TR, or to report verification results on a TR. Verifying the bugs on the phone is the run's job; this skill starts from verdicts that already have evidence.
---

# QA Report for a Testing Request

A QR is the tester's answer on a TR: one Standard Report per tester per round, one State (OK / Fail) and
Reason per eBug, plus a free-text summary and attachments. Saving it changes the TR's verify list (Pass / Fail / Not
yet verified) and can move each eBug's workflow, so it is filed only after the tester approves the exact text.

**Overlay rule 6 (no comments on existing tickets) still holds:** a QR is the one sanctioned way to report results on
existing eBugs, and only when the user asks for it in chat. Never add eBug comments, reopen tickets or edit a QR to
"fix" something after saving (every save can append to every linked bug); a correction is a new request.

## Inputs

- The TR (`ecl_query.py tr <TR>`): product, build, the verify list and its creators. "My bugs" = rows whose
  Creator is the tester, unless the user names another relation.
- A verification run with a verdict, screenshots and logs per bug (`library/<product>/<feature>/<platform>/runs/<date>-<tr>-verify/`,
  `result*.md`). Every verdict must have been seen on the TR's build; a bug never checked is not on the report.
- The QRs other testers already filed on the TR (links in the TR's 「QA Report」 list): read one or two for the
  team's current wording before drafting.

## Verdicts (user, 2026-11-03, REQ-073)

| Result | When | Reason on the form |
| --- | --- | --- |
| OK | Every path the original eBug names is fixed on this build, **or the scenario can no longer be completed or triggered by any means** (flow or control removed, input capped so the state can't be reached) | `Verified OK with build (v<version.build>) on <device> / <OS>`, plus one `Note:` line when it needs one: why the scenario can't happen any more, or a fix that is the spec's fallback |
| Fail | Any original symptom still happens | first line `Verify Fail with build (…) on …`, then `Result:` and `Expected Result:` (one or two plain sentences each), then the evidence folder |
| Hold | Anything not fully verified: a path not checked, a fixture missing, a run stopped | **not on the QR at all** (not in the bug rows, not in Details); the bug is left alone and stays "Not yet verified" on the TR |

Never file NotVerified on a QR. Before calling something unreachable, try every way into it (other entry points,
real input by hand, other tiers); "the automation can't do it" is not unreachable. Before holding a bug for cost,
check what the run's credit rule allows (AGENTS.md › AI Mini Drama credits): check every path the bug names.

A new problem seen while verifying never fails the original bug; it goes under *Other observations* (and is filed
through `ebug-tr-filer` only if the user asks).

## Steps

1. **Draft.** Write `qr-draft.json` in the run folder (shape: `scripts/qa-report.ts` › `Draft`; a filled example is
   `library/pdr/ai-mini-drama/android/runs/2026-11-03-tr261102-0018-verify/qr-draft.json`). One row per bug in
   scope, including Hold rows. `summary` is the one-line Details entry; Fail rows take `observed` and `expected`
   from the eBug's own Result / Expect Result, rewritten for what this build does. Use the decisive screenshots
   only (2–4 per bug), with the log excerpt for timing or charge claims. Never put account e-mails, tokens or local
   paths in any text.
2. **Check and pack.** `node scripts/qa-report.ts check <draft>` (must pass), then `pack` (one ZIP, folders
   `OK/` and `Fail/` with an `index.html` and a SHA-256 manifest), then `render` (`qr-review.html`) and
   `text` (every field exactly as it will be typed).
3. **Review.** Open `qr-review.html` in the browser pane and look at every image yourself before showing it. The
   user changes verdicts or Reasons there and pastes **Copy decisions** back, or approves in chat. Apply the
   changes to the draft, re-run step 2 and get the changed rows approved again. Nothing goes to ECL before a clear
   "file it" on this exact revision.
4. **File (IF3).** Open the Create form (*Form notes* has the URL and field names). Fill from `text`: Short
   Description, Test Result, Testing Date, Test Result Details, Product Version, Build Day, Build No., Operation
   System and OS Language. In the bug list set State and Reason only for the approved rows; leave every other row on
   「Not Yet Verified」. Upload the evidence ZIP in the form's upload section first and put its link in the draft
   (*Form notes* › Attachments), regenerate `text`, then fill. Read the whole form back against `text`, then press the submit button (**Create**) once; never twice —
   if unsure whether it saved, reload the TR and look for a new QR in its list.
5. **Read back.** Open the new `https://ecl.cyberlink.com/IF3/qr/BPM/FormView/<QR>` and compare every field, State
   and Reason with `text`, and the attachment name and size with the ZIP. Reload the TR: its Pass / Fail / Not yet
   verified counts must move by the filed rows. Save `qr-receipt.json` in the run folder (QR code, URL, time,
   counts, ZIP sha256, any mismatch) and add the QR to the run's `result.md` and the request's REQ line.

The first time the form is filled on a new template, record the field names you actually found in this file
(*Form notes*) so the next filing does not have to rediscover them.

## Wording

- Short Description: `<version.build> - Bug verify report (<TESTER>)`. Test Result: `PDR-A - Bug verification [OK=n, Fail=n]` (`PDR-i` for iOS).
- Details are a lettered list like the team's QRs: device, build and how it was installed, server, account (tier,
  never the e-mail), who tested (name the AI model when an agent drove the phone), scope, then OK and FAIL lists
  with one line per bug, other observations, and where the evidence is. Held bugs are not mentioned.
- Reasons in English, short, no test IDs, tool names, timestamps or retry history; the detail lives in the run
  folder. Never write a `.zip` file name in a Reason (ECL links it as a web address); point to the ZIP folder instead.

## Form notes (first filing, QR261103-0039, 2026-11-03)

- **Create.** The TR page's 「Create QA Report」 › Standard Report › **Create** opens a new tab, which the browser pane
  blocks; open its URL instead: `https://ecl.cyberlink.com/IF3/qr/BPM/Start/Request/NewCreated?QRTemplateID=14564&TRCode=<TR>`
  (14564 = Standard Report on the PDR-A TRs; read it again from `window.open` if a TR's template differs).
- **Fields.** `#QR_Edit_ShortDescription`, `#QR_Edit_TestResult`, `#QR_Edit_TestResultDetail` (textarea),
  `#ProductVersion`, `#BuildDay`, `#BuildNo`, the Testing Date (date input, prefilled today), Operation System and OS
  Language as checkboxes (labels like 「Android 15」, 「English」, 「9 Languages」). Set values with the native value
  setter plus `input` / `change` / `blur` events (Vue form).
- **Bug rows.** Every TR bug has a row, all on 「Not Yet Verified」. Its cells carry `data-if3-path`
  `FormData.EBugList.<i>.OK|Fail|NotYetVerified|Reason`; find the row by its BugCode text, click the radio, fill the
  Reason textarea. Read the whole form back (fields, every row's State and Reason, other testers' rows untouched)
  before the submit button, which is labelled **Create** (one press; the page then shows the new QR).
- **Effect.** Saving closes OK tickets (status Close) and sets Fail tickets to Fail at once; check with
  `ecl_query.py tr <TR>`.
- **Attachments (user, 2026-11-03, REQ-074).** The ZIP goes in the Create form's upload section (its
  `input[type=file]`), which uploads at once and lists the file with its link
  `https://ecl.cyberlink.com/IF3/Data/Download?o=iForm/…zip`. That link goes in `evidence.url` of the draft; `text`
  then puts it in Details and in every Fail reason (`Evidence: <link>` / `Folder: Fail/<BugCode>/`). The agent fills
  the input itself: serve the ZIP on `127.0.0.1` with CORS for `https://ecl.cyberlink.com` and
  `Access-Control-Allow-Private-Network: true`, `fetch(url, {targetAddressSpace: 'local'})` it in the form page, put
  the `File` in the input through a `DataTransfer` and dispatch `change`. Download the listed link in the page and
  compare its SHA-256 with `evidence.sha256` before filling anything else. Stop the local server afterwards. The
  public Attachment API refuses QRs ("No permission"), and adding a file to a saved QR means Edit › Save, so upload
  before pressing Create.
- The saved QR lists: QR Code, Product, TRCode, TesterName, Short Description, Test Result, Testing Date, Test Result
  Details, Product Version, Build Day, Build No., Operation System, OS Language, Attachment, and only the rows set
  (State / BugCode / Short Description / Creator / Severity / Reason).

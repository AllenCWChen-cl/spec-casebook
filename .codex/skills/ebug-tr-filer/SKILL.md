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

- **Findings** come from running the approved cases in `library/<product>/<feature>/<platform>/cases.csv`: each names the
  failed case ID(s) and their Spec Ref requirement(s). Repro Steps come from the case's Precondition and Action,
  Expected Result from its Expected Result and the requirement in `requirements.md`.
- **Files** stay in the feature folder: run evidence in `library/<product>/<feature>/<platform>/runs/<YYYY-MM-DD>/`; drafts,
  review page, upload frames and `filed_bugcodes.json` / `.md` in `library/<product>/<feature>/<platform>/ebugs/<YYYY-MM-DD>/`.
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
  `formDataPath=$.UploadFiles`) from the shell — no browser. See `references/api-filing.md` and
  *IF3 attachments over the API* (`references/web-form.md`).

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
   not a chat table.** Build the HTML review artifact described in `references/review-page.md`,
   publish it, hand over the link, and **stop the run there**. Do not file, do not keep testing,
   do not ask a follow-up question — wait for the user to come back with decisions. This is a
   hard stop, not a checkpoint you may talk past.
4. **The findings were re-verified on the device, by you, this run.** See *Verifying on the
   device* below. A finding copied out of a report is a claim, not evidence.
5. **Dedupe against already-filed bugs.** Preferred: query `TSR.EbugSearch` through the IF3 API —
   it searches the **whole** pool, old ASP tickets included, so it closes the gap a stale CSV leaves.
   Fall back to a fresh `EbugDownloadCSV.xls` export. See `references/dedupe.md`.

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


## References — read the one the task needs

| File | Read it for |
|---|---|
| `references/casebook-overlay.md` | Always first in this repo: reviewer rules 1–7 |
| `references/review-page.md` | Building the review page: the draft file as source, layout, UX entries, the evidence strip |
| `references/dedupe.md` | Dedupe by API, reading the eBug export, searching without burning context |
| `references/web-form.md` | The browser-form path: *The form*, field map, marking the problem area, attaching screenshots, *IF3 attachments over the API* |
| `references/api-filing.md` | The IF3 REST API path: old vs new ticket, what it can do, auth, creating a bug, the filing commands |
| `references/if3_api.md` | IF3 endpoint reference |
| `references/accounts-and-after.md` | Who is filing (Creator vs token), and after filing (`export-filing`, BugCode links) |

Paths are relative to this skill's folder (`.claude/skills/ebug-tr-filer/`, Codex: `.codex/skills/ebug-tr-filer/`).

## The form

Moved to `references/web-form.md` (*The form*, *IF3 attachments over the API*); `ecl_if3.py` points here.

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
   form only). See `references/api-filing.md`. The TR module lives under `/TR/`, not `/Ebug/`
   (URL table in `references/api-filing.md`).
2. Read the TR: build, OS Language string, and form `FA`'s `ProductID` / `TemplateID` / `ParentTRCode`.
3. **Re-verify every finding on the device** against that build (*Verifying on the device*).
4. **Dedupe** with `TSR.EbugSearch`, or a fresh export if the API is unavailable
   (`references/dedupe.md`). Say on the review page what you searched and what you found.
5. **Build and publish the review page, hand over the link, and STOP.** Wait for the user.
6. On their decisions: rewrite each body **in the draft file** from their context notes, then
   `drafts_to_bodies.py <drafts> --out upload/bodies.json --stage upload/ --decisions decisions.md`
   — it drops held entries, applies Sev/Belong/Short Description overrides, stages every cited
   screenshot, and lists every context note still to be folded in.
   Then write `upload/boxes.json` and run `make_filing_sheets.py`. See *Marking the problem area* (`references/web-form.md`):
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
10. **Read the batch back and write it into the deliverables** — see *After filing* (`references/accounts-and-after.md`):
    `ecl_if3.py export-filing` → `filed_bugcodes.json` (both paths), the `Filed by:` line in each draft
    file, and a `filed_bugcodes.md` for humans.

**Step 5 is the only hard stop.** Everything before it is yours to run unattended; steps 7 and 8 are
self-checks you verify yourself, not questions for the user. Stopping after every ticket, or
re-asking for approval the user already gave in their decisions table, is re-litigating a settled
decision and wastes their time.


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

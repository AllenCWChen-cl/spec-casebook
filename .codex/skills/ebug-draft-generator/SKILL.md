---
name: ebug-draft-generator
description: Turn QA verification / sign-off results for a PowerDirector feature into ready-to-paste CyberLink eBug draft entries — a Short Description plus the Information→Description body (Repro Steps / Result / Expect Result / Note) for every finding that needs to be raised. Use when the user asks to draft eBugs, create bug tickets, prepare eBug entries, or "automate the eBug" from a QA report, sign-off, or verified findings list. If no feature/report is named, ask which one first.
---

<!-- BEGIN pdr-spec-casebook overlay -->
## In this repo (pdr-spec-casebook) — read first

This is a copy of the shared eBug skill, kept here so the casebook works on its own. The rules in this section
override the parts below that assume the exploration suite (`pdri-exploration-suite`, its `sessions/` folders,
knowledge-base files, QA sign-off files and `.docx` reports). Those do not exist in this repo; skip any step that
reads or updates them.

- **Where findings come from:** running the approved cases in `library/<feature>/<platform>/cases.csv`. Each finding
  names the failed case ID(s) and their Spec Ref requirement(s). Build Repro Steps from the case's Precondition and
  Action, and Expected Result from the case's Expected Result and the requirement in `requirements.md`.
- **Where files go:** everything stays in the feature folder.
  - Run evidence (screenshots, recordings, logs): `library/<feature>/<platform>/runs/<YYYY-MM-DD>/`
  - eBug drafts, the review page, upload frames, `filed_bugcodes.json` / `.md`:
    `library/<feature>/<platform>/ebugs/<YYYY-MM-DD>/`
- **Source tag:** do not use `[AIFound]` (it marks exploration-suite findings). Use the tag the user set for
  casebook findings; if none is recorded here yet, ask before drafting.
- **Device control:** `scripts/device.ts` (Appium on the QA iPhone, see the casebook skill); the iPhone Mirroring /
  `computer-use` transport named below is the exploration suite's and is not used here.
- **Skip these sections here:** *Inputs* (the sign-off and KB files are the exploration suite's; the inputs are the run
  folder's `results.csv`, `observations.md` and screenshots), *When this runs* and *Related*.
- Everything else (format rules, dedupe through the ECL API, severity review page, token handling, never filing
  unverified findings) applies unchanged.
- **Spec Link checks:** `verify_ebug_drafts.py`'s sheet-index checks look for the exploration suite's `Figma/_index/` transcripts, which the casebook does not have; its 'unknown sheet' / 'never names that sheet' failures do not apply. Casebook `Spec Link:` lines name the source (Design or PM spec), the board title from `extracted/boards.json` and the Figma file URL from `spec-set.json`. Design outranks PM when they disagree.
- **Reviewer rules (user, 2026-10-21, from the eBug reviewers) — every entry, every batch:**
  1. **One action per Repro step.** Each numbered step is one tap, one typed entry, one swipe or one wait. No `>` /
     `›` chains: 「Mine > Credits > Details」 is three steps (Tap Mine · Tap Credits · Tap Details), and "Tap Filter,
     select Male and Indigenous, apply" is four. `check_ebug_format.py` fails a step that contains `>` or `›`.
  2. **A Spec Link on every entry**, to the spec used as the reference: the Figma URL with `node-id` — the frame or
     flow-arrow node that `requirements.md` gives for the requirement when it has one, otherwise the file URL from
     `library/<feature>/specs/<date>/spec-set.json` (`figma`) with the board title from `extracted/boards.json` /
     `board-notes.md`. Only when no URL exists: the PDF name + board ID. Entries resting on a QA rule (rule 7 text,
     rule 8 checks) cite the board that shows the screen or string they are about. The format check fails an entry
     with no `Spec Link:` line, `Spec Link: none`, or a link with neither a URL nor a PDF name.
  3. **Attachments on every entry:** at least one image (red-boxed frame) per bug, cited inline as `{<ver>_<slug>.jpg}`;
     plus the relevant log excerpt (`<ver>_<slug>_log.txt`) when the finding has a log cause. **Every failure-related
     entry carries its log (user, 2026-10-27):** a failed generation, turn, upload or retry, an error card or dialog,
     a charge or a missing refund, a step that ends with nothing — attach the excerpt of that failure's time window
     (the failing tool line, `status=…` / `error=…`, the `authorized, credit=N` and refund lines) even when the screen
     already shows the error, cite it inline under Result, and show it on the review page card (a 「Log」 section
     with the excerpt text), so the reviewer sees it before deciding (F-6 of the 10/27 P9 batch had its log attached
     but the page hid it). Scan each excerpt for
     tokens, `Bearer`/`authorization` lines and signed URL queries before staging it. Layout and content findings need
     no log. **No video unless the user explicitly asks for one** for that batch or entry (then pass
     `--videos-requested` to the format check); keep recordings in the run folder. The format check fails an entry
     with no image reference and any video attachment without that flag.
  4. **Filing account memory.** Review pages prefill Creator, TRCode, source tag and method from the newest
     `filed_bugcodes.json` under the feature's `ebugs/` folders (`meta.creator`, `meta.tr`, the tag of the filed Short
     Descriptions, `meta.method`) — `node scripts/ebug-defaults.ts <feature> <platform>` prints them (`--json` for
     generators) — shown as 「from <batch> — confirm」, never blank. In a user's decisions, "Same build" / "Same TR"
     means that previous batch's TR when the build matches: read the TR header (`ecl_query.py tr <TR>`) and confirm it
     still names the build the findings were verified on before filing; if not, stop and ask.
  5. **No `[UX]` on casebook findings (RD, 2026-10-21 — in force until the user reverts it).** The casebook tests
     against the spec, so every finding is `[AIAgent]` (Functional) or `[AIAgent][UI]`, owner RD (Doc for copy) —
     interaction and flow problems included; RD forwards one to PM when it wants a ruling. A finding with no spec basis
     is not a casebook bug: hold it and list it on the review page as a PM question. `check_ebug_format.py` fails
     `[AIAgent][UX]`. This supersedes the 2026-10-20 rule "a UX problem goes to PM (BugBelong PM)".
     **To revert** (back to `[AIAgent][UX]` with BugBelong PM): delete this rule 5 from both casebook eBug overlays
     (`ebug-draft-generator`, `ebug-tr-filer`, `.claude` and `.codex`), restore the 2026-10-20 wording of *eBug owner
     and type* in `AGENTS.md` (kept there under "Revert"), drop the UX line in the casebook skill's *eBug drafts and
     review page* step 1, and run `check_ebug_format.py --allow-agent-ux` and `ALLOW_AGENT_UX=1 verify_ebug_drafts.py`.
- **No comments on existing tickets (user, 2026-10-21, until the user lifts it).** Never post a comment on, reopen or
  reject the fix of an existing eBug — not for rechecks, not for "still reproduces", not for fixed tickets. Only new
  tickets the user decided to file are created.
- **Dedupe per OS (user, 2026-10-28).** iOS and Android bugs are deduped separately: search only the tested OS's
  product (`PowerDirector Mobile for iOS` / `… for Android`). A ticket on the other OS never makes a finding a
  duplicate: the finding is a new entry for this OS (the other OS's BugCode may go in its Note). A finding that matches
  an existing ticket on the same OS's TRs is **not listed** — no card on the review page, no Rechecks section, no
  on-hold entry; it is kept only in the batch's `dedupe.txt` (finding, case IDs, matching BugCode) for traceability.
  Exception: a same-OS ticket that is **closed** while the bug is back does not hide the finding; it stays a new card
  that names the closed ticket as related.
<!-- END pdr-spec-casebook overlay -->


# eBug Draft Generator

## What this does

Reads a QA sign-off (per-finding verdicts) plus the matching feature knowledge-base file, keeps only the findings that actually need to be raised, and writes a markdown doc with one paste-ready eBug entry per bug. Each entry contains the two fields that are tedious to hand-write: the **Short Description** and the **Information → Description** body. The remaining eBug form fields (Creator, Version, Build No, Bug Source, Reproduce probability, Priority, Severity, Problem Type, OS Language) are filled by the user in the tool.

This is the write-up step that follows a `pdri-exploration-suite` deep dive + QA review. It does not test the app.

## Inputs (ask if not provided)

If the user has not named the feature or report, ask in one line: **which feature / which report?** Then locate:

1. **The QA sign-off** — the authoritative per-finding verdicts, usually `sessions/<...>/QA_signoff_<feature>.md`. Columns: step, finding, class, QA verdict.
2. **The feature KB file** — `skills/pdri-exploration-suite/knowledge_base/features/<feature>.md`. This holds the detailed issue text (ISS-xx IDs, summaries, and the `stepNN` screenshot references) that make good Repro Steps / Result / Expected Result.
3. **The screenshots folder** for that session — `sessions/<...>/screenshots/` — so Result lines can cite real filenames.

## Which findings to include

Include **only** findings whose QA verdict is **Actual Bug** — and, within those, **skip any the reviewer marked as already raised / already reported / re-confirmation of a known issue** (those already exist in eBug).

Exclude everything else: ✔ passed, **NAB** (intended / stale-spec), **False alarm**, **Cannot reproduce**, **Check in prog**, and pure observations. List the excluded ones in a short "Not raised (for the record)" table at the bottom so the user can see nothing was silently dropped.

**Two exclusions get stronger treatment than a table row:**

- **A previously drafted entry that QA has since overturned** keeps its full entry, moved to the
  **⛔ Withdrawn by QA** section at the end (see *Entry ordering*). A table row is not enough: the
  draft text is already circulating, so the killed version must stay visible and unmistakably marked.
- **A verdict of `TBD` / blank / anything that is not yet a decision** is **held, not excluded.** Do
  not draft it and do not quietly drop it — give it its own ⏳ row in the "Not raised" table saying it
  needs a verdict, subtract it explicitly in the reconciliation delta, and say in the header that the
  batch is not closed until those rows are answered.

## Reconcile against the report — this is not optional

**Close the loop explicitly, or findings go missing.** The 16.7.0 Template Page batch shipped with two
findings (ISS-TP-07, ISS-TP-08) present in the report and in neither the entries nor the "Not raised"
table — under a heading that read "Nothing was silently dropped." Nobody noticed for two days, because
the batch's 14 entries were being compared against a report footer that counted something else.

So the doc **must end with a `## Reconciliation against the report` section** containing:

1. **A delta table** explaining the arithmetic from the report's issue count to this doc's entry count,
   one row per split, merge, fold-in and exclusion, with a running total that lands exactly on the
   entry count. If it doesn't land, something is unaccounted for — find it before shipping.
2. **A row-by-row map** of every report ▲ row to the entry it became, or to the words *not raised* /
   *folded into N*. Every row appears. No exceptions, no "and the rest".

Two counts that legitimately differ, and should be stated rather than reconciled away:

- **Rows vs defects.** Reports built before 2026-08-06 count ▲ **step rows**; this doc counts
  **defects**. One row can hold several defects and several rows can hold one, so the numbers differ
  by design. Reports from the updated `pdri-exploration-suite` count defects and should match.
- **Class split.** The report's 功能性 / UI/UX split does not carry over, because this doc splits
  "UI/UX" into **UI** or **UX** per ticket. Say so; don't reconcile it.

## Reviewer rules and the UX basis rule (2026-10-21) — every entry, every batch

Standing rules from the eBug reviewers and RD. They override any older wording further down, and
`check_ebug_format.py` fails an entry that breaks one.

1. **One action per Repro step, each on its own line.** A step is one tap, one typed entry, one
   swipe or one wait. No `>` / `›` / `→` chains and no two numbered steps on one line:
   「Mine > Credits > Details」 is three steps (`3. Tap Mine` / `4. Tap Credits` / `5. Tap Details`), and
   "Tap Filter, select Male, then apply" is three. A typed prompt stays inside its own step, verbatim.
2. **Every entry carries its link.** At least one `Spec Link:` with a URL — the Figma URL with
   `node-id` for the frame that defines the behaviour, or, when nothing defines it, the frame of the
   screen the entry is about. Only when no URL exists: the PDF name + board ID. `Spec Link: none` is
   no longer accepted; if no document exists at all, put 「Link needed」 in the QA note so the review
   page asks the reviewer for one.
3. **Attachments: at least one image on every entry** (red-boxed frame, cited inline). Add the log
   excerpt (`{<ver>_<slug>_log.txt}`, scrubbed of tokens, `Bearer` / `authorization` lines and signed
   URL queries) whenever a log shows the cause — a crash, an error code, a server status, a timing —
   and on **every failure-related entry** (a failed generation, turn, upload or retry, an error card, a
   charge or a missing refund; user 2026-10-27), even when the screen already shows the error. The
   review page shows each log excerpt on its card. Layout and copy findings need no log. **No video unless the user explicitly asks for one** for that
   batch or entry; keep recordings locally and mention them in the QA note.
4. **UX basis rule (RD, 2026-10-21).** RD reported too many AI-filed `[UX]` tickets. A finding is
   still recorded whatever its kind, but the type tag and owner now follow **what the expected result
   rests on**:

   | Basis of the expectation | Tag | Class · Owner | Note line |
   |---|---|---|---|
   | A spec (PM / Design / MX sheet) | no `[UX]`: `[UI]` for visible string/layout, none for behaviour | UI or Functional · RD (Doc for copy) | `Spec Link:` |
   | Another feature or screen of **this** app (consistency) | no `[UX]`: `[UI]` or none | UI or Functional · RD | `Basis: In-product — <feature/screen>: <its behaviour> (<document: spec link, BugCode or KB entry>)` |
   | Another product's behaviour, or nothing at all | `[UX]` | UX · **PM** decides | `Basis: External — <product>: <behaviour> - <url>` or `Basis: None — PM decision requested` |

   - **`[AIAgent]` (spec-driven runs: casebook, Spec Agent `qa-workflow`) never carries `[UX]`** — those
     agents test against a spec, so their findings rest on the spec. A spec-driven finding with no spec
     basis is not an `[AIAgent]` bug: hold it and raise it as a PM question or an exploration finding.
   - **`[AIFound]` / `[EDF]` / `[MXFound]` findings referenced to another feature of the same app are not
     `[UX]`**: the other feature is the basis, so PM need not write a new spec. Say in the Note which
     feature and which document it rests on (`Basis: In-product — …`). RD can still forward it to PM.
   - **`[UX]` is kept for findings that rest on another product's behaviour or on no basis at all** —
     those need a PM decision, so the owner is PM. Exploration runs keep finding and recording these;
     they are filed only after the reviewer confirms them on the review page (`ebug-tr-filer`, *UX
     entries*).
   - Put the basis call in the entry header's Class and repeat the reasoning in the QA note, so the
     reviewer can flip it.

## Output format

**One markdown file per feature** — never one combined doc covering several features, even when
several are signed off in the same pass. Two features reviewed together produce two files that
cross-reference each other with a one-line **Companion batch:** pointer, each with its own header,
entries, "Not raised" table, reconciliation and filing order.

Name it `ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md`, **plus a sibling images folder**
`ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>_images/` (see next section).

> **Folder split (since 2026-08-11).** eBug drafts and their image folders live in the workspace's
> top-level `ebugs/` folder — **not** in `reports/`. `reports/` holds only the `.docx` exploration
> reports. Both the markdown and its `_images/` folder go in `ebugs/`, so the relative image paths
> inside the doc stay unchanged.

> **Date prefix (since 2026-08-26).** Both the markdown and its images folder start with
> **`<YYYYMMDD>_`**, so the `ebugs/` listing sorts chronologically and each batch sits next to the
> report it came from. **Use the date of the test session — the same date the source report's
> filename carries — not the date you write the drafts.** A dive run on 2026-08-24 and written up on
> 2026-08-26 is `20260824_…`. That keeps `20260824_Replace Background_探索性測試報告_原創版.docx`
> and `20260824_eBug_drafts_Replace-Background_16.7.0.md` adjacent. The two prefixes must match each
> other exactly — markdown and images folder — or the **Images:** paths break.
 A short header explaining source + conventions + where the images are, then one section per bug. **Both the Short Description and the Description go in their own fenced code blocks** so each is a one-click copy box in the rendered doc:

```
## N. <ISS-ID> — <short title>  ·  Class: <UI|UX|Functional>  ·  Severity: <S1|S2|S3|S4>  ·  Owner: <RD|PM|Doc>

**Report step:** <n, n>  ·  **Reproduce:** <a>/<b>  ·  **Verified on:** <version>.<build>

> **QA note — not pasted into eBug.** <caveats, reasoning, comparisons, history — no length limit; omit if none>

**Short Description:**

​```
PDR-I <version> - [AIFound][UX|UI] <Feature>: <symptom>   (Functional bugs: [AIFound] only)
​```

**Description:**

​```
Repro Steps:
1. Launch the APP
2. <one action — one tap / typed entry / swipe / wait per line>
3. <next action>
4. Check the result

Result:
<ONE English sentence — the defect. ≤120 chars.>
摘要：<一句正體中文（台灣用語）>
{<version>_<slug>.jpg} {<version>_<slug2>.jpg}

Expect Result:
<ONE English sentence — the correct behaviour. ≤120 chars.>
摘要：<一句正體中文（台灣用語）>
Spec string: 「...」          (only when a spec defines the string)

[AI Recommendation]          (text/string findings only — the strings, nothing else)
<Title / Body / Buttons, or one line per state>

Note:
Device: <device the finding was last reproduced on>
Spec Link: <milestone> <sheet> - <url>          (every entry — the sheet it rests on, else the screen's sheet)
Basis: In-product — <feature>: <behaviour> (<document>)   (only when not spec-based; External / None → [UX], owner PM)
<Claude Reviewed>
​```

**Images:** `<YYYYMMDD>_eBug_drafts_<Feature>_<version>_images/<NN>_<ISS-ID>/`
```

`**Reproduce:** a/b` is required — it feeds the eBug form's Reproduce probability and must be what
you actually observed. Image files inside the entry folder are named with the **version prefix they
will be attached under** (`16.8.0_lau01_collapsed.jpg`), so the `{…}` references in the body are
already the final attachment names and nothing is renamed at filing time.

## Entry ordering — withdrawn go last

**Entries to file come first, then everything QA overturned.** Order the filed entries by report test
step, number them `1..N` contiguously, then open a section for the withdrawn:

```
# ⛔ Withdrawn by QA — do not file

<one paragraph: why they are kept, and that nothing here may be pasted>

---

## N+1. ⛔ WITHDRAWN — <ISS-ID> — <title>  ·  Class: … · Severity: … · Owner: …
```

Withdrawn entries keep report-step order among themselves and keep their full body — the point is
that a reader who finds the finding in the raw Phase 1 notes can see it was considered and killed,
with QA's verdict quoted. **Never delete a withdrawn entry**, and never leave one interleaved among
the filed ones: someone pasting down the list must be able to stop at the section break.

This breaks the older "entry *n* lines up with the report row *n*" convenience, so **say so in the
header** — filed first in step order, withdrawn after, trust the ISS-ID over the number — and keep
the *Report step:* line under every heading.

**When you reorder, three things must move together:** the entry numbers, the `<NN>_` image folder
names, and every `Entry N` cross-reference in the "Not raised" table, the reconciliation row-by-row
map, the owner split and the filing order. The owner-split and filing-order tables hold **bare
numbers**, not the string `Entry N`, so a naive find-and-replace misses them — remap old→new with an
explicit table and verify afterwards that each ISS-ID's number is identical everywhere it appears.

## Copy the screenshots next to the doc

So the user can attach images without hunting through the session folder, **copy each bug's referenced screenshot(s) into a per-bug folder** beside the markdown:

```
ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>_images/
  01_<ISS-ID>/<screenshot>.jpg ...
  02_<ISS-ID>/<screenshot>.jpg ...
```

- One subfolder per bug, named `<NN>_<ISS-ID>` matching the entry number. **Withdrawn entries keep
  their folder too** — they are still numbered, just numbered last (see *Entry ordering*).
- `<NN>` must track the entry's **final** number. If you reorder entries — which the withdrawn-last
  rule makes routine — renumber the folders in the same pass, or every **Images:** line points at the
  wrong bug. Rename in two phases (`01_X` → `TMP_11_X` → `11_X`) so shifting numbers cannot collide.
- Copy only the files that entry cites in its `{braces}` (a screenshot used by two bugs is copied into both folders).
- **Prefer the newest capture, and match the device the finding was verified on.** When an entry has
  been re-verified on a later build, the newer captures are the current evidence: put them in the bug
  folder, cite them **first** in `Result`, and drop the older capture wherever the new one shows the
  same thing. This matters most when the re-verification ran on **different hardware** — a finding
  confirmed on the mirrored iPhone should be illustrated by phone captures, not by the original
  desktop-window ones, because the screenshots are what dev looks at first and they should show the
  device the ticket claims.
- **Prefix re-verification captures with the build**, e.g. `16.7.5_step12_….png`, so a folder holding
  two generations cannot be misread. Keep an older capture **only** where the newer pass did not
  re-shoot that thing — and say so, so nobody assumes the un-prefixed files are stale leftovers.
- **Do not swap in a newer capture for a finding that did not reproduce.** If the re-check failed to
  show the defect, the newer screenshot is evidence of its *absence*; citing it in `Result` would
  misrepresent the ticket. Keep the original capture and let the verification banner carry the newer
  reading.
- Source is the session's `screenshots/` folder. Verify every `{filename}` referenced in the doc actually exists in its bug folder.
- Name the folder in each entry's **Images:** line so posting a bug = open that folder, attach everything in it.

## The body must be scannable — the TR260915-0007 shape (2026-09-16)

**Standing instruction from the user, 2026-09-16:** *"make sure the results, expected results, and
notes section are short and concise — the new bugs on TR260915-0007 are good examples. Managers and
RDs are saying these formats are easier to view at a glance, alternatively include a Traditional
Chinese (Taiwan) summary for each section."*

These are the bugs that were named (read back over the IF3 API on 2026-09-16). Every one of them is
this short, and this is the target — not a first line followed by paragraphs:

| BugCode | Result | Expect Result | Note |
|---|---|---|---|
| DRI261890P0001 | App crashes after tapping buttons on the tracking permission dialog. | Should not crash | `Device: iPhone 14/18.1.1` |
| DRI261890P0002 | The Premium dialog is displayed when using the paid content. | The Premium dialog should not be displayed. The Premium Feature Unlock dialog should be displayed instead. | `Device:` |
| DRI261890P0004 | Does not trigger any action after tapping the top banner's title | Should enter the correct feature room | `Device:` |
| DRI261890P0005 | The icon of an Error task is blurry | Should be clearly | `Device:` + `Jira:` + `Design:` (Figma URL) |

Their Repro Steps are 3–6 imperative lines ending in `Check the result` where the defect is visual.

### The contract

| Field | Contains | Hard limit |
|---|---|---|
| `Repro Steps` | `1. Launch the APP`, the shortest path, the trigger | numbered lines only, one action per line |
| `Result` | **one English sentence** stating the defect → `摘要：` line → `{screenshot}` line | sentence ≤ 120 chars, one line |
| `Expect Result` | **one English sentence** of correct behaviour → `摘要：` line (→ `Spec string:` if one exists) | sentence ≤ 120 chars, one line |
| `Note` | `Device:` · `Spec Link:` (every entry) · `Basis:` (when not spec-based) · `<Claude Reviewed>` | nothing else |

**The 摘要 line is the Traditional-Chinese summary the user asked for** — one sentence of
正體中文（台灣用語）, ≤ 60 characters, directly under the English sentence of *each* of Result and
Expect Result. English first, because that is how every TR260915-0007 ticket reads and what RD scans;
the 摘要 lets the Taiwanese team read the same defect without parsing English.

```
Result:
The small shortcuts are not collapsed on scroll-up; they slide under the pinned cards and are clipped.
摘要：上滑時小捷徑未收合，而是滑到卡片下方被切斷。
{16.8.0_lau01_clipped.jpg}

Expect Result:
On scroll-up the banner collapses and only the big shortcuts remain, with an expand CTA.
摘要：上滑時 banner 收合，只保留 big shortcuts 並顯示展開 CTA。
Spec string: 「上滑時, banner 會收起來且只顯示 big shortcuts + 展開CTA」
```

### Everything else goes in the QA note

Reproduction history, positive controls, measured numbers beyond the one that *is* the defect,
cross-feature comparisons, "as shipped…" consequences, spec contradictions, tooling caveats — all of
it moves to the `> **QA note — not pasted into eBug.**` blockquote. The review page renders that note
as the *My read* callout, so the reviewer still sees the whole argument; the ticket does not carry it.

**The test:** RD reads the Short Description, then the Result sentence, and stops. If those two do
not convey the defect, tighten them — never add a second paragraph.

`[AI Recommendation]` stays for text/string findings, but holds only the suggested strings.

`ebug-tr-filer/scripts/check_ebug_format.py` enforces every limit above (one prose line, ≤120 chars,
exactly one 摘要 with Chinese in it, Note lines restricted). Run it through
`scripts/drafts_to_bodies.py` on every batch before the review page is built.

## Conventions (match the team's existing eBugs)

- **Short Description** = `PDR-I <version> - [<found-by>][<type>] <Feature>: <description>`.
  - **All five parts are mandatory except `[<type>]`** (dropped for a plain functional defect). The
    part that actually gets skipped is **`<Feature>`** — the 2026-09-15 batch shipped four bugs with
    no feature name and ten with no `PDR-I <version> - ` prefix, and they had to be fixed by hand.
    The failure mode is that the sentence still reads fine: *"[EDF][UX] AI task failure dialog asks
    the user to contact support"* is good English and completely unfilterable.
  - **Name the feature the user was in, not the widget that misbehaved.** A dialog, toast, preset or
    button is not a feature; the screen it belongs to is. **If the first word after the tags is a
    verb or an article, the feature name is missing.** Where a finding is genuinely global, use the
    container — `AI Task Manager:`, `Produce:`, `Media Picker:` — rather than dropping it.
  - `ebug-tr-filer`'s `scripts/check_ebug_format.py` enforces this; run it before anything is filed.
  - **`[AIFound]`** marks a bug found by the AI exploration suite (the default for these sessions; the team's GPT-found bugs used the same marker).
  - **Add the problem-type tag right after it:** `[UI]` for visual/layout/appearance issues (overlap, missing badge/label, wrong displayed value, spacing), `[UX]` for interaction/behavior/flow issues (missing feedback, bad defaults, discoverability, inconsistent paradigms, misleading messaging) **— but only when the expectation rests on another product or on nothing (*UX basis rule*, 2026-10-21)**. An interaction problem judged against a spec or against another feature of this app is `[UI]` or Functional, owner RD. So a UX bug the AI found reads `[AIFound][UX]`, a UI one `[AIFound][UI]`; `[AIAgent]` never takes `[UX]`.
  - **Source tag and problem-type tag stack; they are different axes.** The source tag says where the finding came from (`[AIFound]`, `[MXFound]`, `[EDF]` for an Eat-Dog-Food run — the EDF workbook asks for `[EDF]` explicitly), the type tag says what kind of problem it is. A UX problem found during EDF is `[EDF][UX]`, a visual one `[EDF][UI]`, and a plain functional defect is `[EDF]` alone. Never drop one to make room for the other.
  - **Functional** bugs take `[AIFound]` alone — their type is carried by the eBug form's Problem Type field, not a bracket tag.
  - The KB often lumps issues as "UI/UX"; split each into UI **or** UX for the tag by the *UX basis rule*, put the call in the section header, and note that the user can flip it.
  - Keep the description a single specific line — the symptom, not the fix.
  - **Budget ~120 characters, hard cap 140.** Drop articles and restate rather than appending a subordinate clause. If it needs a "while…", "where…", or "and…" tail to make sense, the tail belongs in Result or Expect Result.
- **Repro Steps** — numbered, imperative, always start with `1. Launch the APP`, **one action per line** (reviewer rule 1). Keep them minimal but sufficient to reproduce (match the style of the team's existing tickets).
- **Result** — one English sentence stating the defect (≤120 chars), then its `摘要：` line, then
  the `{screenshot}` references. Observation only. See *The body must be scannable* above — the
  shape there overrides every older instruction to add corroboration or reasoning to this field.
  **Cite screenshots by their final attachment names** (`{16.8.0_<slug>.jpg}`). If no screenshot
  exists, omit the braces and say so in the QA note.
- **Expect Result** — one English sentence of correct behaviour (≤120 chars), then its `摘要：` line.
  Quote a spec string on its own `Spec string: 「…」` line when a sheet defines it. The argument for
  *why* this is correct belongs in the QA note and the `Spec Link:` line, not here.
  - **For any finding about on-screen text** give a concrete suggested string in an
    `[AI Recommendation]` block below Expect Result — strings only, no prose (Title / Body / Buttons
    for dialogs; one line per state for toasts/labels).
- **Note** — **device info, spec links, and the reviewer marker. Nothing else.** Name **the device the finding was last actually reproduced on**, not the machine you drove it from. PDRi Mobile work runs on a real iPhone through the native macOS iPhone Mirroring window, so the app under test is iOS and the Mac is only the host: write `Device: iPhone 17 Air / iOS 26.2.1 (tested via iPhone Mirroring on MacBook Neo)`. Re-read the phone's model and iOS from Settings → General → About rather than trusting that line; ask the user if the mirror isn't up. Only write a Mac as the device if the build genuinely ran on macOS. Then add the reviewer marker on its own line: **`<Claude Reviewed>`** (the team's earlier tickets used `<GPT Reviewed>`). Do not put build numbers here — Version and Build No are separate top-level eBug fields.
  - **Every entry that cites a spec MUST carry a `Spec Link:` line** (standing instruction from QA, 2026-08-27). Put it between `Device:` and `<Claude Reviewed>`, **one line per sheet**, formatted `Spec Link: <milestone> <sheet name> - <url>` — e.g. `Spec Link: 12/E Add keep video bg - https://www.figma.com/design/…?node-id=539-32&p=f&t=…`. **Only the sheet(s) this entry's own argument rests on — never a blanket set** (QA correction, 2026-08-27). An entry quoting two sheets that disagree carries both; an entry disputing one string carries the one sheet that defines it. A sheet that merely happens to contain the string, on a board about something else, is not relevant and must be left out. **An entry whose claim is that no sheet covers the behaviour links the one sheet for the screen it is about** (reviewer rule 2, 2026-10-21, replaces "no `Spec Link:` at all") — still not the set of sheets you checked to prove a negative; say 「No sheet describes this」 in Expect Result, add its `Basis:` line, and let the owner settle it. If two links genuinely apply but the entry never names them, that is a sign the Expect Result should cite the spec properly — fix the prose, then the links are cited rather than decorative. **Why:** dev cannot act on 「spec 12/E says X」 without being able to open 12/E, and hunting a node id inside a 650 MB board is exactly the friction that gets a ticket bounced. URLs live in `Figma/INDEX.md` next to each sheet — add any new one there in the same pass. **Verify the claim before you link it — grep `Figma/_index/<sheet>.md`, do not trust the KB's summary.** Checking Character Motion Swap on 2026-08-27 changed two entries: the KB said one 12/E sheet held the photo label incidentally, but the transcript shows **both** 12/E sheets spec it as a numbered item (F11/F22 and F02/F11), so both belong; and the mode subtitle turned out to live in **only** `12/E Add keep video bg`, so the entry citing a bare 「12/E」 was ambiguous. **When two sheets share a milestone tag — Character Motion Swap has two 12/E sheets — always name the sheet in full**, in the prose and on the `Spec Link:` line; a bare `12/E` is not a citation. Quote spec strings verbatim, but note the boards use typographic apostrophes (`video’s`), so normalise before comparing. If the feature genuinely has no sheet, link the closest document that exists (the checklist, the PDF + board ID); if nothing exists, write 「Link needed」 in the QA note so the reviewer supplies one on the review page — `Spec Link: none` fails the format check since 2026-10-21.
  - **This is easy to get wrong.** The 16.7.0 batch shipped 24 entries stamped `Device: MacBook Neo (Apple A18 Pro) / macOS Tahoe 26.5` — the host Mac — for bugs that only reproduce in PowerDirector Mobile on iOS. Two of the four reports also described the setup as "PowerDirector native window on macOS", which reads as a Mac app. Record the phone in the session notes at the start of the run so this can't drift.
  - **Nothing else goes in Note** beyond `Device:`, the `Spec Link:` lines, the `Basis:` line (*UX basis rule*) and `<Claude Reviewed>`. Confidence flags, "not re-tested this pass", scope limits, tooling limits, corrections to an earlier revision, and "the spec contradicts itself" caveats are all QA-internal — dev should not be reading them in the ticket body.
  - Put them in a **`> **QA note — not pasted into eBug.**`** blockquote *above* the Short Description, outside every fenced block. If the caveat should stop the ticket being filed at all, prefix it **`> **⛔ QA note — do NOT paste into eBug; resolve before filing.**`** so it is unmissable.
- **No hard wrapping inside the fenced blocks.** These blocks get pasted into an eBug textarea, where hard newlines survive and the browser cannot reflow them; wrapping prose at 90-odd characters produces breaks mid-sentence. Write each paragraph of Result / Expect Result / Note / `[AI Recommendation]` as **one unwrapped line**, however long. Only these get their own line: each numbered Repro Step, each `{screenshot}` reference, each bullet, each quoted 「spec string」, and the `[AI Recommendation]` header itself.
- **Entry header** — `## N. <ISS-ID> — <title>  ·  Class: <Functional|UI|UX>  ·  Severity: <S1-S4>  ·  Owner: <RD|PM|Doc>`. Class comes from the KB's known-issues table; the other two are assigned per the rules below. Put a one-line legend for both above the first entry. These stay **outside** the fenced blocks — they feed the eBug form's Severity field, which the user sets by hand.
- **Severity is S1–S4, not High/Medium/Low.** **S1 = critical and blocking only** — crash, data loss, a flow the user cannot complete. The bar is genuinely high: a 24-entry batch spanning wrong billing, missing buttons and absent controls produced **zero** S1s. Do not inflate. **S2** important, **S3** moderate, **S4** minor. If the KB records a word-scale severity, map High/Medium-High → S2, Medium → S3, Low-Medium/Low → S4, then sanity-check each against the S1 bar rather than trusting the mapping.
- **Owner is RD, PM or Doc**, decided by *what the fix is*, not by who noticed it:
  - **RD** — the build deviates from a spec that is itself correct. Quote the spec string; if you can't, it probably isn't RD.
  - **PM** — a decision is needed on what the correct behaviour or spec *is*: the sheet contradicts itself, two sheets disagree, no sheet exists, or the thing simply doesn't exist yet and someone must choose whether to build it. Every `[UX]` entry (basis External / None) is PM.
  - **RD for in-product consistency** — a finding whose basis is another feature of this app (`Basis: In-product`) is RD, not PM: the other feature already answers what correct is. RD may forward it to PM.
  - **Doc** — the fix is a string: on-screen copy, labels, naming, dialog wording. Usually CMS-served content. A capitalisation divergence or a mislabeled button is Doc, not RD.
  - When a finding needs a PM ruling *before* anyone can act, the owner is **PM** even if the eventual fix lands with RD — routing it to RD first just gets it bounced.

### Getting this computer's device info

If the target build was tested on this Mac (the usual PDRi Mobile / TestFlight native-window setup), request access to **System Settings**, open it, click **General → About**, and read Model name, Chip, and macOS version. As of last check this machine is **MacBook Neo (Apple A18 Pro) / macOS Tahoe 26.5** — re-read it rather than trusting this line, since it can change. If the bug was reproduced on a physical iPhone instead, ask the user for the device/iOS string.

## Steps

1. Confirm feature/report (ask if missing). Set up a short task list.
2. Read the QA sign-off and the feature KB file. Read the screenshots folder listing for filenames. **Extract the report's ▲ rows** (the step table in the .docx) — this is the checklist the batch is reconciled against in step 8.
3. **If the KB has no ID column, add one before drafting.** Minting IDs inside the eBug doc leaves the KB unable to refer back to the tickets. Continue the existing sequence; never renumber.
4. Select the findings to raise (Actual Bug, minus already-reported). Map each to its ISS-ID, class, severity, spec strings, and screenshot filename(s).
5. Read the device info for the Note (see above). **Check it against the report's 測試裝置 row** — if the report says the run used a native macOS window and you are about to write "iPhone Mirroring" (or the reverse), stop and ask which is true rather than copying the previous batch.
6. Write `ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md` — one file per feature, dated with the **session** date — Short Description and Description each in a fenced code block, filed entries first in report-step order, then the **⛔ Withdrawn by QA** section, then the "Not raised" table.
7. Copy each bug's cited screenshots into `ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>_images/<NN>_<ISS-ID>/` and add the **Images:** line to each entry. `<NN>` must match the entry's final number.
8. Write the `## Reconciliation against the report` section (delta table + row-by-row map). **Every report ▲ row from step 2 must appear in it.**
9. Verify **programmatically, not by eye** — a short script over the finished doc is worth more than a re-read. Check: every raised finding is verdict=Actual Bug and not already-reported; every excluded finding appears in the "Not raised" table; every report ▲ row appears in the reconciliation map; every `{filename}` exists in its bug folder **and every file in a bug folder is cited** (an uncited file means a stale copy); entry numbers are contiguous; no ISS-ID appears twice; every Short Description is ≤140 characters; every entry has exactly one `Device:` line and one `<Claude Reviewed>`; **every entry whose Description names a specific spec sheet (`n/E`, an SFT, a checklist) has at least one `Spec Link:` line; every `Spec Link:` URL is well-formed; no entry links a sheet its Description never names (in full, where the milestone tag is ambiguous); and every `Spec string (...)` quoted in an entry is actually present in one of that entry's linked transcripts**. `scripts/verify_ebug_drafts.py` runs all of this plus the checks above — point it at the finished batch rather than re-reading by eye. Plus the four checks the newer conventions need:
   - **no filed entry appears after a withdrawn one**, and if anything is withdrawn there is a `# ⛔ Withdrawn by QA` section heading;
   - **every Images: path starts with the same `<YYYYMMDD>_` prefix as the markdown filename**;
   - **each `<NN>_` image folder number equals its entry number**;
   - **each ISS-ID's entry number is identical everywhere it appears** — heading, reconciliation map, owner split, filing order. This is the check that catches a botched reorder, and the bare-number tables are where it fails;
   - **after a re-verification pass, the newest capture is cited first** in every entry that has one, and no folder holds a file nothing cites.

   Then run the ticket-format gate on the same text that will be filed:
   `python3 scripts/drafts_to_bodies.py ebugs/<batch>.md --out <session>/upload/bodies.json` →
   `python3 ../ebug-tr-filer/scripts/check_ebug_format.py <session>/upload/bodies.json --product PDR-I --version <v>`.
   A batch with errors is not ready for the review page.

   **Fix the file when a check fails — but read the failure first.** A check written against the old convention will fail on a correctly-updated file; correct the checker then, not the doc, and re-run until clean. Then present the markdown (the image folders travel with it in `ebugs/`).

## When this runs — automatically, with the report (2026-09-16)

`pdri-exploration-suite` invokes this skill **in the same breath as the `.docx` report** — the draft
markdown and its `_images/` folder are written while the screenshots and step records are still in
hand, dated with the session date. A dive with no QA sign-off yet still gets its batch: every
Phase-3-CONFIRMED defect becomes an entry with a proposed Severity/Owner, and the reviewer's sign-off
happens on the `ebug-tr-filer` review page built from this very file. Unverified (未複驗) defects go
in "Not raised" as ⏳ rows, never as entries.

## Related

- `pdri-exploration-suite` — runs the tests and produces the KB + sign-off this skill reads.
- `qa-verification-to-word` — the companion skill that folds the same QA verdicts back into the Word exploration report.

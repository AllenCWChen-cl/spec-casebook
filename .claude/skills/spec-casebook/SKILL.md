---
name: spec-casebook
description: Turn a CyberLink product feature spec (PowerDirector, PhotoDirector and others; PM / Design / MX files) into a plain test-case table (Action + Expected Result per row, one table per platform), get it reviewed on an HTML review page, and keep the approved table as the feature's "correct answer". Use when the user gives spec files and asks for test cases, a test table or a checklist for a feature; asks to review, update or reuse a feature's approved cases; or gives an updated spec for a feature that already has a table. Do not use for exploration testing or eBug filing.
---

# Spec casebook

Produces one reviewed test-case table per **feature × platform** (`ios`, `android`) from the feature's spec files.
Everything for a feature lives in `library/<product>/<feature>/`; `library/<product>/product.json` holds the
product's app ids and eBug product names:

```
library/<product>/<feature>/
  README.md            generated index (spec sets, platform tables, versions)
  specs/<date>/        one folder per spec set received: original files (git-ignored), spec-set.json,
                       extracted/ (text and notes pulled from the spec; renders in extracted/regions/ are local)
  ios/ | android/      cases.csv (approved table, source of truth), cases.xlsx / cases.html (generated views),
                       requirements.md, manifest.json, history/, drafts/<id>/,
                       runs/<date>/ (evidence from running the table), ebugs/<date>/ (eBug drafts and filing)
```

Spec files are copied in by the scripts (`add-spec.ts`, `new-draft.ts`); never store them anywhere else. Put any
other per-feature material the user asks to keep (exports, notes) under `library/<product>/<feature>/`, never at the repo root.

All commands run from the repo root. Scripts are TypeScript run directly by Node ≥ 22.18
(`node scripts/<name>.ts`); run `npm install` once if `node_modules/` is missing.

## Independence

This tool stands alone. Do not read from, write to or depend on the exploration-test folder, the spec agent
repo or any other QA tool. A later request may ask to turn exploration findings into new cases; treat that as
a normal draft (new rows, `Change` = `new`, the finding named in `Notes`) and send it through review like any
other change. Never push anything the other way. Requests the user made elsewhere (for example to the spec agent)
reach the casebook only as entries in the feature's `requests.md`; the one-time import of 2026-10-21 is recorded
there. Everything a table, a run or a filing needs is in this repo. The spec agent comparison (`references/analysis.md`) reads a
snapshot of the spec agent's cases committed here (`library/<product>/<feature>/spec-agent/<platform>.json`); a clone of the
spec agent repo, when one is on the machine, only refreshes that snapshot (git only, never its working tree).

## What this repo is for (user, 2026-10-27, REQ-036)

Two things, in this order: a **complete, thorough analysis** of the spec files (`references/reading-the-spec.md`, the coverage passes
and the standing inputs in `references/analysis.md` find every rule themselves), and an **on-device run that does not drain tokens** (segments,
recipes, `scrollto` / `waitfor`, parked fixtures, no re-reading in a context that already ran a section).

**Keep refining the analysis itself (user, 2026-10-27, REQ-037).** A better, more complete table comes from improving
how the spec is read and analyzed, never from comparing with another tool's cases and covering what it covers. When
something shows the analysis missed a rule (a run finding no row caught, a reviewer's edit or added case on the
review page, an RD rejection, a bug found outside the table, a question that turned out to be stated in the spec),
find where in the spec it was stated and why the reading or a pass skipped it, then fix that step or pass here so
every future spec gets it, not only the one table. Record each such fix in the step it changes (dated, with the case
that showed it). No comparison runs during an analysis or before a proposal.

## Workflow

### 0. Identify the feature, platform and spec files

**Started with no arguments (user, 2026-10-29).** Ask which feature to work on (offer the features
`node scripts/status.ts` lists, plus "a new feature"), then which platform when the feature has both. Then:
1. **No spec files or Figma links yet** (a new feature, or no spec set with a `figma-frames.json` `files` entry):
   ask for the spec files (PM / Design / MX PDFs) and the Figma links before anything else, and continue with
   step 1 once they arrive.
2. **Links already there:** check Figma for changes without asking, at the cost of one small call per Figma file
   (never a re-read of every group): `whoami` on `figma-design` and `figma-pm` (stop for the user on a wrong or
   signed-out account, `references/reading-the-spec.md` step 10), then `node scripts/figma-check.ts <feature>`. It writes one check
   call per file (`extracted/figma-check/<role>.js`). Pass each as `code` to `use_figma` on the server it names and
   save the reply verbatim as `figma-check/<role>.json`. Then run `node scripts/figma-check.ts <feature> --compare`.
   Also ask whether new PDF exports arrived since the newest spec set (a PDF cannot be checked from here).
   - `FIGMA: CHANGED`: run the printed `reread-<group>.js` calls (one per changed group, saved over
     `figma-inventory-<group>.json`), add each new board to a group (or `--ack` it when it is not spec), re-capture the
     listed screenshots, then `inventory.ts --sync-arrows` and `figma-check.ts` again (it takes the new hashes from
     the re-read groups). Go on to step 3 (changed spec → update plan, draft, `check.ts`) and step 4 (review).
   - `FIGMA: UNCHANGED` and no new PDFs: the approved table stands; skip to the run.
   After the review is saved (or with nothing changed), continue to the **on-device run** of the approved table:
   the next round in `phases.json` (rows a draft added or changed first, REQ-033), orchestrated segment by segment
   (`references/run.md`, "Keep going without asking"). Check the phone and `fixtures.md` first; a missing phone or fixture
   stops for the user.

- Feature ID: `<product>/<feature>`, both kebab-case, e.g. `pdr/ai-mini-drama` (product ids: the folders under
  `library/`; a new product also needs `library/<product>/product.json`, README › Adding a product). Reuse an existing ID from
  `node scripts/status.ts` when the feature is already in the library.
- Platform: `ios` or `android`. Each platform has its own table, reviewed and approved separately. If the user
  wants both, run the whole workflow once per platform (the second draft may start from the first platform's
  rows, adjusted for platform differences the spec states). Then read every Precondition and Action against the second
  platform's controls (its debug menu, log, tier switch, install path, system settings): a step that names a control the
  platform lacks is rewritten or parked, never copied (2026-10-27: 13 Android rows named iOS Pink, Developer Server or
  Log stage timings).
- Spec files: every file the user supplied for this feature (PDF, images, exported Figma pages, text).
  Ask for missing ones only if the user said there are more.

### 1. Fingerprint the spec

```
node scripts/fingerprint.ts <feature> <platform> <spec files...>
```

| Status | Meaning | Next |
|---|---|---|
| `NEW` | No approved table | Step 2 (new table) |
| `SAME` | Same spec files as the approved version (SHA-256 of the file set) | Tell the user the approved version, date and case count, and **ask whether to use it as is**. If yes, give them `cases.xlsx` / `cases.html` / `cases.csv` and stop. If they want changes, open it for review (step 4, no `--draft`). |
| `CHANGED` | Different spec set | Step 3 (update plan) |

### 2. New table

1. `node scripts/new-draft.ts <feature> <platform> --title "<Feature name>" <spec files...>` → copies the spec set to
   `library/<product>/<feature>/specs/<date>/` (or reuses an identical set) and prints the draft folder.
2. Read every spec file completely, following `references/reading-the-spec.md`, then run the **Coverage passes** and
   apply the **Standing inputs** (`references/analysis.md`). Write `requirements.md` in the draft folder (`references/formats.md`), trace every
   annotation against it (`reading-the-spec.md` step 9).
3. Run the **Value check**, then write `draft.csv` in the draft folder (`references/formats.md`), every row `Change` = `new`.
   List what the value check left out in `update-plan.md` under "Not added" (a new table has no other plan sections).
4. `node scripts/check.ts <feature> <platform> --draft <id>`; fix every error.
5. Step 4 (review).

When a draft's rows are built by a script (many rule-derived rows), keep the script in the draft folder in
TypeScript (`build-draft.ts`, as in `pdr/ai-mini-drama/ios/drafts/20261021-150855/`) so the draft can be rebuilt.

### 3. Changed spec → update plan

1. `node scripts/new-draft.ts ...` as above (it records which approved version the draft updates).
2. Read the new spec files completely, run the **Coverage passes** and apply the **Standing inputs** (the request
   ledger, tickets and build notes change between updates even when the spec does not), and
   write the new `requirements.md`, then trace every annotation against it (`reading-the-spec.md` step 9; traces of
   unchanged blocks carry over, so only new or changed blocks need a decision). **Keep the ID of every requirement that still exists** (same meaning, even if reworded); give
   new requirements new IDs after the highest existing one; never reuse a removed ID. A new draft on the same spec
   set (e.g. after new requests or a new build) follows this step too: `new-draft.ts` reuses the spec folder.
3. Compare with the approved `library/<product>/<feature>/<platform>/requirements.md` and write `update-plan.md` in the
   draft folder (`references/formats.md`).
4. Run the **Value check**, then write `draft.csv`: every approved row, marked `unchanged`, `modified` (row text
   updated to the new spec) or `removed` (kept in the draft so the reviewer can confirm the removal), plus `new` rows. Every non-`unchanged`
   row gets a one-line `Change Reason` naming the requirement change. Keep existing case IDs; new cases continue
   the numbering; never renumber. **Placement and old rows (user, 2026-10-22, REQ-033):** put a new row right after
   the row it extends, or where its journey step falls in its Section, not at the Section's end (the review page and
   the exports keep file order, so IDs may run out of sequence); move rows an earlier draft appended to where they
   belong. When a new rule is checked on the same screen with the same setup as an old row, modify that row
   (`modified`, reason) instead of adding one. Both are fine between rows that already ran; a changed row is re-run
   in the next round. After every analysis, check whether the order of rows and of the run should change.
5. Show the user the plan summary in chat (counts, the notable changes and open questions) and ask them to
   go ahead with the review. Then `check.ts` and step 4.

### 4. Human review

```
node scripts/review.ts <feature> <platform> --draft <id>     # a draft
node scripts/review.ts <feature> <platform>                  # edit the approved table directly
```

Run it in the background (it is a local server on 127.0.0.1, port 4387 or the next free one), give the user the
printed URL, and tell them what to do. When the user wants the pages shared or together, run
`node scripts/pages.ts <feature> <platform> [--draft <id>] [--lan]` instead: four tabs on one address, **Cases** (this review
page, `/cases/`), **Progress** (the run plan, `/progress/`), **Results** and **Coverage** (user, 2026-10-28), with one
shared tab bar holding the only English / 中文 switch; each row's **Coverage →** opens the coverage page on that case
(its requirements, their spec boards and the controls it presses), **Results →** its run records with the screenshots
and the pass / fail / block reason, and Save works only on this computer:

- Each row: edit any text inline, change Priority, **Keep** or **Delete**. Rows marked `removed` default to Delete.
  `+ Add case` opens a free-text box under that section's header (user, 2026-10-28), not a blank row: the reviewer
  describes the case in their own words. Modified rows show the previous text struck through.
- **Copy decisions** copies a short change list to paste into the chat; **Copy final CSV** copies the whole table.
- **English / 中文 (user, 2026-10-29).** A toggle in the header switches the page's own words; rows stay English and,
  in 中文, show their Chinese reading under each field from `draft.zh.json` in the draft folder (`{ "<ID>": { "<field>":
  "<Chinese>" } }`; quoted app strings 「…」 stay English). Write it for every draft (parallel subagents for large
  tables, one Chinese name per Section); Save copies it to `cases.zh.json`, which `cases.html` uses. Edits are made
  in English; a field edited after translation marks its Chinese as stale.
- **Save as approved table** writes `cases.csv`, archives the previous version to `history/v<N>.csv`
  (+ its requirements), updates `manifest.json`, and regenerates `cases.xlsx` / `cases.html`. Saving again from
  the same draft overwrites that same version.

After the user says they saved, read `manifest.json` and `cases.csv` to confirm the version and case count, and
report them. If the user pastes copied decisions instead of saving, apply them to the draft's rows, write the
result with the same columns, and re-open the review (or save on their explicit request by editing `cases.csv`
and re-running `node scripts/export.ts`). Leave the review server running unless the user asks you to stop it.

**New-case notes (user, 2026-10-28).** Save appends the notes to `library/<product>/<feature>/<platform>/new-case-notes.json`
(`status: "open"`, the version saved with them); Copy decisions ends with a `NEW CASE NOTES` block. Whenever either
arrives, go over every open note before anything else: split it into the cases it describes, read each against the
spec and `requirements.md` as an analysis would (which requirement it observes, or a new one when the spec states it;
a note with no spec basis becomes a row only if the reviewer asks for it, with Notes 「Reviewer request」 and a
`requests.md` entry), and decide its section from what it tests, not from where it was typed. Write the rows in the
draft format (Precondition, Action, Expected Result, Priority, Spec Ref, Notes, `Change: new`, `Change Reason`
naming the note ID), placed right after the row they extend (REQ-033); an existing row that already covers a note is
modified instead, or the note is answered with that row's ID. If the notes came with a Save, start a new draft whose
`draft.csv`, `requirements.md` and `spec.json` copy the version just saved, add the rows there, run `check.ts`, and open the review again on it; if they
came as pasted text, add them to the open draft. Then set each note's `status` to `done` with the rows (or the
answer) in `new-case-notes.json`, and tell the user which rows each note became.

### 5. Later questions about a feature

Answer from `library/<product>/<feature>/<platform>/cases.csv` (and `requirements.md`) directly; for large tables read the
CSV rather than asking the user to open the page. Never edit an approved `cases.csv` without the user's request.

## References — read the one the task needs

| File | Read it for |
|---|---|
| `references/reading-the-spec.md` | Steps 2–3: rendering, OCR, board notes, arrows, Figma frames, annotation trace, the Figma inventory |
| `references/analysis.md` | Steps 2–3: coverage passes, standing inputs, value check, coverage and verdict rules, spec agent comparison |
| `references/formats.md` | Writing `requirements.md`, `draft.csv` / `cases.csv`, `update-plan.md` |
| `references/run.md` | Any on-device run segment, phase wrap-up or run plan (iPhone and shared run rules) |
| `references/run-android.md` | Android runs, together with `run.md` |
| `references/ebugs.md` | Turning run failures into eBug drafts, the review page and filing |

Paths are relative to this skill's folder (`.claude/skills/spec-casebook/`, Codex: `.codex/skills/spec-casebook/`).
A segment subagent reads this file and `run.md` (plus `run-android.md` on Android), not the analysis references.

## Running cases and filing eBugs

This repo carries its own copies of `ebug-draft-generator` and `ebug-tr-filer` (each starts with a casebook
overlay). When the user runs the approved table on a build and reports or asks to file failures, use them with
`references/ebugs.md`. Keep run evidence in `library/<product>/<feature>/<platform>/runs/<date>/` and filing material in
`library/<product>/<feature>/<platform>/ebugs/<date>/`. A failure that shows the table itself is wrong (spec changed, case
mis-written) is a table change: open a draft and send it through review instead of filing it.

## Checks before handing over

- `node scripts/check.ts` passes with no errors (warnings explained to the user).
- Every testable requirement has a case; every case has a Spec Ref.
- For updates: no approved row silently disappears — removals are rows marked `removed`.
- Every Design arrow in `arrows.json` has a requirement; every open table entry of `requests.md` is cited; the
  job-state grid has no empty cell (all three enforced by `check.ts`).
- What the value check left out is listed in `update-plan.md` → "Not added".
- Every annotation block is traced; the Hidden clauses and Variants grids cover every requirement that needs them
  (`check.ts`, REQ-032).
- When the spec set has `inventory.json`: every control group is pressed by a row or marked n/a, every input has a
  dismissing row (`control-trace.json`, `check.ts`, REQ-038).

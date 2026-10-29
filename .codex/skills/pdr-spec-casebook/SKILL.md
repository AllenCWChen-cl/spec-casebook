---
name: pdr-spec-casebook
description: Turn a PowerDirector feature spec (PM / Design / MX files) into a plain test-case table (Action + Expected Result per row, one table per platform), get it reviewed on an HTML review page, and keep the approved table as the feature's "correct answer". Use when the user gives spec files and asks for test cases, a test table or a checklist for a feature; asks to review, update or reuse a feature's approved cases; or gives an updated spec for a feature that already has a table. Do not use for exploration testing or eBug filing.
---

# PDR spec casebook

Produces one reviewed test-case table per **feature × platform** (`ios`, `android`) from the feature's spec files.
Everything for a feature lives in `library/<feature>/`:

```
library/<feature>/
  README.md            generated index (spec sets, platform tables, versions)
  specs/<date>/        one folder per spec set received: original files (git-ignored), spec-set.json,
                       extracted/ (text and notes pulled from the spec; renders in extracted/regions/ are local)
  ios/ | android/      cases.csv (approved table, source of truth), cases.xlsx / cases.html (generated views),
                       requirements.md, manifest.json, history/, drafts/<id>/,
                       runs/<date>/ (evidence from running the table), ebugs/<date>/ (eBug drafts and filing)
```

Spec files are copied in by the scripts (`add-spec.ts`, `new-draft.ts`); never store them anywhere else. Put any
other per-feature material the user asks to keep (exports, notes) under `library/<feature>/`, never at the repo root.

All commands run from the repo root. Scripts are TypeScript run directly by Node ≥ 22.18
(`node scripts/<name>.ts`); run `npm install` once if `node_modules/` is missing.

## Independence

This tool stands alone. Do not read from, write to or depend on the exploration-test folder, the spec agent
repo or any other QA tool. A later request may ask to turn exploration findings into new cases; treat that as
a normal draft (new rows, `Change` = `new`, the finding named in `Notes`) and send it through review like any
other change. Never push anything the other way. Requests the user made elsewhere (for example to the spec agent)
reach the casebook only as entries in the feature's `requests.md`; the one-time import of 2026-10-21 is recorded
there. Everything a table, a run or a filing needs is in this repo. The spec agent comparison (below) reads a
snapshot of the spec agent's cases committed here (`library/<feature>/spec-agent/<platform>.json`); a clone of the
spec agent repo, when one is on the machine, only refreshes that snapshot (git only, never its working tree).

## What this repo is for (user, 2026-10-27, REQ-036)

Two things, in this order: a **complete, thorough analysis** of the spec files (Reading the spec, the coverage passes
and the standing inputs find every rule themselves), and an **on-device run that does not drain tokens** (segments,
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

- Feature ID: kebab-case product feature name, e.g. `ai-mini-drama`. Reuse an existing ID from
  `node scripts/status.ts` when the feature is already in the library.
- Platform: `ios` or `android`. Each platform has its own table, reviewed and approved separately. If the user
  wants both, run the whole workflow once per platform (the second draft may start from the first platform's
  rows, adjusted for platform differences the spec states).
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
   `library/<feature>/specs/<date>/` (or reuses an identical set) and prints the draft folder.
2. Read every spec file completely, following **Reading the spec** below, then run the **Coverage passes** and
   apply the **Standing inputs**. Write `requirements.md` in the draft folder (format below), trace every
   annotation against it (Reading the spec, step 9).
3. Run the **Value check**, then write `draft.csv` in the draft folder (format below), every row `Change` = `new`.
   List what the value check left out in `update-plan.md` under "Not added" (a new table has no other plan sections).
4. `node scripts/check.ts <feature> <platform> --draft <id>`; fix every error.
5. Step 4 (review).

When a draft's rows are built by a script (many rule-derived rows), keep the script in the draft folder in
TypeScript (`build-draft.ts`, as in `ai-mini-drama/ios/drafts/20261021-150855/`) so the draft can be rebuilt.

### 3. Changed spec → update plan

1. `node scripts/new-draft.ts ...` as above (it records which approved version the draft updates).
2. Read the new spec files completely, run the **Coverage passes** and apply the **Standing inputs** (the request
   ledger, tickets and build notes change between updates even when the spec does not), and
   write the new `requirements.md`, then trace every annotation against it (Reading the spec, step 9; traces of
   unchanged blocks carry over, so only new or changed blocks need a decision). **Keep the ID of every requirement that still exists** (same meaning, even if reworded); give
   new requirements new IDs after the highest existing one; never reuse a removed ID. A new draft on the same spec
   set (e.g. after new requests or a new build) follows this step too: `new-draft.ts` reuses the spec folder.
3. Compare with the approved `library/<feature>/<platform>/requirements.md` and write `update-plan.md` in the
   draft folder (format below).
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
`node scripts/pages.ts <feature> <platform> [--draft <id>] [--lan]` instead: review, run plan and coverage on one
address with tabs; each row's **Spec →** opens the coverage page on that case (its requirements, their spec boards and
the controls it presses), and Save works only on this computer:

- Each row: edit any text inline, change Priority, **Keep** or **Delete**. Rows marked `removed` default to Delete.
  `+ Add case` adds a row to that section. Modified rows show the previous text struck through.
- **Copy decisions** copies a short change list to paste into the chat; **Copy final CSV** copies the whole table.
- **Save as approved table** writes `cases.csv`, archives the previous version to `history/v<N>.csv`
  (+ its requirements), updates `manifest.json`, and regenerates `cases.xlsx` / `cases.html`. Saving again from
  the same draft overwrites that same version.

After the user says they saved, read `manifest.json` and `cases.csv` to confirm the version and case count, and
report them. If the user pastes copied decisions instead of saving, apply them to the draft's rows, write the
result with the same columns, and re-open the review (or save on their explicit request by editing `cases.csv`
and re-running `node scripts/export.ts`). Leave the review server running unless the user asks you to stop it.

### 5. Later questions about a feature

Answer from `library/<feature>/<platform>/cases.csv` (and `requirements.md`) directly; for large tables read the
CSV rather than asking the user to open the page. Never edit an approved `cases.csv` without the user's request.

## Reading the spec

PM and Design specs usually arrive as Figma exports: one enormous PDF page (20,000+ points on a side) holding every
board, phone mockup and annotation. Their text layer is unreliable — Chinese annotations often have no usable
Unicode mapping (extracted text comes out garbled) and Figma splits text into glyph runs, so PDF text extraction
mangles both. The reliable source is the rendered page: **render each board, OCR the tiles, read the OCR text,
and look at the tile images where layout, arrows or states matter.**

1. **Copy the set in.** `new-draft.ts` (or `node scripts/add-spec.ts <feature> <files...>`) copies the files to
   `library/<feature>/specs/<date>/` with `spec-set.json`. Work only from that copy.
2. **Overview.** `node scripts/render-region.ts "<pdf>" specs/<date>/extracted/regions/<name>-overview.png --max 2400`
   renders the whole page small (about a minute for a 300 MB file). Look at it and write
   `specs/<date>/extracted/boards.json`: for each PDF, a list of boards `{ "id", "title", "region": [x, y, w, h] }`
   in PDF points (overview pixel ÷ the printed scale). Board = one titled frame group (Main flow, Error Handling,
   each dated "update" board, …). Leave a margin of ~100 pt around each.
3. **Render + OCR every board.**
   `node scripts/spec-boards.ts <feature> <date> [--jobs 3] [--board <id>] [--scale 1.5]`
   For each board it renders 1600 × 1000 pt tiles at 1.5× in grayscale with MuPDF (`render-tiles.ts`, which draws the
   board in large strips and slices them, because every replay of a huge Figma page costs ~30 s), OCRs the tiles with
   macOS Vision in English + Traditional Chinese + Japanese (`ocr-tiles.swift`), and writes
   `specs/<date>/extracted/boards/<id>.md`: the board's text in reading order with canvas coordinates. Tiles stay in
   `boards/<id>/tiles/` (local only). Re-running skips finished steps. Expect about 45–75 min for a 230 MB PM file with `--jobs 3` (10/21: 48 min for 14 boards; the main-flow board alone took 48 min), so run it in the background.
   Do not use macOS Preview/Quick Look/CoreGraphics or pdf.js to render these files: they draw them blank or crash.
4. **Read board by board.** Read `boards/<id>.md` first (cheap); then open the tiles of that board that hold
   flows, states or mockups (`boards/<id>/tiles/x<X>-y<Y>.png`, coordinates in the file name) to see what the text
   annotates. Zoom on a spot with `render-region.ts <pdf> <out.png> x y w h --max 2000` when small print matters.
   - Text inside phone mockups is sample content (story text, character names) unless an annotation points at it.
   - Dated labels ("10/6 update", "10/13 update") and the dated update boards override older frames; the newest
     wins. Green/yellow callouts are change notes.
   - UI strings: take them from Design frames exactly (quote them in cases); PM frames carry rules and flows.
5. **Cross-check PM against Design** and note disagreements as Open questions; the case follows the newer or more
   specific source.
6. **Keep what you learned** in `specs/<date>/extracted/board-notes.md` (one section per board: rules, states,
   exact strings, arrows/flows, update notes). It is tracked, and a later spec update is compared board by board
   against it. `requirements.md` is written from these notes.
7. **List every flow arrow** in `specs/<date>/extracted/arrows.json` while reading the Design flow boards
   (`{ "arrows": [{ "arrow": "<node>", "node": "<node>", "edge": "<from> → <to>", "expected": "<what it leads to>" }] }`,
   the Figma node ID from the arrow's link; a second arrow on the same node gets a suffix, e.g. `2837-147745-PINCH`).
   Coverage pass 1 and `check.ts` use it.
8. **Check Figma for frames newer than the PDF (user, 2026-10-22, REQ-030).** A PDF export can be days older than the
   Figma file (the 10/19 Design PDF stopped at the 1014 updates; three 1016 frames were only in Figma). When the spec
   set has Figma links (`spec-set.json` → `figma`, or the links on the boards), list the file's pages with Figma MCP
   `get_metadata` (no node ID), then `get_metadata` on the design page and collect every frame or text whose name
   starts with a date (`1016_…`, `1005_Update`) or is a dated update note. Compare them with the labels in the PDF OCR
   (`boards/*.md`). Read each label the PDF lacks with `get_screenshot` (save to `extracted/figma/`, local only) and
   `get_metadata` for its text, and add it to board-notes under 「Design — Figma only」. Record every dated label in
   `extracted/figma-frames.json` (`label`, `node`, `in_pdf`, `read` = the board or note where it was read);
   `check.ts` fails a label with an empty `read`. A Figma-only frame is part of the spec like any other frame and is
   dated by its label.

9. **Trace every annotation (user, 2026-10-22, REQ-032).** Reading board by board skips lines: the PM note
   「只送 crop 後的圖」 was read by OCR (low-confidence) and never became a requirement. After `requirements.md` is
   written, run `node scripts/annotations.ts <feature> <platform> --draft <id>` (`--skip <board prefixes>
   --skip-reason "<why>"` for boards that are not part of the current spec, e.g. superseded MX versions). It groups the
   annotation lines of every board (Chinese text or • bullets, OCR noise dropped) into blocks and writes
   `<draft>/annotation-trace.json`. Trace each block: `R-…` when the requirements state **every clause** of it (a
   condition, a number, "only", "per tier", "remote-configured" are clauses), else add the missing requirement and
   trace to it; `label: …`, `ui: …`, `older: <newer source>` or `Q-n` otherwise. Look at the tile, or render a
   close-up, for a low-confidence block whose meaning matters. Large sets go to parallel subagents by board group,
   each writing its own part file, merged afterwards. Traces carry over to the next draft for blocks whose text is
   unchanged, so an update only traces new or changed blocks. `check.ts` fails an untraced block or a trace that
   names a missing requirement.
10. **Inventory every screen, control and arrow from Figma (user, 2026-10-28, REQ-038).** The run must press every
   tappable element the Design draws and walk every arrow, and the coverage page proves it. When the spec set has the
   Design Figma file, read it with `scripts/figma/inventory.js` (read-only `use_figma`; the file's header says how):
   one call with `__BOARDS__ = []` lists the boards, then **one call per board group** (about 4 boards or 40 KB of
   output each) returns every phone frame, every tappable instance (deduplicated by board + layer + label + position)
   and every flow arrow with its tail control and head screen from the vector geometry (arrow layer names are stale
   copies; the geometry is not). **Figma MCP has a small quota** (a View seat on the Professional plan hit its limit
   after about 13 calls on 2026-10-28): never read elements one by one, run the groups as parallel subagents that each save their
   return verbatim to `extracted/figma-inventory-<group>.json` and check its `size`, and do not re-read an unchanged
   file. Then `node scripts/inventory.ts <feature> <set> --sync-arrows` merges the groups into `extracted/inventory.json`
   (screens by platform; controls with kind button / input / toggle / tab / item; arrows as flow / auto / pointer).
   The totals count **groups**, not copies (user, 2026-10-28, REQ-040): a button with the same worded label is one
   group on every screen and board, whatever layer draws it; an icon or a numbers-only label (credit pill) groups by
   layer (+ size); a **choice set** (the same layer repeated side by side with different labels, or none: chips,
   options, template or scene cards, avatars) is one group that any one choice covers, and lists separated by a
   heading stay apart (Gender vs Ethnicity). Every copy stays marked on the coverage page. It also adds every arrow missing from `arrows.json` (write its `expected` and requirement in pass 1). Check
   every listed arrow's `edge` against the inventory's geometry (the control or text under its tail, the screen under its
   head) and correct it, its requirement and its "Walked by" from the geometry when they disagree: imported labels can be
   swapped (2778-129128 / 129129, shortcut vs banner, user 2026-10-28), and a label next to a control may be its own
   button rather than a separate icon (the banner's 「>」);
   annotation pointers (Figma's default 「Vector N」 name, tail off-screen) are marked `not_flow`. The extractor also
   takes **panels** (dialogs, sheets, popups drawn beside the phones: dialog-sized frames or groups named like one or
   touched by an arrow; their buttons are often plain frames), buttons drawn as frames named `btn` / `back` / `cta`,
   and long scrolling pages, and it skips what Figma does not draw (hidden, opacity 0, layer blur, clipped by a
   board or mask). **Review before tracing (user, 2026-10-28):** `node scripts/inventory-sheets.ts <feature> <set>
   --scale 1.25 [--board …]` cuts every screen and panel out of the Design PDF (a Figma-only board from its saved
   `extracted/figma/<board>.png`) with the boxes drawn, plus the OCR texts no box covers and an edge score (near 0 =
   the PDF draws nothing there). Review the sheets by board group in parallel subagents (each writes its own
   `extracted/inventory-review-<group>.json`): every tappable element without a box (inputs included), every box on
   something that is not tappable, every screen the PDF does not draw. Merge the findings into
   `extracted/inventory-overrides.json` with `node scripts/inventory-overrides.ts <feature> <set>` (`drop_screens`,
   `drop`, `hide` = covered on one screen only, e.g. behind a dimmed sheet, and `add` with screen-point boxes);
   `inventory.ts` applies them on every rebuild, so a re-extraction keeps them. Then curate the adds: the `label` is
   the app's visible text or one short icon name (「Mic」, 「Regenerate character」, 「Privacy Policy」), so the same
   element found by several reviewers is one group; an add that copies a known icon names its `layer`
   (`round/ic_vocal`) to join that group; a clipped card is already in its card set and a segment of a selector in
   its selector (drop those adds); 「behind a sheet」 is a per-screen `hide`, never a `drop`. A board whose Figma is
   newer than the PDF (`figma-frames.json`, e.g. MX and 1016 on 2026-10-28) is cut from a saved Figma screenshot
   (`get_screenshot` of the board → `extracted/figma/<board>.png`), never from the stale PDF. Figma access: the Design file through the qa-dm
   account's Dev seat; the PM and MX files need the qa1 account (qa-dm only has a View seat on PM). **PM and MX get the
   same inventory (user, 2026-10-28, REQ-052)**: every Figma file of the spec set is read, not only Design. Their
   phones and arrows lie loose in one page or frame, so their boards are **regions** (`__BOARDS__` entry `{ name,
   parent, box }`, named after the PDF board id: `pm-main-flow`, `mx-a-left`) or dated update frames named the same
   way (`{ id, name }`); only the current MX section is read (superseded versions stay out). Their PDF offset is
   the page bounds' top-left, negated (the PDF page is the page's bounds; OCR line positions read about 22 pt low, so
   check one sheet's boxes against the drawing) and kept in `figma-frames.json` `files.<role>`
   (`pdf`, `pdf_offset`); `inventory.ts` and `inventory-sheets.ts` use each file's own PDF and OCR. The PM file is
   heavy: its calls drop (「MCP server connection lost」) when run in parallel or when one call reads more than about
   300 component instances, so run its groups **one call at a time** and cut heavy frames and regions into smaller
   region boxes (2026-10-28: 37 calls of 1–13 phones each); `inventory.ts` joins arrows that cross a cut by geometry.
   Cut the PM / MX sheets from the OCR tiles (`inventory-sheets.ts --tiles --tag <name>`: seconds instead of a page
   replay of minutes per row). On every analysis
   list the PM and MX Figma pages too: a dated frame past the PDF (PM 10/22 on 2026-10-28) is spec content to read.
   Board images for the coverage page come from each file's PDF
   (`coverage-page.ts --render`, no Figma call; pdf point = figma point + `files.<key>.pdf.offset`).

## Coverage passes (user, 2026-10-21)

Reading board by board finds what is drawn; these passes find what the spec states but a reading skips. Run them on
the board notes before writing `requirements.md`, on every new table and every update. Each pass writes its own
requirements (cite the board as usual). A cell the spec defines becomes a requirement and gets a row; a cell the
spec is silent on becomes an Open question, never an invented case, except the user's QA rules (Stop notice, leave
and return, waits), which apply to every job.

1. **Flow arrows.** One requirement per arrow in `arrows.json` (`[DS: flow arrow <node> <Figma URL>]`). Each needs
   a row: its own, or an existing row that walks the edge, named on the requirement as `Walked by: TC-…`
   (`check.ts` accepts that as coverage). A forward edge does not cover its return edge.
2. **States per job.** List every job the feature runs (for AI Mini Drama: outline, characters, Create my character,
   chat revision, storyboard, scene image and Location, chat image update, Storyboard Preview, scene video,
   video regeneration, full video, captions, download/export) and fill a grid in `requirements.md` → `### Job
   states`: start/loading, success, failure (copy and refund), retry, second failure, partial success, Stop (notice
   and credits), leave and return, longest wait, done notice (toast, push). Each cell names the rows that check it or
   says `n/a (spec silent)` / `n/a (<reason>)`; `check.ts` fails an empty cell or a row ID that is not active.
   **Error classes (user, 2026-10-22, REQ-030):** a second grid `### Error classes` splits the failure column by the
   classes the spec names (4xxx, 5xxx, 6xxx, …): rows = jobs, each cell the rows that check that class's card copy,
   ⓘ, dialog and refund. A rule stated for one job's class (e.g. 「5xxx cards drop the ⓘ」) is checked on every job it
   names. (The scene-video 4xxx / 5xxx rows were missed until 10/22 because one failure column hid them.)
3. **Fields × rules.** List every input (idea, character description, scene description, scene-video description,
   rename, age, voice) and apply every rule the spec states for any input to all the inputs it names: limit and
   counter, paste, recover below the limit, required, each way to finish editing, discard on close.
4. **Numbers.** Every number the spec states (credits, durations, counts, sizes, percentages, line limits) gets a
   requirement that quotes it. Credit numbers are binding (see requirements.md format).
5. **Persistence and sessions.** For everything the feature saves (task, title, thumbnail, chat position, episode),
   check reopen, rename, same and new session, reinstall and next episode, as far as the spec states them.
6. **MX flows.** Tiers, daily chats, charge cards, first-use credits, free trial, discount. The MX file is part of
   the spec set (Design, then MX, then PM).
7. **PM-only features (user, 2026-10-21).** A feature, state or rule the newest PM spec states but the Design spec
   does not draw still becomes requirements and rows now, written from the PM spec: source tag `[PM:<board>]`,
   Notes 「PM-only: no Design frame yet (Design <date>)」. Never skip one or hold it back as a question. When a later
   Design spec draws it, the update modifies those rows to the Design version (Change `modified`, reason "Design
   now draws it") or removes them if the Design leaves the feature out on purpose (an explicit removal note, not
   mere absence). Each update re-checks every PM-only row against the new Design.
   **Design and PM disagree (user, 2026-10-22):** use whichever is **newer** when the dates tell (a dated update
   board, a "1005_Update" label, a "10/16 update" note): e.g. PM 10/16 three video models beat the older Design frame,
   and the Design 1005 "Exceed word limit" frame beats PM §13.11 of 10/2. Write the row from the newer source and put
   the other one in Notes; re-check it at every update of either spec. When the dates can't tell which is newer,
   write the row from the Design (default), mark it 「check on device」 in Notes, check the app's behaviour in the next
   run, and decide with the user before filing anything on it.
   **A Design frame older than the newest PM spec file (user, 2026-10-22, REQ-029):** where it conflicts with that PM
   file, the PM governs, even when the PM board itself carries an older date (Design 1016 「Chat navigation」 lost to
   PM Spec 20261021). What such a frame adds and the PM does not contradict (another exit, a landing page) still
   becomes rows; where the PM says nothing, the newest Design frame beats an older Design frame. Earlier answers
   decided by board dates (Q-12, REQ-028) stand until the user re-decides them.
8. **Exits × stages (user, 2026-10-22, REQ-030).** List every way out of the chat the spec names (Back, system back
   on Android, History, New chat, the credit pill, a sheet's X / Cancel) and every stage (empty chat, outline
   generating, saved with nothing generating, each short job generating, video generating). Fill `### Exit × stage`
   in `requirements.md`: each cell names the rows that check the dialog (or its absence), what Stay / Keep Generating
   does and the page Leave anyway opens, or `n/a (<reason>)`. A rule stated for one exit (「Back during generation
   asks first」) applies to every exit the spec says is equivalent (Design 1016: 「任何階段都適用」). `check.ts` fails an
   empty cell or an inactive row.

9. **Hidden clauses (user, 2026-10-22, REQ-032).** A requirement can hold a clause the screen does not show: what is
   sent or uploaded ("only the cropped image is sent"), what does or does not run ("STT is not run", "reruns only
   the failed segments"), where a value comes from ("remote-configured (Firebase)"), what is kept on the device,
   what is charged or refunded per item. A row that checks only the visible half leaves the clause untested (TC-097
   checked 「No captions」 but not "STT not run"). Fill `### Hidden clauses` in `requirements.md`: one line per such
   requirement with the clause, how a tester observes it (the app log after a log pull, the credit ledger, the
   files a log pull brings back, a reinstall, RD changing a server value) and the rows that check it that way.
   Write the evidence into the row's Action or Expected Result; park the row (`needs` + `unavailable`) when nothing
   on the phone shows it. `check.ts` lists every requirement whose text matches the hidden-clause words and fails one
   missing from the grid.
10. **Variants (user, 2026-10-22, REQ-032).** A rule the spec states for several tiers, models, languages or other
   variants gets a row per variant (Free / Pro / Pro+; Best / Standard / Fast; ENU / CHT / JPN). One "any tier" row
   does not cover them (TC-218 stood for three tiers). Fill `### Variants`: one line per requirement × variant with
   its rows. `check.ts` fails a requirement naming two or more tiers, or "each tier / model / language", that lacks a
   line per variant.

11. **Every control (user, 2026-10-28, REQ-038).** After the rows are written, run `node scripts/controls.ts <feature>
   <platform> --draft <id>`: it lists every control group of `inventory.json` for the platform in
   `<draft>/control-trace.json` and fills what the table already shows (`how: arrow` = the control starts an arrow
   whose requirement has rows; `how: label` = a row's Action quotes its label). Trace every other entry: `press` =
   the rows that tap it (one press per group: one copy of a repeated button, one choice of a set), else add a row (or a step to the row that
   reaches that screen) and name it, or `n/a: <why>` (not tappable in the app, decorative, other platform's frame).
   An **input** also needs `dismiss`: the row that closes its keyboard (Done, return, tap outside, `device.ts
   hidekb`), so no run leaves a keyboard over the next step. Check the auto traces too: a label match can name a row
   that only mentions the text. `check.ts` fails a draft with an untraced control, an input without a dismiss row,
   or a trace naming a row that is not active; Save copies the trace to the table. `app` lists the app's
   accessibility ids or labels for an entry whose Figma label differs (e.g. `creditsHomePage.UIButton.detail`), so a
   tap on it matches first; fill it from the page's "Taps that matched no control".

## Standing inputs (user, 2026-10-21)

Read these on every new or updated draft, even when the spec set has not changed.

1. **Request ledger** `library/<feature>/requests.md`: every request from the user, a colleague, a reviewer or RD
   (ID, date, from, request, kind `table` / `run` / `analysis`, platform `ios` / `android` / `both`, status). When
   the user asks for coverage, a check or a run rule for a feature, add an entry there in the same session (dated,
   next ID). Re-apply every open `table` entry: its requirements cite the entry (`[Req: REQ-…]`) and the
   `### Request ledger coverage` table in `requirements.md` lists entry → requirements. `check.ts` fails a draft that
   leaves an open table entry for its platform uncited. `run` entries go to the run rules and `phases.json`;
   `analysis` entries change this skill.
2. **Tickets** (rule 3 below).
3. **Build notes.** Read the RD Note on the Testing Request of the build to be tested (「驗證重點 (QA)」 and similar
   "what changed / what to verify" lists; `ecl_query.py` or the TR page). Each point becomes a row in a `Build checks`
   section citing `[Build: <TRCode> RD Note (<build>)]`, unless a row already checks it (then add it to that row).
   A build check retires after it passes on two builds, unless the spec also states it.
4. **Template roster** (rule 6 below), including the category header icons.
5. **Run findings.** An observation (O-n) or a filed bug from an earlier run that no row would have caught gets a
   row in the next draft.

## Spec agent comparison (only when the user asks; user, 2026-10-27, REQ-036 / REQ-037; replaces REQ-031)

A report for the manager, never a step of the analysis and never a source of rows. Run it only when the user asks
for the comparison, on an approved table or a draft.

1. `node scripts/spec-agent-gaps.ts <feature> <platform> --draft <id>` (settings in `library/<feature>/spec-agent.json`)
   lists the spec agent cases the newest `comparisons/<date>_casebook-vs-spec-agent.mapping.json` does not mark
   covered, with each case's source (`spec` = a PM, Design, Figma or MX file; `request`; `build` = an RD note;
   `casebook`; `other`). It reads the committed snapshot `library/<feature>/spec-agent/<platform>.json`; when a clone
   of the spec agent repo is at the configured path (`~/Desktop/Spec Agent`), it first fetches it, reads
   `origin/main` with git only (never its working tree) and refreshes the snapshot (`--snapshot` skips the clone,
   `--refresh` only refreshes the snapshot).
2. Map each listed case to the casebook in the new mapping (`covered TC-…`, `older spec`, `stated differently`
   (pass 7), `not from the spec`, `not covered`) and save it next to the old one.
3. Build the comparison page `comparisons/<date>_casebook-vs-spec-agent.html`: coverage counts both ways, the cases
   only the casebook has, and every spec agent case it does not cover with the reason. Publish it when the user asks.
4. The report only describes; it adds no rows. Changes to the table come from the analysis (*What this repo is for*)
   or from a request in the ledger.

## Value check (user, 2026-10-21)

After the passes and inputs, before writing rows. List everything left out in `update-plan.md` → "Not added", one
line each with the reason, so the reviewer can overrule it.

1. **Merge** rows that check the same thing: a regression ticket that repeats a case, including a case added in the
   same draft (fold the ticket into that case's Notes). Never merge the variants of a spec rule (pass 10): each tier,
   model or language the spec names keeps its own row.
2. **Drop** characterizations (record what happens, no expected result) and server behavior a tester cannot see in
   the app, unless the spec states it: a stated server rule (which segments a retry reruns, what was uploaded) is a
   row checked through the app log, parked when no log shows it (pass 9).
3. **Retire** build checks that passed on two builds and regression rows whose ticket is closed (mark them
   `removed` with the reason).
4. **Park, don't drop,** rows that need a fixture the run cannot provide (purchase, new account, finite chat limit,
   failure fixture, microphone): keep them, tag their `needs` in `phases.json` with the reason under `unavailable`,
   so runs record them Blocked without spending time. Money and quota rows matter even when they can't run yet.
5. Requirements from a spec set that is no longer current (older PM frames the newest set does not contain) are not
   added; note them under "Not added".

## Coverage and verdict rules (adopted from the spec agent, 2026-10-19)

The user asked to adopt these ten rules from the Codex spec agent (its `docs/mobile-team/`, copied here). They
widen what a table must cover and how a run is judged. Since 2026-10-21 the coverage passes and standing inputs
above produce their rows during the analysis (rules 1, 2 and 5 are passes; rules 3, 6, 7 and 8 come in through the
inputs and the ledger); the rules below stay the reference for what each must contain. The table stays a plain CSV: add rows and requirements, not
contracts or claim files. Each added row still needs a `Spec Ref` in `requirements.md`; a rule-derived requirement
cites its rule (e.g. `[Rule 2: wait thresholds]`), a flow arrow cites its Figma node.

1. **Flow arrows.** Add one row per directed edge drawn on the Figma flow boards, including back, cancel, close, error
   and return edges. A forward path does not cover its return edge. Cite the arrow's Figma node
   (`…?node-id=2811-90145`). The spec agent's `ARROW-*` cases list the AI Mini Drama edges with node IDs.
2. **Per-stage interruption matrix.** For every long-running stage (outline, character, chat revision, storyboard,
   video, export/save) cover: Stop explains what stops and the credit consequence; leaving and returning keeps a
   recognizable, usable task with nothing silently lost; and the user's wait thresholds. A wait with no other useful
   action longer than **5 s with no animation** or **10 s with an animation** is a bug.
3. **Regression rows from past tickets.** Before each run, pull the feature's open and resolved-but-not-closed eBugs
   on the platform (`ecl_query.py bugs --product … --text "<feature>"`, every source tag) and add one recheck row per
   ticket. Expected Result is the ticket's Expect Result; the Notes column names the BugCode. Where a ticket's
   expectation conflicts with the Design spec, say so in Notes; Design wins. A resolved ticket that still
   reproduces is a reopen, not a new bug. A ticket that repeats a case is folded into that case's Notes (also a
   case added in the same draft); a regression row retires (`removed`) once its ticket is closed.
4. **Results and dispositions.** Results are Pass, Fail, Blocked, Inconclusive and Not run. Every Fail and Blocked
   carries a disposition (`run-log.ts set … --as <d>`): `defect`, `spec-addition` (runtime behavior no spec covers →
   ask PM/Design to add it), `question` (spec covers it but is unclear → queued, asked only after the full run),
   `observability` (can't be observed or forced → ask RD for a diagnostic or fixture) or `test-data` (fixture,
   account or device state this run can't provide). **Missing required behavior is a Fail**, never Blocked; checks
   that depend on it are Blocked with disposition `defect` and name the failing case. Inconclusive goes to a
   recovery queue and is re-run; it never counts as a pass. Keep these dispositions separate in eBug drafts too.
5. **Account tier and quota setup.** Switch the app tier through Launcher › Pink › ☰ › [0] IAP › Status
   (Follow account / Free / Pro / Pro+), verify it in Mine, and restore the previous value after the tier group; no
   purchase or extra account is needed. Daily chat limits are server-configured (the spec agent's MX source gives
   10 / 30 / 100 as examples; Android: Free 10, Pro 100). While the Developer Server limit is 9999, quota cases are
   recorded as accepted assumptions, not passes. First-use credits and trial banners need a fresh install.
6. **Complete template catalog.** Freeze the full template roster for the build, server and locale (every category,
   every lazy-loaded page, duplicate names by position). Per the user's 2026-10-15 rule each template gets its own
   journey through a playable final video. Freeze the roster on the device into the draft folder
   (`template-roster-<date>.json`: category, position, slug, name, count, build, server, locale) and give every
   template its own rows in the table (user rule, 2026-10-19): one for the card, preview and Make my version, one
   for the full journey to a playable video with the credits charged per stage. Never sample templates. If the
   roster on the device differs at run time, report it and re-freeze before running the template rows.
   Template journeys use Seedance 2.0 and generate the full episode (user, 2026-10-19). Run the template rows
   last; before each journey, if the balance is below one journey's cost (about 300 credits), stop the template
   rows, mark the rest Not run and list them in the run report. Never buy credits to continue.
   **AI Mini Drama, 2026-10-21 (REQ-019):** the template journey rows stay in the table but are recorded Blocked
   (`needs: full-generation`, listed under `unavailable` in `phases.json`): the user was asked not to run that many
   full generations. Card rows (cover, preview, Make my version, format card) still run.
7. **Text and generated content.** Scan every page and state for spelling, grammar and punctuation in ENU, CHT and JPN.
   Check generated storyboard text for the requested language, empty fields, duplicated lines, garbled characters
   and English quote marks in English output.
8. **Colleague directions.** Custom media: the reference preview shows the selected photo (allowing for an explicit
   crop). Required fields: omit each one separately and record the feedback. Keyboard and layout: entered text never
   overlaps adjacent controls; finishing editing and proceeding works with the keyboard open or closed. Filters:
   compare facet values with the actual collection, including Southeast Asian and Mixed. Output reuse: save → reopen
   → reuse a generated asset in a new task.
9. **Evidence and order.** Capture baseline, trigger and result for each case; use Appium screen recording for audio,
   captions and motion. Order the run by state: first-use, coachmark and bubble checks before anything consumes them,
   then input → outline → character → storyboard → video → History, with destructive and reset cases last. A case
   that needs a fresh install says so in its Precondition. Don't cap generations below what the cases need.
10. **Dedupe and platforms.** Dedupe within the same product and platform; the same symptom on Android is a related
    ticket, not a duplicate. Keep separate iOS and Android tables. Android baseline: no Pink menu (find the Android
    debug controls), Pro instead of Pro+, Google Play billing instead of Apple, chat limits Free 10 / Pro 100.

## Running cases and filing eBugs

This repo carries its own copies of `ebug-draft-generator` and `ebug-tr-filer` (each starts with a casebook
overlay). When the user runs the approved table on a build and reports or asks to file failures, use them. Keep run
evidence in `library/<feature>/<platform>/runs/<date>/` and filing material in
`library/<feature>/<platform>/ebugs/<date>/`. A failure that shows the table itself is wrong (spec changed, case
mis-written) is a table change: open a draft and send it through review instead of filing it.

### On-device run (real iPhone through Appium + WebDriverAgent)

**What the phone needs** (account, build, photos for the upload cases, settings) is listed per table in
`library/<feature>/<platform>/fixtures.md`, because none of it can be committed. Check it before the first segment;
when a new row needs a new photo or account state, add it there in the same draft.

**Tap log and coverage proof (user, 2026-10-28, REQ-038).** Every press through `device.ts` (`tap`, `hold`, `burst`,
`id`, `lbl`, `tapif`, `clear`, `setval`) is logged to `<run dir>/taps.jsonl` with the element hit, a small screenshot
taken just before the press (`screenshots/taps/`, local only) and the window size; `hidekb` and `type` are logged as
input events. Start each case with `device.ts <run dir> case <ID>` (one cheap call, or the first line of its recipe)
so the log names it; without it `coverage-page.ts` assigns a tap to the next case recorded in results.csv. A tap is
matched to a control group by score (`lib/coverage.ts`, REQ-040): `app` id, label (normalised; truncated labels
count), icon/id words (`round/ic_xmark` ↔ close, `ic_history_n` ↔ history), position mapped from the 375-pt frame to
the phone scaled or anchored to each edge, element type, and whether the case running presses it; 0.60 assigns it,
a near tie is flagged, and a tie on position alone is left unmatched for review. A control tapped with no row naming
it still counts as pressed and is flagged so the analysis adds the row. Each run
aims to press every control of `control-trace.json`, not only the ones a failing area needs. At every phase wrap-up
(and on request) build `node scripts/coverage-page.ts <feature> <platform> [--draft <id>] --runs <this run's folders>`
(self-contained: board images and the best tap screenshots are embedded, so it opens anywhere; local only; `--serve
[port] --lan` keeps it live on the local network, default port 4391, rebuilt at most every 30 s; no auth): counts of
controls pressed / inputs dismissed / arrows walked, the Figma boards with each control and arrow coloured by status,
the tap screenshots with the tap point as proof, and the list of what is still not covered. Report the counts in the
phase report.

**Phases, segments and resuming (user, 2026-10-19).** A large table runs in phases, never as one long run. The draft
folder's `phases.json` (written by its builder) splits every row into exactly one phase and one segment:
P1 Core (original cases, interruption and waits, credits and limits), P2 Regression (tickets without a matching core
case; tickets that repeat a core case are folded into that case's Notes), P3 Flow arrows, text and colleague
directions, P4 Templates. Each phase is its own run folder `runs/<YYYY-MM-DD>-<p1-core|p2-regression|p3-flows|p4-templates>/`
with its own report and eBug drafts; filing still waits for the user, and the next phase starts without waiting.
Phases whose cases need the same journey stages may be **merged** (user, 2026-10-20: P2 and P3 run together as `P23`,
ordered by stage so each drama is walked once): the merged phase lists its own segments plus `origin` (each case's
own phase, kept in results.csv's Phase column and split out in the report), the original phases carry `merged_into`
(`run-log init` refuses them), and it runs in one folder, e.g. `runs/<date>-p23-regression-flows/`.
- **Rounds (user, 2026-10-22, REQ-033 / REQ-034).** Rows added or changed by a draft never run only as an appended
  phase: the next round's phase lists them in the stage segments where they belong. A round phase carries
  `"round": true` and `origin` (each row's earlier phase; `P9` style ID for rows new in that draft); `plan-page.ts`
  then shows only results, time and tokens from that phase's own run folder, so a re-run row never shows its old
  result. Phases that never ran get `merged_into` the round. A **full run** (AI Mini Drama round 3 = P9) lists every
  row, by journey stage (regression and flow rows keep the stage their merged phase gave them, templates run after
  everything but the fresh-install cases), in segments of at most 40; record the usage snapshots and the time and
  token summary below at every segment, so the round reports actual execution time and tokens.
- **Needs, policy blocks and the gate (user, 2026-10-20).** `phases.json` tags cases with `needs` (`video`,
  `purchase`, `low-balance`, `new-account`, `chat-count`, `voice`, `system-setting`, `app-language`) and lists the
  needs this run cannot meet under `unavailable` with the reason. `run-log init` records those cases Blocked
  (test-data) at once, so nobody walks to them; a reason that starts with a disposition (`"observability: no fault
  switch makes STT fail"`) records that disposition instead. Delete a line from `unavailable` when the user provides
  the fixture or allows the setting for the run. When a phase has cases that need `video`, its **first** step after setup is the
  preflight: one template drama straight to a Seedance 2.0 preview (`waitfor` with the success and failure texts),
  then `run-log.ts <run dir> gate video pass|fail "<time, duration, log cause>"`. A fail records every video case
  Blocked (defect, "Gate video failed …", retest queue) so no segment spends 6-minute attempts on it; keep the
  preflight drama for the storyboard and video segments. `run-log.ts <run dir> retest` lists the queue. Timing and
  wait-rule cases ride on the generations other cases already start: record the seconds `waitfor` prints instead of
  starting a generation just to time it.
- **Segments are the context breaks.** A segment is about 10–40 cases sharing one area and usually one drama. Finish
  the segment (every case recorded, including Blocked/Inconclusive), `pull-logs` and `log-slice` (rule 7) and add
  the log causes to the results, then
  `run-log.ts <run dir> checkpoint "<state>"`. The state text holds what the files don't: Pink toggles currently on,
  tier, Unlimited daily chat on/off, the drama in use (History title) and its stage, credit balance and the time it
  was read, last log pull, anything half-done. Then the segment's context ends and the next segment starts in a
  fresh one (next item). Always also break at a phase boundary.
- **Keep going without asking, each segment in a clean context — all in one chat (user, 2026-10-19/20).** Fresh
  contexts keep usage down and thinking clear, so a segment never continues in a context that already ran another one.
  A chat cannot clear its own context, but a subagent always starts with a clean one, so the chat the user talks to is
  the orchestrator and runs every segment as a subagent, one at a time: for each segment it calls the Agent tool
  (Codex: spawns one new native subagent per segment and closes it after its reply; general-purpose; wait for it to finish, in the foreground or through its completion notice, before the next) with
  the one-line brief "Resume casebook run
  <run dir> (or start phase <Pn>) per <RUN-PLAN>: read the plan, run-state.md and `run-log.ts <run dir> next`;
  follow the pdr-spec-casebook skill; do exactly one segment, then pull and slice the logs, checkpoint, update the
  plan's Status and Log, and reply with at most 10 lines: tally, next case, blockers." At a phase's last segment the
  brief adds the phase wrap-up (summary, `time`, tokens, eBug drafts and review page, report.md). The orchestrator
  reads only that reply (never the subagent's screenshots or logs), decides the next brief from `run-log next` and
  phases.json, and repeats until every phase in the plan is done; never ask the user between segments. Its own
  context grows only by the short replies; if it is ever compacted or restarted it resumes from `run-log next`.
  A phase not yet released carries `hold` in phases.json (`run-log init` refuses it; the orchestrator releases it
  with `CASEBOOK_RELEASE_HOLD=1` in the brief). Stop only for an explicit user stop, a filing/purchase/password
  boundary, or a blocker that stops every remaining case; a subagent that hits one stops and says so in its reply.
  Fallback when subagents are not available: one worker session that the orchestrator clears (`clear_session`) and
  re-briefs after each segment (a session cannot start another session from a turn that another session's event
  began, but it can clear and message one it already started). When neither subagents nor session tools are
  available, never run the next segment in the same chat: after the segment's
  checkpoint, stop and ask the user to open a new chat for the next segment, with the one-line brief above to paste
  (user, 2026-10-27).
- **Resuming** (after a reset, a usage-limit stop or a crash) starts with `device.ts <run dir> status` and
  `run-log.ts <run dir> next`, then a screenshot to confirm the phone matches the last checkpoint. Never redo recorded
  cases; Inconclusive ones are re-run from the recovery queue at the end of their segment.
- **Fresh-install cases (user, 2026-10-19).** A case whose expected result depends on a first launch or empty local
  data (first-time hints and bubbles, empty History, on-device counters, first-use offers) does its own fresh install
  as the first step of the case: its Precondition starts with 「Fresh install (part of this case)」. Every such case
  reinstalls again, even when the previous case just did, so each starts from the same state. Put them in their
  phase's last segment (`Fresh install`) so the reinstall never wipes state other cases still need. Each reinstall:
  uninstall, install the build under test, check the installed build number matches the run's build (a different
  build makes the case Blocked `--as test-data` with both numbers), restore Developer Server, sign in, set the
  tier, turn on Log stage timings and Write Log, then screenshot the Launcher. A reinstall needs no extra approval
  inside a requested run (standing setup authorization) but never runs outside a requested run. Note anything the
  reinstall removed (local History, Pink toggles) in the checkpoint. The setup is one command (pull the logs first):
  `app-setup.ts <run dir> fresh <version> <build> [--tier Free|Pro|Pro+|System]`.
- **Setup tools** (`scripts/app-setup.ts <run dir> …`, adapted 2026-10-19 from the user's AT_PDRi suite at
  `~/Desktop/PDRA AT QE/AT_PDRi`; never run that suite itself, it can buy credits and consume generations):
  `build` (installed version and build), `reinstall <version> <build>` (uninstall, install that exact build from
  TestFlight › Previous Builds, verify it, open the app; `--check-only` just confirms TestFlight still offers it),
  `first-launch` (TestFlight build notes, tracking → Ask App Not to Track, GDPR Get Started, photo access, IAP close,
  notifications, until the Launcher), `server` (Launcher backend label), `credits` (balance), `claim-daily` (free
  complimentary daily credits), `topup --confirm` (sandbox 2000 pack; taps Purchase only when Apple's sheet says
  「You will not be charged」, needs the user's go-ahead for the run, and stops at a password prompt for the user to
  enter it on the phone — never type a password), `devserver` (⋯ debug page: Write Log ON, 「Use developer server:」 ON,
  「Server Changed」 › OK, relaunch, intro pages, Launcher label check), `fresh <version> <build> [--tier …]`
  (reinstall › first-launch › devserver › Pink Log stage timings ON › tier › Launcher screenshot). A run's first
  step is `build` and `reinstall … --check-only` to record whether a newer build exists in TestFlight; which build
  to test is the user's call.
- **Live run plan (user, 2026-10-20).** `node scripts/plan-page.ts <feature> <platform> <draft id> <RUN-PLAN.md> --serve`
  serves http://127.0.0.1:4390/, rebuilt from phases.json, every run folder's results.csv and run-state.md and the plan's
  Log on each request; the page polls every 10 s, so each `run-log.ts set` appears live with no extra worker step. It is
  a local process like the review server: start it once per run, never stop it unless asked. **The page leads with
  the current run (user, 2026-10-22):** header totals, next case, the phases, their time and usage table, checkpoints
  and the Log cover only the current run (`phases.json` → `"current": [ids]` when set, else the newest `"round": true`
  phase and every phase after it, else all phases); earlier runs follow under 「Earlier runs」, in the order they ran (first
  segment on top), with their own time and usage table and their phases collapsed. When a new draft or plan takes over, restart the server on it
  (`plan-page.ts <feature> <platform> <new draft> <new plan> --serve`) so its run is the one at the top. An English / 中文
  toggle (user, 2026-10-27) switches everything the page writes itself (labels, states, result names, table headings,
  the usage notes) and is remembered per browser; run data (actions, notes, results text, log) stays as written. A new
  label or note in `plan-page.tpl` gets its Chinese too (`tx(en, zh)` in the script, `data-zh` on fixed HTML). Without `--serve` the
  script writes the static `runs/plan.html` (data inline, no fetch or polling: for publishing as an artifact). **Why
  cases are Blocked (user, 2026-10-27):** a panel under the header groups the current run's Blocked cases by category
  (defect / test-data / observability), then by reason (an unavailable need from `phases.json`, a failed gate, an
  earlier step that failed, other), with case IDs per segment and what clears each category; each Blocked row names
  its reason. When a reason can't be read from the result text, the segment or phase wrap-up adds the case to the run
  folder's `blocked-reasons.json` (`{ "<case>": { "group": "need:<n>" | "gate:<n>" | "upstream", "label": "<own
  group>", "note": "<short why>" } }`, every field optional) so no case sits in "other". It
  binds 127.0.0.1; `--lan` binds 0.0.0.0 and prints the LAN URLs (no auth: only when the user asks). It also shows
  wall / test / idle time, Claude tokens and plan usage per phase, segment, wrap-up and round (consecutive phases on
  one seat size), as % of a 1× Pro user's limits. The main figure is "est. from token rate": the row's weighted
  tokens (input 1, cache write 1.25, cache read 0.1, output 5) × a rate calibrated in `runs/usage-calibration.json`
  (`{ "basis": "P1", "fiveHourPct": 300, "seat": 1, "source": "…", "weekPerFiveHour": null }`; rate = fiveHourPct
  × seat ÷ the basis phase's weighted tokens; user, 2026-10-21: P1 ≈ three 1× Pro 5-hour windows), plus "= N% of an
  N× seat" for rows on a Team seat (6.25× in round 2, 1.25× from round 3). Weekly (rough) = that × weekPerFiveHour, or when null × the weekly ÷ 5-hour
  ratio of the latest seat's paired readings (consecutive snapshots that both carry a 5-hour and a weekly value in the
  same windows; 10/22: counting a new account's first reading, 95% weekly from other work, made the ratio 1.70). "Account total (shared)" (snapshot increments while the run was active,
  Pro-% = plan-% × the snapshot's seat size) stays as a muted upper bound: other users of a shared account (another
  machine, claude.ai, the apps) are invisible to the transcripts, so neither it nor a token-ratio share can isolate
  the run. The page notes the calibration source, the same-model assumption and each round's output tokens per
  message against the basis (low recorded output means that round is underestimated).
- **Time and token summary (user, 2026-10-19).** device.ts, app-setup.ts and run-log.ts stamp every command into
  `<run dir>/activity.log`. `run-log.ts <run dir> time [--cases]` reports wall time, test time and idle gaps (no
  activity for over 15 minutes, e.g. a usage-limit wait), per segment and per case. `token-usage.ts --since <run
  start> <transcript.jsonl …>` sums Claude tokens (input, cache write, cache read, output) from every session
  transcript the run used (`~/.claude/projects/<project>/<session>.jsonl` plus that session's
  `<session>/subagents/*.jsonl`, where segment subagents write; include handed-off sessions). Plan limits are only
  reported as percentUsed, so at each segment start and end the orchestrator reads the app's usage card and runs
  `node scripts/usage-log.ts <runs dir> <5-hour %> <5-hour resetsAt> <weekly %> <weekly resetsAt> [note]` (`-` for an
  unknown value, `--at <ISO>` to backfill, "approximate" in the note when estimated, `--seat N` = the account's seat
  size in Pro units, stored as `proMultiplier`: Team seat 6.25 (round 2) or 1.25 (round 3, from 2026-10-22), Pro 1; default the previous snapshot's; never guess
  it) → `runs/usage.jsonl`. When a run moves to another account, log an account marker (all four values `-`, the new
  `--seat`, at the switch time). The plan page sums positive increments per window (new resetsAt, a drop or a seat
  change = new window from 0; a 100% stop with no reset time = one full window) and splits each between the
  overlapping phases by their tokens. Put time, tokens and these percentages in
  each phase report.
- **Everything stays in the run folder:** `results.csv`, `run-state.md`, `observations.md`, `screenshots/`,
  `logs/<case ID>-<YYYYMMDD-HHMMSS>/` (pulled app logs, git-ignored) and `ledger/<case ID>-<time>.json` (credit ledger
  reads). Nothing goes to ~/Downloads, AirDrop or a share target.

1. `node scripts/device.ts <run dir> status` — reuse a live session; `start <udid>` only if none. Never stop Appium;
   WDA is restarted only through `device.ts restart`. Taps are in points (screenshot pixels ÷ 3 on the 3× phones).
   **Keeping WDA alive (user, 2026-10-27).** P9 lost its last segment on 10/23 09:57: the one WDA process had served
   18.5 hours (~22,000 element searches, ~4,400 page sources), died on the phone mid-poll, the phone then auto-locked,
   and every relaunch failed (xcodebuild code 70 「may need to be unlocked…preparation errors」) until the user came
   back; by 10/27 the phone also no longer trusted the developer certificate (code 65). So:
   - **Before a run** the user sets the iPhone's Auto-Lock to Never (Settings › Display & Brightness) and keeps it on
     the USB cable (a system setting: the user does it); the run plan's setup records it.
   - **Every segment starts with `device.ts <run dir> restart`**: it ends the session, stops this phone's xcodebuild
     and launches a fresh WDA, then brings PowerDirector back to the front, so no WDA serves more than one segment.
     `status` prints how long WDA has been up. Never use `useNewWDA` or uninstall WDA: removing the last app signed by
     the QA certificate drops the phone's trust in it.
   - `device.ts` recovers by itself once per command when WDA vanishes (socket hang up, connection refused, dead
     session): restart, re-activate PowerDirector, retry. When WDA cannot launch it prints `BLOCKER (device): …`
     with the fix (unlock and replug, or trust the certificate) and exits 75. A segment subagent that gets exit 75
     stops and puts the BLOCKER line in its reply; the orchestrator then sends the user a push notification with that
     line (they are usually away) and waits, rather than letting the run sit unnoticed.
   - `start` launches the WDA already installed on the phone (`usePreinstalledWDA`: devicectl with
     terminate-existing, so every new session is a fresh WDA process, no xcodebuild). Appium uninstalls WDA after a
     failed xcodebuild launch, and with it the certificate's entry under VPN & Device Management, so the user could not
     trust it (10/27); the preinstalled mode never uninstalls. If WDA is missing from the phone:
     `device.ts <dir> install-wda` (the newest `WebDriverAgentRunner-Runner.app` in Xcode's DerivedData, signed by the
     QA team LR55RBG94F), then the user trusts the certificate once. The signing caps (`xcodeOrgId` LR55RBG94F,
     `Apple Development`, bundle `com.cyberlinkqa1-4.WebDriverAgentRunner`, as the AT_PDRi suite uses) stay set for the
     xcodebuild mode (`PDR_WDA_PREINSTALLED=0`). Point `APPIUM_LOG` at the Appium server's log so the BLOCKER names
     the exact cause.
   - **Device troubleshooting is not run time (user, 2026-10-27).** Debug WDA or the phone in a separate folder
     (`runs/_wda-debug-<date>/`, no results.csv, so the live plan page ignores it), never in a phase's run folder:
     every `device.ts` call stamps that folder's `activity.log`, and its windows decide which tokens and time count as
     the run's. Commands that slipped into a run folder are moved out (10/27: four debug calls moved from P9).
2. `node scripts/run-log.ts <run dir> init <cases.csv> --phase <draft>/phases.json <phase id, e.g. P1, P23>`, then record every case as it is exercised:
   `set <ID> <Pass|Fail|Blocked|Inconclusive|Not run> "<what was seen>" [--as <disposition>] screenshots/<file>.png …`
   (rule 4). Quote on-screen strings exactly. `summary` shows the tally; the run is complete only at 0 Not run and
   an empty Inconclusive queue.
3. Useful device commands: `shot`, `els [filter]`, `source`, `logs [ID]`, `ledger [ID]`, `tap`, `hold`, `drag`, `id`, `lbl`, `type`,
   `pinch X Y FROM TO [ms]` (two-finger zoom, e.g. Crop), `setval <id> <text>` (fast long input, e.g. 1,050 characters), `clear <id>`, `hidekb`, `burst X Y [n]`
   (rapid taps), `scrollto "<exact name>" [X TOP BOTTOM]`. Setting the clipboard is not possible on a real device, so
   paste cases are typed instead and the result says so.
   **Scripts over hand-driving (user, 2026-10-20).** Every tool call re-reads the whole context, so round trips are
   what cost tokens (P1: 4,731 device commands, 2,208 of them `els`). Use:
   - `waitfor "<success>|<failure>|…" [--timeout S]` for every wait on a generation or a screen change, never a run of
     `els` calls; it prints once, with the elapsed seconds.
   - `pink open "[z] AI Mini Drama"`, `pink set "<row>" on|off|<option>`, `pink tap "<row>"`, `pink show`, `pink close`,
     `pink tier Free|Pro|Pro+|System`: one call each instead of drag/els/tap rounds; set and tier read the row back and
     save a screenshot (`pink show` lists every row for the checkpoint).
   - `do <recipe.steps> [args]` or `do "cmd ;; cmd ;; …"`: several commands as one call, stopping at the first failure
     with a screenshot. When a sequence comes up a second time (open a template, walk a drama to the characters stage,
     pick library characters, open the video card), save it as `library/<feature>/<platform>/recipes/<name>.steps`
     (one device.ts command per line, `$1`… for arguments, `?` before a line that may fail, a comment saying where it
     starts and ends) and replay it. Use ids and labels in recipes, coordinates only where nothing else exists.
   - `tapif TEXT` for optional dialogs (「Allow」, intro pages).
   - `launch --lang en|zh-Hant|ja` runs the app in another language through launch arguments (no iOS Settings change;
     a plain `launch` returns to the device language); `appearance light|dark` switches Light/Dark mode (restore dark).
   Lookups: prefer accessibility ids and iOS predicates without `visible == 1` — that clause makes WDA compute
   visibility for the whole tree (~4 s a query on the QA iPhone against ~0.6 s), so check the frame instead.
   Status (2026-10-20, tested on the phone): `waitfor`, `do`, `expect`, `tapif`, `pink open/show/set/close` work;
   `pink set` takes ~25 s, `pink show` ~2.5 min. `pink tier` works but takes ~6 min (the IAP 「status」 row sits under
   the panel title and is searched slowly — fix pending). `launch --lang ja` works (P23-a); plain `launch` relaunches without arguments since 10/20 19:14 (it used to only activate the app). `recipes/new-drama.steps` works since 10/20 19:21 (P23-b: setval instead of `type`, then waits for the result header and the character card). Not yet run: `devserver`, `fresh`,
   `appearance`. On first use watch the output; if a step fails, fix the script (or recipe)
   rather than driving around it, and note the fix in the checkpoint. Pink panel and bubble can be dragged: never
   start a drag on them (the commands find the panel's frame themselves).
   **Finding a row in a list (user, 2026-10-19):** always use `scrollto`, never a hand-written drag-and-grep loop. It
   matches the exact name/label of any element type (a Pink toggle row is a `Switch`, not only a `StaticText`), reads
   the frame from the source, steps half a viewport so no row is skipped, sweeps to both ends and exits 1 when the row
   is not there. Off-screen rows in the source carry stale frames from recycled cells (a Pink row showed y = −346
   while it was really further down), so never steer by an invisible element's position. After `scrollto` succeeds,
   screenshot before tapping, and after every tap that sets a value, read the value back (screenshot or `els`).
   Inside the Pink panel (use the `pink` commands; the panel moves, P1 had it at X 210, TOP 110, BOTTOM 300) taps below the band hit the Dismiss bar or the
   Launcher behind it, and picking an option in a value list pops back one level by itself (do not tap Back again).
4. Fault injection (PDR builds): on the Launcher scrolled to the top, `burst 267 95 10` reveals the Pink debug
   overlay; tap its bubble (37, 95) › ☰ tweaks › `[z] <feature>`. Record every toggle you change in the result
   text, and set them all back to Off before the run ends. Pink's simulated failures do not replace a real one:
   offline cases need real network loss.
   **Wi-Fi during a run (user, 2026-10-21, REQ-020):** offline cases may turn Wi-Fi off and on in Control Center or
   Settings, once the phone is confirmed on a USB cable (`xcrun devicectl device info details --device <udid>`
   shows transport type `wired`; a loopback proxy to the phone's Wi-Fi address is still Wi-Fi) and `device.ts <run dir>
   status` shows the live session. Turn it back on right after the case
   and confirm the app is online before the next case. Other system settings (Airplane mode, notifications,
   language) still need the user's go-ahead; cases that need them are Blocked `--as test-data` with that reason.
5. Keep off-case findings in `<run dir>/observations.md` (O-1, O-2 …, closest case, evidence).
6. Blocked needs an exact reason (missing fixture, upstream failure, account state). Never mark Pass on prior
   evidence.
7. **Logs (spec agent's Pink-menu reference, 2026-10-19; pull per segment, user 2026-10-19).** Setup, before the first
   test action: Pink › ☰ › `[z] AI Mini Drama` › **Log stage timings** ON (the AI Mini Drama logging switch; without
   it the `[AMDPerf]` stage timings are missing) and screenshot it on; on the Launcher's ⋯ debug page check General ›
   **Write Log** ON. Re-check both after any relaunch, reinstall or server change. The phone keeps the logs across
   launches with a time stamp on every line, so do not leave a journey to pull them per case. Pull once:
   - at the end of every segment, before its checkpoint, while nothing is generating;
   - before anything that wipes the app's data: a reinstall/uninstall (every fresh-install case), Delete Database;
   - before handing off to a new session or when the context is about to be compacted, if the segment isn't done.
   One command does it from any screen: `app-setup.ts <run dir> pull-logs <segment>` (back to the Launcher, ⋯ ›
   Send logs via..., pull into `logs/<segment>-<time>/`, Close the share sheet; never send logs to anyone). Then
   `log-slice.ts <run dir> <pull dir>` writes `by-case/<ID>.txt` per recorded case (failures, toasts, credit
   authorisations, stage timings in that case's time window) and prints a table; read the excerpts of every Fail,
   Blocked and Inconclusive case and of every charged action, and add the cause (`workflow step failed … error="…"`
   is the real failure behind a silent UI; `[AIDrama Toast]` lists every toast; `authorized, credit=N` is each charge)
   to that case's result before the checkpoint. Record each case right after doing it so its window is accurate. Cite
   the log file and lines in the eBug (excerpts only, after checking for tokens). Logs stay out of git. On the ⋯ page
   never tap Delete Database, Delete files in sandbox, Reset user default or Trigger Crash, and never capture the
   token rows.
8. **Refund check on every failure.** Read the credit pill right before the charged action, after the failure shows,
   and again after leaving and reopening the chat (the pill can be stale). Then open Mine › Credits › Details and run
   `device.ts <run dir> ledger <case ID>`: the charge rows (booked as Text to Image / Text to Speech / AI Video
   Generator) and a refund row 「Generation failed, credits returned +N」 must match. The logs show what was charged
   (`[AIDrama Permission] … authorized, credit=N`). The account is shared with other devices, so match rows by time
   and amount, never by balance difference alone. A failed item must cost nothing net; a partial failure costs only
   the items that succeeded. Record the balances and the matching ledger rows in the result. A missing refund, or one that differs from the spec, is a Fail `--as defect` with its
   own eBug, even when the failure itself is already filed.
9. **Always generate the video (user, 2026-10-19, until further notice).** Every journey that reaches the video
   settings card generates the video with Seedance 2.0 and then the full episode, even when the case under test
   ended earlier. Record whether each video finished, how long it took, its credits and any failed scenes (with
   logs). Template rows follow their own stop rule (rule 6); AI Mini Drama template journeys are Blocked (REQ-019).

### eBug drafts and review page

1. Write `ebugs/<date>/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md` with `ebug-draft-generator` rules: merge
   failed cases that share one defect, cite the case IDs on each entry's `Report step:` line, and map every
   failed case and observation in the reconciliation. A generator script for the batch can live in
   `ebugs/<date>/generators/`. **Reviewer rules (user, 2026-10-21; full text in both eBug overlays):** one action per
   numbered Repro step, no `>` / `›` chains (「Mine > Credits > Details」 is three steps); a `Spec Link:` on every
   entry — the Figma URL with `node-id` (the requirement's frame/flow-arrow node from `requirements.md`, else the
   `spec-set.json` `figma` URL with the board title), the PDF name + board ID only when no URL exists; at least one
   image on every entry, plus the log excerpt when the finding has a log cause (checked for tokens first), no video
   unless the user explicitly asks for one. **No `[UX]` (RD, 2026-10-21):** findings are `[AIAgent]` (Functional)
   or `[AIAgent][UI]`, owner RD, which forwards to PM when it wants a ruling; revert steps are in rule 5 of the eBug
   overlays.
2. `drafts_to_bodies.py … --out upload/bodies.json --stage upload/`, then `check_ebug_format.py` (0 errors) and
   `verify_ebug_drafts.py`. Avoid `{n}`-style placeholders in body text; they are read as attachments. The format
   check fails a `>` / `›` inside a Repro step, a missing or empty `Spec Link:`, an entry with no image, a video
   attachment without `--videos-requested`, and `[AIAgent][UX]`.
3. Dedupe with `ecl_query.py dedupe upload/bodies.json --product "PowerDirector Mobile for iOS"` and read each
   candidate with `ecl_query.py bug <code>`. Duplicates start on hold; a resolved ticket that still reproduces is
   a reopen, not a new bug.
4. Build the self-contained review page (ebug-tr-filer layout), publish it, give the link, and stop. Filing
   waits for the reviewer's Copy decisions, the account, the TRCode and the source tag. The page prefills Creator,
   TRCode, source tag and method from the newest filed batch (`node scripts/ebug-defaults.ts <feature> <platform>
   --json`, read by the batch's review generator), each marked 「from <batch> — confirm」 rather than left blank.
5. On the decisions: "Same build" / "Same TR" means the previous batch's TR when the build matches — read the TR
   header first and stop if it names another build. Save the decisions verbatim as `ebugs/<date>/decisions.md`
   (with any split or rewrite note), rewrite the entries, regenerate bodies, format check to 0 errors, dedupe again
   for any new entry, file (IF3: `ecl_if3.py create` then `upload`), read every bug back (Creator, severity, belong,
   TR, build, attachments on the page), write `filed_bugcodes.json` / `.md` (`ecl_if3.py export-filing`), rebuild the
   review page with the BugCodes, and add one line per batch to the run plan's Log. Comments on Rechecks tickets
   wait for the user's own decision.

## File formats

### requirements.md

```
# <Feature name> — requirements (<platform>)
Spec: <file names>

## <Section, in spec order>
- R-001 [<source: file, page / frame / heading>] <one testable statement, UI strings quoted exactly>
- R-002 [...] <statement> — NOT TESTABLE: <reason>   (server-only, analytics, legal text, etc.)

## Open questions
- Q-1 <ambiguity or conflict between spec files; which requirement IDs it affects>

## Added <date> — coverage passes and standing inputs      (or fold these into the sections above)
### Job states            one grid, rows = jobs, columns = states; cells = TC IDs or "n/a (<reason>)"
### Error classes         one grid, rows = jobs, columns = 4xxx / 5xxx / 6xxx …; same cell rules
### Exit × stage          one grid, rows = stages, columns = exits; same cell rules
### Hidden clauses        | Requirement | Hidden clause | Observed through | Rows |   (pass 9)
### Variants              | Requirement | Variant | Rows |   one line per variant (pass 10)
### Flow arrows walked by existing rows
- R-150 [DS: flow arrow <node> <Figma URL>] <from → to>: <expected>. Walked by: TC-033.
### Build checks
- R-160 [Build: <TRCode> RD Note (<build>); Req: REQ-021] <statement>
### Request ledger coverage
| Ledger entry | Requirements |      every open table entry of requests.md for this platform
```

Source tags: `[PM:<board>]`, `[DS:<board>]`, `[MX:<board>]` (board IDs in `specs/<date>/extracted/boards/`),
`[DS: flow arrow <node> <URL>]`, `[Req: REQ-…]` (request ledger), `[Build: <TRCode> …]` (RD build notes),
`[Rule n: …]` (coverage rules), `[DS:figma <label> <node>]` (a Figma-only frame). `check.ts` reads `Walked by:`,
the three grids, the ledger table, `arrows.json` and `figma-frames.json`, so keep those exact forms.

One requirement per observable behavior. Split compound sentences. Source priority (user rule, 2026-10-19): the
**Design spec outranks the PM spec**. When they disagree (copy, layout, prices, flow), the Design version is the
expected result; record the PM difference in the case Notes, not as a defect. Use the newest frame within the same
source. Only when Design is silent does the PM spec decide: a PM feature the Design does not draw yet is still a
case (coverage pass 7, PM-only), updated when the Design draws it. Exception (user, 2026-10-22): a dated PM change
newer than the Design frame wins, and a newer Design frame beats an older PM rule; when the dates can't tell, check
the device first, then decide (pass 7, "Design and PM disagree"). Keep each spec set's source order and Figma links in
`specs/<date>/spec-set.json` (`source_priority`, `figma`) and use those links on eBug `Spec Link:` lines.

Credit numbers (user rule, 2026-10-19): credit prices, counts, remaining balances and free-use counters
shown in the spec are binding. When the app differs, it is a Fail with disposition `defect`, not a non-binding
mock value. This holds until the user supplies a credit-usage source; that source then decides credit numbers.
The MX spec (credits, purchase, quota and free-trial flows) is part of the spec set, after Design and before PM.

### draft.csv / cases.csv

Columns, in order: `ID, Section, Precondition, Action, Expected Result, Priority, Spec Ref, Notes`.
Drafts add `Change` (`new` | `modified` | `removed` | `unchanged`) and `Change Reason`; the approved CSV never
has them. UTF-8 CSV; quote fields with commas, quotes or line breaks.

Writing rules (the table must be usable by a tester who has not read the spec):

- **English**, short imperative Action (`Tap 「Generate」 on the format card`), concrete observable Expected
  Result (`The outline appears within the chat with a "Possible Characters" list`). Quote UI strings exactly as
  the spec shows them, with 「」 or "".
- One check per row: one action (or a short numbered sequence for one outcome) and the outcome to verify.
  Put setup in Precondition, not in Action.
- Section = the spec's own feature area, in user-journey order (entry → main flow → edge cases → errors →
  settings / history). Rows are grouped by Section and follow the user journey inside it, so a later row can sit
  between earlier ones (REQ-033); IDs keep their numbers and need not be in sequence.
- ID: `TC-001`, `TC-002`, ... unique within the table, never reused.
- Priority: `P1` main flow and anything that blocks it or costs money/credits; `P2` secondary features and
  error handling; `P3` copy, cosmetic and rare edge cases.
- Spec Ref: requirement IDs from `requirements.md` (`R-004, R-007`). Every row needs at least one; every
  testable requirement needs at least one row.
- Notes: platform specifics, conflicts resolved, data needed. Leave empty otherwise.
- Do not invent behavior the spec does not state. If the spec is silent on something a tester will hit,
  add an open question instead of a case.
- Cover per requirement: the positive path, each stated limit/boundary (exact numbers), each stated error or
  empty state, and each stated confirmation/cancel branch.

### update-plan.md

```
# Update plan — <feature> / <platform>: approved v<N> → draft <id>
## Spec files
- Unchanged: ... · New or changed: ... · No longer supplied: ...
## Requirement changes
| Requirement | Change | Before | After |
## Case changes
- New (n): TC-… (R-…) one line each
- Modified (n): TC-… what changes and why
- Removed (n): TC-… which requirement was removed
- Unchanged: n
## Found by the analysis
- Annotation trace: blocks traced (n), new requirements R-… → rows TC-…
- Pass 9 hidden clauses / pass 10 variants / other passes: R-… → TC-… one line each
## Not added (value check)
- <case or requirement>: <merge / drop / retire / older spec / park> — <reason>
## PM-only rows
- TC-… (PM <board>): no Design frame yet / Design now draws it → modified / Design removed it → removed
## Questions for PM
- Q-n <conflict or gap only PM can settle>
## Questions for you
```

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

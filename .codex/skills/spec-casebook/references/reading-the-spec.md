# Reading the spec

Part of the spec-casebook skill (workflow steps 2–3). Run the coverage passes in `analysis.md` afterwards.

PM and Design specs usually arrive as Figma exports: one enormous PDF page (20,000+ points on a side) holding every
board, phone mockup and annotation. Their text layer is unreliable — Chinese annotations often have no usable
Unicode mapping (extracted text comes out garbled) and Figma splits text into glyph runs, so PDF text extraction
mangles both. The reliable source is the rendered page: **render each board, OCR the tiles, read the OCR text,
and look at the tile images where layout, arrows or states matter.**

1. **Copy the set in.** `new-draft.ts` (or `node scripts/add-spec.ts <feature> <files...>`) copies the files to
   `library/<product>/<feature>/specs/<date>/` with `spec-set.json`. Work only from that copy.
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
   - UI strings: take them from Design frames exactly (quote them in cases); PM frames carry rules and flows. Screen
     and sheet titles too: a PM mockup's title is sample wording (2026-10-27: 15 Android rows said 「Change Characters」
     from the PM where the Design and the app say 「Choose Character」 / 「Choose for {name}」).
   - **A note's scope is the screen and path its heading names (PDRA, 2026-10-29, REQ-055).** 「10/12 update - Scene
     編輯頁的「地點圖片」」 is a rule for the Scene edit page, not for the chat storyboard; 「Full Edit 重新生成後返回」 is
     for regenerating from Full Edit, not for a new generation asked in chat. Put that screen and entry path in the
     requirement and the row's Precondition. Iris's replies in mockups are sample AI text (rules about them — chip
     count, order — are spec; their wording is not); notes marked 「待 RD 確認」 are recorded as RD-to-confirm.
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
   (`figma-design` for the Design file, `figma-pm` for PM and MX) `get_metadata` (no node ID), then `get_metadata` on the design page and collect every frame or text whose name
   starts with a date (`1016_…`, `1005_Update`) or is a dated update note. Compare them with the labels in the PDF OCR
   (`boards/*.md`). Read each label the PDF lacks with `get_screenshot` (save to `extracted/figma/<board>.png` and record it with
   `figma-check.ts --shot`, step 10) and
   `get_metadata` for its text, and add it to board-notes under 「Design — Figma only」. Record every dated label in
   `extracted/figma-frames.json` (`label`, `node`, `in_pdf`, `read` = the board or note where it was read);
   `check.ts` fails a label with an empty `read`. A Figma-only frame is part of the spec like any other frame and is
   dated by its label.

9. **Trace every annotation (user, 2026-10-22, REQ-032).** Reading board by board skips lines: the PM note
   「只送 crop 後的圖」 was read by OCR (low-confidence) and never became a requirement. After `requirements.md` is
   written, run `node scripts/annotations.ts <feature> <platform> --draft <id>` (`--skip <board prefixes>
   --skip-reason "<why>"` for boards that are not part of the current spec, e.g. superseded MX versions; their blocks
   stay in the file, traced `older: <why>`, so they are marked too). It groups the
   annotation lines of every board (Chinese text or • bullets, OCR noise dropped; a board with no such line, e.g. the
   English-only MX 「③ Credit Charging Table」, becomes one block of all its text, 2026-10-29) into blocks and writes
   `<draft>/annotation-trace.json`. Trace each block: `R-…` when the requirements state **every clause** of it (a
   condition, a number, "only", "per tier", "remote-configured" are clauses), else add the missing requirement and
   trace to it; `label: …`, `ui: …`, `older: <newer source>` or `Q-n` otherwise. Look at the tile, or render a
   close-up, for a low-confidence block whose meaning matters. Large sets go to parallel subagents by board group,
   each writing its own part file, merged afterwards. Traces carry over to the next draft for blocks whose text is
   unchanged, so an update only traces new or changed blocks. `check.ts` fails an untraced block or a trace that
   names a missing requirement.
   **Follow every link (user, 2026-10-29, REQ-058).** A board note that is a link (「Action ID & Charging Table
   Link」, a Google Sheet, a doc, another Figma file) is not traced as its title: the analysis opens the link (Google
   Sheets / Drive connector, Figma MCP on the right server), saves what it says under `extracted/` (e.g.
   `mx-charging-table.md`) and lists it in `extracted/links.json` (`scripts/lib/links.ts`: board, the link line's
   OCR position, node, target, read date and one `items` entry per rule, price or id — every price of every item is
   a variant of its own). `annotations.ts` turns each item into a block under the link line; trace each one like any
   block, with the row that checks that variant (`R-463 (TC-231)`), or a `Q-n` when the linked page disagrees with
   PM, Design or the app (list the conflict as a question, never pick a side alone). `check.ts` fails a draft whose
   trace lacks an item of `links.json`, and the coverage page shows any untraced item as missing. A link that cannot
   be opened (no access) is a `Q-n` asking for access, never skipped.
10. **Inventory every screen, control and arrow from Figma (user, 2026-10-28, REQ-038).** The run must press every
   tappable element the spec draws and walk every arrow, and the coverage page proves it.
   - **Accounts and servers.** The Design file is read through the `figma-design` server (qa-dm, Dev seat), the PM and
     MX files through `figma-pm` (qa1; qa-dm only has a View seat on PM). Both are in the repo's `.mcp.json` (Codex:
     same names under `mcp_servers`). `whoami` on the server before its first read; stop for the user if it names the
     wrong account. If a server is absent, pending approval, needs auth or names the wrong account, never read through
     another Figma tool: open a Terminal panel tab running the `claude` CLI in the repo, have the user approve and
     Authenticate each server through `/mcp` (qa-dm for `figma-design`, then qa1 for `figma-pm`), confirm with the
     headless `claude -p … whoami` check (README Setup 5), and continue in a new session or subagent (one opened
     before the approval cannot see the servers).
   - **Quota.** Figma MCP has a small quota (a View seat hit its limit after about 13 calls on 2026-10-28): never read
     elements one by one, and never re-read an unchanged file.
   - **Read.** `scripts/figma/inventory.js` (read-only `use_figma`; its header says how): one call with
     `__BOARDS__ = []` lists the boards, then **one call per board group** (about 4 boards or 40 KB of output) returns
     every phone frame, every tappable instance (deduplicated by board + layer + label + position) and every flow
     arrow with its tail control and head screen from the vector geometry (arrow layer names are stale; the geometry
     is not). Run the groups as parallel subagents that each save their return verbatim to
     `extracted/figma-inventory-<group>.json` and check its `size`. The extractor also takes **panels** (dialogs,
     sheets, popups beside the phones; their buttons are often plain frames), frames named `btn` / `back` / `cta`, and
     long scrolling pages, and skips what Figma does not draw (hidden, opacity 0, layer blur, clipped).
   - **PM and MX too (REQ-052).** Every Figma file of the spec set is read. Their phones and arrows lie loose on one
     page, so their boards are **regions** (`__BOARDS__` entry `{ name, parent, box }`, named after the PDF board id:
     `pm-main-flow`, `mx-a-left`) or dated update frames (`{ id, name }`). Superseded MX versions are read too and
     every control and arrow on them is traced `n/a: superseded MX version …`. Each file's PDF offset is its page
     bounds' top-left, negated (OCR lines read about 22 pt low, so check one sheet against the drawing), kept in
     `figma-frames.json` `files.<role>` (`pdf`, `pdf_offset`). The PM file is heavy: run its groups **one call at a
     time** and cut frames over about 300 component instances into smaller region boxes (calls otherwise drop with
     「MCP server connection lost」); `inventory.ts` joins arrows across cuts. On every analysis list the PM and MX
     Figma pages too: a dated frame past the PDF is spec content.
   - **Fingerprints (user, 2026-10-29).** Each group read records one hash per board (`hash`, `hashed_at`, `entries`).
     `scripts/figma-check.ts` checks a whole file in one call against the committed `extracted/figma-hashes.json` and
     names the groups to re-read (workflow step 0). Everything a read produces (group files, hashes, `inventory.json`,
     `figma-frames.json`, board screenshots) is committed, so no machine reads an unchanged board again.
   - **Merge.** `node scripts/inventory.ts <feature> <set> --sync-arrows` merges the groups into
     `extracted/inventory.json` (screens by platform; controls as button / input / toggle / tab / item; arrows as flow /
     auto / pointer) and adds every arrow missing from `arrows.json` (write its `expected` and requirement in pass 1).
     Totals count **groups**, not copies (REQ-040): a button with the same worded label is one group everywhere; an
     icon or numbers-only label groups by layer (+ size); a **choice set** (the same layer repeated side by side:
     chips, options, cards, avatars) is one group any one choice covers, and lists under different headings stay apart
     (Gender vs Ethnicity). **Platforms (REQ-050):** the Design draws shared screens on iPhone frames only, so those
     controls count for Android too (Android rows or `n/a: iOS-only <why>`); overrides `ios_only_screens` keep an
     Apple-only screen to iOS, `android_uses_ios_frames: false` turns this off.
   - **Check the arrows.** Check every arrow's `edge` against the geometry (the control under its tail, the screen under
     its head) and correct it, its requirement and its "Walked by" when they disagree: imported labels can be swapped,
     and a label next to a control may be its own button (the banner's 「>」). Annotation pointers (default
     「Vector N」 name, tail off-screen) are marked `not_flow`.
   - **Review before tracing (user, 2026-10-28, REQ-041).** `node scripts/inventory-sheets.ts <feature> <set> --scale
     1.25 [--board …]` cuts every screen and panel out of the PDF with the boxes drawn, plus OCR texts no box covers and
     an edge score (near 0 = the PDF draws nothing there); PM / MX sheets come from the OCR tiles (`--tiles --tag
     <name>`, much faster). A board whose Figma is newer than the PDF (`figma-frames.json`) is cut from its saved Figma
     screenshot, never from the stale PDF. Review the sheets by board group in parallel subagents (each writes
     `extracted/inventory-review-<group>.json`): every tappable element without a box (inputs included), every box on
     something not tappable, every screen the PDF does not draw. Merge into `extracted/inventory-overrides.json` with
     `node scripts/inventory-overrides.ts <feature> <set>` (`drop_screens`, `drop`, `hide` = covered on one screen
     only, e.g. behind a dimmed sheet, and `add` with screen-point boxes; `drop` and `hide` take control ids, mapped
     through `inventory.json` `controls[].group`). Written by hand (REQ-053): `kind` (`{ control | group, kind, why }`,
     e.g. a slider drawn as an input) and `merge` (`{ groups, into, set?, why }`: one element the grouping split; pick
     the `into` the control trace already uses). `inventory.ts` re-applies all of them on every rebuild. Curate the
     adds: `label` is the app's visible text or one short icon name (「Mic」, 「Privacy Policy」) so reviewers' finds
     merge; an add copying a known icon names its `layer` (`round/ic_vocal`); a clipped card is already in its card set
     and a selector segment in its selector (drop those); 「behind a sheet」 is a per-screen `hide`, never a `drop`.
   - **Board screenshots (user, 2026-10-29).** Committed, one file per board, named by the board name's slug. After
     `get_screenshot` → `extracted/figma/<board>.png`, run `node scripts/figma-check.ts <feature> --shot <png> <board
     id>` (records it in `extracted/figma/shots.json` with the board's hash and shrinks it to 256 colours; needs Python
     3 with Pillow). Re-capture only when `--compare` lists the board, overwriting the same file, never a copy beside
     it. `figma-check.ts --prune` deletes every image `shots.json` does not list and the screenshots of a superseded
     spec set (`SUPERSEDED.md`); commit the deletion. Never commit other images (renders, tiles, run screenshots).
   - **Everything is marked (user, 2026-10-29).** Every board the coverage page shows has all it draws marked: its
     screens, controls and arrows, and every annotation block as a note (state from the rows of its requirements;
     label / ui / older / Q-n traces show as Excluded). A bare spec region or a board with nothing marked is a gap of
     the analysis: inventory it, trace its notes, or give its content a requirement. A linked document on a board is
     spec content (step 9, *Follow every link*), so a board holding only a link shows every linked item marked. Board
     images come from each file's PDF (`coverage-page.ts --render`, no Figma call; pdf point = figma point +
     `files.<key>.pdf.offset`).

---
name: figma-source
description: Read the full Figma source data of a feature's Design Figma boards (Design files only, never PM or MX) (every node's geometry, visibility, fills, strokes, radius, shadows, auto layout, text runs and fonts, component and variant, variables and styles, prototype links, flow arrows) plus one full-size image per board cropped per screen, in a few read-only use_figma calls instead of one Figma MCP read per frame, data type and component instance. Use when someone needs pixel-level Figma data for a casebook feature (UI conformance, measuring a screen, design tokens), asks to "pull everything from Figma" for a feature, or asks for the script way of reading Figma. Not for the casebook's control/arrow inventory (that is spec-casebook's scripts/figma/inventory.js).
---

# Figma source data in a few calls

`scripts/figma/source.js` runs inside Figma through `use_figma` and walks every node of a board, including the inside
of component instances, so one call returns what `get_metadata` + `get_design_context` + `get_variable_defs` return per
frame and per instance. Calls are sized by output bytes, not node count. `scripts/figma-source.ts` writes each call's
code, checks the returns, merges them and crops the board images.

Why it is cheaper: on AI Mini Drama the per-tool route queued 4,595 instance reads and still had no styling, because
`get_design_context` on 8 of the 10 boards was too large and fell back to plain layout. Measured on board 1005_Chat
(3946:68005, 2026-10-30): 5 calls (1 plan, 3 chunks, 1 screenshot; about 10 s of Figma time) against the per-tool
route's 41 (38 `get_metadata`, 1 each of `get_design_context`, `get_variable_defs`, `get_screenshot`), with every
node's styling (423 nodes against 243), the same sizes on every shared node, every colour and all 39 variable and
style names the per-tool reads returned. Board main flow (2778:127318, 8,205 nodes,
2026-11-02): 34 calls (1 plan, 31 chunks, 1 fix, 1 screenshot), with 408 repeated instances sent once (4,531 nodes
sent); the per-tool route spent 4 calls there without any styling (`get_design_context` fell back to layout) and still
had 959 instance reads queued. A re-read costs only the plan calls when nothing changed.

## Before the first call

1. **Design Figma links only** (user, 2026-10-30). The file is `files.design` (`fileKey`, `page`) in the spec set's
   `extracted/figma-frames.json`, read through `figma-design`; the command refuses any other role. PM and MX Figma
   files keep spec-casebook's inventory reads. Follow AGENTS.md › *Figma access*: `whoami` on `figma-design` first,
   never switch accounts by hand.
2. Load the Figma `figma-use` skill once (the `/figma-use` skill, or the `skill://figma/figma-use/SKILL.md` resource of
   that server) and call `create_session` once per file. Every `use_figma` call below passes the `sessionId`,
   `skillNames: "resource:figma-use"` (or `figma-use` when loaded as a skill), the call's `description`, and the call
   file's whole content as `code`. The calls only read.
3. **Save every return verbatim**: after the calls, `save design` copies each `use_figma` return from the session
   transcripts (subagents' included) to its `save_to` path; never retype a return. A screenshot's URL is short-lived:
   download it with `curl -f -L -o <save_to> "<url>"` in the same turn.
4. **Always shrink, and run without asking (user, 2026-11-02).** Repeated component instances (status bars, nav bars,
   buttons) are always sent once and copied by the merge; this is the reader's only mode, with no switch to turn it
   off. Once the plan is back, run every chunk call, every
   `fix` call and every screenshot straight through, whatever their number, without asking the user to confirm
   the count or the token cost; report the totals at the end.

## Steps

All commands are `node scripts/figma-source.ts <product>/<feature> [<set>] …`; the set defaults to the newest one with
`figma-frames.json`. Files go to `specs/<set>/extracted/figma-source/design/`.

1. **List** (1 call): `calls list design [page or section id]`. The return lists the page's sections, their boards and
   each board's instance count. Pick the boards the spec covers (skip superseded ones unless asked).
2. **Plan** (1 call per 4 boards): `calls plan design <board, section or page ids…> [--per 4] [--budget 36000]`. Run
   every plan call **in one message** (parallel). The plan reads no styling (a full read of a big board in one call
   drops the connection): it fingerprints each board, finds the repeated instances and sizes the chunks from an
   estimate (130 bytes per node plus its id, name and text, calibrated on board 3946:68005).
3. **Chunks and screenshots**: `calls chunks design [--all] [--scale 1]` writes `calls/todo.json`: a chunk call for
   every board whose fingerprint differs from `hashes.json` (every board with `--all`) and one screenshot per such
   board (`get_screenshot` with the given `nodeId` and `maxDimension`, the board's longest side × scale, so 1 image px
   = 1 Figma pt at scale 1). Up to 4 calls at once. With more than 4 chunk calls, hand them to parallel subagents, 4
   calls each, with this brief: "For each entry: read the `call` file, call `use_figma` on <server> with fileKey
   <key>, sessionId <id>, skillNames resource:figma-use, description = the entry's `description`, code = the file
   content; write the whole tool result verbatim to `save_to`. Report only the files written and any error."
4. **Merge**: `save design`, then `merge design`. It puts every record at its walk index and copies each repeated
   instance's inside from the first one, checking a hash of the full description of both (clipped render bounds and
   drawn share are left out of the hash: each copy sends its own). Exit 10 names what is missing: a missing chunk (run
   it), a `fix-…` call (copies whose check failed; one call per 60 copies, already written: it compares them with
   the first instance inside Figma and returns only the nodes that differ; run it, save, merge again), or "changed
   since the plan" (plan that board again and redo its chunks), or a `hidden-…` call (below).
   **Hidden layers inside instances** are not in the walk: `use_figma` runs with `figma.skipInvisibleInstanceChildren`
   on, and a View seat cannot turn it off (setting it counts as an edit; found 2026-11-02 against the Figma Agent's
   per-node reads, which had 387 such layers the walk lacked). Each board therefore gets `hidden-<board>_0` (in
   `todo.json` with its chunks, or named by merge): a small call (about 6 KB of code) that pairs every shown instance
   with its main component and returns the layers the instance hides, sending repeated ones once. A return with
   `next` names the following call; merge writes it. AI Mini Drama took 18 such calls for 8,654 layers.
5. **Crop**: `crop design` (python3 with Pillow) cuts each board image into `out/crops/<board>/<screen>.png`, plus
   `arrow-<arrow>.png` per arrow (its path with 80 pt around, at least 360 pt a side), and writes each arrow's `crop`
   into `arrows.json`. Look at every `pointer` arrow's crop: it is a designer note, often a spec rule.
6. **Commit** `responses/` and `hashes.json` (calls/ and out/ stay local and can be rebuilt with `merge` and `crop`).
   Board images are not committed; with full-size images needed on another machine, that costs one screenshot per board.

**Re-reading later**: run step 2 (plan calls only), then step 3: unchanged boards get no chunk calls and no screenshot.

## What `out/` holds

- `<board>.json`: `board` (id, name, canvas box, render bounds, fingerprint, read time) and `nodes` in walk order. Each
  node has `id`, `parent`, `depth`, `type`, `name`, `box` (board-relative x, y, w, h), `abs` (canvas), and as present:
  `render` (bounds including shadows), `rotation`, `hidden` (it or an ancestor is hidden: box and name only), `drawn` (share left after clipping,
  masks, near-zero opacity), `opacity`, `blend`, `mask`, `clips`; `fills` / `strokes` (type, `#rrggbbaa`, variable
  name, gradient stops, image hash), `stroke_weight` (one or per side), `stroke_align`, `dash`; `radius` (one or
  [tl, tr, br, bl]), `smoothing`; `effects` (type, colour, offset, radius, spread); `layout` (auto layout mode, padding
  [t, r, b, l], gap, alignment, sizing) and `child` (sizing inside its auto-layout parent, absolute); `constraints`,
  `min_max`; `styles` (fill / stroke / effect / text style names); `variables` (bound property → `collection/name`),
  `modes`; `text` (characters, alignment, auto-resize, `runs` with font family, style, size, weight, line height, letter
  spacing, decoration, case, fills, text style); `component` (main component name, set, key) and `component_props`
  (variant values); `reactions` (prototype trigger → destination); `annotations`; `arrow` (path points, tail first);
  `copy_of` (on a repeated instance: the instance its inside was copied from, checked equal). A layer hidden inside an
  instance (hidden call) has `hidden`, its box and name, `from_component` (its node in the main component),
  `approx_box` when the instance is resized from its component (the box is the component's offset from the nearest
  shown ancestor), and `made_up_id` when the component comes from a library: the id is then the instance prefix, `~`
  and the library copy's node id, because the real sublayer id cannot be read.
- `<board>.metadata.xml`: the same tree in `get_metadata`'s layout (x / y relative to the nearest non-group ancestor),
  with the instances' insides included, for tools that read that format.
- `screens.json` (phone frames 300–450 pt wide, not nested), `arrows.json` (path, start screen and control, end
  screen, `style` (stroke colour and weight), `kind`: `flow` when drawn in the style most arrows share, `pointer`
  when not (a designer's note pointing at a detail, not a screen-to-screen flow), and `crop` after `crop`),
  `library.json` (variables, styles and components used; each variable and style has the `value` it has on the
  nodes using it, colour as `#rrggbbaa`, a text style as font family, style, size, weight, line height and letter
  spacing, or `values` with a node count each when modes or overrides give it several, e.g. dark and light),
  `summary.json` (calls and bytes), `crops.json` (image size, scale and origin per board).

Not read: image fill pixels (only their hash; the board screenshot shows them), vector path data except arrows,
layout grids, and variable values in modes no node uses (colours and sizes are the values the node resolves to,
and `library.json` values come from those nodes; `modes` is set only on frames that pick a mode explicitly).

## When a call fails

- Timeout or "MCP server connection lost": plan with `--per 1`, or a smaller `--budget` so each chunk returns less.
  A heavy PM file is best planned one board per call.
- One chunk that keeps dropping while the rest of the board is read: do not re-plan the whole board. Copy its call
  file once per piece, changing only `TARGETS` (from, to, first and last node id) to boundaries a smaller-`--budget`
  plan of the same fingerprint gave, and name each `chunk-<board>_<from>`; merge accepts pieces that tile a planned
  chunk exactly. Keep the smaller plan's return out of `responses/` (the newest plan per board wins). On 2811:89056
  (2026-11-02) one 513-node chunk dropped every time; its pieces took 62 s, 66 s and 16 s.
- A return over the host's tool output limit: lower `--budget` (the default keeps returns near 40 KB) and plan again.
- A board over 65536 pt on its long side: `todo.json` says so; take its screens one by one after merge.
- Quota: Figma counts every call. `summary.json` records how many this read took; note the account's remaining
  quota before a large read and stop (do not retry in a loop) when it runs out.

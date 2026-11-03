# figma-source vs the Figma Agent: how each reads Figma, and what each gathered

Compared 2026-11-03 on AI Mini Drama, the one feature both have read (the same 10 Design boards, file
`dZk5HLzZTdcZwWwvN9aZfZ`, page `UI_26.10GM`).

- **figma-source**: this repo's `.claude/skills/figma-source/SKILL.md`, `scripts/figma-source.ts`, `scripts/figma/source.js`.
  The data is `library/pdr/ai-mini-drama/specs/2026-10-21-2/extracted/figma-source/design/out/`, read 2026-11-02/03.
- **Figma Agent**: `~/Desktop/Figma Agent`, Figma step of `figma-pdr-ui-conformance/SKILL.md` §2 plus the
  `qa-figma-workflow` coordinator (scope, arrow ledger, plan). The data is the run `20261012-ai-mini-drama-source`,
  unpacked from `docs/qa-plans/20261012-ai-mini-drama/resume/run-state.tar.gz` and read 2026-10-12/13. That run
  stopped at 61/70 worklist tasks when the Figma seat ran out of quota.

**The two reads are three weeks apart, and the Design file changed in between** (see *Design drift* below). So
some differences come from the file changing, not from the readers.

## 1. How each reads Figma

| | Figma Agent | figma-source |
|---|---|---|
| Tools | Fixed MCP read tools: `get_metadata`, `get_design_context`, `get_variable_defs`, `get_screenshot` | One read-only Plugin API script (`source.js`) run through `use_figma`, plus `get_screenshot` |
| Unit of a call | One frame or one instance per call, per data type | One output chunk (about 36 KB) covering any number of nodes |
| Order | Wave 1: board `get_metadata`. Wave 2: `get_design_context` + `get_screenshot` + `get_variable_defs` per board. Wave 3: `get_metadata` on every leaf instance. All in one global queue, at most 4 at a time | `list` → `plan` (fingerprint, repeated instances, chunk sizes, no styling) → chunks + one screenshot per board → `fix` / `hidden` calls → merge → crop |
| Inside instances | One level only: nested instances (icons inside a nav bar) are never opened | Full depth. Repeated instances are sent once and copied, with a hash check (`fix` calls when the check fails) |
| Layers hidden inside instances | Returned by the per-instance `get_metadata`, with real ids | Not in the walk (`skipInvisibleInstanceChildren` is on and a View seat cannot turn it off). The separate `hidden-…` calls add them. In library components the real id can't be read, so they get a made-up id (`made_up_id`) |
| Styling | Only from `get_design_context` (React + Tailwind). That call falls back to plain layout XML on big boards | Read from every node directly |
| Saving returns | `save-mcp-response` copies each return word for word from the transcript, with a sha256 provenance file and a 30-minute freshness check. Subagents are forbidden (transcript reasons) | `save design` copies word for word from the transcripts, subagents' included (Claude and Codex) |
| Resume / re-read | A worklist, plus a portable tar checkpoint with checksums. Every read is fetched again | `todo.json` and merge exit 10 name what is missing. Unchanged boards (same fingerprint in `hashes.json`) cost only the plan calls |
| Calls on these 10 boards | 1,642 (12 metadata, 10 design-context, 10 variable-defs, 10 screenshots, 1,600 instance metadata), and it **still had 2,995 instance reads to go** when quota ran out | 173 `use_figma` (5 plan, 142 chunk, 8 fix, 18 hidden) plus 10 screenshots and the list call. Complete |

## 2. Figma Agent parts not in figma-source yet

The Figma Agent's Figma step does several things figma-source does not. The *Worth porting?* column says whether
each would help figma-source's job: full Design data for the casebook.

| Figma Agent feature | In figma-source? | Worth porting? |
|---|---|---|
| **Arrow review ledger**: direction, bends, arrowhead, a crop image for each arrow (90 crops), observed origin control, destination state, reviewer comment, user decisions (6 clarified 2026-10-13), and `annotation_pointer` for arrows that only point at a note | No. `arrows.json` has the path, start screen, start control and end screen, all computed. No crops, no review fields, no annotation-pointer class | **Done 2026-11-03**: `crop` writes `arrow-<id>.png` per arrow; `arrows.json` has `style` and `kind` (`flow` / `pointer`). It found 4 pointers: the Agent's 2 white ones and 2 cyan notes the Agent missed (one is "Animation ref: Wave, show skeleton loader" on main flow). The review fields belong in spec-casebook's coverage page |
| **Flat variable table** (`get_variable_defs`): name → value, including composite `Font(family, style, size, weight, lineHeight, letterSpacing)` for 30 text styles | Partly. `library.json` has names, keys, collection, type and remote flag. Values exist only as each node's resolved colour, and text style values only as per-node text runs | **Done 2026-11-03**: every `library.json` variable and style has `value`, or `values` with node counts (80 variables have two, e.g. dark and light), taken from the nodes, with no extra call. The blank entry is gone (component-property bindings had no id; `source.js` fixed for later reads) |
| **Asset exports**: `get_design_context` returns downloadable SVG/PNG links for icons and images (47 links on the 2 boards where it returned code) | No. Image fills give a hash only, and vector paths (except arrows) are not read | Only if someone needs the icon files. The links expire, and the board screenshot already shows the pixels |
| **Generated code** (React + Tailwind) for a frame | No. It returns structured data instead | No. figma-source's per-node data is a superset, and the Agent only got code on 2 of 10 boards |
| **Error receipts and scope ledger**: every failed node kept with its error (the 19 page nodes that return `node not found`), and deferred scope written down | No. `list` prints what it sees, and `missing` names are printed, not stored | **Yes**: write `list`'s return and any not-found ids to a committed file |
| **Retry policy**: retry only the failed calls on 429/5xx/timeouts, drop concurrency 4 → 2 → 1, three tries at most. Permission or not-found errors are blocked straight away | Prose guidance only (*When a call fails*: smaller `--per` / `--budget`, split a chunk) | Optional. figma-source's failures are size problems, which the guidance already covers |
| **Provenance and freshness**: sha256 + source transcript per response, and a refusal to save a return older than 30 min | No per-file sha256 or age check. `hashes.json` holds the board fingerprints | Small and useful: refuse a transcript return older than the plan it belongs to |
| **Screenshot size policy**: response vs original within ±1 px, PNG exactly the response size, archive and reconcile retry attempts | `maxDimension` = longest side × scale, and `crops.json` records the size. No ±1 px check or retry archive | Worth adding the ±1 px check to `crop` |
| **Phase timing** spans and a timing audit | `summary.json` has calls and bytes, no times | Low value here |
| **Frame bbox → manifest skeleton → declaration pass → frame spec / source observation** (role guesses, groups, exclusion lists, `instances_not_descended_into`) | No | No. This feeds the PDR conformance pipeline, not the casebook. `out/<board>.json` and `.metadata.xml` already hold the inputs |
| **Per-screen labels and texts** in `screens.json` | No. `screens.json` has id, name and box only | Easy to derive from `out/` if spec-casebook wants it |
| **Plan table** (Figma node, app state, cumulative navigation, capture moment) | No | No. That is spec-casebook's table, not a Figma read |

Going the other way, figma-source does three things the Figma Agent has dropped or never did:

- It reads **designer annotations**. The Agent removed annotation reading on 2026-08-13. None of these 10 boards has
  annotations, so it made no difference here.
- It opens **nested instances**.
- It can **re-read only what changed**, using fingerprints.

## 3. Comparing the data on AI Mini Drama

### Nodes

| | Figma Agent | figma-source |
|---|---|---|
| Unique node ids | 15,910 (10,930 from board metadata + 4,980 from 1,600 instance reads) | 46,119 (38,251 real ids + 7,868 made-up ids for hidden layers in library instances) |
| Shared ids | 15,661 | 15,661 |
| Size (w, h) differences on shared nodes (> 0.5 pt) | — | **0** |
| Hidden-flag differences | — | 0 real ones. 667 differ only because figma-source marks a node hidden when an ancestor is, while `get_metadata` marks only the node itself. Every one of the 667 has a hidden ancestor in the Agent's data |

Where both have a node, they agree exactly on its geometry and visibility.

### Data only the Figma Agent has

1. **Real ids for layers hidden inside library-component instances.** There are 138 nodes like this, for example
   `I2566:113199;12220:49406` "Start". figma-source has all 138, but under made-up ids
   (`I2566:113199;~159:9519`): 134 match on instance, name and size, and 4 match on name, with `approx_box` because
   the instance is resized. So the layers are the same; only the real id is missing. That matters only if something
   has to address the layer by id.
2. **The old version of a changed component** (110 visible nodes). The `paycard` instances (`3637:67174` on
   Storyboard, `2824:133532` on MX) had a "Model" selector on 2026-10-13. They now have "Quality"
   (Best / Standard / Fast) and "Length" (Seedance 2.0 / 2.0 Mini). There is also one deleted note on the video
   board, `4178:31746` 「如果連prompt都沒產生也是顯示這個」. This is history, not something figma-source missed. If
   that note was a spec rule, check whether it moved somewhere else.
3. **Human arrow decisions and crops**: the 6 trigger clarifications from the user, 90 arrow crops, and 2 arrows
   classified as annotation pointers.
4. **Values in one table**: the 153 variable and style values, including the 30 `Font(...)` composites (see
   *Variables* below).
5. **Asset download links** for icons and images on 2 boards (1005_Chat and the home page), probably expired by now.
6. **Page scope**: the page lists 29 nodes, 19 of which return `node not found`. These are recorded with their error
   messages.

### Data only figma-source has

1. **22,590 more real nodes** (vectors, boolean operations, nested instances, text). They come from three gaps in
   the Agent's read:
   - main flow and Choose Character never got instance reads (quota), and video still had 449 to go;
   - the Agent opens only one level of instances;
   - board-level `get_metadata` leaves out vector children.

   Add 7,868 hidden library layers (the made-up ids) on top of those.
2. **Styling on every node**. The Agent's `get_design_context` fell back to layout XML on 8 of 10 boards, the same
   bytes as its `get_metadata`, so it has **no styling at all** there. figma-source has:

   | Styling | Nodes |
   |---|---|
   | Fills | 15,649 |
   | Variable bindings | 17,347 |
   | Corner radius | 10,842 |
   | Auto layout | 9,727 |
   | Strokes | 8,732 |
   | Component variant values | 5,080 |
   | Text runs | 5,072 |
   | Image fills | 1,946 |
   | Shadows / blurs | 1,112 |
   | Prototype reactions | 5 |

3. **The text actually shown.** `get_metadata` gives a text node's layer name only. In 2,782 of the 5,072 text
   nodes the characters differ from the name, so on the 8 fallback boards the Agent never saw that copy.
4. **Library keys**: the variable and style keys and collections, and the 295 components used, with keys and
   whether they are local or remote.
5. **Two arrows the Agent missed**: `2824:129430` and `2910:64897` (both "Vector 2757").
6. **Arrow path points**, and the control each arrow starts on, worked out automatically.
7. **A crop per screen** (225 PNGs at 1 px = 1 pt) and a `get_metadata`-style XML that includes instance insides.

### Variables

The Agent's `get_variable_defs` returned 153 names across the 10 boards. figma-source's `library.json` has 117
variables and 37 styles, and **every one of the Agent's names is among them**. Every colour value the Agent has also
appears as a resolved colour on figma-source's nodes. So neither has a variable the other lacks. The Agent has the
values in one table; figma-source has keys and collections.

`library.json` also has one blank entry (name `null`, type `?`), which looks like a small bug.

### Screens

| | Count |
|---|---|
| Figma Agent screens | 228 |
| figma-source screens | 225 |
| Same id in both | 207 |

The rest come from the two rules choosing different frames:

- The Agent takes the tall outer frame (for example 10 × "Storyboard & Preview", 375 × 1599).
- figma-source's rule (300–450 pt wide, not nested) takes the inner `storyboard` frame (343 × 976) in those spots,
  plus a few frames the Agent left out (for example `4609:32138`).

Neither rule is wrong, but spec-casebook should know which frame a "screen" is.

### Arrows

The Agent has 90 arrows and figma-source has 92; all 90 of the Agent's are in figma-source.

- **End screen**: they agree on 84. figma-source has none on 4. The Agent has none on 2, its annotation pointers.
- **Start screen**: they agree on 73. figma-source has none on 13. The 4 that differ are the Storyboard outer/inner
  frame difference above.

figma-source never names a different end screen from the Agent. Its gaps are blanks, which the Agent's manual
review filled.

## 4. In short

figma-source gets far more data for about a tenth of the calls (173 against 1,642), and it finished where the
Agent ran out of quota. Where both have a node, they match exactly.

Only the Figma Agent has:

- the human arrow review (crops, the 6 user decisions, annotation pointers);
- a flat variable/font value table;
- real ids for hidden layers in library instances;
- asset download links on 2 boards;
- the not-found receipts;
- an older version of the paycard component and one deleted note.

The changes worth bringing into figma-source, in order:

1. ~~an arrow crop and an annotation-pointer flag per arrow~~ (done 2026-11-03);
2. ~~values in `library.json`~~ (done 2026-11-03);
3. a committed scope/error file from `list`;
4. the ±1 px screenshot check and a freshness check when saving;
5. ~~fixing the blank `library.json` entry~~ (done 2026-11-03).

# Design check (conformance)

Part of the figma skill (`../SKILL.md`): does the app match the Design, screen by screen? One command,
`node scripts/design.ts <product>/<feature> <ios|android> <command>`, carries every step after the Figma read, and
`status` always names the next one. The flow:

```
plan (automatic) ─► capture while running ─► check ─► two review passes ─► settle ─► your decisions ─► eBugs ─► recheck on the next build
```

What makes it light: the navigation comes from what is already known (the casebook's rows, else the Design's own
arrows), captures ride on runs that already reach the screens, the Figma side is the committed source read (no Figma
call here), and a machine measures every screen before anyone looks at it, so the reviewers read one image per screen.

## Files (same feature folder as the casebook)

| File | Written by | Shared in git |
|---|---|---|
| `<table>/design/plan.json` | `design.ts` (built again whenever its inputs change) | yes |
| `<run dir>/design/captures.jsonl` | `device.ts` / `device-android.ts` `design` | yes |
| `<run dir>/design/captures/<id>.webp`, `<id>.xml` | `check`: a 750 px copy of each capture and its page source | yes |
| `<run dir>/design/compare.json` | `check` | yes |
| `<run dir>/design/builder.json`, `reviewer.json` | the two review subagents | yes |
| `<run dir>/design/findings.json` | `settle`, then `decide` | yes |
| `<run dir>/design/ebug-findings.md` | `ebugs` | yes |
| `<run dir>/screenshots/design/<id>.png`, `.xml`, `-sheet.png` | the capture and `check` | no (local, like every run screenshot) |
| `specs/<set>/extracted/figma-source/design/out/` | `figma-source.ts merge` and `crop`, run by `design.ts` itself after a pull | no (rebuilt from committed files) |

`<table>` is `library/<product>/<feature>/<platform>/`, the casebook's table folder; a feature with no casebook table
gets the same folders. A computer that pulls the repo needs no Figma call and no phone file: `design.ts` rebuilds the
Figma output from the committed responses and board images, and every later step reads the committed copies.

## 1. Plan (automatic)

`design.ts … status` (or any other command) builds `plan.json` when it is missing or older than its inputs; `plan`
builds it on demand and takes `--skip <board or screen ids> --skip-reason "<why>"` for superseded boards (kept on
every rebuild). For each Design screen of the source read, the route that reaches it:

- **A casebook row** (when the feature has a table): the row pressing a control on the screen (`how: on`) or walking
  a flow arrow into it (`how: arrow`), with the best `fit` — `high` for an arrow or a control on at most 3 screens,
  `mid` up to 10, `low` for a shared control (back, a tab bar: the row only reaches the area) — then the best latest
  result, then journey order. `by_case` lists each row's screens.
- **The Design's own arrows** (no table, or no row reaches it): the shortest path along the flow arrows from the first
  screen of the flow (`how: figma`, `steps`: each screen and the control pressed on it; `fit: entry` for a first
  screen). A screen no arrow reaches takes the path of the nearest reached screen on its board (`fit: variant`: a
  failure, an empty list or a loading state drawn beside it), then the state its name says is brought about there.
- With a casebook table, a screen only the Design's arrows reach is a **gap**: the table has no row for a screen the
  Design draws. Report it; the analysis fixes it in the reading step or pass that missed it (AGENTS.md *What the repo
  is for*), never the design check.
- A screen with none of these is `no-route`: ask the user how it is reached.

## 2. Capture while running

`node scripts/device.ts <run dir> design <screen id> [--part N] ["note"]` (Android: `device-android.ts`) saves the
screenshot and page source of the screen on the phone and logs it with the case running.

- **In a casebook run (default).** At each row, `design.ts … screens <TC-…>` lists the screens it reaches (one line
  each); capture them as the row passes them. No extra navigation; a few seconds a screen. Rows that already ran are
  captured on their next round.
- **A design pass** (asked for on its own, or a feature with no table): its own run folder `runs/<date>-design/`;
  `design.ts … screens` lists every routed screen in journey order with its row or Design path. Walk them segment by
  segment (one board or at most 40 screens, each in a clean subagent context) under the casebook's run rules
  (spec-casebook `references/run.md`: device restart, `scrollto` / `pink`, fixtures, needs, no reinstall on the QA
  iPhone, nothing charged beyond what the run allows).
- **Only the frame's state.** Match the frame's language (English unless it says otherwise), appearance, tier and the
  state its name says. A screen whose state cannot be brought about is not captured under its id: name it in the
  segment reply with the reason. A frame taller than the phone: capture the top, scroll, `--part 2` (3, …).

## 3. Check

`node scripts/design.ts … check <run dir> [--screen <ids>] [--recheck <earlier run>]` measures every new capture
against the Figma screen and draws its review sheet (`screenshots/design/<id>-sheet.png`: Figma and app side by side
at one width, every candidate numbered on both). The script header has the rules; in short, Figma's width maps to the
window width, each half of the screen is aligned on its matched texts, and what is left is a candidate:

| Kind | Candidate | Default |
|---|---|---|
| `state` | under 40 % of the frame's short texts found: probably another state (every candidate of the screen is in doubt) | major |
| `copy` | a Figma text whose closest app text differs (case, quotes, spacing and numbers ignored) | major (minor when one contains the other) |
| `missing` | a Figma text with no app text near it (`sample` when over 60 characters) | major |
| `truncated` | the app text ends in an ellipsis Figma does not have, or runs past the screen edge | major |
| `lines` | the app text wraps into more or fewer lines | minor |
| `position` | a matched text more than 4 pt off after the alignment (only where 2+ anchors agree within 6 pt) | minor |
| `colour` | a filled shape ΔE > 12 from its Figma fill, or a text ΔE > 18 from its Figma colour | minor |
| `control` | an icon control of the inventory (no label) with no tappable app element where Figma draws it | major |
| `extra` | short app text Figma does not draw | info |

Not measured: how icons and images are drawn, font weight and size, radius, shadow, borders, spacing between non-text
shapes. The reviewers judge those on the sheet as `visual` items.

## 4. Two review passes, then settle

Two subagents, each over at most 15 screens with a self-contained brief; the second is never shown the first's file.

- **Builder.** For each screen, its `compare.json` entry and its sheet: a verdict for every candidate except `extra`
  / `sample` (those only when they matter), plus `visual:<n>` items for what the measure cannot see, each with `kind`,
  `figma.box` (screen points) and a note. Writes `design/builder.json`.
- **Reviewer.** The same inputs plus only the ids, kinds and boxes of the builder's `visual` items: judges every
  candidate and visual item afresh. Writes `design/reviewer.json`.
- `design.ts … settle <run dir>` → `findings.json`: the same verdict on both stands; a split, or a candidate either
  pass skipped, is a `question`. Settling again keeps every user decision.

```json
{ "screens": { "3946:72100": {
  "copy:3946:72105": { "verdict": "bug", "severity": "minor", "note": "App adds 「now」 to the format question." },
  "visual:1": { "kind": "visual", "verdict": "bug", "severity": "cosmetic", "figma": { "box": [16, 88, 40, 40] }, "note": "Back icon is a chevron, Figma draws an arrow." } } } }
```

Verdicts: `bug` (the app departs from the frame), `ok` (sample content such as names, credits or generated text; a
wider phone's reflow that keeps the same lines), `n/a` (the capture is not the frame's state), `question`. A bug's
severity: `major` (wrong or missing copy, a missing control, truncation), `minor` (position, colour, wrapping),
`cosmetic`. The frame is the spec under the casebook's rules: a dated frame older than the newest PM file loses to it,
a superseded frame is not the spec, and a conflict is a question (AGENTS.md *Design vs PM*).

## 5. Decisions and eBugs

- The user answers on the Design tab: Bug / OK / N/A on each question or unreviewed item, an eBug tick on each bug
  to file, then **Copy decisions**. Pass the pasted block to `design.ts … decide` (stdin or a file): it writes each
  choice into the run's `findings.json` with `decided: user <date>`.
- `design.ts … ebugs <run dir>` writes `design/ebug-findings.md`: each ticked bug with the screen, its Figma link, the
  row (or Design path) that reaches it, Figma against the app, both review notes, the build and the sheet. Draft from
  it through spec-casebook `references/ebugs.md` and the casebook overlay: `[UI]`, owner RD (Doc for copy), never
  `[UX]`; Spec Link = the Figma node; image = the sheet; dedupe per OS. Filing waits for the user.

## 6. Recheck on the next build

Capture the screens of the earlier run's bugs on the new build, then `check <new run> --recheck <earlier run>`: each
bug is `fixed` (its candidate is gone), `still` (same id: candidate ids are `<kind>:<node>` on every build) or `check`
(a visual item: both review passes look again). The Design tab shows it on each screen.

## The Design tab

`scripts/pages.ts` (`/design/`) or `design-page.ts --serve`: one card per Design screen, coloured by status
(**Differs**, **Question**, **Unreviewed**, **Matches**, **Not captured**, **No route**), filtered by board and kind of
difference. A card opens Figma and the app side by side (click to open either full size; boxes can be hidden) with the
build, the route (row, or Design path and any gap), an arrival warning, the recheck, and every difference boxed on
both sides with its verdict and decision buttons. Info items stay folded. Every computer that pulled the repo sees
both images: the shared board images and the shared capture copies.

## Coverage of the Figma Agent

Everything the Figma Agent's QA covers is covered here, by a different route:

- **Scope and versions**: Design link and page in `figma-frames.json`; `scope.json` (boards listed, read, not found);
  the build of every check.
- **Figma source**: every node, style, variable, component and arrow from one source read (`source.md`), with saved
  returns checked for freshness and board images checked for size.
- **Per-state plan and arrows**: the plan above; arrow crops and pointer arrows in the source read; arrow traces and
  walked arrows on the casebook's coverage page.
- **Capture and arrival**: captures in runs or a design pass, scrolled parts, the `state` check.
- **Measurement**: text content, presence (texts and icon controls), colour, position after an anchor fit that refuses
  a loose alignment, wrapping, truncation, unspecified text; the rest visual, on the sheet.
- **Independent review**: builder and reviewer passes, every candidate answered, splits to the user.
- **Report and decisions**: the Design tab with filters, zoom, boxes and per-item decisions.
- **eBugs and fix verification**: `ebugs` into the casebook's eBug flow; `--recheck` on the next build.
- **Resume**: `status`, from committed files on any computer.

Not carried over: the Windows-only collection (UIA, QML dumper, dialog sweep, registry), React / Tailwind code
generation and expiring asset links (the source read holds more), phase timing, and its Traditional Chinese report rule
(the Design tab has both languages).

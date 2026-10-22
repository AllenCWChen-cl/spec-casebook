# pdr-spec-casebook

Turn a PowerDirector feature spec into a plain test-case table — each row an **Action** and its **Expected
Result**, like the SFT/BFT checklists — have a person review it in the browser, and keep the approved table as
the feature's correct answer. One table per feature and platform (iOS, Android).

## Use it

Open this folder in Claude Code (or Codex) and ask, for example:

> Make the iOS test cases for AI Mini Drama from these spec files: ~/Desktop/specs/AI Mini Drama - PM Spec.pdf …

The agent follows the `pdr-spec-casebook` skill:

1. **Fingerprint** the spec files against the library.
   - New feature → extract requirements, draft the table.
   - Same spec as the approved table → asks whether to reuse it.
   - Changed spec → writes an update plan (new / modified / removed cases) for you to approve.
2. **Review** — starts a local page (`http://127.0.0.1:4387/`). Edit rows inline, Keep / Delete, add cases.
   - **Copy decisions** / **Copy final CSV** to paste into the chat.
   - **Save as approved table** writes the CSV directly and keeps the previous version in `history/`.
3. Everything for a feature lives in `library/<feature>/`, indexed by its generated `README.md`.
   Spec files are copied to `library/<feature>/specs/<date>/` (one folder per spec set; the originals are not
   committed). Each platform's approved table lives in `library/<feature>/<platform>/`:

| File | What it is |
|---|---|
| `cases.csv` | Approved table (source of truth) |
| `cases.xlsx`, `cases.html` | Generated views for reading and sharing |
| `requirements.md` | Requirements extracted from the spec; each case's Spec Ref points here |
| `manifest.json` | Version, approval date, spec file checksums, history |
| `history/` | Earlier approved versions |
| `drafts/<id>/` | Drafts, update plans and review decisions |

## Commands

```
npm install                                            # once (if the npm cache errors, add --cache /tmp/npm-cache)
node scripts/status.ts                                 # what is in the library
node scripts/add-spec.ts <feature> <spec files...>     # copy a spec set into library/<feature>/specs/<date>/
node scripts/fingerprint.ts <feature> <ios|android> <spec files...>
node scripts/spec-boards.ts <feature> <spec-set date> [--jobs 3]  # render + OCR every board listed in boards.json
node scripts/render-region.ts <pdf> <out.png> [x y w h] [--max 2000]  # look at part of a huge Figma page
node scripts/new-draft.ts <feature> <ios|android> --title "<Name>" <spec files...>
node scripts/check.ts <feature> <ios|android> [--draft <id>]
node scripts/review.ts <feature> <ios|android> [--draft <id>] [--port 4387]
node scripts/export.ts <feature> <ios|android>         # rebuild xlsx/html after editing cases.csv by hand
```

Requires Node 22.18 or newer (runs the TypeScript scripts directly) and macOS (Vision OCR via `swift`). The eBug skills' scripts need Python 3. PDF rendering uses MuPDF's WebAssembly build (`mupdf` on npm, AGPL).

## Included skills

| Skill | Use |
|---|---|
| `pdr-spec-casebook` | Spec → reviewed test-case table, updates, reuse |
| `ebug-draft-generator` | Draft eBugs from failed cases |
| `ebug-tr-filer` | Dedupe and file eBugs on ECL (needs your token in `~/.ecl_token`) |

Each exists for Claude Code (`.claude/skills/`) and Codex (`.codex/skills/`); keep both copies identical.

---
name: figma
description: Figma work for a product feature, on its own or beside spec-casebook, in two branches. Source reads the full data of a feature's Design Figma boards (every node's geometry, styling, text runs and fonts, components, variables and styles, flow arrows, and a cropped image per screen) in a few read-only use_figma calls, Design files only. Conformance (the design check) compares the app with the Design screen by screen: it reaches each screen through the casebook rows that already do (else the Design's own arrows), captures it on the phone, checks arrival, copy, missing text, truncation, wrapping, position, fill and text colour and icon controls against Figma, settles a builder and an independent reviewer pass, shows the result on the Design tab with per-item decisions, drafts the eBug list and rechecks earlier bugs on a new build. Everything another computer needs is committed. Use when someone asks to pull everything from Figma for a feature, needs pixel-level Figma data, or asks whether the app matches the Design / Figma (UI conformance, design check, what the Figma Agent does). Not for the casebook's control and arrow inventory (spec-casebook).
---

# Figma

Two branches over one read of the Design file. Read the reference the task needs.

| Branch | Read | For | Main command |
|---|---|---|---|
| **Source** | `references/source.md` | Reading the Design boards (every node, styling, arrows, board images) once; later reads touch only changed boards | `scripts/figma-source.ts` |
| **Conformance** | `references/conformance.md` | The design check: route, capture, check, two review passes, decisions, eBugs, recheck on the next build | `scripts/design.ts` (`status` names the next step) |

Conformance makes **no Figma call of its own**: every Figma value it compares comes from the source read.

## One feature folder, shared with spec-casebook

Both skills keep a feature's files in the same place, `library/<product>/<feature>/`, so neither reads or captures
what the other already has:

| What | Where | Shared in git |
|---|---|---|
| Design link and page | `specs/<set>/extracted/figma-frames.json` › `files.design` | yes |
| Board images (1 px = 1 pt, 256 colours) | `specs/<set>/extracted/figma/<board>.png` + `shots.json`: the casebook's coverage page and the source read use the same file | yes |
| Source read | `specs/<set>/extracted/figma-source/design/responses/`, `hashes.json`, `scope.json` | yes |
| Expanded Figma data and crops | `…/figma-source/design/out/` | no: rebuilt from the committed files, by `design.ts` itself after a pull |
| Design check plan | `<platform>/design/plan.json` | yes |
| Captures, results, verdicts | `<platform>/runs/<run>/design/` (a 750 px copy of each capture included) | yes |
| Full screenshots and sheets | `<platform>/runs/<run>/screenshots/design/` | no (local, like every run screenshot) |

So a computer that pulls the repo works on any step with no Figma call and none of the phone's files: it rebuilds
`out/` in seconds, crops from the shared board images, and checks, reviews and shows runs from the shared copies.
Commit what each step writes (the tables above and in each reference say what).

## On its own, or with what the casebook already has

- **What the casebook has is used first.** Its Design link, board images and their fingerprints (an image the
  casebook keeps current is never captured again), its inventory (icon controls), its rows and their traces (the
  route to each screen), its latest results (which row to prefer), its runs and run rules, and its eBug flow.
- **On its own.** For a feature the casebook has not read, `figma-source.ts <product>/<feature> init <Design link>`
  records the link in a new spec set (no spec files needed), then the source read and the design check run as usual:
  routes come from the Design's own flow arrows (a state drawn beside a reached screen goes through that screen), and
  a design pass walks them. A first run needs the product's app ids (`library/<product>/product.json`, README ›
  Adding a product) and the phone setup in the README.
- **When both exist**, a Design screen only the Design's arrows reach is a **gap** in the casebook table, fixed by the
  analysis (AGENTS.md *What the repo is for*); the design check never writes rows. Never edit `cases.csv`,
  `requirements.md` or the inventory from here.

## Before any Figma call

1. **Design Figma links only** (user, 2026-10-30). The file is `files.design` (`fileKey`, `page`) in the spec set's
   `extracted/figma-frames.json`, read through `figma-design`; `figma-source.ts` refuses any other role. PM and MX
   Figma files keep spec-casebook's inventory reads.
2. Follow AGENTS.md › *Figma access*: `whoami` on `figma-design` first, never switch accounts by hand, never use a
   claude.ai Figma connector. Without the sign-in, say so and stop the source branch; conformance still runs on the
   committed read.
3. Quota is small: plan calls first, chunk calls and screenshots only for boards whose fingerprint changed and whose
   shared image is not current, and stop (do not retry in a loop) when the quota runs out.

## Pages

The design check is the **Design** tab of `scripts/pages.ts` (`/design/`, beside Cases, Progress, Results and
Coverage, same language switch); `node scripts/design-page.ts <product>/<feature> <platform> [--serve]` serves or
writes it on its own. Every screen is one small card coloured by status; the comparison opens on click, so the grid
stays short.

## Tests

`npm test` runs `scripts/test/design.test.ts`: a synthetic feature with every kind of difference planted, run
through every command (routes with and without a casebook table, check, Android sources, recheck, shared copies on a
computer without the phone's files, settle, decide, eBug list, status, the page, and the source read's scope, stale
returns, shared board images and size check). Run it after changing any of these scripts.

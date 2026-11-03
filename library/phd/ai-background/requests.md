# AI Background — request ledger

Every request that changes what this feature's tables must cover or how its runs are done, from the user, a
colleague, a reviewer or RD. The spec analysis re-applies every **table** entry on each new or updated draft
(skill: "Standing inputs"), and `check.ts` fails a draft whose `requirements.md` does not cite each open table entry
for its platform. **run** entries are followed by the run rules; **analysis** entries change how the spec is read.
Add new entries at the bottom with the next ID; never renumber. Mark an entry `superseded by REQ-…` in Status instead
of deleting it.

| ID | Date | From | Request | Kind | Platform | Status |
|---|---|---|---|---|---|---|
| REQ-001 | 2026-11-03 | user | Build the AI Background tables (iOS and Android) from the PM spec and the Design Figma (casebook skill), and read the Design Figma with the figma skill. The PM Figma could not be opened by figma-pm or figma-design, so the PM PDF was supplied instead. | analysis | both | done (drafts 2026-11-03) |
| REQ-002 | 2026-11-03 | user | Readability: when a table cell holds two or more steps, each step goes on its own numbered line, whether the steps were numbered on one line (`1. … 2. …`) or written as sentences (`Open X, then tap Y`, `Tap X; tap Y`). Rule in AGENTS.md › Team preferences and `formats.md` (*One step per line*); `check.ts` warns on steps run together. Reformat the approved tables and save them directly. | tooling | both | done (iOS v2: 13 cells, Android v2: 15 cells, wording otherwise unchanged; changes in `history/edit-20261103-173713-decisions.json`) |

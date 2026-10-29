# File formats

Part of the spec-casebook skill: `requirements.md`, `draft.csv` / `cases.csv` and `update-plan.md`.

## requirements.md

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

## draft.csv / cases.csv

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

## update-plan.md

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

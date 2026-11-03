---
name: domain-knowledge
description: Take in and maintain domain knowledge for CyberLink apps (PowerDirector, PhotoDirector and others): facts no single feature spec states, such as terms, product-wide rules, PM decisions, past-bug risks, debug menus, tier and server switches, log lines and quirks. Files each fact at the right scope (CyberLink, product or feature) as a short entry, keeps the original documents local and only summaries in git, dedupes, supersedes and flags disputes, processes the parked inbox and run observations after a run, and promotes facts shared by several features. Use when someone hands over knowledge (a note in chat, "remember that…", a colleague's notes, a wiki page, an RD or PM explanation, an exploration knowledge base), asks to process the knowledge inbox, or a phase wrap-up says to. Reading the knowledge during an analysis or a run is one command in spec-casebook / figma, not this skill.
---

# Domain knowledge

Keeps `knowledge/` folders that spec-casebook, the figma skill and eBug drafting read (user, 2026-11-03). This skill
**writes** them; the skills that use them only run `node scripts/knowledge.ts …` (below, *How the other skills read
it*). All commands run from the repo root.

**Domain knowledge** is what is true of the app that a feature's spec does not say: terms, rules that hold across a
product (a failed generation refunds its credits), PM decisions and Won't Fix outcomes, what past bugs say to vary,
how to reach and drive things on the phone (debug menus, tier and server switches), what the logs call things,
platform differences, quirks of the app, the phone or the tools. It is **not** the casebook method (the skills), what
the phone holds for a run (`fixtures.md`), what the scripts read (`feature.json`, `product.json`), requests about a
table (`requests.md`) or the spec itself (`specs/`).

## Never during a run segment

Intake reads, splits and rewrites; it costs tokens a run must not spend. While a run is going on (user, 2026-11-03):

- A **segment** never runs this skill. When the phone contradicts an entry it writes an observation naming it
  (`O-3 contradicts KP-002`) and carries on as the phone shows.
- When someone gives knowledge **mid-run**, the orchestrator parks it word for word and goes on:
  `node scripts/knowledge.ts <product>/<feature> inbox add "<text>" --from "<who, where>"`. When it must apply to the
  next segment (a "don't tap X" kind of fact), add `--now`: open `--now` items head every run brief until processed.
- The inbox and the run's observations are processed **at the phase wrap-up or after the run**, in a fresh subagent
  that runs this skill (*Processing the inbox*), never in a context that ran a segment.

## Three scopes, narrowest wins

| Scope | Folder | Ids | Holds what is true of |
|---|---|---|---|
| CyberLink | `library/knowledge/` | `KC-001`… | every product (shared accounts, the credits service, ECL terms) |
| Product | `library/<product>/knowledge/` | `KP-001`… | every feature of one app (PowerDirector's Pink menu, its ⋯ debug page) |
| Feature | `library/<product>/<feature>/knowledge/` | `KF-001`… | one feature (AI Mini Drama's fault switches and log tags) |

Each folder holds one Markdown file per topic (`debug-menus.md`, `credits.md`, `glossary.md`…); `README.md` and
`inbox.md` there are not entries. A product folder may exist with knowledge only (`library/phd/`, before any table).

**Where an entry goes:** the broadest scope it is known to be true for, and no broader. Ask "is this also true of
another feature of this app?" (product) and "of another CyberLink app?" (CyberLink); when the giver did not say, put
it in the scope they were talking about and say so in `source`. **Promote** when a second feature or product shows the
same thing: write it in the broader scope with a new id and mark the old ones `superseded by <new id>`. A feature
that differs from its product gets its own entry with `overrides: KP-…`; never edit a product entry to describe one
feature.

## Entry format

```markdown
## KP-004 Credits refund on a failed generation
- kind: rule · platform: both · use: analysis, run · tags: credits, refund · authority: spec
- source: RD note on DRA261896P0043 (2026-10-21) · verified: 16.8.0 build 2610212 (2026-10-27)

A failed item costs nothing net: the ledger (Mine › Credits › Details) shows the charge row and a refund row
「Generation failed, credits returned +N」. A partial failure costs only the items that succeeded.
```

| Key | Values |
|---|---|
| `kind` | `rule` (behaviour the app must have, beyond one spec), `decision` (a PM ruling, Won't Fix / NAB outcome or version-bound value: what must **not** be asserted), `risk` (what past bugs say to vary: entry, lifecycle, size, locale…), `question` (an unresolved product issue, never an expectation), `howto` (how to reach or set something), `quirk` (a trap: the app, phone or tools behave unexpectedly), `fact` (how it is built or configured), `term` (a word and what it names) |
| `platform` | `ios`, `android`, `both` (default) |
| `use` | any of `analysis`, `run`, `ebug` (default `analysis, run`) |
| `tags` | short words a segment can filter by (`credits`, `pink`, `logs`, `server`, `tier`) |
| `authority` | rules only: `spec` (PM, Design, MX or RD stated it, or a discussion, RD fix and QA recheck agreed), `team` (a standing QA rule from the user or the team), `observed` (seen in the app, nobody stated it) |
| `source` | who gave it or where it came from, and when (required): `user 2026-11-03 (chat)`, `PM Joan, credit FAQ (sources/2026-11-03-credit-faq)`, `run.md step 4` |
| `verified` | the build and date it was last seen true on a phone; empty for what was never checked |
| `status` | `current` (default), `superseded by K…-NNN`, `disputed: <why>` |
| `overrides` | the broader-scope id this entry replaces for its feature or product |
| `aka` | ids the fact had in the source it was imported from (`K21`), so old citations are found with `--grep` |

The body is plain English sentences, as short as the fact allows (1–4 lines), with the exact on-screen texts in 「」
and paths as `A › B › C`. One fact per entry; a doc with twelve facts becomes twelve entries. `node scripts/knowledge.ts
<id> --next product` gives the next free id; `--check` validates every entry (ids, keys, links, sizes).

## Taking in knowledge

Knowledge arrives in pieces: a line in chat, a paragraph in an RD reply, a page about several features at once.
Every piece goes through the same steps (outside a run segment):

1. **Keep the source** when it is a file or a long text: `<scope folder>/sources/<YYYY-MM-DD>-<slug>/` with the
   original (git-ignored, like spec files) and a `source.json` (`from`, `received`, `files` with name, bytes and
   SHA-256, `note`). Commit `extracted/<name>.md` only when the text is worth sharing on its own (short, not already in
   the entries). A line in chat needs no folder; `source` names the chat and date. A source covering several products
   or features is kept once, in the broadest scope it touches.
2. **Strip and summarise.** Split it into durable facts and decide each one's scope, platform, kind and authority.
   Leave out session narrative, revision logs, evidence lists, screenshots and log dumps, and what the skills,
   `fixtures.md`, `feature.json` or the spec already hold (point to them instead).
3. **Look for the same fact first**: `node scripts/knowledge.ts <product>/<feature> --grep <word>` (and `--ids`). Same
   fact: add the new source to it, and update `verified` if it says so. Different and newer: write the new entry and
   mark the old one `superseded by …`. Different and you cannot tell which is right: write it `disputed: <why>` and ask
   the user. Never delete an entry; a superseded one keeps the history.
4. **Check against the spec.** A fact that contradicts the feature's current spec is an Open question in the next
   draft (the current spec wins for its feature until PM answers); the entry is `disputed` until then.
5. `node scripts/knowledge.ts <product>/<feature> --check`, then tell the user in a few lines what went where (ids and
   scopes) and what is disputed. A fact that changes a table also makes the next draft (spec-casebook › Standing
   inputs).

**Generated or second-hand knowledge bases** (an exploration-test knowledge base, a colleague's notes) are a good start
but not proof. Take one in once, as a source like any other: every rule it gives is `authority: observed` unless it
records who stated it, `verified` only when it names the build it was seen on, and `source` names the file. Record
`note: one-time import` in its `source.json`; later changes on the other side arrive only when someone brings them
again. A large one is split by scope: product-wide files and the features that have a casebook table now become
entries; the other feature files wait in `sources/` (local) until that feature gets a table. Several independent
parts can go to subagents in parallel, each owning one folder and one id range.

**Keep the store small (user, 2026-11-03).** Entries are short Markdown and are committed; originals (docs, PDFs,
exports, screenshots) stay local (`.gitignore`), and only `source.json` and any extracted text are shared. `--check`
warns about a committed file over 200 KB. A brief that grows past what a segment should read (a run brief over about
20 KB) is a sign to merge entries or tighten `use: run`.

## Processing the inbox (after a run, or when asked)

`library/<product>/knowledge/inbox.md` holds what was parked: `node scripts/knowledge.ts <product>/<feature> inbox`
lists the open items. Run this in a fresh subagent at the phase wrap-up, or when the user asks:

1. Each open item: take it in (above), then `knowledge.ts <id> inbox done <I-nnn> <entry ids>` (or `inbox done
   <I-nnn> "dropped: <why>"`).
2. The run's `observations.md`: every observation naming an entry corrects it (new text and `verified`, or a
   superseding entry); every entry the run used and found true gets `verified: <build> (<date>)`.
3. Promote facts that two features now share; `--check`; report in at most 10 lines (ids written, superseded,
   disputed).

## How the other skills read it

Reading is one command, run by the skill doing the work; none of it needs this skill loaded.

| Who | Command | What it does with it |
|---|---|---|
| spec-casebook analysis | `knowledge.ts <feature> <platform> --for analysis --out <draft>/knowledge.md` | Standing inputs 6 (`analysis.md`): `spec` / `team` rules become requirements `[KB: …]`, decisions feed the value check, risks the variants, questions the Open questions; `check.ts` enforces the rules |
| spec-casebook run segment | `knowledge.ts <feature> <platform> --for run [--tags <area>]` once at its start | How-tos, quirks, facts and decisions in full, the rest as titles (`--grep <id>` prints one), `--now` inbox items on top |
| figma design check | `--for analysis --tags <screen words>` | Terms name the screens; a `decision` that rules a difference acceptable keeps it off the eBug list |
| eBug drafts | `--for ebug` | The app's names for screens and controls; decisions that make a finding not a bug |

## First entries (2026-11-03)

The first PowerDirector and AI Mini Drama entries were copied from facts `run.md`, `run-android.md`, `analysis.md` and
AGENTS.md already stated; each names that place in `source`. Until those places point here instead, a change to one of
these facts is made in both. Then the PowerDirector and PhotoDirector exploration knowledge bases and a colleague's
PhotoDirector domain folder (K01–K76) were imported (`sources/2026-11-03-*`).

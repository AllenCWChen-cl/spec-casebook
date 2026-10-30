# Analysis: coverage passes, standing inputs, value check, verdict rules

Part of the spec-casebook skill (workflow steps 2–3), after `reading-the-spec.md`.

## Coverage passes (user, 2026-10-21)

Reading board by board finds what is drawn; these passes find what the spec states but a reading skips. Run them on
the board notes before writing `requirements.md`, on every new table and every update. Each pass writes its own
requirements (cite the board as usual). A cell the spec defines becomes a requirement and gets a row; a cell the
spec is silent on becomes an Open question, never an invented case, except the user's QA rules (Stop notice, leave
and return, waits), which apply to every job.

1. **Flow arrows.** One requirement per arrow in `arrows.json` (`[DS: flow arrow <node> <Figma URL>]`). Each needs
   a row: its own, or an existing row that walks the edge, named on the requirement as `Walked by: TC-…`
   (`check.ts` accepts that as coverage). A forward edge does not cover its return edge. A row that stops at a
   confirmation dialog covers only the arrow into the dialog: the confirming edge (Delete → the cards are gone) needs a
   row that taps it (2026-10-27: no row confirmed a History delete until the Android cross-check found it).
2. **States per job.** List every job the feature runs (for AI Mini Drama: outline, characters, Create my character,
   chat revision, storyboard, scene image and Location, chat image update, Storyboard Preview, scene video,
   video regeneration, full video, captions, download/export) and fill a grid in `requirements.md` → `### Job
   states`: start/loading, success, failure (copy and refund), retry, second failure, partial success, Stop (notice
   and credits), leave and return, longest wait, done notice (toast, push). The start/loading cell names the row that
   checks that job's own status line (「I'll create a video - give me a moment...」), not another job's (2026-10-27: the
   video job borrowed the outline's). The retry cell checks what the retry brings back (the whole result, e.g. the
   outline with its characters), and the success cell checks that no message claims a result before it exists (2026-10-27:
   Try again returned an outline without characters; 「Created the complete storyboard」 came before Generate). Each cell names the rows that check it or
   says `n/a (spec silent)` / `n/a (<reason>)`; `check.ts` fails an empty cell or a row ID that is not active.
   **Error classes (user, 2026-10-22, REQ-030):** a second grid `### Error classes` splits the failure column by the
   classes the spec names (4xxx, 5xxx, 6xxx, …): rows = jobs, each cell the rows that check that class's card copy,
   ⓘ, dialog and refund. A rule stated for one job's class (e.g. 「5xxx cards drop the ⓘ」) is checked on every job it
   names. (The scene-video 4xxx / 5xxx rows were missed until 10/22 because one failure column hid them.)
3. **Fields × rules.** List every input (idea, character description, scene description, scene-video description,
   rename, age, voice) and apply every rule the spec states for any input to all the inputs it names: limit and
   counter, paste, recover below the limit, required, each way to finish editing, discard on close. Discard on close
   means every button of the discard dialog (Keep editing keeps every input, Discard saves nothing) and every way to
   close (X, swipe, Android back), not only that the dialog appears (2026-10-27). Option lists (Gender, Ethnicity,
   languages): each option the spec names, once, in the spec's order (2026-10-27: 「Other」 listed twice).
4. **Numbers.** Every number the spec states (credits, durations, counts, sizes, percentages, line limits) gets a
   requirement that quotes it. A pick "at random from a pool of N" gets a row that draws several times and checks the
   picks vary within the pool, not one that taps twice (2026-10-27, 「Surprise me」 from 10 strings). Credit numbers are binding (see requirements.md format).
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
   empty cell or an inactive row. A failed job is a stage too (outline failed before any outline exists: the chat
   must still ask before leaving and must not be saved; 2026-10-27, O-4). Sheets with their own exits (Make your character, Finish your characters) get the
   same treatment for each exit × each of their states: X and Cancel, each answer of the dialog they open (2026-10-27:
   only Cancel → Leave anyway had a row for Finish your characters).
   **Android system Back (user, 2026-10-28, REQ-051):** on an Android table, system Back is an exit of **every** page,
   sheet, dialog, popup, picker, editor and full-screen viewer the feature opens, not only of the chat. List them in
   `### System back` in `requirements.md` (one line per screen, from `inventory.json` screens and panels plus the
   pages the PM spec names): each names the row that presses system Back there and what it must do (the same as the
   screen's own X / Cancel / Back when the spec draws one, the leave dialog where the spec asks first, closing the
   keyboard first when an input has focus), or `n/a (<reason>)`. A screen the spec gives no way out does not stay
   silent: its row records what system Back does and the spec gap is an Open question.

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

11. **Every control (user, 2026-10-28, REQ-038).** A PDF-only analysis has no `inventory.json`: trace the 「Controls
   (PDF-read)」 lists of `board-notes.md` to rows by hand and leave this pass owed (`reading-the-spec.md`, *No Figma
   access*). After the rows are written, run `node scripts/controls.ts <feature>
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

1. **Request ledger** `library/<product>/<feature>/requests.md`: every request from the user, a colleague, a reviewer or RD
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

1. `node scripts/spec-agent-gaps.ts <feature> <platform> --draft <id>` (settings in `library/<product>/<feature>/spec-agent.json`)
   lists the spec agent cases the newest `comparisons/<date>_casebook-vs-spec-agent.mapping.json` does not mark
   covered, with each case's source (`spec` = a PM, Design, Figma or MX file; `request`; `build` = an RD note;
   `casebook`; `other`). It reads the committed snapshot `library/<product>/<feature>/spec-agent/<platform>.json`; when a clone
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

Ten rules adopted from the Codex spec agent. The coverage passes and standing inputs above produce their rows; these
stay the reference for what each must contain and how a run is judged. The table stays a plain CSV: add rows and
requirements, not contracts or claim files. Each added row still needs a `Spec Ref` in `requirements.md`; a rule-derived requirement
cites its rule (e.g. `[Rule 2: wait thresholds]`), a flow arrow cites its Figma node.

1. **Flow arrows.** Coverage pass 1: every directed edge, including back, cancel, close, error and return edges, cited
   by its Figma node.
2. **Per-stage interruption matrix.** Coverage passes 2 and 8. Stop explains what stops and the credit consequence;
   leaving and returning keeps a recognizable, usable task with nothing silently lost. **Wait thresholds:** a wait
   with no other useful action longer than **5 s with no animation** or **10 s with an animation** is a bug.
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
10. **Dedupe and platforms.** Dedupe per OS (`ebugs.md`, step 3). Keep separate iOS and Android tables. Android
    baseline: no Pink menu (`run-android.md`), Pro instead of Pro+, Google Play billing, chat limits Free 10 / Pro 100.

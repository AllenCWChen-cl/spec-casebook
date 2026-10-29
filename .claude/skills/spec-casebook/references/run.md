# On-device run

Part of the spec-casebook skill: read it for any run segment, phase wrap-up or run plan. The iPhone (Appium +
WebDriverAgent) is described here; Android changes only the device commands (`run-android.md`, read both). *Run
step N* means the numbered steps at the end of this file; *verdict rule N* means `analysis.md` › Coverage and
verdict rules.

**What the phone needs** (account, build, photos for the upload cases, settings) is listed per table in
`library/<feature>/<platform>/fixtures.md`, because none of it can be committed. Check it before the first segment;
when a new row needs a new photo or account state, add it there in the same draft.

**Tap log and coverage proof (user, 2026-10-28, REQ-038).** Every press through `device.ts` (`tap`, `hold`, `burst`,
`id`, `lbl`, `tapif`, `clear`, `setval`) is logged to `<run dir>/taps.jsonl` with the element hit, a small screenshot
taken just before the press (`screenshots/taps/`, local only) and the window size; `hidekb` and `type` are logged as
input events. Start each case with `device.ts <run dir> case <ID>` (one cheap call, or the first line of its recipe)
so the log names it; without it a tap is assigned to the next case recorded in results.csv. Taps are matched to
control groups by score (`lib/coverage.ts`, REQ-040: id, label, icon words, position, element type); near ties are
flagged and a position-only tie is left for review. A control tapped with no row naming it still counts as pressed
and is flagged so the analysis adds the row. Each run aims to press every control of `control-trace.json`, not only
the ones a failing area needs. At every phase wrap-up (and on request) build
`node scripts/coverage-page.ts <feature> <platform> [--draft <id>] --runs <this run's folders>` (self-contained, local
only; `--serve [port] --lan` keeps it live, default port 4391, no auth): counts of controls pressed / inputs dismissed
/ arrows walked, the boards coloured by status, tap screenshots as proof, and what is still not covered. Report the
counts in the phase report.

**Phases, segments and resuming (user, 2026-10-19).** A large table runs in phases, never as one long run. The draft
folder's `phases.json` (written by its builder) puts every row in exactly one phase and one segment:
P1 Core (original cases, interruption and waits, credits and limits), P2 Regression (tickets without a matching core
case; tickets that repeat a core case are folded into that case's Notes), P3 Flow arrows, text and colleague
directions, P4 Templates. Each phase is its own run folder `runs/<YYYY-MM-DD>-<p1-core|p2-regression|p3-flows|p4-templates>/`
with its own report and eBug drafts; filing still waits for the user, and the next phase starts without waiting.
Phases whose cases need the same journey stages may be **merged** (user, 2026-10-20, e.g. `P23`, ordered by stage so
each drama is walked once): the merged phase lists its segments plus `origin` (each case's own phase, kept in
results.csv's Phase column and split out in the report), the original phases carry `merged_into` (`run-log init`
refuses them), and it runs in one folder, e.g. `runs/<date>-p23-regression-flows/`.
- **Rounds (user, 2026-10-22, REQ-033 / REQ-034).** Rows a draft added or changed never run only as an appended
  phase: the next round's phase lists them in the stage segments where they belong. A round phase carries
  `"round": true` and `origin` (each row's earlier phase; `P9`-style ID for rows new in that draft); `plan-page.ts`
  then shows only that phase's own results, time and tokens. Phases that never ran get `merged_into` the round. A
  **full run** lists every row by journey stage (templates after everything but the fresh-install cases), in
  segments of at most 40, with usage snapshots and the time and token summary at every segment.
- **Needs, policy blocks and the gate (user, 2026-10-20).** `phases.json` tags cases with `needs` (`video`,
  `purchase`, `low-balance`, `new-account`, `chat-count`, `voice`, `system-setting`, `app-language`) and lists the
  needs this run cannot meet under `unavailable` with the reason. `run-log init` records those cases Blocked
  (test-data) at once; a reason that starts with a disposition (`"observability: no fault switch makes STT fail"`)
  records that disposition instead. Delete a line from `unavailable` when the user provides the fixture or allows the
  setting. When a phase has `video` cases, its **first** step after setup is the preflight: one template drama
  straight to a Seedance 2.0 preview (`waitfor` with the success and failure texts), then
  `run-log.ts <run dir> gate video pass|fail "<time, duration, log cause>"`. A fail records every video case Blocked
  (defect, "Gate video failed …", retest queue); keep the preflight drama for the storyboard and video segments.
  `run-log.ts <run dir> retest` lists the queue. Timing and wait-rule cases ride on generations other cases already
  start: record the seconds `waitfor` prints instead of starting a generation just to time it.
- **Segments are the context breaks.** A segment is about 10–40 cases sharing one area and usually one drama. Finish
  it (every case recorded, including Blocked/Inconclusive), `pull-logs` and `log-slice` (run step 7), add the log
  causes to the results, then `run-log.ts <run dir> checkpoint "<state>"`. The state holds what the files don't: Pink
  toggles on, tier, Unlimited daily chat on/off, the drama in use (History title) and its stage, credit balance and
  when it was read, last log pull, anything half-done. Always also break at a phase boundary.
- **Keep going without asking, each segment in a clean context (user, 2026-10-19/20/27).** A segment never continues
  in a context that already ran another. The chat the user talks to is the orchestrator and runs every segment as a
  subagent, one at a time (Claude Code: Agent tool, general-purpose; Codex: one new native subagent per segment,
  closed after its reply; wait for it to finish before the next), with the one-line brief "Resume casebook run
  <run dir> (or start phase <Pn>) per <RUN-PLAN>: read the plan, run-state.md and `run-log.ts <run dir> next`;
  follow the spec-casebook skill (SKILL.md, references/run.md); do exactly one segment, then pull and slice the logs,
  checkpoint, update the plan's Status and Log, and reply with at most 10 lines: tally, next case, blockers." A
  phase's last segment adds the phase wrap-up (summary, `time`, tokens, eBug drafts and review page, report.md). The
  orchestrator reads only that reply (never screenshots or logs), decides the next brief from `run-log next` and
  phases.json, and repeats until every phase in the plan is done, never asking the user between segments; after a
  compaction or restart it resumes from `run-log next`. A phase not yet released carries `hold` in phases.json
  (`run-log init` refuses it; the orchestrator releases it with `CASEBOOK_RELEASE_HOLD=1` in the brief). Stop only for
  an explicit user stop, a filing/purchase/password boundary, or a blocker that stops every remaining case; a
  subagent that hits one stops and says so. Without subagents: one worker session the orchestrator clears
  (`clear_session`) and re-briefs after each segment. With neither, stop after the checkpoint and ask the user to open
  a new chat, giving the brief to paste.
- **Resuming** (after a reset, a usage-limit stop or a crash) starts with `device.ts <run dir> status` and
  `run-log.ts <run dir> next`, then a screenshot to confirm the phone matches the last checkpoint. Never redo recorded
  cases; Inconclusive ones are re-run from the recovery queue at the end of their segment.
- **Fresh-install cases (user, 2026-10-19).** A case whose expected result depends on a first launch or empty local
  data (first-time hints and bubbles, empty History, on-device counters, first-use offers) reinstalls as its own
  first step: its Precondition starts with 「Fresh install (part of this case)」, and every such case reinstalls again,
  even right after another. They go in their phase's last segment (`Fresh install`). One command (pull the logs
  first): `app-setup.ts <run dir> fresh <version> <build> [--tier Free|Pro|Pro+|System]` — uninstall, install the
  build under test, check the build number (a different build makes the case Blocked `--as test-data` with both
  numbers), restore Developer Server, sign in, set the tier, Log stage timings and Write Log on, screenshot the
  Launcher. A reinstall needs no extra approval inside a requested run, never runs outside one, and what it removed
  (local History, Pink toggles) goes in the checkpoint.
- **Setup tools** (`scripts/app-setup.ts <run dir> …`, adapted from the user's AT_PDRi suite at
  `~/Desktop/PDRA AT QE/AT_PDRi`; never run that suite itself, it can buy credits and consume generations):
  `build` (installed version and build), `reinstall <version> <build>` (from TestFlight › Previous Builds, verified;
  `--check-only` just confirms TestFlight still offers it), `first-launch` (build notes, tracking → Ask App Not to
  Track, GDPR Get Started, photo access, IAP close, notifications, until the Launcher), `server` (Launcher backend
  label), `credits`, `claim-daily`, `topup --confirm` (sandbox 2000 pack; taps Purchase only when Apple's sheet says
  「You will not be charged」, needs the user's go-ahead for the run, stops at a password prompt for the user — never
  type a password), `devserver` (⋯ debug page: Write Log ON, 「Use developer server:」 ON, 「Server Changed」 › OK,
  relaunch, Launcher label check), `fresh` (above). A run's first step is `build` and `reinstall … --check-only` to
  record whether a newer build exists; which build to test is the user's call.
- **Live run plan (user, 2026-10-20/29).** A run starts the full pages server:
  `node scripts/pages.ts <feature> <platform> --plan <RUN-PLAN.md> --plan-draft <draft id> [--lan]` serves
  http://127.0.0.1:4386/ with **Progress** (this run plan) beside Cases, Results and Coverage. Reuse a running pages
  server for the table (`ps`); restart it only when it points at another plan or a new draft takes over. Never stop it
  unless asked. Progress is `plan-page.ts --serve`, rebuilt from phases.json, each run folder's results.csv and
  run-state.md and the plan's Log; it polls every 10 s, so each `run-log.ts set` shows up live. It leads with the
  current run (`phases.json` → `"current": [ids]`, else the newest `"round": true` phase onward); earlier runs follow
  under 「Earlier runs」, collapsed. Its English / 中文 toggle covers what the page writes itself; a new label in
  `plan-page.tpl` gets its Chinese too (`tx(en, zh)` in the script, `data-zh` on fixed HTML). Without `--serve` it
  writes the static `runs/plan.html` (for publishing). **Why cases are Blocked (2026-10-27):** a panel groups the
  current run's Blocked cases by category (defect / test-data / observability), then reason; when a reason can't be
  read from the result text, the wrap-up adds the case to the run folder's `blocked-reasons.json`
  (`{ "<case>": { "group": "need:<n>" | "gate:<n>" | "upstream", "label": "…", "note": "…" } }`, fields optional) so no
  case sits in "other". `--lan` binds 0.0.0.0 (no auth: only when the user asks). Usage per phase, segment and round
  is shown as % of a 1× Pro user's limits: the main figure is "est. from token rate", calibrated in
  `runs/usage-calibration.json` (the formula and fields are in the header of `plan-page.ts`; AGENTS.md *Plan usage*);
  "Account total (shared)" stays a muted upper bound, since other users of the account are invisible here.
- **Time and token summary (user, 2026-10-19).** device.ts, app-setup.ts and run-log.ts stamp every command into
  `<run dir>/activity.log`. `run-log.ts <run dir> time [--cases]` reports wall, test and idle time (gaps over 15 min)
  per segment and case. `token-usage.ts --since <run start> <transcript.jsonl …>` sums Claude tokens from every
  transcript the run used (`~/.claude/projects/<project>/<session>.jsonl` plus `<session>/subagents/*.jsonl`, and
  handed-off sessions). At each segment start and end the orchestrator reads the app's usage card and runs
  `node scripts/usage-log.ts <runs dir> <5-hour %> <5-hour resetsAt> <weekly %> <weekly resetsAt> [note]` (`-` for
  unknown, `--at <ISO>` to backfill, "approximate" in the note when estimated, `--seat N` = seat size in Pro units:
  Pro 1, Team 6.25, the 1.25× Team account from 2026-10-22; default the previous snapshot's, never guess) →
  `runs/usage.jsonl`. On an account switch log a marker (all four values `-`, the new `--seat`, at the switch time);
  the first reading after it is a baseline. Put time, tokens and these percentages in each phase report.
- **Everything stays in the run folder:** `results.csv`, `run-state.md`, `observations.md`, `screenshots/`,
  `logs/<case ID>-<YYYYMMDD-HHMMSS>/` (git-ignored) and `ledger/<case ID>-<time>.json`. Nothing goes to ~/Downloads,
  AirDrop or a share target.

1. `node scripts/device.ts <run dir> status` — reuse a live session; `start <udid>` only if none. Never stop Appium.
   Taps are in points (screenshot pixels ÷ 3 on the 3× phones).
   **Keeping WDA alive (user, 2026-10-27; P9 lost a segment when an 18-hour-old WDA died and the phone locked, and
   the phone later stopped trusting the QA certificate):**
   - Before a run the user sets Auto-Lock to Never and keeps the phone on the USB cable; the run plan's setup records it.
   - **Every segment starts with `device.ts <run dir> restart`** (fresh WDA, PowerDirector back in front); `status`
     prints WDA's uptime. Never use `useNewWDA` or uninstall WDA: removing the last app signed by the QA certificate
     drops the phone's trust in it.
   - `device.ts` recovers once per command when WDA vanishes (restart, re-activate, retry). When WDA cannot launch it
     prints `BLOCKER (device): …` with the fix and exits 75; the segment subagent stops with that line in its reply and
     the orchestrator pushes a notification to the user and waits.
   - `start` launches the preinstalled WDA (`usePreinstalledWDA`, never uninstalls). If WDA is missing:
     `device.ts <dir> install-wda` (newest `WebDriverAgentRunner-Runner.app` in DerivedData, QA team LR55RBG94F), then
     the user trusts the certificate once. The xcodebuild mode (`CASEBOOK_WDA_PREINSTALLED=0`) keeps the signing caps
     (`xcodeOrgId` LR55RBG94F, `Apple Development`, bundle `com.cyberlinkqa1-4.WebDriverAgentRunner`). Point
     `APPIUM_LOG` at the Appium log so the BLOCKER names the exact cause.
   - **Device troubleshooting is not run time.** Debug WDA or the phone in `runs/_wda-debug-<date>/` (no results.csv),
     never in a phase's run folder, whose `activity.log` decides the run's time and tokens; move stray commands out.
2. `node scripts/run-log.ts <run dir> init <cases.csv> --phase <draft>/phases.json <phase id>`, then record every case
   as it is exercised: `set <ID> <Pass|Fail|Blocked|Inconclusive|Not run> "<what was seen>" [--as <disposition>]
   screenshots/<file>.png …` (verdict rule 4). Quote on-screen strings exactly. `summary` shows the tally; the run is
   complete only at 0 Not run and an empty Inconclusive queue.
3. Device commands: `shot`, `els [filter]`, `source`, `logs [ID]`, `ledger [ID]`, `tap`, `hold`, `drag`, `id`, `lbl`,
   `type`, `pinch X Y FROM TO [ms]`, `setval <id> <text>` (fast long input), `clear <id>`, `hidekb`, `burst X Y [n]`,
   `scrollto "<exact name>" [X TOP BOTTOM]`. The clipboard can't be set on a real device, so paste cases are typed
   and the result says so.
   **Scripts over hand-driving (user, 2026-10-20).** Round trips are what cost tokens (P1: 4,731 device commands,
   2,208 of them `els`). Use:
   - `waitfor "<success>|<failure>|…" [--timeout S]` for every wait on a generation or screen change; it prints once,
     with the elapsed seconds.
   - `pink open "[z] AI Mini Drama"`, `pink set "<row>" on|off|<option>`, `pink tap "<row>"`, `pink show`,
     `pink close`, `pink tier Free|Pro|Pro+|System` (set and tier read the row back and screenshot it; `pink tier`
     is slow, ~6 min, fix pending).
   - `do <recipe.steps> [args]` or `do "cmd ;; cmd ;; …"`: several commands as one call, stopping at the first failure
     with a screenshot. A sequence needed a second time becomes `library/<feature>/<platform>/recipes/<name>.steps`
     (one device.ts command per line, `$1`… for arguments, `?` before a line that may fail, a comment saying where
     it starts and ends). Use ids and labels in recipes, coordinates only where nothing else exists.
   - `tapif TEXT` for optional dialogs (「Allow」, intro pages).
   - `launch --lang en|zh-Hant|ja` runs the app in another language (plain `launch` returns to the device language);
     `appearance light|dark` switches Light/Dark (restore dark).
   Lookups: prefer accessibility ids and iOS predicates without `visible == 1` (it makes WDA compute visibility for
   the whole tree, ~4 s a query against ~0.6 s). When a command or recipe fails, fix the script rather than driving
   around it, and note the fix in the checkpoint. Never start a drag on the Pink panel or bubble.
   **Finding a row in a list (user, 2026-10-19):** always `scrollto`, never a hand-written drag-and-grep loop. It
   matches the exact name/label of any element type (a Pink row is a `Switch`), steps half a viewport, sweeps both
   ends and exits 1 when the row is not there. Off-screen rows carry stale frames from recycled cells, so never steer
   by an invisible element's position. After `scrollto`, screenshot before tapping, and read back every value a tap
   sets. Inside the Pink panel (use the `pink` commands) taps below the band hit the Dismiss bar or the Launcher, and
   picking an option in a value list pops back one level by itself (do not tap Back again).
4. Fault injection (PDR builds): on the Launcher scrolled to the top, `burst 267 95 10` reveals the Pink debug
   overlay; tap its bubble (37, 95) › ☰ tweaks › `[z] <feature>`. Record every toggle you change in the result text,
   and set them all back to Off before the run ends. Pink's simulated failures do not replace a real one: offline
   cases need real network loss.
   **Wi-Fi during a run (user, 2026-10-21, REQ-020):** offline cases may turn Wi-Fi off and on once the phone is
   confirmed on USB (`xcrun devicectl device info details --device <udid>` shows transport `wired`; a loopback proxy
   to the phone's Wi-Fi address is still Wi-Fi) and `device.ts status` shows the live session. Turn it back on right
   after the case and confirm the app is online. Other system settings (Airplane mode, notifications, language) need
   the user's go-ahead; cases that need them are Blocked `--as test-data` with that reason.
5. Keep off-case findings in `<run dir>/observations.md` (O-1, O-2 …, closest case, evidence).
6. Blocked needs an exact reason (missing fixture, upstream failure, account state). Never mark Pass on prior
   evidence.
7. **Logs (user, 2026-10-19).** Before the first test action: Pink › ☰ › `[z] AI Mini Drama` › **Log stage timings**
   ON (without it the `[AMDPerf]` timings are missing), screenshot it; on the Launcher's ⋯ debug page check General ›
   **Write Log** ON. Re-check both after any relaunch, reinstall or server change. The phone keeps time-stamped logs
   across launches, so pull once:
   - at the end of every segment, before its checkpoint, while nothing is generating;
   - before anything that wipes the app's data (a reinstall, Delete Database);
   - before a hand-off or an expected compaction, if the segment isn't done.
   `app-setup.ts <run dir> pull-logs <segment>` does it from any screen (⋯ › Send logs via..., into
   `logs/<segment>-<time>/`, share sheet closed; never send logs to anyone). Then `log-slice.ts <run dir> <pull dir>`
   writes `by-case/<ID>.txt` per recorded case and prints a table; read the excerpts of every Fail, Blocked,
   Inconclusive and charged case and add the cause to its result before the checkpoint (`workflow step failed …
   error="…"` is the real failure behind a silent UI; `[AIDrama Toast]` lists toasts; `authorized, credit=N` is each
   charge). Record each case right after doing it so its window is accurate. eBugs cite excerpts only, checked for
   tokens; logs stay out of git. On the ⋯ page never tap Delete Database, Delete files in sandbox, Reset user default
   or Trigger Crash, and never capture the token rows.
8. **Refund check on every failure.** Read the credit pill right before the charged action, after the failure shows,
   and again after leaving and reopening the chat (the pill can be stale). Then open Mine › Credits › Details and run
   `device.ts <run dir> ledger <case ID>`: the charge rows (Text to Image / Text to Speech / AI Video Generator) and a
   refund row 「Generation failed, credits returned +N」 must match; the log shows what was charged
   (`[AIDrama Permission] … authorized, credit=N`). The account is shared, so match rows by time and amount, never by
   balance difference alone. A failed item costs nothing net; a partial failure costs only the items that succeeded.
   Record the balances and ledger rows. A missing or wrong refund is a Fail `--as defect` with its own eBug, even
   when the failure itself is already filed.
9. **Always generate the video (user, 2026-10-19, until further notice).** Every journey that reaches the video
   settings card generates the video with Seedance 2.0 and then the full episode, even when the case under test ended
   earlier. Record whether each video finished, how long it took, its credits and any failed scenes (with logs).
   Template rows follow their own stop rule (verdict rule 6); AI Mini Drama template journeys are Blocked (REQ-019).

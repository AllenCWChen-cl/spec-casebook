# spec-casebook — agent instructions

This repo turns CyberLink product feature specs (PowerDirector first, any product with specs) into reviewed test-case tables, one per feature and platform.
Follow the skill in `.claude/skills/spec-casebook/SKILL.md` and the `references/` file it names for the task. The
repo also carries its own `ebug-draft-generator` and `ebug-tr-filer` skills for filing failures found while running a
table; their casebook overlay (`ebug-tr-filer/references/casebook-overlay.md`) comes first. Edit skills only under
`.claude/skills/`, then run `node scripts/sync-skills.ts` to copy them to `.codex/skills/` (`check.ts` warns when the
two differ).

- The approved table for a feature is `library/<product>/<feature>/<ios|android>/cases.csv`. Treat it as the correct answer
  for that feature; change it only through the review page's Save or an explicit user request.
- Keep this repo independent from the exploration-test folder, the spec agent repo and other QA tools.
- Table rows are written in English.
- Scripts are TypeScript run directly with Node ≥ 22.18 (types are stripped, not checked). Keep new scripts in
  TypeScript and run `npm run typecheck` after changing any script.
- Each feature lives in `library/<product>/<feature>/` (see its generated `README.md`): `specs/<date>/` holds every spec set
  received (original files git-ignored; `spec-set.json` and `extracted/` text kept), and `ios/` / `android/` hold
  the platform tables. Never put spec files anywhere else.
- **Old layout (2026-10-29).** The library was `library/<feature>/` before 2026-10-29. If a checkout still has a
  folder straight under `library/` that holds `ios/`, `android/` or `specs/` (e.g. `library/ai-mini-drama/`), it is a
  pre-move checkout's local files: before any other work, tell the user and move them as README › *Moving a checkout
  from the old layout* says (`rsync` into `library/<product>/<feature>/`, then remove the old folder), and have them
  restart any review or pages server with the new ID.
- The review server (`scripts/review.ts`) and the page server (`scripts/pages.ts`: review, plan and coverage on one
  address) are local processes the user may be using; do not stop them unless asked.

## Team preferences

Standing rules from the team's sessions, kept here (not in any one person's local agent memory) so everyone who
clones the repo, in Claude Code or Codex, works the same way. Add new standing preferences here, dated, in one or two
lines; put the full rule in the skill or reference file that applies it and point to it. Pointers: *overlay* =
`ebug-tr-filer/references/casebook-overlay.md`; other files are under `spec-casebook/`.

- **eBug descriptions (reviewers, 2026-10-21/27).** One action per Repro step, a Spec Link on every entry, an image on
  every entry and the log excerpt on every failure-related one (shown on the review card), no video unless asked;
  `check_ebug_format.py` enforces them (overlay rules 1–3).
- **Filing account.** Review pages prefill Creator, TRCode, source tag and method from the newest filed batch
  (`node scripts/ebug-defaults.ts`); "Same build" / "Same TR" means that batch's TR once its header names the tested
  build (overlay rule 4).
- **No comments on existing eBugs (2026-10-21, until lifted).** Never comment on, reopen or reject the fix of an
  existing ticket; rechecks and fixed tickets are listed for information only (overlay).
- **Dedupe per OS (user, 2026-10-28).** A ticket on the other OS never makes a finding a duplicate; a same-OS match is
  left off the drafts and review page (kept only in `dedupe.txt`), unless that ticket is **closed** and the bug is
  back: then it is a new card naming the closed ticket (overlay, *Dedupe per OS*).
- **eBug owner and type (RD, 2026-10-21 — replaces the 2026-10-20 rule; revertible).** Casebook findings are
  `[AIAgent]` Functional or `[UI]`, owner RD (Doc for copy), never `[UX]`; RD forwards to PM when it wants a ruling. A
  finding with no spec basis is held as a PM question, not filed. Exploration (`[AIFound]`) keeps filing `[UX]`.
  **Revert** — the user may restore the 2026-10-20 rule: "A UX problem goes to PM (BugBelong PM), who decides before
  handing it to RD. A problem that plainly needs an RD fix (performance, waits, missing behaviour) is Functional,
  owner RD, with no `[UX]` tag." Put that text back here, then follow the revert steps in overlay rule 5
  (`--allow-agent-ux` / `ALLOW_AGENT_UX=1`).
- **Pink fault switches, AI Mini Drama (2026-10-20).** 「Fail turn」 fails an LLM chat turn (outline, cast confirm,
  storyboard offer); 「Inject failure status」 only applies to a video beat once filming starts. An injected failure
  logs `AppTweaks injected <Tool> failure #N`; `status=tool_error` alone is the server's own failure. Re-check any bug
  found with injection on with every fault switch Off (or the correct one), and name the switch in the Repro steps
  (RD rejected DRI261896P0043 for using the wrong switch).
- **Request ledger (2026-10-21).** Every request about a feature's tables or runs (from anyone) goes into
  `library/<product>/<feature>/requests.md` the same session with the next REQ ID (`analysis.md` › Standing inputs).
- **Design vs PM (2026-10-21/22, REQ-029).** PM-only features become rows now (「PM-only: no Design frame yet」) and are
  updated when the Design draws them; where the two disagree the newer wins, a Design frame older than the newest PM
  file loses to it, and when dates can't tell, check the device and decide with the user (`analysis.md` pass 7).
- **What the repo is for (user, 2026-10-27, REQ-036 / REQ-037).** A thorough spec analysis, then a run that does not
  drain tokens. Missed rules are fixed in the reading step or pass that skipped them, never by copying another
  tool's cases; the spec agent comparison is a report on request only (`SKILL.md`, `analysis.md`).
- **The analysis finds spec rules itself (user, 2026-10-22, REQ-030 / REQ-032).** Dated Figma frames newer than the
  PDF are read, every annotation block and linked page is traced, hidden clauses get an observing row, and each
  variant gets its own row (`reading-the-spec.md` steps 8–9, `analysis.md` passes 9–10).
- **New rows go where they belong (user, 2026-10-22, REQ-033).** Right after the row they extend, an old row modified
  when checked on the same screen, and the next round lists them in their stage segments (`SKILL.md` step 3).
- **Every control pressed, every arrow walked (user, 2026-10-28, REQ-038 / REQ-052).** Every tappable element the
  Design, PM and MX Figma files draw is inventoried, traced to a row and pressed in runs; the coverage page proves it
  and marks everything on every board, superseded versions as Excluded (`reading-the-spec.md` step 10, `analysis.md`
  pass 11, `run.md`).
- **Figma access (user, 2026-10-28/29).** Design only through the `figma-design` MCP server (qa-dm@cyberlink.com), PM
  and MX only through `figma-pm` (qa1@cyberlink.com); never swap accounts by hand or use a claude.ai Figma connector (`.claude/settings.json` blocks it for terminal and IDE
  sessions; desktop app users disconnect it at claude.ai › Settings › Connectors);
  `whoami` before a read. Sign-ins are the user's: the agent opens a Terminal tab with `claude` and walks them through
  README Setup 5. Quota is small: bulk reads per board group, changes found by fingerprint (`figma-check.ts`), every
  read committed (`reading-the-spec.md` step 10).
- **Phone fixtures (2026-10-27).** What a run needs on the phone or account is in
  `library/<product>/<feature>/<platform>/fixtures.md`.
- **Live pages (user, 2026-10-28).** `scripts/pages.ts` serves Cases, Progress, Results and Coverage with one shared
  tab bar holding the only language switch. `+ Add case` takes free text; the agent turns open notes into rows
  (`SKILL.md` step 4, New-case notes).
- **Never uninstall PowerDirector on the QA iPhone (user, 2026-10-29, until lifted).** The build cannot be installed
  again for now, so no command may uninstall or reinstall it: `app-setup.ts reinstall` / `fresh` and every
  fresh-install case are off; those cases are recorded Blocked `--as test-data` ("PowerDirector cannot be reinstalled
  on the QA iPhone"). `app-setup.ts` refuses to uninstall unless `CASEBOOK_ALLOW_REINSTALL=1`, which only the
  user lifting this rule allows. WDA is never uninstalled either (below).
- **On the phone (2026-10-21/27).** Wi-Fi may be toggled for offline cases once the phone is on USB (other system
  settings need the user's go-ahead); rows are reached only with `scrollto` / `pink`; Auto-Lock Never, `device.ts
  restart` at every segment, never uninstall WDA; exit 75 = BLOCKER, pushed to the user (`run.md` steps 1, 3, 4).
- **One section per context (user, 2026-10-27).** Every run works section by section (segment, phase wrap-up, board
  group); the user's chat only orchestrates, each section in a new subagent with a self-contained brief, else a
  cleared worker session, else a new chat the user opens (`run.md`, "Keep going without asking").
- **Commit and push (user, 2026-10-27).** "Commit and push" (or "push") means push to `origin` right after the
  commit, with no second confirmation; a plain "commit" stays local.
- **Parallel phones: investigate only.** Running segments on several phones at once is an open idea in
  `INVESTIGATE.md`; do not build multi-device support without asking.
- **Plan usage (2026-10-21).** The account is shared, so usage-card readings overstate a run. The run plan's main
  figure is a token-rate estimate calibrated on P1 (`runs/usage-calibration.json`: P1 ≈ 3 full 5-hour windows of a 1×
  Pro account); the account total is shown muted. Seat sizes: round 1/P1 1× Pro, round 2 a Team seat = 6.25× Pro,
  round 3 (from 2026-10-22) a 1.25× Team account.

# pdr-spec-casebook — agent instructions

This repo turns PowerDirector feature specs into reviewed test-case tables, one per feature and platform.
Follow the skill in `.claude/skills/pdr-spec-casebook/SKILL.md` (Codex: `.codex/skills/pdr-spec-casebook/SKILL.md`;
both files are identical — update them together). The repo also carries its own `ebug-draft-generator` and
`ebug-tr-filer` skills for filing failures found while running a table; their casebook overlay comes first.

- The approved table for a feature is `library/<feature>/<ios|android>/cases.csv`. Treat it as the correct answer
  for that feature; change it only through the review page's Save or an explicit user request.
- Keep this repo independent from the exploration-test folder, the spec agent repo and other QA tools.
- Table rows are written in English.
- Scripts are TypeScript run directly with Node ≥ 22.18. Keep new scripts in TypeScript.
- Each feature lives in `library/<feature>/` (see its generated `README.md`): `specs/<date>/` holds every spec set
  received (original files git-ignored; `spec-set.json` and `extracted/` text kept), and `ios/` / `android/` hold
  the platform tables. Never put spec files anywhere else.
- The review server (`scripts/review.ts`) is a local process the user may be using; do not stop it unless asked.

## Team preferences

Standing rules from the team's sessions, kept here (not in any one person's local agent memory) so everyone who
clones the repo, in Claude Code or Codex, works the same way. Add new standing preferences here, dated, rather than
to a personal memory store; feature-specific run details go in the skills or the feature folder.

- **eBug descriptions (reviewers, 2026-10-21).** One action per numbered Repro step (no `>` / `›` chains); a Spec
  Link on every entry (Figma URL with node-id, else PDF + board ID); attachments on every entry: at least one image,
  the log excerpt when a log shows the cause, no video unless the user explicitly asks for one (2026-10-21).
  `check_ebug_format.py` enforces all three.
- **Filing account.** Review pages prefill Creator, TRCode, source tag and method from the newest filed batch
  (`node scripts/ebug-defaults.ts <feature> <platform>`). "Same build" / "Same TR" in decisions means the previous
  batch's TR, after confirming the TR header still names the tested build.
- **No comments on existing eBugs (2026-10-21, until lifted).** Never comment on, reopen or reject the fix of an
  existing ticket; rechecks and fixed tickets are listed for information only.
- **eBug owner and type (RD, 2026-10-21 — replaces the 2026-10-20 rule; revertible).** Casebook findings are
  spec-driven `[AIAgent]` bugs, so they never carry `[UX]`: an interaction or flow problem is Functional or `[UI]`,
  owner RD (Doc for copy), and RD forwards it to PM when it wants a ruling. A finding with no spec basis is held as a
  PM question, not filed. Exploration (`[AIFound]`) keeps filing `[UX]` for findings with no spec or in-product basis.
  **Revert** — the user may restore the 2026-10-20 rule: "A UX problem goes to PM (BugBelong PM), who decides before
  handing it to RD. A problem that plainly needs an RD fix (performance, waits, missing behaviour) is Functional,
  owner RD, with no `[UX]` tag." Put that text back here, then follow the revert steps in rule 5 of the eBug overlays
  (`--allow-agent-ux` / `ALLOW_AGENT_UX=1`).
- **Pink fault switches, AI Mini Drama (2026-10-20).** 「Fail turn」 fails an LLM chat turn (outline, cast confirm,
  storyboard offer); 「Inject failure status」 only applies to a video beat once filming starts and cannot simulate
  chat-turn failures. An injected failure logs `AppTweaks injected <Tool> failure #N`; `status=tool_error` alone is
  the server's own failure. Re-check any bug found with injection on with every fault switch Off (or the correct
  one), and name the switch in the Repro steps. (RD rejected DRI261896P0043 for using the wrong switch.)
- **Request ledger (2026-10-21).** Every request about what a feature's tables cover or how its runs go (from the
  user, a colleague, a reviewer or RD) is added the same session to `library/<feature>/requests.md` with the next
  REQ ID. The spec analysis re-applies the ledger on every draft and `check.ts` fails a draft that leaves an open
  table entry uncited (skill: "Standing inputs").
- **PM-only features are cases (2026-10-21).** Anything the PM spec states but the Design spec does not draw yet
  becomes rows now, from the PM spec, with Notes 「PM-only: no Design frame yet」. When the Design spec is updated,
  modify those rows to the Design version (or remove them only if the Design leaves the feature out on purpose).
  Design still wins wherever both specs cover the same thing (skill: coverage pass 7), except (2026-10-22): when the two
  disagree, the newer one wins (dated update boards and frame labels decide); when the dates can't tell, check the app
  on the device first, then decide with the user.
- **Wi-Fi during runs (2026-10-21).** Offline cases may turn Wi-Fi off and on during a run once the phone is
  confirmed on a USB cable; restore it right after the case. Other system settings still need the user's go-ahead.
- **Finding rows on the phone.** Reach a list row only with `device.ts scrollto` (Pink rows: `device.ts pink …`),
  screenshot before tapping, read the value back after every tap that changes a setting. No hand-written drag-and-grep
  loops, no steering by off-screen elements (recycled cells keep stale frames), taps only inside the list band.
- **Parallel phones: investigate only.** Running segments on several iPhones at once is an open idea in
  `INVESTIGATE.md`; do not build multi-device support without asking.
- **Plan usage (2026-10-21).** The account is shared, and other people's use on other machines is invisible to the
  transcripts, so usage-card readings overstate a run. The run plan's main figure is a token-rate estimate calibrated
  on P1 (`runs/usage-calibration.json`: P1 ≈ 3 full 5-hour windows of a 1× Pro account); the account total is shown
  muted. Seat sizes: round 1/P1 a 1× Pro account, round 2 a Team seat = 6.25× Pro.

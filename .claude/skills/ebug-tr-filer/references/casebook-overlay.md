# Casebook eBug rules — shared by ebug-draft-generator and ebug-tr-filer

Both eBug skills in this repo read this file before drafting or filing. These rules override anything in either
skill's body. Rule numbers are cited elsewhere (AGENTS.md: "rule 5 of the eBug overlays"); keep them stable.

## Reviewer rules (user, 2026-10-21, from the eBug reviewers) — every entry, every batch

1. **One action per Repro step.** Each numbered step is one tap, one typed entry, one swipe or one wait. No `>` /
   `›` chains: 「Mine > Credits > Details」 is three steps (Tap Mine · Tap Credits · Tap Details), and "Tap Filter,
   select Male and Indigenous, apply" is four. `check_ebug_format.py` fails a step that contains `>` or `›`.
2. **A Spec Link on every entry**, to the spec used as the reference: the Figma URL with `node-id` — the frame or
   flow-arrow node that `requirements.md` gives for the requirement when it has one, otherwise the file URL from
   `library/<feature>/specs/<date>/spec-set.json` (`figma`) with the board title from `extracted/boards.json` /
   `board-notes.md`. Only when no URL exists: the PDF name + board ID. Entries resting on a QA rule (rule 7 text,
   rule 8 checks) cite the board that shows the screen or string they are about. The format check fails an entry
   with no `Spec Link:` line, `Spec Link: none`, or a link with neither a URL nor a PDF name.
3. **Attachments on every entry:** at least one image (red-boxed frame) per bug, cited inline as `{<ver>_<slug>.jpg}`;
   plus the relevant log excerpt (`<ver>_<slug>_log.txt`) when the finding has a log cause. **Every failure-related
   entry carries its log (user, 2026-10-27):** a failed generation, turn, upload or retry, an error card or dialog,
   a charge or a missing refund, a step that ends with nothing — attach the excerpt of that failure's time window
   (the failing tool line, `status=…` / `error=…`, the `authorized, credit=N` and refund lines) even when the screen
   already shows the error, cite it inline under Result, and show it on the review page card (a 「Log」 section with
   the excerpt text) so the reviewer sees it before deciding (a 10/27 batch attached a log the page then hid). Scan
   each excerpt for tokens, `Bearer`/`authorization` lines and signed URL queries before staging it. Layout and
   content findings need no log. **No video unless the user explicitly asks for one** for that batch or entry (then
   pass `--videos-requested` to the format check); keep recordings in the run folder. The format check fails an
   entry with no image reference and any video attachment without that flag.
4. **Filing account memory.** Review pages prefill Creator, TRCode, source tag and method from the newest
   `filed_bugcodes.json` under the feature's `ebugs/` folders (`meta.creator`, `meta.tr`, the tag of the filed Short
   Descriptions, `meta.method`) — `node scripts/ebug-defaults.ts <feature> <platform>` prints them (`--json` for
   generators) — shown as 「from <batch> — confirm」, never blank. In a user's decisions, "Same build" / "Same TR"
   means that previous batch's TR when the build matches: read the TR header (`ecl_query.py tr <TR>`) and confirm it
   still names the build the findings were verified on before filing; if not, stop and ask.
5. **No `[UX]` on casebook findings (RD, 2026-10-21 — in force until the user reverts it).** The casebook tests
   against the spec, so every finding is `[AIAgent]` (Functional) or `[AIAgent][UI]`, owner RD (Doc for copy) —
   interaction and flow problems included; RD forwards one to PM when it wants a ruling. A finding with no spec basis
   is not a casebook bug: hold it and list it on the review page as a PM question. `check_ebug_format.py` fails
   `[AIAgent][UX]`. This supersedes the 2026-10-20 rule "a UX problem goes to PM (BugBelong PM)".
   **To revert** (back to `[AIAgent][UX]` with BugBelong PM): delete this rule 5 from this file (`.claude` and
   `.codex` copies), restore the 2026-10-20 wording of *eBug owner and type* in `AGENTS.md` (kept there under
   "Revert"), drop the UX line in the casebook skill's *eBug drafts and review page* step 1, and run
   `check_ebug_format.py --allow-agent-ux` and `ALLOW_AGENT_UX=1 verify_ebug_drafts.py`.
6. **No comments on existing tickets (user, 2026-10-21, until the user lifts it).** Never post a comment on, reopen
   or reject the fix of an existing eBug — not for rechecks, not for "still reproduces", not for fixed tickets. Only
   new tickets the user decided to file are created.
7. **Dedupe per OS (user, 2026-10-28).** iOS and Android bugs are deduped separately: search only the tested OS's
   product (`PowerDirector Mobile for iOS` / `… for Android`). A ticket on the other OS never makes a finding a
   duplicate: the finding is a new entry for this OS (the other OS's BugCode may go in its Note). A finding that
   matches an existing ticket on the same OS's TRs is **not listed** — no card on the review page, no Rechecks
   section, no on-hold entry; it is kept only in the batch's `dedupe.txt` (finding, case IDs, matching BugCode) for
   traceability. Exception: a same-OS ticket that is **closed** while the bug is back does not hide the finding; it
   stays a new card that names the closed ticket as related.

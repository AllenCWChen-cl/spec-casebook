# eBug drafts and review page

Part of the spec-casebook skill. The eBug skills carry the full rules (their casebook overlay comes first); this is the casebook order of work.

1. Write `ebugs/<date>/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md` with `ebug-draft-generator` rules: merge
   failed cases that share one defect, cite the case IDs on each entry's `Report step:` line, and map every
   failed case and observation in the reconciliation. A generator script for the batch can live in
   `ebugs/<date>/generators/`. Follow the reviewer rules of the eBug casebook overlay (one action per Repro step,
   a `Spec Link:` on every entry, image and log attachments, no video unless asked, no `[UX]`).
   **Spec basis check (PDRA, 2026-10-29, REQ-055; A2 had 4 invalid entries of 40).** Before an entry goes on the
   review page, open the spec text its Expect Result rests on and confirm each point, else hold it as a PM question
   or drop it:
   - the rule is written for the screen, state and entry path in the Repro steps; when the row's own path could not
     be reached, the row is Blocked (test-data) — never a finding on a nearby screen or a substitute flow;
   - no newer dated Design or PM frame draws what the app does (check every set in `specs/`, newest first), and the
     Expect quotes the Design string where Design and PM differ;
   - the expectation is the spec's own words, not our paraphrase (`arrows.json` `expected`, requirement wording) and
     not sample AI text; a team rule (wait thresholds, R-1xx user rules) or an 「待 RD 確認」 item is named as such;
   - the Spec Link points at the board that states the rule, not one that matches the app;
   - Repro steps say what the run did (a `setval` is not 「Paste」), with the platform condition (Android version,
     permission state), and every attachment shows the defect.
2. `drafts_to_bodies.py … --out upload/bodies.json --stage upload/`, then `check_ebug_format.py` (0 errors) and
   `verify_ebug_drafts.py`. Avoid `{n}`-style placeholders in body text; they are read as attachments. The format
   check fails a `>` / `›` inside a Repro step, a missing or empty `Spec Link:`, an entry with no image, a video
   attachment without `--videos-requested`, and `[AIAgent][UX]`.
3. Dedupe with `ecl_query.py dedupe upload/bodies.json --product "PowerDirector Mobile for <iOS|Android>"` (the
   tested OS only) and read each candidate with `ecl_query.py bug <code>`. **Per OS (user, 2026-10-28):** a match on
   the other OS is not a duplicate (new entry; its BugCode may go in the Note); a match on the same OS's TRs, open or
   resolved, is left off the drafts and the review page entirely and recorded only in `dedupe.txt`; a **closed**
   same-OS ticket whose bug is back stays a new entry naming the closed ticket as related.
4. Build the self-contained review page (ebug-tr-filer layout), publish it, give the link, and stop. Log excerpts on
   the cards start collapsed (`<details>`) and wrap (`pre-wrap`); nothing on the page may run past the right edge in a
   half-width window (user, 2026-10-28): check at 600 px with every section open before handing it over. Filing
   waits for the reviewer's Copy decisions, the account, the TRCode and the source tag. The page prefills Creator,
   TRCode, source tag and method from the newest filed batch (`node scripts/ebug-defaults.ts <feature> <platform>
   --json`, read by the batch's review generator), each marked 「from <batch> — confirm」 rather than left blank.
5. On the decisions: "Same build" / "Same TR" means the previous batch's TR when the build matches — read the TR
   header first and stop if it names another build. Save the decisions verbatim as `ebugs/<date>/decisions.md`
   (with any split or rewrite note), rewrite the entries, regenerate bodies, format check to 0 errors, dedupe again
   for any new entry, file (IF3: `ecl_if3.py create` then `upload`), read every bug back (Creator, severity, belong,
   TR, build, attachments on the page), write `filed_bugcodes.json` / `.md` (`ecl_if3.py export-filing`), rebuild the
   review page with the BugCodes, and add one line per batch to the run plan's Log. Existing same-OS tickets are
   never commented on (they stay in `dedupe.txt`).

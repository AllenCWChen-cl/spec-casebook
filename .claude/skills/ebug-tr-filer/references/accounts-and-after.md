# Who is filing, and after filing

Part of the `ebug-tr-filer` skill (read `SKILL.md` and `references/casebook-overlay.md` first). 

## Who is filing — verify the account before, and record it after (2026-09-16)

**Standing instruction from the user, 2026-09-16:** *"Make sure the user is set correctly; the user
name that is used should also be in the filing report just to be sure."*

`Creator` is **independent of whose token authenticates the call** (see *Create eBug — fields* in `if3_api.md`), so
a wrong `Creator` is not rejected — it silently opens every ticket in the batch under the wrong
person's name, and there is no bulk fix. The same applies to the web-form path, where the form
inherits whoever is signed into that browser profile.

**Before filing — three checks, in this order:**

1. **Resolve the intended ECL login.** Ask the user which account to file under if it is not already
   pinned in the run's notes. Do not infer it from the git author, the Mac user, or the last batch.
2. **Prove it exists in TSR** — a typo'd `Creator` returns a 500 from `create`, but only after the
   first ticket has already been attempted. `ecl_if3.py preflight` resolves the account; a login that
   does not resolve stops the run.
3. **Prove the token belongs to someone who may file on this TR.** The token's owner and `Creator`
   may legitimately differ, but say so explicitly in the report rather than leaving it implicit.

For the **web-form path**, the equivalent check is to read the signed-in account off the ECL header
before the first submit, and screenshot it. A browser profile signed in as a colleague is the most
common way this goes wrong.

**After filing — the account goes in the deliverables, not just the transcript.** Record it in all
three places, so the batch can be audited without re-opening ECL:

- the **filing report / review page** header, beside Version, Build No, Server and TRCode;
- the eBug draft file's header line (`Filed by: <ECL login> on <date>`);
- the batch's `filed_bugcodes.json` / `.md` (`export-filing`, *After filing* below in this file).

If `Creator` and the token owner differ, print **both**: `Creator: ETHAN_HSU · filed via token of
QA_CLAUDE1`. A reader who sees one name assumes it is both.

**Implemented in `ecl_if3.py create` (2026-09-16):** before sending anything it looks the `--creator`
login up in `TSR.EbugSearch` and refuses if that login has never filed (pass `--new-creator` for a
genuine first-time filer); it prints `Filing as Creator: … (token owner: …)`; and after the **first**
ticket it reads back `Creator` / `Build` / `ParentTRCode` and stops the batch on any mismatch.
On the browser-form path, screenshot the signed-in account from the ECL header before the first
submit and pass the same login to `export-filing --creator`, which fails on any ticket whose
read-back `Creator` differs.

**Read it back.** `readback` returns `Creator` per ticket — check the first ticket's `Creator`
against the intended login **before filing the remaining ones**, and stop the batch on a mismatch.
Filing one wrong ticket is a correction; filing twenty is a re-do.


## After filing

Read every filed ticket back and write the batch record — `filed_bugcodes.json` (and `.md`) in the batch folder
`library/<feature>/<platform>/ebugs/<date>/`. Together with the run's `report.md` that is the record; there is no
`.docx` report to stamp in this repo.

```bash
export ECL_TOKEN="$(cat ~/.ecl_token)"
# API path: --ledger; browser-form path: --map KEY=BUGCODE ... (keys from bodies.json).
# dispositions.json: {"F-4": "不開單（PM 裁示）", ...} for every finding not filed.
python3 scripts/ecl_if3.py export-filing \
    --ledger <batch>/upload/filed_formcodes.json \
    --bodies <batch>/upload/bodies.json \
    --dispositions <batch>/upload/dispositions.json \
    --creator ETHAN_HSU --method api+browser-upload \
    --tr TR260915-0007 --version 16.8.0 --build 189063 --server Developer \
    --out <batch>/filed_bugcodes.json
```

`export-filing` records **Creator as read back per ticket** (plus the token owner when it differs), taken from the
server rather than from what was intended. `dispositions.json` names every finding that was not filed:
`已知單，不重複開：<BugCode>` / `不開單（<reason>）` / `未結案`. Read-back text keeps literal `<` (`strip_tags`
removes only real HTML tags, so `<Claude Reviewed>` and 「<」 button names survive). BugCodes link as
`https://ecl.cyberlink.com/Ebug/eBugHandle/HandleMainEbug.asp?BugCode=<BugCode>`; never build a link from another
path. In the final summary give the counts as a markdown table, even for one report:

| Feature | Platform | AI Found # | Created # | Known # |
|---|---|---|---|---|
| AI Mini Drama | iOS | 7 | 7 | 0 |

(AI Found = distinct findings, Created = tickets filed and read back, Known = reproduces but a ticket exists.) Do not
type into the shared dashboard sheet unless the user asks.

# Deduping and calibrating

Part of the `ebug-tr-filer` skill (read `SKILL.md` and `references/casebook-overlay.md` first). Run before any review page (hard precondition 5).

### Dedupe by API — do this first

`TSR.EbugSearch` returns `ShortDescription` for **every** eBug in scope, new IF3 and old ASP alike
(common fields are the one thing the API covers for old tickets). That is ~242,000 bugs, versus
whatever a hand-exported CSV happens to hold. Search per product, and match on feature name and
symptom words rather than on the whole string — the same defect is rarely worded the same twice:

```json
{ "queryModel": "TSR.EbugSearch", "pageIndex": 1, "pageSize": 200, "sortBy": "CreateTime",
  "conditions": [ { "field": "ProductName", "term": { "query": "PowerDirector" } },
                  { "field": "ShortDescription", "match": { "query": "Auto Captions" } } ] }
```

Record what you searched for and what you found **on the review page**, per finding. "No duplicate"
is a claim the reviewer should be able to check.

If you cannot search — no token, API down, user declines — say so explicitly on the review page and
in `filed_bugcodes.md`. Filing undeduped is the user's call to make knowingly, not a silent default.

### Reading the eBug export (fallback, and the only way to calibrate)

The `.xls` is an **HTML table**, not a spreadsheet. Rows are `<tr style=...>`, so a naive
`<tr>` split finds nothing:

```python
parts = re.split(r'<tr[^>]*>', raw, flags=re.I)[1:]
cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.S|re.I)
```

Use it to calibrate, not just to dedupe. Real distributions beat guesses — in the September 2026
export of 175 bugs: **Severity was 2 (103) / 3 (71) / 4 (1)**, so proposing sev 4 is nearly always
wrong; **BugBelong** was PM / RD / PC-Doc / PC-Art (never a bare "Doc"); **Priority** was almost
always N/A. Re-derive these from the current export rather than trusting these numbers.


### Searching without burning context

The eCL MCP answers the same questions, but every row travels through the model
and costs tokens. `ecl_query.py` calls the same IF3 query endpoints directly, so a
search costs one HTTP round trip and nothing else. **Prefer it to the MCP for dedupe,
calibration and batch look-ups**; keep the MCP for one-off questions mid-conversation.

```bash
./ecl_query.py bugs --text "AI Music Generator" --product "PowerDirector Mobile for iOS" --open-only
./ecl_query.py bug  DRI261883-0063 --log      # body, RD root cause, changeset, attachments
./ecl_query.py tr   TR260915-0007             # the TR, its own bugs, and what is attached for verify
./ecl_query.py dedupe upload/bodies.json --product "PowerDirector Mobile for iOS"
./ecl_query.py calibrate --product "PowerDirector Mobile for iOS" --since 2026-08-01
```

`calibrate` **replaces the `EbugDownloadCSV.xls` export** for the Severity distribution —
it is live, so it cannot go stale. Run it before proposing severities and put the result
on the review page.

`dedupe` takes the same `bodies.json` as the format check and ranks candidates by word
overlap. It does not decide — the same defect is rarely worded the same way twice — but
on the September batch it found all 10 already-filed bugs at 100%.

Word overlap alone misses rewordings. On 2026-10-19, DRI261896P0059 ("More ideas + chip is
missing above the input…") was filed although DRI261893-0057 ("Does not display "More ideas +"
button…") was in the candidate pool: overlap was 2/9 = 22%, under the 34% cut. So `dedupe`
also **always flags (`!`)** a candidate that shares a quoted UI label with the new entry,
in either direction (only one writer may have quoted it), and one that shares a rare
adjacent word pair such as "more ideas" (carried by ≤ 2% of candidates, `--phrase-share`).
Quoted labels are searched on their own as well, so a label filed under another feature
name is still found. Read every `!` candidate.

Candidates RD/PM already declined — NAB, ProposeNAB, Won't Fix and its Propose variants,
Not Reproducible — print as **REJECTED** with a warning. Filing the same thing again
re-raises that decision. Read its status log; refile only with new grounds (a newer spec
board, a different repro) and cite the rejected bug in the Note. Otherwise drop the entry.

**Two things about the query DSL, both verified live on 2026-09-16:**

- **`match` is a substring/phrase match, not bag-of-words.** `"Video Enhance toast"` matches;
  `"grammatically inspiration"` matches nothing, because those words are not adjacent. To
  search on loose keywords, issue **one query per word and union the results** — which is
  what `dedupe` does when a Short Description has no feature name.
- **REST queries reach every model MCP exposes, and more.** `TSR.SP.GetOldEbugData`,
  `TSR.eBugByTR`, `TSR.AttachedEBug` and `TSR.EbugTags` all work over REST even though the
  guide's chapter 3 does not list them, *plus* the REST-only `TSR.ProjectTemplate` and
  `TSR.EbugLogAndData`. There is nothing the MCP can read that a script cannot.

⚠ **REST query tokens have no permission filtering** (guide 3-5) — unlike the MCP, which
filters by your ECL account. A script sees every ticket in scope, including ones you could
not open in the web UI. Treat its output as confidential and do not bulk-export it.
| `references/if3_api.md` | full IF3 API field tables, error shapes, query DSL, credential handling |

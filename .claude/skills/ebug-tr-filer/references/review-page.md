# The review page

Part of the `ebug-tr-filer` skill (read `SKILL.md` and `references/casebook-overlay.md` first). Build it before any sign-off (order of work, step 6).

### Build it from the eBug draft file, not from the report (2026-09-16)

**The cards on the review page are the eBug entries themselves.** Read
`ebugs/<YYYYMMDD>_eBug_drafts_<Feature>_<version>.md` — produced by `ebug-draft-generator` — and render one card per entry, carrying **verbatim**:

- the **Short Description** exactly as it will be pasted, in a mono strip;
- the full **Repro Steps / Result / Expect Result / Note** body, with the `摘要:` lines intact;
- the entry's proposed **Class / Severity / Owner** from its `## N.` header, and its `Basis:` line;
- its `> **QA note**` blockquote, rendered as the *My read* callout — that is what it is for;
- its images, from the entry's own `_images/NN_<ISS-ID>/` folder.

**Never build the cards from the report's step rows or from the KB table.** Those are summaries: a
reviewer who approves a paraphrase has not approved the ticket, and the wording then drifts between
what was signed off and what was submitted. If the draft file does not exist yet, generate it first
— do not reach past it to the report.

The reviewer's decisions therefore apply to real ticket text, which is what makes "Copy decisions"
directly actionable: a `Note` the reviewer rewrites is a `Note` you file.

**Generate the page's data mechanically:** `ebug-draft-generator/scripts/drafts_to_bodies.py` turns
the draft files into `upload/bodies.json` (Short Description, Description, Sev, Belong, Reproduce,
cited files, QA note, per entry). Build the cards from that JSON and run `check_ebug_format.py` on the
same JSON first — the page must never show a card that would fail the gate. The Copy-decisions table
feeds back into the same script with `--decisions`, so the approved text is the filed text.

**Two batch-level decisions sit at the top of the page, above the first card** (added 2026-09-16):

1. **Filing account** — the ECL login that becomes `Creator`, pre-filled with the proposal and shown
   in a warning colour until the reviewer confirms it. Never inferred.
2. **Filing method** — a two-way choice, with the consequence written next to each:
   - *Browser form (old way)* — the ECL web form, every field and attachment through the browser pane;
     the only option on old-ASP templates (e.g. AIFound pool 23323).
   - *API (new way)* — `ecl_if3.py create` for the ticket, then `ecl_if3.py upload <BugCode> <files…>` for
     the attachments, no browser (*IF3 attachments over the API*, `web-form.md`); IF3 templates only (e.g. PowerDirector
     iOS 16.8, 23156).
   Pre-select whichever `ecl_if3.py preflight` says the target template supports, and disable the
   other with the reason when it cannot work.

Both land in the Copy-decisions output as a header block (`Account: …` / `Method: …`), so the
reviewer's reply carries them.

**Keep the entry number stable.** The card's `F-x` is the draft's `## N.` — so a decision table, the
draft file, the upload folders (`NN_<ISS-ID>/`) and the eventual BugCode all key on one number.



**Do not ask for severity sign-off in a chat table.** A reviewer cannot judge 20+ findings from
titles alone, and the screenshots are the whole argument. Build a single self-contained HTML
artifact, publish it, hand over the link, and **stop**.

**Do not preview the page in the built-in browser pane** (user, 2026-09-16: *"just opening the html is good enough"*). Generate the HTML, publish it, hand over the link — no file:// navigation or screenshot pass first. The browser pane is for filing on ECL, not for checking the review page.

**Building the page is automatic — never offer it, never ask whether to build it** (user, 2026-09-10). The moment
verification is finished, build it in the same run: verify → build → publish → **then** stop for sign-off.

This applies however few findings there are, and whether or not any of them will be filed: a run
that produced only non-defects still gets a page, because the reviewer needs to see the evidence
behind a 非缺陷 verdict as much as behind a defect.

Load `artifact-design` first, then build a page carrying, per finding:

- the number, title, proposed **Severity** and **BugBelong**, and the source finding ID;
- the repro prose in the reviewer's language — what happened, and why it matters;
- **its own evidence, inline.** Downscale each frame with
  `sips -Z 760 -s format jpeg -s formatOptions 72 in.png --out out.jpg` and embed as a `data:` URI (37 frames ≈
  2 MB, far inside the 16 MB cap), so the page depends on no folder surviving. Thumbnails open a lightbox with a caption
  saying what the frame proves, and arrow keys step through that finding's frames.

Give every finding **three** controls, not two:

| Control | Why |
|---|---|
| Severity `1–5` | the grade |
| BugBelong | the owner |
| **file / hold** | whether it ships at all |
| **Add context** — a free-text note per finding | **the one that matters most** |

The context box is not optional polish: on 09-09 a reviewer's note re-framed "the back-swipe pans the clip" into
"the screen offers no exit, so the user reaches for a gesture that damages the composition" — a better ticket that
existed only in the reviewer's head. Ask for it per finding, and **rewrite the body from what comes back** rather
than filing your original wording.

Persist the controls in `localStorage` (wrapped in try/catch) and give the page a **Copy decisions**
button that emits a markdown table of `# / Sev / Belong / Type / UX check / Action / Short Description / Note`, so
the reviewer pastes one block back instead of transcribing rows. `UX check` is `confirmed`, `reclassify`
or `—` (see *UX entries* below); `drafts_to_bodies.py --decisions` refuses to stage a filed `[UX]` entry
without `confirmed`.

### The layout that works — build this, don't reinvent it

Signed off by the reviewer on 2026-09-15 ("this format is great... easy picking"). Reproduce this
structure; spend your design effort on the writing, not on a new arrangement.

**Page head.** Eyebrow (`programme · product · creator`), title, one-sentence instruction, then a
horizontal strip of `<dt>/<dd>` facts: **Version, Build No, Server, Account, TRCode**. Render any fact
you do not have in a warning colour with the word *needed* — an unfilled TRCode must be visible from
the top, not discovered at filing time.

**Calibration note, right under the tally.** State the Severity distribution from the most recent
eBug export and what you concluded from it. The reviewer needs to see *why* nothing is proposed at
Sev 4, and to overrule it if their pool differs.

**One card per finding**, in this order:
1. `F-x` id in the severity colour, title, and status chips (`CONFIRMED`, `Reproduced 3×`,
   `Evidence gap`, `Control passed`).
2. Why it matters, in the reviewer's language — consequence first, mechanism second.
3. The **Short Description** verbatim in a mono strip, so they see exactly what will be filed.
4. Repro steps in a collapsed `<details>` — present but not in the way.
5. **The evidence strip** (below).
6. A **My read** callout in the accent colour whenever your proposal needs defending — why this
   Severity, why this owner, what you are unsure of.
7. The decision bar.

**Severity is encoded as a 4px left border on the card**, recoloured live as the reviewer changes it,
so the page re-reads at a glance after triage. Held findings drop to ~45% opacity — visibly parked,
still readable.

**The decision bar carries four controls, in this order:** `file / hold` checkbox · Severity `1–5`
segmented · **BugBelong dropdown pre-filled** with your proposal (`RD / Setup Kit / PC-Art / PC-Doc /
PM / Marketing / RD-ECL` — never a free-text box; the reviewer should be picking, not typing) ·
Issue Type dropdown · and a wide **Add context — what am I missing?** field that grows to fill the row.
Label that last one in the accent colour: it is the control that matters most and it must not read as
an afterthought.

**Three panels after the findings**, each mandatory even when empty — say "none" rather than omitting:
*Reproduced but deliberately not filed* (with duplicate BugCodes named, or an explicit statement that
no export was available to dedupe against), *Gaps you should know about*, and the Copy-decisions block.

### UX entries — make them impossible to miss (2026-10-21)

RD asked that every AI-filed `[UX]` ticket be checked by a person first, so a `[UX]` card must stand out
from the rest of the page and cannot be filed by default. `bodies.json` carries `ux` and `basis` per
entry for this.

- **Page head:** a tally chip in the UX colour — 「UX ×N — each needs your UX check」 — that jumps to the
  first unchecked UX card, next to the severity tally. Show 「UX ×0」 rather than omitting it.
- **The card:** a full-width banner across the top of the card in a colour used for nothing else on the
  page (not a severity colour), reading **「UX — confirm before filing: no spec or in-product basis;
  goes to PM」**, with the entry's `Basis:` line verbatim under it. Give the card a thick outline in
  the same colour, kept after triage.
- **The decision:** a **UX check** control, first in the decision bar, with three choices —
  *Confirmed UX → PM* · *Reclassify → Functional / UI → RD* · *Not a bug → hold*. The card starts on
  **hold** and its `file` toggle stays disabled until a UX check is chosen; *Confirmed* sets BugBelong
  to PM, *Reclassify* switches the Type dropdown off UX (the agent then drops `[UX]` and rewrites the
  `Basis:` line before filing).
- **Under the banner, the test the reviewer applies:** 「Does a spec, or another feature of this app,
  already say what correct is? → Reclassify. Only another product's behaviour, or nothing? → Confirm.」
- **Non-UX cards with a `Basis: In-product — …` line** show it as a neutral chip beside the Short
  Description, so the reviewer sees which feature and document the expectation rests on.
- `[AIAgent]` batches have no UX cards; one that appears is a draft error — fix the draft, not the page.

### The evidence strip

Per finding, a horizontally scrolling row of ~104px thumbnails, each `n/total` labelled. Clicking one
opens a lightbox showing the full frame, **a caption saying what that frame proves** (not what it
shows), and `← Prev / F-x · n of N / Next →`; arrow keys step, Escape closes. Order the frames as the
argument runs — for a "the export is broken" finding that is: correct preview → correct timeline →
the moment it goes wrong → the proof → a healthy control for contrast.

Downscale with `sips -Z 760 -s format jpeg -s formatOptions 72 in.png --out out.jpg` and embed as
`data:` URIs. Thirty phone frames came to ~1.0 MB of JPEG, ~1.4 MB of base64 — far inside the 16 MB
cap, and the page then survives the session folder being deleted. **A finding with no captured frame
says so on its own card**, with a `Evidence gap` chip, rather than sitting silently among evidenced
ones.

Also put on the page, so the reviewer sees the whole picture: the TR and build under test, findings
reproduced but **deliberately not filed** with the duplicate BugCodes named, findings **not
re-verified** this round, and any evidence gap you know about. Flag a finding with no captured frame
in the page itself rather than letting it pass as evidenced.

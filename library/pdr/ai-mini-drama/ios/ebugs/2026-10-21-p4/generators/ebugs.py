#!/usr/bin/env python3
"""Build the AI Mini Drama iOS eBug draft batch for phase P4 (Templates) of the 2026-10-19 run plan, round 2.

Writes library/pdr/ai-mini-drama/ios/ebugs/2026-10-21-p4/20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0.md and the sibling
_images/ folder (one NN_ISS-ID folder per entry, JPEGs named 16.9.0_<slug>.jpg). P4 ran with 「Generate」 withheld on
every template (user, 2026-10-20 19:0x): the 21 card rows all passed, the 20 journey rows are Not run, so every entry
comes from observations O-1…O-8. Continues the ISS-AMD sequence (P1 32-39, P23 40-45). Nothing is filed.
"""
import csv, json, os, re, shutil, subprocess, sys

ROOT = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/ios"
RUN = f"{ROOT}/runs/2026-10-21-p4-templates"
OUT = f"{ROOT}/ebugs/2026-10-21-p4"
NAME = "20261021_eBug_drafts_AI-Mini-Drama-P4_16.9.0"
V, B = "16.9.0", "189729"
TAG = "AIAgent"
DEVICE = "Device: iPhone 17 Air / iOS 26.2.1"
SPEC = "/Users/ethanhsu/Desktop/pdr-spec-casebook/library/pdr/ai-mini-drama/specs/2026-10-19"
_SS = json.load(open(f"{SPEC}/spec-set.json"))
_BOARDS = json.load(open(f"{SPEC}/extracted/boards.json"))
_TITLE = {b["id"]: b["title"] for v in _BOARDS.values() for b in v}
DS = "AI Mini Drama - Design Spec.pdf"


def link(pdf, board):
    which = "Design spec" if "Design" in pdf else "PM spec"
    return f"Spec Link: AI Mini Drama {which}, {_TITLE[board]} board - {_SS['figma'][pdf]}"


E = [
 dict(iss="ISS-AMD-46", title="Template detail player crops the cover title on 7 of 20 templates", cls="UI", sev=2, owner="RD",
  cases=["O-2", "O-5", "O-6", "O-7"], rep=(7, 7),
  note="Observations O-2 (P4-a), O-5 (P4-b), O-6 (P4-c) and O-7 (P4-d), seen on passing card rows TC-241, 247, 249, 253, 257, 263, 267. The detail page's player shows the 3:4 cover art filled into the 9:16 player, so the sides of the cover are cut and the title lettering with them: The Art of Falling (「The Art / of Falli…」), The Dragon's Chosen Bride (「…HOSEN BRID…」), Awakening the Storm (last 「G」 of AWAKENING), The Rebel and the Valedictorian (「Valedictoria…」), The Fake Engagement (「…ngagemen…」), The Heiress and Her Protector (「PROTECTOR」 both edges) and Six Things You Didn't Know (「SIX THINGS」 / 「YOU DIDN'T KNOW」 both edges, the speaker button on the 「W」). The other 13 fit. The More cards and the chat's cover bubble show the full lettering. Seen once per template on the cover frame shown when the detail page opens or is returned to from the chat. RD owns the player fit (aspect-fit, or Design supplies 9:16 covers with a safe area) — Design may prefer new assets; switch the owner if so. No log (layout only).",
  short="Template detail player cuts off the cover title on 7 templates",
  steps=["Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap More", "Swipe up to Family & Life", "Tap The Heiress and Her Protector", "Look at the cover frame the player shows as the page opens"],
  res="The cover title is cut off at both edges of the player, while the More card shows it in full.",
  res_zh="詳細頁播放器中的封面標題左右兩側被裁切（如 PROTECTOR、SIX THINGS），More 頁卡片則完整顯示。",
  exp="The cover title is fully visible in the detail player, as on the More card.",
  exp_zh="詳細頁播放器應完整顯示封面標題，與 More 頁卡片一致。",
  links=[link(DS, "ds-template-detail")],
  imgs=[("obs-heiress-title-crop", "amd46_heiress_crop"), ("obs-six-things-title-crop", "amd46_six_things_crop"),
        ("obs-dragon-title-crop", "amd46_dragon_crop"), ("tc241-left", "amd46_art_of_falling_detail"),
        ("tc263-roster-pos1", "amd46_more_cards_full")]),

 dict(iss="ISS-AMD-47", title="Proposal Across Every Lifetime cover art is titled Proposal Across Lifetimes", cls="UI", sev=2, owner="PM",
  cases=["O-4", "TC-265"], rep=(2, 2),
  note="O-4 (P4-a roster, More card) confirmed in P4-d TC-265: the cover lettering reads 「Proposal Across Lifetimes」 on the More card, in the detail player's cover frame and in the chat's cover bubble, while the template name (card caption, detail title, cover bubble label, roster slug proposal-across-every-lifetime) is 「Proposal Across Every Lifetime」. Same on the 10/19 roster. TC-265 itself passed (the title and cover are shown); this is the mismatch between them, the same kind of defect as DRI261894P0008 (The Fake Engagement cover titled Billionaire Romance, Belong PM, S3), which no longer reproduces on 189729. PM to decide which title is right (the asset or the name).",
  short="Proposal Across Every Lifetime cover reads Proposal Across Lifetimes",
  steps=["Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap More", "Swipe up to Family & Life", "Tap Proposal Across Every Lifetime", "Tap Make my version"],
  res="The cover art reads Proposal Across Lifetimes, but the template name is Proposal Across Every Lifetime.",
  res_zh="封面標題為 Proposal Across Lifetimes，與模板名稱不符。",
  exp="The cover art title and the template name match.",
  exp_zh="封面圖標題應與模板名稱一致。",
  links=[link(DS, "ds-template-detail")],
  related="DRI261894P0008 (same kind of mismatch on The Fake Engagement; no longer reproduces on 189729)",
  imgs=[("obs-proposal-cover-zoom", "amd47_more_card"), ("obs-proposal-detail-cover", "amd47_detail_cover"), ("tc265-chat-open", "amd47_chat_bubble")]),

 dict(iss="ISS-AMD-48", title="Garbled sign text in three template sample videos", cls="UI", sev=3, owner="PM",
  cases=["O-3", "O-6", "O-8"], rep=(3, 3),
  note="User QA rule 7 (scan all on-screen text), applied to the template sample videos on the detail pages: three of the 20 show AI-garbled lettering on signs. Glad We Came (O-3, TC-243): the phone screen held up reads 「GREEN I'ECH」 for GREEN TECH above 「BEACH CLEANUP」. After Closing (O-6, TC-255): the café sign in the opening frame reads 「CFIDKAICE」. The Ring He Worked For (O-8, TC-271): hanging sign 「MIIANNY RING」 and unreadable facade/door lettering (only the window's 「MOON RI…」 is real words). The other 17 previews either have no readable text or spell it correctly. Content of the template assets (AppCMS), so PM owns it; Spec Link: the Template Detail board (R-007, template video on the detail page), checked under rule 7. No log (video content).",
  short="Template sample videos show garbled sign text",
  steps=["Launch the APP", "Tap AI Mini Drama on the Launcher", "Tap More", "Tap Glad We Came", "Watch the sample video", "Tap Back", "Tap After Closing", "Watch the sample video", "Tap Back", "Tap The Ring He Worked For", "Watch the sample video"],
  res="Signs read GREEN I'ECH, CFIDKAICE and MIIANNY RING in three sample videos.",
  res_zh="範例影片中的招牌文字為亂碼：GREEN I'ECH、CFIDKAICE、MIIANNY RING。",
  exp="Text shown in template sample videos is spelled correctly, or the frames show no readable text.",
  exp_zh="模板範例影片中的文字應拼寫正確，或畫面中不出現可辨識的文字。",
  links=[link(DS, "ds-template-detail")],
  imgs=[("obs-glad-green-tech", "amd48_glad_we_came"), ("obs-after-closing-sign", "amd48_after_closing"), ("obs-ring-sign", "amd48_ring_he_worked_for")]),
]

FIXED = [
 ("TC-257", "DRI261894P0008", "TRCreated — The Fake Engagement template uses cover art titled Billionaire Romance",
  "Cover lettering reads 「The Fake Engagement」 on the More card, detail page and chat bubble (P4-c, 06:30)."),
]
NOT_CHECKABLE = ("DRI261896P0047 (Back during the template outline — needs 「Generate」, withheld), DRI261896P0049 (credit pill "
                 "outdated on template/More pages — the balance did not change during P4: 19285 throughout), DRI261896P0035 "
                 "(Larger Text — system setting not changed).")

QUESTIONS = [
 ("O-1", "spec-addition (Design)", "The detail page is a horizontal pager over the whole category row (swipe to the next template; it stops at the row's last). The Template Detail board shows one template and no swipe. Intended? (Hidden pages keep their own Unmute buttons in the accessibility tree; VoiceOver users may land on them.)"),
 ("R-006 / TC-234", "question (Design)", "Design names the categories Office Romance and Fantasy World; the live roster (server data, frozen 10/19 and 10/21, identical) says Workplace Romance and Fantasy & Destiny. Confirm the roster is the source and the board names are placeholders."),
 ("R-010 / Q-1", "answer", "The app names the template 「Six Things You Didn't Know」 with the apostrophe, matching the cover; Design's 「Didnt」 label looks like the typo. Close Q-1 that way unless Design disagrees."),
 ("Card rows (TC-235…273)", "table note", "The card rows expect 'title and premise match the card', but the chat shows no premise before 「Generate」 (R-009: format question first). With Generate withheld only the title and cover bubble could be matched; the premise check belongs to the journey rows. Consider moving it there in the next table revision."),
]

NOT_RAISED = [
 ("O-1 (tool note)", "`id Unmute` hit a hidden pager page and paged the view (first TC-237 attempt)", "Test-tool behaviour, fixed in recipes/template-card.steps (taps by point, checks the card id)."),
 ("Format card", "「Generate」 on the template format card shows no price", "Not a defect: R-018 asks only for a Continue/Generate button; the price appears on later cards."),
]

MAP = {
 "O-1": "question (Design, spec-addition)", "O-2": "1. ISS-AMD-46", "O-3": "3. ISS-AMD-48", "O-4": "2. ISS-AMD-47",
 "O-5": "1. ISS-AMD-46", "O-6": "1. ISS-AMD-46 + 3. ISS-AMD-48 (+ DRI261894P0008 fixed)", "O-7": "1. ISS-AMD-46",
 "O-8": "3. ISS-AMD-48 (+ O-4 confirmation → 2. ISS-AMD-47)",
}


def jpg(src, dst):
    subprocess.run(["sips", "-Z", "1400", "-s", "format", "jpeg", "-s", "formatOptions", "80", src, "--out", dst],
                   check=True, capture_output=True)


def main():
    results = {r["ID"]: r for r in csv.DictReader(open(f"{RUN}/results.csv", encoding="utf-8-sig"))}
    tally = {}
    for r in results.values():
        tally[r["Result"]] = tally.get(r["Result"], 0) + 1
    fails = [k for k, r in results.items() if r["Result"] in ("Fail", "Blocked", "Inconclusive")]
    notrun = [k for k, r in results.items() if r["Result"] == "Not run"]
    bad = [k for k in notrun if "Generate withheld (user, 2026-10-20)" not in results[k]["Actual"]]
    obs = sorted(set(re.findall(r"^\| (O-\d+) \|", open(f"{RUN}/observations.md", encoding="utf-8").read(), re.M)), key=lambda x: int(x[2:]))
    if fails or bad or sorted(MAP) != sorted(obs):
        sys.exit(f"reconciliation incomplete: fails {fails}, odd Not run {bad}, obs {obs} vs map {sorted(MAP)}")
    num = {e["iss"]: i for i, e in enumerate(E, 1)}
    for k, v in MAP.items():
        for n, iss in re.findall(r"(\d+)\. (ISS-AMD-\d+)", v):
            if num[iss] != int(n):
                sys.exit(f"{k}: {iss} is entry {num[iss]}, map says {n}")

    img_root = f"{OUT}/{NAME}_images"
    if os.path.isdir(img_root):
        shutil.rmtree(img_root)
    os.makedirs(img_root)
    L = []
    w = L.append
    w(f"# AI Mini Drama (iOS) — eBug drafts, phase P4 (Templates), PDR-I {V} build {B}")
    w("")
    w(f"**Source:** pdr-spec-casebook run `library/pdr/ai-mini-drama/ios/runs/2026-10-21-p4-templates/` — the 41 P4 cases of the approved table `cases.csv` v1 (TC-234 roster + 20 card rows + 20 journey rows), run 2026-10-21 05:44 → 06:53 on {DEVICE[8:]} through Appium/WebDriverAgent, TestFlight build {V} ({B}), Developer Server, Pro+. Result: {tally.get('Pass', 0)} Pass, {tally.get('Fail', 0)} Fail, {tally.get('Blocked', 0)} Blocked, {tally.get('Not run', 0)} Not run. **「Generate」 was withheld on every template (user, 2026-10-20 19:0x):** the card rows checked everything up to it (roster position, cover, title, preview playback with sound / mute / pause, Make my version, the chat opening, every format option, Back / 「Leave this chat?」, History unchanged); the 20 journey rows are Not run 「Generate withheld (user, 2026-10-20)」. 0 credits spent. Observations O-1…O-8: `runs/2026-10-21-p4-templates/observations.md`.")
    w("")
    filed = f"{OUT}/filed_bugcodes.json"
    if os.path.exists(filed):
        fj = json.load(open(filed, encoding="utf-8"))
        m = fj["meta"]
        codes = ", ".join(f"{b['iss']} {b['bugcode']}" for b in fj["bugs"])
        w(f"**Filed by:** {m['creator']} on {m['filed_on']} via {m['method'].upper()} on {m['tr']} ({m['version']} build {m['build']}) — {codes}. Decisions: `decisions.md`.")
    else:
        w(f"**Decisions (user, 2026-10-21):** `decisions.md` — account Ethan_Hsu, method API, `[{TAG}]`, TR261019-0014 (same build as P1). Not filed yet.")
    w("")
    w("Rules: UX problems go to PM, RD fixes are Functional without [UX]; reviewer rules 2026-10-21 — one action per Repro step, a Spec Link on every entry, at least one image per entry and the log excerpt where the finding has a log cause. Design outranks PM.")
    w("")
    w(f"**What is drafted:** no P4 case failed, so all {len(E)} entries come from off-case observations on passing card rows (cosmetic and content problems on the template assets). Spec gaps go to the Questions table, not tickets. Entries are numbered in run order; trust the ISS-ID over the number.")
    w("")
    w("Legend — Class: Functional / UI / UX · Severity: S1 critical and blocking only, S2 important, S3 moderate, S4 minor · Owner: RD (build differs from a correct spec), PM (a ruling or asset change is needed), Doc (on-screen copy). Every entry links the spec board it is checked against (entries resting on a QA rule cite the board that shows the screen).")
    w("")
    for n, e in enumerate(E, 1):
        folder = f"{n:02d}_{e['iss']}"
        os.makedirs(f"{img_root}/{folder}")
        names = []
        for png, slug in e["imgs"]:
            src = f"{RUN}/screenshots/{png}.png"
            if not os.path.exists(src):
                sys.exit(f"missing screenshot {src}")
            name = f"{V}_{slug}.jpg"
            jpg(src, f"{img_root}/{folder}/{name}")
            names.append(name)
        tagtype = "" if e["cls"] == "Functional" else f"[{e['cls']}]"
        short = f"PDR-I {V} - [{TAG}]{tagtype} AI Mini Drama: {e['short']}"
        w("---"); w("")
        w(f"## {n}. {e['iss']} — {e['title']}  ·  Class: {e['cls']}  ·  Severity: S{e['sev']}  ·  Owner: {e['owner']}")
        w("")
        w(f"**Report step:** {', '.join(e['cases'])}  ·  **Reproduce:** {e['rep'][0]}/{e['rep'][1]}  ·  **Verified on:** {V}.{B}")
        w("")
        w(f"> **QA note — not pasted into eBug.** {e['note']}")
        w("")
        w("**Short Description:**"); w(""); w("```"); w(short); w("```"); w("")
        w("**Description:**"); w(""); w("```"); w("Repro Steps:")
        for i, s in enumerate(e["steps"], 1):
            w(f"{i}. {s}")
        w(f"{len(e['steps']) + 1}. Check the result")
        w(""); w("Result:"); w(e["res"]); w(f"摘要：{e['res_zh']}"); w(" ".join("{" + x + "}" for x in names))
        w(""); w("Expect Result:"); w(e["exp"]); w(f"摘要：{e['exp_zh']}")
        w(""); w("Note:"); w(DEVICE)
        for l in e["links"]:
            w(l)
        if e.get("related"):
            w(f"Related: {e['related']}")
        w("<Claude Reviewed>"); w("```"); w("")
        w(f"**Images:** `{NAME}_images/{folder}/`"); w("")

    w("---"); w("")
    w(f"## Rechecks — existing tickets that still reproduce on {B}")
    w("")
    w("None: no existing ticket reproduced in P4 (Generate was withheld, so the journey-stage template tickets were not reached).")
    w("")
    w(f"## Fixed — tickets that no longer reproduce on {B} (candidates to close)")
    w("")
    w("| P4 case | Ticket | Status — ticket says | What P4 saw |")
    w("|---|---|---|---|")
    for c, t, title, saw in FIXED:
        w(f"| {c} | {t} | {title} | {saw} |")
    w("")
    w(f"Not checkable this phase: {NOT_CHECKABLE}")
    w("")
    w("## Questions and spec additions (PM / Design, not tickets)")
    w("")
    w("| Item | Disposition | What to decide |")
    w("|---|---|---|")
    for k, d, q in QUESTIONS:
        w(f"| {k} | {d} | {q} |")
    w("")
    w("## Not raised (for the record)")
    w("")
    w("| Item | What was seen | Why not raised |")
    w("|---|---|---|")
    for k, a, b in NOT_RAISED:
        w(f"| {k} | {a} | {b} |")
    w(f"| Not run ({len(notrun)}) | {', '.join(notrun)} | Journey rows: 「Generate withheld (user, 2026-10-20)」 — no verdict, no finding. |")
    w("")
    w("## Reconciliation against the report")
    w("")
    w(f"The run is the report: 0 failed cases, 0 Blocked, {len(notrun)} Not run (Generate withheld), observations {obs[0]}…{obs[-1]}.")
    w("")
    w("| Step | Count | Running total |")
    w("|---|---|---|")
    w("| Failed cases | 0 | 0 |")
    w(f"| Observations ({len(obs)}) | {len(obs)} | {len(obs)} |")
    w("| O-1 → question (Design), not an entry | −1 | 7 |")
    w("| O-2, O-5, O-6 (crop part), O-7 → one entry for the shared cause (ISS-AMD-46) | −3 | 4 |")
    w("| O-3, O-6 (sign part), O-8 → one entry for garbled sample-video text (ISS-AMD-48); O-6 counted once above | −2 | 2 |")
    w("| O-4 → ISS-AMD-47 (confirmed in O-8 / TC-265) | +1 | **3 to file** |")
    w(f"| Not run journey rows ({len(notrun)}) → no verdict | 0 | {len(E)} |")
    w("")
    w("Dispositions: **defect** → entries 1–3 (cosmetic/content); **spec-addition / question** → Questions table; **test-data / observability** → none; **withheld** → 20 journey rows.")
    w("")
    w("### Row-by-row map")
    w("")
    w("| Item | Result | Became |")
    w("|---|---|---|")
    for o in obs:
        w(f"| {o} | observation | {MAP[o]} |")
    w(f"| {', '.join(notrun)} | Not run (withheld) | no verdict |")
    w("")
    w("### Owner split")
    w("")
    w("| Owner | Entries |")
    w("|---|---|")
    for o in ("RD", "PM", "Doc"):
        w(f"| {o} | {', '.join(str(i) for i, e in enumerate(E, 1) if e['owner'] == o) or '—'} |")
    w("")
    w("### Filing order")
    w("")
    w("RD first, then PM: " + ", ".join(f"**{i}**" for o in ("RD", "PM", "Doc") for i, e in enumerate(E, 1) if e["owner"] == o) + ". Also comment on DRI261894P0008 that it no longer reproduces on 189729.")
    w("")
    open(f"{OUT}/{NAME}.md", "w", encoding="utf-8").write("\n".join(L))
    print(f"wrote {len(E)} entries → {OUT}/{NAME}.md")


if __name__ == "__main__":
    main()

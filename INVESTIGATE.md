# Ideas to investigate (not implemented)

## Run segments on several phones at once (user, 2026-10-20)

Idea: with more than one iPhone connected, send different segments to different phones so they run at the same time
and the wall time drops. Status: **investigate only — do not implement yet** (user, 2026-10-20).

What we know so far:
- **Device side looks feasible.** Appium can hold one session per phone; each needs its own WebDriverAgent port
  (`appium:wdaLocalPort` 8100, 8101 …, `appium:mjpegServerPort`), so `device.ts start` would take those per UDID.
  Each phone would get its own run folder (`.session`, results.csv, activity.log), which also avoids two writers on
  one results.csv. `plan-page.ts` already merges the latest result per case across run folders.
- **Shared account is the main conflict.** Credits and the ledger are per account (already noisy from other devices,
  O-2/O-10/O-20/O-25), and so is the daily chat quota. Segments that read balances, ledgers, quotas or tiers must stay
  on one phone; History is local (a fresh install empties it), and Pink toggles are per device.
- **Server load.** Parallel generations (storyboard, video) may hit server limits or change timings, which matters
  for the wait-rule cases.
- **Claude side.** Each phone needs its own segment worker running at the same time. Total tokens stay the same, but
  the usage window drains about twice as fast; one usage-limit stop halts both phones.
- **Bigger win first.** P1 had 7 h 52 m test time in 21 h 53 m wall time; most of the loss was idle (overnight Appium
  session expiry, handoff stalls), not phone time. Measure the next round's idle time with the new one-chat
  orchestration before deciding.

Questions to answer before building:
1. Which segments are independent of account state (candidates to split), and which must share one phone?
2. Do two phones on the same account interfere in the app (History sync, chat quota, credit pill)?
3. Does the Developer Server tolerate two concurrent video generations from one account?
4. Is a second test account available, so each phone has its own credits and quota?

## Button and arrow coverage from Figma (REQ-038, spike 2026-10-28)

Goal: prove every Figma button that should be pressed was pressed and every flow arrow walked (counts + an HTML map).
Spike on the AI Mini Drama Design file (`dZk5HLzZTdcZwWwvN9aZfZ`, page UI_26.10GM, section 10.GM), read-only through
Figma MCP `use_figma`. Status: **built 2026-10-28** (skill: Reading the spec step 10, coverage pass 11, tap log;
AGENTS.md). Open: the PM Figma file (`44RyrcOcWi2MvhGci9bO5F`, section 2016:2) is not inventoried yet — the Figma MCP
limit of the View seat stopped it; its main board 2419:20605 holds 6,119 instances and may need splitting.

Arrows:
- Flow arrows are `VECTOR` nodes named `<layer> --> <frame>` (a flow plugin), arrowhead = the vertex with
  `strokeCap: ARROW_LINES`. There are no `CONNECTOR` nodes and no prototype `reactions`.
- The layer names are stale copies (`Action Button_M --> …` starts on `chips`), so use geometry: tail vertex
  (degree 1, no arrowhead) and head vertex in absolute coordinates, hit-tested against the phone screens
  (frames 300–450 × 600–1000) and the smallest instance under the tail. 237 screens; most arrows resolve to
  source control + from-screen + to-screen. Arrows whose tail is not on a control are automatic transitions.
- 88 named arrows, the same count as `arrows.json` but not the same set. Missing from `arrows.json` and from
  `requirements.md`: `4299:168955` (scene error card 「Edit」 → description editor), `4299:132149` (error card ⓘ →
  popover), `4299:168964` (edited scene → regenerated scene); `2811:105837` is a duplicate stacked on `2811:97718`.
  `arrows.json` instead lists two annotation pointers (`2811:90468`, `2820:113559`, both 「Vector 2758」).
- 9 more arrowheads named 「flow line」 in 「1016_Chat navigation」 (`4877:33073`–`4877:33089`) point at smaller
  cards, not phone screens; they are covered as one frame (R-261 – R-264), not arrow by arrow.

Buttons:
- Buttons are component instances with usable names (`round/ic_*`, `Button/*`, `btn_*`, `Action Button_M`, `chips`,
  `library_select`, `scene` …); labels come from the first visible text inside.
- Outermost tappable-looking instances (status bar, keyboard, backgrounds skipped): 3,508 across 237 screens.
  Deduplicated: 862 by board + name + label + position, 386 by board + name + label, 187 file-wide by name + label.
  List items (template cards, thumbnails, scenes) inflate the counts and should count once per list.
- So a feature's button inventory is a few hundred entries, each traced like an annotation block
  (`R-…` / `n/a: <why>`); the agent's first pass needs review.

Next steps if built: `figma-inventory` read (agent, Figma MCP) → `screens.json` / `controls.json` / rebuilt
`arrows.json` with from/to screen and source control; trace files + `check.ts`; `device.ts` tap log with the element
hit; coverage page.

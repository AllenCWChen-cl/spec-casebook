<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<!-- tab icon (coverage: a target), different on each page so the browser tabs are easy to tell apart -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230f6e73'/><circle cx='16' cy='16' r='9' fill='none' stroke='%23fff' stroke-width='2.6'/><circle cx='16' cy='16' r='3.4' fill='%23fff'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&display=swap">
<style>
/* Layout: proof sheet — counts strip, then the Figma board with every control and arrow marked, a detail panel with the
   rows and tap screenshots, and the gap list underneath. Same palette as the run plan page. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73;
  --proof: #2f7d4f; --ran: #3f9a94; --fail: #b8402f; --blocked: #a86b12; --notrun: #5458c4; --none: #c2332a; --na: #b13f9c;
  --chip-bg: #eef2f2; --canvas: #20292b; --hl: #ffd60a;
  --display: "Archivo", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
  --body: "Source Sans 3", "Noto Sans TC", "Segoe UI", system-ui, "PingFang TC", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --proof: #5cbf83; --ran: #5fc4bd; --fail: #ec7a66; --blocked: #e0a548; --notrun: #9196f5; --none: #f0675c; --na: #e08bd4;
  --chip-bg: #213032; --canvas: #0b1112; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --proof: #5cbf83; --ran: #5fc4bd; --fail: #ec7a66; --blocked: #e0a548; --notrun: #9196f5; --none: #f0675c; --na: #e08bd4;
  --chip-bg: #213032; --canvas: #0b1112; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); margin: 0; padding: 24px max(16px, 2vw) 56px }
h1, h2 { font-family: var(--display); margin: 0; letter-spacing: -0.01em }
h1 { font-size: 1.7rem; font-weight: 750 }
h2 { font-size: 1.15rem; font-weight: 650; margin-bottom: 10px }
.sub { color: var(--muted); font-size: 0.9rem; margin-top: 4px }
.mono { font-family: var(--mono); font-size: 0.82em }
.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 20px 0 }
.stat { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px }
.stat .k { color: var(--muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.04em }
.stat .v { font-family: var(--display); font-size: 1.8rem; font-weight: 750; font-variant-numeric: tabular-nums }
.stat .v small { font-size: 0.95rem; color: var(--muted); font-weight: 500 }
.bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: var(--chip-bg); margin-top: 8px }
.bar span { display: block }
.stat .d { color: var(--muted); font-size: 0.82rem; margin-top: 6px }
.verdict { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--accent); border-radius: 8px; padding: 10px 14px; margin: 16px 0 0; max-width: 90ch }
.reasons { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px }
.reasons .chip b { font-variant-numeric: tabular-nums }
.legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center }
.chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: var(--panel); border-radius: 999px;
  padding: 3px 10px; font-size: 0.85rem; cursor: pointer; user-select: none; color: var(--ink) }
.chip[aria-pressed="false"] { opacity: 0.45 }
.sw { width: 12px; height: 12px; border-radius: 3px; display: inline-block; border: 2px solid currentColor }
.main { display: grid; grid-template-columns: 220px minmax(0, 1fr) 360px; gap: 14px; align-items: start }
.boards { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 6px; display: grid; gap: 2px; max-height: 76vh; overflow: auto }
.boards button { all: unset; cursor: pointer; padding: 7px 9px; border-radius: 7px; display: grid; gap: 4px }
.boards button:hover { background: var(--chip-bg) }
.boards button[aria-current="true"] { background: var(--chip-bg); outline: 2px solid var(--accent) }
.boards .n { font-weight: 600; font-size: 0.92rem }
.boards .c { color: var(--muted); font-size: 0.78rem; font-variant-numeric: tabular-nums }
.boards .brow { display: grid; gap: 3px }
.boards .brow .bar { width: 100% }
.boards .brow .none { font-style: italic; font-size: 0.72rem; line-height: 6px }
.boards button { min-width: 150px }
.boards .n { display: flex; justify-content: space-between; align-items: baseline; gap: 6px }
/* which spec a board comes from: outlined text tags, so they do not read as one of the coverage states */
.spec { flex: none; font: 600 0.66rem var(--mono); letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted);
  border: 1px solid var(--line); border-radius: 4px; padding: 0 4px; line-height: 1.5 }
.side { display: grid; gap: 8px; align-content: start; min-width: 0 }
.srcf { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 0.8rem; color: var(--muted) }
.srcf .chip { padding: 2px 8px; font-size: 0.8rem }
.srcf .chip[aria-disabled="true"] { opacity: 0.45; cursor: not-allowed; border-style: dashed }
.stage { position: relative; background: var(--canvas); border-radius: 10px; overflow: hidden; height: 76vh; border: 1px solid var(--line) }
.stage svg { width: 100%; height: 100%; display: block; cursor: grab; touch-action: none }
.stage svg.drag { cursor: grabbing !important }
/* what a click would select (hit-tested with a margin, so thin lines and small boxes are easy to reach) */
.tip { position: absolute; pointer-events: none; background: #000d; color: #fff; font-size: 0.8rem; padding: 3px 8px; border-radius: 6px; max-width: 320px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transform: translate(12px, 14px) }
.tools { position: absolute; right: 10px; top: 10px; display: flex; gap: 6px }
.tools button { font: 600 0.85rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 7px; padding: 4px 10px; cursor: pointer }
.noimg { position: absolute; left: 12px; bottom: 10px; color: #cfd8d9; font-size: 0.85rem; background: #0009; padding: 4px 8px; border-radius: 6px }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px; max-height: 76vh; overflow: auto }
.panel .empty { color: var(--muted) }
.pill { display: inline-block; white-space: nowrap; border-radius: 999px; padding: 1px 9px; font-size: 0.78rem; font-weight: 600; color: #fff }
.row { border-top: 1px solid var(--line); padding: 8px 0; font-size: 0.9rem }
.row .id { font-family: var(--mono); font-size: 0.8rem; font-weight: 600 }
.res { font-size: 0.75rem; font-weight: 600; margin-left: 6px }
.res.Pass { color: var(--proof) } .res.Fail { color: var(--fail) } .res.Blocked { color: var(--blocked) } .res.Inconclusive { color: var(--ran) } .res.Not.run { color: var(--notrun) }
.proof { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; margin-top: 6px }
.shot { position: relative; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: #000 }
.shot img { width: 100%; display: block }
.shot i { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; border: 3px solid #ff3b30; box-shadow: 0 0 0 2px #fff8 }
.shot figcaption { font-size: 0.68rem; color: var(--muted); padding: 3px 4px; background: var(--panel) }
dl { display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; margin: 8px 0; font-size: 0.88rem }
dt { color: var(--muted) }
a { color: var(--accent) }
.gaps { margin-top: 26px }
.gaps .filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px }
.gaps select, .gaps input { font: inherit; border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 7px; padding: 4px 8px }
table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; font-size: 0.88rem }
th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid var(--line); vertical-align: top }
th { color: var(--muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em }
/* only rows that open something look clickable (not the empty-filter row, nor an unmatched tap with no control to show) */
tbody tr.go { cursor: pointer } tbody tr.go:hover { background: var(--chip-bg) }
@media (max-width: 1100px) { .main { grid-template-columns: 1fr } .boards { display: flex; overflow-x: auto; max-height: none } .stage { height: 62vh } .panel { max-height: none } }
.top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap }
.lead { margin: 6px 0 0; max-width: 80ch }
.lang { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: var(--panel) }
.lang button { font: 600 0.85rem var(--body); border: 0; background: transparent; color: var(--muted); padding: 6px 12px; cursor: pointer }
.lang button[aria-pressed="true"] { background: var(--accent); color: #fff }
.stat ul.d { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 2px }
.muted { color: var(--muted) }
.legend .hint { color: var(--muted); font-size: 0.82rem }
/* a key, not a toggle: plain text after a divider, so it does not look like the state chips */
.legend .key { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--muted);
  border-left: 1px solid var(--line); padding-left: 12px; margin-left: 4px }
.gid { color: var(--muted); font-size: 0.78rem; margin-top: 14px }
/* case view: where one case comes from (#case=TC-012) */
.casef { display: flex; gap: 6px }
.casef input { flex: 1; min-width: 0; font: inherit; font-size: 0.88rem; border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 7px; padding: 5px 8px }
.casebar { position: absolute; left: 10px; top: 10px; display: flex; align-items: center; gap: 8px; background: #000c; color: #fff; font-size: 0.85rem; padding: 4px 6px 4px 10px; border-radius: 8px; max-width: calc(100% - 200px) }
.casebar b { font-family: var(--mono); color: var(--hl) }
.casebar button { font: 600 0.8rem var(--body); border: 0; background: #fff2; color: #fff; border-radius: 5px; padding: 2px 8px; cursor: pointer }
.boards .cb { justify-self: start; font: 600 0.66rem var(--mono); color: #1a1a1a; background: var(--hl); border-radius: 4px; padding: 0 5px; line-height: 1.5 }
.boards .cb.src { background: transparent; color: var(--ink); border: 1px dashed var(--muted) }
.req { border-top: 1px solid var(--line); padding: 8px 0; font-size: 0.88rem }
.req .rid { font-family: var(--mono); font-size: 0.8rem; font-weight: 600; margin-right: 4px }
.srcs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px }
.srcs button, .items button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); border-radius: 7px; padding: 2px 8px; font-size: 0.82rem }
.srcs button:hover, .items button:hover { background: var(--chip-bg) }
.srcs .off { cursor: default; opacity: 0.7; border-style: dashed }
.items { display: grid; gap: 4px; margin: 6px 0 }
.items button { display: flex; border-radius: 6px }
.items .b { color: var(--muted); margin-left: auto; font-size: 0.76rem; white-space: nowrap }
.row a.id { color: inherit; text-decoration: none; border-bottom: 1px dashed var(--muted) }
.row a.rv { font-size: 0.76rem; margin-left: 6px }
.back { all: unset; cursor: pointer; color: var(--accent); font-size: 0.85rem; margin-bottom: 8px; display: inline-block }
</style>
</head>
<body>
<header class="top">
  <div>
    <h1 id="h"></h1>
    <p class="lead" id="lead"></p>
    <div class="sub" id="sub"></div>
  </div>
  <div class="lang" role="group" aria-label="Language"><button data-lang="en">English</button><button data-lang="zh">繁體中文</button></div>
</header>
<p class="verdict" id="verdict"></p>
<section class="strip" id="strip"></section>
<div class="legend" id="legend"></div>
<div class="main">
  <div class="side"><form class="casef" id="casef"><input id="caseq" autocomplete="off" spellcheck="false"></form><div class="srcf" id="srcf"></div><nav class="boards" id="boards" aria-label="Boards"></nav></div>
  <div class="stage" id="stage">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg"></svg>
    <div class="tools"><button id="zin" aria-label="Zoom in">+</button><button id="zout" aria-label="Zoom out">−</button><button id="fit" data-t="fit"></button></div>
    <div class="noimg" id="noimg" hidden></div>
    <div class="tip" id="tip" hidden></div>
    <div class="casebar" id="casebar" hidden></div>
  </div>
  <aside class="panel" id="panel"></aside>
</div>
<section class="gaps">
  <h2 data-t="gapsTitle"></h2>
  <p class="sub intro" data-t="gapsIntro" data-html></p>
  <div class="reasons" id="reasons"></div>
  <div class="filters">
    <select id="gstat" aria-label="Status"></select>
    <select id="gboard" aria-label="Board"></select>
    <input id="gq" aria-label="Filter">
  </div>
  <table><thead><tr><th data-t="thWhat"></th><th data-t="thBoard"></th><th data-t="thName"></th><th data-t="thStatus"></th><th data-t="thWhy"></th><th data-t="thRows"></th></tr></thead><tbody id="gtb"></tbody></table>
</section>
<section class="gaps" id="um-sec">
  <h2 data-t="umTitle"></h2>
  <p class="sub intro" data-t="umIntro" data-html></p>
  <table id="umtable"><thead><tr><th data-t="thRunCase"></th><th data-t="thElement"></th><th data-t="thBest"></th><th data-t="thScreen"></th></tr></thead><tbody id="umtb"></tbody></table>
</section>
<script>
const D = __DATA__;
// Interface strings in English and Traditional Chinese. Design labels, board names and row text stay as written.
const I18N = {
  en: {
    title: (t, p) => `${t} · ${p} coverage`,
    lead: 'Every tappable element and flow arrow the Figma design draws, and whether a device run has pressed or walked it.',
    sub: (v, f, runs, from, to, taps, built) => `Table v${v} · ${f} · ${runs ? `${runs} runs (${from} – ${to})` : 'no runs yet'} · ${taps ? `${taps} logged taps` : 'no tap log yet'} · built ${built}`,
    st: { proof: 'Pressed (tap proof)', ran: 'Pressed (row ran)', blocked: 'Blocked on device', notrun: 'Planned, not run yet', none: 'No row (missing)', na: 'Excluded' },
    rowFailed: 'pressing row failed', legendHint: 'Click a state to show or hide it on the board.',
    verdictMissing: (m, c, a) => `<b>${m} missing:</b> ${c} controls and ${a} arrows have no row yet (listed below as 「No row (missing)」).`,
    verdictOk: '<b>Nothing is missing:</b> every control and flow arrow has a row in the table.',
    verdictLeft: (p, b) => ` ${p} are <b>planned</b> (their rows are in the table but no device run has used them yet) and ${b} are <b>blocked on the device</b> (their rows ran but could not reach them; reasons below).`,
    cControls: 'Controls pressed', cInputs: 'Inputs dismissed', cArrows: 'Flow arrows walked', cTaps: 'Taps matched', cFailed: 'Pressed, but the row failed',
    missing0: '0 missing', excluded: n => `${n} excluded (another feature's control, decorative or a duplicate)`,
    copies: n => `Counted once per button or choice list (${n} copies on the boards).`,
    inputsByTap: 'keyboard hidden, Done or return after typing (tap log)', inputsByRow: 'by the dismissing rows that ran (no tap log yet)',
    tapsNone: 'No tap log yet: the next device run fills this in, with a screenshot per tap.',
    tapsNote: (u, a) => `${u} matched no control (listed below) · ${a} ambiguous`,
    failedNote: 'the control was pressed, but its last pressing row failed (red dot): a bug, not a coverage gap',
    controls: 'Controls', arrows: 'Arrows', noArrows: 'none drawn on this board', fit: 'Fit',
    noImg: 'No board image: run with --render (draws it from the Design PDF)',
    panelEmpty: 'Click a box or an arrow on the board to see the rows that press it, their latest results and the tap screenshots that prove it. Or type a case ID (left) to see where in the spec that case comes from.',
    layer: 'Figma layer', kind: 'Kind', board: 'Board', boards: 'Boards', countedAs: 'Counted as', choiceList: 'one choice list (any choice covers it)', oneButton: 'one button',
    copiesOn: (n, b) => `${n} cop${n === 1 ? 'y' : 'ies'} on ${b} board${b === 1 ? '' : 's'}`, appIds: 'App ids', tracedBy: 'Found through',
    tracedArrow: "its flow arrow's requirement", tracedLabel: 'rows quoting its label', tracedManual: 'the analysis', dismissed: 'Dismissed', yes: 'yes', notYet: 'not yet',
    exclReason: 'Excluded because', openFigma: 'Open in Figma', tapProof: 'Tap proof', pressingRows: 'Pressing rows', dismissingRows: 'Dismissing rows',
    proofRan: 'The row ran before the tap log existed, or its taps did not land on this control.', proofNone: 'No tap logged yet.',
    allTaps: n => `${n} taps in all; the 6 best shown.`, noRows: 'None: the analysis must add a row that presses it (or exclude it with the reason).', noneYet: 'None yet.',
    outside: 'outside its rows', closeTo: 'close to', groupId: 'Group id', pillFailed: 'row failed', pillNoRow: 'pressed, but no row names it',
    arrow: 'Arrow', arrowKind: k => k === 'auto' ? 'automatic transition' : 'tap', requirement: 'Requirement', noneYetReq: 'none yet', srcControl: 'Source control →',
    rows: 'Rows', noArrowRows: 'No requirement or row walks this arrow yet.', plannedRes: 'Planned, not run yet',
    kinds: { button: 'button', item: 'list item', input: 'text input', toggle: 'toggle', tab: 'tab', arrow: 'flow arrow' },
    gapsTitle: 'Not pressed on the device yet',
    gapsIntro: 'Each item here has its rows in the table. <b>Planned, not run yet</b>: no device run has used those rows (new rows run in the next round). <b>Blocked on device</b>: the rows ran but could not reach the control; the reason comes from the run. <b>No row (missing)</b> would be a real gap: a control or arrow no row covers. Click a reason to filter, a row to see it on the board.',
    all: 'All states', allBoards: 'All boards', filter: 'Filter by name or label', undismissed: 'Input not dismissed',
    thWhat: 'What', thBoard: 'Board', thName: 'Name / edge', thStatus: 'Status', thWhy: 'Why', thRows: 'Rows',
    whyNotrun: 'Rows in the table; not run on the device yet', whyNone: 'No row covers it', whyUndismissed: 'No dismissing row ran', whyBlocked: 'Blocked',
    emptyFilter: 'Nothing left in this filter.',
    umTitle: 'Taps that matched no control',
    umIntro: 'A press the matcher could not tie to a Figma control (score under 0.6). If it did press one, add the element\'s id or label to that entry\'s <span class="mono">app</span> list in control-trace.json; if it pressed something the Design does not draw, it is a spec question.',
    umNone: 'Every logged tap matched a control.', umNoLog: 'No tap log yet.', thRunCase: 'Run · case', thElement: 'Element tapped', thBest: 'Best guess', thScreen: 'Screen', screenshot: 'screenshot',
    otherPlatform: 'other platform',
    specs: { design: 'Design', pm: 'PM', mx: 'MX' }, specLabel: 'Spec', specHint: 'Show or hide that spec\'s boards in the list',
    specNone: s => `No ${s} boards in this inventory yet (its Figma file has not been read)`,
    reasons: {},
    caseFind: 'Case ID, e.g. TC-012', caseNotFound: id => `No case ${id} in this table.`, caseEyebrow: 'Case', caseWhere: 'Where in the spec',
    casePresses: 'Controls it presses', caseWalks: 'Flow arrows it walks', caseScreens: 'Screens it names', caseClear: 'Clear',
    caseNoItems: 'No control or arrow on the boards is tied to this case; the boards its requirements come from are listed above.',
    caseNoRefs: 'This case names no requirement in its Spec Ref.', caseBack: id => `← Back to ${id}`, openReview: 'Open in the review page', reviewLink: 'review →', openPlan: 'Open in the run plan', planLink: 'plan →',
    caseBar: (g, a, b) => `${g} controls · ${a} arrows · on ${b} board${b === 1 ? '' : 's'}`, caseSrcOnly: 'spec board',
    action: 'Action', expected: 'Expected result', notOnBoards: 'no board for this source', regionOnly: 'Spec region (no controls traced)',
    caseOnBoard: 'case items here', caseSrc: 'a requirement of the case comes from this board',
    noSource: 'No spec board: a rule across the feature (tickets, roster, ledger request), not one drawing',
  },
  zh: {
    title: (t, p) => `${t} · ${p} 覆蓋率`,
    lead: 'Figma 設計中每個可點擊元素與流程箭頭，以及裝置上的執行是否已按過或走過。',
    sub: (v, f, runs, from, to, taps, built) => `表格 v${v} · ${f} · ${runs ? `${runs} 次執行（${from} – ${to}）` : '尚無執行'} · ${taps ? `${taps} 筆點擊紀錄` : '尚無點擊紀錄'} · 產生於 ${built}`,
    st: { proof: '已按（有點擊證據）', ran: '已按（案例已執行）', blocked: '裝置上受阻', notrun: '已規劃，尚未執行', none: '無案例（缺漏）', na: '排除' },
    rowFailed: '按下的案例失敗', legendHint: '點選狀態可在畫板上顯示或隱藏。',
    verdictMissing: (m, c, a) => `<b>缺漏 ${m} 項：</b>${c} 個控制項與 ${a} 個箭頭尚無案例（下方標為「無案例（缺漏）」）。`,
    verdictOk: '<b>沒有缺漏：</b>每個控制項與流程箭頭在表格中都有案例。',
    verdictLeft: (p, b) => `其中 ${p} 項<b>已規劃</b>（案例在表格中，但尚未在裝置上執行），${b} 項<b>在裝置上受阻</b>（案例已執行但無法到達；原因見下方）。`,
    cControls: '已按的控制項', cInputs: '已關閉的輸入框', cArrows: '已走過的流程箭頭', cTaps: '已比對的點擊', cFailed: '已按，但案例失敗',
    missing0: '缺漏 0', excluded: n => `排除 ${n} 項（其他功能的控制項、裝飾或重複）`,
    copies: n => `每個按鈕或選項清單只算一次（畫板上共 ${n} 個副本）。`,
    inputsByTap: '輸入後收起鍵盤、按 Done 或 return（點擊紀錄）', inputsByRow: '依已執行的關閉案例計算（尚無點擊紀錄）',
    tapsNone: '尚無點擊紀錄：下一次裝置執行會填入，每次點擊附一張截圖。',
    tapsNote: (u, a) => `${u} 筆未對應到控制項（見下方）· ${a} 筆不確定`,
    failedNote: '控制項已按過，但最後一次按它的案例失敗（紅點）：這是錯誤，不是覆蓋缺口',
    controls: '控制項', arrows: '箭頭', noArrows: '此畫板沒有流程箭頭', fit: '全覽',
    noImg: '沒有畫板圖片：以 --render 從設計 PDF 繪製',
    panelEmpty: '點選畫板上的方框或箭頭，查看按它的案例、最新結果，以及證明點擊的截圖。或在左側輸入案例 ID，查看該案例來自規格的哪裡。',
    layer: 'Figma 圖層', kind: '類型', board: '畫板', boards: '畫板', countedAs: '計算方式', choiceList: '一組選項清單（任一選項即涵蓋）', oneButton: '一個按鈕',
    copiesOn: (n, b) => `${b} 個畫板上共 ${n} 個副本`, appIds: 'App id', tracedBy: '找到方式',
    tracedArrow: '其流程箭頭的需求', tracedLabel: '引用其標籤的案例', tracedManual: '分析', dismissed: '已關閉', yes: '是', notYet: '尚未',
    exclReason: '排除原因', openFigma: '在 Figma 開啟', tapProof: '點擊證據', pressingRows: '按它的案例', dismissingRows: '關閉它的案例',
    proofRan: '案例在點擊紀錄之前執行，或其點擊沒有落在此控制項上。', proofNone: '尚無點擊紀錄。',
    allTaps: n => `共 ${n} 次點擊；顯示最符合的 6 次。`, noRows: '無：分析需新增按它的案例（或註明原因後排除）。', noneYet: '尚無。',
    outside: '不在其案例內', closeTo: '接近', groupId: '群組 id', pillFailed: '案例失敗', pillNoRow: '已按，但沒有案例列出它',
    arrow: '箭頭', arrowKind: k => k === 'auto' ? '自動轉場' : '點擊', requirement: '需求', noneYetReq: '尚無', srcControl: '起點控制項 →',
    rows: '案例', noArrowRows: '尚無需求或案例走過此箭頭。', plannedRes: '已規劃，尚未執行',
    kinds: { button: '按鈕', item: '清單項目', input: '文字輸入框', toggle: '開關', tab: '分頁', arrow: '流程箭頭' },
    gapsTitle: '尚未在裝置上按過',
    gapsIntro: '這裡每一項在表格中都有案例。<b>已規劃，尚未執行</b>：還沒有裝置執行用過這些案例（新案例在下一輪執行）。<b>裝置上受阻</b>：案例已執行但無法到達該控制項，原因取自執行紀錄。<b>無案例（缺漏）</b>才是真正的缺口：沒有任何案例涵蓋的控制項或箭頭。點選原因可篩選，點選一列可在畫板上查看。',
    all: '所有狀態', allBoards: '所有畫板', filter: '依名稱或標籤篩選', undismissed: '輸入框未關閉',
    thWhat: '項目', thBoard: '畫板', thName: '名稱 / 流程', thStatus: '狀態', thWhy: '原因', thRows: '案例',
    whyNotrun: '案例在表格中；尚未在裝置上執行', whyNone: '沒有案例涵蓋', whyUndismissed: '沒有執行關閉它的案例', whyBlocked: '受阻',
    emptyFilter: '此篩選下沒有項目。',
    umTitle: '未對應到控制項的點擊',
    umIntro: '比對程式無法對應到 Figma 控制項的點擊（分數低於 0.6）。若它確實按了某個控制項，請把元素的 id 或標籤加到 control-trace.json 中該項的 <span class="mono">app</span> 清單；若它按的是設計沒有畫出的東西，則是規格問題。',
    umNone: '每一筆點擊都對應到控制項。', umNoLog: '尚無點擊紀錄。', thRunCase: '執行 · 案例', thElement: '點擊的元素', thBest: '最可能的控制項', thScreen: '畫面', screenshot: '截圖',
    otherPlatform: '其他平台',
    specs: { design: 'Design', pm: 'PM', mx: 'MX' }, specLabel: '規格', specHint: '在清單中顯示或隱藏該規格的畫板',
    specNone: s => `此清單尚無 ${s} 畫板（尚未讀取其 Figma 檔案）`,
    // the blocked reasons the page builder names (coverage-page.ts blockReason)
    reasons: {
      'Video never generated on that build (video gate failed)': '該版本從未產生影片（影片前置檢查失敗）',
      'Needs a low credit balance (the shared account holds ~20,000 credits)': '需要低點數餘額（共用帳號約有 20,000 點）',
      'Purchases are not made in runs (user rule)': '執行中不購買（使用者規則）',
      'Needs speech, which Appium cannot give': '需要語音輸入，Appium 無法提供',
      'Full template generations held back (REQ-019)': '暫不執行完整範本生成（REQ-019）',
      'No fixture makes speech-to-text fail (RD)': '沒有可讓語音轉文字失敗的測試設定（需 RD 提供）',
      'Banner content is CMS-driven and did not show': '橫幅內容由 CMS 控制，未出現',
      'Daily-limit state for that tier could not be set up (test-data)': '無法為該方案設定每日上限狀態（測試資料）',
    },
    caseFind: '案例 ID，例如 TC-012', caseNotFound: id => `此表格沒有案例 ${id}。`, caseEyebrow: '案例', caseWhere: '來自規格的哪裡',
    casePresses: '它按的控制項', caseWalks: '它走過的流程箭頭', caseScreens: '它提到的畫面', caseClear: '清除',
    caseNoItems: '畫板上沒有控制項或箭頭對應到此案例；其需求來自的畫板列在上方。',
    caseNoRefs: '此案例的 Spec Ref 沒有列出需求。', caseBack: id => `← 回到 ${id}`, openReview: '在審查頁開啟', reviewLink: '審查頁 →', openPlan: '在執行計畫開啟', planLink: '執行計畫 →',
    caseBar: (g, a, b) => `${g} 個控制項 · ${a} 個箭頭 · 分布於 ${b} 個畫板`, caseSrcOnly: '規格畫板',
    action: '動作', expected: '預期結果', notOnBoards: '此來源沒有畫板', regionOnly: '規格區域（未追蹤控制項）',
    caseOnBoard: '此案例的項目', caseSrc: '此案例的某項需求來自這個畫板',
    noSource: '沒有規格畫板：這是跨整個功能的規則（票單、範本清單、需求紀錄），不是單一畫面',
  },
};
let L = 'en';
try { L = new URLSearchParams(location.search).get('lang') === 'zh' ? 'zh' : localStorage.getItem('coverage-lang') === 'zh' ? 'zh' : 'en'; } catch {}
const t = k => I18N[L][k] ?? I18N.en[k];
const ST = () => t('st');
const tr = r => r.split('; ').map(x => I18N[L].reasons?.[x] ?? x).join('；');
const COLOR = s => `var(--${s})`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = id => document.getElementById(id);
const show = new Set(['proof', 'ran', 'blocked', 'notrun', 'none', 'na']);
let board = null, sel = null, vb = null, reasonFilter = '';
// the other pages: scripts/pages.ts names them (window.CASEBOOK); a static coverage.html links to cases.html beside it
const PAGES = window.CASEBOOK?.pages ?? (location.protocol === 'file:' ? { review: 'cases.html' } : {});
// case view (#case=TC-012): the case shown, and its requirements' boards, controls, arrows and named screens
let kase = null, caseIt = null;
const fmtDay = s => { const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[2]}/${+m[3]}` : s; };

function header() {
  document.documentElement.lang = L === 'zh' ? 'zh-Hant' : 'en';
  $('h').textContent = t('title')(D.title, D.platform === 'ios' ? 'iOS' : 'Android');
  $('lead').textContent = t('lead');
  $('sub').innerHTML = t('sub')(D.version, esc(D.spec_folder), D.runs.length, fmtDay(D.runs[0] ?? ''), fmtDay(D.runs.at(-1) ?? ''), D.taps, new Date(D.built_at).toLocaleString(L === 'zh' ? 'zh-TW' : undefined));
  $('sub').title = D.runs.join('\n');
  for (const b of document.querySelectorAll('.lang button')) b.setAttribute('aria-pressed', String(b.dataset.lang === L));
  for (const el of document.querySelectorAll('[data-t]')) el[el.hasAttribute('data-html') ? 'innerHTML' : 'textContent'] = t(el.dataset.t);
  $('gq').placeholder = t('filter'); $('caseq').placeholder = t('caseFind');
  const keep = $('gstat').value, keepB = $('gboard').value;
  $('gstat').innerHTML = `<option value="">${t('all')}</option>` + ['notrun', 'blocked', 'none'].map(s => `<option value="${s}">${ST()[s]}</option>`).join('') + `<option value="undismissed">${t('undismissed')}</option>`;
  $('gboard').innerHTML = `<option value="">${t('allBoards')}</option>` + D.boards.map(b => `<option>${esc(b.name)}</option>`).join('');
  $('gstat').value = keep; $('gboard').value = keepB;
}

const cnt = (xs, f) => xs.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
function stat(k, done, total, parts, lines) {
  const bar = parts.map(([s, n]) => `<span style="width:${total ? n / total * 100 : 0}%;background:${COLOR(s)}"></span>`).join('');
  return `<div class="stat"><div class="k">${k}</div><div class="v">${done}<small> / ${total}</small></div><div class="bar">${bar}</div><ul class="d">${lines.map(l => `<li>${l}</li>`).join('')}</ul></div>`;
}
const dot = s => `<span class="sw" style="color:${COLOR(s)};width:9px;height:9px;border-width:2px;vertical-align:-1px${s === 'na' ? ';border-style:dotted' : ''}"></span>`;
const split = c => ['proof', 'ran', 'blocked', 'notrun', 'none'].filter(s => c[s]).map(s => `${dot(s)} ${c[s]} ${ST()[s]}`);
function strip() {
  const req = D.groups.filter(g => g.status !== 'na'), c = cnt(req, g => g.status);
  const inputs = D.groups.filter(g => g.kind === 'input' && g.status !== 'na'), dis = inputs.filter(g => g.dismissed).length;
  const a = cnt(D.arrows, x => x.status), order = ['proof', 'ran', 'blocked', 'notrun', 'none'];
  const left = (c.blocked || 0) + (c.notrun || 0) + (a.blocked || 0) + (a.notrun || 0), missing = (c.none || 0) + (a.none || 0);
  $('verdict').innerHTML = missing ? t('verdictMissing')(missing, c.none || 0, a.none || 0)
    : t('verdictOk') + (left ? t('verdictLeft')((c.notrun || 0) + (a.notrun || 0), (c.blocked || 0) + (a.blocked || 0)) : '');
  const failed = D.groups.filter(g => g.fail).length;
  $('strip').innerHTML =
    stat(t('cControls'), (c.proof || 0) + (c.ran || 0), req.length, order.map(s => [s, c[s] || 0]),
      [...split(c), ...(c.none ? [] : [`${dot('none')} ${t('missing0')}`]), `${dot('na')} ${t('excluded')(D.groups.length - req.length)}`, `<span class="muted">${t('copies')(D.groups.reduce((n, g) => n + g.instances, 0))}</span>`]) +
    stat(t('cArrows'), (a.proof || 0) + (a.ran || 0), D.arrows.length, order.map(s => [s, a[s] || 0]), [...split(a), ...(a.none ? [] : [`${dot('none')} ${t('missing0')}`])]) +
    stat(t('cInputs'), dis, inputs.length, [['ran', dis]], [D.taps ? t('inputsByTap') : t('inputsByRow')]) +
    (D.taps ? stat(t('cTaps'), D.taps - D.unmatched.length, D.taps, [['proof', D.taps - D.unmatched.length], ['none', D.unmatched.length]], [t('tapsNote')(D.unmatched.length, D.groups.reduce((n, g) => n + g.proof.filter(p => p.ambiguous).length, 0))])
      : `<div class="stat"><div class="k">${t('cTaps')}</div><div class="v muted">—</div><ul class="d"><li>${t('tapsNone')}</li></ul></div>`) +
    stat(t('cFailed'), failed, req.length, [['fail', failed]], [t('failedNote')]);
}
function legend() {
  $('legend').innerHTML = Object.entries(ST()).map(([s, x]) => `<span class="chip" role="button" tabindex="0" aria-pressed="${show.has(s)}" data-s="${s}"><span class="sw" style="color:${COLOR(s)}${s === 'na' ? ';border-style:dotted' : s === 'none' ? ';border-style:dashed' : ''}"></span>${x}</span>`).join('')
    + `<span class="hint">${t('legendHint')}</span><span class="key"><span class="sw" style="color:var(--fail);border-radius:50%;background:var(--fail)"></span>${t('rowFailed')}</span>`;
  for (const el of document.querySelectorAll('#legend [data-s]')) el.onclick = el.onkeydown = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    const s = el.dataset.s; show.has(s) ? show.delete(s) : show.add(s); el.setAttribute('aria-pressed', show.has(s)); draw();
  };
}
// one bar segment per state, in the order of the legend, so a board's controls read the same way as the totals
const segs = (items, total) => ['proof', 'ran', 'blocked', 'notrun', 'none', 'na'].map(st => { const n = items.filter(x => x.status === st).length;
  return n ? `<span title="${n} ${ST()[st]}" style="width:${n / total * 100}%;background:${COLOR(st)}"></span>` : ''; }).join('');
const SPECS = ['design', 'pm', 'mx'], specShow = new Set(SPECS);
const specOf = b => b.spec || 'design';
function specFilter() {
  const n = cnt(D.boards, specOf);
  $('srcf').innerHTML = `<span>${t('specLabel')}</span>` + SPECS.map(s => n[s]
    ? `<span class="chip" role="button" tabindex="0" aria-pressed="${specShow.has(s)}" data-spec="${s}" title="${esc(t('specHint'))}">${t('specs')[s]} <b>${n[s]}</b></span>`
    : `<span class="chip" aria-disabled="true" title="${esc(t('specNone')(t('specs')[s]))}">${t('specs')[s]} <b>0</b></span>`).join('');
  for (const el of document.querySelectorAll('#srcf [data-spec]')) el.onclick = el.onkeydown = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); const s = el.dataset.spec; specShow.has(s) ? specShow.delete(s) : specShow.add(s); specFilter(); boardsNav();
    document.querySelector(`#srcf [data-spec="${s}"]`)?.focus();
  };
}
function boardsNav() {
  // the open board stays listed even when its spec is filtered out, so the list never loses the board on screen
  $('boards').innerHTML = D.boards.map((b, i) => !specShow.has(specOf(b)) && b !== board ? '' : (() => {
    // a control shared by several boards counts on each of them here (the totals above count it once)
    const all = D.groups.filter(g => (g.boards || [g.board]).includes(b.name)), gs = all.filter(g => g.status !== 'na');
    const done = gs.filter(g => g.status === 'proof' || g.status === 'ran').length;
    const as = D.arrows.filter(a => a.board === b.name), aw = as.filter(a => a.status === 'proof' || a.status === 'ran').length;
    const here = caseIt ? caseOnBoard(b) : 0, src = caseIt?.boards.includes(b.name);
    const badge = here ? `<span class="cb" title="${esc(t('caseOnBoard'))}">${here} · ${esc(t('caseOnBoard'))}</span>` : src ? `<span class="cb src" title="${esc(t('caseSrc'))}">${t('caseSrcOnly')}</span>` : '';
    // the case badge sits on its own line, so it never squeezes the board name
    const head = `<span class="n"><span>${esc(b.name)}</span><span class="spec">${t('specs')[specOf(b)]}</span></span>${badge ? `<span>${badge}</span>` : ''}`;
    if (b.region) return `<button data-i="${i}" aria-current="${board === b}">${head}<span class="c">${t('regionOnly')}</span></button>`;
    return `<button data-i="${i}" aria-current="${board === b}">${head}
      <span class="brow"><span class="c">${t('controls')} ${done}/${gs.length}</span><span class="bar" style="margin:0">${all.length ? segs(all, all.length) : ''}</span></span>
      <span class="brow"><span class="c">${t('arrows')} ${as.length ? `${aw}/${as.length}` : '—'}</span>${as.length ? `<span class="bar" style="margin:0">${segs(as, as.length)}</span>` : `<span class="c none">${t('noArrows')}</span>`}</span></button>`;
  })()).join('');
  for (const el of document.querySelectorAll('#boards button')) el.onclick = () => openBoard(D.boards[+el.dataset.i]);
}
function openBoard(b, focus) {
  board = b; const [x, y, w, h] = b.box; vb = [x - 40, y - 40, w + 80, h + 80];
  if (focus) vb = [focus[0] - 300, focus[1] - 300, focus[2] + 600, focus[3] + 600];
  $('noimg').hidden = !!b.img; if (!b.img) $('noimg').textContent = b.note || t('noImg'); boardsNav(); draw();
}
function draw() {
  const svg = $('svg'); if (!board) return;
  svg.setAttribute('viewBox', vb.join(' '));
  const [bx, by, bw, bh] = board.box;
  const k = vb[2] / svg.clientWidth; // canvas units per screen pixel, so strokes stay readable at any zoom
  let s = `<defs><marker id="m-hl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--hl)"/></marker>${['proof', 'ran', 'blocked', 'notrun', 'none'].map(st => `<marker id="m-${st}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${COLOR(st)}"/></marker>`).join('')}</defs>`;
  s += board.img ? `<image href="${esc(board.img)}" x="${bx}" y="${by}" width="${bw}" height="${bh}" preserveAspectRatio="none"/>` : `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#2b3537"/>`;
  for (const sc of D.screens.filter(sc => sc.board === board.name)) {
    s += `<rect x="${sc.box[0]}" y="${sc.box[1]}" width="${sc.box[2]}" height="${sc.box[3]}" fill="${sc.other ? '#000a' : 'none'}" stroke="#fff3" stroke-width="${k}"><title>${esc(sc.name)}${sc.other ? ` (${t('otherPlatform')})` : ''}</title></rect>`;
  }
  // the hover outline sits under the marks, so it never covers a line or a box
  s += '<g id="hov" pointer-events="none"></g>';
  // marks: what the click and hover tests look at (only what is drawn: this board, states shown)
  marks = []; let top = '';
  const box = (g, [x, y, w, h], on) => {
    const fill = g.status === 'proof' ? COLOR('proof') : g.status === 'ran' ? COLOR('ran') : 'none';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${2 * k}" fill="${fill}" fill-opacity="${g.status === 'proof' ? 0.3 : 0.18}" stroke="${COLOR(g.status)}" stroke-width="${(on ? 4 : 1.6) * k}" ${g.status === 'none' ? `stroke-dasharray="${4 * k} ${3 * k}"` : g.status === 'na' ? `stroke-dasharray="${1.5 * k} ${2.5 * k}" stroke-opacity="0.8"` : ''}/>`
      + (g.fail ? `<circle cx="${x + w}" cy="${y}" r="${4 * k}" fill="var(--fail)"/>` : '');
  };
  const line = (a, pts, on) => `<polyline points="${pts}" fill="none" stroke="${COLOR(a.status)}" stroke-width="${(on ? 5 : 3) * k}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#m-${a.status})" ${a.status === 'none' ? `stroke-dasharray="${6 * k} ${4 * k}"` : ''}/>`;
  // case view: the case's screens, controls and arrows get a highlighter mark under them; everything else is dimmed
  const inCaseG = new Set(caseIt?.groups.map(g => g.group) ?? []), inCaseA = new Set(caseIt?.arrows.map(a => a.id) ?? []);
  const dim = x => caseIt && !x ? ' opacity="0.28"' : '';
  for (const sc of caseIt?.screens.filter(sc => sc.board === board.name) ?? [])
    s += `<rect x="${sc.box[0] - 6 * k}" y="${sc.box[1] - 6 * k}" width="${sc.box[2] + 12 * k}" height="${sc.box[3] + 12 * k}" rx="${6 * k}" fill="none" stroke="var(--hl)" stroke-width="${5 * k}"/>`;
  // annotation pointers the case's requirements are written for (not coverage items, so not clickable)
  for (const p of caseIt?.pointers.filter(p => p.board === board.name) ?? [])
    s += `<polyline points="${p.points.join(' ')}" fill="none" stroke="var(--hl)" stroke-width="${6 * k}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#m-hl)"/>`;
  for (const g of D.groups) {
    if (!(g.boards || [g.board]).includes(board.name) || !(show.has(g.status) || inCaseG.has(g.group))) continue;
    const on = sel && sel.group === g.group;
    // every copy that lies on this board (a shared control, e.g. the back button, has copies on many boards)
    for (const r of g.rects.filter(([x, y]) => x >= bx && x <= bx + bw && y >= by && y <= by + bh)) {
      marks.push({ t: 'g', id: g.group, r, label: g.label || g.name, status: g.status });
      if (inCaseG.has(g.group)) s += `<rect x="${r[0] - 5 * k}" y="${r[1] - 5 * k}" width="${r[2] + 10 * k}" height="${r[3] + 10 * k}" rx="${4 * k}" fill="var(--hl)" fill-opacity="0.35" stroke="var(--hl)" stroke-width="${3 * k}"/>`;
      s += `<g${dim(inCaseG.has(g.group))}>${box(g, r, false)}</g>`;
      // the selected control keeps its state colour, drawn thicker on top with a halo just outside the box
      if (on) top += ring(r, k, true) + box(g, r, true);
    }
  }
  for (const a of D.arrows) {
    if (a.board !== board.name || !(show.has(a.status) || inCaseA.has(a.id))) continue;
    const on = sel && sel.arrow === a.id, p = [];
    for (let i = 0; i < a.points.length; i += 2) p.push(`${a.points[i]},${a.points[i + 1]}`);
    marks.push({ t: 'a', id: a.id, pts: a.points, label: a.edge, status: a.status });
    if (inCaseA.has(a.id)) s += `<polyline points="${p.join(' ')}" fill="none" stroke="var(--hl)" stroke-opacity="0.7" stroke-width="${14 * k}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<g${dim(inCaseA.has(a.id))}>${line(a, p.join(' '), false)}</g>`;
    if (on) top += halo(p.join(' '), k, true) + line(a, p.join(' '), true);
  }
  svg.innerHTML = s + top;
  hoverMark(hov && marks.find(m => m.t === hov.t && m.id === hov.id && (m.r ?? m.pts) === (hov.r ?? hov.pts)) || null, true);
}
// Selection and hover outlines: black under white, outside the box (or under the line), a pair no state colour uses,
// so they show on any board image and never hide what the box contains. Hover is the thin white ring alone.
const ring = ([x, y, w, h], k, strong) => { const o = (strong ? 4 : 3) * k;
  return (strong ? `<rect x="${x - o}" y="${y - o}" width="${w + 2 * o}" height="${h + 2 * o}" rx="${4 * k}" fill="none" stroke="#000" stroke-opacity="0.85" stroke-width="${5 * k}"/>` : '')
    + `<rect x="${x - o}" y="${y - o}" width="${w + 2 * o}" height="${h + 2 * o}" rx="${4 * k}" fill="none" stroke="#fff" stroke-width="${(strong ? 2.5 : 2) * k}" ${strong ? '' : `stroke-dasharray="${5 * k} ${3 * k}"`}/>`; };
const halo = (pts, k, strong) => (strong ? `<polyline points="${pts}" fill="none" stroke="#000" stroke-opacity="0.85" stroke-width="${14 * k}" stroke-linecap="round" stroke-linejoin="round"/>` : '')
  + `<polyline points="${pts}" fill="none" stroke="#fff" stroke-opacity="${strong ? 1 : 0.7}" stroke-width="${(strong ? 9 : 8) * k}" stroke-linecap="round" stroke-linejoin="round"/>`;
let marks = [], hov = null;
// Which mark a click at (px, py) means, in canvas units, with k canvas units per screen pixel. A box takes clicks within
// 8 px of its edge, the smallest such box winning (so a small button inside a card stays reachable); an arrow takes
// clicks within 10 px of its line, and wins over a box when the click is right on the line (4 px) and not inside a
// small box (an arrow starts on the control it leaves from).
function pick(px, py, k) {
  const segDist = (p, x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy, u = l ? Math.max(0, Math.min(1, ((p[0] - x1) * dx + (p[1] - y1) * dy) / l)) : 0;
    return Math.hypot(p[0] - x1 - u * dx, p[1] - y1 - u * dy); };
  let bestBox = null, bestArrow = null;
  for (const m of marks) {
    if (m.t === 'g') {
      const [x, y, w, h] = m.r, out = Math.hypot(Math.max(x - px, 0, px - x - w), Math.max(y - py, 0, py - y - h)) / k;
      if (out <= 8 && (!bestBox || w * h < bestBox.area)) bestBox = { m, area: w * h, out, screen: w * h / (k * k) };
    } else {
      let d = Infinity; for (let i = 0; i + 3 < m.pts.length; i += 2) d = Math.min(d, segDist([px, py], m.pts[i], m.pts[i + 1], m.pts[i + 2], m.pts[i + 3]));
      d /= k; if (d <= 10 && (!bestArrow || d < bestArrow.d)) bestArrow = { m, d };
    }
  }
  if (bestArrow && (!bestBox || (bestArrow.d <= 4 && (bestBox.out > 0 || bestBox.screen > 80 * 80)) || (bestBox.out > 0 && bestArrow.d < bestBox.out))) return bestArrow.m;
  return bestBox?.m ?? bestArrow?.m ?? null;
}
function hoverMark(m, keep) {
  const g = document.getElementById('hov'); if (!g) return;
  if (!keep && hov?.t === m?.t && hov?.id === m?.id && (m?.r ?? m?.pts) === (hov?.r ?? hov?.pts)) return;
  hov = m; const k = vb[2] / svg.clientWidth;
  const isSel = m && (m.t === 'g' ? sel?.group === m.id : sel?.arrow === m.id);
  g.innerHTML = !m || isSel ? '' : m.t === 'g' ? ring(m.r, k, false) : halo(m.pts.reduce((p, v, i) => p + (i % 2 ? `,${v} ` : v), ''), k, false);
  svg.style.cursor = m ? 'pointer' : 'grab';
  const tip = $('tip'); tip.hidden = !m;
  if (m) tip.textContent = `${m.label} — ${ST()[m.status]}`;
}
const kindName = k => t('kinds')[k] ?? k;
const rowHtml = id => { const r = D.rows[id] || { result: 'Not run' };
  // the id opens the case view here; review → opens the row on the review page
  return `<div class="row"><a class="id" href="#case=${encodeURIComponent(id)}">${esc(id)}</a>${PAGES.review ? `<a class="rv" href="${esc(PAGES.review)}#${encodeURIComponent(id)}">${t('reviewLink')}</a>` : ''}${PAGES.plan ? `<a class="rv" href="${esc(PAGES.plan)}#case=${encodeURIComponent(id)}">${t('planLink')}</a>` : ''}<span class="res ${esc(r.result)}">${esc(r.result === 'Not run' ? t('plannedRes') : r.result)}</span>${r.reason ? ` <span style="color:var(--blocked);font-size:.8rem">${esc(tr(r.reason))}</span>` : ''}${r.run ? ` <span class="mono" style="color:var(--muted)">${esc(r.run)}</span>` : ''}<div>${esc(r.action || '')}</div>${r.actual ? `<div style="color:var(--muted);font-size:.82rem">${esc(r.actual)}</div>` : ''}</div>`; };
function select(kind, id) {
  sel = kind === 'g' ? { group: id } : { arrow: id }; draw(); renderPanel();
}
function renderPanel() {
  const p = $('panel');
  if (!sel && kase) { casePanel(); return; }
  if (!sel) { p.innerHTML = `<p class="empty">${t('panelEmpty')}</p>`; return; }
  const back = kase ? `<button class="back" id="back">${esc(t('caseBack')(kase))}</button><br>` : '';
  if (sel.group) {
    const g = D.groups.find(x => x.group === sel.group);
    const link = g.node && !g.node.startsWith('I') ? `<a href="${D.figma[g.file]}${g.node.replace(':', '-')}" target="_blank" rel="noopener">${t('openFigma')}</a>` : '';
    const how = g.how === 'arrow' ? t('tracedArrow') : g.how === 'label' ? t('tracedLabel') : g.how ? t('tracedManual') : '';
    p.innerHTML = `${back}<h2>${esc(g.label || g.name)}</h2><span class="pill" style="background:${COLOR(g.status)}">${ST()[g.status]}</span>${g.fail ? ` <span class="pill" style="background:var(--fail)">${t('pillFailed')}</span>` : ''}${g.norow ? ` <span class="pill" style="background:var(--blocked)">${t('pillNoRow')}</span>` : ''}
      <dl><dt>${t('kind')}</dt><dd>${esc(kindName(g.kind))}</dd><dt>${t('countedAs')}</dt><dd>${g.set ? t('choiceList') : t('oneButton')} · ${t('copiesOn')(g.instances, g.boards.length)}</dd>
      <dt>${g.boards.length > 1 ? t('boards') : t('board')}</dt><dd>${g.boards.map(esc).join(', ')}</dd><dt>${t('specLabel')}</dt><dd>${t('specs')[g.spec || 'design']}</dd><dt>${t('layer')}</dt><dd class="mono">${esc(g.name)}</dd>
      ${g.app.length ? `<dt>${t('appIds')}</dt><dd class="mono">${g.app.map(esc).join(', ')}</dd>` : ''}${how ? `<dt>${t('tracedBy')}</dt><dd>${how}</dd>` : ''}
      ${g.kind === 'input' ? `<dt>${t('dismissed')}</dt><dd>${g.dismissed ? t('yes') : t('notYet')}</dd>` : ''}${g.na ? `<dt>${t('exclReason')}</dt><dd>${esc(g.na.replace(/^n\/a:\s*/, ''))}</dd>` : ''}</dl>${link}
      <h2 style="margin-top:14px">${t('tapProof')}</h2>${g.proof.length ? `<div class="proof">${g.proof.map(x => { const [ww, wh] = (x.win || '1x1').split('x').map(Number);
        return `<figure class="shot" style="margin:0">${x.shot ? `<a href="${esc(x.shot)}" target="_blank"><img src="${esc(x.shot)}" alt=""></a><i style="left:${x.x / ww * 100}%;top:${x.y / wh * 100}%"></i>` : ''}<figcaption>${esc(x.case)} · ${esc(x.run)}<br>${esc(x.el)}<br><b>${x.score}</b> ${esc((x.why || []).join(' · '))}${x.outside_rows ? `<br>${t('outside')}` : ''}${x.ambiguous ? `<br>⚠ ${t('closeTo')} ${esc(x.ambiguous)}` : ''}</figcaption></figure>`; }).join('')}</div>${g.taps > g.proof.length ? `<p class="empty">${t('allTaps')(g.taps)}</p>` : ''}`
        : `<p class="empty">${g.status === 'ran' ? t('proofRan') : t('proofNone')}</p>`}
      <h2 style="margin-top:14px">${t('pressingRows')}</h2>${g.press.length ? g.press.map(rowHtml).join('') : `<p class="empty">${t('noRows')}</p>`}
      ${g.kind === 'input' ? `<h2 style="margin-top:14px">${t('dismissingRows')}</h2>${g.dismiss.length ? g.dismiss.map(rowHtml).join('') : `<p class="empty">${t('noneYet')}</p>`}` : ''}
      <p class="gid">${t('groupId')} <span class="mono">${esc(g.group)}</span></p>`;
  } else {
    const a = D.arrows.find(x => x.id === sel.arrow);
    p.innerHTML = `${back}<h2>${esc(a.edge)}</h2><span class="pill" style="background:${COLOR(a.status)}">${ST()[a.status]}</span>${a.fail ? ` <span class="pill" style="background:var(--fail)">${t('pillFailed')}</span>` : ''}
      <dl><dt>${t('kind')}</dt><dd>${t('arrowKind')(a.kind)}</dd><dt>${t('requirement')}</dt><dd>${esc(a.req || t('noneYetReq'))}</dd><dt>${t('board')}</dt><dd>${esc(a.board)}</dd><dt>${t('specLabel')}</dt><dd>${t('specs')[specOf(D.boards.find(b => b.name === a.board) ?? {})]}</dd><dt>${t('arrow')}</dt><dd class="mono">${esc(a.id)}</dd></dl>
      <a href="${Object.values(D.figma)[0]}${a.id.replace(/-[A-Z]+$/, '')}" target="_blank" rel="noopener">${t('openFigma')}</a>
      ${a.src ? `<p><a href="#" id="srcl">${t('srcControl')}</a></p>` : ''}<h2 style="margin-top:14px">${t('rows')}</h2>${a.rows.length ? a.rows.map(rowHtml).join('') : `<p class="empty">${t('noArrowRows')}</p>`}`;
    if (a.src) $('srcl').onclick = e => { e.preventDefault(); select('g', a.src); };
  }
  if (kase) $('back').onclick = () => { sel = null; draw(); renderPanel(); };
}
// ---- Case view: where a case comes from ----
const inBoard = (b, [x, y]) => x >= b.box[0] && x <= b.box[0] + b.box[2] && y >= b.box[1] && y <= b.box[1] + b.box[3];
function caseItems(id) {
  const refs = D.rows[id]?.refs ?? [], rq = refs.map(r => D.reqs[r]).filter(Boolean);
  const named = new Set(rq.flatMap(r => r.groups));
  return {
    groups: D.groups.filter(g => g.press.includes(id) || g.dismiss.includes(id) || named.has(g.group)),
    arrows: D.arrows.filter(a => a.rows.includes(id)),
    screens: [...new Set(rq.flatMap(r => r.screens))].map(sid => D.screens.find(s => s.id === sid)).filter(Boolean),
    pointers: rq.flatMap(r => r.pointers ?? []),
    boards: [...new Set(rq.flatMap(r => r.src.flatMap(s => s.boards)))],
  };
}
// how many of the case's items lie on a board (copies of a control, arrows, named screens)
const caseOnBoard = b => caseIt.groups.reduce((n, g) => n + g.rects.filter(r => inBoard(b, r)).length, 0)
  + caseIt.arrows.filter(a => a.board === b.name).length + caseIt.screens.filter(sc => sc.board === b.name).length + caseIt.pointers.filter(p => p.board === b.name).length;
// the part of a board the case's items cover, to zoom to
function caseBox(b) {
  const pts = [...caseIt.groups.flatMap(g => g.rects.filter(r => inBoard(b, r)).flatMap(([x, y, w, h]) => [[x, y], [x + w, y + h]])),
    ...[...caseIt.arrows, ...caseIt.pointers].filter(a => a.board === b.name).flatMap(a => a.points.reduce((ps, v, i) => (i % 2 ? ps[ps.length - 1].push(v) : ps.push([v]), ps), [])),
    ...caseIt.screens.filter(sc => sc.board === b.name).flatMap(({ box: [x, y, w, h] }) => [[x, y], [x + w, y + h]])];
  if (!pts.length) return null;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x = Math.min(...xs), y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
}
function focusCase(id) {
  id = String(id || '').trim().toUpperCase(); if (/^\d+$/.test(id)) id = `TC-${id.padStart(3, '0')}`;
  if (!D.rows[id]) { kase = caseIt = null; caseBar(); boardsNav(); draw(); $('panel').innerHTML = `<p class="empty">${esc(t('caseNotFound')(id))}</p>`; return; }
  kase = id; caseIt = caseItems(id); sel = null; $('caseq').value = id;
  // the board holding most of the case's items, else the first board its requirements come from
  const best = D.boards.map(b => [b, caseOnBoard(b)]).sort((a, b) => b[1] - a[1])[0];
  const b = best?.[1] ? best[0] : D.boards.find(x => caseIt.boards.includes(x.name));
  if (b) openBoard(b, caseBox(b)); else { boardsNav(); draw(); }
  caseBar(); renderPanel();
}
function clearCase() {
  kase = caseIt = null; sel = null; $('caseq').value = '';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  caseBar(); boardsNav(); draw(); renderPanel();
}
function caseBar() {
  const el = $('casebar'); el.hidden = !kase; if (!kase) return;
  const nb = D.boards.filter(b => caseOnBoard(b)).length;
  el.innerHTML = `<b>${esc(kase)}</b><span>${esc(t('caseBar')(caseIt.groups.length, caseIt.arrows.length, nb))}</span><button id="caseclr">${t('caseClear')} ✕</button>`;
  $('caseclr').onclick = clearCase;
}
function casePanel() {
  const r = D.rows[kase], it = caseIt;
  const boardBtn = name => { const i = D.boards.findIndex(b => b.name === name); return i < 0 ? '' : `<button data-board="${i}">${esc(name)}</button>`; };
  const reqHtml = rid => { const q = D.reqs[rid];
    if (!q) return `<div class="req"><span class="rid">${esc(rid)}</span><span class="muted">—</span></div>`;
    const srcs = q.src.map(s => `<span class="spec">${t('specs')[s.spec] ?? s.spec}</span> <span class="muted">${esc([s.title, s.detail].filter(Boolean).join(' · '))}</span>`
      + (s.boards.length ? s.boards.map(boardBtn).join('') : ` <span class="srcs"><span class="off">${t('notOnBoards')}</span></span>`));
    const design = Object.keys(D.figma).find(k => D.boards.some(b => b.file === k && b.spec === 'design'));
    const figma = design ? (q.nodes ?? []).map(n => `<a href="${D.figma[design]}${n.replace(':', '-')}" target="_blank" rel="noopener">${t('openFigma')} ${esc(n)}</a>`) : [];
    if (!q.src.length && !figma.length) srcs.push(`<span class="muted">${t('noSource')}</span>`);
    return `<div class="req"><span class="rid">${esc(rid)}</span>${esc(q.text)}<div class="srcs">${[...srcs, ...figma].join('<span style="flex-basis:100%"></span>')}</div></div>`; };
  const where = g => { const b = D.boards.find(b => g.rects.some(rc => inBoard(b, rc))); return b ? b.name : g.board; };
  const gBtn = g => `<button data-g="${esc(g.group)}"><span class="sw" style="color:${COLOR(g.status)};width:9px;height:9px"></span>${esc(g.label || g.name)} <span class="muted">${esc(kindName(g.kind))}</span><span class="b">${esc(where(g))}</span></button>`;
  const aBtn = a => `<button data-a="${esc(a.id)}"><span class="sw" style="color:${COLOR(a.status)};width:9px;height:9px"></span>${esc(a.edge)}<span class="b">${esc(a.board)}</span></button>`;
  const scBtn = sc => `<button data-board="${D.boards.findIndex(b => b.name === sc.board)}">${esc(sc.name)}<span class="b">${esc(sc.board)}</span></button>`;
  $('panel').innerHTML = `<div class="k muted" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">${t('caseEyebrow')}${r.section ? ` · ${esc(r.section)}` : ''}</div>
    <h2>${esc(kase)} <span class="res ${esc(r.result)}">${esc(r.result === 'Not run' ? t('plannedRes') : r.result)}</span></h2>
    <dl><dt>${t('action')}</dt><dd>${esc(r.action)}</dd><dt>${t('expected')}</dt><dd>${esc(r.expected)}</dd></dl>
    <p style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 0">${PAGES.review ? `<a href="${esc(PAGES.review)}#${encodeURIComponent(kase)}">${t('openReview')} →</a>` : ''}${PAGES.plan ? `<a href="${esc(PAGES.plan)}#case=${encodeURIComponent(kase)}">${t('openPlan')} →</a>` : ''}</p>
    <h2 style="margin-top:14px">${t('caseWhere')}</h2>${r.refs.length ? r.refs.map(reqHtml).join('') : `<p class="empty">${t('caseNoRefs')}</p>`}
    ${it.groups.length ? `<h2 style="margin-top:14px">${t('casePresses')} (${it.groups.length})</h2><div class="items">${it.groups.map(gBtn).join('')}</div>` : ''}
    ${it.arrows.length ? `<h2 style="margin-top:14px">${t('caseWalks')} (${it.arrows.length})</h2><div class="items">${it.arrows.map(aBtn).join('')}</div>` : ''}
    ${it.screens.length ? `<h2 style="margin-top:14px">${t('caseScreens')}</h2><div class="items">${it.screens.map(scBtn).join('')}</div>` : ''}
    ${!it.groups.length && !it.arrows.length ? `<p class="empty" style="margin-top:12px">${t('caseNoItems')}</p>` : ''}`;
  for (const el of $('panel').querySelectorAll('[data-board]')) el.onclick = () => { const b = D.boards[+el.dataset.board]; if (b) openBoard(b, caseBox(b)); };
  for (const el of $('panel').querySelectorAll('[data-g]')) el.onclick = () => { const g = D.groups.find(x => x.group === el.dataset.g);
    const b = D.boards.find(b => g.rects.some(rc => inBoard(b, rc))) ?? D.boards.find(b => b.name === g.board); openBoard(b, g.rects.find(rc => inBoard(b, rc))); select('g', g.group); };
  for (const el of $('panel').querySelectorAll('[data-a]')) el.onclick = () => { const a = D.arrows.find(x => x.id === el.dataset.a);
    openBoard(D.boards.find(b => b.name === a.board), [a.points[0], a.points[1], 1, 1]); select('a', a.id); };
}
$('casef').onsubmit = e => { e.preventDefault(); const v = $('caseq').value.trim(); if (!v) { clearCase(); return; }
  let id = v.toUpperCase(); if (/^\d+$/.test(id)) id = `TC-${id.padStart(3, '0')}`; location.hash = `case=${encodeURIComponent(id)}`; };
const hashCase = () => { const m = location.hash.match(/^#case=(.+)$/); if (m) focusCase(decodeURIComponent(m[1])); };
addEventListener('hashchange', hashCase);
// zoom and pan by changing the viewBox
const svg = $('svg');
function zoom(f, cx, cy) {
  const r = svg.getBoundingClientRect(), px = cx === undefined ? 0.5 : (cx - r.left) / r.width, py = cy === undefined ? 0.5 : (cy - r.top) / r.height;
  const [x, y, w, h] = vb, nw = w * f, nh = h * f; vb = [x + (w - nw) * px, y + (h - nh) * py, nw, nh]; draw();
}
svg.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
let drag = null;
svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vb: [...vb], moved: false }; svg.setPointerCapture(e.pointerId); });
// the mark under the pointer, from the drawn geometry (not the DOM), so near-misses on thin lines still count
const markAt = e => { const m = svg.getScreenCTM(); if (!m || !vb) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return pick(p.x, p.y, 1 / m.a); };
let hoverFrame = 0;
svg.addEventListener('pointermove', e => { if (drag?.moved || hoverFrame) return; hoverFrame = requestAnimationFrame(() => { hoverFrame = 0;
  hoverMark(markAt(e)); const r = $('stage').getBoundingClientRect(), tip = $('tip'); tip.style.left = `${e.clientX - r.left}px`; tip.style.top = `${e.clientY - r.top}px`; }); });
svg.addEventListener('pointerleave', () => { cancelAnimationFrame(hoverFrame); hoverFrame = 0; hoverMark(null); });
svg.addEventListener('pointermove', e => { if (!drag) return; const r = svg.getBoundingClientRect(), k = Math.max(vb[2] / r.width, vb[3] / r.height);
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; svg.classList.add('drag'); }
  if (drag.moved) { $('tip').hidden = true; vb = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, vb[2], vb[3]]; svg.setAttribute('viewBox', vb.join(' ')); } });
svg.addEventListener('pointerup', e => { const was = drag?.moved; drag = null; svg.classList.remove('drag'); if (was) { draw(); return; }
  const m = markAt(e); if (m) select(m.t, m.id); });
$('zin').onclick = () => zoom(1 / 1.4); $('zout').onclick = () => zoom(1.4); $('fit').onclick = () => openBoard(board);
addEventListener('resize', () => draw());

// why an item is not pressed yet: the run's reason for a blocked row, or that its rows have not run
const whyOf = (status, rows) => status === 'blocked' ? [...new Set(rows.map(id => D.rows[id]?.reason).filter(Boolean))].join('; ') || 'Blocked'
  : status === 'notrun' ? 'whyNotrun' : status === 'none' ? 'whyNone' : 'whyUndismissed';
const whyText = x => x.status === 'blocked' ? (x.why === 'Blocked' ? t('whyBlocked') : tr(x.why)) : t(x.why);
const causeOf = x => x.status === 'blocked' ? x.why : x.status;
const causeText = c => ST()[c] ?? (c === 'undismissed' ? t('undismissed') : tr(c));
const goTo = x => { openBoard(D.boards.find(b => b.name === x.board), x.r); select(x.t, x.id); $('stage').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
function gaps() {
  const st = $('gstat').value, bd = $('gboard').value, q = $('gq').value.toLowerCase();
  const all = [
    ...D.groups.filter(g => ['none', 'notrun', 'blocked'].includes(g.status) || (g.kind === 'input' && !g.dismissed && g.status !== 'na'))
      .map(g => { const status = g.kind === 'input' && !['none', 'notrun', 'blocked'].includes(g.status) ? 'undismissed' : g.status;
        return { t: 'g', id: g.group, what: g.kind, board: g.board, name: `${g.name}${g.label ? ` 「${g.label}」` : ''}`, label: g.label || g.name, status, why: whyOf(status, g.press), rows: g.press, r: g.rects[0] }; }),
    ...D.arrows.filter(a => ['none', 'notrun', 'blocked'].includes(a.status)).map(a => ({ t: 'a', id: a.id, what: 'arrow', board: a.board, name: a.edge, label: a.edge, status: a.status, why: whyOf(a.status, a.rows), rows: a.rows, r: [a.points[0], a.points[1], 1, 1] })),
  ];
  const order = { none: 0, blocked: 1, notrun: 2, undismissed: 3 };
  all.sort((x, y) => order[x.status] - order[y.status] || x.why.localeCompare(y.why) || x.board.localeCompare(y.board));
  // one chip per cause, so the reasons read at a glance; a chip filters the list
  const causes = cnt(all, causeOf);
  $('reasons').innerHTML = Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([w, n]) =>
    `<span class="chip" role="button" tabindex="0" data-w="${esc(w)}" aria-pressed="${!reasonFilter || reasonFilter === w}"><b>${n}</b> ${esc(causeText(w))}</span>`).join('');
  for (const el of document.querySelectorAll('#reasons [data-w]')) el.onclick = el.onkeydown = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); const w = el.dataset.w; reasonFilter = reasonFilter === w ? '' : w; gaps();
    document.querySelector(`#reasons [data-w="${CSS.escape(w)}"]`)?.focus();
  };
  const items = all.filter(x => (!st || x.status === st) && (!bd || x.board === bd) && (!q || x.name.toLowerCase().includes(q)) && (!reasonFilter || causeOf(x) === reasonFilter));
  const label = s => s === 'undismissed' ? t('undismissed') : ST()[s];
  $('gtb').innerHTML = items.slice(0, 600).map((x, i) => `<tr class="go" data-i="${i}"><td>${esc(kindName(x.what))}</td><td>${esc(x.board)}</td><td>${esc(x.name)}</td><td><span class="pill" style="background:${COLOR(x.status === 'undismissed' ? 'blocked' : x.status)}">${label(x.status)}</span></td><td>${esc(whyText(x))}</td><td class="mono">${x.rows.map(esc).join(', ')}</td></tr>`).join('')
    || `<tr><td colspan="6" style="color:var(--muted)">${t('emptyFilter')}</td></tr>`;
  for (const row of document.querySelectorAll('#gtb tr[data-i]')) row.onclick = () => goTo(items[+row.dataset.i]);
}
for (const id of ['gstat', 'gboard', 'gq']) $(id).addEventListener('input', gaps);
function unmatchedList() {
  // nothing to list before a run logs taps: say so once instead of an empty table
  $('umtable').hidden = !D.taps;
  if (!D.taps) { $('umtb').innerHTML = ''; $('um-sec').querySelector('.intro').textContent = t('umNoLog'); return; }
  const target = u => D.groups.find(x => x.group === u.best_group);
  $('umtb').innerHTML = D.unmatched.slice(0, 400).map((u, i) => `<tr data-i="${i}"${target(u) ? ' class="go"' : ''}><td class="mono">${esc(u.run)}<br>${esc(u.case || '?')}</td><td>${esc(u.el || `point ${u.x},${u.y}`)}</td>
    <td>${u.best ? `${esc(u.best)} <span class="mono">(${u.best_score})</span>` : '—'}</td><td>${u.shot ? `<a href="${esc(u.shot)}" target="_blank">${t('screenshot')}</a>` : ''}</td></tr>`).join('')
    || `<tr><td colspan="4" style="color:var(--muted)">${t('umNone')}</td></tr>`;
  for (const row of document.querySelectorAll('#umtb tr.go')) row.onclick = e => { if (e.target.closest('a')) return; const g = target(D.unmatched[+row.dataset.i]);
    goTo({ t: 'g', id: g.group, board: g.board, r: g.rects[0] }); };
}
function render() { header(); strip(); legend(); unmatchedList(); specFilter(); boardsNav(); draw(); renderPanel(); gaps(); caseBar(); }
for (const b of document.querySelectorAll('.lang button')) b.onclick = () => { L = b.dataset.lang; try { localStorage.setItem('coverage-lang', L); } catch {} render(); };
board = D.boards.find(b => b.img) || D.boards[0]; openBoard(board); render(); hashCase();
</script>
</body>
</html>

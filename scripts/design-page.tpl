<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<!-- tab icon (design: two frames side by side), different on each page so the browser tabs are easy to tell apart -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%236a55a8'/><rect x='6' y='8' width='8' height='16' rx='2' fill='none' stroke='white' stroke-width='2.4'/><rect x='18' y='8' width='8' height='16' rx='2' fill='white'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&display=swap">
<style>
/* Layout: status chips and two filters, then a grid of screen cards; a card opens the comparison (Figma | app, the
   differences boxed and listed). Same palette as Results. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73; --chip-bg: #eef2f2;
  --differs: #b8402f; --question: #a86b12; --unreviewed: #6a55a8; --matches: #2f7d4f; --none: #9aa6a8;
  --display: "Archivo", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
  --body: "Source Sans 3", "Noto Sans TC", "Segoe UI", system-ui, "PingFang TC", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd; --chip-bg: #213032;
  --differs: #ec7a66; --question: #e0a548; --unreviewed: #a796e0; --matches: #5cbf83; --none: #5f6f71; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd; --chip-bg: #213032;
  --differs: #ec7a66; --question: #e0a548; --unreviewed: #a796e0; --matches: #5cbf83; --none: #5f6f71; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 56px }
.wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 18px }
h1 { font: 750 1.9rem var(--display); margin: 0; letter-spacing: -0.01em }
.eyebrow { font: 600 0.72rem/1 var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted) }
.top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap }
.lang { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: var(--panel) }
.lang button { font: 600 0.85rem var(--body); border: 0; background: transparent; color: var(--ink); padding: 5px 14px; cursor: pointer }
.lang button[aria-pressed="true"] { background: var(--ink); color: var(--panel) }
.meta { color: var(--muted); font-size: 0.92rem }
.bar { display: flex; height: 10px; border-radius: 3px; overflow: hidden; background: var(--chip-bg) }
.bar span { display: block; height: 100% }
.tools { position: sticky; top: 0; z-index: 5; background: var(--bg); padding: 10px 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-bottom: 1px solid var(--line) }
.chip { font: 600 0.82rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 999px; padding: 5px 12px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center }
.chip i { width: 9px; height: 9px; border-radius: 2px; display: inline-block }
.chip[aria-pressed="true"] { background: var(--ink); color: var(--panel); border-color: var(--ink) }
.chip .n { font: 0.78rem var(--mono); opacity: 0.8 }
select, input[type="search"] { font: 0.88rem var(--body); color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; min-width: 0 }
input[type="search"] { flex: 1 1 180px }
.count { font: 0.82rem var(--mono); color: var(--muted); margin-left: auto }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px }
.card { background: var(--panel); border: 1px solid var(--line); border-top: 4px solid var(--none); border-radius: 6px; padding: 8px; cursor: pointer; display: grid; gap: 6px; text-align: left; font: inherit; color: inherit }
.card:hover, .card:focus-visible { box-shadow: 0 0 0 2px var(--accent); outline: none }
.card .nm { font-weight: 600; font-size: 0.88rem; line-height: 1.25; overflow-wrap: anywhere }
.card .sub { font: 0.72rem var(--mono); color: var(--muted) }
.thumb { aspect-ratio: 375 / 812; overflow: hidden; border-radius: 4px; background: var(--chip-bg); position: relative }
.thumb img { display: block; width: 100%; height: auto }
.thumb .cut { position: absolute; max-width: none }
.st { font: 600 0.72rem var(--body); display: inline-flex; gap: 5px; align-items: center }
.st i { width: 8px; height: 8px; border-radius: 50%; display: inline-block }
.empty { color: var(--muted); padding: 24px 0 }
/* the comparison */
dialog { border: 0; border-radius: 10px; padding: 0; width: min(1180px, 100vw - 24px); max-height: calc(100vh - 24px); background: var(--panel); color: var(--ink) }
dialog::backdrop { background: rgba(10, 16, 18, 0.6) }
.dh { position: sticky; top: 0; background: var(--panel); border-bottom: 1px solid var(--line); padding: 12px 16px; display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; z-index: 2 }
.dh h2 { font: 700 1.2rem var(--display); margin: 0 }
.dh .x { margin-left: auto; font: 600 1rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 6px; padding: 2px 10px; cursor: pointer }
.db { padding: 14px 16px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 380px); gap: 16px }
@media (max-width: 760px) { .db { grid-template-columns: 1fr } }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start }
.side { display: grid; gap: 4px }
.side b { font: 600 0.72rem var(--mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em }
.frame { position: relative; overflow: hidden; border-radius: 6px; background: var(--chip-bg) }
.frame img { display: block; width: 100% }
.frame .cut { position: absolute; max-width: none; width: auto }
.frame svg { position: absolute; inset: 0; width: 100%; height: 100% }
.frame .no { aspect-ratio: 375 / 812; display: grid; place-items: center; color: var(--muted); font-size: 0.85rem; padding: 12px; text-align: center }
.box { fill: none; stroke-width: 2.5; vector-effect: non-scaling-stroke }
.box.hl { stroke-width: 5 }
.route { font-size: 0.88rem; display: grid; gap: 4px; margin-bottom: 10px }
.route a { color: var(--accent) }
.items { display: grid; gap: 8px; align-content: start }
.it { border: 1px solid var(--line); border-left: 4px solid var(--none); border-radius: 6px; padding: 8px 10px; font-size: 0.86rem; display: grid; gap: 3px }
.it .h { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap }
.it .num { font: 700 0.8rem var(--mono); color: #fff; border-radius: 4px; padding: 0 6px }
.it .k { font: 600 0.78rem var(--mono) }
.it .v { margin-left: auto; font: 600 0.75rem var(--body) }
.it q { quotes: "「" "」"; overflow-wrap: anywhere }
.it .note { color: var(--muted) }
.sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; border: 1px solid var(--line); vertical-align: -1px }
.more { font-size: 0.82rem; color: var(--muted) }
.dec { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; margin-top: 2px }
.dec button { font: 600 0.74rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 5px; padding: 2px 8px; cursor: pointer }
.dec button[aria-pressed="true"] { background: var(--ink); color: var(--panel); border-color: var(--ink) }
.dec label { font-size: 0.78rem; display: inline-flex; gap: 4px; align-items: center; margin-left: 4px }
.warn { border: 1px solid var(--question); border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; margin-bottom: 8px }
.rc { font-size: 0.84rem; display: grid; gap: 2px; margin-bottom: 10px }
.rc b.fixed { color: var(--matches) } .rc b.still { color: var(--differs) } .rc b.check { color: var(--question) }
.frame a { display: block }
.parts { display: flex; gap: 6px; flex-wrap: wrap; font-size: 0.78rem }
.noboxes .frame svg { display: none }
</style>
</head>
<body>
<div class="wrap">
  <div class="top"><span class="eyebrow" id="eyebrow"></span><span class="lang" role="group" aria-label="Language"><button type="button" data-l="en">English</button><button type="button" data-l="zh">中文</button></span></div>
  <h1 id="h1"></h1>
  <div class="meta" id="meta"></div>
  <div class="bar" id="bar"></div>
  <div class="tools">
    <span id="chips" style="display:contents"></span>
    <select id="board" aria-label="Board"></select>
    <select id="kind" aria-label="Difference"></select>
    <input type="search" id="q" autocomplete="off">
    <span class="count" id="count"></span>
    <button type="button" class="chip" id="copy" hidden></button>
  </div>
  <div class="grid" id="grid"></div>
</div>
<dialog id="dlg"></dialog>
<script>
const D = __DATA__;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Language: English or 中文 for what the page writes itself; Figma and app text stay as they are.
let L = 'en';
if (window.CASEBOOK) L = window.CASEBOOK.lang; else try { if (localStorage.getItem('casebook-lang') === 'zh') L = 'zh'; } catch (e) {}
const T = {
  en: { eyebrow: 'Casebook design check', title: f => `${f} · Design`, all: 'All', allBoards: 'All boards', search: 'Search screen, board or case',
    shown: (n, m) => `${n} of ${m}`, none: 'No screen matches these filters.', noPlan: 'No design plan yet: run node scripts/design.ts <feature> <platform> plan (figma skill, references/conformance.md).',
    meta: (n, c, s) => `${n} Design screens · ${c} captured · spec set ${s}`, figma: 'Figma', app: 'App', noApp: 'No capture on this computer', noFig: 'No Figma image on this computer',
    reached: 'Reached by', fit: { high: 'direct', mid: 'likely', low: 'area only' }, also: 'also', pre: 'Precondition', action: 'Action', via: 'via',
    run: 'Run', open: 'Open in Figma', cases: 'Cases', cov: 'Coverage', res: 'Results', info: n => `${n} info items (sample text, app text not in Figma)`,
    showInfo: 'Show', hideInfo: 'Hide', nothing: 'No differences measured.', notCaptured: 'Not captured yet: reach it as shown and capture it (device.ts … design <id>).', close: 'Close',
    fitNote: (t, b) => `Fit offset: top ${t} pt, bottom ${b} pt`, allKinds: 'All differences', copy: n => `Copy decisions (${n})`, copied: 'Copied',
    bug: 'Bug', ok: 'OK', na: 'N/A', ebug: 'eBug', you: 'your call', recheck: r => `Recheck of ${r}`, build: 'Build', boxes: 'Boxes',
    doubt: (m, n) => `Only ${m} of ${n} Figma texts were found: this capture may be another state.`, part: n => `part ${n}`, zoom: 'Click an image to open it full size.',
    now: { fixed: 'fixed', still: 'still there', check: 'look again' }, designPath: 'Design path', byArrows: 'Reached by the Design arrows',
    gap: 'No casebook row reaches this screen: a gap for the analysis.', pfit: { path: 'arrow path', variant: 'state beside a reached screen', entry: 'first screen of a flow' } },
  zh: { eyebrow: '測試表設計比對', title: f => `${f} · 設計比對`, all: '全部', allBoards: '全部畫板', search: '搜尋畫面、畫板或案例',
    shown: (n, m) => `${n} / ${m}`, none: '沒有符合篩選條件的畫面。', noPlan: '還沒有設計比對計畫：執行 node scripts/design.ts <feature> <platform> plan（figma 技能，references/conformance.md）。',
    meta: (n, c, s) => `${n} 個 Design 畫面 · 已擷取 ${c} · 規格 ${s}`, figma: 'Figma', app: 'App', noApp: '這台電腦沒有擷取圖', noFig: '這台電腦沒有 Figma 圖',
    reached: '到達方式', fit: { high: '直接', mid: '可能', low: '僅到區域' }, also: '另有', pre: '前置條件', action: '操作', via: '經由',
    run: '執行', open: '在 Figma 開啟', cases: '案例', cov: '覆蓋率', res: '結果', info: n => `${n} 個資訊項目（範例文字、Figma 沒有的 App 文字）`,
    showInfo: '顯示', hideInfo: '隱藏', nothing: '沒有量到差異。', notCaptured: '尚未擷取：依右側方式到達後擷取（device.ts … design <id>）。', close: '關閉',
    fitNote: (t, b) => `對齊位移：上 ${t} pt，下 ${b} pt`, allKinds: '全部差異', copy: n => `複製決定（${n}）`, copied: '已複製',
    bug: '問題', ok: '一致', na: '無法判定', ebug: '開 eBug', you: '你的決定', recheck: r => `複驗 ${r}`, build: '版本', boxes: '框線',
    doubt: (m, n) => `只找到 ${m} / ${n} 個 Figma 文字：這張擷取圖可能是別的狀態。`, part: n => `第 ${n} 段`, zoom: '點圖片可開啟原尺寸。',
    now: { fixed: '已修正', still: '仍存在', check: '需再看' }, designPath: 'Design 路徑', byArrows: '依 Design 箭頭到達',
    gap: '沒有任何測試表案例到達此畫面：分析需補上。', pfit: { path: '箭頭路徑', variant: '已到達畫面旁的狀態', entry: '流程的第一個畫面' } },
};
const t = k => T[L][k] ?? T.en[k];
const ST = ['differs', 'question', 'unreviewed', 'matches', 'not-captured', 'no-route', 'excluded'];
const STN = { en: { differs: 'Differs', question: 'Question', unreviewed: 'Unreviewed', matches: 'Matches', 'not-captured': 'Not captured', 'no-route': 'No route', excluded: 'Excluded' },
  zh: { differs: '有差異', question: '待確認', unreviewed: '未審查', matches: '一致', 'not-captured': '未擷取', 'no-route': '無路徑', excluded: '排除' } };
const COL = s => `var(--${({ differs: 'differs', question: 'question', unreviewed: 'unreviewed', matches: 'matches' })[s] ?? 'none'})`;
const VN = { en: { bug: 'Bug', question: 'Question', ok: 'OK', 'n/a': 'N/A', unreviewed: 'Unreviewed', info: 'Info' }, zh: { bug: '問題', question: '待確認', ok: '一致', 'n/a': '無法判定', unreviewed: '未審查', info: '資訊' } };
const VC = v => `var(--${({ bug: 'differs', question: 'question', unreviewed: 'unreviewed', ok: 'matches' })[v] ?? 'none'})`;
const KN = { en: { state: 'State', truncated: 'Truncated', control: 'Control', copy: 'Copy', missing: 'Missing', lines: 'Lines', position: 'Position', colour: 'Colour', extra: 'Extra text', sample: 'Sample text', visual: 'Visual' },
  zh: { state: '狀態', truncated: '截斷', control: '控制項', copy: '文案', missing: '缺少', lines: '行數', position: '位置', colour: '顏色', extra: '多出文字', sample: '範例文字', visual: '視覺' } };
const PAGES = window.CASEBOOK?.pages ?? {};
let st = '', board = '', kind = '', q = '', open = null, showInfo = false, noBoxes = false;
// the user's decisions: run|screen|id → { v: bug | ok | n/a, ebug: true }, kept in this browser until copied to the chat
const DKEY = `design-decisions:${D.feature}:${D.platform}`;
let DEC = {}; try { DEC = JSON.parse(localStorage.getItem(DKEY) || '{}'); } catch (e) {}
const saveDec = () => { try { localStorage.setItem(DKEY, JSON.stringify(DEC)); } catch (e) {} copyBtn(); };
const dkey = (s, it) => `${s.run}|${s.id}|${it.id}`;
function copyBtn() {
  const n = Object.values(DEC).filter(d => d.v || d.ebug).length, b = $('copy');
  b.hidden = !n; b.textContent = t('copy')(n);
}
$('copy').onclick = async () => {
  const lines = [`DESIGN DECISIONS ${D.feature} ${D.platform}`];
  for (const [k, d] of Object.entries(DEC)) { const [run, scr, id] = k.split('|');
    if (d.v) lines.push(`${run} ${scr} ${id}: ${d.v}`); if (d.ebug) lines.push(`${run} ${scr} ${id}: eBug`); }
  try { await navigator.clipboard.writeText(lines.join('\n')); $('copy').textContent = t('copied'); setTimeout(copyBtn, 1500); } catch (e) { prompt('', lines.join('\n')); }
};
$('kind').onchange = e => { kind = e.target.value; grid(); };
$('q').oninput = e => { q = e.target.value.trim().toLowerCase(); grid(); };
$('board').onchange = e => { board = e.target.value; grid(); };

// a Figma image: the crop as is, or the board screenshot cut to the screen (width, left and margin-top in % of the
// frame's width, so the cut holds whatever height the frame has)
function fig(f, lazy = true) {
  if (!f) return '';
  const ld = lazy ? ' loading="lazy"' : '';
  if (!f.crop) return `<img src="${esc(f.src)}" alt=""${ld}>`;
  const [x, y, w] = f.crop, k = 100 / w;
  return `<img class="cut" src="${esc(f.src)}" alt=""${ld} style="width:${f.iw * k}%;left:${-x * k}%;top:0;margin-top:${-y * k}%">`;
}
function render() {
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === L)));
  $('eyebrow').textContent = t('eyebrow'); $('h1').textContent = t('title')(D.title); $('q').placeholder = t('search');
  if (D.missing) { $('meta').textContent = t('noPlan'); return; }
  const n = s => D.screens.filter(x => x.status === s).length;
  $('meta').textContent = t('meta')(D.screens.length, D.screens.filter(s => s.run).length, D.spec_set);
  $('bar').innerHTML = ST.map(s => n(s) ? `<span style="width:${100 * n(s) / D.screens.length}%;background:${COL(s)}" title="${esc(STN[L][s])} ${n(s)}"></span>` : '').join('');
  $('chips').innerHTML = [['', t('all'), D.screens.length], ...ST.filter(n).map(s => [s, STN[L][s], n(s)])].map(([k, l, c]) =>
    `<button type="button" class="chip" data-s="${k}" aria-pressed="${st === k}">${k ? `<i style="background:${COL(k)}"></i>` : ''}${esc(l)} <span class="n">${c}</span></button>`).join('');
  $('chips').querySelectorAll('.chip').forEach(b => b.onclick = () => { st = b.dataset.s; render(); });
  const boards = [...new Set(D.screens.map(s => s.board))];
  $('board').innerHTML = `<option value="">${esc(t('allBoards'))}</option>` + boards.map(b => `<option${b === board ? ' selected' : ''}>${esc(b)}</option>`).join('');
  const kinds = [...new Set(D.screens.flatMap(s => s.items.filter(i => i.verdict !== 'ok' && i.verdict !== 'info').map(i => i.kind)))];
  $('kind').innerHTML = `<option value="">${esc(t('allKinds'))}</option>` + kinds.map(k => `<option value="${esc(k)}"${k === kind ? ' selected' : ''}>${esc(KN[L][k] ?? k)}</option>`).join('');
  copyBtn(); grid(); if (open) detail(open);
}
function grid() {
  const list = D.screens.filter(s => (!st || s.status === st) && (!board || s.board === board)
    && (!kind || s.items.some(i => i.kind === kind && i.verdict !== 'ok' && i.verdict !== 'info'))
    && (!q || `${s.name} ${s.board} ${s.id} ${s.route?.case ?? ''}`.toLowerCase().includes(q)));
  $('count').textContent = t('shown')(list.length, D.screens.length);
  $('grid').innerHTML = list.length ? list.map(s => {
    const bugs = s.items.filter(i => i.verdict === 'bug').length, qs = s.items.filter(i => i.verdict === 'question' || i.verdict === 'unreviewed').length;
    return `<button type="button" class="card" data-id="${esc(s.id)}" style="border-top-color:${COL(s.status)}">
      <div class="thumb">${fig(s.figma)}</div>
      <span class="st"><i style="background:${COL(s.status)}"></i>${esc(STN[L][s.status])}${bugs ? ` · ${bugs}` : qs ? ` · ${qs}` : ''}</span>
      <span class="nm">${esc(s.name)}</span><span class="sub">${esc(s.board)}${s.route ? ` · ${esc(s.route.case || t('designPath'))}` : ''}</span></button>`;
  }).join('') : `<p class="empty">${esc(t('none'))}</p>`;
  $('grid').querySelectorAll('.card').forEach(c => c.onclick = () => { location.hash = `screen=${encodeURIComponent(c.dataset.id)}`; });
}
// one difference: number, kind, verdict, Figma vs app
const ORDER = { bug: 0, question: 1, unreviewed: 2, 'n/a': 3, ok: 4, info: 5 };
function detail(id) {
  const s = D.screens.find(x => x.id === id); if (!s) return;
  open = id;
  const main = s.items.filter(i => i.verdict !== 'info').sort((a, b) => (ORDER[a.verdict] ?? 9) - (ORDER[b.verdict] ?? 9));
  const info = s.items.filter(i => i.verdict === 'info'), shown = showInfo ? [...main, ...info] : main;
  const k = s.k ? 1 / s.k : 1, aw = s.win ? s.win.w * (s.k ?? 1) : s.w, ah = s.win ? s.win.h * (s.k ?? 1) : s.h;
  const boxes = (side, w, h) => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${shown.map((it, n) => {
    const b = it[side]?.box; if (!b) return '';
    return `<rect class="box" data-n="${n}" x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" style="stroke:${VC(it.verdict)}"/>`; }).join('')}</svg>`;
  const txt = (o) => o?.text ? `<q>${esc(o.text.length > 120 ? o.text.slice(0, 120) + '…' : o.text)}</q>` : o?.color ? `<span class="sw" style="background:${esc(o.color)}"></span> ${esc(o.color)}` : o?.name ? `<code>${esc(o.name)}</code>` : '';
  const r = s.route, link = (p, h, l) => PAGES[p] ? `<a href="${PAGES[p]}#${h}">${esc(l)}</a>` : '';
  const keep = open === id && $('dlg').open ? $('dlg').scrollTop : 0;
  const figmaUrl = D.file ? `https://www.figma.com/design/${D.file}?node-id=${encodeURIComponent(s.id.replace(':', '-'))}` : '';
  $('dlg').innerHTML = `<div class="dh"><h2>${esc(s.name)}</h2><span class="st"><i style="background:${COL(s.status)}"></i>${esc(STN[L][s.status])}</span>
    <span class="more">${esc(s.board)} · ${esc(s.id)}${s.run ? ` · ${t('run')} ${esc(s.run)}` : ''}${s.build ? ` · ${t('build')} ${esc(s.build)}` : ''}</span>
    <label class="more"><input type="checkbox" id="bx"${noBoxes ? '' : ' checked'}> ${esc(t('boxes'))}</label>
    ${figmaUrl ? `<a class="more" href="${figmaUrl}" target="_blank" rel="noopener">${esc(t('open'))} ↗</a>` : ''}<button type="button" class="x" id="x" aria-label="${esc(t('close'))}">✕</button></div>
  <div class="db"><div class="pair">
    <div class="side"><b>${esc(t('figma'))}</b><div class="frame" style="aspect-ratio:${s.w}/${s.h}">${s.figma ? `<a href="${esc(s.figma.src)}" target="_blank" rel="noopener" title="${esc(t('zoom'))}">${fig(s.figma, false)}</a>` + boxes('figma', s.w, s.h) : `<div class="no">${esc(t('noFig'))}</div>`}</div></div>
    <div class="side"><b>${esc(t('app'))}</b><div class="frame">${s.app ? `<a href="${esc(s.app)}" target="_blank" rel="noopener" title="${esc(t('zoom'))}"><img src="${esc(s.app)}" alt=""></a>${boxes('app', aw, ah)}` : `<div class="no">${esc(s.run ? t('noApp') : s.status === 'not-captured' ? t('notCaptured') : STN[L][s.status])}</div>`}</div></div>
  ${s.parts.length ? `<div class="parts">${s.parts.map((p, i) => `<a href="${esc(p)}" target="_blank" rel="noopener">${esc(t('part')(i + 2))}</a>`).join('')}</div>` : ''}
  </div><div>
    ${s.arrival && !s.arrival.ok ? `<div class="warn">${esc(t('doubt')(s.arrival.matched, s.arrival.of))}</div>` : ''}
    ${s.recheck ? `<div class="rc"><b>${esc(t('recheck')(s.recheck.run))}</b>${s.recheck.items.map(i => `<div><b class="${i.now}">${esc(t('now')[i.now])}</b> ${esc(KN[L][i.id.split(':')[0]] ?? i.id)} <span class="more">${esc(i.note)}</span></div>`).join('')}</div>` : ''}
    ${s.gap ? `<div class="warn">${esc(t('gap'))}</div>` : ''}
    ${r && r.how === 'figma' ? `<div class="route"><div><b>${esc(t('byArrows'))}</b> <span class="more">(${esc(t('pfit')[r.fit] ?? r.fit)})</span></div><div class="more">${esc(r.action)}</div></div>`
    : r ? `<div class="route"><div><b>${esc(t('reached'))}</b> ${esc(r.case)} <span class="more">(${esc(t('fit')[r.fit] ?? r.fit)}, ${esc(t('via'))} ${esc(r.edge || r.via)})</span>
      ${link('review', esc(r.case), t('cases'))} ${link('coverage', `case=${esc(r.case)}`, t('cov'))} ${link('results', `case=${esc(r.case)}`, t('res'))}</div>
      ${r.precondition ? `<div class="more"><b>${esc(t('pre'))}</b> ${esc(r.precondition)}</div>` : ''}<div class="more"><b>${esc(t('action'))}</b> ${esc(r.action)}</div>
      ${s.alternatives.length ? `<div class="more">${esc(t('also'))}: ${s.alternatives.map(esc).join(', ')}</div>` : ''}
      ${s.fit ? `<div class="more">${esc(t('fitNote')(s.fit.top.dy, s.fit.bottom.dy))}</div>` : ''}</div>` : s.why ? `<p class="more">${esc(s.why)}</p>` : ''}
    <div class="items">${s.run && !main.length ? `<p class="more">${esc(t('nothing'))}</p>` : ''}${shown.map((it, n) => `<div class="it" data-n="${n}" style="border-left-color:${VC(it.verdict)}">
      <div class="h"><span class="num" style="background:${VC(it.verdict)}">${n + 1}</span><span class="k">${esc(KN[L][it.kind] ?? it.kind)}</span>
      ${it.severity && it.verdict === 'bug' ? `<span class="more">${esc(it.severity)}</span>` : ''}<span class="v" style="color:${VC(it.verdict)}">${esc(VN[L][it.verdict] ?? it.verdict)}</span></div>
      ${it.figma ? `<div>${esc(t('figma'))} ${txt(it.figma)}</div>` : ''}${it.app && (it.app.text || it.app.color) ? `<div>${esc(t('app'))} ${txt(it.app)}</div>` : ''}
      ${it.delta ? `<div class="more">${esc(Object.entries(it.delta).map(([a, b]) => `${a} ${b}`).join(' · '))}</div>` : ''}
      ${it.split ? `<div class="note">${esc(it.split)}</div>` : ''}${it.decided ? `<div class="note">${esc(it.decided)}</div>` : ''}
      ${s.run && (it.verdict === 'question' || it.verdict === 'unreviewed' || it.verdict === 'bug') ? `<div class="dec" data-k="${esc(dkey(s, it))}">${it.verdict !== 'bug' ? [['bug', t('bug')], ['ok', t('ok')], ['n/a', t('na')]].map(([v, l]) =>
        `<button type="button" data-v="${v}" aria-pressed="${DEC[dkey(s, it)]?.v === v}">${esc(l)}</button>`).join('') : ''}
        ${it.verdict === 'bug' || DEC[dkey(s, it)]?.v === 'bug' ? `<label><input type="checkbox" data-e${DEC[dkey(s, it)]?.ebug ? ' checked' : ''}> ${esc(t('ebug'))}</label>` : ''}</div>` : ''}${it.note ? `<div class="note">${esc(it.note)}</div>` : ''}${it.reviewer && it.reviewer !== it.note ? `<div class="note">${esc(it.reviewer)}</div>` : ''}</div>`).join('')}
    ${info.length ? `<button type="button" class="chip" id="info">${esc(showInfo ? t('hideInfo') : t('showInfo'))} · ${esc(t('info')(info.length))}</button>` : ''}</div>
  </div></div>`;
  $('x').onclick = () => { history.replaceState(null, '', location.pathname + location.search); $('dlg').close(); open = null; };
  $('info')?.addEventListener('click', () => { showInfo = !showInfo; detail(id); });
  $('bx').onchange = e => { noBoxes = !e.target.checked; $('dlg').classList.toggle('noboxes', noBoxes); };
  $('dlg').classList.toggle('noboxes', noBoxes);
  // a decision: press again to clear it
  $('dlg').querySelectorAll('.dec').forEach(d => {
    const k = d.dataset.k;
    d.querySelectorAll('button').forEach(b => b.onclick = () => { const cur = DEC[k] ?? {};
      DEC[k] = { ...cur, v: cur.v === b.dataset.v ? undefined : b.dataset.v }; if (DEC[k].v !== 'bug' && !s.items.find(i => dkey(s, i) === k && i.verdict === 'bug')) delete DEC[k].ebug;
      if (!DEC[k].v && !DEC[k].ebug) delete DEC[k]; saveDec(); detail(id); });
    d.querySelector('[data-e]')?.addEventListener('change', e => { DEC[k] = { ...(DEC[k] ?? {}), ebug: e.target.checked || undefined }; if (!DEC[k].v && !DEC[k].ebug) delete DEC[k]; saveDec(); });
  });
  // hovering a difference highlights its boxes on both images
  $('dlg').querySelectorAll('.it').forEach(e => { const hl = on => $('dlg').querySelectorAll(`rect[data-n="${e.dataset.n}"]`).forEach(r => r.classList.toggle('hl', on));
    e.onmouseenter = () => hl(true); e.onmouseleave = () => hl(false); });
  if (!$('dlg').open) $('dlg').showModal();
  $('dlg').scrollTop = keep;
}
$('dlg').addEventListener('close', () => { open = null; if (location.hash.startsWith('#screen=')) history.replaceState(null, '', location.pathname + location.search); });
const fromHash = () => { const m = location.hash.match(/^#screen=(.+)$/); if (m) detail(decodeURIComponent(m[1])); };
const setLang = l => { L = l; try { localStorage.setItem('casebook-lang', l); } catch (e) {} render(); };
document.querySelectorAll('.lang button').forEach(b => b.onclick = () => setLang(b.dataset.l));
if (window.CASEBOOK) { document.querySelector('.lang')?.remove(); addEventListener('casebook-lang', e => { L = e.detail; render(); }); }
addEventListener('hashchange', fromHash);
render(); fromHash();
</script>
</body>
</html>

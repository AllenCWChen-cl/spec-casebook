<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<!-- tab icon (results: a check over a frame), different on each page so the browser tabs are easy to tell apart -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%232f7d4f'/><path d='M9 16.5l4.5 4.5L23 11' stroke='white' stroke-width='3.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&display=swap">
<style>
/* Layout: a run picker and filters, then one card per case — what was done, what should happen, what happened and the
   screenshots that show it. Same palette as the run plan. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73;
  --pass: #2f7d4f; --fail: #b8402f; --blocked: #a86b12; --inc: #6a55a8; --notrun: #9aa6a8; --chip-bg: #eef2f2;
  --display: "Archivo", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
  --body: "Source Sans 3", "Noto Sans TC", "Segoe UI", system-ui, "PingFang TC", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --pass: #5cbf83; --fail: #ec7a66; --blocked: #e0a548; --inc: #a796e0; --notrun: #5f6f71; --chip-bg: #213032; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --pass: #5cbf83; --fail: #ec7a66; --blocked: #e0a548; --inc: #a796e0; --notrun: #5f6f71; --chip-bg: #213032; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 56px }
.wrap { max-width: 1180px; margin: 0 auto; display: grid; gap: 20px }
h1 { font: 750 1.9rem var(--display); margin: 0; letter-spacing: -0.01em; text-wrap: balance }
.eyebrow { font: 600 0.72rem/1 var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted) }
.top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap }
.lang { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: var(--panel) }
.lang button { font: 600 0.85rem var(--body); border: 0; background: transparent; color: var(--ink); padding: 5px 14px; cursor: pointer }
.lang button[aria-pressed="true"] { background: var(--ink); color: var(--panel) }
.meta { color: var(--muted); display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 0.92rem }
.meta b { color: var(--ink); font-weight: 600 }
.runs { display: flex; flex-wrap: wrap; gap: 6px }
.runs button { font: 600 0.82rem var(--mono); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 6px; padding: 6px 10px; cursor: pointer; text-align: left }
.runs button[aria-pressed="true"] { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); color: var(--accent) }
.runs button small { display: block; font: 400 0.72rem var(--mono); color: var(--muted) }
.bar { display: flex; height: 12px; border-radius: 3px; overflow: hidden; background: var(--chip-bg) }
.bar span { display: block; height: 100% }
.tools { position: sticky; top: 0; z-index: 5; background: var(--bg); padding: 10px 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-bottom: 1px solid var(--line) }
.chip { font: 600 0.82rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 999px; padding: 5px 12px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center }
.chip i { width: 9px; height: 9px; border-radius: 2px; display: inline-block }
.chip[aria-pressed="true"] { background: var(--ink); color: var(--panel); border-color: var(--ink) }
.chip .n { font: 0.78rem var(--mono); opacity: 0.8 }
select, input[type="search"] { font: 0.88rem var(--body); color: var(--ink); background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; min-width: 0 }
input[type="search"] { flex: 1 1 200px }
label.only { font-size: 0.85rem; color: var(--muted); display: inline-flex; gap: 6px; align-items: center }
.count { font: 0.82rem var(--mono); color: var(--muted); margin-left: auto }
.list { display: grid; gap: 12px }
.seg-h { font: 650 1rem var(--display); margin: 14px 0 0; color: var(--muted) }
.case { background: var(--panel); border: 1px solid var(--line); border-left: 4px solid var(--notrun); border-radius: 6px; padding: 14px 16px; display: grid; gap: 10px; scroll-margin-top: 70px }
.case.Pass { border-left-color: var(--pass) } .case.Fail { border-left-color: var(--fail) } .case.Blocked { border-left-color: var(--blocked) } .case.Inconclusive { border-left-color: var(--inc) }
.case.focus { box-shadow: 0 0 0 2px var(--accent) }
.head { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: baseline }
.cid { font: 600 0.95rem var(--mono) }
.sec { color: var(--muted); font-size: 0.9rem }
.res { font: 600 0.75rem var(--mono); text-transform: uppercase; letter-spacing: 0.05em; padding: 3px 8px; border-radius: 3px; background: var(--chip-bg); margin-left: auto }
.res.Pass { color: var(--pass) } .res.Fail { color: var(--fail) } .res.Blocked { color: var(--blocked) } .res.Inconclusive { color: var(--inc) }
.disp { font: 0.75rem var(--mono); color: var(--muted) }
.xl { display: flex; gap: 10px; font-size: 0.82rem }
.xl a { color: var(--accent); text-decoration: none } .xl a:hover { text-decoration: underline }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 16px }
.grid h4 { margin: 0 0 2px; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted) }
.grid p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere }
.found { background: var(--chip-bg); border-radius: 4px; padding: 8px 10px }
.found.Fail { box-shadow: inset 3px 0 0 var(--fail) } .found.Blocked { box-shadow: inset 3px 0 0 var(--blocked) } .found.Pass { box-shadow: inset 3px 0 0 var(--pass) }
.why { margin-top: 6px; font-size: 0.88rem; color: var(--blocked) }
.bug { font: 600 0.82em var(--mono); background: var(--panel); border: 1px solid var(--line); border-radius: 3px; padding: 0 4px }
.small { font-size: 0.85rem; color: var(--muted) }
.shots { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px }
.shots button { border: 1px solid var(--line); background: var(--chip-bg); padding: 0; border-radius: 4px; cursor: zoom-in; flex: none; display: grid }
.shots img { height: 220px; width: auto; display: block; border-radius: 4px 4px 0 0 }
.shots span { font: 0.68rem var(--mono); color: var(--muted); padding: 2px 6px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left }
.empty { color: var(--muted); padding: 24px 0 }
.lb { position: fixed; inset: 0; background: rgba(5, 10, 12, 0.92); z-index: 50; display: none; grid-template-rows: auto 1fr; color: #e3ecec }
.lb.on { display: grid }
.lb .bar2 { display: flex; gap: 10px; align-items: center; padding: 10px 16px; font: 0.85rem var(--mono) }
.lb .bar2 button { font: 600 0.9rem var(--body); background: #2a3a3c; color: #fff; border: 0; border-radius: 6px; padding: 6px 12px; cursor: pointer }
.lb .bar2 .cap { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.lb .stage { display: grid; place-items: center; min-height: 0; padding: 0 16px 16px }
.lb img { max-width: 100%; max-height: calc(100vh - 72px); object-fit: contain }
@media (max-width: 760px) { .grid { grid-template-columns: 1fr } .shots img { height: 180px } .res { margin-left: 0 } }
</style>
</head>
<body>
<div class="wrap">
  <header style="display:grid;gap:12px">
    <div class="top"><div class="eyebrow" id="eyebrow"></div><div class="lang" role="group" aria-label="Language"><button type="button" data-l="en">English</button><button type="button" data-l="zh">中文</button></div></div>
    <h1 id="h"></h1>
    <div class="runs" id="runs" role="group" aria-label="Run"></div>
    <div class="meta" id="meta"></div>
    <div class="bar" id="bar"></div>
  </header>
  <div class="tools" id="tools">
    <span id="rchips" style="display:contents"></span>
    <select id="seg" aria-label="Segment"></select>
    <select id="disp" aria-label="Disposition"></select>
    <input type="search" id="q" autocomplete="off">
    <label class="only"><input type="checkbox" id="only"> <span id="onlyl"></span></label>
    <span class="count" id="count"></span>
  </div>
  <div class="list" id="list"></div>
</div>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Screenshot"><div class="bar2"><button type="button" id="lbprev">←</button><button type="button" id="lbnext">→</button><span class="cap" id="lbcap"></span><button type="button" id="lbclose">✕</button></div><div class="stage"><img id="lbimg" alt=""></div></div>
<script>
const D = __DATA__;
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Language: English or 中文 for what the page writes itself; the run's own text (actions, results) stays as recorded.
// Served by scripts/pages.ts the tab bar holds the switch; a static results.html keeps its own.
let L = 'en';
if (window.CASEBOOK) L = window.CASEBOOK.lang; else try { if (localStorage.getItem('casebook-lang') === 'zh') L = 'zh'; } catch (e) {}
const T = {
  en: { eyebrow: 'Casebook results', title: f => `${f} · Results`, run: 'Run', build: 'Build', cases: 'cases', recorded: 'Recorded', all: 'All',
    allSeg: 'All segments', allDisp: 'All dispositions', search: 'Search ID, section, action or result', only: 'With screenshots only',
    shown: (n, m) => `${n} of ${m}`, pre: 'Precondition', action: 'Action', expected: 'Expected result', actual: 'What happened', why: 'Blocked because',
    files: 'Other evidence', none: 'No case matches these filters.', noRuns: 'No run has recorded results yet (runs/*/results.csv).',
    review: 'cases', plan: 'progress', spec: 'coverage', report: 'report.md in the run folder', at: 'recorded', prio: 'priority', needs: 'needs', shot: 'screenshots' },
  zh: { eyebrow: '測試表執行結果', title: f => `${f} · 結果`, run: '執行', build: '版本', cases: '個案例', recorded: '記錄時間', all: '全部',
    allSeg: '全部段落', allDisp: '全部歸類', search: '搜尋 ID、區段、操作或結果', only: '只看有截圖的',
    shown: (n, m) => `${n} / ${m}`, pre: '前置條件', action: '操作', expected: '預期結果', actual: '實際情況', why: '受阻原因',
    files: '其他證據', none: '沒有符合篩選條件的案例。', noRuns: '還沒有任何執行記錄結果（runs/*/results.csv）。',
    review: '案例', plan: '進度', spec: '覆蓋率', report: '執行資料夾內的 report.md', at: '記錄於', prio: '優先度', needs: '需要', shot: '張截圖' },
};
const t = k => T[L][k] ?? T.en[k];
const RES = ['Fail', 'Blocked', 'Inconclusive', 'Pass', 'Not run'];
const RES_ZH = { Pass: '通過', Fail: '失敗', Blocked: '受阻', Inconclusive: '無法判定', 'Not run': '未執行' };
const resName = r => L === 'zh' ? RES_ZH[r] ?? r : r;
const COLOR = r => `var(--${({ Pass: 'pass', Fail: 'fail', Blocked: 'blocked', Inconclusive: 'inc' })[r] ?? 'notrun'})`;
const PAGES = window.CASEBOOK?.pages ?? {};
const fmt = s => s ? new Date(s).toLocaleString(L === 'zh' ? 'zh-TW' : undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
// eBug codes in a result (DRI261898P0001, DRI261893-0124) stand out so they can be searched in eCL
const bugs = s => esc(s).replace(/\b([A-Z]{3}\d{6}(?:P|-)\d{4})\b/g, '<span class="bug">$1</span>');

let run = D.runs[0], res = '', seg = '', disp = '', q = '', only = false, focus = '', shots = [], at = 0;

function header() {
  document.documentElement.lang = L === 'zh' ? 'zh-Hant' : 'en';
  $('eyebrow').textContent = t('eyebrow');
  $('h').textContent = t('title')(D.title);
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === L)));
  $('runs').innerHTML = D.runs.map((r, i) => `<button type="button" data-i="${i}" aria-pressed="${r === run}">${esc(r.phase || r.id)}<small>${esc(r.id)} · ${r.cases.length} ${t('cases')}</small></button>`).join('');
  $('runs').querySelectorAll('button').forEach(b => b.onclick = () => { run = D.runs[+b.dataset.i]; seg = disp = ''; render(); });
  if (!run) { $('meta').textContent = ''; $('bar').innerHTML = ''; return; }
  $('meta').innerHTML = [`<span>${t('run')} <b>${esc(run.id)}</b></span>`, run.build && `<span>${t('build')} <b>${esc(run.build)}</b></span>`,
    `<span>${t('recorded')} <b>${fmt(run.first)} – ${fmt(run.last)}</b></span>`, run.report && `<span>${t('report')}</span>`].filter(Boolean).join('');
  const n = run.cases.length || 1, c = tally(run.cases);
  $('bar').innerHTML = RES.filter(r => c[r]).map(r => `<span style="width:${c[r] / n * 100}%;background:${COLOR(r)}" title="${resName(r)} ${c[r]}"></span>`).join('');
}
const tally = cs => cs.reduce((m, c) => (m[c.result] = (m[c.result] ?? 0) + 1, m), {});
function tools() {
  const cs = run?.cases ?? [], c = tally(cs);
  $('rchips').innerHTML = `<button type="button" class="chip" data-r="" aria-pressed="${!res}">${t('all')} <span class="n">${cs.length}</span></button>`
    + RES.filter(r => c[r]).map(r => `<button type="button" class="chip" data-r="${r}" aria-pressed="${res === r}"><i style="background:${COLOR(r)}"></i>${resName(r)} <span class="n">${c[r]}</span></button>`).join('');
  $('rchips').querySelectorAll('button').forEach(b => b.onclick = () => { res = b.dataset.r; render(); });
  const segs = [...new Set(cs.map(c => c.seg).filter(Boolean))], disps = [...new Set(cs.map(c => c.disp).filter(Boolean))].sort();
  $('seg').innerHTML = `<option value="">${t('allSeg')}</option>` + segs.map(s => `<option${s === seg ? ' selected' : ''}>${esc(s)}</option>`).join('');
  $('disp').innerHTML = `<option value="">${t('allDisp')}</option>` + disps.map(s => `<option${s === disp ? ' selected' : ''}>${esc(s)}</option>`).join('');
  $('q').placeholder = t('search'); $('onlyl').textContent = t('only');
}
const match = c => (!res || c.result === res) && (!seg || c.seg === seg) && (!disp || c.disp === disp) && (!only || c.shots.length)
  && (!q || [c.id, c.section, c.action, c.expected, c.actual, c.why, c.disp].join(' ').toLowerCase().includes(q));
function card(c) {
  const links = [PAGES.review && `<a href="${esc(PAGES.review)}#${encodeURIComponent(c.id)}">${t('review')} →</a>`,
    PAGES.plan && `<a href="${esc(PAGES.plan)}#case=${encodeURIComponent(c.id)}">${t('plan')} →</a>`,
    PAGES.coverage && `<a href="${esc(PAGES.coverage)}#case=${encodeURIComponent(c.id)}">${t('spec')} →</a>`].filter(Boolean).join('');
  return `<article class="case ${esc(c.result.replace(' ', ''))}${c.id === focus ? ' focus' : ''}" id="c-${esc(c.id)}">
  <div class="head"><span class="cid">${esc(c.id)}</span><span class="sec">${esc(c.section)}</span>${c.prio ? `<span class="disp">${t('prio')} ${esc(c.prio)}</span>` : ''}${c.needs ? `<span class="disp">${t('needs')} ${esc(c.needs)}</span>` : ''}
    <span class="res ${esc(c.result.replace(' ', ''))}">${esc(resName(c.result))}</span>${c.disp ? `<span class="disp">${esc(c.disp)}</span>` : ''}</div>
  <div class="grid">
    <div>${c.pre ? `<h4>${t('pre')}</h4><p class="small">${esc(c.pre)}</p>` : ''}<h4>${t('action')}</h4><p>${esc(c.action)}</p></div>
    <div><h4>${t('expected')}</h4><p>${esc(c.expected)}</p></div>
    <div class="found ${esc(c.result.replace(' ', ''))}"><h4>${t('actual')}</h4><p>${bugs(c.actual) || '—'}</p>${c.why ? `<div class="why"><b>${t('why')}:</b> ${esc(c.why)}${c.group ? ` <span class="disp">${esc(c.group)}</span>` : ''}</div>` : ''}${c.files.length ? `<div class="small" style="margin-top:6px">${t('files')}: ${c.files.map(esc).join(' ')}</div>` : ''}</div>
  </div>
  ${c.shots.length ? `<div class="shots">${c.shots.map((s, i) => `<button type="button" data-c="${esc(c.id)}" data-i="${i}" title="${esc(s.name)}"><img loading="lazy" src="${esc(s.src)}" alt="${esc(c.id)} ${esc(s.name)}"><span>${esc(s.name)}</span></button>`).join('')}</div>` : ''}
  <div class="xl">${links}<span class="disp" style="margin-left:auto">${esc(c.seg)} · ${t('at')} ${fmt(c.at)}</span></div>
</article>`;
}
function list() {
  if (!run) { $('list').innerHTML = `<p class="empty">${t('noRuns')}</p>`; $('count').textContent = ''; return; }
  const cs = run.cases.filter(match);
  $('count').textContent = t('shown')(cs.length, run.cases.length);
  let html = '', last = null;
  for (const c of cs) { if (c.seg !== last) { html += `<h3 class="seg-h">${esc(c.seg || '—')}</h3>`; last = c.seg; } html += card(c); }
  $('list').innerHTML = html || `<p class="empty">${t('none')}</p>`;
  $('list').querySelectorAll('.shots button').forEach(b => b.onclick = () => open(run.cases.find(c => c.id === b.dataset.c).shots, +b.dataset.i, b.dataset.c));
}
function render() { header(); tools(); list(); }
// screenshot viewer: arrows step through the case's screenshots, Esc closes
let cap = '';
function open(list, i, id) { shots = list; at = i; cap = id; $('lb').classList.add('on'); showShot(); $('lbclose').focus(); }
function showShot() { const s = shots[at]; $('lbimg').src = s.src; $('lbimg').alt = s.name; $('lbcap').textContent = `${cap} · ${s.name} (${at + 1}/${shots.length})`; }
const step = d => { if (!shots.length) return; at = (at + d + shots.length) % shots.length; showShot(); };
const close = () => $('lb').classList.remove('on');
$('lbprev').onclick = () => step(-1); $('lbnext').onclick = () => step(1); $('lbclose').onclick = close;
$('lb').onclick = e => { if (e.target === $('lb') || e.target.classList.contains('stage')) close(); };
addEventListener('keydown', e => { if (!$('lb').classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
$('seg').onchange = e => { seg = e.target.value; list(); };
$('disp').onchange = e => { disp = e.target.value; list(); };
$('q').oninput = e => { q = e.target.value.trim().toLowerCase(); list(); };
$('only').onchange = e => { only = e.target.checked; list(); };
// #case=TC-012 (a link from the other pages): the newest run that recorded the case, filters cleared, scrolled to it
function showCase() {
  const m = location.hash.match(/^#case=(.+)$/); if (!m) return;
  focus = decodeURIComponent(m[1]);
  const r = D.runs.find(r => r.cases.some(c => c.id === focus)); if (!r) return;
  run = r; res = seg = disp = q = ''; only = false; $('q').value = ''; $('only').checked = false;
  render(); document.getElementById(`c-${focus}`)?.scrollIntoView({ block: 'start' });
}
const setLang = l => { L = l; try { localStorage.setItem('casebook-lang', l); } catch (e) {} render(); };
document.querySelectorAll('.lang button').forEach(b => b.onclick = () => setLang(b.dataset.l));
if (window.CASEBOOK) { document.querySelector('.lang')?.remove(); addEventListener('casebook-lang', e => { L = e.detail; render(); }); }
addEventListener('hashchange', showCase);
render(); showCase();
</script>
</body>
</html>

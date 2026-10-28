<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&display=swap">
<style>
/* Layout: proof sheet — counts strip, then the Figma board with every control and arrow marked, a detail panel with the
   rows and tap screenshots, and the gap list underneath. Same palette as the run plan page. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73;
  --proof: #2f7d4f; --ran: #3f9a94; --fail: #b8402f; --blocked: #a86b12; --notrun: #5458c4; --none: #c2332a; --na: #b13f9c;
  --chip-bg: #eef2f2; --canvas: #20292b;
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
.stage { position: relative; background: var(--canvas); border-radius: 10px; overflow: hidden; height: 76vh; border: 1px solid var(--line) }
.stage svg { width: 100%; height: 100%; display: block; cursor: grab; touch-action: none }
.stage svg.drag { cursor: grabbing }
.tools { position: absolute; right: 10px; top: 10px; display: flex; gap: 6px }
.tools button { font: 600 0.85rem var(--body); border: 1px solid var(--line); background: var(--panel); color: var(--ink); border-radius: 7px; padding: 4px 10px; cursor: pointer }
.noimg { position: absolute; left: 12px; bottom: 10px; color: #cfd8d9; font-size: 0.85rem; background: #0009; padding: 4px 8px; border-radius: 6px }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px; max-height: 76vh; overflow: auto }
.panel .empty { color: var(--muted) }
.pill { display: inline-block; border-radius: 999px; padding: 1px 9px; font-size: 0.78rem; font-weight: 600; color: #fff }
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
tbody tr { cursor: pointer } tbody tr:hover { background: var(--chip-bg) }
@media (max-width: 1100px) { .main { grid-template-columns: 1fr } .boards { display: flex; overflow-x: auto; max-height: none } .stage { height: 62vh } .panel { max-height: none } }
</style>
</head>
<body>
<header>
  <h1 id="h"></h1>
  <div class="sub" id="sub"></div>
</header>
<p class="verdict" id="verdict"></p>
<section class="strip" id="strip"></section>
<div class="legend" id="legend"></div>
<div class="main">
  <nav class="boards" id="boards" aria-label="Boards"></nav>
  <div class="stage" id="stage">
    <svg id="svg" xmlns="http://www.w3.org/2000/svg"></svg>
    <div class="tools"><button id="zin" aria-label="Zoom in">+</button><button id="zout" aria-label="Zoom out">−</button><button id="fit">Fit</button></div>
    <div class="noimg" id="noimg" hidden>No board image: run with --render (draws it from the Design PDF)</div>
  </div>
  <aside class="panel" id="panel"><p class="empty">Click a box or an arrow on the board to see the rows that press it, their latest results and the tap screenshots that prove it.</p></aside>
</div>
<section class="gaps">
  <h2>Not pressed on the device yet</h2>
  <p class="sub" style="margin:-4px 0 10px">Each item here has its rows in the table. <b>Planned, not run yet</b>: no device run has used those rows (new rows run in the next round). <b>Blocked on device</b>: the rows ran but could not reach the control; the reason comes from the run. <b>No row (missing)</b> would be a real gap: a control or arrow no row covers.</p>
  <div class="reasons" id="reasons"></div>
  <div class="filters">
    <select id="gstat" aria-label="Status"><option value="">All</option><option value="notrun">Planned, not run yet</option><option value="blocked">Blocked on device</option><option value="none">No row (missing)</option><option value="undismissed">Input not dismissed</option></select>
    <select id="gboard" aria-label="Board"><option value="">All boards</option></select>
    <input id="gq" placeholder="Filter by name or label" aria-label="Filter">
  </div>
  <table><thead><tr><th>What</th><th>Board</th><th>Name / edge</th><th>Status</th><th>Why</th><th>Rows</th></tr></thead><tbody id="gtb"></tbody></table>
</section>
<section class="gaps" id="um-sec">
  <h2>Taps that matched no control</h2>
  <p class="sub" style="margin:-4px 0 10px">A press the matcher could not tie to a Figma control (score under 0.6). If it did press one, add the element's id or label to that entry's <span class="mono">app</span> list in control-trace.json; if it pressed something the Design does not draw, it is a spec question.</p>
  <table><thead><tr><th>Run · case</th><th>Element tapped</th><th>Best guess</th><th>Screen</th></tr></thead><tbody id="umtb"></tbody></table>
</section>
<script>
const D = __DATA__;
const ST = { proof: 'Pressed (tap proof)', ran: 'Pressed (row ran)', blocked: 'Blocked on device', notrun: 'Planned, not run yet', none: 'No row (missing)', na: 'Excluded' };
const COLOR = s => `var(--${s})`;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = id => document.getElementById(id);
const show = new Set(['proof', 'ran', 'blocked', 'notrun', 'none', 'na']);
let board = null, sel = null, vb = null;

$('h').textContent = `${D.title} · ${D.platform === 'ios' ? 'iOS' : 'Android'} coverage`;
$('sub').innerHTML = `Table v${D.version} · ${esc(D.spec_folder)} · ${D.runs.length ? `runs: ${D.runs.map(esc).join(', ')}` : 'no runs yet'} · ${D.taps} logged taps · built ${new Date(D.built_at).toLocaleString()}`;

const cnt = (xs, f) => xs.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
function stat(k, done, total, parts, note) {
  const bar = parts.map(([s, n]) => `<span style="width:${total ? n / total * 100 : 0}%;background:${COLOR(s)}"></span>`).join('');
  return `<div class="stat"><div class="k">${k}</div><div class="v">${done}<small> / ${total}</small></div><div class="bar">${bar}</div><div class="d">${note}</div></div>`;
}
const split = (c, unit) => ['proof', 'ran', 'blocked', 'notrun', 'none'].filter(s => c[s]).map(s =>
  `<span style="white-space:nowrap"><span class="sw" style="color:${COLOR(s)};width:9px;height:9px;border-width:2px;vertical-align:-1px"></span> ${c[s]} ${ST[s].toLowerCase()}</span>`).join(' · ');
function strip() {
  const req = D.groups.filter(g => g.status !== 'na'), c = cnt(req, g => g.status);
  const inputs = D.groups.filter(g => g.kind === 'input' && g.status !== 'na'), dis = inputs.filter(g => g.dismissed).length;
  const a = cnt(D.arrows, x => x.status);
  const order = ['proof', 'ran', 'blocked', 'notrun', 'none'];
  const left = (c.blocked || 0) + (c.notrun || 0) + (a.blocked || 0) + (a.notrun || 0), missing = (c.none || 0) + (a.none || 0);
  $('verdict').innerHTML = missing
    ? `<b>${missing} missing:</b> ${c.none || 0} controls and ${a.none || 0} arrows have no row yet (listed below as 「No row (missing)」).`
    : `<b>Nothing is missing:</b> every control and flow arrow has a row in the table.` + (left ? ` ${(c.notrun || 0) + (a.notrun || 0)} are <b>planned</b> (their rows are in the table but no device run has used them yet) and ${(c.blocked || 0) + (a.blocked || 0)} are <b>blocked on the device</b> (their rows ran but could not reach them; reasons below).` : '');
  $('strip').innerHTML =
    stat('Controls pressed', (c.proof || 0) + (c.ran || 0), req.length, order.map(s => [s, c[s] || 0]), `${split(c)}${c.none ? '' : ' · 0 missing'} · ${D.groups.length - req.length} excluded (another feature's control, decorative or a duplicate). Counted once per button or choice list (${D.groups.reduce((n, g) => n + g.instances, 0)} copies on the boards)`) +
    stat('Inputs dismissed', dis, inputs.length, [['proof', dis]], D.taps ? 'keyboard hidden, Done or return after the input was used' : 'by the dismissing rows that ran (no tap log yet)') +
    stat('Flow arrows walked', (a.proof || 0) + (a.ran || 0), D.arrows.length, order.map(s => [s, a[s] || 0]), `${split(a)}${a.none ? '' : ' · 0 missing'}`) +
    stat('Taps matched', D.taps - D.unmatched.length, D.taps, [['proof', D.taps - D.unmatched.length], ['none', D.unmatched.length]], `${D.unmatched.length} matched no control (listed below) · ${D.groups.reduce((n, g) => n + g.proof.filter(p => p.ambiguous).length, 0)} ambiguous`) +
    stat('Failed while pressing', D.groups.filter(g => g.fail).length, req.length, [['fail', D.groups.filter(g => g.fail).length]], 'controls whose pressing row failed (red corner)');
}
function legend() {
  $('legend').innerHTML = Object.entries(ST).map(([s, t]) => `<span class="chip" role="button" tabindex="0" aria-pressed="${show.has(s)}" data-s="${s}"><span class="sw" style="color:${COLOR(s)}${s === 'na' ? ';border-style:dotted' : s === 'none' ? ';border-style:dashed' : ''}"></span>${t}</span>`).join('')
    + `<span class="chip" aria-pressed="true" style="cursor:default"><span class="sw" style="color:var(--fail);border-radius:50%"></span>pressing row failed</span>`;
  for (const el of document.querySelectorAll('#legend [data-s]')) el.onclick = el.onkeydown = e => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    const s = el.dataset.s; show.has(s) ? show.delete(s) : show.add(s); el.setAttribute('aria-pressed', show.has(s)); draw();
  };
}
// one bar segment per state, in the order of the legend, so a board's controls read the same way as the totals
const segs = (items, total) => ['proof', 'ran', 'blocked', 'notrun', 'none', 'na'].map(st => { const n = items.filter(x => x.status === st).length;
  return n ? `<span title="${n} ${ST[st].toLowerCase()}" style="width:${n / total * 100}%;background:${COLOR(st)}"></span>` : ''; }).join('');
function boardsNav() {
  $('boards').innerHTML = D.boards.map((b, i) => {
    // a control shared by several boards counts on each of them here (the totals above count it once)
    const all = D.groups.filter(g => (g.boards || [g.board]).includes(b.name)), gs = all.filter(g => g.status !== 'na');
    const done = gs.filter(g => g.status === 'proof' || g.status === 'ran').length;
    const as = D.arrows.filter(a => a.board === b.name), aw = as.filter(a => a.status === 'proof' || a.status === 'ran').length;
    // two labelled rows on every board: controls, then flow arrows (「none drawn」 when the board has no arrows)
    return `<button data-i="${i}" aria-current="${board === b}"><span class="n">${esc(b.name)}</span>
      <span class="brow"><span class="c">Controls ${done}/${gs.length}</span><span class="bar" style="margin:0">${all.length ? segs(all, all.length) : ''}</span></span>
      <span class="brow"><span class="c">Arrows ${as.length ? `${aw}/${as.length}` : '—'}</span>${as.length ? `<span class="bar" style="margin:0">${segs(as, as.length)}</span>` : '<span class="c none">none drawn on this board</span>'}</span></button>`;
  }).join('');
  for (const el of document.querySelectorAll('#boards button')) el.onclick = () => openBoard(D.boards[+el.dataset.i]);
  const opts = D.boards.map(b => `<option>${esc(b.name)}</option>`).join('');
  if ($('gboard').options.length === 1) $('gboard').insertAdjacentHTML('beforeend', opts);
}
function openBoard(b, focus) {
  board = b; const [x, y, w, h] = b.box; vb = [x - 40, y - 40, w + 80, h + 80];
  if (focus) vb = [focus[0] - 300, focus[1] - 300, focus[2] + 600, focus[3] + 600];
  $('noimg').hidden = !!b.img; if (!b.img) $('noimg').textContent = b.note || 'No board image: run with --render (draws it from the Design PDF)'; boardsNav(); draw();
}
function draw() {
  const svg = $('svg'); if (!board) return;
  svg.setAttribute('viewBox', vb.join(' '));
  const [bx, by, bw, bh] = board.box;
  const k = vb[2] / svg.clientWidth; // canvas units per screen pixel, so strokes stay readable at any zoom
  let s = `<defs>${['proof', 'ran', 'blocked', 'notrun', 'none'].map(st => `<marker id="m-${st}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${COLOR(st)}"/></marker>`).join('')}</defs>`;
  s += board.img ? `<image href="${esc(board.img)}" x="${bx}" y="${by}" width="${bw}" height="${bh}" preserveAspectRatio="none"/>` : `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#2b3537"/>`;
  for (const sc of D.screens.filter(sc => sc.board === board.name)) {
    s += `<rect x="${sc.box[0]}" y="${sc.box[1]}" width="${sc.box[2]}" height="${sc.box[3]}" fill="${sc.other ? '#000a' : 'none'}" stroke="#fff3" stroke-width="${k}"><title>${esc(sc.name)}${sc.other ? ' (other platform)' : ''}</title></rect>`;
  }
  for (const g of D.groups) {
    if (!(g.boards || [g.board]).includes(board.name) || !show.has(g.status)) continue;
    const on = sel && sel.group === g.group, sw = (on ? 3.5 : 1.6) * k;
    // every copy that lies on this board (a shared control, e.g. the back button, has copies on many boards)
    for (const [x, y, w, h] of g.rects.filter(([x, y]) => x >= bx && x <= bx + bw && y >= by && y <= by + bh)) {
      const fill = g.status === 'proof' ? COLOR('proof') : g.status === 'ran' ? COLOR('ran') : 'none';
      s += `<rect class="g" data-g="${g.group}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${2 * k}" fill="${fill}" fill-opacity="${g.status === 'proof' ? 0.3 : 0.18}" stroke="${on ? 'var(--accent)' : COLOR(g.status)}" stroke-width="${sw}" ${g.status === 'none' ? `stroke-dasharray="${4 * k} ${3 * k}"` : g.status === 'na' ? `stroke-dasharray="${1.5 * k} ${2.5 * k}" stroke-opacity="0.8"` : ''}><title>${esc(g.label || g.name)} — ${ST[g.status]}</title></rect>`;
      if (g.fail) s += `<circle cx="${x + w}" cy="${y}" r="${4 * k}" fill="var(--fail)" pointer-events="none"/>`;
    }
  }
  for (const a of D.arrows) {
    if (a.board !== board.name || !show.has(a.status)) continue;
    const on = sel && sel.arrow === a.id, p = [];
    for (let i = 0; i < a.points.length; i += 2) p.push(`${a.points[i]},${a.points[i + 1]}`);
    s += `<polyline class="a" data-a="${a.id}" points="${p.join(' ')}" fill="none" stroke="${on ? 'var(--accent)' : COLOR(a.status)}" stroke-width="${(on ? 5 : 3) * k}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#m-${a.status})" ${a.status === 'none' ? `stroke-dasharray="${6 * k} ${4 * k}"` : ''}><title>${esc(a.edge)} — ${ST[a.status]}</title></polyline>`;
    s += `<polyline class="a" data-a="${a.id}" points="${p.join(' ')}" fill="none" stroke="transparent" stroke-width="${14 * k}"/>`;
  }
  svg.innerHTML = s;
}
const rowHtml = id => { const r = D.rows[id] || { result: 'Not run' };
  return `<div class="row"><span class="id">${esc(id)}</span><span class="res ${esc(r.result)}">${esc(r.result === 'Not run' ? 'Planned, not run yet' : r.result)}</span>${r.reason ? ` <span style="color:var(--blocked);font-size:.8rem">${esc(r.reason)}</span>` : ''}${r.run ? ` <span class="mono" style="color:var(--muted)">${esc(r.run)}</span>` : ''}<div>${esc(r.action || '')}</div>${r.actual ? `<div style="color:var(--muted);font-size:.82rem">${esc(r.actual)}</div>` : ''}</div>`; };
function select(kind, id) {
  sel = kind === 'g' ? { group: id } : { arrow: id }; draw();
  const p = $('panel');
  if (kind === 'g') {
    const g = D.groups.find(x => x.group === id);
    const link = g.node && !g.node.startsWith('I') ? `<a href="${D.figma[g.file]}${g.node.replace(':', '-')}" target="_blank" rel="noopener">Open in Figma</a>` : '';
    p.innerHTML = `<h2>${esc(g.label || g.name)}</h2><span class="pill" style="background:${COLOR(g.status)}">${ST[g.status]}</span>${g.fail ? ' <span class="pill" style="background:var(--fail)">row failed</span>' : ''}${g.norow ? ' <span class="pill" style="background:var(--blocked)">pressed, but no row names it</span>' : ''}
      <dl><dt>Layer</dt><dd class="mono">${esc(g.name)}</dd><dt>Kind</dt><dd>${esc(g.kind)}${g.kind === 'item' ? ' (one press covers the list)' : ''}</dd><dt>Board</dt><dd>${esc(g.board)}</dd>
      <dt>Counted as</dt><dd>${g.set ? 'one choice list (any choice covers it)' : 'one button'} · ${g.instances} cop${g.instances === 1 ? 'y' : 'ies'} on ${g.boards.length} board${g.boards.length === 1 ? '' : 's'}</dd>
      ${g.boards.length > 1 ? `<dt>Boards</dt><dd>${g.boards.map(esc).join(', ')}</dd>` : ''}${g.app.length ? `<dt>App ids</dt><dd class="mono">${g.app.map(esc).join(', ')}</dd>` : ''}
      <dt>Group</dt><dd class="mono">${esc(g.group)}</dd>${g.how ? `<dt>Traced by</dt><dd>${g.how === 'arrow' ? 'its flow arrow’s requirement' : g.how === 'label' ? 'rows quoting its label' : esc(g.how)}</dd>` : ''}
      ${g.kind === 'input' ? `<dt>Dismissed</dt><dd>${g.dismissed ? 'yes' : 'not yet'}</dd>` : ''}${g.na ? `<dt>Excluded</dt><dd>${esc(g.na.replace(/^n\/a:\s*/, ''))}</dd>` : ''}</dl>${link}
      <h2 style="margin-top:14px">Tap proof</h2>${g.proof.length ? `<div class="proof">${g.proof.map(t => { const [ww, wh] = (t.win || '1x1').split('x').map(Number);
        return `<figure class="shot" style="margin:0">${t.shot ? `<a href="${esc(t.shot)}" target="_blank"><img src="${esc(t.shot)}" alt="Screen before the tap"></a><i style="left:${t.x / ww * 100}%;top:${t.y / wh * 100}%"></i>` : ''}<figcaption>${esc(t.case)} · ${esc(t.run)}<br>${esc(t.el)}<br><b>${t.score}</b> ${esc((t.why || []).join(' · '))}${t.outside_rows ? '<br>outside its rows' : ''}${t.ambiguous ? `<br>⚠ close to ${esc(t.ambiguous)}` : ''}</figcaption></figure>`; }).join('')}</div>${g.taps > g.proof.length ? `<p class="empty">${g.taps} taps in all; the 6 best shown.</p>` : ''}`
        : `<p class="empty">${g.status === 'ran' ? 'The row ran before the tap log existed, or its taps did not land on this control.' : 'No tap logged yet.'}</p>`}
      <h2 style="margin-top:14px">Pressing rows</h2>${g.press.length ? g.press.map(rowHtml).join('') : '<p class="empty">None: the analysis must add a row that presses it (or exclude it with the reason).</p>'}
      ${g.kind === 'input' ? `<h2 style="margin-top:14px">Dismissing rows</h2>${g.dismiss.length ? g.dismiss.map(rowHtml).join('') : '<p class="empty">None yet.</p>'}` : ''}`;
  } else {
    const a = D.arrows.find(x => x.id === id);
    p.innerHTML = `<h2>${esc(a.edge)}</h2><span class="pill" style="background:${COLOR(a.status)}">${ST[a.status]}</span>${a.fail ? ' <span class="pill" style="background:var(--fail)">row failed</span>' : ''}
      <dl><dt>Arrow</dt><dd class="mono">${esc(a.id)}</dd><dt>Kind</dt><dd>${a.kind === 'auto' ? 'automatic transition' : 'tap'}</dd><dt>Requirement</dt><dd>${esc(a.req || 'none yet')}</dd></dl>
      <a href="${Object.values(D.figma)[0]}${a.id.replace(/-[A-Z]+$/, '')}" target="_blank" rel="noopener">Open in Figma</a>
      ${a.src ? `<p><a href="#" id="srcl">Source control →</a></p>` : ''}<h2 style="margin-top:14px">Rows</h2>${a.rows.length ? a.rows.map(rowHtml).join('') : '<p class="empty">No requirement or row walks this arrow yet.</p>'}`;
    if (a.src) $('srcl').onclick = e => { e.preventDefault(); select('g', a.src); };
  }
}
// zoom and pan by changing the viewBox
const svg = $('svg');
function zoom(f, cx, cy) {
  const r = svg.getBoundingClientRect(), px = cx === undefined ? 0.5 : (cx - r.left) / r.width, py = cy === undefined ? 0.5 : (cy - r.top) / r.height;
  const [x, y, w, h] = vb, nw = w * f, nh = h * f; vb = [x + (w - nw) * px, y + (h - nh) * py, nw, nh]; draw();
}
svg.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
let drag = null;
svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vb: [...vb], moved: false }; svg.setPointerCapture(e.pointerId); });
svg.addEventListener('pointermove', e => { if (!drag) return; const r = svg.getBoundingClientRect(), k = Math.max(vb[2] / r.width, vb[3] / r.height);
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; svg.classList.add('drag'); }
  if (drag.moved) { vb = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, vb[2], vb[3]]; svg.setAttribute('viewBox', vb.join(' ')); } });
svg.addEventListener('pointerup', e => { const was = drag?.moved; drag = null; svg.classList.remove('drag'); if (was) { draw(); return; }
  const t = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.dataset?.g || el.dataset?.a);
  if (t) select(t.dataset.g ? 'g' : 'a', t.dataset.g || t.dataset.a); });
$('zin').onclick = () => zoom(1 / 1.4); $('zout').onclick = () => zoom(1.4); $('fit').onclick = () => openBoard(board);
addEventListener('resize', () => draw());

// why an item is not pressed yet: the run's reason for a blocked row, or that its rows have not run
const why = (status, rows) => status === 'blocked' ? [...new Set(rows.map(id => D.rows[id]?.reason).filter(Boolean))].join('; ') || 'Blocked'
  : status === 'notrun' ? 'Rows in the table; not run on the device yet' : status === 'none' ? 'No row covers it' : 'No dismissing row ran';
function gaps() {
  const st = $('gstat').value, bd = $('gboard').value, q = $('gq').value.toLowerCase();
  const all = [
    ...D.groups.filter(g => ['none', 'notrun', 'blocked'].includes(g.status) || (g.kind === 'input' && !g.dismissed && g.status !== 'na'))
      .map(g => { const status = g.kind === 'input' && !['none', 'notrun', 'blocked'].includes(g.status) ? 'undismissed' : g.status;
        return { t: 'g', id: g.group, what: g.kind, board: g.board, name: `${g.name}${g.label ? ` 「${g.label}」` : ''}`, status, why: why(status, g.press), rows: g.press.join(', '), r: g.rects[0] }; }),
    ...D.arrows.filter(a => ['none', 'notrun', 'blocked'].includes(a.status)).map(a => ({ t: 'a', id: a.id, what: 'arrow', board: a.board, name: a.edge, status: a.status, why: why(a.status, a.rows), rows: a.rows.join(', '), r: [a.points[0], a.points[1], 1, 1] })),
  ];
  const order = { none: 0, blocked: 1, notrun: 2, undismissed: 3 };
  all.sort((x, y) => order[x.status] - order[y.status] || x.why.localeCompare(y.why) || x.board.localeCompare(y.board));
  // one chip per cause, so the reasons read at a glance; a chip filters the list
  const causes = cnt(all, x => x.status === 'blocked' ? x.why : ST[x.status] || 'Input not dismissed');
  $('reasons').innerHTML = Object.entries(causes).sort((a, b) => b[1] - a[1]).map(([w, n]) =>
    `<span class="chip" role="button" tabindex="0" data-w="${esc(w)}"><b>${n}</b> ${esc(w)}</span>`).join('');
  for (const el of document.querySelectorAll('#reasons [data-w]')) el.onclick = () => { $('gq').value = ''; $('gstat').value = ''; reasonFilter = reasonFilter === el.dataset.w ? '' : el.dataset.w; gaps(); };
  const items = all.filter(x => (!st || x.status === st) && (!bd || x.board === bd) && (!q || x.name.toLowerCase().includes(q))
    && (!reasonFilter || (x.status === 'blocked' ? x.why : ST[x.status] || 'Input not dismissed') === reasonFilter));
  for (const el of document.querySelectorAll('#reasons [data-w]')) el.setAttribute('aria-pressed', String(!reasonFilter || el.dataset.w === reasonFilter));
  const label = s => s === 'undismissed' ? 'Input not dismissed' : ST[s];
  $('gtb').innerHTML = items.slice(0, 600).map((x, i) => `<tr data-i="${i}"><td>${esc(x.what)}</td><td>${esc(x.board)}</td><td>${esc(x.name)}</td><td><span class="pill" style="background:${COLOR(x.status === 'undismissed' ? 'blocked' : x.status)}">${label(x.status)}</span></td><td>${esc(x.why)}</td><td class="mono">${esc(x.rows)}</td></tr>`).join('')
    || '<tr><td colspan="6" style="color:var(--muted)">Nothing left in this filter.</td></tr>';
  for (const tr of document.querySelectorAll('#gtb tr[data-i]')) tr.onclick = () => { const x = items[+tr.dataset.i]; openBoard(D.boards.find(b => b.name === x.board), x.r); select(x.t, x.id); $('stage').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
}
let reasonFilter = '';
for (const id of ['gstat', 'gboard', 'gq']) $(id).addEventListener('input', gaps);
function unmatchedList() {
  $('umtb').innerHTML = D.unmatched.slice(0, 400).map((u, i) => `<tr data-i="${i}"><td class="mono">${esc(u.run)}<br>${esc(u.case || '?')}</td><td>${esc(u.el || `point ${u.x},${u.y}`)}</td>
    <td>${u.best ? `${esc(u.best)} <span class="mono">(${u.best_score})</span>` : '—'}</td><td>${u.shot ? `<a href="${esc(u.shot)}" target="_blank">screenshot</a>` : ''}</td></tr>`).join('')
    || '<tr><td colspan="4" style="color:var(--muted)">Every logged tap matched a control.</td></tr>';
  for (const tr of document.querySelectorAll('#umtb tr[data-i]')) tr.onclick = e => { if (e.target.closest('a')) return; const u = D.unmatched[+tr.dataset.i]; const g = D.groups.find(x => x.group === u.best_group);
    if (g) { openBoard(D.boards.find(b => b.name === g.board), g.rects[0]); select('g', g.group); $('stage').scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
}
strip(); legend(); unmatchedList(); boardsNav(); openBoard(D.boards.find(b => b.img) || D.boards[0]); gaps();
</script>
</body>
</html>

<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--fg:#1b1f24;--muted:#5b6470;--line:#d9dde3;--ok:#17803d;--fail:#c62828;--hold:#5b6470;--accent:#1a5fd0;--pre:#f0f2f5}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121417;--card:#1b1e23;--fg:#e6e8eb;--muted:#9aa3ad;--line:#2e333a;--ok:#4cc27a;--fail:#ff6b6b;--hold:#9aa3ad;--accent:#6ea2ff;--pre:#23272d}}
:root[data-theme="dark"]{--bg:#121417;--card:#1b1e23;--fg:#e6e8eb;--muted:#9aa3ad;--line:#2e333a;--ok:#4cc27a;--fail:#ff6b6b;--nv:#e0b84a;--hold:#9aa3ad;--accent:#6ea2ff;--pre:#23272d}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:1100px;margin:0 auto;padding:16px}
h1{font-size:20px;margin:0 0 4px}h2{font-size:16px;margin:0}
.muted{color:var(--muted)}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin:12px 0}
.errors{border-color:var(--fail)}.errors li{color:var(--fail)}
dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:0}dt{color:var(--muted)}dd{margin:0;word-break:break-word}
pre{white-space:pre-wrap;word-break:break-word;background:var(--pre);padding:10px;border-radius:8px;margin:8px 0;font:13px/1.45 ui-monospace,Menlo,monospace}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);padding:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid var(--line)}
.pill{padding:2px 8px;border-radius:99px;font-size:13px;font-weight:600;border:1px solid currentColor}
.OK{color:var(--ok)}.Fail{color:var(--fail)}.Hold{color:var(--hold)}
.row-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
select,button,textarea{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:8px;padding:6px 10px}
button{cursor:pointer}button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
textarea{width:100%;min-height:90px;font:13px/1.45 ui-monospace,Menlo,monospace;resize:vertical}
.edited{border-color:var(--accent)}
.imgs{display:flex;gap:8px;overflow-x:auto;padding:4px 0}
.imgs figure{margin:0;flex:0 0 auto}.imgs img{height:260px;border:1px solid var(--line);border-radius:6px;cursor:zoom-in}
.imgs figcaption{font-size:12px;color:var(--muted);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#zoom{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:5;cursor:zoom-out}
#zoom img{max-width:96vw;max-height:96vh}
label.note{display:block;margin-top:8px}
@media (max-width:600px){dl{grid-template-columns:1fr}.imgs img{height:200px}}
</style>
</head>
<body>
<main>
<h1 id="h"></h1>
<p class="muted">Review before anything goes on ECL. Change a verdict or edit a Reason here, then press <b>Copy decisions</b> and paste them back in chat. Hold keeps a bug off the report and leaves it alone on the TR (for anything not fully verified).</p>
<div id="errors"></div>
<div class="bar"><span id="counts"></span><span style="flex:1"></span><button id="copy" class="primary">Copy decisions</button><button id="reset">Reset edits</button></div>
<section class="card"><h2>Report fields</h2><dl id="fields"></dl><pre id="details"></pre></section>
<div id="rows"></div>
</main>
<div id="zoom"><img alt=""></div>
<script>
const D = /*__DATA__*/null;
const KEY = 'qr-review:' + D.tr + ':' + D.build;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };
const $ = s => document.querySelector(s);
const el = (t, a = {}, ...c) => { const n = document.createElement(t); for (const k in a) k === 'class' ? n.className = a[k] : n.setAttribute(k, a[k]); n.append(...c); return n; };
$('#h').textContent = D.tr + ' · QA Report draft · ' + D.build;
if (D.errors.length) $('#errors').append(el('div', { class: 'card errors' }, el('b', {}, 'Check found problems'), el('ul', {}, ...D.errors.map(e => el('li', {}, e)))));
for (const [k, v] of [['Template', D.template], ['Tester', D.tester], ['Short Description', D.shortDescription], ['Test Result', D.testResult],
  ['Evidence ZIP', D.evidence ? D.evidence.file + ' (' + D.evidence.files + ' files)' : 'not packed yet']]) $('#fields').append(el('dt', {}, k), el('dd', {}, v));
$('#details').textContent = D.details;
const state = r => saved[r.bug] || {};
function counts() {
  const c = { OK: 0, Fail: 0, Hold: 0 };
  for (const r of D.rows) c[state(r).result || r.result]++;
  $('#counts').replaceChildren(...Object.entries(c).map(([k, v]) => el('span', { class: 'pill ' + k }, k + ' ' + v)));
}
for (const r of D.rows) {
  const s = state(r);
  const sel = el('select', { 'aria-label': 'Verdict for ' + r.bug }, ...['OK', 'Fail', 'Hold'].map(v => { const o = el('option', { value: v }, v); if ((s.result || r.result) === v) o.selected = true; return o; }));
  const ta = el('textarea', { 'aria-label': 'Reason for ' + r.bug });
  ta.value = s.reason ?? r.reason;
  const mark = () => ta.classList.toggle('edited', ta.value !== r.reason || sel.value !== r.result);
  sel.onchange = () => { saved[r.bug] = { ...state(r), result: sel.value }; store(); counts(); mark(); };
  ta.oninput = () => { saved[r.bug] = { ...state(r), reason: ta.value }; store(); mark(); };
  const note = el('textarea', { 'aria-label': 'Reviewer note for ' + r.bug, placeholder: 'Reviewer note (optional)', style: 'min-height:40px' });
  note.value = s.note || '';
  note.oninput = () => { saved[r.bug] = { ...state(r), note: note.value }; store(); };
  const imgs = el('div', { class: 'imgs' }, ...r.images.map(src => el('figure', {}, el('img', { src, alt: src, loading: 'lazy' }), el('figcaption', { title: src }, src.split('/').pop()))));
  const meta = [r.creator, r.severity && 'S' + r.severity].filter(Boolean).join(' · ');
  $('#rows').append(el('section', { class: 'card', id: r.bug },
    el('div', { class: 'row-head' }, el('h2', {}, r.bug + ' ', el('span', { class: 'pill ' + r.result }, 'agent: ' + r.result)), sel),
    el('p', {}, r.title + (meta ? ' ' : ''), el('span', { class: 'muted' }, meta)),
    el('p', { class: 'muted' }, r.summary + (r.note ? ' — ' + r.note : '')),
    ta, imgs, el('label', { class: 'note' }, note)));
  mark();
}
counts();
const fit = t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 4 + 'px'; };
document.querySelectorAll('textarea').forEach(t => { fit(t); t.addEventListener('input', () => fit(t)); });
document.addEventListener('click', e => { if (e.target.matches('.imgs img')) { $('#zoom img').src = e.target.src; $('#zoom').style.display = 'flex'; } });
$('#zoom').onclick = () => { $('#zoom').style.display = 'none'; };
$('#copy').onclick = async () => {
  const out = D.rows.map(r => { const s = state(r); const res = s.result || r.result; const reason = s.reason ?? r.reason;
    return { bug: r.bug, result: res, changed: res !== r.result || reason !== r.reason, ...(reason !== r.reason ? { reason } : {}), ...(s.note ? { note: s.note } : {}) }; });
  const text = 'QR decisions ' + D.tr + ' ' + D.build + '\n' + JSON.stringify(out, null, 1);
  try { await navigator.clipboard.writeText(text); $('#copy').textContent = 'Copied'; } catch (e) { prompt('Copy this', text); }
  setTimeout(() => { $('#copy').textContent = 'Copy decisions'; }, 1500);
};
$('#reset').onclick = () => { if (confirm('Drop every edit on this page?')) { saved = {}; store(); location.reload(); } };
</script>
</body>
</html>

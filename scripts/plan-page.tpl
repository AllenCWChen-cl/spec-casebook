<title>__TITLE__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;600;700&display=swap">
<style>
/* Layout: a run sheet — summary strip, then phases as stacked ledgers whose segments are rows you can open to see their cases. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73;
  --pass: #2f7d4f; --fail: #b8402f; --blocked: #a86b12; --inc: #6a55a8; --notrun: #9aa6a8;
  --chip-bg: #eef2f2; --hold: #7a5a14; --skip: #7d878a;
  --display: "Archivo", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
  --body: "Source Sans 3", "Noto Sans TC", "Segoe UI", system-ui, "PingFang TC", sans-serif;
  --mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --pass: #5cbf83; --fail: #ec7a66; --blocked: #e0a548; --inc: #a796e0; --notrun: #5f6f71;
  --chip-bg: #213032; --hold: #e0b85a; --skip: #8c9a9c; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #111a1b; --panel: #182325; --ink: #e3ecec; --muted: #93a5a7; --line: #2a3a3c; --accent: #4fb8bd;
  --pass: #5cbf83; --fail: #ec7a66; --blocked: #e0a548; --inc: #a796e0; --notrun: #5f6f71;
  --chip-bg: #213032; --hold: #e0b85a; --skip: #8c9a9c; color-scheme: dark }
* { box-sizing: border-box }
.actual { color: var(--muted); font-size: 0.85rem; margin-top: 4px; max-width: 46ch }
body { background: var(--bg); color: var(--ink); font: 15px/1.5 var(--body); margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 56px }
.wrap { max-width: 1080px; margin: 0 auto; display: grid; gap: 28px }
h1, h2, h3 { font-family: var(--display); text-wrap: balance; margin: 0; letter-spacing: -0.01em }
h1 { font-size: 1.9rem; font-weight: 750 }
h2 { font-size: 1.25rem; font-weight: 650 }
.eyebrow { font: 600 0.72rem/1 var(--mono); text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted) }
.meta { color: var(--muted); display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 0.92rem }
.meta b { color: var(--ink); font-weight: 600 }
.bar { display: flex; height: 12px; border-radius: 3px; overflow: hidden; background: var(--chip-bg) }
.bar span { display: block; height: 100% }
.legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font: 0.82rem var(--mono); color: var(--muted) }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 6px; vertical-align: -1px }
.num { font-variant-numeric: tabular-nums }
.phase { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; overflow: hidden }
.phase-head { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 16px; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--line) }
.phase-id { font: 750 1.4rem var(--display); color: var(--accent) }
.phase-note { grid-column: 2 / 4; color: var(--muted); font-size: 0.9rem; min-width: 0 }
.state { font: 600 0.72rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 3px; background: var(--chip-bg); white-space: nowrap }
.state.done { color: var(--pass) } .state.active { color: var(--accent) } .state.pending { color: var(--muted) }
.state.hold { color: var(--hold) } .state.skip { color: var(--skip); text-decoration: line-through }
.seg { border-top: 1px solid var(--line) }
.seg:first-of-type { border-top: 0 }
.seg summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: 4.2rem minmax(0, 1fr) 7.5rem minmax(120px, 220px) auto; gap: 12px; align-items: center; padding: 11px 18px }
.seg summary::-webkit-details-marker { display: none }
.seg summary:hover { background: var(--chip-bg) }
.seg summary:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px }
.seg-id { font: 600 0.9rem var(--mono) }
.seg-name { min-width: 0 }
.seg-count { font: 0.82rem var(--mono); color: var(--muted); text-align: right }
.seg[open] summary { background: var(--chip-bg) }
.cases { overflow-x: auto; padding: 4px 18px 14px }
table { border-collapse: collapse; width: 100%; font-size: 0.88rem }
th { text-align: left; font: 600 0.7rem var(--mono); text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); padding: 6px 8px; border-bottom: 1px solid var(--line) }
td { padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top }
td.id { font-family: var(--mono); white-space: nowrap }
.r { font: 600 0.72rem var(--mono); padding: 2px 6px; border-radius: 3px; white-space: nowrap; color: var(--panel) }
.r.Pass { background: var(--pass) } .r.Fail { background: var(--fail) } .r.Blocked { background: var(--blocked) }
.r.Inconclusive { background: var(--inc) } .r.Notrun { background: var(--notrun) }
.flow { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 18px; display: grid; gap: 14px }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; counter-reset: s }
.step { border: 1px solid var(--line); border-radius: 4px; padding: 10px 12px; font-size: 0.9rem; min-width: 0 }
.step b { display: block; font: 650 0.95rem var(--display); margin-bottom: 2px }
.step .who { font: 0.72rem var(--mono); color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em }
.two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px }
.box { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: 16px 18px; min-width: 0 }
.box ul { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 6px; font-size: 0.9rem }
.cp { font-size: 0.86rem; display: grid; gap: 10px; margin-top: 8px }
.cp div { border-left: 3px solid var(--line); padding-left: 10px }
.cp .t { font: 0.75rem var(--mono); color: var(--muted) }
.usage .tbl { overflow-x: auto; margin-top: 10px }
.usage td, .usage th { white-space: nowrap }
.usage td.n, .usage th.n { text-align: right; font-variant-numeric: tabular-nums }
.usage tr.tot td { font-weight: 600; border-bottom: 0 }
.usage .none { color: var(--muted); font-style: italic }
.usage th.grp { text-align: center; border-bottom: 1px solid var(--line) }
.usage td.est { color: var(--accent); font-weight: 600 }
.usage td.acct, .usage th.acct { color: var(--muted) }
.usage td.acct { font-size: 0.82rem }
.usage th { white-space: normal; vertical-align: bottom }
.usage td, .usage th { padding-inline: 6px }
.usage .eq { display: block; font: 400 0.7rem var(--mono); color: var(--muted) }
.usage tr.sub td { font-size: 0.8rem; color: var(--muted); padding-block: 3px }
.usage tr.sub td:first-child { padding-left: 22px }
.usage tr.sub td.est { color: var(--accent); font-weight: 400 }
.usage tr.round td { border-top: 2px solid var(--line) }
.usage.nosegs tr.sub { display: none }
.usage .tools { margin-top: 8px; font-size: 0.85rem }
.usage .tools button { font: 600 0.75rem var(--mono); color: var(--accent); background: var(--chip-bg); border: 1px solid var(--line); border-radius: 3px; padding: 3px 8px; cursor: pointer }
.usage .notes { color: var(--muted); font-size: 0.85rem; margin: 10px 0 0; display: grid; gap: 4px }
.stats { display: block; font: 0.74rem var(--mono); color: var(--muted); margin-top: 3px }
code { font: 0.85em var(--mono); background: var(--chip-bg); padding: 1px 4px; border-radius: 3px }
@media (max-width: 720px) {
  .two { grid-template-columns: 1fr }
  .seg summary { grid-template-columns: 3.6rem minmax(0, 1fr) auto; }
  .seg summary .bar, .seg summary .seg-count { display: none }
  .phase-head { grid-template-columns: auto 1fr }
  .phase-head .state { grid-column: 1 / 3; justify-self: start }
  .phase-note { grid-column: 1 / 3 }
}
.run-name { font-size: 15px; color: var(--muted) }
.how { margin-top: 4px } .how summary { cursor: pointer; font-size: 13.5px; color: var(--muted) } .how .notes { margin-top: 8px }
.history { display: grid; gap: 14px; margin-top: 18px; padding-top: 18px; border-top: 2px solid var(--line) }
.hist-head { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap }
.history .phase { opacity: .92 }
details.hist > summary { cursor: pointer; font-size: 13.5px; color: var(--muted); padding: 10px 18px }
.top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap }
.lang { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: var(--panel) }
.lang button { font: 600 0.85rem var(--body); border: 0; background: transparent; color: var(--ink); padding: 5px 14px; cursor: pointer }
.lang button[aria-pressed="true"] { background: var(--ink); color: var(--panel) }
.lang button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
@media (prefers-reduced-motion: reduce) { * { transition: none !important } }
</style>

<div class="wrap">
  <header style="display:grid;gap:10px">
    <div class="top"><div class="eyebrow"><span data-zh="測試表執行計畫 · 本次執行">Casebook run plan · current run</span></div><div class="lang" role="group" aria-label="Language"><button type="button" data-l="en" aria-pressed="true">English</button><button type="button" data-l="zh" aria-pressed="false">中文</button></div></div>
    <h1>__TITLE__</h1>
    <div class="run-name" id="runname"></div>
    <div class="meta" id="meta"></div>
    <div class="bar" id="totalbar" aria-label="Results of the current run"></div>
    <div class="legend" id="legend"></div>
  </header>

  <section class="box usage nosegs" aria-labelledby="usage-h">
    <h2 id="usage-h"><span data-zh="時間與方案用量 · 本次執行">Time and plan usage · this run</span></h2>
    <div class="tools"><button type="button" aria-pressed="false" onclick="toggleSegs(this)">Show segments</button></div>
    <div class="tbl"><table id="usage"></table></div>
    <details class="how"><summary><span data-zh="這些數字怎麼算">How these figures are computed</span></summary><div class="notes" id="usage-notes"></div></details>
  </section>

  <div id="phases" style="display:grid;gap:18px"></div>

  <div class="two">
    <section class="box"><h2><span data-zh="最近的檢查點">Recent checkpoints</span></h2><div class="cp" id="cps"></div></section>
    <section class="box"><h2><span data-zh="執行紀錄">Run log</span></h2><ul id="log"></ul></section>
  </div>

  <section class="flow" aria-labelledby="flow-h">
    <h2 id="flow-h"><span data-zh="一個區段怎麼跑">How a segment runs</span></h2>
    <div class="steps">
      <div class="step"><span class="who"><span data-zh="協調者">Orchestrator</span></span><b><span data-zh="交代一個區段">Brief a segment</span></b><span data-zh="你對話的這個聊天為每個區段啟動一個子代理，每個都從乾淨的上下文開始：接續執行資料夾、讀計畫與 run-state、執行 &lt;code&gt;run-log next&lt;/code&gt;。">The chat you talk to starts one subagent per segment, which begins with a clean context: resume the run folder, read the plan and run-state, run <code>run-log next</code>.</span></div>
      <div class="step"><span class="who"><span data-zh="階段開始">Phase start</span></span><b><span data-zh="關卡與政策阻擋">Gate and policy blocks</span></b><span data-zh="&lt;code&gt;init&lt;/code&gt; 把需要無法提供之條件的案例記為 Blocked；做一次 Seedance 預覽，再以 &lt;code&gt;gate video&lt;/code&gt; 記錄通過或失敗。"><code>init</code> records cases needing an unavailable fixture as Blocked; one Seedance preview, then <code>gate video</code> pass or fail.</span></div>
      <div class="step"><span class="who"><span data-zh="區段">Segment</span></span><b><span data-zh="跑一個區段">Run one segment</span></b><span data-zh="每個案例都在手機上執行、做完立刻記錄，使用 &lt;code&gt;waitfor&lt;/code&gt;、&lt;code&gt;pink&lt;/code&gt; 與 recipe，不手動逐步操作。">Each case on the phone, recorded right after it is done, using <code>waitfor</code>, <code>pink</code> and recipes instead of hand-driving.</span></div>
      <div class="step"><span class="who"><span data-zh="區段">Segment</span></span><b><span data-zh="記錄檔與檢查點">Logs and checkpoint</span></b><span data-zh="&lt;code&gt;pull-logs&lt;/code&gt;、&lt;code&gt;log-slice&lt;/code&gt;，把原因補到 Fail 與 Blocked 案例，再寫檢查點並回覆 10 行以內。"><code>pull-logs</code>, <code>log-slice</code>, causes added to Fail and Blocked cases, then the checkpoint and a 10-line reply.</span></div>
      <div class="step"><span class="who"><span data-zh="階段結束">Phase end</span></span><b><span data-zh="收尾">Wrap up the phase</span></b><span data-zh="總結、測試時間、Claude token、eBug 草稿與審核頁、報告。不送出任何 eBug。">Summary, test time, Claude tokens, eBug drafts and review page, report. Nothing is filed.</span></div>
    </div>
  </section>

  <section class="history" id="history" aria-labelledby="hist-h">
    <div class="hist-head"><h2 id="hist-h"><span data-zh="先前的執行">Earlier runs</span></h2><span class="eyebrow" id="hist-sum"></span></div>
    <section class="box usage nosegs" aria-label="Time and plan usage of earlier runs">
      <h2><span data-zh="時間與方案用量 · 先前的執行">Time and plan usage · earlier runs</span></h2>
      <div class="tools"><button type="button" aria-pressed="false" onclick="toggleSegs(this)">Show segments</button></div>
      <div class="tbl"><table id="usage-hist"></table></div>
    </section>
    <div id="hist-phases" style="display:grid;gap:14px"></div>
  </section>
</div>

<script>
let DATA = __DATA__;
const LIVE = __LIVE__;
// Language: English or 中文 for everything the page writes itself; run data (actions, notes, results text, log) stays
// as written in the files. The choice is remembered per browser.
let LANG = 'en';
try { if (localStorage.getItem('plan-lang') === 'zh') LANG = 'zh'; } catch (e) {}
const tx = (en, zh) => LANG === 'zh' ? zh : en;
const RES = ['Pass', 'Fail', 'Blocked', 'Inconclusive', 'Not run'];
const RES_ZH = { 'Pass': '通過', 'Fail': '失敗', 'Blocked': '受阻', 'Inconclusive': '無法判定', 'Not run': '未執行' };
const resName = r => tx(r, RES_ZH[r] ?? r);
const STATE_ZH = { 'Skipped this round': '本輪略過', 'Deferred': '延後', 'Done': '完成', 'In progress': '進行中', 'Pending': '待執行', 'Skipped': '略過' };
const stateName = s => tx(s, STATE_ZH[s] ?? s);
const COLOR = { 'Pass': 'var(--pass)', 'Fail': 'var(--fail)', 'Blocked': 'var(--blocked)', 'Inconclusive': 'var(--inc)', 'Not run': 'var(--notrun)' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tally = cs => { const t = Object.fromEntries(RES.map(r => [r, 0])); cs.forEach(c => t[c.result in t ? c.result : 'Not run']++); return t; };
const bar = t => { const n = Object.values(t).reduce((a, b) => a + b, 0) || 1; return RES.map(r => t[r] ? `<span style="width:${t[r] / n * 100}%;background:${COLOR[r]}" title="${resName(r)} ${t[r]}"></span>` : '').join(''); };
const hm = ms => `${Math.floor(ms / 3600000)}h ${String(Math.round(ms / 60000) % 60).padStart(2, '0')}m`;
const tok = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n);
const tokAll = u => u.input + u.cacheWrite + u.cacheRead + u.output;
const num = n => n.toLocaleString('en-US');
const tokTitle = u => tx(`${u.messages} msgs · input ${num(u.input)} · cache write ${num(u.cacheWrite)} · cache read ${num(u.cacheRead)} · output ${num(u.output)}`,
  `${u.messages} 則訊息 · 輸入 ${num(u.input)} · 快取寫入 ${num(u.cacheWrite)} · 快取讀取 ${num(u.cacheRead)} · 輸出 ${num(u.output)}`);
const pct = (v, approx, none = tx('no readings', '無讀數')) => v == null ? `<span class="none">${none}</span>` : `${approx ? '≈' : ''}${Math.round(v)}%`;
// Seat label "<seat>, <note>": the part after ", " is shown small.
const seatLabel = s => !s ? '' : (s.seats.length ? s.seats.map(m => m === 1 ? 'Pro 1×' : `${m}× Pro`).join(' + ') : tx('seat unknown', '席位不明')) + (s.readings ? '' : `, ${tx('no readings', '無讀數')}`);
const fmtP = v => v < 9.95 ? `${v.toFixed(1)}%` : `${Math.round(v)}%`;
// "= N% of an N× seat" for rows that ran on one non-Pro seat (6.25× in round 2, 1.25× from round 3).
const seatEq = (v, s) => { const m = s && s.seats && s.seats.length === 1 && s.seats[0] !== 1 ? s.seats[0] : null; return m && v != null ? `<span class="eq">${tx(`= ${fmtP(v / m)} of ${m}× seat`, `= ${m}× 席位的 ${fmtP(v / m)}`)}</span>` : ''; };
const statLine = s => s ? `<span class="stats num">${s.wall > s.test + 60000 ? `${tx('wall', '總時長')} ${hm(s.wall)} · ` : ''}${tx('test', '測試')} ${hm(s.test)}${s.idle ? ` · ${tx('idle', '閒置')} ${hm(s.idle)}` : ''} · <span title="${esc(tokTitle(s.tokens))}">${tok(tokAll(s.tokens))} tokens</span>${s.est5 != null ? ` · ${tx('est. 5-hour', '估計 5 小時')} ${fmtP(s.est5)}${s.estW != null ? ` · ${tx('weekly', '每週')} ~${fmtP(s.estW)}` : ''} ${tx('of 1× Pro', '（1× Pro）')}` : ''}${s.fiveHour != null ? ` · ${tx('account total (shared)', '帳號合計（共用）')} ${pct(s.fiveHour, s.approx)} / ${pct(s.weekly, s.approx)}` : ''}</span>` : '';
const segBtnText = btn => { const shown = !btn.closest('.usage').classList.contains('nosegs'); btn.textContent = shown ? tx('Hide segments', '隱藏區段') : tx('Show segments', '顯示區段'); };
function toggleSegs(btn) { const u = btn.closest('.usage'); u.classList.toggle('nosegs'); btn.setAttribute('aria-pressed', String(!u.classList.contains('nosegs'))); segBtnText(btn); }
const utc = s => esc(s.slice(5, 16).replace('T', ' '));
// One usage table per part of the page: the current run (with the notes) and the earlier runs.
function renderUsage(tableId, subset, totalLabel, emptyText) {
  const U = DATA.usage, C = U.calibration, ps = subset.filter(p => p.stats);
  if (!ps.length) { document.getElementById(tableId).innerHTML = `<tbody><tr><td class="none">${esc(emptyText)}</td></tr></tbody>`; }
  const z = { wall: 0, test: 0, idle: 0, gaps: 0, tokens: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, messages: 0 } };
  for (const p of ps) { for (const k of ['wall', 'test', 'idle', 'gaps']) z[k] += p.stats[k]; for (const k in z.tokens) z.tokens[k] += p.stats.tokens[k]; }
  const estCells = (s, eq = true) => `<td class="n est">${s.est5 == null ? `<span class="none">${tx('no calibration', '未校準')}</span>` : fmtP(s.est5) + (eq ? seatEq(s.est5, s) : '')}</td><td class="n est">${s.estW == null ? '<span class="none">—</span>' : '~' + fmtP(s.estW) + (eq ? seatEq(s.estW, s) : '')}</td>`;
  const acctCells = (h5, wk, approx) => `<td class="n acct">${pct(h5, approx, '—')}</td><td class="n acct">${pct(wk, approx, '—')}</td>`;
  const gaps = n => tx(`${n} gap${n > 1 ? 's' : ''}`, `${n} 段閒置`);
  const row = (label, seat, s, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${esc(seat.split(', ')[0])}${seat.includes(', ') ? `<span class="eq">${esc(seat.split(', ').slice(1).join(', '))}</span>` : ''}</td><td class="n">${hm(s.wall)}</td><td class="n">${hm(s.test)}</td><td class="n">${hm(s.idle)}${s.gaps ? `<span class="eq">${gaps(s.gaps)}</span>` : ''}</td><td class="n" title="${esc(tokTitle(s.tokens))}">${tok(tokAll(s.tokens))}${s.wt != null ? `<span class="eq">${tx('wtd', '加權')} ${tok(s.wt)}</span>` : ''}</td>`;
  const sub = (label, s) => s ? row(label, '', s, 'sub') + estCells(s, false) + acctCells(s.fiveHour, s.weekly, s.approx) + '</tr>' : '';
  const span = s => `<span class="eq">${utc(s.from)} → ${utc(s.to)} UTC</span>`;
  const ids = new Set(ps.map(p => p.id));
  const rounds = (U.rounds || []).map(r => ({ ...r, phases: r.phases.filter(id => ids.has(id)) })).filter(r => r.phases.length);
  const allRounds = U.rounds || [];
  const sum = k => ps.some(p => p.stats[k] != null) ? ps.reduce((a, p) => a + (p.stats[k] ?? 0), 0) : null;
  const body = rounds.map(r => r.phases.map(id => { const p = ps.find(x => x.id === id);
      return row(`<b>${esc(p.id)}</b> ${span(p.stats)}`, seatLabel(p.stats), p.stats) + estCells(p.stats) + acctCells(p.stats.fiveHour, p.stats.weekly, p.stats.approx) + '</tr>'
        + p.segments.map(s => sub(`<span title="${esc(s.name)}">${esc(s.id)}</span>`, s.stats)).join('') + sub(tx('wrap-up', '收尾'), p.wrapUp); }).join('')
    + (r.phases.length > 1 ? row(`${tx(`Round ${r.n} total`, `第 ${r.n} 輪合計`)} <span class="eq">${esc(r.phases.join(' + '))}</span>`, seatLabel(r), r, 'tot round') + estCells(r) + acctCells(r.readings ? r.fiveHour : null, r.readings ? r.weekly : null, r.approx) + '</tr>' : '')).join('');
  const outside = U.outside5 || U.outsideW ? `<tr><td>${tx('Outside any run', '執行以外')}</td><td></td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n est">—</td><td class="n est">—</td>${acctCells(U.outside5, U.outsideW, U.approx)}</tr>` : '';
  const acctTitle = tx("Snapshot increments during the run's active time, including other users of the account", '執行期間帳號用量快照的增加量，包含帳號的其他使用者');
  if (ps.length) document.getElementById(tableId).innerHTML = `<thead><tr><th rowspan="2">${tx('Phase', '階段')}</th><th rowspan="2">${tx('Account', '帳號')}</th><th class="n" rowspan="2">${tx('Wall', '總時長')}</th><th class="n" rowspan="2">${tx('Test', '測試')}</th><th class="n" rowspan="2">${tx('Idle &gt;15 min', '閒置 &gt;15 分')}</th><th class="n" rowspan="2">${tx('Claude tokens', 'Claude token')}</th><th class="grp" colspan="2">${tx('Est. from token rate, % of 1× Pro', '依 token 率估計（1× Pro 的 %）')}</th><th class="grp acct" colspan="2">${tx('Account total (shared), % of 1× Pro', '帳號合計（共用，1× Pro 的 %）')}</th></tr>
    <tr><th class="n" title="${tx('Weighted tokens × the calibrated rate', '加權 token × 校準後的比率')}">${tx('5-hour', '5 小時')}</th><th class="n" title="${tx('5-hour estimate × the weekly ÷ 5-hour ratio', '5 小時估計 × 每週 ÷ 5 小時比')}">${tx('Weekly (rough)', '每週（粗估）')}</th><th class="n acct" title="${acctTitle}">${tx('5-hour', '5 小時')}</th><th class="n acct" title="${acctTitle}">${tx('Weekly', '每週')}</th></tr></thead><tbody>` +
    body + outside +
    (ps.length > 1 ? row(esc(totalLabel), '', { ...z, wt: sum('wt') }, 'tot round') + estCells({ est5: sum('est5'), estW: sum('estW'), seats: [] }) + acctCells(sum('fiveHour'), sum('weekly'), ps.some(p => p.stats.approx)) + '</tr>' : '') + '</tbody>';
  if (tableId !== 'usage') return;
  const L = U.latest, w = U.weights;
  const opm = t => t.messages ? t.output / t.messages : 0;
  const basisRound = C ? allRounds.find(r => r.phases.includes(C.basis)) : null;
  const models = o => Object.keys(o || {}).join(', ') || '?';
  const outNotes = C && basisRound ? allRounds.filter(r => r !== basisRound).map(r => {
    const per = r.phases.map(id => { const p = DATA.phases.find(x => x.id === id); return `${esc(id)} ${Math.round(opm(p.stats.tokens))}`; }).join(', ');
    const extra = C.rate != null ? Math.max(0, opm(basisRound.tokens) - opm(r.tokens)) * r.tokens.messages * w.output * C.rate : 0;
    const o = Math.round(opm(r.tokens)), ob = Math.round(opm(basisRound.tokens)), b = esc(C.basis), m = num(r.tokens.messages);
    return tx(`<span><b>Output may be under-recorded.</b> Round ${r.n} transcripts record ${o} output tokens per message (${per}; ${m} messages) against ${ob} in ${b}. If round ${r.n}'s output was really nearer ${b}'s, its estimate is too low: at ${ob} per message it would be about ${Math.round(extra)} points higher (5-hour, 1× Pro).</span>`,
      `<span><b>輸出可能記錄偏低。</b>第 ${r.n} 輪的對話紀錄每則訊息 ${o} 個輸出 token（${per}；${m} 則訊息），${b} 則是 ${ob}。若第 ${r.n} 輪的輸出其實接近 ${b}，它的估計就偏低：以每則 ${ob} 計算約再高 ${Math.round(extra)} 個百分點（5 小時，1× Pro）。</span>`);
  }).join('') : '';
  const WB = C && C.weekBasis;
  const rateStr = C && C.rate != null ? (C.rate * 1e6).toFixed(2) : '?';
  const ratio = C && C.weekRatio != null ? C.weekRatio.toFixed(3) : '?';
  const notes = !C ? [tx(`<span><b>No calibration.</b> Add <code>runs/usage-calibration.json</code> (<code>{ "basis": "P1", "fiveHourPct": 300, "seat": 1, "source": "…", "weekPerFiveHour": null }</code>) to show the token-rate estimate.</span>`,
      `<span><b>尚未校準。</b>加入 <code>runs/usage-calibration.json</code>（<code>{ "basis": "P1", "fiveHourPct": 300, "seat": 1, "source": "…", "weekPerFiveHour": null }</code>）即可顯示依 token 率的估計。</span>`)] : [
    tx(`<span><b>Est. from token rate (the main figure).</b> Calibration (<code>runs/usage-calibration.json</code>): ${esc(C.source || '?')} = ${C.fiveHourPct * (C.seat || 1)}% of a 1× Pro 5-hour window for ${esc(C.basis)}'s ${tok(C.basisWt)} weighted tokens, so the rate is ${rateStr}% per million weighted tokens. Each row = its weighted tokens × that rate (weights: input ${w.input}, cache write ${w.cacheWrite}, cache read ${w.cacheRead}, output ${w.output}); "= N% of an N× seat" divides by the seat size of the account the row ran on.</span>`,
      `<span><b>依 token 率估計（主要數字）。</b>校準（<code>runs/usage-calibration.json</code>）：${esc(C.source || '?')} = ${esc(C.basis)} 的 ${tok(C.basisWt)} 加權 token 用掉 1× Pro 5 小時額度的 ${C.fiveHourPct * (C.seat || 1)}%，所以比率是每百萬加權 token ${rateStr}%。每一列 = 它的加權 token × 這個比率（權重：輸入 ${w.input}、快取寫入 ${w.cacheWrite}、快取讀取 ${w.cacheRead}、輸出 ${w.output}）；「= N× 席位的 N%」是再除以該列所用帳號的席位大小。</span>`),
    tx(`<span><b>Weekly is rough.</b> ${esc(C.basis)} has no weekly reading, so weekly = the 5-hour estimate × ${ratio}${C.weekPerFiveHour != null ? ' (weekPerFiveHour in the calibration file)' : WB ? `, the weekly ÷ 5-hour ratio in the ${WB.seat}× seat's paired readings (weekly +${Math.round(WB.weekly)}% against 5-hour +${Math.round(WB.fiveHour)}% of 1× Pro, ${utc(WB.from)} → ${utc(WB.to)} UTC). Those readings include other users of the account and assume the seat's weekly limit scales like its 5-hour limit` : ' (no paired readings to take a ratio from)'}.</span>`,
      `<span><b>每週只是粗估。</b>${esc(C.basis)} 沒有每週讀數，所以每週 = 5 小時估計 × ${ratio}${C.weekPerFiveHour != null ? '（校準檔的 weekPerFiveHour）' : WB ? `，取自 ${WB.seat}× 席位成對讀數的每週 ÷ 5 小時比（每週 +${Math.round(WB.weekly)}%，5 小時 +${Math.round(WB.fiveHour)}%，以 1× Pro 計，${utc(WB.from)} → ${utc(WB.to)} UTC）。這些讀數包含帳號其他使用者的用量，並假設席位的每週上限與 5 小時上限同比例` : '（沒有成對讀數可算比例）'}。</span>`),
    tx(`<span><b>Assumes the same model and limits throughout:</b> the rate from ${esc(C.basis)} holds for every round only if the same model ran (transcripts: ${allRounds.map(r => `round ${r.n} ${esc(models(r.models))}`).join('; ')}) and each seat's limits scale with its size (a 6.25× or 1.25× Team seat = that many times Pro).</span>`,
      `<span><b>假設全程使用相同模型與上限：</b>${esc(C.basis)} 的比率只有在每一輪都用同一個模型時才適用（對話紀錄：${allRounds.map(r => `第 ${r.n} 輪 ${esc(models(r.models))}`).join('；')}），並假設每個席位的上限隨席位大小等比放大（6.25× 或 1.25× Team 席位 = 那麼多倍的 Pro）。</span>`),
  ];
  document.getElementById('usage-notes').innerHTML = [
    ...notes, outNotes,
    tx(`<span><b>Account total (shared) is muted on purpose.</b> It is the account's snapshot increments while the run was active (a 100% stop = one full window). The round-2 account was used heavily by someone else on another machine during P23 and P4 (user, 2026-10-21); their use is invisible to these transcripts, so this figure is far above this run's own use. The earlier token-ratio share (this run's tokens ÷ all tokens on this Mac) was dropped for the same reason: its denominator could not see the other user.</span>`,
      `<span><b>帳號合計（共用）刻意淡化顯示。</b>它是執行期間帳號用量快照的增加量（用到 100% 而停止 = 一整個額度）。第 2 輪的帳號在 P23 與 P4 期間被其他人在別台電腦大量使用（使用者，2026-10-21）；這些用量不在這裡的對話紀錄中，所以這個數字遠高於本次執行自己的用量。先前的 token 比例分攤（本次執行的 token ÷ 這台 Mac 的所有 token）也因同樣原因取消：分母看不到其他使用者。</span>`),
    tx(`<span><b>Seat size per account.</b> Each usage snapshot stores its account's seat size (<code>proMultiplier</code>, <code>usage-log.ts --seat N</code>): Pro-% = plan-% × that value, so 625% = one full 5-hour window of a 6.25× Pro Team seat. A seat change marks an account switch and starts a new round; no window spans it.${U.seatAssumed ? " Rows without a value inherit the previous row's (1 before any)." : ''} Plan % comes from ${U.snapshots} usage reading${U.snapshots === 1 ? '' : 's'}${U.markers ? ` and ${U.markers} account marker${U.markers === 1 ? '' : 's'}` : ''} (<code>runs/usage.jsonl</code>).</span>`,
      `<span><b>每個帳號的席位大小。</b>每筆用量快照都記錄該帳號的席位大小（<code>proMultiplier</code>，<code>usage-log.ts --seat N</code>）：Pro-% = 方案 % × 席位大小，所以 625% = 6.25× Pro Team 席位的一整個 5 小時額度。席位改變代表換了帳號，並開始新的一輪；額度不會跨過它。${U.seatAssumed ? '沒有記錄席位的列沿用前一列（最前面為 1）。' : ''}方案 % 來自 ${U.snapshots} 筆用量讀數${U.markers ? `與 ${U.markers} 個帳號標記` : ''}（<code>runs/usage.jsonl</code>）。</span>`),
    L ? tx(`<span>Latest reading ${esc(L.at.slice(0, 16).replace('T', ' '))} UTC (${L.seat}× Pro seat): 5-hour ${L.fiveHourPct ?? '?'}%${L.fiveHourResetsAt ? ` (resets ${utc(L.fiveHourResetsAt)})` : ''} · weekly ${L.weeklyPct ?? '?'}%${L.weeklyResetsAt ? ` (resets ${utc(L.weeklyResetsAt)})` : ''} of the plan.</span>`,
      `<span>最新讀數 ${esc(L.at.slice(0, 16).replace('T', ' '))} UTC（${L.seat}× Pro 席位）：5 小時 ${L.fiveHourPct ?? '?'}%${L.fiveHourResetsAt ? `（${utc(L.fiveHourResetsAt)} 重設）` : ''} · 每週 ${L.weeklyPct ?? '?'}%${L.weeklyResetsAt ? `（${utc(L.weeklyResetsAt)} 重設）` : ''}（方案用量）。</span>`) : '',
    tx(`<span>Time as <code>run-log.ts time</code> (activity points per run folder; test = gaps up to 15 min). Claude tokens = input + cache write + cache read + output from ${U.transcripts} transcripts of this project (sessions and subagents) inside each run's active spans; "wtd" = weighted. A phase row includes its wrap-up.</span>`,
      `<span>時間同 <code>run-log.ts time</code>（各執行資料夾的活動時間點；測試 = 15 分鐘以內的間隔）。Claude token = 輸入 + 快取寫入 + 快取讀取 + 輸出，取自本專案 ${U.transcripts} 份對話紀錄（工作階段與子代理）在各執行活動期間的部分；「加權」= 加權後。階段列包含它的收尾。</span>`)
  ].join('');
}
function phaseHtml(p, history) {
  const cs = p.segments.flatMap(s => s.cases), t = tally(cs);
  const state = p.skip ? ['skip', 'Skipped this round'] : p.hold ? ['hold', 'Deferred'] : t['Not run'] === 0 ? ['done', 'Done'] : t['Not run'] < cs.length ? ['active', 'In progress'] : ['pending', 'Pending'];
  const segs = p.segments.map(s => {
    const st = tally(s.cases), left = st['Not run'];
    const ss = p.skip ? ['skip', 'Skipped'] : left === 0 ? ['done', 'Done'] : left < s.cases.length ? ['active', 'In progress'] : ['pending', 'Pending'];
    const rows = s.cases.map(c => `<tr><td class="id">${esc(c.id)}${c.origin ? ` <span class="eyebrow">${esc(c.origin)}</span>` : ''}${c.needs ? `<div class="eyebrow">${tx('needs', '需要')} ${esc(c.needs)}</div>` : ''}</td><td>${esc(c.section)}</td><td>${esc(c.action)}</td><td><span class="r ${esc(c.result.replace(' ', ''))}">${esc(resName(c.result))}</span>${c.disp ? ` <span class="eyebrow">${esc(c.disp)}</span>` : ''}${c.actual ? `<div class="actual">${esc(c.actual)}${c.at ? ` <span class="eyebrow">${esc(c.at)}</span>` : ''}</div>` : ''}</td></tr>`).join('');
    return `<details class="seg" id="${esc(p.id)}--${esc(s.id)}"${openSegs.has(`${p.id}--${s.id}`) ? ' open' : ''}><summary><span class="seg-id">${esc(s.id)}</span><span class="seg-name">${esc(s.name)}${statLine(s.stats)}</span><span class="seg-count num">${s.cases.length - left}/${s.cases.length} ${tx('recorded', '已記錄')}</span><span class="bar">${bar(st)}</span><span class="state ${ss[0]}">${stateName(ss[1])}</span></summary>
      <div class="cases"><table><thead><tr><th>${tx('Case', '案例')}</th><th>${tx('Section', '分區')}</th><th>${tx('Action', '操作')}</th><th>${tx('Result', '結果')}</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
  }).join('');
  const head = `<div class="phase-head"><span class="phase-id">${esc(p.id)}</span><h2>${esc(p.name)} <span class="eyebrow num">${tx(`${cs.length} cases · ${p.segments.length} segments`, `${cs.length} 個案例 · ${p.segments.length} 個區段`)}</span></h2><span class="state ${state[0]}">${stateName(state[1])}</span>
    <div class="phase-note">${esc(p.skip || p.hold || p.note || '')}${p.runDir ? ` <code>${esc(p.runDir)}</code>` : ''}${statLine(p.stats)}</div><div class="bar" style="grid-column:1/-1">${bar(t)}</div></div>`;
  const body = history ? `<details class="hist" id="hist--${esc(p.id)}"${openSegs.has(`hist--${p.id}`) ? ' open' : ''}><summary>${tx(`Show ${p.segments.length} segments and their cases`, `顯示 ${p.segments.length} 個區段與其案例`)}</summary>${segs}</details>` : segs;
  return `<section class="phase" aria-label="${esc(p.id)}">${head}${body}</section>`;
}
let openSegs = new Set();
function render() {
openSegs = new Set([...document.querySelectorAll('details.seg[open], details.hist[open]')].map(d => d.id));
// Both parts keep the order the phases ran in; only the current run and the earlier runs are separated.
const cur = DATA.phases.filter(p => p.current), hist = DATA.phases.filter(p => !p.current);
renderUsage('usage', cur, tx('This run', '本次執行'), tx('No time recorded yet: the figures start with the first segment of this run.', '尚未記錄時間：數字從本次執行的第一個區段開始。'));
renderUsage('usage-hist', hist, tx('Earlier runs total', '先前執行合計'), tx('No earlier runs.', '沒有先前的執行。'));
const all = cur.flatMap(p => p.skip || p.hold ? [] : p.segments.flatMap(s => s.cases));
const nowCase = cur.flatMap(p => p.skip || p.hold ? [] : p.segments.flatMap(s => s.cases.map(c => ({ ...c, seg: s.id })))).find(c => c.result === 'Not run');
const T = tally(all);
document.getElementById('runname').textContent = cur.map(p => `${p.id} · ${p.name}`).join(' · ');
document.getElementById('meta').innerHTML = [
  [tx('Table', '測試表'), `${esc(DATA.feature)} · v${DATA.version} · ${tx(`${DATA.totalCases} cases`, `${DATA.totalCases} 個案例`)}`],
  [tx('Build', '版本'), esc(DATA.build)], [tx('In this run', '本次執行'), tx(`${all.length} cases`, `${all.length} 個案例`)],
  [tx('Recorded', '已記錄'), `${all.length - T['Not run']} / ${all.length}`], [tx('Next', '下一個'), nowCase ? `${esc(nowCase.id)} (${esc(nowCase.seg)})` : '—'],
  [LIVE ? tx('Live · updated', '即時 · 更新於') : tx('Generated', '產生於'), esc(DATA.generated)]
].map(([k, v]) => `<span>${k} <b class="num">${v}</b></span>`).join('');
document.getElementById('totalbar').innerHTML = bar(T);
document.getElementById('legend').innerHTML = RES.map(r => `<span><i style="background:${COLOR[r]}"></i>${resName(r)} <span class="num">${T[r]}</span></span>`).join('');
document.getElementById('phases').innerHTML = cur.map(p => phaseHtml(p, false)).join('');
document.getElementById('history').hidden = !hist.length;
document.getElementById('hist-sum').textContent = hist.length ? `${hist.map(p => p.id).join(', ')} · ${tx(`${hist.reduce((n, p) => n + p.segments.reduce((m, s) => m + s.cases.length, 0), 0)} cases`, `${hist.reduce((n, p) => n + p.segments.reduce((m, s) => m + s.cases.length, 0), 0)} 個案例`)}` : '';
document.getElementById('hist-phases').innerHTML = hist.map(p => phaseHtml(p, true)).join('');
document.getElementById('cps').innerHTML = DATA.checkpoints.map(c => `<div><span class="t">${esc(c.time)} · ${tx('next', '下一個')} ${esc(c.next)}</span><br>${esc(c.text)}</div>`).join('') || `<div>${tx('No checkpoints yet for this run.', '本次執行還沒有檢查點。')}</div>`;
document.getElementById('log').innerHTML = DATA.log.map(l => `<li>${esc(l)}</li>`).join('');
}
// Fixed text carries its Chinese in data-zh; the English is kept in data-en the first time it is swapped.
function applyStatic() {
  document.querySelectorAll('[data-zh]').forEach(el => { if (el.dataset.en == null) el.dataset.en = el.innerHTML; el.innerHTML = LANG === 'zh' ? el.dataset.zh : el.dataset.en; });
  document.querySelectorAll('.usage .tools button').forEach(segBtnText);
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === LANG)));
  document.documentElement.lang = LANG === 'zh' ? 'zh-Hant' : 'en';
}
function setLang(l) { LANG = l; try { localStorage.setItem('plan-lang', l); } catch (e) {} applyStatic(); render(); }
document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.l)));
applyStatic();
render();
/*LIVE*/
// Served by `plan-page.ts --serve`: pick up each recorded case without a reload.
if (LIVE) setInterval(async () => {
  try { const r = await fetch('data.json', { cache: 'no-store' }); if (r.ok) { DATA = await r.json(); render(); } } catch {}
}, 10000);
/*/LIVE*/
</script>

<title>__TITLE__</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;650;750&family=Source+Sans+3:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Layout: a run sheet — summary strip, then phases as stacked ledgers whose segments are rows you can open to see their cases. */
:root {
  --bg: #f4f6f6; --panel: #ffffff; --ink: #172426; --muted: #5b6b6e; --line: #d8e0e1; --accent: #0f6e73;
  --pass: #2f7d4f; --fail: #b8402f; --blocked: #a86b12; --inc: #6a55a8; --notrun: #9aa6a8;
  --chip-bg: #eef2f2; --hold: #7a5a14; --skip: #7d878a;
  --display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --body: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
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
@media (prefers-reduced-motion: reduce) { * { transition: none !important } }
</style>

<div class="wrap">
  <header style="display:grid;gap:10px">
    <div class="eyebrow">Casebook run plan</div>
    <h1>__TITLE__</h1>
    <div class="meta" id="meta"></div>
    <div class="bar" id="totalbar" aria-label="Results across all phases"></div>
    <div class="legend" id="legend"></div>
  </header>

  <section class="box usage nosegs" aria-labelledby="usage-h">
    <h2 id="usage-h">Time and plan usage</h2>
    <div class="tools"><button type="button" id="segtoggle" aria-pressed="false" onclick="const u=this.closest('.usage');u.classList.toggle('nosegs');this.setAttribute('aria-pressed',String(!u.classList.contains('nosegs')));this.textContent=u.classList.contains('nosegs')?'Show segments':'Hide segments'">Show segments</button></div>
    <div class="tbl"><table id="usage"></table></div>
    <div class="notes" id="usage-notes"></div>
  </section>

  <section class="flow" aria-labelledby="flow-h">
    <h2 id="flow-h">How a segment runs</h2>
    <div class="steps">
      <div class="step"><span class="who">Orchestrator</span><b>Brief a segment</b>The chat you talk to starts one subagent per segment, which begins with a clean context: resume the run folder, read the plan and run-state, run <code>run-log next</code>.</div>
      <div class="step"><span class="who">Phase start</span><b>Gate and policy blocks</b><code>init</code> records cases needing an unavailable fixture as Blocked; one Seedance preview, then <code>gate video</code> pass or fail.</div>
      <div class="step"><span class="who">Segment</span><b>Run one segment</b>Each case on the phone, recorded right after it is done, using <code>waitfor</code>, <code>pink</code> and recipes instead of hand-driving.</div>
      <div class="step"><span class="who">Segment</span><b>Logs and checkpoint</b><code>pull-logs</code>, <code>log-slice</code>, causes added to Fail and Blocked cases, then the checkpoint and a 10-line reply.</div>
      <div class="step"><span class="who">Phase end</span><b>Wrap up the phase</b>Summary, test time, Claude tokens, eBug drafts and review page, report. Nothing is filed.</div>
    </div>
  </section>

  <div id="phases" style="display:grid;gap:18px"></div>

  <div class="two">
    <section class="box"><h2>Recent checkpoints</h2><div class="cp" id="cps"></div></section>
    <section class="box"><h2>Run log</h2><ul id="log"></ul></section>
  </div>
</div>

<script>
let DATA = __DATA__;
const LIVE = __LIVE__;
const RES = ['Pass', 'Fail', 'Blocked', 'Inconclusive', 'Not run'];
const COLOR = { 'Pass': 'var(--pass)', 'Fail': 'var(--fail)', 'Blocked': 'var(--blocked)', 'Inconclusive': 'var(--inc)', 'Not run': 'var(--notrun)' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tally = cs => { const t = Object.fromEntries(RES.map(r => [r, 0])); cs.forEach(c => t[c.result in t ? c.result : 'Not run']++); return t; };
const bar = t => { const n = Object.values(t).reduce((a, b) => a + b, 0) || 1; return RES.map(r => t[r] ? `<span style="width:${t[r] / n * 100}%;background:${COLOR[r]}" title="${r} ${t[r]}"></span>` : '').join(''); };
const hm = ms => `${Math.floor(ms / 3600000)}h ${String(Math.round(ms / 60000) % 60).padStart(2, '0')}m`;
const tok = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n);
const tokAll = u => u.input + u.cacheWrite + u.cacheRead + u.output;
const tokTitle = u => `${u.messages} msgs · input ${u.input.toLocaleString('en-US')} · cache write ${u.cacheWrite.toLocaleString('en-US')} · cache read ${u.cacheRead.toLocaleString('en-US')} · output ${u.output.toLocaleString('en-US')}`;
const pct = (v, approx, none = 'no readings') => v == null ? `<span class="none">${none}</span>` : `${approx ? '≈' : ''}${Math.round(v)}%`;
const seatLabel = s => !s ? '' : (s.seats.length ? s.seats.map(m => m === 1 ? 'Pro 1×' : `${m}× Pro`).join(' + ') : 'seat unknown') + (s.readings ? '' : ', no readings');
const fmtP = v => v < 9.95 ? `${v.toFixed(1)}%` : `${Math.round(v)}%`;
// "= N% of a 6.25× seat" for rows that ran on one non-Pro seat.
const seatEq = (v, s) => { const m = s && s.seats && s.seats.length === 1 && s.seats[0] !== 1 ? s.seats[0] : null; return m && v != null ? `<span class="eq">= ${fmtP(v / m)} of ${m}× seat</span>` : ''; };
const statLine = s => s ? `<span class="stats num">${s.wall > s.test + 60000 ? `wall ${hm(s.wall)} · ` : ''}test ${hm(s.test)}${s.idle ? ` · idle ${hm(s.idle)}` : ''} · <span title="${esc(tokTitle(s.tokens))}">${tok(tokAll(s.tokens))} tokens</span>${s.est5 != null ? ` · est. 5-hour ${fmtP(s.est5)}${s.estW != null ? ` · weekly ~${fmtP(s.estW)}` : ''} of 1× Pro` : ''}${s.fiveHour != null ? ` · account total (shared) ${pct(s.fiveHour, s.approx)} / ${pct(s.weekly, s.approx)}` : ''}</span>` : '';
function renderUsage() {
  const U = DATA.usage, C = U.calibration, ps = DATA.phases.filter(p => p.stats);
  const z = { wall: 0, test: 0, idle: 0, gaps: 0, tokens: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, messages: 0 } };
  for (const p of ps) { for (const k of ['wall', 'test', 'idle', 'gaps']) z[k] += p.stats[k]; for (const k in z.tokens) z.tokens[k] += p.stats.tokens[k]; }
  const estCells = (s, eq = true) => `<td class="n est">${s.est5 == null ? '<span class="none">no calibration</span>' : fmtP(s.est5) + (eq ? seatEq(s.est5, s) : '')}</td><td class="n est">${s.estW == null ? '<span class="none">—</span>' : '~' + fmtP(s.estW) + (eq ? seatEq(s.estW, s) : '')}</td>`;
  const acctCells = (h5, wk, approx) => `<td class="n acct">${pct(h5, approx, '—')}</td><td class="n acct">${pct(wk, approx, '—')}</td>`;
  const row = (label, seat, s, cls = '') => `<tr class="${cls}"><td>${label}</td><td>${esc(seat.split(', ')[0])}${seat.includes(', ') ? `<span class="eq">${esc(seat.split(', ').slice(1).join(', '))}</span>` : ''}</td><td class="n">${hm(s.wall)}</td><td class="n">${hm(s.test)}</td><td class="n">${hm(s.idle)}${s.gaps ? `<span class="eq">${s.gaps} gap${s.gaps > 1 ? 's' : ''}</span>` : ''}</td><td class="n" title="${esc(tokTitle(s.tokens))}">${tok(tokAll(s.tokens))}${s.wt != null ? `<span class="eq">wtd ${tok(s.wt)}</span>` : ''}</td>`;
  const sub = (label, s) => s ? row(label, '', s, 'sub') + estCells(s, false) + acctCells(s.fiveHour, s.weekly, s.approx) + '</tr>' : '';
  const span = s => `<span class="eq">${esc(s.from.slice(5, 16).replace('T', ' '))} → ${esc(s.to.slice(5, 16).replace('T', ' '))} UTC</span>`;
  const rounds = U.rounds || [];
  const body = rounds.map(r => r.phases.map(id => { const p = ps.find(x => x.id === id);
      return row(`<b>${esc(p.id)}</b> ${span(p.stats)}`, seatLabel(p.stats), p.stats) + estCells(p.stats) + acctCells(p.stats.fiveHour, p.stats.weekly, p.stats.approx) + '</tr>'
        + p.segments.map(s => sub(`<span title="${esc(s.name)}">${esc(s.id)}</span>`, s.stats)).join('') + sub('wrap-up', p.wrapUp); }).join('')
    + (r.phases.length > 1 ? row(`Round ${r.n} total <span class="eq">${esc(r.phases.join(' + '))}</span>`, seatLabel(r), r, 'tot round') + estCells(r) + acctCells(r.readings ? r.fiveHour : null, r.readings ? r.weekly : null, r.approx) + '</tr>' : '')).join('');
  const outside = U.outside5 || U.outsideW ? `<tr><td>Outside any run</td><td></td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n est">—</td><td class="n est">—</td>${acctCells(U.outside5, U.outsideW, U.approx)}</tr>` : '';
  document.getElementById('usage').innerHTML = `<thead><tr><th rowspan="2">Phase</th><th rowspan="2">Account</th><th class="n" rowspan="2">Wall</th><th class="n" rowspan="2">Test</th><th class="n" rowspan="2">Idle &gt;15 min</th><th class="n" rowspan="2">Claude tokens</th><th class="grp" colspan="2">Est. from token rate, % of 1× Pro</th><th class="grp acct" colspan="2">Account total (shared), % of 1× Pro</th></tr>
    <tr><th class="n" title="Weighted tokens × the calibrated rate">5-hour</th><th class="n" title="5-hour estimate × the weekly ÷ 5-hour ratio">Weekly (rough)</th><th class="n acct" title="Snapshot increments during the run's active time, including other users of the account">5-hour</th><th class="n acct" title="Snapshot increments during the run's active time, including other users of the account">Weekly</th></tr></thead><tbody>` +
    body + outside +
    (ps.length ? row('All runs', '', { ...z, wt: U.wt }, 'tot round') + estCells({ est5: U.est5, estW: U.estW, seats: [] }) + acctCells(U.snapshots ? U.fiveHour : null, U.snapshots ? U.weekly : null, U.approx) + '</tr>' : '') + '</tbody>';
  const L = U.latest, w = U.weights;
  const opm = t => t.messages ? t.output / t.messages : 0;
  const basisRound = C ? rounds.find(r => r.phases.includes(C.basis)) : null;
  const models = o => Object.keys(o || {}).join(', ') || '?';
  const outNotes = C && basisRound ? rounds.filter(r => r !== basisRound).map(r => {
    const per = r.phases.map(id => { const p = ps.find(x => x.id === id); return `${esc(id)} ${Math.round(opm(p.stats.tokens))}`; }).join(', ');
    const extra = C.rate != null ? Math.max(0, opm(basisRound.tokens) - opm(r.tokens)) * r.tokens.messages * w.output * C.rate : 0;
    return `<span><b>Output may be under-recorded.</b> Round ${r.n} transcripts record ${Math.round(opm(r.tokens))} output tokens per message (${per}; ${r.tokens.messages.toLocaleString('en-US')} messages) against ${Math.round(opm(basisRound.tokens))} in ${esc(C.basis)}. If round ${r.n}'s output was really nearer ${esc(C.basis)}'s, its estimate is too low: at ${Math.round(opm(basisRound.tokens))} per message it would be about ${Math.round(extra)} points higher (5-hour, 1× Pro).</span>`;
  }).join('') : '';
  const WB = C && C.weekBasis;
  document.getElementById('usage-notes').innerHTML = [
    C ? `<span><b>Est. from token rate (the main figure).</b> Calibration (<code>runs/usage-calibration.json</code>): ${esc(C.source || '?')} = ${C.fiveHourPct * (C.seat || 1)}% of a 1× Pro 5-hour window for ${esc(C.basis)}'s ${tok(C.basisWt)} weighted tokens, so the rate is ${C.rate != null ? (C.rate * 1e6).toFixed(2) : '?'}% per million weighted tokens. Each row = its weighted tokens × that rate (weights: input ${w.input}, cache write ${w.cacheWrite}, cache read ${w.cacheRead}, output ${w.output}); "= N% of a 6.25× seat" divides by the seat size of the account the row ran on.</span>`
      : `<span><b>No calibration.</b> Add <code>runs/usage-calibration.json</code> (<code>{ "basis": "P1", "fiveHourPct": 300, "seat": 1, "source": "…", "weekPerFiveHour": null }</code>) to show the token-rate estimate.</span>`,
    C ? `<span><b>Weekly is rough.</b> ${esc(C.basis)} has no weekly reading, so weekly = the 5-hour estimate × ${C.weekRatio != null ? C.weekRatio.toFixed(3) : '?'}${C.weekPerFiveHour != null ? ' (weekPerFiveHour in the calibration file)' : WB ? `, the weekly ÷ 5-hour ratio in the ${WB.seat}× seat's readings (weekly +${Math.round(WB.weekly)}% against 5-hour +${Math.round(WB.fiveHour)}% of 1× Pro, ${esc(WB.from.slice(5, 16).replace('T', ' '))} → ${esc(WB.to.slice(5, 16).replace('T', ' '))} UTC). Those readings include the other user's work and assume the seat's weekly limit scales like its 5-hour limit` : ' (no weekly readings to take a ratio from)'}.</span>` : '',
    C ? `<span><b>Assumes the same model and limits throughout:</b> the rate from ${esc(C.basis)} holds for every round only if the same model ran (transcripts: ${rounds.map(r => `round ${r.n} ${esc(models(r.models))}`).join('; ')}) and a Team seat's limits are 6.25× Pro.</span>` : '',
    outNotes,
    `<span><b>Account total (shared) is muted on purpose.</b> It is the account's snapshot increments while the run was active (a 100% stop = one full window). The round-2 account was used heavily by someone else on another machine during P23 and P4 (user, 2026-10-21); their use is invisible to these transcripts, so this figure is far above this run's own use. The earlier token-ratio share (this run's tokens ÷ all tokens on this Mac) was dropped for the same reason: its denominator could not see the other user.</span>`,
    `<span><b>Seat size per account.</b> Each usage snapshot stores its account's seat size (<code>proMultiplier</code>, <code>usage-log.ts --seat N</code>): Pro-% = plan-% × that value, so 625% = one full 5-hour window of a 6.25× Pro Team seat. A seat change marks an account switch and starts a new round; no window spans it.${U.seatAssumed ? ' Rows without a value inherit the previous row\'s (1 before any).' : ''} Plan % comes from ${U.snapshots} usage reading${U.snapshots === 1 ? '' : 's'}${U.markers ? ` and ${U.markers} account marker${U.markers === 1 ? '' : 's'}` : ''} (<code>runs/usage.jsonl</code>).</span>`,
    L ? `<span>Latest reading ${esc(L.at.slice(0, 16).replace('T', ' '))} UTC (${L.seat}× Pro seat): 5-hour ${L.fiveHourPct ?? '?'}%${L.fiveHourResetsAt ? ` (resets ${esc(L.fiveHourResetsAt.slice(0, 16).replace('T', ' '))})` : ''} · weekly ${L.weeklyPct ?? '?'}%${L.weeklyResetsAt ? ` (resets ${esc(L.weeklyResetsAt.slice(0, 16).replace('T', ' '))})` : ''} of the plan.</span>` : '',
    `<span>Time as <code>run-log.ts time</code> (activity points per run folder; test = gaps up to 15 min). Claude tokens = input + cache write + cache read + output from ${U.transcripts} transcripts of this project (sessions and subagents) inside each run's active spans; "wtd" = weighted. A phase row includes its wrap-up.</span>`
  ].join('');
}
function render() {
renderUsage();
const openSegs = new Set([...document.querySelectorAll('details.seg[open]')].map(d => d.id));
const all = DATA.phases.flatMap(p => p.skip || p.hold ? [] : p.segments.flatMap(s => s.cases));
const nowCase = DATA.phases.flatMap(p => p.skip || p.hold ? [] : p.segments.flatMap(s => s.cases.map(c => ({ ...c, seg: s.id })))).find(c => c.result === 'Not run');
const T = tally(all);
document.getElementById('meta').innerHTML = [
  ['Table', `${esc(DATA.feature)} · v${DATA.version} · ${DATA.totalCases} cases`],
  ['Build', esc(DATA.build)], ['In this round', `${all.length} cases`],
  ['Recorded', `${all.length - T['Not run']} / ${all.length}`], ['Next', nowCase ? `${esc(nowCase.id)} (${esc(nowCase.seg)})` : '—'],
  [LIVE ? 'Live · updated' : 'Generated', esc(DATA.generated)]
].map(([k, v]) => `<span>${k} <b class="num">${v}</b></span>`).join('');
document.getElementById('totalbar').innerHTML = bar(T);
document.getElementById('legend').innerHTML = RES.map(r => `<span><i style="background:${COLOR[r]}"></i>${r} <span class="num">${T[r]}</span></span>`).join('');
document.getElementById('phases').innerHTML = DATA.phases.map(p => {
  const cs = p.segments.flatMap(s => s.cases), t = tally(cs);
  const state = p.skip ? ['skip', 'Skipped this round'] : p.hold ? ['hold', 'Deferred'] : t['Not run'] === 0 ? ['done', 'Done'] : t['Not run'] < cs.length ? ['active', 'In progress'] : ['pending', 'Pending'];
  const segs = p.segments.map(s => {
    const st = tally(s.cases), left = st['Not run'];
    const ss = p.skip ? ['skip', 'Skipped'] : left === 0 ? ['done', 'Done'] : left < s.cases.length ? ['active', 'In progress'] : ['pending', 'Pending'];
    const rows = s.cases.map(c => `<tr><td class="id">${esc(c.id)}${c.origin ? ` <span class="eyebrow">${esc(c.origin)}</span>` : ''}${c.needs ? `<div class="eyebrow">needs ${esc(c.needs)}</div>` : ''}</td><td>${esc(c.section)}</td><td>${esc(c.action)}</td><td><span class="r ${esc(c.result.replace(' ', ''))}">${esc(c.result)}</span>${c.disp ? ` <span class="eyebrow">${esc(c.disp)}</span>` : ''}${c.actual ? `<div class="actual">${esc(c.actual)}${c.at ? ` <span class="eyebrow">${esc(c.at)}</span>` : ''}</div>` : ''}</td></tr>`).join('');
    return `<details class="seg" id="${esc(s.id)}"${openSegs.has(s.id) ? ' open' : ''}><summary><span class="seg-id">${esc(s.id)}</span><span class="seg-name">${esc(s.name)}${statLine(s.stats)}</span><span class="seg-count num">${s.cases.length - left}/${s.cases.length} recorded</span><span class="bar">${bar(st)}</span><span class="state ${ss[0]}">${ss[1]}</span></summary>
      <div class="cases"><table><thead><tr><th>Case</th><th>Section</th><th>Action</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
  }).join('');
  return `<section class="phase" aria-label="${esc(p.id)}"><div class="phase-head"><span class="phase-id">${esc(p.id)}</span><h2>${esc(p.name)} <span class="eyebrow num">${cs.length} cases · ${p.segments.length} segments</span></h2><span class="state ${state[0]}">${state[1]}</span>
    <div class="phase-note">${esc(p.skip || p.hold || p.note || '')}${p.runDir ? ` <code>${esc(p.runDir)}</code>` : ''}${statLine(p.stats)}</div></div>${segs}</section>`;
}).join('');
document.getElementById('cps').innerHTML = DATA.checkpoints.map(c => `<div><span class="t">${esc(c.time)} · next ${esc(c.next)}</span><br>${esc(c.text)}</div>`).join('') || '<div>No checkpoints yet.</div>';
document.getElementById('log').innerHTML = DATA.log.map(l => `<li>${esc(l)}</li>`).join('');
}
render();
/*LIVE*/
// Served by `plan-page.ts --serve`: pick up each recorded case without a reload.
if (LIVE) setInterval(async () => {
  try { const r = await fetch('data.json', { cache: 'no-store' }); if (r.ok) { DATA = await r.json(); render(); } } catch {}
}, 10000);
/*/LIVE*/
</script>
